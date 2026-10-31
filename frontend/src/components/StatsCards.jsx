import React from 'react';
import { Package, AlertTriangle, AlertCircle, DollarSign, Layers } from 'lucide-react';

export default function StatsCards({ stats, activeFilter, onFilterChange }) {
  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="stats-grid">
      {/* Total Unique Products */}
      <div 
        className={`stat-card clickable ${activeFilter === 'all' ? 'active' : ''}`}
        onClick={() => onFilterChange('all')}
        title="View all products"
      >
        <div>
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{stats?.totalProducts ?? 0}</div>
        </div>
        <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
          <Package size={26} />
        </div>
      </div>

      {/* Low Stock Warning Card (< 5 units) */}
      <div
        className={`stat-card clickable warning-card ${activeFilter === 'low-stock' ? 'active' : ''}`}
        onClick={() => onFilterChange(activeFilter === 'low-stock' ? 'all' : 'low-stock')}
        title="Click to view items needing restocking"
      >
        <div>
          <div className="stat-label" style={{ color: '#c2410c' }}>Low Stock Alert (&lt; 5)</div>
          <div className="stat-value" style={{ color: '#c2410c' }}>
            {stats?.lowStockCount ?? 0}
          </div>
        </div>
        <div className="stat-icon" style={{ background: '#ffedd5', color: '#ea580c' }}>
          <AlertTriangle size={26} />
        </div>
      </div>

      {/* Out of Stock Card (0 units) */}
      <div
        className={`stat-card clickable ${activeFilter === 'out-of-stock' ? 'active' : ''}`}
        onClick={() => onFilterChange(activeFilter === 'out-of-stock' ? 'all' : 'out-of-stock')}
        title="Click to view out of stock items"
      >
        <div>
          <div className="stat-label" style={{ color: '#b91c1c' }}>Out of Stock</div>
          <div className="stat-value" style={{ color: '#b91c1c' }}>
            {stats?.outOfStockCount ?? 0}
          </div>
        </div>
        <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
          <AlertCircle size={26} />
        </div>
      </div>

      {/* Total Inventory Value */}
      <div className="stat-card">
        <div>
          <div className="stat-label">Inventory Value</div>
          <div className="stat-value" style={{ fontSize: '1.45rem', color: '#0f766e' }}>
            {formatCurrency(stats?.totalInventoryValue)}
          </div>
        </div>
        <div className="stat-icon" style={{ background: '#ccfbf1', color: '#0d9488' }}>
          <DollarSign size={26} />
        </div>
      </div>
    </div>
  );
}
