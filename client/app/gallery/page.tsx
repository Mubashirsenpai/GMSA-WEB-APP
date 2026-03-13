"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ContentCard } from "@/components/ContentCard";
import { DetailModal } from "@/components/DetailModal";

interface Album {
  id: string;
  name: string;
  coverImageUrl: string | null;
  images: { id: string; title: string | null; imageUrl: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export default function GalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    api<Album[]>("/gallery/albums")
      .then(setAlbums)
      .catch(() => setAlbums([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gmsa-green mb-6">Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album) => (
          <ContentCard
            key={album.id}
            imageUrl={album.coverImageUrl || album.images[0]?.imageUrl}
            title={album.name}
            subtitle={`${album.images.length} photo(s)`}
            updatedAt={album.updatedAt}
            createdAt={album.createdAt}
            viewDetailsHref={`/gallery/${album.id}`}
            onViewDetailsClick={() => setDetailId(album.id)}
          />
        ))}
      </div>
      {albums.length === 0 && <p className="text-gray-500">No albums yet.</p>}
      <DetailModal
        isOpen={detailId !== null}
        onClose={() => setDetailId(null)}
        type="gallery"
        id={detailId}
      />
    </div>
  );
}
