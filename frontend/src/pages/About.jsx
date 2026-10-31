import React from 'react';
import {
  Heart,
  ShieldCheck,
  Activity,
  Database,
  Users,
  AlertTriangle,
  Stethoscope,
  Target,
  FileText,
} from 'lucide-react';

export default function About() {
  return (
    <div className="about-page-container">
      {/* Header */}
      <div className="workspace-header-bar">
        <div>
          <div className="workspace-tag">
            <Heart size={14} />
            <span>PUBLIC CARDIOVASCULAR HEALTH PLATFORM</span>
          </div>
          <h1 className="workspace-title">About CardioGuard</h1>
          <p className="workspace-subtitle">
            A preventive screening system built to empower individuals and clinicians with early cardiovascular insights.
          </p>
        </div>
      </div>

      {/* Main Grid: Mission & Target Patients */}
      <div className="about-sections-grid">
        {/* Card 1: What It Is Made For */}
        <div className="about-card">
          <div className="about-card-icon-wrap">
            <Target size={24} className="text-teal" />
          </div>
          <h2 className="about-card-title">What CardioGuard Is Made For</h2>
          <p className="about-card-p">
            CardioGuard is designed as a calm, accessible screening workspace for early cardiovascular risk stratification. Cardiovascular disease often develops silently over years before manifesting as an acute coronary event.
          </p>
          <p className="about-card-p">
            By analyzing key resting biomarkers alongside peak exercise electrocardiogram responses, CardioGuard provides an immediate probability estimate and breaks down the specific clinical signals shaping the outcome.
          </p>
        </div>

        {/* Card 2: What Kind of Patient It Is For */}
        <div className="about-card">
          <div className="about-card-icon-wrap">
            <Users size={24} className="text-teal" />
          </div>
          <h2 className="about-card-title">Who This Platform Is For</h2>
          <ul className="about-feature-list">
            <li>
              <strong>General Adults (Ages 20–80+):</strong> Conducting routine periodic health checks or monitoring baseline cardiovascular vitals.
            </li>
            <li>
              <strong>Patients with Risk Factors:</strong> Individuals with hypertension, elevated serum cholesterol, diabetes, or a family history of heart disease.
            </li>
            <li>
              <strong>Active & Athletic Individuals:</strong> Checking how exercise heart rate and recovery metrics compare against standard clinical ranges.
            </li>
            <li>
              <strong>Outpatient Consultation Prep:</strong> Patients who want to bring a clear, structured summary of their physiological parameters to their doctor.
            </li>
          </ul>
        </div>
      </div>

      {/* Dataset & Training Architecture */}
      <div className="about-dataset-card">
        <div className="card-header-clean">
          <div className="chart-title-wrap">
            <Database size={20} className="text-teal" />
            <h2 className="chart-card-title">Trained on 3,000 Real Patient Records</h2>
          </div>
          <span className="badge-teal">13 Gold-Standard Clinical Signals</span>
        </div>

        <div className="dataset-details-grid">
          <div className="dataset-detail-col">
            <h4 className="detail-col-title">Cohort Size & Validation</h4>
            <p className="detail-col-p">
              The model was rigorously trained and evaluated on <strong>3,000 verified clinical cardiovascular records</strong> using stratified 5-fold cross-validation.
            </p>
            <p className="detail-col-p">
              All preprocessing (standard scaling and one-hot encoding) was fitted strictly inside training folds to prevent any synthetic data leakage.
            </p>
          </div>

          <div className="dataset-detail-col">
            <h4 className="detail-col-title">Recall-First Clinical Philosophy</h4>
            <p className="detail-col-p">
              In preventive heart health, a false alarm (recommending a doctor visit) is far safer than a missed diagnosis.
            </p>
            <p className="detail-col-p">
              Therefore, CardioGuard utilizes <strong>F₂-score threshold optimization (T = 0.300)</strong>, prioritizing maximum clinical recall (<strong>99.6%</strong>) so potential at-risk cases are captured and flagged for review.
            </p>
          </div>
        </div>
      </div>

      {/* Transparent Medical Disclaimer */}
      <div className="about-disclaimer-card">
        <div className="disclaimer-header">
          <AlertTriangle size={22} className="text-crimson" />
          <h3 className="disclaimer-title">Important Medical & Emergency Disclaimer</h3>
        </div>
        <p className="disclaimer-body">
          CardioGuard is an educational and clinical decision support screening tool, not a diagnostic medical device. It does not replace comprehensive medical evaluation by a licensed cardiologist or healthcare provider.
        </p>
        <p className="disclaimer-body">
          If you are experiencing active chest pain, pressure, pain radiating to your jaw or left arm, severe breathlessness, or dizziness, do not use this screening tool. <strong>Please contact emergency services (112 or 911) immediately.</strong>
        </p>
      </div>
    </div>
  );
}
