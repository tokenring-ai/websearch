import TokenRingApp from "@tokenring-ai/app"; 
import {AgentCommandService} from "@tokenring-ai/agent";
import {ChatService} from "@tokenring-ai/chat";
import {TokenRingPlugin} from "@tokenring-ai/app";
import {ScriptingService} from "@tokenring-ai/scripting";
import {ScriptingThis} from "@tokenring-ai/scripting/ScriptingService.js";
import {z} from "zod";
import chatCommands from "./chatCommands.ts";
import packageJSON from './package.json' with {type: 'json'};
import tools from "./tools.ts";
import WebSearchService from "./WebSearchService.ts";

export const WebSearchConfigSchema = z.object({
  defaultProvider: z.string(),
  providers: z.record(z.string(), z.any())
}).optional();


export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(app: TokenRingApp) {
    const config = app.getConfigSlice('websearch', WebSearchConfigSchema);
    if (config) {
      app.waitForService(ScriptingService, (scriptingService: ScriptingService) => {
        scriptingService.registerFunction("searchWeb", {
            type: 'native',
            params: ['query'],
            async execute(this: ScriptingThis, query: string): Promise<string> {
              const result = await this.agent.requireServiceByType(WebSearchService).searchWeb(query);
              return JSON.stringify(result);
            }
          }
        );

        scriptingService.registerFunction("searchNews", {
            type: 'native',
            params: ['query'],
            async execute(this: ScriptingThis, query: string): Promise<string> {
              const result = await this.agent.requireServiceByType(WebSearchService).searchNews(query);
              return JSON.stringify(result);
            }
          }
        );

        scriptingService.registerFunction("fetchPage", {
            type: 'native',
            params: ['url'],
            async execute(this: ScriptingThis, url: string): Promise<string> {
              const result = await this.agent.requireServiceByType(WebSearchService).fetchPage(url);
              return result.markdown;
            }
          }
        );

        scriptingService.registerFunction("deepSearch", {
            type: 'native',
            params: ['query', 'searchCount', 'newsCount', 'fetchCount'],
            async execute(this: ScriptingThis, query: string, searchCount?: string, newsCount?: string, fetchCount?: string): Promise<string> {
              const result = await this.agent.requireServiceByType(WebSearchService).deepSearch(query, {
                searchCount: searchCount ? parseInt(searchCount) : undefined,
                newsCount: newsCount ? parseInt(newsCount) : undefined,
                fetchCount: fetchCount ? parseInt(fetchCount) : undefined
              });
              return JSON.stringify(result);
            }
          }
        );
      });
      app.waitForService(ChatService, chatService =>
        chatService.addTools(packageJSON.name, tools)
      );
      app.waitForService(AgentCommandService, agentCommandService =>
        agentCommandService.addAgentCommands(chatCommands)
      );
      app.addServices(new WebSearchService());
    }
  },

  start(app: TokenRingApp) {
    const config = app.getConfigSlice("websearch", WebSearchConfigSchema);
    if (config) {
      app.requireService(WebSearchService).setActiveProvider(config.defaultProvider);
    }
  }
} as TokenRingPlugin;

export {default as WebSearchService} from "./WebSearchService.ts";
export {default as WebSearchProvider} from "./WebSearchProvider.ts";