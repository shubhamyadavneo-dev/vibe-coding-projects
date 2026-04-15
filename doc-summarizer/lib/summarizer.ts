import OpenAI from "openai";
import { env } from "@/lib/env";

const MAX_INPUT_LENGTH = 12_000;
const MAX_SUMMARY_LENGTH = 500;
const MIN_SUMMARY_LENGTH = 20;
const OPENAI_TIMEOUT_MS = 10_000;
const OPENAI_MODEL = "gpt-4.1-mini";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "that",
  "the",
  "to",
  "was",
  "were",
  "will",
  "with",
  "this",
  "these",
  "those",
  "or",
  "but",
  "not",
  "can",
  "could",
  "should",
  "would",
  "you",
  "your",
  "we",
  "our",
  "they",
  "their",
]);

let openaiClient: OpenAI | null = null;

export type SummarizeResult = {
  summary: string;
  fallbackUsed: boolean;
  usedMock: boolean;
  warning?: string;
};

class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function sanitizeInput(input: string) {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_INPUT_LENGTH);
}

function sentenceFallback(input: string) {
  const sentences = input.match(/[^.!?]+[.!?]?/g) ?? [];
  const firstTwo = sentences.slice(0, 2).join(" ").trim();
  const clipped = firstTwo.slice(0, 300).trim();
  return `[Fallback summary] ${clipped || input.slice(0, 280).trim()}`;
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token && !STOP_WORDS.has(token));
}

function splitIntoSentences(text: string) {
  return (
    text
      .replace(/\s+/g, " ")
      .match(/[^.!?]+[.!?]?/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? []
  );
}

function createLocalSummary(input: string) {
  const sentences = splitIntoSentences(input);
  if (sentences.length === 0) return "";

  if (sentences.length <= 2) {
    return sentences.join(" ").slice(0, MAX_SUMMARY_LENGTH).trim();
  }

  const tokenFrequency = new Map<string, number>();
  for (const token of tokenize(input)) {
    tokenFrequency.set(token, (tokenFrequency.get(token) ?? 0) + 1);
  }

  const scoredSentences = sentences.map((sentence, index) => {
    const tokens = tokenize(sentence);
    const scoreFromFrequency = tokens.reduce((sum, token) => sum + (tokenFrequency.get(token) ?? 0), 0);
    const normalizedScore = tokens.length > 0 ? scoreFromFrequency / tokens.length : 0;
    const positionBias = Math.max(0, 5 - index) * 0.25;

    return {
      index,
      sentence,
      score: normalizedScore + positionBias,
    };
  });

  const selected = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence)
    .join(" ");

  return selected.slice(0, MAX_SUMMARY_LENGTH).trim();
}

function normalizeForSimilarity(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function jaccardSimilarity(a: string, b: string) {
  const setA = new Set(normalizeForSimilarity(a).split(" ").filter(Boolean));
  const setB = new Set(normalizeForSimilarity(b).split(" ").filter(Boolean));

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function isValidSummary(summary: string, input: string) {
  const trimmed = summary.trim();
  const similarity = jaccardSimilarity(trimmed, input);

  if (!trimmed) return false;
  if (trimmed.length < MIN_SUMMARY_LENGTH || trimmed.length > MAX_SUMMARY_LENGTH) return false;
  if (similarity > 0.85) return false;
  return true;
}

function createMockSummary(input: string) {
  return createLocalSummary(input);
}

function summarizeErrorType(error: unknown) {
  if (error instanceof TimeoutError) return "timeout";
  if (error instanceof OpenAI.RateLimitError) return "rate_limit";
  if (error instanceof OpenAI.AuthenticationError) return "invalid_api_key";
  if (error instanceof OpenAI.APIConnectionError) return "network_error";
  if (error instanceof OpenAI.APIError) return "openai_api_error";
  return "unknown_error";
}

async function summarizeWithOpenAI(input: string) {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  const completion = await openaiClient.responses.create({
    model: OPENAI_MODEL,
    temperature: 0.2,
    max_output_tokens: 220,
    input: [
      {
        role: "system",
        content:
          "You summarize documents for SaaS users. Keep summaries concise, factual, and plain English.",
      },
      {
        role: "user",
        content: `Summarize this document in 2-4 clear sentences:\n\n${input}`,
      },
    ],
  });

  return completion.output_text?.trim() ?? "";
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeoutId: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new TimeoutError("Summarization timed out")), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function summarizeDocument(rawInput: string): Promise<SummarizeResult> {
  const input = sanitizeInput(rawInput);
  if (!input) {
    return {
      summary: "[Fallback summary] Please provide a valid document to summarize.",
      fallbackUsed: true,
      usedMock: true,
      warning: "Empty input after sanitization.",
    };
  }

  let summary = "";
  let usedMock = false;
  let warning: string | undefined;

  if (!env.OPENAI_API_KEY?.trim()) {
    await sleep(200);
    usedMock = true;
    warning = "OPENAI_API_KEY is missing. Returned mocked summary.";
    summary = createMockSummary(input);
  } else {
    try {
      summary = await withTimeout(summarizeWithOpenAI(input), OPENAI_TIMEOUT_MS);
    } catch (error) {
      usedMock = true;
      warning = `OpenAI call failed (${summarizeErrorType(error)}). Returned mocked summary.`;
      summary = createMockSummary(input);
    }
  }

  if (!isValidSummary(summary, input)) {
    return {
      summary: sentenceFallback(input),
      fallbackUsed: true,
      usedMock,
      warning: warning ?? "Model output failed validation. Returned fallback summary.",
    };
  }

  return {
    summary,
    fallbackUsed: false,
    usedMock,
    warning,
  };
}

