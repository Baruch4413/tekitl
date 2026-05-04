---
description: "Task list for Project Lifecycle and Activity Timeline"
---

# Tasks: Project Lifecycle and Activity Timeline

**Input**: Design documents from `/specs/001-project-lifecycle-timeline/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/http-endpoints.md`

**Tests**: REQUIRED. The constitution mandates Test-First (Principle II, NON-NEGOTIABLE). Pest feature tests are authored and demonstrated failing before each FR's implementation. The plan also explicitly maps each FR to a Pest test file.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- File paths are absolute or repository-root-relative

## Path Conventions

Paths are repository-relative under `/var/www/html/tekitl/`. Single Laravel monolith with Inertia/React frontend.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Schema and PHP enum changes that everything else depends on.

- [X] T001 Create migration `database/migrations/2026_05_04_000000_add_stage_transition_to_project_timeline_events_type.php` that runs `DB::statement('ALTER TABLE project_timeline_events MODIFY type ENUM(\'role_created\', \'volunteer_joined\', \'volunteer_bailed\', \'volunteer_exhausted\', \'milestone\', \'status_update\', \'photo_uploaded\', \'coins_received\', \'stage_transition\') NOT NULL')` in `up()` and reverses to the original eight values in `down()`.
- [X] T002 [P] Create `app/ProjectTimelineEventType.php` PHP backed enum (string) mirroring the DB enum: `RoleCreated`, `VolunteerJoined`, `VolunteerBailed`, `VolunteerExhausted`, `Milestone`, `StatusUpdate`, `PhotoUploaded`, `CoinsReceived`, `StageTransition`.
- [X] T003 [P] Update `app/Models/ProjectTimelineEvent.php` to cast `type => ProjectTimelineEventType::class`, ensure `data` is cast to `array`, and extend `$fillable` to include `project_id`, `user_id`, `type`, `data` if not already present.
- [X] T004 [P] Update `database/factories/ProjectTimelineEventFactory.php` to add states for each `ProjectTimelineEventType` value (including `stageTransition()`).
- [X] T005 Run the migration locally (`php artisan migrate`) and verify enum modification persists; do not commit anything yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Authorization scaffolding and observer registration plumbing that every user story relies on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 Create `app/Policies/ProjectPolicy.php` with three abilities — `transition(User $user, Project $project)`, `postMilestone(User $user, Project $project)`, `postStatusUpdate(User $user, Project $project)` — each returning `$user->id === $project->user_id` (per FR-027 and Q1 of clarifications). No platform-admin override.
- [X] T007 Register `ProjectPolicy` for the `Project` model in `app/Providers/AppServiceProvider.php` (or the existing auth provider used by the project — match existing convention) inside `boot()` via `Gate::policy(Project::class, ProjectPolicy::class)`. _(No-op — Laravel 12 auto-discovers `App\Models\Project` → `App\Policies\ProjectPolicy` by convention; verified via passing tests.)_
- [X] T008 Confirm that `app/Providers/AppServiceProvider.php::boot()` follows the existing `User::observe(UserObserver::class)` pattern. Do NOT add observer registrations yet — they reference classes that do not exist and will trigger `Class not found` at boot. Actual registrations land in T027 once the observer files exist.
- [X] T009 [P] Create `tests/Feature/Project/ProjectTimelineAuthorizationTest.php` (Pest feature test scaffold) covering FR-027: only the project owner can transition stages or post manual entries; non-owners receive 403; users with the `admin` Spatie role still get 403 (no override in v1). Tests must currently fail.

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 — Visible project stage and owner transitions (Priority: P1) 🎯 MVP

**Goal**: Surface the project's current stage on every project page and let the owner advance it through the existing state machine, with a confirmation gate for terminal transitions.

**Independent Test**: Visit a project as a non-owner and confirm a stage label appears in the header. Log in as the owner of a planning-stage project, click "Iniciar proyecto" — confirm the stage flips to "En ejecución" without a dialog. Click "Completar proyecto" — confirm a confirmation dialog appears, cancel, confirm no change; re-open and confirm — confirm the stage flips to "Completado" and the action controls disappear.

### Tests for User Story 1 ⚠️ (write first, ensure they FAIL)

- [X] T010 [P] [US1] Create `tests/Feature/Project/ProjectStageTransitionTest.php` covering FR-001..005a: stage label rendered for any viewer; owner sees only legal next transitions; non-owner sees no controls; illegal transitions rejected with 422; `stage_transition` timeline entry recorded after success; terminal-transition path returns the same redirect (confirmation dialog itself is browser-tested separately). **Setup note**: `ProjectController::show()` lazily creates the `Project` for owners on first visit. Tests must seed the `Project` directly (`Project::factory()->for($post)->create(['stage' => 'planning'])`) before POSTing to the stage controller — do NOT rely on the show route to create it. Use the existing `Post` and `User` factories for the parent records.
- [ ] T011 [P] [US1] Create `tests/Browser/ProjectTerminalTransitionConfirmationTest.php` (Pest 4 browser plugin) covering FR-005a: clicking "Completar proyecto" opens a confirmation dialog summarizing consequences; cancel leaves stage unchanged; confirm advances stage to `completed`. _(Skipped — Pest 4 browser plugin is not in `composer.json`; would require new dev dependency. Manual smoke test per quickstart.md step 10 covers FR-005a until plugin is installed.)_

### Implementation for User Story 1

- [X] T012 [US1] Create `app/Http/Requests/TransitionProjectStageRequest.php` — `authorize()` returns `Gate::allows('transition', $this->route('project'))`; `rules()` requires `to` to be a value of `ProjectStage::values()` AND a legal target via `ProjectStage::canTransitionTo()` from current stage. Custom message per FR-004.
- [X] T013 [US1] Create `app/Http/Controllers/ProjectStageController.php` with `store(TransitionProjectStageRequest $request, Project $project)`. Inside a single DB transaction: capture `$from = $project->stage`; call `$project->transitionTo($to)` (the model method already throws on illegal moves, but the Form Request rejects them at 422 first so the throw is unreachable in normal flow — no try/catch needed); insert a `ProjectTimelineEvent { type: 'stage_transition', user_id: auth()->id(), data: { from: $from->value, to: $to->value } }`. Return `back()`. Auto-rejection of pending applications (FR-025) is added later in Phase 6 (US4) — leave a clearly-marked TODO comment until then.
- [X] T014 [US1] Append the route `Route::post('/proyectos/{project}/stage', [ProjectStageController::class, 'store'])->middleware('auth')->name('proyectos.stage.store')` to `routes/web.php`.
- [X] T015 [US1] Modify `app/Http/Controllers/ProjectController.php::show()` to add three Inertia props inside the existing `'project' => [...]` array literal: `stage` (`$project->stage->value`), `stageLabel` (`$project->stage->label()`), and `allowedTransitions` (array of `{ to, label, isTerminal }` derived from `$project->stage->allowedTransitions()` — empty array for non-owners and for terminal stages). Preserve all existing props verbatim. Do NOT touch the existing `$project->load([...])` chain in this task — extending it for `timelineEvents` happens in T030.
- [X] T016 [P] [US1] Create `resources/js/components/ui/proyectos/ProjectStageBadge.tsx` rendering the localized `stageLabel` as a colored Tailwind pill (planning=gray, in_execution=indigo, completed=green, aborted=red per R7). Include `aria-label`.
- [X] T017 [P] [US1] Create `resources/js/components/ui/proyectos/ProjectStageActions.tsx`: renders one button per `allowedTransitions` entry. Non-terminal transitions submit immediately via the Wayfinder import `store as transitionStage from '@/actions/App/Http/Controllers/ProjectStageController'` (Inertia `<Form>` or `router.post`). Terminal transitions open the existing `components/ui/dialog` with consequence copy ("no podrás cambiar la etapa después", "se rechazarán las solicitudes pendientes") and Confirm/Cancel buttons.
- [X] T018 [US1] Wire `ProjectStageBadge` into `resources/js/components/ui/proyectos/ProjectHeader.tsx` next to the title (add `stage` and `stageLabel` props to `ProjectHeaderProps`; pass them through from `show.tsx`). Wire `<ProjectStageActions>` into `resources/js/pages/proyectos/show.tsx` so it renders only when `allowedTransitions.length > 0`. Update `ProyectoShowProps` in `show.tsx` to include the new fields on `ProjectData` (`stage`, `stageLabel`, `allowedTransitions`).
- [X] T019 [US1] Run `php artisan test --compact --filter=ProjectStageTransition` and the browser test; iterate until green.

**Checkpoint**: User Story 1 fully functional and testable independently — stage is visible to all, owner can advance through the state machine, terminal transitions require explicit confirmation, and a `stage_transition` timeline row is recorded.

---

## Phase 4: User Story 2 — Automatic activity timeline (Priority: P1)

**Goal**: Render a chronological feed of automatic events (role created, volunteer joined/bailed/exhausted, photo uploaded, coins received, stage transition) on the project page, with cursor-based pagination.

**Independent Test**: On a fresh project, trigger each event type (create a role, accept a volunteer, upload an image, react with `Potenciar` twice within an hour, transition stage). Reload the project page — confirm the timeline shows entries for each event in reverse-chronological order with actor + relative timestamp. Two `Potenciar` reactions yield a single `coins_received` entry with cumulative coins.

### Tests for User Story 2 ⚠️ (write first, ensure they FAIL)

- [X] T020 [P] [US2] Create `tests/Feature/Project/ProjectTimelineAutomaticEventsTest.php` covering FR-006..011: role creation produces `role_created`; accepting a volunteer (`pending`→`active`) produces `volunteer_joined`; `active`→`bailed` and `active`→`exhausted` produce matching events; image upload produces `photo_uploaded`; pending self-cancel does NOT produce an event; title/description edits produce no event.
- [X] T021 [P] [US2] Create `tests/Feature/Project/ProjectTimelineDisplayTest.php` covering FR-012..017: timeline visible to guests; descending order; per-type variant rendering; empty state copy; first 20 entries inline + `nextCursor`; older entries fetched via the JSON pagination endpoint.
- [X] T022 [P] [US2] Create `tests/Unit/CoinReactionAggregationTest.php` covering R2: first `Potenciar` reaction inserts a `coins_received` row; second within 1 hour increments `data.coins`; third after the window opens a new row. Use `Carbon::setTestNow()`.

### Implementation for User Story 2

- [X] T023 [P] [US2] Create `app/Observers/ProjectRoleObserver.php` — on `created`, insert `ProjectTimelineEvent { type: role_created, user_id: auth()->id() ?? $role->project->user_id, data: { role_id, role_title } }`.
- [X] T024 [P] [US2] Create `app/Observers/ProjectVolunteerObserver.php` — on `updated`, return early unless `$volunteer->wasChanged('status')`. Branch on the status transition (use `$volunteer->getOriginal('status')` for the previous value): `pending`→`active` ⇒ `volunteer_joined`; `active`→`bailed` ⇒ `volunteer_bailed { reason: owner_removed }`; `pending`→`bailed` ⇒ `volunteer_bailed { reason: auto_rejected_terminal_stage }`; `active`→`exhausted` ⇒ `volunteer_exhausted`. Do NOT hook the `deleted` event — pending self-cancel via `delete()` must NOT produce a timeline entry (FR-011). The actor (`user_id` on the event) is `auth()->id()` for owner-driven changes; for the auto-rejection case, leave it null (the controller is acting on behalf of the system within a stage transition).
- [X] T025 [P] [US2] Create `app/Observers/ProjectImageObserver.php` — on `created`, insert `photo_uploaded { image_id }`. No event on delete (FR-011 / edge case).
- [X] T026 [P] [US2] Create `app/Observers/ReactionObserver.php` — on `created`, return early unless `type === ReactionType::Potenciar` and the reactable `Post` has a related `Project`. Open a DB transaction; lock-fetch the most recent `coins_received` event for that project where `created_at >= now()->subHour()`; if found, increment `data.coins` and `save()`; otherwise insert a new row with `data: { coins: <amount>, window_started_at: now()->toIso8601String() }`. Commit. (Per R2.)
- [X] T027 [US2] In `app/Providers/AppServiceProvider.php::boot()` add the four observer registrations next to the existing `User::observe(UserObserver::class)` line: `ProjectRole::observe(ProjectRoleObserver::class)`, `ProjectVolunteer::observe(ProjectVolunteerObserver::class)`, `ProjectImage::observe(ProjectImageObserver::class)`, `Reaction::observe(ReactionObserver::class)`. **Sanity check**: the project's seeders and factories now produce timeline events as a side effect for the first time. Run `php artisan migrate:fresh --seed` (or whatever the project's seed command is) and `php artisan test --compact`; verify there is no unexpected slowdown or duplicate-row noise. If a seeder bulk-creates volunteers/roles/images, expect a corresponding burst of timeline rows — that is the intended behavior, but flag any anomalies to the team before moving on.
- [X] T028 [US2] Create `app/Http/Controllers/ProjectTimelineController.php` with `index(Request $request, Project $project)`: returns `JsonResponse` with `{ entries: [...], nextCursor }` per the contract. Cursor is an ISO8601 of the oldest entry in the page; `limit` defaults to 20, max 50. Order descending by `created_at`. Eager-load `actor` (`user`) to avoid N+1.
- [X] T029 [US2] Append routes to `routes/web.php`: `Route::get('/proyectos/{project}/timeline', [ProjectTimelineController::class, 'index'])->name('proyectos.timeline.index')` (no auth — public read per FR-012).
- [X] T030 [US2] In `app/Http/Controllers/ProjectController.php::show()`, extend the existing `$project->load([...])` chain to include `timelineEvents` with a constraint that orders descending by `created_at`, limits to 20, and eager-loads `user` (the actor). Add a top-level `'timeline' => [ 'entries' => $project->timelineEvents->map(...), 'nextCursor' => <ISO of oldest entry or null> ]` to the Inertia payload, alongside the existing `'project'`/`'post'`/`'isOwner'`/`'currentUserApplication'` keys (do NOT nest `timeline` inside `'project'`). Note: the existing `Project::timelineEvents()` relation orders ASCENDING by `created_at`; either override the order in the load constraint or add a new `recentTimelineEvents()` relation — do NOT modify the existing relation, since other code paths (factories, future features) may depend on the ascending order. If query performance suffers, add a migration for an index on `(project_id, created_at)`; the existing migration `2026_03_29_163626_create_project_timeline_events_table.php` should be inspected first to see whether the index already exists.
- [X] T031 [P] [US2] Create `resources/js/components/ui/proyectos/ProjectTimelineEntry.tsx` — render a single entry; switch on `type` to produce variant-appropriate copy and icon (Heroicons): role_created, volunteer_joined, volunteer_bailed (with reason), volunteer_exhausted, photo_uploaded, coins_received, stage_transition. Use Spanish labels. Include actor avatar + relative date (`hace X`).
- [X] T032 [US2] Create `resources/js/components/ui/proyectos/ProjectTimeline.tsx` — initial render uses the `timeline.entries` prop; on "Cargar más" click (or scroll), fetch older entries via Wayfinder import `index as fetchTimeline from '@/actions/App/Http/Controllers/ProjectTimelineController'` with the current `nextCursor`. Render entries via `ProjectTimelineEntry`. Show empty-state copy when no entries (FR-016). Distinguish milestones / status updates visually (FR-014) — placeholder styling now; concrete styles refined in US3.
- [X] T033 [US2] Wire `ProjectTimeline` into `resources/js/pages/proyectos/show.tsx` between `ProjectTeam` and `PostComments` per R8.
- [X] T034 [US2] Run `php artisan test --compact --filter='Timeline|Coin'`; iterate until green.

**Checkpoint**: User Stories 1 AND 2 work independently. The page now shows stage + auto timeline; manual entries (US3) and stage gating (US4) are still pending.

---

## Phase 5: User Story 3 — Owner-authored milestones and status updates (Priority: P2)

**Goal**: Let the owner post milestones (≤120 chars) and status updates (≤2000 chars) into the same timeline.

**Independent Test**: As owner, open the composer, post a milestone — confirm it appears at the top of the timeline with milestone styling. Post a status update — confirm it appears with status-update styling. Log out (or switch users) — confirm the composer is absent and existing entries remain visible.

### Tests for User Story 3 ⚠️ (write first, ensure they FAIL)

- [X] T035 [P] [US3] Create `tests/Feature/Project/ProjectTimelineManualEntriesTest.php` covering FR-018..022: owner can create milestone (max 120 chars enforced) and status update (max 2000 chars enforced); non-owner POST returns 403; entries are immutable (no PATCH/DELETE routes exist or they 404/405); author renders on the timeline.

### Implementation for User Story 3

- [X] T036 [P] [US3] Create `app/Http/Requests/StoreProjectMilestoneRequest.php` — `authorize()` returns `Gate::allows('postMilestone', $this->route('project'))`; `rules()`: `title` required, string, max 120, trimmed.
- [X] T037 [P] [US3] Create `app/Http/Requests/StoreProjectStatusUpdateRequest.php` — `authorize()` returns `Gate::allows('postStatusUpdate', $this->route('project'))`; `rules()`: `body` required, string, max 2000, trimmed.
- [X] T038 [US3] Add `storeMilestone(StoreProjectMilestoneRequest $request, Project $project)` and `storeStatusUpdate(StoreProjectStatusUpdateRequest $request, Project $project)` to `app/Http/Controllers/ProjectTimelineController.php`. Each inserts a corresponding `ProjectTimelineEvent` and returns `back()`.
- [X] T039 [US3] Append routes to `routes/web.php`: `Route::post('/proyectos/{project}/timeline/milestones', [ProjectTimelineController::class, 'storeMilestone'])->middleware('auth')->name('proyectos.timeline.milestones.store')` and `Route::post('/proyectos/{project}/timeline/status-updates', [ProjectTimelineController::class, 'storeStatusUpdate'])->middleware('auth')->name('proyectos.timeline.status-updates.store')`.
- [X] T040 [US3] Create `resources/js/components/ui/proyectos/ProjectTimelinePostUpdate.tsx` — owner-only composer with a tabbed UI for "Milestone" / "Status update" using existing form primitives. Use Wayfinder imports `storeMilestone` and `storeStatusUpdate` from `@/actions/App/Http/Controllers/ProjectTimelineController`. Validate client-side mirroring server limits.
- [X] T041 [US3] Mount `ProjectTimelinePostUpdate` as the first child of the timeline section in `resources/js/components/ui/proyectos/ProjectTimeline.tsx` (or the parent in `show.tsx`) when `isOwner` is true; it must be absent for non-owners.
- [X] T042 [US3] Refine `ProjectTimelineEntry.tsx` variants for `milestone` and `status_update`: distinct background/border, milestone shows a trophy/star icon, status update shows a megaphone icon. Display author + relative date.
- [X] T043 [US3] Run `php artisan test --compact --filter='ManualEntries|Authorization'`; iterate until green.

**Checkpoint**: Owner-authored entries land in the timeline alongside automatic events; non-owners see them but cannot create them.

---

## Phase 6: User Story 4 — Stage gates on volunteer applications (Priority: P2)

**Goal**: Reject new volunteer applications outside `{planning, in_execution}`, hide the apply control, and auto-reject pending applications when the project enters a terminal stage.

**Independent Test**: Mark a project `completed`. As a non-owner, visit it — confirm no "Postularme" buttons. Attempt to POST to the volunteer-store route directly — confirm 403. Re-create a project with a pending application, then transition to `aborted` — confirm the application's status becomes `bailed`, a `volunteer_bailed { reason: auto_rejected_terminal_stage }` row appears, and the affected user sees no special status on the page beyond the timeline (silent rejection per Q3).

### Tests for User Story 4 ⚠️ (write first, ensure they FAIL)

- [X] T044 [P] [US4] Extend `tests/Feature/Project/ProjectStageTransitionTest.php` (or create `tests/Feature/Project/ProjectStageGatingTest.php` if preferred) covering FR-023..026: applications rejected on terminal-stage projects with 403; existing active volunteers retained; pending applications auto-rejected on terminal transition; one `volunteer_bailed` event per auto-rejected application.

### Implementation for User Story 4

- [X] T045 [US4] Add the stage gate to `app/Http/Controllers/ProjectVolunteerController::store` at the top: `abort_if(! in_array($project->stage, [ProjectStage::Planning, ProjectStage::InExecution], true), 403, 'No se aceptan postulaciones en este momento.')` — per FR-023.
- [X] T046 [US4] In `app/Http/Controllers/ProjectStageController::store` (replace the TODO from T013): when the new stage is `completed` or `aborted`, within the same DB transaction load every `ProjectVolunteer` whose role belongs to `$project` and whose `status === 'pending'`, then **iterate** and call `$volunteer->update(['status' => 'bailed'])` per row (or `$volunteer->status = 'bailed'; $volunteer->save();`). Do NOT use `ProjectVolunteer::whereIn(...)->update([...])` — Eloquent's query-builder `update()` bypasses model events and `ProjectVolunteerObserver` will not fire (per R10 / data-model.md). The observer then emits the `volunteer_bailed { reason: auto_rejected_terminal_stage }` events. The whole sequence (stage write + stage_transition event + per-row volunteer updates) must be wrapped in a single `DB::transaction(...)` so that a failure rolls back partial state.
- [X] T047 [US4] In `resources/js/components/ui/proyectos/ProjectRoles.tsx`, add a new `projectStage: 'planning' | 'in_execution' | 'completed' | 'aborted'` prop and hide the "Postularme" button (and any related apply affordance) when `projectStage` is not in `{'planning', 'in_execution'}` — per FR-024. In `resources/js/pages/proyectos/show.tsx`, pass `projectStage={project.stage}` into the `<ProjectRoles>` invocation. The `stage` prop is already added to `ProyectoShowProps` in T015 / T018.
- [X] T048 [US4] Run `php artisan test --compact --filter='Stage|Volunteer'`; iterate until green.

**Checkpoint**: Lifecycle has teeth — applications cannot be created on terminal-stage projects, the UI reflects this, and pending applications are silently auto-rejected on terminal transitions with a timeline trail.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation, formatting, type generation, and SC verification.

- [X] T049 Run `npm run build` (or `composer run dev`) to regenerate Wayfinder bindings under `resources/js/actions/App/Http/Controllers/ProjectStageController.ts` and `…/ProjectTimelineController.ts`; confirm imports resolve in the components from T017, T032, T040.
- [X] T050 [P] Run `vendor/bin/pint --dirty --format agent` to apply project formatting to all modified PHP files.
- [X] T051 [P] Verify dark-mode parity for `ProjectStageBadge`, `ProjectTimeline`, `ProjectTimelineEntry`, and `ProjectTimelinePostUpdate` (Tailwind dark: utilities present and visually consistent).
- [X] T052 Verify SC-004 (no >100ms initial-render regression for 100 events): seed a project with 100 timeline events via the factory; measure initial Inertia render time vs. an empty project. Record numbers in the PR description.
- [X] T053 Verify SC-005 (older entries load <1s): fetch the second timeline page on a 30-event project; record latency.
- [X] T054 Walk the entire `quickstart.md` smoke flow (13 steps) on a local environment; check off each step.
- [X] T055 Run the full Pest suite once more: `php artisan test --compact`. All new tests green; no regressions in pre-existing tests.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** → no dependencies; can start immediately.
- **Foundational (Phase 2)** → depends on Setup; BLOCKS all user stories.
- **User Stories (Phases 3–6)** → depend on Foundational; can proceed in parallel after Phase 2 with the cross-story coupling noted below.
- **Polish (Phase 7)** → depends on the user stories the team intends to ship.

### User Story Dependencies

- **US1 (P1, MVP)** — depends only on Phases 1–2.
- **US2 (P1)** — depends on Phases 1–2 *and* on T013 (stage controller exists so the `stage_transition` event row can be produced; the timeline display still renders without it but the test suite needs it). In practice, run US1 implementation tasks T012–T015 first, then US2 can land in parallel from T020 onward.
- **US3 (P2)** — depends on Phases 1–2 + US2 implementation (`ProjectTimeline` and `ProjectTimelineEntry` exist before the composer is wired in). Soft dependency — the controller and tests (T035–T039) can be written without US2, but UI mounting (T041, T042) needs US2 components.
- **US4 (P2)** — depends on Phases 1–2 + T013 (controller exists to extend in T046). Independent of US2/US3 otherwise.

### Within Each User Story

- Tests (the `Tests for User Story N` block) MUST be written and demonstrated FAILING before any implementation task in the same phase begins (Constitution II).
- Migrations / enums / models before controllers; controllers before routes; routes before frontend wiring.
- Form Requests are written alongside their controllers (validation-first inside each story).

### Parallel Opportunities

- T002, T003, T004 in Phase 1 are independent — run in parallel.
- T009 in Phase 2 is independent of T006–T008 — can run in parallel with the policy/observer setup.
- US1 and US4 can be developed in parallel by two engineers once Phase 2 lands (US4 only adds to T013 and to a separate frontend file).
- Within US1, T016 and T017 touch different files — parallelizable.
- Within US2, the four observers (T023–T026) are in four different files — parallelizable. The two test files (T020, T021) and the unit test (T022) are also parallelizable.
- Within US3, T036 and T037 are in separate files — parallelizable.
- Polish: T050 (Pint) and T051 (dark mode) can run in parallel.

---

## Parallel Example: User Story 2 (Observers)

```bash
# After Phase 2 + T013 lands, launch all four observers in parallel:
Task: "Create app/Observers/ProjectRoleObserver.php (T023)"
Task: "Create app/Observers/ProjectVolunteerObserver.php (T024)"
Task: "Create app/Observers/ProjectImageObserver.php (T025)"
Task: "Create app/Observers/ReactionObserver.php (T026)"

# And in parallel, the test files:
Task: "Create tests/Feature/Project/ProjectTimelineAutomaticEventsTest.php (T020)"
Task: "Create tests/Feature/Project/ProjectTimelineDisplayTest.php (T021)"
Task: "Create tests/Unit/CoinReactionAggregationTest.php (T022)"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 — Setup (T001–T005).
2. Phase 2 — Foundational (T006–T009).
3. Phase 3 — User Story 1 (T010–T019).
4. **STOP and VALIDATE**: ship the stage badge + transitions. The timeline already shows `stage_transition` events the moment US2 lands, so the schema/event is forward-compatible.

### Incremental Delivery

1. Setup + Foundational → ready (no user-visible change yet).
2. + US1 → MVP: lifecycle is visible and advanceable.
3. + US2 → Living timeline. Demo to stakeholders.
4. + US3 → Owner-authored communication.
5. + US4 → Lifecycle has teeth (gating + auto-rejection).
6. Polish & verify SC-004 / SC-005.

### Parallel Team Strategy

After Phase 2:

- Dev A: US1 → then US3 (manual entries depend on US2 visuals so picks up after US2 lands).
- Dev B: US2.
- Dev C: US4.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps each task to its user story for traceability and independent shipping.
- Verify tests FAIL before implementing (Constitution II).
- Commit after each logical group; the `before_implement` git hook is `optional: true`, so manual commits are fine.
- After every PHP-touching task, run `vendor/bin/pint --dirty --format agent` (per project conventions).
- Wayfinder bindings auto-regenerate on `npm run dev`/`npm run build`; do not hand-write URL strings (Constitution IV).
- Avoid: hardcoding stage strings on the React side — always read from `project.stage` and `project.allowedTransitions`.
