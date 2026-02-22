import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export type Item = {
  id: number;
  name: string;
  price: number;
};

const AdminPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('items').select('*').order('id', { ascending: true });
      if (!error && data) setItems(data);
      setLoading(false);
    };
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || price <= 0) return;
    setAdding(true);
    const { data, error } = await supabase.from('items').insert([{ name, price }]).select();
    if (!error && data && data[0]) {
      setItems(prev => [...prev, data[0]]);
      setName('');
      setPrice(0);
    }
    setAdding(false);
  };

  const handleRemoveItem = async (id: number) => {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (!error) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Admin: Add Coffee Item</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Item Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border p-2 rounded w-64"
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          min={0.01}
          step={0.01}
          onChange={e => setPrice(Number(e.target.value))}
          className="border p-2 rounded w-32"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={adding}>
          {adding ? 'Adding...' : 'Add Item'}
        </button>
      </form>

      <h3 className="text-xl font-semibold mt-8 mb-2 text-right">Current Items</h3>
      {loading ? (
        <div className="text-gray-500 text-right">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-gray-500 text-right">No items added yet.</div>
      ) : (
        <ul className="space-y-2 flex flex-col items-end">
          {items.map(item => (
            <li key={item.id} className="flex gap-8 items-center bg-white p-2 rounded shadow w-full max-w-md justify-end">
              <span className="w-48 font-medium text-right">{item.name}&nbsp;</span>
              <span className="w-24 text-right">${item.price.toFixed(2)}</span>
              <button
                type="button"
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onClick={() => handleRemoveItem(item.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminPage;
