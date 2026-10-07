import React from 'react';
import { BookOpen, Cpu, CheckCircle2, Shield, GitBranch, Terminal } from 'lucide-react';

interface HelpProps {
  isDark?: boolean;
}

export const Help: React.FC<HelpProps> = ({ isDark = true }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl border ${
        isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
      } space-y-2`}>
        <div className="flex items-center gap-2 text-sky-400">
          <BookOpen className="w-5 h-5" />
          <h3 className="font-bold text-lg text-slate-100">
            Educational Guide &amp; Theoretical Foundations
          </h3>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl">
          Designed for college PBL demonstrations in Formal Languages &amp; Automata Theory (FLAT).
          Learn the foundational definitions, theorems, and algorithmic complexity behind state pruning.
        </p>
      </div>

      {/* Core Definitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DFA Definition */}
        <div className={`p-5 rounded-xl border ${
          isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'
        } space-y-2`}>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-sky-500/20 text-sky-400 flex items-center justify-center font-mono font-bold text-xs">
              M
            </span>
            <h4 className="font-semibold text-sm text-slate-100">Deterministic Finite Automaton (DFA)</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A 5-tuple <code className="font-mono text-sky-300">M = (Q, Σ, δ, q₀, F)</code> where:
          </p>
          <ul className="text-xs text-slate-400 space-y-1 font-mono list-disc list-inside">
            <li><span className="text-slate-200">Q</span>: Finite non-empty set of states</li>
            <li><span className="text-slate-200">Σ</span>: Finite alphabet of input symbols</li>
            <li><span className="text-slate-200">δ</span>: Transition function Q × Σ → Q</li>
            <li><span className="text-slate-200">q₀</span>: Initial / start state (q₀ ∈ Q)</li>
            <li><span className="text-slate-200">F</span>: Set of accepting / final states (F ⊆ Q)</li>
          </ul>
        </div>

        {/* Reachable vs Unreachable */}
        <div className={`p-5 rounded-xl border ${
          isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'
        } space-y-2`}>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
              R
            </span>
            <h4 className="font-semibold text-sm text-slate-100">Reachable vs. Unreachable States</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A state <code className="font-mono text-emerald-300">q</code> is <strong>reachable</strong> if there exists some input string <code className="font-mono text-emerald-300">w ∈ Σ*</code> such that <code className="font-mono text-emerald-300">δ̂(q₀, w) = q</code>.
          </p>
          <p className="text-xs text-amber-300 leading-relaxed">
            An <strong>unreachable state</strong> can never be entered during any computation starting from <code className="font-mono">q₀</code>. Removing it can never change the language.
          </p>
        </div>

        {/* Useful States */}
        <div className={`p-5 rounded-xl border ${
          isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'
        } space-y-2`}>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
              U
            </span>
            <h4 className="font-semibold text-sm text-slate-100">Useful (Live / Productive) States</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A state <code className="font-mono text-indigo-300">q</code> is <strong>useful</strong> if there exists some suffix string <code className="font-mono text-indigo-300">x ∈ Σ*</code> such that <code className="font-mono text-indigo-300">δ̂(q, x) ∈ F</code>.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Found via multi-source reverse graph exploration starting from all final states <code className="font-mono">F</code>. All final states are trivially useful with <code className="font-mono">x = ε</code>.
          </p>
        </div>

        {/* Dead vs Trap States */}
        <div className={`p-5 rounded-xl border ${
          isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'
        } space-y-2`}>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-red-500/20 text-red-400 flex items-center justify-center font-mono font-bold text-xs">
              D
            </span>
            <h4 className="font-semibold text-sm text-slate-100">Dead States vs. Trap States</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-red-400">Dead State:</strong> Reachable from start, but cannot reach any accepting state (<code className="font-mono text-red-300">D = Reachable - Useful</code>).
          </p>
          <p className="text-xs text-pink-300 leading-relaxed">
            <strong className="text-pink-400">Trap State:</strong> A closed sink or strongly connected component from which escape toward acceptance is impossible (<code className="font-mono">δ(q, a) = q</code> or sink SCC).
          </p>
        </div>
      </div>

      {/* Algorithm Complexity Section as mandated by Section 11 */}
      <div className={`p-6 rounded-xl border ${
        isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
      } space-y-4`}>
        <div className="flex items-center gap-2 text-emerald-400">
          <Cpu className="w-5 h-5" />
          <h3 className="font-bold text-base text-slate-100">
            Algorithm Complexity Analysis
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border ${
            isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50'
          } space-y-1.5`}>
            <div className="text-xs text-slate-400 font-medium">1. Reachability Algorithm</div>
            <div className="text-base font-bold font-mono text-sky-400">O(|Q| + |δ|)</div>
            <p className="text-[11px] text-slate-400">
              Standard Breadth-First Search (BFS) starting from <code className="font-mono text-sky-300">q₀</code>.
              Visits every reachable state and explores each outgoing transition once.
            </p>
          </div>

          <div className={`p-4 rounded-lg border ${
            isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50'
          } space-y-1.5`}>
            <div className="text-xs text-slate-400 font-medium">2. Useful-State Analysis</div>
            <div className="text-base font-bold font-mono text-indigo-400">O(|Q| + |δ|)</div>
            <p className="text-[11px] text-slate-400">
              Multi-source reverse BFS traversing the inverted adjacency graph <code className="font-mono text-indigo-300">δ⁻¹</code> starting backwards from <code className="font-mono text-indigo-300">F</code>.
            </p>
          </div>

          <div className={`p-4 rounded-lg border ${
            isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50'
          } space-y-1.5`}>
            <div className="text-xs text-slate-400 font-medium">3. Overall Pruning Pipeline</div>
            <div className="text-base font-bold font-mono text-emerald-400">O(|Q| + |δ|)</div>
            <p className="text-[11px] text-slate-400">
              Intersection filtering <code className="font-mono text-emerald-300">Q_pruned = Reachable ∩ Useful</code> and table reconstruction runs in linear time with respect to graph size.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div>Definitions:</div>
          <div>|Q| = Number of states in the automaton</div>
          <div>|δ| = |Q| × |Σ| = Number of transitions in the transition table</div>
        </div>
      </div>

      {/* Pseudo-Code Section */}
      <div className={`p-5 rounded-xl border ${
        isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
      } space-y-3`}>
        <div className="flex items-center gap-2 text-slate-300">
          <Terminal className="w-4 h-4 text-sky-400" />
          <h4 className="font-semibold text-sm">Reachability Algorithm Pseudo-Code</h4>
        </div>

        <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
{`reachable = empty set
queue = [start state]

while queue is not empty:
    current = remove from queue

    if current is already visited:
        continue

    add current to reachable

    for every input symbol in Σ:
        next = transition(current, symbol)

        if next exists and next not in reachable:
            add next to queue

unreachable = allStates - reachable`}
        </pre>
      </div>
    </div>
  );
};
