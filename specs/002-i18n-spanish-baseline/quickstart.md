# Quickstart — Internationalization Foundation (Spanish Baseline)

**Feature**: 002-i18n-spanish-baseline
**Audience**: contributors adding new user-facing strings; reviewers validating PRs.

This is the operational handbook for the i18n system. If you find yourself writing a Spanish string anywhere outside `lang/es/`, stop and consult this document.

---

## TL;DR

1. Add the key to `lang/es/<domain>.php`.
2. Run `php artisan i18n:scaffold-en` to add the same key (empty value) to `lang/en/<domain>.php`.
3. Reference the key from code:
   - **PHP / Blade**: `__('domain.section.key')` or `@lang('domain.section.key')`.
   - **React / TS**: `import { t } from '@/lib/i18n'; t('domain.section.key')`.
4. Run the audit: `bun run i18n:audit`.
5. Commit. The pre-commit hook re-runs ESLint and the audit on staged files.

---

## Adding a new string

### Step 1 — Pick a domain and key

Domains live as files under `lang/es/`. Pick the file that matches your feature surface (`projects.php`, `auth.php`, `mailers.php`, …). If a new feature genuinely warrants a new domain, create a new file in `lang/es/` AND `lang/en/`.

Keys are dotted paths in `snake_case`:
- Good: `projects.timeline.empty_state`, `auth.login.title`, `errors.404.heading`.
- Bad: `projects.timelineEmptyState` (camelCase), `'projects.' . $section . '.title'` (dynamic).

### Step 2 — Author the Spanish value

```php
// lang/es/projects.php
return [
    'timeline' => [
        'empty_state' => 'Todavía no hay actividad en este proyecto.',
        'load_more'   => 'Cargar más',
        'volunteers'  => 'Un voluntario|:count voluntarios',
    ],
];
```

For dynamic content, use `:placeholder` tokens. For pluralization, use the `singular|plural` form (or interval rules — see `contracts/translation-helper.md`).

### Step 3 — Generate the English skeleton entry

```bash
php artisan i18n:scaffold-en
```

This walks `lang/es/` and adds any missing keys to `lang/en/<domain>.php` with empty-string values. Existing English values are preserved. Re-running is safe and idempotent.

### Step 4 — Reference the key from code

**Blade**:
```blade
<h1>{{ __('projects.timeline.empty_state') }}</h1>
<p>@lang('projects.timeline.load_more')</p>
```

**Controller / Form Request / Mailer**:
```php
return back()->with('status', __('projects.actions.started'));

// Form Request
public function messages(): array
{
    return [
        'title.required' => __('validation.projects.title_required'),
    ];
}

// Mailable
$this->subject(__('mailers.welcome.subject'));
```

**React / TS**:
```tsx
import { t, tChoice } from '@/lib/i18n'

export function Timeline({ count }: { count: number }) {
    return (
        <section aria-label={t('accessibility.timeline.region')}>
            <h2>{t('projects.timeline.heading')}</h2>
            {count === 0 ? (
                <p>{t('projects.timeline.empty_state')}</p>
            ) : (
                <p>{tChoice('projects.timeline.volunteers', count, { count })}</p>
            )}
        </section>
    )
}
```

### Step 5 — Audit and commit

```bash
bun run i18n:audit
```

Expected output: `0 finding(s).` Any line of the form `path:line:col` is a real violation — extract that literal into `lang/es/` before committing.

The `.githooks/pre-commit` hook runs ESLint and the audit on the staged subset on every `git commit`. Bypassing with `--no-verify` is a constitutional violation (Constitution v1.2.0 § Development Workflow).

---

## Editing existing copy (no code change)

1. Open `lang/es/<domain>.php`.
2. Edit the value in place.
3. Run the relevant tests (`php artisan test --compact --filter <surface>`) to confirm assertions on Spanish text still pass — if they fail, the assertion needs updating to match the new copy (Constitution II: tests document behavior).
4. Commit.

No other file should need to change. If you find yourself editing a `.tsx` or `.php` to update copy, the string was hard-coded — extract it first.

---

## Pluralization

Server:
```php
trans_choice('projects.timeline.volunteers', $count, ['count' => $count]);
```

Client:
```ts
tChoice('projects.timeline.volunteers', count, { count })
```

Translation source:
```php
'volunteers' => 'Un voluntario|:count voluntarios',
// or with intervals:
'volunteers' => '{0} sin voluntarios|{1} un voluntario|[2,*] :count voluntarios',
```

---

## Interpolation

Server: `__('projects.invite.greeting', ['name' => $user->name])`.
Client: `t('projects.invite.greeting', { name: user.name })`.
Source: `'greeting' => 'Hola, :name.'`.

Tokens are positional-by-name, never positional-by-index. Adding a token to a value is a non-breaking change; removing one is breaking (call sites still pass it but the output no longer interpolates it).

---

## Producing the translator worklist

```bash
php artisan i18n:report                # text, all locales except es
php artisan i18n:report --format=json  # machine-readable
php artisan i18n:report --strict       # exit non-zero if any key untranslated
```

Hand the translator the `lang/en/` directory plus the report output. They edit values; you re-run the report to confirm progress.

---

## Verifying locally

| Check                         | Command                                                  |
|-------------------------------|----------------------------------------------------------|
| Pest test suite               | `php artisan test --compact`                             |
| Vitest test suite             | `bun run test:js`                                        |
| Pint formatter                | `vendor/bin/pint --dirty --format agent`                 |
| ESLint                        | `bun x eslint resources/js`                              |
| i18n audit                    | `bun run i18n:audit`                                     |
| Spanish parity smoke (CI)     | The full Pest browser suite (no test changes required)   |
| English parity (file-set)     | `php artisan test --filter TranslationParityTest`        |

---

## Anti-patterns the audit will block

| Pattern                                                | Fix                                                                       |
|--------------------------------------------------------|---------------------------------------------------------------------------|
| `<button>Iniciar proyecto</button>`                    | `<button>{t('projects.actions.start')}</button>`                          |
| `<input aria-label="Buscar" />`                        | `<input aria-label={t('accessibility.search.input')} />`                  |
| `toast.success('Guardado')`                            | `toast.success(t('common.toasts.saved'))`                                 |
| `return view('home', ['title' => 'Inicio']);`          | `return view('home', ['title' => __('layout.home.title')]);`              |
| `'title.required' => 'El título es obligatorio.'`      | `'title.required' => __('validation.projects.title_required')`            |
| `t('projects.actions.' + action)`                      | `match (action) { 'start' => t('projects.actions.start'), ... }`          |

---

## When the audit produces a false positive

1. Verify the surface really is developer-facing (logs, exceptions, dev-only views, identifiers shown in admin tooling).
2. Add an `allowList` entry to `tools/i18n/audit.config.json` with the **most specific** path and the literal token. Avoid `path: "*"` unless the literal is truly global (brand name).
3. Open the PR; reviewers validate the entry under Constitution VI/SOLID review.

Disabling the audit, weakening its rules, or commenting out call sites is a constitutional change and requires an amendment, not a silent edit.
