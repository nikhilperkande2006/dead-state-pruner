import React, { useState } from 'react';
import { DFA, DFAAnalysisResult } from '../types/dfa';
import { SAMPLE_DFAS } from '../algorithms/sampleDFAs';
import { TransitionTable } from './TransitionTable';
import { Plus, Trash2, Sparkles, Download, Upload, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DFAInputProps {
  dfa: DFA;
  onChangeDFA: (newDFA: DFA) => void;
  analysis: DFAAnalysisResult | null;
  onAnalyze: () => void;
  onPrune: () => void;
  onOpenJsonModal: () => void;
  isDark?: boolean;
}

export const DFAInput: React.FC<DFAInputProps> = ({
  dfa,
  onChangeDFA,
  analysis,
  onAnalyze,
  onPrune,
  onOpenJsonModal,
  isDark = true,
}) => {
  const [newStateName, setNewStateName] = useState('');
  const [newSymbolName, setNewSymbolName] = useState('');
  const [quickStateCount, setQuickStateCount] = useState<number>(4);

  // Add state
  const handleAddState = (e?: React.FormEvent) => {
    e?.preventDefault();
    const name = newStateName.trim();
    if (!name) return;
    if (dfa.states.includes(name)) return;

    const nextStates = [...dfa.states, name];
    const nextTransitions = { ...dfa.transitions };
    nextTransitions[name] = {};
    for (const sym of dfa.alphabet) {
      nextTransitions[name][sym] = name; // default loop to itself
    }

    const nextDFA: DFA = {
      ...dfa,
      states: nextStates,
      startState: dfa.startState || name,
      transitions: nextTransitions,
    };
    onChangeDFA(nextDFA);
    setNewStateName('');
  };

  // Remove state
  const handleRemoveState = (stateToRemove: string) => {
    if (dfa.states.length <= 1) return;
    const nextStates = dfa.states.filter((s) => s !== stateToRemove);
    const nextFinal = dfa.finalStates.filter((s) => s !== stateToRemove);
    const nextStart = dfa.startState === stateToRemove ? nextStates[0] : dfa.startState;

    const nextTransitions: Record<string, Record<string, string>> = {};
    for (const s of nextStates) {
      nextTransitions[s] = {};
      const oldTrans = dfa.transitions[s] || {};
      for (const sym of dfa.alphabet) {
        const target = oldTrans[sym];
        // If target was removed, default to nextStart or self
        nextTransitions[s][sym] = target === stateToRemove ? s : target || s;
      }
    }

    onChangeDFA({
      states: nextStates,
      alphabet: dfa.alphabet,
      startState: nextStart,
      finalStates: nextFinal,
      transitions: nextTransitions,
    });
  };

  // Add symbol
  const handleAddSymbol = (e?: React.FormEvent) => {
    e?.preventDefault();
    const sym = newSymbolName.trim();
    if (!sym) return;
    if (dfa.alphabet.includes(sym)) return;

    const nextAlphabet = [...dfa.alphabet, sym];
    const nextTransitions: Record<string, Record<string, string>> = {};

    for (const s of dfa.states) {
      nextTransitions[s] = { ...(dfa.transitions[s] || {}) };
      nextTransitions[s][sym] = s; // default loop to self
    }

    onChangeDFA({
      ...dfa,
      alphabet: nextAlphabet,
      transitions: nextTransitions,
    });
    setNewSymbolName('');
  };

  // Remove symbol
  const handleRemoveSymbol = (symbolToRemove: string) => {
    if (dfa.alphabet.length <= 1) return;
    const nextAlphabet = dfa.alphabet.filter((sym) => sym !== symbolToRemove);
    const nextTransitions: Record<string, Record<string, string>> = {};

    for (const s of dfa.states) {
      nextTransitions[s] = {};
      const oldTrans = dfa.transitions[s] || {};
      for (const sym of nextAlphabet) {
        if (oldTrans[sym]) {
          nextTransitions[s][sym] = oldTrans[sym];
        }
      }
    }

    onChangeDFA({
      ...dfa,
      alphabet: nextAlphabet,
      transitions: nextTransitions,
    });
  };

  // Set start state
  const handleSetStart = (st: string) => {
    onChangeDFA({
      ...dfa,
      startState: st,
    });
  };

  // Toggle final state
  const handleToggleFinal = (st: string) => {
    const isFinal = dfa.finalStates.includes(st);
    const nextFinal = isFinal
      ? dfa.finalStates.filter((s) => s !== st)
      : [...dfa.finalStates, st];

    onChangeDFA({
      ...dfa,
      finalStates: nextFinal,
    });
  };

  // Update a single transition delta(s, sym) = target
  const handleUpdateTransition = (state: string, symbol: string, targetState: string) => {
    const nextTransitions = {
      ...dfa.transitions,
      [state]: {
        ...(dfa.transitions[state] || {}),
        [symbol]: targetState,
      },
    };

    onChangeDFA({
      ...dfa,
      transitions: nextTransitions,
    });
  };

  // Quick preset loader
  const handleLoadSample = (sampleId: string) => {
    const preset = SAMPLE_DFAS.find((s) => s.id === sampleId);
    if (preset) {
      onChangeDFA(preset.dfa);
    }
  };

  // Quick generator for q0..qN
  const handleQuickGenerate = (count: number) => {
    const states = Array.from({ length: count }, (_, i) => `q${i}`);
    const alphabet = ['0', '1'];
    const startState = 'q0';
    const finalStates = [`q${count - 1}`];
    const transitions: Record<string, Record<string, string>> = {};

    for (let i = 0; i < count; i++) {
      const s = `q${i}`;
      transitions[s] = {
        '0': i + 1 < count ? `q${i + 1}` : s,
        '1': s,
      };
    }

    onChangeDFA({
      states,
      alphabet,
      startState,
      finalStates,
      transitions,
    });
  };

  // Start fresh blank DFA for manual typing
  const handleStartBlankDFA = () => {
    onChangeDFA({
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      startState: 'q0',
      finalStates: ['q1'],
      transitions: {
        'q0': { '0': 'q0', '1': 'q1' },
        'q1': { '0': 'q1', '1': 'q0' },
      },
    });
  };

  const validationErrors = analysis?.validationErrors || [];

  return (
    <div className="space-y-6">
      {/* Action Banner & Presets */}
      <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
        isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleStartBlankDFA}
            className="text-xs px-3 py-1.5 rounded-lg bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 border border-sky-500/40 font-semibold transition-colors flex items-center gap-1.5"
            title="Clear and create a fresh blank 2-state DFA to type your own manually"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Start Blank DFA (Manual)</span>
          </button>

          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-2">
            Presets:
          </span>
          {SAMPLE_DFAS.slice(0, 3).map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleLoadSample(sample.id)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-200 hover:border-sky-500 hover:text-sky-300'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-sky-500 hover:text-sky-600 shadow-sm'
              }`}
              title={sample.description}
            >
              {sample.name}
            </button>
          ))}
          <div className="relative inline-block">
            <select
              onChange={(e) => {
                if (e.target.value) handleLoadSample(e.target.value);
              }}
              defaultValue=""
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-300'
                  : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              <option value="" disabled>More presets...</option>
              {SAMPLE_DFAS.slice(3).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenJsonModal}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              isDark
                ? 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>JSON Import / Export</span>
          </button>
          <button
            type="button"
            onClick={onAnalyze}
            className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyze DFA</span>
          </button>
          <button
            type="button"
            onClick={onPrune}
            className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Prune DFA</span>
          </button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationErrors.length > 0 && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          isDark ? 'border-red-900/50 bg-red-950/20 text-red-300' : 'border-red-200 bg-red-50 text-red-800'
        }`}>
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-semibold text-sm">DFA Validation Notice</div>
            <ul className="list-disc list-inside space-y-0.5">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* State & Alphabet Definition Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State Set Q */}
        <div className={`p-5 rounded-xl border ${
          isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
        } space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                <span>States Set Q</span>
                <span className="text-xs text-slate-500 font-mono">({dfa.states.length} total)</span>
              </h4>
              <p className="text-xs text-slate-400">
                Click a state to toggle accepting status. Select start state below.
              </p>
            </div>
            <form onSubmit={handleAddState} className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="State (e.g. q5)"
                value={newStateName}
                onChange={(e) => setNewStateName(e.target.value)}
                className={`w-28 text-xs px-2.5 py-1.5 rounded-lg border font-mono ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                    : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                type="submit"
                className="p-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors"
                title="Add state"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* State Badges / Interactive Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {dfa.states.map((st) => {
              const isStart = st === dfa.startState;
              const isFinal = dfa.finalStates.includes(st);

              return (
                <div
                  key={st}
                  className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-mono ${
                    isFinal
                      ? isDark
                        ? 'border-indigo-500/50 bg-indigo-950/30 text-indigo-300'
                        : 'border-indigo-300 bg-indigo-50 text-indigo-700'
                      : isDark
                      ? 'border-slate-700 bg-slate-800/80 text-slate-200'
                      : 'border-slate-200 bg-slate-100 text-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleFinal(st)}
                    className="font-bold flex items-center gap-1 hover:underline"
                    title={`Click to toggle accepting state for ${st}`}
                  >
                    {isStart && <span className="text-emerald-400">→</span>}
                    {isFinal && <span className="text-indigo-400">*</span>}
                    <span>{st}</span>
                  </button>

                  {/* Badges */}
                  {isFinal && (
                    <span className="text-[10px] font-sans px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                      final
                    </span>
                  )}
                  {isStart && (
                    <span className="text-[10px] font-sans px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                      start
                    </span>
                  )}

                  {/* Delete button */}
                  {dfa.states.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveState(st)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-slate-500 transition-opacity"
                      title={`Remove state ${st}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Start State & Final State Selectors */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-800/60">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Start State (q₀):</label>
              <select
                value={dfa.startState}
                onChange={(e) => handleSetStart(e.target.value)}
                className={`w-full py-1.5 px-2.5 rounded-lg border font-mono text-xs ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-100'
                    : 'border-slate-300 bg-white text-slate-900'
                }`}
              >
                {dfa.states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Accepting States (F):</label>
              <div className="text-xs font-mono text-indigo-400 py-1.5 truncate">
                {dfa.finalStates.length > 0 ? `{ ${dfa.finalStates.join(', ')} }` : '∅ (none)'}
              </div>
            </div>
          </div>
        </div>

        {/* Alphabet Set Σ */}
        <div className={`p-5 rounded-xl border ${
          isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
        } space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                <span>Alphabet Σ</span>
                <span className="text-xs text-slate-500 font-mono">({dfa.alphabet.length} symbols)</span>
              </h4>
              <p className="text-xs text-slate-400">
                Input characters accepted by this automaton.
              </p>
            </div>
            <form onSubmit={handleAddSymbol} className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Symbol (e.g. 0)"
                maxLength={2}
                value={newSymbolName}
                onChange={(e) => setNewSymbolName(e.target.value)}
                className={`w-24 text-xs px-2.5 py-1.5 rounded-lg border font-mono text-center ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500'
                    : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                type="submit"
                className="p-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors"
                title="Add alphabet symbol"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Alphabet Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {dfa.alphabet.map((sym) => (
              <div
                key={sym}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                  isDark
                    ? 'border-sky-500/30 bg-sky-950/20 text-sky-300'
                    : 'border-sky-200 bg-sky-50 text-sky-800'
                }`}
              >
                <span>'{sym}'</span>
                {dfa.alphabet.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSymbol(sym)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-slate-400 transition-opacity"
                    title={`Remove symbol ${sym}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Quick preset generator */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>Quick Setup:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickGenerate(3)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              >
                3 States (0,1)
              </button>
              <button
                type="button"
                onClick={() => handleQuickGenerate(4)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              >
                4 States (0,1)
              </button>
              <button
                type="button"
                onClick={() => handleQuickGenerate(5)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              >
                5 States (0,1)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transition Table Matrix */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-sm text-slate-100">
              Transition Function δ : Q × Σ → Q
            </h4>
            <p className="text-xs text-slate-400">
              Every cell specifies δ(state, symbol). Changes update the graph and analysis automatically.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Deterministic rule: Exactly 1 transition per (q, symbol)
          </div>
        </div>

        <TransitionTable
          dfa={dfa}
          analysis={analysis}
          isEditable={true}
          onUpdateTransition={handleUpdateTransition}
          isDark={isDark}
        />
      </div>
    </div>
  );
};
