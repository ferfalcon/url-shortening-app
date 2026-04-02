import { Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-900/10 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Shortly
          </span>
          <span className="text-sm text-slate-600">Workspace foundation</span>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-1 px-6 py-16">
        <Outlet />
      </main>
    </div>
  );
}
