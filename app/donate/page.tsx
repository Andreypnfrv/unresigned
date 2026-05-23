import React from "react";
import PostsSingleRoute from '@/components/posts/PostsSingleRoute';
import RouteRoot from "@/components/layout/RouteRoot";
import { getPostPageMetadataFunction } from "@/server/pageMetadata/postPageMetadata";
import { assertRouteAttributes } from "@/lib/routeChecks/assertRouteAttributes";

const DONATE_POST_ID = "LcpQQvcpWfPXvW7R9";

assertRouteAttributes("/donate", {
  whiteBackground: true,
  hasLinkPreview: false,
  hasPingbacks: true,
  hasLeftNavigationColumn: false,
  hasMarkdownVersion: false,
});

export const generateMetadata = getPostPageMetadataFunction<Record<string, never>>(() => DONATE_POST_ID);

export default function Page() {
  return <RouteRoot delayedStatusCode>
    <PostsSingleRoute _id={DONATE_POST_ID} />
  </RouteRoot>;
}
