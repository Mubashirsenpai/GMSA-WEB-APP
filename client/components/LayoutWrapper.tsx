"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LoginSuccessBanner } from "./LoginSuccessBanner";

const DASHBOARD_PREFIXES = ["/admin", "/pro", "/secretary", "/executive", "/wocom", "/imam"];

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = DASHBOARD_PREFIXES.some((p) => pathname?.startsWith(p));

  return (
    <>
      <LoginSuccessBanner />
      {isDashboard ? (
        <>{children}</>
      ) : (
        <>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </>
      )}
    </>
  );
}
