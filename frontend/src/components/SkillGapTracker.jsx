export default function SkillGapTracker({ topMissingKeywords }) {
  if (!topMissingKeywords || topMissingKeywords.length === 0) return null;

  const max = topMissingKeywords[0]?.count || 1;

  const getBarColor = (count) => {
    const ratio = count / max;
    if (ratio > 0.7) return "bg-red-500";
    if (ratio > 0.4) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="mb-5">
        <h3 className="text-white font-semibold">Skill Gap Tracker</h3>
        <p className="text-slate-500 text-xs mt-0.5">
          Most frequently missing keywords across all your analyses
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {topMissingKeywords.map((item) => (
          <div key={item.keyword} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">{item.keyword}</span>
              <span className="text-slate-500 text-xs">
                missing in {item.count} {item.count === 1 ? "analysis" : "analyses"}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${getBarColor(item.count)}`}
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-slate-500">Critical gap</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="text-slate-500">Moderate gap</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-slate-500">Minor gap</span>
        </div>
      </div>
    </div>
  );
}