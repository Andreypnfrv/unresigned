'use client';

import React, { useEffect } from 'react';
import { AnalyticsContext } from "../../lib/analyticsEvents";
import { getReviewPhase, reviewIsActive, REVIEW_YEAR } from '../../lib/reviewUtils';
import { cloudinaryCloudNameSetting, showReviewOnFrontPageIfActive, ultraFeedEnabledSetting, isAF, isUnresignedForum } from '@/lib/instanceSettings';
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

const styles = defineStyles("LWHome", (theme: ThemeType) => ({
  hero: {
    padding: "20px 24px",
    marginBottom: 8,
    borderRadius: 4,
    background: theme.palette.background.primaryTranslucent,
    border: theme.palette.border.faint,
  },
  heroTitle: {
    fontSize: "1.35rem",
    fontWeight: 600,
    marginBottom: 8,
    fontFamily: theme.palette.fonts.sansSerifStack,
  },
  heroBody: {
    fontSize: "1.05rem",
    lineHeight: 1.5,
    opacity: 0.92,
  },
  heroMain: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    ["@media (max-width: 700px)"]: {
      flexDirection: "column-reverse",
      alignItems: "stretch",
    },
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  heroArt: {
    flexShrink: 0,
    width: "clamp(100px, 28vw, 220px)",
    height: "auto",
    maxHeight: 260,
    objectFit: "contain",
    objectPosition: "right center",
    alignSelf: "center",
    opacity: 0.97,
    ["@media (max-width: 700px)"]: {
      width: "min(200px, 70vw)",
      maxHeight: 180,
      marginLeft: "auto",
      marginRight: "auto",
    },
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

/** Bump cache when hero Cloudinary asset is replaced (`unresigned/PNGv3`). */
const UNRESIGNED_HERO_CLOUD_CACHE = "v4";

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
  const heroArtSrc =
    `https://res.cloudinary.com/${cloudinaryCloudNameSetting.get()}/image/upload/v1768493724/unresigned/PNGv3?_cb=${UNRESIGNED_HERO_CLOUD_CACHE}`;

  return (
      <AnalyticsContext pageContext="homePage">
        <StructuredData generate={() => getStructuredData()}/>
        <UpdateLastVisitCookie />
        {isUnresignedForum() && <SingleColumnSection>
          <div className={classes.hero}>
            <div className={classes.heroMain}>
              <div className={classes.heroText}>
                <div className={classes.heroTitle}>Unresigned</div>
                <div className={classes.heroBody}>
                  Longevity science, policy, advocacy, and community — replace placeholder text in admin when ready.
                </div>
              </div>
              <img className={classes.heroArt} src={heroArtSrc} alt="" decoding="async"/>
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


