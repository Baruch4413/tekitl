# Phase 0 Research — Internationalization Foundation (Spanish Baseline)

**Feature**: 002-i18n-spanish-baseline
**Date**: 2026-05-05

This document records every decision the plan depends on, with rationale and the alternatives considered. There are no remaining `NEEDS CLARIFICATION` markers; the spec's Assumptions section already pins the high-level direction, and the items below pin the concrete mechanics.

---

## R1. Frontend translation delivery

**Decision**: Server-rendered Inertia shared prop named `translations` carrying the active-locale dictionary as a flat or nested object. A typed client helper `t(key, replacements?)` and `tChoice(key, count, replacements?)` reads it via `usePage<SharedProps>().props.translations`.

**Rationale**:
- Zero new dependencies (Constitution III, Spec assumption #2). Inertia shared props are the framework-native channel for server→client data.
- Single source of truth: Spanish strings live in `lang/es/*.php`; both Blade `@lang` and React `t()` resolve to the same array. No duplicated copy in TS modules (FR-003).
- Shared prop is a one-time cost per request; payload is the locale dictionary only (~tens of KB after gzip), which is acceptable since Spanish is the only locale shipped in this feature.

**Alternatives considered**:
- **i18next + react-i18next**: rich, but adds two production deps and a parallel resource layer that duplicates the canonical Laravel files. Rejected per FR-018, Assumption #2, Constitution III.
- **Per-page `usePage().props.t`**: would require every controller to manually pass the dictionary. Rejected — Inertia `share()` in `AppServiceProvider` is the convention.
- **Compiling `lang/es/*.php` into a TS bundle at build time**: avoids the per-request payload but creates a second source of truth and a build-step dependency. Rejected on KISS grounds for a single-locale product.

---

## R2. PHP translation file format

**Decision**: One PHP array file per domain under `lang/<locale>/`, returning a nested associative array. Domains: `auth`, `projects`, `validation`, `mailers`, `notifications`, `layout`, `errors`, `accessibility`, `pagination`, `passwords`. Keys use snake_case dotted paths (e.g., `projects.timeline.empty_state`).

**Rationale**:
- Matches Laravel's bundled convention (`lang/en/auth.php`, `validation.php`, `passwords.php`, `pagination.php` already exist in the repo). Mixing JSON files would create two retrieval paths.
- Per-domain files keep diffs small and reviewable, and let one team member edit `mailers.php` while another edits `projects.php` without merge conflicts.
- Nested arrays group related keys (e.g., `projects.actions.start`, `projects.actions.abort`) without exploding into long flat keys.

**Alternatives considered**:
- **Single `lang/es.json`**: Laravel supports JSON whole-string keys, but it does not support pluralization helpers cleanly and pulls every key for every page. Rejected.
- **Flat `lang/es/messages.php` god file**: violates Constitution VI/SOLID-SRP at the file level; merge conflicts on every PR. Rejected.

---

## R3. Validation messages

**Decision**: Run `php artisan lang:publish` to drop the framework's English source files, then translate to Spanish in `lang/es/validation.php`, `auth.php`, `passwords.php`, `pagination.php`. Keep only the lines that need Tekitl-specific overrides; rely on Laravel's bundled Spanish translations where they already match the current wording.

**Rationale**:
- Laravel ships translated message bundles for many locales including Spanish; reusing them avoids re-authoring hundreds of lines (Constitution III, KISS).
- Form Request `messages()` overrides reference translation keys, not literal strings, so the audit script never has to whitelist them (FR-004).

**Alternatives considered**:
- **Inline custom Spanish in `messages()`**: violates FR-004 and the centralization goal. Rejected.
- **Skip overrides entirely and use bundled defaults**: would change current wording in some flows (FR-017 forbids wording changes). Rejected.

---

## R4. Pluralization & interpolation

**Decision**: Use Laravel's `trans_choice('projects.volunteers', $count, ['count' => $count])` for plural forms and `:placeholder` interpolation for dynamic values. Mirror this on the client through `tChoice(key, count, replacements?)` which performs the same pipe-segmented selection (`'singular|plural'` or `'{0} none|[1,*] :count items'`).

**Rationale**:
- Native to Laravel; survives a future English locale switch without code changes (FR-009, FR-016 edge case).
- The client implementation is a 30-line pure function — easier to test and audit than pulling in `make-plural` or ICU MessageFormat libraries.

**Alternatives considered**:
- **ICU MessageFormat (`@formatjs/intl-messageformat`)**: adds runtime dep, overkill for two locales with simple plural categories. Rejected.
- **String concatenation in code with conditionals**: forbidden by FR-008/FR-009. Rejected.

---

## R5. Locale configuration

**Decision**: Set `config/app.php`:
```php
'locale' => env('APP_LOCALE', 'es'),
'fallback_locale' => env('APP_FALLBACK_LOCALE', 'es'),
'faker_locale' => env('APP_FAKER_LOCALE', 'es_MX'),
```
No locale-switching middleware, no cookie, no `Accept-Language` parsing in this feature.

**Rationale**:
- FR-015 mandates Spanish-only rendering; making it the default and the fallback means a missing key cannot leak English (defense-in-depth for FR-002 and SC-001).
- `faker_locale` aligns factory test data with the rendered locale — keeps existing Spanish test assertions stable (SC-008).

**Alternatives considered**:
- **Keep `locale = 'en'` and inject `App::setLocale('es')` in middleware**: introduces a runtime indirection for no current benefit. Rejected on KISS grounds.

---

## R6. Audit script architecture

**Decision**: A single Node CLI at `tools/i18n/audit.mjs` driven by `tools/i18n/audit.config.json`. The script:

1. Walks file globs from config (`app/**/*.php`, `resources/views/**/*.blade.php`, `resources/js/**/*.{ts,tsx}`, etc.).
2. For each file, runs surface-aware regex/AST checks:
   - **PHP**: flag string literals passed to known user-facing sinks (`view()`, `Inertia::render()` props, `Mail::send()` subjects/bodies, `flash()`, `session()->flash()`, `back()->with()`, `Request::messages()` arrays, `Notification` toArray methods). Logger calls (`Log::*`), exception messages, `dd()`/`dump()`, and command `info()/error()` output are explicitly skipped.
   - **Blade**: flag any non-whitespace text node not wrapped in `{{ __('…') }}` / `@lang` / a known component slot.
   - **TSX/JSX**: flag any string literal child of a JSX element, any string literal in `aria-label`, `aria-description`, `alt`, `title`, `placeholder`, `label`, `description` props, and any string passed to known toast/dialog helpers — except when the literal is exclusively a translation key (passed to `t(…)` / `tChoice(…)`).
3. Honors `audit.config.json.allowList` (file path + token) for brand names ("Tekitl"), code identifiers shown in dev-only views, and intentionally untranslated literals.
4. Exits non-zero with a `path:line:col – message` report on any finding (FR-011, FR-012).

**Rationale**:
- Plain Node + regex/AST is enough for the surface set we own — we do not need a full Babel/PHP-Parser pipeline since the pattern catalog is small and explicit.
- JSON config keeps the rule set version-controlled and reviewable; no plugin system (KISS).
- Living under `tools/i18n/` keeps it co-located with the Artisan commands that share its key catalog.

**Alternatives considered**:
- **`@formatjs/cli` extract**: assumes ICU and i18next conventions. Rejected.
- **Custom ESLint rule**: would only cover JS/TS, not Blade/PHP. Rejected — we need one tool for both halves.
- **`grep`-only pre-commit hook**: too coarse; produces too many false positives on developer-facing strings. Rejected per SC-007.

---

## R7. Pre-commit + CI integration

**Decision**: Append the audit invocation to the existing `.githooks/pre-commit` hook (added in feature 001 follow-up) so it runs after the ESLint stage on any commit that touches the audit's globbed file set. CI runs the same script via `bun run i18n:audit` (npm script wrapper added in `package.json`). The Pest browser/feature CI job is unchanged; it only needs to assert Spanish strings still render, which is already its current behavior.

**Rationale**:
- Single audit binary, two trigger points (FR-011). No duplication.
- Wrapping in a `package.json` script keeps the CI command identical to the local command.
- The pre-commit hook only runs the audit when staged files intersect the configured globs — no cost on PHP-only or unrelated commits.

**Alternatives considered**:
- **Git pre-push hook**: too late; bad commits already exist locally. Rejected.
- **Server-side hook on the remote**: adds ops burden; the Constitution already mandates the local + CI gate. Rejected.

---

## R8. English skeleton generation

**Decision**: Artisan command `php artisan i18n:scaffold-en` mirrors every PHP file under `lang/es/` into `lang/en/`, preserving keys and replacing each scalar value with the empty string `''` (or, when `--copy` flag is passed, with the Spanish source value as a starting hint for the translator). Nested arrays are recursed; existing English values in `lang/en/` are preserved unless `--force`. The command is idempotent and safe to re-run.

**Rationale**:
- Empty strings make missing translations trivially detectable by `i18n:report`.
- Re-runnable mirroring is the simplest way to keep the two trees structurally aligned (FR-013).
- Storing the same key set in both trees lets the parity test compare structure with `array_diff_key` recursively without surprises.

**Alternatives considered**:
- **Runtime fallback to `es` keys for missing `en` values**: hides untranslated keys from the report and risks Spanish leaking into eventual English UI. Rejected per FR-014.
- **Manually authoring both trees**: doomed to drift on every PR. Rejected.

---

## R9. Untranslated-keys report

**Decision**: Artisan command `php artisan i18n:report {--locale=en} {--format=text|json}` walks `lang/<locale>/*.php` recursively, collects every key whose value is `''` or whose value equals the Spanish source (when `--copy` was used during scaffold), and prints them grouped by file. Exit code is non-zero only when `--strict` is passed. Default is informational.

**Rationale**:
- A worklist for translators (FR-014, SC-005) without source-tree access.
- Optional `--strict` mode lets a future workflow gate releases on full English coverage without forcing it in this feature.

**Alternatives considered**:
- **Web UI for translators**: out of scope. Rejected.
- **External SaaS (Crowdin / Phrase)**: dependency addition, not justified for a single-locale product today. Rejected.

---

## R10. Date / number / currency formatting

**Decision**: Server-side formatting goes through `Carbon` with `->locale('es')` (already locale-aware) and Laravel's `Number::format()` helper. Client-side uses `Intl.DateTimeFormat` and `Intl.NumberFormat` with the active locale read from `usePage().props.locale` (also added to the shared-prop set). Existing utility wrappers in `resources/js/lib/utils.ts` (and any project-specific date helpers) are updated to read the active locale instead of hard-coding `'es-MX'`/`'es'`.

**Rationale**:
- `Intl` is built into every supported browser and Node runtime — zero new dependencies.
- Centralizing the locale read at the shared-prop level mirrors the translation pipeline and keeps the client and server in agreement (FR-016).

**Alternatives considered**:
- **`date-fns` + locale modules**: dep additions; not needed for what `Intl` already covers. Rejected.

---

## R11. Test strategy alignment with Constitution Principle II (TDD)

**Decision**: Each functional requirement gets its Red step before the corresponding Green production change:

| Requirement                     | Failing test written first                                              |
|---------------------------------|-------------------------------------------------------------------------|
| FR-001 / SC-001 (Spanish parity)| Pest browser smoke per surface; existing Spanish-text assertions remain |
| FR-002 (no silent fallback)     | Pest unit asserting `__('non.existent')` throws / fails build in CI mode|
| FR-003 (shared payload)         | Pest feature asserting Inertia shared props include `translations`      |
| FR-004 (validation)             | Pest feature: empty Form Request → asserts Spanish `validation.required`|
| FR-007 (a11y strings)           | Vitest + Pest browser asserting `aria-label`s render Spanish            |
| FR-011 (audit gate)             | Pest feature shelling out to `audit.mjs` against `fixtures/violation.tsx`, expecting non-zero exit and the fixture path:line in stdout |
| FR-013 (en skeleton parity)     | Pest unit: `array_keys_recursive(lang/en) === array_keys_recursive(lang/es)` |
| FR-014 (report)                 | Pest feature asserting `php artisan i18n:report --locale=en` lists at least one key when scaffold leaves values empty |
| FR-015 (locale config)          | Pest unit: `config('app.locale') === 'es'` and `fallback_locale === 'es'` |
| FR-020 (existing tests pass)    | CI run of full Pest + Vitest suites with no test edits                   |

**Rationale**: Establishes Red-Green-Refactor traceability for every observable behavior, satisfying Principle II's "credible Red-Green narrative" requirement and giving `/speckit-tasks` a deterministic decomposition target.

**Alternatives considered**:
- **Coverage-only check**: misses behavioral regressions. Rejected.

---

## Open Questions

None. All spec assumptions have a corresponding decision above.
