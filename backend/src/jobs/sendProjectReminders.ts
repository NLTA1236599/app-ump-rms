import { pool } from '../config/database.js';
import type { IEmailSender } from '../services/email/IEmailSender.js';
import type { IEmailTemplate, ReminderTemplateData } from '../services/email/IEmailTemplate.js';
import type { ProjectRecipient } from '../services/reminder/IReminderQuery.js';

type Recipient = {
  email: string;
  name: string;
  role: string;
};

async function wasAlreadySent(
  projectId: string,
  jobType: string,
  recipient: string,
): Promise<boolean> {
  const dedupSeconds = Number(process.env.REMINDER_DEDUP_SECONDS ?? 50);
  const { rows } = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM reminder_send_log
       WHERE project_id = $1
         AND job_type = $2
         AND recipient = $3
         AND created_at > NOW() - make_interval(secs => $4)
     ) AS exists`,
    [projectId, jobType, recipient, dedupSeconds],
  );
  return Boolean(rows[0]?.exists);
}

async function markSent(projectId: string, jobType: string, recipient: string): Promise<void> {
  await pool.query(
    `INSERT INTO reminder_send_log (project_id, job_type, recipient)
     VALUES ($1, $2, $3)
     ON CONFLICT (project_id, job_type, recipient, sent_on) DO NOTHING`,
    [projectId, jobType, recipient],
  );
}

export async function sendProjectReminders(
  jobType: string,
  projects: ProjectRecipient[],
  template: IEmailTemplate,
  mailer: IEmailSender,
  daysOrMonths: string,
): Promise<number> {
  let sentCount = 0;

  for (const project of projects) {
    const deadlineDate = project.deadlineDate.toLocaleString('vi-VN');
    const recipients: Recipient[] = [
      { ...project.leader, role: 'Chủ nhiệm đề tài' },
      ...project.specialists.map((specialist) => ({ ...specialist, role: 'Chuyên viên' })),
    ];

    for (const recipient of recipients) {
      if (!recipient.email) continue;

      const alreadySent = await wasAlreadySent(project.projectId, jobType, recipient.email);
      if (alreadySent) continue;

      const templateData: ReminderTemplateData = {
        recipientName: recipient.name,
        role: recipient.role,
        projectTitle: project.projectTitle,
        deadlineDate,
        daysOrMonths,
      };

      await mailer.send({
        to: recipient.email,
        subject: template.subject(templateData),
        html: template.html(templateData),
      });

      await markSent(project.projectId, jobType, recipient.email);
      sentCount += 1;
    }

    console.log(`[${jobType}] Processed reminder for: ${project.projectTitle}`);
  }

  return sentCount;
}
