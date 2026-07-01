/** Lookahead windows for the three reminder jobs (PostgreSQL interval syntax). */
export const REMINDER_LOOKAHEAD = {
  report: process.env.REMINDER_REPORT_LOOKAHEAD ?? '1 minute',
  acceptanceLong: process.env.REMINDER_ACCEPTANCE_LONG_LOOKAHEAD ?? '3 minutes',
  acceptanceShort: process.env.REMINDER_ACCEPTANCE_SHORT_LOOKAHEAD ?? '1 minute',
} as const;

/** Vietnamese labels shown in email copy. */
export const REMINDER_LABELS = {
  report: process.env.REMINDER_REPORT_LABEL ?? '1 phút',
  acceptanceLong: process.env.REMINDER_ACCEPTANCE_LONG_LABEL ?? '3 phút',
  acceptanceShort: process.env.REMINDER_ACCEPTANCE_SHORT_LABEL ?? '1 phút',
} as const;

/** First run today at this local time (see REMINDER_TIMEZONE), then every minute. */
export const REMINDER_START_HOUR = Number(process.env.REMINDER_START_HOUR ?? 13);
export const REMINDER_START_MINUTE = Number(process.env.REMINDER_START_MINUTE ?? 0);

/** IANA timezone for scheduler and DB deadline matching (Bangkok/Hanoi = UTC+7). */
export const REMINDER_TIMEZONE = process.env.REMINDER_TIMEZONE ?? 'Asia/Ho_Chi_Minh';

/** Match window around the target deadline (seconds). */
export const REMINDER_MATCH_WINDOW_SECONDS = Number(
  process.env.REMINDER_MATCH_WINDOW_SECONDS ?? 30,
);
