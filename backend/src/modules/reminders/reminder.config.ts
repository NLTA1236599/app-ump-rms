/** Catch-up window: still send if trigger_date was missed within N days. */
export const REMINDER_CATCHUP_DAYS = Number(process.env.REMINDER_CATCHUP_DAYS ?? 3);

/** Daily cron (Asia/Ho_Chi_Minh). Empty / "interval" keeps legacy every-minute schedule. */
export const REMINDER_CRON = process.env.REMINDER_CRON ?? '';

export const REMINDER_TIMEZONE = process.env.REMINDER_TIMEZONE ?? 'Asia/Ho_Chi_Minh';

/** When true, also run the three legacy hard-coded jobs. */
export const REMINDER_LEGACY_JOBS = process.env.REMINDER_LEGACY_JOBS === 'true';

/** Max retries for FAILED reminder_logs before giving up. */
export const REMINDER_MAX_RETRIES = Number(process.env.REMINDER_MAX_RETRIES ?? 5);

/**
 * JSONB field on research_projects.data → milestone type code.
 * description column on reminder_milestone_types also stores the field name.
 */
export const MILESTONE_FIELD_BY_CODE: Record<string, string> = {
  PROGRESS_REPORT_1: 'progressReportDate1',
  PROGRESS_REPORT_2: 'progressReportDate2',
  PROGRESS_REPORT_3: 'progressReportDate3',
  PROGRESS_REPORT_4: 'progressReportDate4',
  MIDTERM_REPORT: 'reviewReportingDate',
  ACCEPTANCE: 'acceptanceMeetingDate',
  ACCEPTANCE_EXTENSION: 'extensionDate',
  FINAL_ACCEPTANCE_DOC: 'acceptanceCompletionDate',
};
