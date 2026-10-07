import { DFA, DFAAnalysisResult, PrunedDFAResult } from '../types/dfa';
import { analyzeDFA } from './analysis';

/**
 * Prunes unreachable states and dead states from the DFA.
 * The resulting DFA accepts the EXACT same language as the original.
 */
export function pruneDFA(dfa: DFA, analysis?: DFAAnalysisResult): PrunedDFAResult {
  const currentAnalysis = analysis || analyzeDFA(dfa);

  const unreachableSet = new Set(currentAnalysis.unreachableStates);
  const deadSet = new Set(currentAnalysis.deadStates);

  // States to keep: Must be reachable AND useful
  // Special safety: If language is empty (e.g., no state can reach accepting, so startState is dead),
  // we must retain the start state so the DFA remains well-defined and accepts empty language.
  let keptStates = dfa.states.filter(
    (s) => !unreachableSet.has(s) && !deadSet.has(s)
  );

  if (keptStates.length === 0) {
    // If language is empty, keep startState as a single non-accepting state
    keptStates = [dfa.startState];
  } else if (!keptStates.includes(dfa.startState)) {
    // Start state is always retained
    keptStates.unshift(dfa.startState);
  }

  const keptStatesSet = new Set(keptStates);

  // Filter final states
  const prunedFinalStates = dfa.finalStates.filter((f) => keptStatesSet.has(f));

  // Build pruned transitions: only keep transitions between kept states
  const prunedTransitions: Record<string, Record<string, string>> = {};
  let removedTransitionsCount = 0;
  let transitionsCountBefore = 0;
  let transitionsCountAfter = 0;

  for (const s of dfa.states) {
    const sTransitions = dfa.transitions[s] || {};
    for (const sym of dfa.alphabet) {
      if (sTransitions[sym]) {
        transitionsCountBefore++;
      }
    }
  }

  for (const s of keptStates) {
    prunedTransitions[s] = {};
    const sTransitions = dfa.transitions[s] || {};

    for (const sym of dfa.alphabet) {
      const target = sTransitions[sym];
      if (target && keptStatesSet.has(target)) {
        prunedTransitions[s][sym] = target;
        transitionsCountAfter++;
      }
    }
  }

  removedTransitionsCount = transitionsCountBefore - transitionsCountAfter;

  const removedStates = dfa.states.filter((s) => !keptStatesSet.has(s));
  const unreachableRemoved = dfa.states.filter((s) => unreachableSet.has(s));
  const deadRemoved = dfa.states.filter((s) => deadSet.has(s) && keptStatesSet.has(s) === false);

  const prunedDFA: DFA = {
    states: keptStates,
    alphabet: [...dfa.alphabet],
    startState: dfa.startState,
    finalStates: prunedFinalStates,
    transitions: prunedTransitions,
  };

  return {
    originalDFA: dfa,
    prunedDFA,
    removedStates,
    removedTransitionsCount,
    unreachableRemoved,
    deadRemoved,
    statesCountBefore: dfa.states.length,
    statesCountAfter: keptStates.length,
    transitionsCountBefore,
    transitionsCountAfter,
  };
}
