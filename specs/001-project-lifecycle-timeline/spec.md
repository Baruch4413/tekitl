# Feature Specification: Project Lifecycle and Activity Timeline

**Feature Branch**: `001-project-lifecycle-timeline`
**Created**: 2026-05-04
**Status**: Draft
**Input**: User description: "Project lifecycle and activity timeline on the /proyectos/{post} page. Surface and let the project owner advance the project through its lifecycle stages (planning, in execution, completed, aborted) following the existing state machine. Display a chronological activity timeline for every project, automatically capturing meaningful events (role created, volunteer joined, volunteer bailed/exhausted, image uploaded, coins received, stage transition) and letting the owner post manual updates of two kinds: milestones (notable achievements) and status updates (free-text progress notes). The timeline should be visible to any visitor; only the owner can transition stages or add manual entries. Include a visible stage badge on the project header and gate volunteer applications appropriately when the project is no longer in planning or execution."

## Clarifications

### Session 2026-05-04

- Q: Authorization scope for stage transitions and manual timeline entries — owner-only, or do platform admins also have access? → A: Owner-only. No platform-admin override in v1.
- Q: Confirmation step for irreversible stage transitions? → A: Confirmation required only for terminal transitions (complete, abort); non-terminal transitions commit immediately.
- Q: Visibility to auto-rejected applicants when a project transitions to a terminal stage? → A: Silent rejection in v1 — the only visibility is the timeline entry; no special status shown to the applicant on the project page or elsewhere.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visible project stage on every project page (Priority: P1)

Anyone visiting a project page sees at a glance what stage the project is in (planning, in execution, completed, or aborted). The owner can advance the project to a new stage from the same page using clearly-labeled controls that only allow legal transitions.

**Why this priority**: Stage is already in the database with a working state machine, but is invisible in the UI. Without surfacing it, downstream features (filtering, gating, timeline transitions) cannot land. This is the smallest slice that makes the lifecycle real for users.

**Independent Test**: Visit a project as a non-owner and confirm a stage label is shown in the header. Visit as the owner of a planning-stage project, advance it to "in execution" via the visible control, refresh, and confirm the new stage is reflected and the previous transition is no longer offered (only the legal next ones are).

**Acceptance Scenarios**:

1. **Given** any visitor on a project page, **When** the page loads, **Then** the current stage is displayed as a prominent label in the project header.
2. **Given** a project owner viewing their planning-stage project, **When** they choose the "start project" action, **Then** the project moves to "in execution" and the timeline records the transition.
3. **Given** a project owner viewing a completed or aborted project, **When** the page loads, **Then** no stage transition controls are offered (terminal stages cannot transition).
4. **Given** a non-owner viewing any project, **When** the page loads, **Then** they see the stage label but no transition controls.

---

### User Story 2 - Automatic activity timeline (Priority: P1)

Every project page shows a chronological feed of meaningful events that have happened on the project: roles being created, volunteers joining or leaving, images being uploaded, coins arriving, and stage transitions. Visitors and the owner alike can scroll the history to understand the project's trajectory.

**Why this priority**: This is what turns the page from a static description into a living record of collaboration, which is core to the platform's purpose. The timeline data model exists; nothing currently produces or displays events.

**Independent Test**: Trigger each tracked event type on a fresh project (create a role, have a volunteer apply and be accepted, upload an image, receive coins, transition stage). Reload the project page and confirm the timeline shows entries for each event in chronological order with appropriate context (who, what, when).

**Acceptance Scenarios**:

1. **Given** a project owner creates a new role, **When** the role is saved, **Then** a timeline entry "Role '<title>' created" appears with the owner's identity and timestamp.
2. **Given** a volunteer's application is accepted, **When** the acceptance is saved, **Then** a timeline entry "<volunteer> joined as <role title>" appears.
3. **Given** an active volunteer's status changes to "bailed" or "exhausted", **When** the change is saved, **Then** a corresponding timeline entry is recorded with the volunteer and role.
4. **Given** the owner uploads an image, **When** the upload completes, **Then** a "photo uploaded" timeline entry is recorded.
5. **Given** the project receives coins (a "potenciar" reaction on the underlying post), **When** the reaction is recorded, **Then** a "coins received" timeline entry is added (deduplicated to avoid one entry per micro-transaction — see assumptions).
6. **Given** the owner transitions the project's stage, **When** the transition is saved, **Then** a "stage changed from X to Y" timeline entry is recorded.
7. **Given** any visitor views the project, **When** the page loads, **Then** the timeline is rendered in reverse-chronological order (newest first) with the most recent entries paginated/lazily expanded for performance.

---

### User Story 3 - Owner-authored milestones and status updates (Priority: P2)

The project owner can post two kinds of manual entries to the timeline:

- **Milestones**: short, celebrated entries marking notable achievements (e.g., "We hit 50% of our volunteer goal").
- **Status updates**: free-text progress notes for the community (e.g., "Working on permits this week, expect a delay").

These appear in the same timeline as automatic events but are visually distinguishable.

**Why this priority**: Manual entries are what make the timeline a communication tool rather than only an audit log. They depend on the timeline existing (Story 2) but the platform delivers value without them in v1 — hence P2.

**Independent Test**: As the owner, post a milestone and a status update. Reload as a non-owner and confirm both appear in the timeline, are visually distinguished from automatic events, and show the owner as author. Confirm a non-owner has no controls to create either type.

**Acceptance Scenarios**:

1. **Given** the project owner viewing their project, **When** they open the "post update" control and submit a milestone with a short title, **Then** a milestone entry appears at the top of the timeline.
2. **Given** the project owner viewing their project, **When** they submit a status update with body text, **Then** a status-update entry appears at the top of the timeline.
3. **Given** a non-owner viewing the project, **When** the page loads, **Then** they see existing milestones and status updates in the timeline but have no controls to add new ones.
4. **Given** any visitor, **When** they read the timeline, **Then** milestones, status updates, and automatic events are visually distinguishable from one another.

---

### User Story 4 - Stage gates on volunteer applications (Priority: P2)

Volunteer applications are only accepted while the project is in stages where new volunteers make sense (planning and in execution). Completed and aborted projects no longer accept applications, and the UI reflects this clearly.

**Why this priority**: Without gating, the lifecycle has no teeth. But the platform can ship Story 1+2 without this and add it shortly after — hence P2.

**Independent Test**: Mark a project as completed. As an authenticated non-owner, attempt to apply to one of its open roles. Confirm the application is rejected (UI does not offer the action, and any direct attempt is blocked server-side). Confirm existing active volunteers remain unaffected.

**Acceptance Scenarios**:

1. **Given** a project in stage "completed" or "aborted", **When** an authenticated non-owner views it, **Then** no "Postularme" button is offered on any role.
2. **Given** a project in stage "completed" or "aborted", **When** a non-owner submits an application by any means, **Then** the application is rejected with a clear error.
3. **Given** a project in stage "planning" or "in execution", **When** an authenticated non-owner views an unfilled role, **Then** the application controls behave as today.
4. **Given** existing pending applications on a project that transitions to "completed" or "aborted", **When** the transition occurs, **Then** pending applications are auto-resolved (rejected) and the affected applicants are reflected in the timeline.

---

### Edge Cases

- **Illegal stage transition attempts**: A user (or stale UI) submits a transition that the state machine forbids (e.g., completed → planning). The server rejects it; the UI shows a friendly error and refreshes the available actions.
- **Empty timeline**: A brand-new project with no events shows an empty-state message rather than a blank section.
- **High-volume coin events**: Many small "coins received" events in quick succession could flood the timeline. The system aggregates these into a single rolling entry per time window (see assumptions).
- **Image deletion**: Deleting an image does not erase the original "photo uploaded" timeline entry; the entry remains as a record (it may indicate the image is no longer available).
- **Volunteer self-withdrawal**: When a volunteer cancels their own pending application, no timeline entry is recorded (only owner-side decisions and accepted-then-bailed transitions are notable).
- **Author of a manual entry leaves the platform**: If the owner's account is deleted, their milestones and status updates remain on the timeline but display the entry as authored by a removed user.
- **Milestone/status update length**: The platform enforces sensible maximum lengths so the timeline remains readable (see Functional Requirements).
- **Accepted volunteer is later removed by the owner**: The timeline records both the join and the removal as separate entries.

## Requirements *(mandatory)*

### Functional Requirements

#### Stage display and transitions

- **FR-001**: The project page MUST display the current stage of the project as a visible label, regardless of viewer.
- **FR-002**: Only the project owner MUST be able to transition the project's stage.
- **FR-003**: Stage transitions MUST be restricted to those allowed by the existing state machine (planning → in_execution | aborted; in_execution → completed | aborted; completed and aborted are terminal).
- **FR-004**: Attempts to perform an illegal transition MUST be rejected with a clear error and no state change.
- **FR-005**: When a stage transition occurs, the system MUST record a timeline entry capturing the previous stage, the new stage, the actor, and the timestamp.
- **FR-005a**: Transitions into a terminal stage (`completed` or `aborted`) MUST require an explicit confirmation step that summarizes the consequences (no further stage changes possible; any pending applications will be auto-rejected). Non-terminal transitions (e.g., `planning` → `in_execution`) MUST commit immediately without an additional confirmation.

#### Activity timeline — automatic events

- **FR-006**: The system MUST record a timeline entry whenever a project role is created, capturing the role title and the actor.
- **FR-007**: The system MUST record a timeline entry whenever a volunteer's application is accepted (status: active), capturing the volunteer, the role, and the actor (owner).
- **FR-008**: The system MUST record a timeline entry whenever an active volunteer's status changes to "bailed" or "exhausted", capturing the volunteer and the role.
- **FR-009**: The system MUST record a timeline entry whenever the owner uploads an image to the project, capturing the actor.
- **FR-010**: The system MUST record a timeline entry when the project receives coins (via a "potenciar" reaction on the underlying post). Successive coin events within a short rolling window MAY be aggregated into a single entry (see Assumptions).
- **FR-011**: The system MUST NOT record timeline entries for actions deemed non-notable (e.g., a volunteer self-withdrawing a pending application, edits to title/description by the owner, image edits or deletions).

#### Activity timeline — display

- **FR-012**: The project page MUST display the timeline to all viewers (authenticated or not).
- **FR-013**: The timeline MUST be ordered with the most recent entries first.
- **FR-014**: The timeline MUST visually distinguish between automatic event types, milestones, and status updates.
- **FR-015**: The timeline MUST display the actor (where applicable), the event description, and a human-readable relative timestamp for each entry.
- **FR-016**: The timeline MUST handle an empty state gracefully with explanatory copy.
- **FR-017**: The timeline MUST be paginated or lazily expanded such that initial page load is not blocked by long histories (see Success Criteria for performance targets).

#### Manual entries — milestones and status updates

- **FR-018**: Only the project owner MUST be able to create timeline milestones or status updates.
- **FR-019**: A milestone entry MUST consist of a short title (maximum 120 characters) and is intended for celebratory moments.
- **FR-020**: A status update entry MUST consist of body text (maximum 2000 characters) and is intended for free-form progress communication.
- **FR-021**: Manual entries MUST be attributable to the owner who authored them, and MUST display that author on the timeline.
- **FR-022**: Authors MUST NOT be able to edit or delete manual entries once posted (timeline integrity); minor typo correction is out of scope for v1.

#### Stage gating on applications

- **FR-023**: The system MUST refuse new volunteer applications while the project is in stages other than "planning" or "in_execution".
- **FR-024**: The page MUST hide or disable the "apply" control on roles when the project is not in "planning" or "in_execution".
- **FR-025**: When a project transitions to "completed" or "aborted", any pending applications MUST be auto-resolved (rejected) and a corresponding timeline entry recorded for each. Auto-rejected applicants MUST NOT receive any additional in-product status messaging beyond the timeline entry; the timeline is the sole channel of visibility in v1.
- **FR-026**: Existing active volunteers MUST NOT be affected by stage transitions to terminal stages (their records remain).

#### Authorization summary

- **FR-027**: All write operations introduced by this feature (stage transition, manual timeline entries) MUST require the requester to be authenticated AND to be the project's owner. Non-owners attempting these MUST receive an authorization error. No platform-administrator or moderator override exists in v1; ownership is the sole gate.

### Key Entities *(include if feature involves data)*

- **Project Stage**: The lifecycle state of a project. One of planning, in_execution, completed, aborted. Subject to a fixed state machine. Already represented in storage.
- **Project Timeline Event**: A chronological record attached to a project, with a type (one of the automatic event types or "milestone" / "status_update"), an optional author, an optional structured payload (e.g., role title, prior/next stage), and a creation timestamp. Already represented in storage.
- **Project Role**: An open volunteer position on a project. Affected by this feature only insofar as creating one produces a timeline event and applications are gated by project stage.
- **Project Volunteer**: A user's relationship to a role (pending, active, exhausted, bailed). Status changes produce timeline events; pending applications are auto-resolved on terminal-stage transitions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of project pages display the project's current stage label, verified by automated coverage of the page across all four stages.
- **SC-002**: Owners can advance a project from planning to in_execution in under 10 seconds end-to-end (click to confirmation), with no page reload required.
- **SC-003**: 100% of the seven defined automatic event types produce a timeline entry within 2 seconds of the originating action, verified by automated tests for each event type.
- **SC-004**: The project page's initial render time does not regress by more than 100 ms on a project with up to 100 timeline events compared to the same project with no events.
- **SC-005**: Visitors can read the most recent 20 timeline entries without manual interaction; older entries load on demand within 1 second of the request.
- **SC-006**: Zero successful illegal stage transitions and zero successful applications to completed/aborted projects across automated test scenarios.
- **SC-007**: Owners report that the timeline gives them confidence about what has happened on their project — measured qualitatively by ≥80% positive response in a post-launch survey of the first 20 owners to use the feature.

## Assumptions

- The feature operates entirely on the existing `/proyectos/{post}` detail page; no new index page or list view is introduced.
- The state machine and stage labels (planning, in_execution, completed, aborted) defined on the existing `ProjectStage` enum are authoritative and will be reused without modification.
- The existing eight `project_timeline_events.type` values are sufficient for automatic events; "milestone" and "status_update" values are repurposed for owner-authored entries (no schema change needed for entry types).
- Coin events are aggregated into a single timeline entry per rolling 1-hour window per project to avoid timeline flooding from rapid successive reactions; a single aggregated entry shows the total coins received in that window.
- Manual entries are immutable in v1; an "edit/delete" affordance is explicitly out of scope.
- Internationalization of timeline copy follows existing project conventions (Spanish UI strings); no new translation infrastructure is introduced.
- Notifications (email, push) when timeline events occur are out of scope for v1.
- Activity feeds aggregating timelines across multiple projects (a global "what's happening" view) are out of scope for v1.
- The project's "goal" field (default 100 coins) remains unused by this feature; a separate feature may surface progress against the coin goal later.
- Existing comments on a project remain a separate surface from the timeline; comments are not folded into the timeline in v1.
