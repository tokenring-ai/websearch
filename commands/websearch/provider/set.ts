import {Agent} from "@tokenring-ai/agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import WebSearchService from "../../../WebSearchService.ts";

export async function set(remainder: string, agent: Agent): Promise<string> {
  const webSearch = agent.requireServiceByType(WebSearchService);
  const providerName = remainder.trim();

  if (!providerName) {
    throw new CommandFailedError("Usage: /websearch provider set <name>");
  }

  const available = webSearch.getAvailableProviders();
  if (available.includes(providerName)) {
    webSearch.setActiveProvider(providerName, agent);
    return `Provider set to: ${providerName}`;
  } else {
    return `Provider "${providerName}" not found. Available providers: ${available.join(", ")}`;
  }
}
