import type { AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand } from "@tokenring-ai/agent/types";
import WebSearchService from "../../WebSearchService.ts";

const inputSchema = {
  args: {
    country: {
      type: "string",
      description: "Country code for the search, for example us or uk",
    },
    language: {
      type: "string",
      description: "Language code for the search, for example en or fr",
    },
    location: {
      type: "string",
      description: "Location for geo-targeted results",
    },
    num: { type: "number", description: "Number of results to request" },
    page: { type: "number", description: "Result page number" },
  },
  remainder: { name: "query", description: "Search query", required: true },
} as const satisfies AgentCommandInputSchema;

async function execute({ remainder, args, agent }: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  const result = await agent.requireServiceByType(WebSearchService).searchWeb(
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

  return `Search results: ${JSON.stringify(result).slice(0, 500)}...`;
}

export default {
  name: "websearch search",
  description: "Perform a web search",
  help: `Perform a general web search.

## Options

--country <code>   Country code (e.g. us, uk)
--language <code>  Language code (e.g. en, fr)
--location <name>  Location for geo-targeted results
--num <n>          Number of results
--page <n>         Page number

## Example

/websearch search typescript tutorial
/websearch search --location "New York" --country us restaurants`,
  inputSchema,
  execute,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
