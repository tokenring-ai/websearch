export interface WebSearchProviderOptions {
  countryCode?: string | undefined;
  language?: string | undefined;
  location?: string | undefined;
  num?: number | undefined;
  page?: number | undefined;
  timeout?: number | undefined;
}

export type NewsItem = {
  title: string;
  link: string;
  snippet?: string | undefined;
  date: string;
  source: string;
  position?: number | undefined;
};

export interface NewsSearchResult {
  news: NewsItem[];
}

export interface KnowledgeGraph {
  position?: number | undefined;
  title: string;
  type: string;
  website?: string | undefined;
  imageUrl?: string | undefined;
  description?: string | undefined;
  descriptionSource?: string | undefined;
  descriptionLink?: string | undefined;
  attributes?: Record<string, string> | undefined;
}

export interface Sitelink {
  title: string;
  link: string;
}

export interface OrganicResult {
  title: string;
  link: string;
  snippet: string;
  sitelinks?: Sitelink[];
  position: number;
  date?: string | undefined;
  attributes?: Record<string, string> | undefined;
}

export interface PeopleAlsoAsk {
  question: string;
  snippet: string;
  title: string;
  link: string;
}

export interface RelatedSearch {
  position?: number | undefined;
  query: string;
}

export interface WebSearchResult {
  knowledgeGraph?: KnowledgeGraph | undefined;
  organic: OrganicResult[];
  peopleAlsoAsk?: PeopleAlsoAsk[] | undefined;
  relatedSearches?: RelatedSearch[] | undefined;
}

export interface WebPageOptions {
  render?: boolean | undefined;
  countryCode?: string | undefined;
  timeout?: number | undefined;
  deviceType?: "desktop" | "mobile" | undefined;
}

export type WebPageResult = {
  markdown: string;
  metadata?: Record<string, string> | undefined;
};

export interface DeepSearchOptions extends WebSearchProviderOptions {
  searchCount?: number | undefined;
  newsCount?: number | undefined;
  fetchCount?: number | undefined;
  rerank?: (results: any[]) => Promise<any[]>;
}

export interface DeepSearchResult {
  results: any[];
  news: NewsItem[];
  pages: Array<{
    url: string;
    markdown: string;
    metadata?: Record<string, string> | undefined;
  }>;
}

export interface WebSearchProvider {
  searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>;

  searchNews(query: string, options?: WebSearchProviderOptions): Promise<NewsSearchResult>;

  fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult>;
}
