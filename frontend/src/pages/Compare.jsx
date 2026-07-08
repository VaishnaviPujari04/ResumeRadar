import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Upload, FileText, X, Trophy, Zap, Link2, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api.js";

function FileUploadBox({ label, file, onFile, onRemove }) {
  const ref = useRef(null);

  function handleChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(selected.type)) {
      toast.error("Only PDF or DOCX files allowed");
      return;
    }
    onFile(selected);
  }

  return (
    <div className="flex flex-col gap-2 flex-1">
      <label className="text-sm text-slate-400 font-medium">{label}</label>
      {!file ? (
        <button
          onClick={() => ref.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl py-8 flex flex-col items-center gap-2 transition-colors h-full min-h-32"
        >
          <Upload size={20} className="text-slate-500" />
          <p className="text-slate-400 text-sm">Click to upload</p>
          <p className="text-slate-600 text-xs">PDF or DOCX</p>
        </button>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={16} className="text-blue-400 shrink-0" />
            <div>
              <p className="text-white text-xs font-medium line-clamp-1">
                {file.name}
              </p>
              <p className="text-slate-500 text-xs">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="text-slate-500 hover:text-red-400 transition-colors ml-2 shrink-0"
          >
            <X size={15} />
          </button>
        </div>
      )}
      <input
        ref={ref}
        type="file"
        accept=".pdf,.docx"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

function ScoreCard({ label, filename, result, isWinner, isTie }) {
  const [showAllKeywords, setShowAllKeywords] = useState(false);
  const score = result?.matchScore || 0;
  const color =
    score >= 75
      ? "text-green-400"
      : score >= 50
        ? "text-yellow-400"
        : "text-red-400";
  const borderColor = isWinner ? "border-blue-500" : "border-slate-800";
  const keywords = result?.missingKeywords || [];
  const visibleKeywords = showAllKeywords ? keywords : keywords.slice(0, 4);
  const remaining = keywords.length - 4;

  return (
    <div
      className={`bg-slate-900 border-2 ${borderColor} rounded-2xl p-5 flex flex-col gap-4 flex-1 relative`}
    >
      {isWinner && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <Trophy size={11} /> Winner
        </div>
      )}
      {isTie && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          Tie
        </div>
      )}

      {/* Score */}
      <div className="text-center pt-2">
        <p className="text-slate-400 text-xs mb-1 font-medium">{label}</p>
        <p className="text-white text-xs line-clamp-1 mb-3">{filename}</p>
        <p className={`text-5xl font-bold ${color}`}>{score}%</p>
        <p className="text-slate-500 text-xs mt-1">Match Score</p>
      </div>

      {/* Missing Keywords */}
      {keywords.length > 0 && (
        <div>
          <p className="text-slate-500 text-xs font-medium mb-2">
            Missing Keywords
            <span className="text-slate-600 ml-1">({keywords.length})</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {visibleKeywords.map((kw) => (
              <span
                key={kw}
                className="bg-red-900/20 border border-red-800 text-red-400 text-xs px-2 py-0.5 rounded-full"
              >
                {kw}
              </span>
            ))}
          </div>

          {/* Toggle button */}
          {keywords.length > 4 && (
            <button
              onClick={() => setShowAllKeywords(!showAllKeywords)}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              {showAllKeywords ? "Show less" : `+${remaining} more`}
            </button>
          )}
        </div>
      )}

      {/* Strengths */}
      {result?.strengths?.length > 0 && (
        <div>
          <p className="text-slate-500 text-xs font-medium mb-2">Strengths</p>
          <ul className="flex flex-col gap-1.5">
            {result.strengths.slice(0, 3).map((s) => (
              <li
                key={s}
                className="text-slate-300 text-xs flex items-start gap-1.5"
              >
                <span className="text-green-400 shrink-0">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {result?.suggestions?.length > 0 && (
        <div>
          <p className="text-slate-500 text-xs font-medium mb-2">Suggestions</p>
          <ul className="flex flex-col gap-1.5">
            {result.suggestions.slice(0, 3).map((s) => (
              <li
                key={s}
                className="text-slate-300 text-xs flex items-start gap-1.5"
              >
                <span className="text-yellow-400 shrink-0">→</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Compare() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  async function handleScrapeUrl() {
    if (!jobUrl.trim()) {
      toast.error("Paste a job URL first");
      return;
    }
    setScraping(true);
    try {
      const res = await apiFetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: jobUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setJobDescription(data.jobDescription);
      toast.success("JD extracted!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setScraping(false);
    }
  }

  async function handleCompare() {
    if (!fileA || !fileB) {
      setError("Please upload both resume files.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Job description is required.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resumeA", fileA);
      formData.append("resumeB", fileB);
      formData.append("jobDescription", jobDescription);

      const res = await apiFetch("/api/compare", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data);
      toast.success("Comparison complete!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          Resume Comparison
        </h1>
        <p className="text-slate-500 text-sm">
          Upload two resumes and see which one scores better against the same
          job
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Two file uploads side by side */}
        <div className="flex gap-4">
          <FileUploadBox
            label="Resume A"
            file={fileA}
            onFile={setFileA}
            onRemove={() => setFileA(null)}
          />
          <FileUploadBox
            label="Resume B"
            file={fileB}
            onFile={setFileB}
            onRemove={() => setFileB(null)}
          />
        </div>

        {/* JD Section */}
        <div className="flex flex-col gap-3">
          <label className="text-sm text-slate-400 font-medium">
            Job Description
          </label>

          {/* URL scraper */}
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2 bg-slate-900 border border-slate-800 focus-within:border-blue-500 rounded-xl px-4 py-3 transition-colors">
              <Link2 size={15} className="text-slate-500 shrink-0" />
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="Paste job URL to auto-extract JD..."
                className="bg-transparent outline-none text-white text-sm placeholder-slate-600 w-full"
              />
              {jobUrl && (
                <button
                  onClick={() => setJobUrl("")}
                  className="text-slate-600 hover:text-red-400"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={handleScrapeUrl}
              disabled={scraping || !jobUrl.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              {scraping ? (
                <Loader size={14} className="animate-spin" />
              ) : (
                <Link2 size={14} />
              )}
              {scraping ? "Extracting..." : "Extract JD"}
            </button>
          </div>

          <textarea
            rows={5}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Or paste job description manually..."
            className="bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder-slate-600 resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          onClick={handleCompare}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Zap size={16} />
          {loading ? "Analyzing both resumes..." : "Compare Resumes"}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-10 flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-white font-bold text-2xl mb-1">
              {result.winner === "tie"
                ? "🤝 It's a Tie!"
                : `Resume ${result.winner} Wins! 🏆`}
            </h2>
            <p className="text-slate-500 text-sm">
              {result.winner === "tie"
                ? "Both resumes scored within 2 points of each other"
                : `Resume ${result.winner} is a better match for this job`}
            </p>
          </div>

          {/* Score difference bar */}
          {result.winner !== "tie" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
              <p className="text-slate-400 text-sm">
                Score difference:{" "}
                <span className="text-blue-400 font-bold">
                  {Math.abs(
                    result.resumeA.result.matchScore -
                      result.resumeB.result.matchScore,
                  )}{" "}
                  points
                </span>
              </p>
            </div>
          )}

          {/* AI Reasoning */}
          {result.reasoning && (
            <div className="bg-blue-900/20 border border-blue-800 rounded-2xl p-4">
              <p className="text-blue-400 text-xs font-medium uppercase tracking-widest mb-1">
                AI Reasoning
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                {result.reasoning}
              </p>
            </div>
          )}
          {/* Side by side cards */}
          <div className="flex gap-4 items-start">
            <ScoreCard
              label="Resume A"
              filename={result.resumeA.filename}
              result={result.resumeA.result}
              isWinner={result.winner === "A"}
              isTie={result.winner === "tie"}
            />
            <ScoreCard
              label="Resume B"
              filename={result.resumeB.filename}
              result={result.resumeB.result}
              isWinner={result.winner === "B"}
              isTie={result.winner === "tie"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
