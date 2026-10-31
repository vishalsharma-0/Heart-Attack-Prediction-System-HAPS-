import React, { useState, useEffect } from 'react';
import {
  Radio,
  HeartPulse,
  Bluetooth,
  TrendingUp,
  Printer,
  Bell,
  CheckCircle2,
  RefreshCw,
  Activity,
} from 'lucide-react';

export default function DeviceCompanion() {
  const [isConnected, setIsConnected] = useState(false);
  const [liveBpm, setLiveBpm] = useState(72);
  const [systolicBp, setSystolicBp] = useState(122);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    let interval;
    if (isConnected) {
      interval = setInterval(() => {
        setLiveBpm(Math.floor(68 + Math.random() * 12));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const handleToggleConnection = () => {
    if (isConnected) {
      setIsConnected(false);
    } else {
      setConnecting(true);
      setTimeout(() => {
        setConnecting(false);
        setIsConnected(true);
      }, 1200);
    }
  };

  return (
    <div className="device-page-container">
      {/* Header */}
      <div className="workspace-header-bar">
        <div>
          <div className="workspace-tag">
            <Radio size={14} />
            <span>LIVE VITALS</span>
          </div>
          <h1 className="workspace-title">Device companion</h1>
          <p className="workspace-subtitle">
            Connect a home monitor or smartwatch to feed live pulse metrics directly into your screening.
          </p>
        </div>
      </div>

      <div className="device-grid">
        {/* Device Feed Card */}
        <div className="device-card">
          <div className="device-card-header">
            <div className="device-meta">
              <div className="device-icon-box">
                <Bluetooth size={22} className={isConnected ? 'text-teal' : 'text-muted'} />
              </div>
              <div>
                <h3 className="device-name">{isConnected ? 'CardioPulse BLE Sensor' : 'No device connected'}</h3>
                <span className="device-status-text">
                  {isConnected ? 'Actively streaming heart telemetry' : 'Ready to pair via Web Bluetooth or simulator'}
                </span>
              </div>
            </div>
            <span className={`device-badge ${isConnected ? 'badge-connected' : 'badge-idle'}`}>
              {isConnected ? 'STREAMING' : 'READY'}
            </span>
          </div>

          <div className="vitals-telemetry-row">
            <div className="telemetry-cell">
              <span className="telemetry-label">HEART RATE</span>
              <div className="telemetry-value-wrap">
                <span className="telemetry-large">{isConnected ? liveBpm : '—'}</span>
                <span className="telemetry-unit">BPM</span>
              </div>
              <span className="telemetry-hint">{isConnected ? 'Resting physiological rhythm' : 'Awaiting sensor'}</span>
            </div>

            <div className="telemetry-cell">
              <span className="telemetry-label">BLOOD PRESSURE</span>
              <div className="telemetry-value-wrap">
                <span className="telemetry-large">{systolicBp}</span>
                <span className="telemetry-unit">systolic</span>
              </div>
              <span className="telemetry-hint">90–180 normal range</span>
            </div>
          </div>

          {/* Animated Waveform */}
          <div className="device-ecg-box">
            <svg viewBox="0 0 400 50" className="device-ecg-svg">
              <path
                d="M0,25 L80,25 L95,22 L110,28 L125,25 L150,25 L160,5 L170,45 L180,15 L190,25 L240,25 L255,22 L270,28 L285,25 L310,25 L320,5 L330,45 L340,15 L350,25 L400,25"
                fill="none"
                stroke={isConnected ? 'var(--crimson-500)' : 'var(--text-dim)'}
                strokeWidth="2.5"
                strokeLinecap="round"
                className={isConnected ? 'ecg-animated-path' : ''}
              />
            </svg>
          </div>

          <button
            type="button"
            onClick={handleToggleConnection}
            disabled={connecting}
            className={`btn btn-block ${isConnected ? 'btn-secondary' : 'btn-primary'}`}
          >
            {connecting ? (
              <><RefreshCw size={16} className="spin-icon" /> Pairing sensor...</>
            ) : isConnected ? (
              <><CheckCircle2 size={16} className="text-teal" /> Disconnect Sensor</>
            ) : (
              <><Bluetooth size={16} /> Connect heart-rate device</>
            )}
          </button>
        </div>

        {/* Clinical Value Pitch Card */}
        <div className="device-pitch-card">
          <span className="eyebrow-accent">BUILT FOR CALM FOLLOW-THROUGH</span>
          <h2 className="pitch-title">Small signals, better conversations.</h2>
          <p className="pitch-desc">
            Your timeline, visit summary, and live heart-rate feed are designed to help you arrive at a clinical consultation with clearer context.
          </p>

          <div className="pitch-points-list">
            <div className="pitch-point-item">
              <div className="point-icon"><TrendingUp size={16} /></div>
              <div>
                <strong>Spot change over time</strong>
                <p>Observe how resting rate and exertion respond to daily habits.</p>
              </div>
            </div>

            <div className="pitch-point-item">
              <div className="point-icon"><Printer size={16} /></div>
              <div>
                <strong>Print a clinician-ready summary</strong>
                <p>Equip your physician with structured data points instead of vague recall.</p>
              </div>
            </div>

            <div className="pitch-point-item">
              <div className="point-icon"><Bell size={16} /></div>
              <div>
                <strong>Get reminders while this page is open</strong>
                <p>Scheduled alerts help maintain consistent medication and monitoring habits.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
