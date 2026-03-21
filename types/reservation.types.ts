export type ReservationStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'EXPIRED';

export type RentalPeriodStatus = 'UPCOMING' | 'DUE' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'ONLINE';

export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export interface Payment {
  id: string;
  /** Prisma Decimal serialised as string */
  amount: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paidAt: string | null;
  confirmedAt: string | null;
}

export interface ReservationBoardingInfo {
  id: string;
  title: string;
  address: string;
  city: string;
  slug: string;
  monthlyRent: number;
}

export interface ReservationStudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  university?: string;
}

export interface RentalPeriod {
  id: string;
  reservationId: string;
  /** e.g. "2026-04" */
  periodLabel: string;
  dueDate: string;
  amountDue: number;
  status: RentalPeriodStatus;
  createdAt: string;
  updatedAt: string;
  payments: Payment[];
}

export interface Reservation {
  id: string;
  boardingId: string;
  studentId: string;
  moveInDate: string;
  specialRequests?: string | null;
  status: ReservationStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  boarding: ReservationBoardingInfo;
  student?: ReservationStudentInfo;
  rentalPeriods?: RentalPeriod[];
}

export interface CreateReservationPayload {
  boardingId: string;
  moveInDate: string;
  specialRequests?: string;
}

export interface RejectReservationPayload {
  reason: string;
}

