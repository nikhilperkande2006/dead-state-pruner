import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { DFA, DFAAnalysisResult, PrunedDFAResult } from './types/dfa';
import { SAMPLE_DFAS } from './algorithms/sampleDFAs';
import { analyzeDFA } from './algorithms/analysis';
import { pruneDFA } from './algorithms/pruning';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { DFAInput } from './components/DFAInput';
import { DFAGraph } from './components/DFAGraph';
import { AnalysisPanel } from './components/AnalysisPanel';
import { ComparisonView } from './components/ComparisonView';
import { LanguageTester } from './components/LanguageTester';
import { Help } from './components/Help';
import { JsonModal } from './components/JsonModal';
import { DownloadAppModal } from './components/DownloadAppModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { downloadTextFile } from './utils/downloadHelper';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Active DFA state initialized with the College PBL primary preset
  const [currentDFA, setCurrentDFA] = useState<DFA>(() => SAMPLE_DFAS[0].dfa);
  const [prunedResult, setPrunedResult] = useState<PrunedDFAResult | null>(null);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [highlightedState, setHighlightedState] = useState<string | null>(null);

  // Progressive Web App (PWA) installation hook
  const { isInstallable, isInstalled, isIOS, install: installPWA } = usePWAInstall();

  // Compute analysis automatically when currentDFA changes
  const analysis = useMemo<DFAAnalysisResult>(() => {
    return analyzeDFA(currentDFA);
  }, [currentDFA]);

  // Compute initial pruning on mount
  useEffect(() => {
    if (analysis.isValid) {
      const pruned = pruneDFA(currentDFA, analysis);
      setPrunedResult(pruned);
    }
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // User explicitly triggers Analyze
  const handleAnalyze = () => {
    const result = analyzeDFA(currentDFA);
    if (!result.isValid) {
      showToast(`Validation errors found in DFA (${result.validationErrors.length})`, 'error');
      setActiveTab('input');
      return;
    }
    showToast(`DFA Analysis complete: ${result.reachableStates.length} reachable, ${result.deadStates.length} dead, ${result.unreachableStates.length} unreachable.`, 'success');
    setActiveTab('analysis');
  };

  // User explicitly triggers Prune
  const handlePrune = () => {
    if (!analysis.isValid) {
      showToast('Cannot prune: Please resolve DFA validation errors first.', 'error');
      setActiveTab('input');
      return;
    }
    const result = pruneDFA(currentDFA, analysis);
    setPrunedResult(result);
    showToast(`Pruned successfully! Removed ${result.removedStates.length} redundant states (${result.statesCountBefore} → ${result.statesCountAfter}).`, 'success');
    setActiveTab('comparison');
  };

  // Load sample preset
  const handleLoadSample = (sampleId: string = 'college_pbl_primary') => {
    const preset = SAMPLE_DFAS.find((s) => s.id === sampleId) || SAMPLE_DFAS[0];
    setCurrentDFA(preset.dfa);
    const newAnalysis = analyzeDFA(preset.dfa);
    const newPruned = pruneDFA(preset.dfa, newAnalysis);
    setPrunedResult(newPruned);
    showToast(`Loaded "${preset.name}".`, 'info');
  };

  // Reset to default sample
  const handleReset = () => {
    handleLoadSample('college_pbl_primary');
    showToast('Reset DFA to original PBL demo state.', 'info');
  };

  // Handle JSON export original
  const handleExportOriginalJSON = () => {
    const success = downloadTextFile(
      JSON.stringify(currentDFA, null, 2),
      'original-dfa.json',
      'application/json'
    );
    if (success) {
      showToast('Original DFA exported as original-dfa.json', 'success');
    }
  };

  // Handle JSON export pruned
  const handleExportPrunedJSON = () => {
    if (!prunedResult) return;
    const success = downloadTextFile(
      JSON.stringify(prunedResult.prunedDFA, null, 2),
      'pruned-dfa.json',
      'application/json'
    );
    if (success) {
      showToast('Pruned DFA exported as pruned-dfa.json', 'success');
    }
  };

  // Handle JSON import
  const handleImportDFA = (imported: DFA) => {
    setCurrentDFA(imported);
    const newAnalysis = analyzeDFA(imported);
    if (newAnalysis.isValid) {
      setPrunedResult(pruneDFA(imported, newAnalysis));
      showToast('JSON DFA imported and pruned successfully!', 'success');
    } else {
      showToast('JSON DFA loaded with validation warnings.', 'info');
    }
    setActiveTab('dashboard');
  };

  // Sync theme with html root element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onReset={handleReset}
        onLoadSample={() => handleLoadSample('college_pbl_primary')}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        hasPruned={prunedResult !== null}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onInstallPWA={installPWA}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium shadow-xl transition-all animate-fade-in border bg-slate-900 text-white border-slate-700">
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <Dashboard
              dfa={currentDFA}
              analysis={analysis}
              prunedResult={prunedResult}
              onAnalyze={handleAnalyze}
              onPrune={handlePrune}
              onLoadSample={() => handleLoadSample('college_pbl_primary')}
              onNavigateTab={setActiveTab}
              onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
              isDark={isDark}
            />

            {/* Quick Preview Grid: Graph + Input Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-slate-100">
                    Active Automaton Graph
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveTab('visualization')}
                    className="text-xs text-sky-400 hover:underline"
                  >
                    Open full visualizer →
                  </button>
                </div>
                <DFAGraph
                  dfa={currentDFA}
                  analysis={analysis}
                  title="Original DFA"
                  highlightedState={highlightedState}
                  onSelectState={setHighlightedState}
                  height="340px"
                  isDark={isDark}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-slate-100">
                    Pruned (Reduced) Graph
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveTab('comparison')}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    View comparison table →
                  </button>
                </div>
                {prunedResult ? (
                  <DFAGraph
                    dfa={prunedResult.prunedDFA}
                    title="Pruned DFA"
                    isPruned={true}
                    height="340px"
                    isDark={isDark}
                  />
                ) : (
                  <div className={`h-[340px] flex items-center justify-center rounded-xl border ${
                    isDark ? 'border-slate-800 bg-slate-900/40 text-slate-500' : 'border-slate-200 bg-white text-slate-400'
                  } text-xs`}>
                    Click "Prune DFA" to compute reduced state graph
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DFA INPUT & TRANSITIONS */}
        {activeTab === 'input' && (
          <DFAInput
            dfa={currentDFA}
            onChangeDFA={(newDFA) => {
              setCurrentDFA(newDFA);
              const newAnalysis = analyzeDFA(newDFA);
              if (newAnalysis.isValid) {
                setPrunedResult(pruneDFA(newDFA, newAnalysis));
              }
            }}
            analysis={analysis}
            onAnalyze={handleAnalyze}
            onPrune={handlePrune}
            onOpenJsonModal={() => setIsJsonModalOpen(true)}
            isDark={isDark}
          />
        )}

        {/* TAB 3: VISUALIZATION */}
        {activeTab === 'visualization' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-100">
                  Interactive Directed Graph Visualizer
                </h3>
                <p className="text-xs text-slate-400">
                  Powered by Cytoscape canvas engine. Supports zooming, panning, dragging nodes, dynamic layout switching, and high-res PNG export.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition-colors"
                >
                  Analyze DFA
                </button>
                <button
                  type="button"
                  onClick={handlePrune}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
                >
                  Prune DFA
                </button>
              </div>
            </div>

            <DFAGraph
              dfa={currentDFA}
              analysis={analysis}
              title="Deterministic Finite Automaton (Q, Σ, δ, q₀, F)"
              highlightedState={highlightedState}
              onSelectState={setHighlightedState}
              height="580px"
              isDark={isDark}
            />
          </div>
        )}

        {/* TAB 4: ANALYSIS */}
        {activeTab === 'analysis' && (
          <AnalysisPanel
            dfa={currentDFA}
            analysis={analysis}
            onAnalyze={handleAnalyze}
            onPrune={handlePrune}
            isDark={isDark}
          />
        )}

        {/* TAB 5: BEFORE VS AFTER COMPARISON */}
        {activeTab === 'comparison' && (
          <ComparisonView
            originalDFA={currentDFA}
            originalAnalysis={analysis}
            prunedResult={prunedResult}
            onPrune={handlePrune}
            onExportOriginalJSON={handleExportOriginalJSON}
            onExportPrunedJSON={handleExportPrunedJSON}
            isDark={isDark}
          />
        )}

        {/* TAB 6: LANGUAGE VERIFICATION & STRING TESTER */}
        {activeTab === 'testing' && (
          <LanguageTester
            originalDFA={currentDFA}
            prunedResult={prunedResult}
            onPrune={handlePrune}
            isDark={isDark}
          />
        )}

        {/* TAB 7: EDUCATIONAL HELP */}
        {activeTab === 'help' && (
          <Help isDark={isDark} />
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t py-4 text-xs ${
        isDark ? 'border-slate-800/80 bg-slate-900/60 text-slate-500' : 'border-slate-200 bg-white text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2">
          <div>
            <strong>Dead-State Pruner</strong> · College PBL Project · Automata Theory &amp; Formal Languages
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Complexity: O(|Q| + |δ|) · Language Invariant
          </div>
        </div>
      </footer>

      {/* JSON Import/Export Modal */}
      <JsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        currentDFA={currentDFA}
        prunedDFA={prunedResult ? prunedResult.prunedDFA : null}
        onImportDFA={handleImportDFA}
        isDark={isDark}
      />

      {/* Download & Install App Modal */}
      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        dfa={currentDFA}
        prunedResult={prunedResult}
        analysis={analysis}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        onInstallPWA={installPWA}
        onExportOriginalJSON={handleExportOriginalJSON}
        onExportPrunedJSON={handleExportPrunedJSON}
        isDark={isDark}
      />
    </div>
  );
}
