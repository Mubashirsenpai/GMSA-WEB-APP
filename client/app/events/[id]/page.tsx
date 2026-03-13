"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Calendar, MapPin } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  venue: string | null;
  startAt: string;
  endAt: string | null;
  imageUrl: string | null;
  registrationRequired: boolean;
  maxAttendees: number | null;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    api<Event>(`/events/${params.id}`)
      .then(setEvent)
      .catch(() => setEvent(null));
  }, [params.id]);

  const handleRegister = () => {
    setRegistering(true);
    api(`/events/${params.id}/register`, { method: "POST" })
      .then(() => router.push("/events"))
      .catch((e) => alert(e.message || "Registration failed"))
      .finally(() => setRegistering(false));
  };

  if (!event) return <div className="container mx-auto px-4 py-12">Event not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {event.imageUrl && (
        <div className="aspect-video rounded-xl overflow-hidden mb-6">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}
      <h1 className="text-3xl font-bold text-gmsa-green mb-4">{event.title}</h1>
      <p className="text-gray-500 flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        {format(new Date(event.startAt), "PPP p")}
        {event.endAt && ` – ${format(new Date(event.endAt), "p")}`}
      </p>
      {event.venue && (
        <p className="text-gray-600 flex items-center gap-2 mt-1">
          <MapPin className="w-4 h-4" />
          {event.venue}
        </p>
      )}
      {event.description && <p className="mt-6 text-gray-700 whitespace-pre-wrap">{event.description}</p>}
      {event.registrationRequired && (
        <div className="mt-6">
          <button onClick={handleRegister} disabled={registering} className="btn-primary">
            {registering ? "Registering..." : "Register for this event"}
          </button>
          <p className="text-sm text-gray-500 mt-2">You must be logged in to register.</p>
        </div>
      )}
      <Link href="/events" className="inline-block mt-6 text-gmsa-green hover:underline">← Back to events</Link>
    </div>
  );
}
