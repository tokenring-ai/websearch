import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {WebSearchState} from "../../../state/webSearchState.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

export default {
  name: "websearch provider get",
  description: "Show current provider",
  help: `Display the currently active web search provider.

## Example

/websearch provider get`,
  inputSchema,
  execute: async ({
                    agent,
                  }: AgentCommandInputType<typeof inputSchema>): Promise<string> =>
    `Current provider: ${agent.getState(WebSearchState).provider ?? "(none)"}`,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
