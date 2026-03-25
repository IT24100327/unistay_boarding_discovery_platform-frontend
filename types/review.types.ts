export type ReactionType = 'LIKE' | 'DISLIKE';
export type ReactionAction = 'added' | 'removed' | 'changed';

export interface ReviewMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
}

export interface ReviewReactionSummary {
  likes: number;
  dislikes: number;
  userReaction: ReactionType | null;
}

export interface ReviewComment {
  id: string;
  reviewId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  comment: string;
  editedAt: string | null;
  createdAt: string;
  reactions: ReviewReactionSummary;
}

export interface Review {
  id: string;
  boardingId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  comment: string | null;
  editedAt: string | null;
  commentedAt: string;
  createdAt: string;
  media: ReviewMedia[];
  reactions: ReviewReactionSummary;
  comments: ReviewComment[];
  _count?: {
    comments: number;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'commentedAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateReviewPayload {
  boardingId: string;
  rating: number;
  comment?: string;
}

export interface CreateCommentPayload {
  userId: string;
  comment: string;
}

export interface UpdateCommentPayload {
  comment: string;
}

export interface ReviewsListResponse {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReviewsApiResponse {
  success: true;
  message: string;
  data: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
