import { installDOMMatrixPolyfill } from "@/lib/dommatrix-polyfill";

installDOMMatrixPolyfill();

const OCR_PAGE_CAP = 3;
const OCR_SCALE = 1.75;

/**
 * Fallback for scanned PDFs: render pages to raster + Tesseract OCR.
 * Returns empty string if native canvas / pdfjs fails (e.g. some serverless hosts).
 */
export async function extractPdfTextWithOcr(buffer: Buffer): Promise<string> {
  try {
    const { createCanvas } = await import("canvas");
    const Tesseract = await import("tesseract.js");
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

    if (typeof pdfjs.GlobalWorkerOptions !== "undefined") {
      pdfjs.GlobalWorkerOptions.workerSrc = "";
    }

    const data = new Uint8Array(buffer);
    const loadingTask = pdfjs.getDocument({
      data,
      disableFontFace: true,
      useWorkerFetch: false,
      useSystemFonts: false,
      isOffscreenCanvasSupported: false,
      isImageDecoderSupported: false,
      disableAutoFetch: true,
      disableStream: true,
    });
    const pdf = await loadingTask.promise;
    const maxPages = Math.min(pdf.numPages, OCR_PAGE_CAP);
    const parts: string[] = [];

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: OCR_SCALE });
      const w = Math.max(1, Math.floor(viewport.width));
      const h = Math.max(1, Math.floor(viewport.height));
      const canvas = createCanvas(w, h);

      await page
        .render({
          canvas: canvas as unknown as HTMLCanvasElement,
          viewport,
        })
        .promise;

      const png = canvas.toBuffer("image/png");
      const {
        data: { text },
      } = await Tesseract.recognize(png, "eng", {
        logger: () => undefined,
      });
      if (text?.trim()) parts.push(text.trim());
    }

    await pdf.destroy();
    return parts.join("\n\n").trim();
  } catch {
    return "";
  }
}
