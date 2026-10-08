import React from 'react';
import { DFA, DFAAnalysisResult, PrunedDFAResult } from '../types/dfa';
import {
  Layers,
  CheckCircle,
  AlertTriangle,
  Skull,
  ShieldAlert,
  Award,
  Minimize2,
  ArrowRight,
  Sparkles,
  Info,
  Download,
} from 'lucide-react';

interface DashboardProps {
  dfa: DFA;
  analysis: DFAAnalysisResult | null;
  prunedResult: PrunedDFAResult | null;
  onAnalyze: () => void;
  onPrune: () => void;
  onLoadSample: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenDownloadModal?: () => void;
  isDark?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  dfa,
  analysis,
  prunedResult,
  onAnalyze,
  onPrune,
  onLoadSample,
  onNavigateTab,
  onOpenDownloadModal,
  isDark = true,
}) => {
  const totalStates = dfa.states.length;
  const reachableCount = analysis ? analysis.reachableStates.length : '—';
  const unreachableCount = analysis ? analysis.unreachableStates.length : '—';
  const usefulCount = analysis ? analysis.usefulStates.length : '—';
  const deadCount = analysis ? analysis.deadStates.length : '—';
  const trapCount = analysis ? analysis.trapStates.length : '—';
  const finalCount = dfa.finalStates.length;
  const prunedStatesCount = prunedResult ? prunedResult.prunedDFA.states.length : '—';

  return (
    <div className="space-y-6">
      {/* Hero / PBL Context Banner */}
      <div className={`p-6 rounded-2xl border relative overflow-hidden ${
        isDark
          ? 'border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-sky-950/40'
          : 'border-slate-200 bg-gradient-to-r from-white via-slate-50 to-sky-50/60'
      }`}>
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
              College PBL Project · Automata Theory
            </span>
            <span className="text-xs text-slate-500">Language-Preserving State Reduction</span>
          </div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            DFA Dead-State &amp; Unreachable-State Pruner
          </h2>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Deterministic Finite Automata frequently accumulate redundant states during regex-to-DFA conversion,
            product construction, or manual design. <strong>Dead-State Pruner</strong> computes reachability from <code className="text-sky-400 font-mono">q₀</code> and
            reverse usefulness from <code className="text-indigo-400 font-mono">F</code> in <code className="text-emerald-400 font-mono">O(|Q| + |δ|)</code> time,
            identifies dead/trap subgraphs, and eliminates them without altering a single accepted string.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('input')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Manual DFA Builder</span>
            </button>
            <button
              type="button"
              onClick={onAnalyze}
              className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-2 ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Analyze DFA</span>
            </button>
            <button
              type="button"
              onClick={onPrune}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition-colors flex items-center gap-2"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Prune DFA ({totalStates} → {prunedStatesCount !== '—' ? prunedStatesCount : '?'})</span>
            </button>
            <button
              type="button"
              onClick={onLoadSample}
              className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition-colors ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Load Sample Presets
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Total States */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
        } space-y-1`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total States</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{totalStates}</div>
          <div className="text-[10px] text-slate-500">|Q| in original DFA</div>
        </div>

        {/* Reachable States */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'border-emerald-900/30 bg-emerald-950/10' : 'border-emerald-200 bg-emerald-50/50'
        } space-y-1`}>
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Reachable</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{reachableCount}</div>
          <div className="text-[10px] text-emerald-500/80">Can be entered from q₀</div>
        </div>

        {/* Unreachable States */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'border-amber-900/30 bg-amber-950/10' : 'border-amber-200 bg-amber-50/50'
        } space-y-1`}>
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Unreachable</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{unreachableCount}</div>
          <div className="text-[10px] text-amber-500/80">Isolated from q₀</div>
        </div>

        {/* Dead States */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'border-red-900/30 bg-red-950/10' : 'border-red-200 bg-red-50/50'
        } space-y-1`}>
          <div className="flex items-center justify-between text-red-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Dead States</span>
            <Skull className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">{deadCount}</div>
          <div className="text-[10px] text-red-500/80">No path to F</div>
        </div>

        {/* Trap States */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'border-pink-900/30 bg-pink-950/10' : 'border-pink-200 bg-pink-50/50'
        } space-y-1`}>
          <div className="flex items-center justify-between text-pink-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Trap States</span>
            <ShieldAlert className="w-3.5 h-3.5 text-pink-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-pink-400">{trapCount}</div>
          <div className="text-[10px] text-pink-500/80">Closed sink / loops</div>
        </div>

        {/* Final States */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'border-indigo-900/30 bg-indigo-950/10' : 'border-indigo-200 bg-indigo-50/50'
        } space-y-1`}>
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Final States</span>
            <Award className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400">{finalCount}</div>
          <div className="text-[10px] text-indigo-500/80">Accepting subset F</div>
        </div>

        {/* Pruned States */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'border-sky-900/30 bg-sky-950/15' : 'border-sky-200 bg-sky-50/60'
        } space-y-1`}>
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Pruned Size</span>
            <Minimize2 className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-400">{prunedStatesCount}</div>
          <div className="text-[10px] text-sky-500/80">
            {prunedResult ? `-${prunedResult.removedStates.length} removed` : 'Awaiting prune'}
          </div>
        </div>
      </div>

      {/* Analysis Highlights Card */}
      {analysis && (
        <div className={`p-5 rounded-xl border ${
          isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
        } space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-400" />
              <span>Automata Reduction Diagnostic</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('analysis')}
              className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>View full analysis details</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className={`p-3.5 rounded-lg border ${
              isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="font-medium text-slate-400 mb-1">Unreachable States</div>
              <div className="font-mono text-amber-400 text-sm font-semibold">
                {analysis.unreachableStates.length > 0
                  ? analysis.unreachableStates.join(', ')
                  : 'None (All states reachable from q₀)'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Disconnected from start state; safe to remove without affecting language.
              </p>
            </div>

            <div className={`p-3.5 rounded-lg border ${
              isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="font-medium text-slate-400 mb-1">Dead States (Reachable - Useful)</div>
              <div className="font-mono text-red-400 text-sm font-semibold">
                {analysis.deadStates.length > 0
                  ? analysis.deadStates.join(', ')
                  : 'None (Every reachable state reaches F)'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Can be reached from q₀, but can never reach any accepting state.
              </p>
            </div>

            <div className={`p-3.5 rounded-lg border ${
              isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="font-medium text-slate-400 mb-1">Pruned Retained States</div>
              <div className="font-mono text-emerald-400 text-sm font-semibold">
                {analysis.reachableStates.filter((s) => analysis.usefulStates.includes(s)).join(', ') || 'q0 (Language ∅)'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Reachable ∩ Useful states that participate in string acceptance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
