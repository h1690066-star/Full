"use client";
import { useEffect, useState } from "react";
import { getUsers } from "@/lib/services/users";
import { apiError } from "@/lib/api";

export default function UsersTable({ t }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = (query = "") => {
    setLoading(true);
    setError("");
    getUsers({ search: query })
      .then((d) => {
        const list = Array.isArray(d) ? d : d?.items || d?.users || [];
        setUsers(list);
        setTotal(d?.total || list.length);
      })
      .catch((e) =>
        setError(
          e.response?.status === 403
            ? t.profile.forbidden
            : apiError(e, t.auth.error)
        )
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers(search);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`${t.searchPh || "Izlash"}...`}
          className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          {t.search || "Izlash"}
        </button>
      </form>

      {loading ? (
        <p className="text-center text-slate-500 py-8">{t.auth.loading}</p>
      ) : error ? (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-center text-sm font-medium text-red-600">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-soft text-xs uppercase text-slate-600">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">{t.auth.name}</th>
                <th className="p-3">{t.auth.email || "Email"}</th>
                <th className="p-3">{t.auth.phone}</th>
                <th className="p-3">Sana</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    Foydalanuvchilar topilmadi
                  </td>
                </tr>
              ) : (
                users.map((u, n) => (
                  <tr key={u._id || u.id || n} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3 text-slate-400">{n + 1}</td>
                    <td className="p-3 font-semibold text-slate-800">{u.name || u.fullName}</td>
                    <td className="p-3 text-slate-600">{u.email || "—"}</td>
                    <td className="p-3 text-slate-600">{u.phone || "—"}</td>
                    <td className="p-3 text-xs text-slate-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            Jami: {total} ta foydalanuvchi
          </div>
        </div>
      )}
    </div>
  );
}
