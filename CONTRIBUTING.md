# Contributing to Tekitl

## Adding a new string

User-facing copy (Spanish or any other locale) MUST live in `lang/<locale>/`. Hard-coded literals in PHP, Blade, or React are blocked by the i18n audit (`bun run i18n:audit`) and rejected at the pre-commit hook plus CI.

1. Add the key to `lang/es/<domain>.php` (e.g., `lang/es/projects.php`). Keys are dotted paths in `snake_case`.
2. Run `php artisan i18n:scaffold-en` to mirror the key into `lang/en/<domain>.php` with an empty value.
3. Reference the key from code:
   - **PHP / Blade**: `__('domain.section.key')` or `@lang('domain.section.key')`.
   - **React / TS**: `import { t, tChoice } from '@/lib/i18n'` then `t('domain.section.key')`.
4. Run `bun run i18n:audit`; expect `0 finding(s).`
5. Commit. The pre-commit hook re-runs ESLint and the audit on the staged subset.

Full procedure, plural rules, allow-list policy, and false-positive handling: [`specs/002-i18n-spanish-baseline/quickstart.md`](specs/002-i18n-spanish-baseline/quickstart.md).

The translation helper contract (signatures, failure modes, type surface): [`specs/002-i18n-spanish-baseline/contracts/translation-helper.md`](specs/002-i18n-spanish-baseline/contracts/translation-helper.md).
