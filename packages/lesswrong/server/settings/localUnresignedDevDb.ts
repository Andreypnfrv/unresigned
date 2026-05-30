import { sharedSettings } from "./sharedSettings";
import merge from "lodash/merge";

const cloudinaryOverrides = merge({}, sharedSettings.cloudinary, {
  ...(process.env.CLOUDINARY_CLOUD_NAME?.trim()
    ? { cloudName: process.env.CLOUDINARY_CLOUD_NAME.trim() }
    : {}),
  ...(process.env.CLOUDINARY_UPLOAD_PRESET_EDITOR?.trim()
    ? { uploadPresetEditor: process.env.CLOUDINARY_UPLOAD_PRESET_EDITOR.trim() }
    : {}),
  ...(process.env.CLOUDINARY_UPLOAD_PRESET_BANNER?.trim()
    ? { uploadPresetBanner: process.env.CLOUDINARY_UPLOAD_PRESET_BANNER.trim() }
    : {}),
  ...(process.env.CLOUDINARY_UPLOAD_PRESET_GRID?.trim()
    ? { uploadPresetGridImage: process.env.CLOUDINARY_UPLOAD_PRESET_GRID.trim() }
    : {}),
  ...(process.env.CLOUDINARY_UPLOAD_PRESET_SOCIAL?.trim()
    ? { uploadPresetSocialPreview: process.env.CLOUDINARY_UPLOAD_PRESET_SOCIAL.trim() }
    : {}),
  ...(process.env.CLOUDINARY_UPLOAD_PRESET_EVENT?.trim()
    ? { uploadPresetEventImage: process.env.CLOUDINARY_UPLOAD_PRESET_EVENT.trim() }
    : {}),
  ...(process.env.CLOUDINARY_UPLOAD_PRESET_SPOTLIGHT?.trim()
    ? { uploadPresetSpotlight: process.env.CLOUDINARY_UPLOAD_PRESET_SPOTLIGHT.trim() }
    : {}),
  ...(process.env.CLOUDINARY_UPLOAD_PRESET_PROFILE?.trim()
    ? { uploadPresetProfile: process.env.CLOUDINARY_UPLOAD_PRESET_PROFILE.trim() }
    : {}),
  ...(process.env.CLOUDINARY_UPLOAD_PRESET_DIGEST?.trim()
    ? { uploadPresetDigest: process.env.CLOUDINARY_UPLOAD_PRESET_DIGEST.trim() }
    : {}),
});

export const localUnresignedDevDb = {
  ...merge({}, sharedSettings, {
    forumType: "Antimortality",
    title: "AntiMortality",
    tagline: "Longevity, immortalism, and the science and politics of ending aging.",
    siteNameWithArticle: "AntiMortality",
    faviconUrl: "/favicon.ico",
    forumSettings: {
      headerTitle: "AntiMortality",
      shortForumTitle: "AntiMortality",
      tabTitle: "AntiMortality",
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
    commentPermalinkStyle: "in-context",
    ultraFeedEnabled: false,
    intercomAppId: "",
    lightconeFundraiser: {
      active: false,
    },
    googleDocImport: {
      enabled: false,
    },
    fmCrosspost: {
      siteName: null,
      baseUrl: null,
    },
    disableElastic:
      process.env.DISABLE_ELASTIC?.trim().toLowerCase() === "false"
      || process.env.ENABLE_ELASTICSEARCH?.trim().toLowerCase() === "true"
        ? "false"
        : "true",
    elasticsearch: {
      searchAvailable: !!(
        process.env.ELASTICSEARCH_NODE?.trim() ||
        process.env.ELASTICSEARCH_CLOUD_ID?.trim()
      ),
    },
    cloudinary: cloudinaryOverrides,
  }),
  defaultVisibilityTags: [] as typeof sharedSettings.defaultVisibilityTags,
};
