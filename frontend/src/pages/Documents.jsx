import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchDocs = async () => {
    try {
      const params = search ? { search } : {};
      const { data } = await api.get("/documents", { params });
      setDocuments(data.documents);
    } catch {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);
  useEffect(() => {
    const t = setTimeout(fetchDocs, 400);
    return () => clearTimeout(t);
  }, [search]);

  const deleteDoc = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      toast.success("Document deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const formatSize = (bytes) =>
    bytes ? `${(bytes / 1024).toFixed(0)} KB` : "N/A";

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white">My Documents</h1>
            <p className="text-indigo-200 text-sm mt-0.5">
              {documents.length} PDF{documents.length !== 1 ? "s" : ""} uploaded
            </p>
          </div>
          <Link
            to="/upload"
            className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm px-4 py-2.5 rounded-xl shadow-md transition-colors"
          >
            + Upload PDF
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>
        <input
          type="text"
          className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          placeholder="Search by title, topic, or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100">
          <span className="text-5xl">📄</span>
          <p className="text-slate-700 font-bold mt-4 text-lg">
            {search ? "No matching documents" : "No documents yet"}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Upload a PDF to get started
          </p>
          <Link
            to="/upload"
            className="inline-block mt-4 bg-indigo-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
          >
            Upload PDF
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-black text-red-600">PDF</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 truncate">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {doc.subject} • {doc.topic}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {doc.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {doc.tags?.length > 3 && (
                  <span className="text-xs text-slate-400">
                    +{doc.tags.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 mb-4 bg-slate-50 rounded-lg px-3 py-2">
                <span>📄 {doc.pageCount} pages</span>
                <span>{formatSize(doc.fileSize)}</span>
                <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Link
                  to={`/chat/${doc._id}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-lg text-center transition-colors shadow-sm"
                >
                  💬 Chat
                </Link>
                <button
                  onClick={() =>
                    navigate("/quiz", {
                      state: { documentId: doc._id, title: doc.title },
                    })
                  }
                  className="bg-white hover:bg-violet-50 text-violet-700 border border-violet-200 text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  🧠 Quiz
                </button>
                <button
                  onClick={() => deleteDoc(doc._id)}
                  className="bg-white hover:bg-red-50 text-red-500 border border-red-200 text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  🗑 Del
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
