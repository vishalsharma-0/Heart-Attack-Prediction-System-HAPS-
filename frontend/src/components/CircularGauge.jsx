import React from 'react';

export default function CircularGauge({
  percentage = 12,
  riskLevel = 'Low',
  size = 180,
  strokeWidth = 14,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Clamp between 0 and 100
  const clamped = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (clamped / 100) * circumference;

  let strokeColor = 'var(--emerald-500)';
  let glowColor = 'rgba(16, 185, 129, 0.25)';
  let textColor = 'var(--emerald-600)';

  if (riskLevel === 'High') {
    strokeColor = 'var(--crimson-500)';
    glowColor = 'rgba(244, 63, 94, 0.3)';
    textColor = 'var(--crimson-600)';
  } else if (riskLevel === 'Moderate') {
    strokeColor = 'var(--amber-500)';
    glowColor = 'rgba(245, 158, 11, 0.25)';
    textColor = 'var(--amber-600)';
  }

  return (
    <div
      className="circular-gauge-container"
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
      }}
    >
      <svg
        width={size}
        height={size}
        style={{
          transform: 'rotate(-90deg)',
          filter: `drop-shadow(0 0 10px ${glowColor})`,
        }}
      >
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--gauge-track, #e2e8f0)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Dynamic progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          style={{
            transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease',
          }}
        />
      </svg>

      {/* Center Label */}
      <div
        className="circular-gauge-label"
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontSize: size > 150 ? '2.5rem' : '1.75rem',
            fontWeight: 800,
            lineHeight: 1,
            color: 'var(--text-main)',
            letterSpacing: '-0.03em',
          }}
        >
          {clamped}%
        </span>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            marginTop: '0.35rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Risk estimate
        </span>
      </div>
    </div>
  );
}
