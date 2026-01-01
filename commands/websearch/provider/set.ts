import {Agent} from "@tokenring-ai/agent";
import WebSearchService from "../../../WebSearchService.ts";

export async function set(remainder: string, agent: Agent): Promise<void> {
  const webSearch = agent.requireServiceByType(WebSearchService);
  const providerName = remainder.trim();

  if (!providerName) {
    agent.errorLine("Usage: /websearch provider set <name>");
    return;
  }

  const available = webSearch.getAvailableProviders();
  if (available.includes(providerName)) {
    webSearch.setActiveProvider(providerName, agent);
    agent.infoLine(`Provider set to: ${providerName}`);
  } else {
    agent.infoLine(`Provider "${providerName}" not found. Available providers: ${available.join(", ")}`);
  }
}
