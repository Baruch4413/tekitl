# Contract — Inertia Shared Translation Payload

**Feature**: 002-i18n-spanish-baseline
**Producer**: `App\Providers\AppServiceProvider::boot()`
**Consumer**: every Inertia page via `usePage<SharedProps>().props`.

---

## Producer

```php
// app/Providers/AppServiceProvider.php (boot)
Inertia::share([
    'translations' => fn () => $this->loadTranslationsForLocale(app()->getLocale()),
    'locale' => fn () => app()->getLocale(),
]);
```

Where `loadTranslationsForLocale($locale)` returns an associative array keyed by domain, deep-loaded from `lang/<locale>/*.php`.

### Invariants

1. The closure form (`fn () => …`) MUST be used so the payload is built lazily per request.
2. The shared payload MUST contain ONLY the active-locale dictionary; the `en/` skeleton is never included while it is empty (FR-015).
3. Domain files MUST be discovered automatically by listing `lang/<locale>/*.php` — no hard-coded list — so adding a new domain file does not require touching the provider.
4. Payload MUST be cached only via Laravel's translator (which already memoizes loaded files); no manual caching layer in this feature.

### Performance Notes

- All domain files together are estimated < 100 KB pre-gzip; payload is sent on full-page loads only. Inertia partial reloads MUST exclude `translations` from `only` lists unless a translation file changed mid-request (it does not in this feature).

---

## Consumer

### Inertia partial reloads

When calling `router.reload({ only: ['someProp'] })`, the consumer SHOULD NOT include `'translations'` in `only`. The dictionary is stable for the lifetime of a session, so re-fetching is wasted bandwidth.

### Type narrowing

```ts
import { usePage } from '@inertiajs/react'
import type { SharedProps } from '@/types/inertia'

const { translations, locale } = usePage<SharedProps>().props
```

### Read access

Reads are O(1) (object key access by domain) plus O(depth) for nested lookups; depth is bounded (≤ 4 in current key catalog). The `t()` helper performs the walk.

---

## Failure Modes

| Failure                                       | Detection                                                                                                                 |
|-----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| Provider not registered                       | Pest feature `SharedTranslationsTest` asserts Inertia response includes `translations` key on at least one route          |
| Wrong locale leaked                           | `LocaleConfigTest` asserts `app.locale === 'es'`; the shared closure reads `app()->getLocale()` so wrong locale is caught |
| Domain file missing                           | `TranslationParityTest` runs structural diff against `lang/es/` and fails before the closure is hit                       |
| Payload size regression                       | Out of scope for this feature; future feature can add a size budget assertion if needed                                   |
