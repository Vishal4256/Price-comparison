import React from 'react';
import { Bot, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';

const AISummary = ({ summary }) => {
  if (!summary) return null;

  return (
    <Card className="p-6 md:p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border border-indigo-100 dark:border-indigo-800/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            AI Price Summary
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Gemini AI</p>
        </div>
      </div>

      <div className="space-y-4">
        {summary.pros && summary.pros.length > 0 && (
          <div className="space-y-2">
            {summary.pros.map((pro, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{pro}</span>
              </div>
            ))}
          </div>
        )}
        
        {summary.cons && summary.cons.length > 0 && (
          <div className="space-y-2 mt-4 pt-4 border-t border-indigo-200/50 dark:border-indigo-800/50">
            {summary.cons.map((con, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{con}</span>
              </div>
            ))}
          </div>
        )}
        
        {summary.verdict && (
          <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
            <span className="font-bold text-indigo-700 dark:text-indigo-400">AI Verdict: </span>
            <span className="text-sm text-gray-800 dark:text-gray-200">{summary.verdict}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AISummary;
