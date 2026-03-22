import api from './api';
import type { UniStayApiResponse } from '@/types/api.types';
import type {
  DetailedPayment,
  CreatePaymentPayload,
  RejectPaymentPayload,
} from '@/types/payment.types';

export async function createPayment(payload: CreatePaymentPayload) {
  if (payload.proofImageUri) {
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
    const uri = payload.proofImageUri;
    const filename = uri.split('/').pop() ?? 'proof.jpg';
    const type = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
    formData.append('proofImage', { uri, name: filename, type } as unknown as Blob);

    const response = await api.post<UniStayApiResponse<{ payment: DetailedPayment }>>(
      '/payments',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  }

  const { proofImageUri: _unused, ...rest } = payload;
  const response = await api.post<UniStayApiResponse<{ payment: DetailedPayment }>>(
    '/payments',
    rest,
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
