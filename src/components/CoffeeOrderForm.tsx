import React, { useState } from 'react';

type CoffeeOrder = {
  id: number;
  product: string;
  size: string;
  quantity: number;
  extras: string;
};

export const CoffeeOrderForm: React.FC = () => {
  const [orders, setOrders] = useState<CoffeeOrder[]>([
    { id: 1, product: '', size: '', quantity: 1, extras: '' }
  ]);

  // Add a new empty order row
  const addOrder = () => {
    setOrders([...orders, { id: Date.now(), product: '', size: '', quantity: 1, extras: '' }]);
  };

  // Remove an order row
  const removeOrder = (id: number) => {
    setOrders(orders.filter(order => order.id !== id));
  };

  // Handle input changes
  const handleChange = (id: number, field: keyof CoffeeOrder, value: string | number) => {
    setOrders(orders.map(order => order.id === id ? { ...order, [field]: value } : order));
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Orders submitted:', orders);
    alert(JSON.stringify(orders, null, 2));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {orders.map(order => (
        <div key={order.id} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Product"
            value={order.product}
            onChange={e => handleChange(order.id, 'product', e.target.value)}
            className="border p-1 rounded"
            required
          />
          <select
            value={order.size}
            onChange={e => handleChange(order.id, 'size', e.target.value)}
            className="border p-1 rounded"
            required
          >
            <option value="">Size</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
          <input
            type="number"
            min={1}
            value={order.quantity}
            onChange={e => handleChange(order.id, 'quantity', parseInt(e.target.value))}
            className="border p-1 rounded w-20"
            required
          />
          <input
            type="text"
            placeholder="Extras"
            value={order.extras}
            onChange={e => handleChange(order.id, 'extras', e.target.value)}
            className="border p-1 rounded"
          />
          <button type="button" onClick={() => removeOrder(order.id)} className="text-red-500">
            Remove
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        <button type="button" onClick={addOrder} className="bg-blue-500 text-white px-3 py-1 rounded">
          Add Item
        </button>
        <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded">
          Submit Order
        </button>
      </div>
    </form>
  );
};