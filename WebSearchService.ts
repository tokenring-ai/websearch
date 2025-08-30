import {Service, type Registry} from "@token-ring/registry";
import GenericSingularRegistry from "@token-ring/utility/GenericSingularRegistry";
import WebSearchProvider, {type WebSearchProviderOptions, type WebSearchResult, type WebPageOptions, type WebPageResult} from "./WebSearchProvider.js";

export default class WebSearchService extends Service {
  name = "WebSearch";
  description = "Abstract interface for web search operations";
  protected registry!: Registry;

  private providerRegistry = new GenericSingularRegistry<WebSearchProvider>();

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