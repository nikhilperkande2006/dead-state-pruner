import React, { useState } from 'react';
import { DFA } from '../types/dfa';
import { downloadTextFile, copyToClipboard } from '../utils/downloadHelper';
import { X, Upload, Download, Copy, Check, AlertCircle } from 'lucide-react';

interface JsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDFA: DFA;
  prunedDFA: DFA | null;
  onImportDFA: (dfa: DFA) => void;
  isDark?: boolean;
}

export const JsonModal: React.FC<JsonModalProps> = ({
  isOpen,
  onClose,
  currentDFA,
  prunedDFA,
  onImportDFA,
  isDark = true,
}) => {
  const [jsonInput, setJsonInput] = useState(() => JSON.stringify(currentDFA, null, 2));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'import' | 'exportCurrent' | 'exportPruned'>('import');

  if (!isOpen) return null;

  const handleValidateAndImport = () => {
    setErrorMessage(null);
    try {
      const parsed = JSON.parse(jsonInput);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Root JSON must be an object.');
      }
      if (!Array.isArray(parsed.states) || parsed.states.length === 0) {
        throw new Error('"states" must be a non-empty array of strings.');
      }
      if (!Array.isArray(parsed.alphabet) || parsed.alphabet.length === 0) {
        throw new Error('"alphabet" must be a non-empty array of strings.');
      }
      if (typeof parsed.startState !== 'string' || !parsed.states.includes(parsed.startState)) {
        throw new Error(`"startState" must be one of the declared states.`);
      }
      if (!Array.isArray(parsed.finalStates)) {
        throw new Error('"finalStates" must be an array of strings.');
      }
      for (const f of parsed.finalStates) {
        if (!parsed.states.includes(f)) {
          throw new Error(`Final state "${f}" is not in declared states list.`);
        }
      }
      if (!parsed.transitions || typeof parsed.transitions !== 'object') {
        throw new Error('"transitions" must be an object mapping states to symbol transitions.');
      }

      const cleanDFA: DFA = {
        states: parsed.states.map((s: any) => String(s).trim()),
        alphabet: parsed.alphabet.map((a: any) => String(a).trim()),
        startState: String(parsed.startState).trim(),
        finalStates: parsed.finalStates.map((f: any) => String(f).trim()),
        transitions: parsed.transitions,
      };

      onImportDFA(cleanDFA);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid JSON syntax or schema.');
    }
  };

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (data: object, filename: string) => {
    downloadTextFile(JSON.stringify(data, null, 2), filename, 'application/json');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      setActiveTab('import');
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base">JSON Automaton Portability</h3>
            <span className="text-xs text-slate-500 font-mono">Format 2.0</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className={`px-4 pt-2 border-b flex items-center gap-2 text-xs ${
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`pb-2 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Import JSON
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exportCurrent')}
            className={`pb-2 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'exportCurrent'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Export Original DFA
          </button>
          {prunedDFA && (
            <button
              type="button"
              onClick={() => setActiveTab('exportPruned')}
              className={`pb-2 px-2 font-medium border-b-2 transition-colors ${
                activeTab === 'exportPruned'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Export Pruned DFA
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-lg border border-red-800/40 bg-red-950/20 text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span>Paste or load DFA JSON specification:</span>
                <label className="cursor-pointer text-sky-400 hover:underline flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .json file</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                rows={12}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste DFA JSON here..."
                className={`w-full p-3 font-mono text-xs rounded-xl border focus:outline-hidden ${
                  isDark
                    ? 'border-slate-800 bg-slate-950 text-slate-200 focus:border-sky-500'
                    : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-sky-500'
                }`}
              />
            </div>
          )}

          {activeTab === 'exportCurrent' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span>Current DFA JSON Structure:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(JSON.stringify(currentDFA, null, 2))}
                    className="flex items-center gap-1 text-sky-400 hover:underline"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(currentDFA, 'original-dfa.json')}
                    className="flex items-center gap-1 text-emerald-400 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </button>
                </div>
              </div>

              <pre className="p-3 font-mono text-xs rounded-xl border border-slate-800 bg-slate-950 text-slate-200 overflow-x-auto max-h-72">
                {JSON.stringify(currentDFA, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'exportPruned' && prunedDFA && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span>Optimized Pruned DFA JSON Structure:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(JSON.stringify(prunedDFA, null, 2))}
                    className="flex items-center gap-1 text-sky-400 hover:underline"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(prunedDFA, 'pruned-dfa.json')}
                    className="flex items-center gap-1 text-emerald-400 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </button>
                </div>
              </div>

              <pre className="p-3 font-mono text-xs rounded-xl border border-slate-800 bg-slate-950 text-slate-200 overflow-x-auto max-h-72">
                {JSON.stringify(prunedDFA, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
              isDark ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-300 bg-white text-slate-700'
            }`}
          >
            Cancel
          </button>

          {activeTab === 'import' ? (
            <button
              type="button"
              onClick={handleValidateAndImport}
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow-sm transition-colors"
            >
              Validate &amp; Load DFA
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleDownload(activeTab === 'exportPruned' ? prunedDFA! : currentDFA, 'dfa.json')}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
