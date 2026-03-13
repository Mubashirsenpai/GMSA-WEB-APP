"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";
import { format } from "date-fns";
import { ContentCard } from "@/components/ContentCard";

interface Program {
  id: string;
  title: string;
  description: string | null;
  type: string;
  scheduledAt: string | null;
  venue: string | null;
  createdBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export default function WocomProgramsPage() {
  const [list, setList] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"TAALIM" | "OTHER">("TAALIM");
  const [scheduledAt, setScheduledAt] = useState("");
  const [venue, setVenue] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; description: string; type: "TAALIM" | "OTHER"; scheduledAt: string; venue: string } | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const load = () => api<Program[]>("/wocom/programs").then(setList).catch(() => setList([]));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitLoading(true);
    api("/wocom/programs", {
      method: "POST",
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        scheduledAt: scheduledAt || undefined,
        venue: venue.trim() || undefined,
      }),
    })
      .then(() => {
        setTitle("");
        setDescription("");
        setScheduledAt("");
        setVenue("");
        load();
      })
      .catch((err) => alert(getSafeErrorMessage(err, "Could not create. Please try again.")))
      .finally(() => setSubmitLoading(false));
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this program?")) return;
    setDeletingId(id);
    api(`/wocom/programs/${id}`, { method: "DELETE" })
      .then(() => setList((prev) => prev.filter((p) => p.id !== id)))
      .catch((err) => alert(getSafeErrorMessage(err, "Action failed.")))
      .finally(() => setDeletingId(null));
  };

  const openEdit = (p: Program) => {
    setEditingId(p.id);
    setEditForm({
      title: p.title,
      description: p.description || "",
      type: (p.type as "TAALIM" | "OTHER") || "TAALIM",
      scheduledAt: p.scheduledAt ? p.scheduledAt.slice(0, 16) : "",
      venue: p.venue || "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editForm) return;
    setEditSaving(true);
    try {
      await api(`/wocom/programs/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description || null,
          type: editForm.type,
          scheduledAt: editForm.scheduledAt || null,
          venue: editForm.venue || null,
        }),
      });
      setEditingId(null);
      setEditForm(null);
      load();
    } catch (err) {
      alert(getSafeErrorMessage(err, "Could not update."));
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gmsa-green mb-4">Ladies programs</h1>
      <form onSubmit={handleSubmit} className="card p-6 mb-6 max-w-xl">
        <h2 className="font-semibold text-gray-900 mb-4">Add program</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as "TAALIM" | "OTHER")} className="w-full border rounded-lg px-3 py-2">
              <option value="TAALIM">Ta&apos;alim</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={2} />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Scheduled date & time (optional)</label>
            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Venue (optional)</label>
            <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <button type="submit" disabled={submitLoading} className="btn-primary">
            {submitLoading ? "Adding..." : "Add program"}
          </button>
        </div>
      </form>

      <h2 className="font-semibold text-gray-900 mb-4">Programs</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((p) => (
            <ContentCard
              key={p.id}
              title={p.title}
              subtitle={[p.type, p.scheduledAt ? format(new Date(p.scheduledAt), "PPP") : null, p.venue].filter(Boolean).join(" · ")}
              createdAt={p.createdAt}
              updatedAt={p.updatedAt}
              manageActions={
                <span className="flex items-center gap-2">
                  <button type="button" onClick={() => openEdit(p)} className="text-gmsa-green hover:text-gmsa-green-dark text-sm font-medium">Edit</button>
                  <button type="button" onClick={() => handleDelete(p.id)} disabled={!!deletingId} className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50">
                    {deletingId === p.id ? "…" : "Delete"}
                  </button>
                </span>
              }
            >
              {p.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.description}</p>}
            </ContentCard>
          ))}
          {list.length === 0 && <p className="text-gray-500 col-span-full">No programs yet.</p>}
        </div>
      )}

      {editingId && editForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" onClick={(e) => e.target === e.currentTarget && (setEditingId(null), setEditForm(null))}>
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl max-w-lg w-full max-h-[95vh] overflow-y-auto p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit program</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm((f) => f ? { ...f, title: e.target.value } : null)} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Type</label>
                <select value={editForm.type} onChange={(e) => setEditForm((f) => f ? { ...f, type: e.target.value as "TAALIM" | "OTHER" } : null)} className="w-full border rounded-lg px-3 py-2">
                  <option value="TAALIM">Ta&apos;alim</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm((f) => f ? { ...f, description: e.target.value } : null)} className="w-full border rounded-lg px-3 py-2" rows={2} />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Scheduled</label>
                <input type="datetime-local" value={editForm.scheduledAt} onChange={(e) => setEditForm((f) => f ? { ...f, scheduledAt: e.target.value } : null)} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Venue</label>
                <input type="text" value={editForm.venue} onChange={(e) => setEditForm((f) => f ? { ...f, venue: e.target.value } : null)} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={editSaving} className="btn-primary">{editSaving ? "Saving..." : "Save"}</button>
                <button type="button" onClick={() => { setEditingId(null); setEditForm(null); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
