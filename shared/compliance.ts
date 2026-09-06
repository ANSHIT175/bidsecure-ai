export type UploadDocument = {
  name: string;
  type: string;
  text: string;
  pages?: number;
};

export type RequirementStatus = "Compliant" | "Non-compliant" | "Needs review" | "Insufficient evidence";

export type Requirement = {
  id: string;
  category: string;
  requirement: string;
  mandatory: boolean;
  status: RequirementStatus;
  sourceDocument: string;
  page: number;
  matchedEvidence: string;
  evidenceDocument?: string;
  evidencePage?: number;
  explanation: string;
  confidence: number;
  weight: number;
};

export type AnalysisSession = {
  sessionId: string;
  mode: "uploaded" | "demo";
  createdAt: string;
  tender: { name: string; type: string; pages: number; textLength: number };
  bidder: { documents: Array<{ name: string; type: string; pages: number; textLength: number }> };
  requirements: Requirement[];
  complianceScore: number;
  riskScore: number;
  summary: { compliant: number; nonCompliant: number; needsReview: number; insufficientEvidence: number };
  externalChecks: "not-configured";
  officerReview?: { decision: "Approved" | "Rejected" | "Needs clarification"; note: string; at: string };
};

const STOPWORDS = new Set(["the", "and", "for", "with", "from", "that", "this", "shall", "must", "provide", "submit", "bidder", "tender", "minimum"]);
const CATEGORY_RULES: Array<[string, RegExp]> = [
  ["Eligibility", /eligible|eligibility|incorporated|registered|gstin|pan|udyam|msme|blacklist/i],
  ["Technical", /technical|specification|capacity|rating|model|performance|compatib|standard|iso|bis|isi/i],
  ["Financial", /turnover|financial|revenue|net worth|solvency|earnest money|emd|security|crore|lakh|inr|₹/i],
  ["Experience", /experience|similar order|purchase order|work order|completion certificate|years/i],
  ["Delivery", /delivery|supply|completion|dispatch|calendar days|lead time|warranty/i],
  ["Certificates", /certificate|certification|license|authorization|oem|manufacturer|accreditation/i],
];

function clean(value: string) {
  return value.replace(/\u0000/g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function sentenceChunks(text: string) {
  return clean(text).split(/(?<=[.!?;:])\s+|\n+/).map((part) => part.trim()).filter((part) => part.length >= 25);
}

function categoryFor(text: string) {
  return CATEGORY_RULES.find(([, pattern]) => pattern.test(text))?.[0] ?? "Other mandatory condition";
}

function keywordsFor(text: string) {
  return Array.from(new Set((text.toLowerCase().match(/[a-z][a-z0-9-]{3,}/g) ?? []).filter((word) => !STOPWORDS.has(word)))).slice(0, 8);
}

function pageFor(index: number, textLength: number, pages: number) {
  if (!pages || pages <= 1 || !textLength) return 1;
  return Math.min(pages, Math.max(1, Math.floor((index / textLength) * pages) + 1));
}

function requirementCandidate(text: string) {
  return /(shall|must|required|minimum|eligib|submit|provide|attach|certificate|authorization|turnover|experience|delivery|warranty|security|emd|gst|pan|oem|technical|financial)/i.test(text);
}

export function extractRequirements(tender: UploadDocument): Requirement[] {
  const source = clean(tender.text);
  const sentences = sentenceChunks(source);
  const candidates = sentences.filter(requirementCandidate);
  const unique: string[] = [];
  for (const candidate of candidates) {
    const normalized = candidate.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (normalized.length > 24 && !unique.some((item) => item.includes(normalized.slice(0, 55)) || normalized.includes(item.slice(0, 55)))) unique.push(normalized);
  }
  const selected = (candidates.length ? candidates : sentences).filter((sentence) => {
    const normalized = sentence.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    return unique.includes(normalized) || !candidates.length;
  }).slice(0, 24);
  const fallback = selected.length ? selected : ["No machine-readable requirement clause was detected in this document; officer review is required."];
  return fallback.map((sentence, index) => {
    const mandatory = /shall|must|required|mandatory|minimum|eligib/i.test(sentence);
    const weight = mandatory ? 2 : 1;
    return {
      id: `REQ-${String(index + 1).padStart(2, "0")}`,
      category: categoryFor(sentence),
      requirement: sentence.replace(/\s+/g, " ").trim(),
      mandatory,
      status: "Insufficient evidence",
      sourceDocument: tender.name,
      page: pageFor(source.indexOf(sentence), source.length, tender.pages ?? 1),
      matchedEvidence: "Awaiting bidder evidence",
      explanation: "Requirement extracted from the uploaded tender; bidder evidence has not yet been matched.",
      confidence: candidates.length ? 0.82 : 0.38,
      weight,
    };
  });
}

function findEvidence(requirement: Requirement, docs: UploadDocument[]) {
  const reqKeywords = keywordsFor(requirement.requirement);
  let best: { doc: UploadDocument; index: number; score: number; excerpt: string } | undefined;
  for (const doc of docs) {
    const text = clean(doc.text);
    const lower = text.toLowerCase();
    const hits = reqKeywords.filter((keyword) => lower.includes(keyword));
    const score = hits.length / Math.max(1, reqKeywords.length);
    if (!best || score > best.score) {
      const firstHit = hits[0] ? lower.indexOf(hits[0]) : 0;
      best = { doc, index: Math.max(0, firstHit), score, excerpt: text.slice(Math.max(0, firstHit - 95), Math.min(text.length, firstHit + 235)) };
    }
  }
  return best;
}

const numberWords: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
function metricValue(text: string, unit: "years" | "days" | "crore" | "lakh") {
  const aliases = unit === "years" ? "years?" : unit === "days" ? "days?" : unit;
  const match = text.match(new RegExp(`(?:([\\d,.]+)|(${Object.keys(numberWords).join("|")}))(?:\\s|-)*(?:${aliases})`, "i"));
  if (!match) return undefined;
  return match[1] ? Number(match[1].replace(/,/g, "")) : numberWords[match[2].toLowerCase()];
}

function statusFor(requirement: Requirement, evidence: ReturnType<typeof findEvidence>): { status: RequirementStatus; explanation: string; confidence: number } {
  if (!evidence || !evidence.doc.text.trim()) return { status: "Insufficient evidence" as const, explanation: "No readable bidder document contains evidence relevant to this requirement.", confidence: 0.9 };
  if (evidence.score < 0.2) return { status: "Needs review" as const, explanation: "A weak keyword match was found, but the evidence needs officer validation against the original page.", confidence: 0.46 };
  const unit = /turnover|financial|crore|lakh|net worth/i.test(requirement.requirement) ? "crore" : /experience|years|warranty/i.test(requirement.requirement) ? "years" : /delivery|days|completion|lead time/i.test(requirement.requirement) ? "days" : undefined;
  if (unit) {
    const requiredValue = metricValue(requirement.requirement, unit);
    const evidenceValue = metricValue(evidence.doc.text, unit);
    if (requiredValue !== undefined && evidenceValue === undefined) return { status: "Needs review", explanation: "Relevant evidence was found, but the numeric threshold could not be verified automatically.", confidence: 0.57 };
    if (requiredValue !== undefined && evidenceValue !== undefined && (unit === "days" ? evidenceValue > requiredValue : evidenceValue < requiredValue)) return { status: "Non-compliant", explanation: `The uploaded evidence shows ${evidenceValue} ${unit}, which does not meet the tender threshold of ${requiredValue} ${unit}.`, confidence: 0.9 };
  }
  if (/\b(no|not|cannot|unable|does not)\b/i.test(evidence.excerpt) && requirement.mandatory) return { status: "Non-compliant", explanation: "The uploaded bidder evidence explicitly indicates that the mandatory condition is not met.", confidence: 0.78 };
  if (requirement.category === "Other mandatory condition" && evidence.score < 0.45) return { status: "Needs review" as const, explanation: "Related evidence was found, but the clause requires human interpretation.", confidence: 0.55 };
  return { status: "Compliant" as const, explanation: "Relevant evidence was found in the uploaded bidder documents. Confirm the source page before award.", confidence: Math.min(0.96, 0.62 + evidence.score * 0.3) };
}

export function verifyRequirements(requirements: Requirement[], bidderDocs: UploadDocument[]) {
  return requirements.map((requirement) => {
    const evidence = findEvidence(requirement, bidderDocs);
    const result = statusFor(requirement, evidence);
    const evidencePage = evidence ? pageFor(evidence.index, evidence.doc.text.length, evidence.doc.pages ?? 1) : undefined;
    return {
      ...requirement,
      status: result.status,
      evidenceDocument: evidence?.doc.name,
      evidencePage,
      matchedEvidence: evidence?.excerpt || "No matching readable evidence found",
      explanation: result.explanation,
      confidence: result.confidence,
    };
  });
}

export function buildSession(tender: UploadDocument, bidderDocs: UploadDocument[], mode: "uploaded" | "demo" = "uploaded"): AnalysisSession {
  const extracted = extractRequirements(tender);
  const verified = verifyRequirements(extracted, bidderDocs);
  const summary = {
    compliant: verified.filter((item) => item.status === "Compliant").length,
    nonCompliant: verified.filter((item) => item.status === "Non-compliant").length,
    needsReview: verified.filter((item) => item.status === "Needs review").length,
    insufficientEvidence: verified.filter((item) => item.status === "Insufficient evidence").length,
  };
  const totalWeight = verified.reduce((sum, item) => sum + item.weight, 0) || 1;
  const earned = verified.reduce((sum, item) => sum + (item.status === "Compliant" ? item.weight : 0), 0);
  const exceptions = summary.nonCompliant * 1.4 + summary.needsReview + summary.insufficientEvidence * 1.15;
  const riskScore = Math.min(100, Math.round((exceptions / Math.max(1, verified.length * 1.4)) * 100));
  return {
    sessionId: `sess_${Date.now().toString(36)}`,
    mode,
    createdAt: new Date().toISOString(),
    tender: { name: tender.name, type: tender.type, pages: tender.pages ?? 1, textLength: tender.text.length },
    bidder: { documents: bidderDocs.map((doc) => ({ name: doc.name, type: doc.type, pages: doc.pages ?? 1, textLength: doc.text.length })) },
    requirements: verified,
    complianceScore: Math.round((earned / totalWeight) * 100),
    riskScore,
    summary,
    externalChecks: "not-configured",
  };
}

export function reportText(session: AnalysisSession) {
  const review = session.officerReview;
  return [
    "BIDSECURE AI — COMPLIANCE VERIFICATION REPORT",
    `Session: ${session.sessionId}`,
    `Mode: ${session.mode === "demo" ? "Demo / sample documents" : "Uploaded documents"}`,
    `Created: ${session.createdAt}`,
    "",
    `Tender: ${session.tender.name}`,
    `Bidder documents: ${session.bidder.documents.map((doc) => doc.name).join(", ") || "None"}`,
    `Compliance score: ${session.complianceScore}%`,
    `Risk score: ${session.riskScore}/100`,
    `Summary: ${session.summary.compliant} compliant · ${session.summary.needsReview} needs review · ${session.summary.nonCompliant} non-compliant · ${session.summary.insufficientEvidence} insufficient evidence`,
    "",
    ...session.requirements.map((item) => [
      `${item.id} | ${item.status} | ${item.category}`,
      `Requirement: ${item.requirement}`,
      `Tender evidence: ${item.sourceDocument}, page ${item.page}`,
      `Bid evidence: ${item.evidenceDocument || "None"}, page ${item.evidencePage ?? "N/A"}`,
      `Reason: ${item.explanation}`,
      `Confidence: ${Math.round(item.confidence * 100)}%`,
    ].join("\n")),
    "",
    `Officer decision: ${review?.decision || "Not recorded"}`,
    `Officer note: ${review?.note || "None"}`,
    "",
    "External verification status: not configured. No live GeM, GSTN, MCA, BIS or government API was called.",
  ].join("\n");
}
