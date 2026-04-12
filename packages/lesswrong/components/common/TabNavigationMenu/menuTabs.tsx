import React from 'react';
import { getCommunityPath, getAllTagsPath } from '@/lib/pathConstants';
import { REVIEW_YEAR } from '../../../lib/reviewUtils';
import { ForumOptions } from '../../../lib/forumTypeUtils';

import { compassIcon } from '../../icons/compassIcon';
import { questionsGlobeIcon } from '../../icons/questionsGlobeIcon';
import { conceptsIcon } from '../../icons/conceptsIcon';
import { communityGlobeIcon } from '../../icons/communityGlobeIcon';
import { BookIcon } from '../../icons/bookIcon'
import { allPostsIcon } from '../../icons/allPostsIcon';
import { AboutQuestionIcon } from '../../icons/aboutQuestionIcon';

import Home from '@/lib/vendor/@material-ui/icons/src/Home'
import LocalOffer from '@/lib/vendor/@material-ui/icons/src/LocalOffer';
import Sort from '@/lib/vendor/@material-ui/icons/src/Sort'
import SupervisedUserCircleIcon from '@/lib/vendor/@material-ui/icons/src/SupervisedUserCircle';

// EA Forum menu icons
import HomeIcon from "@heroicons/react/24/outline/HomeIcon";
import HomeSelectedIcon from "@heroicons/react/20/solid/HomeIcon";
import BestOfIcon from "@heroicons/react/24/outline/StarIcon";
import BestOfSelectedIcon from "@heroicons/react/24/solid/StarIcon";
import AllPostsIcon from "@heroicons/react/24/outline/ArchiveBoxIcon";
import AllPostsSelectedIcon from "@heroicons/react/24/solid/ArchiveBoxIcon";
import TopicsIcon from "@heroicons/react/24/outline/TagIcon";
import TopicsSelectedIcon from "@heroicons/react/24/solid/TagIcon";
import TakeActionIcon from "@heroicons/react/24/outline/HeartIcon";
import TakeActionSelectedIcon from "@heroicons/react/24/solid/HeartIcon";
import EventsIcon from "@heroicons/react/24/outline/CalendarIcon";
import EventsSelectedIcon from "@heroicons/react/24/solid/CalendarIcon";
import GroupsIcon from "@heroicons/react/24/outline/UserGroupIcon";
import GroupsSelectedIcon from "@heroicons/react/24/solid/UserGroupIcon";
import {
  PeopleDirectoryIcon,
  PeopleDirectorySelectedIcon,
} from '../../icons/peopleDirectoryIcon';
import Info from '@/lib/vendor/@material-ui/icons/src/Info';

// The sidebar / bottom bar of the Forum contain 10 or so similar tabs, unique to each Forum. The
// tabs can appear in
//   1. The always-on sidebar of the homepage (allPosts, etc, [see Layout.jsx]) (Standalone Sidbar)
//   2. The always-on bottom bar of the homepage (etc) on mobile (Standalone FooterMenu)
//   3. The swipeable drawer of any other page (hidden by default) (Drawer Menu)
//   4. The same as 3, but collapsed to make room for table of contents on mobile (Drawer Collapsed
//      Menu)
//
// Tab objects support the following properties
//   id: string, required, unique; for React map keys. `divider` is a keyword id
//   title: string; user facing description
//   link: string
//   // One of the following 3
//   icon: already-rendered-Component
//   iconComponent: Component-ready-for-rendering
//   compressedIconComponent: Component-ready-for-rendering; only displayed in compressed mode (4)
//   tooltip: string|Component; passed into Tooltip `title`; optionaly -- without it the Tooltip
//            call is a no-op
//   showOnMobileStandalone: boolean; show in (2) Standalone Footer Menu
//   showOnCompressed: boolean; show in (4) Drawer Collapsed Menu
//   subitem: boolean; display title in smaller text
//   loggedOutOnly: boolean; only visible to logged out users
//   customComponentName: string; instead of a TabNavigationItem, display this component
//
// See TabNavigation[Footer|Compressed]?Item.jsx for how these are used by the code

type MenuTabDivider = {
  id: string
  divider: true
  showOnCompressed?: boolean
}

type MenuTabCustomComponent = {
  id: string
  customComponentName: 'EventsList' | 'SubscribeWidget'
}

type MenuItemIcon = React.ComponentType | React.FC<{className?: string}>;

export type MenuTabRegular = {
  id: string
  title: string
  mobileTitle?: string
  link: string
  icon?: React.ReactNode
  iconComponent?: MenuItemIcon
  selectedIconComponent?: MenuItemIcon
  compressedIconComponent?: MenuItemIcon
  tooltip?: React.ReactNode
  showOnMobileStandalone?: boolean
  showOnCompressed?: boolean
  subItem?: boolean,
  loggedOutOnly?: boolean,
  flag?: string,
  desktopOnly?: boolean,
  betaOnly?: boolean,
}

type MenuTab = MenuTabDivider | MenuTabCustomComponent | MenuTabRegular

export const getMenuTabs = (): ForumOptions<Array<MenuTab>> => ({
  AlignmentForum: [
    {
      id: 'home',
      title: 'Home',
      link: '/',
      icon: compassIcon,
      tooltip: 'Latest posts, comments and curated content.',
      showOnMobileStandalone: true,
      showOnCompressed: true,
    }, {
      id: 'library',
      title: 'Library',
      link: '/library',
      iconComponent: BookIcon,
      tooltip: "Curated collections of the AI Alignment Forum's best writing.",
      showOnMobileStandalone: true,
      showOnCompressed: true,
    }, {
      id: 'questions',
      title: 'Questions',
      link: '/questions',
      icon: questionsGlobeIcon,
      tooltip: <div>
        <div>• Ask simple newbie questions.</div>
        <div>• Collaborate on open research questions.</div>
        <div>• Pose and resolve confusions.</div>
      </div>,
      showOnMobileStandalone: true,
      showOnCompressed: true,
    }, {
      id: 'allPosts',
      title: 'All Posts',
      link: '/allPosts',
      icon: allPostsIcon,
      tooltip: 'See all posts, filtered and sorted however you like.',
      showOnMobileStandalone: true,
      showOnCompressed: true,
    }, {
      id: 'divider',
      divider: true,
    }, {
      id: 'about',
      title: 'About',
      mobileTitle: 'About',
      link: '/about',
      subItem: true,
      compressedIconComponent: AboutQuestionIcon,
      showOnCompressed: true,
    }
  ],
  Unresigned: [
    {
      id: 'home',
      title: 'Home',
      link: '/',
      icon: compassIcon,
      tooltip: 'Latest posts and community activity.',
      showOnMobileStandalone: true,
      showOnCompressed: true,
    },
    {
      id: 'science',
      title: 'Science',
      link: '/tag/science',
      icon: conceptsIcon,
      tooltip: 'Research, trials, mechanisms, biomarkers.',
      showOnMobileStandalone: true,
      showOnCompressed: true,
    },
    {
      id: 'policy',
      title: 'Policy',
      link: '/tag/policy',
      icon: conceptsIcon,
      tooltip: 'Regulation, funding, healthcare systems.',
      showOnMobileStandalone: true,
      showOnCompressed: true,
    },
    {
      id: 'advocacy',
      title: 'Advocacy',
      link: '/tag/advocacy',
      icon: conceptsIcon,
      tooltip: 'Campaigns, outreach, movement-building.',
      showOnMobileStandalone: true,
      showOnCompressed: true,
    },
    {
      id: 'biohacking',
      title: 'Biohacking',
      link: '/tag/biohacking',
      icon: conceptsIcon,
      tooltip: 'Protocols, supplements, self-experiments.',
      showOnMobileStandalone: true,
      showOnCompressed: true,
    },
    {
      id: 'meta',
      title: 'Meta',
      link: '/tag/meta',
      icon: conceptsIcon,
      tooltip: 'About the forum, norms, roadmap.',
      showOnMobileStandalone: true,
      showOnCompressed: true,
    },
    {
      id: 'allPosts',
      title: 'All Posts',
      link: '/allPosts',
      icon: allPostsIcon,
      tooltip: 'All posts, filtered and sorted.',
      showOnMobileStandalone: true,
      showOnCompressed: true,
    },
    {
      id: 'shortform',
      title: 'Quick Takes',
      link: '/quicktakes',
      iconComponent: Sort,
      tooltip: 'Short updates and links.',
      showOnMobileStandalone: true,
      showOnCompressed: true,
    },
    {
      id: 'wiki',
      title: 'Wiki',
      link: getAllTagsPath(),
      icon: conceptsIcon,
      tooltip: 'Tags and wiki articles.',
      showOnMobileStandalone: false,
      showOnCompressed: true,
    },
    {
      id: 'library',
      title: 'Library',
      link: '/library',
      iconComponent: BookIcon,
      tooltip: 'Sequences and collections.',
      showOnMobileStandalone: false,
      showOnCompressed: true,
    },
    {
      id: 'divider',
      divider: true,
      showOnCompressed: true,
    },
    {
      id: 'subscribeWidget',
      customComponentName: "SubscribeWidget",
    },
    {
      id: 'about',
      title: 'About',
      link: '/about',
      subItem: true,
      compressedIconComponent: AboutQuestionIcon,
      showOnCompressed: true,
    },
  ],
  default: [
    {
      id: 'home',
      title: 'Home',
      link: '/',
      iconComponent: Home,
      tooltip: 'See recent posts on strategies for doing the most good, plus recent activity from all across the Forum.',
      showOnMobileStandalone: true,
      showOnCompressed: true,
    }, {
      id: 'allPosts',
      title: 'All Posts',
      link: '/allPosts',
      iconComponent: Sort,
      tooltip: 'See all posts, filtered and sorted by date, karma, and more.',
      showOnMobileStandalone: false,
      showOnCompressed: true,
    }, {
      id: 'wiki',
      title: 'Wiki',
      mobileTitle: 'Wiki',
      link: getAllTagsPath(),
      iconComponent: LocalOffer,
      tooltip: 'Collaboratively edited Tags and Wiki Articles',
      showOnMobileStandalone: true,
      showOnCompressed: true,
    }, {
      id: 'events',
      title: 'Community and Events',
      mobileTitle: 'Events',
      link: getCommunityPath(),
      iconComponent: SupervisedUserCircleIcon,
      tooltip: 'See groups and events in your area',
      showOnMobileStandalone: true,
      showOnCompressed: true
    }, {
      id: 'eventsList',
      customComponentName: "EventsList",
    }, {
      id: 'divider',
      divider: true,
      showOnCompressed: true,
    }, {
      id: 'shortform',
      title: 'Quick takes',
      link: '/quicktakes',
      subItem: true,
    }, {
      id: 'subscribeWidget',
      customComponentName: "SubscribeWidget",
    }, {
      id: 'about',
      title: 'About the Forum',
      mobileTitle: 'About',
      link: '/about',
      subItem: true,
      compressedIconComponent: AboutQuestionIcon,
      showOnCompressed: true,
    }, {
      id: 'contact',
      title: 'Contact Us',
      link: '/contact',
      subItem: true,
    }
  ]
});

export default getMenuTabs;
