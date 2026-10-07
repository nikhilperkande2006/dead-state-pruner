# Dead-State Pruner
**DFA Optimization & Language-Preserving State Reduction**
*College PBL (Project-Based Learning) Project · Automata Theory & Formal Languages*

---

## 1. Project Overview

In Automata Theory, Deterministic Finite Automata (DFAs) synthesized via Thompson's construction, subset construction, or manual state machine modeling often accumulate redundant states:
1. **Unreachable states**: States that cannot be reached by any sequence of transitions starting from the initial state $q_0$.
2. **Dead states**: Reachable states from which no accepting state $F$ can ever be reached.
3. **Trap states**: Single states or strongly connected sink components that the automaton can never escape from toward an accepting state.

**Dead-State Pruner** performs automated graph reachability and usefulness analysis in $O(|Q| + |\delta|)$ linear time, detects dead and trap subgraphs, and generates a pruned, optimized DFA while proving that the recognized language $L(M)$ remains strictly invariant.

---

## 2. Mathematical Formalism & Algorithms

### A. Reachability Algorithm
- **Objective**: Identify all states reachable from start state $q_0$.
- **Method**: Breadth-First Search (BFS) on the transition graph $\delta$.
- **Time Complexity**: $O(|Q| + |\delta|)$.
- **Result**: $R \subseteq Q$. The unreachable set is $Q \setminus R$.

### B. Useful States (Live / Productive States)
- **Objective**: Identify all states that can reach at least one final state $f \in F$.
- **Method**: Inverted graph construction ($\delta^{-1}$) and multi-source BFS starting backwards from all final states $F$.
- **Time Complexity**: $O(|Q| + |\delta|)$.
- **Result**: $U = \{ q \in Q \mid \exists w \in \Sigma^*, \hat{\delta}(q, w) \in F \}$.

### C. Dead-State Detection
- **Formula**:
  $$\text{DeadStates} = \text{ReachableStates} \setminus \text{UsefulStates} = R \setminus U$$
- A state is dead if the automaton can reach it from $q_0$, but once in that state, it can never accept any string.

### D. Trap-State Detection
- Distinguishes **Dead States** from **Trap States**:
  - **Single-state trap**: $\delta(q, a) = q$ for all $a \in \Sigma$, with $q \notin F$.
  - **Multi-state trap SCC**: A Strongly Connected Component $C \subseteq Q$ where no transition leaves $C$ and $C \cap F = \emptyset$.

### E. Language Preservation Guarantee
$$\forall w \in \Sigma^* : M_{\text{orig}} \text{ accepts } w \iff M_{\text{pruned}} \text{ accepts } w$$
*Proof:* Any accepted string $w$ follows a sequence of states starting at $q_0$ and ending at some $f \in F$. Thus, every state on this accepting computation path is reachable (from $q_0$) and useful (can reach $f$). Therefore, neither unreachable states nor dead states ever participate in an accepting derivation. Removing them does not alter the language.

---

## 3. Key Application Features

1. **Dashboard**: Summary metrics ($|Q|$, reachable, unreachable, dead, trap, final, pruned size), theoretical background.
2. **Interactive DFA Editor**:
   - Add/remove states and alphabet symbols dynamically.
   - Interactive transition matrix editor.
   - Live validation enforcing deterministic DFA properties.
   - 6 Presets including the user's College PBL demonstration sample.
3. **Graph Visualizer (Cytoscape.js)**:
   - Directed edges with combined labels (`0, 1`).
   - Self-loops and double-bordered final states.
   - Dedicated start-state pointer arrow.
   - Layout modes: Hierarchical Flow, Organic Force-Directed, and Circle.
   - Zoom, Pan, Fit, and high-resolution PNG image export.
4. **Formal Analysis Panel**:
   - Direct output breakdown: Reachable, Unreachable, Useful, Dead, and Trap states.
   - Concrete witness paths from $q_0$ and to $F$ for every state.
5. **Before vs. After Comparison**:
   - Side-by-side original and pruned DFA graphs.
   - Comprehensive property reduction comparison table.
6. **Empirical Language Tester**:
   - Single-string simulation with character-by-character trace on both DFAs.
   - Automated batch suite (15+ strings: $\epsilon, 0, 1, 00, 01 \dots$) testing language equivalence.
7. **JSON Portability**:
   - Import/Export valid DFA JSON specifications.
8. **Educational & Complexity Section**:
   - Formal definitions, pseudo-code, and asymptotic Big-O analysis.
