import React from "react";
import PostsSingleRoute from '@/components/posts/PostsSingleRoute';
import RouteRoot from "@/components/layout/RouteRoot";
import { faqPostIdSetting } from "@/lib/instanceSettings";
import { getPostPageMetadataFunction } from "@/server/pageMetadata/postPageMetadata";
import { assertRouteAttributes } from "@/lib/routeChecks/assertRouteAttributes";

assertRouteAttributes("/faq", {
  whiteBackground: true,
  hasLinkPreview: false,
  hasPingbacks: true,
  hasLeftNavigationColumn: false,
  hasMarkdownVersion: true,
});

export const generateMetadata = getPostPageMetadataFunction<Record<string, never>>(() => faqPostIdSetting.get());

export default function Page() {
  return <RouteRoot delayedStatusCode>
    <PostsSingleRoute _id={faqPostIdSetting.get()} />
  </RouteRoot>;
}
