import { sharedSettings } from "./sharedSettings";
import merge from "lodash/merge";

export const localUnresignedDevDb = {
  ...merge({}, sharedSettings, {
    forumType: "Unresigned",
    title: "Unresigned",
    tagline: "Longevity, immortalism, and the science and politics of ending aging.",
    siteNameWithArticle: "Unresigned",
    faviconUrl: "/favicon.ico",
    forumSettings: {
      headerTitle: "Unresigned",
      shortForumTitle: "Unresigned",
      tabTitle: "Unresigned",
    },
    analytics: {
      environment: "localhost",
    },
    sentry: {
      url: null,
      environment: "development",
      release: null,
    },
    aboutPostId: "bJ2haLkcGeLtTWaD5",
    faqPostId: "2rWKkWuPrgTMpLRbp",
    contactPostId: "ehcYkvyz7dh9L7Wt8",
    testServer: true,
    expectedDatabaseId: "development",
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
    googleDocImport: {
      enabled: false,
    },
    elasticsearch: {
      searchAvailable: !!(
        process.env.ELASTICSEARCH_NODE?.trim() ||
        process.env.ELASTICSEARCH_CLOUD_ID?.trim()
      ),
    },
  }),
  defaultVisibilityTags: [] as typeof sharedSettings.defaultVisibilityTags,
};
