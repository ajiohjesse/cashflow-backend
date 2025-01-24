import { env } from '@/config/env.config';
import { Resend } from 'resend';
import { PublicError } from './error.lib';
import { logger } from './logger.lib';

const resend = new Resend(env.RESEND_API_KEY);

interface EmailProps {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailProps) => {
  const response = await resend.emails.send({
    from: `CashFlow <${env.EMAIL_DOMAIN}>`,
    to,
    subject,
    html,
  });

  if (response.error) {
    logger.error('Unable to send email -> ', response);
    throw new PublicError(500, 'Email sending failed');
  }
};
