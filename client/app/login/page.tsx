"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, setToken } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registeredMessage, setRegisteredMessage] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "1") setRegisteredMessage(true);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await auth.login(username, password);
      setToken(res.token);
      if (typeof window !== "undefined") window.sessionStorage.setItem("gmsa_show_login_success", "1");
      const role = (res.user as { role?: string })?.role;
      if (role === "ADMIN") router.push("/admin");
      else if (role === "PRO") router.push("/pro");
      else if (role === "SECRETARY") router.push("/secretary");
      else router.push("/");
      router.refresh();
    } catch (err) {
      setError(getSafeErrorMessage(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <h1 className="text-3xl font-bold text-gmsa-green mb-6">Login</h1>
      {registeredMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 text-sm">
          Account created. Please sign in.
        </div>
      )}
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Username or email</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Enter your username or email" required autoComplete="username" />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" required autoComplete="current-password" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">Sign in</button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        Don&apos;t have an account? <Link href="/register" className="text-gmsa-green font-medium hover:underline">Register</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 max-w-md text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
