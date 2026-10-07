import { DFA, DFAAnalysisResult, PrunedDFAResult } from '../types/dfa';

/**
 * Generates a complete, self-contained, standalone offline HTML application file.
 * This file can be saved to the user's PC and opened directly in any browser (Chrome, Edge, Firefox, Safari)
 * without requiring Node.js, npm, or an internet connection!
 */
export function generateOfflineAppHtml(
  dfa: DFA,
  prunedDFA: DFA | null,
  analysis: DFAAnalysisResult | null,
  prunedResult: PrunedDFAResult | null
): string {
  const dfaJson = JSON.stringify(dfa, null, 2);
  const prunedJson = JSON.stringify(prunedDFA || dfa, null, 2);
  const analysisJson = JSON.stringify(analysis, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dead-State Pruner — Standalone Offline App</title>
  <style>
    :root {
      --bg: #0f172a;
      --card: #1e293b;
      --border: #334155;
      --text: #f8fafc;
      --muted: #94a3b8;
      --accent: #38bdf8;
      --emerald: #10b981;
      --red: #ef4444;
      --amber: #f59e0b;
      --indigo: #6366f1;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 24px;
      line-height: 1.5;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    h1 { font-size: 24px; font-weight: 800; color: #fff; }
    .badge {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.2);
      color: var(--emerald);
      border: 1px solid rgba(16, 185, 129, 0.3);
      font-weight: 600;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
    }
    .card-title { font-size: 11px; text-transform: uppercase; color: var(--muted); font-weight: 600; }
    .card-val { font-size: 24px; font-weight: 800; font-family: monospace; margin-top: 4px; }
    .table-container { overflow-x: auto; margin-top: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
    th, td { padding: 10px 14px; border-bottom: 1px solid var(--border); }
    th { background: rgba(0,0,0,0.2); color: var(--muted); font-weight: 600; }
    .tester {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-top: 24px;
    }
    input {
      background: #0b1329;
      border: 1px solid var(--border);
      color: #fff;
      padding: 8px 14px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 14px;
      width: 260px;
    }
    button {
      background: var(--accent);
      color: #0f172a;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 13px;
      margin-left: 8px;
    }
    button:hover { opacity: 0.9; }
    pre {
      background: #0b1329;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      font-family: monospace;
      font-size: 12px;
      overflow-x: auto;
      margin-top: 12px;
    }
    .accepted { color: var(--emerald); font-weight: bold; }
    .rejected { color: var(--red); font-weight: bold; }
    footer { text-align: center; color: var(--muted); font-size: 12px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <h1>Dead-State Pruner</h1>
          <span class="badge">Offline Standalone Edition</span>
        </div>
        <p style="color: var(--muted); font-size: 13px; margin-top: 4px;">
          College PBL Project · DFA Optimization &amp; Language-Preserving Reduction
        </p>
      </div>
      <div style="color: var(--emerald); font-size: 12px; font-weight: 600;">
        ✓ Self-Contained (Zero Dependencies Required)
      </div>
    </header>

    <!-- KPI Grid -->
    <div class="grid">
      <div class="card">
        <div class="card-title">Original States</div>
        <div class="card-val">${dfa.states.length}</div>
      </div>
      <div class="card">
        <div class="card-title">Reachable</div>
        <div class="card-val" style="color: var(--emerald)">${analysis?.reachableStates.length || dfa.states.length}</div>
      </div>
      <div class="card">
        <div class="card-title">Unreachable</div>
        <div class="card-val" style="color: var(--amber)">${analysis?.unreachableStates.length || 0}</div>
      </div>
      <div class="card">
        <div class="card-title">Dead States</div>
        <div class="card-val" style="color: var(--red)">${analysis?.deadStates.length || 0}</div>
      </div>
      <div class="card">
        <div class="card-title">Trap States</div>
        <div class="card-val" style="color: #ec4899">${analysis?.trapStates.length || 0}</div>
      </div>
      <div class="card">
        <div class="card-title">Pruned States</div>
        <div class="card-val" style="color: var(--accent)">${prunedResult?.statesCountAfter || (prunedDFA?.states.length || dfa.states.length)}</div>
      </div>
    </div>

    <!-- Formal Classification Card -->
    <div class="card" style="margin-bottom: 24px;">
      <h3 style="font-size: 16px; margin-bottom: 8px;">Formal Automata Analysis</h3>
      <pre>Reachable States:   ${analysis?.reachableStates.join(', ') || 'None'}
Unreachable States: ${analysis?.unreachableStates.join(', ') || 'None'}
Useful States:      ${analysis?.usefulStates.join(', ') || 'None'}
Dead States:        ${analysis?.deadStates.join(', ') || 'None'}
Trap States:        ${analysis?.trapStates.join(', ') || 'None'}</pre>
    </div>

    <!-- Comparison Table -->
    <div class="card">
      <h3 style="font-size: 16px; margin-bottom: 4px;">Original vs Pruned Comparison</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Original DFA</th>
              <th>Pruned DFA</th>
              <th>Reduction</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>States (|Q|)</td>
              <td>${dfa.states.length}</td>
              <td style="color: var(--emerald); font-weight: bold;">${prunedResult?.statesCountAfter || (prunedDFA?.states.length || dfa.states.length)}</td>
              <td style="color: var(--red)">-${prunedResult?.removedStates.length || 0} states</td>
            </tr>
            <tr>
              <td>Start State (q₀)</td>
              <td>${dfa.startState}</td>
              <td>${prunedDFA?.startState || dfa.startState}</td>
              <td>Preserved</td>
            </tr>
            <tr>
              <td>Final States (F)</td>
              <td>{ ${dfa.finalStates.join(', ')} }</td>
              <td style="color: var(--indigo);">{ ${prunedDFA?.finalStates.join(', ') || dfa.finalStates.join(', ')} }</td>
              <td>Preserved</td>
            </tr>
            <tr>
              <td>Language Equivalence</td>
              <td colspan="3" style="color: var(--emerald); font-weight: bold;">
                L(M_orig) ≡ L(M_pruned) — Guaranteed Invariant
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Interactive Simulator -->
    <div class="tester">
      <h3 style="font-size: 16px; margin-bottom: 8px;">Live Offline String Simulator</h3>
      <p style="color: var(--muted); font-size: 13px; margin-bottom: 12px;">
        Type an input string (e.g. 01101) to trace execution on both original and pruned automata:
      </p>
      <div>
        <input id="inputString" type="text" value="01101" placeholder="e.g. 01101" />
        <button onclick="runSimulation()">Test String</button>
      </div>
      <div id="simResult" style="margin-top: 14px; font-family: monospace; font-size: 13px;"></div>
    </div>

    <footer>
      Dead-State Pruner · College PBL Project · Complexity: O(|Q| + |δ|) · Generated for Offline Evaluation
    </footer>
  </div>

  <script>
    const originalDFA = ${dfaJson};
    const prunedDFA = ${prunedJson};

    function simulate(dfa, str) {
      let current = dfa.startState;
      const chars = (str === 'ε' || str === '') ? [] : str.split('');
      for (const c of chars) {
        if (!dfa.transitions[current] || !dfa.transitions[current][c]) {
          return { accepted: false, endState: null, stoppedAt: c };
        }
        current = dfa.transitions[current][c];
      }
      return { accepted: dfa.finalStates.includes(current), endState: current };
    }

    function runSimulation() {
      const val = document.getElementById('inputString').value.trim();
      const resOrig = simulate(originalDFA, val);
      const resPruned = simulate(prunedDFA, val);
      const out = document.getElementById('simResult');

      out.innerHTML = \`
        <div style="background: #0b1329; padding: 12px; border-radius: 8px; border: 1px solid var(--border);">
          <div>Original DFA: <span class="\${resOrig.accepted ? 'accepted' : 'rejected'}">\${resOrig.accepted ? 'ACCEPTED' : 'REJECTED'}</span> (ended in: \${resOrig.endState || 'dead/pruned sink'})</div>
          <div style="margin-top: 4px;">Pruned DFA: <span class="\${resPruned.accepted ? 'accepted' : 'rejected'}">\${resPruned.accepted ? 'ACCEPTED' : 'REJECTED'}</span> (ended in: \${resPruned.endState || 'dead/pruned sink'})</div>
          <div style="margin-top: 8px; font-weight: bold; color: \${resOrig.accepted === resPruned.accepted ? 'var(--emerald)' : 'var(--red)'};">
            Language Equivalence: \${resOrig.accepted === resPruned.accepted ? 'SAME (Verified)' : 'MISMATCH'}
          </div>
        </div>
      \`;
    }

    // Run on load
    runSimulation();
  </script>
</body>
</html>`;
}

/**
 * Generates a comprehensive college PBL text report suitable for submission.
 */
export function generatePBLReportText(
  dfa: DFA,
  prunedResult: PrunedDFAResult | null,
  analysis: DFAAnalysisResult | null
): string {
  const date = new Date().toLocaleDateString();
  const prunedDFA = prunedResult?.prunedDFA;

  return `================================================================================
                    COLLEGE PBL PROJECT SUBMISSION REPORT
              DEAD-STATE PRUNER: DFA OPTIMIZATION & REDUCTION
================================================================================
Date: ${date}
Domain: Automata Theory & Formal Language Theory (FLAT)
Algorithm Complexity: O(|Q| + |δ|)

--------------------------------------------------------------------------------
1. ORIGINAL AUTOMATON SPECIFICATION
--------------------------------------------------------------------------------
States Q:           { ${dfa.states.join(', ')} } (${dfa.states.length} states)
Alphabet Σ:         { ${dfa.alphabet.join(', ')} }
Start State q₀:     ${dfa.startState}
Final States F:     { ${dfa.finalStates.join(', ')} }

Transition Matrix δ(q, σ):
${dfa.states.map((s) => {
  const trans = dfa.alphabet.map((sym) => `δ(${s}, ${sym}) = ${dfa.transitions[s]?.[sym] || '—'}`).join('; ');
  return `  ${s.padEnd(6)}: ${trans}`;
}).join('\n')}

--------------------------------------------------------------------------------
2. FORMAL GRAPH ANALYSIS RESULTS
--------------------------------------------------------------------------------
Reachable States:
  ${analysis?.reachableStates.join(', ') || 'None'}

Unreachable States (Disconnected from q₀):
  ${analysis?.unreachableStates.join(', ') || 'None'}

Useful States (Can reach at least one final state in F):
  ${analysis?.usefulStates.join(', ') || 'None'}

Dead States (Reachable from q₀, but zero path to F):
  ${analysis?.deadStates.join(', ') || 'None'}

Trap States (Closed sink components with zero exit to F):
  ${analysis?.trapStates.join(', ') || 'None'}

--------------------------------------------------------------------------------
3. STATE REDUCTION SUMMARY
--------------------------------------------------------------------------------
States Before Pruning:   ${dfa.states.length}
States After Pruning:    ${prunedDFA?.states.length ?? '—'}
States Removed:          ${prunedResult?.removedStates.length ?? 0} ({ ${prunedResult?.removedStates.join(', ') ?? ''} })
Transitions Removed:     ${prunedResult?.removedTransitionsCount ?? 0}

Pruned States Q':        { ${prunedDFA?.states.join(', ') ?? ''} }
Pruned Final States F':  { ${prunedDFA?.finalStates.join(', ') ?? ''} }

--------------------------------------------------------------------------------
4. THEORETICAL LANGUAGE PRESERVATION PROOF
--------------------------------------------------------------------------------
Theorem: L(M_original) ≡ L(M_pruned)
Proof:
  1. Let w be any string accepted by M_original.
     The sequence of states traversed by w begins at q₀ and terminates in F.
     By definition:
       - Every state on this computation path is reachable from q₀.
       - Every state on this computation path can reach F, hence is useful.
  2. Unreachable states are never entered in any computation starting from q₀.
  3. Dead states can never lead to an accepting state, so no accepted string
     can ever visit a dead state.
  4. Therefore, eliminating unreachable and dead states removes zero accepting
     derivations. The accepted language L(M) is strictly invariant.

================================================================================
Generated via Dead-State Pruner Application
================================================================================`;
}
