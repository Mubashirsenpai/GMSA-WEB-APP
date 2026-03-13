"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { DashboardShell } from "@/components/DashboardShell";

const imamNav = [
  { href: "/imam", label: "Dashboard" },
  { href: "/imam/khutbah", label: "Khutbah" },
  { href: "/imam/learning", label: "Learning materials" },
  { href: "/imam/courses", label: "Courses" },
];

export default function ImamLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["IMAM", "ADMIN"]}>
      <DashboardShell title="Imam" navItems={imamNav}>
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
