import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand,} from "@tokenring-ai/agent/types";
import WebSearchService from "../../../WebSearchService.ts";

const inputSchema = {
  args: {},
  positionals: [
    {name: "providerName", description: "Provider name", required: true},
  ],
} as const satisfies AgentCommandInputSchema;

function execute({
                   positionals: {providerName},
                   agent,
                 }: AgentCommandInputType<typeof inputSchema>): string {
  const webSearch = agent.requireServiceByType(WebSearchService);
  const available = webSearch.getAvailableProviders();
  if (available.includes(providerName)) {
    webSearch.setActiveProvider(providerName, agent);
    return `Provider set to: ${providerName}`;
  }
  return `Provider "${providerName}" not found. Available providers: ${available.join(", ")}`;
}

export default {
  name: "websearch provider set",
  description: "Set the active provider",
  help: `Set the active web search provider by name.

## Example

/websearch provider set tavily`,
  inputSchema,
  execute,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
