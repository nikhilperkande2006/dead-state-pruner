import React, { useEffect, useRef, useState, useId } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { DFA, DFAAnalysisResult } from '../types/dfa';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Camera, Eye } from 'lucide-react';

interface DFAGraphProps {
  dfa: DFA;
  analysis?: DFAAnalysisResult | null;
  title?: string;
  isPruned?: boolean;
  highlightedState?: string | null;
  onSelectState?: (state: string | null) => void;
  height?: string;
  isDark?: boolean;
}

export const DFAGraph: React.FC<DFAGraphProps> = ({
  dfa,
  analysis,
  title,
  isPruned = false,
  highlightedState,
  onSelectState,
  height = '420px',
  isDark = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [layoutMode, setLayoutMode] = useState<'breadthfirst' | 'circle' | 'cose'>('breadthfirst');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const graphId = useId();

  // Combine transitions between same source and target
  // e.g., if q0 -> q1 on '0' and q0 -> q1 on '1', merge into label "0, 1"
  const edgeMap: Record<string, { source: string; target: string; symbols: string[] }> = {};

  for (const source of dfa.states) {
    const sTransitions = dfa.transitions[source] || {};
    for (const [sym, target] of Object.entries(sTransitions)) {
      if (dfa.states.includes(target)) {
        const edgeKey = `${source}->${target}`;
        if (!edgeMap[edgeKey]) {
          edgeMap[edgeKey] = { source, target, symbols: [] };
        }
        if (!edgeMap[edgeKey].symbols.includes(sym)) {
          edgeMap[edgeKey].symbols.push(sym);
        }
      }
    }
  }

  // Initialize and update Cytoscape instance
  useEffect(() => {
    if (!containerRef.current) return;

    // Elements
    const elements: cytoscape.ElementDefinition[] = [];

    // Invisible start helper node for incoming arrow
    if (dfa.startState && dfa.states.includes(dfa.startState)) {
      elements.push({
        data: { id: '__start_anchor__', label: '' },
        classes: 'start-anchor',
      });
      elements.push({
        data: {
          id: '__start_arrow__',
          source: '__start_anchor__',
          target: dfa.startState,
          label: 'start',
        },
        classes: 'start-edge',
      });
    }

    // Nodes
    for (const state of dfa.states) {
      const isStart = state === dfa.startState;
      const isFinal = dfa.finalStates.includes(state);
      const isReachable = analysis ? analysis.reachableStates.includes(state) : true;
      const isDead = analysis ? analysis.deadStates.includes(state) : false;
      const isTrap = analysis ? analysis.trapStates.includes(state) : false;
      const isUnreachable = analysis ? analysis.unreachableStates.includes(state) : false;

      const classes: string[] = ['state-node'];
      if (isStart) classes.push('state-start');
      if (isFinal) classes.push('state-final');
      if (isUnreachable) classes.push('state-unreachable');
      if (isDead) classes.push('state-dead');
      if (isTrap) classes.push('state-trap');
      if (state === highlightedState || state === selectedNodeId) classes.push('state-highlight');

      elements.push({
        data: {
          id: state,
          label: state,
          isStart,
          isFinal,
          isReachable,
          isDead,
          isTrap,
          isUnreachable,
        },
        classes: classes.join(' '),
      });
    }

    // Edges
    for (const [key, edge] of Object.entries(edgeMap)) {
      const label = edge.symbols.sort().join(', ');
      const isSelfLoop = edge.source === edge.target;
      elements.push({
        data: {
          id: `edge_${key}`,
          source: edge.source,
          target: edge.target,
          label,
          isSelfLoop,
        },
        classes: isSelfLoop ? 'self-loop' : 'normal-edge',
      });
    }

    // Colors matching dark/light themes
    const bgColor = isDark ? '#0f172a' : '#f8fafc';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const nodeBgColor = isDark ? '#1e293b' : '#ffffff';
    const nodeBorderColor = isDark ? '#475569' : '#94a3b8';
    const edgeColor = isDark ? '#64748b' : '#64748b';
    const edgeTextColor = isDark ? '#38bdf8' : '#0284c7';

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      boxSelectionEnabled: false,
      autounselectify: false,
      style: [
        {
          selector: 'node.state-node',
          style: {
            'content': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-family': 'Fira Code, monospace',
            'font-size': '15px',
            'font-weight': 'bold',
            'color': textColor,
            'background-color': nodeBgColor,
            'border-width': 2.5,
            'border-color': nodeBorderColor,
            'width': 54,
            'height': 54,
            'transition-property': 'background-color, border-color, border-width, transform',
            'transition-duration': 0.2,
          },
        },
        {
          selector: 'node.state-start',
          style: {
            'border-color': '#10b981', // emerald
            'border-width': 3.5,
          },
        },
        {
          selector: 'node.state-final',
          style: {
            'border-style': 'double',
            'border-width': 7,
            'border-color': '#6366f1', // indigo
          },
        },
        {
          selector: 'node.state-start.state-final',
          style: {
            'border-style': 'double',
            'border-width': 7,
            'border-color': '#10b981', // emerald double
          },
        },
        {
          selector: 'node.state-unreachable',
          style: {
            'border-style': 'dashed',
            'border-color': '#f59e0b', // amber
            'color': isDark ? '#fbbf24' : '#b45309',
            'background-color': isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(254, 243, 199, 0.5)',
          },
        },
        {
          selector: 'node.state-dead',
          style: {
            'border-color': '#ef4444', // red
            'color': isDark ? '#f87171' : '#dc2626',
            'background-color': isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(254, 226, 226, 0.5)',
          },
        },
        {
          selector: 'node.state-trap',
          style: {
            'border-color': '#ec4899', // pink/magenta trap
            'border-width': 3.5,
            'background-color': isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(252, 231, 243, 0.6)',
          },
        },
        {
          selector: 'node.state-highlight, node:selected',
          style: {
            'border-color': '#38bdf8', // sky blue
            'border-width': 4.5,
            'background-color': isDark ? '#0369a1' : '#bae6fd',
          },
        },
        {
          selector: 'node.start-anchor',
          style: {
            'width': 1,
            'height': 1,
            'opacity': 0,
            'content': '',
          },
        },
        {
          selector: 'edge.start-edge',
          style: {
            'width': 2.5,
            'line-color': '#10b981',
            'target-arrow-color': '#10b981',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 1.4,
            'curve-style': 'straight',
            'content': 'start',
            'font-family': 'Fira Code, monospace',
            'font-size': '11px',
            'color': '#10b981',
            'text-margin-y': -10,
          },
        },
        {
          selector: 'edge.normal-edge',
          style: {
            'width': 2.2,
            'line-color': edgeColor,
            'target-arrow-color': edgeColor,
            'target-arrow-shape': 'triangle',
            'arrow-scale': 1.2,
            'curve-style': 'bezier',
            'control-point-step-size': 40,
            'content': 'data(label)',
            'font-family': 'Fira Code, monospace',
            'font-size': '12px',
            'font-weight': 'bold',
            'color': edgeTextColor,
            'text-background-color': isDark ? '#0f172a' : '#ffffff',
            'text-background-opacity': 0.85,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
          },
        },
        {
          selector: 'edge.self-loop',
          style: {
            'width': 2.2,
            'line-color': edgeColor,
            'target-arrow-color': edgeColor,
            'target-arrow-shape': 'triangle',
            'arrow-scale': 1.2,
            'curve-style': 'bezier',
            'loop-direction': '-45deg',
            'loop-sweep': '-90deg',
            'content': 'data(label)',
            'font-family': 'Fira Code, monospace',
            'font-size': '12px',
            'font-weight': 'bold',
            'color': edgeTextColor,
            'text-background-color': isDark ? '#0f172a' : '#ffffff',
            'text-background-opacity': 0.85,
            'text-background-padding': '3px',
          },
        },
      ],
    });

    // Tap node handler
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const nodeId = node.id();
      if (nodeId === '__start_anchor__') return;
      setSelectedNodeId(nodeId);
      onSelectState?.(nodeId);
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNodeId(null);
        onSelectState?.(null);
      }
    });

    // Run layout
    runLayout(cy, layoutMode, dfa.startState);

    // Responsive container resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (cyRef.current) {
        cyRef.current.resize();
        cyRef.current.fit(undefined, 30);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    cyRef.current = cy;

    return () => {
      resizeObserver.disconnect();
      cy.destroy();
    };
  }, [dfa, analysis, isDark, highlightedState]);

  const runLayout = (cy: Core, mode: 'breadthfirst' | 'circle' | 'cose', rootState?: string) => {
    if (!cy) return;

    let layoutOptions: any;

    if (mode === 'breadthfirst') {
      layoutOptions = {
        name: 'breadthfirst',
        directed: true,
        roots: rootState && cy.$id(rootState).length > 0 ? [cy.$id(rootState)] : undefined,
        padding: 40,
        spacingFactor: 1.5,
        animate: true,
        animationDuration: 300,
      };
    } else if (mode === 'circle') {
      layoutOptions = {
        name: 'circle',
        padding: 40,
        animate: true,
        animationDuration: 300,
      };
    } else {
      layoutOptions = {
        name: 'cose',
        animate: true,
        animationDuration: 350,
        padding: 40,
        nodeOverlap: 25,
        idealEdgeLength: 80,
      };
    }

    const layout = cy.layout(layoutOptions);

    layout.one('layoutstop', () => {
      if (rootState && cy.$id(rootState).length > 0 && cy.$id('__start_anchor__').length > 0) {
        const startPos = cy.$id(rootState).position();
        cy.$id('__start_anchor__').position({
          x: startPos.x - 70,
          y: startPos.y,
        });
      }
      cy.fit(undefined, 30);
    });

    layout.run();
  };

  const handleZoomIn = () => {
    cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  };

  const handleZoomOut = () => {
    cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  };

  const handleFit = () => {
    cyRef.current?.fit(undefined, 35);
  };

  const handleResetLayout = () => {
    if (cyRef.current) {
      runLayout(cyRef.current, layoutMode, dfa.startState);
      cyRef.current.fit(undefined, 35);
    }
  };

  const handleExportPNG = () => {
    if (!cyRef.current) return;
    const png64 = cyRef.current.png({ full: true, scale: 2, bg: isDark ? '#0f172a' : '#ffffff' });
    const link = document.createElement('a');
    link.href = png64;
    link.download = `${title || 'dfa'}-graph.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleModeChange = (mode: 'breadthfirst' | 'circle' | 'cose') => {
    setLayoutMode(mode);
    if (cyRef.current) {
      runLayout(cyRef.current, mode, dfa.startState);
    }
  };

  return (
    <div className={`relative flex flex-col rounded-xl border ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    } shadow-sm overflow-hidden`}>
      {/* Graph Toolbar */}
      <div className={`flex flex-wrap items-center justify-between px-4 py-3 border-b gap-2 ${
        isDark ? 'border-slate-800/80 bg-slate-900/60' : 'border-slate-100 bg-slate-50/70'
      }`}>
        <div className="flex items-center gap-2">
          {title && (
            <h3 className={`font-semibold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {title}
            </h3>
          )}
          <span className="text-xs text-slate-500 font-mono">
            {dfa.states.length} states · {Object.keys(edgeMap).length} transitions
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Layout Mode segmented control */}
          <div className={`flex items-center p-0.5 rounded-lg border ${
            isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => handleModeChange('breadthfirst')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                layoutMode === 'breadthfirst'
                  ? isDark ? 'bg-slate-700 text-sky-400 shadow-sm' : 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Hierarchical BFS flow layout"
            >
              Flow
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('cose')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                layoutMode === 'cose'
                  ? isDark ? 'bg-slate-700 text-sky-400 shadow-sm' : 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Organic force-directed layout"
            >
              Organic
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('circle')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                layoutMode === 'circle'
                  ? isDark ? 'bg-slate-700 text-sky-400 shadow-sm' : 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Circular ring layout"
            >
              Circle
            </button>
          </div>

          <div className="h-4 w-px bg-slate-700/50 mx-0.5" />

          {/* Action buttons */}
          <button
            type="button"
            onClick={handleZoomIn}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isDark
                ? 'border-slate-800 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
            }`}
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isDark
                ? 'border-slate-800 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
            }`}
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleFit}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isDark
                ? 'border-slate-800 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
            }`}
            title="Fit to Canvas"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetLayout}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isDark
                ? 'border-slate-800 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
            }`}
            title="Reset Positions"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleExportPNG}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isDark
                ? 'border-slate-800 bg-slate-800/80 text-emerald-400 hover:bg-slate-700'
                : 'border-slate-200 bg-white text-emerald-600 hover:bg-slate-100'
            }`}
            title="Export High-Res PNG"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Graph Canvas Container */}
      <div
        ref={containerRef}
        style={{ height }}
        className={`w-full relative transition-colors ${
          isDark ? 'bg-slate-950/70' : 'bg-slate-50/50'
        }`}
      />

      {/* Graph Legend Footer */}
      <div className={`px-4 py-2 border-t flex flex-wrap items-center justify-between text-[11px] gap-2 ${
        isDark ? 'border-slate-800/80 bg-slate-900/40 text-slate-400' : 'border-slate-100 bg-slate-50/80 text-slate-500'
      }`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-300">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-emerald-500/20 inline-block" />
            <span>Start (q₀)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-500/20 inline-block" />
            <span>Accepting (F)</span>
          </div>
          {!isPruned && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-dashed border-amber-500 bg-amber-500/20 inline-block" />
                <span>Unreachable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-red-500 bg-red-500/20 inline-block" />
                <span>Dead State</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-pink-500 bg-pink-500/20 inline-block" />
                <span>Trap State</span>
              </div>
            </>
          )}
          {isPruned && (
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>Pruned (Only Reachable &amp; Useful)</span>
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-500">
          Tip: Drag nodes to rearrange · Scroll to zoom
        </div>
      </div>
    </div>
  );
};
