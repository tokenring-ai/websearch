import {Agent} from "@tokenring-ai/agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {WebSearchState} from "../../../state/webSearchState.ts";

export default {
  name: "websearch provider get",
  description: "/websearch provider get - Show current provider",
  help: `# /websearch provider get

Display the currently active web search provider.

## Example

/websearch provider get`,
  execute: async (_remainder: string, agent: Agent): Promise<string> =>
    `Current provider: ${agent.getState(WebSearchState).provider ?? "(none)"}`,
} satisfies TokenRingAgentCommand;
