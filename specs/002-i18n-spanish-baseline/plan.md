# Implementation Plan: Internationalization Foundation (Spanish Baseline)

**Branch**: `002-i18n-spanish-baseline` | **Date**: 2026-05-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/002-i18n-spanish-baseline/spec.md`

## Summary

Extract every user-facing string from the codebase (Blade, controllers, Form Requests, mailers, notifications, Inertia React components, hooks, utils) into Laravel's native translation files under `lang/es/` (Spanish, populated) and `lang/en/` (skeleton, awaiting manual translation). Spanish remains the only rendered locale. The frontend receives the active-locale dictionary as an Inertia shared prop and reads it through a thin typed `t()` helper backed by Laravel's `__()`/`trans_choice()` server-side. An audit script (Node CLI) scans the source tree for residual user-facing literals and runs at the pre-commit hook plus CI. No new runtime dependencies.

## Technical Context

**Language/Version**: PHP 8.5 / TypeScript 5 / Node 20 (Bun)
**Primary Dependencies**: Laravel 12, Inertia.js v2, React 19, Tailwind v4, Wayfinder, Pest 4, Vitest. **No new runtime dependencies.** Audit script uses Node built-ins only (`fs`, `path`, `process`); pattern config is plain JSON.
**Storage**: N/A (translations live as PHP arrays under `lang/<locale>/*.php`; no DB tables)
**Testing**: Pest 4 (feature + browser) for server-rendered/Blade/email assertions; Vitest for React components consuming the shared `translations` prop; new Pest test asserting the audit script flags a synthetic violation; new Pest test asserting `lang/en/` mirrors `lang/es/` key set.
**Target Platform**: Linux server (web), modern browsers (SPA via Inertia)
**Project Type**: Web application (single repo: Laravel backend + Inertia React frontend)
**Performance Goals**: Audit run < 30s on CI per SC-003; translation lookup is O(1) array access in PHP and object lookup in JS — no measurable runtime overhead vs current literal strings.
**Constraints**: Spanish wording MUST be preserved verbatim (FR-017, no copy edits). Spanish is the only rendered locale (FR-015); English is structural only. Zero new dependencies (Constitution III: Convention Over Custom; Spec assumption #2). Audit MUST distinguish developer-facing strings (logs, exceptions, Artisan output, comments) from user-facing surfaces (FR-018).
**Scale/Scope**: ~50 React page/component files + ~30 controllers/Form Requests/mailers/notifications already in tree. Estimated 400–800 user-facing strings to extract. Translation file layout: one PHP file per domain (`auth`, `projects`, `validation`, `mailers`, `layout`, `errors`, `accessibility`, `pagination`, `passwords`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluated against Tekitl Constitution v1.2.0:

- **I. Community-First Design** — PASS. Centralized translations are a precondition for serving non-Spanish-speaking non-profit communities later; this feature itself preserves the current Spanish UX exactly (FR-017, SC-001). No engagement mechanics introduced.
- **II. Test-Driven Development (NON-NEGOTIABLE)** — PASS. Each user story has a failing-test entry point: (US1) Pest browser/feature tests asserting Spanish strings continue to render unchanged; (US2) Pest test calling the audit script against a synthetic violation fixture, expecting non-zero exit and a file:line pointer; (US3) same audit-script test extended to assert the pre-commit + CI integration; (US4) Pest test asserting `lang/en/` key set equals `lang/es/` key set and `i18n:report` Artisan command lists outstanding keys. Existing Pest/Vitest assertions on Spanish text remain valid (Assumption #7, SC-008) — no test rewrites.
- **III. Laravel-Native, Convention Over Custom** — PASS. Uses framework-bundled translation system (`__()`, `trans()`, `trans_choice()`, `lang/<locale>/*.php`), framework-bundled validation translations (Laravel ships Spanish for `validation.php` via `php artisan lang:publish`), Inertia shared props for client delivery, Artisan commands (`i18n:scaffold-en`, `i18n:report`) for tooling. No third-party i18n library, no hand-rolled router/container/auth.
- **IV. Typed End-to-End** — PASS. Client-side `t()` helper is typed against a `TranslationKey` union generated from `lang/es/` at build time (or a structural `Record<string, string>` shape with key-existence checks in dev). React props for `translations` flow through the standard Inertia `usePage<SharedProps>()` pattern. No string URL construction.
- **V. Accessibility & Privacy by Default** — PASS. Story scope explicitly includes `aria-label`, `sr-only`, `alt`, and form `<label>` (FR-007, edge cases). No new PII collection.
- **VI. Code Hygiene: DRY, SOLID, KISS** — PASS. Translation extraction is a *direct* DRY win: every duplicated literal collapses to a single key. Helpers are thin wrappers over framework primitives (KISS). No speculative configurability — no locale switcher, no per-tenant overrides, no namespacing layer beyond per-domain files (KISS, defer until a second concrete caller). The audit ruleset is plain JSON, not a plugin system.

**Technology Constraints** — PASS. No dependency additions. PHP 8.5 / Laravel 12 / Inertia v2 / React 19 / TS / Pest 4 stack honored. Pint MUST be run on changed PHP files.

**Development Workflow** — PASS. Audit integrates with the existing `.githooks/pre-commit` hook (added in feature 001 follow-up) by appending an audit invocation alongside ESLint. CI lint gate per Constitution Development Workflow rules (a)–(f) is satisfied. No constitution amendment required.

**Result**: All gates pass. No entries needed in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-i18n-spanish-baseline/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── translation-helper.md
│   ├── shared-payload.md
│   └── audit-cli.md
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

Single Laravel + Inertia project. No new top-level directories. Additions and edits land in existing trees:

```text
lang/
├── es/                          # NEW — populated Spanish source of truth
│   ├── auth.php
│   ├── projects.php
│   ├── validation.php           # overrides only the lines Tekitl customizes
│   ├── mailers.php
│   ├── notifications.php
│   ├── layout.php
│   ├── errors.php               # 404/403/419/500 + runtime exception copy
│   ├── accessibility.php        # aria-label / sr-only / alt
│   ├── pagination.php
│   └── passwords.php
└── en/                          # SKELETON — same key set, empty/placeholder values
    └── (mirror of es/)

config/
└── app.php                      # EDIT — flip `locale` to `es`, `fallback_locale` to `es`

app/
├── Http/
│   ├── Controllers/             # EDIT — replace literals with __() / trans()
│   └── Requests/                # EDIT — Form Request messages() use trans keys
├── Mail/                        # EDIT — subjects + Markdown views via trans()
├── Notifications/               # EDIT — same
├── Console/Commands/
│   ├── I18nScaffoldEn.php       # NEW — generate/refresh lang/en/ skeleton
│   └── I18nReport.php           # NEW — list keys missing English values
└── Providers/
    └── AppServiceProvider.php   # EDIT — Inertia::share('translations', …)

resources/
├── views/                       # EDIT (Blade, including emails) — @lang / __()
└── js/
    ├── lib/
    │   └── i18n.ts              # NEW — typed t() / tChoice() client helpers
    ├── pages/                   # EDIT — replace JSX literals with t('key')
    └── components/              # EDIT — same

tools/
└── i18n/
    ├── audit.mjs                # NEW — Node CLI scanning for residual literals
    ├── audit.config.json        # NEW — file globs, allow-list, surface rules
    └── fixtures/
        └── violation.tsx        # NEW — synthetic positive case for tests

tests/
├── Feature/
│   └── I18n/
│       ├── LocaleConfigTest.php          # NEW — locale/fallback both 'es'
│       ├── TranslationParityTest.php     # NEW — en/ key set == es/ key set
│       ├── AuditScriptTest.php           # NEW — invokes audit.mjs on fixture
│       └── ReportCommandTest.php         # NEW — i18n:report exit code + output
└── js/
    └── lib/
        └── i18n.test.ts                  # NEW — t() / tChoice() unit tests

.githooks/
└── pre-commit                   # EDIT — append audit invocation after ESLint
```

**Structure Decision**: Single existing project. The translation source-of-truth lives in `lang/es/` (framework convention). No new top-level directory is introduced; `tools/i18n/` is a sub-tree of the existing developer-tooling area (created on demand). The Inertia shared-prop strategy keeps client code dependency-free and avoids parallel copy in TS modules (Constitution III).

## Complexity Tracking

> No constitutional violations to justify. Section intentionally empty.
