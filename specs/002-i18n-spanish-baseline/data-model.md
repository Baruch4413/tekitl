# Phase 1 Data Model — Internationalization Foundation (Spanish Baseline)

**Feature**: 002-i18n-spanish-baseline
**Date**: 2026-05-05

This feature introduces no database tables. The "data" lives on disk as PHP arrays and as in-memory shapes flowing across the Inertia boundary. This document captures the entities, their fields, and their invariants.

---

## E1. Translation File (per locale, per domain)

**Storage**: `lang/<locale>/<domain>.php` returning a PHP array.
**Locales**: `es` (populated, source of truth), `en` (skeleton, awaiting translation).
**Domains** (initial set; expandable as extraction proceeds): `auth`, `projects`, `validation`, `mailers`, `notifications`, `layout`, `errors`, `accessibility`, `pagination`, `passwords`.

**Shape**:
```php
return [
    'section' => [
        'subsection' => [
            'key' => 'Texto en español',
            'plural_key' => 'Un voluntario|:count voluntarios',
        ],
        'simple_key' => 'Otra cadena',
    ],
];
```

**Invariants**:
- File MUST `return` an `array`.
- Keys MUST be `snake_case`; nesting MUST mirror the dotted path used in code (`projects.section.subsection.key`).
- Every leaf value MUST be a `string`. No closures, no objects, no integers.
- For locale `es`: every leaf value MUST be non-empty.
- For locale `en`: leaf value MAY be `''` (untranslated) or a string.
- The set of leaf paths in `lang/en/<domain>.php` MUST equal the set of leaf paths in `lang/es/<domain>.php` (parity invariant — enforced by `TranslationParityTest`).

**Validation Rules**:
- Renames are breaking changes: removing a key requires removing every `__('key')` call site in the same PR.
- Adding a key in `lang/es/` REQUIRES adding the same key in `lang/en/` (the `i18n:scaffold-en` command performs this automatically; CI re-runs scaffold and fails if a diff appears).

**State Transitions**:
- `key absent` → `key present in es with Spanish value, present in en with ''` (after extraction or new feature).
- `key present in en with ''` → `key present in en with English value` (manual translation, future).

---

## E2. Translation Key

**Conceptual entity**, materialized as a string used at call sites.

**Fields**:
- **Identifier**: dotted path (`<domain>.<section>.<subsection>...<leaf>`), e.g., `projects.timeline.empty_state`.
- **Domain prefix**: first segment, MUST match a translation file under `lang/<locale>/`.
- **Stability contract**: once published to `main`, the identifier is immutable; renames go through a coordinated migration PR.

**Validation Rules**:
- Identifier MUST resolve at runtime; `FR-002` mandates that an unresolved key surfaces as a build/test failure (`config('app.fallback_locale') === config('app.locale')` makes the fallback identical to the primary, so a missing key returns the literal identifier, which Pest assertions catch).
- Identifier MUST NOT contain user-supplied data — no dynamic keys constructed from request input.

---

## E3. Server-Side Shared Translation Payload

**Lifecycle**: built per request in `AppServiceProvider::boot()` via `Inertia::share('translations', fn () => …)`. Sent only on full-page loads; partial reloads do not refetch unless the prop is included in the `only` list.

**Shape (pseudo-TypeScript for clarity, materialized as PHP `array`)**:
```ts
type TranslationPayload = Record<DomainName, NestedDictionary>
type NestedDictionary = { [key: string]: string | NestedDictionary }
```

**Fields**:
- One top-level key per domain (`auth`, `projects`, …).
- Values are the deep-loaded contents of `lang/<active-locale>/<domain>.php`.

**Invariants**:
- Active locale is `app()->getLocale()`, which is `'es'` in this feature.
- Payload contains ONLY the active-locale dictionary. The skeleton `en/` files are never sent to the client in this feature (FR-015).
- Payload is the canonical source for the client `t()` helper; no other channel ships translations.

---

## E4. Client-Side Translation Helper Surface

**Module**: `resources/js/lib/i18n.ts`.

**Public API** (full contract in `contracts/translation-helper.md`):
```ts
type Replacements = Record<string, string | number>

export function t(key: string, replacements?: Replacements): string
export function tChoice(key: string, count: number, replacements?: Replacements): string
export function useLocale(): string
```

**Internal state**:
- Reads `usePage<SharedProps>().props.translations` (the payload from E3).
- Reads `usePage<SharedProps>().props.locale` for date/number formatting hooks.

**Invariants**:
- `t(key)` performs a deep lookup by dotted path; on miss, returns the key string itself (matching server `__()` behavior) AND emits a `console.error` in non-production builds so the audit and tests catch it.
- `tChoice` parses pipe-delimited rules `'singular|plural'` or interval rules `'{0} none|[1,*] :count items'` identically to Laravel's `trans_choice`.
- Replacements are interpolated with `:placeholder` syntax (matching Laravel) — escaped HTML by default; explicit raw rendering requires `dangerouslySetInnerHTML` at the call site.

---

## E5. Audit Configuration

**Storage**: `tools/i18n/audit.config.json`.

**Shape**:
```json
{
  "include": [
    "app/**/*.php",
    "resources/views/**/*.blade.php",
    "resources/js/**/*.{ts,tsx}"
  ],
  "exclude": [
    "**/node_modules/**",
    "**/vendor/**",
    "tests/**",
    "tools/i18n/fixtures/**"
  ],
  "userFacingPhpSinks": [
    "view", "Inertia::render", "Mail::send", "Mail::to",
    "Notification::send", "flash", "session()->flash",
    "back()->with", "redirect()->with"
  ],
  "userFacingJsxAttrs": [
    "aria-label", "aria-description", "alt", "title",
    "placeholder", "label", "description"
  ],
  "userFacingJsHelpers": [
    "toast", "toast.success", "toast.error", "toast.warning",
    "showDialog", "confirm"
  ],
  "allowList": [
    { "path": "resources/js/components/Brand.tsx", "literal": "Tekitl" },
    { "path": "*", "literal": "Tekitl" }
  ]
}
```

**Invariants**:
- All paths are repository-relative POSIX paths.
- Globs use the same syntax `Glob` understands (no custom matcher).
- `allowList` entries with `path: "*"` apply globally; otherwise the literal must appear in the listed file.
- Adding an entry to `allowList` is a code change that goes through review (Constitution VI/SOLID + Development Workflow).

---

## E6. Untranslated Keys Report

**Producer**: `php artisan i18n:report`.

**Shape (text format)**:
```
lang/en/projects.php:
  projects.timeline.empty_state
  projects.actions.start
  projects.actions.abort
lang/en/auth.php:
  auth.login.title
…
Total untranslated keys: 412
```

**Shape (JSON format)**:
```json
{
  "locale": "en",
  "untranslated": {
    "projects.timeline.empty_state": "lang/en/projects.php",
    "projects.actions.start": "lang/en/projects.php"
  },
  "total": 412
}
```

**Invariants**:
- A key is "untranslated" iff its value in `lang/<locale>/` equals `''` OR (when scaffolded with `--copy`) equals the Spanish source value at the same path.
- Output is deterministic (alphabetical by file, then alphabetical by key) so diffs are reviewable.

---

## Relationships

```text
Translation File (es)  ──── parity ────  Translation File (en)
        │                                       │
        │ build payload                         │ generated/refreshed by
        ▼                                       ▼
Shared Translation Payload          i18n:scaffold-en command
        │
        │ usePage().props.translations
        ▼
Client Translation Helper (t / tChoice)
        ▲
        │ t('domain.section.key')
        │
React Components / Hooks / Utils
        │
        │ scanned by
        ▼
Audit Configuration ──drives──► tools/i18n/audit.mjs ──reports──► CI / pre-commit
                                                          │
                                                          └──► developer fixes call site
```
