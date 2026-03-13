"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { api } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";
import { format } from "date-fns";

interface Author {
  id: string;
  name: string;
}

interface DiscussionMessage {
  id: string;
  body: string;
  createdAt: string;
  author: Author;
}

function getSocketUrl(): string {
  if (typeof window === "undefined") return "";
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  if (base) return base.replace(/\/api\/?$/, "").trim();
  if (window.location.hostname === "localhost") return "http://localhost:4000";
  return window.location.origin;
}

export default function WocomDiscussionPage() {
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<{ messages: DiscussionMessage[] }>("/wocom/discussion")
      .then((data) => setMessages(data.messages || []))
      .catch((e) => setError(getSafeErrorMessage(e, "Failed to load messages.")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("gmsa_token") : null;
    if (!token) return;
    const url = getSocketUrl();
    if (!url) return;
    const socket = io(url, { path: "/socket.io", auth: { token } });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("ladies_message", (msg: DiscussionMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    return () => {
      socket.off("connect").off("disconnect").off("ladies_message");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    setError("");
    try {
      const created = await api<DiscussionMessage>("/wocom/discussion", {
        method: "POST",
        body: JSON.stringify({ body: text }),
      });
      setMessages((prev) => {
        if (prev.some((m) => m.id === created.id)) return prev;
        return [...prev, created];
      });
      setBody("");
    } catch (e) {
      setError(getSafeErrorMessage(e, "Failed to send message."));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gmsa-green mb-2">Private discussion</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gmsa-green mb-2">Private discussion</h1>
      <p className="text-gray-600 mb-4">
        Ladies-only chat. Messages are visible only to women members and WOCOM.
      </p>
      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-block w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-400"}`} aria-hidden />
        <span className="text-sm text-gray-600">{connected ? "Live" : "Connecting…"}</span>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>
      )}
      <div className="card overflow-hidden flex flex-col" style={{ minHeight: "400px" }}>
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[320px] max-h-[60vh]">
          {messages.length === 0 && (
            <p className="text-gray-500 text-center py-8">No messages yet. Start the discussion below.</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className="flex flex-col">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-medium text-gray-900">{m.author.name}</span>
                <span className="text-xs text-gray-400">{format(new Date(m.createdAt), "dd MMM, HH:mm")}</span>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap break-words mt-0.5">{m.body}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex gap-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type a message..."
              rows={2}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm resize-y min-h-[44px]"
              maxLength={2000}
              disabled={sending}
            />
            <button type="submit" disabled={sending || !body.trim()} className="btn-primary self-end shrink-0 px-4 py-2">
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
