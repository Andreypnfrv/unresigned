import { postGetPageUrl } from "@/lib/collections/posts/helpers";
import { sequenceGetPageUrl } from "@/lib/collections/sequences/helpers";
import { tagGetUrl } from "@/lib/collections/tags/helpers";
import { getSiteUrl } from "@/lib/vulcan-lib/utils";
import Posts from "@/server/collections/posts/collection";
import Sequences from "@/server/collections/sequences/collection";
import Tags from "@/server/collections/tags/collection";
import type { MetadataRoute } from "next";

const STATIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/search", changeFrequency: "weekly", priority: 0.5 },
  { path: "/wikitags/all", changeFrequency: "weekly", priority: 0.6 },
  { path: "/feed.xml", changeFrequency: "hourly", priority: 0.4 },
];

export async function getSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl().replace(/\/+$/, "");
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, changeFrequency, priority }) => ({
    url: path === "/" ? `${siteUrl}/` : `${siteUrl}${path}`,
    changeFrequency,
    priority,
  }));

  if (!process.env.PG_URL) {
    return entries;
  }

  const [posts, tags, sequences] = await Promise.all([
    Posts.find(
      { draft: false, rejected: { $ne: true }, noIndex: { $ne: true } },
      { limit: 5000, sort: { postedAt: -1 } },
      { _id: 1, slug: 1, postedAt: 1 }
    ).fetch(),
    Tags.find(
      { noindex: { $ne: true } },
      { limit: 5000, sort: { createdAt: -1 } },
      { slug: 1, createdAt: 1 }
    ).fetch(),
    Sequences.find(
      { noindex: { $ne: true } },
      { limit: 2000, sort: { createdAt: -1 } },
      { _id: 1, createdAt: 1 }
    ).fetch(),
  ]);

  for (const post of posts) {
    entries.push({
      url: postGetPageUrl(post, true),
      lastModified: post.postedAt ? new Date(post.postedAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const tag of tags) {
    entries.push({
      url: tagGetUrl(tag, undefined, true),
      lastModified: tag.createdAt ? new Date(tag.createdAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const sequence of sequences) {
    entries.push({
      url: sequenceGetPageUrl(sequence, true),
      lastModified: sequence.createdAt ? new Date(sequence.createdAt) : undefined,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
