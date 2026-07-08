import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Wand2, Copy, Check, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api.js";
import { Download } from "lucide-react";
import { exportTextAsPdf } from "../utils/exportPdf";

export default function Rewriter() {
  const [mode, setMode] = useState("bullet"); // "bullet" or "resume"
  const [bulletText, setBulletText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analyses, setAnalyses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
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

  async function handleBulletRewrite() {
    if (!bulletText.trim()) {
      toast.error("Paste a bullet point first");
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const res = await apiFetch("/api/rewrite/bullet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bulletText, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult({ original: data.original, rewritten: data.rewritten });
      toast.success("Bullet rewritten!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResumeRewrite() {
    if (!selectedId) {
      toast.error("Run an analysis first");
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const res = await apiFetch("/api/rewrite/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ analysisId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult({ original: data.original, rewritten: data.rewritten });
      toast.success("Resume rewritten!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result.rewritten);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const filename =
      mode === "bullet" ? "Rewritten_Bullet.pdf" : "Rewritten_Resume.pdf";
    exportTextAsPdf(
      result.rewritten,
      filename,
      mode === "bullet" ? "Rewritten Bullet Point" : "Rewritten Resume",
    );
    toast.success("PDF downloaded!");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Resume Rewriter</h1>
        <p className="text-gray-500 text-sm">
          Strengthen weak bullet points or rewrite your whole resume with AI
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1.5 w-fit">
        <button
          onClick={() => {
            setMode("bullet");
            setResult(null);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "bullet"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Single Bullet
        </button>
        <button
          onClick={() => {
            setMode("resume");
            setResult(null);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "resume"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Full Resume
        </button>
      </div>

      {/* Bullet Mode */}
      {mode === "bullet" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 font-medium">
              Your Bullet Point
            </label>
            <textarea
              rows={3}
              value={bulletText}
              onChange={(e) => setBulletText(e.target.value)}
              placeholder="e.g. Responsible for managing social media accounts"
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors placeholder-gray-600 resize-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 font-medium">
              Target Job Description{" "}
              <span className="text-gray-600">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste a JD to tailor the rewrite..."
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors placeholder-gray-600 resize-none"
            />
          </div>
          <button
            onClick={handleBulletRewrite}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Wand2 size={16} />
            {loading ? "Rewriting..." : "Rewrite Bullet Point"}
          </button>
        </div>
      )}

      {/* Resume Mode */}
      {mode === "resume" && (
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
                    {a.jobDescription.slice(0, 80)}... — {a.result?.matchScore}%
                    match
                  </option>
                ))}
              </select>
            )}
          </div>
          <button
            onClick={handleResumeRewrite}
            disabled={loading || analyses.length === 0}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Wand2 size={16} />
            {loading ? "Rewriting your resume..." : "Rewrite Full Resume"}
          </button>
        </div>
      )}

      {/* Result — Before/After */}
      {result && (
        <div className="flex flex-col gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-2">
              Original
            </p>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
              {result.original}
            </p>
          </div>

          <div className="flex justify-center">
            <ArrowRight size={18} className="text-blue-400" />
          </div>

          <div className="bg-blue-900/10 border border-blue-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-400 text-xs font-medium uppercase tracking-widest">
                AI Rewritten
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400 transition-colors bg-gray-800 px-3 py-1.5 rounded-lg"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400 transition-colors bg-gray-800 px-3 py-1.5 rounded-lg"
                >
                  <Download size={13} /> PDF
                </button>
              </div>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
              {result.rewritten}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
