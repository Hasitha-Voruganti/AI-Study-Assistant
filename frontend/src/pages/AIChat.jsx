import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

const Message = ({ msg }) => (
  <div
    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
  >
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-gradient-to-br from-violet-500 to-indigo-600 text-white"}`}
    >
      {msg.role === "user" ? "U" : "AI"}
    </div>
    <div
      className={`max-w-[80%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
    >
      <div
        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          msg.role === "user"
            ? "bg-indigo-600 text-white rounded-tr-sm"
            : "bg-white text-slate-800 rounded-tl-sm border border-slate-100"
        }`}
      >
        {msg.content}
      </div>
      {msg.context && (
        <div className="text-xs text-slate-400 px-1 flex items-start gap-1">
          <span>📎</span>
          <span className="italic">{msg.context}</span>
        </div>
      )}
    </div>
  </div>
);

export default function AIChat() {
  const { documentId: paramDocId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(paramDocId || "");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const bottomRef = useRef();

  useEffect(() => {
    api.get("/documents").then((r) => {
      setDocuments(r.data.documents);
      if (!selectedDoc && r.data.documents.length > 0)
        setSelectedDoc(r.data.documents[0]._id);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    if (paramDocId) setSelectedDoc(paramDocId);
  }, [paramDocId]);

  const sendMessage = async (mode = "default") => {
    const question = input.trim();
    if (!question || !selectedDoc) {
      if (!selectedDoc) toast.error("Please select a document");
      return;
    }
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post("/chat", {
        documentId: selectedDoc,
        question,
        mode,
        chatId,
      });
      setChatId(data.chatId);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          context: data.contextSnippet,
        },
      ]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to get answer");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      label: "📝 Summarize",
      q: "Please provide a comprehensive summary of this document.",
    },
    {
      label: "🔑 Key Concepts",
      q: "What are the main key concepts and definitions in this document?",
    },
    {
      label: "❓ Important Points",
      q: "What are the most important points to remember from this material?",
    },
    {
      label: "🔗 How concepts connect",
      q: "How do the different concepts in this document connect to each other?",
    },
  ];

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-4 animate-slide-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl px-5 py-4 shadow-lg flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-extrabold text-white">💬 AI Chat</h1>
          <p className="text-indigo-200 text-xs mt-0.5">
            Ask questions about your study material
          </p>
        </div>
        <select
          className="bg-white/20 border border-white/30 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur"
          value={selectedDoc}
          onChange={(e) => {
            setSelectedDoc(e.target.value);
            setMessages([]);
            setChatId(null);
          }}
        >
          <option value="" className="text-slate-800">
            Select document...
          </option>
          {documents.map((d) => (
            <option key={d._id} value={d._id} className="text-slate-800">
              {d.title}
            </option>
          ))}
        </select>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-3xl">
              💬
            </div>
            <div className="text-center">
              <p className="text-slate-700 font-bold text-lg">
                {selectedDoc ? "Start chatting!" : "Select a document first"}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Ask anything about your study material
              </p>
            </div>
            {selectedDoc && (
              <div className="grid grid-cols-2 gap-2 mt-2 w-full max-w-lg">
                {quickActions.map((a) => (
                  <button
                    key={a.label}
                    onClick={() => setInput(a.q)}
                    className="text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors text-xs text-slate-600 hover:text-indigo-700 font-medium"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  AI
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 space-y-2">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
            placeholder={
              selectedDoc ? "Ask a question..." : "Select a document first..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={loading || !selectedDoc}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim() || !selectedDoc}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold px-5 rounded-xl shadow-md transition-colors"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "↑"
            )}
          </button>
        </div>
        {messages.length > 0 && input.trim() && (
          <div className="flex gap-2">
            <button
              onClick={() => sendMessage("simple")}
              className="flex-1 bg-white border border-violet-200 text-violet-700 hover:bg-violet-50 text-xs font-semibold py-2 rounded-xl transition-colors shadow-sm"
            >
              🔤 Explain Simpler
            </button>
            <button
              onClick={() => sendMessage("example")}
              className="flex-1 bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 text-xs font-semibold py-2 rounded-xl transition-colors shadow-sm"
            >
              💡 Give Example
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
