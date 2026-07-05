import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export const CLAUDE_MODEL = "claude-sonnet-4-5-20250929";

/**
 * Forces Claude to return output matching `schema` by exposing it as the
 * single available tool and requiring that tool to be called.
 */
export async function generateStructured<T extends z.ZodTypeAny>({
  schema,
  toolName,
  system,
  prompt,
  maxTokens = 4096,
}: {
  schema: T;
  toolName: string;
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<z.infer<T>> {
  const anthropic = getClient();
  const jsonSchema = z.toJSONSchema(schema, { target: "draft-7" });
  // Anthropic tool schemas don't accept the top-level $schema key.
  delete (jsonSchema as { $schema?: string }).$schema;

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        name: toolName,
        description: `Return the result using the ${toolName} structure.`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        input_schema: jsonSchema as any,
      },
    ],
    tool_choice: { type: "tool", name: toolName },
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );

  if (!toolUse) {
    throw new Error("Claude did not return a tool_use block");
  }

  return schema.parse(toolUse.input);
}
