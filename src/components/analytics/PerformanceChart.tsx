import React from 'react';
import { useStore } from '../../store/useStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Activity, Clock } from 'lucide-react';

export const PerformanceChart: React.FC = () => {
  const timeSeriesData = useStore((state) => state.timeSeriesData);
  const theme = useStore((state) => state.theme);
  const selectedLocation = useStore((state) => state.selectedLocation);

  const gridColor = theme === 'dark' ? 'rgba(51, 65, 85, 0.3)' : 'rgba(203, 213, 225, 0.4)';
  const tooltipBg = theme === 'dark' ? '#070a13' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#1e293b' : '#e2e8f0';
  const labelColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl glass-panel shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-850/50 pb-3">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
          Daily Performance Forecast
        </h3>
        <span className="text-[10px] text-slate-450 dark:text-slate-550 font-bold flex items-center gap-1 uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {selectedLocation.name}
        </span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={timeSeriesData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="time"
              stroke={labelColor}
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke={labelColor}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={labelColor}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
              hide={true} // Keep it hidden for cleanliness, but keep the yAxisId mapping
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                borderRadius: '12px',
                color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                fontSize: '11px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                backdropFilter: 'blur(4px)'
              }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '10px', fontWeight: 500 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="efficiency"
              name="Site Efficiency %"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 3, strokeWidth: 0, fill: '#10b981' }}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="shadow"
              name="Shadow Coverage %"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 2, strokeWidth: 0, fill: '#f59e0b' }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
