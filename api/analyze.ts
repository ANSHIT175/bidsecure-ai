import type { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzeBody } from "../server/analyze-tender";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "12mb",
    },
    responseLimit: false,
  },
};

function json(
  res: VercelResponse,
  status: number,
  body: unknown
) {
  res.status(status);
  res.setHeader("Content-Type", "application/json");
  return res.json(body);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Always return JSON, even for errors
  try {
    if (req.method !== "POST") {
      return json(res, 405, {
        error: "Method not allowed",
      });
    }

    let body: any;

    try {
      body =
        typeof req.body === "string"
          ? JSON.parse(req.body)
          : req.body;
    } catch {
      return json(res, 400, {
        error: "Invalid JSON request body",
      });
    }

    if (!body) {
      return json(res, 400, {
        error: "Request body is required",
      });
    }

    const result = await analyzeBody(body);

    return json(res, 200, result);
  } catch (error) {
    console.error("Analyze API error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Document processing failed.";

    return json(res, 422, {
      error: message,
      guidance:
        "Unable to process the document. Please try a smaller PDF or a text-based PDF.",
    });
  }
}
