import {AgentTeam, TokenRingPackage} from "@tokenring-ai/agent";
import {ScriptingService} from "@tokenring-ai/scripting";
import {ScriptingThis} from "@tokenring-ai/scripting/ScriptingService.js";
import {z} from "zod";
import * as chatCommands from "./chatCommands.ts";
import packageJSON from './package.json' with {type: 'json'};
import * as tools from "./tools.ts";
import WebSearchService from "./WebSearchService.ts";

export const WebSearchConfigSchema = z.object({
  defaultProvider: z.string(),
  providers: z.record(z.string(), z.looseObject({type: z.string()}))
}).optional();


export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(agentTeam: AgentTeam) {
    const config = agentTeam.getConfigSlice('websearch', WebSearchConfigSchema);
    if (config) {
      agentTeam.services.waitForItemByType(ScriptingService).then((scriptingService: ScriptingService) => {
        scriptingService.registerFunction("searchWeb", {
            type: 'native',
            params: ['query'],
            async execute(this: ScriptingThis, query: string): Promise<string> {
              const result = await this.agent.requireServiceByType(WebSearchService).searchWeb(query);
              return JSON.stringify(result.results);
            }
          }
        );

        scriptingService.registerFunction("searchNews", {
            type: 'native',
            params: ['query'],
            async execute(this: ScriptingThis, query: string): Promise<string> {
              const result = await this.agent.requireServiceByType(WebSearchService).searchNews(query);
              return JSON.stringify(result.results);
            }
          }
        );

        scriptingService.registerFunction("fetchPage", {
            type: 'native',
            params: ['url'],
            async execute(this: ScriptingThis, url: string): Promise<string> {
              const result = await this.agent.requireServiceByType(WebSearchService).fetchPage(url);
              return result.html;
            }
          }
        );
      });
      agentTeam.addTools(packageJSON.name, tools);
      agentTeam.addChatCommands(chatCommands);
      agentTeam.addServices(new WebSearchService());
    }
  },

  start(agentTeam: AgentTeam) {
    const config = agentTeam.getConfigSlice("websearch", WebSearchConfigSchema);
    if (config) {
      agentTeam.services.requireItemByType(WebSearchService).setActiveProvider(config.defaultProvider);
    }
  }
} as TokenRingPackage;

export {default as WebSearchService} from "./WebSearchService.ts";
export {default as WebSearchProvider} from "./WebSearchProvider.ts";