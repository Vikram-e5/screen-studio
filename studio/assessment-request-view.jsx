// Assessment Request View — replicates Eligibility Request View end to end.
// Data vocabulary from the iQIES OASIS / HOPE Final Validation Reports.
// Prefix: ASV… (nothing here may collide with ERV… / ARV… / CDM…).
const { useState: useASV, useEffect: useASVE, useRef: useASVR } = React;

// ── Mock data ─────────────────────────────────────────────────
// submitted = Submission Date (MM/DD/YY, matching the rest of the prototype)
const ASV_ROWS = [
  { id:"a1",  name:"Marvin Mckinney",    mrn:"B6100062245601", facilityId:"292477", branchCode:"25Q7085007", episodeId:"Epi23456", submissionId:"67337593", txnType:"New Record",    source:"OASIS Console", msgNum:"", msgSev:"", valStatus:"accepted",  at:"thumb",     docs:true,  submitted:"07/28/26" },
  { id:"a2",  name:"Esther Howard",      mrn:"B6789012345678", facilityId:"292477", branchCode:"25Q7085003", episodeId:"I1J2K3L4", submissionId:"67337593", txnType:"Modification", source:"OASIS Console", msgNum:"-909",  msgSev:"Warning", valStatus:"accepted",   at:"hourglass", docs:false, submitted:"07/28/26" },
  { id:"a3",  name:"Wade Warren",        mrn:"B6789012345685", facilityId:"257085", branchCode:"25Q7085011", episodeId:"TY964257", submissionId:"67337594", txnType:"New Record",    source:"OASIS Console", msgNum:"", msgSev:"", valStatus:"accepted",  at:"warning",   docs:true,  submitted:"07/27/26" },
  { id:"a4",  name:"Cameron Williamson", mrn:"B6100054445634", facilityId:"257085", branchCode:"25Q7085002", episodeId:"K7L8M9N0", submissionId:"67337594", txnType:"Inactivation", source:"OASIS Console", msgNum:"-3060", msgSev:"Fatal",   valStatus:"rejected",  at:"warning",   docs:true,  submitted:"07/27/26" },
  { id:"a5",  name:"Robert Fox",         mrn:"V6789012345686", facilityId:"292477", branchCode:"25Q7085005", episodeId:"G3H4I5J6", submissionId:"10561695", txnType:"Add",          source:"HOPE Console",  msgNum:"", msgSev:"", valStatus:"accepted",  at:"thumb",     docs:false, submitted:"07/26/26" },
  { id:"a6",  name:"Jenny Wilson",       mrn:"B6789012345711", facilityId:"292477", branchCode:"25Q7085001", episodeId:"M5N6O7P8", submissionId:"10561695", txnType:"Modify",       source:"HOPE Console",  msgNum:"-812",  msgSev:"Warning", valStatus:"accepted",   at:"hourglass", docs:true,  submitted:"07/26/26" },
  { id:"a7",  name:"Jacob Jones",        mrn:"B6789012345716", facilityId:"257085", branchCode:"25Q7085007", episodeId:"Y7Z8A9B0", submissionId:"67337595", txnType:"New Record",    source:"OASIS Console", msgNum:"-3010", msgSev:"Fatal",   valStatus:"rejected",  at:"warning",   docs:false, submitted:"07/25/26" },
  { id:"a8",  name:"Leslie Alexander",   mrn:"B6789012345697", facilityId:"257085", branchCode:"25Q7085003", episodeId:"S5T6U7V8", submissionId:"67337595", txnType:"Modification", source:"OASIS Console", msgNum:"", msgSev:"", valStatus:"accepted" , at:"warning",   docs:true,  submitted:"07/25/26" },
  { id:"a9",  name:"Guy Hawkins",        mrn:"L700093345918",  facilityId:"292477", branchCode:"25Q7085011", episodeId:"A3B4C5D6", submissionId:"10561696", txnType:"Add",          source:"HOPE Console",  msgNum:"", msgSev:"", valStatus:"accepted",  at:"thumb",     docs:true,  submitted:"07/24/26" },
  { id:"a10", name:"Jane Cooper",        mrn:"B6789012345720", facilityId:"292477", branchCode:"25Q7085005", episodeId:"Q9R0S1T2", submissionId:"10561696", txnType:"Inactivate",   source:"HOPE Console",  msgNum:"-909",  msgSev:"Warning", valStatus:"accepted",   at:"hourglass", docs:false, submitted:"07/24/26" },
  { id:"a11", name:"Kristin Watson",     mrn:"B6789012345801", facilityId:"257085", branchCode:"25Q7085002", episodeId:"TY964258", submissionId:"67337596", txnType:"New Record",    source:"OASIS Console", msgNum:"", msgSev:"", valStatus:"accepted",  at:"hourglass", docs:true,  submitted:"07/23/26" },
  { id:"a12", name:"Cody Fisher",        mrn:"B6789012345802", facilityId:"257085", branchCode:"25Q7085001", episodeId:"K7L8M9N1", submissionId:"67337596", txnType:"Modification", source:"OASIS Console", msgNum:"-3140", msgSev:"Fatal",   valStatus:"rejected",  at:"warning",   docs:true,  submitted:"07/23/26" },
  { id:"a13", name:"Kathryn Murphy",     mrn:"B6789012345803", facilityId:"292477", branchCode:"25Q7085007", episodeId:"G3H4I5J7", submissionId:"10561697", txnType:"Add",          source:"HOPE Console",  msgNum:"", msgSev:"", valStatus:"accepted",  at:"thumb",     docs:false, submitted:"07/22/26" },
  { id:"a14", name:"Devon Lane",         mrn:"B6789012345804", facilityId:"292477", branchCode:"25Q7085003", episodeId:"M5N6O7P9", submissionId:"10561697", txnType:"Modify",       source:"HOPE Console",  msgNum:"", msgSev:"", valStatus:"accepted" , at:"warning",   docs:true,  submitted:"07/22/26" },
  { id:"a15", name:"Dianne Russell",     mrn:"B6789012345805", facilityId:"257085", branchCode:"25Q7085011", episodeId:"Y7Z8A9B1", submissionId:"67337597", txnType:"New Record",    source:"OASIS Console", msgNum:"-812",  msgSev:"Warning", valStatus:"accepted",   at:"hourglass", docs:true,  submitted:"07/21/26" },
  { id:"a16", name:"Arlene McCoy",       mrn:"B6789012345806", facilityId:"257085", branchCode:"25Q7085005", episodeId:"S5T6U7V9", submissionId:"67337597", txnType:"Modification", source:"OASIS Console", msgNum:"", msgSev:"", valStatus:"accepted",  at:"thumb",     docs:false, submitted:"07/21/26" },
  { id:"a17", name:"Theresa Webb",       mrn:"B6789012345901", facilityId:"292477", branchCode:"25Q7085002", episodeId:"Epi99001", submissionId:"10561698", txnType:"Add",          source:"HOPE Console",  msgNum:"", msgSev:"", valStatus:"accepted",  at:"thumb",     docs:true,  submitted:"07/20/26" },
  { id:"a18", name:"Darlene Robertson",  mrn:"B6789012345902", facilityId:"292477", branchCode:"25Q7085001", episodeId:"Epi99002", submissionId:"10561698", txnType:"Inactivate",   source:"HOPE Console",  msgNum:"-3060", msgSev:"Fatal",   valStatus:"rejected",  at:"warning",   docs:true,  submitted:"07/20/26" },
  { id:"a19", name:"Courtney Henry",     mrn:"B6789012345903", facilityId:"257085", branchCode:"25Q7085007", episodeId:"Epi99003", submissionId:"67337598", txnType:"New Record",    source:"OASIS Console", msgNum:"", msgSev:"", valStatus:"accepted",  at:"thumb",     docs:false, submitted:"07/19/26" },
  { id:"a20", name:"Ralph Edwards",      mrn:"B6789012345904", facilityId:"257085", branchCode:"25Q7085003", episodeId:"Epi99004", submissionId:"67337598", txnType:"Modification", source:"OASIS Console", msgNum:"-909",  msgSev:"Warning", valStatus:"accepted",   at:"hourglass", docs:true,  submitted:"07/19/26" },
  { id:"a21", name:"Annette Black",      mrn:"B6789012345905", facilityId:"292477", branchCode:"25Q7085011", episodeId:"Epi99005", submissionId:"10561699", txnType:"Add",          source:"HOPE Console",  msgNum:"", msgSev:"", valStatus:"accepted" , at:"warning",   docs:true,  submitted:"07/18/26" },
  { id:"a22", name:"Marvin Mckinney",    mrn:"B6100062245601", facilityId:"292477", branchCode:"25Q7085005", episodeId:"Epi23457", submissionId:"10561699", txnType:"Modify",       source:"HOPE Console",  msgNum:"", msgSev:"", valStatus:"accepted",  at:"thumb",     docs:false, submitted:"07/18/26" },
];
if (typeof window !== "undefined") window.ASV_ROWS = ASV_ROWS;

// ── Child (accordion) transactions ────────────────────────────
// OASIS RFA / HOPE reason vocabulary, derived per row so the accordion is
// consistent with the parent record's source and transaction type.
const ASV_OASIS_RFA = [
  { code:"01", type:"Start of Care",            visit:"Initial Assessment", reason:"SOC" },
  { code:"04", type:"Recertification",          visit:"Recert Visit",       reason:"RECERT" },
  { code:"05", type:"Other Follow-up",          visit:"Follow-up Visit",    reason:"FU" },
  { code:"09", type:"Discharge from Agency",    visit:"Discharge Visit",    reason:"DC" },
];
const ASV_HOPE_RFA = [
  { code:"ADM",  type:"Admission",            visit:"Admission Visit", reason:"ADM" },
  { code:"HUV1", type:"HOPE Update Visit 1",   visit:"Update Visit",    reason:"HUV1" },
  { code:"HUV2", type:"HOPE Update Visit 2",   visit:"Update Visit",    reason:"HUV2" },
  { code:"DC",   type:"Discharge",             visit:"Discharge Visit", reason:"DC" },
];
function asvShiftDate(mdy, days) {
  const p = String(mdy).split("/"); if (p.length !== 3) return mdy;
  const d = new Date(2000 + Number(p[2]), Number(p[0]) - 1, Number(p[1]));
  d.setDate(d.getDate() + days);
  return String(d.getMonth() + 1).padStart(2, "0") + "/" + String(d.getDate()).padStart(2, "0") + "/" + String(d.getFullYear()).slice(2);
}
// Assessment Init Date sits two days before the submission date for every record.
// The HOPE Submission tab owns Robert Fox in full — he is cut from OASIS Submission.
const ASV_HOPE_NAMES = ["Robert Fox","Esther Howard","Wade Warren","Cameron Williamson","Jenny Wilson","Jacob Jones","Leslie Alexander","Guy Hawkins"];
// Same patient name, varied AT × Validation combinations.
const ASV_HOPE_EXTRA = [
  { at:"thumb",     valStatus:"accepted",  msgNum:"",      msgSev:"",        docs:false, txnType:"Add" },
  { at:"thumb",     valStatus:"accepted" , msgNum:"-905",  msgSev:"Warning", docs:true,  txnType:"Modify" },
  { at:"warning",   valStatus:"rejected",  msgNum:"-3010", msgSev:"Fatal",   docs:false, txnType:"Add" },
  { at:"warning",   valStatus:"accepted",  msgNum:"-812",  msgSev:"Warning", docs:true,  txnType:"Modify" },
  { at:"hourglass", valStatus:"accepted",  msgNum:"",      msgSev:"",        docs:false, txnType:"Inactivate" },
  { at:"hourglass", valStatus:"accepted" , msgNum:"-905",  msgSev:"Warning", docs:true,  txnType:"Add" },
  { at:"warning",   valStatus:"rejected" , msgNum:"-3020", msgSev:"Fatal",   docs:true,  txnType:"Modify" },
  { at:"thumb",     valStatus:"rejected",  msgNum:"-3011", msgSev:"Fatal",   docs:false, txnType:"Add" },
].map((v,i)=>({
  ...v,
  id: "h"+(i+1),
  name: ASV_HOPE_NAMES[i % ASV_HOPE_NAMES.length],
  mrn: "V67890123457" + String(20+i),
  facilityId: i%2 ? "257085" : "292477",
  branchCode: "25Q708500" + ((i%5)+1),
  episodeId: "HPE" + (94210+i*7),
  submissionId: String(10561700+i),
  source: "HOPE Console",
  submitted: asvShiftDate("07/26/26", -(i%4)),
}));
ASV_ROWS.push(...ASV_HOPE_EXTRA);
ASV_ROWS.forEach(r => { r.asmtInit = asvShiftDate(r.submitted, -2); });
ASV_ROWS.forEach((r, i) => { r.agency = "Agency " + ((i % 4) + 1); });
// M0090 / Visit / Eff dates now sit at the record level.
ASV_ROWS.forEach(r => {
  r.m0090     = asvShiftDate(r.submitted, -31);
  r.visitDate = asvShiftDate(r.submitted, -33);
  r.effDate   = r.source === "HOPE Console" ? "" : r.visitDate;
  if (r.source === "HOPE Console") {
    const hv = ASV_HOPE_RFA[(r.mrn.charCodeAt(r.mrn.length-1)) % ASV_HOPE_RFA.length] || {};
    r.targetDate = asvShiftDate(r.submitted, 5);
    r.visitType  = hv.visit  || "Admission Visit";
    r.reasonCode = hv.reason || "ADM";
  }
});

const ASV_WS_LOCATIONS = ["Dallas – North","Dallas – Central","Plano Branch","Fort Worth – East","Arlington Branch"];
const ASV_PAYORS = ["Aetna Better Health","Humana Gold Plus","UnitedHealthcare","Medicare Part A","BCBS Texas"];
const ASV_WS_TASKS = ["SOC Assessment","Recert Assessment","Resumption of Care","Discharge Assessment","Follow-Up Assessment"];

function asvChildRows(row) {
  const set = row.source === "HOPE Console" ? ASV_HOPE_RFA : ASV_OASIS_RFA;
  const n = 1;
  return Array.from({ length: n }, (_, i) => {
    const r = set[(i + row.id.length) % set.length];
    const base = asvShiftDate(row.submitted, -(30 * (i + 1)));
    const seed = row.id.charCodeAt(row.id.length - 1) + i;
    return {
      rfaCode: r.code, rfaType: r.type, visitType: r.visit, reasonCode: r.reason,
      wsLocation: ASV_WS_LOCATIONS[seed % ASV_WS_LOCATIONS.length],
      payorName: ASV_PAYORS[(seed + 2) % ASV_PAYORS.length],
      wsTask: ASV_WS_TASKS[(seed + 1) % ASV_WS_TASKS.length],
      asmtDate: asvShiftDate(base, -2),
      ccn: String(457000 + ((seed * 137) % 42000)),
      txnArrived: base,
      m0090: asvShiftDate(base, -1),
      visitDate: asvShiftDate(base, -3),
      effDate: asvShiftDate(base, -3),
      txnEnd: i === 0 && row.at === "hourglass" ? "" : asvShiftDate(base, 1),
      targetDate: asvShiftDate(base, -2),
      txnType: row.txnType,
    };
  });
}

// ── Needs-Attention reasons (mirrors the Eligibility Request View) ──
const ASV_NA_TERM_LABELS = [
  "Assessment rejected by iQIES validation",
  "Duplicate assessment already accepted",
  "Assessment locked pending clinician sign-off",
];
const ASV_NA_FAIL_LABELS = [
  "iQIES submission service unavailable",
  "Unable to load the iQIES portal",
  "Session timed out during submission",
];
const ASV_NA_ALL = ASV_NA_TERM_LABELS.map(l=>[l,"terminated"]).concat(ASV_NA_FAIL_LABELS.map(l=>[l,"failed"]));
(function(){
  let i = 0;
  ASV_ROWS.forEach(r=>{ if(r.at==="warning"){ if(!r.atReason){ const p = ASV_NA_ALL[i % ASV_NA_ALL.length]; r.atReason = p[0]; r.atGroup = p[1]; } i++; } });
})();
// Records still being processed by automation have no validation result yet.
ASV_ROWS.forEach(r=>{ if(r.at==="hourglass") r.valStatus = "pending"; });
function computeAsvNA(rows) {
  rows = rows || ASV_ROWS;
  const failSet = new Set(ASV_NA_FAIL_LABELS);
  const term = {}, fail = {};
  rows.forEach(r=>{
    if (r.at !== "warning") return;
    const reason = r.atReason || "Unspecified reason";
    const grp = r.atGroup || (failSet.has(reason) ? "failed" : "terminated");
    if (grp === "failed") fail[reason] = (fail[reason]||0)+1; else term[reason] = (term[reason]||0)+1;
  });
  const sorted = m => Object.entries(m).sort((a,b)=>b[1]-a[1]);
  const termReasons = sorted(term), failReasons = sorted(fail);
  const sum = l => l.reduce((s,x)=>s+x[1],0);
  return { termReasons, failReasons, termTotal:sum(termReasons), failTotal:sum(failReasons) };
}
if (typeof window !== "undefined") window.computeAsvNA = computeAsvNA;

// Assessment ID, 3-letter Branch and the submitted XML file name (M0040).
const ASV_BRANCHES = ["NTX","STX","DAL","FTW","PLN","AUS"];
ASV_ROWS.forEach((r,i)=>{
  r.assessmentId = "ASM" + String(i+1).padStart(6,"0");
  r.branch = ASV_BRANCHES[i % ASV_BRANCHES.length];
  r.xmlFile = (r.source==="HOPE Console" ? "HOPE" : "OASIS") + "_M0040_" + r.submissionId + "_" + String(i+1).padStart(3,"0") + ".xml";
});

// ── Helpers ───────────────────────────────────────────────────
const asvPad = (n) => String(n).padStart(2, "0");
const ASV_AT_MAP = { completed:"thumb", warning:"warning", intervention:"intervention", inprogress:"hourglass" };
function asvCountsFor(rows) {
  return {
    all:       rows.length,
    accepted:  rows.filter(r=>r.valStatus==="accepted").length,
    warning:   rows.filter(r=>r.valStatus==="warning").length,
    rejected:  rows.filter(r=>r.valStatus==="rejected").length,
    pending:   rows.filter(r=>r.valStatus==="pending").length,
    at: {
      completed:  asvPad(rows.filter(r=>r.at==="thumb").length),
      needsAttn:  asvPad(rows.filter(r=>r.at==="warning").length),
      inProgress: asvPad(rows.filter(r=>r.at==="hourglass").length),
    },
  };
}

// ── Status summary config (Style A — validation statuses in the box) ──
const ASV_STATUS = [
  { id:"all",       label:"All Records",  color:"#64748b", weight:1.0 },
  { id:"accepted",  label:"Accepted",     color:"#16a34a", weight:1.0 },
  { id:"rejected",  label:"Rejected",     color:"#dc2626", weight:1.0 },
  { id:"pending",   label:"In Progress",      color:"#3f7ba8", weight:1.0 },
];

// ── Filter fields ─────────────────────────────────────────────
// HOPE Submission drops the OASIS-only date fields and adds its own two.
function asvFilterFields(hope) {
  if (!hope) return ASV_FILTER_FIELDS;
  return ASV_FILTER_FIELDS
    .filter(f => f.key!=="m0090" && f.key!=="effDate")
    .concat([{ key:"visitType", label:"Visit Type" }, { key:"reasonCode", label:"Reason Code" }]);
}
const ASV_FILTER_FIELDS = [
  { key:"agency",      label:"Agency" },
  { key:"source",      label:"Source" },
  { key:"txnType",     label:"Type of Transaction" },
  { key:"facilityId",  label:"Facility ID" },
  { key:"branch",      label:"Branch" },
  { key:"submissionId",label:"Submission ID" },
  { key:"m0090",       label:"M0090 Date" },
  { key:"visitDate",   label:"Visit Date" },
  { key:"effDate",     label:"Eff Date" },
  { key:"msgSev",      label:"Message No. / Severity" },
];

// ── Filter bar ────────────────────────────────────────────────
function ASVFilterBar({ chips=[], datePicker, fieldFilters=[], onFieldFilters, onClearFilters, searchValue="", onSearch, hope, filterRows }) {
  const [open, setOpen] = useASV(false);
  const [dpOpen, setDpOpen] = useASV(false);
  const dref = useASVR(null);
  useASVE(()=>{ if(!dpOpen) return; const h=e=>{ if(dref.current&&!dref.current.contains(e.target)) setDpOpen(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[dpOpen]);
  const DP = typeof window!=="undefined" && window.DatePicker;
  const FP = typeof window!=="undefined" && window.FilterPopover;
  const fields = asvFilterFields(hope);
  const labelOf = k => (fields.find(f=>f.key===k)||{}).label || k;
  const Chip = ({ label, onRemove }) => (
    <span style={{display:"inline-flex",alignItems:"center",gap:6,background:"#fff",border:"1px solid #93c5e8",borderRadius:4,padding:"4px 8px",font:"400 12px/16px Roboto",color:"#0f172a",whiteSpace:"nowrap",flexShrink:0}}>
      {label}
      {onRemove && <button type="button" onClick={onRemove} style={{background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#94a3b8",font:"400 13px/13px Roboto"}}>×</button>}
    </span>
  );
  return (
    <div style={{background:"#eef4fb",borderBottom:"1px solid #e2e8f0",padding:"10px 24px",display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap"}}>
      <div style={{position:"relative",flexShrink:0}} ref={dref}>
        <button type="button" onClick={()=>setDpOpen(v=>!v)} style={{background:"#fff",border:"1px solid #d8d8d8",borderRadius:4,padding:"5px 12px",font:"400 12px/16px Roboto",color:"#0f172a",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,whiteSpace:"nowrap"}}>
          {datePicker.label} : {datePicker.value ? datePicker.value.start + " – " + datePicker.value.end : "All"}
          <span style={{color:"#94a3b8",fontSize:9}}>▾</span>
        </button>
        {dpOpen && DP && <DP value={datePicker.value} available={datePicker.available} onChange={d=>{ datePicker.onChange(d); setDpOpen(false); }} />}
      </div>
      <div style={{position:"relative",flexShrink:0}}>
        <button type="button" onClick={()=>setOpen(v=>!v)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:6,padding:"5px 4px",whiteSpace:"nowrap"}}>
          <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:"#2563eb",color:"#fff",fontSize:10,fontWeight:600,lineHeight:1}}>+</span>
          Add More Filters
        </button>
        {open && FP && <FP fields={fields} rows={filterRows||ASV_ROWS} initial={fieldFilters} onApply={f=>{ onFieldFilters(f); setOpen(false); }} onClose={()=>setOpen(false)} />}
      </div>
      <div className="chip-scroll" style={{display:"flex",alignItems:"center",gap:8,overflowX:"auto",minWidth:0,flex:1}}>
        {chips.map((c,i)=><Chip key={"c"+i} label={c.label} onRemove={c.onRemove} />)}
        {fieldFilters.map((f,i)=><Chip key={"f"+i} label={labelOf(f.field)+": "+f.values.join(", ")} onRemove={()=>onFieldFilters(fieldFilters.filter((_,j)=>j!==i))} />)}
      </div>
      {onClearFilters && <button type="button" onClick={onClearFilters} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",padding:"5px 4px",flexShrink:0,whiteSpace:"nowrap"}}>Clear all</button>}
      <div style={{position:"relative",flexShrink:0}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)"}}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" value={searchValue} onChange={e=>onSearch(e.target.value)} placeholder="Search Patient Records" style={{width:240,background:"#fff",border:"1px solid #93c5e8",borderRadius:6,padding:"6px 12px 6px 30px",font:"400 12px/16px Roboto",color:"#0f172a",outline:"none"}} />
      </div>
    </div>
  );
}

// ── Title cluster ─────────────────────────────────────────────
const ASV_MODE_OPTIONS = [
  { id:"all",   label:"All Assessments" },
  { id:"oasis", label:"OASIS Assessments" },
  { id:"hope",  label:"HOPE Assessments" },
];
const ASV_VIEW_TABS = [
  { id:"submission", label:"OASIS Submission" },
  { id:"hopesub",    label:"HOPE Submission" },
  { id:"editlock",   label:"Edit Lock" },
];
function ASVViewTabs({ value="submission", onChange }) {
  return (
    <div style={{display:"flex",alignItems:"center",marginTop:12}}>
      {ASV_VIEW_TABS.map((t,i)=>{
        const active = value===t.id;
        const first = i===0, last = i===ASV_VIEW_TABS.length-1;
        return (
          <button key={t.id} type="button" onClick={()=>onChange&&onChange(t.id)}
            style={{position:"relative",zIndex:active?2:1,background:"#fff",border:`1px solid ${active?"#2563eb":"#d8dee6"}`,marginLeft:first?0:-1,borderRadius:`${first?6:0}px ${last?6:0}px ${last?6:0}px ${first?6:0}px`,padding:"7px 20px",font:`${active?500:400} 14px/18px Roboto`,color:active?"#2563eb":"#0f172a",cursor:"pointer",whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function ASVTitleCluster({ modeFilter, onModeFilter, viewTab, onViewTab }) {
  return (
    <div>
      <div style={{display:"flex",alignItems:"baseline",gap:6,flexWrap:"wrap"}}>
        <span style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Assessment Request View</span>
      </div>
      <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Status Summary of Assessments Submitted to iQIES</div>
      <ASVViewTabs value={viewTab} onChange={(t)=>{ onViewTab && onViewTab(t); }} />
    </div>
  );
}

// ── Validation status summary strip ───────────────────────────
function ASVStatusStrip({ counts, activeStatus, onPick }) {
  return (
    <div style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",overflow:"hidden"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333",flexShrink:0}}>
        <span>Validation</span><span>Status</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-start"}}>
        {ASV_STATUS.map(s=>{
          const active = s.id!=="all" && activeStatus===s.id;
          const dim = activeStatus && activeStatus!=="all" && !active;
          return (
            <div key={s.id} role="button" title={s.label} onClick={()=>onPick(active?null:s.id)}
              style={{flex:"0 0 auto",width:124,boxSizing:"border-box",padding:"10px 16px 12px",cursor:"pointer",opacity:(dim&&s.id!=="all")?0.35:1,transition:"opacity .12s,background .12s",background:active?"#f8fafc":"transparent"}}
              onMouseEnter={e=>{ if(!active&&!dim) e.currentTarget.style.background="#fafbfc"; }}
              onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
              <div style={{height:3,borderRadius:2,background:s.color,opacity:active?1:0.85,marginBottom:8,marginLeft:-9,marginRight:-9}}></div>
              <div style={{display:"flex",alignItems:"center",gap:5,font:"400 12px/16px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#333",whiteSpace:"nowrap"}}>{s.label}</div>
              <div style={{font:"600 18px/22px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#0f172a",marginTop:4}}>{asvPad(counts[s.id]||0)}</div>
              {activeStatus && activeStatus!=="all" && s.id==="all" && (
                <button type="button" onClick={e=>{ e.stopPropagation(); onPick(null); }} style={{marginTop:4,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}><span style={{fontSize:11}}>↻</span>Reset</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Automation (AT) status strip ──────────────────────────────
const ASV_AT = [
  { id:"completed",  label:"Completed",       key:"completed",  get icon(){ return (window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png"; } },
  { id:"warning",    label:"Needs Attention", key:"needsAttn",  get icon(){ return (window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png"; }, num:"#d97706", caret:true },
  { id:"inprogress", label:"In Progress",     key:"inProgress", get icon(){ return (window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png"; } },
];
function ASVAutomationStatus({ counts, atFilter, onFilter, statusActive, atReasonFilter, onApply, naFilteredCount }) {
  const at = counts.at;
  const [openMenu, setOpenMenu] = useASV(false);
  const rootRef = useASVR(null);
  useASVE(()=>{ if(!openMenu) return; const h=e=>{ if(rootRef.current && !rootRef.current.contains(e.target)) setOpenMenu(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[openMenu]);
  const NAMenu = typeof window!=="undefined" && window.ARVNeedsAttentionMenu;
  const asvNa = computeAsvNA();
  const reasonActive = atReasonFilter && atReasonFilter.length;
  return (
    <div ref={rootRef} style={{display:"flex",alignItems:"center",font:"400 13px/16px Roboto",color:"#333",justifyContent:"flex-end"}}>
      <span style={{color:"#94a3b8",marginRight:12}}>Automation (AT) Status :</span>
      {ASV_AT.map((s,i)=>{
        const active = atFilter===s.id, dim = atFilter && !active;
        return (
          <React.Fragment key={s.id}>
            {i>0 && <span style={{width:1,height:18,background:"#e2e8f0",margin:"0 12px"}}></span>}
            <button type="button" title={s.label} onClick={()=>onFilter(active?null:s.id)} style={{background:"transparent",border:"none",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,padding:"2px 6px",borderRadius:4,opacity:dim?0.4:1,transition:"opacity .12s",position:"relative"}}>
              <img src={s.icon} alt="" title={s.label} style={{width:18,height:18,objectFit:"contain"}} />
              <span style={{color:"#0f172a",fontSize:14}}>{s.label}</span>
              {s.id==="warning" && reasonActive
                ? <span style={{display:"inline-flex",alignItems:"center",gap:7,background:"#FBF3DE",borderRadius:8,padding:"3px 12px"}}>
                    <img src={(window.__resources&&window.__resources.pbFilterIconLegacy)||"icons/filter.svg"} alt="" style={{width:16,height:16,objectFit:"contain"}} />
                    <span style={{fontWeight:600,color:"#5c5c5c",fontSize:15}}>{asvPad(naFilteredCount||0)}</span>
                  </span>
                : <span style={{fontWeight:600,color:s.num||"#0f172a"}}>{at[s.key]}</span>}
              {s.caret && (
                <span style={{position:"relative",display:"inline-flex"}}>
                  <span title="Sub-status breakdown" onClick={e=>{ e.stopPropagation(); setOpenMenu(o=>!o); }}
                    style={{width:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#2563eb"}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{width:20,height:20}}><path d="M5 8 L19 8 L12 17 Z" fill="currentColor" /></svg>
                  </span>
                  {openMenu && NAMenu && <NAMenu disabled={!!statusActive} na={asvNa} selectedReasons={atReasonFilter} onApply={onApply} naCount={parseInt(at.needsAttn,10)||0} onClose={()=>setOpenMenu(false)} />}
                </span>
              )}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Cells ─────────────────────────────────────────────────────
const ASV_VAL = {
  accepted:  { bg:"#f0fdf4", bd:"#16a34a", c:"#16a34a", label:"Accepted" },
  rejected:  { bg:"#fef2f2", bd:"#dc2626", c:"#dc2626", label:"Rejected" },
  pending:   { bg:"#eaf2f8", bd:"#3f7ba8", c:"#3f7ba8", label:"In Progress" },
};
function ASVValPill({ kind }) {
  const s = ASV_VAL[kind] || ASV_VAL.accepted;
  return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"4px 12px",borderRadius:4,background:s.bg,border:`1px solid ${s.bd}`,color:s.c,font:"500 11px/16px Roboto",whiteSpace:"nowrap",width:"100%",minWidth:140,boxSizing:"border-box"}}>{s.label}</span>;
}
function ASVATIcon({ kind }) {
  const res = (typeof window!=="undefined" && window.__resources) || {};
  if (kind==="thumb")     return <img title="Completed"       alt="Completed"       src={res.atCompleted||"icons/at-completed.png"} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind==="warning")   return <img title="Needs Attention" alt="Needs Attention" src={res.atNeedsAttention||"icons/at-needs-attention.png"} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind==="intervention") { const G = typeof window!=="undefined" && window.RCDInterventionGlyph; return G ? <span title="Needs Intervention" style={{display:"inline-flex"}}><G size={18} /></span> : <img title="Needs Intervention" alt="Needs Intervention" src={res.mdiUser||"icons/mdi-user.png"} style={{width:16,height:16,objectFit:"contain"}} />; }
  if (kind==="hourglass") return <img title="In Progress"     alt="In Progress"     src={res.atInProgress||"icons/at-in-progress.png"} style={{width:18,height:18,objectFit:"contain"}} />;
  return <span style={{color:"#cbd5e1"}}>—</span>;
}
function ASVDocIcon({ faded }) {
  return <img src={(window.__resources&&window.__resources.attachmentType)||"icons/attachment-type.svg"} width="18" height="18" alt="" style={{display:"block",opacity:faded?0.35:1}} />;
}
const asvDash = <span style={{color:"#cbd5e1"}}>—</span>;

// ── Table geometry ────────────────────────────────────────────
const ASV_COLS = [
  { key:"name",         label:"Patient Name",            grid:"minmax(130px,1.3fr)", sortable:true  },
  { key:"assessmentId", label:"Assessment ID",           grid:"minmax(100px,1fr)",   sortable:true  },
  { key:"mrn",          label:"MRN",                     grid:"minmax(120px,1.2fr)", sortable:true  },
  { key:"agency",       label:"Agency",                  grid:"minmax(78px,0.8fr)",  sortable:true  },
  { key:"facilityId",   label:"Facility ID",             grid:"minmax(72px,0.72fr)", sortable:true  },
  { key:"branch",       label:"Branch",                  grid:"minmax(70px,0.7fr)",  sortable:true  },
  { key:"asmtInit",     label:"Assessment Init Date",    grid:"minmax(96px,0.96fr)", sortable:true  },
  { key:"submitted",    label:"Submission Date",         grid:"minmax(96px,0.96fr)", sortable:true  },
  { key:"m0090",        label:"M0090 Date",              grid:"minmax(88px,0.88fr)", sortable:true  },
  { key:"visitDate",    label:"Visit Date",              grid:"minmax(84px,0.84fr)", sortable:true  },
  { key:"effDate",      label:"Eff Date",                grid:"minmax(80px,0.8fr)",  sortable:true  },
  { key:"xmlFile",      label:"XML File Name (M0040)",   grid:"minmax(200px,2fr)",   sortable:true  },
  { key:"msgSev",       label:"Message No. / Severity",  grid:"minmax(110px,1.1fr)", sortable:true  },
  { key:"at",           label:"AT Status",               grid:"72px",                sortable:false, align:"center" },
  { key:"valStatus",    label:"Validation Status",       grid:"152px",               sortable:true  },
  { key:"docs",         label:"Docs",                    grid:"52px",                sortable:false, align:"center" },
  { key:"reviewed",     label:"Reviewed?",               grid:"78px",                sortable:false, align:"center" },
];
// HOPE Submission swaps the three OASIS date columns for its own.
const ASV_HOPE_COLS = ASV_COLS.map(c =>
    c.key==="m0090"     ? { ...c, key:"targetDate", label:"Target Date" }
  : c.key==="visitDate" ? c
  : c.key==="effDate"   ? { ...c, key:"visitType",  label:"Visit Type", grid:"minmax(96px,0.96fr)" }
  : c);
const ASV_GRID = "31px " + ASV_COLS.map(c=>c.grid).join(" ");
const ASV_HOPE_GRID = "31px " + ASV_HOPE_COLS.map(c=>c.grid).join(" ");
// Frozen edges: caret (20px) + Patient Name on the left; the last five columns on the right.
const ASV_FREEZE_R = ["at","valStatus","docs","reviewed"];
const ASV_RIGHT_W = { at:72, valStatus:152, docs:52, reviewed:78 };
const ASV_RIGHT_OFFSET = (key)=>{ const i = ASV_FREEZE_R.indexOf(key); if(i<0) return null; let x=0; for(let j=ASV_FREEZE_R.length-1;j>i;j--) x += ASV_RIGHT_W[ASV_FREEZE_R[j]]; return x; };
const asvFreezeStyle = (key, bg) => {
  if (key==="caret") return { position:"sticky", left:0, zIndex:4, background:bg, paddingLeft:11 };
  if (key==="name")  return { position:"sticky", left:31, zIndex:4, background:bg, boxShadow:"2px 0 3px -1px rgba(15,23,42,0.10)" };
  const r = ASV_RIGHT_OFFSET(key);
  return r===null ? null : { position:"sticky", right:r, zIndex:4, background:bg, ...(key==="at"?{boxShadow:"-2px 0 3px -1px rgba(15,23,42,0.10)"}:null), ...(key==="reviewed"?{paddingRight:11}:null) };
};
const ASV_MIN_W = 1940;

const ASV_CHILD_COLS = [
  { key:"submissionId", label:"Submission ID", tint:true },
  { key:"episodeId",    label:"Episode ID",    tint:true },
  { key:"rfaCode",    label:"RFA Code", tint:true, oasisOnly:true },
  { key:"rfaType",    label:"RFA Type", tint:true, oasisOnly:true },
  { key:"txnType",    label:"Type of Transaction" },
  { key:"reasonCode", label:"Reason Code", tint:true, hopeOnly:true },
  { key:"wsLocation", label:"WellSky Location", wsOnly:true },
  { key:"payorName",  label:"Payor Name", wsOnly:true },
  { key:"wsTask",     label:"WellSky Task Name", wsOnly:true },
  { key:"asmtDate",   label:"Assessment Date", wsOnly:true },
  { key:"ccn",        label:"CCN", wsOnly:true },
];
// OASIS records drop Visit Type / Reason Code; HOPE records drop RFA Code / RFA Type.
function asvChildCols(row) {
  const source = typeof row === "string" ? row : row.source;
  const name = typeof row === "string" ? "" : row.name;
  const isHope = source === "HOPE Console";
  // HOPE-sourced records and Marvin Mckinney carry no WellSky scheduling fields.
  const noWs = isHope || name === "Marvin Mckinney";
  return ASV_CHILD_COLS.filter(c => (isHope ? !c.oasisOnly : !c.hopeOnly) && !(noWs && c.wsOnly));
}
const asvChildGrid = n => "repeat(2, minmax(96px,1fr)) repeat(" + (n-2) + ", minmax(100px,1fr))";

function ASVSortArrows({ active, dir }) {
  const up   = active && dir==="asc"  ? "#2563eb" : "rgba(0,0,0,0.25)";
  const down = active && dir==="desc" ? "#2563eb" : "rgba(0,0,0,0.25)";
  return (
    <svg width="10" height="15" viewBox="0 0 9 14" fill="none" style={{marginRight:3,flex:"none"}}>
      <path d="M7.74699 7.40234H1.25301C1.05823 7.40234 0.949473 7.608 1.0701 7.7484L4.31708 11.5135C4.41003 11.6213 4.58899 11.6213 4.68291 11.5135L7.9299 7.7484C8.05053 7.608 7.94177 7.40234 7.74699 7.40234Z" fill={down}></path>
      <path d="M7.9299 6.24825L4.68291 2.48317C4.58997 2.3754 4.41101 2.3754 4.31708 2.48317L1.0701 6.24825C0.949473 6.38865 1.05823 6.59431 1.25301 6.59431H7.74699C7.94177 6.59431 8.05053 6.38865 7.9299 6.24825Z" fill={up}></path>
    </svg>
  );
}

// One scroll pane for BOTH axes (so row sticky columns resolve here), height
// bounded to the viewport the same way ScrollBody does.
function ASVScrollPane({ children }) {
  const ref = React.useRef(null);
  const [maxH, setMaxH] = React.useState(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const calc = () => setMaxH(Math.max(220, Math.floor(window.innerHeight - el.getBoundingClientRect().top - 16)));
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return (
    <div ref={ref} className="chip-scroll ws-scrollbody"
      style={{ maxHeight: maxH ? maxH + "px" : undefined, height: maxH ? maxH + "px" : undefined, overflow: "auto" }}>
      {children}
    </div>
  );
}

function ASVTableHeader({ sortKey, sortDir, onSort, hope }) {
  const COLS = hope ? ASV_HOPE_COLS : ASV_COLS;
  const GRID = hope ? ASV_HOPE_GRID : ASV_GRID;
  return (
    <div style={{display:"grid",gridTemplateColumns:GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:0,gap:0,position:"sticky",top:0,zIndex:6,boxShadow:"0 1px 0 #e2e8f0",minWidth:ASV_MIN_W}}>
      <div style={asvFreezeStyle("caret","#f8fafc")}></div>
      {COLS.map(c=>(
        <div key={c.key} onClick={c.sortable?()=>onSort(c.key):undefined} style={{font:"500 11px/14px Roboto",color:"#64748b",padding:"0 6px",display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",cursor:c.sortable?"pointer":"default",userSelect:"none",overflow:"hidden",whiteSpace:"nowrap",...asvFreezeStyle(c.key,"#f8fafc")}}>
          {c.sortable && <ASVSortArrows active={sortKey===c.key} dir={sortDir} />}
          {c.label}
        </div>
      ))}
    </div>
  );
}

function ASVChildSection({ row, hope }) {
  const rows = asvChildRows(row).map(c=>({ ...c, submissionId:c.submissionId||row.submissionId, episodeId:c.episodeId||row.episodeId }));
  const cols = asvChildCols(row);
  const grid = asvChildGrid(cols.length);
  const cell = (align, first) => ({font:"500 12px/16px Roboto",color:"#334155",display:"flex",alignItems:"center",justifyContent:align==="center"?"center":"flex-start",height:56,padding:first?"0 8px 0 24px":"0 8px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0});
  return (
    <div style={{background:"#f4f5f7",border:"1px solid #e2e8f0",borderTop:"none",borderRadius:"0 0 6px 6px",padding:"18px 20px 20px",marginBottom:8,minWidth:ASV_MIN_W}}>
      <div style={{border:"1px solid #e5e7eb",borderRadius:8,overflow:"hidden",background:"#fff"}}>
        <div style={{display:"grid",gridTemplateColumns:grid,alignItems:"stretch",borderBottom:"1px solid #e5e7eb"}}>
          {cols.map((c,i)=>(
            <div key={c.key} style={{font:"500 12px/16px Roboto",color:"#333333",display:"flex",alignItems:"center",height:44,padding:i===0?"0 8px 0 24px":"0 8px",background:"#edecf7",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0}}>{c.label}</div>
          ))}
        </div>
        {rows.map((c,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:grid,alignItems:"center",background:"#fff",borderBottom:i===rows.length-1?"none":"1px solid #eef2f7"}}>
            {cols.map((col,j)=>(
              <div key={col.key} style={{...cell("left", j===0), ...(j===0?{color:"#2563eb",fontWeight:600}:null)}}>{c[col.key] || asvDash}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ASVTableRow({ row, expanded, onToggle, onPatient, reviewed, onReviewed, onDocs, accent="#2563eb", hope }) {
  const cell = (align) => ({font:"500 12px/16px Roboto",color:"#333",padding:"0 6px",display:"flex",alignItems:"center",justifyContent:align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0});
  return (
    <div style={{marginBottom:expanded?0:8}}>
      <div style={{display:"grid",gridTemplateColumns:(hope?ASV_HOPE_GRID:ASV_GRID),alignItems:"center",height:48,padding:0,border:"1px solid #e2e8f0",borderRadius:expanded?"6px 6px 0 0":6,boxShadow:expanded?"none":"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",gap:0,transition:"box-shadow .12s",minWidth:ASV_MIN_W}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",...asvFreezeStyle("caret","#fff")}}>
          <span onClick={()=>onToggle(row.id)} title={expanded?"Collapse":"Expand"} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:accent,transition:"transform .15s",transform:expanded?"rotate(90deg)":"rotate(0deg)"}}>
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M4 2 L11 7 L4 12 Z" fill="currentColor"></path></svg>
          </span>
        </div>
        <div style={{...cell(),...asvFreezeStyle("name","#fff")}}>
          <span style={{font:"500 13px/16px Roboto",color:"#333",overflow:"hidden",textOverflow:"ellipsis"}}>{row.name}</span>
        </div>
        <div style={cell()}>{row.assessmentId || asvDash}</div>
        <div style={cell()}>{row.mrn}</div>
        <div style={cell()}>{row.agency}</div>
        <div style={{...cell(),color:"#3b82f6",fontWeight:600}}>{row.facilityId}</div>
        <div style={cell()}>{row.branch || asvDash}</div>
        <div style={cell()}>{row.asmtInit}</div>
        <div style={cell()}>{row.submitted || asvDash}</div>
        <div style={cell()}>{(hope ? row.targetDate : row.m0090) || asvDash}</div>
        <div style={cell()}>{row.visitDate || asvDash}</div>
        <div style={cell()}>{(hope ? row.visitType : row.effDate) || asvDash}</div>
        <div style={cell()} title={row.xmlFile}>{row.xmlFile || asvDash}</div>
        <div style={cell()}>{row.msgNum ? <span style={{color:row.msgSev==="Fatal"?"#dc2626":"#d97706"}}>{row.msgNum} {row.msgSev}</span> : asvDash}</div>
        <div style={{...cell("center"),...asvFreezeStyle("at","#fff")}}><ASVATIcon kind={row.at} /></div>
        <div style={{...cell(),...asvFreezeStyle("valStatus","#fff")}}><ASVValPill kind={row.valStatus} /></div>
        <div style={{...cell("center"),...asvFreezeStyle("docs","#fff"),cursor:row.docs?"pointer":"default"}} onClick={row.docs&&onDocs?()=>onDocs(row):undefined} title={row.docs?"View documents":undefined}><ASVDocIcon faded={!row.docs} /></div>
        <div style={{...cell("center"),...asvFreezeStyle("reviewed","#fff")}}>
          <span role="checkbox" aria-checked={!!reviewed} tabIndex={0} onClick={()=>onReviewed(row.id)} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:`1px solid ${reviewed?accent:"#d8d8d8"}`,borderRadius:3,background:reviewed?accent:"#fff",cursor:"pointer",transition:"all .12s"}}>
            {reviewed && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}
          </span>
        </div>
      </div>
      {expanded && <ASVChildSection row={row} hope={hope} />}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────
function ASVPagination({ total, page, perPage, onPage, onPerPage }) {
  return null;
  const pages = Math.max(1, Math.ceil(total/perPage));
  const start = total===0 ? 0 : (page-1)*perPage+1;
  const end = Math.min(page*perPage, total);
  const Btn = ({children,active,disabled,onClick}) => (
    <button type="button" onClick={onClick} disabled={disabled} style={{minWidth:28,height:28,borderRadius:4,border:`1px solid ${active?"#2563eb":"#e2e8f0"}`,background:active?"#2563eb":"#fff",color:active?"#fff":disabled?"#cbd5e1":"#333",font:"400 12px/16px Roboto",cursor:disabled?"default":"pointer",padding:"0 6px"}}>{children}</button>
  );
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #e2e8f0",padding:"12px 24px",gap:16}}>
      <span style={{font:"400 12px/16px Roboto",color:"#94a3b8"}}>Showing {start}–{end} of {total}</span>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <select value={perPage} onChange={e=>onPerPage(Number(e.target.value))} style={{height:28,border:"1px solid #e2e8f0",borderRadius:4,font:"400 12px/16px Roboto",color:"#333",background:"#fff",padding:"0 6px"}}>
          {[10,15,20,50].map(n=><option key={n} value={n}>{n} / page</option>)}
        </select>
        <Btn onClick={()=>onPage(page-1)} disabled={page===1}>‹</Btn>
        {Array.from({length:Math.min(pages,5)},(_,i)=>i+1).map(n=><Btn key={n} active={n===page} onClick={()=>onPage(n)}>{n}</Btn>)}
        <Btn onClick={()=>onPage(page+1)} disabled={page===pages}>›</Btn>
      </div>
    </div>
  );
}


// ── Edit Lock tab ─────────────────────────────────────────────
const ELK_PAYOR_TYPE   = ["MEDICARE","COMMERCIAL INSURANCE"];
const ELK_PAYOR_SOURCE = {
  "MEDICARE": ["NGS PDGM","CGS PDGM"],
  "COMMERCIAL INSURANCE": ["UNITED HEALTHCARE MEDICARE","COMMONWEALTH CARE ALLIANCE","TUFTS HEALTH PLAN SENIOR CARE","TUFTS HEALTH ONE CARE"],
};
const ELK_EVENT_TYPE   = ["SOC","RECERT","RESUMPTION OF CARE"];
const ELK_REASONS      = ["Record not locked due to alert pop-up","Unable to process the record after '5' attempts"];
const ELK_INT_REASONS  = ["Clinician sign-off pending in HCHB","Assessment opened by another user","Payor source mismatch — manual review required"];
const elkAtOf = (r,i) => (i%4===3 && r.at!=="thumb") ? "intervention" : r.at;
const ELK_ROWS = ASV_ROWS.map((r,i)=>({
  id: "elk"+i,
  mrn: r.mrn,
  name: r.name,
  branchId: r.branchCode,
  asmtInit: r.asmtInit,
  payorType: ELK_PAYOR_TYPE[i % ELK_PAYOR_TYPE.length],
  payorSource: (src => src[(i*3+1) % src.length])(ELK_PAYOR_SOURCE[ELK_PAYOR_TYPE[i % ELK_PAYOR_TYPE.length]]),
  eventType: ELK_EVENT_TYPE[(i+2) % ELK_EVENT_TYPE.length],
  hchbArrived: r.asmtInit,
  lastAttempt: r.asmtInit + " " + asvPad(7+(i%9)) + ":" + asvPad((i*13)%60) + " AM",
  reason: elkAtOf(r,i)==="intervention" ? ELK_INT_REASONS[i % ELK_INT_REASONS.length] : r.at==="warning" ? ELK_REASONS[i % ELK_REASONS.length] : "",
  payorSourceLink: true,
  at: elkAtOf(r,i),
}));

const ELK_COLS = [
  { key:"name",        label:"Patient Name",                   grid:"minmax(130px,1.3fr)", sortable:true  },
  { key:"mrn",         label:"MRN",                            grid:"minmax(120px,1.2fr)", sortable:true  },
  { key:"branchId",    label:"Branch ID",                      grid:"minmax(88px,0.85fr)", sortable:true  },
  { key:"asmtInit",    label:"Assessment Init Date",           grid:"minmax(104px,1fr)",   sortable:true  },
  { key:"payorType",   label:"Payor Type",                     grid:"minmax(96px,0.95fr)", sortable:true  },
  { key:"payorSource", label:"Payor Source",                   grid:"minmax(104px,1fr)",   sortable:true  },
  { key:"eventType",   label:"Event Type",                     grid:"minmax(104px,1fr)",   sortable:true  },
  { key:"hchbArrived", label:"HCHB Arrived Date",              grid:"minmax(104px,1fr)",   sortable:true  },
  { key:"lastAttempt", label:"Last Attempt On",                grid:"minmax(120px,1.2fr)", sortable:true  },
  { key:"reason",      label:"Reason for Failure/Termination",  grid:"minmax(160px,1.7fr)", sortable:true  },
  { key:"at",          label:"AT Status",                      grid:"72px",                sortable:false, align:"center" },
  { key:"reviewed",    label:"Reviewed?",                      grid:"78px",                sortable:false, align:"center" },
];
const ELK_GRID = ELK_COLS.map(c=>c.grid).join(" ");

// Box-style automation summary — mirrors the HH/HO Notifications clickable summary.
const ELK_AT_STATUS = [
  { id:"all",        label:"All Records",     color:"#64748b" },
  { id:"completed",  label:"Completed",       color:"#16a34a" },
  { id:"warning",    label:"Needs Attention", color:"#d97706", caret:true },
  { id:"intervention", label:"Needs Intervention", color:"#7c5cc4", caret:true },
  { id:"inprogress", label:"In Progress",     color:"#3f7ba8" },
];
function ELKAutomationStatus({ atCounts, atFilter, onFilter, subMenuRows, reasonFilter, onReasonFilter }) {
  const [openMenu, setOpenMenu] = useASV(false);
  const rootRef = useASVR(null);
  useASVE(()=>{ if(!openMenu) return; const h=e=>{ if(rootRef.current && !rootRef.current.contains(e.target)) setOpenMenu(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[openMenu]);
  const NAMenuCmp = typeof window!=="undefined" && window.NAReasonMenu;
  const breakdownFor = (atKind) => { const b = {}; (subMenuRows||[]).filter(r=>r.at===atKind).forEach(r=>{ const k=r.reason||"Unspecified"; b[k]=(b[k]||0)+1; }); return Object.keys(b).map(k=>({ label:k, count:b[k] })); };
  return (
    <div ref={rootRef} style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333",flexShrink:0,borderRadius:"8px 0 0 8px"}}>
        <span>Automation</span><span>(AT) Status</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-start"}}>
        {ELK_AT_STATUS.map(s=>{
          const active = s.id!=="all" && atFilter===s.id;
          const dim = atFilter && atFilter!=="all" && !active;
          return (
            <div key={s.id} role="button" title={s.label} onClick={()=>onFilter(active?null:(s.id==="all"?null:s.id))}
              style={{position:"relative",flex:"0 0 auto",width:s.id==="intervention"?176:s.caret?152:132,boxSizing:"border-box",padding:"10px 16px 12px",cursor:"pointer",opacity:(dim&&s.id!=="all")?0.35:1,transition:"opacity .12s,background .12s",background:active?"#f8fafc":"transparent"}}
              onMouseEnter={e=>{ if(!active&&!dim) e.currentTarget.style.background="#fafbfc"; }}
              onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
              <div style={{height:3,borderRadius:2,background:s.color,opacity:active?1:0.85,marginBottom:8,marginLeft:-9,marginRight:-9}}></div>
              <div style={{display:"flex",alignItems:"center",gap:5,font:"400 12px/16px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#333",whiteSpace:"nowrap"}}>
                {s.id!=="all" && <ASVATIcon kind={ASV_AT_MAP[s.id]} />}
                {s.label}
                {s.caret && (
                  <span title="Sub-status breakdown" onClick={e=>{ e.stopPropagation(); setOpenMenu(o=>o===s.id?false:s.id); }} style={{width:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#2563eb",marginLeft:1}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 8 L19 8 L12 17 Z" fill="currentColor"></path></svg>
                  </span>
                )}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4,marginTop:4}}>
                <span style={{font:"600 18px/22px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#0f172a"}}>{asvPad(atCounts[s.id]||0)}</span>
              </div>
              {atFilter && atFilter!=="all" && s.id==="all" && (
                <button type="button" onClick={e=>{ e.stopPropagation(); onFilter(null); }} style={{marginTop:4,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}><span style={{fontSize:11}}>↻</span>Reset</button>
              )}
              {s.caret && openMenu===s.id && NAMenuCmp && (
                <NAMenuCmp reasons={breakdownFor(ASV_AT_MAP[s.id])} selected={reasonFilter} onApply={sel=>{ onReasonFilter && onReasonFilter(sel); onFilter(s.id); }} onClose={()=>setOpenMenu(false)} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ELKTableHeader({ sortKey, sortDir, onSort }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:ELK_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",gap:8,position:"sticky",top:0,zIndex:5,boxShadow:"0 1px 0 #e2e8f0"}}>
      {ELK_COLS.map(c=>(
        <div key={c.key} onClick={c.sortable?()=>onSort(c.key):undefined} style={{font:"500 11px/14px Roboto",color:"#64748b",padding:"0 6px",display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",cursor:c.sortable?"pointer":"default",userSelect:"none",overflow:"hidden",whiteSpace:"nowrap"}}>
          {c.sortable && <ASVSortArrows active={sortKey===c.key} dir={sortDir} />}
          {c.label}
        </div>
      ))}
    </div>
  );
}

function ELKTableRow({ row, reviewed, onReviewed, accent="#2563eb" }) {
  const cell = (align) => ({font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",justifyContent:align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0});
  return (
    <div style={{display:"grid",gridTemplateColumns:ELK_GRID,alignItems:"center",height:48,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:8,boxShadow:"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",gap:8}}>
      <div style={cell()} title={row.name}><span style={{overflow:"hidden",textOverflow:"ellipsis",font:"500 13px/16px Roboto"}}>{row.name}</span></div>
      <div style={cell()}>{row.mrn}</div>
      <div style={{...cell(),color:"#3b82f6",fontWeight:600}}>{row.branchId}</div>
      <div style={cell()}>{row.asmtInit}</div>
      <div style={cell()}>{row.payorType}</div>
      <div style={cell()} title={row.payorSource}><span style={{overflow:"hidden",textOverflow:"ellipsis",color:"#2563eb"}}>{row.payorSource}</span></div>
      <div style={cell()}>{row.eventType}</div>
      <div style={cell()}>{row.hchbArrived}</div>
      <div style={cell()}>{row.lastAttempt}</div>
      <div style={cell()} title={row.reason}><span style={{overflow:"hidden",textOverflow:"ellipsis",color:!row.reason?"#cbd5e1":row.at==="intervention"?"#6d4bb5":"#b45309"}}>{row.reason || "—"}</span></div>
      <div style={cell("center")}><ASVATIcon kind={row.at} /></div>
      <div style={cell("center")}>
        <span role="checkbox" aria-checked={!!reviewed} tabIndex={0} onClick={()=>onReviewed(row.id)} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:`1px solid ${reviewed?accent:"#d8d8d8"}`,borderRadius:3,background:reviewed?accent:"#fff",cursor:"pointer"}}>
          {reviewed && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}
        </span>
      </div>
    </div>
  );
}

function ASVEditLockTable({ searchQ, initDate, fieldFilters, atFilter, reasonFilter }) {
  const [sortKey, setSortKey] = useASV(null);
  const [sortDir, setSortDir] = useASV("asc");
  const [reviewedSet, setReviewedSet] = useASV({});
  const [page, setPage] = useASV(1);
  const [perPage, setPerPage] = useASV(15);
  const dateInRange = (typeof window!=="undefined" && window.dateInRange) || (()=>true);
  const handleSort = k => { if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };
  useASVE(()=>{ setPage(1); }, [searchQ, initDate, atFilter, reasonFilter, perPage]);

  let base = ELK_ROWS.filter(r=>dateInRange(r.asmtInit, initDate));
  if (searchQ) base = base.filter(r=>[r.name,r.mrn,r.branchId,r.payorType,r.payorSource,r.eventType,r.reason].join(" ").toLowerCase().includes(searchQ.toLowerCase()));
  const atCounts = { all: base.length };
  ELK_AT_STATUS.filter(s=>s.id!=="all").forEach(s=>{ atCounts[s.id] = base.filter(r=>r.at===ASV_AT_MAP[s.id]).length; });
  let rows = atFilter ? base.filter(r=>r.at===ASV_AT_MAP[atFilter]) : base;
  if (reasonFilter && reasonFilter.length) rows = rows.filter(r=>(r.at==="warning"||r.at==="intervention") && reasonFilter.includes(r.reason||"Unspecified"));
  if (sortKey) rows = [...rows].sort((a,b)=>{ const av=String(a[sortKey]||""), bv=String(b[sortKey]||""); return sortDir==="asc"?av.localeCompare(bv):bv.localeCompare(av); });
  const total = rows.length;
  const paged = rows;
  const ScrollBody = typeof window!=="undefined" && window.ScrollBody;
  const Body = ({children}) => ScrollBody ? <ScrollBody>{children}</ScrollBody> : <div style={{overflowY:"auto",flex:1}}>{children}</div>;
  return { atCounts, node: (
    <React.Fragment>
      <div style={{padding:"12px 24px 0",flex:1,minHeight:0,display:"flex",flexDirection:"column"}}>
        <ELKTableHeader sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
        <Body>
          {paged.length===0
            ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8"}}>No edit lock records match the current filters.</div>
            : paged.map(r=><ELKTableRow key={r.id} row={r} reviewed={!!reviewedSet[r.id]} onReviewed={id=>setReviewedSet(s=>({...s,[id]:!s[id]}))} />)}
        </Body>
      </div>
      <ASVPagination total={total} page={page} perPage={perPage} onPage={p=>setPage(Math.max(1,Math.min(p,Math.max(1,Math.ceil(total/perPage)))))} onPerPage={setPerPage} />
    </React.Fragment>
  ), rowsForMenu: base };
}

// ── Orchestrating component ───────────────────────────────────
function AssessmentRequestView({ onPatient, review }) {
  const [reviewedSet, setReviewedSet] = useASV({});
  const [expandedId, setExpandedId]   = useASV(null);
  const [sortKey, setSortKey]         = useASV(null);
  const [sortDir, setSortDir]         = useASV("asc");
  const [searchQ, setSearchQ]         = useASV("");
  const [statusFilter, setStatusFilter] = useASV(null);
  const [atFilter, setAtFilter]       = useASV(null);
  const [atReasonFilter, setAtReasonFilter] = useASV(null);
  const [modeFilter, setModeFilter]   = useASV("all");
  const [viewTab, setViewTab] = useASV("submission");
  const [elkAtFilter, setElkAtFilter] = useASV(null);
  const [elkReasonFilter, setElkReasonFilter] = useASV(null);
  const [fieldFilters, setFieldFilters] = useASV([]);
  const [page, setPage]               = useASV(1);
  const [perPage, setPerPage]         = useASV(15);
  const [initDate, setInitDate]       = useASV(()=> (window.defaultDateRange ? window.defaultDateRange([...new Set(ASV_ROWS.map(r=>r.asmtInit))], 30) : null));
  const [docsRow, setDocsRow]         = useASV(null);

  const dateInRange = (typeof window!=="undefined" && window.dateInRange) || (()=>true);
  const toggleReviewed = id => setReviewedSet(s=>({...s,[id]:!s[id]}));
  const toggleExpand = id => setExpandedId(v=>v===id?null:id);
  const handleSort = k => { if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };
  useASVE(()=>{ setPage(1); }, [searchQ, statusFilter, atFilter, atReasonFilter, modeFilter, fieldFilters, initDate, review, perPage, viewTab]);
  useASVE(()=>{ setExpandedId(null); setStatusFilter(null); setAtFilter(null); setAtReasonFilter(null); }, [viewTab]);

  // Filters compose: date ∧ source mode ∧ field filters ∧ search ∧ AT ∧ validation status
  const pool = viewTab==="hopesub"
    ? ASV_ROWS.filter(r=>r.source==="HOPE Console")
    : ASV_ROWS.filter(r=>r.source!=="HOPE Console");
  const dated = pool.filter(r=>dateInRange(r.asmtInit, initDate));
  const moded = modeFilter==="oasis" ? dated.filter(r=>r.source==="OASIS Console")
              : modeFilter==="hope"  ? dated.filter(r=>r.source==="HOPE Console")
              : dated;
  const scoped = moded.filter(r=>fieldFilters.every(f=>f.values.includes(r[f.field])));
  const searched = searchQ ? scoped.filter(r=>[r.name,r.mrn,r.agency,r.episodeId,r.submissionId,r.facilityId,r.branchCode,r.source,r.txnType].join(" ").toLowerCase().includes(searchQ.toLowerCase())) : scoped;
  const atScoped = atFilter ? searched.filter(r=>r.at===ASV_AT_MAP[atFilter]) : searched;
  const reasoned = atReasonFilter && atReasonFilter.length ? atScoped.filter(r=>r.at==="warning" && atReasonFilter.includes(r.atReason)) : atScoped;
  const counts = { ...asvCountsFor(reasoned), all: searched.length, at: asvCountsFor(searched).at };
  let rows = statusFilter && statusFilter!=="all" ? reasoned.filter(r=>r.valStatus===statusFilter) : reasoned;
  if (review) rows = rows.filter(r=>r.at==="warning" || r.valStatus==="rejected");

  if (sortKey) rows = [...rows].sort((a,b)=>{ const av=String(a[sortKey]||""), bv=String(b[sortKey]||""); return sortDir==="asc"?av.localeCompare(bv):bv.localeCompare(av); });

  const total = rows.length;
  const paged = rows;

  const chips = [];
  if (statusFilter && statusFilter!=="all") chips.push({ label:"Validation: "+((ASV_STATUS.find(s=>s.id===statusFilter)||{}).label||statusFilter), onRemove:()=>setStatusFilter(null) });
  if (atReasonFilter && atReasonFilter.length) atReasonFilter.forEach(rsn=>chips.push({ label:"Reason: "+rsn, onRemove:()=>setAtReasonFilter(prev=>{ const nx=(prev||[]).filter(x=>x!==rsn); return nx.length?nx:null; }) }));
  if (atFilter) chips.push({ label:"AT: "+((ASV_AT.find(s=>s.id===atFilter)||{}).label||atFilter), onRemove:()=>setAtFilter(null) });
  if (review) chips.push({ label:"Review Mode: Rejected & Needs Attention" });
  const anyFilter = fieldFilters.length || statusFilter || atFilter || (atReasonFilter && atReasonFilter.length);

  const ScrollBody = typeof window!=="undefined" && window.ScrollBody;
  const Body = ({children}) => ScrollBody ? <ScrollBody>{children}</ScrollBody> : <div style={{overflowY:"auto",flex:1}}>{children}</div>;
  const editLock = ASVEditLockTable({ searchQ, initDate, fieldFilters, atFilter:elkAtFilter, reasonFilter:elkReasonFilter });

  return (
    <div style={{background:"#fff",minHeight:"100%",display:"flex",flexDirection:"column"}} data-screen-label="01 Assessments">
      <ASVFilterBar
        hope={viewTab==="hopesub"}
        filterRows={pool}
        chips={chips}
        datePicker={{ label:"Assessment Init Date", value:initDate, available:[...new Set(ASV_ROWS.map(r=>r.asmtInit))], onChange:setInitDate }}
        fieldFilters={fieldFilters} onFieldFilters={setFieldFilters}
        onClearFilters={anyFilter?()=>{ setFieldFilters([]); setStatusFilter(null); setAtFilter(null); setAtReasonFilter(null); }:null}
        searchValue={searchQ} onSearch={setSearchQ} />
      <div style={{padding:"18px 24px 14px",display:"flex",alignItems:"flex-start",gap:24,flexWrap:"wrap",borderBottom:"1px solid #e2e8f0"}}>
        <ASVTitleCluster modeFilter={modeFilter} onModeFilter={setModeFilter} viewTab={viewTab} onViewTab={setViewTab} />
        <div style={{marginLeft:"auto",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
          {viewTab==="editlock" ? (
            <ELKAutomationStatus atCounts={editLock.atCounts} atFilter={elkAtFilter} onFilter={v=>{ setElkAtFilter(v); if(!v) setElkReasonFilter(null); }} subMenuRows={editLock.rowsForMenu}
              reasonFilter={elkReasonFilter} onReasonFilter={sel=>setElkReasonFilter(sel && sel.length ? sel : null)} />
          ) : (<React.Fragment>
          <ASVStatusStrip counts={counts} activeStatus={statusFilter} onPick={v=>setStatusFilter(v)} />
          <ASVAutomationStatus counts={counts} atFilter={atFilter}
            onFilter={v=>{ setAtFilter(v); if(v) setStatusFilter(null); if(!v) setAtReasonFilter(null); }}
            statusActive={!!statusFilter} atReasonFilter={atReasonFilter}
            onApply={sel=>{ setAtReasonFilter(sel && sel.length ? sel : null); setAtFilter("warning"); setStatusFilter(null); }}
            naFilteredCount={reasoned.filter(r=>r.at==="warning").length} />
          </React.Fragment>)}
        </div>
      </div>
      {viewTab==="editlock" ? editLock.node : (<React.Fragment>
      <div style={{padding:"12px 24px 0",flex:1,minHeight:0,display:"flex",flexDirection:"column"}}>
        {/* single scroller for BOTH axes so the rows' sticky columns resolve against it */}
        <ASVScrollPane>
          <div style={{minWidth:ASV_MIN_W}}>
            <ASVTableHeader sortKey={sortKey} sortDir={sortDir} onSort={handleSort} hope={viewTab==="hopesub"} />
            {paged.length===0
              ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8"}}>No records match the current filters.</div>
              : paged.map(r=>(
                <ASVTableRow key={r.id} row={r} expanded={expandedId===r.id} onToggle={toggleExpand}
                  onPatient={onPatient} reviewed={!!reviewedSet[r.id]} onReviewed={toggleReviewed} onDocs={setDocsRow} hope={viewTab==="hopesub"} />
              ))}
          </div>
        </ASVScrollPane>
      </div>
      <ASVPagination total={total} page={page} perPage={perPage} onPage={p=>setPage(Math.max(1,Math.min(p,Math.max(1,Math.ceil(total/perPage)))))} onPerPage={setPerPage} />
      </React.Fragment>)}
      {docsRow && window.ASVDocumentDrawer && <window.ASVDocumentDrawer row={docsRow} onClose={()=>setDocsRow(null)} />}
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { AssessmentRequestView, ASVATIcon, ASVSortArrows, asvCountsFor });
