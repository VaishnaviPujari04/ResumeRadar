import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api.js";

function AtsScoreGauge({ score }) {
  const color = score >= 75 ? "#4ade80" : score >= 50 ? "#facc15" : "#f87171";
  const label =
    score >= 75
      ? "ATS Friendly"
      : score >= 50
        ? "Needs Work"
        : "Poor Compatibility";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r="56"
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
          />
          <circle
            cx="70"
            cy="70"
            r="56"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${(score / 100) * 351} 351`}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-4xl font-bold text-white">{score}</p>
          <p className="text-slate-500 text-xs">/ 100</p>
        </div>
      </div>
      <div className="text-center">
        <p className="text-white font-semibold">{label}</p>
        <p className="text-slate-500 text-xs mt-0.5">ATS Readability Score</p>
      </div>
    </div>
  );
}

function SectionChecker({ sections }) {
  const sectionLabels = {
    contactInfo: "Contact Information",
    summary: "Professional Summary",
    experience: "Work Experience",
    education: "Education",
    skills: "Skills Section",
    projects: "Projects",
    certifications: "Certifications",
  };

  const found = Object.entries(sections).filter(([, v]) => v);
  const missing = Object.entries(sections).filter(([, v]) => !v);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-1">Section Detection</h3>
      <p className="text-slate-500 text-xs mb-4">
        Sections the ATS successfully identified
      </p>
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(sections).map(([key, found]) => (
          <div
            key={key}
            className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0"
          >
            <span className="text-slate-300 text-sm">{sectionLabels[key]}</span>
            {found ? (
              <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                <CheckCircle size={14} /> Detected
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-red-400 text-xs font-medium">
                <XCircle size={14} /> Not Found
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs">
        <span className="text-green-400">{found.length} detected</span>
        <span className="text-red-400">{missing.length} missing</span>
      </div>
    </div>
  );
}

function KeywordDensity({ keywordsFound, keywordsMissing, density }) {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold mb-0.5">Keyword Density</h3>
          <p className="text-slate-500 text-xs">
            JD keywords found in your resume
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-400">{density}%</p>
          <p className="text-slate-600 text-xs">density</p>
        </div>
      </div>

      {/* Density bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 mb-5">
        <div
          className="h-2 rounded-full bg-blue-500 transition-all duration-700"
          style={{ width: `${density}%` }}
        />
      </div>

      {/* Found keywords */}
      {keywordsFound?.length > 0 && (
        <div className="mb-4">
          <p className="text-green-400 text-xs font-medium mb-2 flex items-center gap-1">
            <CheckCircle size={12} /> Found in Resume ({keywordsFound.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {keywordsFound.map((kw) => (
              <span
                key={kw}
                className="bg-green-900/20 border border-green-800 text-green-400 text-xs px-2.5 py-0.5 rounded-full"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing keywords */}
      {keywordsMissing?.length > 0 && (
        <div>
          <p className="text-red-400 text-xs font-medium mb-2 flex items-center gap-1">
            <XCircle size={12} /> Missing from Resume ({keywordsMissing.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(showAll ? keywordsMissing : keywordsMissing.slice(0, 6)).map(
              (kw) => (
                <span
                  key={kw}
                  className="bg-red-900/20 border border-red-800 text-red-400 text-xs px-2.5 py-0.5 rounded-full"
                >
                  {kw}
                </span>
              ),
            )}
          </div>
          {keywordsMissing.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              {showAll ? (
                <>
                  <ChevronUp size={12} /> Show less
                </>
              ) : (
                <>
                  <ChevronDown size={12} /> +{keywordsMissing.length - 6} more
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FormatIssues({ issues }) {
  if (!issues?.length)
    return (
      <div className="bg-slate-900 border border-green-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle size={16} className="text-green-400" />
          <h3 className="text-white font-semibold">No Format Issues Found</h3>
        </div>
        <p className="text-slate-500 text-sm">
          Your resume format looks ATS-friendly!
        </p>
      </div>
    );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-yellow-400" />
        <h3 className="text-white font-semibold">Format Issues</h3>
        <span className="bg-yellow-900/30 border border-yellow-800 text-yellow-400 text-xs px-2 py-0.5 rounded-full">
          {issues.length} found
        </span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {issues.map((issue, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <AlertTriangle
              size={13}
              className="text-yellow-400 mt-0.5 shrink-0"
            />
            <span className="text-slate-300">{issue}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AtsTips({ tips }) {
  return (
    <div className="bg-blue-900/10 border border-blue-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-blue-400" />
        <h3 className="text-white font-semibold">
          How to Improve ATS Compatibility
        </h3>
      </div>
      <ul className="flex flex-col gap-3">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="bg-blue-900/40 text-blue-400 text-xs font-bold px-2 py-0.5 rounded-lg shrink-0 mt-0.5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-slate-300 text-sm leading-relaxed">
              {tip}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AtsSimulator() {
  const [analyses, setAnalyses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    async function fetchAnalyses() {
      try {
        const res = await apiFetch("/api/analyze/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAnalyses(data);
        if (data.length > 0) setSelectedId(data[0]._id);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAnalyses();
  }, [token]);

  async function handleSimulate() {
    if (!selectedId) {
      toast.error("Run an analysis first");
      return;
    }
    setLoading(true);
    setSimulation(null);

    try {
      const res = await apiFetch("/api/ats/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ analysisId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSimulation(data.simulation);
      toast.success("ATS simulation complete!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={24} className="text-blue-400" />
          <h1 className="text-3xl font-bold text-white">ATS Simulator</h1>
        </div>
        <p className="text-slate-500 text-sm">
          See exactly what an ATS robot sees when it scans your resume
        </p>
      </div>

      {/* Select analysis */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-400 font-medium">
            Select a Past Analysis
          </label>
          {analyses.length === 0 ? (
            <p className="text-slate-600 text-sm">
              No analyses yet — run one from the Analyze page first.
            </p>
          ) : (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors"
            >
              {analyses.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.jobDescription.slice(0, 80)}... — {a.result?.matchScore}%
                  match
                </option>
              ))}
            </select>
          )}
        </div>
        <button
          onClick={handleSimulate}
          disabled={loading || analyses.length === 0}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Shield size={16} />
          {loading ? "Simulating ATS scan..." : "Run ATS Simulation"}
        </button>
      </div>

      {/* Results */}
      {simulation && (
        <div className="flex flex-col gap-5">
          <AtsScoreGauge score={simulation.atsScore} />
          <SectionChecker sections={simulation.sectionsFound} />
          <KeywordDensity
            keywordsFound={simulation.keywordsFound}
            keywordsMissing={simulation.keywordsMissing}
            density={simulation.keywordDensity}
          />
          <FormatIssues issues={simulation.formatIssues} />
          <AtsTips tips={simulation.tips} />
        </div>
      )}
    </div>
  );
}
