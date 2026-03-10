
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import emailjs from '@emailjs/browser'; // Used for sending order emails

type Item = {
  id: number;
  name: string;
  price: number;
  category: string;
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
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center', width: '100%' }}>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', width: '100%' }}>Order Coffee Items</h2>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div style={{ color: '#888', textAlign: 'center' }}>Loading items...</div>
        ) : (
          categories.map(cat => (
            <div key={cat.key} style={{ marginBottom: 16, border: '1px solid #222', borderRadius: 4, background: '#181818' }}>
              <button
                type="button"
                style={{ width: '100%', background: '#222', color: '#fff', padding: '12px 16px', border: 'none', borderRadius: '4px 4px 0 0', fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}
                onClick={() => setOpenCategory(openCategory === cat.key ? null : cat.key)}
              >
                {cat.label} ({itemsByCategory[cat.key]?.length || 0})
                <span style={{ float: 'right' }}>{openCategory === cat.key ? '▲' : '▼'}</span>
              </button>
              {openCategory === cat.key && (
                itemsByCategory[cat.key]?.length === 0 ? (
                  <div style={{ background: '#222', color: '#bbb', padding: 16, borderRadius: '0 0 4px 4px' }}>No items in this category.</div>
                ) : (
                  <ul style={{ background: '#222', color: '#fff', padding: 16, borderRadius: '0 0 4px 4px', listStyle: 'none', margin: 0 }}>
                    {itemsByCategory[cat.key].map(item => (
                      <li key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ flex: 2 }}>{item.name}</span>
                        <span style={{ flex: 1, textAlign: 'center' }}>${item.price.toFixed(2)}</span>
                        <input
                          type="number"
                          min={0}
                          value={order[item.id] || 0}
                          onChange={e => handleChange(item.id, Number(e.target.value))}
                          style={{ border: '1px solid #ccc', padding: 8, borderRadius: 4, width: 60, textAlign: 'right' }}
                        />
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          ))
        )}
        <button type="submit" style={{ background: '#388e3c', color: '#fff', padding: '8px 16px', borderRadius: 4, border: 'none' }}>
          Submit Order
        </button>
      </form>
    </div>
  );
};

export default UserOrderPage;
