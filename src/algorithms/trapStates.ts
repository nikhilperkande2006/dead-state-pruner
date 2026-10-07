import { DFA } from '../types/dfa';

export interface TrapAnalysisResult {
  trapStates: string[];
  trapComponents: string[][];
  singleStateTraps: string[];
  multiStateTraps: string[][];
  details: Record<string, {
    isSingleTrap: boolean;
    isInTrapComponent: boolean;
    componentMembers: string[];
  }>;
}

/**
 * Identifies Trap States in a DFA.
 * A trap state is a state or group of states from which the automaton cannot escape
 * toward acceptance:
 * 1. Single-state trap: delta(q, a) = q for all symbols a in Sigma, and q is not accepting.
 * 2. Multi-state trap SCC: A strongly connected component C where C contains no accepting
 *    states, and for all u in C, all outgoing transitions lead back into C (no escape).
 */
export function computeTrapStates(
  dfa: DFA,
  usefulStates: string[]
): TrapAnalysisResult {
  const usefulSet = new Set(usefulStates);
  const trapStatesSet = new Set<string>();
  const singleStateTraps: string[] = [];
  const multiStateTraps: string[][] = [];
  const trapComponents: string[][] = [];
  const details: TrapAnalysisResult['details'] = {};

  // Initialize details
  for (const s of dfa.states) {
    details[s] = {
      isSingleTrap: false,
      isInTrapComponent: false,
      componentMembers: [],
    };
  }

  // 1. Check for single-state traps
  for (const s of dfa.states) {
    if (usefulSet.has(s)) continue; // Can reach an accepting state, cannot be a trap

    const transitions = dfa.transitions[s] || {};
    const symbols = dfa.alphabet;
    let allLoopToSelf = true;

    for (const sym of symbols) {
      const next = transitions[sym];
      if (next !== s) {
        allLoopToSelf = false;
        break;
      }
    }

    if (allLoopToSelf && symbols.length > 0) {
      singleStateTraps.push(s);
      trapStatesSet.add(s);
      trapComponents.push([s]);
      details[s].isSingleTrap = true;
      details[s].isInTrapComponent = true;
      details[s].componentMembers = [s];
    }
  }

  // 2. Tarjan's algorithm for Strongly Connected Components (SCC)
  // to detect multi-state trap cycles (e.g., qA -> qB and qB -> qA with no exit)
  let index = 0;
  const indices: Record<string, number> = {};
  const lowlinks: Record<string, number> = {};
  const onStack: Record<string, boolean> = {};
  const stack: string[] = [];
  const allSCCs: string[][] = [];

  function strongConnect(u: string) {
    indices[u] = index;
    lowlinks[u] = index;
    index++;
    stack.push(u);
    onStack[u] = true;

    const uTransitions = dfa.transitions[u] || {};
    for (const sym of dfa.alphabet) {
      const v = uTransitions[sym];
      if (v && dfa.states.includes(v)) {
        if (indices[v] === undefined) {
          strongConnect(v);
          lowlinks[u] = Math.min(lowlinks[u], lowlinks[v]);
        } else if (onStack[v]) {
          lowlinks[u] = Math.min(lowlinks[u], indices[v]);
        }
      }
    }

    if (lowlinks[u] === indices[u]) {
      const scc: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack[w] = false;
        scc.push(w);
      } while (w !== u);
      allSCCs.push(scc);
    }
  }

  for (const s of dfa.states) {
    if (indices[s] === undefined) {
      strongConnect(s);
    }
  }

  // Check each SCC to see if it is a sink SCC that cannot reach any accepting state
  for (const scc of allSCCs) {
    // Already checked single-state traps
    if (scc.length === 1 && details[scc[0]].isSingleTrap) {
      continue;
    }

    // Check if any state in SCC is useful (can reach an accepting state)
    const hasUseful = scc.some((s) => usefulSet.has(s));
    if (hasUseful) continue;

    // Check if SCC is closed / sink (no transition leaves the SCC)
    const sccSet = new Set(scc);
    let isSinkSCC = true;

    for (const u of scc) {
      const uTransitions = dfa.transitions[u] || {};
      for (const sym of dfa.alphabet) {
        const v = uTransitions[sym];
        if (v && !sccSet.has(v)) {
          isSinkSCC = false;
          break;
        }
      }
      if (!isSinkSCC) break;
    }

    // If it's closed and multi-state (or single state with self-transitions)
    if (isSinkSCC && scc.length > 1) {
      multiStateTraps.push(scc);
      trapComponents.push(scc);
      for (const member of scc) {
        trapStatesSet.add(member);
        details[member].isInTrapComponent = true;
        details[member].componentMembers = scc;
      }
    }
  }

  return {
    trapStates: Array.from(trapStatesSet),
    trapComponents,
    singleStateTraps,
    multiStateTraps,
    details,
  };
}
