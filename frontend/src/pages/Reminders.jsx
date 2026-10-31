import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Trash2,
  Pill,
  Activity,
  Stethoscope,
  Heart,
} from 'lucide-react';

export default function Reminders() {
  const [reminders, setReminders] = useState(() => {
    try {
      const saved = localStorage.getItem('cardioguard_reminders');
      return saved ? JSON.parse(saved) : [
        {
          id: 1,
          title: 'Take evening blood pressure medication',
          type: 'Medication',
          date: '2026-10-15',
          time: '20:00',
          repeat: 'Daily',
          note: 'Take with a glass of water after dinner',
          completed: false,
        },
        {
          id: 2,
          title: 'Weekly resting BP & pulse checkup',
          type: 'Blood Pressure',
          date: '2026-10-18',
          time: '09:00',
          repeat: 'Weekly',
          note: 'Record resting systolic and heart rate in CardioGuard',
          completed: false,
        }
      ];
    } catch {
      return [];
    }
  });

  const [title, setTitle] = useState('');
  const [type, setType] = useState('Medication');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('09:00');
  const [repeat, setRepeat] = useState('Daily');
  const [note, setNote] = useState('');

  useEffect(() => {
    localStorage.setItem('cardioguard_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newReminder = {
      id: Date.now(),
      title: title.trim(),
      type,
      date,
      time,
      repeat,
      note: note.trim(),
      completed: false,
    };

    setReminders([newReminder, ...reminders]);
    setTitle('');
    setNote('');
  };

  const toggleComplete = (id) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const deleteReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  return (
    <div className="reminders-page-container">
      {/* Header */}
      <div className="workspace-header-bar">
        <div>
          <div className="workspace-tag">
            <Bell size={14} />
            <span>STAY ON TRACK</span>
          </div>
          <h1 className="workspace-title">Care reminders</h1>
          <p className="workspace-subtitle">
            Keep follow-ups, medications, and check-ins visible in one gentle list.
          </p>
        </div>
      </div>

      {/* Grid: Left = Add Form, Right = Upcoming list */}
      <div className="reminders-grid">
        {/* Add Reminder Card */}
        <div className="reminder-form-card">
          <div className="card-header-clean">
            <h3 className="section-card-title">Add a reminder</h3>
          </div>

          <form onSubmit={handleAddReminder} className="reminder-form">
            <div className="form-group">
              <label className="field-label">Reminder title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Take morning medication, Log BP"
                className="form-control"
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="field-label">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="form-control"
                >
                  <option value="Medication">Medication</option>
                  <option value="Blood Pressure">Blood Pressure</option>
                  <option value="Doctor Visit">Doctor Visit</option>
                  <option value="Exercise">Exercise / Walk</option>
                  <option value="Diet">Diet & Hydration</option>
                </select>
              </div>

              <div className="form-group">
                <label className="field-label">Repeat</label>
                <select
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value)}
                  className="form-control"
                >
                  <option value="Once">Once</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="field-label">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="field-label">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="A little context for future you..."
                rows="2"
                className="form-control"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block mt-2">
              <Plus size={16} />
              <span>Add reminder</span>
            </button>
          </form>
        </div>

        {/* Upcoming List Card */}
        <div className="reminders-list-card">
          <div className="card-header-clean">
            <h3 className="section-card-title">Upcoming schedule</h3>
            <span className="badge-count">{reminders.filter(r => !r.completed).length} active</span>
          </div>

          {reminders.length === 0 ? (
            <div className="empty-state-box">
              <Calendar size={32} className="text-muted mb-2" />
              <p>Your schedule is clear.</p>
              <span className="text-muted font-sm">Add a medication or checkup reminder whenever you need.</span>
            </div>
          ) : (
            <div className="reminders-items-list">
              {reminders.map((r) => (
                <div
                  key={r.id}
                  className={`reminder-item-card ${r.completed ? 'reminder-completed' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleComplete(r.id)}
                    className="toggle-check-btn"
                    title={r.completed ? 'Mark pending' : 'Mark completed'}
                  >
                    {r.completed ? (
                      <CheckCircle size={20} className="text-teal" />
                    ) : (
                      <Circle size={20} className="text-muted" />
                    )}
                  </button>

                  <div className="reminder-item-body">
                    <div className="reminder-item-header">
                      <span className={`reminder-type-tag tag-${r.type.toLowerCase().replace(/\s+/g, '-')}`}>
                        {r.type}
                      </span>
                      <span className="reminder-repeat-badge">{r.repeat}</span>
                    </div>

                    <h4 className="reminder-item-title">{r.title}</h4>

                    <div className="reminder-time-row">
                      <Calendar size={13} />
                      <span>{r.date}</span>
                      <Clock size={13} className="ml-2" />
                      <span>{r.time}</span>
                    </div>

                    {r.note && <p className="reminder-note-text">{r.note}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteReminder(r.id)}
                    className="delete-reminder-btn"
                    title="Delete reminder"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
