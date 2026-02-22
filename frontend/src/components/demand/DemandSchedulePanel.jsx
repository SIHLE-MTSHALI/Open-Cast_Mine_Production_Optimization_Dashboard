/**
 * DemandSchedulePanel.jsx — Issue #31
 *
 * Demand schedule calendar view with per-product per-period targets.
 * Integrates with the demand_router backend endpoints.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Trash2, Save, RefreshCw, TrendingUp, Package,
    ChevronDown, ChevronRight, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api';

const API_BASE = API_BASE_URL;


function DemandSchedulePanel({ siteId, periods = [] }) {
    const [demands, setDemands] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [expandedProducts, setExpandedProducts] = useState({});
    const [newDemand, setNewDemand] = useState({
        product_name: '', product_id: '', target_tonnes: 0,
        min_tonnes: 0, revenue_per_tonne: 0, penalty_per_tonne_short: 0,
    });

    const fetchDemands = useCallback(async () => {
        if (!siteId) return;
        setLoading(true);
        try {
            const [demandRes, orderRes] = await Promise.all([
                axios.get(`${API_BASE}/demand/schedule/site/${siteId}`),
                axios.get(`${API_BASE}/demand/orders/site/${siteId}`),
            ]);
            setDemands(demandRes.data || []);
            setOrders(orderRes.data || []);
        } catch {
            setDemands([]);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [siteId]);

    useEffect(() => { fetchDemands(); }, [fetchDemands]);

    // Group demands by product
    const productGroups = {};
    demands.forEach(d => {
        const key = d.product_name || d.product_id;
        if (!productGroups[key]) productGroups[key] = [];
        productGroups[key].push(d);
    });

    const handleAddDemand = async () => {
        try {
            await axios.post(`${API_BASE}/demand/schedule`, {
                site_id: siteId,
                ...newDemand,
                product_id: newDemand.product_id || newDemand.product_name.toLowerCase().replace(/\s+/g, '_'),
            });
            setShowAddForm(false);
            setNewDemand({
                product_name: '', product_id: '', target_tonnes: 0,
                min_tonnes: 0, revenue_per_tonne: 0, penalty_per_tonne_short: 0,
            });
            fetchDemands();
        } catch (e) {
            console.error('Failed to add demand', e);
        }
    };

    const handleDelete = async (demandId) => {
        try {
            await axios.delete(`${API_BASE}/demand/schedule/${demandId}`);
            fetchDemands();
        } catch (e) {
            console.error('Failed to delete demand', e);
        }
    };

    const toggleProduct = (key) =>
        setExpandedProducts(prev => ({ ...prev, [key]: !prev[key] }));

    const totalTarget = demands.reduce((s, d) => s + (d.target_tonnes || 0), 0);
    const totalRevenue = demands.reduce((s, d) => s + (d.target_tonnes || 0) * (d.revenue_per_tonne || 0), 0);

    return (
        <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)', margin: 0 }}>
                        <Package size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Demand Schedule
                    </h2>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary, #888)', margin: '4px 0 0' }}>
                        Product demand targets and customer orders
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={fetchDemands} style={btnSecondary}>
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => setShowAddForm(true)} style={btnPrimary}>
                        <Plus size={14} /> Add Product
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <SummaryCard label="Products" value={Object.keys(productGroups).length} icon="📦" />
                <SummaryCard label="Total Target" value={`${(totalTarget / 1000).toFixed(0)}kt`} icon="🎯" />
                <SummaryCard label="Est. Revenue" value={`R${(totalRevenue / 1e6).toFixed(1)}M`} icon="💰" />
                <SummaryCard label="Open Orders" value={orders.filter(o => o.status === 'open').length} icon="📋" />
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div style={{ ...cardStyle, marginBottom: 16, borderColor: 'rgba(59,130,246,0.4)' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary, #fff)', marginBottom: 12 }}>
                        New Product Demand
                    </h3>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <InputField label="Product Name" value={newDemand.product_name}
                            onChange={v => setNewDemand(p => ({ ...p, product_name: v }))} placeholder="e.g. Export Coal" />
                        <InputField label="Target Tonnes" value={newDemand.target_tonnes} type="number"
                            onChange={v => setNewDemand(p => ({ ...p, target_tonnes: parseFloat(v) || 0 }))} />
                        <InputField label="Min Tonnes" value={newDemand.min_tonnes} type="number"
                            onChange={v => setNewDemand(p => ({ ...p, min_tonnes: parseFloat(v) || 0 }))} />
                        <InputField label="Revenue/t (R)" value={newDemand.revenue_per_tonne} type="number"
                            onChange={v => setNewDemand(p => ({ ...p, revenue_per_tonne: parseFloat(v) || 0 }))} />
                        <InputField label="Penalty/t Short (R)" value={newDemand.penalty_per_tonne_short} type="number"
                            onChange={v => setNewDemand(p => ({ ...p, penalty_per_tonne_short: parseFloat(v) || 0 }))} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                        <button onClick={() => setShowAddForm(false)} style={btnSecondary}>Cancel</button>
                        <button onClick={handleAddDemand} style={btnPrimary} disabled={!newDemand.product_name}>
                            <Save size={14} /> Save
                        </button>
                    </div>
                </div>
            )}

            {/* Product Groups */}
            {Object.entries(productGroups).map(([productName, items]) => (
                <div key={productName} style={{ ...cardStyle, marginBottom: 10 }}>
                    <div
                        onClick={() => toggleProduct(productName)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                            userSelect: 'none',
                        }}
                    >
                        {expandedProducts[productName] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary, #fff)' }}>
                            {productName}
                        </span>
                        <span style={{
                            fontSize: 11, padding: '2px 8px', borderRadius: 10,
                            background: 'rgba(59,130,246,0.15)', color: '#93c5fd',
                        }}>
                            {items.length} schedule(s)
                        </span>
                        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-text-secondary, #aaa)' }}>
                            {items.reduce((s, d) => s + (d.target_tonnes || 0), 0).toLocaleString()} t target
                        </span>
                    </div>

                    {expandedProducts[productName] && (
                        <div style={{ marginTop: 12 }}>
                            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--color-border, #333)' }}>
                                        <th style={thStyle}>Period</th>
                                        <th style={thStyle}>Target (t)</th>
                                        <th style={thStyle}>Min (t)</th>
                                        <th style={thStyle}>Revenue/t</th>
                                        <th style={thStyle}>Penalty/t</th>
                                        <th style={thStyle}>Priority</th>
                                        <th style={thStyle}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(d => (
                                        <tr key={d.demand_id} style={{ borderBottom: '1px solid var(--color-border, #222)' }}>
                                            <td style={tdStyle}>{d.period_id || 'All'}</td>
                                            <td style={tdStyle}>{(d.target_tonnes || 0).toLocaleString()}</td>
                                            <td style={tdStyle}>{(d.min_tonnes || 0).toLocaleString()}</td>
                                            <td style={tdStyle}>R{(d.revenue_per_tonne || 0).toFixed(2)}</td>
                                            <td style={tdStyle}>R{(d.penalty_per_tonne_short || 0).toFixed(2)}</td>
                                            <td style={tdStyle}>P{d.priority || 1}</td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                <button onClick={() => handleDelete(d.demand_id)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}

            {Object.keys(productGroups).length === 0 && !showAddForm && (
                <div style={{
                    textAlign: 'center', padding: 40, color: 'var(--color-text-secondary, #666)',
                    fontSize: 14,
                }}>
                    No demand schedules configured. Click <strong>Add Product</strong> to get started.
                </div>
            )}

            {/* Customer Orders Section */}
            {orders.length > 0 && (
                <div style={{ marginTop: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary, #fff)', marginBottom: 12 }}>
                        📋 Customer Orders ({orders.length})
                    </h3>
                    {orders.map(o => (
                        <div key={o.order_id} style={{
                            ...cardStyle, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 16,
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary, #fff)' }}>
                                    {o.customer_name}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--color-text-secondary, #aaa)' }}>
                                    {o.product_name} · {(o.order_tonnes || 0).toLocaleString()}t · Due {new Date(o.due_date).toLocaleDateString()}
                                </div>
                            </div>
                            <span style={{
                                fontSize: 11, padding: '3px 10px', borderRadius: 6,
                                background: o.status === 'fulfilled' ? 'rgba(34,197,94,0.15)' :
                                    o.status === 'partial' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)',
                                color: o.status === 'fulfilled' ? '#22c55e' :
                                    o.status === 'partial' ? '#f59e0b' : '#60a5fa',
                                fontWeight: 500,
                            }}>
                                {o.status?.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


// ── Styles & Helpers ────────────────────────────────────────────────

const cardStyle = {
    background: 'var(--color-bg-secondary, #1e1e2e)',
    border: '1px solid var(--color-border, #333)',
    borderRadius: 10,
    padding: '14px 18px',
};

const thStyle = {
    textAlign: 'left', padding: '6px 8px',
    color: 'var(--color-text-secondary, #888)', fontWeight: 500,
};
const tdStyle = {
    padding: '6px 8px', color: 'var(--color-text-primary, #ddd)',
};

const btnPrimary = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 8, border: 'none',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
};
const btnSecondary = {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '8px 12px', borderRadius: 8,
    border: '1px solid var(--color-border, #444)',
    background: 'transparent', color: 'var(--color-text-secondary, #aaa)',
    fontSize: 13, cursor: 'pointer',
};

function InputField({ label, value, onChange, placeholder, type = 'text' }) {
    return (
        <div style={{ flex: 1, minWidth: 120 }}>
            <label style={{ display: 'block', fontSize: 11, marginBottom: 3, color: 'var(--color-text-secondary, #aaa)' }}>
                {label}
            </label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%', padding: '6px 10px', borderRadius: 6,
                    border: '1px solid var(--color-border, #444)',
                    background: 'var(--color-bg-tertiary, #2a2a3a)',
                    color: 'var(--color-text-primary, #fff)', fontSize: 13,
                }}
            />
        </div>
    );
}

function SummaryCard({ label, value, icon }) {
    return (
        <div style={{
            ...cardStyle, flex: 1, textAlign: 'center', minWidth: 100,
        }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary, #fff)' }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary, #888)' }}>{label}</div>
        </div>
    );
}


export default DemandSchedulePanel;
