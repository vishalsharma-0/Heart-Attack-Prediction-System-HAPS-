import React from 'react';
import { ShieldAlert, PhoneCall, ArrowRight, X } from 'lucide-react';

export default function EmergencyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="emergency-modal-backdrop" role="dialog" aria-modal="true">
      <div className="emergency-modal-card">
        <button
          className="emergency-modal-close"
          onClick={onClose}
          aria-label="Close emergency disclaimer"
        >
          <X size={18} />
        </button>

        <div className="emergency-icon-wrap">
          <ShieldAlert size={32} className="emergency-icon" />
        </div>

        <div className="emergency-badge">BEFORE YOU BEGIN</div>

        <h2 className="emergency-title">Could this be happening right now?</h2>

        <p className="emergency-subtitle">
          This screening tool cannot rule out an acute cardiac emergency. Stop here and seek immediate medical help if you have:
        </p>

        <div className="emergency-symptom-box">
          <ul className="emergency-symptom-list">
            <li>
              <span className="symptom-warning-icon">⚠</span>
              <span><strong>Chest pressure, pain, fullness, or tightness</strong> in the center of your chest</span>
            </li>
            <li>
              <span className="symptom-warning-icon">⚠</span>
              <span><strong>Pain spreading</strong> to your arm, jaw, neck, back, or shoulder</span>
            </li>
            <li>
              <span className="symptom-warning-icon">⚠</span>
              <span><strong>Severe shortness of breath</strong>, cold sweat, unexplained fainting, or sudden lightheadedness</span>
            </li>
          </ul>
        </div>

        <div className="emergency-actions">
          <a
            href="tel:112"
            className="btn btn-emergency-call"
            title="Call immediate emergency response"
          >
            <PhoneCall size={18} />
            <span>Call emergency services</span>
          </a>

          <button
            type="button"
            className="btn btn-emergency-continue"
            onClick={onClose}
          >
            <span>No, I am safe to continue</span>
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="emergency-footnote">
          If you are experiencing any active symptoms, please do not complete this screening. Emergency medical support is always the safest choice.
        </div>
      </div>
    </div>
  );
}
