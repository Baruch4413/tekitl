<!--
SYNC IMPACT REPORT
==================
Version change: (uninitialized template) → 1.0.0
Bump rationale: Initial ratification of the project constitution. MAJOR per
semver convention for the first stable governance document.

Modified principles:
  - [PRINCIPLE_1_NAME] → I. Community-First Design
  - [PRINCIPLE_2_NAME] → II. Test-First (NON-NEGOTIABLE)
  - [PRINCIPLE_3_NAME] → III. Laravel-Native, Convention Over Custom
  - [PRINCIPLE_4_NAME] → IV. Typed End-to-End
  - [PRINCIPLE_5_NAME] → V. Accessibility & Privacy by Default

Added sections:
  - Technology Constraints (Section 2)
  - Development Workflow (Section 3)
  - Governance

Removed sections: none

Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Constitution Check section already
    references constitution generically; no rewrite required)
  - ✅ .specify/templates/spec-template.md (no constitution-specific gates;
    aligned)
  - ✅ .specify/templates/tasks-template.md (no constitution-specific
    categorization required by current principles)
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

### II. Test-First (NON-NEGOTIABLE)

Pest feature and unit tests MUST be written and demonstrated failing before
the implementation that satisfies them. Every change MUST be programmatically
tested via a new or updated test. `php artisan test --compact` MUST pass
locally and in CI before merge. Verification scripts and manual tinker checks
MUST NOT replace tests when tests are feasible. Rationale: prevents
regressions in a multi-tenant collaboration platform where data correctness
between organizations is critical.

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

Pull requests MUST: (a) include or update Pest tests for changed behavior,
(b) pass `php artisan test --compact`, (c) pass Pint, and (d) reference the
relevant spec directory. Reviews MUST verify constitutional compliance in
addition to correctness.

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

**Version**: 1.0.0 | **Ratified**: 2026-05-01 | **Last Amended**: 2026-05-01
