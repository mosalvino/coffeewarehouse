
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

type Item = {
  id: number;
  name: string;
  price: number;
  category: string;
};

const AdminPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState(0);
  const [itemCategory, setItemCategory] = useState('coffee');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('id', { ascending: true });
      if (!error && data) setItems(data);
      setLoading(false);
    };
    fetchItems();
  }, []);

  const handleAddItem = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!itemName.trim() || itemPrice <= 0 || !itemCategory) return;
      setAdding(true);
      const { data, error } = await supabase
        .from('items')
        .insert([{ name: itemName, price: itemPrice, category: itemCategory }])
        .select();
      if (!error && data && data[0]) {
        setItems(prev => [...prev, data[0]]);
        setItemName('');
        setItemPrice(0);
        setItemCategory('coffee');
      }
      setAdding(false);
    },
    [itemName, itemPrice, itemCategory]
  );

  const handleRemoveItem = useCallback(
    async (id: number) => {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (!error) {
        setItems(prev => prev.filter(item => item.id !== id));
      }
    },
    []
  );

  // Accordion state
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // Group items by category
  const categories = [
    { key: 'coffee', label: 'Coffee' },
    { key: 'syrups', label: 'Syrups' },
    { key: 'sodas', label: 'Sodas' },
    { key: 'filters', label: 'Filters' }
  ];
  const itemsByCategory: { [key: string]: Item[] } = {};
  categories.forEach(cat => {
    itemsByCategory[cat.key] = items.filter(item => item.category === cat.key);
  });

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>Admin: Manage Items</h2>
      <form onSubmit={handleAddItem} style={{ marginBottom: 24 }}>
        <input
          type="text"
          value={itemName}
          onChange={e => setItemName(e.target.value)}
          placeholder="Item name"
          style={{ marginRight: 8, padding: 8 }}
          required
        />
        <input
          type="number"
          value={itemPrice}
          onChange={e => setItemPrice(Number(e.target.value))}
          placeholder="Price"
          min={0.01}
          step={0.01}
          style={{ marginRight: 8, padding: 8 }}
          required
        />
        <select
          value={itemCategory}
          onChange={e => setItemCategory(e.target.value)}
          style={{ marginRight: 8, padding: 8 }}
          required
        >
          <option value="coffee">Coffee</option>
          <option value="syrups">Syrups</option>
          <option value="sodas">Sodas</option>
          <option value="filters">Filters</option>
        </select>
        <button type="submit" disabled={adding} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>
          {adding ? 'Adding...' : 'Add Item'}
        </button>
      </form>
      <section>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>Current Items</h3>
        {loading ? (
          <div style={{ color: '#888', textAlign: 'center' }}>Loading...</div>
        ) : (
          categories.map(cat => (
            <div key={cat.key} style={{ marginBottom: 16, border: '1px solid #222', borderRadius: 4, background: '#181818' }}>
              <button
                type="button"
                style={{ width: '100%', background: '#222', color: '#fff', padding: '12px 16px', border: 'none', borderRadius: '4px 4px 0 0', fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}
                onClick={() => setOpenCategory(openCategory === cat.key ? null : cat.key)}
              >
                {cat.label} ({itemsByCategory[cat.key].length})
                <span style={{ float: 'right' }}>{openCategory === cat.key ? '▲' : '▼'}</span>
              </button>
              {openCategory === cat.key && (
                itemsByCategory[cat.key].length === 0 ? (
                  <div style={{ background: '#222', color: '#bbb', padding: 16, borderRadius: '0 0 4px 4px' }}>No items in this category.</div>
                ) : (
                  <ul style={{ background: '#222', color: '#fff', padding: 16, borderRadius: '0 0 4px 4px', listStyle: 'none', margin: 0 }}>
                    {itemsByCategory[cat.key].map(item => (
                      <li
                        key={item.id}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}
                      >
                        <span style={{ flex: 2 }}>{item.name}</span>
                        <span style={{ flex: 1, textAlign: 'center' }}>${item.price.toFixed(2)}</span>
                        <button
                          type="button"
                          style={{ padding: '4px 12px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, marginLeft: 8, cursor: 'pointer' }}
                          onClick={() => handleRemoveItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default AdminPage;
