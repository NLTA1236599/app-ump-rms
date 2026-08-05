import { createEmailSender } from '../../services/email/createEmailSender.js';
import type { IEmailSender } from '../../services/email/IEmailSender.js';
import { pool } from '../../config/database.js';
import { REMINDER_CATCHUP_DAYS } from './reminder.config.js';
import { RecipientResolver } from './recipientResolver.js';
import { ReminderLogRepository } from './reminderLog.repository.js';
import { ReminderRepository } from './reminder.repository.js';
import { buildReminderEmail } from './reminderTemplate.js';
import type { ReminderRunResult } from './reminder.types.js';

const ADVISORY_LOCK_KEY = 824_501_927;

export class SendDueRemindersUseCase {
  constructor(
    private readonly reminders = new ReminderRepository(),
    private readonly recipients = new RecipientResolver(),
    private readonly logs = new ReminderLogRepository(),
    private readonly mailer: IEmailSender = createEmailSender(),
    private readonly catchupDays = REMINDER_CATCHUP_DAYS,
  ) {}

  async execute(): Promise<ReminderRunResult> {
    const locked = await this.tryLock();
    if (!locked) {
      console.log('[TKKT-Reminder] Skipped — another instance holds the advisory lock');
      return { totalDue: 0, sent: 0, skipped: 0, failed: 0 };
    }

    try {
      const due = await this.reminders.findDueReminders(this.catchupDays);
      let sent = 0;
      let skipped = 0;
      let failed = 0;

      for (const reminder of due) {
        const people = await this.recipients.resolve(reminder.projectId);
        if (people.length === 0) {
          console.warn(
            `[TKKT-Reminder] No recipients for project ${reminder.projectId} (${reminder.milestoneCode})`,
          );
          continue;
        }

        for (const person of people) {
          const claimed = await this.logs.tryClaim(
            reminder.projectMilestoneId,
            reminder.offsetDays,
            person.email,
            person.role,
          );
          if (!claimed) {
            skipped += 1;
            continue;
          }

          try {
            const { subject, html } = buildReminderEmail(reminder, person);
            await this.mailer.send({ to: person.email, subject, html });
            await this.logs.markSent(
              reminder.projectMilestoneId,
              reminder.offsetDays,
              person.email,
            );
            sent += 1;
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            await this.logs.markFailed(
              reminder.projectMilestoneId,
              reminder.offsetDays,
              person.email,
              message,
            );
            failed += 1;
          }
        }
      }

      const result = { totalDue: due.length, sent, skipped, failed };
      console.log('[TKKT-Reminder] Run complete', result);
      return result;
    } finally {
      await this.releaseLock();
    }
  }

  private async tryLock(): Promise<boolean> {
    const { rows } = await pool.query<{ locked: boolean }>(
      `SELECT pg_try_advisory_lock($1) AS locked`,
      [ADVISORY_LOCK_KEY],
    );
    return Boolean(rows[0]?.locked);
  }

  private async releaseLock(): Promise<void> {
    await pool.query(`SELECT pg_advisory_unlock($1)`, [ADVISORY_LOCK_KEY]);
  }
}
