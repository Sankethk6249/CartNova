import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">ShopEasy</Link>
      <div className="nav-links">
        <Link to="/cart">Cart ({count})</Link>
        {user ? (
          <>
            <Link to="/orders">My Orders</Link>
            {user.role === 'admin' && <Link to="/admin">Admin</Link>}
            <span className="hello">Hi, {user.name.split(' ')[0]}</span>
            <button className="btn small danger" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}