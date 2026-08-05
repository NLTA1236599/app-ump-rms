import { pool } from '../../config/database.js';
import { REMINDER_TIMEZONE } from './reminder.config.js';
import type { DueReminder } from './reminder.types.js';

export class ReminderRepository {
  async findDueReminders(catchupDays: number): Promise<DueReminder[]> {
    const { rows } = await pool.query<{
      project_milestone_id: string;
      project_id: string;
      milestone_code: string;
      milestone_name: string;
      due_date: string;
      offset_days: number;
      project_title: string;
      project_code: string;
    }>(
      `SELECT
         pm.id::text AS project_milestone_id,
         pm.project_id::text AS project_id,
         mt.code AS milestone_code,
         mt.name_vi AS milestone_name,
         pm.due_date::text AS due_date,
         ro.offset_days,
         COALESCE(NULLIF(rp.data->>'title', ''), 'Đề tài không tên') AS project_title,
         COALESCE(NULLIF(rp.data->>'contractId', ''), NULLIF(rp.data->>'projectCode', ''), '') AS project_code
       FROM project_milestones pm
       JOIN reminder_milestone_types mt ON mt.id = pm.milestone_type_id AND mt.is_active
       JOIN reminder_offsets ro ON ro.milestone_type_id = mt.id AND ro.is_active
       JOIN research_projects rp ON rp.id = pm.project_id
       WHERE pm.status = 'PENDING'
         AND (pm.due_date - ro.offset_days)
               BETWEEN ((timezone($2, now()))::date - $1::INT)
                   AND (timezone($2, now()))::date
       ORDER BY pm.due_date ASC, ro.offset_days DESC`,
      [catchupDays, REMINDER_TIMEZONE],
    );

    return rows.map((row) => ({
      projectMilestoneId: row.project_milestone_id,
      projectId: row.project_id,
      milestoneCode: row.milestone_code,
      milestoneName: row.milestone_name,
      dueDate: row.due_date,
      offsetDays: row.offset_days,
      projectTitle: row.project_title,
      projectCode: row.project_code,
    }));
  }
}
