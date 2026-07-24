import { NextResponse } from "next/server";
import { extractText } from "unpdf";

export const runtime = "nodejs";

export const maxDuration = 60;

const MIN_TEXT_BEFORE_OCR = 60;

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { text, totalPages } = await extractText(new Uint8Array(buffer));
  const joined = Array.isArray(text) ? text.join("\n\n") : String(text);
  console.log(`[extract-pdf] extracted ${totalPages} page(s), ${joined.length} chars`);
  return joined.trim();
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdf") ?? formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "pdf/file required" }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    let text = await extractPdfText(buf);

    let ocrUsed = false;
    if (text.trim().length < MIN_TEXT_BEFORE_OCR) {
      try {
        const { extractPdfTextWithOcr } = await import("@/lib/ocr/extractPdfWithOcr");
        const ocrText = await extractPdfTextWithOcr(buf);
        if (ocrText.trim().length > text.trim().length) {
          text = ocrText;
          ocrUsed = true;
        }
      } catch {
        console.warn("[extract-pdf] OCR fallback unavailable in this runtime");
      }
    }

    return NextResponse.json({ text, ocrUsed });
  } catch (e) {
    console.error("[api/extract-pdf]", e);
    const msg = e instanceof Error ? e.message : "extract failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
