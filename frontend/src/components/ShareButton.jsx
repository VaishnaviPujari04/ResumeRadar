import { useState } from "react";
import { Share2, Copy, Check, X, Link2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api.js";

export default function ShareButton({ analysisId }) {
  const [shareUrl, setShareUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const { token } = useAuth();

  async function handleShare() {
    setLoading(true);
    try {
      const res = await fetch(`/api/share/${analysisId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const fullUrl = `${window.location.origin}${data.shareUrl}`;
      setShareUrl(fullUrl);
      setShowPanel(true);
      toast.success("Share link generated!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRevoke() {
    try {
      await fetch(`/api/share/${analysisId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setShareUrl(null);
      setShowPanel(false);
      toast.success("Share link revoked");
    } catch (err) {
      toast.error("Failed to revoke link");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {!showPanel ? (
        <button
          onClick={handleShare}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Share2 size={15} />
          {loading ? "Generating link..." : "Share Report"}
        </button>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 size={14} className="text-blue-400" />
              <p className="text-white text-sm font-medium">Shareable Link</p>
            </div>
            <button
              onClick={() => setShowPanel(false)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* URL box */}
          <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
            <p className="text-slate-400 text-xs truncate">{shareUrl}</p>
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-blue-400 transition-colors shrink-0"
            >
              {copied ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-slate-600 text-xs">
              Anyone with this link can view the report
            </p>
            <button
              onClick={handleRevoke}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Revoke link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
