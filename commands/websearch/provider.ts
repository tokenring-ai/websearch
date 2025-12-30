import {Agent} from "@tokenring-ai/agent";
import WebSearchService from "../../WebSearchService.js";

export async function provider(remainder: string, agent: Agent): Promise<void> {
  const webSearch = agent.requireServiceByType(WebSearchService);
  const query = remainder.trim();
  
  if (query) {
    const available = webSearch.getAvailableProviders();
    if (available.includes(query)) {
      webSearch.setActiveProvider(query, agent);
      agent.infoLine(`Provider set to: ${query}`);
    } else {
      agent.errorLine(`Provider '${query}' not available. Available: ${available.join(", ")}`);
    }
  } else {
    const active = webSearch.getActiveProvider(agent);
    const available = webSearch.getAvailableProviders();
    agent.infoLine(`Active provider: ${active || "none"}`);
    agent.infoLine(`Available providers: ${available.join(", ")}`);
  }
}
