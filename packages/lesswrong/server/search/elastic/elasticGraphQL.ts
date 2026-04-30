import gql from "graphql-tag";
import { isElasticEnabled } from "../../../lib/instanceSettings";
import { userIsAdmin } from "../../../lib/vulcan-users/permissions";
import ElasticExporter from "./ElasticExporter";

export const elasticGqlQueries = {
    SearchSynonyms(
      _root: void,
      _args: {},
      {currentUser}: ResolverContext,
    ): Promise<string[]> {
      if (!currentUser || !userIsAdmin(currentUser)) {
        throw new Error("This feature is only available to admins");
      }
      if (!isElasticEnabled()) return Promise.resolve([]);
      const exporter = new ElasticExporter();
      return exporter.getExistingSynonyms();
    },
  };
export const elasticGqlMutations = {
    async UpdateSearchSynonyms(
      _root: void,
      {synonyms}: {synonyms: string[]},
      {currentUser}: ResolverContext,
    ): Promise<string[]> {
      if (!currentUser || !userIsAdmin(currentUser)) {
        throw new Error("This feature is only available to admins");
      }
      if (!isElasticEnabled()) {
        throw new Error("Elasticsearch is not enabled");
      }
      const exporter = new ElasticExporter();
      try {
        await exporter.updateSynonyms(synonyms);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        throw new Error(`Search index unavailable: ${msg}`);
      }
      return synonyms;
    },
  };

export const elasticGqlTypeDefs = gql`
  extend type Query {
    SearchSynonyms: [String!]!
  }
  extend type Mutation {
    UpdateSearchSynonyms(synonyms: [String!]!): [String!]!
  }
`;
