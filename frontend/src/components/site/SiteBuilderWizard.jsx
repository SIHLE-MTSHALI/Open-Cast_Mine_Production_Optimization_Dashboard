/**
 * SiteBuilderWizard.jsx — Phase 2 Issue #6
 *
 * Multi-step wizard for creating and configuring a mine site:
 *   Step 1: Site identity (name, CRS, location)
 *   Step 2: Geology import (CSV/DXF borehole data)
 *   Step 3: Topography import (GeoTIFF/ASCII grid)
 *   Step 4: Fleet definition (resources, equipment)
 *   Step 5: Calendar & period configuration
 *   Step 6: Review & create
 */

import React, { useState, useCallback } from 'react';
import {
    Map, Upload, Truck, CalendarDays, Check, ChevronRight, ChevronLeft,
    Mountain, Layers, AlertTriangle, Globe2, ArrowRight
} from 'lucide-react';
import { API_BASE_URL } from '../../services/api';

const STEPS = [
    { key: 'identity', label: 'Site Identity', icon: Map, description: 'Name, coordinate system, and location' },
    { key: 'geology', label: 'Geology Data', icon: Layers, description: 'Import borehole / geology files' },
    { key: 'topography', label: 'Topography', icon: Mountain, description: 'Surface and pit design data' },
    { key: 'fleet', label: 'Fleet & Resources', icon: Truck, description: 'Equipment and resource definitions' },
    { key: 'calendar', label: 'Calendar', icon: CalendarDays, description: 'Shifts, periods, and planning horizon' },
    { key: 'review', label: 'Review & Create', icon: Check, description: 'Verify and finalize site setup' },
];

const CRS_OPTIONS = [
    { value: 'EPSG:4326', label: 'WGS 84 (EPSG:4326)' },
    { value: 'EPSG:32735', label: 'UTM Zone 35S (EPSG:32735)' },
    { value: 'EPSG:32736', label: 'UTM Zone 36S (EPSG:32736)' },
    { value: 'EPSG:2048', label: 'Hartebeesthoek94 Lo29 (EPSG:2048)' },
    { value: 'custom', label: 'Custom CRS...' },
];


function SiteBuilderWizard({ onComplete, onCancel }) {
    const [step, setStep] = useState(0);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);

    // Wizard state
    const [siteData, setSiteData] = useState({
        name: '',
        crs: 'EPSG:4326',
        customCrs: '',
        latitude: '',
        longitude: '',
        description: '',
    });
    const [geologyFiles, setGeologyFiles] = useState([]);
    const [topoFiles, setTopoFiles] = useState([]);
    const [fleet, setFleet] = useState([
        { name: '', type: 'Excavator', capacity: 100 },
    ]);
    const [calendar, setCalendar] = useState({
        shiftPattern: '2x12',
        startDate: new Date().toISOString().slice(0, 10),
        periods: 14,
        periodUnit: 'shift',
    });

    const update = (field, value) => setSiteData(prev => ({ ...prev, [field]: value }));

    // ── Step Renderers ──────────────────────────────────────────────

    const renderIdentity = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InputField label="Site Name *" value={siteData.name}
                onChange={(v) => update('name', v)} placeholder="e.g. Grootegeluk Mine" />
            <InputField label="Description" value={siteData.description}
                onChange={(v) => update('description', v)} placeholder="Optional description" />
            <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Coordinate System *</label>
                    <select value={siteData.crs} onChange={(e) => update('crs', e.target.value)} style={inputStyle}>
                        {CRS_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                </div>
                {siteData.crs === 'custom' && (
                    <InputField label="Custom CRS" value={siteData.customCrs}
                        onChange={(v) => update('customCrs', v)} placeholder="EPSG:XXXXX" />
                )}
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
                <InputField label="Latitude" value={siteData.latitude} type="number"
                    onChange={(v) => update('latitude', v)} placeholder="-23.5" />
                <InputField label="Longitude" value={siteData.longitude} type="number"
                    onChange={(v) => update('longitude', v)} placeholder="28.7" />
            </div>
        </div>
    );

    const renderGeology = () => (
        <div>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary, #aaa)', marginBottom: 16 }}>
                Upload borehole data, geology model exports, or CSV files with collar/assay data.
                Supported formats: CSV, TXT, DXF.
            </p>
            <FileDropZone files={geologyFiles} onFiles={setGeologyFiles}
                accept=".csv,.txt,.dxf" label="Drop geology files here or click to browse" />
        </div>
    );

    const renderTopography = () => (
        <div>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary, #aaa)', marginBottom: 16 }}>
                Upload surface / DTM files. Supported: GeoTIFF, ASCII Grid, DXF contours.
            </p>
            <FileDropZone files={topoFiles} onFiles={setTopoFiles}
                accept=".tif,.tiff,.asc,.dxf" label="Drop topography files here or click to browse" />
        </div>
    );

    const renderFleet = () => (
        <div>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary, #aaa)', marginBottom: 12 }}>
                Define the mining equipment available at this site.
            </p>
            {fleet.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-end' }}>
                    <InputField label={idx === 0 ? "Name" : ""} value={item.name}
                        onChange={(v) => {
                            const f = [...fleet]; f[idx].name = v; setFleet(f);
                        }} placeholder="EX-01" style={{ flex: 2 }} />
                    <div style={{ flex: 1 }}>
                        {idx === 0 && <label style={labelStyle}>Type</label>}
                        <select value={item.type} style={inputStyle}
                            onChange={(e) => {
                                const f = [...fleet]; f[idx].type = e.target.value; setFleet(f);
                            }}>
                            <option value="Excavator">Excavator</option>
                            <option value="Truck">Truck</option>
                            <option value="Drill">Drill</option>
                            <option value="Dozer">Dozer</option>
                            <option value="Grader">Grader</option>
                        </select>
                    </div>
                    <InputField label={idx === 0 ? "Capacity (t/hr)" : ""} value={item.capacity} type="number"
                        onChange={(v) => {
                            const f = [...fleet]; f[idx].capacity = v; setFleet(f);
                        }} style={{ flex: 1 }} />
                    <button onClick={() => setFleet(fleet.filter((_, i) => i !== idx))}
                        style={{ ...btnSecondary, padding: '8px 12px', marginBottom: idx === 0 ? 0 : 0 }}
                        disabled={fleet.length <= 1}>✕</button>
                </div>
            ))}
            <button onClick={() => setFleet([...fleet, { name: '', type: 'Excavator', capacity: 100 }])}
                style={{ ...btnSecondary, marginTop: 8 }}>+ Add Resource</button>
        </div>
    );

    const renderCalendar = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Shift Pattern</label>
                    <select value={calendar.shiftPattern} style={inputStyle}
                        onChange={(e) => setCalendar(prev => ({ ...prev, shiftPattern: e.target.value }))}>
                        <option value="2x12">2 × 12-hour</option>
                        <option value="3x8">3 × 8-hour</option>
                        <option value="1x12">1 × 12-hour (day only)</option>
                    </select>
                </div>
                <InputField label="Start Date" value={calendar.startDate} type="date"
                    onChange={(v) => setCalendar(prev => ({ ...prev, startDate: v }))} />
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
                <InputField label="Number of Periods" value={calendar.periods} type="number"
                    onChange={(v) => setCalendar(prev => ({ ...prev, periods: parseInt(v) || 14 }))} />
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Period Unit</label>
                    <select value={calendar.periodUnit} style={inputStyle}
                        onChange={(e) => setCalendar(prev => ({ ...prev, periodUnit: e.target.value }))}>
                        <option value="shift">Shift</option>
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderReview = () => (
        <div style={{ fontSize: 13 }}>
            <ReviewRow label="Site Name" value={siteData.name} />
            <ReviewRow label="CRS" value={siteData.crs === 'custom' ? siteData.customCrs : siteData.crs} />
            <ReviewRow label="Location" value={siteData.latitude && siteData.longitude ? `${siteData.latitude}, ${siteData.longitude}` : 'Not set'} />
            <ReviewRow label="Geology Files" value={`${geologyFiles.length} file(s)`} />
            <ReviewRow label="Topography Files" value={`${topoFiles.length} file(s)`} />
            <ReviewRow label="Fleet" value={`${fleet.filter(f => f.name).length} resource(s)`} />
            <ReviewRow label="Calendar" value={`${calendar.periods} ${calendar.periodUnit}s starting ${calendar.startDate}`} />
        </div>
    );

    const stepRenderers = [renderIdentity, renderGeology, renderTopography, renderFleet, renderCalendar, renderReview];

    // ── Create Site ────────────────────────────────────────────────
    const handleCreate = useCallback(async () => {
        setCreating(true);
        setError(null);
        try {
            const payload = {
                name: siteData.name,
                description: siteData.description,
                crs: siteData.crs === 'custom' ? siteData.customCrs : siteData.crs,
                latitude: parseFloat(siteData.latitude) || 0,
                longitude: parseFloat(siteData.longitude) || 0,
                fleet: fleet.filter(f => f.name).map(f => ({
                    name: f.name,
                    resource_type: f.type,
                    capacity_tonnes_per_hour: parseFloat(f.capacity) || 100,
                })),
                calendar: {
                    shift_pattern: calendar.shiftPattern,
                    start_date: calendar.startDate,
                    period_count: calendar.periods,
                    period_unit: calendar.periodUnit,
                },
            };

            const res = await fetch(`${API_BASE_URL}/sites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(await res.text());
            const site = await res.json();

            // Upload geology / topo files if any
            for (const [files, endpoint] of [[geologyFiles, 'geology'], [topoFiles, 'topography']]) {
                if (files.length === 0) continue;
                const form = new FormData();
                files.forEach(f => form.append('files', f));
                await fetch(`${API_BASE_URL}/sites/${site.site_id || site.id}/${endpoint}/upload`, {
                    method: 'POST', body: form,
                });
            }

            onComplete?.(site);
        } catch (err) {
            setError(err.message || 'Failed to create site');
        } finally {
            setCreating(false);
        }
    }, [siteData, fleet, calendar, geologyFiles, topoFiles, onComplete]);

    const canProceed = () => {
        if (step === 0) return siteData.name.trim().length > 0;
        return true;
    };

    // ── Layout ──────────────────────────────────────────────────────
    return (
        <div style={{
            background: 'var(--color-bg-primary, #111827)',
            borderRadius: 16,
            border: '1px solid var(--color-border, #333)',
            overflow: 'hidden',
            maxWidth: 780,
            margin: '24px auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
            {/* Step Indicator */}
            <div style={{
                display: 'flex', padding: '16px 24px',
                borderBottom: '1px solid var(--color-border, #333)',
                background: 'var(--color-bg-secondary, #1e1e2e)',
                overflowX: 'auto',
            }}>
                {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const isActive = i === step;
                    const isDone = i < step;
                    return (
                        <div key={s.key} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '6px 12px', borderRadius: 8,
                            cursor: isDone ? 'pointer' : 'default',
                            background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                            border: `1px solid ${isActive ? 'rgba(59,130,246,0.4)' : 'transparent'}`,
                            transition: 'all 0.2s',
                            flexShrink: 0,
                        }} onClick={() => isDone && setStep(i)}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                background: isDone ? '#22c55e' : isActive ? '#3b82f6' : 'var(--color-bg-tertiary, #2a2a3a)',
                                color: '#fff', fontSize: 12, fontWeight: 700,
                            }}>
                                {isDone ? <Check size={14} /> : <Icon size={14} />}
                            </div>
                            <span style={{
                                fontSize: 12, fontWeight: isActive ? 600 : 400,
                                color: isActive ? 'var(--color-text-primary, #fff)' : 'var(--color-text-secondary, #888)',
                            }}>
                                {s.label}
                            </span>
                            {i < STEPS.length - 1 && (
                                <ChevronRight size={14} color="var(--color-text-secondary, #555)" style={{ marginLeft: 4 }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Step Content */}
            <div style={{ padding: '24px 32px', minHeight: 280 }}>
                <h2 style={{
                    fontSize: 20, fontWeight: 700, marginBottom: 4,
                    color: 'var(--color-text-primary, #fff)',
                }}>
                    {STEPS[step].label}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary, #888)', marginBottom: 20 }}>
                    {STEPS[step].description}
                </p>
                {stepRenderers[step]()}
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    margin: '0 32px 16px', padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#ef4444',
                }}>
                    <AlertTriangle size={16} /> {error}
                </div>
            )}

            {/* Footer */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', padding: '16px 32px',
                borderTop: '1px solid var(--color-border, #333)',
                background: 'var(--color-bg-secondary, #1e1e2e)',
            }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    {step > 0 && (
                        <button onClick={() => setStep(step - 1)} style={btnSecondary}>
                            <ChevronLeft size={14} /> Back
                        </button>
                    )}
                    {onCancel && (
                        <button onClick={onCancel} style={btnSecondary}>Cancel</button>
                    )}
                </div>
                <div>
                    {step < STEPS.length - 1 ? (
                        <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
                            style={{ ...btnPrimary, opacity: canProceed() ? 1 : 0.5 }}>
                            Next <ArrowRight size={14} />
                        </button>
                    ) : (
                        <button onClick={handleCreate} disabled={creating || !siteData.name}
                            style={{ ...btnPrimary, background: 'linear-gradient(135deg, #22c55e, #16a34a)', opacity: creating ? 0.6 : 1 }}>
                            {creating ? 'Creating...' : 'Create Site'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Shared Styles ──────────────────────────────────────────────────
const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4,
    color: 'var(--color-text-secondary, #aaa)',
};

const inputStyle = {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    border: '1px solid var(--color-border, #444)',
    background: 'var(--color-bg-tertiary, #2a2a3a)',
    color: 'var(--color-text-primary, #fff)',
    fontSize: 14, outline: 'none',
};

const btnPrimary = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '10px 20px', borderRadius: 8, border: 'none',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
};

const btnSecondary = {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '8px 16px', borderRadius: 8,
    border: '1px solid var(--color-border, #444)',
    background: 'transparent', color: 'var(--color-text-secondary, #aaa)',
    fontSize: 13, cursor: 'pointer',
};


// ── Small Components ───────────────────────────────────────────────
function InputField({ label, value, onChange, placeholder, type = 'text', style }) {
    return (
        <div style={{ flex: 1, ...style }}>
            {label && <label style={labelStyle}>{label}</label>}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={inputStyle}
            />
        </div>
    );
}

function FileDropZone({ files, onFiles, accept, label }) {
    const handleChange = (e) => onFiles([...files, ...Array.from(e.target.files)]);

    return (
        <div>
            <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: 32, borderRadius: 12,
                border: '2px dashed var(--color-border, #444)',
                background: 'var(--color-bg-tertiary, #2a2a3a)',
                cursor: 'pointer', textAlign: 'center',
                transition: 'border-color 0.2s',
            }}>
                <Upload size={28} color="var(--color-text-secondary, #888)" style={{ marginBottom: 8 }} />
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary, #888)' }}>{label}</span>
                <input type="file" multiple accept={accept} onChange={handleChange}
                    style={{ display: 'none' }} />
            </label>
            {files.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {files.map((f, i) => (
                        <span key={i} style={{
                            fontSize: 11, padding: '4px 10px', borderRadius: 6,
                            background: 'rgba(59,130,246,0.15)', color: '#93c5fd',
                            border: '1px solid rgba(59,130,246,0.3)',
                        }}>
                            📄 {f.name}
                            <button onClick={() => onFiles(files.filter((_, j) => j !== i))}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: 6 }}>✕</button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function ReviewRow({ label, value }) {
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', padding: '8px 0',
            borderBottom: '1px solid var(--color-border, #222)',
        }}>
            <span style={{ color: 'var(--color-text-secondary, #aaa)' }}>{label}</span>
            <span style={{ color: 'var(--color-text-primary, #fff)', fontWeight: 500 }}>{value}</span>
        </div>
    );
}


export default SiteBuilderWizard;
