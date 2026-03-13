"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Session {
  id: string;
  title: string;
  dayOfWeek: number;
  time: string;
  description: string | null;
}

export default function MadrasaPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => {
    api<Session[]>("/registrations/madrasa/sessions")
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRegister = (sessionId: string) => {
    setRegistering(sessionId);
    api("/registrations/madrasa/register", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    })
      .then(() => alert("Registration submitted. Pending approval."))
      .catch((e) => alert(e.message || "Failed to register"))
      .finally(() => setRegistering(null));
  };

  if (loading) return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gmsa-green mb-6">Weekly Madrasa Sessions</h1>
      <p className="text-gray-600 mb-6">Register for weekly madrasa. You must be logged in. Approval is by the Secretary.</p>
      <div className="grid gap-4 max-w-2xl">
        {sessions.map((s) => (
          <div key={s.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-500">
                {DAYS[s.dayOfWeek]} · {s.time}
              </p>
              {s.description && <p className="text-gray-600 text-sm mt-1">{s.description}</p>}
            </div>
            <button
              onClick={() => handleRegister(s.id)}
              disabled={!!registering}
              className="btn-primary shrink-0"
            >
              {registering === s.id ? "Registering..." : "Register"}
            </button>
          </div>
        ))}
      </div>
      {sessions.length === 0 && <p className="text-gray-500">No sessions available yet.</p>}
    </div>
  );
}
