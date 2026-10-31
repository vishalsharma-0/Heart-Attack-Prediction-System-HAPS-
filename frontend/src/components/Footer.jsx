import React from 'react';
import { Heart, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-clean">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <div className="footer-logo-row">
            <div className="brand-logo-icon-sm">
              <Heart size={16} fill="currentColor" />
            </div>
            <strong className="footer-brand-title">CardioGuard</strong>
          </div>
          <p className="footer-brand-tagline">
            Empowering proactive cardiovascular screening through transparent machine learning.
          </p>
          <div className="footer-privacy-pill">
            <ShieldCheck size={14} className="text-teal" />
            <span>Private & secure screening</span>
          </div>
        </div>

        <div className="footer-nav-col">
          <h4 className="footer-col-title">Navigation</h4>
          <ul className="footer-links-list">
            <li><Link to="/predict">Assessment Workspace</Link></li>
            <li><Link to="/history">Checkup History</Link></li>
            <li><Link to="/insights">Dataset Insights (3,000 cohort)</Link></li>
            <li><Link to="/reminders">Care Reminders</Link></li>
            <li><Link to="/device">Device Companion</Link></li>
            <li><Link to="/about">About & Clinical Mission</Link></li>
          </ul>
        </div>

        <div className="footer-disclaimer-col">
          <h4 className="footer-col-title">Medical Disclaimer</h4>
          <p className="footer-disclaimer-text">
            CardioGuard is designed as an educational cardiovascular screening and risk stratification aid. It is not an FDA-cleared diagnostic device and should never replace consultation with a licensed cardiologist or emergency healthcare provider.
          </p>
        </div>
      </div>

      <div className="footer-bottom-row">
        <span>© {new Date().getFullYear()} CardioGuard Heart Health Check. All rights reserved.</span>
        <span>Screening support, not a clinical diagnosis.</span>
      </div>
    </footer>
  );
}
