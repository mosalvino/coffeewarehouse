import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { CatalogItem, OrderReviewState } from '../types/catalog';

const formatItemLabel = (item: CatalogItem): string => {
  const sku = item.sku ? `${item.sku} - ` : '';
  const size = item.pack_size ? ` (${item.pack_size})` : '';
  const price = item.unit_price != null ? ` - $${item.unit_price.toFixed(2)}` : '';
  return `${sku}${item.name}${size}${price}`;
};

const OrderReviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as OrderReviewState | null;

  if (!state) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, color: '#fff' }}>
        <p>
          No order data found.{' '}
          <button
            type="button"
            onClick={() => navigate('/order')}
            style={{
              background: 'none',
              color: '#1976d2',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Go back to order page.
          </button>
        </p>
      </div>
    );
  }

  const { order, categories } = state;

  type ReviewRow = { category: string; product: string; item: string; qty: number };
  const rows: ReviewRow[] = [];
  for (const cat of categories) {
    for (const prod of cat.products ?? []) {
      for (const item of prod.items ?? []) {
        const qty = order[item.id] ?? 0;
        if (qty > 0) {
          rows.push({ category: cat.name, product: prod.name, item: formatItemLabel(item), qty });
        }
      }
    }
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 24 }}>Order Review</h2>

      {rows.length === 0 ? (
        <div style={{ color: '#aaa', marginBottom: 24 }}>No items selected. Go back and add quantities.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: '#222', color: '#aaa', textAlign: 'left', fontSize: 13 }}>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Product</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Item</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right' }}>Qty</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={`${row.item}-${i}`}
                style={{
                  background: i % 2 === 0 ? '#181818' : '#1e1e1e',
                  color: '#fff',
                  borderBottom: '1px solid #2a2a2a',
                }}
              >
                <td style={{ padding: '10px 14px' }}>{row.category}</td>
                <td style={{ padding: '10px 14px' }}>{row.product}</td>
                <td style={{ padding: '10px 14px' }}>{row.item}</td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>{row.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        type="button"
        onClick={() => navigate('/order')}
        style={{ background: '#444', color: '#fff', padding: '8px 20px', borderRadius: 4, border: 'none', cursor: 'pointer' }}
      >
        ← Back to Order
      </button>
    </div>
  );
};

export default OrderReviewPage;
