export const up = async ({db}: MigrationContext) => {
  await db.none(`DROP TABLE IF EXISTS "AdvisorRequests" CASCADE`);
  await db.none(`DROP TABLE IF EXISTS "GardenCodes" CASCADE`);
  await db.none(`DROP TABLE IF EXISTS "ElectionVotes" CASCADE`);
  await db.none(`DROP TABLE IF EXISTS "ElectionCandidates" CASCADE`);
  await db.none(`DROP TABLE IF EXISTS "FeaturedResources" CASCADE`);
  await db.none(`DROP TABLE IF EXISTS "Surveys" CASCADE`);
  await db.none(`DROP TABLE IF EXISTS "SurveyQuestions" CASCADE`);
  await db.none(`DROP TABLE IF EXISTS "SurveyResponses" CASCADE`);
  await db.none(`DROP TABLE IF EXISTS "SurveySchedules" CASCADE`);
  await db.none(`DROP TABLE IF EXISTS "UserJobAds" CASCADE`);
  await db.none(`DROP TABLE IF EXISTS "UserEAGDetails" CASCADE`);
  await db.none(`DROP TABLE IF EXISTS "DigestPosts" CASCADE`);
  await db.none(`DROP TABLE IF EXISTS "Digests" CASCADE`);
  
  // Split into a separate PR/separate migration to avoid brief downtime during deploy
  //await dropTable(db, "ForumEvents");
  //await dropField(db, "Comments", "forumEventId");
  //await dropField(db, "Comments", "forumEventMetadata");
  //await dropField(db, "Comments", "subforumStickyPriority");
  //await dropField(db, "Users", "optedOutOfSurveys");
  //await dropField(db, "Users", "inactiveSurveyEmailSentAt");
  //await dropField(db, "Users", "userSurveyEmailSentAt");
  //await dropField(db, "Users", "hideJobAdUntil");
  //await dropField(db, "Users", "subscribedToDigest");
  //await dropField(db, "Users", "subscribedToNewsletter");
}

export const down = async ({db}: MigrationContext) => {
}
