import handler from "../api/analyze";

function b64(value: string) { return Buffer.from(value, "utf8").toString("base64"); }
function request(body: unknown) {
  return new Promise<{ status: number; json: unknown }>((resolve, reject) => {
    const req = { method: "POST", body } as any;
    const res = { statusCode: 200, status(code: number) { this.statusCode = code; return this; }, setHeader() { return this; }, json(value: unknown) { resolve({ status: this.statusCode, json: value }); return this; } } as any;
    Promise.resolve(handler(req, res)).catch(reject);
  });
}
const result = await request({ tender: { name: "api-tender.txt", type: "text/plain", data: b64("The bidder must provide ISO certification and turnover of INR 2 crore.") }, bidderFiles: [{ name: "api-bid.txt", type: "text/plain", data: b64("ISO certificate attached. Turnover INR 3 crore.") }] });
if (result.status !== 200) throw new Error(JSON.stringify(result));
const body = result.json as any;
if (!body.session?.requirements?.length || body.session.tender.textLength <= 0) throw new Error("API did not return extracted document data");
console.log(JSON.stringify({ status: result.status, requirements: body.session.requirements.length, score: body.session.complianceScore, tenderTextLength: body.session.tender.textLength }, null, 2));
