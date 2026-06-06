import { commentCreditsRequiredPerPublishedPostSetting } from "@/lib/instanceSettings";
import { userIsAdminOrMod } from "@/lib/vulcan-users/permissions";

export function getPublicationCreditCost(): number {
  return commentCreditsRequiredPerPublishedPostSetting.get();
}

export function billablePublishedPostsSelector(userId: string) {
  return {
    userId,
    draft: false,
    deletedDraft: { $ne: true },
    isEvent: { $ne: true },
  };
}

export async function countBillablePublishedPosts(context: ResolverContext, userId: string): Promise<number> {
  return context.Posts.find(billablePublishedPostsSelector(userId)).count();
}

export async function countQualifyingPublicationCreditComments(
  context: ResolverContext,
  userId: string,
): Promise<number> {
  return context.repos.comments.countQualifyingPublicationCreditComments(userId);
}

export interface PostPublicationCommentCreditsPayload {
  enabled: boolean;
  cost: number;
  qualifyingCommentsOnOthersPosts: number;
  publishedPostsCharged: number;
  balance: number;
  commentsNeededForNextPublish: number;
}

export function computePostPublicationCommentCredits(
  cost: number,
  qualifying: number,
  publishedBillable: number,
): PostPublicationCommentCreditsPayload {
  if (cost <= 0) {
    return {
      enabled: false,
      cost: 0,
      qualifyingCommentsOnOthersPosts: qualifying,
      publishedPostsCharged: publishedBillable,
      balance: 0,
      commentsNeededForNextPublish: 0,
    };
  }
  const creditsSpentOnPublishedPosts = cost * Math.max(0, publishedBillable - 1);
  const balance = qualifying - creditsSpentOnPublishedPosts;
  const commentsNeededForNextPublish = Math.max(0, cost * publishedBillable - qualifying);
  return {
    enabled: true,
    cost,
    qualifyingCommentsOnOthersPosts: qualifying,
    publishedPostsCharged: publishedBillable,
    balance,
    commentsNeededForNextPublish,
  };
}

export async function getPostPublicationCommentCreditsForUser(
  context: ResolverContext,
  userId: string,
): Promise<PostPublicationCommentCreditsPayload> {
  const cost = getPublicationCreditCost();
  const [qualifying, publishedBillable] = await Promise.all([
    countQualifyingPublicationCreditComments(context, userId),
    countBillablePublishedPosts(context, userId),
  ]);
  return computePostPublicationCommentCredits(cost, qualifying, publishedBillable);
}

export async function assertUserMayPublishPostWithCommentCredits(
  context: ResolverContext,
  user: DbUser,
  options: { draft?: boolean | null; isEvent?: boolean | null },
): Promise<void> {
  const cost = getPublicationCreditCost();
  if (cost <= 0) return;
  if (userIsAdminOrMod(user)) return;
  if (options.isEvent) return;
  if (options.draft === true) return;

  const qualifying = await countQualifyingPublicationCreditComments(context, user._id);
  const publishedBillable = await countBillablePublishedPosts(context, user._id);
  const required = cost * publishedBillable;

  if (qualifying < required) {
    const shortfall = required - qualifying;
    throw new Error(
      `Need ${cost} comments on others’ posts before your next publication (${shortfall} more; you have ${qualifying}/${required}). Your first post does not require comments. Co-authored posts don’t count.`,
    );
  }
}
