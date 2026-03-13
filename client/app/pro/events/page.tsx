"use client";

import { useState, useEffect } from "react";
import { api, uploadImage } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";
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

export default function ProEventsPage() {
  const [list, setList] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [startAt, setStartAt] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    venue: string;
    startAt: string;
    endAt: string;
    imageUrl: string | null;
    coverFile: File | null;
    coverPreviewUrl: string | null;
  } | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    if (file) {
      setCoverFile(file);
      setCoverPreviewUrl(URL.createObjectURL(file));
    } else {
      setCoverFile(null);
      setCoverPreviewUrl(null);
    }
  };

  useEffect(() => {
    api<Event[]>("/events").then(setList).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startAt) return;
    setSubmitLoading(true);
    try {
      let imageUrl: string | null = null;
      if (coverFile) {
        imageUrl = await uploadImage(coverFile);
      }
      const payload: Record<string, unknown> = {
        title: title.trim(),
        startAt: new Date(startAt).toISOString(),
        registrationRequired: false,
      };
      if (description.trim()) payload.description = description.trim();
      if (venue.trim()) payload.venue = venue.trim();
      if (imageUrl) payload.imageUrl = imageUrl;

      await api("/events", { method: "POST", body: JSON.stringify(payload) });
      setTitle("");
      setDescription("");
      setVenue("");
      setStartAt("");
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
      setCoverFile(null);
      setCoverPreviewUrl(null);
      api<Event[]>("/events").then(setList);
    } catch (err) {
      alert(getSafeErrorMessage(err, "Could not create event. Please try again."));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this event?")) return;
    setDeletingId(id);
    api(`/events/${id}`, { method: "DELETE" })
      .then(() => setList((prev) => prev.filter((e) => e.id !== id)))
      .catch((err) => alert(getSafeErrorMessage(err, "Action failed. Please try again.")))
      .finally(() => setDeletingId(null));
  };

  const openEdit = (ev: Event) => {
    setEditingId(ev.id);
    setEditForm({
      title: ev.title,
      description: ev.description || "",
      venue: ev.venue || "",
      startAt: ev.startAt.slice(0, 16),
      endAt: ev.endAt ? ev.endAt.slice(0, 16) : "",
      imageUrl: ev.imageUrl,
      coverFile: null,
      coverPreviewUrl: null,
    });
  };

  const closeEdit = () => {
    setEditForm((prev) => {
      if (prev?.coverPreviewUrl) URL.revokeObjectURL(prev.coverPreviewUrl);
      return null;
    });
    setEditingId(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editForm || !editForm.title.trim() || !editForm.startAt) return;
    setEditSaving(true);
    try {
      let imageUrl: string | null = editForm.imageUrl;
      if (editForm.coverFile) {
        imageUrl = await uploadImage(editForm.coverFile);
      }
      await api(`/events/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim() || null,
          venue: editForm.venue.trim() || null,
          startAt: new Date(editForm.startAt).toISOString(),
          endAt: editForm.endAt ? new Date(editForm.endAt).toISOString() : null,
          imageUrl,
          registrationRequired: false,
        }),
      });
      closeEdit();
      api<Event[]>("/events").then(setList);
    } catch (err) {
      alert(getSafeErrorMessage(err, "Could not update event. Please try again."));
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gmsa-green mb-4">Events</h1>
      <form onSubmit={handleSubmit} className="card p-6 mb-6 max-w-xl">
        <h2 className="font-semibold text-gray-900 mb-4">Create event</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={3} />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Venue (optional)</label>
            <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Cover image (optional)</label>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onCoverChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
            {coverPreviewUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 max-w-xs">
                <img src={coverPreviewUrl} alt="Cover preview" className="w-full h-32 object-cover" />
              </div>
            )}
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Start date & time</label>
            <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <button type="submit" disabled={submitLoading} className="btn-primary">
            {submitLoading ? "Creating..." : "Create event"}
          </button>
        </div>
      </form>
      <h2 className="font-semibold text-gray-900 mb-4">Events</h2>
      {loading ? <p>Loading...</p> : (
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
              manageActions={
                <span className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(e)}
                    className="text-gmsa-green hover:text-gmsa-green-dark text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(e.id)}
                    disabled={!!deletingId}
                    className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                  >
                    {deletingId === e.id ? "…" : "Delete"}
                  </button>
                </span>
              }
            >
              {e.registrationRequired && (
                <span className="inline-block text-xs bg-gmsa-green/20 text-gmsa-green px-2 py-0.5 rounded">Registration required</span>
              )}
            </ContentCard>
          ))}
          {list.length === 0 && <p className="text-gray-500 col-span-full">No events yet.</p>}
        </div>
      )}
      <DetailModal isOpen={detailId !== null} onClose={() => setDetailId(null)} type="event" id={detailId} />

      {editingId && editForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" onClick={(e) => e.target === e.currentTarget && closeEdit()}>
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit event</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => f ? { ...f, title: e.target.value } : null)}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => f ? { ...f, description: e.target.value } : null)}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Venue (optional)</label>
                <input
                  type="text"
                  value={editForm.venue}
                  onChange={(e) => setEditForm((f) => f ? { ...f, venue: e.target.value } : null)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Cover image (optional, leave empty to keep current)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (editForm?.coverPreviewUrl) URL.revokeObjectURL(editForm.coverPreviewUrl);
                    setEditForm((f) =>
                      f
                        ? {
                            ...f,
                            coverFile: file || null,
                            coverPreviewUrl: file ? URL.createObjectURL(file) : null,
                          }
                        : null
                    );
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                {(editForm.coverPreviewUrl || editForm.imageUrl) && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 max-w-xs">
                    <img
                      src={editForm.coverPreviewUrl || editForm.imageUrl || ""}
                      alt="Cover"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Start date & time</label>
                <input
                  type="datetime-local"
                  value={editForm.startAt}
                  onChange={(e) => setEditForm((f) => f ? { ...f, startAt: e.target.value } : null)}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">End date & time (optional)</label>
                <input
                  type="datetime-local"
                  value={editForm.endAt}
                  onChange={(e) => setEditForm((f) => f ? { ...f, endAt: e.target.value } : null)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={editSaving} className="btn-primary">
                  {editSaving ? "Saving..." : "Save changes"}
                </button>
                <button type="button" onClick={closeEdit} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
