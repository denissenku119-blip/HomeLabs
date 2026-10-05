import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

const schema = z.object({
  type: z.enum(['bug', 'feature', 'suggestion', 'general', 'other']),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000),
  email: z.string().trim().max(254).email().optional().or(z.literal('')),
  appVersion: z.string().max(40),
  platform: z.string().max(40),
});

/** Emails feedback to the private inbox via the connected Gmail account. Destination stays server-side. */
export const sendFeedbackEmail = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const lovableKey = process.env['LOVABLE_API_KEY'];
    const gmailKey = process.env['GOOGLE_MAIL_API_KEY'];
    const to = process.env['FEEDBACK_TO_EMAIL'];
    if (!lovableKey || !gmailKey || !to) {
      console.error('Feedback email not configured');
      return { ok: false as const, error: 'Feedback delivery is not configured.' };
    }

    const clean = (s: string) => s.replace(/[\r\n]+/g, ' ');
    const b64 = (s: string) =>
      btoa(Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join(''));
    const header = (v: string) => (/^[\x00-\x7F]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=`);

    const body = [
      `Type: ${data.type}`,
      `Subject: ${data.subject}`,
      `Reply-to: ${data.email || '(not provided)'}`,
      `App version: ${data.appVersion}`,
      `Platform: ${data.platform}`,
      `Date: ${new Date().toISOString()}`,
      '',
      data.message,
    ].join('\r\n');

    const lines = [
      `To: ${to}`,
      `Subject: ${header(clean(`[HomeLab Feedback] ${data.type}: ${data.subject}`))}`,
      ...(data.email ? [`Reply-To: ${clean(data.email)}`] : []),
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: base64',
      '',
      b64(body),
    ];
    const raw = b64(lines.join('\r\n')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    try {
      const res = await fetch(
        'https://connector-gateway.lovable.dev/google_mail/gmail/v1/users/me/messages/send',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            'X-Connection-Api-Key': gmailKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw }),
        }
      );
      if (!res.ok) {
        console.error(`Feedback email failed [${res.status}]: ${await res.text()}`);
        return { ok: false as const, error: 'The feedback service could not deliver your message.' };
      }
      return { ok: true as const };
    } catch (e) {
      console.error('Feedback email error', e);
      return { ok: false as const, error: 'The feedback service is unreachable.' };
    }
  });
