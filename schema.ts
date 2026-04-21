import { z } from "zod";

export const WebSearchAgentConfigSchema = z
  .object({
    provider: z.string().exactOptional(),
  })
  .default({});

export const WebSearchConfigSchema = z
  .object({
    agentDefaults: z
      .object({
        provider: z.string().exactOptional(),
      })
      .prefault({}),
  })
  .prefault({});
