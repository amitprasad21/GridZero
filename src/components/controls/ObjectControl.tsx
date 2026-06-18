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
    <div className="flex flex-col gap-5 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-500" />
          Object Controller
        </h3>
      </div>

      {/* 1. If an Obstacle/Building is selected */}
      {selectedObstacle && selectedObstacle.type === 'building' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
            <Box className="w-5 h-5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider">Building Selected</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedObstacle.name}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            {/* Position X */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3 h-3" /> Position X (East-West)</span>
                <span className="font-semibold">{selectedObstacle.x.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={selectedObstacle.x}
                onChange={(e) => updateObstacle(selectedObstacle.id, { x: Number(e.target.value) })}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Position Y / Z */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3 h-3" /> Position Y (North-South)</span>
                <span className="font-semibold">{selectedObstacle.y.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={selectedObstacle.y}
                onChange={(e) => updateObstacle(selectedObstacle.id, { y: Number(e.target.value) })}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Width */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Sliders className="w-3 h-3" /> Width (X Axis)</span>
                <span className="font-semibold">{(selectedObstacle as Building).width.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.1"
                value={(selectedObstacle as Building).width}
                onChange={(e) => updateObstacle(selectedObstacle.id, { width: Number(e.target.value) })}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Length */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Sliders className="w-3 h-3" /> Length (Z Axis)</span>
                <span className="font-semibold">{(selectedObstacle as Building).length.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.1"
                value={(selectedObstacle as Building).length}
                onChange={(e) => updateObstacle(selectedObstacle.id, { length: Number(e.target.value) })}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Height */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Sliders className="w-3 h-3" /> Height (Y Axis)</span>
                <span className="font-semibold">{(selectedObstacle as Building).height.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={(selectedObstacle as Building).height}
                onChange={(e) => updateObstacle(selectedObstacle.id, { height: Number(e.target.value) })}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. If a Water Tank is selected */}
      {selectedObstacle && selectedObstacle.type === 'tank' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
            <Layers className="w-5 h-5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider">Water Tank Selected</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedObstacle.name}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            {/* Position X */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3 h-3" /> Position X (East-West)</span>
                <span className="font-semibold">{selectedObstacle.x.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={selectedObstacle.x}
                onChange={(e) => updateObstacle(selectedObstacle.id, { x: Number(e.target.value) })}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Position Y / Z */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3 h-3" /> Position Y (North-South)</span>
                <span className="font-semibold">{selectedObstacle.y.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={selectedObstacle.y}
                onChange={(e) => updateObstacle(selectedObstacle.id, { y: Number(e.target.value) })}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Radius */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Sliders className="w-3 h-3" /> Radius</span>
                <span className="font-semibold">{(selectedObstacle as WaterTank).radius.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.05"
                value={(selectedObstacle as WaterTank).radius}
                onChange={(e) => updateObstacle(selectedObstacle.id, { radius: Number(e.target.value) })}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Height */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Sliders className="w-3 h-3" /> Height</span>
                <span className="font-semibold">{(selectedObstacle as WaterTank).height.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={(selectedObstacle as WaterTank).height}
                onChange={(e) => updateObstacle(selectedObstacle.id, { height: Number(e.target.value) })}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. If a Solar Table is selected */}
      {selectedTable && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
            <Grid className="w-5 h-5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider">Solar Array Selected</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedTable.name}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            {/* Position X */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3 h-3" /> Position X (East-West)</span>
                <span className="font-semibold">{selectedTable.x.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={selectedTable.x}
                onChange={(e) => updateTablePosition(selectedTable.id, Number(e.target.value), selectedTable.y)}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Position Y / Z */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3 h-3" /> Position Y (North-South)</span>
                <span className="font-semibold">{selectedTable.y.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={selectedTable.y}
                onChange={(e) => updateTablePosition(selectedTable.id, selectedTable.x, Number(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Elevation */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3 h-3" /> Elevation (Rooftop Height)</span>
                <span className="font-semibold">{selectedTable.elevation.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="6.0"
                step="0.1"
                value={selectedTable.elevation}
                onChange={(e) => updateTableElevation(selectedTable.id, Number(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Default State (No selection) */}
      {!selectedObstacle && !selectedTable && (
        <div className="flex flex-col gap-4 text-center py-2">
          <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            Select any object in the 3D scene to configure its position and dimensions. Or choose one from the lists below:
          </p>
        </div>
      )}

      {/* List of all objects in the scene for direct selection */}
      <div className="flex flex-col gap-2 border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
          Scene Elements
        </p>
        
        {/* List Tables */}
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => handleSelectObject(table.id, true)}
            className={`w-full flex items-center justify-between text-xs py-2 px-3 rounded-lg border transition-all ${
              selectedTableId === table.id
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm'
                : 'border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Grid className="w-3.5 h-3.5" />
              {table.name}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              [{table.x.toFixed(0)}, {table.y.toFixed(0)}]
            </span>
          </button>
        ))}

        {/* List Obstacles */}
        {obstacles.map((obs) => (
          <button
            key={obs.id}
            onClick={() => handleSelectObject(obs.id, false)}
            className={`w-full flex items-center justify-between text-xs py-2 px-3 rounded-lg border transition-all ${
              selectedObstacleId === obs.id
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm'
                : 'border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              {obs.type === 'building' ? <Box className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
              {obs.name}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              [{obs.x.toFixed(0)}, {obs.y.toFixed(0)}]
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
