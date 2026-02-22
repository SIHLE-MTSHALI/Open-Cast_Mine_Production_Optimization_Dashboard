/**
 * HaulageRouteEditor.jsx — Issue #103
 *
 * Haulage route management and comparison:
 *  - Route definition with segments (distance, grade, surface)
 *  - Cycle time and fleet size calculations
 *  - Cost per tonne display
 *  - Multi-route comparison table
 *  - Route profile visualization
 */

import React, { useState, useMemo } from 'react';
import {
    Truck, Route, Plus, Trash2, BarChart3,
    DollarSign, Clock, Settings
} from 'lucide-react';

const SURFACE_TYPES = ['gravel', 'paved', 'dirt', 'bitumen'];

const DEMO_ROUTES = [
    {
        id: 'RT-01', name: 'Pit A → Stockpile 1', distance: 2.8, avgGrade: 8, surface: 'gravel',
        segments: [
            { from: 'Pit A Face', to: 'Ramp Base', distance: 0.5, grade: 12, surface: 'dirt' },
            { from: 'Ramp Base', to: 'Ramp Top', distance: 0.8, grade: 10, surface: 'gravel' },
            { from: 'Ramp Top', to: 'SP-01', distance: 1.5, grade: 2, surface: 'gravel' },
        ],
        cycleTime: 18.5, fleetSize: 4, costPerTonne: 12.40, throughput: 850
    },
    {
        id: 'RT-02', name: 'Pit A → Dump West', distance: 3.5, avgGrade: 6, surface: 'gravel',
        segments: [
            { from: 'Pit A Face', to: 'Ramp Base', distance: 0.5, grade: 12, surface: 'dirt' },
            { from: 'Ramp Base', to: 'Haul Road', distance: 1.2, grade: 8, surface: 'gravel' },
            { from: 'Haul Road', to: 'Dump West', distance: 1.8, grade: 3, surface: 'gravel' },
        ],
        cycleTime: 22.3, fleetSize: 5, costPerTonne: 15.80, throughput: 720
    },
    {
        id: 'RT-03', name: 'Pit B → ROM Pad', distance: 1.5, avgGrade: 5, surface: 'paved',
        segments: [
            { from: 'Pit B Face', to: 'Ramp', distance: 0.6, grade: 10, surface: 'gravel' },
            { from: 'Ramp', to: 'ROM Pad', distance: 0.9, grade: 2, surface: 'paved' },
        ],
        cycleTime: 12.1, fleetSize: 3, costPerTonne: 8.50, throughput: 980
    },
];


export default function HaulageRouteEditor({ siteId }) {
    const [routes, setRoutes] = useState(DEMO_ROUTES);
    const [selectedRoute, setSelectedRoute] = useState(null);

    const sel = routes.find(r => r.id === selectedRoute);

    const totalFleet = useMemo(() => routes.reduce((s, r) => s + r.fleetSize, 0), [routes]);
    const avgCost = useMemo(() => {
        const total = routes.reduce((s, r) => s + r.costPerTonne, 0);
        return (total / routes.length).toFixed(2);
    }, [routes]);

    return (
        <div style={{ padding: 20, maxWidth: 950, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                    <Truck size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Haulage Routes
                </h2>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary, #888)' }}>
                    Total Fleet: {totalFleet} trucks · Avg Cost: R{avgCost}/t
                </div>
            </div>

            {/* Route comparison table */}
            <div style={{ ...card, marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border, #333)' }}>
                            {['Route', 'Distance', 'Grade', 'Surface', 'Cycle (min)', 'Fleet', 'Cost/t', 'Throughput'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '8px 6px', color: 'var(--color-text-secondary, #888)', fontWeight: 600, fontSize: 11 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {routes.map(r => (
                            <tr key={r.id} onClick={() => setSelectedRoute(r.id)} style={{
                                borderBottom: '1px solid var(--color-border, #222)', cursor: 'pointer',
                                background: r.id === selectedRoute ? 'rgba(59,130,246,0.05)' : 'transparent',
                            }}>
                                <td style={{ ...td, fontWeight: 600 }}>{r.name}</td>
                                <td style={td}>{r.distance.toFixed(1)} km</td>
                                <td style={td}>{r.avgGrade}%</td>
                                <td style={td}>{r.surface}</td>
                                <td style={td}>{r.cycleTime.toFixed(1)}</td>
                                <td style={td}>{r.fleetSize}</td>
                                <td style={{ ...td, color: r.costPerTonne > 14 ? '#f59e0b' : '#22c55e', fontWeight: 600 }}>
                                    R{r.costPerTonne.toFixed(2)}
                                </td>
                                <td style={td}>{r.throughput} t/h</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Route detail */}
            {sel && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* Segments */}
                    <div style={card}>
                        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary, #fff)', margin: '0 0 12px' }}>
                            Route Segments — {sel.name}
                        </h3>
                        {sel.segments.map((seg, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                                borderRadius: 6, marginBottom: 4,
                                background: 'var(--color-bg-tertiary, #2a2a3a)',
                            }}>
                                <Route size={12} color="var(--color-text-secondary, #888)" />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-primary, #ddd)' }}>
                                        {seg.from} → {seg.to}
                                    </div>
                                    <div style={{ fontSize: 9, color: 'var(--color-text-secondary, #888)' }}>
                                        {seg.distance.toFixed(1)}km · {seg.grade}% grade · {seg.surface}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Route profile SVG */}
                    <div style={card}>
                        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary, #fff)', margin: '0 0 12px' }}>
                            Route Profile
                        </h3>
                        <svg viewBox="0 0 300 120" style={{ width: '100%', height: 120 }}>
                            {/* Profile line */}
                            {(() => {
                                let x = 20, y = 100;
                                const points = [`${x},${y}`];
                                sel.segments.forEach(seg => {
                                    x += (seg.distance / sel.distance) * 260;
                                    y -= seg.grade * 3;
                                    points.push(`${x},${y}`);
                                });
                                return (
                                    <>
                                        <polyline points={points.join(' ')} fill="none" stroke="#3b82f6" strokeWidth={2} />
                                        {points.map((p, i) => {
                                            const [px, py] = p.split(',').map(Number);
                                            return <circle key={i} cx={px} cy={py} r={3} fill="#3b82f6" />;
                                        })}
                                    </>
                                );
                            })()}
                            {/* Labels */}
                            {sel.segments.map((seg, i) => {
                                const x2 = 20 + ((i + 0.5) / sel.segments.length) * 260;
                                return (
                                    <text key={i} x={x2} y={115} fontSize={7} fill="var(--color-text-secondary, #888)" textAnchor="middle">
                                        {seg.grade}%
                                    </text>
                                );
                            })}
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}

const card = { background: 'var(--color-bg-secondary, #1e1e2e)', border: '1px solid var(--color-border, #333)', borderRadius: 10, padding: 16 };
const td = { padding: '8px 6px', color: 'var(--color-text-primary, #ddd)' };
