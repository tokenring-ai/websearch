# @tokenring-ai/websearch

## Overview

The `@tokenring-ai/websearch` package provides an abstract web search interface for the Token Ring AI ecosystem. It serves as a service layer that enables agents to query the web dynamically, process results, and fetch content for tasks like research, data gathering, and real-time information retrieval.

As a core abstract interface, this package defines the contract that concrete search provider implementations must follow. It integrates seamlessly with the Token Ring framework through a plugin system, offering tools, chat commands, and scripting functions for seamless interaction in agent-based applications.

## Installation

This package is designed to be used within a Token Ring AI project. It should be installed as a dependency and configured through the application's plugin system:

```bash
bun install @tokenring-ai/websearch
```

## Configuration

The websearch plugin requires configuration to enable provider implementations. Configuration is loaded from the application's configuration system using the `WebSearchConfigSchema`:

```typescript
import { WebSearchConfigSchema } from '@tokenring-ai/websearch';

const config = {
  websearch: {
    providers: {
      "your-provider-name": {
        type: "YourProviderImplementation"
      }
    },
    agentDefaults: {
      provider: "your-provider-name"
    }
  }
};
```

### Agent Configuration

Individual agents can override the default provider configuration:

```typescript
const agentConfig = {
  websearch: {
    provider: "duckduckgo"
  }
};
```

The agent configuration schema is defined by `WebSearchAgentConfigSchema`:

```typescript
const WebSearchAgentConfigSchema = z.object({
  provider: z.string().optional()
}).default({});
```

## Chat Commands

The websearch plugin provides comprehensive chat commands for interactive web search operations:

### `/websearch search <query>`

Perform a general web search.

```bash
/websearch search machine learning basics
```

**Options:**
- `--country <code>` - Country code for localized results (e.g., 'us', 'uk', 'de')
- `--language <code>` - Language code for content (e.g., 'en', 'es', 'fr')
- `--location <name>` - Location name for geo-targeted results
- `--num <n>` - Number of results to return
- `--page <n>` - Page number for pagination

### `/websearch news <query>`

Search for news articles.

```bash
/websearch news artificial intelligence
```

**Options:**
- `--country <code>` - Country code for localized results
- `--language <code>` - Language code for content
- `--location <name>` - Location name for geo-targeted results
- `--num <n>` - Number of results to return
- `--page <n>` - Page number for pagination

### `/websearch fetch <url>`

Fetch and extract content from a specific web page.

```bash
/websearch fetch https://example.com
```

**Options:**
- `--country <code>` - Country code for localized results
- `--render` - Enable JavaScript rendering for dynamic content

### `/websearch deep <query>`

Perform comprehensive search with content fetching.

```bash
/websearch deep quantum computing --search 10 --news 5 --fetch 3
```

**Options:**
- `--search <n>` - Number of web search results (default: 10)
- `--news <n>` - Number of news results (default: 0)
- `--fetch <n>` - Number of pages to fetch (default: 5)
- `--country <code>` - Country code for localized results
- `--language <code>` - Language code for content
- `--location <name>` - Location name for geo-targeted results

### `/websearch provider get`

Display the currently active web search provider.

```bash
/websearch provider get
```

### `/websearch provider set <name>`

Set a specific web search provider by name.

```bash
/websearch provider set tavily
```

### `/websearch provider select`

Select an active web search provider interactively.

```bash
/websearch provider select
```

### `/websearch provider reset`

Reset to the initial configured web search provider.

```bash
/websearch provider reset
```

## Tools

The package provides four interactive tools that agents can use to perform web searches:

### searchWeb

Search the web using the active web search provider.

```typescript
{
  name: "websearch_searchWeb",
  displayName: "Websearch/searchWeb",
  description: "Search the web using the active web search provider"
}
```

**Input Schema:**
```typescript
z.object({
  query: z.string().min(1).describe("Search query"),
  countryCode: z.string().optional().describe("Country code"),
  language: z.string().optional().describe("Language code"),
  location: z.string().optional().describe("Location string"),
  num: z.number().int().positive().optional().describe("Number of results"),
  page: z.number().int().positive().optional().describe("Page number"),
})
```

### searchNews

Search for news articles using the active web search provider.

```typescript
{
  name: "websearch_searchNews",
  displayName: "Websearch/searchNews",
  description: "Search news using the active web search provider"
}
```

**Input Schema:**
```typescript
z.object({
  query: z.string().min(1).describe("News search query"),
  countryCode: z.string().optional().describe("Country code"),
  language: z.string().optional().describe("Language code"),
  location: z.string().optional().describe("Location string"),
  num: z.number().int().positive().optional().describe("Number of results"),
  page: z.number().int().positive().optional().describe("Page number"),
})
```

### fetchPage

Fetch the content of a web page using the active web search provider.

```typescript
{
  name: "websearch_fetchPage",
  displayName: "Websearch/fetchPage",
  description: "Fetch a web page using the active web search provider"
}
```

**Input Schema:**
```typescript
z.object({
  url: z.string().describe("URL to fetch"),
  render: z.boolean().optional().describe("Enable JavaScript rendering"),
  countryCode: z.string().optional().describe("Country code"),
})
```

### deepSearch

Perform a comprehensive deep search that combines web search, news search, and page fetching for top results.

```typescript
{
  name: "websearch_deepSearch",
  displayName: "Websearch/deepSearch",
  description: "Perform a deep search: search the web, then fetch and return full page content for top results"
}
```

**Input Schema:**
```typescript
z.object({
  query: z.string().min(1).describe("A short search query to perform"),
  searchCount: z.number().int().positive().optional().describe("Number of general search results links to include. Should be set to 0 or a low number if the search is for news"),
  newsCount: z.number().int().positive().optional().describe("Number of news articles to search for"),
  fetchCount: z.number().int().positive().optional().describe("Number of pages to fetch full page content for(default: 5)"),
  countryCode: z.string().optional().describe("Country code"),
  language: z.string().optional().describe("Language code"),
  location: z.string().optional().describe("Location string"),
})
```

## Services

### WebSearchService

The `WebSearchService` class implements the `TokenRingService` interface and serves as the central hub for all web search operations. It manages multiple provider registrations through a registry and maintains state within agents.

**Constructor:**
```typescript
constructor(readonly options: z.output<typeof WebSearchConfigSchema>)
```

**Provider Management:**
- `registerProvider(provider: WebSearchProvider, name: string): void`
  - Registers a provider with the service registry

- `getAvailableProviders(): string[]`
  - Returns an array of all registered provider names

- `setActiveProvider(name: string, agent: Agent): void`
  - Sets the active provider for the given agent

- `requireActiveProvider(agent: Agent): WebSearchProvider`
  - Returns the currently active provider for the agent (throws error if none is set)

- `attach(agent: Agent): void`
  - Initializes the agent's web search state with the configured provider

**Search Operations:**

- `searchWeb(query: string, options?: WebSearchProviderOptions, agent: Agent): Promise<WebSearchResult>`
  - Performs a web search using the active provider
  - Returns structured search results

- `searchNews(query: string, options?: WebSearchProviderOptions, agent: Agent): Promise<NewsSearchResult>`
  - Performs a news-focused search using the active provider
  - Returns an array of news articles

- `fetchPage(url: string, options?: WebPageOptions, agent: Agent): Promise<WebPageResult>`
  - Fetches the content of a URL
  - Returns markdown content and optional metadata

- `deepSearch(query: string, options?: DeepSearchOptions, agent: Agent): Promise<DeepSearchResult>`
  - Performs a comprehensive search combining web, news, and page fetching
  - Returns combined results with fetched page content

## Providers

### WebSearchProvider (Abstract Class)

This abstract base class defines the interface that all concrete search provider implementations must implement. To create a custom provider, extend this class and implement the required abstract methods.

**Abstract Methods:**

- `searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>`
  - Performs a general web search
  - Must return structured results including organic results, knowledge graph, related searches, and people also ask sections

- `searchNews(query: string, options?: WebSearchProviderOptions): Promise<NewsSearchResult>`
  - Performs a news-focused search
  - Must return an array of news articles with titles, links, dates, and sources

- `fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult>`
  - Fetches the content of a URL
  - Must return markdown content and optional metadata

### Options Interfaces

**WebSearchProviderOptions:**
```typescript
interface WebSearchProviderOptions {
  countryCode?: string;    // Country code (e.g., 'US')
  language?: string;       // Language code (e.g., 'en')
  location?: string;       // Location string (e.g., 'New York,US')
  num?: number;            // Number of results (positive integer)
  page?: number;           // Page number (positive integer)
  timeout?: number;        // Request timeout in milliseconds
}
```

**WebPageOptions:**
```typescript
interface WebPageOptions {
  render?: boolean;        // Enable JavaScript rendering (boolean)
  countryCode?: string;    // Country code
  timeout?: number;        // Request timeout in milliseconds
}
```

**DeepSearchOptions:**
```typescript
interface DeepSearchOptions extends WebSearchProviderOptions {
  searchCount?: number;    // Number of web results (default: 10)
  newsCount?: number;      // Number of news results (default: 0)
  fetchCount?: number;     // Number of pages to fetch (default: 5)
  rerank?: (results: any[]) => Promise<any[]>; // Optional custom result sorter
}
```

### Result Types

**WebSearchResult:**
```typescript
interface WebSearchResult {
  knowledgeGraph?: KnowledgeGraph;
  organic: OrganicResult[];
  peopleAlsoAsk?: PeopleAlsoAsk[];
  relatedSearches?: RelatedSearch[];
}
```

**NewsSearchResult:**
```typescript
interface NewsSearchResult {
  news: NewsItem[];
}

interface NewsItem {
  title: string;
  link: string;
  snippet?: string;
  date: string;
  source: string;
  position?: number;
}
```

**WebPageResult:**
```typescript
interface WebPageResult {
  markdown: string;
  metadata?: Record<string, string>;
}
```

**DeepSearchResult:**
```typescript
interface DeepSearchResult {
  results: any[];
  news: NewsItem[];
  pages: Array<{                 // Fetched page content
    url: string;
    markdown: string;
    metadata?: Record<string, string>;
  }>;
}
```

### Result Component Types

**KnowledgeGraph:**
```typescript
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
```

**OrganicResult:**
```typescript
interface OrganicResult {
  title: string;
  link: string;
  snippet: string;
  sitelinks?: Sitelink[];
  position: number;
  date?: string;
  attributes?: Record<string, string>;
}
```

**Sitelink:**
```typescript
interface Sitelink {
  title: string;
  link: string;
}
```

**PeopleAlsoAsk:**
```typescript
interface PeopleAlsoAsk {
  question: string;
  snippet: string;
  title: string;
  link: string;
}
```

**RelatedSearch:**
```typescript
interface RelatedSearch {
  position?: number;
  query: string;
}
```

## Integration

### Agent Integration

Agents can access the web search service directly through dependency injection:

```typescript
// In agent task execution
const webSearchService = agent.requireServiceByType(WebSearchService);
const results = await webSearchService.searchWeb('latest AI research', undefined, agent);
```

### Composite Provider Usage

The `deepSearch` method supports custom result reranking through the optional `rerank` parameter:

```typescript
const sortedResults = await webSearchService.deepSearch('machine learning', {
  searchCount: 20,
  fetchCount: 5,
  rerank: async (results) => {
    // Implement custom sorting logic
    return results.sort((a, b) => b.position - a.position);
  }
}, agent);
```

### State Management

Each agent maintains a web search state slice (`WebSearchState`) that tracks the active provider:

```typescript
// Get current active provider
const state = agent.getState(WebSearchState);
console.log('Active provider:', state.provider);

// Switch providers
webSearchService.setActiveProvider('serper', agent);
```

### Plugin Architecture

This package works with concrete provider implementations in the Token Ring ecosystem:

- **@tokenring-ai/serper**: Google Search and News integration via Serper.dev API
- **@tokenring-ai/scraperapi**: Google SERP and News integration via ScraperAPI

Providers register themselves with the websearch service during plugin initialization.

### Chat Command Integration

The plugin automatically registers comprehensive chat commands through the agent command system:

- `/websearch search <query>` - General web search with location options
- `/websearch news <query>` - News-focused search
- `/websearch fetch <url>` - Page content fetching
- `/websearch deep <query>` - Comprehensive search with content fetching
- `/websearch provider get/set/select/reset` - Provider management commands

Commands support interactive provider selection with tree-based UI and help documentation.

### Scripting Functions

The plugin automatically registers four global scripting functions when the scripting service is available:

- `searchWeb(query: string)`: Performs a web search and returns JSON results
- `searchNews(query: string)`: Performs a news search and returns JSON results
- `fetchPage(url: string)`: Fetches page markdown content
- `deepSearch(query: string, searchCount?, newsCount?, fetchCount?)`: Performs comprehensive deep search and returns JSON results

These functions are accessible through the LLM via the scripting interface.

## Documentation

### Package Structure

```
pkg/websearch/
├── index.ts                 # Main entry point and exports
├── plugin.ts               # Plugin registration and tool setup
├── WebSearchService.ts     # Core service implementation
├── WebSearchProvider.ts    # Abstract base class for providers
├── schema.ts               # Zod schema definitions
├── tools.ts                # Barrel export for all tools
├── chatCommands.ts         # Chat command exports
├── tools/                  # Individual tool implementations
│   ├── searchWeb.ts        # Web search tool
│   ├── searchNews.ts       # News search tool
│   ├── fetchPage.ts        # Page fetch tool
│   └── deepSearch.ts       # Deep search tool
├── commands/               # Chat command implementations
│   ├── websearch.ts        # Main command router
│   ├── search.ts           # /websearch search <query>
│   ├── news.ts             # /websearch news <query>
│   ├── fetch.ts            # /websearch fetch <url>
│   ├── deep.ts             # /websearch deep <query>
│   └── provider/           # Provider management commands
│       ├── provider.ts     # Provider command router
│       ├── get.ts          # Get current provider
│       ├── set.ts          # Set provider by name
│       ├── select.ts       # Interactive provider selection
│       └── reset.ts        # Reset to initial provider
├── state/                  # Agent state management
│   └── webSearchState.ts   # Agent state slice
└── package.json            # Package metadata and dependencies
```

### Development

**Running Tests:**
```bash
bun test
bun test:watch
bun test:coverage
```

**Build Verification:**
```bash
bun build
```

### Best Practices

- Implement proper error handling for API rate limits and network failures
- Add appropriate timeout configurations for API calls
- Normalize result structures across different providers
- Handle authentication and API key management securely (environment variables)
- Consider implementing caching for frequently accessed content
- Respect robots.txt and terms of service for all search operations
- Test with different provider implementations to ensure consistency
- Use the interactive provider selection command for better user experience
- Leverage deep search for comprehensive research tasks

### Limitations

- Abstract package - no built-in search engine implementations
- Result structures are provider-dependent; implement normalization in consumer code
- High-volume fetching may trigger rate limits on search APIs
- No built-in result deduplication or similarity filtering
- Binary/non-text content not supported in page fetch operations
- Requires concrete provider implementations for actual functionality
- Country and language options depend on provider support

## Examples

### Example 1: Using Serper Provider

```typescript
import { TokenRingApp } from '@tokenring-ai/app';
import websearch from '@tokenring-ai/websearch';
import { SerperWebSearchProvider } from '@tokenring-ai/serper';

const app = new TokenRingApp({
  config: {
    websearch: {
      providers: {
        serper: {
          type: 'SerperWebSearchProvider'
        }
      },
      agentDefaults: {
        provider: 'serper'
      }
    }
  }
});

app.registerPlugin(websearch);
await app.start();

// Use the service
const webSearchService = app.requireServiceByType(WebSearchService);
const results = await webSearchService.searchWeb('artificial intelligence 2024', {
  num: 10
}, app.agent);

console.log(`Found ${results.organic.length} results`);
```

### Example 2: Custom Provider Implementation

```typescript
import WebSearchProvider, { type WebSearchResult, type NewsSearchResult, type WebPageResult } from '@tokenring-ai/websearch';

class CustomSearchProvider extends WebSearchProvider {
  async searchWeb(query: string, options?: any): Promise<WebSearchResult> {
    // Implement custom search logic
    // Return structured results matching WebSearchResult interface
  }

  async searchNews(query: string, options?: any): Promise<NewsSearchResult> {
    // Implement custom news search logic
    // Return structured results matching NewsSearchResult interface
  }

  async fetchPage(url: string, options?: any): Promise<WebPageResult> {
    // Implement custom page fetching logic
    // Return markdown content and optional metadata
  }
}
```

### Example 3: Using Chat Commands

```typescript
// In an agent or application, you can use the chat commands directly:

// Search for information
/websearch search typescript best practices

// Get latest news
/websearch news ai developments

// Fetch page content
/websearch fetch https://developer.mozilla.org/en-US/docs/Web/JavaScript

// Deep search for research
/websearch deep machine learning fundamentals --search 15 --news 5 --fetch 5

// Manage providers
/websearch provider get
/websearch provider set tavily
/websearch provider select
```

## License

MIT License - see [LICENSE](./LICENSE) file for details.
