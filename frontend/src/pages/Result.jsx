import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, AlertTriangle, ShieldCheck, Stethoscope, HeartHandshake, FileText } from 'lucide-react';
import RiskGauge from '../components/RiskGauge';
import ShapFactorsChart from '../components/ShapFactorsChart';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    if (location.state?.prediction) {
      setPrediction(location.state.prediction);
    } else {
      const cached = sessionStorage.getItem('latest_prediction');
      if (cached) {
        try {
          setPrediction(JSON.parse(cached));
        } catch (e) {
          navigate('/predict');
        }
      } else {
        navigate('/predict');
      }
    }
  }, [location, navigate]);

  if (!prediction) {
    return null;
  }

  const { probability, riskLevel, topFactors, modelVersion, id } = prediction;

  const handlePrint = () => {
    window.print();
  };

  const getClinicalAdvice = () => {
    if (riskLevel === 'High') {
      return {
        title: 'High Risk Clinical Recommendations (Immediate Follow-Up)',
        color: 'var(--crimson-700)',
        bg: 'var(--crimson-50)',
        steps: [
          'Immediate specialist consultation: Schedule an urgent evaluation with a board-certified cardiologist.',
          'Diagnostic investigations: Recommended 12-lead Electrocardiogram (ECG), serum cardiac troponin biomarkers, and echocardiography.',
          'Physical activity restriction: Avoid strenuous unmonitored exertion until formal clinical clearance is obtained.',
          'Therapeutic compliance: Closely review anti-hypertensive and lipid-lowering pharmacological regimens with a physician.'
        ]
      };
    } else if (riskLevel === 'Moderate') {
      return {
        title: 'Moderate Risk Clinical Recommendations (Outpatient Monitoring)',
        color: 'var(--amber-600)',
        bg: 'var(--amber-50)',
        steps: [
          'Outpatient appointment: Schedule an elective cardiovascular review within 2 to 4 weeks.',
          'Risk factor modification: Implement aggressive blood pressure logging and complete a comprehensive fasting lipid panel.',
          'Lifestyle optimization: Adopt a heart-healthy diet (Mediterranean or DASH pattern) with dietary sodium restriction (< 2,300 mg/day).',
          'Lifestyle cessation: Strictly cease any tobacco or nicotine exposure and moderate alcohol consumption.'
        ]
      };
    } else {
      return {
        title: 'Low Risk Recommendations (Preventive Maintenance)',
        color: 'var(--emerald-600)',
        bg: 'var(--emerald-50)',
        steps: [
          'Routine wellness checks: Continue standard annual preventative health checkups and blood pressure screenings.',
          'Regular physical exercise: Maintain at least 150 minutes of moderate-intensity aerobic exercise per week.',
          'Cardioprotective nutrition: Emphasize whole grains, fiber, lean proteins, vegetables, and unsaturated fats.',
          'Symptom awareness: Seek prompt medical care if experiencing any sudden unexplained chest tightness, palpitations, or dyspnea.'
        ]
      };
    }
  };

  const advice = getClinicalAdvice();

  return (
    <div>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/predict" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Assess Another Patient
        </Link>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/history" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <FileText size={16} /> View Prediction Log
          </Link>
          <button onClick={handlePrint} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            <Printer size={16} /> Print Clinical Summary
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Risk Assessment Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card-header" style={{ width: '100%', textAlign: 'center' }}>
            <h2 className="card-title">Cardiovascular Risk Score</h2>
            <div className="card-subtitle">Validated ML Probability Engine</div>
          </div>

          <RiskGauge probability={probability} riskLevel={riskLevel} />

          <div style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '0.75rem',
            width: '100%'
          }}>
            <div>Model Version: <strong>{modelVersion || 'HAPS-v1.0-CatBoost'}</strong></div>
            {id && <div>Record Reference ID: <strong>#{id}</strong></div>}
          </div>
        </div>

        {/* Top-5 SHAP Factors Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Key Contributing Biomarkers (SHAP)</h2>
            <div className="card-subtitle">Top-5 parameters influencing this individual's prediction</div>
          </div>
          <ShapFactorsChart factors={topFactors} />
        </div>
      </div>

      {/* Tailored Clinical Advice Card */}
      <div className="card" style={{ borderLeft: `5px solid ${advice.color}` }}>
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: advice.color }}>
            <Stethoscope size={22} /> {advice.title}
          </h2>
        </div>

        <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
          {advice.steps.map((step, idx) => (
            <li key={idx} style={{ lineHeight: 1.5 }}>{step}</li>
          ))}
        </ul>
      </div>

      {/* Medical Disclaimer */}
      <div className="disclaimer-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          <AlertTriangle size={18} color="var(--amber-600)" /> Official Clinical Disclaimer
        </div>
        The predictions and biomarker insights presented are calculated algorithmically for clinical decision support. They do not constitute an official diagnosis or treatment plan. All clinical conclusions must be evaluated by a licensed medical practitioner.
      </div>
    </div>
  );
}
