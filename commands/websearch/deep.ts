import {Agent} from "@tokenring-ai/agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {parseArgs} from "node:util";
import WebSearchService from "../../WebSearchService.js";

export async function deep(remainder: string, agent: Agent): Promise<string> {
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
    throw new CommandFailedError("Usage: /websearch deep <query> [flags]");
  }

  const searchOptions = {
    searchCount: values.search ? Number(values.search) : undefined,
    newsCount: values.news ? Number(values.news) : undefined,
    fetchCount: values.fetch ? Number(values.fetch) : undefined,
    countryCode: values.country as string,
    language: values.language as string,
    location: values.location as string,
  };

  const result = await webSearch.deepSearch(query, searchOptions, agent);

  const optionsList = [
    searchOptions.searchCount ? `**Search Count:** ${searchOptions.searchCount}` : '',
    searchOptions.newsCount ? `**News Count:** ${searchOptions.newsCount}` : '',
    searchOptions.fetchCount ? `**Fetch Count:** ${searchOptions.fetchCount}` : '',
    searchOptions.countryCode ? `**Country:** ${searchOptions.countryCode}` : '',
    searchOptions.language ? `**Language:** ${searchOptions.language}` : '',
    searchOptions.location ? `**Location:** ${searchOptions.location}` : ''
  ].filter(Boolean).join('\n');

  const resultsList = [
    result.results.length > 0 ? `### Web Results (${result.results.length})\n${result.results.map((r, i) => `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.snippet}`).join('\n\n')}` : '',
    result.news.length > 0 ? `### News Results (${result.news.length})\n${result.news.map((n, i) => `${i + 1}. ${n.title}\n   ${n.link}\n   ${n.snippet}`).join('\n\n')}` : '',
    result.pages.length > 0 ? `### Fetched Pages (${result.pages.length})\n${result.pages.map((p, i) => `${i + 1}. [${p.url}](${p.url}) (${p.markdown.length} characters)`).join('\n')}` : ''
  ].filter(Boolean).join('\n\n');

  agent.artifactOutput({
    name: `Deep search for ${query}`,
    encoding: 'text',
    mimeType: 'text/markdown',
    body: `
# Deep Search: ${query}

## Search Options
${optionsList || 'No specific options provided'}

## Results
${resultsList || 'No results found'}
    `
  });

  return `Deep search: ${result.results.length} web results, ${result.news.length} news results, ${result.pages.length} pages fetched`;
}
