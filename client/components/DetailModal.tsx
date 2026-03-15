"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { X, Calendar, MapPin, Download } from "lucide-react";

export type DetailModalType =
  | "event"
  | "announcement"
  | "blog"
  | "gallery"
  | "timetable"
  | "khutbah"
  | "learning";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: DetailModalType;
  id: string | null;
}

export function DetailModal({ isOpen, onClose, type, id }: DetailModalProps) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isOpen || !id) {
      setData(null);
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);
    const path =
      type === "event"
        ? `/events/${id}`
        : type === "announcement"
          ? `/announcements/${id}`
          : type === "blog"
            ? `/blogs/${id}`
            : type === "gallery"
              ? `/gallery/albums/${id}`
              : type === "timetable"
                ? `/timetables/${id}`
                : type === "khutbah"
                  ? `/khutbah/${id}`
                  : `/learning-materials/${id}`;
    api(path)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [isOpen, id, type]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
    >
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between shrink-0 px-4 py-3 border-b border-gray-200">
          <h2 id="detail-modal-title" className="text-lg font-semibold text-gray-900">
            {loading ? "Loading..." : error ? "Unable to load" : type === "event" ? "Event" : type === "announcement" ? "Announcement" : type === "blog" ? "Blog post" : type === "gallery" ? "Gallery" : "Download"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading && <p className="text-gray-500 text-center py-8">Loading...</p>}
          {error && <p className="text-red-600 text-center py-8">Failed to load content.</p>}
          {!loading && !error && data ? (
            <DetailContent type={type} data={data} onClose={onClose} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DetailContent({
  type,
  data,
  onClose,
}: {
  type: DetailModalType;
  data: unknown;
  onClose: () => void;
}) {
  if (type === "event") {
    const e = data as {
      title: string;
      description: string | null;
      venue: string | null;
      startAt: string;
      endAt: string | null;
      imageUrl: string | null;
      registrationRequired: boolean;
      id: string;
    };
    return (
      <>
        {e.imageUrl && (
          <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-gray-100">
            <img src={e.imageUrl} alt={e.title} className="w-full h-full object-cover" />
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-900">{e.title}</h3>
        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
          <Calendar className="w-4 h-4" />
          {format(new Date(e.startAt), "PPP p")}
          {e.endAt && ` – ${format(new Date(e.endAt), "p")}`}
        </p>
        {e.venue && (
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" />
            {e.venue}
          </p>
        )}
        {e.description && <p className="mt-4 text-gray-700 whitespace-pre-wrap">{e.description}</p>}
        {e.registrationRequired && (
          <a
            href={`/events/${e.id}`}
            className="btn-primary inline-block mt-4"
            onClick={onClose}
          >
            Register for this event
          </a>
        )}
      </>
    );
  }

  if (type === "announcement") {
    const a = data as {
      title: string;
      body: string;
      coverImageUrl?: string | null;
      publishedAt: string;
      priority: number;
      author: { name: string };
    };
    return (
      <>
        {a.coverImageUrl && (
          <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-gray-100">
            <img src={a.coverImageUrl} alt={a.title} className="w-full h-full object-cover" />
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-900">{a.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{a.author.name} · {format(new Date(a.publishedAt), "PPP")}</p>
        {a.priority > 0 && (
          <span className="inline-block mt-2 text-xs bg-gmsa-green/20 text-gmsa-green px-2 py-0.5 rounded">Important</span>
        )}
        <div className="mt-4 text-gray-700 whitespace-pre-wrap">{a.body}</div>
      </>
    );
  }

  if (type === "blog") {
    const p = data as {
      title: string;
      body: string;
      author: { name: string };
      publishedAt: string | null;
      coverImageUrl: string | null;
      id: string;
    };
    return (
      <>
        {p.coverImageUrl && (
          <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-gray-100">
            <img src={p.coverImageUrl} alt={p.title} className="w-full h-full object-cover" />
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-900">{p.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{p.author.name} · {p.publishedAt ? format(new Date(p.publishedAt), "PPP") : "Draft"}</p>
        <div className="mt-4 text-gray-700 whitespace-pre-wrap">{p.body}</div>
        <a href={`/blog/${p.id}`} className="text-gmsa-green hover:underline mt-4 inline-block" onClick={onClose}>
          Open full post (like, comment, share) →
        </a>
      </>
    );
  }

  if (type === "gallery") {
    const g = data as {
      name: string;
      images: { id: string; title: string | null; imageUrl: string }[];
    };
    return (
      <>
        <h3 className="text-xl font-bold text-gray-900 mb-4">{g.name}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {g.images.slice(0, 12).map((img) => (
            <a
              key={img.id}
              href={img.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square rounded-lg overflow-hidden bg-gray-100 block"
            >
              <img src={img.imageUrl} alt={img.title || "Photo"} className="w-full h-full object-cover" />
            </a>
          ))}
        </div>
        {g.images.length > 12 && <p className="text-sm text-gray-500 mt-2">+{g.images.length - 12} more</p>}
        {g.images.length === 0 && <p className="text-gray-500">No photos in this album.</p>}
      </>
    );
  }

  if (type === "timetable" || type === "khutbah" || type === "learning") {
    const d = data as {
      title: string;
      fileUrl: string;
      periodStart?: string;
      periodEnd?: string;
      date?: string | null;
      description?: string | null;
      category?: string | null;
    };
    return (
      <>
        <h3 className="text-xl font-bold text-gray-900">{d.title}</h3>
        {type === "timetable" && d.periodStart && d.periodEnd && (
          <p className="text-sm text-gray-500 mt-1">
            {format(new Date(d.periodStart), "MMM yyyy")} – {format(new Date(d.periodEnd), "MMM yyyy")}
          </p>
        )}
        {type === "khutbah" && d.date && (
          <p className="text-sm text-gray-500 mt-1">{format(new Date(d.date), "PPP")}</p>
        )}
        {type === "learning" && d.category && (
          <p className="text-sm text-gray-500 mt-1">Category: {d.category}</p>
        )}
        {d.description && <p className="mt-3 text-gray-700 whitespace-pre-wrap">{d.description}</p>}
        <a
          href={d.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-2 mt-4"
        >
          <Download className="w-5 h-5" />
          Download
        </a>
      </>
    );
  }

  return null;
}
