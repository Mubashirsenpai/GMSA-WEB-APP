"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";

export default function SuggestionsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setError("");
    setLoading(true);
    api("/suggestions", {
      method: "POST",
      body: JSON.stringify({ name, email, message }),
    })
      .then(() => setDone(true))
      .catch((err) => setError(getSafeErrorMessage(err, "Could not submit. Please try again.")))
      .finally(() => setLoading(false));
  };

  if (done) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg text-center">
        <h2 className="text-2xl font-bold text-gmsa-green mb-4">Thank you!</h2>
        <p className="text-gray-600">Your suggestion has been received. We appreciate your feedback.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-3xl font-bold text-gmsa-green mb-6">Suggestion Box</h1>
      <p className="text-gray-600 mb-6">Share your thoughts or feedback about GMSA UDS NYC. We’d love to hear from you.</p>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block font-medium text-gray-700 mb-1">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={5} required />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">Submit</button>
      </form>
    </div>
  );
}
