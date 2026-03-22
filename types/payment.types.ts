import type { PaymentMethod, PaymentStatus } from './reservation.types';

export interface DetailedPayment {
  id: string;
  reservationId: string;
  rentalPeriodId: string;
  studentId: string;
  /** Prisma Decimal serialised as string, e.g. "14000.00" */
  amount: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paidAt: string | null;
  referenceNumber: string | null;
  proofImageUrl: string | null;
  rejectionReason: string | null;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
  rentalPeriod?: {
    id: string;
    periodLabel: string;
    dueDate: string;
  };
  reservation?: {
    id: string;
    boarding?: {
      id: string;
      title: string;
    };
    student?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface CreatePaymentPayload {
  rentalPeriodId: string;
  reservationId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  /** ISO-8601 datetime string */
  paidAt: string;
  referenceNumber?: string;
  /** Hosted URL returned by PUT /payments/proof-image */
  proofImageUrl?: string;
}

export interface RejectPaymentPayload {
  reason: string;
}
