import {Agent} from "@tokenring-ai/agent";
import {WebSearchState} from "../../../state/webSearchState.ts";

export async function get(_remainder: string, agent: Agent): Promise<void> {
  const activeProvider = agent.getState(WebSearchState).provider;
  agent.infoMessage(`Current provider: ${activeProvider ?? "(none)"}`);
}
