
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export type Item = {
  id: number;
  name: string;
  price: number;
};

const AdminPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState(0);
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
      if (!itemName.trim() || itemPrice <= 0) return;
      setAdding(true);
      const { data, error } = await supabase
        .from('items')
        .insert([{ name: itemName, price: itemPrice }])
        .select();
      if (!error && data && data[0]) {
        setItems(prev => [...prev, data[0]]);
        setItemName('');
        setItemPrice(0);
      }
      setAdding(false);
    },
    [itemName, itemPrice]
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

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-center w-full">
        <h2 className="text-2xl font-bold text-center w-full">Admin: Add Coffee Item</h2>
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAddItem} className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8">
        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={e => setItemName(e.target.value)}
          className="border p-2 rounded w-64"
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={itemPrice}
          min={0.01}
          step={0.01}
          onChange={e => setItemPrice(Number(e.target.value))}
          className="border p-2 rounded w-32"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-60"
          disabled={adding}
        >
          {adding ? 'Adding...' : 'Add Item'}
        </button>
      </form>

      {/* Items List */}
      <section className="flex flex-col items-center">
        <h3 className="text-xl font-semibold mb-2 text-center">Current Items</h3>
        {loading ? (
          <div className="text-gray-500 text-center">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500 text-center">No items added yet.</div>
        ) : (
          <ul className="space-y-2 flex flex-col items-center w-full">
            {items.map(item => (
              <li
                key={item.id}
                className="flex gap-8 items-center bg-white p-2 rounded shadow w-full max-w-md justify-center"
              >
                <span className="w-48 font-medium text-center">{item.name}</span>
                <span className="w-24 text-center">${item.price.toFixed(2)}</span>
                <button
                  type="button"
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => handleRemoveItem(item.id)}
                  aria-label={`Remove ${item.name}`}
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
};

export default AdminPage;
