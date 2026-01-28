import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition, type TokenRingToolJSONResult} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import {WebSearchResult} from "../WebSearchProvider.ts";
import WebSearchService from "../WebSearchService.js";

const name = "websearch_searchWeb";
const displayName = "Websearch/searchWeb";

async function execute(
  {
    query,
    countryCode,
    language,
    location,
    num,
    page,
  }: z.output<typeof inputSchema>,
  agent: Agent,
): Promise<TokenRingToolJSONResult<WebSearchResult>> {
  const webSearch = agent.requireServiceByType(WebSearchService);

  agent.infoMessage(`[${name}] Searching: ${query}`);
  return {
    type: "json",
    data: await webSearch.searchWeb(query, {
    countryCode,
    language,
    location,
    num,
    page,
  }, agent)
  };
}

const description = "Search the web using the active web search provider";

const inputSchema = z.object({
  query: z.string().min(1).describe("Search query"),
  countryCode: z.string().optional().describe("Country code"),
  language: z.string().optional().describe("Language code"),
  location: z.string().optional().describe("Location string"),
  num: z.number().int().positive().optional().describe("Number of results"),
  page: z.number().int().positive().optional().describe("Page number"),
});

export default {
  name, displayName, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;