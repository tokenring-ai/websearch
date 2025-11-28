import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {parseArgs} from "node:util";
import WebSearchService from "../WebSearchService.js";

const description = "/websearch - Web search operations";

const help: string = `# WEB SEARCH COMMAND HELP

## Usage

/websearch <action> <query> [options]

## ACTIONS

### search <query>

Perform a general web search
- Returns web search results with titles, URLs, and descriptions
- Supports all location and language options

**Example:**
/websearch search typescript tutorial

### news <query>

Search for news articles
- Returns current news results with sources and dates
- Great for staying updated on topics

**Example:**
/websearch news artificial intelligence

### fetch <url>

Fetch and extract content from a specific web page
- Renders JavaScript content if --render flag is used
- Returns markdown-formatted content

**Example:**
/websearch fetch https://example.com

### deep <query>

Perform comprehensive search with content fetching
- Combines search and fetch operations in one command
- Configurable number of search, news, and fetch results

**Example:**
/websearch deep quantum computing --search 10 --fetch 3

### provider [name]

Manage search providers
- Without name: Show active and available providers
- With name: Set active provider (if available)

**Examples:**
/websearch provider
/websearch provider tavily

## OPTIONS

### General Options (search, news, deep)

- **--country <code>** - Country code for localized results (e.g., 'us', 'uk', 'de')
- **--language <code>** - Language code for content (e.g., 'en', 'es', 'fr')
- **--location <name>** - Location name for geo-targeted results
- **--num <n>** - Number of results to return (default: varies by action)
- **--page <n>** - Page number for pagination

### Fetch-specific Options

- **--render** - Enable JavaScript rendering for dynamic content

### Deep-specific Options

- **--search <n>** - Number of web search results (default: 10)
- **--news <n>** - Number of news results (default: 0)
- **--fetch <n>** - Number of pages to fetch (default: 5)

## EXAMPLES

# Basic Search
/websearch search machine learning basics

# News Search with Limit
/websearch news cryptocurrency --num 5

# Location-specific Search
/websearch search restaurants --location 'New York' --country us

# Fetch Web Page
/websearch fetch https://developer.mozilla.org/en-US/docs/Web/JavaScript

# Fetch with JavaScript Rendering
/websearch fetch https://example.com --render

# Comprehensive Deep Search
/websearch deep artificial intelligence --search 20 --news 5 --fetch 10

# Deep Search with Localization
/websearch deep climate change --search 15 --news 3 --fetch 5 --language en --country uk

# View Providers
/websearch provider

# Set Provider
/websearch provider tavily

## NOTES

- All search operations respect rate limits and may take a few seconds
- Deep search is resource-intensive - use reasonable limits
- Provider availability depends on your agent configuration
- Country codes follow ISO 3166-1 alpha-2 standard
- Language codes follow ISO 639-1 standard

For more information, use /websearch provider to see available search providers.`;

interface WebSearchArgs {
  flags: {
    country?: string;
    language?: string;
    location?: string;
    num?: number;
    page?: number;
    render?: boolean;
    search?: number;
    news?: number;
    fetch?: number;
  }
  rest: string[];
}

function parseWebSearchArgs(args: string[]): WebSearchArgs {
  const {values, positionals} = parseArgs({
    args,
    options: {
      country: {type: 'string'},
      language: {type: 'string'},
      location: {type: 'string'},
      num: {type: 'string'},
      page: {type: 'string'},
      render: {type: 'boolean'},
      search: {type: 'string'},
      news: {type: 'string'},
      fetch: {type: 'string'}
    },
    allowPositionals: true,
    strict: false
  });

  const flags: WebSearchArgs["flags"] = {};

  if (values.country) flags.country = values.country as string;
  if (values.language) flags.language = values.language as string;
  if (values.location) flags.location = values.location as string;
  if (values.num) flags.num = Number(values.num);
  if (values.page) flags.page = Number(values.page);
  if (values.render) flags.render = values.render as boolean;
  if (values.search) flags.search = Number(values.search);
  if (values.news) flags.news = Number(values.news);
  if (values.fetch) flags.fetch = Number(values.fetch);

  return {flags, rest: positionals};
}

async function execute(remainder: string, agent: Agent): Promise<void> {

  const webSearch = agent.requireServiceByType(WebSearchService);

  const [sub, ...rest] = remainder.trim().split(/\s+/);
  if (!sub) {
    agent.infoLine(help);
    return;
  }

  const {flags, rest: queryParts} = parseWebSearchArgs(rest);
  const query = queryParts.join(" ");

  if (sub === "search") {
    if (!query) {
      agent.errorLine("Usage: /websearch search <query> [flags]");
      return;
    }
    const result = await webSearch.searchWeb(query, {
      countryCode: flags.country,
      language: flags.language,
      location: flags.location,
      num: flags.num as number,
      page: flags.page as number,
    });
    agent.infoLine(`Search results: ${JSON.stringify(result).slice(0, 500)}...`);
  } else if (sub === "news") {
    if (!query) {
      agent.errorLine("Usage: /websearch news <query> [flags]");
      return;
    }
    const result = await webSearch.searchNews(query, {
      countryCode: flags.country,
      language: flags.language,
      location: flags.location,
      num: flags.num as number,
      page: flags.page as number,
    });
    agent.infoLine(`News results: ${JSON.stringify(result).slice(0, 500)}...`);
  } else if (sub === "fetch") {
    if (!query) {
      agent.errorLine("Usage: /websearch fetch <url> [flags]");
      return;
    }
    const result = await webSearch.fetchPage(query, {
      render: !!flags.render,
      countryCode: flags.country,
    });
    agent.infoLine(`Fetched ${result.markdown.length} characters`);
  } else if (sub === "deep") {
    if (!query) {
      agent.errorLine("Usage: /websearch deep <query> [flags]");
      return;
    }
    const result = await webSearch.deepSearch(query, {
      searchCount: flags.search,
      newsCount: flags.news,
      fetchCount: flags.fetch,
      countryCode: flags.country,
      language: flags.language,
      location: flags.location,
    });
    agent.infoLine(`Deep search: ${result.results.length} web results, ${result.news.length} news results, ${result.pages.length} pages fetched`);
    result.pages.forEach((p, i) => agent.infoLine(`  [${i + 1}] ${p.url} (${p.markdown.length} chars)`));
  } else if (sub === "provider") {
    if (query) {
      const available = webSearch.getAvailableProviders();
      if (available.includes(query)) {
        webSearch.setActiveProvider(query);
        agent.infoLine(`Provider set to: ${query}`);
      } else {
        agent.errorLine(`Provider '${query}' not available. Available: ${available.join(", ")}`);
      }
    } else {
      const active = webSearch.getActiveProvider();
      const available = webSearch.getAvailableProviders();
      agent.infoLine(`Active provider: ${active || "none"}`);
      agent.infoLine(`Available providers: ${available.join(", ")}`);
    }
  } else {
    agent.infoLine("Unknown action. Use: search, news, fetch, deep, provider");
  }
}

export default {
  description,
  execute,
  help,
} as TokenRingAgentCommand