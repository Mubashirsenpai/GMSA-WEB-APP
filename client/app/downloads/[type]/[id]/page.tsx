"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Download } from "lucide-react";

type DownloadType = "timetable" | "khutbah" | "learning";

const API_PATH: Record<DownloadType, string> = {
  timetable: "/timetables",
  khutbah: "/khutbah",
  learning: "/learning-materials",
};

const TITLE: Record<DownloadType, string> = {
  timetable: "Prayer Timetable",
  khutbah: "Khutbah Material",
  learning: "Learning Material",
};

export default function DownloadDetailPage({ params }: { params: { type: string; id: string } }) {
  const type = (params.type === "timetable" || params.type === "khutbah" || params.type === "learning")
    ? params.type
    : null;
  const [item, setItem] = useState<{ title: string; fileUrl: string; periodStart?: string; periodEnd?: string; date?: string | null; description?: string | null; category?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!type) {
      setLoading(false);
      return;
    }
    api<{ title: string; fileUrl: string; periodStart?: string; periodEnd?: string; date?: string | null; description?: string | null; category?: string | null }>(
      `${API_PATH[type]}/${params.id}`
    )
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [type, params.id]);

  if (!type || loading) return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  if (!item) return <div className="container mx-auto px-4 py-12 text-center">Not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/downloads" className="text-gmsa-green hover:underline mb-6 inline-block">← Back to downloads</Link>
      <article className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{TITLE[type]}</p>
        {type === "timetable" && item.periodStart && item.periodEnd && (
          <p className="mt-2 text-gray-600">
            {format(new Date(item.periodStart), "MMM yyyy")} – {format(new Date(item.periodEnd), "MMM yyyy")}
          </p>
        )}
        {type === "khutbah" && item.date && (
          <p className="mt-2 text-gray-600">{format(new Date(item.date), "PPP")}</p>
        )}
        {type === "learning" && item.category && (
          <p className="mt-2 text-gray-600">Category: {item.category}</p>
        )}
        {item.description && <p className="mt-3 text-gray-700 whitespace-pre-wrap">{item.description}</p>}
        <a
          href={item.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-2 mt-6"
        >
          <Download className="w-5 h-5" />
          Download
        </a>
      </article>
    </div>
  );
}
