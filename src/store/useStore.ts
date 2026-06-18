import { create } from 'zustand';
import {
  Obstacle,
  SolarTable,
  SimulationMode,
  LocationPreset,
  AnalyticsSummary,
  TimeSeriesPoint,
  SunPosition,
  SolarPanel
} from '../types';
import { LOCATION_PRESETS, calculateSunPosition, getSunDirectionVector, isSunUp } from '../utils/sun';
import { getPanelSamplePoints, isPointInShadow } from '../utils/shadow';
import { calculatePanelPerformance, generateAnalyticsSummary } from '../utils/efficiency';

interface StoreData {
  // Scenario Objects
  tables: SolarTable[];
  obstacles: Obstacle[];
  
  // Sun Simulation
  simulationMode: SimulationMode;
  manualSun: SunPosition;
  autoDateTimestamp: number; // Date stored as millisecond timestamp
  selectedLocation: LocationPreset;
  isSimulating: boolean;
  simulationSpeed: number; // multiplier for time advancement (e.g. minutes per tick)
  
  // UI Selection
  theme: 'light' | 'dark';
  selectedObstacleId: string | null;
  selectedTableId: string | null;
  houseModel: 'flat' | 'traditional' | 'modern';
  isDragging3D: boolean;

  // Computed Outputs
  summary: AnalyticsSummary;
  timeSeriesData: TimeSeriesPoint[];

  // Undo / Redo Stacks
  history: unknown[];
  future: unknown[];
}

interface StoreState extends StoreData {
  // Actions
  setSimulationMode: (mode: SimulationMode) => void;
  setManualSun: (updates: Partial<SunPosition>) => void;
  setAutoDateTimestamp: (timestamp: number) => void;
  setSelectedLocation: (location: LocationPreset) => void;
  setIsSimulating: (isSimulating: boolean) => void;
  setSimulationSpeed: (speed: number) => void;
  setHouseModel: (houseModel: 'flat' | 'traditional' | 'modern') => void;
  setIsDragging3D: (isDragging3D: boolean) => void;
  
  updateObstacle: (id: string, updates: Partial<Obstacle>) => void;
  updateTablePosition: (id: string, x: number, y: number) => void;
  updateTableElevation: (id: string, elevation: number) => void;
  
  setSelectedObstacleId: (id: string | null) => void;
  setSelectedTableId: (id: string | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  addObstacle: (type: 'building' | 'tank') => void;
  removeObstacle: (id: string) => void;
  addTable: () => void;
  removeTable: (id: string) => void;
  duplicateObject: (id: string, isTable: boolean) => void;
  resetScenario: () => void;
  undo: () => void;
  redo: () => void;

  tickSimulation: () => void;
  recalculate: () => void;
}

// Initial Panels helper
const createInitialPanels = (tableId: string): SolarPanel[] => {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `${tableId}-panel-${i}`,
    index: i,
    shadedFlags: Array(100).fill(false),
    shadedPercentage: 0,
    eofPercentage: 0,
    eofRisk: 'low',
    efficiency: 100
  }));
};

const takeSnapshot = (state: StoreData) => {
  return {
    tables: JSON.parse(JSON.stringify(state.tables)),
    obstacles: JSON.parse(JSON.stringify(state.obstacles)),
    manualSun: { ...state.manualSun },
    autoDateTimestamp: state.autoDateTimestamp,
    selectedLocation: { ...state.selectedLocation },
    selectedObstacleId: state.selectedObstacleId,
    selectedTableId: state.selectedTableId,
    simulationMode: state.simulationMode,
  };
};

export const useStore = create<StoreState>((set) => {
  // Default Initial Scenario
  const initialTables: SolarTable[] = [
    {
      id: 'table-1',
      name: 'Solar Array Alpha',
      x: -4.0,
      y: -2.0, // Z coordinate in 3D
      elevation: 0.8,
      tilt: 15,
      panels: createInitialPanels('table-1')
    },
    {
      id: 'table-2',
      name: 'Solar Array Beta',
      x: 4.0,
      y: -2.0, // Z coordinate in 3D
      elevation: 0.8,
      tilt: 15,
      panels: createInitialPanels('table-2')
    }
  ];

  const initialObstacles: Obstacle[] = [
    {
      id: 'building-1',
      name: 'Office Building',
      type: 'building',
      x: 0.0,
      y: 3.5, // Z coordinate in 3D
      width: 4.0,
      length: 4.0,
      height: 4.0
    },
    {
      id: 'tank-1',
      name: 'Water Silo',
      type: 'tank',
      x: -5.0,
      y: 4.0, // Z coordinate in 3D
      radius: 1.2,
      height: 3.5
    }
  ];

  // Stable UTC Date for standard start (June 18, 2026, 12:00 PM IST = 6:30 AM UTC)
  const initialDate = new Date(Date.UTC(2026, 5, 18, 6, 30, 0, 0));

  const initialLocation = LOCATION_PRESETS[0];

  // Helper: Perform Shadow & Efficiency Recalculations for the entire scene at a specific sun position
  const computeScenePerformance = (
    tables: SolarTable[],
    obstacles: Obstacle[],
    sunPos: SunPosition
  ): { updatedTables: SolarTable[]; summary: AnalyticsSummary } => {
    const sunDir = getSunDirectionVector(sunPos.azimuth, sunPos.elevation);
    const sunIsUp = isSunUp(sunPos.elevation);

    const updatedTables = tables.map((table) => {
      const updatedPanels = table.panels.map((panel) => {
        if (!sunIsUp) {
          return {
            ...panel,
            shadedFlags: Array(100).fill(true),
            shadedPercentage: 100,
            eofPercentage: 100,
            eofRisk: 'high' as const,
            efficiency: 0
          };
        }

        // Get 100 3D sample points on the panel
        const points = getPanelSamplePoints(table.x, table.y, panel.index, table.tilt, table.elevation);
        
        // Raycast each point against all obstacles
        const shadedFlags = points.map((p) => isPointInShadow(p, sunDir, obstacles));
        
        // Compute metrics
        const performance = calculatePanelPerformance(shadedFlags);
        
        return {
          ...panel,
          shadedFlags,
          ...performance
        };
      });

      return {
        ...table,
        panels: updatedPanels
      };
    });

    const summary = generateAnalyticsSummary(updatedTables);

    return { updatedTables, summary };
  };

  // Helper: Calculate daily efficiency and shadow curve (for Recharts)
  const computeDailyForecast = (
    tables: SolarTable[],
    obstacles: Obstacle[],
    location: LocationPreset,
    baseTimestamp: number
  ): TimeSeriesPoint[] => {
    const baseDate = new Date(baseTimestamp);
    const forecast: TimeSeriesPoint[] = [];

    // Forecast from 6:00 AM to 7:00 PM (14 hourly steps)
    for (let hour = 6; hour <= 19; hour++) {
      const loopDate = new Date(baseDate);
      loopDate.setUTCHours(hour, 0, 0, 0);
      
      const sunPos = calculateSunPosition(loopDate, location.latitude, location.longitude);
      const { summary } = computeScenePerformance(tables, obstacles, sunPos);

      // If the sun is down, force output to 0
      const isUp = isSunUp(sunPos.elevation);

      forecast.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        efficiency: isUp ? summary.avgEfficiency : 0,
        shadow: isUp ? summary.avgShadow : 100
      });
    }

    return forecast;
  };

  // Run the full update pipeline
  const runUpdate = (state: StoreData): StoreData => {
    // 1. Get Sun position
    let activeSunPos = state.manualSun;
    if (state.simulationMode === 'auto') {
      activeSunPos = calculateSunPosition(
        new Date(state.autoDateTimestamp),
        state.selectedLocation.latitude,
        state.selectedLocation.longitude
      );
    }

    // 2. Compute live panel shading and efficiencies
    const { updatedTables, summary } = computeScenePerformance(state.tables, state.obstacles, activeSunPos);

    // 3. Compute 24h daily forecast
    const forecast = computeDailyForecast(
      state.tables,
      state.obstacles,
      state.selectedLocation,
      state.autoDateTimestamp
    );

    // Integrated Daily Yield Calculation
    const totalPanels = updatedTables.reduce((sum, t) => sum + t.panels.length, 0);
    const hourlyYields = forecast.map((pt) => (pt.efficiency / 100) * (totalPanels * 0.35) * 1.0);
    const integratedYieldKwh = hourlyYields.reduce((sum, val) => sum + val, 0);

    const updatedSummary = {
      ...summary,
      dailyYieldKwh: Math.round(integratedYieldKwh * 10) / 10,
      monthlySavingsRs: Math.round(integratedYieldKwh * 30 * 7.5),
      co2OffsetKg: Math.round(integratedYieldKwh * 30 * 0.82)
    };

    return {
      ...state,
      tables: updatedTables,
      summary: updatedSummary,
      timeSeriesData: forecast
    };
  };

  // Create initial state structure
  const tempState: StoreData = {
    tables: initialTables,
    obstacles: initialObstacles,
    simulationMode: 'auto' as const,
    manualSun: { azimuth: 180, elevation: 45 },
    autoDateTimestamp: initialDate.getTime(),
    selectedLocation: initialLocation,
    isSimulating: false,
    simulationSpeed: 2,
    theme: 'light' as const,
    selectedObstacleId: null,
    selectedTableId: null,
    houseModel: 'flat' as const,
    isDragging3D: false,
    summary: {
      totalPanels: 0,
      activePanels: 0,
      shadedPanels: 0,
      avgShadow: 0,
      avgEfficiency: 0,
      avgEOF: 0,
      siteRisk: 'low' as const,
      table1Efficiency: 0,
      table2Efficiency: 0,
      tableEfficiencies: {},
      dailyYieldKwh: 0,
      monthlySavingsRs: 0,
      co2OffsetKg: 0
    },
    timeSeriesData: [],
    history: [],
    future: []
  };

  const populatedInitialState = runUpdate(tempState);

  return {
    ...populatedInitialState,

    setSimulationMode: (simulationMode) => {
      set((state) => {
        const snap = takeSnapshot(state);
        return runUpdate({
          ...state,
          simulationMode,
          history: [...state.history, snap],
          future: []
        });
      });
    },

    setManualSun: (updates) => {
      set((state) => {
        const snap = takeSnapshot(state);
        const manualSun = { ...state.manualSun, ...updates };
        return runUpdate({
          ...state,
          manualSun,
          history: [...state.history, snap],
          future: []
        });
      });
    },

    setAutoDateTimestamp: (autoDateTimestamp) => {
      set((state) => {
        const snap = takeSnapshot(state);
        return runUpdate({
          ...state,
          autoDateTimestamp,
          history: [...state.history, snap],
          future: []
        });
      });
    },

    setSelectedLocation: (selectedLocation) => {
      set((state) => {
        const snap = takeSnapshot(state);
        return runUpdate({
          ...state,
          selectedLocation,
          history: [...state.history, snap],
          future: []
        });
      });
    },

    setIsSimulating: (isSimulating) => {
      set({ isSimulating });
    },

    setSimulationSpeed: (simulationSpeed) => {
      set({ simulationSpeed });
    },

    updateObstacle: (id, updates) => {
      set((state) => {
        const snap = takeSnapshot(state);
        const obstacles = state.obstacles.map((obs) => {
          if (obs.id === id) {
            return { ...obs, ...updates } as Obstacle;
          }
          return obs;
        });
        return runUpdate({
          ...state,
          obstacles,
          history: [...state.history, snap],
          future: []
        });
      });
    },

    updateTablePosition: (id, x, y) => {
      set((state) => {
        const snap = takeSnapshot(state);
        const tables = state.tables.map((table) => {
          if (table.id === id) {
            return { ...table, x, y };
          }
          return table;
        });
        return runUpdate({
          ...state,
          tables,
          history: [...state.history, snap],
          future: []
        });
      });
    },

    updateTableElevation: (id, elevation) => {
      set((state) => {
        const snap = takeSnapshot(state);
        const tables = state.tables.map((table) => {
          if (table.id === id) {
            return { ...table, elevation };
          }
          return table;
        });
        return runUpdate({
          ...state,
          tables,
          history: [...state.history, snap],
          future: []
        });
      });
    },

    setSelectedObstacleId: (selectedObstacleId) => {
      set({ selectedObstacleId, selectedTableId: null });
    },

    setSelectedTableId: (selectedTableId) => {
      set({ selectedTableId, selectedObstacleId: null });
    },

    setTheme: (theme) => {
      set({ theme });
    },

    setHouseModel: (houseModel) => {
      set((state) => {
        const snap = takeSnapshot(state);
        return runUpdate({
          ...state,
          houseModel,
          history: [...state.history, snap],
          future: []
        });
      });
    },

    setIsDragging3D: (isDragging3D) => {
      set({ isDragging3D });
    },

    addObstacle: (type) => {
      set((state) => {
        const snap = takeSnapshot(state);
        const id = `obstacle-${Date.now()}`;
        const count = state.obstacles.filter((o) => o.type === type).length + 1;
        
        let newObs: Obstacle;
        if (type === 'building') {
          newObs = {
            id,
            name: `Building ${count}`,
            type: 'building',
            x: 1.0,
            y: 1.0,
            width: 3.0,
            length: 3.0,
            height: 3.0
          };
        } else {
          newObs = {
            id,
            name: `Water Tank ${count}`,
            type: 'tank',
            x: 1.0,
            y: 1.0,
            radius: 1.0,
            height: 3.0
          };
        }

        const obstacles = [...state.obstacles, newObs];
        return runUpdate({
          ...state,
          obstacles,
          selectedObstacleId: id,
          selectedTableId: null,
          history: [...state.history, snap],
          future: []
        });
      });
    },

    removeObstacle: (id) => {
      set((state) => {
        const snap = takeSnapshot(state);
        const obstacles = state.obstacles.filter((o) => o.id !== id);
        return runUpdate({
          ...state,
          obstacles,
          selectedObstacleId: state.selectedObstacleId === id ? null : state.selectedObstacleId,
          history: [...state.history, snap],
          future: []
        });
      });
    },

    addTable: () => {
      set((state) => {
        const snap = takeSnapshot(state);
        const id = `table-${Date.now()}`;
        const newTable: SolarTable = {
          id,
          name: `Array ${String.fromCharCode(65 + state.tables.length)}`,
          x: 2.0,
          y: -2.0,
          elevation: 0.8,
          tilt: 15,
          panels: createInitialPanels(id)
        };

        const tables = [...state.tables, newTable];
        return runUpdate({
          ...state,
          tables,
          selectedTableId: id,
          selectedObstacleId: null,
          history: [...state.history, snap],
          future: []
        });
      });
    },

    removeTable: (id) => {
      set((state) => {
        const snap = takeSnapshot(state);
        const tables = state.tables.filter((t) => t.id !== id);
        return runUpdate({
          ...state,
          tables,
          selectedTableId: state.selectedTableId === id ? null : state.selectedTableId,
          history: [...state.history, snap],
          future: []
        });
      });
    },

    duplicateObject: (id, isTable) => {
      set((state) => {
        const snap = takeSnapshot(state);
        if (isTable) {
          const table = state.tables.find((t) => t.id === id);
          if (!table) return {};
          const newId = `table-${Date.now()}`;
          const newTable: SolarTable = {
            ...table,
            id: newId,
            name: `Copy of ${table.name}`,
            x: table.x + 1.5,
            y: table.y + 1.5,
            panels: createInitialPanels(newId)
          };
          const tables = [...state.tables, newTable];
          return runUpdate({
            ...state,
            tables,
            selectedTableId: newId,
            selectedObstacleId: null,
            history: [...state.history, snap],
            future: []
          });
        } else {
          const obs = state.obstacles.find((o) => o.id === id);
          if (!obs) return {};
          const newId = `obstacle-${Date.now()}`;
          const newObs: Obstacle = {
            ...obs,
            id: newId,
            name: `Copy of ${obs.name}`,
            x: obs.x + 1.5,
            y: obs.y + 1.5
          } as Obstacle;
          const obstacles = [...state.obstacles, newObs];
          return runUpdate({
            ...state,
            obstacles,
            selectedObstacleId: newId,
            selectedTableId: null,
            history: [...state.history, snap],
            future: []
          });
        }
      });
    },

    resetScenario: () => {
      set((state) => {
        const snap = takeSnapshot(state);
        return runUpdate({
          ...state,
          tables: initialTables,
          obstacles: initialObstacles,
          manualSun: { azimuth: 180, elevation: 45 },
          autoDateTimestamp: initialDate.getTime(),
          selectedLocation: LOCATION_PRESETS[0],
          selectedObstacleId: null,
          selectedTableId: null,
          isSimulating: false,
          history: [...state.history, snap],
          future: []
        });
      });
    },

    undo: () => {
      set((state) => {
        if (state.history.length === 0) return {};
        const prevHistory = [...state.history];
        const snap = prevHistory.pop()!;
        const currentSnap = takeSnapshot(state);

        return runUpdate({
          ...state,
          ...snap,
          history: prevHistory,
          future: [currentSnap, ...state.future]
        });
      });
    },

    redo: () => {
      set((state) => {
        if (state.future.length === 0) return {};
        const prevFuture = [...state.future];
        const snap = prevFuture.shift()!;
        const currentSnap = takeSnapshot(state);

        return runUpdate({
          ...state,
          ...snap,
          history: [...state.history, currentSnap],
          future: prevFuture
        });
      });
    },

    tickSimulation: () => {
      set((state) => {
        if (!state.isSimulating) return {};

        const currentDate = new Date(state.autoDateTimestamp);
        currentDate.setUTCMinutes(currentDate.getUTCMinutes() + state.simulationSpeed);

        const localHour = currentDate.getUTCHours() + currentDate.getUTCMinutes() / 60 + 5.5;
        if (localHour >= 20.0 || localHour < 6.0) {
          currentDate.setUTCHours(0, 30, 0, 0); // 6:00 AM IST (00:30 UTC)
        }

        return runUpdate({
          ...state,
          autoDateTimestamp: currentDate.getTime()
        });
      });
    },

    recalculate: () => {
      set((state) => runUpdate({ ...state }));
    }
  };
});
