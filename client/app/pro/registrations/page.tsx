"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { buildCsv, downloadCsv } from "@/lib/csv";
import { Download } from "lucide-react";

interface UserRow {
  name: string;
  email: string;
  phone: string | null;
  whatsappContact: string | null;
  gender: string | null;
  programOfStudy: string | null;
  level: string | null;
}

interface EventReg {
  id: string;
  event: { id: string; title: string; startAt: string };
  user: UserRow;
}

interface MadrasaReg {
  id: string;
  session: { id: string; title: string; time: string };
  user: UserRow;
}

const USER_FIELDS = [
  { key: "name" as const, label: "Full Name" },
  { key: "gender" as const, label: "Gender" },
  { key: "phone" as const, label: "Active contact" },
  { key: "whatsappContact" as const, label: "WhatsApp contact" },
  { key: "email" as const, label: "Email" },
  { key: "programOfStudy" as const, label: "Program of study" },
  { key: "level" as const, label: "Level" },
];

export default function ProRegistrationsPage() {
  const [eventRegs, setEventRegs] = useState<EventReg[]>([]);
  const [madrasaRegs, setMadrasaRegs] = useState<MadrasaReg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<EventReg[]>("/registrations/events/registrations").catch(() => []),
      api<MadrasaReg[]>("/registrations/madrasa/registrations").catch(() => []),
    ]).then(([e, mr]) => {
      setEventRegs(e);
      setMadrasaRegs(mr);
    }).finally(() => setLoading(false));
  }, []);

  const toRow = (u: UserRow) => ({
    name: u.name ?? "",
    gender: u.gender ?? "",
    phone: u.phone ?? "",
    whatsappContact: u.whatsappContact ?? "",
    email: u.email ?? "",
    programOfStudy: u.programOfStudy ?? "",
    level: u.level ?? "",
  });

  const exportEventRegs = () => {
    const cols = [...USER_FIELDS, { key: "event" as const, label: "Event" }, { key: "eventDate" as const, label: "Event date" }];
    const rows = eventRegs.map((r) => ({
      ...toRow(r.user),
      event: r.event?.title ?? "",
      eventDate: r.event?.startAt ? new Date(r.event.startAt).toLocaleDateString() : "",
    }));
    downloadCsv("gmsa-event-registrations.csv", buildCsv(rows, cols));
  };

  const exportMadrasaRegs = () => {
    const cols = [...USER_FIELDS, { key: "session" as const, label: "Session" }, { key: "time" as const, label: "Time" }];
    const rows = madrasaRegs.map((r) => ({
      ...toRow(r.user),
      session: r.session?.title ?? "",
      time: r.session?.time ?? "",
    }));
    downloadCsv("gmsa-madrasa-registrations.csv", buildCsv(rows, cols));
  };

  if (loading) return <p className="text-gray-600">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gmsa-green mb-2">Registrations</h1>
      <p className="text-gray-600 mb-6">Event and madrasa registrations. Export as CSV.</p>

      <section className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Event registrations</h2>
          <button type="button" onClick={exportEventRegs} disabled={eventRegs.length === 0} className="btn-secondary text-sm inline-flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3">Event</th>
                <th className="text-left p-3">Full Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Contact</th>
                <th className="text-left p-3">Program</th>
              </tr>
            </thead>
            <tbody>
              {eventRegs.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="p-3">{r.event?.title ?? "—"}</td>
                  <td className="p-3">{r.user.name}</td>
                  <td className="p-3">{r.user.email}</td>
                  <td className="p-3">{r.user.phone ?? r.user.whatsappContact ?? "—"}</td>
                  <td className="p-3">{r.user.programOfStudy ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {eventRegs.length === 0 && <p className="text-gray-500 mt-2">No event registrations yet.</p>}
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Madrasa registrations</h2>
          <button type="button" onClick={exportMadrasaRegs} disabled={madrasaRegs.length === 0} className="btn-secondary text-sm inline-flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3">Session</th>
                <th className="text-left p-3">Full Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Contact</th>
                <th className="text-left p-3">Program</th>
              </tr>
            </thead>
            <tbody>
              {madrasaRegs.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="p-3">{r.session?.title ?? "—"} ({r.session?.time})</td>
                  <td className="p-3">{r.user.name}</td>
                  <td className="p-3">{r.user.email}</td>
                  <td className="p-3">{r.user.phone ?? r.user.whatsappContact ?? "—"}</td>
                  <td className="p-3">{r.user.programOfStudy ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {madrasaRegs.length === 0 && <p className="text-gray-500 mt-2">No madrasa registrations yet.</p>}
      </section>
    </div>
  );
}
