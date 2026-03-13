"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { DashboardShell } from "@/components/DashboardShell";

const secretaryNav = [
  { href: "/secretary", label: "Dashboard" },
  { href: "/secretary/approvals", label: "Approvals" },
  { href: "/secretary/registrations", label: "Registered members" },
];

export default function SecretaryLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["SECRETARY", "ADMIN"]}>
      <DashboardShell title="Secretary" navItems={secretaryNav}>
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
