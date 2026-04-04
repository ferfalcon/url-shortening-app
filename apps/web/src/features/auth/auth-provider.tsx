import {
  useEffect,
  useRef,
  useState,
  type ReactNode
} from "react";
import {
  fetchCurrentUser,
  logIn as requestLogIn,
  logOut as requestLogOut,
  signUp as requestSignUp,
  type AuthCredentialsInput
} from "../../api/auth";
import { ApiRequestError } from "../../api/api-client";
import { AuthContext } from "./auth-context";

function isUnauthenticatedError(error: unknown) {
  return error instanceof ApiRequestError && error.statusCode === 401;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"authenticated" | "loading" | "unauthenticated">(
    "loading"
  );
  const [user, setUser] = useState<Awaited<ReturnType<typeof fetchCurrentUser>> | null>(
    null
  );
  const requestIdRef = useRef(0);

  useEffect(() => {
    let isActive = true;
    const requestId = requestIdRef.current + 1;

    requestIdRef.current = requestId;

    async function bootstrapAuthState() {
      try {
        const currentUser = await fetchCurrentUser();

        if (!isActive || requestId !== requestIdRef.current) {
          return;
        }

        setUser(currentUser);
        setStatus("authenticated");
      } catch (error) {
        if (!isActive || requestId !== requestIdRef.current) {
          return;
        }

        if (isUnauthenticatedError(error)) {
          setUser(null);
          setStatus("unauthenticated");

          return;
        }

        setUser(null);
        setStatus("unauthenticated");
      }
    }

    void bootstrapAuthState();

    return () => {
      isActive = false;
    };
  }, []);

  async function signUp(input: AuthCredentialsInput) {
    const requestId = requestIdRef.current + 1;

    requestIdRef.current = requestId;

    const nextUser = await requestSignUp(input);

    if (requestId === requestIdRef.current) {
      setUser(nextUser);
      setStatus("authenticated");
    }

    return nextUser;
  }

  async function logIn(input: AuthCredentialsInput) {
    const requestId = requestIdRef.current + 1;

    requestIdRef.current = requestId;

    const nextUser = await requestLogIn(input);

    if (requestId === requestIdRef.current) {
      setUser(nextUser);
      setStatus("authenticated");
    }

    return nextUser;
  }

  async function logOut() {
    const requestId = requestIdRef.current + 1;

    requestIdRef.current = requestId;

    await requestLogOut();

    if (requestId === requestIdRef.current) {
      setUser(null);
      setStatus("unauthenticated");
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: status === "authenticated",
        logIn,
        logOut,
        signUp,
        status,
        user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
