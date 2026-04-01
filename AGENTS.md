# AGENTS.md

## Purpose

Use this file to avoid architectural drift, weak assumptions, and low-value complexity while working in this repository.

This project turns the Frontend Mentor **URL shortening API landing page** challenge into a **portfolio-quality fullstack app**.

Optimize for:

- correctness
- clarity
- security
- accessibility
- maintainability
- responsive polish
- review-friendly engineering decisions

Work in **small, safe, reviewable steps**.

---

## Working style

- prefer baby steps over big jumps
- inspect existing files before editing
- match the local code style and patterns
- explain why a change is being made
- avoid speculative rewrites
- do not add complexity without a clear reason
- do not invent product rules that were not agreed
- prefer simple, explicit solutions over clever abstractions
- prefer code that is easy to justify in a code review or interview

When a task is large, split it into milestones and implement the smallest useful slice first.

Do not rename, move, or reorganize files unless the task requires it. Do not mix refactors with feature work unless necessary. Do not fix adjacent issues unless they block the requested task.

---

## Source of truth

When there is ambiguity, follow this order:

1. the current codebase
2. `project_decisions.md`
3. this `AGENTS.md`
4. the smallest change that preserves the current direction

If this file conflicts with implemented code, do not blindly rewrite the app to match the document. First determine whether the code is an intentional evolution.

---

## Product constraints that must not drift

These are persistent project constraints. Task prompts define the work to do. They must not silently override architecture, auth, or product constraints unless the user explicitly changes those decisions.

- anonymous users can shorten links
- anonymous-created links have no owner and cannot be claimed later
- authenticated users can view and delete only their own links
- deleting a link removes it from our app records only; provider-side deletion is not guaranteed
- redirect execution is provider-owned in v1
- metrics are provider-based when available, not first-party analytics owned by our app
- editing links after creation is out of scope
- password reset is out of scope
- email verification is out of scope
- public sign up is allowed

If implementation pressure makes one of these inconvenient, preserve the rule and find another solution.

---

## Stack

Do not change major stack choices unless explicitly asked.

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Hook Form
- Zod
- React Router

### Backend

- Node.js
- TypeScript
- Express
- Zod
- Prisma

### Database

- PostgreSQL

### Infra / DX

- pnpm workspaces
- Docker
- Render
- Neon

Important:

- auth uses database-backed server sessions with an HttpOnly cookie
- provider is **Spoo.me**, but the app must not be coupled to Spoo.me request/response shapes

---

## Monorepo and architecture boundaries

Expected top-level structure:

```text
apps/
  web/
  api/
packages/
  shared/
```

### Responsibility of each area

- `apps/web`: React frontend
- `apps/api`: Express backend
- `packages/shared`: only truly shared types, schemas, and tiny utilities with clear cross-app value

### `packages/shared` rule

`packages/shared` is not a dumping ground.

Good candidates:

- stable shared Zod schemas
- stable DTO types
- tiny utilities used by both apps

Do not move code there just to make the tree look cleaner.

Do not put these there:

- provider adapters
- backend services
- database code
- frontend-only helpers

### Mental model

- domain and product logic belong to us
- public short URL and redirect execution belong to the provider
- provider integration is an infrastructure concern

### Required provider isolation

You must:

- define an internal provider interface
- implement real providers through adapters
- normalize provider responses into app-shaped results
- keep provider-specific code out of frontend code
- keep provider-specific code out of route handlers when possible

You must not:

- return raw Spoo.me responses as the app contract unless already normalized
- import provider-specific types into UI code
- let React components know how the provider works
- let the provider dictate the internal domain model

### Required request flow

```text
frontend form
→ frontend validation
→ API request
→ backend validation
→ service logic
→ provider and database interaction
→ normalized response
→ UI update
```

Do not skip layers casually.

---

## Folder direction

Follow the current codebase first. If the structure is still being built, prefer this direction.

### Frontend (`apps/web`)

Organize around routes, features, reusable UI, forms, and API-facing utilities.

Example direction:

```text
apps/web/src/
  app/
  routes/
  features/
    auth/
    links/
    landing/
  components/
  forms/
  api/
  lib/
  types/
```

Frontend rules:

- keep page and route modules focused on orchestration
- keep presentational components mostly presentation-focused
- keep form logic near the feature that owns the form
- use React Hook Form + Zod for forms
- use React Router data APIs and mutation patterns when they keep the code straightforward
- prefer small API helpers over adding a large data layer
- do not add TanStack Query by default for this project
- do not mix provider details into UI props or UI state

### Backend (`apps/api`)

Organize around routes, controllers, services, repositories, providers, schemas, middleware, and config/lib utilities.

Example direction:

```text
apps/api/src/
  app/
  routes/
  controllers/
  services/
  repositories/
  providers/
    interfaces/
    adapters/
  schemas/
  middleware/
  lib/
  config/
```

Backend rules:

- keep routes thin
- keep controllers thin
- put business rules in services
- put persistence logic in repositories
- put third-party integration in provider adapters
- normalize external errors into app-friendly errors
- prefer boring, readable Express patterns
- avoid class-heavy designs unless the existing code clearly uses them

---

## Auth and security

### Required auth model

- use database-backed server sessions
- store an opaque session ID in an HttpOnly cookie
- persist sessions in PostgreSQL
- protected frontend routes rely on the authenticated server session
- logout revokes the server-side session and clears the cookie

### Do not do this

- do not switch to JWT in localStorage
- do not treat auth as purely frontend state
- do not store sensitive auth material in browser-accessible storage

### Cross-origin requirements

Frontend and API are separate services.

Therefore:

- API must support credentialed requests from the frontend origin
- CORS must be configured intentionally
- cookie settings must work in local development and production
- state-changing requests need CSRF protection
- SameSite settings must be chosen for the actual deployment model

When changing auth behavior, always think about:

- cookie flags
- CORS
- request credentials mode
- CSRF
- environment-specific origins

---

## UI and accessibility rules

Always account for:

- semantic HTML
- keyboard accessibility
- visible focus states
- proper labels
- loading, error, and empty states
- graceful missing-data handling
- mobile-first responsive behavior

Do not trade accessibility or clarity for visual cleverness.

---

## Validation rules

Validation exists at more than one layer.

### Frontend validation

Use it for:

- immediate user feedback
- basic form UX
- obvious required-field and format checks

### Backend validation

Always validate again on the backend.

Use Zod at boundaries for:

- request bodies
- query params when needed
- route inputs and outputs when useful
- normalized provider results when useful

Do not trust the frontend.

---

## Implementation rules

### General

- use TypeScript consistently
- prefer explicit types at boundaries
- keep functions focused
- choose descriptive names
- prefer composition over indirection-heavy abstractions
- avoid magic strings when a typed constant or schema improves clarity
- keep diffs small and focused
- preserve the agreed architecture
- follow existing naming patterns
- add comments only when they add real value

### Frontend

- do not put business logic in presentational components
- do not let giant route files become the whole app
- do not couple UI directly to raw fetch responses if a small mapper improves clarity
- keep Tailwind readable; extract repeated patterns only when it clearly helps

### Backend

- do not put business logic directly in Express routes
- do not let controllers become mini-services
- do not leak Prisma details into unrelated layers when a repository boundary already exists
- do not leak provider-specific errors straight to the client if they need normalization

### Dependencies

- prefer existing dependencies when they already solve the problem well
- do not add a package for a tiny problem
- if you add a package, it must be clearly justified
- do not add a state-management or data-fetching library by default unless explicitly requested or clearly necessary
- do not add a framework abstraction layer over Express unless explicitly requested

---

## Environment and deployment

This app must work in both local development and production.

Important realities:

- frontend and API are separate services
- auth depends on credentialed cross-origin requests
- Render and Neon are intended deployment targets
- Docker should support realistic local parity
- secrets and URLs must come from environment variables

Rules:

- never hard-code production URLs
- never hard-code secrets
- avoid hard-coded localhost assumptions in reusable config
- prefer explicit environment variables with clear names
- document new environment variables when adding them
- if you add or change environment variables, scripts, setup steps, or architectural conventions, update the relevant docs in the same task when appropriate

---

## Workflow for each task

Before editing:

1. inspect the relevant files
2. understand the local pattern
3. identify the smallest safe change
4. preserve architecture boundaries

When implementing:

1. confirm the domain behavior
2. update or add validation and types
3. implement backend behavior
4. wire frontend integration
5. add or update tests
6. run verification
7. summarize what changed and any important tradeoff

For larger work:

- split it into milestones
- implement one milestone at a time
- do not mix unrelated refactors into feature work

---

## Verification and reporting

For meaningful changes, verify as much as the repository supports.

Preferred commands:

```bash
pnpm install
pnpm -r lint
pnpm -r typecheck
pnpm -r test
pnpm -r build
```

If the repo uses different script names, use the existing ones.

Rules:

- do not claim a command passed if it was not run
- if a command fails, report the real failure clearly
- add or update tests when behavior changes
- prefer focused tests near the changed behavior
- test auth-sensitive behavior carefully
- test provider normalization and failure paths where practical

When presenting a change, briefly explain:

- what changed
- why it changed
- what files were touched
- any tradeoff or follow-up worth noting

Do not hide uncertainty.

---

## Priority order

When tradeoffs appear, prioritize:

1. correctness
2. clarity
3. security
4. accessibility
5. maintainability
6. design polish
7. reuse

---

## If unsure

Choose the simpler solution that is:

- consistent with the agreed architecture
- secure enough for the scope
- accessible
- maintainable
- easy to justify in an interview

---

## Common mistakes to avoid

Do not:

- couple the frontend directly to Spoo.me
- return raw provider shapes as the app contract without normalization
- put business logic in React components
- put business logic directly in Express routes
- turn `packages/shared` into random storage
- replace server sessions with client-stored JWTs
- add features that contradict agreed constraints
- make broad stylistic rewrites unrelated to the task
- hard-code environment-specific URLs
- introduce a dependency just to avoid writing a small amount of clear code
- pretend unverified code is working

---

## Commit style

When suggesting commits, use Conventional Commits.

Examples:

- `feat(api): add create-link service`
- `fix(web): send credentials with session request`
- `refactor(api): extract spoo adapter`
- `test(api): cover link ownership rules`
- `docs: clarify local setup`

---

## Definition of done

A change is closer to done when it:

- respects the agreed product constraints
- preserves provider isolation
- works with session and cookie auth
- validates inputs at the correct boundaries
- handles loading, error, and empty states where relevant
- is small enough to review confidently
- has been verified as much as the repo supports
