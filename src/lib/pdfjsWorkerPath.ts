import fs from "fs";
import path from "path";

/**
 * Absolute path to pdfjs worker. Tries hoisted + nested installs (Vercel/npm flattening).
 */
export function getPdfJsWorkerPath(): string {
  const root = process.cwd();
  const relativeCandidates = [
    ["node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs"],
    ["node_modules", "pdf-parse", "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs"],
  ];
  for (const parts of relativeCandidates) {
    const p = path.join(root, ...parts);
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      /* ignore */
    }
  }
  return path.join(root, ...relativeCandidates[0]);
}
