import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FileText, Copy, Check, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api.js";
import { Download } from "lucide-react";
import { exportTextAsPdf } from "../utils/exportPdf";

// Inside the component, add this function:
export default function CoverLetter() {
  const [analyses, setAnalyses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { token } = useAuth();

  // Fetch past analyses to pick from
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

  async function handleGenerate() {
    if (!selectedId) {
      toast.error("Please run an analysis first");
      return;
    }
    setLoading(true);
    setCoverLetter("");

    try {
      const res = await apiFetch("/api/cover-letter/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ analysisId: selectedId, companyName, jobTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCoverLetter(data.coverLetter);
      toast.success("Cover letter generated!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }
  function handleDownload() {
    const filename = `Cover_Letter${companyName ? `_${companyName.replace(/\s+/g, "_")}` : ""}.pdf`;
    exportTextAsPdf(coverLetter, filename, "Cover Letter");
    toast.success("PDF downloaded!");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          Cover Letter Generator
        </h1>
        <p className="text-gray-500 text-sm">
          AI writes a personalized cover letter based on your resume and the job
        </p>
      </div>

      {/* Config Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-5 mb-6">
        {/* Select Analysis */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400 font-medium">
            Select a Past Analysis
          </label>
          {analyses.length === 0 ? (
            <p className="text-gray-600 text-sm">
              No analyses yet — run one first from the Analyze page.
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
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors bg-gray-800 px-3 py-1.5 rounded-lg"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors bg-gray-800 px-3 py-1.5 rounded-lg"
          >
            <Download size={14} /> PDF
          </button>
        </div>

        {/* Company + Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 font-medium">
              Company Name <span className="text-gray-600">(optional)</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Razorpay"
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 font-medium">
              Job Title <span className="text-gray-600">(optional)</span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Frontend Developer"
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || analyses.length === 0}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles size={16} />
          {loading ? "Writing your cover letter..." : "Generate Cover Letter"}
        </button>
      </div>

      {/* Result */}
      {coverLetter && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-blue-400" />
              <h3 className="text-white font-medium">Your Cover Letter</h3>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors bg-gray-800 px-3 py-1.5 rounded-lg"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="bg-gray-800 rounded-xl p-5">
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {coverLetter}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
