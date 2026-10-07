import { DFA, SimulationResult, SimulationStep, BatchTestResult } from '../types/dfa';

/**
 * Simulates an input string on a DFA step-by-step.
 * For the pruned DFA, any omitted transition (which previously led to a dead/trap state)
 * acts as an immediate dead-end transition resulting in REJECT.
 */
export function simulateString(dfa: DFA, inputString: string): SimulationResult {
  const cleanInput = inputString.trim();
  const chars = cleanInput === 'ε' || cleanInput === '' ? [] : cleanInput.split('');

  if (!dfa.startState || !dfa.states.includes(dfa.startState)) {
    return {
      input: cleanInput || 'ε',
      accepted: false,
      endState: null,
      path: [],
      statusMessage: 'Invalid start state.',
    };
  }

  let currentState = dfa.startState;
  const path: SimulationStep[] = [
    {
      step: 0,
      currentState,
      symbolRead: null,
      nextState: null,
      remainingInput: chars.join('') || 'ε',
    },
  ];

  for (let i = 0; i < chars.length; i++) {
    const symbol = chars[i];
    const remaining = chars.slice(i + 1).join('') || 'ε';
    const stateTransitions = dfa.transitions[currentState] || {};
    const nextState = stateTransitions[symbol];

    if (!nextState || !dfa.states.includes(nextState)) {
      // Transition does not exist (in pruned DFA, transitions into dead states were pruned)
      path.push({
        step: i + 1,
        currentState,
        symbolRead: symbol,
        nextState: null,
        remainingInput: remaining,
        isMissingTransition: true,
      });

      return {
        input: cleanInput || 'ε',
        accepted: false,
        endState: null,
        path,
        failedAtStep: i + 1,
        statusMessage: `No transition on symbol '${symbol}' from state ${currentState}. Transition pruned as it led to a dead state (cannot reach accepting state). Rejected!`,
      };
    }

    path.push({
      step: i + 1,
      currentState,
      symbolRead: symbol,
      nextState,
      remainingInput: remaining,
    });

    currentState = nextState;
  }

  const isAccepted = dfa.finalStates.includes(currentState);

  return {
    input: cleanInput || 'ε',
    accepted: isAccepted,
    endState: currentState,
    path,
    statusMessage: isAccepted
      ? `Ended in final state ${currentState}. String ACCEPTED.`
      : `Ended in non-final state ${currentState}. String REJECTED.`,
  };
}

/**
 * Generates test strings over the DFA alphabet up to given maximum length,
 * plus epsilon (ε).
 */
export function generateTestStrings(alphabet: string[], maxLength: number = 3): string[] {
  const result: string[] = ['ε'];
  const validAlphabet = alphabet.filter((s) => s.trim().length > 0);
  if (validAlphabet.length === 0) return result;

  let currentLevel: string[] = [''];

  for (let len = 1; len <= maxLength; len++) {
    const nextLevel: string[] = [];
    for (const prefix of currentLevel) {
      for (const sym of validAlphabet) {
        const str = prefix + sym;
        nextLevel.push(str);
        result.push(str);
      }
    }
    currentLevel = nextLevel;
  }

  return result;
}

/**
 * Runs batch empirical verification comparing Original DFA vs Pruned DFA across strings.
 */
export function runBatchVerification(
  originalDFA: DFA,
  prunedDFA: DFA,
  customStrings?: string[]
): BatchTestResult[] {
  const stringsToTest =
    customStrings && customStrings.length > 0
      ? customStrings
      : generateTestStrings(originalDFA.alphabet, 3);

  return stringsToTest.map((testStr) => {
    const resOrig = simulateString(originalDFA, testStr);
    const resPruned = simulateString(prunedDFA, testStr);

    return {
      string: testStr,
      originalAccepted: resOrig.accepted,
      prunedAccepted: resPruned.accepted,
      matches: resOrig.accepted === resPruned.accepted,
    };
  });
}
