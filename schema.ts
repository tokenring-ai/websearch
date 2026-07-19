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
        provider: z.string().exactOptional().meta({ description: "Search provider new agents use by default (e.g. serper)" }),
      })
      .prefault({})
      .meta({ label: "Agent Defaults" }),
  })
  .prefault({})
  .meta({ label: "Web Search", description: "Web search access for agents" });
