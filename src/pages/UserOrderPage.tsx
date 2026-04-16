
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import emailjs from '@emailjs/browser'; // Used for sending order emails

type Item = {
  id: number;
  item: string;
  productId: number;
};

type Product = {
  id: number;
  Product: string;
  catagoryId: number;
  items: Item[];
};

type Category = {
  id: number;
  Category: string;
  products: Product[];
};

const UserOrderPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [order, setOrder] = useState<{ [itemId: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [openProducts, setOpenProducts] = useState<Set<number>>(new Set());

  const toggleProduct = useCallback((productId: number) => {
    setOpenProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data?.user?.email || '');
    };
    fetchUserEmail();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('catagories')
        .select('id, Category, products(id, Product, catagoryId, items(id, item, productId))')
        .order('id', { ascending: true });
      if (!error && data) setCategories(data as Category[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = useCallback((itemId: number, value: number) => {
    setOrder(prev => ({ ...prev, [itemId]: value }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const orderDetails = Object.entries(order)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, qty]) => {
        for (const cat of categories) {
          for (const prod of cat.products ?? []) {
            const found = (prod.items ?? []).find(i => i.id === Number(itemId));
            if (found) return `${cat.Category} > ${prod.Product} > ${found.item} (x${qty})`;
          }
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');

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
        () => { alert('Order submitted and email sent!'); },
        (error) => { alert('Failed to send email: ' + error.text); }
      );
  }, [order, categories, userEmail]);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center', width: '100%' }}>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', width: '100%' }}>Order Coffee Items</h2>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div style={{ color: '#888', textAlign: 'center' }}>Loading...</div>
        ) : (
          categories.map(cat => (
            <div key={cat.id} style={{ border: '1px solid #222', borderRadius: 4, background: '#181818' }}>
              <button
                type="button"
                style={{ width: '100%', background: '#222', color: '#fff', padding: '12px 16px', border: 'none', borderRadius: openCategory === cat.id ? '4px 4px 0 0' : 4, fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}
                onClick={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
              >
                {cat.Category}
                <span style={{ float: 'right' }}>{openCategory === cat.id ? '▲' : '▼'}</span>
              </button>
              {openCategory === cat.id && (
                <div style={{ padding: '8px 12px 12px' }}>
                  {(cat.products ?? []).length === 0 ? (
                    <div style={{ color: '#bbb', padding: '8px 0' }}>No products in this category.</div>
                  ) : (
                    (cat.products ?? []).map(prod => (
                      <div key={prod.id} style={{ marginTop: 8, border: '1px solid #333', borderRadius: 4, background: '#1e1e1e' }}>
                        <button
                          type="button"
                          style={{ width: '100%', background: '#2a2a2a', color: '#ddd', padding: '10px 14px', border: 'none', borderRadius: openProducts.has(prod.id) ? '4px 4px 0 0' : 4, fontWeight: 600, textAlign: 'left', cursor: 'pointer', fontSize: 14 }}
                          onClick={() => toggleProduct(prod.id)}
                        >
                          {prod.Product}
                          <span style={{ float: 'right' }}>{openProducts.has(prod.id) ? '▲' : '▼'}</span>
                        </button>
                        {openProducts.has(prod.id) && (
                          <div style={{ padding: '8px 14px 12px' }}>
                            {(prod.items ?? []).length === 0 ? (
                              <div style={{ color: '#666', fontSize: 13 }}>No items.</div>
                            ) : (
                              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {(prod.items ?? []).map(item => (
                                  <li key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#fff' }}>{item.item}</span>
                                    <input
                                      type="number"
                                      min={0}
                                      value={order[item.id] || 0}
                                      onChange={e => handleChange(item.id, Number(e.target.value))}
                                      style={{ border: '1px solid #555', background: '#111', color: '#fff', padding: '6px 8px', borderRadius: 4, width: 70, textAlign: 'right' }}
                                    />
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
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
