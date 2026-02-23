import {Agent} from "@tokenring-ai/agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {parseArgs} from "node:util";
import WebSearchService from "../../WebSearchService.js";

export async function news(remainder: string, agent: Agent): Promise<string> {
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
    throw new CommandFailedError("Usage: /websearch news <query> [flags]");
  }

  const result = await webSearch.searchNews(query, {
    countryCode: values.country as string,
    language: values.language as string,
    location: values.location as string,
    num: values.num ? Number(values.num) : undefined,
    page: values.page ? Number(values.page) : undefined,
  }, agent);
  
  return `News results: ${JSON.stringify(result).slice(0, 500)}...`;
}
