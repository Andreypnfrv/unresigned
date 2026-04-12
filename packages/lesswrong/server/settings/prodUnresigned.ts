import merge from "lodash/merge";
import { sharedSettings } from "./sharedSettings";

export const prodUnresigned = merge({}, sharedSettings, {
  forumType: "Unresigned",
  title: "Unresigned",
  tagline: "Longevity, immortalism, and the science and politics of ending aging.",
  siteNameWithArticle: "Unresigned",
  siteUrl: "https://example.com",
  faviconUrl: "/favicon.ico",
  forumSettings: {
    headerTitle: "Unresigned",
    shortForumTitle: "Unresigned",
    tabTitle: "Unresigned",
  },
  analytics: {
    environment: "production",
  },
  testServer: false,
  debug: false,
  expectedDatabaseId: "production",
  defaultVisibilityTags: [],
  homepagePosts: {
    feeds: [
      {
        name: "forum-classic",
        label: "Latest",
        description: "Recent posts with karma and time weighting.",
        showToLoggedOut: true,
      },
      {
        name: "forum-bookmarks",
        label: "Bookmarks",
        description: "Posts you saved.",
      },
      {
        name: "forum-continue-reading",
        label: "Resume Reading",
        description: "Continue sequences you started.",
        disabled: true,
      },
    ],
  },
  ultraFeedEnabled: false,
  intercomAppId: "",
  lightconeFundraiser: {
    active: false,
  },
});
