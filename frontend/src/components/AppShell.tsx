import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function AppShell({
  children,
  navigate,
  chrome = true
}: {
  children: ReactNode;
  navigate: (path: string) => void;
  chrome?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <Navbar navigate={navigate} />
      <main className="flex-1">{children}</main>
      {chrome && <Footer navigate={navigate} />}
    </div>
  );
}
