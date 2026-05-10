import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Upload() {
  const [form, setForm] = useState({
    title: "",
    subject: "",
    topic: "",
    tags: "",
  });
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const fileRef = useRef();
  const navigate = useNavigate();

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf")
      return toast.error("Only PDF files allowed");
    if (f.size > 10 * 1024 * 1024)
      return toast.error("File too large (max 10MB)");
    setFile(f);
    if (!form.title)
      setForm((prev) => ({ ...prev, title: f.name.replace(".pdf", "") }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a PDF file");
    if (!form.title || !form.subject || !form.topic)
      return toast.error("All fields required");
    setLoading(true);
    setProgress("Uploading PDF...");
    const formData = new FormData();
    formData.append("pdf", file);
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    try {
      setProgress("Extracting text from PDF...");
      const { data } = await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProgress("Processing complete!");
      toast.success(`Uploaded! ${data.document.chunksCount} chunks extracted.`);
      setTimeout(() => navigate("/documents"), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
            ⬆
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Upload PDF</h1>
            <p className="text-indigo-200 text-sm mt-0.5">
              Upload study material to enable AI Q&A, quizzes and flashcards
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
            dragging
              ? "border-indigo-500 bg-indigo-50"
              : file
                ? "border-emerald-400 bg-emerald-50"
                : "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 bg-white"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl">📄</span>
              <p className="text-emerald-600 font-bold">{file.name}</p>
              <p className="text-slate-400 text-xs">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="text-red-400 text-xs hover:text-red-600 font-semibold mt-1"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-3xl">
                ⬆
              </div>
              <div>
                <p className="text-slate-700 font-bold">
                  Drop your PDF here or click to browse
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Max 10MB • PDF files only
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Form fields */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Document Details
          </h2>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Document Title *
            </label>
            <input
              className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
              placeholder="e.g., Chapter 5 - Cell Biology"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Subject *
              </label>
              <input
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                placeholder="e.g., Biology"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Topic *
              </label>
              <input
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                placeholder="e.g., Cell Division"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Tags{" "}
              <span className="text-slate-400 font-normal">
                (comma-separated)
              </span>
            </label>
            <input
              className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
              placeholder="e.g., mitosis, meiosis, chromosomes"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <p className="text-indigo-700 text-sm font-medium">{progress}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? "Processing..." : "⬆ Upload & Process PDF"}
        </button>
      </form>
    </div>
  );
}
