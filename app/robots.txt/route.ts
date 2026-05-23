import { isProduction } from "@/lib/executionEnvironment";
import { siteUrlSetting, testServerSetting } from "@/lib/instanceSettings";
import { robotsTxtSetting } from "@/server/databaseSettings";
import { getSiteUrlFromReq } from "@/server/utils/getSiteUrl";
import type { NextRequest } from "next/server";

// ea-forum-look-here
// We only want robots.txt to make the site crawlable if it's one of our site's primary domains,
// rather than a test/debug server like baserates.org.  We have this domain whitelist, but when
// forwarding through cloudfront, the domain in nextUrl.host will be the forwarding destination
// (i.e. *.vercel.app) rather than the origin.  So, while we're having cloudfront forward traffic,
// we also have it add headers that mark where it was forwarded from.
const CRAWLABLE_HOSTS = new Set([
  'www.lesswrong.com',
  'www.alignmentforum.org',
]);

const CRAWLABLE_HEADERS = [
  'X-Is-UnresignedCom',
  'X-Is-AlignmentForumOrg',
  'X-Is-AntimortalityOrg',
];

function normalizeHostname(host: string): string {
  return host.split(":")[0].trim().toLowerCase().replace(/^www\./, "");
}

function getRequestHostnames(req: NextRequest): string[] {
  const hosts = [req.nextUrl.host];
  const forwardedHost = req.headers.get("x-forwarded-host");
  if (forwardedHost) {
    hosts.push(forwardedHost.split(",")[0].trim());
  }
  return hosts.map(normalizeHostname);
}

function isPrimaryProductionSite(req: NextRequest): boolean {
  if (testServerSetting.get()) {
    return false;
  }
  try {
    const siteHostname = normalizeHostname(new URL(siteUrlSetting.get()).hostname);
    return getRequestHostnames(req).some(host => host === siteHostname);
  } catch {
    return false;
  }
}

const documentationComment = (req: NextRequest) => {
  const urlPrefix = getSiteUrlFromReq(req);
  return `# This site has a Markdown version that is more friendly to AI agents than the HTML version. Documentation at: ${urlPrefix}/api/SKILL.md and ${urlPrefix}/llms.txt`;
}

const nonCrawlableMirrorComment = `# This site is a secondary mirror that should not be crawled.`;

function isCrawlable(req: NextRequest) {
  return CRAWLABLE_HOSTS.has(req.nextUrl.host)
    || CRAWLABLE_HEADERS.some(header => req.headers.get(header))
    || isPrimaryProductionSite(req);
}

export async function GET(req: NextRequest) {
  if (isProduction && !isCrawlable(req)) {
    return new Response(`${documentationComment(req)}\n${nonCrawlableMirrorComment}\n\nUser-agent: *\nDisallow: /`, {status: 200});
  } else if (robotsTxtSetting.get()) {
    return new Response(robotsTxtSetting.get(), {status: 200});
  }

  const urlPrefix = getSiteUrlFromReq(req);
  return new Response(
    `${documentationComment(req)}

Sitemap: ${urlPrefix}/sitemap.xml

User-agent: *
Disallow: /allPosts?*
Disallow: /allPosts
Disallow: /allposts
Disallow: /allposts?*
Disallow: /out?*
Disallow: /graphiql
Disallow: /debug
Disallow: /admin
Disallow: /compare
Disallow: /emailToken
Disallow: /*?commentId=*
Disallow: /users/*/replies
Disallow: /moderation
Crawl-Delay: 3

User-Agent: SemrushBot
Disallow: /
`, {status: 200});
}
