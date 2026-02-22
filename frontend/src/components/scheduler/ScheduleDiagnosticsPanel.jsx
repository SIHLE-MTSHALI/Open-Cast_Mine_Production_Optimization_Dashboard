/**
 * ScheduleDiagnosticsPanel.jsx — Phase 2 Issue #30
 *
 * Dedicated control panel for scheduling status and diagnostics:
 *  - Feasibility score / quality compliance gauge
 *  - Infeasibility & unmet demand list
 *  - Binding constraints table
 *  - Decision explanations browser
 *  - Embedded ScheduleProgressPanel for run control
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    AlertTriangle, CheckCircle, XCircle, Info,
    Activity, BarChart3, ChevronDown, ChevronRight,
    RefreshCw, Shield
} from 'lucide-react';
import axios from 'axios';
import ScheduleProgressPanel from './ScheduleProgressPanel';
import { API_BASE_URL } from '../../services/api';

const API_BASE = API_BASE_URL;


// Gauge component for scores
function ScoreGauge({ label, value, max = 1, color }) {
    const pct = ((value || 0) / max) * 100;
    return (
        <div style={{ textAlign: 'center', minWidth: 100 }}>
            <div style={{
                position: 'relative', width: 80, height: 80, margin: '0 auto',
                borderRadius: '50%',
                background: `conic-gradient(${color} ${pct}%, var(--color-bg-tertiary, #2a2a3a) ${pct}%)`,
            }}>
                <div style={{
                    position: 'absolute', inset: 8, borderRadius: '50%',
                    background: 'var(--color-bg-secondary, #1e1e2e)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, color,
                }}>
                    {(pct).toFixed(0)}%
                </div>
            </div>
            <div style={{ fontSize: 11, marginTop: 6, color: 'var(--color-text-secondary, #aaa)' }}>{label}</div>
        </div>
    );
}


function ScheduleDiagnosticsPanel({ siteId, scheduleVersionId }) {
    const [diagnostics, setDiagnostics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        constraints: false, decisions: false,
    });
    const [precedenceResult, setPrecedenceResult] = useState(null);

    const fetchDiagnostics = useCallback(async () => {
        if (!scheduleVersionId) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/schedule/versions/${scheduleVersionId}/diagnostics`);
            setDiagnostics(res.data);
        } catch {
            setDiagnostics(null);
        } finally {
            setLoading(false);
        }
    }, [scheduleVersionId]);

    const fetchPrecedence = useCallback(async () => {
        if (!siteId) return;
        try {
            const res = await axios.get(`${API_BASE}/precedence/validate/site/${siteId}`);
            setPrecedenceResult(res.data);
        } catch {
            setPrecedenceResult(null);
        }
    }, [siteId]);

    useEffect(() => {
        fetchDiagnostics();
        fetchPrecedence();
    }, [fetchDiagnostics, fetchPrecedence]);

    const toggle = (section) =>
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

    const summary = diagnostics?.summary || {};
    const decisions = diagnostics?.decisions || [];
    const constraints = diagnostics?.bindingConstraints || [];
    const infeasibilities = diagnostics?.infeasibilities || [];
    const unmetDemands = diagnostics?.unmetDemands || [];

    const cardStyle = {
        background: 'var(--color-bg-secondary, #1e1e2e)',
        border: '1px solid var(--color-border, #333)',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 16,
    };

    const hdrStyle = {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', userSelect: 'none',
    };

    return (
        <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
            {/* Run Controller */}
            <ScheduleProgressPanel
                scheduleVersionId={scheduleVersionId}
                siteId={siteId}
                onRunComplete={() => { fetchDiagnostics(); fetchPrecedence(); }}
                style={{ marginBottom: 24 }}
            />

            {/* Summary Gauges */}
            <div style={{
                ...cardStyle,
                display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap',
            }}>
                <ScoreGauge
                    label="Feasibility"
                    value={summary.feasibilityScore}
                    max={1}
                    color={summary.feasibilityScore >= 0.9 ? '#22c55e' : summary.feasibilityScore >= 0.5 ? '#f59e0b' : '#ef4444'}
                />
                <ScoreGauge
                    label="Quality"
                    value={summary.qualityCompliance}
                    max={1}
                    color={summary.qualityCompliance >= 0.9 ? '#22c55e' : '#f59e0b'}
                />
                <div style={{ textAlign: 'center', minWidth: 80 }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary, #fff)' }}>
                        {summary.totalTasks ?? '—'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary, #aaa)' }}>Tasks</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: 100 }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary, #fff)' }}>
                        {summary.totalTonnes ? `${(summary.totalTonnes / 1000).toFixed(0)}k` : '—'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary, #aaa)' }}>Total Tonnes</div>
                </div>
                <button
                    onClick={() => { fetchDiagnostics(); fetchPrecedence(); }}
                    style={{
                        background: 'none', border: 'none', color: 'var(--color-text-secondary, #aaa)',
                        cursor: 'pointer', padding: 8,
                    }}
                    title="Refresh diagnostics"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Precedence Validation */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Shield size={18} color={precedenceResult?.valid ? '#22c55e' : '#ef4444'} />
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary, #fff)' }}>
                        Precedence Constraints
                    </span>
                    <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 10,
                        background: precedenceResult?.valid ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                        color: precedenceResult?.valid ? '#22c55e' : '#ef4444',
                    }}>
                        {precedenceResult?.valid ? 'VALID' : `${precedenceResult?.violations?.length || 0} VIOLATIONS`}
                    </span>
                </div>
                {precedenceResult?.violations?.length > 0 && (
                    <div style={{ fontSize: 12, marginTop: 8 }}>
                        {precedenceResult.violations.slice(0, 5).map((v, i) => (
                            <div key={i} style={{
                                padding: '6px 10px', marginBottom: 4, borderRadius: 6,
                                background: 'rgba(239,68,68,0.08)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                color: 'var(--color-text-secondary, #ccc)',
                            }}>
                                ⚠ {v.message}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Infeasibilities */}
            {infeasibilities.length > 0 && (
                <div style={{ ...cardStyle, borderColor: 'rgba(239,68,68,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <XCircle size={16} color="#ef4444" />
                        <span style={{ fontWeight: 600, color: '#ef4444', fontSize: 13 }}>
                            Infeasibilities ({infeasibilities.length})
                        </span>
                    </div>
                    {infeasibilities.map((inf, i) => (
                        <div key={i} style={{ fontSize: 12, color: '#fca5a5', marginBottom: 4 }}>
                            • {typeof inf === 'string' ? inf : inf.message || JSON.stringify(inf)}
                        </div>
                    ))}
                </div>
            )}

            {/* Binding Constraints (collapsible) */}
            <div style={cardStyle}>
                <div style={hdrStyle} onClick={() => toggle('constraints')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary, #fff)' }}>
                        {expandedSections.constraints ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <Activity size={16} />
                        Binding Constraints ({constraints.length})
                    </span>
                </div>
                {expandedSections.constraints && (
                    <div style={{ marginTop: 12 }}>
                        {constraints.length === 0 ? (
                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary, #888)' }}>
                                No binding constraints recorded.
                            </div>
                        ) : (
                            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--color-border, #333)' }}>
                                        <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--color-text-secondary, #aaa)' }}>Constraint</th>
                                        <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--color-text-secondary, #aaa)' }}>Slack</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {constraints.map((c, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--color-border, #222)' }}>
                                            <td style={{ padding: '6px 8px', color: 'var(--color-text-primary, #ddd)' }}>
                                                {typeof c === 'string' ? c : c.name || JSON.stringify(c)}
                                            </td>
                                            <td style={{ padding: '6px 8px', textAlign: 'right', color: '#f59e0b' }}>
                                                {c.slack ?? '0'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* Decision Explanations (collapsible) */}
            <div style={cardStyle}>
                <div style={hdrStyle} onClick={() => toggle('decisions')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary, #fff)' }}>
                        {expandedSections.decisions ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <Info size={16} />
                        Decision Explanations ({decisions.length})
                    </span>
                </div>
                {expandedSections.decisions && (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {decisions.length === 0 ? (
                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary, #888)' }}>
                                No decisions recorded yet. Run an optimization pass to generate explanations.
                            </div>
                        ) : decisions.map((d, i) => (
                            <div key={i} style={{
                                padding: '10px 14px', borderRadius: 8,
                                background: 'var(--color-bg-tertiary, #2a2a3a)',
                                border: '1px solid var(--color-border, #333)',
                            }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary, #fff)', marginBottom: 4 }}>
                                    {d.decisionType}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-secondary, #bbb)' }}>
                                    {d.explanation}
                                </div>
                                {d.bindingConstraints?.length > 0 && (
                                    <div style={{ fontSize: 11, marginTop: 4, color: '#f59e0b' }}>
                                        Binding: {d.bindingConstraints.join(', ')}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ScheduleDiagnosticsPanel;
