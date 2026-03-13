"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";

interface PendingMember {
  id: string;
  status: string;
  user: { id: string; name: string; email: string; phone: string | null; level: string | null; gender: string | null };
}

export default function SecretaryApprovalsPage() {
  const [members, setMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    api<PendingMember[]>("/registrations/members/pending")
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = (id: string, status: "APPROVED" | "REJECTED") => {
    setActionId(id);
    api(`/registrations/members/${id}`, { method: "PATCH", body: JSON.stringify({ status }) })
      .then(() => setMembers((m) => m.filter((x) => x.id !== id)))
      .catch((e) => alert(getSafeErrorMessage(e, "Action failed. Please try again.")))
      .finally(() => setActionId(null));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gmsa-green mb-4">Pending approvals</h1>
      <p className="text-gray-600 mb-6">Member registration requests. Approve or reject each.</p>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {members.length === 0 && <p className="text-gray-500">No pending member approvals.</p>}
          {members.map((m) => (
            <div key={m.id} className="card p-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium truncate">{m.user.name}</p>
                <p className="text-sm text-gray-500 break-all">{m.user.email}</p>
                {m.user.phone && <p className="text-sm text-gray-500">{m.user.phone}</p>}
                {m.user.level && <p className="text-sm text-gray-500">Level: {m.user.level}</p>}
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  onClick={() => handleApprove(m.id, "APPROVED")}
                  disabled={!!actionId}
                  className="btn-primary text-sm"
                >
                  {actionId === m.id ? "..." : "Approve"}
                </button>
                <button
                  onClick={() => handleApprove(m.id, "REJECTED")}
                  disabled={!!actionId}
                  className="border border-red-500 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
