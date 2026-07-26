# @tokenring-ai/websearch

## Overview

The `@tokenring-ai/websearch` package provides a comprehensive web search interface for the Token Ring AI ecosystem. It serves as an abstract service layer that enables agents to query the web dynamically, process search results, and fetch content for tasks like research, data gathering, and real-time information retrieval.

As a core abstract interface package, it defines the contract that concrete search provider implementations must follow. It integrates seamlessly with the Token Ring framework through its plugin system, offering:

- **Four interactive tools** for agent operations (`websearch_searchWeb`, `websearch_searchNews`, `websearch_fetchPage`, `websearch_deepSearch`)
- **Eight chat commands** for interactive CLI operations (`/websearch` with subcommands)
- **Four global scripting functions** accessible through the scripting service
- **Service layer integration** with provider registry and state management
- **Deep search with custom reranking** for advanced result processing

## Features

- **Abstract Provider Interface**: Defines the contract for search providers to implement
- **Multi-Provider Support**: Registry system for managing multiple search provider implementations
- **Comprehensive Search Operations**: Web search, news search, page fetching, and deep search
- **Agent State Management**: Persistent provider selection per agent via `WebSearchState`
- **Interactive Tools**: Four agent-usable tools with Zod schema validation
- **CLI Commands**: Full-featured `/websearch` command with 8 subcommands
- **Scripting Functions**: Global functions for LLM access to search capabilities
- **Configurable Options**: Country/region targeting, language localization, pagination
- **Deep Search with Reranking**: Custom result sorting support via optional `rerank` function
- **Parallel Execution**: Deep search executes web and news searches in parallel for performance

## Installation

```bash
bun add @tokenring-ai/websearch
```

## Dependencies

- `@tokenring-ai/app`: workspace:*
- `@tokenring-ai/agent`: workspace:*
- `@tokenring-ai/chat`: workspace:*
- `@tokenring-ai/utility`: workspace:*
- `@tokenring-ai/scripting`: workspace:*
- `zod`: ^4.4.3

## Chat Commands

| Command                          | Description                                                          |
|----------------------------------|----------------------------------------------------------------------|
| `/websearch search <query>`      | Perform a general web search                                         |
| `/websearch news <query>`        | Search for news articles                                             |
| `/websearch fetch <url>`         | Fetch and extract content from a specific web page                   |
| `/websearch deep <query>`        | Perform comprehensive search with content fetching                   |
| `/websearch provider get`        | Display the currently active web search provider                     |
| `/websearch provider set <name>` | Set the active web search provider by name                           |
| `/websearch provider select`     | Interactively select the active web search provider                  |
| `/websearch provider reset`      | Reset the active web search provider to the initial configured value |

## Tools

| Tool Name              | Description                                                                  |
|------------------------|------------------------------------------------------------------------------|
| `websearch_searchWeb`  | Search the web using the active web search provider                          |
| `websearch_searchNews` | Search news using the active web search provider                             |
| `websearch_fetchPage`  | Fetch a web page using the active web search provider                        |
| `websearch_deepSearch` | Perform a deep search: search the web, then fetch and return full page content for top results |

## Configuration

### Application Configuration

The plugin configuration is loaded using the `WebSearchConfigSchema`:

```typescript
const config = {
  websearch: {
    agentDefaults: {
      provider: "serper"  // Default provider for all agents
    }
  }
};
```

**Configuration Schema:**

```typescript
export const WebSearchConfigSchema = z
  .object({
    agentDefaults: z
      .object({
        provider: z.string().exactOptional().meta({ description: "Search provider new agents use by default (e.g. serper)" }),
      })
      .prefault({})
      .meta({ label: "Agent Defaults" }),
  })
  .prefault({})
  .meta({ label: "Web Search", description: "Web search access for agents" });
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
export const WebSearchAgentConfigSchema = z
  .object({
    provider: z.string().exactOptional(),
  })
  .default({});
```

## License

MIT License - see LICENSE file for details.
