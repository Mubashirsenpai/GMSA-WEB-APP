"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { DashboardShell } from "@/components/DashboardShell";

const proNav = [
  { href: "/pro", label: "Dashboard" },
  { href: "/pro/announcements", label: "Announcements" },
  { href: "/pro/events", label: "Events" },
  { href: "/pro/registrations", label: "Registrations" },
  { href: "/pro/sms", label: "Bulk SMS" },
  { href: "/pro/gallery", label: "Gallery" },
  { href: "/pro/timetables", label: "Timetables" },
  { href: "/pro/blog", label: "Blog posts" },
];

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["PRO", "ADMIN"]}>
      <DashboardShell title="PRO" navItems={proNav}>
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
