import type { User } from '../../types/index.js';
import type { OtpDeliveryChannel } from '../../modules/auth/otpConfig.js';
import type { RegisterProfileInput } from '../../modules/auth/registerProfile.js';

export type RegisterResult = {
  user: User;
  emailVerificationRequired: true;
  otpTtlSeconds: number;
  otpDeliveryChannel: OtpDeliveryChannel;
};

export type ResendOtpResult = {
  emailVerificationRequired: boolean;
  otpTtlSeconds: number;
  otpDeliveryChannel: OtpDeliveryChannel;
  alreadyVerified?: boolean;
};

/** Application port consumed by HTTP adapters (guide §3 D — controller depends on abstraction). */
export interface IAuthService {
  register(
    username: string,
    password: string,
    displayName?: string,
    profile?: RegisterProfileInput
  ): Promise<RegisterResult>;
  verifyOtp(email: string, otp: string): Promise<void>;
  resendOtp(email: string, clientIp: string): Promise<ResendOtpResult>;
  login(username: string, password: string): Promise<{ token: string; user: User }>;
  getProfile(userId: string): Promise<User | null>;
}
