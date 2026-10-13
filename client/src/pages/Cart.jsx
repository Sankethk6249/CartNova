import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Cart() {
  const { items, setQty, remove, clear, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const placeOrder = async () => {
    if (!user) return navigate('/login');
    setError('');
    setBusy(true);
    try {
      await api('/orders', {
        method: 'POST',
        body: {
          address,
          items: items.map((i) => ({ productId: i.product._id, qty: i.qty })),
        },
      });
      clear();
      navigate('/orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return (
      <p>
        Your cart is empty. <Link to="/">Continue shopping</Link>
      </p>
    );
  }

  return (
    <>
      <h2>Your Cart</h2>
      {items.map(({ product, qty }) => (
        <div className="cart-row" key={product._id}>
          <img src={product.image} alt={product.name} />
          <div className="grow">
            <strong>{product.name}</strong>
            <p className="muted">₹{product.price}</p>
          </div>
          <input
            type="number"
            min="1"
            max={product.stock}
            value={qty}
            onChange={(e) => setQty(product._id, parseInt(e.target.value, 10) || 1)}
          />
          <strong>₹{product.price * qty}</strong>
          <button className="btn small danger" onClick={() => remove(product._id)}>Remove</button>
        </div>
      ))}

      <h3>Total: ₹{total}</h3>
      <textarea
        placeholder="Delivery address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        rows={3}
      />
      <p className="muted">Payment: Cash on Delivery</p>
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={busy || !address.trim()} onClick={placeOrder}>
        {user ? (busy ? 'Placing order...' : 'Place order') : 'Login to place order'}
      </button>
    </>
  );
}