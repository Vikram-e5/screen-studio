const SB_EXT = "." + "js" + "x";
const SB_LT = "<", SB_GT = ">";
// Screen Builder — right slider launched from the 📖 icon in the top nav.
// Collects every blank in prompts/replicate-request-view-screen.md and emits a
// filled, copy-paste-ready prompt for the Neos Claude design chat.
const { useState: useSB, useEffect: useSBE, useRef: useSBR } = React;

const SB_W = "clamp(715px, 57.5vw, 1035px)";
const SB_OFFSET = "0px";
const SB_RAIL_W = 268;
const SB_INK = "#1f2937", SB_MUTED = "#6A717D", SB_LINE = "#e2e8f0", SB_BLUE = "#2563eb";

const SB_COL_TYPES = ["link","text","date","number","status-pill","icon","tag","checkbox","action-button"];
const SB_ICONS = { none:null, "at-completed":"icons/at-completed.png", "at-in-progress":"icons/at-in-progress.png", "at-needs-attention":"icons/at-needs-attention.png" };
const SB_SWATCHES = ["#64748b","rgb(21,95,130)","rgb(14,165,233)","rgb(148,163,184)","rgb(245,158,11)","#16a34a","#dc2626","#f97316","#3f7ba8"];

const SB_HOSTS = [
  { key:"dashboard",     label:"Dashboard",     band:"Dashboard",            subs:["Dashboard"] },
  { key:"eligibility",   label:"Eligibility",   band:"Eligibility Center",   subs:["Eligibility Request View","Automation Log"] },
  { key:"authorization", label:"Authorization", band:"Authorization Center", subs:["Patient Auth Summary View","Auth Request View","Automation Log"] },
  { key:"cdm",           label:"CDM",           band:"CDM Center",           subs:["CDM Request View","Automation Log"] },
  { key:"assessments",   label:"Assessments",   band:"Assessment Center",    subs:["Assessment Request View","Automation Log"] },
];

const SB_SOURCES = [
  { screen:"Eligibility Request View", menu:"eligibility", sections:[
    { name:"Eligibility request table", cols:["Patient Name","MRN","Mem ID","Payor Name","Coverage Status","Eligibility Alerts","AT Status","Docs","Action"] },
    { name:"Status Summary box", cols:["All Patients","Pending Submission","Active","Mixed","Inactive","Exceptions","Eligibility Alerts"] },
    { name:"Automation (AT) Status row", cols:["Completed","Needs Attention","In Progress"] },
  ]},
  { screen:"Eligibility Automation Log", menu:"eligibility", sections:[
    { name:"Automation log table", cols:["Patient Name","Ref ID","Event","AT Status","Timestamp","Docs"] },
  ]},
  { screen:"Patient Auth Summary View", menu:"authorization", sections:[
    { name:"Patient auth summary table", cols:["Patient Name","MRN","Agency","Branch","Mem ID","Payor Src","Payor Type","Gateway","SOC","Epi St Date","Epi ID","Episode Auth Summary","Recert Status","Expiring Auth(s)","Expired Auth(s)","Docs","Reviewed?"] },
  ]},
  { screen:"Auth Request View", menu:"authorization", sections:[
    { name:"Auth request table", cols:["Patient Name","MRN","Mem ID","Agency","Branch","Pyr Src","GW","Mode","Epi ID","Auth Type","Auth Init Dt","Auth Status","AT Status","Docs","Action"] },
    { name:"Expanded auth line items", cols:["SVC","Ref ID","Authorization#","Auth Tracking#","Approved","AT Status"] },
  ]},
  { screen:"Authorization Automation Log", menu:"authorization", sections:[
    { name:"Automation log table", cols:["Patient Name","Ref ID","Event","AT Status","Timestamp","Docs"] },
  ]},
  { screen:"CDM Request View", menu:"cdm", sections:[
    { name:"CDM request table", cols:["Patient Name","MRN","Payor","CDM Status","AT Status","Docs","Action"] },
    { name:"Automation Status box", cols:["All Patients","Completed","Ending Soon","Late / Overdue"] },
  ]},
  { screen:"Assessment Request View", menu:"assessments", sections:[
    { name:"Assessment request table", cols:["Patient Name","Assessment Type","Due Date","Status","AT Status","Docs","Reviewed?","Action"] },
  ]},
  { screen:"Dashboard", menu:"dashboard", sections:[
    { name:"Alert cards", cols:["Alert count","Patient Name"] },
    { name:"Action items list", cols:["Patient Name","Item","Due"] },
  ]},
];

const SB_DRAWER_BLOCK_TYPES = ["collapsible-section","episode-tabs","stat-chips","auth-details-table","field-pairs","eligibility-viewer","notes","attachments"];

const SB_DEFAULT = {
  buildKind:"screen", drawerKind:"patient-detail",
  openFromScreen:"Auth Request View", openFromSection:"Auth request table", openFromColumn:"Patient Name",
  drawerWidth:"520",
  drawerTabs:"Eligibility Info | Authorization Info",
  drawerHeaderLink:"Automation Log",
  drawerIdentity:"Patient Name, MRN, DOB, Mem ID, Relationship to Subscriber, Payor Name, Payor Source, Payor Type, Gateway, Start of Care",
  drawerBlocks:[
    { title:"Referral Information", type:"collapsible-section", detail:"Referral Date, Referral Source, Referring Physician, NPI" },
    { title:"Episode", type:"episode-tabs", detail:"Epi964256, Epi746523" },
    { title:"Episode dates", type:"stat-chips", detail:"Episode Start Date, Episode End Date, Days To Recert" },
    { title:"Provider Information", type:"collapsible-section", detail:"Provider Name, NPI, Tax ID, Contact" },
    { title:"Diagnosis Information", type:"collapsible-section", detail:"Primary Dx, Secondary Dx, Onset Date" },
    { title:"Authorization Details", type:"auth-details-table", detail:"SVC, Ref ID, Authorization#, Auth Tracking#, Auth Init Dt, Auth Sub Dt, Auth Req St & End Dt, Resp. Dt, Approved St & End Dt, Req, Approved, Denied, Pending, Days to Expire, AT Status" },
  ],
  drawerDocTabs:"Request Docs | Response Docs",
  drawerDocHeader:"REF ID, Payor Auth ID, Auth Type, Service Type",
  drawerDocGroupBy:"Received date",
  drawerDocTabDocs:{ "Request Docs":"Auth Request Doc, Assessment Submission File", "Response Docs":"Payor Response Doc, Validation Response Doc" },
  drawerDocList:"Auth Request Doc, Payor Response Doc",
  drawerPreview:false, drawerDownload:true, drawerUpload:false,
  drawerActions:"Close", drawerNotes:"",
  placement:"new", hostMenu:"eligibility", subTabPos:"last",
  tabLabel:"Assessments", routerKey:"assessments", bandTitle:"Assessment Client Center",
  subTabLabel:"Assessment Request View", slug:"assessment", pfx:"ASV",
  modeOptions:"All Assessments | All Non-Automated Assessments | All Automated Assessments",
  columns:[
    { label:"Patient Name", key:"name", type:"link", width:"flexible", sortable:true },
    { label:"Assessment Type", key:"assessmentType", type:"text", width:"flexible", sortable:true },
    { label:"Due Date", key:"dueDate", type:"date", width:"flexible", sortable:true },
    { label:"Status", key:"status", type:"status-pill", width:"flexible", sortable:true },
    { label:"AT Status", key:"atStatus", type:"icon", width:"92px", sortable:false },
    { label:"Action", key:"action", type:"action-button", width:"110px", sortable:false },
  ],
  accordion:false, childKind:"table", childColumns:"Check Date, Payor, Plan, Coverage Status, Result", childFields:"Previous Check Date, Payor, Result, Checked By", childRowNote:"2–4 previous checks per expanded row",
  reviewedCol:true, actionTarget:"View Details",
  rowMode:"generate", rowCount:24, dateSpread:"the last 60 days", pastedRows:"",
  summaryStyle:"A",
  counters:[
    { label:"All Records", color:"#64748b", icon:"none", rule:"total rows (always the full total)" },
    { label:"Completed", color:"#16a34a", icon:"none", rule:"status === 'Completed'" },
    { label:"In Progress", color:"#3f7ba8", icon:"none", rule:"status === 'In Progress'" },
    { label:"Overdue", color:"#dc2626", icon:"none", rule:"status === 'Overdue'" },
  ],
  automation:"full", autoLogTab:true, atColumn:true,
  target:"navigate", navScreen:"patient-summary", navFilter:"record", navNewScreenNote:"",
  summaryCardCount:4, drawerFields:"Assessment Type, Due Date, Assigned Clinician, Status, Notes",
  dateFilter:true, dateFilterLabel:"Assessment Due Date", dateFilterKey:"dueDate", dateWindow:30,
  filterFields:"Assessment Type → assessmentType, Status → status, Assigned Clinician → clinician",
  search:true, searchPlaceholder:"Search Patient Records", searchFields:"name, assessmentType, status",
  reviewMode:true, sorting:true, pagination:true, stickyHeader:true, addNote:true, followUp:true,
  homeTile:true, standalone:true, notes:"",
};

const SB_NAV_SCREENS = [
  { id:"patient-summary", name:"Patient Summary View", blurb:"Patient-level roll-up with identity header and summary cards." },
  { id:"automation-log",  name:"Automation Log",      blurb:"The Automation Log sub-tab for this menu." },
  { id:"request-detail",  name:"Request Detail View", blurb:"Full request-detail screen: line-item table + status timeline." },
  { id:"new-screen",      name:"A new screen",        blurb:"Doesn't exist yet — describe it in the notes field below." },
];
const SB_TARGETS = [
  { id:"none",     name:"No interaction",          blurb:"The first column is plain text. Nothing opens on click." },
  { id:"drawer",   name:"Open a sidebar",          blurb:"A right-hand drawer slides over the table. The table stays where it is." },
  { id:"navigate", name:"Navigate to another screen", blurb:"Leaves the table and opens a full screen, optionally pre-filtered to the clicked record." },
];

// ── tiny wireframe previews ──────────────────────────────────
function SBBar({ w, h=4, c="#cbd5e1", r=1, mt=0 }){ return <div style={{width:w,height:h,borderRadius:r,background:c,marginTop:mt}}></div>; }
function SBPreview({ id }){
  const box = { width:"100%", height:96, border:`1px solid ${SB_LINE}`, borderRadius:4, background:"#fff", overflow:"hidden", display:"flex", flexDirection:"column" };
  const band = <div style={{height:14,background:"linear-gradient(to right, rgb(56,71,90), rgb(28,45,66))",flexShrink:0}}></div>;
  if (id==="none") return (<div style={box}>{band}<div style={{padding:8,display:"flex",flexDirection:"column",gap:6}}>{[0,1,2,3].map(i=><div key={i} style={{display:"flex",gap:6,alignItems:"center",borderTop:i?`1px solid ${SB_LINE}`:"none",paddingTop:i?5:0}}><SBBar w={92} c="#94a3b8"/><SBBar w={54} c="#e2e8f0"/><SBBar w={38} c="#e2e8f0"/></div>)}</div></div>);
  if (id==="drawer") return (<div style={box}>{band}<div style={{flex:1,display:"flex"}}><div style={{flex:1,padding:8,display:"flex",flexDirection:"column",gap:6}}>{[0,1,2,3].map(i=><SBBar key={i} w="88%" c={i===1?"#93c5fd":"#cbd5e1"}/>)}</div><div style={{width:"46%",borderLeft:`1px solid ${SB_LINE}`,background:"#f8fafc",padding:8,display:"flex",flexDirection:"column",gap:5}}><SBBar w="70%" c="#93c5fd"/><SBBar w="100%" h={10} c="#fff"/><SBBar w="100%" h={10} c="#fff"/><SBBar w={38} h={9} c="#2563eb" r={2}/></div></div></div>);
  return (<div style={box}>{band}<div style={{padding:8,display:"flex",flexDirection:"column",gap:6}}><div style={{display:"flex",gap:5,alignItems:"center"}}><span style={{font:"400 8px Roboto",color:"#2563eb"}}>←</span><SBBar w={48} c="#93c5fd"/><SBBar w={30} c="#e2e8f0"/></div><div style={{display:"flex",gap:6,alignItems:"center"}}><div style={{width:16,height:16,borderRadius:"50%",background:"#C6A78F"}}></div><div><SBBar w={54}/><SBBar w={34} h={3} mt={3} c="#e2e8f0"/></div></div><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5}}>{[0,1,2,3].map(i=><div key={i} style={{height:22,border:`1px solid ${SB_LINE}`,borderRadius:3,padding:3}}><SBBar w="60%" h={3} c="#93c5fd"/><SBBar w="80%" h={3} mt={4} c="#eef2f7"/></div>)}</div></div></div>);
}
// Faithful miniatures of the three real strips shipped in the prototype.
const SB_RES = k => (typeof window!=="undefined" && window.__resources && window.__resources[k]) || ({ atCompleted:"icons/at-completed.png", atNeedsAttention:"icons/at-needs-attention.png", atInProgress:"icons/at-in-progress.png", mdiUser:"icons/mdi-user.png" })[k];
const SB_ELIG_CARDS = [
  { label:"All Patients", n:"24", color:"#64748b", weight:1.0 },
  { label:"Pending Submission", n:"07", color:"#3f7ba8", weight:1.45, person:true },
  { label:"Active", n:"09", color:"#16a34a", weight:.72 },
  { label:"Eligibility Alerts", n:"05", color:"#dc2626", weight:1.3 },
];
const SB_CDM_CARDS = [
  { label:"All Patients", n:"24", color:"rgb(21,95,130)", weight:1.05 },
  { label:"Completed", n:"12", color:"rgb(14,165,233)", weight:1.05, ic:"atCompleted" },
  { label:"Ending Soon", n:"05", color:"rgb(148,163,184)", weight:1.15, ic:"atInProgress" },
  { label:"Late / Overdue", n:"07", color:"rgb(245,158,11)", weight:1.35, ic:"atNeedsAttention" },
];
const SB_PSV_CARDS = [
  { label:"All Requests", n:"18", color:"#64748b", weight:1 },
  { label:"Approved", n:"09", color:"#16a34a", weight:1 },
  { label:"Pending Payor", n:"05", color:"#3f7ba8", weight:1.25 },
  { label:"Denied", n:"04", color:"#dc2626", weight:.9 },
];
function SBStrip({ caption, cards }){
  return (<div style={{display:"flex",alignItems:"stretch",border:`1px solid ${SB_LINE}`,borderRadius:6,background:"#fff",overflow:"hidden"}}>
    <div style={{padding:"8px 10px",background:"#f8fafc",borderRight:`1px solid ${SB_LINE}`,display:"flex",flexDirection:"column",justifyContent:"center",font:"500 10px/13px Roboto",color:"#333",flexShrink:0}}>{caption.map(l=><span key={l}>{l}</span>)}</div>
    <div style={{display:"flex",alignItems:"flex-start",flex:1,minWidth:0}}>
      {cards.map(c=>(
        <div key={c.label} style={{flex:`${c.weight} 1 0`,minWidth:0,padding:"7px 8px 8px"}}>
          <div style={{height:3,borderRadius:2,background:c.color,opacity:.9,marginBottom:6}}></div>
          <div style={{display:"flex",alignItems:"center",gap:4,font:"400 10px/13px Roboto",color:"#333",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={c.label}>
            {c.person && <img src={SB_RES("mdiUser")} alt="" style={{width:11,height:11,objectFit:"contain",flexShrink:0}} />}
            {c.ic && <img src={SB_RES(c.ic)} alt="" style={{width:11,height:11,objectFit:"contain",flexShrink:0}} />}
            <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{c.label}</span>
          </div>
          <div style={{font:"600 14px/18px Roboto",color:"#0f172a",marginTop:2}}>{c.n}</div>
        </div>
      ))}
    </div>
  </div>);
}
function SBATRow(){
  const items = [["atCompleted","Completed","12","#0f172a"],["atNeedsAttention","Needs Attention","04","#d97706"],["atInProgress","In Progress","03","#0f172a"]];
  return (<div style={{display:"flex",alignItems:"center",font:"400 11px/16px Roboto",color:"#333",marginTop:8}}>
    <span style={{color:"#94a3b8",marginRight:10}}>Automation (AT) Status :</span>
    {items.map(([ic,l,n,col],i)=>(<React.Fragment key={l}>
      {i>0 && <span style={{width:1,height:14,background:SB_LINE,margin:"0 10px"}}></span>}
      <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
        <img src={SB_RES(ic)} alt="" style={{width:14,height:14,objectFit:"contain"}} />
        <span style={{color:"#0f172a"}}>{l}</span>
        <span style={{fontWeight:600,color:col}}>{n}</span>
      </span>
    </React.Fragment>))}
  </div>);
}
function SBSummaryPreview({ style }){
  const note = { A:"Sample — Eligibility Request View (4 of its counters shown).", B:"Sample — CDM Request View. The box IS the AT status, icons inline.", C:"Sample — Patient Auth Summary View. Business statuses only." }[style];
  return (<div style={{background:"#fff",borderRadius:4}}>
    {style==="A" && <React.Fragment><SBStrip caption={["Eligibility","Status"]} cards={SB_ELIG_CARDS} /><SBATRow /></React.Fragment>}
    {style==="B" && <SBStrip caption={["Automation","Status"]} cards={SB_CDM_CARDS} />}
    {style==="C" && <SBStrip caption={["Request","Status"]} cards={SB_PSV_CARDS} />}
    <div style={{font:"400 10px/14px Roboto",color:"#94a3b8",marginTop:6}}>{note}</div>
  </div>);
}
function SBStylePick({ id, selected, onSelect, title, blurb }){
  const on = selected===id;
  return (<div onClick={()=>onSelect(id)} style={{border:`1px solid ${on?SB_BLUE:SB_LINE}`,boxShadow:on?"0 0 0 2px rgba(37,99,235,.15)":"none",borderRadius:6,padding:12,cursor:"pointer",background:"#fff",display:"grid",gridTemplateColumns:"250px 1fr",gap:32,alignItems:"center"}}>
    <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
      <span style={{width:15,height:15,marginTop:2,borderRadius:2,border:`1px solid ${on?SB_BLUE:"#cbd5e1"}`,background:on?SB_BLUE:"#fff",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",font:"700 10px Roboto"}}>{on?"✓":""}</span>
      <span style={{display:"flex",flexDirection:"column",gap:3}}>
        <span style={{font:"500 13px/17px Roboto",color:SB_INK}}>{title}</span>
        <span style={{font:"400 11px/15px Roboto",color:SB_MUTED}}>{blurb}</span>
      </span>
    </div>
    <SBSummaryPreview style={id} />
  </div>);
}

// ── form atoms ───────────────────────────────────────────────
function SBSection({ n, title, hint, children, open, onNext, nextLabel }){
  if (!open) return null;
  return (<div id={`sb-sec-${n}`} style={{padding:"22px 26px 26px"}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <span style={{width:24,height:24,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",font:"500 11px/1 Roboto",background:SB_BLUE,color:"#fff"}}>{n}</span>
      <span style={{font:"500 17px/22px Roboto",color:SB_INK}}>{title}</span>
    </div>
    {hint && <div style={{font:"400 12px/17px Roboto",color:SB_MUTED,margin:"6px 0 0 34px",maxWidth:640}}>{hint}</div>}
    <div style={{marginTop:18,display:"flex",flexDirection:"column",gap:12}}>{children}</div>
    {onNext && <div style={{marginTop:20,display:"flex"}}><button onClick={onNext} style={{marginLeft:"auto",background:SB_BLUE,border:"none",borderRadius:4,padding:"9px 18px",font:"500 13px Roboto",color:"#fff",cursor:"pointer"}}>{nextLabel||"Next"} →</button></div>}
  </div>);
}
function SBRail({ open, steps, current, onPick }){
  return (<div style={{position:"fixed",top:15,bottom:15,right:`calc(${SB_W} + ${SB_OFFSET} + 8px)`,transform:open?"translateX(0)":`translateX(${SB_RAIL_W+60}px)`,opacity:open?1:0,transition:"transform .3s cubic-bezier(.4,0,.2,1), opacity .2s",width:SB_RAIL_W,background:"#fff",borderRadius:10,overflow:"hidden",boxShadow:"-6px 0 28px rgba(15,23,42,.20)",zIndex:902,display:"flex",flexDirection:"column",pointerEvents:open?"auto":"none"}}>
    <div style={{background:"#fff",borderBottom:`1px solid ${SB_LINE}`,color:SB_INK,height:53,padding:"0 18px",display:"flex",flexDirection:"column",justifyContent:"center",flexShrink:0}}>
      <span style={{font:"500 16px/20px Roboto",color:SB_INK}}>Steps</span>
      <span style={{font:"400 12px/16px Roboto",color:SB_MUTED}}>{steps.findIndex(x=>x.n===current)+1} of {steps.length}</span>
    </div>
    <div className="ws-scrollbody" style={{flex:1,overflowY:"auto",padding:10,display:"flex",flexDirection:"column",gap:8}}>
    {steps.map((st,i)=>{
      const active = current===st.n, done = !active && steps.findIndex(x=>x.n===current) > i;
      return (<div key={st.n} onClick={()=>onPick(st.n)} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"13px 12px",borderRadius:6,cursor:"pointer",background:active?"#f4f8ff":"transparent",border:`1px solid ${active?"#bfdbfe":"transparent"}`}}
        onMouseEnter={e=>{ if(!active) e.currentTarget.style.background="#f8fafc"; }} onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
        <span style={{width:20,height:20,marginTop:1,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",font:"500 9.5px/1 Roboto",background:active?SB_BLUE:done?"#dcfce7":"#eef2f7",color:active?"#fff":done?"#16a34a":SB_MUTED}}>{done?"✓":st.n}</span>
        <span style={{display:"flex",flexDirection:"column",gap:2,minWidth:0}}>
          <span style={{font:`${active?500:400} 12.5px/16px Roboto`,color:SB_INK}}>{st.title}</span>
          <span style={{font:"400 10.5px/14px Roboto",color:SB_MUTED}}>{st.desc}</span>
          {st.summary && <span style={{font:"400 10.5px/14px Roboto",color:active?SB_BLUE:"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{st.summary}</span>}
        </span>
      </div>);
    })}
    </div>
  </div>);
}
function SBField({ label, children, hint }){
  return (<label style={{display:"flex",flexDirection:"column",gap:5}}>
    <span style={{font:"400 11px/14px Roboto",color:SB_MUTED,textTransform:"uppercase",letterSpacing:".05em"}}>{label}</span>
    {children}
    {hint && <span style={{font:"400 11px/15px Roboto",color:"#94a3b8"}}>{hint}</span>}
  </label>);
}
const sbInput = { width:"100%",border:`1px solid ${SB_LINE}`,borderRadius:4,padding:"7px 9px",font:"400 13px/18px Roboto",color:SB_INK,outline:"none",background:"#fff" };
function SBText({ value, onChange, placeholder, mono }){ return <input value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} style={{...sbInput,fontFamily:mono?"ui-monospace,Menlo,monospace":"Roboto"}} />; }
function SBArea({ value, onChange, placeholder, rows=3 }){ return <textarea value={value} rows={rows} placeholder={placeholder} onChange={e=>onChange(e.target.value)} style={{...sbInput,resize:"vertical",lineHeight:"18px"}} />; }
function SBSelect({ value, onChange, options }){ return <select value={value} onChange={e=>onChange(e.target.value)} style={{...sbInput,cursor:"pointer"}}>{options.map(o=><option key={o} value={o}>{o}</option>)}</select>; }
function SBToggle({ on, onChange, label, sub }){
  return (<div onClick={()=>onChange(!on)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"7px 10px",border:`1px solid ${on?"#bfdbfe":SB_LINE}`,borderRadius:4,background:on?"#f4f8ff":"#fff"}}>
    <span style={{width:32,height:18,borderRadius:999,background:on?"#1677FF":"#cbd5e1",position:"relative",flexShrink:0,transition:"background .15s"}}><span style={{position:"absolute",top:2,left:on?16:2,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left .15s"}}></span></span>
    <span style={{display:"flex",flexDirection:"column"}}>
      <span style={{font:"400 13px/17px Roboto",color:SB_INK}}>{label}</span>
      {sub && <span style={{font:"400 11px/15px Roboto",color:SB_MUTED}}>{sub}</span>}
    </span>
  </div>);
}
function SBCheck({ on, onChange, label }){
  return (<span onClick={()=>onChange(!on)} style={{display:"inline-flex",alignItems:"center",gap:6,cursor:"pointer",font:"400 12px/16px Roboto",color:SB_INK}}>
    <span style={{width:15,height:15,borderRadius:2,border:`1px solid ${on?SB_BLUE:"#cbd5e1"}`,background:on?SB_BLUE:"#fff",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",font:"700 10px Roboto"}}>{on?"✓":""}</span>{label}
  </span>);
}
function SBPick({ selected, onSelect, id, title, blurb, children }){
  const on = selected===id;
  return (<div onClick={()=>onSelect(id)} style={{border:`1px solid ${on?SB_BLUE:SB_LINE}`,boxShadow:on?"0 0 0 2px rgba(37,99,235,.15)":"none",borderRadius:6,padding:10,cursor:"pointer",background:"#fff",display:"flex",flexDirection:"column",gap:8}}>
    <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
      <span style={{width:15,height:15,marginTop:1,borderRadius:2,border:`1px solid ${on?SB_BLUE:"#cbd5e1"}`,background:on?SB_BLUE:"#fff",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",font:"700 10px Roboto"}}>{on?"✓":""}</span>
      <span style={{display:"flex",flexDirection:"column",gap:2}}>
        <span style={{font:"500 13px/17px Roboto",color:SB_INK}}>{title}</span>
        <span style={{font:"400 11px/15px Roboto",color:SB_MUTED}}>{blurb}</span>
      </span>
    </div>
    {children}
  </div>);
}

// ── columns editor ───────────────────────────────────────────
function SBColumns({ cols, set }){
  const upd = (i,k,v)=>set(cols.map((c,j)=>j===i?{...c,[k]:v}:c));
  const move = (i,d)=>{ const n=cols.slice(); const t=n[i+d]; if(!t) return; n[i+d]=n[i]; n[i]=t; set(n); };
  return (<div style={{display:"flex",flexDirection:"column",gap:6}}>
    <div style={{display:"grid",gridTemplateColumns:"20px 1.3fr 1fr 1.1fr 78px 54px 44px",gap:6,font:"400 10px/13px Roboto",color:SB_MUTED,textTransform:"uppercase",letterSpacing:".04em",padding:"0 2px"}}>
      <span>#</span><span>Label</span><span>Data key</span><span>Cell type</span><span>Width</span><span>Sort</span><span></span>
    </div>
    {cols.map((c,i)=>(
      <div key={i} style={{display:"grid",gridTemplateColumns:"20px 1.3fr 1fr 1.1fr 78px 54px 44px",gap:6,alignItems:"center"}}>
        <span style={{font:"400 11px Roboto",color:SB_MUTED}}>{i+1}</span>
        <input value={c.label} onChange={e=>upd(i,"label",e.target.value)} style={{...sbInput,padding:"5px 7px",font:"400 12px/16px Roboto"}} />
        <input value={c.key} onChange={e=>upd(i,"key",e.target.value)} style={{...sbInput,padding:"5px 7px",font:"400 12px/16px ui-monospace,Menlo,monospace"}} />
        <select value={c.type} onChange={e=>upd(i,"type",e.target.value)} style={{...sbInput,padding:"5px 4px",font:"400 12px/16px Roboto",cursor:"pointer"}}>{SB_COL_TYPES.map(t=><option key={t}>{t}</option>)}</select>
        <input value={c.width} onChange={e=>upd(i,"width",e.target.value)} style={{...sbInput,padding:"5px 6px",font:"400 11px/16px Roboto"}} />
        <span style={{display:"flex",justifyContent:"center"}}><SBCheck on={c.sortable} onChange={v=>upd(i,"sortable",v)} label="" /></span>
        <span style={{display:"flex",gap:2,justifyContent:"flex-end"}}>
          <button onClick={()=>move(i,-1)} title="Move up" style={sbMini}>↑</button>
          <button onClick={()=>set(cols.filter((_,j)=>j!==i))} title="Remove" style={{...sbMini,color:"#dc2626"}}>×</button>
        </span>
      </div>
    ))}
    <button onClick={()=>set([...cols,{ label:"New Column", key:"newColumn", type:"text", width:"flexible", sortable:true }])} style={{alignSelf:"flex-start",marginTop:2,background:"#fff",border:`1px dashed #cbd5e1`,borderRadius:4,padding:"6px 12px",font:"400 12px Roboto",color:SB_BLUE,cursor:"pointer"}}>＋ Add column</button>
  </div>);
}
const sbMini = { width:20,height:20,borderRadius:3,border:`1px solid ${SB_LINE}`,background:"#fff",cursor:"pointer",font:"400 12px/1 Roboto",color:SB_MUTED,padding:0 };

// ── counters editor ──────────────────────────────────────────
function SBCounters({ items, set, showIcons }){
  const [openColor, setOpenColor] = useSB(-1);
  const upd = (i,k,v)=>set(items.map((c,j)=>j===i?{...c,[k]:v}:c));
  const move = (i,d)=>{ const n=items.slice(); const t=n[i+d]; if(!t) return; n[i+d]=n[i]; n[i]=t; set(n); };
  const grid = showIcons ? "20px 1.2fr 1.6fr 60px 104px 44px" : "20px 1.2fr 1.6fr 60px 44px";
  return (<div style={{display:"flex",flexDirection:"column",gap:6}}>
    <div style={{display:"grid",gridTemplateColumns:grid,gap:6,font:"400 10px/13px Roboto",color:SB_MUTED,textTransform:"uppercase",letterSpacing:".04em",padding:"0 2px"}}>
      <span>#</span><span>Label</span><span>Derived from</span><span>Color</span>{showIcons&&<span>Icon</span>}<span></span>
    </div>
    {items.map((c,i)=>(
      <div key={i} style={{display:"grid",gridTemplateColumns:grid,gap:6,alignItems:"center"}}>
        <span style={{font:"400 11px Roboto",color:SB_MUTED}}>{i+1}</span>
        <input value={c.label} onChange={e=>upd(i,"label",e.target.value)} style={{...sbInput,padding:"5px 7px",font:"400 12px/16px Roboto"}} />
        <input value={c.rule} onChange={e=>upd(i,"rule",e.target.value)} placeholder="status === '…'" style={{...sbInput,padding:"5px 7px",font:"400 12px/16px ui-monospace,Menlo,monospace"}} />
        <span style={{position:"relative"}}>
          <button onClick={()=>setOpenColor(o=>o===i?-1:i)} title={c.color} style={{width:"100%",height:26,border:`1px solid ${SB_LINE}`,borderRadius:4,background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:5,padding:"0 6px"}}>
            <span style={{width:14,height:14,borderRadius:3,background:c.color,flexShrink:0}}></span>
            <span style={{font:"400 9px/1 Roboto",color:SB_MUTED,marginLeft:"auto"}}>▾</span>
          </button>
          {openColor===i && (
            <span style={{position:"absolute",top:30,left:0,zIndex:20,background:"#fff",border:`1px solid ${SB_LINE}`,borderRadius:6,boxShadow:"0 8px 24px rgba(15,23,42,.18)",padding:8,display:"grid",gridTemplateColumns:"repeat(5,18px)",gap:6}}>
              {SB_SWATCHES.map(sw=><span key={sw} onClick={()=>{ upd(i,"color",sw); setOpenColor(-1); }} title={sw} style={{width:18,height:18,borderRadius:3,background:sw,cursor:"pointer",outline:c.color===sw?`2px solid ${SB_BLUE}`:"none",outlineOffset:1}}></span>)}
            </span>
          )}
        </span>
        {showIcons && <select value={c.icon} onChange={e=>upd(i,"icon",e.target.value)} style={{...sbInput,padding:"5px 4px",font:"400 11px/16px Roboto",cursor:"pointer"}}>{Object.keys(SB_ICONS).map(k=><option key={k}>{k}</option>)}</select>}
        <span style={{display:"flex",gap:2,justifyContent:"flex-end"}}>
          <button onClick={()=>move(i,-1)} title="Move up" style={sbMini}>↑</button>
          <button onClick={()=>set(items.filter((_,j)=>j!==i))} title="Remove" style={{...sbMini,color:"#dc2626"}}>×</button>
        </span>
      </div>
    ))}
    <button onClick={()=>set([...items,{ label:"New Status", color:"#3f7ba8", icon:"none", rule:"status === '…'" }])} style={{alignSelf:"flex-start",marginTop:2,background:"#fff",border:`1px dashed #cbd5e1`,borderRadius:4,padding:"6px 12px",font:"400 12px Roboto",color:SB_BLUE,cursor:"pointer"}}>＋ Add counter</button>
  </div>);
}

function SBDrawerPreview({ id }){
  const shell = { width:"100%", border:`1px solid ${SB_LINE}`, borderRadius:5, background:"#fff", overflow:"hidden" };
  const pair = (l,v) => (<span key={l} style={{display:"flex",flexDirection:"column",gap:1,minWidth:0}}>
    <span style={{font:"400 7px/9px Roboto",color:SB_MUTED,whiteSpace:"nowrap"}}>{l}</span>
    <span style={{font:"500 8.5px/11px Roboto",color:SB_INK,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v}</span>
  </span>);
  const closeX = <span style={{marginLeft:"auto",font:"300 12px/1 Roboto",color:"#64748b"}}>×</span>;
  if (id==="patient-detail") return (<div style={shell}>
    <div style={{display:"flex",alignItems:"flex-end",gap:12,padding:"9px 10px",borderBottom:`1px solid ${SB_LINE}`,overflow:"hidden"}}>
      <span style={{display:"flex",flexDirection:"column",gap:1,flexShrink:0}}>
        <span style={{font:"400 7px/9px Roboto",color:SB_MUTED}}>Patient Name</span>
        <span style={{font:"500 13px/16px Roboto",color:SB_INK}}>Marvin Mckinney</span>
      </span>
      {[["MRN","B6100062245601"],["DOB","02/10/1956"],["Mem ID","11521357"],["Payor Name","Aetna"],["Payor Type","Mcare Adv"],["Start of Care","01/21/25"]].map(p=>pair(p[0],p[1]))}
      {closeX}
    </div>
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 10px",borderBottom:`1px solid ${SB_LINE}`}}>
      <span style={{padding:"7px 2px",font:"400 9px/12px Roboto",color:SB_MUTED}}>Eligibility Info</span>
      <span style={{padding:"7px 8px",font:"500 9px/12px Roboto",color:"#1677FF",borderBottom:"2px solid #1677FF"}}>Authorization Info</span>
      <span style={{marginLeft:"auto",font:"400 8.5px/12px Roboto",color:"#2563eb"}}>Automation Log</span>
    </div>
    <div style={{padding:"8px 10px 10px",display:"flex",flexDirection:"column",gap:7}}>
      <div style={{border:`1px solid ${SB_LINE}`,background:"#f8fafc",borderRadius:4,padding:"6px 8px",font:"400 9px/12px Roboto",color:SB_INK}}>›&nbsp; Referral Information</div>
      <div style={{display:"flex",gap:12,borderBottom:`1px solid ${SB_LINE}`}}>
        <span style={{font:"500 8.5px/11px Roboto",color:"#2563eb",paddingBottom:4,borderBottom:"2px solid #2563eb"}}>Episode - Epi964256</span>
        <span style={{font:"400 8.5px/11px Roboto",color:SB_MUTED,paddingBottom:4}}>Episode - Epi746523</span>
      </div>
      <div style={{display:"flex",gap:6}}>
        {[["Episode Start Date","3/22/2024"],["Episode End Date","5/21/2024"],["Days To Recert","08 Days"]].map(c=>(
          <span key={c[0]} style={{background:"#f8fafc",borderRadius:4,padding:"5px 8px",display:"flex",alignItems:"center",gap:6}}>
            <span style={{font:"400 7px/9px Roboto",color:SB_MUTED,maxWidth:44}}>{c[0]}</span>
            <span style={{font:"500 9px/12px Roboto",color:SB_INK}}>{c[1]}</span>
          </span>
        ))}
      </div>
      <div style={{border:`1px solid ${SB_LINE}`,background:"#f8fafc",borderRadius:4,padding:"6px 8px",font:"400 9px/12px Roboto",color:SB_INK}}>›&nbsp; Diagnosis Information</div>
      <div>
        <div style={{font:"500 10px/13px Roboto",color:SB_INK}}>Authorization Details</div>
        <div style={{font:"400 8px/11px Roboto",color:SB_MUTED,marginTop:1}}>Detailed view of authorizations and the Payor approval status.</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <span style={{font:"500 8.5px/11px Roboto",color:SB_INK}}>Recert</span>
        <span style={{background:"#eef2ff",borderRadius:3,padding:"2px 6px",font:"400 8px/11px Roboto",color:SB_INK}}>03/20/2024</span>
        <span style={{background:"#2563eb",borderRadius:3,padding:"3px 8px",font:"500 8px/11px Roboto",color:"#fff"}}>Edit Details</span>
      </div>
      <div style={{border:`1px solid ${SB_LINE}`,borderRadius:3,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:".5fr .9fr 1fr .8fr .8fr .5fr .7fr .8fr",gap:5,padding:"4px 6px",background:"#f8fafc",font:"400 7px/10px Roboto",color:SB_MUTED}}>
          <span>SVC</span><span>Ref ID</span><span>Authorization#</span><span>Init Dt</span><span>Sub Dt</span><span>Req</span><span>Approved</span><span>AT Status</span>
        </div>
        {[["SN","REF20240789","B245054741","04/25/25","04/26/25","03"],["PT","REF20240789","B245054742","04/25/25","04/26/25","03"]].map(r=>(
          <div key={r[2]} style={{display:"grid",gridTemplateColumns:".5fr .9fr 1fr .8fr .8fr .5fr .7fr .8fr",gap:5,padding:"5px 6px",borderTop:`1px solid ${SB_LINE}`,font:"400 8px/11px Roboto",color:SB_INK,alignItems:"center"}}>
            <span>{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span><span>{r[3]}</span><span>{r[4]}</span><span>{r[5]}</span>
            <span><span style={{background:"#16a34a",color:"#fff",borderRadius:8,padding:"1px 6px",font:"500 7.5px/11px Roboto"}}>03</span></span>
            <span style={{color:"#2563eb"}}>• Completed</span>
          </div>
        ))}
      </div>
    </div>
  </div>);
  return (<div style={{...shell,maxWidth:250}}>
    <div style={{padding:"9px 10px 8px",borderBottom:`1px solid ${SB_LINE}`}}>
      <div style={{display:"flex",alignItems:"center"}}><span style={{font:"500 12px/15px Roboto",color:SB_INK}}>Documents</span>{closeX}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginTop:7}}>
        {[["REF ID","REF0000000001"],["Payor Auth ID","11521357"],["Auth Type","Mcare Adv"],["Service Type","SN, PT"]].map(p=>pair(p[0],p[1]))}
      </div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 10px",borderBottom:`1px solid ${SB_LINE}`}}>
      <span style={{padding:"7px 2px",font:"500 9px/12px Roboto",color:"#2563eb",borderBottom:"2px solid #2563eb"}}>Request Docs</span>
      <span style={{padding:"7px 2px",font:"400 9px/12px Roboto",color:SB_MUTED}}>Response Docs</span>
      <span style={{marginLeft:"auto",font:"500 8.5px/12px Roboto",color:"#2563eb"}}>⬇ Download All</span>
    </div>
    <div style={{padding:"9px 10px 16px",display:"flex",flexDirection:"column",gap:7}}>
      <span style={{display:"flex",alignItems:"center",gap:5,font:"500 9px/12px Roboto",color:SB_INK}}><span style={{width:9,height:9,border:"1px solid #2563eb",borderRadius:2,display:"inline-block"}}></span>04/26/25</span>
      <div style={{border:`1px solid ${SB_LINE}`,borderRadius:4,padding:"8px 9px",display:"flex",alignItems:"center",gap:6}}>
        <span style={{font:"400 9px/12px Roboto",color:SB_MUTED}}>📎</span>
        <span style={{font:"400 9px/12px Roboto",color:SB_INK}}>Auth Request Doc</span>
        <span style={{marginLeft:"auto",font:"500 9px/12px Roboto",color:"#2563eb"}}>View</span>
      </div>
    </div>
  </div>);
}
function SBSidePick({ id, selected, onSelect, title, blurb, preview }){
  const on = selected===id;
  return (<div onClick={()=>onSelect(id)} style={{border:`1px solid ${on?SB_BLUE:SB_LINE}`,boxShadow:on?"0 0 0 2px rgba(37,99,235,.15)":"none",borderRadius:6,padding:12,cursor:"pointer",background:"#fff",display:"grid",gridTemplateColumns:"250px 1fr",gap:32,alignItems:"center"}}>
    <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
      <span style={{width:15,height:15,marginTop:2,borderRadius:2,border:`1px solid ${on?SB_BLUE:"#cbd5e1"}`,background:on?SB_BLUE:"#fff",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",font:"700 10px Roboto"}}>{on?"✓":""}</span>
      <span style={{display:"flex",flexDirection:"column",gap:3}}>
        <span style={{font:"500 13px/17px Roboto",color:SB_INK}}>{title}</span>
        <span style={{font:"400 11px/15px Roboto",color:SB_MUTED}}>{blurb}</span>
      </span>
    </div>
    {preview}
  </div>);
}
function SBBlocks({ items, set }){
  const upd = (i,k,v)=>set(items.map((c,j)=>j===i?{...c,[k]:v}:c));
  const move = (i,d)=>{ const n=items.slice(); const t=n[i+d]; if(!t) return; n[i+d]=n[i]; n[i]=t; set(n); };
  const grid = "20px 1.1fr 1.15fr 2fr 44px";
  return (<div style={{display:"flex",flexDirection:"column",gap:6}}>
    <div style={{display:"grid",gridTemplateColumns:grid,gap:6,font:"400 10px/13px Roboto",color:SB_MUTED,textTransform:"uppercase",letterSpacing:".04em",padding:"0 2px"}}>
      <span>#</span><span>Block title</span><span>Shown as</span><span>Fields / columns</span><span></span>
    </div>
    {items.map((c,i)=>(
      <div key={i} style={{display:"grid",gridTemplateColumns:grid,gap:6,alignItems:"center"}}>
        <span style={{font:"400 11px Roboto",color:SB_MUTED}}>{i+1}</span>
        <input value={c.title} onChange={e=>upd(i,"title",e.target.value)} style={{...sbInput,padding:"5px 7px",font:"400 12px/16px Roboto"}} />
        <select value={c.type} onChange={e=>upd(i,"type",e.target.value)} style={{...sbInput,padding:"5px 4px",font:"400 12px/16px Roboto",cursor:"pointer"}}>{SB_DRAWER_BLOCK_TYPES.map(t=><option key={t}>{t}</option>)}</select>
        <input value={c.detail} onChange={e=>upd(i,"detail",e.target.value)} placeholder="comma-separated" style={{...sbInput,padding:"5px 7px",font:"400 12px/16px Roboto"}} />
        <span style={{display:"flex",gap:2,justifyContent:"flex-end"}}>
          <button onClick={()=>move(i,-1)} title="Move up" style={sbMini}>↑</button>
          <button onClick={()=>set(items.filter((_,j)=>j!==i))} title="Remove" style={{...sbMini,color:"#dc2626"}}>×</button>
        </span>
      </div>
    ))}
    <button onClick={()=>set([...items,{ title:"New Block", type:"field-pairs", detail:"" }])} style={{alignSelf:"flex-start",marginTop:2,background:"#fff",border:`1px dashed #cbd5e1`,borderRadius:4,padding:"6px 12px",font:"400 12px Roboto",color:SB_BLUE,cursor:"pointer"}}>＋ Add block</button>
  </div>);
}

// ── prompt generation ────────────────────────────────────────
function sbBuildDrawerPrompt(s){
  const host = SB_HOSTS.find(h=>h.key===s.hostMenu) || SB_HOSTS[1];
  const Name = (s.pfx||"XYZ").replace(/[^A-Za-z0-9]/g,"");
  const isDoc = s.drawerKind==="document-slider";
  const compName = Name + (isDoc?"DocumentDrawer":"PatientDetailDrawer");
  const opensFrom = `the "${s.openFromColumn}" value in ${s.openFromSection} on the ${s.openFromScreen}`;
  const clean = t => (t||"").trim().replace(/[.,;\s]+$/,"");
  const groupBy = clean(s.drawerDocGroupBy);
  const hasTabs = !!(isDoc?s.drawerDocTabs:s.drawerTabs).trim();
  const docTabList = (s.drawerDocTabs||"").split("|").map(t=>t.trim()).filter(Boolean);
  const docContentBlock = !isDoc ? "" : (docTabList.length
    ? `- Each tab lists its own documents:\n${docTabList.map(t=>`  • ${t}: ${clean((s.drawerDocTabDocs||{})[t]) || "(documents for this tab)"}`).join("\n")}\n  Switching tabs swaps the list only — the header and its field pairs never change.`
    : `- Documents listed in the drawer: ${clean(s.drawerDocList) || "(list the document names)"}.`);
  const blockLines = s.drawerBlocks.map((b,i)=>{
    const how = ({
      "collapsible-section":`a COLLAPSIBLE SECTION ROW exactly like "Referral Information" in the reference: full-width
   bar on #f8fafc with a 1px #e2e8f0 border and 4px radius, a right-pointing chevron (›) at the
   left, the title at 500 14/20 #1f2937, ~20px tall padding. Collapsed by default; expanding it
   reveals a label/value grid`,
      "episode-tabs":`an EPISODE TAB ROW: text tabs reading "Episode - ⟨id⟩", active tab in #2563eb at weight 500
   with a 2px #2563eb underline, inactive in #6A717D, a 1px #e2e8f0 rule under the whole row.
   Switching episode re-renders everything below it`,
      "stat-chips":`a row of GREY STAT CHIPS on #f8fafc with 4px radius: each chip is a two-line muted label
   (11/14 #6A717D) beside a bold value (500 15/20 #1f2937), e.g. "Episode Start Date  3/22/2024"`,
      "auth-details-table":`the AUTHORIZATION DETAILS TABLE: a section title "Authorization Details" at 500 18/24 with the
   caption "Detailed view of authorizations and the Payor approval status.", then a row reading
   "Recert" + a lilac date chip + a filled #2563eb "Edit Details" button, then a wide horizontally
   scrollable table (its own x-scrollbar; the drawer itself never scrolls sideways): #f8fafc header
   at 11/14, cells 12/16, hairline #e2e8f0 rows, copy icon beside Authorization#, counts as green
   filled pills for Approved, "-" for Denied/Pending, and AT Status as a dot + "Completed" in #2563eb`,
      "field-pairs":`a read-only label / value grid (label 11/14 #6A717D over value 13/18 #1f2937, "—" for nulls)`,
      "eligibility-viewer":`the ELIGIBILITY VIEWER treatment from eligibility-detail.jsx / EligibilityInfoV2 — coverage
   cards + payor response layout, not a plain table`,
      "notes":`a threaded note list, newest first, each with author + timestamp, plus window.AddNoteModal`,
      "attachments":`an attachment list using the icons/attachment-type.svg mark, with filename, type and date`,
    })[b.type];
    return `${i+1}. “${b.title}” — ${how}.
   Contents: ${b.detail||"(derive from the parent record)"}`;
  }).join("\n");
  return `Build this into the prototype now — the whole message below is the build instruction, not a
discussion. Follow it end to end and report back against its acceptance checklist.

# TASK
Add a SIDE DRAWER (no new screen, no new top-nav tab) to the WellSky/Neos clickable prototype at
ui_kits/eligibility-auth-web/prototype.html.

# READ THESE FIRST (build from this source, not from memory)
- ui_kits/eligibility-auth-web/prototype.jsx            ← EligEntryDrawer / AuthEntryDrawer: the drawer
  pattern, scrim, transform transition, Esc + outside-click close, and the shared window popovers.
- ui_kits/eligibility-auth-web/eligibility-detail.jsx   ← the Eligibility Viewer treatment.
- ui_kits/eligibility-auth-web/eligibility-request-view.jsx ${isDoc?"← row + attachment cell conventions.":"← the row data the drawer reads from."}
- README.md + colors_and_type.css                       ← tokens, type, voice.

# 1. WHAT THIS IS
- Kind:            ${isDoc?"DOCUMENT SLIDER — the narrow right “Documents” drawer.":"PATIENT DETAIL DRAWER — the wide right drawer with the patient identity strip and Eligibility / Authorization Info tabs."}
- Opens from:      ${opensFrom}
- Lives in:        ${host.band} (${host.label} menu) — do NOT add a top-nav tab, a sub-tab or a new screen.
- New file:        ui_kits/eligibility-auth-web/${s.slug}-drawer.jsx, exposing window.${compName},
  with a unique prefix on every top-level identifier (${Name}…) and unique React hook aliases
  (const { useState: use${Name}, useEffect: use${Name}E, useRef: use${Name}R } = React).
- Width:           ${s.drawerWidth}px, full height, right-anchored, WHITE surface (this drawer has NO navy
  chrome — the header is white with a hairline under it), over a rgba(15,23,42,.45) scrim.
  The table behind stays mounted and keeps its filters, sort, page and scroll position.

# 2. DRAWER HEADER — match the reference exactly
${isDoc?`- Title “Documents” at 500 20/26 #1f2937, top-left. A thin × close glyph top-right (no button chrome).
- Directly under it, a single row of label / value pairs, label 11/14 #6A717D over value 500 14/18
  #1f2937, evenly spaced: ${clean(s.drawerDocHeader)}.
  The drawer width MUST be wide enough that every one of these pairs sits on ONE line with its label
  and value unwrapped — size the drawer to the header row, do not let a label wrap onto two lines.
- Then a 1px #e2e8f0 rule spanning the drawer.`:`- A WHITE header strip, 1px #e2e8f0 rule beneath. Left-most: the label “Patient Name” at 11/14
  #6A717D over the patient name at 500 24/30 #1f2937.
- To its right, on the same baseline row, the remaining identity pairs — label 11/14 #6A717D over
  value 500 14/18 #1f2937, generous horizontal spacing, single line, no wrapping:
  ${s.drawerIdentity.split(",").map(t=>t.trim()).filter(Boolean).slice(1).join(", ")}.
- A thin × close glyph at the far right of that strip (no button chrome).`}
${(isDoc?s.drawerDocTabs:s.drawerTabs).trim()?`- Tab row under the header: ${(isDoc?s.drawerDocTabs:s.drawerTabs).split("|").map(t=>t.trim()).filter(Boolean).join(" | ")}.
  ${isDoc?`Active tab is #2563eb at weight 500 with a 2px #2563eb underline; inactive #6A717D. A 1px
  #e2e8f0 rule runs under the whole row.`:`Active tab is a raised white tab card (1px #e2e8f0 border, 4px top radius, sitting on the rule)
  with its label in #1677FF at weight 500; inactive tabs are plain text in #6A717D on the rule.`}`:"- No tab row — the header rule runs straight into the body."}
${(isDoc?(s.drawerDownload?"Download All":""):s.drawerHeaderLink).trim()?`- ${isDoc?"A “⬇ Download All” link in #2563eb at weight 500":`A “${s.drawerHeaderLink}” link in #2563eb`}, right-aligned on ${(isDoc?s.drawerDocTabs:s.drawerTabs).trim()?"that same tab row":"the header rule"}.`:""}

# 3. DRAWER BODY
${isDoc?`${docContentBlock}
${groupBy?`- Documents are grouped by ${groupBy} — this grouping is REQUIRED, not optional. Each group starts
  with a group header: a small outlined calendar glyph in #2563eb + the group value at 500 14/18
  #1f2937, with the group's document cards stacked under it and 16px between groups.`:`- Documents are listed flat, newest first — deliberately NO group headers.`}
- ${groupBy?"Under each group header, one":"One"} CARD PER DOCUMENT: 1px #e2e8f0 border, 4px radius, ~44px tall,
  a paperclip glyph, the document name at 14/18 #1f2937, and a right-aligned “View” link in
  #2563eb at weight 500. Cards stack with 8px gaps.
- Clicking View ${s.drawerPreview?"opens the inline preview pane inside the drawer (striped placeholder for the page itself — do not draw fake document content)":"is a no-op stub (or opens a new tab); there is NO inline preview pane in this design"}.
- Empty state${hasTabs?" per tab":""}: one centred muted 13/18 line, no illustration.
${s.drawerUpload?"- An \u201cUpload Document\u201d action at the bottom opens a file input (mock — it appends a card).":""}
- The body scrolls; the header ${hasTabs?"and tab row stay":"stays"} pinned.`:`Inside the active tab, these blocks stack in this order, separated by 16–20px:
${blockLines}
The body scrolls; the header strip and tab row stay pinned. Only the Authorization Details table
scrolls horizontally, inside its own container.`}

# 4. FOOTER & ACTIONS
- ${s.drawerActions.trim()?`Actions: ${s.drawerActions}.`:"No footer action bar — the drawer closes via × / Esc / scrim only."}
- Esc, the ×, and a scrim click all close it. Closing never loses the table's filter state.
${/save/i.test(s.drawerActions)?`- Save writes back to the source row and persists across navigation via state held in the root
  router — not local-only state.`:"- The drawer is read-only: nothing in it mutates the source row."}

# 5. VISUAL FIDELITY — no new design language
Roboto only; table cells 12/16, body 14/18, overline 11/14, never below 12px. 4px spacing grid;
radii 2px tables/tags, 4px inputs/buttons. Hairline #e2e8f0, canvas #fff, panel #f8fafc, link/accent
#2563eb. Status pills follow the ERV_COV convention ({bg, border, color}). No emoji as UI icons —
use the icons/ PNG+SVG set. Voice: terse, label-driven, Title Case noun phrases, "—" for null.

# 6. WIRING
1. Create ui_kits/eligibility-auth-web/${s.slug}-drawer.jsx (inline styles only, no new CSS files).
2. End the file with \`if (typeof window !== "undefined") { window.${compName} = ${compName}; }\`.
3. Add ${SB_LT}script type="text/babel" src="${s.slug}-drawer${SB_EXT}"${SB_GT}${SB_LT}/script${SB_GT} to prototype.html BEFORE prototype.jsx.
4. Open it from ${opensFrom} — hold the open/selected record in the screen that owns the table,
   and render the drawer as a sibling of that screen so it overlays the whole content area.
5. Do NOT modify the top nav, the section bands, other screens, components/ or the root CSS.
${s.drawerNotes.trim()?`
# 7. ADDITIONAL NOTES FROM THE REQUESTER
${s.drawerNotes.trim()}
`:""}
# ACCEPTANCE CHECKLIST
[ ] No new top-nav tab, no new sub-tab, no new screen was added.
[ ] The drawer opens from ${opensFrom} and the table behind keeps filters, sort and page.
[ ] ${isDoc?`The header shows ${clean(s.drawerDocHeader)}${hasTabs?`; the tabs${s.drawerDownload?" and Download All":""} sit on one rule`:s.drawerDownload?"; Download All sits right-aligned on the header rule":""}; documents are ${groupBy?`grouped by ${groupBy}`:"listed flat"} with one bordered card per document carrying a View link.`:`The white identity strip, the ${s.drawerTabs.split("|").map(t=>t.trim()).filter(Boolean).join(" / ")} tabs, the collapsible › sections, the episode tab row, the grey stat chips and the wide Authorization Details table all render as described — and the drawer reads as the same product as the reference screenshot.`}
[ ] The drawer surface is white with a hairline header — no navy chrome anywhere inside it.
[ ] Esc, × and the scrim all close it; nothing behind it loses state.
[ ] No console errors, no missing icon 404s, no React key warnings.`;
}

function sbBuildPrompt(s){
  if (s.buildKind==="drawer") return sbBuildDrawerPrompt(s);
  const Name = (s.pfx||"XYZ").replace(/[^A-Za-z0-9]/g,"");
  const cap = s.tabLabel.replace(/[^A-Za-z0-9]/g,"") || "New";
  const compName = cap + "RequestView";
  const colRows = s.columns.map((c,i)=>`| ${i+1} | ${c.label} | ${c.key} | ${c.type}${c.type==="link"?" (opens the clickable summary)":""} | ${c.width} | ${c.sortable?"yes":"no"} |`).join("\n");
  const counters = s.counters.map(c=>`    ${c.label.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"")} | ${c.label} | ${c.color}${s.summaryStyle!=="A"&&c.icon!=="none"?` | ${SB_ICONS[c.icon]}`:" | no icon"} | ${c.rule}`).join("\n");
  const styleBlock = ({
    A:`STYLE A — ELIGIBILITY REQUEST VIEW STYLE: two rows.
  ROW 1 = the business-status box (ERVStatusStrip): a bordered card strip with a two-line caption
  block on the left in #f8fafc, then the business counters — each a 3px colored bar on top, label
  at 12/16, count at 600 18/22, per-card \`weight\` flex.
  ROW 2 = the Automation (AT) Status row directly BELOW that box (ERVAutomationStatus): label
  "Automation (AT) Status :" in #94a3b8, then Completed / Needs Attention / In Progress, each an
  18×18 icon + label + bold count, separated by 1px × 18px #e2e8f0 dividers. Needs Attention's
  count is #d97706 and carries the sub-status caret menu. It is a ROW UNDER the box — never a
  strip beside it.
  Business counters in the box (id | label | bar color | icon | derived from):
${counters}`,
    B:`STYLE B — CDM REQUEST VIEW STYLE: ONE box, and that box is the AUTOMATION status. There are
  no business-status counters on this screen. Copy CDM_STATUS_ITEMS + CDMStatusStrip from
  cdm-request-view.jsx: caption block "Automation / Status", each card carries its AT icon at 14×14
  inline before the label, colored bar sized to the label width, count at 600 18/22. No AT row
  below — the box does both jobs.
  Cards, in this order and with these exact colors and icons:
${counters}
  Resolve every icon through window.__resources with the relative path as fallback, using the same
  \`get icon()\` getter form as CDM_STATUS_ITEMS, so the standalone export works.`,
    C:`STYLE C — PATIENT / AUTH SUMMARY VIEW STYLE: ONE box, business statuses only. No automation
  anywhere on the screen — no AT row, no AT counters, no AT icons in the box. Same strip mechanics
  as ERVStatusStrip (caption block, 3px colored bar, label 12/16, count 600 18/22, weight flex,
  click-to-filter), just the business statuses and nothing after them.
  Counters (id | label | bar color | icon | derived from):
${counters}`,
  })[s.summaryStyle];
  const autoBlock = ({
    full:`FULL AUTOMATION (AT row directly below the summary box — pairs with Style A):
- Render the Automation (AT) Status row UNDER the status summary box, exactly as
  ERVAutomationStatus: label "Automation (AT) Status :", then Completed / Needs Attention /
  In Progress, each a clickable 18×18 icon + label + bold count with 1px×18px dividers between
  them; it filters the table and composes with the summary-box filter.
- ${s.atColumn?`Add an "AT Status" column rendering the same icon with a title tooltip.`:`No separate "AT Status" column.`}
- ${s.autoLogTab?`Add the "Automation Log" sub-tab as the second tab in the section band, modelled on
  erv-automation-log.jsx, in a sibling file ${s.slug}-automation-log${SB_EXT} exposing
  window.${cap}AutomationLogView. Log rows link back to the request row.`:`No Automation Log sub-tab.`}
- Keep the title-cluster mode dropdown options for automated / non-automated / all.`,
    box:`AUTOMATION IN THE SUMMARY BOX ONLY (pairs with Style B):
- No AT row below — the summary box itself carries the AT counters and icons.
- ${s.atColumn?`Still add the "AT Status" column with the same icons and title tooltips.`:`No separate "AT Status" column.`}
- ${s.autoLogTab?`Still add the "Automation Log" sub-tab (sibling file ${s.slug}-automation-log${SB_EXT} exposing window.${cap}AutomationLogView).`:`No Automation Log sub-tab.`}
- Keep the automated / non-automated / all mode dropdown options.`,
    none:`NO AUTOMATION (pairs with Style C):
- Omit the AT row, the AT Status column, the Automation Log sub-tab, and the
  automated/non-automated options in the mode dropdown. The section band then shows a
  single sub-tab. Everything else is unchanged.`,
  })[s.automation];
  const navScreen = SB_NAV_SCREENS.find(x=>x.id===s.navScreen) || SB_NAV_SCREENS[0];
  const navFilterText = ({
    record:`pre-filtered to the clicked record (that patient / that request only), so the destination opens showing just their data`,
    keep:`carrying the table's CURRENT filter state across (date range, field filters, search, status) so the destination shows the same working set`,
    none:`with NO filter — the destination opens in its own default state`,
  })[s.navFilter];
  const targetBlock = ({
    none:`NO INTERACTION — the first column ("${(s.columns[0]||{}).label||"first column"}") is PLAIN TEXT. It is not a
   link, has no hover state, no pointer cursor, and clicking a row does nothing. Do not add a
   detail screen, drawer or deep-link for it.`,
    drawer:`OPEN A SIDEBAR — clicking the first column opens a right-hand drawer over the table (the table
   stays mounted behind it and keeps its filters), modelled on EligEntryDrawer: read-only identity
   block at top, then these fields: ${s.drawerFields}. Save + Add Note actions; Save writes back to
   the row (updates its status and flips its Action from Edit to View) and persists across
   navigation via state held in the root router. Esc and the scrim close it.`,
    navigate:`NAVIGATE TO ANOTHER SCREEN — clicking the first column leaves the table and opens:
   ${navScreen.name}${s.navScreen==="new-screen"?` (a screen that does not exist yet — build it: ${s.navNewScreenNote||"see the notes in §11"})`:""}.
   ${s.navScreen==="patient-summary"?`Build it in the style of the Patient Auth Summary View in prototype.jsx: breadcrumb in the
   SectionBand ("${s.bandTitle} / ⟨Patient Name⟩"), patient identity header, and ${s.summaryCardCount} summary cards.`:""}${s.navScreen==="automation-log"?`Deep-link into the Automation Log sub-tab, matching erv-automation-log.jsx.`:""}${s.navScreen==="request-detail"?`Build it as the full request-detail screen with the expandable line-item table and status
   timeline, per the Auth / Eligibility Request View detail in prototype.jsx.`:""}
   FILTER BEHAVIOUR ON NAVIGATE: open it ${navFilterText}.
   A Back control returns to the table with all of its filters, sort, page and review state intact.`,
  })[s.target];
  const childBlock = !s.accordion ? "" : (s.childKind==="table"
    ? `- CHILD ACCORDION CONTENT — A NESTED TABLE (ERVChildSection pattern): expanding a row reveals an
  indented child table inside the row, on #f8fafc with a left indent aligned under the caret, its own
  header row at 11/14 uppercase, cells at 12/16, no pagination, no sorting. Child table columns, in order:
  ${s.childColumns.split(/[,\n]/).map(t=>t.trim()).filter(Boolean).map((t,i)=>`${i+1}. ${t}`).join("\n  ")}
  Data volume: ${s.childRowNote||"2–4 child rows per expanded row"}. Child rows must be derived from the
  parent row (same patient / same record) so the two never disagree. Only one row expanded at a time is
  NOT required — multiple rows may be open simultaneously, each keeping its own state through filtering,
  sorting and pagination.`
    : `- CHILD ACCORDION CONTENT — A FIELD DETAIL BLOCK: expanding a row reveals a read-only label/value
  detail panel inside the row (not a table), on #f8fafc with a left indent aligned under the caret, laid
  out as a responsive 2–3 column grid of label (11/14 uppercase, ${SB_MUTED}) over value (13/18, ${SB_INK}),
  "—" for nulls. Fields, in order:
  ${s.childFields.split(/[,\n]/).map(t=>t.trim()).filter(Boolean).map((t,i)=>`${i+1}. ${t}`).join("\n  ")}
  Values must be derived from the parent row so the two never disagree. Multiple rows may be expanded at
  once, each keeping its own state through filtering, sorting and pagination.`);
  const host = SB_HOSTS.find(h=>h.key===s.hostMenu) || SB_HOSTS[1];
  const isNew = s.placement==="new";
  const identityBlock = isNew
    ? `- PLACEMENT:               A NEW top-level menu. Add it to the TopNav items in prototype.jsx.
- Top-nav tab label:        ${s.tabLabel}
- Router section key:       ${s.routerKey}
- Section band title:       ${s.bandTitle}
- Primary sub-tab label:    ${s.subTabLabel}`
    : `- PLACEMENT:               DO NOT add a new top-level menu. This screen is ONE MORE SUB-TAB
  inside the EXISTING "${host.label}" menu (router key "${host.key}", section band "${host.band}").
  That menu today has these sub-tabs: ${host.subs.join(" | ")}.
  Add "${s.subTabLabel}" as the ${s.subTabPos==="first"?"FIRST":"LAST"} sub-tab, leaving the existing sub-tabs,
  their order and their behaviour untouched, and leaving the TopNav items array unchanged.
- New sub-tab label:        ${s.subTabLabel}
- Section band title:       ${s.bandTitle} (existing band — do not restyle it)`;
  const wiringBlock = isNew
    ? `4. In prototype.jsx: add { key:"${s.routerKey}", label:"${s.tabLabel}" } to the TopNav items, add a
   ${cap}Section component in the CDMSection mould (SectionBand + sub-tabs${s.reviewMode?" + review toggle":""}, reading the
   view off window with a "Loading…" fallback), and add the section branch to the root router with
   its own sub-tab state.`
    : `4. In prototype.jsx: do NOT touch the TopNav items array. Instead, in the EXISTING
   ${host.label} section component, push "${s.subTabLabel}" into its \`subTabs\` array at the
   ${s.subTabPos==="first"?"start":"end"} and render the new view for that sub-tab index, reading it off window with a
   "Loading…" fallback. Every existing sub-tab must keep working at its (possibly shifted) index —
   re-check the sub===N branches after the insert.`;
  const rows = s.rowMode==="paste" && s.pastedRows.trim()
    ? s.pastedRows.trim()
    : `Generate ${s.rowCount} plausible rows using the patient names already used across the prototype
(Marvin Mckinney, Esther Howard, Wade Warren, Cameron Williamson, Robert Fox, Jenny Wilson,
Jacob Jones, Leslie Alexander, Guy Hawkins, Jane Cooper, Kristin Watson, Cody Fisher,
Kathryn Murphy, Devon Lane, Dianne Russell, Arlene McCoy, Theresa Webb, Darlene Robertson,
Courtney Henry, Ralph Edwards, Annette Black) so cross-screen data looks consistent. Spread
${s.dateFilterLabel} across ${s.dateSpread} and distribute statuses so every summary counter
and every filter returns a non-empty result.`;

  return `Build this into the prototype now — the whole message below is the build instruction, not a
discussion. Follow it end to end and report back against its acceptance checklist.

# TASK
Add a new screen to the WellSky/Neos clickable prototype at
ui_kits/eligibility-auth-web/prototype.html, replicating the **Eligibility Request View**
end to end, plus a new top-level tab for it in the top navigation.

# READ THESE FIRST (do not skip — build from this source, not from memory)
- ui_kits/eligibility-auth-web/eligibility-request-view.jsx   ← THE REFERENCE SCREEN (canonical, ~1,770 lines).
  Ignore the stale copy at the project root (/eligibility-request-view.jsx).
- ui_kits/eligibility-auth-web/cdm-request-view.jsx            ← a proven clone of that screen; follow its
  file structure, prefixing convention and wiring.
- ui_kits/eligibility-auth-web/prototype.jsx                   ← TopNav, SectionBand, root router, and the shared
  popovers exposed on window (FilterPopover, DatePicker, dateInRange, defaultDateRange, AddNoteModal, AuthEntryDrawer).
- ui_kits/eligibility-auth-web/prototype.html                  ← script load order.
- ui_kits/eligibility-auth-web/erv-automation-log.jsx          ← Automation Log pattern.
- README.md + colors_and_type.css + components/fig-tokens.css  ← tokens, type, voice.

# 1. SCREEN IDENTITY
${identityBlock}
- New file:                 ui_kits/eligibility-auth-web/${s.slug}-request-view${SB_EXT}
- Component + globals:      ${compName}, exposed as window.${compName}, with a unique prefix
  on every top-level identifier in the file (ERV… → ${Name}…) and unique React hook aliases
  (const { useState: use${Name}, useEffect: use${Name}E, useRef: use${Name}R } = React) so nothing
  collides with the other babel files.
- Title-cluster mode dropdown options (the "All … ▾" control): ${s.modeOptions}

# 2. TABLE COLUMNS
Replace the ERV column set entirely with the columns below. Keep the same CSS-grid column
mechanism (an array of { key, label, grid, sortable, align }, joined into one
gridTemplateColumns string) so columns distribute across the viewport width — flexible
columns as minmax(Npx, Nfr), fixed status/icon columns as a px value.

| # | Column label | data key | type | width behaviour | sortable |
|---|--------------|----------|------|-----------------|----------|
${colRows}

Column rules to preserve from the reference:
- ${s.accordion?"Row 1 cell carries the expand caret (14×14 triangle) — the child accordion IS enabled.":"No expand caret / child accordion on row 1."}
${childBlock?childBlock+"\n":""}
- Sortable headers show the two-arrow SortArrows glyph, active direction in #2563eb.
- Fixed-width trailing columns (Action${s.reviewedCol?", Reviewed?":""}, doc icon) must stay visible without horizontal scroll at 1440px wide.
- Cell type contracts: status-pill = bordered pill {bg, border, text} per status; icon = 18×18
  <img> with a title tooltip; action = "${s.actionTarget}" link or a filled button;
  ${s.reviewedCol?`"Reviewed?" = checkbox that persists in component state`:`no "Reviewed?" checkbox column`}; "—" for nulls.
${s.reviewedCol?`- INCLUDE the "Reviewed?" column: a per-row checkbox, fixed width, right-most before Action,
  state persisted in the component and unaffected by filtering, sorting or pagination.`:`- DO NOT include a "Reviewed?" column.`}

# 3. TABLE DATA
${rows}

Expose the array on window as window.${Name}_ROWS (like window.ERV_ROWS / window.CDM_ROWS) so
dashboards and other screens can derive counts from the same source.

# 4. STATUS SUMMARY BOX  (the clickable counter strip — REQUIRED)
Replicate the "Status Summary" card strip: each card is a full-width colored indicator bar on
top, a two-digit zero-padded count (01, 09, 12), a label, an optional 18×18 status icon, and
click-to-filter behaviour. Cards are laid out with flex and per-card \`weight\` values controlling
relative width (as in ERV_STATUS / CDM_STATUS_ITEMS).

## 4a. Counters in the box
${styleBlock}

## 4b. Behaviour to preserve
- Clicking a card filters the table to that status; clicking it again clears it.
- The active card is visually selected, non-active cards dim, AND a removable filter chip
  appears next to "Add More Filters"; removing the chip deselects the card.
- Counts recompute from the *currently filtered* subset (date range ∧ field filters ∧ search ∧
  any other active status), except "${(s.counters[0]||{}).label||"All Records"}", which always shows the total.
- Icon cards render the icon at 18×18 with objectFit:"contain" and a title tooltip whose text
  equals the card label.
- Caption line under the title: "Status Summary of ${s.bandTitle}"${s.target==="none"?".":`, plus the hint box
  "Click ${(s.columns[0]||{}).label||"Patient Name"} to ${s.target==="drawer"?"open the detail sidebar":`view ${navScreen.name}`}".`}
- Whatever icon a card uses, the matching table cell for that record uses the SAME icon asset at
  the same size — box and row must never disagree visually.

# 5. AUTOMATION
${autoBlock}

# 6. WHAT HAPPENS WHEN A ROW IS CLICKED
${targetBlock}
Regardless of choice: the row-level "Action" cell keeps its own target (${s.actionTarget})${s.accordion?` and the
expand caret keeps the child accordion (${s.childKind==="table"?"nested child table":"field detail block"}) per §2`:""}.

# 7. FILTER BAR — must all work, not be decorative
Reuse the shared controls from prototype.jsx (window.DatePicker, window.FilterPopover,
window.dateInRange, window.defaultDateRange) rather than rebuilding them. The whole bar sits on
the blue strip (#eef4fb with an #e2e8f0 rule beneath), exactly as in the reference.
${s.dateFilter?`- Date range picker, left-most, labelled "${s.dateFilterLabel} : MM/DD/YY – MM/DD/YY", filtering on
  ${s.dateFilterKey}. Default range = window.defaultDateRange(unique dates, ${s.dateWindow}). The calendar
  popover MUST actually work: it opens on click, both months navigate, picking a start then an end
  applies the range and filters the table immediately, it closes on outside click, and it shows
  "All" when cleared.`:`- No date range picker in the filter bar.`}
- "＋ Add More Filters" popover with these multi-select fields, each option list derived from the
  actual row data (no hardcoded option lists):
  ${s.filterFields}
- Every applied filter appears as a removable chip in the bar; "Clear all" appears when ≥1 chip is active.
${s.search?`- Search input, right-aligned, placeholder "${s.searchPlaceholder}", 240px, live case-insensitive
  substring match across: ${s.searchFields}.`:`- No search input.`}
- Filters compose: date ∧ field filters ∧ search ∧ summary-card status ∧ automation status.
  Summary counts, table rows and pagination all reflect the composed result.
- Filter-chip rows keep the existing .chip-scroll drag-to-scroll behaviour.

# 8. OTHER BEHAVIOUR
- ${s.sorting?"Sorting on every sortable column, asc/desc toggle, sort survives filtering.":"No column sorting."}
- ${s.pagination?'Pagination: "Showing X–Y of Z", page-size selector, page buttons, resets to page 1 when filters change.':"No pagination — render all rows."}
- ${s.reviewMode?`Review Mode toggle in the section band (right side, matching SectionBand's showReview), ON by
  default OFF, and it drives ${s.reviewedCol?`the per-row "Reviewed?" checkbox column`:"the review affordances"}.`:"NO Review Mode toggle in the section band."}
- ${s.followUp?"Follow-up date state on each row.":"No follow-up date state."} ${s.addNote?"Add Note modal wired to window.AddNoteModal.":"No Add Note modal."}
- ${s.stickyHeader?"Sticky table header with the hairline shadow; table height computed from window.innerHeight so it fits the viewport, recomputed on resize.":"Static table header."}
- data-screen-label on the screen root ("01 ${s.tabLabel}") for review comments.

# 9. VISUAL FIDELITY — no new design language
Pixel-match the reference. Reuse, do not reinvent:
- Chrome gradient rgb(56,71,90) → rgb(28,45,66); filter bar #eef4fb with #e2e8f0 rule; table
  header #f8fafc; canvas #fff; hairline #e2e8f0; link/accent #2563eb; active sub-tab #1677FF on
  rgba(208,217,229,0.11).
- Roboto only. Table cells 12/16, body 14/18, section title 20/24 at weight 500, overline 11/14.
  Never below 12px.
- 4px spacing grid; radii 2px tables/tags, 4px inputs/buttons, 6–8px cards.
- Status pill palettes follow the ERV_COV convention: {bg, border, color} per status
  (green #16a34a, red #dc2626, orange #f97316, blue #3f7ba8, slate #64748b).
- No emoji as UI icons; use the icons/ PNG+SVG set. Voice: terse, label-driven, Title Case noun
  phrases, "—" for null.

# 10. WIRING
1. Create ui_kits/eligibility-auth-web/${s.slug}-request-view${SB_EXT}${s.autoLogTab&&s.automation!=="none"?` plus ${s.slug}-automation-log${SB_EXT}`:""}.
   Inline styles only, no new CSS files.
2. End each new file with the window exposures it needs; guard with \`if (typeof window !== "undefined")\`.
3. Add ${SB_LT}script type="text/babel" src="${s.slug}-request-view${SB_EXT}"${SB_GT}${SB_LT}/script${SB_GT} to prototype.html BEFORE
   prototype.jsx, alongside the other view scripts.
${wiringBlock}
5. ${s.standalone?"Also register the tab in prototype-standalone-src.html / the standalone export path":"Do not touch the standalone export path"}${s.homeTile&&isNew?` and add a ${s.tabLabel} tile to the Home screen`:" and do not add a Home tile"}.
6. Do NOT modify the Eligibility, Authorization, CDM or Dashboard screens, or any file in
   components/ or the root CSS. New code goes in the new files plus the minimal additions in
   prototype.html / prototype.jsx described above.
${s.notes.trim()?`
# 11. ADDITIONAL NOTES FROM THE REQUESTER
${s.notes.trim()}
`:""}
# ACCEPTANCE CHECKLIST — verify each before you report back
[ ] ${isNew?`New "${s.tabLabel}" tab appears in the top nav and switches to the new screen; other tabs unaffected.`:`NO new top-nav tab was added; "${s.subTabLabel}" appears as the ${s.subTabPos==="first"?"first":"last"} sub-tab under ${host.label}, and every pre-existing sub-tab in that menu still opens its own view.`}
[ ] All ${s.columns.length} columns from §2 render with the right cell type and no horizontal scroll at 1440px.
[ ] Every summary counter's number equals the number of rows the table shows when you click it.
[ ] Clicking a counter twice returns to the unfiltered table.
${s.dateFilter?"[ ] The date picker opens, navigates months, applies a range, clears to \"All\", and closes on outside click.\n":""}[ ] Each Add-More-Filters field${s.search?" and the search box":""} visibly changes the row set, and they combine correctly.
[ ] Filter chips remove their own filter; "Clear all" clears every chip.
${s.sorting?"[ ] Sorting works on every column marked sortable, both directions.\n":""}${s.pagination?"[ ] Pagination totals match the filtered row count.\n":""}[ ] ${s.target==="none"?"The first column is plain text — no link, no cursor change, clicking does nothing.":s.target==="drawer"?"The sidebar opens over the table, saves back to the row, and closes on Esc / scrim with filters intact.":`Clicking the first column opens ${navScreen.name} ${s.navFilter==="record"?"pre-filtered to that record":s.navFilter==="keep"?"carrying the table's current filters":"unfiltered"}, and Back returns with filters intact.`}
${s.accordion?`[ ] The expand caret opens the child ${s.childKind==="table"?"table with exactly the columns listed in §2":"field detail block with exactly the fields listed in §2"}, and its state survives filtering, sorting and pagination.\n`:""}
[ ] The summary box matches Style ${s.summaryStyle} — right counters, right order, right colors${s.summaryStyle==="B"?", and the AT icon rendered inside each card at 14×14 with a tooltip":s.summaryStyle==="A"?", with the Automation (AT) Status row rendered directly BELOW the box":", with no automation counters anywhere on the screen"}.
[ ] Each summary card's icon is the same asset as that record's icon in the table row.
[ ] Automation row / column / log present or absent exactly per §5, with no duplicated AT counters.
${s.reviewMode?"[ ] Review Mode toggle switches the screen into review mode.\n":""}${s.reviewedCol?"[ ] The \"Reviewed?\" checkbox persists per row through filtering, sorting and pagination.\n":""}[ ] No console errors, no missing icon 404s, no React key warnings.
[ ] Screenshot the new screen and the clickable-summary target and confirm they read as the same
    product as the Eligibility Request View.`;
}

// ── the drawer ───────────────────────────────────────────────
function ScreenBuilderDrawer({ open, onClose }){
  const [s, setS] = useSB(SB_DEFAULT);
  const [openSec, setOpenSec] = useSB("01");
  const bodyRef = useSBR(null);
  const goSec = n => { setOpenSec(n); requestAnimationFrame(()=>{ if(bodyRef.current) bodyRef.current.scrollTop = 0; }); };
  const sec = n => ({ open: openSec===n });
  const [view, setView] = useSB("form");
  const [copied, setCopied] = useSB(false);
  const set = (k,v)=>setS(p=>({ ...p, [k]:v }));
  const slugify = t => t.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  useSBE(()=>{ const h=e=>{ if(e.key==="Escape") onClose(); }; document.addEventListener("keydown",h); return ()=>document.removeEventListener("keydown",h); },[onClose]);
  const prompt = view==="prompt" ? sbBuildPrompt(s) : "";
  useSBE(()=>{ setOpenSec("01"); },[s.buildKind]);
  const copyFallback = ()=>{ try{ const t=document.createElement("textarea"); t.value=prompt; t.setAttribute("readonly",""); t.style.cssText="position:fixed;top:0;left:0;opacity:0"; document.body.appendChild(t); t.select(); t.setSelectionRange(0,t.value.length); const ok=document.execCommand("copy"); document.body.removeChild(t); return ok; }catch(e){ return false; } };
  const copy = ()=>{ const done=()=>{ setCopied(true); setTimeout(()=>setCopied(false),1800); };
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(prompt).then(done).catch(()=>{ if(copyFallback()) done(); }); }
    else if (copyFallback()) done(); };
  const download = ()=>{ const b=new Blob([prompt],{type:"text/markdown"}); const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=`${s.slug||"new"}-screen-prompt.md`; a.click(); URL.revokeObjectURL(a.href); };
  const SB_STEPS = s.buildKind==="drawer" ? [
    { n:"01", title:"What you're building", desc:"Which drawer to recreate", summary:s.drawerKind==="document-slider"?"Document slider":"Patient detail drawer" },
    { n:"D1", title:"Where it opens from", desc:"Screen, section, column, file", summary:`${s.openFromColumn} · ${s.openFromScreen}` },
    { n:"D2", title:"Drawer content", desc:s.drawerKind==="document-slider"?"Header, tabs, grouping":"Identity, tabs, blocks", summary:s.drawerKind==="document-slider"?s.drawerDocTabs:`${s.drawerBlocks.length} blocks` },
    { n:"D3", title:"Drawer behaviour", desc:"Footer actions and notes", summary:s.drawerActions },
  ] : [
    { n:"01", title:"Screen identity", desc:"New menu or existing menu, labels", summary:`${s.placement==="new"?"New menu":`Sub-tab of ${s.hostMenu}`} · ${s.tabLabel||"—"}` },
    { n:"02", title:"Table columns", desc:"Columns, cell types, child accordion", summary:`${s.columns.length} columns${s.accordion?` · child ${s.childKind}`:""}` },
    { n:"03", title:"Table data", desc:"Generate rows or paste real ones", summary:s.rowMode==="generate"?`Generate ${s.rowCount} rows`:"Pasted rows" },
    { n:"04", title:"Status summary box", desc:"Which real strip it matches", summary:`Style ${s.summaryStyle} · ${s.counters.length} counters` },
    { n:"05", title:"Automation", desc:"Set by your step 04 choice", summary:({full:"AT row below the box",box:"AT is the box",none:"No automation"})[s.automation] },
    { n:"06", title:"Row click behaviour", desc:"Nothing, sidebar, or navigate", summary:s.target==="navigate"?`Navigate → ${(SB_NAV_SCREENS.find(x=>x.id===s.navScreen)||{}).name}`:(SB_TARGETS.find(t=>t.id===s.target)||{}).name },
    { n:"07", title:"Filter bar", desc:"Date range, filters, search", summary:`${s.dateFilter?"Date range":"No date filter"}${s.search?" · Search":""}` },
    { n:"08", title:"Behaviour & review", desc:"Review Mode, sorting, pagination", summary:[s.reviewMode&&"Review Mode",s.sorting&&"Sorting",s.pagination&&"Pagination"].filter(Boolean).join(" · ")||"—" },
  ];
  const lastStep = SB_STEPS[SB_STEPS.length-1].n;

  return (<React.Fragment>
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(15,23,42,.45)",opacity:open?1:0,pointerEvents:open?"auto":"none",transition:"opacity .2s",zIndex:900}}></div>
    {view==="form" && <SBRail open={open} steps={SB_STEPS} current={openSec} onPick={goSec} />}
    <div style={{position:"fixed",top:0,right:SB_OFFSET,bottom:0,width:SB_W,maxWidth:"96vw",background:"#fff",boxShadow:"-8px 0 32px rgba(15,23,42,.22)",borderRadius:"10px 0 0 10px",overflow:"hidden",transform:open?"translateX(0)":"translateX(120%)",transition:"transform .26s cubic-bezier(.4,0,.2,1)",zIndex:901,display:"flex",flexDirection:"column",font:"400 14px/18px Roboto"}}>
      <div style={{background:"linear-gradient(to right, rgb(56,71,90) 0%, rgb(28,45,66) 100%)",color:"#fff",padding:"16px 24px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <span style={{fontSize:18}}>📖</span>
        <div style={{display:"flex",flexDirection:"column"}}>
          <span style={{font:"500 16px/20px Roboto"}}>Screen Builder</span>
          <span style={{font:"400 12px/16px Roboto",color:"rgba(255,255,255,.6)"}}>{view==="form"?"Describe the screen — we write the prompt":"Copy this into the Neos Claude design chat"}</span>
        </div>
        <button onClick={onClose} style={{marginLeft:"auto",background:"rgba(255,255,255,.12)",border:"none",color:"#fff",width:28,height:28,borderRadius:4,cursor:"pointer",font:"400 16px/1 Roboto"}}>×</button>
      </div>

      {view==="form" ? (
      <div ref={bodyRef} className="ws-scrollbody" style={{flex:1,overflowY:"auto",background:"#fff"}}>
        <SBSection n="01" title="What are you building" hint="A whole screen, or a side drawer that opens over an existing screen." {...sec("01")}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <SBPick id="screen" selected={s.buildKind} onSelect={v=>set("buildKind",v)} title="A new screen" blurb="A full table screen — its own summary box, filter bar and rows." />
            <SBPick id="drawer" selected={s.buildKind} onSelect={v=>set("buildKind",v)} title="A side drawer" blurb="No new screen — a right-hand drawer that opens over an existing table." />
          </div>
          {s.buildKind==="drawer" && (<React.Fragment>
            <div style={{height:1,background:SB_LINE,margin:"4px 0"}}></div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <SBSidePick id="patient-detail" selected={s.drawerKind} onSelect={v=>setS(p=>({...p,drawerKind:v,drawerWidth:v==="document-slider"?"520":"960"}))} title="Patient detail drawer" blurb="Full-width white drawer: patient identity strip, Eligibility Info / Authorization Info tabs, collapsible sections, episode tabs and the Authorization Details table." preview={<SBDrawerPreview id="patient-detail" />} />
              <SBSidePick id="document-slider" selected={s.drawerKind} onSelect={v=>setS(p=>({...p,drawerKind:v,drawerWidth:v==="document-slider"?"520":"960"}))} title="Document slider" blurb="Narrow drawer: Documents header with REF ID / Payor Auth ID / Auth Type / Service Type, Request Docs – Response Docs tabs, Download All, and documents grouped by date with a View link." preview={<SBDrawerPreview id="document-slider" />} />
            </div>
          </React.Fragment>)}
          {s.buildKind==="screen" && (<React.Fragment>
          <div style={{height:1,background:SB_LINE,margin:"4px 0"}}></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <SBPick id="new" selected={s.placement} onSelect={v=>set("placement",v)} title="New top-level menu" blurb={`Adds “${s.tabLabel||"…"}” to the top nav beside Dashboard / Eligibility / Authorization / CDM / Assessments.`} />
            <SBPick id="existing" selected={s.placement} onSelect={v=>set("placement",v)} title="Add to an existing menu" blurb="No new top-nav entry — the screen becomes another sub-tab inside a menu that's already there." />
          </div>
          {s.placement==="existing" && (
            <div style={{border:"1px solid #bfdbfe",background:"#f4f8ff",borderRadius:6,padding:12,display:"flex",flexDirection:"column",gap:10}}>
              <SBField label="Which existing menu"><SBSelect value={s.hostMenu} onChange={v=>setS(p=>({...p,hostMenu:v,bandTitle:(SB_HOSTS.find(h=>h.key===v)||{}).band||p.bandTitle,routerKey:v}))} options={SB_HOSTS.map(h=>h.key)} /></SBField>
              <div style={{font:"400 11px/16px Roboto",color:SB_MUTED}}>
                <b style={{color:SB_INK,fontWeight:500}}>{(SB_HOSTS.find(h=>h.key===s.hostMenu)||{}).band}</b> currently has these sub-tabs: {((SB_HOSTS.find(h=>h.key===s.hostMenu)||{}).subs||[]).join(" · ")}. Your “{s.subTabLabel}” tab will be added {s.subTabPos==="first"?"before them":"after them"}.
              </div>
              <SBField label="Where in the sub-tab row"><SBSelect value={s.subTabPos} onChange={v=>set("subTabPos",v)} options={["last","first"]} /></SBField>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <SBField label={s.placement==="new"?"Top-level menu label":"Screen name (internal)"}><SBText value={s.tabLabel} onChange={v=>setS(p=>({...p,tabLabel:v,routerKey:p.placement==="existing"?p.routerKey:slugify(v),slug:slugify(v),pfx:v.replace(/[^A-Za-z]/g,"").slice(0,3).toUpperCase()}))} placeholder="Assessments" /></SBField>
            {s.placement==="new"
              ? <SBField label="Router key" hint="lowercase, one word"><SBText value={s.routerKey} onChange={v=>set("routerKey",v)} mono /></SBField>
              : <SBField label="Host menu" hint="set above"><SBText value={s.hostMenu} onChange={()=>{}} mono /></SBField>}
            <SBField label={s.placement==="new"?"Client-center label (section band)":"Section band title (existing)"}><SBText value={s.bandTitle} onChange={v=>set("bandTitle",v)} placeholder="Assessment Client Center" /></SBField>
            <SBField label={s.placement==="new"?"Primary sub-tab label":"New sub-tab label"}><SBText value={s.subTabLabel} onChange={v=>set("subTabLabel",v)} /></SBField>
            <SBField label="File slug" hint={`→ ${s.slug}-request-view${SB_EXT}`}><SBText value={s.slug} onChange={v=>set("slug",v)} mono /></SBField>
            <SBField label="Identifier prefix" hint="ERV → your prefix"><SBText value={s.pfx} onChange={v=>set("pfx",v.toUpperCase())} mono /></SBField>
          </div>
          <SBField label="Mode dropdown options" hint="pipe-separated; shown in the “All … ▾” title control"><SBText value={s.modeOptions} onChange={v=>set("modeOptions",v)} /></SBField>
          </React.Fragment>)}
        </SBSection>

        <SBSection n="D1" title="Where it opens from" hint="Which screen, which table or section inside it, and which value the user clicks — plus where the file lives." {...sec("D1")}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <SBField label="Which screen"><SBSelect value={s.openFromScreen} onChange={v=>{ const src=SB_SOURCES.find(x=>x.screen===v)||SB_SOURCES[0]; setS(p=>({...p,openFromScreen:v,hostMenu:src.menu,openFromSection:src.sections[0].name,openFromColumn:src.sections[0].cols[0]})); }} options={SB_SOURCES.map(x=>x.screen)} /></SBField>
            <SBField label="Which table or section"><SBSelect value={s.openFromSection} onChange={v=>{ const src=SB_SOURCES.find(x=>x.screen===s.openFromScreen)||SB_SOURCES[0]; const sec2=src.sections.find(x=>x.name===v)||src.sections[0]; setS(p=>({...p,openFromSection:v,openFromColumn:sec2.cols[0]})); }} options={((SB_SOURCES.find(x=>x.screen===s.openFromScreen)||SB_SOURCES[0]).sections).map(x=>x.name)} /></SBField>
            <SBField label="Which column / value is clicked"><SBSelect value={s.openFromColumn} onChange={v=>set("openFromColumn",v)} options={(((SB_SOURCES.find(x=>x.screen===s.openFromScreen)||SB_SOURCES[0]).sections.find(x=>x.name===s.openFromSection)||{cols:[]}).cols)} /></SBField>
          </div>
          <div style={{height:1,background:SB_LINE,margin:"2px 0"}}></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <SBField label="File slug" hint={`→ ${s.slug}-drawer.jsx`}><SBText value={s.slug} onChange={v=>set("slug",v)} mono /></SBField>
            <SBField label="Identifier prefix" hint={`Menu: ${(SB_HOSTS.find(h=>h.key===s.hostMenu)||{}).band||s.hostMenu} — from the screen above`}><SBText value={s.pfx} onChange={v=>set("pfx",v.toUpperCase())} mono /></SBField>
          </div>
        </SBSection>

        <SBSection n="D2" title="Drawer content" hint={s.drawerKind==="document-slider"?"The Documents drawer — header fields, tabs and how documents are grouped.":"The patient detail drawer — identity strip, tabs, and the blocks stacked inside Authorization Info."} {...sec("D2")}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 160px",gap:12}}>
            <SBField label={s.drawerKind==="document-slider"?"Header field pairs":"Identity strip fields"} hint="comma-separated, in order">
              {s.drawerKind==="document-slider"
                ? <SBText value={s.drawerDocHeader} onChange={v=>set("drawerDocHeader",v)} />
                : <SBText value={s.drawerIdentity} onChange={v=>set("drawerIdentity",v)} />}
            </SBField>
            <SBField label="Drawer width (px)" hint={s.drawerKind==="document-slider"?"wide enough for the header pairs on one line":""}><SBSelect value={s.drawerWidth} onChange={v=>set("drawerWidth",v)} options={["420","520","560","720","960","1180"]} /></SBField>
          </div>
          {s.drawerKind==="patient-detail" ? (<React.Fragment>
            <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:12}}>
              <SBField label="Tabs inside the drawer" hint="pipe-separated; leave empty for no tabs"><SBText value={s.drawerTabs} onChange={v=>set("drawerTabs",v)} /></SBField>
              <SBField label="Top-right link" hint="empty for none"><SBText value={s.drawerHeaderLink} onChange={v=>set("drawerHeaderLink",v)} /></SBField>
            </div>
            <SBField label="Blocks inside the active tab" hint="collapsible-section = the › Referral / Provider / Diagnosis rows · episode-tabs = the Episode – EpiNNN tab row · stat-chips = the grey date chips · auth-details-table = the wide Authorization Details table"><span></span></SBField>
            <SBBlocks items={s.drawerBlocks} set={v=>set("drawerBlocks",v)} />
          </React.Fragment>) : (<React.Fragment>
            <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:12}}>
              <SBField label="Tabs" hint="pipe-separated; leave empty for a single list"><SBText value={s.drawerDocTabs} onChange={v=>set("drawerDocTabs",v)} /></SBField>
              <SBField label="Group documents by" hint="leave empty for a flat list"><SBText value={s.drawerDocGroupBy} onChange={v=>set("drawerDocGroupBy",v)} /></SBField>
            </div>
            {s.drawerDocTabs.split("|").map(t=>t.trim()).filter(Boolean).length > 0 ? (
              <div style={{border:"1px solid #bfdbfe",background:"#f4f8ff",borderRadius:6,padding:12,display:"flex",flexDirection:"column",gap:10}}>
                <span style={{font:"500 12px/16px Roboto",color:SB_INK}}>What does each tab list?</span>
                {s.drawerDocTabs.split("|").map(t=>t.trim()).filter(Boolean).map(t=>(
                  <SBField key={t} label={t} hint="document names, comma-separated">
                    <SBText value={(s.drawerDocTabDocs||{})[t]||""} onChange={v=>set("drawerDocTabDocs",{...(s.drawerDocTabDocs||{}),[t]:v})} />
                  </SBField>
                ))}
              </div>
            ) : (
              <SBField label="Documents listed in the drawer" hint="document names, comma-separated"><SBText value={s.drawerDocList} onChange={v=>set("drawerDocList",v)} /></SBField>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <SBToggle on={s.drawerDownload} onChange={v=>set("drawerDownload",v)} label="Download All" sub="Right of the tab row" />
              <SBToggle on={s.drawerPreview} onChange={v=>set("drawerPreview",v)} label="Inline preview pane" sub="Off in the reference design" />
              <SBToggle on={s.drawerUpload} onChange={v=>set("drawerUpload",v)} label="Upload action" />
            </div>
          </React.Fragment>)}
        </SBSection>

        <SBSection n="D3" title="Drawer behaviour" hint="Footer actions and anything else the prompt should say." {...sec("D3")}>
          <SBField label="Footer actions" hint="comma-separated"><SBText value={s.drawerActions} onChange={v=>set("drawerActions",v)} /></SBField>
          <SBField label="Anything else the prompt should say"><SBArea value={s.drawerNotes} onChange={v=>set("drawerNotes",v)} rows={4} placeholder="Edge cases, which fields are editable, what Save changes on the row…" /></SBField>
        </SBSection>

        <SBSection n="02" title="Table columns" hint="Order, label, data key, cell type, width and sortability — this is what differs most screen to screen." {...sec("02")}>
          <SBColumns cols={s.columns} set={v=>set("columns",v)} />
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:4}}>
            <SBToggle on={s.reviewedCol} onChange={v=>set("reviewedCol",v)} label={`"Reviewed?" column`} sub="Per-row checkbox for the patient record" />
            <SBToggle on={s.accordion} onChange={v=>set("accordion",v)} label="Expandable child accordion" sub="Caret in column 1 reveals a child table" />
          </div>
          {s.accordion && (
            <div style={{border:`1px solid #bfdbfe`,background:"#f4f8ff",borderRadius:6,padding:12,display:"flex",flexDirection:"column",gap:10}}>
              <span style={{font:"500 12px/16px Roboto",color:SB_INK}}>What does the expanded child show?</span>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["table","A nested table","Child rows with their own columns"],["fields","A field detail block","Label / value pairs, no table"]].map(([id,t,b])=>(
                  <SBPick key={id} id={id} selected={s.childKind} onSelect={v=>set("childKind",v)} title={t} blurb={b} />
                ))}
              </div>
              {s.childKind==="table" ? (<React.Fragment>
                <SBField label="Child table column names" hint="comma-separated, in order"><SBArea value={s.childColumns} onChange={v=>set("childColumns",v)} rows={2} placeholder="Check Date, Payor, Plan, Coverage Status, Result" /></SBField>
                <SBField label="How many child rows per parent"><SBText value={s.childRowNote} onChange={v=>set("childRowNote",v)} placeholder="2–4 previous checks per expanded row" /></SBField>
              </React.Fragment>) : (
                <SBField label="Child field names" hint="comma-separated, in order"><SBArea value={s.childFields} onChange={v=>set("childFields",v)} rows={2} placeholder="Previous Check Date, Payor, Result, Checked By" /></SBField>
              )}
            </div>
          )}
          <SBField label="Action cell target"><SBSelect value={s.actionTarget} onChange={v=>set("actionTarget",v)} options={["View Details","Edit Details","View / Edit Details"]} /></SBField>
        </SBSection>

        <SBSection n="03" title="Table data" {...sec("03")}>
          <div style={{display:"flex",gap:8}}>
            {[["generate","Generate rows"],["paste","Paste my rows"]].map(([k,l])=>(
              <button key={k} onClick={()=>set("rowMode",k)} style={{flex:1,padding:"8px 10px",borderRadius:4,border:`1px solid ${s.rowMode===k?SB_BLUE:SB_LINE}`,background:s.rowMode===k?"#f4f8ff":"#fff",color:s.rowMode===k?SB_BLUE:SB_INK,font:"400 13px Roboto",cursor:"pointer"}}>{l}</button>
            ))}
          </div>
          {s.rowMode==="generate" ? (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1.4fr",gap:12}}>
              <SBField label={`Row count — ${s.rowCount}`}><input type="range" min="8" max="80" step="1" value={s.rowCount} onChange={e=>set("rowCount",+e.target.value)} style={{width:"100%",accentColor:SB_BLUE}} /></SBField>
              <SBField label="Date spread"><SBText value={s.dateSpread} onChange={v=>set("dateSpread",v)} placeholder="the last 60 days" /></SBField>
            </div>
          ) : <SBArea value={s.pastedRows} onChange={v=>set("pastedRows",v)} rows={6} placeholder="Paste a JSON array or a table dump of the real rows…" />}
        </SBSection>

        <SBSection n="04" title="Status summary box" hint="The clickable counter strip above the table. Each option below is the real strip from a live screen — pick the one your screen should match." {...sec("04")}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[["A","Business status + AT status row below","Eligibility Request View. Row 1 = the business-status box; row 2 = the Automation (AT) Status row beneath it."],
              ["B","AT status only","CDM Request View. The box IS the automation status, icon inside each card. No business-status counters."],
              ["C","Business status only","Patient Auth Summary View. Business statuses in the box and nothing else — no AT row, no AT counters."]].map(([id,t,b])=>(
              <SBStylePick key={id} id={id} selected={s.summaryStyle} onSelect={v=>setS(p=>({...p,summaryStyle:v,automation:v==="B"?"box":v==="C"?"none":"full"}))} title={`Style ${id} — ${t}`} blurb={b} />
            ))}
          </div>
          <SBField label="Counters"><span></span></SBField>
          <SBCounters items={s.counters} set={v=>set("counters",v)} showIcons={s.summaryStyle!=="A"} />
        </SBSection>

        <SBSection n="05" title="Automation" hint="Set by your Style choice in step 04 — the two always match." {...sec("05")}>
          <div style={{border:"1px solid #bfdbfe",background:"#f4f8ff",borderRadius:6,padding:"12px 14px",display:"flex",flexDirection:"column",gap:4}}>
            <span style={{font:"500 13px/18px Roboto",color:SB_INK}}>{({full:"Automation (AT) Status row below the summary box",box:"Automation lives inside the summary box",none:"No automation on this screen"})[s.automation]}</span>
            <span style={{font:"400 12px/17px Roboto",color:SB_MUTED}}>Because you picked <b style={{color:SB_INK,fontWeight:500}}>Style {s.summaryStyle}</b> in step 04. Change step 04 to change this.</span>
          </div>
          {s.automation!=="none" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <SBToggle on={s.atColumn} onChange={v=>set("atColumn",v)} label={`"AT Status" column`} sub="18×18 icon + tooltip in each row" />
              <SBToggle on={s.autoLogTab} onChange={v=>set("autoLogTab",v)} label="Automation Log sub-tab" sub={`${s.slug}-automation-log${SB_EXT}`} />
            </div>
          )}
          {false && (
            <div style={{background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:4,padding:"8px 10px",font:"400 12px/16px Roboto",color:"#9a3412"}}></div>
          )}
        </SBSection>

        <SBSection n="06" title="Row click behaviour" hint="The table shows one line per record — this step decides what happens when the user clicks that line's first column. Pick one of three." {...sec("06")}>
          <div style={{border:`1px solid ${SB_LINE}`,background:"#f8fafc",borderRadius:6,padding:"10px 12px",font:"400 12px/18px Roboto",color:SB_MUTED}}>
            This is separate from the row’s Action cell (“{s.actionTarget}”, step 02) and from the expand caret — a row can have all three.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {SB_TARGETS.map(t=>(
              <SBPick key={t.id} id={t.id} selected={s.target} onSelect={v=>set("target",v)} title={t.name} blurb={t.blurb}>
                <SBPreview id={t.id} />
              </SBPick>
            ))}
          </div>
          {s.target==="drawer" && <SBField label="Sidebar fields" hint="comma-separated, in order"><SBText value={s.drawerFields} onChange={v=>set("drawerFields",v)} /></SBField>}
          {s.target==="navigate" && (
            <div style={{border:"1px solid #bfdbfe",background:"#f4f8ff",borderRadius:6,padding:12,display:"flex",flexDirection:"column",gap:10}}>
              <SBField label="Which screen does it open"><SBSelect value={s.navScreen} onChange={v=>set("navScreen",v)} options={SB_NAV_SCREENS.map(x=>x.id)} /></SBField>
              <div style={{font:"400 11px/15px Roboto",color:SB_MUTED}}>{(SB_NAV_SCREENS.find(x=>x.id===s.navScreen)||{}).blurb}</div>
              {s.navScreen==="new-screen" && <SBField label="Describe the new screen"><SBArea value={s.navNewScreenNote} onChange={v=>set("navNewScreenNote",v)} rows={2} placeholder="What it shows, which sections, which data…" /></SBField>}
              {s.navScreen==="patient-summary" && <SBField label={`Summary cards on that screen — ${s.summaryCardCount}`}><input type="range" min="2" max="8" value={s.summaryCardCount} onChange={e=>set("summaryCardCount",+e.target.value)} style={{width:"100%",accentColor:SB_BLUE}} /></SBField>}
              <SBField label="Does it carry a filter">
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {[["record","Filtered to the clicked record","Opens showing only that patient / that request."],
                    ["keep","Carries the current table filters","Date range, field filters, search and status travel across."],
                    ["none","No filter","Destination opens in its own default state."]].map(([id,t,b])=>(
                    <SBPick key={id} id={id} selected={s.navFilter} onSelect={v=>set("navFilter",v)} title={t} blurb={b} />
                  ))}
                </div>
              </SBField>
            </div>
          )}
        </SBSection>

        <SBSection n="07" title="Filter bar (the blue strip)" hint="Everything here must actually filter — no decorative controls." {...sec("07")}>
          <SBToggle on={s.dateFilter} onChange={v=>set("dateFilter",v)} label="Calendar / date-range filter" sub="Working popover: month nav, range apply, clear to “All”, close on outside click" />
          {s.dateFilter && (
            <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr 90px",gap:10}}>
              <SBField label="Date filter label"><SBText value={s.dateFilterLabel} onChange={v=>set("dateFilterLabel",v)} /></SBField>
              <SBField label="Date field key"><SBText value={s.dateFilterKey} onChange={v=>set("dateFilterKey",v)} mono /></SBField>
              <SBField label="Default days"><SBText value={String(s.dateWindow)} onChange={v=>set("dateWindow",+v.replace(/\D/g,"")||0)} /></SBField>
            </div>
          )}
          <SBField label="“Add More Filters” fields" hint="one per line or comma-separated — “Label → dataKey”"><SBArea value={s.filterFields} onChange={v=>set("filterFields",v)} rows={2} /></SBField>
          <SBToggle on={s.search} onChange={v=>set("search",v)} label="Search input" sub="Right-aligned, 240px, live substring match" />
          {s.search && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <SBField label="Placeholder"><SBText value={s.searchPlaceholder} onChange={v=>set("searchPlaceholder",v)} /></SBField>
              <SBField label="Searchable fields"><SBText value={s.searchFields} onChange={v=>set("searchFields",v)} mono /></SBField>
            </div>
          )}
        </SBSection>

        <SBSection n="08" title="Behaviour & review" hint="Review Mode is usually on — confirm it and the rest." {...sec("08")}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <SBToggle on={s.reviewMode} onChange={v=>set("reviewMode",v)} label="Review Mode toggle" sub="In the section band, right side" />
            <SBToggle on={s.reviewedCol} onChange={v=>set("reviewedCol",v)} label={`"Reviewed?" column`} sub="Checkbox per patient record" />
            <SBToggle on={s.sorting} onChange={v=>set("sorting",v)} label="Column sorting" />
            <SBToggle on={s.pagination} onChange={v=>set("pagination",v)} label="Pagination" />
            <SBToggle on={s.stickyHeader} onChange={v=>set("stickyHeader",v)} label="Sticky header + viewport fit" />
            <SBToggle on={s.followUp} onChange={v=>set("followUp",v)} label="Follow-up date state" />
            <SBToggle on={s.addNote} onChange={v=>set("addNote",v)} label="Add Note modal" />
            <SBToggle on={s.homeTile} onChange={v=>set("homeTile",v)} label="Add a Home tile" />
            <SBToggle on={s.standalone} onChange={v=>set("standalone",v)} label="Register in standalone export" />
          </div>
          <SBField label="Anything else the prompt should say"><SBArea value={s.notes} onChange={v=>set("notes",v)} rows={3} placeholder="Optional. Extra rules, edge cases, data quirks…" /></SBField>
        </SBSection>
        <div style={{height:12}}></div>
      </div>
      ) : (
      <div className="ws-scrollbody" style={{flex:1,overflowY:"auto",background:"#f8fafc",padding:20}}>
        <div style={{background:"#fff",border:`1px solid ${SB_LINE}`,borderRadius:6,padding:16}}>
          <pre style={{margin:0,whiteSpace:"pre-wrap",wordBreak:"break-word",font:"400 11.5px/17px ui-monospace,Menlo,Consolas,monospace",color:SB_INK}}>{prompt}</pre>
        </div>
      </div>
      )}

      <div style={{flexShrink:0,borderTop:`1px solid ${SB_LINE}`,background:"#fff",padding:"12px 20px",display:"flex",alignItems:"center",gap:10}}>
        {view==="form" ? (<React.Fragment>
          <button onClick={()=>setS(SB_DEFAULT)} style={{background:"#fff",border:`1px solid ${SB_LINE}`,borderRadius:4,padding:"9px 14px",font:"400 13px Roboto",color:SB_MUTED,cursor:"pointer"}}>Reset</button>
          {openSec!==lastStep && <button onClick={()=>setView("prompt")} style={{background:"#fff",border:`1px solid ${SB_LINE}`,borderRadius:4,padding:"9px 14px",font:"400 13px Roboto",color:SB_BLUE,cursor:"pointer"}}>Give a Prompt now</button>}
          {openSec===lastStep
            ? <button onClick={()=>setView("prompt")} style={{marginLeft:"auto",background:SB_BLUE,border:"none",borderRadius:4,padding:"9px 18px",font:"500 13px Roboto",color:"#fff",cursor:"pointer"}}>Give a Prompt →</button>
            : <button onClick={()=>{ const i=SB_STEPS.findIndex(x=>x.n===openSec); goSec((SB_STEPS[i+1]||SB_STEPS[0]).n); }} style={{marginLeft:"auto",background:SB_BLUE,border:"none",borderRadius:4,padding:"9px 18px",font:"500 13px Roboto",color:"#fff",cursor:"pointer"}}>Next →</button>}
        </React.Fragment>) : (<React.Fragment>
          <button onClick={()=>setView("form")} style={{background:"#fff",border:`1px solid ${SB_LINE}`,borderRadius:4,padding:"9px 14px",font:"400 13px Roboto",color:SB_INK,cursor:"pointer"}}>← Back to edit</button>
          <span style={{font:"400 12px/16px Roboto",color:SB_MUTED}}>{prompt.length.toLocaleString()} characters</span>
          <button onClick={download} style={{marginLeft:"auto",background:"#fff",border:`1px solid ${SB_LINE}`,borderRadius:4,padding:"9px 14px",font:"400 13px Roboto",color:SB_INK,cursor:"pointer"}}>Download .md</button>
          <button onClick={copy} style={{background:copied?"#16a34a":SB_BLUE,border:"none",borderRadius:4,padding:"9px 18px",font:"500 13px Roboto",color:"#fff",cursor:"pointer",minWidth:132}}>{copied?"Copied ✓":"Copy prompt"}</button>
        </React.Fragment>)}
      </div>
    </div>
  </React.Fragment>);
}

if (typeof window !== "undefined") { window.ScreenBuilderDrawer = ScreenBuilderDrawer; window.sbBuildPrompt = sbBuildPrompt; }
