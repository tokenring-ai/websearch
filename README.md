# Websearch Package Documentation

## Overview

The `@tokenring-ai/websearch` package provides an abstract interface for web search operations within the Token Ring AI agent system. It enables the registration and use of pluggable web search providers to perform web searches, news searches, and web page fetching. The package integrates with the `@tokenring-ai/agent` framework, offering tools and chat commands for seamless interaction in agent-based applications. It does not include concrete search engine implementations (e.g., Google, Bing) but defines the contract for such providers to be built upon.

This package acts as a service layer in the larger Token Ring ecosystem, allowing agents to query the web dynamically, process results, and fetch content for tasks like research, data gathering, or real-time information retrieval.

## Installation/Setup

This package is designed to be used within a Token Ring AI project. To include it:

1. Ensure you have the Token Ring agent framework installed:
   ```
   npm install @tokenring-ai/agent
   ```

2. Install this package:
   ```
   npm install @tokenring-ai/websearch
   ```

3. In your agent setup (e.g., in your main application file), import and register the service:
   ```typescript
   import { Agent } from '@tokenring-ai/agent';
   import { WebSearchService } from '@tokenring-ai/websearch';

   const agent = new Agent();
   agent.registerService(new WebSearchService());
   // Register a concrete provider (see Core Components)
   ```

   Note: You must implement and register a concrete `WebSearchProvider` for functionality. The package uses ES modules (`type: module` in package.json).

Dependencies like `zod` for schema validation are automatically installed.

## Package Structure

The package follows a modular structure:

- **WebSearchProvider.ts**: Defines the abstract base class for search providers.
- **WebSearchService.ts**: Core service that manages providers and exposes search APIs.
- **index.ts**: Main entry point exporting the package info, service, and provider.
- **tools.ts**: Exports tool functions for web search, news search, and page fetching.
  - **tools/searchWeb.ts**: Tool for general web searches.
  - **tools/searchNews.ts**: Tool for news-specific searches.
  - **tools/fetchPage.ts**: Tool for fetching web page content.
- **chatCommands.ts**: Exports chat command modules.
  - **chatCommands/websearch.ts**: Implements the `/websearch` command for interactive use.
- **package.json**: Package metadata, dependencies, and exports.

Non-code files include LICENSE (MIT) and this README.md.

## Core Components

### WebSearchProvider (Abstract Class)

This abstract class defines the interface that concrete search providers (e.g., for Google Custom Search, Bing API) must implement. It handles search queries with optional localization and pagination.

- **Key Methods**:
  - `searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>`
    - Performs a general web search.
    - Parameters: `query` (required string), `options` (optional: countryCode, language, location, num results, page, timeout).
    - Returns: `{ results: any }` – Provider-specific result structure (e.g., array of search hits).
  - `searchNews(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>`
    - Performs a news-focused search.
    - Similar to `searchWeb` but tailored for recent news.
  - `fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult>`
    - Fetches the HTML content of a URL.
    - Parameters: `url` (required string), `options` (optional: render for JS execution, countryCode, timeout).
    - Returns: `{ html: string }` – Raw or rendered HTML.

Concrete implementations must extend this class and provide real API calls (e.g., using fetch or a library like Puppeteer for rendering).

### WebSearchService

This class implements the `TokenRingService` interface and serves as the central hub for web search operations. It uses a `KeyedRegistryWithSingleSelection` to manage multiple providers, with one active at a time.

- **Key Methods**:
  - `registerResource(provider: WebSearchProvider, name: string): void` – Registers a provider.
  - `setActiveResource(name: string): void` – Sets the active provider.
  - `getActiveResource(): WebSearchProvider | undefined` – Gets the current active provider.
  - `getAvailableResources(): string[]` – Lists registered provider names.
  - `searchWeb(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>` – Delegates to active provider.
  - `searchNews(query: string, options?: WebSearchProviderOptions): Promise<WebSearchResult>` – Delegates to active provider.
  - `fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult>` – Delegates to active provider.

Interactions: Register providers during agent initialization, then use service methods in agent logic or tools. Errors are propagated from the active provider.

### Tools

Tools are executable functions integrated with the agent framework. They wrap service calls and include input validation via Zod schemas.

- **searchWeb**: Executes a web search. Input schema validates query and options. Logs progress and returns `{ results?: any }`.
- **searchNews**: Similar to searchWeb but for news. Returns news results.
- **fetchPage**: Fetches page HTML. Validates URL; supports rendering. Returns `{ html: string }`.

These tools can be invoked by agents for automated tasks.

### Chat Commands

- **/websearch**: Interactive command for users in chat interfaces.
  - Subcommands: `search <query>`, `news <query>`, `fetch <url>`, `provider`.
  - Supports flags like `--country`, `--num`, `--render`.
  - Displays results or provider status in chat. Uses `parseArgs` for option parsing.

## Usage Examples

### 1. Registering a Provider and Basic Search
Assume a concrete provider `GoogleSearchProvider` extending `WebSearchProvider`.

```typescript
import { Agent } from '@tokenring-ai/agent';
import { WebSearchService } from '@tokenring-ai/websearch';
import { GoogleSearchProvider } from './providers/GoogleSearchProvider'; // Hypothetical

const agent = new Agent();
const webSearchService = new WebSearchService();
agent.registerService(webSearchService);

const googleProvider = new GoogleSearchProvider({ apiKey: 'your-key' });
webSearchService.registerResource(googleProvider, 'google');
webSearchService.setActiveResource('google');

// Perform a search
const results = await webSearchService.searchWeb('Token Ring AI', { num: 5 });
console.log(results.results); // e.g., [{ title: '...', url: '...', snippet: '...' }]
```

### 2. Using a Tool in an Agent Task
```typescript
import { searchWeb } from '@tokenring-ai/websearch/tools/searchWeb';
import { Agent } from '@tokenring-ai/agent';

// In agent execution context
const searchResults = await searchWeb.execute(
  { query: 'latest AI news', num: 3 },
  agent
);
agent.chat.infoLine(`Found: ${JSON.stringify(searchResults.results)}`);
```

### 3. Chat Command Example
In a chat interface:
```
/websearch search "web search APIs" --num 10 --language en
```
This searches the web, displays results in chat (truncated to 500 chars).

## Configuration Options

- **Search Options** (WebSearchProviderOptions): `countryCode` (e.g., 'US'), `language` (e.g., 'en'), `location` (e.g., 'New York,US'), `num` (positive int, default provider-specific), `page` (positive int), `timeout` (ms).
- **Page Fetch Options** (WebPageOptions): `render` (boolean, for JS-heavy sites), `countryCode`, `timeout`.
- **Provider Management**: Use registry methods to switch providers dynamically.
- No environment variables defined; configure via provider constructors (e.g., API keys).

## API Reference

- **WebSearchService**:
  - `searchWeb(query: string, options?: WebSearchProviderOptions): Promise<{ results: any }>`
  - `searchNews(query: string, options?: WebSearchProviderOptions): Promise<{ results: any }>`
  - `fetchPage(url: string, options?: WebPageOptions): Promise<{ html: string }>`
  - `registerResource(provider: WebSearchProvider, name: string): void`
  - `setActiveResource(name: string): void`
  - `getActiveResource(): WebSearchProvider | undefined`
  - `getAvailableResources(): string[]`

- **Tools** (e.g., `searchWeb.execute(params: { query: string, ... }, agent: Agent): Promise<{ results?: any }>` – See individual schemas for params.

- **Chat Command**: `/websearch [action] <query/url> [flags]` – See help output for details.

Interfaces: `WebSearchProviderOptions`, `WebSearchResult`, `WebPageOptions`, `WebPageResult` (defined in WebSearchProvider.ts).

## Dependencies

- `@tokenring-ai/agent` (^0.1.0): Core agent framework and types.
- `zod` (^4.0.17): Schema validation for tool inputs.

Internal utilities like `KeyedRegistryWithSingleSelection` from `@tokenring-ai/utility`.

## Contributing/Notes

- **Implementing Providers**: Extend `WebSearchProvider` with concrete APIs. Handle errors gracefully (e.g., rate limits, invalid queries). Ensure results are normalized if possible.
- **Testing**: No tests included; add unit tests for tools/service and integration tests with mock providers.
- **Building**: As an ESM package, build with TypeScript (tsconfig targets ES2022+). No build step needed for direct use.
- **Limitations**: Abstract only—no built-in providers or error handling beyond delegation. Results structure is provider-dependent (use `any` for flexibility). Binary/ non-text content not supported in fetches. For production, add authentication, caching, and compliance (e.g., robots.txt).
- **License**: MIT. Contributions welcome via pull requests; focus on new providers or enhancements to the interface.