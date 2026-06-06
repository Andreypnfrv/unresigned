import React from 'react';
import { useCurrentUserId } from '../withUser';
import TabNavigationItem, { iconWidth } from './TabNavigationItem'

// -- See here for all the tab content --
import getMenuTabs from './menuTabs'
import { AnalyticsContext, useTracking } from "../../../lib/analyticsEvents";
import { forumSelect } from '../../../lib/forumTypeUtils';
import classNames from 'classnames';
import EventsList from './EventsList';
import { SubscribeWidget } from '../SubscribeWidget';
import { defineStyles } from '@/components/hooks/defineStyles';
import { useStyles } from '@/components/hooks/useStyles';
import { Link } from '../../../lib/reactRouterWrapper';
import { isLWStyleForum } from '@/lib/instanceSettings';
import { tagGetUrl } from '@/lib/collections/tags/helpers';
export const TAB_NAVIGATION_MENU_WIDTH = 250
export const TAB_NAVIGATION_MENU_ICON_ONLY_WIDTH = 64

const styles = defineStyles("TabNavigationMenu", (theme: ThemeType) => ({
    root: {
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minHeight: 0,
      maxWidth: TAB_NAVIGATION_MENU_WIDTH,
      paddingTop: 15,
      justifyContent: "flex-start",
      gap: 8,
    },
    iconOnlyRoot: {
      maxWidth: TAB_NAVIGATION_MENU_ICON_ONLY_WIDTH,
      width: TAB_NAVIGATION_MENU_ICON_ONLY_WIDTH,
      paddingLeft: 0,
      paddingRight: 0,
      justifyContent: "flex-start",
      alignItems: "center",
      gap: 8,
    },
    navSidebarTransparent: {
      zIndex: 10,
      background: theme.palette.panelBackground.bannerAdTranslucent,
      backdropFilter: theme.palette.filters.bannerAdBlurMedium
    },
    divider: {
      width: 50,
      borderBottom: theme.palette.border.normal,
      ...(theme.dark && {
        color: theme.palette.text.bannerAdOverlay,
        background: theme.palette.text.bannerAdOverlay,
      }),
      marginBottom: 0,
      marginLeft: 16 + (iconWidth + 16) - 2,
      marginTop: 0,
    },
}));

const SURVIVAL_SIDEBAR_SUBTAGS = [
  { slug: "geroscience", title: "Geroscience" },
  { slug: "biostasis", title: "Biostasis" },
  { slug: "replacing", title: "Replacing" },
  { slug: "cyborgisation", title: "Cyborgisation" },
  { slug: "uploading", title: "Uploading" },
  { slug: "resurrection", title: "Resurrection" },
] as const;

const survivalSubnavSidebarStyles = defineStyles("SurvivalSubnavSidebar", (theme: ThemeType) => ({
  root: {
    ...theme.typography.body2,
    paddingBottom: 12,
    paddingLeft: 16 + iconWidth + 16,
    paddingRight: 16,
    width: TAB_NAVIGATION_MENU_WIDTH - (16 + (iconWidth + 16)) - 16,
    boxSizing: "content-box",
  },
  link: {
    display: "block",
    paddingBottom: 6,
    color: theme.palette.grey[700],
    ...(theme.dark && {
      color: theme.palette.text.bannerAdOverlay,
    }),
    fontSize: "0.95rem",
    textDecoration: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    "&:hover": {
      opacity: 0.65,
    },
  },
}));

const HOME_SIDEBAR_LINKS = [
  { id: "allPosts", title: "All posts", to: "/allPosts" },
  { id: "quicktakes", title: "Quick takes", to: "/quicktakes" },
  { id: "meta", title: "Meta", to: "/tag/meta" },
  { id: "intro", title: "Intro", to: "/w/intros" },
  { id: "people", title: "People", to: "/search?contentType=Users" },
] as const;

const homeSubnavSidebarStyles = defineStyles("HomeSubnavSidebar", (theme: ThemeType) => ({
  root: {
    ...theme.typography.body2,
    paddingBottom: 12,
    paddingLeft: 16 + iconWidth + 16,
    paddingRight: 16,
    width: TAB_NAVIGATION_MENU_WIDTH - (16 + (iconWidth + 16)) - 16,
    boxSizing: "content-box",
  },
  link: {
    display: "block",
    paddingBottom: 6,
    color: theme.palette.grey[700],
    ...(theme.dark && {
      color: theme.palette.text.bannerAdOverlay,
    }),
    fontSize: "0.95rem",
    textDecoration: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    "&:hover": {
      opacity: 0.65,
    },
  },
}));

function HomeSubnavSidebar({ onLinkClick }: { onLinkClick?: (e: React.MouseEvent) => void }) {
  const classes = useStyles(homeSubnavSidebarStyles);
  return (
    <nav className={classes.root} aria-label="Home navigation">
      {HOME_SIDEBAR_LINKS.map(({ id, title, to }) => (
        <Link key={id} to={to} className={classes.link} onClick={onLinkClick}>
          {title}
        </Link>
      ))}
    </nav>
  );
}

function SurvivalSubnavSidebar() {
  const classes = useStyles(survivalSubnavSidebarStyles);
  if (!isLWStyleForum()) {
    return null;
  }

  return (
    <nav className={classes.root} aria-label="Survival strategies">
      {SURVIVAL_SIDEBAR_SUBTAGS.map(({ slug, title }) => (
        <Link key={slug} to={tagGetUrl({ slug })} className={classes.link}>
          {title}
        </Link>
      ))}
    </nav>
  );
}

const TabNavigationMenu = ({
  onClickSection,
  transparentBackground,
  iconOnlyNavigationEnabled,
}: {
  onClickSection?: (e?: React.BaseSyntheticEvent) => void,
  transparentBackground?: boolean,
  iconOnlyNavigationEnabled?: boolean,
}) => {
  const classes = useStyles(styles);
  const currentUserId = useCurrentUserId();
  const { captureEvent } = useTracking()
  const iconOnly = !!iconOnlyNavigationEnabled;
  const handleClick = (e: React.BaseSyntheticEvent, tabId: string) => {
    captureEvent(`${tabId}NavClicked`)
    onClickSection && onClickSection(e)
  }

  const tabs = forumSelect(getMenuTabs());
  const filteredTabs = iconOnly
    ? tabs.filter(tab => {
      if ('customComponentName' in tab) return false
      if ('divider' in tab) return false
      if ('icon' in tab && tab.icon) return true
      if ('iconComponent' in tab && tab.iconComponent) return true
      if ('compressedIconComponent' in tab && tab.compressedIconComponent) return true
      return false
    })
    : tabs

  return (
      <AnalyticsContext pageSectionContext="navigationMenu">
        <div className={classNames(classes.root, {
          [classes.iconOnlyRoot]: iconOnly,
          [classes.navSidebarTransparent]: transparentBackground,
        })}>
          {filteredTabs.map(tab => {
            if ('loggedOutOnly' in tab && tab.loggedOutOnly && currentUserId) return null

            if ('divider' in tab) {
              return <div key={tab.id} className={classes.divider} />
            }
            if ('customComponentName' in tab) {
              switch (tab.customComponentName) {
                case 'EventsList':
                  return <EventsList
                    key={tab.id}
                    onClick={(e: React.BaseSyntheticEvent) => handleClick(e, tab.id)}
                  />;
                case 'SubscribeWidget':
                  return <SubscribeWidget key={tab.id} />;
                case 'SurvivalSubnavSidebar':
                  return (
                    <SurvivalSubnavSidebar
                      key={tab.id}
                    />
                  );
                case 'HomeSubnavSidebar':
                  return <HomeSubnavSidebar key={tab.id} onLinkClick={(e) => handleClick(e, tab.id)} />;
              }
            }

            return <TabNavigationItem
              key={tab.id}
              tab={tab}
              onClick={(e) => handleClick(e, tab.id)}
              iconOnlyNavigationEnabled={iconOnly}
            />
          })}
        </div>
    </AnalyticsContext>  )
};

export default TabNavigationMenu;


