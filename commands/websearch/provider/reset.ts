import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand,} from "@tokenring-ai/agent/types";
import {WebSearchState} from "../../../state/webSearchState.ts";
import WebSearchService from "../../../WebSearchService.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

function execute({
                   agent,
                 }: AgentCommandInputType<typeof inputSchema>): string {
  const initialProvider = agent.getState(WebSearchState).initialConfig.provider;
  if (!initialProvider)
    throw new CommandFailedError("No initial provider configured");
  agent
    .requireServiceByType(WebSearchService)
    .setActiveProvider(initialProvider, agent);
  return `Provider reset to ${initialProvider}`;
}

export default {
  name: "websearch provider reset",
  description: "Reset to initial provider",
  help: `Reset the active web search provider to the initial configured value.

## Example

/websearch provider reset`,
  inputSchema,
  execute,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
