import type Agent from "@tokenring-ai/agent/Agent";
import type { TokenRingToolDefinition, TokenRingToolResult } from "@tokenring-ai/chat/schema";
import { z } from "zod";
import WebSearchService from "../WebSearchService.ts";

const name = "websearch_searchWeb";
const displayName = "Websearch/searchWeb";

async function execute({ query, countryCode, language, location, num, page }: z.output<typeof inputSchema>, agent: Agent): Promise<TokenRingToolResult> {
  const webSearch = agent.requireServiceByType(WebSearchService);

  agent.infoMessage(`[${name}] Searching: ${query}`);
  const data = await webSearch.searchWeb(
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

const description = "Search the web using the active web search provider";

const inputSchema = z.object({
  query: z.string().min(1).describe("Search query"),
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
