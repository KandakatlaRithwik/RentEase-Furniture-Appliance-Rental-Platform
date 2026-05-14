import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // start true — verifying token

  // ✅ FIX: On mount, verify token against backend — handles refresh + invalid token
  useEffect(() => {
    const token = localStorage.getItem('rentease_token');
    if (!token) { setLoading(false); return; }

    authAPI.getMe()
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('rentease_user', JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem('rentease_token');
        localStorage.removeItem('rentease_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('rentease_token', data.token);
      localStorage.setItem('rentease_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const { data } = await authAPI.register({ name, email, password, phone });
      localStorage.setItem('rentease_token', data.token);
      localStorage.setItem('rentease_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('rentease_token');
    localStorage.removeItem('rentease_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      isLoggedIn: !!user,
      isAdmin:    user?.role === 'admin',
      login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
