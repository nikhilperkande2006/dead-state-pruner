import React from 'react';
import { DFA, DFAAnalysisResult, PrunedDFAResult } from '../types/dfa';
import { DFAGraph } from './DFAGraph';
import { TransitionTable } from './TransitionTable';
import { Download, Minimize2, CheckCircle2, ArrowRight } from 'lucide-react';

interface ComparisonViewProps {
  originalDFA: DFA;
  originalAnalysis: DFAAnalysisResult | null;
  prunedResult: PrunedDFAResult | null;
  onPrune: () => void;
  onExportOriginalJSON: () => void;
  onExportPrunedJSON: () => void;
  isDark?: boolean;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  originalDFA,
  originalAnalysis,
  prunedResult,
  onPrune,
  onExportOriginalJSON,
  onExportPrunedJSON,
  isDark = true,
}) => {
  if (!prunedResult) {
    return (
      <div className={`p-8 text-center rounded-xl border ${
        isDark ? 'border-slate-800 bg-slate-900/40 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
      } space-y-3`}>
        <Minimize2 className="w-8 h-8 text-emerald-400 mx-auto" />
        <h3 className="font-semibold text-base text-slate-200">Pruning Has Not Yet Been Generated</h3>
        <p className="text-xs max-w-md mx-auto text-slate-400">
          Run the pruning algorithm to eliminate unreachable and dead states and see side-by-side comparison graphs.
        </p>
        <button
          type="button"
          onClick={onPrune}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors inline-flex items-center gap-2"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Prune DFA Now</span>
        </button>
      </div>
    );
  }

  const { prunedDFA } = prunedResult;

  return (
    <div className="space-y-6">
      {/* Reduction Metric Header */}
      <div className={`p-5 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
        isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="space-y-1">
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <span>Automaton State Reduction Summary</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Language Invariant
            </span>
          </h3>
          <div className="text-xs font-mono text-slate-300 space-x-3">
            <span>Original DFA: <strong className="text-white">{prunedResult.statesCountBefore}</strong> states</span>
            <span>·</span>
            <span>Pruned DFA: <strong className="text-emerald-400">{prunedResult.statesCountAfter}</strong> states</span>
            <span>·</span>
            <span>States removed: <strong className="text-red-400">{prunedResult.removedStates.length}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportOriginalJSON}
            className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Original JSON</span>
          </button>
          <button
            type="button"
            onClick={onExportPrunedJSON}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Export Pruned JSON</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Graph Comparison */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm text-slate-200">
              Original DFA ({originalDFA.states.length} states)
            </h4>
            <span className="text-[11px] text-slate-500">Unpruned Automaton</span>
          </div>
          <DFAGraph
            dfa={originalDFA}
            analysis={originalAnalysis}
            title="Original DFA"
            isPruned={false}
            height="380px"
            isDark={isDark}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm text-emerald-400">
              Pruned DFA ({prunedDFA.states.length} states)
            </h4>
            <span className="text-[11px] text-emerald-500/80 font-mono">
              -{prunedResult.removedStates.length} states eliminated
            </span>
          </div>
          <DFAGraph
            dfa={prunedDFA}
            title="Pruned DFA (Optimized)"
            isPruned={true}
            height="380px"
            isDark={isDark}
          />
        </div>
      </div>

      {/* Required Comparison Table */}
      <div className={`p-5 rounded-xl border ${
        isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
      } space-y-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-sm text-slate-100">
              Structural &amp; Complexity Property Comparison
            </h4>
            <p className="text-xs text-slate-400">
              Formal comparison table demonstrating exact state reduction
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b text-xs font-semibold ${
                isDark ? 'border-slate-800 bg-slate-800/60 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4 font-mono">Original DFA</th>
                <th className="py-3 px-4 font-mono text-emerald-400">Pruned DFA</th>
                <th className="py-3 px-4 text-right">Reduction / Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              <tr>
                <td className="py-2.5 px-4 font-medium text-slate-300">States (|Q|)</td>
                <td className="py-2.5 px-4 font-mono font-bold">{prunedResult.statesCountBefore}</td>
                <td className="py-2.5 px-4 font-mono font-bold text-emerald-400">{prunedResult.statesCountAfter}</td>
                <td className="py-2.5 px-4 text-right font-mono text-red-400">
                  -{prunedResult.removedStates.length} states
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-slate-300">Transitions (|δ|)</td>
                <td className="py-2.5 px-4 font-mono">{prunedResult.transitionsCountBefore}</td>
                <td className="py-2.5 px-4 font-mono text-emerald-400">{prunedResult.transitionsCountAfter}</td>
                <td className="py-2.5 px-4 text-right font-mono text-red-400">
                  -{prunedResult.removedTransitionsCount} transitions
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-slate-300">Final / Accepting States (|F|)</td>
                <td className="py-2.5 px-4 font-mono">{originalDFA.finalStates.length} ({originalDFA.finalStates.join(', ') || '∅'})</td>
                <td className="py-2.5 px-4 font-mono text-emerald-400">{prunedDFA.finalStates.length} ({prunedDFA.finalStates.join(', ') || '∅'})</td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-400">Preserved valid</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-slate-300">Unreachable States</td>
                <td className="py-2.5 px-4 font-mono text-amber-400">
                  {originalAnalysis ? originalAnalysis.unreachableStates.length : 0} ({originalAnalysis?.unreachableStates.join(', ') || 'none'})
                </td>
                <td className="py-2.5 px-4 font-mono font-bold text-emerald-400">0</td>
                <td className="py-2.5 px-4 text-right font-mono text-emerald-400">100% eliminated</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-slate-300">Dead States</td>
                <td className="py-2.5 px-4 font-mono text-red-400">
                  {originalAnalysis ? originalAnalysis.deadStates.length : 0} ({originalAnalysis?.deadStates.join(', ') || 'none'})
                </td>
                <td className="py-2.5 px-4 font-mono font-bold text-emerald-400">0</td>
                <td className="py-2.5 px-4 text-right font-mono text-emerald-400">100% eliminated</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-slate-300">Trap States</td>
                <td className="py-2.5 px-4 font-mono text-pink-400">
                  {originalAnalysis ? originalAnalysis.trapStates.length : 0} ({originalAnalysis?.trapStates.join(', ') || 'none'})
                </td>
                <td className="py-2.5 px-4 font-mono font-bold text-emerald-400">0</td>
                <td className="py-2.5 px-4 text-right font-mono text-emerald-400">100% eliminated</td>
              </tr>
              <tr className="bg-emerald-950/20">
                <td className="py-3 px-4 font-bold text-slate-200">Language Acceptance Equivalence</td>
                <td className="py-3 px-4 font-mono text-xs font-semibold text-sky-400">L(M_orig)</td>
                <td className="py-3 px-4 font-mono text-xs font-semibold text-emerald-400">L(M_pruned)</td>
                <td className="py-3 px-4 text-right font-semibold text-emerald-400 text-xs">
                  L(M_orig) ≡ L(M_pruned)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pruned DFA Transition Table */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-slate-100">
          Pruned Transition Function Table
        </h4>
        <TransitionTable
          dfa={prunedDFA}
          isEditable={false}
          isDark={isDark}
        />
      </div>
    </div>
  );
};
