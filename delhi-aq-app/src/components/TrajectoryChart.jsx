import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { Calendar, Eye, EyeOff, AlertTriangle, Layers, Info } from 'lucide-react';

// Specific known failure pin dates
const FAILURE_PIN_DATES = [
  { date: '2026-11-12', label: '12 Nov Spike (+100.5)', type: 'spike', color: '#EF4444' },
  { date: '2026-11-01', label: '1 Nov Spike (+74.8)', type: 'spike', color: '#EF4444' },
  { date: '2026-10-30', label: '30 Oct Drop (-45.0)', type: 'drop', color: '#3B82F6' },
  { date: '2026-11-08', label: '8 Nov High (+51.1)', type: 'over', color: '#F59E0B' },
  { date: '2026-11-09', label: '9 Nov Dispersal (-50.5)', type: 'drop', color: '#3B82F6' },
];

export default React.memo(function TrajectoryChart({
  chartData,
  selectedDate,
  setSelectedDate,
  threshold = 60,
  diwaliDates = [],
  isDark = true,
  lang = 'en',
  t,
  onSelectFailurePin,
  disabledMotion = false,
}) {
  // Visibility toggles
  const [showModel, setShowModel] = useState(true);
  const [showActual, setShowActual] = useState(true);
  const [showBaseline, setShowBaseline] = useState(true);
  const [showBand, setShowBand] = useState(true);
  const [showSeasonSplit, setShowSeasonSplit] = useState(true);
  const [showDataGap, setShowDataGap] = useState(true);
  const [showFailurePins, setShowFailurePins] = useState(true);

  // Dynamic colors for Recharts adhering to Lit / Dark Bioluminescent aesthetic
  const colors = useMemo(() => {
    return {
      axis: isDark ? '#94A3B8' : '#64748B',
      tick: isDark ? '#94A3B8' : '#64748B',
      actual: isDark ? '#F8FAFC' : '#0F172A',
      model: isDark ? '#38BDF8' : '#0284C7',
      baseline: isDark ? '#64748B' : '#94A3B8',
      band: isDark ? '#38BDF8' : '#0284C7',
      bandOpacity: isDark ? 0.12 : 0.08,
      naaqs: isDark ? '#F43F5E' : '#DC2626',
      diwali: isDark ? '#F59E0B' : '#D97706',
      split: isDark ? '#A855F7' : '#9333EA',
      gapBg: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.1)',
      cursor: isDark ? '#38BDF8' : '#0284C7',
    };
  }, [isDark]);

  return (
    <div className="w-full p-6 sm:p-8 rounded-3xl border border-[#111111]/15 dark:border-white/10 bg-[#F8F7F4] dark:bg-slate-900/80 backdrop-blur-xl shadow-sm space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-baseline justify-between pb-3 border-b border-[#111111]/10 dark:border-white/10 gap-3">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 block">
            {t('chartTitle')}
          </span>
          <h3 className="font-serif text-xl sm:text-2xl text-[#111111] dark:text-white mt-0.5">
            {t('chartSubtitle')}
          </h3>
        </div>

        {/* Series Visibility Toggles */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setShowModel(!showModel)}
            className={`px-2 py-0.5 rounded border transition ${
              showModel
                ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-cyan-300 font-bold'
                : 'border-[#111111]/15 dark:border-white/10 text-[#6E6D68] dark:text-slate-500'
            }`}
          >
            {t('chartToggleModel')}
          </button>
          <button
            type="button"
            onClick={() => setShowActual(!showActual)}
            className={`px-2 py-0.5 rounded border transition ${
              showActual
                ? 'border-slate-800 dark:border-white bg-slate-800/10 dark:bg-white/10 text-[#111111] dark:text-white font-bold'
                : 'border-[#111111]/15 dark:border-white/10 text-[#6E6D68] dark:text-slate-500'
            }`}
          >
            {t('chartToggleActual')}
          </button>
          <button
            type="button"
            onClick={() => setShowBaseline(!showBaseline)}
            className={`px-2 py-0.5 rounded border transition ${
              showBaseline
                ? 'border-slate-500 bg-slate-500/10 text-[#6E6D68] dark:text-slate-300 font-bold'
                : 'border-[#111111]/15 dark:border-white/10 text-[#6E6D68] dark:text-slate-500'
            }`}
          >
            {t('chartToggleBaseline')}
          </button>
          <button
            type="button"
            onClick={() => setShowBand(!showBand)}
            className={`px-2 py-0.5 rounded border transition ${
              showBand
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-bold'
                : 'border-[#111111]/15 dark:border-white/10 text-[#6E6D68] dark:text-slate-500'
            }`}
          >
            {t('chartToggleBand')}
          </button>

          <span className="w-px h-4 bg-[#111111]/20 dark:bg-white/20 mx-1 hidden sm:block" />

          {/* Diagnostic Overlays Toggles */}
          <button
            type="button"
            onClick={() => setShowSeasonSplit(!showSeasonSplit)}
            className={`px-2 py-0.5 rounded border transition ${
              showSeasonSplit
                ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold'
                : 'border-[#111111]/15 dark:border-white/10 text-[#6E6D68] dark:text-slate-500'
            }`}
          >
            {t('chartToggleSplit')}
          </button>
          <button
            type="button"
            onClick={() => setShowDataGap(!showDataGap)}
            className={`px-2 py-0.5 rounded border transition ${
              showDataGap
                ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold'
                : 'border-[#111111]/15 dark:border-white/10 text-[#6E6D68] dark:text-slate-500'
            }`}
          >
            {t('chartToggleGap')}
          </button>
          <button
            type="button"
            onClick={() => setShowFailurePins(!showFailurePins)}
            className={`px-2 py-0.5 rounded border transition ${
              showFailurePins
                ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-300 font-bold'
                : 'border-[#111111]/15 dark:border-white/10 text-[#6E6D68] dark:text-slate-500'
            }`}
          >
            {t('chartTogglePins')}
          </button>
        </div>
      </div>

      {/* Interactive Chart Canvas */}
      <div className="h-80 sm:h-[440px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            key={`${isDark ? 'dark' : 'light'}-${selectedDate}`}
            data={chartData}
            margin={{ top: 20, right: 15, left: -15, bottom: 5 }}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload[0]) {
                const clickedDate = e.activePayload[0].payload.date;
                setSelectedDate(clickedDate);
                // If it's a known failure date, notify inspector
                const isFail = FAILURE_PIN_DATES.find((p) => p.date === clickedDate);
                if (isFail && onSelectFailurePin) {
                  onSelectFailurePin(clickedDate);
                }
              }
            }}
          >
            <XAxis
              dataKey="date"
              stroke={colors.axis}
              strokeWidth={1}
              tickLine={{ stroke: colors.axis }}
              tick={{ fontSize: 10, fill: colors.tick, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(val) => {
                const parts = val.split('-');
                return `${parts[1]}/${parts[2]}`;
              }}
              minTickGap={24}
            />
            <YAxis
              stroke={colors.axis}
              strokeWidth={1}
              tickLine={{ stroke: colors.axis }}
              tick={{ fontSize: 10, fill: colors.tick, fontFamily: 'JetBrains Mono' }}
              domain={[0, 'auto']}
            />

            {/* Custom Tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  const isFail = FAILURE_PIN_DATES.find((p) => p.date === d.date);
                  return (
                    <div className="p-3.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl font-mono text-xs max-w-[280px] space-y-1.5 z-50">
                      <div className="flex justify-between items-center pb-1 border-b border-[#111111]/10 dark:border-white/10 font-bold">
                        <span className="text-[#111111] dark:text-white">{d.date}</span>
                        {d.in_diwali_window ? (
                          <span className="text-amber-500 font-bold text-[10px]">★ DIWALI</span>
                        ) : null}
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-[#6E6D68] dark:text-slate-400">Actual PM2.5:</span>
                          <strong className="text-[#111111] dark:text-white">
                            {Number(d.actual).toFixed(1)} µg/m³
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6E6D68] dark:text-slate-400">Model Forecast:</span>
                          <strong className="text-blue-600 dark:text-cyan-400">
                            {Number(d.model).toFixed(1)} µg/m³
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6E6D68] dark:text-slate-400">Baseline (t=t-1):</span>
                          <span>{Number(d.baseline).toFixed(1)} µg/m³</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6E6D68] dark:text-slate-400">80% Interval:</span>
                          <span>
                            {Number(d.lower_80 ?? d.lower).toFixed(1)} – {Number(d.upper_80 ?? d.upper).toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-[#111111]/10 dark:border-white/10">
                          <span className="text-[#6E6D68] dark:text-slate-400">Abs Error:</span>
                          <span className="font-bold text-red-500">
                            |{Number(Math.abs(d.actual - d.model)).toFixed(1)}| µg/m³
                          </span>
                        </div>
                        {isFail ? (
                          <div className="p-1.5 rounded bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-[10px] font-bold">
                            ⚡ {isFail.label} (Click to inspect hypothesis)
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Late-Sep to Mid-Oct Missing OpenAQ Gap Callout */}
            {showDataGap ? (
              <ReferenceArea
                x1="2026-09-24"
                x2="2026-10-09"
                fill={colors.gapBg}
                stroke={colors.diwali}
                strokeDasharray="3 3"
                label={{
                  value: '14-Day OpenAQ Sensor Gap (Interpolated)',
                  position: 'insideTopLeft',
                  fill: colors.diwali,
                  fontSize: 9,
                  fontFamily: 'JetBrains Mono',
                }}
              />
            ) : null}

            {/* 15 Oct Season Split Line */}
            {showSeasonSplit ? (
              <ReferenceLine
                x="2026-10-15"
                stroke={colors.split}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: '15 OCT: SMOG SEASON REGIME SPLIT →',
                  position: 'insideTopLeft',
                  fill: colors.split,
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                  fontWeight: 'bold',
                }}
              />
            ) : null}

            {/* NAAQS Regulatory Standard Reference Line */}
            <ReferenceLine
              y={threshold}
              stroke={colors.naaqs}
              strokeDasharray="4 4"
              strokeWidth={1.25}
              label={{
                value: `NAAQS LIMIT (${threshold} µg/m³)`,
                fill: colors.naaqs,
                fontSize: 9,
                fontFamily: 'JetBrains Mono',
                position: 'top',
              }}
            />

            {/* Diwali Date Markers */}
            {diwaliDates.map((dw) => (
              <ReferenceLine
                key={dw}
                x={dw}
                stroke={colors.diwali}
                strokeWidth={1.2}
                label={{
                  value: `DIWALI (${dw})`,
                  fill: colors.diwali,
                  fontSize: 9,
                  fontFamily: 'JetBrains Mono',
                  position: 'insideTopRight',
                }}
              />
            ))}

            {/* Single 80% Shaded Uncertainty Band */}
            {showBand ? (
              <>
                <Area
                  type="monotone"
                  dataKey="rangeBase"
                  stackId="range"
                  stroke="transparent"
                  fill="transparent"
                  legendType="none"
                  isAnimationActive={!disabledMotion}
                  animationDuration={700}
                />
                <Area
                  name="80% Range"
                  type="monotone"
                  dataKey="rangeDelta"
                  stackId="range"
                  stroke="transparent"
                  fill={colors.band}
                  fillOpacity={colors.bandOpacity}
                  isAnimationActive={!disabledMotion}
                  animationDuration={700}
                />
              </>
            ) : null}

            {/* Actual Ground Station Measurements Line */}
            {showActual ? (
              <Line
                name="Actual"
                type="monotone"
                dataKey="actual"
                stroke={colors.actual}
                strokeWidth={1.75}
                dot={{ r: 1.5, fill: colors.actual }}
                activeDot={{ r: 5, fill: colors.actual }}
                isAnimationActive={!disabledMotion}
                animationDuration={700}
              />
            ) : null}

            {/* HistGBM Model Prediction Line */}
            {showModel ? (
              <Line
                name="Model"
                type="monotone"
                dataKey="model"
                stroke={colors.model}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: colors.model }}
                isAnimationActive={!disabledMotion}
                animationDuration={700}
              />
            ) : null}

            {/* Naive Persistence Baseline */}
            {showBaseline ? (
              <Line
                name="Baseline"
                type="monotone"
                dataKey="baseline"
                stroke={colors.baseline}
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                isAnimationActive={!disabledMotion}
                animationDuration={700}
              />
            ) : null}

            {/* Interactive Failure Pins (Clickable reference lines) */}
            {showFailurePins
              ? FAILURE_PIN_DATES.map((pin) => (
                  <ReferenceLine
                    key={pin.date}
                    x={pin.date}
                    stroke={pin.color}
                    strokeWidth={1.5}
                    label={{
                      value: `▼ ${pin.label}`,
                      fill: pin.color,
                      fontSize: 8.5,
                      fontFamily: 'JetBrains Mono',
                      position: 'insideBottomRight',
                    }}
                  />
                ))
              : null}

            {/* Active Selected Day Cursor */}
            {selectedDate ? (
              <ReferenceLine
                x={selectedDate}
                stroke={colors.cursor}
                strokeWidth={2}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Diagnostic Summary */}
      <div className="pt-3 border-t border-[#111111]/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-[#6E6D68] dark:text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>
            {lang === 'hi'
              ? 'विशिष्ट तिथि का निरीक्षण करने हेतु किसी बिंदु अथवा विफलता पिन पर क्लिक करें।'
              : 'Click any point or failure pin (▼) to inspect that date & open its meteorological hypothesis.'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> 15 Oct Split
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Sensor Gap
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Failure Pins
          </span>
        </div>
      </div>
    </div>
  );
});
