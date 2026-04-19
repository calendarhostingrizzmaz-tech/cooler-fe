import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

interface AdminUser {
  id: string;
  email: string;
  adminId: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  admin: AdminUser | null;
  login: (token: string, admin: AdminUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('admin_token')
  );
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const stored = localStorage.getItem('admin_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (newToken: string, newAdmin: AdminUser) => {
    setToken(newToken);
    setAdmin(newAdmin);
    localStorage.setItem('admin_token', newToken);
    localStorage.setItem('admin_user', JSON.stringify(newAdmin));
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
          if (!window.location.pathname.startsWith('/admin/login')) {
             window.location.href = '/admin/login';
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, admin, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
