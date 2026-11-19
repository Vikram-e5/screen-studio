// Intake — Patient Intake View. "Style B" — AT status only, no clickable
// status-summary cards.
const { useState: useIPT } = React;

const IPT_ROWS = [
  { id:"it1",  mrn:"MRN20457947", refHub:"CarePort", name:"Marvin Mckinney",    dob:"04/02/1958", branch:"Bcode", agency:"Agency 1", policy:"POL1152135", plan:"Aetna Medicare",  sendFac:"Silver Cross ED", zip:"60441", gw:"Availity", ehrSync:true,  at:"thumb",     alerts:0, docs:true,  gender:"Female", episodeId:"Epi23456", chartStage:"Chart Completed", chartPct:100, arrivedDate:"04/15/25 08:02 AM", endDate:"04/15/25 08:31 AM", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[] },
  { id:"it2",  mrn:"MRN20458084", refHub:"Forcura", name:"Esther Howard",      dob:"11/19/1966", branch:"Bcode", agency:"Agency 1", policy:"POL1152136", plan:"Texas Medicaid",  sendFac:"St. Luke's ICU",  zip:"77002", gw:"",         ehrSync:false, at:"hourglass",   alerts:1, docs:false, gender:"Female", episodeId:"I1J2K3L4", alertItems:[{text:"Payor Source - Add Payor Source details -> Unable to enter Payor Source details.",desc:"Error while entering value in Payor Type field & Unable to proceed further as we are unable to enter information under Payor Source tab"}], chartStage:"Chart In Progress", chartPct:35, arrivedDate:"04/16/25 09:10 AM", endDate:"", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[{loc:"Clinical - Patient Information details -> Unable to update Initial Documentation Status/Pending Reason ,",desc:"Unprocessed tabs: Demographics, Scheduling, Diagnoses, Physicians"}] },
  { id:"it3",  mrn:"MRN20458221", refHub:"Epic Care Link", name:"Cameron Williamson", dob:"02/27/1971", branch:"Bcode", agency:"Agency 1", policy:"POL1152137", plan:"Humana",          sendFac:"Rush Copley Rehab", zip:"60540", gw:"Availity", ehrSync:true, at:"hourglass", alerts:0, docs:false, gender:"Male",   episodeId:"TY964257", chartStage:"Chart In Progress", chartPct:60, arrivedDate:"04/19/25 10:00 AM", endDate:"", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[] },
  { id:"it4",  mrn:"MRN20458358", refHub:"Ensocare", name:"Leslie Alexander",   dob:"06/09/1949", branch:"Bcode", agency:"Agency 1", policy:"POL1152138", plan:"Medicare",        sendFac:"Advocate Christ ED", zip:"60453", gw:"Inovalon", ehrSync:false, at:"hourglass", alerts:2, docs:true,  gender:"Female", episodeId:"K7L8M9N0", alertItems:[{text:"Secondary plan unverified",desc:"Only the primary plan returned an active 271 response."},{text:"Auth number not returned",desc:"Payor accepted the request but has not issued an authorization number."}], chartStage:"Chart In Progress", chartPct:70, arrivedDate:"04/22/25 07:44 AM", endDate:"", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[{loc:"Clinical - Patient Information details -> Unable to update Initial Documentation Status/Pending Reason ,",desc:"Unprocessed tabs: Demographics, Scheduling, Diagnoses, Physicians"}] },
  { id:"it5",  mrn:"MRN20458495", refHub:"CarePort", name:"Robert Fox",         dob:"01/14/1963", branch:"Bcode", agency:"Agency 1", policy:"POL1152139", plan:"UHC",             sendFac:"Elmhurst Med Surg", zip:"60126", gw:"UHC",      ehrSync:true,  at:"thumb",     alerts:0, docs:true,  gender:"Male",   episodeId:"G3H4I5J6", chartStage:"Chart Completed", chartPct:100, arrivedDate:"04/18/25 09:05 AM", endDate:"04/18/25 09:38 AM", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[] },
  { id:"it6",  mrn:"MRN20458632", refHub:"Forcura", name:"Jenny Wilson",       dob:"09/30/1957", branch:"Bcode", agency:"Agency 1", policy:"POL1152140", plan:"Humana",          sendFac:"Northwestern Cards", zip:"60611", gw:"Availity", ehrSync:true, at:"thumb",     alerts:0, docs:true,  gender:"Female", episodeId:"M5N6O7P8", chartStage:"Chart Completed", chartPct:100, arrivedDate:"04/24/25 08:12 AM", endDate:"04/24/25 08:40 AM", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[] },
  { id:"it7",  mrn:"MRN20458769", refHub:"Epic Care Link", name:"Jacob Jones",        dob:"05/03/1980", branch:"Bcode", agency:"Agency 1", policy:"POL1152141", plan:"Aetna",           sendFac:"Loyola Ortho",     zip:"60153", gw:"Waystar",  ehrSync:false, at:"hourglass",   alerts:0, docs:false, gender:"Male",   episodeId:"Y7Z8A9B0", chartStage:"Chart In Progress", chartPct:25, arrivedDate:"04/21/25 07:50 AM", endDate:"", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[{loc:"Clinical - Patient Information details -> Unable to update Initial Documentation Status/Pending Reason ,",desc:"Unprocessed tabs: Demographics, Scheduling, Diagnoses, Physicians"}] },
  { id:"it8",  mrn:"MRN20458906", refHub:"Ensocare", name:"Guy Hawkins",        dob:"08/21/1969", branch:"Bcode", agency:"Agency 1", policy:"POL1152142", plan:"UHC",             sendFac:"Amita St Alexius ED", zip:"60067", gw:"UHC",   ehrSync:true,  at:"thumb",     alerts:0, docs:true,  gender:"Male",   episodeId:"A3B4C5D6", chartStage:"Chart Completed", chartPct:100, arrivedDate:"04/23/25 08:22 AM", endDate:"04/23/25 08:49 AM", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[] },
  { id:"it9",  mrn:"MRN20459043", refHub:"CarePort", name:"Jane Cooper",        dob:"03/11/1975", branch:"Bcode", agency:"Agency 1", policy:"POL1152143", plan:"Aetna",           sendFac:"Edward Hosp Rehab", zip:"60563", gw:"Waystar",  ehrSync:true,  at:"hourglass", alerts:0, docs:false, gender:"Female", episodeId:"Q9R0S1T2", chartStage:"Chart In Progress", chartPct:45, arrivedDate:"04/17/25 08:47 AM", endDate:"", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[] },
  { id:"it10", mrn:"MRN20459180", refHub:"Forcura", name:"Kristin Watson",     dob:"12/05/1961", branch:"Bcode", agency:"Agency 1", policy:"POL1152144", plan:"Humana",          sendFac:"Adventist LaGrange ED", zip:"60525", gw:"Availity", ehrSync:false, at:"hourglass", alerts:1, docs:false, gender:"Female", episodeId:"TY964258", alertItems:[{text:"Auth number not returned",desc:"Payor accepted the request but has not issued an authorization number."}], chartStage:"Chart In Progress", chartPct:40, arrivedDate:"04/25/25 09:31 AM", endDate:"", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[{loc:"Clinical - Patient Information details -> Unable to update Initial Documentation Status/Pending Reason ,",desc:"Unprocessed tabs: Demographics, Scheduling, Diagnoses, Physicians"}] },
  { id:"it11", mrn:"MRN20459317", refHub:"CarePort", name:"Darlene Robertson", dob:"07/18/1954", branch:"Bcode", agency:"Agency 1", policy:"POL1152145", plan:"Medicare", sendFac:"Silver Cross ED", zip:"60441", gw:"Availity", ehrSync:false, at:"warning", alerts:0, docs:false, gender:"Female", episodeId:"W1X2Y3Z4", chartStage:"", chartPct:null, arrivedDate:"04/26/25 08:05 AM", endDate:"", terminatedOn:"04/26/25 08:12 AM", reasonTermination:"Patient already exists in EHR — duplicate referral.", reasonFailure:"", failedOn:"", atGroup:"terminated", atReason:"Patient already exists in EHR — duplicate referral.", errorReasons:[] },
  { id:"it12", mrn:"MRN20459454", refHub:"Forcura", name:"Courtney Henry", dob:"10/02/1968", branch:"Bcode", agency:"Agency 1", policy:"POL1152146", plan:"Aetna", sendFac:"Rush Copley Rehab", zip:"60540", gw:"Waystar", ehrSync:false, at:"warning", alerts:0, docs:false, gender:"Female", episodeId:"E5F6G7H8", chartStage:"", chartPct:null, arrivedDate:"04/27/25 09:20 AM", endDate:"", terminatedOn:"", reasonTermination:"", reasonFailure:"EHR session timed out before chart creation.", failedOn:"04/27/25 09:26 AM", atGroup:"failed", atReason:"EHR session timed out before chart creation.", errorReasons:[] },
  { id:"it13", mrn:"MRN20459591", refHub:"Epic Care Link", name:"Ralph Edwards", dob:"02/14/1959", branch:"Bcode", agency:"Agency 1", policy:"POL1152147", plan:"Humana", sendFac:"Loyola Ortho", zip:"60153", gw:"Availity", ehrSync:true, at:"hourglass", alerts:0, docs:false, gender:"Male", episodeId:"J9K0L1M2", chartStage:"", chartPct:null, arrivedDate:"04/28/25 07:58 AM", endDate:"", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[] },
  { id:"it14", mrn:"MRN20459728", refHub:"Ensocare", name:"Theresa Webb", dob:"12/23/1972", branch:"Bcode", agency:"Agency 1", policy:"POL1152148", plan:"UHC", sendFac:"Elmhurst Med Surg", zip:"60126", gw:"UHC", ehrSync:true, at:"hourglass", alerts:0, docs:false, gender:"Female", episodeId:"N3O4P5Q6", chartStage:"", chartPct:null, arrivedDate:"04/28/25 08:34 AM", endDate:"", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[] },
  { id:"it15", mrn:"MRN20459865", refHub:"CarePort", name:"Arlene McCoy", dob:"05/30/1965", branch:"Bcode", agency:"Agency 1", policy:"POL1152149", plan:"Aetna Medicare", sendFac:"Northwestern Cards", zip:"60611", gw:"Availity", ehrSync:true, at:"hourglass", alerts:0, docs:false, gender:"Female", episodeId:"R7S8T9U0", chartStage:"", chartPct:null, arrivedDate:"04/29/25 09:02 AM", endDate:"", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[] },
  { id:"it16", mrn:"MRN20460002", refHub:"Forcura", name:"Harlow Quenby", dob:"09/14/1956", branch:"Bcode", agency:"Agency 1", policy:"POL1152150", plan:"Humana", sendFac:"Maple Ridge Rehab", zip:"60490", gw:"Availity", ehrSync:false, at:"warning", alerts:0, docs:false, gender:"Female", episodeId:"V4W5X6Y7", chartStage:"Chart In Progress", chartPct:84, arrivedDate:"04/29/25 10:14 AM", endDate:"", terminatedOn:"04/29/25 10:27 AM", reasonTermination:"Incomplete Chart update, Please complete", reasonFailure:"", failedOn:"", atGroup:"terminated", atReason:"Incomplete Chart update, Please complete", errorReasons:[
    {loc:"",desc:"Payor Source - Add Payor Source details -> Unable to enter Payor Source details. Error while entering value in Additional Information field"},
    {loc:"",desc:"Payor Source - Add Payor Source details -> Unable to enter Payor Source details. Error while entering value in Payor Type field"},
    {loc:"",desc:"Payor Source - Add Payor Source details -> Unable to enter Payor Source details. Error while entering value in Payor Source field"},
    {loc:"",desc:"Unable to proceed further as we are unable to enter information under Payor Source tab"}] },
];
IPT_ROWS.forEach((r,i)=>{
  r.patientId = r.patientId || String(4001234+i*17);
  r.sparcId = r.sparcId || ("SPC"+String(208310+i*23));
  const ok = r.ehrSync;
  r.ehrTasks = r.ehrTasks || [
    ["Task 1 Stage Completion", ok || !(r.chartStage==="Chart Failed" && r.chartPct<30)],
    ["Task 2 Stage Completion", ok || r.chartStage==="Chart Terminated"],
    ["Upload Attachments", ok],
  ];
  if (r.name==="Marvin Mckinney") r.ehrTasks = r.ehrTasks.filter(t=>t[0]!=="Upload Attachments");
  if (r.name==="Robert Fox") r.ehrTasks = [["Task 1 Stage Completion", true], ["Task 2 Stage", "No Records Found"]];
  if (r.name==="Jenny Wilson" || r.name==="Guy Hawkins") r.ehrTasks = r.ehrTasks.filter(t=>t[0]==="Upload Attachments");
  if (r.name==="Courtney Henry") { const m="Error due to technical issue"; r.reasonFailure=m; r.atReason=m; r.errorReasons=[]; r.ehrTasks=[["Upload Attachments", false]]; }
  if (r.name==="Darlene Robertson") { const m="Unable to access clinical input window"; r.reasonTermination=m; r.atReason=m; r.errorReasons=[{"loc":"","desc":"Attachments - Upload Attachment -> Unable to download attachment file."},{"loc":"","desc":"Clinical details -> Unable to enter Clinical details. Facility field is unavailable in the task payload."},{"loc":"","desc":"Clinical - Other Facilities details -> Unable to enter Clinical details. Facility Type information is unavailable in the task payload"},{"loc":"","desc":"Payor Source - Add Payor Source details -> Unable to enter Payor Source details. Error while entering value in Additional Information field"},{"loc":"","desc":"Payor Source - Add Payor Source details -> Unable to enter Payor Source details. Error while entering value in Payor Type field"},{"loc":"","desc":"Payor Source - Add Payor Source details -> Unable to enter Payor Source details. Error while entering value in Payor Source field"},{"loc":"","desc":"Referral Source - Referral Information details -> Unable to enter Referral Source details. Error while entering value in Referral Facility field"},{"loc":"","desc":"Referral Source details -> Unable to process Menu Referral Source. Mandatory fields are not updated"},{"loc":"","desc":"Referral Source - Care Types details -> Unable to enter Referral Source details. Error while entering value in Care type field"},{"loc":"","desc":"Referral Source - Care Types details -> Unable to enter Referral Source details. Error while entering value in Effective From field"},{"loc":"","desc":"Demographics Service Location details -> Unable to enter Demographics > Service Location details. Error while entering value in Service Location Type field"},{"loc":"","desc":"Demographics Service Location details -> Unable to enter Demographics details. Error while entering value Street field"},{"loc":"","desc":"Demographics Service Location details -> Unable to enter Demographics details. Error while entering value in city field"},{"loc":"","desc":"Demographics Service Location details -> Unable to enter Demographics details. Error while entering value in State field"},{"loc":"","desc":"Demographics Service Location details -> Unable to enter Demographics details. Error while entering value in zip code field"},{"loc":"","desc":"Demographics Emergency Contact details -> Unable to enter Demographics details. Error while entering value in First Name field"},{"loc":"","desc":"Demographics Emergency Contact details -> Unable to enter Demographics details. Error while entering value in Last Name field"},{"loc":"","desc":"Demographics Emergency Contact details -> Unable to enter Demographics details. Error while entering value in Patient Contact Type field"},{"loc":"","desc":"Unable to access clinical input window"}]; r.ehrDash=true; r.ehrTasks=[["Upload Attachments", "—"]]; }
  if (r.at==="hourglass") { r.errorReasons=(r.errorReasons||[]).filter(e=>!/Unprocessed tabs/.test(e.desc||"")); r.ehrDash=true; r.ehrTasks=r.ehrTasks.filter(t=>t[0]!=="Upload Attachments").map(t=>[t[0],"—"]); }
  if (r.at==="warning") { r.ehrDash=true; r.ehrTasks=[["Upload Attachments", "—"]]; }
  if (r.chartPct==null || r.chartPct==="") r.chartPct = 0;
  r.chartLabel = r.chartPct + "%";
  r.preVal = r.preVal || (r.chartStage==="Chart Terminated"||(r.chartPct!=null&&r.chartPct<30)||r.atGroup==="terminated" ? "No" : "Yes");
  if (r.at==="warning" && !r.atReason) {
    r.atGroup = r.chartStage==="Chart Terminated" ? "terminated" : "failed";
    r.atReason = r.atGroup==="terminated" ? (r.reasonTermination||"Intake stopped") : (r.reasonFailure||"Chart creation failed in EHR");
  }
});
function computeIptNA(rows) {
  const term={}, fail={};
  rows.forEach(r=>{ if(r.at!=="warning") return; const m = r.atGroup==="failed" ? fail : term; m[r.atReason]=(m[r.atReason]||0)+1; });
  const sorted=m=>Object.entries(m).sort((a,b)=>b[1]-a[1]), sum=l=>l.reduce((s,x)=>s+x[1],0);
  const termReasons=sorted(term), failReasons=sorted(fail);
  return { termReasons, failReasons, termTotal:sum(termReasons), failTotal:sum(failReasons) };
}
const IPT_FILTER_FIELDS = [
  { key:"agency",     label:"Agency" },
  { key:"branch",     label:"Branch" },
  { key:"episodeId",  label:"Episode ID" },
  { key:"chartLabel", label:"Chart Status" },
];
const iptHasChart = r => r.chartPct!==null && r.chartPct!==undefined && r.chartPct!=="";
const IPT_CHART_FILTERS = { completed:{ label:"Charts Update Completed", match:iptHasChart }, pending:{ label:"Chart % less than 100", match:r=>iptHasChart(r)&&Number(r.chartPct)<100 } };
// AT status icon with hover reason (Needs Attention → Terminated/Failed - reason).
function IPTATHover({ row, icon, label, size=18 }) {
  const [pos, setPos] = useIPT(null);
  const txt = row.at==="warning" ? (row.atGroup==="failed"?"Failed":"Terminated") + " - " + (row.atReason||"Reason not recorded") : label;
  return (
    <span onMouseEnter={e=>{ const b=e.currentTarget.getBoundingClientRect(); setPos({ x:Math.min(b.left+b.width/2, window.innerWidth-150), y:b.bottom+6 }); }} onMouseLeave={()=>setPos(null)} style={{display:"inline-flex",padding:2}}>
      {icon}
      {pos && <span style={{position:"fixed",left:pos.x,top:pos.y,transform:"translateX(-50%)",zIndex:950,maxWidth:280,background:"#1F2530",color:"#fff",borderRadius:6,padding:"7px 10px",font:"400 12px/17px Roboto",boxShadow:"0 6px 18px rgba(28,45,66,.2)",pointerEvents:"none",whiteSpace:"normal"}}>{row.at==="warning" && <span style={{fontWeight:500,color:"#FCD34D"}}>Needs Attention · </span>}{txt}</span>}
    </span>
  );
}
if (typeof window !== "undefined") window.IPTATHover = IPTATHover;
if (typeof window !== "undefined") window.IPT_ROWS = IPT_ROWS;

function IPTFilterBar({ search, onSearch }) {
  return (
    <div style={{background:"#eef4fb",borderBottom:"1px solid #e2e8f0",padding:"10px 24px",display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap"}}>
      <button type="button" style={{background:"#fff",border:"1px solid #d8d8d8",borderRadius:4,padding:"5px 12px",font:"400 12px/16px Roboto",color:"#0f172a",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,flexShrink:0,whiteSpace:"nowrap"}}>
        Intake Date : 04/01/25 – 04/30/25<span style={{color:"#94a3b8",fontSize:9}}>▾</span>
      </button>
      <button type="button" style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:6,padding:"5px 4px",whiteSpace:"nowrap"}}>
        <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:"#2563eb",color:"#fff",fontSize:10,fontWeight:600,lineHeight:1}}>+</span>
        Add More Filters
      </button>
      <div style={{flex:1}}></div>
      <div style={{position:"relative",flexShrink:0}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" value={search} onChange={e=>onSearch(e.target.value)} placeholder="Search Patient Records" style={{width:240,background:"#fff",border:"1px solid #93c5e8",borderRadius:6,padding:"6px 12px 6px 30px",font:"400 12px/16px Roboto",color:"#0f172a",outline:"none"}} />
      </div>
    </div>
  );
}

// ── Title cluster + AT-status-only clickable summary cards ("Style B") ──
// Mirrors the Automation Log's clickable summary card format exactly.
const IPT_AT_CARDS = [
  { id:"all",        label:"All Patients", color:"rgb(21,95,130)",   match:()=>true,                icon:null },
  { id:"thumb",      label:"Completed",       color:"rgb(14,165,233)",  match:(r)=>r.at==="thumb",     get icon(){ return (window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png"; } },
  { id:"warning",    label:"Needs Attention", color:"rgb(245,158,11)",  match:(r)=>r.at==="warning",   get icon(){ return (window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png"; } },
  { id:"hourglass",  label:"In Progress",     color:"rgb(148,163,184)", match:(r)=>r.at==="hourglass", get icon(){ return (window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png"; } },
];
function IPTTitleCluster({ allRows, atFilter, onFilter, review, reasonFilter, onReasons }) {
  const pad = n=>String(n).padStart(2,"0");
  const [openMenu, setOpenMenu] = useIPT(false);
  const menuRef = React.useRef(null);
  React.useEffect(()=>{ if(!openMenu) return; const h=e=>{ if(menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[openMenu]);
  const NAMenu = window.ARVNeedsAttentionMenu;
  const eff = review ? "warning" : atFilter;
  return (
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,width:"100%",flexWrap:"wrap"}}>
      <div>
        <span style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Patient Intake View</span>
        <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Status of Patient Intake Records Received from Referral Sources</div>
        <div style={{marginTop:10,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block"}}>Click Patient Name to view related intake details</div>
      </div>
      <div style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",flexShrink:0,marginLeft:"auto"}}>
        <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",borderRadius:"8px 0 0 8px",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333",flexShrink:0}}>
          <span>Automation</span><span>(AT) Status</span>
        </div>
        <div style={{display:"flex",alignItems:"flex-start"}}>
          {IPT_AT_CARDS.map(c=>{
            const isAll=c.id==="all", active=!isAll&&eff===c.id;
            const dim=eff&&eff!=="all"&&!active;
            const locked=review&&!active;
            const isNA=c.id==="warning";
            const val=isNA&&reasonFilter&&reasonFilter.length ? allRows.filter(r=>r.at==="warning"&&reasonFilter.includes(r.atReason)).length : allRows.filter(c.match).length;
            return (
              <div key={c.id} ref={isNA?menuRef:undefined} role="button" aria-disabled={locked||undefined} onClick={locked||review?undefined:()=>onFilter(active||isAll?null:c.id)}
                style={{position:"relative",flex:"0 0 auto",padding:"10px 16px 12px",cursor:locked?"not-allowed":review?"default":"pointer",opacity:(dim&&!isAll)||(locked&&isAll)?0.35:1,transition:"opacity .12s,background .12s",background:active?"#f8fafc":"transparent"}}
                onMouseEnter={e=>{if(!active&&!dim)e.currentTarget.style.background="#fafbfc";}}
                onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent";}}>
                <div style={{height:3,borderRadius:2,background:c.color,opacity:active?1:0.85,marginBottom:8,marginLeft:-9,marginRight:-9}}></div>
                <div style={{display:"flex",alignItems:"center",gap:5,font:"400 12px/16px Roboto",color:(dim&&isAll)?"#b0b0b0":"#333",whiteSpace:"nowrap"}}>
                  {c.icon&&<img src={c.icon} alt="" style={{width:14,height:14,objectFit:"contain",flexShrink:0}} />}
                  {c.label}
                  {isNA && <span title="Sub-status breakdown" onClick={e=>{ e.stopPropagation(); setOpenMenu(o=>!o); }} style={{width:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#2563eb"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 8 L19 8 L12 17 Z" fill="currentColor" /></svg></span>}
                </div>
                <div style={{font:"600 18px/22px Roboto",color:(dim&&isAll)?"#b0b0b0":isNA?"#d97706":"#0f172a",marginTop:4}}>{pad(val)}</div>
                {isNA && openMenu && NAMenu && <NAMenu na={computeIptNA(allRows)} selectedReasons={reasonFilter} onApply={sel=>{ onReasons(sel&&sel.length?sel:null); if(!review) onFilter("warning"); }} naCount={allRows.filter(r=>r.at==="warning").length} onClose={()=>setOpenMenu(false)} />}
                {!review&&atFilter&&atFilter!=="all"&&isAll&&<button type="button" onClick={e=>{e.stopPropagation();onFilter(null);}} style={{marginTop:4,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}><span style={{fontSize:11}}>↻</span>Reset</button>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function IPTDocIcon({ size=18, faded=false }) {
  return <img src={(window.__resources&&window.__resources.attachmentType)||"icons/attachment-type.svg"} width={size} height={size} alt="" style={{display:"block",opacity:faded?0.35:1}} aria-hidden="true" />;
}
function IPTEHRSyncBadge({ synced }) {
  return synced
    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 9 18 20 6"/></svg>
    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>;
}

// EHR Sync cell — hover opens a popover with per-task stage completion.
function IPTEHRSyncCell({ row }) {
  const [pos, setPos] = useIPT(null);
  const show = e => { const b=e.currentTarget.getBoundingClientRect(); setPos({ x:Math.min(b.left+b.width/2, window.innerWidth-150), y:b.bottom+6 }); };
  return (
    <span onMouseEnter={show} onMouseLeave={()=>setPos(null)} style={{display:"inline-flex",padding:4,cursor:"default"}}>
      {row.ehrDash ? <span style={{color:"#94a3b8",font:"500 12px/16px Roboto"}}>—</span> : <IPTEHRSyncBadge synced={row.ehrSync} />}
      {pos && (
        <div style={{position:"fixed",left:pos.x,top:pos.y,transform:"translateX(-50%)",zIndex:950,background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,boxShadow:"0 6px 20px rgba(28,45,66,.14)",padding:"10px 14px",width:270,pointerEvents:"none",whiteSpace:"normal"}}>
          <div style={{font:"500 12px/16px Roboto",color:"#0f172a",marginBottom:8}}>EHR Sync</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {row.ehrTasks.map(([l,ok],i)=>(
              <div key={l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,paddingTop:(i>0&&l==="Upload Attachments")?8:0,borderTop:(i>0&&l==="Upload Attachments")?"1px solid #EEF0F3":"none"}}>
                <span style={{font:"400 12px/16px Roboto",color:"#3A424A"}}>{l}</span>
                {ok==="—" ? <span style={{color:"#94a3b8",font:"500 12px/16px Roboto"}}>—</span> : <span style={{padding:"1px 10px",borderRadius:999,font:"500 11px/16px Roboto",background:typeof ok==="string"?"#F1F5F9":ok?"#E6F7E0":"#FBE4E4",border:`1px solid ${typeof ok==="string"?"#CBD5E1":ok?"#9FCB8A":"#E8A1A1"}`,color:typeof ok==="string"?"#475569":ok?"#1F7A3A":"#B92D2D",whiteSpace:"nowrap"}}>{typeof ok==="string"?ok:ok?"Success":"Failed"}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </span>
  );
}

const IPT_COLS = [
  { key:"name",    label:"Patient Name",  grid:"minmax(120px,1.3fr)" },
  { key:"agency",  label:"Agency",        grid:"minmax(84px,0.8fr)" },
  { key:"branch",  label:"Branch",        grid:"minmax(64px,0.6fr)" },
  { key:"mrn",     label:"MRN",           grid:"minmax(100px,1fr)" },
  { key:"episodeId",label:"Episode ID",   grid:"minmax(84px,0.8fr)" },
  { key:"patientId",label:"Patient ID",   grid:"minmax(84px,0.8fr)" },
  { key:"ehrSync", label:"EHR Sync",      grid:"80px", align:"center" },
  { key:"chart",   label:"Chart Status",  grid:"minmax(96px,0.9fr)", align:"center" },
  { key:"at",      label:"AT Status",     grid:"80px", align:"center" },
  { key:"reviewed",label:"Reviewed?",     grid:"78px", align:"center" },
];
const IPT_GRID = IPT_COLS.map(c=>c.grid).join(" ");

function IPTCheckbox({ checked, onToggle, accent="#2563eb", locked }) {
  if (locked) accent = "#BFC5CD";
  return <span role="checkbox" aria-checked={!!checked} aria-disabled={locked||undefined} tabIndex={locked?-1:0} title={locked?"Reviewed":undefined} onClick={locked?undefined:onToggle} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:`1px solid ${checked?accent:"#d8d8d8"}`,borderRadius:3,background:checked?accent:(locked?"#f1f3f5":"#fff"),cursor:locked?"not-allowed":"pointer"}}>{checked && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}</span>;
}

function IPTAlertsSlideout({ row, alertReviewed, onToggleAlert, onClose }) {
  const items = row.alertItems || [];
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.18)"}} />
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:520,background:"#fff",zIndex:901,display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.13)",animation:"iptAlertsSlide .22s cubic-bezier(0.32,0.72,0,1)"}}>
        <style>{`@keyframes iptAlertsSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 16px"}}>
          <span style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Intake Alerts</span>
          <button onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",padding:4,color:"#64748b",font:"400 20px/18px Roboto"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px",padding:"0 24px 16px",borderBottom:"1px solid #e5e7eb"}}>
          {[["Patient Name",row.name],["MRN",row.mrn],["Episode ID",row.episodeId]].map(([l,v])=>(
            <div key={l}><div style={{font:"400 11px Roboto",color:"#94a3b8",marginBottom:2}}>{l}</div><div style={{font:"500 12px Roboto",color:"#0f172a"}}>{v}</div></div>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 90px",padding:"12px 24px",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",font:"500 11px/14px Roboto",color:"#64748b"}}>
            <div>ALERT</div><div>DESCRIPTION</div><div style={{textAlign:"center"}}>REVIEWED</div>
          </div>
          {items.length===0
            ? <div style={{padding:"32px 24px",textAlign:"center",color:"#94a3b8",font:"400 13px Roboto"}}>No alerts for this patient.</div>
            : items.map((a,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 2fr 90px",padding:"14px 24px",borderBottom:"1px solid #f1f5f9",alignItems:"center"}}>
                <div style={{font:"500 13px/18px Roboto",color:"#dc2626"}}>{a.text}</div>
                <div style={{font:"400 13px/18px Roboto",color:"#334155",paddingRight:12}}>{a.desc}</div>
                <div style={{display:"flex",justifyContent:"center"}}><IPTCheckbox checked={!!(alertReviewed[row.id]&&alertReviewed[row.id][i])} onToggle={()=>onToggleAlert(row.id,i,items.length)} /></div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

function IPTChartPill({ row, onClick }) {
  const c = row.at==="warning" ? (row.terminatedOn?"#475569":"#dc2626") : row.at==="hourglass" ? "#64748b" : "#16a34a";
  if (!iptHasChart(row)) return <span style={{color:"#94a3b8"}}>—</span>;
  return <span style={{color:c,font:"500 12px/16px Roboto"}}>{row.chartPct}%</span>;
}

function IPTChartStatusSlideout({ row, onClose }) {
  const fields = [["Current Stage",row.chartStage],["Transaction Arrived Date",row.arrivedDate],["Transaction End Date",row.endDate],["Terminated On",row.terminatedOn],["Reason for Termination",row.reasonTermination],["Reason for Failure",row.reasonFailure],["Failed On",row.failedOn]];
  const errors = row.errorReasons || [];
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.18)"}} />
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:520,background:"#fff",zIndex:901,display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.13)",animation:"iptChartSlide .22s cubic-bezier(0.32,0.72,0,1)"}}>
        <style>{`@keyframes iptChartSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 16px"}}>
          <span style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Chart Status</span>
          <button onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",padding:4,color:"#64748b",font:"400 20px/18px Roboto"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px",padding:"0 24px 16px",borderBottom:"1px solid #e5e7eb"}}>
          {[["Patient Name",row.name],["MRN",row.mrn],["Episode ID",row.episodeId]].map(([l,v])=>(
            <div key={l}><div style={{font:"400 11px Roboto",color:"#94a3b8",marginBottom:2}}>{l}</div><div style={{font:"500 12px Roboto",color:"#0f172a"}}>{v}</div></div>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"18px 24px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16,marginBottom:24}}>
            {fields.map(([label,v])=>(
              <div key={label}>
                <div style={{font:"400 11px Roboto",color:"#94a3b8",marginBottom:3}}>{label}</div>
                <div style={{font:"500 12px/17px Roboto",color:"#0f172a"}}>{v || <span style={{color:"#94a3b8"}}>—</span>}</div>
              </div>
            ))}
          </div>
          <div style={{font:"600 11px/16px Roboto",color:"#64748b",letterSpacing:".04em",marginBottom:10}}>ERROR REASONS</div>
          {errors.length===0
            ? <div style={{padding:"16px",textAlign:"center",color:"#94a3b8",font:"400 13px Roboto",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6}}>No error reasons recorded.</div>
            : errors.map((e,i)=>(
              <div key={i} style={{display:"flex",gap:12,padding:"12px 14px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,marginBottom:8}}>
                <span style={{font:"700 12px/18px Roboto",color:"#dc2626",flexShrink:0}}>{String(i+1).padStart(2,"0")}</span>
                <div style={{font:"400 13px/19px Roboto",color:"#334155"}}><span style={{color:"#dc2626",fontWeight:500}}>{e.loc}</span> {e.desc}</div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

function IPTRow({ row, onNameClick, onDocsClick, onAlertsClick, onChartClick, reviewed, onReviewed, bulkMode, selected, onSelect }) {
  const cell = (align) => ({font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",justifyContent:align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0});
  const dash = <span style={{color:"#94a3b8"}}>—</span>;
  const errs = row.errorReasons || [];
  return (
    <div style={{marginBottom:8}}>
      <div style={{display:"grid",gridTemplateColumns:IPT_GRID,alignItems:"center",height:48,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:6,boxShadow:"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",gap:6}}>
        <div style={{...cell(),gap:bulkMode?16:0}} title={row.name}>{bulkMode && <IPTCheckbox checked={!!selected||reviewed} locked={reviewed} onToggle={()=>onSelect(row.id)} />}<span onClick={()=>onNameClick(row)} style={{color:"#2563eb",cursor:"pointer",overflow:"hidden",textOverflow:"ellipsis"}}>{row.name}</span></div>
        <div style={cell()}>{row.agency}</div>
        <div style={{...cell(),color:"#3b82f6",fontWeight:600}}>{row.branch}</div>
        <div style={cell()}>{row.mrn}</div>
        <div style={cell()}>{row.episodeId}</div>
        <div style={cell()}>{row.patientId}</div>
        <div style={{...cell("center"),overflow:"visible"}}><IPTEHRSyncCell row={row} /></div>
        <div style={cell("center")}><IPTChartPill row={row} onClick={()=>onChartClick(row)} /></div>
        <div style={cell("center")}>{(()=>{ const c=IPT_AT_CARDS.find(x=>x.id===row.at); return c&&c.icon ? <IPTATHover row={row} label={c.label} icon={<img src={c.icon} alt={c.label} style={{width:18,height:18,objectFit:"contain"}} />} /> : dash; })()}</div>
        <div style={cell("center")}>{bulkMode ? null : <IPTCheckbox checked={reviewed} locked={reviewed} onToggle={()=>onReviewed(row.id)} />}</div>
      </div>
    </div>
  );
}

const IPT_AT_ORDER = { warning:0, hourglass:1, thumb:2 };
const iptSortVal = (r,k) => {
  if (k==="chart") return iptHasChart(r) ? Number(r.chartPct) : -1;
  if (k==="ehrSync") return r.ehrSync ? 1 : 0;
  if (k==="at") return IPT_AT_ORDER[r.at] ?? 9;
  if (k==="reviewed") return r.__reviewed ? 1 : 0;
  return String(r[k]||"").toLowerCase();
};
function IPTSortIcon({ dir }) {
  return (
    <span style={{display:"inline-flex",flexDirection:"column",gap:1,marginLeft:4,flexShrink:0}}>
      <svg width="8" height="5" viewBox="0 0 8 5"><path d="M4 0L8 5H0z" fill={dir==="asc"?"#1677FF":"#BFC5CD"} /></svg>
      <svg width="8" height="5" viewBox="0 0 8 5"><path d="M4 5L0 0h8z" fill={dir==="desc"?"#1677FF":"#BFC5CD"} /></svg>
    </span>
  );
}
function IPTTableHeader({ sort, onSort, bulkMode, allSelected, onToggleAll }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:IPT_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",gap:6}}>
      {IPT_COLS.map(c=>(
        <div key={c.key} onClick={()=>onSort&&onSort(c.key)} title={"Sort by "+c.label} style={{font:"500 11px/14px Roboto",color:sort&&sort.key===c.key?"#1F2530":"#64748b",textAlign:c.align||"left",display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",cursor:"pointer",userSelect:"none",gap:bulkMode&&c.key==="name"?16:0}}>{bulkMode&&c.key==="name"&&<span onClick={e=>e.stopPropagation()} style={{display:"inline-flex"}}><IPTCheckbox checked={!!allSelected} onToggle={onToggleAll} /></span>}<span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{bulkMode&&c.key==="reviewed"?"":c.label}</span><IPTSortIcon dir={sort&&sort.key===c.key?sort.dir:null} /></div>
      ))}
    </div>
  );
}

function IPTDocsSlideout({ row, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.18)"}} />
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:420,background:"#fff",zIndex:901,display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.13)",animation:"iptDocsSlide .22s cubic-bezier(0.32,0.72,0,1)"}}>
        <style>{`@keyframes iptDocsSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 16px"}}>
          <span style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Intake Documents</span>
          <button onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",padding:4,color:"#64748b",font:"400 20px/18px Roboto"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px",padding:"0 24px 16px",borderBottom:"1px solid #e5e7eb"}}>
          {[["Episode ID",row.episodeId],["Policy Number",row.policy],["Gateway",row.gw||"—"]].map(([l,v])=>(
            <div key={l}><div style={{font:"400 11px Roboto",color:"#94a3b8",marginBottom:2}}>{l}</div><div style={{font:"500 12px Roboto",color:"#0f172a"}}>{v}</div></div>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 24px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",border:"1px solid #e5e7eb",borderRadius:8,background:"#f8fafc"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <IPTDocIcon size={16} />
              <span style={{font:"500 13px Roboto",color:"#0f172a"}}>Intake assessment.pdf</span>
            </div>
            <span style={{color:"#1677ff",font:"500 13px Roboto"}}>View</span>
          </div>
        </div>
      </div>
    </>
  );
}

function IPTTable({ rows: rawRows, onNameClick, onDocsClick, onAlertsClick, onChartClick, reviewedSet, onReviewed, bulkMode, selectedIds, setSelectedIds }) {
  const [sort, setSort] = useIPT(null);
  const onSort = k => setSort(s => !s||s.key!==k ? {key:k,dir:"asc"} : s.dir==="asc" ? {key:k,dir:"desc"} : null);
  let rows = rawRows;
  if (sort) {
    const m = sort.dir==="asc"?1:-1;
    rows = [...rawRows].map(r=>({...r,__reviewed:!!reviewedSet[r.id]})).sort((a,b)=>{ const x=iptSortVal(a,sort.key), y=iptSortVal(b,sort.key); return x<y?-m:x>y?m:0; });
  }
  const Body = ({children}) => window.ScrollBody ? <window.ScrollBody>{children}</window.ScrollBody> : <div style={{overflowY:"auto",flex:1}}>{children}</div>;
  if (rows.length===0) return <div style={{padding:"48px",textAlign:"center",color:"#94a3b8",font:"400 14px Roboto"}}>No records match the current filters.</div>;
  return (
    <div style={{padding:"0 24px 24px"}}>
      <IPTTableHeader sort={sort} onSort={onSort} bulkMode={bulkMode} allSelected={(()=>{ const el=rows.filter(r=>!reviewedSet[r.id]); return el.length>0 && el.every(r=>selectedIds&&selectedIds[r.id]); })()} onToggleAll={()=>{ const el=rows.filter(r=>!reviewedSet[r.id]); const on = el.length>0 && el.every(r=>selectedIds[r.id]); setSelectedIds(m=>{ const n={...m}; el.forEach(r=>{ n[r.id]=!on; }); return n; }); }} />
      <Body>
        {rows.map(r=><IPTRow key={r.id} row={r} bulkMode={bulkMode} selected={!!(selectedIds&&selectedIds[r.id])} onSelect={id=>setSelectedIds(m=>({...m,[id]:!m[id]}))} onNameClick={onNameClick} onDocsClick={onDocsClick} onAlertsClick={onAlertsClick} onChartClick={onChartClick} reviewed={!!reviewedSet[r.id]} onReviewed={onReviewed} />)}
        <div style={{padding:"16px 24px",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} records shown</div>
      </Body>
    </div>
  );
}

function IntakePatientView({ review, bulkMode, onBulkApi, onExitBulk }) {
  const [selectedIds, setSelectedIds] = useIPT({});
  const [bulkReviewConfirm, setBulkReviewConfirm] = useIPT(false);
  const [atFilter, setAtFilter] = useIPT(()=>{ const p=window.__iptPendingFilter; if(p&&String(p).startsWith("at:")){ window.__iptPendingFilter=null; return p.slice(3); } return null; });
  const [reasonFilter, setReasonFilter] = useIPT(()=>{ const p=window.__iptPendingReasons; window.__iptPendingReasons=null; return p&&p.length?p:null; });
  const [chartFilter, setChartFilter] = useIPT(()=>{ const p=window.__iptPendingFilter; window.__iptPendingFilter=null; return IPT_CHART_FILTERS[p] ? p : null; });
  const [idsFilter, setIdsFilter] = useIPT(()=>{ const p=window.__iptPendingIds; window.__iptPendingIds=null; return p||null; });
  const [search, setSearch] = useIPT("");
  const [fieldFilters, setFieldFilters] = useIPT([]);
  const [docsRow, setDocsRow] = useIPT(null);
  const [reviewedSet, setReviewedSet] = useIPT({});
  const [alertsRow, setAlertsRow] = useIPT(null);
  const [alertReviewed, setAlertReviewed] = useIPT({});
  const [chartRow, setChartRow] = useIPT(null);
  const [detailRow, setDetailRow] = useIPT(null);
  const selCount = Object.keys(selectedIds).filter(k=>selectedIds[k]).length;
  React.useEffect(()=>{ if(onBulkApi) onBulkApi(bulkMode ? { count: selCount, markReviewed: ()=>setBulkReviewConfirm(true) } : null); },[bulkMode, selCount]);
  React.useEffect(()=>{ setSelectedIds({}); },[bulkMode]);
  const toggleReviewed = id => setReviewedSet(s=>s[id]?s:({...s,[id]:true}));
  const toggleAlert = (rowId, idx, total) => {
    setAlertReviewed(s=>{
      const arr = (s[rowId] ? [...s[rowId]] : Array(total).fill(false));
      arr[idx] = !arr[idx];
      const allReviewed = arr.length>0 && arr.every(Boolean);
      setReviewedSet(rs=>({...rs,[rowId]:allReviewed}));
      return {...s,[rowId]:arr};
    });
  };

  let rows = IPT_ROWS;
  if (idsFilter) rows = rows.filter(r=>idsFilter.ids.includes(r.id));
  if (chartFilter) rows = rows.filter(IPT_CHART_FILTERS[chartFilter].match);
  const effAt = review ? "warning" : atFilter;
  if (effAt && effAt!=="all") rows = rows.filter(r=>r.at===effAt);
  if (review) rows = rows.filter(r=>!reviewedSet[r.id]);
  if (effAt==="warning" && reasonFilter && reasonFilter.length) rows = rows.filter(r=>reasonFilter.includes(r.atReason));
  if (fieldFilters.length) rows = rows.filter(r=>fieldFilters.every(f=>f.values.includes(r[f.field])));
  if (effAt==="warning") rows = [...rows].sort((a,b)=>(b.id==="it16")-(a.id==="it16"));
  if (search.trim()) { const q=search.trim().toLowerCase(); rows = rows.filter(r=>[r.name,r.mrn,r.patientId,r.sparcId].some(v=>String(v||"").toLowerCase().includes(q))); }

  return (
    <div style={{background:"#fff",minHeight:"100%",display:"flex",flexDirection:"column"}}>
      {window.ARVFilterBarChips
        ? <window.ARVFilterBarChips dateLabel="Patient Intake Init. Date : 04/01/25 – 04/30/25" searchPlaceholder="Search by Patient Name, MRN, Patient ID, Sparc ID" searchValue={search} onSearch={setSearch} filterFields={IPT_FILTER_FIELDS} filterRows={IPT_ROWS} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters} onClearFilters={fieldFilters.length?()=>setFieldFilters([]):null} />
        : <IPTFilterBar search={search} onSearch={setSearch} />}
      {(idsFilter || chartFilter || (reasonFilter && reasonFilter.length)) && (
        <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:8,padding:"10px 24px 0"}}>
          {idsFilter && <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 10px",borderRadius:999,background:"#F0F6FF",border:"1px solid #C9DBFB",color:"#1B4FCB",font:"500 12px/16px Roboto",maxWidth:"100%"}}><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Dashboard: {idsFilter.label}</span><span role="button" onClick={()=>setIdsFilter(null)} style={{cursor:"pointer",fontSize:13,lineHeight:1}}>×</span></span>}
          {chartFilter && <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 10px",borderRadius:999,background:"#F0F6FF",border:"1px solid #C9DBFB",color:"#1B4FCB",font:"500 12px/16px Roboto"}}>Dashboard: {IPT_CHART_FILTERS[chartFilter].label}<span role="button" onClick={()=>setChartFilter(null)} style={{cursor:"pointer",fontSize:13,lineHeight:1}}>×</span></span>}
          {(reasonFilter||[]).map(rsn=><span key={rsn} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 10px",borderRadius:999,background:"#FFFBEB",border:"1px solid #FDE68A",color:"#B45309",font:"500 12px/16px Roboto"}}>Reason: {rsn}<span role="button" onClick={()=>setReasonFilter(p=>{ const nx=(p||[]).filter(x=>x!==rsn); return nx.length?nx:null; })} style={{cursor:"pointer",fontSize:13,lineHeight:1}}>×</span></span>)}
        </div>
      )}
      <div style={{padding:"18px 24px 14px",borderBottom:"1px solid #e2e8f0"}}>
        <IPTTitleCluster allRows={IPT_ROWS} atFilter={atFilter} onFilter={v=>{ setAtFilter(v); if(v!=="warning") setReasonFilter(null); }} review={review} reasonFilter={reasonFilter} onReasons={setReasonFilter} />
      </div>
      <IPTTable rows={rows} onNameClick={setDetailRow} onDocsClick={setDocsRow} onAlertsClick={setAlertsRow} onChartClick={setChartRow} reviewedSet={reviewedSet} onReviewed={toggleReviewed} bulkMode={bulkMode} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
      {bulkReviewConfirm && window.PCRMarkReviewedModal && <window.PCRMarkReviewedModal noun="" count={selCount} onClose={()=>{ setBulkReviewConfirm(false); onExitBulk && onExitBulk(); }} onConfirm={()=>{ const ids=Object.keys(selectedIds).filter(k=>selectedIds[k]); setReviewedSet(m=>{ const n={...m}; ids.forEach(id=>{ n[id]=true; }); return n; }); setSelectedIds({}); }} />}
      {docsRow && <IPTDocsSlideout row={docsRow} onClose={()=>setDocsRow(null)} />}
      {alertsRow && <IPTAlertsSlideout row={alertsRow} alertReviewed={alertReviewed} onToggleAlert={toggleAlert} onClose={()=>setAlertsRow(null)} />}
      {chartRow && <IPTChartStatusSlideout row={chartRow} onClose={()=>setChartRow(null)} />}
      {detailRow && window.IntakePatientDetail && <window.IntakePatientDetail row={detailRow} onClose={()=>setDetailRow(null)} />}
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { IntakePatientView, IPT_ROWS });
