import {
  Layers,
  Sparkles,
  Minimize2,
  FileText,
  PlayCircle,
  HelpCircle,
  Moon,
  Sun,
  RotateCcw,
  Network,
  Download,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onReset: () => void;
  onLoadSample: () => void;
  onOpenDownloadModal: () => void;
  hasPruned: boolean;
  isInstalled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isDark,
  onToggleTheme,
  onReset,
  onLoadSample,
  onOpenDownloadModal,
  hasPruned,
  isInstalled = false,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'input', label: 'DFA Input & Table', icon: FileText },
    { id: 'visualization', label: 'Interactive Graph', icon: Network },
    { id: 'analysis', label: 'Analysis', icon: Sparkles },
    { id: 'comparison', label: 'Before vs After', icon: Minimize2, badge: hasPruned ? 'Ready' : undefined },
    { id: 'testing', label: 'Language Tester', icon: PlayCircle },
    { id: 'help', label: 'How It Works', icon: HelpCircle },
  ];

  return (
    <header className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
      isDark
        ? 'border-slate-800/80 bg-slate-900/90'
        : 'border-slate-200 bg-white/90'
    }`}>
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-md">
            <Minimize2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`font-extrabold text-lg sm:text-xl tracking-tight leading-none ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Dead-State Pruner
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PBL Demo
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              DFA Optimization &amp; Language-Preserving State Reduction
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Download & Install App button in the right corner */}
          <button
            type="button"
            onClick={onOpenDownloadModal}
            className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md transition-all hover:scale-102 active:scale-98"
            title="Download standalone app, install PWA, or export PBL reports"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download App</span>
          </button>

          <button
            type="button"
            onClick={onLoadSample}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Load the standard PBL sample DFA"
          >
            Load Sample DFA
          </button>

          <button
            type="button"
            onClick={onReset}
            className={`p-1.5 rounded-lg border text-slate-400 hover:text-slate-200 transition-colors ${
              isDark ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-700' : 'border-slate-300 bg-white hover:bg-slate-100'
            }`}
            title="Reset DFA to default state"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className={`p-1.5 rounded-lg border text-slate-400 hover:text-slate-200 transition-colors ${
              isDark ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-700' : 'border-slate-300 bg-white hover:bg-slate-100'
            }`}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Nav Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar">
        <nav className="flex items-center space-x-1 border-t border-slate-800/40 pt-1 pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? isDark
                      ? 'bg-slate-800 text-sky-400 shadow-xs'
                      : 'bg-slate-100 text-sky-700 shadow-xs font-semibold'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
