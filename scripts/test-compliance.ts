import { buildSession, reportText, type UploadDocument } from "../shared/compliance";

const tenderA: UploadDocument = { name: "Tender-A.txt", type: "text/plain", pages: 1, text: "The bidder must provide ISO 9001 certification and average annual turnover of INR 5 crore. Delivery must be completed within 30 days." };
const bidA: UploadDocument[] = [{ name: "Bid-A.txt", type: "text/plain", pages: 1, text: "ISO 9001 certificate attached. Average annual turnover INR 6 crore. Delivery commitment is 25 days." }];
const tenderB: UploadDocument = { name: "Tender-B.txt", type: "text/plain", pages: 1, text: "The bidder shall demonstrate three completed solar pump installations and provide OEM authorization. Warranty must be 24 months." };
const bidB: UploadDocument[] = [{ name: "Bid-B.txt", type: "text/plain", pages: 1, text: "Two pump installations are listed. No OEM authorization is attached. Warranty offered is 12 months." }];

const a = buildSession(tenderA, bidA);
const b = buildSession(tenderB, bidB);
if (a.requirements.map((item) => item.requirement).join("|") === b.requirements.map((item) => item.requirement).join("|")) throw new Error("Different tenders produced identical requirements");
if (a.sessionId === b.sessionId) throw new Error("Sessions are not unique");
if (reportText(a).includes("42 / 100") || reportText(b).includes("67%")) throw new Error("Report contains old fixed demo values");
console.log(JSON.stringify({ a: { requirements: a.requirements.length, score: a.complianceScore, risk: a.riskScore, summary: a.summary }, b: { requirements: b.requirements.length, score: b.complianceScore, risk: b.riskScore, summary: b.summary } }, null, 2));
