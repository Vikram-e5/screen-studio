// Intake — Automation Log. Same structure as ARV/CDM automation logs. Columns
// per the Intake field-list spec, split into E-referral and Patient Intake tabs:
// Ref ID, Service, Workflow, Current Stage, Patient Name, Episode ID, Patient ID,
// Pre-Validation, Queue Added Time, Start/End time, AT Status.
const { useState: useIAL } = React;

function ialWorkflowFor(src, r) {
  if (src==="ereferral")    return "E-referral Processing";
  if (src==="preeligibility") return "Intake - Pre-eligibility Check";
  return "Intake - Patient Intake Processing";
}
const IAL_PI_S2="STAGE II - UPDATING PATIENT INFORMATION INTO HCHB", IAL_PI_S3="STAGE III - STAGE COMPLETE THE RECORD";
function ialPIStage(r) {
  if (r.at==="thumb") return IAL_PI_S3;
  if (r.at==="hourglass") { const ip=(window.IPT_ROWS||[]).filter(x=>x.at==="hourglass"); return ip.indexOf(r)%2===0 ? IAL_PI_S2 : IAL_PI_S3; }
  return IAL_PI_S2;
}
if (typeof window !== "undefined") window.ialPIStage = ialPIStage;
function ialStageFor(src, r) {
  if (src==="ereferral")    return r.resp==="accepted" ? ((window.IER_STAGES||[])[5] || "Stage VI - Referral Event Notification") : r.resp==="declined" ? "Declined" : "Ineligibility Review";
  if (src==="preeligibility") return r.cov==="accepted" ? "Coverage Confirmed" : r.cov==="declined" ? "Coverage Declined" : "Ineligibility Review";
  return ialPIStage(r);
}

// Queue Added Time = Start Time minus the time spent waiting in the queue.
function ialMinus(s, mins) {
  const m = /^(\d\d\/\d\d\/\d\d) (\d\d):(\d\d) (AM|PM)$/.exec(s||""); if (!m) return "—";
  let t = (+m[2] % 12 + (m[4]==="PM"?12:0)) * 60 + +m[3] - mins; if (t < 0) t = 0;
  const h = Math.floor(t/60), mm = t%60, ap = h>=12?"PM":"AM", h12 = h%12||12;
  return m[1]+" "+String(h12).padStart(2,"0")+":"+String(mm).padStart(2,"0")+" "+ap;
}
function ialMins(s){ const m=/^(\d\d)\/(\d\d)\/(\d\d) (\d\d):(\d\d) (AM|PM)$/.exec(s||""); if(!m) return null; return Date.UTC(2000+ +m[3], +m[1]-1, +m[2])/6e4 + (+m[4]%12+(m[6]==="PM"?12:0))*60 + +m[5]; }
function ialElapsed(from, to){ const a=ialMins(from), b=ialMins(to); if(a==null||b==null||b<a) return "—"; const d=b-a, h=Math.floor(d/60), mm=d%60; return h ? h+"h "+String(mm).padStart(2,"0")+"m" : mm+" Min"; }
// Pre-Validation passes only when all four checks pass after the Episode ID is received.
function ialPreVal(fail) { return { ok:!fail, checks:[["Episode ID",true],["Patient Name",true],["DOB",!fail],["Existing Patient In EHR",!fail]] }; }

// Built on demand so it always reflects the loaded E-referral / Patient intake rows.
function ialRows(tab) {
  const ier = window.IER_ROWS || [], ipt = window.IPT_ROWS || [];
  if (tab === "ereferral") return ier.map((r,i)=>{ const m = ipt.find(x=>x.name===r.name)||{}; const st = r.refDate+" 09:12 AM"; return { ref:"IER"+String(i+1).padStart(9,"0"), src:"ereferral", srcLabel:"E-referral", agency:r.agency||m.agency||"Agency 1", wf:ialWorkflowFor("ereferral",r), stage:ialStageFor("ereferral",r), name:r.name, branch:r.branch, refId:r.refId, atGroup:r.atGroup, atReason:r.atReason, episodeId:m.episodeId||r.episodeId||("EP"+String(70412+i*13)), patientId:m.patientId||r.patientId||String(4002210+i*17), sparcId:m.sparcId||("SPC"+String(208310+i*23)), pre:ialPreVal(r.resp==="ineligible"||r.resp==="exception"), queued:ialMinus(st, 4+(i%3)*3), st, et:r.at==="hourglass"?"—":r.refDate+" 09:41 AM", at:r.at }; }).map(x=>{ const end = x.et!=="—" ? x.et : x.st.slice(0,8)+" 09:45 AM"; return { ...x, retryElapsed: ialElapsed(x.st, end), elapsed: ialElapsed(x.queued, end) }; });
  return ipt.map((r,i)=>{ const st="04/16/25 08:30 AM"; return { ref:"IPT"+String(i+1).padStart(9,"0"), src:"patientintake", srcLabel:"Patient Intake", agency:r.agency, wf:ialWorkflowFor("patientintake",r), stage:ialStageFor("patientintake",r), name:r.name, branch:r.branch, atGroup:r.atGroup, atReason:r.atReason, episodeId:r.episodeId, patientId:r.patientId, sparcId:r.sparcId, pre:ialPreVal(r.preVal==="No"), queued:ialMinus(st, 5+(i%4)*4), st, et:r.at==="hourglass"?"—":"04/16/25 08:58 AM", at:r.at }; }).map(x=>({ ...x, elapsed: ialElapsed(x.queued, x.et!=="—" ? x.et : "04/16/25 09:45 AM") }));
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
  { key:"agency",    label:"Agency" },
  { key:"branch",    label:"Branch" },
  { key:"stage",     label:"Current Stage" },
  { key:"episodeId", label:"Episode ID" },
];
const IAL_EREF_FILTER_FIELDS = [
  { key:"stage",  label:"Current Stage" },
  { key:"branch", label:"Branch" },
  { key:"refId",  label:"Referral ID" },
];
const IAL_COLS = [
  { key:"ref",    label:"E5 ID",         w:"130px", sort:true },
  { key:"agency", label:"Agency",        w:"100px", sort:true },
  { key:"stage",  label:"Current Stage", w:"160px", sort:true },
  { key:"name",   label:"Patient Name",  w:"150px", sort:true },
  { key:"episodeId",label:"Episode ID",  w:"100px", sort:true },
  { key:"patientId",label:"Patient ID",  w:"90px",  sort:true },
  { key:"queued", label:"Queue Added Time", w:"140px", sort:true, freeze:674 },
  { key:"elapsed", label:"Elapsed Time since Transaction Arrived Date", w:"300px", sort:true, freeze:368 },
  { key:"st",     label:"Start Time",    w:"140px", sort:true, freeze:222 },
  { key:"et",     label:"End Time",      w:"140px", sort:true, freeze:76 },
  { key:"at",     label:"AT Status",     w:"70px",  sort:false, align:"center", freeze:0 },
];
const IAL_EREF_COLS = [
  { key:"ref",    label:"E5 ID",         w:"minmax(110px,1.1fr)", sort:true },
  { key:"agency", label:"Agency",        w:"minmax(90px,0.9fr)",  sort:true },
  { key:"stage",  label:"Current Stage", w:"minmax(220px,1.8fr)", sort:true },
  { key:"name",   label:"Patient Name",  w:"minmax(130px,1.3fr)", sort:true },
  { key:"refId",  label:"Referral ID",   w:"minmax(110px,1.1fr)", sort:true },
  { key:"retryElapsed", label:"Elapsed Time since Last Retry", w:"minmax(120px,1fr)", sort:true, wrap:true },
  { key:"elapsed", label:"Elapsed Time since Transaction Arrived Time", w:"minmax(150px,1.1fr)", sort:true, wrap:true },
  { key:"st",     label:"Start Time",    w:"minmax(130px,1.2fr)", sort:true },
  { key:"et",     label:"End Time",      w:"minmax(130px,1.2fr)", sort:true },
  { key:"at",     label:"AT Status",     w:"70px",                sort:false, align:"center" },
];
const ialFrz = (c, bg) => c.freeze===undefined ? {} : { position:"sticky", right:c.freeze+12, zIndex:2, background:bg, alignSelf:"stretch", marginLeft:-6, paddingLeft:8, ...(c.key==="at" ? { marginRight:-12, paddingRight:12, right:0 } : {}), ...(c.key==="queued" ? { boxShadow:"-6px 0 8px -6px rgba(15,23,42,.18)" } : {}) };
function IALATCell({ r }) {
  const ARVATIcon = window.ARVATIcon, H = window.IPTATHover;
  const icon = ARVATIcon ? <ARVATIcon kind={r.at} /> : null;
  const label = { thumb:"Completed", hourglass:"In Progress", warning:"Needs Attention" }[r.at] || "";
  return H ? <H row={r} label={label} icon={icon} /> : icon;
}

const IAL_TABS = [["ereferral","E-referral"],["patientintake","Patient Intake"]];
function IntakeAutomationLogView({ onRefClick }) {
  const [tab, setTabRaw] = useIAL("ereferral");
  const [cardFilter, setCardFilter] = useIAL(null);
  const ALL = ialRows(tab).map(r=>({ ...r, preLabel:r.pre.ok?"Yes":"No" }));
  const [searchQ, setSearchQ] = useIAL("");
  const [sortKey, setSortKey] = useIAL(null);
  const [sortDir, setSortDir] = useIAL("asc");
  const [fieldFilters, setFieldFilters] = useIAL([]);
  const [detail, setDetail] = useIAL(null);
  const openRef = r => { if (tab==="ereferral") { const ir=(window.IER_ROWS||[]).find(x=>x.refId===r.refId); if (ir && window.__openReferralLog) { window.__openReferralLog(ir); return; } } if (tab==="patientintake") { const p=(window.IPT_ROWS||[]).find(x=>x.name===r.name); if (p) { setDetail(p); return; } } onRefClick && onRefClick(r); };
  const setTab = (k) => { setTabRaw(k); setCardFilter(null); setSearchQ(""); setFieldFilters([]); };
  const handleSort = k => { if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else{ setSortKey(k); setSortDir("asc"); } };
  const activeCard = cardFilter ? IAL_SUMMARY_CARDS.find(c=>c.id===cardFilter) : null;
  const filtered = fieldFilters.length ? ALL.filter(r=>fieldFilters.every(f=>f.values.includes(r[f.field]))) : ALL;
  const searched = searchQ ? filtered.filter(r=>Object.values(r).join(" ").toLowerCase().includes(searchQ.toLowerCase())) : filtered;
  const scoped = activeCard ? searched.filter(activeCard.match) : searched;
  const rows = sortKey ? [...scoped].sort((a,b)=>{ const av=a[sortKey]||"", bv=b[sortKey]||""; return sortDir==="asc"?av.localeCompare(bv):bv.localeCompare(av); }) : scoped;

  const ARVFilterBarChips = window.ARVFilterBarChips, ARVSortArrows = window.ARVSortArrows;
  const COLS = tab==="ereferral" ? IAL_EREF_COLS : IAL_COLS, GRID = COLS.map(c=>c.w).join(" ");
  const wide = tab!=="ereferral";
  const pad = n=>String(n).padStart(2,"0");

  return (
    <div style={{background:"#fff",minHeight:"100%"}}>
      {ARVFilterBarChips && <ARVFilterBarChips dateLabel={tab==="ereferral" ? "Transaction Initiated Date : 04/01/25 – 04/30/25" : "Patient Intake Init. Date : 04/01/25 – 04/30/25"} hideSearch={false} searchValue={searchQ} onSearch={setSearchQ} filterFields={tab==="ereferral"?IAL_EREF_FILTER_FIELDS:IAL_FILTER_FIELDS} filterRows={ALL} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters} onClearFilters={fieldFilters.length?()=>setFieldFilters([]):null} />}
      <div style={{padding:"20px 32px 0"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,flexWrap:"wrap",marginBottom:12}}>
          <div>
            <div style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Automation Log</div>
            <div style={{font:"400 13px/18px Roboto",color:"#3A424A",marginTop:8}}>Transaction Status of {tab==="ereferral"?"E-referral":"Patient Intake"} Workflows</div>
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
          Click E5 ID to view the related {tab==="ereferral"?"E-referral":"Patient Intake"} transaction
        </div>
        <div style={{overflow:"auto",maxHeight:"calc(100vh - 300px)"}}>
        <div style={{width:wide?"max-content":"auto",minWidth:"100%"}}>
        <div style={{display:"grid",gridTemplateColumns:GRID,alignItems:"stretch",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",minHeight:44,padding:"0 12px",gap:6,position:"sticky",top:0,zIndex:3}}>
          {COLS.map(c=>(
            <div key={c.key} onClick={c.sort?()=>handleSort(c.key):undefined}
              style={{display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",gap:3,font:"500 11px/14px Roboto",color:"#64748b",whiteSpace:c.wrap?"normal":"nowrap",cursor:c.sort?"pointer":"default",userSelect:"none",overflow:"hidden",padding:"0 2px",...ialFrz(c,"#f8fafc")}}>
              {c.sort&&ARVSortArrows&&<ARVSortArrows active={sortKey===c.key} dir={sortDir} />}
              {c.label}
            </div>
          ))}
        </div>
        <div style={{paddingTop:6}}>
          {rows.length===0
            ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>No records match.</div>
            : rows.map((r,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:GRID,alignItems:"center",minHeight:52,padding:"6px 12px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:6,background:"#fff",boxShadow:"0 1px 2px rgba(15,23,42,0.03)",gap:6,position:"relative"}}>
                <div style={{position:"absolute",left:8,top:8,bottom:8,width:3,background:"#6660A6",borderRadius:2}}></div>
                {COLS.map(c=> c.key==="ref" ? (
                  <div key={c.key} style={{font:"500 12px/16px Roboto",color:"#2563eb",cursor:"pointer",paddingLeft:18,display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden"}} onClick={()=>openRef(r)}>{r.ref}</div>
                ) : c.key==="at" ? (
                  <div key={c.key} style={{display:"flex",alignItems:"center",justifyContent:"center",...ialFrz(c,"#fff")}}><IALATCell r={r} /></div>
                ) : c.key==="preLabel" ? (
                  <div key={c.key} style={{display:"flex",alignItems:"center",justifyContent:"center"}} title={r.pre.checks.map(x=>x[0]+": "+(x[1]?"Yes":"No")).join("\n")}>
                    <span style={{padding:"1px 10px",borderRadius:999,font:"500 11px/16px Roboto",background:r.pre.ok?"#E6F7E0":"#FBE4E4",border:`1px solid ${r.pre.ok?"#9FCB8A":"#E8A1A1"}`,color:r.pre.ok?"#1F7A3A":"#B92D2D",cursor:"default"}}>{r.preLabel}</span>
                  </div>
                ) : (
                  <div key={c.key} style={{font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,padding:"0 2px",...ialFrz(c,"#fff")}}>{r[c.key]}</div>
                ))}
              </div>
            ))}
        </div>
        </div>
        </div>
        <div>
          <div style={{padding:"12px 0",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} of {ALL.length} records shown</div>
        </div>
        {detail && window.IntakePatientDetail && <window.IntakePatientDetail row={detail} initialLog={true} onClose={()=>setDetail(null)} />}
      </div>
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { IntakeAutomationLogView });
