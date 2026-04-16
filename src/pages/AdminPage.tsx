
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

type Category = {
  id: number;
  Category: string;
};

const AdminPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('catagories')
        .select('*')
        .order('id', { ascending: true });
      if (!error && data) setCategories(data as Category[]);
      setLoading(false);
    };
    fetchItems();
  }, []);

  const handleAddCategory = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!categoryName.trim()) return;
      setAdding(true);
      const { data, error } = await supabase
        .from('catagories')
        .insert([{ Category: categoryName.trim() }])
        .select();
      if (!error && data && data[0]) {
        setCategories(prev => [...prev, data[0] as Category]);
        setCategoryName('');
      }
      setAdding(false);
    },
    [categoryName]
  );

  const handleRemoveCategory = useCallback(
    async (id: number) => {
      const { error } = await supabase.from('catagories').delete().eq('id', id);
      if (!error) {
        setCategories(prev => prev.filter(cat => cat.id !== id));
      }
    },
    []
  );

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>Admin: Manage Categories</h2>
      <form onSubmit={handleAddCategory} style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={categoryName}
          onChange={e => setCategoryName(e.target.value)}
          placeholder="Category name"
          style={{ flex: 1, padding: 8 }}
          required
        />
        <button type="submit" disabled={adding} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>
          {adding ? 'Adding...' : 'Add Category'}
        </button>
      </form>
      <section>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>Current Categories</h3>
        {loading ? (
          <div style={{ color: '#888', textAlign: 'center' }}>Loading...</div>
        ) : categories.length === 0 ? (
          <div style={{ color: '#bbb', textAlign: 'center' }}>No categories yet.</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {categories.map(cat => (
              <li
                key={cat.id}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#181818', border: '1px solid #222', borderRadius: 4, padding: '12px 16px' }}
              >
                <span style={{ color: '#fff', fontWeight: 500 }}>{cat.Category}</span>
                <button
                  type="button"
                  style={{ padding: '4px 12px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                  onClick={() => handleRemoveCategory(cat.id)}
                  aria-label={`Remove ${cat.Category}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default AdminPage;
