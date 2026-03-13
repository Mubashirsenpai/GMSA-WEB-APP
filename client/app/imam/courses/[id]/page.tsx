"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";

const API_BASE = typeof window !== "undefined" ? "/api" : process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gmsa_token");
}

interface Material {
  id: string;
  title: string;
  fileUrl: string | null;
  order: number;
  createdAt: string;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  createdBy: { id: string; name: string };
  materials: Material[];
}

export default function ImamCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [matTitle, setMatTitle] = useState("");
  const [matFile, setMatFile] = useState<File | null>(null);
  const [matOrder, setMatOrder] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api<CourseDetail>(`/courses/${id}`)
      .then(setCourse)
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [id]);

  const addMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim()) return;
    setSubmitLoading(true);
    const form = new FormData();
    form.append("title", matTitle.trim());
    form.append("order", String(matOrder));
    if (matFile) form.append("file", matFile);
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE}/courses/${id}/materials`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || "Failed to add");
      setMatTitle("");
      setMatFile(null);
      setMatOrder(0);
      api<CourseDetail>(`/courses/${id}`).then(setCourse);
    } catch (err) {
      alert(getSafeErrorMessage(err, "Could not add material."));
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteMaterial = (mid: string) => {
    if (!confirm("Remove this material?")) return;
    setDeletingId(mid);
    api(`/courses/${id}/materials/${mid}`, { method: "DELETE" })
      .then(() => setCourse((prev) => (prev ? { ...prev, materials: prev.materials.filter((m) => m.id !== mid) } : null)))
      .catch((err) => alert(getSafeErrorMessage(err, "Action failed.")))
      .finally(() => setDeletingId(null));
  };

  if (loading || !course) {
    return (
      <div>
        <Link href="/imam/courses" className="text-gmsa-green hover:underline text-sm mb-4 inline-block">← Back to courses</Link>
        <p className="text-gray-500">{loading ? "Loading..." : "Course not found."}</p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/imam/courses" className="text-gmsa-green hover:underline text-sm mb-4 inline-block">← Back to courses</Link>
      <div className="flex flex-wrap items-start gap-4 mb-6">
        {course.coverImageUrl && (
          <img src={course.coverImageUrl} alt="" className="w-40 h-28 object-cover rounded-lg border" />
        )}
        <div>
          <h1 className="text-2xl font-bold text-gmsa-green">{course.title}</h1>
          {course.description && <p className="text-gray-600 mt-1">{course.description}</p>}
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Add lecture material</h2>
        <form onSubmit={addMaterial} className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={matTitle} onChange={(e) => setMatTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">File (optional; can add later)</label>
            <input type="file" onChange={(e) => setMatFile(e.target.files?.[0] || null)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Order</label>
            <input type="number" min={0} value={matOrder} onChange={(e) => setMatOrder(parseInt(e.target.value, 10) || 0)} className="w-full border rounded-lg px-3 py-2 max-w-[120px]" />
          </div>
          <button type="submit" disabled={submitLoading} className="btn-primary">
            {submitLoading ? "Adding..." : "Add material"}
          </button>
        </form>
      </div>

      <h2 className="font-semibold text-gray-900 mb-4">Lecture materials</h2>
      <ul className="space-y-3">
        {course.materials.length === 0 && <p className="text-gray-500">No materials yet. Add one above.</p>}
        {course.materials.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-4 p-3 border rounded-lg bg-gray-50/50">
            <div>
              <span className="font-medium text-gray-900">{m.title}</span>
              {m.fileUrl && (
                <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-gmsa-green hover:underline text-sm">
                  Download
                </a>
              )}
              {!m.fileUrl && <span className="ml-2 text-gray-400 text-sm">(no file)</span>}
            </div>
            <button
              type="button"
              onClick={() => deleteMaterial(m.id)}
              disabled={!!deletingId}
              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
            >
              {deletingId === m.id ? "…" : "Remove"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
