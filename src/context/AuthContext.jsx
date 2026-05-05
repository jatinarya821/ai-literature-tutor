import { createContext, useState, useEffect } from 'react';
import { safeReadJson, safeWriteJson } from '../utils/storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = safeReadJson('user', null);
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = (email, password) => {
    // Mock login
    const newUser = { email, name: email.split('@')[0] };
    setUser(newUser);
    safeWriteJson('user', newUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
