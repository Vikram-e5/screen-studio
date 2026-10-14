// Remits — Denial Management, Cash Posting (placeholder), Automation Log.
const { useState: useRM } = React;

const RM_NAMES = ["Marvin Mckinney","Esther Howard","Cameron Williamson","Leslie Alexander","Robert Fox","Jenny Wilson","Jacob Jones","Guy Hawkins","Jane Cooper","Kristin Watson","Darlene Robertson","Ralph Edwards","Courtney Henry","Wade Warren"];
const RM_SERVICE = ["Home Health","Hospice","Personal Care","Skilled Nursing","Therapy"];
const RM_DENIALS = [["CO-16","N290"],["CO-197"],["PR-204"],["CO-50","M127"],["CO-29"],["CO-18"],["OA-23","N179"],["CO-45"]];
const RM_CH_LOC = ["Availity — Jacksonville","Change Healthcare — Nashville","Waystar — Louisville","Office Ally — Vancouver"];
const RM_CH_PAYOR = ["Medicare Part A","Aetna Medicare","Humana","UnitedHealthcare","Texas Medicaid","Cigna"];
const RM_CH_INS = ["MCRA01","AET204","HUM118","UHC335","TXM902","CIG417"];
const RM_REMIT = ["Denied","Partially Paid","Appealed","Resubmitted","Written Off"];
const RM_AT = ["thumb","warning","thumb","hourglass","thumb","warning","thumb"];

const RM_ROWS = RM_NAMES.map((name,i)=>{
  const d = 2 + (i*2) % 27;
  return {
    id: "rm"+(i+1),
    name,
    transInit: "04/" + String(d).padStart(2,"0") + "/25",
    serviceLine: RM_SERVICE[i % RM_SERVICE.length],
    pcn: "PCN" + String(784210 + i*137).padStart(8,"0"),
    paymentId: "PMT-" + String(55012 + i*41),
    denialCodes: RM_DENIALS[i % RM_DENIALS.length],
    chLocation: RM_CH_LOC[i % RM_CH_LOC.length],
    chPayor: RM_CH_PAYOR[i % RM_CH_PAYOR.length],
    chInsCode: RM_CH_INS[i % RM_CH_INS.length],
    eob: i % 4 !== 2,
    remitStatus: RM_REMIT[i % RM_REMIT.length],
    at: RM_AT[i % RM_AT.length],
    ehrSync: i % 3 !== 1,
  };
});
if (typeof window !== "undefined") window.RM_ROWS = RM_ROWS;
const rmPad = n => String(n).padStart(2,"0");
const rmDash = <span style={{color:"#94a3b8"}}>—</span>;
// WellSky denial fields
const RMW_AGENCY = ["CMHC","CMHC","Sunrise HH","BrightPath Hospice","CarePoint"];
const RMW_WSLOC = ["Comprehensive Medical Home Care","Comprehensive Medical Home Care","Sunrise Home Health — Tampa","BrightPath Hospice — Dallas","CarePoint Services — Louisville"];
const RMW_PAYER = ["Aetna","Humana","UnitedHealthcare","Medicaid Alabama","Cigna","Medicare Part A"];
const RMW_INS = ["60054","61101","87726","SKAL0","62308","MCRA01"];
const RMW_STAGE = ["Extract Denial Information","Match Patient in WellSky","Post Denial to WellSky","Upload EOB"];
const RMW_EXCL = [[],["CO-45"],[],["PR-1"],[],[],["CO-253"]];
RM_ROWS.forEach((r,i)=>{
  const d = rmPad(2 + (i*2) % 27);
  r.acct = String(66245539 + i*1187);
  r.arrived = "04/" + d + "/25 04:" + rmPad((i*7+52)%60) + " AM";
  r.wsPaymentId = String(1307001981 + i*313);
  r.mrn = i % 4 === 1 ? "—" : "MR" + String(410220 + i*91);
  r.agency = RMW_AGENCY[i % RMW_AGENCY.length];
  r.wsLoc = RMW_WSLOC[i % RMW_WSLOC.length];
  r.wsIns = RMW_INS[i % RMW_INS.length];
  r.wsPayer = RMW_PAYER[i % RMW_PAYER.length];
  r.wellskyPayer = i % 3 === 2 ? "—" : RMW_PAYER[i % RMW_PAYER.length];
  r.serviceDate = "03/" + d + "/25";
  r.checkDate = "04/" + d + "/25";
  r.wsDenials = i % 5 === 3 ? [] : r.denialCodes;
  r.excluded = RMW_EXCL[i % RMW_EXCL.length];
  r.clientName = i % 3 === 2 ? "—" : name2client(r.name);
  r.stage = r.at==="thumb" ? "Post Denial to WellSky" : RMW_STAGE[i % RMW_STAGE.length];
  r.reason = r.at==="warning" ? "Patient not found in WellSky" : "—";
  r.ended = r.at==="hourglass" ? "—" : "04/" + d + "/25 05:" + rmPad((i*11)%60) + " AM";
});
function name2client(n){ const p = n.split(" "); return (p[p.length-1] + ", " + p[0]).toUpperCase(); }
const RMW_COLS = [
  ["acct","Account Number","minmax(120px,1fr)"],["arrived","Transaction Arrived Date","minmax(160px,1.2fr)"],["wsPaymentId","Payment ID","minmax(110px,0.9fr)"],
  ["name","Patient Name","minmax(150px,1.3fr)"],["mrn","MRN","minmax(90px,0.8fr)"],["agency","Agency Name","minmax(130px,1fr)"],
  ["wsLoc","Waystar Location","minmax(220px,1.6fr)"],["wsIns","Waystar Insurance Code","minmax(150px,1fr)"],["wsPayer","Waystar Payer Name","minmax(140px,1.1fr)"],
  ["wellskyPayer","WellSky Payer Name","minmax(140px,1.1fr)"],["serviceDate","Service Date","minmax(100px,0.8fr)"],["checkDate","Check Date","minmax(100px,0.8fr)"],
  ["wsDenials","Denial Codes","minmax(130px,1fr)"],["excluded","Excluded Denial Codes","minmax(150px,1fr)"],["clientName","Client Name in WellSky Services","minmax(200px,1.3fr)"],
  ["stage","Current Stage","minmax(190px,1.4fr)"],["reason","Reason for Failure/Termination","minmax(220px,1.6fr)"],["ended","Transaction End Date","minmax(160px,1.2fr)"],
  ["at","AT Status","78px","center"],["ehrSync","EHR Sync","78px","center"],["reviewed","Reviewed?","86px","center"],
];
const RMW_GRID = RMW_COLS.map(c=>c[2]).join(" ");
const RMW_MIN_W = 3000;
const RMW_FILTERS = [{key:"agency",label:"Agency Name"},{key:"wsPayer",label:"Waystar Payer Name"},{key:"wsLoc",label:"Waystar Location"}];
const rmwFreeze = (k,bg) => k==="acct" ? { position:"sticky", left:0, zIndex:4, background:bg, paddingLeft:14, boxShadow:"2px 0 3px -1px rgba(15,23,42,0.10)" } : RM_RIGHT.includes(k) ? rmFreeze(k,bg) : null;
const rmCodes = (arr, empty) => arr.length ? arr.map(c=><span key={c} style={{padding:"1px 6px",borderRadius:3,background:"#fef2f2",border:"1px solid #fecaca",color:"#b91c1c",font:"500 11px/16px Roboto"}}>{c}</span>) : empty;

const rmIcon = (k) => (window.__resources&&window.__resources[k]);

// ── AT Status summary (Style B — 4 cards with top colour bar) ──
const RM_AT_CARDS = [
  { id:"all",       label:"All Records",     color:"rgb(21,95,130)",   match:()=>true },
  { id:"thumb",     label:"Completed",       color:"rgb(14,165,233)",  match:r=>r.at==="thumb",     icon:()=>rmIcon("atCompleted")||"icons/at-completed.png" },
  { id:"warning",   label:"Needs Attention", color:"rgb(245,158,11)",  match:r=>r.at==="warning",   icon:()=>rmIcon("atNeedsAttention")||"icons/at-needs-attention.png" },
  { id:"hourglass", label:"In Progress",     color:"rgb(148,163,184)", match:r=>r.at==="hourglass", icon:()=>rmIcon("atInProgress")||"icons/at-in-progress.png" },
];
function RMATSummary({ rows, active, onPick }) {
  return (
    <div style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",overflow:"hidden"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333",flexShrink:0}}>
        <span>Automation</span><span>Status</span>
      </div>
      <div style={{display:"flex"}}>
        {RM_AT_CARDS.map(c=>{
          const isAll = c.id==="all";
          const on = !isAll && active===c.id;
          const dim = active && !on && !isAll;
          return (
            <div key={c.id} role="button" onClick={()=>onPick(isAll||on?null:c.id)}
              style={{padding:"10px 16px 12px",cursor:"pointer",opacity:dim?0.35:1,background:on?"#f8fafc":"transparent",transition:"opacity .12s,background .12s",display:"flex",flexDirection:"column",gap:6,minWidth:96}}
              onMouseEnter={e=>{ if(!on) e.currentTarget.style.background="#fafbfc"; }}
              onMouseLeave={e=>{ if(!on) e.currentTarget.style.background="transparent"; }}>
              <div style={{height:3,borderRadius:2,background:c.color}}></div>
              <div style={{display:"flex",alignItems:"center",gap:5,font:"400 13px/17px Roboto",color:on?"#0f172a":"#605D5D",whiteSpace:"nowrap"}}>
                {c.icon && <img src={c.icon()} alt="" style={{width:14,height:14,objectFit:"contain"}} />}{c.label}
              </div>
              <div style={{font:"500 16px/20px Roboto",color:on?"#0f172a":"#605D5D"}}>{rmPad(rows.filter(c.match).length)}</div>
              {isAll && active && <button type="button" onClick={e=>{e.stopPropagation();onPick(null);}} style={{background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4,alignSelf:"flex-start"}}><span style={{fontSize:11}}>↻</span>Reset</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Grid ──
const RM_COLS = [
  { key:"name",        label:"Patient Name",                  grid:"minmax(150px,1.4fr)" },
  { key:"transInit",   label:"Trans Init Date",               grid:"minmax(100px,0.9fr)" },
  { key:"serviceLine", label:"Service Line",                  grid:"minmax(110px,1fr)" },
  { key:"pcn",         label:"Patient Control Number",        grid:"minmax(140px,1.2fr)" },
  { key:"paymentId",   label:"Payment ID",                    grid:"minmax(100px,0.9fr)" },
  { key:"denialCodes", label:"Denial Codes",                  grid:"minmax(110px,1fr)" },
  { key:"chLocation",  label:"Clearing House Location",       grid:"minmax(190px,1.6fr)" },
  { key:"chPayor",     label:"Clearing House Payor",          grid:"minmax(140px,1.2fr)" },
  { key:"chInsCode",   label:"Clearing House Insurance Code", grid:"minmax(160px,1.2fr)" },
  { key:"eob",         label:"EOB Uploaded",                  grid:"96px", align:"center" },
  { key:"at",          label:"AT Status",                     grid:"78px",  align:"center", nosort:true },
  { key:"ehrSync",     label:"EHR Sync",                      grid:"78px",  align:"center", nosort:true },
  { key:"reviewed",    label:"Reviewed?",                     grid:"86px",  align:"center", nosort:true },
];
const RM_GRID = RM_COLS.map(c=>c.grid).join(" ");
const RM_MIN_W = 1750;
const RM_RIGHT = ["at","ehrSync","reviewed"];
const RM_RIGHT_W = { at:78, ehrSync:78, reviewed:86 };
const rmFreeze = (key, bg) => {
  if (key==="name") return { position:"sticky", left:0, zIndex:4, background:bg, paddingLeft:14, boxShadow:"2px 0 3px -1px rgba(15,23,42,0.10)" };
  const i = RM_RIGHT.indexOf(key);
  if (i<0) return null;
  let r = 0; for (let j=RM_RIGHT.length-1;j>i;j--) r += RM_RIGHT_W[RM_RIGHT[j]];
  return { position:"sticky", right:r, zIndex:4, background:bg, ...(i===0?{boxShadow:"-2px 0 3px -1px rgba(15,23,42,0.10)"}:null), ...(key==="reviewed"?{paddingRight:10}:null) };
};

const RM_REMIT_PILL = {
  "Denied":         { bg:"#fef2f2", bd:"#fca5a5", c:"#dc2626" },
  "Partially Paid": { bg:"#fffbeb", bd:"#fcd34d", c:"#b45309" },
  "Appealed":       { bg:"#eff6ff", bd:"#93c5fd", c:"#1d4ed8" },
  "Resubmitted":    { bg:"#f5f3ff", bd:"#c4b5fd", c:"#6d28d9" },
  "Written Off":    { bg:"#f1f5f9", bd:"#cbd5e1", c:"#475569" },
};
function RMRemitPill({ s }) {
  const p = RM_REMIT_PILL[s] || RM_REMIT_PILL["Written Off"];
  return <span style={{display:"inline-flex",justifyContent:"center",width:"100%",padding:"4px 8px",borderRadius:4,background:p.bg,border:`1px solid ${p.bd}`,color:p.c,font:"500 11px/16px Roboto",whiteSpace:"nowrap"}}>{s}</span>;
}
function RMTick({ ok }) {
  return ok
    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-label="Yes"><polyline points="4 12 9 18 20 6"/></svg>
    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" aria-label="No"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>;
}

function RMScrollPane({ children }) {
  const ref = React.useRef(null);
  const [h, setH] = useRM(null);
  React.useLayoutEffect(()=>{
    const el = ref.current; if (!el) return;
    const calc = () => setH(Math.max(220, Math.floor(window.innerHeight - el.getBoundingClientRect().top - 16)));
    calc(); window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return <div ref={ref} className="chip-scroll ws-scrollbody" style={{height:h?h+"px":undefined,overflow:"auto"}}>{children}</div>;
}

function RMHeader({ sortKey, sortDir, onSort }) {
  const Arrows = window.ARVSortArrows;
  return (
    <div style={{display:"grid",gridTemplateColumns:RM_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",marginBottom:8,position:"sticky",top:0,zIndex:6,minWidth:RM_MIN_W}}>
      {RM_COLS.map(c=>(
        <div key={c.key} onClick={c.nosort?undefined:()=>onSort(c.key)}
          style={{font:"500 11px/14px Roboto",color:"#64748b",padding:"0 6px",height:"100%",display:"flex",alignItems:"center",gap:3,justifyContent:c.align==="center"?"center":"flex-start",whiteSpace:"nowrap",cursor:c.nosort?"default":"pointer",userSelect:"none",...(rmFreeze(c.key,"#f8fafc")||{})}}>
          {!c.nosort && Arrows && <Arrows active={sortKey===c.key} dir={sortDir} />}{c.label}
        </div>
      ))}
    </div>
  );
}

function RMRow({ row, reviewed, onReviewed }) {
  const cell = (key, align, extra) => ({font:"500 12px/16px Roboto",color:"#333",padding:"0 6px",height:"100%",display:"flex",alignItems:"center",justifyContent:align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,...(rmFreeze(key,"#fff")||{}),...(extra||{})});
  const ATIcon = window.ARVATIcon;
  return (
    <div style={{display:"grid",gridTemplateColumns:RM_GRID,alignItems:"center",height:48,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:8,boxShadow:"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",minWidth:RM_MIN_W}}>
      <div onClick={()=>window.__v2OpenDetail&&window.__v2OpenDetail("denial",row)} style={cell("name",null,{color:"#2563eb",cursor:"pointer"})}>{row.name}</div>
      <div style={cell("transInit")}>{row.transInit}</div>
      <div style={cell("serviceLine")}>{row.serviceLine}</div>
      <div style={cell("pcn")}>{row.pcn}</div>
      <div style={cell("paymentId")}>{row.paymentId}</div>
      <div style={cell("denialCodes",null,{gap:4})}>
        {row.denialCodes.length ? row.denialCodes.map(c=><span key={c} style={{padding:"1px 6px",borderRadius:3,background:"#fef2f2",border:"1px solid #fecaca",color:"#b91c1c",font:"500 11px/16px Roboto"}}>{c}</span>) : rmDash}
      </div>
      <div style={cell("chLocation")} title={row.chLocation}>{row.chLocation}</div>
      <div style={cell("chPayor")} title={row.chPayor}>{row.chPayor}</div>
      <div style={cell("chInsCode")}>{row.chInsCode}</div>
      <div style={cell("eob","center")}><RMTick ok={row.eob} /></div>
      <div style={cell("at","center")}>{ATIcon ? <ATIcon kind={row.at} /> : row.at}</div>
      <div style={cell("ehrSync","center")}><RMTick ok={row.ehrSync} /></div>
      <div style={cell("reviewed","center")}>
        <span role="checkbox" aria-checked={reviewed} onClick={()=>onReviewed(row.id)}
          style={{width:16,height:16,borderRadius:3,border:`1.5px solid ${reviewed?"#2563eb":"#cbd5e1"}`,background:reviewed?"#2563eb":"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          {reviewed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 9 18 20 6"/></svg>}
        </span>
      </div>
    </div>
  );
}

const RM_FILTER_FIELDS = [
  { key:"serviceLine", label:"Service Line" },
  { key:"chPayor",     label:"Clearing House Payor" },
  { key:"chLocation",  label:"Clearing House Location" },
];

function RMWHeader({ sortKey, sortDir, onSort }) {
  const Arrows = window.ARVSortArrows;
  const NS = {at:1,ehrSync:1,reviewed:1};
  return (
    <div style={{display:"grid",gridTemplateColumns:RMW_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",marginBottom:8,position:"sticky",top:0,zIndex:6,minWidth:RMW_MIN_W}}>
      {RMW_COLS.map(([k,l,,a])=>(
        <div key={k} onClick={NS[k]?undefined:()=>onSort(k)}
          style={{font:"500 11px/14px Roboto",color:"#64748b",padding:"0 6px",height:"100%",display:"flex",alignItems:"center",gap:3,justifyContent:a==="center"?"center":"flex-start",whiteSpace:"nowrap",cursor:NS[k]?"default":"pointer",userSelect:"none",...(rmwFreeze(k,"#f8fafc")||{}),...(k==="at"?{boxShadow:"-2px 0 3px -1px rgba(15,23,42,0.10)"}:null)}}>
          {!NS[k] && Arrows && <Arrows active={sortKey===k} dir={sortDir} />}{l}
        </div>
      ))}
    </div>
  );
}
function RMWRow({ row, reviewed, onReviewed }) {
  const ATIcon = window.ARVATIcon;
  const val = k => {
    const v = row[k];
    if (k==="wsDenials") return rmCodes(v, <span style={{color:"#64748b",fontWeight:400}}>No denial codes</span>);
    if (k==="excluded") return rmCodes(v, rmDash);
    if (k==="at") return ATIcon ? <ATIcon kind={v} /> : v;
    if (k==="ehrSync") return <RMTick ok={v} />;
    if (k==="reviewed") return (
      <span role="checkbox" aria-checked={reviewed} onClick={()=>onReviewed(row.id)}
        style={{width:16,height:16,borderRadius:3,border:`1.5px solid ${reviewed?"#2563eb":"#cbd5e1"}`,background:reviewed?"#2563eb":"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
        {reviewed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 9 18 20 6"/></svg>}
      </span>);
    return v==="—" ? rmDash : v;
  };
  return (
    <div style={{display:"grid",gridTemplateColumns:RMW_GRID,alignItems:"center",height:48,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:8,boxShadow:"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",minWidth:RMW_MIN_W}}>
      {RMW_COLS.map(([k,,,a])=>(
        <div key={k} onClick={(k==="acct"||k==="name")?()=>window.__v2OpenDetail&&window.__v2OpenDetail("denial",row):undefined} title={typeof row[k]==="string"&&row[k]!=="—"?row[k]:undefined}
          style={{font:"500 12px/16px Roboto",color:k==="acct"||k==="name"?"#2563eb":k==="reason"&&row.reason!=="—"?"#dc2626":"#333",padding:"0 6px",height:"100%",display:"flex",alignItems:"center",gap:4,justifyContent:a==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,...(rmwFreeze(k,"#fff")||{}),...((k==="acct"||k==="name")?{cursor:"pointer"}:null),...(k==="at"?{boxShadow:"-2px 0 3px -1px rgba(15,23,42,0.10)"}:null)}}>
          {val(k)}
        </div>
      ))}
    </div>
  );
}

function RemitsDenialView({ review }) {
  const [hchb, setHchb] = useRM(()=>typeof window!=="undefined" && window.__demoVersion==="hchb");
  React.useEffect(()=>{ const h=()=>setHchb(window.__demoVersion==="hchb"); document.addEventListener("demoVersionChange",h); return ()=>document.removeEventListener("demoVersionChange",h); },[]);
  const [atFilter, setAtFilter] = useRM(null);
  const [search, setSearch] = useRM("");
  const [fieldFilters, setFieldFilters] = useRM([]);
  const [sortKey, setSortKey] = useRM(null);
  const [sortDir, setSortDir] = useRM("asc");
  const [reviewed, setReviewed] = useRM({});
  const onSort = k => { if (sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };

  let pool = fieldFilters.length ? RM_ROWS.filter(r=>fieldFilters.every(f=>f.values.includes(r[f.field]))) : RM_ROWS;
  React.useEffect(()=>{ setFieldFilters([]); setSortKey(null); },[hchb]);
  if (search.trim()) { const q = search.toLowerCase(); pool = pool.filter(r=>(hchb?[r.name,r.pcn,r.paymentId,r.chPayor,r.chInsCode,r.denialCodes.join(" ")]:[r.acct,r.name,r.mrn,r.wsPaymentId,r.agency,r.wsPayer,r.wsIns,r.wsDenials.join(" ")]).join(" ").toLowerCase().includes(q)); }
  if (review) pool = pool.filter(r=>r.at==="warning" && !reviewed[r.id]);
  const card = RM_AT_CARDS.find(c=>c.id===atFilter);
  let rows = card ? pool.filter(card.match) : pool;
  if (sortKey) rows = [...rows].sort((a,b)=>{ const av=String(a[sortKey]), bv=String(b[sortKey]); return sortDir==="asc"?av.localeCompare(bv):bv.localeCompare(av); });

  const Bar = window.ARVFilterBarChips;
  return (
    <div style={{background:"#fff",minHeight:"100%",display:"flex",flexDirection:"column"}}>
      {Bar && <Bar dateLabel={hchb?"Trans Init Date : 04/01/25 – 04/30/25":"Transaction Arrived Date : 04/01/25 – 04/30/25"} searchValue={search} onSearch={setSearch}
        filterFields={hchb?RM_FILTER_FIELDS:RMW_FILTERS} filterRows={RM_ROWS} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters}
        onClearFilters={fieldFilters.length?()=>setFieldFilters([]):null}
        chips={review?[{id:"rv",label:"Review Mode: Needs Attention, Not Reviewed"}]:[]} />}
      <div style={{padding:"18px 24px 14px",display:"flex",alignItems:"flex-start",gap:24,borderBottom:"1px solid #e2e8f0"}}>
        <div>
          <div style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Denial Management</div>
          <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Status Summary of Denied Remits</div>
        </div>
        <div style={{marginLeft:"auto"}}><RMATSummary rows={pool} active={atFilter} onPick={setAtFilter} /></div>
      </div>
      <div style={{padding:"12px 24px 0"}}>
        <RMScrollPane>
          <div style={{minWidth:hchb?RM_MIN_W:RMW_MIN_W}}>
            {hchb ? <RMHeader sortKey={sortKey} sortDir={sortDir} onSort={onSort} /> : <RMWHeader sortKey={sortKey} sortDir={sortDir} onSort={onSort} />}
            {rows.length===0
              ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8"}}>No records match the current filters.</div>
              : rows.map(r=>hchb ? <RMRow key={r.id} row={r} reviewed={!!reviewed[r.id]} onReviewed={id=>setReviewed(s=>({...s,[id]:!s[id]}))} /> : <RMWRow key={r.id} row={r} reviewed={!!reviewed[r.id]} onReviewed={id=>setReviewed(s=>({...s,[id]:!s[id]}))} />)}
          </div>
        </RMScrollPane>
      </div>
    </div>
  );
}

// ── Cash Posting — HCHB (16 cols) vs WellSky (10 cols) ──
const CP_STAGES = ["Payment Report Pull","EOB Download","Deposit Created","Posting","Reconciliation"];
const CP_STATUS = ["Completed","In Progress","Failed","Completed","Terminated","Completed","In Progress"];
const CP_WS_LOC = ["Waystar — Louisville","Waystar — Nashville","Waystar — Dallas","Waystar — Tampa"];
const CP_DB = ["HCHB_PROD_EAST","HCHB_PROD_WEST","HCHB_PROD_CENTRAL"];
const CP_AGENCY = ["Hospice Home Care, Inc. (101283)","Hospice Home Care, Inc. (101283)","Senescence LLC dba All Saints Hospices (78219)","Spring Valley Hospice LLC (135106)","HOSPICE OF NORTH ALABAMA (73285)","HOSPICE OF NORTH ALABAMA (73285)","Adoration Hospice AL (221957)"];
const CP_PAYER = ["Medicaid Arkansas","Medicaid Arkansas","Medicaid Louisiana - Physicians","Medicare HHH Home Health","Medicaid Alabama","Medicaid Alabama","Medicaid Alabama"];
const CP_PMT = ["1176718635","1176719109","1176719110","1177997742","1178375647","1178953052","1178953179","1178953252","1178953495","1178953509","1178953611","1178953702","1178953718","1178953840"];
const CP_MRN = ["168027","172580","168105","175347","172394","92089","1860575","1877109","1889268","1750914","1860788","1864164","1876270","1889279"];
const CP_LOC = ["Jacksonville, FL","Nashville, TN","Louisville, KY","Dallas, TX","Tampa, FL"];
const CP_FAIL = { "Failed":"Unable to add batch — Payment ID not found in HCHB", "Terminated":"Deposit already exists — posting terminated" };
const cpMoney = n => "$" + n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const CP_ROWS = Array.from({length:14},(_,i)=>{
  const d = 2 + (i*2) % 27, dd = rmPad(d), status = CP_STATUS[i % CP_STATUS.length];
  const amount = 1250 + ((i*7919) % 18000) + (i*37 % 100)/100;
  const posted = status==="Completed" ? (i%5===3 ? amount - 125.4 : amount) : status==="In Progress" ? Math.round(amount*0.6*100)/100 : 0;
  return {
    id:"cp"+(i+1),
    mrn:CP_MRN[i],
    ehrSync: i % 3 !== 1,
    op:"OP" + String(20410 + i*13),
    check:"CHK" + String(880120 + i*211),
    paymentId:CP_PMT[i],
    paymentNumber:"PN" + String(7700310 + i*97),
    amount, posted, variance: Math.round((amount-posted)*100)/100,
    wsLoc: CP_WS_LOC[i % CP_WS_LOC.length],
    db: CP_DB[i % CP_DB.length],
    stage: status==="Completed" ? "Reconciliation" : CP_STAGES[i % 4],
    status,
    fileAvail: i % 6 !== 4,
    deposit: status==="Failed" ? "—" : "DEP-" + String(310045 + i*29),
    eob: i % 4 !== 2,
    sftp: "/sftp/remits/" + CP_DB[i % CP_DB.length].toLowerCase() + "/2025-04-" + dd,
    arrived: "04/" + dd + "/25 08:" + rmPad((i*7)%60) + " AM",
    ended: status==="In Progress" ? "—" : "04/" + dd + "/25 09:" + rmPad((i*11)%60) + " AM",
    payDate: "04/" + rmPad(Math.max(1,d-1)) + "/25",
    agency: CP_AGENCY[i % CP_AGENCY.length],
    payer: CP_PAYER[i % CP_PAYER.length],
    location: CP_LOC[i % CP_LOC.length],
    remit: "RMT" + String(4400120 + i*53),
    reason: CP_FAIL[status] || "—",
    at: status==="Completed" ? "thumb" : status==="In Progress" ? "hourglass" : "warning",
  };
});
const CP_STATUS_PILL = {
  "Completed":   { bg:"#f0fdf4", bd:"#86efac", c:"#15803d" },
  "In Progress": { bg:"#eff6ff", bd:"#93c5fd", c:"#1d4ed8" },
  "Failed":      { bg:"#fef2f2", bd:"#fca5a5", c:"#dc2626" },
  "Terminated":  { bg:"#f1f5f9", bd:"#cbd5e1", c:"#475569" },
};
const CP_TAIL = [["at","AT Status","78px","center"],["ehrSync","EHR Sync","78px","center"],["reviewed","Reviewed?","86px","center"]];
const CP_COLS_HCHB = [
  ["mrn","MRN","minmax(110px,0.9fr)"],["op","OP#","minmax(90px,0.8fr)"],["check","Check Number","minmax(110px,1fr)"],["paymentId","Payment ID","minmax(100px,0.9fr)"],
  ["amount","Amount","minmax(100px,0.9fr)","right"],["posted","Amount Posted","minmax(110px,0.9fr)","right"],["variance","Variance","minmax(90px,0.8fr)","right"],
  ["wsLoc","Waystar Location","minmax(160px,1.3fr)"],
  ["fileAvail","File Available in Payment Report","190px","center"],["deposit","Deposit Number","minmax(110px,1fr)"],
  ["eob","EOB Uploaded","96px","center"],["sftp","SFTP File Location","minmax(220px,1.6fr)"],
  ...CP_TAIL,
];
const CP_COLS_WS = [
  ["mrn","MRN","minmax(110px,0.9fr)"],["paymentId","Payment ID","minmax(100px,0.9fr)"],["paymentNumber","Payment Number","minmax(110px,1fr)"],
  ["amount","Amount","minmax(100px,0.9fr)","right"],["payDate","Payment Date","minmax(100px,0.9fr)"],["agency","Agency","minmax(260px,1.8fr)"],
  ["payer","Payer","minmax(200px,1.4fr)"],["location","Location","minmax(120px,1fr)"],["remit","Remittance#","minmax(110px,1fr)"],
  ...CP_TAIL,
];
const CP_FILTERS_HCHB = [{key:"wsLoc",label:"Waystar Location"}];
const CP_FILTERS_WS = [{key:"agency",label:"Agency"},{key:"payer",label:"Payer"},{key:"location",label:"Location"}];

function cpCell(k, r, reviewed, onReviewed) {
  const v = r[k];
  if (k==="at") { const I = window.ARVATIcon; return I ? <I kind={v} /> : v; }
  if (k==="ehrSync") return <RMTick ok={v} />;
  if (k==="reviewed") { const on = !!reviewed[r.id]; return (
    <span role="checkbox" aria-checked={on} onClick={()=>onReviewed(r.id)}
      style={{width:16,height:16,borderRadius:3,border:`1.5px solid ${on?"#2563eb":"#cbd5e1"}`,background:on?"#2563eb":"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
      {on && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 9 18 20 6"/></svg>}
    </span>); }
  if (k==="amount"||k==="posted") return cpMoney(v);
  if (k==="variance") return v===0 ? <span style={{color:"#94a3b8"}}>{cpMoney(0)}</span> : <span style={{color:"#dc2626"}}>{cpMoney(v)}</span>;
  if (k==="status") { const p = CP_STATUS_PILL[v]; return <span style={{display:"inline-flex",justifyContent:"center",width:"100%",padding:"4px 8px",borderRadius:4,background:p.bg,border:`1px solid ${p.bd}`,color:p.c,font:"500 11px/16px Roboto"}}>{v}</span>; }
  if (k==="fileAvail"||k==="eob") return <RMTick ok={v} />;
  if (v==="—") return rmDash;
  return v;
}

function RemitsCashPostingView() {
  const [hchb, setHchb] = useRM(()=>typeof window!=="undefined" && window.__demoVersion==="hchb");
  React.useEffect(()=>{ const h=()=>setHchb(window.__demoVersion==="hchb"); document.addEventListener("demoVersionChange",h); return ()=>document.removeEventListener("demoVersionChange",h); },[]);
  const [atFilter, setAtFilter] = useRM(null);
  const [search, setSearch] = useRM("");
  const [fieldFilters, setFieldFilters] = useRM([]);
  const [sortKey, setSortKey] = useRM(null);
  const [sortDir, setSortDir] = useRM("asc");
  const [reviewed, setReviewed] = useRM({});
  const onReviewed = id => setReviewed(s=>({...s,[id]:!s[id]}));
  React.useEffect(()=>{ setFieldFilters([]); setSortKey(null); },[hchb]);
  const COLS = hchb ? CP_COLS_HCHB : CP_COLS_WS;
  const GRID = COLS.map(c=>c[2]).join(" ");
  const MIN_W = hchb ? 1980 : 1640;
  const onSort = k => { if (sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };

  let pool = fieldFilters.length ? CP_ROWS.filter(r=>fieldFilters.every(f=>f.values.includes(r[f.field]))) : CP_ROWS;
  if (search.trim()) { const q = search.toLowerCase(); pool = pool.filter(r=>COLS.map(c=>String(r[c[0]])).join(" ").toLowerCase().includes(q)); }
  const card = RM_AT_CARDS.find(c=>c.id===atFilter);
  let rows = card ? pool.filter(card.match) : pool;
  if (sortKey) rows = [...rows].sort((a,b)=>{ const av=a[sortKey], bv=b[sortKey]; const c = typeof av==="number" ? av-bv : String(av).localeCompare(String(bv)); return sortDir==="asc"?c:-c; });

  const Bar = window.ARVFilterBarChips, Arrows = window.ARVSortArrows;
  const CP_RW = { at:78, ehrSync:78, reviewed:86 }, CP_R = ["at","ehrSync","reviewed"];
  const freeze = (i,bg) => {
    if (i===0) return {position:"sticky",left:0,zIndex:4,background:bg,paddingLeft:14,boxShadow:"2px 0 3px -1px rgba(15,23,42,0.10)"};
    const k = COLS[i][0], j = CP_R.indexOf(k); if (j<0) return null;
    let r = 0; for (let m=CP_R.length-1;m>j;m--) r += CP_RW[CP_R[m]];
    return {position:"sticky",right:r,zIndex:4,background:bg,...(j===0?{boxShadow:"-2px 0 3px -1px rgba(15,23,42,0.10)"}:null),...(k==="reviewed"?{paddingRight:10}:null)};
  };
  const NOSORT = {at:1,ehrSync:1,reviewed:1};
  const just = a => a==="center"?"center":a==="right"?"flex-end":"flex-start";
  return (
    <div style={{background:"#fff",minHeight:"100%",display:"flex",flexDirection:"column"}}>
      {Bar && <Bar dateLabel="Payment Date : 04/01/25 – 04/30/25" searchValue={search} onSearch={setSearch}
        filterFields={hchb?CP_FILTERS_HCHB:CP_FILTERS_WS} filterRows={CP_ROWS} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters}
        onClearFilters={fieldFilters.length?()=>setFieldFilters([]):null} chips={[]} />}
      <div style={{padding:"18px 24px 14px",display:"flex",alignItems:"flex-start",gap:24,borderBottom:"1px solid #e2e8f0"}}>
        <div>
          <div style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Cash Posting</div>
          <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Status Summary of Payment Postings</div>
        </div>
        <div style={{marginLeft:"auto"}}><RMATSummary rows={pool} active={atFilter} onPick={setAtFilter} /></div>
      </div>
      <div style={{padding:"12px 24px 0"}}>
        <RMScrollPane>
          <div style={{minWidth:MIN_W}}>
            <div style={{display:"grid",gridTemplateColumns:GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",marginBottom:8,position:"sticky",top:0,zIndex:6,minWidth:MIN_W}}>
              {COLS.map(([k,l,,a],i)=>(
                <div key={k} onClick={NOSORT[k]?undefined:()=>onSort(k)} style={{font:"500 11px/14px Roboto",color:"#64748b",padding:"0 6px",height:"100%",display:"flex",alignItems:"center",gap:3,justifyContent:just(a),whiteSpace:"nowrap",cursor:NOSORT[k]?"default":"pointer",userSelect:"none",...(freeze(i,"#f8fafc")||{})}}>
                  {!NOSORT[k] && Arrows && <Arrows active={sortKey===k} dir={sortDir} />}{l}
                </div>
              ))}
            </div>
            {rows.length===0
              ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8"}}>No records match the current filters.</div>
              : rows.map(r=>(
                <div key={r.id} style={{display:"grid",gridTemplateColumns:GRID,alignItems:"center",height:48,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:8,boxShadow:"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",minWidth:MIN_W}}>
                  {COLS.map(([k,,,a],i)=>(
                    <div key={k} onClick={i===0?()=>window.__v2OpenDetail&&window.__v2OpenDetail("cash",r):undefined} title={typeof r[k]==="string"&&r[k]!=="—"?r[k]:undefined}
                      style={{font:"500 12px/16px Roboto",color:i===0?"#2563eb":"#333",padding:"0 6px",height:"100%",display:"flex",alignItems:"center",justifyContent:just(a),whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,cursor:i===0?"pointer":undefined,...(freeze(i,"#fff")||{})}}>
                      {cpCell(k,r,reviewed,onReviewed)}
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </RMScrollPane>
      </div>
    </div>
  );
}

function RMLogTabs({ value, onChange }) {
  const TABS = [{id:"denial",label:"Denial Management"},{id:"cash",label:"Cash Posting"}];
  return (
    <div style={{display:"flex",alignItems:"center",marginTop:12}}>
      {TABS.map((t,i)=>{
        const active = value===t.id, first = i===0, last = i===TABS.length-1;
        return (
          <button key={t.id} type="button" onClick={()=>onChange(t.id)}
            style={{position:"relative",zIndex:active?2:1,background:"#fff",border:`1px solid ${active?"#2563eb":"#d8dee6"}`,marginLeft:first?0:-1,borderRadius:`${first?6:0}px ${last?6:0}px ${last?6:0}px ${first?6:0}px`,padding:"7px 28px",font:`${active?500:400} 14px/18px Roboto`,color:active?"#2563eb":"#0f172a",cursor:"pointer",whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
function RMLogHead({ tab, onTab }) {
  return (
    <div>
      <div style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Automation Log</div>
      <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Transaction Status of Remittance Workflows</div>
      <RMLogTabs value={tab} onChange={onTab} />
    </div>
  );
}
function RemitsAutomationLogView() {
  const [tab, setTab] = useRM("denial");
  return (
    <div style={{background:"#fff",minHeight:"100%"}}>
      {tab==="denial" ? <RMDenialLog tab={tab} onTab={setTab} /> : <CPAutomationLog tab={tab} onTab={setTab} />}
    </div>
  );
}

const CPL_HCHB = [
  ["ref","Ref ID","minmax(130px,1fr)"],["mrn","MRN","minmax(100px,0.8fr)"],["paymentId","Payment ID","minmax(110px,0.9fr)"],
  ["arrived","Transaction Start Date","minmax(160px,1.1fr)"],["ended","Transaction End Date","minmax(160px,1.1fr)"],
  ["db","HCHB Database","minmax(140px,1fr)"],["stage","Current Stage","minmax(140px,1fr)"],
  ["reason","Reason for Failure/Termination","minmax(280px,2fr)"],["at","AT Status","78px","center"],
];
const CPL_WS = CPL_HCHB.filter(c=>c[0]!=="db");
function CPAutomationLog({ tab, onTab }) {
  const [hchb, setHchb] = useRM(()=>typeof window!=="undefined" && window.__demoVersion==="hchb");
  React.useEffect(()=>{ const h=()=>setHchb(window.__demoVersion==="hchb"); document.addEventListener("demoVersionChange",h); return ()=>document.removeEventListener("demoVersionChange",h); },[]);
  const [card, setCard] = useRM(null);
  const [search, setSearch] = useRM("");
  const COLS = hchb ? CPL_HCHB : CPL_WS;
  const GRID = COLS.map(c=>c[2]).join(" ");
  const MIN_W = hchb ? 1300 : 1160;
  const log = CP_ROWS.map((r,i)=>({...r, ref:"CPT" + String(i+1).padStart(10,"0")}));
  const searched = search ? log.filter(r=>COLS.map(c=>String(r[c[0]])).join(" ").toLowerCase().includes(search.toLowerCase())) : log;
  const c = RM_AT_CARDS.find(x=>x.id===card);
  const rows = c ? searched.filter(c.match) : searched;
  const Bar = window.ARVFilterBarChips, ATIcon = window.ARVATIcon;
  const just = a => a==="center"?"center":a==="right"?"flex-end":"flex-start";
  const freeze = (k,bg) => k==="ref" ? {position:"sticky",left:0,zIndex:4,background:bg,paddingLeft:14,boxShadow:"2px 0 3px -1px rgba(15,23,42,0.10)"} : k==="at" ? {position:"sticky",right:0,zIndex:4,background:bg,boxShadow:"-2px 0 3px -1px rgba(15,23,42,0.10)"} : null;
  return (
    <div>
      {Bar && <Bar dateLabel="Transaction Start Date : 04/01/25 – 04/30/25" searchValue={search} onSearch={setSearch} filterFields={[]} filterRows={log} fieldFilters={[]} onFieldFilters={()=>{}} />}
      <div style={{padding:"18px 24px 14px",display:"flex",flexWrap:"wrap",alignItems:"flex-start",gap:24}}>
        <RMLogHead tab={tab} onTab={onTab} />
        <div style={{marginLeft:"auto"}}><RMATSummary rows={searched} active={card} onPick={setCard} /></div>
      </div>
      <div style={{padding:"0 24px"}}>
        <RMScrollPane>
          <div style={{minWidth:MIN_W}}>
            <div style={{display:"grid",gridTemplateColumns:GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",marginBottom:8,position:"sticky",top:0,zIndex:6,minWidth:MIN_W}}>
              {COLS.map(([k,l,,a])=><div key={k} style={{font:"500 11px/14px Roboto",color:"#64748b",padding:"0 6px",height:"100%",display:"flex",alignItems:"center",justifyContent:just(a),whiteSpace:"nowrap",...(freeze(k,"#f8fafc")||{})}}>{l}</div>)}
            </div>
            {rows.map(r=>(
              <div key={r.ref} style={{display:"grid",gridTemplateColumns:GRID,alignItems:"center",height:48,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:8,boxShadow:"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",minWidth:MIN_W}}>
                {COLS.map(([k,,,a])=>(
                  <div key={k} title={typeof r[k]==="string"&&r[k]!=="—"?r[k]:undefined} style={{font:"500 12px/16px Roboto",padding:"0 6px",height:"100%",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,display:"flex",alignItems:"center",justifyContent:just(a),color:k==="ref"?"#2563eb":k==="reason"&&r.reason!=="—"?"#dc2626":"#333",...(freeze(k,"#fff")||{})}}>
                    {k==="at" ? (ATIcon ? <ATIcon kind={r.at} /> : r.at) : cpCell(k,r)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </RMScrollPane>
      </div>
    </div>
  );
}

function RMDenialLog({ tab, onTab }) {
  const [card, setCard] = useRM(null);
  const [search, setSearch] = useRM("");
  const log = RM_ROWS.map((r,i)=>({
    ref:"RMT" + String(i+1).padStart(10,"0"),
    wf:"Remits - Denial Processing",
    name:r.name, pcn:r.pcn, paymentId:r.paymentId, payor:r.chPayor,
    st:r.transInit + " 09:39 AM", et:r.at==="hourglass" ? "—" : r.transInit + " 10:12 AM",
    err:r.at==="warning" ? "Unable to post denial to EHR" : "—", at:r.at,
  }));
  const COLS = [["ref","Ref ID","minmax(120px,1.1fr)"],["wf","Workflow","minmax(190px,1.8fr)"],["name","Patient Name","minmax(140px,1.3fr)"],["pcn","Patient Control Number","minmax(140px,1.2fr)"],["paymentId","Payment ID","minmax(100px,0.9fr)"],["payor","Clearing House Payor","minmax(130px,1.2fr)"],["st","Transaction Start Date","minmax(160px,1.1fr)"],["et","Transaction End Date","minmax(160px,1.1fr)"],["err","Reason for Failure/Termination","minmax(240px,1.8fr)"],["at","AT Status","78px"]];
  const GRID = COLS.map(c=>c[2]).join(" ");
  const searched = search ? log.filter(r=>Object.values(r).join(" ").toLowerCase().includes(search.toLowerCase())) : log;
  const c = RM_AT_CARDS.find(x=>x.id===card);
  const rows = c ? searched.filter(c.match) : searched;
  const Bar = window.ARVFilterBarChips, ATIcon = window.ARVATIcon;
  return (
    <div>
      {Bar && <Bar dateLabel="Transaction Start Date : 04/01/25 – 04/30/25" searchValue={search} onSearch={setSearch} filterFields={[]} filterRows={log} fieldFilters={[]} onFieldFilters={()=>{}} />}
      <div style={{padding:"18px 24px 14px",display:"flex",flexWrap:"wrap",alignItems:"flex-start",gap:24}}>
        <RMLogHead tab={tab} onTab={onTab} />
        <div style={{marginLeft:"auto"}}><RMATSummary rows={searched} active={card} onPick={setCard} /></div>
      </div>
      <div style={{padding:"0 24px"}}>
        <RMScrollPane>
          <div style={{minWidth:1500}}>
            <div style={{display:"grid",gridTemplateColumns:GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",marginBottom:8,position:"sticky",top:0,zIndex:6}}>
              {COLS.map(([k,l])=><div key={k} style={{font:"500 11px/14px Roboto",color:"#64748b",padding:"0 6px",whiteSpace:"nowrap",textAlign:k==="at"?"center":"left"}}>{l}</div>)}
            </div>
            {rows.map(r=>(
              <div key={r.ref} style={{display:"grid",gridTemplateColumns:GRID,alignItems:"center",height:48,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:8,boxShadow:"0 1px 2px rgba(15,23,42,0.03)",background:"#fff"}}>
                {COLS.map(([k])=>(
                  <div key={k} title={typeof r[k]==="string"?r[k]:undefined} style={{font:"500 12px/16px Roboto",padding:"0 6px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,display:"flex",alignItems:"center",justifyContent:k==="at"?"center":"flex-start",color:k==="ref"?"#2563eb":k==="err"&&r.err!=="—"?"#dc2626":r[k]==="—"?"#cbd5e1":"#333"}}>
                    {k==="at" ? (ATIcon ? <ATIcon kind={r.at} /> : r.at) : r[k]}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </RMScrollPane>
      </div>
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { RemitsDenialView, RemitsCashPostingView, RemitsAutomationLogView });
