import type { Pool, PoolClient } from 'pg';
import type {
  IRegistrationOtpRepository,
  PendingOtpRow,
} from '../contracts/registrationOtpRepository.js';

export class PgRegistrationOtpRepository implements IRegistrationOtpRepository {
  constructor(private readonly pool: Pool) {}

  async issueOtp(
    client: PoolClient,
    userId: string,
    otpHash: string,
    expiresAt: Date
  ): Promise<void> {
    await client.query(
      `DELETE FROM registration_otp_codes
       WHERE user_id = $1 AND used_at IS NULL`,
      [userId]
    );
    await client.query(
      `INSERT INTO registration_otp_codes (user_id, otp_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, otpHash, expiresAt]
    );
  }

  async findLatestPending(
    userId: string,
    maxFailedAttempts: number
  ): Promise<PendingOtpRow | null> {
    const { rows } = await this.pool.query(
      `SELECT id, user_id, otp_hash, expires_at, failed_attempts
       FROM registration_otp_codes
       WHERE user_id = $1
         AND used_at IS NULL
         AND expires_at > NOW()
         AND failed_attempts < $2
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, maxFailedAttempts]
    );
    const r = rows[0];
    if (!r) return null;
    return {
      id: String(r.id),
      userId: String(r.user_id),
      otpHash: String(r.otp_hash),
      expiresAt: new Date(r.expires_at as string),
      failedAttempts: Number(r.failed_attempts),
    };
  }

  async incrementFailedAttempts(otpId: string): Promise<void> {
    await this.pool.query(
      `UPDATE registration_otp_codes
       SET failed_attempts = failed_attempts + 1
       WHERE id = $1`,
      [otpId]
    );
  }

  async markUsed(otpId: string): Promise<void> {
    await this.pool.query(
      `UPDATE registration_otp_codes
       SET used_at = NOW()
       WHERE id = $1`,
      [otpId]
    );
  }
}
