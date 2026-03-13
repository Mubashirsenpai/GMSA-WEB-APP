"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { DashboardShell } from "@/components/DashboardShell";

const wocomNav = [
  { href: "/wocom", label: "Dashboard" },
  { href: "/wocom/programs", label: "Ladies programs" },
  { href: "/wocom/taalim", label: "Ladies Ta'alim" },
  { href: "/wocom/discussion", label: "Private discussion" },
];

export default function WocomLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["WOCOM", "ADMIN"]}>
      <DashboardShell title="WOCOM" navItems={wocomNav}>
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
