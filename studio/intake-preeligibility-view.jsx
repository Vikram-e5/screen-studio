// Intake — Pre-eligibility View. Mirrors IntakeEReferralView structure with the
// Pre-eligibility column set: "Eligibility status summary" (Accepted/Declined/
// Ineligible) drives the Coverage status column; docs are Pre-Verification docs.
const { useState: useIPE } = React;

const IPE_ROWS = [
  { id:"ip1",  name:"Marvin Mckinney",    dob:"04/02/1958", branch:"Bcode", agency:"Agency 1", policy:"POL1152135", plan:"Aetna Medicare",  sendOrg:"Silver Cross Hosp", sendFac:"Silver Cross ED", zip:"60441", gw:"Availity", cov:"accepted",  at:"thumb",     alerts:0, docs:true,  gender:"Female", pdd:"04/20/25", ehrSync:true, alertItems:[] },
  { id:"ip2",  name:"Esther Howard",      dob:"11/19/1966", branch:"Bcode", agency:"Agency 1", policy:"POL1152136", plan:"Texas Medicaid",  sendOrg:"St. Luke's Health", sendFac:"St. Luke's ICU",  zip:"77002", gw:"",         cov:"ineligible", at:"warning",   alerts:1, docs:false, gender:"Female", pdd:"04/22/25", ehrSync:false, alertItems:[{text:"Secondary plan unverified",desc:"Only the primary plan returned an active 271 response."}] },
  { id:"ip3",  name:"Cameron Williamson", dob:"02/27/1971", branch:"Bcode", agency:"Agency 1", policy:"POL1152137", plan:"Humana",          sendOrg:"Rush Copley",       sendFac:"Rush Copley Rehab", zip:"60540", gw:"Availity", cov:"accepted", at:"hourglass", alerts:0, docs:false, gender:"Male",   pdd:"04/25/25", ehrSync:true, alertItems:[] },
  { id:"ip4",  name:"Leslie Alexander",   dob:"06/09/1949", branch:"Bcode", agency:"Agency 1", policy:"POL1152138", plan:"Medicare",        sendOrg:"Advocate Christ",   sendFac:"Advocate Christ ED", zip:"60453", gw:"Inovalon", cov:"declined", at:"warning",   alerts:2, docs:true,  gender:"Female", pdd:"04/28/25", ehrSync:false, alertItems:[{text:"Secondary plan unverified",desc:"Only the primary plan returned an active 271 response."},{text:"Auth number not returned",desc:"Payor accepted the request but has not issued an authorization number."}] },
  { id:"ip5",  name:"Robert Fox",         dob:"01/14/1963", branch:"Bcode", agency:"Agency 1", policy:"POL1152139", plan:"UHC",             sendOrg:"Elmhurst Memorial", sendFac:"Elmhurst Med Surg", zip:"60126", gw:"UHC",      cov:"accepted", at:"thumb",     alerts:0, docs:true,  gender:"Male",   pdd:"04/24/25", ehrSync:true },
  { id:"ip6",  name:"Jenny Wilson",       dob:"09/30/1957", branch:"Bcode", agency:"Agency 1", policy:"POL1152140", plan:"Humana",          sendOrg:"Northwestern Med",  sendFac:"Northwestern Cards", zip:"60611", gw:"Availity", cov:"ineligible", at:"warning", alerts:0, docs:true,  gender:"Female", pdd:"04/30/25", ehrSync:true, alertItems:[] },
  { id:"ip7",  name:"Jacob Jones",        dob:"05/03/1980", branch:"Bcode", agency:"Agency 1", policy:"POL1152141", plan:"Aetna",           sendOrg:"Loyola Medicine",   sendFac:"Loyola Ortho",     zip:"60153", gw:"Waystar",  cov:"accepted", at:"thumb",     alerts:0, docs:false, gender:"Male",   pdd:"04/27/25", ehrSync:true },
  { id:"ip8",  name:"Guy Hawkins",        dob:"08/21/1969", branch:"Bcode", agency:"Agency 1", policy:"POL1152142", plan:"UHC",             sendOrg:"Amita St Alexius",  sendFac:"Amita St Alexius ED", zip:"60067", gw:"UHC",   cov:"declined", at:"thumb",     alerts:0, docs:true,  gender:"Male",   pdd:"04/29/25", ehrSync:true },
  { id:"ip9",  name:"Jane Cooper",        dob:"03/11/1975", branch:"Bcode", agency:"Agency 1", policy:"POL1152143", plan:"Aetna",           sendOrg:"Edward Hospital",   sendFac:"Edward Hosp Rehab", zip:"60563", gw:"Waystar",  cov:"accepted", at:"thumb",     alerts:0, docs:false, gender:"Female", pdd:"04/23/25", ehrSync:true },
  { id:"ip10", name:"Kristin Watson",     dob:"12/05/1961", branch:"Bcode", agency:"Agency 1", policy:"POL1152144", plan:"Humana",          sendOrg:"Adventist LaGrange",sendFac:"Adventist LaGrange ED", zip:"60525", gw:"Availity", cov:"ineligible", at:"warning", alerts:1, docs:false, gender:"Female", pdd:"05/01/25", ehrSync:false, alertItems:[{text:"Auth number not returned",desc:"Payor accepted the request but has not issued an authorization number."}] },
];
// Referral status, completed-tag assignment and import-attachment flags.
const IPE_REF_STATUS = ["New","In Review","Accepted","Pending Info","Declined"];
IPE_ROWS.forEach((r,i)=>{
  r.referralStatus = IPE_REF_STATUS[i % IPE_REF_STATUS.length];
  r.completedTag = i % 3 !== 1;
  r.importAttachment = i % 4 !== 2;
  if (!r.gender) r.gender = i % 2 ? "Female" : "Male";
});
if (typeof window !== "undefined") window.IPE_ROWS = IPE_ROWS;

const ipePad = n => String(n).padStart(2,"0");
function ipeCounts(rows) {
  return {
    all: rows.length, accepted: rows.filter(r=>r.cov==="accepted").length, declined: rows.filter(r=>r.cov==="declined").length, ineligible: rows.filter(r=>r.cov==="ineligible").length,
    at: { completed: ipePad(rows.filter(r=>r.at==="thumb").length), needsAttn: ipePad(rows.filter(r=>r.at==="warning").length), inProgress: ipePad(rows.filter(r=>r.at==="hourglass").length) },
  };
}
const IPE_NA_TERM = ["Coverage terminated at payor","Plan disenrolled prior to check"];
const IPE_NA_FAIL = ["Payor portal unavailable during check","Session timed out during pre-eligibility check"];
const IPE_NA_ALL = IPE_NA_TERM.map(l=>[l,"terminated"]).concat(IPE_NA_FAIL.map(l=>[l,"failed"]));
(function(){ let i=0; IPE_ROWS.forEach(r=>{ if(r.at==="warning"){ if(!r.atReason){ const pair=IPE_NA_ALL[i%IPE_NA_ALL.length]; r.atReason=pair[0]; r.atGroup=pair[1]; } i++; } }); })();
function computeIpeNA(rows) {
  rows = rows || IPE_ROWS;
  const term={}, fail={};
  rows.forEach(r=>{ if(r.at!=="warning") return; const reason=r.atReason||"Unspecified reason"; const grp=r.atGroup||"terminated"; if(grp==="failed") fail[reason]=(fail[reason]||0)+1; else term[reason]=(term[reason]||0)+1; });
  const sorted=(m)=>Object.entries(m).sort((a,b)=>b[1]-a[1]);
  const termReasons=sorted(term), failReasons=sorted(fail);
  const sum=(l)=>l.reduce((s,x)=>s+x[1],0);
  return { termReasons, failReasons, termTotal:sum(termReasons), failTotal:sum(failReasons) };
}
const IPE_FILTER_FIELDS = [
  { key:"agency", label:"Agency" },
  { key:"branch", label:"Branch" },
  { key:"plan",   label:"Primary Plan" },
  { key:"gw",     label:"Gateway" },
];
const IPE_COV_ITEMS = [
  { id:"all",        label:"All Requests", color:"rgb(21,95,130)", weight:1.1 },
  { id:"accepted",   label:"Active",       color:"rgb(22,163,74)", weight:1 },
  { id:"declined",   label:"Inactive",     color:"rgb(220,38,38)", weight:1 },
  { id:"ineligible", label:"Exceptions",   color:"rgb(217,119,6)", weight:1 },
];

function IPEFilterChip({ label, onRemove }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:10,background:"#f4f6f9",border:"1px solid #d8dee6",borderRadius:6,padding:"6px 10px",font:"400 12px/16px Roboto",color:"#334155",whiteSpace:"nowrap",flexShrink:0}}>
      {label}
      <button type="button" onClick={onRemove} title="Remove filter" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",border:"none",background:"transparent",color:"#64748b",fontSize:13,lineHeight:1,cursor:"pointer",padding:0}}>✕</button>
    </span>
  );
}
function IPEFilterBar({ search, onSearch, datePicker, filterFields, filterRows, fieldFilters, onFieldFilters, chips = [], onClearFilters }) {
  const [open, setOpen] = useIPE(false);
  const [dpOpen, setDpOpen] = useIPE(false);
  const ref = React.useRef(null);
  const dref = React.useRef(null);
  React.useEffect(()=>{ if(!open) return; const h=(e)=>{ if(ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[open]);
  React.useEffect(()=>{ if(!dpOpen) return; const h=(e)=>{ if(dref.current && !dref.current.contains(e.target)) setDpOpen(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[dpOpen]);
  const DP = (typeof window !== "undefined") && window.DatePicker;
  const FP = (typeof window !== "undefined") && window.FilterPopover;
  const labelOf = (k)=> ((filterFields||[]).find(f=>f.key===k)||{}).label || k;
  const fieldTags = [];
  (fieldFilters||[]).forEach(f => f.values.forEach(v => fieldTags.push({
    id:`${f.field}:${v}`, label:`${labelOf(f.field)}: ${v}`,
    onRemove: () => onFieldFilters((fieldFilters.map(x=> x.field===f.field ? {...x, values:x.values.filter(y=>y!==v)} : x)).filter(x=>x.values.length))
  })));
  return (
    <div style={{background:"#eef4fb",borderBottom:"1px solid #e2e8f0",padding:"10px 24px",display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap"}}>
      <div style={{position:"relative",flexShrink:0}} ref={dref}>
        <button type="button" onClick={()=> datePicker && setDpOpen(v=>!v)} style={{background:"#fff",border:"1px solid #d8d8d8",borderRadius:4,padding:"5px 12px",font:"400 12px/16px Roboto",color:"#0f172a",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,flexShrink:0,whiteSpace:"nowrap"}}>
          {datePicker ? `${datePicker.label} : ${datePicker.value ? datePicker.value.start + " – " + datePicker.value.end : "All"}` : "Pre-Elig Check Date : 04/01/25 – 04/30/25"}
          <span style={{color:"#94a3b8",fontSize:9}}>▾</span>
        </button>
        {dpOpen && DP && datePicker && (
          <DP value={datePicker.value} available={datePicker.available} onChange={(d)=>{ datePicker.onChange(d); setDpOpen(false); }} />
        )}
      </div>
      <div style={{position:"relative",flexShrink:0}} ref={ref}>
        <button type="button" onClick={()=>setOpen(v=>!v)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:6,padding:"5px 4px",whiteSpace:"nowrap"}}>
          <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:"#2563eb",color:"#fff",fontSize:10,fontWeight:600,lineHeight:1}}>+</span>
          Add More Filters
        </button>
        {open && FP && filterFields && (
          <FP fields={filterFields} rows={filterRows} initial={fieldFilters}
            onApply={(f)=>{ onFieldFilters(f); setOpen(false); }} onClose={()=>setOpen(false)} />
        )}
      </div>
      <div className="chip-scroll" style={{display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap",overflowX:"auto",flex:"1 1 auto",minWidth:0}}>
        {chips.map(c => <IPEFilterChip key={c.id} label={c.label} onRemove={c.onRemove} />)}
        {fieldTags.map(t => <IPEFilterChip key={t.id} label={t.label} onRemove={t.onRemove} />)}
      </div>
      {(chips.length>0||fieldTags.length>0) && onClearFilters && (<button type="button" onClick={onClearFilters} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",padding:"5px 4px",flexShrink:0,whiteSpace:"nowrap"}}>Clear filters</button>)}
      <div style={{position:"relative",flexShrink:0}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" value={search} onChange={e=>onSearch(e.target.value)} placeholder="Search Patient Records" style={{width:240,background:"#fff",border:"1px solid #93c5e8",borderRadius:6,padding:"6px 12px 6px 30px",font:"400 12px/16px Roboto",color:"#0f172a",outline:"none"}} />
      </div>
    </div>
  );
}

function IPETitleCluster() {
  return (
    <div>
      <span style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Pre-eligibility View</span>
      <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Status Summary of Pre-Eligibility Checks Submitted to Payors</div>
      <div style={{marginTop:10,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block"}}>Click Coverage Status to view eligibility status details</div>
    </div>
  );
}

function IPESummaryStrip({ counts, activeCov, onPick }) {
  const byId = counts;
  return (
    <div style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",overflow:"hidden"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333",flexShrink:0}}>
        <span>Eligibility status</span><span>summary</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-start",flex:1}}>
        {IPE_COV_ITEMS.map(s=>{
          const active = s.id!=="all" && activeCov===s.id;
          const dim = activeCov && !active;
          return (
            <div key={s.id} role="button" onClick={()=>onPick(active?null:s.id)}
              style={{flex:`${s.weight} 1 0`,minWidth:0,padding:"10px 12px 12px",cursor:"pointer",opacity:(dim&&s.id!=="all")?0.35:1,transition:"opacity .12s,background .12s",background:active?"#f8fafc":"transparent"}}
              onMouseEnter={e=>{if(!active&&!dim)e.currentTarget.style.background="#fafbfc";}}
              onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent";}}>
              <div style={{height:3,borderRadius:2,background:s.color,opacity:active?1:0.85,marginBottom:8}}></div>
              <div style={{font:"400 12px/16px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#333",whiteSpace:"nowrap"}}>{s.label}</div>
              <div style={{font:"600 18px/22px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#0f172a",marginTop:4}}>{ipePad(byId[s.id]||0)}</div>
              {activeCov && s.id==="all" && (
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

const IPE_AT = [
  { id:"completed",  label:"Completed",       key:"completed",  get icon(){ return (window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png"; } },
  { id:"warning",    label:"Needs Attention", key:"needsAttn",   get icon(){ return (window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png"; }, num:"#d97706" },
  { id:"inprogress", label:"In Progress",     key:"inProgress",  get icon(){ return (window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png"; } },
];
function IPEAutomationStatus({ atCounts, atFilter, onFilter, atReasonFilter, onApply }) {
  const at = atCounts;
  const [openMenu, setOpenMenu] = useIPE(false);
  const rootRef = React.useRef(null);
  React.useEffect(()=>{ if(!openMenu) return; const h=(e)=>{ if(rootRef.current && !rootRef.current.contains(e.target)) setOpenMenu(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[openMenu]);
  const NAMenu = (typeof window !== "undefined") && window.ARVNeedsAttentionMenu;
  const ipeNa = computeIpeNA(IPE_ROWS);
  return (
    <div ref={rootRef} style={{display:"flex",alignItems:"center",font:"400 13px/16px Roboto",color:"#333",justifyContent:"flex-end",width:"100%"}}>
      <span style={{color:"#94a3b8",marginRight:12}}>Automation (AT) Status :</span>
      {IPE_AT.map((s,i)=>{
        const active=atFilter===s.id, dim=atFilter&&!active;
        return (
          <button key={s.id} type="button" onClick={()=>onFilter(active?null:s.id)} style={{background:"transparent",border:"none",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,padding:"2px 6px",borderRadius:4,opacity:dim?0.4:1,marginLeft:i>0?8:0,position:"relative"}}>
            <img src={s.icon} alt="" style={{width:18,height:18,objectFit:"contain"}} />
            <span style={{color:"#0f172a",fontSize:14}}>{s.label}</span>
            <span style={{fontWeight:600,color:s.num||"#0f172a"}}>{at[s.key]}</span>
            {s.id==="warning" && (
              <span style={{position:"relative",display:"inline-flex"}}>
                <span title="Sub-status breakdown" onClick={(e)=>{ e.stopPropagation(); setOpenMenu(o=>!o); }}
                  style={{width:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#2563eb"}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 8 L19 8 L12 17 Z" fill="currentColor" /></svg>
                </span>
                {openMenu && NAMenu && <NAMenu na={ipeNa} selectedReasons={atReasonFilter} onApply={onApply} naCount={parseInt(at.needsAttn,10)||0} onClose={()=>setOpenMenu(false)} />}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function IPEDocIcon({ size=18, faded=false }) {
  return <img src={(window.__resources&&window.__resources.attachmentType)||"icons/attachment-type.svg"} width={size} height={size} alt="" style={{display:"block",opacity:faded?0.35:1}} aria-hidden="true" />;
}
function IPEEHRSyncIcon({ synced }) {
  return synced
    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 9 18 20 6"/></svg>
    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>;
}
const IPE_COV_PILL = { accepted:{bg:"#f0fdf4",bd:"#16a34a",c:"#16a34a",label:"Active"}, declined:{bg:"#fef2f2",bd:"#dc2626",c:"#dc2626",label:"Inactive"}, ineligible:{bg:"#fffbeb",bd:"#d97706",c:"#d97706",label:"Exceptions"} };
function IPECovPill({ cov }) {
  const s = IPE_COV_PILL[cov] || { bg:"#f1f5f9", bd:"#94a3b8", c:"#64748b", label:"—" };
  return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"4px 12px",borderRadius:4,background:s.bg,border:`1px solid ${s.bd}`,color:s.c,font:"500 11px/16px Roboto",whiteSpace:"nowrap",minWidth:140,boxSizing:"border-box"}}>{s.label}</span>;
}

const IPE_COLS = [
  { key:"name",    label:"Patient Name",    grid:"minmax(120px,1.3fr)" },
  { key:"dob",     label:"Patient DOB",     grid:"minmax(90px,0.9fr)" },
  { key:"gender",  label:"Patient Gender",  grid:"minmax(80px,0.8fr)" },
  { key:"branch",  label:"Branch",          grid:"minmax(64px,0.6fr)" },
  { key:"policy",  label:"Policy Number",   grid:"minmax(100px,1fr)" },
  { key:"zip",     label:"Zipcode",         grid:"minmax(70px,0.6fr)" },
  { key:"referralStatus",  label:"Referral Status",        grid:"minmax(104px,1fr)" },
  { key:"completedTag",    label:"Completed Tag Assigned", grid:"minmax(120px,1fr)", align:"center" },
  { key:"importAttachment",label:"Import Attachment",      grid:"minmax(100px,0.9fr)", align:"center" },
  { key:"cov",     label:"Coverage Status", grid:"minmax(156px,1.3fr)", align:"center" },
  { key:"ehrSync", label:"EHR Sync",        grid:"80px", align:"center" },
  { key:"at",      label:"AT Status",       grid:"72px", align:"center" },
  { key:"alerts",  label:"Alerts",          grid:"64px", align:"center" },
  { key:"docs",    label:"Docs",            grid:"52px", align:"center" },
  { key:"reviewed",label:"Reviewed?",       grid:"78px", align:"center" },
];
const IPE_GRID = "20px " + IPE_COLS.map(c=>c.grid).join(" ");
const IPE_GRID_FLAT = IPE_COLS.map(c=>c.grid).join(" ");
const IPE_ACC_FIELDS = [["gender","Gender"],["pdd","Projected Discharge Date"]];

function IPECheckbox({ checked, onToggle, accent="#2563eb" }) {
  return <span role="checkbox" aria-checked={!!checked} tabIndex={0} onClick={onToggle} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:`1px solid ${checked?accent:"#d8d8d8"}`,borderRadius:3,background:checked?accent:"#fff",cursor:"pointer"}}>{checked && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}</span>;
}

function IPEAlertsSlideout({ row, alertReviewed, onToggleAlert, onClose }) {
  const items = row.alertItems || [];
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.18)"}} />
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:520,background:"#fff",zIndex:901,display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.13)",animation:"ipeAlertsSlide .22s cubic-bezier(0.32,0.72,0,1)"}}>
        <style>{`@keyframes ipeAlertsSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 16px"}}>
          <span style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Eligibility Alerts</span>
          <button onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",padding:4,color:"#64748b",font:"400 20px/18px Roboto"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px",padding:"0 24px 16px",borderBottom:"1px solid #e5e7eb"}}>
          {[["Patient Name",row.name],["Policy Number",row.policy],["Plan",row.plan]].map(([l,v])=>(
            <div key={l}><div style={{font:"400 11px Roboto",color:"#94a3b8",marginBottom:2}}>{l}</div><div style={{font:"500 12px Roboto",color:"#0f172a"}}>{v}</div></div>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 90px",padding:"12px 24px",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",font:"500 11px/14px Roboto",color:"#64748b"}}>
            <div>ALERT</div><div>DESCRIPTION</div><div style={{textAlign:"center"}}>REVIEWED</div>
          </div>
          {items.length===0
            ? <div style={{padding:"32px 24px",textAlign:"center",color:"#94a3b8",font:"400 13px Roboto"}}>No alerts for this request.</div>
            : items.map((a,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 2fr 90px",padding:"14px 24px",borderBottom:"1px solid #f1f5f9",alignItems:"center"}}>
                <div style={{font:"500 13px/18px Roboto",color:"#dc2626"}}>{a.text}</div>
                <div style={{font:"400 13px/18px Roboto",color:"#334155",paddingRight:12}}>{a.desc}</div>
                <div style={{display:"flex",justifyContent:"center"}}><IPECheckbox checked={!!(alertReviewed[row.id]&&alertReviewed[row.id][i])} onToggle={()=>onToggleAlert(row.id,i,items.length)} /></div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

function IPERow({ row, onDocsClick, onAlertsClick, reviewed, onReviewed, onPatient, flat }) {
  const [expanded, setExpanded] = useIPE(false);
  const cell = (align) => ({font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",justifyContent:align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0});
  return (
    <div style={{marginBottom:expanded?0:8}}>
      <div style={{display:"grid",gridTemplateColumns:flat?IPE_GRID_FLAT:IPE_GRID,alignItems:"center",height:48,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:expanded?"6px 6px 0 0":6,boxShadow:expanded?"none":"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",gap:6}}>
        {!flat && <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span onClick={()=>setExpanded(v=>!v)} style={{display:"inline-flex",cursor:"pointer",color:"#2563eb",transform:expanded?"rotate(90deg)":"rotate(0deg)",transition:"transform .15s"}}>
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M4 2 L11 7 L4 12 Z" fill="currentColor"/></svg>
          </span>
        </div>}
        <div style={cell()} title={row.name}>{onPatient ? <a href="#" onClick={(e)=>{e.preventDefault(); onPatient(row);}} style={{color:"#2563eb",font:"500 13px/16px Roboto",textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis"}}>{row.name}</a> : row.name}</div>
        <div style={cell()}>{row.dob}</div>
        <div style={cell()}>{row.gender || <span style={{color:"#94a3b8"}}>—</span>}</div>
        <div style={{...cell(),color:"#3b82f6",fontWeight:600}}>{row.branch}</div>
        <div style={cell()}>{row.policy}</div>
        <div style={cell()}>{row.zip}</div>
        <div style={cell()}>{row.referralStatus || <span style={{color:"#94a3b8"}}>—</span>}</div>
        <div style={{...cell("center"),color:row.completedTag?"#15803d":"#64748b"}}>{row.completedTag?"Yes":"No"}</div>
        <div style={{...cell("center"),color:row.importAttachment?"#15803d":"#64748b"}}>{row.importAttachment?"Yes":"No"}</div>
        <div style={cell("center")}><IPECovPill cov={row.cov} /></div>
        <div style={cell("center")}><IPEEHRSyncIcon synced={row.ehrSync} /></div>
        <div style={cell("center")}><window.ARVATIcon kind={row.at} /></div>
        <div style={cell("center")}>{row.alerts>0 ? <span onClick={()=>onAlertsClick(row)} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:22,height:22,borderRadius:"50%",background:"#f97316",color:"#fff",font:"600 11px/22px Roboto",cursor:"pointer"}}>{String(row.alerts).padStart(2,"0")}</span> : <span style={{color:"#cbd5e1"}}>—</span>}</div>
        <div style={{...cell("center"),cursor:row.docs?"pointer":"default"}} onClick={row.docs?()=>onDocsClick(row):undefined}><IPEDocIcon size={18} faded={!row.docs} /></div>
        <div style={cell("center")}><IPECheckbox checked={reviewed} onToggle={()=>onReviewed(row.id)} /></div>
      </div>
      {expanded && !flat && (
        <div style={{background:"#f4f5f7",border:"1px solid #e2e8f0",borderTop:"none",borderRadius:"0 0 6px 6px",marginBottom:8,padding:"14px 20px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:16,maxWidth:340}}>
            {IPE_ACC_FIELDS.map(([k,label])=>(
              <div key={k}>
                <div style={{font:"400 11px Roboto",color:"#94a3b8",marginBottom:3}}>{label}</div>
                <div style={{font:"500 12px Roboto",color:"#0f172a"}}>{row[k] || <span style={{color:"#94a3b8"}}>—</span>}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function IPETableHeader({ flat }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:flat?IPE_GRID_FLAT:IPE_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",gap:6}}>
      {!flat && <div></div>}
      {IPE_COLS.map(c=>(
        <div key={c.key} style={{font:"500 11px/14px Roboto",color:"#64748b",textAlign:c.align||"left",display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden"}}>{c.label}</div>
      ))}
    </div>
  );
}

function IPEDocsSlideout({ row, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.18)"}} />
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:420,background:"#fff",zIndex:901,display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.13)",animation:"ipeDocsSlide .22s cubic-bezier(0.32,0.72,0,1)"}}>
        <style>{`@keyframes ipeDocsSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 16px"}}>
          <span style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Pre-Verification Documents</span>
          <button onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",padding:4,color:"#64748b",font:"400 20px/18px Roboto"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px",padding:"0 24px 16px",borderBottom:"1px solid #e5e7eb"}}>
          {[["Policy Number",row.policy],["Plan",row.plan],["Gateway",row.gw||"—"]].map(([l,v])=>(
            <div key={l}><div style={{font:"400 11px Roboto",color:"#94a3b8",marginBottom:2}}>{l}</div><div style={{font:"500 12px Roboto",color:"#0f172a"}}>{v}</div></div>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 24px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",border:"1px solid #e5e7eb",borderRadius:8,background:"#f8fafc"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <IPEDocIcon size={16} />
              <span style={{font:"500 13px Roboto",color:"#0f172a"}}>Pre-verification response.pdf</span>
            </div>
            <span style={{color:"#1677ff",font:"500 13px Roboto"}}>View</span>
          </div>
        </div>
      </div>
    </>
  );
}

function IPETable({ rows, onDocsClick, onAlertsClick, reviewedSet, onReviewed, onPatient }) {
  const Body = ({children}) => window.ScrollBody ? <window.ScrollBody>{children}</window.ScrollBody> : <div style={{overflowY:"auto",flex:1}}>{children}</div>;
  if (rows.length===0) return <div style={{padding:"48px",textAlign:"center",color:"#94a3b8",font:"400 14px Roboto"}}>No records match the current filters.</div>;
  return (
    <div style={{padding:"0 24px 24px"}}>
      <IPETableHeader flat={!!onPatient} />
      <Body>
        {rows.map(r=><IPERow key={r.id} row={r} onDocsClick={onDocsClick} onAlertsClick={onAlertsClick} reviewed={!!reviewedSet[r.id]} onReviewed={onReviewed} onPatient={onPatient} flat={!!onPatient} />)}
        <div style={{padding:"16px 24px",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} records shown</div>
      </Body>
    </div>
  );
}

const IPE_AT_MAP = { completed:"thumb", warning:"warning", inprogress:"hourglass" };
function IntakePreEligibilityView({ review, headerNode, erv }) {
  const [covFilter, setCovFilter] = useIPE(null);
  const [atFilter, setAtFilter] = useIPE(null);
  const [atReasonFilter, setAtReasonFilter] = useIPE(null);
  const [fieldFilters, setFieldFilters] = useIPE([]);
  const [initDate, setInitDate] = useIPE(()=>window.defaultDateRange([...new Set(IPE_ROWS.map(r=>r.pdd))],30));
  const [search, setSearch] = useIPE("");
  const [docsRow, setDocsRow] = useIPE(null);
  const [reviewedSet, setReviewedSet] = useIPE({});
  const [alertsRow, setAlertsRow] = useIPE(null);
  const [alertReviewed, setAlertReviewed] = useIPE({});
  const toggleReviewed = id => setReviewedSet(s=>({...s,[id]:!s[id]}));
  const toggleAlert = (rowId, idx, total) => {
    setAlertReviewed(s=>{
      const arr = (s[rowId] ? [...s[rowId]] : Array(total).fill(false));
      arr[idx] = !arr[idx];
      const allReviewed = arr.length>0 && arr.every(Boolean);
      setReviewedSet(rs=>({...rs,[rowId]:allReviewed}));
      return {...s,[rowId]:arr};
    });
  };

  let rows = IPE_ROWS;
  if (covFilter) rows = rows.filter(r=>r.cov===covFilter);
  if (atFilter==="completed")  rows = rows.filter(r=>r.at==="thumb");
  if (atFilter==="warning")    rows = rows.filter(r=>r.at==="warning"&&(!atReasonFilter||atReasonFilter.includes(r.atReason)));
  if (atFilter==="inprogress") rows = rows.filter(r=>r.at==="hourglass");
  rows = rows.filter(r=>fieldFilters.every(f=>f.values.includes(r[f.field])));
  rows = rows.filter(r=>window.dateInRange(r.pdd, initDate));
  if (search.trim()) { const q=search.toLowerCase(); rows = rows.filter(r=>r.name.toLowerCase().includes(q)||r.policy.toLowerCase().includes(q)); }
  if (review) rows = rows.filter(r=>r.at==="warning");

  const covScoped = atFilter ? IPE_ROWS.filter(r=>r.at===IPE_AT_MAP[atFilter]) : IPE_ROWS;
  const covCounts = { all: ipePad(covScoped.length), accepted: ipePad(covScoped.filter(r=>r.cov==="accepted").length), declined: ipePad(covScoped.filter(r=>r.cov==="declined").length), ineligible: ipePad(covScoped.filter(r=>r.cov==="ineligible").length) };
  const atScoped = covFilter ? IPE_ROWS.filter(r=>r.cov===covFilter) : IPE_ROWS;
  const warningCount = (atReasonFilter && atReasonFilter.length) ? atScoped.filter(r=>r.at==="warning"&&atReasonFilter.includes(r.atReason)).length : atScoped.filter(r=>r.at==="warning").length;
  const atCounts = { completed: ipePad(atScoped.filter(r=>r.at==="thumb").length), needsAttn: ipePad(warningCount), inProgress: ipePad(atScoped.filter(r=>r.at==="hourglass").length) };

  const chips = [];
  if (covFilter) { const s = IPE_COV_ITEMS.find(x=>x.id===covFilter); chips.push({ id:"cov", label:`Coverage Status: ${s?s.label:covFilter}`, onRemove:()=>setCovFilter(null) }); }
  if (atFilter) { const a = IPE_AT.find(x=>x.id===atFilter); chips.push({ id:"at", label:`AT Status: ${a?a.label:atFilter}`, onRemove:()=>{ setAtFilter(null); setAtReasonFilter(null); } }); }
  if (atReasonFilter && atReasonFilter.length) atReasonFilter.forEach(rsn=>chips.push({ id:"atr-"+rsn, label:`Reason: ${rsn}`, onRemove:()=>setAtReasonFilter(prev=>{ const nx=(prev||[]).filter(x=>x!==rsn); return nx.length?nx:null; }) }));

  return (
    <div style={{background:"#fff",minHeight:"100%",display:"flex",flexDirection:"column"}}>
      <IPEFilterBar search={search} onSearch={setSearch} datePicker={{label:"Pre-Elig Check Date", value:initDate, available:IPE_ROWS.map(r=>r.pdd), onChange:setInitDate}} filterFields={IPE_FILTER_FIELDS} filterRows={IPE_ROWS} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters} chips={chips} onClearFilters={()=>{ setCovFilter(null); setAtFilter(null); setAtReasonFilter(null); setFieldFilters([]); }} />
      <div style={{padding:"18px 24px 14px",display:"flex",alignItems:"flex-start",gap:24,borderBottom:"1px solid #e2e8f0"}}>
        {headerNode || <IPETitleCluster />}
        <div style={{marginLeft:"auto",display:"flex",flexDirection:"column",alignItems:"stretch",gap:8,width:640}}>
          <IPESummaryStrip counts={covCounts} activeCov={covFilter} onPick={setCovFilter} />
          <IPEAutomationStatus atCounts={atCounts} atFilter={atFilter} onFilter={(v)=>{ setAtFilter(v); if(!v) setAtReasonFilter(null); }} atReasonFilter={atReasonFilter} onApply={(grp)=>{ setAtReasonFilter(grp); setAtFilter("warning"); }} />
        </div>
      </div>
      <IPETable rows={rows} onDocsClick={setDocsRow} onAlertsClick={setAlertsRow} reviewedSet={reviewedSet} onReviewed={toggleReviewed} onPatient={erv && window.__openPreEligDrawer ? window.__openPreEligDrawer : undefined} />
      {docsRow && <IPEDocsSlideout row={docsRow} onClose={()=>setDocsRow(null)} />}
      {alertsRow && <IPEAlertsSlideout row={alertsRow} alertReviewed={alertReviewed} onToggleAlert={toggleAlert} onClose={()=>setAlertsRow(null)} />}
    </div>
  );
}

// Patient detail body for a pre-eligibility record — only the fields the record carries.
function IPEPatientInfo({ row }) {
  const r = row || {};
  const dash = <span style={{color:"#94a3b8"}}>—</span>;
  const yn = (v) => <span style={{color:v?"#15803d":"#64748b"}}>{v?"Yes":"No"}</span>;
  const AT_LABEL = { thumb:"Completed", warning:"Needs Attention", hourglass:"In Progress" };
  const fields = [
    ["Patient Name", r.name], ["Patient DOB", r.dob], ["Patient Gender", r.gender], ["Branch", r.branch],
    ["Policy Number", r.policy], ["Zipcode", r.zip], ["Referral Status", r.referralStatus],
    ["Completed Tag Assigned", yn(r.completedTag)], ["Import Attachment", yn(r.importAttachment)],
    ["AT Status", <span style={{display:"inline-flex",alignItems:"center",gap:6}}>{window.ARVATIcon && <window.ARVATIcon kind={r.at} />}{AT_LABEL[r.at] || "—"}{r.at==="warning" && r.atReason ? " - " + r.atReason : ""}</span>],
    ...IPE_ACC_FIELDS.filter(([k]) => k !== "gender").map(([k, l]) => [l, r[k]]),
  ];
  const alerts = r.alertItems || [];
  const card = { border:"1px solid #e2e8f0", borderRadius:8, background:"#fff", padding:"16px 20px" };
  const h = { font:"500 14px/18px Roboto", color:"#0f172a", marginBottom:14 };
  return (
    <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={card}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
          <div style={{...h,marginBottom:0}}>Pre-Eligibility Details</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{font:"400 11px/14px Roboto",color:"#94a3b8"}}>Coverage Status</span>
            <IPECovPill cov={r.cov} />
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))",gap:"16px 24px"}}>
          {fields.map(([l, v]) => (
            <div key={l} style={{minWidth:0}}>
              <div style={{font:"400 11px/14px Roboto",color:"#94a3b8",marginBottom:4}}>{l}</div>
              <div style={{font:"500 12px/16px Roboto",color:"#0f172a",display:"flex",alignItems:"center"}}>{(v === undefined || v === null || v === "") ? dash : v}</div>
            </div>
          ))}
        </div>
      </div>
      {alerts.length > 0 && (
        <div style={card}>
          <div style={h}>Eligibility Alerts ({ipePad(alerts.length)})</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {alerts.map((a, i) => (
              <div key={i} style={{border:"1px solid #e5e7eb",borderRadius:6,padding:"10px 14px",background:"#f8fafc"}}>
                <div style={{font:"500 13px/18px Roboto",color:"#0f172a"}}>{a.text}</div>
                {a.desc && <div style={{font:"400 12px/16px Roboto",color:"#64748b",marginTop:2}}>{a.desc}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
      {r.docs && (
        <div style={card}>
          <div style={h}>Pre-Verification Documents</div>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",border:"1px solid #e5e7eb",borderRadius:8,background:"#f8fafc"}}>
            <IPEDocIcon size={16} />
            <span style={{font:"500 13px Roboto",color:"#0f172a"}}>Pre-verification response.pdf</span>
          </div>
        </div>
      )}
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { IntakePreEligibilityView, IPE_ROWS, IPEPatientInfo });
