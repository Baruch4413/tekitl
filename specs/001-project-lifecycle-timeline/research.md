# Research: Project Lifecycle and Activity Timeline

All NEEDS CLARIFICATION items were resolved during `/speckit-clarify` (see spec.md `## Clarifications`). This document records the technical decisions and the alternatives that were considered.

## R1. Adding `stage_transition` to the timeline event type enum

**Decision**: A new migration alters the existing `project_timeline_events.type` enum to include `stage_transition`. The Laravel side gains a new PHP enum `ProjectTimelineEventType` mirroring the database enum (existing 8 values + `stage_transition`).

**Rationale**: The current DB column is a tight `enum(...)` declared in the original migration. Adding a value via a column-level alter is the most conservative change and preserves the existing constraint. The PHP enum mirror keeps callers on a single source of truth.

**Alternatives considered**:
- **Reuse `status_update`** for stage transitions. Rejected — `status_update` is reserved for owner-authored progress notes; mixing semantics would muddy querying and rendering.
- **Use `milestone`**. Rejected for the same reason.
- **Convert column to a free `string`**. Rejected — loses DB-level integrity for no benefit; Laravel can validate via the PHP enum.

## R2. Coin event aggregation strategy

**Decision**: A synchronous query-before-insert path inside `ReactionObserver`. On `Reaction::created` where `type=Potenciar` and the parent `Post` has a `Project`:

1. Open a DB transaction.
2. Lock-fetch the most recent `coins_received` event for the project where `created_at >= now() - 1 hour`.
3. If found: increment `data.coins` by the reaction's coin amount; update `updated_at`. The original `created_at` is preserved as the window anchor.
4. If not found: insert a new row with `data: {coins: <amount>}`.
5. Commit.

**Rationale**: The 1-hour rolling window is committed in spec assumptions. Synchronous aggregation is simple, transactional, and avoids introducing a queue worker for a low-rate event. Row-level locking prevents the race where two concurrent reactions each create their own row instead of merging.

**Alternatives considered**:
- **Job-queue debounce**: enqueue a job per reaction with a 1-hour delay; the last job in the window writes the entry. Rejected — adds infrastructure and delays visible feedback.
- **Periodic compaction**: a scheduled job that merges adjacent rows nightly. Rejected — produces transient noise during the day and complicates display.
- **Per-reaction rows with UI-side dedup**: simpler write path, but requires the API layer to assemble aggregate views — pushes complexity into multiple consumers.

## R3. Observer registration

**Decision**: Register all four observers in `AppServiceProvider::boot()`.

**Rationale**: The project does not yet have observers, but `AppServiceProvider::boot()` is the canonical Laravel hook and avoids creating a new service provider for four lines.

**Alternatives considered**:
- **Dedicated `EventServiceProvider`**: appropriate when the project already has many observers/listeners; overkill for four observers in v1.
- **Model-attribute attribute (`#[ObservedBy(...)]`)**: viable in Laravel 12, but the project does not yet use attribute-based observers; introducing a new convention here is a Constitution III nudge ("convention over custom" — match what's already there).

## R4. Inertia data shape for paginated timeline

**Decision**: The Inertia response for `/proyectos/{post}` includes a `timeline` prop with the first 20 entries plus `nextCursor` (cursor based on `created_at`). Subsequent pages are fetched via `GET /proyectos/{project}/timeline?cursor=<...>` returning a JSON page (Inertia's `useDeferredProps`/standard fetch is appropriate here since the existing `PostComments` component already uses a fetch-based pagination model on the same page).

**Rationale**: Mirrors the comments pattern already on this page (lazy-load via fetch). Cursor-based avoids skipping/duplicating entries when new events land mid-scroll.

**Alternatives considered**:
- **Offset pagination**: simpler, but vulnerable to skipping/duplication and harder to cache.
- **Inertia `WhenVisible` infinite scroll**: would require a partial-reload variant of the show route; cleaner UX but heavier integration. Worth considering after v1.

## R5. Authorization mechanism

**Decision**: Introduce `ProjectPolicy` with `transition`, `postMilestone`, and `postStatusUpdate` abilities. Register it via `app/Providers/AuthServiceProvider.php` (or `bootstrap/app.php` provider list — match what already exists). Each new controller calls `Gate::authorize('transition', $project)` (or equivalent) before mutating state. Per Q1 of clarifications, the policy returns true only when `$user->id === $project->user_id`.

**Rationale**: Policies are the Laravel-native mechanism (Constitution III). They centralize the owner check, keep the controllers thin, and let tests assert authorization independently of routing.

**Alternatives considered**:
- **Inline `abort_unless` in controllers** (existing convention in `ProjectController::deleteImage`). Rejected — duplicates logic across the new endpoints; policy gives a single source of truth.
- **Spatie permissions**: trait is loaded on `User` but unused. Q1 explicitly excludes admin override in v1; introducing role checks here would expand authorization scope without justification.

## R6. Confirmation UX for terminal transitions

**Decision**: Reuse `components/ui/dialog` (already used by `ApplicantReviewModal` in `ProjectRoles.tsx`). The terminal-confirmation dialog summarizes consequences and uses two buttons (`Cancel` / `Confirmar y completar` or `Confirmar y abortar`).

**Rationale**: Existing dialog is accessible (focus trap, ARIA), Tailwind-themed, and used elsewhere on this page — keeps visual + interaction consistency.

**Alternatives considered**:
- **`window.confirm`**: not themed, not localized, breaks design.
- **Inline expanding button**: novel UX with poorer affordance for an irreversible action.

## R7. Stage badge placement and copy

**Decision**: Render `ProjectStageBadge` inline next to the project title inside `ProjectHeader.tsx`, right of the title. Copy uses the Spanish labels from `ProjectStage::label()` ("Planificación", "En ejecución", "Completado", "Abortado"). Each stage gets a distinct color (planning = gray, in_execution = indigo/blue, completed = green, aborted = red) consistent with the Tailwind palette already used for status pills on this page.

**Rationale**: Matches the page's existing visual language; a header-adjacent badge has the strongest discoverability and is consistent with how status is shown elsewhere in the codebase (e.g., the amber "pending application" pill).

**Alternatives considered**:
- **Sticky banner above the page**: too prominent for non-terminal stages; reserves visual budget needed for the title.
- **Footer near comments**: too easy to miss.

## R8. Timeline placement on the page

**Decision**: Insert `<ProjectTimeline>` between `<ProjectTeam>` and `<PostComments>` (i.e., after the team section, before comments). The owner-only composer `<ProjectTimelinePostUpdate>` renders as the first child of the timeline section when `isOwner` is true.

**Rationale**: The team section closes the "who and what" of the project. The timeline answers "what's happened lately?" and naturally precedes the discussion (comments). This ordering mirrors common project-update patterns (status update → discussion).

**Alternatives considered**:
- **Above team / below header**: pushes long event histories above structurally important info.
- **Replace comments with timeline**: rejected — comments and timeline are different surfaces (discussion vs record), per spec assumption.

## R10. Auto-rejection write strategy (bulk vs iterate)

**Decision**: `ProjectStageController::store`, on a terminal transition, iterates the pending `ProjectVolunteer` rows for the project and calls `$volunteer->update(['status' => 'bailed'])` per row inside the surrounding DB transaction.

**Rationale**: Eloquent's query-builder `update()` writes directly via SQL and does not fire model events (`updating`/`updated`). Iterate-and-save is the canonical Laravel idiom when you need observers to run; it is also the same pattern the existing `ProjectVolunteerController::update()` uses for individual status changes, so it slots into the same observer branch (`pending` → `bailed` with no actor → `auto_rejected_terminal_stage`). With expected pending-application counts in single digits per project, the per-row cost is negligible.

**Alternatives considered**:
- **Bulk `Builder::update()` then manual event insert in the controller**: rejected — splits the timeline-write logic between the observer and the controller, which is exactly the consolidation the observer is meant to provide. Also re-introduces a divergent code path that future contributors would have to remember.
- **Database trigger to insert the timeline row**: rejected — pulls business logic into the schema, violates Constitution III (Laravel-native, convention over custom), and bypasses the actor/source-of-truth audit trail that goes through PHP.

## R9. Test strategy specifics

**Decision**:
- All FRs are covered by Pest **feature** tests (`tests/Feature/Project/*`); the Eloquent observer behavior is testable end-to-end through the existing controllers.
- The coin-aggregation logic gets a dedicated **unit** test that exercises the observer directly with `Carbon::setTestNow()` to simulate windows.
- The terminal-confirmation flow gets a **browser** test (Pest 4 browser plugin) since the dialog interaction can't be exercised at the HTTP layer.

**Rationale**: Constitution II requires tests-first; this distribution gives broad coverage at the feature level (where regressions show up) plus targeted unit/browser coverage for non-trivial logic.
