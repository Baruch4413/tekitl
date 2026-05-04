# Data Model: Project Lifecycle and Activity Timeline

This feature operates almost entirely on existing tables. The single schema change is an enum extension on `project_timeline_events.type`.

## Entities

### Project (existing — no schema change)

| Column | Type | Notes |
|--------|------|-------|
| id | bigint, PK | |
| post_id | bigint, FK posts.id, unique | 1:1 with Post |
| user_id | bigint, FK users.id | Owner |
| title | string, nullable | |
| description | text, nullable | |
| goal | unsignedBigInteger, default 100 | Unused by this feature |
| stage | string, default 'planning' | **Authoritative for this feature**; cast to `ProjectStage` enum |
| created_at, updated_at | timestamps | |

**State machine** (already implemented on `App\ProjectStage`):

```text
              ┌──────────────────────────────┐
              ▼                              │
        ┌──────────┐    start    ┌────────────────┐    complete    ┌───────────┐
        │ planning │ ──────────▶ │  in_execution  │ ─────────────▶ │ completed │
        └──────────┘             └────────────────┘                └───────────┘
              │                          │
              │ abort                    │ abort
              ▼                          ▼
                       ┌─────────┐
                       │ aborted │
                       └─────────┘
```

`completed` and `aborted` are terminal (no outgoing transitions). The full transition table is encoded in `ProjectStage::allowedTransitions()`.

### ProjectTimelineEvent (existing — type enum extended)

| Column | Type | Notes |
|--------|------|-------|
| id | bigint, PK | |
| project_id | bigint, FK projects.id, indexed `(project_id, created_at)` | |
| user_id | bigint, FK users.id, nullable on delete | Actor (null for system-driven events such as aggregated coin receipts after donor deletion) |
| **type** | enum | **Migration extends to add `stage_transition`** (existing values retained: role_created, volunteer_joined, volunteer_bailed, volunteer_exhausted, milestone, status_update, photo_uploaded, coins_received) |
| data | json, nullable | Per-type structured payload (see below) |
| created_at, updated_at | timestamps | `created_at` is the chronological anchor |

**Per-type `data` payload** (canonical shapes; missing fields tolerated for forward compatibility):

| type | `data` shape | Created by |
|------|--------------|------------|
| `role_created` | `{ role_id: int, role_title: string }` | `ProjectRoleObserver::created` |
| `volunteer_joined` | `{ role_id: int, role_title: string, volunteer_id: int, volunteer_user_id: int, volunteer_name: string }` | `ProjectVolunteerObserver::updated` (status: `pending` → `active`) |
| `volunteer_bailed` | `{ role_id: int, role_title: string, volunteer_id: int, volunteer_user_id: int, volunteer_name: string, reason: 'owner_removed' \| 'auto_rejected_terminal_stage' }` | `ProjectVolunteerObserver::updated` (status → `bailed`) |
| `volunteer_exhausted` | `{ role_id: int, role_title: string, volunteer_id: int, volunteer_user_id: int, volunteer_name: string }` | `ProjectVolunteerObserver::updated` (status → `exhausted`) |
| `photo_uploaded` | `{ image_id: int }` | `ProjectImageObserver::created` |
| `coins_received` | `{ coins: int, window_started_at: ISO8601 }` | `ReactionObserver::created` (rolling 1-hour aggregation; `coins` is the cumulative window total) |
| `stage_transition` | `{ from: 'planning' \| 'in_execution' \| 'completed' \| 'aborted', to: 'planning' \| 'in_execution' \| 'completed' \| 'aborted' }` | `ProjectStageController::store` (after a successful `Project::transitionTo()`) |
| `milestone` | `{ title: string }` (max 120 chars) | `ProjectTimelineController::store` |
| `status_update` | `{ body: string }` (max 2000 chars) | `ProjectTimelineController::store` |

### Project (existing relations relevant here)

- `Project::timelineEvents()` — `hasMany(ProjectTimelineEvent::class)->orderBy('created_at')` (already present); reading code will use a descending scope for display.
- `Project::user()`, `Project::post()`, `Project::roles()`, `Project::images()` — existing, no change.

### ProjectVolunteer (existing — no schema change)

Status enum (`pending` | `active` | `exhausted` | `bailed`) is unchanged. The observer reacts to status transitions:

| Old → New | Timeline event recorded |
|-----------|--------------------------|
| `pending` → `active` | `volunteer_joined` |
| `active` → `bailed` | `volunteer_bailed` (`reason: owner_removed`) |
| `pending` → `bailed` (auto on terminal stage transition) | `volunteer_bailed` (`reason: auto_rejected_terminal_stage`) |
| `active` → `exhausted` | `volunteer_exhausted` |
| `pending` → cancelled by self (delete row) | _no timeline event_ (per FR-011) |

### Reaction (existing — no schema change)

The `ReactionObserver` listens to `Reaction::created` and filters: `type === ReactionType::Potenciar` AND the parent `Post` has a `Project`. Then performs the rolling-window aggregation described in research.md R2.

## Migration

A single migration file: `database/migrations/2026_05_04_000000_add_stage_transition_to_project_timeline_events_type.php`. It uses a raw `DB::statement('ALTER TABLE project_timeline_events MODIFY type ENUM(...)')` (the only allowed `DB::` use is for schema operations not expressible in the schema builder, which is the case for MySQL enum modification — Constitution III explicitly permits framework-native escape hatches when necessary). The `down()` reverses the enum back to the original 8 values.

**Operational note**: The migration is additive (new enum value). No data backfill is required: pre-existing rows are unaffected and no historical events of the new type exist.

## Validation Rules (cross-references to FRs)

- `Project.stage` transitions: enforced server-side via `ProjectStage::canTransitionTo()` (FR-003, FR-004).
- Manual milestone title: max 120 chars (FR-019).
- Manual status update body: max 2000 chars (FR-020).
- Volunteer application gate: `ProjectVolunteerController::store` must reject when `Project.stage` is not in `{planning, in_execution}` (FR-023).
- Pending application auto-rejection: triggered inside `ProjectStageController::store` after a successful transition to a terminal stage, within the same DB transaction (FR-025). **Implementation constraint**: Eloquent `Builder::update()` bypasses model events, so the controller MUST iterate the pending `ProjectVolunteer` rows and call `$volunteer->save()` (or `update([...])` on each instance) one at a time so that `ProjectVolunteerObserver` fires per row and emits the `volunteer_bailed { reason: auto_rejected_terminal_stage }` events.

## Read Model: Inertia Props (additions to `proyectos/show`)

```text
project: {
  // ... existing fields
  stage: 'planning' | 'in_execution' | 'completed' | 'aborted'
  stageLabel: string  // Localized (Spanish), from ProjectStage::label()
  allowedTransitions: Array<{ to: string, label: string, isTerminal: boolean }>  // [] for non-owners and terminal stages
}

timeline: {
  entries: Array<TimelineEntry>  // First 20, descending by created_at
  nextCursor: string | null      // ISO8601 of oldest entry in this page, or null when exhausted
}

// TimelineEntry shape:
{
  id: number
  type: ProjectTimelineEventType    // string literal union
  createdAt: string                 // ISO8601
  date: string                      // human-readable "hace 2 horas"
  actor: { id: number, name: string, avatarUrl: string | null } | null
  data: Record<string, unknown>     // Type-narrowed per-type by the React component
}
```

## Out of Scope (data-model)

- Notification/subscription tables.
- Comment-to-timeline merging.
- Multi-project activity rollups.
- Edits/deletes on manual entries.
