# Contract — Translation Helpers

**Feature**: 002-i18n-spanish-baseline
**Surfaces**: server-side PHP, client-side TS/React.

This contract is the *only* sanctioned way for application code to obtain a user-facing string (FR-010). It applies equally to Blade templates, controllers, Form Requests, mailers, notifications, React components, hooks, and utilities.

---

## Server-side (PHP)

### `__($key, $replacements = [], $locale = null): string`

Framework-bundled. Returns the string at `lang/<locale>/<file>.<dotted.path>`.

- **`$key`**: `domain.section.key` (e.g., `'projects.actions.start'`).
- **`$replacements`**: associative array; keys map to `:placeholder` tokens in the value.
- **`$locale`**: omit to use the active app locale.

**Failure mode**: if the key does not resolve, `__()` returns the key string itself. Because `app.fallback_locale` is also `es`, the only time this happens is when a key is genuinely missing — which the test suite catches (FR-002).

### `trans_choice($key, $count, $replacements = [], $locale = null): string`

Framework-bundled. Resolves pluralization via pipe-delimited or interval-based rules. Use whenever copy depends on a count.

- **`$key`**: dotted path to a plural-form value, e.g., `'projects.volunteers'`.
- **`$count`**: integer used to select the form.
- **`$replacements`**: same semantics as `__()`. By convention, include `'count' => $count`.

### `@lang('key', ['name' => $name])` (Blade directive)

Equivalent to `__()` for Blade templates. Either form is acceptable; pick the one already used in the surrounding file.

### Constraints

- `__()` / `trans_choice()` MUST receive a string literal as the key. Constructing keys via concatenation or interpolation defeats the audit and is prohibited (`'projects.' . $action` → use a switch/match that yields a literal key).
- Form Request `messages()` arrays MUST return translation keys, never literal strings.
- Mail/Notification subjects MUST be set via `$this->subject(__('mailers.welcome.subject'))`.

---

## Client-side (TS/React)

### `t(key: string, replacements?: Record<string, string | number>): string`

**Module**: `resources/js/lib/i18n.ts`.

**Inputs**:
- `key`: dotted path matching the server-side translation key, e.g., `'projects.actions.start'`.
- `replacements` (optional): map of `:placeholder` tokens → values.

**Output**: the resolved Spanish string, with placeholders interpolated.

**Behavior**:
1. Read `translations` from `usePage<SharedProps>().props.translations`.
2. Walk the dotted path; if any segment is missing, `console.error` (non-production) and return the key string verbatim.
3. Replace each `:token` in the value with `String(replacements[token])`. Unreplaced tokens remain literal.

**Constraints**:
- `key` MUST be a string literal at the call site (no template literals). Enforced by the audit (`audit.mjs` flags non-literal keys).
- `t()` MUST NOT be called outside a React render path — it depends on `usePage()`. For non-component code, accept the resolved string as a function argument.

### `tChoice(key: string, count: number, replacements?: Record<string, string | number>): string`

Same shape as `t()` plus the count selector. Implements the same pipe-segmented and interval-based rule grammar as Laravel's `trans_choice`:

- `'singular|plural'` — `count === 1` selects left, otherwise right.
- `'{0} ninguno|{1} uno|[2,*] :count'` — interval matches.

**Constraints**:
- Pass `count` as `replacements.count` whenever the value uses `:count`.
- Mirrors the server-side `trans_choice` outputs byte-for-byte for any given key + count.

### `useLocale(): string`

Returns the active locale from `usePage<SharedProps>().props.locale`. Used by `Intl.DateTimeFormat` / `Intl.NumberFormat` consumers.

---

## Type Surface

```ts
// resources/js/types/inertia.d.ts (extended)
import type { PageProps } from '@inertiajs/core'

export type TranslationDictionary = {
    [key: string]: string | TranslationDictionary
}

export interface SharedProps extends PageProps {
    translations: Record<string, TranslationDictionary>
    locale: string
}
```

The `t()` and `tChoice()` helpers narrow the `key: string` parameter; a strict typed-key variant generated from `lang/es/` is a future enhancement (out of scope for this feature, per KISS).

---

## Failure Modes & Test Coverage

| Failure                             | Detection                                                                      |
|-------------------------------------|--------------------------------------------------------------------------------|
| Missing key in `lang/es/`           | Pest browser/feature test asserting Spanish text fails (returns literal key)   |
| Missing key in `lang/en/`           | `TranslationParityTest` fails                                                  |
| Non-literal key passed to `t()`     | `audit.mjs` flags it; pre-commit + CI block the commit                         |
| Missing `:placeholder` value        | Visual regression in tests; `t()` leaves the literal `:placeholder` in output  |
| Hardcoded literal at JSX call site  | `audit.mjs` flags it                                                           |
| Mismatch server vs client wording   | Cannot occur — both resolve from the same `lang/es/` array via the shared prop |
