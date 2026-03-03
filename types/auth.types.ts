export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterStudentRequest {
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  password: string;
  confirmPassword: string;
  role: 'student';
}

export interface RegisterOwnerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nicNumber?: string;
  password: string;
  confirmPassword: string;
  role: 'owner';
}

export type RegisterData = RegisterStudentRequest | RegisterOwnerRequest;

export interface AuthResponse {
  token: string;
  user: import('./user.types').User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
