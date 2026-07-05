import mammoth from "mammoth";

export type SupportedFileType = "pdf" | "docx";

export function detectFileType(fileName: string, mimeType: string): SupportedFileType {
  if (mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
    return "pdf";
  }
  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.toLowerCase().endsWith(".docx")
  ) {
    return "docx";
  }
  throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
}

export async function extractTextFromFile(
  buffer: Buffer,
  fileType: SupportedFileType,
): Promise<string> {
  if (fileType === "pdf") {
    // Import the internal module directly: pdf-parse's package-root index.js
    // runs a debug self-test on load when `module.parent` is falsy, which
    // misfires under bundlers (Turbopack/webpack) and throws an ENOENT.
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const result = await pdfParse(buffer);
    return result.text.trim();
  }

  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}
