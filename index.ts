import packageJSON from './package.json' with {type: 'json'};

export const name = packageJSON.name;
export const version = packageJSON.version;
export const description = packageJSON.description;

export {default as WebSearchService} from "./WebSearchService.ts";
export {default as WebSearchResource} from "./WebSearchResource.ts";
export * as tools from "./tools.ts";
export * as chatCommands from "./chatCommands.ts";