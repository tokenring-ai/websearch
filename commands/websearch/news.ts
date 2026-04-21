import type { AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand } from "@tokenring-ai/agent/types";
import WebSearchService from "../../WebSearchService.ts";

const inputSchema = {
  args: {
    country: { type: "string", description: "Country code for the search" },
    language: {
      type: "string",
      description: "Language code for the search",
    },
    location: {
      type: "string",
      description: "Location for geo-targeted results",
    },
    num: { type: "number", description: "Number of results to request" },
    page: { type: "number", description: "Result page number" },
  },
  remainder: { name: "query", description: "News query", required: true },
} as const satisfies AgentCommandInputSchema;

async function execute({ remainder, args, agent }: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  const result = await agent.requireServiceByType(WebSearchService).searchNews(
    remainder,
    {
      countryCode: args.country,
      language: args.language,
      location: args.location,
      num: args.num,
      page: args.page,
    },
    agent,
  );

  return `News results: ${JSON.stringify(result).slice(0, 500)}...`;
}

export default {
  name: "websearch news",
  description: "Search for news articles",
  help: `Search for news articles.

## Options

--country <code>   Country code
--language <code>  Language code
--location <name>  Location for geo-targeted results
--num <n>          Number of results
--page <n>         Page number

## Example

/websearch news artificial intelligence
/websearch news --num 5 cryptocurrency`,
  inputSchema,
  execute,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
