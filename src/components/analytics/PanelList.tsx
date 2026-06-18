import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { RiskLevel } from '../../types';
import { ShieldCheck, ShieldAlert, Grid } from 'lucide-react';

export const PanelList: React.FC = () => {
  const tables = useStore((state) => state.tables);
  const [activeTab, setActiveTab] = useState<'all' | 'table-1' | 'table-2'>('all');

  const getEfficiencyColor = (eff: number) => {
    if (eff >= 80) return 'text-emerald-500 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (eff >= 50) return 'text-amber-500 dark:text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-rose-500 dark:text-rose-400 border-rose-500/20 bg-rose-500/5';
  };

  const getRiskIcon = (risk: RiskLevel) => {
    switch (risk) {
      case 'high':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />;
      case 'medium':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />;
      case 'low':
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };



  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl glass-panel shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/50 dark:border-slate-850/50 pb-3">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Grid className="w-5 h-5 text-emerald-500" />
          Solar Panel Breakdown
        </h3>
        
        {/* Table Selector Filters */}
        <div className="flex bg-slate-100/50 dark:bg-slate-950/60 rounded-xl p-0.5 border border-slate-200/40 dark:border-slate-800/40 shadow-inner text-[10px]">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200/20 dark:border-slate-800/20 scale-[1.02]'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-250 hover:scale-[1.01]'
            }`}
          >
            All Arrays
          </button>
          <button
            onClick={() => setActiveTab('table-1')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === 'table-1'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200/20 dark:border-slate-800/20 scale-[1.02]'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-250 hover:scale-[1.01]'
            }`}
          >
            Array Alpha
          </button>
          <button
            onClick={() => setActiveTab('table-2')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === 'table-2'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200/20 dark:border-slate-800/20 scale-[1.02]'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-250 hover:scale-[1.01]'
            }`}
          >
            Array Beta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
        {tables
          .filter((t) => activeTab === 'all' || t.id === activeTab)
          .map((table) => (
            <div key={table.id} className="flex flex-col gap-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1.5 mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {table.name}
              </h4>
              
              <div className="flex flex-col gap-2.5">
                {table.panels.map((panel, idx) => {
                  const letter = String.fromCharCode(65 + idx); // A, B, C, D, E, F

                  return (
                    <div 
                      key={panel.id}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-900/50 bg-white/20 dark:bg-slate-900/20 hover:border-emerald-500/15 dark:hover:border-emerald-400/10 hover:bg-white/40 dark:hover:bg-slate-900/30 transition-all duration-250"
                    >
                      {/* Left Side: Metrics */}
                      <div className="flex-1 flex flex-col gap-2">
                        {/* Name and efficiency status */}
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Panel {letter}
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getEfficiencyColor(panel.efficiency)}`}>
                              {panel.efficiency}% Eff
                            </span>
                          </div>
                        </div>

                        {/* Metrics bar */}
                        <div className="flex flex-col gap-1.5 text-[10px]">
                          {/* Shading */}
                          <div className="flex justify-between items-center font-semibold">
                            <span className="text-slate-505 dark:text-slate-400">Shading:</span>
                            <span className="text-slate-700 dark:text-slate-300">{panel.shadedPercentage}%</span>
                          </div>
                          <div className="w-full h-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300 shadow-sm"
                              style={{ width: `${panel.shadedPercentage}%` }}
                            />
                          </div>

                          {/* EOF */}
                          <div className="flex justify-between items-center mt-1 font-semibold">
                            <span className="text-slate-505 dark:text-slate-400">Edge Occlusion (EOF):</span>
                            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                              {getRiskIcon(panel.eofRisk)}
                              <span>{panel.eofPercentage}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: 10x10 Shading Heatmap Grid */}
                      <div className="flex flex-col items-center gap-2 border-t md:border-t-0 md:border-l border-slate-200/50 dark:border-slate-850/50 pt-2.5 md:pt-0 md:pl-4 self-center">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Silicon Cell Map</span>
                        <div className="grid grid-cols-10 gap-0.5 p-1.5 rounded-xl bg-slate-950 border border-slate-900 dark:border-slate-850 shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)]">
                          {panel.shadedFlags.map((shaded, sIdx) => {
                            // Split into vertical thirds
                            const col = sIdx % 10;
                            const isDiodeTriggered = 
                              (col <= 2 && panel.shadedPercentage > 5 && panel.efficiency < 85) ||
                              (col >= 3 && col <= 6 && panel.shadedPercentage > 5 && panel.efficiency < 85) ||
                              (col >= 7 && panel.shadedPercentage > 5 && panel.efficiency < 85);
                            
                            let cellBg = 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.5)]';
                            if (shaded) {
                              cellBg = 'bg-rose-500 dark:bg-rose-455 shadow-[0_0_4px_rgba(244,63,94,0.5)] animate-pulse';
                            } else if (isDiodeTriggered) {
                              cellBg = 'bg-amber-500 dark:bg-amber-455 shadow-[0_0_4px_rgba(245,158,11,0.5)]';
                            }
                            
                            return (
                              <div
                                key={sIdx}
                                className={`w-1.5 h-1.5 rounded-xs transition-colors duration-300 ${cellBg} shadow-sm`}
                                title={shaded ? 'Shaded Cell' : isDiodeTriggered ? 'Diode Bypassed Cell' : 'Active Cell'}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
