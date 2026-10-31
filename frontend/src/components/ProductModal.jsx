import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, onSave, productToEdit }) {
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        productId: productToEdit.productId || '',
        name: productToEdit.name || '',
        category: productToEdit.category || '',
        price: productToEdit.price !== undefined ? productToEdit.price : '',
        quantity: productToEdit.quantity !== undefined ? productToEdit.quantity : '',
        description: productToEdit.description || ''
      });
    } else {
      setFormData({
        productId: '',
        name: '',
        category: 'Groceries',
        price: '',
        quantity: '',
        description: ''
      });
    }
    setErrors({});
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.productId || !formData.productId.trim()) {
      newErrors.productId = 'Product ID is required.';
    }

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Product name is required.';
    }

    if (formData.price === '' || formData.price === null) {
      newErrors.price = 'Price is required.';
    } else if (Number(formData.price) < 0) {
      newErrors.price = 'Price cannot be negative.';
    }

    if (formData.quantity === '' || formData.quantity === null) {
      newErrors.quantity = 'Quantity is required.';
    } else if (Number(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity cannot be negative.';
    } else if (!Number.isInteger(Number(formData.quantity))) {
      newErrors.quantity = 'Quantity must be a whole number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateId = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({ ...prev, productId: `PRD-${randomDigits}` }));
    if (errors.productId) {
      setErrors(prev => ({ ...prev, productId: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        productId: formData.productId.trim(),
        name: formData.name.trim(),
        category: formData.category ? formData.category.trim() : null,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        description: formData.description ? formData.description.trim() : null
      };

      await onSave(payload, productToEdit?.id);
      onClose();
    } catch (err) {
      if (err.fieldErrors) {
        setErrors(prev => ({ ...prev, ...err.fieldErrors }));
      } else {
        setErrors(prev => ({ ...prev, form: err.message }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {productToEdit ? 'Edit Product Details' : 'Add New Product'}
          </h2>
          <button className="btn btn-outline btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.form && (
              <div 
                style={{ 
                  background: '#fef2f2', 
                  border: '1px solid #fecaca', 
                  color: '#b91c1c', 
                  padding: '10px 14px', 
                  borderRadius: '8px', 
                  fontSize: '0.86rem', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={18} />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Product ID */}
            <div className="form-group">
              <label className="form-label">
                Product ID <span className="required">*</span>
              </label>
              <div className="input-with-button">
                <input
                  type="text"
                  className={`form-input ${errors.productId ? 'has-error' : ''}`}
                  placeholder="e.g. PRD-101"
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  disabled={submitting}
                />
                {!productToEdit && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleGenerateId}
                    title="Generate unique Product ID"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Sparkles size={14} />
                    <span>Auto ID</span>
                  </button>
                )}
              </div>
              {errors.productId && <div className="form-error">{errors.productId}</div>}
            </div>

            {/* Product Name */}
            <div className="form-group">
              <label className="form-label">
                Product Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'has-error' : ''}`}
                placeholder="e.g. Whole Wheat Bread"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={submitting}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={submitting}
              >
                <option value="Bakery">Bakery</option>
                <option value="Dairy">Dairy</option>
                <option value="Beverages">Beverages</option>
                <option value="Pantry">Pantry</option>
                <option value="Grains">Grains</option>
                <option value="Snacks">Snacks</option>
                <option value="Stationery">Stationery</option>
                <option value="Household">Household</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Price and Quantity (Side by side) */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Price (₹) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`form-input ${errors.price ? 'has-error' : ''}`}
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  disabled={submitting}
                />
                {errors.price && <div className="form-error">{errors.price}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Stock Quantity <span className="required">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  className={`form-input ${errors.quantity ? 'has-error' : ''}`}
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  disabled={submitting}
                />
                {errors.quantity && <div className="form-error">{errors.quantity}</div>}
              </div>
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description (Optional)</label>
              <textarea
                className="form-input"
                rows="2"
                placeholder="Product packaging, weight, or brand details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : productToEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
