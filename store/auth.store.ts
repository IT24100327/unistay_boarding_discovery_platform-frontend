import { create } from 'zustand';
import api from '@/lib/api';
import { storage } from '@/lib/storage';
import type { User } from '@/types/user.types';
import type { RegisterData } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedRole: 'student' | 'owner' | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setSelectedRole: (role: 'student' | 'owner') => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<boolean>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  selectedRole: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setSelectedRole: (role) => set({ selectedRole: role }),

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post<{ token: string; user: User }>('/auth/login', {
        email,
        password,
      });
      const { token, user } = response.data;
      await storage.setToken(token);
      await storage.setUser(user);
      set({ token, user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      await api.post('/auth/register', data);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await storage.clear();
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.put<{ user: User }>('/users/me', data);
      const updatedUser = response.data.user;
      await storage.setUser(updatedUser);
      set({ user: updatedUser });
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    const token = await storage.getToken();
    if (!token) return false;
    try {
      const response = await api.get<{ user: User }>('/auth/me');
      const user = response.data.user;
      set({ token, user, isAuthenticated: true });
      return true;
    } catch {
      await get().logout();
      return false;
    }
  },

  hydrate: async () => {
    const token = await storage.getToken();
    const user = await storage.getUser<User>();
    if (token && user) {
      set({ token, user, isAuthenticated: true });
    }
  },
}));
