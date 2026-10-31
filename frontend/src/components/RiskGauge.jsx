import React from 'react';

export default function RiskGauge({ probability, riskLevel }) {
  const percentage = Math.round((probability || 0) * 100);

  // Calculate arc needle angle: 0% -> -90 deg, 100% -> +90 deg
  const angle = -90 + (percentage / 100) * 180;

  const getColor = () => {
    if (riskLevel === 'High') return 'var(--crimson-600)';
    if (riskLevel === 'Moderate') return 'var(--amber-600)';
    return 'var(--emerald-600)';
  };

  const getBadgeClass = () => {
    if (riskLevel === 'High') return 'badge-risk high';
    if (riskLevel === 'Moderate') return 'badge-risk moderate';
    return 'badge-risk low';
  };

  return (
    <div className="gauge-container">
      <svg viewBox="0 0 200 110" className="gauge-svg">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="var(--border-color)"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Colored arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray="251.2"
          strokeDashoffset={251.2 - (251.2 * (percentage / 100))}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />

        {/* Center pivot point */}
        <circle cx="100" cy="100" r="6" fill="var(--text-main)" />

        {/* Pointer indicator needle */}
        <g transform={`rotate(${angle} 100 100)`} style={{ transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <polygon points="98,100 102,100 100,25" fill={getColor()} />
        </g>
      </svg>

      <div className="gauge-score" style={{ color: getColor() }}>
        {percentage}%
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        <span className={getBadgeClass()}>{riskLevel} Risk</span>
      </div>
    </div>
  );
}
