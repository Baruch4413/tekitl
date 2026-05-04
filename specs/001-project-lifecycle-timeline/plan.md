# Implementation Plan: Project Lifecycle and Activity Timeline

**Branch**: `001-project-lifecycle-timeline` | **Date**: 2026-05-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-project-lifecycle-timeline/spec.md`

## Summary

Surface the existing `Project` lifecycle (`ProjectStage` state machine: planning → in_execution → completed | aborted) on the `/proyectos/{post}` detail page, expose owner-only transition controls with a confirmation gate for terminal stages, and render a chronological activity timeline driven by the existing `project_timeline_events` table. Automatic events are produced via Eloquent model observers; owner-authored milestones and status updates use the same timeline. Volunteer applications are gated to non-terminal stages, with pending applications auto-rejected on terminal transitions. Server-side aggregation collapses successive coin-receipt events into a rolling 1-hour entry. No schema changes are required beyond a single migration to add `stage_transition` to the `project_timeline_events.type` enum.

## Technical Context

**Language/Version**: PHP 8.5; TypeScript via React 19 / Inertia v2
**Primary Dependencies**: Laravel 12, Inertia.js v2, React 19, Wayfinder, Pest 4, Tailwind v4, Spatie\Permission (already loaded on `User`, unused for this feature), Sonner (toasts), Heroicons
**Storage**: Project's existing relational database (Laravel default driver). S3 disk for images (unaffected by this feature).
**Testing**: Pest 4 — feature tests via `php artisan test --compact`; browser tests via Pest 4 browser plugin where required (terminal-transition confirmation dialog).
**Target Platform**: Web (Laravel server-rendered Inertia SPA shell; React client). Modern evergreen browsers + dark mode parity.
**Project Type**: Laravel monolith with Inertia/React frontend (single repository).
**Performance Goals**: First 20 timeline entries rendered in initial Inertia response; older entries fetched on demand within 1s (SC-005). Render-time regression for 100 events ≤100ms vs zero events (SC-004).
**Constraints**: No new external services. No notifications (out of scope). No new authorization layer beyond owner check (per Q1 of clarifications). No edits/deletes for manual entries.
**Scale/Scope**: Per-project event volume expected in low-thousands over project lifetime; coin aggregation keeps rate-driven flooding bounded.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Community-First Design | PASS | Feature is collaboration-shaped (transparent project history, owner-driven communication). No engagement-extraction patterns. |
| II. Test-First (NON-NEGOTIABLE) | PASS | Pest feature tests will be authored and demonstrated failing before each FR's implementation; observer behavior covered by unit/feature tests. |
| III. Laravel-Native, Convention Over Custom | PASS | Eloquent model events/observers for automatic timeline; Form Requests for transition + manual entry validation; named routes; policies for owner gate. No `DB::` raw, no `env()` outside config, no custom routing. |
| IV. Typed End-to-End | PASS | New routes consumed via Wayfinder; new React components typed; Inertia props extend the existing typed `ProyectoShowProps`. |
| V. Accessibility & Privacy by Default | PASS | Stage badge has accessible label; confirmation dialog uses existing `Dialog` component (focus-trap, ARIA wired). No new PII collection — timeline data is derived from public on-page actions. |

**Result**: PASS, no Complexity Tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-lifecycle-timeline/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── http-endpoints.md  # New HTTP endpoints introduced by this feature
└── tasks.md             # Phase 2 output (created by /speckit-tasks)
```

### Source Code (repository root)

```text
app/
├── Http/
│   ├── Controllers/
│   │   ├── ProjectController.php                  # Existing — show() augmented to load + paginate timeline events
│   │   ├── ProjectStageController.php             # NEW — single transition endpoint (POST)
│   │   └── ProjectTimelineController.php          # NEW — index (paginated entries) + store (milestone | status_update)
│   └── Requests/
│       ├── TransitionProjectStageRequest.php      # NEW — validates target stage + ownership
│       ├── StoreProjectMilestoneRequest.php       # NEW — title (max 120)
│       └── StoreProjectStatusUpdateRequest.php    # NEW — body (max 2000)
├── Models/
│   ├── Project.php                                # Existing — scope helpers for paginated timeline
│   └── ProjectTimelineEvent.php                   # Existing — fillable extended; query scopes added
├── Observers/
│   ├── ProjectRoleObserver.php                    # NEW — role_created
│   ├── ProjectVolunteerObserver.php               # NEW — volunteer_joined / _bailed / _exhausted
│   ├── ProjectImageObserver.php                   # NEW — photo_uploaded
│   └── ReactionObserver.php                       # NEW — coins_received (rolling 1-hour aggregation, scoped to Potenciar reactions on Posts that have a Project)
├── Policies/
│   └── ProjectPolicy.php                          # NEW — `transition`, `postUpdate` (owner-only per Q1)
├── ProjectStage.php                               # Existing enum — no change
└── ProjectTimelineEventType.php                   # NEW PHP enum mirroring DB enum (incl. new `stage_transition`)

database/
├── migrations/
│   └── 2026_05_04_000000_add_stage_transition_to_project_timeline_events_type.php  # NEW
└── factories/
    ├── ProjectFactory.php                         # Existing — extended with stage states
    └── ProjectTimelineEventFactory.php            # Existing — states match enum

resources/js/
├── pages/proyectos/show.tsx                       # Existing — accept new props (stage, timeline page), wire new components
├── components/ui/proyectos/
│   ├── ProjectStageBadge.tsx                      # NEW — visible label
│   ├── ProjectStageActions.tsx                    # NEW — owner buttons + terminal confirmation Dialog
│   ├── ProjectTimeline.tsx                        # NEW — paginated list of entries
│   ├── ProjectTimelineEntry.tsx                   # NEW — variant rendering per type
│   └── ProjectTimelinePostUpdate.tsx              # NEW — owner-only composer (milestone | status update)
└── routes/...                                     # Wayfinder-generated — auto-updated by `npm run dev`

routes/
└── web.php                                        # Existing — append: stage transition POST, timeline GET/POST

tests/
├── Feature/Project/
│   ├── ProjectStageTransitionTest.php             # NEW — covers FR-001..005a, FR-023..026
│   ├── ProjectTimelineDisplayTest.php             # NEW — covers FR-012..017
│   ├── ProjectTimelineAutomaticEventsTest.php     # NEW — covers FR-006..011
│   ├── ProjectTimelineManualEntriesTest.php       # NEW — covers FR-018..022
│   └── ProjectTimelineAuthorizationTest.php       # NEW — covers FR-027 (no admin override)
└── Unit/
    └── CoinReactionAggregationTest.php            # NEW — covers rolling 1-hour aggregation
```

**Structure Decision**: Single Laravel monolith repository (existing). All new files land under existing top-level paths (`app/`, `resources/js/`, `tests/`, `database/`, `routes/`). No new service tier, package, or frontend bundle is introduced — consistent with Constitution III (Laravel-native, convention over custom).

## Integration with Existing Code

A pre-implementation read of the touched files surfaced the following integration realities. They are recorded here so that planned tasks remain truthful and merge cleanly.

### Files we extend (no rewrites)

| File | Surface area touched |
|------|----------------------|
| `app/Http/Controllers/ProjectController.php::show()` | Append 4 Inertia props (`stage`, `stageLabel`, `allowedTransitions`, `timeline`). Extend the existing `$project->load([...])` eager-load chain with `timelineEvents` (descending, limit 20, with actor). All existing props preserved. |
| `app/Http/Controllers/ProjectVolunteerController.php::store()` | Prepend a single `abort_if(...)` stage gate. The existing `$role->volunteers()->create([...])` call is unchanged. |
| `app/Providers/AppServiceProvider.php::boot()` | Add 4 `Model::observe(...)` lines next to the existing `User::observe(UserObserver::class)`. The pattern is already established. |
| `app/Models/ProjectTimelineEvent.php` | Add `type => ProjectTimelineEventType::class` cast. Existing `data => 'array'` cast and `$fillable` are sufficient. |
| `routes/web.php` | Append 4 named routes in the existing flat style (no resource controllers, no groups). |
| `resources/js/pages/proyectos/show.tsx` | Extend `ProyectoShowProps`; render `<ProjectStageActions>` near the header and `<ProjectTimeline>` between `<ProjectTeam>` and the comments block. |
| `resources/js/components/ui/proyectos/ProjectHeader.tsx` | Insert `<ProjectStageBadge>` next to the title; accept new `stage` + `stageLabel` props. |
| `resources/js/components/ui/proyectos/ProjectRoles.tsx` | Hide the "Postularme" affordance when `project.stage` is not in `{planning, in_execution}`. Accept new `projectStage` prop. |

### Patterns reused (zero new infrastructure)

- **Inline pagination via `fetch()`** — `show.tsx` already lazy-loads comments via `await fetch(fetchComments.url(project.id))`. `ProjectTimeline.tsx` adopts the same pattern with a `cursor` query param.
- **Inertia redirect (`back()`) for writes** — every existing project mutation returns `back()`; new endpoints follow.
- **Inline `abort_unless` for ownership-style guards** — `ProjectController::deleteImage` uses this idiom; the volunteer-store stage gate (FR-023) mirrors it. Stage transition + manual-entry endpoints use a Policy instead because the check is shared across three actions and a Policy centralizes it.
- **Observer registration** — `User::observe(UserObserver::class)` in `AppServiceProvider::boot()` is the precedent.

### Integration constraints discovered

These shape specific tasks and are flagged in `tasks.md` at the relevant task IDs.

1. **Eloquent bulk `update()` bypasses model events.** `Builder::update()` writes directly via SQL and does NOT fire `updating`/`updated`. The auto-rejection of pending applications on a terminal stage transition (FR-025) MUST therefore iterate the affected `ProjectVolunteer` rows and call `$volunteer->save()` per row inside the same DB transaction so that `ProjectVolunteerObserver` emits the `volunteer_bailed { reason: auto_rejected_terminal_stage }` events. (Captured in T046.)

2. **`Project` is lazily created** by `ProjectController::show()` on the project owner's first visit (`if (! $project) { Project::query()->create([...]) }`). Tests that drive the stage-transition controller against a fresh `Post` MUST either hit the show route first or seed the `Project` directly via `Project::factory()->for($post)->create()`. (Captured in T010 setup notes.)

3. **`Project` models will gain observers for the first time.** Seeders, factories, and tests that create roles/volunteers/images/reactions in bulk will start emitting timeline events as a side effect. We accept this as the desired behavior (it produces realistic seed data) but flag it in T027's checkpoint so seed runs and CI test runs are inspected for unexpected event volumes.

4. **Mixed route-model binding within `/proyectos/{...}`.** The show route binds `{post}` (Post model — `/proyectos/{post}`); every other project route binds `{project}` (`/proyectos/{project}/...`). The four new routes follow the existing `{project}` convention to stay consistent with `proyectos.update`, `proyectos.images.*`, `proyectos.roles.*`, `proyectos.volunteers.*`. No change in pattern; recorded for clarity.

5. **`Project::transitionTo()` throws `InvalidArgumentException` on illegal moves.** `TransitionProjectStageRequest` validates `to` against `ProjectStage::canTransitionTo()` first, so the throw is unreachable in normal flow. The controller does NOT need a try/catch; the validation rule is the user-facing failure path (422 with FR-004 copy).

## Phase 0 — Research Notes

See [research.md](./research.md) for technical decisions:

- Where to add `stage_transition` to the timeline event type enum (decision: schema migration to ALTER the `enum`).
- Coin aggregation strategy (decision: synchronous query-before-insert in observer with explicit DB transaction; 1-hour rolling window per project).
- Where to register observers (decision: in `AppServiceProvider::boot()` per project convention).
- Inertia data shape for paginated timeline (decision: server returns first 20 + a `nextCursor`; deferred prop pattern via Inertia v2 for subsequent fetches).
- Authorization mechanism (decision: `ProjectPolicy` registered to the `Project` model; `Gate::authorize('transition', $project)` in controllers).
- Confirmation UX (decision: reuse existing `Dialog` component from `components/ui/dialog`).

## Phase 1 — Design Artifacts

- [data-model.md](./data-model.md) — entities, attributes, relationships, state diagrams
- [contracts/http-endpoints.md](./contracts/http-endpoints.md) — request/response shapes for new endpoints
- [quickstart.md](./quickstart.md) — manual smoke-test flow once feature lands

### Constitution Re-check (post-design)

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Community-First | PASS | No new engagement mechanics; manual entries are owner-authored communication, not algorithmic ranking. |
| II. Test-First | PASS | Each FR mapped to a Pest test file in the structure above; tests authored before observers/controllers. |
| III. Laravel-Native | PASS | Observers + policies + Form Requests + Eloquent. Single migration to extend existing enum. No `DB::` raw. |
| IV. Typed End-to-End | PASS | New endpoints generate Wayfinder bindings on the next `npm run dev` build; React components are TS-typed. |
| V. A11y & Privacy | PASS | Stage badge: visible label with `aria-label`. Terminal confirmation: existing accessible Dialog. Timeline entries: semantic list. No PII added. |

No deviations recorded. Complexity Tracking remains empty.

## Complexity Tracking

> No constitutional violations identified; this section is intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| _(none)_  | _(n/a)_    | _(n/a)_ |
