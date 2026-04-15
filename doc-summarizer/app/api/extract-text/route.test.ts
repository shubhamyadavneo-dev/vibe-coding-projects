import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/extract-text/route";

describe("POST /api/extract-text", () => {
  it("extracts plain text from csv upload", async () => {
    const formData = new FormData();
    const file = new File(["name,score\njohn,90"], "report.csv", { type: "text/csv" });
    formData.append("file", file);

    const req = new Request("http://localhost/api/extract-text", {
      method: "POST",
      body: formData,
    });

    const response = await POST(req);
    const body = (await response.json()) as { extractedText?: string };

    expect(response.status).toBe(200);
    expect(body.extractedText).toContain("name,score");
  });

  it("rejects unsupported file types", async () => {
    const formData = new FormData();
    const file = new File(["fake-content"], "slides.pptx", {
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });
    formData.append("file", file);

    const req = new Request("http://localhost/api/extract-text", {
      method: "POST",
      body: formData,
    });

    const response = await POST(req);
    const body = (await response.json()) as { error?: string };

    expect(response.status).toBe(400);
    expect(body.error).toContain("Unsupported file type");
  });
});
