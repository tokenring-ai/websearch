import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import WebSearchService from "../../WebSearchService.ts";

const inputSchema = {
  args: {
    "country": {type: "string", description: "Country code for the search"},
    "language": {
      type: "string",
      description: "Language code for the search",
    },
    "location": {
      type: "string",
      description: "Location for geo-targeted results",
    },
    "search": {
      type: "number",
      description: "Number of web search results to collect",
    },
    "news": {
      type: "number",
      description: "Number of news results to collect",
    },
    "fetch": {
      type: "number",
      description: "Number of result pages to fetch",
    },
  },
  remainder: {
    name: "query",
    description: "Deep search query",
    required: true,
  },
} as const satisfies AgentCommandInputSchema;

async function execute({
                         remainder,
                         args,
                         agent,
                       }: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  const searchOptions = {
    searchCount: args.search,
    newsCount: args.news,
    fetchCount: args.fetch,
    countryCode: args.country,
    language: args.language,
    location: args.location,
  };

  const result = await agent
    .requireServiceByType(WebSearchService)
    .deepSearch(remainder, searchOptions, agent);

  const optionsList = [
    searchOptions.searchCount
      ? `**Search Count:** ${searchOptions.searchCount}`
      : "",
    searchOptions.newsCount ? `**News Count:** ${searchOptions.newsCount}` : "",
    searchOptions.fetchCount
      ? `**Fetch Count:** ${searchOptions.fetchCount}`
      : "",
    searchOptions.countryCode
      ? `**Country:** ${searchOptions.countryCode}`
      : "",
    searchOptions.language ? `**Language:** ${searchOptions.language}` : "",
    searchOptions.location ? `**Location:** ${searchOptions.location}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const resultsList = [
    result.results.length > 0
      ? `### Web Results (${result.results.length})\n${result.results.map((r, i) => `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.snippet}`).join("\n\n")}`
      : "",
    result.news.length > 0
      ? `### News Results (${result.news.length})\n${result.news.map((n, i) => `${i + 1}. ${n.title}\n   ${n.link}\n   ${n.snippet}`).join("\n\n")}`
      : "",
    result.pages.length > 0
      ? `### Fetched Pages (${result.pages.length})\n${result.pages.map((p, i) => `${i + 1}. [${p.url}](${p.url}) (${p.markdown.length} characters)`).join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  agent.artifactOutput({
    name: `Deep search for ${remainder}`,
    encoding: "text",
    mimeType: "text/markdown",
    body: `# Deep Search: ${remainder}\n\n## Search Options\n${optionsList || "No specific options provided"}\n\n## Results\n${resultsList || "No results found"}`,
  });

  return `Deep search: ${result.results.length} web results, ${result.news.length} news results, ${result.pages.length} pages fetched`;
}

export default {
  name: "websearch deep",
  description: "Comprehensive search with content fetching",
  help: `Perform a comprehensive search combining web search, news, and page fetching.

## Options

--search <n>       Number of web search results (default: 10)
--news <n>         Number of news results (default: 0)
--fetch <n>        Number of pages to fetch (default: 5)
--country <code>   Country code
--language <code>  Language code
--location <name>  Location for geo-targeted results

## Example

/websearch deep quantum computing
/websearch deep --search 20 --news 5 --fetch 10 artificial intelligence`,
  inputSchema,
  execute,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
