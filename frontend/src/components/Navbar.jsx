import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Heart,
  Activity,
  History,
  BarChart3,
  Bell,
  Radio,
  Info,
  Sun,
  Moon,
  ShieldAlert,
} from 'lucide-react';
import EmergencyModal from './EmergencyModal';

export default function Navbar() {
  const [theme, setTheme] = useState('light');
  const [showEmergency, setShowEmergency] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('cardioguard_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Show emergency dialog once per session on first visit
    const hasSeenEmergency = sessionStorage.getItem('seen_emergency_modal');
    if (!hasSeenEmergency) {
      setShowEmergency(true);
      sessionStorage.setItem('seen_emergency_modal', 'true');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('cardioguard_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand-link" title="CardioGuard Heart Health Check">
            <div className="brand-logo-icon">
              <Heart size={20} className="heart-pulse-icon" fill="currentColor" />
            </div>
            <div className="brand-text-block">
              <div className="brand-title">CardioGuard</div>
              <div className="brand-subtitle">HEART HEALTH CHECK</div>
            </div>
          </Link>

          <nav className="nav-links">
            <NavLink
              to="/predict"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Activity size={16} />
              <span>Assessment</span>
            </NavLink>

            <NavLink
              to="/history"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <History size={16} />
              <span>History</span>
            </NavLink>

            <NavLink
              to="/insights"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <BarChart3 size={16} />
              <span>Dataset Insights</span>
            </NavLink>

            <NavLink
              to="/reminders"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Bell size={16} />
              <span>Reminders</span>
            </NavLink>

            <NavLink
              to="/device"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Radio size={16} />
              <span>Device</span>
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Info size={16} />
              <span>About</span>
            </NavLink>
          </nav>

          <div className="nav-actions">
            <button
              type="button"
              className="btn btn-outline-alert"
              onClick={() => setShowEmergency(true)}
              title="View emergency symptoms check"
            >
              <ShieldAlert size={16} />
              <span className="hide-on-mobile">Emergency Check</span>
            </button>

            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle visual theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      </header>

      <EmergencyModal
        isOpen={showEmergency}
        onClose={() => setShowEmergency(false)}
      />
    </>
  );
}
