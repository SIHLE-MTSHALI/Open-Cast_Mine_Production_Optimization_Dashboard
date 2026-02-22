/**
 * ScheduleProgressPanel.jsx — Phase 2 Issue #15
 *
 * Real-time schedule run progress display:
 *  - Stage-by-stage progress bar
 *  - Elapsed time and status badge
 *  - Auto-refresh task data on completion
 *  - Support for both Fast Pass and Full Pass
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Zap, Play, Loader2, CheckCircle, XCircle,
    Clock, BarChart3, AlertTriangle
} from 'lucide-react';
import { API_BASE_URL } from '../../services/api';

const STAGES = [
    { key: 'validation', label: 'Validation', icon: '✓' },
    { key: 'candidates', label: 'Building Candidates', icon: '📋' },
    { key: 'assignment', label: 'Resource Assignment', icon: '🔧' },
    { key: 'material', label: 'Material Generation', icon: '⛏️' },
    { key: 'routing', label: 'Routing & Blending', icon: '🔀' },
    { key: 'processing', label: 'Processing', icon: '🏭' },
    { key: 'feedback', label: 'Feedback Loop', icon: '🔄' },
    { key: 'finalize', label: 'Finalizing', icon: '💾' },
];

const STATUS_COLORS = {
    idle: 'var(--color-text-secondary, #888)',
    queued: 'var(--color-info, #3b82f6)',
    running: 'var(--color-warning, #f59e0b)',
    completed: 'var(--color-success, #22c55e)',
    failed: 'var(--color-error, #ef4444)',
    error: 'var(--color-error, #ef4444)',
};


function ScheduleProgressPanel({
    scheduleVersionId,
    siteId,
    onRunComplete,
    style,
}) {
    const [runId, setRunId] = useState(null);
    const [status, setStatus] = useState('idle');
    const [progress, setProgress] = useState(0);
    const [currentStage, setCurrentStage] = useState('');
    const [elapsed, setElapsed] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const pollingRef = useRef(null);

    // ── Polling ─────────────────────────────────────────────────────────
    const pollStatus = useCallback(async (rid) => {
        try {
            const res = await fetch(`${API_BASE_URL}/schedule/run/${rid}/status`);
            if (!res.ok) return;
            const data = await res.json();

            setStatus(data.status);
            setProgress(data.progress_pct || 0);
            setCurrentStage(data.stage || '');
            setElapsed(data.elapsed_seconds || 0);

            if (data.status === 'completed' || data.status === 'failed' || data.status === 'error') {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
                setResult(data);
                if (data.status === 'completed' && onRunComplete) {
                    onRunComplete(data);
                }
                if (data.status === 'error') {
                    setError(data.error || 'Unknown error');
                }
            }
        } catch { /* network error — keep polling */ }
    }, [onRunComplete]);

    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    // ── Trigger Run ─────────────────────────────────────────────────────
    const startRun = async (mode = 'fast') => {
        setStatus('queued');
        setProgress(0);
        setCurrentStage('queuing');
        setResult(null);
        setError(null);

        try {
            const endpoint = mode === 'fast' ? '/schedule/run/fast-pass' : '/schedule/run/full-pass';
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schedule_version_id: scheduleVersionId }),
            });

            if (!res.ok) throw new Error('Failed to start run');
            const data = await res.json();
            setRunId(data.run_id);

            // Start polling every 500ms
            pollingRef.current = setInterval(() => pollStatus(data.run_id), 500);
        } catch (err) {
            setStatus('error');
            setError(err.message);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────
    const statusColor = STATUS_COLORS[status] || STATUS_COLORS.idle;

    return (
        <div style={{
            background: 'var(--color-bg-secondary, #1e1e2e)',
            border: '1px solid var(--color-border, #333)',
            borderRadius: 12,
            padding: '20px 24px',
            ...style,
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, color: 'var(--color-text-primary, #fff)' }}>
                    <BarChart3 size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Schedule Optimizer
                </h3>
                <div style={{
                    display: 'flex', gap: 8,
                }}>
                    <button
                        onClick={() => startRun('fast')}
                        disabled={status === 'running' || status === 'queued'}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 16px', borderRadius: 8, border: 'none',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: '#000', fontWeight: 600, cursor: 'pointer',
                            opacity: (status === 'running' || status === 'queued') ? 0.5 : 1,
                        }}
                    >
                        <Zap size={14} /> Fast Pass
                    </button>
                    <button
                        onClick={() => startRun('full')}
                        disabled={status === 'running' || status === 'queued'}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 16px', borderRadius: 8, border: 'none',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: '#fff', fontWeight: 600, cursor: 'pointer',
                            opacity: (status === 'running' || status === 'queued') ? 0.5 : 1,
                        }}
                    >
                        <Play size={14} /> Full Pass
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            {(status === 'running' || status === 'queued') && (
                <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: statusColor }}>
                            <Loader2 size={14} style={{ verticalAlign: 'middle', marginRight: 4, animation: 'spin 1s linear infinite' }} />
                            {currentStage || 'Starting...'}
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--color-text-secondary, #aaa)' }}>
                            <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                            {elapsed.toFixed(1)}s
                        </span>
                    </div>
                    <div style={{
                        height: 8, borderRadius: 4,
                        background: 'var(--color-bg-tertiary, #2a2a3a)',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${progress}%`,
                            borderRadius: 4,
                            background: `linear-gradient(90deg, ${statusColor}, ${statusColor}cc)`,
                            transition: 'width 0.3s ease',
                        }} />
                    </div>
                </div>
            )}

            {/* Stages indicator */}
            {(status === 'running' || status === 'queued') && (
                <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
                    {STAGES.map((s) => {
                        const isActive = currentStage?.toLowerCase().includes(s.key);
                        const isDone = progress > (STAGES.indexOf(s) + 1) / STAGES.length * 100;
                        return (
                            <span
                                key={s.key}
                                style={{
                                    fontSize: 11, padding: '3px 8px',
                                    borderRadius: 4,
                                    background: isActive ? statusColor + '33' : 'transparent',
                                    color: isDone ? 'var(--color-success, #22c55e)' : isActive ? statusColor : 'var(--color-text-secondary, #666)',
                                    border: `1px solid ${isActive ? statusColor : 'var(--color-border, #333)'}`,
                                    fontWeight: isActive ? 600 : 400,
                                }}
                            >
                                {s.icon} {s.label}
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Completed result */}
            {status === 'completed' && result && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: 12, borderRadius: 8,
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                }}>
                    <CheckCircle size={20} color="#22c55e" />
                    <div>
                        <div style={{ fontWeight: 600, color: '#22c55e', fontSize: 14 }}>
                            Schedule Complete
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary, #aaa)' }}>
                            {result.tasks_created} tasks • {(result.total_tonnes || 0).toLocaleString()}t total
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {(status === 'failed' || status === 'error') && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: 12, borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }}>
                    <XCircle size={20} color="#ef4444" />
                    <div>
                        <div style={{ fontWeight: 600, color: '#ef4444', fontSize: 14 }}>
                            Schedule Failed
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary, #aaa)' }}>
                            {error || 'Unknown error'}
                        </div>
                    </div>
                </div>
            )}

            {/* Spinner animation via inline style tag */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default ScheduleProgressPanel;
