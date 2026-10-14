// NEOS Prototype v2 — center dashboards (Claim, CDM, Remits, Doc Extraction,
// Audit, Patient Intake), action-item queues and record drill-in screens.
// Loaded after prototype.jsx; wraps TopNav / SectionBand / DashboardBand /
// DashboardView without touching the v1 sources.
(function(){
const R = React, useS = R.useState, useE = R.useEffect;
const G = (n) => { try { return new Function("return typeof "+n+"!=='undefined'?"+n+":undefined")(); } catch(e){ return undefined; } };
const p2 = (x) => String(Math.round(x||0)).padStart(2,"0");
const hsh = (s) => { let h = 7; for (const c of String(s)) h = (h*31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
const num = (s) => typeof s === "number" ? s : (+String(s||"").replace(/[^0-9.]/g,"") || 0);
const usd = (v) => "$" + (+v||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const usdK = (v) => v >= 1000 ? "$" + (v/1000).toFixed(1) + "k" : "$" + Math.round(v);
const pd = (s) => { const m = String(s||"").match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/); if (!m) return null; let y = +m[3]; if (y < 100) y += 2000; return new Date(y, +m[1]-1, +m[2]); };
const fd = (d) => String(d.getMonth()+1).padStart(2,"0") + "/" + String(d.getDate()).padStart(2,"0") + "/" + String(d.getFullYear()).slice(2);
const dOnly = (s) => { const d = pd(s); return d ? fd(d) : null; };
const addDays = (s, n) => { const d = pd(s) || new Date(2025,3,15); d.setDate(d.getDate()+n); return fd(d); };
const uniq = (a) => [...new Set(a)];
const IC = (k) => (window.__resources||{})[k];
const F = "Roboto, system-ui, sans-serif";
// Render-safe value: objects like {name, phone} become their name instead of crashing React.
const sv = (v) => (v && typeof v === "object" && !React.isValidElement(v)) ? (v.name || v.label || JSON.stringify(v)) : v;

// ── data sources + where each record lives ───────────────────────────
const SRC = {
  claim:   () => window.CS_ROWS || [],
  batch:   () => window.CB_ROWS || [],
  cdm:     () => window.CDM_ROWS || [],
  docext:  () => window.DX_ROWS || [],
  denial:  () => window.RM_ROWS || [],
  cash:    () => G("CP_ROWS") || [],
  f2f:     () => G("f2fRows") || [],
  prebill: () => G("pbRows") || [],
  ipt:     () => window.IPT_ROWS || [],
  ipe:     () => window.IPE_ROWS || [],
};
const SECTION = {
  claim:   ["rcd", 0, "Claim Center", "Claim Status View"],
  batch:   ["rcd", 1, "Claim Center", "Claim Batch View"],
  cdm:     ["cdm", 0, "CDM Center", "CDM Request View"],
  docext:  ["docext", 0, "Documents Extraction Center", "Doc Extraction View"],
  denial:  ["remits", 0, "Remits Center", "Denial Management"],
  cash:    ["remits", 1, "Remits Center", "Cash Posting"],
  f2f:     ["audit_f2f", 0, "Face-To Face Encounter Audit Center", "F2F Audit View"],
  prebill: ["audit_prebill", 0, "Pre-Bill Audit Center", "Pre-Bill Audit View"],
  ipt:     ["intake", 1, "Intake Center", "Patient intake"],
  ipe:     ["intake", 1, "Intake Center", "Pre-Eligibility"],
};
const HAS_DETAIL = { claim:1, batch:1, cdm:1, docext:1, denial:1, cash:1 };
const keyOf = (r) => r.id || (r.mrn + "|" + r.name + "|" + (r.auditDate||r.trigger||""));

function goCenter(kind) {
  const s = SECTION[kind]; if (!s) return;
  window.__v2PendingSub = { title: s[2], sub: s[1] };
  setTimeout(() => { window.__v2PendingSub = null; }, 2000);
  window.__v2Detail && window.__v2Detail(null);
  window.__v2GoSection && window.__v2GoSection(s[0]);
}

// ── automation status normalisation ─────────────────────────────────
const atN = (v) => v==="warning"||v==="incomplete" ? "attention" : v==="intervention" ? "intervention" : v==="hourglass"||v==="inprogress" ? "progress" : "done";
const AT_META = {
  done:         { label:"Completed",          c:"#389E0D", bg:"#F6FFED", bd:"#B7EB8F", icon:"atCompleted" },
  progress:     { label:"In Progress",        c:"#1D4ED8", bg:"#EFF6FF", bd:"#BFDBFE", icon:"atInProgress" },
  attention:    { label:"Needs Attention",    c:"#B45309", bg:"#FFFBEB", bd:"#FDE68A", icon:"atNeedsAttention" },
  intervention: { label:"Needs Intervention", c:"#CF1322", bg:"#FFF1F0", bd:"#FFA39E", icon:null },
};
const TONE = {
  green: { c:"#389E0D", bg:"#F6FFED", bd:"#B7EB8F" },
  blue:  { c:"#1D4ED8", bg:"#EFF6FF", bd:"#BFDBFE" },
  amber: { c:"#B45309", bg:"#FFFBEB", bd:"#FDE68A" },
  red:   { c:"#CF1322", bg:"#FFF1F0", bd:"#FFA39E" },
  gray:  { c:"#475569", bg:"#F1F5F9", bd:"#CBD5E1" },
};
const toneOf = (s) => /accept|complet|paid$|^paid|met$|^met|active|downloaded|verified|posted|synced/i.test(s) && !/not met|partial/i.test(s) ? "green"
  : /reject|fail|denied|terminat|not met|inactive|exception|missing|past due/i.test(s) ? "red"
  : /pending|progress|process|appeal|resubmit|partial|due/i.test(s) ? "amber" : "gray";
function Pill({ tone="gray", children, size=12 }) {
  const t = TONE[tone] || TONE.gray;
  return <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:3, background:t.bg, border:`1px solid ${t.bd}`, color:t.c, font:`500 ${size}px/16px ${F}`, whiteSpace:"nowrap" }}>{children}</span>;
}
function ATChip({ at }) {
  const m = AT_META[atN(at)];
  const src = m.icon && IC(m.icon);
  return <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"3px 10px 3px 6px", borderRadius:999, background:"rgba(255,255,255,.12)", color:"#fff", font:`500 12px/16px ${F}`, whiteSpace:"nowrap" }}>
    {src ? <img src={src} alt="" style={{ width:16, height:16, objectFit:"contain" }} /> : <span style={{ width:10, height:10, borderRadius:"50%", background:m.bd }} />}{m.label}
  </span>;
}

// ── reference tables ────────────────────────────────────────────────
const CARC = {
  "CO-16":["Claim lacks information needed for adjudication","Correct missing data and resubmit"],
  "N290":["Missing / invalid rendering provider identifier","Add rendering NPI and resubmit"],
  "CO-197":["Precertification / authorization absent","Attach authorization and appeal"],
  "PR-204":["Service not covered under the patient's benefit plan","Bill patient or secondary payer"],
  "CO-50":["Non-covered: not deemed a medical necessity","Appeal with clinical documentation"],
  "M127":["Missing patient medical record for this service","Upload medical records to payer"],
  "CO-29":["Time limit for filing has expired","Appeal with proof of timely filing"],
  "CO-18":["Exact duplicate claim / service","Verify original claim and void duplicate"],
  "OA-23":["Impact of prior payer adjudication","Bill secondary with primary EOB"],
  "N179":["Additional information requested from entity","Respond to payer records request"],
  "CO-45":["Charge exceeds fee schedule / maximum allowable","Contractual adjustment — no action"],
  "PR-1":["Deductible amount","Transfer to patient responsibility"],
  "CO-253":["Sequestration — reduction in federal payment","Contractual adjustment — no action"],
};
const carcType = (c) => /^CO/.test(c) ? "Contractual Obligation" : /^PR/.test(c) ? "Patient Responsibility" : /^OA/.test(c) ? "Other Adjustment" : "Remark Code (RARC)";
const NAMES = ["Marvin Mckinney","Esther Howard","Cameron Williamson","Leslie Alexander","Robert Fox","Jenny Wilson","Jacob Jones","Guy Hawkins","Jane Cooper","Kristin Watson","Cody Fisher","Devon Lane"];

// Log entries generated from the stage tracker so the timeline matches it.
function stageLog(st, baseDate, who) {
  const out = [];
  const t = (i) => `${baseDate || "04/15/25"} ${String(8 + Math.floor(i/4)).padStart(2,"0")}:${String((i*13)%60).padStart(2,"0")} AM`;
  st.labels.forEach((l, i) => {
    if (i < st.cur) out.push({ time:t(i), stage:l, msg:`${l} completed`, s:"done" });
    else if (i === st.cur) out.push({ time:t(i), stage:l, msg: st.state==="failed" ? (st.msg || `${l} failed`) : st.state==="int" ? (st.msg || "Waiting on user intervention") : `${l} started`, s: st.state });
  });
  if (who) out.unshift({ time:t(0), stage:"Transaction", msg:`Transaction created by ${who}`, s:"done" });
  return out.reverse();
}

// ── per-kind drill-in definitions ───────────────────────────────────
const DETAIL = {
  claim: (r) => {
    const s = r.status, rej = /Rejected/.test(s), exc = s === "Exception";
    const cur = s==="Exception"||s==="CH Rejected" ? 1 : s==="CH Accepted"||s==="PP Rejected" ? 2 : s==="PP Accepted"||s==="Payor Pending"||s==="Payor Rejected" ? 3 : s==="Payor Accepted" ? 4 : 1;
    const amt = num(r.chargeAmt);
    const LINES = [["0551","Skilled Nursing","G0299",6,.45],["0421","Physical Therapy","G0151",4,.25],["0431","Occupational Therapy","G0152",2,.15],["0571","Home Health Aide","G0156",3,.10],["0561","Medical Social Work","G0155",1,.05]];
    const reasons = {
      "CH Rejected":["Clearing house rejection", `Subscriber ID invalid (2010BA NM109). Verify member ID ${r.memId} with ${r.payor}.`, "Correct & Resubmit"],
      "PP Rejected":["Pre-payor edit failed", `Payer ID is not configured for gateway ${r.gw}.`, "Update Payer Mapping"],
      "Payor Rejected":["Payor rejected claim", "CO-16 — claim lacks information needed for adjudication.", "Correct & Resubmit"],
      "Exception":[`${p2(r.exceptions)} claim exception${r.exceptions>1?"s":""}`, "HIPPS code missing on claim header; episode dates do not match OASIS.", "Resolve Exceptions"],
      "Payor Pending":["Awaiting payor adjudication", `Submitted ${r.submissionDate}. Timely filing window: ${r.timely}.`, "Check Status (276)"],
    };
    const a = reasons[s];
    const st = { labels:["Claim Created","Clearing House","Pre-Payor","Payor Adjudication","Remittance"], cur, state: rej ? "failed" : exc ? "int" : "progress", msg: a && a[1] };
    return {
      title: r.name, eyebrow: "Claim " + r.claimNumber, status: s, at: r.at,
      meta: [["MRN", r.mrn], ["Member ID", r.memId], ["Bill Type", r.billType], ["Payor", r.payor], ["Gateway", r.gw], ["Charge", r.chargeAmt]],
      stages: st,
      sections: [
        { title:"Patient", fields:[["Patient Name",r.name],["MRN",r.mrn],["Member ID",r.memId],["Agency",r.agency],["Branch",r.branch],["Clinician",r.clinician]] },
        { title:"Claim", fields:[["Claim Number",r.claimNumber],["Bill Type",r.billType],["Charge Amount",r.chargeAmt],["SOC Date",r.socDate],["Discharge Date",r.dischargeDate],["Submission Date",r.submissionDate],["EOB Date",r.eobDate],["Timely Filing",r.timely]] },
        { title:"Submission", fields:[["Payor",r.payor],["Gateway",r.gw],["Batch File",r.batchFile],["Auditor",sv(r.auditor)],["EHR Sync",r.ehrSync?"Synced":"Pending"]] },
      ],
      lines: { title:"Claim Lines", cols:[["rev","Rev Code"],["desc","Description"],["hcpcs","HCPCS"],["dates","Service Dates"],["units","Units","right"],["charge","Charge","right"],["st","Line Status"]],
        rows: LINES.map(([rev,desc,hc,u,sh],i) => ({ id:rev, rev, desc, hcpcs:hc, dates:`${r.socDate} – ${addDays(r.socDate, 29)}`, units:u, charge:usd(amt*sh), st: rej && i===0 ? <Pill tone="red">Rejected</Pill> : s==="Payor Accepted" ? <Pill tone="green">Paid</Pill> : <Pill tone="amber">Pending</Pill> })) },
      docs: [["837I Claim File", r.batchFile, r.submissionDate, "Submitted"], ...(cur>=2||rej?[["277CA Acknowledgment","Clearing house response",r.submissionDate, rej&&cur===1?"Rejected":"Received"]]:[]), ...(s==="Payor Accepted"||s==="Payor Rejected"?[["835 Remittance","Payor remittance advice",r.eobDate,"Received"]]:[]), ["Plan of Care (485)","Signed physician order",r.socDate,"On File"]],
      log: stageLog(st, r.submissionDate, "E5 Agent"),
      actions: a ? [{ tone: rej||exc ? "red" : "blue", title:a[0], desc:a[1], primary:a[2], secondary: rej ? "View 277CA" : null }] : [],
    };
  },
  batch: (r) => {
    const cs = window.CS_ROWS || [];
    const start = hsh(r.id) % Math.max(1, cs.length);
    const claims = Array.from({ length: r.claimCount }, (_, i) => cs[(start + i) % cs.length]).filter(Boolean);
    const st = { labels:["837 Generated","File Parsed","Submitted to Gateway","999 Acknowledgment","277CA Response"],
      cur: r.status==="Accepted" ? 5 : r.status==="Rejected" ? 1 : r.at==="warning" ? 2 : 3,
      state: r.status==="Rejected" || r.at==="warning" ? "failed" : "progress",
      msg: r.status==="Rejected" ? "837 failed X12 validation — CLM05 composite invalid" : r.at==="warning" ? `SFTP connection to ${r.gateway} timed out` : null };
    const actions = [];
    if (r.status==="Rejected") actions.push({ tone:"red", title:"Batch rejected at parse", desc:"837 file failed X12 validation — CLM05 composite invalid on 1 or more claims.", primary:"Regenerate Batch", secondary:"Download 999" });
    if (r.at==="warning") actions.push({ tone:"red", title:"Gateway upload failed", desc:`SFTP connection to ${r.gateway} timed out after 3 retries.`, primary:"Retry Upload" });
    if (r.exceptions) actions.push({ tone:"amber", title:`${p2(r.exceptions)} claims with exceptions`, desc:"Claims in this batch carry exceptions that block payor submission.", primary:"Review Claims", tab:"lines" });
    return {
      title: "Batch " + r.batchId, eyebrow: r.e5id, status: r.status, at: r.at,
      meta: [["File", r.fileName], ["Submitted", r.submitted], ["Claims", r.claims], ["Gateway", r.gateway], ["Model", r.model]],
      stages: st,
      sections: [
        { title:"Batch", fields:[["E5 ID",r.e5id],["Batch ID",r.batchId],["File Name",r.fileName],["Submitted",r.submitted],["Claims",r.claims],["Bill Type",r.billType]] },
        { title:"Routing", fields:[["Gateway",r.gateway],["Submission Model",r.model],["Parsing Result",r.parsing],["Documents",String(r.docs)],["Auditor",sv(r.auditor)],["Clinician",sv(r.clinician)]] },
      ],
      lines: { title:"Claims in Batch", cols:[["name","Patient"],["claimNumber","Claim #"],["billType","Bill Type"],["chargeAmt","Charge","right"],["st","Status"]],
        rows: claims.map(c => ({ ...c, st:<Pill tone={toneOf(c.status)}>{c.status}</Pill>, __open:["claim", c] })) },
      docs: [["837I Batch File", r.fileName, r.submitted.slice(0,8), "Submitted"], ["999 Acknowledgment","Functional acknowledgment", r.submitted.slice(0,8), r.status==="Rejected"?"Rejected":"Received"]],
      log: stageLog(st, r.submitted.slice(0,8), "E5 Agent"),
      actions,
    };
  },
  cdm: (r) => {
    const cur = Math.max(0, (parseInt(String(r.currentStage).replace(/\D/g,""),10) || 1) - 1);
    const failed = r.currentStatus==="Failed" || r.currentStatus==="Terminated";
    const st = { labels:["Pull Visits from EHR","Validate Eligible Hours","Post Hours to CDM"], cur: r.currentStatus==="Completed" ? 3 : cur, state: failed ? "failed" : "progress", msg: r.reasonFailTerm };
    const actions = [];
    if (r.currentStatus==="Failed") actions.push({ tone:"red", title:"Automation failed", desc:r.reasonFailTerm, primary:"Retry Transaction", secondary:"Terminate" });
    if (r.currentStatus==="Terminated") actions.push({ tone:"red", title:"Transaction terminated", desc:r.reasonFailTerm, primary:"Reopen Transaction" });
    if (!r.docs) actions.push({ tone:"amber", title:"Supporting documents missing", desc:"Timesheets for the current period are not attached.", primary:"Request Documents" });
    const visits = Array.from({ length:6 }, (_, i) => {
      const sch = [8,6,8,4,6,8][i], act = sch - ((hsh(r.id+i) % 5 === 0) ? 1.5 : 0);
      return { id:i, date: addDays(r.txnArrived, -6 + i), worker:r.workerName, svc: i%2 ? "Attendant" : "Personal Care", sch: sch.toFixed(1), act: act.toFixed(1), st: act < sch ? <Pill tone="amber">Variance {(sch-act).toFixed(1)}h</Pill> : <Pill tone="green">Verified</Pill> };
    });
    return {
      title: r.name, eyebrow: "Episode " + r.episodeId, status: r.currentStatus, at: r.at,
      meta: [["MRN", r.mrn], ["Branch", r.branchId], ["Worker", r.workerName], ["Primary Payor", r.primaryPayor], ["Stage", r.currentStage]],
      stages: st,
      tiles: [["Eligible PC Hours", r.eligPcHours], ["Eligible Attendant Hours", r.eligAttendHours], ["PC Auth Hours", r.pcAuthHours], ["Attendant Auth Hours", r.attendAuthHours]],
      sections: [
        { title:"Patient", fields:[["Patient Name",r.name],["MRN",r.mrn],["Episode ID",r.episodeId],["Branch",r.branchId],["Worker Name",r.workerName]] },
        { title:"Payor", fields:[["Primary Payor",r.primaryPayor],["Secondary Payor Source",r.secondaryPayorSource]] },
        { title:"Transaction", fields:[["CDM Init Time",r.cdmInitTime],["Current Stage",r.currentStage],["Current Status",r.currentStatus],["Arrived",r.txnArrived],["Ended",r.txnEnd||"—"],["Terminated On",r.terminatedOn||"—"]] },
      ],
      lines: { title:"Visit Hours", cols:[["date","Visit Date"],["worker","Worker"],["svc","Service"],["sch","Scheduled Hrs","right"],["act","Actual Hrs","right"],["st","Validation"]], rows: visits },
      docs: r.docs ? [["Timesheet", "Weekly caregiver timesheet", r.txnArrived, "On File"], ["Authorization Letter", r.primaryPayor, r.txnArrived, "On File"]] : [],
      log: stageLog(st, r.txnArrived, "E5 Agent"),
      actions,
    };
  },
  docext: (r) => {
    const STG = ["Document Retrieval","OCR Extraction","Data Validation","EHR Upload"];
    const ci = Math.max(0, STG.indexOf(r.stage));
    const warn = r.at==="warning";
    const why = { 0:["Document not found in EHR","Referral packet is not attached to the episode in the EHR.","Retry Retrieval"], 1:["OCR confidence below threshold","2 fields extracted under 60% confidence.","Review Extracted Fields"], 2:["Required field missing","Primary diagnosis could not be validated against ICD-10.","Enter Value"] }[ci] || ["Upload rejected","EHR rejected the extracted payload.","Retry Upload"];
    const st = { labels:STG, cur: r.at==="thumb" ? 4 : ci, state: warn ? "failed" : "progress", msg: warn ? why[1] : null };
    const h = hsh(r.id);
    const low = (i) => warn && (i === 2 || i === 4);
    const FIELDS = [["Patient Name", r.name], ["Date of Birth", `0${1+h%9}/1${h%9}/19${50+h%30}`], ["Primary Diagnosis","I50.9 — Heart failure, unspecified"], ["Referring Physician", `Dr. A. Patel · NPI 14${String(h).slice(0,8)}`], ["Event Date", r.st.slice(0,8)], ["Active Medications", `${4+h%6} medications`], ["Allergies","NKDA"], ["Homebound Status","Yes — requires assistive device"]];
    const actions = [];
    if (warn) actions.push({ tone:"red", title:why[0], desc:why[1], primary:why[2], secondary:"Terminate", tab: ci===1 ? "lines" : null });
    if (!r.referral) actions.push({ tone:"amber", title:"Referral document not received", desc:"Request the referral packet from the sending facility.", primary:"Request Document" });
    if (!r.visitNotes) actions.push({ tone:"amber", title:"Visit notes missing", desc:"No visit notes found for this episode.", primary:"Request Document" });
    const dl = r.download==="downloaded" ? "Downloaded" : r.download==="pending" ? "Pending" : "Failed";
    return {
      title: r.name, eyebrow: r.ref, status: dl, at: r.at,
      meta: [["MRN", r.mrn], ["Agency", r.agency], ["Branch", r.branch], ["Episode", r.episodeId], ["Event", r.eventType]],
      stages: st,
      sections: [
        { title:"Patient", fields:[["Patient Name",r.name],["MRN",r.mrn],["Agency",r.agency],["Branch",r.branch],["Episode ID",r.episodeId]] },
        { title:"Extraction", fields:[["Ref ID",r.ref],["Event Type",r.eventType],["Current Stage",r.stage],["Download Status",dl],["Start Time",r.st],["End Time",r.et]] },
      ],
      lines: { title:"Extracted Fields", cols:[["f","Field"],["v","Extracted Value"],["conf","Confidence","right"],["src","Source Document"]],
        rows: FIELDS.map(([f,v],i) => ({ id:f, f, v: low(i) ? <span style={{ color:"#CF1322" }}>Not found</span> : v, conf: low(i) ? <Pill tone="red">{38 + (h+i)%20}%</Pill> : <Pill tone="green">{92 + (h+i)%8}%</Pill>, src: i===5||i===6 ? "Visit Notes" : "Referral Packet" })) },
      docs: [["Referral Packet","Referral source document", r.st.slice(0,8), r.referral ? dl : "Not Received"], ["Visit Notes","Clinician visit documentation", r.st.slice(0,8), r.visitNotes ? dl : "Not Received"]],
      log: stageLog(st, r.st.slice(0,8), "E5 Agent"),
      actions,
    };
  },
  denial: (r) => {
    const STG = ["Extract Denial Information","Match Patient in WellSky","Post Denial to WellSky","Upload EOB"];
    const ci = Math.max(0, STG.indexOf(r.stage));
    const st = { labels:STG, cur: r.at==="thumb" ? 4 : ci, state: r.at==="warning" ? "failed" : "progress", msg: r.at==="warning" ? r.reason : null };
    const codes = r.denialCodes || [];
    const actions = [];
    if (r.at==="warning") actions.push({ tone:"red", title:r.reason, desc:`No WellSky client matched MRN ${r.mrn} / account ${r.acct}.`, primary:"Match Patient Manually", secondary:"Terminate" });
    if (r.remitStatus==="Denied" && codes[0]) actions.push({ tone:"red", title:`Work denial ${codes[0]}`, desc:(CARC[codes[0]]||[])[1] || "Review denial and choose a resolution.", primary:"Start Appeal", secondary:"Write Off" });
    if (r.remitStatus==="Partially Paid") actions.push({ tone:"amber", title:"Partial payment — review underpayment", desc:"Paid amount is below the expected contractual rate.", primary:"Create Adjustment" });
    if (!r.eob) actions.push({ tone:"amber", title:"EOB not uploaded", desc:"The explanation of benefits is not attached in WellSky.", primary:"Upload EOB" });
    return {
      title: r.name, eyebrow: "Account " + r.acct, status: r.remitStatus, at: r.at,
      meta: [["PCN", r.pcn], ["Payment ID", r.paymentId], ["Service Line", r.serviceLine], ["Payer", r.chPayor], ["Check Date", r.checkDate]],
      stages: st,
      sections: [
        { title:"Patient & Account", fields:[["Patient Name",r.name],["WellSky Client",r.clientName],["MRN",r.mrn],["Account #",r.acct],["Agency",r.agency]] },
        { title:"Claim & Payment", fields:[["PCN",r.pcn],["Payment ID",r.paymentId],["WellSky Payment ID",r.wsPaymentId],["Service Date",r.serviceDate],["Check Date",r.checkDate],["Remit Status",r.remitStatus],["Service Line",r.serviceLine]] },
        { title:"Clearing House", fields:[["Location",r.chLocation],["Payer",r.chPayor],["Insurance Code",r.chInsCode],["EOB Available",r.eob?"Yes":"No"]] },
        { title:"WellSky", fields:[["Location",r.wsLoc],["Waystar Payer",r.wsPayer],["Insurance Code",r.wsIns],["WellSky Payer",r.wellskyPayer]] },
      ],
      lines: { title:"Denial Codes", cols:[["code","Code"],["type","Type"],["desc","Description"],["act","Recommended Action"]],
        rows: codes.map(c => ({ id:c, code:<Pill tone={(r.excluded||[]).includes(c)?"gray":"red"}>{c}</Pill>, type:carcType(c), desc:(CARC[c]||["—"])[0], act:(CARC[c]||["","—"])[1] })) },
      docs: [["835 Remittance","Electronic remittance advice", r.checkDate, "Received"], ["EOB", r.chPayor, r.checkDate, r.eob ? "Uploaded" : "Not Received"]],
      log: stageLog(st, r.checkDate, "E5 Agent"),
      actions,
    };
  },
  cash: (r) => {
    const st = { labels:["835 Received","Parse Remittance","Match Patients","Post Payments","Reconciliation"],
      cur: r.status==="Completed" ? 5 : r.status==="In Progress" ? 3 : r.status==="Failed" ? 2 : 1,
      state: r.status==="Failed"||r.status==="Terminated" ? "failed" : "progress", msg: r.reason !== "—" ? r.reason : null };
    const h = hsh(r.id), k = 3 + h % 4;
    const w = Array.from({ length:k }, (_, i) => 1 + ((h >> i) % 5));
    const tw = w.reduce((s,x)=>s+x,0);
    let left = r.amount;
    const allocs = w.map((x, i) => { const a = i===k-1 ? left : Math.round(r.amount*x/tw*100)/100; left = Math.round((left-a)*100)/100; return a; });
    let postLeft = r.posted;
    const actions = [];
    if (r.status==="Failed"||r.status==="Terminated") actions.push({ tone:"red", title:`${r.status}: ${r.reason}`, desc:`Stage ${r.stage} did not complete for payment ${r.paymentId}.`, primary:"Retry Posting", secondary: r.status==="Failed" ? "Terminate" : null });
    if (r.variance > 0 && r.status==="Completed") actions.push({ tone:"amber", title:`Unposted variance of ${usd(r.variance)}`, desc:"Payment total does not match posted line items.", primary:"Post Adjustment" });
    if (!r.eob) actions.push({ tone:"amber", title:"EOB not uploaded", desc:"Attach the EOB to complete reconciliation.", primary:"Upload EOB" });
    if (!r.fileAvail) actions.push({ tone:"amber", title:"Missing from payment report", desc:"Payment was not found in the daily payment report file.", primary:"Locate File" });
    return {
      title: r.paymentId, eyebrow: "Payment " + r.paymentNumber, status: r.status, at: r.at,
      meta: [["Check", r.check], ["Payer", r.payer], ["Agency", r.agency], ["Payment Date", r.payDate], ["Amount", usd(r.amount)]],
      stages: st,
      tiles: [["Payment Amount", usd(r.amount)], ["Amount Posted", usd(r.posted)], ["Variance", usd(r.variance), r.variance > 0], ["Posted", (r.amount ? Math.round(r.posted/r.amount*100) : 0) + "%"]],
      sections: [
        { title:"Payment", fields:[["Payment ID",r.paymentId],["Payment Number",r.paymentNumber],["Check Number",r.check],["OP #",r.op],["Payment Date",r.payDate],["Deposit",r.deposit],["Remittance #",r.remit]] },
        { title:"Payer & Location", fields:[["Payer",r.payer],["Agency",r.agency],["Location",r.location],["Waystar Location",r.wsLoc],["Database",r.db]] },
        { title:"File", fields:[["SFTP Location",r.sftp],["In Payment Report",r.fileAvail?"Yes":"No"],["EOB Uploaded",r.eob?"Yes":"No"],["Arrived",r.arrived],["Ended",r.ended],["Current Stage",r.stage]] },
      ],
      lines: { title:"Payment Allocations", cols:[["name","Patient"],["claim","Claim #"],["amt","Allocated","right"],["posted","Posted","right"],["st","Status"]],
        rows: allocs.map((a, i) => { const p = Math.min(a, Math.max(0, postLeft)); postLeft = Math.round((postLeft - p)*100)/100; return { id:i, name:NAMES[(h+i)%NAMES.length], claim:"CL7485" + String(7000 + (h+i*37)%3000), amt:usd(a), posted:usd(p), st: p >= a ? <Pill tone="green">Posted</Pill> : p > 0 ? <Pill tone="amber">Partial</Pill> : <Pill tone={r.status==="In Progress"?"blue":"red"}>{r.status==="In Progress"?"Queued":"Not Posted"}</Pill> }; }) },
      docs: [["835 Remittance File", r.sftp, r.payDate, r.fileAvail ? "Received" : "Missing"], ["EOB", r.payer, r.payDate, r.eob ? "Uploaded" : "Not Received"]],
      log: stageLog(st, r.payDate, "E5 Agent"),
      actions,
    };
  },
};

// ── shared UI bits ──────────────────────────────────────────────────
const BAND = "linear-gradient(to right, rgb(56,71,90) 0%, rgb(28,45,66) 100%)";
const btnP = { background:"#1677FF", color:"#fff", border:"1px solid #1677FF", borderRadius:4, padding:"6px 14px", font:`500 13px/18px ${F}`, cursor:"pointer", whiteSpace:"nowrap" };
const btnS = { background:"#fff", color:"#3A424A", border:"1px solid #D8DEE7", borderRadius:4, padding:"6px 14px", font:`400 13px/18px ${F}`, cursor:"pointer", whiteSpace:"nowrap" };
const card = { border:"1px solid #E8E9EA", borderRadius:9, background:"#fff" };
const STC = {
  done:     { bg:"#61AA6B", bd:"#61AA6B", ink:"#fff", label:"Completed", glyph:"✓" },
  progress: { bg:"#fff",    bd:"#4C9FD1", ink:"#1D4ED8", label:"In Progress", glyph:"•" },
  failed:   { bg:"#FFF1F0", bd:"#F87D7C", ink:"#CF1322", label:"Failed", glyph:"✕" },
  int:      { bg:"#FFFBE6", bd:"#F8C87C", ink:"#B45309", label:"Needs Intervention", glyph:"!" },
  pending:  { bg:"#fff",    bd:"#D8DEE7", ink:"#94A3B8", label:"Not Started", glyph:"" },
};
function Stages({ labels, cur, state }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start" }}>
      {labels.map((l, i) => {
        const s = i < cur ? "done" : i === cur ? state : "pending", c = STC[s];
        return (
          <div key={l} style={{ flex:"1 1 0", minWidth:0, position:"relative", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:8 }}>
            {i > 0 && <div style={{ position:"absolute", top:13, right:"50%", width:"100%", height:2, background: i <= cur ? "#61AA6B" : "#E2E8F0" }} />}
            <div style={{ position:"relative", width:28, height:28, borderRadius:"50%", background:c.bg, border:`2px solid ${c.bd}`, color:c.ink, display:"flex", alignItems:"center", justifyContent:"center", font:`700 13px/1 ${F}`, boxSizing:"border-box" }}>{c.glyph || (i+1)}</div>
            <div style={{ font:`500 12px/16px ${F}`, color:"#3A424A", padding:"0 6px", textWrap:"pretty" }}>{l}</div>
            <div style={{ font:`400 11px/14px ${F}`, color: s==="pending" ? "#94A3B8" : c.ink === "#fff" ? "#389E0D" : c.ink }}>{c.label}</div>
          </div>
        );
      })}
    </div>
  );
}
function FieldCard({ title, fields }) {
  return (
    <div style={{ ...card, padding:"16px 20px" }}>
      <div style={{ font:`500 15px/20px ${F}`, color:"#3A424A", marginBottom:8 }}>{title}</div>
      {fields.map(([l, v], i) => (
        <div key={l} style={{ display:"grid", gridTemplateColumns:"minmax(110px,40%) minmax(0,1fr)", gap:12, padding:"8px 0", borderTop: i ? "1px solid #F1F3F6" : "none" }}>
          <span style={{ font:`400 13px/18px ${F}`, color:"#6A717D" }}>{l}</span>
          <span style={{ font:`500 13px/18px ${F}`, color:"#1F2937", overflowWrap:"anywhere" }}>{v === "" || v == null ? "—" : sv(v)}</span>
        </div>
      ))}
    </div>
  );
}
function Table({ cols, rows, onRow }) {
  const grid = cols.map(c => c[2]==="right" ? "minmax(80px,.7fr)" : "minmax(100px,1fr)").join(" ");
  if (!rows.length) return <div style={{ ...card, padding:"40px 24px", textAlign:"center", font:`400 13px/18px ${F}`, color:"#94A3B8" }}>No records.</div>;
  return (
    <div style={{ overflowX:"auto" }} className="ws-hscroll">
      <div style={{ minWidth: cols.length * 120 }}>
        <div style={{ display:"grid", gridTemplateColumns:grid, gap:8, padding:"0 16px", height:40, alignItems:"center", background:"#F8FAFC", borderBottom:"1px solid #E2E8F0", marginBottom:8 }}>
          {cols.map(c => <div key={c[0]} style={{ font:`500 11px/14px ${F}`, color:"#64748B", textAlign:c[2]||"left" }}>{c[1]}</div>)}
        </div>
        {rows.map((r, i) => {
          const open = onRow && onRow(r);
          return (
            <div key={r.id || i} onClick={open || undefined} style={{ display:"grid", gridTemplateColumns:grid, gap:8, padding:"0 16px", minHeight:48, alignItems:"center", border:"1px solid #E2E8F0", borderRadius:6, marginBottom:8, background:"#fff", cursor: open ? "pointer" : "default", boxShadow:"0 1px 2px rgba(15,23,42,0.03)" }}>
              {cols.map((c, ci) => (
                <div key={c[0]} style={{ font:`500 12px/16px ${F}`, color: ci===0 && open ? "#1677FF" : "#333", textAlign:c[2]||"left", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", minWidth:0, display:"flex", justifyContent: c[2]==="right" ? "flex-end" : "flex-start" }}>
                  {r[c[0]] == null || r[c[0]] === "" ? <span style={{ color:"#94A3B8" }}>—</span> : sv(r[c[0]])}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function Crumbs({ items }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", font:`400 13px/18px ${F}`, color:"rgba(255,255,255,.65)" }}>
      {items.map((it, i) => (
        <R.Fragment key={i}>
          {i > 0 && <span style={{ opacity:.5 }}>/</span>}
          <span onClick={it.onClick} style={{ cursor: it.onClick ? "pointer" : "default", color: i === items.length - 1 ? "#fff" : undefined }}>{it.label}</span>
        </R.Fragment>
      ))}
    </div>
  );
}

// ── record detail screen ────────────────────────────────────────────
function RecordDetail({ kind, row, list, onBack, backLabel, onOpen, crumbsPre }) {
  const d = DETAIL[kind](row);
  const sec = SECTION[kind];
  const [tab, setTab] = useS("info");
  const rk = kind + ":" + keyOf(row);
  window.__v2Rev = window.__v2Rev || {};
  window.__v2Notes = window.__v2Notes || {};
  window.__v2Done = window.__v2Done || {};
  const [rev, setRev] = useS(!!window.__v2Rev[rk]);
  const [notes, setNotes] = useS(window.__v2Notes[rk] || []);
  const [draft, setDraft] = useS("");
  const [done, setDone] = useS(window.__v2Done[rk] || {});
  const idx = list.findIndex(x => keyOf(x) === keyOf(row));
  const nav = (dir) => { const n = list[idx + dir]; if (n) onOpen(kind, n, true); };
  const openActions = d.actions.filter((a, i) => !done[i]);
  const TABS = [["overview","Overview"],["lines",d.lines.title,d.lines.rows.length],["docs","Documents",d.docs.length],["log","Automation Log",d.log.length]];
  const resolve = (i, how) => { const n = { ...done, [i]: { how, at: new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }) } }; setDone(n); window.__v2Done[rk] = n; };
  const addNote = () => { if (!draft.trim()) return; const n = [{ by:"You", at:"Just now", text:draft.trim() }, ...notes]; setNotes(n); window.__v2Notes[rk] = n; setDraft(""); };

  const INFO = { claim:"Claim Info", batch:"Batch Info", cdm:"CDM Info", docext:"Extraction Info", denial:"Denial Info", cash:"Payment Info" }[kind];
  const NAME_LABEL = { batch:"Batch", cash:"Payment ID" }[kind] || "Patient Name";
  const [showLog, setShowLog] = useS(false);
  const tabBtn = (on) => ({ background: on ? "#fff" : "transparent", border: on ? "1px solid #CFCFCF" : "none", borderBottom: on ? "1px solid #fff" : "none", borderRadius:"6px 6px 0 0", cursor:"pointer", padding:"9px 18px", font:`${on?500:400} 14px/18px ${F}`, color: on ? "#2F6FED" : "#3A424A", marginRight:4, marginBottom:-1, position:"relative", zIndex: on ? 2 : 1, display:"inline-flex", alignItems:"center", gap:8, whiteSpace:"nowrap" });
  const FTABS = [["info", INFO], ["lines", d.lines.title, d.lines.rows.length], ["docs", "Documents", d.docs.length]];
  const navBtn = (dis) => ({ background:"#fff", border:"1px solid #D8DEE7", borderRadius:4, width:28, height:26, cursor: dis ? "default" : "pointer", color: dis ? "#C5CBD3" : "#3A424A", font:`500 14px/1 ${F}`, display:"inline-flex", alignItems:"center", justifyContent:"center" });

  const actionRail = (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ ...card, display:"flex", alignItems:"center", padding:"12px 16px", background:"#FFF4F4", borderColor:"#F3E0E0" }}>
        <span style={{ font:`500 15px/20px ${F}`, color:"#3A424A" }}>Action Items</span>
        <span style={{ marginLeft:"auto", font:`400 13px/18px ${F}`, color:"#6A717D" }}><span style={{ color: openActions.length ? "#CF1322" : "#389E0D" }}>{p2(openActions.length)}</span> Open</span>
      </div>
      {d.actions.length === 0 && <div style={{ ...card, padding:"16px", font:`400 13px/18px ${F}`, color:"#6A717D" }}>No open action items — automation is on track for this record.</div>}
      {d.actions.map((a, i) => {
        const tn = TONE[a.tone] || TONE.gray, dn = done[i];
        return (
          <div key={i} style={{ ...card, padding:"14px 16px", display:"flex", flexDirection:"column", gap:10, opacity: dn ? .7 : 1 }}>
            <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background: dn ? "#61AA6B" : tn.c, marginTop:6, flexShrink:0 }} />
              <div style={{ display:"flex", flexDirection:"column", gap:4, minWidth:0 }}>
                <span style={{ font:`500 14px/18px ${F}`, color:"#1F2937", textDecoration: dn ? "line-through" : "none" }}>{a.title}</span>
                <span style={{ font:`400 13px/18px ${F}`, color:"#6A717D", textWrap:"pretty" }}>{a.desc}</span>
              </div>
            </div>
            {dn ? (
              <div style={{ display:"flex", alignItems:"center", gap:8, paddingLeft:18, font:`400 12px/16px ${F}`, color:"#389E0D" }}>
                {dn.how} · {dn.at}
                <span onClick={() => { const n = { ...done }; delete n[i]; setDone(n); window.__v2Done[rk] = n; }} style={{ marginLeft:"auto", color:"#1677FF", cursor:"pointer" }}>Undo</span>
              </div>
            ) : (
              <div style={{ display:"flex", gap:8, paddingLeft:18, flexWrap:"wrap" }}>
                <button type="button" style={btnP} onClick={() => a.tab ? setTab(a.tab) : resolve(i, a.primary + " queued")}>{a.primary}</button>
                {a.secondary && <button type="button" style={btnS} onClick={() => resolve(i, a.secondary + " applied")}>{a.secondary}</button>}
              </div>
            )}
          </div>
        );
      })}
      <div onClick={() => { const v = !rev; setRev(v); window.__v2Rev[rk] = v; }} style={{ ...card, display:"flex", alignItems:"center", gap:10, padding:"12px 16px", cursor:"pointer" }}>
        <span style={{ width:16, height:16, borderRadius:3, border:`1.5px solid ${rev ? "#1677FF" : "#CBD5E1"}`, background: rev ? "#1677FF" : "#fff", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff", font:`700 11px/1 ${F}` }}>{rev ? "✓" : ""}</span>
        <span style={{ font:`400 13px/18px ${F}`, color:"#3A424A" }}>Mark record as reviewed</span>
      </div>
      <div style={{ ...card, padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        <span style={{ font:`500 15px/20px ${F}`, color:"#3A424A" }}>Notes</span>
        <textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder="Add a note for the team…" rows={3} style={{ resize:"vertical", border:"1px solid #D8DEE7", borderRadius:4, padding:"8px 10px", font:`400 13px/18px ${F}`, color:"#1F2937", outline:"none" }} />
        <button type="button" onClick={addNote} disabled={!draft.trim()} style={{ ...btnP, alignSelf:"flex-end", opacity: draft.trim() ? 1 : .5 }}>Add Note</button>
        {notes.map((n, i) => (
          <div key={i} style={{ borderTop:"1px solid #F1F3F6", paddingTop:10, display:"flex", flexDirection:"column", gap:4 }}>
            <span style={{ font:`500 12px/16px ${F}`, color:"#3A424A" }}>{n.by} <span style={{ color:"#94A3B8", fontWeight:400 }}>· {n.at}</span></span>
            <span style={{ font:`400 13px/18px ${F}`, color:"#3A424A", whiteSpace:"pre-wrap" }}>{n.text}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div data-screen-label={`Detail · ${sec[3]}`} style={{ position:"fixed", inset:0, zIndex:70, font:`400 14px/18px ${F}` }}>
      <div onClick={onBack} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.25)", animation:"v2Fade .14s ease-out" }} />
      <div style={{ position:"fixed", right:0, top:0, height:"100vh", width:"97vw", background:"#fff", borderLeft:"1px solid #E8E9EA", boxShadow:"-12px 0 24px rgba(28,45,66,.10)", display:"flex", flexDirection:"column", animation:"v2Slide .22s ease-out" }}>
        <div style={{ flexShrink:0, background:"#fff" }}>
          <div style={{ position:"relative", padding:"22px clamp(16px, 2.4vw, 36px) 18px" }}>
            <div style={{ position:"absolute", top:14, right:14, display:"flex", alignItems:"center", gap:10 }}>
              <button type="button" onClick={onBack} aria-label="Close" style={{ background:"transparent", border:"none", color:"#6A717D", fontSize:20, cursor:"pointer", lineHeight:1, padding:6 }}>✕</button>
            </div>
            <div style={{ display:"flex", alignItems:"flex-start", gap:32, flexWrap:"wrap", paddingRight:40 }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:4, flexShrink:0 }}>
                <span style={{ font:`400 13px/16px ${F}`, color:"#6B7280" }}>{NAME_LABEL}</span>
                <span style={{ font:`700 28px/1.1 ${F}`, color:"#111827", whiteSpace:"nowrap" }}>{d.title}</span>
                <span style={{ display:"flex", alignItems:"center", gap:8, marginTop:6 }}>
                  <Pill tone={toneOf(d.status)}>{d.status}</Pill>
                  <span style={{ font:`400 12px/16px ${F}`, color:"#6B7280" }}>{d.eyebrow}</span>
                </span>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"14px 28px", alignItems:"flex-start", flex:1, minWidth:0, paddingTop:2 }}>
                {[["AT Status", AT_META[atN(d.at)].label], ...d.meta].map(([l, v]) => (
                  <div key={l} style={{ display:"flex", flexDirection:"column", minWidth:0 }}>
                    <span style={{ font:`400 11px/14px ${F}`, color:"#6B7280", letterSpacing:".01em" }}>{l}</span>
                    <span title={String(sv(v))} style={{ font:`500 14px/18px ${F}`, color:"#111827", marginTop:4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:260 }}>{sv(v) || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ margin:"0 20px", height:1, background:"#CFCFCF" }} />
          <div style={{ margin:"0 20px" }}>
            {showLog ? (
              <div style={{ padding:"10px 0 0" }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setShowLog(false); }} style={{ display:"inline-flex", alignItems:"center", gap:6, font:`400 13px/18px ${F}`, color:"#2F6FED", textDecoration:"none", padding:"6px 0", marginBottom:8 }}>‹ Back to {INFO}</a>
                <div style={{ display:"flex", alignItems:"flex-end", borderBottom:"1px solid #CFCFCF" }}><span style={tabBtn(true)}>Automation Log</span></div>
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"flex-end", padding:"12px 0 0", borderBottom:"1px solid #CFCFCF" }}>
                {FTABS.map(([k, l, c]) => (
                  <button key={k} type="button" onClick={() => setTab(k)} style={tabBtn(tab === k)}>
                    {l}{c != null && <span style={{ background: tab === k ? "#E6F0FF" : "#F1F3F6", color: tab === k ? "#2F6FED" : "#6A717D", borderRadius:999, padding:"0 7px", font:`500 11px/17px ${F}` }}>{p2(c)}</span>}
                  </button>
                ))}
                <a href="#" onClick={(e) => { e.preventDefault(); setShowLog(true); }} style={{ marginLeft:"auto", marginBottom:10, font:`400 13px/16px ${F}`, color:"#2F6FED", textDecoration:"none" }}>Automation Log</a>
              </div>
            )}
          </div>
        </div>
        <div className="ws-scrollbody" style={{ flex:1, overflowY:"auto", overflowX:"hidden", margin:"0 20px 20px", border:"1px solid #CFCFCF", borderTop:"none", borderRadius:"0 0 6px 6px", padding:"20px" }}>
          {showLog ? (
            <div style={{ ...card, padding:"8px 20px" }}>
              {d.log.map((ev, i) => {
                const c = STC[ev.s] || STC.done;
                return (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"150px 16px minmax(0,1fr)", gap:14, padding:"14px 0", borderTop: i ? "1px solid #F1F3F6" : "none", alignItems:"start" }}>
                    <span style={{ font:`400 12px/18px ${F}`, color:"#6A717D" }}>{ev.time}</span>
                    <span style={{ width:10, height:10, borderRadius:"50%", background: ev.s === "done" ? "#61AA6B" : c.bd, marginTop:4 }} />
                    <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                      <span style={{ font:`500 13px/18px ${F}`, color:"#1F2937" }}>{ev.stage}</span>
                      <span style={{ font:`400 13px/18px ${F}`, color: ev.s === "failed" ? "#CF1322" : ev.s === "int" ? "#B45309" : "#6A717D" }}>{ev.msg}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : tab === "info" ? (
            <div style={{ display:"flex", gap:20, alignItems:"flex-start", flexWrap:"wrap" }}>
              <div style={{ flex:"1 1 560px", minWidth:0, display:"flex", flexDirection:"column", gap:18 }}>
                <div style={{ ...card, padding:"18px 20px 20px" }}>
                  <div style={{ display:"flex", alignItems:"center", marginBottom:18, gap:12 }}>
                    <span style={{ font:`500 15px/20px ${F}`, color:"#3A424A" }}>Automation Progress</span>
                    {d.stages.msg && d.stages.state !== "progress" && <span style={{ marginLeft:"auto", font:`400 13px/18px ${F}`, color: d.stages.state === "failed" ? "#CF1322" : "#B45309", textAlign:"right" }}>{d.stages.msg}</span>}
                  </div>
                  <Stages {...d.stages} />
                </div>
                {d.tiles && (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:12 }}>
                    {d.tiles.map(([l, v, bad]) => (
                      <div key={l} style={{ ...card, padding:"14px 16px", display:"flex", flexDirection:"column", gap:6 }}>
                        <span style={{ font:`400 12px/16px ${F}`, color:"#6A717D" }}>{l}</span>
                        <span style={{ font:`600 20px/24px ${F}`, color: bad ? "#CF1322" : "#1F2937" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:18, alignItems:"start" }}>
                  {d.sections.map(sc => <FieldCard key={sc.title} {...sc} />)}
                </div>
              </div>
              <div style={{ flex:"0 1 360px", minWidth:280 }}>{actionRail}</div>
            </div>
          ) : tab === "lines" ? (
            <Table cols={d.lines.cols} rows={d.lines.rows} onRow={(r) => r.__open ? () => onOpen(r.__open[0], r.__open[1]) : null} />
          ) : (
            d.docs.length ? (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {d.docs.map(([n, sub, date, st]) => (
                  <div key={n} style={{ ...card, display:"flex", alignItems:"center", gap:14, padding:"12px 16px" }}>
                    <span style={{ width:36, height:44, borderRadius:4, background:"#F1F5F9", border:"1px solid #E2E8F0", display:"flex", alignItems:"flex-end", justifyContent:"center", paddingBottom:6, font:`700 9px/1 ${F}`, color:"#64748B", flexShrink:0, boxSizing:"border-box" }}>PDF</span>
                    <div style={{ display:"flex", flexDirection:"column", gap:2, minWidth:0, flex:1 }}>
                      <span style={{ font:`500 13px/18px ${F}`, color:"#1F2937" }}>{n}</span>
                      <span style={{ font:`400 12px/16px ${F}`, color:"#6A717D", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sub} · {date}</span>
                    </div>
                    <Pill tone={toneOf(st)}>{st}</Pill>
                    <span style={{ font:`400 13px/18px ${F}`, color: /not|missing/i.test(st) ? "#B6BCC6" : "#1677FF", cursor: /not|missing/i.test(st) ? "default" : "pointer", whiteSpace:"nowrap" }}>View</span>
                  </div>
                ))}
              </div>
            ) : <div style={{ ...card, padding:"40px 24px", textAlign:"center", font:`400 13px/18px ${F}`, color:"#94A3B8" }}>No documents attached to this record.</div>
          )}
        </div>
      </div>
      <style>{"@keyframes v2Fade{from{opacity:0}to{opacity:1}}@keyframes v2Slide{from{transform:translateX(28px);opacity:.6}to{transform:translateX(0);opacity:1}}"}</style>
    </div>
  );
}

// ── action-item queue (dashboard deep link) ─────────────────────────
const QCOLS = {
  claim:   [["name","Patient"],["claimNumber","Claim #"],["payor","Payor"],["submissionDate","Submitted"],["chargeAmt","Charge","right"],["status","Status"]],
  batch:   [["e5id","E5 ID"],["batchId","Batch ID"],["submitted","Submitted"],["claims","Claims"],["gateway","Gateway"],["status","Status"]],
  cdm:     [["name","Patient"],["mrn","MRN"],["workerName","Worker"],["currentStage","Stage"],["currentStatus","Status"],["reasonFailTerm","Reason"]],
  docext:  [["name","Patient"],["mrn","MRN"],["eventType","Event"],["stage","Current Stage"],["download","Download"]],
  denial:  [["name","Patient"],["acct","Account #"],["chPayor","Payer"],["codes","Denial Codes"],["remitStatus","Remit Status"],["reason","Reason"]],
  cash:    [["paymentId","Payment ID"],["payer","Payer"],["payDate","Payment Date"],["amt","Amount","right"],["vari","Variance","right"],["status","Status"]],
  f2f:     [["name","Patient"],["mrn","MRN"],["trigger","Audit Trigger"],["auditDate","Audit Date"],["due","F2F Due"],["remain","Days Remaining"],["req","Requirements"]],
  prebill: [["name","Patient"],["mrn","MRN"],["trigger","Audit Trigger"],["auditDate","Audit Date"],["pctS","Compliance","right"],["metS","Requirements"]],
  ipt:     [["name","Patient"],["mrn","MRN"],["refHub","Referral Hub"],["plan","Plan"],["chartStage","Chart Stage"],["alerts","Alerts","right"]],
  ipe:     [["name","Patient"],["plan","Plan"],["gw","Gateway"],["covS","Coverage"],["atReason","Reason"]],
};
const qRow = (kind, r) => {
  const x = { ...r };
  if (kind==="denial") x.codes = (r.denialCodes||[]).join(", ");
  if (kind==="cash") { x.amt = usd(r.amount); x.vari = usd(r.variance); }
  if (kind==="prebill") { x.pctS = r.pct + "%"; x.metS = r.met ? "Met" : "Not Met"; }
  if (kind==="ipe") x.covS = { accepted:"Active", declined:"Inactive", ineligible:"Exception" }[r.cov] || r.cov;
  ["status","currentStatus","remitStatus","req","metS","covS","download","chartStage"].forEach(k => { if (typeof x[k] === "string" && x[k]) x[k] = <Pill tone={toneOf(x[k])}>{x[k]}</Pill>; });
  return x;
};
function Queue({ kind, label, rows, dash, onBack, onOpen }) {
  const sec = SECTION[kind];
  return (
    <div data-screen-label={`Queue · ${label}`} style={{ minHeight:"100%", background:"#fff", font:`400 14px/18px ${F}` }}>
      <div style={{ background:BAND, color:"#fff", padding:"16px 32px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <button type="button" onClick={onBack} style={{ background:"rgba(208,217,229,0.11)", color:"#fff", border:"none", borderRadius:4, padding:"6px 12px", font:`400 13px/18px ${F}`, cursor:"pointer" }}>← Back to Dashboard</button>
          <Crumbs items={[{ label:"Dashboard", onClick:onBack }, { label:dash }, { label:"Action Items" }]} />
        </div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:16, marginTop:16, flexWrap:"wrap" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <span style={{ font:`400 12px/16px ${F}`, color:"rgba(255,255,255,.65)" }}>{sec[2]} · {sec[3]}</span>
            <span style={{ font:`500 22px/28px ${F}` }}>{label}</span>
          </div>
          <span style={{ background:"#CF1322", borderRadius:999, padding:"2px 10px", font:`500 13px/18px ${F}`, marginBottom:4 }}>{p2(rows.length)} Records</span>
          <button type="button" onClick={() => goCenter(kind)} style={{ ...btnS, marginLeft:"auto", background:"transparent", color:"#fff", borderColor:"rgba(255,255,255,.35)" }}>Open {sec[3]} →</button>
        </div>
      </div>
      <div style={{ padding:"20px 32px 40px" }}>
        <div style={{ font:`400 13px/18px ${F}`, color:"#6A717D", marginBottom:14 }}>{HAS_DETAIL[kind] ? "Select a record to open its detail screen." : `Select a record to work it in ${sec[3]}.`}</div>
        <Table cols={QCOLS[kind]} rows={rows.map(r => qRow(kind, r))} onRow={(qr) => { const r = rows.find(x => keyOf(x) === keyOf(qr)); return () => HAS_DETAIL[kind] ? onOpen(kind, r, false, rows) : goCenter(kind); }} />
      </div>
    </div>
  );
}


// ── Record tabs for the patient detail drawer ───────────────────────
// Claim Info / CDM Info / Extraction Info / Denial Info. One line tab per record
// (like Episode tabs in Authorization Info); each holds the record's information,
// its line items and documents as accordions.
const PATIENT_KINDS = { claim:"Claim Info", cdm:"CDM Info", docext:"Extraction Info", denial:"Denial Info" };
const LINE_TAB = { claim:(r) => "Claim - " + r.claimNumber, cdm:(r) => "Episode - " + r.episodeId, docext:(r) => "E5 ID - " + r.ref, denial:(r) => "Account - " + r.acct };
function V2RecordInfo({ patient, kind }) {
  const all = SRC[kind]();
  const fz = window.__v2DrawerFocus;
  const focus = fz && fz.kind === kind ? fz.row : null;
  const nm = (patient && patient.name) || (focus && focus.name);
  const recs = R.useMemo(() => {
    let rs = all.filter(r => r.name === nm);
    if (!rs.length && focus) rs = [focus];
    if (kind === "docext" && rs[0]) {
      // Prior completed extraction for the patient's earlier episode.
      const r0 = rs[0], n = parseInt(String(r0.id).replace(/\D/g, ""), 10) || 1, dd = addDays(r0.st.slice(0, 8), -60);
      rs = [...rs, { ...r0, id: r0.id + "-p", ref: "DX" + String(500 + n).padStart(10, "0"), eventType: r0.eventType === "Recertification" ? "Start of Care" : "Recertification",
        episodeId: r0.episodeId.replace(/\d+$/, (x) => String(+x - 60)), at: "thumb", stage: "EHR Upload", download: "downloaded", referral: true, visitNotes: true, st: dd + " 08:40 AM", et: dd + " 09:22 AM" }];
    }
    return rs;
  }, [nm, kind]);
  const [i, setI] = useS(() => Math.max(0, recs.findIndex(r => focus && r.id === focus.id)));
  const [done, setDone] = useS({});
  if (!recs.length) return <div style={{ padding:"28px clamp(16px, 2.4vw, 36px)", font:`400 14px/20px ${F}`, color:"#6A717D" }}>No {PATIENT_KINDS[kind].replace(" Info", "").toLowerCase()} records for this patient.</div>;
  const r = recs[Math.min(i, recs.length - 1)];
  const d = DETAIL[kind](r);
  const AA = typeof AuthAccordion !== "undefined" ? AuthAccordion : null;
  const ES = typeof EpisodeStat !== "undefined" ? EpisodeStat : null;
  const Acc = AA || (({ title, children }) => <div style={{ margin:"14px 0" }}><div style={{ font:`600 15px/20px ${F}`, color:"#1F2530", marginBottom:10 }}>{title}</div>{children}</div>);
  const blue = "#2F6FED";
  const chips = kind === "docext"
    ? [["Event Type", r.eventType], ["Download Status", d.status], ["AT Status", AT_META[atN(r.at)].label], ["Start Time", r.st], ["End Time", r.et]]
    : [["Status", d.status], ["AT Status", AT_META[atN(r.at)].label], ...d.meta.slice(2, 5)];
  const cols = d.lines.cols, lrows = d.lines.rows;
  return (
    <div style={{ padding:"22px clamp(16px, 2.4vw, 36px) 40px" }}>
      <div style={{ display:"flex", gap:0, borderBottom:"1px solid #E5E7EB", flexWrap:"wrap" }}>
        {recs.map((x, k) => {
          const sel = x === r;
          return <button key={x.id} type="button" onClick={() => setI(k)} style={{ background:"transparent", border:"none", cursor:"pointer", padding:"6px 4px 12px", marginRight:34, font:`${sel?600:400} 15px/20px ${F}`, color: sel ? blue : "#6A717D", borderBottom:`2px solid ${sel ? blue : "transparent"}`, marginBottom:-1 }}>{LINE_TAB[kind](x)}</button>;
        })}
      </div>
      <div style={{ display:"flex", gap:14, marginTop:20, flexWrap:"wrap" }}>
        {chips.map(([l, val]) =>
          ES ? <ES key={l} label={l} value={sv(val) || "—"} /> : <div key={l} style={{ ...card, padding:"10px 14px" }}><div style={{ font:`400 12px/16px ${F}`, color:"#6A717D" }}>{l}</div><div style={{ font:`600 15px/20px ${F}`, color:"#1F2530", marginTop:4 }}>{sv(val) || "—"}</div></div>)}
      </div>
      <div style={{ marginTop:22 }} key={kind + r.id}>
        <Acc title={PATIENT_KINDS[kind].replace(" Info", " Information")} defaultOpen={true}>
          <div style={{ padding:"6px 0 10px", display:"flex", flexDirection:"column", gap:18 }}>
            <Stages {...d.stages} />
            {d.actions.filter((x, k) => !done[r.id + k]).map((x, k) => {
              const tn = TONE[x.tone] || TONE.gray;
              return (
                <div key={k} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:6, background:tn.bg, border:`1px solid ${tn.bd}`, flexWrap:"wrap" }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:2, minWidth:200, flex:1 }}>
                    <span style={{ font:`500 13px/18px ${F}`, color:tn.c }}>{x.title}</span>
                    <span style={{ font:`400 12px/16px ${F}`, color:"#3A424A" }}>{x.desc}</span>
                  </div>
                  <span style={{ display:"flex", gap:8 }}>
                    <button type="button" style={btnP} onClick={() => setDone(m => ({ ...m, [r.id + k]: true }))}>{x.primary}</button>
                    {x.secondary && <button type="button" style={btnS} onClick={() => setDone(m => ({ ...m, [r.id + k]: true }))}>{x.secondary}</button>}
                  </span>
                </div>
              );
            })}
            {d.tiles && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:12 }}>
                {d.tiles.map(([l, val, bad]) => (
                  <div key={l} style={{ ...card, padding:"12px 14px", display:"flex", flexDirection:"column", gap:4 }}>
                    <span style={{ font:`400 12px/16px ${F}`, color:"#6A717D" }}>{l}</span>
                    <span style={{ font:`600 18px/22px ${F}`, color: bad ? "#CF1322" : "#1F2937" }}>{val}</span>
                  </div>
                ))}
              </div>
            )}
            {d.sections.map(sc => (
              <div key={sc.title} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <span style={{ font:`600 13px/18px ${F}`, color:"#3A424A" }}>{sc.title}</span>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:"14px 24px" }}>
                  {sc.fields.map(([l, val]) => (
                    <div key={l} style={{ display:"flex", flexDirection:"column", gap:4, minWidth:0 }}>
                      <span style={{ font:`400 12px/16px ${F}`, color:"#6A717D" }}>{l}</span>
                      <span style={{ font:`500 14px/18px ${F}`, color:"#1F2530", overflowWrap:"anywhere" }}>{sv(val) || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Acc>
        <Acc title={`${d.lines.title} (${p2(lrows.length)})`} defaultOpen={true}>
          <div style={{ padding:"6px 0 10px" }}><Table cols={cols} rows={lrows} /></div>
        </Acc>
        <Acc title={`Documents (${p2(d.docs.length)})`} defaultOpen={true}>
          <div style={{ padding:"6px 0 10px", display:"flex", flexDirection:"column", gap:8 }}>
            {d.docs.length ? d.docs.map(([n, sub, date, st]) => (
              <div key={n} style={{ ...card, display:"flex", alignItems:"center", gap:14, padding:"12px 16px" }}>
                <span style={{ width:36, height:44, borderRadius:4, background:"#F1F5F9", border:"1px solid #E2E8F0", display:"flex", alignItems:"flex-end", justifyContent:"center", paddingBottom:6, font:`700 9px/1 ${F}`, color:"#64748B", flexShrink:0, boxSizing:"border-box" }}>PDF</span>
                <div style={{ display:"flex", flexDirection:"column", gap:2, minWidth:0, flex:1 }}>
                  <span style={{ font:`500 13px/18px ${F}`, color:"#1F2937" }}>{n}</span>
                  <span style={{ font:`400 12px/16px ${F}`, color:"#6A717D", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sub} · {date}</span>
                </div>
                <Pill tone={toneOf(st)}>{st}</Pill>
                <span style={{ font:`400 13px/18px ${F}`, color: /not|missing/i.test(st) ? "#B6BCC6" : "#1677FF", cursor: /not|missing/i.test(st) ? "default" : "pointer" }}>View</span>
              </div>
            )) : <div style={{ font:`400 13px/18px ${F}`, color:"#94A3B8" }}>No documents attached to this record.</div>}
          </div>
        </Acc>
      </div>
    </div>
  );
}
window.V2RecordInfo = V2RecordInfo;
window.V2_PATIENT_TABS = Object.entries(PATIENT_KINDS);

// ── overlay host (detail + queue stack) ─────────────────────────────
class V2Boundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err) { console.error("v2 detail failed:", err); }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div style={{ position:"fixed", inset:0, zIndex:70, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.25)" }} onClick={this.props.onClose}>
        <div style={{ background:"#fff", borderRadius:8, padding:"24px 28px", maxWidth:420, font:`400 14px/20px ${F}`, color:"#3A424A", display:"flex", flexDirection:"column", gap:14 }}>
          <span style={{ font:`500 16px/20px ${F}` }}>This record couldn't be opened.</span>
          <button type="button" style={{ ...btnP, alignSelf:"flex-end" }} onClick={this.props.onClose}>Close</button>
        </div>
      </div>
    );
  }
}
function V2Host() {
  const [stack, setStack] = useS([]);
  useE(() => {
    window.__v2Detail = (v) => setStack(v ? [v] : []);
    window.__v2OpenDetail = (kind, row) => { if (PATIENT_KINDS[kind] && window.__openV2Drawer) { setStack([]); window.__openV2Drawer(kind, row); return; } setStack([{ type:"detail", kind, row }]); };
    window.__v2OpenQueue = (q) => setStack([{ type:"queue", ...q }]);
  }, []);
  useE(() => { const k = (e) => { if (e.key === "Escape") setStack(s => s.slice(0, -1)); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, []);
  if (!stack.length) return null;
  const top = stack[stack.length - 1];
  const qIdx = stack.map(x => x.type).lastIndexOf("queue");
  const queue = qIdx >= 0 ? stack[qIdx] : null;
  const open = (kind, row, replace, list) => (PATIENT_KINDS[kind] && window.__openV2Drawer) ? (setStack(s => s.filter(x => x.type === "queue")), window.__openV2Drawer(kind, row)) : setStack(s => replace ? [...s.slice(0, -1), { ...s[s.length-1], kind, row }] : [...s, { type:"detail", kind, row, list }]);
  return (
    <R.Fragment>
      {queue && (
        <div id="__v2host" className="ws-scrollbody" style={{ position:"fixed", top:72, left:0, right:0, bottom:0, zIndex:55, background:"#fff", overflowY:"auto" }}>
          <Queue {...queue} onBack={() => setStack(stack.slice(0, qIdx))} onOpen={open} />
        </div>
      )}
      {top.type === "detail" && (
        <V2Boundary key={top.kind + keyOf(top.row)} onClose={() => setStack(s => s.slice(0, -1))}>
          <RecordDetail kind={top.kind} row={top.row}
            list={top.list || (queue ? queue.rows : SRC[top.kind]())}
            onOpen={open} onBack={() => setStack(s => s.slice(0, -1))} />
        </V2Boundary>
      )}
    </R.Fragment>
  );
}
function mountHost() {
  if (document.getElementById("__v2root")) return;
  const el = document.createElement("div"); el.id = "__v2root"; document.body.appendChild(el);
  ReactDOM.createRoot(el).render(<V2Host />);
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountHost); else mountHost();

// ── dashboard configs ───────────────────────────────────────────────
const PAL = ["#61AA6B","#4C9FD1","#F8C87C","#F87D7C","#A18B6D","#7C6BD6","#156082","#91DCF7"];
const by = (rows, f) => { const m = {}; rows.forEach(r => { const k = f(r); if (k) (m[k] = m[k] || []).push(r); }); return Object.keys(m).map(k => ({ reason:k, rows:m[k] })).sort((a,b) => b.rows.length - a.rows.length); };
const pctOf = (a, b) => b ? Math.round(a / b * 100) : 0;
const avgDays = (rows, a, b) => { const ds = rows.map(r => { const x = pd(a(r)), y = pd(b(r)); return x && y ? (y - x) / 864e5 : null; }).filter(v => v != null && v >= 0); return ds.length ? (ds.reduce((s,v)=>s+v,0) / ds.length).toFixed(1) + " Days" : "—"; };

const DASH = {
  claim: () => {
    const cb = SRC.batch();
    return {
      title:"Claim Summary", kind:"claim", rows:SRC.claim(), date:r => r.submissionDate, dateLabel:"Submission Date", minsPer:9,
      filters:[{key:"agency",label:"Agency"},{key:"branch",label:"Branch"},{key:"payor",label:"Payor"},{key:"gw",label:"Gateway"},{key:"billType",label:"Bill Type"}],
      kpis:[["All Claims",null],["Accepted",r=>/Accepted/.test(r.status)],["Payor Pending",r=>r.status==="Payor Pending"],["CH Rejected",r=>r.status==="CH Rejected"],["Payor Rejected",r=>r.status==="PP Rejected"||r.status==="Payor Rejected"],["Exceptions",r=>r.status==="Exception"]],
      avg: rows => avgDays(rows, r => r.submissionDate, r => r.eobDate),
      metric5: rows => ["Total Charges", usdK(rows.reduce((s,r)=>s+num(r.chargeAmt),0))],
      donut: { title:"Claim Status Distribution", f:r => /Accepted/.test(r.status) ? "Accepted" : /Pending/.test(r.status) ? "Pending" : /Rejected/.test(r.status) ? "Rejected" : "Exception" },
      breakdown: { title:"Claims By Payor", f:r => r.payor },
      business: { title:"Claim Rejections", items: rows => [["Clearing House Rejected",r=>r.status==="CH Rejected"],["Pre-Payor Rejected",r=>r.status==="PP Rejected"],["Payor Rejected",r=>r.status==="Payor Rejected"],["Claim Exceptions",r=>r.status==="Exception"]].map(([l,f]) => ({ label:l, kind:"claim", rows:rows.filter(f) })).concat([{ label:"Batches Rejected", kind:"batch", rows:cb.filter(b => b.status==="Rejected") }]) },
      attention: rows => [
        { g:"failed", title:"Failed", sub:"Technical Exception", items:[...by(rows.filter(r=>r.at==="warning"), () => "Claim status inquiry (276) timed out").map(x=>({...x,kind:"claim"})), ...by(cb.filter(b=>b.at==="warning"), () => "Gateway SFTP upload failed").map(x=>({...x,kind:"batch"}))] },
      ],
      intervention: rows => [{ g:"int", title:"Pending Interventions", sub:"Open - Awaiting Action", items: by(rows.filter(r=>r.at==="intervention"), () => "HIPPS code missing on claim header").map(x=>({...x,kind:"claim"})) }],
    };
  },
  cdm: () => ({
    title:"CDM Summary", kind:"cdm", rows:SRC.cdm(), date:r => r.txnArrived, dateLabel:"Transaction Arrived", minsPer:14,
    filters:[{key:"branchId",label:"Branch"},{key:"workerName",label:"Worker Name"},{key:"primaryPayor",label:"Primary Payor"},{key:"currentStage",label:"Current Stage"}],
    kpis:[["All Requests",null],["Completed",r=>r.currentStatus==="Completed"],["Active",r=>r.currentStatus==="Active"],["Failed",r=>r.currentStatus==="Failed"],["Terminated",r=>r.currentStatus==="Terminated"],["Docs Missing",r=>!r.docs]],
    avg: rows => avgDays(rows, r => r.txnArrived, r => r.txnEnd),
    metric5: rows => ["Hours Validated", Math.round(rows.filter(r=>r.currentStatus==="Completed").reduce((s,r)=>s+num(r.eligPcHours)+num(r.eligAttendHours),0)).toLocaleString()],
    donut: { title:"CDM Status Distribution", f:r => r.currentStatus },
    breakdown: { title:"Requests By Current Stage", f:r => r.currentStage },
    business: { title:"Hours Validation", items: rows => [{ label:"Supporting Documents Missing", kind:"cdm", rows:rows.filter(r=>!r.docs && r.currentStatus!=="Completed") }, { label:"Active Over 7 Days", kind:"cdm", rows:rows.filter(r=>r.currentStatus==="Active" && ageDays(r.txnArrived, rows.map(x=>x.txnArrived)) > 7) }] },
    attention: rows => [
      { g:"failed", title:"Failed", sub:"Technical Exception", items: by(rows.filter(r=>r.currentStatus==="Failed"), r => r.reasonFailTerm).map(x=>({...x,kind:"cdm"})) },
      { g:"terminated", title:"Terminated", sub:"Business Exception", items: by(rows.filter(r=>r.currentStatus==="Terminated"), r => r.reasonFailTerm).map(x=>({...x,kind:"cdm"})) },
    ],
    intervention: () => [],
  }),
  remits: (mode) => mode === "cash" ? ({
    title:"Remits Summary", kind:"cash", rows:SRC.cash(), date:r => r.payDate, dateLabel:"Payment Date", minsPer:11,
    filters:[{key:"agency",label:"Agency"},{key:"payer",label:"Payer"},{key:"location",label:"Location"}],
    kpis:[["All Payments",null],["Completed",r=>r.status==="Completed"],["In Progress",r=>r.status==="In Progress"],["Failed",r=>r.status==="Failed"],["Terminated",r=>r.status==="Terminated"],["With Variance",r=>r.variance>0]],
    avg: () => "1.2 Hrs",
    metric5: rows => ["Amount Posted", usdK(rows.reduce((s,r)=>s+r.posted,0))],
    donut: { title:"Posting Status Distribution", f:r => r.status },
    breakdown: { title:"Payments By Payer", f:r => r.payer },
    business: { title:"Reconciliation", items: rows => [{ label:"Unposted Variance", kind:"cash", rows:rows.filter(r=>r.variance>0 && r.status==="Completed") }, { label:"EOB Not Uploaded", kind:"cash", rows:rows.filter(r=>!r.eob) }, { label:"Missing From Payment Report", kind:"cash", rows:rows.filter(r=>!r.fileAvail) }] },
    attention: rows => [
      { g:"failed", title:"Failed", sub:"Technical Exception", items: by(rows.filter(r=>r.status==="Failed"), r => r.reason).map(x=>({...x,kind:"cash"})) },
      { g:"terminated", title:"Terminated", sub:"Business Exception", items: by(rows.filter(r=>r.status==="Terminated"), r => r.reason).map(x=>({...x,kind:"cash"})) },
    ],
    intervention: () => [],
  }) : ({
    title:"Remits Summary", kind:"denial", rows:SRC.denial(), date:r => r.transInit, dateLabel:"Transaction Init Date", minsPer:12,
    filters:[{key:"agency",label:"Agency"},{key:"wsPayer",label:"Waystar Payer"},{key:"serviceLine",label:"Service Line"},{key:"remitStatus",label:"Remit Status"}],
    kpis:[["All Denials",null],["Denied",r=>r.remitStatus==="Denied"],["Partially Paid",r=>r.remitStatus==="Partially Paid"],["Appealed",r=>r.remitStatus==="Appealed"],["Resubmitted",r=>r.remitStatus==="Resubmitted"],["Written Off",r=>r.remitStatus==="Written Off"]],
    avg: () => "0.8 Hrs",
    metric5: rows => ["Denial Codes Worked", p2(rows.reduce((s,r)=>s+(r.denialCodes||[]).length,0))],
    donut: { title:"Remit Status Distribution", f:r => r.remitStatus },
    breakdown: { title:"Top Denial Codes", multi:r => r.denialCodes || [] },
    business: { title:"Denials To Work", items: rows => [{ label:"Denied — Appeal Or Write Off", kind:"denial", rows:rows.filter(r=>r.remitStatus==="Denied") }, { label:"Partially Paid", kind:"denial", rows:rows.filter(r=>r.remitStatus==="Partially Paid") }, { label:"EOB Not Uploaded", kind:"denial", rows:rows.filter(r=>!r.eob) }] },
    attention: rows => [{ g:"terminated", title:"Terminated", sub:"Business Exception", items: by(rows.filter(r=>r.at==="warning"), r => r.reason).map(x=>({...x,kind:"denial"})) }],
    intervention: () => [],
  }),
  docext: () => {
    const why = (r) => ({ "Document Retrieval":"Document not found in EHR", "OCR Extraction":"OCR confidence below threshold", "Data Validation":"Required field missing — Primary Diagnosis" })[r.stage] || "EHR upload rejected";
    return {
      title:"Doc Extraction Summary", kind:"docext", rows:SRC.docext(), date:r => dOnly(r.st), dateLabel:"Extraction Start Date", minsPer:18,
      filters:[{key:"agency",label:"Agency"},{key:"branch",label:"Branch"},{key:"eventType",label:"Event Type"}],
      kpis:[["All Records",null],["Downloaded",r=>r.download==="downloaded"],["Pending",r=>r.download==="pending"],["Failed",r=>r.download==="failed"],["Referral Missing",r=>!r.referral],["Visit Notes Missing",r=>!r.visitNotes]],
      avg: () => "54 Min",
      metric5: rows => ["Documents Processed", p2(rows.reduce((s,r)=>s+(r.referral?1:0)+(r.visitNotes?1:0),0))],
      donut: { title:"Download Status Distribution", f:r => ({ downloaded:"Downloaded", pending:"Pending", failed:"Failed" })[r.download] },
      breakdown: { title:"Records By Current Stage", f:r => r.stage },
      business: { title:"Missing Documents", items: rows => [{ label:"Referral Document Missing", kind:"docext", rows:rows.filter(r=>!r.referral) }, { label:"Visit Notes Missing", kind:"docext", rows:rows.filter(r=>!r.visitNotes) }] },
      attention: rows => [
        { g:"failed", title:"Failed", sub:"Technical Exception", items: by(rows.filter(r=>r.at==="warning" && r.stage==="OCR Extraction"), why).map(x=>({...x,kind:"docext"})) },
        { g:"terminated", title:"Terminated", sub:"Business Exception", items: by(rows.filter(r=>r.at==="warning" && r.stage!=="OCR Extraction"), why).map(x=>({...x,kind:"docext"})) },
      ],
      intervention: () => [],
    };
  },
  audit: (mode) => mode === "f2f" ? ({
    title:"Audit Summary", kind:"f2f", rows:SRC.f2f(), date:r => r.auditDate || r.soc, dateLabel:"Audit Date", minsPer:22,
    filters:[{key:"branch",label:"Branch"},{key:"refSrc",label:"Referral Source"},{key:"trigger",label:"Audit Trigger"},{key:"auditor",label:"Auditor"}],
    kpis:[["All Audits",null],["Met",r=>r.req==="Met"],["Not Met",r=>r.req==="Not Met"],["Exception",r=>r.req==="Exception"],["485 Delayed",r=>r.req==="485 Delayed"],["Due ≤ 1 Day / Past Due",r=>r.remainKind==="danger"]],
    avg: () => "6.5 Min",
    metric5: rows => ["Requirements Met", pctOf(rows.filter(r=>r.req==="Met").length, rows.length) + "%"],
    donut: { title:"F2F Requirement Distribution", f:r => r.req },
    breakdown: { title:"Audits By Trigger", f:r => r.trigger },
    business: { title:"Encounter Deadlines", items: rows => [{ label:"F2F Encounter Past Due", kind:"f2f", rows:rows.filter(r=>r.remain==="Past Due") }, { label:"Due Within 1 Day", kind:"f2f", rows:rows.filter(r=>r.remainKind==="danger" && r.remain!=="Past Due") }, { label:"Due Within 15 Days", kind:"f2f", rows:rows.filter(r=>r.remainKind==="warn") }, { label:"Requirements Not Met", kind:"f2f", rows:rows.filter(r=>r.req==="Not Met") }] },
    attention: rows => [{ g:"terminated", title:"Incomplete", sub:"Business Exception", items: by(rows.filter(r=>r.at==="incomplete"), r => r.ehr===false ? "EHR sync pending for audit" : r.req==="485 Delayed" ? "Signed 485 not received" : "F2F encounter note not found").map(x=>({...x,kind:"f2f"})) }],
    intervention: () => [],
  }) : ({
    title:"Audit Summary", kind:"prebill", rows:SRC.prebill(), date:r => r.auditDate, dateLabel:"Audit Date", minsPer:25,
    filters:[{key:"branch",label:"Branch"},{key:"trigger",label:"Audit Trigger"},{key:"agent",label:"Auditor"}],
    kpis:[["All Audits",null],["Requirements Met",r=>r.met],["Not Met",r=>!r.met],["AI Processed",r=>r.source==="ai"],["Manually Overridden",r=>r.source==="override"],["EHR Sync Pending",r=>!r.ehr]],
    avg: () => "7.2 Min",
    metric5: rows => ["Avg Compliance", (rows.length ? Math.round(rows.reduce((s,r)=>s+(r.pct||0),0)/rows.length) : 0) + "%"],
    donut: { title:"Requirement Distribution", f:r => r.met ? "Met" : "Not Met" },
    breakdown: { title:"Audits By Trigger", f:r => r.trigger },
    business: { title:"Requirements Not Met", items: rows => by(rows.filter(r=>!r.met), r => ({1:"Collect missing F2F encounter note",2:"Obtain homebound justification",3:"Physician signature required"})[r.next] || "Review audit findings").map(x => ({ label:x.reason, kind:"prebill", rows:x.rows })) },
    attention: rows => [{ g:"terminated", title:"Incomplete", sub:"Business Exception", items: by(rows.filter(r=>r.at==="incomplete"), r => r.ehr ? "Document classification incomplete" : "EHR sync pending for audit").map(x=>({...x,kind:"prebill"})) }],
    intervention: () => [],
  }),
  intakePt: (mode) => mode === "ipe" ? ({
    title:"Intake Summary", kind:"ipe", rows:SRC.ipe(), date:r => r.pdd, dateLabel:"Planned Discharge Date", minsPer:10,
    filters:[{key:"branch",label:"Branch"},{key:"agency",label:"Agency"},{key:"plan",label:"Primary Plan"},{key:"gw",label:"Gateway"}],
    kpis:[["All Requests",null],["Active",r=>r.cov==="accepted"],["Inactive",r=>r.cov==="declined"],["Exceptions",r=>r.cov==="ineligible"],["With Alerts",r=>r.alerts>0],["Docs Missing",r=>!r.docs]],
    avg: () => "3.4 Min",
    metric5: rows => ["Coverage Verified", pctOf(rows.filter(r=>r.cov==="accepted").length, rows.length) + "%"],
    donut: { title:"Coverage Status Distribution", f:r => ({ accepted:"Active", declined:"Inactive", ineligible:"Exception" })[r.cov] },
    breakdown: { title:"Requests By Plan", f:r => r.plan },
    business: { title:"Pre-Eligibility Alerts", items: rows => by(rows.filter(r=>(r.alertItems||[]).length), r => r.alertItems[0].text).map(x => ({ label:x.reason, kind:"ipe", rows:x.rows })) },
    attention: rows => ["failed","terminated"].map(g => ({ g, title: g==="failed" ? "Failed" : "Terminated", sub: g==="failed" ? "Technical Exception" : "Business Exception", items: by(rows.filter(r=>r.at==="warning" && (r.atGroup||"terminated")===g), r => r.atReason).map(x=>({...x,kind:"ipe"})) })),
    intervention: () => [],
  }) : ({
    title:"Intake Summary", kind:"ipt", rows:SRC.ipt(), date:r => dOnly(r.arrivedDate) || null, dateLabel:"Arrived Date", minsPer:35,
    filters:[{key:"branch",label:"Branch"},{key:"agency",label:"Agency"},{key:"refHub",label:"Referral Hub"},{key:"plan",label:"Primary Plan"}],
    kpis:[["All Patients",null],["Chart Completed",r=>r.chartStage==="Chart Completed"],["Chart In Progress",r=>r.chartStage==="Chart In Progress"],["Chart Failed",r=>r.chartStage==="Chart Failed"],["EHR Sync Pending",r=>!r.ehrSync],["With Alerts",r=>r.alerts>0]],
    avg: () => "42 Min",
    metric5: rows => ["Charts Created", p2(rows.filter(r=>r.chartStage==="Chart Completed").length)],
    donut: { title:"Chart Stage Distribution", f:r => r.chartStage || "Not Started" },
    breakdown: { title:"Patients By Referral Hub", f:r => r.refHub },
    business: { title:"Intake Alerts", items: rows => by(rows.filter(r=>(r.alertItems||[]).length), r => r.alertItems[0].text).map(x => ({ label:x.reason, kind:"ipt", rows:x.rows })) },
    attention: rows => [
      { g:"failed", title:"Failed", sub:"Technical Exception", items: by(rows.filter(r=>r.at==="warning" && r.chartStage==="Chart Failed"), () => "Chart creation failed in EHR").map(x=>({...x,kind:"ipt"})) },
      { g:"terminated", title:"Terminated", sub:"Business Exception", items: by(rows.filter(r=>r.at==="warning" && r.chartStage!=="Chart Failed"), r => (r.alertItems && r.alertItems[0] && r.alertItems[0].text) || "Payor source details incomplete").map(x=>({...x,kind:"ipt"})) },
    ],
    intervention: () => [],
  }),
};
const MODES = { remits:[["denial","Denial Management"],["cash","Cash Posting"]], audit:[["prebill","Pre-Bill Audit"],["f2f","F2F Encounter Audit"]], intakePt:[["ipt","Patient Intake"],["ipe","Pre-Eligibility"]] };
const DASH_TITLE = { claim:"Claim", cdm:"CDM", remits:"Remits", docext:"Doc Extraction", audit:"Audit", intakePt:"Intake" };
function ageDays(s, all) { const ref = Math.max(...all.map(x => (pd(x)||0) - 0)); const d = pd(s); return d ? Math.round((ref - d) / 864e5) : 0; }

function V2DashShell({ kind }) {
  const modes = MODES[kind];
  const [mode, setMode] = useS(modes ? modes[0][0] : null);
  const cfg = DASH[kind](mode);
  const loaded = cfg.rows.length > 0;
  if (!loaded) return <div style={{ padding:"80px 32px", textAlign:"center", font:`400 15px/22px ${F}`, color:"#8A94A6" }}>Loading {DASH_TITLE[kind]} data…</div>;
  return <V2Dash key={kind + mode} kind={kind} cfg={cfg} mode={mode} modes={modes} onMode={setMode} />;
}
function V2Dash({ kind, cfg, mode, modes, onMode }) {
  const all = cfg.rows;
  const dates = uniq(all.map(cfg.date).filter(Boolean).map(dOnly).filter(Boolean)).sort((a,b) => pd(a) - pd(b));
  const [range, setRange] = useS(() => dates.length ? { start:dates[0], end:dates[dates.length-1] } : null);
  const [ff, setFF] = useS([]);
  const [grain, setGrain] = useS("day");
  const [aiTab, setAiTab] = useS("attention");
  const rows = R.useMemo(() => all.filter(r => {
    if (ff.length && !ff.every(x => x.values.includes(r[x.field]))) return false;
    const d = pd(cfg.date(r)); if (!range || !d) return true;
    const s = pd(range.start), e = pd(range.end); return (!s || d >= s) && (!e || d <= e);
  }), [all, ff, range]);
  const n = rows.length;
  const openQ = (label, k, rs) => window.__v2OpenQueue && window.__v2OpenQueue({ kind:k, label, rows:rs, dash: DASH_TITLE[kind] + " Dashboard" });

  const at = { done:0, progress:0, attention:0, intervention:0 };
  rows.forEach(r => { at[atN(r.at)] += 1; });
  const success = pctOf(at.done, at.done + at.attention + at.intervention);
  const ds = rows.map(r => pd(cfg.date(r))).filter(Boolean);
  const span = ds.length ? Math.max(1, Math.round((Math.max(...ds) - Math.min(...ds)) / 864e5) + 1) : 1;
  const hours = Math.round(at.done * cfg.minsPer / 60 * 10) / 10;
  const metrics = [["Throughput Per Day", (n / span).toFixed(1)], ["Avg Completion Time", cfg.avg(rows)], ["Automation Success Rate", success + "%"], ["Hours Saved", hours], cfg.metric5(rows)];
  const kpis = cfg.kpis.map(([label, f]) => f ? { label, pct: pctOf(rows.filter(f).length, n) + "%", count: p2(rows.filter(f).length), onClick: () => openQ(label, cfg.kind, rows.filter(f)) } : { label, value: p2(n), onClick: () => goCenter(cfg.kind) });

  // trend
  const trend = (() => {
    const m = new Map();
    rows.forEach(r => { const d = pd(cfg.date(r)); if (!d) return; if (grain === "week") d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); m.set(+d, (m.get(+d) || 0) + 1); });
    const data = [...m.keys()].sort((a,b) => a-b).map(k => { const d = new Date(k); return { label: String(d.getMonth()+1).padStart(2,"0") + "/" + String(d.getDate()).padStart(2,"0") + "/" + d.getFullYear(), value: m.get(k) }; });
    const max = Math.max(4, Math.ceil(Math.max(1, ...data.map(x => x.value)) / 4) * 4);
    return { data: data.length ? data : [{ label:"—", value:0 }], max };
  })();
  // status donut
  const donut = by(rows, cfg.donut.f).map((x, i) => [x.reason, x.rows.length, PAL[i % PAL.length], x.rows]);
  // automation donut
  const autoSeg = [["Completed", at.done, "#61AA6B"], ["In Progress", at.progress, "#4C9FD1"], ["Needs Attention", at.attention, "#F8C87C"], ["Needs Intervention", at.intervention, "#F87D7C"]];
  // aging — open (not completed) records by age vs the latest date in range
  const ref = ds.length ? Math.max(...ds) : 0;
  const AG = [["0 - 07 days",0,7],["08 - 14 days",8,14],["15 - 30 days",15,30],["30+ days",31,1e9]];
  const openRows = rows.filter(r => atN(r.at) !== "done");
  const aging = AG.map(([label, lo, hi]) => ({ label, value: openRows.filter(r => { const d = pd(cfg.date(r)); if (!d) return false; const a = Math.round((ref - d) / 864e5); return a >= lo && a <= hi; }).length }));
  const agMax = Math.max(4, Math.ceil(Math.max(1, ...aging.map(x => x.value)) / 4) * 4);
  // breakdown
  const bdRaw = cfg.breakdown.multi ? (() => { const m = {}; rows.forEach(r => cfg.breakdown.multi(r).forEach(c => { m[c] = (m[c]||0) + 1; })); return Object.keys(m).map(k => ({ reason:k, rows:{ length:m[k] } })).sort((a,b)=>b.rows.length-a.rows.length); })() : by(rows, cfg.breakdown.f);
  const bd = bdRaw.slice(0, 6).map(x => ({ label: x.reason.length > 14 ? x.reason.slice(0, 13) + "…" : x.reason, value: x.rows.length }));
  const bdMax = Math.max(4, Math.ceil(Math.max(1, ...bd.map(x => x.value)) / 4) * 4);

  // action rail
  const biz = cfg.business.items(rows).filter(x => x.rows.length);
  const attn = cfg.attention(rows).filter(g => g.items.length);
  const intv = cfg.intervention(rows).filter(g => g.items.length);
  const cnt = (gs) => gs.reduce((s, g) => s + g.items.reduce((t, x) => t + x.rows.length, 0), 0);
  const attnN = cnt(attn), intvN = cnt(intv);
  const bizN = biz.reduce((s, x) => s + x.rows.length, 0);

  const Bar = window.ARVFilterBarChips;
  const chartBody = { paddingTop: 10 };
  return (
    <div style={{ display:"flex", alignItems:"stretch" }}>
      <div style={{ flex:"1 1 0", minWidth:0 }}>
        {Bar && <Bar hideSearch={true} datePicker={{ label: cfg.dateLabel, value: range, available: dates, onChange: setRange }} filterFields={cfg.filters} filterRows={all} fieldFilters={ff} onFieldFilters={setFF} />}
        <div style={{ padding:"20px 32px 32px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, font:`500 18px/22px ${F}`, color:"#0f172a" }}>
            {cfg.title}
            {modes && <span style={{ font:`400 13px/16px ${F}` }}><PickerBtn options={modes} value={mode} onChange={onMode} /></span>}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(30, minmax(0, 1fr))", gap:9, marginTop:16 }}>
            {kpis.map(s => <div key={s.label} style={{ display:"flex", minWidth:0, gridColumn:"span 5" }}><PCRStatCard {...s} fill /></div>)}
            <div style={{ gridColumn:"1 / -1", font:`500 18px/22px ${F}`, color:"#0f172a", marginTop:11, marginBottom:3 }}>Cost And Time Metrics</div>
            {metrics.map(([l, v]) => <div key={l} style={{ display:"flex", minWidth:0, gridColumn:"span 6" }}><StatCard label={l} value={v} fill /></div>)}
          </div>
          <div className="ws-scrollbody" style={{ display:"flex", flexDirection:"column", gap:18, marginTop:24, overflowY:"auto", maxHeight:"calc(100vh - 500px)", minHeight:320, paddingRight:4 }}>
            <div style={{ font:`500 16px/20px ${F}`, color:"#3A424A" }}>{DASH_TITLE[kind]} Transaction Analytics</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gridAutoRows:"294px", gap:18 }}>
              <DashCard title="Transaction Trend" info right={<PickerBtn options={[["day","By Day"],["week","By Week"]]} value={grain} onChange={setGrain} />} style={{ height:294, gridColumn:"1 / -1" }} bodyStyle={chartBody}>
                <SimpleLineChart data={trend.data} max={trend.max} step={trend.max / 4} yLabel="No. Of Transactions" color="#7C6BD6" />
              </DashCard>
              <DashCard title={cfg.donut.title} info style={{ height:294 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:36 }}>
                  <Donut size={180} thickness={30} segments={donut.map(x => ({ value: x[1] || 0.001, color: x[2] }))} centerTop={n} centerBottom="RECORDS" centerTopSize={18} centerTopWeight={600} centerTopY="47%" centerBottomSize={10} centerBottomWeight={500} centerBottomY="61%" />
                  <div style={{ flex:"0 1 240px", minWidth:0 }}>
                    {donut.slice(0, 5).map((x, i) => <div key={x[0]} onClick={() => openQ(x[0], cfg.kind, x[3])} style={{ cursor:"pointer" }}><LegendRow color={x[2]} label={x[0]} value={p2(x[1])} divider={i < Math.min(donut.length, 5) - 1} /></div>)}
                  </div>
                </div>
              </DashCard>
              <DashCard title="Automation Success Rate" info style={{ height:294 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:36 }}>
                  <Donut size={180} thickness={30} segments={autoSeg.map(x => ({ value: x[1] || 0.001, color: x[2] }))} centerTop={success + "%"} centerBottom="SUCCESS" centerTopSize={18} centerTopWeight={600} centerTopY="47%" centerBottomSize={10} centerBottomWeight={500} centerBottomY="61%" />
                  <div style={{ flex:"0 1 240px", minWidth:0 }}>
                    {autoSeg.map((x, i) => <LegendRow key={x[0]} color={x[2]} label={x[0]} value={p2(x[1])} divider={i < 3} />)}
                  </div>
                </div>
              </DashCard>
              <DashCard title="Open Item Aging" info style={{ height:294 }} bodyStyle={chartBody}>
                <SimpleBarChart data={aging} max={agMax} step={agMax / 4} yLabel="Open Records" color="#F87D7C" barW={46} />
              </DashCard>
              <DashCard title={cfg.breakdown.title} info style={{ height:294 }} bodyStyle={chartBody}>
                <SimpleBarChart data={bd.length ? bd : [{ label:"—", value:0 }]} max={bdMax} step={bdMax / 4} yLabel="No. Of Records" color="#4C9FD1" barW={36} />
              </DashCard>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position:"relative", zIndex:2, width:560, flexShrink:0, background:"#fff", boxShadow:"-10px 0 24px 0 #1C2D420C" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:51, background:"#FFF1F1" }} />
        <div style={{ position:"relative", padding:"16px 20px 28px 32px", display:"flex", flexDirection:"column", minHeight:"calc(100vh - 190px)" }}>
          <div style={{ background:"#fff", border:"1px solid #F3E0E0", borderRadius:9, boxShadow:"0 1px 3px rgba(86,86,86,.06)", display:"flex", alignItems:"center", padding:"16px 18px", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}><WarnGlyph /><span style={{ font:`500 19px/23px ${F}`, color:"#3A424A" }}>{DASH_TITLE[kind]} Action Items</span></div>
            <span style={{ marginLeft:"auto", font:`400 15px/20px ${F}`, color:"#6A717D" }}><span style={{ color:"#CF1322" }}>{bizN + attnN + intvN} Items</span> Needs Review</span>
          </div>

          <div style={{ display:"flex", alignItems:"center", marginBottom:12 }}>
            <span style={{ font:`500 18px/22px ${F}`, color:"#3A424A" }}>{cfg.business.title}</span>
            <span style={{ marginLeft:10, background:"#FFE7E6", color:"#CF1322", borderRadius:999, padding:"1px 9px", font:`500 13px ${F}` }}>{p2(bizN)}</span>
          </div>
          {biz.length ? biz.map(x => <BigActionRow key={x.label} noIcon label={x.label} count={p2(x.rows.length)} onClick={() => openQ(x.label, x.kind, x.rows)} />)
            : <div style={{ padding:"14px 16px", border:"1px solid #F1E4E4", borderRadius:9, font:`400 14px/20px ${F}`, color:"#8A94A6", marginBottom:12 }}>Nothing to work in this period</div>}

          <div style={{ display:"flex", alignItems:"center", marginTop:20, marginBottom:12 }}>
            <span style={{ font:`500 18px/22px ${F}`, color:"#3A424A" }}>Automation Action Items</span>
            <span style={{ marginLeft:"auto" }}><SortByBtn /></span>
          </div>
          <div className="ws-scrollbody" style={{ border:"1px solid #F1E4E4", borderRadius:9, background:"#fff", overflow:"hidden auto", boxShadow:"0 1px 3px rgba(86,86,86,.06)", flex:"1 1 auto", minHeight:0 }}>
            <div style={{ display:"flex", alignItems:"center", borderBottom:"1px solid #F1E4E4", padding:"0 18px" }}>
              {[["attention","Needs Attention",attnN],["intervention","Needs Intervention",intvN]].map(([k, label, c]) => {
                const sel = aiTab === k;
                return (
                  <button key={k} type="button" onClick={() => setAiTab(k)} style={{ background:"transparent", border:"none", cursor:"pointer", padding:"14px 4px 12px", marginRight:28, display:"inline-flex", alignItems:"center", gap:8, font:`${sel?500:400} 15px/20px ${F}`, color: sel ? "#3A424A" : "#8A94A6", borderBottom:`2px solid ${sel ? "#CF1322" : "transparent"}`, marginBottom:-1 }}>
                    {label}<span style={{ background: sel ? "#CF1322" : "#FBDCDC", color: sel ? "#fff" : "#C48A8A", borderRadius:999, padding:"1px 8px", font:`500 12px/18px ${F}` }}>{p2(c)}</span>
                  </button>
                );
              })}
            </div>
            {(aiTab === "attention" ? attn : intv).length
              ? (aiTab === "attention" ? attn : intv).map((g, gi) => {
                  const gRows = [].concat(...g.items.map(x => x.rows));
                  const gKind = g.items[0].kind;
                  return (
                    <AutomationGroup key={g.g} title={g.title} sub={g.sub} count={p2(gRows.length)} defaultOpen={gi === 0} onNav={() => openQ(g.title + " — " + g.sub, gKind, gRows)}>
                      {g.items.map(x => <AutomationItem key={x.kind + x.reason} label={x.reason} count={p2(x.rows.length)} onClick={() => openQ(x.reason, x.kind, x.rows)} />)}
                    </AutomationGroup>
                  );
                })
              : <div style={{ padding:"18px", font:`400 14px/20px ${F}`, color:"#8A94A6" }}>{aiTab === "attention" ? "No open Needs Attention records" : "No open interventions"}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── wrappers around the v1 shell ────────────────────────────────────
const V2_TABS = new Set(["intakePt","docext","audit","cdm","claim","remits"]);
const V2_SUB = { claim:"Summary of Claim Status", cdm:"Summary of CDM Request Status", remits:"Denial Management and Cash Posting Summary", docext:"Summary of Document Extraction Status", audit:"Pre-Bill and Face-to-Face Audit Summary", intakePt:"Patient Intake and Pre-Eligibility Summary" };

const _TopNav = window.TopNav;
window.TopNav = function TopNavV2(p) {
  window.__v2GoSection = p.onSection;
  const close = () => window.__v2Detail && window.__v2Detail(null);
  return R.createElement(_TopNav, { ...p, onSection: (k) => { close(); p.onSection(k); }, onLogo: () => { close(); p.onLogo && p.onLogo(); } });
};

const _SectionBand = window.SectionBand;
window.SectionBand = function SectionBandV2(p) {
  useE(() => { const q = window.__v2PendingSub; if (q && q.title === p.title) { window.__v2PendingSub = null; if (p.activeSub !== q.sub && p.onSub) p.onSub(q.sub); } });
  return R.createElement(_SectionBand, p);
};

window.DashboardBand = function DashboardBandV2({ active, onTab, subtitle }) {
  const [eligOpen, setEligOpen] = useS(false);
  const eligRef = R.useRef(null);
  useE(() => { if (!eligOpen) return; const h = (e) => { if (eligRef.current && !eligRef.current.contains(e.target)) setEligOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [eligOpen]);
  const SUBV = (typeof ELIG_SUBVIEWS !== "undefined" && ELIG_SUBVIEWS) || [["elig","Eligibility"]];
  const eligSub = SUBV.find(x => x[0] === active);
  const go = (k) => { if ((V2_TABS.has(k) || V2_TABS.has(active)) && window.__v2SetDashTab) window.__v2SetDashTab(k); else onTab(k); };
  const tabs = [
    { key:"elig", label:"Eligibility", menu:true }, { key:"auth", label:"Authorization" }, { key:"referral", label:"E-Referral" },
    { key:"intakePt", label:"Intake" }, { key:"docext", label:"Doc Extraction" }, { key:"pcr", label:"PCR" }, { key:"audit", label:"Audit" },
    { key:"cdm", label:"CDM" }, { key:"claim", label:"Claims" }, { key:"remits", label:"Remits" }, { key:"assess", label:"Assessment" }, { key:"notif", label:"Notifications" },
  ];
  const tabBtn = (act) => ({ background:"transparent", border:"none", cursor:"pointer", color: act ? "#fff" : "rgba(255,255,255,.55)", padding:"8px 2px 12px", display:"inline-flex", alignItems:"center", gap:6, font:`${act?500:400} 16px/20px ${F}`, borderBottom:`2px solid ${act ? "#fff" : "transparent"}`, whiteSpace:"nowrap" });
  return (
    <div style={{ background:BAND, padding:"6px 32px 0", color:"#fff" }}>
      <div style={{ display:"flex", alignItems:"flex-end", flexWrap:"wrap", columnGap:26 }}>
        {tabs.map(t => {
          if (t.menu) { const act = !!eligSub; return (
            <div key={t.key} ref={eligRef} style={{ position:"relative" }}>
              <button type="button" onClick={() => setEligOpen(v => !v)} style={tabBtn(act)}>{eligSub && eligSub[0] !== "elig" ? "Eligibility · " + eligSub[1] : "Eligibility"}<span style={{ fontSize:11 }}>▾</span></button>
              {eligOpen && (
                <div style={{ position:"absolute", top:"100%", left:0, marginTop:2, background:"#fff", border:"1px solid #e2e8f0", borderRadius:8, boxShadow:"0 8px 24px rgba(15,23,42,.18)", padding:6, minWidth:180, zIndex:40 }}>
                  {SUBV.map(([k, l]) => (
                    <button key={k} type="button" onClick={() => { go(k); setEligOpen(false); }} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", background: k === active ? "#eff6ff" : "transparent", border:"none", borderRadius:6, padding:"8px 10px", cursor:"pointer", font:`${k === active ? 500 : 400} 13px/16px ${F}`, color: k === active ? "#1d4ed8" : "#333", textAlign:"left" }}>
                      {l}{k === active && <span style={{ fontSize:11 }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ); }
          return <button key={t.key} type="button" onClick={() => go(t.key)} style={tabBtn(active === t.key)}>{t.label}</button>;
        })}
      </div>
      <div style={{ display:"flex", alignItems:"center", padding:"12px 0 14px" }}>
        <span style={{ font:`400 14px/18px ${F}`, color:"rgba(255,255,255,.85)" }}>{V2_TABS.has(active) ? V2_SUB[active] : subtitle}</span>
      </div>
    </div>
  );
};

const _DashboardView = window.DashboardView;
window.DashboardView = function DashboardViewV2(props) {
  const [tab, setTab] = useS(() => ((!props.defaultTab || props.defaultTab === "elig") && window.__v2LastDash) || props.defaultTab || "elig");
  useE(() => { window.__v2SetDashTab = (k) => { window.__v2LastDash = V2_TABS.has(k) ? k : null; setTab(k); }; return () => { window.__v2SetDashTab = null; }; }, []);
  if (V2_TABS.has(tab)) return (
    <div style={{ background:"#fff" }} data-screen-label={`01 Dashboard · ${DASH_TITLE[tab]}`}>
      <window.DashboardBand active={tab} onTab={(k) => window.__v2SetDashTab(k)} />
      <V2DashShell kind={tab} />
    </div>
  );
  return R.createElement(_DashboardView, { ...props, key: "o-" + tab, defaultTab: tab });
};
})();
