export interface WebSearchProviderOptions {
  countryCode?: string;
  language?: string;
  location?: string;
  num?: number;
  page?: number;
  timeout?: number;
}

export interface WebSearchResult {
  results: any;
}

export interface WebPageOptions {
  render?: boolean;
  countryCode?: string;
  timeout?: number;
}

export interface WebPageResult {
  html: string;

}

export default abstract class WebSearchProvider {
  abstract searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>;

  abstract searchNews(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>;

  abstract fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult>;
}