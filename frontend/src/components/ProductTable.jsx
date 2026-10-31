import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Edit2, Trash2, Plus, Minus, PackageX } from 'lucide-react';

export default function ProductTable({
  products,
  loading,
  onEdit,
  onDelete,
  onQuickStockUpdate
}) {
  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  if (loading) {
    return (
      <div className="table-card" style={{ padding: '48px 20px', textAlign: 'center' }}>
        <div style={{ color: '#64748b', fontSize: '0.95rem' }}>Loading inventory items...</div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="table-card">
        <div className="empty-state">
          <PackageX className="empty-icon" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
            No products found
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            No matching inventory items found. Try clearing filters or add a new product.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-heading">
        <div>
          <h2>Products</h2>
          <p>{products.length} {products.length === 1 ? 'item' : 'items'} shown</p>
        </div>
        <span className="table-heading-icon"><PackageX size={18} /></span>
      </div>
      <div className="table-responsive">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock Status</th>
              <th>Quick Adjust</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const qty = product.quantity !== undefined ? product.quantity : 0;
              const isOutOfStock = qty === 0;
              const isLowStock = qty > 0 && qty < 5;

              let rowClass = '';
              if (isOutOfStock) rowClass = 'row-out-of-stock';
              else if (isLowStock) rowClass = 'row-low-stock';

              return (
                <tr key={product.id} className={rowClass}>
                  {/* Product ID */}
                  <td>
                    <span className="product-id-badge">{product.productId}</span>
                  </td>

                  {/* Name & Description */}
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{product.name}</div>
                    {product.description && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        {product.description}
                      </div>
                    )}
                  </td>

                  {/* Category */}
                  <td>
                    <span 
                      style={{ 
                        fontSize: '0.8rem', 
                        background: '#f1f5f9', 
                        padding: '3px 8px', 
                        borderRadius: '4px',
                        color: '#475569',
                        fontWeight: 500
                      }}
                    >
                      {product.category || 'General'}
                    </span>
                  </td>

                  {/* Price */}
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      {formatCurrency(product.price)}
                    </span>
                  </td>

                  {/* Stock Quantity with Warning indicator */}
                  <td>
                    {isOutOfStock ? (
                      <span className="stock-badge out-of-stock">
                        <AlertCircle size={14} />
                        <span>Out of Stock (0)</span>
                      </span>
                    ) : isLowStock ? (
                      <span className="stock-badge low-stock" title="Restock recommended: Stock is below 5!">
                        <AlertTriangle size={14} />
                        <span>⚠️ Low Stock: {qty} left</span>
                      </span>
                    ) : (
                      <span className="stock-badge in-stock">
                        <CheckCircle2 size={14} />
                        <span>In Stock ({qty})</span>
                      </span>
                    )}
                  </td>

                  {/* Quick Adjust Buttons */}
                  <td>
                    <div className="stock-stepper">
                      <button
                        className="step-btn"
                        onClick={() => onQuickStockUpdate(product, qty - 1)}
                        disabled={qty <= 0}
                        title="Decrease stock by 1"
                        aria-label="Decrease stock"
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 600, fontSize: '0.88rem' }}>
                        {qty}
                      </span>
                      <button
                        className="step-btn"
                        onClick={() => onQuickStockUpdate(product, qty + 1)}
                        title="Increase stock by 1"
                        aria-label="Increase stock"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </td>

                  {/* Edit and Delete Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn btn-outline btn-sm btn-icon"
                        onClick={() => onEdit(product)}
                        title="Edit price or product details"
                        aria-label="Edit product"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-outline btn-sm btn-icon"
                        style={{ color: '#dc2626' }}
                        onClick={() => onDelete(product)}
                        title="Delete product"
                        aria-label="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
