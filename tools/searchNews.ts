import type Agent from "@tokenring-ai/agent/Agent";
import type { TokenRingToolDefinition, TokenRingToolResult } from "@tokenring-ai/chat/schema";
import { z } from "zod";
import WebSearchService from "../WebSearchService.ts";

const name = "websearch_searchNews";
const displayName = "Websearch/searchNews";

async function execute({ query, countryCode, language, location, num, page }: z.output<typeof inputSchema>, agent: Agent): Promise<TokenRingToolResult> {
  const webSearch = agent.requireServiceByType(WebSearchService);

  agent.infoMessage(`[${name}] Searching news: ${query}`);
  const data = await webSearch.searchNews(
    query,
    {
      countryCode,
      language,
      location,
      num,
      page,
    },
    agent,
  );
  return JSON.stringify(data);
}

const description = "Search news using the active web search provider";

const inputSchema = z.object({
  query: z.string().min(1).describe("News search query"),
  countryCode: z.string().exactOptional().describe("Country code"),
  language: z.string().exactOptional().describe("Language code"),
  location: z.string().exactOptional().describe("Location string"),
  num: z.number().int().positive().exactOptional().describe("Number of results"),
  page: z.number().int().positive().exactOptional().describe("Page number"),
});

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
