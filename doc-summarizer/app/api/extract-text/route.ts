import mammoth from "mammoth";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = new Set(["txt", "csv", "docx"]);

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function stripBom(text: string) {
  return text.replace(/^\uFEFF/, "");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Please upload a file under 5MB." },
        { status: 413 },
      );
    }

    const extension = getExtension(file.name);
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        { error: "Unsupported file type. Upload a TXT, CSV, or DOCX file." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    if (extension === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      extractedText = buffer.toString("utf8");
    }

    const normalized = stripBom(extractedText).trim();
    if (!normalized) {
      return NextResponse.json(
        { error: "Could not extract readable text from this file." },
        { status: 400 },
      );
    }

    return NextResponse.json({ extractedText: normalized });
  } catch {
    return NextResponse.json(
      { error: "Unable to process that file right now. Please try again." },
      { status: 500 },
    );
  }
}
