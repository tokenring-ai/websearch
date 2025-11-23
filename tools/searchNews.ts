import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/types";
import {z} from "zod";
import WebSearchService from "../WebSearchService.js";

const name = "websearch/searchNews";

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
): Promise<{ results?: any }> {

  const webSearch = agent.requireServiceByType(WebSearchService);

  if (!query) {
    throw new Error(`[${name}] query is required`);
  }

  agent.infoLine(`[${name}] Searching news: ${query}`);
  const result = await webSearch.searchNews(query, {
    countryCode,
    language,
    location,
    num,
    page,
  });
  return {results: result.results};
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
  name, description, inputSchema, execute,
} as TokenRingToolDefinition<typeof inputSchema>;