// CDM Schedule Changes View — mirrors CDM Request View layout exactly.
const { useState: useSCDM, useEffect: useSCDME, useRef: useSCDMR } = React;

// ── Mock data ─────────────────────────────────────────────────
const SCHEDULE_CHANGES_ROWS = [
  { id:"sc1",  branchId:"BC001", name:"Marvin Mckinney",    mrn:"B6100062245601", episodeId:"Epi23456", workerID:"W-4521", workerName:"Sarah Mitchell", serviceCodeType:"PC", serviceCode:"G0156", timeZone:"EST", currentVisitTime:"11/26/2026 09:00 AM - 10:00 AM", updatedVisitTime:"11/28/2026 09:30 AM - 10:30 AM", ehrSync:true,  atStatus:"thumb",    atReason:"", reviewed:false },
  { id:"sc2",  branchId:"BC001", name:"Esther Howard",      mrn:"B6789012345678", episodeId:"I1J2K3L4", workerID:"W-4789", workerName:"James Thornton", serviceCodeType:"Attend", serviceCode:"T1019", timeZone:"EST", currentVisitTime:"11/27/2026 02:00 PM - 03:00 PM", updatedVisitTime:"11/29/2026 01:00 PM - 02:00 PM", ehrSync:false, atStatus:"warning",  atReason:"Schedule conflict detected", reviewed:false },
  { id:"sc3",  branchId:"BC002", name:"Cameron Williamson", mrn:"B6100054445634", episodeId:"TY964257", workerID:"W-5012", workerName:"Linda Patel", serviceCodeType:"PC", serviceCode:"G0156", timeZone:"CST", currentVisitTime:"11/28/2026 10:00 AM - 11:30 AM", updatedVisitTime:"11/30/2026 11:00 AM - 12:30 PM", ehrSync:true,  atStatus:"thumb",    atReason:"", reviewed:true },
  { id:"sc4",  branchId:"BC001", name:"Leslie Alexander",   mrn:"B6789012345697", episodeId:"K7L8M9N0", workerID:"W-4523", workerName:"Robert Chen", serviceCodeType:"Attend", serviceCode:"S5126", timeZone:"EST", currentVisitTime:"11/26/2026 08:00 AM - 09:00 AM", updatedVisitTime:"11/28/2026 08:30 AM - 09:30 AM", ehrSync:false, atStatus:"warning",  atReason:"Worker unavailable at updated time", reviewed:false },
  { id:"sc5",  branchId:"BC003", name:"Robert Fox",         mrn:"V6789012345686", episodeId:"G3H4I5J6", workerID:"W-5201", workerName:"Maria Gonzalez", serviceCodeType:"PC", serviceCode:"G0156", timeZone:"PST", currentVisitTime:"11/27/2026 03:00 PM - 04:00 PM", updatedVisitTime:"11/29/2026 04:00 PM - 05:00 PM", ehrSync:true,  atStatus:"hourglass", atReason:"", reviewed:false },
  { id:"sc6",  branchId:"BC001", name:"Jenny Wilson",       mrn:"B6789012345711", episodeId:"M5N6O7P8", workerID:"W-4876", workerName:"David Kim", serviceCodeType:"Attend", serviceCode:"T1019", timeZone:"EST", currentVisitTime:"11/26/2026 01:00 PM - 02:00 PM", updatedVisitTime:"11/27/2026 02:00 PM - 03:00 PM", ehrSync:true,  atStatus:"thumb",    atReason:"", reviewed:true },
  { id:"sc7",  branchId:"BC002", name:"Jacob Jones",        mrn:"B6789012345716", episodeId:"Y7Z8A9B0", workerID:"W-5103", workerName:"Angela Foster", serviceCodeType:"PC", serviceCode:"G0156", timeZone:"MST", currentVisitTime:"11/28/2026 11:00 AM - 12:00 PM", updatedVisitTime:"11/30/2026 10:00 AM - 11:00 AM", ehrSync:false, atStatus:"warning",  atReason:"Patient not available", reviewed:false },
  { id:"sc8",  branchId:"BC001", name:"Guy Hawkins",        mrn:"L700093345918",  episodeId:"A3B4C5D6", workerID:"W-4654", workerName:"Thomas Reed", serviceCodeType:"Attend", serviceCode:"S5126", timeZone:"EST", currentVisitTime:"11/27/2026 09:00 AM - 10:00 AM", updatedVisitTime:"11/29/2026 09:00 AM - 10:00 AM", ehrSync:true,  atStatus:"hourglass", atReason:"", reviewed:false },
  { id:"sc9",  branchId:"BC003", name:"Jane Cooper",        mrn:"B6789012345720", episodeId:"Q9R0S1T2", workerID:"W-5214", workerName:"Nancy Brooks", serviceCodeType:"PC", serviceCode:"G0156", timeZone:"PST", currentVisitTime:"11/26/2026 04:00 PM - 05:30 PM", updatedVisitTime:"11/28/2026 03:30 PM - 05:00 PM", ehrSync:false, atStatus:"warning",  atReason:"EHR sync failed", reviewed:false },
  { id:"sc10", branchId:"BC001", name:"Kristin Watson",     mrn:"B6789012345801", episodeId:"TY964258", workerID:"W-4789", workerName:"Kevin Walsh", serviceCodeType:"Attend", serviceCode:"T1019", timeZone:"EST", currentVisitTime:"11/27/2026 10:00 AM - 11:00 AM", updatedVisitTime:"11/29/2026 11:00 AM - 12:00 PM", ehrSync:true,  atStatus:"thumb",    atReason:"", reviewed:true },
  { id:"sc11", branchId:"BC002", name:"Cody Fisher",        mrn:"B6789012345802", episodeId:"K7L8M9N1", workerID:"W-5201", workerName:"Patricia Simmons", serviceCodeType:"PC", serviceCode:"G0156", timeZone:"CST", currentVisitTime:"11/28/2026 02:00 PM - 03:30 PM", updatedVisitTime:"11/30/2026 01:00 PM - 02:30 PM", ehrSync:true,  atStatus:"hourglass", atReason:"", reviewed:false },
  { id:"sc12", branchId:"BC001", name:"Kathryn Murphy",     mrn:"B6789012345803", episodeId:"G3H4I5J7", workerID:"W-4521", workerName:"Michael Torres", serviceCodeType:"Attend", serviceCode:"S5126", timeZone:"EST", currentVisitTime:"11/26/2026 11:00 AM - 12:00 PM", updatedVisitTime:"11/28/2026 10:30 AM - 11:30 AM", ehrSync:false, atStatus:"warning",  atReason:"Authorization required", reviewed:false },
  { id:"sc13", branchId:"BC003", name:"Devon Lane",         mrn:"B6789012345804", episodeId:"M5N6O7P9", workerID:"W-5103", workerName:"Sandra Hughes", serviceCodeType:"PC", serviceCode:"G0156", timeZone:"PST", currentVisitTime:"11/27/2026 08:00 AM - 09:30 AM", updatedVisitTime:"11/29/2026 08:00 AM - 09:30 AM", ehrSync:true,  atStatus:"thumb",    atReason:"", reviewed:true },
  { id:"sc14", branchId:"BC001", name:"Dianne Russell",     mrn:"B6789012345805", episodeId:"Y7Z8A9B1", workerID:"W-4876", workerName:"Christopher Lane", serviceCodeType:"Attend", serviceCode:"T1019", timeZone:"EST", currentVisitTime:"11/28/2026 03:00 PM - 04:00 PM", updatedVisitTime:"11/30/2026 02:00 PM - 03:00 PM", ehrSync:false, atStatus:"warning",  atReason:"Overlapping appointment", reviewed:false },
  { id:"sc15", branchId:"BC002", name:"Arlene McCoy",       mrn:"B6789012345806", episodeId:"S5T6U7V9", workerID:"W-5012", workerName:"Rebecca Flores", serviceCodeType:"PC", serviceCode:"G0156", timeZone:"MST", currentVisitTime:"11/26/2026 12:00 PM - 01:00 PM", updatedVisitTime:"11/27/2026 01:00 PM - 02:00 PM", ehrSync:true,  atStatus:"hourglass", atReason:"", reviewed:false },
  { id:"sc16", branchId:"BC001", name:"Theresa Webb",       mrn:"B6789012345901", episodeId:"Epi99001", workerID:"W-4654", workerName:"Daniel Morgan", serviceCodeType:"Attend", serviceCode:"S5126", timeZone:"EST", currentVisitTime:"11/27/2026 01:00 PM - 02:00 PM", updatedVisitTime:"11/29/2026 12:00 PM - 01:00 PM", ehrSync:true,  atStatus:"thumb",    atReason:"", reviewed:true },
  { id:"sc17", branchId:"BC003", name:"Darlene Robertson",  mrn:"B6789012345902", episodeId:"Epi99002", workerID:"W-5201", workerName:"Catherine Bell", serviceCodeType:"PC", serviceCode:"G0156", timeZone:"PST", currentVisitTime:"11/28/2026 09:00 AM - 10:30 AM", updatedVisitTime:"11/30/2026 09:30 AM - 11:00 AM", ehrSync:false, atStatus:"warning",  atReason:"Distance too far for visit", reviewed:false },
  { id:"sc18", branchId:"BC001", name:"Courtney Henry",     mrn:"B6789012345903", episodeId:"Epi99003", workerID:"W-4789", workerName:"Steven Murphy", serviceCodeType:"Attend", serviceCode:"T1019", timeZone:"EST", currentVisitTime:"11/26/2026 10:00 AM - 11:00 AM", updatedVisitTime:"11/28/2026 11:00 AM - 12:00 PM", ehrSync:true,  atStatus:"thumb",    atReason:"", reviewed:false },
  { id:"sc19", branchId:"BC002", name:"Ralph Edwards",      mrn:"B6789012345904", episodeId:"Epi99004", workerID:"W-5103", workerName:"Jennifer Cole", serviceCodeType:"PC", serviceCode:"G0156", timeZone:"CST", currentVisitTime:"11/27/2026 02:00 PM - 03:00 PM", updatedVisitTime:"11/29/2026 03:00 PM - 04:00 PM", ehrSync:true,  atStatus:"hourglass", atReason:"", reviewed:false },
  { id:"sc20", branchId:"BC001", name:"Annette Black",      mrn:"B6789012345905", episodeId:"Epi99005", workerID:"W-4521", workerName:"Andrew Price", serviceCodeType:"Attend", serviceCode:"S5126", timeZone:"EST", currentVisitTime:"11/28/2026 08:00 AM - 09:00 AM", updatedVisitTime:"11/30/2026 08:30 AM - 09:30 AM", ehrSync:false, atStatus:"warning",  atReason:"Insurance verification needed", reviewed:false },
  { id:"sc21", branchId:"BC003", name:"Floyd Miles",        mrn:"B6789012345906", episodeId:"Epi99006", workerID:"W-5214", workerName:"Elizabeth Turner", serviceCodeType:"PC", serviceCode:"G0156", timeZone:"PST", currentVisitTime:"11/26/2026 03:00 PM - 04:30 PM", updatedVisitTime:"11/28/2026 02:30 PM - 04:00 PM", ehrSync:true,  atStatus:"thumb",    atReason:"", reviewed:true },
  { id:"sc22", branchId:"BC001", name:"Jerome Bell",        mrn:"B6789012345907", episodeId:"Epi99007", workerID:"W-4876", workerName:"Matthew Hayes", serviceCodeType:"Attend", serviceCode:"T1019", timeZone:"EST", currentVisitTime:"11/27/2026 11:00 AM - 12:00 PM", updatedVisitTime:"11/29/2026 10:00 AM - 11:00 AM", ehrSync:true,  atStatus:"hourglass", atReason:"", reviewed:false },
  { id:"sc23", branchId:"BC002", name:"Bessie Cooper",      mrn:"B6789012345908", episodeId:"Epi99008", workerID:"W-5012", workerName:"Laura Anderson", serviceCodeType:"PC", serviceCode:"G0156", timeZone:"MST", currentVisitTime:"11/28/2026 01:00 PM - 02:00 PM", updatedVisitTime:"11/30/2026 12:00 PM - 01:00 PM", ehrSync:false, atStatus:"warning",  atReason:"Duplicate visit scheduled", reviewed:false },
  { id:"sc24", branchId:"BC001", name:"Eleanor Pena",       mrn:"B6789012345909", episodeId:"Epi99009", workerID:"W-4654", workerName:"Richard Scott", serviceCodeType:"Attend", serviceCode:"S5126", timeZone:"EST", currentVisitTime:"11/26/2026 02:00 PM - 03:00 PM", updatedVisitTime:"11/27/2026 03:00 PM - 04:00 PM", ehrSync:true,  atStatus:"thumb",    atReason:"", reviewed:true },
];

if (typeof window !== "undefined") window.SCHEDULE_CHANGES_ROWS = SCHEDULE_CHANGES_ROWS;

// ── Helpers ───────────────────────────────────────────────────
const scdmPad = n => String(n).padStart(2,"0");
function scdmCountsFor(rows) {
  return {
    all:       rows.length,
    completed: rows.filter(r=>r.atStatus==="thumb").length,
    ending:    rows.filter(r=>r.atStatus==="hourglass").length,
    late:      rows.filter(r=>r.atStatus==="warning").length,
    alerts:    rows.filter(r=>r.atStatus==="warning").length,
    at: {
      completed:  scdmPad(rows.filter(r=>r.atStatus==="thumb").length),
      needsAttn:  scdmPad(rows.filter(r=>r.atStatus==="warning").length),
      inProgress: scdmPad(rows.filter(r=>r.atStatus==="hourglass").length),
    },
  };
}

// ── Status config ─────────────────────────────────────────
const SCDM_STATUS_ITEMS = [
  { id:"all",       label:"All Changes",     color:"rgb(21,95,130)",   weight:1.2, icon:null },
  { id:"completed", label:"Completed",       color:"rgb(14,165,233)",  weight:1.0, get icon(){ return (window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png"; } },
  { id:"ending",    label:"In Progress",     color:"rgb(148,163,184)", weight:1.0, get icon(){ return (window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png"; } },
  { id:"late",      label:"Needs Attention", color:"rgb(245,158,11)",  weight:1.0, get icon(){ return (window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png"; } },
];

// ── Filter bar ─────────────────────────────────────────────────
function SCDMFilterBar({ search, onSearch, reviewActive }) {
  return (
    <div style={{background:"#eef4fb",borderBottom:"1px solid #e2e8f0",padding:"10px 24px",display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap"}}>
      <button type="button" style={{background:"#fff",border:"1px solid #d8d8d8",borderRadius:4,padding:"5px 12px",font:"400 12px/16px Roboto",color:"#0f172a",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,flexShrink:0,whiteSpace:"nowrap"}}>
        Updated Visit Date : 11/01/26 – 11/30/26<span style={{color:"#94a3b8",fontSize:9}}>▾</span>
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

// ── Title cluster ─────────────────────────────────────────────
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

// ── Status strip ────────────────────────────────────────
function SCDMStatusStrip({ allRows, activeStatus, onPick }) {
  const c = scdmCountsFor(allRows);
  const byId = {all:c.all,completed:c.completed,ending:c.ending,late:c.late};
  const visuallyActive = (id) => id !== "all" && activeStatus === id;
  return (
    <div style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",overflow:"hidden",width:"550px"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333",flexShrink:0}}>
        <span>Automation</span><span>Status</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-start",width:"526px",alignSelf:"auto",justifyContent:"flex-start",gap:0}}>
        {SCDM_STATUS_ITEMS.map(s=>{
          const active=visuallyActive(s.id);
          const dim=activeStatus&&activeStatus!=="all"&&!active;
          const count = scdmPad(byId[s.id]||0);
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
              <div style={{font:"600 18px/22px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#0f172a",marginTop:4}}>{count}</div>
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

// ── AT Status row ───────────────────────────────────────────────
const SCDM_AT = [
  { id:"completed",  label:"Completed",       key:"completed",  get icon(){ return (window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png"; } },
  { id:"warning",    label:"Needs Attention", key:"needsAttn",  get icon(){ return (window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png"; }, num:"#d97706", caret:false },
  { id:"inprogress", label:"In Progress",     key:"inProgress", get icon(){ return (window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png"; } },
];
function SCDMAutomationStatus({ counts, atFilter, onFilter }) {
  const at = counts.at;
  return (
    <div style={{display:"flex",alignItems:"center",font:"400 13px/16px Roboto",color:"#333",justifyContent:"flex-end"}}>
      <span style={{color:"#94a3b8",marginRight:12}}>Automation (AT) Status :</span>
      {SCDM_AT.map((s,i)=>{
        const active=atFilter===s.id;
        const dim=atFilter&&!active;
        return (
          <React.Fragment key={s.id}>
            {i>0&&<span style={{width:1,height:18,background:"transparent",margin:"0 4px"}}></span>}
            <button type="button" onClick={()=>onFilter(active?null:s.id)} style={{background:"transparent",border:"none",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,padding:"2px 6px",borderRadius:4,opacity:dim?0.4:1,transition:"opacity .12s"}}>
              <img src={s.icon} alt="" style={{width:18,height:18,objectFit:"contain"}} />
              <span style={{color:"#0f172a",fontSize:14}}>{s.label}</span>
              <span style={{fontWeight:600,color:s.num||"#0f172a"}}>{at[s.key]}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Table (CSS grid) ───────────────────────────────────────────
const SCDM_COLS = [
  { key:"name",             label:"Patient Name",           grid:"minmax(130px,1.4fr)", sortable:true  },
  { key:"mrn",              label:"MRN",                    grid:"minmax(120px,1.2fr)", sortable:true  },
  { key:"episodeId",        label:"Episode ID",             grid:"minmax(90px,0.9fr)",  sortable:true  },
  { key:"branchId",         label:"Branch",                 grid:"minmax(70px,0.7fr)",  sortable:true  },
  { key:"workerID",         label:"Worker ID",              grid:"minmax(80px,0.8fr)",  sortable:true  },
  { key:"workerName",       label:"Worker Name",            grid:"minmax(120px,1.2fr)", sortable:true  },
  { key:"serviceCodeType",  label:"Service Code Type",      grid:"minmax(100px,1.0fr)", sortable:true  },
  { key:"serviceCode",      label:"Service Code",           grid:"minmax(90px,0.9fr)",  sortable:true  },
  { key:"timeZone",         label:"Time Zone",              grid:"minmax(70px,0.7fr)",  sortable:true  },
  { key:"currentVisitTime", label:"Current Visit Time",     grid:"minmax(180px,1.8fr)", sortable:true  },
  { key:"updatedVisitTime", label:"Updated Visit Time",     grid:"minmax(180px,1.8fr)", sortable:true  },
  { key:"ehrSync",          label:"EHR Sync",               grid:"72px",                sortable:false, align:"center" },
  { key:"at",               label:"AT Status",              grid:"72px",                sortable:false, align:"center" },
  { key:"reviewed",         label:"Reviewed",               grid:"78px",                sortable:false, align:"center" },
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

const dash = <span style={{color:"#cbd5e1"}}>—</span>;

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
        <div style={cell()}>{row.currentVisitTime}</div>
        <div style={cell()}>{row.updatedVisitTime}</div>
        <div style={cell("center")}><EHRSyncIcon synced={row.ehrSync} /></div>
        <div style={cell("center")} title={row.atReason||""}>
          <SCDMATIcon at={row.atStatus} />
        </div>
        <div style={cell("center")}>
          <input type="checkbox" checked={reviewed} onChange={e=>onReviewed(row.id,e.target.checked)} style={{width:16,height:16,cursor:"pointer",accentColor:accent}} />
        </div>
      </div>
    </div>
  );
}

function SCDMTable({ rows, reviewMode, reviewedSet, onReviewed, sortKey, sortDir, onSort, onNameClick }) {
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

// ── Pagination ────────────────────────────────────────────────
function SCDMPagination({ page, totalPages, onPage }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px",borderTop:"1px solid #e2e8f0",background:"#fff"}}>
      <div style={{font:"400 12px/16px Roboto",color:"#64748b"}}>
        Page {page} of {totalPages}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <button onClick={()=>onPage(page-1)} disabled={page===1} style={{background:"#fff",border:"1px solid #d8d8d8",borderRadius:4,padding:"5px 12px",font:"500 12px/16px Roboto",color:page===1?"#cbd5e1":"#0f172a",cursor:page===1?"default":"pointer"}}>Prev</button>
        <button onClick={()=>onPage(page+1)} disabled={page===totalPages} style={{background:"#fff",border:"1px solid #d8d8d8",borderRadius:4,padding:"5px 12px",font:"500 12px/16px Roboto",color:page===totalPages?"#cbd5e1":"#0f172a",cursor:page===totalPages?"default":"pointer"}}>Next</button>
      </div>
    </div>
  );
}

// ── Main view component ───────────────────────────────────────
function ScheduleChangesView({ review }) {
  const [search, setSearch] = useSCDM("");
  const [statusFilter, setStatusFilter] = useSCDM(null);
  const [atFilter, setAtFilter] = useSCDM(null);
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
  if(atFilter) filtered = filtered.filter(r=>r.atStatus===(atFilter==="completed"?"thumb":atFilter==="inprogress"?"hourglass":"warning"));
  if(review) filtered = filtered.filter(r=>r.atStatus==="warning"&&!reviewedSet.has(r.id));

  filtered.sort((a,b)=>{
    let valA=a[sortKey],valB=b[sortKey];
    if(typeof valA==="string") valA=valA.toLowerCase();
    if(typeof valB==="string") valB=valB.toLowerCase();
    if(valA<valB) return sortDir==="asc"?-1:1;
    if(valA>valB) return sortDir==="asc"?1:-1;
    return 0;
  });

  const perPage=10, totalPages=Math.ceil(filtered.length/perPage), startIdx=(page-1)*perPage, endIdx=startIdx+perPage;
  const paged = filtered.slice(startIdx,endIdx);

  useSCDME(()=>{ if(page>totalPages&&totalPages>0) setPage(totalPages); },[page,totalPages]);

  const counts = scdmCountsFor(SCHEDULE_CHANGES_ROWS);

  const handleReviewed = (id,checked) => {
    setReviewedSet(prev=>{
      const next=new Set(prev);
      if(checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  const handleNameClick = (row) => {
    // Navigate to Patient Summary View
    if(typeof window!=="undefined" && window.navigateTo) {
      window.navigateTo("patients", 0, { patientId: row.episodeId });
    }
  };

  return (
    <div style={{background:"#f5f7fa",minHeight:"calc(100vh - 72px)"}}>
      <SCDMFilterBar search={search} onSearch={setSearch} reviewActive={review} />
      <div style={{padding:"24px 24px 0"}}>
        <SCDMTitleCluster />
        <div style={{marginTop:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <SCDMStatusStrip allRows={SCHEDULE_CHANGES_ROWS} activeStatus={statusFilter} onPick={setStatusFilter} />
          <SCDMAutomationStatus counts={counts} atFilter={atFilter} onFilter={setAtFilter} />
        </div>
      </div>
      <div style={{marginTop:24,background:"#fff",borderTop:"1px solid #e2e8f0"}}>
        <SCDMTable rows={paged} reviewMode={review} reviewedSet={reviewedSet} onReviewed={handleReviewed} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} onNameClick={handleNameClick} />
        <SCDMPagination page={page} totalPages={totalPages} onPage={setPage} />
      </div>
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { ScheduleChangesView });
