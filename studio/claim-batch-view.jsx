// Claim Batch View — a structural clone of the PCR View (rcd-request-view.jsx):
// same filter bar, title cluster, clickable summary strip, AT status row, grid
// table with child accordion, review checkbox, intervention slideout and
// pagination. Only the columns and data change — they come from the
// "Claims - Batch View" Figma frame.
const { useState: useCB, useEffect: useCBE, useRef: useCBR } = React;

// ── Mock data ─────────────────────────────────────────────────
const CB_GATEWAYS = ["Waystar", "Availity", "Change Healthcare"];
const CB_MODELS   = ["PDGM", "PPS", "FFS"];
const CB_BILLTYPE = ["Claim", "RAP", "NOA"];
const CB_PARSING  = ["Parsed", "Parsed with Warnings", "Parse Failed"];
const CB_AUDITORS = [
  { name:"Sarah Mitchell",  phone:"(469) 555-0142" },
  { name:"James Thornton",  phone:"(214) 555-0188" },
  { name:"Priya Raman",     phone:"(972) 555-0117" },
  { name:"Daniel Whitfield",phone:"(817) 555-0163" },
  { name:"Maria Gonzalez",  phone:"(469) 555-0129" },
];
const cbLongDate = (mdY, time) => {
  const m = String(mdY||"").match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!m) return mdY || "—";
  const yr = m[3].length===2 ? "20"+m[3] : m[3];
  return `${parseInt(m[2],10)} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m[1],10)-1]} ${yr} ${time}`;
};
const cbPad = (n) => String(n).padStart(2,"0");
// 30 batches — the Figma tallies: All 30, Accepted 26, Rejected 02, Exceptions 10,
// AT Completed 28, Needs Attention 01, Needs Intervention 00, In Progress 01.
const CB_ROWS = Array.from({length:30},(_,i)=>{
  const n = i+1;
  const status = n<=26 ? "Accepted" : (n<=28 ? "Rejected" : "In Process");
  const at = n===29 ? "warning" : (n===30 ? "hourglass" : "thumb");
  const day = 21 - (i % 12);
  const hh = 10 - (i % 6);
  const mm = (53 - i*3 + 60) % 60;
  return {
    id:"b"+n,
    e5id: "E5CB09384" + (83 + i),
    fileName: "837_202504114" + String(15364748668 + i*137) + "_Batch" + cbPad(n) + ".txt",
    batchId: "Batch2367" + cbPad(89 - i),
    submitted: `12/${cbPad(day)}/25 ${cbPad(hh)}:${cbPad(mm)} PM EST`,
    claims: cbPad(2 + (i % 9)) + " Claims",
    claimCount: 2 + (i % 9),
    model: CB_MODELS[i % 3],
    billType: CB_BILLTYPE[i % 3],
    gateway: CB_GATEWAYS[i % 3],
    at,
    status,
    exceptions: (i % 3 === 0) && i < 30 && (i/3) < 10 ? 1 + (i % 4) : 0,
    parsing: n<=26 ? (i % 5 === 0 ? "Parsed with Warnings" : "Parsed") : (n<=28 ? "Parse Failed" : "Parsed"),
    docs: 1 + (i % 3),
    auditor: CB_AUDITORS[i % CB_AUDITORS.length],
    clinician: ["Sara Wilson","Jane Cooper","Robert Fox","Devon Lane","Cody Fisher"][i % 5],
  };
});
if (typeof window !== "undefined") window.CB_ROWS = CB_ROWS;

// ── Helpers ───────────────────────────────────────────────────
const cbIcon = (k, fb) => (typeof window!=="undefined" && window.__resources && window.__resources[k]) || fb;
const CB_AT_MAP = { completed:"thumb", warning:"warning", inprogress:"hourglass", intervention:"intervention" };
const CB_DASH = <span style={{color:"#cbd5e1"}}>—</span>;

function CBATIcon({ kind }) {
  if (kind==="thumb")     return <img title="Completed"       alt="Completed"       src={cbIcon("atCompleted","icons/at-completed.png")} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind==="warning")   return <img title="Needs Attention" alt="Needs Attention" src={cbIcon("atNeedsAttention","icons/at-needs-attention.png")} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind==="hourglass") return <img title="In Progress"     alt="In Progress"     src={cbIcon("atInProgress","icons/at-in-progress.png")} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind==="intervention") return (window.RCDInterventionGlyph ? <window.RCDInterventionGlyph /> : null);
  return CB_DASH;
}

const CB_PILL = {
  "Accepted":   { bg:"#f0fdf4", bd:"#16a34a", c:"#16a34a" },
  "Rejected":   { bg:"#fef2f2", bd:"#dc2626", c:"#dc2626" },
  "In Process": { bg:"#eff6ff", bd:"#3f7ba8", c:"#3f7ba8" },
};
function CBPill({ status }) {
  const s = CB_PILL[status] || { bg:"#f1f5f9", bd:"#94a3b8", c:"#64748b" };
  return <span style={{display:"inline-block",maxWidth:"100%",boxSizing:"border-box",padding:"3px 10px",borderRadius:2,background:s.bg,border:`1px solid ${s.bd}`,color:s.c,font:"500 11px/14px Roboto",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{status}</span>;
}

// Parsing Status — the fact-check glyph from the frame, tinted by outcome.
function CBParsingGlyph({ value }) {
  const c = value==="Parse Failed" ? "#dc2626" : value==="Parsed with Warnings" ? "#d97706" : "rgba(176,210,162,1)";
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" role="img" aria-label={value}><title>{value}</title>
      <rect x="3" y="2.5" width="14" height="15" rx="2" fill="none" stroke={c} strokeWidth="1.6" />
      <path d="M6.5 6.5h7M6.5 9.5h4" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.6 13.2l2 2 4-4.4" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
// Docs — the attachment glyph from the frame.
function CBDocsGlyph({ count }) {
  return (
    <span title={count + " document" + (count===1?"":"s")} style={{display:"inline-flex",alignItems:"center",gap:4,cursor:"pointer"}}>
      <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M12.7 5.1 7 10.8a2.1 2.1 0 0 0 3 3l5.2-5.2a3.6 3.6 0 0 0-5.1-5.1L4.9 9.4a5.1 5.1 0 0 0 7.2 7.2l3.4-3.4" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span style={{font:"500 12px/16px Roboto",color:"#2563eb"}}>{count}</span>
    </span>
  );
}

// ── Filter bar ────────────────────────────────────────────────
function CBFilterChip({ label, onRemove }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:10,background:"#f4f6f9",border:"1px solid #d8dee6",borderRadius:6,padding:"6px 10px",font:"400 12px/16px Roboto",color:"#334155",whiteSpace:"nowrap",flexShrink:0}}>
      {label}
      <button type="button" title="Remove filter" onClick={onRemove} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",border:"none",background:"transparent",color:"#64748b",fontSize:13,lineHeight:1,cursor:"pointer",padding:0}}>✕</button>
    </span>
  );
}

const CB_FILTER_FIELDS = [
  { key:"gateway", label:"Gateway" },
  { key:"model",   label:"Payment Model" },
  { key:"status",  label:"Batch Status" },
];

function CBFilterBar({ chips, fieldFilters, onFieldFilters, onClearAll, searchValue, onSearch }) {
  const [open, setOpen] = useCB(false);
  const FP = typeof window!=="undefined" && window.FilterPopover;
  const labelOf = (k) => (CB_FILTER_FIELDS.find(f=>f.key===k)||{}).label || k;
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
        {open && FP && <FP fields={CB_FILTER_FIELDS} rows={CB_ROWS} initial={fieldFilters} onApply={(f)=>{ onFieldFilters(f); setOpen(false); }} onClose={()=>setOpen(false)} />}
      </div>
      <div className="chip-scroll" style={{display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap",overflowX:"auto",flex:"1 1 auto",minWidth:0}}>
        {chips.map(c => <CBFilterChip key={c.id} label={c.label} onRemove={c.onRemove} />)}
        {fieldTags.map(t => <CBFilterChip key={t.id} label={t.label} onRemove={t.onRemove} />)}
      </div>
      {(chips.length + fieldTags.length) > 0 && (
        <button type="button" onClick={onClearAll} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",padding:"5px 4px",flexShrink:0,whiteSpace:"nowrap"}}>Clear all</button>
      )}
      <div style={{position:"relative",flexShrink:0}}>
        <img src={cbIcon("searchIcon","icons/search.svg")} alt="search" style={{width:14,height:14,objectFit:"contain",position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}} />
        <input type="text" value={searchValue} onChange={e=>onSearch(e.target.value)} placeholder="Search Batch Records" style={{width:240,background:"#fff",border:"1px solid #93c5e8",borderRadius:6,padding:"6px 12px 6px 32px",font:"400 12px/16px Roboto",color:"#0f172a",outline:"none"}} />
      </div>
    </div>
  );
}

// ── Title cluster ─────────────────────────────────────────────
function CBTitleCluster() {
  return (
    <div>
      <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap"}}>
        <span style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Claims - Batch View</span>
      </div>
      <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Consolidated view of Batch Claim Submissions</div>
      <div style={{marginTop:10,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block"}}>Expand a row to view the claims inside the batch</div>
    </div>
  );
}

// ── Batch Status summary box ──────────────────────────────────
const CB_STATUS = [
  { id:"all_records", label:"All Batches", color:"rgb(21,95,130)",  weight:1.0, match:null },
  { id:"accepted",    label:"Accepted",    color:"rgb(65,159,74)",  weight:1.0, match:(r)=>r.status==="Accepted" },
  { id:"rejected",    label:"Rejected",    color:"rgb(215,65,65)",  weight:1.0, match:(r)=>r.status==="Rejected" },
  { id:"exceptions",  label:"Exceptions",  color:"rgb(156,119,25)", weight:1.1, match:(r)=>r.exceptions>0 },
];

function CBStatusStrip({ scopedRows, totalRows, activeStatus, onPick }) {
  return (
    <div style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",overflow:"hidden"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333",flexShrink:0}}>
        <span>Batch Status</span><span>Summary</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-start",flex:1}}>
        {CB_STATUS.map(s=>{
          const isAll = s.id==="all_records";
          const active = !isAll && activeStatus===s.id;
          const dim = activeStatus && !active;
          const count = isAll ? totalRows : scopedRows.filter(s.match).length;
          return (
            <div key={s.id} role="button" title={s.label} onClick={()=>onPick(isAll ? null : (active ? null : s.id))}
              style={{flex:`${s.weight} 1 0`,minWidth:96,boxSizing:"border-box",padding:"10px 16px 12px",cursor:"pointer",opacity:(dim&&!isAll)?0.35:1,transition:"opacity .12s,background .12s",background:active?"#f8fafc":"transparent"}}
              onMouseEnter={e=>{ if(!active&&!dim) e.currentTarget.style.background="#fafbfc"; }}
              onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
              <div style={{height:3,borderRadius:2,background:s.color,opacity:active?1:0.85,marginBottom:8,marginLeft:-9,marginRight:-9}}></div>
              <div style={{font:"400 12px/15px Roboto",color:(dim&&isAll)?"#b0b0b0":"#333",textWrap:"pretty",minHeight:30}}>{s.label}</div>
              <div style={{font:"600 18px/22px Roboto",color:(dim&&isAll)?"#b0b0b0":"#0f172a",marginTop:4}}>{cbPad(count)}</div>
              {activeStatus && isAll && (
                <button type="button" onClick={e=>{ e.stopPropagation(); onPick(null); }} style={{marginTop:4,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}><span style={{fontSize:11}}>↻</span>Reset</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Automation (AT) Status row ────────────────────────────────
const CB_AT_ITEMS = [
  { id:"completed",  label:"Completed",       kind:"thumb"     },
  { id:"warning",    label:"Needs Attention", kind:"warning",   num:"#d97706", caret:true },
  { id:"intervention", label:"Needs Intervention", kind:"intervention", num:"#d97706", caret:true },
  { id:"inprogress", label:"In Progress",     kind:"hourglass" },
];
function CBAutomationStatus({ scopedRows, atFilter, onFilter }) {
  const [openMenu, setOpenMenu] = useCB(null);
  const ref = useCBR(null);
  useCBE(()=>{ if(!openMenu) return; const h=(e)=>{ if(ref.current && !ref.current.contains(e.target)) setOpenMenu(null); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[openMenu]);
  const breakdown = {};
  scopedRows.filter(r=>r.at==="warning").forEach(r=>{ breakdown[r.parsing] = (breakdown[r.parsing]||0)+1; });
  const reasons = {};
  scopedRows.filter(r=>r.at==="intervention").forEach(r=>{ cbInterventions(r).filter(it=>it.status!=="Completed").forEach(it=>{ reasons[it.reason] = (reasons[it.reason]||0)+1; }); });
  const menu = openMenu==="intervention"
    ? { title:"Needs Intervention by reason", data:reasons, w:340 }
    : { title:"Needs Attention by parsing status", data:breakdown, w:280 };
  return (
    <div ref={ref} style={{display:"flex",alignItems:"center",justifyContent:"flex-end",font:"400 13px/16px Roboto",color:"#333",marginTop:10,position:"relative"}}>
      <span style={{color:"#94a3b8",marginRight:12}}>Automation (AT) Status :</span>
      {CB_AT_ITEMS.map((s,i)=>{
        const active = atFilter===s.id;
        const dim = atFilter && !active;
        const count = scopedRows.filter(r=>r.at===s.kind).length;
        return (
          <React.Fragment key={s.id}>
            {i>0 && <span style={{width:1,height:18,background:"#e2e8f0",margin:"0 10px"}}></span>}
            <button type="button" onClick={()=>onFilter(active?null:s.id)} style={{background:"transparent",border:"none",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,padding:"2px 6px",borderRadius:4,opacity:dim?0.4:1,transition:"opacity .12s"}}>
              <CBATIcon kind={s.kind} />
              <span style={{color:"#0f172a",font:"400 13px/16px Roboto"}}>{s.label}</span>
              <span style={{font:"600 13px/16px Roboto",color:s.num||"#0f172a"}}>{cbPad(count)}</span>
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
              <span style={{flex:1}}>{k}</span><span style={{fontWeight:600,color:"#d97706"}}>{cbPad(menu.data[k])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────
const CB_COLS = [
  { key:"e5id",     label:"Batch E5 ID",          grid:"130px", sortable:true },
  { key:"fileName", label:"Batch File Name",      grid:"314px", sortable:true },
  { key:"batchId",  label:"Batch ID",             grid:"124px", sortable:true },
  { key:"submitted",label:"Submission Time",      grid:"176px", sortable:true },
  { key:"claims",   label:"Total Claims in Batch", grid:"150px", sortable:true },
  { key:"model",    label:"Payment Model",        grid:"132px", sortable:true },
  { key:"billType", label:"Bill Type",            grid:"104px", sortable:true },
  { key:"gateway",  label:"Gateway",              grid:"148px", sortable:true },
  { key:"at",       label:"AT Status",            grid:"88px",  sortable:true, align:"center" },
  { key:"status",   label:"Batch Status",         grid:"140px", sortable:true, align:"center" },
  { key:"parsing",  label:"Parsing Status",       grid:"126px", sortable:true, align:"center" },
  { key:"docs",     label:"Docs",                 grid:"78px",  sortable:false, align:"center" },
  { key:"reviewed", label:"Reviewed?",            grid:"88px",  sortable:false, align:"center" },
];
const CB_GRID = CB_COLS.map(c=>c.grid).join(" ");
const CB_FROZEN = 4;
// Last four columns stay pinned to the right edge while the rest scroll under them.
const cbFrozen = (i, pad, isHeader) => {
  if (i < CB_COLS.length - CB_FROZEN) return null;
  let r = pad;
  for (let k=i+1;k<CB_COLS.length;k++) r += parseInt(CB_COLS[k].grid,10) + 6;
  const bg = isHeader ? "#f8fafc" : "#fff";
  const isFirst = i === CB_COLS.length - CB_FROZEN;
  const isLast  = i === CB_COLS.length - 1;
  // Opaque box-shadows fill the 6px grid gaps (and the row's right padding) so no
  // scrolling content shows between the pinned columns.
  const fills = [
    isLast ? `${pad + 8}px 0 0 0 ${bg}` : `8px 0 0 0 ${bg}`,
    `-8px 0 0 0 ${bg}`,
  ];
  if (isFirst) fills.push("-12px 0 9px -7px rgba(15,23,42,0.18)");
  return { position:"sticky", right:r, zIndex:isHeader?9:5, background:bg, boxShadow:fills.join(", ") };
};
const CB_TABLE_W = CB_COLS.reduce((a,c)=>a+parseInt(c.grid,10),0) + CB_COLS.length*6 + 24;

function CBSortArrows({ active, dir }) {
  const up   = active && dir==="asc"  ? "#2563eb" : "rgba(0,0,0,0.25)";
  const down = active && dir==="desc" ? "#2563eb" : "rgba(0,0,0,0.25)";
  return (
    <svg width="10" height="15" viewBox="0 0 9 14" fill="none" style={{marginRight:3,flex:"none"}}>
      <path d="M7.74699 7.40234H1.25301C1.05823 7.40234 0.949473 7.608 1.0701 7.7484L4.31708 11.5135C4.41003 11.6213 4.58899 11.6213 4.68291 11.5135L7.9299 7.7484C8.05053 7.608 7.94177 7.40234 7.74699 7.40234Z" fill={down}/>
      <path d="M7.9299 6.24825L4.68291 2.48317C4.58997 2.3754 4.41101 2.3754 4.31708 2.48317L1.0701 6.24825C0.949473 6.38865 1.05823 6.59431 1.25301 6.59431H7.74699C7.94177 6.59431 8.05053 6.38865 7.9299 6.24825Z" fill={up}/>
    </svg>
  );
}

function CBTableHeader({ sortKey, sortDir, onSort }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:CB_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",gap:6,position:"sticky",top:0,zIndex:6,boxShadow:"0 1px 0 #e2e8f0"}}>
      {CB_COLS.map((c,ci)=>(
        <div key={c.key} onClick={c.sortable?()=>onSort(c.key):undefined}
          style={{font:"500 11px/14px Roboto",color:"#64748b",display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",cursor:c.sortable?"pointer":"default",userSelect:"none",overflow:"hidden",whiteSpace:"nowrap",...(cbFrozen(ci,12,true)||{})}}>
          {c.sortable && <CBSortArrows active={sortKey===c.key} dir={sortDir} />}
          {c.label}
        </div>
      ))}
    </div>
  );
}

// Child accordion — the claims inside the batch, derived from the parent row.
const CB_CHILD_COLS = ["Claim ID","Patient Name","MBI","Service Line","Bill Type","Billed Amount","Claim Status","Exception"];
const CB_CHILD_GRID = "150px 170px 150px 140px 110px 140px 140px 220px";
const CB_CHILD_NAMES = ["Alvarez, Maria","Brooks, Daniel","Chen, Wei","Dixon, Harold","Ellis, Joanne","Farrell, Owen","Gupta, Anil","Hayes, Laura","Ibrahim, Nadia"];
const CB_CHILD_EXC = ["—","Missing NPI on service line 2","Invalid HCPCS modifier","Duplicate claim suspected","Patient MBI mismatch"];
function cbChildRows(row) {
  const seed = parseInt(row.id.replace(/\D/g,""),10) || 1;
  return Array.from({length:row.claimCount},(_,i)=>{
    const k = seed + i;
    const exc = row.exceptions > 0 && i < row.exceptions ? CB_CHILD_EXC[1 + (k % 4)] : "—";
    return {
      claimId: "CLM" + String(1000000 + k*911).slice(0,7),
      name: CB_CHILD_NAMES[k % CB_CHILD_NAMES.length],
      mbi: ["1EG4-TE5-MK73","2KL9-QW1-PT44","7RT2-YU8-LM90","9PA5-BN3-ZX21","4MN7-CV6-QA18"][k % 5],
      serviceLine: k % 3 === 0 ? "Hospice" : "Home Health",
      billType: row.billType,
      amount: "$" + (1200 + (k*137) % 4800).toLocaleString() + ".00",
      status: exc === "—" ? (row.status === "Rejected" ? "Rejected" : "Accepted") : "In Process",
      exc,
    };
  });
}

function CBChildSection({ row }) {
  const kids = cbChildRows(row);
  return (
    <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderTop:"none",borderRadius:"0 0 6px 6px",padding:"14px 20px 16px 44px",marginBottom:8}}>
      <div style={{font:"500 12px/16px Roboto",color:"#0f172a",marginBottom:8}}>Claims in Batch — {row.batchId}</div>
      <div className="ws-hscroll" style={{border:"1px solid #e5e7eb",borderRadius:2,overflowX:"auto",background:"#fff"}}><div style={{minWidth:1220}}>
        <div style={{display:"grid",gridTemplateColumns:CB_CHILD_GRID,background:"#f8fafc",borderBottom:"1px solid #e5e7eb"}}>
          {CB_CHILD_COLS.map(c=>(
            <div key={c} style={{font:"500 11px/14px Roboto",letterSpacing:"0.04em",textTransform:"uppercase",color:"#64748b",padding:"10px 12px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c}</div>
          ))}
        </div>
        {kids.map((k,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:CB_CHILD_GRID,borderBottom:i===kids.length-1?"none":"1px solid #eef2f7"}}>
            {[k.claimId,k.name,k.mbi,k.serviceLine,k.billType,k.amount,k.status,k.exc].map((v,j)=>(
              <div key={j} style={{font:"500 12px/16px Roboto",color:"#334155",padding:"11px 12px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v==="—" ? CB_DASH : v}</div>
            ))}
          </div>
        ))}
      </div></div>
    </div>
  );
}

function CBTableRow({ row, expanded, onToggle, reviewed, onReviewed, onIntervention, accent="#2563eb" }) {
  const cell = (align, ci) => ({font:"500 12px/16px Roboto",color:"#333333",display:"flex",alignItems:"center",justifyContent:align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,...(cbFrozen(ci==null?-1:ci,11)||{})});
  return (
    <div style={{position:"relative",display:"grid",gridTemplateColumns:CB_GRID,alignItems:"center",height:48,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:expanded?"6px 6px 0 0":6,marginBottom:expanded?0:8,boxShadow:expanded?"none":"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",gap:6}}>
      <div style={cell()}>
        <span onClick={(e)=>{ e.stopPropagation(); onToggle(row.id); }} title={expanded?"Collapse":"Expand"} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginRight:8,color:accent,transition:"transform .15s",transform:expanded?"rotate(90deg)":"rotate(0deg)",flexShrink:0}}>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2 L11 7 L4 12 Z" fill="currentColor" /></svg>
        </span>
        <span title={row.e5id} style={{font:"500 13px/16px Roboto",color:"#333333",overflow:"hidden",textOverflow:"ellipsis"}}>{row.e5id}</span>
      </div>
      <div style={cell()} title={row.fileName}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{row.fileName}</span></div>
      <div style={cell()}>{row.batchId}</div>
      <div style={cell()}>{row.submitted}</div>
      <div style={cell()}><span style={{background:"rgba(22,119,255,0.1)",borderRadius:2,padding:"4px 10px",font:"500 12px/16px Roboto",color:"#1f2937"}}>{row.claims}</span></div>
      <div style={cell()}>{row.model}</div>
      <div style={cell()}>{row.billType}</div>
      <div style={cell()}>{row.gateway}</div>
      <div style={cell("center")}>
        {row.at==="intervention"
          ? <span role="button" title="Needs Intervention — view details" onClick={(e)=>{ e.stopPropagation(); onIntervention && onIntervention(row); }} style={{display:"inline-flex",alignItems:"center",cursor:"pointer"}}><CBATIcon kind={row.at} /></span>
          : <CBATIcon kind={row.at} />}
      </div>
      <div style={cell("center",9)}><CBPill status={row.status} /></div>
      <div style={cell("center",10)}><CBParsingGlyph value={row.parsing} /></div>
      <div style={cell("center",11)}><CBDocsGlyph count={row.docs} /></div>
      <div style={cell("center",12)} onClick={(e)=>e.stopPropagation()}>
        <span role="checkbox" aria-checked={!!reviewed} tabIndex={0} onClick={()=>onReviewed(row.id)}
          style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:`1px solid ${reviewed?accent:"#d8d8d8"}`,borderRadius:3,background:reviewed?accent:"#fff",cursor:"pointer"}}>
          {reviewed && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}
        </span>
      </div>
    </div>
  );
}

// ── Needs-Intervention slideout ───────────────────────────────
function cbInterventions(row) {
  const n = parseInt(row.id.replace(/\D/g,""),10) || 1;
  const defs = [
    { key:"BATCH_FILE",     value:row.batchId,   reason:"Batch file failed schema validation at the gateway",        stage:"Transmission" },
    { key:"PAYER_ID",       value:row.gateway,   reason:"Payer identifier not recognised by the clearinghouse",      stage:"Submission" },
    { key:"CLAIM_COUNT",    value:row.claims,    reason:"Claim count in the batch header does not match the file",   stage:"Batch Assembly" },
    { key:"DOC_PACKET",     value:row.docs+" attached", reason:"Required documentation packet incomplete at submission time", stage:"Document Upload" },
    { key:"PAYMENT_MODEL",  value:row.model,     reason:"Payment model could not be resolved for the billing period", stage:"PCR Assembly" },
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
      created: cbLongDate(row.submitted, "10:35 AM"),
      completed: done ? cbLongDate(row.submitted, "02:18 PM") : "—",
      notes: done ? "Resolved on automated retry — no manual action required." : "",
      by: done ? row.clinician : "—",
    };
  });
}

const CB_INT_COLS = [
  { k:"key",     label:"Key",          w:"minmax(150px,1fr)", bold:true },
  { k:"value",   label:"Value",        w:"minmax(110px,0.8fr)" },
  { k:"reason",  label:"Reason",       w:"minmax(240px,1.6fr)", tone:"#b45309" },
  { k:"stage",   label:"Stage",        w:"minmax(170px,1.1fr)" },
  { k:"created", label:"Date Created", w:"minmax(180px,1.1fr)" },
];
const CB_DONE_COLS = CB_INT_COLS.concat([
  { k:"by",        label:"Completed By",   w:"minmax(150px,1fr)" },
  { k:"completed", label:"Date Completed", w:"minmax(180px,1.1fr)" },
  { k:"notes",     label:"Notes",          w:"minmax(200px,1.3fr)" },
]);

function CBIntSortIcon({ active }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,borderRadius:"50%",background:active?"#1677FF":"#f1f5f9",border:active?"none":"1px solid #dbe2ea",flexShrink:0}}>
      <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><path d="M4 1.4 L6.4 4.4 H1.6 Z" fill={active?"#fff":"#94a3b8"} /></svg>
    </span>
  );
}

function CBIntTable({ items, cols, onComplete, empty }) {
  const [sortKey, setSortKey] = useCB(null);
  const [sortDir, setSortDir] = useCB("asc");
  const [noteFor, setNoteFor] = useCB(null);
  const [note, setNote]       = useCB("");
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
            <CBIntSortIcon active={sortKey===c.k} />{c.label}
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

function CBInterventionDrawer({ row, onClose }) {
  useCBE(()=>{ const h=(e)=>{ if(e.key==="Escape") onClose(); }; document.addEventListener("keydown",h); return ()=>document.removeEventListener("keydown",h); },[onClose]);
  const [tab, setTab] = useCB("open");
  const [done, setDone] = useCB({});
  const all = row ? cbInterventions(row) : [];
  if (!row) return null;
  const isDone = (it)=> !!done[it.id] || it.status === "Completed";
  const open = all.filter(it=>!isDone(it));
  const completed = all.filter(isDone).map(it=> done[it.id]
    ? {...it, completed:done[it.id].at, by:done[it.id].by, notes:done[it.id].notes}
    : {...it, notes:it.notes||""});
  const markDone = (it, notes)=>{
    const d = new Date();
    const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
    const at = `${d.getDate()} ${mon} ${d.getFullYear()} ${cbPad(((d.getHours()+11)%12)+1)}:${cbPad(d.getMinutes())} ${d.getHours()<12?"AM":"PM"}`;
    setDone(m=>({...m,[it.id]:{ at, by:row.clinician, notes }}));
  };
  const tabs = [["open","Needs Interventions",open.length],["done","Completed Interventions",completed.length]];
  return (
    <React.Fragment>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.18)"}}></div>
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:1180,maxWidth:"94vw",background:"#fff",zIndex:901,display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.13)",animation:"cbIntSlide .22s cubic-bezier(0.32,0.72,0,1)"}}>
        <style>{`@keyframes cbIntSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"22px 24px 16px"}}>
          <span style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Needs Intervention</span>
          <button onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",padding:4,color:"#64748b",font:"400 18px/18px Roboto"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"0 16px",padding:"0 24px 16px",borderBottom:"1px solid #e5e7eb"}}>
          {[["Batch ID",row.batchId],["Gateway",row.gateway],["Total Claims",row.claims],["Batch Status",row.status]].map(([l,v])=>(
            <div key={l}>
              <div style={{font:"400 11px/14px Roboto",color:"#94a3b8",marginBottom:2}}>{l}</div>
              <div style={{font:"500 13px/18px Roboto",color:"#0f172a"}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",padding:"0 24px",borderBottom:"1px solid #e5e7eb"}}>
          {tabs.map(([id,label,count])=>(
            <button key={id} onClick={()=>setTab(id)} style={{border:"none",background:"transparent",padding:"12px 0",marginRight:26,cursor:"pointer",font:"500 13px/16px Roboto",color:tab===id?"#2563eb":"#475569",borderBottom:tab===id?"2px solid #2563eb":"2px solid transparent"}}>
              {label} ({cbPad(count)})
            </button>
          ))}
        </div>
        <div className="ws-scrollbody" style={{flex:1,overflow:"auto",padding:"18px 24px 28px"}}>
          {tab==="open"
            ? <CBIntTable items={open} cols={CB_INT_COLS} onComplete={markDone} empty="No open interventions for this batch." />
            : <CBIntTable items={completed} cols={CB_DONE_COLS} empty="No completed interventions yet." />}
        </div>
      </div>
    </React.Fragment>
  );
}

// ── Pagination ────────────────────────────────────────────────
function CBPagination({ total, page, perPage, onPage, onPerPage }) {
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

// ── Claim Batch View (main) ───────────────────────────────────
function ClaimBatchView({ review, onExitReview }) {
  const [statusFilter, setStatusFilter] = useCB(null);
  const [atFilter, setAtFilter]         = useCB(null);
  const [searchQ, setSearchQ]           = useCB("");
  const [sortKey, setSortKey]           = useCB(null);
  const [sortDir, setSortDir]           = useCB("asc");
  const [fieldFilters, setFieldFilters] = useCB([]);
  const [reviewedSet, setReviewedSet]   = useCB({});
  const [expandedIds, setExpandedIds]   = useCB({});
  const [page, setPage]                 = useCB(1);
  const [perPage, setPerPage]           = useCB(10);
  const [bodyH, setBodyH]               = useCB(()=> Math.max(280, window.innerHeight - 430));
  const [interventionRow, setInterventionRow] = useCB(null);

  useCBE(()=>{ const h=()=>setBodyH(Math.max(280, window.innerHeight - 430)); window.addEventListener("resize",h); return ()=>window.removeEventListener("resize",h); },[]);

  const toggleExpand   = (id) => setExpandedIds(m=>({...m,[id]:!m[id]}));
  const toggleReviewed = (id) => setReviewedSet(m=>({...m,[id]:!m[id]}));
  const onSort = (k) => { if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };

  const filterSig = JSON.stringify([statusFilter,atFilter,searchQ,fieldFilters,review,perPage]);
  useCBE(()=>{ setPage(1); }, [filterSig]);

  let base = CB_ROWS;
  base = base.filter(r => fieldFilters.every(f => f.values.includes(r[f.field])));
  if (searchQ.trim()) { const q = searchQ.toLowerCase(); base = base.filter(r=>[r.e5id,r.fileName,r.batchId,r.gateway,r.status].join(" ").toLowerCase().includes(q)); }
  const needsReview = (r) => r.at==="warning" || r.at==="intervention" || r.status==="Rejected" || r.exceptions>0;
  if (review) base = base.filter(r => needsReview(r) && !reviewedSet[r.id]);

  const scopedForStatus = atFilter ? base.filter(r=>r.at===CB_AT_MAP[atFilter]) : base;
  const statusMatch = statusFilter ? (CB_STATUS.find(s=>s.id===statusFilter)||{}).match : null;
  const scopedForAt = statusMatch ? base.filter(statusMatch) : base;

  let rows = base;
  if (statusMatch) rows = rows.filter(statusMatch);
  if (atFilter)    rows = rows.filter(r=>r.at===CB_AT_MAP[atFilter]);
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
  if (statusFilter) { const s = CB_STATUS.find(x=>x.id===statusFilter); chips.push({ id:"status", label:`Batch Status: ${s?s.label:statusFilter}`, onRemove:()=>setStatusFilter(null) }); }
  if (atFilter) { const a = CB_AT_ITEMS.find(x=>x.id===atFilter); chips.push({ id:"at", label:`AT Status: ${a?a.label:atFilter}`, onRemove:()=>setAtFilter(null) }); }
  if (review) {
    [
      { id:"rv-at", label:"Automation Status: Needs Attention" },
      { id:"rv-st", label:"Batch Status: Rejected / Exceptions" },
      { id:"rv-nr", label:"Reviewed : Not Reviewed" },
    ].forEach(c=>chips.push({ ...c, onRemove:()=>onExitReview&&onExitReview() }));
  }
  const clearAll = () => { setStatusFilter(null); setAtFilter(null); setFieldFilters([]); setSearchQ(""); if(review && onExitReview) onExitReview(); };

  return (
    <div style={{background:"#fff"}} data-screen-label="01 Claims Batch View">
      <CBFilterBar chips={chips} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters}
        onClearAll={clearAll} searchValue={searchQ} onSearch={setSearchQ} />
      <div style={{padding:"20px 24px 0",display:"flex",alignItems:"flex-start",gap:32,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 320px",minWidth:0}}>
          <CBTitleCluster />
        </div>
        <div style={{flex:"1 1 640px",minWidth:0}}>
          <CBStatusStrip scopedRows={scopedForStatus} totalRows={base.length} activeStatus={statusFilter} onPick={setStatusFilter} />
          <CBAutomationStatus scopedRows={scopedForAt} atFilter={atFilter} onFilter={setAtFilter} />
        </div>
      </div>
      <div style={{padding:"18px 24px 0"}}>
        <div className="ws-hscroll ws-scrollbody" style={{overflow:"auto",maxHeight:bodyH+48,paddingBottom:4}}><div style={{minWidth:CB_TABLE_W}}>
        <CBTableHeader sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
        <div style={{paddingTop:8}}>
          {pageRows.length===0 ? (
            <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>No batch records match the current filters.</div>
          ) : pageRows.map(r=>(
            <React.Fragment key={r.id}>
              <CBTableRow row={r} expanded={!!expandedIds[r.id]} onToggle={toggleExpand}
                reviewed={!!reviewedSet[r.id]} onReviewed={toggleReviewed} onIntervention={setInterventionRow} />
              {expandedIds[r.id] && <CBChildSection row={r} />}
            </React.Fragment>
          ))}
        </div>
        </div></div>
      </div>
      {interventionRow && <CBInterventionDrawer row={interventionRow} onClose={()=>setInterventionRow(null)} />}
      <CBPagination total={total} page={page} perPage={perPage} onPage={(p)=>setPage(Math.min(Math.max(1,p), Math.max(1,Math.ceil(total/perPage))))} onPerPage={setPerPage} />
    </div>
  );
}

if (typeof window !== "undefined") window.ClaimBatchView = ClaimBatchView;
