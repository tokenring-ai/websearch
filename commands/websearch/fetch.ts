import {Agent} from "@tokenring-ai/agent";
import {parseArgs} from "node:util";
import WebSearchService from "../../WebSearchService.js";

export async function fetch(remainder: string, agent: Agent): Promise<void> {
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
    agent.errorMessage("Usage: /websearch fetch <url> [flags]");
    return;
  }

  const result = await webSearch.fetchPage(url, {
    render: values.render as boolean,
    countryCode: values.country as string,
  }, agent);
  
  agent.infoMessage(`Fetched ${result.markdown.length} characters`);
}
