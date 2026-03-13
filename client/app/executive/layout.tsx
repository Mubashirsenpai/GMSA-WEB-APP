"use client";

import { ExecutiveGuard } from "@/components/ExecutiveGuard";
import { DashboardShell } from "@/components/DashboardShell";

const executiveNav = [
  { href: "/executive", label: "Dashboard" },
  { href: "/executive/meetings", label: "Virtual meetings" },
  { href: "/executive/discussions", label: "Live discussions" },
];

export default function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <ExecutiveGuard>
      <DashboardShell title="Executive" navItems={executiveNav}>
        {children}
      </DashboardShell>
    </ExecutiveGuard>
  );
}
