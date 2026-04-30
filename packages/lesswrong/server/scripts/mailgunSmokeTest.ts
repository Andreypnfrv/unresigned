/* eslint-disable no-console */
import fs from "fs";
import path from "path";

function loadRootDotenv() {
  const p = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(p)) return;
  for (const raw of fs.readFileSync(p, "utf8").split("\n")) {
    const line = raw.replace(/\r$/, "");
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

function maskKey(s: string | undefined): string {
  if (!s) return "(unset)";
  if (s.length <= 8) return `(${s.length} chars)`;
  return `${s.slice(0, 6)}…${s.slice(-3)} (${s.length} chars)`;
}

function resolveApiUrl(): string {
  const explicit = process.env.MAILGUN_API_URL?.trim();
  if (explicit) return explicit;
  if (process.env.MAILGUN_REGION?.trim().toUpperCase() === "EU") {
    return "https://api.eu.mailgun.net";
  }
  return "https://api.mailgun.net (default US)";
}

async function main() {
  const [
    { getMailgunClient, getMailgunDomain },
    { sendMailgunEmail },
    { defaultEmailSetting },
  ] = await Promise.all([
    import("@/server/mailgun/mailgunClient"),
    import("@/server/emails/sendEmail"),
    import("@/server/databaseSettings"),
  ]);

  const sendTo = process.argv.find((a) => a.startsWith("--send="))?.slice("--send=".length)?.trim();

  console.log("--- Mailgun env (after .env load) ---");
  console.log("NODE_ENV", process.env.NODE_ENV ?? "(unset)");
  console.log("MAILGUN_API_KEY", maskKey(process.env.MAILGUN_API_KEY ?? process.env.MAILGUN_LESSWRONG_API_KEY));
  console.log(
    "MAILGUN_DOMAIN env",
    process.env.MAILGUN_DOMAIN ?? process.env.MAILGUN_LESSWRONG_DOMAIN ?? "(unset; code may use default lesserwrong.com)",
  );
  console.log("MAILGUN_REGION", process.env.MAILGUN_REGION ?? "(unset)");
  console.log("effective API base", resolveApiUrl());
  console.log("resolved MAILGUN_DOMAIN (code)", getMailgunDomain());
  console.log("getMailgunClient()", getMailgunClient() ? "ok" : "null (no key)");
  console.log("defaultEmail (private_defaultEmail or default)", defaultEmailSetting.get());

  console.log(
    "--- App transactional path (wrapAndRenderEmail)",
    getMailgunClient() ? "always calls Mailgun (no NODE_ENV gate)" : "calls Mailgun; client null until MAILGUN_API_KEY set",
  );

  if (!sendTo) {
    console.log("\nAdd --send=you@example.com to call Mailgun messages.create directly.");
    return;
  }

  const fromStr = String(defaultEmailSetting.get()).trim();
  if (!fromStr || fromStr.includes("hello@world")) {
    console.error("Set private_defaultEmail (or server defaultEmail) to a real From on your Mailgun domain.");
    process.exitCode = 1;
    return;
  }

  console.log("\n--- Sending test via sendMailgunEmail →", sendTo, "---");
  const ok = await sendMailgunEmail({
    user: null,
    to: sendTo,
    from: fromStr,
    subject: "[Unresigned mailgun smoke test] " + new Date().toISOString(),
    text: "Mailgun smoke test body",
    html: "<p>Mailgun smoke test body</p>",
  });
  console.log("Result", ok ? "OK" : "FAILED (see errors above)");
  process.exitCode = ok ? 0 : 1;
}

void main();
