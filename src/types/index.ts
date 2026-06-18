export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type ObstacleType = 'building' | 'tank';

export interface BaseObstacle {
  id: string;
  name: string;
  type: ObstacleType;
  x: number; // Center X on grid (maps to 3D X)
  y: number; // Center Y on grid (maps to 3D Z - standard ground plane is XZ)
}

export interface Building extends BaseObstacle {
  type: 'building';
  width: number;  // along X axis
  length: number; // along Z axis
  height: number; // along Y axis
}

export interface WaterTank extends BaseObstacle {
  type: 'tank';
  radius: number; // circular radius on XZ plane
  height: number; // along Y axis
}

export type Obstacle = Building | WaterTank;

export type RiskLevel = 'low' | 'medium' | 'high';

export interface SolarPanel {
  id: string; // e.g., "table-1-panel-0"
  index: number; // 0 to 5
  shadedFlags: boolean[]; // 100 boolean values representing points shading state
  shadedPercentage: number; // 0 to 100
  eofPercentage: number; // 0 to 100 (Edge Occlusion Factor)
  eofRisk: RiskLevel;
  efficiency: number; // 0 to 100 (electrical efficiency output)
}

export interface SolarTable {
  id: string; // "table-1", "table-2"
  name: string;
  x: number; // Center X
  y: number; // Center Y (maps to 3D Z)
  elevation: number; // height clearance above ground (allows rooftop mount simulation)
  tilt: number; // Fixed tilt (15 degrees)
  panels: SolarPanel[];
}

export type SimulationMode = 'manual' | 'auto';

export interface SunPosition {
  azimuth: number; // degrees (0 to 360)
  elevation: number; // degrees (0 to 90)
}

export interface LocationPreset {
  name: string;
  latitude: number;
  longitude: number;
}

export interface AnalyticsSummary {
  totalPanels: number;
  activePanels: number; // panel efficiency > 0
  shadedPanels: number; // panel shadedPercentage > 0
  avgShadow: number; // average shaded percentage of all panels
  avgEfficiency: number; // average efficiency of all panels
  avgEOF: number; // average EOF of all panels
  siteRisk: RiskLevel;
  table1Efficiency: number;
  table2Efficiency: number;
  tableEfficiencies: Record<string, number>;
  dailyYieldKwh: number;    // estimated solar generation in kWh/day
  monthlySavingsRs: number; // estimated monthly monetary savings in Rupees
  co2OffsetKg: number;      // estimated carbon offset in kg CO2/month
}

export interface TimeSeriesPoint {
  time: string; // e.g. "09:00"
  efficiency: number; // site efficiency
  shadow: number; // site average shadow
}
