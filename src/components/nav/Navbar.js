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
        <ul className="navbar-auth">
          {isLoggedIn ? (
            <li>
              <button onClick={handleLogout} className="logout-button">
                LOGOUT
              </button>
            </li>
          ) : (
            <li>
              <Link to="/login">LOGIN</Link>
            </li>
          )}
        </ul>
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="BetterMindCare logo" className="logo" />
          <span className="brand">bettermindcare</span>
        </Link>
      </div>

      <ul className="navbar-right">
        <li>
          <Link to="/about">ABOUT</Link>
        </li>
        {isLoggedIn && (
          <>
            <li>
              <Link to="/resources">RESOURCES</Link>
            </li>
          </>
        )}
        <li>
          <Link to="/contact">CONTACT</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
