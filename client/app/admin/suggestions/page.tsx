"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { format } from "date-fns";

interface Suggestion {
  id: string;
  name: string;
  email: string;
  message: string;
  isPublic: boolean;
  createdAt: string;
}

export default function AdminSuggestionsPage() {
  const [list, setList] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Suggestion[]>("/suggestions")
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gmsa-green mb-2">Suggestions</h1>
      <p className="text-gray-600 mb-6">Suggestions submitted by visitors. No create form here — visitors submit from the public site.</p>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-4">
          {list.length === 0 ? (
            <p className="text-gray-500">No suggestions yet.</p>
          ) : (
            list.map((s) => (
              <div key={s.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="font-medium text-gray-900">{s.name}</span>
                  <span className="text-xs text-gray-500">{format(new Date(s.createdAt), "PPp")}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{s.email}</p>
                <p className="text-gray-700 whitespace-pre-wrap">{s.message}</p>
                {s.isPublic && <span className="inline-block mt-2 text-xs bg-gmsa-green/20 text-gmsa-green px-2 py-0.5 rounded">Public</span>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
