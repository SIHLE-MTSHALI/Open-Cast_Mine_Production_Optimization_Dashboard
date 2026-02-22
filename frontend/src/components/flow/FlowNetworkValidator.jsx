/**
 * FlowNetworkValidator.jsx — Issue #19 Enhancement
 *
 * Network validation overlay for the FlowEditor:
 *  - Detects disconnected nodes
 *  - Detects missing objectives on arcs
 *  - Detects capacity issues
 *  - Flow animation visualization for schedule results
 *  - Auto-layout integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    AlertTriangle, CheckCircle, XCircle, Play, Pause,
    LayoutGrid, Zap, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api';

const API_BASE = API_BASE_URL;


function FlowNetworkValidator({ networkId, nodes, arcs, onAutoLayout }) {
    const [validationResults, setValidationResults] = useState(null);
    const [flowAnimation, setFlowAnimation] = useState(null);
    const [animating, setAnimating] = useState(false);
    const [loading, setLoading] = useState(false);

    // ── Validate ────────────────────────────────────────────────────
    const validate = useCallback(() => {
        const errors = [];
        const warnings = [];

        // Check for disconnected nodes
        const connectedNodeIds = new Set();
        (arcs || []).forEach(arc => {
            connectedNodeIds.add(arc.from_node_id || arc.fromNodeId);
            connectedNodeIds.add(arc.to_node_id || arc.toNodeId);
        });
        (nodes || []).forEach(node => {
            const id = node.node_id || node.id;
            if (!connectedNodeIds.has(id)) {
                errors.push({ type: 'disconnected', message: `Node "${node.name || id}" is disconnected`, nodeId: id });
            }
        });

        // Check source nodes have outgoing arcs
        const sourceNodes = (nodes || []).filter(n => n.node_type === 'Source' || n.type === 'Source');
        sourceNodes.forEach(node => {
            const id = node.node_id || node.id;
            const hasOutgoing = (arcs || []).some(a => (a.from_node_id || a.fromNodeId) === id);
            if (!hasOutgoing) {
                errors.push({ type: 'no_outgoing', message: `Source "${node.name || id}" has no outgoing arcs`, nodeId: id });
            }
        });

        // Check sink nodes have incoming arcs
        const sinkNodes = (nodes || []).filter(n =>
            ['Destination', 'ProductSink', 'Dump'].includes(n.node_type || n.type)
        );
        sinkNodes.forEach(node => {
            const id = node.node_id || node.id;
            const hasIncoming = (arcs || []).some(a => (a.to_node_id || a.toNodeId) === id);
            if (!hasIncoming) {
                warnings.push({ type: 'no_incoming', message: `Sink "${node.name || id}" has no incoming arcs`, nodeId: id });
            }
        });

        // Check arcs with zero capacity
        (arcs || []).forEach(arc => {
            if (arc.capacity !== undefined && arc.capacity <= 0) {
                warnings.push({ type: 'zero_capacity', message: `Arc "${arc.name || arc.id}" has zero capacity`, arcId: arc.id });
            }
        });

        // Check for arcs missing quality objectives
        (arcs || []).forEach(arc => {
            const toNode = (nodes || []).find(n => (n.node_id || n.id) === (arc.to_node_id || arc.toNodeId));
            if (toNode && ['WashPlant', 'Destination', 'ProductSink'].includes(toNode.node_type || toNode.type)) {
                if (!arc.quality_objectives || arc.quality_objectives.length === 0) {
                    warnings.push({
                        type: 'no_objectives',
                        message: `Arc to "${toNode.name || toNode.id}" has no quality objectives`,
                        arcId: arc.id
                    });
                }
            }
        });

        setValidationResults({ errors, warnings, valid: errors.length === 0 });
    }, [nodes, arcs]);

    useEffect(() => {
        if (nodes?.length > 0) validate();
    }, [nodes, arcs, validate]);

    // ── Flow Animation ──────────────────────────────────────────────
    const loadFlowResults = useCallback(async () => {
        if (!networkId) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/flow/network/${networkId}/results`);
            setFlowAnimation(res.data?.flows || []);
        } catch {
            setFlowAnimation([]);
        } finally {
            setLoading(false);
        }
    }, [networkId]);

    // ── Auto-layout ─────────────────────────────────────────────────
    const handleAutoLayout = useCallback(async () => {
        if (!networkId) return;
        try {
            const res = await axios.post(`${API_BASE}/flow/network/${networkId}/auto-layout`);
            if (res.data?.positions) {
                onAutoLayout?.(res.data.positions);
            }
        } catch {
            // Fallback: simple left-to-right layout
            if (nodes?.length > 0) {
                const typeOrder = { Source: 0, Stockpile: 1, StagedStockpile: 1, WashPlant: 2, Crusher: 2, Destination: 3, ProductSink: 3, Dump: 3, Loadout: 3 };
                const positions = {};
                const groups = {};
                nodes.forEach(n => {
                    const order = typeOrder[n.node_type || n.type] ?? 1;
                    if (!groups[order]) groups[order] = [];
                    groups[order].push(n);
                });
                Object.entries(groups).forEach(([col, groupNodes]) => {
                    groupNodes.forEach((n, row) => {
                        positions[n.node_id || n.id] = {
                            x: parseInt(col) * 220 + 50,
                            y: row * 120 + 50,
                        };
                    });
                });
                onAutoLayout?.(positions);
            }
        }
    }, [networkId, nodes, onAutoLayout]);

    const cardStyle = {
        background: 'var(--color-bg-secondary, #1e1e2e)',
        border: '1px solid var(--color-border, #333)',
        borderRadius: 10,
        padding: '12px 16px',
    };

    if (!validationResults) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={handleAutoLayout} style={btnStyle} title="Auto-layout nodes">
                    <LayoutGrid size={14} /> Auto-Layout
                </button>
                <button onClick={loadFlowResults} style={btnStyle} title="Load flow results">
                    <Zap size={14} /> Load Flows
                </button>
                {flowAnimation && (
                    <button onClick={() => setAnimating(!animating)} style={btnStyle}>
                        {animating ? <Pause size={14} /> : <Play size={14} />}
                        {animating ? 'Pause' : 'Animate'}
                    </button>
                )}
            </div>

            {/* Validation Summary */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    {validationResults.valid ? (
                        <CheckCircle size={16} color="#22c55e" />
                    ) : (
                        <XCircle size={16} color="#ef4444" />
                    )}
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary, #fff)' }}>
                        Network Validation: {validationResults.valid ? 'Valid' : `${validationResults.errors.length} error(s)`}
                    </span>
                </div>

                {validationResults.errors.map((e, i) => (
                    <div key={`e-${i}`} style={{
                        fontSize: 12, padding: '4px 8px', marginBottom: 3, borderRadius: 4,
                        background: 'rgba(239,68,68,0.1)', color: '#fca5a5',
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <XCircle size={12} /> {e.message}
                    </div>
                ))}

                {validationResults.warnings.map((w, i) => (
                    <div key={`w-${i}`} style={{
                        fontSize: 12, padding: '4px 8px', marginBottom: 3, borderRadius: 4,
                        background: 'rgba(245,158,11,0.1)', color: '#fbbf24',
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <AlertTriangle size={12} /> {w.message}
                    </div>
                ))}
            </div>

            {/* Flow Summary */}
            {flowAnimation && flowAnimation.length > 0 && (
                <div style={cardStyle}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: 'var(--color-text-primary, #fff)' }}>
                        Flow Results ({flowAnimation.length} routes)
                    </div>
                    {flowAnimation.slice(0, 8).map((f, i) => (
                        <div key={i} style={{
                            fontSize: 11, display: 'flex', alignItems: 'center', gap: 6,
                            padding: '3px 0', color: 'var(--color-text-secondary, #aaa)',
                        }}>
                            <span>{f.from_node_name || f.from_node_id}</span>
                            <ArrowRight size={10} />
                            <span>{f.to_node_name || f.to_node_id}</span>
                            <span style={{ marginLeft: 'auto', fontWeight: 600, color: '#60a5fa' }}>
                                {(f.tonnes || 0).toLocaleString()}t
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


const btnStyle = {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '6px 12px', borderRadius: 6,
    border: '1px solid var(--color-border, #444)',
    background: 'var(--color-bg-tertiary, #2a2a3a)',
    color: 'var(--color-text-secondary, #aaa)',
    fontSize: 12, cursor: 'pointer',
};


export default FlowNetworkValidator;
