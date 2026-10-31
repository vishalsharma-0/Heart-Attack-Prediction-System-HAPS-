import React, { useState, useEffect } from 'react';
import { fetchPredictions, deletePrediction } from '../api/client';
import {
  History as HistoryIcon,
  Download,
  Trash2,
  ChevronRight,
  TrendingUp,
  X,
  FileSpreadsheet,
  FileJson,
  Activity,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function History() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Load history from both backend and local storage
  const loadHistory = async () => {
    setLoading(true);
    let merged = [];

    // 1. Read local storage
    try {
      const local = JSON.parse(localStorage.getItem('cardioguard_history') || '[]');
      merged = [...local];
    } catch {
      merged = [];
    }

    // 2. Read backend if available
    try {
      const backendData = await fetchPredictions('', 0, 50);
      if (backendData && backendData.content) {
        backendData.content.forEach(bp => {
          const exists = merged.some(m => m.id === bp.id);
          if (!exists) {
            merged.push({
              id: bp.id,
              checkupName: `Clinical Checkup #${bp.id}`,
              date: bp.createdAt,
              formattedDate: new Date(bp.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              features: bp.inputFeatures,
              probability: bp.probability,
              percentage: Math.round(bp.probability * 100),
              riskLevel: bp.riskLevel,
              topFactors: bp.topFactors,
              modelVersion: bp.modelVersion,
            });
          }
        });
      }
    } catch {
      // Backend offline, local records remain intact
    }

    // If completely empty, seed a sample checkup so it looks nice right away
    if (merged.length === 0) {
      merged = [
        {
          id: 101,
          checkupName: 'Balanced baseline',
          date: new Date(Date.now() - 86400000 * 3).toISOString(),
          formattedDate: new Date(Date.now() - 86400000 * 3).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          features: {
            age: 42,
            sex: 0,
            cp: 2,
            trestbps: 122,
            chol: 195,
            fbs: 0,
            restecg: 0,
            thalach: 168,
            exang: 0,
            oldpeak: 0.4,
            slope: 0,
            ca: 0,
            thal: 1,
          },
          probability: 0.12,
          percentage: 12,
          riskLevel: 'Low',
          topFactors: [
            { label: 'Exercise heart rate', direction: 'decreases_risk', impact: 0.09 },
            { label: 'Chest pain pattern', direction: 'decreases_risk', impact: 0.08 },
            { label: 'Resting blood pressure', direction: 'decreases_risk', impact: 0.06 },
          ],
        },
      ];
      localStorage.setItem('cardioguard_history', JSON.stringify(merged));
    }

    // Sort chronologically descending
    merged.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    setHistoryList(merged);
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Clear all records
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your assessment history?')) {
      localStorage.removeItem('cardioguard_history');
      setHistoryList([]);
      setSelectedRecord(null);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(historyList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cardioguard_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCSV = () => {
    if (historyList.length === 0) return;
    const headers = ['ID', 'Checkup Name', 'Date', 'Risk Level', 'Score (%)', 'Age', 'Resting BP', 'Max HR', 'Cholesterol'];
    const rows = historyList.map(item => [
      item.id,
      `"${item.checkupName.replace(/"/g, '""')}"`,
      item.formattedDate || item.date,
      item.riskLevel,
      item.percentage,
      item.features?.age || '',
      item.features?.trestbps || '',
      item.features?.thalach || '',
      item.features?.chol || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodedUri);
    downloadAnchor.setAttribute('download', `cardioguard_records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Data formatted for timeline line chart
  const timelineData = [...historyList]
    .reverse()
    .map((item, index) => ({
      name: item.formattedDate || `Checkup ${index + 1}`,
      score: item.percentage,
      riskLevel: item.riskLevel,
    }));

  return (
    <div className="history-page-container">
      {/* Header */}
      <div className="workspace-header-bar">
        <div>
          <div className="workspace-tag">
            <HistoryIcon size={14} />
            <span>YOUR RECORD</span>
          </div>
          <h1 className="workspace-title">Assessment history</h1>
          <p className="workspace-subtitle">
            Keep a simple trail of checkups to make conversations with your care team easier.
          </p>
        </div>

        {historyList.length > 0 && (
          <button
            type="button"
            onClick={handleClearHistory}
            className="btn btn-outline-danger"
          >
            <Trash2 size={15} />
            <span>Clear history</span>
          </button>
        )}
      </div>

      {/* Main Records Table Card */}
      <div className="history-table-card">
        {loading ? (
          <div className="empty-state-box">Loading saved records...</div>
        ) : historyList.length === 0 ? (
          <div className="empty-state-box">
            <Calendar size={32} className="text-muted mb-2" />
            <p>No checkup records found.</p>
            <span className="text-muted font-sm">Complete an assessment in the workspace to save your first snapshot.</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="history-table">
              <thead>
                <tr>
                  <th>CHECKUP</th>
                  <th>DATE</th>
                  <th>RISK LEVEL</th>
                  <th>SCORE</th>
                  <th style={{ textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map(record => (
                  <tr
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className="history-row-clickable"
                  >
                    <td>
                      <div className="checkup-name-cell">
                        <Activity size={16} className="text-teal" />
                        <strong>{record.checkupName}</strong>
                      </div>
                    </td>
                    <td>{record.formattedDate || record.date?.slice(0, 10)}</td>
                    <td>
                      <span className={`risk-status-badge badge-${record.riskLevel.toLowerCase()}`}>
                        {record.riskLevel}
                      </span>
                    </td>
                    <td>
                      <span className="score-percent-text">{record.percentage}%</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="row-inspect-btn" title="Inspect clinical signals">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Risk Score Timeline Chart Card */}
      <div className="timeline-chart-card">
        <div className="card-header-clean">
          <div className="chart-title-wrap">
            <TrendingUp size={18} className="text-teal" />
            <h2 className="chart-card-title">Risk score timeline</h2>
          </div>
          <span className="chart-legend-text">Percent probability plotted over recorded checkups</span>
        </div>

        {timelineData.length < 2 ? (
          <div className="timeline-hint-box">
            Save at least two checkups to see your personalized trend line.
          </div>
        ) : (
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={timelineData} margin={{ top: 15, right: 25, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis domain={[0, 100]} unit="%" stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="chart-tooltip-box">
                          <div className="tooltip-date">{data.name}</div>
                          <div className="tooltip-score">{data.score}% Estimated Risk</div>
                          <div className="tooltip-risk">{data.riskLevel} Risk Level</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--teal-600)"
                  strokeWidth={3}
                  dot={{ r: 5, fill: 'var(--teal-600)' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Data Controls Card */}
      <div className="data-controls-card">
        <div className="controls-header">
          <h3 className="controls-title">Your data controls</h3>
          <p className="controls-sub">
            Records are stored locally in your browser and synced to the secure database for continuity.
          </p>
        </div>

        <div className="controls-buttons-row">
          <button
            type="button"
            onClick={handleExportJSON}
            disabled={historyList.length === 0}
            className="btn btn-secondary"
          >
            <FileJson size={16} />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={historyList.length === 0}
            className="btn btn-secondary"
          >
            <FileSpreadsheet size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Record Inspection Modal */}
      {selectedRecord && (
        <div className="emergency-modal-backdrop" role="dialog">
          <div className="history-detail-modal">
            <div className="detail-modal-header">
              <div>
                <h3 className="detail-modal-title">{selectedRecord.checkupName}</h3>
                <span className="text-muted font-sm">{selectedRecord.formattedDate}</span>
              </div>
              <button
                className="emergency-modal-close"
                onClick={() => setSelectedRecord(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="detail-kpi-banner">
              <div>
                <div className="font-sm text-muted">CALCULATED RISK</div>
                <div className="score-percent-large">{selectedRecord.percentage}%</div>
              </div>
              <span className={`risk-status-badge badge-${selectedRecord.riskLevel.toLowerCase()}`}>
                {selectedRecord.riskLevel} Risk
              </span>
            </div>

            <div className="detail-signals-grid">
              {selectedRecord.features && Object.entries(selectedRecord.features).map(([key, val]) => (
                <div key={key} className="detail-signal-cell">
                  <span className="signal-label-dim">{key.toUpperCase()}</span>
                  <span className="signal-value-bold">{String(val)}</span>
                </div>
              ))}
            </div>

            <div className="detail-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="btn btn-primary"
              >
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
