
import React, { useState, useEffect, useCallback } from 'react';
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
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
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

  const handleChange = useCallback((id: number, value: number) => {
    setOrder(prev => ({ ...prev, [id]: value }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
  }, [order, items, userEmail]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center', width: '100%' }}>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', width: '100%' }}>Order Coffee Items</h2>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div>Loading items...</div>
        ) : items.length === 0 ? (
          <div>No items available.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            {items.map(item => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, alignItems: 'center', background: '#222', color: '#fff', padding: 12, borderRadius: 4, boxShadow: '0 2px 8px #0002', width: '100%', maxWidth: 400 }}>
                <span style={{ fontWeight: 'bold', textAlign: 'left' }}>{item.name}</span>
                <span style={{ textAlign: 'center' }}>${item.price.toFixed(2)}</span>
                <input
                  type="number"
                  min={0}
                  value={order[item.id] || 0}
                  onChange={e => handleChange(item.id, Number(e.target.value))}
                  style={{ border: '1px solid #ccc', padding: 8, borderRadius: 4, width: 60, textAlign: 'right' }}
                />
              </div>
            ))}
          </div>
        )}
        <button type="submit" style={{ background: '#388e3c', color: '#fff', padding: '8px 16px', borderRadius: 4, border: 'none' }}>
          Submit Order
        </button>
      </form>
    </div>
  );
};

export default UserOrderPage;
