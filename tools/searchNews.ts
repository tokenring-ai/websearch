import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import {NewsSearchResult} from "../WebSearchProvider.ts";
import WebSearchService from "../WebSearchService.js";

const name = "websearch_searchNews";
const displayName = "Websearch/searchNews";

async function execute(
  {
    query,
    countryCode,
    language,
    location,
    num,
    page,
  }: z.infer<typeof inputSchema>,
  agent: Agent,
): Promise<NewsSearchResult> {

  const webSearch = agent.requireServiceByType(WebSearchService);

  if (!query) {
    throw new Error(`[${name}] query is required`);
  }

  agent.infoMessage(`[${name}] Searching news: ${query}`);
  return await webSearch.searchNews(query, {
    countryCode,
    language,
    location,
    num,
    page,
  }, agent);
}

const description = "Search news using the active web search provider";

const inputSchema = z.object({
  query: z.string().min(1).describe("News search query"),
  countryCode: z.string().optional().describe("Country code"),
  language: z.string().optional().describe("Language code"),
  location: z.string().optional().describe("Location string"),
  num: z.number().int().positive().optional().describe("Number of results"),
  page: z.number().int().positive().optional().describe("Page number"),
});

export default {
  name, displayName, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;