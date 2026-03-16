import {Agent} from "@tokenring-ai/agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {parseArgs} from "node:util";
import WebSearchService from "../../WebSearchService.js";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const {values, positionals} = parseArgs({
    args: remainder.trim().split(/\s+/),
    options: { country: {type: 'string'}, language: {type: 'string'}, location: {type: 'string'}, num: {type: 'string'}, page: {type: 'string'} },
    allowPositionals: true, strict: false
  });
  const query = positionals.join(" ");
  if (!query) throw new CommandFailedError("Usage: /websearch news <query> [flags]");
  const result = await agent.requireServiceByType(WebSearchService).searchNews(query, {
    countryCode: values.country as string, language: values.language as string,
    location: values.location as string, num: values.num ? Number(values.num) : undefined,
    page: values.page ? Number(values.page) : undefined,
  }, agent);
  return `News results: ${JSON.stringify(result).slice(0, 500)}...`;
}

export default {
  name: "websearch news", description: "Search for news articles", help: `# /websearch news <query> [options]

Search for news articles.

## Options

--country <code>   Country code
--language <code>  Language code
--num <n>          Number of results

## Example

/websearch news artificial intelligence
/websearch news cryptocurrency --num 5`, execute } satisfies TokenRingAgentCommand;
