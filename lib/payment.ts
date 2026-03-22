import api from './api';
import { API_URL } from './constants';
import { storage } from './storage';
import type { UniStayApiResponse } from '@/types/api.types';
import type {
  DetailedPayment,
  CreatePaymentPayload,
  RejectPaymentPayload,
} from '@/types/payment.types';

export async function createPayment(payload: CreatePaymentPayload) {
  if (payload.proofImageUri) {
    const uri = payload.proofImageUri;
    const filename = uri.split('/').pop() ?? 'proof.jpg';
    const type = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
    console.log('[createPayment] multipart path — uri:', uri, '| filename:', filename, '| type:', type);

    const formData = new FormData();
    formData.append('studentId', payload.studentId);
    formData.append('rentalPeriodId', payload.rentalPeriodId);
    formData.append('reservationId', payload.reservationId);
    formData.append('amount', String(payload.amount));
    formData.append('paymentMethod', payload.paymentMethod);
    formData.append('paidAt', payload.paidAt);
    if (payload.referenceNumber) {
      formData.append('referenceNumber', payload.referenceNumber);
    }
    formData.append('proofImage', { uri, name: filename, type } as unknown as Blob);
    console.log('[createPayment] posting multipart to /payments');

    try {
      // Use native fetch instead of Axios for multipart uploads.
      // Axios v1.x uses AxiosHeaders which ignores `delete headers['Content-Type']`,
      // so the 'application/json' default leaks through and React Native's XHR
      // produces a Network Error. Native fetch handles FormData natively and sets
      // the correct Content-Type header (with boundary) automatically.
      const token = await storage.getToken();
      const fetchResponse = await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const responseData = await fetchResponse.json() as UniStayApiResponse<{ payment: DetailedPayment }>;
      if (!fetchResponse.ok) {
        console.error(
          '[createPayment] multipart error — status:', fetchResponse.status,
          '| data:', JSON.stringify(responseData),
        );
        const err = Object.assign(new Error(`HTTP ${fetchResponse.status}`), {
          response: { status: fetchResponse.status, data: responseData },
        });
        throw err;
      }
      console.log('[createPayment] multipart success — status:', fetchResponse.status, '| data:', JSON.stringify(responseData));
      return responseData;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: unknown }; message?: string };
      console.error(
        '[createPayment] multipart error — status:', axiosErr?.response?.status,
        '| data:', JSON.stringify(axiosErr?.response?.data),
        '| message:', axiosErr?.message,
      );
      throw err;
    }
  }

  console.log('[createPayment] JSON path (no proof image) — payload:', JSON.stringify({ ...payload, proofImageUri: undefined }));
  const { proofImageUri: _unused, ...rest } = payload;
  try {
    const response = await api.post<UniStayApiResponse<{ payment: DetailedPayment }>>(
      '/payments',
      rest,
    );
    console.log('[createPayment] JSON success — status:', response.status, '| data:', JSON.stringify(response.data));
    return response.data;
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number; data?: unknown }; message?: string };
    console.error(
      '[createPayment] JSON error — status:', axiosErr?.response?.status,
      '| data:', JSON.stringify(axiosErr?.response?.data),
      '| message:', axiosErr?.message,
    );
    throw err;
  }
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
