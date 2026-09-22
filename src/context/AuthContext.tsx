import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Address } from '../types';
import { authService, DEMO_USERS } from '../services/authService';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  defaultAddress: Address | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<User>;
  register: (name: string, email: string, phone: string) => Promise<User>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  switchDemoRole: (role: 'customer' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const { showToast } = useToast();

  useEffect(() => {
    // Keep user updated
    const cur = authService.getCurrentUser();
    setUser(cur);
  }, []);

  const login = async (email: string, password?: string): Promise<User> => {
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      showToast(`Welcome back, ${loggedUser.name}!`, {
        message: loggedUser.role === 'admin' ? 'Logged in with Admin privileges.' : 'Ready to start shopping.',
        type: 'success',
      });
      return loggedUser;
    } catch (err: any) {
      showToast('Login failed', { message: err?.message || 'Please check credentials', type: 'error' });
      throw err;
    }
  };

  const register = async (name: string, email: string, phone: string): Promise<User> => {
    try {
      const newUser = await authService.register(name, email, phone);
      setUser(newUser);
      showToast(`Welcome to Inbox Store, ${newUser.name}!`, {
        message: 'Your demo account is ready.',
        type: 'success',
      });
      return newUser;
    } catch (err: any) {
      showToast('Registration failed', { message: err?.message || 'Unable to register', type: 'error' });
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    showToast('Logged out successfully', { message: 'Come back soon!', type: 'info' });
  };

  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    const updated = await authService.updateProfile(updates);
    setUser(updated);
    showToast('Profile updated', { message: 'Your account information has been saved.', type: 'success' });
    return updated;
  };

  const addAddress = async (addr: Omit<Address, 'id'>): Promise<Address> => {
    const newAddr = await authService.addAddress(addr);
    const refreshed = authService.getCurrentUser();
    setUser(refreshed);
    showToast('Address added', { message: 'New shipping destination saved.', type: 'success' });
    return newAddr;
  };

  const deleteAddress = async (id: string): Promise<void> => {
    await authService.deleteAddress(id);
    const refreshed = authService.getCurrentUser();
    setUser(refreshed);
    showToast('Address removed', { type: 'info' });
  };

  const setDefaultAddress = async (id: string): Promise<void> => {
    await authService.setDefaultAddress(id);
    const refreshed = authService.getCurrentUser();
    setUser(refreshed);
    showToast('Default address updated', { type: 'success' });
  };

  const switchDemoRole = (role: 'customer' | 'admin') => {
    const targetUser = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
    localStorage.setItem('inbox_auth_user_v1', JSON.stringify(targetUser));
    setUser(targetUser);
    showToast(`Switched to Demo ${role === 'admin' ? 'Administrator' : 'Customer'}`, {
      message: `Active profile: ${targetUser.name} (${targetUser.email})`,
      type: 'info',
    });
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0] || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        defaultAddress,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
        setDefaultAddress,
        switchDemoRole,
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
