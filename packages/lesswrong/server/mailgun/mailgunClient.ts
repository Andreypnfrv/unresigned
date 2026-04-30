import Mailgun from "mailgun.js";
import type { Interfaces } from "mailgun.js/definitions";

/** Read on each use so env is never stale (e.g. scripts that load .env after imports). */
export function getMailgunDomain(): string {
  const raw =
    process.env["MAILGUN_DOMAIN"]?.trim()
    ?? process.env["MAILGUN_LESSWRONG_DOMAIN"]?.trim();
  return raw && raw.length > 0 ? raw : "lesserwrong.com";
}

function resolveMailgunApiKey(): string | null {
  const key =
    process.env["MAILGUN_API_KEY"]?.trim()
    ?? process.env["MAILGUN_LESSWRONG_API_KEY"]?.trim()
    ?? null;
  return key && key.length > 0 ? key : null;
}

function resolveMailgunApiUrl(): string | undefined {
  const explicit = process.env["MAILGUN_API_URL"]?.trim();
  if (explicit) {
    return explicit;
  }
  if (process.env["MAILGUN_REGION"]?.trim().toUpperCase() === "EU") {
    return "https://api.eu.mailgun.net";
  }
  return undefined;
}

let cachedClientKey: string | null = null;
let cachedClientUrl: string | undefined;
let mailgunClientInstance: Interfaces.IMailgunClient | null = null;

/**
 * Returns a Mailgun client if the API key is configured, otherwise null.
 */
export function getMailgunClient(): Interfaces.IMailgunClient | null {
  const apiKey = resolveMailgunApiKey();
  const url = resolveMailgunApiUrl();
  if (!apiKey) return null;

  if (
    !mailgunClientInstance
    || cachedClientKey !== apiKey
    || cachedClientUrl !== url
  ) {
    const mailgun = new Mailgun(FormData);
    mailgunClientInstance = mailgun.client({
      username: "api",
      key: apiKey,
      ...(url ? { url } : {}),
    });
    cachedClientKey = apiKey;
    cachedClientUrl = url;
  }
  return mailgunClientInstance;
}
