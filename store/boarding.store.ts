import { create } from 'zustand';
import type { Boarding, BoardingFilters, SortOption, CreateBoardingData } from '@/types/boarding.types';

interface BoardingState {
  savedIds: string[];
  filters: BoardingFilters;
  sortOption: SortOption;
  createDraft: Partial<CreateBoardingData>;
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  setSavedIds: (ids: string[]) => void;
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

  setSavedIds: (ids) => set({ savedIds: ids }),

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
    ownerId: 'o1',
    slug: 'the-hub-residences',
    title: 'The Hub Residences',
    description:
      'Modern fully-furnished rooms close to University of Kelaniya. Safe, clean, and affordable with 24/7 security.',
    boardingType: 'SINGLE_ROOM',
    genderPref: 'ANY',
    monthlyRent: 15000,
    maxOccupants: 4,
    currentOccupants: 2,
    status: 'ACTIVE',
    address: '123 Kandy Road',
    city: 'Kelaniya',
    district: 'Gampaha',
    latitude: 7.0,
    longitude: 79.92,
    nearUniversity: 'University of Kelaniya',
    rejectionReason: null,
    isDeleted: false,
    amenities: [
      { id: 'am1', name: 'WIFI', createdAt: '2024-01-15T00:00:00Z' },
      { id: 'am2', name: 'PARKING', createdAt: '2024-01-15T00:00:00Z' },
      { id: 'am3', name: 'HOT_WATER', createdAt: '2024-01-15T00:00:00Z' },
      { id: 'am4', name: 'SECURITY', createdAt: '2024-01-15T00:00:00Z' },
    ],
    images: [
      { id: 'i1', url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', publicId: 'boarding_images/i1', createdAt: '2024-01-15T00:00:00Z' },
      { id: 'i2', url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', publicId: 'boarding_images/i2', createdAt: '2024-01-15T00:00:00Z' },
    ],
    rules: [
      { id: 'r1', rule: 'No smoking' },
      { id: 'r2', rule: 'No pets' },
      { id: 'r3', rule: 'Guests allowed until 10pm' },
    ],
    owner: { id: 'o1', firstName: 'Nimal', lastName: 'Perera', phone: '+94111111111' },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
  {
    id: '2',
    ownerId: 'o2',
    slug: 'uni-nest-moratuwa',
    title: 'UniNest Moratuwa',
    description:
      'Spacious shared rooms ideal for UOM students. Walking distance to campus.',
    boardingType: 'SHARED_ROOM',
    genderPref: 'MALE',
    monthlyRent: 12000,
    maxOccupants: 6,
    currentOccupants: 5,
    status: 'ACTIVE',
    address: '45 Galle Road',
    city: 'Moratuwa',
    district: 'Colombo',
    latitude: 6.7735,
    longitude: 79.8830,
    nearUniversity: 'University of Moratuwa',
    rejectionReason: null,
    isDeleted: false,
    amenities: [
      { id: 'am5', name: 'WIFI', createdAt: '2024-02-10T00:00:00Z' },
    ],
    images: [
      { id: 'i3', url: 'https://images.unsplash.com/photo-1586105449897-20b5efeb3233?w=800', publicId: 'boarding_images/i3', createdAt: '2024-02-10T00:00:00Z' },
    ],
    rules: [
      { id: 'r4', rule: 'No smoking' },
      { id: 'r5', rule: 'Study hours 8pm–6am' },
    ],
    owner: { id: 'o2', firstName: 'Kamal', lastName: 'Silva', phone: '+94222222222' },
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-03-05T00:00:00Z',
  },
  {
    id: '3',
    ownerId: 'o3',
    slug: 'campus-lofts-kandy',
    title: 'Campus Lofts Kandy',
    description:
      'Comfortable annex-style accommodation near University of Peradeniya.',
    boardingType: 'ANNEX',
    genderPref: 'FEMALE',
    monthlyRent: 10000,
    maxOccupants: 2,
    currentOccupants: 1,
    status: 'ACTIVE',
    address: '78 Peradeniya Road',
    city: 'Kandy',
    district: 'Kandy',
    latitude: 7.2906,
    longitude: 80.6337,
    nearUniversity: 'University of Peradeniya',
    rejectionReason: null,
    isDeleted: false,
    amenities: [
      { id: 'am6', name: 'WIFI', createdAt: '2024-01-20T00:00:00Z' },
      { id: 'am7', name: 'HOT_WATER', createdAt: '2024-01-20T00:00:00Z' },
    ],
    images: [
      { id: 'i4', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', publicId: 'boarding_images/i4', createdAt: '2024-01-20T00:00:00Z' },
    ],
    rules: [
      { id: 'r6', rule: 'Female residents only' },
      { id: 'r7', rule: 'No visitors after 9pm' },
    ],
    owner: { id: 'o3', firstName: 'Sanduni', lastName: 'Fernando', phone: '+94333333333' },
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-02-28T00:00:00Z',
  },
  {
    id: '4',
    ownerId: 'o1',
    slug: 'blue-horizon-boarding',
    title: 'Blue Horizon Boarding',
    description: 'Affordable full house for a group of students. Fully furnished with AC.',
    boardingType: 'HOUSE',
    genderPref: 'ANY',
    monthlyRent: 8000,
    maxOccupants: 8,
    currentOccupants: 3,
    status: 'ACTIVE',
    address: '22 Temple Road',
    city: 'Nugegoda',
    district: 'Colombo',
    latitude: 6.8690,
    longitude: 79.8892,
    nearUniversity: 'University of Sri Jayewardenepura',
    rejectionReason: null,
    isDeleted: false,
    amenities: [
      { id: 'am8', name: 'WIFI', createdAt: '2024-03-01T00:00:00Z' },
      { id: 'am9', name: 'PARKING', createdAt: '2024-03-01T00:00:00Z' },
      { id: 'am10', name: 'AIR_CONDITIONING', createdAt: '2024-03-01T00:00:00Z' },
      { id: 'am11', name: 'HOT_WATER', createdAt: '2024-03-01T00:00:00Z' },
      { id: 'am12', name: 'SECURITY', createdAt: '2024-03-01T00:00:00Z' },
    ],
    images: [
      { id: 'i5', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', publicId: 'boarding_images/i5', createdAt: '2024-03-01T00:00:00Z' },
    ],
    rules: [
      { id: 'r8', rule: 'No parties' },
      { id: 'r9', rule: 'Common area cleanup roster' },
    ],
    owner: { id: 'o1', firstName: 'Nimal', lastName: 'Perera', phone: '+94111111111' },
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
