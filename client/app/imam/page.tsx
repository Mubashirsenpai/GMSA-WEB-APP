"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ScrollText, BookOpen, GraduationCap } from "lucide-react";

interface ImamStats {
  khutbahMaterials: number;
  learningMaterials: number;
  courses: number;
}

const displayCards = [
  { key: "khutbahMaterials" as const, href: "/imam/khutbah", label: "Khutbah materials", icon: ScrollText, iconColor: "#0d9488", iconBg: "#ccfbf1" },
  { key: "learningMaterials" as const, href: "/imam/learning", label: "Learning materials", icon: BookOpen, iconColor: "#ca8a04", iconBg: "#fef9c3" },
  { key: "courses" as const, href: "/imam/courses", label: "Courses", icon: GraduationCap, iconColor: "#7c3aed", iconBg: "#ede9fe", sub: "With lecture materials" },
];

export default function ImamPage() {
  const [stats, setStats] = useState<ImamStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<ImamStats>("/imam/stats")
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gmsa-green mb-4">Imam dashboard</h1>
        <p className="text-gray-500">Loading statistics...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gmsa-green mb-2">Imam dashboard</h1>
      <p className="text-gray-600 mb-6">
        Manage Khutbah, learning materials, and courses with lecture materials. Click a card to continue.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayCards.map(({ key, href, label, icon: Icon, iconColor, iconBg, sub }) => (
          <Link key={key} href={href} className="card p-5 hover:shadow-md transition flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: iconBg, color: iconColor }}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-gray-900 tabular-nums">{stats ? stats[key] : 0}</span>
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
