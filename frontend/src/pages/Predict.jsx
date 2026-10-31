import React, { useState, useEffect, useRef } from 'react';
import {
  calculateInstantRisk,
  SAMPLE_PRESETS,
} from '../utils/realtimeModel';
import { predictRisk } from '../api/client';
import CircularGauge from '../components/CircularGauge';
import {
  Sparkles,
  Save,
  Printer,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Info,
  ChevronDown,
  Activity,
  User,
  Heart,
  FlaskConical,
} from 'lucide-react';

export default function Predict() {
  const [selectedPreset, setSelectedPreset] = useState('balanced');
  const [checkupName, setCheckupName] = useState('Balanced baseline');

  // Initial form values from balanced baseline preset
  const [formData, setFormData] = useState(SAMPLE_PRESETS[0].features);

  // Live real-time risk state
  const [liveRisk, setLiveRisk] = useState(() => calculateInstantRisk(SAMPLE_PRESETS[0].features));

  // Saving state and notifications
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  const debounceTimer = useRef(null);

  // Recalculate instantly on every input change
  useEffect(() => {
    // 1. Instantaneous client-side calculation (0 ms latency)
    const instantResult = calculateInstantRisk(formData);
    setLiveRisk(instantResult);

    // 2. Debounced background sync with ML server (if available)
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        const payload = {};
        for (const [k, v] of Object.entries(formData)) {
          payload[k] = Number(v);
        }
        const serverResult = await predictRisk(payload);
        if (serverResult && serverResult.probability !== undefined) {
          setLiveRisk(prev => ({
            ...prev,
            probability: serverResult.probability,
            percentage: Math.round(serverResult.probability * 100),
            riskLevel: serverResult.riskLevel || prev.riskLevel,
            topFactors: serverResult.topFactors && serverResult.topFactors.length > 0
              ? serverResult.topFactors
              : prev.topFactors,
          }));
        }
      } catch {
        // Fallback already smoothly active via instantResult
      }
    }, 350);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [formData]);

  // Handle Preset Selection
  const handlePresetChange = (presetId) => {
    setSelectedPreset(presetId);
    const preset = SAMPLE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setCheckupName(preset.name);
      setFormData({ ...preset.features });
      setSaveSuccessMsg('');
    }
  };

  // Field change handler
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: Number(value),
    }));
    setSaveSuccessMsg('');
  };

  // Save Checkup to PostgreSQL and LocalStorage
  const handleSaveCheckup = async () => {
    setIsSaving(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    const newRecord = {
      id: Date.now(),
      checkupName: checkupName.trim() || 'Health Checkup',
      date: new Date().toISOString(),
      formattedDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      features: { ...formData },
      probability: liveRisk.probability,
      percentage: liveRisk.percentage,
      riskLevel: liveRisk.riskLevel,
      topFactors: liveRisk.topFactors,
      modelVersion: liveRisk.modelVersion,
    };

    try {
      // 1. Persist to Spring Boot backend database if connected
      const payload = {};
      for (const [k, v] of Object.entries(formData)) {
        payload[k] = Number(v);
      }
      const backendRes = await predictRisk(payload);
      if (backendRes && backendRes.id) {
        newRecord.id = backendRes.id;
      }
    } catch {
      // Server down or offline - graceful fallback to localStorage
    }

    // 2. Persist to browser LocalStorage for immediate History reflection
    try {
      const existingHistory = JSON.parse(localStorage.getItem('cardioguard_history') || '[]');
      const updatedHistory = [newRecord, ...existingHistory];
      localStorage.setItem('cardioguard_history', JSON.stringify(updatedHistory));

      setSaveSuccessMsg('Checkup saved to your health history!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch {
      setSaveErrorMsg('Could not save checkup to storage.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="assessment-workspace-page">
      {/* Workspace Header */}
      <div className="workspace-header-bar">
        <div>
          <div className="workspace-tag">
            <Activity size={14} />
            <span>ASSESSMENT WORKSPACE</span>
          </div>
          <h1 className="workspace-title">Build your heart snapshot</h1>
          <p className="workspace-subtitle">
            Use recent readings where possible. Your estimate refreshes instantly as you refine each signal.
          </p>
        </div>

        {/* Try a Sample Dropdown */}
        <div className="sample-picker-wrap">
          <label className="sample-picker-label">Try a sample:</label>
          <div className="sample-select-container">
            <select
              value={selectedPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="sample-select-dropdown"
            >
              {SAMPLE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="select-arrow" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Split Workspace */}
      <div className="workspace-layout-grid">
        {/* LEFT COLUMN: 3 Structured Form Cards */}
        <div className="workspace-form-column">
          {/* Card 01: About You */}
          <section className="form-section-card">
            <div className="section-card-header">
              <div className="section-index-badge">01</div>
              <div>
                <h2 className="section-card-title">About you</h2>
                <p className="section-card-desc">Basic context helps calibrate your screening.</p>
              </div>
            </div>

            <div className="form-fields-grid">
              {/* Checkup Name */}
              <div className="form-group span-2">
                <label className="field-label">Checkup name</label>
                <input
                  type="text"
                  value={checkupName}
                  onChange={(e) => setCheckupName(e.target.value)}
                  placeholder="e.g. Balanced baseline, Morning visit"
                  className="form-control"
                />
                <span className="field-hint">A label to identify this checkup in your history.</span>
              </div>

              {/* Age */}
              <div className="form-group">
                <div className="label-with-value">
                  <label className="field-label">Age</label>
                  <span className="current-value-badge">{formData.age} years</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="80"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  className="range-slider"
                />
                <input
                  type="number"
                  min="30"
                  max="80"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  className="form-control number-compact"
                />
              </div>

              {/* Sex */}
              <div className="form-group">
                <label className="field-label">Sex</label>
                <select
                  value={formData.sex}
                  onChange={(e) => handleChange('sex', e.target.value)}
                  className="form-control"
                >
                  <option value={1}>Male</option>
                  <option value={0}>Female</option>
                </select>
                <span className="field-hint">Biological sex used for clinical baseline.</span>
              </div>

              {/* Chest Pain Pattern */}
              <div className="form-group span-2">
                <label className="field-label">Chest pain pattern</label>
                <select
                  value={formData.cp}
                  onChange={(e) => handleChange('cp', e.target.value)}
                  className="form-control"
                >
                  <option value={0}>Typical Angina (Pressure or discomfort behind breastbone)</option>
                  <option value={1}>Atypical Angina (Unusual presentation or pain location)</option>
                  <option value={2}>Non-anginal pain (Sharp or brief discomfort)</option>
                  <option value={3}>Asymptomatic (No current chest pain)</option>
                </select>
                <span className="field-hint">Choose the closest match to recent sensations.</span>
              </div>
            </div>
          </section>

          {/* Card 02: Vitals & ECG */}
          <section className="form-section-card">
            <div className="section-card-header">
              <div className="section-index-badge">02</div>
              <div>
                <h2 className="section-card-title">Vitals & ECG</h2>
                <p className="section-card-desc">The readings that tell us how your heart is responding today.</p>
              </div>
            </div>

            <div className="form-fields-grid">
              {/* Resting Blood Pressure */}
              <div className="form-group">
                <div className="label-with-value">
                  <label className="field-label">Resting blood pressure</label>
                  <span className="current-value-badge">{formData.trestbps} mm Hg</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="180"
                  value={formData.trestbps}
                  onChange={(e) => handleChange('trestbps', e.target.value)}
                  className="range-slider"
                />
                <input
                  type="number"
                  min="90"
                  max="180"
                  value={formData.trestbps}
                  onChange={(e) => handleChange('trestbps', e.target.value)}
                  className="form-control number-compact"
                />
                <span className="field-hint">Systolic resting (90–180 mm Hg).</span>
              </div>

              {/* Maximum Heart Rate */}
              <div className="form-group">
                <div className="label-with-value">
                  <label className="field-label">Maximum heart rate</label>
                  <span className="current-value-badge">{formData.thalach} bpm</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="200"
                  value={formData.thalach}
                  onChange={(e) => handleChange('thalach', e.target.value)}
                  className="range-slider"
                />
                <input
                  type="number"
                  min="80"
                  max="200"
                  value={formData.thalach}
                  onChange={(e) => handleChange('thalach', e.target.value)}
                  className="form-control number-compact"
                />
                <span className="field-hint">Peak rate during physical exertion (bpm).</span>
              </div>

              {/* ST Depression */}
              <div className="form-group">
                <div className="label-with-value">
                  <label className="field-label">ST depression (oldpeak)</label>
                  <span className="current-value-badge">{Number(formData.oldpeak).toFixed(1)} mm</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="6.0"
                  step="0.1"
                  value={formData.oldpeak}
                  onChange={(e) => handleChange('oldpeak', e.target.value)}
                  className="range-slider"
                />
                <input
                  type="number"
                  min="0.0"
                  max="6.0"
                  step="0.1"
                  value={formData.oldpeak}
                  onChange={(e) => handleChange('oldpeak', e.target.value)}
                  className="form-control number-compact"
                />
                <span className="field-hint">ECG ST segment depression (0.0–6.0 mm).</span>
              </div>

              {/* Resting ECG */}
              <div className="form-group">
                <label className="field-label">Resting ECG</label>
                <select
                  value={formData.restecg}
                  onChange={(e) => handleChange('restecg', e.target.value)}
                  className="form-control"
                >
                  <option value={0}>Normal (Type 0)</option>
                  <option value={1}>ST-T Wave Abnormality (Type 1)</option>
                  <option value={2}>Left Ventricular Hypertrophy (Type 2)</option>
                </select>
                <span className="field-hint">Baseline electrocardiogram readout.</span>
              </div>

              {/* Exercise Induced Angina */}
              <div className="form-group">
                <label className="field-label">Exercise angina</label>
                <select
                  value={formData.exang}
                  onChange={(e) => handleChange('exang', e.target.value)}
                  className="form-control"
                >
                  <option value={0}>No (Absent during exercise)</option>
                  <option value={1}>Yes (Chest discomfort induced)</option>
                </select>
                <span className="field-hint">Discomfort provoked by exertion.</span>
              </div>

              {/* ST Segment Slope */}
              <div className="form-group">
                <label className="field-label">ST segment slope</label>
                <select
                  value={formData.slope}
                  onChange={(e) => handleChange('slope', e.target.value)}
                  className="form-control"
                >
                  <option value={0}>Upsloping (Healthy cardiac response)</option>
                  <option value={1}>Flat (Borderline repolarization)</option>
                  <option value={2}>Downsloping (Marked ischemic trend)</option>
                </select>
                <span className="field-hint">Slope at peak stress ECG.</span>
              </div>
            </div>
          </section>

          {/* Card 03: Lab Markers */}
          <section className="form-section-card">
            <div className="section-card-header">
              <div className="section-index-badge">03</div>
              <div>
                <h2 className="section-card-title">Lab markers</h2>
                <p className="section-card-desc">Complete the snapshot with your latest clinical indicators.</p>
              </div>
            </div>

            <div className="form-fields-grid">
              {/* Serum Cholesterol */}
              <div className="form-group">
                <div className="label-with-value">
                  <label className="field-label">Serum cholesterol</label>
                  <span className="current-value-badge">{formData.chol} mg/dl</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="300"
                  value={formData.chol}
                  onChange={(e) => handleChange('chol', e.target.value)}
                  className="range-slider"
                />
                <input
                  type="number"
                  min="150"
                  max="300"
                  value={formData.chol}
                  onChange={(e) => handleChange('chol', e.target.value)}
                  className="form-control number-compact"
                />
                <span className="field-hint">Total serum cholesterol (150–300 mg/dl).</span>
              </div>

              {/* Fasting Blood Sugar */}
              <div className="form-group">
                <label className="field-label">Fasting blood sugar</label>
                <select
                  value={formData.fbs}
                  onChange={(e) => handleChange('fbs', e.target.value)}
                  className="form-control"
                >
                  <option value={0}>Below 120 mg/dL (Normal fasting)</option>
                  <option value={1}>Over 120 mg/dL (Elevated fasting sugar)</option>
                </select>
                <span className="field-hint">Blood glucose after overnight fasting.</span>
              </div>

              {/* Major Vessels Colored */}
              <div className="form-group">
                <label className="field-label">Major vessels</label>
                <select
                  value={formData.ca}
                  onChange={(e) => handleChange('ca', e.target.value)}
                  className="form-control"
                >
                  <option value={0}>0 vessels (Clear coronary flow)</option>
                  <option value={1}>1 vessel visible</option>
                  <option value={2}>2 vessels visible</option>
                  <option value={3}>3 vessels visible</option>
                </select>
                <span className="field-hint">Fluoroscopy visible vessel count.</span>
              </div>

              {/* Thalassemia Marker */}
              <div className="form-group">
                <label className="field-label">Thalassemia marker</label>
                <select
                  value={formData.thal}
                  onChange={(e) => handleChange('thal', e.target.value)}
                  className="form-control"
                >
                  <option value={1}>Type 1 (Normal myocardial perfusion)</option>
                  <option value={2}>Type 2 (Fixed perfusion defect)</option>
                  <option value={3}>Type 3 (Reversible defect)</option>
                </select>
                <span className="field-hint">Scintigraphy blood flow evaluation.</span>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Sticky Real-Time Live Risk Preview Card */}
        <div className="workspace-preview-column">
          <div className="live-preview-sticky-card">
            {/* Live Beacon Header */}
            <div className="preview-card-header">
              <div className="live-updating-pill">
                <span className="live-pulse-dot"></span>
                <span>LIVE RISK PREVIEW</span>
              </div>
              <span className={`risk-status-badge badge-${liveRisk.riskLevel.toLowerCase()}`}>
                {liveRisk.riskLevel} risk
              </span>
            </div>

            {/* Circular Gauge */}
            <div className="gauge-wrapper-box">
              <CircularGauge
                percentage={liveRisk.percentage}
                riskLevel={liveRisk.riskLevel}
                size={190}
                strokeWidth={14}
              />
            </div>

            {/* Summary Text */}
            <div className="preview-summary-text">
              <strong>{liveRisk.percentage}% estimated probability</strong>
              <p>
                {liveRisk.riskLevel === 'Low'
                  ? 'A low standalone estimate based on your inputs.'
                  : liveRisk.riskLevel === 'Moderate'
                  ? 'Borderline cardiac signals detected. Periodic monitoring suggested.'
                  : 'Elevated risk signals detected. We strongly suggest sharing this with a physician.'}
              </p>
            </div>

            {/* Influencing Signals List */}
            <div className="influencing-signals-box">
              <div className="signals-header">
                <span className="signals-title">What is influencing this result?</span>
                <Info size={14} className="text-muted" title="Top signals affecting your calculated probability" />
              </div>

              <div className="signals-list">
                {liveRisk.topFactors && liveRisk.topFactors.length > 0 ? (
                  liveRisk.topFactors.map((factor, idx) => (
                    <div key={idx} className="signal-item-row">
                      <div className="signal-item-label-wrap">
                        <span className="signal-name">{factor.label || factor.feature}</span>
                        <span className={`signal-direction-text text-${factor.direction === 'increases_risk' ? 'crimson' : 'teal'}`}>
                          {factor.direction === 'increases_risk' ? (
                            <><TrendingUp size={12} /> Increases</>
                          ) : (
                            <><TrendingDown size={12} /> Protective</>
                          )}
                        </span>
                      </div>
                      <div className="signal-bar-track">
                        <div
                          className={`signal-bar-fill bar-${factor.direction === 'increases_risk' ? 'crimson' : 'teal'}`}
                          style={{
                            width: `${Math.min(100, Math.max(15, (factor.impact * 250) || factor.relativePercent || 40))}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="signals-empty">Calculating signals...</div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="preview-actions-group">
              <button
                type="button"
                onClick={handleSaveCheckup}
                disabled={isSaving}
                className="btn btn-primary btn-block"
              >
                <Save size={16} />
                <span>{isSaving ? 'Saving Checkup...' : 'Save this checkup'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-secondary btn-block"
              >
                <Printer size={16} />
                <span>Print visit summary</span>
              </button>
            </div>

            {/* Feedback Notification */}
            {saveSuccessMsg && (
              <div className="save-toast-banner toast-success">
                <CheckCircle2 size={16} />
                <span>{saveSuccessMsg}</span>
              </div>
            )}
            {saveErrorMsg && (
              <div className="save-toast-banner toast-error">
                <AlertCircle size={16} />
                <span>{saveErrorMsg}</span>
              </div>
            )}

            {/* Micro Callout Tip */}
            <div className="small-signals-tip-card">
              <div className="tip-title">Small signals compound</div>
              <p className="tip-text">
                Regular awareness, blood pressure monitoring, and periodic check-ins can make a meaningful difference.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
