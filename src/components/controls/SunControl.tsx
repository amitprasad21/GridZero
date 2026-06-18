import React, { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { LOCATION_PRESETS } from '../../utils/sun';
import { Play, Pause, Sun, Calendar, Clock, MapPin, Compass, Layers } from 'lucide-react';

export const SunControl: React.FC = () => {
  const simulationMode = useStore((state) => state.simulationMode);
  const setSimulationMode = useStore((state) => state.setSimulationMode);
  
  const manualSun = useStore((state) => state.manualSun);
  const setManualSun = useStore((state) => state.setManualSun);
  
  const autoDateTimestamp = useStore((state) => state.autoDateTimestamp);
  const setAutoDateTimestamp = useStore((state) => state.setAutoDateTimestamp);
  
  const selectedLocation = useStore((state) => state.selectedLocation);
  const setSelectedLocation = useStore((state) => state.setSelectedLocation);
  
  const isSimulating = useStore((state) => state.isSimulating);
  const setIsSimulating = useStore((state) => state.setIsSimulating);
  
  const simulationSpeed = useStore((state) => state.simulationSpeed);
  const setSimulationSpeed = useStore((state) => state.setSimulationSpeed);
  
  const tickSimulation = useStore((state) => state.tickSimulation);

  const houseModel = useStore((state) => state.houseModel);
  const setHouseModel = useStore((state) => state.setHouseModel);

  // Interval Ref for Play/Autoplay simulation
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Run the tick handler when playing
  useEffect(() => {
    if (isSimulating) {
      timerRef.current = setInterval(() => {
        tickSimulation();
      }, 30); // 30ms for smooth 30 FPS day cycle playback
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isSimulating, tickSimulation]);

  // Convert UTC timestamp to IST (+5.5 hours) for display and local calculations
  const localDate = new Date(autoDateTimestamp + 5.5 * 60 * 60 * 1000);
  const dateString = localDate.toISOString().split('T')[0];

  // Convert current local time to minutes from midnight for the time slider (range: 6:00 to 20:00 = 360 to 1200) in IST
  const currentMinutes = localDate.getUTCHours() * 60 + localDate.getUTCMinutes();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [year, month, day] = e.target.value.split('-').map(Number);
    const newDate = new Date(autoDateTimestamp + 5.5 * 60 * 60 * 1000);
    newDate.setUTCFullYear(year, month - 1, day);
    const newUtcTimestamp = newDate.getTime() - 5.5 * 60 * 60 * 1000;
    setAutoDateTimestamp(newUtcTimestamp);
  };

  const handleTimeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const totalMins = Number(e.target.value);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const newDate = new Date(autoDateTimestamp + 5.5 * 60 * 60 * 1000);
    newDate.setUTCHours(hours, mins, 0, 0);
    const newUtcTimestamp = newDate.getTime() - 5.5 * 60 * 60 * 1000;
    setAutoDateTimestamp(newUtcTimestamp);
  };

  const formatMinutes = (totalMins: number) => {
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  const currentLocalHour = localDate.getUTCHours();
  const isMorningActive = simulationMode === 'auto' && currentLocalHour >= 6 && currentLocalHour < 18;
  const isNightActive = simulationMode === 'auto' && (currentLocalHour >= 18 || currentLocalHour < 6);

  return (
    <div className="flex flex-col gap-5 p-5 rounded-2xl glass-panel shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-850/50 pb-3">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500 animate-pulse" />
          Simulation Settings
        </h3>
        
        {/* Toggle Mode Tab */}
        <div className="flex bg-slate-100/50 dark:bg-slate-955/60 rounded-xl p-0.5 border border-slate-200/40 dark:border-slate-800/40 shadow-inner" role="tablist" aria-label="Simulation positioning mode">
          <button
            onClick={() => setSimulationMode('auto')}
            role="tab"
            aria-selected={simulationMode === 'auto'}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none ${
              simulationMode === 'auto'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200/20 dark:border-slate-800/20 scale-[1.02]'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-250 hover:scale-[1.01]'
            }`}
          >
            Auto
          </button>
          <button
            onClick={() => {
              setSimulationMode('manual');
              setIsSimulating(false);
            }}
            role="tab"
            aria-selected={simulationMode === 'manual'}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none ${
              simulationMode === 'manual'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200/20 dark:border-slate-800/20 scale-[1.02]'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-250 hover:scale-[1.01]'
            }`}
          >
            Manual
          </button>
        </div>
      </div>

      {simulationMode === 'auto' ? (
        <div className="flex flex-col gap-4">
          
          {/* Reposit-style Morning/Night Pill Selector */}
          <div className="flex bg-slate-100/50 dark:bg-slate-900/40 rounded-2xl p-1 border border-slate-200/40 dark:border-slate-800/40">
            <button
              onClick={() => {
                setIsSimulating(false);
                const newDate = new Date(autoDateTimestamp + 5.5 * 60 * 60 * 1000);
                newDate.setUTCHours(10, 0, 0, 0); // 10:00 AM IST in local Date
                const newUtcTimestamp = newDate.getTime() - 5.5 * 60 * 60 * 1000;
                setAutoDateTimestamp(newUtcTimestamp);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none ${
                isMorningActive
                  ? 'bg-white dark:bg-slate-955 text-emerald-600 dark:text-emerald-400 shadow-md border border-slate-200/30 dark:border-slate-800/30 font-bold scale-[1.01]'
                  : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-250 hover:scale-[1.01]'
              }`}
              aria-label="Set simulation to Morning (10:00 AM peak solar influx)"
            >
              <span className="text-xs font-bold flex items-center gap-1 font-heading">☀️ Morning</span>
              <span className="text-[9px] opacity-80 font-medium font-sans">Peak Solar Influx</span>
            </button>
            <button
              onClick={() => {
                setIsSimulating(false);
                const newDate = new Date(autoDateTimestamp + 5.5 * 60 * 60 * 1000);
                newDate.setUTCHours(20, 0, 0, 0); // 8:00 PM IST in local Date
                const newUtcTimestamp = newDate.getTime() - 5.5 * 60 * 60 * 1000;
                setAutoDateTimestamp(newUtcTimestamp);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none ${
                isNightActive
                  ? 'bg-white dark:bg-slate-955 text-emerald-600 dark:text-emerald-400 shadow-md border border-slate-200/30 dark:border-slate-800/30 font-bold scale-[1.01]'
                  : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-250 hover:scale-[1.01]'
              }`}
              aria-label="Set simulation to Night (8:00 PM grid supply only)"
            >
              <span className="text-xs font-bold flex items-center gap-1 font-heading">🌙 Night</span>
              <span className="text-[9px] opacity-80 font-medium font-sans">Grid Supply Only</span>
            </button>
          </div>

          {/* Architectural Model Selection */}
          <div className="flex flex-col gap-1.5 border-b border-slate-200/30 dark:border-slate-850/30 pb-3">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Indian House Architecture
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'flat', name: 'Delhi Flat' },
                { id: 'traditional', name: 'Kerala Trad' },
                { id: 'modern', name: 'Blr Modern' }
              ] as const).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setHouseModel(m.id)}
                  className={`text-[10px] font-bold py-2 px-1 rounded-xl border transition-all duration-200 cursor-pointer ${
                    houseModel === m.id
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_2px_10px_rgba(16,185,129,0.08)] scale-[1.02]'
                      : 'border-slate-200/50 dark:border-slate-850/50 text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-250 hover:bg-slate-105/50 dark:hover:bg-slate-900/50 bg-slate-50/20 dark:bg-slate-900/20'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Locations */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Site Location Presets
            </label>
            <select
              value={selectedLocation.name}
              onChange={(e) => {
                const preset = LOCATION_PRESETS.find((p) => p.name === e.target.value);
                if (preset) setSelectedLocation(preset);
              }}
              className="w-full select-input bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-slate-750 dark:text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all cursor-pointer"
            >
              {LOCATION_PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} ({Math.abs(p.latitude).toFixed(1)}°{p.latitude >= 0 ? 'N' : 'S'})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Date of Analysis
            </label>
            <input
              type="date"
              value={dateString}
              onChange={handleDateChange}
              className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-slate-750 dark:text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500/30 [color-scheme:light] dark:[color-scheme:dark] transition-all cursor-pointer"
            />
          </div>

          {/* Time Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Time of Day
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 dark:border-emerald-400/20 px-2 py-0.5 rounded-lg tracking-wide text-[10px]">
                {formatMinutes(currentMinutes)}
              </span>
            </div>
            <div className="px-1 py-1">
              <input
                type="range"
                min="360" // 06:00 AM
                max="1200" // 08:00 PM
                step="5"
                value={currentMinutes}
                onChange={handleTimeSliderChange}
                className="w-full slider-input cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              <span>06:00 AM</span>
              <span>12:00 PM</span>
              <span>08:00 PM</span>
            </div>
          </div>

          {/* Timelapse Play & Speed Controls */}
          <div className="border-t border-slate-200/50 dark:border-slate-850/50 pt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isSimulating
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-[0_4px_15px_rgba(245,158,11,0.2)] border border-amber-400/10'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-[0_4px_15px_rgba(16,185,129,0.2)] border border-emerald-450/10'
                }`}
              >
                {isSimulating ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" /> Stop Timelapse
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Play Day Cycle
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-bold">
                <span>Timelapse Speed</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{simulationSpeed} min / step</span>
              </div>
              <div className="flex gap-2">
                {[5, 15, 30, 60].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSimulationSpeed(speed)}
                    className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                      simulationSpeed === speed
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                        : 'border-slate-200/50 dark:border-slate-850/50 text-slate-500 hover:text-slate-700 dark:text-slate-455 dark:hover:text-slate-250 hover:bg-slate-105/50 dark:hover:bg-slate-900/50 bg-slate-50/20 dark:bg-slate-900/20'
                    }`}
                  >
                    {speed}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Manual sliders for Azimuth and Elevation */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                Azimuth Angle (Compass)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 dark:border-emerald-400/20 px-2 py-0.5 rounded-lg tracking-wide text-[10px]">
                {Math.round(manualSun.azimuth)}°
              </span>
            </div>
            <div className="px-1 py-1">
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={manualSun.azimuth}
                onChange={(e) => setManualSun({ azimuth: Number(e.target.value) })}
                className="w-full slider-input cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              <span>0° (N)</span>
              <span>90° (E)</span>
              <span>180° (S)</span>
              <span>270° (W)</span>
              <span>360° (N)</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-slate-400" />
                Elevation Angle (Altitude)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 dark:border-emerald-400/20 px-2 py-0.5 rounded-lg tracking-wide text-[10px]">
                {Math.round(manualSun.elevation)}°
              </span>
            </div>
            <div className="px-1 py-1">
              <input
                type="range"
                min="0"
                max="90"
                step="1"
                value={manualSun.elevation}
                onChange={(e) => setManualSun({ elevation: Number(e.target.value) })}
                className="w-full slider-input cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              <span>0° (Horizon)</span>
              <span>45° (Mid)</span>
              <span>90° (Zenith)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
