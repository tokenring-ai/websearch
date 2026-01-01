import {Agent} from "@tokenring-ai/agent";
import WebSearchService from "../../../WebSearchService.ts";
import {WebSearchState} from "../../../state/webSearchState.ts";

export async function select(_remainder: string, agent: Agent): Promise<void> {
  const webSearch = agent.requireServiceByType(WebSearchService);
  const available = webSearch.getAvailableProviders();

  if (available.length === 0) {
    agent.infoLine("No web search providers are registered.");
    return;
  }

  if (available.length === 1) {
    webSearch.setActiveProvider(available[0], agent);
    agent.infoLine(`Only one provider configured, auto-selecting: ${available[0]}`);
    return;
  }

  const activeProvider = agent.getState(WebSearchState).provider;
  const formattedProviders = available.map(name => ({
    name: `${name}${name === activeProvider ? " (current)" : ""}`,
    value: name,
  }));

  const selectedValue = await agent.askHuman({
    type: "askForSingleTreeSelection",
    title: "Web Search Provider Selection",
    message: "Select an active web search provider",
    tree: {name: "Available Providers", children: formattedProviders}
  });

  if (selectedValue) {
    webSearch.setActiveProvider(selectedValue, agent);
    agent.infoLine(`Active provider set to: ${selectedValue}`);
  } else {
    agent.infoLine("Provider selection cancelled.");
  }
}
