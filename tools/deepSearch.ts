import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/types";
import {z} from "zod";
import WebSearchService from "../WebSearchService.js";

const name = "websearch/deepSearch";

async function execute(
  {
    query,
    searchCount,
    newsCount,
    fetchCount,
    countryCode,
    language,
    location,
  }: z.infer<typeof inputSchema>,
  agent: Agent,
): Promise<{ results: any[], news: any[], pages: Array<{ url: string; markdown: string }> }> {
  const webSearch = agent.requireServiceByType(WebSearchService);

  if (!query) {
    throw new Error(`[${name}] query is required`);
  }

  agent.infoLine(`[${name}] Deep searching: ${query} (search: ${searchCount ?? 10}, news: ${newsCount ?? 0}, fetch: ${fetchCount ?? 5})`);
  return await webSearch.deepSearch(query, {
    searchCount,
    newsCount,
    fetchCount,
    countryCode,
    language,
    location,
  });
}

const description = "Perform a deep search: search the web, then fetch and return full page content for top results";

const inputSchema = z.object({
  query: z.string().min(1).describe("A short search query to perform"),
  searchCount: z.number().int().positive().describe("Number of general search results links to include. Should be set to 0 or a low number if the search is for news"),
  newsCount: z.number().int().positive().describe("Number of news articles to search for"),
  fetchCount: z.number().int().positive().optional().describe("Number of pages to fetch full page content for(default: 5)"),
  countryCode: z.string().optional().describe("Country code"),
  language: z.string().optional().describe("Language code"),
  location: z.string().optional().describe("Location string"),
});

export default {
  name, description, inputSchema, execute,
} as TokenRingToolDefinition<typeof inputSchema>;
