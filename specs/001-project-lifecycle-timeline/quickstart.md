# Quickstart: Project Lifecycle and Activity Timeline

A manual smoke test to exercise the feature end-to-end after implementation lands.

## Prerequisites

- Local Tekitl environment running (`composer run dev` or equivalent).
- Two seeded user accounts: `Owner` and `Volunteer`.
- A project page reachable at `/proyectos/{post}` for an existing post owned by `Owner`.

## Smoke flow

1. **Stage badge visibility (FR-001, US1 AS1)**
   Visit the project page logged out. Confirm a stage badge appears in the header reading "Planificación" (default).

2. **Stage transition — non-terminal (US1 AS2)**
   Log in as `Owner`. Visit the project. Confirm a "Iniciar proyecto" action is visible. Click it. Confirm:
   - The badge updates to "En ejecución".
   - The action button disappears (or is replaced by terminal-transition options).
   - A new timeline entry "Etapa cambiada de Planificación a En ejecución" appears at the top of the timeline.
   - No confirmation dialog was required (FR-005a — non-terminal commits immediately).

3. **Role creation timeline event (FR-006)**
   As `Owner`, add a role ("Coordinador de logística", 1 plaza, 10h). Confirm a timeline entry appears: "Rol 'Coordinador de logística' creado".

4. **Volunteer joined timeline event (FR-007)**
   Open a separate browser session as `Volunteer`. Apply to the role. As `Owner`, accept the application. Confirm a timeline entry: "Juan se unió como Coordinador de logística".

5. **Image upload timeline event (FR-009)**
   As `Owner`, upload an image to the project. Confirm a "photo uploaded" timeline entry.

6. **Coin aggregation (FR-010, R2)**
   As `Volunteer`, "potenciar" the underlying post twice within the same hour. Confirm only one `coins_received` entry exists for the project, and its data shows the cumulative coins.

7. **Manual milestone (US3 AS1)**
   As `Owner`, open the "Publicar actualización" composer, choose "Milestone", enter a short title (e.g., "Llegamos al 50% de voluntarios"). Confirm an entry tagged as a milestone appears at the top of the timeline.

8. **Manual status update (US3 AS2)**
   As `Owner`, post a status update with body text. Confirm a status-update entry appears.

9. **Owner-only controls hidden for non-owners (US3 AS3, FR-027)**
   Log out (or switch to `Volunteer`). Confirm the composer and stage transition controls are absent. Confirm milestones and status updates remain visible.

10. **Terminal-transition confirmation (FR-005a)**
    As `Owner`, with the project in "En ejecución", click "Completar proyecto". Confirm a dialog appears summarizing consequences ("no podrás cambiar la etapa después", "se rechazarán las solicitudes pendientes"). Cancel: confirm no state change. Re-open and confirm: project moves to "Completado".

11. **Terminal-stage volunteer gating (FR-023, FR-024)**
    With the project in "Completado", log in as a third user (`Volunteer2`). Visit the project. Confirm:
    - Stage badge reads "Completado".
    - No "Postularme" buttons are present on roles.
    - Existing active volunteers still appear in the team section.

12. **Auto-rejection on terminal transition (FR-025)**
    Re-create the conditions: have a pending application on a project, then transition to "Abortado" or "Completado". Confirm:
    - The pending application is now `bailed`.
    - A `volunteer_bailed` timeline entry exists with `reason: auto_rejected_terminal_stage`.
    - Per Q3 of clarifications, the affected applicant sees no special status on the project page beyond what the timeline shows (silent rejection).

13. **Pagination (SC-005)**
    On a project with 30+ events, scroll the timeline. Confirm initial load shows 20 entries; loading older entries returns within 1 second.

## Automated coverage map

Each step above corresponds to a Pest test (see `tests/Feature/Project/*` planned in `plan.md`). The smoke flow is intentionally redundant with the test suite — manual verification catches integration issues automated tests miss (visual layout, dark-mode parity, focus management on the terminal-confirmation dialog).
