import {z} from "zod";

export const WebSearchAgentConfigSchema = z.object({
  provider: z.string().optional()
}).default({});

export const WebSearchConfigSchema = z.object({
  providers: z.record(z.string(), z.any()),
  agentDefaults: z.object({
    provider: z.string()
  })
});
