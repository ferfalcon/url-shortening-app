import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { ApiRequestError } from "../api/api-client";
import { fetchMyLinks, type CreatedLink } from "../api/links";
import { LandingHeader } from "../components/landing-header";
import { useAuth } from "../features/auth/use-auth";

type LoadingState = {
  status: "idle" | "loading";
  links: CreatedLink[];
  errorMessage: null;
};

type SuccessState = {
  status: "success";
  links: CreatedLink[];
  errorMessage: null;
};

type ErrorState = {
  status: "error";
  links: CreatedLink[];
  errorMessage: string;
};

type MyLinksState = LoadingState | SuccessState | ErrorState;

function formatCreatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

const cardClassName =
  "rounded-[14px] border border-[rgba(59,48,84,0.08)] bg-white p-5 shadow-[0_14px_32px_rgba(58,48,84,0.06)]";

export function MyLinksRoute() {
  const auth = useAuth();
  const location = useLocation();
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<MyLinksState>({
    status: "idle",
    links: [],
    errorMessage: null
  });

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.user) {
      return;
    }

    let isActive = true;

    setState({
      status: "loading",
      links: [],
      errorMessage: null
    });

    async function loadLinks() {
      try {
        const links = await fetchMyLinks();

        if (!isActive) {
          return;
        }

        setState({
          status: "success",
          links,
          errorMessage: null
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        const errorMessage =
          error instanceof ApiRequestError
            ? error.message
            : "We couldn't load your links. Please try again.";

        setState({
          status: "error",
          links: [],
          errorMessage
        });
      }
    }

    void loadLinks();

    return () => {
      isActive = false;
    };
  }, [auth.isAuthenticated, auth.user, reloadToken]);

  if (auth.status === "loading") {
    return (
      <>
        <LandingHeader />
        <main className="min-h-[calc(100vh-6rem)] bg-[var(--color-surface)] px-6 py-12 md:py-16">
          <div className="mx-auto max-w-[1110px]">
            <div className={cardClassName}>
              <p aria-live="polite" className="text-sm text-[var(--color-grayish-violet)]">
                Checking your session...
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!auth.isAuthenticated || !auth.user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return (
    <>
      <LandingHeader />
      <main className="min-h-[calc(100vh-6rem)] bg-[var(--color-surface)] px-6 py-12 md:py-16">
        <div className="mx-auto grid max-w-[1110px] gap-6">
          <section className={cardClassName}>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-cyan)]">
                  Account history
                </p>
                <h1 className="mt-2 text-[32px] leading-tight font-bold text-[var(--color-very-dark-violet)]">
                  My Links
                </h1>
                <p className="mt-3 max-w-[40rem] text-base leading-7 text-[var(--color-grayish-violet)]">
                  Links created while signed in appear here. Anonymous links stay
                  ownerless and do not show up in this history.
                </p>
              </div>

              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-gray)] px-5 py-2 text-sm font-bold text-[var(--color-very-dark-violet)] transition hover:border-[var(--color-dark-violet)] hover:text-[var(--color-dark-violet)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
                to="/"
              >
                Create another link
              </Link>
            </div>
          </section>

          {state.status === "loading" || state.status === "idle" ? (
            <section className={cardClassName}>
              <p aria-live="polite" className="text-sm text-[var(--color-grayish-violet)]">
                Loading your links...
              </p>
            </section>
          ) : null}

          {state.status === "error" ? (
            <section className={cardClassName}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-[var(--color-red)]" role="alert">
                  {state.errorMessage}
                </p>
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 py-2 text-sm font-bold text-white transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
                  onClick={() => setReloadToken((currentValue) => currentValue + 1)}
                  type="button"
                >
                  Try again
                </button>
              </div>
            </section>
          ) : null}

          {state.status === "success" && state.links.length === 0 ? (
            <section className={cardClassName}>
              <h2 className="text-xl font-bold text-[var(--color-very-dark-violet)]">
                No saved links yet
              </h2>
              <p className="mt-3 max-w-[36rem] text-base leading-7 text-[var(--color-grayish-violet)]">
                Shorten a link while signed in and it will appear here automatically.
              </p>
            </section>
          ) : null}

          {state.status === "success" && state.links.length > 0 ? (
            <section className="grid gap-4" aria-label="Your saved links">
              {state.links.map((link) => (
                <article className={cardClassName} key={link.id}>
                  <dl className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <div className="min-w-0">
                      <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-grayish-violet)]">
                        Original URL
                      </dt>
                      <dd className="mt-2 break-all text-sm leading-6 text-[var(--color-very-dark-violet)]">
                        <a
                          className="underline decoration-[var(--color-cyan)] decoration-2 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
                          href={link.originalUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {link.originalUrl}
                        </a>
                      </dd>
                    </div>

                    <div className="min-w-0">
                      <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-grayish-violet)]">
                        Short URL
                      </dt>
                      <dd className="mt-2 break-all text-sm leading-6 text-[var(--color-cyan)]">
                        <a
                          className="underline decoration-current decoration-2 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
                          href={link.shortUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {link.shortUrl}
                        </a>
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-grayish-violet)]">
                        Custom alias
                      </dt>
                      <dd className="mt-2 text-sm leading-6 text-[var(--color-very-dark-violet)]">
                        {link.customAlias ?? "Auto-generated"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-grayish-violet)]">
                        Created
                      </dt>
                      <dd className="mt-2 text-sm leading-6 text-[var(--color-very-dark-violet)]">
                        {formatCreatedAt(link.createdAt)}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}
