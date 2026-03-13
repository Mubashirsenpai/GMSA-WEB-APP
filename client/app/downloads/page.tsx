"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { FileText, BookOpen, ScrollText } from "lucide-react";
import { ContentCard } from "@/components/ContentCard";
import { DetailModal, type DetailModalType } from "@/components/DetailModal";

interface Timetable {
  id: string;
  title: string;
  fileUrl: string;
  periodStart: string;
  periodEnd: string;
  createdAt?: string;
}

interface Khutbah {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  date: string | null;
  createdAt?: string;
}

interface Learning {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  category: string | null;
  createdAt?: string;
}

export default function DownloadsPage() {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [khutbah, setKhutbah] = useState<Khutbah[]>([]);
  const [learning, setLearning] = useState<Learning[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<{ type: DetailModalType; id: string } | null>(null);

  useEffect(() => {
    Promise.all([
      api<Timetable[]>("/timetables").catch(() => []),
      api<Khutbah[]>("/khutbah").catch(() => []),
      api<Learning[]>("/learning-materials").catch(() => []),
    ]).then(([t, k, l]) => {
      setTimetables(t);
      setKhutbah(k);
      setLearning(l);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gmsa-green mb-8">Downloads</h1>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gmsa-green" />
          Prayer Timetables
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timetables.map((t) => (
            <ContentCard
              key={t.id}
              title={t.title}
              subtitle={`${format(new Date(t.periodStart), "MMM yyyy")} – ${format(new Date(t.periodEnd), "MMM yyyy")}`}
              createdAt={t.createdAt}
              viewDetailsHref={`/downloads/timetable/${t.id}`}
              onViewDetailsClick={() => setDetail({ type: "timetable", id: t.id })}
              secondaryAction={{ label: "download", href: t.fileUrl }}
            />
          ))}
        </div>
        {timetables.length === 0 && <p className="text-gray-500">No timetables yet.</p>}
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-gmsa-green" />
          Khutbah Materials (Friday Prayers)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {khutbah.map((k) => (
            <ContentCard
              key={k.id}
              title={k.title}
              subtitle={k.date ? format(new Date(k.date), "PPP") : undefined}
              createdAt={k.createdAt}
              viewDetailsHref={`/downloads/khutbah/${k.id}`}
              onViewDetailsClick={() => setDetail({ type: "khutbah", id: k.id })}
              secondaryAction={{ label: "download", href: k.fileUrl }}
            />
          ))}
        </div>
        {khutbah.length === 0 && <p className="text-gray-500">No Khutbah materials yet.</p>}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-gmsa-green" />
          Learning Materials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learning.map((l) => (
            <ContentCard
              key={l.id}
              title={l.title}
              subtitle={l.category ? `Category: ${l.category}` : undefined}
              createdAt={l.createdAt}
              viewDetailsHref={`/downloads/learning/${l.id}`}
              onViewDetailsClick={() => setDetail({ type: "learning", id: l.id })}
              secondaryAction={{ label: "download", href: l.fileUrl }}
            />
          ))}
        </div>
        {learning.length === 0 && <p className="text-gray-500">No learning materials yet.</p>}
      </section>
      {detail && (
        <DetailModal
          isOpen={true}
          onClose={() => setDetail(null)}
          type={detail.type}
          id={detail.id}
        />
      )}
    </div>
  );
}
