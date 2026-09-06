import { readFile } from "node:fs/promises";
import { reportText } from "../shared/compliance";

async function payload(path: string, name: string, type: string) { return { name, type, data: (await readFile(path)).toString("base64") }; }
async function analyze(tender: any, bidderFiles: any[]) { const response = await fetch("http://127.0.0.1:3010/api/analyze", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tender, bidderFiles }) }); const body = await response.json(); if (!response.ok) throw new Error(JSON.stringify(body)); return body.session; }
const tenderA = await payload("scripts/fixture-tender.pdf", "Tender-A.pdf", "application/pdf");
const bidderA = await payload("scripts/bidder-a.pdf", "Bidder-A.pdf", "application/pdf");
const tenderB = await payload("scripts/docx-out/tender-b.docx", "Tender-B.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
const bidderB = await payload("scripts/docx-out/bidder-b.docx", "Bidder-B.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
const a = await analyze(tenderA, [bidderA]);
const b = await analyze(tenderB, [bidderB]);
const aReq = a.requirements.map((item: any) => item.requirement).join("|");
const bReq = b.requirements.map((item: any) => item.requirement).join("|");
if (aReq === bReq) throw new Error("Tender A and Tender B requirements are identical");
if (a.complianceScore === b.complianceScore && a.riskScore === b.riskScore) throw new Error("Tender A and Tender B scores did not change");
if (a.requirements.some((item: any) => item.sourceDocument !== "Tender-A.pdf") || b.requirements.some((item: any) => item.sourceDocument !== "Tender-B.docx")) throw new Error("Source document references are not session-specific");
const reportA = reportText(a); const reportB = reportText(b);
if (reportA === reportB || !reportA.includes("Tender-A.pdf") || !reportB.includes("Tender-B.docx")) throw new Error("Generated reports are not session-specific");
console.log(JSON.stringify({ tenderA: { requirements: a.requirements.length, statuses: a.requirements.map((item: any) => item.status), score: a.complianceScore, risk: a.riskScore, reportHasTender: a.tender.name, reportLength: reportA.length }, tenderB: { requirements: b.requirements.length, statuses: b.requirements.map((item: any) => item.status), score: b.complianceScore, risk: b.riskScore, reportHasTender: b.tender.name, reportLength: reportB.length } }, null, 2));
