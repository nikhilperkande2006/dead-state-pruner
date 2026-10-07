import React, { useState } from 'react';
import { DFA, PrunedDFAResult, SimulationResult } from '../types/dfa';
import { simulateString, runBatchVerification } from '../algorithms/simulation';
import { CheckCircle2, XCircle, Play, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

interface LanguageTesterProps {
  originalDFA: DFA;
  prunedResult: PrunedDFAResult | null;
  onPrune: () => void;
  isDark?: boolean;
}

export const LanguageTester: React.FC<LanguageTesterProps> = ({
  originalDFA,
  prunedResult,
  onPrune,
  isDark = true,
}) => {
  const [customString, setCustomString] = useState('01101');
  const [originalResult, setOriginalResult] = useState<SimulationResult | null>(null);
  const [prunedSimulationResult, setPrunedSimulationResult] = useState<SimulationResult | null>(null);
  const [batchResults, setBatchResults] = useState<ReturnType<typeof runBatchVerification> | null>(null);

  const prunedDFA = prunedResult?.prunedDFA;

  const handleTestOriginal = () => {
    const res = simulateString(originalDFA, customString);
    setOriginalResult(res);
  };

  const handleTestPruned = () => {
    if (!prunedDFA) return;
    const res = simulateString(prunedDFA, customString);
    setPrunedSimulationResult(res);
  };

  const handleTestBoth = () => {
    const resOrig = simulateString(originalDFA, customString);
    setOriginalResult(resOrig);
    if (prunedDFA) {
      const resPruned = simulateString(prunedDFA, customString);
      setPrunedSimulationResult(resPruned);
    }
  };

  const handleRunBatchVerification = () => {
    if (!prunedDFA) return;
    const defaultStrings = [
      'ε',
      '0', '1',
      '00', '01', '10', '11',
      '000', '001', '010', '011', '100', '101', '110', '111',
    ];
    const results = runBatchVerification(originalDFA, prunedDFA, defaultStrings);
    setBatchResults(results);
  };

  return (
    <div className="space-y-6">
      {/* Formal Theoretical Explanation Banner as mandated */}
      <div className={`p-6 rounded-xl border ${
        isDark ? 'border-sky-900/40 bg-sky-950/20' : 'border-sky-200 bg-sky-50/70'
      } space-y-3`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Language Preservation Guarantee
          </span>
          <span className="text-xs text-slate-400 font-mono">L(M_orig) ≡ L(M_pruned)</span>
        </div>
        <blockquote className="text-sm font-medium italic text-slate-200 border-l-2 border-sky-400 pl-3">
          “Unreachable states can never be entered from the start state. Dead states cannot lead to an accepting state. Therefore, removing these states does not remove any accepted string from the DFA.”
        </blockquote>
        <p className="text-xs text-slate-400 leading-relaxed">
          Because every string <code className="text-sky-300 font-mono">w ∈ L(M)</code> follows a path entirely composed of reachable states that terminates in an accepting state (which by definition are useful states), no accepted derivation ever touches unreachable or dead states. Pruning leaves the accepted formal language exactly invariant.
        </p>
      </div>

      {/* String Test Section */}
      <div className={`p-5 rounded-xl border ${
        isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
      } space-y-4`}>
        <div>
          <h4 className="font-semibold text-sm text-slate-100">
            Interactive String Simulation
          </h4>
          <p className="text-xs text-slate-400">
            Simulate any candidate string character-by-character on both the Original and Pruned automata.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              value={customString}
              onChange={(e) => setCustomString(e.target.value)}
              placeholder="Enter string (e.g. 01101 or ε)"
              className={`w-full text-xs font-mono px-3 py-2 rounded-lg border ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                  : 'border-slate-300 bg-white text-slate-900'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={handleTestBoth}
            className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Test Both DFAs</span>
          </button>

          <button
            type="button"
            onClick={handleTestOriginal}
            className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Test Original DFA
          </button>

          <button
            type="button"
            onClick={handleTestPruned}
            disabled={!prunedDFA}
            className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50 ${
              isDark
                ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'
                : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Test Pruned DFA
          </button>

          <button
            type="button"
            onClick={() => setCustomString('ε')}
            className="text-xs px-2.5 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 font-mono"
            title="Set empty string (epsilon)"
          >
            ε (empty)
          </button>
        </div>

        {/* Results Comparison Output (As mandated by user prompt) */}
        {(originalResult || prunedSimulationResult) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Original DFA Verdict */}
            <div className={`p-4 rounded-lg border ${
              isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
            } space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-300">Original DFA Simulation</span>
                {originalResult && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                    originalResult.accepted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {originalResult.accepted ? 'ACCEPTED' : 'REJECTED'}
                  </span>
                )}
              </div>

              {originalResult ? (
                <div className="space-y-2 text-xs">
                  <div className="text-slate-400">{originalResult.statusMessage}</div>
                  <div className="font-mono text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    <div>Input: <span className="text-sky-300">"{originalResult.input}"</span></div>
                    <div>Execution Path:</div>
                    <div className="pt-1 flex flex-wrap items-center gap-1">
                      {originalResult.path.map((step, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-300">
                            {step.currentState}
                          </span>
                          {step.symbolRead && (
                            <span className="text-slate-500 text-[10px]">
                              --{step.symbolRead}→
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">Click "Test Original DFA" to simulate</div>
              )}
            </div>

            {/* Pruned DFA Verdict */}
            <div className={`p-4 rounded-lg border ${
              isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
            } space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-300">Pruned DFA Simulation</span>
                {prunedSimulationResult && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                    prunedSimulationResult.accepted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {prunedSimulationResult.accepted ? 'ACCEPTED' : 'REJECTED'}
                  </span>
                )}
              </div>

              {prunedSimulationResult ? (
                <div className="space-y-2 text-xs">
                  <div className="text-slate-400">{prunedSimulationResult.statusMessage}</div>
                  <div className="font-mono text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    <div>Input: <span className="text-sky-300">"{prunedSimulationResult.input}"</span></div>
                    <div>Execution Path:</div>
                    <div className="pt-1 flex flex-wrap items-center gap-1">
                      {prunedSimulationResult.path.map((step, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-300">
                            {step.currentState}
                          </span>
                          {step.symbolRead && (
                            <span className="text-slate-500 text-[10px]">
                              --{step.symbolRead}→
                            </span>
                          )}
                          {step.isMissingTransition && (
                            <span className="text-red-400 text-[10px] font-bold">
                              [X Trap/Dead]
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  {prunedDFA ? 'Click "Test Pruned DFA" to simulate' : 'Prune DFA first to enable simulation'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Concordance Verdict Display */}
        {originalResult && prunedSimulationResult && (
          <div className={`p-3 rounded-lg border font-mono text-xs flex items-center justify-between ${
            originalResult.accepted === prunedSimulationResult.accepted
              ? 'border-emerald-800/40 bg-emerald-950/20 text-emerald-300'
              : 'border-red-800/40 bg-red-950/20 text-red-300'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Original DFA: <strong>{originalResult.accepted ? 'ACCEPTED' : 'REJECTED'}</strong> · Pruned DFA: <strong>{prunedSimulationResult.accepted ? 'ACCEPTED' : 'REJECTED'}</strong>
              </span>
            </div>
            <div className="font-bold">
              Language result: {originalResult.accepted === prunedSimulationResult.accepted ? 'SAME' : 'DIFFERENT'}
            </div>
          </div>
        )}
      </div>

      {/* Batch Empirical Verification Section */}
      <div className={`p-5 rounded-xl border ${
        isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
      } space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-sm text-slate-100">
              Batch Empirical Verification Suite
            </h4>
            <p className="text-xs text-slate-400">
              Automatically evaluates strings {`{ ε, 0, 1, 00, 01, 10, 11, 000, 001 ... 111 }`} across both automata.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunBatchVerification}
            disabled={!prunedDFA}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run Automated Test Suite (15+ Strings)</span>
          </button>
        </div>

        {/* Empirical Disclaimers Notice */}
        <div className={`p-3 rounded-lg border text-[11px] flex items-start gap-2 ${
          isDark ? 'border-slate-800 bg-slate-800/30 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Empirical Verification Note:</strong> Passing finite test strings empirically verifies behavior on concrete test vectors. The mathematical guarantee of language equivalence is proven rigorously by induction on string length (since unreachable states never enter derivations from q₀, and dead states never enter derivations ending in F).
          </div>
        </div>

        {batchResults && (
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-300 font-mono">
                  <th className="py-2.5 px-3">Test String w</th>
                  <th className="py-2.5 px-3">Original DFA</th>
                  <th className="py-2.5 px-3">Pruned DFA</th>
                  <th className="py-2.5 px-3 text-right">Equivalence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono text-[11px]">
                {batchResults.map((item, idx) => (
                  <tr key={idx} className={item.matches ? 'hover:bg-slate-800/30' : 'bg-red-950/20'}>
                    <td className="py-2 px-3 font-bold text-sky-300">
                      {item.string === 'ε' ? 'ε (epsilon)' : `"${item.string}"`}
                    </td>
                    <td className="py-2 px-3">
                      <span className={item.originalAccepted ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                        {item.originalAccepted ? 'ACCEPTED' : 'REJECTED'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={item.prunedAccepted ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                        {item.prunedAccepted ? 'ACCEPTED' : 'REJECTED'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      {item.matches ? (
                        <span className="text-emerald-400 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>SAME</span>
                        </span>
                      ) : (
                        <span className="text-red-400 font-bold flex items-center justify-end gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>MISMATCH</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
