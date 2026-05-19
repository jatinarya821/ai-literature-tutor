import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { BookOpen, GraduationCap, User, LogOut, Settings, Menu, X, Library as LibraryIcon, Home } from 'lucide-react';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { isProbablyGroqApiKey } from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const handleSettings = () => {
    const currentModel = localStorage.getItem('groq_model') || '';
    const newModel = window.prompt('Enter Groq model (leave blank for default):', currentModel);
    if (newModel !== null) {
      const trimmedModel = newModel.trim();
      if (trimmedModel) {
        if (isProbablyGroqApiKey(trimmedModel)) {
          alert('That looks like a Groq API key. Please enter a model name instead.');
          return;
        }
        localStorage.setItem('groq_model', trimmedModel);
      } else {
        localStorage.removeItem('groq_model');
      }
      alert('Model preference saved. API key is configured on the server.');
    }
  };

  // Mobile menu content — rendered via portal to escape backdrop-filter containing block
  const mobileMenu = menuOpen && createPortal(
    <>
      <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />
      <ul className="nav-mobile-menu">
        <li>
          <Link to="/" className="nav-mobile-item" onClick={() => setMenuOpen(false)}>
            <Home size={18} /> Home
          </Link>
        </li>
        <li>
          <Link to="/library" className="nav-mobile-item" onClick={() => setMenuOpen(false)}>
            <LibraryIcon size={18} /> My Library
          </Link>
        </li>
        <li>
          <button className="nav-mobile-item" onClick={() => { handleSettings(); setMenuOpen(false); }}>
            <Settings size={18} /> Settings
          </button>
        </li>
        {user ? (
          <>
            <li>
              <Link to="/library" className="nav-mobile-item" onClick={() => setMenuOpen(false)}>
                <User size={18} /> Profile ({user.name})
              </Link>
            </li>
            <li>
              <button className="nav-mobile-item nav-mobile-item--danger" onClick={handleLogout}>
                <LogOut size={18} /> Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login" className="nav-mobile-item nav-mobile-item--accent" onClick={() => setMenuOpen(false)}>
              <User size={18} /> Sign In
            </Link>
          </li>
        )}
      </ul>
    </>,
    document.body
  );

  return (
    <>
      <nav className="navbar glass-panel">
        <div className="container flex-between nav-container">
          <Link to="/" className="nav-brand">
            <div className="brand-icon">
              <BookOpen size={24} color="#7c3aed" />
              <GraduationCap size={16} color="#c026d3" className="sparkle-icon" />
            </div>
            <span className="brand-text">
              Lit<span className="text-gradient">Tutor</span>
            </span>
          </Link>

          {/* Mobile-only shortcut icons — always visible on small screens */}
          <div className="nav-mobile-shortcuts">
            <Link to="/" className="mobile-shortcut-btn" title="Home" aria-label="Home">
              <Home size={20} />
            </Link>
            <Link to="/library" className="mobile-shortcut-btn" title="My Library" aria-label="My Library">
              <LibraryIcon size={20} />
            </Link>
            <Link to={user ? '/library' : '/login'} className="mobile-shortcut-btn mobile-profile-btn" title={user ? user.name : 'Sign In'} aria-label="Profile">
              {user ? (
                <span className="mobile-profile-initial">{user.name.charAt(0).toUpperCase()}</span>
              ) : (
                <User size={20} />
              )}
            </Link>
            {/* Hamburger toggle for mobile */}
            <button
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop nav links — hidden on mobile */}
          <ul className="nav-links">
            <li><Link to="/" className="nav-link">Home</Link></li>
            <li><Link to="/library" className="nav-link">My Library</Link></li>
            <li>
              <button className="nav-link nav-link-btn" onClick={handleSettings}>
                <Settings size={18} /> Settings
              </button>
            </li>
            {user ? (
              <li>
                <div className="nav-user-group">
                  <span className="text-muted flex-center nav-user-name">
                    <User size={16} /> {user.name}
                  </span>
                  <button className="btn btn-secondary nav-logout-btn" onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </li>
            ) : (
              <li>
                <Link to="/login" className="btn btn-primary">
                  Sign In
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Mobile menu rendered via portal to escape backdrop-filter */}
      {mobileMenu}
    </>
  );
};

export default Navbar;
