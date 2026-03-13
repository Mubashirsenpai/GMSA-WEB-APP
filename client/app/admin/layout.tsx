"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { DashboardShell } from "@/components/DashboardShell";

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users & roles" },
  { href: "/admin/executives", label: "Executive board" },
  { href: "/admin/donations", label: "Donations" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/timetables", label: "Timetables" },
  { href: "/admin/khutbah", label: "Khutbah" },
  { href: "/admin/learning", label: "Learning" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/approvals", label: "Approvals" },
  { href: "/admin/registrations", label: "Registered members" },
  { href: "/admin/suggestions", label: "Suggestions" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <DashboardShell title="Admin" navItems={adminNav}>
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
