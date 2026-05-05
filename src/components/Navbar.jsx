import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, User, LogOut, Settings } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSettings = () => {
    const currentKey = localStorage.getItem('gemini_api_key') || '';
    const newKey = window.prompt('Enter your Gemini API Key to enable Deep AI Mode (Real Intelligence):', currentKey);
    if (newKey !== null) {
      localStorage.setItem('gemini_api_key', newKey.trim());
      alert('API Key saved! Deep AI Mode is now active.');
    }
  };

  return (
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
        <ul className="nav-links">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><Link to="/library" className="nav-link">My Library</Link></li>
          {user ? (
            <li>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="text-muted flex-center" style={{ gap: '0.5rem' }}>
                  <User size={16} /> {user.name}
                </span>
                <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
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
  );
};

export default Navbar;
