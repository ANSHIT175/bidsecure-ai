# BidSecure AI — SIH26100

This repository contains the repaired BidSecure AI prototype for **SIH26100: AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement**.

## What was fixed

The previous implementation was a client-only UI with all requirements, evidence, scores, officer findings, and reports hardcoded in `client/src/pages/Home.tsx`. It had no upload API, parser, OCR path, persistence layer, or Vercel serverless function.

The current implementation processes the current session's uploaded documents through:

```text
Tender upload → PDF/DOCX/TXT text extraction → requirement extraction
→ bidder document processing → evidence matching → deterministic verification
→ calculated compliance/risk scores → officer decision → current-session report
```

## Document processing

- **PDF:** parsed server-side with `pdf-parse` v2 (`PDFParse`).
- **DOCX:** parsed server-side with `mammoth`.
- **TXT:** supported for deterministic testing and lightweight demos.
- **Scanned/image-only PDFs:** not silently fabricated. The API exposes `ocr: "not-configured"` and returns an empty/insufficient-evidence outcome. Configure a production OCR provider before relying on scanned documents.
- **External verification:** GeM, GSTN, MCA, BIS and other government adapters are not configured. The UI and report explicitly state this; no live access is claimed.

## API

`POST /api/analyze`

```json
{
  "tender": { "name": "tender.pdf", "type": "application/pdf", "data": "<base64>" },
  "bidderFiles": [
    { "name": "bidder.pdf", "type": "application/pdf", "data": "<base64>" }
  ],
  "mode": "uploaded"
}
```

The route is available as:

- `api/analyze.ts` for Vercel serverless deployment.
- `/api/analyze` in the Vite development server.
- `/api/analyze` in the bundled Express server used by `pnpm start`.

## Local development

```bash
pnpm install
pnpm run dev
```

Open the local URL shown by Vite. Upload a tender, click **Extract from upload**, then add one or more bidder documents and click **Run verification**. The current analysis session and officer decision are persisted in browser `localStorage` so a page reload does not erase the active case; uploaded file bytes are intentionally not persisted.

## Vercel deployment

The repository includes `vercel.json`. Deploy with the repository root as the project root and the default build command:

```bash
pnpm install
pnpm run build
```

No AI/API key is required for the deterministic extraction and verification path. **No OCR provider is currently configured and no OCR environment variable is read by this repository.** For scanned PDFs, add a server-side OCR provider and its provider-specific credentials as Vercel Environment Variables (for example, an `OCR_PROVIDER` selector and an `OCR_API_KEY`, if required by the chosen provider), then replace the explicit OCR-required path in `server/analyze-core.ts`. Keep all OCR and external-verification secrets server-side.

## Testing

```bash
pnpm run check
pnpm run build
pnpm exec tsx scripts/test-compliance.ts
pnpm exec tsx scripts/test-api.ts
pnpm exec tsx scripts/test-pdf.ts
pnpm exec tsx scripts/test-production-e2e.ts
```

The two-tender test verifies that different tender/bid text produces different requirement content, scores, risk, findings, and reports. The API tests verify uploaded text and a real generated PDF pass through the server-side processing route.
