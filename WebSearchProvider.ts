export interface WebSearchProviderOptions {
  countryCode?: string;
  language?: string;
  location?: string;
  num?: number;
  page?: number;
  timeout?: number;
}

export type NewsItem = {
  title: string;
  link: string;
  snippet?: string;
  date: string;
  source: string;
  position?: number;
};
export interface NewsSearchResult {
  news: NewsItem[];
}

export interface KnowledgeGraph {
  position?: number;
  title: string;
  type: string;
  website?: string;
  imageUrl?: string;
  description?: string;
  descriptionSource?: string;
  descriptionLink?: string;
  attributes?: Record<string, string>;
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
  date?: string;
  attributes?: Record<string, string>;
}

export interface PeopleAlsoAsk {
  question: string;
  snippet: string;
  title: string;
  link: string;
}

export interface RelatedSearch {
  position?: number;
  query: string;
}

export interface WebSearchResult {
  knowledgeGraph?: KnowledgeGraph;
  organic: OrganicResult[];
  peopleAlsoAsk?: PeopleAlsoAsk[];
  relatedSearches?: RelatedSearch[];
}

export interface WebPageOptions {
  render?: boolean;
  countryCode?: string;
  timeout?: number;
}

export type WebPageResult = {
  markdown: string;
  metadata?: Record<string, string>;
}

export interface DeepSearchOptions extends WebSearchProviderOptions {
  searchCount?: number;
  newsCount?: number;
  fetchCount?: number;
  rerank?: (results: any[]) => Promise<any[]>;
}

export interface DeepSearchResult {
  results: any[];
  news: NewsItem[];
  pages: Array<{ url: string; markdown: string; metadata?: Record<string, string> }>;
}

export default abstract class WebSearchProvider {
  abstract searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>;

  abstract searchNews(query: string, options?: WebSearchProviderOptions): Promise<NewsSearchResult>;

  abstract fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult>;
}