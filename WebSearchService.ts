import {Agent} from "@tokenring-ai/agent";
import {TokenRingService} from "@tokenring-ai/app/types";
import KeyedRegistry from "@tokenring-ai/utility/registry/KeyedRegistry";
import z from "zod";
import {WebSearchAgentConfigSchema, WebSearchConfigSchema} from "./schema.ts";
import {WebSearchState} from "./state/webSearchState.ts";
import WebSearchProvider, {
  type DeepSearchOptions,
  type DeepSearchResult,
  NewsSearchResult,
  type WebPageOptions,
  type WebPageResult,
  type WebSearchProviderOptions,
  WebSearchResult,
} from "./WebSearchProvider.js";

export default class WebSearchService implements TokenRingService {
  name = "WebSearchService";
  description = "Service for Web Search";

  private providerRegistry = new KeyedRegistry<WebSearchProvider>();

  registerProvider = this.providerRegistry.register;
  getAvailableProviders = this.providerRegistry.getAllItemNames;

  constructor(readonly options: z.output<typeof WebSearchConfigSchema>) {}

  async attach(agent: Agent): Promise<void> {
    const config = agent.getAgentConfigSlice('websearch', WebSearchAgentConfigSchema);
    agent.initializeState(WebSearchState, config);
  }

  getActiveProvider(agent: Agent): WebSearchProvider {
    const providerName = agent.getState(WebSearchState).provider;
    return this.providerRegistry.requireItemByName(providerName ?? this.options.defaultProvider);
  }

  setActiveProvider(name: string, agent: Agent): void {
    agent.mutateState(WebSearchState, (state) => {
      state.provider = name;
    });
  }

  async searchWeb(query: string, options: WebSearchProviderOptions | undefined, agent: Agent): Promise<WebSearchResult> {
    return this.getActiveProvider(agent).searchWeb(query, options);
  }

  async searchNews(query: string, options: WebSearchProviderOptions | undefined, agent: Agent): Promise<NewsSearchResult> {
    return this.getActiveProvider(agent).searchNews(query, options);
  }

  async fetchPage(url: string, options: WebPageOptions | undefined, agent: Agent): Promise<WebPageResult> {
    return this.getActiveProvider(agent).fetchPage(url, options);
  }

  async deepSearch(query: string, options: DeepSearchOptions | undefined, agent: Agent): Promise<DeepSearchResult> {
    const searchCount = options?.searchCount ?? 10;
    const newsCount = options?.newsCount ?? 0;
    const fetchCount = options?.fetchCount ?? 5;

    const [searchResult, newsResult] = await Promise.all([
      searchCount > 0 ? this.searchWeb(query, {...options, num: searchCount}, agent) : null,
      newsCount > 0 ? this.searchNews(query, {...options, num: newsCount}, agent) : null
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
          const page = await this.fetchPage(url, {countryCode: options?.countryCode}, agent);
          return {url, ...page};
        } catch {
          return null;
        }
      })
    );

    return {
      results,
      news,
      pages: pages.filter((p): p is NonNullable<typeof p> => p !== null)
    };
  }
}