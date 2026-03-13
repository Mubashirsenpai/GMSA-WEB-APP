"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { GraduationCap } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  createdBy: { id: string; name: string };
  _count?: { materials: number };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Course[]>("/courses")
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gmsa-green mb-2 flex items-center gap-2">
        <GraduationCap className="w-8 h-8" />
        Courses
      </h1>
      <p className="text-gray-600 mb-8">Browse courses and download lecture materials for review.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c) => (
          <Link
            key={c.id}
            href={`/courses/${c.id}`}
            className="card overflow-hidden flex flex-col hover:shadow-lg transition"
          >
            {c.coverImageUrl ? (
              <div className="aspect-video bg-gray-100">
                <img src={c.coverImageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-video bg-gmsa-green/10 flex items-center justify-center">
                <GraduationCap className="w-12 h-12 text-gmsa-green/50" />
              </div>
            )}
            <div className="p-4 flex-1 flex flex-col">
              <h2 className="font-semibold text-gray-900">{c.title}</h2>
              {(c._count?.materials ?? 0) > 0 && (
                <p className="text-sm text-gray-500 mt-0.5">{c._count!.materials} material(s)</p>
              )}
              {c.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{c.description}</p>}
              <span className="text-gmsa-green font-medium text-sm mt-3 inline-block">View & download →</span>
            </div>
          </Link>
        ))}
      </div>
      {courses.length === 0 && <p className="text-gray-500">No courses yet.</p>}
    </div>
  );
}
