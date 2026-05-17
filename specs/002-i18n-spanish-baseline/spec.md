# Feature Specification: Internationalization Foundation (Spanish Baseline)

**Feature Branch**: `002-i18n-spanish-baseline`
**Created**: 2026-05-05
**Status**: Draft
**Input**: User description: "integrate internationalization in the app, leave no untranslated strings in the code. the interface should still be in spanish, manual translation to english will be done later"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Spanish UI is unchanged after the refactor (Priority: P1)

A Spanish-speaking visitor who used Tekitl yesterday returns the day after the i18n refactor lands and finds the site identical: every button, heading, placeholder, validation message, error toast, page title, and screen-reader label appears in the same Spanish wording as before. No string is missing, no key shows up as raw text, and no English placeholder leaks into the UI.

**Why this priority**: This is a behind-the-scenes refactor of every user-facing string in the application. If even one string regresses, real Spanish-speaking users see a broken experience immediately. Zero visible change is the entire definition of success for the v1 cut, before any translation work begins.

**Independent Test**: Can be tested independently by walking through every public page, every authenticated page, every form (success + validation failure), every flash/toast scenario, and every email/notification surface, comparing rendered strings against a pre-refactor snapshot. Optional automated check: a smoke crawl that asserts no rendered text matches the placeholder pattern (e.g., `messages.*` keys) and no string is missing.

**Acceptance Scenarios**:

1. **Given** a visitor on the homepage, **When** the page renders after the refactor, **Then** every visible string and every accessibility label appears in the same Spanish wording as before the refactor.
2. **Given** a project owner who submits an empty form, **When** validation fails, **Then** the displayed error messages are the same Spanish messages as before the refactor (never a translation key like `validation.required`).
3. **Given** a contributor who triggers a flash/toast (success, warning, error), **When** the message renders, **Then** the wording matches the pre-refactor Spanish copy.
4. **Given** a screen-reader user, **When** they navigate any page, **Then** every `aria-label`, `sr-only`, and `alt` text is in Spanish (no untranslated key, no English fallback).

---

### User Story 2 — All user-facing strings live in translation files, not in code (Priority: P1)

A new contributor needs to change a piece of UI copy. They open the relevant translation file, find the key, change the value, and the change appears across the application without touching any component, controller, request, or template. No code edit is required to change copy.

**Why this priority**: This is the core architectural outcome the user asked for ("leave no untranslated strings in the code"). Without it, future translation work is impossible to audit, future copy changes scatter across the codebase, and the goal of swapping to English later cannot be achieved.

**Independent Test**: Can be tested independently by (a) running an automated audit over the source tree that flags any user-facing literal Spanish string remaining outside of translation files, expecting zero findings, and (b) editing a single value in a translation file and confirming the rendered UI updates with no other change.

**Acceptance Scenarios**:

1. **Given** the codebase after the refactor, **When** an audit script scans server-side templates, controllers, request validators, mailers, notifications, React components, hooks, and utility modules for user-facing literal strings, **Then** the script reports zero matches outside of the canonical translation files.
2. **Given** a designer editing one translation value (for example, changing the wording of a button label), **When** they save the translation file, **Then** every occurrence of that label in the rendered UI updates and no other source file needs to change.
3. **Given** a developer adding a new component, **When** they hard-code a Spanish literal in JSX or PHP, **Then** the lint/CI gate fails the change before merge (covered by Story 3).

---

### User Story 3 — A guardrail prevents regressions (Priority: P2)

A developer opens a pull request that introduces a hard-coded user-facing Spanish string in a new component or controller. CI fails with a clear message telling them where the violation is and how to extract the string into a translation file. The PR cannot be merged until they fix it.

**Why this priority**: Without an automated gate, the codebase will silently drift back to mixed inline strings within weeks. The gate is the only sustainable way to keep the architectural property bought in Story 2.

**Independent Test**: Can be tested independently by intentionally adding a hard-coded Spanish phrase in a new file on a throwaway branch and verifying the CI lint job fails with a pointer to the offending file and line, and conversely verifying that a PR that uses the translation helper passes the same job.

**Acceptance Scenarios**:

1. **Given** a developer commits a React component containing a literal Spanish string in JSX text, **When** CI runs, **Then** the i18n lint job fails and reports the file path and line of the offending string.
2. **Given** a developer commits a Laravel controller, request class, or mailer containing a literal Spanish string passed to a user-facing surface, **When** CI runs, **Then** the i18n lint job fails with a similar pointer.
3. **Given** the same developer extracts the string into a translation file and references it via the documented helper, **When** CI re-runs, **Then** the i18n lint job passes.
4. **Given** a contributor running the pre-commit hook locally, **When** they stage a file that introduces a hard-coded user-facing string, **Then** the commit is rejected with the same diagnostic as CI.

---

### User Story 4 — English locale skeleton is ready for manual translation (Priority: P3)

A translator is handed a single, complete file (or set of files) representing every user-facing key in the application, with the Spanish source value next to each key, ready to receive English values. They never need to grep the codebase for strings to translate.

**Why this priority**: The user said English translation is a later, manual step. This story makes that later step possible without re-doing the extraction work. It is P3 because the application does not need to *render* English yet — it only needs the structure ready.

**Independent Test**: Can be tested independently by inspecting the `en/` translation directory and confirming it has the same key set as `es/`, with each key either empty, equal to the Spanish source, or marked as untranslated by a clear convention. A translator with no codebase access can produce a translated file from this skeleton.

**Acceptance Scenarios**:

1. **Given** the `en/` translation files after the refactor, **When** they are compared to the `es/` files, **Then** every key present in `es/` is also present in `en/`.
2. **Given** a translator who edits an English value, **When** the application is configured to render English (out of scope for this feature; verifiable via a temporary local override), **Then** the translated value appears in the UI.
3. **Given** a key that has not yet been translated, **When** the audit/report runs, **Then** the key is clearly listed as outstanding (so the translator has a worklist).

---

### Edge Cases

- **Pluralization**: Strings whose wording depends on a count (for example, "1 voluntario" vs. "3 voluntarios") MUST go through the translation system's plural-form mechanism, not string concatenation, so they remain correct in both Spanish and the eventual English.
- **Interpolation**: Strings with embedded values (user names, project titles, dates) MUST use placeholder interpolation supported by the translation system, never string concatenation in code, so the position of the placeholder can move when the language changes.
- **Validation message keys**: Form validation error messages produced by framework rules MUST resolve through the translation system, not be inlined in request classes.
- **Email and notification subjects/bodies**: Server-generated messages (mailers, notifications, password reset, two-factor codes, account events) MUST be sourced from translation files, not inline strings.
- **Date, number, and currency formatting**: Dates and numbers MUST render through locale-aware formatting; they MUST NOT be hard-coded in a Spanish format that breaks when English is enabled later.
- **Error pages and runtime exceptions visible to users**: 404, 403, 419, 500 pages and any user-visible exception copy MUST use translation files.
- **Toasts, modals, confirmation dialogs, and tooltips**: Easy to forget; included in scope.
- **Page `<title>` and meta description**: Per-page titles and descriptions MUST be translatable.
- **`aria-label`, `aria-description`, `alt` text, `sr-only` content, and form `<label>`**: All accessibility-bearing strings are user-facing and MUST be translatable.
- **Strings inside JavaScript validation logic**: Client-side validation feedback (length counters, "campo requerido", etc.) MUST be translatable, not inline in TypeScript.
- **Mixed-content strings (HTML inside translations)**: Where a string contains links or emphasis, the translation system MUST allow the markup to be authored inside the translation, not split across code.
- **Strings the audit cannot decide**: Strings inside code comments, log messages, exception messages intended only for developers, and CLI/Artisan command output for operators are out of scope; the audit MUST distinguish these from user-facing surfaces and not flag them.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render every user-facing string sourced from a translation file, with Spanish as the default and only initially populated locale.
- **FR-002**: System MUST treat any rendered translation key that fails to resolve as a build/test failure, not as silent fallback to the raw key text.
- **FR-003**: System MUST expose Spanish translations to the frontend rendering layer so that React components consume the same source-of-truth strings as server-rendered surfaces (no duplicated copy between server and client).
- **FR-004**: System MUST resolve framework-generated validation messages (required, max length, email format, unique, etc.) through the translation files, in Spanish, with parity to current wording.
- **FR-005**: System MUST resolve server-sent flash messages, toast messages, and notification copy through the translation files.
- **FR-006**: System MUST resolve email and notification subjects and bodies (welcome, password reset, two-factor, account events) through the translation files.
- **FR-007**: System MUST resolve every accessibility-bearing string (aria-labels, sr-only text, alt text, form labels) through the translation files.
- **FR-008**: System MUST support placeholder interpolation in translated strings, so dynamic values (names, counts, project titles, dates) are inserted into translations without string concatenation in code.
- **FR-009**: System MUST support pluralization in translated strings, so count-dependent wording remains correct without code branching.
- **FR-010**: System MUST provide a documented helper, available on both the server side and the client side, for retrieving a translated string by key with optional placeholder values; this helper is the sole sanctioned way to obtain user-facing copy in code.
- **FR-011**: System MUST ship an automated audit (CI job and pre-commit hook) that detects user-facing literal Spanish strings introduced outside of translation files, with file/line pointers and a non-zero exit code on any finding.
- **FR-012**: System MUST allow the audit to be configured with a small, version-controlled allow-list of false positives (for example, brand names, code identifiers shown in dev-only views) so the gate stays useful instead of being disabled wholesale.
- **FR-013**: System MUST publish translation files for English alongside Spanish, with the same key set, even if values are empty placeholders awaiting manual translation.
- **FR-014**: System MUST expose a report — runnable as an automated command — that lists every English key still awaiting a translation value, so translators have a deterministic worklist.
- **FR-015**: System MUST keep the default and fallback locale set to Spanish; English is not user-selectable in this feature and MUST NOT appear in any production rendering pathway.
- **FR-016**: System MUST format dates, numbers, and counts through locale-aware utilities, not hard-coded Spanish patterns, so the formatting will switch when English is enabled later without code edits.
- **FR-017**: System MUST preserve every existing Spanish wording exactly during the extraction step; no rephrasing is permitted in this feature.
- **FR-018**: System MUST keep developer-facing strings (log lines, exception messages, Artisan command output for operators, code comments) outside the translation system; the audit MUST distinguish these from user-facing surfaces and MUST NOT flag them.
- **FR-019**: System MUST update the project documentation (CONTRIBUTING / CLAUDE.md / equivalent runtime guidance) so that contributors know how to add new strings, run the audit locally, and where translation files live.
- **FR-020**: System MUST cover every existing test that asserts on rendered Spanish text — the tests MUST keep passing without rewriting their assertions to translation keys (assertions on user-visible Spanish text are still valid because Spanish is the default).

### Key Entities

- **Translation file (Spanish, `es/`)**: Source of truth for every user-facing string in the application. Organized by feature/domain area (auth, projects, validation, mailers, layout, etc.). Each entry pairs a stable key with the Spanish text that currently exists in the codebase.
- **Translation file (English, `en/`)**: Mirror of the Spanish file structure with the same keys but values awaiting human translation. Not consumed by production rendering in this feature.
- **Translation key**: Stable, hierarchical identifier that code uses to retrieve a string. Once published, a key's identifier is treated as a contract; renaming requires a migration of every call site.
- **Server-side translation helper**: Single, well-known callable that server-side code uses to fetch a translated string with placeholder values; also the canonical location for any centralized fallback policy.
- **Client-side translation helper**: Single, well-known callable that client-side components and utilities use to fetch a translated string. Receives translations from the server through a shared payload so the client never duplicates copy.
- **Audit ruleset**: Pattern definitions (file globs, allowed call sites, allow-list of literal exceptions) that drive the lint/CI check for hard-coded user-facing strings.
- **Translation report**: Generated artifact listing untranslated keys per locale, used by translators as a worklist.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After the refactor, the Spanish UI passes a side-by-side string-level comparison with the pre-refactor UI on 100% of audited pages and surfaces (no string regressions, no missing strings, no raw keys visible).
- **SC-002**: Zero user-facing literal Spanish strings remain in the application source tree outside the canonical translation files, as measured by the audit script.
- **SC-003**: The i18n CI lint job runs in under 30 seconds on the existing CI environment so it can be a required check on every pull request without slowing reviewers.
- **SC-004**: A new contributor can add a fully translated string (key + Spanish value + English placeholder) in under 5 minutes by following the documented procedure, with no need to ask a maintainer where files live.
- **SC-005**: A translator handed only the `en/` directory and the untranslated-keys report can produce a complete English translation without ever opening a source code file.
- **SC-006**: 100% of user-facing validation, flash, toast, email, and accessibility strings render through the translation system (verified by spot tests in feature/browser test suites).
- **SC-007**: The audit produces zero false positives on the post-refactor codebase (it does not flag developer-facing strings, identifiers, or allow-listed brand terms), and zero false negatives on a synthetic test fixture that intentionally introduces a violation.
- **SC-008**: The change is invisible to existing automated tests: every Pest feature/browser test and every Vitest component test that asserted on Spanish copy continues to pass without modification.

## Assumptions

The following decisions are recorded as reasonable defaults for this feature. Any of them can be revisited via a follow-up clarification if a stakeholder objects.

- **Spanish is the only locale rendered in production for this feature.** The English directory is a structural skeleton; no user-facing locale switcher, cookie, or middleware activates English. Locale switching is a separate future feature.
- **Translation files use the framework's native translation mechanism.** No new third-party translation library is introduced on either the server or the client. The client receives Spanish strings through a single shared payload provided by the server, not by duplicating copy in client-side modules. This honors the project's "Convention Over Custom" principle and adds zero new dependencies.
- **Validation messages reuse the framework's bundled Spanish translations** where they already match the current wording, and override only the specific lines that the application has customized. The application does not re-author the entire validation set.
- **The current Spanish wording is treated as the canonical source.** This feature is a mechanical extraction, not a copywriting pass. Wording changes are out of scope and would happen in a later, separate change.
- **The audit/lint gate is enforced at the pre-commit hook and at CI.** The repository's existing pre-commit hook infrastructure is the local gate; CI runs the same audit on every pull request.
- **Developer-facing strings are excluded from the audit.** Log lines, exception messages, Artisan command help text, code comments, and tests are not user-facing and the audit MUST recognize them as out of scope.
- **Existing tests that assert on Spanish text remain valid.** Because Spanish is the default and only rendered locale, asserting `screen.getByText('Iniciar proyecto')` is still correct. Tests are not migrated to assert on translation keys in this feature.
- **The English skeleton is generated, not authored.** A scripted step produces the `en/` files from the `es/` file structure so the two stay in sync; manual translation overrides those files later.
- **Branding and proper nouns stay literal.** Names like "Tekitl" remain as literal strings (in translation values, not in code) and are explicitly allow-listed in the audit if necessary.
- **Number, date, and currency formatting** rely on the platform's built-in locale-aware utilities (no new formatting library) and are configured for `es` by default.
