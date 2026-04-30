import Mailgun from "mailgun.js";
import type { Interfaces } from "mailgun.js/definitions";

const rawDomain =
  process.env["MAILGUN_DOMAIN"]?.trim()
  ?? process.env["MAILGUN_LESSWRONG_DOMAIN"]?.trim();

export const MAILGUN_DOMAIN =
  rawDomain && rawDomain.length > 0 ? rawDomain : "lesserwrong.com";

function resolveMailgunApiKey(): string | null {
  const key =
    process.env["MAILGUN_API_KEY"]?.trim()
    ?? process.env["MAILGUN_LESSWRONG_API_KEY"]?.trim()
    ?? null;
  return key && key.length > 0 ? key : null;
}

let mailgunClientInstance: Interfaces.IMailgunClient | null = null;

/**
 * Returns a Mailgun client if the API key is configured, otherwise null.
 */
export function getMailgunClient(): Interfaces.IMailgunClient | null {
  const apiKey = resolveMailgunApiKey();
  if (!apiKey) return null;

  if (!mailgunClientInstance) {
    const mailgun = new Mailgun(FormData);
    mailgunClientInstance = mailgun.client({
      username: "api",
      key: apiKey,
    });
  }
  return mailgunClientInstance;
}
