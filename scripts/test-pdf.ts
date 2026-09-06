import { readFile } from "node:fs/promises";
import handler from "../api/analyze";

function request(body: unknown) {
  return new Promise<{ status: number; json: any }>((resolve, reject) => {
    const req = { method: "POST", body } as any;
    const res = { statusCode: 200, status(code: number) { this.statusCode = code; return this; }, setHeader() { return this; }, json(value: unknown) { resolve({ status: this.statusCode, json: value }); return this; } } as any;
    Promise.resolve(handler(req, res)).catch(reject);
  });
}
const pdf = await readFile(new URL("./fixture-tender.pdf", import.meta.url));
const result = await request({ tender: { name: "fixture-tender.pdf", type: "application/pdf", data: pdf.toString("base64") }, bidderFiles: [] });
if (result.status !== 200 || result.json.session.tender.textLength < 50) throw new Error(JSON.stringify(result));
console.log(JSON.stringify({ status: result.status, pages: result.json.session.tender.pages, textLength: result.json.session.tender.textLength, requirements: result.json.session.requirements.length }, null, 2));
