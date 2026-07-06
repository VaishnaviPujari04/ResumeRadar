import { CheckCircle, AlertCircle, Lightbulb} from "lucide-react";
import ShareButton from "./ShareButton";

function ScoreCircle({ score }) {
  const color = score >= 75 ? "#4ade80" : score >= 50 ? "#facc15" : "#f87171";
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-2xl">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#374151"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${(score / 100) * 251} 251`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <p className="text-3xl font-bold text-white -mt-16">{score}%</p>
      <p className="text-gray-400 text-sm mt-10">Match Score</p>
    </div>
  );
}

export default function ResultCard({ result, analysisId }) {
  const { matchScore, missingKeywords, strengths, suggestions } = result;

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-white font-semibold text-xl">Analysis Result</h2>
      {analysisId && <ShareButton analysisId={analysisId} />}
    
      {/* Score */}
      <ScoreCircle score={matchScore} />

      {/* Missing Keywords */}
      {missingKeywords?.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-red-400" />
            <h3 className="text-white font-medium text-sm">Missing Keywords</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((kw) => (
              <span
                key={kw}
                className="bg-red-900/20 border border-red-800 text-red-400 text-xs px-3 py-1 rounded-full"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {strengths?.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-green-400" />
            <h3 className="text-white font-medium text-sm">Strengths</h3>
          </div>
          <ul className="flex flex-col gap-2">
            {strengths.map((s) => (
              <li
                key={s}
                className="text-gray-300 text-sm flex items-start gap-2"
              >
                <span className="text-green-400 mt-0.5">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {suggestions?.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-yellow-400" />
            <h3 className="text-white font-medium text-sm">
              Suggestions to Improve
            </h3>
          </div>
          <ul className="flex flex-col gap-2">
            {suggestions.map((s) => (
              <li
                key={s}
                className="text-gray-300 text-sm flex items-start gap-2"
              >
                <span className="text-yellow-400 mt-0.5">→</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
