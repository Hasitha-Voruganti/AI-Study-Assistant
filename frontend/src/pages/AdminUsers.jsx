import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/users")
      .then((r) => setUsers(r.data.users))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`))
      return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const students = users.filter((u) => u.role === "student");

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
            👥
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Manage Users</h1>
            <p className="text-indigo-200 text-sm mt-0.5">
              {students.length} students registered
            </p>
          </div>
        </div>
      </div>

      {/* Users list */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {students.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl">👥</span>
            <p className="text-slate-500 mt-3 font-medium">
              No students registered yet
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {students.map((u, i) => (
              <div
                key={u._id}
                className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white shadow-sm flex-shrink-0">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-base font-black text-indigo-600">
                      {u.stats?.totalQuizzes || 0}
                    </p>
                    <p className="text-xs text-slate-400">Quizzes</p>
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-base font-black ${
                        (u.stats?.averageScore || 0) >= 70
                          ? "text-emerald-600"
                          : (u.stats?.averageScore || 0) >= 40
                            ? "text-amber-600"
                            : "text-red-500"
                      }`}
                    >
                      {u.stats?.averageScore || 0}%
                    </p>
                    <p className="text-xs text-slate-400">Avg Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-black text-violet-600">
                      {u.stats?.masteredFlashcards || 0}
                    </p>
                    <p className="text-xs text-slate-400">Mastered</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="text-xs font-medium text-slate-600">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-400">Joined</p>
                  </div>
                  <button
                    onClick={() => deleteUser(u._id, u.name)}
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 text-xs font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
