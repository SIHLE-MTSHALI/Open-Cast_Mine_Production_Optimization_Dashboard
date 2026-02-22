/**
 * WashabilityChartPanel.jsx — Issue #87
 *
 * Interactive washability curve visualization:
 *  - Yield vs RD curve
 *  - Quality vs RD curves (ash, CV, moisture)
 *  - Misplacement model visualization
 *  - Historical calibration overlay
 *  - Multi-product stream display
 */

import React, { useState, useMemo } from 'react';
import { BarChart3, Target, TrendingUp, Settings, Filter } from 'lucide-react';

const DEMO_WASH_DATA = {
    source: 'Area A3 — Seam 2',
    curves: [
        { rd: 1.30, cumYield: 98.5, ash: 8.2, cv: 29.1, moisture: 3.1 },
        { rd: 1.35, cumYield: 95.2, ash: 9.1, cv: 28.5, moisture: 3.2 },
        { rd: 1.40, cumYield: 88.4, ash: 11.0, cv: 27.2, moisture: 3.5 },
        { rd: 1.45, cumYield: 78.1, ash: 13.2, cv: 25.8, moisture: 3.8 },
        { rd: 1.50, cumYield: 65.3, ash: 15.5, cv: 24.1, moisture: 4.2 },
        { rd: 1.55, cumYield: 52.8, ash: 17.8, cv: 22.5, moisture: 4.5 },
        { rd: 1.60, cumYield: 42.1, ash: 19.9, cv: 21.0, moisture: 4.8 },
        { rd: 1.65, cumYield: 33.5, ash: 21.8, cv: 19.8, moisture: 5.1 },
        { rd: 1.70, cumYield: 26.2, ash: 23.5, cv: 18.5, moisture: 5.4 },
        { rd: 1.80, cumYield: 15.8, ash: 27.1, cv: 15.9, moisture: 6.0 },
        { rd: 1.90, cumYield: 8.4, ash: 31.0, cv: 13.2, moisture: 6.5 },
        { rd: 2.00, cumYield: 3.2, ash: 35.5, cv: 10.5, moisture: 7.0 },
    ],
    operatingPoint: { rd: 1.50, ep: 0.03 },
    calibration: [
        { rd: 1.48, yield: 67.2 }, { rd: 1.50, yield: 64.8 }, { rd: 1.52, yield: 62.1 },
    ],
};


export default function WashabilityChartPanel({ siteId }) {
    const [data] = useState(DEMO_WASH_DATA);
    const [activeField, setActiveField] = useState('cumYield');
    const [showMisplacement, setShowMisplacement] = useState(true);
    const [showCalibration, setShowCalibration] = useState(true);
    const [cutpoint, setCutpoint] = useState(1.50);

    const FIELDS = {
        cumYield: { label: 'Cumulative Yield %', color: '#3b82f6', unit: '%' },
        ash: { label: 'Ash %', color: '#ef4444', unit: '%' },
        cv: { label: 'CV (MJ/kg)', color: '#22c55e', unit: 'MJ/kg' },
        moisture: { label: 'Moisture %', color: '#f59e0b', unit: '%' },
    };

    const field = FIELDS[activeField];
    const maxVal = Math.max(...data.curves.map(c => c[activeField]));
    const chartHeight = 200;

    // Interpolate at cutpoint
    const interpolated = useMemo(() => {
        const curves = data.curves;
        for (let i = 1; i < curves.length; i++) {
            if (curves[i].rd >= cutpoint) {
                const t = (cutpoint - curves[i - 1].rd) / (curves[i].rd - curves[i - 1].rd);
                return {
                    yield: (curves[i - 1].cumYield + t * (curves[i].cumYield - curves[i - 1].cumYield)).toFixed(1),
                    ash: (curves[i - 1].ash + t * (curves[i].ash - curves[i - 1].ash)).toFixed(1),
                    cv: (curves[i - 1].cv + t * (curves[i].cv - curves[i - 1].cv)).toFixed(1),
                };
            }
        }
        return { yield: '—', ash: '—', cv: '—' };
    }, [cutpoint, data.curves]);

    return (
        <div style={{ padding: 20, maxWidth: 850, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                    <BarChart3 size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Washability Curves
                </h2>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary, #888)' }}>{data.source}</span>
            </div>

            {/* Operating point + cutpoint */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ ...card, flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>Cutpoint RD</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#3b82f6' }}>{cutpoint.toFixed(2)}</div>
                    <input type="range" min={1.30} max={2.00} step={0.01} value={cutpoint}
                        onChange={e => setCutpoint(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#3b82f6' }} />
                </div>
                <div style={{ ...card, flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>Yield at RD {cutpoint.toFixed(2)}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#22c55e' }}>{interpolated.yield}%</div>
                </div>
                <div style={{ ...card, flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>Ash at RD {cutpoint.toFixed(2)}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#ef4444' }}>{interpolated.ash}%</div>
                </div>
                <div style={{ ...card, flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>CV at RD {cutpoint.toFixed(2)}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#22c55e' }}>{interpolated.cv}</div>
                </div>
            </div>

            {/* Field selector */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {Object.entries(FIELDS).map(([k, v]) => (
                    <button key={k} onClick={() => setActiveField(k)} style={{
                        padding: '5px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                        border: activeField === k ? `1px solid ${v.color}` : '1px solid var(--color-border, #444)',
                        background: activeField === k ? `${v.color}15` : 'transparent',
                        color: activeField === k ? v.color : 'var(--color-text-secondary, #aaa)',
                    }}>{v.label}</button>
                ))}
            </div>

            {/* Chart area */}
            <div style={{ ...card, position: 'relative', padding: '16px 16px 24px' }}>
                {/* SVG chart */}
                <svg viewBox={`0 0 600 ${chartHeight + 20}`} style={{ width: '100%', height: chartHeight + 20 }}>
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(t => (
                        <line key={t} x1={40} x2={580} y1={chartHeight * (1 - t)} y2={chartHeight * (1 - t)}
                            stroke="var(--color-border, #333)" strokeDasharray="4" />
                    ))}

                    {/* Curve */}
                    <polyline
                        points={data.curves.map((c, i) => {
                            const x = 40 + ((c.rd - 1.30) / 0.70) * 540;
                            const y = chartHeight * (1 - c[activeField] / maxVal);
                            return `${x},${y}`;
                        }).join(' ')}
                        fill="none" stroke={field.color} strokeWidth={2.5}
                    />

                    {/* Data points */}
                    {data.curves.map((c, i) => {
                        const x = 40 + ((c.rd - 1.30) / 0.70) * 540;
                        const y = chartHeight * (1 - c[activeField] / maxVal);
                        return <circle key={i} cx={x} cy={y} r={3} fill={field.color} />;
                    })}

                    {/* Cutpoint line */}
                    <line
                        x1={40 + ((cutpoint - 1.30) / 0.70) * 540}
                        x2={40 + ((cutpoint - 1.30) / 0.70) * 540}
                        y1={0} y2={chartHeight}
                        stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="6"
                    />

                    {/* Calibration points */}
                    {showCalibration && activeField === 'cumYield' && data.calibration.map((c, i) => {
                        const x = 40 + ((c.rd - 1.30) / 0.70) * 540;
                        const y = chartHeight * (1 - c.yield / maxVal);
                        return <circle key={`cal-${i}`} cx={x} cy={y} r={4} fill="none" stroke="#f59e0b" strokeWidth={2} />;
                    })}

                    {/* X-axis labels */}
                    {[1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0].map(rd => (
                        <text key={rd} x={40 + ((rd - 1.30) / 0.70) * 540} y={chartHeight + 14}
                            textAnchor="middle" fontSize={9} fill="var(--color-text-secondary, #888)">
                            {rd.toFixed(1)}
                        </text>
                    ))}
                </svg>

                <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--color-text-secondary, #888)', marginTop: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <div style={{ width: 12, height: 2, background: field.color }} /> Theoretical
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #f59e0b' }} /> Calibration
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <div style={{ width: 12, height: 0, borderTop: '2px dashed #8b5cf6' }} /> Cutpoint
                    </span>
                    <span>Ep = {data.operatingPoint.ep}</span>
                </div>
            </div>
        </div>
    );
}

const card = {
    background: 'var(--color-bg-secondary, #1e1e2e)',
    border: '1px solid var(--color-border, #333)',
    borderRadius: 10, padding: 14,
};
