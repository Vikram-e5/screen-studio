// Notifications Automation Log — same structure as the ERV / CDM automation logs,
// driven by window.NOT_ROWS so the log and the request view never disagree.
const { useState: useNOTL, useRef: useNOTLR, useEffect: useNOTLE } = React;

const NOT_LOG_COLS = [
  { key:"ref",         label:"Ref ID",                 w:"minmax(130px,1.2fr)", sort:true },
  { key:"name",        label:"Patient Name",           w:"minmax(140px,1.4fr)", sort:true },
  { key:"episodeId",   label:"Episode ID",             w:"minmax(120px,1.1fr)", sort:true },
  { key:"serviceLine", label:"Service line",           w:"minmax(110px,1.1fr)", sort:true },
  { key:"event",       label:"Event",                  w:"minmax(180px,1.6fr)", sort:true },
  { key:"taskType",    label:"Task/Note type",         w:"minmax(260px,2.4fr)", sort:true },
  { key:"commMethod",  label:"Communication method",   w:"minmax(150px,1.3fr)", sort:true },
  { key:"stage",       label:"Current stage",          w:"minmax(300px,2.4fr)", sort:true },
  { key:"st",          label:"Transaction Start time",  w:"minmax(160px,1.6fr)", sort:true },
  { key:"et",          label:"Transaction end time",    w:"minmax(160px,1.6fr)", sort:true },
  { key:"at",          label:"AT Status",              w:"80px",                sort:false, align:"center" },
];
const NOT_LOG_GRID = NOT_LOG_COLS.map(c=>c.w).join(" ");
const NOT_LOG_MIN_W = 1700;
const NOT_LOG_STAGES = [
  "Stage 1 - Extraction of Physician / Facility Details",
  "Stage 2 - Sending of Fax",
  "Stage 3 - Addition of Coordination Notes",
  "Stage 4 - Stage Completion / Note Reviewed",
];
// Needs Attention: the stage the workflow halted at, derived from its reason.
const NOT_LOG_REASON_STAGE = {
  "No Records retrieved for this workflow": 0,
  "Physician fax number is not available": 0,
  "Communication method is not applicable for client": 0,
  "Unable to access record in grid": 0,
  "Technical Issue. Retry attempts exceeded": 1,
  "Unable to print patient file as record is locked by another user in Clinical input": 2,
};
function notLogStage(r, i) {
  if (r.at==="thumb") return NOT_LOG_STAGES[3];
  if (r.at==="hourglass") return NOT_LOG_STAGES[i % 4];
  if (r.at==="warning") return NOT_LOG_STAGES[NOT_LOG_REASON_STAGE[r.atReason] ?? 1];
  return "—";
}

const NOT_LOG_CARDS = [
  { id:"all",       label:"All Transactions", color:"rgb(21,95,130)",   match:()=>true,                icon:null },
  { id:"thumb",     label:"Completed",        color:"rgb(14,165,233)",  match:(r)=>r.at==="thumb",     get icon(){ return (window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png"; } },
  { id:"warning",   label:"Needs Attention",  color:"rgb(245,158,11)",  match:(r)=>r.at==="warning",   get icon(){ return (window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png"; } },
  { id:"hourglass", label:"In Progress",      color:"rgb(148,163,184)", match:(r)=>r.at==="hourglass", get icon(){ return (window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png"; } },
];
const NOT_LOG_FIELDS = [
  { key:"serviceLine", label:"Service line" },
  { key:"event",       label:"Event" },
  { key:"commMethod",  label:"Communication method" },
  { key:"stage",       label:"Current stage" },
  { key:"status",      label:"Status" },
];
const notlPad = (n)=>String(n).padStart(2,"0");

function NOTLogATIcon({ kind }) {
  const res = (typeof window!=="undefined" && window.__resources) || {};
  if (kind==="thumb")     return <img title="Completed"       alt="Completed"       src={res.atCompleted||"icons/at-completed.png"} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind==="warning")   return <img title="Needs Attention" alt="Needs Attention" src={res.atNeedsAttention||"icons/at-needs-attention.png"} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind==="hourglass") return <img title="In Progress"     alt="In Progress"     src={res.atInProgress||"icons/at-in-progress.png"} style={{width:18,height:18,objectFit:"contain"}} />;
  return <span style={{color:"#cbd5e1"}}>—</span>;
}

function NOTLogSortArrows({ active, dir }) {
  const up   = active && dir==="asc"  ? "#2563eb" : "rgba(0,0,0,0.25)";
  const down = active && dir==="desc" ? "#2563eb" : "rgba(0,0,0,0.25)";
  return (
    <svg width="10" height="15" viewBox="0 0 9 14" fill="none" style={{marginRight:3,flex:"none"}}>
      <path d="M7.74699 7.40234H1.25301C1.05823 7.40234 0.949473 7.608 1.0701 7.7484L4.31708 11.5135C4.41003 11.6213 4.58899 11.6213 4.68291 11.5135L7.9299 7.7484C8.05053 7.608 7.94177 7.40234 7.74699 7.40234Z" fill={down}/>
      <path d="M7.9299 6.24825L4.68291 2.48317C4.58997 2.3754 4.41101 2.3754 4.31708 2.48317L1.0701 6.24825C0.949473 6.38865 1.05823 6.59431 1.25301 6.59431H7.74699C7.94177 6.59431 8.05053 6.38865 7.9299 6.24825Z" fill={up}/>
    </svg>
  );
}

function NOTLogChip({ label, onRemove }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:10,background:"#f4f6f9",border:"1px solid #d8dee6",borderRadius:6,padding:"6px 10px",font:"400 12px/16px Roboto",color:"#334155",whiteSpace:"nowrap",flexShrink:0}}>
      {label}
      <button type="button" onClick={onRemove} title="Remove filter" style={{border:"none",background:"transparent",color:"#64748b",fontSize:13,lineHeight:1,cursor:"pointer",padding:0}}>✕</button>
    </span>
  );
}

// Automation slider — same shell as the patient detail drawer's Automation Log view
// (header + "Automation Log" tab + workflow table), minus "Back to Patient Information".
function NOTAutomationSlider({ row, logRows, onClose }) {
  useNOTLE(()=>{ const h=(e)=>{ if(e.key==="Escape") onClose(); }; document.addEventListener("keydown",h); return ()=>document.removeEventListener("keydown",h); },[onClose]);
  const mine = logRows.filter(r => r.mrn === row.mrn && r.name === row.name);
  const [ep, setEp]   = useNOTL("");
  const [ref, setRef] = useNOTL(row.ref);
  const shown = mine.filter(r => (!ep || r.episodeId === ep) && (!ref || r.ref === ref));
  const blue = "#1677FF";
  const fields = [["MRN", row.mrn], ["Service Line", row.serviceLine], ["Branch", row.branchId], ["Episode ID", row.episodeId]];
  const hd = {font:"500 11px/14px Roboto",color:"#64748b",padding:"8px 10px",background:"#f8fafc",border:"1px solid #e2e8f0",whiteSpace:"nowrap",textAlign:"left"};
  const td = {padding:"10px 10px",border:"1px solid #e2e8f0",font:"400 12px/16px Roboto",color:"#334155",whiteSpace:"nowrap"};
  const selSt = {border:"1px solid #d1d5db",borderRadius:4,padding:"5px 24px 5px 10px",font:"400 12px/16px Roboto",color:"#374151",background:"#fff",cursor:"pointer"};
  const dash = <span style={{color:"#cbd5e1"}}>—</span>;
  return ReactDOM.createPortal(
    <div style={{position:"fixed",inset:0,zIndex:60}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.25)",animation:"notlFade .14s ease-out"}}></div>
      <div style={{position:"fixed",right:0,top:0,height:"100vh",width:"97vw",background:"#fff",borderLeft:"1px solid #e2e8f0",boxShadow:"-12px 0 24px rgba(28,45,66,.10)",display:"flex",flexDirection:"column",animation:"notlSlide .22s ease-out"}}>
        <div style={{flexShrink:0,background:"#fff"}}>
          <div style={{position:"relative",padding:"22px clamp(16px, 2.4vw, 36px) 18px",background:"#fff"}}>
            <button onClick={onClose} aria-label="Close" style={{position:"absolute",top:14,right:14,background:"transparent",border:"none",color:"#6B7280",fontSize:20,cursor:"pointer",lineHeight:1,padding:6}}>✕</button>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:32,flexWrap:"wrap"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",lineHeight:"1.1",flexShrink:0}}>
                <div style={{font:"400 13px/16px Roboto",color:"#6B7280",marginBottom:4}}>Patient Name</div>
                <span style={{font:"700 28px/1.1 Roboto",color:"#111827",whiteSpace:"nowrap"}}>{row.name}</span>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"14px 28px",alignItems:"flex-start",flex:1,minWidth:0,paddingRight:32,paddingTop:2}}>
                {fields.filter(f=>f[1]).map(([l,v])=>(
                  <div key={l} style={{display:"flex",flexDirection:"column",minWidth:0}}>
                    <div style={{font:"400 11px/14px Roboto",color:"#6B7280",letterSpacing:"0.01em"}}>{l}</div>
                    <div style={{font:"500 14px/18px Roboto",color:"#111827",marginTop:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:260}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{margin:"0 20px",height:1,background:"#CFCFCF"}}></div>
          <div style={{margin:"0 20px",padding:"12px 0 0"}}>
            <div style={{display:"flex",alignItems:"flex-end",borderBottom:"1px solid #CFCFCF"}}>
              <div style={{background:"#fff",border:"1px solid #CFCFCF",borderBottom:"1px solid #fff",borderRadius:"6px 6px 0 0",padding:"9px 18px",font:"500 14px/18px Roboto",color:blue,marginBottom:-1,position:"relative",zIndex:2}}>Automation Log</div>
            </div>
          </div>
        </div>
        <div className="ws-scrollbody" style={{flex:1,overflowY:"auto",overflowX:"hidden",background:"#fff",margin:"0 20px 20px",borderLeft:"1px solid #CFCFCF",borderRight:"1px solid #CFCFCF",borderBottom:"1px solid #CFCFCF",borderRadius:"0 0 6px 6px"}}>
          <div style={{padding:"0 28px 32px"}}>
            <div style={{display:"flex",alignItems:"flex-end",borderBottom:"1px solid #e2e8f0",marginBottom:14}}>
              <span style={{padding:"10px 2px",font:"500 14px/18px Roboto",color:blue,borderBottom:"2px solid "+blue,marginBottom:-1}}>Notifications</span>
            </div>
            <div style={{font:"400 12px/16px Roboto",color:"#64748b",marginBottom:12}}>Transaction Status of Notification Workflows</div>
            <div style={{display:"flex",gap:10,marginBottom:16}}>
              <select value={ep} onChange={e=>setEp(e.target.value)} style={selSt}>
                <option value="">Select Episode ID</option>
                {[...new Set(mine.map(r=>r.episodeId))].map(v=><option key={v} value={v}>{v}</option>)}
              </select>
              <select value={ref} onChange={e=>setRef(e.target.value)} style={selSt}>
                <option value="">Select Ref ID</option>
                {mine.map(r=><option key={r.ref} value={r.ref}>{r.ref}</option>)}
              </select>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{borderCollapse:"collapse",width:"100%",minWidth:1200}}>
                <thead><tr>{["Ref ID","Episode ID","Event","Task Type","Report Name","Physician/Facility Name","Comm. Method","Current Stage","Start Time","End Time","Status"].map(h=><th key={h} style={hd}>{h}</th>)}</tr></thead>
                <tbody>{shown.length===0
                  ? <tr><td colSpan={11} style={{...td,color:"#94a3b8",textAlign:"center",padding:"28px 10px"}}>No notification workflows match the selection.</td></tr>
                  : shown.map((r,i)=>(
                    <tr key={r.ref} style={{background:i%2===0?"#fff":"#fafafa"}}>
                      <td style={{...td,color:blue,fontWeight:500}}>{r.ref}</td>
                      <td style={td}>{r.episodeId}</td>
                      <td style={td}>{r.event}</td>
                      <td style={{...td,maxWidth:240,overflow:"hidden",textOverflow:"ellipsis"}} title={r.taskType}>{r.taskType}</td>
                      <td style={td}>{r.reportName || dash}</td>
                      <td style={td}>{r.physFacilityName || dash}</td>
                      <td style={td}>{r.commMethod || dash}</td>
                      <td style={{...td,maxWidth:320,overflow:"hidden",textOverflow:"ellipsis"}} title={r.atReason ? r.stage + " — " + r.atReason : r.stage}>{r.stage}</td>
                      <td style={td}>{r.st}</td>
                      <td style={td}>{r.et==="—" ? dash : r.et}</td>
                      <td style={{...td,textAlign:"center"}}><NOTLogATIcon kind={r.at} /></td>
                    </tr>
                  ))}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <style>{"@keyframes notlFade { from { opacity: 0 } to { opacity: 1 } } @keyframes notlSlide { from { transform: translateX(28px); opacity: .6 } to { transform: translateX(0); opacity: 1 } }"}</style>
    </div>, document.body
  );
}

function NotificationsAutomationLogView({ onRefClick }) {
  const src = (typeof window!=="undefined" && window.NOT_ROWS) || [];
  const logRows = src.map((r,i)=>({
    id: r.id,
    ref: "NOT" + String(i+1).padStart(10,"0"),
    event: r.event,
    name: r.name,
    mrn: r.mrn,
    branchId: r.branchId,
    reportName: r.reportName,
    physFacilityName: r.physFacilityName,
    atReason: r.atReason,
    serviceLine: r.serviceLine,
    episodeId: r.episodeId,
    taskType: r.taskType,
    commMethod: r.commMethod,
    stage: notLogStage(r, i),
    status: r.status,
    st: r.dueDate + " 09:39 AM",
    et: r.at==="hourglass" ? "—" : r.dueDate + " 04:12 PM",
    at: r.at,
  }));

  const [cardFilter, setCardFilter] = useNOTL(null);
  const [searchQ, setSearchQ]       = useNOTL("");
  const [sortKey, setSortKey]       = useNOTL(null);
  const [sortDir, setSortDir]       = useNOTL("asc");
  const [fieldFilters, setFieldFilters] = useNOTL([]);
  const [fpOpen, setFpOpen]         = useNOTL(false);
  const [slider, setSlider]         = useNOTL(null);
  const onSort = (k)=>{ if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };

  const FP = typeof window!=="undefined" && window.FilterPopover;
  const filtered = fieldFilters.length ? logRows.filter(r=>fieldFilters.every(f=>f.values.includes(r[f.field]))) : logRows;
  const searched = searchQ ? filtered.filter(r=>Object.values(r).join(" ").toLowerCase().includes(searchQ.toLowerCase())) : filtered;
  const activeCard = cardFilter ? NOT_LOG_CARDS.find(c=>c.id===cardFilter) : null;
  const scoped = activeCard ? searched.filter(activeCard.match) : searched;
  const rows = sortKey ? [...scoped].sort((a,b)=>{ const av=(a[sortKey]||"").toString().toLowerCase(), bv=(b[sortKey]||"").toString().toLowerCase(); return sortDir==="asc"?av.localeCompare(bv):bv.localeCompare(av); }) : scoped;

  const labelOf = (k)=>(NOT_LOG_FIELDS.find(f=>f.key===k)||{}).label||k;
  const tags = [];
  fieldFilters.forEach(f=>f.values.forEach(v=>tags.push({
    id:`${f.field}:${v}`, label:`${labelOf(f.field)}: ${v}`,
    onRemove:()=>setFieldFilters(fieldFilters.map(x=>x.field===f.field?{...x,values:x.values.filter(y=>y!==v)}:x).filter(x=>x.values.length)),
  })));

  return (
    <div style={{background:"#fff",minHeight:"100%"}} data-screen-label="02 Notifications Automation Log">
      <div style={{background:"#eef4fb",borderBottom:"1px solid #e2e8f0",padding:"10px 24px",display:"flex",alignItems:"center",gap:14}}>
        <div style={{position:"relative",flexShrink:0}}>
          <button type="button" onClick={()=>setFpOpen(v=>!v)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:6,padding:"5px 4px",whiteSpace:"nowrap"}}>
            <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:"#2563eb",color:"#fff",fontSize:10,fontWeight:600,lineHeight:1}}>+</span>
            Add More Filters
          </button>
          {fpOpen && FP && <FP fields={NOT_LOG_FIELDS} rows={logRows} initial={fieldFilters} onApply={(f)=>{ setFieldFilters(f); setFpOpen(false); }} onClose={()=>setFpOpen(false)} />}
        </div>
        <div className="chip-scroll" style={{display:"flex",alignItems:"center",gap:14,overflowX:"auto",flex:"1 1 auto",minWidth:0}}>
          {tags.map(t=><NOTLogChip key={t.id} label={t.label} onRemove={t.onRemove} />)}
        </div>
        {tags.length>0 && <button type="button" onClick={()=>setFieldFilters([])} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",padding:"5px 4px",whiteSpace:"nowrap"}}>Clear all</button>}
        <div style={{position:"relative",flexShrink:0}}>
          <img src={(window.__resources&&window.__resources.searchIcon)||"icons/search.svg"} alt="search" style={{width:14,height:14,objectFit:"contain",position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}} />
          <input type="text" value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search Patient Records" style={{width:240,background:"#fff",border:"1px solid #93c5e8",borderRadius:6,padding:"6px 12px 6px 32px",font:"400 12px/16px Roboto",color:"#0f172a",outline:"none"}} />
        </div>
      </div>
      <div style={{padding:"20px 24px 0"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,flexWrap:"wrap",marginBottom:12}}>
          <div>
            <div style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Automation Log</div>
            <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Transaction Status of HH/HO Notification Workflows</div>
          </div>
          <div style={{display:"flex",gap:28,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
            {NOT_LOG_CARDS.map(c=>{
              const active=cardFilter===c.id, dim=cardFilter&&!active, isAll=c.id==="all";
              const val=filtered.filter(c.match).length;
              return (
                <div key={c.id} role="button" onClick={()=>setCardFilter(active?null:(isAll?null:c.id))}
                  style={{minWidth:88,display:"flex",flexDirection:"column",gap:8,cursor:"pointer",opacity:(dim&&!isAll)?0.4:1,transition:"opacity .12s"}}>
                  <div style={{height:3,borderRadius:2,background:c.color,opacity:active?1:0.85}}></div>
                  <div style={{display:"flex",alignItems:"center",gap:5,font:"400 13px/17px Roboto",color:active?"#0f172a":(dim&&isAll)?"#b0b0b0":"#605D5D",whiteSpace:"nowrap"}}>
                    {c.icon && <img src={c.icon} alt="" title={c.label} style={{width:18,height:18,objectFit:"contain",flexShrink:0}} />}
                    {c.label}
                  </div>
                  <div style={{font:"500 16px/20px Roboto",color:active?"#0f172a":(dim&&isAll)?"#b0b0b0":"#605D5D"}}>{notlPad(val)}</div>
                  {cardFilter&&isAll&&(
                    <button type="button" onClick={(e)=>{e.stopPropagation();setCardFilter(null);}} style={{marginTop:2,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}><span style={{fontSize:11}}>↻</span>Reset</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block",marginBottom:16}}>Click Ref ID to open the related notification record</div>
        <div className="chip-scroll" style={{overflow:"auto",maxHeight:"calc(100vh - 380px)"}}><div style={{minWidth:NOT_LOG_MIN_W}}>
        <div style={{display:"grid",gridTemplateColumns:NOT_LOG_GRID,alignItems:"stretch",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",minHeight:44,padding:"0 12px",gap:6,position:"sticky",top:0,zIndex:3}}>
          {NOT_LOG_COLS.map(c=>(
            <div key={c.key} onClick={c.sort?()=>onSort(c.key):undefined}
              style={{display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",gap:3,font:"500 11px/14px Roboto",color:"#64748b",whiteSpace:"nowrap",cursor:c.sort?"pointer":"default",userSelect:"none",overflow:"hidden",padding:"0 2px",...(c.key==="at"?{position:"sticky",right:0,background:"#f8fafc",alignSelf:"stretch",boxShadow:"-6px 0 8px -6px rgba(15,23,42,0.18)"}:null)}}>
              {c.sort && <NOTLogSortArrows active={sortKey===c.key} dir={sortDir} />}
              {c.label}
            </div>
          ))}
        </div>
        <div className="ws-scrollbody" style={{paddingTop:8}}>
          {rows.length===0
            ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>No records match.</div>
            : rows.map(r=>(
              <div key={r.ref} style={{display:"grid",gridTemplateColumns:NOT_LOG_GRID,alignItems:"center",minHeight:52,padding:"6px 12px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:6,background:"#fff",boxShadow:"0 1px 2px rgba(15,23,42,0.03)",gap:6,position:"relative"}}>
                <div style={{position:"absolute",left:8,top:8,bottom:8,width:3,background:"#A66092",borderRadius:2}}></div>
                <div onClick={()=>setSlider(r)} style={{font:"500 12px/16px Roboto",color:"#2563eb",cursor:"pointer",paddingLeft:18,display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden"}}>{r.ref}</div>
                {["name","episodeId","serviceLine","event","taskType","commMethod","stage","st","et"].map(k=>(
                  <div key={k} style={{font:"500 12px/16px Roboto",color:"#333333",display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,padding:"0 2px"}} title={r[k]}>{r[k]==="—"?<span style={{color:"#cbd5e1"}}>—</span>:r[k]}</div>
                ))}
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",position:"sticky",right:0,zIndex:1,background:"#fff",alignSelf:"stretch",boxShadow:"-6px 0 8px -6px rgba(15,23,42,0.18)"}}><NOTLogATIcon kind={r.at} /></div>
              </div>
            ))}
        </div>
        </div></div>
          <div style={{padding:"12px 0",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} of {logRows.length} records shown</div>
      </div>
      {slider && <NOTAutomationSlider row={slider} logRows={logRows} onClose={()=>setSlider(null)} />}
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { NotificationsAutomationLogView, NOTAutomationSlider });
