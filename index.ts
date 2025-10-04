import {AgentTeam, TokenRingPackage} from "@tokenring-ai/agent";
import {z} from "zod";
import * as chatCommands from "./chatCommands.ts";
import packageJSON from './package.json' with {type: 'json'};
import * as tools from "./tools.ts";
import WebSearchService from "./WebSearchService.ts";

export const WebSearchConfigSchema = z.object({
  defaultProvider: z.string(),
  providers: z.record(z.string(), z.looseObject({type: z.string()}))
}).optional();


export const packageInfo: TokenRingPackage = {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(agentTeam: AgentTeam) {
    const config = agentTeam.getConfigSlice('websearch', WebSearchConfigSchema);
    if (config) {
      console.log(config);
      agentTeam.addTools(packageInfo, tools);
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
};

export {default as WebSearchService} from "./WebSearchService.ts";
export {default as WebSearchProvider} from "./WebSearchProvider.ts";