"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";
import { format } from "date-fns";
import { ContentCard } from "@/components/ContentCard";
import { DetailModal } from "@/components/DetailModal";

interface K {
  id: string;
  title: string;
  fileUrl: string;
  date: string | null;
  description?: string | null;
  createdAt?: string;
}

export default function ProKhutbahPage() {
  const [list, setList] = useState<K[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; description: string; date: string } | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    api<K[]>("/khutbah").then(setList).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm("Delete this Khutbah material?")) return;
    setDeletingId(id);
    api(`/khutbah/${id}`, { method: "DELETE" })
      .then(() => setList((prev) => prev.filter((k) => k.id !== id)))
      .catch((err) => alert(getSafeErrorMessage(err, "Action failed. Please try again.")))
      .finally(() => setDeletingId(null));
  };

  const openEdit = (k: K) => {
    setEditingId(k.id);
    setEditForm({
      title: k.title,
      description: k.description || "",
      date: k.date ? k.date.slice(0, 10) : "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editForm) return;
    setEditSaving(true);
    try {
      await api(`/khutbah/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description || null,
          date: editForm.date || null,
        }),
      });
      setEditingId(null);
      setEditForm(null);
      api<K[]>("/khutbah").then(setList);
    } catch (err) {
      alert(getSafeErrorMessage(err, "Could not update. Please try again."));
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gmsa-green mb-4">Khutbah materials</h1>
      <p className="text-gray-600 mb-6">Upload Khutbah materials via API. Listed below.</p>
      {loading ? <p>Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((k) => (
            <ContentCard
              key={k.id}
              title={k.title}
              subtitle={k.date ? format(new Date(k.date), "PPP") : undefined}
              createdAt={k.createdAt}
              viewDetailsHref={`/downloads/khutbah/${k.id}`}
              onViewDetailsClick={() => setDetailId(k.id)}
              secondaryAction={{ label: "download", href: k.fileUrl }}
              manageActions={
                <span className="flex items-center gap-2">
                  <button type="button" onClick={() => openEdit(k)} className="text-gmsa-green hover:text-gmsa-green-dark text-sm font-medium">Edit</button>
                  <button type="button" onClick={() => handleDelete(k.id)} disabled={!!deletingId} className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50">
                    {deletingId === k.id ? "…" : "Delete"}
                  </button>
                </span>
              }
            />
          ))}
          {list.length === 0 && <p className="text-gray-500 col-span-full">No Khutbah materials yet.</p>}
        </div>
      )}
      <Link href="/downloads" className="inline-block mt-4 text-gmsa-green hover:underline">View public downloads →</Link>
      <DetailModal isOpen={detailId !== null} onClose={() => setDetailId(null)} type="khutbah" id={detailId} />

      {editingId && editForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" onClick={(e) => e.target === e.currentTarget && (setEditingId(null), setEditForm(null))}>
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Khutbah material</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm((f) => f ? { ...f, title: e.target.value } : null)} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm((f) => f ? { ...f, description: e.target.value } : null)} className="w-full border rounded-lg px-3 py-2" rows={3} />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Date (optional)</label>
                <input type="date" value={editForm.date} onChange={(e) => setEditForm((f) => f ? { ...f, date: e.target.value } : null)} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="flex gap-2">
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
