import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition, type TokenRingToolJSONResult} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import WebSearchService from "../WebSearchService.js";

const name = "websearch_fetchPage";
const displayName = "Websearch/fetchPage";

async function execute(
  {
    url,
    render,
    countryCode
  }: z.output<typeof inputSchema>,
  agent: Agent,
): Promise<TokenRingToolJSONResult<{ markdown: string, metadata?: Record<string, any> }>> {

  const webSearch = agent.requireServiceByType(WebSearchService);

  agent.infoMessage(`[${name}] Fetching: ${url}`);
  const result = await webSearch.fetchPage(url, {
    render,
    countryCode
  }, agent);
  return {
    type: "json",
    data: {markdown: result.markdown}
  };
}

const description = "Fetch a web page using the active web search provider";

const inputSchema = z.object({
  url: z.string().describe("URL to fetch"),
  render: z.boolean().optional().describe("Enable JavaScript rendering"),
  countryCode: z.string().optional().describe("Country code"),
});

export default {
  name, displayName, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;