export const testCrosspostSettings = {
  forumType: "EAForum",
  hasEvents: true,
  title: "Unresigned Test",
  tagline: "Unresigned",
  faviconUrl: "https://www.effectivealtruism.org/favicon-16x16.png",
  forumSettings: {
    tabTitle: "Unresigned Test",
    headerTitle: "Unresigned Test",
    shortForumTitle: "Unresigned"
  },
  siteNameWithArticle: "Unresigned",
  siteUrl: "http://localhost:3467",
  
  debug: false,
  
  testServer: true,
  analytics: {
    environment: "dev"
  },
  disallowCrawlers: true,
  disableEnsureIndex: true,
  disableElastic: true,
  fmCrosspost: {
    siteName: "EAForum Test",
    baseUrl: "http://localhost:3456/"
  }
};
