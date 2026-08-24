/**
 * Send one OTP-template email to a known inbox (does not create a user).
 * Usage: npx tsx --env-file=../.env src/scripts/testOtpMail.ts
 */
import '../config/env.js';
import { createEmailSender } from '../services/email/createEmailSender.js';
import {
  registrationOtpHtml,
  registrationOtpSubject,
  registrationOtpText,
} from '../services/email/templates/registrationOtpTemplate.js';

const TO = process.env.OTP_TEST_TO?.trim() || 'nltanh@ump.edu.vn';
const SAMPLE_OTP = '847291';

async function main() {
  console.log('=== Test gửi mail OTP ===');
  console.log('to:', TO);
  const mailer = createEmailSender();
  await mailer.send({
    to: TO,
    subject: registrationOtpSubject(),
    html: registrationOtpHtml(SAMPLE_OTP, 10),
    text: registrationOtpText(SAMPLE_OTP, 10),
    transactional: true,
    headers: { 'X-UMP-RMS-Notification': 'registration-otp' },
  });
  console.log('=== OTP MAIL SENT ===');
  console.log('Check inbox + Spam for', TO, '— sample code', SAMPLE_OTP);
}

main().catch((err) => {
  console.error('=== OTP MAIL FAILED ===');
  console.error(err);
  process.exit(1);
});
