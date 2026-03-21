export type VisitStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export type VisitTimeslot =
  | 'MORNING_9_10'
  | 'MORNING_10_11'
  | 'MORNING_11_12'
  | 'AFTERNOON_12_1'
  | 'AFTERNOON_1_2'
  | 'AFTERNOON_2_3'
  | 'AFTERNOON_3_4'
  | 'AFTERNOON_4_5'
  | 'EVENING_5_6'
  | 'EVENING_6_7';

export const TIMESLOT_LABELS: Record<VisitTimeslot, string> = {
  MORNING_9_10: '9:00 AM – 10:00 AM',
  MORNING_10_11: '10:00 AM – 11:00 AM',
  MORNING_11_12: '11:00 AM – 12:00 PM',
  AFTERNOON_12_1: '12:00 PM – 1:00 PM',
  AFTERNOON_1_2: '1:00 PM – 2:00 PM',
  AFTERNOON_2_3: '2:00 PM – 3:00 PM',
  AFTERNOON_3_4: '3:00 PM – 4:00 PM',
  AFTERNOON_4_5: '4:00 PM – 5:00 PM',
  EVENING_5_6: '5:00 PM – 6:00 PM',
  EVENING_6_7: '6:00 PM – 7:00 PM',
};

export interface VisitBoardingInfo {
  id: string;
  title: string;
  address: string;
  city: string;
  slug: string;
}

export interface VisitStudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface VisitRequest {
  id: string;
  boardingId: string;
  studentId: string;
  visitDate: string;
  timeslot: VisitTimeslot;
  status: VisitStatus;
  rejectionReason: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  boarding: VisitBoardingInfo;
  student?: VisitStudentInfo;
}

export interface CreateVisitRequestPayload {
  boardingId: string;
  visitDate: string;
  timeslot: VisitTimeslot;
}

export interface RejectVisitPayload {
  rejectionReason: string;
}
