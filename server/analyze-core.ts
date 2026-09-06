import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { buildSession, type UploadDocument } from "../shared/compliance";

export type IncomingFile = { name: string; type?: string; data: string };

function normalizeType(file: IncomingFile) {
  return (file.type || "").toLowerCase() || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : file.name.toLowerCase().endsWith(".docx") ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/octet-stream");
}

async function extract(file: IncomingFile): Promise<UploadDocument> {
  const type = normalizeType(file);
  const buffer = Buffer.from(file.data, "base64");
  if (!buffer.length) throw new Error(`${file.name}: empty file`);
  if (type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf")) {
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    return { name: file.name, type, text: parsed.text.trim(), pages: parsed.total || 1 };
  }
  if (type.includes("word") || type.includes("document") || file.name.toLowerCase().endsWith(".docx")) {
    const parsed = await mammoth.extractRawText({ buffer });
    return { name: file.name, type, text: parsed.value.trim(), pages: Math.max(1, Math.ceil(parsed.value.length / 2800)) };
  }
  if (type.startsWith("text/") || file.name.toLowerCase().endsWith(".txt")) return { name: file.name, type, text: buffer.toString("utf8").trim(), pages: 1 };
  throw new Error(`${file.name}: unsupported type. Upload PDF, DOCX or TXT.`);
}

export async function analyzeBody(body: any) {
  const tenderFile = body?.tender as IncomingFile | undefined;
  const bidderFiles = (body?.bidderFiles || []) as IncomingFile[];
  if (!tenderFile) throw new Error("A tender file is required.");
  if (!Array.isArray(bidderFiles)) throw new Error("bidderFiles must be an array.");
  const tender = await extract(tenderFile);
  const bidderDocs = await Promise.all(bidderFiles.map(extract));
  const mode = body?.mode === "demo" ? "demo" : "uploaded";
  const session = buildSession(tender, bidderDocs, mode);
  return { session, processing: { tenderTextExtracted: tender.text.length > 0, bidderDocumentsProcessed: bidderDocs.length, ocr: "not-configured" } };
}
