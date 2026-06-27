// server/testEmail.mjs
import { sendEmail, logoBase64 } from './services/emailService.js';
import { CONTACT_RECEIVER_EMAIL } from './config/env.js';

(async () => {
  try {
    await sendEmail({
      to: CONTACT_RECEIVER_EMAIL,
      subject: 'Test Email from RiskBuster',
      text: 'This is a test email.',
      html: `<p>This is a <strong>test</strong> email.</p>`
    });
    console.log('✅ Test email sent successfully');
  } catch (err) {
    console.error('❌ Test email failed', err);
  }
})();
