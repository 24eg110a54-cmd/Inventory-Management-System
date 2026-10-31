import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function LowStockBanner({ count, onViewLowStock }) {
  if (!count || count <= 0) return null;

  return (
    <div className="low-stock-banner">
      <div className="banner-left">
        <div style={{ color: '#ea580c', display: 'flex', alignItems: 'center' }}>
          <AlertTriangle size={24} />
        </div>
        <div>
          <div className="banner-title">
            Restock Required: {count} {count === 1 ? 'item is' : 'items are'} below the minimum stock threshold (&lt; 5 units)!
          </div>
          <div className="banner-desc">
            Products with less than five items in stock need urgent restocking to prevent inventory outage.
          </div>
        </div>
      </div>
      <button 
        className="btn btn-sm" 
        style={{ background: '#78350f', color: '#ffffff', whiteSpace: 'nowrap' }}
        onClick={onViewLowStock}
      >
        <span>View Restock Items</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
