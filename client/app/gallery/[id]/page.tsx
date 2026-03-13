"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Album {
  id: string;
  name: string;
  coverImageUrl: string | null;
  images: { id: string; title: string | null; imageUrl: string }[];
}

export default function GalleryAlbumPage({ params }: { params: { id: string } }) {
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Album>(`/gallery/albums/${params.id}`)
      .then(setAlbum)
      .catch(() => setAlbum(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  if (!album) return <div className="container mx-auto px-4 py-12 text-center">Album not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/gallery" className="text-gmsa-green hover:underline mb-6 inline-block">← Back to gallery</Link>
      <h1 className="text-3xl font-bold text-gmsa-green mb-6">{album.name}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {album.images.map((img) => (
          <div key={img.id} className="card overflow-hidden">
            <a href={img.imageUrl} target="_blank" rel="noopener noreferrer" className="block aspect-square">
              <img src={img.imageUrl} alt={img.title || "Gallery image"} className="w-full h-full object-cover hover:opacity-95 transition" />
            </a>
            {img.title && <p className="p-2 text-sm text-gray-600">{img.title}</p>}
          </div>
        ))}
      </div>
      {album.images.length === 0 && <p className="text-gray-500">No photos in this album yet.</p>}
    </div>
  );
}
