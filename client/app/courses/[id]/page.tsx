"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { GraduationCap, FileText, Download } from "lucide-react";

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

export default function CourseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api<CourseDetail>(`/courses/${id}`)
      .then(setCourse)
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  if (!course) return <div className="container mx-auto px-4 py-12 text-center">Course not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/courses" className="text-gmsa-green hover:underline text-sm mb-6 inline-block">← All courses</Link>

      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {course.coverImageUrl && (
          <img src={course.coverImageUrl} alt="" className="w-full sm:w-72 h-48 object-cover rounded-xl border" />
        )}
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gmsa-green flex items-center gap-2">
            <GraduationCap className="w-8 h-8" />
            {course.title}
          </h1>
          {course.description && <p className="text-gray-600 mt-2">{course.description}</p>}
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-gmsa-green" />
        Lecture materials
      </h2>
      <ul className="space-y-3">
        {course.materials.length === 0 && <p className="text-gray-500">No materials in this course yet.</p>}
        {course.materials.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-4 p-4 border rounded-xl bg-gray-50/50 hover:bg-gray-50">
            <span className="font-medium text-gray-900">{m.title}</span>
            {m.fileUrl ? (
              <a
                href={m.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gmsa-green hover:underline font-medium text-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            ) : (
              <span className="text-gray-400 text-sm">(no file)</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
