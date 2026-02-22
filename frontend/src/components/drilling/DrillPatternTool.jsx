/**
 * DrillPatternTool.jsx — Issue #104
 *
 * Drill and blast pattern planning:
 *  - Pattern layout on plan view (burden x spacing grid)
 *  - Hole depth, diameter, charge configuration
 *  - Blast-to-mine precedence link
 *  - Pattern library with templates
 *  - Cost estimation per blast
 */

import React, { useState, useMemo } from 'react';
import {
    Target, Grid3x3, Plus, Settings, Layers,
    DollarSign, BarChart3, Play
} from 'lucide-react';

const DEMO_PATTERNS = [
    {
        id: 'BP-001', name: 'Standard Production', burden: 3.5, spacing: 4.0, rows: 5, holesPerRow: 8,
        holeDepth: 12, holeDiameter: 165, chargePerHole: 85, deckCharge: 15,
        area: 'Area A3 Bench 5', linkedBlock: 'BLK-A3-05', status: 'planned',
        totalHoles: 40, totalExplosive: 4000, costPerM3: 2.85, volume: 8400
    },
    {
        id: 'BP-002', name: 'Trim Blast West', burden: 2.5, spacing: 3.0, rows: 3, holesPerRow: 12,
        holeDepth: 10, holeDiameter: 127, chargePerHole: 55, deckCharge: 10,
        area: 'West Highwall Trim', linkedBlock: 'BLK-WH-03', status: 'drilled',
        totalHoles: 36, totalExplosive: 2340, costPerM3: 3.20, volume: 2700
    },
    {
        id: 'BP-003', name: 'Overburden Blast', burden: 4.0, spacing: 4.5, rows: 6, holesPerRow: 10,
        holeDepth: 15, holeDiameter: 200, chargePerHole: 120, deckCharge: 20,
        area: 'Area B1 OB Strip', linkedBlock: 'BLK-B1-OB', status: 'fired',
        totalHoles: 60, totalExplosive: 8400, costPerM3: 2.45, volume: 16200
    },
];

const STATUS_COLORS = {
    planned: '#3b82f6', drilled: '#f59e0b', charged: '#8b5cf6',
    fired: '#22c55e', mucked: '#6b7280',
};


export default function DrillPatternTool({ siteId }) {
    const [patterns, setPatterns] = useState(DEMO_PATTERNS);
    const [selectedPattern, setSelectedPattern] = useState(null);

    const sel = patterns.find(p => p.id === selectedPattern);

    return (
        <div style={{ padding: 20, maxWidth: 950, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                    <Target size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Drill & Blast Patterns
                </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
                {/* Pattern list */}
                <div style={card}>
                    <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary, #aaa)', margin: '0 0 8px' }}>Blast Patterns</h3>
                    {patterns.map(p => (
                        <div key={p.id} onClick={() => setSelectedPattern(p.id)} style={{
                            padding: '8px 10px', borderRadius: 6, marginBottom: 4, cursor: 'pointer',
                            background: p.id === selectedPattern ? 'rgba(59,130,246,0.1)' : 'transparent',
                            border: p.id === selectedPattern ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary, #fff)' }}>{p.name}</span>
                                <span style={{
                                    fontSize: 9, padding: '2px 6px', borderRadius: 8,
                                    background: `${STATUS_COLORS[p.status]}20`, color: STATUS_COLORS[p.status],
                                    fontWeight: 600,
                                }}>{p.status}</span>
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>
                                {p.area} · {p.totalHoles} holes · {(p.volume / 1000).toFixed(1)}k m³
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pattern detail */}
                {sel ? (
                    <div>
                        {/* KPI row */}
                        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                            <MiniCard label="Total Holes" value={sel.totalHoles} />
                            <MiniCard label="Volume" value={`${(sel.volume / 1000).toFixed(1)}k m³`} />
                            <MiniCard label="Explosive" value={`${(sel.totalExplosive / 1000).toFixed(1)}t`} />
                            <MiniCard label="Cost/m³" value={`R${sel.costPerM3.toFixed(2)}`}
                                color={sel.costPerM3 > 3 ? '#f59e0b' : '#22c55e'} />
                        </div>

                        {/* Pattern grid visualization */}
                        <div style={{ ...card, marginBottom: 12 }}>
                            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary, #fff)', margin: '0 0 12px' }}>
                                Pattern Layout — {sel.burden}m × {sel.spacing}m
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${sel.holesPerRow}, 1fr)`,
                                gap: 4, padding: 10,
                                background: 'var(--color-bg-tertiary, #2a2a3a)',
                                borderRadius: 8,
                            }}>
                                {Array.from({ length: sel.totalHoles }).map((_, i) => (
                                    <div key={i} style={{
                                        width: '100%', aspectRatio: '1', borderRadius: '50%',
                                        background: sel.status === 'fired' ? '#22c55e' : sel.status === 'drilled' ? '#f59e0b' : '#3b82f6',
                                        opacity: 0.7 + Math.random() * 0.3,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 7, color: '#fff', fontWeight: 600,
                                    }} title={`Hole ${i + 1}`}>
                                        {i + 1}
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-text-secondary, #888)', marginTop: 6 }}>
                                <span>← {sel.spacing}m spacing →</span>
                                <span>↕ {sel.burden}m burden</span>
                            </div>
                        </div>

                        {/* Hole specs */}
                        <div style={card}>
                            <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary, #aaa)', margin: '0 0 8px' }}>Hole Specification</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                                <InfoBox label="Depth" value={`${sel.holeDepth}m`} />
                                <InfoBox label="Diameter" value={`${sel.holeDiameter}mm`} />
                                <InfoBox label="Main Charge" value={`${sel.chargePerHole}kg`} />
                                <InfoBox label="Deck Charge" value={`${sel.deckCharge}kg`} />
                            </div>
                            {sel.linkedBlock && (
                                <div style={{ marginTop: 10, fontSize: 11, color: 'var(--color-text-secondary, #aaa)' }}>
                                    🔗 Linked to mining block: <strong style={{ color: '#3b82f6' }}>{sel.linkedBlock}</strong>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ ...card, textAlign: 'center', padding: 60, color: 'var(--color-text-secondary, #666)' }}>
                        <Grid3x3 size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
                        <div>Select a blast pattern to view details</div>
                    </div>
                )}
            </div>
        </div>
    );
}

function MiniCard({ label, value, color }) {
    return (
        <div style={{ ...cardStyle, flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: color || 'var(--color-text-primary, #fff)' }}>{value}</div>
            <div style={{ fontSize: 9, color: 'var(--color-text-secondary, #888)' }}>{label}</div>
        </div>
    );
}

function InfoBox({ label, value }) {
    return (
        <div style={{ background: 'var(--color-bg-tertiary, #2a2a3a)', borderRadius: 6, padding: '6px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'var(--color-text-secondary, #888)' }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary, #fff)' }}>{value}</div>
        </div>
    );
}

const card = { background: 'var(--color-bg-secondary, #1e1e2e)', border: '1px solid var(--color-border, #333)', borderRadius: 10, padding: 16 };
const cardStyle = { background: 'var(--color-bg-secondary, #1e1e2e)', border: '1px solid var(--color-border, #333)', borderRadius: 10, padding: 12 };
