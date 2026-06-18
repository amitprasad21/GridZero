import React from 'react';
import { useStore } from '../../store/useStore';
import { Building, WaterTank } from '../../types';
import { Move, Settings, Sliders, Box, Layers, Grid } from 'lucide-react';

export const ObjectControl: React.FC = () => {
  const tables = useStore((state) => state.tables);
  const obstacles = useStore((state) => state.obstacles);
  
  const selectedObstacleId = useStore((state) => state.selectedObstacleId);
  const setSelectedObstacleId = useStore((state) => state.setSelectedObstacleId);
  
  const selectedTableId = useStore((state) => state.selectedTableId);
  const setSelectedTableId = useStore((state) => state.setSelectedTableId);
  
  const updateObstacle = useStore((state) => state.updateObstacle);
  const updateTablePosition = useStore((state) => state.updateTablePosition);
  const updateTableElevation = useStore((state) => state.updateTableElevation);

  // Retrieve active selected target
  const selectedObstacle = obstacles.find((o) => o.id === selectedObstacleId);
  const selectedTable = tables.find((t) => t.id === selectedTableId);

  const handleSelectObject = (id: string, isTable: boolean) => {
    if (isTable) {
      setSelectedTableId(id);
    } else {
      setSelectedObstacleId(id);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-5 rounded-2xl glass-panel shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-850/50 pb-3">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-500 animate-pulse" />
          Object Controller
        </h3>
      </div>

      {/* 1. If an Obstacle/Building is selected */}
      {selectedObstacle && selectedObstacle.type === 'building' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
            <Box className="w-5 h-5 animate-pulse text-emerald-500" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider opacity-75">Building Selected</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedObstacle.name}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Position X */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5" /> Position X (East-West)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedObstacle.x.toFixed(1)}m</span>
              </div>
              <div className="py-1">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.1"
                  value={selectedObstacle.x}
                  onChange={(e) => updateObstacle(selectedObstacle.id, { x: Number(e.target.value) })}
                  className="w-full slider-input cursor-pointer"
                />
              </div>
            </div>

            {/* Position Y / Z */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5" /> Position Y (North-South)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedObstacle.y.toFixed(1)}m</span>
              </div>
              <div className="py-1">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.1"
                  value={selectedObstacle.y}
                  onChange={(e) => updateObstacle(selectedObstacle.id, { y: Number(e.target.value) })}
                  className="w-full slider-input cursor-pointer"
                />
              </div>
            </div>

            {/* Width */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5" /> Width (X Axis)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{(selectedObstacle as Building).width.toFixed(1)}m</span>
              </div>
              <div className="py-1">
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.1"
                  value={(selectedObstacle as Building).width}
                  onChange={(e) => updateObstacle(selectedObstacle.id, { width: Number(e.target.value) })}
                  className="w-full slider-input cursor-pointer"
                />
              </div>
            </div>

            {/* Length */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5" /> Length (Z Axis)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{(selectedObstacle as Building).length.toFixed(1)}m</span>
              </div>
              <div className="py-1">
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.1"
                  value={(selectedObstacle as Building).length}
                  onChange={(e) => updateObstacle(selectedObstacle.id, { length: Number(e.target.value) })}
                  className="w-full slider-input cursor-pointer"
                />
              </div>
            </div>

            {/* Height */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5" /> Height (Y Axis)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{(selectedObstacle as Building).height.toFixed(1)}m</span>
              </div>
              <div className="py-1">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={(selectedObstacle as Building).height}
                  onChange={(e) => updateObstacle(selectedObstacle.id, { height: Number(e.target.value) })}
                  className="w-full slider-input cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. If a Water Tank is selected */}
      {selectedObstacle && selectedObstacle.type === 'tank' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
            <Layers className="w-5 h-5 text-emerald-500 animate-pulse" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider opacity-75">Water Tank Selected</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedObstacle.name}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Position X */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5" /> Position X (East-West)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedObstacle.x.toFixed(1)}m</span>
              </div>
              <div className="py-1">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.1"
                  value={selectedObstacle.x}
                  onChange={(e) => updateObstacle(selectedObstacle.id, { x: Number(e.target.value) })}
                  className="w-full slider-input cursor-pointer"
                />
              </div>
            </div>

            {/* Position Y / Z */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5" /> Position Y (North-South)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedObstacle.y.toFixed(1)}m</span>
              </div>
              <div className="py-1">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.1"
                  value={selectedObstacle.y}
                  onChange={(e) => updateObstacle(selectedObstacle.id, { y: Number(e.target.value) })}
                  className="w-full slider-input cursor-pointer"
                />
              </div>
            </div>

            {/* Radius */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5" /> Radius</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{(selectedObstacle as WaterTank).radius.toFixed(1)}m</span>
              </div>
              <div className="py-1">
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.05"
                  value={(selectedObstacle as WaterTank).radius}
                  onChange={(e) => updateObstacle(selectedObstacle.id, { radius: Number(e.target.value) })}
                  className="w-full slider-input cursor-pointer"
                />
              </div>
            </div>

            {/* Height */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5" /> Height</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{(selectedObstacle as WaterTank).height.toFixed(1)}m</span>
              </div>
              <div className="py-1">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={(selectedObstacle as WaterTank).height}
                  onChange={(e) => updateObstacle(selectedObstacle.id, { height: Number(e.target.value) })}
                  className="w-full slider-input cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. If a Solar Table is selected */}
      {selectedTable && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
            <Grid className="w-5 h-5 text-emerald-500 animate-pulse" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider opacity-75">Solar Array Selected</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedTable.name}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Position X */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5" /> Position X (East-West)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedTable.x.toFixed(1)}m</span>
              </div>
              <div className="py-1">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.1"
                  value={selectedTable.x}
                  onChange={(e) => updateTablePosition(selectedTable.id, Number(e.target.value), selectedTable.y)}
                  className="w-full slider-input cursor-pointer"
                />
              </div>
            </div>

            {/* Position Y / Z */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5" /> Position Y (North-South)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedTable.y.toFixed(1)}m</span>
              </div>
              <div className="py-1">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.1"
                  value={selectedTable.y}
                  onChange={(e) => updateTablePosition(selectedTable.id, selectedTable.x, Number(e.target.value))}
                  className="w-full slider-input cursor-pointer"
                />
              </div>
            </div>

            {/* Elevation */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5" /> Elevation (Rooftop Height)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedTable.elevation.toFixed(1)}m</span>
              </div>
              <div className="py-1">
                <input
                  type="range"
                  min="0.8"
                  max="6.0"
                  step="0.1"
                  value={selectedTable.elevation}
                  onChange={(e) => updateTableElevation(selectedTable.id, Number(e.target.value))}
                  className="w-full slider-input cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Default State (No selection) */}
      {!selectedObstacle && !selectedTable && (
        <div className="flex flex-col gap-4 text-center py-2">
          <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
            Select any object in the 3D scene to configure its position and dimensions. Or choose one from the lists below:
          </p>
        </div>
      )}

      {/* List of all objects in the scene for direct selection */}
      <div className="flex flex-col gap-2 border-t border-slate-200/50 dark:border-slate-850/50 pt-4">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
          Scene Elements
        </p>
        
        {/* List Tables */}
        {tables.map((table) => {
          const isSelected = selectedTableId === table.id;
          return (
            <button
              key={table.id}
              onClick={() => handleSelectObject(table.id, true)}
              className={`w-full flex items-center justify-between text-xs py-2.5 px-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 font-bold shadow-sm scale-[1.01]'
                  : 'border-slate-200/40 dark:border-slate-850/40 bg-slate-50/30 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/50'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Grid className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
                {table.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-955 px-1.5 py-0.5 rounded-md">
                  [{table.x.toFixed(0)}, {table.y.toFixed(0)}]
                </span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </div>
            </button>
          );
        })}

        {/* List Obstacles */}
        {obstacles.map((obs) => {
          const isSelected = selectedObstacleId === obs.id;
          return (
            <button
              key={obs.id}
              onClick={() => handleSelectObject(obs.id, false)}
              className={`w-full flex items-center justify-between text-xs py-2.5 px-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 font-bold shadow-sm scale-[1.01]'
                  : 'border-slate-200/40 dark:border-slate-850/40 bg-slate-50/30 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/50'
              }`}
            >
              <span className="flex items-center gap-2.5">
                {obs.type === 'building' ? (
                  <Box className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
                ) : (
                  <Layers className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
                )}
                {obs.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-955 px-1.5 py-0.5 rounded-md">
                  [{obs.x.toFixed(0)}, {obs.y.toFixed(0)}]
                </span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
