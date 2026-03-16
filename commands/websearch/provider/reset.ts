import {Agent} from "@tokenring-ai/agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {WebSearchState} from "../../../state/webSearchState.ts";
import WebSearchService from "../../../WebSearchService.ts";

async function execute(_remainder: string, agent: Agent): Promise<string> {
  const initialProvider = agent.getState(WebSearchState).initialConfig.provider;
  if (!initialProvider) throw new CommandFailedError("No initial provider configured");
  agent.requireServiceByType(WebSearchService).setActiveProvider(initialProvider, agent);
  return `Provider reset to ${initialProvider}`;
}

export default {
  name: "websearch provider reset", description: "Reset to initial provider", help: `# /websearch provider reset

Reset the active web search provider to the initial configured value.

## Example

/websearch provider reset`, execute } satisfies TokenRingAgentCommand;
