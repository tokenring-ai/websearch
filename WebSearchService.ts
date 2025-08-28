import {Service, type Registry} from "@token-ring/registry";
import WebSearchResource, {type WebSearchOptions, type WebSearchResult, type WebPageOptions, type WebPageResult} from "./WebSearchResource.js";

export default class WebSearchService extends Service {
  name = "WebSearch";
  description = "Abstract interface for web search operations";
  protected registry!: Registry;

  private resources: Record<string, WebSearchResource> = {};
  private activeResource: string | null = null;

  registerResource(name: string, resource: WebSearchResource) {
    this.resources[name] = resource;
    if (!this.activeResource) {
      this.activeResource = name;
    }
  }

  getActiveResource(): string | null {
    return this.activeResource;
  }

  setActiveResource(name: string): void {
    if (!this.resources[name]) {
      throw new Error(`WebSearch resource ${name} not found`);
    }
    this.activeResource = name;
  }

  getAvailableResources(): string[] {
    return Object.keys(this.resources);
  }

  private getResource(): WebSearchResource {
    if (!this.activeResource || !this.resources[this.activeResource]) {
      throw new Error("No active web search resource available");
    }
    return this.resources[this.activeResource];
  }

  async searchWeb(query: string, options?: WebSearchOptions): Promise<WebSearchResult> {
    return this.getResource().searchWeb(query, options);
  }

  async searchNews(query: string, options?: WebSearchOptions): Promise<WebSearchResult> {
    return this.getResource().searchNews(query, options);
  }

  async fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult> {
    return this.getResource().fetchPage(url, options);
  }
}