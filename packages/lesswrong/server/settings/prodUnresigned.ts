import merge from "lodash/merge";
import { sharedSettings } from "./sharedSettings";

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
  ...(process.env.CLOUDINARY_UPLOAD_PRESET_SPOTLIGHT?.trim()
    ? { uploadPresetSpotlight: process.env.CLOUDINARY_UPLOAD_PRESET_SPOTLIGHT.trim() }
    : {}),
});

function productionSiteUrl(): string {
  const raw =
    process.env.SITE_URL?.trim() ||
    process.env.RAILWAY_STATIC_URL?.trim() ||
    process.env.RAILWAY_PUBLIC_DOMAIN?.trim() ||
    "";
  if (!raw) return "https://example.com";
  const noTrail = raw.replace(/\/+$/, "");
  const withScheme = /^https?:\/\//i.test(noTrail)
    ? noTrail
    : `https://${noTrail.replace(/^\/+/, "")}`;
  return withScheme;
}

export const prodUnresigned = {
  ...merge({}, sharedSettings, {
    cloudinary: cloudinaryOverrides,
    forumType: "Unresigned",
    title: "Unresigned",
    tagline: "Longevity, immortalism, and the science and politics of ending aging.",
    siteNameWithArticle: "Unresigned",
    siteUrl: productionSiteUrl(),
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
    fmCrosspost: {
      siteName: null,
      baseUrl: null,
    },
  }),
  defaultVisibilityTags: [] as typeof sharedSettings.defaultVisibilityTags,
};
