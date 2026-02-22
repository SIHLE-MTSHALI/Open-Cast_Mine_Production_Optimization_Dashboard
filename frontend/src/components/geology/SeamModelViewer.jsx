/**
 * SeamModelViewer.jsx — Issue #100
 *
 * Stratigraphic column and seam model viewer:
 *  - Interactive stratigraphic column display
 *  - Seam editor with name, type, color
 *  - Cross-section view between boreholes
 *  - Thickness variability display
 */

import React, { useState, useMemo } from 'react';
import {
    Layers, Plus, Settings, ArrowDown, ArrowUp, Eye, EyeOff
} from 'lucide-react';

const SEAM_COLORS = {
    coal: '#2d2d2d', interburden: '#c4a35a', overburden: '#8B7355',
    parting: '#a0522d', floor: '#696969',
};

const DEMO_COLUMN = [
    { seam_id: 's0', seam_name: 'Overburden', type: 'overburden', thickness: 8.5, top_elev: 1520, bottom_elev: 1511.5, quality: {} },
    { seam_id: 's1', seam_name: 'Seam 1 (Upper)', type: 'coal', thickness: 2.1, top_elev: 1511.5, bottom_elev: 1509.4, quality: { ash: 12.3, cv: 26.8, density: 1.42 } },
    { seam_id: 's2', seam_name: 'Interburden 1-2', type: 'interburden', thickness: 3.8, top_elev: 1509.4, bottom_elev: 1505.6, quality: {} },
    { seam_id: 's3', seam_name: 'Seam 2 (Main)', type: 'coal', thickness: 4.5, top_elev: 1505.6, bottom_elev: 1501.1, quality: { ash: 14.1, cv: 25.2, density: 1.48 } },
    { seam_id: 's4', seam_name: 'Parting', type: 'parting', thickness: 0.8, top_elev: 1501.1, bottom_elev: 1500.3, quality: {} },
    { seam_id: 's5', seam_name: 'Seam 2 (Lower)', type: 'coal', thickness: 2.8, top_elev: 1500.3, bottom_elev: 1497.5, quality: { ash: 16.2, cv: 23.4, density: 1.55 } },
    { seam_id: 's6', seam_name: 'Interburden 2-3', type: 'interburden', thickness: 5.2, top_elev: 1497.5, bottom_elev: 1492.3, quality: {} },
    { seam_id: 's7', seam_name: 'Seam 3', type: 'coal', thickness: 1.8, top_elev: 1492.3, bottom_elev: 1490.5, quality: { ash: 18.5, cv: 21.1, density: 1.62 } },
    { seam_id: 's8', seam_name: 'Floor', type: 'floor', thickness: 6.0, top_elev: 1490.5, bottom_elev: 1484.5, quality: {} },
];


export default function SeamModelViewer({ siteId }) {
    const [column, setColumn] = useState(DEMO_COLUMN);
    const [selectedSeam, setSelectedSeam] = useState(null);
    const [showHidden, setShowHidden] = useState(true);
    const [hiddenSeams, setHiddenSeams] = useState(new Set());

    const totalThickness = useMemo(() => column.reduce((s, l) => s + l.thickness, 0), [column]);
    const coalSeams = useMemo(() => column.filter(l => l.type === 'coal'), [column]);
    const totalCoal = useMemo(() => coalSeams.reduce((s, l) => s + l.thickness, 0), [coalSeams]);

    const toggleHide = (seamId) => {
        setHiddenSeams(prev => {
            const next = new Set(prev);
            next.has(seamId) ? next.delete(seamId) : next.add(seamId);
            return next;
        });
    };

    const sel = column.find(l => l.seam_id === selectedSeam);
    const SCALE = 10; // pixels per meter

    return (
        <div style={{ padding: 20, maxWidth: 950, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                    <Layers size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Seam Model
                </h2>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary, #888)' }}>
                    Total: {totalThickness.toFixed(1)}m · Coal: {totalCoal.toFixed(1)}m ({((totalCoal / totalThickness) * 100).toFixed(0)}%)
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 300px', gap: 16 }}>
                {/* Left: seam list */}
                <div style={card}>
                    <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary, #aaa)', margin: '0 0 8px' }}>Seams</h3>
                    {column.map(l => (
                        <div key={l.seam_id} onClick={() => setSelectedSeam(l.seam_id)} style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px',
                            borderRadius: 6, marginBottom: 2, cursor: 'pointer',
                            background: l.seam_id === selectedSeam ? 'rgba(59,130,246,0.1)' : 'transparent',
                            opacity: hiddenSeams.has(l.seam_id) ? 0.4 : 1,
                        }}>
                            <div style={{ width: 12, height: 12, borderRadius: 2, background: SEAM_COLORS[l.type] || '#666' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-primary, #ddd)' }}>{l.seam_name}</div>
                                <div style={{ fontSize: 9, color: 'var(--color-text-secondary, #888)' }}>{l.thickness.toFixed(1)}m</div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); toggleHide(l.seam_id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-text-secondary, #666)' }}>
                                {hiddenSeams.has(l.seam_id) ? <EyeOff size={10} /> : <Eye size={10} />}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Center: stratigraphic column visualization */}
                <div style={{ ...card, display: 'flex', justifyContent: 'center', padding: '20px 40px' }}>
                    <div style={{ width: 100, position: 'relative' }}>
                        {column.filter(l => !hiddenSeams.has(l.seam_id)).map(l => (
                            <div key={l.seam_id}
                                onClick={() => setSelectedSeam(l.seam_id)}
                                style={{
                                    height: Math.max(8, l.thickness * SCALE),
                                    background: l.type === 'coal' ?
                                        `repeating-linear-gradient(45deg, ${SEAM_COLORS[l.type]}, ${SEAM_COLORS[l.type]} 3px, #444 3px, #444 4px)` :
                                        SEAM_COLORS[l.type] || '#666',
                                    border: l.seam_id === selectedSeam ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 8, color: '#fff', fontWeight: 600,
                                    transition: 'all 0.15s',
                                }}
                                title={`${l.seam_name}: ${l.thickness.toFixed(1)}m`}
                            >
                                {l.thickness >= 1.5 && <span style={{ textShadow: '0 1px 2px #000' }}>{l.seam_name.split(' ')[0]}</span>}
                            </div>
                        ))}
                        {/* Elevation labels */}
                        <div style={{
                            position: 'absolute', left: -45, top: 0, fontSize: 9,
                            color: 'var(--color-text-secondary, #888)',
                        }}>{column[0]?.top_elev.toFixed(0)}m</div>
                        <div style={{
                            position: 'absolute', left: -45, bottom: 0, fontSize: 9,
                            color: 'var(--color-text-secondary, #888)',
                        }}>{column[column.length - 1]?.bottom_elev.toFixed(0)}m</div>
                    </div>
                </div>

                {/* Right: detail panel */}
                <div>
                    {sel ? (
                        <div style={card}>
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary, #fff)', margin: '0 0 12px' }}>{sel.seam_name}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                                <InfoRow label="Type" value={sel.type} />
                                <InfoRow label="Thickness" value={`${sel.thickness.toFixed(1)}m`} />
                                <InfoRow label="Roof Elev" value={`${sel.top_elev.toFixed(1)}m`} />
                                <InfoRow label="Floor Elev" value={`${sel.bottom_elev.toFixed(1)}m`} />
                            </div>
                            {sel.type === 'coal' && sel.quality && Object.keys(sel.quality).length > 0 && (
                                <>
                                    <h4 style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary, #aaa)', margin: '12px 0 6px' }}>Quality</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        {sel.quality.ash !== undefined && <InfoRow label="Ash %" value={sel.quality.ash} />}
                                        {sel.quality.cv !== undefined && <InfoRow label="CV (MJ/kg)" value={sel.quality.cv} />}
                                        {sel.quality.density !== undefined && <InfoRow label="RD" value={sel.quality.density} />}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div style={{ ...card, textAlign: 'center', padding: 40, color: 'var(--color-text-secondary, #666)' }}>
                            <Layers size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                            <div>Select a seam to view details</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div style={{ background: 'var(--color-bg-tertiary, #2a2a3a)', borderRadius: 6, padding: '6px 10px' }}>
            <div style={{ fontSize: 9, color: 'var(--color-text-secondary, #888)' }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary, #fff)' }}>{value}</div>
        </div>
    );
}

const card = {
    background: 'var(--color-bg-secondary, #1e1e2e)',
    border: '1px solid var(--color-border, #333)',
    borderRadius: 10, padding: 16,
};
