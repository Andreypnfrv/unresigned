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

const DEBUG_LOG_ELASTIC_QUERIES = false;

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
      globalClient = null;
      globalClientFingerprint = null;
      throw new Error("Elasticsearch is not enabled");
    }
    const fp = getElasticConnectionFingerprint(resolved);
    if (!globalClient || globalClientFingerprint !== fp) {
      globalClient = createElasticClientFromResolved(resolved);
      globalClientFingerprint = fp;
    }
    return globalClient;
  }

  constructor() {
    this.getClientOrThrow();
  }

  getClient() {
    return this.getClientOrThrow();
  }

  search(queryData: QueryData): Promise<HitsOnlySearchResponse> {
    const query = new ElasticQuery(queryData);
    const request = query.compile();
    if (DEBUG_LOG_ELASTIC_QUERIES) {
      // eslint-disable-next-line no-console
      console.log("Elastic query:", JSON.stringify(request, null, 2));
    }
    return this.getClientOrThrow().search(request);
  }

  async multiSearch(queryData: MultiQueryData): Promise<HitsOnlySearchResponse> {
    const client = this.getClientOrThrow();
    // Perform the same search against each index
    const resultsBySearchIndex = await Promise.all(
      queryData.indexes.map((searchIndex) =>
        client.search(new ElasticQuery({
          index: searchIndex,
          filters: [],
          limit: queryData.limit,
          search: queryData.search,
          offset: queryData.offset,
        }).compile())
      )
    )

    // Normalize scores within each index to [0, 1] before merging, so that
    // differences in analyzers/boosts between indexes don't cause one index's
    // results to dominate the merged list.
    const normalizedResults = resultsBySearchIndex.flatMap(indexResult => {
      const hits = indexResult.hits.hits;
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
  }
}

export default ElasticClient;
