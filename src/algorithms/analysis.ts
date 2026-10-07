import { DFA, DFAAnalysisResult } from '../types/dfa';
import { computeReachability } from './reachability';
import { computeUsefulStates } from './usefulStates';
import { computeDeadStates } from './deadStates';
import { computeTrapStates } from './trapStates';

/**
 * Validates a DFA and runs reachability, usefulness, dead-state, and trap-state analysis.
 */
export function analyzeDFA(dfa: DFA): DFAAnalysisResult {
  const errors: string[] = [];

  // Validation
  if (!dfa.states || dfa.states.length === 0) {
    errors.push('State set Q cannot be empty.');
  }

  const uniqueStates = new Set(dfa.states);
  if (uniqueStates.size !== dfa.states.length) {
    errors.push('State set Q contains duplicate state names.');
  }

  if (!dfa.alphabet || dfa.alphabet.length === 0) {
    errors.push('Alphabet Σ cannot be empty.');
  }

  const uniqueAlphabet = new Set(dfa.alphabet);
  if (uniqueAlphabet.size !== dfa.alphabet.length) {
    errors.push('Alphabet Σ contains duplicate symbols.');
  }

  if (!dfa.startState) {
    errors.push('Start state q₀ is not defined.');
  } else if (!uniqueStates.has(dfa.startState)) {
    errors.push(`Start state "${dfa.startState}" is not in the set of states Q.`);
  }

  if (dfa.finalStates) {
    for (const f of dfa.finalStates) {
      if (!uniqueStates.has(f)) {
        errors.push(`Final state "${f}" is not in the set of states Q.`);
      }
    }
  }

  // Check transitions
  for (const s of dfa.states) {
    const sTransitions = dfa.transitions[s] || {};
    for (const sym of dfa.alphabet) {
      const dest = sTransitions[sym];
      if (dest === undefined || dest === null || dest === '') {
        errors.push(`Missing transition for δ(${s}, ${sym}). Every state × symbol must be defined in a DFA.`);
      } else if (!uniqueStates.has(dest)) {
        errors.push(`Invalid transition: δ(${s}, ${sym}) → "${dest}", but "${dest}" is not in state set Q.`);
      }
    }
  }

  const isValid = errors.length === 0;

  // Run graph algorithms
  const reachResult = computeReachability(dfa);
  const usefulResult = computeUsefulStates(dfa);
  const deadStates = computeDeadStates(reachResult.reachable, usefulResult.useful);
  const trapResult = computeTrapStates(dfa, usefulResult.useful);

  const stateDetails: DFAAnalysisResult['stateDetails'] = {};

  for (const s of dfa.states) {
    const isStart = s === dfa.startState;
    const isFinal = dfa.finalStates.includes(s);
    const isReachable = reachResult.reachable.includes(s);
    const isUseful = usefulResult.useful.includes(s);
    const isDead = deadStates.includes(s);
    const isTrap = trapResult.trapStates.includes(s);

    const tags: string[] = [];
    if (isStart) tags.push('Start');
    if (isFinal) tags.push('Accepting (Final)');
    if (isReachable) tags.push('Reachable');
    else tags.push('Unreachable');

    if (isUseful) tags.push('Useful');
    else tags.push('Not Useful');

    if (isDead) tags.push('Dead State');
    if (isTrap) tags.push('Trap State');

    stateDetails[s] = {
      isStart,
      isFinal,
      isReachable,
      isUseful,
      isDead,
      isTrap,
      reachPathFromStart: reachResult.paths[s]?.states || null,
      pathAccepting: usefulResult.pathsToAccepting[s]?.states || null,
      tags,
    };
  }

  return {
    allStates: [...dfa.states],
    reachableStates: reachResult.reachable,
    unreachableStates: reachResult.unreachable,
    usefulStates: usefulResult.useful,
    deadStates,
    trapStates: trapResult.trapStates,
    trapComponents: trapResult.trapComponents,
    stateDetails,
    isValid,
    validationErrors: errors,
  };
}
