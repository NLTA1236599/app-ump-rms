import type { PoolClient } from 'pg';

export type PendingOtpRow = {
  id: string;
  userId: string;
  otpHash: string;
  expiresAt: Date;
  failedAttempts: number;
};

export interface IRegistrationOtpRepository {
  /** Delete unused OTPs for user, then insert a new pending row (within a transaction). */
  issueOtp(
    client: PoolClient,
    userId: string,
    otpHash: string,
    expiresAt: Date
  ): Promise<void>;

  findLatestPending(
    userId: string,
    maxFailedAttempts: number
  ): Promise<PendingOtpRow | null>;

  incrementFailedAttempts(otpId: string): Promise<void>;

  markUsed(otpId: string): Promise<void>;
}
