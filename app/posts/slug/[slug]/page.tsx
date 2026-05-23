import React from "react";
import PostsSingleSlugRedirect from '@/components/posts/PostsSingleSlugRedirect';
import RouteRoot from "@/components/layout/RouteRoot";
import { getPostPageMetadataBySlugFunction } from "@/server/pageMetadata/postPageMetadata";
import { assertRouteAttributes } from "@/lib/routeChecks/assertRouteAttributes";

export const generateMetadata = getPostPageMetadataBySlugFunction<{ slug: string }>(({ slug }) => slug);

assertRouteAttributes("/posts/slug/[slug]", {
  whiteBackground: true,
  hasLinkPreview: true,
  hasPingbacks: true,
  hasLeftNavigationColumn: false,
  hasMarkdownVersion: true,
});

export default async function Page({ params }: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  return <RouteRoot
    delayedStatusCode
  >
    <PostsSingleSlugRedirect slug={slug} />
  </RouteRoot>;
}
