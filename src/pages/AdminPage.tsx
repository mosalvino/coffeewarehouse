import React, { useCallback, useEffect, useState } from 'react';
import {
  createCategory,
  createItem,
  createProduct,
  deleteCategory,
  deleteItem,
  deleteProduct,
  fetchAdminCatalogData,
} from '../lib/catalogApi';
import type { CatalogCategory, CatalogItem, CatalogProduct } from '../types/catalog';

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 10px',
  background: '#111',
  color: '#fff',
  border: '1px solid #444',
  borderRadius: 4,
};
const btnStyle = (color: string): React.CSSProperties => ({
  padding: '8px 14px',
  background: color,
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});
const sectionStyle: React.CSSProperties = { marginBottom: 12 };
const labelStyle: React.CSSProperties = { display: 'block', color: '#aaa', fontSize: 13, marginBottom: 4 };
const accordionHeaderStyle = (open: boolean): React.CSSProperties => ({
  width: '100%',
  background: '#222',
  color: '#fff',
  padding: '12px 16px',
  border: 'none',
  borderRadius: open ? '4px 4px 0 0' : 4,
  fontWeight: 700,
  fontSize: 16,
  textAlign: 'left',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});
const accordionBodyStyle: React.CSSProperties = {
  border: '1px solid #2a2a2a',
  borderTop: 'none',
  borderRadius: '0 0 4px 4px',
  background: '#161616',
  padding: '16px',
};

const AdminPage: React.FC = () => {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [catName, setCatName] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodCatId, setProdCatId] = useState<number | ''>('');
  const [itemProdId, setItemProdId] = useState<number | ''>('');
  const [itemName, setItemName] = useState('');
  const [itemSku, setItemSku] = useState('');
  const [itemPackSize, setItemPackSize] = useState('');
  const [itemUnitPrice, setItemUnitPrice] = useState('');
  const [itemCasePrice, setItemCasePrice] = useState('');
  const [itemPerUnitPrice, setItemPerUnitPrice] = useState('');

  const [saving, setSaving] = useState(false);
  const [openSection, setOpenSection] = useState<'categories' | 'products' | 'items' | null>('categories');

  const toggleSection = (s: 'categories' | 'products' | 'items') =>
    setOpenSection(prev => (prev === s ? null : s));

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminCatalogData();
      setCategories(data.categories);
      setProducts(data.products);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load catalog data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleAddCategory = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!catName.trim()) return;
      setSaving(true);
      setError(null);
      try {
        const category = await createCategory(catName.trim());
        setCategories(prev => [...prev, category]);
        setCatName('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add category.');
      } finally {
        setSaving(false);
      }
    },
    [catName]
  );

  const handleAddProduct = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!prodName.trim() || prodCatId === '') return;
      setSaving(true);
      setError(null);
      try {
        const product = await createProduct(prodName.trim(), prodCatId);
        setProducts(prev => [...prev, product]);
        setProdName('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add product.');
      } finally {
        setSaving(false);
      }
    },
    [prodName, prodCatId]
  );

  const handleAddItem = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!itemName.trim() || itemProdId === '') return;
      setSaving(true);
      setError(null);
      try {
        const created = await createItem({
          product_id: itemProdId,
          name: itemName.trim(),
          sku: itemSku.trim(),
          pack_size: itemPackSize.trim(),
          unit_price: itemUnitPrice ? Number(itemUnitPrice) : undefined,
          case_price: itemCasePrice ? Number(itemCasePrice) : undefined,
          per_unit_price: itemPerUnitPrice ? Number(itemPerUnitPrice) : undefined,
        });
        setItems(prev => [...prev, created]);
        setItemName('');
        setItemSku('');
        setItemPackSize('');
        setItemUnitPrice('');
        setItemCasePrice('');
        setItemPerUnitPrice('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add item.');
      } finally {
        setSaving(false);
      }
    },
    [itemName, itemProdId, itemSku, itemPackSize, itemUnitPrice, itemCasePrice, itemPerUnitPrice]
  );

  const removeCategory = useCallback(async (id: number) => {
    setError(null);
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      setProducts(prev => prev.filter(p => p.category_id !== id));
      setItems(prev => {
        const removedProductIds = new Set(products.filter(p => p.category_id === id).map(p => p.id));
        return prev.filter(i => !removedProductIds.has(i.product_id));
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove category.');
    }
  }, [products]);

  const removeProduct = useCallback(async (id: number) => {
    setError(null);
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setItems(prev => prev.filter(i => i.product_id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove product.');
    }
  }, []);

  const removeItem = useCallback(async (id: number) => {
    setError(null);
    try {
      await deleteItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item.');
    }
  }, []);

  if (loading) return <div style={{ padding: 24, color: '#888', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>Admin: Manage Catalog</h2>
      <p style={{ color: '#a0a0a0', marginTop: 0, marginBottom: 20 }}>
        New structure: Category {'->'} Product {'->'} Item (SKU, size, pricing).
      </p>
      {error && (
        <div style={{ marginBottom: 16, color: '#ffcdd2', background: '#5f2120', borderRadius: 4, padding: '8px 12px' }}>
          {error}
        </div>
      )}

      <div style={sectionStyle}>
        <button type="button" style={accordionHeaderStyle(openSection === 'categories')} onClick={() => toggleSection('categories')}>
          Categories <span>{openSection === 'categories' ? '▲' : '▼'}</span>
        </button>
        {openSection === 'categories' && (
          <div style={accordionBodyStyle}>
            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                style={inputStyle}
                value={catName}
                onChange={e => setCatName(e.target.value)}
                placeholder="New category name"
                required
              />
              <button type="submit" style={btnStyle('#1976d2')} disabled={saving}>Add</button>
            </form>
            {categories.length === 0 ? (
              <div style={{ color: '#666' }}>No categories yet.</div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {categories.map(cat => (
                  <li
                    key={cat.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#181818',
                      border: '1px solid #2a2a2a',
                      borderRadius: 4,
                      padding: '10px 14px',
                    }}
                  >
                    <span style={{ color: '#fff' }}>{cat.name}</span>
                    <button type="button" style={btnStyle('#d32f2f')} onClick={() => removeCategory(cat.id)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <button type="button" style={accordionHeaderStyle(openSection === 'products')} onClick={() => toggleSection('products')}>
          Products <span>{openSection === 'products' ? '▲' : '▼'}</span>
        </button>
        {openSection === 'products' && (
          <div style={accordionBodyStyle}>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 2, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={labelStyle}>Product name</label>
                <input
                  style={inputStyle}
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  placeholder="Product name"
                  required
                />
              </div>
              <div style={{ flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={labelStyle}>Category</label>
                <select
                  style={{ ...inputStyle, flex: 'unset' }}
                  value={prodCatId}
                  onChange={e => setProdCatId(Number(e.target.value))}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" style={btnStyle('#1976d2')} disabled={saving}>Add</button>
              </div>
            </form>
            {products.length === 0 ? (
              <div style={{ color: '#666' }}>No products yet.</div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {products.map(prod => {
                  const cat = categories.find(c => c.id === prod.category_id);
                  return (
                    <li
                      key={prod.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#181818',
                        border: '1px solid #2a2a2a',
                        borderRadius: 4,
                        padding: '10px 14px',
                      }}
                    >
                      <span style={{ color: '#fff' }}>{prod.name}</span>
                      <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>{cat?.name ?? '—'}</span>
                      <button
                        type="button"
                        style={{ ...btnStyle('#d32f2f'), marginLeft: 'auto' }}
                        onClick={() => removeProduct(prod.id)}
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <button type="button" style={accordionHeaderStyle(openSection === 'items')} onClick={() => toggleSection('items')}>
          Items <span>{openSection === 'items' ? '▲' : '▼'}</span>
        </button>
        {openSection === 'items' && (
          <div style={accordionBodyStyle}>
            <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))', gap: 10, marginBottom: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={labelStyle}>Product</label>
                <select
                  style={{ ...inputStyle, flex: 'unset' }}
                  value={itemProdId}
                  onChange={e => setItemProdId(Number(e.target.value))}
                  required
                >
                  <option value="">Select product</option>
                  {products.map(p => {
                    const cat = categories.find(c => c.id === p.category_id);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name}{cat ? ` (${cat.name})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={labelStyle}>Item name</label>
                <input style={inputStyle} value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Item name" required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={labelStyle}>SKU</label>
                <input style={inputStyle} value={itemSku} onChange={e => setItemSku(e.target.value)} placeholder="e.g. 801" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={labelStyle}>Pack size</label>
                <input style={inputStyle} value={itemPackSize} onChange={e => setItemPackSize(e.target.value)} placeholder="e.g. 750ml" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={labelStyle}>Unit price</label>
                <input style={inputStyle} type="number" step="0.01" min="0" value={itemUnitPrice} onChange={e => setItemUnitPrice(e.target.value)} placeholder="7.49" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={labelStyle}>Case price</label>
                <input style={inputStyle} type="number" step="0.01" min="0" value={itemCasePrice} onChange={e => setItemCasePrice(e.target.value)} placeholder="124.95" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={labelStyle}>Per-unit price</label>
                <input style={inputStyle} type="number" step="0.01" min="0" value={itemPerUnitPrice} onChange={e => setItemPerUnitPrice(e.target.value)} placeholder="24.99" />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" style={btnStyle('#1976d2')} disabled={saving}>Add Item</button>
              </div>
            </form>

            {items.length === 0 ? (
              <div style={{ color: '#666' }}>No items yet.</div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {items.map(itm => {
                  const prod = products.find(p => p.id === itm.product_id);
                  const cat = categories.find(c => c.id === prod?.category_id);
                  const priceText = itm.unit_price != null ? ` | $${itm.unit_price.toFixed(2)}` : '';
                  return (
                    <li
                      key={itm.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#181818',
                        border: '1px solid #2a2a2a',
                        borderRadius: 4,
                        padding: '10px 14px',
                      }}
                    >
                      <span style={{ color: '#fff', flex: 1 }}>
                        {itm.sku ? `${itm.sku} - ` : ''}
                        {itm.name}
                        {itm.pack_size ? ` (${itm.pack_size})` : ''}
                        {priceText}
                      </span>
                      <span style={{ color: '#888', fontSize: 13 }}>{prod?.name ?? '—'}</span>
                      <span style={{ color: '#666', fontSize: 12 }}>{cat ? `(${cat.name})` : ''}</span>
                      <button type="button" style={btnStyle('#d32f2f')} onClick={() => removeItem(itm.id)}>
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
