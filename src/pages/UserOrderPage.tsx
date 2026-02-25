import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import emailjs from '@emailjs/browser';

type Item = {
  id: number;
  name: string;
  price: number;
};

const UserOrderPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [order, setOrder] = useState<{ [id: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  useEffect(() => {
    // Fetch logged-in user's email
    const fetchUserEmail = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data?.user?.email || '');
    };
    fetchUserEmail();
  }, []);

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
    // Prepare email parameters
    const orderDetails = Object.entries(order)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = items.find(i => i.id === Number(id));
        return item ? `${item.name} (x${qty})` : '';
      })
      .filter(Boolean)
      .join(', ');

    const templateParams = {
      order: orderDetails,
      to_email: userEmail,
    };

    emailjs
      .send(
        'service_kdoh0ix',
        'template_z2011r9',
        templateParams,
        'SFHE49sqOg0Y89zVb'
      )
      .then(
        () => {
          alert('Order submitted and email sent!');
        },
        (error) => {
          alert('Failed to send email: ' + error.text);
        }
      );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
          <div className="mb-4" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <h2 style={{ textAlign: 'center', width: '100%' }}>Order Coffee Items</h2>
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
