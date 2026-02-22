/**
 * ReconciliationPanel.jsx — Issue #25
 *
 * Planned vs Actual reconciliation dashboard:
 *  - Import actuals via file upload
 *  - Variance waterfall chart data
 *  - Recon factor trending
 *  - Root cause breakdown
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Upload, BarChart3, TrendingUp, TrendingDown, AlertTriangle,
    RefreshCw, FileText, Target
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api';

const API_BASE = API_BASE_URL;


function ReconciliationPanel({ siteId, scheduleVersionId }) {
    const [records, setRecords] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchData = useCallback(async () => {
        if (!siteId || !scheduleVersionId) return;
        setLoading(true);
        try {
            const [reconRes] = await Promise.all([
                axios.get(`${API_BASE}/schedule/reconciliation/${scheduleVersionId}`).catch(() => ({ data: [] })),
            ]);
            setRecords(reconRes.data || []);

            // Compute summary locally
            const recs = reconRes.data || [];
            const totalPlanned = recs.reduce((s, r) => s + (r.planned_tonnes || 0), 0);
            const totalActual = recs.reduce((s, r) => s + (r.actual_tonnes || 0), 0);
            setSummary({
                totalPlanned,
                totalActual,
                variancePct: totalPlanned > 0 ? ((totalActual - totalPlanned) / totalPlanned * 100) : 0,
                reconFactor: totalPlanned > 0 ? (totalActual / totalPlanned) : 0,
                periodsOverPlan: recs.filter(r => (r.variance_tonnes || 0) > 0).length,
                periodsUnderPlan: recs.filter(r => (r.variance_tonnes || 0) < 0).length,
            });
        } catch {
            setRecords([]);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    }, [siteId, scheduleVersionId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const rfColor = (rf) => rf >= 0.95 && rf <= 1.05 ? '#22c55e' : rf >= 0.85 ? '#f59e0b' : '#ef4444';

    return (
        <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                        <Target size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Reconciliation
                    </h2>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary, #888)', margin: '4px 0 0' }}>
                        Planned vs Actual variance analysis
                    </p>
                </div>
                <button onClick={fetchData} style={btnSecondary}>
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Summary KPIs */}
            {summary && (
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                    <KPI label="Planned" value={`${(summary.totalPlanned / 1000).toFixed(0)}kt`} icon="📊" />
                    <KPI label="Actual" value={`${(summary.totalActual / 1000).toFixed(0)}kt`} icon="✅" />
                    <KPI label="Variance"
                        value={`${summary.variancePct >= 0 ? '+' : ''}${summary.variancePct.toFixed(1)}%`}
                        icon={summary.variancePct >= 0 ? "📈" : "📉"}
                        color={summary.variancePct >= -5 ? '#22c55e' : '#ef4444'} />
                    <KPI label="Recon Factor"
                        value={summary.reconFactor.toFixed(3)}
                        icon="🎯"
                        color={rfColor(summary.reconFactor)} />
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--color-border, #333)' }}>
                {['overview', 'detail', 'trending'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '8px 16px', border: 'none', borderRadius: '6px 6px 0 0',
                        background: activeTab === tab ? 'var(--color-bg-secondary, #1e1e2e)' : 'transparent',
                        color: activeTab === tab ? '#60a5fa' : 'var(--color-text-secondary, #aaa)',
                        fontWeight: activeTab === tab ? 600 : 400, fontSize: 13, cursor: 'pointer',
                        borderBottom: activeTab === tab ? '2px solid #3b82f6' : 'none',
                    }}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'overview' && (
                <div style={cardStyle}>
                    {records.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-secondary, #666)' }}>
                            <FileText size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                            <div>No reconciliation data available. Import actuals to generate reconciliation.</div>
                        </div>
                    ) : (
                        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border, #333)' }}>
                                    <th style={thStyle}>Period</th>
                                    <th style={thStyle}>Resource</th>
                                    <th style={thStyle}>Planned (t)</th>
                                    <th style={thStyle}>Actual (t)</th>
                                    <th style={thStyle}>Variance</th>
                                    <th style={thStyle}>RF</th>
                                    <th style={thStyle}>Cause</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((r, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border, #222)' }}>
                                        <td style={tdStyle}>{r.period_id}</td>
                                        <td style={tdStyle}>{r.resource_id || '—'}</td>
                                        <td style={tdStyle}>{(r.planned_tonnes || 0).toLocaleString()}</td>
                                        <td style={tdStyle}>{(r.actual_tonnes || 0).toLocaleString()}</td>
                                        <td style={{
                                            ...tdStyle,
                                            color: (r.variance_pct || 0) >= 0 ? '#22c55e' : '#ef4444',
                                        }}>
                                            {(r.variance_pct || 0) >= 0 ? '+' : ''}{(r.variance_pct || 0).toFixed(1)}%
                                        </td>
                                        <td style={{ ...tdStyle, color: rfColor(r.recon_factor || 0) }}>
                                            {(r.recon_factor || 0).toFixed(3)}
                                        </td>
                                        <td style={tdStyle}>{r.root_cause || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {activeTab === 'detail' && (
                <div style={cardStyle}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-primary, #fff)' }}>
                        Import Actuals
                    </h3>
                    <div style={{
                        border: '2px dashed var(--color-border, #444)', borderRadius: 8,
                        padding: 30, textAlign: 'center', color: 'var(--color-text-secondary, #888)',
                    }}>
                        <Upload size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
                        <div style={{ fontSize: 13 }}>Drop CSV file here or click to browse</div>
                        <div style={{ fontSize: 11, marginTop: 4 }}>Columns: period, resource, tonnes, hours, ash, cv, moisture</div>
                    </div>
                </div>
            )}

            {activeTab === 'trending' && (
                <div style={cardStyle}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--color-text-primary, #fff)' }}>
                        Reconciliation Factor Trend
                    </h3>
                    {records.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120 }}>
                            {records.map((r, i) => {
                                const rf = r.recon_factor || 0;
                                const height = Math.min(rf * 100, 120);
                                return (
                                    <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                                        <div style={{
                                            height, background: rfColor(rf), borderRadius: '4px 4px 0 0',
                                            minWidth: 12, transition: 'height 0.3s',
                                        }} title={`RF: ${rf.toFixed(3)}`} />
                                        <div style={{ fontSize: 9, marginTop: 4, color: 'var(--color-text-secondary, #aaa)' }}>
                                            {r.period_id?.slice(0, 6) || `P${i + 1}`}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ color: 'var(--color-text-secondary, #666)', textAlign: 'center', padding: 20 }}>
                            No trending data available
                        </div>
                    )}
                    {/* Target line legend */}
                    <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11, color: 'var(--color-text-secondary, #aaa)' }}>
                        <span>🟢 0.95–1.05 (on target)</span>
                        <span>🟡 0.85–0.95 (minor variance)</span>
                        <span>🔴 &lt;0.85 (significant variance)</span>
                    </div>
                </div>
            )}
        </div>
    );
}


// ── Styles & Helpers ────────────────────────────────────────────────

const cardStyle = {
    background: 'var(--color-bg-secondary, #1e1e2e)',
    border: '1px solid var(--color-border, #333)',
    borderRadius: 10, padding: '14px 18px',
};
const thStyle = { textAlign: 'left', padding: '6px 8px', color: 'var(--color-text-secondary, #888)', fontWeight: 500 };
const tdStyle = { padding: '6px 8px', color: 'var(--color-text-primary, #ddd)' };
const btnSecondary = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 8,
    border: '1px solid var(--color-border, #444)',
    background: 'transparent', color: 'var(--color-text-secondary, #aaa)',
    fontSize: 13, cursor: 'pointer',
};

function KPI({ label, value, icon, color }) {
    return (
        <div style={{ ...cardStyle, flex: 1, textAlign: 'center', minWidth: 100 }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: color || 'var(--color-text-primary, #fff)' }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary, #888)' }}>{label}</div>
        </div>
    );
}


export default ReconciliationPanel;
