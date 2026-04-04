import { Outlet } from "react-router-dom";
import { AuthProvider } from "../features/auth/auth-provider";

export function AppShell() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-white text-[var(--color-very-dark-violet)]">
        <Outlet />
      </div>
    </AuthProvider>
  );
}
