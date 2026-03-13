"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { format } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  body: string;
  coverImageUrl?: string | null;
  publishedAt: string;
  priority: number;
  author: { name: string };
}

export default function AnnouncementDetailPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Announcement>(`/announcements/${params.id}`)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  if (!item) return <div className="container mx-auto px-4 py-12 text-center">Announcement not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/announcements" className="text-gmsa-green hover:underline mb-6 inline-block">← Back to announcements</Link>
      <article className="card overflow-hidden p-0">
        {item.coverImageUrl && (
          <div className="aspect-video w-full bg-gray-100">
            <img src={item.coverImageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
            {item.priority > 0 && (
              <span className="bg-gmsa-green/20 text-gmsa-green text-xs font-medium px-2 py-1 rounded shrink-0">Important</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">{item.author.name} · {format(new Date(item.publishedAt), "PPP")}</p>
          <div className="mt-4 text-gray-700 whitespace-pre-wrap">{item.body}</div>
        </div>
      </article>
    </div>
  );
}
