import React from 'react';
import { useStore } from '../../store/useStore';
import { Zap, Sun, ShieldAlert, CheckCircle, AlertTriangle, Leaf, TrendingUp, ChevronRight } from 'lucide-react';
import { RiskLevel } from '../../types';

export const SummaryCards: React.FC = () => {
  const summary = useStore((state) => state.summary);

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'high':
        return 'text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'medium':
        return 'text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'low':
      default:
        return 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const getRiskLabel = (risk: RiskLevel) => {
    switch (risk) {
      case 'high':
        return 'High Risk';
      case 'medium':
        return 'Medium Risk';
      case 'low':
      default:
        return 'Low Risk';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Daily Solar Yield & Capacity */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Daily Solar Yield</span>
          <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Zap className="w-5 h-5 fill-emerald-500/10" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            {summary.dailyYieldKwh} <span className="text-sm font-semibold text-slate-500">kWh/day</span>
          </h2>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Peak capacity: 4.2 kWp</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal border-t border-slate-100 dark:border-slate-900 pt-2.5">
          Calculated based on 5.0 peak sun hours in India and live array shading.
        </p>
      </div>

      {/* 2. Monthly Financial Savings (Rupees) */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estimated Savings</span>
          <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-lg leading-none flex items-center justify-center w-9 h-9">
            ₹
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            ₹{summary.monthlySavingsRs.toLocaleString('en-IN')} <span className="text-xs font-semibold text-slate-500">/month</span>
          </h2>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Based on average tariff of ₹7.5 / kWh
          </div>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal border-t border-slate-100 dark:border-slate-900 pt-2.5">
          Estimated financial yield saved on grid imports under net-metering.
        </p>
      </div>

      {/* 3. Carbon Offset (CO2 kg) */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Carbon Offset</span>
          <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
            <Leaf className="w-5 h-5 fill-teal-500/10" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            {summary.co2OffsetKg} <span className="text-xs font-semibold text-slate-500">kg CO₂/m</span>
          </h2>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-1">
            <span className="text-emerald-500">🌱</span>
            <span>Equivalent to ~{Math.round(summary.co2OffsetKg * 0.05)} trees planted</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal border-t border-slate-100 dark:border-slate-900 pt-2.5">
          Based on Indian grid emissions factor of 0.82 kg CO₂ avoided per kWh.
        </p>
      </div>

      {/* 4. Efficiency & Shading Risk */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">System Efficiency</span>
          <div className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {summary.avgEfficiency}%
            </h2>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getRiskColor(summary.siteRisk)}`}>
              {getRiskLabel(summary.siteRisk)}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${summary.avgEfficiency}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-900 pt-2.5">
          <span>Avg Shadow: {summary.avgShadow}%</span>
          {summary.avgShadow > 0 ? (
            <span className="flex items-center gap-1 text-amber-500 font-medium"><AlertTriangle className="w-3 h-3" /> Shading active</span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-500 font-medium"><CheckCircle className="w-3 h-3" /> Full sun</span>
          )}
        </div>
      </div>

      {/* Solar Energy Flow Cascade Banner */}
      <div className="flex flex-col gap-4 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 shadow-sm transition-all duration-300 col-span-1 sm:col-span-2 lg:col-span-4 mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-900 pb-3">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-tight flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-time Power Cascade Analysis
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              Visualizing the decomposition of peak sunlight input to net electrical output power
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            System Rating: 4.20 kWp
          </span>
        </div>

        {/* Cascade Pipeline */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-2 text-xs font-semibold py-1">
          {/* Step 1: Potential Influx */}
          <div className="flex-1 bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-900 flex flex-col gap-1">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">1. Sunlight Influx</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">4.20 kWp</span>
            <span className="text-[9px] text-slate-400 font-medium">Standard test conditions</span>
          </div>

          <div className="hidden lg:block text-slate-300 dark:text-slate-700 self-center">
            <ChevronRight className="w-5 h-5" />
          </div>

          {/* Step 2: Obstruction Loss */}
          <div className="flex-1 bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-900 flex flex-col gap-1">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">2. Shadow Obstruction</span>
            <span className="text-sm font-black text-rose-500">
              -{(4.2 * (summary.avgShadow / 100)).toFixed(2)} kW
            </span>
            <span className="text-[9px] text-slate-400 font-medium">Blocked by physical objects ({summary.avgShadow}%)</span>
          </div>

          <div className="hidden lg:block text-slate-300 dark:text-slate-700 self-center">
            <ChevronRight className="w-5 h-5" />
          </div>

          {/* Step 3: Diode Bypass Losses */}
          <div className="flex-1 bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-900 flex flex-col gap-1">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">3. Diode Bypass & EOF Loss</span>
            <span className="text-sm font-black text-amber-500">
              -{(4.2 - (4.2 * (summary.avgShadow / 100)) - (4.2 * (summary.avgEfficiency / 100))).toFixed(2)} kW
            </span>
            <span className="text-[9px] text-slate-400 font-medium">Mismatch & edge penalty losses</span>
          </div>

          <div className="hidden lg:block text-slate-300 dark:text-slate-700 self-center">
            <ChevronRight className="w-5 h-5" />
          </div>

          {/* Step 4: Net Power Output */}
          <div className="flex-1 bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex flex-col gap-1">
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">4. Net Power Yield</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {(4.2 * (summary.avgEfficiency / 100)).toFixed(2)} kW
            </span>
            <span className="text-[9px] text-emerald-600/70 dark:text-emerald-400/70 font-medium">Net conversion efficiency: {summary.avgEfficiency}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
