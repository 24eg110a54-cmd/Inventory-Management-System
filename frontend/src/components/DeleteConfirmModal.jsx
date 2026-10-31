import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, product }) {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !product) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm(product.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} />
            <span>Confirm Deletion</span>
          </h2>
          <button className="btn btn-outline btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: '#334155', fontSize: '0.92rem', marginBottom: '12px' }}>
            Are you sure you want to permanently delete <strong>{product.name}</strong> (<code>{product.productId}</code>) from the shop inventory?
          </p>
          <div style={{ background: '#fef2f2', padding: '10px 14px', borderRadius: '6px', fontSize: '0.82rem', color: '#991b1b' }}>
            This action cannot be undone. All stock history for this item will be removed.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleConfirm} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
