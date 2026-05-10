import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <div className="flex items-center justify-between mb-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${bg}`}
      >
        {icon}
      </div>
    </div>
    <p className={`text-4xl font-black ${color}`}>{value}</p>
    <p className="text-slate-500 text-sm font-medium mt-1">{label}</p>
  </div>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((r) => setData(r.data))
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-2xl shadow-md">
            👑
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              Admin Dashboard
            </h1>
            <p className="text-indigo-200 text-sm mt-0.5">
              Platform-wide overview and analytics
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-5">
        <StatCard
          label="Total Students"
          value={data?.stats.totalUsers || 0}
          icon="👥"
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <StatCard
          label="Total Documents"
          value={data?.stats.totalDocuments || 0}
          icon="📄"
          color="text-violet-600"
          bg="bg-violet-50"
        />
        <StatCard
          label="Quizzes Completed"
          value={data?.stats.totalQuizzes || 0}
          icon="🧠"
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent Students */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-sm">
              👥
            </span>
            Recent Students
          </h2>
          <div className="space-y-2">
            {data?.recentUsers?.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {u.name}
                    </p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-indigo-600">
                    {u.stats?.averageScore || 0}%
                  </p>
                  <p className="text-xs text-slate-400">
                    {u.stats?.totalQuizzes || 0} quizzes
                  </p>
                </div>
              </div>
            ))}
            {!data?.recentUsers?.length && (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">No students yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Students */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center text-sm">
              🏆
            </span>
            Top Students
          </h2>
          <div className="space-y-2">
            {data?.topStudents?.map((u, i) => (
              <div
                key={u._id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                      i === 0
                        ? "bg-amber-400 text-white"
                        : i === 1
                          ? "bg-slate-300 text-slate-700"
                          : i === 2
                            ? "bg-orange-400 text-white"
                            : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {u.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {u.stats?.totalQuizzes || 0} quizzes taken
                    </p>
                  </div>
                </div>
                <span
                  className={`text-base font-black ${
                    (u.stats?.averageScore || 0) >= 70
                      ? "text-emerald-600"
                      : (u.stats?.averageScore || 0) >= 40
                        ? "text-amber-600"
                        : "text-red-500"
                  }`}
                >
                  {u.stats?.averageScore || 0}%
                </span>
              </div>
            ))}
            {!data?.topStudents?.length && (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">No quiz data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center text-sm">
            📄
          </span>
          Recently Uploaded Documents
        </h2>
        <div className="space-y-2">
          {data?.recentDocs?.map((doc) => (
            <div
              key={doc._id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-red-200 hover:bg-red-50/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-black text-red-600">PDF</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {doc.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {doc.subject} • {doc.topic}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-semibold text-slate-600">
                  {doc.user?.name}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          {!data?.recentDocs?.length && (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">No documents yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
