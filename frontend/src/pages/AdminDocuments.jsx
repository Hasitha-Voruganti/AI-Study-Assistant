import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/documents")
      .then((r) => setDocuments(r.data.documents))
      .catch(() => toast.error("Failed to load documents"))
      .finally(() => setLoading(false));
  }, []);

  const deleteDoc = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await api.delete(`/admin/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      toast.success("Document deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

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
            📂
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              All Documents
            </h1>
            <p className="text-indigo-200 text-sm mt-0.5">
              {documents.length} PDFs uploaded across all students
            </p>
          </div>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100">
          <span className="text-5xl">📂</span>
          <p className="text-slate-500 mt-3 font-medium">
            No documents uploaded yet
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
            >
              <div className="flex items-start gap-3 mb-4">
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

              <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-indigo-50 border border-indigo-100">
                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {doc.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-indigo-700 truncate">
                    {doc.user?.name}
                  </p>
                  <p className="text-xs text-indigo-400 truncate">
                    {doc.user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                <span className="flex items-center gap-1">
                  📄 {doc.pageCount} pages
                </span>
                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>

              <button
                onClick={() => deleteDoc(doc._id)}
                className="w-full py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 text-xs font-semibold transition-colors"
              >
                🗑 Delete Document
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
