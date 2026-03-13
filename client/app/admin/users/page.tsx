"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/safeError";

interface UserRow {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  level: string | null;
  gender: string | null;
  isExecutive: boolean;
  isAlumni: boolean;
  position: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "MEMBER",
    phone: "",
    gender: "",
    level: "",
  });

  const load = () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (roleFilter) params.set("role", roleFilter);
    if (search) params.set("search", search);
    api<{ users: UserRow[]; total: number }>(`/users?${params}`)
      .then((data) => {
        setUsers(data.users);
        setTotal(data.total);
      })
      .catch((e) => {
        setError(getSafeErrorMessage(e, "Failed to load users. Please try again."));
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [roleFilter, search]);

  const changeRole = (userId: string, newRole: string) => {
    setUpdatingId(userId);
    api(`/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role: newRole }),
    })
      .then(() => load())
      .catch((e) => alert(getSafeErrorMessage(e, "Action failed. Please try again.")))
      .finally(() => setUpdatingId(null));
  };

  const deleteUser = (userId: string) => {
    if (!confirm("Permanently delete this user? This cannot be undone.")) return;
    setDeletingId(userId);
    api(`/users/${userId}`, { method: "DELETE" })
      .then(() => load())
      .catch((e) => alert(getSafeErrorMessage(e, "Could not delete. Please try again.")))
      .finally(() => setDeletingId(null));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      setCreateError("Name, email and password are required.");
      return;
    }
    if (createForm.password.length < 6) {
      setCreateError("Password must be at least 6 characters.");
      return;
    }
    setCreateLoading(true);
    api("/users", {
      method: "POST",
        body: JSON.stringify({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
        phone: createForm.phone.trim() || undefined,
        gender: createForm.gender || undefined,
        level: createForm.level.trim() || undefined,
      }),
    })
      .then(() => {
        setCreateForm({ name: "", email: "", password: "", role: "MEMBER", phone: "", gender: "", level: "" });
        setShowCreate(false);
        load();
      })
      .catch((e) => setCreateError(getSafeErrorMessage(e, "Failed to create user. Please try again.")))
      .finally(() => setCreateLoading(false));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gmsa-green mb-4">Users</h1>
      <p className="text-gray-600 mb-4">View and manage user accounts.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
      )}

      <div className="mb-6">
        <button type="button" onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          {showCreate ? "Cancel" : "+ Create user"}
        </button>
        {showCreate && (
          <form onSubmit={handleCreateUser} className="mt-4 card p-6 max-w-md space-y-4">
            <h3 className="font-semibold text-gray-900">Create new user</h3>
            {createError && <p className="text-red-600 text-sm">{createError}</p>}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Password (min 6 characters) *</label>
              <input type="password" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} className="w-full border rounded-lg px-3 py-2" minLength={6} required />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Role *</label>
              <select value={createForm.role} onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))} className="w-full border rounded-lg px-3 py-2">
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
                <option value="PRO">PRO</option>
                <option value="SECRETARY">Secretary</option>
                <option value="WOCOM">WOCOM</option>
                <option value="IMAM">Imam</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Phone (optional)</label>
              <input type="tel" value={createForm.phone} onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Gender (optional)</label>
              <select value={createForm.gender} onChange={(e) => setCreateForm((f) => ({ ...f, gender: e.target.value }))} className="w-full border rounded-lg px-3 py-2">
                <option value="">—</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Level (optional)</label>
              <input type="text" value={createForm.level} onChange={(e) => setCreateForm((f) => ({ ...f, level: e.target.value }))} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. 100, 200" />
            </div>
            <button type="submit" disabled={createLoading} className="btn-primary">
              {createLoading ? "Creating..." : "Create user"}
            </button>
          </form>
        )}
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-4">
        <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="border rounded-lg px-3 py-2 w-full sm:w-64" />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="border rounded-lg px-3 py-2 w-full sm:w-auto">
          <option value="">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="PRO">PRO</option>
          <option value="SECRETARY">Secretary</option>
          <option value="WOCOM">WOCOM</option>
          <option value="IMAM">Imam</option>
          <option value="MEMBER">Member</option>
        </select>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-2">Total: {total}</p>
          {/* Mobile: card layout */}
          <div className="md:hidden space-y-4">
            {users.map((u) => (
              <div key={u.id} className="card p-4 space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{u.name}</p>
                  <p className="text-sm text-gray-600 break-all">{u.email}</p>
                  {u.phone && <p className="text-sm text-gray-500">{u.phone}</p>}
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="bg-gmsa-green/20 text-gmsa-green px-2 py-0.5 rounded text-sm">{u.role}</span>
                  {u.level && <span className="text-sm text-gray-500">Level {u.level}</span>}
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} disabled={updatingId === u.id} className="border rounded-lg px-2 py-1.5 text-sm flex-1 min-w-0">
                    <option value="ADMIN">Admin</option>
                    <option value="PRO">PRO</option>
                    <option value="SECRETARY">Secretary</option>
                    <option value="WOCOM">WOCOM</option>
                    <option value="IMAM">Imam</option>
                    <option value="MEMBER">Member</option>
                  </select>
                  <button type="button" onClick={() => deleteUser(u.id)} disabled={!!deletingId} className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 px-3 py-1.5">
                    {deletingId === u.id ? "…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && !error && <p className="text-gray-500">No users found.</p>}
          </div>
          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full border-collapse border border-gray-200 min-w-[640px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-3 py-2 text-left">Name</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Email</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Phone</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Role</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Level</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Change role</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-200">
                    <td className="border border-gray-200 px-3 py-2">{u.name}</td>
                    <td className="border border-gray-200 px-3 py-2">{u.email}</td>
                    <td className="border border-gray-200 px-3 py-2">{u.phone || "—"}</td>
                    <td className="border border-gray-200 px-3 py-2">
                      <span className="bg-gmsa-green/20 text-gmsa-green px-2 py-0.5 rounded text-sm">{u.role}</span>
                    </td>
                    <td className="border border-gray-200 px-3 py-2">{u.level || "—"}</td>
                    <td className="border border-gray-200 px-3 py-2">
                      <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} disabled={updatingId === u.id} className="border rounded px-2 py-1 text-sm">
                        <option value="ADMIN">Admin</option>
                        <option value="PRO">PRO</option>
                        <option value="SECRETARY">Secretary</option>
                        <option value="WOCOM">WOCOM</option>
                        <option value="IMAM">Imam</option>
                        <option value="MEMBER">Member</option>
                      </select>
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      <button type="button" onClick={() => deleteUser(u.id)} disabled={!!deletingId} className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50">
                        {deletingId === u.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && !error && <p className="text-gray-500 mt-4 hidden md:block">No users found.</p>}
        </>
      )}
    </div>
  );
}
