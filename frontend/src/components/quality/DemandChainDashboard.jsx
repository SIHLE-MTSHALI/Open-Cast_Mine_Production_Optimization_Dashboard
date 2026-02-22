/**
 * DemandChainDashboard.jsx — Issue #85
 *
 * Demand chain and order fulfillment dashboard:
 *  - Product demand schedule (tonnes/quality per period)
 *  - Customer order tracking with due dates
 *  - Fulfillment scoring (met/unmet/partial)
 *  - Revenue calculation per product
 *  - Demand vs supply visualization
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    Package, TrendingUp, TrendingDown, DollarSign,
    Calendar, CheckCircle, XCircle, AlertTriangle, BarChart3
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api';

const API = API_BASE_URL;

const STATUS_CONFIG = {
    met: { color: '#22c55e', icon: CheckCircle, label: 'Met' },
    partial: { color: '#f59e0b', icon: AlertTriangle, label: 'Partial' },
    unmet: { color: '#ef4444', icon: XCircle, label: 'Unmet' },
};

const DEMO_ORDERS = [
    { id: 'ORD-001', customer: 'Eskom Holdings', product: 'Domestic Coal', tonnes: 150000, due: '2026-02-28', status: 'met', fulfilled: 148500, revenue: 37125000, penalty: 0 },
    { id: 'ORD-002', customer: 'Richards Bay Terminal', product: 'Export Coal', tonnes: 80000, due: '2026-03-15', status: 'partial', fulfilled: 62000, revenue: 24800000, penalty: 1800000 },
    { id: 'ORD-003', customer: 'RBCT Slot 4', product: 'Export Premium', tonnes: 50000, due: '2026-03-31', status: 'unmet', fulfilled: 12000, revenue: 6000000, penalty: 4750000 },
    { id: 'ORD-004', customer: 'Sasol Synfuels', product: 'Domestic A', tonnes: 120000, due: '2026-04-15', status: 'met', fulfilled: 120000, revenue: 28800000, penalty: 0 },
];

const DEMO_DEMAND_SCHEDULE = [
    { period: 'P1', product: 'Export Coal', target: 25000, actual: 24200, pct: 96.8 },
    { period: 'P2', product: 'Export Coal', target: 25000, actual: 18500, pct: 74.0 },
    { period: 'P3', product: 'Export Coal', target: 30000, actual: 19300, pct: 64.3 },
    { period: 'P1', product: 'Domestic Coal', target: 50000, actual: 49800, pct: 99.6 },
    { period: 'P2', product: 'Domestic Coal', target: 50000, actual: 50200, pct: 100.4 },
    { period: 'P3', product: 'Domestic Coal', target: 50000, actual: 48700, pct: 97.4 },
];


export default function DemandChainDashboard({ siteId }) {
    const [orders, setOrders] = useState(DEMO_ORDERS);
    const [schedule, setSchedule] = useState(DEMO_DEMAND_SCHEDULE);
    const [view, setView] = useState('orders');

    const summary = useMemo(() => {
        const totalRevenue = orders.reduce((s, o) => s + o.revenue, 0);
        const totalPenalty = orders.reduce((s, o) => s + o.penalty, 0);
        const met = orders.filter(o => o.status === 'met').length;
        const partial = orders.filter(o => o.status === 'partial').length;
        const unmet = orders.filter(o => o.status === 'unmet').length;
        return { totalRevenue, totalPenalty, met, partial, unmet };
    }, [orders]);

    return (
        <div style={{ padding: 20, maxWidth: 950, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                    <Package size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Demand Chain
                </h2>
            </div>

            {/* KPI cards */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <KPI label="Total Revenue" value={`R${(summary.totalRevenue / 1e6).toFixed(1)}M`} color="#22c55e" icon={DollarSign} />
                <KPI label="Penalties" value={`R${(summary.totalPenalty / 1e6).toFixed(1)}M`} color="#ef4444" icon={TrendingDown} />
                <KPI label="Met" value={summary.met} color="#22c55e" icon={CheckCircle} />
                <KPI label="Partial" value={summary.partial} color="#f59e0b" icon={AlertTriangle} />
                <KPI label="Unmet" value={summary.unmet} color="#ef4444" icon={XCircle} />
            </div>

            {/* View tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {[['orders', 'Orders'], ['schedule', 'Demand Schedule'], ['supply', 'Supply vs Demand']].map(([k, l]) => (
                    <button key={k} onClick={() => setView(k)} style={{
                        padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                        border: view === k ? '1px solid #3b82f6' : '1px solid var(--color-border, #444)',
                        background: view === k ? 'rgba(59,130,246,0.1)' : 'transparent',
                        color: view === k ? '#60a5fa' : 'var(--color-text-secondary, #aaa)',
                    }}>{l}</button>
                ))}
            </div>

            {/* Orders table */}
            {view === 'orders' && (
                <div style={card}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border, #333)' }}>
                                {['Order', 'Customer', 'Product', 'Target', 'Fulfilled', 'Due', 'Status', 'Revenue', 'Penalty'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '8px 6px', color: 'var(--color-text-secondary, #888)', fontWeight: 600, fontSize: 11 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(o => {
                                const cfg = STATUS_CONFIG[o.status];
                                const Icon = cfg.icon;
                                return (
                                    <tr key={o.id} style={{ borderBottom: '1px solid var(--color-border, #222)' }}>
                                        <td style={td}>{o.id}</td>
                                        <td style={td}>{o.customer}</td>
                                        <td style={td}>{o.product}</td>
                                        <td style={td}>{(o.tonnes / 1000).toFixed(0)}kt</td>
                                        <td style={td}>{(o.fulfilled / 1000).toFixed(0)}kt</td>
                                        <td style={td}>{o.due}</td>
                                        <td style={td}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: cfg.color }}>
                                                <Icon size={12} /> {cfg.label}
                                            </span>
                                        </td>
                                        <td style={{ ...td, color: '#22c55e' }}>R{(o.revenue / 1e6).toFixed(1)}M</td>
                                        <td style={{ ...td, color: o.penalty > 0 ? '#ef4444' : '#22c55e' }}>
                                            {o.penalty > 0 ? `R${(o.penalty / 1e6).toFixed(1)}M` : '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Demand schedule */}
            {view === 'schedule' && (
                <div style={card}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border, #333)' }}>
                                {['Period', 'Product', 'Target', 'Actual', 'Fulfillment'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '8px 6px', color: 'var(--color-text-secondary, #888)', fontWeight: 600, fontSize: 11 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {schedule.map((s, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--color-border, #222)' }}>
                                    <td style={td}>{s.period}</td>
                                    <td style={td}>{s.product}</td>
                                    <td style={td}>{(s.target / 1000).toFixed(0)}kt</td>
                                    <td style={td}>{(s.actual / 1000).toFixed(0)}kt</td>
                                    <td style={{ ...td }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--color-bg-tertiary, #2a2a3a)', overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%', width: `${Math.min(100, s.pct)}%`, borderRadius: 3,
                                                    background: s.pct >= 95 ? '#22c55e' : s.pct >= 80 ? '#f59e0b' : '#ef4444',
                                                }} />
                                            </div>
                                            <span style={{
                                                fontSize: 11, fontWeight: 600, width: 40,
                                                color: s.pct >= 95 ? '#22c55e' : s.pct >= 80 ? '#f59e0b' : '#ef4444',
                                            }}>{s.pct.toFixed(0)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Supply vs Demand bar chart */}
            {view === 'supply' && (
                <div style={card}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary, #fff)', margin: '0 0 16px' }}>
                        Supply vs Demand — Per Period
                    </h3>
                    {['P1', 'P2', 'P3'].map(period => {
                        const periodData = schedule.filter(s => s.period === period);
                        return (
                            <div key={period} style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary, #ddd)', marginBottom: 6 }}>{period}</div>
                                {periodData.map((d, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <div style={{ width: 100, fontSize: 11, color: 'var(--color-text-secondary, #aaa)' }}>{d.product.split(' ')[0]}</div>
                                        <div style={{ flex: 1, display: 'flex', gap: 2, height: 16 }}>
                                            <div style={{ width: `${(d.actual / d.target) * 100}%`, height: '100%', background: '#3b82f6', borderRadius: 3 }}
                                                title={`Actual: ${(d.actual / 1000).toFixed(0)}kt`} />
                                            <div style={{
                                                width: `${Math.max(0, ((d.target - d.actual) / d.target) * 100)}%`,
                                                height: '100%', background: 'rgba(239,68,68,0.3)', borderRadius: 3,
                                            }} title={`Gap: ${((d.target - d.actual) / 1000).toFixed(0)}kt`} />
                                        </div>
                                        <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)', width: 50 }}>
                                            {(d.target / 1000).toFixed(0)}kt
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                    <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--color-text-secondary, #888)', marginTop: 8 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <div style={{ width: 10, height: 6, background: '#3b82f6', borderRadius: 2 }} /> Supplied
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <div style={{ width: 10, height: 6, background: 'rgba(239,68,68,0.3)', borderRadius: 2 }} /> Gap
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

function KPI({ label, value, color, icon: Icon }) {
    return (
        <div style={{ ...card, flex: 1, textAlign: 'center' }}>
            <Icon size={16} color={color} style={{ marginBottom: 4 }} />
            <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>{label}</div>
        </div>
    );
}

const card = {
    background: 'var(--color-bg-secondary, #1e1e2e)',
    border: '1px solid var(--color-border, #333)',
    borderRadius: 10, padding: 14,
};
const td = { padding: '8px 6px', color: 'var(--color-text-primary, #ddd)' };
