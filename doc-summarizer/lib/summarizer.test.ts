import { describe, expect, it } from "vitest";
import { sanitizeInput, summarizeDocument } from "@/lib/summarizer";

describe("sanitizeInput", () => {
  it("removes script tags and normalizes whitespace", () => {
    const input = "Hello <script>alert('xss')</script>     world";
    expect(sanitizeInput(input)).toBe("Hello world");
  });

  it("enforces max length", () => {
    const input = "a".repeat(13_000);
    expect(sanitizeInput(input)).toHaveLength(12_000);
  });
});

describe("summarizeDocument (no API key)", () => {
  it("returns local summary with warning when key is missing", async () => {
    const text =
      "DOCX support in this app allows extracting text from uploaded files. " +
      "The document processing route validates file size and type before parsing. " +
      "CSV and TXT uploads are also supported for easy summarization.";

    const result = await summarizeDocument(text);

    expect(result.usedMock).toBe(true);
    // Validation can force sentence fallback for very short/similar inputs.
    expect(typeof result.fallbackUsed).toBe("boolean");
    expect(result.warning).toContain("OPENAI_API_KEY is missing");
    expect(result.summary.length).toBeGreaterThanOrEqual(20);
    expect(result.summary.length).toBeLessThanOrEqual(500);
  });

  it("returns fallback for empty input", async () => {
    const result = await summarizeDocument("   ");
    expect(result.fallbackUsed).toBe(true);
    expect(result.usedMock).toBe(true);
    expect(result.summary).toContain("Please provide a valid document");
  });
});
