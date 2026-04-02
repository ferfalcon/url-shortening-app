import { CreateLinkPanel } from "../features/links/create-link-panel";
import { webEnv } from "../lib/env";

export function HomeRoute() {
  const apiBaseUrl = webEnv.VITE_API_BASE_URL;
  const apiWiringMessage = apiBaseUrl
    ? `VITE_API_BASE_URL is configured as ${apiBaseUrl}. The form below posts to /api/links through that base URL.`
    : "VITE_API_BASE_URL is not set, so local development falls back to the Vite /api proxy targeting http://127.0.0.1:3001.";

  return (
    <section className="grid w-full gap-6">
      <div className="rounded-[2rem] border border-slate-900/10 bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Initial foundation
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Fullstack URL shortening app scaffold
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
          The frontend is wired with React, TypeScript, Vite, Tailwind, and
          React Router. This page now includes the first tiny frontend slice for
          anonymous link creation without jumping into the full landing-page
          build.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[1.5rem] border border-slate-900/10 bg-white/75 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Current app status
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            The workspace is ready for small, reviewable slices of real feature
            work without mixing provider integration, auth, or database concerns
            into the initial scaffold.
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-slate-900/10 bg-white/75 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Environment wiring
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {apiWiringMessage}
          </p>
        </article>
      </div>

      <CreateLinkPanel />
    </section>
  );
}
