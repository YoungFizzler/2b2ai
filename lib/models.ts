import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  customProvider,
} from "ai";

// create openrouter instance
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

// custom providers w/ openrouter
export const myProvider = customProvider({
  languageModels: {
    "gpt-5-nano": openrouter.chat("openai/gpt-5-nano"),
    "gpt-oss-20b": openrouter.chat("openai/gpt-oss-20b"),
    "gemini-2.5-flash-lite": openrouter.chat("google/gemini-2.5-flash-lite"),
    "deepseek-chat-v3.1": openrouter.chat("deepseek/deepseek-chat-v3.1"),
  },
});

export type modelID = Parameters<(typeof myProvider)["languageModel"]>["0"];

export const models: Record<modelID, string> = {
  "gpt-5-nano": "GPT-5 Nano",
  "gpt-oss-20b": "GPT OSS 20B",
  "gemini-2.5-flash-lite": "Gemini 2.5 Flash Lite",
  "deepseek-chat-v3.1": "DeepSeek Chat v3.1",
};
