import React from 'react';
import { useStore } from '../../store/useStore';
import { FileSpreadsheet, FileJson } from 'lucide-react';

export const ReportExporter: React.FC = () => {
  const summary = useStore((state) => state.summary);
  const tables = useStore((state) => state.tables);
  const obstacles = useStore((state) => state.obstacles);
  const selectedLocation = useStore((state) => state.selectedLocation);
  const autoDateTimestamp = useStore((state) => state.autoDateTimestamp);
  const simulationMode = useStore((state) => state.simulationMode);

  const getPanelLetter = (index: number) => String.fromCharCode(65 + index);

  const exportCSV = () => {
    const dateStr = new Date(autoDateTimestamp).toLocaleString();
    
    // 1. Meta / Summary Headers
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'GRID ZERO - SOLAR SHADOW ANALYSIS REPORT\n';
    csvContent += `Generated: ${new Date().toLocaleString()}\n`;
    csvContent += `Location: ${selectedLocation.name} (Lat: ${selectedLocation.latitude}, Lon: ${selectedLocation.longitude})\n`;
    csvContent += `Simulation Time: ${simulationMode === 'auto' ? dateStr : 'Manual Mode Slider'}\n`;
    csvContent += `\n`;
    csvContent += '--- SITE OVERALL METRICS ---\n';
    csvContent += `Site Efficiency (%),Average Shadow (%),Average EOF (%),Site Risk Level\n`;
    csvContent += `${summary.avgEfficiency},${summary.avgShadow},${summary.avgEOF},${summary.siteRisk.toUpperCase()}\n`;
    csvContent += `Array Alpha Efficiency (%),${summary.table1Efficiency}\n`;
    csvContent += `Array Beta Efficiency (%),${summary.table2Efficiency}\n`;
    csvContent += `\n`;
    
    // 2. Obstacles Data
    csvContent += '--- OBSTACLE CONFIGURATIONS ---\n';
    csvContent += `ID,Name,Type,Position X,Position Y,Dimensions\n`;
    obstacles.forEach((obs) => {
      const dim = obs.type === 'building' 
        ? `W: ${obs.width}m | L: ${obs.length}m | H: ${obs.height}m` 
        : `R: ${obs.radius}m | H: ${obs.height}m`;
      csvContent += `${obs.id},"${obs.name}",${obs.type.toUpperCase()},${obs.x},${obs.y},"${dim}"\n`;
    });
    csvContent += `\n`;

    // 3. Detailed Panel Data
    csvContent += '--- DETAILED PANEL OCULUSION ANALYSIS ---\n';
    csvContent += `Table,Panel,Shading (%),Edge Occlusion (EOF %),EOF Risk Level,Relative Efficiency (%)\n`;
    
    tables.forEach((table) => {
      table.panels.forEach((panel) => {
        csvContent += `"${table.name}",Panel ${getPanelLetter(panel.index)},${panel.shadedPercentage},${panel.eofPercentage},${panel.eofRisk.toUpperCase()},${panel.efficiency}\n`;
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `grid_zero_analysis_${selectedLocation.name.toLowerCase().replace(/[\s,]+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const dateStr = new Date(autoDateTimestamp).toLocaleString();
    const reportData = {
      reportMeta: {
        title: 'Grid Zero Solar Shadow Analysis Report',
        timestamp: new Date().toISOString(),
        location: selectedLocation,
        simulationMode,
        simulationTime: simulationMode === 'auto' ? dateStr : 'Manual Slider Mode'
      },
      siteAnalytics: summary,
      obstacles: obstacles,
      detailedBreakdown: tables.map((t) => ({
        id: t.id,
        name: t.name,
        position: { x: t.x, y: t.y },
        tilt: t.tilt,
        panels: t.panels.map((p) => ({
          label: `Panel ${getPanelLetter(p.index)}`,
          index: p.index,
          shadedPercentage: p.shadedPercentage,
          eofPercentage: p.eofPercentage,
          eofRisk: p.eofRisk,
          efficiency: p.efficiency
        }))
      }))
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `grid_zero_analysis_${selectedLocation.name.toLowerCase().replace(/[\s,]+/g, '_')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3.5 mt-2">
      <button
        onClick={exportCSV}
        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-white/40 dark:bg-slate-900/40 hover:bg-white/60 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-850/50 hover:border-emerald-500/20 dark:hover:border-emerald-400/20 shadow-sm transition-all duration-200 cursor-pointer scale-100 active:scale-95"
      >
        <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
        Export CSV Dataset
      </button>
      <button
        onClick={exportJSON}
        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-white/40 dark:bg-slate-900/40 hover:bg-white/60 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-850/50 hover:border-amber-500/20 dark:hover:border-amber-400/20 shadow-sm transition-all duration-200 cursor-pointer scale-100 active:scale-95"
      >
        <FileJson className="w-4 h-4 text-amber-500" />
        Export JSON Report
      </button>
    </div>
  );
};
