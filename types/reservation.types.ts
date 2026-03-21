export type ReservationStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'COMPLETED';

export type RentalPeriodStatus = 'UPCOMING' | 'DUE' | 'PAID' | 'OVERDUE';

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
  periodNumber: number;
  dueDate: string;
  paidDate: string | null;
  amount: number;
  status: RentalPeriodStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  boardingId: string;
  studentId: string;
  moveInDate: string;
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
}

export interface RejectReservationPayload {
  rejectionReason: string;
}
