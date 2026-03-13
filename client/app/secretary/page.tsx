"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  UserCheck,
  ClipboardList,
  Users,
  UserPlus,
  CalendarCheck,
  BookOpen,
} from "lucide-react";

interface SecretaryStats {
  pendingMembers: number;
  pendingAlumni: number;
  pendingApprovals: number;
  approvedMembers: number;
  approvedAlumni: number;
  eventRegistrations: number;
  madrasaRegistrations: number;
}

const displayCards = [
  { key: "pendingApprovals" as const, href: "/secretary/approvals", label: "Pending approvals", icon: UserCheck, iconColor: "#dc2626", iconBg: "#fee2e2", sub: "members, alumni, events" },
  { key: "approvedMembers" as const, href: "/secretary/registrations", label: "Approved members", icon: Users, iconColor: "#16a34a", iconBg: "#dcfce7" },
  { key: "approvedAlumni" as const, href: "/secretary/registrations", label: "Approved alumni", icon: UserPlus, iconColor: "#0284c7", iconBg: "#e0f2fe" },
  { key: "eventRegistrations" as const, href: "/secretary/registrations", label: "Event registrations", icon: CalendarCheck, iconColor: "#7c3aed", iconBg: "#ede9fe" },
  { key: "madrasaRegistrations" as const, href: "/secretary/registrations", label: "Madrasa registrations", icon: BookOpen, iconColor: "#059669", iconBg: "#d1fae5" },
  { key: "registrations" as const, href: "/secretary/registrations", label: "View all registrations", icon: ClipboardList, iconColor: "#0891b2", iconBg: "#cffafe", noStat: true },
];

export default function SecretaryPage() {
  const [stats, setStats] = useState<SecretaryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<SecretaryStats>("/secretary/stats")
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gmsa-green mb-4">Secretary dashboard</h1>
        <p className="text-gray-500">Loading statistics...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gmsa-green mb-2">Secretary dashboard</h1>
      <p className="text-gray-600 mb-6">
        Overview of registrations and approvals. Click any card to manage that section.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayCards.map(({ key, href, label, icon: Icon, iconColor, iconBg, sub, noStat }) => {
          const value = noStat ? "—" : (stats ? stats[key as keyof SecretaryStats] : 0);
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
              {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
              <p className="text-sm text-gmsa-green mt-2 font-medium">Manage →</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
