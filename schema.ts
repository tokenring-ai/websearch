import {z} from "zod";

export const WebSearchConfigSchema = z.object({
  defaultProvider: z.string(),
  providers: z.record(z.string(), z.any())
});

export const WebSearchAgentConfigSchema = z.object({
  provider: z.string().optional()
}).default({});
