import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Zap,
  Clock,
  FileText,
  Wand2,
  MessageCircle,
  ArrowRight,
  Shield,
  Trophy,
  TrendingUp,
  Briefcase,
} from "lucide-react";
import ScoreTrendChart from "../components/ScoreTrendChart";
import WeeklyProgress from "../components/WeeklyProgress";
import SkillGapTracker from "../components/SkillGapTracker";
import ApplicationTracker from "../components/ApplicationTracker";

export default function Dashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [appStats, setAppStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [statsRes, appStatsRes] = await Promise.all([
          apiFetch("/api/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiFetch("/api/applications/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const statsData = await statsRes.json();
        const appStatsData = await appStatsRes.json();
        setStats(statsData);
        setAppStats(appStatsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm">Your job search command center</p>
      </div>

      {/* Top Stats Row */}
      {!loading && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard
            label="Analyses"
            value={stats.totalAnalyses}
            icon={<Zap size={15} />}
          />
          <StatCard
            label="Avg Score"
            value={`${stats.avgScore}%`}
            icon={<TrendingUp size={15} />}
          />
          <StatCard
            label="This Week"
            value={stats.weeklyAnalyses}
            icon={<Clock size={15} />}
          />
          <StatCard
            label="Applications"
            value={appStats?.total || 0}
            icon={<Briefcase size={15} />}
          />
        </div>
      )}

      {/* Application Status Row */}
      {!loading && appStats && appStats.total > 0 && (
        <div className="grid grid-cols-5 gap-2 mb-8">
          {Object.entries(appStats.byStatus).map(([status, count]) => (
            <div
              key={status}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center"
            >
              <p className="text-white font-bold text-lg">{count}</p>
              <p className="text-slate-500 text-xs">{status}</p>
            </div>
          ))}
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <ActionCard
          to="/analyze"
          icon={<Zap size={20} className="text-white" />}
          title="New Analysis"
          desc="Get your match score against any JD"
          primary
        />
        <ActionCard
          to="/cover-letter"
          icon={<FileText size={20} className="text-blue-400" />}
          title="Cover Letter"
          desc="AI-generated cover letters"
        />
        <ActionCard
          to="/rewriter"
          icon={<Wand2 size={20} className="text-blue-400" />}
          title="Resume Rewriter"
          desc="Strengthen bullets and resume text"
        />
        <ActionCard
          to="/interview-prep"
          icon={<MessageCircle size={20} className="text-blue-400" />}
          title="Interview Prep"
          desc="Practice likely interview questions"
        />
        <ActionCard
          to="/compare"
          icon={<Trophy size={20} className="text-blue-400" />}
          title="Compare Resumes"
          desc="See which resume scores better"
        />
        <ActionCard
          to="/ats"
          icon={<Shield size={20} className="text-blue-400" />}
          title="ATS Simulator"
          desc="See what an ATS robot sees"
        />
      </div>

      {/* Charts Row */}
      {!loading && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          {stats.trend?.length > 0 && <ScoreTrendChart trend={stats.trend} />}
          {stats.trend?.length > 0 && <WeeklyProgress trend={stats.trend} />}
        </div>
      )}

      {/* Skill Gap Tracker */}
      {!loading && stats?.topMissingKeywords?.length > 0 && (
        <div className="mb-6">
          <SkillGapTracker topMissingKeywords={stats.topMissingKeywords} />
        </div>
      )}

      {/* Application Tracker */}
      <ApplicationTracker />
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 flex flex-col gap-1.5">
      <span className="text-slate-500 flex items-center gap-1.5 text-xs">
        {icon} {label}
      </span>
      <span className="text-white font-bold text-xl">{value}</span>
    </div>
  );
}

function ActionCard({ to, icon, title, desc, primary }) {
  return (
    <Link
      to={to}
      className={`rounded-2xl p-6 flex flex-col gap-3 group transition-colors ${
        primary
          ? "bg-blue-600 hover:bg-blue-500"
          : "bg-slate-900 border border-slate-800 hover:border-blue-700"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${primary ? "bg-blue-500" : "bg-slate-800"}`}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-white font-semibold text-lg">{title}</h2>
        <p
          className={`text-sm ${primary ? "text-blue-200" : "text-slate-500"}`}
        >
          {desc}
        </p>
      </div>
      <ArrowRight
        size={18}
        className={`${primary ? "text-blue-200" : "text-slate-600"} group-hover:translate-x-1 transition-transform`}
      />
    </Link>
  );
}
