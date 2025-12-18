import {z} from "zod";

export const WebSearchConfigSchema = z.object({
  defaultProvider: z.string(),
  providers: z.record(z.string(), z.any())
}).optional();




export {default as WebSearchService} from "./WebSearchService.ts";
export {default as WebSearchProvider} from "./WebSearchProvider.ts";