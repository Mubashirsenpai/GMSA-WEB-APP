"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";

export default function DonatePage() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [project, setProject] = useState<"WEEKLY_PROJECT" | "MASJID_RENOVATION" | "FIISABIDILLAH">("WEEKLY_PROJECT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const num = parseFloat(amount);
    if (!num || num < 0.01) {
      setError("Enter a valid amount (at least GHS 0.01).");
      return;
    }
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setLoading(true);
    try {
      const data = await api<{ authorization_url: string; reference: string }>("/donations/initialize", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          amount: num,
          projectType: project,
          donorReference: reference.trim() || undefined,
        }),
      });
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }
      setError("Could not start payment. Please try again.");
    } catch (err) {
      setError(getSafeErrorMessage(err, "Payment could not be started. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-3xl font-bold text-gmsa-green mb-6">Donate / Support</h1>
      <p className="text-gray-600 mb-6">
        Support GMSA UDS NYC. Choose a donation type, enter your name and amount, and you will be redirected to pay securely with Mobile Money or card.
      </p>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block font-medium text-gray-700 mb-1">Donation Type</label>
          <select
            value={project}
            onChange={(e) => setProject(e.target.value as "WEEKLY_PROJECT" | "MASJID_RENOVATION" | "FIISABIDILLAH")}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="WEEKLY_PROJECT">GMSA Weekly GHS 2.00 Project</option>
            <option value="MASJID_RENOVATION">GMSA Masjid Renovation Project</option>
            <option value="FIISABIDILLAH">Fiisabidillah</option>
          </select>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Reference (optional)</label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. In memory of..., or your reference number"
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Amount (GHS)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Redirecting to payment..." : "Donate"}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4 text-center">
        You will be redirected to Paystack to complete payment securely. We do not store your card or MoMo details.
      </p>
    </div>
  );
}
