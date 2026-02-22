/**
 * RealTimeFleetPanel.jsx — Issue #26
 *
 * Real-time fleet integration panel with:
 *  - Live GPS position display
 *  - Status indicators (working, idle, maintenance, transit)
 *  - Dispatch recommendations
 *  - Fleet KPI summaries
 *  - WebSocket connection for live updates
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Truck, Activity, AlertCircle, Clock, MapPin, Wifi,
    WifiOff, RefreshCw, ChevronDown, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api';

const API_BASE = API_BASE_URL;

const STATUS_COLORS = {
    working: '#22c55e', idle: '#f59e0b', maintenance: '#ef4444',
    transit: '#3b82f6', standby: '#8b5cf6', fueling: '#f97316',
};
const STATUS_ICONS = {
    working: '🟢', idle: '🟡', maintenance: '🔴', transit: '🔵',
    standby: '🟣', fueling: '🟠',
};


function RealTimeFleetPanel({ siteId }) {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [expandedVehicle, setExpandedVehicle] = useState(null);
    const [kpis, setKpis] = useState(null);
    const wsRef = useRef(null);

    // Fetch fleet data
    const fetchFleet = useCallback(async () => {
        if (!siteId) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/fleet/site/${siteId}`);
            const data = res.data?.vehicles || res.data || [];
            setVehicles(Array.isArray(data) ? data : []);

            // Compute KPIs
            const active = data.filter(v => v.status === 'working').length;
            const idle = data.filter(v => v.status === 'idle').length;
            const maint = data.filter(v => v.status === 'maintenance').length;
            setKpis({
                total: data.length,
                active,
                idle,
                maintenance: maint,
                utilisation: data.length > 0 ? ((active / data.length) * 100).toFixed(0) : 0,
            });
        } catch {
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    }, [siteId]);

    useEffect(() => { fetchFleet(); }, [fetchFleet]);

    // WebSocket for real-time updates
    useEffect(() => {
        if (!siteId) return;
        try {
            const wsUrl = API_BASE.replace(/^http/, 'ws') + `/ws/fleet/${siteId}`;
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;
            ws.onopen = () => setConnected(true);
            ws.onclose = () => setConnected(false);
            ws.onerror = () => setConnected(false);
            ws.onmessage = (event) => {
                try {
                    const update = JSON.parse(event.data);
                    if (update.type === 'position_update') {
                        setVehicles(prev => prev.map(v =>
                            v.vehicle_id === update.vehicle_id
                                ? { ...v, ...update.data }
                                : v
                        ));
                    }
                } catch { /* ignore parse errors */ }
            };
            return () => ws.close();
        } catch {
            setConnected(false);
        }
    }, [siteId]);

    // Auto-refresh every 30s
    useEffect(() => {
        const interval = setInterval(fetchFleet, 30000);
        return () => clearInterval(interval);
    }, [fetchFleet]);

    return (
        <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                        <Truck size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Fleet Tracker
                    </h2>
                    <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 11, padding: '3px 8px', borderRadius: 10,
                        background: connected ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                        color: connected ? '#22c55e' : '#ef4444',
                    }}>
                        {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
                        {connected ? 'Live' : 'Offline'}
                    </span>
                </div>
                <button onClick={fetchFleet} style={btnSecondary}>
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* KPI Cards */}
            {kpis && (
                <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                    <KPI label="Total Fleet" value={kpis.total} icon="🚛" />
                    <KPI label="Active" value={kpis.active} icon="🟢" color="#22c55e" />
                    <KPI label="Idle" value={kpis.idle} icon="🟡" color="#f59e0b" />
                    <KPI label="Maintenance" value={kpis.maintenance} icon="🔴" color="#ef4444" />
                    <KPI label="Utilisation" value={`${kpis.utilisation}%`} icon="📊" />
                </div>
            )}

            {/* Vehicle List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {vehicles.map(v => (
                    <div key={v.vehicle_id || v.id} style={{
                        ...cardStyle,
                        borderLeft: `4px solid ${STATUS_COLORS[v.status] || '#666'}`,
                    }}>
                        <div
                            onClick={() => setExpandedVehicle(expandedVehicle === v.vehicle_id ? null : v.vehicle_id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}
                        >
                            {expandedVehicle === v.vehicle_id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <span style={{ fontSize: 15 }}>{STATUS_ICONS[v.status] || '⚪'}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary, #fff)' }}>
                                    {v.name || v.vehicle_id}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--color-text-secondary, #aaa)' }}>
                                    {v.equipment_type || v.type || 'Haul Truck'} · {v.operator || 'Unassigned'}
                                </div>
                            </div>
                            <span style={{
                                fontSize: 11, padding: '3px 10px', borderRadius: 6,
                                background: `${STATUS_COLORS[v.status]}22`,
                                color: STATUS_COLORS[v.status] || '#888',
                                fontWeight: 500, textTransform: 'uppercase',
                            }}>
                                {v.status || 'unknown'}
                            </span>
                        </div>

                        {expandedVehicle === v.vehicle_id && (
                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--color-border, #333)', fontSize: 12 }}>
                                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                    <Detail label="Location" value={v.location || v.current_position || '—'} icon={<MapPin size={12} />} />
                                    <Detail label="Speed" value={v.speed ? `${v.speed} km/h` : '—'} icon={<Activity size={12} />} />
                                    <Detail label="Load" value={v.current_load ? `${v.current_load}t` : '—'} icon={<Truck size={12} />} />
                                    <Detail label="Last Update" value={v.updated_at ? new Date(v.updated_at).toLocaleTimeString() : '—'} icon={<Clock size={12} />} />
                                </div>
                                {v.current_task && (
                                    <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 6, background: 'rgba(59,130,246,0.08)', fontSize: 11 }}>
                                        <strong>Current Task:</strong> {v.current_task}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {vehicles.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-secondary, #666)' }}>
                        No fleet data available.
                    </div>
                )}
            </div>
        </div>
    );
}


// ── Helpers ─────────────────────────────────────────────────────────

const cardStyle = {
    background: 'var(--color-bg-secondary, #1e1e2e)',
    border: '1px solid var(--color-border, #333)',
    borderRadius: 10, padding: '12px 16px',
};
const btnSecondary = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 8,
    border: '1px solid var(--color-border, #444)',
    background: 'transparent', color: 'var(--color-text-secondary, #aaa)',
    fontSize: 13, cursor: 'pointer',
};

function KPI({ label, value, icon, color }) {
    return (
        <div style={{ ...cardStyle, flex: 1, textAlign: 'center', minWidth: 80 }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: color || 'var(--color-text-primary, #fff)' }}>{value}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>{label}</div>
        </div>
    );
}

function Detail({ label, value, icon }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary, #aaa)' }}>
            {icon} <span>{label}:</span> <span style={{ color: 'var(--color-text-primary, #ddd)', fontWeight: 500 }}>{value}</span>
        </div>
    );
}


export default RealTimeFleetPanel;
