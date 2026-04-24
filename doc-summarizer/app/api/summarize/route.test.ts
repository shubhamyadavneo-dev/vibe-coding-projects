import { beforeEach, describe, expect, it, vi } from "vitest";

const checkRateLimitMock = vi.fn();
const summarizeDocumentMock = vi.fn();

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: checkRateLimitMock,
}));

vi.mock("@/lib/summarizer", () => ({
  summarizeDocument: summarizeDocumentMock,
}));

describe("POST /api/summarize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a summary payload when summarization succeeds", async () => {
    checkRateLimitMock.mockReturnValue({
      allowed: true,
      remaining: 4,
      retryAfterMs: 0,
    });
    summarizeDocumentMock.mockResolvedValue({
      summary: "A concise test summary.",
      fallbackUsed: false,
      usedMock: false,
      warning: undefined,
    });

    const { POST } = await import("@/app/api/summarize/route");
    const request = new Request("http://localhost/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "203.0.113.42",
      },
      body: JSON.stringify({ input: "Long form product document" }),
    });

    const response = await POST(request as never);
    const body = (await response.json()) as {
      summary?: string;
      fallbackUsed?: boolean;
      usedMock?: boolean;
    };

    expect(checkRateLimitMock).toHaveBeenCalledWith("203.0.113.42");
    expect(summarizeDocumentMock).toHaveBeenCalledWith("Long form product document");
    expect(response.status).toBe(200);
    expect(body).toEqual({
      summary: "A concise test summary.",
      fallbackUsed: false,
      warning: undefined,
      usedMock: false,
    });
  });

  it("returns 429 when the client is rate limited", async () => {
    checkRateLimitMock.mockReturnValue({
      allowed: false,
      remaining: 0,
      retryAfterMs: 42_000,
    });

    const { POST } = await import("@/app/api/summarize/route");
    const request = new Request("http://localhost/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-real-ip": "198.51.100.8",
      },
      body: JSON.stringify({ input: "Blocked request" }),
    });

    const response = await POST(request as never);
    const body = (await response.json()) as { error?: string };

    expect(summarizeDocumentMock).not.toHaveBeenCalled();
    expect(response.status).toBe(429);
    expect(body.error).toContain("Rate limit exceeded");
  });

  it("returns 500 when summarization throws", async () => {
    checkRateLimitMock.mockReturnValue({
      allowed: true,
      remaining: 4,
      retryAfterMs: 0,
    });
    summarizeDocumentMock.mockRejectedValue(new Error("boom"));

    const { POST } = await import("@/app/api/summarize/route");
    const request = new Request("http://localhost/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: "This request should fail" }),
    });

    const response = await POST(request as never);
    const body = (await response.json()) as { error?: string };

    expect(response.status).toBe(500);
    expect(body.error).toContain("Unable to summarize");
  });
});
