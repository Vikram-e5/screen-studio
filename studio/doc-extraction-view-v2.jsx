// Doc Extraction — Documents Extraction Center (main grid) + Automation Log.
// Reuses CDM / ARV styles verbatim (filter bar, status strip, card rows).
const { useState: useDX } = React;

const DX_NAMES = ["Marvin Mckinney","Esther Howard","Cameron Williamson","Leslie Alexander","Robert Fox","Jenny Wilson","Jacob Jones","Guy Hawkins","Jane Cooper","Kristin Watson","Cody Fisher","Kathryn Murphy","Devon Lane","Dianne Russell","Arlene McCoy","Theresa Webb","Darlene Robertson","Courtney Henry"];
const DX_AGENCIES = ["Sunrise Home Health","Evergreen Care","BrightPath Health"];
const DX_EVENTS = ["Start of Care","Recertification","Resumption of Care","Discharge","Transfer"];
const DX_STAGES = ["Document Retrieval","OCR Extraction","Data Validation","EHR Upload"];
const DX_AT = ["thumb","thumb","hourglass","warning","thumb","hourglass","thumb","warning"];
const DX_ROWS = DX_NAMES.map((name,i)=>{
  const at = DX_AT[i % DX_AT.length];
  const d = String(1 + (i*3)%28).padStart(2,"0");
  return {
    id:"dx"+(i+1), ref:"DX"+String(i+1).padStart(10,"0"), name,
    mrn:"B67890123"+String(45600+i*37),
    agency:DX_AGENCIES[i%3], branch:"BC00"+(1+i%3),
    episodeId:["Epi","TY","K7","G3","M5"][i%5]+String(23456+i*111),
    eventType:DX_EVENTS[i%DX_EVENTS.length],
    referral: i%4!==3, visitNotes: i%3!==2,
    download: at==="thumb"?"downloaded":at==="hourglass"?"pending":"failed",
    at, stage: at==="thumb"?"EHR Upload":DX_STAGES[i%3],
    st:"04/"+d+"/25 09:"+String(10+i).padStart(2,"0")+" AM",
    et: at==="hourglass"?"—":"04/"+d+"/25 10:"+String(5+i).padStart(2,"0")+" AM",
  };
});
if (typeof window !== "undefined") window.DX_ROWS = DX_ROWS;

const dxPad = n => String(n).padStart(2,"0");
const DX_STATUS_ITEMS = [
  { id:"all",       label:"All Patients",    color:"rgb(21,95,130)",   match:()=>true, icon:null },
  { id:"thumb",     label:"Completed",       color:"rgb(14,165,233)",  match:r=>r.at==="thumb",     icon:"icons/at-completed.png" },
  { id:"hourglass", label:"In Progress",     color:"rgb(148,163,184)", match:r=>r.at==="hourglass", icon:"icons/at-in-progress.png" },
  { id:"warning",   label:"Needs Attention", color:"rgb(245,158,11)",  match:r=>r.at==="warning",   icon:"icons/at-needs-attention.png" },
];
const DX_DL = {
  downloaded:{bg:"#f0fdf4",bd:"#16a34a",c:"#16a34a",label:"Downloaded"},
  pending:   {bg:"#fffbeb",bd:"#d97706",c:"#d97706",label:"Pending"},
  failed:    {bg:"#fef2f2",bd:"#dc2626",c:"#dc2626",label:"Failed"},
};

function DXSummaryCards({ rows, active, onPick, allLabel }) {
  return (
    <div style={{display:"flex",gap:28,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
      {DX_STATUS_ITEMS.map(c=>{
        const on=active===c.id, dim=active&&!on, isAll=c.id==="all";
        return (
          <div key={c.id} role="button" onClick={()=>onPick(on?null:c.id)} style={{minWidth:82,display:"flex",flexDirection:"column",gap:8,cursor:"pointer",opacity:(dim&&!isAll)?0.4:1,transition:"opacity .12s"}}>
            <div style={{height:3,borderRadius:2,background:c.color,opacity:on?1:0.85}}></div>
            <div style={{display:"flex",alignItems:"center",gap:5,font:"400 13px/17px Roboto",color:on?"#0f172a":(dim&&isAll)?"#b0b0b0":"#605D5D",whiteSpace:"nowrap"}}>
              {c.icon&&<img src={c.icon} alt="" style={{width:14,height:14,objectFit:"contain",flexShrink:0}} />}
              {isAll?allLabel:c.label}
            </div>
            <div style={{font:"500 16px/20px Roboto",color:on?"#0f172a":(dim&&isAll)?"#b0b0b0":"#605D5D"}}>{dxPad(rows.filter(c.match).length)}</div>
            {active&&isAll&&<button type="button" onClick={e=>{e.stopPropagation();onPick(null);}} style={{marginTop:2,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}><span style={{fontSize:11}}>↻</span>Reset</button>}
          </div>
        );
      })}
    </div>
  );
}

function DXGridView({ cols, rows, sortKey, sortDir, onSort, renderCell, total }) {
  const ARVSortArrows = window.ARVSortArrows;
  const GRID = cols.map(c=>c.w).join(" ");
  return (
    <React.Fragment>
      <div style={{display:"grid",gridTemplateColumns:GRID,alignItems:"stretch",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",minHeight:44,padding:"0 12px",gap:6}}>
        {cols.map(c=>(
          <div key={c.key} onClick={c.sort?()=>onSort(c.key):undefined} style={{display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",gap:3,font:"500 11px/14px Roboto",color:"#64748b",whiteSpace:"nowrap",cursor:c.sort?"pointer":"default",userSelect:"none",overflow:"hidden",padding:"0 2px"}}>
            {c.sort&&ARVSortArrows&&<ARVSortArrows active={sortKey===c.key} dir={sortDir} />}
            {c.label}
          </div>
        ))}
      </div>
      <div style={{overflowY:"auto",maxHeight:"calc(100vh - 340px)"}}>
        {rows.length===0
          ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>No records match.</div>
          : rows.map(r=>(
            <div key={r.id} style={{display:"grid",gridTemplateColumns:GRID,alignItems:"center",minHeight:52,padding:"6px 12px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:6,background:"#fff",boxShadow:"0 1px 2px rgba(15,23,42,0.03)",gap:6,position:"relative"}}>
              {cols.map(c=>(
                <div key={c.key} style={{font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,padding:"0 2px"}}>{renderCell(c.key,r)}</div>
              ))}
            </div>
          ))}
        <div style={{padding:"12px 0",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} of {total} records shown</div>
      </div>
    </React.Fragment>
  );
}

function dxUseRows(filterRows) {
  const [cardFilter, setCardFilter] = useDX(null);
  const [searchQ, setSearchQ] = useDX("");
  const [sortKey, setSortKey] = useDX(null);
  const [sortDir, setSortDir] = useDX("asc");
  const [fieldFilters, setFieldFilters] = useDX([]);
  const onSort = k => { if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };
  const filtered = fieldFilters.length ? filterRows.filter(r=>fieldFilters.every(f=>f.values.includes(r[f.field]))) : filterRows;
  const searched = searchQ ? filtered.filter(r=>Object.values(r).join(" ").toLowerCase().includes(searchQ.toLowerCase())) : filtered;
  const card = cardFilter && DX_STATUS_ITEMS.find(c=>c.id===cardFilter);
  const scoped = card ? searched.filter(card.match) : searched;
  const rows = sortKey ? [...scoped].sort((a,b)=>{ const av=String(a[sortKey]??""), bv=String(b[sortKey]??""); return sortDir==="asc"?av.localeCompare(bv):bv.localeCompare(av); }) : scoped;
  return { rows, filtered, cardFilter, setCardFilter, searchQ, setSearchQ, sortKey, sortDir, onSort, fieldFilters, setFieldFilters };
}

const DX_MAIN_COLS = [
  { key:"name",      label:"Patient Name",        w:"minmax(130px,1.3fr)", sort:true },
  { key:"mrn",       label:"Patient MRN",         w:"minmax(120px,1.2fr)", sort:true },
  { key:"agency",    label:"Agency Name",         w:"minmax(130px,1.3fr)", sort:true },
  { key:"branch",    label:"Branch Code",         w:"minmax(80px,0.8fr)",  sort:true },
  { key:"episodeId", label:"Episode ID",          w:"minmax(90px,0.9fr)",  sort:true },
  { key:"eventType", label:"Event Type",          w:"minmax(120px,1.2fr)", sort:true },
  { key:"referral",  label:"Referral Attachment", w:"minmax(118px,0.9fr)", sort:false, align:"center" },
  { key:"visitNotes",label:"Visit Notes",         w:"minmax(76px,0.7fr)",  sort:false, align:"center" },
  { key:"download",  label:"Download Status",     w:"minmax(118px,1fr)",   sort:true },
  { key:"at",        label:"AT Status",           w:"72px",                sort:false, align:"center" },
  { key:"reviewed",  label:"Reviewed",            w:"72px",                sort:false, align:"center" },
];
const DX_MAIN_FILTERS = [
  { key:"agency", label:"Agency Name" }, { key:"branch", label:"Branch Code" },
  { key:"episodeId", label:"Episode ID" }, { key:"eventType", label:"Event Type" },
];

function DocExtractionView({ review }) {
  const s = dxUseRows(DX_ROWS);
  const [reviewed, setReviewed] = useDX({});
  const ARVFilterBarChips = window.ARVFilterBarChips, ARVATIcon = window.ARVATIcon;
  const docIcon = (on) => <img src={(window.__resources&&window.__resources.attachmentType)||"icons/attachment-type.svg"} width="18" height="18" alt="" style={{display:"block",opacity:on?1:0.35,cursor:on?"pointer":"default"}} />;
  let rows = s.rows;
  if (review) rows = rows.filter(r=>r.at==="warning" && !reviewed[r.id]);
  const cell = (k,r)=>{
    if (k==="name") return <a href="#" onClick={e=>{ e.preventDefault(); window.__v2OpenDetail&&window.__v2OpenDetail("docext",r); }} style={{color:"#2563eb",font:"500 13px/16px Roboto",textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis"}}>{r.name}</a>;
    if (k==="episodeId") return <span style={{color:"#1e40af"}}>{r.episodeId}</span>;
    if (k==="referral" || k==="visitNotes") return docIcon(r[k]);
    if (k==="download") { const p=DX_DL[r.download]; return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"4px 12px",borderRadius:4,background:p.bg,border:"1px solid "+p.bd,color:p.c,font:"500 11px/16px Roboto",minWidth:100,boxSizing:"border-box"}}>{p.label}</span>; }
    if (k==="at") return ARVATIcon ? <ARVATIcon kind={r.at} /> : null;
    if (k==="reviewed") { const on=!!reviewed[r.id]; return (
      <span role="checkbox" aria-checked={on} tabIndex={0} onClick={()=>setReviewed(m=>({...m,[r.id]:!m[r.id]}))} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:"1px solid "+(on?"#2563eb":"#d8d8d8"),borderRadius:3,background:on?"#2563eb":"#fff",cursor:"pointer"}}>
        {on&&<span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}
      </span>); }
    return r[k];
  };
  return (
    <div style={{background:"#fff",minHeight:"100%"}}>
      {ARVFilterBarChips && <ARVFilterBarChips dateLabel="Extraction Date : 04/01/25 – 04/30/25" searchValue={s.searchQ} onSearch={s.setSearchQ} filterFields={DX_MAIN_FILTERS} filterRows={DX_ROWS} fieldFilters={s.fieldFilters} onFieldFilters={s.setFieldFilters} onClearFilters={s.fieldFilters.length?()=>s.setFieldFilters([]):null} />}
      <div style={{padding:"20px 32px 0"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,flexWrap:"wrap",marginBottom:12}}>
          <div>
            <div style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Doc Extraction View</div>
            <div style={{font:"400 13px/18px Roboto",color:"#3A424A",marginTop:8}}>Status Summary of Document Extraction Requests</div>
          </div>
          <DXSummaryCards rows={s.filtered} active={s.cardFilter} onPick={s.setCardFilter} allLabel="All Patients" />
        </div>
        <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block",marginBottom:16}}>Click Patient Name to view related extraction transactions</div>
        <DXGridView cols={DX_MAIN_COLS} rows={rows} sortKey={s.sortKey} sortDir={s.sortDir} onSort={s.onSort} renderCell={cell} total={DX_ROWS.length} />
      </div>
    </div>
  );
}

const DX_LOG_COLS = [
  { key:"ref",   label:"Ref ID",                 w:"minmax(120px,1.1fr)", sort:true },
  { key:"name",  label:"Patient Name",           w:"minmax(130px,1.3fr)", sort:true },
  { key:"mrn",   label:"Patient MRN",            w:"minmax(120px,1.2fr)", sort:true },
  { key:"stage", label:"Current Stage",          w:"minmax(130px,1.2fr)", sort:true },
  { key:"st",    label:"Transaction Start Time", w:"minmax(140px,1.3fr)", sort:true },
  { key:"et",    label:"Transaction End Time",   w:"minmax(140px,1.3fr)", sort:true },
  { key:"at",    label:"AT Status",              w:"72px",                sort:false, align:"center" },
];
const DX_LOG_FILTERS = [
  { key:"agency", label:"Agency Name" }, { key:"branch", label:"Branch Code" },
  { key:"episodeId", label:"Episode ID" }, { key:"eventType", label:"Event Type" },
  { key:"stage", label:"Current Stage" },
];

function DocExtractionAutomationLog() {
  const s = dxUseRows(DX_ROWS);
  const ARVFilterBarChips = window.ARVFilterBarChips, ARVATIcon = window.ARVATIcon;
  const cell = (k,r)=>{
    if (k==="ref") return <span style={{display:"flex",alignItems:"center",gap:15}}><span style={{width:3,alignSelf:"stretch",minHeight:36,background:"#A66092",borderRadius:2}}></span><span style={{color:"#2563eb",cursor:"pointer"}}>{r.ref}</span></span>;
    if (k==="at") return ARVATIcon ? <ARVATIcon kind={r.at} /> : null;
    return r[k];
  };
  return (
    <div style={{background:"#fff",minHeight:"100%"}}>
      {ARVFilterBarChips && <ARVFilterBarChips dateLabel="Transaction Date : 04/01/25 – 04/30/25" searchValue={s.searchQ} onSearch={s.setSearchQ} filterFields={DX_LOG_FILTERS} filterRows={DX_ROWS} fieldFilters={s.fieldFilters} onFieldFilters={s.setFieldFilters} onClearFilters={s.fieldFilters.length?()=>s.setFieldFilters([]):null} />}
      <div style={{padding:"20px 32px 0"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,flexWrap:"wrap",marginBottom:12}}>
          <div>
            <div style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Automation Log</div>
            <div style={{font:"400 13px/18px Roboto",color:"#3A424A",marginTop:8}}>Transaction Status of Document Extraction Workflows</div>
          </div>
          <DXSummaryCards rows={s.filtered} active={s.cardFilter} onPick={s.setCardFilter} allLabel="All Transaction" />
        </div>
        <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block",marginBottom:16}}>Click Ref ID to view related extraction transactions</div>
        <DXGridView cols={DX_LOG_COLS} rows={s.rows} sortKey={s.sortKey} sortDir={s.sortDir} onSort={s.onSort} renderCell={cell} total={DX_ROWS.length} />
      </div>
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { DocExtractionView, DocExtractionAutomationLog });
