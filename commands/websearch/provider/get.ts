import {Agent} from "@tokenring-ai/agent";
import {WebSearchState} from "../../../state/webSearchState.ts";

export async function get(_remainder: string, agent: Agent): Promise<string> {
  const activeProvider = agent.getState(WebSearchState).provider;
  return `Current provider: ${activeProvider ?? "(none)"}`;
}
