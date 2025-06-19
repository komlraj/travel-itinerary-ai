/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { agent } from "@/lib/agent";
import { Message } from "ai";
import { convertToLangChainMessages } from "@/lib/helper";
import { createStreamableValue } from "ai/rsc";

export async function chatWithAgent(history: Message[]) {
  const messages = convertToLangChainMessages(history);
  const stream = createStreamableValue<string>();
  console.log("🔥 server action called");

  // Start agent stream in background
  (async () => {
    try {
      console.log("🚀 agent.stream() starting");

      const response = await agent.stream({ messages });

      for await (const update of response as any) {
        if (
          update.agent?.messages?.[0]?._getType?.() === 'ai'
        ) {
          const content = update.agent.messages[0].content;
      
          if (typeof content === 'string') {
            stream.update(content);
          }
      
          if (Array.isArray(content)) {
            const text = content
              .filter((c) => c.type === 'text')
              .map((c) => c.text)
              .join('\n');
            stream.update(text);
          }
        }
      }

      console.log("✅ stream complete");

      stream.done();
    } catch (err) {
      console.error("❌ Error in agent stream:", err);
      stream.done(); // ensure stream completes
    }
  })();

  // Return streamable value to the client
  return {
    output: stream.value,
  };
}
