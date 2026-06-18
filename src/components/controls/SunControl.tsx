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

  // Convert Date timestamp to ISO date string (YYYY-MM-DD) for HTML date picker
  const currentDate = new Date(autoDateTimestamp);
  const dateString = currentDate.toISOString().split('T')[0];

  // Convert current time to minutes from midnight for the time slider (range: 6:00 to 20:00 = 360 to 1200)
  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [year, month, day] = e.target.value.split('-').map(Number);
    const newDate = new Date(autoDateTimestamp);
    newDate.setFullYear(year, month - 1, day);
    setAutoDateTimestamp(newDate.getTime());
  };

  const handleTimeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const totalMins = Number(e.target.value);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const newDate = new Date(autoDateTimestamp);
    newDate.setHours(hours, mins, 0, 0);
    setAutoDateTimestamp(newDate.getTime());
  };

  const formatMinutes = (totalMins: number) => {
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  const currentHour = new Date(autoDateTimestamp).getHours();
  const isMorningActive = simulationMode === 'auto' && currentHour >= 6 && currentHour < 18;
  const isNightActive = simulationMode === 'auto' && (currentHour >= 18 || currentHour < 6);

  return (
    <div className="flex flex-col gap-5 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500 animate-pulse" />
          Simulation Settings
        </h3>
        
        {/* Toggle Mode Tab */}
        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200/30 dark:border-slate-800/30">
          <button
            onClick={() => setSimulationMode('auto')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              simulationMode === 'auto'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Auto
          </button>
          <button
            onClick={() => {
              setSimulationMode('manual');
              setIsSimulating(false);
            }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              simulationMode === 'manual'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Manual
          </button>
        </div>
      </div>

      {simulationMode === 'auto' ? (
        <div className="flex flex-col gap-4">
          
          {/* Reposit-style Morning/Night Pill Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-900/60 rounded-2xl p-1 border border-slate-200/40 dark:border-slate-800/40">
            <button
              onClick={() => {
                setIsSimulating(false);
                const newDate = new Date(autoDateTimestamp);
                newDate.setHours(10, 0, 0, 0); // 10:00 AM (Peak Sun)
                setAutoDateTimestamp(newDate.getTime());
              }}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all cursor-pointer ${
                isMorningActive
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/30 dark:border-slate-700/30 font-semibold'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span className="text-xs font-bold">Morning</span>
              <span className="text-[9px] opacity-75">$0 for Electricity</span>
            </button>
            <button
              onClick={() => {
                setIsSimulating(false);
                const newDate = new Date(autoDateTimestamp);
                newDate.setHours(20, 0, 0, 0); // 8:00 PM (Night)
                setAutoDateTimestamp(newDate.getTime());
              }}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all cursor-pointer ${
                isNightActive
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/30 dark:border-slate-700/30 font-semibold'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span className="text-xs font-bold">Night</span>
              <span className="text-[9px] opacity-75">$0 for Electricity</span>
            </button>
          </div>

          {/* Architectural Model Selection */}
          <div className="flex flex-col gap-1.5 border-b border-slate-200/30 dark:border-slate-800/30 pb-3">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Indian House Architecture
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { id: 'flat', name: 'Delhi Flat' },
                { id: 'traditional', name: 'Kerala Trad' },
                { id: 'modern', name: 'Blr Modern' }
              ] as const).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setHouseModel(m.id)}
                  className={`text-[11px] font-bold py-2 px-1.5 rounded-lg border transition-all cursor-pointer ${
                    houseModel === m.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 bg-slate-50/50 dark:bg-slate-900/30'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Locations */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Site Location Presets
            </label>
            <select
              value={selectedLocation.name}
              onChange={(e) => {
                const preset = LOCATION_PRESETS.find((p) => p.name === e.target.value);
                if (preset) setSelectedLocation(preset);
              }}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Date of Analysis
            </label>
            <input
              type="date"
              value={dateString}
              onChange={handleDateChange}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>

          {/* Time Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Time of Day
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                {formatMinutes(currentMinutes)}
              </span>
            </div>
            <input
              type="range"
              min="360" // 06:00 AM
              max="1200" // 08:00 PM
              step="5"
              value={currentMinutes}
              onChange={handleTimeSliderChange}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>06:00 AM</span>
              <span>12:00 PM</span>
              <span>08:00 PM</span>
            </div>
          </div>

          {/* Timelapse Play & Speed Controls */}
          <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-all ${
                  isSimulating
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
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
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span>Timelapse Speed</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{simulationSpeed} min / step</span>
              </div>
              <div className="flex gap-2">
                {[5, 15, 30, 60].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSimulationSpeed(speed)}
                    className={`flex-1 text-xs py-1 rounded-md border transition-all ${
                      simulationSpeed === speed
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
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
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                Azimuth Angle (Compass)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                {Math.round(manualSun.azimuth)}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={manualSun.azimuth}
              onChange={(e) => setManualSun({ azimuth: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0° (N)</span>
              <span>90° (E)</span>
              <span>180° (S)</span>
              <span>270° (W)</span>
              <span>360° (N)</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-slate-400" />
                Elevation Angle (Altitude)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                {Math.round(manualSun.elevation)}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="1"
              value={manualSun.elevation}
              onChange={(e) => setManualSun({ elevation: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0° (Horizon)</span>
              <span>45° (Mid)</span>
              <span>90° (Zenith/Overhead)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
