import { parseArgs } from "node:util";
import Agent from "@tokenring-ai/agent/Agent";
import WebSearchService from "../WebSearchService.js";

export const description = "/websearch [action] - Web search operations";

export function help(): Array<string> {
  return [
    "/websearch [action] <query> [options] - Web search operations",
    "  Actions:",
    "    search <query>  - Search the web",
    "    news <query>    - Search news",
    "    fetch <url>     - Fetch a web page",
    "    provider        - Show/set active provider",
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
  const { values, positionals } = parseArgs({
    args,
    options: {
      country: { type: 'string' },
      language: { type: 'string' },
      location: { type: 'string' },
      num: { type: 'string' },
      page: { type: 'string' },
      render: { type: 'boolean' }
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

  return { flags, rest: positionals };
}

export async function execute(remainder: string, agent: Agent): Promise<void> {
  const chat = agent.requireFirstServiceByType(Agent);
  const webSearch = agent.requireFirstServiceByType(WebSearchService);

  const [sub, ...rest] = remainder.trim().split(/\s+/);
  if (!sub) {
    help().forEach((l) => chat.infoLine(l));
    return;
  }

  const {flags, rest: queryParts} = parseWebSearchArgs(rest);
  const query = queryParts.join(" ");

  if (sub === "search") {
    if (!query) {
      chat.errorLine("Usage: /websearch search <query> [flags]");
      return;
    }
    const result = await webSearch.searchWeb(query, {
      countryCode: flags.country,
      language: flags.language,
      location: flags.location,
      num: flags.num as number,
      page: flags.page as number,
    });
    chat.infoLine(`Search results: ${JSON.stringify(result.results).slice(0, 500)}...`);
  } else if (sub === "news") {
    if (!query) {
      chat.errorLine("Usage: /websearch news <query> [flags]");
      return;
    }
    const result = await webSearch.searchNews(query, {
      countryCode: flags.country,
      language: flags.language,
      location: flags.location,
      num: flags.num as number,
      page: flags.page as number,
    });
    chat.infoLine(`News results: ${JSON.stringify(result.results).slice(0, 500)}...`);
  } else if (sub === "fetch") {
    if (!query) {
      chat.errorLine("Usage: /websearch fetch <url> [flags]");
      return;
    }
    const result = await webSearch.fetchPage(query, {
      render: !!flags.render,
      countryCode: flags.country,
    });
    chat.infoLine(`Fetched ${result.html.length} characters`);
  } else if (sub === "provider") {
    const active = webSearch.getActiveResource();
    const available = webSearch.getAvailableResources();
    chat.infoLine(`Active provider: ${active || "none"}`);
    chat.infoLine(`Available providers: ${available.join(", ")}`);
  } else {
    chat.infoLine("Unknown action. Use: search, news, fetch, provider");
  }
}