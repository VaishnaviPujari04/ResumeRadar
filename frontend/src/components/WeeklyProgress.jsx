import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function WeeklyProgress({ trend }) {
  if (!trend || trend.length === 0) return null;

  // Group analyses by day of week for last 7 days
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayCounts = Array(7).fill(0);
  const dayScores = Array(7).fill([]);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  trend
    .filter((t) => new Date(t.date) >= weekAgo)
    .forEach((t) => {
      const day = new Date(t.date).getDay();
      dayCounts[day]++;
      dayScores[day] = [...(dayScores[day] || []), t.score];
    });

  const data = days.map((day, i) => ({
    day,
    analyses: dayCounts[i],
    avgScore: dayScores[i]?.length
      ? Math.round(dayScores[i].reduce((a, b) => a + b, 0) / dayScores[i].length)
      : 0,
  }));

  const totalThisWeek = dayCounts.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold">Weekly Activity</h3>
          <p className="text-slate-500 text-xs mt-0.5">Analyses run in the last 7 days</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-400">{totalThisWeek}</p>
          <p className="text-slate-600 text-xs">this week</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data} barCategoryGap="30%">
          <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "12px" }}
            formatter={(value) => [value, "Analyses"]}
          />
          <Bar dataKey="analyses" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.analyses > 0 ? "#3b82f6" : "#1e293b"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}