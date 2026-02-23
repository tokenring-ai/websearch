import {Agent} from "@tokenring-ai/agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {parseArgs} from "node:util";
import WebSearchService from "../../WebSearchService.js";

export async function fetch(remainder: string, agent: Agent): Promise<string> {
  const webSearch = agent.requireServiceByType(WebSearchService);
  
  const {values, positionals} = parseArgs({
    args: remainder.trim().split(/\s+/),
    options: {
      country: {type: 'string'},
      render: {type: 'boolean'}
    },
    allowPositionals: true,
    strict: false
  });

  const url = positionals.join(" ");
  if (!url) {
    throw new CommandFailedError("Usage: /websearch fetch <url> [flags]");
  }

  const result = await webSearch.fetchPage(url, {
    render: values.render as boolean,
    countryCode: values.country as string,
  }, agent);
  
  return `Fetched ${result.markdown.length} characters`;
}
