"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Users,
  UserCircle,
  Megaphone,
  Calendar,
  Image,
  FileText,
  BookOpen,
  ScrollText,
  FileStack,
  UserCheck,
  ClipboardList,
  MessageSquare,
  Banknote,
} from "lucide-react";

interface AdminStats {
  users: number;
  executives?: number;
  events: number;
  announcements: number;
  blogPosts: number;
  galleryAlbums: number;
  timetables: number;
  khutbahMaterials: number;
  learningMaterials: number;
  pendingMembers: number;
  pendingAlumni: number;
  pendingApprovals: number;
  approvedMembers: number;
  suggestions: number;
  donations: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<AdminStats>("/admin/stats")
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gmsa-green mb-4">Admin dashboard</h1>
        <p className="text-gray-500">Loading statistics...</p>
      </div>
    );
  }

  const displayCards = [
    { key: "users" as const, href: "/admin/users", label: "Users & roles", icon: Users, iconColor: "#2563eb", iconBg: "#dbeafe" },
    { key: "executives" as const, href: "/admin/executives", label: "Executive board", icon: UserCircle, iconColor: "#166534", iconBg: "#dcfce7" },
    { key: "announcements" as const, href: "/admin/announcements", label: "Announcements", icon: Megaphone, iconColor: "#dc2626", iconBg: "#fee2e2" },
    { key: "events" as const, href: "/admin/events", label: "Events", icon: Calendar, iconColor: "#ea580c", iconBg: "#ffedd5" },
    { key: "galleryAlbums" as const, href: "/admin/gallery", label: "Gallery albums", icon: Image, iconColor: "#7c3aed", iconBg: "#ede9fe" },
    { key: "timetables" as const, href: "/admin/timetables", label: "Prayer timetables", icon: FileText, iconColor: "#059669", iconBg: "#d1fae5" },
    { key: "khutbahMaterials" as const, href: "/admin/khutbah", label: "Khutbah materials", icon: ScrollText, iconColor: "#0d9488", iconBg: "#ccfbf1" },
    { key: "learningMaterials" as const, href: "/admin/learning", label: "Learning materials", icon: BookOpen, iconColor: "#ca8a04", iconBg: "#fef9c3" },
    { key: "blogPosts" as const, href: "/admin/blog", label: "Blog posts", icon: FileStack, iconColor: "#db2777", iconBg: "#fce7f3" },
    { key: "pendingApprovals" as const, href: "/admin/approvals", label: "Pending approvals", icon: UserCheck, iconColor: "#0284c7", iconBg: "#e0f2fe", sub: "members, alumni, events" },
    { key: "approvedMembers" as const, href: "/admin/registrations", label: "Registered members", icon: ClipboardList, iconColor: "#16a34a", iconBg: "#dcfce7" },
    { key: "suggestions" as const, href: "/admin/suggestions", label: "Suggestions", icon: MessageSquare, iconColor: "#0891b2", iconBg: "#cffafe" },
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gmsa-green mb-2">Admin dashboard</h1>
      <p className="text-gray-600 mb-6">
        Overview of your association data. Click any card to manage that section (create, edit, delete).
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayCards.map(({ key, href, label, icon: Icon, sub, iconColor, iconBg }) => {
          const value = stats ? stats[key] : 0;
          return (
            <Link
              key={key}
              href={href}
              className="card p-5 hover:shadow-md transition flex flex-col"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: iconBg, color: iconColor }}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900 tabular-nums">{value}</span>
              </div>
              <h2 className="font-semibold text-gray-900 mt-3">{label}</h2>
              {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
              <p className="text-sm text-gmsa-green mt-2 font-medium">Manage →</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-2">Quick links</h2>
        <p className="text-sm text-gray-600 mb-3">
          Use the sidebar or the cards above to open each section. There you can create new items, edit, or delete existing ones.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/approvals" className="text-sm text-gmsa-green hover:underline font-medium">Approvals</Link>
          <span className="text-gray-300">·</span>
          <Link href="/admin/registrations" className="text-sm text-gmsa-green hover:underline font-medium">Registered members</Link>
        </div>
      </div>
    </div>
  );
}
