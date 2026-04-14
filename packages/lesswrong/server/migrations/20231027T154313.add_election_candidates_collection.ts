export const acceptsSchemaHash = "5e28a08c9be1ba704a99a94dab5c4fae";

export const up = async ({db}: MigrationContext) => {
  await db.none(`
    CREATE TABLE IF NOT EXISTS "ElectionCandidates" (
      "_id" VARCHAR(27) PRIMARY KEY,
      "schemaVersion" DOUBLE PRECISION DEFAULT 1,
      "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      "legacyData" JSONB,
      "baseScore" DOUBLE PRECISION DEFAULT 0 NOT NULL,
      "score" DOUBLE PRECISION DEFAULT 0 NOT NULL,
      "extendedScore" JSONB,
      "voteCount" DOUBLE PRECISION DEFAULT 0 NOT NULL,
      "afBaseScore" DOUBLE PRECISION,
      "afExtendedScore" JSONB,
      "afVoteCount" DOUBLE PRECISION,
      "inactive" BOOLEAN DEFAULT FALSE NOT NULL,
      "tagId" VARCHAR(27)
    );
  `);
};

export const down = async ({db}: MigrationContext) => {
  await db.none(`DROP TABLE IF EXISTS "ElectionCandidates" CASCADE`);
};
