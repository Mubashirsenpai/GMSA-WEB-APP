"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { ContentCard } from "@/components/ContentCard";
import { DetailModal } from "@/components/DetailModal";

interface Event {
  id: string;
  title: string;
  description: string | null;
  venue: string | null;
  startAt: string;
  endAt: string | null;
  imageUrl: string | null;
  registrationRequired: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function EventsPage() {
  const [list, setList] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    api<Event[]>("/events")
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gmsa-green mb-6">Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((e) => (
          <ContentCard
            key={e.id}
            imageUrl={e.imageUrl}
            title={e.title}
            subtitle={[e.venue, format(new Date(e.startAt), "PPP p")].filter(Boolean).join(" · ")}
            updatedAt={e.updatedAt}
            createdAt={e.createdAt}
            viewDetailsHref={`/events/${e.id}`}
            onViewDetailsClick={() => setDetailId(e.id)}
            secondaryAction={{ label: "register", href: `/events/${e.id}` }}
          >
            {e.registrationRequired && (
              <span className="inline-block text-xs bg-gmsa-green/20 text-gmsa-green px-2 py-0.5 rounded">Registration required</span>
            )}
          </ContentCard>
        ))}
      </div>
      {list.length === 0 && <p className="text-gray-500">No events yet.</p>}
      <DetailModal
        isOpen={detailId !== null}
        onClose={() => setDetailId(null)}
        type="event"
        id={detailId}
      />
    </div>
  );
}
