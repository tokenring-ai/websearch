import Agent from "@tokenring-ai/agent/Agent";
import {z} from "zod";
import WebSearchService from "../WebSearchService.js";

export const name = "websearch/searchNews";

export async function execute(
  {
    query,
    countryCode,
    language,
    location,
    num,
    page,
  }: {
    query?: string;
    countryCode?: string;
    language?: string;
    location?: string;
    num?: number;
    page?: number;
  },
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

export const description = "Search news using the active web search provider";

export const inputSchema = z.object({
  query: z.string().min(1).describe("News search query"),
  countryCode: z.string().optional().describe("Country code"),
  language: z.string().optional().describe("Language code"),
  location: z.string().optional().describe("Location string"),
  num: z.number().int().positive().optional().describe("Number of results"),
  page: z.number().int().positive().optional().describe("Page number"),
});