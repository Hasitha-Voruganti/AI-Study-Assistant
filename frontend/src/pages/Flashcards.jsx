import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

function FlashcardViewer({ set, onClose }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [localSet, setLocalSet] = useState(set);

  const card = localSet.cards[index];
  const mastered = localSet.cards.filter((c) => c.status === "mastered").length;

  const updateStatus = async (status) => {
    try {
      const { data } = await api.patch(`/flashcards/${set._id}/card`, {
        cardIndex: index,
        status,
      });
      setLocalSet(data.flashcardSet);
      toast.success(
        status === "mastered" ? "✅ Mastered!" : "🔄 Added to revision",
      );
      next();
    } catch {
      toast.error("Update failed");
    }
  };

  const next = () => {
    setFlipped(false);
    setTimeout(
      () => setIndex((i) => Math.min(i + 1, localSet.cards.length - 1)),
      150,
    );
  };
  const prev = () => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.max(i - 1, 0)), 150);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {localSet.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {index + 1} / {localSet.cards.length} cards • {mastered} mastered
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="h-1.5 bg-slate-100 rounded-full">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${(mastered / localSet.cards.length) * 100}%` }}
          />
        </div>

        <div
          onClick={() => setFlipped(!flipped)}
          className={`cursor-pointer min-h-[200px] rounded-2xl border-2 flex items-center justify-center p-6 text-center transition-all duration-200 ${
            flipped
              ? "border-violet-300 bg-violet-50"
              : "border-indigo-200 bg-indigo-50 hover:border-indigo-400"
          }`}
        >
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wider mb-3 ${flipped ? "text-violet-400" : "text-indigo-400"}`}
            >
              {flipped ? "Answer" : "Question"}
            </p>
            <p className="text-slate-800 font-semibold leading-relaxed text-base">
              {flipped ? card.back : card.front}
            </p>
            {!flipped && (
              <p className="text-xs text-slate-400 mt-4">
                Click to reveal answer
              </p>
            )}
          </div>
        </div>

        {flipped && (
          <div className="flex gap-3">
            <button
              onClick={() => updateStatus("needs_revision")}
              className="flex-1 py-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm transition-colors"
            >
              🔄 Needs Revision
            </button>
            <button
              onClick={() => updateStatus("mastered")}
              className="flex-1 py-3 rounded-xl border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-semibold text-sm transition-colors"
            >
              ✅ Mastered!
            </button>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={prev}
            disabled={index === 0}
            className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors text-sm"
          >
            ← Prev
          </button>
          <button
            onClick={() => setFlipped(!flipped)}
            className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            Flip Card
          </button>
          <button
            onClick={next}
            disabled={index === localSet.cards.length - 1}
            className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors text-sm"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Flashcards() {
  const [documents, setDocuments] = useState([]);
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [config, setConfig] = useState({ documentId: "", numCards: 10 });
  const [loading, setLoading] = useState(false);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    api.get("/documents").then((r) => setDocuments(r.data.documents));
    fetchSets();
  }, []);

  const fetchSets = async () => {
    try {
      const { data } = await api.get("/flashcards");
      setFlashcardSets(data.flashcards);
    } catch {}
  };

  const generate = async () => {
    if (!config.documentId) return toast.error("Please select a document");
    setLoading(true);
    try {
      await api.post("/flashcards/generate", config);
      toast.success("Flashcards generated!");
      fetchSets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const openSet = async (setId) => {
    try {
      const { data } = await api.get(`/flashcards/${setId}`);
      setViewing(data.flashcardSet);
    } catch {
      toast.error("Failed to load flashcards");
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {viewing && (
        <FlashcardViewer
          set={viewing}
          onClose={() => {
            setViewing(null);
            fetchSets();
          }}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
            🗂
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Flashcards</h1>
            <p className="text-indigo-200 text-sm mt-0.5">
              AI-generated flashcards for active recall
            </p>
          </div>
        </div>
      </div>

      {/* Generate */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Generate New Flashcards
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Select Document *
            </label>
            <select
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
              value={config.documentId}
              onChange={(e) =>
                setConfig({ ...config, documentId: e.target.value })
              }
            >
              <option value="">Choose document...</option>
              {documents.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Number of Cards:{" "}
              <span className="text-indigo-600 font-black">
                {config.numCards}
              </span>
            </label>
            <input
              type="range"
              min="5"
              max="20"
              value={config.numCards}
              onChange={(e) =>
                setConfig({ ...config, numCards: parseInt(e.target.value) })
              }
              className="w-full accent-indigo-600 mt-2"
            />
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading || !config.documentId}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
              Generating...
            </>
          ) : (
            "✨ Generate Flashcards"
          )}
        </button>
      </div>

      {/* Flashcard Sets */}
      {flashcardSets.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
            Your Flashcard Sets ({flashcardSets.length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcardSets.map((set) => {
              const mastered = set.masteredCount || 0;
              const total = set.totalCards;
              const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
              return (
                <div
                  key={set._id}
                  onClick={() => openSet(set._id)}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-xl flex-shrink-0">
                      🗂
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {set.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {set.subject} • {set.topic}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-500 font-medium">
                      {total} cards
                    </span>
                    <span className="text-emerald-600 font-bold">
                      {mastered} mastered ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <button className="w-full text-xs font-bold py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors border border-indigo-200">
                    Study Now →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {flashcardSets.length === 0 && !loading && (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100">
          <span className="text-5xl">🗂</span>
          <p className="text-slate-700 font-bold text-lg mt-4">
            No flashcard sets yet
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Generate flashcards from your uploaded PDFs above
          </p>
        </div>
      )}
    </div>
  );
}
