/**
 * PenaltyCurveEditor.jsx — Issue #96
 *
 * Quality spec penalty curve configurator:
 *  - Linear, quadratic, step penalty functions
 *  - Hard vs soft constraint toggle per spec
 *  - Visual penalty curve preview
 *  - Multi-field quality specs (ash, CV, moisture, sulphur)
 */

import React, { useState, useMemo } from 'react';
import { Settings, Target, AlertTriangle, Plus, Trash2 } from 'lucide-react';

const CURVE_TYPES = ['linear', 'quadratic', 'step'];

const DEMO_SPECS = [
    { id: 1, field: 'ash', product: 'Export Coal', min: 0, max: 15, target: 12, type: 'linear', rate: 50000, hard: false },
    { id: 2, field: 'cv', product: 'Export Coal', min: 24, max: 32, target: 27, type: 'quadratic', rate: 80000, hard: false },
    { id: 3, field: 'moisture', product: 'Export Coal', min: 0, max: 10, target: 5, type: 'step', rate: 30000, hard: true },
    { id: 4, field: 'ash', product: 'Domestic Coal', min: 0, max: 22, target: 18, type: 'linear', rate: 20000, hard: false },
];


export default function PenaltyCurveEditor({ siteId }) {
    const [specs, setSpecs] = useState(DEMO_SPECS);
    const [selected, setSelected] = useState(1);

    const spec = specs.find(s => s.id === selected);

    const updateSpec = (field, value) => {
        setSpecs(prev => prev.map(s => s.id === selected ? { ...s, [field]: value } : s));
    };

    // Generate penalty curve points for preview
    const curvePoints = useMemo(() => {
        if (!spec) return [];
        const pts = [];
        const range = spec.max - spec.min;
        for (let i = 0; i <= 40; i++) {
            const val = spec.min + (i / 40) * range;
            let penalty = 0;
            const dev = Math.abs(val - spec.target);
            if (spec.type === 'linear') {
                penalty = dev * spec.rate;
            } else if (spec.type === 'quadratic') {
                penalty = dev * dev * spec.rate;
            } else if (spec.type === 'step') {
                penalty = dev > (range * 0.1) ? spec.rate : 0;
            }
            pts.push({ val, penalty });
        }
        return pts;
    }, [spec]);

    const maxPenalty = Math.max(1, ...curvePoints.map(p => p.penalty));

    return (
        <div style={{ padding: 20, maxWidth: 850, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                    <Target size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Penalty Curve Editor
                </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
                {/* Spec list */}
                <div style={card}>
                    <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary, #aaa)', margin: '0 0 8px' }}>Quality Specs</h3>
                    {specs.map(s => (
                        <div key={s.id} onClick={() => setSelected(s.id)} style={{
                            padding: '8px 10px', borderRadius: 6, marginBottom: 4, cursor: 'pointer',
                            background: s.id === selected ? 'rgba(59,130,246,0.1)' : 'transparent',
                            border: s.id === selected ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                        }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary, #fff)' }}>
                                {s.field.toUpperCase()} — {s.product}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>
                                {s.type} · target: {s.target} · {s.hard ? '🔒 Hard' : '⚡ Soft'}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Editor */}
                {spec && (
                    <div>
                        <div style={{ ...card, marginBottom: 12 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                                <div>
                                    <label style={label}>Target</label>
                                    <input type="number" value={spec.target} onChange={e => updateSpec('target', Number(e.target.value))}
                                        style={input} step={0.1} />
                                </div>
                                <div>
                                    <label style={label}>Min</label>
                                    <input type="number" value={spec.min} onChange={e => updateSpec('min', Number(e.target.value))}
                                        style={input} step={0.1} />
                                </div>
                                <div>
                                    <label style={label}>Max</label>
                                    <input type="number" value={spec.max} onChange={e => updateSpec('max', Number(e.target.value))}
                                        style={input} step={0.1} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={label}>Curve Type</label>
                                    <select value={spec.type} onChange={e => updateSpec('type', e.target.value)} style={input}>
                                        {CURVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={label}>Penalty Rate (R/unit)</label>
                                    <input type="number" value={spec.rate} onChange={e => updateSpec('rate', Number(e.target.value))}
                                        style={input} step={1000} />
                                </div>
                                <div>
                                    <label style={label}>Constraint</label>
                                    <button onClick={() => updateSpec('hard', !spec.hard)} style={{
                                        width: '100%', padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                                        border: `1px solid ${spec.hard ? '#ef4444' : '#22c55e'}`,
                                        background: spec.hard ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                                        color: spec.hard ? '#ef4444' : '#22c55e', fontSize: 12, fontWeight: 600,
                                    }}>
                                        {spec.hard ? '🔒 Hard Constraint' : '⚡ Soft Penalty'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Curve preview */}
                        <div style={card}>
                            <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary, #aaa)', margin: '0 0 8px' }}>
                                Penalty Curve Preview — {spec.type}
                            </h4>
                            <svg viewBox="0 0 500 180" style={{ width: '100%', height: 180 }}>
                                {/* Grid */}
                                {[0, 0.25, 0.5, 0.75, 1].map(t => (
                                    <line key={t} x1={40} x2={480} y1={150 * (1 - t)} y2={150 * (1 - t)}
                                        stroke="var(--color-border, #333)" strokeDasharray="3" />
                                ))}
                                {/* Curve */}
                                <polyline
                                    points={curvePoints.map((p, i) => {
                                        const x = 40 + (i / 40) * 440;
                                        const y = 150 * (1 - p.penalty / maxPenalty);
                                        return `${x},${y}`;
                                    }).join(' ')}
                                    fill="none" stroke="#ef4444" strokeWidth={2}
                                />
                                {/* Target line */}
                                {(() => {
                                    const x = 40 + ((spec.target - spec.min) / (spec.max - spec.min)) * 440;
                                    return <line x1={x} x2={x} y1={0} y2={150} stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4" />;
                                })()}
                                {/* Axis labels */}
                                <text x={40} y={170} fontSize={9} fill="var(--color-text-secondary,#888)">{spec.min}</text>
                                <text x={480} y={170} fontSize={9} fill="var(--color-text-secondary,#888)" textAnchor="end">{spec.max}</text>
                                <text x={260} y={170} fontSize={9} fill="var(--color-text-secondary,#888)" textAnchor="middle">{spec.field}</text>
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const card = {
    background: 'var(--color-bg-secondary, #1e1e2e)',
    border: '1px solid var(--color-border, #333)',
    borderRadius: 10, padding: 16,
};
const label = { display: 'block', fontSize: 10, marginBottom: 3, color: 'var(--color-text-secondary, #888)' };
const input = {
    width: '100%', padding: '6px 10px', borderRadius: 6,
    border: '1px solid var(--color-border, #444)',
    background: 'var(--color-bg-tertiary, #2a2a3a)', color: 'var(--color-text-primary, #fff)', fontSize: 12,
};
