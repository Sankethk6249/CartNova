import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/orders/mine')
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (orders.length === 0) return <p>You have no orders yet.</p>;

  return (
    <>
      <h2>My Orders</h2>
      {orders.map((o) => (
        <div className="order" key={o._id}>
          <div className="row">
            <strong>#{o._id.slice(-6).toUpperCase()}</strong>
            <span className={`badge ${o.status}`}>{o.status}</span>
          </div>
          <p className="muted">{new Date(o.createdAt).toLocaleString()}</p>
          <ul>
            {o.items.map((i) => (
              <li key={i._id}>
                {i.name} × {i.qty} — ₹{i.price * i.qty}
              </li>
            ))}
          </ul>
          <p>
            <strong>Total: ₹{o.total}</strong> · {o.paymentMethod}
          </p>
          <p className="muted">Deliver to: {o.address}</p>
        </div>
      ))}
    </>
  );
}