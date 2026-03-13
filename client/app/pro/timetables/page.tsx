"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";
import { format } from "date-fns";
import { ContentCard } from "@/components/ContentCard";
import { DetailModal } from "@/components/DetailModal";

interface T {
  id: string;
  title: string;
  fileUrl: string;
  periodStart: string;
  periodEnd: string;
  createdAt?: string;
}

export default function ProTimetablesPage() {
  const [list, setList] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; periodStart: string; periodEnd: string } | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    api<T[]>("/timetables").then(setList).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm("Delete this timetable?")) return;
    setDeletingId(id);
    api(`/timetables/${id}`, { method: "DELETE" })
      .then(() => setList((prev) => prev.filter((t) => t.id !== id)))
      .catch((err) => alert(getSafeErrorMessage(err, "Action failed. Please try again.")))
      .finally(() => setDeletingId(null));
  };

  const openEdit = (t: T) => {
    setEditingId(t.id);
    setEditForm({
      title: t.title,
      periodStart: t.periodStart.slice(0, 7),
      periodEnd: t.periodEnd.slice(0, 7),
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editForm) return;
    setEditSaving(true);
    try {
      await api(`/timetables/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editForm.title,
          periodStart: editForm.periodStart + "-01",
          periodEnd: editForm.periodEnd + "-01",
        }),
      });
      setEditingId(null);
      setEditForm(null);
      api<T[]>("/timetables").then(setList);
    } catch (err) {
      alert(getSafeErrorMessage(err, "Could not update. Please try again."));
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gmsa-green mb-4">Prayer timetables</h1>
      <p className="text-gray-600 mb-6">Upload timetables via API (multipart form with file). Listed below.</p>
      {loading ? <p>Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((t) => (
            <ContentCard
              key={t.id}
              title={t.title}
              subtitle={`${format(new Date(t.periodStart), "MMM yyyy")} – ${format(new Date(t.periodEnd), "MMM yyyy")}`}
              createdAt={t.createdAt}
              viewDetailsHref={`/downloads/timetable/${t.id}`}
              onViewDetailsClick={() => setDetailId(t.id)}
              secondaryAction={{ label: "download", href: t.fileUrl }}
              manageActions={
                <span className="flex items-center gap-2">
                  <button type="button" onClick={() => openEdit(t)} className="text-gmsa-green hover:text-gmsa-green-dark text-sm font-medium">Edit</button>
                  <button type="button" onClick={() => handleDelete(t.id)} disabled={!!deletingId} className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50">
                    {deletingId === t.id ? "…" : "Delete"}
                  </button>
                </span>
              }
            />
          ))}
          {list.length === 0 && <p className="text-gray-500 col-span-full">No timetables yet.</p>}
        </div>
      )}
      <Link href="/downloads" className="inline-block mt-4 text-gmsa-green hover:underline">View public downloads →</Link>
      <DetailModal isOpen={detailId !== null} onClose={() => setDetailId(null)} type="timetable" id={detailId} />

      {editingId && editForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" onClick={(e) => e.target === e.currentTarget && (setEditingId(null), setEditForm(null))}>
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl max-w-md w-full max-h-[95vh] overflow-y-auto p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit timetable</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm((f) => f ? { ...f, title: e.target.value } : null)} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Period start (month)</label>
                <input type="month" value={editForm.periodStart} onChange={(e) => setEditForm((f) => f ? { ...f, periodStart: e.target.value } : null)} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Period end (month)</label>
                <input type="month" value={editForm.periodEnd} onChange={(e) => setEditForm((f) => f ? { ...f, periodEnd: e.target.value } : null)} className="w-full border rounded-lg px-3 py-2" required />
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
