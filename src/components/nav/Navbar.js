/** @format */

import './navbar.css';
import '../../App.css';
import logo from '../../assets/BMCLogo.webp';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const isLoggedIn = !!user;

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      console.log('Logged out:', data.message);
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="BetterMindCare logo" className="logo" />
          <span className="brand">bettermindcare</span>
        </Link>
      </div>
      <ul className="navbar-right">
        <li>
          <Link to="/admin/dashboard">DASH</Link>
        </li>
        <li>
          <Link to="/resources">RESOURCES</Link>
        </li>
        <li>
          <Link to="/contact">CONTACT</Link>
        </li>
        <li>
          <Link to="/about">ABOUT</Link>
        </li>
        <li>
          <Link to="/sign-up">SIGN UP</Link>
        </li>
        <div className="navbar-auth">
          {isLoggedIn ? (
            <div onClick={handleLogout}>
              <Link to="/login">LOGOUT</Link>
            </div>
          ) : (
            <div>
              <Link to="/login">LOGIN</Link>
            </div>
          )}
        </div>

      </ul>
    </nav>
  );
}

export default Navbar;
