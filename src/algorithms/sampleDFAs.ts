import { DFA } from '../types/dfa';

export interface SampleDFAPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  dfa: DFA;
  expectedInsight: string;
}

export const SAMPLE_DFAS: SampleDFAPreset[] = [
  {
    id: 'college_pbl_primary',
    name: 'College PBL Demo (q0–q4)',
    badge: 'Standard PBL Sample',
    description: 'The exact DFA specified in the project prompt with reachable, unreachable (q4), and dead/trap (q2) states.',
    expectedInsight: 'q4 is unreachable; q2 is a dead trap state; q0, q1, q3 are kept. Prunes from 5 states to 3 states.',
    dfa: {
      states: ['q0', 'q1', 'q2', 'q3', 'q4'],
      alphabet: ['0', '1'],
      startState: 'q0',
      finalStates: ['q3'],
      transitions: {
        q0: { '0': 'q1', '1': 'q2' },
        q1: { '0': 'q1', '1': 'q3' },
        q2: { '0': 'q2', '1': 'q2' },
        q3: { '0': 'q3', '1': 'q3' },
        q4: { '0': 'q4', '1': 'q4' },
      },
    },
  },
  {
    id: 'multi_state_trap_scc',
    name: 'Multi-State Trap Cycle (t1 ⇄ t2)',
    badge: 'Trap SCC Component',
    description: 'Features a mutual cycle between t1 and t2 with no exit to any final state, plus an unreachable state u1.',
    expectedInsight: 'Demonstrates that trap states are NOT just single self-loops; t1 and t2 form a trap SCC.',
    dfa: {
      states: ['q0', 'q1', 'q_acc', 't1', 't2', 'u1'],
      alphabet: ['a', 'b'],
      startState: 'q0',
      finalStates: ['q_acc'],
      transitions: {
        q0: { 'a': 'q1', 'b': 't1' },
        q1: { 'a': 'q_acc', 'b': 'q1' },
        q_acc: { 'a': 'q_acc', 'b': 'q_acc' },
        t1: { 'a': 't2', 'b': 't1' },
        t2: { 'a': 't1', 'b': 't2' },
        u1: { 'a': 'u1', 'b': 'q0' },
      },
    },
  },
  {
    id: 'multiple_final_states',
    name: 'Multiple Final States (F = {q1, q3})',
    badge: 'Multi-Accepting',
    description: 'DFA with multiple final states, a transient dead state d1 that enters dead trap d2, and unreachable u0.',
    expectedInsight: 'Reverse reachability originates from all final states; distinguishes transient dead states from trap states.',
    dfa: {
      states: ['q0', 'q1', 'q2', 'q3', 'd1', 'd2', 'u0'],
      alphabet: ['0', '1'],
      startState: 'q0',
      finalStates: ['q1', 'q3'],
      transitions: {
        q0: { '0': 'q1', '1': 'd1' },
        q1: { '0': 'q2', '1': 'q1' },
        q2: { '0': 'q3', '1': 'q2' },
        q3: { '0': 'q1', '1': 'q3' },
        d1: { '0': 'd2', '1': 'd2' },
        d2: { '0': 'd2', '1': 'd2' },
        u0: { '0': 'q0', '1': 'u0' },
      },
    },
  },
  {
    id: 'start_is_final',
    name: 'Start State is Final (Accepts ε)',
    badge: 'Accepts Empty String',
    description: 'q0 is both the start state and an accepting state. Contains unreachable state q_ghost and sink q_dead.',
    expectedInsight: 'Start state q0 must be preserved along with its final status. Accepts ε.',
    dfa: {
      states: ['q0', 'q1', 'q_dead', 'q_ghost'],
      alphabet: ['0', '1'],
      startState: 'q0',
      finalStates: ['q0'],
      transitions: {
        q0: { '0': 'q1', '1': 'q_dead' },
        q1: { '0': 'q0', '1': 'q_dead' },
        q_dead: { '0': 'q_dead', '1': 'q_dead' },
        q_ghost: { '0': 'q0', '1': 'q_dead' },
      },
    },
  },
  {
    id: 'already_minimal',
    name: 'Already Clean DFA (Zero Dead/Unreachable)',
    badge: 'Already Pruned',
    description: 'A canonical DFA accepting strings containing substring "01". All states are reachable and useful.',
    expectedInsight: 'Pruner correctly detects 0 unreachable and 0 dead states; pruned DFA is identical to original.',
    dfa: {
      states: ['q0', 'q1', 'q2'],
      alphabet: ['0', '1'],
      startState: 'q0',
      finalStates: ['q2'],
      transitions: {
        q0: { '0': 'q1', '1': 'q0' },
        q1: { '0': 'q1', '1': 'q2' },
        q2: { '0': 'q2', '1': 'q2' },
      },
    },
  },
  {
    id: 'empty_language_dfa',
    name: 'Empty Language (L = ∅)',
    badge: 'Edge Case',
    description: 'Start state has no path to the final state q_far. All reachable states are dead.',
    expectedInsight: 'Language is completely empty. Start state is retained without accepting transitions.',
    dfa: {
      states: ['q0', 'q_loop', 'q_far'],
      alphabet: ['0', '1'],
      startState: 'q0',
      finalStates: ['q_far'],
      transitions: {
        q0: { '0': 'q_loop', '1': 'q_loop' },
        q_loop: { '0': 'q_loop', '1': 'q_loop' },
        q_far: { '0': 'q_far', '1': 'q_far' },
      },
    },
  },
];
