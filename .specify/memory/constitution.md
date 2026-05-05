<!--
SYNC IMPACT REPORT
==================
Version change: 1.1.0 → 1.2.0
Bump rationale: Reframed Principle II from "Test-First" to explicit
"Test-Driven Development (TDD) (NON-NEGOTIABLE)" with the Red-Green-
Refactor cycle and frontend Vitest coverage; added an automated lint gate
(pre-commit hook) to the Development Workflow. MINOR per semver convention
because the existing Test-First obligation already covered the new TDD
requirements — this amendment expands and clarifies rather than redefines.

Modified principles:
  - I. Community-First Design (unchanged)
  - II. Test-First → II. Test-Driven Development (NON-NEGOTIABLE)
    (renamed and expanded to mandate Red-Green-Refactor cycle and to cover
    frontend Vitest tests in addition to Pest)
  - III. Laravel-Native, Convention Over Custom (unchanged)
  - IV. Typed End-to-End (unchanged)
  - V. Accessibility & Privacy by Default (unchanged)
  - VI. Code Hygiene: DRY, SOLID, KISS (unchanged)

Added sections:
  - Development Workflow → "Automated Lint Gate" subsection mandating the
    `.githooks/pre-commit` ESLint hook activated via `core.hooksPath`.

Removed sections: none

Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Constitution Check section
    references constitution generically; will pick up the renamed
    principle and lint gate on next plan run; no template rewrite required)
  - ✅ .specify/templates/spec-template.md (no constitution-specific gates;
    aligned)
  - ✅ .specify/templates/tasks-template.md (no per-principle categorization
    required)
  - ⚠ pending: CLAUDE.md / docs — runtime guidance does not yet cite the
    constitution explicitly; may be cross-linked in a future amendment

Follow-up TODOs: none
-->

# Tekitl Constitution

Tekitl is a non-profit collaboration social network connecting non-profit
organizations and contributors so they can plan, coordinate, and share work.

## Core Principles

### I. Community-First Design

Every feature MUST serve genuine collaboration between non-profit actors and
their contributors. Dark patterns, engagement-extraction mechanics, attention
maximizers, and growth tactics that compromise user trust are prohibited.
Where a tradeoff exists between user wellbeing and platform metrics, user
wellbeing wins. Rationale: Tekitl exists for the people and organizations it
serves, not for the platform itself; this principle is the lens for every
product decision.

### II. Test-Driven Development (NON-NEGOTIABLE)

All production code MUST be produced via the Red-Green-Refactor cycle:

1. **Red.** Write a failing Pest (backend) or Vitest (frontend) test that
   captures the next slice of behavior. Run it and observe it fail with a
   meaningful assertion error — not a syntax or import error. Failing-by-
   construction MUST be demonstrated before any production code is written.
2. **Green.** Write the minimum production code required to make the new
   test pass. No speculative branches, no extra features, no premature
   abstraction (this also enforces Principles VI/KISS).
3. **Refactor.** With the suite green, improve names, structure, and
   duplication; rerun tests after each refactor step. Refactors that change
   behavior require a new Red step, not edits to the existing test.

Every change — backend or frontend — MUST be programmatically covered. For
backend work, `php artisan test --compact` MUST pass locally and in CI
before merge. For frontend work, `bun run test:js` (Vitest) MUST pass; UI
that crosses the page boundary additionally requires a Pest browser test.
Verification scripts and manual tinker checks MUST NOT replace tests when
tests are feasible. Pull requests that introduce production code without
the corresponding test commit history (or a test added in the same PR with
a credible Red-Green narrative) MUST be rejected.

Rationale: TDD prevents regressions in a multi-tenant collaboration
platform where data correctness between organizations is critical, keeps
the design pressure on small testable units (reinforcing Principle VI),
and produces an executable specification of behavior alongside the code.

### III. Laravel-Native, Convention Over Custom

Use the framework as designed. Eloquent models and relationships are
preferred over `DB::` raw queries; Form Requests are required for validation;
named routes and `route()` are required for backend URL generation;
configuration MUST be read via `config()` (never `env()` outside `config/`);
queued jobs MUST use `ShouldQueue` for time-consuming work; authorization
MUST go through gates and policies. Parallel structures that duplicate
framework features (custom routers, custom containers, hand-rolled auth) are
prohibited unless justified in the Complexity Tracking section of the plan.
Rationale: keeps the codebase legible to any Laravel developer, minimizes
maintenance surface, and avoids reinventing audited framework behavior.

### IV. Typed End-to-End

Backend routes consumed by the frontend MUST be referenced through Wayfinder
imports from `@/actions/` (controllers) or `@/routes/` (named routes). String
URL construction in TypeScript/React is prohibited. React page and component
props MUST be typed; Inertia page props MUST flow through generated types
where Wayfinder provides them. Rationale: a typed bridge between Laravel and
React is the cheapest defense against URL drift, parameter mistakes, and
silent breakage during refactors.

### V. Accessibility & Privacy by Default

User-facing surfaces MUST target WCAG 2.1 AA. Personally identifiable
information MUST be minimized at collection: do not store data the platform
does not need. Cross-organization data sharing requires explicit, revocable
consent recorded as data, not as policy. New features that collect or expose
PII MUST document the data flow in their spec and pass review before merge.
Rationale: non-profits handle sensitive constituent and donor data; defaults
that protect users and organizations are non-negotiable for the trust the
platform requires.

### VI. Code Hygiene: DRY, SOLID, KISS

All production code MUST observe the following design discipline; reviewers
and `/speckit-plan` Constitution Check MUST flag deviations.

**DRY (Don't Repeat Yourself).** Domain knowledge MUST have a single
authoritative representation. Duplicated logic across controllers, services,
or React components MUST be extracted (Eloquent scopes, Form Requests,
Action classes, custom hooks, shared TS types from Wayfinder) once it
recurs a third time or once divergence would create a correctness risk.
Copy-paste across modules without an extraction plan is prohibited.
Configuration values MUST live in `config/` and be read via `config()`;
literal duplication of strings, magic numbers, or URLs across files is a
violation. Note: premature abstraction is itself a DRY violation —
extraction MUST follow real duplication, not anticipated duplication.

**SOLID.** New classes and modules MUST respect:
- *Single Responsibility*: a class/function does one thing; controllers
  delegate to services, jobs, or actions rather than absorbing business
  logic. Fat controllers and god models are prohibited.
- *Open/Closed*: extension via composition, policies, events, or strategy
  classes is preferred over editing stable shared code paths.
- *Liskov Substitution*: subclasses and trait users MUST honor the parent
  contract; no surprise behavior changes when substituted.
- *Interface Segregation*: prefer small, focused interfaces over wide ones;
  consumers MUST NOT depend on methods they do not use.
- *Dependency Inversion*: depend on abstractions (interfaces, contracts,
  the service container) rather than concrete classes; resolve through
  Laravel's container, not via `new` for services with collaborators.

**KISS (Keep It Simple).** The simplest design that satisfies the spec wins.
Speculative configurability, plugin systems, and abstraction layers added
"for the future" are prohibited; build them when a second concrete
caller materializes. Cyclomatic complexity, deep inheritance, and clever
one-liners that obscure intent MUST be refactored in favor of straight-line
code with descriptive names. When two designs are equivalent, prefer fewer
files, fewer indirections, and framework-native primitives (per Principle
III).

Rationale: a small team maintaining a multi-tenant collaboration platform
cannot afford the maintenance tax of duplicated logic, tangled
responsibilities, or speculative complexity. These three principles are the
floor of professional code quality and the lens through which `/speckit-plan`
and reviewers MUST evaluate every change. Justified deviations MUST be
recorded in the plan's Complexity Tracking section.

## Technology Constraints

The supported stack is PHP 8.5, Laravel 12, Inertia.js v2, React 19,
TypeScript, Tailwind CSS v4, and Pest 4. Wayfinder, Fortify, and Socialite
are first-class. The Laravel Boost MCP server is the preferred path for
Artisan, documentation lookup, and database/browser introspection during
development.

Dependency additions, removals, or major-version upgrades MUST be approved
before merge. Laravel Pint is the canonical formatter — `vendor/bin/pint
--dirty --format agent` MUST be run before finalizing changes.

The Laravel 12 streamlined structure (middleware in `bootstrap/app.php`,
console commands auto-discovered, no `app/Http/Kernel.php`) MUST be honored;
do not reintroduce legacy structure.

## Development Workflow

Feature work follows the spec-kit flow:
`/speckit-specify` → `/speckit-clarify` (when needed) → `/speckit-plan` →
`/speckit-tasks` → `/speckit-implement`. Each step writes its artifacts under
the feature's `specs/<dir>/` directory.

`/speckit-plan` MUST execute a Constitution Check against this document and
record any deviations in the plan's Complexity Tracking section with explicit
justification. Unjustified violations block the plan.

Pull requests MUST: (a) include or update Pest and/or Vitest tests for
changed behavior, (b) pass `php artisan test --compact`, (c) pass
`bun run test:js` when frontend code is changed, (d) pass Pint, (e) pass
ESLint with no errors, and (f) reference the relevant spec directory.
Reviews MUST verify constitutional compliance in addition to correctness.

### Automated Lint Gate

The repository ships a tracked `.githooks/pre-commit` hook that runs ESLint
against the staged JavaScript and TypeScript files and aborts the commit on
any error. The hook is activated automatically by the `prepare` npm script,
which sets `core.hooksPath` to `.githooks` after dependency install; it is
also enforceable manually via `git config --local core.hooksPath .githooks`.

- The hook MUST NOT be bypassed with `--no-verify` except for emergency
  hotfixes that are followed by a corrective commit on the same branch.
- ESLint configuration changes MUST be reviewed under the same standard as
  any other code change; weakening rules to silence violations is
  prohibited unless the rule itself is justified-as-incorrect in the PR.
- Removing, disabling, or short-circuiting the hook is a constitutional
  change and requires a constitution amendment, not a silent edit.

Rationale: putting the lint gate at the commit boundary catches violations
before they reach review or CI, keeps the trunk green, and reinforces
Principle VI (code hygiene) automatically rather than relying on reviewer
vigilance.

## Governance

This constitution supersedes ad-hoc conventions and informal practices.
Amendments are proposed via pull request that updates this file and includes
a Sync Impact Report covering version change, principle deltas, and template
impact. Versioning follows semantic versioning:

- **MAJOR**: backward-incompatible removal or redefinition of a principle or
  governance rule.
- **MINOR**: new principle or section, or materially expanded guidance.
- **PATCH**: clarifications, wording fixes, non-semantic refinements.

Compliance is reviewed at every pull request. The `/speckit-plan` workflow
is the primary enforcement point for new feature work; reviewers are the
enforcement point for ad-hoc changes. Complexity that violates a principle
MUST be justified in writing or removed.

**Version**: 1.2.0 | **Ratified**: 2026-05-01 | **Last Amended**: 2026-05-05
