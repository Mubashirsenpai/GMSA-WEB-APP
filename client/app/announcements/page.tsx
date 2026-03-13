"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { ContentCard } from "@/components/ContentCard";
import { DetailModal } from "@/components/DetailModal";

interface Announcement {
  id: string;
  title: string;
  body: string;
  coverImageUrl?: string | null;
  publishedAt: string;
  priority: number;
  author: { name: string };
  createdAt?: string;
  updatedAt?: string;
}

export default function AnnouncementsPage() {
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    api<Announcement[]>("/announcements")
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gmsa-green mb-6">Announcements</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((a) => (
          <ContentCard
            key={a.id}
            imageUrl={a.coverImageUrl}
            title={a.title}
            subtitle={`${a.author.name} · ${format(new Date(a.publishedAt), "PPP")}`}
            updatedAt={a.updatedAt}
            createdAt={a.createdAt}
            viewDetailsHref={`/announcements/${a.id}`}
            onViewDetailsClick={() => setDetailId(a.id)}
          >
            {a.priority > 0 && (
              <span className="inline-block text-xs bg-gmsa-green/20 text-gmsa-green px-2 py-0.5 rounded">Important</span>
            )}
          </ContentCard>
        ))}
      </div>
      {list.length === 0 && <p className="text-gray-500">No announcements yet.</p>}
      <DetailModal
        isOpen={detailId !== null}
        onClose={() => setDetailId(null)}
        type="announcement"
        id={detailId}
      />
    </div>
  );
}
