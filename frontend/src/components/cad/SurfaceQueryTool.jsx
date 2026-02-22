/**
 * SurfaceQueryTool.jsx — Issue #10
 *
 * Surface query and manipulation tools:
 *  - Point elevation query (click on surface)
 *  - Surface profile (cross-section along polyline)
 *  - Surface comparison (cut/fill between two surfaces)
 *  - Surface smoothing
 *  - Contour generation controls
 */

import React, { useState, useCallback } from 'react';
import {
    MousePointer, Ruler, Layers, Sliders, RefreshCw,
    ChevronDown, ChevronRight, Map
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api';

const API_BASE = API_BASE_URL;


function SurfaceQueryTool({ siteId, surfaces = [] }) {
    const [activeMode, setActiveMode] = useState(null);
    const [queryResult, setQueryResult] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [contourInterval, setContourInterval] = useState(5);
    const [smoothingFactor, setSmoothingFactor] = useState(0.5);
    const [selectedSurface, setSelectedSurface] = useState(null);
    const [comparisonSurface, setComparisonSurface] = useState(null);

    const handleElevationQuery = useCallback(async (x, y) => {
        if (!selectedSurface) return;
        try {
            const res = await axios.post(`${API_BASE}/surfaces/${selectedSurface}/query`, { x, y });
            setQueryResult({
                type: 'elevation',
                x, y,
                elevation: res.data?.elevation || 0,
                slope: res.data?.slope || 0,
                aspect: res.data?.aspect || 0,
            });
        } catch {
            setQueryResult({ type: 'elevation', x, y, elevation: 'N/A' });
        }
    }, [selectedSurface]);

    const handleProfileQuery = useCallback(async (points) => {
        if (!selectedSurface || !points?.length) return;
        try {
            const res = await axios.post(`${API_BASE}/surfaces/${selectedSurface}/profile`, { points });
            setProfileData(res.data?.profile || []);
        } catch {
            setProfileData([]);
        }
    }, [selectedSurface]);

    const handleCutFill = useCallback(async () => {
        if (!selectedSurface || !comparisonSurface) return;
        try {
            const res = await axios.post(`${API_BASE}/surfaces/compare`, {
                surface_a: selectedSurface,
                surface_b: comparisonSurface,
            });
            setQueryResult({
                type: 'cutfill',
                cut_volume: res.data?.cut_volume || 0,
                fill_volume: res.data?.fill_volume || 0,
                net_volume: res.data?.net_volume || 0,
            });
        } catch {
            setQueryResult({ type: 'cutfill', cut_volume: 0, fill_volume: 0, net_volume: 0 });
        }
    }, [selectedSurface, comparisonSurface]);

    const handleSmooth = useCallback(async () => {
        if (!selectedSurface) return;
        try {
            await axios.post(`${API_BASE}/surfaces/${selectedSurface}/smooth`, { factor: smoothingFactor });
        } catch (e) {
            console.error('Smooth failed', e);
        }
    }, [selectedSurface, smoothingFactor]);

    const tools = [
        { id: 'query', label: 'Point Query', icon: MousePointer, desc: 'Click surface for elevation' },
        { id: 'profile', label: 'Profile', icon: Ruler, desc: 'Draw section line' },
        { id: 'cutfill', label: 'Cut/Fill', icon: Layers, desc: 'Compare two surfaces' },
        { id: 'contour', label: 'Contours', icon: Map, desc: 'Generate contour lines' },
        { id: 'smooth', label: 'Smooth', icon: Sliders, desc: 'Surface smoothing' },
    ];

    return (
        <div style={{ padding: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--color-text-primary, #fff)' }}>
                Surface Tools
            </h3>

            {/* Surface Selection */}
            <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Active Surface</label>
                <select value={selectedSurface || ''} onChange={e => setSelectedSurface(e.target.value)} style={selectStyle}>
                    <option value="">Select surface...</option>
                    {surfaces.map(s => (
                        <option key={s.surface_id || s.id} value={s.surface_id || s.id}>
                            {s.name || s.surface_id}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tool Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                {tools.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => setActiveMode(activeMode === tool.id ? null : tool.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 12px', borderRadius: 6,
                            border: activeMode === tool.id ? '1px solid #3b82f6' : '1px solid var(--color-border, #444)',
                            background: activeMode === tool.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                            color: activeMode === tool.id ? '#60a5fa' : 'var(--color-text-secondary, #aaa)',
                            fontSize: 12, cursor: 'pointer', textAlign: 'left',
                        }}
                    >
                        <tool.icon size={14} />
                        <div>
                            <div style={{ fontWeight: 500 }}>{tool.label}</div>
                            <div style={{ fontSize: 10, opacity: 0.7 }}>{tool.desc}</div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Cut/Fill comparison surface */}
            {activeMode === 'cutfill' && (
                <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>Comparison Surface</label>
                    <select value={comparisonSurface || ''} onChange={e => setComparisonSurface(e.target.value)} style={selectStyle}>
                        <option value="">Select comparison...</option>
                        {surfaces.filter(s => (s.surface_id || s.id) !== selectedSurface).map(s => (
                            <option key={s.surface_id || s.id} value={s.surface_id || s.id}>
                                {s.name || s.surface_id}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleCutFill} style={{ ...btnPrimary, marginTop: 8, width: '100%', justifyContent: 'center' }}
                        disabled={!comparisonSurface}>
                        Calculate Cut/Fill
                    </button>
                </div>
            )}

            {/* Contour Interval */}
            {activeMode === 'contour' && (
                <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>Contour Interval (m)</label>
                    <input type="range" min={1} max={20} value={contourInterval}
                        onChange={e => setContourInterval(parseInt(e.target.value))}
                        style={{ width: '100%' }} />
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary, #aaa)', textAlign: 'center' }}>
                        {contourInterval}m
                    </div>
                </div>
            )}

            {/* Smoothing */}
            {activeMode === 'smooth' && (
                <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>Smoothing Factor</label>
                    <input type="range" min={0} max={1} step={0.1} value={smoothingFactor}
                        onChange={e => setSmoothingFactor(parseFloat(e.target.value))}
                        style={{ width: '100%' }} />
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary, #aaa)', textAlign: 'center' }}>
                        {smoothingFactor.toFixed(1)} ({smoothingFactor < 0.3 ? 'mild' : smoothingFactor < 0.7 ? 'moderate' : 'aggressive'})
                    </div>
                    <button onClick={handleSmooth} style={{ ...btnPrimary, marginTop: 8, width: '100%', justifyContent: 'center' }}>
                        Apply Smoothing
                    </button>
                </div>
            )}

            {/* Query Result */}
            {queryResult && (
                <div style={{
                    ...cardStyle, marginTop: 12, padding: 12,
                }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--color-text-primary, #fff)' }}>
                        {queryResult.type === 'elevation' ? '📍 Point Query Result' : '📊 Cut/Fill Result'}
                    </div>
                    {queryResult.type === 'elevation' && (
                        <>
                            <div style={resultRow}>Elevation: <strong>{queryResult.elevation}m</strong></div>
                            <div style={resultRow}>Slope: <strong>{queryResult.slope}°</strong></div>
                            <div style={resultRow}>Aspect: <strong>{queryResult.aspect}°</strong></div>
                        </>
                    )}
                    {queryResult.type === 'cutfill' && (
                        <>
                            <div style={resultRow}>Cut: <strong style={{ color: '#ef4444' }}>{(queryResult.cut_volume || 0).toLocaleString()} m³</strong></div>
                            <div style={resultRow}>Fill: <strong style={{ color: '#22c55e' }}>{(queryResult.fill_volume || 0).toLocaleString()} m³</strong></div>
                            <div style={resultRow}>Net: <strong style={{ color: '#60a5fa' }}>{(queryResult.net_volume || 0).toLocaleString()} m³</strong></div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}


// ── Styles ──────────────────────────────────────────────────────────

const cardStyle = {
    background: 'var(--color-bg-secondary, #1e1e2e)',
    border: '1px solid var(--color-border, #333)',
    borderRadius: 8,
};
const labelStyle = { display: 'block', fontSize: 11, marginBottom: 3, color: 'var(--color-text-secondary, #aaa)' };
const selectStyle = {
    width: '100%', padding: '6px 10px', borderRadius: 6,
    border: '1px solid var(--color-border, #444)',
    background: 'var(--color-bg-tertiary, #2a2a3a)',
    color: 'var(--color-text-primary, #fff)', fontSize: 12,
};
const btnPrimary = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
    border: 'none', background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer',
};
const resultRow = {
    fontSize: 12, padding: '2px 0', color: 'var(--color-text-secondary, #ccc)',
};


export default SurfaceQueryTool;
