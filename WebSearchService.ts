import {Agent} from "@tokenring-ai/agent";
import {TokenRingService} from "@tokenring-ai/agent/types";
import KeyedRegistryWithSingleSelection from "@tokenring-ai/utility/KeyedRegistryWithSingleSelection";
import WebSearchProvider, {
  type WebPageOptions,
  type WebPageResult,
  type WebSearchProviderOptions,
  type WebSearchResult
} from "./WebSearchProvider.js";

export default class WebSearchService implements TokenRingService {
  name = "WebSearchService";
  description = "Service for Web Search";
  protected agent!: Agent;

  private providerRegistry = new KeyedRegistryWithSingleSelection<WebSearchProvider>();

  registerResource = this.providerRegistry.register;
  getActiveResource = this.providerRegistry.getActiveItem;
  setActiveResource = this.providerRegistry.setEnabledItem;
  getAvailableResources = this.providerRegistry.getAllItemNames;

  async searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult> {
    return this.providerRegistry.getActiveItem().searchWeb(query, options);
  }

  async searchNews(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult> {
    return this.providerRegistry.getActiveItem().searchNews(query, options);
  }

  async fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult> {
    return this.providerRegistry.getActiveItem().fetchPage(url, options);
  }
}