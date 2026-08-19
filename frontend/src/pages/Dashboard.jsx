import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const StatCard = ({ label, value, icon, color, bg, sub }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </p>
        <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
        {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
      </div>
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${bg}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/analytics/dashboard")
      .then((r) => setData(r.data.dashboard))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  const stats = data?.stats || {};
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              {greeting}, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-indigo-200 text-sm mt-1">
              Learn smarter with AI — ask questions, practice quizzes, and
              master your study material.
            </p>
          </div>
          <Link
            to="/upload"
            className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm px-4 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            + Upload PDF
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Documents"
          value={data?.totalDocs || 0}
          icon="📄"
          color="text-indigo-600"
          bg="bg-indigo-50"
          sub="PDFs uploaded"
        />
        <StatCard
          label="Quizzes"
          value={data?.totalQuizzes || 0}
          icon="🧠"
          color="text-violet-600"
          bg="bg-violet-50"
          sub="Completed"
        />
        <StatCard
          label="Avg Score"
          value={`${stats.averageScore || 0}%`}
          icon="⭐"
          color="text-amber-600"
          bg="bg-amber-50"
          sub="Overall"
        />
        <StatCard
          label="Flashcards"
          value={stats.masteredFlashcards || 0}
          icon="🗂"
          color="text-emerald-600"
          bg="bg-emerald-50"
          sub="Mastered"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Score Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
            Quiz Score Trend
          </h2>
          {data?.scoreTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.scoreTrend}>
                <XAxis
                  dataKey="topic"
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e0e7ff",
                    borderRadius: "12px",
                    color: "#0f172a",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{
                    fill: "#6366f1",
                    r: 4,
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-slate-400">
              <span className="text-4xl mb-2">📊</span>
              <p className="text-sm font-medium">
                Complete quizzes to see your trend
              </p>
              <Link
                to="/quiz"
                className="text-indigo-500 text-xs mt-2 hover:underline font-semibold"
              >
                Take a quiz →
              </Link>
            </div>
          )}
        </div>

        {/* Subject Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
            Subjects
          </h2>
          {data?.subjectDistribution?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={data.subjectDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    dataKey="count"
                    nameKey="_id"
                  >
                    {data.subjectDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e0e7ff",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {data.subjectDistribution.slice(0, 4).map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-slate-600 font-medium truncate max-w-[100px]">
                        {s._id}
                      </span>
                    </div>
                    <span className="text-slate-400">
                      {s.count} doc{s.count > 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-slate-400">
              <span className="text-4xl mb-2">📚</span>
              <p className="text-sm text-center font-medium">
                Upload PDFs to track subjects
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent Documents */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Recent Documents
            </h2>
            <Link
              to="/documents"
              className="text-xs text-indigo-600 hover:underline font-semibold"
            >
              View all →
            </Link>
          </div>
          {data?.recentDocuments?.length > 0 ? (
            <div className="space-y-2">
              {data.recentDocuments.map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-red-600">PDF</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {doc.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {doc.subject} • {doc.topic}
                    </p>
                  </div>
                  <Link
                    to={`/chat/${doc._id}`}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                  >
                    Chat
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <span className="text-3xl">📄</span>
              <p className="text-sm mt-2 font-medium">No documents yet</p>
              <Link
                to="/upload"
                className="text-indigo-500 text-xs mt-1 hover:underline font-semibold block"
              >
                Upload your first PDF →
              </Link>
            </div>
          )}
        </div>

        {/* Weak Topics */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              ⚠️ Weak Topics
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Needs improvement
            </span>
          </div>
          {data?.weakTopics?.length > 0 ? (
            <div className="space-y-4">
              {data.weakTopics.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-700 font-semibold">
                      {item.topic}
                    </span>
                    <span className="text-red-500 font-bold">
                      {item.score}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <span className="text-3xl">🎉</span>
              <p className="text-sm mt-2 font-semibold text-slate-600">
                No weak topics detected!
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Keep taking quizzes to track progress
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Quizzes */}
      {data?.recentQuizzes?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Recent Quizzes
            </h2>
            <Link
              to="/quiz"
              className="text-xs text-indigo-600 hover:underline font-semibold"
            >
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.recentQuizzes.slice(0, 3).map((q) => (
              <div
                key={q._id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors"
              >
                <p className="text-sm font-bold text-slate-800 truncate">
                  {q.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{q.subject}</p>
                <div className="flex items-center justify-between mt-3">
                  <span
                    className={`text-2xl font-black ${q.percentage >= 70 ? "text-emerald-600" : q.percentage >= 40 ? "text-amber-600" : "text-red-500"}`}
                  >
                    {q.percentage}%
                  </span>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-200 px-2 py-1 rounded-lg">
                    {q.score}/{q.totalQuestions}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
