import { RiskLevel, SolarTable, AnalyticsSummary } from '../types';

/**
 * Calculates the Edge Occlusion Factor (EOF) and electrical efficiency for a single panel
 * based on its 100 sample points' shaded states.
 */
export function calculatePanelPerformance(shadedFlags: boolean[]): {
  shadedPercentage: number;
  eofPercentage: number;
  eofRisk: RiskLevel;
  efficiency: number;
} {
  const totalPoints = shadedFlags.length;
  if (totalPoints === 0) {
    return { shadedPercentage: 0, eofPercentage: 0, eofRisk: 'low', efficiency: 100 };
  }

  const shadedCount = shadedFlags.filter(Boolean).length;
  const shadedPercentage = (shadedCount / totalPoints) * 100;

  // 1. Calculate Edge Occlusion Factor (EOF)
  // We compute proximity weight for each point on a 10x10 grid.
  let totalWeight = 0;
  let shadedWeight = 0;

  for (let idx = 0; idx < totalPoints; idx++) {
    const c = idx % 10;
    const r = Math.floor(idx / 10);
    
    // Normalized coordinates (0.0 to 1.0)
    const u = c / 9;
    const v = r / 9;
    
    // Distance to nearest edge
    const d = Math.min(u, 1 - u, v, 1 - v);
    
    // Weight is 1.0 at edges and 0.0 at center
    const w = 1.0 - 2 * d;
    
    totalWeight += w;
    if (shadedFlags[idx]) {
      shadedWeight += w;
    }
  }

  const eofPercentage = totalWeight > 0 ? (shadedWeight / totalWeight) * 100 : 0;

  // Determine Risk Level
  let eofRisk: RiskLevel = 'low';
  if (eofPercentage >= 40) {
    eofRisk = 'high';
  } else if (eofPercentage >= 15) {
    eofRisk = 'medium';
  }

  // 2. Calculate Electrical Efficiency (Sub-string Bypass Diode Model)
  // We divide the panel into 3 vertical sub-strings:
  // - Left sub-string: columns 0, 1, 2 (30 points)
  // - Middle sub-string: columns 3, 4, 5, 6 (40 points)
  // - Right sub-string: columns 7, 8, 9 (30 points)
  let leftShaded = 0;
  let midShaded = 0;
  let rightShaded = 0;

  for (let idx = 0; idx < totalPoints; idx++) {
    const c = idx % 10;
    const isShaded = shadedFlags[idx];
    if (isShaded) {
      if (c <= 2) {
        leftShaded++;
      } else if (c <= 6) {
        midShaded++;
      } else {
        rightShaded++;
      }
    }
  }

  const S_left = leftShaded / 30;
  const S_mid = midShaded / 40;
  const S_right = rightShaded / 30;

  // Substring efficiency model:
  // If a substring shading exceeds 5%, its bypass diode activates, dropping substring output to 10%.
  // If it's 100% shaded, it drops to 0%. Otherwise, it is 1.0 - shading.
  const getSubEfficiency = (s: number) => {
    if (s > 0.05) {
      return s >= 1.0 ? 0.0 : 0.1;
    }
    return 1.0 - s;
  };

  const effLeft = getSubEfficiency(S_left);
  const effMid = getSubEfficiency(S_mid);
  const effRight = getSubEfficiency(S_right);

  // Base efficiency is average of substrings
  const effBase = (effLeft + effMid + effRight) / 3;

  // Apply EOF penalty: edge shading reduces efficiency further by up to 50%
  const eofPenalty = 1.0 - (eofPercentage / 100) * 0.5;
  let efficiency = effBase * eofPenalty * 100;

  // Clamp values
  if (shadedPercentage === 0) {
    efficiency = 100;
  } else if (shadedPercentage === 100) {
    efficiency = 0;
  } else {
    efficiency = Math.max(0, Math.min(100, efficiency));
  }

  return {
    shadedPercentage: Math.round(shadedPercentage * 10) / 10,
    eofPercentage: Math.round(eofPercentage * 10) / 10,
    eofRisk,
    efficiency: Math.round(efficiency * 10) / 10,
  };
}

/**
 * Generate summaries and reports based on current tables and their panel performances.
 */
export function generateAnalyticsSummary(tables: SolarTable[]): AnalyticsSummary {
  let totalPanels = 0;
  let activePanels = 0;
  let shadedPanels = 0;
  let sumShadow = 0;
  let sumEfficiency = 0;
  let sumEOF = 0;
  
  const tableEfficiencies: Record<string, number> = {};
  let table1EffSum = 0;
  let table2EffSum = 0;

  tables.forEach((table) => {
    let tableEffSum = 0;
    table.panels.forEach((panel) => {
      totalPanels++;
      if (panel.efficiency > 0.01) activePanels++;
      if (panel.shadedPercentage > 0.01) shadedPanels++;
      
      sumShadow += panel.shadedPercentage;
      sumEfficiency += panel.efficiency;
      sumEOF += panel.eofPercentage;

      tableEffSum += panel.efficiency;
      if (table.id === 'table-1') {
        table1EffSum += panel.efficiency;
      } else if (table.id === 'table-2') {
        table2EffSum += panel.efficiency;
      }
    });
    tableEfficiencies[table.id] = table.panels.length > 0
      ? Math.round((tableEffSum / table.panels.length) * 10) / 10
      : 0;
  });

  const avgShadow = totalPanels > 0 ? sumShadow / totalPanels : 0;
  const avgEfficiency = totalPanels > 0 ? sumEfficiency / totalPanels : 0;
  const avgEOF = totalPanels > 0 ? sumEOF / totalPanels : 0;

  let siteRisk: RiskLevel = 'low';
  if (avgEOF >= 40) {
    siteRisk = 'high';
  } else if (avgEOF >= 15) {
    siteRisk = 'medium';
  }

  // Indian context:
  // Each panel is rated at 350W (0.35 kW)
  // Average daily peak sun hours in India is ~5.0 hours
  // Tariff is ₹7.5 / kWh
  // Carbon offset coefficient is 0.82 kg CO2 / kWh
  const dailyYieldKwh = (avgEfficiency / 100) * (totalPanels * 0.35) * 5.0;
  const monthlySavingsRs = dailyYieldKwh * 30 * 7.5;
  const co2OffsetKg = dailyYieldKwh * 30 * 0.82;

  return {
    totalPanels,
    activePanels,
    shadedPanels,
    avgShadow: Math.round(avgShadow * 10) / 10,
    avgEfficiency: Math.round(avgEfficiency * 10) / 10,
    avgEOF: Math.round(avgEOF * 10) / 10,
    siteRisk,
    table1Efficiency: Math.round((table1EffSum / 6) * 10) / 10,
    table2Efficiency: Math.round((table2EffSum / 6) * 10) / 10,
    tableEfficiencies,
    dailyYieldKwh: Math.round(dailyYieldKwh * 10) / 10,
    monthlySavingsRs: Math.round(monthlySavingsRs),
    co2OffsetKg: Math.round(co2OffsetKg * 10) / 10,
  };
}
