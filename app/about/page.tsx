import React from "react";
import PostsSingleRoute from '@/components/posts/PostsSingleRoute';
import RouteRoot from "@/components/layout/RouteRoot";
import { aboutPostIdSetting } from "@/lib/instanceSettings";
import { getPostPageMetadataFunction } from "@/server/pageMetadata/postPageMetadata";
import { assertRouteAttributes } from "@/lib/routeChecks/assertRouteAttributes";

assertRouteAttributes("/about", {
  whiteBackground: true,
  hasLinkPreview: false,
  hasPingbacks: true,
  hasLeftNavigationColumn: false,
  hasMarkdownVersion: true,
});

export const generateMetadata = getPostPageMetadataFunction<Record<string, never>>(() => aboutPostIdSetting.get());

export default function Page() {
  return <RouteRoot delayedStatusCode>
    <PostsSingleRoute _id={aboutPostIdSetting.get()} />
  </RouteRoot>;
}
