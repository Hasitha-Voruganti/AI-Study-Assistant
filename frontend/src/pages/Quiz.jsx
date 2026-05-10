import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

function QuizResults({ quiz, onNew }) {
  const pct = quiz.percentage;
  const color =
    pct >= 70
      ? "text-emerald-600"
      : pct >= 40
        ? "text-amber-600"
        : "text-red-500";
  const bg =
    pct >= 70
      ? "bg-emerald-50 border-emerald-200"
      : pct >= 40
        ? "bg-amber-50 border-amber-200"
        : "bg-red-50 border-red-200";

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-slide-up">
      <div className={`rounded-2xl p-8 text-center border-2 ${bg}`}>
        <div className={`text-6xl font-black ${color}`}>{pct}%</div>
        <p className="text-slate-700 mt-2 font-bold text-lg">
          {pct >= 70
            ? "🎉 Excellent work!"
            : pct >= 40
              ? "👍 Good effort!"
              : "📚 Keep studying!"}
        </p>
        <p className="text-slate-400 text-sm mt-1">
          {quiz.score} out of {quiz.totalQuestions} correct
        </p>
      </div>

      <div className="space-y-3">
        {quiz.questions.map((q, i) => (
          <div
            key={i}
            className={`bg-white rounded-2xl p-5 border-2 shadow-sm ${q.isCorrect ? "border-emerald-200" : "border-red-200"}`}
          >
            <div className="flex items-start gap-3 mb-3">
              <span
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white mt-0.5 ${q.isCorrect ? "bg-emerald-500" : "bg-red-500"}`}
              >
                {q.isCorrect ? "✓" : "✗"}
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {q.question}
              </p>
            </div>
            <div className="space-y-1.5 ml-9">
              {q.options.map((opt, j) => (
                <div
                  key={j}
                  className={`text-xs px-3 py-2 rounded-lg font-medium ${
                    j === q.correctAnswer
                      ? "bg-emerald-100 text-emerald-800"
                      : j === q.userAnswer && !q.isCorrect
                        ? "bg-red-100 text-red-700"
                        : "text-slate-400"
                  }`}
                >
                  {j === q.correctAnswer && "✓ "}
                  {opt}
                </div>
              ))}
            </div>
            {q.explanation && (
              <p className="text-xs text-slate-500 mt-3 ml-9 italic bg-slate-50 px-3 py-2 rounded-lg">
                {q.explanation}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onNew}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors"
      >
        Generate New Quiz
      </button>
    </div>
  );
}

export default function Quiz() {
  const location = useLocation();
  const [documents, setDocuments] = useState([]);
  const [config, setConfig] = useState({
    documentId: location.state?.documentId || "",
    difficulty: "mixed",
    numQuestions: 5,
  });
  const [phase, setPhase] = useState("setup");
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef();
  const [pastQuizzes, setPastQuizzes] = useState([]);

  useEffect(() => {
    api.get("/documents").then((r) => setDocuments(r.data.documents));
    api
      .get("/quiz")
      .then((r) => setPastQuizzes(r.data.quizzes))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (phase === "active") {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const generateQuiz = async () => {
    if (!config.documentId) return toast.error("Please select a document");
    setLoading(true);
    try {
      const { data } = await api.post("/quiz/generate", config);
      setQuiz(data.quiz);
      setAnswers({});
      setCurrentQ(0);
      setTimer(0);
      setPhase("active");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      if (
        !window.confirm(
          `You answered ${Object.keys(answers).length}/${quiz.questions.length} questions. Submit anyway?`,
        )
      )
        return;
    }
    clearInterval(timerRef.current);
    setLoading(true);
    try {
      const answersArray = quiz.questions.map((_, i) =>
        answers[i] !== undefined ? answers[i] : null,
      );
      const { data } = await api.post(`/quiz/${quiz._id}/submit`, {
        answers: answersArray,
        timeTaken: timer,
      });
      setQuiz(data.quiz);
      setPhase("results");
      toast.success(data.message);
    } catch {
      toast.error("Submit failed");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const q = quiz?.questions?.[currentQ];

  if (phase === "results")
    return <QuizResults quiz={quiz} onNew={() => setPhase("setup")} />;

  if (phase === "active" && q)
    return (
      <div className="max-w-2xl mx-auto space-y-5 animate-slide-up">
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-white font-bold">
              Question {currentQ + 1} of {quiz.questions.length}
            </p>
            <p className="text-indigo-200 text-xs">{quiz.title}</p>
          </div>
          <span className="text-white font-mono font-bold text-lg bg-white/20 px-3 py-1.5 rounded-xl">
            ⏱ {formatTime(timer)}
          </span>
        </div>

        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{
              width: `${((currentQ + 1) / quiz.questions.length) * 100}%`,
            }}
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-start gap-3 mb-5">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                q.difficulty === "easy"
                  ? "bg-emerald-100 text-emerald-700"
                  : q.difficulty === "hard"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              {q.difficulty}
            </span>
            <h2 className="text-base font-bold text-slate-800">{q.question}</h2>
          </div>
          <div className="space-y-2.5">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [currentQ]: i }))
                }
                className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-150 border-2 ${
                  answers[currentQ] === i
                    ? "border-indigo-500 bg-indigo-50 text-indigo-800 shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50"
                }`}
              >
                <span className="font-bold text-slate-400 mr-2">
                  {String.fromCharCode(65 + i)}.
                </span>{" "}
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
            disabled={currentQ === 0}
            className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            ← Prev
          </button>
          <div className="flex gap-1.5">
            {quiz.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                  i === currentQ
                    ? "bg-indigo-600 text-white shadow-md"
                    : answers[i] !== undefined
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-white text-slate-400 border border-slate-200 hover:border-indigo-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          {currentQ < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQ((p) => p + 1)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={submitQuiz}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-colors"
            >
              {loading ? "Submitting..." : "✓ Submit Quiz"}
            </button>
          )}
        </div>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
            🧠
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              AI Quiz Generator
            </h1>
            <p className="text-indigo-200 text-sm mt-0.5">
              Generate custom MCQs from your study material
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Configure Quiz
        </h2>
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
            <option value="">Choose a document...</option>
            {documents.map((d) => (
              <option key={d._id} value={d._id}>
                {d.title} — {d.subject}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Difficulty
            </label>
            <select
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
              value={config.difficulty}
              onChange={(e) =>
                setConfig({ ...config, difficulty: e.target.value })
              }
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Questions:{" "}
              <span className="text-indigo-600 font-black">
                {config.numQuestions}
              </span>
            </label>
            <input
              type="range"
              min="3"
              max="10"
              value={config.numQuestions}
              onChange={(e) =>
                setConfig({ ...config, numQuestions: parseInt(e.target.value) })
              }
              className="w-full accent-indigo-600 mt-2"
            />
          </div>
        </div>
        <button
          onClick={generateQuiz}
          disabled={loading || !config.documentId}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-indigo-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
              Generating with AI...
            </>
          ) : (
            "🧠 Generate Quiz"
          )}
        </button>
      </div>

      {pastQuizzes.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
            Quiz History
          </h2>
          <div className="space-y-2">
            {pastQuizzes.slice(0, 5).map((q) => (
              <div
                key={q._id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">{q.title}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(
                      q.completedAt || q.createdAt,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-black ${q.percentage >= 70 ? "text-emerald-600" : q.percentage >= 40 ? "text-amber-600" : "text-red-500"}`}
                  >
                    {q.percentage}%
                  </p>
                  <p className="text-xs text-slate-400">
                    {q.score}/{q.totalQuestions}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
