import React, { useState } from 'react';
import { DFA, DFAAnalysisResult, PrunedDFAResult } from '../types/dfa';
import { generateOfflineAppHtml, generatePBLReportText } from '../utils/exportBundle';
import { downloadTextFile, copyToClipboard } from '../utils/downloadHelper';
import {
  Download,
  Smartphone,
  Monitor,
  FileCode,
  FileText,
  Copy,
  Check,
  X,
  CheckCircle2,
  ExternalLink,
  Code2,
} from 'lucide-react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  dfa: DFA;
  prunedResult: PrunedDFAResult | null;
  analysis: DFAAnalysisResult | null;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  onInstallPWA: () => Promise<boolean>;
  onExportOriginalJSON: () => void;
  onExportPrunedJSON: () => void;
  isDark?: boolean;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
  dfa,
  prunedResult,
  analysis,
  isInstallable,
  isInstalled,
  isIOS,
  onInstallPWA,
  onExportOriginalJSON,
  onExportPrunedJSON,
  isDark = true,
}) => {
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [showCodePreview, setShowCodePreview] = useState<boolean>(false);

  if (!isOpen) return null;

  // Standalone offline HTML content
  const htmlContent = generateOfflineAppHtml(
    dfa,
    prunedResult ? prunedResult.prunedDFA : null,
    analysis,
    prunedResult
  );

  // PBL Project Text report
  const reportText = generatePBLReportText(dfa, prunedResult, analysis);

  // Trigger download with multi-tier fallback
  const handleDownloadOfflineHTML = () => {
    const success = downloadTextFile(htmlContent, 'dead-state-pruner-offline.html', 'text/html');
    if (success) {
      setDownloadNotice('Download initiated! Check your browser Downloads bar or folder.');
    } else {
      setDownloadNotice('Browser download restricted. Click "Copy HTML Code" below to save manually.');
    }
    setTimeout(() => setDownloadNotice(null), 5000);
  };

  const handleDownloadPBLReport = () => {
    const success = downloadTextFile(reportText, 'PBL-DFA-Pruner-Report.txt', 'text/plain');
    if (success) {
      setDownloadNotice('Report downloaded! Check your browser Downloads bar or folder.');
    } else {
      setDownloadNotice('Browser download restricted. Click "Copy Text Report" below to save manually.');
    }
    setTimeout(() => setDownloadNotice(null), 5000);
  };

  const handleCopyHTML = async () => {
    const ok = await copyToClipboard(htmlContent);
    if (ok) {
      setCopiedType('html');
      setDownloadNotice('Full offline HTML application copied to clipboard!');
      setTimeout(() => setCopiedType(null), 3000);
      setTimeout(() => setDownloadNotice(null), 4000);
    }
  };

  const handleCopyReport = async () => {
    const ok = await copyToClipboard(reportText);
    if (ok) {
      setCopiedType('report');
      setDownloadNotice('PBL Report copied to clipboard!');
      setTimeout(() => setCopiedType(null), 3000);
      setTimeout(() => setDownloadNotice(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-md">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Download Dead-State Pruner</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  Desktop &amp; Mobile
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Choose how you want to download or install this application on your computer.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast Alert if download is active */}
        {downloadNotice && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{downloadNotice}</span>
            </div>
            <button type="button" onClick={() => setDownloadNotice(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Body Options */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* PRIMARY OPTION: Standalone Offline Single-File HTML */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isDark ? 'border-emerald-700/60 bg-emerald-950/20' : 'border-emerald-300 bg-emerald-50/70'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-slate-100">
                  1. Standalone Offline App (.html)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  Direct PC Download
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed max-w-md">
                Downloads a complete, self-contained single-file application. Save it to your desktop and double-click to open in Chrome, Edge, Firefox, or Safari with <strong>zero internet connection required!</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadOfflineHTML}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 whitespace-nowrap active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download .html</span>
              </button>
              <button
                type="button"
                onClick={handleCopyHTML}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Copy entire HTML code to clipboard"
              >
                {copiedType === 'html' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* SECOND OPTION: Install as Native Desktop App (Chrome / Edge PWA) */}
          <div className={`p-4 rounded-xl border relative overflow-hidden transition-all ${
            isDark ? 'border-sky-800/50 bg-slate-900/60' : 'border-sky-200 bg-sky-50/40'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-sky-400" />
                  <Smartphone className="w-4 h-4 text-sky-400" />
                  <span className="font-bold text-sm text-slate-100">
                    2. Install as Desktop App (PWA)
                  </span>
                  {isInstalled && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                      Installed
                    </span>
                  )}
                </div>
                <p className="text-slate-300 text-xs leading-relaxed max-w-md">
                  To install Dead-State Pruner with a desktop icon, open the app in a full browser tab. In Chrome or Edge, click the <strong>Install App icon (⊞ or ⬇)</strong> in the top address bar.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {isInstallable ? (
                  <button
                    type="button"
                    onClick={async () => {
                      const success = await onInstallPWA();
                      if (success) onClose();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install to PC</span>
                  </button>
                ) : (
                  <a
                    href="https://ais-pre-56jknrlwqaytblerp6t5vy-972951159730.asia-east1.run.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span>Open in Full Tab to Install</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* THIRD OPTION: College Project Documentation Report */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-sm text-slate-100">
                  3. College PBL Project Submission Report (.txt)
                </span>
              </div>
              <p className="text-slate-400 text-xs max-w-md">
                Formal project documentation text file including input DFA, Reachability/Useful/Dead/Trap analysis, state reduction table, and language preservation mathematical proof.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadPBLReport}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  isDark
                    ? 'border-indigo-800 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/60'
                    : 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>
              <button
                type="button"
                onClick={handleCopyReport}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Copy report text to clipboard"
              >
              </button>
            </div>
          </div>

          {/* OPTION: Download Complete Project ZIP */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isDark ? 'border-amber-900/40 bg-amber-950/15' : 'border-amber-200 bg-amber-50/60'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-slate-100">
                  4. Complete Project Source Code (.zip)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                  Ready for GitHub
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed max-w-md">
                Pre-packaged complete codebase archive (React, TypeScript, Cytoscape algorithms, documentation). Perfect for uploading to GitHub or extracting on your desktop!
              </p>
            </div>

            <a
              href="/dead-state-pruner.zip"
              download="dead-state-pruner.zip"
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 whitespace-nowrap shrink-0 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download .zip (277 KB)</span>
            </a>
          </div>

          {/* FOURTH OPTION: JSON Automaton Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
            }`}>
              <div>
                <div className="font-semibold text-xs text-slate-200">Original DFA JSON</div>
                <div className="text-[11px] text-slate-500">Unpruned machine specification</div>
              </div>
              <button
                type="button"
                onClick={onExportOriginalJSON}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Save .json</span>
              </button>
            </div>

            <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
            }`}>
              <div>
                <div className="font-semibold text-xs text-emerald-400">Pruned DFA JSON</div>
                <div className="text-[11px] text-slate-500">Optimized reduced machine</div>
              </div>
              <button
                type="button"
                onClick={onExportPrunedJSON}
                disabled={!prunedResult}
                className="px-3 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Download className="w-3 h-3" />
                <span>Save .json</span>
              </button>
            </div>
          </div>

          {/* Code Preview Toggle */}
          <div className="pt-2 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => setShowCodePreview(!showCodePreview)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showCodePreview ? 'Hide HTML Source Code Preview' : 'Preview Standalone HTML Code'}</span>
            </button>

            {showCodePreview && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">You can also copy this code and paste it into Notepad, then save as "pruner.html":</span>
                  <button
                    type="button"
                    onClick={handleCopyHTML}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy All</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 font-mono text-[10px] max-h-48 overflow-y-auto">
                  {htmlContent}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="text-[11px] text-slate-400">
            All downloads are generated locally and contain your full current DFA state and reduction calculations.
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg border text-xs font-medium ${
              isDark ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-300 bg-white text-slate-700'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
