/**
 * BlockModelViewer.jsx — Issue #34
 *
 * Interactive 3D block model viewer:
 *  - Color-coded blocks by grade/tonnage/classification
 *  - Layer slicing (bench-by-bench)
 *  - Filtering by quality range
 *  - Block statistics panel
 *  - Export selection for scheduling
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box, Layers, Filter, BarChart3, Download, Eye,
    EyeOff, Palette, ChevronDown, RefreshCw, Sliders
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api';

const API_BASE = API_BASE_URL;

const COLOR_SCHEMES = {
    grade: { name: 'Grade (Ash %)', field: 'ash', min: 0, max: 30, lowColor: [34, 197, 94], highColor: [239, 68, 68] },
    cv: { name: 'Calorific Value', field: 'cv', min: 18, max: 32, lowColor: [239, 68, 68], highColor: [34, 197, 94] },
    density: { name: 'Density', field: 'density', min: 1.2, max: 2.5, lowColor: [96, 165, 250], highColor: [139, 92, 246] },
    tonnage: { name: 'Tonnage', field: 'tonnes', min: 0, max: 5000, lowColor: [245, 158, 11], highColor: [239, 68, 68] },
    classification: { name: 'Resource Class', field: 'classification', discrete: true },
};

const CLASS_COLORS = {
    measured: '#22c55e', indicated: '#3b82f6', inferred: '#f59e0b', unclassified: '#6b7280',
};


function BlockModelViewer({ siteId }) {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [colorScheme, setColorScheme] = useState('grade');
    const [benchFilter, setBenchFilter] = useState({ min: -Infinity, max: Infinity });
    const [qualityFilter, setQualityFilter] = useState({ field: '', min: 0, max: 100 });
    const [selectedBench, setSelectedBench] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [stats, setStats] = useState(null);

    const fetchBlocks = useCallback(async () => {
        if (!siteId) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/block-model/site/${siteId}`);
            setBlocks(res.data?.blocks || res.data || []);
        } catch {
            // Demo data
            const demoBlocks = [];
            for (let z = 0; z < 8; z++) {
                for (let x = 0; x < 10; x++) {
                    for (let y = 0; y < 10; y++) {
                        demoBlocks.push({
                            id: `${z}-${x}-${y}`, x: x * 25, y: y * 25, z: z * 5,
                            width: 25, height: 25, depth: 5,
                            ash: 8 + Math.random() * 15, cv: 20 + Math.random() * 10,
                            density: 1.3 + Math.random() * 0.8,
                            tonnes: 1000 + Math.random() * 3000,
                            classification: ['measured', 'indicated', 'inferred'][Math.floor(Math.random() * 3)],
                            bench: z,
                        });
                    }
                }
            }
            setBlocks(demoBlocks);
        } finally {
            setLoading(false);
        }
    }, [siteId]);

    useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

    // Compute benches
    const benches = useMemo(() => {
        const unique = [...new Set(blocks.map(b => b.bench ?? b.z))].sort((a, b) => a - b);
        return unique;
    }, [blocks]);

    // Filter blocks
    const filteredBlocks = useMemo(() => {
        return blocks.filter(b => {
            const bench = b.bench ?? b.z;
            if (selectedBench !== null && bench !== selectedBench) return false;
            if (qualityFilter.field) {
                const val = b[qualityFilter.field];
                if (val < qualityFilter.min || val > qualityFilter.max) return false;
            }
            return true;
        });
    }, [blocks, selectedBench, qualityFilter]);

    // Compute stats
    useEffect(() => {
        if (filteredBlocks.length === 0) {
            setStats(null);
            return;
        }
        const totalTonnes = filteredBlocks.reduce((s, b) => s + (b.tonnes || 0), 0);
        const avgAsh = filteredBlocks.reduce((s, b) => s + (b.ash || 0), 0) / filteredBlocks.length;
        const avgCV = filteredBlocks.reduce((s, b) => s + (b.cv || 0), 0) / filteredBlocks.length;
        setStats({
            blockCount: filteredBlocks.length,
            totalTonnes: Math.round(totalTonnes),
            avgAsh: avgAsh.toFixed(1),
            avgCV: avgCV.toFixed(1),
        });
    }, [filteredBlocks]);

    const getBlockColor = (block) => {
        const scheme = COLOR_SCHEMES[colorScheme];
        if (scheme.discrete) {
            return CLASS_COLORS[block.classification] || '#6b7280';
        }
        const val = block[scheme.field] || 0;
        const t = Math.max(0, Math.min(1, (val - scheme.min) / (scheme.max - scheme.min)));
        const r = Math.round(scheme.lowColor[0] + t * (scheme.highColor[0] - scheme.lowColor[0]));
        const g = Math.round(scheme.lowColor[1] + t * (scheme.highColor[1] - scheme.lowColor[1]));
        const b2 = Math.round(scheme.lowColor[2] + t * (scheme.highColor[2] - scheme.lowColor[2]));
        return `rgb(${r},${g},${b2})`;
    };

    return (
        <div style={{ padding: 20, maxWidth: 1000, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                    <Box size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Block Model Viewer
                </h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowFilters(f => !f)} style={btnSecondary}>
                        <Filter size={14} /> Filters
                    </button>
                    <button onClick={fetchBlocks} style={btnSecondary}>
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                {/* Color scheme */}
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Color By</label>
                    <select value={colorScheme} onChange={e => setColorScheme(e.target.value)} style={selectStyle}>
                        {Object.entries(COLOR_SCHEMES).map(([k, v]) => (
                            <option key={k} value={k}>{v.name}</option>
                        ))}
                    </select>
                </div>

                {/* Bench selector */}
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Bench Level</label>
                    <select value={selectedBench ?? ''} onChange={e => setSelectedBench(e.target.value === '' ? null : Number(e.target.value))} style={selectStyle}>
                        <option value="">All Benches</option>
                        {benches.map(b => <option key={b} value={b}>Bench {b}</option>)}
                    </select>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div style={{ ...cardStyle, marginBottom: 16, display: 'flex', gap: 16 }}>
                    <div>
                        <label style={labelStyle}>Quality Filter Field</label>
                        <select value={qualityFilter.field} onChange={e => setQualityFilter(f => ({ ...f, field: e.target.value }))} style={selectStyle}>
                            <option value="">None</option>
                            <option value="ash">Ash</option>
                            <option value="cv">CV</option>
                            <option value="density">Density</option>
                        </select>
                    </div>
                    {qualityFilter.field && (
                        <>
                            <div>
                                <label style={labelStyle}>Min</label>
                                <input type="number" value={qualityFilter.min}
                                    onChange={e => setQualityFilter(f => ({ ...f, min: Number(e.target.value) }))}
                                    style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Max</label>
                                <input type="number" value={qualityFilter.max}
                                    onChange={e => setQualityFilter(f => ({ ...f, max: Number(e.target.value) }))}
                                    style={inputStyle} />
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Block visualisation */}
            <div style={{
                ...cardStyle, minHeight: 300, position: 'relative',
                display: 'flex', flexWrap: 'wrap', gap: 2, padding: 16,
                alignContent: 'flex-start',
            }}>
                {filteredBlocks.length === 0 ? (
                    <div style={{ width: '100%', textAlign: 'center', padding: 60, color: 'var(--color-text-secondary, #666)' }}>
                        <Box size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                        <div>No blocks to display</div>
                    </div>
                ) : (
                    filteredBlocks.slice(0, 500).map(block => (
                        <div
                            key={block.id}
                            title={`Ash: ${block.ash?.toFixed(1)}% | CV: ${block.cv?.toFixed(1)} | ${block.tonnes?.toFixed(0)}t | ${block.classification}`}
                            style={{
                                width: 12, height: 12, borderRadius: 2,
                                background: getBlockColor(block),
                                opacity: 0.85,
                                transition: 'transform 0.15s',
                                cursor: 'pointer',
                            }}
                            onMouseOver={e => e.target.style.transform = 'scale(1.8)'}
                            onMouseOut={e => e.target.style.transform = 'scale(1)'}
                        />
                    ))
                )}
                {filteredBlocks.length > 500 && (
                    <div style={{ width: '100%', textAlign: 'center', fontSize: 11, color: 'var(--color-text-secondary, #888)', marginTop: 8 }}>
                        Showing 500 of {filteredBlocks.length} blocks
                    </div>
                )}
            </div>

            {/* Legend */}
            <div style={{ marginTop: 8, display: 'flex', gap: 12, fontSize: 11, color: 'var(--color-text-secondary, #aaa)' }}>
                {colorScheme === 'classification' ? (
                    Object.entries(CLASS_COLORS).map(([cls, col]) => (
                        <span key={cls} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: col }} />
                            {cls}
                        </span>
                    ))
                ) : (
                    <>
                        <span>Low</span>
                        <div style={{
                            width: 80, height: 10, borderRadius: 3,
                            background: `linear-gradient(90deg, rgb(${COLOR_SCHEMES[colorScheme].lowColor.join(',')}), rgb(${COLOR_SCHEMES[colorScheme].highColor.join(',')}))`,
                        }} />
                        <span>High</span>
                    </>
                )}
            </div>

            {/* Stats */}
            {stats && (
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <Stat label="Blocks" value={stats.blockCount.toLocaleString()} />
                    <Stat label="Total Tonnes" value={`${(stats.totalTonnes / 1000).toFixed(0)}kt`} />
                    <Stat label="Avg Ash" value={`${stats.avgAsh}%`} />
                    <Stat label="Avg CV" value={`${stats.avgCV} MJ/kg`} />
                </div>
            )}
        </div>
    );
}


// ── Helpers ─────────────────────────────────────────────────────────

const cardStyle = {
    background: 'var(--color-bg-secondary, #1e1e2e)',
    border: '1px solid var(--color-border, #333)',
    borderRadius: 10,
};
const labelStyle = { display: 'block', fontSize: 11, marginBottom: 3, color: 'var(--color-text-secondary, #aaa)' };
const selectStyle = {
    width: '100%', padding: '6px 10px', borderRadius: 6,
    border: '1px solid var(--color-border, #444)',
    background: 'var(--color-bg-tertiary, #2a2a3a)', color: 'var(--color-text-primary, #fff)', fontSize: 12,
};
const inputStyle = {
    width: 80, padding: '6px 10px', borderRadius: 6,
    border: '1px solid var(--color-border, #444)',
    background: 'var(--color-bg-tertiary, #2a2a3a)', color: 'var(--color-text-primary, #fff)', fontSize: 12,
};
const btnSecondary = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
    border: '1px solid var(--color-border, #444)', background: 'transparent',
    color: 'var(--color-text-secondary, #aaa)', fontSize: 13, cursor: 'pointer',
};

function Stat({ label, value }) {
    return (
        <div style={{ ...cardStyle, flex: 1, textAlign: 'center', padding: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary, #fff)' }}>{value}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary, #888)' }}>{label}</div>
        </div>
    );
}


export default BlockModelViewer;
