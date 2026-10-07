/**
 * Core type definitions for Deterministic Finite Automaton (DFA)
 * and state analysis results.
 */

export interface DFA {
  states: string[];
  alphabet: string[];
  startState: string;
  finalStates: string[];
  /** transitions[state][symbol] = nextState */
  transitions: Record<string, Record<string, string>>;
}

export type StateClassification = 
  | 'start'
  | 'final'
  | 'start-final'
  | 'useful'
  | 'unreachable'
  | 'dead'
  | 'trap'
  | 'normal';

export interface DFAAnalysisResult {
  allStates: string[];
  reachableStates: string[];
  unreachableStates: string[];
  usefulStates: string[];
  deadStates: string[];
  trapStates: string[];
  /** Strongly Connected Components that form trap clusters */
  trapComponents: string[][];
  /** Detailed reason / classification per state */
  stateDetails: Record<string, {
    isStart: boolean;
    isFinal: boolean;
    isReachable: boolean;
    isUseful: boolean;
    isDead: boolean;
    isTrap: boolean;
    reachPathFromStart: string[] | null;
    pathAccepting: string[] | null;
    tags: string[];
  }>;
  isValid: boolean;
  validationErrors: string[];
}

export interface PrunedDFAResult {
  originalDFA: DFA;
  prunedDFA: DFA;
  removedStates: string[];
  removedTransitionsCount: number;
  unreachableRemoved: string[];
  deadRemoved: string[];
  statesCountBefore: number;
  statesCountAfter: number;
  transitionsCountBefore: number;
  transitionsCountAfter: number;
}

export interface SimulationStep {
  step: number;
  currentState: string;
  symbolRead: string | null;
  nextState: string | null;
  remainingInput: string;
  isMissingTransition?: boolean;
}

export interface SimulationResult {
  input: string;
  accepted: boolean;
  endState: string | null;
  path: SimulationStep[];
  statusMessage: string;
  failedAtStep?: number;
}

export interface BatchTestResult {
  string: string;
  originalAccepted: boolean;
  prunedAccepted: boolean;
  matches: boolean;
}
