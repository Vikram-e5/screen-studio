// Assessment Automation Log — same structure as ERVAutomationLogView, assessment data.
// Deep-linked from the Assessment Request View: clicking a Patient Name opens this
// tab pre-filtered to that submission (focusId).
const { useState: useASVL } = React;

function asvLogRows() {
  const src = (typeof window !== "undefined" && window.ASV_ROWS) || [];
  return src.map((r, i) => ({
    id: r.id,
    ref: "ASMT" + String(i + 1).padStart(8, "0"),
    wf: r.source === "HOPE Console" ? "HOPE - Assessment Submission" : "OASIS - Assessment Submission",
    stage: r.at === "hourglass" ? "Awaiting iQIES Response" : r.at === "warning" ? "Validation Review" : "Submitted",
    facility: r.facilityId,
    branch: r.branchCode,
    name: r.name,
    mrn: r.mrn,
    episodeId: r.episodeId,
    submissionId: r.submissionId,
    txnType: r.txnType,
    source: r.source,
    msg: r.msgNum ? r.msgNum + " " + r.msgSev : "—",
    errMsg: r.at === "warning" ? (r.atReason || "Automation error — submission not completed") : "—",
    valStatus: (window.ASV_VAL_LABELS && window.ASV_VAL_LABELS[r.valStatus]) || ({accepted:"Accepted",warning:"Accepted w/ Warning",rejected:"Rejected",duplicate:"Duplicate"})[r.valStatus],
    st: r.submitted + " 09:14 AM",
    et: r.at === "hourglass" ? "—" : r.submitted + " 09:39 AM",
    at: r.at,
  }));
}

const ASVL_CARDS = [
  { id:"all",       label:"All Transactions", color:"rgb(21,95,130)",   match:()=>true,                icon:null },
  { id:"thumb",     label:"Completed",        color:"rgb(14,165,233)",  match:r=>r.at==="thumb",       get icon(){ return (window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png"; } },
  { id:"warning",   label:"Needs Attention",  color:"rgb(245,158,11)",  match:r=>r.at==="warning",     get icon(){ return (window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png"; } },
  { id:"hourglass", label:"In Progress",      color:"rgb(148,163,184)", match:r=>r.at==="hourglass",   get icon(){ return (window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png"; } },
];
const ASVL_FILTER_FIELDS = [
  { key:"facility",  label:"Facility ID" },
  { key:"branch",    label:"Branch Code" },
  { key:"source",    label:"Source" },
  { key:"txnType",   label:"Type of Transaction" },
  { key:"valStatus", label:"Validation Status" },
];
const ASVL_COLS = [
  { key:"ref",          label:"Ref ID",              w:"minmax(110px,1.1fr)", sort:true },
  { key:"wf",           label:"Workflow",            w:"minmax(190px,1.9fr)", sort:true },
  { key:"stage",        label:"Current Stage",       w:"minmax(120px,1.2fr)", sort:true },
  { key:"facility",     label:"Facility ID",         w:"minmax(72px,0.72fr)", sort:true },
  { key:"name",         label:"Patient Name",        w:"minmax(120px,1.2fr)", sort:true },
  { key:"mrn",          label:"Patient MRN",         w:"minmax(110px,1.1fr)", sort:true },
  { key:"submissionId", label:"Submission ID",       w:"minmax(88px,0.88fr)", sort:true },
  { key:"msg",          label:"Message / Severity",  w:"minmax(105px,1.05fr)",sort:true },
  { key:"errMsg",       label:"Error Message",       w:"minmax(190px,1.9fr)", sort:true },
  { key:"st",           label:"Start Date",          w:"minmax(115px,1.15fr)",sort:true },
  { key:"et",           label:"End Date",            w:"minmax(115px,1.15fr)",sort:true },
  { key:"at",           label:"AT Status",           w:"70px",                sort:false, align:"center" },
];
const ASVL_GRID = ASVL_COLS.map(c=>c.w).join(" ");

function AssessmentAutomationLogView({ focusId, onClearFocus }) {
  const ALL = asvLogRows();
  const [cardFilter, setCardFilter] = useASVL(null);
  const [searchQ, setSearchQ] = useASVL("");
  const [sortKey, setSortKey] = useASVL(null);
  const [sortDir, setSortDir] = useASVL("asc");
  const [fieldFilters, setFieldFilters] = useASVL([]);
  const handleSort = k => { if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };

  const focusRow = focusId ? ALL.find(r=>r.id===focusId) : null;
  const focused = focusRow ? ALL.filter(r=>r.name===focusRow.name) : ALL;
  const filtered = fieldFilters.length ? focused.filter(r=>fieldFilters.every(f=>f.values.includes(r[f.field]))) : focused;
  const searched = searchQ ? filtered.filter(r=>Object.values(r).join(" ").toLowerCase().includes(searchQ.toLowerCase())) : filtered;
  const activeCard = cardFilter ? ASVL_CARDS.find(c=>c.id===cardFilter) : null;
  const scoped = activeCard ? searched.filter(activeCard.match) : searched;
  const rows = sortKey ? [...scoped].sort((a,b)=>{ const av=String(a[sortKey]||""), bv=String(b[sortKey]||""); return sortDir==="asc"?av.localeCompare(bv):bv.localeCompare(av); }) : scoped;

  const ARVFilterBarChips = typeof window!=="undefined" && window.ARVFilterBarChips;
  const ARVSortArrows = typeof window!=="undefined" && window.ARVSortArrows;
  const ARVATIcon = typeof window!=="undefined" && window.ARVATIcon;
  const pad = n => String(n).padStart(2,"0");

  return (
    <div style={{background:"#fff",minHeight:"100%"}} data-screen-label="02 Assessment Automation Log">
      {ARVFilterBarChips && <ARVFilterBarChips hideSearch={false} searchValue={searchQ} onSearch={setSearchQ} filterFields={ASVL_FILTER_FIELDS} filterRows={ALL} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters} onClearFilters={fieldFilters.length?()=>setFieldFilters([]):null} />}
      <div style={{padding:"20px 32px 0"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,flexWrap:"wrap",marginBottom:12}}>
          <div>
            <div style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Automation Log</div>
            <div style={{font:"400 13px/18px Roboto",color:"#3A424A",marginTop:8}}>Transaction Status of Assessment Submission Workflows</div>
          </div>
          <div style={{display:"flex",gap:28,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
            {ASVL_CARDS.map(c=>{
              const active = cardFilter===c.id, dim = cardFilter && !active, isAll = c.id==="all";
              const val = filtered.filter(c.match).length;
              return (
                <div key={c.id} role="button" title={c.label} onClick={()=>setCardFilter(active?null:c.id)} style={{minWidth:82,display:"flex",flexDirection:"column",gap:8,cursor:"pointer",opacity:(dim&&!isAll)?0.4:1,transition:"opacity .12s"}}>
                  <div style={{height:3,borderRadius:2,background:c.color,opacity:active?1:0.85}}></div>
                  <div style={{display:"flex",alignItems:"center",gap:5,font:"400 13px/17px Roboto",color:active?"#0f172a":(dim&&isAll)?"#b0b0b0":"#605D5D",whiteSpace:"nowrap"}}>
                    {c.icon && <img src={c.icon} alt="" title={c.label} style={{width:14,height:14,objectFit:"contain",flexShrink:0}} />}
                    {c.label}
                  </div>
                  <div style={{font:"500 16px/20px Roboto",color:active?"#0f172a":(dim&&isAll)?"#b0b0b0":"#605D5D"}}>{pad(val)}</div>
                  {cardFilter && isAll && <button type="button" onClick={e=>{ e.stopPropagation(); setCardFilter(null); }} style={{marginTop:2,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}><span style={{fontSize:11}}>↻</span>Reset</button>}
                </div>
              );
            })}
          </div>
        </div>
        {focusRow
          ? <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"#eef4fb",border:"1px solid #93c5e8",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#334155",marginBottom:16}}>
              Showing transactions for <strong style={{fontWeight:600}}>{focusRow.name}</strong> · {focusRow.mrn}
              <button type="button" onClick={onClearFocus} style={{background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto"}}>Show all</button>
            </div>
          : <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block",marginBottom:16}}>Click Ref ID to view related assessment transactions</div>}
        <div style={{display:"grid",gridTemplateColumns:ASVL_GRID,alignItems:"stretch",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",minHeight:44,padding:"0 12px",gap:6,position:"sticky",top:0,zIndex:5,boxShadow:"0 1px 0 #e2e8f0"}}>
          {ASVL_COLS.map(c=>(
            <div key={c.key} onClick={c.sort?()=>handleSort(c.key):undefined} style={{display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",gap:3,font:"500 11px/14px Roboto",color:"#64748b",whiteSpace:"nowrap",cursor:c.sort?"pointer":"default",userSelect:"none",overflow:"hidden",padding:"0 2px"}}>
              {c.sort && ARVSortArrows && <ARVSortArrows active={sortKey===c.key} dir={sortDir} />}
              {c.label}
            </div>
          ))}
        </div>
        <div style={{overflowY:"auto",maxHeight:"calc(100vh - 340px)",paddingTop:6}}>
          {rows.length===0
            ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>No records match.</div>
            : rows.map((r,i)=>(
              <div key={r.ref+i} style={{display:"grid",gridTemplateColumns:ASVL_GRID,alignItems:"center",minHeight:52,padding:"6px 12px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:6,background:"#fff",boxShadow:"0 1px 2px rgba(15,23,42,0.03)",gap:6,position:"relative"}}>
                <div style={{position:"absolute",left:8,top:8,bottom:8,width:3,background:"#A66092",borderRadius:2}}></div>
                <div style={{font:"500 12px/16px Roboto",color:"#2563eb",paddingLeft:18,display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden"}}>{r.ref}</div>
                <div style={{font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,padding:"0 2px"}}>{r.wf}</div>
                <div style={{font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,padding:"0 2px"}}>{r.stage}</div>
                <div style={{font:"600 12px/16px Roboto",color:"#3b82f6",display:"flex",alignItems:"center",whiteSpace:"nowrap",padding:"0 2px"}}>{r.facility}</div>
                <div style={{font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,padding:"0 2px"}}>{r.name}</div>
                <div style={{font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden",padding:"0 2px"}}>{r.mrn}</div>
                <div style={{font:"500 12px/16px Roboto",color:"#16a34a",display:"flex",alignItems:"center",whiteSpace:"nowrap",padding:"0 2px"}}>{r.submissionId}</div>
                <div style={{font:"500 12px/16px Roboto",color:r.msg==="—"?"#cbd5e1":r.msg.indexOf("Fatal")>-1?"#dc2626":"#d97706",display:"flex",alignItems:"center",whiteSpace:"nowrap",padding:"0 2px"}}>{r.msg}</div>
                <div title={r.errMsg} style={{font:"500 12px/16px Roboto",color:r.errMsg==="—"?"#cbd5e1":"#dc2626",display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,padding:"0 2px"}}>{r.errMsg}</div>
                <div style={{font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",whiteSpace:"nowrap",padding:"0 2px"}}>{r.st}</div>
                <div style={{font:"500 12px/16px Roboto",color:r.et==="—"?"#cbd5e1":"#333",display:"flex",alignItems:"center",whiteSpace:"nowrap",padding:"0 2px"}}>{r.et}</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>{ARVATIcon ? <ARVATIcon kind={r.at} /> : null}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { AssessmentAutomationLogView });
