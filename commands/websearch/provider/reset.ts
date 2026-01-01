import {Agent} from "@tokenring-ai/agent";
import WebSearchService from "../../../WebSearchService.ts";
import {WebSearchState} from "../../../state/webSearchState.ts";

export async function reset(_remainder: string, agent: Agent): Promise<void> {
  const webSearch = agent.requireServiceByType(WebSearchService);
  const initialProvider = agent.getState(WebSearchState).initialConfig.provider;
  
  if (initialProvider) {
    webSearch.setActiveProvider(initialProvider, agent);
    agent.infoLine(`Provider reset to ${initialProvider}`);
  } else {
    agent.errorLine("No initial provider configured");
  }
}
