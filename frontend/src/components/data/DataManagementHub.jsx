/**
 * DataManagementHub.jsx — Issue #72
 *
 * Centralized data management UI:
 *  - Tabbed dataset browser (boreholes, surfaces, block models, equipment, etc.)
 *  - CRUD operations for each dataset type
 *  - Import/export with format selection
 *  - Search and filtering
 *  - Bulk operations (delete, archive, tag)
 *  - Data quality indicators
 */

import React, { useState, useMemo } from 'react';
import {
    Database, Search, Plus, Trash2, Download, Upload,
    Filter, Tag, Archive, RefreshCw, ChevronDown,
    FileText, Map, Layers, Truck, Target, BarChart3,
    Clock, CheckCircle, AlertTriangle, XCircle
} from 'lucide-react';

const DATASET_TYPES = [
    { id: 'boreholes', label: 'Boreholes', icon: Target, count: 128, color: '#3b82f6' },
    { id: 'surfaces', label: 'Surfaces', icon: Layers, count: 24, color: '#8b5cf6' },
    { id: 'block_models', label: 'Block Models', icon: Database, count: 8, color: '#22c55e' },
    { id: 'equipment', label: 'Equipment', icon: Truck, count: 45, color: '#f59e0b' },
    { id: 'drill_blast', label: 'Drill & Blast', icon: Target, count: 32, color: '#ef4444' },
    { id: 'quality', label: 'Quality Data', icon: BarChart3, count: 256, color: '#06b6d4' },
    { id: 'documents', label: 'Documents', icon: FileText, count: 67, color: '#a855f7' },
    { id: 'maps', label: 'Maps & Plans', icon: Map, count: 15, color: '#10b981' },
];

const QUALITY_STATUS = {
    good: { icon: CheckCircle, color: '#22c55e', label: 'Good' },
    warning: { icon: AlertTriangle, color: '#f59e0b', label: 'Warning' },
    error: { icon: XCircle, color: '#ef4444', label: 'Error' },
};

const DEMO_RECORDS = {
    boreholes: [
        { id: 'BH-001', name: 'BH-001', modified: '2026-02-20', size: '12 KB', quality: 'good', tags: ['coal', 'shaft-1'] },
        { id: 'BH-002', name: 'BH-002', modified: '2026-02-19', size: '14 KB', quality: 'good', tags: ['coal', 'shaft-1'] },
        { id: 'BH-003', name: 'BH-003', modified: '2026-02-18', size: '9 KB', quality: 'warning', tags: ['coal', 'shaft-2'] },
        { id: 'BH-004', name: 'BH-004', modified: '2026-02-15', size: '11 KB', quality: 'error', tags: ['coal'] },
        { id: 'BH-005', name: 'BH-005', modified: '2026-02-14', size: '16 KB', quality: 'good', tags: ['exploration'] },
    ],
    surfaces: [
        { id: 'SRF-01', name: 'Current Topo', modified: '2026-02-21', size: '2.4 MB', quality: 'good', tags: ['terrain'] },
        { id: 'SRF-02', name: 'Pit Design Y1', modified: '2026-02-20', size: '1.8 MB', quality: 'good', tags: ['design'] },
        { id: 'SRF-03', name: 'Waste Dump Design', modified: '2026-02-17', size: '900 KB', quality: 'warning', tags: ['design', 'dump'] },
    ],
    block_models: [
        { id: 'BM-01', name: 'Main Seam Model', modified: '2026-02-22', size: '45 MB', quality: 'good', tags: ['coal', 'production'] },
        { id: 'BM-02', name: 'Overburden Model', modified: '2026-02-18', size: '38 MB', quality: 'good', tags: ['waste'] },
    ],
    equipment: [
        { id: 'EQ-01', name: 'CAT 789D #101', modified: '2026-02-22', size: '—', quality: 'good', tags: ['hauler'] },
        { id: 'EQ-02', name: 'Liebherr R9800 #201', modified: '2026-02-22', size: '—', quality: 'good', tags: ['excavator'] },
        { id: 'EQ-03', name: 'CAT D10T #301', modified: '2026-02-21', size: '—', quality: 'warning', tags: ['dozer'] },
    ],
};

const IMPORT_FORMATS = {
    boreholes: ['CSV', 'TXT', 'LAS', 'DXF'],
    surfaces: ['DTM', 'GeoTIFF', 'ASC', 'DXF'],
    block_models: ['CSV', 'BMF', 'Datamine'],
    equipment: ['CSV', 'JSON'],
    drill_blast: ['CSV', 'JSON'],
    quality: ['CSV', 'XLSX'],
    documents: ['PDF', 'DOCX'],
    maps: ['DXF', 'GeoTIFF', 'ECW'],
};


export default function DataManagementHub({ siteId }) {
    const [activeType, setActiveType] = useState('boreholes');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [showImport, setShowImport] = useState(false);
    const [filterTag, setFilterTag] = useState(null);

    const records = DEMO_RECORDS[activeType] || [];
    const filtered = useMemo(() => {
        let r = records;
        if (searchTerm) r = r.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (filterTag) r = r.filter(d => d.tags?.includes(filterTag));
        return r;
    }, [records, searchTerm, filterTag]);

    const allTags = useMemo(() => {
        const tags = new Set();
        records.forEach(r => r.tags?.forEach(t => tags.add(t)));
        return [...tags].sort();
    }, [records]);

    const toggleSelect = (id) => {
        const next = new Set(selectedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedIds(next);
    };

    const toggleAll = () => {
        if (selectedIds.size === filtered.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filtered.map(r => r.id)));
    };

    return (
        <div style={{ padding: 20, maxWidth: 1050, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                    <Database size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Data Management Hub
                </h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowImport(!showImport)} style={btnPrimary}>
                        <Upload size={13} /> Import
                    </button>
                    <button style={btnSecondary} disabled={selectedIds.size === 0}>
                        <Download size={13} /> Export ({selectedIds.size})
                    </button>
                </div>
            </div>

            {/* Dataset type tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
                {DATASET_TYPES.map(dt => (
                    <button key={dt.id} onClick={() => { setActiveType(dt.id); setSelectedIds(new Set()); setFilterTag(null); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                            background: dt.id === activeType ? `${dt.color}20` : 'var(--color-bg-tertiary, #2a2a3a)',
                            color: dt.id === activeType ? dt.color : 'var(--color-text-secondary, #aaa)',
                            outline: dt.id === activeType ? `1px solid ${dt.color}40` : 'none',
                        }}>
                        <dt.icon size={12} />
                        {dt.label}
                        <span style={{
                            background: dt.id === activeType ? `${dt.color}30` : 'var(--color-bg-secondary, #1e1e2e)',
                            padding: '1px 6px', borderRadius: 10, fontSize: 9,
                        }}>{dt.count}</span>
                    </button>
                ))}
            </div>

            {/* Import panel */}
            {showImport && (
                <div style={{ ...card, marginBottom: 12, border: '1px solid rgba(59,130,246,0.3)' }}>
                    <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary, #fff)', margin: '0 0 8px' }}>
                        Import {DATASET_TYPES.find(d => d.id === activeType)?.label}
                    </h4>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--color-text-secondary, #888)' }}>Supported formats:</span>
                        {(IMPORT_FORMATS[activeType] || []).map(fmt => (
                            <span key={fmt} style={{
                                fontSize: 10, padding: '2px 8px', borderRadius: 6,
                                background: 'var(--color-bg-tertiary, #2a2a3a)',
                                color: 'var(--color-text-primary, #ddd)',
                            }}>{fmt}</span>
                        ))}
                        <div style={{ flex: 1 }} />
                        <button style={btnPrimary}><Upload size={11} /> Choose Files</button>
                    </div>
                </div>
            )}

            {/* Search + filter bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: 9, color: 'var(--color-text-secondary, #666)' }} />
                    <input
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        placeholder={`Search ${DATASET_TYPES.find(d => d.id === activeType)?.label}...`}
                        style={{ ...inputStyle, paddingLeft: 30, width: '100%' }}
                    />
                </div>
                {allTags.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <Filter size={12} color="var(--color-text-secondary, #888)" />
                        {allTags.map(tag => (
                            <button key={tag} onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                                style={{
                                    fontSize: 10, padding: '3px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                                    background: filterTag === tag ? 'rgba(59,130,246,0.2)' : 'var(--color-bg-tertiary, #2a2a3a)',
                                    color: filterTag === tag ? '#3b82f6' : 'var(--color-text-secondary, #aaa)',
                                }}>
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Bulk actions bar */}
            {selectedIds.size > 0 && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px',
                    background: 'rgba(59,130,246,0.08)', borderRadius: 8, marginBottom: 8,
                    fontSize: 11, color: '#3b82f6',
                }}>
                    <span style={{ fontWeight: 600 }}>{selectedIds.size} selected</span>
                    <button style={bulkBtn}><Tag size={10} /> Tag</button>
                    <button style={bulkBtn}><Archive size={10} /> Archive</button>
                    <button style={{ ...bulkBtn, color: '#ef4444' }}><Trash2 size={10} /> Delete</button>
                </div>
            )}

            {/* Data table */}
            <div style={card}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border, #333)' }}>
                            <th style={{ ...th, width: 30 }}>
                                <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0}
                                    onChange={toggleAll} />
                            </th>
                            <th style={th}>Name</th>
                            <th style={th}>Modified</th>
                            <th style={th}>Size</th>
                            <th style={th}>Quality</th>
                            <th style={th}>Tags</th>
                            <th style={{ ...th, width: 80 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(r => {
                            const qStatus = QUALITY_STATUS[r.quality] || QUALITY_STATUS.good;
                            const QIcon = qStatus.icon;
                            return (
                                <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border, #222)' }}>
                                    <td style={td}>
                                        <input type="checkbox" checked={selectedIds.has(r.id)}
                                            onChange={() => toggleSelect(r.id)} />
                                    </td>
                                    <td style={{ ...td, fontWeight: 600, color: 'var(--color-text-primary, #fff)' }}>{r.name}</td>
                                    <td style={td}>
                                        <Clock size={10} style={{ marginRight: 4, opacity: 0.5 }} />
                                        {r.modified}
                                    </td>
                                    <td style={td}>{r.size}</td>
                                    <td style={td}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: qStatus.color }}>
                                            <QIcon size={12} /> {qStatus.label}
                                        </span>
                                    </td>
                                    <td style={td}>
                                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                            {r.tags?.map(t => (
                                                <span key={t} style={{
                                                    fontSize: 9, padding: '1px 5px', borderRadius: 4,
                                                    background: 'var(--color-bg-tertiary, #2a2a3a)',
                                                    color: 'var(--color-text-secondary, #aaa)',
                                                }}>{t}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={td}>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button style={iconBtn} title="Download"><Download size={12} /></button>
                                            <button style={iconBtn} title="Delete"><Trash2 size={12} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ ...td, textAlign: 'center', padding: 30, color: 'var(--color-text-secondary, #666)' }}>
                                    No records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--color-text-secondary, #666)' }}>
                <span>{filtered.length} records shown</span>
                <span>Last synced: {new Date().toLocaleTimeString()}</span>
            </div>
        </div>
    );
}

const card = { background: 'var(--color-bg-secondary, #1e1e2e)', border: '1px solid var(--color-border, #333)', borderRadius: 10, padding: 0, overflow: 'hidden' };
const th = { textAlign: 'left', padding: '10px 8px', color: 'var(--color-text-secondary, #888)', fontWeight: 600, fontSize: 11 };
const td = { padding: '8px', color: 'var(--color-text-primary, #ddd)' };
const inputStyle = { padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border, #444)', background: 'var(--color-bg-tertiary, #2a2a3a)', color: 'var(--color-text-primary, #fff)', fontSize: 12, outline: 'none' };
const btnPrimary = { display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' };
const btnSecondary = { display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border, #444)', background: 'transparent', color: 'var(--color-text-primary, #ddd)', fontSize: 11, fontWeight: 600, cursor: 'pointer' };
const bulkBtn = { display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 6, border: 'none', background: 'transparent', color: '#3b82f6', fontSize: 10, cursor: 'pointer' };
const iconBtn = { padding: 4, borderRadius: 4, border: 'none', background: 'transparent', color: 'var(--color-text-secondary, #888)', cursor: 'pointer' };
