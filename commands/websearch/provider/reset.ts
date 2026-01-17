import {Agent} from "@tokenring-ai/agent";
import {WebSearchState} from "../../../state/webSearchState.ts";
import WebSearchService from "../../../WebSearchService.ts";

export async function reset(_remainder: string, agent: Agent): Promise<void> {
  const webSearch = agent.requireServiceByType(WebSearchService);
  const initialProvider = agent.getState(WebSearchState).initialConfig.provider;
  
  if (initialProvider) {
    webSearch.setActiveProvider(initialProvider, agent);
    agent.infoMessage(`Provider reset to ${initialProvider}`);
  } else {
    agent.errorMessage("No initial provider configured");
  }
}
