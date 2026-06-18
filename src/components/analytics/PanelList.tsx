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
    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 shadow-sm transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Grid className="w-5 h-5 text-emerald-500" />
          Solar Panel Breakdown
        </h3>
        
        {/* Table Selector Filters */}
        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200/30 dark:border-slate-800/30 text-[11px]">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 font-medium rounded-md transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            All Arrays
          </button>
          <button
            onClick={() => setActiveTab('table-1')}
            className={`px-3 py-1 font-medium rounded-md transition-all ${
              activeTab === 'table-1'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Array Alpha
          </button>
          <button
            onClick={() => setActiveTab('table-2')}
            className={`px-3 py-1 font-medium rounded-md transition-all ${
              activeTab === 'table-2'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
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
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-1">
                {table.name}
              </h4>
              
              <div className="flex flex-col gap-2.5">
                {table.panels.map((panel, idx) => {
                  const letter = String.fromCharCode(65 + idx); // A, B, C, D, E, F

                  
                  return (
                    <div 
                      key={panel.id}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/30 dark:hover:bg-slate-900/30 transition-all"
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
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 dark:text-slate-400">Shading:</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{panel.shadedPercentage}%</span>
                          </div>
                          <div className="w-full h-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 transition-all duration-300"
                              style={{ width: `${panel.shadedPercentage}%` }}
                            />
                          </div>

                          {/* EOF */}
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-slate-500 dark:text-slate-400">Edge Occlusion (EOF):</span>
                            <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                              {getRiskIcon(panel.eofRisk)}
                              <span>{panel.eofPercentage}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: 10x10 Shading Heatmap Grid */}
                      <div className="flex flex-col items-center gap-1.5 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/50 pt-2.5 md:pt-0 md:pl-4 self-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Silicon Cell Map</span>
                        <div className="grid grid-cols-10 gap-0.5 p-1 rounded-lg bg-slate-900 border border-slate-850 dark:border-slate-800 shadow-inner">
                          {panel.shadedFlags.map((shaded, sIdx) => {
                            // Split into vertical thirds (substrings)
                            const col = sIdx % 10;
                            const isDiodeTriggered = 
                              (col <= 2 && panel.shadedPercentage > 5 && panel.efficiency < 85) ||
                              (col >= 3 && col <= 6 && panel.shadedPercentage > 5 && panel.efficiency < 85) ||
                              (col >= 7 && panel.shadedPercentage > 5 && panel.efficiency < 85);
                            
                            let cellBg = 'bg-emerald-500 shadow-emerald-500/20';
                            if (shaded) {
                              cellBg = 'bg-rose-500 shadow-rose-500/30';
                            } else if (isDiodeTriggered) {
                              cellBg = 'bg-amber-500/90 shadow-amber-500/20'; // diode-bypassed cell
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
