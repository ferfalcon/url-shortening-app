import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logoUrl from "../assets/landing/logo.svg";
import { useAuth } from "../features/auth/use-auth";

const pageLinkClassName =
  "text-[15px] font-bold text-[var(--color-grayish-violet)] transition hover:text-[var(--color-very-dark-blue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]";

const primaryButtonClassName =
  "inline-flex min-h-10 min-w-[104px] items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 py-2 text-[15px] font-bold text-white transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] disabled:cursor-not-allowed disabled:bg-[var(--color-cyan-hover)]";

function getSectionHref(currentPathname: string, hash: string) {
  return currentPathname === "/" ? hash : `/${hash}`;
}

export function LandingHeader() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const location = useLocation();
  const auth = useAuth();
  const featuresHref = getSectionHref(location.pathname, "#features");
  const resourcesHref = getSectionHref(location.pathname, "#resources");
  const topHref = location.pathname === "/" ? "#top" : "/";

  async function handleLogOut() {
    setLogoutError(null);
    setIsLoggingOut(true);

    try {
      await auth.logOut();
      setIsMobileMenuOpen(false);
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : "We couldn't sign you out. Please try again."
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="relative z-20 bg-white" id="top">
      <div className="mx-auto flex max-w-[1110px] items-center gap-8 px-6 pb-4 pt-10 md:pb-8 md:pt-12">
        <a
          aria-label="Shortly home"
          href={topHref}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <img alt="Shortly" className="h-8 w-auto" src={logoUrl} />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          <a className={pageLinkClassName} href={featuresHref}>
            Features
          </a>
          <span className={pageLinkClassName}>Pricing</span>
          <a className={pageLinkClassName} href={resourcesHref}>
            Resources
          </a>
        </nav>

        <div className="ml-auto hidden items-center gap-4 md:flex">
          {auth.status === "loading" ? (
            <span
              aria-live="polite"
              className="text-sm font-bold text-[var(--color-grayish-violet)]"
            >
              Checking session...
            </span>
          ) : auth.isAuthenticated && auth.user ? (
            <>
              <span
                className="max-w-[16rem] truncate text-sm font-bold text-[var(--color-very-dark-violet)]"
                title={auth.user.email}
              >
                {auth.user.email}
              </span>
              <button
                className={primaryButtonClassName}
                disabled={isLoggingOut}
                onClick={() => {
                  void handleLogOut();
                }}
                type="button"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link className={pageLinkClassName} to="/login">
                Login
              </Link>
              <Link className={primaryButtonClassName} to="/signup">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          aria-controls="mobile-navigation"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
          className="ml-auto inline-flex size-10 items-center justify-center text-[var(--color-grayish-violet)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] md:hidden"
          onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="18"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            width="24"
          >
            {isMobileMenuOpen ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {logoutError ? (
        <div className="mx-auto max-w-[1110px] px-6 pb-4">
          <p
            className="rounded-[10px] border border-[rgba(244,98,98,0.25)] bg-[rgba(244,98,98,0.08)] px-4 py-3 text-sm text-[var(--color-red)]"
            role="alert"
          >
            {logoutError}
          </p>
        </div>
      ) : null}

      {isMobileMenuOpen ? (
        <div
          className="mx-auto max-w-[1110px] px-6 pb-8 md:hidden"
          id="mobile-navigation"
        >
          <nav
            aria-label="Mobile primary"
            className="rounded-[10px] bg-[var(--color-dark-violet)] px-6 py-10 text-center text-lg font-bold text-white shadow-[0_24px_48px_rgba(58,48,84,0.18)]"
          >
            <ul className="grid gap-8">
              <li>
                <a
                  className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  href={featuresHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </a>
              </li>
              <li>Pricing</li>
              <li>
                <a
                  className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  href={resourcesHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Resources
                </a>
              </li>
            </ul>

            <div className="mt-8 border-t border-white/25 pt-8">
              {auth.status === "loading" ? (
                <p aria-live="polite" className="text-white/80">
                  Checking session...
                </p>
              ) : auth.isAuthenticated && auth.user ? (
                <div className="grid gap-6">
                  <p className="break-all text-base text-white/85">
                    Signed in as {auth.user.email}
                  </p>
                  <button
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 py-3"
                    disabled={isLoggingOut}
                    onClick={() => {
                      void handleLogOut();
                    }}
                    type="button"
                  >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  <Link
                    className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                    to="/login"
                  >
                    Login
                  </Link>
                  <Link
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 py-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                    to="/signup"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
