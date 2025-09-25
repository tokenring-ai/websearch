import Agent from "@tokenring-ai/agent/Agent";
import {z} from "zod";
import WebSearchService from "../WebSearchService.js";

export const name = "websearch/fetchPage";

export async function execute(
  {
    url,
    render,
    countryCode
  }: {
    url?: string;
    render?: boolean;
    countryCode?: string;
  },
  agent: Agent,
): Promise<{ html: string }> {
  
  const webSearch = agent.requireServiceByType(WebSearchService);

  if (!url) {
    throw new Error(`[${name}] url is required`);
  }

  agent.infoLine(`[${name}] Fetching: ${url}`);
  const result = await webSearch.fetchPage(url, {
    render,
    countryCode
  });
  return {html: result.html};
}

export const description = "Fetch a web page using the active web search provider";

export const inputSchema = z.object({
  url: z.string().url().describe("URL to fetch"),
  render: z.boolean().optional().describe("Enable JavaScript rendering"),
  countryCode: z.string().optional().describe("Country code"),
});