
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

type Category = { id: number; Category: string; };
type Product = { id: number; Product: string; catagoryId: number; };
type Item = { id: number; item: string; productId: number; };

const inputStyle: React.CSSProperties = { flex: 1, padding: '8px 10px', background: '#111', color: '#fff', border: '1px solid #444', borderRadius: 4 };
const btnStyle = (color: string): React.CSSProperties => ({ padding: '8px 14px', background: color, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', whiteSpace: 'nowrap' });
const sectionStyle: React.CSSProperties = { marginBottom: 12 };
const labelStyle: React.CSSProperties = { display: 'block', color: '#aaa', fontSize: 13, marginBottom: 4 };
const accordionHeaderStyle = (open: boolean): React.CSSProperties => ({
  width: '100%', background: '#222', color: '#fff', padding: '12px 16px', border: 'none',
  borderRadius: open ? '4px 4px 0 0' : 4, fontWeight: 700, fontSize: 16,
  textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
});
const accordionBodyStyle: React.CSSProperties = {
  border: '1px solid #2a2a2a', borderTop: 'none', borderRadius: '0 0 4px 4px',
  background: '#161616', padding: '16px',
};

const AdminPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [catName, setCatName] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodCatId, setProdCatId] = useState<number | ''>('');
  const [itemName, setItemName] = useState('');
  const [itemProdId, setItemProdId] = useState<number | ''>('');

  const [saving, setSaving] = useState(false);
  const [openSection, setOpenSection] = useState<'categories' | 'products' | 'items' | null>('categories');

  const toggleSection = (s: 'categories' | 'products' | 'items') =>
    setOpenSection(prev => (prev === s ? null : s));

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [cats, prods, itms] = await Promise.all([
        supabase.from('catagories').select('*').order('id'),
        supabase.from('products').select('*').order('id'),
        supabase.from('items').select('*').order('id'),
      ]);
      if (cats.data) setCategories(cats.data as Category[]);
      if (prods.data) setProducts(prods.data as Product[]);
      if (itms.data) setItems(itms.data as Item[]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleAddCategory = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setSaving(true);
    const { data, error } = await supabase.from('catagories').insert([{ Category: catName.trim() }]).select();
    if (!error && data?.[0]) { setCategories(prev => [...prev, data[0] as Category]); setCatName(''); }
    setSaving(false);
  }, [catName]);

  const handleAddProduct = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || prodCatId === '') return;
    setSaving(true);
    const { data, error } = await supabase.from('products').insert([{ Product: prodName.trim(), catagoryId: prodCatId }]).select();
    if (!error && data?.[0]) { setProducts(prev => [...prev, data[0] as Product]); setProdName(''); }
    setSaving(false);
  }, [prodName, prodCatId]);

  const handleAddItem = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || itemProdId === '') return;
    setSaving(true);
    const { data, error } = await supabase.from('items').insert([{ item: itemName.trim(), productId: itemProdId }]).select();
    if (!error && data?.[0]) { setItems(prev => [...prev, data[0] as Item]); setItemName(''); }
    setSaving(false);
  }, [itemName, itemProdId]);

  const removeCategory = useCallback(async (id: number) => {
    const { error } = await supabase.from('catagories').delete().eq('id', id);
    if (!error) setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const removeProduct = useCallback(async (id: number) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const removeItem = useCallback(async (id: number) => {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (!error) setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  if (loading) return <div style={{ padding: 24, color: '#888', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 32 }}>Admin: Manage Menu</h2>

      {/* ── Categories ── */}
      <div style={sectionStyle}>
        <button type="button" style={accordionHeaderStyle(openSection === 'categories')} onClick={() => toggleSection('categories')}>
          Categories <span>{openSection === 'categories' ? '▲' : '▼'}</span>
        </button>
        {openSection === 'categories' && (
          <div style={accordionBodyStyle}>
        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input style={inputStyle} value={catName} onChange={e => setCatName(e.target.value)} placeholder="New category name" required />
          <button type="submit" style={btnStyle('#1976d2')} disabled={saving}>Add</button>
        </form>
        {categories.length === 0 ? (
          <div style={{ color: '#666' }}>No categories yet.</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {categories.map(cat => (
              <li key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#181818', border: '1px solid #2a2a2a', borderRadius: 4, padding: '10px 14px' }}>
                <span style={{ color: '#fff' }}>{cat.Category}</span>
                <button type="button" style={btnStyle('#d32f2f')} onClick={() => removeCategory(cat.id)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
          </div>
        )}
      </div>

      {/* ── Products ── */}
      <div style={sectionStyle}>
        <button type="button" style={accordionHeaderStyle(openSection === 'products')} onClick={() => toggleSection('products')}>
          Products <span>{openSection === 'products' ? '▲' : '▼'}</span>
        </button>
        {openSection === 'products' && (
          <div style={accordionBodyStyle}>
        <form onSubmit={handleAddProduct} style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Product name</label>
            <input style={inputStyle} value={prodName} onChange={e => setProdName(e.target.value)} placeholder="Product name" required />
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
              {categories.map(c => <option key={c.id} value={c.id}>{c.Category}</option>)}
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
              const cat = categories.find(c => c.id === prod.catagoryId);
              return (
                <li key={prod.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#181818', border: '1px solid #2a2a2a', borderRadius: 4, padding: '10px 14px' }}>
                  <span style={{ color: '#fff' }}>{prod.Product}</span>
                  <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>{cat?.Category ?? '—'}</span>
                  <button type="button" style={{ ...btnStyle('#d32f2f'), marginLeft: 'auto' }} onClick={() => removeProduct(prod.id)}>Remove</button>
                </li>
              );
            })}
          </ul>
        )}
          </div>
        )}
      </div>

      {/* ── Items ── */}
      <div style={sectionStyle}>
        <button type="button" style={accordionHeaderStyle(openSection === 'items')} onClick={() => toggleSection('items')}>
          Items <span>{openSection === 'items' ? '▲' : '▼'}</span>
        </button>
        {openSection === 'items' && (
          <div style={accordionBodyStyle}>
        <form onSubmit={handleAddItem} style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Item name</label>
            <input style={inputStyle} value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Item name" required />
          </div>
          <div style={{ flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Product</label>
            <select
              style={{ ...inputStyle, flex: 'unset' }}
              value={itemProdId}
              onChange={e => setItemProdId(Number(e.target.value))}
              required
            >
              <option value="">Select product</option>
              {products.map(p => {
                const cat = categories.find(c => c.id === p.catagoryId);
                return <option key={p.id} value={p.id}>{p.Product}{cat ? ` (${cat.Category})` : ''}</option>;
              })}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" style={btnStyle('#1976d2')} disabled={saving}>Add</button>
          </div>
        </form>
        {items.length === 0 ? (
          <div style={{ color: '#666' }}>No items yet.</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map(itm => {
              const prod = products.find(p => p.id === itm.productId);
              const cat = categories.find(c => c.id === prod?.catagoryId);
              return (
                <li key={itm.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#181818', border: '1px solid #2a2a2a', borderRadius: 4, padding: '10px 14px' }}>
                  <span style={{ color: '#fff', flex: 1 }}>{itm.item}</span>
                  <span style={{ color: '#888', fontSize: 13 }}>{prod?.Product ?? '—'}</span>
                  <span style={{ color: '#666', fontSize: 12 }}>{cat ? `(${cat.Category})` : ''}</span>
                  <button type="button" style={btnStyle('#d32f2f')} onClick={() => removeItem(itm.id)}>Remove</button>
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
