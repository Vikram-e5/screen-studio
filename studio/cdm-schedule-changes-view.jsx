// CDM Schedule Changes View — mirrors CDM Request View layout exactly.
const { useState: useSCDM, useEffect: useSCDME, useRef: useSCDMR } = React;

// id, branch, name, mrn, episode, workerID, workerName, svcType, svcCode, tz, current, updated, ehrSync, at, reason, reviewed
const _SC = [
  ["sc1","BC001","Marvin Mckinney","B6100062245601","Epi23456","W-4521","Sarah Mitchell","PC","G0156","EST","11/26/2026 09:00 AM - 10:00 AM","11/28/2026 09:30 AM - 10:30 AM",1,"thumb","",0],
  ["sc2","BC001","Esther Howard","B6789012345678","I1J2K3L4","W-4789","James Thornton","Attend","T1019","EST","11/27/2026 02:00 PM - 03:00 PM","11/29/2026 01:00 PM - 02:00 PM",0,"warning","Schedule conflict detected",0],
  ["sc3","BC002","Cameron Williamson","B6100054445634","TY964257","W-5012","Linda Patel","PC","G0156","CST","11/28/2026 10:00 AM - 11:30 AM","11/30/2026 11:00 AM - 12:30 PM",1,"thumb","",1],
  ["sc4","BC001","Leslie Alexander","B6789012345697","K7L8M9N0","W-4523","Robert Chen","Attend","S5126","EST","11/26/2026 08:00 AM - 09:00 AM","11/28/2026 08:30 AM - 09:30 AM",0,"warning","Worker unavailable at updated time",0],
  ["sc5","BC003","Robert Fox","V6789012345686","G3H4I5J6","W-5201","Maria Gonzalez","PC","G0156","PST","11/27/2026 03:00 PM - 04:00 PM","11/29/2026 04:00 PM - 05:00 PM",1,"hourglass","",0],
  ["sc6","BC001","Jenny Wilson","B6789012345711","M5N6O7P8","W-4876","David Kim","Attend","T1019","EST","11/26/2026 01:00 PM - 02:00 PM","11/27/2026 02:00 PM - 03:00 PM",1,"thumb","",1],
  ["sc7","BC002","Jacob Jones","B6789012345716","Y7Z8A9B0","W-5103","Angela Foster","PC","G0156","MST","11/28/2026 11:00 AM - 12:00 PM","11/30/2026 10:00 AM - 11:00 AM",0,"warning","Patient not available",0],
  ["sc8","BC001","Guy Hawkins","L700093345918","A3B4C5D6","W-4654","Thomas Reed","Attend","S5126","EST","11/27/2026 09:00 AM - 10:00 AM","11/29/2026 09:00 AM - 10:00 AM",1,"hourglass","",0],
  ["sc9","BC003","Jane Cooper","B6789012345720","Q9R0S1T2","W-5214","Nancy Brooks","PC","G0156","PST","11/26/2026 04:00 PM - 05:30 PM","11/28/2026 03:30 PM - 05:00 PM",0,"warning","EHR sync failed",0],
  ["sc10","BC001","Kristin Watson","B6789012345801","TY964258","W-4789","Kevin Walsh","Attend","T1019","EST","11/27/2026 10:00 AM - 11:00 AM","11/29/2026 11:00 AM - 12:00 PM",1,"thumb","",1],
  ["sc11","BC002","Cody Fisher","B6789012345802","K7L8M9N1","W-5201","Patricia Simmons","PC","G0156","CST","11/28/2026 02:00 PM - 03:30 PM","11/30/2026 01:00 PM - 02:30 PM",1,"hourglass","",0],
  ["sc12","BC001","Kathryn Murphy","B6789012345803","G3H4I5J7","W-4521","Michael Torres","Attend","S5126","EST","11/26/2026 11:00 AM - 12:00 PM","11/28/2026 10:30 AM - 11:30 AM",0,"warning","Authorization required",0],
  ["sc13","BC003","Devon Lane","B6789012345804","M5N6O7P9","W-5103","Sandra Hughes","PC","G0156","PST","11/27/2026 08:00 AM - 09:30 AM","11/29/2026 08:00 AM - 09:30 AM",1,"thumb","",1],
  ["sc14","BC001","Dianne Russell","B6789012345805","Y7Z8A9B1","W-4876","Christopher Lane","Attend","T1019","EST","11/28/2026 03:00 PM - 04:00 PM","11/30/2026 02:00 PM - 03:00 PM",0,"warning","Overlapping appointment",0],
  ["sc15","BC002","Arlene McCoy","B6789012345806","S5T6U7V9","W-5012","Rebecca Flores","PC","G0156","MST","11/26/2026 12:00 PM - 01:00 PM","11/27/2026 01:00 PM - 02:00 PM",1,"hourglass","",0],
  ["sc16","BC001","Theresa Webb","B6789012345901","Epi99001","W-4654","Daniel Morgan","Attend","S5126","EST","11/27/2026 01:00 PM - 02:00 PM","11/29/2026 12:00 PM - 01:00 PM",1,"thumb","",1],
  ["sc17","BC003","Darlene Robertson","B6789012345902","Epi99002","W-5201","Catherine Bell","PC","G0156","PST","11/28/2026 09:00 AM - 10:30 AM","11/30/2026 09:30 AM - 11:00 AM",0,"warning","Distance too far for visit",0],
  ["sc18","BC001","Courtney Henry","B6789012345903","Epi99003","W-4789","Steven Murphy","Attend","T1019","EST","11/26/2026 10:00 AM - 11:00 AM","11/28/2026 11:00 AM - 12:00 PM",1,"thumb","",0],
  ["sc19","BC002","Ralph Edwards","B6789012345904","Epi99004","W-5103","Jennifer Cole","PC","G0156","CST","11/27/2026 02:00 PM - 03:00 PM","11/29/2026 03:00 PM - 04:00 PM",1,"hourglass","",0],
  ["sc20","BC001","Annette Black","B6789012345905","Epi99005","W-4521","Andrew Price","Attend","S5126","EST","11/28/2026 08:00 AM - 09:00 AM","11/30/2026 08:30 AM - 09:30 AM",0,"warning","Insurance verification needed",0],
  ["sc21","BC003","Floyd Miles","B6789012345906","Epi99006","W-5214","Elizabeth Turner","PC","G0156","PST","11/26/2026 03:00 PM - 04:30 PM","11/28/2026 02:30 PM - 04:00 PM",1,"thumb","",1],
  ["sc22","BC001","Jerome Bell","B6789012345907","Epi99007","W-4876","Matthew Hayes","Attend","T1019","EST","11/27/2026 11:00 AM - 12:00 PM","11/29/2026 10:00 AM - 11:00 AM",1,"hourglass","",0],
  ["sc23","BC002","Bessie Cooper","B6789012345908","Epi99008","W-5012","Laura Anderson","PC","G0156","MST","11/28/2026 01:00 PM - 02:00 PM","11/30/2026 12:00 PM - 01:00 PM",0,"warning","Duplicate visit scheduled",0],
  ["sc24","BC001","Eleanor Pena","B6789012345909","Epi99009","W-4654","Richard Scott","Attend","S5126","EST","11/26/2026 02:00 PM - 03:00 PM","11/27/2026 03:00 PM - 04:00 PM",1,"thumb","",1],
];
// Schedule Init Date = when the schedule change was initiated (2–3 days before the current visit)
const _scInit = (cur, i) => { const m = cur.match(/(\d\d)\/(\d\d)\/(\d{4})/); const d = new Date(+m[3], +m[1]-1, +m[2] - (2 + i % 2), 8 + (i*3) % 9, (i*17) % 60); const h = d.getHours(), p = h >= 12 ? "PM" : "AM"; return `${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}/${d.getFullYear()} ${String(h%12||12).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")} ${p}`; };
const SCHEDULE_CHANGES_ROWS = _SC.map((r, i) => ({ id:r[0], branchId:r[1], name:r[2], mrn:r[3], episodeId:r[4], workerID:r[5], workerName:r[6], serviceCodeType:r[7], serviceCode:r[8], timeZone:r[9], scheduleInitDate:_scInit(r[10], i), currentVisitTime:r[10], updatedVisitTime:r[11], ehrSync:!!r[12], atStatus:r[13], atReason:r[14], reviewed:!!r[15] }));
if (typeof window !== "undefined") window.SCHEDULE_CHANGES_ROWS = SCHEDULE_CHANGES_ROWS;

const scdmPad = n => String(n).padStart(2,"0");
function scdmCountsFor(rows) {
  return {
    all: rows.length,
    completed: rows.filter(r=>r.atStatus==="thumb").length,
    ending: rows.filter(r=>r.atStatus==="hourglass").length,
    late: rows.filter(r=>r.atStatus==="warning").length,
  };
}

const SCDM_STATUS_ITEMS = [
  { id:"all",       label:"All Changes",     color:"rgb(21,95,130)",   icon:null },
  { id:"completed", label:"Completed",       color:"rgb(14,165,233)",  get icon(){ return (window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png"; } },
  { id:"ending",    label:"In Progress",     color:"rgb(148,163,184)", get icon(){ return (window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png"; } },
  { id:"late",      label:"Needs Attention", color:"rgb(245,158,11)",  get icon(){ return (window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png"; } },
];

function SCDMFilterBar({ search, onSearch, reviewActive }) {
  return (
    <div style={{background:"#eef4fb",borderBottom:"1px solid #e2e8f0",padding:"10px 24px",display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap"}}>
      <button type="button" style={{background:"#fff",border:"1px solid #d8d8d8",borderRadius:4,padding:"5px 12px",font:"400 12px/16px Roboto",color:"#0f172a",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,flexShrink:0,whiteSpace:"nowrap"}}>
        Schedule Init Date : 11/01/26 – 11/30/26<span style={{color:"#94a3b8",fontSize:9}}>▾</span>
      </button>
      {reviewActive && (
        <span style={{display:"inline-flex",alignItems:"center",gap:10,background:"#f4f6f9",border:"1px solid #d8dee6",borderRadius:6,padding:"6px 10px",font:"400 12px/16px Roboto",color:"#334155",whiteSpace:"nowrap",flexShrink:0}}>
          AT Status: Needs Attention &nbsp;&bull;&nbsp; Reviewed: Not Reviewed
        </span>
      )}
      <div style={{flex:1}}></div>
      <div style={{position:"relative",flexShrink:0}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" value={search} onChange={e=>onSearch(e.target.value)} placeholder="Search Schedule Changes" style={{width:240,background:"#fff",border:"1px solid #93c5e8",borderRadius:6,padding:"6px 12px 6px 30px",font:"400 12px/16px Roboto",color:"#0f172a",outline:"none"}} />
      </div>
    </div>
  );
}

function SCDMTitleCluster() {
  return (
    <div>
      <div style={{display:"flex",alignItems:"baseline",gap:6,flexWrap:"wrap",position:"relative"}}>
        <span style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Schedule Changes</span>
      </div>
      <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Status Summary of Visit Schedule Changes</div>
      <div style={{marginTop:10,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block"}}>Click Patient Name to view Patient Summary</div>
    </div>
  );
}

function SCDMStatusStrip({ allRows, activeStatus, onPick }) {
  const c = scdmCountsFor(allRows);
  const byId = {all:c.all,completed:c.completed,ending:c.ending,late:c.late};
  const visuallyActive = (id) => id !== "all" && activeStatus === id;
  return (
    <div style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",overflow:"hidden",width:"550px"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333",flexShrink:0}}>
        <span>Automation</span><span>Status</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-start",width:"526px",justifyContent:"flex-start",gap:0}}>
        {SCDM_STATUS_ITEMS.map(s=>{
          const active=visuallyActive(s.id);
          const dim=activeStatus&&activeStatus!=="all"&&!active;
          return (
            <div key={s.id} role="button" onClick={()=>onPick(active?null:s.id)}
              style={{flex:"0 0 auto",padding:"10px 16px 12px",cursor:"pointer",opacity:(dim&&s.id!=="all")?0.35:1,transition:"opacity .12s,background .12s",background:active?"#f8fafc":"transparent"}}
              onMouseEnter={e=>{if(!active&&!dim)e.currentTarget.style.background="#fafbfc";}}
              onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent";}}>
              <div style={{height:3,borderRadius:2,background:s.color,opacity:active?1:0.85,marginBottom:8,marginLeft:-9,marginRight:-9,width:s.id==="all"?80:s.id==="completed"?93:s.id==="ending"?96:115}}></div>
              <div style={{display:"flex",alignItems:"center",gap:5,font:"400 12px/16px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#333",whiteSpace:"nowrap"}}>
                {s.icon&&<img src={s.icon} alt="" style={{width:14,height:14,objectFit:"contain",flexShrink:0}} />}
                {s.label}
              </div>
              <div style={{font:"600 18px/22px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#0f172a",marginTop:4}}>{scdmPad(byId[s.id]||0)}</div>
              {activeStatus&&activeStatus!=="all"&&s.id==="all"&&(
                <button type="button" onClick={e=>{e.stopPropagation();onPick(null);}} style={{marginTop:4,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}>
                  <span style={{fontSize:11}}>↻</span>Reset
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SCDM_COLS = [
  { key:"name",             label:"Patient Name",       grid:"minmax(130px,1.4fr)", sortable:true },
  { key:"mrn",              label:"MRN",                grid:"minmax(120px,1.2fr)", sortable:true },
  { key:"episodeId",        label:"Episode ID",         grid:"minmax(90px,0.9fr)",  sortable:true },
  { key:"branchId",         label:"Branch",             grid:"minmax(70px,0.7fr)",  sortable:true },
  { key:"workerID",         label:"Worker ID",          grid:"minmax(80px,0.8fr)",  sortable:true },
  { key:"workerName",       label:"Worker Name",        grid:"minmax(120px,1.2fr)", sortable:true },
  { key:"serviceCodeType",  label:"Service Code Type",  grid:"minmax(100px,1.0fr)", sortable:true },
  { key:"serviceCode",      label:"Service Code",       grid:"minmax(90px,0.9fr)",  sortable:true },
  { key:"timeZone",         label:"Time Zone",          grid:"minmax(70px,0.7fr)",  sortable:true },
  { key:"scheduleInitDate", label:"Schedule Init Date", grid:"minmax(140px,1.4fr)", sortable:true },
  { key:"currentVisitTime", label:"Current Visit Time", grid:"minmax(180px,1.8fr)", sortable:true },
  { key:"updatedVisitTime", label:"Updated Visit Time", grid:"minmax(180px,1.8fr)", sortable:true },
  { key:"ehrSync",          label:"EHR Sync",           grid:"72px", sortable:false, align:"center" },
  { key:"at",               label:"AT Status",          grid:"72px", sortable:false, align:"center" },
  { key:"reviewed",         label:"Reviewed",           grid:"78px", sortable:false, align:"center" },
];
const SCDM_GRID = SCDM_COLS.map(c=>c.grid).join(" ");

function SCDMSortArrows({ active, dir }) {
  const up   = active&&dir==="asc"  ? "#2563eb" : "rgba(0,0,0,0.25)";
  const down = active&&dir==="desc" ? "#2563eb" : "rgba(0,0,0,0.25)";
  return (
    <svg width="10" height="15" viewBox="0 0 9 14" fill="none" style={{marginRight:3,flex:"none"}}>
      <path d="M7.74699 7.40234H1.25301C1.05823 7.40234 0.949473 7.608 1.0701 7.7484L4.31708 11.5135C4.41003 11.6213 4.58899 11.6213 4.68291 11.5135L7.9299 7.7484C8.05053 7.608 7.94177 7.40234 7.74699 7.40234Z" fill={down}/>
      <path d="M7.9299 6.24825L4.68291 2.48317C4.58997 2.3754 4.41101 2.3754 4.31708 2.48317L1.0701 6.24825C0.949473 6.38865 1.05823 6.59431 1.25301 6.59431H7.74699C7.94177 6.59431 8.05053 6.38865 7.9299 6.24825Z" fill={up}/>
    </svg>
  );
}

function SCDMATIcon({at}){
  const res=(typeof window!=="undefined"&&window.__resources)||{};
  if(at==="thumb")     return <img src={res.atCompleted||"icons/at-completed.png"} alt="Completed" style={{width:18,height:18,objectFit:"contain"}} />;
  if(at==="warning")   return <img src={res.atNeedsAttention||"icons/at-needs-attention.png"} alt="Needs Attention" style={{width:18,height:18,objectFit:"contain"}} />;
  if(at==="hourglass") return <img src={res.atInProgress||"icons/at-in-progress.png"} alt="In Progress" style={{width:18,height:18,objectFit:"contain"}} />;
  return <span style={{color:"#cbd5e1"}}>—</span>;
}

function EHRSyncIcon({synced}){
  if(synced) return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

function SCDMTableHeader({ sortKey, sortDir, onSort }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:SCDM_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",gap:8}}>
      {SCDM_COLS.map(c=>(
        <div key={c.key} onClick={c.sortable?()=>onSort(c.key):undefined}
          style={{font:"500 11px/14px Roboto",color:"#64748b",textAlign:c.align||"left",display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",cursor:c.sortable?"pointer":"default",userSelect:"none",overflow:"hidden",whiteSpace:"nowrap"}}>
          {c.sortable&&<SCDMSortArrows active={sortKey===c.key} dir={sortDir} />}
          {c.label}
        </div>
      ))}
    </div>
  );
}

function SCDMTableRow({ row, reviewed, onReviewed, onNameClick, accent="#2563eb" }) {
  const cell = (align) => ({font:"500 12px/16px Roboto",color:"#333",textAlign:align||"left",display:"flex",alignItems:"center",justifyContent:align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0});
  return (
    <div style={{marginBottom:8}}>
      <div
        style={{display:"grid",gridTemplateColumns:SCDM_GRID,alignItems:"center",background:"#fff",border:"1px solid #e2e8f0",borderRadius:6,minHeight:48,padding:"8px 12px",gap:8,cursor:"default",transition:"box-shadow .12s"}}
        onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 6px rgba(0,0,0,0.08)"}
        onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
        <div style={cell()}>
          <span onClick={onNameClick} style={{color:accent,cursor:"pointer",textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis",minWidth:0}}
            onMouseEnter={e=>e.currentTarget.style.textDecoration="underline"}
            onMouseLeave={e=>e.currentTarget.style.textDecoration="none"}>
            {row.name}
          </span>
        </div>
        <div style={cell()}>{row.mrn}</div>
        <div style={cell()}>{row.episodeId}</div>
        <div style={cell()}>{row.branchId}</div>
        <div style={cell()}>{row.workerID}</div>
        <div style={cell()}>{row.workerName}</div>
        <div style={cell()}>{row.serviceCodeType}</div>
        <div style={cell()}>{row.serviceCode}</div>
        <div style={cell()}>{row.timeZone}</div>
        <div style={cell()}>{row.scheduleInitDate}</div>
        <div style={cell()}>{row.currentVisitTime}</div>
        <div style={cell()}>{row.updatedVisitTime}</div>
        <div style={cell("center")}><EHRSyncIcon synced={row.ehrSync} /></div>
        <div style={cell("center")} title={row.atReason||""}><SCDMATIcon at={row.atStatus} /></div>
        <div style={cell("center")}>
          <input type="checkbox" checked={reviewed} onChange={e=>onReviewed(row.id,e.target.checked)} style={{width:16,height:16,cursor:"pointer",accentColor:accent}} />
        </div>
      </div>
    </div>
  );
}

function SCDMTable({ rows, reviewedSet, onReviewed, sortKey, sortDir, onSort, onNameClick }) {
  return (
    <div>
      <SCDMTableHeader sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
      <div style={{padding:"12px 12px 0"}}>
        {rows.map(r=>(
          <SCDMTableRow key={r.id} row={r} reviewed={reviewedSet.has(r.id)} onReviewed={onReviewed} onNameClick={()=>onNameClick(r)} />
        ))}
      </div>
    </div>
  );
}

function SCDMPagination({ page, totalPages, onPage }) {
  const b = (dis) => ({background:"#fff",border:"1px solid #d8d8d8",borderRadius:4,padding:"5px 12px",font:"500 12px/16px Roboto",color:dis?"#cbd5e1":"#0f172a",cursor:dis?"default":"pointer"});
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px",borderTop:"1px solid #e2e8f0",background:"#fff"}}>
      <div style={{font:"400 12px/16px Roboto",color:"#64748b"}}>Page {page} of {totalPages}</div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <button onClick={()=>onPage(page-1)} disabled={page===1} style={b(page===1)}>Prev</button>
        <button onClick={()=>onPage(page+1)} disabled={page===totalPages} style={b(page===totalPages)}>Next</button>
      </div>
    </div>
  );
}

function ScheduleChangesView({ review }) {
  const [search, setSearch] = useSCDM("");
  const [statusFilter, setStatusFilter] = useSCDM(null);
  const [sortKey, setSortKey] = useSCDM("name");
  const [sortDir, setSortDir] = useSCDM("asc");
  const [page, setPage] = useSCDM(1);
  const [reviewedSet, setReviewedSet] = useSCDM(new Set());

  const handleSort = (key) => {
    if(sortKey===key) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  let filtered = SCHEDULE_CHANGES_ROWS;
  if(search) filtered = filtered.filter(r=>r.name.toLowerCase().includes(search.toLowerCase()) || r.mrn.includes(search) || r.episodeId.toLowerCase().includes(search.toLowerCase()));
  if(statusFilter) filtered = filtered.filter(r=>r.atStatus===(statusFilter==="completed"?"thumb":statusFilter==="ending"?"hourglass":"warning"));
  if(review) filtered = filtered.filter(r=>r.atStatus==="warning"&&!reviewedSet.has(r.id));

  const toKey = (k, v) => {
    if(k==="scheduleInitDate"){ const m=v.match(/(\d\d)\/(\d\d)\/(\d{4}) (\d\d):(\d\d) (AM|PM)/); return +new Date(+m[3],+m[1]-1,+m[2],(+m[4]%12)+(m[6]==="PM"?12:0),+m[5]); }
    return typeof v==="string" ? v.toLowerCase() : v;
  };
  filtered = [...filtered].sort((a,b)=>{
    const A=toKey(sortKey,a[sortKey]), B=toKey(sortKey,b[sortKey]);
    return A<B ? (sortDir==="asc"?-1:1) : A>B ? (sortDir==="asc"?1:-1) : 0;
  });

  const perPage=10, totalPages=Math.ceil(filtered.length/perPage), startIdx=(page-1)*perPage;
  const paged = filtered.slice(startIdx,startIdx+perPage);
  useSCDME(()=>{ if(page>totalPages&&totalPages>0) setPage(totalPages); },[page,totalPages]);

  const handleReviewed = (id,checked) => setReviewedSet(prev=>{ const next=new Set(prev); if(checked) next.add(id); else next.delete(id); return next; });
  const handleNameClick = (row) => { if(typeof window!=="undefined" && window.navigateTo) window.navigateTo("patients", 0, { patientId: row.episodeId }); };

  return (
    <div style={{background:"#f5f7fa",minHeight:"calc(100vh - 72px)"}}>
      <SCDMFilterBar search={search} onSearch={setSearch} reviewActive={review} />
      <div style={{padding:"24px 24px 0"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,flexWrap:"wrap"}}>
          <SCDMTitleCluster />
          <SCDMStatusStrip allRows={SCHEDULE_CHANGES_ROWS} activeStatus={statusFilter} onPick={setStatusFilter} />
        </div>
      </div>
      <div style={{marginTop:24,background:"#fff",borderTop:"1px solid #e2e8f0"}}>
        <SCDMTable rows={paged} reviewedSet={reviewedSet} onReviewed={handleReviewed} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} onNameClick={handleNameClick} />
        <SCDMPagination page={page} totalPages={totalPages} onPage={setPage} />
      </div>
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { ScheduleChangesView });
