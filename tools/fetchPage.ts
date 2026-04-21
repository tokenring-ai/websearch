import type Agent from "@tokenring-ai/agent/Agent";
import type { TokenRingToolDefinition, TokenRingToolResult } from "@tokenring-ai/chat/schema";
import { z } from "zod";
import WebSearchService from "../WebSearchService.ts";

const name = "websearch_fetchPage";
const displayName = "Websearch/fetchPage";

async function execute({ url, render, countryCode }: z.output<typeof inputSchema>, agent: Agent): Promise<TokenRingToolResult> {
  const webSearch = agent.requireServiceByType(WebSearchService);

  agent.infoMessage(`[${name}] Fetching: ${url}`);
  const result = await webSearch.fetchPage(
    url,
    {
      render,
      countryCode,
    },
    agent,
  );
  return result.markdown;
}

const description = "Fetch a web page using the active web search provider";

const inputSchema = z.object({
  url: z.string().describe("URL to fetch"),
  render: z.boolean().exactOptional().describe("Enable JavaScript rendering"),
  countryCode: z.string().exactOptional().describe("Country code"),
});

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
