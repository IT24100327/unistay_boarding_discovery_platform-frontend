import api from './api';
import { storage } from './storage';
import type { User } from '@/types/user.types';

export async function validateToken(): Promise<User | null> {
  try {
    const token = await storage.getToken();
    if (!token) return null;
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data.user;
  } catch {
    return null;
  }
}

export async function getAuthHeaders() {
  const token = await storage.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
