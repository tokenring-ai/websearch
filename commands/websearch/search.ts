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
  if (!query) throw new CommandFailedError("Usage: /websearch search <query> [flags]");
  const result = await agent.requireServiceByType(WebSearchService).searchWeb(query, {
    countryCode: values.country as string, language: values.language as string,
    location: values.location as string, num: values.num ? Number(values.num) : undefined,
    page: values.page ? Number(values.page) : undefined,
  }, agent);
  return `Search results: ${JSON.stringify(result).slice(0, 500)}...`;
}

export default {
  name: "websearch search", description: "Perform a web search", help: `# /websearch search <query> [options]

Perform a general web search.

## Options

--country <code>   Country code (e.g. us, uk)
--language <code>  Language code (e.g. en, fr)
--location <name>  Location for geo-targeted results
--num <n>          Number of results
--page <n>         Page number

## Example

/websearch search typescript tutorial
/websearch search restaurants --location 'New York' --country us`, execute } satisfies TokenRingAgentCommand;
