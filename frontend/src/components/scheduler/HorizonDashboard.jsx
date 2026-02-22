/**
 * HorizonDashboard.jsx — Issue #79
 *
 * Multi-horizon planning alignment dashboard:
 *  - Horizon hierarchy (annual → quarterly → monthly → weekly → shift)
 *  - Target cascade visualization
 *  - Variance between horizons
 *  - Rolling horizon mode indicator
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Layers, Target, TrendingUp, TrendingDown, Calendar,
    ChevronRight, Plus, Settings, BarChart3
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api';

const API = API_BASE_URL;

const GRANULARITIES = ['shift', 'day', 'week', 'month', 'quarter', 'year'];
const GRAN_COLORS = {
    shift: '#ef4444', day: '#f59e0b', week: '#22c55e',
    month: '#3b82f6', quarter: '#8b5cf6', year: '#ec4899',
};

const DEMO_HORIZONS = [
    {
        id: 'h1', name: 'Annual Plan 2026', granularity: 'year', start: '2026-01-01', end: '2026-12-31',
        targets: { tonnes: 12000000, ash: 14.5, cv: 24.5, stripping: 3.2 },
        actual: { tonnes: 1850000, ash: 14.8, cv: 24.1, stripping: 3.4 }, children: ['h2']
    },
    {
        id: 'h2', name: 'Q1 2026', granularity: 'quarter', start: '2026-01-01', end: '2026-03-31', parentId: 'h1',
        targets: { tonnes: 3000000, ash: 14.5, cv: 24.5, stripping: 3.2 },
        actual: { tonnes: 1850000, ash: 14.8, cv: 24.1, stripping: 3.4 }, children: ['h3', 'h4', 'h5']
    },
    {
        id: 'h3', name: 'Jan 2026', granularity: 'month', start: '2026-01-01', end: '2026-01-31', parentId: 'h2',
        targets: { tonnes: 1000000, ash: 14.2, cv: 25.0, stripping: 3.0 },
        actual: { tonnes: 980000, ash: 14.5, cv: 24.8, stripping: 3.1 }, children: []
    },
    {
        id: 'h4', name: 'Feb 2026', granularity: 'month', start: '2026-02-01', end: '2026-02-28', parentId: 'h2',
        targets: { tonnes: 1000000, ash: 14.5, cv: 24.5, stripping: 3.2 },
        actual: { tonnes: 870000, ash: 15.1, cv: 23.8, stripping: 3.5 }, children: []
    },
    {
        id: 'h5', name: 'Mar 2026', granularity: 'month', start: '2026-03-01', end: '2026-03-31', parentId: 'h2',
        targets: { tonnes: 1000000, ash: 14.8, cv: 24.0, stripping: 3.4 },
        actual: null, children: []
    },
];


export default function HorizonDashboard({ siteId }) {
    const [horizons, setHorizons] = useState(DEMO_HORIZONS);
    const [selectedHorizon, setSelectedHorizon] = useState(null);
    const [expandedNodes, setExpandedNodes] = useState(new Set(['h1', 'h2']));

    useEffect(() => {
        if (!siteId) return;
        axios.get(`${API}/planning-horizons/site/${siteId}`)
            .then(r => { if (r.data?.length) setHorizons(r.data); })
            .catch(() => { });
    }, [siteId]);

    const rootHorizons = useMemo(() => horizons.filter(h => !h.parentId), [horizons]);

    const toggleExpand = (id) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const variance = (target, actual) => {
        if (!actual) return null;
        return ((actual - target) / target * 100).toFixed(1);
    };

    const renderHorizon = (h, depth = 0) => {
        const children = horizons.filter(c => c.parentId === h.id);
        const isExpanded = expandedNodes.has(h.id);
        const isSelected = selectedHorizon === h.id;
        const tonVar = variance(h.targets.tonnes, h.actual?.tonnes);

        return (
            <React.Fragment key={h.id}>
                <div
                    onClick={() => setSelectedHorizon(h.id)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 12px', paddingLeft: 12 + depth * 24,
                        borderRadius: 8, marginBottom: 4, cursor: 'pointer',
                        background: isSelected ? 'rgba(59,130,246,0.1)' : 'transparent',
                        border: isSelected ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                    }}
                >
                    {children.length > 0 ? (
                        <button onClick={(e) => { e.stopPropagation(); toggleExpand(h.id); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary, #888)', cursor: 'pointer', padding: 0 }}>
                            <ChevronRight size={14} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                        </button>
                    ) : <div style={{ width: 14 }} />}

                    <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: GRAN_COLORS[h.granularity] || '#666',
                    }} />

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary, #fff)' }}>{h.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>{h.granularity} · {h.start} → {h.end}</div>
                    </div>

                    {h.actual && (
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary, #fff)' }}>
                                {(h.actual.tonnes / 1000).toFixed(0)}kt / {(h.targets.tonnes / 1000).toFixed(0)}kt
                            </div>
                            <div style={{
                                fontSize: 10, fontWeight: 600,
                                color: tonVar >= 0 ? '#22c55e' : '#ef4444',
                            }}>
                                {tonVar >= 0 ? <TrendingUp size={10} style={{ verticalAlign: 'middle' }} /> : <TrendingDown size={10} style={{ verticalAlign: 'middle' }} />}
                                {' '}{tonVar}%
                            </div>
                        </div>
                    )}
                    {!h.actual && (
                        <span style={{ fontSize: 10, color: 'var(--color-text-secondary, #666)', fontStyle: 'italic' }}>Planned</span>
                    )}
                </div>
                {isExpanded && children.map(c => renderHorizon(c, depth + 1))}
            </React.Fragment>
        );
    };

    const sel = horizons.find(h => h.id === selectedHorizon);

    return (
        <div style={{ padding: 20, maxWidth: 950, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                    <Layers size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Planning Horizons
                </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Left: hierarchy */}
                <div style={{ ...card }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary, #fff)', marginBottom: 12, margin: 0 }}>Hierarchy</h3>
                    {rootHorizons.map(h => renderHorizon(h))}
                </div>

                {/* Right: detail / KPIs */}
                <div>
                    {sel ? (
                        <>
                            <div style={{ ...card, marginBottom: 12 }}>
                                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary, #fff)', margin: '0 0 12px' }}>{sel.name}</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    <KPICard label="Tonnes" target={`${(sel.targets.tonnes / 1000).toFixed(0)}kt`} actual={sel.actual ? `${(sel.actual.tonnes / 1000).toFixed(0)}kt` : '—'} variance={variance(sel.targets.tonnes, sel.actual?.tonnes)} />
                                    <KPICard label="Ash %" target={sel.targets.ash} actual={sel.actual?.ash ?? '—'} variance={variance(sel.targets.ash, sel.actual?.ash)} invert />
                                    <KPICard label="CV (MJ/kg)" target={sel.targets.cv} actual={sel.actual?.cv ?? '—'} variance={variance(sel.targets.cv, sel.actual?.cv)} />
                                    <KPICard label="Strip Ratio" target={sel.targets.stripping} actual={sel.actual?.stripping ?? '—'} variance={variance(sel.targets.stripping, sel.actual?.stripping)} invert />
                                </div>
                            </div>

                            {/* Cascade bar */}
                            <div style={card}>
                                <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary, #aaa)', margin: '0 0 8px' }}>Target Cascade</h4>
                                <CascadeBar horizon={sel} horizons={horizons} />
                            </div>
                        </>
                    ) : (
                        <div style={{ ...card, textAlign: 'center', padding: 40, color: 'var(--color-text-secondary, #666)' }}>
                            <Layers size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                            <div>Select a horizon to view details</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function KPICard({ label, target, actual, variance: v, invert }) {
    const good = invert ? v !== null && parseFloat(v) <= 0 : v !== null && parseFloat(v) >= 0;
    return (
        <div style={{
            background: 'var(--color-bg-tertiary, #2a2a3a)', borderRadius: 8, padding: 10, textAlign: 'center',
        }}>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary, #fff)' }}>{actual}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>Target: {target}</div>
            {v !== null && (
                <div style={{ fontSize: 11, fontWeight: 600, color: good ? '#22c55e' : '#ef4444', marginTop: 2 }}>
                    {v > 0 ? '+' : ''}{v}%
                </div>
            )}
        </div>
    );
}

function CascadeBar({ horizon, horizons }) {
    const children = horizons.filter(c => c.parentId === horizon.id);
    if (!children.length) return <div style={{ fontSize: 11, color: 'var(--color-text-secondary, #888)' }}>No child periods</div>;
    const totalTarget = children.reduce((s, c) => s + c.targets.tonnes, 0);
    return (
        <div style={{ display: 'flex', gap: 2, height: 20, borderRadius: 4, overflow: 'hidden' }}>
            {children.map(c => (
                <div key={c.id} title={`${c.name}: ${(c.targets.tonnes / 1000).toFixed(0)}kt`} style={{
                    flex: c.targets.tonnes / totalTarget,
                    background: c.actual ? (c.actual.tonnes >= c.targets.tonnes ? '#22c55e' : '#f59e0b') : GRAN_COLORS[c.granularity],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, color: '#fff', fontWeight: 600,
                }}>
                    {c.name.split(' ')[0]}
                </div>
            ))}
        </div>
    );
}

const card = {
    background: 'var(--color-bg-secondary, #1e1e2e)',
    border: '1px solid var(--color-border, #333)',
    borderRadius: 10, padding: 16,
};
