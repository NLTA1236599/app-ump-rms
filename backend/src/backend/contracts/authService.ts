import type { User } from '../../types/index.js';
import type { OtpDeliveryChannel } from '../../modules/auth/otpConfig.js';

export type RegisterResult = {
  user: User;
  emailVerificationRequired: true;
  otpTtlSeconds: number;
  otpDeliveryChannel: OtpDeliveryChannel;
};

export type ResendOtpResult = {
  emailVerificationRequired: true;
  otpTtlSeconds: number;
  otpDeliveryChannel: OtpDeliveryChannel;
};

/** Application port consumed by HTTP adapters (guide §3 D — controller depends on abstraction). */
export interface IAuthService {
  register(username: string, password: string, displayName?: string): Promise<RegisterResult>;
  verifyOtp(email: string, otp: string): Promise<void>;
  resendOtp(email: string, clientIp: string): Promise<ResendOtpResult>;
  login(username: string, password: string): Promise<{ token: string; user: User }>;
  getProfile(userId: string): Promise<User | null>;
}
