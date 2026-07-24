import { PDFDocument } from "pdf-lib";

/**
 * Compress a PDF buffer by re-serializing with pdf-lib.
 * Strips unused objects, orphan streams, and metadata bloat.
 * Returns the smaller of original vs compressed.
 */
export async function compressPdf(input: Buffer): Promise<Buffer> {
  try {
    const doc = await PDFDocument.load(input, { ignoreEncryption: true });
    const compressed = await doc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });
    const out = Buffer.from(compressed);
    return out.length < input.length ? out : input;
  } catch {
    return input;
  }
}
