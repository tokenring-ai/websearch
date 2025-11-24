import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/types";
import {z} from "zod";
import WebSearchService from "../WebSearchService.js";

const name = "websearch/fetchPage";

async function execute(
  {
    url,
    render,
    countryCode
  }: z.infer<typeof inputSchema>,
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

const description = "Fetch a web page using the active web search provider";

const inputSchema = z.object({
  url: z.string().describe("URL to fetch"),
  render: z.boolean().optional().describe("Enable JavaScript rendering"),
  countryCode: z.string().optional().describe("Country code"),
});

export default {
  name, description, inputSchema, execute,
} as TokenRingToolDefinition<typeof inputSchema>;