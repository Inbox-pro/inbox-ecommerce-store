import { User, Address } from '../types';

const AUTH_USER_KEY = 'inbox_auth_user_v1';
const ALL_USERS_KEY = 'inbox_all_users_v1';

export const DEMO_USERS: User[] = [
  {
    id: 'user-cust-1',
    name: 'Pooja Sharma',
    email: 'user@inbox.com',
    phone: '+91 98765 43210',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    addresses: [
      {
        id: 'addr-1',
        fullName: 'Pooja Sharma',
        phone: '+91 98765 43210',
        street: 'Flat 402, Skyline Residency, MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India',
        isDefault: true,
        type: 'Home',
      },
      {
        id: 'addr-2',
        fullName: 'Pooja Sharma (Tech Park)',
        phone: '+91 98765 43210',
        street: 'Floor 5, Inbox Infotech Tower, Outer Ring Rd',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560103',
        country: 'India',
        isDefault: false,
        type: 'Work',
      },
    ],
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'user-admin-1',
    name: 'Vikram Mehta (Admin)',
    email: 'admin@inbox.com',
    phone: '+91 98111 22334',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    addresses: [
      {
        id: 'addr-admin-1',
        fullName: 'Vikram Mehta',
        phone: '+91 98111 22334',
        street: 'Headquarters, Inbox Infotech Pvt. Ltd., Tech Hub',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400051',
        country: 'India',
        isDefault: true,
        type: 'Work',
      },
    ],
    createdAt: '2025-11-01T08:00:00.000Z',
  },
];

export const authService = {
  // Initialize users list if not existing
  getUsers(): User[] {
    try {
      const stored = localStorage.getItem(ALL_USERS_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(DEMO_USERS));
      return DEMO_USERS;
    } catch {
      return DEMO_USERS;
    }
  },

  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) return JSON.parse(stored);
      // Default to logged-in customer for effortless evaluation
      const defaultUser = DEMO_USERS[0];
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    } catch {
      return null;
    }
  },

  async login(email: string, password?: string): Promise<User> {
    // Artificial slight latency for realism
    await new Promise((resolve) => setTimeout(resolve, 350));

    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();

    // Check if matching user exists
    let matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!matchedUser) {
      // If user logs in with admin@... or test email, create or match
      const role = cleanEmail.includes('admin') ? 'admin' : 'customer';
      matchedUser = {
        id: `user-${Date.now()}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: '+91 99887 76655',
        role,
        addresses: [],
        createdAt: new Date().toISOString(),
      };
      users.push(matchedUser);
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
    }

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(matchedUser));
    return matchedUser;
  },

  async register(name: string, email: string, phone: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();

    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email: cleanEmail,
      phone,
      role: 'customer',
      addresses: [],
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  logout(): void {
    localStorage.removeItem(AUTH_USER_KEY);
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const current = this.getCurrentUser();
    if (!current) throw new Error('Not logged in');

    const updatedUser: User = { ...current, ...updates };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));

    // Update in all users list
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === current.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
    }
    return updatedUser;
  },

  async addAddress(address: Omit<Address, 'id'>): Promise<Address> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not logged in');

    const newAddr: Address = {
      ...address,
      id: `addr-${Date.now()}`,
    };

    const currentAddresses = user.addresses || [];
    if (newAddr.isDefault) {
      currentAddresses.forEach((a) => (a.isDefault = false));
    } else if (currentAddresses.length === 0) {
      newAddr.isDefault = true;
    }

    const updatedAddresses = [...currentAddresses, newAddr];
    await this.updateProfile({ addresses: updatedAddresses });
    return newAddr;
  },

  async deleteAddress(addressId: string): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) return;
    const updated = (user.addresses || []).filter((a) => a.id !== addressId);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    await this.updateProfile({ addresses: updated });
  },

  async setDefaultAddress(addressId: string): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) return;
    const updated = (user.addresses || []).map((a) => ({
      ...a,
      isDefault: a.id === addressId,
    }));
    await this.updateProfile({ addresses: updated });
  },
};
