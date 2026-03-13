"use client";

import { useEffect, useState, useRef } from "react";
import { api, uploadImage } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";
import { User, Pencil, Trash2 } from "lucide-react";

interface ExecutiveRow {
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

interface UserOption {
  id: string;
  name: string;
  email: string;
  isExecutive: boolean;
  programOfStudy?: string | null;
  phone?: string | null;
}

export default function AdminExecutivesPage() {
  const [list, setList] = useState<ExecutiveRow[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const addImageFile = useRef<File | null>(null);
  const editImageFile = useRef<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([
      api<ExecutiveRow[]>("/executives"),
      api<{ users: UserOption[] }>("/users?limit=300"),
    ])
      .then(([execs, userRes]) => {
        setList(execs);
        const nonExecs = (userRes.users || []).filter((u: UserOption) => !u.isExecutive);
        setUsers(nonExecs);
      })
      .catch((e) => setError(getSafeErrorMessage(e, "Failed to load.")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const userId = (form.elements.namedItem("userId") as HTMLSelectElement)?.value?.trim();
    const position = (form.elements.namedItem("position") as HTMLInputElement)?.value?.trim();
    const academicYear = (form.elements.namedItem("academicYear") as HTMLInputElement)?.value?.trim();
    const programOfStudy = (form.elements.namedItem("programOfStudy") as HTMLInputElement)?.value?.trim();
    const phone = (form.elements.namedItem("phone") as HTMLInputElement)?.value?.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value?.trim();
    if (!userId || !position || !academicYear || !programOfStudy || !phone || !email) {
      setError("All fields are required (including Academic year e.g. 2026/2027).");
      return;
    }
    if (!addImageFile.current) {
      setError("Photo is required.");
      return;
    }
    setSubmitLoading(true);
    setError("");
    try {
      const avatarUrl = await uploadImage(addImageFile.current);
      await api("/executives", {
        method: "POST",
        body: JSON.stringify({
          userId,
          position,
          academicYear,
          programOfStudy,
          phone,
          email,
          avatarUrl,
          tenureStart: new Date().toISOString(),
        }),
      });
      setShowAdd(false);
      addImageFile.current = null;
      load();
    } catch (e) {
      setError(getSafeErrorMessage(e, "Failed to add executive."));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>, execId: string) => {
    e.preventDefault();
    const form = e.currentTarget;
    const position = (form.elements.namedItem("position") as HTMLInputElement)?.value?.trim();
    const academicYear = (form.elements.namedItem("academicYear") as HTMLInputElement)?.value?.trim();
    const programOfStudy = (form.elements.namedItem("programOfStudy") as HTMLInputElement)?.value?.trim();
    const phone = (form.elements.namedItem("phone") as HTMLInputElement)?.value?.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value?.trim();
    setSubmitLoading(true);
    setError("");
    try {
      let avatarUrl: string | undefined;
      if (editImageFile.current) {
        avatarUrl = await uploadImage(editImageFile.current);
      }
      await api(`/executives/${execId}`, {
        method: "PUT",
        body: JSON.stringify({
          ...(position && { position }),
          academicYear: academicYear || null,
          ...(avatarUrl && { avatarUrl }),
          programOfStudy: programOfStudy || null,
          phone: phone || null,
          email: email || null,
        }),
      });
      setEditingId(null);
      editImageFile.current = null;
      load();
    } catch (e) {
      setError(getSafeErrorMessage(e, "Failed to update."));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRemove = async (execId: string) => {
    if (!confirm("Remove this person from the executive board?")) return;
    setRemovingId(execId);
    setError("");
    try {
      await api(`/executives/${execId}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(getSafeErrorMessage(e, "Failed to remove."));
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gmsa-green mb-4">Executive board</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gmsa-green mb-2">Executive board</h1>
      <p className="text-gray-600 mb-6">
        Add, edit, or remove executives. They appear on the public Executives page (View others) and can access the executive dashboard (virtual meetings and live discussions).
      </p>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="btn-primary"
        >
          + Add executive
        </button>
      </div>

      {showAdd && (
        <div className="card p-6 mb-6 max-w-md">
          <h3 className="font-semibold text-gray-900 mb-4">Add executive</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">User *</label>
              <select
                name="userId"
                required
                className="w-full border rounded-lg px-3 py-2"
                onChange={(e) => {
                  const u = users.find((x) => x.id === e.target.value);
                  if (u) {
                    const form = e.target.form;
                    if (form) {
                      (form.elements.namedItem("programOfStudy") as HTMLInputElement).value = u.programOfStudy || "";
                      (form.elements.namedItem("phone") as HTMLInputElement).value = u.phone || "";
                      (form.elements.namedItem("email") as HTMLInputElement).value = u.email || "";
                    }
                  }
                }}
              >
                <option value="">Select user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              {users.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">All users are already on the board.</p>
              )}
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Position *</label>
              <input
                name="position"
                type="text"
                required
                placeholder="e.g. President, Secretary"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Academic year *</label>
              <input
                name="academicYear"
                type="text"
                required
                placeholder="e.g. 2026/2027"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Program of study *</label>
              <input
                name="programOfStudy"
                type="text"
                required
                placeholder="e.g. BSc Computer Science"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Phone *</label>
              <input
                name="phone"
                type="tel"
                required
                placeholder="Active contact"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Email *</label>
              <input
                name="email"
                type="email"
                required
                placeholder="Email address"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Photo *</label>
              <input
                type="file"
                accept="image/*"
                required
                className="w-full text-sm"
                onChange={(e) => {
                  addImageFile.current = e.target.files?.[0] || null;
                }}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitLoading} className="btn-primary">
                {submitLoading ? "Adding..." : "Add"}
              </button>
              <button
                type="button"
                onClick={() => { setShowAdd(false); addImageFile.current = null; }}
                className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((exec) => (
          <div key={exec.id} className="card p-0 flex flex-col sm:flex-row overflow-hidden">
            <div className="w-full sm:w-36 sm:min-w-[9rem] h-36 sm:h-auto sm:min-h-[140px] rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none bg-gmsa-green/10 flex items-center justify-center shrink-0 overflow-hidden">
              {exec.user.avatarUrl ? (
                <img
                  src={exec.user.avatarUrl}
                  alt={exec.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-gmsa-green" />
              )}
            </div>
            <div className="p-3 sm:p-4 flex flex-col justify-center min-w-0 flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-gray-900">{exec.user.name}</h3>
              <p className="text-gmsa-green font-medium text-sm">{exec.position}</p>
              {exec.academicYear && (
                <p className="text-xs text-gray-500 mt-0.5">Year: {exec.academicYear}</p>
              )}
              {(exec.user.programOfStudy || exec.user.level || exec.user.phone || exec.user.email) && (
                <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                  {exec.user.programOfStudy && <p>Program: {exec.user.programOfStudy}</p>}
                  {exec.user.level && <p>Level: {exec.user.level}</p>}
                  {exec.user.phone && <p>Phone: {exec.user.phone}</p>}
                  {exec.user.email && <p>Email: {exec.user.email}</p>}
                </div>
              )}
              {editingId === exec.id ? (
              <form
                onSubmit={(e) => handleEdit(e, exec.id)}
                className="mt-3 w-full space-y-2"
              >
                <input
                  name="position"
                  type="text"
                  placeholder="Position"
                  defaultValue={exec.position}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                />
                <input
                  name="academicYear"
                  type="text"
                  placeholder="Academic year e.g. 2026/2027"
                  defaultValue={exec.academicYear ?? ""}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                />
                <input
                  name="programOfStudy"
                  type="text"
                  placeholder="Program of study"
                  defaultValue={exec.user.programOfStudy ?? ""}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                />
                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                  defaultValue={exec.user.phone ?? ""}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  defaultValue={exec.user.email ?? ""}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                />
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-xs"
                  onChange={(e) => {
                    editImageFile.current = e.target.files?.[0] || null;
                  }}
                />
                <div className="flex gap-2 justify-center">
                  <button type="submit" disabled={submitLoading} className="btn-primary text-sm px-3 py-1.5">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingId(null); editImageFile.current = null; }}
                    className="border rounded px-3 py-1.5 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex gap-2 mt-3 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => setEditingId(exec.id)}
                  className="p-2 text-gray-600 hover:text-gmsa-green hover:bg-gmsa-green/10 rounded-lg"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(exec.id)}
                  disabled={!!removingId}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  title="Remove from board"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 && !loading && (
        <p className="text-gray-500">No executives yet. Add one above to show them on the public Executives page.</p>
      )}
    </div>
  );
}
