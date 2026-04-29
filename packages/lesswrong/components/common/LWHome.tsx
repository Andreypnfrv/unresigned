'use client';

import React, { useEffect } from 'react';
import { AnalyticsContext } from "../../lib/analyticsEvents";
import { getReviewPhase, reviewIsActive, REVIEW_YEAR } from '../../lib/reviewUtils';
import { showReviewOnFrontPageIfActive, ultraFeedEnabledSetting, isAF, isUnresignedForum, unresignedHeroBannerImgSrc } from '@/lib/instanceSettings';
import { useCookiesWithConsent } from '../hooks/useCookiesWithConsent';
import { LAST_VISITED_FRONTPAGE_COOKIE } from '../../lib/cookies/cookies';
import moment from 'moment';
import { visitorGetsDynamicFrontpage } from '../../lib/betas';
import { combineUrls, getSiteUrl } from "../../lib/vulcan-lib/utils";
import { registerComponent } from "../../lib/vulcan-lib/components";
import AnalyticsInViewTracker from "./AnalyticsInViewTracker";
import FrontpageReviewWidget from "../review/FrontpageReviewWidget";
import SingleColumnSection from "./SingleColumnSection";
import DismissibleSpotlightItem from "@/components/spotlights/DismissibleSpotlightItem";
import QuickTakesSection from "../quickTakes/QuickTakesSection";
import LWHomePosts from "./LWHomePosts";
import UltraFeed from "../ultraFeed/UltraFeed";
import { StructuredData } from './StructuredData';
import { SuspenseWrapper } from './SuspenseWrapper';
import DeferRender from './DeferRender';
import { defineStyles, useStyles } from '../hooks/useStyles';
import dynamic from 'next/dynamic';
import { IsReturningVisitorContextProvider } from '@/components/layout/IsReturningVisitorContextProvider';
const RecentDiscussionFeed = dynamic(() => import("../recentDiscussion/RecentDiscussionFeed"), { ssr: false });

const UNRESIGNED_HERO_FEATURES = [
  { title: "Rational discussion", body: "Evidence over dogma", icon: "Thought" as const },
  { title: "Open collaboration", body: "Build the future together", icon: "Community" as const },
  { title: "Long-term impact", body: "For people and animals", icon: "Impact" as const },
] as const;

const styles = defineStyles("LWHome", (theme: ThemeType) => ({
  hero: {
    position: "relative",
    padding: "24px 28px",
    marginBottom: 8,
    borderRadius: 12,
    border: theme.palette.border.faint,
    overflow: "hidden",
    backgroundColor: theme.palette.panelBackground.default,
    backgroundImage: `url("${unresignedHeroBannerImgSrc(!!theme.dark)}")`,
    backgroundSize: "cover",
    backgroundPosition: "center right",
    backgroundRepeat: "no-repeat",
  },
  heroInner: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    maxWidth: 720,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  heroTitle: {
    width: "100%",
    boxSizing: "border-box",
    fontSize: "clamp(1.95rem, 4.5vw, 2.45rem)",
    fontWeight: 600,
    lineHeight: 1.15,
    fontFamily: theme.palette.fonts.serifStack,
    color: theme.palette.text.primary,
  },
  heroBody: {
    fontSize: "clamp(1.15rem, 2.35vw, 1.35rem)",
    lineHeight: 1.7,
    fontFamily: theme.palette.fonts.serifStack,
    color: theme.palette.text.primary,
  },
  heroFeatures: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px 20px",
    ["@media (max-width: 900px)"]: {
      gridTemplateColumns: "1fr",
    },
  },
  heroFeature: {
    display: "grid",
    gridTemplateColumns: "68px minmax(0, 1fr)",
    gap: "0 16px",
    alignItems: "center",
    minWidth: 0,
  },
  heroFeatureIcon: {
    flexShrink: 0,
    width: 68,
    height: 68,
    padding: 4,
    borderRadius: 10,
    border: theme.palette.border.faint,
    outline: "none",
    ...(theme.palette.type === "light"
      ? {
        backgroundColor: "#f7f6f1",
      }
      : {
        backgroundColor: "#252f36",
      }),
    boxSizing: "border-box",
    boxShadow: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heroFeatureIconImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
    border: "none",
    outline: "none",
    margin: 0,
    padding: 0,
    backgroundColor: "transparent",
    ...(theme.palette.type === "dark" && {
      filter: "brightness(1.15)",
      opacity: 0.92,
    }),
  },
  heroFeatureText: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    justifyContent: "center",
  },
  heroFeatureTitle: {
    fontSize: "0.95rem",
    fontWeight: 600,
    fontFamily: theme.palette.fonts.sansSerifStack,
    color: theme.palette.text.primary,
  },
  heroFeatureDesc: {
    fontSize: "0.875rem",
    lineHeight: 1.45,
    fontFamily: theme.palette.fonts.sansSerifStack,
    color: theme.palette.text.secondary,
  },
  desktopSpotlight: {
    ['@media(max-width: 1199.95px)']: {
      display: "none",
    },
  },
  mobileSpotlight: {
    ['@media(min-width: 1200px)']: {
      display: "none",
    },
  },
}));

const LESSONLINE_MOBILE_SPOTLIGHT_ID = 'j4q2gcjowKqfpdjsR';
const LESSONLINE_MOBILE_SPOTLIGHT_UNTIL = new Date('2026-03-26T00:00:00Z');

const getLessOnlineMobileSpotlightOverrideId = (now: Date = new Date()): string | null => (
  isUnresignedForum()
    ? null
    : (now.getTime() < LESSONLINE_MOBILE_SPOTLIGHT_UNTIL.getTime()
      ? LESSONLINE_MOBILE_SPOTLIGHT_ID
      : null)
);

const getStructuredData = () => ({
  "@context": "http://schema.org",
  "@type": "WebSite",
  "url": `${getSiteUrl()}`,
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${combineUrls(getSiteUrl(), '/search')}?query={search_term_string}`,
    "query-input": "required name=search_term_string"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `${getSiteUrl()}`,
  },
  ...(isAF() && {
    "description": [
      "The Alignment Forum is a single online hub for researchers to discuss all ideas related to ensuring that transformatively powerful AIs are aligned with human values.", 
      "Discussion ranges from technical models of agency to the strategic landscape, and everything in between."
    ].join(' ')
  }),
  ...(isUnresignedForum() && {
    "description": "Unresigned is a forum for longevity science, policy, advocacy, and community — focused on ending aging and building a serious immortalist culture.",
  }),
})

const LWHome = () => {
  const classes = useStyles(styles);
  const mobileSpotlightOverrideId = getLessOnlineMobileSpotlightOverrideId();

  return (
      <AnalyticsContext pageContext="homePage">
        <StructuredData generate={() => getStructuredData()}/>
        <UpdateLastVisitCookie />
        {isUnresignedForum() && <SingleColumnSection>
          <div className={classes.hero}>
            <div className={classes.heroInner}>
              <div className={classes.heroTitle}>Those who unresign to die salute you!</div>
              <div className={classes.heroCopy}>
                <div className={classes.heroBody}>
                  A community for extending life by resisting aging and death
                  <br />
                  through reason, science and action.
                </div>
                <div className={classes.heroFeatures}>
                  {UNRESIGNED_HERO_FEATURES.map(({ title, body, icon }) =>
                    <div key={title} className={classes.heroFeature}>
                      <div className={classes.heroFeatureIcon} aria-hidden>
                        <img
                          className={classes.heroFeatureIconImg}
                          src={`/icons/${icon}.png`}
                          alt=""
                          width={60}
                          height={60}
                        />
                      </div>
                      <div className={classes.heroFeatureText}>
                        <div className={classes.heroFeatureTitle}>{title}</div>
                        <div className={classes.heroFeatureDesc}>{body}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SingleColumnSection>}
        {reviewIsActive() && <>
          {getReviewPhase() !== "RESULTS" && <SingleColumnSection>
            <SuspenseWrapper name="FrontpageReviewWidget">
              <FrontpageReviewWidget reviewYear={REVIEW_YEAR}/>
            </SuspenseWrapper>
          </SingleColumnSection>}
        </>}
        {(!reviewIsActive() || getReviewPhase() === "RESULTS" || !showReviewOnFrontPageIfActive.get()) && <SingleColumnSection>
          <DismissibleSpotlightItem
            loadingStyle="placeholder"
            className={classes.desktopSpotlight}
          />
          <DismissibleSpotlightItem
            loadingStyle="placeholder"
            className={classes.mobileSpotlight}
            spotlightId={mobileSpotlightOverrideId}
          />
        </SingleColumnSection>}
        <SuspenseWrapper name="LWHomePosts" fallback={<div style={{height: 800}}/>}>
          <IsReturningVisitorContextProvider>
            <LWHomePosts>
              <QuickTakesSection />

              <AnalyticsInViewTracker eventProps={{inViewType: "feedSection"}} observerProps={{threshold:[0, 0.5, 1]}}>
                <SuspenseWrapper name="UltraFeed">
                  <UltraFeedOrRecentDiscussion/>
                </SuspenseWrapper>
              </AnalyticsInViewTracker>
            </LWHomePosts>
          </IsReturningVisitorContextProvider>
        </SuspenseWrapper>
      </AnalyticsContext>
  )
}

const UltraFeedOrRecentDiscussion = () => {
  const ultraFeedEnabled = ultraFeedEnabledSetting.get()
  
  return ultraFeedEnabled
    ? <UltraFeed />
    : <DeferRender ssr={false}>
        <RecentDiscussionFeed
          af={false}
          commentsLimit={4}
          maxAgeHours={18}
        />
      </DeferRender>
}

const UpdateLastVisitCookie = () => {
  const [_, setCookie] = useCookiesWithConsent([LAST_VISITED_FRONTPAGE_COOKIE]);

  useEffect(() => {
    if (visitorGetsDynamicFrontpage(null)) {
      setCookie(LAST_VISITED_FRONTPAGE_COOKIE, new Date().toISOString(), { path: "/", expires: moment().add(1, 'year').toDate() });
    }
  }, [setCookie])

  return <></>
}

export default registerComponent('LWHome', LWHome, {
  areEqual: "auto",
});


