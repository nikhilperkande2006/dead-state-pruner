import { DFA } from '../types/dfa';

export interface UsefulStatesResult {
  useful: string[];
  notUseful: string[];
  /** Path/witness from state to an accepting state */
  pathsToAccepting: Record<string, { states: string[]; symbols: string[] }>;
}

/**
 * Computes useful states (states that can reach at least one final state)
 * using Reverse Graph Traversal (multi-source BFS from all final states).
 * Time Complexity: O(|Q| + |δ|)
 */
export function computeUsefulStates(dfa: DFA): UsefulStatesResult {
  const usefulSet = new Set<string>();
  const pathsToAccepting: Record<string, { states: string[]; symbols: string[] }> = {};

  // Build reverse adjacency: reverseTransitions[targetState] = list of { sourceState, symbol }
  const reverseAdj: Record<string, Array<{ from: string; symbol: string }>> = {};
  for (const s of dfa.states) {
    reverseAdj[s] = [];
  }

  for (const u of dfa.states) {
    const uTransitions = dfa.transitions[u] || {};
    for (const [symbol, v] of Object.entries(uTransitions)) {
      if (dfa.states.includes(v)) {
        if (!reverseAdj[v]) reverseAdj[v] = [];
        reverseAdj[v].push({ from: u, symbol });
      }
    }
  }

  // Queue initialized with all valid final states
  const validFinalStates = dfa.finalStates.filter((f) => dfa.states.includes(f));
  const queue: string[] = [];

  for (const f of validFinalStates) {
    usefulSet.add(f);
    queue.push(f);
    pathsToAccepting[f] = { states: [f], symbols: [] };
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const incoming = reverseAdj[current] || [];

    for (const { from, symbol } of incoming) {
      if (!usefulSet.has(from)) {
        usefulSet.add(from);
        const currentPath = pathsToAccepting[current];
        pathsToAccepting[from] = {
          states: [from, ...currentPath.states],
          symbols: [symbol, ...currentPath.symbols],
        };
        queue.push(from);
      }
    }
  }

  const useful = dfa.states.filter((s) => usefulSet.has(s));
  const notUseful = dfa.states.filter((s) => !usefulSet.has(s));

  return {
    useful,
    notUseful,
    pathsToAccepting,
  };
}
