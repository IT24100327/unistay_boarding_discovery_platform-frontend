import { create } from 'zustand';
import type { Boarding, BoardingFilters, SortOption, CreateBoardingData } from '@/types/boarding.types';

interface BoardingState {
  savedIds: string[];
  filters: BoardingFilters;
  sortOption: SortOption;
  createDraft: Partial<CreateBoardingData>;
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  setFilters: (filters: BoardingFilters) => void;
  clearFilters: () => void;
  setSortOption: (sort: SortOption) => void;
  setCreateDraft: (data: Partial<CreateBoardingData>) => void;
  clearCreateDraft: () => void;
}

export const useBoardingStore = create<BoardingState>((set, get) => ({
  savedIds: [],
  filters: {},
  sortOption: 'RELEVANCE',
  createDraft: {},

  toggleSaved: (id) => {
    const { savedIds } = get();
    if (savedIds.includes(id)) {
      set({ savedIds: savedIds.filter((s) => s !== id) });
    } else {
      set({ savedIds: [...savedIds, id] });
    }
  },

  isSaved: (id) => get().savedIds.includes(id),

  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
  setSortOption: (sortOption) => set({ sortOption }),

  setCreateDraft: (data) =>
    set((state) => ({ createDraft: { ...state.createDraft, ...data } })),
  clearCreateDraft: () => set({ createDraft: {} }),
}));

// ─── Sample / mock data ────────────────────────────────────────────────────────

export const SAMPLE_BOARDINGS: Boarding[] = [
  {
    id: '1',
    slug: 'the-hub-residences',
    title: 'The Hub Residences',
    description:
      'Modern fully-furnished rooms close to University of Kelaniya. Safe, clean, and affordable with 24/7 security.',
    type: 'SINGLE_ROOM',
    genderPreference: 'ANY',
    monthlyRent: 15000,
    depositAmount: 30000,
    maxOccupants: 4,
    currentOccupants: 2,
    status: 'ACTIVE',
    addressLine: '123 Kandy Road',
    city: 'Kelaniya',
    district: 'Gampaha',
    latitude: 7.0,
    longitude: 79.92,
    nearestUniversity: 'University of Kelaniya',
    distanceToUniversity: 0.8,
    amenities: { wifi: true, parking: true, furnished: true, ac: false, hotWater: true },
    images: [
      { id: 'i1', url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', isPrimary: true, order: 0 },
      { id: 'i2', url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', isPrimary: false, order: 1 },
    ],
    houseRules: ['No smoking', 'No pets', 'Guests allowed until 10pm'],
    owner: { id: 'o1', firstName: 'Nimal', lastName: 'Perera', avatar: undefined },
    averageRating: 4.5,
    reviewCount: 24,
    viewCount: 312,
    saveCount: 18,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
  {
    id: '2',
    slug: 'uni-nest-moratuwa',
    title: 'UniNest Moratuwa',
    description:
      'Spacious shared rooms ideal for UOM students. Walking distance to campus.',
    type: 'SHARED_ROOM',
    genderPreference: 'MALE',
    monthlyRent: 12000,
    depositAmount: 24000,
    maxOccupants: 6,
    currentOccupants: 5,
    status: 'ACTIVE',
    addressLine: '45 Galle Road',
    city: 'Moratuwa',
    district: 'Colombo',
    latitude: 6.7735,
    longitude: 79.8830,
    nearestUniversity: 'University of Moratuwa',
    distanceToUniversity: 0.3,
    amenities: { wifi: true, parking: false, furnished: true, ac: false, hotWater: false },
    images: [
      { id: 'i3', url: 'https://images.unsplash.com/photo-1586105449897-20b5efeb3233?w=800', isPrimary: true, order: 0 },
    ],
    houseRules: ['No smoking', 'Study hours 8pm–6am'],
    owner: { id: 'o2', firstName: 'Kamal', lastName: 'Silva', avatar: undefined },
    averageRating: 4.2,
    reviewCount: 15,
    viewCount: 198,
    saveCount: 10,
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-03-05T00:00:00Z',
  },
  {
    id: '3',
    slug: 'campus-lofts-kandy',
    title: 'Campus Lofts Kandy',
    description:
      'Comfortable annex-style accommodation near University of Peradeniya.',
    type: 'ANNEX',
    genderPreference: 'FEMALE',
    monthlyRent: 10000,
    depositAmount: 20000,
    maxOccupants: 2,
    currentOccupants: 1,
    status: 'ACTIVE',
    addressLine: '78 Peradeniya Road',
    city: 'Kandy',
    district: 'Kandy',
    latitude: 7.2906,
    longitude: 80.6337,
    nearestUniversity: 'University of Peradeniya',
    distanceToUniversity: 1.5,
    amenities: { wifi: true, parking: false, furnished: false, ac: false, hotWater: true },
    images: [
      { id: 'i4', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', isPrimary: true, order: 0 },
    ],
    houseRules: ['Female residents only', 'No visitors after 9pm'],
    owner: { id: 'o3', firstName: 'Sanduni', lastName: 'Fernando', avatar: undefined },
    averageRating: 4.7,
    reviewCount: 8,
    viewCount: 145,
    saveCount: 12,
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-02-28T00:00:00Z',
  },
  {
    id: '4',
    slug: 'blue-horizon-boarding',
    title: 'Blue Horizon Boarding',
    description: 'Affordable full house for a group of students. Fully furnished with AC.',
    type: 'FULL_HOUSE',
    genderPreference: 'ANY',
    monthlyRent: 8000,
    depositAmount: 16000,
    maxOccupants: 8,
    currentOccupants: 3,
    status: 'ACTIVE',
    addressLine: '22 Temple Road',
    city: 'Nugegoda',
    district: 'Colombo',
    latitude: 6.8690,
    longitude: 79.8892,
    nearestUniversity: 'University of Sri Jayewardenepura',
    distanceToUniversity: 2.1,
    amenities: { wifi: true, parking: true, furnished: true, ac: true, hotWater: true },
    images: [
      { id: 'i5', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', isPrimary: true, order: 0 },
    ],
    houseRules: ['No parties', 'Common area cleanup roster'],
    owner: { id: 'o1', firstName: 'Nimal', lastName: 'Perera', avatar: undefined },
    averageRating: 4.0,
    reviewCount: 6,
    viewCount: 89,
    saveCount: 5,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
  },
];

export const SAMPLE_REVIEWS = [
  {
    id: 'r1',
    reviewerId: 'u1',
    reviewerName: 'Dilshan K.',
    rating: 5,
    comment: 'Excellent place to stay! Very clean and the owner is very helpful. WiFi is fast and the location is perfect.',
    createdAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 'r2',
    reviewerId: 'u2',
    reviewerName: 'Amara P.',
    rating: 4,
    comment: 'Good value for money. The rooms are spacious and furnished well. Would recommend to fellow students.',
    createdAt: '2024-01-28T00:00:00Z',
  },
  {
    id: 'r3',
    reviewerId: 'u3',
    reviewerName: 'Rangi W.',
    rating: 4,
    comment: 'Safe neighbourhood and very close to uni. Hot water works well. Only minor issue is parking can be tight.',
    createdAt: '2023-12-10T00:00:00Z',
  },
];
