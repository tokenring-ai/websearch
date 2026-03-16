import {Agent} from "@tokenring-ai/agent";
import type {TreeLeaf} from "@tokenring-ai/agent/question";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {WebSearchState} from "../../../state/webSearchState.ts";
import WebSearchService from "../../../WebSearchService.ts";

async function execute(_remainder: string, agent: Agent): Promise<string> {
  const webSearch = agent.requireServiceByType(WebSearchService);
  const available = webSearch.getAvailableProviders();
  if (available.length === 0) return "No web search providers are registered.";
  if (available.length === 1) {
    webSearch.setActiveProvider(available[0], agent);
    return `Only one provider configured, auto-selecting: ${available[0]}`;
  }
  const activeProvider = agent.getState(WebSearchState).provider;
  const tree: TreeLeaf[] = available.map(name => ({ name: `${name}${name === activeProvider ? " (current)" : ""}`, value: name }));
  const selection = await agent.askQuestion({
    message: "Select an active web search provider",
    question: { type: 'treeSelect', label: "Web Search Provider", key: "result", defaultValue: activeProvider ? [activeProvider] : undefined, minimumSelections: 1, maximumSelections: 1, tree },
  });
  if (selection) {
    webSearch.setActiveProvider(selection[0], agent);
    return `Active provider set to: ${selection[0]}`;
  }
  return "Provider selection cancelled.";
}

export default {
  name: "websearch provider select", description: "Interactively select a provider", help: `# /websearch provider select

Interactively select the active web search provider. Auto-selects if only one provider is configured.

## Example

/websearch provider select`, execute } satisfies TokenRingAgentCommand;
