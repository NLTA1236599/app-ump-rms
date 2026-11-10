import type { User } from '../../types/index.js';

export type RegisterResponse = {
  message: string;
};

export type RegisterProfile = {
  staffId?: string;
  phone?: string;
  academicRank?: string;
  workUnit?: string;
  jobTitle?: string;
  requestedRoles?: string[];
};

export type ResendOtpResponse = {
  emailVerificationRequired: boolean;
  alreadyVerified?: boolean;
};

export interface IAuthService {
  login(username: string, password: string): Promise<{ token: string; user: User }>;
  register(
    username: string,
    password: string,
    displayName?: string,
    profile?: RegisterProfile
  ): Promise<RegisterResponse>;
  verifyOtp(email: string, otp: string): Promise<{ ok: boolean }>;
  resendOtp(email: string): Promise<ResendOtpResponse>;
  getProfile(token: string): Promise<{ user: User }>;
}
