import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, AlertCircle, Lightbulb } from "lucide-react";
import { apiFetch } from "../utils/api.js";
function ScoreCircle({ score }) {
  const color = score >= 75 ? "#4ade80" : score >= 50 ? "#facc15" : "#f87171";
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-800 rounded-2xl">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#1e293b"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${(score / 100) * 251} 251`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <p className="text-3xl font-bold text-white -mt-16">{score}%</p>
      <p className="text-slate-400 text-sm mt-10">Match Score</p>
    </div>
  );
}

export default function SharedReport() {
  const { shareId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await apiFetch(`/api/share/report/${shareId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setReport(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold mb-2">
            Report Not Found
          </p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Resume Analysis Report
          </h1>
          <p className="text-slate-500 text-sm">
            Shared on{" "}
            {new Date(report.sharedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Job Description Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-2">
            Job Description (Preview)
          </p>
          <p className="text-slate-300 text-sm leading-relaxed">
            {report.jobDescription}
          </p>
        </div>

        {/* Score */}
        <ScoreCircle score={report.matchScore} />

        {/* Missing Keywords */}
        {report.missingKeywords?.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-red-400" />
              <h3 className="text-white font-medium text-sm">
                Missing Keywords
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.missingKeywords.map((kw) => (
                <span
                  key={kw}
                  className="bg-red-900/20 border border-red-800 text-red-400 text-xs px-3 py-1 rounded-full"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Strengths */}
        {report.strengths?.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={16} className="text-green-400" />
              <h3 className="text-white font-medium text-sm">Strengths</h3>
            </div>
            <ul className="flex flex-col gap-2">
              {report.strengths.map((s) => (
                <li
                  key={s}
                  className="text-slate-300 text-sm flex items-start gap-2"
                >
                  <span className="text-green-400 mt-0.5">✓</span> {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {report.suggestions?.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={16} className="text-yellow-400" />
              <h3 className="text-white font-medium text-sm">Suggestions</h3>
            </div>
            <ul className="flex flex-col gap-2">
              {report.suggestions.map((s) => (
                <li
                  key={s}
                  className="text-slate-300 text-sm flex items-start gap-2"
                >
                  <span className="text-yellow-400 mt-0.5">→</span> {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer CTA */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-2xl p-5 text-center">
          <p className="text-white font-medium mb-1">
            Want to analyze your own resume?
          </p>
          <p className="text-slate-400 text-sm mb-3">
            Get your ATS match score, missing keywords, and AI suggestions —
            free.
          </p>
          <a
            href="/signup"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
          >
            Try ResumeRadar Free →
          </a>
        </div>
      </div>
    </div>
  );
}
