"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { buildCsv, downloadCsv } from "@/lib/csv";
import { Download } from "lucide-react";

const USER_FIELDS = [
  { key: "name" as const, label: "Full Name" },
  { key: "gender" as const, label: "Gender" },
  { key: "phone" as const, label: "Active contact" },
  { key: "whatsappContact" as const, label: "WhatsApp contact" },
  { key: "email" as const, label: "Email" },
  { key: "programOfStudy" as const, label: "Program of study" },
  { key: "level" as const, label: "Level" },
];

interface UserRow {
  name: string;
  email: string;
  phone: string | null;
  whatsappContact: string | null;
  gender: string | null;
  programOfStudy: string | null;
  level: string | null;
}

interface ApprovedMember {
  id: string;
  user: UserRow;
}

interface EventReg {
  id: string;
  event: { id: string; title: string; startAt: string };
  user: UserRow;
}

interface MadrasaReg {
  id: string;
  session: { id: string; title: string; dayOfWeek: number; time: string };
  user: UserRow;
}

interface ApprovedAlumni {
  id: string;
  yearCompleted: number | null;
  occupation: string | null;
  user: UserRow;
}

export default function SecretaryRegistrationsPage() {
  const [members, setMembers] = useState<ApprovedMember[]>([]);
  const [eventRegs, setEventRegs] = useState<EventReg[]>([]);
  const [madrasaRegs, setMadrasaRegs] = useState<MadrasaReg[]>([]);
  const [alumni, setAlumni] = useState<ApprovedAlumni[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<ApprovedMember[]>("/registrations/members/approved").catch(() => []),
      api<EventReg[]>("/registrations/events/registrations").catch(() => []),
      api<MadrasaReg[]>("/registrations/madrasa/registrations").catch(() => []),
      api<ApprovedAlumni[]>("/registrations/alumni/approved").catch(() => []),
    ]).then(([m, e, mr, a]) => {
      setMembers(m);
      setEventRegs(e);
      setMadrasaRegs(mr);
      setAlumni(a);
    }).finally(() => setLoading(false));
  }, []);

  const toUserRow = (u: UserRow): Record<string, unknown> => ({
    name: u.name ?? "",
    gender: u.gender ?? "",
    phone: u.phone ?? "",
    whatsappContact: u.whatsappContact ?? "",
    email: u.email ?? "",
    programOfStudy: u.programOfStudy ?? "",
    level: u.level ?? "",
  });

  const exportMembers = () => {
    const rows = members.map((m) => toUserRow(m.user));
    downloadCsv("gmsa-approved-members.csv", buildCsv(rows, USER_FIELDS));
  };

  const exportEventRegs = () => {
    const cols = [...USER_FIELDS, { key: "event" as const, label: "Event" }, { key: "eventDate" as const, label: "Event date" }];
    const rows = eventRegs.map((r) => ({
      ...toUserRow(r.user),
      event: r.event?.title ?? "",
      eventDate: r.event?.startAt ? new Date(r.event.startAt).toLocaleDateString() : "",
    }));
    downloadCsv("gmsa-event-registrations.csv", buildCsv(rows, cols));
  };

  const exportMadrasaRegs = () => {
    const cols = [...USER_FIELDS, { key: "session" as const, label: "Session" }, { key: "time" as const, label: "Time" }];
    const rows = madrasaRegs.map((r) => ({
      ...toUserRow(r.user),
      session: r.session?.title ?? "",
      time: r.session?.time ?? "",
    }));
    downloadCsv("gmsa-madrasa-registrations.csv", buildCsv(rows, cols));
  };

  const exportAlumni = () => {
    const cols = [...USER_FIELDS, { key: "yearCompleted" as const, label: "Year completed" }, { key: "occupation" as const, label: "Occupation" }];
    const rows = alumni.map((a) => ({
      ...toUserRow(a.user),
      yearCompleted: a.yearCompleted ?? "",
      occupation: a.occupation ?? "",
    }));
    downloadCsv("gmsa-alumni.csv", buildCsv(rows, cols));
  };

  if (loading) return <p className="text-gray-600">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gmsa-green mb-2">Registered members</h1>
      <p className="text-gray-600 mb-6">View approved members and registrations. Export any list as CSV.</p>

      <section className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Approved members</h2>
          <button type="button" onClick={exportMembers} disabled={members.length === 0} className="btn-secondary text-sm inline-flex items-center gap-1.5 w-full sm:w-auto justify-center">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
        <div className="card overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3">Full Name</th>
                <th className="text-left p-3">Gender</th>
                <th className="text-left p-3">Active contact</th>
                <th className="text-left p-3">WhatsApp</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Program</th>
                <th className="text-left p-3">Level</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="p-3">{m.user.name}</td>
                  <td className="p-3">{m.user.gender ?? "—"}</td>
                  <td className="p-3">{m.user.phone ?? "—"}</td>
                  <td className="p-3">{m.user.whatsappContact ?? "—"}</td>
                  <td className="p-3">{m.user.email}</td>
                  <td className="p-3">{m.user.programOfStudy ?? "—"}</td>
                  <td className="p-3">{m.user.level ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {members.length === 0 && <p className="text-gray-500 mt-2">No approved members yet.</p>}
      </section>

      <section className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Event registrations</h2>
          <button type="button" onClick={exportEventRegs} disabled={eventRegs.length === 0} className="btn-secondary text-sm inline-flex items-center gap-1.5 w-full sm:w-auto justify-center">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
        <div className="card overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full text-sm min-w-[400px]">
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

      <section className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Madrasa registrations</h2>
          <button type="button" onClick={exportMadrasaRegs} disabled={madrasaRegs.length === 0} className="btn-secondary text-sm inline-flex items-center gap-1.5 w-full sm:w-auto justify-center">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
        <div className="card overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full text-sm min-w-[400px]">
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

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Approved alumni</h2>
          <button type="button" onClick={exportAlumni} disabled={alumni.length === 0} className="btn-secondary text-sm inline-flex items-center gap-1.5 w-full sm:w-auto justify-center">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
        <div className="card overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3">Full Name</th>
                <th className="text-left p-3">Gender</th>
                <th className="text-left p-3">Active contact</th>
                <th className="text-left p-3">WhatsApp</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Program</th>
                <th className="text-left p-3">Year completed</th>
                <th className="text-left p-3">Occupation</th>
              </tr>
            </thead>
            <tbody>
              {alumni.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="p-3">{a.user.name}</td>
                  <td className="p-3">{a.user.gender ?? "—"}</td>
                  <td className="p-3">{a.user.phone ?? "—"}</td>
                  <td className="p-3">{a.user.whatsappContact ?? "—"}</td>
                  <td className="p-3">{a.user.email}</td>
                  <td className="p-3">{a.user.programOfStudy ?? "—"}</td>
                  <td className="p-3">{a.yearCompleted ?? "—"}</td>
                  <td className="p-3">{a.occupation ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {alumni.length === 0 && <p className="text-gray-500 mt-2">No approved alumni yet.</p>}
      </section>
    </div>
  );
}
