import {Agent} from "@tokenring-ai/agent";
import type {TreeLeaf} from "@tokenring-ai/agent/question";
import {WebSearchState} from "../../../state/webSearchState.ts";
import WebSearchService from "../../../WebSearchService.ts";

export async function select(_remainder: string, agent: Agent): Promise<void> {
  const webSearch = agent.requireServiceByType(WebSearchService);
  const available = webSearch.getAvailableProviders();

  if (available.length === 0) {
    agent.infoMessage("No web search providers are registered.");
    return;
  }

  if (available.length === 1) {
    webSearch.setActiveProvider(available[0], agent);
    agent.infoMessage(`Only one provider configured, auto-selecting: ${available[0]}`);
    return;
  }

  const activeProvider = agent.getState(WebSearchState).provider;
  const formattedProviders: TreeLeaf[] = available.map(name => ({
    name: `${name}${name === activeProvider ? " (current)" : ""}`,
    value: name,
  }));

  const selection = await agent.askQuestion({
    message: "Select an active web search provider",
    question: {
      type: 'treeSelect',
      label: "Web Search Provider",
      key: "result",
      defaultValue: activeProvider ? [activeProvider] : undefined,
      minimumSelections: 1,
      maximumSelections: 1,
      tree: formattedProviders
    }
  });

  if (selection) {
    const result = selection[0]
    webSearch.setActiveProvider(result, agent);
    agent.infoMessage(`Active provider set to: ${result}`);
  } else {
    agent.infoMessage("Provider selection cancelled.");
  }
}
