# Shortly URL Shortening App

![Design preview for the original Frontend Mentor challenge](preview.jpg)

This repository turns the Frontend Mentor URL shortening landing page challenge into a portfolio-quality fullstack app.

The current milestone is the initial workspace foundation:

- a `pnpm` monorepo
- a minimal React + TypeScript + Vite frontend in `apps/web`
- a minimal Express + TypeScript API in `apps/api`
- a first backend slice for anonymous link creation using in-memory persistence and a real Spoo.me provider adapter
- a reserved `packages/shared` area for future shared contracts only when they add real value

The original challenge reference assets are preserved in `frontend-mentor/`.

## Project structure

```text
apps/
  api/            Express API scaffold with GET /healthz and POST /api/links
  web/            Minimal React app scaffold with React Router and Tailwind
frontend-mentor/  Original challenge assets and design references
packages/
  shared/         Reserved for future shared types/schemas
```

## Prerequisites

- Node.js 22 or newer
- pnpm 10 or newer

## Getting started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create local env files from the examples:

   ```bash
   cp apps/web/.env.example apps/web/.env
   cp apps/api/.env.example apps/api/.env
   ```

3. Start the workspace:

   ```bash
   pnpm dev
   ```

By default:

- web runs at `http://localhost:5173`
- API runs at `http://localhost:3001`
- health check is available at `http://localhost:3001/healthz`
- link creation is available at `http://localhost:3001/api/links`

## Environment

`apps/web/.env.example`

```bash
VITE_API_BASE_URL=http://localhost:3001
```

`apps/api/.env.example`

```bash
PORT=3001
SPOO_API_BASE_URL=https://spoo.me/api/v1
```

No secrets are required for anonymous Spoo.me link creation.

## Available scripts

From the repository root:

- `pnpm dev` runs the web and API apps in parallel
- `pnpm build` builds all workspace packages that expose a build script
- `pnpm lint` runs linting across workspace packages that expose a lint script
- `pnpm typecheck` runs TypeScript checks across workspace packages that expose a typecheck script

You can also run a single app directly, for example:

```bash
pnpm --filter @shortly/web dev
pnpm --filter @shortly/api dev
```

## What is implemented

- `pnpm` workspace foundation
- root scripts for local development and verification
- minimal React app with React Router and Tailwind configured
- minimal Express API with a thin route/controller/service path for `GET /healthz`
- `POST /api/links` for anonymous link creation with backend Zod validation
- internal short-link provider interface backed by a Spoo.me adapter
- temporary in-memory repository for created links
- basic env examples for web and API
- placeholder folder structure for future feature work

## What is intentionally not implemented yet

- authentication and session handling
- Prisma or database code
- link history/dashboard features
- production deployment setup
- Docker setup
- final landing page UI

## Notes

- `frontend-mentor/` is preserved intentionally as a reference source for the eventual product UI.
- `packages/shared` is intentionally empty for now except for documentation. It should only hold stable shared types, schemas, or tiny utilities that are genuinely shared by both apps.
