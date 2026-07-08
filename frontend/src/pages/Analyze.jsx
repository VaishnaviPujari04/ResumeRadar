import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ResultCard from "../components/ResultCard";
import {
  Zap,
  Upload,
  FileText,
  X,
  Link2,
  Loader,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Analyze() {
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [result, setResult] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState(null);
  const [jdMode, setJdMode] = useState("url");
  const { token } = useAuth();
  const fileInputRef = useRef(null);
  const abortRef = useRef(null);

  // Cancel in-progress requests when leaving the page
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Restore last analysis from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("lastAnalysis");
    if (saved) {
      try {
        const { result, analysisId, extractedText } = JSON.parse(saved);
        setResult(result);
        setAnalysisId(analysisId);
        setExtractedText(extractedText || "");
      } catch {
        sessionStorage.removeItem("lastAnalysis");
      }
    }
  }, []);

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(selected.type)) {
      toast.error("Only PDF or DOCX files are allowed");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
    setFile(selected);
    setExtractedText("");
    setResult(null);
    sessionStorage.removeItem("lastAnalysis");
  }

  function handleRemoveFile() {
    setFile(null);
    setExtractedText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClearResults() {
    setResult(null);
    setAnalysisId(null);
    setExtractedText("");
    setError(null);
    sessionStorage.removeItem("lastAnalysis");
  }

  async function handleScrapeUrl() {
    if (!jobUrl.trim()) {
      toast.error("Paste a job posting URL first");
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setScraping(true);
    setJobDescription("");

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: jobUrl }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.tooShort) {
          setJdMode("manual");
          setJobDescription(data.extracted || "");
          toast.error(
            "This site blocks auto-extraction. Switching to manual mode — please paste the full JD.",
            { duration: 5000 },
          );
        } else {
          throw new Error(data.message);
        }
        return;
      }

      // Check if extracted content is meaningful
      if (data.jobDescription.trim().length < 200) {
        setJdMode("manual");
        setJobDescription(data.jobDescription);
        toast.error(
          "Extracted content seems incomplete. Please review and add more details manually.",
          { duration: 5000 },
        );
      } else {
        setJobDescription(data.jobDescription);
        toast.success(`JD extracted — ${data.charCount} characters`);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      toast.error(err.message || "Failed to extract JD. Try manually.");
    } finally {
      setScraping(false);
    }
  }

  async function handleAnalyze() {
    if (!file) {
      setError("Please upload your resume file.");
      return;
    }
    if (!jobDescription.trim()) {
      setError(
        "Job description is required. Extract from URL or type manually.",
      );
      return;
    }
    if (jobDescription.trim().length < 50) {
      setError(
        "Job description is too short. Please paste the complete job description for accurate analysis.",
      );
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setResult(null);
    sessionStorage.removeItem("lastAnalysis");

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const res = await fetch("/api/analyze/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        signal: controller.signal,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setResult(data.result);
      setAnalysisId(data.analysisId);
      setExtractedText(data.extractedResumeText || "");

      // Persist to sessionStorage so result survives tab changes
      sessionStorage.setItem(
        "lastAnalysis",
        JSON.stringify({
          result: data.result,
          analysisId: data.analysisId,
          extractedText: data.extractedResumeText || "",
        }),
      );

      toast.success("Analysis complete!");
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Analysis failed. Please try again.");
      toast.error(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    if (abortRef.current) abortRef.current.abort();
    setScraping(false);
    setLoading(false);
    toast("Cancelled");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">New Analysis</h1>
        <p className="text-slate-500 text-sm">
          Upload your resume and add the job description
        </p>
      </div>

      <div className="flex flex-col gap-5 mb-6">
        {/* Resume Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-400 font-medium">
            Upload Resume{" "}
            <span className="text-slate-600">(PDF or DOCX, max 5MB)</span>
          </label>
          {!file ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl py-10 flex flex-col items-center gap-2 transition-colors"
            >
              <Upload size={24} className="text-slate-500" />
              <p className="text-slate-400 text-sm">
                Click to upload your resume
              </p>
              <p className="text-slate-600 text-xs">PDF or DOCX</p>
            </button>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-blue-400" />
                <div>
                  <p className="text-white text-sm">{file.name}</p>
                  <p className="text-slate-500 text-xs">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-slate-500 hover:text-red-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* JD Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-400 font-medium">
              Job Description
            </label>
            <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setJdMode("url")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  jdMode === "url"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                From URL
              </button>
              <button
                onClick={() => setJdMode("manual")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  jdMode === "manual"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Type Manually
              </button>
            </div>
          </div>

          {/* URL Mode */}
          {jdMode === "url" && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="flex flex-1 items-center gap-2 bg-slate-900 border border-slate-800 focus-within:border-blue-500 rounded-xl px-4 py-3 transition-colors">
                  <Link2 size={15} className="text-slate-500 shrink-0" />
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="Paste LinkedIn, Naukri, Indeed, or any job URL..."
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
                {!scraping ? (
                  <button
                    onClick={handleScrapeUrl}
                    disabled={!jobUrl.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Link2 size={14} /> Extract JD
                  </button>
                ) : (
                  <button
                    onClick={handleCancel}
                    className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <X size={14} /> Cancel
                  </button>
                )}
              </div>

              {scraping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Loader size={12} className="animate-spin" />
                  Extracting job description — this may take 10-20 seconds for
                  some sites...
                </div>
              )}

              <p className="text-slate-600 text-xs">
                Supports: LinkedIn · Naukri · Indeed · Glassdoor · Internshala ·
                and most job boards
              </p>

              {jobDescription && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-green-400 font-medium">
                      ✓ JD extracted — review and edit if needed
                    </p>
                    <p className="text-xs text-slate-600">
                      {jobDescription.length} chars
                    </p>
                  </div>
                  <textarea
                    rows={6}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Manual Mode */}
          {jdMode === "manual" && (
            <div className="flex flex-col gap-2">
              <textarea
                rows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here — include responsibilities, requirements, and required skills for best results..."
                className="bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder-slate-600 resize-none"
              />
              {jobDescription && (
                <p className="text-slate-600 text-xs text-right">
                  {jobDescription.length} chars
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Analyze or Cancel button */}
        {!loading ? (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Zap size={16} />
            Analyze My Resume
          </button>
        ) : (
          <div className="flex gap-3">
            <div className="flex-1 bg-blue-900/20 border border-blue-800 rounded-xl py-3 flex items-center justify-center gap-2 text-blue-400 text-sm">
              <Loader size={16} className="animate-spin" />
              Reading resume and analyzing with AI...
            </div>
            <button
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <>
          <div className="flex items-center justify-between mb-4">
            {/* <h2 className="text-white font-semibold text-xl">
              Analysis Result
            </h2> */}
            <button
              onClick={handleClearResults}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              <RotateCcw size={12} /> Clear Results
            </button>
          </div>
          <ResultCard result={result} analysisId={analysisId} />
          {extractedText && (
            <details className="mt-5 bg-slate-900 border border-slate-800 rounded-xl p-4">
              <summary className="text-slate-400 text-sm cursor-pointer">
                View extracted resume text
              </summary>
              <p className="text-slate-500 text-xs mt-3 whitespace-pre-wrap leading-relaxed">
                {extractedText}
              </p>
            </details>
          )}
        </>
      )}
    </div>
  );
}
