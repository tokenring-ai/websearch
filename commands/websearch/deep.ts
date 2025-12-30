import {Agent} from "@tokenring-ai/agent";
import {parseArgs} from "node:util";
import WebSearchService from "../../WebSearchService.js";

export async function deep(remainder: string, agent: Agent): Promise<void> {
  const webSearch = agent.requireServiceByType(WebSearchService);
  
  const {values, positionals} = parseArgs({
    args: remainder.trim().split(/\s+/),
    options: {
      country: {type: 'string'},
      language: {type: 'string'},
      location: {type: 'string'},
      search: {type: 'string'},
      news: {type: 'string'},
      fetch: {type: 'string'}
    },
    allowPositionals: true,
    strict: false
  });

  const query = positionals.join(" ");
  if (!query) {
    agent.errorLine("Usage: /websearch deep <query> [flags]");
    return;
  }

  const result = await webSearch.deepSearch(query, {
    searchCount: values.search ? Number(values.search) : undefined,
    newsCount: values.news ? Number(values.news) : undefined,
    fetchCount: values.fetch ? Number(values.fetch) : undefined,
    countryCode: values.country as string,
    language: values.language as string,
    location: values.location as string,
  }, agent);
  
  agent.infoLine(`Deep search: ${result.results.length} web results, ${result.news.length} news results, ${result.pages.length} pages fetched`);
  result.pages.forEach((p, i) => agent.infoLine(`  [${i + 1}] ${p.url} (${p.markdown.length} chars)`));
}
