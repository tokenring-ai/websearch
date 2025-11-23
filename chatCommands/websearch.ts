import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {parseArgs} from "node:util";
import WebSearchService from "../WebSearchService.js";

const description = "/websearch [action] - Web search operations";

export function help(): Array<string> {
  return [
    "/websearch [action] <query> [options] - Web search operations",
    "  Actions:",
    "    search <query>  - Search the web",
    "    news <query>    - Search news",
    "    fetch <url>     - Fetch a web page",
    "    provider [name] - Show/set active provider",
    "",
    "  Options:",
    "    --country <code>   - Country code",
    "    --language <code>  - Language code",
    "    --location <name>  - Location name",
    "    --num <n>          - Number of results",
    "    --page <n>         - Page number",
    "    --render           - Enable JS rendering (fetch only)",
    "",
    "  Examples:",
    "    /websearch search typescript tutorial",
    "    /websearch news artificial intelligence --num 5",
    "    /websearch fetch https://example.com --render",
    "    /websearch provider",
    "    /websearch provider tavily",
  ];
}

interface WebSearchArgs {
  flags: {
    country?: string;
    language?: string;
    location?: string;
    num?: number;
    page?: number;
    render?: boolean;
  }
  rest: string[];
}

function parseWebSearchArgs(args: string[]): WebSearchArgs {
  const {values, positionals} = parseArgs({
    args,
    options: {
      country: {type: 'string'},
      language: {type: 'string'},
      location: {type: 'string'},
      num: {type: 'string'},
      page: {type: 'string'},
      render: {type: 'boolean'}
    },
    allowPositionals: true,
    strict: false
  });

  const flags: WebSearchArgs["flags"] = {};

  // Convert string numbers to actual numbers for num and page
  if (values.country) flags.country = values.country as string;
  if (values.language) flags.language = values.language as string;
  if (values.location) flags.location = values.location as string;
  if (values.num) flags.num = Number(values.num);
  if (values.page) flags.page = Number(values.page);
  if (values.render) flags.render = values.render as boolean;

  return {flags, rest: positionals};
}

async function execute(remainder: string, agent: Agent): Promise<void> {

  const webSearch = agent.requireServiceByType(WebSearchService);

  const [sub, ...rest] = remainder.trim().split(/\s+/);
  if (!sub) {
    help().forEach((l) => agent.infoLine(l));
    return;
  }

  const {flags, rest: queryParts} = parseWebSearchArgs(rest);
  const query = queryParts.join(" ");

  if (sub === "search") {
    if (!query) {
      agent.errorLine("Usage: /websearch search <query> [flags]");
      return;
    }
    const result = await webSearch.searchWeb(query, {
      countryCode: flags.country,
      language: flags.language,
      location: flags.location,
      num: flags.num as number,
      page: flags.page as number,
    });
    agent.infoLine(`Search results: ${JSON.stringify(result.results).slice(0, 500)}...`);
  } else if (sub === "news") {
    if (!query) {
      agent.errorLine("Usage: /websearch news <query> [flags]");
      return;
    }
    const result = await webSearch.searchNews(query, {
      countryCode: flags.country,
      language: flags.language,
      location: flags.location,
      num: flags.num as number,
      page: flags.page as number,
    });
    agent.infoLine(`News results: ${JSON.stringify(result.results).slice(0, 500)}...`);
  } else if (sub === "fetch") {
    if (!query) {
      agent.errorLine("Usage: /websearch fetch <url> [flags]");
      return;
    }
    const result = await webSearch.fetchPage(query, {
      render: !!flags.render,
      countryCode: flags.country,
    });
    agent.infoLine(`Fetched ${result.html.length} characters`);
  } else if (sub === "provider") {
    if (query) {
      const available = webSearch.getAvailableProviders();
      if (available.includes(query)) {
        webSearch.setActiveProvider(query);
        agent.infoLine(`Provider set to: ${query}`);
      } else {
        agent.errorLine(`Provider '${query}' not available. Available: ${available.join(", ")}`);
      }
    } else {
      const active = webSearch.getActiveProvider();
      const available = webSearch.getAvailableProviders();
      agent.infoLine(`Active provider: ${active || "none"}`);
      agent.infoLine(`Available providers: ${available.join(", ")}`);
    }
  } else {
    agent.infoLine("Unknown action. Use: search, news, fetch, provider");
  }
}

export default {
  description,
  execute,
  help,
} as TokenRingAgentCommand