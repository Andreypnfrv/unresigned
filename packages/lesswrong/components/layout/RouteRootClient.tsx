"use client";
import React, { use } from 'react';
import { defineStyles, useStyles } from '@/components/hooks/useStyles';
import classNames from 'classnames';
import { DelayedLoading } from '../common/DelayedLoading';
import ErrorBoundary from '../common/ErrorBoundary';
import { SuspenseWrapper } from '../common/SuspenseWrapper';
import { PopperPortalProvider } from '../common/LWPopper';
import { isFullscreenRoute, isHomeRoute, isRouteWithLeftNavigationColumn, isSunshineSidebarRoute } from '@/lib/routeChecks';
import DeferRender from '../common/DeferRender';
import NavigationStandalone from '../common/TabNavigationMenu/NavigationStandalone';
import { isLW, isLWorAF } from '@/lib/forumTypeUtils';
import { isUnresignedForum } from '@/lib/instanceSettings';
import { usePrerenderablePathname } from '../next/usePrerenderablePathname';
import { useCurrentUser } from '../common/withUser';
import { userCanDo } from '@/lib/vulcan-users/permissions';
import dynamic from 'next/dynamic';
import { HideNavigationSidebarContext } from './HideNavigationSidebarContextProvider';

const SunshineSidebar = dynamic(() => import("../sunshineDashboard/SunshineSidebar"), { ssr: false });

const styles = defineStyles("RouteRootClient", (theme: ThemeType) => ({
  main: {
    overflowX: 'clip',
    maxWidth: "100%",
  },
  mainWithStandaloneNav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  mainFullscreen: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  centralColumn: {
    paddingTop: theme.spacing.mainLayoutPaddingTop,
    marginLeft: "auto",
    marginRight: "auto",
    gridArea: 'main',
    [theme.breakpoints.down('md')]: {
      paddingTop: theme.spacing.mainLayoutPaddingTop,
    },
    [theme.breakpoints.down('sm')]: {
      paddingTop: 10,
      paddingLeft: 8,
      paddingRight: 8,
    },
  },
  centralColumnUnresignedHome: {
    paddingTop: 15,
    marginLeft: "auto",
    marginRight: "auto",
    gridArea: 'main',
    [theme.breakpoints.down('sm')]: {
      paddingTop: 10,
      paddingLeft: 8,
      paddingRight: 8,
    },
  },
  fullscreen: {
    height: "100%",
    padding: 0,
  },
  rightSidebar: {
    gridArea: 'rightSidebar'
  },
}))

export const RouteRootClient = ({fullscreen, children}: {
  fullscreen: boolean
  children: React.ReactNode
}) => {
  const classes = useStyles(styles);
  const pathname = usePrerenderablePathname();
  const standaloneNavigation = isRouteWithLeftNavigationColumn(pathname);
  const shouldUseGridLayout = standaloneNavigation;

  // an optional mode for displaying the side navigation, for when we want the right banner
  // to be displayed on medium screens
  const renderIconOnlyNavigation = isLW()
  const iconOnlyNavigationEnabled = renderIconOnlyNavigation && standaloneNavigation

  const currentUser = useCurrentUser();
  const renderSunshineSidebar = isSunshineSidebarRoute(pathname) && !!(userCanDo(currentUser, 'posts.moderate.all') || currentUser?.groups?.includes('alignmentForumAdmins')) && !currentUser?.hideSunshineSidebar;
  
  const hideNavigationSidebar = !!use(HideNavigationSidebarContext)?.hideNavigationSidebar;

  const isFullscreen = isFullscreenRoute(pathname);
  const unresignedHomeTightTop = isUnresignedForum() && isHomeRoute(pathname);
  const unresignedListPagesShiftMainLeft =
    isUnresignedForum() && (pathname === "/allPosts" || pathname === "/quicktakes");

  return <PopperPortalProvider>
    <div className={classNames(classes.main, {
      [classes.mainFullscreen]: isFullscreen,
      [classes.mainWithStandaloneNav]: standaloneNavigation && !isFullscreen,
    })}>
    <LeftAndRightSidebarsWrapper
      sidebarsEnabled={shouldUseGridLayout}
      fullscreen={isFullscreen}
      shiftMainColumnLeft={unresignedListPagesShiftMainLeft}
      leftSidebar={
        standaloneNavigation && <SuspenseWrapper fallback={<span/>} name="NavigationStandalone" >
          <DeferRender ssr={true} clientTiming='mobile-aware'>
            <SuspenseWrapper name="NavigationStandalone">
              <NavigationStandalone
                sidebarHidden={hideNavigationSidebar}
                iconOnlyNavigationEnabled={iconOnlyNavigationEnabled}
              />
            </SuspenseWrapper>
          </DeferRender>
        </SuspenseWrapper>
      }
      rightSidebar={
        renderSunshineSidebar && <div className={classes.rightSidebar}>
          <DeferRender ssr={false}>
            <SuspenseWrapper name="SunshineSidebar">
              <SunshineSidebar/>
            </SuspenseWrapper>
          </DeferRender>
        </div>
      }
    >
      <div className={classNames(unresignedHomeTightTop ? classes.centralColumnUnresignedHome : classes.centralColumn, {
        [classes.fullscreen]: fullscreen,
      })}>
        <ErrorBoundary>
          <SuspenseWrapper name="Route" fallback={<DelayedLoading/>}>
            {children}
          </SuspenseWrapper>
        </ErrorBoundary>
      </div>
    </LeftAndRightSidebarsWrapper>
  </div>
  </PopperPortalProvider>
}

const sidebarsWrapperStyles = defineStyles("LeftAndRightSidebarsWrapper", theme => ({
  leftSidebarGridCell: {
    gridArea: 'navSidebar',
    position: 'relative',
    zIndex: theme.zIndexes.tabNavigation,
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up(isLW() ? 'sm' : 'md')]: {
      minHeight: `calc(100vh - var(--header-height))`,
    },
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  spacedGridActivated: {
    '@supports (grid-template-areas: "title")': {
      display: 'grid',
      alignItems: 'start',
      gridTemplateAreas: `
        "navSidebar ... main imageGap rightSidebar"
      `,
      gridTemplateColumns: `
        minmax(0, min-content)
        minmax(0, 1fr)
        minmax(0, min-content)
        minmax(0, ${isUnresignedForum() ? 1 : isLWorAF() ? 7 : 1}fr)
        minmax(0, min-content)
      `,
    },
  },
  spacedGridShiftMainLeft: {
    '@supports (grid-template-areas: "title")': {
      gridTemplateColumns: `
        minmax(0, min-content)
        minmax(0, 0.72fr)
        minmax(0, min-content)
        minmax(0, 1.28fr)
        minmax(0, min-content)
      `,
    },
  },
  gridBreakpointMd: {
    [theme.breakpoints.down('md')]: {
      display: 'block'
    }
  },
  gridBreakpointSm: {
    [theme.breakpoints.down('sm')]: {
      display: 'block'
    }
  },
  fullscreenBodyWrapper: {
    flexBasis: 0,
    flexGrow: 1,
    overflow: "auto",
    [theme.breakpoints.down('xs')]: {
      overflow: "visible",
    },
  },
  gridBodyGrow: {
    flex: 1,
    minHeight: 0,
  },
}));

function LeftAndRightSidebarsWrapper({sidebarsEnabled, fullscreen, shiftMainColumnLeft, leftSidebar, rightSidebar, children}: {
  sidebarsEnabled: boolean
  fullscreen: boolean
  shiftMainColumnLeft?: boolean
  leftSidebar: React.ReactNode
  rightSidebar: React.ReactNode
  children: React.ReactNode
}) {
  const classes = useStyles(sidebarsWrapperStyles);
  // ea-forum-look-here There used to be a column-sizing special case for the EA Forum front page here, which is no present.
  const navigationHasIconOnlyVersion = isLW();

  return <div className={classNames({
    [classes.spacedGridActivated]: sidebarsEnabled,
    [classes.spacedGridShiftMainLeft]: sidebarsEnabled && shiftMainColumnLeft,
    [classes.gridBreakpointMd]: !navigationHasIconOnlyVersion && sidebarsEnabled,
    [classes.gridBreakpointSm]: navigationHasIconOnlyVersion && sidebarsEnabled,
    [classes.fullscreenBodyWrapper]: fullscreen,
    [classes.gridBodyGrow]: sidebarsEnabled && !fullscreen,
  }
  )}>
    {leftSidebar ? <div className={classes.leftSidebarGridCell}>{leftSidebar}</div> : null}
    {children}
    {rightSidebar}
  </div>
}
