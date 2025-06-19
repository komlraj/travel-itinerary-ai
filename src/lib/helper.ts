import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { Message } from "ai";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractTextContent(content: any): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join(" ");
  }
  return "";
}

// convert UI messages to LangChain messages
export const convertToLangChainMessages = (messages: Message[]) => {
  return messages.map((msg) =>
    msg.role === "user"
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content)
  );
};

export function normalizeDate(rawInput?: string): {
  original: string;
  corrected: string;
  message?: string;
} {
  const now = new Date();
  const currentYear = now.getFullYear();
  const original = rawInput?.trim() || "";

  // Default to tomorrow if nothing provided
  if (!original) {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    return {
      original: "",
      corrected: tomorrow.toISOString().slice(0, 10),
    };
  }

  let parsed = new Date(original);
  const inputHasYear = /\b\d{4}\b/.test(original);

  // Re-parse with year if missing or failed
  if (
    isNaN(parsed.getTime()) ||
    (!inputHasYear && parsed.getFullYear() < currentYear)
  ) {
    const cleanInput = original.replace(/\b\d{4}\b/, "").trim();
    parsed = new Date(`${cleanInput} ${currentYear}`);

    if (isNaN(parsed.getTime())) {
      const fallback = new Date(now);
      fallback.setDate(now.getDate() + 1);
      return {
        original,
        corrected: fallback.toISOString().slice(0, 10),
        message: "⚠️ Unable to parse the date. Defaulted to tomorrow.",
      };
    }

    // If parsed without year is still in past, bump to next year
    if (!inputHasYear && parsed < now) {
      parsed.setFullYear(currentYear + 1);
    }
  }

  // If year was provided and date is still in the past, bump to next year
  if (inputHasYear && parsed < now) {
    parsed.setFullYear(parsed.getFullYear() + 2);
    return {
      original,
      corrected: parsed.toISOString().slice(0, 10),
      message: `⚠️ The date "${original}" is in the past. Using same date in ${parsed.getFullYear()}.`,
    };
  }

  return {
    original,
    corrected: parsed.toISOString().slice(0, 10),
  };
}
