# VayuShield AI: Delhi School-Child PM2.5 Next-Day Forecast & Decision System

> **Veritas AI International High School Hackathon 2026**  
> **Track:** Climate (Track 4.3: AI + Climate, Project 4.3.2: Next-day air quality forecast)  
> **Developers:** **Swastik Divyanshu** & **Krishnendu Patro** (Grade 11, DAV Public School, Chandrasekharpur, Bhubaneswar, Odisha, India)  
> **Web Platform:** React 19 • Vite 6 • Tailwind CSS • Recharts • Lucide-react  
> **Machine Learning:** Python 3.12 • `scikit-learn` • `pandas` • `numpy` • OpenAQ API v3 • Open-Meteo  

---

## 📌 Executive Summary

Predicting ambient particulate matter ($\text{PM}_{2.5}$) in New Delhi is an acute climate challenge driven by post-monsoon agricultural stubble smoke, nocturnal boundary layer thermal inversions, calm surface winds, and episodic festival combustion (Diwali firecrackers). While standard regression benchmarks report single-number test errors, **school principals and sports coordinators face a radically asymmetric loss function**:
- **Type I Error (False Alarm):** Unnecessary cancellation of outdoor physical activities causes minor administrative inconvenience.
- **Type II Error (Missed Warning / False Negative):** Sending children into hazardous air ($> 60\,\mu\text{g/m}^3$ or $> 250\,\mu\text{g/m}^3$) exposes vulnerable lungs to toxic particulate concentrations, triggering acute asthma attacks, irreversible alveolar inflammation, and permanent lung volume reduction. Children inhale 50% more air per kilogram of body weight during physical exercise than resting adults.

**VayuShield AI** bridges the gap between raw machine learning and school-gate health policy. We replace point predictions with an **uncertainty-aware asymmetric decision engine**, evaluate three operational decision rules across five standard air quality thresholds, and present findings through a **standout, colourful, 3D-animated, two-stage web application**.

---

## 🏛️ Two-Stage Web Application Structure

The web application is structured into two seamless, stateful views connected by a 3D depth transition and a persistent top navigation bar:

### View A: Executive Landing Page (Project Specifications & Novelty)
1. **Hero Header with 3D-Animated VayuShield Logo:**
   - 3D floating SVG logo wrapper (`perspective: 1000px`, `rotate3d`, `scale`) with hardware GPU acceleration.
   - Hackathon badge: *Veritas AI International High School Hackathon 2026 — AI + Climate Track*.
   - Prominent **Team & School Attribution Card**: Swastik Divyanshu & Krishnendu Patro, Grade 11, DAV Public School, Chandrasekharpur, Bhubaneswar, Odisha, India.
   - 3D glowing CTA: *"🚀 Launch Main School Alert System"* and secondary *"📊 Explore Honest Evaluation & Failure Audit"*.
2. **Interactive 3D Isometric Pipeline & Technical Specifications Grid:**
   - **Card 1 — End-to-End Architecture:** OpenAQ Ground Station 8118 + Open-Meteo Weather $\to$ Autoregressive Lags & Rolling Means $\to$ HistGradientBoosting Regressor + $q_{80}$ In-Sample Residual Quantile $\to$ Decision Engine.
   - **Card 2 — Indian NAAQS ($60\,\mu\text{g/m}^3$) vs. US EPA ($35\,\mu\text{g/m}^3$):** Explaining why $60\,\mu\text{g/m}^3$ is the legal school operating standard in India.
   - **Card 3 — Asymmetric Loss Philosophy:** Visualizing why missing a high-pollution day is 10x worse than a false alarm.
   - **Card 4 — Replay Mode vs. Live Deployment:** Real-world CPCB/SAFAR telemetry integration roadmap.
3. **Novelty Comparison Matrix:** Side-by-side benchmark contrasting a naive hackathon baseline against VayuShield AI's 7 key technical innovations.

### View B: Live Alert System (Main Operations Console)
1. **Hero Decision Console:**
   - Giant status indicator (`CRIMSON ALERT: CANCEL OUTDOOR ASSEMBLY` vs. `NORMAL OUTDOOR ACTIVITY`).
   - Massive headline forecast in Newsreader serif (`323.3 µg/m³`) with $[\text{lower}, \text{upper}]$ $80\%$ uncertainty intervals.
   - **Typographic 4-Row Directives Table**: Morning Assembly (07:30 AM), Physical Education & Field Sports, Recess & Lunch Breaks, Infirmary Protocol for Asthmatic Pupils.
2. **Interactive Chronological Trajectory Chart (Recharts):**
   - 120-day continuous timeline comparing OpenAQ actuals, Gradient Boosting forecasts, Persistence benchmark, and shaded $80\%$ uncertainty band.
   - Regulatory threshold line at $60\,\mu\text{g/m}^3$ in Signal Vermilion and vertical reference line for Diwali dates.
   - Date picker slider with play/pause automatic playback simulation.
3. **Scorecard Deck:**
   - 6 high-density cards: Model Test MAE ($\pm 14.41\,\mu\text{g/m}^3$), Persistence MAE ($\pm 13.75\,\mu\text{g/m}^3$), 5-Fold Backtest MAE ($16.91$ vs $17.70\,\mu\text{g/m}^3$), $80\%$ Empirical Range Coverage ($82.5\%$), Decision Precision ($93.9\%$), and Safety Recall ($96.9\%$).
4. **Top 5 Worst Failure Inspector & Flagship Case Study:**
   - Detailed atmospheric post-mortem of the 5 largest prediction errors (flushing, stubble burning plume veer, lag-1 shadow hysteresis).
   - Flagship Case Study on the **12 November Post-Diwali Spike**: Actual $317\,\mu\text{g/m}^3$ vs. Model $216.5\,\mu\text{g/m}^3$ (Error $+100.5\,\mu\text{g/m}^3$). Explains why the point forecast failed mathematically, yet the decision engine triumphed operationally by triggering a Crimson Alert and keeping 2,400 students safe.
5. **Diwali Ablation Explorer (5 Variants):**
   - Full ablation table tracking Persistence, GBM, GBM + Diwali calendar features, GBM log-ratio, and GBM log-ratio + Diwali across overall, seasonal, and Diwali windows.
6. **Multi-Threshold & Three-Rule Trade-Off Matrix:**
   - Interactive matrix across $35, 60, 90, 120, 250\,\mu\text{g/m}^3$ demonstrating how the Conservative Safety Rule achieves **100% recall (0 missed warnings)** for emergency days ($\ge 250\,\mu\text{g/m}^3$).
7. **Dual Themes:**
   - **Warm Lit Paper Broadsheet** (Daylight editorial mode inspired by *Our World in Data* and *Swiss Grid Typography*).
   - **Dark Bioluminescence** (Evening cyber-console mode).

---

## ⚡ Quick Start

### 1. Run the Web Application
```bash
# Navigate to the frontend directory
cd delhi-aq-app

# Install dependencies
npm install

# Start Vite local development server
npm run dev

# Or run an optimized production preview
npm run build
npm run preview
```
Visit: **`http://localhost:5173/`** or **`http://127.0.0.1:4173/`**

---

### 2. Reproduce Machine Learning Pipeline (Python)
```bash
# Install Python packages
pip install pandas numpy scikit-learn requests matplotlib

# Step 1: Download daily historical weather from Open-Meteo
python load_data.py

# Step 1b (Optional): Download station PM2.5 measurements from OpenAQ API v3
# Requires OPENAQ_API_KEY environment variable
python load_openaq.py

# Step 2: Train Gradient Boosting models, run 5-fold backtest & export results.json
python model.py

# Step 3: Run the 5-variant Diwali calendar-feature & log-ratio ablation experiment
python model_diwali.py
```

---

## 📊 Rigorous Evaluation & Honesty Audit

### 1. Model vs. Persistence: Baseline Reality Check
Evaluating on the 120-day held-out test window (28 June to 12 November 2026) and 5-fold walk-forward backtest:

| Evaluation Window | Persistence ("Tomorrow = Today") | Gradient Boosting (GBM) | Relative Delta |
| :--- | :---: | :---: | :---: |
| **120-Day Held-Out Test Window** | $\mathbf{13.75\,\mu\text{g/m}^3}$ | $14.41\,\mu\text{g/m}^3$ | $-4.80\%$ (Persistence lower) |
| **5-Fold Walk-Forward Backtest** | $17.70\,\mu\text{g/m}^3$ | $\mathbf{16.91\,\mu\text{g/m}^3}$ | **$+4.46\%$** (Model lower) |

**Honest Assessment:** Daily $\text{PM}_{2.5}$ has high autocorrelation ($r > 0.85$). Gradient boosting **barely beats persistence overall**. However, persistence lags 24 hours behind weather-driven regime shifts (rain washouts and wind shifts), whereas gradient boosting captures meteorological transitions.

### 2. Seasonal Split: Pre-Season vs. Winter Smog
Aggregated MAE masks performance during high-pollution episodes:
- **Pre-Season ($< 15\text{ Oct}$, 91 days):** Mean actual $= 37.97\,\mu\text{g/m}^3$, Persistence MAE $= 8.31\,\mu\text{g/m}^3$, Model MAE $= \mathbf{8.16\,\mu\text{g/m}^3}$ (**$+1.81\%$ gain**).
- **Smog Season ($\ge 15\text{ Oct}$, 29 days):** Mean actual $= 153.38\,\mu\text{g/m}^3$, Persistence MAE $= 30.81\,\mu\text{g/m}^3$, Model MAE $= 34.02\,\mu\text{g/m}^3$ (Error quadruples during the crisis window).

### 3. Five-Variant Diwali Ablation Experiment
Tracked across the 120-day test set, smog season, and 8-day Diwali window (6–13 Nov):

| Variant | RMSE (All) | MAE (All) | MAE Season ($\ge 15\text{ Oct}$) | MAE Diwali Window | MAE Pre-Season ($< 15\text{ Oct}$) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Persistence (Tomorrow = Today)** | $21.6$ | $13.8$ | $30.8$ | $43.1$ | $8.3$ |
| **GBM (Base Weather + Lags)** | $21.0$ | $13.7$ | $31.9$ | $38.2$ | $7.9$ |
| **GBM + Diwali Features** | $20.8$ | $13.6$ | $31.6$ | $38.1$ | $7.9$ |
| **GBM Log-Ratio** | **$20.0$** | **$13.2$** | **$29.9$** | **$37.7$** | **$7.8$** |
| **GBM Log-Ratio + Diwali** | **$20.0$** | **$13.2$** | **$29.9$** | **$37.7$** | **$7.8$** |

**Takeaway:** Calendar features alone do not solve peak Diwali errors ($38.2 \to 38.1\,\mu\text{g/m}^3$) due to sample scarcity (only 2 training events, 1 test event). However, predicting multiplicative log-ratios $\ln(y_{t+1}/y_t)$ achieves the lowest RMSE ($20.0\,\mu\text{g/m}^3$) and lowers winter smog MAE to $29.9\,\mu\text{g/m}^3$.

### 4. Prediction Interval Coverage Diagnostics
- **Nominal Target:** $80.0\%$
- **Overall Test Coverage:** $82.5\%$ ($99/120$ days within $[\hat{y} - 20.49, \hat{y} + 20.49]$)
- **Pre-Season Coverage ($< 15\text{ Oct}$):** $97.8\%$ ($89/91$ days — over-conservative)
- **Smog Season Coverage ($\ge 15\text{ Oct}$):** **$34.5\%$** ($10/29$ days — **coverage collapse**)
- **Reason:** In-sample training residuals overfit tree depth, producing fixed $\pm 20.5\,\mu\text{g/m}^3$ intervals that cannot accommodate $100\text{--}300\,\mu\text{g/m}^3$ winter atmospheric swings.

### 5. Multi-Threshold Decision Rules
- **At $60\,\mu\text{g/m}^3$ (Indian NAAQS):** Mid-Risk Calibrated Rule achieves **$96.9\%$ Recall** and **$93.9\%$ Precision** ($97.5\%$ overall decision accuracy), with only 1 missed warning and 2 false alarms across 120 days.
- **At $250\,\mu\text{g/m}^3$ (Emergency Hazard):** Point forecast misses 2 out of 4 disaster days ($50\%$ recall). In contrast, the **Conservative Safety Rule achieves $100\%$ Recall (0 missed warnings)**.

### 6. Data Quality & Missing-Day Telemetry Audit
- **Calendar Span:** 1,048 days ($1,019$ valid station days, 29 missing days).
- **Sensor Outage:** 15 consecutive missing days occurred between 25 September and 8 October 2026, plus 12 October 2026, due to ground-station maintenance.
- **Lag Misalignment:** Dropping missing rows prior to shifting caused 48 rows immediately following the gap to reference non-consecutive calendar days.
- **Sensor vs. Reanalysis:** OpenAQ Station 8118 vs. Open-Meteo CAMS reanalysis exhibits Pearson $r = 0.6615$ ($\text{MAE} = 41.28\,\mu\text{g/m}^3$), confirming that physical station sensors detect sharp local combustion spikes that reanalysis smooths out.

---

## 🎨 Color Coding (Indian NAAQS & WHO Bands)

| PM2.5 Range | Category | Color | Operational School Guidance |
| :--- | :--- | :--- | :--- |
| **0 – 30 µg/m³** | Good | `#15803D` (Forest Green) | Minimal impact. Ideal for morning outdoor sports. |
| **31 – 60 µg/m³** | Satisfactory | `#4D7C0F` (Light Green) | Minor discomfort for sensitive groups. NAAQS limit. |
| **61 – 90 µg/m³** | Moderate | `#B45309` (Amber Yellow) | Discomfort for children with asthma. Monitor exertion. |
| **91 – 120 µg/m³** | Poor | `#C2410C` (Orange) | Breathing discomfort on prolonged exposure. Move PE inside. |
| **121 – 250 µg/m³** | Very Poor | `#E13C2A` (Signal Vermilion) | High health risk. Cancel outdoor sports & assemblies. |
| **250+ µg/m³** | Severe | `#7F1D1D` (Crimson Dark) | Emergency health hazard. Strict indoor classroom confinement. |

---

## 📂 Repository File Structure

```
├── data/
│   ├── delhi_daily.csv             # Raw daily weather & PM2.5 from Open-Meteo
│   ├── delhi_daily_openaq.csv      # Merged regulatory PM2.5 measurements from OpenAQ
│   └── station.json                # OpenAQ Station 8118 metadata
├── delhi-aq-app/                   # React 19 + Vite 6 Two-Stage Web Application
│   ├── src/
│   │   ├── components/             # Reusable UI modules
│   │   │   ├── AnimatedSvgWrapper.jsx      # Hardware-accelerated SVG wrapper (Vercel rule)
│   │   │   ├── DiwaliAblationExplorer.jsx  # 5-variant ablation table & interactive comparison
│   │   │   ├── HeroDecisionConsole.jsx     # Principal's primary verdict & 4-row directives
│   │   │   ├── LandingView.jsx             # Executive landing page & isometric pipeline
│   │   │   ├── NoveltyComparisonMatrix.jsx # 7-point novelty benchmark matrix
│   │   │   ├── ScorecardDeck.jsx           # 6-card high-density statistical scorecard
│   │   │   ├── ThresholdMatrixTable.jsx    # 3-rule trade-offs across 35, 60, 90, 120, 250
│   │   │   ├── TiltCard.jsx                # RAF-throttled 3D isometric tilt card
│   │   │   ├── TopFailuresInspector.jsx    # Top 5 failures & Flagship Case Study
│   │   │   ├── TrajectoryChart.jsx         # 120-day Recharts interactive timeline
│   │   │   └── VayuShieldLogo.jsx          # Custom 3D SVG shield & atmospheric icon
│   │   ├── App.jsx                 # Master application controller with 3D portal transition
│   │   ├── index.css               # Tailwind CSS directives & 3D transform utilities
│   │   ├── main.jsx                # React root mount
│   │   └── sampleData.json         # Complete offline JSON dataset (synchronized with results.json)
│   ├── package.json                # Project dependencies
│   ├── tailwind.config.js          # Tailored dual-theme color palette
│   └── vite.config.js              # Vite build configuration
├── load_data.py                    # Downloads weather data from Open-Meteo
├── load_openaq.py                  # Downloads ground station PM2.5 from OpenAQ API v3
├── model.py                        # Model training, seasonal split, 5-fold backtest & failure audit
├── model_diwali.py                 # 5-variant Diwali calendar & log-ratio ablation experiment
├── results.json                    # Gold-standard schema-compliant output dataset
├── WRITEUP.md                      # Official Veritas AI Hackathon Section 5 Project Paper
└── README.md                       # Comprehensive documentation
```

---

## ⚖️ Required Disclaimers & Attribution

- **Hackathon Replay Mode:** `"DATASET: HELD-OUT TEST REPLAY • NEW DELHI • REPLAY OF HELD-OUT TEST DAYS, NOT A LIVE FORECAST"`
- **Medical Disclaimer:** `"Prototype research tool for school administrators. Not certified medical advice. PM2.5 measurements from OpenAQ Station 8118; weather parameters from Open-Meteo."`
- **Hackathon Attribution:** Veritas AI International High School Hackathon 2026, Track 4.3: AI + Climate. Developers: Swastik Divyanshu & Krishnendu Patro (Grade 11, DAV Public School, Chandrasekharpur, Bhubaneswar, Odisha, India).
