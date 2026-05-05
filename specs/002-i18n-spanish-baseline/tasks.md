---
description: "Task list for Internationalization Foundation (Spanish Baseline)"
---

# Tasks: Internationalization Foundation (Spanish Baseline)

**Input**: Design documents from `/specs/002-i18n-spanish-baseline/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED. Constitution v1.2.0 Principle II (TDD, NON-NEGOTIABLE) mandates Red-Green-Refactor for every behavioral change. Tests precede implementation in every phase.

**Organization**: Tasks grouped by user story for independent delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable — different files, no incomplete dependencies.
- **[Story]**: User story label (US1–US4) on story-phase tasks only.
- File paths are repository-relative.

## Path Conventions

Single Laravel + Inertia project. Backend under `app/`, `lang/`, `config/`, `resources/views/`. Frontend under `resources/js/`. Tests under `tests/Feature/`, `tests/Unit/`, `tests/Browser/`, `tests/js/`. Tooling under `tools/i18n/`. Hooks under `.githooks/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bootstrap directories, publish framework language files, and add npm scripts. No production code paths change yet.

- [ ] T001 Publish Laravel's bundled English language files via `php artisan lang:publish --no-interaction` so `lang/en/{auth,validation,passwords,pagination}.php` are tracked sources (already partially present); verify diff is the expected published files only.
- [ ] T002 [P] Create `lang/es/` directory with empty placeholder files for the canonical domain set: `auth.php`, `projects.php`, `validation.php`, `mailers.php`, `notifications.php`, `layout.php`, `errors.php`, `accessibility.php`, `pagination.php`, `passwords.php` — each returning an empty array `<?php return [];`.
- [ ] T003 [P] Create `tools/i18n/` directory tree with `tools/i18n/audit.config.json` (initial include/exclude/sinks/attrs/helpers/allowList per `data-model.md` E5), `tools/i18n/fixtures/violation.tsx` (synthetic JSX literal positive case), `tools/i18n/fixtures/developer-strings.php` (log/exception negative case), `tools/i18n/fixtures/.gitkeep`.
- [ ] T004 Add npm scripts to `package.json`: `"i18n:audit": "node tools/i18n/audit.mjs"`, `"i18n:scaffold-en": "php artisan i18n:scaffold-en"`, `"i18n:report": "php artisan i18n:report"`.

**Checkpoint**: Directories and tooling stubs exist; build is green; no behavior change yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wire the runtime translation pipeline (locale config, shared payload, client helper, audit binary) so every story can plug in. Tests in this phase prove the pipeline works on a single canary key before bulk extraction begins.

**⚠️ CRITICAL**: No story phase work begins until Phase 2 completes.

### Tests for Foundational (write first, observe RED)

- [ ] T005 [P] Pest unit `tests/Feature/I18n/LocaleConfigTest.php` asserting `config('app.locale') === 'es'` and `config('app.fallback_locale') === 'es'`.
- [ ] T006 [P] Pest feature `tests/Feature/I18n/SharedTranslationsTest.php` asserting an Inertia response from `/` (or any public route) carries `props.translations` (associative array) and `props.locale === 'es'`.
- [ ] T007 [P] Vitest `tests/js/lib/i18n.test.ts` asserting `t('canary.greeting', { name: 'Ana' })` resolves placeholders, `tChoice('canary.items', n)` switches between singular/plural pipe forms, and a missing key returns the key string and triggers `console.error` in non-production.
- [ ] T008 [P] Pest feature `tests/Feature/I18n/AuditScriptTest.php` shelling out to `node tools/i18n/audit.mjs tools/i18n/fixtures/violation.tsx` expecting exit code 1 and stdout containing `tools/i18n/fixtures/violation.tsx:` plus the literal token.
- [ ] T009 [P] Pest feature in `tests/Feature/I18n/AuditScriptTest.php` asserting `node tools/i18n/audit.mjs tools/i18n/fixtures/developer-strings.php` exits 0 (no false positives on developer-facing strings).

### Implementation (Foundational)

- [ ] T010 Edit `config/app.php` to set `'locale' => env('APP_LOCALE', 'es')` and `'fallback_locale' => env('APP_FALLBACK_LOCALE', 'es')` and `'faker_locale' => env('APP_FAKER_LOCALE', 'es_MX')`. Update `.env.example` to mirror.
- [ ] T011 Add a canary translation entry `'greeting' => 'Hola, :name.'` and `'items' => 'Un elemento|:count elementos'` to `lang/es/canary.php` (new file) so foundational tests have a stable target. Add the same keys to `lang/en/canary.php` with empty values.
- [ ] T012 Edit `app/Providers/AppServiceProvider.php` to register `Inertia::share(['translations' => fn () => $this->loadTranslations(app()->getLocale()), 'locale' => fn () => app()->getLocale()])`. Implement `loadTranslations(string $locale): array` that scans `lang/<locale>/*.php` and returns a domain-keyed nested array.
- [ ] T013 [P] Create `resources/js/types/inertia.d.ts` (or extend the existing module declaration if present) with `SharedProps` containing `translations: Record<string, TranslationDictionary>` and `locale: string`, plus `TranslationDictionary` type.
- [ ] T014 [P] Create `resources/js/lib/i18n.ts` exporting `t(key, replacements?)`, `tChoice(key, count, replacements?)`, and `useLocale()` per `contracts/translation-helper.md`. Implementation reads `usePage<SharedProps>().props.translations`. Pipe-form parser: split on `|`, optional interval prefix `[a,b]` / `{n}` selecting by `count`. Placeholder interpolation: `String(value).replace(/:(\w+)/g, ...)`. Missing-key path returns the key and emits `console.error` outside production.
- [ ] T015 Create `tools/i18n/audit.mjs` (Node ESM, no deps) per `contracts/audit-cli.md`. Implements: arg parsing (positional paths, `--format`, `--config`), config load + JSON validation, glob expansion via Node 22 `fs.glob` (or hand-rolled walker over `include`/`exclude`), per-file dispatcher to PHP/Blade/JSX scanners, finding aggregation, text + JSON output, exit codes 0/1/2/3.
- [ ] T016 [P] Inside `tools/i18n/audit.mjs`, implement the PHP surface scanner: regex-pass over the file detecting calls to user-facing sinks (`view(`, `Inertia::render(`, `Mail::send(`, `->subject(`, `flash(`, `session()->flash(`, `back()->with(`, `redirect()->with(`) and FormRequest `messages()` return arrays, flagging string-literal arguments that are not wrapped in `__(`/`trans(`/`@lang`. Honors `allowList`.
- [ ] T017 [P] Implement the Blade surface scanner inside `tools/i18n/audit.mjs`: tokenize `*.blade.php`, flag any non-whitespace text node not inside `{{ __(...) }}`, `@lang(...)`, comments, `<script>`/`<style>`/`<pre>`/`<code>` blocks.
- [ ] T018 [P] Implement the JSX surface scanner inside `tools/i18n/audit.mjs`: parse `*.tsx`/`*.jsx` (TS-aware via lightweight regex/AST — Babel/swc is OK only if available without new deps; otherwise targeted regex sufficient for the surfaces enumerated in contract). Flag JSX text-node children, JSX literal attribute values for the configured prop list, and string literals as first arg to configured helpers.
- [ ] T019 Run T005–T009 — confirm transitions from RED to GREEN. Refactor common scanner helpers into a single internal module within `audit.mjs` if duplication appears.

**Checkpoint**: Locale is Spanish; shared prop ships; client helper resolves keys; audit binary detects violations and respects allow-listing. Story phases unblocked.

---

## Phase 3: User Story 1 — Spanish UI is unchanged after the refactor (Priority: P1) 🎯 MVP

**Goal**: Replace every existing user-facing literal across server templates, controllers, requests, mailers, notifications, Blade views, and React components/hooks with `__()`/`@lang`/`t()`, populating `lang/es/` with the *exact* current wording (FR-017). Spanish UI parity is preserved (SC-001, SC-008).

**Independent Test**: Existing Pest browser tests, Pest feature tests, and Vitest component tests continue to pass without modification (SC-008). New parity smoke (T020) covers any surfaces not already asserted.

### Tests for User Story 1 (write first, observe RED)

- [ ] T020 [P] [US1] Pest feature `tests/Feature/I18n/MissingKeyFailsTest.php` asserting that calling `__('this.key.does.not.exist')` returns the literal key (no silent fallback) — proves FR-002 wiring before bulk extraction.
- [ ] T021 [P] [US1] Pest feature `tests/Feature/I18n/ValidationMessageParityTest.php` posting an empty payload to a representative Form Request endpoint (e.g., `StoreProjectRequest`) and asserting the response carries the same Spanish error text the test would have asserted before extraction.
- [ ] T022 [P] [US1] Pest browser `tests/Browser/I18n/PublicSurfacesParityTest.php` smoke-walking landing, login, register, project index, and project detail pages asserting key Spanish strings render unchanged. Reuses existing assertions where possible.
- [ ] T023 [P] [US1] Pest feature `tests/Feature/I18n/MailNotificationParityTest.php` rendering each mailable + notification (welcome, password reset, two-factor if enabled, project notifications) and asserting subject + body Spanish strings unchanged.
- [ ] T024 [P] [US1] Vitest `tests/js/components/I18nA11yLabelsTest.tsx` rendering one component per surface family (button, form, dialog, toast) and asserting `aria-label`/`alt`/`sr-only` content equals expected Spanish strings sourced via `t()`.

### Implementation for User Story 1 (extraction by surface)

> **Per Phase rule**: each task below is RED → GREEN: extract one surface, run that surface's test (T020–T024 plus the existing suite), confirm parity, then move on. Order within US1 is not strict; tasks marked [P] touch disjoint files.

- [ ] T025 [P] [US1] Translate Laravel-bundled language files in `lang/es/auth.php`, `lang/es/passwords.php`, `lang/es/pagination.php` to current wording. Reuse Laravel's bundled Spanish where it matches; override only where Tekitl's wording differs.
- [ ] T026 [P] [US1] Populate `lang/es/validation.php` with translated framework messages plus any Tekitl custom rules currently inlined in Form Request `messages()` overrides.
- [ ] T027 [P] [US1] Populate `lang/es/layout.php` with global layout strings (nav links, footer, page-shell labels) by extracting from `resources/views/layouts/*.blade.php` and `resources/js/layouts/*.tsx`.
- [ ] T028 [P] [US1] Populate `lang/es/projects.php` with strings extracted from `app/Http/Controllers/ProjectController.php`, `app/Http/Requests/Store*Request.php`, `Update*Request.php`, all `resources/js/pages/proyectos/*.tsx`, `resources/js/components/ui/proyectos/*.tsx`.
- [ ] T029 [P] [US1] Populate `lang/es/auth.php` (interactive auth surfaces, distinct from framework `auth.php`) with strings extracted from `resources/js/pages/auth/*.tsx` and Fortify view overrides — namespace as `auth.ui.*` to avoid collision with framework keys.
- [ ] T030 [P] [US1] Populate `lang/es/mailers.php` with subjects + body fragments from `app/Mail/*.php` + `resources/views/emails/**/*.blade.php`.
- [ ] T031 [P] [US1] Populate `lang/es/notifications.php` with strings extracted from `app/Notifications/*.php`.
- [ ] T032 [P] [US1] Populate `lang/es/errors.php` with strings extracted from `resources/views/errors/*.blade.php` (404, 403, 419, 500, 503) and any user-visible exception copy in `app/Exceptions`.
- [ ] T033 [P] [US1] Populate `lang/es/accessibility.php` with `aria-label`, `aria-description`, `alt`, `sr-only` strings extracted from `resources/js/**/*.tsx` — namespace as `accessibility.<feature>.<surface>`.
- [ ] T034 [US1] Replace literals in `app/Http/Controllers/**/*.php` with `__()` calls referencing the keys added in T028. Run T021 — must pass.
- [ ] T035 [US1] Replace literals in `app/Http/Requests/**/*.php` `messages()` arrays with `__()` references. Run T021 — must still pass.
- [ ] T036 [US1] Replace literals in `app/Mail/**/*.php` (subjects + view data) with `__()` references; replace literals inside `resources/views/emails/**/*.blade.php` with `@lang`. Run T023.
- [ ] T037 [US1] Replace literals in `app/Notifications/**/*.php` with `__()` references. Run T023.
- [ ] T038 [US1] Replace literals in `resources/views/**/*.blade.php` (layouts, errors, partials) with `@lang`/`{{ __('…') }}`. Run T022.
- [ ] T039 [P] [US1] Replace literals in `resources/js/pages/**/*.tsx` JSX text and configured attributes with `t()`/`tChoice()`. Run Vitest plus T022/T024.
- [ ] T040 [P] [US1] Replace literals in `resources/js/components/**/*.tsx` (UI primitives + project components + auth components) with `t()`/`tChoice()`. Run Vitest plus T024.
- [ ] T041 [P] [US1] Replace literals in `resources/js/hooks/**/*.ts` and `resources/js/lib/**/*.ts` (toast helpers, validation feedback strings) with `t()` calls accepting the resolved string at the call site rather than embedding it. Run Vitest.
- [ ] T042 [US1] Update `resources/js/lib/utils.ts` (and any sibling formatter modules) to read `useLocale()` for `Intl.DateTimeFormat`/`Intl.NumberFormat`; remove hard-coded `'es-MX'`/`'es'` patterns (FR-016).
- [ ] T043 [US1] Run `php artisan i18n:scaffold-en` (uses command added in Phase 6 — if Phase 6 has not yet landed, manually mirror keys into `lang/en/*.php` with empty values to keep parity test green).
- [ ] T044 [US1] Run full suites: `php artisan test --compact`, `bun run test:js`, `vendor/bin/pint --dirty --format agent`. All must pass with no test edits (SC-008).

**Checkpoint**: Spanish UI is byte-equivalent to pre-refactor; literals live exclusively in `lang/es/`.

---

## Phase 4: User Story 2 — All user-facing strings live in translation files (Priority: P1)

**Goal**: Prove the centralization invariant holds — the audit script reports zero findings on the post-extraction codebase, and editing a single value in `lang/es/` propagates to the UI without code edits (FR-001, FR-003, FR-010, SC-002).

**Independent Test**: `bun run i18n:audit` exits 0 against the full repository; flipping one value in `lang/es/projects.php` updates rendered UI on next request with no source edit.

### Tests for User Story 2 (write first, observe RED)

- [ ] T045 [P] [US2] Pest feature `tests/Feature/I18n/AuditCleanRepoTest.php` running `node tools/i18n/audit.mjs` against the full repository (no positional paths) and asserting exit code 0 and `findings.length === 0`. Tagged slow; runs in CI.
- [ ] T046 [P] [US2] Pest feature `tests/Feature/I18n/CopyEditFlowTest.php` programmatically editing one value in a temp `lang/es/canary.php` (via test-only override directory or runtime `Lang::setLoaded`) and asserting the rendered string changes — proving no code edit is needed for copy changes.
- [ ] T047 [P] [US2] Vitest `tests/js/lib/i18nKeyShape.test.ts` asserting `t()` rejects (via type narrowing in dev mode + runtime `console.error`) non-literal keys constructed at runtime; uses a synthetic call site.

### Implementation for User Story 2

- [ ] T048 [US2] Audit-driven sweep: run `bun run i18n:audit --format=json`, iterate findings, extract residual literals into the appropriate `lang/es/<domain>.php`, replace call site, re-run until exit 0. Update `tools/i18n/audit.config.json.allowList` only for the documented exceptions (brand "Tekitl", dev-only identifiers); each allow-list entry is justified inline in the JSON via a `note` field added to the schema.
- [ ] T049 [US2] Update `contracts/translation-helper.md` references in `quickstart.md` if any helper signature drifted during implementation; ensure the documented signature matches `resources/js/lib/i18n.ts` exactly.
- [ ] T050 [US2] Add to `CONTRIBUTING.md` (if it exists; otherwise create a minimal one) a "Adding a new string" section pointing to `specs/002-i18n-spanish-baseline/quickstart.md` (FR-019). Update `CLAUDE.md` runtime guidance with one-line pointer to the same.
- [ ] T051 [US2] Run T045 + T046 + T047 — must all pass.

**Checkpoint**: Audit reports zero findings; copy changes require no code edit.

---

## Phase 5: User Story 3 — Guardrail prevents regressions (Priority: P2)

**Goal**: Wire the audit into the pre-commit hook and CI so a hard-coded literal cannot land on `main` (FR-011, FR-012, SC-003, SC-007).

**Independent Test**: A throwaway commit introducing a hard-coded literal triggers a pre-commit failure with `path:line:col`; reverting the literal allows the commit.

### Tests for User Story 3 (write first, observe RED)

- [ ] T052 [P] [US3] Pest feature `tests/Feature/I18n/PreCommitHookTest.php` simulating staged-file invocation: stages `tools/i18n/fixtures/violation.tsx` via a temp git index in a tempdir, runs `.githooks/pre-commit` directly, asserts non-zero exit and stdout containing the fixture path.
- [ ] T053 [P] [US3] Pest feature in same file asserting that staging only the canary clean fixture results in exit 0.
- [ ] T054 [P] [US3] Pest feature `tests/Feature/I18n/AuditPerformanceTest.php` (CI-only) asserting `node tools/i18n/audit.mjs` over the full repo completes in < 30 seconds (SC-003); marked `@group ci-perf` so local runs skip it.

### Implementation for User Story 3

- [ ] T055 [US3] Edit `.githooks/pre-commit` to append the i18n audit stage after the existing ESLint stage per `contracts/audit-cli.md` § "Pre-commit Hook Integration". Honor the same `--` option-injection guard pattern. Skip when no staged files match the audit globs.
- [ ] T056 [US3] Add a CI workflow step (or extend the existing one — locate via `.github/workflows/*.yml`) that runs `bun run i18n:audit` after `bun run test:js`. Failure blocks merge.
- [ ] T057 [US3] Run T052–T054 — must all pass. Refactor: if the hook duplicates argv-handling logic with the ESLint stage, extract a small helper sourced by both stages.

**Checkpoint**: Trunk is protected; new literals fail at commit and at CI.

---

## Phase 6: User Story 4 — English skeleton ready for manual translation (Priority: P3)

**Goal**: Ship `lang/en/` with the same key set as `lang/es/`, plus Artisan commands `i18n:scaffold-en` (regenerates the skeleton) and `i18n:report` (lists untranslated keys) so a translator can work without source access (FR-013, FR-014, SC-005).

**Independent Test**: `array_keys_recursive(lang/en) === array_keys_recursive(lang/es)`; `php artisan i18n:report` lists every empty English value; a translator filling one value sees it reflected when rendering English (verified via temporary local locale override).

### Tests for User Story 4 (write first, observe RED)

- [ ] T058 [P] [US4] Pest unit `tests/Feature/I18n/TranslationParityTest.php` recursively comparing the leaf-key sets of `lang/es/*.php` vs `lang/en/*.php`, expecting equality.
- [ ] T059 [P] [US4] Pest feature `tests/Feature/I18n/ScaffoldEnCommandTest.php` exercising `php artisan i18n:scaffold-en`: setup deletes one key from `lang/en/projects.php`, runs the command, asserts the key is restored with empty value.
- [ ] T060 [P] [US4] Pest feature `tests/Feature/I18n/ReportCommandTest.php` running `php artisan i18n:report --locale=en --format=json` and asserting the JSON shape (locale, untranslated map, total) plus `--strict` exits non-zero when any key is empty.
- [ ] T061 [P] [US4] Pest feature `tests/Feature/I18n/EnglishOverrideRendersTest.php` setting `app()->setLocale('en')` for the request lifetime (test-only middleware), filling one English value, and asserting the rendered page shows the English value — proves the pipeline switches when values exist.

### Implementation for User Story 4

- [ ] T062 [P] [US4] Create `app/Console/Commands/I18nScaffoldEn.php` (`php artisan make:command I18nScaffoldEn`). Implement: walk every `*.php` under `lang/es/`, mirror structure into `lang/en/`, preserve existing English values, set missing leaves to `''`. Flags: `--copy` (use Spanish source as starting hint), `--force` (overwrite existing), `--dry-run`.
- [ ] T063 [P] [US4] Create `app/Console/Commands/I18nReport.php` (`php artisan make:command I18nReport`). Implement: walk `lang/<locale>/*.php` (default `en`, all non-default locales when omitted), collect leaves with `''` values (or values equal to the corresponding `lang/es/` leaf when `--copy` was used). Flags: `--locale=`, `--format=text|json`, `--strict`. Deterministic output sort.
- [ ] T064 [US4] Run `php artisan i18n:scaffold-en` to bring `lang/en/` to full parity (replaces the manual mirror from T043 if any).
- [ ] T065 [US4] Run T058–T061 — must all pass.

**Checkpoint**: Translators can take `lang/en/` plus the report and produce English without touching source code.

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: Documentation, formatter pass, and final acceptance.

- [ ] T066 [P] Update `CLAUDE.md` (already pointing to this plan) with a one-line note under "Conventions" stating the i18n helper is the only sanctioned source of user-facing copy (FR-019, FR-010).
- [ ] T067 [P] Update `quickstart.md` if any signature or path drifted during implementation; ensure command examples match shipped Artisan signatures.
- [ ] T068 Run `vendor/bin/pint --dirty --format agent` on every changed PHP file.
- [ ] T069 Run ESLint and Prettier on every changed JS/TS file: `bun x eslint resources/js tools/i18n` and `bun x prettier --check resources/js tools/i18n`.
- [ ] T070 Re-run full suites end-to-end: `php artisan test --compact`, `bun run test:js`, `bun run i18n:audit`. All green.
- [ ] T071 Walk through `quickstart.md` step-by-step adding a synthetic key + call site + audit run; revert. Confirms the documented procedure works for a new contributor (SC-004).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: no deps.
- **Phase 2 (Foundational)**: depends on Phase 1; BLOCKS Phases 3–6.
- **Phase 3 (US1)**: depends on Phase 2.
- **Phase 4 (US2)**: depends on Phase 3 (centralization is verified post-extraction).
- **Phase 5 (US3)**: depends on Phase 2 (audit binary exists); can land in parallel with Phase 3/4 once Phase 2 is done, but its CI assertion (T054) only becomes meaningful after Phase 4.
- **Phase 6 (US4)**: depends on Phase 2; T064 depends on Phase 3 having populated `lang/es/`.
- **Phase 7 (Polish)**: depends on Phases 3–6.

### Within Each Phase

- Tests precede implementation per Constitution II (Red-Green-Refactor).
- Within US1, T025–T033 (translation file population) precede T034–T042 (call-site replacement) so each replacement has a key to point at.

### Parallel Opportunities

- Phase 1: T002, T003 parallel.
- Phase 2 tests: T005–T009 parallel; foundational implementation T013–T014 parallel; scanner sub-tasks T016–T018 parallel after T015.
- Phase 3: T020–T024 parallel; T025–T033 parallel (different domain files); T039–T041 parallel (different directories).
- Phase 4 tests T045–T047 parallel.
- Phase 5 tests T052–T054 parallel.
- Phase 6 tests T058–T061 parallel; commands T062–T063 parallel.
- Polish T066–T067 parallel; T068–T069 parallel.

---

## Parallel Example: User Story 1 extraction

```bash
# Domain file population in parallel (different files):
Task: "T025 [P] Translate lang/es/auth.php / passwords.php / pagination.php"
Task: "T026 [P] Populate lang/es/validation.php"
Task: "T027 [P] Populate lang/es/layout.php"
Task: "T028 [P] Populate lang/es/projects.php"
Task: "T030 [P] Populate lang/es/mailers.php"
Task: "T031 [P] Populate lang/es/notifications.php"
Task: "T032 [P] Populate lang/es/errors.php"
Task: "T033 [P] Populate lang/es/accessibility.php"

# Call-site replacement in parallel (different directories):
Task: "T039 [P] Replace literals in resources/js/pages/**/*.tsx"
Task: "T040 [P] Replace literals in resources/js/components/**/*.tsx"
Task: "T041 [P] Replace literals in resources/js/hooks/**/*.ts and resources/js/lib/**/*.ts"
```

---

## Implementation Strategy

### MVP Scope

US1 (Phase 3) is the MVP. After Phase 3 lands, Spanish UI is unchanged AND every literal lives in `lang/es/`. Stories US2–US4 add the audit guarantee, the regression gate, and the English skeleton; without them the centralization is not enforced and translations cannot start, but the user-visible product behaves correctly.

### Incremental Delivery

1. Setup + Foundational → pipeline online (canary key proves it).
2. US1 → Spanish UI unchanged, every literal in `lang/es/`. Ship.
3. US2 → audit clean; centralization invariant proven.
4. US3 → guardrail merged; trunk protected.
5. US4 → translator-ready skeleton + tooling.
6. Polish.

### Parallel Team Strategy

- After Phase 2: one developer leads Phase 3 (high-volume mechanical extraction; can fan out by domain to T025–T033 and by directory to T039–T041), a second wires Phase 5 (hook + CI), a third builds Phase 6 (Artisan commands). Phase 4 verification runs once Phase 3 closes.

---

## Notes

- TDD is non-negotiable (Constitution v1.2.0 § II). Every implementation task above has at least one failing test landed first.
- Wording is preserved verbatim during extraction (FR-017). If a copy edit appears desirable, file it as a separate change.
- No new runtime dependencies are introduced (Constitution III, plan.md). The audit binary uses Node built-ins only.
- The pre-commit hook MUST NOT be bypassed with `--no-verify` (Constitution v1.2.0 § Development Workflow).
- Don't commit until the user explicitly says so (durable session instruction).
