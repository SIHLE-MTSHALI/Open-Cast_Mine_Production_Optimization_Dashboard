/**
 * DXFEditorPanel.jsx — Issue #67
 *
 * DXF file management panel with:
 *  - Import preview with layer filter
 *  - Layer inspector (entity counts, types)
 *  - Export options: version selection, contour export, surface export
 *  - Create new DXF from geometry
 */

import React, { useState, useCallback } from 'react';
import {
    Upload,
    Download,
    Layers,
    FileText,
    Check,
    AlertCircle,
    Loader2,
    Eye,
    EyeOff,
    Plus,
    Settings,
    Maximize2
} from 'lucide-react';

const API_BASE = '/api';

const DXF_VERSIONS = [
    { value: 'R12', label: 'R12 (AutoCAD 12)' },
    { value: 'R2000', label: 'R2000 (AutoCAD 2000)' },
    { value: 'R2018', label: 'R2018 (AutoCAD 2018 — recommended)' },
];

// ── Sub-components ───────────────────────────────────────────────────

/** Layer row in the import preview */
const LayerRow = ({ layer, enabled, onToggle }) => {
    const typeList = Object.entries(layer.types || {})
        .map(([t, c]) => `${c} ${t}`)
        .join(', ');

    return (
        <div className={`dxf-layer-row ${enabled ? '' : 'disabled'}`} onClick={onToggle}>
            <div className="dxf-layer-vis">
                {enabled ? <Eye size={14} /> : <EyeOff size={14} />}
            </div>
            <div className="dxf-layer-info">
                <span className="dxf-layer-name">{layer.name}</span>
                <span className="dxf-layer-stats">
                    {layer.entity_count} entities · {layer.point_count} pts · {typeList}
                </span>
            </div>
        </div>
    );
};

// ── Main Component ───────────────────────────────────────────────────

const DXFEditorPanel = ({
    surfaces = [],
    onImport,
}) => {
    // Mode
    const [mode, setMode] = useState('import'); // import | export | create

    // Import state
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [enabledLayers, setEnabledLayers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    // Export state
    const [exportVersion, setExportVersion] = useState('R2018');
    const [exportType, setExportType] = useState('surface'); // surface | contours
    const [exportSurfaceId, setExportSurfaceId] = useState('');
    const [contourInterval, setContourInterval] = useState(5);
    const [majorInterval, setMajorInterval] = useState(25);
    const [exporting, setExporting] = useState(false);

    // ── Import handlers ──────────────────────────────────────
    const handleFileSelect = useCallback(async (e) => {
        const f = e.target?.files?.[0] || e.dataTransfer?.files?.[0];
        if (!f) return;
        setFile(f);
        setError(null);
        setResult(null);
        setPreview(null);

        // Get layer preview
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('file', f);

            const res = await fetch(`${API_BASE}/file-format/parse/dxf/preview`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to preview DXF');
            }

            const data = await res.json();
            setPreview(data);

            // Enable all layers by default
            const enabled = {};
            (data.layers || []).forEach(l => { enabled[l.name] = true; });
            setEnabledLayers(enabled);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleLayer = (name) => {
        setEnabledLayers(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const toggleAllLayers = (on) => {
        const updated = {};
        (preview?.layers || []).forEach(l => { updated[l.name] = on; });
        setEnabledLayers(updated);
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Include selected layers as query param
            const selectedLayers = Object.entries(enabledLayers)
                .filter(([, v]) => v)
                .map(([k]) => k);

            const res = await fetch(
                `${API_BASE}/file-format/parse/dxf?layers=${encodeURIComponent(selectedLayers.join(','))}`,
                { method: 'POST', body: formData }
            );

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Import failed');
            }

            const data = await res.json();
            setResult(data);
            onImport?.(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Export handlers ──────────────────────────────────────
    const handleExport = async () => {
        if (!exportSurfaceId) return;
        setExporting(true);
        setError(null);

        try {
            let url, body;

            if (exportType === 'contours') {
                url = `${API_BASE}/file-format/export/dxf/contours-body`;
                body = JSON.stringify({
                    contours: [],  // Would be populated from surface contour generation
                    major_interval: majorInterval,
                    version: exportVersion,
                });
            } else {
                url = `${API_BASE}/surfaces/${exportSurfaceId}/export?format=dxf`;
            }

            const res = await fetch(url, {
                method: exportType === 'contours' ? 'POST' : 'GET',
                headers: exportType === 'contours' ? { 'Content-Type': 'application/json' } : {},
                body: exportType === 'contours' ? body : undefined,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Export failed');
            }

            const blob = await res.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `export.dxf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);

            setResult({ exported: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setExporting(false);
        }
    };

    // ── Render ───────────────────────────────────────────────
    const selectedCount = Object.values(enabledLayers).filter(Boolean).length;
    const totalLayers = preview?.layers?.length || 0;

    return (
        <div className="dxf-panel">
            <div className="dxf-header">
                <FileText size={22} />
                <h3>DXF File Manager</h3>
            </div>

            {/* Mode tabs */}
            <div className="dxf-tabs">
                {[
                    { id: 'import', icon: Upload, label: 'Import' },
                    { id: 'export', icon: Download, label: 'Export' },
                    { id: 'create', icon: Plus, label: 'Create New' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={`dxf-tab ${mode === tab.id ? 'active' : ''}`}
                        onClick={() => { setMode(tab.id); setError(null); setResult(null); }}
                    >
                        <tab.icon size={15} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* ── IMPORT ── */}
            {mode === 'import' && (
                <div className="dxf-body">
                    <div className="dxf-drop">
                        <input
                            type="file"
                            accept=".dxf"
                            onChange={handleFileSelect}
                            id="dxf-file-input"
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="dxf-file-input" className="dxf-drop-label">
                            {loading ? <Loader2 className="spin" size={24} /> : <Upload size={24} />}
                            <p>Drop .dxf file or click to browse</p>
                        </label>
                    </div>

                    {/* Layer preview */}
                    {preview && (
                        <div className="dxf-layers-panel">
                            <div className="dxf-layers-header">
                                <Layers size={14} />
                                <span>Layers ({selectedCount}/{totalLayers})</span>
                                <div className="dxf-layers-actions">
                                    <button onClick={() => toggleAllLayers(true)}>All</button>
                                    <button onClick={() => toggleAllLayers(false)}>None</button>
                                </div>
                            </div>

                            <div className="dxf-meta-row">
                                <span>Version: {preview.version}</span>
                                <span>{preview.total_entities} entities</span>
                            </div>

                            {preview.extent_min && (
                                <div className="dxf-meta-row">
                                    <span>
                                        <Maximize2 size={12} /> X: {preview.extent_min[0].toFixed(1)}–{preview.extent_max[0].toFixed(1)}
                                    </span>
                                    <span>
                                        Y: {preview.extent_min[1].toFixed(1)}–{preview.extent_max[1].toFixed(1)}
                                    </span>
                                </div>
                            )}

                            <div className="dxf-layer-list">
                                {preview.layers.map(l => (
                                    <LayerRow
                                        key={l.name}
                                        layer={l}
                                        enabled={enabledLayers[l.name]}
                                        onToggle={() => toggleLayer(l.name)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        className="dxf-action-btn"
                        onClick={handleImport}
                        disabled={!file || loading || selectedCount === 0}
                    >
                        {loading
                            ? <><Loader2 size={16} className="spin" /> Importing…</>
                            : <><Upload size={16} /> Import Selected Layers</>
                        }
                    </button>
                </div>
            )}

            {/* ── EXPORT ── */}
            {mode === 'export' && (
                <div className="dxf-body">
                    <div className="dxf-input-group">
                        <label><Settings size={14} /> DXF Version</label>
                        <select value={exportVersion} onChange={e => setExportVersion(e.target.value)}>
                            {DXF_VERSIONS.map(v => (
                                <option key={v.value} value={v.value}>{v.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="dxf-input-group">
                        <label>Export Type</label>
                        <div className="dxf-radio-group">
                            {[
                                { id: 'surface', label: 'TIN Surface (3DFaces)' },
                                { id: 'contours', label: 'Contour Lines' },
                            ].map(opt => (
                                <label key={opt.id} className="dxf-radio">
                                    <input
                                        type="radio"
                                        name="exportType"
                                        checked={exportType === opt.id}
                                        onChange={() => setExportType(opt.id)}
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="dxf-input-group">
                        <label>Select Surface</label>
                        <select value={exportSurfaceId} onChange={e => setExportSurfaceId(e.target.value)}>
                            <option value="">Choose a surface…</option>
                            {surfaces.map(s => (
                                <option key={s.surface_id} value={s.surface_id}>
                                    {s.name} ({s.vertex_count || '?'} vertices)
                                </option>
                            ))}
                        </select>
                    </div>

                    {exportType === 'contours' && (
                        <>
                            <div className="dxf-input-group">
                                <label>Contour Interval</label>
                                <input type="number" value={contourInterval} onChange={e => setContourInterval(Number(e.target.value))} min={0.5} step={0.5} />
                            </div>
                            <div className="dxf-input-group">
                                <label>Major Interval</label>
                                <input type="number" value={majorInterval} onChange={e => setMajorInterval(Number(e.target.value))} min={1} step={1} />
                            </div>
                        </>
                    )}

                    <button
                        className="dxf-action-btn"
                        onClick={handleExport}
                        disabled={!exportSurfaceId || exporting}
                    >
                        {exporting
                            ? <><Loader2 size={16} className="spin" /> Exporting…</>
                            : <><Download size={16} /> Export DXF</>
                        }
                    </button>
                </div>
            )}

            {/* ── CREATE NEW ── */}
            {mode === 'create' && (
                <div className="dxf-body">
                    <div className="dxf-info-box">
                        <Plus size={16} />
                        <div>
                            <strong>Create New DXF</strong>
                            <p>
                                Use the 3D canvas tools to draw polylines, points, and text annotations.
                                Then export your geometry as a DXF file using the Export tab.
                            </p>
                        </div>
                    </div>

                    <div className="dxf-input-group">
                        <label><Settings size={14} /> DXF Version for New Files</label>
                        <select value={exportVersion} onChange={e => setExportVersion(e.target.value)}>
                            {DXF_VERSIONS.map(v => (
                                <option key={v.value} value={v.value}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* ── Error / Success ── */}
            {error && (
                <div className="dxf-error">
                    <AlertCircle size={14} /> {error}
                </div>
            )}
            {result && !result.exported && (
                <div className="dxf-success">
                    <Check size={14} />
                    <div>
                        <strong>Import Complete</strong>
                        <span>{result.entity_count} entities across {result.layers?.length || 0} layers</span>
                    </div>
                </div>
            )}
            {result?.exported && (
                <div className="dxf-success">
                    <Check size={14} /> DXF exported successfully.
                </div>
            )}

            {/* ── Styles ── */}
            <style>{`
                .dxf-panel {
                    background: #1a1a2e;
                    border-radius: 12px;
                    padding: 22px;
                    color: #e0e0e0;
                }
                .dxf-header { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
                .dxf-header h3 { margin: 0; font-size: 1.15rem; }

                .dxf-tabs { display: flex; gap: 6px; margin-bottom: 18px; }
                .dxf-tab {
                    flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
                    padding: 9px; background: #2a2a4a; border: 1px solid #3a3a5a;
                    border-radius: 8px; color: #a0a0c0; cursor: pointer; transition: all .2s; font-size: .88rem;
                }
                .dxf-tab:hover { background: #3a3a5a; }
                .dxf-tab.active { background: #4040a0; border-color: #6060c0; color: #fff; }

                .dxf-body { display: flex; flex-direction: column; gap: 14px; }

                /* Drop zone */
                .dxf-drop {
                    border: 2px dashed #4a4a6a; border-radius: 12px; padding: 24px;
                    text-align: center; cursor: pointer; transition: all .2s;
                }
                .dxf-drop:hover { border-color: #6060a0; background: rgba(96,96,160,.08); }
                .dxf-drop-label {
                    display: flex; flex-direction: column; align-items: center; gap: 8px;
                    cursor: pointer; color: #a0a0c0;
                }
                .dxf-drop-label p { margin: 0; font-size: .9rem; }

                /* Layers panel */
                .dxf-layers-panel {
                    background: #2a2a4a; border-radius: 10px; overflow: hidden;
                }
                .dxf-layers-header {
                    display: flex; align-items: center; gap: 8px; padding: 10px 12px;
                    border-bottom: 1px solid #3a3a5a; font-size: .85rem; color: #a0a0c0;
                }
                .dxf-layers-actions { margin-left: auto; display: flex; gap: 6px; }
                .dxf-layers-actions button {
                    background: none; border: none; color: #6080c0; cursor: pointer; font-size: .8rem;
                }
                .dxf-meta-row {
                    display: flex; justify-content: space-between; padding: 6px 12px;
                    font-size: .75rem; color: #6060a0;
                }
                .dxf-meta-row span { display: flex; align-items: center; gap: 4px; }
                .dxf-layer-list { max-height: 200px; overflow-y: auto; }
                .dxf-layer-row {
                    display: flex; align-items: center; gap: 10px; padding: 8px 12px;
                    cursor: pointer; border-bottom: 1px solid #2a2a3a; transition: background .15s;
                }
                .dxf-layer-row:hover { background: #33334d; }
                .dxf-layer-row.disabled { opacity: .45; }
                .dxf-layer-vis { color: #6060a0; }
                .dxf-layer-info { display: flex; flex-direction: column; gap: 2px; }
                .dxf-layer-name { font-size: .88rem; font-weight: 500; }
                .dxf-layer-stats { font-size: .7rem; color: #6060a0; }

                /* Inputs */
                .dxf-input-group { display: flex; flex-direction: column; gap: 5px; }
                .dxf-input-group label {
                    display: flex; align-items: center; gap: 6px;
                    font-size: .85rem; color: #a0a0c0;
                }
                .dxf-input-group input,
                .dxf-input-group select {
                    padding: 9px 12px; background: #2a2a4a;
                    border: 1px solid #3a3a5a; border-radius: 8px;
                    color: #e0e0e0; font-size: .9rem;
                }
                .dxf-radio-group { display: flex; gap: 14px; }
                .dxf-radio { display: flex; align-items: center; gap: 6px; font-size: .88rem; cursor: pointer; color: #c0c0e0; }
                .dxf-radio input { accent-color: #6060c0; }

                /* Info box */
                .dxf-info-box {
                    display: flex; gap: 12px; padding: 14px;
                    background: #2a2a4a; border-radius: 10px; font-size: .88rem;
                }
                .dxf-info-box p { margin: 6px 0 0; font-size: .8rem; color: #8080a0; }

                /* Action button */
                .dxf-action-btn {
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    width: 100%; padding: 13px;
                    background: linear-gradient(135deg, #4040a0, #6060c0);
                    border: none; border-radius: 8px; color: #fff;
                    font-size: .95rem; font-weight: 500; cursor: pointer; transition: all .2s;
                }
                .dxf-action-btn:hover:not(:disabled) {
                    background: linear-gradient(135deg, #5050b0, #7070d0);
                }
                .dxf-action-btn:disabled { opacity: .5; cursor: not-allowed; }

                /* Messages */
                .dxf-error {
                    display: flex; align-items: center; gap: 8px; padding: 12px 14px;
                    background: #4a2a2a; border: 1px solid #6a3a3a; border-radius: 8px;
                    color: #ff8080; margin-top: 10px; font-size: .86rem;
                }
                .dxf-success {
                    display: flex; align-items: center; gap: 10px; padding: 12px 14px;
                    background: #2a4a2a; border: 1px solid #3a6a3a; border-radius: 8px;
                    color: #80ff80; margin-top: 10px; font-size: .86rem;
                }
                .dxf-success div { display: flex; flex-direction: column; gap: 2px; }
                .dxf-success span { font-size: .8rem; color: #60c060; }

                .spin { animation: dxf-spin 1s linear infinite; }
                @keyframes dxf-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default DXFEditorPanel;
