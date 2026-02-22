import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

type Item = {
  id: number;
  name: string;
  price: number;
};

const UserOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [order, setOrder] = useState<{ [id: number]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('items').select('*').order('id', { ascending: true });
      if (!error && data) setItems(data);
      setLoading(false);
    };
    fetchItems();
  }, []);

  const handleChange = (id: number, value: number) => {
    setOrder({ ...order, [id]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(JSON.stringify(order, null, 2));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Order Coffee Items</h2>
        <div className="flex gap-2">
          <a href="/admin" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Go to Admin Page</a>
          <button onClick={handleLogout} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Logout</button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {loading ? (
          <div>Loading items...</div>
        ) : items.length === 0 ? (
          <div>No items available.</div>
        ) : (
          <div className="space-y-2 flex flex-col items-center">
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-3 gap-6 items-center bg-white p-3 rounded shadow w-full max-w-md">
                <span className="font-medium text-left col-span-1">{item.name}</span>
                <span className="text-center col-span-1">${item.price.toFixed(2)}</span>
                <input
                  type="number"
                  min={0}
                  value={order[item.id] || 0}
                  onChange={e => handleChange(item.id, Number(e.target.value))}
                  className="border p-2 rounded w-20 text-right col-span-1"
                />
              </div>
            ))}
          </div>
        )}
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Submit Order
        </button>
      </form>
    </div>
  );
};

export default UserOrderPage;
