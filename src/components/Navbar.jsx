import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, User, LogOut, Settings } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { isProbablyGroqApiKey } from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
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
          <li>
            <button className="nav-link" onClick={handleSettings} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={18} /> Settings
            </button>
          </li>
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
