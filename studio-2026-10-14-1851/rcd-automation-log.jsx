// Claims Automation Log — two tabs (PCR / Claims) sharing the eligibility
// automation-log layout. PCR rows come from window.RCD_ROWS, Claims rows from
// window.CB_ROWS, so the log never disagrees with the grids.
const { useState: useRCDL, useRef: useRCDLR, useEffect: useRCDLE } = React;

const RCD_PCR_STAGES = [
  "PCR data extraction from HCHB",
  "PCR Submission into Palmetto",
  "Extract and update DCN",
  "Extract and update UTN",
  "Download DL from Palmetto",
  "Upload DL into HCHB",
];
const RCD_CLAIM_STAGES = [
  "STAGE I - PULLING THE CLAIM BATCH FILE & EXTRACTING DATA",
  "STAGE II - BATCH VALIDATION & PARSING",
  "STAGE III - BATCH SUBMISSION TO CLEARINGHOUSE",
  "STAGE IV - EXTRACT ACKNOWLEDGEMENT & CLAIM STATUS",
  "STAGE V - UPDATE CLAIM STATUS IN WELLSKY",
];

function rcdPatientRuns(pcrRow) {
    if (!pcrRow) return [];
    const pcrKids = (typeof window!=="undefined" && window.rcdChildRows) ? window.rcdChildRows(pcrRow) : [];
    const RCD_ROWS_ = (typeof window!=="undefined" && window.RCD_ROWS) || [];
    const all = (typeof window!=="undefined" && window.rcdPcrLogRows) ? window.rcdPcrLogRows() : [];
    const found = all.find(r=>r.id===pcrRow.id);
    const rIdx = RCD_ROWS_.findIndex(r=>r.id===pcrRow.id);
    const at = pcrRow.at;
    const live = at==="hourglass" ? "In Progress"
      : at==="warning" ? (pcrRow.naGroup==="manual" ? "Manually Terminated" : "Needs Attention")
      : at==="intervention" ? "Needs Intervention" : "Completed";
    const base = found || {
      ref: "PCR" + String((rIdx>=0 ? rIdx : 7) + 1).padStart(10,"0"),
      status: live,
      et: at==="hourglass" ? "—" : "__end__",
      lastCheck: at==="thumb" ? "—" : ["2 mins ago","14 mins ago","1 hr 05 mins ago","3 hrs 20 mins ago"][Math.max(0,rIdx) % 4],
      retries: (at==="warning"||at==="intervention") ? String(1 + (Math.max(0,rIdx) % 3)) : "0",
    };
    const STAGES = (typeof window!=="undefined" && window.RCD_PCR_STAGE_LIST) || [];
    // One row per stage, in pipeline order, up to the record's current stage only.
    // A stage can repeat (e.g. extraction runs once per billing period).
    const cur = Math.max(0, STAGES.indexOf(pcrRow.stage));
    const ref = base.ref || "PCR0000008";
    const kids = pcrKids.length ? pcrKids.slice(0,2) : [null];
    const rows = [];
    for (let n=0; n<=cur; n++) {
      const reps = n===0 ? kids : [kids[0]];
      reps.forEach((k,j)=>{
        const isCur = n===cur && j===reps.length-1;
        rows.push({
          ref, wf: "PCR Submission",
          stage: STAGES[n] || ("Stage " + (n+1)),
          name: pcrRow.name, mrn: pcrRow.mrn,
          bp: String(Number(pcrRow.benefitPeriod || 1)),
          run: j,
          bpStart: k && k.bp && k.bp!=="—" ? k.bp : (pcrRow.bpStartDate || "—"),
          st: k && k.pcr ? k.pcr + " 09:39 AM" : (base.st || "—"),
          et: isCur ? (base.et || "—") : (k && k.pcr ? k.pcr + " 04:12 PM" : (base.et || "—")),
          lastCheck: isCur ? (base.lastCheck || "—") : "—",
          retries: isCur ? (base.retries || "0") : "0",
          status: isCur ? (base.status || "Completed") : "Completed",
          isCur, id: pcrRow.id, at: isCur ? pcrRow.at : "thumb",
        });
      });
    }
    // Runs are chronological (each run starts after the previous one); latest on top.
    const d0 = (()=>{ const src=(kids[0]&&kids[0].pcr&&kids[0].pcr!=="—")?kids[0].pcr:(pcrRow.episodeStartDate||""); const m=String(src).match(/(\d{2})\/(\d{2})\/(\d{2,4})/); if(!m) return new Date(2025,6,5); const y=+m[3]<100?2000+ +m[3]:+m[3]; return new Date(y,+m[1]-1,+m[2]); })();
    const fmt = (d)=> String(d.getMonth()+1).padStart(2,"0")+"/"+String(d.getDate()).padStart(2,"0")+"/"+String(d.getFullYear()%100).padStart(2,"0");
    rows.forEach((r,k)=>{
      // Each billing period runs as its own transaction, so BP 2 gets its own Ref ID.
      if (r.run) r.ref = "PCR" + String(Number(String(ref).replace(/\D/g,"")) + 1000).padStart(10,"0");
      const d = new Date(d0); d.setDate(d.getDate()+k);
      r.st = fmt(d) + " 09:39 AM";
      const isLast = k===rows.length-1;
      r.et = (isLast && r.status==="In Progress") ? "—" : fmt(d) + " 04:12 PM";
      // Elapsed check only means something while the run is still going.
      if (r.et !== "—") r.lastCheck = "—";
    });
    rows.forEach((r)=>{
      const live = r.et === "—";
      // Elapsed since the run's last timestamp (its end time, or start if still running).
      // Completed runs have nothing pending, so they show no value.
      const done = !r.isCur || r.at==="thumb";
      const pd = (s)=>{ const m=String(s).match(/(\d{2})\/(\d{2})\/(\d{2})\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i); if(!m) return null; let h=+m[4]%12; if(/PM/i.test(m[6])) h+=12; return new Date(2000+ +m[3], +m[1]-1, +m[2], h, +m[5]); };
      const since = (d)=>{ if(!d) return "—"; let mins=Math.max(1,Math.floor((Date.now()-d)/60000)); const pad=(n)=>String(n).padStart(2,"0");
        const mo=Math.floor(mins/43200); if(mo>=1){ const dd=Math.floor((mins%43200)/1440); return mo+(mo>1?" months ":" month ")+pad(dd)+" days"; }
        const dd=Math.floor(mins/1440); if(dd>=1){ const hh=Math.floor((mins%1440)/60); return dd+(dd>1?" days ":" day ")+pad(hh)+" hrs"; }
        const hh=Math.floor(mins/60); if(hh>=1) return hh+" hrs "+pad(mins%60)+" mins"; return mins+" mins"; };
      r.sinceUpdate = (done || r.at!=="hourglass") ? "—" : since(pd(live ? r.st : r.et));
      r.sinceArrived = since(pd(rows[0].st));
    });
    return rows.reverse();
}
const RCD_LOG_TABS = [{ id:"pcr", label:"PCR" }, { id:"claims", label:"Claims" }];

const RCD_PCR_COLS = [
  { key:"ref",    label:"Ref ID",         w:"150px", sort:true },
  { key:"stage",  label:"Current Stage",  w:"260px", sort:true },
  { key:"name",   label:"Patient Name",   w:"150px", sort:true },
  { key:"mrn",    label:"MRN",            w:"150px", sort:true },
  { key:"memId",  label:"Member ID",      w:"130px", sort:true },
  { key:"billingPeriodNo", label:"Billing Period", w:"120px", sort:true },
  { key:"benefitPeriodNo", label:"Benefit Period", w:"120px", sort:true },
  { key:"bpStartDate", label:"BP Start Date", w:"120px", sort:true },
  { key:"st",     label:"Start Time",     w:"150px", sort:true },
  { key:"et",     label:"End Time",       w:"150px", sort:true },
  { key:"sinceUpdate",  label:"Elapsed Time from Last Update",         w:"200px", sort:true },
  { key:"sinceArrived", label:"Elapsed Time from Transaction Arrived", w:"240px", sort:true },
  { key:"status", label:"Status",         w:"180px", sort:true },
];
const RCD_STATUS_COLOR = {
  "Submitted": "#94A3B8", "DCN received": "#8B93F0", "UTN received": "#4FC3B1",
  "Partially-Affirmed": "#91DCF7", "Affirmed": "#61AA6B",
  "Non-Affirmed": "#F87D7C", "Exception": "#F8C87C",
};
function RCDStatusPill({ value }) {
  const color = RCD_STATUS_COLOR[value] || "#CBD5E1";
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:6,font:"500 12px/16px Roboto",color:"#334155",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
      <span style={{width:8,height:8,borderRadius:"50%",background:color,flexShrink:0}}></span>{value}
    </span>
  );
}
// AT status cell for the PCR log — the same icon + wording pair the PCR grid
// shows on hover, spelled out here since the log has room for it.
function RCDLogAtStatus({ row: row0 }) {
  const row = row0.runAt ? { ...row0, at: row0.runAt } : row0;
  const tone = row.at==="intervention" ? "#b45309" : row.at==="warning" ? "#b91c1c" : "#334155";
  if (!row.at || row.at==="none") return <span style={{color:"#cbd5e1"}}>—</span>;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:7,minWidth:0}} title={row.atLabel||undefined}>
      <span style={{display:"inline-flex",flexShrink:0}}><RCDLogATIcon kind={row.at} /></span>
      <span style={{font:"500 12px/16px Roboto",color:tone,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{row.atBase||""}</span>
    </span>
  );
}
const RCD_CLAIM_COLS = [
  { key:"ref",      label:"Ref ID",        w:"140px", sort:true },
  { key:"wf",       label:"Workflow",      w:"250px", sort:true },
  { key:"stage",    label:"Current Stage", w:"330px", sort:true },
  { key:"batchId",  label:"Batch ID",      w:"140px", sort:true },
  { key:"fileName", label:"File Name",     w:"250px", sort:true },
  { key:"claims",   label:"Claims",        w:"100px", sort:true },
  { key:"gateway",  label:"Gateway",       w:"110px", sort:true },
  { key:"st",       label:"Start Time",    w:"150px", sort:true },
  { key:"et",       label:"End Time",      w:"150px", sort:true },
  { key:"at",       label:"AT Status",     w:"80px",  sort:false, align:"center" },
];
const rcdLogWidth = (cols)=>cols.reduce((a,c)=>a+parseInt(c.w,10),0) + cols.length*6 + 24;

const RCD_LOG_CARDS = [
  { id:"all",       label:"All Transactions", color:"rgb(21,95,130)",   match:()=>true,                icon:null },
  { id:"thumb",     label:"Completed",        color:"rgb(14,165,233)",  match:(r)=>r.at==="thumb",     get icon(){ return (window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png"; } },
  { id:"warning",   label:"Needs Attention",  color:"rgb(245,158,11)",  match:(r)=>r.at==="warning",   get icon(){ return (window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png"; } },
  { id:"intervention", label:"Needs Intervention", color:"rgb(217,119,6)", match:(r)=>r.at==="intervention", icon:null, glyph:true },
  { id:"hourglass", label:"In Progress",      color:"rgb(148,163,184)", match:(r)=>r.at==="hourglass", get icon(){ return (window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png"; } },
];
const RCD_PCR_FIELDS = [
  { key:"submissionType",  label:"Submission Type" },
  { key:"billingPeriodNo", label:"Billing Period #" },
  { key:"benefitPeriodNo", label:"Benefit Period #" },
  { key:"bpStartDate",     label:"BP Start Date" },
  { key:"stage",           label:"Current Stage" },
  { key:"st",              label:"Start Time" },
  { key:"et",              label:"End Time" },
];
const RCD_CLAIM_FIELDS = [
  { key:"stage",   label:"Current Stage" },
  { key:"gateway", label:"Gateway" },
  { key:"status",  label:"Batch Status" },
];
const rcdlPad = (n)=>String(n).padStart(2,"0");
// Reuse the glyph defined by rcd-request-view.jsx. Distinct local name — a global
// const named RCDInterventionGlyph here would shadow it and recurse forever.
const RCDLogGlyph = (p)=> (window.RCDInterventionGlyph ? React.createElement(window.RCDInterventionGlyph, p) : null);

function RCDLogATIcon({ kind }) {
  const res = (typeof window!=="undefined" && window.__resources) || {};
  if (kind==="thumb")     return <img title="Completed"       alt="Completed"       src={res.atCompleted||"icons/at-completed.png"} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind==="warning")   return <img title="Needs Attention" alt="Needs Attention" src={res.atNeedsAttention||"icons/at-needs-attention.png"} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind==="hourglass") return <img title="In Progress"     alt="In Progress"     src={res.atInProgress||"icons/at-in-progress.png"} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind==="intervention") return <RCDLogGlyph />;
  return <span style={{color:"#cbd5e1"}}>—</span>;
}

function RCDLogSortArrows({ active, dir }) {
  const up   = active && dir==="asc"  ? "#2563eb" : "rgba(0,0,0,0.25)";
  const down = active && dir==="desc" ? "#2563eb" : "rgba(0,0,0,0.25)";
  return (
    <svg width="10" height="15" viewBox="0 0 9 14" fill="none" style={{marginRight:3,flex:"none"}}>
      <path d="M7.74699 7.40234H1.25301C1.05823 7.40234 0.949473 7.608 1.0701 7.7484L4.31708 11.5135C4.41003 11.6213 4.58899 11.6213 4.68291 11.5135L7.9299 7.7484C8.05053 7.608 7.94177 7.40234 7.74699 7.40234Z" fill={down}/>
      <path d="M7.9299 6.24825L4.68291 2.48317C4.58997 2.3754 4.41101 2.3754 4.31708 2.48317L1.0701 6.24825C0.949473 6.38865 1.05823 6.59431 1.25301 6.59431H7.74699C7.94177 6.59431 8.05053 6.38865 7.9299 6.24825Z" fill={up}/>
    </svg>
  );
}

function RCDLogChip({ label, onRemove }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:10,background:"#f4f6f9",border:"1px solid #d8dee6",borderRadius:6,padding:"6px 10px",font:"400 12px/16px Roboto",color:"#334155",whiteSpace:"nowrap",flexShrink:0}}>
      {label}
      <button type="button" onClick={onRemove} title="Remove filter" style={{border:"none",background:"transparent",color:"#64748b",fontSize:13,lineHeight:1,cursor:"pointer",padding:0}}>✕</button>
    </span>
  );
}

function RCDAutomationLogView({ onRefClick, hideTabs, onlyClaims }) {
  const [tab, setTab] = useRCDL(onlyClaims ? "claims" : "pcr");
  const pcrSrc   = (typeof window!=="undefined" && window.RCD_ROWS) || [];
  const claimSrc = (typeof window!=="undefined" && window.CB_ROWS)  || [];

  // Same run history the patient detail's Automation Log shows — one row per stage run.
  const pcrRows = pcrSrc.flatMap((r)=> rcdPatientRuns(r).map(x=>({
    id: r.id, ref: x.ref, wf: x.wf, stage: x.stage, name: r.name, mrn: r.mrn, memId: r.medicareid,
    submissionType: r.submissionType, benefitPeriod: r.benefitPeriod, benefitPeriodNo: r.benefitPeriodNo,
    billingPeriodNo: x.run ? "2" : r.billingPeriodNo, bpStartDate: x.bpStart, billingPeriodSubmitted: r.billingPeriodSubmitted,
    status: r.status, clinician: r.clinician, st: x.st, et: x.et, sinceUpdate: x.sinceUpdate, sinceArrived: x.sinceArrived,
    // Card counts and the Status column read the same per-run value.
    at: x.isCur ? r.at : "thumb",
    atLabel: x.isCur && (typeof window!=="undefined" && window.rcdAtLabel) ? window.rcdAtLabel(r) : "",
    atBase: x.isCur ? (({ intervention:"Needs Intervention", warning:"Needs Attention", hourglass:"In Progress", thumb:"Completed", completed:"Completed" })[r.at] || "") : "Completed",
    initDate: r.txnInitDate || String(x.st).slice(0,8),
  })));
  const claimRows = claimSrc.map((r,i)=>({
    id: r.id,
    ref: "CLM" + String(i+1).padStart(10,"0"),
    wf: "Claims - Batch Submission & Acknowledgement",
    stage: RCD_CLAIM_STAGES[i % RCD_CLAIM_STAGES.length],
    batchId: r.batchId,
    fileName: r.fileName,
    claims: r.claims,
    gateway: r.gateway,
    status: r.status,
    st: r.submitted,
    et: r.at==="hourglass" ? "—" : r.submitted,
    at: r.at,
    initDate: r.submitted,
  }));

  const isPcr = tab==="pcr";
  const logRows = isPcr ? pcrRows : claimRows;
  const cols    = isPcr ? RCD_PCR_COLS : RCD_CLAIM_COLS;
  const fields  = isPcr ? RCD_PCR_FIELDS : RCD_CLAIM_FIELDS;
  const grid    = cols.map(c=>c.w).join(" ");
  const tableW  = rcdLogWidth(cols);
  const bodyKeys = cols.filter(c=>c.key!=="ref" && c.key!=="at").map(c=>c.key);
  const hasAtCol = cols.some(c=>c.key==="at");

  const [cardFilter, setCardFilter]     = useRCDL(null);
  const [dateRange, setDateRange]       = useRCDL(()=> window.defaultDateRange([...new Set(logRows.map(r=>r.initDate))], 30));
  const [searchQ, setSearchQ]           = useRCDL("");
  const [sortKey, setSortKey]           = useRCDL(null);
  const [sortDir, setSortDir]           = useRCDL("asc");
  const [fieldFilters, setFieldFilters] = useRCDL([]);
  const [fpOpen, setFpOpen]             = useRCDL(false);
  const [dpOpen, setDpOpen]             = useRCDL(false);
  const fpRef = useRCDLR(null);
  const dpRef = useRCDLR(null);
  useRCDLE(()=>{ if(!fpOpen) return; const h=(e)=>{ if(fpRef.current && !fpRef.current.contains(e.target)) setFpOpen(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[fpOpen]);
  useRCDLE(()=>{ if(!dpOpen) return; const h=(e)=>{ if(dpRef.current && !dpRef.current.contains(e.target)) setDpOpen(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[dpOpen]);
  const onSort = (k)=>{ if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };
  const switchTab = (id)=>{ setTab(id); setCardFilter(null); setFieldFilters([]); setSortKey(null); setSearchQ(""); };

  const FP = typeof window!=="undefined" && window.FilterPopover;
  const DP = typeof window!=="undefined" && window.DatePicker;
  const dateFiltered = dateRange ? logRows.filter(r=>window.dateInRange(r.initDate, dateRange)) : logRows;
  const filtered = fieldFilters.length ? dateFiltered.filter(r=>fieldFilters.every(f=>f.values.includes(r[f.field]))) : dateFiltered;
  const searched = searchQ ? filtered.filter(r=>Object.values(r).join(" ").toLowerCase().includes(searchQ.toLowerCase())) : filtered;
  const activeCard = cardFilter ? RCD_LOG_CARDS.find(c=>c.id===cardFilter) : null;
  const scoped = activeCard ? searched.filter(activeCard.match) : searched;
  const rows = sortKey ? [...scoped].sort((a,b)=>{ const av=(a[sortKey]||"").toString().toLowerCase(), bv=(b[sortKey]||"").toString().toLowerCase(); return sortDir==="asc"?av.localeCompare(bv):bv.localeCompare(av); }) : scoped;

  const labelOf = (k)=>(fields.find(f=>f.key===k)||{}).label||k;
  const tags = [];
  fieldFilters.forEach(f=>f.values.forEach(v=>tags.push({
    id:`${f.field}:${v}`, label:`${labelOf(f.field)}: ${v}`,
    onRemove:()=>setFieldFilters(fieldFilters.map(x=>x.field===f.field?{...x,values:x.values.filter(y=>y!==v)}:x).filter(x=>x.values.length)),
  })));

  return (
    <div style={{background:"#fff",minHeight:"100%"}} data-screen-label="02 Claims Automation Log">
      <div style={{background:"#eef4fb",borderBottom:"1px solid #e2e8f0",padding:"10px 24px",display:"flex",alignItems:"center",gap:14}}>
        <div style={{position:"relative",flexShrink:0}} ref={dpRef}>
          <button type="button" onClick={()=>setDpOpen(v=>!v)} style={{background:"#fff",border:"1px solid #d8d8d8",borderRadius:4,padding:"5px 12px",font:"400 12px/16px Roboto",color:"#0f172a",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,whiteSpace:"nowrap"}}>
            {`Init Date : ${dateRange ? dateRange.start + " – " + dateRange.end : "All"}`}
            <span style={{color:"#94a3b8",fontSize:9}}>▾</span>
          </button>
          {dpOpen && DP && <DP value={dateRange} available={[...new Set(logRows.map(r=>r.initDate))]} onChange={(d)=>{ setDateRange(d); setDpOpen(false); }} />}
        </div>
        <div style={{position:"relative",flexShrink:0}} ref={fpRef}>
          <button type="button" onClick={()=>setFpOpen(v=>!v)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:6,padding:"5px 4px",whiteSpace:"nowrap"}}>
            <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:"#2563eb",color:"#fff",fontSize:10,fontWeight:600,lineHeight:1}}>+</span>
            Add More Filters
          </button>
          {fpOpen && FP && <FP fields={fields} rows={logRows} initial={fieldFilters} onApply={(f)=>{ setFieldFilters(f); setFpOpen(false); }} onClose={()=>setFpOpen(false)} />}
        </div>
        <div className="chip-scroll" style={{display:"flex",alignItems:"center",gap:14,overflowX:"auto",flex:"1 1 auto",minWidth:0}}>
          {tags.map(t=><RCDLogChip key={t.id} label={t.label} onRemove={t.onRemove} />)}
        </div>
        {tags.length>0 && <button type="button" onClick={()=>setFieldFilters([])} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",padding:"5px 4px",whiteSpace:"nowrap"}}>Clear all</button>}
        <div style={{position:"relative",flexShrink:0}}>
          <img src={(window.__resources&&window.__resources.searchIcon)||"icons/search.svg"} alt="search" style={{width:14,height:14,objectFit:"contain",position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}} />
          <input type="text" value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder={isPcr?"Search Patient Records":"Search Claim Batches"} style={{width:240,background:"#fff",border:"1px solid #93c5e8",borderRadius:6,padding:"6px 12px 6px 32px",font:"400 12px/16px Roboto",color:"#0f172a",outline:"none"}} />
        </div>
      </div>
      <div style={{padding:"20px 24px 0"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,flexWrap:"wrap",marginBottom:12}}>
          <div>
            <div style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Automation Log</div>
            <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Transaction Status of Claim Center Workflows</div>
            <div style={{display:(hideTabs||onlyClaims)?"none":"flex",gap:0,marginTop:14}}>
              {RCD_LOG_TABS.map((t,i)=>{
                const on = tab===t.id;
                return (
                  <button key={t.id} type="button" onClick={()=>switchTab(t.id)}
                    style={{minWidth:104,padding:"9px 18px",cursor:"pointer",font:`${on?500:400} 14px/18px Roboto`,color:on?"#1677FF":"#3A424A",background:"#fff",border:`1px solid ${on?"#1677FF":"#d8dee6"}`,borderLeftWidth:i===0?1:0,borderRadius:i===0?"4px 0 0 4px":"0 4px 4px 0",position:"relative",zIndex:on?1:0}}>
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{display:"flex",gap:28,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
            {RCD_LOG_CARDS.map(c=>{
              const active=cardFilter===c.id, dim=cardFilter&&!active, isAll=c.id==="all";
              const val=filtered.filter(c.match).length;
              return (
                <div key={c.id} role="button" onClick={()=>setCardFilter(active?null:(isAll?null:c.id))}
                  style={{minWidth:88,display:"flex",flexDirection:"column",gap:8,cursor:"pointer",opacity:(dim&&!isAll)?0.4:1,transition:"opacity .12s"}}>
                  <div style={{height:3,borderRadius:2,background:c.color,opacity:active?1:0.85}}></div>
                  <div style={{display:"flex",alignItems:"center",gap:5,font:"400 13px/17px Roboto",color:active?"#0f172a":(dim&&isAll)?"#b0b0b0":"#605D5D",whiteSpace:"nowrap"}}>
                    {c.icon && <img src={c.icon} alt="" title={c.label} style={{width:18,height:18,objectFit:"contain",flexShrink:0}} />}
                    {c.glyph && <RCDLogGlyph />}
                    {c.label}
                  </div>
                  <div style={{font:"500 16px/20px Roboto",color:active?"#0f172a":(dim&&isAll)?"#b0b0b0":"#605D5D"}}>{rcdlPad(val)}</div>
                  {cardFilter&&isAll&&(
                    <button type="button" onClick={(e)=>{e.stopPropagation();setCardFilter(null);}} style={{marginTop:2,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}><span style={{fontSize:11}}>↻</span>Reset</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="chip-scroll ws-scrollbody" style={{overflow:"auto",maxHeight:"calc(100vh - 386px)"}}>
          <div style={{minWidth:tableW}}>
            <div style={{display:"grid",gridTemplateColumns:grid,alignItems:"stretch",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",minHeight:44,padding:"0 12px",gap:6,position:"sticky",top:0,zIndex:6}}>
              {cols.map((c,ci)=>(
                <div key={c.key} onClick={c.sort?()=>onSort(c.key):undefined}
                  style={{display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",gap:3,font:"500 11px/14px Roboto",color:"#64748b",whiteSpace:"nowrap",cursor:c.sort?"pointer":"default",userSelect:"none",overflow:"hidden",padding:"0 2px",...(ci===cols.length-1?{position:"sticky",right:0,zIndex:2,background:"#f8fafc",marginRight:-12,padding:"0 12px",boxShadow:"-4px 0 6px -3px rgba(15,23,42,0.12)"}:{})}}>
                  {c.sort && <RCDLogSortArrows active={sortKey===c.key} dir={sortDir} />}
                  {c.label}
                </div>
              ))}
            </div>
            <div style={{paddingTop:8}}>
              {rows.length===0
                ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>No records match.</div>
                : rows.map((r,ri)=>(
                  <div key={r.ref+"|"+r.stage+"|"+ri} style={{display:"grid",gridTemplateColumns:grid,alignItems:"center",minHeight:52,padding:"6px 12px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:6,background:"#fff",boxShadow:"0 1px 2px rgba(15,23,42,0.03)",gap:6,position:"relative"}}>
                    <div style={{position:"absolute",left:8,top:8,bottom:8,width:3,background:"#A66092",borderRadius:2}}></div>
                    <div onClick={()=>onRefClick&&onRefClick(r.id)} style={{font:"500 12px/16px Roboto",color:"#2563eb",cursor:"pointer",paddingLeft:18,display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden"}}>{r.ref}</div>
                    {bodyKeys.map((k,ki)=>(
                      <div key={k} title={typeof r[k]==="string"?r[k]:undefined} style={{font:"500 12px/16px Roboto",color:"#333333",display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,padding:"0 2px",...(!hasAtCol && ki===bodyKeys.length-1?{position:"sticky",right:0,zIndex:2,background:"#fff",alignSelf:"stretch",marginRight:-12,padding:"0 12px",borderRadius:"0 6px 6px 0",boxShadow:"-4px 0 6px -3px rgba(15,23,42,0.12)"}:{})}}>{k==="status"?(isPcr?<RCDLogAtStatus row={r} />:<RCDStatusPill value={r[k]} />):r[k]==="—"?<span style={{color:"#cbd5e1"}}>—</span>:r[k]}</div>
                    ))}
                    {hasAtCol && <div style={{display:"flex",alignItems:"center",justifyContent:"center",position:"sticky",right:0,zIndex:2,background:"#fff",alignSelf:"stretch",marginRight:-12,padding:"0 12px",borderRadius:"0 6px 6px 0",boxShadow:"-4px 0 6px -3px rgba(15,23,42,0.12)"}}><RCDLogATIcon kind={r.at} /></div>}
                  </div>
                ))}
              <div style={{padding:"12px 0",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} of {logRows.length} records shown</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { RCDAutomationLogView, rcdPatientRuns });
