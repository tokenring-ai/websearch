import {Agent} from "@tokenring-ai/agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {WebSearchState} from "../../../state/webSearchState.ts";
import WebSearchService from "../../../WebSearchService.ts";

export async function reset(_remainder: string, agent: Agent): Promise<string> {
  const webSearch = agent.requireServiceByType(WebSearchService);
  const initialProvider = agent.getState(WebSearchState).initialConfig.provider;
  
  if (!initialProvider) {
    throw new CommandFailedError("No initial provider configured");
  }
  
  webSearch.setActiveProvider(initialProvider, agent);
  return `Provider reset to ${initialProvider}`;
}
