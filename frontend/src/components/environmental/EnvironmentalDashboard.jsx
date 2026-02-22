/**
 * EnvironmentalDashboard.jsx — Issue #102
 *
 * Environmental monitoring integration:
 *  - Dust monitoring (PM10, PM2.5) with compliance thresholds
 *  - Noise level tracking
 *  - Water quality parameters
 *  - Rehabilitation progress tracker
 *  - Regulatory compliance status
 */

import React, { useState, useMemo } from 'react';
import {
    Leaf, Wind, Volume2, Droplets, TreePine,
    AlertTriangle, CheckCircle, TrendingUp, BarChart3
} from 'lucide-react';

const COMPLIANCE_COLORS = { compliant: '#22c55e', warning: '#f59e0b', breach: '#ef4444' };

const DEMO_DUST = [
    { station: 'East Fence', pm10: 42, pm25: 18, limit_pm10: 75, limit_pm25: 25, status: 'compliant' },
    { station: 'West Fence', pm10: 68, pm25: 22, limit_pm10: 75, limit_pm25: 25, status: 'warning' },
    { station: 'Community A', pm10: 35, pm25: 15, limit_pm10: 75, limit_pm25: 25, status: 'compliant' },
    { station: 'Haul Road N', pm10: 85, pm25: 32, limit_pm10: 75, limit_pm25: 25, status: 'breach' },
];

const DEMO_NOISE = [
    { station: 'East Fence', level_db: 52, limit_db: 65, status: 'compliant' },
    { station: 'Community A', level_db: 48, limit_db: 55, status: 'compliant' },
    { station: 'Blasting Zone', level_db: 72, limit_db: 75, status: 'warning' },
];

const DEMO_WATER = [
    { point: 'Pit Sump', ph: 6.8, tss: 45, ec: 120, status: 'compliant' },
    { point: 'Settling Dam', ph: 7.2, tss: 25, ec: 85, status: 'compliant' },
    { point: 'Downstream', ph: 7.5, tss: 12, ec: 65, status: 'compliant' },
];

const DEMO_REHAB = [
    { area: 'Dump 1 North', total_ha: 12.5, completed_ha: 8.2, pct: 65.6, status: 'in_progress' },
    { area: 'Dump 2 East', total_ha: 8.0, completed_ha: 8.0, pct: 100, status: 'complete' },
    { area: 'Old Pit Area', total_ha: 15.0, completed_ha: 3.5, pct: 23.3, status: 'in_progress' },
    { area: 'Access Road', total_ha: 2.0, completed_ha: 0, pct: 0, status: 'planned' },
];


export default function EnvironmentalDashboard({ siteId }) {
    const [view, setView] = useState('dust');

    const overallCompliance = useMemo(() => {
        const all = [...DEMO_DUST, ...DEMO_NOISE, ...DEMO_WATER];
        const breaches = all.filter(d => d.status === 'breach').length;
        const warnings = all.filter(d => d.status === 'warning').length;
        return { breaches, warnings, total: all.length };
    }, []);

    const rehabProgress = useMemo(() => {
        const total = DEMO_REHAB.reduce((s, r) => s + r.total_ha, 0);
        const done = DEMO_REHAB.reduce((s, r) => s + r.completed_ha, 0);
        return { total, done, pct: ((done / total) * 100).toFixed(0) };
    }, []);

    return (
        <div style={{ padding: 20, maxWidth: 950, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                    <Leaf size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Environmental Monitoring
                </h2>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <SummaryCard icon={Wind} label="Dust Stations" value={DEMO_DUST.length} breaches={DEMO_DUST.filter(d => d.status === 'breach').length} />
                <SummaryCard icon={Volume2} label="Noise" value={DEMO_NOISE.length} breaches={DEMO_NOISE.filter(d => d.status === 'breach').length} />
                <SummaryCard icon={Droplets} label="Water Points" value={DEMO_WATER.length} breaches={DEMO_WATER.filter(d => d.status === 'breach').length} />
                <div style={{ ...card, flex: 1, textAlign: 'center' }}>
                    <TreePine size={16} color="#22c55e" style={{ marginBottom: 4 }} />
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>{rehabProgress.pct}%</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>Rehab ({rehabProgress.done.toFixed(1)}/{rehabProgress.total.toFixed(1)} ha)</div>
                </div>
            </div>

            {/* View tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {[['dust', 'Dust / Air'], ['noise', 'Noise'], ['water', 'Water'], ['rehab', 'Rehabilitation']].map(([k, l]) => (
                    <button key={k} onClick={() => setView(k)} style={{
                        padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                        border: view === k ? '1px solid #3b82f6' : '1px solid var(--color-border, #444)',
                        background: view === k ? 'rgba(59,130,246,0.1)' : 'transparent',
                        color: view === k ? '#60a5fa' : 'var(--color-text-secondary, #aaa)',
                    }}>{l}</button>
                ))}
            </div>

            {/* Dust */}
            {view === 'dust' && (
                <div style={card}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border, #333)' }}>
                                {['Station', 'PM10 (µg/m³)', 'Limit', 'PM2.5 (µg/m³)', 'Limit', 'Status'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '8px 6px', color: 'var(--color-text-secondary, #888)', fontWeight: 600, fontSize: 11 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DEMO_DUST.map((d, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--color-border, #222)' }}>
                                    <td style={td}>{d.station}</td>
                                    <td style={{ ...td, fontWeight: 700, color: d.pm10 > d.limit_pm10 ? '#ef4444' : 'var(--color-text-primary, #ddd)' }}>{d.pm10}</td>
                                    <td style={{ ...td, color: 'var(--color-text-secondary, #888)' }}>{d.limit_pm10}</td>
                                    <td style={{ ...td, fontWeight: 700, color: d.pm25 > d.limit_pm25 ? '#ef4444' : 'var(--color-text-primary, #ddd)' }}>{d.pm25}</td>
                                    <td style={{ ...td, color: 'var(--color-text-secondary, #888)' }}>{d.limit_pm25}</td>
                                    <td style={td}><StatusBadge status={d.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Noise */}
            {view === 'noise' && (
                <div style={card}>
                    {DEMO_NOISE.map((n, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < DEMO_NOISE.length - 1 ? '1px solid var(--color-border, #222)' : 'none' }}>
                            <Volume2 size={16} color="var(--color-text-secondary, #888)" />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary, #ddd)' }}>{n.station}</div>
                            </div>
                            <div style={{ width: 150 }}>
                                <div style={{ height: 6, borderRadius: 3, background: 'var(--color-bg-tertiary, #2a2a3a)', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', width: `${(n.level_db / n.limit_db) * 100}%`, borderRadius: 3,
                                        background: n.level_db > n.limit_db ? '#ef4444' : n.level_db > n.limit_db * 0.85 ? '#f59e0b' : '#22c55e',
                                    }} />
                                </div>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary, #fff)', width: 50, textAlign: 'right' }}>{n.level_db} dB</span>
                            <span style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)', width: 40 }}>/ {n.limit_db}</span>
                            <StatusBadge status={n.status} />
                        </div>
                    ))}
                </div>
            )}

            {/* Water */}
            {view === 'water' && (
                <div style={card}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border, #333)' }}>
                                {['Point', 'pH', 'TSS (mg/L)', 'EC (µS/cm)', 'Status'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '8px 6px', color: 'var(--color-text-secondary, #888)', fontWeight: 600, fontSize: 11 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DEMO_WATER.map((w, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--color-border, #222)' }}>
                                    <td style={td}>{w.point}</td>
                                    <td style={td}>{w.ph}</td>
                                    <td style={td}>{w.tss}</td>
                                    <td style={td}>{w.ec}</td>
                                    <td style={td}><StatusBadge status={w.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Rehabilitation */}
            {view === 'rehab' && (
                <div style={card}>
                    {DEMO_REHAB.map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < DEMO_REHAB.length - 1 ? '1px solid var(--color-border, #222)' : 'none' }}>
                            <TreePine size={16} color={r.status === 'complete' ? '#22c55e' : 'var(--color-text-secondary, #888)'} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary, #ddd)' }}>{r.area}</div>
                                <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>{r.completed_ha.toFixed(1)} / {r.total_ha.toFixed(1)} ha</div>
                            </div>
                            <div style={{ width: 150 }}>
                                <div style={{ height: 8, borderRadius: 4, background: 'var(--color-bg-tertiary, #2a2a3a)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${r.pct}%`, borderRadius: 4, background: r.pct === 100 ? '#22c55e' : '#3b82f6' }} />
                                </div>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: r.pct === 100 ? '#22c55e' : 'var(--color-text-primary, #fff)', width: 40, textAlign: 'right' }}>
                                {r.pct.toFixed(0)}%
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function SummaryCard({ icon: Icon, label, value, breaches }) {
    return (
        <div style={{ ...card, flex: 1, textAlign: 'center' }}>
            <Icon size={16} color={breaches > 0 ? '#ef4444' : '#22c55e'} style={{ marginBottom: 4 }} />
            <div style={{ fontSize: 20, fontWeight: 700, color: breaches > 0 ? '#ef4444' : '#22c55e' }}>{breaches > 0 ? `${breaches}/${value}` : value}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>{label} {breaches > 0 ? 'Breaches' : 'OK'}</div>
        </div>
    );
}

function StatusBadge({ status }) {
    const cfg = { compliant: { color: '#22c55e', label: '✓ OK' }, warning: { color: '#f59e0b', label: '⚠ Warn' }, breach: { color: '#ef4444', label: '✕ Breach' } };
    const c = cfg[status] || cfg.compliant;
    return (
        <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: `${c.color}15`, color: c.color }}>
            {c.label}
        </span>
    );
}

const card = { background: 'var(--color-bg-secondary, #1e1e2e)', border: '1px solid var(--color-border, #333)', borderRadius: 10, padding: 14 };
const td = { padding: '8px 6px', color: 'var(--color-text-primary, #ddd)' };
