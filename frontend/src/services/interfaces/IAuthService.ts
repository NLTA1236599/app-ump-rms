import type { User } from '../../types/index.js';
import type { OtpDeliveryChannel } from '../../components/auth/registration/constants.js';

export type RegisterResponse = {
  user: User;
  emailVerificationRequired: boolean;
  otpTtlSeconds: number;
  otpDeliveryChannel: OtpDeliveryChannel;
};

export type ResendOtpResponse = {
  emailVerificationRequired: boolean;
  otpTtlSeconds: number;
  otpDeliveryChannel: OtpDeliveryChannel;
};

export interface IAuthService {
  login(username: string, password: string): Promise<{ token: string; user: User }>;
  register(
    username: string,
    password: string,
    displayName?: string
  ): Promise<RegisterResponse>;
  verifyOtp(email: string, otp: string): Promise<{ ok: boolean }>;
  resendOtp(email: string): Promise<ResendOtpResponse>;
  getProfile(token: string): Promise<{ user: User }>;
}
