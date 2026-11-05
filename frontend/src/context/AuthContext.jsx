import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bloghub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('bloghub_token'));
  const [loading, setLoading] = useState(true);

  // Verify auth session on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('bloghub_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('bloghub_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('Session verification failed:', error.message);
          localStorage.removeItem('bloghub_token');
          localStorage.removeItem('bloghub_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Register
  const register = async (name, username, email, password, confirmPassword) => {
    try {
      const res = await authService.register({
        name,
        username,
        email,
        password,
        confirmPassword,
      });

      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('bloghub_token', receivedToken);
        localStorage.setItem('bloghub_user', JSON.stringify(receivedUser));
        toast.success(res.data.message || 'Account created successfully!');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('bloghub_token', receivedToken);
        localStorage.setItem('bloghub_user', JSON.stringify(receivedUser));
        toast.success(res.data.message || `Welcome back, ${receivedUser.name}!`);
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Invalid credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('bloghub_token');
      localStorage.removeItem('bloghub_user');
      setUser(null);
      setToken(null);
      toast.success('Logged out successfully');
    }
  };

  // Update current user locally
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('bloghub_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

