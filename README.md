# @token-ring/websearch

Abstract web search service interface for the Token Ring ecosystem. This package provides a unified interface for web search operations that can be implemented by different providers (ScraperAPI, Serper, etc.).

## Core Components

### WebSearchResource (Abstract Base Class)

The abstract `WebSearchResource` class defines a standardized interface for web search operations. Concrete implementations should extend this class.

**Key Methods:**
- `searchWeb(query: string, options?: WebSearchOptions): Promise<WebSearchResult>` - Search the web
- `searchNews(query: string, options?: WebSearchOptions): Promise<WebSearchResult>` - Search news
- `fetchPage(url: string, options?: WebPageOptions): Promise<WebPageResult>` - Fetch a web page

### WebSearchService

Manages multiple web search resources and provides a unified interface for web search operations.

### Tools

- **`searchWeb`** - Search the web using the active provider
- **`searchNews`** - Search news using the active provider  
- **`fetchPage`** - Fetch a web page using the active provider

### Chat Command

- **`/websearch`** - Web search operations from the CLI

## Usage

Concrete implementations (e.g., ScraperAPI, Serper) should extend `WebSearchResource` and implement the abstract methods. The service automatically manages provider selection and delegation.

## Examples

```
/websearch search typescript tutorial
/websearch news artificial intelligence --num 5
/websearch fetch https://example.com --render
/websearch provider
```