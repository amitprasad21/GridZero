import React from 'react';
import { useStore } from '../../store/useStore';
import { Building, WaterTank } from '../../types';
import { 
  Move, 
  Settings, 
  Sliders, 
  Box, 
  Layers, 
  Grid, 
  Copy, 
  Trash2, 
  Plus, 
  RefreshCw, 
  ArrowLeft 
} from 'lucide-react';

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

  const addTable = useStore((state) => state.addTable);
  const removeTable = useStore((state) => state.removeTable);
  const addObstacle = useStore((state) => state.addObstacle);
  const removeObstacle = useStore((state) => state.removeObstacle);
  const duplicateObject = useStore((state) => state.duplicateObject);
  const resetScenario = useStore((state) => state.resetScenario);

  // Retrieve active selected target
  const selectedObstacle = obstacles.find((o) => o.id === selectedObstacleId);
  const selectedTable = tables.find((t) => t.id === selectedTableId);

  const handleSelectObject = (id: string, isTable: boolean) => {
    if (isTable) {
      setSelectedTableId(id);
      setSelectedObstacleId(null);
    } else {
      setSelectedObstacleId(id);
      setSelectedTableId(null);
    }
  };

  const handleClearSelection = () => {
    setSelectedTableId(null);
    setSelectedObstacleId(null);
  };

  return (
    <div className="flex flex-col gap-5 p-5 rounded-2xl glass-panel shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-850/50 pb-3">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-500 animate-pulse" />
          {selectedObstacle || selectedTable ? 'Properties Inspector' : 'Object & Layout Customizer'}
        </h3>
        {(selectedObstacle || selectedTable) && (
          <button
            onClick={handleClearSelection}
            className="flex items-center gap-1 text-[10px] font-bold py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200/50 dark:border-slate-800 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 font-sans"
            aria-label="Back to object list"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        )}
      </div>

      {/* CASE 1: selected building */}
      {selectedObstacle && selectedObstacle.type === 'building' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
            <div className="flex items-center gap-2.5">
              <Box className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider opacity-75">Building Configuration</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedObstacle.name}</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm(`Delete ${selectedObstacle.name}?`)) {
                  removeObstacle(selectedObstacle.id);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-rose-500/15 text-rose-500 dark:text-rose-455 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500"
              title="Delete Building"
              aria-label={`Delete ${selectedObstacle.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {/* Position X */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5" /> Position X (East-West)</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={Number(selectedObstacle.x.toFixed(1))}
                    step="0.1"
                    min="-12"
                    max="12"
                    onChange={(e) => updateObstacle(selectedObstacle.id, { x: Number(e.target.value) })}
                    className="w-16 px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 rounded bg-white/40 dark:bg-slate-905/40 text-right text-[10px] font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label="Building X coordinate"
                  />
                  <span className="text-[10px] text-slate-405 font-bold font-mono">m</span>
                </div>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={selectedObstacle.x}
                onChange={(e) => updateObstacle(selectedObstacle.id, { x: Number(e.target.value) })}
                className="w-full slider-input cursor-pointer"
                aria-label="Building X coordinate slider"
              />
            </div>

            {/* Position Y */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5" /> Position Y (North-South)</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={Number(selectedObstacle.y.toFixed(1))}
                    step="0.1"
                    min="-12"
                    max="12"
                    onChange={(e) => updateObstacle(selectedObstacle.id, { y: Number(e.target.value) })}
                    className="w-16 px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 rounded bg-white/40 dark:bg-slate-905/40 text-right text-[10px] font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label="Building Y coordinate"
                  />
                  <span className="text-[10px] text-slate-405 font-bold font-mono">m</span>
                </div>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={selectedObstacle.y}
                onChange={(e) => updateObstacle(selectedObstacle.id, { y: Number(e.target.value) })}
                className="w-full slider-input cursor-pointer"
                aria-label="Building Y coordinate slider"
              />
            </div>

            {/* Width */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5" /> Width (X Axis)</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={Number((selectedObstacle as Building).width.toFixed(1))}
                    step="0.1"
                    min="1"
                    max="10"
                    onChange={(e) => updateObstacle(selectedObstacle.id, { width: Number(e.target.value) })}
                    className="w-16 px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 rounded bg-white/40 dark:bg-slate-905/40 text-right text-[10px] font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label="Building width"
                  />
                  <span className="text-[10px] text-slate-405 font-bold font-mono">m</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={(selectedObstacle as Building).width}
                onChange={(e) => updateObstacle(selectedObstacle.id, { width: Number(e.target.value) })}
                className="w-full slider-input cursor-pointer"
                aria-label="Building width slider"
              />
            </div>

            {/* Length */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5" /> Length (Z Axis)</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={Number((selectedObstacle as Building).length.toFixed(1))}
                    step="0.1"
                    min="1"
                    max="10"
                    onChange={(e) => updateObstacle(selectedObstacle.id, { length: Number(e.target.value) })}
                    className="w-16 px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 rounded bg-white/40 dark:bg-slate-905/40 text-right text-[10px] font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label="Building length"
                  />
                  <span className="text-[10px] text-slate-405 font-bold font-mono">m</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={(selectedObstacle as Building).length}
                onChange={(e) => updateObstacle(selectedObstacle.id, { length: Number(e.target.value) })}
                className="w-full slider-input cursor-pointer"
                aria-label="Building length slider"
              />
            </div>

            {/* Height */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5" /> Height</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={Number((selectedObstacle as Building).height.toFixed(1))}
                    step="0.1"
                    min="1"
                    max="10"
                    onChange={(e) => updateObstacle(selectedObstacle.id, { height: Number(e.target.value) })}
                    className="w-16 px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 rounded bg-white/40 dark:bg-slate-905/40 text-right text-[10px] font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label="Building height"
                  />
                  <span className="text-[10px] text-slate-405 font-bold font-mono">m</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={(selectedObstacle as Building).height}
                onChange={(e) => updateObstacle(selectedObstacle.id, { height: Number(e.target.value) })}
                className="w-full slider-input cursor-pointer"
                aria-label="Building height slider"
              />
            </div>
          </div>
        </div>
      )}

      {/* CASE 2: selected water tank */}
      {selectedObstacle && selectedObstacle.type === 'tank' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider opacity-75">Water Tank Configuration</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedObstacle.name}</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm(`Delete ${selectedObstacle.name}?`)) {
                  removeObstacle(selectedObstacle.id);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-rose-500/15 text-rose-500 dark:text-rose-455 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500"
              title="Delete Water Tank"
              aria-label={`Delete ${selectedObstacle.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {/* Position X */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5" /> Position X (East-West)</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={Number(selectedObstacle.x.toFixed(1))}
                    step="0.1"
                    min="-12"
                    max="12"
                    onChange={(e) => updateObstacle(selectedObstacle.id, { x: Number(e.target.value) })}
                    className="w-16 px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 rounded bg-white/40 dark:bg-slate-905/40 text-right text-[10px] font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label="Water Tank X coordinate"
                  />
                  <span className="text-[10px] text-slate-405 font-bold font-mono">m</span>
                </div>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={selectedObstacle.x}
                onChange={(e) => updateObstacle(selectedObstacle.id, { x: Number(e.target.value) })}
                className="w-full slider-input cursor-pointer"
                aria-label="Water Tank X coordinate slider"
              />
            </div>

            {/* Position Y */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5" /> Position Y (North-South)</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={Number(selectedObstacle.y.toFixed(1))}
                    step="0.1"
                    min="-12"
                    max="12"
                    onChange={(e) => updateObstacle(selectedObstacle.id, { y: Number(e.target.value) })}
                    className="w-16 px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 rounded bg-white/40 dark:bg-slate-905/40 text-right text-[10px] font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label="Water Tank Y coordinate"
                  />
                  <span className="text-[10px] text-slate-405 font-bold font-mono">m</span>
                </div>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={selectedObstacle.y}
                onChange={(e) => updateObstacle(selectedObstacle.id, { y: Number(e.target.value) })}
                className="w-full slider-input cursor-pointer"
                aria-label="Water Tank Y coordinate slider"
              />
            </div>

            {/* Radius */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5" /> Radius</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={Number((selectedObstacle as WaterTank).radius.toFixed(2))}
                    step="0.05"
                    min="0.5"
                    max="4.0"
                    onChange={(e) => updateObstacle(selectedObstacle.id, { radius: Number(e.target.value) })}
                    className="w-16 px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 rounded bg-white/40 dark:bg-slate-905/40 text-right text-[10px] font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label="Water tank radius"
                  />
                  <span className="text-[10px] text-slate-405 font-bold font-mono">m</span>
                </div>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.05"
                value={(selectedObstacle as WaterTank).radius}
                onChange={(e) => updateObstacle(selectedObstacle.id, { radius: Number(e.target.value) })}
                className="w-full slider-input cursor-pointer"
                aria-label="Water tank radius slider"
              />
            </div>

            {/* Height */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5" /> Height</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={Number((selectedObstacle as WaterTank).height.toFixed(1))}
                    step="0.1"
                    min="1"
                    max="10"
                    onChange={(e) => updateObstacle(selectedObstacle.id, { height: Number(e.target.value) })}
                    className="w-16 px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 rounded bg-white/40 dark:bg-slate-905/40 text-right text-[10px] font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label="Water tank height"
                  />
                  <span className="text-[10px] text-slate-405 font-bold font-mono">m</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={(selectedObstacle as WaterTank).height}
                onChange={(e) => updateObstacle(selectedObstacle.id, { height: Number(e.target.value) })}
                className="w-full slider-input cursor-pointer"
                aria-label="Water tank height slider"
              />
            </div>
          </div>
        </div>
      )}

      {/* CASE 3: selected solar table */}
      {selectedTable && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
            <div className="flex items-center gap-2.5">
              <Grid className="w-5 h-5 text-emerald-500 animate-pulse" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider opacity-75">Solar Array Selected</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedTable.name}</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm(`Delete ${selectedTable.name}?`)) {
                  removeTable(selectedTable.id);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-rose-500/15 text-rose-500 dark:text-rose-455 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500"
              title="Delete Solar Array"
              aria-label={`Delete ${selectedTable.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {/* Position X */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5" /> Position X (East-West)</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={Number(selectedTable.x.toFixed(1))}
                    step="0.1"
                    min="-12"
                    max="12"
                    onChange={(e) => updateTablePosition(selectedTable.id, Number(e.target.value), selectedTable.y)}
                    className="w-16 px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 rounded bg-white/40 dark:bg-slate-905/40 text-right text-[10px] font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label="Solar Array X position"
                  />
                  <span className="text-[10px] text-slate-405 font-bold font-mono">m</span>
                </div>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={selectedTable.x}
                onChange={(e) => updateTablePosition(selectedTable.id, Number(e.target.value), selectedTable.y)}
                className="w-full slider-input cursor-pointer"
                aria-label="Solar Array X position slider"
              />
            </div>

            {/* Position Y */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5" /> Position Y (North-South)</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={Number(selectedTable.y.toFixed(1))}
                    step="0.1"
                    min="-12"
                    max="12"
                    onChange={(e) => updateTablePosition(selectedTable.id, selectedTable.x, Number(e.target.value))}
                    className="w-16 px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 rounded bg-white/40 dark:bg-slate-905/40 text-right text-[10px] font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label="Solar Array Y position"
                  />
                  <span className="text-[10px] text-slate-405 font-bold font-mono">m</span>
                </div>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={selectedTable.y}
                onChange={(e) => updateTablePosition(selectedTable.id, selectedTable.x, Number(e.target.value))}
                className="w-full slider-input cursor-pointer"
                aria-label="Solar Array Y position slider"
              />
            </div>

            {/* Elevation */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5" /> Elevation (Rooftop Height)</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={Number(selectedTable.elevation.toFixed(1))}
                    step="0.1"
                    min="0.8"
                    max="6.0"
                    onChange={(e) => updateTableElevation(selectedTable.id, Number(e.target.value))}
                    className="w-16 px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 rounded bg-white/40 dark:bg-slate-905/40 text-right text-[10px] font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    aria-label="Solar Array elevation"
                  />
                  <span className="text-[10px] text-slate-405 font-bold font-mono">m</span>
                </div>
              </div>
              <input
                type="range"
                min="0.8"
                max="6.0"
                step="0.1"
                value={selectedTable.elevation}
                onChange={(e) => updateTableElevation(selectedTable.id, Number(e.target.value))}
                className="w-full slider-input cursor-pointer"
                aria-label="Solar Array elevation slider"
              />
            </div>
          </div>
        </div>
      )}

      {/* CASE 4: Default State (No selection) - Lists and Actions */}
      {!selectedObstacle && !selectedTable && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-medium text-center">
            Select any object in the 3D scene to configure its position and dimensions. Or choose one from the elements list below.
          </p>

          {/* Scene Commands / Adding elements */}
          <div className="flex flex-col gap-2 border-t border-slate-200/50 dark:border-slate-850/50 pt-4">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 px-1">
              Scene Commands
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addTable()}
                className="flex items-center justify-center gap-1.5 py-2 px-1.5 text-[10px] font-bold rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-900/20 text-slate-650 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 font-sans"
                aria-label="Add Solar Array to scene"
              >
                <Plus className="w-3.5 h-3.5" /> Add Array
              </button>
              <button
                onClick={() => addObstacle('building')}
                className="flex items-center justify-center gap-1.5 py-2 px-1.5 text-[10px] font-bold rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-900/20 text-slate-650 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 font-sans"
                aria-label="Add Building to scene"
              >
                <Plus className="w-3.5 h-3.5" /> Add Building
              </button>
              <button
                onClick={() => addObstacle('tank')}
                className="flex items-center justify-center gap-1.5 py-2 px-1.5 text-[10px] font-bold rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-900/20 text-slate-650 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 font-sans"
                aria-label="Add Water Tank to scene"
              >
                <Plus className="w-3.5 h-3.5" /> Add Water Tank
              </button>
              <button
                onClick={() => {
                  if (confirm('Reset scenario to defaults?')) {
                    resetScenario();
                  }
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-1.5 text-[10px] font-bold rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-900/20 text-slate-650 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/30 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 font-sans"
                aria-label="Reset scenario to defaults"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Scene
              </button>
            </div>
          </div>

          {/* List of all objects in the scene for direct selection */}
          <div className="flex flex-col gap-2 border-t border-slate-200/50 dark:border-slate-850/50 pt-4">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 px-1">
              Scene Elements (Tab / Enter)
            </p>
            
            {/* List Tables */}
            <div className="flex flex-col gap-1.5">
              {tables.map((table) => {
                const isSelected = selectedTableId === table.id;
                return (
                  <div
                    key={table.id}
                    className={`w-full flex items-center justify-between text-xs py-2 px-3 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 font-bold shadow-sm'
                        : 'border-slate-200/40 dark:border-slate-850/40 bg-slate-50/30 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200'
                    }`}
                  >
                    <button
                      onClick={() => handleSelectObject(table.id, true)}
                      className="flex-1 flex items-center gap-2.5 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 rounded p-0.5 outline-none font-medium font-sans"
                      aria-label={`Select ${table.name}`}
                    >
                      <Grid className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`} />
                      {table.name}
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-955 px-1 py-0.5 rounded">
                        [{table.x.toFixed(0)}, {table.y.toFixed(0)}]
                      </span>
                      <button
                        onClick={() => duplicateObject(table.id, true)}
                        className="p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                        title="Duplicate Solar Array"
                        aria-label={`Duplicate ${table.name}`}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${table.name}?`)) {
                            removeTable(table.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-455 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 outline-none"
                        title="Delete Solar Array"
                        aria-label={`Delete ${table.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* List Obstacles */}
            <div className="flex flex-col gap-1.5 mt-1">
              {obstacles.map((obs) => {
                const isSelected = selectedObstacleId === obs.id;
                return (
                  <div
                    key={obs.id}
                    className={`w-full flex items-center justify-between text-xs py-2 px-3 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 font-bold shadow-sm'
                        : 'border-slate-200/40 dark:border-slate-850/40 bg-slate-50/30 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 hover:text-slate-855 dark:hover:text-slate-200'
                    }`}
                  >
                    <button
                      onClick={() => handleSelectObject(obs.id, false)}
                      className="flex-1 flex items-center gap-2.5 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 rounded p-0.5 outline-none font-medium font-sans"
                      aria-label={`Select ${obs.name}`}
                    >
                      {obs.type === 'building' ? (
                        <Box className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`} />
                      ) : (
                        <Layers className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`} />
                      )}
                      {obs.name}
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-955 px-1 py-0.5 rounded">
                        [{obs.x.toFixed(0)}, {obs.y.toFixed(0)}]
                      </span>
                      <button
                        onClick={() => duplicateObject(obs.id, false)}
                        className="p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                        title="Duplicate Obstacle"
                        aria-label={`Duplicate ${obs.name}`}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${obs.name}?`)) {
                            removeObstacle(obs.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-455 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 outline-none"
                        title="Delete Obstacle"
                        aria-label={`Delete ${obs.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
