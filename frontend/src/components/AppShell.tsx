import type { ReactNode } from "react";
import { Navbar } from "./Navbar";

export function AppShell({ children, navigate }: { children: ReactNode; navigate: (path: string) => void }) {
  return (
    <div className="min-h-screen bg-page text-ink">
      <Navbar navigate={navigate} />
      <main>{children}</main>
    </div>
  );
}
