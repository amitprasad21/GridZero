'use client';
// Reverted codebase to premium glassmorphic UI layout (c95f2bd)

import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import dynamic from 'next/dynamic';
import { SunControl } from '../components/controls/SunControl';
import { ObjectControl } from '../components/controls/ObjectControl';
import { SummaryCards } from '../components/analytics/SummaryCards';
import { ReportExporter } from '../components/analytics/ReportExporter';

const SceneViewer = dynamic(
  () => import('../components/scene/SceneViewer').then((mod) => mod.SceneViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-955/20 text-xs text-slate-400 font-sans">
        Loading 3D workspace...
      </div>
    )
  }
);

const PerformanceChart = dynamic(
  () => import('../components/analytics/PerformanceChart').then((mod) => mod.PerformanceChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-400 font-sans">
        Loading solar forecast charts...
      </div>
    )
  }
);

const PanelList = dynamic(
  () => import('../components/analytics/PanelList').then((mod) => mod.PanelList),
  { ssr: false }
);

import { Sun, Moon, RefreshCw, HelpCircle, Layers, Undo2, Redo2 } from 'lucide-react';

export default function Home() {
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);
  const recalculate = useStore((state) => state.recalculate);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const history = useStore((state) => state.history);
  const future = useStore((state) => state.future);
  const summary = useStore((state) => state.summary);

  // Local tab state toggles for dashboard decluttering
  const [sidebarTab, setSidebarTab] = useState<'sun' | 'layout'>('sun');
  const [analyticsTab, setAnalyticsTab] = useState<'chart' | 'list'>('chart');

  // Accessible Live Region Ref
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Trigger recalculation on load to ensure state is synchronized
  useEffect(() => {
    recalculate();
  }, [recalculate]);

  // Trigger announcements whenever analytical outcomes recalculate (WAI-ARIA compliance)
  useEffect(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Simulation updated. Site efficiency is ${summary.avgEfficiency}%, average shading coverage is ${summary.avgShadow}%`;
    }
  }, [summary.avgEfficiency, summary.avgShadow]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#070a13] tech-grid text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden font-sans">
        {/* Ambient Glowing Background Blobs */}
        <div className="absolute top-[10%] left-[15%] w-[32rem] h-[32rem] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[20%] right-[10%] w-[38rem] h-[38rem] rounded-full bg-teal-500/5 dark:bg-teal-500/10 blur-3xl pointer-events-none" />

        {/* Dynamic accessible live region */}
        <div ref={liveRegionRef} className="sr-only" aria-live="polite" aria-atomic="true" />

        {/* Header Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-900/50 backdrop-blur-md bg-white/70 dark:bg-[#070a13]/70 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/gridzero-logo.png"
              alt="Grid Zero Logo"
              className="w-10 h-10 object-contain rounded-xl"
            />
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent font-heading">
                  GRID ZERO
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-sans">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Solar Shadow Analysis & Efficiency Estimation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Undo/Redo Controls */}
            <div className="flex items-center bg-white/40 dark:bg-slate-900/40 rounded-xl p-0.5 border border-slate-200/40 dark:border-slate-800/40 shadow-inner mr-2 text-[10px] backdrop-blur-md">
              <button
                onClick={() => undo()}
                disabled={history.length === 0}
                className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-35 cursor-pointer text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                aria-label="Undo last change"
                title="Undo last change"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => redo()}
                disabled={future.length === 0}
                className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-35 cursor-pointer text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                aria-label="Redo last reverted change"
                title="Redo last reverted change"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Recalculate Force Trigger */}
            <button
              onClick={() => recalculate()}
              title="Force Recalculate Simulation"
              aria-label="Force Recalculate Simulation"
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl border border-slate-200/40 dark:border-slate-800/40 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>

            {/* Light/Dark Toggle Switch */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl border border-slate-200/40 dark:border-slate-800/40 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-slate-600" />
              )}
            </button>
          </div>
        </header>

        {/* Main Workspace Dashboard */}
        <main className="p-4 sm:p-6 max-w-screen-2xl mx-auto flex flex-col gap-6 relative z-10">
          
          {/* Top Row: Left Sidebar (Controls) + Right 3D Viewport */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Sidebar Controls with clean tab toggle */}
            <div className="flex flex-col gap-4 lg:col-span-4 xl:col-span-3">
              <div className="flex backdrop-blur-md bg-white/40 dark:bg-slate-900/40 rounded-2xl p-1 border border-slate-200/40 dark:border-slate-800/40" role="tablist" aria-label="Sidebar control sections">
                <button
                  id="tab-sun"
                  role="tab"
                  aria-selected={sidebarTab === 'sun'}
                  aria-controls="panel-sun"
                  onClick={() => setSidebarTab('sun')}
                  className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none ${
                    sidebarTab === 'sun'
                      ? 'bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.06)] border border-emerald-500/10 dark:border-emerald-400/10 scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:scale-[1.01]'
                  }`}
                >
                  Simulation & Sun
                </button>
                <button
                  id="tab-layout"
                  role="tab"
                  aria-selected={sidebarTab === 'layout'}
                  aria-controls="panel-layout"
                  onClick={() => setSidebarTab('layout')}
                  className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none ${
                    sidebarTab === 'layout'
                      ? 'bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.06)] border border-emerald-500/10 dark:border-emerald-400/10 scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:scale-[1.01]'
                  }`}
                >
                  Layout Customizer
                </button>
              </div>

              <div
                id="panel-sun"
                role="tabpanel"
                aria-labelledby="tab-sun"
                hidden={sidebarTab !== 'sun'}
                className="flex flex-col gap-4"
              >
                <SunControl />
              </div>

              <div
                id="panel-layout"
                role="tabpanel"
                aria-labelledby="tab-layout"
                hidden={sidebarTab !== 'layout'}
                className="flex flex-col gap-4"
              >
                <ObjectControl />
              </div>
            </div>

            {/* 3D Viewport: 8 Columns on Large Screen */}
            <div className="lg:col-span-8 xl:col-span-9 rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-lg h-[360px] sm:h-[400px] lg:h-[490px] relative bg-slate-100 dark:bg-slate-950/20">
              <SceneViewer />
              
              {/* Overlay Instructions Badge */}
              <div className="absolute top-3 right-3 pointer-events-none hidden md:flex items-center gap-4 bg-slate-900/85 dark:bg-slate-950/90 backdrop-blur-md border border-slate-700/50 text-[10px] font-bold text-slate-200 dark:text-slate-350 py-1.5 px-3.5 rounded-xl shadow-lg tracking-wider font-sans">
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Drag to Orbit | Scroll to Zoom | Right-Click to Pan</span>
                </div>
                <div className="w-px h-3.5 bg-slate-700" />
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  <span>Click objects to select & configure</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Key KPI Summary Cards */}
          <SummaryCards />

          {/* Bottom Row: Tabbed Analytics and Data Breakdown */}
          <div className="flex flex-col gap-5">
            <div className="flex backdrop-blur-md bg-white/40 dark:bg-slate-900/40 rounded-2xl p-1 border border-slate-200/40 dark:border-slate-800/40 max-w-md self-start w-full sm:w-auto" role="tablist" aria-label="Simulation telemetry tabs">
              <button
                id="tab-chart"
                role="tab"
                aria-selected={analyticsTab === 'chart'}
                aria-controls="panel-chart"
                onClick={() => setAnalyticsTab('chart')}
                className={`flex-1 sm:flex-none sm:px-6 text-xs font-bold py-2.5 rounded-xl transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none ${
                  analyticsTab === 'chart'
                    ? 'bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.06)] border border-emerald-500/10 dark:border-emerald-400/10 scale-[1.02]'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:scale-[1.01]'
                }`}
              >
                📊 Daily Solar Forecast
              </button>
              <button
                id="tab-list"
                role="tab"
                aria-selected={analyticsTab === 'list'}
                aria-controls="panel-list"
                onClick={() => setAnalyticsTab('list')}
                className={`flex-1 sm:flex-none sm:px-6 text-xs font-bold py-2.5 rounded-xl transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none ${
                  analyticsTab === 'list'
                    ? 'bg-white dark:bg-slate-955 text-emerald-600 dark:text-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.06)] border border-emerald-500/10 dark:border-emerald-400/10 scale-[1.02]'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:scale-[1.01]'
                }`}
              >
                🔋 Panel Performance Grid
              </button>
            </div>

            <div
              id="panel-chart"
              role="tabpanel"
              aria-labelledby="tab-chart"
              hidden={analyticsTab !== 'chart'}
              className="flex flex-col gap-4"
            >
              <PerformanceChart />
              <ReportExporter />
            </div>

            <div
              id="panel-list"
              role="tabpanel"
              aria-labelledby="tab-list"
              hidden={analyticsTab !== 'list'}
              className="flex flex-col gap-4"
            >
              <PanelList />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/30 dark:border-slate-900/30 mt-12 py-6 px-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
          Grid Zero Solar Simulation Workspace. All math evaluations are computed locally in client-side state.
        </footer>
      </div>
    </div>
  );
}
