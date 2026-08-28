import type { User } from '../../types/index.js';
import type { OtpDeliveryChannel } from '../../components/auth/registration/constants.js';

export type RegisterResponse = {
  user: User;
  emailVerificationRequired: boolean;
  otpTtlSeconds: number;
  otpDeliveryChannel: OtpDeliveryChannel;
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
  otpTtlSeconds: number;
  otpDeliveryChannel: OtpDeliveryChannel;
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
