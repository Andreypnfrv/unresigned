import Users from "../collections/users/collection";
import {
  dailyEmailBatchAt13NotificationTypeSettings,
  dailyOnsiteDailyEmailAt13NotificationTypeSettings,
} from "@/lib/collections/users/notificationFieldHelpers";
import { updateDefaultValue } from "./meta/utils";

const emailCapableNotificationFields = [
  "notificationCommentsOnSubscribedPost",
  "notificationShortformContent",
  "notificationRepliesToMyComments",
  "notificationRepliesToSubscribedComments",
  "notificationSubscribedUserPost",
  "notificationSubscribedUserComment",
  "notificationPostsInGroups",
  "notificationSubscribedTagPost",
  "notificationSubscribedSequencePost",
  "notificationPrivateMessage",
  "notificationSharedWithMe",
  "notificationAlignmentSubmissionApproved",
  "notificationEventInRadius",
  "notificationKarmaPowersGained",
  "notificationRSVPs",
  "notificationGroupAdministration",
  "notificationCommentsOnDraft",
  "notificationPostsNominatedReview",
  "notificationSubforumUnread",
  "notificationNewMention",
  "notificationDialogueMessages",
  "notificationPublishedDialogueMessages",
  "notificationAddedAsCoauthor",
  "notificationDebateCommentsOnSubscribedPost",
  "notificationDebateReplies",
  "notificationDialogueMatch",
  "notificationTypoSuggestions",
] as const;

const dailyOnsiteNotificationFields = new Set([
  "notificationSubforumUnread",
  "notificationDebateCommentsOnSubscribedPost",
]);

const allNotificationFields = [
  ...emailCapableNotificationFields,
  "notificationNewDialogueChecks",
  "notificationYourTurnMatchForm",
] as const;

const backfillEmailNotificationDefaults = async (db: SqlClient) => {
  for (const fieldName of emailCapableNotificationFields) {
    const targetSettings = dailyOnsiteNotificationFields.has(fieldName)
      ? dailyOnsiteDailyEmailAt13NotificationTypeSettings
      : dailyEmailBatchAt13NotificationTypeSettings;
    const targetJson = JSON.stringify(targetSettings);

    await db.none(`
      UPDATE "Users"
      SET "${fieldName}" = $(targetJson)::jsonb
      WHERE
        "${fieldName}"->>'channel' IN ('onsite', 'both', 'email')
        OR (
          "${fieldName}" ? 'email'
          AND (
            ("${fieldName}"->'email'->>'enabled')::boolean IS NOT TRUE
            OR ("${fieldName}"->'email'->>'batchingFrequency') <> 'daily'
            OR ("${fieldName}"->'email'->>'timeOfDayGMT')::integer <> 13
          )
        );
    `, { targetJson });
  }
};

export const up = async ({db}: MigrationContext) => {
  for (const fieldName of allNotificationFields) {
    await updateDefaultValue(db, Users, fieldName);
  }
  await backfillEmailNotificationDefaults(db);
};

export const down = async ({db}: MigrationContext) => {
  for (const fieldName of allNotificationFields) {
    await updateDefaultValue(db, Users, fieldName);
  }
};
