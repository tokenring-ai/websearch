import type { Agent } from "@tokenring-ai/agent";
import type { AgentCreationContext } from "@tokenring-ai/agent/types";
import type { TokenRingService } from "@tokenring-ai/app/types";
import { ConfigurationError } from "@tokenring-ai/app/types";
import deepClone from "@tokenring-ai/utility/object/deepClone";
import KeyedRegistry from "@tokenring-ai/utility/registry/KeyedRegistry";
import type z from "zod";
import { WebSearchAgentConfigSchema, WebSearchConfigSchema } from "./schema.ts";
import { WebSearchState } from "./state/webSearchState.ts";
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

export type ParsedWebSearchConfig = z.output<typeof WebSearchConfigSchema>;

export default class WebSearchService implements TokenRingService {
  readonly name = "WebSearchService";
  description = "Service for Web Search";

  private providerRegistry = new KeyedRegistry<WebSearchProvider>();

  registerProvider = this.providerRegistry.set;
  unregisterProvider = this.providerRegistry.unregister;
  getAvailableProviders = this.providerRegistry.keysArray;

  private options: ParsedWebSearchConfig = WebSearchConfigSchema.parse({});

  constructor(options?: ParsedWebSearchConfig) {
    if (options) this.options = options;
  }

  reconfigure(options: ParsedWebSearchConfig): void {
    this.options = options;
  }

  attach(agent: Agent, creationContext: AgentCreationContext): void {
    const config = deepClone(this.options.agentDefaults, agent.getAgentConfigSlice("websearch", WebSearchAgentConfigSchema));
    if (config.provider) {
      creationContext.items.push(`Web Search Provider: ${config.provider}`);
    } else {
      const providers = this.providerRegistry.keysArray().sort();
      if (!providers[0]) {
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
    if (!providerName) throw new ConfigurationError(this.name, "No web search provider has been enabled.");
    return this.providerRegistry.require(providerName);
  }

  setActiveProvider(name: string, agent: Agent): void {
    agent.mutateState(WebSearchState, state => {
      state.provider = name;
    });
  }

  searchWeb(query: string, options: WebSearchProviderOptions | undefined, agent: Agent): Promise<WebSearchResult> {
    return this.requireActiveProvider(agent).searchWeb(query, options);
  }

  searchNews(query: string, options: WebSearchProviderOptions | undefined, agent: Agent): Promise<NewsSearchResult> {
    return this.requireActiveProvider(agent).searchNews(query, options);
  }

  fetchPage(url: string, options: WebPageOptions | undefined, agent: Agent): Promise<WebPageResult> {
    return this.requireActiveProvider(agent).fetchPage(url, options);
  }

  async deepSearch(query: string, options: DeepSearchOptions | undefined, agent: Agent): Promise<DeepSearchResult> {
    const searchCount = options?.searchCount ?? 10;
    const newsCount = options?.newsCount ?? 0;
    const fetchCount = options?.fetchCount ?? 5;

    const [searchResult, newsResult] = await Promise.all([
      searchCount > 0 ? this.searchWeb(query, { ...options, num: searchCount }, agent) : null,
      newsCount > 0 ? this.searchNews(query, { ...options, num: newsCount }, agent) : null,
    ]);

    let results = searchResult?.organic ?? [];
    const news = newsResult?.news ?? [];

    if (options?.rerank) {
      results = await options.rerank(results);
    }

    const toFetch = results.slice(0, fetchCount);
    const pages = await Promise.all(
      toFetch.map(async result => {
        try {
          const page = await this.fetchPage(result.link, { countryCode: options?.countryCode }, agent);
          return { url: result.link, ...page };
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
