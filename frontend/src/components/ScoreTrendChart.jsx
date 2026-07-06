import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function getTrend(trend) {
  if (trend.length < 2) return null;
  const first = trend[0].score;
  const last = trend[trend.length - 1].score;
  const diff = last - first;

  if (diff > 5) return { label: "Improving", icon: TrendingUp, color: "text-green-400", bg: "bg-green-900/20 border-green-800", diff: `+${diff}` };
  if (diff < -5) return { label: "Declining", icon: TrendingDown, color: "text-red-400", bg: "bg-red-900/20 border-red-800", diff: `${diff}` };
  return { label: "Stable", icon: Minus, color: "text-yellow-400", bg: "bg-yellow-900/20 border-yellow-800", diff: `${diff > 0 ? "+" : ""}${diff}` };
}

export default function ScoreTrendChart({ trend }) {
  if (!trend || trend.length === 0) return null;

  const data = trend.map((t) => ({
    date: new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    score: t.score,
  }));

  const trendInfo = getTrend(trend);
  const avgScore = Math.round(trend.reduce((s, t) => s + t.score, 0) / trend.length);
  const bestScore = Math.max(...trend.map((t) => t.score));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold mb-0.5">Match Score Trend</h3>
          <p className="text-slate-500 text-xs">How your scores have changed over time</p>
        </div>

        {trendInfo && (
          <div className={`flex items-center gap-1.5 border text-xs px-3 py-1.5 rounded-xl ${trendInfo.bg}`}>
            <trendInfo.icon size={13} className={trendInfo.color} />
            <span className={trendInfo.color}>{trendInfo.label}</span>
            <span className={`font-bold ${trendInfo.color}`}>{trendInfo.diff}pts</span>
          </div>
        )}
      </div>

      {/* Mini stat row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-slate-800 rounded-xl px-3 py-2 text-center">
          <p className="text-slate-500 text-xs mb-0.5">Analyses</p>
          <p className="text-white font-bold">{trend.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl px-3 py-2 text-center">
          <p className="text-slate-500 text-xs mb-0.5">Average</p>
          <p className="text-white font-bold">{avgScore}%</p>
        </div>
        <div className="bg-slate-800 rounded-xl px-3 py-2 text-center">
          <p className="text-slate-500 text-xs mb-0.5">Best</p>
          <p className="text-green-400 font-bold">{bestScore}%</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "12px" }}
            formatter={(value) => [`${value}%`, "Match Score"]}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6, fill: "#60a5fa" }}
          />
        </LineChart>
      </ResponsiveContainer>

      {trend.length === 1 && (
        <p className="text-slate-600 text-xs text-center mt-3">
          Run more analyses to see your trend direction
        </p>
      )}
    </div>
  );
}