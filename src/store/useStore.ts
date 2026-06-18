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

  // Stable UTC Date for standard start (June 18, 2026, 12:00 PM UTC)
  const initialDate = new Date(Date.UTC(2026, 5, 18, 12, 0, 0, 0));

  const initialLocation = LOCATION_PRESETS[0]; // Los Angeles

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
      loopDate.setHours(hour, 0, 0, 0);
      
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

    return {
      ...state,
      tables: updatedTables,
      summary,
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
    simulationSpeed: 2, // minutes per step in simulation ticks (speeded up for 30fps smoothness)
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
      dailyYieldKwh: 0,
      monthlySavingsRs: 0,
      co2OffsetKg: 0
    },
    timeSeriesData: []
  };

  // Run initial calculation to populate summary and timeSeriesData
  const populatedInitialState = runUpdate(tempState);

  return {
    ...populatedInitialState,

    // Actions
    setSimulationMode: (simulationMode) => {
      set((state) => runUpdate({ ...state, simulationMode }));
    },

    setManualSun: (updates) => {
      set((state) => {
        const manualSun = { ...state.manualSun, ...updates };
        return runUpdate({ ...state, manualSun });
      });
    },

    setAutoDateTimestamp: (autoDateTimestamp) => {
      set((state) => runUpdate({ ...state, autoDateTimestamp }));
    },

    setSelectedLocation: (selectedLocation) => {
      set((state) => runUpdate({ ...state, selectedLocation }));
    },

    setIsSimulating: (isSimulating) => {
      set({ isSimulating });
    },

    setSimulationSpeed: (simulationSpeed) => {
      set({ simulationSpeed });
    },

    updateObstacle: (id, updates) => {
      set((state) => {
        const obstacles = state.obstacles.map((obs) => {
          if (obs.id === id) {
            return { ...obs, ...updates } as Obstacle;
          }
          return obs;
        });
        return runUpdate({ ...state, obstacles });
      });
    },

    updateTablePosition: (id, x, y) => {
      set((state) => {
        const tables = state.tables.map((table) => {
          if (table.id === id) {
            return { ...table, x, y };
          }
          return table;
        });
        return runUpdate({ ...state, tables });
      });
    },

    updateTableElevation: (id, elevation) => {
      set((state) => {
        const tables = state.tables.map((table) => {
          if (table.id === id) {
            return { ...table, elevation };
          }
          return table;
        });
        return runUpdate({ ...state, tables });
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
      set((state) => runUpdate({ ...state, houseModel }));
    },

    setIsDragging3D: (isDragging3D) => {
      set({ isDragging3D });
    },

    tickSimulation: () => {
      set((state) => {
        if (!state.isSimulating) return {};

        const currentDate = new Date(state.autoDateTimestamp);
        // Advance time by simulationSpeed (minutes) in UTC
        currentDate.setUTCMinutes(currentDate.getUTCMinutes() + state.simulationSpeed);

        // If it goes past 8:00 PM, loop back to 6:00 AM UTC
        const hour = currentDate.getUTCHours();
        if (hour >= 20 || hour < 6) {
          currentDate.setUTCHours(6, 0, 0, 0);
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
