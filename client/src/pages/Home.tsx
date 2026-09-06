import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  ClipboardCheck,
  Clock3,
  CloudUpload,
  Download,
  FileCheck2,
  FileSearch,
  FileText,
  Filter,
  FolderOpen,
  Gauge,
  HelpCircle,
  Info,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  Paperclip,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

type Section = "dashboard" | "tender" | "requirements" | "verification" | "review" | "reports";
type Status = "Compliant" | "Non-compliant" | "Needs review";

type Requirement = {
  id: string;
  category: string;
  requirement: string;
  mandatory: boolean;
  status: Status;
  evidence: string;
  page: string;
  note: string;
  weight: string;
};

const requirements: Requirement[] = [
  {
    id: "REQ-01",
    category: "Authorization",
    requirement: "OEM authorization letter for the offered safety equipment",
    mandatory: true,
    status: "Compliant",
    evidence: "OEM_Authorization_Letter.pdf",
    page: "p. 4",
    note: "Signed letter from SafePro India Pvt. Ltd. matches the offered product range.",
    weight: "15 pts",
  },
  {
    id: "REQ-02",
    category: "Quality",
    requirement: "BIS / ISI certification for industrial helmets and safety shoes",
    mandatory: true,
    status: "Compliant",
    evidence: "Product_Compliance_Dossier.pdf",
    page: "p. 9",
    note: "Certificate numbers and product codes match the tender schedule.",
    weight: "20 pts",
  },
  {
    id: "REQ-03",
    category: "Experience",
    requirement: "At least 3 similar government or PSU orders executed in the last 5 years",
    mandatory: true,
    status: "Non-compliant",
    evidence: "Past_Performance_Orders.pdf",
    page: "p. 12",
    note: "Only 2 qualifying PSU purchase orders are evidenced; third order is from a private buyer.",
    weight: "25 pts",
  },
  {
    id: "REQ-04",
    category: "Financial",
    requirement: "Average annual turnover of at least ₹5 crore across the last 3 financial years",
    mandatory: true,
    status: "Needs review",
    evidence: "Financial_Capability_Statement.pdf",
    page: "p. 15",
    note: "Reported turnover clears the threshold, but FY 2023–24 figures need CA-attested schedule validation.",
    weight: "20 pts",
  },
  {
    id: "REQ-05",
    category: "Delivery",
    requirement: "Complete delivery within 45 calendar days from purchase order",
    mandatory: true,
    status: "Compliant",
    evidence: "Technical_Offer_and_Delivery.pdf",
    page: "p. 18",
    note: "Bidder commits to 30-day delivery for all listed line items.",
    weight: "10 pts",
  },
  {
    id: "REQ-06",
    category: "Bid security",
    requirement: "Earnest money deposit of ₹7.5 lakh through an acceptable bank guarantee",
    mandatory: true,
    status: "Compliant",
    evidence: "EMD_Bank_Guarantee.pdf",
    page: "p. 2",
    note: "Bank guarantee amount and validity align with the tender conditions.",
    weight: "10 pts",
  },
];

const sampleTender = {
  id: "MOPNG/CPSE/2026/0147",
  title: "Supply of Industrial Safety Equipment for Refineries",
  buyer: "Central Procurement Cell · Ministry of Petroleum & Natural Gas",
  category: "Personal Protective Equipment",
  published: "02 Sep 2026",
  deadline: "18 Sep 2026 · 17:00 IST",
  value: "₹3.8 crore estimated",
  documents: ["Tender_Conditions.pdf", "Technical_Schedule.xlsx", "Price_Bid_Format.xlsx"],
};

const sampleBidder = {
  name: "SafePro Industrial Solutions Pvt. Ltd.",
  location: "Pune, Maharashtra",
  gstin: "27AABCS4821K1Z7",
  udyam: "UDYAM-MH-26-0048123",
  documents: [
    "EMD_Bank_Guarantee.pdf",
    "OEM_Authorization_Letter.pdf",
    "Product_Compliance_Dossier.pdf",
    "Past_Performance_Orders.pdf",
    "Financial_Capability_Statement.pdf",
    "Technical_Offer_and_Delivery.pdf",
  ],
};

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard; hint?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tender", label: "Tender intake", icon: Upload, hint: "01" },
  { id: "requirements", label: "Requirements", icon: FileSearch, hint: "02" },
  { id: "verification", label: "Bid verification", icon: ClipboardCheck, hint: "03" },
  { id: "review", label: "Officer review", icon: ShieldCheck, hint: "04" },
  { id: "reports", label: "Reports", icon: BarChart3, hint: "05" },
];

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Compliant: "status-badge status-success",
    "Non-compliant": "status-badge status-danger",
    "Needs review": "status-badge status-warning",
  };
  const Icon = status === "Compliant" ? CheckCircle2 : status === "Non-compliant" ? XCircle : AlertTriangle;
  return (
    <span className={styles[status]}>
      <Icon size={13} strokeWidth={2.4} /> {status}
    </span>
  );
}

function StepPill({ label, state, number }: { label: string; state: "done" | "active" | "pending"; number: string }) {
  return (
    <div className={`step-pill ${state}`}>
      <span className="step-number">{state === "done" ? <Check size={13} /> : number}</span>
      <span>{label}</span>
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon, tone }: { label: string; value: string; detail: string; icon: typeof Gauge; tone: string }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}><Icon size={19} /></div>
      <div className="metric-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
    </div>
  );
}

function AppLogo() {
  return (
    <div className="brand-lockup">
      <div className="brand-mark"><span>BS</span></div>
      <div>
        <div className="brand-name">BidSecure <span>AI</span></div>
        <div className="brand-subtitle">Compliance intelligence for GeM procurement</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [requirementsExtracted, setRequirementsExtracted] = useState(false);
  const [bidUploaded, setBidUploaded] = useState(false);
  const [verified, setVerified] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement>(requirements[2]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState("Ready for a guided demonstration.");
  const [reviewNote, setReviewNote] = useState("");
  const tenderInputRef = useRef<HTMLInputElement>(null);
  const bidInputRef = useRef<HTMLInputElement>(null);

  const filteredRequirements = useMemo(
    () => requirements.filter((item) => `${item.id} ${item.category} ${item.requirement}`.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery],
  );

  const completedSteps = [demoLoaded, requirementsExtracted, bidUploaded, verified, reviewed];

  const loadDemo = () => {
    setDemoLoaded(true);
    setRequirementsExtracted(true);
    setBidUploaded(true);
    setVerified(true);
    setReviewed(false);
    setSelectedRequirement(requirements[2]);
    setNotice("Demo case loaded: tender, bid documents and rule-based verification are ready.");
    setActiveSection("dashboard");
  };

  const resetDemo = () => {
    setDemoLoaded(false);
    setRequirementsExtracted(false);
    setBidUploaded(false);
    setVerified(false);
    setReviewed(false);
    setNotice("New verification workspace created. Add a tender to begin.");
    setActiveSection("tender");
  };

  const uploadFile = (type: "tender" | "bid", file?: File) => {
    if (!file) return;
    if (type === "tender") {
      setDemoLoaded(true);
      setRequirementsExtracted(false);
      setNotice(`${file.name} added to tender intake. Extract requirements to continue.`);
    } else {
      setBidUploaded(true);
      setVerified(false);
      setNotice(`${file.name} added to bidder documents. Run verification to generate findings.`);
    }
  };

  const extractRequirements = () => {
    setRequirementsExtracted(true);
    setNotice("6 mandatory requirements extracted from the tender. Review the evidence map before verification.");
    setActiveSection("requirements");
  };

  const runVerification = () => {
    setVerified(true);
    setReviewed(false);
    setNotice("Verification completed using deterministic rules and mock verification adapters. 4 compliant · 1 needs review · 1 non-compliant.");
    setActiveSection("verification");
  };

  const approveReview = () => {
    setReviewed(true);
    setNotice("Officer review recorded. Compliance report is now ready to generate.");
    setActiveSection("reports");
  };

  const generateReport = () => {
    const report = [
      "BIDSECURE AI — COMPLIANCE VERIFICATION REPORT",
      "Prototype for SIH26100 | Smart Automation | Ministry of Petroleum & Natural Gas",
      "",
      `Tender: ${sampleTender.id}`,
      `Title: ${sampleTender.title}`,
      `Bidder: ${sampleBidder.name}`,
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      "Verification mode: Demo / rule-based mock adapters",
      "",
      "OUTCOME: NEEDS OFFICER REVIEW",
      "Risk score: 42 / 100 (Moderate)",
      "Compliance: 4 compliant · 1 needs review · 1 non-compliant",
      "",
      ...requirements.map((item) => `${item.id} | ${item.status.toUpperCase()} | ${item.requirement} | ${item.evidence}, ${item.page}`),
      "",
      `Officer note: ${reviewNote || "Pending final officer note."}`,
      "",
      "This report is a product prototype. No live GeM, GSTN, MCA, BIS or government verification API was called.",
    ].join("\n");
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BidSecure_${sampleTender.id.replaceAll("/", "-")}_compliance-report.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Compliance report downloaded. The report retains evidence document and page references.");
  };

  const jumpTo = (section: Section) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <AppLogo />
          <div className="workspace-chip"><span className="workspace-dot" /> Procurement workspace <ChevronDown size={14} /></div>
        </div>
        <nav className="side-nav" aria-label="Main navigation">
          <div className="nav-section-label">WORKSPACE</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={`nav-item ${activeSection === item.id ? "active" : ""}`} onClick={() => jumpTo(item.id)}>
                <Icon size={18} strokeWidth={activeSection === item.id ? 2.3 : 1.9} />
                <span>{item.label}</span>
                {item.hint && <em>{item.hint}</em>}
              </button>
            );
          })}
          <div className="nav-section-label nav-section-spaced">SYSTEM</div>
          <button className="nav-item" onClick={() => setNotice("Audit trail is available for the active demo case.")}><Clock3 size={18} /><span>Audit trail</span></button>
          <button className="nav-item" onClick={() => setNotice("Source registry is in demo mode; live adapters are not connected.")}><LockKeyhole size={18} /><span>Verification sources</span></button>
          <button className="nav-item" onClick={() => setNotice("Settings are intentionally locked for this internal prototype.")}><BriefcaseBusiness size={18} /><span>Workspace settings</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-note"><LockKeyhole size={15} /><div><strong>Demo environment</strong><span>No external data leaves this prototype.</span></div></div>
          <div className="user-card"><div className="avatar">PO</div><div><strong>Procurement Officer</strong><span>Internal review role</span></div><MoreHorizontal size={17} /></div>
        </div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <div className="mobile-menu"><Menu size={20} /></div>
          <div className="breadcrumb"><span>SIH26100</span><ArrowRight size={13} /><strong>{navItems.find((item) => item.id === activeSection)?.label}</strong></div>
          <div className="topbar-actions">
            <div className="secure-label"><span className="secure-dot" /> Mock verification mode</div>
            <button className="icon-button" aria-label="Notifications" onClick={() => setNotice("No new alerts. Demo workspace is up to date.")}><Bell size={18} /><span className="notification-dot" /></button>
            <div className="top-user"><div className="avatar small">PO</div><div><strong>Procurement Officer</strong><span>Ministry of Petroleum & Natural Gas</span></div><ChevronDown size={15} /></div>
          </div>
        </header>

        <div className="content-wrap">
          <section className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> SIH26100 · SMART AUTOMATION</div>
              <h1>{activeSection === "dashboard" ? "Compliance command centre" : navItems.find((item) => item.id === activeSection)?.label}</h1>
              <p>{activeSection === "dashboard" ? "Turn tender conditions and bidder submissions into an auditable compliance decision." : "Trace every requirement from the tender clause to the officer decision."}</p>
            </div>
            <div className="heading-actions">
              <button className="btn btn-secondary" onClick={resetDemo}><RefreshCw size={16} /> New verification</button>
              <button className="btn btn-primary" onClick={loadDemo}><Sparkles size={16} /> Launch demo</button>
            </div>
          </section>

          <div className="notice-bar"><Info size={16} /><span>{notice}</span><button onClick={() => setNotice("Ready for a guided demonstration.")}><X size={15} /></button></div>

          <section className="workflow-strip" aria-label="Verification workflow">
            <div className="workflow-copy"><span className="workflow-kicker">GUIDED WORKFLOW</span><strong>Verification lifecycle</strong></div>
            <div className="workflow-steps">
              <StepPill number="01" label="Tender" state={completedSteps[0] ? "done" : "active"} />
              <span className="workflow-connector" />
              <StepPill number="02" label="Extract" state={requirementsExtracted ? "done" : demoLoaded ? "active" : "pending"} />
              <span className="workflow-connector" />
              <StepPill number="03" label="Verify" state={verified ? "done" : bidUploaded ? "active" : "pending"} />
              <span className="workflow-connector" />
              <StepPill number="04" label="Review" state={reviewed ? "done" : verified ? "active" : "pending"} />
              <span className="workflow-connector" />
              <StepPill number="05" label="Report" state={reviewed ? "done" : "pending"} />
            </div>
          </section>

          {activeSection === "dashboard" && (
            <DashboardView demoLoaded={demoLoaded} verified={verified} requirementsExtracted={requirementsExtracted} bidUploaded={bidUploaded} reviewed={reviewed} onLoadDemo={loadDemo} onJump={jumpTo} />
          )}
          {activeSection === "tender" && (
            <TenderView demoLoaded={demoLoaded} requirementsExtracted={requirementsExtracted} tenderInputRef={tenderInputRef} onFile={(file) => uploadFile("tender", file)} onExtract={extractRequirements} onLoadDemo={loadDemo} onJump={jumpTo} />
          )}
          {activeSection === "requirements" && (
            <RequirementsView extracted={requirementsExtracted} query={searchQuery} setQuery={setSearchQuery} filtered={filteredRequirements} selected={selectedRequirement} onSelect={setSelectedRequirement} onExtract={extractRequirements} onJump={jumpTo} />
          )}
          {activeSection === "verification" && (
            <VerificationView bidUploaded={bidUploaded} verified={verified} bidInputRef={bidInputRef} onFile={(file) => uploadFile("bid", file)} onVerify={runVerification} onSelect={setSelectedRequirement} selected={selectedRequirement} onJump={jumpTo} />
          )}
          {activeSection === "review" && (
            <ReviewView verified={verified} reviewed={reviewed} note={reviewNote} setNote={setReviewNote} onApprove={approveReview} onJump={jumpTo} />
          )}
          {activeSection === "reports" && (
            <ReportsView verified={verified} reviewed={reviewed} onGenerate={generateReport} onJump={jumpTo} />
          )}
        </div>
        <footer className="footer"><span><strong>BidSecure AI</strong> · SIH26100 prototype</span><span>Ministry of Petroleum & Natural Gas · Smart Automation</span><span>Demo only — not a GeM or government portal</span></footer>
      </main>
    </div>
  );
}

function DashboardView({ demoLoaded, verified, requirementsExtracted, bidUploaded, reviewed, onLoadDemo, onJump }: { demoLoaded: boolean; verified: boolean; requirementsExtracted: boolean; bidUploaded: boolean; reviewed: boolean; onLoadDemo: () => void; onJump: (s: Section) => void }) {
  return (
    <>
      {!demoLoaded ? (
        <section className="empty-hero">
          <div className="empty-hero-copy"><div className="empty-icon"><FileCheck2 size={28} /></div><div className="eyebrow">START WITH A REALISTIC CASE</div><h2>From tender clause to defensible decision.</h2><p>Load the prepared refinery safety equipment tender to walk through requirement extraction, bid matching, risk scoring, officer review, and report generation in under two minutes.</p><div className="empty-actions"><button className="btn btn-primary" onClick={onLoadDemo}><Sparkles size={16} /> Launch guided demo</button><button className="text-button" onClick={() => onJump("tender")}>Upload your own tender <ArrowRight size={15} /></button></div></div>
          <div className="empty-hero-visual"><div className="document-stack"><div className="doc-back" /><div className="doc-mid" /><div className="doc-front"><div className="doc-topline" /><div className="doc-titleline" /><div className="doc-line" /><div className="doc-line short" /><div className="doc-check"><Check size={13} /></div><div className="doc-line" /><div className="doc-line mid" /></div><div className="scan-tag"><FileSearch size={15} /> 6 requirements detected</div></div></div>
        </section>
      ) : (
        <>
          <section className="case-banner"><div className="case-banner-left"><div className="case-status"><span className="pulse-dot" /> DEMO CASE ACTIVE</div><h2>{sampleTender.title}</h2><p>{sampleTender.id} <span>·</span> {sampleTender.buyer}</p></div><div className="case-banner-right"><span className="case-label">DECISION STATUS</span><strong className={reviewed ? "text-green" : "text-amber"}>{reviewed ? "Report ready" : verified ? "Needs officer review" : "In progress"}</strong><button className="btn btn-light" onClick={() => onJump("verification")}>Open case <ArrowRight size={15} /></button></div></section>
          <div className="metrics-grid"><MetricCard label="Requirements" value="6" detail={requirementsExtracted ? "Extracted from tender" : "Awaiting extraction"} icon={FileSearch} tone="blue" /><MetricCard label="Bid documents" value={bidUploaded ? "6 / 6" : "0 / 6"} detail={bidUploaded ? "Ready for verification" : "Upload bidder pack"} icon={FolderOpen} tone="teal" /><MetricCard label="Compliance score" value={verified ? "67%" : "—"} detail={verified ? "4 compliant · 2 exceptions" : "Run verification"} icon={Gauge} tone="amber" /><MetricCard label="Risk score" value={verified ? "42 / 100" : "—"} detail={verified ? "Moderate · officer action" : "Calculated after verification"} icon={AlertTriangle} tone="red" /></div>
          <div className="dashboard-grid"><section className="panel case-overview"><div className="panel-heading"><div><span className="panel-kicker">ACTIVE CASE</span><h3>Verification progress</h3></div><button className="icon-button subtle" onClick={() => onJump("reports")}><MoreHorizontal size={18} /></button></div><div className="progress-list"><ProgressRow number="01" label="Tender intake" detail="Conditions and schedules available" state="done" onClick={() => onJump("tender")} /><ProgressRow number="02" label="Requirement extraction" detail="6 mandatory conditions mapped" state="done" onClick={() => onJump("requirements")} /><ProgressRow number="03" label="Bid verification" detail="Rule engine evaluated 6 evidence groups" state={verified ? "done" : "active"} onClick={() => onJump("verification")} /><ProgressRow number="04" label="Officer review" detail={reviewed ? "Decision recorded" : "2 exceptions need attention"} state={reviewed ? "done" : verified ? "active" : "pending"} onClick={() => onJump("review")} /><ProgressRow number="05" label="Compliance report" detail={reviewed ? "Ready to download" : "Unlock after officer review"} state={reviewed ? "done" : "pending"} onClick={() => onJump("reports")} /></div></section><section className="panel activity-panel"><div className="panel-heading"><div><span className="panel-kicker">AUDIT TRAIL</span><h3>Recent activity</h3></div><button className="text-button" onClick={() => onJump("review")}>View case <ArrowRight size={14} /></button></div><div className="activity-list"><Activity icon={CheckCircle2} tone="green" title="Tender requirements extracted" detail="6 mandatory clauses mapped" time="10:28" /><Activity icon={FileCheck2} tone="blue" title="Bid documents indexed" detail="6 evidence documents linked" time="10:29" /><Activity icon={AlertTriangle} tone="amber" title="Verification completed" detail="2 exceptions flagged for review" time="10:30" /><Activity icon={UserRound} tone="slate" title="Officer review pending" detail="Assigned to Procurement Officer" time="10:30" /></div><div className="mock-source-note"><Info size={14} /><span>External checks are mocked in this prototype. No live GeM, GSTN, MCA or BIS connector is active.</span></div></section></div>
        </>
      )}
    </>
  );
}

function ProgressRow({ number, label, detail, state, onClick }: { number: string; label: string; detail: string; state: "done" | "active" | "pending"; onClick: () => void }) {
  return <button className="progress-row" onClick={onClick}><span className={`progress-marker ${state}`}>{state === "done" ? <Check size={13} /> : state === "active" ? <span /> : <CircleDashed size={15} />}</span><span className="progress-label"><strong>{number} · {label}</strong><small>{detail}</small></span><ArrowRight size={15} /></button>;
}

function Activity({ icon: Icon, tone, title, detail, time }: { icon: typeof CheckCircle2; tone: string; title: string; detail: string; time: string }) {
  return <div className="activity-row"><div className={`activity-icon ${tone}`}><Icon size={15} /></div><div><strong>{title}</strong><span>{detail}</span></div><time>{time}</time></div>;
}

function TenderView({ demoLoaded, requirementsExtracted, tenderInputRef, onFile, onExtract, onLoadDemo, onJump }: { demoLoaded: boolean; requirementsExtracted: boolean; tenderInputRef: React.RefObject<HTMLInputElement | null>; onFile: (file?: File) => void; onExtract: () => void; onLoadDemo: () => void; onJump: (s: Section) => void }) {
  return <div className="two-column-layout"><section className="panel main-panel"><div className="panel-heading"><div><span className="panel-kicker">STEP 01 · TENDER INTAKE</span><h3>Bring in a tender for verification</h3><p className="panel-subtitle">Add the tender PDF and schedules. For the demo, the prepared refinery safety equipment case is already structured for instant analysis.</p></div></div><input ref={tenderInputRef} type="file" accept=".pdf,.doc,.docx,.xlsx" hidden onChange={(e) => onFile(e.target.files?.[0])} /><button className="upload-zone" onClick={() => tenderInputRef.current?.click()}><span className="upload-icon"><CloudUpload size={23} /></span><strong>{demoLoaded ? "Tender file ready — add another version" : "Drop tender PDF here or browse"}</strong><span>PDF, DOCX or XLSX · up to 25 MB</span></button>{demoLoaded && <div className="file-card"><div className="file-type"><FileText size={18} /></div><div><strong>{sampleTender.id} · Tender_Conditions.pdf</strong><span>Loaded for demo analysis · 2.4 MB · 12 pages</span></div><BadgeCheck size={18} className="file-ok" /></div>}<div className="or-divider"><span>or use prepared demo case</span></div><button className="demo-case-card" onClick={onLoadDemo}><div className="case-doc-icon"><FileText size={19} /></div><div><strong>Industrial safety equipment tender</strong><span>Ministry of Petroleum & Natural Gas · 6 mandatory requirements</span></div><ArrowRight size={17} /></button>{demoLoaded && <div className="action-row"><button className="btn btn-primary" onClick={requirementsExtracted ? () => onJump("requirements") : onExtract}>{requirementsExtracted ? <><FileSearch size={16} /> Review extracted requirements</> : <><Sparkles size={16} /> Extract requirements</>}</button><button className="btn btn-secondary" onClick={() => onJump("requirements")}>View tender details</button></div>}</section><aside className="panel side-panel"><div className="panel-heading compact"><div><span className="panel-kicker">WHAT HAPPENS NEXT</span><h3>From document to decision</h3></div></div><div className="mini-process"><div><span>01</span><strong>Extract</strong><small>Find clauses, thresholds and deadlines.</small></div><div><span>02</span><strong>Map evidence</strong><small>Link each condition to a source page.</small></div><div><span>03</span><strong>Verify</strong><small>Run deterministic rules with explainable results.</small></div></div><div className="side-callout"><Info size={15} /><span>AI extraction is represented by a reviewable mock output in this MVP. A production build would connect OCR, document parsing and policy models here.</span></div></aside></div>;
}

function RequirementsView({ extracted, query, setQuery, filtered, selected, onSelect, onExtract, onJump }: { extracted: boolean; query: string; setQuery: (q: string) => void; filtered: Requirement[]; selected: Requirement; onSelect: (r: Requirement) => void; onExtract: () => void; onJump: (s: Section) => void }) {
  return <div className="two-column-layout requirements-layout"><section className="panel main-panel"><div className="panel-heading"><div><span className="panel-kicker">STEP 02 · REQUIREMENT EXTRACTION</span><h3>Requirement register</h3><p className="panel-subtitle">Every tender condition becomes a traceable check with a mandatory flag, evidence target and decision status.</p></div><div className="heading-stat"><strong>{extracted ? "6" : "0"}</strong><span>conditions</span></div></div>{!extracted && <div className="inline-empty"><FileSearch size={24} /><strong>No requirements extracted yet</strong><span>Load the demo or extract requirements from tender intake.</span><button className="btn btn-primary" onClick={onExtract}><Sparkles size={15} /> Extract demo requirements</button></div>}{extracted && <><div className="table-toolbar"><div className="search-field"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search requirement register" /></div><button className="filter-button"><Filter size={15} /> All statuses <ChevronDown size={14} /></button></div><div className="requirement-table"><div className="table-row table-header"><span>ID / category</span><span>Requirement</span><span>Result</span><span>Evidence</span></div>{filtered.map((item) => <button key={item.id} className={`table-row requirement-row ${selected.id === item.id ? "selected" : ""}`} onClick={() => onSelect(item)}><span><strong>{item.id}</strong><small>{item.category}</small></span><span className="requirement-text"><strong>{item.requirement}</strong><small>{item.mandatory ? "Mandatory condition" : "Scored condition"} · {item.weight}</small></span><span><StatusBadge status={item.status} /></span><span className="evidence-cell"><Paperclip size={14} /><span>{item.page}</span><ArrowRight size={14} /></span></button>)}</div></>}</section><aside className="panel evidence-panel"><div className="panel-heading compact"><div><span className="panel-kicker">SELECTED CONDITION</span><h3>{selected.id}</h3></div><StatusBadge status={selected.status} /></div><div className="condition-card"><span className="condition-category">{selected.category} · {selected.weight}</span><h4>{selected.requirement}</h4><div className="condition-meta"><span><AlertTriangle size={14} /> Mandatory</span><span><FileText size={14} /> Tender_Conditions.pdf</span><span><BookOpenCheck size={14} /> {selected.page}</span></div></div><div className="evidence-detail"><span className="panel-kicker">EVIDENCE TARGET</span><div className="evidence-file"><FileCheck2 size={17} /><div><strong>{selected.evidence}</strong><small>Bid document · {selected.page}</small></div><button className="icon-button subtle" onClick={() => onJump("verification")}><ArrowRight size={16} /></button></div><p>{selected.note}</p></div><div className="side-callout yellow"><Info size={15} /><span>Evidence references are generated from the prepared demo bundle. In production, each reference would link to a page-level viewer and hash.</span></div></aside></div>;
}

function VerificationView({ bidUploaded, verified, bidInputRef, onFile, onVerify, onSelect, selected, onJump }: { bidUploaded: boolean; verified: boolean; bidInputRef: React.RefObject<HTMLInputElement | null>; onFile: (file?: File) => void; onVerify: () => void; onSelect: (r: Requirement) => void; selected: Requirement; onJump: (s: Section) => void }) {
  return <div className="verification-page"><section className="panel bidder-banner"><div className="bidder-avatar">SP</div><div><span className="panel-kicker">STEP 03 · BIDDER DOCUMENTS</span><h3>{bidUploaded ? sampleBidder.name : "No bidder pack loaded"}</h3><p>{bidUploaded ? `${sampleBidder.location} · GSTIN ${sampleBidder.gstin} · Udyam ${sampleBidder.udyam}` : "Upload a bidder document set to compare against extracted conditions."}</p></div><div className="bidder-actions"><input ref={bidInputRef} type="file" accept=".pdf,.doc,.docx,.xlsx" hidden onChange={(e) => onFile(e.target.files?.[0])} /><button className="btn btn-secondary" onClick={() => bidInputRef.current?.click()}><Upload size={15} /> Add documents</button>{bidUploaded && <button className="btn btn-primary" onClick={onVerify}><ClipboardCheck size={15} /> {verified ? "Re-run verification" : "Run verification"}</button>}</div></section>{bidUploaded && <div className="verification-summary"><div className="summary-card"><div className="summary-ring"><strong>{verified ? "67" : "—"}<small>{verified ? "%" : ""}</small></strong></div><div><span className="panel-kicker">COMPLIANCE SCORE</span><h4>{verified ? "Exceptions require review" : "Ready to verify"}</h4><p>{verified ? "4 compliant · 1 needs review · 1 non-compliant" : "Rule engine has all 6 evidence groups available."}</p></div></div><div className="summary-stats"><div><strong className="text-green">{verified ? "4" : "—"}</strong><span>Compliant</span></div><div><strong className="text-amber">{verified ? "1" : "—"}</strong><span>Needs review</span></div><div><strong className="text-red">{verified ? "1" : "—"}</strong><span>Non-compliant</span></div><div><strong>{verified ? "42" : "—"}</strong><span>Risk / 100</span></div></div></div>}<section className="panel results-panel"><div className="panel-heading"><div><span className="panel-kicker">EXPLAINABLE RESULT MATRIX</span><h3>Clause-by-clause verification</h3><p className="panel-subtitle">Select a row to inspect the source document and page reference used for the decision.</p></div><div className="mock-engine-label"><span className="engine-dot" /> Rule engine · mock adapters</div></div>{!bidUploaded ? <div className="inline-empty"><FolderOpen size={24} /><strong>Bidder documents are waiting</strong><span>Use the prepared demo bid or add your own document set.</span></div> : <div className="result-matrix">{requirements.map((item) => <button key={item.id} className={`result-row ${selected.id === item.id ? "selected" : ""}`} onClick={() => onSelect(item)}><div className="result-status"><StatusBadge status={verified ? item.status : "Needs review"} /></div><div className="result-main"><strong>{item.id} · {item.requirement}</strong><span>{verified ? item.note : "Pending verification"}</span></div><div className="result-evidence"><FileText size={14} /><span>{item.evidence}</span><em>{item.page}</em><ArrowRight size={15} /></div></button>)}</div>}</section>{verified && <div className="action-row end"><button className="text-button" onClick={() => onJump("requirements")}>Review requirement register <ArrowRight size={15} /></button><button className="btn btn-primary" onClick={() => onJump("review")}><ShieldCheck size={16} /> Open officer review</button></div>}</div>;
}

function ReviewView({ verified, reviewed, note, setNote, onApprove, onJump }: { verified: boolean; reviewed: boolean; note: string; setNote: (n: string) => void; onApprove: () => void; onJump: (s: Section) => void }) {
  return <div className="two-column-layout review-layout"><section className="panel main-panel"><div className="panel-heading"><div><span className="panel-kicker">STEP 04 · OFFICER REVIEW</span><h3>Make the compliance decision</h3><p className="panel-subtitle">The system flags exceptions; the officer remains accountable for the final decision.</p></div><div className={`decision-pill ${reviewed ? "approved" : "pending"}`}>{reviewed ? <CheckCircle2 size={15} /> : <Clock3 size={15} />} {reviewed ? "Review recorded" : "Action required"}</div></div>{!verified ? <div className="inline-empty"><ShieldCheck size={24} /><strong>Verification must run first</strong><span>Complete the bid verification step to open the officer review queue.</span><button className="btn btn-primary" onClick={() => onJump("verification")}>Go to verification <ArrowRight size={15} /></button></div> : <><div className="review-alert"><AlertTriangle size={20} /><div><strong>2 findings need officer attention</strong><span>REQ-03 is non-compliant. REQ-04 needs documentary validation before award recommendation.</span></div></div><div className="review-findings"><button className="finding-row" onClick={() => onJump("verification")}><div className="finding-icon danger"><XCircle size={17} /></div><div><strong>REQ-03 · Similar order experience</strong><span>2 of 3 qualifying PSU orders evidenced · Past_Performance_Orders.pdf, p. 12</span></div><span className="finding-action">Inspect <ArrowRight size={15} /></span></button><button className="finding-row" onClick={() => onJump("verification")}><div className="finding-icon warning"><AlertTriangle size={17} /></div><div><strong>REQ-04 · Average annual turnover</strong><span>CA-attested FY 2023–24 schedule is not clearly present · Financial_Capability_Statement.pdf, p. 15</span></div><span className="finding-action">Inspect <ArrowRight size={15} /></span></button></div><div className="officer-form"><label htmlFor="officer-note">Officer note <span>Optional for demo</span></label><textarea id="officer-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add the rationale for the compliance decision…" /><div className="review-actions"><button className="btn btn-secondary" onClick={() => onJump("verification")}>Back to evidence</button><button className="btn btn-primary" onClick={onApprove}><CheckCircle2 size={16} /> {reviewed ? "Update review & continue" : "Record review & generate report"}</button></div></div></>}</section><aside className="panel score-panel"><div className="panel-heading compact"><div><span className="panel-kicker">RISK ASSESSMENT</span><h3>Risk score</h3></div><HelpCircle size={17} className="muted-icon" /></div><div className="risk-score"><div className="risk-number"><strong>{verified ? "42" : "—"}</strong><span>/ 100</span></div><div className="risk-meter"><span style={{ width: verified ? "42%" : "0%" }} /></div><div className="risk-label"><span>Moderate risk</span><small>Based on evidence gaps and mandatory criteria</small></div></div><div className="risk-breakdown"><div><span>Mandatory conditions</span><strong>1 / 6 failed</strong></div><div><span>Evidence completeness</span><strong>83%</strong></div><div><span>External checks</span><strong className="text-amber">Mocked</strong></div></div><div className="side-callout"><Info size={15} /><span>Risk is a decision-support signal, not an automated award recommendation.</span></div></aside></div>;
}

function ReportsView({ verified, reviewed, onGenerate, onJump }: { verified: boolean; reviewed: boolean; onGenerate: () => void; onJump: (s: Section) => void }) {
  return <div className="report-page"><section className="report-header"><div><span className="panel-kicker">STEP 05 · REPORTING</span><h2>Compliance report workspace</h2><p>Generate an auditable report with the decision, exception rationale, evidence document and page references.</p></div><div className="report-actions"><button className="btn btn-secondary" onClick={() => onJump("review")}><ShieldCheck size={16} /> Review decision</button><button className="btn btn-primary" disabled={!verified} onClick={onGenerate}><Download size={16} /> Download report</button></div></section>{!verified ? <div className="report-lock"><LockKeyhole size={24} /><strong>Complete verification to prepare a report</strong><span>The report will be populated from the evidence matrix after verification.</span><button className="btn btn-primary" onClick={() => onJump("verification")}>Go to verification <ArrowRight size={15} /></button></div> : <div className="report-grid"><section className="panel report-preview"><div className="report-toolbar"><span><FileText size={17} /> Compliance_Verification_Report</span><span className="report-version">v1.0 · {reviewed ? "Final draft" : "Working draft"}</span></div><div className="report-paper"><div className="paper-brand"><div className="brand-mark mini"><span>BS</span></div><div><strong>BidSecure AI</strong><span>Compliance verification report</span></div><span className="paper-status">{reviewed ? "REVIEW RECORDED" : "DRAFT"}</span></div><div className="paper-rule" /><h3>{sampleTender.title}</h3><p className="paper-meta">{sampleTender.id} · {sampleTender.buyer}</p><div className="paper-outcome"><div><span>FINAL OUTCOME</span><strong>Needs officer review</strong></div><div><span>RISK SCORE</span><strong>42 / 100 <small>Moderate</small></strong></div><div><span>COMPLIANCE</span><strong>67% <small>4 / 6 fully met</small></strong></div></div><h4>Requirement findings</h4><div className="paper-findings">{requirements.map((item) => <div key={item.id}><span>{item.id}</span><strong>{item.requirement}</strong><StatusBadge status={item.status} /><em>{item.evidence} · {item.page}</em></div>)}</div><div className="paper-disclaimer">This is a prototype report generated in demo mode. External verification sources are simulated and no live government API was accessed.</div></div></section><aside className="panel report-side"><div className="panel-heading compact"><div><span className="panel-kicker">REPORT CONTENTS</span><h3>Ready for handoff</h3></div></div><div className="report-checklist"><div><CheckCircle2 size={16} /><span>Tender metadata</span></div><div><CheckCircle2 size={16} /><span>Requirement register</span></div><div><CheckCircle2 size={16} /><span>Evidence references</span></div><div><CheckCircle2 size={16} /><span>Risk calculation</span></div><div className={reviewed ? "" : "pending-check"}>{reviewed ? <CheckCircle2 size={16} /> : <CircleDashed size={16} />}<span>Officer review record</span></div></div><div className="side-callout"><Download size={15} /><span>Download creates a plain-text audit artifact for this prototype. Production can render the same model as signed PDF.</span></div><button className="btn btn-primary full-width" onClick={onGenerate}><Download size={16} /> Download compliance report</button></aside></div>}</div>;
}
