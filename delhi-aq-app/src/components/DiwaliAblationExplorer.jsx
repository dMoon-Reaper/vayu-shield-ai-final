import React, { useState } from 'react';
import TiltCard from './TiltCard';
import AnimatedSvgWrapper from './AnimatedSvgWrapper';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Flame, Calendar, Award, Info, CheckCircle2, AlertCircle } from 'lucide-react';

const DIWALI_VARIANTS = [
  {
    name: 'Persistence (t = t-1)',
    shortName: 'Persistence',
    rmse: 21.7,
    maeAll: 13.7,
    maeSeason: 30.8,
    maeDiwali: 43.1,
    maePreSeason: 8.3,
    description: 'Naive baseline projecting yesterday\'s PM2.5 directly onto tomorrow.',
    highlight: false,
  },
  {
    name: 'GBM (Standard)',
    shortName: 'GBM Base',
    rmse: 21.0,
    maeAll: 13.7,
    maeSeason: 31.9,
    maeDiwali: 38.2,
    maePreSeason: 7.9,
    description: 'HistGradientBoostingRegressor trained on standard meteorology & lag features.',
    highlight: false,
  },
  {
    name: 'GBM + Diwali Features',
    shortName: 'GBM + Diwali',
    rmse: 20.8,
    maeAll: 13.6,
    maeSeason: 31.6,
    maeDiwali: 38.1,
    maePreSeason: 7.9,
    description: 'GBM with explicit diwali_offset (-10 to +10) & binary window flags.',
    highlight: false,
  },
  {
    name: 'GBM Log-Ratio Target',
    shortName: 'GBM LogRatio',
    rmse: 20.0,
    maeAll: 13.2,
    maeSeason: 29.9,
    maeDiwali: 37.7,
    maePreSeason: 7.8,
    description: 'GBM predicting ln(tomorrow/today) multiplicative scaling factor.',
    highlight: true,
  },
  {
    name: 'GBM Log-Ratio + Diwali',
    shortName: 'LogRatio + Diwali',
    rmse: 20.0,
    maeAll: 13.2,
    maeSeason: 29.9,
    maeDiwali: 37.7,
    maePreSeason: 7.8,
    description: 'Combining multiplicative log-ratio target with Diwali calendar features.',
    highlight: true,
  },
];

const DIWALI_SOURCES = [
  { year: '2023', date: '2023-11-12', source: 'Drik Panchang / CPCB Historical Observation' },
  { year: '2024', date: '2024-10-31', source: 'Astronomical Ephemeris & CPCB Record' },
  { year: '2025', date: '2025-10-20', source: 'Indian Astronomical Almanac' },
  { year: '2026', date: '2026-11-08', source: 'National Calendar of India / Test Evaluation Event' },
];

export default React.memo(function DiwaliAblationExplorer({
  isDark = true,
  lang = 'en',
  t,
  disabledMotion = false,
}) {
  const [selectedMetric, setSelectedMetric] = useState('maeSeason'); // 'maeAll' | 'maeSeason' | 'maeDiwali' | 'rmse'

  return (
    <section className="w-full space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-3 border-b border-[#111111]/15 dark:border-white/10 gap-2">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            {t('diwaliTitle')}
          </span>
          <h3 className="font-serif text-2xl text-[#111111] dark:text-white mt-0.5">
            {t('diwaliSubtitle')}
          </h3>
        </div>
        <span className="font-mono text-xs text-[#6E6D68] dark:text-slate-400">
          5 EXPERIMENTAL VARIANTS FROM MODEL_DIWALI.PY
        </span>
      </div>

      {/* Scientific Integrity Callout */}
      <div className="p-4 rounded-xl border border-blue-300 dark:border-cyan-800/40 bg-blue-50/60 dark:bg-slate-900/60 font-mono text-xs space-y-1">
        <div className="font-bold text-blue-900 dark:text-cyan-300 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
          <span>SCIENTIFIC INTEGRITY DISCLOSURE // ABLATION SUMMARY:</span>
        </div>
        <p className="font-sans text-xs text-[#111111] dark:text-slate-300 leading-relaxed">
          {t('diwaliTakeaway')}
        </p>
      </div>

      {/* Comparative Bar Chart of the 5 Variants */}
      <div className="p-6 rounded-2xl border border-[#111111]/15 dark:border-white/10 bg-[#F8F7F4] dark:bg-slate-900/80 backdrop-blur-xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#111111]/10 dark:border-white/10 gap-2">
          <span className="font-mono text-xs font-bold text-[#111111] dark:text-white uppercase">
            REGRESSION ERROR COMPARISON (µg/m³ • LOWER IS BETTER)
          </span>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[#6E6D68] dark:text-slate-400">Metric:</span>
            {[
              { id: 'maeSeason', label: 'Smog Season MAE' },
              { id: 'maeDiwali', label: 'Diwali Window MAE' },
              { id: 'maeAll', label: 'Overall MAE' },
              { id: 'rmse', label: 'Overall RMSE' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMetric(m.id)}
                className={`px-2 py-0.5 rounded border text-[11px] transition ${
                  selectedMetric === m.id
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold'
                    : 'border-[#111111]/15 dark:border-white/10 text-[#6E6D68] dark:text-slate-500'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={DIWALI_VARIANTS}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={isDark ? 0.1 : 0.15} />
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 10, fill: isDark ? '#94A3B8' : '#64748B', fontFamily: 'JetBrains Mono' }}
                stroke={isDark ? '#64748B' : '#94A3B8'}
              />
              <YAxis
                tick={{ fontSize: 10, fill: isDark ? '#94A3B8' : '#64748B', fontFamily: 'JetBrains Mono' }}
                stroke={isDark ? '#64748B' : '#94A3B8'}
                domain={[0, 'auto']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="p-3 rounded-lg border border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl font-mono text-xs space-y-1">
                        <strong className="text-[#111111] dark:text-white block">{item.name}</strong>
                        <div className="text-[11px] text-[#6E6D68] dark:text-slate-300">
                          {item.description}
                        </div>
                        <div className="pt-1 border-t border-[#111111]/10 dark:border-white/10 text-amber-600 dark:text-amber-400 font-bold">
                          {selectedMetric === 'maeSeason' && `Smog Season MAE: ±${item.maeSeason} µg/m³`}
                          {selectedMetric === 'maeDiwali' && `Diwali Window MAE: ±${item.maeDiwali} µg/m³`}
                          {selectedMetric === 'maeAll' && `Overall MAE: ±${item.maeAll} µg/m³`}
                          {selectedMetric === 'rmse' && `Overall RMSE: ${item.rmse} µg/m³`}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey={selectedMetric}
                fill={isDark ? '#38BDF8' : '#0284C7'}
                radius={[6, 6, 0, 0]}
                isAnimationActive={!disabledMotion}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comprehensive 5-Variant Comparison Table */}
      <div className="overflow-x-auto border border-[#111111]/15 dark:border-white/10 rounded-2xl bg-[#F8F7F4] dark:bg-slate-900/80 shadow-sm">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-[#111111]/[0.03] dark:bg-slate-800/60 border-b border-[#111111]/15 dark:border-white/10 text-[11px] text-[#6E6D68] dark:text-slate-400">
              <th className="p-3 border-r border-[#111111]/15 dark:border-white/10 font-bold text-[#111111] dark:text-white">
                MODEL VARIANT
              </th>
              <th className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-center">
                RMSE ALL
              </th>
              <th className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-center">
                MAE ALL (120d)
              </th>
              <th className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-center text-purple-700 dark:text-purple-300 font-bold">
                MAE SEASON (≥15 Oct)
              </th>
              <th className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-center text-amber-700 dark:text-amber-300 font-bold">
                MAE DIWALI (8d)
              </th>
              <th className="p-3 text-center">MAE PRE-OCT 15 (91d)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#111111]/10 dark:divide-white/10">
            {DIWALI_VARIANTS.map((v) => (
              <tr
                key={v.name}
                className={`hover:bg-[#111111]/[0.02] dark:hover:bg-slate-800/40 transition-colors ${
                  v.highlight ? 'bg-blue-50/50 dark:bg-cyan-950/20 font-semibold' : ''
                }`}
              >
                <td className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-[#111111] dark:text-white">
                  <div className="flex items-center gap-1.5">
                    {v.highlight ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    ) : null}
                    <span>{v.name}</span>
                  </div>
                </td>
                <td className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-center tabular-nums">
                  {v.rmse.toFixed(1)}
                </td>
                <td className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-center tabular-nums">
                  {v.maeAll.toFixed(1)}
                </td>
                <td className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-center tabular-nums text-purple-700 dark:text-purple-300 font-bold">
                  {v.maeSeason.toFixed(1)}
                </td>
                <td className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-center tabular-nums text-amber-700 dark:text-amber-300 font-bold">
                  {v.maeDiwali.toFixed(1)}
                </td>
                <td className="p-3 text-center tabular-nums text-[#6E6D68] dark:text-slate-400">
                  {v.maePreSeason.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cited Diwali Dates Reference Deck */}
      <div className="p-4 rounded-xl border border-[#111111]/10 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 font-mono text-xs space-y-2">
        <div className="font-bold text-[#111111] dark:text-white uppercase flex items-center gap-1.5 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-amber-500" />
          <span>CITED DIWALI DATES (LAKSHMI PUJA EPHEMERIS SOURCES):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {DIWALI_SOURCES.map((s) => (
            <div
              key={s.year}
              className="p-2 rounded border border-[#111111]/10 dark:border-white/10 bg-[#F8F7F4] dark:bg-slate-800/40"
            >
              <div className="flex justify-between font-bold text-[#111111] dark:text-white">
                <span>{s.year}</span>
                <span className="text-amber-600 dark:text-amber-400">{s.date}</span>
              </div>
              <span className="text-[10px] text-[#6E6D68] dark:text-slate-400 block mt-0.5 truncate">
                {s.source}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
