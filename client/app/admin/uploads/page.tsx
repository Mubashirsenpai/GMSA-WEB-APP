"use client";

import Link from "next/link";

export default function AdminUploadsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gmsa-green mb-4">Uploads</h1>
      <p className="text-gray-600 mb-6">Upload and manage content. You can also use the PRO area for announcements, events, gallery, and blog.</p>
      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
        <Link href="/downloads" className="card p-5 hover:shadow-md transition block">
          <h2 className="font-semibold text-gray-900 mb-1">Prayer timetables</h2>
          <p className="text-sm text-gray-500">View downloads page. Upload via API or add upload form here.</p>
        </Link>
        <Link href="/gallery" className="card p-5 hover:shadow-md transition block">
          <h2 className="font-semibold text-gray-900 mb-1">Gallery</h2>
          <p className="text-sm text-gray-500">Manage gallery albums and images.</p>
        </Link>
      </div>
    </div>
  );
}
