# @tokenring-ai/websearch

## Overview

The `@tokenring-ai/websearch` package provides a comprehensive web search interface for the Token Ring AI ecosystem. It serves as an abstract service layer that enables agents to query the web dynamically, process search results, and fetch content for tasks like research, data gathering, and real-time information retrieval.

As a core abstract interface package, it defines the contract that concrete search provider implementations must follow. It integrates seamlessly with the Token Ring framework through its plugin system, offering:

- **Four interactive tools** for agent operations (`websearch_searchWeb`, `websearch_searchNews`, `websearch_fetchPage`, `websearch_deepSearch`)
- **Agent command interface** for CLI-based operations (`/websearch` with 8 subcommands)
- **Four global scripting functions** accessible through the scripting service
- **Service layer integration** with provider registry and state management
- **Deep search with custom reranking** for advanced result processing

## Key Features

- **Abstract Provider Interface**: Defines the contract for search providers to implement
- **Multi-Provider Support**: Registry system for managing multiple search provider implementations
- **Comprehensive Search Operations**: Web search, news search, page fetching, and deep search
- **Agent State Management**: Persistent provider selection per agent via `WebSearchState`
- **Interactive Tools**: Four agent-usable tools with Zod schema validation
- **CLI Commands**: Full-featured `/websearch` command with 8 subcommands and options
- **Scripting Functions**: Global functions for LLM access to search capabilities
- **Configurable Options**: Country/region targeting, language localization, pagination
- **Error Handling**: Proper validation with `CommandFailedError` and standardized error responses
- **Deep Search with Reranking**: Custom result sorting support via optional `rerank` function
- **Parallel Execution**: Deep search executes web and news searches in parallel for performance

## Installation

```bash
bun add @tokenring-ai/websearch
```

## Dependencies

- `@tokenring-ai/app`: ^0.2.0
- `@tokenring-ai/agent`: ^0.2.0
- `@tokenring-ai/chat`: ^0.2.0
- `@tokenring-ai/utility`: ^0.2.0
- `@tokenring-ai/scripting`: ^0.2.0
- `zod`: ^4.3.6

## Core Components/API

### WebSearchProvider (Abstract Class)

The abstract base class that defines the interface for all search provider implementations.

**Location**: `pkg/websearch/WebSearchProvider.ts`

**Abstract Methods:**

```typescript
abstract searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>
abstract searchNews(query: string, options?: WebSearchProviderOptions): Promise<NewsSearchResult>
abstract fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult>
```

**Result Type Definitions:**

- `WebSearchResult`: General search results with knowledge graph, organic results, related searches, and people also ask sections
- `NewsSearchResult`: News article results with titles, links, dates, sources, and snippets
- `WebPageResult`: Web page content in markdown format with optional metadata
- `DeepSearchResult`: Combined results from web search, news search, and page fetching

**Option Types:**

```typescript
interface WebSearchProviderOptions {
  countryCode?: string;    // ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB')
  language?: string;       // ISO 639-1 language code (e.g., 'en', 'es', 'fr')
  location?: string;       // Location string for geo-targeting (e.g., 'New York,US')
  num?: number;            // Number of results (positive integer)
  page?: number;           // Page number for pagination (positive integer)
  timeout?: number;        // Request timeout in milliseconds
}

interface WebPageOptions {
  render?: boolean;        // Enable JavaScript rendering for dynamic content
  countryCode?: string;    // Country code for localized results
  timeout?: number;        // Request timeout in milliseconds
}

interface DeepSearchOptions extends WebSearchProviderOptions {
  searchCount?: number;    // Number of web results (default: 10)
  newsCount?: number;      // Number of news results (default: 0)
  fetchCount?: number;     // Number of pages to fetch (default: 5)
  rerank?: (results: any[]) => Promise<any[]>; // Optional custom result sorter
}
```

### WebSearchService

Core service implementation managing provider registry, search operations, and agent integration.

**Location**: `pkg/websearch/WebSearchService.ts`

**Service Name**: `WebSearchService`

**Provider Management:**

```typescript
registerProvider(provider: WebSearchProvider, name: string): void
getAvailableProviders(): string[]
setActiveProvider(name: string, agent: Agent): void
requireActiveProvider(agent: Agent): WebSearchProvider
attach(agent: Agent): void
```

**Search Operations:**

```typescript
searchWeb(query: string, options?: WebSearchProviderOptions, agent: Agent): Promise<WebSearchResult>
searchNews(query: string, options?: WebSearchProviderOptions, agent: Agent): Promise<NewsSearchResult>
fetchPage(url: string, options?: WebPageOptions, agent: Agent): Promise<WebPageResult>
deepSearch(query: string, options?: DeepSearchOptions, agent: Agent): Promise<DeepSearchResult>
```

### Tools

The package provides four interactive tools that agents can use:

| Tool Name | Description |
|-----------|-------------|
| `websearch_searchWeb` | Search the web using the active web search provider |
| `websearch_searchNews` | Search for news articles using the active web search provider |
| `websearch_fetchPage` | Fetch the content of a web page using the active web search provider |
| `websearch_deepSearch` | Perform a comprehensive deep search with content fetching |

### Chat Commands

The plugin provides comprehensive chat commands for interactive web search operations. All commands are prefixed with `/websearch`.

| Command | Description |
|---------|-------------|
| `/websearch search <query>` | Perform a general web search |
| `/websearch news <query>` | Search for news articles |
| `/websearch fetch <url>` | Fetch and extract content from a specific web page |
| `/websearch deep <query>` | Perform comprehensive search with content fetching |
| `/websearch provider get` | Display the currently active web search provider |
| `/websearch provider set <name>` | Set the active web search provider by name |
| `/websearch provider select` | Interactively select the active web search provider |
| `/websearch provider reset` | Reset the active web search provider to the initial configured value |

## Usage Examples

### Basic Plugin Registration

```typescript
import { TokenRingApp } from '@tokenring-ai/app';
import websearch from '@tokenring-ai/websearch';

const app = new TokenRingApp({
  config: {
    websearch: {
      providers: {
        serper: {
          type: 'SerperWebSearchProvider'
        },
        scraperapi: {
          type: 'ScraperAPIWebSearchProvider'
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
```

### Service Integration

```typescript
import { WebSearchService } from '@tokenring-ai/websearch';

// Access the service from an agent
const webSearchService = agent.requireServiceByType(WebSearchService);

// Perform a web search
const results = await webSearchService.searchWeb('latest AI research', { 
  num: 10,
  language: 'en',
  countryCode: 'us'
}, agent);

console.log(`Found ${results.organic.length} results`);
```

### Tool Usage

```typescript
// Web search
const articles = await agent.callTool("websearch_searchWeb", {
  query: "artificial intelligence 2024",
  num: 20,
  language: "en",
  countryCode: "us"
});

// News search
const news = await agent.callTool("websearch_searchNews", {
  query: "AI ethics",
  num: 10
});

// Fetch page content
const page = await agent.callTool("websearch_fetchPage", {
  url: "https://example.com/page-with-javascript",
  render: true
});

// Deep search
const deep = await agent.callTool("websearch_deepSearch", {
  query: "machine learning trends",
  searchCount: 15,
  newsCount: 5,
  fetchCount: 3
});
```

### CLI Command Usage

```bash
# Basic web search
/websearch search typescript tutorial

# Location-specific search
/websearch search restaurants --location "New York,US" --country us

# News search
/websearch news cryptocurrency --num 10

# Fetch web page with JavaScript rendering
/websearch fetch https://example.com --render

# Deep search with multiple operations
/websearch deep quantum computing --search 20 --news 5 --fetch 10 --language en --country uk

# Provider management
/websearch provider get
/websearch provider set serper
/websearch provider select
/websearch provider reset
```

### Scripting Function Usage

```javascript
// Available when scripting service is enabled

// Web search
const searchResults = await searchWeb("latest AI research");
// Returns: JSON string with WebSearchResult

// News search
const news = await searchNews("technology news");
// Returns: JSON string with NewsSearchResult

// Fetch page
const markdownContent = await fetchPage("https://example.com");
// Returns: Markdown string

// Deep search
const comprehensive = await deepSearch("machine learning breakthroughs", "15", "5", "3");
// Returns: JSON string with DeepSearchResult
```

### Deep Search with Custom Reranking

```typescript
const webSearchService = agent.requireServiceByType(WebSearchService);

const results = await webSearchService.deepSearch('machine learning', {
  searchCount: 20,
  newsCount: 5,
  fetchCount: 10,
  rerank: async (results) => {
    // Custom reranking logic - prioritize recent results
    return results.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }
}, agent);

console.log(`Found ${results.results.length} web results, ${results.news.length} news results`);
console.log(`Fetched ${results.pages.length} pages`);
```

### Custom Provider Registration

```typescript
import WebSearchProvider, {
  WebSearchResult,
  NewsSearchResult,
  WebPageResult
} from '@tokenring-ai/websearch';
import WebSearchService from '@tokenring-ai/websearch';

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

// Register the provider
app.waitForService(WebSearchService, (websearchService) => {
  websearchService.registerProvider(new CustomSearchProvider(), 'custom');
});
```

## Configuration

### Application Configuration

The plugin requires configuration to enable provider implementations. Configuration is loaded using the `WebSearchConfigSchema`:

```typescript
const config = {
  websearch: {
    providers: {
      "serper": {
        type: "SerperWebSearchProvider",
        apiKey: process.env.SERPER_API_KEY
      },
      "scraperapi": {
        type: "ScraperAPIWebSearchProvider",
        apiKey: process.env.SCRAPERAPI_KEY
      }
    },
    agentDefaults: {
      provider: "serper"  // Default provider for all agents
    }
  }
};
```

**Configuration Schema:**

```typescript
export const WebSearchConfigSchema = z.object({
  providers: z.record(z.string(), z.any()),  // Provider configurations
  agentDefaults: z.object({
    provider: z.string()  // Required default provider
  })
});
```

### Agent Configuration

Individual agents can override the default provider configuration:

```typescript
const agentConfig = {
  websearch: {
    provider: "scraperapi"  // Override default for this agent only
  }
};
```

**Agent Configuration Schema:**

```typescript
export const WebSearchAgentConfigSchema = z.object({
  provider: z.string().optional()
}).default({});
```

## State Management

The package uses `WebSearchState` to manage the active provider per agent:

```typescript
import { WebSearchState } from '@tokenring-ai/websearch';

// Get current active provider
const state = agent.getState(WebSearchState);
console.log('Active provider:', state.provider);
console.log('Initial provider:', state.initialConfig.provider);

// Display state
console.log(state.show()); // ['Active Provider: serper']

// Switch providers
webSearchService.setActiveProvider('scraperapi', agent);

// Reset to initial provider
webSearchService.setActiveProvider(state.initialConfig.provider, agent);
```

**State Serialization:**

The state is automatically serialized and deserialized for persistence:

```typescript
// Serialization
const data = state.serialize(); // { provider: 'serper' | null }

// Deserialization
state.deserialize({ provider: 'scraperapi' });
```

## Integration

### Agent Integration

Agents can access the web search service directly through dependency injection:

```typescript
const webSearchService = agent.requireServiceByType(WebSearchService);
const results = await webSearchService.searchWeb('latest AI research', { num: 10 }, agent);
```

### Scripting Integration

The plugin automatically registers four global scripting functions when the scripting service is available:

- `searchWeb(query: string)`: Performs a web search and returns JSON results as string
- `searchNews(query: string)`: Performs a news search and returns JSON results as string
- `fetchPage(url: string)`: Fetches page markdown content as string
- `deepSearch(query: string, searchCount?, newsCount?, fetchCount?)`: Performs comprehensive deep search and returns JSON results as string

### Provider Integration

This package is designed to work with concrete provider implementations:

- **@tokenring-ai/serper**: Google Search and News via Serper.dev API
- **@tokenring-ai/scraperapi**: Google SERP and News via ScraperAPI
- **Custom Providers**: Extend `WebSearchProvider` abstract class

## Best Practices

1. **Provider Selection**: Configure a default provider in `agentDefaults`, but allow per-agent overrides for specialized tasks

2. **Rate Limit Handling**: Implement proper timeout configurations and handle rate limit errors
   - Set reasonable timeouts for API calls
   - Implement retry logic with exponential backoff in provider implementations

3. **Result Normalization**: While result structures are provider-dependent, implement normalization in consumer code

4. **Security**: Handle API keys and credentials securely
   - Use environment variables for sensitive data
   - Never embed credentials in configuration files

5. **Performance Optimization**:
   - Use `deepSearch` with appropriate result counts
   - Implement caching for frequently accessed content
   - Consider parallel execution for independent operations
   - Deep search already uses `Promise.all()` for web and news searches

6. **Error Handling**:
   - Validate all inputs before API calls
   - Provide clear error messages for troubleshooting
   - Include error context (status codes, hints) for API failures
   - Handle `CommandFailedError` for command operations

7. **Content Respect**:
   - Respect robots.txt and terms of service
   - Implement proper header handling for requests
   - Be mindful of volume limits and avoid excessive requests

8. **Testing**:
   - Test with multiple provider implementations to ensure consistency
   - Mock API responses for testing error conditions
   - Verify timeout and retry logic
   - Test state persistence and restoration

9. **Agent State Management**: Use provider selection to differentiate behavior in different agent contexts

10. **Custom Result Sorting**: Use the `rerank` option in deep search for intelligent result prioritization

11. **Deep Search Optimization**: Set `searchCount` to 0 for news-only searches to avoid irrelevant web results

12. **Provider Registration**: Always register providers before agents attempt to use the service

## Testing and Development

### Running Tests

```bash
bun test                    # Run all tests
bun test:watch              # Run tests in watch mode
bun test:coverage           # Run tests with coverage report
bun build                   # Verify build compiles without errors
```

### Test Structure

Tests use vitest with node environment, following the patterns established in other packages.

### Development Checklist

- [ ] Implement abstract methods in provider
- [ ] Validate all input parameters with Zod schemas
- [ ] Handle API rate limits with appropriate timeouts
- [ ] Implement proper error handling
- [ ] Add unit tests for core functionality
- [ ] Test with actual provider APIs if available
- [ ] Verify agent integration (state management, service access)
- [ ] Document configuration options
- [ ] Provide usage examples

### Package Structure

```
pkg/websearch/
├── index.ts                 # Main exports (WebSearchService, WebSearchProvider, schemas)
├── plugin.ts                # TokenRingPlugin registration
├── WebSearchService.ts      # Core service implementation
├── WebSearchProvider.ts     # Abstract base class definition
├── schema.ts                # Zod schema definitions
├── tools.ts                 # Barrel export for all tools
├── commands.ts              # Chat command exports
├── state/
│   └── webSearchState.ts    # Agent state slice
├── tools/                   # Individual tool implementations
│   ├── searchWeb.ts         # Web search tool (websearch_searchWeb)
│   ├── searchNews.ts        # News search tool (websearch_searchNews)
│   ├── fetchPage.ts         # Page fetch tool (websearch_fetchPage)
│   └── deepSearch.ts        # Deep search tool (websearch_deepSearch)
└── commands/                # Chat command implementations
    └── websearch/
        ├── search.ts        # /websearch search <query>
        ├── news.ts          # /websearch news <query>
        ├── fetch.ts         # /websearch fetch <url>
        ├── deep.ts          # /websearch deep <query>
        └── provider/
            ├── get.ts       # /websearch provider get
            ├── set.ts       # /websearch provider set <name>
            ├── select.ts    # /websearch provider select
            └── reset.ts     # /websearch provider reset
```

## Limitations

- **Abstract Package**: No built-in search engine implementations
  - Requires concrete provider implementations for actual functionality
  - Result structures are provider-dependent; implement normalization in consumer code

- **Rate Limiting**: High-volume fetching may trigger API rate limits
  - Configure appropriate timeouts and retry logic
  - Respect provider constraints

- **Content Type**: Binary/non-text content not supported in page fetch operations

- **Result Deduplication**: No built-in result deduplication or similarity filtering

- **State Persistence**: Agent-level provider selection is maintained in agent state

- **Silent Failures**: Pages that fail to fetch in deep search are silently excluded from results

- **Provider Dependency**: All operations require an active provider to be configured and selected

## Related Components

- **Serper Web Search Provider**: `@tokenring-ai/serper`
- **ScraperAPI Web Search Provider**: `@tokenring-ai/scraperapi`
- **NewsRPM Service**: `pkg/newsrpm` - Alternative news aggregation service
- **@tokenring-ai/agent**: Core agent system for service integration
- **@tokenring-ai/chat**: Chat interface for tools and commands
- **@tokenring-ai/scripting**: Scripting service for native function execution
- **@tokenring-ai/app**: Base application framework with plugin system
- **@tokenring-ai/utility**: Utility functions and KeyedRegistry

## License

MIT License - see the root LICENSE file for details.
