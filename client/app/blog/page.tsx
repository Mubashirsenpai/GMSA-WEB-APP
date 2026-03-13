"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { ContentCard } from "@/components/ContentCard";
import { DetailModal } from "@/components/DetailModal";

interface Post {
  id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
  author: { id: string; name: string };
  coverImageUrl: string | null;
  _count: { likes: number; comments: number; reshares: number };
  createdAt?: string;
  updatedAt?: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    api<Post[]>("/blogs")
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gmsa-green mb-6">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p) => (
          <ContentCard
            key={p.id}
            imageUrl={p.coverImageUrl}
            title={p.title}
            subtitle={p.publishedAt ? `${p.author.name} · ${format(new Date(p.publishedAt), "PPP")}` : `${p.author.name} · Draft`}
            updatedAt={p.updatedAt}
            createdAt={p.createdAt}
            viewDetailsHref={`/blog/${p.id}`}
            onViewDetailsClick={() => setDetailId(p.id)}
          >
            <div className="flex gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {p._count.likes}</span>
              <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {p._count.comments}</span>
              <span className="flex items-center gap-1"><Share2 className="w-4 h-4" /> {p._count.reshares}</span>
            </div>
          </ContentCard>
        ))}
      </div>
      {posts.length === 0 && <p className="text-gray-500">No posts yet.</p>}
      <DetailModal
        isOpen={detailId !== null}
        onClose={() => setDetailId(null)}
        type="blog"
        id={detailId}
      />
    </div>
  );
}
