import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { summarizeDocument } from "@/lib/summarizer";

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(clientIp);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please try again in a minute.",
      },
      { status: 429 },
    );
  }

  let input = "";
  let success = false;
  let fallbackUsed = false;
  let outputLength = 0;

  try {
    const body = (await req.json()) as { input?: string };
    input = String(body.input ?? "");
    const result = await summarizeDocument(input);

    fallbackUsed = result.fallbackUsed;
    outputLength = result.summary.length;
    success = true;

    return NextResponse.json({
      summary: result.summary,
      fallbackUsed: result.fallbackUsed,
      warning: result.warning,
      usedMock: result.usedMock,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to summarize the document right now. Please try again." },
      { status: 500 },
    );
  } finally {
    console.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        inputLength: input.length,
        outputLength,
        responseTime: Date.now() - startedAt,
        success,
        fallbackUsed,
        tokenEstimate: Math.ceil(input.length / 4),
      }),
    );
  }
}

