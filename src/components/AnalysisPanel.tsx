import React from 'react';
import { DFA, DFAAnalysisResult } from '../types/dfa';
import { CheckCircle2, AlertTriangle, Skull, ShieldAlert, Sparkles, ArrowRight, CornerDownRight } from 'lucide-react';

interface AnalysisPanelProps {
  dfa: DFA;
  analysis: DFAAnalysisResult | null;
  onAnalyze: () => void;
  onPrune: () => void;
  isDark?: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  dfa,
  analysis,
  onAnalyze,
  onPrune,
  isDark = true,
}) => {
  if (!analysis) {
    return (
      <div className={`p-8 text-center rounded-xl border ${
        isDark ? 'border-slate-800 bg-slate-900/40 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
      } space-y-3`}>
        <Sparkles className="w-8 h-8 text-sky-400 mx-auto" />
        <h3 className="font-semibold text-base text-slate-200">Analysis Not Yet Executed</h3>
        <p className="text-xs max-w-md mx-auto text-slate-400">
          Click below to execute BFS forward reachability, reverse usefulness traversal, and trap detection algorithms on your DFA.
        </p>
        <button
          type="button"
          onClick={onAnalyze}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition-colors inline-flex items-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Analyze DFA Now</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Required Formal Result Display */}
      <div className={`p-6 rounded-xl border ${
        isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white'
      } space-y-4`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-100">
              DFA Formal Analysis Results
            </h3>
            <p className="text-xs text-slate-400">
              Computed directly via BFS from q₀ and reverse graph traversal from F
            </p>
          </div>
          <button
            type="button"
            onClick={onPrune}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Proceed to Prune DFA</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Formatted Text Box as required by prompt */}
        <div className={`p-4 rounded-lg font-mono text-xs border ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-900 border-slate-800 text-slate-200'
        } space-y-3`}>
          <div>
            <div className="text-emerald-400 font-bold uppercase tracking-wide text-[11px]">
              Reachable States:
            </div>
            <div className="text-slate-100 font-semibold text-sm">
              {analysis.reachableStates.length > 0
                ? analysis.reachableStates.join(', ')
                : 'None'}
            </div>
          </div>

          <div>
            <div className="text-amber-400 font-bold uppercase tracking-wide text-[11px]">
              Unreachable States:
            </div>
            <div className="text-slate-100 font-semibold text-sm">
              {analysis.unreachableStates.length > 0
                ? analysis.unreachableStates.join(', ')
                : 'None'}
            </div>
          </div>

          <div>
            <div className="text-sky-400 font-bold uppercase tracking-wide text-[11px]">
              Useful States:
            </div>
            <div className="text-slate-100 font-semibold text-sm">
              {analysis.usefulStates.length > 0
                ? analysis.usefulStates.join(', ')
                : 'None'}
            </div>
          </div>

          <div>
            <div className="text-red-400 font-bold uppercase tracking-wide text-[11px]">
              Dead States:
            </div>
            <div className="text-slate-100 font-semibold text-sm">
              {analysis.deadStates.length > 0
                ? analysis.deadStates.join(', ')
                : 'None'}
            </div>
          </div>

          <div>
            <div className="text-pink-400 font-bold uppercase tracking-wide text-[11px]">
              Trap States:
            </div>
            <div className="text-slate-100 font-semibold text-sm">
              {analysis.trapStates.length > 0
                ? analysis.trapStates.join(', ')
                : 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Distinction Explanation: Dead State vs Trap State */}
      <div className={`p-5 rounded-xl border ${
        isDark ? 'border-indigo-900/40 bg-indigo-950/20' : 'border-indigo-200 bg-indigo-50/60'
      } space-y-3`}>
        <h4 className="font-semibold text-sm text-indigo-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-indigo-400" />
          <span>Theoretical Distinction: Dead State vs. Trap State</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
          <div className="space-y-1">
            <span className="font-bold text-red-400">Dead State (Reachable - Useful):</span>
            <p className="text-slate-300">
              Any state <code className="text-red-300 font-mono">q ∈ R</code> that cannot reach any accepting state in <code className="text-indigo-300 font-mono">F</code>.
              A dead state may transition forward into other dead states before eventually reaching a sink.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-pink-400">Trap State (Closed Absorbing Set):</span>
            <p className="text-slate-300">
              A state or strongly connected component (SCC) with no path to <code className="text-indigo-300 font-mono">F</code>, where all outgoing transitions
              stay permanently trapped inside that state or SCC (e.g. self-loop sink or trap cycle <code className="text-pink-300 font-mono">t1 ⇄ t2</code>).
            </p>
          </div>
        </div>
      </div>

      {/* State-by-State Verification Table */}
      <div className={`p-5 rounded-xl border ${
        isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
      } space-y-3`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-sm text-slate-100">
              State-by-State Witness Paths &amp; Mathematical Proof
            </h4>
            <p className="text-xs text-slate-400">
              Witness sequences derived from BFS exploration
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            Time: O(|Q| + |δ|)
          </span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {dfa.states.map((st) => {
            const details = analysis.stateDetails[st];
            if (!details) return null;

            return (
              <div key={st} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-sky-400">{st}</span>
                    <div className="flex items-center gap-1">
                      {details.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-[10px] px-2 py-0.5 rounded font-sans ${
                            tag === 'Start'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : tag.includes('Accepting')
                              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                              : tag === 'Dead State'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : tag === 'Trap State'
                              ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                              : tag === 'Unreachable'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Witness paths */}
                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1 font-mono">
                      <span className="text-slate-500">Path from q₀:</span>
                      {details.reachPathFromStart ? (
                        <span className="text-emerald-400">
                          {details.reachPathFromStart.join(' → ')}
                        </span>
                      ) : (
                        <span className="text-amber-500">∅ (Unreachable)</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 font-mono">
                      <span className="text-slate-500">Path to F:</span>
                      {details.pathAccepting ? (
                        <span className="text-indigo-400">
                          {details.pathAccepting.join(' → ')}
                        </span>
                      ) : (
                        <span className="text-red-500">∅ (No accepting path)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="text-right">
                  {details.isReachable && details.isUseful ? (
                    <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1 md:justify-end">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Retain in Pruned DFA</span>
                    </span>
                  ) : (
                    <span className="text-red-400 font-semibold text-xs flex items-center gap-1 md:justify-end">
                      <Skull className="w-3.5 h-3.5" />
                      <span>Prune (Remove State)</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
