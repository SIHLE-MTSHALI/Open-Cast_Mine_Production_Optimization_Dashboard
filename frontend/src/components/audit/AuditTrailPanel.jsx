/**
 * AuditTrailPanel.jsx — Issue #28
 *
 * Audit trail and schedule versioning UI:
 *  - Chronological event log
 *  - Filterable by event type, user, date range
 *  - Version comparison
 *  - Schedule version tree
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Clock, Filter, Search, User, GitBranch, FileText,
    ChevronDown, ChevronRight, RefreshCw, Eye
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api';

const API_BASE = API_BASE_URL;

const EVENT_COLORS = {
    create: '#22c55e', update: '#3b82f6', delete: '#ef4444',
    approve: '#8b5cf6', schedule: '#f59e0b', import: '#06b6d4',
};
const EVENT_ICONS = {
    create: '➕', update: '✏️', delete: '🗑️',
    approve: '✅', schedule: '📅', import: '📥',
};


function AuditTrailPanel({ siteId }) {
    const [events, setEvents] = useState([]);
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ type: '', search: '' });
    const [activeTab, setActiveTab] = useState('timeline');
    const [expandedEvent, setExpandedEvent] = useState(null);

    const fetchEvents = useCallback(async () => {
        if (!siteId) return;
        setLoading(true);
        try {
            const [evtRes, verRes] = await Promise.all([
                axios.get(`${API_BASE}/audit/site/${siteId}`).catch(() => ({ data: [] })),
                axios.get(`${API_BASE}/schedule/versions?site_id=${siteId}`).catch(() => ({ data: [] })),
            ]);
            setEvents(evtRes.data || []);
            setVersions(verRes.data?.versions || verRes.data || []);
        } catch {
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [siteId]);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const filteredEvents = events.filter(e => {
        if (filter.type && e.event_type !== filter.type) return false;
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            return (e.description || '').toLowerCase().includes(searchLower)
                || (e.user || '').toLowerCase().includes(searchLower);
        }
        return true;
    });

    return (
        <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                    <Clock size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Audit Trail
                </h2>
                <button onClick={fetchEvents} style={btnSecondary}>
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--color-border, #333)' }}>
                {['timeline', 'versions'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '8px 16px', border: 'none', borderRadius: '6px 6px 0 0',
                        background: activeTab === tab ? 'var(--color-bg-secondary, #1e1e2e)' : 'transparent',
                        color: activeTab === tab ? '#60a5fa' : 'var(--color-text-secondary, #aaa)',
                        fontWeight: activeTab === tab ? 600 : 400, fontSize: 13, cursor: 'pointer',
                        borderBottom: activeTab === tab ? '2px solid #3b82f6' : 'none',
                    }}>
                        {tab === 'timeline' ? '📋 Timeline' : '🔀 Versions'}
                    </button>
                ))}
            </div>

            {/* Filters */}
            {activeTab === 'timeline' && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={14} style={{
                            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--color-text-secondary, #888)',
                        }} />
                        <input
                            placeholder="Search events..."
                            value={filter.search}
                            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                            style={{ ...inputStyle, paddingLeft: 30, width: '100%' }}
                        />
                    </div>
                    <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))} style={selectStyle}>
                        <option value="">All Types</option>
                        <option value="create">Create</option>
                        <option value="update">Update</option>
                        <option value="delete">Delete</option>
                        <option value="approve">Approve</option>
                        <option value="schedule">Schedule</option>
                        <option value="import">Import</option>
                    </select>
                </div>
            )}

            {/* Timeline */}
            {activeTab === 'timeline' && (
                <div style={{ position: 'relative', paddingLeft: 24 }}>
                    {/* Vertical timeline line */}
                    <div style={{
                        position: 'absolute', left: 8, top: 0, bottom: 0, width: 2,
                        background: 'var(--color-border, #333)',
                    }} />

                    {filteredEvents.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-secondary, #666)' }}>
                            No events found.
                        </div>
                    ) : filteredEvents.map((evt, i) => (
                        <div key={evt.id || i} style={{ marginBottom: 8, position: 'relative' }}>
                            {/* Timeline dot */}
                            <div style={{
                                position: 'absolute', left: -20, top: 12, width: 12, height: 12,
                                borderRadius: '50%', background: EVENT_COLORS[evt.event_type] || '#666',
                                border: '2px solid var(--color-bg-primary, #111)',
                            }} />

                            <div style={{
                                ...cardStyle,
                                borderLeft: `3px solid ${EVENT_COLORS[evt.event_type] || '#666'}`,
                                cursor: 'pointer',
                            }}
                                onClick={() => setExpandedEvent(expandedEvent === i ? null : i)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span>{EVENT_ICONS[evt.event_type] || '📝'}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--color-text-primary, #fff)' }}>
                                            {evt.description || evt.event_type}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--color-text-secondary, #aaa)', display: 'flex', gap: 12 }}>
                                            <span><User size={10} /> {evt.user || 'System'}</span>
                                            <span><Clock size={10} /> {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : '—'}</span>
                                        </div>
                                    </div>
                                    {expandedEvent === i ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </div>
                                {expandedEvent === i && evt.details && (
                                    <div style={{
                                        marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border, #333)',
                                        fontSize: 12, color: 'var(--color-text-secondary, #ccc)',
                                    }}>
                                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 11 }}>
                                            {typeof evt.details === 'object' ? JSON.stringify(evt.details, null, 2) : evt.details}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Versions */}
            {activeTab === 'versions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {versions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-secondary, #666)' }}>
                            No schedule versions found.
                        </div>
                    ) : versions.map((v, i) => (
                        <div key={v.version_id || i} style={{
                            ...cardStyle, display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                            <GitBranch size={16} color="#8b5cf6" />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary, #fff)' }}>
                                    {v.name || `Version ${i + 1}`}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--color-text-secondary, #aaa)' }}>
                                    {v.created_at ? new Date(v.created_at).toLocaleString() : '—'}
                                    {v.status && ` · ${v.status}`}
                                </div>
                            </div>
                            <span style={{
                                fontSize: 11, padding: '3px 10px', borderRadius: 6,
                                background: v.status === 'approved' ? 'rgba(34,197,94,0.15)' :
                                    v.status === 'draft' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)',
                                color: v.status === 'approved' ? '#22c55e' :
                                    v.status === 'draft' ? '#60a5fa' : '#f59e0b',
                                fontWeight: 500,
                            }}>
                                {(v.status || 'draft').toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


// ── Styles ──────────────────────────────────────────────────────────

const cardStyle = {
    background: 'var(--color-bg-secondary, #1e1e2e)',
    border: '1px solid var(--color-border, #333)',
    borderRadius: 10, padding: '12px 16px',
};
const inputStyle = {
    padding: '8px 12px', borderRadius: 6,
    border: '1px solid var(--color-border, #444)',
    background: 'var(--color-bg-tertiary, #2a2a3a)',
    color: 'var(--color-text-primary, #fff)', fontSize: 13,
};
const selectStyle = {
    padding: '8px 12px', borderRadius: 6,
    border: '1px solid var(--color-border, #444)',
    background: 'var(--color-bg-tertiary, #2a2a3a)',
    color: 'var(--color-text-primary, #fff)', fontSize: 13,
};
const btnSecondary = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 8,
    border: '1px solid var(--color-border, #444)',
    background: 'transparent', color: 'var(--color-text-secondary, #aaa)',
    fontSize: 13, cursor: 'pointer',
};


export default AuditTrailPanel;
