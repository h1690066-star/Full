import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin, clearAuthData, getToken } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('adminUser');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    async function autoAuth() {
      if (!token) {
        try {
          const res = await loginAdmin('admin', 'adminxon77');
          setToken(res.token);
          setUser(res.admin);
        } catch (e) {
          console.warn('Initial auto-auth failed:', e);
          setUser(null);
        }
      }
    }
    autoAuth();
  }, [token]);

  const handleLogin = async (username, password) => {
    const res = await loginAdmin(username, password);
    setToken(res.token);
    setUser(res.admin);
    return res;
  };

  const handleLogout = () => {
    clearAuthData();
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        login: handleLogin,
        logout: handleLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

