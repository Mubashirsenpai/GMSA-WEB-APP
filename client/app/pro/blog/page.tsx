"use client";

import { useState, useEffect } from "react";
import { api, uploadImage } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";
import { format } from "date-fns";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { ContentCard } from "@/components/ContentCard";
import { DetailModal } from "@/components/DetailModal";

interface Post {
  id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
  author: { name: string };
  coverImageUrl?: string | null;
  _count?: { likes: number; comments: number; reshares: number };
  createdAt?: string;
  updatedAt?: string;
}

export default function ProBlogPage() {
  const [list, setList] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    body: string;
    coverImageUrl: string | null;
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
    api<Post[]>("/blogs").then(setList).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitLoading(true);
    try {
      let coverImageUrl: string | undefined;
      if (coverFile) {
        coverImageUrl = await uploadImage(coverFile);
      }
      await api("/blogs", {
        method: "POST",
        body: JSON.stringify({ title, body, publish: true, coverImageUrl: coverImageUrl || undefined }),
      });
      setTitle("");
      setBody("");
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
      setCoverFile(null);
      setCoverPreviewUrl(null);
      api<Post[]>("/blogs").then(setList);
    } catch (err) {
      alert(getSafeErrorMessage(err, "Could not create post. Please try again."));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this post?")) return;
    setDeletingId(id);
    api(`/blogs/${id}`, { method: "DELETE" })
      .then(() => setList((prev) => prev.filter((p) => p.id !== id)))
      .catch((err) => alert(getSafeErrorMessage(err, "Action failed. Please try again.")))
      .finally(() => setDeletingId(null));
  };

  const openEdit = (p: Post) => {
    setEditingId(p.id);
    setEditForm({
      title: p.title,
      body: "", // will load from API
      coverImageUrl: p.coverImageUrl || null,
      coverFile: null,
      coverPreviewUrl: null,
    });
    api<{ body: string }>(`/blogs/${p.id}`).then((data) => {
      setEditForm((f) => (f ? { ...f, body: data.body } : null));
    }).catch(() => {});
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
    if (!editingId || !editForm) return;
    setEditSaving(true);
    try {
      let coverImageUrl: string | null = editForm.coverImageUrl;
      if (editForm.coverFile) {
        coverImageUrl = await uploadImage(editForm.coverFile);
      }
      await api(`/blogs/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editForm.title,
          body: editForm.body,
          coverImageUrl: coverImageUrl || undefined,
          publish: true,
        }),
      });
      closeEdit();
      api<Post[]>("/blogs").then(setList);
    } catch (err) {
      alert(getSafeErrorMessage(err, "Could not update post. Please try again."));
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gmsa-green mb-4">Blog posts</h1>
      <form onSubmit={handleSubmit} className="card p-6 mb-6 max-w-xl">
        <h2 className="font-semibold text-gray-900 mb-4">Create post</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
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
            <label className="block font-medium text-gray-700 mb-1">Body</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={6} required />
          </div>
          <button type="submit" disabled={submitLoading} className="btn-primary">
            {submitLoading ? "Publishing..." : "Publish"}
          </button>
        </div>
      </form>
      <h2 className="font-semibold text-gray-900 mb-4">Posts</h2>
      {loading ? <p>Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((p) => (
            <ContentCard
              key={p.id}
              imageUrl={p.coverImageUrl}
              title={p.title}
              subtitle={p.publishedAt ? `${p.author.name} · ${format(new Date(p.publishedAt), "PPP")}` : `${p.author.name} · Draft`}
              updatedAt={p.updatedAt}
              createdAt={p.createdAt}
              viewDetailsHref={`/blog/${p.id}`}
              onViewDetailsClick={() => setDetailId(p.id)}
              manageActions={
                <span className="flex items-center gap-2">
                  <button type="button" onClick={() => openEdit(p)} className="text-gmsa-green hover:text-gmsa-green-dark text-sm font-medium">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    disabled={!!deletingId}
                    className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                  >
                    {deletingId === p.id ? "…" : "Delete"}
                  </button>
                </span>
              }
            >
              {p._count && (
                <div className="flex gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {p._count.likes}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {p._count.comments}</span>
                  <span className="flex items-center gap-1"><Share2 className="w-4 h-4" /> {p._count.reshares}</span>
                </div>
              )}
            </ContentCard>
          ))}
          {list.length === 0 && <p className="text-gray-500 col-span-full">No posts yet.</p>}
        </div>
      )}
      <DetailModal isOpen={detailId !== null} onClose={() => setDetailId(null)} type="blog" id={detailId} />

      {editingId && editForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" onClick={(e) => e.target === e.currentTarget && closeEdit()}>
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit post</h3>
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
                <label className="block font-medium text-gray-700 mb-1">Cover image (optional, leave empty to keep current)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setEditForm((f) => {
                      if (f?.coverPreviewUrl) URL.revokeObjectURL(f.coverPreviewUrl);
                      return f ? { ...f, coverFile: file || null, coverPreviewUrl: file ? URL.createObjectURL(file) : null } : null;
                    });
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                {(editForm.coverPreviewUrl || editForm.coverImageUrl) && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 max-w-xs">
                    <img src={editForm.coverPreviewUrl || editForm.coverImageUrl || ""} alt="Cover" className="w-full h-32 object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Body</label>
                <textarea
                  value={editForm.body}
                  onChange={(e) => setEditForm((f) => f ? { ...f, body: e.target.value } : null)}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={6}
                  required
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
