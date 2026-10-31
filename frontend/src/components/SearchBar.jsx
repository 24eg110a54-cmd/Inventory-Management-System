import React from 'react';
import { Search, Plus, AlertTriangle, Package, RefreshCw } from 'lucide-react';

export default function SearchBar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  onOpenAddModal,
  onRefresh,
  lowStockCount
}) {
  return (
    <div className="controls-card">
      {/* Search Input for Name or Product ID */}
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search by Product Name or Product ID (e.g. PRD-101)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filter Pills */}
      <div className="filters-group">
        <button
          className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          <Package size={14} />
          <span>All Products</span>
        </button>

        <button
          className={`filter-pill warning-pill ${activeFilter === 'low-stock' ? 'active' : ''}`}
          onClick={() => onFilterChange('low-stock')}
        >
          <AlertTriangle size={14} />
          <span>Low Stock (&lt; 5)</span>
          {lowStockCount > 0 && (
            <span
              style={{
                background: activeFilter === 'low-stock' ? '#ffffff' : '#ea580c',
                color: activeFilter === 'low-stock' ? '#ea580c' : '#ffffff',
                padding: '1px 6px',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 800
              }}
            >
              {lowStockCount}
            </span>
          )}
        </button>

        <button
          className={`filter-pill ${activeFilter === 'out-of-stock' ? 'active' : ''}`}
          onClick={() => onFilterChange('out-of-stock')}
        >
          <span>Out of Stock (0)</span>
        </button>

        {/* Sort Select */}
        <select
          className="select-dropdown"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="default">Sort by: Default</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="stock-asc">Stock: Low to High (Restock priority)</option>
          <option value="stock-desc">Stock: High to Low</option>
        </select>

        {/* Refresh button */}
        <button
          className="btn btn-outline btn-icon"
          onClick={onRefresh}
          title="Refresh inventory"
          aria-label="Refresh"
        >
          <RefreshCw size={15} />
        </button>

        {/* Add Product Button */}
        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>
    </div>
  );
}
