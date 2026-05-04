# HTTP Contracts: Project Lifecycle and Activity Timeline

All endpoints are registered in `routes/web.php`, served by Inertia/Laravel, and consumed by the React frontend through Wayfinder-generated bindings under `@/actions/...`.

## Conventions

- All write operations (`POST`, `PATCH`) require `auth` middleware.
- Authorization is performed by `ProjectPolicy` via `Gate::authorize(...)` inside the controller (or a Form Request `authorize()` method); failure returns HTTP 403.
- Validation is performed by Form Request classes; failure returns HTTP 422 with Laravel's standard validation error envelope.
- All write endpoints return a redirect (`back()`) or Inertia redirect — they do not return JSON, in keeping with the existing project conventions on `/proyectos/{post}` mutations.
- Read endpoints used by the timeline pagination return JSON, mirroring the existing `GET /proyectos/{project}/comments` pattern.

## 1. Transition project stage

```text
POST /proyectos/{project}/stage
```

- **Route name**: `proyectos.stage.store`
- **Controller**: `ProjectStageController@store`
- **Middleware**: `auth`
- **Authorization**: `ProjectPolicy@transition` — owner only (per FR-027).

### Request

```json
{
  "to": "in_execution"
}
```

| Field | Type | Constraints |
|-------|------|-------------|
| `to` | string | Required. Must be a value in `ProjectStage::values()`. |

### Validation rules (Form Request)

- `to` must be a legal target of the current stage per `ProjectStage::canTransitionTo()`. Otherwise: 422 with message "Esta transición no está permitida desde el estado actual." (or equivalent).
- Implicit: target stage must not equal current stage (no-op forbidden).

### Behavior

1. Authorization check → 403 on failure.
2. Validation → 422 on failure.
3. Within a single DB transaction:
   - `Project::transitionTo($to)` — persists the new stage.
   - Insert `ProjectTimelineEvent { type: 'stage_transition', user_id: <actor>, data: { from, to } }`.
   - If `to ∈ {completed, aborted}`: bulk-update all `ProjectVolunteer` rows where `project_role.project_id = $project->id AND status = 'pending'` to `status = 'bailed'`. For each, insert `ProjectTimelineEvent { type: 'volunteer_bailed', user_id: null, data: {…, reason: 'auto_rejected_terminal_stage'} }`.
4. Return `back()` (Inertia redirect).

### Errors

| Status | Cause |
|--------|-------|
| 401 | Unauthenticated. |
| 403 | Authenticated but not owner. |
| 422 | Invalid `to`, or transition not allowed. |

## 2. List project timeline (paginated)

```text
GET /proyectos/{project}/timeline?cursor=<iso8601-or-null>
```

- **Route name**: `proyectos.timeline.index`
- **Controller**: `ProjectTimelineController@index`
- **Middleware**: _(none — public read)_
- **Authorization**: none — timeline is public per FR-012.

### Query parameters

| Param | Type | Notes |
|-------|------|-------|
| `cursor` | ISO8601 timestamp | Optional. When omitted, returns the most recent page. |
| `limit` | int | Optional. Default 20. Max 50. |

### Response

```json
{
  "entries": [
    {
      "id": 482,
      "type": "volunteer_joined",
      "createdAt": "2026-04-30T14:22:09Z",
      "date": "hace 2 días",
      "actor": { "id": 7, "name": "María", "avatarUrl": "..." },
      "data": {
        "role_id": 11,
        "role_title": "Coordinador de logística",
        "volunteer_id": 33,
        "volunteer_user_id": 91,
        "volunteer_name": "Juan"
      }
    }
  ],
  "nextCursor": "2026-04-15T08:11:00Z"
}
```

- `entries` is ordered descending by `created_at`.
- `nextCursor` is `null` when no older entries remain.

## 3. Post a milestone

```text
POST /proyectos/{project}/timeline/milestones
```

- **Route name**: `proyectos.timeline.milestones.store`
- **Controller**: `ProjectTimelineController@storeMilestone`
- **Middleware**: `auth`
- **Authorization**: `ProjectPolicy@postMilestone` — owner only.

### Request

```json
{
  "title": "Recibimos la donación inicial"
}
```

| Field | Type | Constraints |
|-------|------|-------------|
| `title` | string | Required. 1–120 characters. Trimmed. |

### Behavior

Insert `ProjectTimelineEvent { type: 'milestone', user_id: <actor>, data: { title } }`. Return `back()`.

### Errors

| Status | Cause |
|--------|-------|
| 401 | Unauthenticated. |
| 403 | Not owner. |
| 422 | Missing title or > 120 chars. |

## 4. Post a status update

```text
POST /proyectos/{project}/timeline/status-updates
```

- **Route name**: `proyectos.timeline.status-updates.store`
- **Controller**: `ProjectTimelineController@storeStatusUpdate`
- **Middleware**: `auth`
- **Authorization**: `ProjectPolicy@postStatusUpdate` — owner only.

### Request

```json
{
  "body": "Esta semana tramitamos los permisos…"
}
```

| Field | Type | Constraints |
|-------|------|-------------|
| `body` | string | Required. 1–2000 characters. Trimmed. |

### Behavior

Insert `ProjectTimelineEvent { type: 'status_update', user_id: <actor>, data: { body } }`. Return `back()`.

### Errors

| Status | Cause |
|--------|-------|
| 401 | Unauthenticated. |
| 403 | Not owner. |
| 422 | Missing body or > 2000 chars. |

## 5. Modifications to existing endpoints

### `GET /proyectos/{post}` — `ProjectController@show`

The Inertia response gains the `stage`, `stageLabel`, `allowedTransitions`, and `timeline` props described in `data-model.md`. No URL or method change.

### `POST /proyectos/{project}/roles/{role}/volunteers` — `ProjectVolunteerController@store`

Adds a stage gate at the top:

```text
abort_if(! in_array($project->stage, [ProjectStage::Planning, ProjectStage::InExecution], true), 403, 'No se aceptan postulaciones en este momento.')
```

(per FR-023). No request/response schema changes.

## Wayfinder bindings

The following frontend imports become available after the next `npm run dev`/build:

```ts
import { store as transitionStage } from '@/actions/App/Http/Controllers/ProjectStageController'
import {
  index as fetchTimeline,
  storeMilestone,
  storeStatusUpdate,
} from '@/actions/App/Http/Controllers/ProjectTimelineController'
```

Per Constitution IV, frontend code MUST consume these via Wayfinder rather than constructing URL strings.
