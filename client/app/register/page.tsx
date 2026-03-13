"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappContact, setWhatsappContact] = useState("");
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "">("");
  const [programOfStudy, setProgramOfStudy] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }
    if (!gender) {
      setError("Please select gender.");
      return;
    }
    const phoneVal = phone.trim();
    const whatsappVal = sameAsPhone ? phoneVal : whatsappContact.trim();
    if (!sameAsPhone && !whatsappVal) {
      setError("WhatsApp number is required when different from phone.");
      return;
    }
    setLoading(true);
    try {
      await auth.register({
        email,
        password,
        name,
        username: username.trim(),
        phone: phoneVal,
        whatsappContact: whatsappVal || undefined,
        gender,
        programOfStudy: programOfStudy.trim(),
      });
      router.push("/login?registered=1");
      router.refresh();
    } catch (err) {
      setError(getSafeErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <h1 className="text-3xl font-bold text-gmsa-green mb-2">Join GMSA UDS NYC</h1>
      <p className="text-gray-600 mb-6">
        We use your email and contact to send you updates, events, and reminders.
      </p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block font-medium text-gray-700 mb-1">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gmsa-green/30 focus:border-gmsa-green"
            placeholder="Your full name"
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gmsa-green/30 focus:border-gmsa-green"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gmsa-green/30 focus:border-gmsa-green"
            placeholder="Use this to sign in"
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Password (min 6 characters)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gmsa-green/30 focus:border-gmsa-green"
            minLength={6}
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Confirm password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gmsa-green/30 focus:border-gmsa-green"
            minLength={6}
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Phone or WhatsApp number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gmsa-green/30 focus:border-gmsa-green"
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sameAsPhone"
            checked={sameAsPhone}
            onChange={(e) => setSameAsPhone(e.target.checked)}
            className="rounded border-gray-300 text-gmsa-green focus:ring-gmsa-green"
          />
          <label htmlFor="sameAsPhone" className="text-sm text-gray-600">
            Use same number for WhatsApp
          </label>
        </div>
        {!sameAsPhone && (
          <div>
            <label className="block font-medium text-gray-700 mb-1">WhatsApp number</label>
            <input
              type="tel"
              value={whatsappContact}
              onChange={(e) => setWhatsappContact(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
              required
            />
          </div>
        )}

        <div>
          <label className="block font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as "MALE" | "FEMALE" | "")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-gmsa-green/30 focus:border-gmsa-green"
            required
          >
            <option value="">Select</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Program of study</label>
          <input
            type="text"
            value={programOfStudy}
            onChange={(e) => setProgramOfStudy(e.target.value)}
            placeholder="e.g. BSc Computer Science"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 rounded-lg font-medium disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-gmsa-green font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
