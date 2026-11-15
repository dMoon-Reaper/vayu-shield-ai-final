import React, { useState, useMemo, startTransition } from 'react';
import TiltCard from './TiltCard';
import AnimatedSvgWrapper from './AnimatedSvgWrapper';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Copy,
  Check,
  Calendar,
  Flame,
  Zap,
  Info,
  Sliders,
  Send,
} from 'lucide-react';

const THRESHOLD_OPTIONS = [
  { value: 35, label: '35 µg/m³ (US EPA)' },
  { value: 60, label: '60 µg/m³ (Indian NAAQS)' },
  { value: 90, label: '90 µg/m³ (Unhealthy Sensitive)' },
  { value: 120, label: '120 µg/m³ (Very Poor)' },
  { value: 250, label: '250 µg/m³ (Severe+)' },
];

function HeroCounter({ targetValue, disabled }) {
  const [val, setVal] = React.useState(targetValue);
  const targetRef = React.useRef(targetValue);

  React.useEffect(() => {
    targetRef.current = targetValue;
    if (disabled || typeof targetValue !== 'number' || isNaN(targetValue)) {
      setVal(targetValue);
      return;
    }

    const start = 0;
    const end = targetValue;
    const startTime = performance.now();
    const duration = 850;

    let frameId;
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * ease;

      if (progress < 1) {
        setVal(current);
        frameId = requestAnimationFrame(tick);
      } else {
        setVal(targetRef.current);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [targetValue, disabled]);

  if (val === null || val === undefined || isNaN(val)) return '—';
  return Number(val).toFixed(1);
}

export default React.memo(function HeroDecisionConsole({
  isDark = true,
  lang = 'en',
  t,
  data,
  currentDay,
  currentDayIndex,
  selectedDate,
  setSelectedDate,
  policy,
  setPolicy,
  selectedThreshold,
  setSelectedThreshold,
  mode,
  liveData,
  onJumpDiwali,
  onJumpPeak,
  onJumpCleanest,
  onJumpWorst,
  disabledMotion = false,
}) {
  // Advisory synthesis state
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [advisory, setAdvisory] = useState(null);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [advisoryCopied, setAdvisoryCopied] = useState(false);

  // Target object to evaluate: liveData or currentDay
  const targetObj = mode === 'live' && liveData?.status === 'ok' ? liveData : currentDay;
  const pm25Value = targetObj ? targetObj.model : 0;
  const lowerVal = targetObj ? (targetObj.lower_80 ?? targetObj.lower) : 0;
  const upperVal = targetObj ? (targetObj.upper_80 ?? targetObj.upper) : 0;
  const baselineVal = targetObj ? targetObj.baseline : 0;
  const targetDate = targetObj ? (mode === 'live' ? targetObj.forecast_for : targetObj.date) : '—';
  const inDiwali = Boolean(targetObj?.in_diwali_window);

  // Determine active alert verdict for selected threshold and policy
  const isAlertActive = useMemo(() => {
    if (!targetObj) return false;
    const thresh = selectedThreshold;
    if (policy === 'point') {
      return targetObj.model > thresh;
    }
    if (policy === 'conservative') {
      return upperVal > thresh;
    }
    // 'calibrated' (mid-risk recommended): model + 6 > thresh (with calibrated buffers)
    return (targetObj.model + 6.0) > thresh;
  }, [targetObj, policy, selectedThreshold, upperVal]);

  // Real-time trade-off stats from threshold_table in results.json
  const activeStats = useMemo(() => {
    if (!data.threshold_table) return { hit: 0, miss: 0, fa: 0, daysAbove: 0 };
    const row = data.threshold_table.find((r) => r.threshold === selectedThreshold);
    if (!row) return { hit: 0, miss: 0, fa: 0, daysAbove: 0 };

    if (policy === 'point') {
      return { hit: row.pt_hit, miss: row.pt_miss, fa: row.pt_fa, daysAbove: row.days_above };
    }
    if (policy === 'conservative') {
      return { hit: row.ct_hit, miss: row.ct_miss, fa: row.ct_fa, daysAbove: row.days_above };
    }
    return { hit: row.pr_hit, miss: row.pr_miss, fa: row.pr_fa, daysAbove: row.days_above };
  }, [data.threshold_table, selectedThreshold, policy]);

  // Determine protocol severity band
  const protocolBand = useMemo(() => {
    if (!isAlertActive) return 'green';
    if (pm25Value > 120 || selectedThreshold >= 120) return 'crimson';
    return 'amber';
  }, [isAlertActive, pm25Value, selectedThreshold]);

  // Replay Date Stepper handlers
  const handlePrevDay = () => {
    if (currentDayIndex > 0 && data.days) {
      startTransition(() => setSelectedDate(data.days[currentDayIndex - 1].date));
    }
  };

  const handleNextDay = () => {
    if (data.days && currentDayIndex < data.days.length - 1) {
      startTransition(() => setSelectedDate(data.days[currentDayIndex + 1].date));
    }
  };

  // Generate Advisory Dispatch
  const generateAdvisory = async () => {
    if (!targetObj) return;
    setAdvisoryLoading(true);

    const diwaliNote = inDiwali
      ? (lang === 'hi' ? ' (दीवाली पर्व उत्सर्जन का प्रभाव)' : ' heightened particulate burden due to festival emissions')
      : '';

    const fallbackText = isAlertActive
      ? (lang === 'hi'
          ? `कल के लिए (${targetDate}): मॉडल पूर्वानुमान ${Number(pm25Value).toFixed(1)} µg/m³ (80% दायरा ${Number(lowerVal).toFixed(1)}–${Number(upperVal).toFixed(1)} µg/m³) चयनित सीमा ${selectedThreshold} µg/m³ से अधिक है${diwaliNote}। आधिकारिक निर्देश: 07:30 AM की सुबह की प्रार्थना सभा व बाहरी खेलकूद तुरंत इनडोर आयोजित करें, तथा स्कूल के एयर प्यूरीफायर चालू रखें। दमा पीड़ित छात्रों के इनहेलर की जांच करें।`
          : `TOMORROW (${targetDate}): Forecast of ${Number(pm25Value).toFixed(1)} µg/m³ (80% range ${Number(lowerVal).toFixed(1)}–${Number(upperVal).toFixed(1)} µg/m³) exceeds the ${selectedThreshold} µg/m³ standard${diwaliNote}. Directives: Relocate 07:30 AM assembly indoors, suspend vigorous outdoor PE, and activate school HEPA air purification. Staff should monitor asthmatic pupils closely.`)
      : (lang === 'hi'
          ? `कल के लिए (${targetDate}): मॉडल पूर्वानुमान ${Number(pm25Value).toFixed(1)} µg/m³ (80% दायरा ${Number(lowerVal).toFixed(1)}–${Number(upperVal).toFixed(1)} µg/m³) चयनित मानक ${selectedThreshold} µg/m³ के सुरक्षित दायरे में है${diwaliNote}। सुबह की प्रार्थना सभा और खेलकूद अभ्यास सामान्य रूप से मैदान में जारी रखने की अनुमति है।`
          : `TOMORROW (${targetDate}): Forecast of ${Number(pm25Value).toFixed(1)} µg/m³ (80% range ${Number(lowerVal).toFixed(1)}–${Number(upperVal).toFixed(1)} µg/m³) remains within the ${selectedThreshold} µg/m³ threshold${diwaliNote}. Outdoor morning assembly and physical education training are approved to proceed as scheduled.`);

    if (!apiKey) {
      setTimeout(() => {
        setAdvisory(fallbackText);
        setAdvisoryLoading(false);
      }, 150);
      return;
    }

    try {
      const promptText = `You are a school operations director in Delhi. Write 2 concise sentences for morning directives. Language: ${
        lang === 'hi' ? 'Hindi (Devanagari)' : 'English'
      }. Target Date: ${targetDate}. Forecast PM2.5: ${Number(pm25Value).toFixed(1)} µg/m³. 80% Range: ${Number(lowerVal).toFixed(1)}–${Number(upperVal).toFixed(1)} µg/m³. Threshold: ${selectedThreshold} µg/m³. Status: ${
        isAlertActive ? 'ALERT' : 'SAFE'
      }. State clearly if outdoor assembly & PE are cancelled or approved.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 240 },
          }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      setAdvisory(text || fallbackText);
    } catch {
      setAdvisory(fallbackText);
    } finally {
      setAdvisoryLoading(false);
    }
  };

  const copyAdvisory = () => {
    if (!advisory) return;
    navigator.clipboard.writeText(advisory);
    setAdvisoryCopied(true);
    setTimeout(() => setAdvisoryCopied(false), 2000);
  };

  return (
    <section className="w-full space-y-6">
      {/* Console Top Control Deck */}
      <div className="p-6 rounded-2xl border border-[#111111]/15 dark:border-white/10 bg-[#F8F7F4] dark:bg-slate-900/80 backdrop-blur-xl shadow-sm space-y-5">
        {/* Title & Date Stepper Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#111111]/10 dark:border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-blue-600 dark:text-cyan-400 font-bold uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" />
              <span>{t('consoleTitle')}</span>
            </div>
            <h2 className="font-serif text-2xl text-[#111111] dark:text-white mt-1">
              {t('consoleSubtitle')}
            </h2>
          </div>

          {/* Date Selector / Stepper */}
          {mode === 'replay' ? (
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <div className="flex items-center border border-[#111111]/20 dark:border-white/20 rounded-lg p-1 bg-white/50 dark:bg-slate-800/50">
                <button
                  type="button"
                  onClick={handlePrevDay}
                  disabled={currentDayIndex <= 0}
                  className="px-2 py-1 rounded hover:bg-[#111111]/10 dark:hover:bg-white/10 disabled:opacity-30 font-bold"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <select
                  value={selectedDate}
                  onChange={(e) => startTransition(() => setSelectedDate(e.target.value))}
                  className="bg-transparent text-[#111111] dark:text-white font-mono font-bold text-xs px-2 py-1 focus:outline-none cursor-pointer"
                >
                  {data.days &&
                    data.days.map((d) => (
                      <option
                        key={d.date}
                        value={d.date}
                        className="bg-[#F8F7F4] dark:bg-slate-900 text-[#111111] dark:text-white font-mono"
                      >
                        {d.date} {d.in_diwali_window ? '★ Diwali' : ''} {d.actual > 60 ? '• Alert' : ''}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleNextDay}
                  disabled={!data.days || currentDayIndex >= data.days.length - 1}
                  className="px-2 py-1 rounded hover:bg-[#111111]/10 dark:hover:bg-white/10 disabled:opacity-30 font-bold"
                  title="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Jump Presets */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={onJumpDiwali}
                  className="px-2.5 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-500/20 transition"
                >
                  ★ {t('jumpDiwali')}
                </button>
                <button
                  type="button"
                  onClick={onJumpPeak}
                  className="px-2.5 py-1 rounded border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 font-bold hover:bg-red-500/20 transition"
                >
                  ▲ {t('jumpPeak')}
                </button>
                <button
                  type="button"
                  onClick={onJumpCleanest}
                  className="px-2.5 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-500/20 transition"
                >
                  ● {t('jumpClean')}
                </button>
                <button
                  type="button"
                  onClick={onJumpWorst}
                  className="px-2.5 py-1 rounded border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-500/20 transition"
                >
                  ⚡ {t('jumpWorst')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 font-mono text-xs text-blue-600 dark:text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-ping" />
              <span>LIVE AUTOMATION // GITHUB ACTIONS</span>
            </div>
          )}
        </div>

        {/* 2-Tier Interactive Switchers: Rule & Threshold */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 font-mono text-xs">
          {/* Left: Decision Rule Switcher */}
          <div className="lg:col-span-6 space-y-2">
            <span className="text-[11px] text-[#6E6D68] dark:text-slate-400 uppercase font-bold block">
              {t('ruleSelectorLabel')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => startTransition(() => setPolicy('point'))}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                  policy === 'point'
                    ? 'border-blue-600 dark:border-cyan-400 bg-blue-50 dark:bg-cyan-950/40 text-blue-900 dark:text-cyan-200 font-bold shadow-sm'
                    : 'border-[#111111]/15 dark:border-white/10 hover:bg-[#111111]/[0.02] dark:hover:bg-slate-800/40 text-[#6E6D68] dark:text-slate-400'
                }`}
              >
                <span className="text-[10px] uppercase block">Rule A</span>
                <span className="text-xs mt-1">Point Forecast</span>
                <span className="text-[10px] text-[#6E6D68] dark:text-slate-500 mt-1">model &gt; cutoff</span>
              </button>

              <button
                type="button"
                onClick={() => startTransition(() => setPolicy('calibrated'))}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                  policy === 'calibrated'
                    ? 'border-emerald-600 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-sm'
                    : 'border-[#111111]/15 dark:border-white/10 hover:bg-[#111111]/[0.02] dark:hover:bg-slate-800/40 text-[#6E6D68] dark:text-slate-400'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] uppercase">
                  <span>Rule B ★</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">REC</span>
                </div>
                <span className="text-xs mt-1">Mid-Risk Buffer</span>
                <span className="text-[10px] text-[#6E6D68] dark:text-slate-500 mt-1">+6 µg/m³ • 2 FAs</span>
              </button>

              <button
                type="button"
                onClick={() => startTransition(() => setPolicy('conservative'))}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                  policy === 'conservative'
                    ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold shadow-sm'
                    : 'border-[#111111]/15 dark:border-white/10 hover:bg-[#111111]/[0.02] dark:hover:bg-slate-800/40 text-[#6E6D68] dark:text-slate-400'
                }`}
              >
                <span className="text-[10px] uppercase block">Rule C</span>
                <span className="text-xs mt-1">Conservative q80</span>
                <span className="text-[10px] text-[#6E6D68] dark:text-slate-500 mt-1">upper_80 &gt; cutoff</span>
              </button>
            </div>
          </div>

          {/* Right: Regulatory Threshold Selector Pills */}
          <div className="lg:col-span-6 space-y-2">
            <span className="text-[11px] text-[#6E6D68] dark:text-slate-400 uppercase font-bold block">
              {t('thresholdPillsLabel')}
            </span>
            <div className="flex flex-wrap gap-2">
              {THRESHOLD_OPTIONS.map((opt) => {
                const isSelected = selectedThreshold === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => startTransition(() => setSelectedThreshold(opt.value))}
                    className={`px-3 py-2 rounded-xl border text-xs font-mono transition-all duration-150 ${
                      isSelected
                        ? 'border-blue-600 dark:border-cyan-400 bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold shadow-md shadow-blue-500/20'
                        : 'border-[#111111]/15 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 text-[#111111] dark:text-slate-300 hover:border-blue-400 dark:hover:border-cyan-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic School Protocol Output Hero Card */}
      <TiltCard
        maxTilt={4}
        className={`rounded-3xl border-2 p-6 sm:p-10 transition-colors duration-300 ${
          protocolBand === 'crimson'
            ? 'border-red-500 bg-red-500/[0.04] dark:bg-red-950/30'
            : protocolBand === 'amber'
            ? 'border-amber-500 bg-amber-500/[0.04] dark:bg-amber-950/30'
            : 'border-emerald-500 bg-emerald-500/[0.04] dark:bg-emerald-950/30'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Predicted Concentration & Metric Readout */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between font-mono text-xs text-[#6E6D68] dark:text-slate-400 uppercase border-b border-[#111111]/10 dark:border-white/10 pb-2">
              <span>{lang === 'hi' ? `लक्ष्य तिथि // ${targetDate}` : `TARGET DATE // ${targetDate}`}</span>
              {inDiwali ? (
                <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> ★ DIWALI WINDOW
                </span>
              ) : null}
            </div>

            {/* Massive Hero PM2.5 Forecast Number */}
            <div>
              <span className="font-mono text-xs text-[#6E6D68] dark:text-slate-400 uppercase tracking-wider block">
                {t('projectedNextDay')}
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-serif text-7xl sm:text-8xl lg:text-[88px] font-normal leading-none text-[#111111] dark:text-white tabular-nums tracking-tight">
                  <HeroCounter targetValue={pm25Value} disabled={disabledMotion} />
                </span>
                <span className="font-mono text-base text-[#6E6D68] dark:text-slate-400">µg/m³</span>
              </div>
              <div className="font-mono text-xs text-[#6E6D68] dark:text-slate-400 mt-2">
                {t('intervalLabel')}{' '}
                <strong className="text-[#111111] dark:text-white">
                  {Number(lowerVal).toFixed(1)} – {Number(upperVal).toFixed(1)} µg/m³
                </strong>
              </div>
            </div>

            {/* Live Real-time Missed Warnings vs False Alarms Trade-Off Badge */}
            <div className="pt-2">
              <div className="p-3 rounded-xl border border-[#111111]/10 dark:border-white/10 bg-[#111111]/[0.02] dark:bg-slate-800/50 font-mono text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[#6E6D68] dark:text-slate-400">{t('statSelectedRule')}</span>
                  <span className="font-bold text-[#111111] dark:text-white uppercase">
                    {policy === 'calibrated' ? 'Mid-Risk Buffer' : policy === 'conservative' ? 'Conservative' : 'Point'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-600 dark:text-red-400 font-bold">{t('statMissedWarnings')}</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{activeStats.miss} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6E6D68] dark:text-slate-400">{t('statFalseAlarms')}</span>
                  <span className="font-bold text-[#111111] dark:text-white">{activeStats.fa} days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Action Directives Table */}
          <div className="lg:col-span-7 space-y-5">
            {/* Status Stamp Header */}
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`px-4 py-2 rounded-xl border-2 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider ${
                  protocolBand === 'crimson'
                    ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
                    : protocolBand === 'amber'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {protocolBand === 'crimson'
                  ? t('protocolCrimsonBadge')
                  : protocolBand === 'amber'
                  ? t('protocolAmberBadge')
                  : t('protocolGreenBadge')}
              </div>
            </div>

            {/* Protocol Action Narrative */}
            <p className="font-sans text-sm sm:text-base text-[#111111] dark:text-slate-200 leading-relaxed">
              {protocolBand === 'crimson'
                ? t('protocolCrimsonAction')
                : protocolBand === 'amber'
                ? t('protocolAmberAction')
                : t('protocolGreenAction')}
            </p>

            {/* 4-Row Concrete Directives Table */}
            <div className="rounded-xl border border-[#111111]/10 dark:border-white/10 overflow-hidden font-mono text-xs divide-y divide-[#111111]/10 dark:divide-white/10">
              <div className="p-3 flex items-center justify-between bg-white/40 dark:bg-slate-800/30">
                <span className="text-[#6E6D68] dark:text-slate-400 uppercase">{t('assemblyLabel')}</span>
                <span
                  className={`font-bold ${
                    isAlertActive ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isAlertActive ? t('assemblyAlert') : t('assemblySafe')}
                </span>
              </div>
              <div className="p-3 flex items-center justify-between bg-white/40 dark:bg-slate-800/30">
                <span className="text-[#6E6D68] dark:text-slate-400 uppercase">{t('sportsLabel')}</span>
                <span
                  className={`font-bold ${
                    isAlertActive ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isAlertActive ? t('sportsAlert') : t('sportsSafe')}
                </span>
              </div>
              <div className="p-3 flex items-center justify-between bg-white/40 dark:bg-slate-800/30">
                <span className="text-[#6E6D68] dark:text-slate-400 uppercase">{t('recessLabel')}</span>
                <span
                  className={`font-bold ${
                    isAlertActive ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isAlertActive ? t('recessAlert') : t('recessSafe')}
                </span>
              </div>
              <div className="p-3 flex items-center justify-between bg-white/40 dark:bg-slate-800/30">
                <span className="text-[#6E6D68] dark:text-slate-400 uppercase">{t('infirmaryLabel')}</span>
                <span
                  className={`font-bold ${
                    isAlertActive ? 'text-amber-600 dark:text-amber-400' : 'text-[#111111] dark:text-slate-300'
                  }`}
                >
                  {isAlertActive ? t('infirmaryAlert') : t('infirmarySafe')}
                </span>
              </div>
            </div>

            {/* Coordinator Advisory Dispatch Generator Box */}
            <div className="p-4 rounded-xl border border-[#111111]/15 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#111111] dark:text-white uppercase flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  {t('advisoryTitle')}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowKeyInput(!showKeyInput)}
                    className="text-[10px] text-[#6E6D68] dark:text-slate-400 underline hover:text-[#111111] dark:hover:text-white"
                  >
                    {showKeyInput ? 'Hide API Key' : 'Gemini Key (Optional)'}
                  </button>
                  <button
                    type="button"
                    onClick={generateAdvisory}
                    disabled={advisoryLoading}
                    className="px-3 py-1 rounded bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold text-[11px] hover:opacity-90 disabled:opacity-50"
                  >
                    {advisoryLoading ? t('generatingAdvisory') : t('generateAdvisoryBtn')}
                  </button>
                </div>
              </div>

              {showKeyInput ? (
                <div className="pt-2">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full p-2 rounded border border-[#111111]/20 dark:border-white/20 bg-transparent text-xs"
                  />
                  <span className="text-[10px] text-[#6E6D68] dark:text-slate-400 block mt-1">
                    If omitted, uses the deterministic verified template with zero network dependence.
                  </span>
                </div>
              ) : null}

              {advisory ? (
                <div className="pt-2 border-t border-[#111111]/10 dark:border-white/10 space-y-2">
                  <p className="font-sans text-xs text-[#111111] dark:text-slate-200 italic bg-[#111111]/[0.02] dark:bg-slate-800/40 p-3 rounded-lg">
                    "{advisory}"
                  </p>
                  <button
                    type="button"
                    onClick={copyAdvisory}
                    className="px-3 py-1 rounded border border-[#111111]/20 dark:border-white/20 text-[10px] font-bold uppercase flex items-center gap-1 hover:bg-[#111111]/5 dark:hover:bg-white/5"
                  >
                    {advisoryCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{advisoryCopied ? t('copiedAdvisoryBtn') : t('copyAdvisoryBtn')}</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </TiltCard>
    </section>
  );
});
