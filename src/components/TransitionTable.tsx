import React from 'react';
import { DFA, DFAAnalysisResult } from '../types/dfa';

interface TransitionTableProps {
  dfa: DFA;
  analysis?: DFAAnalysisResult | null;
  isEditable?: boolean;
  onUpdateTransition?: (state: string, symbol: string, targetState: string) => void;
  isDark?: boolean;
}

export const TransitionTable: React.FC<TransitionTableProps> = ({
  dfa,
  analysis,
  isEditable = false,
  onUpdateTransition,
  isDark = true,
}) => {
  return (
    <div className={`overflow-x-auto rounded-xl border ${
      isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
    }`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className={`border-b text-xs font-semibold ${
            isDark ? 'border-slate-800 bg-slate-800/40 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'
          }`}>
            <th className="py-3 px-4 w-12 text-center">Type</th>
            <th className="py-3 px-4">State (q ∈ Q)</th>
            {dfa.alphabet.map((sym) => (
              <th key={sym} className="py-3 px-4 font-mono text-center">
                δ(q, <span className="text-sky-400 font-bold">{sym}</span>)
              </th>
            ))}
            {analysis && (
              <th className="py-3 px-4 text-right">Status Classification</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40">
          {dfa.states.map((state) => {
            const isStart = state === dfa.startState;
            const isFinal = dfa.finalStates.includes(state);
            const isDead = analysis ? analysis.deadStates.includes(state) : false;
            const isTrap = analysis ? analysis.trapStates.includes(state) : false;
            const isUnreachable = analysis ? analysis.unreachableStates.includes(state) : false;
            const isUseful = analysis ? analysis.usefulStates.includes(state) : false;

            return (
              <tr
                key={state}
                className={`transition-colors ${
                  isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'
                } ${
                  isDead
                    ? isDark ? 'bg-red-950/15' : 'bg-red-50/50'
                    : isUnreachable
                    ? isDark ? 'bg-amber-950/15' : 'bg-amber-50/50'
                    : ''
                }`}
              >
                {/* Visual marker: -> for start, * for final */}
                <td className="py-2.5 px-4 text-center font-mono font-bold text-xs">
                  {isStart && isFinal ? (
                    <span className="text-emerald-400" title="Start & Accepting State">→*</span>
                  ) : isStart ? (
                    <span className="text-emerald-400" title="Start State">→</span>
                  ) : isFinal ? (
                    <span className="text-indigo-400" title="Accepting State">*</span>
                  ) : (
                    <span className="text-slate-600">·</span>
                  )}
                </td>

                {/* State Name */}
                <td className="py-2.5 px-4 font-mono font-medium">
                  <div className="flex items-center gap-2">
                    <span className={`${
                      isDead
                        ? 'text-red-400'
                        : isUnreachable
                        ? 'text-amber-400'
                        : isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      {state}
                    </span>
                    {isStart && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-sans font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        start
                      </span>
                    )}
                    {isFinal && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-sans font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        final
                      </span>
                    )}
                  </div>
                </td>

                {/* Transitions for each symbol */}
                {dfa.alphabet.map((sym) => {
                  const targetState = dfa.transitions[state]?.[sym] || '';
                  const isMissing = !targetState;

                  return (
                    <td key={sym} className="py-2 px-4 text-center">
                      {isEditable ? (
                        <select
                          value={targetState}
                          onChange={(e) => onUpdateTransition?.(state, sym, e.target.value)}
                          className={`w-24 text-center font-mono text-xs py-1 px-2 rounded border transition-colors ${
                            isMissing
                              ? 'border-red-500 bg-red-950/30 text-red-300'
                              : isDark
                              ? 'border-slate-700 bg-slate-800 text-slate-200 focus:border-sky-500'
                              : 'border-slate-300 bg-white text-slate-800 focus:border-sky-500'
                          }`}
                        >
                          <option value="">-- select --</option>
                          {dfa.states.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`font-mono text-xs px-2 py-0.5 rounded ${
                            isMissing
                              ? 'text-red-400 bg-red-950/30 border border-red-800/40'
                              : isDark
                              ? 'text-sky-300 bg-slate-800/80 border border-slate-700/60'
                              : 'text-sky-700 bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {targetState || '—'}
                        </span>
                      )}
                    </td>
                  );
                })}

                {/* Analysis tags */}
                {analysis && (
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {isUnreachable && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Unreachable
                        </span>
                      )}
                      {isDead && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                          Dead State
                        </span>
                      )}
                      {isTrap && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-pink-500/15 text-pink-400 border border-pink-500/30">
                          Trap State
                        </span>
                      )}
                      {!isUnreachable && !isDead && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Useful &amp; Kept
                        </span>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
