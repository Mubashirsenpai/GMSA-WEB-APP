"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";
import { format } from "date-fns";

interface DonationRow {
  id: string;
  amount: number;
  projectType: string;
  donorName: string | null;
  donorReference: string | null;
  reference: string | null;
  status: string;
  createdAt: string;
  user: { name: string; email: string } | null;
}

const projectLabels: Record<string, string> = {
  WEEKLY_PROJECT: "GMSA Weekly GHS 2.00",
  MASJID_RENOVATION: "Masjid Renovation",
  FIISABIDILLAH: "Fiisabidillah",
};

export default function AdminDonationsPage() {
  const [list, setList] = useState<DonationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api<DonationRow[]>("/donations")
      .then(setList)
      .catch((e) => {
        setError(getSafeErrorMessage(e, "Failed to load donations."));
        setList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gmsa-green mb-4">Donations</h1>
        <p className="text-gray-500">Loading transaction details...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gmsa-green mb-2">Donations</h1>
      <p className="text-gray-600 mb-6">All donation transactions. Includes donor name, reference, amount, type, payment reference, and status.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
      )}

      {list.length === 0 ? (
        <p className="text-gray-500">No donations yet.</p>
      ) : (
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Donor</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Reference</th>
                <th className="text-right p-3 text-sm font-semibold text-gray-700">Amount (GHS)</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Payment ref</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                    {format(new Date(d.createdAt), "dd MMM yyyy, HH:mm")}
                  </td>
                  <td className="p-3 text-sm">
                    <span className="font-medium text-gray-900">{d.donorName || d.user?.name || "—"}</span>
                    {d.user?.email && (
                      <span className="block text-xs text-gray-500">{d.user.email}</span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-gray-600 max-w-[140px] truncate" title={d.donorReference || undefined}>
                    {d.donorReference || "—"}
                  </td>
                  <td className="p-3 text-sm text-right font-medium text-gray-900">{d.amount.toFixed(2)}</td>
                  <td className="p-3 text-sm text-gray-700">{projectLabels[d.projectType] ?? d.projectType}</td>
                  <td className="p-3 text-sm text-gray-500 font-mono text-xs truncate max-w-[120px]" title={d.reference || undefined}>
                    {d.reference || "—"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        d.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : d.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
