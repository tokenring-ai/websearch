import type {Agent} from "@tokenring-ai/agent";
import type {AgentCreationContext} from "@tokenring-ai/agent/types";
import type {TokenRingService} from "@tokenring-ai/app/types";
import deepMerge from "@tokenring-ai/utility/object/deepMerge";
import KeyedRegistry from "@tokenring-ai/utility/registry/KeyedRegistry";
import type z from "zod";
import {WebSearchAgentConfigSchema, type WebSearchConfigSchema} from "./schema.ts";
import {WebSearchState} from "./state/webSearchState.ts";
import type {
  DeepSearchOptions,
  DeepSearchResult,
  NewsSearchResult,
  WebPageOptions,
  WebPageResult,
  WebSearchProvider,
  WebSearchProviderOptions,
  WebSearchResult,
} from "./WebSearchProvider.ts";

export default class WebSearchService implements TokenRingService {
  readonly name = "WebSearchService";
  description = "Service for Web Search";

  private providerRegistry = new KeyedRegistry<WebSearchProvider>();

  registerProvider = this.providerRegistry.register;
  getAvailableProviders = this.providerRegistry.getAllItemNames;

  constructor(readonly options: z.output<typeof WebSearchConfigSchema>) {
  }

  attach(agent: Agent, creationContext: AgentCreationContext): void {
    const config = deepMerge(
      this.options.agentDefaults,
      agent.getAgentConfigSlice("websearch", WebSearchAgentConfigSchema),
    );
    if (config.provider) {
      creationContext.items.push(`Web Search Provider: ${config.provider}`);
    } else {
      const providers = this.providerRegistry.getAllItemNames().sort();
      if (providers.length === 0) {
        creationContext.items.push("Web Search Provider: (none)");
      } else {
        creationContext.items.push(`Web Search Provider: ${providers[0]}`);
        config.provider = providers[0];
      }
    }
    agent.initializeState(WebSearchState, config);
  }

  requireActiveProvider(agent: Agent): WebSearchProvider {
    const providerName = agent.getState(WebSearchState).provider;
    if (!providerName)
      throw new Error("No web search provider has been enabled.");
    return this.providerRegistry.requireItemByName(providerName);
  }

  setActiveProvider(name: string, agent: Agent): void {
    agent.mutateState(WebSearchState, (state) => {
      state.provider = name;
    });
  }

  searchWeb(
    query: string,
    options: WebSearchProviderOptions | undefined,
    agent: Agent,
  ): Promise<WebSearchResult> {
    return this.requireActiveProvider(agent).searchWeb(query, options);
  }

  searchNews(
    query: string,
    options: WebSearchProviderOptions | undefined,
    agent: Agent,
  ): Promise<NewsSearchResult> {
    return this.requireActiveProvider(agent).searchNews(query, options);
  }

  fetchPage(
    url: string,
    options: WebPageOptions | undefined,
    agent: Agent,
  ): Promise<WebPageResult> {
    return this.requireActiveProvider(agent).fetchPage(url, options);
  }

  async deepSearch(
    query: string,
    options: DeepSearchOptions | undefined,
    agent: Agent,
  ): Promise<DeepSearchResult> {
    const searchCount = options?.searchCount ?? 10;
    const newsCount = options?.newsCount ?? 0;
    const fetchCount = options?.fetchCount ?? 5;

    const [searchResult, newsResult] = await Promise.all([
      searchCount > 0
        ? this.searchWeb(query, {...options, num: searchCount}, agent)
        : null,
      newsCount > 0
        ? this.searchNews(query, {...options, num: newsCount}, agent)
        : null,
    ]);

    let results = searchResult?.organic ?? [];
    const news = newsResult?.news ?? [];

    if (options?.rerank) {
      results = await options.rerank(results);
    }

    const toFetch = results.slice(0, fetchCount);
    const pages = await Promise.all(
      toFetch.map(async (result: any) => {
        const url = result.url || result.link;
        if (!url) return null;
        try {
          const page = await this.fetchPage(
            url,
            {countryCode: options?.countryCode},
            agent,
          );
          return {url, ...page};
        } catch {
          return null;
        }
      }),
    );

    return {
      results,
      news,
      pages: pages.filter((p): p is NonNullable<typeof p> => p !== null),
    };
  }
}