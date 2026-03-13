"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";
import { formatDistanceToNow } from "date-fns";

const API_BASE = typeof window !== "undefined" ? "/api" : process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gmsa_token");
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  createdBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  _count?: { materials: number };
}

export default function ImamCoursesPage() {
  const [list, setList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () =>
    api<Course[]>("/courses")
      .then(setList)
      .catch(() => setList([]));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitLoading(true);
    const form = new FormData();
    form.append("title", title.trim());
    if (description.trim()) form.append("description", description.trim());
    if (coverFile) form.append("coverImage", coverFile);
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE}/courses`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || "Failed to create");
      setTitle("");
      setDescription("");
      setCoverFile(null);
      load();
    } catch (err) {
      alert(getSafeErrorMessage(err, "Could not create course."));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this course and all its materials?")) return;
    setDeletingId(id);
    api(`/courses/${id}`, { method: "DELETE" })
      .then(() => setList((prev) => prev.filter((c) => c.id !== id)))
      .catch((err) => alert(getSafeErrorMessage(err, "Action failed.")))
      .finally(() => setDeletingId(null));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gmsa-green mb-4">Courses</h1>
      <p className="text-gray-600 mb-6">Create courses with a cover image and add lecture materials for review and download.</p>

      <form onSubmit={handleSubmit} className="card p-6 mb-6 max-w-xl">
        <h2 className="font-semibold text-gray-900 mb-4">Create course</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={2} />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Cover image (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <button type="submit" disabled={submitLoading} className="btn-primary">
            {submitLoading ? "Creating..." : "Create course"}
          </button>
        </div>
      </form>

      <h2 className="font-semibold text-gray-900 mb-4">Your courses</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((c) => (
            <div key={c.id} className="card overflow-hidden flex flex-col">
              {c.coverImageUrl && (
                <div className="aspect-video bg-gray-100">
                  <img src={c.coverImageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900">{c.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true })}
                  {(c._count?.materials ?? 0) > 0 && ` · ${c._count!.materials} material(s)`}
                </p>
                {c.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{c.description}</p>}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Link href={`/imam/courses/${c.id}`} className="text-gmsa-green hover:underline text-sm font-medium">
                    Manage materials
                  </Link>
                  <Link href={`/courses/${c.id}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline text-sm">
                    View public
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    disabled={!!deletingId}
                    className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                  >
                    {deletingId === c.id ? "…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="text-gray-500 col-span-full">No courses yet.</p>}
        </div>
      )}
    </div>
  );
}
