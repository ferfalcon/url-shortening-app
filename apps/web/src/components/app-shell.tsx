import { Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="min-h-screen bg-white text-[var(--color-very-dark-violet)]">
      <Outlet />
    </div>
  );
}
