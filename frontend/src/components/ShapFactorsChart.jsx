import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function ShapFactorsChart({ factors = [] }) {
  if (!factors || factors.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>No factor attribution data available.</p>;
  }

  // Format data for Recharts
  const chartData = factors.map(f => ({
    name: f.label || f.feature,
    rawName: f.feature,
    impact: Math.abs(f.impact || 0),
    direction: f.direction,
    value: f.value
  })).reverse();

  return (
    <div>
      <div style={{ height: 260, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 5 }}>
            <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-main)' }} width={120} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      boxShadow: 'var(--shadow-md)'
                    }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</div>
                      <div style={{ color: 'var(--text-muted)', margin: '0.2rem 0' }}>Patient Value: <strong>{item.value}</strong></div>
                      <div style={{
                        color: item.direction === 'increases_risk' ? 'var(--crimson-600)' : 'var(--emerald-600)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        {item.direction === 'increases_risk' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {item.direction === 'increases_risk' ? 'Increases Risk (+)' : 'Decreases Risk (-)'} (Impact: {item.impact})
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="impact" radius={[0, 6, 6, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.direction === 'increases_risk' ? '#e11d48' : '#0d9488'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {factors.map((f, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.75rem',
            backgroundColor: 'var(--bg-surface-alt)',
            borderRadius: '6px',
            fontSize: '0.85rem'
          }}>
            <div>
              <strong>{f.label || f.feature}</strong> (Patient value: {f.value})
            </div>
            <span className={`impact-pill ${f.direction === 'increases_risk' ? 'increase' : 'decrease'}`}>
              {f.direction === 'increases_risk' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {f.direction === 'increases_risk' ? 'Elevates Risk' : 'Lowers Risk'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
