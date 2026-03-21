import api from './api';
import type { UniStayApiResponse } from '@/types/api.types';
import type {
  VisitRequest,
  CreateVisitRequestPayload,
  RejectVisitPayload,
} from '@/types/visit.types';

export async function createVisitRequest(payload: CreateVisitRequestPayload) {
  const response = await api.post<UniStayApiResponse<{ visitRequest: VisitRequest }>>(
    '/visits',
    payload,
  );
  return response.data;
}

export async function getMyVisitRequests() {
  const response = await api.get<UniStayApiResponse<{ visitRequests: VisitRequest[] }>>(
    '/visits/my',
  );
  return response.data;
}

export async function getReceivedVisitRequests() {
  const response = await api.get<UniStayApiResponse<{ visitRequests: VisitRequest[] }>>(
    '/visits/received',
  );
  return response.data;
}

export async function approveVisitRequest(id: string) {
  const response = await api.patch<UniStayApiResponse<{ visitRequest: VisitRequest }>>(
    `/visits/${id}/approve`,
  );
  return response.data;
}

export async function rejectVisitRequest(id: string, payload: RejectVisitPayload) {
  const response = await api.patch<UniStayApiResponse<{ visitRequest: VisitRequest }>>(
    `/visits/${id}/reject`,
    payload,
  );
  return response.data;
}
