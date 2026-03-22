import api from './api';
import { API_URL } from './constants';
import { storage } from './storage';
import type { UniStayApiResponse } from '@/types/api.types';
import type {
  DetailedPayment,
  CreatePaymentPayload,
  RejectPaymentPayload,
} from '@/types/payment.types';

/**
 * Upload a local image file to `PUT /payments/proof-image` and return the
 * hosted URL. Uses native fetch so React Native sets the correct
 * `multipart/form-data; boundary=…` header automatically.
 */
export async function uploadProofImage(uri: string): Promise<string> {
  const filename = uri.split('/').pop() ?? 'proof.jpg';
  const type = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';

  const formData = new FormData();
  formData.append('proofImage', { uri, name: filename, type } as unknown as Blob);

  const token = await storage.getToken();
  const response = await fetch(`${API_URL}/payments/proof-image`, {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const responseData = await response.json() as UniStayApiResponse<{ proofImageUrl: string }>;

  if (!response.ok) {
    const err = Object.assign(new Error(`HTTP ${response.status}`), {
      response: { status: response.status, data: responseData },
    });
    throw err;
  }

  return responseData.data.proofImageUrl;
}

export async function createPayment(payload: CreatePaymentPayload) {
  const response = await api.post<UniStayApiResponse<{ payment: DetailedPayment }>>(
    '/payments',
    payload,
  );
  return response.data;
}

export async function getMyPayments() {
  const response = await api.get<UniStayApiResponse<{ payments: DetailedPayment[] }>>(
    '/payments/my-payments',
  );
  return response.data;
}

export async function getBoardingPayments() {
  const response = await api.get<UniStayApiResponse<{ payments: DetailedPayment[] }>>(
    '/payments/my-boardings',
  );
  return response.data;
}

export async function confirmPayment(id: string) {
  const response = await api.patch<UniStayApiResponse<{ payment: DetailedPayment }>>(
    `/payments/${id}/confirm`,
  );
  return response.data;
}

export async function rejectPayment(id: string, payload: RejectPaymentPayload) {
  const response = await api.patch<UniStayApiResponse<{ payment: DetailedPayment }>>(
    `/payments/${id}/reject`,
    payload,
  );
  return response.data;
}
