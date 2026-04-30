import { isAnyTest } from "../../lib/executionEnvironment";
import pgp, { IDatabase } from "pg-promise";
import type { IClient } from "pg-promise/typescript/pg-subset";
import { connectionStringSetting, mirrorConnectionSettingString } from "../databaseSettings";
import { isEAForum, isPlaceholderInfrastructureHostname } from "../../lib/instanceSettings";

export type AnalyticsConnectionPool = IDatabase<{}, IClient>;
declare global {
  var analyticsConnectionPools: Map<string, AnalyticsConnectionPool>|undefined;
  var pgPromiseLib: ReturnType<typeof pgp>|undefined;
}

export const getPgPromiseLib = () => {
  if (!globalThis.pgPromiseLib) {
    globalThis.pgPromiseLib = pgp({});
  }
  return globalThis.pgPromiseLib;
}

let missingConnectionStringWarned = false;
let skippedInvalidAnalyticsUrlLogged = false;

function postgresAnalyticsUrlLooksResolvable(connectionString: string): boolean {
  const raw = connectionString.trim();
  if (!raw) return false;
  try {
    const forUrl = raw.replace(/^(postgresql|postgres):\/\//i, "http://");
    const u = new URL(forUrl);
    if (!u.hostname) return false;
    return !isPlaceholderInfrastructureHostname(u.hostname);
  } catch {
    return false;
  }
}

function getAnalyticsConnectionFromString(connectionString: string | null): AnalyticsConnectionPool | null {
  if (isAnyTest && !isEAForum()) {
    return null;
  }
  if (!connectionString?.trim()) {
    if (!missingConnectionStringWarned) {
      missingConnectionStringWarned = true;
      if (!isAnyTest) {
        //eslint-disable-next-line no-console
        console.log("Analytics logging disabled: no analytics connectionString passed in");
      }
    }
    return null;
  }

  if (!postgresAnalyticsUrlLooksResolvable(connectionString)) {
    if (!skippedInvalidAnalyticsUrlLogged && !isAnyTest) {
      skippedInvalidAnalyticsUrlLogged = true;
      //eslint-disable-next-line no-console
      console.warn(
        '[analytics] Ignoring analytics connection string: invalid URL or hostname "base" placeholder (analytics uses a separate pool from PG_URL)',
      );
    }
    return null;
  }

  if (!globalThis.analyticsConnectionPools) {
    globalThis.analyticsConnectionPools = new Map<string, AnalyticsConnectionPool>();
  }
  const analyticsConnectionPools = globalThis.analyticsConnectionPools;
  if (!analyticsConnectionPools.get(connectionString)) {
    const connectionOptions = { connectionString };

    analyticsConnectionPools.set(connectionString, getPgPromiseLib()(connectionOptions));
  }

  return analyticsConnectionPools.get(connectionString)!
}

// Return the Analytics database connection pool, if configured. If no
// analytics DB is specified in the server config, returns null instead. The
// first time this is called, it will block briefly.
export const getAnalyticsConnection = (): AnalyticsConnectionPool | null => {
  // We make sure that the settingsCache is initialized before we access the connection strings
  const connectionString = connectionStringSetting.get();
  return getAnalyticsConnectionFromString(connectionString);
};

export const getAnalyticsConnectionOrThrow = (): AnalyticsConnectionPool => {
  const connection = getAnalyticsConnection();
  if (!connection) {
    throw new Error("No analytics DB configured");
  }
  return connection;
};

export const getMirrorAnalyticsConnection = (): AnalyticsConnectionPool | null => {
  // We make sure that the settingsCache is initialized before we access the connection strings
  const connectionString = mirrorConnectionSettingString.get();
  return getAnalyticsConnectionFromString(connectionString);
};
