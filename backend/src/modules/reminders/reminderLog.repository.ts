import { pool } from '../../config/database.js';
import { REMINDER_MAX_RETRIES } from './reminder.config.js';

export class ReminderLogRepository {
  /**
   * Claim a send slot. Returns true if this process should send.
   * - New row → CLAIMED
   * - Existing FAILED under max retries → reclaim
   * - Existing SENT / CLAIMED / exhausted FAILED → false
   */
  async tryClaim(
    milestoneId: string,
    offsetDays: number,
    email: string,
    role: string,
  ): Promise<boolean> {
    const { rows } = await pool.query<{ status: string; retry_count: number }>(
      `SELECT status, retry_count
       FROM reminder_logs
       WHERE project_milestone_id = $1
         AND offset_days = $2
         AND recipient_email = $3`,
      [milestoneId, offsetDays, email],
    );

    const existing = rows[0];
    if (!existing) {
      await pool.query(
        `INSERT INTO reminder_logs
           (project_milestone_id, offset_days, recipient_email, recipient_role, status)
         VALUES ($1, $2, $3, $4, 'CLAIMED')`,
        [milestoneId, offsetDays, email, role],
      );
      return true;
    }

    if (existing.status === 'SENT' || existing.status === 'CLAIMED') {
      return false;
    }

    if (existing.status === 'FAILED' && existing.retry_count < REMINDER_MAX_RETRIES) {
      await pool.query(
        `UPDATE reminder_logs
         SET status = 'CLAIMED',
             error_message = NULL,
             retry_count = retry_count + 1,
             sent_at = NOW()
         WHERE project_milestone_id = $1
           AND offset_days = $2
           AND recipient_email = $3
           AND status = 'FAILED'`,
        [milestoneId, offsetDays, email],
      );
      return true;
    }

    return false;
  }

  async markSent(milestoneId: string, offsetDays: number, email: string): Promise<void> {
    await pool.query(
      `UPDATE reminder_logs
       SET status = 'SENT', error_message = NULL, sent_at = NOW()
       WHERE project_milestone_id = $1
         AND offset_days = $2
         AND recipient_email = $3`,
      [milestoneId, offsetDays, email],
    );
  }

  async markFailed(
    milestoneId: string,
    offsetDays: number,
    email: string,
    error: string,
  ): Promise<void> {
    await pool.query(
      `UPDATE reminder_logs
       SET status = 'FAILED', error_message = $4, sent_at = NOW()
       WHERE project_milestone_id = $1
         AND offset_days = $2
         AND recipient_email = $3`,
      [milestoneId, offsetDays, email, error.slice(0, 2000)],
    );
  }
}
