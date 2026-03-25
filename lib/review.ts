import api from './api';
import type { UniStayApiResponse } from '@/types/api.types';
import type {
  Review,
  ReviewStats,
  ReviewComment,
  ReviewsQueryParams,
  ReviewsListResponse,
  ReactionType,
  ReactionAction,
  CreateCommentPayload,
  UpdateCommentPayload,
} from '@/types/review.types';

export async function getReviewStats(boardingId: string) {
  const response = await api.get<UniStayApiResponse<ReviewStats>>(
    `/reviews/boarding/${boardingId}/stats`,
  );
  return response.data;
}

export async function getBoardingReviewsById(
  boardingId: string,
  params: ReviewsQueryParams = {},
) {
  const response = await api.get<UniStayApiResponse<ReviewsListResponse>>(
    `/reviews/boarding/${boardingId}`,
    { params },
  );
  return response.data;
}

export async function getReviewById(reviewId: string) {
  const response = await api.get<UniStayApiResponse<{ review: Review }>>(
    `/reviews/${reviewId}`,
  );
  return response.data;
}

export async function createReview(formData: FormData) {
  const response = await api.post<UniStayApiResponse<{ review: Review }>>(
    '/reviews',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

export async function updateReview(reviewId: string, formData: FormData) {
  const response = await api.put<UniStayApiResponse<{ review: Review }>>(
    `/reviews/${reviewId}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

export async function deleteReview(reviewId: string) {
  const response = await api.delete<UniStayApiResponse<null>>(
    `/reviews/${reviewId}`,
  );
  return response.data;
}

export async function reactToReview(reviewId: string, reactionType: ReactionType) {
  const response = await api.post<
    UniStayApiResponse<{ action: ReactionAction; type: ReactionType }>
  >(`/reviews/${reviewId}/reactions`, { type: reactionType });
  return response.data;
}

export async function addComment(reviewId: string, payload: CreateCommentPayload) {
  const response = await api.post<UniStayApiResponse<{ comment: ReviewComment }>>(
    `/reviews/${reviewId}/comments`,
    payload,
  );
  return response.data;
}

export async function updateComment(commentId: string, payload: UpdateCommentPayload) {
  const response = await api.put<UniStayApiResponse<{ comment: ReviewComment }>>(
    `/reviews/comments/${commentId}`,
    payload,
  );
  return response.data;
}

export async function deleteComment(commentId: string) {
  const response = await api.delete<UniStayApiResponse<null>>(
    `/reviews/comments/${commentId}`,
  );
  return response.data;
}

export async function reactToComment(commentId: string, reactionType: ReactionType) {
  const response = await api.post<
    UniStayApiResponse<{ action: ReactionAction; type: ReactionType }>
  >(`/reviews/comments/${commentId}/reactions`, { type: reactionType });
  return response.data;
}
