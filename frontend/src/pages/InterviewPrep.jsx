import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { MessageCircle, Lightbulb, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const CATEGORY_COLORS = {
  Technical: "bg-blue-900/30 border-blue-800 text-blue-400",
  Behavioral: "bg-purple-900/30 border-purple-800 text-purple-400",
  Situational: "bg-orange-900/30 border-orange-800 text-orange-400",
};

export default function InterviewPrep() {
  const [analyses, setAnalyses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    async function fetchAnalyses() {
      const res = await fetch("/api/analyze/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAnalyses(data);
      if (data.length > 0) setSelectedId(data[0]._id);
    }
    fetchAnalyses();
  }, [token]);

  async function handleGenerate() {
    if (!selectedId) {
      toast.error("Run an analysis first");
      return;
    }
    setLoading(true);
    setQuestions([]);

    try {
      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ analysisId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setQuestions(data.questions);
      toast.success("Questions generated!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Interview Prep</h1>
        <p className="text-gray-500 text-sm">
          AI-generated questions based on your resume and target job
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400 font-medium">
            Select a Past Analysis
          </label>
          {analyses.length === 0 ? (
            <p className="text-gray-600 text-sm">
              No analyses yet — run one from the Analyze page first.
            </p>
          ) : (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors"
            >
              {analyses.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.jobDescription.slice(0, 80)}... — {a.result?.matchScore}% match
                </option>
              ))}
            </select>
          )}
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || analyses.length === 0}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles size={16} />
          {loading ? "Preparing questions..." : "Generate Interview Questions"}
        </button>
      </div>

      {questions.length > 0 && (
        <div className="flex flex-col gap-3">
          {questions.map((q, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-2">
                  <MessageCircle size={16} className="text-gray-500 mt-0.5 shrink-0" />
                  <p className="text-white text-sm font-medium">{q.question}</p>
                </div>
                <span className={`text-xs border px-2.5 py-1 rounded-full shrink-0 ${CATEGORY_COLORS[q.category] || "bg-gray-800 border-gray-700 text-gray-400"}`}>
                  {q.category}
                </span>
              </div>
              <div className="flex items-start gap-2 mt-2 pl-6">
                <Lightbulb size={13} className="text-yellow-400 mt-0.5 shrink-0" />
                <p className="text-gray-500 text-xs leading-relaxed">{q.tip}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}