export type BoardingType = 'SINGLE_ROOM' | 'SHARED_ROOM' | 'ANNEX' | 'FULL_HOUSE';
export type GenderPreference = 'MALE' | 'FEMALE' | 'ANY';
export type BoardingStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';

export interface BoardingAmenities {
  wifi: boolean;
  parking: boolean;
  furnished: boolean;
  ac: boolean;
  hotWater: boolean;
}

export interface BoardingImage {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

export interface BoardingOwner {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface Boarding {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: BoardingType;
  genderPreference: GenderPreference;
  monthlyRent: number;
  depositAmount: number;
  maxOccupants: number;
  currentOccupants: number;
  status: BoardingStatus;
  addressLine: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  nearestUniversity?: string;
  distanceToUniversity?: number;
  amenities: BoardingAmenities;
  images: BoardingImage[];
  houseRules: string[];
  owner: BoardingOwner;
  averageRating: number;
  reviewCount: number;
  viewCount: number;
  saveCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BoardingReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface BoardingFilters {
  district?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  types?: BoardingType[];
  genderPreference?: GenderPreference;
  amenities?: Partial<BoardingAmenities>;
  maxDistance?: number;
  university?: string;
}

export type SortOption = 'RELEVANCE' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST';

export interface CreateBoardingData {
  title: string;
  description: string;
  type: BoardingType | '';
  genderPreference: GenderPreference | '';
  maxOccupants: number;
  monthlyRent: number;
  depositAmount: number;
  nearestUniversity: string;
  distanceToUniversity: number;
  addressLine: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  amenities: BoardingAmenities;
  images: BoardingImage[];
  houseRules: string[];
}
