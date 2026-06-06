"use client";

import { defineStyles, useStyles } from "@/components/hooks/useStyles";
import React from "react";
import ForumIcon from "@/components/common/ForumIcon";
import type { PostPublicationCommentCredits } from "@/lib/generated/gql-codegen/graphql";

const styles = defineStyles("PostPublicationCreditsBanner", (theme: ThemeType) => ({
  root: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "12px 16px",
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: theme.palette.greyAlpha(0.06),
    border: theme.palette.greyBorder("1px", 0.12),
    maxWidth: 720,
  },
  icon: {
    flexShrink: 0,
    marginTop: 2,
    color: theme.palette.primary.main,
    fontSize: 22,
  },
  titleRow: {
    fontWeight: 600,
    fontSize: 15,
    lineHeight: 1.35,
    marginBottom: 4,
    color: theme.palette.text.normal,
  },
  body: {
    fontSize: 14,
    lineHeight: 1.45,
    color: theme.palette.text.dim65,
  },
  emphasis: {
    color: theme.palette.text.normal,
    fontWeight: 600,
  },
}));

interface PostPublicationCreditsBannerProps {
  credits: PostPublicationCommentCredits | null | undefined;
}

const PostPublicationCreditsBanner = ({ credits }: PostPublicationCreditsBannerProps) => {
  const classes = useStyles(styles);

  if (!credits?.enabled) {
    return null;
  }

  const { cost, balance, commentsNeededForNextPublish, qualifyingCommentsOnOthersPosts, publishedPostsCharged } =
    credits;
  const ready = commentsNeededForNextPublish <= 0;

  return (
    <div className={classes.root}>
      <ForumIcon icon="Comment" className={classes.icon} />
      <div>
        <div className={classes.titleRow}>
          {ready ? "You can publish" : "Comment credits for publishing"}
        </div>
        <div className={classes.body}>
          {ready ? (
            <>
              You have <span className={classes.emphasis}>{balance}</span> credit
              {balance === 1 ? "" : "s"} (your first post is free; from the second post onward, each publish uses{" "}
              <span className={classes.emphasis}>{cost}</span> comments on other people’s posts — not on posts you
              co-author).
            </>
          ) : (
            <>
              From your second post onward, you need <span className={classes.emphasis}>{cost}</span> comments on{" "}
              other people’s posts first (yours and co-authored posts don’t count). You have{" "}
              <span className={classes.emphasis}>{qualifyingCommentsOnOthersPosts}</span> qualifying comment
              {qualifyingCommentsOnOthersPosts === 1 ? "" : "s"} and{" "}
              <span className={classes.emphasis}>{publishedPostsCharged}</span> published post
              {publishedPostsCharged === 1 ? "" : "s"} already using credits.{" "}
              <span className={classes.emphasis}>
                {commentsNeededForNextPublish} more comment{commentsNeededForNextPublish === 1 ? "" : "s"}
              </span>{" "}
              before the next publish.
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostPublicationCreditsBanner;
