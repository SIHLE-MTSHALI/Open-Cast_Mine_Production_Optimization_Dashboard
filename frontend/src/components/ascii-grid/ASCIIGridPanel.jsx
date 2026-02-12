/**
 * ASCIIGridPanel.jsx — Issue #68
 *
 * Full ASCII Grid (.asc) import/export panel with:
 *  - File upload with drag-and-drop
 *  - Grid metadata preview (resolution, extent, nodata, min/max Z)
 *  - CRS assignment on import
 *  - Export any surface to .asc format
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
    Upload,
    Grid,
    Download,
    Check,
    AlertCircle,
    Loader2,
    Eye,
    Info,
    Globe
} from 'lucide-react';

const API_BASE = '/api';

// ── Helpers ──────────────────────────────────────────────────────────
function formatNumber(v, decimals = 2) {
    return v != null ? Number(v).toFixed(decimals) : '—';
}

function fileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Sub-components ───────────────────────────────────────────────────

/** File upload drop-zone */
const DropZone = ({ onFileSelect, uploading }) => {
    const [active, setActive] = useState(false);

    const onDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setActive(e.type === 'dragenter' || e.type === 'dragover');
    }, []);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setActive(false);
        if (e.dataTransfer?.files?.length) onFileSelect(e.dataTransfer.files[0]);
    }, [onFileSelect]);

    return (
        <div
            className={`asc-dropzone ${active ? 'active' : ''}`}
            onDragEnter={onDrag}
            onDragOver={onDrag}
            onDragLeave={onDrag}
            onDrop={onDrop}
        >
            <input
                type="file"
                accept=".asc,.xyz,.txt,.dat"
                onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
                id="asc-file-input"
                style={{ display: 'none' }}
            />
            <label htmlFor="asc-file-input" className="asc-dz-label">
                {uploading
                    ? <Loader2 className="spin" size={28} />
                    : <Upload size={28} />
                }
                <p>Drop .asc / .xyz file here or click to browse</p>
                <span className="asc-dz-hint">Supported: .asc, .xyz, .txt, .dat</span>
            </label>
        </div>
    );
};

/** Metadata card */
const GridMetadata = ({ meta }) => {
    if (!meta) return null;
    return (
        <div className="asc-meta-grid">
            <div className="asc-meta-item">
                <span className="meta-label">Columns × Rows</span>
                <span className="meta-value">{meta.ncols} × {meta.nrows}</span>
            </div>
            <div className="asc-meta-item">
                <span className="meta-label">Cell Size</span>
                <span className="meta-value">{formatNumber(meta.cellsize, 3)}</span>
            </div>
            <div className="asc-meta-item">
                <span className="meta-label">Origin (X, Y)</span>
                <span className="meta-value">{formatNumber(meta.xllcorner)} , {formatNumber(meta.yllcorner)}</span>
            </div>
            <div className="asc-meta-item">
                <span className="meta-label">Extent X</span>
                <span className="meta-value">{formatNumber(meta.xllcorner)} → {formatNumber(meta.xmax)}</span>
            </div>
            <div className="asc-meta-item">
                <span className="meta-label">Extent Y</span>
                <span className="meta-value">{formatNumber(meta.yllcorner)} → {formatNumber(meta.ymax)}</span>
            </div>
            <div className="asc-meta-item">
                <span className="meta-label">NODATA</span>
                <span className="meta-value">{meta.nodata_value}</span>
            </div>
            <div className="asc-meta-item">
                <span className="meta-label">Z Range</span>
                <span className="meta-value">{formatNumber(meta.z_min)} – {formatNumber(meta.z_max)}</span>
            </div>
            <div className="asc-meta-item">
                <span className="meta-label">Total Points</span>
                <span className="meta-value">{(meta.ncols * meta.nrows).toLocaleString()}</span>
            </div>
        </div>
    );
};

// ── Main Component ───────────────────────────────────────────────────

const ASCIIGridPanel = ({
    siteId,
    surfaces = [],
    onSurfaceCreated,
    availableCRS = [],
}) => {
    // ── State ────────────────────────────────────────────────
    const [mode, setMode] = useState('import'); // 'import' | 'export'
    const [file, setFile] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [selectedCRS, setSelectedCRS] = useState('');
    const [surfaceName, setSurfaceName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    // Export state
    const [exportSurfaceId, setExportSurfaceId] = useState('');
    const [exportCellSize, setExportCellSize] = useState(10);
    const [exporting, setExporting] = useState(false);

    // CRS list
    const [crsList, setCrsList] = useState(availableCRS);

    useEffect(() => {
        if (crsList.length === 0) {
            fetch(`${API_BASE}/crs/supported`)
                .then(r => r.ok ? r.json() : [])
                .then(data => setCrsList(Array.isArray(data) ? data : data.systems || []))
                .catch(() => { });
        }
    }, [crsList.length]);

    // ── Import ───────────────────────────────────────────────

    const handleFileSelect = useCallback(async (selectedFile) => {
        setFile(selectedFile);
        setError(null);
        setResult(null);
        setSurfaceName(selectedFile.name.replace(/\.\w+$/, ''));

        // Parse and preview
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('file', selectedFile);

            const res = await fetch(`${API_BASE}/file-format/parse/ascii`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to parse file');
            }

            const data = await res.json();

            // Build metadata from parse response
            if (data.grid) {
                setMetadata({
                    ncols: data.grid.ncols,
                    nrows: data.grid.nrows,
                    cellsize: data.grid.cellsize,
                    xllcorner: data.grid.xllcorner,
                    yllcorner: data.grid.yllcorner,
                    xmax: data.grid.xllcorner + data.grid.ncols * data.grid.cellsize,
                    ymax: data.grid.yllcorner + data.grid.nrows * data.grid.cellsize,
                    nodata_value: data.grid.nodata_value,
                    z_min: data.extent_min?.[2],
                    z_max: data.extent_max?.[2],
                });
            } else if (data.point_count) {
                // XYZ parse result
                setMetadata({
                    ncols: '—',
                    nrows: '—',
                    cellsize: '—',
                    xllcorner: data.extent_min?.[0],
                    yllcorner: data.extent_min?.[1],
                    xmax: data.extent_max?.[0],
                    ymax: data.extent_max?.[1],
                    nodata_value: '—',
                    z_min: data.extent_min?.[2],
                    z_max: data.extent_max?.[2],
                });
            }
        } catch (err) {
            // Fallback: read first lines locally
            try {
                const text = await selectedFile.text();
                const lines = text.split('\n').slice(0, 10);
                setMetadata({ raw_preview: lines });
            } catch {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            let url = `${API_BASE}/surfaces/create-from-file?site_id=${siteId}&name=${encodeURIComponent(surfaceName || file.name)}&surface_type=terrain`;
            if (selectedCRS) {
                url += `&crs=${selectedCRS}`;
            }

            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Import failed');
            }

            const data = await response.json();
            setResult(data);
            onSurfaceCreated?.(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Export ────────────────────────────────────────────────

    const handleExport = async () => {
        if (!exportSurfaceId) return;
        setExporting(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_BASE}/csv/export/surface/${exportSurfaceId}`
            );

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Export failed');
            }

            // Download the CSV blob
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `surface_export.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setResult({ exported: true, surface_id: exportSurfaceId });
        } catch (err) {
            setError(err.message);
        } finally {
            setExporting(false);
        }
    };

    // ── Render ────────────────────────────────────────────────

    return (
        <div className="asc-panel">
            <div className="asc-header">
                <Grid size={22} />
                <h3>ASCII Grid (.asc)</h3>
            </div>

            {/* Mode tabs */}
            <div className="asc-tabs">
                <button
                    className={`asc-tab ${mode === 'import' ? 'active' : ''}`}
                    onClick={() => { setMode('import'); setError(null); setResult(null); }}
                >
                    <Upload size={16} /> Import
                </button>
                <button
                    className={`asc-tab ${mode === 'export' ? 'active' : ''}`}
                    onClick={() => { setMode('export'); setError(null); setResult(null); }}
                >
                    <Download size={16} /> Export
                </button>
            </div>

            {/* ── Import Mode ─────────────────────────────────── */}
            {mode === 'import' && (
                <div className="asc-body">
                    <DropZone onFileSelect={handleFileSelect} uploading={loading} />

                    {file && (
                        <div className="asc-file-info">
                            <Eye size={14} />
                            <span>{file.name}</span>
                            <span className="asc-file-size">{fileSize(file.size)}</span>
                        </div>
                    )}

                    {/* Metadata preview */}
                    {metadata && !metadata.raw_preview && (
                        <div className="asc-preview">
                            <div className="asc-preview-title">
                                <Info size={14} /> Grid Metadata
                            </div>
                            <GridMetadata meta={metadata} />
                        </div>
                    )}

                    {/* Raw preview fallback */}
                    {metadata?.raw_preview && (
                        <pre className="asc-raw-preview">
                            {metadata.raw_preview.join('\n')}
                        </pre>
                    )}

                    {/* CRS Selection */}
                    <div className="asc-input-group">
                        <label><Globe size={14} /> Coordinate Reference System</label>
                        <select
                            value={selectedCRS}
                            onChange={(e) => setSelectedCRS(e.target.value)}
                        >
                            <option value="">Auto-detect / None</option>
                            {crsList.map(crs => (
                                <option key={crs.epsg || crs.code} value={crs.epsg || crs.code}>
                                    EPSG:{crs.epsg || crs.code} — {crs.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Surface name */}
                    <div className="asc-input-group">
                        <label>Surface Name</label>
                        <input
                            type="text"
                            value={surfaceName}
                            onChange={(e) => setSurfaceName(e.target.value)}
                            placeholder="Enter surface name…"
                        />
                    </div>

                    <button
                        className="asc-action-btn"
                        onClick={handleImport}
                        disabled={!file || loading}
                    >
                        {loading
                            ? <><Loader2 size={16} className="spin" /> Importing…</>
                            : <><Grid size={16} /> Import as Surface</>
                        }
                    </button>
                </div>
            )}

            {/* ── Export Mode ─────────────────────────────────── */}
            {mode === 'export' && (
                <div className="asc-body">
                    <div className="asc-input-group">
                        <label>Select Surface to Export</label>
                        <select
                            value={exportSurfaceId}
                            onChange={(e) => setExportSurfaceId(e.target.value)}
                        >
                            <option value="">Choose a surface…</option>
                            {surfaces.map(s => (
                                <option key={s.surface_id} value={s.surface_id}>
                                    {s.name} ({s.vertex_count || '?'} vertices)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="asc-input-group">
                        <label>Cell Size (for gridding)</label>
                        <input
                            type="number"
                            value={exportCellSize}
                            onChange={(e) => setExportCellSize(Number(e.target.value))}
                            min={0.1}
                            step={1}
                        />
                    </div>

                    <button
                        className="asc-action-btn"
                        onClick={handleExport}
                        disabled={!exportSurfaceId || exporting}
                    >
                        {exporting
                            ? <><Loader2 size={16} className="spin" /> Exporting…</>
                            : <><Download size={16} /> Export as CSV</>
                        }
                    </button>
                </div>
            )}

            {/* ── Error / Success ─────────────────────────────── */}
            {error && (
                <div className="asc-error">
                    <AlertCircle size={14} /> {error}
                </div>
            )}
            {result && !result.exported && (
                <div className="asc-success">
                    <Check size={14} />
                    <div>
                        <strong>Surface Created</strong>
                        <span>{result.vertex_count} vertices, {result.triangle_count} triangles</span>
                    </div>
                </div>
            )}
            {result?.exported && (
                <div className="asc-success">
                    <Check size={14} /> Export downloaded successfully.
                </div>
            )}

            {/* ── Styles ──────────────────────────────────────── */}
            <style>{`
                .asc-panel {
                    background: #1a1a2e;
                    border-radius: 12px;
                    padding: 22px;
                    color: #e0e0e0;
                }
                .asc-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 18px;
                }
                .asc-header h3 { margin: 0; font-size: 1.15rem; }

                /* Tabs */
                .asc-tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 18px;
                }
                .asc-tab {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 10px;
                    background: #2a2a4a;
                    border: 1px solid #3a3a5a;
                    border-radius: 8px;
                    color: #a0a0c0;
                    cursor: pointer;
                    transition: all .2s;
                }
                .asc-tab:hover { background: #3a3a5a; }
                .asc-tab.active {
                    background: #4040a0;
                    border-color: #6060c0;
                    color: #fff;
                }

                /* Body */
                .asc-body { display: flex; flex-direction: column; gap: 16px; }

                /* Drop zone */
                .asc-dropzone {
                    border: 2px dashed #4a4a6a;
                    border-radius: 12px;
                    padding: 28px;
                    text-align: center;
                    transition: all .2s;
                    cursor: pointer;
                }
                .asc-dropzone:hover, .asc-dropzone.active {
                    border-color: #6060a0;
                    background: rgba(96,96,160,.1);
                }
                .asc-dz-label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    color: #a0a0c0;
                }
                .asc-dz-label p { margin: 0; font-size: .95rem; }
                .asc-dz-hint { font-size: .78rem; color: #6060a0; }

                /* File info */
                .asc-file-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    background: #2a2a4a;
                    border-radius: 6px;
                    font-size: .85rem;
                }
                .asc-file-size { color: #6060a0; margin-left: auto; }

                /* Meta grid */
                .asc-preview {
                    background: #2a2a4a;
                    border-radius: 10px;
                    padding: 14px;
                }
                .asc-preview-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 10px;
                    font-size: .9rem;
                    color: #a0a0c0;
                }
                .asc-meta-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                .asc-meta-item {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .meta-label { font-size: .7rem; color: #6060a0; text-transform: uppercase; letter-spacing: .04em; }
                .meta-value { font-size: .9rem; font-weight: 500; }

                /* Raw preview */
                .asc-raw-preview {
                    background: #2a2a4a;
                    padding: 12px;
                    border-radius: 8px;
                    font-size: .72rem;
                    color: #8080a0;
                    overflow-x: auto;
                    white-space: pre;
                    margin: 0;
                }

                /* Input groups */
                .asc-input-group { display: flex; flex-direction: column; gap: 6px; }
                .asc-input-group label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: .85rem;
                    color: #a0a0c0;
                }
                .asc-input-group input,
                .asc-input-group select {
                    padding: 10px 12px;
                    background: #2a2a4a;
                    border: 1px solid #3a3a5a;
                    border-radius: 8px;
                    color: #e0e0e0;
                    font-size: .92rem;
                }

                /* Action button */
                .asc-action-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #4040a0, #6060c0);
                    border: none;
                    border-radius: 8px;
                    color: #fff;
                    font-size: .95rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all .2s;
                }
                .asc-action-btn:hover:not(:disabled) {
                    background: linear-gradient(135deg, #5050b0, #7070d0);
                }
                .asc-action-btn:disabled { opacity: .55; cursor: not-allowed; }

                /* Error / Success */
                .asc-error {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 14px;
                    background: #4a2a2a;
                    border: 1px solid #6a3a3a;
                    border-radius: 8px;
                    color: #ff8080;
                    margin-top: 12px;
                    font-size: .88rem;
                }
                .asc-success {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 14px;
                    background: #2a4a2a;
                    border: 1px solid #3a6a3a;
                    border-radius: 8px;
                    color: #80ff80;
                    margin-top: 12px;
                    font-size: .88rem;
                }
                .asc-success div {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .asc-success span { font-size: .82rem; color: #60c060; }

                /* Spin */
                .spin { animation: asc-spin 1s linear infinite; }
                @keyframes asc-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ASCIIGridPanel;
