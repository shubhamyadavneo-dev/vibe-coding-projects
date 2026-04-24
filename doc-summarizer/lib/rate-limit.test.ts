import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-24T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to five requests within the window and blocks the sixth", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");

    const attempts = Array.from({ length: 6 }, () => checkRateLimit("203.0.113.1"));

    expect(attempts[0]).toMatchObject({ allowed: true, remaining: 4, retryAfterMs: 0 });
    expect(attempts[4]).toMatchObject({ allowed: true, remaining: 0, retryAfterMs: 0 });
    expect(attempts[5].allowed).toBe(false);
    expect(attempts[5].remaining).toBe(0);
    expect(attempts[5].retryAfterMs).toBeGreaterThan(0);
  });

  it("resets the bucket after the window expires", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");

    for (let i = 0; i < 5; i += 1) {
      checkRateLimit("198.51.100.5");
    }

    expect(checkRateLimit("198.51.100.5").allowed).toBe(false);

    vi.advanceTimersByTime(60_001);

    expect(checkRateLimit("198.51.100.5")).toMatchObject({
      allowed: true,
      remaining: 4,
      retryAfterMs: 0,
    });
  });
});
