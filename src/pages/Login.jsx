import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      login(email, password);
      navigate('/library');
    }
  };

  return (
    <div className="login-container animate-fade-in flex-center">
      <div className="login-box glass-panel">
        <div className="login-header">
          <div className="login-icon flex-center">
            <LogIn size={28} color="#fff" />
          </div>
          <h1 className="heading-lg">Welcome Back</h1>
          <p className="text-muted">Sign in to access your LitTutor library</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary login-submit-btn">
            Sign In
          </button>
        </form>

        <div className="login-footer">
          <p className="text-muted">
            Don't have an account? <a href="#" className="text-gradient">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
