"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Heart, MessageCircle, Share2 } from "lucide-react";

interface Post {
  id: string;
  title: string;
  body: string;
  author: { name: string };
  publishedAt: string | null;
  coverImageUrl: string | null;
  comments: { id: string; body: string; user: { name: string }; createdAt: string }[];
  _count: { likes: number; reshares: number };
  userLiked: boolean;
  userReshared: boolean;
}

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api<Post>(`/blogs/${params.id}`)
      .then(setPost)
      .catch(() => setPost(null));
  }, [params.id]);

  const handleLike = () => {
    if (!post) return;
    const method = post.userLiked ? "DELETE" : "POST";
    api<{ liked: boolean; count: number }>(`/blogs/${post.id}/like`, { method })
      .then((r) => setPost((p) => p ? { ...p, userLiked: r.liked, _count: { ...p._count, likes: r.count } } : null))
      .catch(() => {});
  };

  const handleReshare = () => {
    if (!post) return;
    api<{ count: number }>(`/blogs/${post.id}/reshare`, { method: "POST" })
      .then((r) => setPost((p) => p ? { ...p, userReshared: true, _count: { ...p._count, reshares: r.count } } : null))
      .catch(() => {});
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !comment.trim()) return;
    setSubmitting(true);
    api<{ id: string; body: string; user: { name: string }; createdAt: string }>(`/blogs/${post.id}/comment`, {
      method: "POST",
      body: JSON.stringify({ body: comment }),
    })
      .then((c) => setPost((p) => p ? { ...p, comments: [c, ...p.comments] } : null))
      .catch(() => {})
      .finally(() => {
        setSubmitting(false);
        setComment("");
      });
  };

  if (!post) return <div className="container mx-auto px-4 py-12">Post not found.</div>;

  return (
    <article className="container mx-auto px-4 py-8 max-w-3xl">
      {post.coverImageUrl && (
        <div className="aspect-video rounded-xl overflow-hidden mb-6">
          <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
      <p className="text-gray-500 mt-2">
        {post.author.name} · {post.publishedAt ? format(new Date(post.publishedAt), "PPP") : "Draft"}
      </p>
      <div className="flex gap-4 mt-4">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 ${post.userLiked ? "text-red-500" : "text-gray-500"}`}
        >
          <Heart className="w-5 h-5" fill={post.userLiked ? "currentColor" : "none"} /> {post._count.likes}
        </button>
        <span className="flex items-center gap-1 text-gray-500">
          <MessageCircle className="w-5 h-5" /> {post.comments?.length ?? 0}
        </span>
        <button
          onClick={handleReshare}
          disabled={post.userReshared}
          className="flex items-center gap-1 text-gray-500 disabled:opacity-50"
        >
          <Share2 className="w-5 h-5" /> {post._count.reshares}
        </button>
      </div>
      <div className="prose mt-6 text-gray-700 whitespace-pre-wrap">{post.body}</div>

      <section className="mt-10 border-t pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Comments</h3>
        <form onSubmit={handleComment} className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full border rounded-lg p-3"
            rows={3}
          />
          <button type="submit" disabled={submitting} className="btn-primary mt-2">
            Post comment
          </button>
        </form>
        <ul className="space-y-3">
          {post.comments.map((c) => (
            <li key={c.id} className="border-l-2 border-gmsa-green/30 pl-3">
              <p className="font-medium text-sm">{c.user.name}</p>
              <p className="text-gray-700">{c.body}</p>
              <p className="text-xs text-gray-500">{format(new Date(c.createdAt), "PPP")}</p>
            </li>
          ))}
        </ul>
      </section>
      <Link href="/blog" className="inline-block mt-6 text-gmsa-green hover:underline">
        ← Back to blog
      </Link>
    </article>
  );
}
