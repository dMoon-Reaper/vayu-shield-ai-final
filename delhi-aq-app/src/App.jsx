import React, { useState, useEffect, useMemo, useRef, startTransition } from 'react';
import sampleData from './sampleData.json';
import { translations } from './locales';
import AnimatedSvgWrapper from './components/AnimatedSvgWrapper';
import VayuShieldLogo from './components/VayuShieldLogo';
import LandingView from './components/LandingView';
import HeroDecisionConsole from './components/HeroDecisionConsole';
import TrajectoryChart from './components/TrajectoryChart';
import ScorecardDeck from './components/ScorecardDeck';
import TopFailuresInspector from './components/TopFailuresInspector';
import DiwaliAblationExplorer from './components/DiwaliAblationExplorer';
import ThresholdMatrixTable from './components/ThresholdMatrixTable';
import NoveltyComparisonMatrix from './components/NoveltyComparisonMatrix';
import {
  Shield,
  Layers,
  BarChart3,
  Sliders,
  TrendingUp,
  Activity,
  Award,
  Sun,
  Moon,
  Upload,
  Clock,
  Sparkles,
  ExternalLink,
  Flame,
  CheckCircle2,
} from 'lucide-react';

const REMOTE_LATEST_URL =
  'https://raw.githubusercontent.com/swastikdivyanshu2010-cpu/AQI_Predictor_and_Monitor/main/latest.json';

// Helper: formats float cleanly with .toFixed(1)
const fmt = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return Number(val).toFixed(1);
};

// Hook to detect prefers-reduced-motion
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (event) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}

// Background subtle particle/editorial motion layer
function BackgroundMotionLayer({ disabled, isDark }) {
  if (disabled) return null;

  const typoClass = isDark ? 'text-white/[0.02]' : 'text-slate-900/[0.025]';
  const typoClassMuted = isDark ? 'text-white/[0.015]' : 'text-slate-900/[0.02]';
  const boxBorder = isDark ? 'border-white/[0.04]' : 'border-slate-900/[0.04]';

  return (
    <div
      aria-hidden="true"
      className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      <div className={`absolute top-20 left-10 font-serif font-light text-[150px] leading-none ${typoClass} animate-float-1`}>
        PM2.5
      </div>
      <div className={`absolute top-96 right-12 font-mono text-[130px] leading-none ${typoClassMuted} animate-float-2`}>
        µg/m³
      </div>
      <div className={`absolute top-[680px] left-1/4 font-serif font-light text-[210px] leading-none ${typoClassMuted} animate-float-3`}>
        60
      </div>
      <div className={`absolute top-[1100px] left-8 font-serif italic text-[160px] leading-none ${typoClass} animate-float-1`}>
        DELHI
      </div>
      <div className={`absolute top-[1520px] right-12 font-mono text-[110px] tracking-widest leading-none ${typoClassMuted} animate-float-2`}>
        VAYUSHIELD
      </div>

      <div className={`absolute top-32 right-1/4 w-36 h-24 border ${boxBorder} animate-float-1`} />
      <div className={`absolute top-84 left-24 w-48 h-32 border ${boxBorder} animate-float-3`} />
      <div className={`absolute top-[480px] right-20 w-28 h-40 border ${boxBorder} animate-float-2`} />
      <div className={`absolute top-[820px] left-1/3 w-56 h-20 border ${boxBorder} animate-float-1`} />
    </div>
  );
}

// Marquee Strip: displays key facts from loaded data with screen reader support
function MarqueeStrip({ mode, liveData, currentDay, disabled, t }) {
  let items = [];

  if (mode === 'live' && liveData?.status === 'ok') {
    items = [
      `TARGET: DELHI NCT`,
      `FORECAST FOR: ${liveData.forecast_for}`,
      `MODEL: ${fmt(liveData.model)} µg/m³`,
      `80% INTERVAL: ${fmt(liveData.lower)}–${fmt(liveData.upper)} µg/m³`,
      `NAAQS LIMIT: 60.0 µg/m³`,
      `STATUS: ${liveData.alert ? 'RESTRICT OUTDOOR ACTIVITY // ALERT' : 'NORMAL OUTDOOR ACTIVITY // SAFE'}`,
      `CADENCE: 4× DAILY`,
      `STREAM: OPENAQ + OPEN-METEO`,
    ];
  } else if (mode === 'replay' && currentDay) {
    items = [
      `TARGET: DELHI NCT`,
      `EVALUATION DATE: ${currentDay.date}`,
      `MODEL: ${fmt(currentDay.model)} µg/m³`,
      `80% INTERVAL: ${fmt(currentDay.lower_80 ?? currentDay.lower)}–${fmt(currentDay.upper_80 ?? currentDay.upper)} µg/m³`,
      `GROUND TRUTH: ${fmt(currentDay.actual)} µg/m³`,
      `NAAQS LIMIT: 60.0 µg/m³`,
      `STATUS: ${currentDay.alert ? 'RESTRICT OUTDOOR ACTIVITY // ALERT' : 'NORMAL OUTDOOR ACTIVITY // SAFE'}`,
      `DATASET: 120-DAY HELD-OUT TEST WINDOW`,
    ];
  } else {
    items = [
      `VAYUSHIELD AI // AIRSHIELD 2.0`,
      `VERITAS AI HACKATHON 2026 (AI + CLIMATE)`,
      `CO-DEVELOPERS: SWASTIK DIVYANSHU • KRISHNENDU PATRO`,
      `INSTITUTION: DAV PUBLIC SCHOOL, CHANDRASEKHARPUR, BHUBANESWAR`,
      `DECISION ACCURACY: 97.5%`,
      `CHILD SAFETY RECALL: 96.9%`,
      `NAAQS THRESHOLD: 60.0 µg/m³`,
      `STATUS: ACTIVE AUTOMATION`,
    ];
  }

  const plainText = items.join(' • ');

  return (
    <div className="border-b border-[#111111]/15 dark:border-white/10 bg-[#111111]/[0.02] dark:bg-slate-900/60 py-2 overflow-hidden select-none transition-colors duration-200">
      <span className="sr-only">{plainText}</span>
      {disabled ? (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 font-mono text-[11px] text-[#6E6D68] dark:text-slate-400 overflow-x-auto whitespace-nowrap">
          {items.map((item, idx) => (
            <span key={idx} className="mr-6 inline-flex items-center gap-1.5">
              <span className="text-blue-600 dark:text-cyan-400 font-bold">▪</span>
              <span>{item}</span>
            </span>
          ))}
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="animate-marquee font-mono text-[11px] text-[#6E6D68] dark:text-slate-400 whitespace-nowrap flex items-center"
        >
          {[0, 1].map((copyIndex) => (
            <div key={copyIndex} className="flex items-center">
              {items.map((item, idx) => (
                <span key={idx} className="mx-6 flex items-center gap-2">
                  <span className="text-blue-600 dark:text-cyan-400 font-bold">▪</span>
                  <span>{item}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  // Theme state: dark | light (defaults to dark bioluminescence for standout visuals, persists in localStorage)
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('vayushield_theme');
    return saved !== null ? saved === 'dark' : true;
  });

  // Sync dark class on html root and persist
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vayushield_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vayushield_theme', 'light');
    }
  }, [isDark]);

  // Language selection: 'en' | 'hi'
  const [lang, setLang] = useState('en');

  // Translation lookup helper with parameter substitution
  const t = (key, params = {}) => {
    let text = translations[lang]?.[key] || translations.en[key] || key;
    Object.keys(params).forEach((p) => {
      text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
    });
    return text;
  };

  // Two-Stage Master Views: 'landing' (View A) | 'app' (View B: Main Webpage)
  const [viewStage, setViewStage] = useState('landing');

  // Within View B: Sub-Tab Navigator: 'console' | 'chart' | 'scorecard' | 'failures' | 'diwali' | 'matrix' | 'all'
  const [appSubTab, setAppSubTab] = useState('console');

  // Data mode: 'replay' (held-out 120-day evaluation) | 'live' (unverified live ingest)
  const [dataMode, setDataMode] = useState('replay');

  // Motion reduction hook
  const prefersReducedMotion = usePrefersReducedMotion();

  // Data states
  const [data, setData] = useState(sampleData);
  const [liveData, setLiveData] = useState(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Operational decision parameters:
  // Policy: 'calibrated' (+6 buffer, recommended) | 'point' (model > cutoff) | 'conservative' (80% upper > cutoff)
  const [policy, setPolicy] = useState('calibrated');

  // Selected threshold cutoff: 35 | 60 (default NAAQS) | 90 | 120 | 250
  const [selectedThreshold, setSelectedThreshold] = useState(60);

  // Selected date for replay mode
  const [selectedDate, setSelectedDate] = useState(() => {
    return data.days && data.days.length > 0 ? data.days[data.days.length - 1].date : '2026-11-13';
  });

  // Selected failure pin ID
  const [selectedFailureId, setSelectedFailureId] = useState('fail-1');

  // Fetch live forecast from remote or fallback
  useEffect(() => {
    let isMounted = true;
    async function fetchLiveForecast() {
      setLiveLoading(true);
      setLiveError(null);
      try {
        const cacheBuster = `?_cb=${Date.now()}`;
        let res;
        try {
          res = await fetch(`${REMOTE_LATEST_URL}${cacheBuster}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } catch (netErr) {
          console.warn('Remote fetch failed, falling back to local /latest.json:', netErr);
          res = await fetch(`/latest.json${cacheBuster}`);
          if (!res.ok) throw new Error(`Local latest.json fetch failed: HTTP ${res.status}`);
        }
        const parsed = await res.json();
        if (isMounted) {
          setLiveData(parsed);
          setLiveLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching live forecast:', err);
          setLiveError(err.message || 'Unable to retrieve live forecast data');
          setLiveLoading(false);
        }
      }
    }
    fetchLiveForecast();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute current day index and object in replay mode
  const currentDayIndex = useMemo(() => {
    if (!data.days) return -1;
    return data.days.findIndex((d) => d.date === selectedDate);
  }, [data.days, selectedDate]);

  const currentDay = useMemo(() => {
    if (currentDayIndex >= 0 && data.days) {
      return data.days[currentDayIndex];
    }
    return data.days && data.days.length > 0 ? data.days[data.days.length - 1] : null;
  }, [data.days, currentDayIndex]);

  // Chart data transformation (rule: rerender-memo)
  const chartData = useMemo(() => {
    if (!data.days) return [];
    return data.days.map((d) => {
      const lowerVal = d.lower_80 !== undefined ? d.lower_80 : d.lower;
      const upperVal = d.upper_80 !== undefined ? d.upper_80 : d.upper;
      return {
        ...d,
        rangeBase: lowerVal,
        rangeDelta: Math.max(0, upperVal - lowerVal),
      };
    });
  }, [data.days]);

  // Handle custom results.json file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.days || !Array.isArray(parsed.days) || parsed.days.length === 0) {
          throw new Error("Invalid schema: missing 'days' array.");
        }
        startTransition(() => {
          setData(parsed);
          setSelectedDate(parsed.days[parsed.days.length - 1].date);
        });
      } catch (err) {
        setUploadError(err.message || 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Stepper jump handlers
  const handleJumpDiwali = () => {
    if (!data.days) return;
    const diwaliDay = data.days.find((d) => d.in_diwali_window);
    if (diwaliDay) startTransition(() => setSelectedDate(diwaliDay.date));
  };

  const handleJumpPeak = () => {
    if (!data.days || data.days.length === 0) return;
    let peak = data.days[0];
    for (const d of data.days) {
      if (d.actual > peak.actual) peak = d;
    }
    startTransition(() => setSelectedDate(peak.date));
  };

  const handleJumpCleanest = () => {
    if (!data.days || data.days.length === 0) return;
    let clean = data.days[0];
    for (const d of data.days) {
      if (d.actual < clean.actual) clean = d;
    }
    startTransition(() => setSelectedDate(clean.date));
  };

  const handleJumpWorst = () => {
    startTransition(() => {
      setSelectedDate('2026-11-12');
      setSelectedFailureId('fail-1');
    });
  };

  return (
    <div className="relative min-h-screen bg-[#F8F7F4] dark:bg-[#060B19] text-[#111111] dark:text-[#F8FAFC] font-sans flex flex-col overflow-x-hidden selection:bg-blue-600 selection:text-white dark:selection:bg-cyan-500 dark:selection:text-slate-950 transition-colors duration-200">
      {/* Background Editorial & Atmospheric Ambient Motion Layer */}
      <BackgroundMotionLayer disabled={prefersReducedMotion} isDark={isDark} />

      {/* Main App Content */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* ========================================================
            PERSISTENT TOP MASTHEAD (Swiss Precision & Bioluminescence)
            ======================================================== */}
        <header className="sticky top-0 z-50 border-b border-[#111111]/15 dark:border-white/10 px-4 sm:px-8 py-3.5 bg-[#F8F7F4]/90 dark:bg-[#060B19]/85 backdrop-blur-xl transition-colors duration-200 shadow-sm">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Logo & Project Brand */}
            <div className="flex items-center gap-3">
              <VayuShieldLogo size={38} isDark={isDark} disabled={prefersReducedMotion} />
              <div>
                <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[#6E6D68] dark:text-slate-400">
                  <span className="font-bold text-[#111111] dark:text-white">VAYUSHIELD AI</span>
                  <span>•</span>
                  <span>VERITAS AI HACKATHON 2026</span>
                </div>
                <h1 className="font-mono text-xs sm:text-sm font-bold tracking-tight text-[#111111] dark:text-white uppercase">
                  {t('appTitle')}
                </h1>
              </div>
            </div>

            {/* Center: Two-Stage Primary View Toggle (Landing vs. Main App) */}
            <nav
              aria-label="Application Stage Navigation"
              className="flex items-center border border-[#111111]/20 dark:border-white/20 rounded-xl p-1 bg-white/40 dark:bg-slate-900/60 font-mono text-xs shadow-inner"
            >
              <button
                type="button"
                onClick={() => startTransition(() => setViewStage('landing'))}
                className={`px-3.5 py-1.5 rounded-lg uppercase font-bold tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                  viewStage === 'landing'
                    ? 'bg-[#111111] text-white dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 dark:text-slate-950 shadow-sm'
                    : 'text-[#6E6D68] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t('navLanding')}</span>
              </button>

              <button
                type="button"
                onClick={() => startTransition(() => setViewStage('app'))}
                className={`px-3.5 py-1.5 rounded-lg uppercase font-bold tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                  viewStage === 'app'
                    ? 'bg-[#111111] text-white dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 dark:text-slate-950 shadow-sm'
                    : 'text-[#6E6D68] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>02. Live Alert System (Main App)</span>
              </button>
            </nav>

            {/* Right: Lit/Dark Switcher, Language Toggle & Upload Button */}
            <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
              {/* Single-Click Lit Mode / Dark Mode Switcher */}
              <div className="flex items-center border border-[#111111]/20 dark:border-white/20 rounded-lg p-0.5 bg-white/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setIsDark(false)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-wider flex items-center gap-1 transition ${
                    !isDark
                      ? 'bg-[#111111] text-white'
                      : 'text-[#6E6D68] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                  }`}
                  title="Switch to Lit Mode (Paper Broadsheet)"
                >
                  <Sun className="w-3 h-3 text-amber-500" />
                  <span>LIT</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDark(true)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-wider flex items-center gap-1 transition ${
                    isDark
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-[#6E6D68] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                  }`}
                  title="Switch to Dark Mode (Atmospheric Bioluminescence)"
                >
                  <Moon className="w-3 h-3 text-blue-400" />
                  <span>DARK</span>
                </button>
              </div>

              {/* Language Switcher: EN | हिन्दी */}
              <div className="flex items-center border border-[#111111]/20 dark:border-white/20 rounded-lg p-0.5 bg-white/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                    lang === 'en'
                      ? 'bg-[#111111] text-white dark:bg-white dark:text-slate-950'
                      : 'text-[#6E6D68] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang('hi')}
                  className={`px-2 py-1 rounded text-[11px] font-bold font-sans transition ${
                    lang === 'hi'
                      ? 'bg-[#111111] text-white dark:bg-white dark:text-slate-950'
                      : 'text-[#6E6D68] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                  }`}
                >
                  हिन्दी
                </button>
              </div>

              {/* Upload results.json for Judges & Replay Auditors */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg border border-[#111111]/20 dark:border-white/20 text-[11px] text-[#6E6D68] dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 flex items-center gap-1 hover:bg-[#111111]/5 dark:hover:bg-white/5 transition"
                title="Upload custom results.json file"
              >
                <Upload className="w-3 h-3" />
                <span className="hidden sm:inline">Upload JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {uploadError ? (
            <div className="max-w-[1440px] mx-auto mt-2 font-mono text-xs text-red-500">
              UPLOAD ERROR: {uploadError}
            </div>
          ) : null}
        </header>

        {/* Marquee Ticker Strip */}
        <MarqueeStrip
          mode={dataMode}
          liveData={liveData}
          currentDay={currentDay}
          disabled={prefersReducedMotion}
          t={t}
        />

        {/* ========================================================
            VIEW A: OPENING LANDING PAGE (Specifications & Novelty)
            ======================================================== */}
        {viewStage === 'landing' ? (
          <main className="max-w-[1440px] mx-auto w-full px-4 sm:px-8 py-8 flex-1 flex flex-col">
            <LandingView
              isDark={isDark}
              lang={lang}
              t={t}
              onLaunchConsole={() =>
                startTransition(() => {
                  setViewStage('app');
                  setAppSubTab('console');
                })
              }
              onLaunchWorkbench={() =>
                startTransition(() => {
                  setViewStage('app');
                  setAppSubTab('scorecard');
                })
              }
              disabledMotion={prefersReducedMotion}
            />
          </main>
        ) : null}

        {/* ========================================================
            VIEW B: MAIN ALERT SYSTEM & HONESTY WORKBENCH
            ======================================================== */}
        {viewStage === 'app' ? (
          <main className="max-w-[1440px] mx-auto w-full px-4 sm:px-8 py-8 flex-1 flex flex-col space-y-10 animate-fade-rise">
            {/* Operational Mode Bar (Live Ingest vs Replay) & Sub-Tab Navigator */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-[#111111]/15 dark:border-white/10 bg-[#111111]/[0.02] dark:bg-slate-900/60 backdrop-blur-xl">
              {/* Left: Replay vs Live Toggle */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-[#6E6D68] dark:text-slate-400 font-bold uppercase">MODE:</span>
                <div className="flex items-center border border-[#111111]/20 dark:border-white/20 rounded-xl p-0.5 bg-white/40 dark:bg-slate-800/40">
                  <button
                    type="button"
                    onClick={() => startTransition(() => setDataMode('replay'))}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      dataMode === 'replay'
                        ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-sm'
                        : 'text-[#6E6D68] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                    }`}
                  >
                    120-Day Test Replay (Evaluated)
                  </button>
                  <button
                    type="button"
                    onClick={() => startTransition(() => setDataMode('live'))}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      dataMode === 'live'
                        ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-sm'
                        : 'text-[#6E6D68] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                    }`}
                  >
                    Live Operations (4× Daily Ingest)
                  </button>
                </div>
              </div>

              {/* Right: Sub-Tab Quick Navigation Pills */}
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                {[
                  { id: 'console', label: 'Command Console' },
                  { id: 'chart', label: 'Trajectory Chart' },
                  { id: 'scorecard', label: 'Scorecard' },
                  { id: 'failures', label: 'Top 5 Failures' },
                  { id: 'diwali', label: 'Diwali Ablation' },
                  { id: 'matrix', label: 'Threshold Matrix' },
                  { id: 'all', label: '★ View All Modules' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => startTransition(() => setAppSubTab(tab.id))}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] transition ${
                      appSubTab === tab.id
                        ? 'border-blue-600 dark:border-cyan-400 bg-blue-50 dark:bg-cyan-950/40 text-blue-900 dark:text-cyan-200 font-bold'
                        : 'border-[#111111]/15 dark:border-white/10 hover:bg-[#111111]/[0.02] dark:hover:bg-slate-800/40 text-[#6E6D68] dark:text-slate-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 1. Hero Decision Console */}
            {(appSubTab === 'console' || appSubTab === 'all') ? (
              <HeroDecisionConsole
                isDark={isDark}
                lang={lang}
                t={t}
                data={data}
                currentDay={currentDay}
                currentDayIndex={currentDayIndex}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                policy={policy}
                setPolicy={setPolicy}
                selectedThreshold={selectedThreshold}
                setSelectedThreshold={setSelectedThreshold}
                mode={dataMode}
                liveData={liveData}
                onJumpDiwali={handleJumpDiwali}
                onJumpPeak={handleJumpPeak}
                onJumpCleanest={handleJumpCleanest}
                onJumpWorst={handleJumpWorst}
                disabledMotion={prefersReducedMotion}
              />
            ) : null}

            {/* 2. Interactive Forecast Trajectory Chart */}
            {(appSubTab === 'chart' || appSubTab === 'all') ? (
              <TrajectoryChart
                chartData={chartData}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                threshold={selectedThreshold}
                diwaliDates={data.diwali_dates || []}
                isDark={isDark}
                lang={lang}
                t={t}
                onSelectFailurePin={(pinDate) => {
                  startTransition(() => {
                    setSelectedDate(pinDate);
                    setAppSubTab('failures');
                  });
                }}
                disabledMotion={prefersReducedMotion}
              />
            ) : null}

            {/* 3. Honesty & Evaluation Scorecard Deck */}
            {(appSubTab === 'scorecard' || appSubTab === 'all') ? (
              <ScorecardDeck
                data={data}
                isDark={isDark}
                lang={lang}
                t={t}
              />
            ) : null}

            {/* 4. Top 5 Failures Inspector & Where It Fails Spotlight */}
            {(appSubTab === 'failures' || appSubTab === 'all') ? (
              <TopFailuresInspector
                isDark={isDark}
                lang={lang}
                t={t}
                selectedFailureId={selectedFailureId}
                setSelectedFailureId={setSelectedFailureId}
                onSelectDate={(dt) => startTransition(() => setSelectedDate(dt))}
              />
            ) : null}

            {/* 5. 5-Variant Diwali Experiment Ablation Explorer */}
            {(appSubTab === 'diwali' || appSubTab === 'all') ? (
              <DiwaliAblationExplorer
                isDark={isDark}
                lang={lang}
                t={t}
                disabledMotion={prefersReducedMotion}
              />
            ) : null}

            {/* 6. Complete Threshold Trade-Off Matrix */}
            {(appSubTab === 'matrix' || appSubTab === 'all') ? (
              <ThresholdMatrixTable
                thresholdTable={data.threshold_table || []}
                activeThreshold={selectedThreshold}
                activePolicy={policy}
                onSelectThreshold={(th) => startTransition(() => setSelectedThreshold(th))}
                isDark={isDark}
                lang={lang}
                t={t}
              />
            ) : null}
          </main>
        ) : null}

        {/* ========================================================
            PERSISTENT REQUIRED EDITORIAL FOOTER & COLOPHON
            ======================================================== */}
        <footer className="max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-8 font-mono text-xs text-[#6E6D68] dark:text-slate-400 space-y-2.5 border-t border-[#111111]/15 dark:border-white/10 transition-colors duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-[#111111] dark:text-white font-bold uppercase tracking-wider">
              {t('footerDisclaimer')}
            </p>
            <p className="text-[11px] text-[#6E6D68] dark:text-slate-400">
              {t('footerColophon')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] pt-2 border-t border-[#111111]/10 dark:border-white/5 gap-2">
            <span className="text-[#111111] dark:text-cyan-300 font-bold uppercase">
              RESEARCH &amp; CO-DEVELOPMENT: SWASTIK DIVYANSHU • KRISHNENDU PATRO (GRADE 11)
            </span>
            <span className="text-[#6E6D68] dark:text-slate-400 uppercase">
              DAV PUBLIC SCHOOL, CHANDRASEKHARPUR, BHUBANESWAR, ODISHA, INDIA
            </span>
          </div>
          <p className="text-[10px] text-[#6E6D68] dark:text-slate-500 leading-normal pt-1">
            Verification sources: OpenAQ PM2.5 monitoring station (Sensor ID: 23534, Location: New Delhi) • Open-Meteo European Weather Reanalysis &amp; Forecast Archives • Veritas AI International High School Hackathon 2026.
          </p>
        </footer>
      </div>
    </div>
  );
}
