import {Agent} from "@tokenring-ai/agent";
import {AgentStateSlice} from "@tokenring-ai/agent/types";
import {z} from "zod";
import {WebSearchAgentConfigSchema} from "../schema.ts";

const serializationSchema = z.object({
  provider: z.string().nullable()
});

export class WebSearchState extends AgentStateSlice<typeof serializationSchema> {
  provider: string | null;

  constructor(readonly initialConfig: z.output<typeof WebSearchAgentConfigSchema>) {
    super("WebSearchState", serializationSchema);
    this.provider = initialConfig.provider ?? null;
  }

  transferStateFromParent(parent: Agent): void {
    this.provider = parent.getState(WebSearchState).provider;
  }

  serialize(): z.output<typeof serializationSchema> {
    return { provider: this.provider };
  }

  deserialize(data: z.output<typeof serializationSchema>): void {
    this.provider = data.provider;
  }

  show(): string[] {
    return [`Active Provider: ${this.provider}`];
  }
}
