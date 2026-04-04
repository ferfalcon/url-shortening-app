import { createContext } from "react";
import type { AuthCredentialsInput, AuthenticatedUser } from "../../api/auth";

type AuthStatus = "authenticated" | "loading" | "unauthenticated";

export type AuthContextValue = {
  isAuthenticated: boolean;
  logIn: (input: AuthCredentialsInput) => Promise<AuthenticatedUser>;
  logOut: () => Promise<void>;
  signUp: (input: AuthCredentialsInput) => Promise<AuthenticatedUser>;
  status: AuthStatus;
  user: AuthenticatedUser | null;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
