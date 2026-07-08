import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Clock, FileText, Wand2, MessageCircle } from "lucide-react";

const TABS = [
  {
    key: "analyses",
    label: "Analyses",
    icon: Clock,
    endpoint: "/api/analyze/history",
  },
  {
    key: "letters",
    label: "Cover Letters",
    icon: FileText,
    endpoint: "/api/cover-letter/history",
  },
  {
    key: "rewrites",
    label: "Rewrites",
    icon: Wand2,
    endpoint: "/api/rewrite/history",
  },
  {
    key: "interviews",
    label: "Interview Prep",
    icon: MessageCircle,
    endpoint: "/api/interview/history",
  },
];

export default function History() {
  const [activeTab, setActiveTab] = useState("analyses");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const tab = TABS.find((t) => t.key === activeTab);
      try {
        const res = await fetch(tab.endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeTab, token]);

  function getScoreColor(score) {
    if (score >= 75) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1">History</h1>
        <p className="text-gray-500 text-sm">
          All your past activity in one place
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-900 rounded-2xl h-20"
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <Clock size={32} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">Nothing here yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activeTab === "analyses" &&
            data.map((item) => (
              <div
                key={item._id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center justify-between"
              >
                <p className="text-white text-sm line-clamp-1 max-w-sm">
                  {item.jobDescription}
                </p>
                <span
                  className={`font-bold text-sm ${getScoreColor(item.result?.matchScore)}`}
                >
                  {item.result?.matchScore}%
                </span>
              </div>
            ))}

          {activeTab === "letters" &&
            data.map((item) => (
              <div
                key={item._id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
              >
                <p className="text-white text-sm font-medium mb-1">
                  {item.companyName || "Cover Letter"}{" "}
                  {item.jobTitle && `— ${item.jobTitle}`}
                </p>
                <p className="text-gray-500 text-xs line-clamp-2">
                  {item.coverLetter}
                </p>
              </div>
            ))}

          {activeTab === "rewrites" &&
            data.map((item) => (
              <div
                key={item._id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
              >
                <span className="text-xs text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded-full mb-2 inline-block">
                  {item.type === "bullet" ? "Bullet Point" : "Full Resume"}
                </span>
                <p className="text-gray-500 text-xs line-clamp-2">
                  {item.rewritten}
                </p>
              </div>
            ))}

          {activeTab === "interviews" &&
            data.map((item) => (
              <div
                key={item._id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
              >
                <p className="text-white text-sm mb-1">
                  {item.questions?.length || 0} questions generated
                </p>
                <p className="text-white text-sm line-clamp-1 max-w-sm">
                  {item.jobDescription
                    ?.replace(
                      /save this job|unsave|share this job|copy link|job no\./gi,
                      "",
                    )
                    ?.trim()
                    ?.slice(0, 80) || "Untitled Analysis"}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
