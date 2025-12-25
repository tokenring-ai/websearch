# @tokenring-ai/websearch

## Overview

The `@tokenring-ai/websearch` package provides an abstract web search interface for the Token Ring AI ecosystem. It enables the registration and use of pluggable web search providers to perform web searches, news searches, web page fetching, and comprehensive deep search operations. The package integrates seamlessly with the Token Ring framework as a plugin, offering tools, chat commands, and scripting functions for seamless interaction in agent-based applications.

This package acts as a service layer in the larger Token Ring ecosystem, allowing agents to query the web dynamically, process results, and fetch content for tasks like research, data gathering, or real-time information retrieval.

## Installation/Setup

This package is designed to be used within a Token Ring AI project. To include it:

1. Install the package:
   ```bash
   bun install @tokenring-ai/websearch
   ```

2. Configure the plugin in your Token Ring application. The plugin will automatically register the service, tools, and chat commands when properly configured.

3. Add configuration to your app's configuration (e.g., in `app.config.ts` or similar):
   ```typescript
   import { WebSearchConfigSchema } from '@tokenring-ai/websearch';
   
   const config = {
     websearch: {
       defaultProvider: "your-provider-name",
       providers: {
         "your-provider-name": {
           type: "YourProviderImplementation"
         }
       }
     }
   };
   ```

4. Register the plugin in your application:
   ```typescript
   import websearch from '@tokenring-ai/websearch';
   import { TokenRingApp } from '@tokenring-ai/app';
   
   const app = new TokenRingApp();
   app.registerPlugin(websearch);
   ```

The package uses ES modules (`type: module` in package.json) and automatically handles dependencies like `zod` for schema validation.

## Package Structure

The package follows a modular structure:

- **index.ts**: Main entry point that exports the plugin, configuration schema, and core classes
- **WebSearchService.ts**: Core service that manages providers and exposes search APIs
- **WebSearchProvider.ts**: Abstract base class defining the interface for search providers
- **tools.ts**: Exports tool functions for web search operations
  - **tools/searchWeb.ts**: Tool for general web searches
  - **tools/searchNews.ts**: Tool for news-specific searches
  - **tools/fetchPage.ts**: Tool for fetching web page content
  - **tools/deepSearch.ts**: Tool for comprehensive deep search operations
- **chatCommands.ts**: Exports chat command modules
  - **chatCommands/websearch.ts**: Implements the `/websearch` command for interactive use
- **package.json**: Package metadata, dependencies, and exports

## Core Components

### WebSearchProvider (Abstract Class)

This abstract class defines the interface that concrete search providers must implement. It handles search queries with optional localization and pagination.

#### Key Methods:

- **`searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>`**
  - Performs a general web search
  - Parameters: `query` (required string), `options` (optional: countryCode, language, location, num results, page, timeout)
  - Returns: `WebSearchResult` - Structured results including organic results, knowledge graph, related searches, and "people also ask"

- **`searchNews(query: string, options?: WebSearchProviderOptions): Promise<NewsSearchResult>`**
  - Performs a news-focused search
  - Similar to `searchWeb` but tailored for recent news articles
  - Returns: `NewsSearchResult` - Array of news items with titles, links, dates, and sources

- **`fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult>`**
  - Fetches the content of a URL
  - Parameters: `url` (required string), `options` (optional: render for JS execution, countryCode, timeout)
  - Returns: `WebPageResult` - Markdown content and optional metadata

#### Result Types:

```typescript
interface WebSearchProviderOptions {
  countryCode?: string;
  language?: string;
  location?: string;
  num?: number;
  page?: number;
  timeout?: number;
}

interface NewsItem {
  title: string;
  link: string;
  snippet?: string;
  date: string;
  source: string;
  position?: number;
}
interface NewsSearchResult {
  news: NewsItem[];
}

interface KnowledgeGraph {
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

interface Sitelink {
  title: string;
  link: string;
}

interface OrganicResult {
  title: string;
  link: string;
  snippet: string;
  sitelinks?: Sitelink[];
  position: number;
  date?: string;
  attributes?: Record<string, string>;
}

interface PeopleAlsoAsk {
  question: string;
  snippet: string;
  title: string;
  link: string;
}

interface RelatedSearch {
  position?: number;
  query: string;
}

interface WebSearchResult {
  knowledgeGraph?: KnowledgeGraph;
  organic: OrganicResult[];
  peopleAlsoAsk?: PeopleAlsoAsk[];
  relatedSearches?: RelatedSearch[];
}

interface WebPageOptions {
  render?: boolean;
  countryCode?: string;
  timeout?: number;
}

interface WebPageResult {
  markdown: string;
  metadata?: Record<string, string>;
}

interface DeepSearchOptions extends WebSearchProviderOptions {
  searchCount?: number;     // Number of web results (default: 10)
  newsCount?: number;       // Number of news results (default: 0)
  fetchCount?: number;      // Number of pages to fetch (default: 5)
  rerank?: (results: any[]) => Promise<any[]>; // Optional result reranking
}

interface DeepSearchResult {
  results: any[];           // Web search results
  news: NewsItem[];         // News search results
  pages: Array<{            // Fetched page content
    url: string;
    markdown: string;
    metadata?: Record<string, string>;
  }>;
}
```

### WebSearchService

This class implements the `TokenRingService` interface and serves as the central hub for web search operations. It uses a `KeyedRegistryWithSingleSelection` to manage multiple providers, with one active at a time.

#### Key Methods:

- **Provider Management:**
  - `registerProvider(provider: WebSearchProvider, name: string): void` – Registers a provider
  - `setActiveProvider(name: string): void` – Sets the active provider
  - `getActiveProvider(): WebSearchProvider | undefined` – Gets the current active provider
  - `getAvailableProviders(): string[]` – Lists registered provider names

- **Search Operations:**
  - `searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>` – Delegates to active provider
  - `searchNews(query: string, options?: WebSearchProviderOptions): Promise<NewsSearchResult>` – Delegates to active provider
  - `fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult>` – Delegates to active provider

- **Deep Search:**
  - `deepSearch(query: string, options?: DeepSearchOptions): Promise<DeepSearchResult>` – Comprehensive search that combines web search, news search, and page fetching

#### Deep Search Implementation Details:

The deep search combines multiple search operations:
1. Performs web search to get links
2. Performs news search (optional)
3. Fetches content from the top results
4. Returns combined results

### Plugin Integration

The package exports a complete Token Ring plugin that integrates with the application lifecycle:

#### Configuration Schema:

```typescript
export const WebSearchConfigSchema = z.object({
  defaultProvider: z.string(),
  providers: z.record(z.string(), z.any())
}).optional();
```

#### Plugin Lifecycle:

- **`install(app: TokenRingApp)`**: 
  - Registers the WebSearchService
  - Registers scripting functions (if scripting service is available)
  - Registers chat tools and agent commands
  - Integrates with the application's configuration system

- **`start(app: TokenRingApp)`**:
  - Sets the active provider based on configuration

### Tools

Tools are executable functions integrated with the agent framework. They wrap service calls and include input validation via Zod schemas.

#### Available Tools:

- **searchWeb**: Executes a web search
  ```typescript
  {
    name: "websearch/searchWeb",
    description: "Search the web using the active web search provider",
    inputSchema: z.object({
      query: z.string().min(1).describe("Search query"),
      countryCode: z.string().optional().describe("Country code"),
      language: z.string().optional().describe("Language code"),
      location: z.string().optional().describe("Location string"),
      num: z.number().int().positive().optional().describe("Number of results"),
      page: z.number().int().positive().optional().describe("Page number"),
    })
  }
  ```

- **searchNews**: Searches for news articles
  ```typescript
  {
    name: "websearch/searchNews",
    description: "Search news using the active web search provider",
    inputSchema: z.object({
      query: z.string().min(1).describe("News search query"),
      countryCode: z.string().optional().describe("Country code"),
      language: z.string().optional().describe("Language code"),
      location: z.string().optional().describe("Location string"),
      num: z.number().int().positive().optional().describe("Number of results"),
      page: z.number().int().positive().optional().describe("Page number"),
    })
  }
  ```

- **fetchPage**: Fetches page content
  ```typescript
  {
    name: "websearch/fetchPage",
    description: "Fetch a web page using the active web search provider",
    inputSchema: z.object({
      url: z.string().describe("URL to fetch"),
      render: z.boolean().optional().describe("Enable JavaScript rendering"),
      countryCode: z.string().optional().describe("Country code"),
    })
  }
  ```

- **deepSearch**: Comprehensive search operation
  ```typescript
  {
    name: "websearch/deepSearch",
    description: "Perform a deep search: search the web, then fetch and return full page content for top results",
    inputSchema: z.object({
      query: z.string().min(1).describe("A short search query to perform"),
      searchCount: z.number().int().positive().describe("Number of general search results links to include"),
      newsCount: z.number().int().positive().describe("Number of news articles to search for"),
      fetchCount: z.number().int().positive().optional().describe("Number of pages to fetch full page content for (default: 5)"),
      countryCode: z.string().optional().describe("Country code"),
      language: z.string().optional().describe("Language code"),
      location: z.string().optional().describe("Location string"),
    })
  }
  ```

### Chat Commands

- **`/websearch`**: Interactive command for users in chat interfaces
  - Subcommands: `search <query>`, `news <query>`, `fetch <url>`, `deep <query>`, `provider [name]`
  - Supports flags like `--country`, `--num`, `--render`, `--search`, `--news`, `--fetch`
  - Displays results or provider status in chat

#### Usage Examples:

```bash
# Basic web search
/websearch search "typescript tutorial" --num 10

# News search
/websearch news "artificial intelligence" --num 5

# Page fetching with rendering
/websearch fetch "https://example.com" --render

# Deep search
/websearch deep "quantum computing" --search 20 --news 5 --fetch 10

# Provider management
/websearch provider
/websearch provider your-provider-name
```

The command provides comprehensive help and supports various options for localized searches, result pagination, and content rendering.

### Global Scripting Functions

When the `@tokenring-ai/scripting` service is available, the websearch package registers native functions for use in scripts:

- **`searchWeb(query)`**: Performs a web search and returns JSON results
- **`searchNews(query)`**: Searches for news articles and returns JSON results  
- **`fetchPage(url)`**: Fetches the markdown content of a web page
- **`deepSearch(query, searchCount?, newsCount?, fetchCount?)`**: Performs a comprehensive deep search

#### Scripting Examples:

```bash
# Research workflow
/var $results = searchWeb("artificial intelligence")
/var $analysis = llm("Analyze these search results: $results")

# News aggregation
/var $news = searchNews("AI breakthroughs")
/var $summary = llm("Summarize these news articles: $news")

# Content extraction
/var $html = fetchPage("https://example.com/article")
/var $content = llm("Extract the main content from this HTML: $html")

# Deep search research
/var $research = deepSearch("quantum computing", 15, 5, 8)
/var $report = llm("Create a comprehensive report based on this research: $research")
```

## Usage Examples

### 1. Basic Plugin Usage

```typescript
import { TokenRingApp } from '@tokenring-ai/app';
import websearch from '@tokenring-ai/websearch';

const app = new TokenRingApp({
  config: {
    websearch: {
      defaultProvider: "google",
      providers: {
        google: {
          type: "GoogleSearchProvider"
        }
      }
    }
  }
});

app.registerPlugin(websearch);
await app.start();

// Use the service
const webSearchService = app.requireServiceByType(WebSearchService);
const results = await webSearchService.searchWeb('Token Ring AI');
console.log(results);
```

### 2. Using Tools in Agent Tasks

```typescript
import { searchWeb } from '@tokenring-ai/websearch';

// In agent execution context
const searchResults = await searchWeb.execute(
  { query: 'latest AI news', num: 3 },
  agent
);
agent.chat.infoLine(`Found ${searchResults.organic.length} results`);
```

### 3. Deep Search Example

```typescript
const deepResults = await webSearchService.deepSearch(
  'machine learning trends 2024',
  {
    searchCount: 15,
    newsCount: 5,
    fetchCount: 3
  }
);

console.log(`Found ${deepResults.results.length} web results`);
console.log(`Found ${deepResults.news.length} news articles`);
console.log(`Fetched ${deepResults.pages.length} pages`);
```

## Configuration Options

### WebSearchProviderOptions:
- `countryCode`: Country code (e.g., 'US')
- `language`: Language code (e.g., 'en')
- `location`: Location string (e.g., 'New York,US')
- `num`: Number of results (positive integer)
- `page`: Page number (positive integer)
- `timeout`: Request timeout in milliseconds

### WebPageOptions:
- `render`: Enable JavaScript rendering (boolean)
- `countryCode`: Country code
- `timeout`: Request timeout in milliseconds

### DeepSearchOptions:
- Extends WebSearchProviderOptions
- `searchCount`: Number of web results (default: 10)
- `newsCount`: Number of news results (default: 0)
- `fetchCount`: Number of pages to fetch (default: 5)
- `rerank`: Optional function to rerank results

### Plugin Configuration:
```typescript
{
  websearch: {
    defaultProvider: "provider-name",
    providers: {
      "provider-name": {
        type: "ProviderImplementation"
      }
    }
  }
}
```

## API Reference

### Core Exports:
```typescript
// Plugin
export default websearchPlugin: TokenRingPlugin

// Configuration
export const WebSearchConfigSchema: ZodType

// Core classes
export { default as WebSearchService } from './WebSearchService.ts'
export { default as WebSearchProvider } from './WebSearchProvider.ts'

// Tools
export { default as searchWeb } from './tools/searchWeb.ts'
export { default as searchNews } from './tools/searchNews.ts'
export { default as fetchPage } from './tools/fetchPage.ts'
export { default as deepSearch } from './tools/deepSearch.ts'
```

### WebSearchService API:
```typescript
class WebSearchService implements TokenRingService {
  // Provider management
  registerProvider(provider: WebSearchProvider, name: string): void
  setActiveProvider(name: string): void
  getActiveProvider(): WebSearchProvider | undefined
  getAvailableProviders(): string[]
  
  // Search operations
  searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>
  searchNews(query: string, options?: WebSearchProviderOptions): Promise<NewsSearchResult>
  fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult>
  deepSearch(query: string, options?: DeepSearchOptions): Promise<DeepSearchResult>
}
```

## Dependencies

- `@tokenring-ai/agent` (^0.2.0): Core agent framework and types
- `@tokenring-ai/app` (^0.2.0): Application framework
- `@tokenring-ai/chat` (^0.2.0): Chat service
- `@tokenring-ai/utility` (^0.2.0): Utility classes like KeyedRegistryWithSingleSelection
- `@tokenring-ai/scripting` (^0.2.0): Scripting service
- `zod` (^4.1.13): Schema validation for configuration and inputs

## Contributing/Notes

### Implementing Providers:

To create a concrete search provider, extend the `WebSearchProvider` abstract class:

```typescript
import WebSearchProvider from '@tokenring-ai/websearch/WebSearchProvider';

class YourSearchProvider extends WebSearchProvider {
  async searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult> {
    // Implement your search logic here
    // Return results in the expected format
  }
  
  async searchNews(query: string, options?: WebSearchProviderOptions): Promise<NewsSearchResult> {
    // Implement your news search logic
  }
  
  async fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult> {
    // Implement your page fetching logic
  }
}
```

### Best Practices:

- Handle errors gracefully (rate limits, invalid queries, network issues)
- Implement proper timeout handling
- Normalize result structures when possible
- Add authentication and API key management
- Consider implementing caching for improved performance
- Respect robots.txt and terms of service

### Testing:

- Add unit tests for provider implementations
- Test integration with different search engines
- Test error handling and edge cases
- Test the deep search functionality thoroughly

### Limitations:

- Abstract only - no built-in search engine implementations
- Results structure is provider-dependent
- Binary/non-text content not supported in fetches
- Requires concrete provider implementations for functionality
- No built-in rate limiting or caching (implement in providers)

### License:

MIT. Contributions welcome via pull requests. Focus on new providers, enhancements to the interface, or improved documentation.