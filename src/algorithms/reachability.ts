import { DFA } from '../types/dfa';

export interface ReachabilityResult {
  reachable: string[];
  unreachable: string[];
  /** Path/witness from start state for each reachable state */
  paths: Record<string, { states: string[]; symbols: string[] }>;
}

/**
 * Computes reachable and unreachable states using Breadth-First Search (BFS)
 * starting from the start state q0.
 * Time Complexity: O(|Q| + |δ|)
 */
export function computeReachability(dfa: DFA): ReachabilityResult {
  const reachableSet = new Set<string>();
  const paths: Record<string, { states: string[]; symbols: string[] }> = {};

  if (!dfa.startState || !dfa.states.includes(dfa.startState)) {
    return {
      reachable: [],
      unreachable: [...dfa.states],
      paths: {},
    };
  }

  const queue: string[] = [dfa.startState];
  reachableSet.add(dfa.startState);
  paths[dfa.startState] = { states: [dfa.startState], symbols: [] };

  while (queue.length > 0) {
    const current = queue.shift()!;
    const stateTransitions = dfa.transitions[current] || {};

    for (const symbol of dfa.alphabet) {
      const next = stateTransitions[symbol];
      if (next && dfa.states.includes(next)) {
        if (!reachableSet.has(next)) {
          reachableSet.add(next);
          const currentPath = paths[current];
          paths[next] = {
            states: [...currentPath.states, next],
            symbols: [...currentPath.symbols, symbol],
          };
          queue.push(next);
        }
      }
    }
  }

  const reachable = dfa.states.filter((s) => reachableSet.has(s));
  const unreachable = dfa.states.filter((s) => !reachableSet.has(s));

  return {
    reachable,
    unreachable,
    paths,
  };
}
