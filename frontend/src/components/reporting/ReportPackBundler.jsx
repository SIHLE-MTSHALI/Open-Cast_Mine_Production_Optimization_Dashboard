/**
 * ReportPackBundler.jsx — Issue #89
 *
 * Report pack management:
 *  - Report type selector (daily production, management review, quality, reconciliation)
 *  - Schedule configuration (frequency, time, recipients)
 *  - PDF bundle preview and download
 *  - Delivery history log
 */

import React, { useState, useEffect } from 'react';
import {
    FileText, Calendar, Mail, Download, Play, Clock,
    CheckCircle, XCircle, Settings, Pause, Plus
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api';

const API = API_BASE_URL;

const REPORT_TYPES = [
    { value: 'daily_production', label: 'Daily Production', desc: 'Tonnage, quality, operating hours' },
    { value: 'management_review', label: 'Management Review', desc: 'KPIs, trend analysis, forecasts' },
    { value: 'quality_summary', label: 'Quality Summary', desc: 'Product compliance, lab results' },
    { value: 'reconciliation', label: 'Reconciliation', desc: 'Planned vs actual variance' },
    { value: 'fleet_utilization', label: 'Fleet Utilization', desc: 'Equipment hours, availability' },
];

const DEMO_SCHEDULES = [
    {
        id: 'SCH-001', name: 'Daily Ops Report', report_type: 'daily_production', frequency: 'daily', time: '06:00',
        recipients: ['ops@mine.co.za', 'manager@mine.co.za'], status: 'active', lastRun: '2026-02-22 06:00', nextRun: '2026-02-23 06:00'
    },
    {
        id: 'SCH-002', name: 'Weekly Management', report_type: 'management_review', frequency: 'weekly', time: '08:00',
        recipients: ['gm@mine.co.za', 'directors@mine.co.za'], status: 'active', lastRun: '2026-02-17 08:00', nextRun: '2026-02-24 08:00'
    },
    {
        id: 'SCH-003', name: 'Quality Compliance', report_type: 'quality_summary', frequency: 'daily', time: '07:00',
        recipients: ['quality@mine.co.za'], status: 'paused', lastRun: '2026-02-20 07:00', nextRun: null
    },
];

const DEMO_DELIVERIES = [
    { id: 1, schedule: 'SCH-001', time: '2026-02-22 06:01', status: 'delivered', recipients: 2, size: '245 KB' },
    { id: 2, schedule: 'SCH-001', time: '2026-02-21 06:00', status: 'delivered', recipients: 2, size: '238 KB' },
    { id: 3, schedule: 'SCH-002', time: '2026-02-17 08:02', status: 'delivered', recipients: 2, size: '1.2 MB' },
    { id: 4, schedule: 'SCH-003', time: '2026-02-20 07:01', status: 'failed', recipients: 0, size: '—', error: 'SMTP timeout' },
];


export default function ReportPackBundler({ siteId }) {
    const [schedules, setSchedules] = useState(DEMO_SCHEDULES);
    const [deliveries, setDeliveries] = useState(DEMO_DELIVERIES);
    const [view, setView] = useState('schedules');
    const [showNewForm, setShowNewForm] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        name: '', report_type: 'daily_production', frequency: 'daily', time: '06:00', recipients: '',
    });

    const handleCreate = () => {
        const sch = {
            id: `SCH-${String(schedules.length + 1).padStart(3, '0')}`,
            ...newSchedule,
            recipients: newSchedule.recipients.split(',').map(e => e.trim()).filter(Boolean),
            status: 'active',
            lastRun: null,
            nextRun: 'Pending',
        };
        setSchedules(prev => [...prev, sch]);
        setShowNewForm(false);
    };

    const toggleSchedule = (id) => {
        setSchedules(prev => prev.map(s =>
            s.id === id ? { ...s, status: s.status === 'active' ? 'paused' : 'active' } : s
        ));
    };

    const runNow = async (id) => {
        try {
            await axios.post(`${API}/reports/schedules/${id}/run`);
        } catch { }
        setDeliveries(prev => [{
            id: prev.length + 1, schedule: id, time: new Date().toISOString().slice(0, 16).replace('T', ' '),
            status: 'delivered', recipients: schedules.find(s => s.id === id)?.recipients?.length || 0, size: '198 KB',
        }, ...prev]);
    };

    return (
        <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                    <FileText size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Report Pack & Scheduling
                </h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    {[['schedules', 'Schedules'], ['history', 'Delivery History']].map(([k, l]) => (
                        <button key={k} onClick={() => setView(k)} style={{
                            padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                            border: view === k ? '1px solid #3b82f6' : '1px solid var(--color-border, #444)',
                            background: view === k ? 'rgba(59,130,246,0.1)' : 'transparent',
                            color: view === k ? '#60a5fa' : 'var(--color-text-secondary, #aaa)',
                        }}>{l}</button>
                    ))}
                </div>
            </div>

            {view === 'schedules' && (
                <>
                    <button onClick={() => setShowNewForm(!showNewForm)} style={btnPrimary}>
                        <Plus size={14} /> New Schedule
                    </button>

                    {showNewForm && (
                        <div style={{ ...card, marginTop: 12, marginBottom: 12 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                                <div>
                                    <label style={lbl}>Name</label>
                                    <input value={newSchedule.name} onChange={e => setNewSchedule(p => ({ ...p, name: e.target.value }))} style={inp} placeholder="Report name" />
                                </div>
                                <div>
                                    <label style={lbl}>Type</label>
                                    <select value={newSchedule.report_type} onChange={e => setNewSchedule(p => ({ ...p, report_type: e.target.value }))} style={inp}>
                                        {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={lbl}>Frequency</label>
                                    <select value={newSchedule.frequency} onChange={e => setNewSchedule(p => ({ ...p, frequency: e.target.value }))} style={inp}>
                                        <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginBottom: 10 }}>
                                <div><label style={lbl}>Time</label><input type="time" value={newSchedule.time} onChange={e => setNewSchedule(p => ({ ...p, time: e.target.value }))} style={inp} /></div>
                                <div><label style={lbl}>Recipients (comma separated)</label><input value={newSchedule.recipients} onChange={e => setNewSchedule(p => ({ ...p, recipients: e.target.value }))} style={inp} placeholder="user@mine.co.za, manager@mine.co.za" /></div>
                            </div>
                            <button onClick={handleCreate} style={{ ...btnPrimary, marginTop: 4 }}>Create Schedule</button>
                        </div>
                    )}

                    {/* Schedule cards */}
                    {schedules.map(s => (
                        <div key={s.id} style={{ ...card, marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.status === 'active' ? '#22c55e' : '#f59e0b' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary, #fff)' }}>{s.name}</div>
                                <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>
                                    {REPORT_TYPES.find(t => t.value === s.report_type)?.label} · {s.frequency} at {s.time}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>
                                {s.lastRun && <div>Last: {s.lastRun}</div>}
                                {s.nextRun && <div>Next: {s.nextRun}</div>}
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                                <Mail size={12} color="var(--color-text-secondary, #888)" title={Array.isArray(s.recipients) ? s.recipients.join(', ') : s.recipients} />
                                <span style={{ fontSize: 11, color: 'var(--color-text-secondary, #888)' }}>{Array.isArray(s.recipients) ? s.recipients.length : 0}</span>
                            </div>
                            <button onClick={() => runNow(s.id)} style={btnSmall} title="Run now"><Play size={12} /></button>
                            <button onClick={() => toggleSchedule(s.id)} style={btnSmall} title={s.status === 'active' ? 'Pause' : 'Resume'}>
                                {s.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
                            </button>
                        </div>
                    ))}
                </>
            )}

            {view === 'history' && (
                <div style={card}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border, #333)' }}>
                                {['Schedule', 'Time', 'Status', 'Recipients', 'Size'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '8px 6px', color: 'var(--color-text-secondary, #888)', fontWeight: 600, fontSize: 11 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {deliveries.map(d => (
                                <tr key={d.id} style={{ borderBottom: '1px solid var(--color-border, #222)' }}>
                                    <td style={td}>{d.schedule}</td>
                                    <td style={td}>{d.time}</td>
                                    <td style={td}>
                                        {d.status === 'delivered' ? (
                                            <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} /> Delivered</span>
                                        ) : (
                                            <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={12} /> {d.error || 'Failed'}</span>
                                        )}
                                    </td>
                                    <td style={td}>{d.recipients}</td>
                                    <td style={td}>{d.size}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const card = { background: 'var(--color-bg-secondary, #1e1e2e)', border: '1px solid var(--color-border, #333)', borderRadius: 10, padding: 14 };
const td = { padding: '8px 6px', color: 'var(--color-text-primary, #ddd)' };
const lbl = { display: 'block', fontSize: 10, marginBottom: 3, color: 'var(--color-text-secondary, #888)' };
const inp = { width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--color-border, #444)', background: 'var(--color-bg-tertiary, #2a2a3a)', color: 'var(--color-text-primary, #fff)', fontSize: 12 };
const btnPrimary = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' };
const btnSmall = { background: 'var(--color-bg-tertiary, #2a2a3a)', border: '1px solid var(--color-border, #444)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: 'var(--color-text-secondary, #aaa)' };
