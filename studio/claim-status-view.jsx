// Claim Status View — a structural clone of the PCR View / Claim Batch View
// (same filter bar, title cluster, clickable summary strip, AT status row, grid
// table with child accordion, review checkbox, intervention slideout,
// pagination). Only the columns, the clickable summary and the data come from
// the "Claims Status View (main - all)" Figma frame.
const { useState: useCS, useEffect: useCSE, useRef: useCSR } = React;

// ── Mock data ─────────────────────────────────────────────────
const CS_NAMES = ["Marvin Mckinney","Esther Howard","Wade Warren","Guy Hawkins","Jenny Wilson","Cameron Williamson","Brooklyn Simmons","Leslie Alexander","Jacob Jones","Kristin Watson"];
const CS_AGENCIES = ["Agency 1","Agency 2","Agency 3"];
const CS_BRANCHES = ["Dallas","Fort Worth","Plano","Irving"];
const CS_BILLTYPES = ["NOE","Claim","NOTR","RAP"];
const CS_PAYORS = ["Aetna Gold Plus","Palmetto GBA","CGS","NGS","Humana Choice"];
const CS_GW = ["Waystar","Availity","Change Healthcare"];
const CS_AUDITORS = [
  { name:"Sarah Mitchell",  phone:"(469) 555-0142" },
  { name:"James Thornton",  phone:"(214) 555-0188" },
  { name:"Priya Raman",     phone:"(972) 555-0117" },
  { name:"Daniel Whitfield",phone:"(817) 555-0163" },
  { name:"Maria Gonzalez",  phone:"(469) 555-0129" },
];
const csLongDate = (mdY, time) => {
  const m = String(mdY||"").match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!m) return mdY || "—";
  const yr = m[3].length===2 ? "20"+m[3] : m[3];
  return `${parseInt(m[2],10)} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m[1],10)-1]} ${yr} ${time}`;
};
const csPad = (n) => String(n).padStart(2,"0");
const csDate = (base, add) => { const d = new Date(2025, 3, base + add); return `${csPad(d.getMonth()+1)}/${csPad(d.getDate())}/${String(d.getFullYear()).slice(2)}`; };
// The Figma tallies: All Patient 70 · Clearing House Accepted 10 / Rejected 10 ·
// Pre-Payor Pending 00 / Accepted 05 / Rejected 05 · Payor Pending 10 /
// Accepted 10 / Rejected 10 · Exceptions 10.
const CS_STATUS_PLAN = [
  ["CH Accepted",10],["CH Rejected",10],
  ["PP Accepted",5],["PP Rejected",5],
  ["Payor Pending",10],["Payor Accepted",10],["Payor Rejected",10],
  ["Exception",10],
];
const CS_ROWS = (()=>{
  const out = [];
  let i = 0;
  CS_STATUS_PLAN.forEach(([status,count])=>{
    for (let j=0;j<count;j++,i++) {
      const n = i+1;
      const at = status==="Exception" ? (j===0 ? "warning" : (j===1 ? "hourglass" : (j===2 ? "intervention" : "thumb"))) : "thumb";
      out.push({
        id:"c"+n,
        name: CS_NAMES[i % CS_NAMES.length],
        agency: CS_AGENCIES[i % 3],
        mrn: "B61000622456" + csPad(1 + (i % 60)),
        branch: CS_BRANCHES[i % 4],
        memId: "MEM" + String(740000 + i*13),
        claimNumber: "CL748578" + csPad(20 + (i % 70)),
        billType: CS_BILLTYPES[i % 4],
        batchFile: "837_202504112543636547" + csPad(40 + (i % 50)) + "_Batch" + csPad(1 + (i % 12)) + ".txt",
        payor: CS_PAYORS[i % 5],
        gw: CS_GW[i % 3],
        socDate: csDate(21, -(i % 30)),
        eobDate: csDate(21, (i % 9)),
        dischargeDate: (i % 7 === 0) ? "—" : csDate(21, 12 + (i % 11)),
        submissionDate: csDate(21, 3 + (i % 6)),
        chargeAmt: "$" + (250 + (i*137) % 4750).toLocaleString() + ".00",
        timely: (i % 11 === 0) ? "—" : `${csPad(i % 34)}/34 Days`,
        ehrSync: i % 5 !== 0,
        at,
        status,
        exceptions: status==="Exception" ? 1 + (i % 3) : 0,
        auditor: CS_AUDITORS[i % CS_AUDITORS.length],
        clinician: ["Sara Wilson","Jane Cooper","Robert Fox","Devon Lane","Cody Fisher"][i % 5],
      });
    }
  });
  return out;
})();
if (typeof window !== "undefined") window.CS_ROWS = CS_ROWS;

// ── Helpers ───────────────────────────────────────────────────
const csIcon = (k, fb) => (typeof window!=="undefined" && window.__resources && window.__resources[k]) || fb;
const CS_AT_MAP = { completed:"thumb", warning:"warning", inprogress:"hourglass", intervention:"intervention" };
const CS_DASH = <span style={{color:"#cbd5e1"}}>—</span>;

function CSATIcon({ kind }) {
  if (kind==="thumb")     return <img title="Completed"       alt="Completed"       src={csIcon("atCompleted","icons/at-completed.png")} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind==="warning")   return <img title="Needs Attention" alt="Needs Attention" src={csIcon("atNeedsAttention","icons/at-needs-attention.png")} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind==="hourglass") return <img title="In Progress"     alt="In Progress"     src={csIcon("atInProgress","icons/at-in-progress.png")} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind==="intervention") return (window.RCDInterventionGlyph ? <window.RCDInterventionGlyph /> : null);
  return CS_DASH;
}

const CS_PILL = {
  "CH Accepted":    { bg:"#fcfff9", bd:"#0e8f1b", c:"#0e8f1b" },
  "CH Rejected":    { bg:"#fef2f2", bd:"#ff2929", c:"#dc2626" },
  "PP Pending":     { bg:"#f8fafc", bd:"#94a3b8", c:"#64748b" },
  "PP Accepted":    { bg:"#fcfff9", bd:"#0e8f1b", c:"#0e8f1b" },
  "PP Rejected":    { bg:"#fef2f2", bd:"#ff2929", c:"#dc2626" },
  "Payor Pending":  { bg:"#f8fafc", bd:"#94a3b8", c:"#64748b" },
  "Payor Accepted": { bg:"#fcfff9", bd:"#0e8f1b", c:"#0e8f1b" },
  "Payor Rejected": { bg:"#fef2f2", bd:"#ff2929", c:"#dc2626" },
  "Exception":      { bg:"#fffbeb", bd:"#9c7719", c:"#9c7719" },
};
function CSPill({ status }) {
  const s = CS_PILL[status] || { bg:"#f1f5f9", bd:"#94a3b8", c:"#64748b" };
  return <span style={{display:"inline-block",maxWidth:"100%",boxSizing:"border-box",padding:"3px 10px",borderRadius:2,background:s.bg,border:`1px solid ${s.bd}`,color:s.c,font:"500 11px/14px Roboto",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{status}</span>;
}
function CSTick() {
  return <svg width="16" height="16" viewBox="0 0 16 16" role="img" aria-label="Synced"><title>Synced with EHR</title><path d="M3.2 8.6 L6.3 11.7 L12.8 5.2" fill="none" stroke="#389e0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function CSCross() {
  return <svg width="16" height="16" viewBox="0 0 16 16" role="img" aria-label="Not synced"><title>Not synced with EHR</title><path d="M4 4 L12 12 M12 4 L4 12" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" /></svg>;
}

// ── Filter bar ────────────────────────────────────────────────
function CSFilterChip({ label, onRemove }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:10,background:"#f4f6f9",border:"1px solid #d8dee6",borderRadius:6,padding:"6px 10px",font:"400 12px/16px Roboto",color:"#334155",whiteSpace:"nowrap",flexShrink:0}}>
      {label}
      <button type="button" title="Remove filter" onClick={onRemove} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",border:"none",background:"transparent",color:"#64748b",fontSize:13,lineHeight:1,cursor:"pointer",padding:0}}>✕</button>
    </span>
  );
}

const CS_FILTER_FIELDS = [
  { key:"agency",   label:"Agency" },
  { key:"payor",    label:"Payor" },
  { key:"billType", label:"Bill Type" },
];

function CSFilterBar({ chips, fieldFilters, onFieldFilters, onClearAll, searchValue, onSearch }) {
  const [open, setOpen] = useCS(false);
  const FP = typeof window!=="undefined" && window.FilterPopover;
  const labelOf = (k) => (CS_FILTER_FIELDS.find(f=>f.key===k)||{}).label || k;
  const fieldTags = [];
  (fieldFilters||[]).forEach(f => f.values.forEach(v => fieldTags.push({
    id:`${f.field}:${v}`, label:`${labelOf(f.field)}: ${v}`,
    onRemove: () => onFieldFilters(fieldFilters.map(x => x.field===f.field ? {...x, values:x.values.filter(y=>y!==v)} : x).filter(x=>x.values.length)),
  })));
  return (
    <div style={{background:"#eef4fb",borderBottom:"1px solid #e2e8f0",padding:"10px 24px",display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap"}}>
      <div style={{position:"relative",flexShrink:0}}>
        <button type="button" onClick={()=>setOpen(v=>!v)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:6,padding:"5px 4px",whiteSpace:"nowrap"}}>
          <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:"#2563eb",color:"#fff",fontSize:10,fontWeight:600,lineHeight:1}}>+</span>
          Add More Filters
        </button>
        {open && FP && <FP fields={CS_FILTER_FIELDS} rows={CS_ROWS} initial={fieldFilters} onApply={(f)=>{ onFieldFilters(f); setOpen(false); }} onClose={()=>setOpen(false)} />}
      </div>
      <div className="chip-scroll" style={{display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap",overflowX:"auto",flex:"1 1 auto",minWidth:0}}>
        {chips.map(c => <CSFilterChip key={c.id} label={c.label} onRemove={c.onRemove} />)}
        {fieldTags.map(t => <CSFilterChip key={t.id} label={t.label} onRemove={t.onRemove} />)}
      </div>
      {(chips.length + fieldTags.length) > 0 && (
        <button type="button" onClick={onClearAll} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",padding:"5px 4px",flexShrink:0,whiteSpace:"nowrap"}}>Clear all</button>
      )}
      <div style={{position:"relative",flexShrink:0}}>
        <img src={csIcon("searchIcon","icons/search.svg")} alt="search" style={{width:14,height:14,objectFit:"contain",position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}} />
        <input type="text" value={searchValue} onChange={e=>onSearch(e.target.value)} placeholder="Search Patient Claims" style={{width:240,background:"#fff",border:"1px solid #93c5e8",borderRadius:6,padding:"6px 12px 6px 32px",font:"400 12px/16px Roboto",color:"#0f172a",outline:"none"}} />
      </div>
    </div>
  );
}

// ── Title cluster ─────────────────────────────────────────────
function CSTitleCluster() {
  return (
    <div>
      <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap"}}>
        <span style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Patient Claims Status View</span>
      </div>
      <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Claim Status Summary across Clearing House, Pre-Payor and Payor stages</div>
      <div style={{marginTop:10,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block"}}>Expand a row to view the patient's claim lines</div>
    </div>
  );
}

// ── Claim Status summary box (3-layer, clickable) ─────────────
const CS_SUMMARY = [
  { id:"all_records", group:null,             label:"All Patient", color:"rgb(21,95,130)",  weight:1.0, match:null },
  { id:"ch_acc",      group:"Clearing House", label:"Accepted",    color:"rgb(14,143,27)",  weight:0.9, match:(r)=>r.status==="CH Accepted" },
  { id:"ch_rej",      group:"Clearing House", label:"Rejected",    color:"rgb(255,41,41)",  weight:0.9, match:(r)=>r.status==="CH Rejected" },
  { id:"pp_pen",      group:"Pre-Payor",      label:"Pending",     color:"rgb(108,123,143)",weight:0.9, match:(r)=>r.status==="PP Pending" },
  { id:"pp_acc",      group:"Pre-Payor",      label:"Accepted",    color:"rgb(14,143,27)",  weight:0.9, match:(r)=>r.status==="PP Accepted" },
  { id:"pp_rej",      group:"Pre-Payor",      label:"Rejected",    color:"rgb(255,41,41)",  weight:0.9, match:(r)=>r.status==="PP Rejected" },
  { id:"py_pen",      group:"Payor",          label:"Pending",     color:"rgb(108,123,143)",weight:0.9, match:(r)=>r.status==="Payor Pending" },
  { id:"py_acc",      group:"Payor",          label:"Accepted",    color:"rgb(14,143,27)",  weight:0.9, match:(r)=>r.status==="Payor Accepted" },
  { id:"py_rej",      group:"Payor",          label:"Rejected",    color:"rgb(255,41,41)",  weight:0.9, match:(r)=>r.status==="Payor Rejected" },
  { id:"exceptions",  group:null,             label:"Exceptions",  color:"rgb(156,119,25)", weight:1.0, match:(r)=>r.exceptions>0 },
];
const CS_GROUPS = ["Clearing House","Pre-Payor","Payor"];

function CSStatusStrip({ scopedRows, totalRows, activeStatus, onPick }) {
  const chip = (s)=>{
    const isAll = s.id==="all_records";
    const active = !isAll && activeStatus===s.id;
    const dim = activeStatus && !active;
    const count = isAll ? totalRows : scopedRows.filter(s.match).length;
    return (
      <div key={s.id} role="button" title={(s.group?s.group+" · ":"")+s.label} onClick={()=>onPick(isAll ? null : (active ? null : s.id))}
        style={{flex:`${s.weight} 1 0`,minWidth:78,boxSizing:"border-box",padding:"10px 12px 12px",cursor:"pointer",opacity:(dim&&!isAll)?0.35:1,transition:"opacity .12s,background .12s",background:active?"#f8fafc":"transparent"}}
        onMouseEnter={e=>{ if(!active&&!dim) e.currentTarget.style.background="#fafbfc"; }}
        onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
        {!s.group && <div style={{height:28,flexShrink:0}}></div>}
        <div style={{height:3,borderRadius:2,background:s.color,opacity:active?1:0.6,marginBottom:8}}></div>
        <div style={{font:"400 13px/18px Roboto",color:(dim&&isAll)?"#b0b0b0":"rgb(96,93,93)",whiteSpace:"nowrap"}}>{s.label}</div>
        <div style={{font:"500 16px/20px Roboto",color:(dim&&isAll)?"#b0b0b0":"rgb(96,93,93)",marginTop:2}}>{csPad(count)}</div>
        {activeStatus && isAll && (
          <button type="button" onClick={e=>{ e.stopPropagation(); onPick(null); }} style={{marginTop:4,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}><span style={{fontSize:11}}>↻</span>Reset</button>
        )}
      </div>
    );
  };
  const byId = (id)=>CS_SUMMARY.find(s=>s.id===id);
  return (
    <div style={{display:"flex",alignItems:"stretch",border:"1px solid rgb(232,227,227)",borderRadius:5,background:"#fff",overflow:"hidden"}}>
      <div style={{padding:"14px 16px",background:"rgba(247,247,249,0.49)",borderRight:"1px solid rgb(232,227,227)",display:"flex",flexDirection:"column",justifyContent:"center",font:"500 15px/22px Roboto",color:"rgb(107,102,102)",flexShrink:0}}>
        <span>Claim</span><span>Status</span>
      </div>
      <div style={{display:"flex",alignItems:"stretch",flex:1}}>
        {chip(byId("all_records"))}
        {CS_GROUPS.map(g=>(
          <React.Fragment key={g}>
            <span style={{width:1,background:"rgb(229,226,226)",margin:"12px 0",flexShrink:0}}></span>
            <div style={{display:"flex",flexDirection:"column",flex:`${g==="Clearing House"?2:3} 1 0`,minWidth:0}}>
              <div style={{font:"500 14px/18px Roboto",color:"rgb(108,123,143)",textAlign:"center",padding:"10px 4px 0"}}>{g}</div>
              <div style={{display:"flex",alignItems:"stretch"}}>
                {CS_SUMMARY.filter(s=>s.group===g).map(chip)}
              </div>
            </div>
          </React.Fragment>
        ))}
        <span style={{width:1,background:"rgb(229,226,226)",margin:"12px 0",flexShrink:0}}></span>
        {chip(byId("exceptions"))}
      </div>
    </div>
  );
}

// ── Automation (AT) Status row ────────────────────────────────
const CS_AT_ITEMS = [
  { id:"completed",  label:"Completed",       kind:"thumb"     },
  { id:"warning",    label:"Needs Attention", kind:"warning",   num:"#d97706", caret:true },
  { id:"intervention", label:"Needs Intervention", kind:"intervention", num:"#d97706", caret:true },
  { id:"inprogress", label:"In Progress",     kind:"hourglass" },
];
function CSAutomationStatus({ scopedRows, atFilter, onFilter }) {
  const [openMenu, setOpenMenu] = useCS(null);
  const ref = useCSR(null);
  useCSE(()=>{ if(!openMenu) return; const h=(e)=>{ if(ref.current && !ref.current.contains(e.target)) setOpenMenu(null); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[openMenu]);
  const breakdown = {};
  scopedRows.filter(r=>r.at==="warning").forEach(r=>{ breakdown[r.status] = (breakdown[r.status]||0)+1; });
  const reasons = {};
  scopedRows.filter(r=>r.at==="intervention").forEach(r=>{ csInterventions(r).filter(it=>it.status!=="Completed").forEach(it=>{ reasons[it.reason] = (reasons[it.reason]||0)+1; }); });
  const menu = openMenu==="intervention"
    ? { title:"Needs Intervention by reason", data:reasons, w:340 }
    : { title:"Needs Attention by claim status", data:breakdown, w:280 };
  return (
    <div ref={ref} style={{display:"flex",alignItems:"center",justifyContent:"flex-end",font:"400 13px/16px Roboto",color:"#333",marginTop:10,position:"relative"}}>
      <span style={{color:"#94a3b8",marginRight:12}}>Automation (AT) Status :</span>
      {CS_AT_ITEMS.map((s,i)=>{
        const active = atFilter===s.id;
        const dim = atFilter && !active;
        const count = scopedRows.filter(r=>r.at===s.kind).length;
        return (
          <React.Fragment key={s.id}>
            {i>0 && <span style={{width:1,height:18,background:"#e2e8f0",margin:"0 10px"}}></span>}
            <button type="button" onClick={()=>onFilter(active?null:s.id)} style={{background:"transparent",border:"none",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,padding:"2px 6px",borderRadius:4,opacity:dim?0.4:1,transition:"opacity .12s"}}>
              <CSATIcon kind={s.kind} />
              <span style={{color:"#0f172a",font:"400 13px/16px Roboto"}}>{s.label}</span>
              <span style={{font:"600 13px/16px Roboto",color:s.num||"#0f172a"}}>{csPad(count)}</span>
            </button>
            {s.caret && (
              <span title="Sub-status breakdown" onClick={()=>setOpenMenu(o=>o===s.id?null:s.id)} style={{width:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#2563eb"}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 8 L19 8 L12 17 Z" fill="currentColor" /></svg>
              </span>
            )}
          </React.Fragment>
        );
      })}
      {openMenu && (
        <div style={{position:"absolute",top:"100%",right:0,marginTop:6,background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,boxShadow:"0 8px 24px rgba(15,23,42,0.12)",padding:8,minWidth:menu.w,maxWidth:400,zIndex:40,textAlign:"left"}}>
          <div style={{font:"600 10px/14px Roboto",letterSpacing:"0.06em",textTransform:"uppercase",color:"#94a3b8",padding:"4px 8px 6px"}}>{menu.title}</div>
          {Object.keys(menu.data).length===0 && <div style={{padding:"6px 8px",font:"400 12px/16px Roboto",color:"#94a3b8"}}>No records</div>}
          {Object.keys(menu.data).map(k=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",gap:16,padding:"5px 8px",font:"400 12px/16px Roboto",color:"#334155"}}>
              <span style={{flex:1}}>{k}</span><span style={{fontWeight:600,color:"#d97706"}}>{csPad(menu.data[k])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────
const CS_COLS = [
  { key:"name",           label:"Patient Name",      grid:"170px", sortable:true },
  { key:"agency",         label:"Agency",            grid:"110px", sortable:true },
  { key:"mrn",            label:"MRN",               grid:"152px", sortable:true },
  { key:"branch",         label:"Branch",            grid:"110px", sortable:true },
  { key:"memId",          label:"Mem ID",            grid:"120px", sortable:true },
  { key:"claimNumber",    label:"Claim Number",      grid:"130px", sortable:true },
  { key:"billType",       label:"Bill Type",         grid:"96px",  sortable:true },
  { key:"batchFile",      label:"Batch File Name",   grid:"300px", sortable:true },
  { key:"payor",          label:"Payor",             grid:"146px", sortable:true },
  { key:"gw",             label:"GW",                grid:"142px", sortable:true },
  { key:"socDate",        label:"SOC Date",          grid:"100px", sortable:true },
  { key:"eobDate",        label:"EOB Date",          grid:"100px", sortable:true },
  { key:"dischargeDate",  label:"Discharge Date",    grid:"118px", sortable:true },
  { key:"submissionDate", label:"Submission Date",   grid:"126px", sortable:true },
  { key:"chargeAmt",      label:"Claim Charge Amt",  grid:"134px", sortable:true },
  { key:"timely",         label:"Timely Filing Days",grid:"140px", sortable:true },
  { key:"ehrSync",        label:"EHR Sync",          grid:"88px",  sortable:true, align:"center" },
  { key:"at",             label:"AT Status",         grid:"88px",  sortable:true, align:"center" },
  { key:"status",         label:"Status",            grid:"148px", sortable:true, align:"center" },
  { key:"action",         label:"Action",            grid:"126px", sortable:false, align:"center" },
  { key:"reviewed",       label:"Reviewed?",         grid:"88px",  sortable:false, align:"center" },
];
const CS_GRID = CS_COLS.map(c=>c.grid).join(" ");
const CS_FROZEN = 4;
// Last four columns stay pinned to the right edge while the rest scroll under them.
const csFrozen = (i, pad, isHeader) => {
  if (i < CS_COLS.length - CS_FROZEN) return null;
  let r = pad;
  for (let k=i+1;k<CS_COLS.length;k++) r += parseInt(CS_COLS[k].grid,10) + 6;
  const bg = isHeader ? "#f8fafc" : "#fff";
  const isFirst = i === CS_COLS.length - CS_FROZEN;
  const isLast  = i === CS_COLS.length - 1;
  // Opaque box-shadows fill the 6px grid gaps (and the row's right padding) so no
  // scrolling content shows between the pinned columns.
  const fills = [
    isLast ? `${pad + 8}px 0 0 0 ${bg}` : `8px 0 0 0 ${bg}`,
    `-8px 0 0 0 ${bg}`,
  ];
  if (isFirst) fills.push("-12px 0 9px -7px rgba(15,23,42,0.18)");
  return { position:"sticky", right:r, zIndex:isHeader?9:5, background:bg, boxShadow:fills.join(", ") };
};
const CS_TABLE_W = CS_COLS.reduce((a,c)=>a+parseInt(c.grid,10),0) + CS_COLS.length*6 + 24;

function CSSortArrows({ active, dir }) {
  const up   = active && dir==="asc"  ? "#2563eb" : "rgba(0,0,0,0.25)";
  const down = active && dir==="desc" ? "#2563eb" : "rgba(0,0,0,0.25)";
  return (
    <svg width="10" height="15" viewBox="0 0 9 14" fill="none" style={{marginRight:3,flex:"none"}}>
      <path d="M7.74699 7.40234H1.25301C1.05823 7.40234 0.949473 7.608 1.0701 7.7484L4.31708 11.5135C4.41003 11.6213 4.58899 11.6213 4.68291 11.5135L7.9299 7.7484C8.05053 7.608 7.94177 7.40234 7.74699 7.40234Z" fill={down}/>
      <path d="M7.9299 6.24825L4.68291 2.48317C4.58997 2.3754 4.41101 2.3754 4.31708 2.48317L1.0701 6.24825C0.949473 6.38865 1.05823 6.59431 1.25301 6.59431H7.74699C7.94177 6.59431 8.05053 6.38865 7.9299 6.24825Z" fill={up}/>
    </svg>
  );
}

function CSTableHeader({ sortKey, sortDir, onSort }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:CS_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",gap:6,position:"sticky",top:0,zIndex:6,boxShadow:"0 1px 0 #e2e8f0"}}>
      {CS_COLS.map((c,ci)=>(
        <div key={c.key} onClick={c.sortable?()=>onSort(c.key):undefined}
          style={{font:"500 11px/14px Roboto",color:"#64748b",display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",cursor:c.sortable?"pointer":"default",userSelect:"none",overflow:"hidden",whiteSpace:"nowrap",...(csFrozen(ci,12,true)||{})}}>
          {c.sortable && <CSSortArrows active={sortKey===c.key} dir={sortDir} />}
          {c.label}
        </div>
      ))}
    </div>
  );
}

// Child accordion — the patient's claim lines, derived from the parent row.
const CS_CHILD_COLS = ["Claim ID","Bill Type","Service Dates","Payor","Plan","Associated Auths","Claim Status","SOC Date","Mem ID"];
const CS_CHILD_GRID = "140px 100px 176px 150px 130px 190px 150px 110px 130px";
function csChildRows(row) {
  const seed = parseInt(row.id.replace(/\D/g,""),10) || 1;
  const count = 2 + (seed % 3);
  return Array.from({length:count},(_,i)=>{
    const k = seed + i;
    return {
      claimId: "CL748578" + csPad(20 + (k % 70)),
      billType: i===0 ? row.billType : CS_BILLTYPES[k % 4],
      serviceDates: csDate(21, -(k % 25)) + " – " + csDate(21, (k % 8)),
      payor: row.payor,
      plan: ["Mcare Adv","Mcare FFS","Managed Care"][k % 3],
      auths: "Auth23" + csPad(40 + (k % 50)) + ", Auth23" + csPad(60 + (k % 30)) + (i===0 ? " +1" : ""),
      status: i===0 ? row.status : ["Payor Pending","CH Accepted","PP Accepted"][k % 3],
      socDate: row.socDate,
      memId: row.memId,
    };
  });
}

function CSChildSection({ row }) {
  const kids = csChildRows(row);
  return (
    <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderTop:"none",borderRadius:"0 0 6px 6px",padding:"14px 20px 16px 44px",marginBottom:8}}>
      <div style={{font:"500 12px/16px Roboto",color:"#0f172a",marginBottom:8}}>Claim Lines — {row.name}</div>
      <div className="ws-hscroll" style={{border:"1px solid #e5e7eb",borderRadius:2,overflowX:"auto",background:"#fff"}}><div style={{minWidth:1276}}>
        <div style={{display:"grid",gridTemplateColumns:CS_CHILD_GRID,background:"#f8fafc",borderBottom:"1px solid #e5e7eb"}}>
          {CS_CHILD_COLS.map(c=>(
            <div key={c} style={{font:"500 11px/14px Roboto",letterSpacing:"0.04em",textTransform:"uppercase",color:"#64748b",padding:"10px 12px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c}</div>
          ))}
        </div>
        {kids.map((k,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:CS_CHILD_GRID,borderBottom:i===kids.length-1?"none":"1px solid #eef2f7"}}>
            {[k.claimId,k.billType,k.serviceDates,k.payor,k.plan,k.auths,k.status,k.socDate,k.memId].map((v,j)=>(
              <div key={j} style={{font:"500 12px/16px Roboto",color:"#334155",padding:"11px 12px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v==="—" ? CS_DASH : v}</div>
            ))}
          </div>
        ))}
      </div></div>
    </div>
  );
}

function CSTableRow({ row, expanded, onToggle, reviewed, onReviewed, onIntervention, accent="#2563eb" }) {
  const cell = (align, ci) => ({font:"500 12px/16px Roboto",color:"#333333",display:"flex",alignItems:"center",justifyContent:align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,...(csFrozen(ci==null?-1:ci,11)||{})});
  return (
    <div style={{position:"relative",display:"grid",gridTemplateColumns:CS_GRID,alignItems:"center",height:48,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:expanded?"6px 6px 0 0":6,marginBottom:expanded?0:8,boxShadow:expanded?"none":"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",gap:6}}>
      <div style={cell()}>
        <span onClick={(e)=>{ e.stopPropagation(); onToggle(row.id); }} title={expanded?"Collapse":"Expand"} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginRight:8,color:accent,transition:"transform .15s",transform:expanded?"rotate(90deg)":"rotate(0deg)",flexShrink:0}}>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2 L11 7 L4 12 Z" fill="currentColor" /></svg>
        </span>
        <span title={row.name} style={{font:"500 13px/16px Roboto",color:"#333333",overflow:"hidden",textOverflow:"ellipsis"}}>{row.name}</span>
      </div>
      <div style={cell()}>{row.agency}</div>
      <div style={cell()}>{row.mrn}</div>
      <div style={cell()}>{row.branch}</div>
      <div style={cell()}>{row.memId}</div>
      <div style={cell()}>{row.claimNumber}</div>
      <div style={cell()}>{row.billType}</div>
      <div style={cell()} title={row.batchFile}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{row.batchFile}</span></div>
      <div style={cell()}>{row.payor}</div>
      <div style={cell()}>{row.gw}</div>
      <div style={cell()}>{row.socDate}</div>
      <div style={cell()}>{row.eobDate}</div>
      <div style={cell()}>{row.dischargeDate==="—" ? CS_DASH : row.dischargeDate}</div>
      <div style={cell()}>{row.submissionDate}</div>
      <div style={cell()}>{row.chargeAmt}</div>
      <div style={cell()}>{row.timely==="—" ? CS_DASH : row.timely}</div>
      <div style={cell("center")}>{row.ehrSync ? <CSTick /> : <CSCross />}</div>
      <div style={cell("center",17)}>
        {row.at==="intervention"
          ? <span role="button" title="Needs Intervention — view details" onClick={(e)=>{ e.stopPropagation(); onIntervention && onIntervention(row); }} style={{display:"inline-flex",alignItems:"center",cursor:"pointer"}}><CSATIcon kind={row.at} /></span>
          : <CSATIcon kind={row.at} />}
      </div>
      <div style={cell("center",18)}><CSPill status={row.status} /></div>
      <div style={cell("center",19)} onClick={(e)=>e.stopPropagation()}>
        <span role="button" style={{font:"400 12px/16px Roboto",color:"#2563eb",cursor:"pointer"}}>{row.status==="Exception" ? "Check Eligibility" : "View Details"}</span>
      </div>
      <div style={cell("center",20)} onClick={(e)=>e.stopPropagation()}>
        <span role="checkbox" aria-checked={!!reviewed} tabIndex={0} onClick={()=>onReviewed(row.id)}
          style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:`1px solid ${reviewed?accent:"#d8d8d8"}`,borderRadius:3,background:reviewed?accent:"#fff",cursor:"pointer"}}>
          {reviewed && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}
        </span>
      </div>
    </div>
  );
}

// ── Needs-Intervention slideout ───────────────────────────────
function csInterventions(row) {
  const n = parseInt(row.id.replace(/\D/g,""),10) || 1;
  const defs = [
    { key:"MEM_ID",        value:row.memId,       reason:"Member ID returned no match at the payor",                  stage:"Eligibility Verification" },
    { key:"CLAIM_NUMBER",  value:row.claimNumber, reason:"Claim number rejected as duplicate by the clearing house",   stage:"Clearing House" },
    { key:"TIMELY_FILING", value:row.timely,      reason:"Timely filing window exceeded for this claim",               stage:"Submission" },
    { key:"CHARGE_AMT",    value:row.chargeAmt,   reason:"Charge amount does not reconcile with the service lines",    stage:"Pre-Payor Edit" },
    { key:"EHR_SYNC",      value:row.ehrSync ? "Synced" : "Not synced", reason:"Claim status could not be written back to the EHR", stage:"EHR Sync" },
  ];
  const count = 2 + (n % 3);
  return defs.slice(0, count).map((d,i)=>{
    const k = n + i;
    const done = k % 3 === 0;
    return {
      id: row.id + "-i" + i,
      txnId: "TXN" + String(90000 + k*137).slice(0,5) + "-" + String(k).padStart(4,"0"),
      key:d.key, value:d.value, reason:d.reason, stage:d.stage,
      status: done ? "Completed" : (k % 3 === 1 ? "Open" : "In Progress"),
      created: csLongDate(row.submissionDate, "10:35 AM"),
      completed: done ? csLongDate(row.eobDate, "02:18 PM") : "—",
      notes: done ? "Resolved on automated retry — no manual action required." : "",
      by: done ? row.clinician : "—",
    };
  });
}

const CS_INT_COLS = [
  { k:"key",     label:"Key",          w:"minmax(150px,1fr)", bold:true },
  { k:"value",   label:"Value",        w:"minmax(110px,0.8fr)" },
  { k:"reason",  label:"Reason",       w:"minmax(240px,1.6fr)", tone:"#b45309" },
  { k:"stage",   label:"Stage",        w:"minmax(170px,1.1fr)" },
  { k:"created", label:"Date Created", w:"minmax(180px,1.1fr)" },
];
const CS_DONE_COLS = CS_INT_COLS.concat([
  { k:"by",        label:"Completed By",   w:"minmax(150px,1fr)" },
  { k:"completed", label:"Date Completed", w:"minmax(180px,1.1fr)" },
  { k:"notes",     label:"Notes",          w:"minmax(200px,1.3fr)" },
]);

function CSIntSortIcon({ active }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,borderRadius:"50%",background:active?"#1677FF":"#f1f5f9",border:active?"none":"1px solid #dbe2ea",flexShrink:0}}>
      <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><path d="M4 1.4 L6.4 4.4 H1.6 Z" fill={active?"#fff":"#94a3b8"} /></svg>
    </span>
  );
}

function CSIntTable({ items, cols, onComplete, empty }) {
  const [sortKey, setSortKey] = useCS(null);
  const [sortDir, setSortDir] = useCS("asc");
  const [noteFor, setNoteFor] = useCS(null);
  const [note, setNote]       = useCS("");
  const template = cols.map(c=>c.w).join(" ") + (onComplete ? " 190px" : "");
  const rows = sortKey ? [...items].sort((a,b)=>{
    const av=(a[sortKey]||"").toString().toLowerCase(), bv=(b[sortKey]||"").toString().toLowerCase();
    return sortDir==="asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  }) : items;
  const cellBase = {padding:"14px 16px",display:"flex",alignItems:"center",minWidth:0,borderBottom:"1px solid #eef2f7"};
  const onSort = (k)=>{ if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };
  return (
    <div style={{border:"1px solid #e8eef4",borderRadius:6,overflow:"hidden",background:"#fff"}}>
      <div style={{display:"grid",gridTemplateColumns:template,background:"#f8fafc"}}>
        {cols.map(c=>(
          <div key={c.k} onClick={()=>onSort(c.k)} style={{...cellBase,gap:8,cursor:"pointer",userSelect:"none",font:"500 13px/18px Roboto",color:"#1f2937",borderBottom:"1px solid #e8eef4"}}>
            <CSIntSortIcon active={sortKey===c.k} />{c.label}
          </div>
        ))}
        {onComplete && <div style={{...cellBase,font:"500 13px/18px Roboto",color:"#1f2937",borderBottom:"1px solid #e8eef4"}}>Action</div>}
      </div>
      {rows.length===0 && <div style={{padding:"22px 16px",font:"400 13px/18px Roboto",color:"#94a3b8"}}>{empty}</div>}
      {rows.map(it=>(
        <React.Fragment key={it.id}>
          <div style={{display:"grid",gridTemplateColumns:template}}>
            {cols.map(c=>(
              <div key={c.k} style={{...cellBase,font:`${c.bold?"600":"400"} 13px/19px Roboto`,color:c.tone||(c.bold?"#111827":"#3a424a"),textWrap:"pretty"}}>
                {it[c.k] && it[c.k]!=="—" ? it[c.k] : <span style={{color:"#94a3b8"}}>-</span>}
              </div>
            ))}
            {onComplete && (
              <div style={cellBase}>
                {noteFor===it.id
                  ? <span style={{font:"400 12px/16px Roboto",color:"#94a3b8"}}>Add notes below</span>
                  : <button type="button" onClick={()=>{ setNoteFor(it.id); setNote(""); }} style={{border:"1px solid #1677FF",background:"#fff",color:"#1677FF",font:"500 12px/16px Roboto",padding:"6px 14px",borderRadius:4,cursor:"pointer",whiteSpace:"nowrap"}}>Mark as complete</button>}
              </div>
            )}
          </div>
          {onComplete && noteFor===it.id && (
            <div style={{borderBottom:"1px solid #eef2f7",background:"#fbfdff",padding:"14px 16px",display:"flex",alignItems:"flex-start",gap:12}}>
              <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} placeholder="Notes (optional) — why was this intervention completed?"
                style={{flex:1,minWidth:0,resize:"vertical",border:"1px solid #d8dee6",borderRadius:4,padding:"8px 10px",font:"400 12px/17px Roboto",color:"#1f2937",outline:"none"}}></textarea>
              <div style={{display:"flex",gap:8,flexShrink:0,paddingTop:2}}>
                <button type="button" onClick={()=>{ onComplete(it, note.trim()); setNoteFor(null); setNote(""); }} style={{border:"none",background:"#1677FF",color:"#fff",font:"500 12px/16px Roboto",padding:"7px 16px",borderRadius:4,cursor:"pointer"}}>Confirm</button>
                <button type="button" onClick={()=>{ setNoteFor(null); setNote(""); }} style={{border:"1px solid #d8dee6",background:"#fff",color:"#475569",font:"500 12px/16px Roboto",padding:"7px 14px",borderRadius:4,cursor:"pointer"}}>Cancel</button>
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function CSInterventionDrawer({ row, onClose }) {
  useCSE(()=>{ const h=(e)=>{ if(e.key==="Escape") onClose(); }; document.addEventListener("keydown",h); return ()=>document.removeEventListener("keydown",h); },[onClose]);
  const [tab, setTab] = useCS("open");
  const [done, setDone] = useCS({});
  const all = row ? csInterventions(row) : [];
  if (!row) return null;
  const isDone = (it)=> !!done[it.id] || it.status === "Completed";
  const open = all.filter(it=>!isDone(it));
  const completed = all.filter(isDone).map(it=> done[it.id]
    ? {...it, completed:done[it.id].at, by:done[it.id].by, notes:done[it.id].notes}
    : {...it, notes:it.notes||""});
  const markDone = (it, notes)=>{
    const d = new Date();
    const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
    const at = `${d.getDate()} ${mon} ${d.getFullYear()} ${csPad(((d.getHours()+11)%12)+1)}:${csPad(d.getMinutes())} ${d.getHours()<12?"AM":"PM"}`;
    setDone(m=>({...m,[it.id]:{ at, by:row.clinician, notes }}));
  };
  const tabs = [["open","Needs Interventions",open.length],["done","Completed Interventions",completed.length]];
  return (
    <React.Fragment>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.18)"}}></div>
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:1180,maxWidth:"94vw",background:"#fff",zIndex:901,display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.13)",animation:"csIntSlide .22s cubic-bezier(0.32,0.72,0,1)"}}>
        <style>{`@keyframes csIntSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"22px 24px 16px"}}>
          <span style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Needs Intervention</span>
          <button onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",padding:4,color:"#64748b",font:"400 18px/18px Roboto"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"0 16px",padding:"0 24px 16px",borderBottom:"1px solid #e5e7eb"}}>
          {[["Patient Name",row.name],["Claim Number",row.claimNumber],["Payor",row.payor],["Claim Status",row.status]].map(([l,v])=>(
            <div key={l}>
              <div style={{font:"400 11px/14px Roboto",color:"#94a3b8",marginBottom:2}}>{l}</div>
              <div style={{font:"500 13px/18px Roboto",color:"#0f172a"}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",padding:"0 24px",borderBottom:"1px solid #e5e7eb"}}>
          {tabs.map(([id,label,count])=>(
            <button key={id} onClick={()=>setTab(id)} style={{border:"none",background:"transparent",padding:"12px 0",marginRight:26,cursor:"pointer",font:"500 13px/16px Roboto",color:tab===id?"#2563eb":"#475569",borderBottom:tab===id?"2px solid #2563eb":"2px solid transparent"}}>
              {label} ({csPad(count)})
            </button>
          ))}
        </div>
        <div className="ws-scrollbody" style={{flex:1,overflow:"auto",padding:"18px 24px 28px"}}>
          {tab==="open"
            ? <CSIntTable items={open} cols={CS_INT_COLS} onComplete={markDone} empty="No open interventions for this claim." />
            : <CSIntTable items={completed} cols={CS_DONE_COLS} empty="No completed interventions yet." />}
        </div>
      </div>
    </React.Fragment>
  );
}

// ── Pagination ────────────────────────────────────────────────
function CSPagination({ total, page, perPage, onPage, onPerPage }) {
  return null;
  const pages = Math.max(1, Math.ceil(total/perPage));
  const start = total===0 ? 0 : (page-1)*perPage+1;
  const end = Math.min(page*perPage, total);
  const Btn = ({children,active,disabled,onClick}) => (
    <button type="button" onClick={onClick} disabled={disabled} style={{width:28,height:28,borderRadius:4,border:`1px solid ${active?"#2563eb":"#e2e8f0"}`,background:active?"#2563eb":"#fff",color:active?"#fff":disabled?"#cbd5e1":"#333333",font:"400 12px/16px Roboto",cursor:disabled?"default":"pointer",padding:0}}>{children}</button>
  );
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #e2e8f0",padding:"12px 24px"}}>
      <div style={{display:"flex",alignItems:"center",gap:16}}>
        <span style={{font:"400 12px/16px Roboto",color:"#94a3b8"}}>Showing {start}–{end} of {total}</span>
        <label style={{display:"inline-flex",alignItems:"center",gap:6,font:"400 12px/16px Roboto",color:"#94a3b8"}}>
          Rows
          <select value={perPage} onChange={(e)=>onPerPage(parseInt(e.target.value,10))} style={{border:"1px solid #e2e8f0",borderRadius:4,padding:"3px 6px",font:"400 12px/16px Roboto",color:"#333333",background:"#fff",outline:"none"}}>
            {[10,15,25,50].map(n=><option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
      <div style={{display:"flex",gap:6}}>
        <Btn onClick={()=>onPage(page-1)} disabled={page===1}>‹</Btn>
        {Array.from({length:Math.min(pages,5)},(_,i)=>i+1).map(n=><Btn key={n} active={n===page} onClick={()=>onPage(n)}>{n}</Btn>)}
        <Btn onClick={()=>onPage(page+1)} disabled={page>=pages}>›</Btn>
      </div>
    </div>
  );
}

// ── Claim Status View (main) ───────────────────────────────────
function ClaimStatusView({ review, onExitReview }) {
  const [statusFilter, setStatusFilter] = useCS(null);
  const [atFilter, setAtFilter]         = useCS(null);
  const [searchQ, setSearchQ]           = useCS("");
  const [sortKey, setSortKey]           = useCS(null);
  const [sortDir, setSortDir]           = useCS("asc");
  const [fieldFilters, setFieldFilters] = useCS([]);
  const [reviewedSet, setReviewedSet]   = useCS({});
  const [expandedIds, setExpandedIds]   = useCS({});
  const [page, setPage]                 = useCS(1);
  const [perPage, setPerPage]           = useCS(10);
  const [bodyH, setBodyH]               = useCS(()=> Math.max(280, window.innerHeight - 430));
  const [interventionRow, setInterventionRow] = useCS(null);

  useCSE(()=>{ const h=()=>setBodyH(Math.max(280, window.innerHeight - 430)); window.addEventListener("resize",h); return ()=>window.removeEventListener("resize",h); },[]);

  const toggleExpand   = (id) => setExpandedIds(m=>({...m,[id]:!m[id]}));
  const toggleReviewed = (id) => setReviewedSet(m=>({...m,[id]:!m[id]}));
  const onSort = (k) => { if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };

  const filterSig = JSON.stringify([statusFilter,atFilter,searchQ,fieldFilters,review,perPage]);
  useCSE(()=>{ setPage(1); }, [filterSig]);

  let base = CS_ROWS;
  base = base.filter(r => fieldFilters.every(f => f.values.includes(r[f.field])));
  if (searchQ.trim()) { const q = searchQ.toLowerCase(); base = base.filter(r=>[r.name,r.mrn,r.memId,r.claimNumber,r.payor,r.status].join(" ").toLowerCase().includes(q)); }
  const needsReview = (r) => r.at==="warning" || r.at==="intervention" || r.exceptions>0 || r.status.indexOf("Rejected")>=0;
  if (review) base = base.filter(r => needsReview(r) && !reviewedSet[r.id]);

  const scopedForStatus = atFilter ? base.filter(r=>r.at===CS_AT_MAP[atFilter]) : base;
  const statusMatch = statusFilter ? (CS_SUMMARY.find(s=>s.id===statusFilter)||{}).match : null;
  const scopedForAt = statusMatch ? base.filter(statusMatch) : base;

  let rows = base;
  if (statusMatch) rows = rows.filter(statusMatch);
  if (atFilter)    rows = rows.filter(r=>r.at===CS_AT_MAP[atFilter]);
  if (sortKey) {
    rows = [...rows].sort((a,b)=>{
      const av = (a[sortKey]==null?"":a[sortKey]).toString().toLowerCase();
      const bv = (b[sortKey]==null?"":b[sortKey]).toString().toLowerCase();
      if (av<bv) return sortDir==="asc"?-1:1;
      if (av>bv) return sortDir==="asc"?1:-1;
      return 0;
    });
  }
  const total = rows.length;
  const pageRows = rows;

  const chips = [];
  if (statusFilter) { const s = CS_SUMMARY.find(x=>x.id===statusFilter); chips.push({ id:"status", label:`Claim Status: ${s?((s.group?s.group+" ":"")+s.label):statusFilter}`, onRemove:()=>setStatusFilter(null) }); }
  if (atFilter) { const a = CS_AT_ITEMS.find(x=>x.id===atFilter); chips.push({ id:"at", label:`AT Status: ${a?a.label:atFilter}`, onRemove:()=>setAtFilter(null) }); }
  if (review) {
    [
      { id:"rv-at", label:"Automation Status: Needs Attention" },
      { id:"rv-st", label:"Claim Status: Rejected / Exceptions" },
      { id:"rv-nr", label:"Reviewed : Not Reviewed" },
    ].forEach(c=>chips.push({ ...c, onRemove:()=>onExitReview&&onExitReview() }));
  }
  const clearAll = () => { setStatusFilter(null); setAtFilter(null); setFieldFilters([]); setSearchQ(""); if(review && onExitReview) onExitReview(); };

  return (
    <div style={{background:"#fff"}} data-screen-label="01 Claims Status View">
      <CSFilterBar chips={chips} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters}
        onClearAll={clearAll} searchValue={searchQ} onSearch={setSearchQ} />
      <div style={{padding:"20px 24px 0",display:"flex",alignItems:"flex-start",gap:32,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 300px",minWidth:0}}>
          <CSTitleCluster />
        </div>
        <div style={{flex:"1 1 760px",minWidth:0}}>
          <CSStatusStrip scopedRows={scopedForStatus} totalRows={base.length} activeStatus={statusFilter} onPick={setStatusFilter} />
          <CSAutomationStatus scopedRows={scopedForAt} atFilter={atFilter} onFilter={setAtFilter} />
        </div>
      </div>
      <div style={{padding:"18px 24px 0"}}>
        <div className="ws-hscroll ws-scrollbody" style={{overflow:"auto",maxHeight:bodyH+48,paddingBottom:4}}><div style={{minWidth:CS_TABLE_W}}>
        <CSTableHeader sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
        <div style={{paddingTop:8}}>
          {pageRows.length===0 ? (
            <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>No claim records match the current filters.</div>
          ) : pageRows.map(r=>(
            <React.Fragment key={r.id}>
              <CSTableRow row={r} expanded={!!expandedIds[r.id]} onToggle={toggleExpand}
                reviewed={!!reviewedSet[r.id]} onReviewed={toggleReviewed} onIntervention={setInterventionRow} />
              {expandedIds[r.id] && <CSChildSection row={r} />}
            </React.Fragment>
          ))}
        </div>
        </div></div>
      </div>
      {interventionRow && <CSInterventionDrawer row={interventionRow} onClose={()=>setInterventionRow(null)} />}
      <CSPagination total={total} page={page} perPage={perPage} onPage={(p)=>setPage(Math.min(Math.max(1,p), Math.max(1,Math.ceil(total/perPage))))} onPerPage={setPerPage} />
    </div>
  );
}

if (typeof window !== "undefined") window.ClaimStatusView = ClaimStatusView;
