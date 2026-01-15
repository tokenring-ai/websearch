import {Agent} from "@tokenring-ai/agent";
import {parseArgs} from "node:util";
import WebSearchService from "../../WebSearchService.js";

export async function news(remainder: string, agent: Agent): Promise<void> {
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
    agent.errorMessage("Usage: /websearch news <query> [flags]");
    return;
  }

  const result = await webSearch.searchNews(query, {
    countryCode: values.country as string,
    language: values.language as string,
    location: values.location as string,
    num: values.num ? Number(values.num) : undefined,
    page: values.page ? Number(values.page) : undefined,
  }, agent);
  
  agent.infoMessage(`News results: ${JSON.stringify(result).slice(0, 500)}...`);
}
