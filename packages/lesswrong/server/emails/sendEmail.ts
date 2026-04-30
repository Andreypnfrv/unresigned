import { getMailgunClient, getMailgunDomain } from '../mailgun/mailgunClient';
import type { RenderedEmail } from './renderEmail';

/**
 * Send an email using Mailgun. Returns true for success or false for failure.
 */
export const sendMailgunEmail = async (email: RenderedEmail): Promise<boolean> => {
  if (email.user?.deleted) {
    // eslint-disable-next-line no-console
    console.error("Attempting to send an email to a deleted user");
    return false;
  }

  const mailgunClient = getMailgunClient();
  
  if (!mailgunClient) {
    // eslint-disable-next-line no-console
    console.error("Unable to send email because no Mailgun API key is configured");
    return false;
  }
  
  try {
    const result = await mailgunClient.messages.create(getMailgunDomain(), {
      from: email.from,
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });

    const status =
      result && typeof result === "object" && "status" in result
      && typeof (result as { status: unknown }).status === "number"
        ? (result as { status: number }).status
        : undefined;
    if (status === undefined) {
      return true;
    }
    if (status >= 200 && status < 300) {
      return true;
    }
    // eslint-disable-next-line no-console
    console.error(`Mailgun send unexpected status=${status}`, result);
    return false;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Mailgun messages.create failed", e);
    return false;
  }
}
