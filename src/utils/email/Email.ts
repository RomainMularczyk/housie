import { createTransport } from 'nodemailer';
import { LogDomain, logger } from '../logger.js';

type EmailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

class Email {
  public static async send({ to, subject, text, html }: EmailOptions) {
    const transporter = createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 587,
      secure: false,
      auth: {
        user: 'c01a7e01c2d4e6',
        pass: 'adad2350e9bbaa',
      },
    });

    transporter.sendMail({
      from: '"Housie" <romain.mularczyk@gmail.com>',
      to: to,
      subject: subject,
      text: text,
      html: html,
    });

    logger.info([LogDomain.EMAIL], 'Email sent');
  }
}

export { Email };
