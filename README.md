# @tokenring-ai/websearch

## Overview

The `@tokenring-ai/websearch` package provides an abstract web search interface for the Token Ring AI ecosystem. It enables the registration and use of pluggable web search providers to perform web searches, news searches, web page fetching, and comprehensive deep search operations. The package integrates seamlessly with the Token Ring framework as a plugin, offering tools, chat commands, and scripting functions for seamless interaction in agent-based applications.

This package acts as a service layer in the larger Token Ring ecosystem, allowing agents to query the web dynamically, process results, and fetch content for tasks like research, data gathering, or real-time information retrieval.

## Installation

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

4. Register the plugin in your application:
   ```typescript
   import websearch from '@tokenring-ai/websearch';
   import { TokenRingApp } from '@tokenring-ai/app';
   
   const app = new TokenRingApp();
   app.registerPlugin(websearch);
   ```

The package uses ES modules (`type: module` in package.json) and automatically handles dependencies like `zod` for schema validation.

## Chat Commands

### `/websearch`

Interactive command for users in chat interfaces

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

## Plugin Configuration

Configuration for the websearch plugin is defined by the `WebSearchConfigSchema`:

```typescript
const WebSearchConfigSchema = z.object({
  providers: z.record(z.string(), z.any()),
  agentDefaults: z.object({
    provider: z.string()
  })
});
```

### Configuration Example:

```typescript
const config = {
  websearch: {
    providers: {
      "google": {
        type: "GoogleSearchProvider"
      },
      "duckduckgo": {
        type: "DuckDuckGoProvider"
      }
    },
    agentDefaults: {
      provider: "google"
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

## Tools

Available tools wrapped with input validation and documentation:

### searchWeb

Search the web using the active web search provider

```typescript
{
  name: "websearch_searchWeb",
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

### searchNews

Search news using the active web search provider

```typescript
{
  name: "websearch_searchNews",
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

### fetchPage

Fetch a web page using the active web search provider

```typescript
{
  name: "websearch_fetchPage",
  description: "Fetch a web page using the active web search provider",
  inputSchema: z.object({
    url: z.string().describe("URL to fetch"),
    render: z.boolean().optional().describe("Enable JavaScript rendering"),
    countryCode: z.string().optional().describe("Country code"),
  })
}
```

### deepSearch

Perform a deep search: search the web, then fetch and return full page content for top results

```typescript
{
  name: "websearch_deepSearch",
  description: "Perform a deep search: search the web, then fetch and return full page content for top results",
  inputSchema: z.object({
    query: z.string().min(1).describe("A short search query to perform"),
    searchCount: z.number().int().positive().optional().describe("Number of general search results links to include. Should be set to 0 or a low number if the search is for news"),
    newsCount: z.number().int().positive().optional().describe("Number of news articles to search for"),
    fetchCount: z.number().int().positive().optional().describe("Number of pages to fetch full page content for(default: 5)"),
    countryCode: z.string().optional().describe("Country code"),
    language: z.string().optional().describe("Language code"),
    location: z.string().optional().describe("Location string"),
  })
}
```

## Services

### WebSearchService

This class implements the `TokenRingService` interface and serves as the central hub for web search operations. It uses a `KeyedRegistry` to manage multiple providers, with one active at a time.

#### Constructor

```typescript
constructor(readonly options: z.output<typeof WebSearchConfigSchema>)
```

#### Provider Management Methods

- **`registerProvider(provider: WebSearchProvider, name: string): void`**
  - Registers a provider with the service registry

- **`getAvailableProviders(): string[]`**
  - Returns an array of all registered provider names

- **`setActiveProvider(name: string, agent: Agent): void`**
  - Sets the active provider for the agent

- **`requireActiveProvider(agent: Agent): WebSearchProvider`**
  - Gets the active provider (throws error if none is set)

#### Search Operations

- **`async searchWeb(query: string, options?: WebSearchProviderOptions, agent: Agent): Promise<WebSearchResult>`**
  - Performs a web search using the active provider
  - Parameters:
    - `query`: The search query string
    - `options`: Optional search configuration
    - `agent`: The agent context
  - Returns: Promise resolving to web search results

- **`async searchNews(query: string, options?: WebSearchProviderOptions, agent: Agent): Promise<NewsSearchResult>`**
  - Performs a news search using the active provider
  - Parameters and return type similar to searchWeb

- **`async fetchPage(url: string, options?: WebPageOptions, agent: Agent): Promise<WebPageResult>`**
  - Fetches a web page using the active provider
  - Parameters:
    - `url`: The URL to fetch
    - `options`: Optional fetch configuration
    - `agent`: The agent context
  - Returns: Promise resolving to page content

- **`async deepSearch(query: string, options?: DeepSearchOptions, agent: Agent): Promise<DeepSearchResult>`**
  - Performs a comprehensive search combining web search, news search, and page fetching
  - Parameters:
    - `query`: The search query
    - `options`: Optional configuration for search, news, and fetch counts
    - `agent`: The agent context
  - Returns: Promise resolving to combined results

#### Attach Method

- **`async attach(agent: Agent): Promise<void>`**
  - Initializes the agent's web search state with the configured provider

## Providers

### WebSearchProvider (Abstract Class)

This abstract class defines the interface that concrete search providers must implement. All provider implementations must extend this class and implement the required methods.

#### Abstract Methods

- **`abstract searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>`**
  - Performs a general web search
  - Returns: Structured results including organic results, knowledge graph, related searches, and "people also ask"

- **`abstract searchNews(query: string, options?: WebSearchProviderOptions): Promise<NewsSearchResult>`**
  - Performs a news-focused search
  - Returns: Array of news items with titles, links, dates, and sources

- **`abstract fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult>`**
  - Fetches the content of a URL
  - Returns: Markdown content and optional metadata

### WebSearchProviderOptions

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

### WebPageOptions

```typescript
interface WebPageOptions {
  render?: boolean;        // Enable JavaScript rendering (boolean)
  countryCode?: string;    // Country code
  timeout?: number;        // Request timeout in milliseconds
}
```

### DeepSearchOptions

```typescript
interface DeepSearchOptions extends WebSearchProviderOptions {
  searchCount?: number;    // Number of web results (default: 10)
  newsCount?: number;      // Number of news results (default: 0)
  fetchCount?: number;     // Number of pages to fetch (default: 5)
  rerank?: (results: any[]) => Promise<any[]>; // Optional result reranking
}
```

### Result Types

#### NewsItem

```typescript
interface NewsItem {
  title: string;
  link: string;
  snippet?: string;
  date: string;
  source: string;
  position?: number;
}
```

#### NewsSearchResult

```typescript
interface NewsSearchResult {
  news: NewsItem[];
}
```

#### KnowledgeGraph

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

#### Sitelink

```typescript
interface Sitelink {
  title: string;
  link: string;
}
```

#### OrganicResult

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

#### PeopleAlsoAsk

```typescript
interface PeopleAlsoAsk {
  question: string;
  snippet: string;
  title: string;
  link: string;
}
```

#### RelatedSearch

```typescript
interface RelatedSearch {
  position?: number;
  query: string;
}
```

#### WebSearchResult

```typescript
interface WebSearchResult {
  knowledgeGraph?: KnowledgeGraph;
  organic: OrganicResult[];
  peopleAlsoAsk?: PeopleAlsoAsk[];
  relatedSearches?: RelatedSearch[];
}
```

#### WebPageResult

```typescript
interface WebPageResult {
  markdown: string;
  metadata?: Record<string, string>;
}
```

#### DeepSearchResult

```typescript
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

## RPC Endpoints

The plugin registers the following RPC endpoints through the ScriptingService:

| Endpoint | Request Params | Response |
|----------|---------------|----------|
| `searchWeb` | `query: string` | `string` (JSON serialized WebSearchResult) |
| `searchNews` | `query: string` | `string` (JSON serialized NewsSearchResult) |
| `fetchPage` | `url: string` | `string` (page markdown content) |
| `deepSearch` | `query: string, searchCount?: string, newsCount?: string, fetchCount?: string` | `string` (JSON serialized DeepSearchResult) |

## State Management

### WebSearchState

This class implements the `AgentStateSlice` interface for managing web search state within an agent.

#### Properties

- **`name: string`** - Always "WebSearchState"
- **`provider: string | null`** - The currently active provider name

#### Methods

- **`constructor(initialConfig)`**
  - Initializes the state with the agent's configuration

- **`transferStateFromParent(parent: Agent)`**
  - Transfers state from a parent agent (for agent spawning scenarios)

- **`reset(what: ResetWhat[])`**
  - Resets state (currently empty implementation)

- **`serialize()`**
  - Returns: `{ provider: string | null }`

- **`deserialize(data)`**
  - Restores state from serialized data

- **`show()`**
  - Returns: Array showing current provider

## Usage Examples

### 1. Basic Plugin Usage

```typescript
import { TokenRingApp } from '@tokenring-ai/app';
import websearch from '@tokenring-ai/websearch';
import { WebSearchService } from '@tokenring-ai/websearch';

const app = new TokenRingApp({
  config: {
    websearch: {
      providers: {
        google: {
          type: "GoogleSearchProvider"
        }
      },
      agentDefaults: {
        provider: "google"
      }
    }
  }
});

app.registerPlugin(websearch);
await app.start();

// Use the service
const agent = app.agent;
const webSearchService = app.requireServiceByType(WebSearchService);
const results = await webSearchService.searchWeb('Token Ring AI', undefined, agent);
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
  },
  agent
);

console.log(`Found ${deepResults.results.length} web results`);
console.log(`Found ${deepResults.news.length} news articles`);
console.log(`Fetched ${deepResults.pages.length} pages`);
```

### 4. Provider Management

```typescript
const webSearchService = agent.requireServiceByType(WebSearchService);

// List available providers
const providers = webSearchService.getAvailableProviders();
console.log('Available providers:', providers);

// Switch provider
webSearchService.setActiveProvider('duckduckgo', agent);

// Get current provider
const currentProvider = agent.getState(WebSearchState).provider;
```

### 5. Using Chat Command

```typescript
// In chat context
// User types: /websearch search "TypeScript features" --num 5
// Agent executes the search and returns results
```

## API Reference

### Core Exports

```typescript
// Configuration Schemas
export { WebSearchConfigSchema, WebSearchAgentConfigSchema } from "./schema.ts";

// Core Classes
export { default as WebSearchService } from "./WebSearchService.ts";
export { default as WebSearchProvider } from "./WebSearchProvider.ts";

// Plugin
export { default } from "./plugin.ts";

// Tools
export { default as searchWeb } from "./tools/searchWeb.ts";
export { default as searchNews } from "./tools/searchNews.ts";
export { default as fetchPage } from "./tools/fetchPage.ts";
export { default as deepSearch } from "./tools/deepSearch.ts";
```

### WebSearchService API

```typescript
class WebSearchService implements TokenRingService {
  name = "WebSearchService";
  description = "Service for Web Search";
  
  // Provider management
  registerProvider: (provider: WebSearchProvider, name: string) => void;
  getAvailableProviders: () => string[];
  setActiveProvider: (name: string, agent: Agent) => void;
  requireActiveProvider: (agent: Agent) => WebSearchProvider;
  
  // Search operations
  searchWeb: (query: string, options: WebSearchProviderOptions | undefined, agent: Agent) => Promise<WebSearchResult>;
  searchNews: (query: string, options: WebSearchProviderOptions | undefined, agent: Agent) => Promise<NewsSearchResult>;
  fetchPage: (url: string, options: WebPageOptions | undefined, agent: Agent) => Promise<WebPageResult>;
  deepSearch: (query: string, options: DeepSearchOptions | undefined, agent: Agent) => Promise<DeepSearchResult>;
}
```

## Integration

### Agent Integration

```typescript
// Agents can access web search service directly
const webSearchService = agent.requireServiceByType(WebSearchService);
const results = await webSearchService.searchWeb('latest news', undefined, agent);
```

### Chat Service Integration

```typescript
// Automatic tool registration
chatService.addTools("@tokenring-ai/websearch", {
  searchWeb,
  searchNews,
  fetchPage,
  deepSearch
});

// Tool execution through chat
const result = await chatService.executeTool("websearch_searchWeb", { query: "example" });
```

### Scripting Integration

```typescript
// Global function registration (when scripting available)
scriptingService.registerFunction("searchWeb", {
  type: 'native',
  params: ["query"],
  async execute(this: ScriptingThis, query: string): Promise<string> {
    const result = await this.agent.requireServiceByType(WebSearchService).searchWeb(query, undefined, this.agent);
    return JSON.stringify(result);
  }
});
```

## Development

### Package Structure

```
pkg/websearch/
├── index.ts                 # Main entry point and exports
├── plugin.ts               # Plugin definition and configuration
├── WebSearchService.ts     # Core service implementation
├── WebSearchProvider.ts    # Abstract base class for providers
├── schema.ts               # Zod schema definitions
├── tools.ts                # Tool exports
├── chatCommands.ts         # Chat command exports
├── tools/
│   ├── searchWeb.ts        # Web search tool
│   ├── searchNews.ts       # News search tool
│   ├── fetchPage.ts        # Page fetch tool
│   └── deepSearch.ts       # Deep search tool
├── commands/
│   ├── websearch.ts        # Main command router
│   └── websearch/
│       ├── search.ts       # Search subcommand
│       ├── news.ts         # News subcommand
│       ├── fetch.ts        # Fetch subcommand
│       ├── deep.ts         # Deep search subcommand
│       └── provider.ts     # Provider management
├── state/
│   └── webSearchState.ts   # Agent state slice
└── vitest.config.ts        # Test configuration
```

### Testing

- Run tests: `bun test`
- Watch mode: `bun test:watch`
- Coverage: `bun test:coverage`

### Best Practices

- Handle errors gracefully (rate limits, invalid queries, network issues)
- Implement proper timeout handling
- Normalize result structures when possible
- Add authentication and API key management
- Consider implementing caching for improved performance
- Respect robots.txt and terms of service

### Limitations

- Abstract only - no built-in search engine implementations
- Results structure is provider-dependent
- Binary/non-text content not supported in fetches
- Requires concrete provider implementations for functionality
- No built-in rate limiting or caching (implement in providers)

## License

MIT License - see [LICENSE](./LICENSE) file for details.
