/**
 * SlopeStabilityPanel.jsx — Issue #101
 *
 * Slope stability and geotechnical analysis:
 *  - Factor of Safety (FoS) calculator per slope design
 *  - Prism monitoring data display
 *  - Water table level tracking
 *  - Slope angle analysis tool
 *  - Alert thresholds for FoS and prism movement
 */

import React, { useState, useMemo } from 'react';
import {
    Mountain, AlertTriangle, TrendingDown, TrendingUp,
    Target, Droplets, Eye, Shield
} from 'lucide-react';

const FOS_THRESHOLDS = { critical: 1.0, warning: 1.2, acceptable: 1.3, good: 1.5 };

const DEMO_SLOPES = [
    { id: 'SL-01', name: 'East Highwall', angle: 55, height: 45, fos: 1.42, benchWidth: 6, waterLevel: 12, status: 'acceptable' },
    { id: 'SL-02', name: 'West Highwall', angle: 50, height: 38, fos: 1.65, benchWidth: 8, waterLevel: 8, status: 'good' },
    { id: 'SL-03', name: 'South Endwall', angle: 48, height: 30, fos: 1.18, benchWidth: 5, waterLevel: 18, status: 'warning' },
    { id: 'SL-04', name: 'Dump Slope', angle: 37, height: 25, fos: 1.55, benchWidth: 10, waterLevel: 5, status: 'good' },
];

const DEMO_PRISMS = [
    { id: 'PR-01', slope: 'SL-01', x: 1200, y: 3400, movement: 2.1, rate: 0.3, trend: 'stable', lastRead: '2026-02-22 14:00' },
    { id: 'PR-02', slope: 'SL-01', x: 1250, y: 3420, movement: 5.8, rate: 1.2, trend: 'increasing', lastRead: '2026-02-22 14:00' },
    { id: 'PR-03', slope: 'SL-03', x: 800, y: 2100, movement: 12.4, rate: 2.5, trend: 'accelerating', lastRead: '2026-02-22 13:30' },
    { id: 'PR-04', slope: 'SL-02', x: 500, y: 4200, movement: 0.8, rate: 0.1, trend: 'stable', lastRead: '2026-02-22 14:00' },
];


export default function SlopeStabilityPanel({ siteId }) {
    const [slopes, setSlopes] = useState(DEMO_SLOPES);
    const [prisms, setPrisms] = useState(DEMO_PRISMS);
    const [selectedSlope, setSelectedSlope] = useState(null);
    const [view, setView] = useState('overview');

    const alertCount = useMemo(() => ({
        critical: slopes.filter(s => s.fos < FOS_THRESHOLDS.critical).length + prisms.filter(p => p.trend === 'accelerating').length,
        warning: slopes.filter(s => s.fos >= FOS_THRESHOLDS.critical && s.fos < FOS_THRESHOLDS.acceptable).length + prisms.filter(p => p.trend === 'increasing').length,
    }), [slopes, prisms]);

    const fosColor = (fos) => {
        if (fos < FOS_THRESHOLDS.critical) return '#ef4444';
        if (fos < FOS_THRESHOLDS.warning) return '#f59e0b';
        if (fos < FOS_THRESHOLDS.good) return '#22c55e';
        return '#3b82f6';
    };

    const trendColor = (trend) => {
        if (trend === 'accelerating') return '#ef4444';
        if (trend === 'increasing') return '#f59e0b';
        return '#22c55e';
    };

    const sel = slopes.find(s => s.id === selectedSlope);
    const selPrisms = prisms.filter(p => p.slope === selectedSlope);

    return (
        <div style={{ padding: 20, maxWidth: 950, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                    <Mountain size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Slope Stability
                </h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    {alertCount.critical > 0 && (
                        <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                            {alertCount.critical} Critical
                        </span>
                    )}
                    {alertCount.warning > 0 && (
                        <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                            {alertCount.warning} Warning
                        </span>
                    )}
                </div>
            </div>

            {/* View tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {[['overview', 'Slopes'], ['prisms', 'Prism Monitor'], ['analysis', 'Analysis']].map(([k, l]) => (
                    <button key={k} onClick={() => setView(k)} style={{
                        padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                        border: view === k ? '1px solid #3b82f6' : '1px solid var(--color-border, #444)',
                        background: view === k ? 'rgba(59,130,246,0.1)' : 'transparent',
                        color: view === k ? '#60a5fa' : 'var(--color-text-secondary, #aaa)',
                    }}>{l}</button>
                ))}
            </div>

            {/* Slopes overview */}
            {view === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {slopes.map(s => (
                        <div key={s.id} onClick={() => { setSelectedSlope(s.id); setView('analysis'); }} style={{
                            ...card, cursor: 'pointer',
                            borderColor: s.fos < FOS_THRESHOLDS.acceptable ? 'rgba(245,158,11,0.3)' : undefined,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary, #fff)' }}>{s.name}</span>
                                <Shield size={14} color={fosColor(s.fos)} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                                <MiniKPI label="FoS" value={s.fos.toFixed(2)} color={fosColor(s.fos)} />
                                <MiniKPI label="Angle" value={`${s.angle}°`} />
                                <MiniKPI label="Height" value={`${s.height}m`} />
                                <MiniKPI label="Water" value={`${s.waterLevel}m`} color={s.waterLevel > 15 ? '#f59e0b' : undefined} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Prism monitor */}
            {view === 'prisms' && (
                <div style={card}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border, #333)' }}>
                                {['Prism', 'Slope', 'Movement (mm)', 'Rate (mm/day)', 'Trend', 'Last Reading'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '8px 6px', color: 'var(--color-text-secondary, #888)', fontWeight: 600, fontSize: 11 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {prisms.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border, #222)' }}>
                                    <td style={td}>{p.id}</td>
                                    <td style={td}>{p.slope}</td>
                                    <td style={{ ...td, fontWeight: 700, color: p.movement > 10 ? '#ef4444' : p.movement > 5 ? '#f59e0b' : 'var(--color-text-primary, #ddd)' }}>
                                        {p.movement.toFixed(1)}
                                    </td>
                                    <td style={td}>{p.rate.toFixed(1)}</td>
                                    <td style={td}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 3,
                                            padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                                            background: `${trendColor(p.trend)}15`, color: trendColor(p.trend),
                                        }}>
                                            {p.trend === 'accelerating' && <TrendingUp size={10} />}
                                            {p.trend === 'increasing' && <TrendingUp size={10} />}
                                            {p.trend === 'stable' && <Target size={10} />}
                                            {p.trend}
                                        </span>
                                    </td>
                                    <td style={{ ...td, fontSize: 10 }}>{p.lastRead}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Slope analysis */}
            {view === 'analysis' && sel && (
                <div style={card}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary, #fff)', margin: '0 0 16px' }}>
                        {sel.name} — Slope Analysis
                    </h3>
                    {/* SVG slope profile */}
                    <svg viewBox="0 0 400 200" style={{ width: '100%', height: 200, marginBottom: 16 }}>
                        <defs>
                            <linearGradient id="slopeGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8B7355" />
                                <stop offset="100%" stopColor="#696969" />
                            </linearGradient>
                        </defs>
                        {/* Ground surface */}
                        <polygon points={`50,180 50,${180 - sel.height * 3} ${50 + sel.height * 3 / Math.tan(sel.angle * Math.PI / 180)},180`}
                            fill="url(#slopeGrad)" stroke="#555" strokeWidth={1} />
                        {/* Water table */}
                        <line x1={50} x2={350} y1={180 - sel.waterLevel * 3} y2={180 - sel.waterLevel * 3}
                            stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="6" />
                        {/* Angle arc */}
                        <text x={60} y={175} fontSize={10} fill="#fff">{sel.angle}°</text>
                        {/* Height label */}
                        <line x1={40} x2={40} y1={180} y2={180 - sel.height * 3} stroke="var(--color-text-secondary, #888)" strokeWidth={1} />
                        <text x={10} y={180 - sel.height * 1.5} fontSize={9} fill="var(--color-text-secondary, #888)">{sel.height}m</text>
                        {/* FoS badge */}
                        <rect x={280} y={20} rx={6} ry={6} width={100} height={40} fill="rgba(0,0,0,0.3)" />
                        <text x={330} y={35} textAnchor="middle" fontSize={9} fill="#888">Factor of Safety</text>
                        <text x={330} y={52} textAnchor="middle" fontSize={16} fontWeight="bold" fill={fosColor(sel.fos)}>{sel.fos.toFixed(2)}</text>
                    </svg>
                    {/* Prisms for this slope */}
                    {selPrisms.length > 0 && (
                        <>
                            <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary, #aaa)', margin: '8px 0' }}>Monitoring Prisms</h4>
                            {selPrisms.map(p => (
                                <div key={p.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px',
                                    borderRadius: 6, marginBottom: 4,
                                    background: 'var(--color-bg-tertiary, #2a2a3a)',
                                }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary, #ddd)', width: 60 }}>{p.id}</span>
                                    <span style={{ fontSize: 11, color: 'var(--color-text-secondary, #aaa)' }}>{p.movement.toFixed(1)}mm</span>
                                    <span style={{ fontSize: 11, color: trendColor(p.trend), fontWeight: 600 }}>{p.trend}</span>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

function MiniKPI({ label, value, color }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: color || 'var(--color-text-primary, #fff)' }}>{value}</div>
            <div style={{ fontSize: 9, color: 'var(--color-text-secondary, #888)' }}>{label}</div>
        </div>
    );
}

const card = { background: 'var(--color-bg-secondary, #1e1e2e)', border: '1px solid var(--color-border, #333)', borderRadius: 10, padding: 16 };
const td = { padding: '8px 6px', color: 'var(--color-text-primary, #ddd)' };
