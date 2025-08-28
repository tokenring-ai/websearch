import {HumanInterfaceService} from "@token-ring/chat";
import ChatService from "@token-ring/chat/ChatService";
import type {Registry} from "@token-ring/registry";
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

function parseArgs(args: string[]): { flags: Record<string, string | number | boolean>; rest: string[] } {
  const flags: Record<string, string | number | boolean> = {};
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--country" || a === "--language" || a === "--location") {
      flags[a.slice(2)] = args[i + 1];
      i++;
    } else if (a === "--num" || a === "--page") {
      flags[a.slice(2)] = Number(args[i + 1]);
      i++;
    } else if (a === "--render") {
      flags["render"] = true;
    } else if (!a.startsWith("--")) {
      rest.push(a);
    }
  }
  return {flags, rest};
}

export async function execute(remainder: string, registry: Registry): Promise<void> {
  const chat = registry.requireFirstServiceByType(ChatService);
  registry.requireFirstServiceByType(HumanInterfaceService);
  const webSearch = registry.requireFirstServiceByType(WebSearchService);

  const [sub, ...rest] = remainder.trim().split(/\s+/);
  if (!sub) {
    help().forEach((l) => chat.systemLine(l));
    return;
  }

  const {flags, rest: queryParts} = parseArgs(rest);
  const query = queryParts.join(" ");

  if (sub === "search") {
    if (!query) {
      chat.errorLine("Usage: /websearch search <query> [flags]");
      return;
    }
    const result = await webSearch.searchWeb(query, {
      countryCode: flags.country as string,
      language: flags.language as string,
      location: flags.location as string,
      num: flags.num as number,
      page: flags.page as number,
    });
    chat.systemLine(`Search results: ${JSON.stringify(result.results).slice(0, 500)}...`);
  } else if (sub === "news") {
    if (!query) {
      chat.errorLine("Usage: /websearch news <query> [flags]");
      return;
    }
    const result = await webSearch.searchNews(query, {
      countryCode: flags.country as string,
      language: flags.language as string,
      location: flags.location as string,
      num: flags.num as number,
      page: flags.page as number,
    });
    chat.systemLine(`News results: ${JSON.stringify(result.results).slice(0, 500)}...`);
  } else if (sub === "fetch") {
    if (!query) {
      chat.errorLine("Usage: /websearch fetch <url> [flags]");
      return;
    }
    const result = await webSearch.fetchPage(query, {
      render: !!flags.render,
      countryCode: flags.country as string,
    });
    chat.systemLine(`Fetched ${result.html.length} characters`);
  } else if (sub === "provider") {
    const active = webSearch.getActiveResource();
    const available = webSearch.getAvailableResources();
    chat.systemLine(`Active provider: ${active || "none"}`);
    chat.systemLine(`Available providers: ${available.join(", ")}`);
  } else {
    chat.systemLine("Unknown action. Use: search, news, fetch, provider");
  }
}