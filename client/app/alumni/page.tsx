"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api, auth } from "@/lib/api";

interface UserMe {
  name?: string;
  email?: string;
  phone?: string;
  whatsappContact?: string;
  gender?: string;
  programOfStudy?: string;
}

export default function AlumniPage() {
  const [user, setUser] = useState<UserMe | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappContact, setWhatsappContact] = useState("");
  const [gender, setGender] = useState("");
  const [programOfStudy, setProgramOfStudy] = useState("");
  const [yearCompleted, setYearCompleted] = useState("");
  const [occupation, setOccupation] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [meLoaded, setMeLoaded] = useState(false);

  useEffect(() => {
    auth.me()
      .then((u: unknown) => {
        const me = u as UserMe;
        setUser(me);
        if (me?.name) setName(me.name);
        if (me?.email) setEmail(me.email);
        if (me?.phone) setPhone(me.phone);
        if (me?.whatsappContact) setWhatsappContact(me.whatsappContact);
        if (me?.gender) setGender(me.gender);
        if (me?.programOfStudy) setProgramOfStudy(me.programOfStudy);
        setMeLoaded(true);
      })
      .catch(() => {
        setUser(null);
        setMeLoaded(true);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    api("/registrations/alumni", {
      method: "POST",
      body: JSON.stringify({
        yearCompleted: yearCompleted ? parseInt(yearCompleted, 10) : undefined,
        occupation: occupation || undefined,
        name: name || undefined,
        phone: phone || undefined,
        whatsappContact: whatsappContact || undefined,
        gender: gender || undefined,
        programOfStudy: programOfStudy || undefined,
      }),
    })
      .then(() => setDone(true))
      .catch((e: Error) => alert(e.message || "Failed to register"))
      .finally(() => setLoading(false));
  };

  if (done) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg text-center">
        <h2 className="text-2xl font-bold text-gmsa-green mb-4">Thank you!</h2>
        <p className="text-gray-600">Your alumni registration has been submitted. The Secretary will review and approve it.</p>
      </div>
    );
  }

  if (meLoaded && !user) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg text-center">
        <h1 className="text-3xl font-bold text-gmsa-green mb-4">Register as Alumni</h1>
        <p className="text-gray-600 mb-4">You must be logged in to register as alumni.</p>
        <Link href="/login" className="text-gmsa-green font-medium hover:underline">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-3xl font-bold text-gmsa-green mb-6">Register as Alumni</h1>
      <p className="text-gray-600 mb-6">Please provide your details below. After approval you will be listed as an alumnus of GMSA UDS NYC.</p>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" required readOnly={!!user?.email} />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border rounded-lg px-3 py-2" required>
            <option value="">Select</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Active contact (phone) <span className="text-red-500">*</span></label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">WhatsApp contact <span className="text-red-500">*</span></label>
          <input type="tel" value={whatsappContact} onChange={(e) => setWhatsappContact(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Program of study <span className="text-red-500">*</span></label>
          <input type="text" value={programOfStudy} onChange={(e) => setProgramOfStudy(e.target.value)} placeholder="e.g. BSc Computer Science" className="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Year completed (optional)</label>
          <input
            type="number"
            min="1990"
            max={new Date().getFullYear()}
            value={yearCompleted}
            onChange={(e) => setYearCompleted(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. 2020"
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Occupation (optional)</label>
          <input
            type="text"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. Software Engineer"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        <Link href="/" className="text-gmsa-green hover:underline">Back to home</Link>
      </p>
    </div>
  );
}
