import React from 'react';
import { CheckCircle2, TrendingDown, TrendingUp, Minus } from 'lucide-react';

const ExplainabilityCard = ({ decision, confidence, evidence, explanation }) => {
  // Determine color theme based on decision
  const getTheme = () => {
    switch (decision) {
      case 'BUY NOW':
      case 'GOOD DEAL':
        return { bg: 'bg-green-900/20', border: 'border-green-800/50', text: 'text-green-400', icon: <TrendingDown size={20} /> };
      case 'WAIT':
        return { bg: 'bg-red-900/20', border: 'border-red-800/50', text: 'text-red-400', icon: <TrendingUp size={20} /> };
      case 'WATCH':
        return { bg: 'bg-blue-900/20', border: 'border-blue-800/50', text: 'text-blue-400', icon: <Minus size={20} /> };
      default:
        return { bg: 'bg-neutral-800', border: 'border-neutral-700', text: 'text-neutral-400', icon: null };
    }
  };

  const theme = getTheme();

  return (
    <div className={`rounded-xl border p-5 ${theme.bg} ${theme.border}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-neutral-900/50 ${theme.text}`}>
            {theme.icon}
          </div>
          <div>
            <h3 className={`font-bold text-lg ${theme.text}`}>{decision}</h3>
            {confidence && (
              <p className="text-xs text-neutral-400">Confidence: {(confidence * 100).toFixed(0)}%</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Grounded Text */}
      {explanation && (
        <div className="mb-4 text-sm text-neutral-300 leading-relaxed bg-neutral-900/40 p-3 rounded-lg">
          {explanation}
        </div>
      )}

      {/* Structured Evidence list */}
      {evidence && evidence.length > 0 && (
        <div className="space-y-2 mt-4 pt-4 border-t border-neutral-700/50">
          <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-3">Evidence</p>
          {evidence.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-neutral-300">
              <CheckCircle2 size={16} className="text-primary-500 mt-0.5 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplainabilityCard;
