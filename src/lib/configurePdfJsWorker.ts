import fs from "fs";
import { getPdfJsWorkerPath } from "@/lib/pdfjsWorkerPath";

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

/**
 * pdfjs worker must be loadable at runtime. Next/Vercel tracing sometimes omits
 * `pdf.worker.mjs` from the lambda; fall back to unpkg using the same dist version.
 */
export function configurePdfJsWorker(pdfjs: PdfJsModule) {
  const local = getPdfJsWorkerPath();
  if (fs.existsSync(local)) {
    pdfjs.GlobalWorkerOptions.workerSrc = local;
    return;
  }
  const v = pdfjs.version ?? "5.4.296";
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${v}/legacy/build/pdf.worker.mjs`;
}
