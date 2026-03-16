import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import WebSearchService from "../../WebSearchService.js";

const inputSchema = {
  args: {
    "--country": {type: "string", description: "Country code to use for the fetch request"},
    "--render": {type: "flag", description: "Enable JavaScript rendering for dynamic content"},
  },
  positionals: [{name: "url", description: "URL to fetch", required: true}],
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

async function execute({positionals, args, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> {
  const result = await agent.requireServiceByType(WebSearchService).fetchPage(positionals.url, {
    render: args["--render"],
    countryCode: args["--country"],
  }, agent);

  return `Fetched ${result.markdown.length} characters`;
}

export default {
  name: "websearch fetch",
  description: "Fetch content from a URL",
  help: `Fetch and extract content from a specific web page as markdown.

## Options

--country <code>   Country code to use for the request
--render           Enable JavaScript rendering for dynamic content

## Example

/websearch fetch https://example.com
/websearch fetch --render https://example.com`,
  inputSchema,
  execute,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
