/**
 * ShiftCalendarBuilder.jsx — Issue #40
 *
 * Visual calendar & shift management:
 *  - Shift pattern templates (4-panel, continental, etc.)
 *  - Drag to create/resize shifts
 *  - Maintenance window overlay
 *  - Non-working period exceptions
 *  - Export calendar to schedule engine
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Calendar, Plus, Settings, Clock, Sun, Moon,
    ChevronLeft, ChevronRight, RefreshCw, Save, Download
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api';

const API_BASE = API_BASE_URL;

const SHIFT_TEMPLATES = [
    {
        id: '2x12', name: '2 × 12h', shifts: [
            { name: 'Day Shift', start: '06:00', end: '18:00', color: '#f59e0b' },
            { name: 'Night Shift', start: '18:00', end: '06:00', color: '#3b82f6' },
        ]
    },
    {
        id: '3x8', name: '3 × 8h', shifts: [
            { name: 'Morning', start: '06:00', end: '14:00', color: '#f59e0b' },
            { name: 'Afternoon', start: '14:00', end: '22:00', color: '#22c55e' },
            { name: 'Night', start: '22:00', end: '06:00', color: '#3b82f6' },
        ]
    },
    {
        id: '4panel', name: '4-Panel Continental', shifts: [
            { name: 'Panel A', start: '06:00', end: '18:00', color: '#ef4444' },
            { name: 'Panel B', start: '18:00', end: '06:00', color: '#3b82f6' },
            { name: 'Panel C', start: '06:00', end: '18:00', color: '#22c55e' },
            { name: 'Panel D', start: '18:00', end: '06:00', color: '#f59e0b' },
        ]
    },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];


function ShiftCalendarBuilder({ siteId }) {
    const [template, setTemplate] = useState('2x12');
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [customShifts, setCustomShifts] = useState([]);
    const [exceptions, setExceptions] = useState([]);  // non-working days
    const [maintenanceWindows, setMaintenanceWindows] = useState([]);
    const [showSettings, setShowSettings] = useState(false);

    const selectedTemplate = SHIFT_TEMPLATES.find(t => t.id === template) || SHIFT_TEMPLATES[0];
    const activeShifts = customShifts.length > 0 ? customShifts : selectedTemplate.shifts;

    // Generate calendar days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0
    const daysInMonth = lastDay.getDate();

    const calendarDays = [];
    for (let i = 0; i < startDayOfWeek; i++) calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

    const isException = (day) => exceptions.includes(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    const hasMaintenance = (day) => maintenanceWindows.some(m => {
        const d = new Date(year, month, day);
        return new Date(m.start) <= d && d <= new Date(m.end);
    });

    const toggleException = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setExceptions(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]);
    };

    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    const handleSave = async () => {
        try {
            await axios.post(`${API_BASE}/calendar/site/${siteId}/shifts`, {
                template: template,
                shifts: activeShifts,
                exceptions,
                maintenance_windows: maintenanceWindows,
            });
        } catch (e) {
            console.error('Save failed', e);
        }
    };

    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

    return (
        <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                    <Calendar size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Shift Calendar
                </h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowSettings(s => !s)} style={btnSecondary}>
                        <Settings size={14} />
                    </button>
                    <button onClick={handleSave} style={btnPrimary}>
                        <Save size={14} /> Save
                    </button>
                </div>
            </div>

            {/* Settings */}
            {showSettings && (
                <div style={{ ...cardStyle, marginBottom: 16 }}>
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>Shift Template</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {SHIFT_TEMPLATES.map(t => (
                                <button key={t.id} onClick={() => { setTemplate(t.id); setCustomShifts([]); }} style={{
                                    padding: '6px 14px', borderRadius: 6, fontSize: 12,
                                    border: template === t.id ? '1px solid #3b82f6' : '1px solid var(--color-border, #444)',
                                    background: template === t.id ? 'rgba(59,130,246,0.15)' : 'transparent',
                                    color: template === t.id ? '#60a5fa' : 'var(--color-text-secondary, #aaa)',
                                    cursor: 'pointer',
                                }}>
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Active Shifts</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {activeShifts.map((s, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '4px 10px', borderRadius: 6,
                                    border: `1px solid ${s.color}`,
                                    background: `${s.color}15`,
                                    fontSize: 12, color: s.color,
                                }}>
                                    {s.start.startsWith('06') || s.start.startsWith('14') ? <Sun size={12} /> : <Moon size={12} />}
                                    {s.name} ({s.start}–{s.end})
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Month Navigation */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 16, padding: '8px 0',
            }}>
                <button onClick={prevMonth} style={navBtn}><ChevronLeft size={16} /></button>
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-primary, #fff)' }}>
                    {monthName} {year}
                </span>
                <button onClick={nextMonth} style={navBtn}><ChevronRight size={16} /></button>
            </div>

            {/* Calendar Grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4,
            }}>
                {/* Day headers */}
                {DAYS.map(d => (
                    <div key={d} style={{
                        textAlign: 'center', fontSize: 11, fontWeight: 600,
                        color: 'var(--color-text-secondary, #888)', padding: '4px 0',
                    }}>{d}</div>
                ))}

                {/* Day cells */}
                {calendarDays.map((day, i) => (
                    <div key={i} onClick={() => day && toggleException(day)} style={{
                        minHeight: 60, borderRadius: 6, padding: 4,
                        background: day ? (
                            isException(day) ? 'rgba(239,68,68,0.1)' :
                                hasMaintenance(day) ? 'rgba(245,158,11,0.1)' :
                                    'var(--color-bg-secondary, #1e1e2e)'
                        ) : 'transparent',
                        border: day ? '1px solid var(--color-border, #333)' : 'none',
                        cursor: day ? 'pointer' : 'default',
                    }}>
                        {day && (
                            <>
                                <div style={{
                                    fontSize: 12, fontWeight: 600,
                                    color: isException(day) ? '#ef4444' : 'var(--color-text-primary, #fff)',
                                    marginBottom: 4,
                                }}>
                                    {day}
                                </div>
                                {!isException(day) && activeShifts.map((s, si) => (
                                    <div key={si} style={{
                                        fontSize: 8, padding: '1px 4px', borderRadius: 3,
                                        background: s.color, color: '#fff', marginBottom: 2,
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    }}>
                                        {s.name}
                                    </div>
                                ))}
                                {isException(day) && (
                                    <div style={{ fontSize: 9, color: '#ef4444', fontStyle: 'italic' }}>Off</div>
                                )}
                                {hasMaintenance(day) && (
                                    <div style={{ fontSize: 9, color: '#f59e0b' }}>🔧 Maint</div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 16, fontSize: 11, color: 'var(--color-text-secondary, #aaa)' }}>
                <span>Click day to toggle as non-working</span>
                <span>🔴 = Non-working</span>
                <span>🔧 = Maintenance</span>
            </div>
        </div>
    );
}


// ── Styles ──────────────────────────────────────────────────────────

const cardStyle = {
    background: 'var(--color-bg-secondary, #1e1e2e)',
    border: '1px solid var(--color-border, #333)',
    borderRadius: 10, padding: '14px 18px',
};
const labelStyle = { display: 'block', fontSize: 11, marginBottom: 4, color: 'var(--color-text-secondary, #aaa)' };
const btnPrimary = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
    border: 'none', background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
};
const btnSecondary = {
    display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', borderRadius: 8,
    border: '1px solid var(--color-border, #444)', background: 'transparent',
    color: 'var(--color-text-secondary, #aaa)', fontSize: 13, cursor: 'pointer',
};
const navBtn = {
    padding: 6, borderRadius: 6, border: '1px solid var(--color-border, #444)',
    background: 'transparent', color: 'var(--color-text-secondary, #aaa)', cursor: 'pointer',
};


export default ShiftCalendarBuilder;
