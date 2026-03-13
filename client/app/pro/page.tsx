"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Megaphone,
  Calendar,
  Image,
  FileText,
  FileStack,
  ClipboardList,
} from "lucide-react";

interface ProStats {
  events: number;
  announcements: number;
  blogPosts: number;
  galleryAlbums: number;
  timetables: number;
}

const displayCards = [
  { key: "announcements" as const, href: "/pro/announcements", label: "Announcements", icon: Megaphone, iconColor: "#dc2626", iconBg: "#fee2e2" },
  { key: "events" as const, href: "/pro/events", label: "Events", icon: Calendar, iconColor: "#ea580c", iconBg: "#ffedd5" },
  { key: "galleryAlbums" as const, href: "/pro/gallery", label: "Gallery albums", icon: Image, iconColor: "#7c3aed", iconBg: "#ede9fe" },
  { key: "timetables" as const, href: "/pro/timetables", label: "Prayer timetables", icon: FileText, iconColor: "#059669", iconBg: "#d1fae5" },
  { key: "blogPosts" as const, href: "/pro/blog", label: "Blog posts", icon: FileStack, iconColor: "#db2777", iconBg: "#fce7f3" },
  { key: "registrations" as const, href: "/pro/registrations", label: "Registrations", icon: ClipboardList, iconColor: "#16a34a", iconBg: "#dcfce7", noStat: true },
];

export default function ProPage() {
  const [stats, setStats] = useState<ProStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<ProStats>("/pro/stats")
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gmsa-green mb-4">PRO dashboard</h1>
        <p className="text-gray-500">Loading statistics...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gmsa-green mb-2">PRO dashboard</h1>
      <p className="text-gray-600 mb-6">
        Overview of content you manage. Click any card to create, edit, or delete items.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayCards.map(({ key, href, label, icon: Icon, iconColor, iconBg, noStat }) => {
          const value = noStat ? "—" : (stats ? stats[key as keyof ProStats] : 0);
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
                {!noStat && (
                  <span className="text-2xl font-bold text-gray-900 tabular-nums">{value}</span>
                )}
              </div>
              <h2 className="font-semibold text-gray-900 mt-3">{label}</h2>
              <p className="text-sm text-gmsa-green mt-2 font-medium">Manage →</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
