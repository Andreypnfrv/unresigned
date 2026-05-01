import set from "lodash/set";
import { baserates } from "./baserates";
import { localAfDevDb } from "./localAfDevDb";
import { localAfProdDb } from "./localAfProdDb";
import { localLwDevDb } from "./localLwDevDb";
import { localUnresignedDevDb } from "./localUnresignedDevDb";
import { localLwProdDb } from "./localLwProdDb";
import { prodAf } from "./prodAf";
import { prodLw } from "./prodLw";
import { prodAntimortality } from "./prodAntimortality";
import { prodUnresigned } from "./prodUnresigned";
import { testSettings } from "./test";
import { testCrosspostSettings } from "./testCrosspost";
import { z } from "zod";
import { isAnyTest, isProduction } from "@/lib/executionEnvironment";
import { isAF } from "@/lib/forumTypeUtils";

const validEnvNames = z.enum([
  "test",
  "testCrosspost",
  "baserates",
  "localLwDevDb",
  "localUnresignedDevDb",
  "prodLw",
  "prodUnresigned",
  "prodAntimortality",
]);

function getPublicSettings() {
  if (isAnyTest) {
    return testSettings;
  }
  const envName = process.env.ENV_NAME;
  if (!envName) {
    // eslint-disable-next-line no-console
    console.error("ENV_NAME is not set");
    return localLwDevDb;
  }

  const parsedEnvName = validEnvNames.safeParse(envName);
  if (!parsedEnvName.success) {
    // eslint-disable-next-line no-console
    console.error(`Invalid ENV_NAME: ${envName}`);
    return localLwDevDb;
  }

  let validEnvName = parsedEnvName.data;
  if (process.env.FORUM_TYPE === "Antimortality" && validEnvName === "prodUnresigned") {
    validEnvName = "prodAntimortality";
  }

  switch (validEnvName) {
    case "test":
      return testSettings;
    case "testCrosspost":
      return testCrosspostSettings;
    case "baserates":
      return baserates;
    // We're running a local dev instance against the dev db, or in the deployed dev environment
    case "localLwDevDb":
      return isAF() ? localAfDevDb : localLwDevDb;
    case "localUnresignedDevDb":
      return localUnresignedDevDb;
    case "prodUnresigned":
      return {
        ...prodUnresigned,
        elasticsearch: {
          searchAvailable: !!(
            process.env.ELASTICSEARCH_NODE?.trim() ||
            process.env.ELASTICSEARCH_CLOUD_ID?.trim()
          ),
        },
      };
    case "prodAntimortality":
      return {
        ...prodAntimortality,
        elasticsearch: {
          searchAvailable: !!(
            process.env.ELASTICSEARCH_NODE?.trim() ||
            process.env.ELASTICSEARCH_CLOUD_ID?.trim()
          ),
        },
      };
    // TODO: figure out what to do about preview environments (i.e. whether they should hit the prod db).
    // Even if they do, they should probably not run with "prod" settings (rather "local prod").
    case "prodLw": {
      // We're running in production, or a local prod build against the prod db
      if (isProduction) {
        return isAF() ? prodAf : prodLw;
      }

      // We're running a local dev instance against the prod db
      return isAF() ? localAfProdDb : localLwProdDb;
    }
  }
}

let privateSettings: Record<string, string>|null = null;
export function getPrivateSettings() {
  if (!privateSettings) {
    const rawPrivateSettings = Object.entries(process.env).filter((setting): setting is [string, string] => {
      const [key, value] = setting;
      return /^private_/i.test(key) && typeof value === 'string';
    });

    const newPrivateSettings: Record<string, string> = {};

    rawPrivateSettings.reduce((acc, [key, value]) => {
      const m = key.match(/^private_(.+)$/i);
      if (!m) {
        return acc;
      }
      set(acc, m[1].split('_'), value);
      return acc;
    }, newPrivateSettings);
    privateSettings = newPrivateSettings;
  }

  return privateSettings;
}

export function getSettings() {
  return {
    public: getPublicSettings(),
    private: getPrivateSettings(),
  };
}
