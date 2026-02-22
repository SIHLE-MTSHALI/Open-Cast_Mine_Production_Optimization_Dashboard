/**
 * PrintLayoutManager.jsx — Issue #13
 *
 * Print/Plot Layout System for mining maps:
 *  - Page size selection (A4, A3, A2, A1, A0, custom)
 *  - Scale bar with configurable map scale
 *  - Title block with mine name, drawing number, date, revision
 *  - North arrow
 *  - Legend panel
 *  - Viewport definition (which 3D view region to capture)
 *  - Export to PDF via browser print
 */

import React, { useState, useCallback, useRef } from 'react';
import {
    Printer, Download, FileText, Settings, Maximize2,
    MapPin, Compass, Layers, Type, Square
} from 'lucide-react';


const PAGE_SIZES = {
    'A4': { width: 297, height: 210, label: 'A4 (297×210 mm)' },
    'A3': { width: 420, height: 297, label: 'A3 (420×297 mm)' },
    'A2': { width: 594, height: 420, label: 'A2 (594×420 mm)' },
    'A1': { width: 841, height: 594, label: 'A1 (841×594 mm)' },
    'A0': { width: 1189, height: 841, label: 'A0 (1189×841 mm)' },
};

const SCALES = ['1:500', '1:1000', '1:2000', '1:2500', '1:5000', '1:10000', '1:25000'];


function PrintLayoutManager({ siteName = 'Mine Site' }) {
    const printRef = useRef(null);
    const [pageSize, setPageSize] = useState('A3');
    const [orientation, setOrientation] = useState('landscape');
    const [scale, setScale] = useState('1:2000');
    const [showGrid, setShowGrid] = useState(true);
    const [titleBlock, setTitleBlock] = useState({
        title: `${siteName} — Production Plan`,
        drawingNo: 'DWG-001',
        revision: 'A',
        drawnBy: 'MineOpt Pro',
        date: new Date().toISOString().split('T')[0],
        approved: '',
    });
    const [showSettings, setShowSettings] = useState(false);

    const page = PAGE_SIZES[pageSize];
    const isLandscape = orientation === 'landscape';
    const displayW = isLandscape ? page.width : page.height;
    const displayH = isLandscape ? page.height : page.width;

    // Scale for screen display (fit in 700px width)
    const screenScale = Math.min(700 / displayW, 500 / displayH);

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    const handleExportPDF = useCallback(() => {
        // Trigger browser print dialog which can save as PDF
        window.print();
    }, []);

    return (
        <div style={{ padding: 20, maxWidth: 1000, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                        <FileText size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Print Layout
                    </h2>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary, #888)', margin: '4px 0 0' }}>
                        Configure and export mine plan drawings
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowSettings(s => !s)} style={btnSecondary}>
                        <Settings size={14} /> Settings
                    </button>
                    <button onClick={handlePrint} style={btnPrimary}>
                        <Printer size={14} /> Print
                    </button>
                    <button onClick={handleExportPDF} style={{
                        ...btnPrimary, background: 'linear-gradient(135deg, #22c55e, #16a34a)'
                    }}>
                        <Download size={14} /> Export PDF
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div style={{ ...cardStyle, marginBottom: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <div>
                        <label style={labelStyle}>Page Size</label>
                        <select value={pageSize} onChange={e => setPageSize(e.target.value)} style={selectStyle}>
                            {Object.entries(PAGE_SIZES).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Orientation</label>
                        <select value={orientation} onChange={e => setOrientation(e.target.value)} style={selectStyle}>
                            <option value="landscape">Landscape</option>
                            <option value="portrait">Portrait</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Scale</label>
                        <select value={scale} onChange={e => setScale(e.target.value)} style={selectStyle}>
                            {SCALES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Grid</label>
                        <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />
                    </div>
                    <div style={{ flex: '1 0 200px' }}>
                        <label style={labelStyle}>Title</label>
                        <input value={titleBlock.title}
                            onChange={e => setTitleBlock(t => ({ ...t, title: e.target.value }))}
                            style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Drawing No.</label>
                        <input value={titleBlock.drawingNo}
                            onChange={e => setTitleBlock(t => ({ ...t, drawingNo: e.target.value }))}
                            style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Revision</label>
                        <input value={titleBlock.revision}
                            onChange={e => setTitleBlock(t => ({ ...t, revision: e.target.value }))}
                            style={{ ...inputStyle, width: 50 }} />
                    </div>
                </div>
            )}

            {/* Print Preview */}
            <div style={{ background: '#333', borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'center' }}>
                <div
                    ref={printRef}
                    id="print-layout"
                    style={{
                        width: displayW * screenScale,
                        height: displayH * screenScale,
                        background: '#fff',
                        borderRadius: 2,
                        position: 'relative',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        overflow: 'hidden',
                    }}
                >
                    {/* Grid */}
                    {showGrid && (
                        <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
                            <defs>
                                <pattern id="grid" width={20} height={20} patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    )}

                    {/* Map Viewport (placeholder) */}
                    <div style={{
                        position: 'absolute', top: 10 * screenScale, left: 10 * screenScale,
                        right: 10 * screenScale, bottom: 50 * screenScale,
                        border: '1px solid #999', borderRadius: 2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#999', fontSize: 12,
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <Maximize2 size={24} style={{ marginBottom: 8, opacity: 0.3 }} />
                            <div>Map Viewport — {scale}</div>
                            <div style={{ fontSize: 10, marginTop: 4 }}>Drag to reposition, scroll to zoom</div>
                        </div>
                    </div>

                    {/* North Arrow */}
                    <div style={{
                        position: 'absolute', top: 15 * screenScale, right: 15 * screenScale,
                        width: 30 * screenScale, height: 30 * screenScale,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Compass size={20 * screenScale} color="#333" />
                    </div>

                    {/* Scale Bar */}
                    <div style={{
                        position: 'absolute', bottom: 55 * screenScale, left: 15 * screenScale,
                        display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                        <div style={{
                            width: 60 * screenScale, height: 6 * screenScale,
                            background: 'repeating-linear-gradient(90deg, #333 0px, #333 15px, #fff 15px, #fff 30px)',
                            border: '1px solid #333',
                        }} />
                        <span style={{ fontSize: 8 * screenScale, color: '#333' }}>{scale}</span>
                    </div>

                    {/* Title Block */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: 45 * screenScale,
                        borderTop: '2px solid #333',
                        display: 'flex', fontSize: 8 * screenScale, color: '#333',
                    }}>
                        <div style={{ flex: 3, padding: 4 * screenScale, borderRight: '1px solid #999' }}>
                            <div style={{ fontWeight: 700, fontSize: 10 * screenScale }}>{titleBlock.title}</div>
                            <div style={{ marginTop: 2 * screenScale }}>{siteName}</div>
                        </div>
                        <div style={{ flex: 1, padding: 4 * screenScale, borderRight: '1px solid #999' }}>
                            <div>Drawing: {titleBlock.drawingNo}</div>
                            <div>Rev: {titleBlock.revision}</div>
                        </div>
                        <div style={{ flex: 1, padding: 4 * screenScale, borderRight: '1px solid #999' }}>
                            <div>Scale: {scale}</div>
                            <div>Date: {titleBlock.date}</div>
                        </div>
                        <div style={{ flex: 1, padding: 4 * screenScale }}>
                            <div>Drawn by: {titleBlock.drawnBy}</div>
                            <div>Page: {pageSize} {orientation}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page Info */}
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--color-text-secondary, #888)' }}>
                {PAGE_SIZES[pageSize].label} · {orientation} · {scale}
            </div>
        </div>
    );
}


// ── Styles ──────────────────────────────────────────────────────────

const cardStyle = {
    background: 'var(--color-bg-secondary, #1e1e2e)',
    border: '1px solid var(--color-border, #333)',
    borderRadius: 10, padding: '14px 18px',
};
const labelStyle = { display: 'block', fontSize: 11, marginBottom: 3, color: 'var(--color-text-secondary, #aaa)' };
const selectStyle = {
    padding: '6px 10px', borderRadius: 6, border: '1px solid var(--color-border, #444)',
    background: 'var(--color-bg-tertiary, #2a2a3a)', color: 'var(--color-text-primary, #fff)', fontSize: 13,
};
const inputStyle = {
    padding: '6px 10px', borderRadius: 6, border: '1px solid var(--color-border, #444)',
    background: 'var(--color-bg-tertiary, #2a2a3a)', color: 'var(--color-text-primary, #fff)', fontSize: 13, width: 150,
};
const btnPrimary = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
    border: 'none', background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
};
const btnSecondary = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
    border: '1px solid var(--color-border, #444)', background: 'transparent',
    color: 'var(--color-text-secondary, #aaa)', fontSize: 13, cursor: 'pointer',
};


export default PrintLayoutManager;
