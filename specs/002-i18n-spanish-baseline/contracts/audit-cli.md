# Contract — i18n Audit CLI

**Feature**: 002-i18n-spanish-baseline
**Binary**: `tools/i18n/audit.mjs` (Node ESM, no dependencies beyond Node 20 built-ins)
**Wrapper**: `bun run i18n:audit` (npm script)

---

## Invocation

```bash
# Default: scan all files matching audit.config.json include globs
bun run i18n:audit

# Restrict to a list of paths (used by the pre-commit hook on staged files)
bun run i18n:audit -- path/to/file.tsx path/to/another.php

# Emit machine-readable findings
bun run i18n:audit -- --format=json

# Use a non-default config file (testing only)
bun run i18n:audit -- --config=tests/fixtures/audit.test-config.json
```

### Arguments

| Flag                  | Type        | Default                          | Purpose                                              |
|-----------------------|-------------|----------------------------------|------------------------------------------------------|
| positional paths      | `string[]`  | `[]` (use config globs)          | Restrict scan to this set                            |
| `--format`            | `text\|json`| `text`                           | Output format                                        |
| `--config`            | `string`    | `tools/i18n/audit.config.json`   | Path to ruleset                                      |
| `--allow-list-add`    | (excluded)  | —                                | Editing the allow-list goes through code review only |

---

## Exit Codes

| Code | Meaning                                                                |
|------|------------------------------------------------------------------------|
| `0`  | No findings; all scanned files clean                                   |
| `1`  | One or more findings (literal user-facing strings outside translations)|
| `2`  | Configuration error (config missing/invalid, glob fails)               |
| `3`  | Internal error (file read failure, regex compile failure)              |

---

## Output

### Text (default)

```
resources/js/components/ProjectCard.tsx:42:25  literal in JSX child:        "Iniciar proyecto"
resources/js/components/ProjectCard.tsx:48:42  literal in aria-label:       "Cerrar formulario"
app/Http/Requests/StoreProjectRequest.php:18:13  literal in messages():     "El título es obligatorio."

3 finding(s). Extract these into lang/es/<domain>.php and reference via __() / t().
```

Lines have the shape `path:line:col  <surface>:  <literal>`. The trailing summary line is mandatory.

### JSON (`--format=json`)

```json
{
  "findings": [
    {
      "path": "resources/js/components/ProjectCard.tsx",
      "line": 42,
      "column": 25,
      "surface": "jsx-child",
      "literal": "Iniciar proyecto"
    }
  ],
  "total": 1,
  "config": "tools/i18n/audit.config.json"
}
```

---

## Surface Detection

The audit recognizes three categories. A literal is flagged iff it lands in a "user-facing" surface AND is not whitelisted by `allowList` AND is not already wrapped in a translation helper.

### PHP

| Surface          | Detection                                                                                                              |
|------------------|------------------------------------------------------------------------------------------------------------------------|
| `controller-render`  | Argument to `view(…, [...])` data array, `Inertia::render(…, [...])` props array — string-typed values flag             |
| `request-messages`   | Return value of `messages()` method on a `FormRequest` subclass                                                         |
| `mailer-subject`     | Argument to `->subject(…)` on `Mailable` subclasses                                                                     |
| `mailer-body`        | Static text in mail Markdown views (handled via Blade scanner, see below)                                              |
| `notification`       | Static strings in `toMail`/`toDatabase`/`toArray` array values on `Notification` subclasses                            |
| `flash`              | Argument to `flash()`, `session()->flash()`, `back()->with()`, `redirect()->with()` when the value is a string literal |

### Blade

Any non-whitespace text node in `*.blade.php` that:
- is not inside a `{{ __('…') }}` / `@lang(…)` / `<x-trans />` component slot, and
- is not inside a comment, and
- is not inside a `<script>` / `<style>` / `<pre><code>` block.

### TSX/JSX

| Surface              | Detection                                                                                |
|----------------------|------------------------------------------------------------------------------------------|
| `jsx-child`          | String literal as a JSX text child of any element                                        |
| `jsx-attribute`      | String literal value of `aria-label`, `aria-description`, `alt`, `title`, `placeholder`, `label`, `description` |
| `helper-call`        | String literal as first arg to `toast`, `toast.success`, `toast.error`, `toast.warning`, `showDialog`, `confirm` |

A literal is *not* flagged when:
- it is the key argument to `t(…)` or `tChoice(…)` (e.g., `t('projects.actions.start')`),
- it matches an entry in `audit.config.json.allowList`,
- the file path matches `audit.config.json.exclude`.

---

## Performance Budget

- Full repository scan MUST complete in under 30 seconds in CI (SC-003), measured on the same runner that executes `bun run test:js`.
- Pre-commit invocation MUST complete in under 5 seconds when called on a staged file set ≤ 50 files.

---

## Pre-commit Hook Integration

The existing `.githooks/pre-commit` hook (added in feature 001 follow-up) appends, after the ESLint stage:

```bash
# i18n audit on staged user-facing files
mapfile -t i18n_staged < <(git diff --cached --name-only --diff-filter=ACMR \
    -- '*.php' '*.blade.php' '*.tsx' '*.ts' '*.jsx' '*.js')

if [ "${#i18n_staged[@]}" -gt 0 ]; then
    if command -v bun >/dev/null 2>&1; then
        bun run i18n:audit -- "${i18n_staged[@]}"
    else
        echo "[pre-commit] ERROR: 'bun' not found; cannot run i18n audit." >&2
        exit 1
    fi
fi
```

The block reuses the same `--` option-injection guard pattern that the ESLint stage already uses (CodeRabbit finding fixed in feature 001).

---

## Failure Modes & Test Coverage

| Failure                                       | Detection                                                                                                |
|-----------------------------------------------|----------------------------------------------------------------------------------------------------------|
| New literal added in JSX                      | Pest `AuditScriptTest` runs the binary on `tools/i18n/fixtures/violation.tsx`, expects exit 1 + path:line |
| New literal added in PHP controller           | Same test extended with a `.php` fixture                                                                 |
| Audit accidentally flags log/exception text   | Same test with a `developer-strings.php` fixture, expects exit 0 (SC-007 zero false positives)           |
| Allow-list ignored                            | Test asserts brand literal "Tekitl" passes scan when allow-listed                                        |
| Audit slower than budget                      | CI job duration metric; if regressed, treat as a blocker                                                 |
