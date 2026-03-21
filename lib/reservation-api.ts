/**
 * Dedicated axios instance for the Reservation / Visit-Request backend
 * (http://localhost:3000/api).
 *
 * Shares the same auth-token injection and 401-refresh logic as the
 * primary `api` instance, but targets the separate service port.
 */
import axios from 'axios';
import { router } from 'expo-router';
import { RESERVATION_API_URL } from './constants';
import { storage } from './storage';
import type { UniStayApiResponse } from '@/types/api.types';
import type { RefreshResponse } from '@/types/auth.types';

const reservationApi = axios.create({
  baseURL: RESERVATION_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach Bearer token to every outgoing request
reservationApi.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// Handle 401 → try to refresh using the primary api's /auth/refresh endpoint
reservationApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(reservationApi(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        // Use the primary api for token refresh (auth lives at :5000)
        const { default: api } = await import('./api');
        const response = await api.post<UniStayApiResponse<RefreshResponse>>('/auth/refresh', {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        await storage.setToken(accessToken);
        await storage.setRefreshToken(newRefreshToken);

        onRefreshed(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return reservationApi(originalRequest);
      } catch {
        await storage.clear();
        router.replace('/(auth)/login');
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default reservationApi;
