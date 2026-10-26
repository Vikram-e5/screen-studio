// Intake — Automation Log. Same structure as ARV/CDM automation logs. Columns
// per the Intake field-list spec, split into E-Referral and Patient Intake tabs:
// Ref ID, Service, Workflow, Current Stage, Patient Name, Agency, Referral ID, Start/End time, AT Status.
const { useState: useIAL } = React;

function ialWorkflowFor(src, r) {
  if (src==="ereferral")    return "Intake - Referral Processing";
  if (src==="preeligibility") return "Intake - Pre-eligibility Check";
  return "Intake - Patient Intake Processing";
}
function ialStageFor(src, r) {
  if (src==="ereferral")    return r.resp==="accepted" ? "Response Received" : r.resp==="declined" ? "Declined" : "Ineligibility Review";
  if (src==="preeligibility") return r.cov==="accepted" ? "Coverage Confirmed" : r.cov==="declined" ? "Coverage Declined" : "Ineligibility Review";
  return r.at==="thumb" ? "HCHB Sync Complete" : r.at==="warning" ? "HCHB Sync Failed" : "HCHB Sync Pending";
}

// Built on demand so it always reflects the loaded E-referral / Patient intake rows.
function ialRows(tab) {
  const ier = window.IER_ROWS || [];
  const refFor = (name, i) => { const m = ier.find(x => x.name === name); return (m && m.refId) || ("REF2024" + String(900 + i).padStart(4, "0")); };
  if (tab === "ereferral") return ier.map((r,i)=>({ ref:"IER"+String(i+1).padStart(9,"0"), src:"ereferral", srcLabel:"E-Referral", wf:ialWorkflowFor("ereferral",r), stage:ialStageFor("ereferral",r), name:r.name, agency:r.agency, branch:r.branch, refId:r.refId, st:r.refDate+" 09:12 AM", et:r.at==="hourglass"?"—":r.refDate+" 09:41 AM", at:r.at }));
  return (window.IPT_ROWS||[]).map((r,i)=>({ ref:"IPT"+String(i+1).padStart(9,"0"), src:"patientintake", srcLabel:"Patient Intake", wf:ialWorkflowFor("patientintake",r), stage:ialStageFor("patientintake",r), name:r.name, agency:r.agency, refId:refFor(r.name,i), st:"04/16/25 08:30 AM", et:r.at==="hourglass"?"—":"04/16/25 08:58 AM", at:r.at }));
}
const IAL_ROWS = ialRows("patientintake");
if (typeof window !== "undefined") window.IAL_ROWS = IAL_ROWS;

const IAL_SUMMARY_CARDS = [
  { id:"all",       label:"All Transaction", color:"rgb(21,95,130)",   match:()=>true,                icon:null },
  { id:"thumb",     label:"Completed",       color:"rgb(14,165,233)",  match:(r)=>r.at==="thumb",     icon:"icons/at-completed.png" },
  { id:"warning",   label:"Needs Attention", color:"rgb(245,158,11)",  match:(r)=>r.at==="warning",   icon:"icons/at-needs-attention.png" },
  { id:"hourglass", label:"In Progress",     color:"rgb(148,163,184)", match:(r)=>r.at==="hourglass", icon:"icons/at-in-progress.png" },
];
const IAL_FILTER_FIELDS = [
  { key:"agency", label:"Agency" },
];
const IAL_EREF_FILTER_FIELDS = [
  { key:"stage",  label:"Current Stage" },
  { key:"agency", label:"Agency" },
  { key:"branch", label:"Branch" },
  { key:"refId",  label:"Referral ID" },
];
const IAL_COLS = [
  { key:"ref",    label:"Ref ID",        w:"minmax(110px,1.1fr)", sort:true },
  { key:"srcLabel",label:"Service",      w:"minmax(100px,1fr)",   sort:true },
  { key:"wf",     label:"Workflow",      w:"minmax(220px,2.2fr)", sort:true },
  { key:"stage",  label:"Current Stage", w:"minmax(140px,1.4fr)", sort:true },
  { key:"name",   label:"Patient Name",  w:"minmax(120px,1.2fr)", sort:true },
  { key:"agency", label:"Agency",        w:"minmax(78px,0.78fr)", sort:true },
  { key:"refId",  label:"Referral ID",   w:"minmax(110px,1.1fr)", sort:true },
  { key:"st",     label:"Start Time",    w:"minmax(120px,1.2fr)", sort:true },
  { key:"et",     label:"End Time",      w:"minmax(120px,1.2fr)", sort:true },
  { key:"at",     label:"AT Status",     w:"70px",                sort:false, align:"center" },
];
const IAL_GRID = IAL_COLS.map(c=>c.w).join(" ");

const IAL_TABS = [["ereferral","E-Referral"],["patientintake","Patient Intake"]];
function IntakeAutomationLogView({ onRefClick }) {
  const [tab, setTabRaw] = useIAL("ereferral");
  const [cardFilter, setCardFilter] = useIAL(null);
  const ALL = ialRows(tab);
  const [searchQ, setSearchQ] = useIAL("");
  const [sortKey, setSortKey] = useIAL(null);
  const [sortDir, setSortDir] = useIAL("asc");
  const [fieldFilters, setFieldFilters] = useIAL([]);
  const setTab = (k) => { setTabRaw(k); setCardFilter(null); setSearchQ(""); setFieldFilters([]); };
  const handleSort = k => { if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else{ setSortKey(k); setSortDir("asc"); } };
  const activeCard = cardFilter ? IAL_SUMMARY_CARDS.find(c=>c.id===cardFilter) : null;
  const filtered = fieldFilters.length ? ALL.filter(r=>fieldFilters.every(f=>f.values.includes(r[f.field]))) : ALL;
  const searched = searchQ ? filtered.filter(r=>Object.values(r).join(" ").toLowerCase().includes(searchQ.toLowerCase())) : filtered;
  const scoped = activeCard ? searched.filter(activeCard.match) : searched;
  const rows = sortKey ? [...scoped].sort((a,b)=>{ const av=a[sortKey]||"", bv=b[sortKey]||""; return sortDir==="asc"?av.localeCompare(bv):bv.localeCompare(av); }) : scoped;

  const ARVFilterBarChips = window.ARVFilterBarChips, ARVSortArrows = window.ARVSortArrows, ARVATIcon = window.ARVATIcon;
  const pad = n=>String(n).padStart(2,"0");

  return (
    <div style={{background:"#fff",minHeight:"100%"}}>
      {ARVFilterBarChips && <ARVFilterBarChips hideSearch={false} searchValue={searchQ} onSearch={setSearchQ} filterFields={tab==="ereferral"?IAL_EREF_FILTER_FIELDS:IAL_FILTER_FIELDS} filterRows={ALL} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters} onClearFilters={fieldFilters.length?()=>setFieldFilters([]):null} />}
      <div style={{padding:"20px 32px 0"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,flexWrap:"wrap",marginBottom:12}}>
          <div>
            <div style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Automation Log</div>
            <div style={{font:"400 13px/18px Roboto",color:"#3A424A",marginTop:8}}>Transaction Status of {tab==="ereferral"?"E-Referral":"Patient Intake"} Workflows</div>
          </div>
          <div style={{display:"flex",gap:28,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
            {IAL_SUMMARY_CARDS.map(c=>{
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
        <div style={{display:"flex",alignItems:"flex-end",borderBottom:"1px solid #e2e8f0",marginBottom:14}}>
          {IAL_TABS.map(([k,lbl])=>{ const sel=tab===k; return (
            <button key={k} type="button" onClick={()=>setTab(k)} style={{background:"transparent",border:"none",cursor:"pointer",padding:"10px 2px",marginRight:28,font:`${sel?500:400} 14px/18px Roboto`,color:sel?"#2563eb":"#3A424A",borderBottom:`2px solid ${sel?"#2563eb":"transparent"}`,marginBottom:-1}}>{lbl}</button>
          ); })}
        </div>
        <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block",marginBottom:16}}>
          Click Ref ID to view the related {tab==="ereferral"?"E-Referral":"Patient Intake"} transaction
        </div>
        <div style={{display:"grid",gridTemplateColumns:IAL_GRID,alignItems:"stretch",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",minHeight:44,padding:"0 12px",gap:6}}>
          {IAL_COLS.map(c=>(
            <div key={c.key} onClick={c.sort?()=>handleSort(c.key):undefined}
              style={{display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",gap:3,font:"500 11px/14px Roboto",color:"#64748b",whiteSpace:"nowrap",cursor:c.sort?"pointer":"default",userSelect:"none",overflow:"hidden",padding:"0 2px"}}>
              {c.sort&&ARVSortArrows&&<ARVSortArrows active={sortKey===c.key} dir={sortDir} />}
              {c.label}
            </div>
          ))}
        </div>
        <div style={{overflowY:"auto",maxHeight:"calc(100vh - 340px)"}}>
          {rows.length===0
            ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>No records match.</div>
            : rows.map((r,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:IAL_GRID,alignItems:"center",minHeight:52,padding:"6px 12px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:6,background:"#fff",boxShadow:"0 1px 2px rgba(15,23,42,0.03)",gap:6,position:"relative"}}>
                <div style={{position:"absolute",left:8,top:8,bottom:8,width:3,background:"#6660A6",borderRadius:2}}></div>
                <div style={{font:"500 12px/16px Roboto",color:"#2563eb",fontWeight:500,cursor:"pointer",paddingLeft:18,display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden"}} onClick={()=>onRefClick&&onRefClick(r)}>{r.ref}</div>
                {["srcLabel","wf","stage","name","agency","refId","st","et"].map(k=>(
                  <div key={k} style={{font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,padding:"0 2px"}}>{r[k]}</div>
                ))}
                <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>{ARVATIcon&&<ARVATIcon kind={r.at} />}</div>
              </div>
            ))}
          <div style={{padding:"12px 0",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} of {ALL.length} records shown</div>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { IntakeAutomationLogView });
