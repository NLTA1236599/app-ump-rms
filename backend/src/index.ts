import './config/env.js';
import app from './app.js';
import { registerReminderJobs } from './jobs/reminderJob.js';

const port = Number(process.env.PORT) || 3001;
const host = process.env.LISTEN_HOST ?? '0.0.0.0';

app.listen(port, host, () => {
  console.log(`API listening on http://${host}:${port}`);
  registerReminderJobs();
});
