"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Calendar,
  MessageCircle,
  BookOpen,
} from "lucide-react";

interface WocomStats {
  ladiesPrograms: number;
  ladiesTaalimSessions: number;
  ladiesDiscussionMessages: number;
}

const displayCards = [
  { key: "ladiesPrograms" as const, href: "/wocom/programs", label: "Ladies programs", icon: Calendar, iconColor: "#db2777", iconBg: "#fce7f3" },
  { key: "ladiesTaalimSessions" as const, href: "/wocom/taalim", label: "Ladies Ta'alim", icon: BookOpen, iconColor: "#7c3aed", iconBg: "#ede9fe" },
  { key: "ladiesDiscussionMessages" as const, href: "/wocom/discussion", label: "Private discussion", icon: MessageCircle, iconColor: "#059669", iconBg: "#d1fae5", sub: "Ladies-only chat" },
];

export default function WocomPage() {
  const [stats, setStats] = useState<WocomStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<WocomStats>("/wocom/stats")
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gmsa-green mb-4">WOCOM dashboard</h1>
        <p className="text-gray-500">Loading statistics...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gmsa-green mb-2">WOCOM dashboard</h1>
      <p className="text-gray-600 mb-6">
        Manage ladies affairs: programs, Ta&apos;alim sessions, and private discussion. Click a card to continue.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayCards.map(({ key, href, label, icon: Icon, iconColor, iconBg, sub }) => (
          <Link
            key={key}
            href={href}
            className="card p-5 hover:shadow-md transition flex flex-col"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: iconBg, color: iconColor }}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-gray-900 tabular-nums">
                {stats ? stats[key] : 0}
              </span>
            </div>
            <h2 className="font-semibold text-gray-900 mt-3">{label}</h2>
            {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
            <p className="text-sm text-gmsa-green mt-2 font-medium">Manage →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
