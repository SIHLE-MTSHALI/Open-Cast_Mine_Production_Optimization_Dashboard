/**
 * RateOverridePanel.jsx — Issue #81
 *
 * Variable production rate control:
 *  - Rate slider per resource (0-100% of max rate)
 *  - Optimizer delay visualization (distinct color in schedule)
 *  - Minimum rate factor enforcement
 *  - Rate reduction impact on tonnage targets
 *  - Interactive override by planner
 */

import React, { useState, useMemo } from 'react';
import {
    Sliders, TrendingDown, AlertTriangle, RotateCcw,
    Gauge, Lock, Unlock
} from 'lucide-react';

const DEMO_RESOURCES = [
    { id: 'EX-01', name: 'Excavator 01', type: 'excavator', maxRate: 850, currentRate: 100, minRate: 30, locked: false },
    { id: 'EX-02', name: 'Excavator 02', type: 'excavator', maxRate: 720, currentRate: 75, minRate: 30, locked: false },
    { id: 'EX-03', name: 'Excavator 03', type: 'excavator', maxRate: 650, currentRate: 100, minRate: 30, locked: false },
    { id: 'DZ-01', name: 'Dozer 01', type: 'dozer', maxRate: 400, currentRate: 100, minRate: 20, locked: false },
    { id: 'DZ-02', name: 'Dozer 02', type: 'dozer', maxRate: 380, currentRate: 50, minRate: 20, locked: true },
];


export default function RateOverridePanel({ siteId, onRatesChanged }) {
    const [resources, setResources] = useState(DEMO_RESOURCES);
    const [showDelays, setShowDelays] = useState(true);

    const updateRate = (id, rate) => {
        setResources(prev => prev.map(r =>
            r.id === id ? { ...r, currentRate: Math.max(r.minRate, Math.min(100, rate)) } : r
        ));
    };

    const toggleLock = (id) => {
        setResources(prev => prev.map(r =>
            r.id === id ? { ...r, locked: !r.locked } : r
        ));
    };

    const resetAll = () => setResources(prev => prev.map(r => ({ ...r, currentRate: 100, locked: false })));

    const totalCapacity = useMemo(() => {
        const max = resources.reduce((s, r) => s + r.maxRate, 0);
        const current = resources.reduce((s, r) => s + (r.maxRate * r.currentRate / 100), 0);
        return { max, current, pct: ((current / max) * 100).toFixed(0) };
    }, [resources]);

    const delayedResources = resources.filter(r => r.currentRate < 100);

    return (
        <div style={{ padding: 20, maxWidth: 700, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                    <Sliders size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Rate Override
                </h2>
                <button onClick={resetAll} style={btnSecondary}><RotateCcw size={14} /> Reset All</button>
            </div>

            {/* Summary card */}
            <div style={{ ...card, marginBottom: 16, display: 'flex', gap: 16 }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: totalCapacity.pct < 80 ? '#f59e0b' : '#22c55e' }}>
                        {totalCapacity.pct}%
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>Fleet Capacity</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary, #fff)' }}>
                        {totalCapacity.current.toFixed(0)}t/h
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>Current Rate (max {totalCapacity.max}t/h)</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: delayedResources.length > 0 ? '#f59e0b' : '#22c55e' }}>
                        {delayedResources.length}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>Delayed Resources</div>
                </div>
            </div>

            {/* Resource sliders */}
            {resources.map(r => {
                const effectiveRate = r.maxRate * r.currentRate / 100;
                const isDelayed = r.currentRate < 100;
                return (
                    <div key={r.id} style={{
                        ...card, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12,
                        borderColor: isDelayed ? 'rgba(245,158,11,0.3)' : undefined,
                    }}>
                        <button onClick={() => toggleLock(r.id)} style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                            color: r.locked ? '#ef4444' : 'var(--color-text-secondary, #666)'
                        }}>
                            {r.locked ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>

                        <div style={{ width: 120 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary, #fff)' }}>{r.name}</div>
                            <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>{r.type}</div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <input
                                type="range" min={r.minRate} max={100} value={r.currentRate}
                                onChange={e => !r.locked && updateRate(r.id, Number(e.target.value))}
                                disabled={r.locked}
                                style={{ width: '100%', accentColor: isDelayed ? '#f59e0b' : '#3b82f6' }}
                            />
                        </div>

                        <div style={{
                            width: 50, textAlign: 'right', fontSize: 14, fontWeight: 700,
                            color: isDelayed ? '#f59e0b' : 'var(--color-text-primary, #fff)'
                        }}>
                            {r.currentRate}%
                        </div>
                        <div style={{ width: 60, textAlign: 'right', fontSize: 11, color: 'var(--color-text-secondary, #888)' }}>
                            {effectiveRate.toFixed(0)}t/h
                        </div>

                        {isDelayed && (
                            <AlertTriangle size={14} color="#f59e0b" title="Rate reduced — optimizer delay" />
                        )}
                    </div>
                );
            })}

            <div style={{ fontSize: 11, color: 'var(--color-text-secondary, #888)', marginTop: 8 }}>
                🔒 Lock a resource to prevent optimizer from adjusting its rate · Min rate enforced per resource
            </div>
        </div>
    );
}

const card = {
    background: 'var(--color-bg-secondary, #1e1e2e)',
    border: '1px solid var(--color-border, #333)',
    borderRadius: 10, padding: 14,
};
const btnSecondary = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
    border: '1px solid var(--color-border, #444)', background: 'transparent',
    color: 'var(--color-text-secondary, #aaa)', fontSize: 13, cursor: 'pointer',
};
