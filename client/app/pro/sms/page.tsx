"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";
import { Send, Users } from "lucide-react";

export default function ProSmsPage() {
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({
    executives: false,
    ladies: false,
    men: false,
    alumni: false,
    generalPublic: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    const apiFilters: Record<string, boolean | string> = {};
    if (filters.executives) apiFilters.executives = true;
    if (filters.alumni) apiFilters.alumni = true;
    if (filters.generalPublic) apiFilters.generalPublic = true;
    if (filters.ladies && !filters.men) apiFilters.gender = "FEMALE";
    else if (filters.men && !filters.ladies) apiFilters.gender = "MALE";

    const hasFilter = filters.executives || filters.ladies || filters.men || filters.alumni || filters.generalPublic;
    if (!message.trim()) {
      setError("Enter a message.");
      return;
    }
    if (!hasFilter) {
      setError("Select at least one group (e.g. Executives, Ladies, Men, Alumni, or General public).");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("gmsa_token") : null;
      const res = await fetch("/api/sms/send-bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: message.trim(), filters: apiFilters }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (data as { error?: string }).error;
        if (res.status === 400 && typeof msg === "string") {
          if (msg.includes("Select at least one") || msg.includes("at least one filter")) {
            setError("Please select at least one recipient group.");
            return;
          }
          if (msg.includes("No recipients") || msg.includes("recipients found")) {
            setError("No recipients found for the selected groups. Make sure members have phone numbers saved in their accounts.");
            return;
          }
        }
        setError(getSafeErrorMessage(new Error(String(msg)), "Could not send SMS. Please try again."));
        return;
      }
      setResult(data as { sent: number; failed: number; total: number });
      setMessage("");
    } catch (err) {
      setError(getSafeErrorMessage(err, "Could not send SMS. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gmsa-green mb-2">Bulk SMS</h1>
      <p className="text-gray-600 mb-6">
        Send an SMS to registered members. Select one or more groups. Only users with a phone number on file will receive the message.
      </p>

      <form onSubmit={handleSubmit} className="card p-6 max-w-xl space-y-6">
        <div>
          <label className="block font-medium text-gray-700 mb-2">Recipients (select at least one)</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.executives}
                onChange={(e) => setFilters((f) => ({ ...f, executives: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span>Executives</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.ladies}
                onChange={(e) => setFilters((f) => ({ ...f, ladies: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span>Ladies</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.men}
                onChange={(e) => setFilters((f) => ({ ...f, men: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span>Men</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.alumni}
                onChange={(e) => setFilters((f) => ({ ...f, alumni: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span>Alumni</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.generalPublic}
                onChange={(e) => setFilters((f) => ({ ...f, generalPublic: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span>General public</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 min-h-[120px]"
            placeholder="Type your message here..."
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {result && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-lg text-sm">
            <Users className="w-5 h-5 shrink-0" />
            <span>Sent to {result.sent} of {result.total} recipients. {result.failed > 0 && `${result.failed} failed.`}</span>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          <Send className="w-4 h-4" />
          {loading ? "Sending..." : "Send SMS"}
        </button>
      </form>
    </div>
  );
}
