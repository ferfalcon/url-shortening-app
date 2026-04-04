import { Navigate, useNavigate } from "react-router-dom";
import type { AuthCredentialsInput } from "../../api/auth";
import { LandingHeader } from "../../components/landing-header";
import { AuthForm } from "./auth-form";
import { useAuth } from "./use-auth";

type AuthPageMode = "login" | "signup";

export function AuthPage({ mode }: { mode: AuthPageMode }) {
  const navigate = useNavigate();
  const auth = useAuth();

  if (auth.status === "authenticated") {
    return <Navigate replace to="/" />;
  }

  async function handleSubmit(input: AuthCredentialsInput) {
    if (mode === "login") {
      await auth.logIn(input);
    } else {
      await auth.signUp(input);
    }

    navigate("/", { replace: true });
  }

  return (
    <>
      <LandingHeader />
      <main className="min-h-[calc(100vh-6rem)] bg-[var(--color-surface)] px-6 py-12 md:py-20">
        <div className="mx-auto flex max-w-[1110px] justify-center">
          <AuthForm
            isAuthBootstrapLoading={auth.status === "loading"}
            mode={mode}
            onSubmit={handleSubmit}
          />
        </div>
      </main>
    </>
  );
}
