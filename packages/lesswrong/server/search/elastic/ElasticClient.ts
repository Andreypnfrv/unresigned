import { Client } from "@elastic/elasticsearch";
import type {
  SearchHit,
  SearchResponse,
  SearchTotalHits,
} from "@elastic/elasticsearch/lib/api/types";
import ElasticQuery, { QueryData } from "./ElasticQuery";
import type { MultiQueryData } from "./ElasticMultiQuery";
import sortBy from "lodash/sortBy";
import {
  getElasticConnectionFingerprint,
  getElasticResolvedConnection,
  type ElasticResolvedConnection,
} from "../../../lib/instanceSettings";
import take from "lodash/take";

export type ElasticDocument = Exclude<SearchDocument, "_id">;
export type ElasticSearchHit = SearchHit<ElasticDocument>;
export type ElasticSearchResponse = SearchResponse<ElasticDocument>;

export type HitsOnlySearchResponse = {
  hits: {
    total?: number|SearchTotalHits
    hits: ElasticSearchHit[]
  }
};

/** Clears cached SDK client after transport/DNS failures so the next query can reconnect. */
export function resetElasticSdkClientCache(): void {
  globalClient = null;
  globalClientFingerprint = null;
}

function emptyHitsResponse(): HitsOnlySearchResponse {
  return {
    hits: {
      total: 0,
      hits: [],
    },
  };
}

function coerceSearchHitsBody(raw: unknown): HitsOnlySearchResponse {
  let r = raw;
  while (
    r !== null &&
    typeof r === "object" &&
    "body" in r &&
    (r as { body: unknown }).body !== null &&
    typeof (r as { body: unknown }).body === "object"
  ) {
    const innerBody = (r as { body: unknown }).body;
    if ("hits" in (innerBody as object)) r = innerBody as typeof r;
    else break;
  }
  if (
    r === null ||
    typeof r !== "object" ||
    !("hits" in r) ||
    r.hits === null ||
    typeof r.hits !== "object"
  ) {
    // eslint-disable-next-line no-console
    console.error(
      "[ElasticClient] Unexpected search payload",
      typeof raw,
      typeof raw === "object" || typeof raw === "string"
        ? String(raw instanceof Object ? Object.keys(raw as object).join(",") : raw).slice(0, 300)
        : "",
    );
    return emptyHitsResponse();
  }
  const { hits } = r as HitsOnlySearchResponse;
  const list = hits.hits;
  if (!Array.isArray(list)) return emptyHitsResponse();
  const total = hits.total !== undefined ? hits.total : list.length;
  return { hits: { total, hits: list } };
}

const DEBUG_LOG_ELASTIC_QUERIES =
  process.env.DEBUG_ELASTIC_QUERIES === "1" ||
  process.env.DEBUG_ELASTIC_QUERIES === "true";

let globalClient: Client | null = null;
let globalClientFingerprint: string | null = null;

function createElasticClientFromResolved(resolved: ElasticResolvedConnection): Client {
  if (resolved.kind === "cloud") {
    return new Client({
      requestTimeout: 600000,
      cloud: { id: resolved.cloudId },
      auth: { username: resolved.username, password: resolved.password },
    });
  }
  return new Client({
    requestTimeout: 600000,
    node: resolved.node,
    ...(resolved.auth ? { auth: resolved.auth } : {}),
    ...(resolved.tlsInsecure ? { tls: { rejectUnauthorized: false } } : {}),
  });
}

class ElasticClient {
  private getClientOrThrow(): Client {
    const resolved = getElasticResolvedConnection();
    if (!resolved) {
      resetElasticSdkClientCache();
      throw new Error("Elasticsearch is not enabled");
    }
    const fp = getElasticConnectionFingerprint(resolved);
    if (!globalClient || globalClientFingerprint !== fp) {
      globalClient = createElasticClientFromResolved(resolved);
      globalClientFingerprint = fp;
    }
    return globalClient;
  }

  getClient(): Client {
    return this.getClientOrThrow();
  }

  async search(queryData: QueryData): Promise<HitsOnlySearchResponse> {
    const query = new ElasticQuery(queryData);
    const request = query.compile();
    if (DEBUG_LOG_ELASTIC_QUERIES) {
      // eslint-disable-next-line no-console
      console.log("Elastic query:", JSON.stringify(request, null, 2));
    }
    try {
      return coerceSearchHitsBody(await this.getClientOrThrow().search(request));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[ElasticClient] search failed:", e);
      resetElasticSdkClientCache();
      return emptyHitsResponse();
    }
  }

  async multiSearch(queryData: MultiQueryData): Promise<HitsOnlySearchResponse> {
    try {
      const client = this.getClientOrThrow();
      const resultsBySearchIndex = await Promise.all(
        queryData.indexes.map((searchIndex) =>
          client.search(new ElasticQuery({
            index: searchIndex,
            filters: [],
            limit: queryData.limit,
            search: queryData.search,
            offset: queryData.offset,
          }).compile()),
        ),
      );

      const normalizedResults = resultsBySearchIndex.flatMap((indexResult) => {
        const hitsBody = coerceSearchHitsBody(indexResult);
        const hits = hitsBody.hits.hits;
        const maxScore = hits.reduce((max, h) => Math.max(max, h._score ?? 0), 0);
        if (maxScore <= 0) return hits;
        return hits.map(h => ({ ...h, _score: (h._score ?? 0) / maxScore }));
      });

      const sortedResults = take(sortBy(normalizedResults, h => -(h._score ?? 0)), queryData.limit);

      return {
        hits: {
          total: normalizedResults.length,
          hits: sortedResults as ElasticSearchHit[],
        },
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[ElasticClient] multiSearch failed:", e);
      resetElasticSdkClientCache();
      return emptyHitsResponse();
    }
  }
}

export default ElasticClient;
