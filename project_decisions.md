# URL Shortening App — Project Decisions

## Scope

- Public landing page.
- URL shortener form.
- Provider-owned public redirect behavior through the external short URL.
- Backend API.
- Database.
- Custom alias.
- Basic validation.
- Redirect safety rules.
- Link list/history.
- Basic link metrics/history, using provider-based redirect or stats data where applicable.
- Metrics are provider-based where available, not full first-party analytics owned by our app.
- User accounts.
- Public sign up allowed.
- Anonymous users can shorten links.
- History and management features are reserved for authenticated users.
- Authenticated users can view and delete their own links.
- Deleting a link removes it from our app's records/history only; provider-side deletion is not guaranteed.
- Editing links after creation is not supported.
- Anonymous-created links are stored without a user owner.
- Anonymous-created links cannot be claimed later.
- Authentication and protected routes.
- Login, sign up, and logout are in scope.
- Password reset and email verification are out of scope.
- Private dashboard/list view, but not a full analytics dashboard.
- Link ownership rules for authenticated and anonymous usage.
- Rate limiting.
- Better error handling.
- Provider failure handling.
- Production-ready structure.
- Admin/debug-friendly API.
- Logging and health checks.
- Better testing story.

## Repository

- Canonical repository: https://github.com/ferfalcon/url-shortening-app
- Default branch: main

## Stack

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

### Infrastructure / DX

- pnpm workspaces
- Docker
- Render
- Neon

## Architecture

- Monorepo with separate frontend and backend apps.
- The app must be independent of any specific URL shortening provider.
- The provider is treated as an infrastructure dependency, not as part of the core domain.
- We define our own internal provider interface and map external providers through adapters.
- Switching providers later should not require major refactoring.
- Start with Spoo.me as the v1 provider.
- Do not tightly couple the app to Spoo.me request/response shapes.
- Our app owns the product logic and records: users, auth, stored links, ownership, history, validation, rate limiting, and API behavior.
- Spoo.me owns the public short URL and redirect execution in this project.
- The project prioritizes third-party API integration over owning the redirect namespace.
- Use React Router’s data APIs and mutation patterns for frontend data loading.

### Project structure

- `apps/web` for the React frontend.
- `apps/api` for the Express backend.
- `packages/shared` only for truly shared types and schemas when they add real value.
- Keep provider integrations and backend business logic inside the API app, not in the shared package.

### Folder architecture

- Frontend should be organized around routes, features, reusable UI components, forms, and API-facing utilities.
- Backend should be organized around routes, controllers, services, repositories, providers, schemas, middleware, and shared config/lib utilities.
- Keep the provider adapter behind the backend service layer so the frontend never depends on provider details.

### Authentication

- Use database-backed server sessions.
- Store an opaque session ID in an HttpOnly cookie.
- Persist sessions in PostgreSQL so sessions can be validated and revoked server-side.
- Use cookie-based auth for the web app instead of JWT in localStorage.
- Protected frontend routes should rely on the authenticated server session.
- Logout should revoke the server-side session and clear the cookie.

### Deployment and auth boundary

- Frontend and API are separate apps/services.
- The API must explicitly support credentialed requests from the frontend origin.
- Cookie-based auth, CORS, and environment configuration must be designed to work in both local development and production.

### Security

- Use SameSite cookie protections plus CSRF protection for state-changing requests.

### Request flow

- Frontend form → frontend validation → API request → backend validation → service logic → provider/database → normalized response → UI update

