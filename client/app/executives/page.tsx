"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { User } from "lucide-react";

interface Executive {
  id: string;
  position: string;
  order: number;
  academicYear: string | null;
  user: {
    id: string;
    name: string;
    position: string | null;
    avatarUrl: string | null;
    programOfStudy: string | null;
    level: string | null;
    phone: string | null;
    email: string;
  };
}

export default function ExecutivesPage() {
  const [list, setList] = useState<Executive[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<string[]>("/executives/years")
      .then(setYears)
      .catch(() => setYears([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = selectedYear ? `/executives?academicYear=${encodeURIComponent(selectedYear)}` : "/executives";
    api<Executive[]>(url)
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [selectedYear]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gmsa-green mb-6">Executive Board</h1>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label htmlFor="year-filter" className="font-medium text-gray-700">
          Academic year:
        </label>
        <select
          id="year-filter"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 min-w-[140px]"
        >
          <option value="">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((exec) => (
            <div key={exec.id} className="card p-0 flex flex-col sm:flex-row overflow-hidden">
              <div className="w-full sm:w-40 sm:min-w-[10rem] h-44 sm:h-auto sm:min-h-[160px] rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none bg-gmsa-green/10 flex items-center justify-center shrink-0 overflow-hidden">
                {exec.user.avatarUrl ? (
                  <img src={exec.user.avatarUrl} alt={exec.user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gmsa-green" />
                )}
              </div>
              <div className="p-4 sm:p-5 flex flex-col justify-center text-center sm:text-left min-w-0">
                <h3 className="font-semibold text-lg text-gray-900">{exec.user.name}</h3>
                <p className="text-gmsa-green font-medium mt-0.5">{exec.position}</p>
                {exec.user.programOfStudy && (
                  <p className="text-sm text-gray-600 mt-1">Program: {exec.user.programOfStudy}</p>
                )}
                {exec.user.level && (
                  <p className="text-sm text-gray-600">Level: {exec.user.level}</p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  Contact: {exec.user.phone || exec.user.email || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && list.length === 0 && (
        <p className="text-gray-500">
          {selectedYear ? `No executives for ${selectedYear}.` : "No executives listed yet."}
        </p>
      )}
    </div>
  );
}
