import type { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzeBody } from "../server/analyze-core";

export const config = { api: { bodyParser: { sizeLimit: "12mb" }, responseLimit: "6mb" }, maxDuration: 30 };

function json(res: VercelResponse, status: number, body: unknown) {
  res.status(status).setHeader("Content-Type", "application/json").json(body);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return json(res, 405, { error: "POST JSON only" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    return json(res, 200, await analyzeBody(body));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Document processing failed.";
    return json(res, 422, { error: message, guidance: "Scanned/image-only PDFs need an OCR provider. This route does not fabricate text when extraction returns empty." });
  }
}
