import {Agent} from "@tokenring-ai/agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import WebSearchService from "../../../WebSearchService.ts";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const webSearch = agent.requireServiceByType(WebSearchService);
  const providerName = remainder.trim();
  if (!providerName) throw new CommandFailedError("Usage: /websearch provider set <name>");
  const available = webSearch.getAvailableProviders();
  if (available.includes(providerName)) {
    webSearch.setActiveProvider(providerName, agent);
    return `Provider set to: ${providerName}`;
  }
  return `Provider "${providerName}" not found. Available providers: ${available.join(", ")}`;
}

export default { name: "websearch provider set", description: "/websearch provider set - Set the active provider", help: `# /websearch provider set <name>

Set the active web search provider by name.

## Example

/websearch provider set tavily`, execute } satisfies TokenRingAgentCommand;
