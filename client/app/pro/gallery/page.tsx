"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";
import { ContentCard } from "@/components/ContentCard";
import { DetailModal } from "@/components/DetailModal";

interface Album {
  id: string;
  name: string;
  coverImageUrl?: string | null;
  images: { id: string; imageUrl?: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export default function ProGalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    api<Album[]>("/gallery/albums").then(setAlbums).catch(() => setAlbums([])).finally(() => setLoading(false));
  }, []);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editName.trim()) return;
    setEditSaving(true);
    try {
      await api(`/gallery/albums/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({ name: editName.trim() }),
      });
      setEditingId(null);
      setEditName("");
      api<Album[]>("/gallery/albums").then(setAlbums);
    } catch (err) {
      alert(getSafeErrorMessage(err, "Could not update. Please try again."));
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gmsa-green mb-4">Gallery</h1>
      <p className="text-gray-600 mb-6">Manage gallery albums and images.</p>
      {loading ? <p>Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((a) => (
            <ContentCard
              key={a.id}
              imageUrl={a.coverImageUrl || a.images[0]?.imageUrl}
              title={a.name}
              subtitle={`${a.images.length} photo(s)`}
              updatedAt={a.updatedAt}
              createdAt={a.createdAt}
              viewDetailsHref={`/gallery/${a.id}`}
              onViewDetailsClick={() => setDetailId(a.id)}
              manageActions={
                <button
                  type="button"
                  onClick={() => { setEditingId(a.id); setEditName(a.name); }}
                  className="text-gmsa-green hover:text-gmsa-green-dark text-sm font-medium"
                >
                  Edit
                </button>
              }
            />
          ))}
          {albums.length === 0 && <p className="text-gray-500 col-span-full">No albums yet. Create albums via API.</p>}
        </div>
      )}
      <Link href="/gallery" className="inline-block mt-4 text-gmsa-green hover:underline">View public gallery →</Link>
      <DetailModal isOpen={detailId !== null} onClose={() => setDetailId(null)} type="gallery" id={detailId} />

      {editingId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" onClick={(e) => e.target === e.currentTarget && (setEditingId(null), setEditName(""))}>
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl max-w-md w-full max-h-[95vh] overflow-y-auto p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit album name</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={editSaving} className="btn-primary">{editSaving ? "Saving..." : "Save"}</button>
                <button type="button" onClick={() => { setEditingId(null); setEditName(""); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
