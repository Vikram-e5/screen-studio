// CDM Request View — mirrors Eligibility Request View layout exactly.
const { useState: useCDM, useEffect: useCDME, useRef: useCDMR } = React;

// ── Mock data ─────────────────────────────────────────────────
const CDM_ROWS = [
  { id:"c1",  branchId:"BC001", name:"Marvin Mckinney",    mrn:"B6100062245601", episodeId:"Epi23456", docs:true, workerName:"Sarah Mitchell", eligPcHours:"64.0", eligAttendHours:"56.0", pcAuthHours:"8.5", attendAuthHours:"7.0", cdmInitTime:"04/15/25 09:15 AM", currentStage:"Stage 3", currentStatus:"Completed",  reasonFailTerm:"",                                 txnArrived:"04/15/25", txnEnd:"04/16/25", terminatedOn:"",         elapsed:"",        edm:"completed", at:"thumb"    },
  { id:"c2",  branchId:"BC001", name:"Esther Howard",      mrn:"B6789012345678", episodeId:"I1J2K3L4", docs:false, workerName:"James Thornton", eligPcHours:"48.0", eligAttendHours:"48.0", pcAuthHours:"4.0", attendAuthHours:"4.0", cdmInitTime:"04/16/25 10:30 AM", currentStage:"Stage 1", currentStatus:"Active",      reasonFailTerm:"",                                 txnArrived:"04/16/25", txnEnd:"",         terminatedOn:"",         elapsed:"3h 12m",  edm:"ending",    at:"hourglass" },
  { id:"c3",  branchId:"BC002", name:"Cameron Williamson", mrn:"B6100054445634", episodeId:"TY964257", docs:true, workerName:"Linda Patel", eligPcHours:"80.0", eligAttendHours:"72.0", pcAuthHours:"12.0", attendAuthHours:"10.5", cdmInitTime:"04/19/25 08:45 AM", currentStage:"Stage 2", currentStatus:"Completed",  reasonFailTerm:"",                                 txnArrived:"04/19/25", txnEnd:"04/20/25", terminatedOn:"",         elapsed:"",        edm:"completed", at:"thumb"    },
  { id:"c4",  branchId:"BC001", name:"Leslie Alexander",   mrn:"B6789012345697", episodeId:"K7L8M9N0", docs:true, workerName:"Robert Chen", eligPcHours:"56.0", eligAttendHours:"48.0", pcAuthHours:"6.0", attendAuthHours:"5.0", cdmInitTime:"04/22/25 11:00 AM", currentStage:"Stage 2", currentStatus:"Failed",      reasonFailTerm:"Unable to load the payor portal",  txnArrived:"04/22/25", txnEnd:"04/22/25", terminatedOn:"",         elapsed:"",        edm:"late",      at:"warning"  },
  { id:"c5",  branchId:"BC003", name:"Robert Fox",         mrn:"V6789012345686", episodeId:"G3H4I5J6", docs:false, workerName:"Maria Gonzalez", eligPcHours:"72.0", eligAttendHours:"64.0", pcAuthHours:"9.5", attendAuthHours:"8.0", cdmInitTime:"04/18/25 02:15 PM", currentStage:"Stage 3", currentStatus:"Terminated", reasonFailTerm:"Coverage terminated at payor",     txnArrived:"04/18/25", txnEnd:"04/19/25", terminatedOn:"04/19/25", elapsed:"",        edm:"late",      at:"warning"  },
  { id:"c6",  branchId:"BC001", name:"Jenny Wilson",       mrn:"B6789012345711", episodeId:"M5N6O7P8", docs:true, workerName:"David Kim", eligPcHours:"40.0", eligAttendHours:"40.0", pcAuthHours:"3.5", attendAuthHours:"3.5", cdmInitTime:"04/24/25 09:00 AM", currentStage:"Stage 1", currentStatus:"Active",      reasonFailTerm:"",                                 txnArrived:"04/24/25", txnEnd:"",         terminatedOn:"",         elapsed:"1d 4h",   edm:"ending",    at:"thumb"    },
  { id:"c7",  branchId:"BC002", name:"Jacob Jones",        mrn:"B6789012345716", episodeId:"Y7Z8A9B0", docs:false, workerName:"Angela Foster", eligPcHours:"96.0", eligAttendHours:"88.0", pcAuthHours:"16.0", attendAuthHours:"14.0", cdmInitTime:"04/21/25 01:30 PM", currentStage:"Stage 3", currentStatus:"Completed",  reasonFailTerm:"",                                 txnArrived:"04/21/25", txnEnd:"04/22/25", terminatedOn:"",         elapsed:"",        edm:"completed", at:"thumb"    },
  { id:"c8",  branchId:"BC001", name:"Guy Hawkins",        mrn:"L700093345918",  episodeId:"A3B4C5D6", docs:true, workerName:"Thomas Reed", eligPcHours:"52.0", eligAttendHours:"48.0", pcAuthHours:"5.0", attendAuthHours:"4.5", cdmInitTime:"04/23/25 10:45 AM", currentStage:"Stage 2", currentStatus:"Active",      reasonFailTerm:"",                                 txnArrived:"04/23/25", txnEnd:"",         terminatedOn:"",         elapsed:"2h 48m",  edm:"ending",    at:"hourglass" },
  { id:"c9",  branchId:"BC003", name:"Jane Cooper",        mrn:"B6789012345720", episodeId:"Q9R0S1T2", docs:true, workerName:"Nancy Brooks", eligPcHours:"60.0", eligAttendHours:"56.0", pcAuthHours:"7.0", attendAuthHours:"6.0", cdmInitTime:"04/20/25 03:00 PM", currentStage:"Stage 1", currentStatus:"Failed",      reasonFailTerm:"Session timed out during check",   txnArrived:"04/20/25", txnEnd:"04/20/25", terminatedOn:"",         elapsed:"",        edm:"late",      at:"warning"  },
  { id:"c10", branchId:"BC001", name:"Kristin Watson",     mrn:"B6789012345801", episodeId:"TY964258", docs:false, workerName:"Kevin Walsh", eligPcHours:"76.0", eligAttendHours:"68.0", pcAuthHours:"11.0", attendAuthHours:"10.0", cdmInitTime:"04/25/25 08:00 AM", currentStage:"Stage 2", currentStatus:"Completed",  reasonFailTerm:"",                                 txnArrived:"04/25/25", txnEnd:"04/26/25", terminatedOn:"",         elapsed:"",        edm:"completed", at:"thumb"    },
  { id:"c11", branchId:"BC002", name:"Cody Fisher",        mrn:"B6789012345802", episodeId:"K7L8M9N1", docs:true, workerName:"Patricia Simmons", eligPcHours:"64.0", eligAttendHours:"60.0", pcAuthHours:"8.0", attendAuthHours:"7.5", cdmInitTime:"04/26/25 11:30 AM", currentStage:"Stage 3", currentStatus:"Terminated", reasonFailTerm:"Member ID mismatch",               txnArrived:"04/26/25", txnEnd:"04/27/25", terminatedOn:"04/27/25", elapsed:"",        edm:"late",      at:"warning"  },
  { id:"c12", branchId:"BC001", name:"Kathryn Murphy",     mrn:"B6789012345803", episodeId:"G3H4I5J7", docs:false, workerName:"Michael Torres", eligPcHours:"44.0", eligAttendHours:"40.0", pcAuthHours:"4.5", attendAuthHours:"4.0", cdmInitTime:"04/27/25 09:30 AM", currentStage:"Stage 1", currentStatus:"Active",      reasonFailTerm:"",                                 txnArrived:"04/27/25", txnEnd:"",         terminatedOn:"",         elapsed:"5h 20m",  edm:"ending",    at:"thumb"    },
  { id:"c13", branchId:"BC003", name:"Devon Lane",         mrn:"B6789012345804", episodeId:"M5N6O7P9", docs:true, workerName:"Sandra Hughes", eligPcHours:"88.0", eligAttendHours:"80.0", pcAuthHours:"13.5", attendAuthHours:"12.0", cdmInitTime:"04/28/25 07:45 AM", currentStage:"Stage 2", currentStatus:"Completed",  reasonFailTerm:"",                                 txnArrived:"04/28/25", txnEnd:"04/29/25", terminatedOn:"",         elapsed:"",        edm:"completed", at:"thumb"    },
  { id:"c14", branchId:"BC001", name:"Dianne Russell",     mrn:"B6789012345805", episodeId:"Y7Z8A9B1", docs:true, workerName:"Christopher Lane", eligPcHours:"56.0", eligAttendHours:"52.0", pcAuthHours:"6.5", attendAuthHours:"5.5", cdmInitTime:"04/29/25 12:00 PM", currentStage:"Stage 3", currentStatus:"Failed",      reasonFailTerm:"Availity error preventing submit",  txnArrived:"04/29/25", txnEnd:"04/29/25", terminatedOn:"",         elapsed:"",        edm:"late",      at:"warning"  },
  { id:"c15", branchId:"BC002", name:"Arlene McCoy",       mrn:"B6789012345806", episodeId:"S5T6U7V9", docs:false, workerName:"Rebecca Flores", eligPcHours:"36.0", eligAttendHours:"36.0", pcAuthHours:"3.0", attendAuthHours:"3.0", cdmInitTime:"04/30/25 10:00 AM", currentStage:"Stage 1", currentStatus:"Active",      reasonFailTerm:"",                                 txnArrived:"04/30/25", txnEnd:"",         terminatedOn:"",         elapsed:"8h 05m",  edm:"ending",    at:"hourglass" },
  { id:"c16", branchId:"BC001", name:"Theresa Webb",       mrn:"B6789012345901", episodeId:"Epi99001", docs:true, workerName:"Daniel Morgan", eligPcHours:"68.0", eligAttendHours:"64.0", pcAuthHours:"9.0", attendAuthHours:"8.5", cdmInitTime:"04/02/25 08:30 AM", currentStage:"Stage 2", currentStatus:"Completed",  reasonFailTerm:"",                                 txnArrived:"04/02/25", txnEnd:"04/03/25", terminatedOn:"",         elapsed:"",        edm:"completed", at:"thumb"    },
  { id:"c17", branchId:"BC003", name:"Darlene Robertson",  mrn:"B6789012345902", episodeId:"Epi99002", docs:true, workerName:"Catherine Bell", eligPcHours:"52.0", eligAttendHours:"44.0", pcAuthHours:"5.5", attendAuthHours:"4.5", cdmInitTime:"04/03/25 02:00 PM", currentStage:"Stage 1", currentStatus:"Terminated", reasonFailTerm:"SOC or SOE field has blank value",  txnArrived:"04/03/25", txnEnd:"04/04/25", terminatedOn:"04/04/25", elapsed:"",        edm:"late",      at:"warning"  },
  { id:"c18", branchId:"BC001", name:"Courtney Henry",     mrn:"B6789012345903", episodeId:"Epi99003", docs:false, workerName:"Steven Murphy", eligPcHours:"92.0", eligAttendHours:"84.0", pcAuthHours:"14.0", attendAuthHours:"13.0", cdmInitTime:"04/06/25 09:15 AM", currentStage:"Stage 3", currentStatus:"Completed",  reasonFailTerm:"",                                 txnArrived:"04/06/25", txnEnd:"04/07/25", terminatedOn:"",         elapsed:"",        edm:"completed", at:"thumb"    },
  { id:"c19", branchId:"BC002", name:"Ralph Edwards",      mrn:"B6789012345904", episodeId:"Epi99004", docs:false, workerName:"Jennifer Cole", eligPcHours:"40.0", eligAttendHours:"40.0", pcAuthHours:"4.0", attendAuthHours:"4.0", cdmInitTime:"04/08/25 11:45 AM", currentStage:"Stage 2", currentStatus:"Active",      reasonFailTerm:"",                                 txnArrived:"04/08/25", txnEnd:"",         terminatedOn:"",         elapsed:"12h 30m", edm:"ending",    at:"thumb"    },
  { id:"c20", branchId:"BC001", name:"Annette Black",      mrn:"B6789012345905", episodeId:"Epi99005", docs:true, workerName:"Andrew Price", eligPcHours:"60.0", eligAttendHours:"52.0", pcAuthHours:"7.5", attendAuthHours:"6.0", cdmInitTime:"04/09/25 01:00 PM", currentStage:"Stage 1", currentStatus:"Failed",      reasonFailTerm:"Invalid billing code identified",   txnArrived:"04/09/25", txnEnd:"04/09/25", terminatedOn:"",         elapsed:"",        edm:"late",      at:"warning"  },
];
// Payor assignment context (primary payor + secondary payor source)
const CDM_PRIMARY_PAYORS = ["Medicaid MLTC","Medicare Advantage","Medicaid FFS","Commercial HMO"];
const CDM_SECONDARY_SOURCES = ["Fidelis Care","Healthfirst","VNS Health","United Healthcare","Elderplan"];
CDM_ROWS.forEach((r,i)=>{
  r.primaryPayor = CDM_PRIMARY_PAYORS[i % CDM_PRIMARY_PAYORS.length];
  r.secondaryPayorSource = CDM_SECONDARY_SOURCES[i % CDM_SECONDARY_SOURCES.length];
});

if (typeof window !== "undefined") window.CDM_ROWS = CDM_ROWS;

// ── Helpers ───────────────────────────────────────────────────
const cdmPad = n => String(n).padStart(2,"0");
function cdmCountsFor(rows) {
  return {
    all:       rows.length,
    completed: rows.filter(r=>r.at==="thumb").length,
    ending:    rows.filter(r=>r.at==="hourglass").length,
    late:      rows.filter(r=>r.at==="warning").length,
    alerts:    rows.filter(r=>r.at==="warning").length,
    at: {
      completed:  cdmPad(rows.filter(r=>r.at==="thumb").length),
      needsAttn:  cdmPad(rows.filter(r=>r.at==="warning").length),
      inProgress: cdmPad(rows.filter(r=>r.at==="hourglass").length),
    },
  };
}

// ── EDM status config ─────────────────────────────────────────
const CDM_STATUS_ITEMS = [
  { id:"all",       label:"All Patients",    color:"rgb(21,95,130)",   weight:1.2, icon:null },
  { id:"completed", label:"Completed",       color:"rgb(14,165,233)",  weight:1.0, get icon(){ return (window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png"; } },
  { id:"ending",    label:"In Progress",     color:"rgb(148,163,184)", weight:1.0, get icon(){ return (window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png"; } },
  { id:"late",      label:"Needs Attention", color:"rgb(245,158,11)",  weight:1.0, get icon(){ return (window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png"; } },
];

// ── Filter bar (mirrors ERVFilterBar) ─────────────────────────
function CDMFilterBar({ search, onSearch, reviewActive }) {
  return (
    <div style={{background:"#eef4fb",borderBottom:"1px solid #e2e8f0",padding:"10px 24px",display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap"}}>
      <button type="button" style={{background:"#fff",border:"1px solid #d8d8d8",borderRadius:4,padding:"5px 12px",font:"400 12px/16px Roboto",color:"#0f172a",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,flexShrink:0,whiteSpace:"nowrap"}}>
        CDM Initiated Date : 04/01/25 – 04/30/25<span style={{color:"#94a3b8",fontSize:9}}>▾</span>
      </button>
      <button type="button" style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:6,padding:"5px 4px",whiteSpace:"nowrap"}}>
        <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:"#2563eb",color:"#fff",fontSize:10,fontWeight:600,lineHeight:1}}>+</span>
        Add More Filters
      </button>
      {reviewActive && (
        <span style={{display:"inline-flex",alignItems:"center",gap:10,background:"#f4f6f9",border:"1px solid #d8dee6",borderRadius:6,padding:"6px 10px",font:"400 12px/16px Roboto",color:"#334155",whiteSpace:"nowrap",flexShrink:0}}>
          AT Status: Needs Attention &nbsp;&bull;&nbsp; Reviewed: Not Reviewed
        </span>
      )}
      <div style={{flex:1}}></div>
      <div style={{position:"relative",flexShrink:0}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" value={search} onChange={e=>onSearch(e.target.value)} placeholder="Search Patient Records" style={{width:240,background:"#fff",border:"1px solid #93c5e8",borderRadius:6,padding:"6px 12px 6px 30px",font:"400 12px/16px Roboto",color:"#0f172a",outline:"none"}} />
      </div>
    </div>
  );
}

// ── Title cluster (left, mirrors ERVTitleCluster) ─────────────
const CDM_MODE_OPTIONS = [
  { id:"all",       label:"All CDM Requests" },
  { id:"manual",    label:"All Non-Automated Requests" },
  { id:"automated", label:"All Automated Requests" },
];
function CDMTitleCluster({ modeFilter, onModeFilter }) {
  const [open, setOpen] = useCDM(false);
  const ref = useCDMR(null);
  useCDME(()=>{ if(!open) return; const h=e=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[open]);
  const activeMode = CDM_MODE_OPTIONS.find(o=>o.id===modeFilter)||CDM_MODE_OPTIONS[0];
  return (
    <div>
      <div style={{display:"flex",alignItems:"baseline",gap:6,flexWrap:"wrap",position:"relative"}} ref={ref}>
        <span style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>CDM Request View</span>
      </div>
      <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Status Summary of CDM Requests</div>
      <div style={{marginTop:10,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block"}}>Click Patient Name to view related transactions for specific CDM request</div>
    </div>
  );
}

// ── EDM Status strip ────────────────────────────────────────
function CDMStatusStrip({ allRows, activeStatus, onPick }) {
  const c = cdmCountsFor(allRows);
  const byId = {all:c.all,completed:c.completed,ending:c.ending,late:c.late};
  // "all" never shows as visually selected — it just resets the filter
  const visuallyActive = (id) => id !== "all" && activeStatus === id;
  return (
    <div style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",overflow:"hidden",width:"550px"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333",flexShrink:0}}>
        <span>Automation</span><span>Status</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-start",width:"526px",alignSelf:"auto",justifyContent:"flex-start",gap:0}}>
        {CDM_STATUS_ITEMS.map(s=>{
          const active=visuallyActive(s.id);
          const dim=activeStatus&&activeStatus!=="all"&&!active;
          const count = cdmPad(byId[s.id]||0);
          return (
            <div key={s.id} role="button" onClick={()=>onPick(active?null:s.id)}
              style={{flex:"0 0 auto",padding:"10px 16px 12px",cursor:"pointer",opacity:(dim&&s.id!=="all")?0.35:1,transition:"opacity .12s,background .12s",background:active?"#f8fafc":"transparent"}}
              onMouseEnter={e=>{if(!active&&!dim)e.currentTarget.style.background="#fafbfc";}}
              onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent";}}>
              {/* color line: exactly text width + 18px (9px padding each side) */}
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

// ── AT Status row (mirrors ERVAutomationStatus exactly) ───────
const CDM_AT = [
  { id:"completed",  label:"Completed",       key:"completed",  get icon(){ return (window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png"; } },
  { id:"warning",    label:"Needs Attention", key:"needsAttn",  get icon(){ return (window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png"; }, num:"#d97706", caret:false },
  { id:"inprogress", label:"In Progress",     key:"inProgress", get icon(){ return (window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png"; } },
];
function CDMAutomationStatus({ counts, atFilter, onFilter }) {
  const at = counts.at;
  return (
    <div style={{display:"flex",alignItems:"center",font:"400 13px/16px Roboto",color:"#333",justifyContent:"flex-end"}}>
      <span style={{color:"#94a3b8",marginRight:12}}>Automation (AT) Status :</span>
      {CDM_AT.map((s,i)=>{
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

// ── Document icon (same as Auth Summary View) ─────────────────────
function CDMDocIcon({ size=18, faded=false }) {
  return <img src={(window.__resources&&window.__resources.attachmentType)||"icons/attachment-type.svg"} width={size} height={size} alt="" style={{display:"block",opacity:faded?0.35:1}} aria-hidden="true" />;
}

// ── Table (CSS grid, mirrors ERV style) ───────────────────────
const CDM_COLS = [
  { key:"name",           label:"Patient Name",      grid:"minmax(130px,1.4fr)", sortable:true  },
  { key:"workerName",     label:"Worker Name",        grid:"minmax(120px,1.2fr)", sortable:true  },
  { key:"mrn",            label:"MRN",               grid:"minmax(120px,1.2fr)", sortable:true  },
  { key:"branchId",       label:"Branch",            grid:"minmax(70px,0.7fr)",  sortable:true  },
  { key:"episodeId",      label:"Episode ID",        grid:"minmax(90px,0.9fr)",  sortable:true  },
  { key:"primaryPayor",   label:"Primary Payor",     grid:"minmax(120px,1.2fr)", sortable:true  },
  { key:"secondaryPayorSource", label:"Secondary Payor Source", grid:"minmax(130px,1.3fr)", sortable:true },
  { key:"cdmInitTime",    label:"CDM Init Time",     grid:"minmax(140px,1.3fr)", sortable:true  },
  { key:"eligPcHours",    label:"Eligible PC Hours",  grid:"minmax(80px,0.8fr)",  sortable:true  },
  { key:"pcAuthHours",    label:"PC Auth Hours",     grid:"minmax(75px,0.75fr)", sortable:true  },
  { key:"eligAttendHours",label:"Eligible Attend Hours",grid:"minmax(90px,0.9fr)",sortable:true  },
  { key:"attendAuthHours",label:"Attend Auth Hours",  grid:"minmax(80px,0.8fr)",  sortable:true  },
  { key:"at",             label:"AT Status",         grid:"72px",                sortable:false, align:"center" },
  { key:"docs",           label:"Docs",              grid:"52px",                sortable:false, align:"center" },
  { key:"reviewed",       label:"Reviewed?",         grid:"78px",                sortable:false, align:"center" },
];
const CDM_GRID = CDM_COLS.map(c=>c.grid).join(" ");

function CDMSortArrows({ active, dir }) {
  const up   = active&&dir==="asc"  ? "#2563eb" : "rgba(0,0,0,0.25)";
  const down = active&&dir==="desc" ? "#2563eb" : "rgba(0,0,0,0.25)";
  return (
    <svg width="10" height="15" viewBox="0 0 9 14" fill="none" style={{marginRight:3,flex:"none"}}>
      <path d="M7.74699 7.40234H1.25301C1.05823 7.40234 0.949473 7.608 1.0701 7.7484L4.31708 11.5135C4.41003 11.6213 4.58899 11.6213 4.68291 11.5135L7.9299 7.7484C8.05053 7.608 7.94177 7.40234 7.74699 7.40234Z" fill={down}/>
      <path d="M7.9299 6.24825L4.68291 2.48317C4.58997 2.3754 4.41101 2.3754 4.31708 2.48317L1.0701 6.24825C0.949473 6.38865 1.05823 6.59431 1.25301 6.59431H7.74699C7.94177 6.59431 8.05053 6.38865 7.9299 6.24825Z" fill={up}/>
    </svg>
  );
}

const EDM_PILL_STYLES = {
  completed:{bg:"#f0fdf4",bd:"#16a34a",c:"#16a34a",label:"Completed"},
  ending:   {bg:"#fffbeb",bd:"#d97706",c:"#d97706",label:"Ending"},
  late:     {bg:"#fef2f2",bd:"#dc2626",c:"#dc2626",label:"Late"},
};
function EDMPill({edm}){
  const s=EDM_PILL_STYLES[edm]||{bg:"#f1f5f9",bd:"#94a3b8",c:"#64748b",label:edm};
  return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,padding:"4px 12px",borderRadius:4,background:s.bg,border:`1px solid ${s.bd}`,color:s.c,font:"500 11px/16px Roboto",whiteSpace:"nowrap",minWidth:140,boxSizing:"border-box"}}>{s.label}</span>;
}
function CDMATIcon({at}){
  const res=(typeof window!=="undefined"&&window.__resources)||{};
  if(at==="thumb")     return <img src={res.atCompleted||"icons/at-completed.png"} alt="Completed" style={{width:18,height:18,objectFit:"contain"}} />;
  if(at==="warning")   return <img src={res.atNeedsAttention||"icons/at-needs-attention.png"} alt="Needs Attention" style={{width:18,height:18,objectFit:"contain"}} />;
  if(at==="hourglass") return <img src={res.atInProgress||"icons/at-in-progress.png"} alt="In Progress" style={{width:18,height:18,objectFit:"contain"}} />;
  return <span style={{color:"#cbd5e1"}}>—</span>;
}
const dash = <span style={{color:"#cbd5e1"}}>—</span>;

function CDMTableHeader({ sortKey, sortDir, onSort }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:CDM_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",gap:8}}>
      {CDM_COLS.map(c=>(
        <div key={c.key} onClick={c.sortable?()=>onSort(c.key):undefined}
          style={{font:"500 11px/14px Roboto",color:"#64748b",textAlign:c.align||"left",display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",cursor:c.sortable?"pointer":"default",userSelect:"none",overflow:"hidden",whiteSpace:"nowrap",borderRight:c.dividerAfter?"2px solid #cbd5e1":"none",paddingRight:c.dividerAfter?8:undefined}}>
          {c.sortable&&<CDMSortArrows active={sortKey===c.key} dir={sortDir} />}
          {c.label}
        </div>
      ))}
    </div>
  );
}

function CDMTableRow({ row, reviewed, onReviewed, onDocsClick, accent="#2563eb" }) {
  const cell = (align) => ({font:"500 12px/16px Roboto",color:"#333",textAlign:align||"left",display:"flex",alignItems:"center",justifyContent:align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0});
  return (
    <div style={{marginBottom:8}}>
      <div style={{display:"grid",gridTemplateColumns:CDM_GRID,alignItems:"center",height:48,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:6,boxShadow:"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",gap:8,transition:"box-shadow .12s"}}>
        <div style={cell()}><a href="#" onClick={e=>e.preventDefault()} style={{color:accent,font:"500 13px/16px Roboto",textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis"}}>{row.name}</a></div>
        <div style={cell()}>{row.workerName||<span style={{color:"#94a3b8"}}>—</span>}</div>
        <div style={cell()}>{row.mrn}</div>
        <div style={cell()}>{row.branchId}</div>
        <div style={{...cell(),color:"#1e40af"}}>{row.episodeId}</div>
        <div style={cell()}>{row.primaryPayor||<span style={{color:"#94a3b8"}}>—</span>}</div>
        <div style={cell()}>{row.secondaryPayorSource||<span style={{color:"#94a3b8"}}>—</span>}</div>
        <div style={cell()}>{row.cdmInitTime||<span style={{color:"#94a3b8"}}>—</span>}</div>
        <div style={cell()}>{row.eligPcHours?row.eligPcHours+" hrs":<span style={{color:"#94a3b8"}}>—</span>}</div>
        <div style={cell()}>{row.pcAuthHours?row.pcAuthHours+" hrs":<span style={{color:"#94a3b8"}}>—</span>}</div>
        <div style={cell()}>{row.eligAttendHours?row.eligAttendHours+" hrs":<span style={{color:"#94a3b8"}}>—</span>}</div>
        <div style={cell()}>{row.attendAuthHours?row.attendAuthHours+" hrs":<span style={{color:"#94a3b8"}}>—</span>}</div>
        <div style={cell("center")}><CDMATIcon at={row.at} /></div>
        <div style={{...cell("center"),cursor:row.docs?"pointer":"default"}} onClick={row.docs?()=>onDocsClick&&onDocsClick(row):undefined}><CDMDocIcon size={18} faded={!row.docs} /></div>
        <div style={cell("center")}>
          <span role="checkbox" aria-checked={!!reviewed} tabIndex={0} onClick={()=>onReviewed&&onReviewed(row.id)}
            style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:`1px solid ${reviewed?accent:"#d8d8d8"}`,borderRadius:3,background:reviewed?accent:"#fff",cursor:"pointer",transition:"all .12s"}}>
            {reviewed&&<span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}
          </span>
        </div>
      </div>

    </div>
  );
}

function CDMTable({ rows, sortKey, sortDir, onSort, reviewedSet={}, toggleReviewed, onDocsClick }) {
  const ScrollBody = typeof window!=="undefined"&&window.ScrollBody;
  if(rows.length===0) return <div style={{padding:"48px",textAlign:"center",color:"#94a3b8",font:"400 14px Roboto"}}>No records match the current filters.</div>;
  const Body = ({children}) => ScrollBody ? <ScrollBody>{children}</ScrollBody> : <div style={{overflowY:"auto",flex:1}}>{children}</div>;
  return (
    <div style={{padding:"0 24px 24px"}}>
      <CDMTableHeader sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
      <Body>
        {rows.map(r=><CDMTableRow key={r.id} row={r} reviewed={!!reviewedSet[r.id]} onReviewed={toggleReviewed} onDocsClick={onDocsClick} />)}
        <div style={{padding:"16px 24px",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} records shown</div>
      </Body>
    </div>
  );
}

// ── CDM Pagination ────────────────────────────────────────────
function CDMPagination({ total, page, perPage, onPage }) {
  return null;
  const pages = Math.max(1,Math.ceil(total/perPage));
  const start = (page-1)*perPage+1, end = Math.min(page*perPage,total);
  const Btn = ({children,active,disabled,onClick})=>(
    <button type="button" onClick={onClick} disabled={disabled} style={{width:28,height:28,borderRadius:4,border:`1px solid ${active?"#2563eb":"#e2e8f0"}`,background:active?"#2563eb":"#fff",color:active?"#fff":disabled?"#cbd5e1":"#333",font:"400 12px/16px Roboto",cursor:disabled?"default":"pointer",padding:0}}>{children}</button>
  );
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #e2e8f0",padding:"12px 24px"}}>
      <span style={{font:"400 12px/16px Roboto",color:"#94a3b8"}}>Showing {start}–{end} of {total}</span>
      <div style={{display:"flex",gap:6}}>
        <Btn onClick={()=>onPage(page-1)} disabled={page===1}>‹</Btn>
        {Array.from({length:Math.min(pages,5)},(_,i)=>i+1).map(n=><Btn key={n} active={n===page} onClick={()=>onPage(n)}>{n}</Btn>)}
        <Btn onClick={()=>onPage(page+1)} disabled={page===pages}>›</Btn>
      </div>
    </div>
  );
}


// ── CDM Docs Slideout ─────────────────────────────────────────────────────────
function CDMDocsSlideout({ row, onClose }) {
  const [tab, setTab] = useCDM("source");
  const SHEETS_URL = "https://docs.google.com/spreadsheets/d/1xv44VPHYlImzJ9SxFfEc9M1oSctvs5kREqbO7LiNqfw/edit?usp=sharing";
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.18)"}} />
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:420,background:"#fff",zIndex:901,display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.13)",animation:"cdmDocsSlide .22s cubic-bezier(0.32,0.72,0,1)"}}>
        <style>{`@keyframes cdmDocsSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 16px"}}>
          <span style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Documents</span>
          <button onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",padding:4,color:"#64748b",font:"400 20px/18px Roboto"}}>✕</button>
        </div>
        {/* Meta */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",padding:"0 24px 16px",borderBottom:"1px solid #e5e7eb"}}>
          {[["Patient Name",row.name||"—"],["MRN",row.mrn||"—"],["Branch",row.branchId||"—"],["REF ID",row.episodeId||row.id||"CDM001"],["Worker",row.workerName||"—"]].map(([l,v])=>(
            <div key={l}><div style={{font:"400 11px Roboto",color:"#94a3b8",marginBottom:2}}>{l}</div><div style={{font:"500 12px Roboto",color:"#0f172a"}}>{v}</div></div>
          ))}
        </div>
        {/* Tabs */}
        <div style={{display:"flex",alignItems:"center",padding:"0 24px",borderBottom:"1px solid #e5e7eb",gap:24}}>
          {[["source","Attachments"],["message","Notes"]].map(([k,lbl])=>(
            <button key={k} type="button" onClick={()=>setTab(k)} style={{background:"transparent",border:"none",cursor:"pointer",padding:"12px 2px",font:`${tab===k?500:400} 14px/18px Roboto`,color:tab===k?"#1677ff":"#64748b",borderBottom:`2px solid ${tab===k?"#1677ff":"transparent"}`,transition:"all .12s"}}>{lbl}</button>
          ))}
          <a href={SHEETS_URL} target="_blank" rel="noreferrer" style={{marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:6,color:"#1677ff",font:"500 12px Roboto",textDecoration:"none"}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download All
          </a>
        </div>
        {/* Body */}
        <div style={{flex:1,overflowY:"auto",padding:"16px 24px"}}>
          {tab==="source" ? (
            <>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,color:"#64748b",font:"400 13px Roboto"}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {row.cdmInitTime||"04/15/25"}
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",border:"1px solid #e5e7eb",borderRadius:8,background:"#f8fafc"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  <span style={{font:"500 13px Roboto",color:"#0f172a"}}>Calendar report.xls</span>
                </div>
                <a href={SHEETS_URL} target="_blank" rel="noreferrer" style={{color:"#1677ff",font:"500 13px Roboto",textDecoration:"none"}}>View</a>
              </div>
            </>
          ) : (
            <div style={{background:"#f8fafc",borderRadius:8,padding:"18px 20px"}}>
              <div style={{marginBottom:18}}>
                <div style={{font:"600 13px/18px Roboto",color:"#1e40af",marginBottom:8}}>Completed Payor Assignments in HCHB</div>
                {row.at==="thumb" ? (
                  <div style={{font:"400 12px/18px Roboto",color:"#334155"}}>
                    <div>Full Reassignment: Updated; {row.cdmInitTime||"04/24/2026"} From PC 6:00 PM-7:00 PM to Attend 6:00 PM-7:00 PM</div>
                    <div style={{marginTop:6}}>Split Reassignment: Updated; {row.txnArrived||"04/25/2026"} From PC 6:00 PM-8:00 PM to PC 6:00 PM-7:00 PM</div>
                    <div style={{marginTop:6}}>Split Reassignment: Created; {row.txnArrived||"04/25/2026"} From PC 6:00 PM-8:00 PM to Attend 7:00 PM-8:00 PM</div>
                  </div>
                ) : row.at==="hourglass" ? (
                  <div style={{font:"400 12px/18px Roboto",color:"#64748b"}}>Processing — reassignment in progress.</div>
                ) : (
                  <div style={{font:"400 12px/18px Roboto",color:"#64748b"}}>None</div>
                )}
              </div>
              <div style={{marginBottom:18}}>
                <div style={{font:"600 13px/18px Roboto",color:"#1e40af",marginBottom:8}}>Failed Payor Assignments in HCHB (Automation Error)</div>
                {row.at==="warning" ? (
                  <div style={{font:"400 12px/18px Roboto",color:"#334155"}}>
                    <div>Full Reassignment: Failed; {row.cdmInitTime||"04/24/2026"} From PC 6:00 PM-7:00 PM to Attend 6:00 PM-7:00 PM</div>
                    {row.reasonFailTerm && <div style={{marginTop:6,color:"#dc2626"}}>Reason: {row.reasonFailTerm}</div>}
                  </div>
                ) : (
                  <div style={{font:"400 12px/18px Roboto",color:"#64748b"}}>None</div>
                )}
              </div>
              <div>
                <div style={{font:"600 13px/18px Roboto",color:"#1e40af",marginBottom:8}}>Reassignment Not Required</div>
                <div style={{font:"400 12px/18px Roboto",color:"#334155"}}>
                  <div>No HCHB Update performed - No visits require reassignment (PC not exhausted)</div>
                  <div style={{marginTop:4}}>No HCHB Update performed - Client has only one payer (no Attend program line)</div>
                  <div style={{marginTop:4}}>No HCHB Update performed - Over-service condition; AttAuthHours={row.attendAuthHours||"24.25"}; CumulativeShiftHours={(parseFloat(row.attendAuthHours||0)+7.25).toFixed(2)}; ExceededBy=7.25h</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── CDM Request View (main) ───────────────────────────────────
function CDMRequestView({ review }) {
  const [statusFilter, setStatusFilter] = useCDM("all");
  const [atFilter, setAtFilter] = useCDM(null);
  const [modeFilter, setModeFilter] = useCDM("all");
  const [search, setSearch] = useCDM("");
  const [sortKey, setSortKey] = useCDM(null);
  const [sortDir, setSortDir] = useCDM("asc");
  const [reviewedSet, setReviewedSet] = useCDM({});
  const [docsRow, setDocsRow] = useCDM(null);
  const toggleReviewed = id => setReviewedSet(s=>({...s,[id]:!s[id]}));
  const handleSort = k => { if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };

  const needsReview = (r) => r.at === "warning" && !reviewedSet[r.id];

  let rows = CDM_ROWS;
  if(modeFilter==="manual")    rows=rows.filter(r=>r.at==="none"||!r.at);
  if(modeFilter==="automated") rows=rows.filter(r=>r.at&&r.at!=="none");
  if(statusFilter==="alerts")  rows=rows.filter(r=>r.at==="warning");
  else if(statusFilter!=="all") rows=rows.filter(r=>r.edm===statusFilter);
  if(atFilter==="completed")  rows=rows.filter(r=>r.at==="thumb");
  if(atFilter==="warning")    rows=rows.filter(r=>r.at==="warning");
  if(atFilter==="inprogress") rows=rows.filter(r=>r.at==="hourglass");
  if(search.trim()){ const q=search.toLowerCase(); rows=rows.filter(r=>r.name.toLowerCase().includes(q)||r.mrn.toLowerCase().includes(q)||r.episodeId.toLowerCase().includes(q)); }
  if(review) rows=rows.filter(r=>needsReview(r));

  const counts = cdmCountsFor(CDM_ROWS);

  return (
    <div style={{background:"#fff",minHeight:"100%",display:"flex",flexDirection:"column"}}>
      <CDMFilterBar search={search} onSearch={v=>{setSearch(v);}} reviewActive={review} />
      <div style={{padding:"18px 24px 14px",display:"flex",alignItems:"flex-start",gap:24,borderBottom:"1px solid #e2e8f0"}}>
        <CDMTitleCluster modeFilter={modeFilter} onModeFilter={v=>{setModeFilter(v);}} />
        <div style={{marginLeft:"auto",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
          <CDMStatusStrip allRows={CDM_ROWS} activeStatus={statusFilter} onPick={v=>{setStatusFilter(v||"all");}} />
        </div>
      </div>
      <CDMTable rows={rows} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} reviewedSet={reviewedSet} toggleReviewed={toggleReviewed} onDocsClick={setDocsRow} />
      {docsRow && <CDMDocsSlideout row={docsRow} onClose={()=>setDocsRow(null)} />}
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { CDMRequestView });

// ── CDM Automation Log (same structure as ERVAutomationLogView, CDM data) ──
function CDMAutomationLogView({ onRefClick }) {
  // Map CDM_ROWS to the ERV AL row format
  const CDM_AL_ROWS = CDM_ROWS.map((r, i) => ({
    ref: "CDM" + String(i + 1).padStart(10, "0"),
    wf: "CDM - Transaction Processing",
    stage: r.currentStage,
    agency: r.branchId,
    name: r.name,
    mrn: r.mrn,
    memId: r.episodeId,
    src: r.reasonFailTerm || r.currentStatus,
    gw: r.edm.charAt(0).toUpperCase() + r.edm.slice(1),
    st: r.txnArrived + " 09:39 AM",
    et: r.txnEnd ? r.txnEnd + " 09:39 AM" : "—",
    at: r.at,
    dk: "medicare_advantage",
  }));

  const ERV_AL_SUMMARY_CARDS = [
    { id:"all",       label:"All Transaction", color:"rgb(21,95,130)",   match:()=>true,                icon:null },
    { id:"thumb",     label:"Completed",       color:"rgb(14,165,233)",  match:(r)=>r.at==="thumb",     icon:"icons/at-completed.png" },
    { id:"warning",   label:"Needs Attention", color:"rgb(245,158,11)",  match:(r)=>r.at==="warning",   icon:"icons/at-needs-attention.png" },
    { id:"hourglass", label:"In Progress",     color:"rgb(148,163,184)", match:(r)=>r.at==="hourglass", icon:"icons/at-in-progress.png" },
  ];
  const ERV_AL_FILTER_FIELDS = [
    { key:"agency", label:"Agency" },
    { key:"gw",     label:"CDM Status" },
    { key:"src",    label:"Current Status" },
  ];
  const ERV_AL_COLS = [
    { key:"ref",   label:"Ref ID",        w:"minmax(110px,1.1fr)", sort:true },
    { key:"wf",    label:"Workflow",       w:"minmax(220px,2.2fr)", sort:true },
    { key:"stage", label:"Current Stage", w:"minmax(90px,0.9fr)",  sort:true },
    { key:"agency",label:"Branch ID",     w:"minmax(68px,0.68fr)", sort:true },
    { key:"name",  label:"Patient Name",  w:"minmax(120px,1.2fr)", sort:true },
    { key:"mrn",   label:"Patient MRN",   w:"minmax(110px,1.1fr)", sort:true },
    { key:"memId", label:"Episode ID",    w:"minmax(78px,0.78fr)", sort:true },
    { key:"src",   label:"Current Status",w:"minmax(100px,1fr)",   sort:true },
    { key:"gw",    label:"CDM Status",    w:"minmax(70px,0.7fr)",  sort:true },
    { key:"st",    label:"Arrived Date",  w:"minmax(110px,1.1fr)", sort:true },
    { key:"et",    label:"End Date",      w:"minmax(110px,1.1fr)", sort:true },
    { key:"at",    label:"AT Status",     w:"70px",                sort:false, align:"center" },
  ];
  const GRID = ERV_AL_COLS.map(c=>c.w).join(" ");

  const [cardFilter, setCardFilter] = useCDM(null);
  const [searchQ, setSearchQ] = useCDM("");
  const [sortKey, setSortKey] = useCDM(null);
  const [sortDir, setSortDir] = useCDM("asc");
  const [fieldFilters, setFieldFilters] = useCDM([]);
  const handleSort = k => { if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else{ setSortKey(k); setSortDir("asc"); } };
  const activeCard = cardFilter ? ERV_AL_SUMMARY_CARDS.find(c=>c.id===cardFilter) : null;
  const filtered = fieldFilters.length ? CDM_AL_ROWS.filter(r=>fieldFilters.every(f=>f.values.includes(r[f.field]))) : CDM_AL_ROWS;
  const searched = searchQ ? filtered.filter(r=>Object.values(r).join(" ").toLowerCase().includes(searchQ.toLowerCase())) : filtered;
  const scoped = activeCard ? searched.filter(activeCard.match) : searched;
  const rows = sortKey ? [...scoped].sort((a,b)=>{ const av=a[sortKey]||"", bv=b[sortKey]||""; return sortDir==="asc"?av.localeCompare(bv):bv.localeCompare(av); }) : scoped;

  const ARVFilterBarChips = typeof window!=="undefined"&&window.ARVFilterBarChips;
  const ARVSortArrows = typeof window!=="undefined"&&window.ARVSortArrows;
  const ARVATIcon = typeof window!=="undefined"&&window.ARVATIcon;
  const ScrollBody = typeof window!=="undefined"&&window.ScrollBody;
  const pad = n=>String(n).padStart(2,"0");

  return (
    <div style={{background:"#fff",minHeight:"100%"}}>
      {ARVFilterBarChips && <ARVFilterBarChips hideSearch={false} searchValue={searchQ} onSearch={setSearchQ} filterFields={ERV_AL_FILTER_FIELDS} filterRows={CDM_AL_ROWS} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters} onClearFilters={fieldFilters.length?()=>setFieldFilters([]):null} />}
      <div style={{padding:"20px 32px 0"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,flexWrap:"wrap",marginBottom:12}}>
          <div>
            <div style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Automation Log</div>
            <div style={{font:"400 13px/18px Roboto",color:"#3A424A",marginTop:8}}>Transaction Status of CDM Workflows</div>
          </div>
          <div style={{display:"flex",gap:28,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
            {ERV_AL_SUMMARY_CARDS.map(c=>{
              const active=cardFilter===c.id, dim=cardFilter&&!active, isAll=c.id==="all";
              const val=filtered.filter(c.match).length;
              return (
                <div key={c.id} role="button" onClick={()=>setCardFilter(active?null:c.id)}
                  style={{minWidth:82,display:"flex",flexDirection:"column",gap:8,cursor:"pointer",opacity:(dim&&!isAll)?0.4:1,transition:"opacity .12s"}}>
                  <div style={{height:3,borderRadius:2,background:c.color,opacity:active?1:0.85}}></div>
                  <div style={{display:"flex",alignItems:"center",gap:5,font:"400 13px/17px Roboto",color:active?"#0f172a":(dim&&isAll)?"#b0b0b0":"#605D5D",whiteSpace:"nowrap"}}>
                    {c.icon&&<img src={c.icon} alt="" style={{width:14,height:14,objectFit:"contain",flexShrink:0}} />}
                    {c.label}
                  </div>
                  <div style={{font:"500 16px/20px Roboto",color:active?"#0f172a":(dim&&isAll)?"#b0b0b0":"#605D5D"}}>{pad(val)}</div>
                  {cardFilter&&c.id==="all"&&<button type="button" onClick={e=>{e.stopPropagation();setCardFilter(null);}} style={{marginTop:2,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}><span style={{fontSize:11}}>↻</span>Reset</button>}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block",marginBottom:16}}>
          Click Ref ID to view related CDM transactions
        </div>
        {/* Header */}
        <div style={{display:"grid",gridTemplateColumns:GRID,alignItems:"stretch",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",minHeight:44,padding:"0 12px",gap:6}}>
          {ERV_AL_COLS.map(c=>(
            <div key={c.key} onClick={c.sort?()=>handleSort(c.key):undefined}
              style={{display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",gap:3,font:"500 11px/14px Roboto",color:"#64748b",whiteSpace:"nowrap",cursor:c.sort?"pointer":"default",userSelect:"none",overflow:"hidden",padding:"0 2px"}}>
              {c.sort&&ARVSortArrows&&<ARVSortArrows active={sortKey===c.key} dir={sortDir} />}
              {c.label}
            </div>
          ))}
        </div>
        {/* Rows */}
        <div style={{overflowY:"auto",maxHeight:"calc(100vh - 340px)"}}>
          {rows.length===0
            ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>No records match.</div>
            : rows.map((r,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:GRID,alignItems:"center",minHeight:52,padding:"6px 12px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:6,background:"#fff",boxShadow:"0 1px 2px rgba(15,23,42,0.03)",gap:6,position:"relative"}}>
                <div style={{position:"absolute",left:8,top:8,bottom:8,width:3,background:"#A66092",borderRadius:2}}></div>
                <div style={{font:"500 12px/16px Roboto",color:"#2563eb",fontWeight:500,cursor:"pointer",paddingLeft:18,display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden"}} onClick={()=>onRefClick&&onRefClick(r.dk)}>{r.ref}</div>
                {["wf","stage","agency","name","mrn"].map(k=>(
                  <div key={k} style={{font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,padding:"0 2px"}}>{r[k]}</div>
                ))}
                <div style={{font:"500 12px/16px Roboto",color:"#16a34a",display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden",padding:"0 2px"}}>{r.memId}</div>
                <div style={{font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden",padding:"0 2px"}}>{r.src}</div>
                <div style={{font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden",padding:"0 2px"}}>{r.gw}</div>
                <div style={{font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden",padding:"0 2px"}}>{r.st}</div>
                <div style={{font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden",padding:"0 2px"}}>{r.et}</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>{ARVATIcon&&<ARVATIcon kind={r.at} />}</div>
              </div>
            ))}
          <div style={{padding:"12px 0",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} of {CDM_AL_ROWS.length} records shown</div>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { CDMAutomationLogView });
