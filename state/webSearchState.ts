import {Agent} from "@tokenring-ai/agent";
import type {ResetWhat} from "@tokenring-ai/agent/AgentEvents";
import type {AgentStateSlice} from "@tokenring-ai/agent/types";
import {z} from "zod";
import {WebSearchAgentConfigSchema} from "../schema.ts";

const serializationSchema = z.object({
  provider: z.string().nullable()
});

export class WebSearchState implements AgentStateSlice<typeof serializationSchema> {
  name = "WebSearchState";
  serializationSchema = serializationSchema;
  provider: string | null;

  constructor(readonly initialConfig: z.output<typeof WebSearchAgentConfigSchema>) {
    this.provider = initialConfig.provider ?? null;
  }

  transferStateFromParent(parent: Agent): void {
    this.provider = parent.getState(WebSearchState).provider;
  }

  reset(what: ResetWhat[]): void {}

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
