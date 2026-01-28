import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition, type TokenRingToolJSONResult} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import WebSearchService from "../WebSearchService.js";

const name = "websearch_deepSearch";
const displayName = "Websearch/deepSearch";

async function execute(
  {
    query,
    searchCount,
    newsCount,
    fetchCount,
    countryCode,
    language,
    location,
  }: z.output<typeof inputSchema>,
  agent: Agent,
): Promise<TokenRingToolJSONResult<{ results: any[], news: any[], pages: Array<{ url: string; markdown: string }> }>> {
  const webSearch = agent.requireServiceByType(WebSearchService);

  agent.infoMessage(`[${name}] Deep searching: ${query} (search: ${searchCount ?? 10}, news: ${newsCount ?? 0}, fetch: ${fetchCount ?? 5})`);
  return {
    type: "json",
    data: await webSearch.deepSearch(query, {
      searchCount,
      newsCount,
      fetchCount,
      countryCode,
      language,
      location,
    }, agent)
  };
}

const description = "Perform a deep search: search the web, then fetch and return full page content for top results";

const inputSchema = z.object({
  query: z.string().min(1).describe("A short search query to perform"),
  searchCount: z.number().int().positive().optional().describe("Number of general search results links to include. Should be set to 0 or a low number if the search is for news"),
  newsCount: z.number().int().positive().optional().describe("Number of news articles to search for"),
  fetchCount: z.number().int().positive().optional().describe("Number of pages to fetch full page content for(default: 5)"),
  countryCode: z.string().optional().describe("Country code"),
  language: z.string().optional().describe("Language code"),
  location: z.string().optional().describe("Location string"),
});

export default {
  name, displayName, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
