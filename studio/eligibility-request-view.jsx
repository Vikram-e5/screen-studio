// Eligibility Request View — full-page list of eligibility requests.
// Reuses the dark-navy app shell rendered by Prototype.jsx; this file
// only renders the white content area: filter bar, title cluster +
// status summary, AT status strip, table, pagination.
const { useState: useERV, useEffect: useERVE, useRef: useERVR } = React;

// ── Date format helpers ──────────────────────────────────────
// <input type="date"> needs YYYY-MM-DD; display/storage uses MM/DD/YY
function toDateInput(s) {
  if (!s) return "";
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return "";
  const [,mo,d,y] = m;
  const year = y.length===2 ? (parseInt(y)<50?"20"+y:"19"+y) : y;
  return `${year}-${mo.padStart(2,"0")}-${d.padStart(2,"0")}`;
}
function fromDateInput(s) {
  if (!s) return "";
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return s;
  const [,y,mo,d] = m;
  return `${mo}/${d}/${y.slice(2)}`;
}

// Document (attachment) icon — blue page + pink paperclip, per Figma attachment_2891573.
function DocIcon({ size=18, faded=false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{display:"block",opacity: faded?0.35:1}} aria-hidden="true">
      <path d="M6 2.75h7.2L19 8.55V19.5a1.75 1.75 0 0 1-1.75 1.75H6A1.75 1.75 0 0 1 4.25 19.5v-15A1.75 1.75 0 0 1 6 2.75z" fill="#fff" stroke="#3F7EA1" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M13 2.9v5.1h5" fill="none" stroke="#3F7EA1" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14.4 11.6v5.2a2.85 2.85 0 0 1-5.7 0V10.2a1.75 1.75 0 0 1 3.5 0v6.1a.85.85 0 0 1-1.7 0v-4.7" fill="none" stroke="#BE6DA8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Mock data ─────────────────────────────────────────────────
const ERV_ROWS = [
  { id:"r1",  name:"Marvin Mckinney",   mrn:"B6100062245601", agency:"Agency 2", branch:"Bcode", memId:"11521357", payorSrc:"Aetna Medi…",     payor:"Aetna",          soc:"01/21/25", eligInit:"04/15/25", mode:"gear",   gw:"Availity", chk:"04/15/25", at:"thumb",     alerts:2, cov:"active",   docs:true,  action:"view",  followUp:""        },
  { id:"r2",  name:"Esther Howard",     mrn:"B6789012345678", agency:"Agency 1", branch:"Bcode", memId:"11521357", payorSrc:"Star + Plus",     payor:"Texas Medicaid", soc:"01/07/25", eligInit:"04/16/25", mode:"person", gw:"",         chk:"04/16/25", at:"none",      alerts:0, cov:"pending",  docs:false, action:"edit",  followUp:"07/09/26" },
  { id:"r3",  name:"Cameron William…",  mrn:"B6100054445634", agency:"Agency 1", branch:"Bcode", memId:"42512413", payorSrc:"HumanaCh…",       payor:"Humana",         soc:"01/05/25", eligInit:"04/19/25", mode:"gear",   gw:"Availity", chk:"04/19/25", at:"hourglass", alerts:0, cov:"active",   docs:false, action:"view",  followUp:""        },
  { id:"r4",  name:"Leslie Alexander",  mrn:"B6789012345697", agency:"Agency 1", branch:"Bcode", memId:"69420061", payorSrc:"Medicare -…",     payor:"Medicare",       soc:"12/30/25", eligInit:"04/22/25", mode:"gear",   gw:"Inovalon", chk:"04/22/25", at:"thumb",     alerts:2, cov:"active",   docs:true,  action:"view",  followUp:""        },
  { id:"r5",  name:"Robert Fox",        mrn:"V6789012345686", agency:"Agency 1", branch:"Bcode", memId:"97014890", payorSrc:"UHC Compl…",      payor:"UHC",            soc:"01/05/25", eligInit:"04/18/25", mode:"gear",   gw:"UHC",      chk:"04/18/25", at:"warning",   alerts:0, cov:"active",   docs:true,  action:"view",  followUp:""        },
  { id:"r6",  name:"Jenny Wilson",      mrn:"B6789012345711", agency:"Agency 1", branch:"Bcode", memId:"97014890", payorSrc:"Humana G…",       payor:"Humana",         soc:"01/04/25", eligInit:"04/24/25", mode:"gear",   gw:"Availity", chk:"04/24/25", at:"thumb",     alerts:0, cov:"inactive", docs:true,  action:"view",  followUp:""        },
  { id:"r7",  name:"Jacob Jones",       mrn:"B6789012345716", agency:"Agency 1", branch:"Bcode", memId:"55493027", payorSrc:"Aetna Gold…",     payor:"Aetna",          soc:"12/30/25", eligInit:"04/21/25", mode:"gear",   gw:"Waystar",  chk:"04/21/25", at:"warning",   alerts:0, cov:"mixed",    docs:false, action:"view",  followUp:""        },
  { id:"r8",  hasIntakeDetail:true, intakeDetail:{dob:"07/14/1949",reqEvalDate:"04/23/25",admitBenefitPeriod:1,numDischarges:1,f2fRequired:"No",eobType:"New"}, name:"Guy Hawkins",       mrn:"L700093345918",  agency:"Agency 1", branch:"Bcode", memId:"55493027", payorSrc:"UHC Compl…",      payor:"UHC",            soc:"12/30/25", eligInit:"04/23/25", mode:"gear",   gw:"UHC",      chk:"04/23/25", at:"thumb",     alerts:0, cov:"active",   docs:true,  action:"view",  followUp:""        },
  { id:"r9",  name:"Telo Hetry",        mrn:"J700093345753",  agency:"Agency 1", branch:"Bcode", memId:"16628235", payorSrc:"Aetna Gold…",     payor:"Aetna",          soc:"12/30/25", eligInit:"04/20/25", mode:"gear",   gw:"Waystar",  chk:"04/20/25", at:"thumb",     alerts:0, cov:"exception",docs:false, action:"view",  followUp:""        },
  { id:"r10", name:"Utar Ganthir",      mrn:"K700093345989",  agency:"Agency 1", branch:"Bcode", memId:"",         payorSrc:"Aetna Gold…",     payor:"Aetna",          soc:"01/01/25", eligInit:"04/17/25", mode:"gear",   gw:"Waystar",  chk:"04/17/25", at:"thumb",     alerts:0, cov:"active",   docs:false, action:"view",  followUp:""        },
  { id:"r11", hasIntakeDetail:true, intakeDetail:{dob:"09/02/1955",reqEvalDate:"04/25/25",admitBenefitPeriod:2,numDischarges:0,f2fRequired:"Yes",eobType:"Recert"}, name:"Kristin Watson",    mrn:"B6789012345801", agency:"Agency 1", branch:"Bcode", memId:"20481123", payorSrc:"HumanaCh…",       payor:"Humana",         soc:"01/05/25", eligInit:"04/25/25", mode:"gear",   gw:"Availity", chk:"04/25/25", at:"warning",   alerts:0, cov:"active",   docs:false, action:"view",  followUp:""        },
  { id:"r12", name:"Cody Fisher",       mrn:"B6789012345802", agency:"Agency 1", branch:"Bcode", memId:"20481124", payorSrc:"Medicare -…",     payor:"Medicare",       soc:"12/30/25", eligInit:"04/26/25", mode:"gear",   gw:"Inovalon", chk:"04/26/25", at:"thumb",     alerts:2, cov:"active",   docs:true,  action:"view",  followUp:""        },
  { id:"r13", name:"Kathryn Murphy",    mrn:"B6789012345803", agency:"Agency 1", branch:"Bcode", memId:"20481125", payorSrc:"UHC Compl…",      payor:"UHC",            soc:"01/05/25", eligInit:"04/27/25", mode:"gear",   gw:"UHC",      chk:"04/27/25", at:"warning",   alerts:0, cov:"inactive", docs:true,  action:"view",  followUp:""        },
  { id:"r14", name:"Devon Lane",        mrn:"B6789012345804", agency:"Agency 1", branch:"Bcode", memId:"20481126", payorSrc:"Humana G…",       payor:"Humana",         soc:"01/04/25", eligInit:"04/28/25", mode:"gear",   gw:"Availity", chk:"04/28/25", at:"thumb",     alerts:0, cov:"exception",docs:false, action:"view",  followUp:""        },
  { id:"r15", hasIntakeDetail:true, intakeDetail:{dob:"03/28/1962",reqEvalDate:"04/29/25",admitBenefitPeriod:1,numDischarges:1,f2fRequired:"No",eobType:"New"}, name:"Dianne Russell",    mrn:"B6789012345805", agency:"Agency 1", branch:"Bcode", memId:"20481127", payorSrc:"Aetna Gold…",     payor:"Aetna",          soc:"12/30/25", eligInit:"04/29/25", mode:"gear",   gw:"Waystar",  chk:"04/29/25", at:"hourglass", alerts:0, cov:"active",   docs:false, action:"view",  followUp:""        },
  { id:"r16", name:"Arlene McCoy",      mrn:"B6789012345806", agency:"Agency 2", branch:"Bcode", memId:"20481129", payorSrc:"Aetna Medi…",     payor:"Aetna",          soc:"01/21/25", eligInit:"04/30/25", mode:"gear",   gw:"Availity", chk:"04/30/25", at:"thumb",     alerts:2, cov:"active",   docs:true,  action:"view",  followUp:""        },
  { id:"r17", name:"Theresa Webb", mrn:"B6789012345901", agency:"Agency 1", branch:"Bcode", memId:"30512201", payorSrc:"Aetna Medi…", payor:"Aetna", soc:"01/15/25", eligInit:"04/02/25", mode:"gear", gw:"Availity", chk:"04/02/25", at:"thumb", alerts:1, alertList:["Policy with future activation date"], atReason:"", atGroup:"", cov:"active", docs:true, action:"view", followUp:"" },
  { id:"r18", name:"Darlene Robertson", mrn:"B6789012345902", agency:"Agency 1", branch:"Bcode", memId:"30512202", payorSrc:"UHC Compl…", payor:"UHC", soc:"01/15/25", eligInit:"04/03/25", mode:"gear", gw:"UHC", chk:"04/03/25", at:"thumb", alerts:2, alertList:["Patient does not have active coverage","Inactive coverage alert"], atReason:"", atGroup:"", cov:"inactive", docs:true, action:"view", followUp:"" },
  { id:"r19", name:"Courtney Henry", mrn:"B6789012345903", agency:"Agency 1", branch:"Bcode", memId:"30512203", payorSrc:"HumanaCh…", payor:"Humana", soc:"01/15/25", eligInit:"04/06/25", mode:"gear", gw:"Availity", chk:"04/06/25", at:"thumb", alerts:1, alertList:["Home Health benefits are not returned with eligibility"], atReason:"", atGroup:"", cov:"active", docs:true, action:"view", followUp:"" },
  { id:"r20", name:"Ralph Edwards", mrn:"B6789012345904", agency:"Agency 1", branch:"Bcode", memId:"30512204", payorSrc:"Aetna Gold…", payor:"Aetna", soc:"01/15/25", eligInit:"04/08/25", mode:"gear", gw:"Carelon", chk:"04/08/25", at:"thumb", alerts:1, alertList:["The address of the patient falls outside the branch location"], atReason:"", atGroup:"", cov:"active", docs:true, action:"view", followUp:"" },
  { id:"r21", name:"Annette Black", mrn:"B6789012345905", agency:"Agency 1", branch:"Bcode", memId:"30512205", payorSrc:"Medicare -…", payor:"Medicare", soc:"01/15/25", eligInit:"04/09/25", mode:"gear", gw:"Inovalon", chk:"04/09/25", at:"thumb", alerts:2, alertList:["The payer of the patient is no longer used in the system","Eligibility Retrival alert"], atReason:"", atGroup:"", cov:"inactive", docs:true, action:"view", followUp:"" },
  { id:"r22", name:"Jerome Bell", mrn:"B6789012345906", agency:"Agency 1", branch:"Bcode", memId:"30512206", payorSrc:"Aetna Gold…", payor:"Aetna", soc:"01/15/25", eligInit:"04/10/25", mode:"gear", gw:"Carelon", chk:"04/10/25", at:"warning", alerts:0, alertList:[], atReason:"Member ID Mismatch", atGroup:"terminated", cov:"exception", docs:true, action:"view", followUp:"" },
  { id:"r23", name:"Floyd Miles", mrn:"B6789012345907", agency:"Agency 1", branch:"Bcode", memId:"30512207", payorSrc:"Humana G…", payor:"Humana", soc:"01/15/25", eligInit:"04/11/25", mode:"gear", gw:"Availity", chk:"04/11/25", at:"warning", alerts:0, alertList:[], atReason:"Order Form For The CMS 485 Is Not Available", atGroup:"terminated", cov:"exception", docs:true, action:"view", followUp:"" },
  { id:"r24", name:"Ronald Richards", mrn:"B6789012345908", agency:"Agency 1", branch:"Bcode", memId:"30512208", payorSrc:"UHC Compl…", payor:"UHC", soc:"01/15/25", eligInit:"04/12/25", mode:"gear", gw:"UHC", chk:"04/12/25", at:"warning", alerts:0, alertList:[], atReason:"Patient Record Not Found In The Grid", atGroup:"terminated", cov:"mixed", docs:true, action:"view", followUp:"" },
  { id:"r25", name:"Bessie Cooper", mrn:"B6789012345909", agency:"Agency 1", branch:"Bcode", memId:"30512209", payorSrc:"Aetna Gold…", payor:"Aetna", soc:"01/15/25", eligInit:"04/13/25", mode:"gear", gw:"Carelon", chk:"04/13/25", at:"warning", alerts:0, alertList:[], atReason:"Invalid Billing Code Identified For The Patient", atGroup:"terminated", cov:"exception", docs:true, action:"view", followUp:"" },
  { id:"r26", name:"Savannah Nguyen", mrn:"B6789012345910", agency:"Agency 1", branch:"Bcode", memId:"30512210", payorSrc:"HumanaCh…", payor:"Humana", soc:"01/15/25", eligInit:"04/14/25", mode:"gear", gw:"Availity", chk:"04/14/25", at:"warning", alerts:0, alertList:[], atReason:"SOC Or SOE Field Has Blank Value", atGroup:"terminated", cov:"exception", docs:true, action:"view", followUp:"" },
  { id:"r27", name:"Darrell Steward", mrn:"B6789012345911", agency:"Agency 1", branch:"Bcode", memId:"30512211", payorSrc:"Medicare -…", payor:"Medicare", soc:"01/15/25", eligInit:"04/16/25", mode:"gear", gw:"Inovalon", chk:"04/16/25", at:"warning", alerts:0, alertList:[], atReason:"Failed Due To Technical Issues", atGroup:"failed", cov:"exception", docs:true, action:"view", followUp:"" },
  { id:"r28", name:"Bessie Bell", mrn:"B6789012345912", agency:"Agency 1", branch:"Bcode", memId:"30512212", payorSrc:"Aetna Gold…", payor:"Aetna", soc:"01/15/25", eligInit:"04/05/25", mode:"gear", gw:"Carelon", chk:"04/05/25", at:"thumb", alerts:0, alertList:[], atReason:"", atGroup:"", cov:"active", docs:true, action:"view", followUp:"" },
  { id:"r29", name:"Gloria Watts", mrn:"B6789012345913", agency:"Agency 1", branch:"Bcode", memId:"30512213", payorSrc:"UHC Compl…", payor:"UHC", soc:"01/15/25", eligInit:"04/07/25", mode:"gear", gw:"UHC", chk:"04/07/25", at:"hourglass", alerts:0, alertList:[], atReason:"", atGroup:"", cov:"active", docs:true, action:"view", followUp:"" },
  { id:"r30", name:"Frances Brown", mrn:"B6789012345914", agency:"Agency 1", branch:"Bcode", memId:"30512214", payorSrc:"Humana G…", payor:"Humana", soc:"01/15/25", eligInit:"04/17/25", mode:"gear", gw:"Availity", chk:"04/17/25", at:"thumb", alerts:0, alertList:[], atReason:"", atGroup:"", cov:"active", docs:true, action:"view", followUp:"" },
  { id:"r31", name:"Calvin Ford", mrn:"B6789012345915", agency:"Agency 1", branch:"Bcode", memId:"30512215", payorSrc:"Aetna Medi…", payor:"Aetna", soc:"01/15/25", eligInit:"04/18/25", mode:"gear", gw:"Availity", chk:"04/18/25", at:"thumb", alerts:0, alertList:[], atReason:"", atGroup:"", cov:"active", docs:true, action:"view", followUp:"" },
  { id:"r32", name:"Nathan Reed", mrn:"B6789012345916", agency:"Agency 1", branch:"Bcode", memId:"30512216", payorSrc:"Star + Plus", payor:"Texas Medicaid", soc:"01/15/25", eligInit:"04/19/25", mode:"gear", gw:"", chk:"04/19/25", at:"none", alerts:0, alertList:[], atReason:"", atGroup:"", cov:"pending", docs:true, action:"view", followUp:"" },
  { id:"r33", name:"Vivian Cole", mrn:"B6789012345917", agency:"Agency 1", branch:"Bcode", memId:"30512217", payorSrc:"UHC Compl…", payor:"UHC", soc:"01/15/25", eligInit:"04/20/25", mode:"gear", gw:"UHC", chk:"04/20/25", at:"thumb", alerts:0, alertList:[], atReason:"", atGroup:"", cov:"active", docs:true, action:"view", followUp:"" },
  { id:"r34", name:"Marcus Hill", mrn:"B6789012345918", agency:"Agency 1", branch:"Bcode", memId:"30512218", payorSrc:"HumanaCh…", payor:"Humana", soc:"01/15/25", eligInit:"04/22/25", mode:"gear", gw:"Availity", chk:"04/22/25", at:"thumb", alerts:0, alertList:[], atReason:"", atGroup:"", cov:"active", docs:true, action:"view", followUp:"" },
  { id:"r35", name:"Paula Simmons", mrn:"B6789012345919", agency:"Agency 1", branch:"Bcode", memId:"30512219", payorSrc:"Aetna Gold…", payor:"Aetna", soc:"01/15/25", eligInit:"04/24/25", mode:"gear", gw:"Carelon", chk:"04/24/25", at:"hourglass", alerts:0, alertList:[], atReason:"", atGroup:"", cov:"mixed", docs:true, action:"view", followUp:"" },
  { id:"r36", name:"Derek Long", mrn:"B6789012345920", agency:"Agency 1", branch:"Bcode", memId:"30512220", payorSrc:"Medicare -…", payor:"Medicare", soc:"01/15/25", eligInit:"04/26/25", mode:"gear", gw:"Inovalon", chk:"04/26/25", at:"thumb", alerts:0, alertList:[], atReason:"", atGroup:"", cov:"active", docs:true, action:"view", followUp:"" },
  { id:"r37", name:"Wanda Perez", mrn:"B6789012345921", agency:"Agency 1", branch:"Bcode", memId:"30512221", payorSrc:"Aetna Gold…", payor:"Aetna", soc:"01/15/25", eligInit:"04/03/25", mode:"gear", gw:"Availity", chk:"04/03/25", at:"thumb", alerts:1, alertList:["Policy with future activation date"], atReason:"", atGroup:"", cov:"active", docs:true, action:"view", followUp:"" },
  { id:"r38", name:"Roger Barnes", mrn:"B6789012345922", agency:"Agency 1", branch:"Bcode", memId:"30512222", payorSrc:"UHC Compl…", payor:"UHC", soc:"01/15/25", eligInit:"04/09/25", mode:"gear", gw:"UHC", chk:"04/09/25", at:"thumb", alerts:1, alertList:["Policy with future activation date"], atReason:"", atGroup:"", cov:"active", docs:true, action:"view", followUp:"" },
  { id:"r39", name:"Melissa Ward", mrn:"B6789012345923", agency:"Agency 1", branch:"Bcode", memId:"30512223", payorSrc:"HumanaCh…", payor:"Humana", soc:"01/15/25", eligInit:"04/11/25", mode:"gear", gw:"Availity", chk:"04/11/25", at:"thumb", alerts:1, alertList:["Home Health benefits are not returned with eligibility"], atReason:"", atGroup:"", cov:"active", docs:true, action:"view", followUp:"" },
];
if (typeof window !== "undefined") window.ERV_ROWS = ERV_ROWS;

// ── Needs-Attention reasons (eligibility) ─────────────────────
// Assign a stable reason to every Needs-Attention (warning) row that doesn't
// already carry one, so the Auth-style reason dropdown, the row filter, and the
// Eligibility Dashboard automation alerts (which read window.ERV_ROWS) all agree.
const ELIG_NA_TERM_LABELS = [
  "Patient record not available in the grid",
  "Review eligibility popup occurred",
  "Member ID mismatch",
  "SOC or SOE field has blank value",
  "Payor not configured in the system",
  "Coverage terminated at payor",
];
const ELIG_NA_FAIL_LABELS = [
  "Availity error message occurred preventing submission",
  "Unable to load the payor portal",
  "Session timed out during eligibility check",
];
const ELIG_NA_ALL = ELIG_NA_TERM_LABELS.map(l => [l, "terminated"]).concat(ELIG_NA_FAIL_LABELS.map(l => [l, "failed"]));
(function(){
  let i = 0;
  ERV_ROWS.forEach(r => {
    if (r.at === "warning") {
      if (!r.atReason) { const pair = ELIG_NA_ALL[i % ELIG_NA_ALL.length]; r.atReason = pair[0]; r.atGroup = pair[1]; }
      i++;
    }
  });
})();
// Tally eligibility Needs-Attention reasons from the warning rows present.
function computeEligNA(rows) {
  rows = rows || (typeof window !== "undefined" && window.ERV_ROWS) || ERV_ROWS;
  const failSet = new Set(ELIG_NA_FAIL_LABELS);
  const term = {}, fail = {};
  rows.forEach(r => {
    if (r.at !== "warning") return;
    const reason = r.atReason || "Unspecified reason";
    // Respect the row's own atGroup when present (rows carry real term/fail
    // classifications); fall back to the label set only when it's missing.
    const grp = r.atGroup || (failSet.has(reason) ? "failed" : "terminated");
    if (grp === "failed") fail[reason] = (fail[reason] || 0) + 1;
    else term[reason] = (term[reason] || 0) + 1;
  });
  const sorted = (m) => Object.entries(m).sort((a, b) => b[1] - a[1]);
  const termReasons = sorted(term), failReasons = sorted(fail);
  const sum = (l) => l.reduce((s, x) => s + x[1], 0);
  return { termReasons, failReasons, termTotal: sum(termReasons), failTotal: sum(failReasons) };
}
if (typeof window !== "undefined") window.computeEligNA = computeEligNA;

// ── Status summary chips ──────────────────────────────────────
const ERV_STATUS = [
  { id:"all",      label:"All Patients",       color:"#64748b", icon:null,     weight:1.0 },
  { id:"pending",  label:"Pending Submission", color:"#3f7ba8", icon:"person", weight:1.4 },
  { id:"active",   label:"Active",             color:"#16a34a", icon:null,     weight:0.6 },
  { id:"mixed",    label:"Mixed",              color:"#d97706", icon:null,     weight:0.5 },
  { id:"inactive", label:"Inactive",           color:"#dc2626", icon:null,     weight:0.7 },
  { id:"exception",label:"Exceptions",         color:"#f97316", icon:null,     weight:0.85 },
  { id:"alerts",   label:"Eligibility Alerts", color:"#dc2626", icon:null,     weight:1.4 },
];

// Compute live counts from rows so each chip + AT status counter
// reflects the actual dataset. When a filter is active, the chips show
// counts within the filtered subset (except All Patients which always
// shows the full total).
function filterRowsByStatus(rows, statusId) {
  if (!statusId || statusId === "all") return rows;
  if (statusId === "alerts") return rows.filter(r => r.alerts > 0);
  return rows.filter(r => r.cov === statusId);
}
function countsForRows(rows) {
  return {
    pending:    rows.filter(r => r.cov === "pending").length,
    active:     rows.filter(r => r.cov === "active").length,
    mixed:      rows.filter(r => r.cov === "mixed").length,
    inactive:   rows.filter(r => r.cov === "inactive").length,
    exception:  rows.filter(r => r.cov === "exception").length,
    alerts:     rows.filter(r => r.alerts > 0).length,
    completed:  rows.filter(r => r.at === "thumb").length,
    needsAttn:  rows.filter(r => r.at === "warning").length,
    inProgress: rows.filter(r => r.at === "hourglass").length,
  };
}
const pad2 = (n) => String(n).padStart(2, "0");
function getERVCounts(allRows, activeStatus) {
  const subset = filterRowsByStatus(allRows, activeStatus);
  const sub = countsForRows(subset);
  return {
    byChip: {
      all:        pad2(allRows.length),
      pending:    pad2(sub.pending),
      active:     pad2(sub.active),
      mixed:      pad2(sub.mixed),
      inactive:   pad2(sub.inactive),
      exception:  pad2(sub.exception),
      alerts:     pad2(sub.alerts),
    },
    at: {
      completed:  pad2(sub.completed),
      needsAttn:  pad2(sub.needsAttn),
      inProgress: pad2(sub.inProgress),
    },
  };
}

// ── Filter bar ────────────────────────────────────────────────
function ERVFilterChip({ label, onRemove }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:10,background:"#f4f6f9",border:"1px solid #d8dee6",borderRadius:6,padding:"6px 10px",font:"400 12px/16px Roboto",color:"#334155",whiteSpace:"nowrap",flexShrink:0}}>
      {label}
      <button
        type="button"
        onClick={onRemove}
        title="Remove filter"
        style={{display:"inline-flex",alignItems:"center",justifyContent:"center",border:"none",background:"transparent",color:"#64748b",fontSize:13,lineHeight:1,cursor:"pointer",padding:0}}
      >✕</button>
    </span>
  );
}

function ERVFilterBar({ chips = [], datePicker = null, filterFields = null, filterRows = [], fieldFilters = [], onFieldFilters, onClearFilters, searchValue = "", onSearch = null }) {
  const [open, setOpen] = useERV(false);
  const [dpOpen, setDpOpen] = useERV(false);
  const dref = React.useRef(null);
  React.useEffect(()=>{ if(!dpOpen) return; const h=(e)=>{ if(dref.current && !dref.current.contains(e.target)) setDpOpen(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); }, [dpOpen]);
  const DP = (typeof window !== "undefined") && window.DatePicker;
  const FP = (typeof window !== "undefined") && window.FilterPopover;
  const labelOf = (k)=> ((filterFields||[]).find(f=>f.key===k)||{}).label || k;
  const fieldTags = [];
  (fieldFilters||[]).forEach(f => f.values.forEach(v => fieldTags.push({
    id:`${f.field}:${v}`, label:`${labelOf(f.field)}: ${v}`,
    onRemove: () => onFieldFilters((fieldFilters.map(x=> x.field===f.field ? {...x, values:x.values.filter(y=>y!==v)} : x)).filter(x=>x.values.length))
  })));
  return (
    <div style={{background:"#eef4fb",borderBottom:"1px solid #e2e8f0",padding:"10px 24px",display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap"}}>
      <div style={{position:"relative",flexShrink:0}} ref={dref}>
        <button type="button" onClick={()=> datePicker && setDpOpen(v=>!v)} style={{background:"#fff",border:"1px solid #d8d8d8",borderRadius:4,padding:"5px 12px",font:"400 12px/16px Roboto",color:"#0f172a",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,flexShrink:0,whiteSpace:"nowrap"}}>
        {datePicker ? `${datePicker.label} : ${datePicker.value ? datePicker.value.start + " – " + datePicker.value.end : "All"}` : "Elig Initiated Date : 02/13/25 – 03/13/25"}
        <span style={{color:"#94a3b8",fontSize:9}}>▾</span>
      </button>
        {dpOpen && DP && datePicker && (
          <DP value={datePicker.value} available={datePicker.available} onChange={(d)=>{ datePicker.onChange(d); setDpOpen(false); }} />
        )}
      </div>
      <div style={{position:"relative",flexShrink:0}}>
        <button type="button" onClick={()=> filterFields && setOpen(v=>!v)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:6,padding:"5px 4px",whiteSpace:"nowrap"}}>
        <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:"#2563eb",color:"#fff",fontSize:10,fontWeight:600,lineHeight:1}}>+</span>
        Add More Filters
      </button>
        {open && FP && filterFields && (
          <FP fields={filterFields} rows={filterRows} initial={fieldFilters}
            onApply={(f)=>{ onFieldFilters(f); setOpen(false); }} onClose={()=>setOpen(false)} />
        )}
      </div>
      <div className="chip-scroll" style={{display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap",overflowX:"auto",flex:"1 1 auto",minWidth:0}}>
        {chips.map(c => (
          <ERVFilterChip key={c.id} label={c.label} onRemove={c.onRemove} />
        ))}
        {fieldTags.map(t => (
          <ERVFilterChip key={t.id} label={t.label} onRemove={t.onRemove} />
        ))}
      </div>
      {onClearFilters && (<button type="button" onClick={onClearFilters} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",padding:"5px 4px",flexShrink:0,whiteSpace:"nowrap"}}>Clear filters</button>)}
      <div style={{position:"relative",flexShrink:0}}>
        <img src={(window.__resources&&window.__resources.searchIcon)||"icons/search.svg"} alt="search" style={{width:14,height:14,objectFit:"contain",position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}} />
        <input type="text" value={searchValue} onChange={e=>onSearch&&onSearch(e.target.value)} placeholder="Search Patient Records" style={{width:240,background:"#fff",border:"1px solid #93c5e8",borderRadius:6,padding:"6px 12px 6px 32px",font:"400 12px/16px Roboto",color:"#0f172a",outline:"none"}} />
      </div>
    </div>
  );
}

// Field config for the "Add More Filters" popover (Eligibility Request View).
const ERV_FILTER_FIELDS = [
  { key:"agency",   label:"Agency" },
  { key:"branch",   label:"Branch" },
  { key:"payorSrc", label:"Payor Source" },
  { key:"payor",    label:"Payor Type" },
  { key:"gw",       label:"Gateway" },
];

// ── Title cluster (Eligibility Request View — All Elig Requests ▾) ─
const ERV_MODE_OPTIONS = [
  { id:"all",       label:"All Elig Requests" },
  { id:"manual",    label:"All Non-Automated Requests" },
  { id:"automated", label:"All Automated Requests" },
];

const ERV_VIEW_TABS = [
  { id:"pre",  label:"Pre" },
  { id:"post", label:"Post" },
];
function ERVViewTabs({ value="post", onChange }) {
  return (
    <div style={{display:"flex",alignItems:"center",marginTop:12}}>
      {ERV_VIEW_TABS.map((t,i)=>{
        const active = value===t.id;
        const first = i===0, last = i===ERV_VIEW_TABS.length-1;
        return (
          <button key={t.id} type="button" onClick={()=>onChange&&onChange(t.id)}
            style={{position:"relative",zIndex:active?2:1,background:"#fff",border:`1px solid ${active?"#2563eb":"#d8dee6"}`,marginLeft:first?0:-1,borderRadius:`${first?6:0}px ${last?6:0}px ${last?6:0}px ${first?6:0}px`,padding:"7px 28px",font:`${active?500:400} 14px/18px Roboto`,color:active?"#2563eb":"#0f172a",cursor:"pointer",whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// Header shown while the Pre tab is active — same title + tab row, pre-eligibility subtitle.
function ERVPreHeader({ viewTab, onViewTab }) {
  return (
    <div>
      <span style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Eligibility Request View</span>
      <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Status Summary of Pre-Eligibility Checks Submitted to Payors</div>
      <ERVViewTabs value={viewTab} onChange={onViewTab} />
    </div>
  );
}

function ERVTitleCluster({ activeStatus, onClearStatus, modeFilter, onModeFilter, viewTab, onViewTab, hchb }) {
  const [open, setOpen] = useERV(false);
  const ref = useERVR(null);
  useERVE(()=>{
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const activeMode = ERV_MODE_OPTIONS.find(o => o.id === modeFilter) || ERV_MODE_OPTIONS[0];
  // Clicking a status chip must NOT change the dropdown label (mirror Auth Request View).
  const headerLabel = activeMode.label;
  return (
    <div>
      <div style={{display:"flex",alignItems:"baseline",gap:6,flexWrap:"wrap",position:"relative"}} ref={ref}>
        <span style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>{hchb ? "Eligibility Request View" : "Eligibility Request View —"}</span>
        {!hchb && <button
          type="button"
          onClick={()=>setOpen(v=>!v)}
          style={{background:"transparent",border:"none",cursor:"pointer",font:"500 15px/20px Roboto",color:"#2563eb",display:"inline-flex",alignItems:"center",gap:4,padding:0}}
        >
          {headerLabel}
          <span style={{fontSize:20,transition:"transform .15s",transform:open?"rotate(180deg)":"rotate(0)",display:"inline-block",position:"relative",top:0}}>▾</span>
        </button>}
        {!hchb && open && (
          <div style={{
            position:"absolute",
            top:"100%",
            left:175,
            marginTop:6,
            background:"#fff",
            border:"1px solid #e2e8f0",
            borderRadius:8,
            boxShadow:"0 8px 24px rgba(15,23,42,0.12)",
            padding:6,
            minWidth:240,
            zIndex:20,
          }}>
            <div style={{font:"600 10px/14px Roboto",letterSpacing:"0.06em",textTransform:"uppercase",color:"#94a3b8",padding:"6px 10px 4px"}}>Filter by request mode</div>
            {ERV_MODE_OPTIONS.map(o => {
              const sel = o.id === modeFilter;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={()=>{ onModeFilter(o.id); setOpen(false); }}
                  style={{
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"space-between",
                    width:"100%",
                    background:sel?"#eff6ff":"transparent",
                    border:"none",
                    borderRadius:6,
                    padding:"7px 10px",
                    cursor:"pointer",
                    font:`${sel?500:400} 12px/16px Roboto`,
                    color:sel?"#1d4ed8":"#333333",
                    textAlign:"left",
                  }}
                >
                  <span>{o.label}</span>
                  {sel && <span style={{color:"#1d4ed8",fontSize:11}}>✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Status Summary of Eligibility Requests Submitted to Payors</div>
      {hchb
        ? <ERVViewTabs value={viewTab} onChange={onViewTab} />
        : <div style={{marginTop:10,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block"}}>Click Patient Name to view related transactions for specific eligibility verification request</div>}
    </div>
  );
}

// ── Eligibility Status summary strip (7 counters) ─────────────
function ERVStatusStrip({ counts, activeStatus, onPick, hchb }) {
  const byChip = counts.byChip;
  const chipDefs = hchb ? ERV_STATUS.filter(s => s.id !== "pending") : ERV_STATUS;
  return (
    <div style={{display:"inline-flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",overflow:"hidden",maxWidth:"100%"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333333",flexShrink:0,letterSpacing:"0.01em"}}>
        <span>Eligibility</span>
        <span>Status</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-start"}}>
        {chipDefs.map((s) => {
          const active = activeStatus === s.id;
          const dim = activeStatus && !active;
          return (
            <div
              key={s.id}
              role="button"
              onClick={()=>onPick(active ? null : s.id)}
              style={{
                flex:"0 0 auto",
                padding:"10px 12px 12px",
                cursor:"pointer",
                opacity: (dim && s.id !== "all") ? 0.35 : 1,
                transition:"opacity .12s, background .12s",
                background: active ? "#f8fafc" : "transparent",
                position:"relative",
                marginLeft: s.id==="alerts" ? 4 : 0,
                paddingLeft: s.id==="alerts" ? 16 : 12,
              }}
              onMouseEnter={(e)=>{ if(!active && !dim) e.currentTarget.style.background = "#fafbfc"; }}
              onMouseLeave={(e)=>{ if(!active) e.currentTarget.style.background = "transparent"; }}
            >
              {s.id==="alerts" && <span style={{position:"absolute",left:0,top:10,bottom:10,width:1,background:"#e2e8f0"}}></span>}
              <div style={{display:"inline-flex",flexDirection:"column",alignItems:"flex-start",width:"fit-content",maxWidth:"100%"}}>
                <div style={{height:3,borderRadius:2,background:s.color,opacity: active ? 1 : 0.85,marginBottom:8,width:"calc(100% + 5px)",minWidth:56}}></div>
                <div style={{display:"flex",alignItems:"center",gap:5,font:"400 12px/16px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#333333",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={s.label}>
                  {s.icon === "person" && <img src={(window.__resources&&window.__resources.mdiUser)||"icons/mdi-user.png"} alt="" style={{width:14,height:14,objectFit:"contain",flexShrink:0}} />}
                  <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{s.label}</span>
                </div>
                <div style={{font:"600 18px/22px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#0f172a",marginTop:4}}>{byChip[s.id]}</div>
              </div>
              {activeStatus && s.id === "all" && (
                <button
                  type="button"
                  onClick={(e)=>{ e.stopPropagation(); onPick(null); }}
                  style={{marginTop:4,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4,opacity:1}}
                >
                  <span style={{fontSize:11,lineHeight:1}}>↻</span>
                  Reset
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Automation (AT) Status strip ──────────────────────────────
const ERV_AT = [
  { id:"completed",  label:"Completed",       get icon(){ return (window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png"; },       key:"completed" },
  { id:"warning",    label:"Needs Attention", get icon(){ return (window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png"; }, key:"needsAttn", caret:true, num:"#d97706" },
  { id:"inprogress", label:"In Progress",     get icon(){ return (window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png"; },     key:"inProgress" },
];
function ERVAutomationStatus({ counts, atFilter, onFilter, statusActive, atReasonFilter, onApply, naFilteredCount }) {
  const at = counts.at;
  const [openMenu, setOpenMenu] = useERV(false);
  const rootRef = useERVR(null);
  useERVE(()=>{ if(!openMenu) return; const h=(e)=>{ if(rootRef.current && !rootRef.current.contains(e.target)) setOpenMenu(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[openMenu]);
  const NAMenu = (typeof window !== "undefined") && window.ARVNeedsAttentionMenu;
  const eligNa = (typeof window !== "undefined") && window.computeEligNA && window.computeEligNA();
  const reasonActive = atReasonFilter && atReasonFilter.length;
  return (
    <div ref={rootRef} style={{display:"flex",alignItems:"center",font:"400 13px/16px Roboto",color:"#333333"}}>
      <span style={{color:"#94a3b8",marginRight:12}}>Automation (AT) Status :</span>
      {ERV_AT.map((s,i)=>{
        const active = atFilter===s.id;
        const dim = atFilter && !active;
        return (
          <React.Fragment key={s.id}>
            {i>0 && <span style={{width:1,height:18,background:"#e2e8f0",margin:"0 12px"}}></span>}
            <button type="button" onClick={()=>onFilter(active?null:s.id)} title={`Filter: ${s.label}`}
              style={{background:"transparent",border:"none",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,padding:"2px 6px",borderRadius:4,opacity:dim?0.4:1,transition:"opacity .12s",position:"relative"}}>
              <img src={s.icon} alt="" style={{width:18,height:18,objectFit:"contain"}} />
              <span style={{color:"#0f172a",fontSize:14}}>{s.label}</span>
              {s.id==="warning" && reasonActive
                ? <span style={{display:"inline-flex",alignItems:"center",gap:7,background:"#FBF3DE",borderRadius:8,padding:"3px 12px"}}>
                    <img src={(window.__resources&&window.__resources.filterIcon)||"icons/filter.svg"} alt="" style={{width:16,height:16,objectFit:"contain"}} />
                    <span style={{fontWeight:600,color:"#5c5c5c",fontSize:15}}>{pad2(naFilteredCount||0)}</span>
                  </span>
                : <span style={{fontWeight:600,color:s.num||"#0f172a"}}>{at[s.key]}</span>}
              {s.caret && (
                <span style={{position:"relative",display:"inline-flex"}}>
                  <span title="Sub-status breakdown" onClick={(e)=>{ e.stopPropagation(); setOpenMenu(o=>!o); }}
                    style={{width:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#2563eb"}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 8 L19 8 L12 17 Z" fill="currentColor" /></svg>
                  </span>
                  {openMenu && NAMenu && <NAMenu disabled={!!statusActive} na={eligNa} selectedReasons={atReasonFilter} onApply={onApply} naCount={parseInt(at.needsAttn,10)||0} onClose={()=>setOpenMenu(false)} />}
                </span>
              )}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Coverage status pill ──────────────────────────────────────
const ERV_COV = {
  active:    { bg:"#f0fdf4", bd:"#16a34a", c:"#16a34a", label:"Active" },
  inactive:  { bg:"#fef2f2", bd:"#dc2626", c:"#dc2626", label:"Inactive" },
  pending:   { bg:"#eaf2f8", bd:"#b8d3e6", c:"#3f7ba8", label:"Pending Submission", icon:true, underline:true },
  mixed:     { bg:"#fffbeb", bd:"#d97706", c:"#d97706", label:"Mixed" },
  exception: { bg:"#fff7ed", bd:"#f97316", c:"#f97316", label:"Exception" },
};
function ERVCovPill({ kind, userIcon }) {
  const s = ERV_COV[kind] || ERV_COV.active;
  return (
    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,padding:"4px 12px",borderRadius:4,background:s.bg,border:`1px solid ${s.bd}`,color:s.c,font:"500 11px/16px Roboto",whiteSpace:"nowrap",minWidth:140,boxSizing:"border-box",textDecoration: s.underline ? "underline" : "none"}}>
      {(s.icon || userIcon) && <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0}}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
      {s.label}
    </span>
  );
}

// ── AT Status icon ────────────────────────────────────────────
function ERVATIcon({ kind }) {
  if (kind === "thumb")     return <img title="Completed"       src={(window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png"}       alt="Completed"      style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind === "warning")   return <img title="Needs Attention" src={(window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png"} alt="Needs Attention" style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind === "hourglass") return <img title="In Progress"     src={(window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png"}     alt="In Progress"    style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind === "person")    return <svg title="Pending" width="16" height="16" viewBox="0 0 24 24" fill="#3f7ba8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
  return <span style={{color:"#cbd5e1"}}>—</span>;
}

// ── Table ─────────────────────────────────────────────────────
// Columns use a CSS grid so they distribute across the available width
// (flexible columns expand, fixed-size status / icon columns stay tight).
const ERV_COLS = [
  { key:"name",     label:"Patient Name",grid:"minmax(118px, 1.3fr)",  sortable:true                  },
  { key:"mrn",      label:"MRN",         grid:"minmax(118px, 1.2fr)",  sortable:true                  },
  { key:"agency",   label:"Agency",      grid:"minmax(70px, 0.8fr)",   sortable:true                  },
  { key:"branch",   label:"Branch",      grid:"minmax(60px, 0.65fr)",  sortable:true                  },
  { key:"memId",    label:"Mem ID",      grid:"minmax(80px, 0.9fr)",   sortable:true                  },
  { key:"payorSrc", label:"Payor Src",   grid:"minmax(88px, 1.1fr)",  sortable:true                  },
  { key:"payor",    label:"Payor",       grid:"minmax(80px, 1fr)",     sortable:true                  },
  { key:"soc",      label:"SOC",         grid:"minmax(72px, 0.85fr)",  sortable:true                  },
  { key:"eligInit", label:"Elig Init Date",grid:"minmax(84px, 0.95fr)",   sortable:true                  },
  { key:"mode",     label:"Mode",        grid:"56px",                  sortable:false, align:"center", info:true },
  { key:"gw",       label:"GW",          grid:"minmax(72px, 0.85fr)",  sortable:true                  },
  { key:"chk",      label:"Elig Chk Dt", grid:"minmax(90px, 0.95fr)",  sortable:true                  },
  { key:"followUp", label:"Follow up Dt",grid:"minmax(100px, 1fr)",    sortable:true                  },
  { key:"at",       label:"AT Status",   grid:"72px",                  sortable:true,  align:"center" },
  { key:"alerts",   label:"Elig Alerts", grid:"80px",                  sortable:true,  align:"center" },
  { key:"cov",      label:"Cov. Status", grid:"minmax(140px, 1.3fr)",  sortable:true,  align:"center" },
  { key:"action",   label:"Action",      grid:"minmax(100px, 1fr)",    sortable:false, align:"center" },
  { key:"docs",     label:"Docs",        grid:"52px",                  sortable:false, align:"center" },
  { key:"reviewed", label:"Reviewed?",   grid:"78px",                  sortable:false, align:"center" },
  // HCHB-only fields
  { key:"txnType",   label:"Transaction Type", grid:"minmax(110px, 1.1fr)", sortable:true },
  { key:"stage",     label:"Stage",            grid:"minmax(140px, 1.4fr)", sortable:true },
  { key:"episodeId", label:"Episode ID",       grid:"minmax(100px, 1fr)",   sortable:true },
  { key:"serviceLine",label:"Service Line",    grid:"minmax(100px, 1fr)",   sortable:true },
  { key:"ehrSync",   label:"EHR Sync",         grid:"72px",                 sortable:false, align:"center" },
  // WellSky-only field
  { key:"hierarchy", label:"Payer Hierarchy",  grid:"minmax(104px, 1.05fr)",sortable:true },
];
const ERV_COL_MAP = ERV_COLS.reduce((a,c)=>{ a[c.key]=c; return a; }, {});
// HCHB carries more columns than fit, so its grid uses fixed widths inside a
// horizontal scroller with the last four columns frozen to the right edge.
const ERV_HCHB_W = { name:200, mrn:150, agency:100, branch:90, txnType:130, stage:180, memId:110, payorSrc:130, episodeId:110, serviceLine:120, gw:90, eligInit:110, followUp:110, at:80, ehrSync:80, alerts:90, cov:150, action:110, docs:60, reviewed:80 };
const ERV_FROZEN = ["alerts","cov","action","docs","reviewed"];
const ERV_FROZEN_LEFT = ["name"];
const ERV_GAP = 0;
const ervFrozenRight = (key) => {
  const i = ERV_FROZEN.indexOf(key);
  if (i < 0) return null;
  let off = 0;
  for (let k = ERV_FROZEN.length - 1; k > i; k--) off += (ERV_HCHB_W[ERV_FROZEN[k]] || 0) + ERV_GAP;
  return off;
};
const ervFrozenStyle = (key, hchb, bg) => {
  if (!hchb) return null;
  if (ERV_FROZEN_LEFT.indexOf(key) > -1) {
    return { position:"sticky", left:0, background:bg, zIndex:4, height:"100%", alignSelf:"stretch" };
  }
  const right = ervFrozenRight(key);
  if (right === null) return null;
  return { position:"sticky", right, background:bg, zIndex:3, height:"100%", alignSelf:"stretch", boxShadow: key===ERV_FROZEN[0] ? "-8px 0 8px -6px rgba(15,23,42,0.12)" : "none" };
};
const ervTotalWidth = (hchb) => hchb
  ? ERV_ORDER_HCHB.reduce((a,k)=>a + (ERV_HCHB_W[k]||0), 22)
  : 0;
// Column order per demo version — WellSky and HCHB carry different field sets.
const ERV_ORDER_WELLSKY = ["name","mrn","agency","branch","memId","payorSrc","mode","hierarchy","soc","chk","gw","eligInit","followUp","at","cov","action","docs","reviewed"];
const ERV_ORDER_HCHB    = ["name","mrn","agency","branch","txnType","stage","memId","payorSrc","episodeId","serviceLine","gw","eligInit","at","ehrSync","alerts","cov","action","docs","reviewed"];
// HCHB demo version drops the pending-submission flow and the Mode column.
const ervIsHCHB = () => typeof window !== "undefined" && window.__demoVersion === "hchb";
const ervVisibleCols = (hchb) => (hchb ? ERV_ORDER_HCHB : ERV_ORDER_WELLSKY).map(k => ERV_COL_MAP[k]).filter(Boolean);
const ervGridFor = (hchb) => hchb
  ? ervVisibleCols(true).map(c => (ERV_HCHB_W[c.key] || 100) + "px").join(" ")
  : ervVisibleCols(false).map(c => c.grid).join(" ");
const ERV_GRID = ERV_COLS.map(c => c.grid).join(" ");

function InfoCircle({ size=13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{display:"inline-block",verticalAlign:"middle",flex:"none",marginLeft:3}}>
      <path d="M7 0.875C3.61758 0.875 0.875 3.61758 0.875 7C0.875 10.3824 3.61758 13.125 7 13.125C10.3824 13.125 13.125 10.3824 13.125 7C13.125 3.61758 10.3824 0.875 7 0.875ZM7.4375 9.95312C7.4375 10.0133 7.38828 10.0625 7.32812 10.0625H6.67188C6.61172 10.0625 6.5625 10.0133 6.5625 9.95312V6.23438C6.5625 6.17422 6.61172 6.125 6.67188 6.125H7.32812C7.38828 6.125 7.4375 6.17422 7.4375 6.23438V9.95312ZM7 5.25C6.82827 5.24649 6.66476 5.17581 6.54455 5.05312C6.42434 4.93044 6.35701 4.76551 6.35701 4.59375C6.35701 4.42199 6.42434 4.25706 6.54455 4.13438C6.66476 4.01169 6.82827 3.94101 7 3.9375C7.17173 3.94101 7.33524 4.01169 7.45545 4.13438C7.57566 4.25706 7.64299 4.42199 7.64299 4.59375C7.64299 4.76551 7.57566 4.93044 7.45545 5.05312C7.33524 5.17581 7.17173 5.24649 7 5.25Z" fill="rgba(0,0,0,0.45)"/>
    </svg>
  );
}

function SortArrows({ active, dir }) {
  const up = active && dir==="asc" ? "#2563eb" : "rgba(0,0,0,0.25)";
  const down = active && dir==="desc" ? "#2563eb" : "rgba(0,0,0,0.25)";
  return (
    <svg width="10" height="15" viewBox="0 0 9 14" fill="none" style={{marginRight:3,flex:"none"}}>
      <path d="M7.74699 7.40234H1.25301C1.05823 7.40234 0.949473 7.608 1.0701 7.7484L4.31708 11.5135C4.41003 11.6213 4.58899 11.6213 4.68291 11.5135L7.9299 7.7484C8.05053 7.608 7.94177 7.40234 7.74699 7.40234Z" fill={down}/>
      <path d="M7.9299 6.24825L4.68291 2.48317C4.58997 2.3754 4.41101 2.3754 4.31708 2.48317L1.0701 6.24825C0.949473 6.38865 1.05823 6.59431 1.25301 6.59431H7.74699C7.94177 6.59431 8.05053 6.38865 7.9299 6.24825Z" fill={up}/>
    </svg>
  );
}

function ERVTableHeader({ sortKey, sortDir, onSort, hchb }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:ervGridFor(hchb),alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",gap:hchb?0:8}}>
      {ervVisibleCols(hchb).map(c => (
        <div
          key={c.key}
          style={{
            ...(hchb ? {padding:"0 8px"} : {}),
            ...(ervFrozenStyle(c.key, hchb, "#f8fafc") || {}),
            font:"500 11px/14px Roboto",
            color:"#64748b",
            textAlign: c.align || "left",
            display:"flex",
            alignItems:"center",
            justifyContent: c.align === "center" ? "center" : "flex-start",
            cursor: c.sortable ? "pointer" : "default",
            userSelect:"none",
            overflow:"hidden",
            whiteSpace:"nowrap",
          }}
          onClick={c.sortable ? ()=>onSort(c.key) : undefined}
        >
          {c.sortable && <SortArrows active={sortKey === c.key} dir={sortDir} />}
          {c.label}
          {c.info && <InfoCircle />}
        </div>
      ))}
    </div>
  );
}

function ERVTableRow({ row, onPatient, onManage, reviewed, onReviewed, onFollowUp, accent="#2563eb", expanded, onToggle, hchb, onViewBatch }) {
  const cellBase = (align) => ({
    font:"500 12px/16px Roboto",
    color:"#333333",
    textAlign: align || "left",
    display:"flex",
    alignItems:"center",
    justifyContent: align === "center" ? "center" : "flex-start",
    whiteSpace:"nowrap",
    overflow:"hidden",
    textOverflow:"ellipsis",
    minWidth:0,
  });
  const stop = (e) => e.stopPropagation();
  const dash = <span style={{color:"#cbd5e1"}}>—</span>;
  const cells = {
    name: (
      <div style={cellBase()}>
        {row.hasIntakeDetail ? (
          <span onClick={(ev)=>{ev.stopPropagation(); onToggle&&onToggle(row.id);}} title={expanded?"Collapse":"Expand"} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginRight:8,color:accent,transition:"transform .15s",transform: expanded?"rotate(90deg)":"rotate(0deg)",flexShrink:0}}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2 L11 7 L4 12 Z" fill="currentColor" /></svg>
          </span>
        ) : (
          <span style={{display:"inline-block",width:14,marginRight:8,flexShrink:0}}></span>
        )}
        {row.hasIntakeDetail
          ? <span style={{color:"#333333",font:"500 13px/16px Roboto",overflow:"hidden",textOverflow:"ellipsis"}}>{row.name}</span>
          : <a href="#" onClick={(ev)=>{ev.preventDefault(); ev.stopPropagation(); onPatient&&onPatient(row);}} style={{color:accent,font:"500 13px/16px Roboto",textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis"}}>{row.name}</a>}
      </div>
    ),
    mrn:      <div style={cellBase()}>{row.mrn}</div>,
    agency:   <div style={cellBase()}>{row.agency}</div>,
    branch:   <div style={cellBase()}>{row.branch}</div>,
    memId:    <div style={cellBase()}>{row.memId || dash}</div>,
    payorSrc: <div style={cellBase()} title={row.payorSrc}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{row.payorSrc}</span></div>,
    payor:    <div style={cellBase()} title={row.payor}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{row.payor}</span></div>,
    soc:      <div style={cellBase()}>{row.soc}</div>,
    eligInit: <div style={cellBase()}>{row.eligInit || dash}</div>,
    txnType:  <div style={cellBase()}>{row.txnType || dash}</div>,
    stage:    <div style={cellBase()} title={row.stage}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{row.stage || dash}</span></div>,
    episodeId:<div style={cellBase()}>{row.episodeId || dash}</div>,
    serviceLine: <div style={cellBase()}>{row.serviceLine || dash}</div>,
    hierarchy: <div style={cellBase()}>{row.hierarchy || dash}</div>,
    ehrSync: (
      <div style={cellBase("center")} title={row.ehrSync ? "Synced to EHR" : "Not synced"}>
        {row.ehrSync
          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 9 18 20 6"/></svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>}
      </div>
    ),
    mode: (
      <div style={cellBase("center")}>
        {row.mode === "gear"
          ? <img title="Automated" src={(window.__resources&&window.__resources.automated)||"icons/automated.png"} alt="Automated" style={{width:18,height:18,objectFit:"contain"}} />
          : row.mode === "person"
            ? <img title="Manual" src={(window.__resources&&window.__resources.mdiUser)||"icons/mdi-user.png"} alt="Manual" style={{width:16,height:16,objectFit:"contain"}} />
            : dash}
      </div>
    ),
    gw:  <div style={cellBase()}>{row.gw || dash}</div>,
    chk: <div style={cellBase()}>{row.chk}</div>,
    followUp: (
      <div style={cellBase()} onClick={stop}>
        <input
          type="text"
          value={row.followUp || ""}
          placeholder="—"
          onChange={(ev)=>onFollowUp&&onFollowUp(row.id, ev.target.value)}
          style={{width:"100%",border:"1px solid #e2e8f0",borderRadius:4,font:"400 11px/14px Roboto",padding:"3px 6px",color:"#0f172a",outline:"none",background:"#fff",minWidth:0}}
        />
      </div>
    ),
    at: <div style={cellBase("center")} title={row.at==="warning" ? (row.atReason||"Needs Attention") : undefined}><ERVATIcon kind={row.at} /></div>,
    alerts: (
      <div style={cellBase("center")}>
        {row.alerts > 0
          ? <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:22,height:22,borderRadius:"50%",background:(window.__eligAlertReviewedRows && window.__eligAlertReviewedRows.has(row.id) ? "#9ca3af" : "#f97316"),color:"#fff",font:"600 11px/22px Roboto"}}>{String(row.alerts).padStart(2,"0")}</span>
          : dash}
      </div>
    ),
    cov: (
      <div style={cellBase("center")}>
        {row.cov === "pending" && onManage
          ? <span onClick={()=>onManage(row)} style={{cursor:"pointer"}} title="Manage Eligibility Request"><ERVCovPill kind={row.cov} userIcon={row.mode!=="gear"} /></span>
          : <ERVCovPill kind={row.cov} userIcon={row.mode!=="gear"} />}
      </div>
    ),
    action: (
      <div style={cellBase("center")} onClick={stop}>
        {onViewBatch
          ? <a href="#" onClick={(ev)=>{ev.preventDefault(); onViewBatch();}} style={{color:accent,font:"500 12px/16px Roboto",textDecoration:"none",whiteSpace:"nowrap"}}>View Batch Info</a>
          : row.action === "edit"
          ? <button type="button" onClick={()=>onManage ? onManage(row) : onPatient&&onPatient(row)} style={{background:accent,color:"#fff",border:"none",borderRadius:4,padding:"4px 10px",font:"500 11px/14px Roboto",cursor:"pointer"}}>Edit Details</button>
            : <a href="#" onClick={(ev)=>{ev.preventDefault(); onPatient&&onPatient(row);}} style={{color:accent,font:"500 12px/16px Roboto",textDecoration:"none"}}>View Details</a>}
      </div>
    ),
    docs: <div style={cellBase("center")}>{row.docs ? <DocIcon size={18} /> : <DocIcon size={18} faded={true} />}</div>,
    reviewed: (
      <div style={cellBase("center")} onClick={stop}>
        <span
          role="checkbox"
          aria-checked={!!reviewed}
          tabIndex={0}
          onClick={()=>onReviewed&&onReviewed(row.id)}
          style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:`1px solid ${reviewed ? accent : "#d8d8d8"}`,borderRadius:3,background: reviewed ? accent : "#fff",cursor:"pointer"}}
        >
          {reviewed && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}
        </span>
      </div>
    ),
  };
  return (
    <div
      className="erv-row"
      style={{
        display:"grid",
        gridTemplateColumns:ervGridFor(hchb),
        alignItems:"center",
        height:48,
        padding:"0 11px",
        border:"1px solid #e2e8f0",
        borderRadius: expanded ? "6px 6px 0 0" : 6,
        marginBottom: expanded ? 0 : 8,
        boxShadow: expanded ? "none" : "0 1px 2px rgba(15,23,42,0.03)",
        background:"#fff",
        transition:"box-shadow .12s",
        gap: hchb ? 0 : 8,
      }}
    >
      {ervVisibleCols(hchb).map(c => {
        const el = cells[c.key] || <div style={cellBase(c.align)}>{dash}</div>;
        const fz = ervFrozenStyle(c.key, hchb, "#fff");
        const extra = { ...(hchb ? {padding:"0 8px"} : {}), ...(fz || {}) };
        return <React.Fragment key={c.key}>{Object.keys(extra).length ? React.cloneElement(el, { style: { ...(el.props.style||{}), ...extra } }) : el}</React.Fragment>;
      })}
    </div>
  );
}

// ── Previous Eligibility Checks (accordion child table) ───────────
// Full-width panel rendered directly below the expanded parent row. It has
// its OWN column set (payor coverage history), matching the Figma design —
// not the parent grid.
const ERV_CHILD_GRID =
  "minmax(220px,2.5fr) minmax(78px,0.9fr) minmax(104px,1.15fr) minmax(72px,0.85fr) " +
  "minmax(66px,0.75fr) minmax(66px,0.75fr) minmax(80px,0.9fr) minmax(84px,0.9fr) " +
  "minmax(80px,0.9fr) 66px 58px minmax(112px,1.2fr) minmax(92px,1fr) 46px";
const ERV_CHILD_COLS = [
  { label:"Payor Source",  tint:false                 },
  { label:"Mem ID",        tint:false                 },
  { label:"Ref ID",        tint:false                 },
  { label:"Payor",         tint:true                  },
  { label:"Pyr Hrchy",     tint:true                  },
  { label:"Gateway",       tint:true                  },
  { label:"Plan St Date",  tint:true                  },
  { label:"Plan End Date", tint:true                  },
  { label:"Elig Chck Dt",  tint:true                  },
  { label:"AT Status",     tint:true, align:"center"  },
  { label:"Alerts",        tint:true, align:"center"  },
  { label:"Cov. Status",   tint:true                  },
  { label:"Action",        tint:true, align:"center"  },
  { label:"Docs",          tint:true, align:"center"  },
];

function ervPrevChecks(row) {
  return [
    { payorSource:"Aetna Medicare Gold Advantage (PPO) for…", memId:"51476735", refId:"REFE00320466..",  payor:"UHC",        pyr:"Primary", gw:"UHC", planSt:"04/30/25", planEnd:"04/21/26", chk:"01/21/25", at:"thumb", alerts:2, cov:"active"  },
    { payorSource:"Star + Plus Health Plan",                  memId:"5363f747", refId:"REFE00657975..",  payor:"Texas Med..",pyr:"Primary", gw:"-",   planSt:"04/21/25", planEnd:"04/21/25", chk:"-",        at:"none",  alerts:0, cov:"pending" },
    { payorSource:"AARP Anthem Medicare Advantage",           memId:"34235346", refId:"REFE003546757..", payor:"Anthem",     pyr:"Primary", gw:"UHC", planSt:"04/21/22", planEnd:"04/21/25", chk:"12/08/23", at:"thumb", alerts:0, cov:"active"  },
  ];
}

// Coverage status shown as a colored dot + label (child-table treatment).
function ERVChildCov({ kind }) {
  if (kind === "pending") {
    return (
      <span style={{display:"inline-flex",alignItems:"center",gap:5,color:"#3f7ba8",font:"400 12px/16px Roboto",whiteSpace:"nowrap"}}>
        <img src={(window.__resources&&window.__resources.mdiUser)||"icons/mdi-user.png"} alt="" style={{width:13,height:13,objectFit:"contain"}} />
        Pending Submission
      </span>
    );
  }
  const map = {
    active:    { c:"#16a34a", label:"Active"    },
    inactive:  { c:"#dc2626", label:"Inactive"  },
    mixed:     { c:"#d97706", label:"Mixed"     },
    exception: { c:"#f97316", label:"Exception" },
  };
  const s = map[kind] || map.active;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:6,color:s.c,font:"400 12px/16px Roboto",whiteSpace:"nowrap"}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:s.c,flexShrink:0}}></span>
      {s.label}
    </span>
  );
}

function ERVChildHeader() {
  return (
    <div style={{display:"grid",gridTemplateColumns:ERV_CHILD_GRID,alignItems:"stretch",borderBottom:"1px solid #e5e7eb"}}>
      {ERV_CHILD_COLS.map((c, i) => (
        <div
          key={i}
          style={{
            font:"500 12px/16px Roboto",
            color:"#333333",
            display:"flex",
            alignItems:"center",
            justifyContent: c.align === "center" ? "center" : "flex-start",
            height:44,
            padding: i === 0 ? "0 8px 0 24px" : "0 8px",
            background: c.tint ? "#edecf7" : "#fff",
            whiteSpace:"nowrap",
            overflow:"hidden",
            textOverflow:"ellipsis",
          }}
        >
          {c.label}
        </div>
      ))}
    </div>
  );
}

function ERVChildRow({ check, onPatient, row, last }) {
  const cell = (align, first) => ({
    font:"500 12px/16px Roboto",
    color:"#334155",
    display:"flex",
    alignItems:"center",
    justifyContent: align === "center" ? "center" : "flex-start",
    height:56,
    padding: first ? "0 8px 0 24px" : "0 8px",
    whiteSpace:"nowrap",
    overflow:"hidden",
    textOverflow:"ellipsis",
    minWidth:0,
  });
  const dash = <span style={{color:"#cbd5e1"}}>-</span>;
  return (
    <div style={{display:"grid",gridTemplateColumns:ERV_CHILD_GRID,alignItems:"center",background:"#fff",borderBottom: last ? "none" : "1px solid #eef2f7"}}>
      <div style={cell("left",true)} title={check.payorSource}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{check.payorSource}</span></div>
      <div style={cell()}>{check.memId}</div>
      <div style={cell()}>{check.refId}</div>
      <div style={cell()}>{check.payor}</div>
      <div style={cell()}>{check.pyr}</div>
      <div style={cell()}>{check.gw === "-" ? dash : check.gw}</div>
      <div style={cell()}>{check.planSt}</div>
      <div style={cell()}>{check.planEnd}</div>
      <div style={cell()}>{check.chk === "-" ? dash : check.chk}</div>
      <div style={cell("center")}>{check.at === "none" ? dash : <ERVATIcon kind={check.at} />}</div>
      <div style={cell("center")}>
        {check.alerts > 0
          ? <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:22,height:22,borderRadius:"50%",background:(window.__eligAlertReviewedRows && window.__eligAlertReviewedRows.has(check.id) ? "#9ca3af" : "#f97316"),color:"#fff",font:"600 11px/22px Roboto"}}>{String(check.alerts).padStart(2,"0")}</span>
          : dash}
      </div>
      <div style={cell()}><ERVChildCov kind={check.cov} /></div>
      <div style={cell("center")}>
        <a href="#" onClick={(e)=>{e.preventDefault(); onPatient&&onPatient(row);}} style={{color:"#2563eb",font:"500 12px/16px Roboto",textDecoration:"none"}}>View Details</a>
      </div>
      <div style={cell("center")}><DocIcon size={18} /></div>
    </div>
  );
}

function ERVChildSection({ row, onPatient }) {
  if (row.hasIntakeDetail) return <ERVIntakeDetailSection row={row} />;
  const checks = ervPrevChecks(row);
  return (
    <div style={{background:"#f4f5f7",border:"1px solid #e2e8f0",borderTop:"none",borderRadius:"0 0 6px 6px",padding:"18px 20px 20px",marginBottom:8}}>
      <div style={{font:"600 15px/20px Roboto",color:"#0f172a",marginBottom:12}}>Previous Eligibility Checks</div>
      <div style={{border:"1px solid #e5e7eb",borderRadius:8,overflow:"hidden",background:"#fff"}}>
        <ERVChildHeader />
        {checks.map((c, i) => (
          <ERVChildRow key={i} check={c} row={row} onPatient={onPatient} last={i === checks.length - 1} />
        ))}
        <div style={{padding:"12px 24px",background:"#fff"}}>
          <a href="#" onClick={(e)=>e.preventDefault()} style={{color:"#2563eb",font:"500 13px/16px Roboto",textDecoration:"none"}}>+ 2 more</a>
        </div>
      </div>
    </div>
  );
}

// ── Intake Eligibility Details (accordion child for flagged rows) ─────
const ERV_INTAKE_COLS = ["DOB","Requested Date of Evaluation","Admit Benefit Period","Number of Discharges","F2F Required","EOB Type"];
function ERVIntakeDetailSection({ row }) {
  const d = row.intakeDetail || {};
  return (
    <div style={{background:"#f4f5f7",border:"1px solid #e2e8f0",borderTop:"none",borderRadius:"0 0 6px 6px",padding:"18px 20px 20px",marginBottom:8}}>
      <div style={{font:"600 15px/20px Roboto",color:"#0f172a",marginBottom:12}}>Intake Eligibility Details — {row.name}</div>
      <div style={{border:"1px solid #e5e7eb",borderRadius:8,overflow:"hidden",background:"#fff"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",background:"#edecf7",borderBottom:"1px solid #e5e7eb"}}>
          {ERV_INTAKE_COLS.map(c=>(
            <div key={c} style={{font:"500 11px/14px Roboto",color:"#333333",textTransform:"uppercase",letterSpacing:"0.03em",padding:"12px 16px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c}</div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)"}}>
          <div style={{padding:"14px 16px",font:"500 13px/18px Roboto",color:"#2563eb"}}>{d.dob||"—"}</div>
          <div style={{padding:"14px 16px",font:"500 13px/18px Roboto",color:"#334155"}}>{d.reqEvalDate||"—"}</div>
          <div style={{padding:"14px 16px",font:"500 13px/18px Roboto",color:"#334155"}}>{d.admitBenefitPeriod ?? "—"}</div>
          <div style={{padding:"14px 16px",font:"500 13px/18px Roboto",color:"#334155"}}>{d.numDischarges ?? "—"}</div>
          <div style={{padding:"14px 16px",font:"500 13px/18px Roboto",color:"#334155"}}>{d.f2fRequired||"—"}</div>
          <div style={{padding:"14px 16px",font:"500 13px/18px Roboto",color:"#334155"}}>{d.eobType||"—"}</div>
        </div>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────
function ERVPagination({ total, page, perPage, onPage }) {
  return null;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  const Btn = ({ children, active, disabled, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width:28,
        height:28,
        borderRadius:4,
        border: `1px solid ${active ? "#2563eb" : "#e2e8f0"}`,
        background: active ? "#2563eb" : "#fff",
        color: active ? "#fff" : disabled ? "#cbd5e1" : "#333333",
        font:"400 12px/16px Roboto",
        cursor: disabled ? "default" : "pointer",
        padding:0,
      }}
    >{children}</button>
  );
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #e2e8f0",padding:"12px 24px"}}>
      <span style={{font:"400 12px/16px Roboto",color:"#94a3b8"}}>Showing {start}–{end} of {total}</span>
      <div style={{display:"flex",gap:6}}>
        <Btn onClick={()=>onPage(page - 1)} disabled={page === 1}>‹</Btn>
        {Array.from({length: Math.min(pages, 5)}, (_, i) => i + 1).map(n => (
          <Btn key={n} active={n === page} onClick={()=>onPage(n)}>{n}</Btn>
        ))}
        <Btn onClick={()=>onPage(page + 1)} disabled={page === pages}>›</Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Manage Eligibility Request  — redesigned overlay
// ───────────────────────────────────────────────────────────────
// Full-screen right slide-out. Sections: Eligibility Alerts (accordion),
// Plan info strip, Patient Details, Subscriber Info, Plan Benefits,
// Service Benefits, Additional Coverage, PCP Information.
// eligibility response (plan effective dates, member verification,
// covered benefits) plus notes + documents, then Save.
// ── AccordionSection shared helper ───────────────────────────
function EEAccordion({ open, onToggle, title, sub, editIcon, children, bodyPadding }) {
  return (
    <div style={{border:"1px solid rgb(226,226,226)",borderRadius:8,marginBottom:8,overflow:"hidden",boxShadow:"0px 9px 28px 0px rgba(0,0,0,0.03), 0px 3px 6px 0px rgba(0,0,0,0.01), 0px 6px 16px 0px rgba(0,0,0,0.03)"}}>
      <div onClick={onToggle} style={{display:"flex",alignItems:"center",gap:8,padding:"0 16px",height:48,cursor:"pointer",background:"#fff",userSelect:"none"}}>
        {editIcon && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="rgb(22,119,255)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="rgb(22,119,255)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {!editIcon && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{transform:open?"rotate(90deg)":"rotate(0deg)",transition:"transform .15s",flexShrink:0}}>
            <path d="M9 6l6 6-6 6" stroke="rgba(0,0,0,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        <span style={{fontFamily:"Roboto,sans-serif",fontWeight:500,fontSize:12,lineHeight:"17.143px",color:"rgba(0,0,0,0.88)"}}>{title}</span>
        {sub && <span style={{fontFamily:"Roboto,sans-serif",fontWeight:400,fontSize:12,color:"rgba(0,0,0,0.45)"}}>- {sub}</span>}
        {editIcon && (
          <span style={{marginLeft:"auto",color:"rgba(0,0,0,0.25)"}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d={open?"M18 15l-6-6-6 6":"M6 9l6 6 6-6"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        )}
      </div>
      {open && <div style={{borderTop:"1px solid rgb(217,217,217)",padding:bodyPadding||"21px 16px 21px 45px"}}>{children}</div>}
    </div>
  );
}

// ── Plan benefits deductible table (reused in Plan + Service Benefits) ─
function EEBenTable({ rows }) {
  const hdSt = {padding:"7px 10px",font:"500 11px/14px Roboto",color:"#64748b",textAlign:"center",border:"1px solid #e2e8f0",background:"#F8FAFC",whiteSpace:"nowrap"};
  const cellSt = {padding:"8px 10px",border:"1px solid #e2e8f0",textAlign:"center",font:"400 13px/18px Roboto"};
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",font:"400 13px/18px Roboto"}}>
        <thead>
          <tr>
            <th style={{...hdSt,textAlign:"left"}} rowSpan={2}>Coverage</th>
            {["Individual, In-Network","Family, In-Network","Individual, Out of Network","Family, Out of Network"].map(h=>(
              <th key={h} style={hdSt} colSpan={2}>{h}</th>
            ))}
          </tr>
          <tr>
            {[0,1,2,3].map(i=>(
              <React.Fragment key={i}>
                <th style={{...hdSt,background:"#FAFBFC",font:"400 11px Roboto",color:"#94a3b8"}}>Total</th>
                <th style={{...hdSt,background:"#FAFBFC",font:"400 11px Roboto",color:"#94a3b8"}}>Remaining</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label,iT,iR,fT,fR])=>(
            <tr key={label}>
              <td style={{...cellSt,textAlign:"left",font:"500 13px Roboto",color:"#334155"}}>{label}</td>
              {[iT,iR,fT,fR].map((v,i)=><td key={i} style={cellSt}>{v||"-"}</td>)}
              <td style={{...cellSt,color:"#94a3b8"}}>-</td><td style={{...cellSt,color:"#94a3b8"}}>-</td>
              <td style={{...cellSt,color:"#94a3b8"}}>-</td><td style={{...cellSt,color:"#94a3b8"}}>-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EligEntryDrawer({ row, patient, onClose, onSave, initialEntry, onNoteAdded }) {
  const r = row || {};
  const p = patient || {};

  // Tabs
  const [tab, setTab] = useERV("elig");

  // Sub-header
  const [eligSource, setEligSource] = useERV("");
  const [checkedBy, setCheckedBy]   = useERV("");

  // Eligibility Alerts
  const [alertsOpen, setAlertsOpen] = useERV(false);
  const [docsOpen, setDocsOpen] = useERV(false);
  const [docsTab, setDocsTab] = useERV("Request Docs");
  const [alertLines, setAlertLines] = useERV([]);
  const addAlert   = ()      => setAlertLines(l=>[...l,{type:"",desc:""}]);
  const setAlert   = (i,k,v) => setAlertLines(l=>l.map((x,j)=>j===i?{...x,[k]:v}:x));
  const rmAlert    = (i)     => setAlertLines(l=>l.filter((_,j)=>j!==i));

  // Plan strip
  const [planName,    setPlanName]    = useERV("");
  const [covStatus,   setCovStatus]   = useERV(r.cov==="pending" ? "Pending Submission" : "");
  const [covRangeStart, setCovRangeStart] = useERV("");
  const [covRangeEnd,   setCovRangeEnd]   = useERV("");
  const [payorId,     setPayorId]     = useERV("");
  const [planType,    setPlanType]    = useERV("");
  const [groupNo,     setGroupNo]     = useERV("");
  const [provStatus,  setProvStatus]  = useERV("");

  // Accordion open states
  const [patOpen,     setPatOpen]     = useERV(false);
  const [subOpen,     setSubOpen]     = useERV(false);
  const [planBenOpen, setPlanBenOpen] = useERV(false);
  const [svcBenOpen,  setSvcBenOpen]  = useERV(false);
  const [addlCovOpen, setAddlCovOpen] = useERV(false);
  const [pcpOpen,     setPcpOpen]     = useERV(false);

  // Patient Details
  const [patNameEdit, setPatNameEdit] = useERV(r.name || p.name || "");
  const [patGender, setPatGender] = useERV("");
  const [patMemId,  setPatMemId]  = useERV(r.memId || "");
  const [patMbi,    setPatMbi]    = useERV("");
  const [patDob,    setPatDob]    = useERV(p.dob || "");
  const [patAddr,   setPatAddr]   = useERV("");
  const [patReln,   setPatReln]   = useERV("");

  // Subscriber Info
  const [sameAsPat, setSameAsPat] = useERV(true);
  const [subName,   setSubName]   = useERV("");
  const [subGender, setSubGender] = useERV("");
  const [subMemId,  setSubMemId]  = useERV(r.memId || "");
  const [subMbi,    setSubMbi]    = useERV("");
  const [subDob,    setSubDob]    = useERV("");
  const [subAddr,   setSubAddr]   = useERV("");

  // Service Benefits editable deductible table state
  const [svcBen, setSvcBen] = useERV({
    "Total Deductibles": {indInT:"",indInR:"",famInT:"",famInR:"",indOutT:"",indOutR:"",famOutT:"",famOutR:""},
    "Out of Pocket":     {indInT:"",indInR:"",famInT:"",famInR:"",indOutT:"",indOutR:"",famOutT:"",famOutR:""},
  });
  const setSBVal = (row, key, val) => setSvcBen(s=>({...s,[row]:{...s[row],[key]:val}}));

  // Plan Benefits editable table state
  const [planBen, setPlanBen] = useERV({
    "Total Deductibles": {indInT:"",indInR:"",famInT:"",famInR:"",indOutT:"",indOutR:"",famOutT:"",famOutR:""},
    "Out of Pocket":     {indInT:"",indInR:"",famInT:"",famInR:"",indOutT:"",indOutR:"",famOutT:"",famOutR:""},
  });
  const setPBVal = (row, key, val) => setPlanBen(s=>({...s,[row]:{...s[row],[key]:val}}));

  // Service Benefits
  const [svcTab,    setSvcTab]    = useERV("hh");
  const [authIn,    setAuthIn]    = useERV("");
  const [authOut,   setAuthOut]   = useERV("");
  const [copayIn,   setCopayIn]   = useERV("");
  const [copayOut,  setCopayOut]  = useERV("");
  const [coinsIn,   setCoinsIn]   = useERV("");
  const [coinsOut,  setCoinsOut]  = useERV("");
  const [visitIn,   setVisitIn]   = useERV("");
  const [visitOut,  setVisitOut]  = useERV("");

  // Additional Coverage
  const [addlCov, setAddlCov] = useERV([{planName:"",payorId:"",memberId:"",covStart:"",covEnd:""}]);
  const setAC = (i,k,v) => setAddlCov(l=>l.map((x,j)=>j===i?{...x,[k]:v}:x));

  // PCP Information
  const newPcp = () => ({firstName:"",middleName:"",lastName:"",phone:"",pcpGroup1:"",pcpGroup2:"",addr1:"",addr2:"",city:"",state:"",zip:""});
  const [pcpLines, setPcpLines] = useERV([newPcp()]);
  const setPcp = (i,k,v) => setPcpLines(l=>l.map((x,j)=>j===i?{...x,[k]:v}:x));

  // Notes
  const [notes, setNotes] = useERV(initialEntry && Array.isArray(initialEntry.notes) ? initialEntry.notes : (window.__eligNotes && window.__eligNotes[row && row.id] || []));
  const persistNotes = (n) => { if(row && row.id){ window.__eligNotes = window.__eligNotes||{}; window.__eligNotes[row.id]=n; } setNotes(n); };
  const [addingNote, setAdding]   = useERV(false);
  const [noteDraft,  setDraft]    = useERV("");
  const [noteFollow, setFollow]   = useERV("");
  const startNote = () => { setDraft(""); setFollow(""); setAdding(true); };
  const saveNote  = () => {
    if (!noteDraft.trim()) { setAdding(false); return; }
    const d = new Date();
    const ts = d.toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"2-digit"})+" "+d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
    const newNotes = [...notes, {id:Date.now(),text:noteDraft.trim(),follow:noteFollow,ts,by:"John Smith"}];
    persistNotes(newNotes);
    if(noteFollow && onNoteAdded){ const[y,mo,d]=noteFollow.split('-'); onNoteAdded(`${mo}/${d}/${y.slice(2)}`); }
    setAdding(false); setDraft(""); setFollow("");
  };

  useERVE(() => {
    const e = initialEntry;
    if (!e) return;
    if (e.planName)      setPlanName(e.planName);
    if (e.covStatus)     setCovStatus(e.covStatus);
    if (e.covRangeStart) setCovRangeStart(e.covRangeStart);
    if (e.covRangeEnd)   setCovRangeEnd(e.covRangeEnd);
    if (e.payorId)       setPayorId(e.payorId);
    if (e.planType)      setPlanType(e.planType);
    if (e.groupNo)       setGroupNo(e.groupNo);
    if (e.provStatus)    setProvStatus(e.provStatus);
    if (e.eligSource)    setEligSource(e.eligSource);
    if (e.checkedBy)     setCheckedBy(e.checkedBy);
    if (e.patGender)     setPatGender(e.patGender);
    if (e.patMemId)      setPatMemId(e.patMemId);
    if (e.patMbi)        setPatMbi(e.patMbi);
    if (e.patDob)        setPatDob(e.patDob);
    if (e.patAddr)       setPatAddr(e.patAddr);
    if (e.patReln)       setPatReln(e.patReln);
    if (e.authIn)        setAuthIn(e.authIn);
    if (e.authOut)       setAuthOut(e.authOut);
    if (e.copayIn)       setCopayIn(e.copayIn);
    if (e.copayOut)      setCopayOut(e.copayOut);
    if (e.coinsIn)       setCoinsIn(e.coinsIn);
    if (e.coinsOut)      setCoinsOut(e.coinsOut);
    if (e.visitIn)       setVisitIn(e.visitIn);
    if (e.visitOut)      setVisitOut(e.visitOut);
    if (e.svcBen)        setSvcBen(e.svcBen);
    if (e.planBen)       setPlanBen(e.planBen);
    if (Array.isArray(e.addlCov)    && e.addlCov.length)    setAddlCov(e.addlCov);
    if (Array.isArray(e.pcpLines)   && e.pcpLines.length)   setPcpLines(e.pcpLines);
    if (Array.isArray(e.alertLines) && e.alertLines.length) setAlertLines(e.alertLines);
    if (Array.isArray(e.notes)      && e.notes.length)      setNotes(e.notes);
    setPatOpen(true);
  }, []);

  const fillDemo = () => {
    setEligSource("Manual"); setCheckedBy("John Smith");
    setPlanName(/star.*plus/i.test(r.payorSrc||"")?"Star + Plus Health Plan":"Aetna Medicare Gold Advantage (PPO) for senior citizen");
    setCovStatus("Active"); setCovRangeStart("2025-01-01"); setCovRangeEnd("2025-12-31");
    setPayorId("77856"); setPlanType("HMO"); setGroupNo("18641881288"); setProvStatus("In-Network");
    setPatGender("Female"); setPatMemId(r.memId||"11521357"); setPatMbi("3543657457445");
    setPatDob("1932-12-08"); setPatAddr("204 Spicer Dr, Gordonsville, TN 38563"); setPatReln("Self");
    setSubGender("Female"); setSubMemId(r.memId||"11521357"); setSubMbi("3543657457445");
    setSubDob("1932-12-08"); setSubAddr("204 Spicer Dr, Gordonsville, TN 38563");
    setAuthIn("Yes"); setAuthOut("Yes"); setCopayIn("$0 per visit"); setCopayOut("$0 per visit");
    setCoinsIn("20%"); setCoinsOut("20%");
    setVisitIn("Limited to 60 Visits Per Calendar Year."); setVisitOut("Limited to 60 Visits Per Calendar Year.");
    setSvcBen({ "Total Deductibles":{indInT:"1500",indInR:"1200",famInT:"4500",famInR:"3600",indOutT:"",indOutR:"",famOutT:"",famOutR:""}, "Out of Pocket":{indInT:"3800",indInR:"2100",famInT:"7600",famInR:"5600",indOutT:"",indOutR:"",famOutT:"",famOutR:""} });
    setPlanBen({ "Total Deductibles":{indInT:"1500",indInR:"1200",famInT:"4500",famInR:"3600",indOutT:"",indOutR:"",famOutT:"",famOutR:""}, "Out of Pocket":{indInT:"3800",indInR:"2100",famInT:"7600",famInR:"5600",indOutT:"",indOutR:"",famOutT:"",famOutR:""} });
    setAddlCov([{ planName:"AARP Medicare Advantage",payorId:"452674",memberId:"3543532423",covStart:"01/25/25",covEnd:"01/25/26" },{ planName:"UHC Medicare For Senior Citizen",payorId:"124689",memberId:"56785426645",covStart:"12/04/25",covEnd:"12/04/26" }]);
    setPcpLines([{firstName:"Dr. John",middleName:"Naren",lastName:"",phone:"574-686-5453",pcpGroup1:"354657545",pcpGroup2:"354657545",addr1:"128 Down street",addr2:"Sunshine Avenue",city:"Nashville",state:"TN",zip:"37203"}]);
    setPatOpen(true); setPlanBenOpen(true); setSvcBenOpen(true); setAddlCovOpen(true); setPcpOpen(true);
  };

  const covKindMap = {"Active":"active","Inactive":"inactive","Mixed":"mixed","Exception":"exception","Pending Submission":"pending","":"pending"};
  const doSave = () => {
    const cov = covKindMap[covStatus] || "pending";
    const entry = {
      id:r.id, cov,
      refId:"REFE"+String(Date.now()).slice(-9),
      submittedAt:new Date().toLocaleDateString("en-US"),
      patientName: patNameEdit,
      planName, covStatus, covRangeStart, covRangeEnd, payorId, planType, groupNo, provStatus,
      patGender, patMemId, patMbi, patDob, patAddr, patReln,
      sameAsPat, subGender, subMemId, subMbi, subDob, subAddr,
      authIn, authOut, copayIn, copayOut, coinsIn, coinsOut, visitIn, visitOut,
      addlCov:[...addlCov], pcpLines:[...pcpLines], alertLines:[...alertLines], notes:[...notes],
      svcBen:{...svcBen}, planBen:{...planBen}, eligSource, checkedBy,
    };
    if (onSave) onSave(entry);
    onClose && onClose();
  };

  // Shared input style
  const inpSt = {border:"1px solid #d7dee7",borderRadius:4,padding:"5px 8px",font:"400 13px/18px Roboto",color:"#0f172a",outline:"none",background:"#fff",boxSizing:"border-box"};
  const thSt  = {padding:"8px 10px",font:"500 12px/16px Roboto",color:"#64748b",textAlign:"left",border:"1px solid #e2e8f0",background:"#F8FAFC",whiteSpace:"nowrap"};
  const tdSt  = {padding:"6px 10px",border:"1px solid #e2e8f0"};

  const patientName = r.name || p.name || "";
  const mrn         = r.mrn  || p.mrn  || "";
  const dob         = p.dob  || "12/08/1932";
  const memId       = r.memId|| p.memberId || "";
  const payorName   = r.payor|| p.payorType || "";
  const payorSrc    = r.payorSrc || p.payorSource || "";
  const payorType   = p.payorType || "Medicaid";
  const gateway     = (r.gw && r.gw !== "") ? r.gw : (p.gateway || "");
  const soc         = r.soc  || "01/21/25";
  const refId       = (initialEntry && initialEntry.authNo) || "REFE023948217";

  const CalIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="#94a3b8" strokeWidth="1.6"/>
      <path d="M3.5 9.5h17M8 3.5v3.5M16 3.5v3.5" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
  const TrashIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M4.5 7h15M9 7V5h6v2M6.5 7l.9 12.5h9.2L17.5 7" stroke="#dc2626" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div style={{position:"fixed",inset:0,zIndex:1000}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(15,23,42,0.45)"}}></div>
      <div style={{position:"fixed",right:0,top:0,height:"100vh",width:docsOpen?"min(1908px,98vw)":"min(1520px,98vw)",boxShadow:"-16px 0 40px rgba(15,23,42,0.18)",display:"flex",flexDirection:"row",transition:"width .18s ease"}}>
      <div style={{flex:1,minWidth:0,background:"#fff",display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* ── Header ── */}
        <div style={{flexShrink:0,padding:"14px 24px",display:"flex",alignItems:"center",borderBottom:"1px solid #e2e8f0"}}>
          <span style={{font:"600 19px/26px Roboto",color:"#1c2d42",flex:1}}>Manage Eligibility Request</span>
          <button type="button" onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",color:"#1c2d42",fontSize:22,lineHeight:1,padding:4}}>×</button>
        </div>

        {/* ── Patient Banner ── */}
        <div style={{flexShrink:0,background:"#F5F8FB",borderBottom:"1px solid #dce6f0",padding:"12px 24px",display:"flex",alignItems:"flex-end",gap:24,flexWrap:"wrap"}}>
          <div>
            <div style={{font:"400 11px/14px Roboto",color:"#7c8698"}}>Patient Name</div>
            <div style={{font:"600 19px/24px Roboto",color:"#1c2d42"}}>{patientName}</div>
          </div>
          {[["MRN",mrn],["DOB",dob],["Mem ID",memId],["Payor Name",payorName],["Payor Source",payorSrc],["Payor Type",payorType],["Gateway",gateway],["Start of Care",soc],["Reln to Subscriber","Self"]].map(([l,v])=>(
            <div key={l} style={{minWidth:0}}>
              <div style={{font:"400 11px/14px Roboto",color:"#7c8698",whiteSpace:"nowrap"}}>{l}</div>
              <div style={{font:"400 13px/18px Roboto",color:"#1c2d42",whiteSpace:"nowrap"}}>{v||"—"}</div>
            </div>
          ))}
          <button type="button" onClick={fillDemo} style={{marginLeft:"auto",flexShrink:0,background:"#f0f6ff",border:"1px solid #93c5fd",color:"#1d4ed8",borderRadius:6,padding:"6px 16px",font:"500 12px/18px Roboto",cursor:"pointer",whiteSpace:"nowrap",alignSelf:"center"}}>Demo : Fill Details</button>
        </div>

        {/* ── Sub-header bar ── */}
        <div style={{flexShrink:0,padding:"9px 24px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",background:"#fff"}}>
          <span style={{font:"400 12px/18px Roboto",color:"#64748b"}}>Ref ID :<b style={{color:"#0f172a",fontWeight:500,marginLeft:4}}>{refId}</b></span>
          <span style={{color:"#e2e8f0"}}>|</span>
          <span style={{font:"400 12px/18px Roboto",color:"#64748b",display:"flex",alignItems:"center",gap:5}}>
            Elig Check Date :
            <b style={{color:"#0f172a",fontWeight:500,marginLeft:4}}>12/02/26 14:22</b>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#64748b" strokeWidth="1.6"/><path d="M12 7v5l3 3" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </span>
          <span style={{color:"#e2e8f0"}}>|</span>
          <span style={{font:"400 12px/18px Roboto",color:"#64748b",display:"flex",alignItems:"center",gap:5}}>
            Eligibility Source :
            <select value={eligSource} onChange={e=>setEligSource(e.target.value)} style={{border:"1px solid #d7dee7",borderRadius:4,padding:"3px 8px",font:"400 12px/18px Roboto",color:eligSource?"#0f172a":"#94a3b8",outline:"none"}}>
              <option value="">Enter Source</option>
              <option>Manual</option><option>Automated</option><option>Portal</option>
            </select>
          </span>
          <span style={{color:"#e2e8f0"}}>|</span>
          <span style={{font:"400 12px/18px Roboto",color:"#64748b",display:"flex",alignItems:"center",gap:5}}>
            Checked by
            <input value={checkedBy} onChange={e=>setCheckedBy(e.target.value)} placeholder="Enter Agent Name" style={{...inpSt,padding:"3px 8px",minWidth:130}} />
          </span>
        </div>

        {/* ── Tabs ── */}
        <div style={{flexShrink:0,padding:"0 24px",borderBottom:"1px solid #e2e8f0",display:"flex",gap:28}}>
          {[["elig","Eligibility Response"],["notes","Notes"]].map(([k,lbl])=>(
            <button key={k} type="button" onClick={()=>setTab(k)}
              style={{background:"transparent",border:"none",cursor:"pointer",padding:"10px 2px",font:`${tab===k?500:400} 13px/18px Roboto`,color:tab===k?"#1677FF":"#5a6675",borderBottom:`2px solid ${tab===k?"#1677FF":"transparent"}`,marginBottom:-1}}>
              {lbl}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="ws-scrollbody" style={{flex:1,overflow:"auto",padding:"16px 24px 40px"}}>
          
          {tab==="notes" ? (
            <div>
              {notes.length===0 && !addingNote ? (
                <div style={{border:"1px solid #9CC3F5",background:"#EAF3FE",borderRadius:10,padding:"70px 24px",display:"flex",flexDirection:"column",alignItems:"center",gap:18}}>
                  <span style={{font:"400 14px/22px Roboto",color:"#5a6675",textAlign:"center"}}>Add any notes associated to this request</span>
                  <button type="button" onClick={startNote} style={{border:"none",background:"#1677FF",color:"#fff",borderRadius:6,padding:"9px 18px",font:"500 13px/18px Roboto",cursor:"pointer"}}>+ Add New Note</button>
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:16}}>
                  {!addingNote && <button type="button" onClick={startNote} style={{alignSelf:"flex-start",border:"none",background:"#1677FF",color:"#fff",borderRadius:6,padding:"8px 16px",font:"500 13px/18px Roboto",cursor:"pointer"}}>+ Add New Note</button>}
                  {addingNote && (
                    <div style={{border:"1px solid #cfe0f5",background:"#F7FAFE",borderRadius:10,padding:"16px 18px",display:"flex",flexDirection:"column",gap:14}}>
                      <textarea value={noteDraft} onChange={e=>setDraft(e.target.value)} autoFocus rows={4} placeholder="Write a note…" style={{...inpSt,resize:"vertical",fontFamily:"Roboto"}} />
                      <div style={{display:"flex",alignItems:"flex-end",gap:16}}>
                        <div>
                          <div style={{font:"400 12px/16px Roboto",color:"#7c8698",marginBottom:6}}>Set follow-up date</div>
                          <input type="date" value={noteFollow} onChange={e=>setFollow(e.target.value)} style={inpSt} />
                        </div>
                        <div style={{marginLeft:"auto",display:"flex",gap:10}}>
                          <button type="button" onClick={()=>{setAdding(false);setDraft("");setFollow("");}} style={{border:"1px solid #cdd6e0",background:"#fff",color:"#475569",borderRadius:6,padding:"8px 18px",font:"500 13px/18px Roboto",cursor:"pointer"}}>Cancel</button>
                          <button type="button" onClick={saveNote} style={{border:"none",background:"#1677FF",color:"#fff",borderRadius:6,padding:"8px 22px",font:"500 13px/18px Roboto",cursor:"pointer"}}>Save Note</button>
                        </div>
                      </div>
                    </div>
                  )}
                  {notes.length>0 && (
                    <div style={{border:"1px solid #e8e8e8",borderRadius:6,overflow:"hidden"}}>
                      <div style={{display:"grid",gridTemplateColumns:"180px minmax(0,1fr) 150px 160px"}}>
                        {["Created Date & Time","Notes","Followup Date","Created by"].map((c,i)=><div key={c} style={{padding:"10px 12px",font:"500 12px/16px Roboto",color:"#5a6675",background:"#F8FAFC",borderLeft:i>0?"1px solid rgba(0,0,0,0.06)":"none",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>{c}</div>)}
                      </div>
                      {notes.map(n=>(
                        <div key={n.id} style={{display:"grid",gridTemplateColumns:"180px minmax(0,1fr) 150px 160px"}}>
                          {[n.ts,n.text,n.follow||"—",n.by].map((v,i)=><div key={i} style={{padding:"12px",font:"400 13px/20px Roboto",color:"rgba(0,0,0,0.85)",borderLeft:i>0?"1px solid rgba(0,0,0,0.06)":"none",borderTop:"1px solid rgba(0,0,0,0.06)"}}>{v}</div>)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* ── Eligibility Alerts accordion ── */}
              <div style={{border:"1px solid #e2e8f0",borderRadius:6,marginBottom:12,overflow:"hidden"}}>
                <div onClick={()=>setAlertsOpen(v=>!v)} style={{display:"flex",alignItems:"center",gap:8,padding:"12px 16px",cursor:"pointer",userSelect:"none"}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{transform:alertsOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform .15s",flexShrink:0}}>
                    <path d="M9 6l6 6-6 6" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{font:"500 14px/20px Roboto",color:"#0f172a"}}>Eligibility Alerts</span>
                </div>
                {alertsOpen && (
                  <div style={{borderTop:"1px solid #e2e8f0",padding:"16px"}}>
                    {alertLines.length===0 ? (
                      <div style={{minHeight:85,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,textAlign:"center",padding:"16px 24px"}}>
                        <span style={{font:"400 13px/20px Roboto",color:"#64748b"}}>Add alerts to clearly highlight and document important eligibility<br/>information for the patient.</span>
                        <button type="button" onClick={()=>setAlertLines([{type:"",desc:""}])} style={{background:"#1677FF",color:"#fff",border:"none",borderRadius:6,padding:"9px 20px",font:"500 13px/18px Roboto",cursor:"pointer"}}>+ Add an Eligibility Alert</button>
                      </div>
                    ) : (
                      <div>
                        {alertLines.map((al,i)=>(
                          <div key={i} style={{display:"grid",gridTemplateColumns:"200px 1fr 32px",gap:12,alignItems:"end",marginBottom:12}}>
                            <div>
                              <div style={{font:"400 12px/16px Roboto",color:"#7c8698",marginBottom:4}}>Alert Type</div>
                              <input value={al.type} onChange={e=>setAlert(i,"type",e.target.value)} placeholder="Enter Alert Type" style={{...inpSt,width:"100%"}} />
                            </div>
                            <div>
                              <div style={{font:"400 12px/16px Roboto",color:"#7c8698",marginBottom:4}}>Alert Description</div>
                              <input value={al.desc} onChange={e=>setAlert(i,"desc",e.target.value)} placeholder="Enter Alert Description" style={{...inpSt,width:"100%"}} />
                            </div>
                            <button type="button" onClick={()=>rmAlert(i)} style={{border:"none",background:"transparent",cursor:"pointer",padding:0,display:"flex",alignItems:"center",justifyContent:"center",marginTop:20}}><TrashIcon /></button>
                          </div>
                        ))}
                        <button type="button" onClick={addAlert} style={{background:"transparent",border:"none",color:"#1677FF",font:"500 13px/18px Roboto",cursor:"pointer",padding:0}}>+ Add One More Eligibility Alert</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Plan info strip ── */}
              <div style={{border:"1px solid rgb(174,184,226)",borderRadius:8,background:"rgb(213,227,255)",marginBottom:12,boxShadow:"0px 6px 16px 0px rgba(0,0,0,0.08)",overflow:"hidden"}}>
                {/* Row 1 — blue band (inputs) */}
                <div style={{background:"rgb(213,227,255)",padding:"12px 16px",display:"flex",flexDirection:"row",gap:16,alignItems:"center"}}>
                  <input value={planName} onChange={e=>setPlanName(e.target.value)} placeholder="Enter Plan Name"
                    style={{flex:2,height:36,borderRadius:6,background:"rgb(240,245,255)",border:"1px solid rgb(210,220,245)",padding:"10px 8px",fontFamily:"Roboto,sans-serif",fontSize:13,color:"rgba(0,0,0,0.88)",outline:"none",boxSizing:"border-box"}} />
                  <div style={{position:"relative",flex:1,minWidth:150,height:36,flexShrink:0}}>
                    <select value={covStatus} onChange={e=>setCovStatus(e.target.value)}
                      style={{width:"100%",height:36,borderRadius:6,background:"rgb(240,245,255)",border:"1px solid rgb(210,220,245)",padding:"10px 8px",paddingRight:28,fontFamily:"Roboto,sans-serif",fontSize:13,color:covStatus?"rgba(0,0,0,0.88)":"rgba(0,0,0,0.45)",outline:"none",appearance:"none",boxSizing:"border-box"}}>
                      <option value="">Coverage Status</option>
                      <option>Pending Submission</option><option>Active</option><option>Inactive</option><option>Mixed</option><option>Exception</option>
                    </select>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
                      <path d="M5 8L19 8L12 17Z" fill="rgba(0,0,0,0.45)"/>
                    </svg>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,flex:1,minWidth:260,flexShrink:0}}>
                    <input type="date" value={covRangeStart} onChange={e=>setCovRangeStart(e.target.value)}
                      style={{flex:1,height:36,borderRadius:6,background:"rgb(240,245,255)",border:"1px solid rgb(210,220,245)",padding:"6px 8px",fontFamily:"Roboto,sans-serif",fontSize:13,color:"rgba(0,0,0,0.88)",outline:"none",boxSizing:"border-box"}} />
                    <span style={{color:"rgba(0,0,0,0.45)",fontSize:14,flexShrink:0}}>–</span>
                    <input type="date" value={covRangeEnd} onChange={e=>setCovRangeEnd(e.target.value)}
                      style={{flex:1,height:36,borderRadius:6,background:"rgb(240,245,255)",border:"1px solid rgb(210,220,245)",padding:"6px 8px",fontFamily:"Roboto,sans-serif",fontSize:13,color:"rgba(0,0,0,0.88)",outline:"none",boxSizing:"border-box"}} />
                  </div>
                </div>
                {/* Row 2 — white band (labels + small fields + Documents) */}
                <div style={{background:"rgb(255,255,255)",display:"flex",alignItems:"center",gap:12,flexWrap:"nowrap",padding:"10px 16px",borderTop:"1px solid rgb(200,215,240)"}}>
                  {[["Payor ID:",payorId,setPayorId,"ID",77],["Plan Type:",planType,setPlanType,"Type",77],["Group #:",groupNo,setGroupNo,"#",77]].map(([lbl,val,set,ph,w])=>(
                    <span key={lbl} style={{display:"inline-flex",alignItems:"center",gap:6,flexShrink:0}}>
                      <span style={{fontFamily:"Roboto,sans-serif",fontWeight:500,fontSize:12,color:"rgba(0,0,0,0.88)",whiteSpace:"nowrap"}}>{lbl}</span>
                      <input value={val} onChange={e=>set(e.target.value)} placeholder={ph}
                        style={{width:w,height:24,borderRadius:6,background:"rgb(227,236,255)",boxShadow:"inset 0 0 0 1px rgba(208,213,240,0.6)",border:"none",padding:"4px 8px",fontFamily:"Roboto,sans-serif",fontSize:12,color:"rgba(0,0,0,0.45)",outline:"none",boxSizing:"border-box"}} />
                    </span>
                  ))}
                  <span style={{display:"inline-flex",alignItems:"center",gap:6,flexShrink:0}}>
                    <span style={{fontFamily:"Roboto,sans-serif",fontWeight:500,fontSize:12,color:"rgba(0,0,0,0.88)",whiteSpace:"nowrap"}}>Provider Status:</span>
                    <div style={{position:"relative",width:130}}>
                      <select value={provStatus} onChange={e=>setProvStatus(e.target.value)}
                        style={{width:"100%",height:24,borderRadius:6,background:"rgb(227,236,255)",boxShadow:"inset 0 0 0 1px rgba(208,213,240,0.6)",border:"none",padding:"4px 8px",paddingRight:22,fontFamily:"Roboto,sans-serif",fontSize:12,color:provStatus?"rgba(0,0,0,0.88)":"rgba(0,0,0,0.45)",outline:"none",appearance:"none",boxSizing:"border-box"}}>
                        <option value="">Select Status</option>
                        <option>Active</option><option>Inactive</option><option>Pending</option>
                      </select>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
                        <path d="M5 8L19 8L12 17Z" fill="rgba(0,0,0,0.45)"/>
                      </svg>
                    </div>
                  </span>
                  <button type="button" onClick={()=>setDocsOpen(true)} style={{marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:7,border:"1px solid rgb(22,119,255)",background:"#fff",color:"rgb(22,119,255)",borderRadius:6,padding:"0 16px",height:32,fontFamily:"Roboto,sans-serif",fontWeight:500,fontSize:13,cursor:"pointer",flexShrink:0}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 2.75h7.2L19 8.55V19.5a1.75 1.75 0 0 1-1.75 1.75H6A1.75 1.75 0 0 1 4.25 19.5v-15A1.75 1.75 0 0 1 6 2.75z" stroke="rgb(22,119,255)" strokeWidth="1.5" strokeLinejoin="round"/><path d="M13 2.9v5.1h5" stroke="rgb(22,119,255)" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                    Documents
                  </button>
                </div>
              </div>

              {/* ── Patient Details ── */}
              <EEAccordion open={patOpen} onToggle={()=>setPatOpen(v=>!v)} title="Patient Details" sub="Demographics & Identifiers" editIcon bodyPadding="21px 16px 21px 45px">
                <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1fr 1.2fr 2fr 1.5fr",gap:16,alignItems:"end"}}>
                  {[{label:"Patient Name",content:<input value={patNameEdit} onChange={e=>setPatNameEdit(e.target.value)} style={{...inpSt,width:"100%",fontWeight:500}} />},
                    {label:"Gender",content:<select value={patGender} onChange={e=>setPatGender(e.target.value)} style={{...inpSt,width:"100%"}}><option>Female</option><option>Male</option><option>Other</option></select>},
                    {label:"Member ID",content:<input value={patMemId} onChange={e=>setPatMemId(e.target.value)} style={{...inpSt,width:"100%"}} />},
                    {label:"MBI",content:<input value={patMbi} onChange={e=>setPatMbi(e.target.value)} style={{...inpSt,width:"100%"}} />},
                    {label:"DOB",content:<input type="date" className="ma-date" value={toDateInput(patDob)} onChange={e=>setPatDob(fromDateInput(e.target.value))} style={{...inpSt,width:"100%"}} />},
                    {label:"Address",content:<input value={patAddr} onChange={e=>setPatAddr(e.target.value)} style={{...inpSt,width:"100%"}} />},
                    {label:"Relationship To Subscriber",content:<select value={patReln} onChange={e=>setPatReln(e.target.value)} style={{...inpSt,width:"100%"}}><option>Self</option><option>Spouse</option><option>Child</option><option>Other</option></select>},
                  ].map(({label,content})=>(
                    <div key={label} style={{display:"flex",flexDirection:"column",gap:8}}>
                      <span style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:"rgba(0,0,0,0.45)",whiteSpace:"nowrap"}}>{label}</span>
                      {content}
                    </div>
                  ))}
                </div>
              </EEAccordion>

              {/* ── Subscriber Info ── */}
              <EEAccordion open={subOpen} onToggle={()=>setSubOpen(v=>!v)} title="Subscriber Info" sub="Demographics & Identifiers of Subscriber" editIcon bodyPadding="14px 16px 14px 45px">
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <span role="checkbox" aria-checked={sameAsPat} onClick={()=>setSameAsPat(v=>!v)}
                    style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:`1px solid ${sameAsPat?"rgb(22,119,255)":"#d8d8d8"}`,borderRadius:3,background:sameAsPat?"rgb(22,119,255)":"#fff",cursor:"pointer",flexShrink:0}}>
                    {sameAsPat && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}
                  </span>
                  <span style={{fontFamily:"Roboto,sans-serif",fontSize:13,color:"rgba(0,0,0,0.88)"}}>Same as Patient</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1fr 1.2fr 2fr",gap:16,alignItems:"end"}}>
                  {[{label:"Subscriber Name",content: sameAsPat
                      ? <span style={{...inpSt,display:"block",width:"100%",background:"#f8fafc",fontWeight:500}}>{patNameEdit||"—"}</span>
                      : <input value={subName} onChange={e=>setSubName(e.target.value)} style={{...inpSt,width:"100%",fontWeight:500}} />},
                    {label:"Gender",content:<select value={sameAsPat?patGender:subGender} onChange={e=>!sameAsPat&&setSubGender(e.target.value)} disabled={sameAsPat} style={{...inpSt,width:"100%",background:sameAsPat?"#f8fafc":"#fff"}}><option>Female</option><option>Male</option><option>Other</option></select>},
                    {label:"Member ID",content:<input value={sameAsPat?patMemId:subMemId} onChange={e=>!sameAsPat&&setSubMemId(e.target.value)} readOnly={sameAsPat} style={{...inpSt,width:"100%",background:sameAsPat?"#f8fafc":"#fff"}} />},
                    {label:"MBI",content:<input value={sameAsPat?patMbi:subMbi} onChange={e=>!sameAsPat&&setSubMbi(e.target.value)} readOnly={sameAsPat} style={{...inpSt,width:"100%",background:sameAsPat?"#f8fafc":"#fff"}} />},
                    {label:"DOB",content:<input type="date" className="ma-date" value={toDateInput(sameAsPat?patDob:subDob)} onChange={e=>!sameAsPat&&setSubDob(fromDateInput(e.target.value))} readOnly={sameAsPat} style={{...inpSt,width:"100%",background:sameAsPat?"#f8fafc":"#fff"}} />},
                    {label:"Address",content:<input value={sameAsPat?patAddr:subAddr} onChange={e=>!sameAsPat&&setSubAddr(e.target.value)} readOnly={sameAsPat} style={{...inpSt,width:"100%",background:sameAsPat?"#f8fafc":"#fff"}} />},
                  ].map(({label,content})=>(
                    <div key={label} style={{display:"flex",flexDirection:"column",gap:8}}>
                      <span style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:"rgba(0,0,0,0.45)",whiteSpace:"nowrap"}}>{label}</span>
                      {content}
                    </div>
                  ))}
                </div>
              </EEAccordion>

              {/* ── Plan Benefits ── */}
                <EEAccordion open={planBenOpen} onToggle={()=>setPlanBenOpen(v=>!v)} title="Plan Benefits" sub="Deductible, OOP, and Home Health service benefits" editIcon bodyPadding="16px 16px 20px 45px">
                  <div style={{overflowX:"auto"}}>
                    <table style={{borderCollapse:"collapse",width:"100%",minWidth:900}}>
                      <thead>
                        <tr>
                          <th rowSpan={2} style={{padding:"8px 12px",font:"500 12px/16px Roboto",color:"#64748b",border:"1px solid #e2e8f0",background:"#F8FAFC",textAlign:"left",width:160,verticalAlign:"middle"}}>Coverage</th>
                          {["Individual, In-Network","Family, In-Network","Individual, Out of Network","Family, Out of Network"].map(col=>(
                            <th key={col} colSpan={2} style={{padding:"8px 12px",font:"500 12px/16px Roboto",color:"rgba(0,0,0,0.88)",border:"1px solid #e2e8f0",background:"rgba(0,0,0,0.04)",textAlign:"center",whiteSpace:"nowrap"}}>{col}</th>
                          ))}
                        </tr>
                        <tr>
                          {[0,1,2,3].map(i=>(
                            <React.Fragment key={i}>
                              <th style={{padding:"6px 10px",font:"400 11px/14px Roboto",color:"rgba(0,0,0,0.46)",border:"1px solid #e2e8f0",background:"rgba(0,0,0,0.02)",textAlign:"center"}}>Total</th>
                              <th style={{padding:"6px 10px",font:"400 11px/14px Roboto",color:"rgba(0,0,0,0.46)",border:"1px solid #e2e8f0",background:"rgba(0,0,0,0.02)",textAlign:"center"}}>Remaining</th>
                            </React.Fragment>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {["Total Deductibles","Out of Pocket"].map(rowLabel=>(
                          <tr key={rowLabel}>
                            <td style={{padding:"14px 12px",border:"1px solid #e2e8f0",font:"500 12px/16px Roboto",color:"rgba(0,0,0,0.88)"}}>{rowLabel}</td>
                            {["indInT","indInR","famInT","famInR","indOutT","indOutR","famOutT","famOutR"].map(key=>(
                              <td key={key} style={{padding:"10px 8px",border:"1px solid #e2e8f0",textAlign:"center"}}>
                                <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"#fff",border:"1px solid rgba(217,217,217,0.8)",borderRadius:4,padding:"5px 8px",width:89,boxSizing:"border-box"}}>
                                  <input value={planBen[rowLabel][key]} onChange={e=>setPBVal(rowLabel,key,e.target.value)} placeholder="-" style={{border:"none",outline:"none",width:"100%",font:"400 12px/18px Roboto",color:"rgba(0,0,0,0.88)",background:"transparent",padding:0}} />
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </EEAccordion>

              {/* ── Service Benefits ── */}
              <EEAccordion open={svcBenOpen} onToggle={()=>setSvcBenOpen(v=>!v)} title="Service Benefits" sub="Deductible, OOP, and Home Health service benefits" editIcon bodyPadding="16px 16px 20px 45px">
                <div style={{display:"flex",gap:20,borderBottom:"1px solid #e2e8f0",marginBottom:14}}>
                  <button type="button" onClick={()=>setSvcTab("hh")} style={{background:"transparent",border:"none",cursor:"pointer",padding:"8px 2px",font:`${svcTab==="hh"?500:400} 13px/18px Roboto`,color:svcTab==="hh"?"#1677FF":"#64748b",borderBottom:`2px solid ${svcTab==="hh"?"#1677FF":"transparent"}`,marginBottom:-1}}>Home Health Benefits</button>
                  <button type="button" style={{background:"transparent",border:"none",cursor:"pointer",padding:"8px 2px",font:"400 13px/18px Roboto",color:"#1677FF"}}>+ Add New Service</button>
                </div>
                <div style={{overflowX:"auto",marginBottom:16}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{background:"rgba(0,0,0,0.04)"}}>
                        <th style={{...thSt,width:"28%",textAlign:"left"}}>Service Benefit</th>
                        <th style={{...thSt,textAlign:"center",width:"36%"}}>In-Network</th>
                        <th style={{...thSt,textAlign:"center",width:"36%"}}>Out of Network</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Auth Required",
                          <div style={{display:"flex",justifyContent:"center"}}>
                            <div style={{position:"relative",display:"inline-flex",alignItems:"center",gap:8,background:"#fff",border:"1px solid rgba(217,217,217,0.6)",borderRadius:6,padding:"10px 12px",width:244,boxSizing:"border-box",cursor:"pointer"}}>
                              <select value={authIn} onChange={e=>setAuthIn(e.target.value)} style={{flex:1,border:"none",outline:"none",font:"400 12px/17px Roboto",color:"rgba(0,0,0,0.88)",background:"transparent",appearance:"none",cursor:"pointer",textAlign:"center"}}><option>Yes</option><option>No</option></select>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{flexShrink:0,opacity:0.5}}><path d="M5 8l7 8 7-8" stroke="rgb(22,119,255)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          </div>,
                          <div style={{display:"flex",justifyContent:"center"}}>
                            <div style={{position:"relative",display:"inline-flex",alignItems:"center",gap:8,background:"#fff",border:"1px solid rgba(217,217,217,0.6)",borderRadius:6,padding:"10px 12px",width:244,boxSizing:"border-box",cursor:"pointer"}}>
                              <select value={authOut} onChange={e=>setAuthOut(e.target.value)} style={{flex:1,border:"none",outline:"none",font:"400 12px/17px Roboto",color:"rgba(0,0,0,0.88)",background:"transparent",appearance:"none",cursor:"pointer",textAlign:"center"}}><option>Yes</option><option>No</option></select>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{flexShrink:0,opacity:0.5}}><path d="M5 8l7 8 7-8" stroke="rgb(22,119,255)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          </div>],
                        ["Copay",
                          <div style={{display:"flex",justifyContent:"center"}}><input value={copayIn} onChange={e=>setCopayIn(e.target.value)} style={{...inpSt,width:244,textAlign:"center",height:32,boxSizing:"border-box"}} /></div>,
                          <div style={{display:"flex",justifyContent:"center"}}><input value={copayOut} onChange={e=>setCopayOut(e.target.value)} style={{...inpSt,width:244,textAlign:"center",height:32,boxSizing:"border-box"}} /></div>],
                        ["Co-insurance",
                          <div style={{display:"flex",justifyContent:"center"}}><input value={coinsIn} onChange={e=>setCoinsIn(e.target.value)} style={{...inpSt,width:244,textAlign:"center",height:32,boxSizing:"border-box"}} /></div>,
                          <div style={{display:"flex",justifyContent:"center"}}><input value={coinsOut} onChange={e=>setCoinsOut(e.target.value)} style={{...inpSt,width:244,textAlign:"center",height:32,boxSizing:"border-box"}} /></div>],
                        ["Visit Limit / Discipline Exclusion",
                          <div style={{display:"flex",justifyContent:"center"}}><textarea value={visitIn} onChange={e=>setVisitIn(e.target.value)} rows={3} style={{...inpSt,width:244,textAlign:"center",resize:"vertical",fontFamily:"Roboto",boxSizing:"border-box"}} /></div>,
                          <div style={{display:"flex",justifyContent:"center"}}><textarea value={visitOut} onChange={e=>setVisitOut(e.target.value)} rows={3} style={{...inpSt,width:244,textAlign:"center",resize:"vertical",fontFamily:"Roboto",boxSizing:"border-box"}} /></div>],
                      ].map(([label, inEl, outEl])=>(
                        <tr key={label}>
                          <td style={{padding:"14px 12px",border:"1px solid #e2e8f0",font:"500 13px/16px Roboto",color:"rgba(0,0,0,0.88)"}}>{label}</td>
                          <td style={{padding:"12px 8px",border:"1px solid #e2e8f0",borderLeft:"1px solid rgb(217,217,217)"}}>{inEl}</td>
                          <td style={{padding:"12px 8px",border:"1px solid #e2e8f0",borderLeft:"1px solid rgb(217,217,217)"}}>{outEl}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Service Benefits deductible table — same editable grid as Plan Benefits */}
                <div style={{overflowX:"auto"}}>
                  <table style={{borderCollapse:"collapse",width:"100%",minWidth:900}}>
                    <thead>
                      <tr>
                        <th rowSpan={2} style={{padding:"8px 12px",font:"500 12px/16px Roboto",color:"#64748b",border:"1px solid #e2e8f0",background:"#F8FAFC",textAlign:"left",width:160,verticalAlign:"middle"}}>Coverage</th>
                        {["Individual, In-Network","Family, In-Network","Individual, Out of Network","Family, Out of Network"].map(col=>(
                          <th key={col} colSpan={2} style={{padding:"8px 12px",font:"500 12px/16px Roboto",color:"rgba(0,0,0,0.88)",border:"1px solid #e2e8f0",background:"rgba(0,0,0,0.04)",textAlign:"center",whiteSpace:"nowrap"}}>{col}</th>
                        ))}
                      </tr>
                      <tr>
                        {[0,1,2,3].map(i=>(
                          <React.Fragment key={i}>
                            <th style={{padding:"6px 10px",font:"400 11px/14px Roboto",color:"rgba(0,0,0,0.46)",border:"1px solid #e2e8f0",background:"rgba(0,0,0,0.02)",textAlign:"center"}}>Total</th>
                            <th style={{padding:"6px 10px",font:"400 11px/14px Roboto",color:"rgba(0,0,0,0.46)",border:"1px solid #e2e8f0",background:"rgba(0,0,0,0.02)",textAlign:"center"}}>Remaining</th>
                          </React.Fragment>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {["Total Deductibles","Out of Pocket"].map(rowLabel=>(
                        <tr key={rowLabel}>
                          <td style={{padding:"14px 12px",border:"1px solid #e2e8f0",font:"500 12px/16px Roboto",color:"rgba(0,0,0,0.88)"}}>{rowLabel}</td>
                          {["indInT","indInR","famInT","famInR","indOutT","indOutR","famOutT","famOutR"].map(key=>(
                            <td key={key} style={{padding:"10px 8px",border:"1px solid #e2e8f0",textAlign:"center"}}>
                              <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"#fff",border:"1px solid rgba(217,217,217,0.8)",borderRadius:4,padding:"5px 8px",width:89,boxSizing:"border-box"}}>
                                <input value={svcBen[rowLabel][key]} onChange={e=>setSBVal(rowLabel,key,e.target.value)} placeholder="-" style={{border:"none",outline:"none",width:"100%",font:"400 12px/18px Roboto",color:"rgba(0,0,0,0.88)",background:"transparent",padding:0}} />
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </EEAccordion>

              {/* ── Additional Coverage ── */}
              <EEAccordion open={addlCovOpen} onToggle={()=>setAddlCovOpen(v=>!v)} title="Additional Coverage" sub="Secondary Coverage Information" editIcon bodyPadding="16px 16px 20px 45px">
                {addlCov.map((ac,i)=>{
                  const CalIcon2 = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><rect x="3.5" y="5" width="17" height="15" rx="2" stroke="#94a3b8" strokeWidth="1.6"/><path d="M3.5 9.5h17M8 3.5v3.5M16 3.5v3.5" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round"/></svg>;
                  const Lbl = ({label}) => <span style={{font:"400 12px/16px Roboto",color:"rgba(0,0,0,0.45)"}}>{label}</span>;
                  const Inp = ({value,onChange,placeholder,style}) => <input value={value} onChange={onChange} placeholder={placeholder||""} style={{border:"1px solid #d7dee7",borderRadius:4,padding:"5px 8px",font:"400 13px/18px Roboto",color:"rgba(0,0,0,0.88)",outline:"none",background:"#fff",boxSizing:"border-box",...style}} />;
                  return (
                    <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1.2fr auto",gap:16,alignItems:"end",marginBottom:16}}>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        <Lbl label="Plan Name" />
                        <Inp value={ac.planName} onChange={e=>setAC(i,"planName",e.target.value)} style={{width:"100%"}} />
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        <Lbl label="Payor ID" />
                        <Inp value={ac.payorId} onChange={e=>setAC(i,"payorId",e.target.value)} style={{width:"100%"}} />
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        <Lbl label="Member ID" />
                        <Inp value={ac.memberId} onChange={e=>setAC(i,"memberId",e.target.value)} style={{width:"100%"}} />
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        <Lbl label="Coverage Date" />
                        <div style={{display:"flex",alignItems:"center",gap:6,border:"1px solid #d7dee7",borderRadius:4,padding:"5px 8px",background:"#fff",boxSizing:"border-box"}}>
                          <input type="date" className="ma-date" value={toDateInput(ac.covStart)} onChange={e=>setAC(i,"covStart",fromDateInput(e.target.value))} style={{border:"none",outline:"none",font:"400 13px/18px Roboto",color:"rgba(0,0,0,0.88)",background:"transparent",flex:1,minWidth:0,padding:0}} />
                          <span style={{color:"#94a3b8",flexShrink:0,fontSize:11}}>–</span>
                          <input type="date" className="ma-date" value={toDateInput(ac.covEnd)} onChange={e=>setAC(i,"covEnd",fromDateInput(e.target.value))} style={{border:"none",outline:"none",font:"400 13px/18px Roboto",color:"rgba(0,0,0,0.88)",background:"transparent",flex:1,minWidth:0,padding:0}} />
                          <CalIcon2 />
                        </div>
                      </div>
                      <div style={{paddingBottom:2}}>
                        {i>0
                          ? <button type="button" onClick={()=>setAddlCov(l=>l.filter((_,j)=>j!==i))} style={{border:"none",background:"transparent",cursor:"pointer",padding:4}}><TrashIcon /></button>
                          : <div style={{width:24}} />}
                      </div>
                    </div>
                  );
                })}
                <button type="button" onClick={()=>setAddlCov(l=>[...l,{planName:"",payorId:"",memberId:"",covStart:"",covEnd:""}])} style={{background:"transparent",border:"none",color:"#1677FF",font:"500 13px/18px Roboto",cursor:"pointer",padding:"4px 0 0",display:"block"}}>+ Add one more additional Coverage</button>
              </EEAccordion>

              {/* ── PCP Information ── */}
              <EEAccordion open={pcpOpen} onToggle={()=>setPcpOpen(v=>!v)} title="PCP Information" sub="primary care physician information" editIcon bodyPadding="16px 16px 20px 45px">
                {pcpLines.map((pcp,i)=>{
                  const F = ({label,fkey,style}) => (
                    <div style={{display:"flex",flexDirection:"column",gap:6,...style}}>
                      <span style={{font:"400 12px/16px Roboto",color:"rgba(0,0,0,0.45)",whiteSpace:"nowrap"}}>{label}</span>
                      <div style={{display:"flex",alignItems:"center",border:"1px solid #d7dee7",borderRadius:4,padding:"5px 8px",background:"#fff"}}>
                        <input value={pcp[fkey]} onChange={e=>setPcp(i,fkey,e.target.value)} style={{border:"none",outline:"none",flex:1,font:"400 13px/18px Roboto",color:"rgba(0,0,0,0.88)",background:"transparent",padding:0,minWidth:0}} />
                      </div>
                    </div>
                  );
                  return (
                    <div key={i} style={{display:"grid",gridTemplateColumns:"repeat(12,1fr)",gap:14,rowGap:14}}>
                      {i>0 && <div style={{gridColumn:"1/-1",borderTop:"1px solid #e2e8f0",marginTop:4}}></div>}
                      {/* Row 1 — names + phone + groups (each 2 cols of 12) */}
                      <F label="Physician First Name"  fkey="firstName"  style={{gridColumn:"span 2"}} />
                      <F label="Physician Middle Name" fkey="middleName" style={{gridColumn:"span 2"}} />
                      <F label="Physician Last Name"   fkey="lastName"   style={{gridColumn:"span 2"}} />
                      <F label="Phone Number"          fkey="phone"      style={{gridColumn:"span 2"}} />
                      <F label="PCP Group #"           fkey="pcpGroup1"  style={{gridColumn:"span 2"}} />
                      <F label="PCP Group #"           fkey="pcpGroup2"  style={{gridColumn:"span 2"}} />
                      {/* Row 2 — address (addr1=4, addr2=4, city=2, state=1, zip=1 = 12) */}
                      <F label="Address Line 1" fkey="addr1" style={{gridColumn:"span 4"}} />
                      <F label="Address Line 2" fkey="addr2" style={{gridColumn:"span 4"}} />
                      <F label="City"           fkey="city"  style={{gridColumn:"span 2"}} />
                      <F label="State"          fkey="state" style={{gridColumn:"span 1"}} />
                      <F label="Zipcode"        fkey="zip"   style={{gridColumn:"span 1"}} />
                    </div>
                  );
                })}
                <button type="button" onClick={()=>setPcpLines(l=>[...l,newPcp()])} style={{background:"transparent",border:"none",color:"#1677FF",font:"500 13px/18px Roboto",cursor:"pointer",padding:"16px 0 0",display:"block"}}>+ Add one more PCP Information</button>
              </EEAccordion>
            </div>
          )}
        </div>
        {/* ── Footer ── */}
        <div style={{flexShrink:0,background:"#F8FAFC",borderTop:"1px solid #e0e8f1",padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:12}}>
          <button type="button" onClick={onClose} style={{border:"1px solid #cdd6e0",background:"#fff",color:"#475569",borderRadius:6,padding:"8px 22px",font:"500 13px/18px Roboto",cursor:"pointer"}}>cancel</button>
          <button type="button" onClick={doSave} style={{border:"none",background:"#2563eb",color:"#fff",borderRadius:6,padding:"8px 28px",font:"500 13px/18px Roboto",cursor:"pointer"}}>Save</button>
        </div>
      </div>
      {docsOpen && (
        <div style={{width:388,flexShrink:0,background:"#fff",borderLeft:"1px solid #e8eef4",display:"flex",flexDirection:"column",height:"100%"}}>
          <div style={{flexShrink:0,padding:"20px 24px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid #eef2f7"}}>
            <span style={{font:"600 18px/24px Roboto",color:"#1c2d42",flex:1}}>Documents</span>
            <button type="button" onClick={()=>setDocsOpen(false)} aria-label="Close documents" style={{border:"none",background:"transparent",cursor:"pointer",color:"#1c2d42",fontSize:20,lineHeight:1,padding:2}}>×</button>
          </div>
          <div style={{flexShrink:0,padding:"0 24px",borderBottom:"1px solid #e8eef4",display:"flex",gap:26}}>
            {["Request Docs","Response Docs"].map(t=>(
              <button key={t} type="button" onClick={()=>setDocsTab(t)} style={{background:"transparent",border:"none",cursor:"pointer",padding:"12px 2px",font:`${docsTab===t?500:400} 14px/18px Roboto`,color:docsTab===t?"#1677FF":"#5a6675",borderBottom:`2px solid ${docsTab===t?"#1677FF":"transparent"}`,marginBottom:-1}}>{t}</button>
            ))}
          </div>
          <div className="ws-scrollbody" style={{flex:1,overflow:"auto",padding:"20px 24px",display:"flex",flexDirection:"column",gap:18}}>
            <div style={{border:"1.5px dashed #9CC3F5",background:"#EAF3FE",borderRadius:10,padding:"34px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:14,textAlign:"center",cursor:"pointer"}}>
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none"><path d="M7 18.5a4.2 4.2 0 0 1-.5-8.37 5.6 5.6 0 0 1 10.8-1.03A3.9 3.9 0 0 1 17.4 18.5" stroke="#1677FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 21v-8M12 13l-2.4 2.4M12 13l2.4 2.4" stroke="#1677FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{font:"400 14px/20px Roboto",color:"#1677FF"}}>Add Files or Drop files here to<br/>upload a {docsTab==="Response Docs"?"response":"request"} doc</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12,border:"1px solid #e6ebf1",borderRadius:8,padding:"14px 16px"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 2.75h7.2L19 8.55V19.5a1.75 1.75 0 0 1-1.75 1.75H6A1.75 1.75 0 0 1 4.25 19.5v-15A1.75 1.75 0 0 1 6 2.75z" fill="#fff" stroke="#3F7EA1" strokeWidth="1.5" strokeLinejoin="round"/><path d="M13 2.9v5.1h5" stroke="#3F7EA1" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              <span style={{flex:1,font:"500 14px/18px Roboto",color:"#1c2d42"}}>{docsTab==="Response Docs"?"Eligibility Response Docs":"Eligibility Request Docs"}</span>
              <a href="#" onClick={(e)=>e.preventDefault()} style={{font:"500 14px/18px Roboto",color:"#1677FF",textDecoration:"none"}}>View</a>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}


// ── Eligibility Request View — orchestrating component ────────
function EligibilityRequestView({ batchFilter, onClearBatch, onViewBatch, onPatient, review, onExitReview, alertFilter, onClearAlert, openManageRow, onManageRowOpened, sharedInitDate, setSharedInitDate, sharedFieldFilters, setSharedFieldFilters, sharedFollowUp, setSharedFollowUp, sharedEligEntries, setSharedEligEntries }) {
  const [reviewedSet, setReviewed]  = useERV({});
  const [_followUp, _setFollowUp]    = useERV({});
  const followUp = sharedFollowUp !== undefined ? sharedFollowUp : _followUp;
  const setFollowUp = setSharedFollowUp || _setFollowUp;
  const [, setAlertBadgeTick] = useERV(0);
  useERVE(() => { const h = () => setAlertBadgeTick(n => n+1); document.addEventListener('eligAlertReviewedChange', h); return () => document.removeEventListener('eligAlertReviewedChange', h); }, []);
  // Manage-Eligibility-Request drawer: the pending row being keyed in, and a
  // map of saved payor responses (row id → entry). Saving updates the row's
  // coverage status + flips its action from Edit to View.
  const [entryRow, setEntryRow]     = useERV(null);
  const [_eligEntries, _setEligEntries] = useERV({});
  const eligEntries = sharedEligEntries !== undefined ? sharedEligEntries : _eligEntries;
  const setEligEntries = setSharedEligEntries || _setEligEntries;
  // Open manage drawer when parent pushes a pending row (e.g. from "Edit Details" in pending state)
  useERVE(() => { if (openManageRow) { setEntryRow(openManageRow); onManageRowOpened && onManageRowOpened(); } }, [openManageRow]);
  const [sortKey, setSortKey]       = useERV(null);
  const [sortDir, setSortDir]       = useERV("asc");
  const [searchQ, setSearchQ]       = useERV("");
  const [statusFilter, setStatusFilter] = useERV(null);
  const [_initDate, _setInitDate]     = useERV(()=>window.defaultDateRange([...new Set(ERV_ROWS.map(r=>r.eligInit))],30));
  const initDate = sharedInitDate !== undefined ? sharedInitDate : _initDate;
  const setInitDate = setSharedInitDate || _setInitDate;
  const [atFilter, setAtFilter]     = useERV(null);
  const [atReasonFilter, setAtReasonFilter] = useERV(null);
  // Sync a reason filter pushed in from the Eligibility Dashboard automation
  // alerts (single reason, or a whole Terminated/Failed group) into the local
  // reason filter so the funnel pill + dropdown selection stay in sync.
  React.useEffect(() => {
    if (!alertFilter) return;
    if (alertFilter.type === "atReason") { setAtReasonFilter([alertFilter.reason]); setAtFilter("warning"); setStatusFilter(null); }
    else if (alertFilter.type === "status") { setStatusFilter(alertFilter.status); setAtFilter(null); setAtReasonFilter(null); }
    else if (alertFilter.type === "followup") { setStatusFilter(null); setAtFilter(null); setAtReasonFilter(null); }
    else if (alertFilter.type === "at") {
      const na = (typeof window !== "undefined" && window.computeEligNA) ? window.computeEligNA() : { termReasons:[], failReasons:[] };
      const grp = alertFilter.group === "failed" ? na.failReasons : na.termReasons;
      setAtReasonFilter(grp.map(x => x[0])); setAtFilter("warning"); setStatusFilter(null);
    }
  }, [alertFilter]);
  const [modeFilter, setModeFilter] = useERV("all");
  const [viewTab, setViewTab] = useERV("post");
  const gridScrollRef = useERVR(null);
  const [gridW, setGridW] = useERV(0);
  const [hchb, setHchb] = useERV(()=>ervIsHCHB());
  useERVE(()=>{ const h=()=>setHchb(ervIsHCHB()); document.addEventListener("demoVersionChange",h); return ()=>document.removeEventListener("demoVersionChange",h); },[]);
  useERVE(()=>{ if (hchb) { setEntryRow(null); setStatusFilter(s => s==="pending" ? null : s); } },[hchb]);
  // Mouse wheel scrolls the frozen-column grid sideways (native listener: React's
  // onWheel is passive, so preventDefault there would not stop the page scroll).
  useERVE(()=>{
    const el = gridScrollRef.current;
    if (!el || !hchb) return;
    const onWheel = (ev) => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0 || ev.deltaX !== 0) return;
      if ((ev.deltaY > 0 && el.scrollLeft < max) || (ev.deltaY < 0 && el.scrollLeft > 0)) {
        el.scrollLeft = Math.max(0, Math.min(max, el.scrollLeft + ev.deltaY));
        ev.preventDefault();
      }
    };
    el.addEventListener("wheel", onWheel, { passive:false });
    return () => el.removeEventListener("wheel", onWheel);
  },[hchb, viewTab]);
  // Child accordions stay inside the visible area while the grid scrolls sideways.
  useERVE(()=>{
    const el = gridScrollRef.current;
    if (!el) return;
    const measure = () => setGridW(el.clientWidth);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  },[hchb, viewTab]);
  const [_fieldFilters, _setFieldFilters] = useERV([]);
  const fieldFilters = sharedFieldFilters !== undefined ? sharedFieldFilters : _fieldFilters;
  const setFieldFilters = setSharedFieldFilters || _setFieldFilters;
  const [page, setPage]             = useERV(1);
  const [expandedId, setExpandedId] = useERV(null);
  const toggleExpand = (id) => setExpandedId(cur => cur === id ? null : id);

  const toggleReviewed = (id) => setReviewed(s => ({ ...s, [id]: !s[id] }));
  const onFollowUp = (id, v) => setFollowUp(s => ({ ...s, [id]: v }));
  const onSort = (k) => {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  // Compute live counts: chips + AT counts use the mode-filtered dataset
  // as a base, then narrow further by the active status chip (All Patients
  // always shows the full filtered count).
  const modeFilteredRows = modeFilter === "automated"
    ? ERV_ROWS.filter(r => r.mode === "gear")
    : modeFilter === "manual"
      ? ERV_ROWS.filter(r => r.mode === "person")
      : ERV_ROWS;
  // HCHB: pending-submission records never appear.
  const versionRows = hchb ? modeFilteredRows.filter(r => r.cov !== "pending") : modeFilteredRows;
  // A batch opened from the Eligibility Batch View scopes the whole page, so it
  // must be applied before the status strip / AT counts are derived.
  const batchRows = (batchFilter && batchFilter.ids) ? versionRows.filter(r => batchFilter.ids.includes(r.id)) : versionRows;
  const scopedRows = batchRows.filter(r => fieldFilters.every(f => f.values.includes(r[f.field])));
  const searchedRows = searchQ ? scopedRows.filter(r=>[r.name,r.mrn,r.memId,r.payorSrc,r.payor].join(" ").toLowerCase().includes(searchQ.toLowerCase())) : scopedRows;
  const ERV_AT_MAP = { completed:"thumb", warning:"warning", inprogress:"hourglass" };
  const countsBase = atFilter ? searchedRows.filter(r => r.at === ERV_AT_MAP[atFilter]) : searchedRows;
  const ervCounts = getERVCounts(countsBase, statusFilter);

  // Apply filters
  const ERV_STAGES = ["Eligibility data extraction","Submitted to payor","Response parsing","Coverage update in EHR","Exception review"];
  const ERV_SERVICE_LINES = ["Home Health","Hospice","Personal Care"];
  let rows = searchedRows.map((r, i) => {
    const e = eligEntries[r.id];
    const n = parseInt(String(r.id).replace(/\D/g,""), 10) || (i+1);
    return { ...r,
      txnType: n % 3 === 0 ? "RECERT" : "SOC",
      stage: (batchFilter && batchFilter.ids) ? "" : ERV_STAGES[n % ERV_STAGES.length],
      episodeId: "EP" + String(100000 + n * 37),
      serviceLine: ERV_SERVICE_LINES[n % ERV_SERVICE_LINES.length],
      hierarchy: n % 4 === 0 ? "Secondary" : n % 7 === 0 ? "Tertiary" : "Primary",
      ehrSync: n % 5 !== 0, followUp: followUp[r.id] !== undefined ? followUp[r.id] : r.followUp, cov: e ? e.cov : r.cov, action: e ? "view" : r.action };
  });
  if (!(batchFilter && batchFilter.ids) && initDate) rows = rows.filter(r => window.dateInRange(r.eligInit, initDate));
  if (alertFilter && alertFilter.type === "alert") rows = rows.filter(r => (r.alertList || []).includes(alertFilter.label));
  if (alertFilter && alertFilter.type === "followup") rows = rows.filter(r => r.followUp && r.followUp !== "-" && r.followUp !== "");
  if (atReasonFilter && atReasonFilter.length) rows = rows.filter(r => r.at === "warning" && atReasonFilter.includes(r.atReason));
  if (statusFilter) rows = rows.filter(r => r.cov === statusFilter || (statusFilter === "alerts" && r.alerts > 0) || (statusFilter === "all"));
  if (atFilter) rows = rows.filter(r => r.at === ERV_AT_MAP[atFilter]);
  // Review mode: only records that still need review (needs-attention automation
  // OR inactive / alerts / exception coverage) AND not yet reviewed. Checking a
  // row's Reviewed box drops it from this list; with review off, all rows show
  // and reviewed ones keep their checkmark.
  const needsReview = (r) => r.at === "warning" || r.cov === "inactive" || r.alerts > 0 || r.cov === "exception";
  if (review) rows = rows.filter(r => needsReview(r) && !reviewedSet[r.id]);
  // Sort (simple string compare)
  if (sortKey) {
    rows = [...rows].sort((a,b) => {
      const av = (a[sortKey] !== undefined && a[sortKey] !== null ? a[sortKey] : "").toString().toLowerCase();
      const bv = (b[sortKey] !== undefined && b[sortKey] !== null ? b[sortKey] : "").toString().toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Active-filter chips beside "Add More Filters" — kept in sync with the
  // summary cards + AT status. Removing a chip clears that filter.
  const chips = [];
  if (batchFilter) {
    chips.push({ id:"batch", label:`Batch ID: ${batchFilter.batch}`, onRemove: () => onClearBatch && onClearBatch() });
  }
  if (alertFilter && alertFilter.type === "followup") {
    chips.push({ id:"followupf", label:"Due For Follow Up", onRemove: () => onClearAlert && onClearAlert() });
  }
  if (alertFilter && alertFilter.type === "alert") {
    chips.push({ id:"alertf", label:`Eligibility Alert: ${alertFilter.label}`, onRemove: () => onClearAlert && onClearAlert() });
  }
  if (atReasonFilter && atReasonFilter.length) {
    atReasonFilter.forEach(rsn => chips.push({ id:"atr-"+rsn, label:`Reason: ${rsn}`, onRemove: () => { setAtReasonFilter(prev => { const nx=(prev||[]).filter(x=>x!==rsn); return nx.length?nx:null; }); if (onClearAlert) onClearAlert(); } }));
  }
  if (statusFilter) {
    const s = ERV_STATUS.find(x => x.id === statusFilter);
    const chipLabel = statusFilter === "alerts" ? "Eligibility Alerts:True" : `Status: ${s ? s.label : statusFilter}`;
    chips.push({ id:"status", label: chipLabel, onRemove: () => setStatusFilter(null) });
  }
  if (atFilter) {
    const a = ERV_AT.find(x => x.id === atFilter);
    chips.push({ id:"at", label:`AT Status: ${a ? a.label : atFilter}`, onRemove: () => { setAtFilter(null); setAtReasonFilter(null); if (onClearAlert) onClearAlert(); } });
  }
  if (review) {
    [
      { id:"rv-at",   label:"Automation Status: Needs Attention" },
      { id:"rv-inact",label:"Coverage Status: Inactive Coverage" },
      { id:"rv-alert",label:"Coverage Status: Eligibility Alerts" },
      { id:"rv-exc",  label:"Coverage Status: Exceptions" },
      { id:"rv-nr",   label:"Reviewed : Not Reviewed" },
    ].forEach(c => chips.push({ ...c, onRemove: () => onExitReview && onExitReview() }));
  }

  // Pre tab reuses the pre-eligibility check list, with the shared Pre/Post header.
  if (viewTab === "pre") {
    const Pre = window.IntakePreEligibilityView;
    if (!Pre) return <div style={{background:"#fff",padding:"24px",font:"400 13px/18px Roboto",color:"#94a3b8"}}>Loading pre-eligibility view…</div>;
    return <Pre review={review} headerNode={<ERVPreHeader viewTab={viewTab} onViewTab={setViewTab} />} />;
  }

  return (
    <div style={{background:"#fff",overflowX: hchb ? "hidden" : "visible",maxWidth:"100%"}}>
      <ERVFilterBar chips={chips} filterFields={ERV_FILTER_FIELDS} filterRows={ERV_ROWS} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters} datePicker={{label:"Elig Initiated Date", value:initDate, available:[...new Set(ERV_ROWS.map(r=>r.eligInit))], onChange:setInitDate}} onClearFilters={review ? (()=>onExitReview&&onExitReview()) : null} searchValue={searchQ} onSearch={setSearchQ} />
      <div style={{padding:"20px 24px 0",display:"flex",alignItems:"flex-start",gap:32,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 380px",minWidth:0}}>
          <ERVTitleCluster activeStatus={statusFilter} onClearStatus={()=>setStatusFilter(null)} modeFilter={modeFilter} onModeFilter={setModeFilter} viewTab={viewTab} onViewTab={setViewTab} hchb={hchb} />
        </div>
        <div style={{flex:"0 1 auto",minWidth:0,display:"flex",justifyContent:"flex-end"}}>
          <ERVStatusStrip hchb={hchb} counts={ervCounts} activeStatus={statusFilter} onPick={(v)=>{ setStatusFilter(v); if(v) setAtFilter(null); }} />
        </div>
      </div>
      <div style={{padding:"8px 24px",display:"flex",justifyContent:"flex-end",position:"relative",top:-8}}>
        <ERVAutomationStatus counts={ervCounts} atFilter={atFilter} onFilter={(v)=>{ setAtFilter(v); if(v) setStatusFilter(null); if(!v) setAtReasonFilter(null); }} statusActive={!!statusFilter} atReasonFilter={atReasonFilter} naFilteredCount={(atReasonFilter && atReasonFilter.length) ? scopedRows.filter(r => r.at === "warning" && atReasonFilter.includes(r.atReason)).length : 0} onApply={(reasons)=>{ setStatusFilter(null); setAtFilter("warning"); setAtReasonFilter(reasons && reasons.length ? reasons : null); if (onClearAlert) onClearAlert(); }} />
      </div>
      <div style={{padding:"0 24px 24px",maxWidth:"100%",minWidth:0}}>
      <div ref={gridScrollRef} className={hchb ? "ws-hscroll" : undefined} style={{overflowX: hchb ? "scroll" : "visible",overflowY:"visible",width:"100%",maxWidth:"100%",minWidth:0,paddingBottom: hchb ? 8 : 0}}>
        <div style={{minWidth: hchb ? ervTotalWidth(true) : "auto"}}>
        <ERVTableHeader sortKey={sortKey} sortDir={sortDir} onSort={onSort} hchb={hchb} />
        {(() => { const Body = hchb ? (({children})=><div>{children}</div>) : ScrollBody; return (
        <Body>
          {rows.length === 0 ? (
            <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>
              No eligibility requests match the current filters.
            </div>
          ) : rows.map((r, i) => (
            <React.Fragment key={r.id}>
              <ERVTableRow
                row={r}
                index={i}
                onPatient={(r)=>onPatient&&onPatient({...r, followUpDate: followUp[r.id] || r.followUp})}
                hchb={hchb}
                onViewBatch={batchFilter ? (()=>onViewBatch && onViewBatch(batchFilter)) : null}
                onManage={hchb ? null : setEntryRow}
                reviewed={!!reviewedSet[r.id]}
                onReviewed={toggleReviewed}
                onFollowUp={onFollowUp}
                expanded={expandedId === r.id}
                onToggle={toggleExpand}
              />
              {expandedId === r.id && (hchb
                ? <div style={{position:"sticky",left:0,width:gridW || "100%",maxWidth:gridW || "100%",overflow:"hidden"}}><ERVChildSection row={r} onPatient={onPatient} /></div>
                : <ERVChildSection row={r} onPatient={onPatient} />)}
            </React.Fragment>
          ))}
          <div style={{padding:"16px 24px",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} of 120 patients shown</div>
        </Body>
        ); })()}
        </div>
      </div>
      </div>
      {entryRow && (
        <EligEntryDrawer
          row={entryRow}
          patient={{ name:entryRow.name, mrn:entryRow.mrn, memberId:entryRow.memId, payorType:entryRow.payor, payorSource:entryRow.payorSrc, gateway:(entryRow.gw && entryRow.gw!=="") ? entryRow.gw : undefined }}
          initialEntry={eligEntries[entryRow.id]}
          onSave={(e)=>{ setEligEntries(m=>({ ...m, [e.id]: e })); onPatient&&onPatient(entryRow,e); }}
          onNoteAdded={(date)=>setFollowUp(s=>({...s,[entryRow.id]:date}))}
          onClose={()=>setEntryRow(null)}
        />
      )}
    </div>
  );
}

Object.assign(window, { EligibilityRequestView, ERVFilterBar, ERV_FILTER_FIELDS, SortArrows });
