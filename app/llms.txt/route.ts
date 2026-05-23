import { forumTitleSetting, taglineSetting } from "@/lib/instanceSettings";
import { getSiteUrlFromReq } from "@/server/utils/getSiteUrl";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const siteUrl = getSiteUrlFromReq(req);
  const title = forumTitleSetting.get();
  const tagline = taglineSetting.get();

  const body = `# ${title}

> ${tagline}

This site provides machine-readable Markdown versions of most public pages.
Full agent API documentation: ${siteUrl}/api/SKILL.md
Machine-readable site manifest: ${siteUrl}/.well-known/ai-agents.json

## Discovery
- ${siteUrl}/api/home — front page posts (markdown)
- ${siteUrl}/api/latest — newest posts
- ${siteUrl}/api/recent — recent posts
- ${siteUrl}/api/curated — curated posts
- ${siteUrl}/api/search — search posts, tags, users, comments, sequences

## Static pages (markdown)
- ${siteUrl}/about
- ${siteUrl}/faq
- ${siteUrl}/contact

## Reading content
- ${siteUrl}/api/post/[id-or-slug]
- ${siteUrl}/api/post/[id-or-slug]/comments
- ${siteUrl}/api/tag/[slug]
- ${siteUrl}/api/user/[slug]
- ${siteUrl}/api/sequence/[id]

## HTML alternatives
Append ?format=markdown to most public HTML URLs, or send Accept: text/markdown.

## Sitemap
- ${siteUrl}/sitemap.xml

## RSS
- ${siteUrl}/feed.xml
`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
