import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { add } = useCart();

  useEffect(() => {
    api('/products/categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const q = new URLSearchParams({ search, category }).toString();
      api(`/products?${q}`)
        .then((data) => {
          setProducts(data);
          setError('');
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search, category]);

  return (
    <>
      <div className="filters">
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>All</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && products.length === 0 && <p>No products found.</p>}

      <div className="grid">
        {products.map((p) => (
          <div className="card" key={p._id}>
            <img src={p.image || 'https://picsum.photos/seed/default/400/300'} alt={p.name} />
            <h3>{p.name}</h3>
            <p className="muted">{p.category}</p>
            <p className="desc">{p.description}</p>
            <div className="row">
              <strong>₹{p.price}</strong>
              <button className="btn small" disabled={p.stock === 0} onClick={() => add(p)}>
                {p.stock === 0 ? 'Out of stock' : 'Add to cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}