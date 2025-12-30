import {Agent} from "@tokenring-ai/agent";
import {parseArgs} from "node:util";
import WebSearchService from "../../WebSearchService.js";

export async function search(remainder: string, agent: Agent): Promise<void> {
  const webSearch = agent.requireServiceByType(WebSearchService);
  
  const {values, positionals} = parseArgs({
    args: remainder.trim().split(/\s+/),
    options: {
      country: {type: 'string'},
      language: {type: 'string'},
      location: {type: 'string'},
      num: {type: 'string'},
      page: {type: 'string'}
    },
    allowPositionals: true,
    strict: false
  });

  const query = positionals.join(" ");
  if (!query) {
    agent.errorLine("Usage: /websearch search <query> [flags]");
    return;
  }

  const result = await webSearch.searchWeb(query, {
    countryCode: values.country as string,
    language: values.language as string,
    location: values.location as string,
    num: values.num ? Number(values.num) : undefined,
    page: values.page ? Number(values.page) : undefined,
  }, agent);
  
  agent.infoLine(`Search results: ${JSON.stringify(result).slice(0, 500)}...`);
}
