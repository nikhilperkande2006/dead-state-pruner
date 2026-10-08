import React, { useState } from 'react';
import { DFA, DFAAnalysisResult, PrunedDFAResult } from '../types/dfa';
import { generateOfflineAppHtml } from '../utils/exportBundle';
import { downloadTextFile } from '../utils/downloadHelper';
import {
  Monitor,
  Download,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
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
  onExportOriginalJSON?: () => void;
  onExportPrunedJSON?: () => void;
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
  onInstallPWA,
  isDark = true,
}) => {
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  // Single-click direct offline HTML app download
  const handleDownloadStandalone = () => {
    const htmlContent = generateOfflineAppHtml(
      dfa,
      prunedResult ? prunedResult.prunedDFA : null,
      analysis,
      prunedResult
    );
    const success = downloadTextFile(htmlContent, 'Dead-State-Pruner.html', 'text/html');
    if (success) {
      setStatusNotice('✓ App downloaded! Double-click on your desktop to open anytime offline.');
    } else {
      setStatusNotice('Download initiated. Check your browser downloads.');
    }
    setTimeout(() => setStatusNotice(null), 5000);
  };

  const handleInstallClick = async () => {
    setIsInstalling(true);
    if (isInstallable) {
      const success = await onInstallPWA();
      setIsInstalling(false);
      if (success) {
        onClose();
        return;
      }
    }
    
    // If native prompt is not active or dismissed, provide direct standalone download
    handleDownloadStandalone();
    setIsInstalling(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-md">
              <Monitor className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-base">Install Dead-State Pruner</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-center flex flex-col items-center">
          {/* App Icon with Glow */}
          <div className="relative group my-2">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sky-500 to-emerald-500 opacity-60 blur-lg transition duration-500 group-hover:opacity-100"></div>
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-950 shadow-2xl flex items-center justify-center">
              <img
                src="./icon.svg"
                alt="Dead-State Pruner Icon"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Layers className="w-10 h-10 text-sky-400 opacity-0 group-hover:opacity-10 transition-opacity" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 max-w-xs">
            <h4 className="text-lg font-bold tracking-tight">Dead-State Pruner App</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Install the standalone app directly to your desktop. Opens in its own window with zero browser clutter and works 100% offline.
            </p>
          </div>

          {/* Status Notification */}
          {statusNotice && (
            <div className="w-full p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/70 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in text-left">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusNotice}</span>
            </div>
          )}

          {/* PRIMARY ACTION BUTTONS */}
          <div className="w-full space-y-2.5 pt-2">
            <a
              href="./DeadStatePruner-Setup.bat"
              download="DeadStatePruner-Setup.bat"
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-emerald-600 hover:from-sky-500 hover:via-indigo-500 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Windows Desktop Installer (.bat)</span>
            </a>

            {isInstallable && (
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="w-full py-2.5 px-4 rounded-xl border border-sky-500/40 bg-sky-950/30 hover:bg-sky-900/40 text-sky-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Install via Edge / Chrome App</span>
              </button>
            )}

            {/* Subtext info */}
            <p className="text-[11px] text-slate-400">
              Double-click the downloaded <strong>.bat installer</strong> to automatically place the app icon directly on your Desktop!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-3.5 border-t flex items-center justify-between text-xs ${
          isDark ? 'border-slate-800 bg-slate-900/60 text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          <span className="text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Fast · Offline · Instant</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className={`px-3 py-1 rounded-lg border text-xs font-medium cursor-pointer ${
              isDark ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-300 bg-white text-slate-700'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
