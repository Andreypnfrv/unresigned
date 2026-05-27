import React, { useState, useCallback, useEffect } from 'react';
import moment from 'moment-timezone';
import { timeframeToTimeBlock, TimeframeType } from './timeframeUtils'
import { QueryLink } from '../../lib/reactRouterWrapper';
import ContentType, { ContentTypeString } from './PostsPage/ContentType';
import filter from 'lodash/filter';
import { useLocation } from '../../lib/routeUtil';
import { isFriendlyUI } from '../../themes/forumTheme';
import PostsItem from "./PostsItem";
import LoadMore from "../common/LoadMore";
import ShortformTimeBlock from "../shortform/ShortformTimeBlock";
import TagEditsTimeBlock from "../tagging/TagEditsTimeBlock";
import Divider from "../common/Divider";
import { Typography } from "../common/Typography";
import PostsTagsList from "../tagging/PostsTagsList";
import PostsLoading from "./PostsLoading";
import { useQueryWithLoadMore } from "@/components/hooks/useQueryWithLoadMore";
import { gql } from "@/lib/generated/gql-codegen";
import { defineStyles } from '@/components/hooks/defineStyles';
import { useStyles } from '@/components/hooks/useStyles';

const PostsListWithVotesMultiQuery = gql(`
  query multiPostPostsTimeBlockQuery($selector: PostSelector, $limit: Int, $enableTotal: Boolean) {
    posts(selector: $selector, limit: $limit, enableTotal: $enableTotal) {
      results {
        ...PostsListWithVotes
      }
      totalCount
    }
  }
`);

const styles = defineStyles('PostsTimeBlock', (theme: ThemeType) => ({
  root: {
    marginBottom: 32
  },
  timeBlockTitle: {
    whiteSpace: "pre",
    textOverflow: "ellipsis",
    ...theme.typography.postStyle,
    position: "sticky",
    zIndex: 1,
    paddingTop: 4,
    paddingBottom: 4,
  },
  smallScreenTitle: {
    [theme.breakpoints.down('xs')]: {
      display: "none",
    },
  },
  largeScreenTitle: {
    [theme.breakpoints.up('sm')]: {
      display: "none",
    },
  },
  loadMore: {
    marginTop: 6,
  },
  noPosts: {
    marginLeft: 23,
    color: theme.palette.text.dim
  },
  posts: {
    boxShadow: theme.palette.boxShadow.default,
    marginBottom: 0,
  },
  subtitle: {},
  frontpageSubtitle: {
    marginBottom: 6
  },
  otherSubtitle: {
    marginTop: 6,
    marginBottom: 6
  },
  divider: {
  }
}));

interface PostTypeOptions {
  name: ContentTypeString
  postIsType: (post: PostsBase) => boolean
  label: string
}

const postTypes: PostTypeOptions[] = [
  {name: 'frontpage', postIsType: (post: PostsBase) => !!post.frontpageDate, label: 'Frontpage Posts'},
  {name: 'personal', postIsType: (post: PostsBase) => !post.frontpageDate, label: 'Personal Blogposts'}
]

export type PostsTimeBlockShortformOption = "all" | "none" | "frontpage";

type SectionStatus = 'unknown' | 'empty' | 'hasContent';

const PostsTimeBlock = ({terms, timeBlockLoadComplete, dateForTitle, getTitle, before, after, hideIfEmpty, timeframe, shortform = "all", includeTags=true}: {
  terms: PostsViewTerms,
  timeBlockLoadComplete: () => void,
  dateForTitle: moment.Moment,
  getTitle: (size: 'xsDown'|'smUp'|null) => string,
  before: moment.Moment,
  after: moment.Moment,
  hideIfEmpty: boolean,
  timeframe: TimeframeType,
  shortform?: PostsTimeBlockShortformOption,
  includeTags?: boolean,
}) => {
  const classes = useStyles(styles);
  const [shortformStatus, setShortformStatus] = useState<SectionStatus>(
    shortform === "none" ? 'empty' : 'unknown',
  );
  const [tagsStatus, setTagsStatus] = useState<SectionStatus>(
    timeframe === "daily" && includeTags ? 'unknown' : 'empty',
  );

  const [tagFilter, setTagFilter] = useState<string|null>(null)
  const {query} = useLocation()
  const displayPostsTagsList = query.limit
  const timeBlock = timeframeToTimeBlock[timeframe];

  const { view, limit, ...rest } = terms;

  const { data, loading, loadMoreProps } = useQueryWithLoadMore(PostsListWithVotesMultiQuery, {
    variables: {
      selector: { [view]: { ...rest, before: before.toISOString(), after: after.toISOString() } },
      limit: limit ?? 10,
      enableTotal: true,
    },
    itemsPerPage: 50,
  });

  const posts = data?.posts?.results;
  const totalCount = data?.posts?.totalCount;

  const filteredPosts = tagFilter ? filter(posts, post => post.tags.map(tag=>tag._id).includes(tagFilter)) : posts

  const handleTagFilter = (tagId: string) => {
    if (tagFilter === tagId) { 
      setTagFilter(null)
    } else {
      setTagFilter(tagId)
    }
  }

  useEffect(() => {
    if (!loading && timeBlockLoadComplete) {
      timeBlockLoadComplete();
    }
  // No dependency list because we want this to be called even when it looks
  // like nothing has changed, to signal loading is complete
  });

  const onShortformLoadComplete = useCallback((isEmpty: boolean) => {
    setShortformStatus(isEmpty ? 'empty' : 'hasContent');
  }, []);
  const onTagsLoadComplete = useCallback((isEmpty: boolean) => {
    setTagsStatus(isEmpty ? 'empty' : 'hasContent');
  }, []);

  const noPosts = !loading && (!filteredPosts || (filteredPosts.length === 0));
  const hasOtherContent = shortformStatus === 'hasContent' || tagsStatus === 'hasContent';
  const shortformResolved = shortform === "none" || shortformStatus !== 'unknown';
  const tagsResolved = !(timeframe === "daily" && includeTags) || tagsStatus !== 'unknown';
  const waitingForOtherSections =
    hideIfEmpty &&
    noPosts &&
    !hasOtherContent &&
    (!shortformResolved || !tagsResolved);

  if (hideIfEmpty && loading) {
    return null;
  }

  if (hideIfEmpty && noPosts && !hasOtherContent && shortformResolved && tagsResolved) {
    return null;
  }

  const postGroups = postTypes.map(type => ({
    ...type,
    filteredPosts: filteredPosts?.filter(type.postIsType) || []
  }));

  const shortformBlock = shortform !== "none" && (
    <ShortformTimeBlock
      onLoadComplete={onShortformLoadComplete}
      before={before.toString()}
      after={after.toString()}
      terms={{
        view: "topShortform",
        shortformFrontpage: shortform === "frontpage" ? true : undefined,
      }}
    />
  );
  const tagsBlock = timeframe === "daily" && includeTags && (
    <TagEditsTimeBlock
      before={before.toDate()}
      after={after.toDate()}
      onLoadComplete={onTagsLoadComplete}
    />
  );

  if (waitingForOtherSections) {
    return <>
      {shortformBlock}
      {tagsBlock}
    </>;
  }
  
  return (
    <div className={classes.root}>
      <QueryLink merge rel="nofollow" query={{
        after: after.format("YYYY-MM-DD"), 
        before: moment(before).add(1, 'd').format("YYYY-MM-DD"),
        limit: 100
      }}>
        <Typography variant="headline" className={classes.timeBlockTitle}>
          {['yearly', 'monthly'].includes(timeframe) && <div>
            {getTitle(null)}
          </div>}
          {['weekly', 'daily'].includes(timeframe) && <div>
            <div className={classes.smallScreenTitle}>
              {getTitle('xsDown')}
            </div>
            <div className={classes.largeScreenTitle}>
              {getTitle('smUp')}
            </div>
          </div>}
        </Typography>
      </QueryLink>

      <div>
        { noPosts && !hideIfEmpty && <div className={classes.noPosts}>
          No posts for {
          timeframe === 'daily'
            ? dateForTitle.format('MMMM Do YYYY')
              // Should be pretty rare. Basically people running off the end of
              // the Forum history on yearly
            : `this ${timeBlock}`
          }
        </div> }
        {displayPostsTagsList && <PostsTagsList posts={posts ?? null} currentFilter={tagFilter} handleFilter={handleTagFilter} expandedMinCount={0}/>}
        {postGroups.map(({name, filteredPosts, label}) => {
          if (filteredPosts?.length > 0 || (loading && isFriendlyUI())) {
            return <div key={name}>
              <div
                className={name === 'frontpage' ? classes.frontpageSubtitle : classes.otherSubtitle}
              >
                <ContentType type={name} label={label} className={classes.subtitle} />
              </div>
              <div className={classes.posts}>
                {!filteredPosts?.length && isFriendlyUI() && <PostsLoading placeholderCount={10} />}
                {filteredPosts.map((post, i) =>
                  <PostsItem
                    key={post._id}
                    post={post}
                    index={i} dense
                    showBottomBorder={i < filteredPosts!.length -1}
                    useCuratedDate={false}
                  />
                )}
              </div>
            </div>
          }
        })}

        {(filteredPosts && filteredPosts.length < totalCount!) && <div className={classes.loadMore}>
          <LoadMore
            {...loadMoreProps}
          />
        </div>}

        {shortformBlock}

        {tagsBlock}
      </div>
      {!loading && <div className={classes.divider}>
        <Divider wings={false} />
      </div>}
    </div>
  );
};

export default PostsTimeBlock;
