import {Agent} from "@tokenring-ai/agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {parseArgs} from "node:util";
import WebSearchService from "../../WebSearchService.js";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const {values, positionals} = parseArgs({
    args: remainder.trim().split(/\s+/),
    options: { country: {type: 'string'}, render: {type: 'boolean'} },
    allowPositionals: true, strict: false
  });
  const url = positionals.join(" ");
  if (!url) throw new CommandFailedError("Usage: /websearch fetch <url> [flags]");
  const result = await agent.requireServiceByType(WebSearchService).fetchPage(url, { render: values.render as boolean, countryCode: values.country as string }, agent);
  return `Fetched ${result.markdown.length} characters`;
}

export default {
  name: "websearch fetch", description: "Fetch content from a URL", help: `# /websearch fetch <url> [options]

Fetch and extract content from a specific web page as markdown.

## Options

--render   Enable JavaScript rendering for dynamic content

## Example

/websearch fetch https://example.com
/websearch fetch https://example.com --render`, execute } satisfies TokenRingAgentCommand;
