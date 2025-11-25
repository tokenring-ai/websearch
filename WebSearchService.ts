import {Agent} from "@tokenring-ai/agent";

import {TokenRingService} from "@tokenring-ai/app/types";
import KeyedRegistryWithSingleSelection from "@tokenring-ai/utility/registry/KeyedRegistryWithSingleSelection";
import WebSearchProvider, {
  type DeepSearchOptions,
  type DeepSearchResult, NewsSearchResult,
  type WebPageOptions,
  type WebPageResult,
  type WebSearchProviderOptions, WebSearchResult,
} from "./WebSearchProvider.js";

export default class WebSearchService implements TokenRingService {
  name = "WebSearchService";
  description = "Service for Web Search";
  protected agent!: Agent;

  private providerRegistry = new KeyedRegistryWithSingleSelection<WebSearchProvider>();

  registerProvider = this.providerRegistry.register;
  getActiveProvider = this.providerRegistry.getActiveItem;
  setActiveProvider = this.providerRegistry.setEnabledItem;
  getAvailableProviders = this.providerRegistry.getAllItemNames;

  async searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult> {
    return this.providerRegistry.getActiveItem().searchWeb(query, options);
  }

  async searchNews(query: string, options?: WebSearchProviderOptions): Promise<NewsSearchResult> {
    return this.providerRegistry.getActiveItem().searchNews(query, options);
  }

  async fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult> {
    return this.providerRegistry.getActiveItem().fetchPage(url, options);
  }

  async deepSearch(query: string, options?: DeepSearchOptions): Promise<DeepSearchResult> {
    const searchCount = options?.searchCount ?? 10;
    const newsCount = options?.newsCount ?? 0;
    const fetchCount = options?.fetchCount ?? 5;

    const [searchResult, newsResult] = await Promise.all([
      searchCount > 0 ? this.searchWeb(query, {...options, num: searchCount}) : null,
      newsCount > 0 ? this.searchNews(query, {...options, num: newsCount}) : null
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
          const page = await this.fetchPage(url, {countryCode: options?.countryCode});
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