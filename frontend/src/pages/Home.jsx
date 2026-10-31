import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Activity,
  Database,
  HeartPulse,
  Sparkles,
  Stethoscope,
  AlertTriangle,
  Clock,
  Radio,
} from 'lucide-react';

export default function Home() {
  const [pulseBpm, setPulseBpm] = useState(72);

  useEffect(() => {
    // Subtle realistic heart rate variation (70-75 bpm)
    const interval = setInterval(() => {
      setPulseBpm(Math.floor(70 + Math.random() * 6));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page-container">
      {/* Hero Section */}
      <section className="hero-grid">
        <div className="hero-content">
          <div className="hero-pill-badge">
            <span className="live-dot-beacon"></span>
            <span>LIVE SCREENING WORKSPACE</span>
          </div>

          <h1 className="hero-headline">
            Know your heart.
            <br />
            <span className="text-gradient-teal">Act earlier.</span>
          </h1>

          <p className="hero-lead-text">
            A clear, calm way to understand cardiovascular risk from the signals that matter most — in under a minute.
          </p>

          <div className="hero-cta-group">
            <Link to="/predict" className="btn btn-primary btn-hero-lg">
              <span>Start an assessment</span>
              <ArrowRight size={18} />
            </Link>

            <div className="privacy-badge">
              <ShieldCheck size={16} className="text-teal" />
              <span>Private on this device</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Pulse Card */}
        <div className="hero-widget-card">
          <div className="hero-widget-inner">
            <div className="pulse-header">
              <div className="pulse-tag">
                <Radio size={14} className="pulse-antenna-icon" />
                <span>LIVE PULSE</span>
              </div>
              <HeartPulse size={24} className="hero-heart-beating" />
            </div>

            <div className="bpm-display-row">
              <span className="bpm-number">{pulseBpm}</span>
              <span className="bpm-unit">BPM</span>
            </div>

            <div className="pulse-status-text">Normal resting range</div>

            {/* Dynamic ECG Waveform SVG */}
            <div className="ecg-waveform-wrap">
              <svg viewBox="0 0 400 60" className="ecg-svg">
                <path
                  d="M0,30 L60,30 L75,28 L90,32 L105,30 L130,30 L140,10 L150,55 L160,20 L170,30 L220,30 L235,28 L250,32 L265,30 L290,30 L300,10 L310,55 L320,20 L330,30 L400,30"
                  fill="none"
                  stroke="var(--crimson-500)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="ecg-animated-path"
                />
              </svg>
            </div>

            <div className="records-badge-footer">
              <Database size={15} />
              <span>3,000 patient records explored</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Callouts Strip */}
      <section className="features-strip">
        <div className="feature-item-pill">
          <div className="feature-item-icon">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="feature-item-title">Instant estimate</div>
            <div className="feature-item-sub">Signals refine in real time</div>
          </div>
        </div>

        <div className="feature-item-pill">
          <div className="feature-item-icon">
            <Activity size={18} />
          </div>
          <div>
            <div className="feature-item-title">Recall-first model</div>
            <div className="feature-item-sub">Designed to reduce missed risk</div>
          </div>
        </div>

        <div className="feature-item-pill">
          <div className="feature-item-icon">
            <Stethoscope size={18} />
          </div>
          <div>
            <div className="feature-item-title">Clinician conversation</div>
            <div className="feature-item-sub">Bring your visit summary</div>
          </div>
        </div>

        <div className="feature-item-pill">
          <div className="feature-item-icon">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="feature-item-title">Screening support</div>
            <div className="feature-item-sub">Not a replacement for diagnosis</div>
          </div>
        </div>
      </section>

      {/* How it works summary */}
      <section className="how-it-works-card">
        <div className="section-header-centered">
          <span className="section-eyebrow">PREVENTIVE WORKFLOW</span>
          <h2 className="section-title">How CardioGuard Works</h2>
          <p className="section-desc">
            Combining 13 validated clinical biomarkers with machine-learned pattern recognition to prioritize patient safety.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Enter Current Signals</h3>
            <p>
              Input resting blood pressure, exercise response, heart rate, and routine lab markers.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h3>Instant Real-Time Triage</h3>
            <p>
              Our calibrated recall-first model continuously evaluates risk probabilities and identifies key contributors.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Structured Clinician Report</h3>
            <p>
              Save checkups to track your cardiovascular trend over time and print a clinical briefing for your care team.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
