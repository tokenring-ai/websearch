import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import createSubcommandRouter from "@tokenring-ai/agent/util/subcommandRouter";
import {deep} from "./websearch/deep.ts";
import {fetch} from "./websearch/fetch.ts";
import {news} from "./websearch/news.ts";
import provider from "./websearch/provider.ts";
import {search} from "./websearch/search.ts";

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

### provider get

Display the currently active web search provider
- Shows which provider is currently selected

**Example:**
/websearch provider get

### provider set <name>

Set a specific web search provider by name
- Directly sets the active provider without interactive selection
- Validates that the provider exists

**Example:**
/websearch provider set tavily

### provider select

Select an active web search provider interactively
- Opens a selection interface to choose from available providers
- Auto-selects if only one provider is configured
- Shows current active provider in the list

**Example:**
/websearch provider select

### provider reset

Reset to the initial configured web search provider
- Restores the provider from initial configuration
- Useful for returning to default settings

**Example:**
/websearch provider reset

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
/websearch provider get

# Select Provider Interactively
/websearch provider select

# Set Provider
/websearch provider set tavily

# Reset Provider
/websearch provider reset

## NOTES

- All search operations respect rate limits and may take a few seconds
- Deep search is resource-intensive - use reasonable limits
- Provider availability depends on your agent configuration
- Country codes follow ISO 3166-1 alpha-2 standard
- Language codes follow ISO 639-1 standard

For more information, use /websearch provider to see available search providers.`;

const execute = createSubcommandRouter({
  search,
  news,
  fetch,
  deep,
  provider
});

export default {
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand