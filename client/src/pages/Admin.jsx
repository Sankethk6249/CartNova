import { useEffect, useState } from 'react';
import { api } from '../api.js';

const empty = { name: '', description: '', price: '', image: '', category: '', stock: '' };

export default function Admin() {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const loadProducts = () => api('/products').then(setProducts).catch((e) => setError(e.message));
  const loadOrders = () => api('/orders').then(setOrders).catch((e) => setError(e.message));

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editingId) await api(`/products/${editingId}`, { method: 'PUT', body });
      else await api('/products', { method: 'POST', body });
      setForm(empty);
      setEditingId(null);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image,
      category: p.category,
      stock: p.stock,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api(`/products/${id}`, { method: 'DELETE' });
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const setStatus = async (id, status) => {
    try {
      await api(`/orders/${id}/status`, { method: 'PUT', body: { status } });
      loadOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h2>Admin Dashboard</h2>
      <div className="tabs">
        <button className={`btn small ${tab === 'products' ? '' : 'ghost'}`} onClick={() => setTab('products')}>Products</button>
        <button className={`btn small ${tab === 'orders' ? '' : 'ghost'}`} onClick={() => setTab('orders')}>Orders ({orders.length})</button>
      </div>
      {error && <p className="error">{error}</p>}

      {tab === 'products' && (
        <>
          <form className="admin-form" onSubmit={submit}>
            <h3>{editingId ? 'Edit product' : 'Add product'}</h3>
            <input name="name" placeholder="Name" value={form.name} onChange={change} required />
            <input name="category" placeholder="Category" value={form.category} onChange={change} />
            <input name="price" type="number" min="0" placeholder="Price" value={form.price} onChange={change} required />
            <input name="stock" type="number" min="0" placeholder="Stock" value={form.stock} onChange={change} required />
            <input name="image" placeholder="Image URL" value={form.image} onChange={change} />
            <textarea name="description" placeholder="Description" value={form.description} onChange={change} rows={2} />
            <div className="row">
              <button className="btn">{editingId ? 'Update' : 'Add'}</button>
              {editingId && (
                <button type="button" className="btn ghost" onClick={() => { setEditingId(null); setForm(empty); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          {products.map((p) => (
            <div className="cart-row" key={p._id}>
              <img src={p.image} alt={p.name} />
              <div className="grow">
                <strong>{p.name}</strong>
                <p className="muted">{p.category} · ₹{p.price} · Stock: {p.stock}</p>
              </div>
              <button className="btn small" onClick={() => edit(p)}>Edit</button>
              <button className="btn small danger" onClick={() => del(p._id)}>Delete</button>
            </div>
          ))}
        </>
      )}

      {tab === 'orders' &&
        (orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          orders.map((o) => (
            <div className="order" key={o._id}>
              <div className="row">
                <strong>#{o._id.slice(-6).toUpperCase()}</strong>
                <select value={o.status} onChange={(e) => setStatus(o._id, e.target.value)}>
                  {['Pending', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <p className="muted">
                {o.user ? `${o.user.name} (${o.user.email})` : 'Deleted user'} · {new Date(o.createdAt).toLocaleString()}
              </p>
              <ul>
                {o.items.map((i) => (
                  <li key={i._id}>{i.name} × {i.qty}</li>
                ))}
              </ul>
              <p><strong>₹{o.total}</strong> · {o.address}</p>
            </div>
          ))
        ))}
    </>
  );
}