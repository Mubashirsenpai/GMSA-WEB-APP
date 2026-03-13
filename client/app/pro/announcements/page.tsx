"use client";

import { useState, useEffect, useRef } from "react";
import { api, uploadImage } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";
import { format } from "date-fns";
import { ContentCard } from "@/components/ContentCard";
import { DetailModal } from "@/components/DetailModal";

interface Ann {
  id: string;
  title: string;
  body: string;
  coverImageUrl?: string | null;
  publishedAt: string;
  priority?: number;
  author: { name: string };
  createdAt?: string;
  updatedAt?: string;
}

export default function ProAnnouncementsPage() {
  const [list, setList] = useState<Ann[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; body: string; priority: number; coverImageUrl: string | null; coverFile?: File | null } | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<Ann[]>("/announcements").then(setList).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitLoading(true);
    try {
      let coverImageUrl: string | null = null;
      if (coverFile) {
        coverImageUrl = await uploadImage(coverFile);
      }
      await api("/announcements", {
        method: "POST",
        body: JSON.stringify({ title, body, priority: 0, coverImageUrl }),
      });
      setTitle("");
      setBody("");
      setCoverFile(null);
      if (coverInputRef.current) coverInputRef.current.value = "";
      api<Ann[]>("/announcements").then(setList);
    } catch (err) {
      alert(getSafeErrorMessage(err, "Could not create. Please try again."));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    setDeletingId(id);
    api(`/announcements/${id}`, { method: "DELETE" })
      .then(() => setList((prev) => prev.filter((a) => a.id !== id)))
      .catch((err) => alert(getSafeErrorMessage(err, "Action failed. Please try again.")))
      .finally(() => setDeletingId(null));
  };

  const openEdit = (a: Ann) => {
    setEditingId(a.id);
    setEditForm({
      title: a.title,
      body: a.body,
      priority: a.priority ?? 0,
      coverImageUrl: a.coverImageUrl ?? null,
      coverFile: null,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editForm) return;
    setEditSaving(true);
    try {
      let coverImageUrl: string | null = editForm.coverImageUrl;
      if (editForm.coverFile) {
        coverImageUrl = await uploadImage(editForm.coverFile);
      }
      await api(`/announcements/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editForm.title,
          body: editForm.body,
          priority: editForm.priority,
          coverImageUrl,
        }),
      });
      setEditingId(null);
      setEditForm(null);
      api<Ann[]>("/announcements").then(setList);
    } catch (err) {
      alert(getSafeErrorMessage(err, "Could not update. Please try again."));
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gmsa-green mb-4">Announcements</h1>
      <form onSubmit={handleSubmit} className="card p-6 mb-6 max-w-xl">
        <h2 className="font-semibold text-gray-900 mb-4">Create announcement</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Cover image (optional)</label>
            <input ref={coverInputRef} type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Body</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={4} required />
          </div>
          <button type="submit" disabled={submitLoading} className="btn-primary">
            {submitLoading ? "Publishing..." : "Publish"}
          </button>
        </div>
      </form>
      <h2 className="font-semibold text-gray-900 mb-4">Recent announcements</h2>
      {loading ? <p>Loading...</p> : (
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
              manageActions={
                <span className="flex items-center gap-2">
                  <button type="button" onClick={() => openEdit(a)} className="text-gmsa-green hover:text-gmsa-green-dark text-sm font-medium">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    disabled={!!deletingId}
                    className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                  >
                    {deletingId === a.id ? "…" : "Delete"}
                  </button>
                </span>
              }
            >
              {a.priority && a.priority > 0 && (
                <span className="inline-block text-xs bg-gmsa-green/20 text-gmsa-green px-2 py-0.5 rounded">Important</span>
              )}
            </ContentCard>
          ))}
          {list.length === 0 && <p className="text-gray-500 col-span-full">No announcements yet.</p>}
        </div>
      )}
      <DetailModal isOpen={detailId !== null} onClose={() => setDetailId(null)} type="announcement" id={detailId} />

      {editingId && editForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" onClick={(e) => e.target === e.currentTarget && (setEditingId(null), setEditForm(null))}>
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit announcement</h3>
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
                <label className="block font-medium text-gray-700 mb-1">Cover image (optional)</label>
                {editForm.coverImageUrl && (
                  <p className="text-xs text-gray-500 mb-1">Current: <a href={editForm.coverImageUrl} target="_blank" rel="noopener noreferrer" className="text-gmsa-green underline">view</a></p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditForm((f) => f ? { ...f, coverFile: e.target.files?.[0] || null } : null)}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-0.5">Leave empty to keep current; choose a file to replace.</p>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Body</label>
                <textarea
                  value={editForm.body}
                  onChange={(e) => setEditForm((f) => f ? { ...f, body: e.target.value } : null)}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Priority (0 = normal, higher = more important)</label>
                <input
                  type="number"
                  min={0}
                  value={editForm.priority}
                  onChange={(e) => setEditForm((f) => f ? { ...f, priority: parseInt(e.target.value, 10) || 0 } : null)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={editSaving} className="btn-primary">
                  {editSaving ? "Saving..." : "Save changes"}
                </button>
                <button type="button" onClick={() => { setEditingId(null); setEditForm(null); }} className="btn-secondary">
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
