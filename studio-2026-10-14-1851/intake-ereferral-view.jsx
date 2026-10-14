// Intake — E-referral View. Mirrors CDMRequestView structure: filter bar, title
// cluster, clickable "Referral response summary" (Accepted/Declined/Ineligible),
// AT status row, grid table with accordion, docs slideout, response-reason popup.
const { useState: useIER, useEffect: useIERE, useRef: useIERR } = React;

const IER_ROWS = [
  { id:"ie1",  name:"Marvin Mckinney",    dob:"04/02/1958", branch:"Enhabit Home Health - DLS", agency:"Agency 1", policy:"POL1152135", refId:"REF20240781", refDate:"04/15/25", plan:"Aetna Medicare",  sendOrg:"Silver Cross Hosp", sendFac:"Silver Cross ED", zip:"60441", gw:"Mosai", resp:"accepted",  respReason:"Referral accepted — coverage confirmed active",             at:"thumb",     alerts:0, docs:true,  gender:"Female", receiverCode:"RC-2201", comments:"Home health SOC requested within 48h", pdd:"04/20/25", ssd:"04/16/25", ehrSync:true, alertItems:[] },
  { id:"ie2",  name:"Esther Howard",      dob:"11/19/1966", branch:"Bcode", agency:"Agency 1", policy:"POL1152136", refId:"REF20240782", refDate:"04/16/25", plan:"Texas Medicaid",  sendOrg:"St. Luke's Health", sendFac:"St. Luke's ICU",  zip:"77002", gw:"Mosai",         resp:"ineligible", respReason:"Patient does not have active coverage on referral date",   at:"warning",   alerts:1, docs:false, gender:"Female", receiverCode:"RC-2202", comments:"Requires payer verification before SOC", pdd:"04/22/25", ssd:"04/18/25", ehrSync:false, alertItems:[{text:"Secondary plan unverified",desc:"Only the primary plan returned an active 271 response."}] },
  { id:"ie3",  name:"Cameron Williamson", dob:"02/27/1971", branch:"Bcode", agency:"Agency 1", policy:"POL1152137", refId:"REF20240783", refDate:"04/19/25", plan:"Humana",          sendOrg:"Rush Copley",       sendFac:"Rush Copley Rehab", zip:"60540", gw:"Mosai", resp:"accepted",  respReason:"Referral accepted — no outstanding conditions",             at:"hourglass", alerts:0, docs:false, gender:"Male",   receiverCode:"RC-2203", comments:"Therapy eval pending scheduling",       pdd:"04/25/25", ssd:"04/21/25", ehrSync:true, alertItems:[] },
  { id:"ie4",  name:"Leslie Alexander",   dob:"06/09/1949", branch:"Bcode", agency:"Agency 1", policy:"POL1152138", refId:"REF20240784", refDate:"04/22/25", plan:"Medicare",        sendOrg:"Advocate Christ",   sendFac:"Advocate Christ ED", zip:"60453", gw:"Mosai", resp:"declined",  respReason:"Facility declined — outside service area",                  at:"warning",   alerts:2, docs:true,  gender:"Female", receiverCode:"RC-2204", comments:"Address falls outside branch coverage",  pdd:"04/28/25", ssd:"", ehrSync:false, alertItems:[{text:"Secondary plan unverified",desc:"Only the primary plan returned an active 271 response."},{text:"Auth number not returned",desc:"Payor accepted the request but has not issued an authorization number."}] },
  { id:"ie5",  name:"Robert Fox",         dob:"01/14/1963", branch:"Bcode", agency:"Agency 1", policy:"POL1152139", refId:"REF20240785", refDate:"04/18/25", plan:"UHC",             sendOrg:"Elmhurst Memorial", sendFac:"Elmhurst Med Surg", zip:"60126", gw:"Mosai",      resp:"accepted",  respReason:"Referral accepted — coverage confirmed active",             at:"thumb",     alerts:0, docs:true,  gender:"Male",   receiverCode:"RC-2205", comments:"", pdd:"04/24/25", ssd:"04/20/25", ehrSync:true },
  { id:"ie6",  name:"Jenny Wilson",       dob:"09/30/1957", branch:"Bcode", agency:"Agency 1", policy:"POL1152140", refId:"REF20240786", refDate:"04/24/25", plan:"Humana",          sendOrg:"Northwestern Med",  sendFac:"Northwestern Cards", zip:"60611", gw:"Mosai", resp:"ineligible", respReason:"Policy terminated prior to referral date",                  at:"warning",   alerts:0, docs:true,  gender:"Female", receiverCode:"RC-2206", comments:"Verify secondary payer", pdd:"04/30/25", ssd:"", ehrSync:true },
  { id:"ie7",  name:"Jacob Jones",        dob:"05/03/1980", branch:"Bcode", agency:"Agency 1", policy:"POL1152141", refId:"REF20240787", refDate:"04/21/25", plan:"Aetna",           sendOrg:"Loyola Medicine",   sendFac:"Loyola Ortho",     zip:"60153", gw:"Mosai",  resp:"accepted",  respReason:"Referral accepted — coverage confirmed active",             at:"thumb",     alerts:0, docs:false, gender:"Male",   receiverCode:"RC-2207", comments:"", pdd:"04/27/25", ssd:"04/23/25", ehrSync:true },
  { id:"ie8",  name:"Guy Hawkins",        dob:"08/21/1969", branch:"Bcode", agency:"Agency 1", policy:"POL1152142", refId:"REF20240788", refDate:"04/23/25", plan:"UHC",             sendOrg:"Amita St Alexius",  sendFac:"Amita St Alexius ED", zip:"60067", gw:"Mosai",   resp:"declined",  respReason:"Facility declined — duplicate referral on file",            at:"thumb",     alerts:0, docs:true,  gender:"Male",   receiverCode:"RC-2208", comments:"Duplicate of REF20240770", pdd:"04/29/25", ssd:"", ehrSync:true },
  { id:"ie9",  name:"Jane Cooper",        dob:"03/11/1975", branch:"Bcode", agency:"Agency 1", policy:"POL1152143", refId:"REF20240789", refDate:"04/17/25", plan:"Aetna",           sendOrg:"Edward Hospital",   sendFac:"Edward Hosp Rehab", zip:"60563", gw:"Mosai",  resp:"accepted",  respReason:"Referral accepted — no outstanding conditions",             at:"thumb",     alerts:0, docs:false, gender:"Female", receiverCode:"RC-2209", comments:"", pdd:"04/23/25", ssd:"04/19/25", ehrSync:true },
  { id:"ie10", name:"Kristin Watson",     dob:"12/05/1961", branch:"Bcode", agency:"Agency 1", policy:"POL1152144", refId:"REF20240790", refDate:"04/25/25", plan:"Humana",          sendOrg:"Adventist LaGrange",sendFac:"Adventist LaGrange ED", zip:"60525", gw:"Mosai", resp:"ineligible", respReason:"Member ID mismatch — unable to confirm plan", at:"warning", alerts:1, docs:false, gender:"Female", receiverCode:"RC-2210", comments:"Awaiting corrected member ID", pdd:"05/01/25", ssd:"", ehrSync:false, alertItems:[{text:"Auth number not returned",desc:"Payor accepted the request but has not issued an authorization number."}] },
];
if (typeof window !== "undefined") window.IER_ROWS = IER_ROWS;

const ierPad = n => String(n).padStart(2,"0");
function ierCounts(rows) {
  return {
    all: rows.length,
    accepted:   rows.filter(r=>r.resp==="accepted").length,
    declined:   rows.filter(r=>r.resp==="declined").length,
    ineligible: rows.filter(r=>r.resp==="ineligible").length,
    at: {
      completed:  ierPad(rows.filter(r=>r.at==="thumb").length),
      needsAttn:  ierPad(rows.filter(r=>r.at==="warning").length),
      inProgress: ierPad(rows.filter(r=>r.at==="hourglass").length),
    },
  };
}
const IER_NA_TERM = ["Coverage terminated at payor","Referral withdrawn by sending org"];
const IER_NA_FAIL = ["Availity error message occurred preventing submission","Session timed out during referral intake"];
const IER_NA_ALL = IER_NA_TERM.map(l=>[l,"terminated"]).concat(IER_NA_FAIL.map(l=>[l,"failed"]));
(function(){ let i=0; IER_ROWS.forEach(r=>{ if(r.at==="warning"){ if(!r.atReason){ const pair=IER_NA_ALL[i%IER_NA_ALL.length]; r.atReason=pair[0]; r.atGroup=pair[1]; } i++; } }); })();
function computeIerNA(rows) {
  rows = rows || IER_ROWS;
  const term={}, fail={};
  rows.forEach(r=>{ if(r.at!=="warning") return; const reason=r.atReason||"Unspecified reason"; const grp=r.atGroup||"terminated"; if(grp==="failed") fail[reason]=(fail[reason]||0)+1; else term[reason]=(term[reason]||0)+1; });
  const sorted=(m)=>Object.entries(m).sort((a,b)=>b[1]-a[1]);
  const termReasons=sorted(term), failReasons=sorted(fail);
  const sum=(l)=>l.reduce((s,x)=>s+x[1],0);
  return { termReasons, failReasons, termTotal:sum(termReasons), failTotal:sum(failReasons) };
}
const IER_FILTER_FIELDS = [
  { key:"agency",       label:"Agency" },
  { key:"branch",       label:"Branch" },
  { key:"sendFac",      label:"Sending Facility" },
  { key:"sendOrg",      label:"Sending Organisation" },
  { key:"payerMatched", label:"Payer Matched" },
  { key:"zipMatched",   label:"Zipcode Matched" },
  { key:"srcMatched",   label:"Referral Source Matched" },
];

const IER_RESP_ITEMS = [
  { id:"all",        label:"All Referrals", color:"rgb(21,95,130)",  weight:1.1 },
  { id:"accepted",   label:"Accepted",      color:"rgb(22,163,74)",  weight:1 },
  { id:"declined",   label:"Declined",      color:"rgb(220,38,38)",  weight:1 },
  { id:"ineligible", label:"Ineligible",    color:"rgb(217,119,6)",  weight:1 },
];

function IERFilterChip({ label, onRemove }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:10,background:"#f4f6f9",border:"1px solid #d8dee6",borderRadius:6,padding:"6px 10px",font:"400 12px/16px Roboto",color:"#334155",whiteSpace:"nowrap",flexShrink:0}}>
      {label}
      <button type="button" onClick={onRemove} title="Remove filter" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",border:"none",background:"transparent",color:"#64748b",fontSize:13,lineHeight:1,cursor:"pointer",padding:0}}>✕</button>
    </span>
  );
}
function IERFilterBar({ search, onSearch, datePicker, filterFields, filterRows, fieldFilters, onFieldFilters, chips = [], onClearFilters }) {
  const [open, setOpen] = useIER(false);
  const [dpOpen, setDpOpen] = useIER(false);
  const ref = useIERR(null);
  const dref = useIERR(null);
  useIERE(()=>{ if(!open) return; const h=(e)=>{ if(ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[open]);
  useIERE(()=>{ if(!dpOpen) return; const h=(e)=>{ if(dref.current && !dref.current.contains(e.target)) setDpOpen(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[dpOpen]);
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
          {datePicker ? `${datePicker.label} : ${datePicker.value ? datePicker.value.start + " – " + datePicker.value.end : "All"}` : "Referral Date : 04/01/25 – 04/30/25"}
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
        {chips.map(c => <IERFilterChip key={c.id} label={c.label} onRemove={c.onRemove} />)}
        {fieldTags.map(t => <IERFilterChip key={t.id} label={t.label} onRemove={t.onRemove} />)}
      </div>
      {(chips.length>0||fieldTags.length>0) && onClearFilters && (<button type="button" onClick={onClearFilters} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",padding:"5px 4px",flexShrink:0,whiteSpace:"nowrap"}}>Clear filters</button>)}
      <div style={{position:"relative",flexShrink:0}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" value={search} onChange={e=>onSearch(e.target.value)} placeholder="Search Patient Records" style={{width:240,background:"#fff",border:"1px solid #93c5e8",borderRadius:6,padding:"6px 12px 6px 30px",font:"400 12px/16px Roboto",color:"#0f172a",outline:"none"}} />
      </div>
    </div>
  );
}

function IERTitleCluster() {
  return (
    <div>
      <span style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Referral View</span>
      <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Status Summary of Referrals Received from Sending Organizations</div>
      <div style={{marginTop:10,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block"}}>Click Referral Response to view referral response details</div>
    </div>
  );
}

// Clickable summary — "Referral response summary"
function IERSummaryStrip({ counts, activeResp, onPick }) {
  const byId = counts;
  return (
    <div style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",overflow:"hidden"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333",flexShrink:0}}>
        <span>Referral response</span><span>summary</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-start",flex:1}}>
        {IER_RESP_ITEMS.map(s=>{
          const active = s.id!=="all" && activeResp===s.id;
          const dim = activeResp && !active;
          return (
            <div key={s.id} role="button" onClick={()=>onPick(active?null:s.id)}
              style={{flex:`${s.weight} 1 0`,minWidth:0,padding:"10px 12px 12px",cursor:"pointer",opacity:(dim&&s.id!=="all")?0.35:1,transition:"opacity .12s,background .12s",background:active?"#f8fafc":"transparent"}}
              onMouseEnter={e=>{if(!active&&!dim)e.currentTarget.style.background="#fafbfc";}}
              onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent";}}>
              <div style={{height:3,borderRadius:2,background:s.color,opacity:active?1:0.85,marginBottom:8}}></div>
              <div style={{font:"400 12px/16px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#333",whiteSpace:"nowrap"}}>{s.label}</div>
              <div style={{font:"600 18px/22px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#0f172a",marginTop:4}}>{ierPad(byId[s.id]||0)}</div>
              {activeResp && s.id==="all" && (
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

const IER_AT = [
  { id:"completed",  label:"Completed",       key:"completed",  get icon(){ return (window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png"; } },
  { id:"warning",    label:"Needs Attention", key:"needsAttn",   get icon(){ return (window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png"; }, num:"#d97706" },
  { id:"inprogress", label:"In Progress",     key:"inProgress",  get icon(){ return (window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png"; } },
];
function IERAutomationStatus({ atCounts, atFilter, onFilter, atReasonFilter, onApply }) {
  const at = atCounts;
  const [openMenu, setOpenMenu] = useIER(false);
  const rootRef = useIERR(null);
  useIERE(()=>{ if(!openMenu) return; const h=(e)=>{ if(rootRef.current && !rootRef.current.contains(e.target)) setOpenMenu(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[openMenu]);
  const NAMenu = (typeof window !== "undefined") && window.ARVNeedsAttentionMenu;
  const ierNa = computeIerNA(IER_ROWS);
  return (
    <div ref={rootRef} style={{display:"flex",alignItems:"center",font:"400 13px/16px Roboto",color:"#333",justifyContent:"flex-end",width:"100%"}}>
      <span style={{color:"#94a3b8",marginRight:12}}>Automation (AT) Status :</span>
      {IER_AT.map((s,i)=>{
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
                {openMenu && NAMenu && <NAMenu na={ierNa} selectedReasons={atReasonFilter} onApply={onApply} naCount={parseInt(at.needsAttn,10)||0} onClose={()=>setOpenMenu(false)} />}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function IERDocIcon({ size=18, faded=false }) {
  return <img src={(window.__resources&&window.__resources.attachmentType)||"icons/attachment-type.svg"} width={size} height={size} alt="" style={{display:"block",opacity:faded?0.35:1}} aria-hidden="true" />;
}
function IEREHRSyncIcon({ synced }) {
  return synced
    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 9 18 20 6"/></svg>
    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>;
}
const IER_RESP_PILL = { accepted:{bg:"#f0fdf4",bd:"#16a34a",c:"#16a34a",label:"Accepted"}, declined:{bg:"#fef2f2",bd:"#dc2626",c:"#dc2626",label:"Declined"}, ineligible:{bg:"#fffbeb",bd:"#d97706",c:"#d97706",label:"Ineligible"} };
function IERRespPill({ resp, onClick }) {
  const s = IER_RESP_PILL[resp] || { bg:"#f1f5f9", bd:"#94a3b8", c:"#64748b", label:"—" };
  return <span onClick={onClick} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"4px 12px",borderRadius:4,background:s.bg,border:`1px solid ${s.bd}`,color:s.c,font:"500 11px/16px Roboto",whiteSpace:"nowrap",minWidth:140,boxSizing:"border-box",cursor:onClick?"pointer":"default"}}>{s.label}</span>;
}

const IER_COLS = [
  { key:"name",    label:"Patient Name",      grid:"minmax(120px,1.3fr)", sortable:true },
  { key:"agency",  label:"Agency",            grid:"minmax(76px,0.7fr)",  sortable:true },
  { key:"branch",  label:"Branch",            grid:"minmax(64px,0.6fr)",  sortable:true },
  { key:"zip",     label:"Zip code",           grid:"minmax(96px,0.7fr)",  sortable:true },
  { key:"plan",    label:"Primary Plan",      grid:"minmax(100px,1fr)",   sortable:true },
  { key:"refId",   label:"Referral ID",       grid:"minmax(110px,1.1fr)", sortable:true },
  { key:"refDate", label:"Referral Date",     grid:"minmax(92px,0.9fr)",  sortable:true },
  { key:"payerMatched", label:"Payer Matched",  grid:"96px",            sortable:true, align:"center" },
  { key:"zipMatched",   label:"Zipcode Matched",grid:"108px",           sortable:true, align:"center" },
  { key:"srcMatched",   label:"Referral Source Matched", grid:"150px",  sortable:true, align:"center" },
  { key:"resp",    label:"Referral Response", grid:"minmax(156px,1.3fr)", sortable:true, align:"center" },
  { key:"ehrSync", label:"Portal Sync",       grid:"80px",                sortable:false, align:"center" },
  { key:"at",      label:"AT Status",         grid:"72px",                sortable:false, align:"center" },
  { key:"docs",    label:"Docs",              grid:"52px",                sortable:false, align:"center" },
  { key:"reviewed",label:"Reviewed?",         grid:"78px",                sortable:false, align:"center" },
];
const IER_GRID = IER_COLS.map(c=>c.grid).join(" ");
const IER_ACC_FIELDS = [["gender","Gender"],["ssd","SOC"],["comments","Referral Comment"],["pdd","Discharge Date"],["careType","Type of Care"],["refSource","Referral Source"],["rulesResp","Rules Engine Response"],["respReason","Referral Response Reason"],["agencyRespReason","Agency Referral Response Reason"],["docSendStatus","Document Send Status"],["hubAck","Referral Hub Ack Status"],["receiverCode","Receiver Branch Code"]];
const IER_FLAG_FIELDS = { payerMatched:1, zipMatched:1, srcMatched:1 };
(function(){
  const care=["Skilled Nursing","Physical Therapy","Skilled Nursing, PT","Occupational Therapy","Skilled Nursing, OT"];
  const src=["Hospital Discharge Planner","Physician Office","SNF Case Manager","Hospital Case Manager","Physician Office"];
  IER_ROWS.forEach((r,i)=>{
    const ok = r.resp==="accepted";
    r.careType = r.careType || care[i%care.length];
    r.refSource = r.refSource || src[i%src.length];
    r.payerMatched = r.payerMatched || (r.resp==="ineligible" ? "No" : "Yes");
    r.zipMatched = r.zipMatched || (i%4===3 ? "No" : "Yes");
    r.srcMatched = r.srcMatched || (i%5===4 ? "No" : "Yes");
    r.rulesResp = r.rulesResp || (ok ? "Accept" : r.resp==="ineligible" ? "Decline" : "Manual Review");
    r.agencyResp = r.agencyResp || (ok ? "Accepted" : r.resp==="ineligible" ? "Declined" : "Pending");
    r.agencyRespReason = r.agencyRespReason || (ok ? "Within service area; staffing available" : r.resp==="ineligible" ? "No active coverage on file" : "Awaiting intake coordinator review");
    r.docSendStatus = r.docSendStatus || (r.docs ? "Sent" : "Not Sent");
    r.hubAck = r.hubAck || (r.gw ? (i%6===5 ? "Pending" : "Acknowledged") : "—");
  });
})();

function IERCheckbox({ checked, onToggle, accent="#2563eb" }) {
  return <span role="checkbox" aria-checked={!!checked} tabIndex={0} onClick={onToggle} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:`1px solid ${checked?accent:"#d8d8d8"}`,borderRadius:3,background:checked?accent:"#fff",cursor:"pointer"}}>{checked && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}</span>;
}

// ── Alerts slideout (Alert / Description / Reviewed) ──────────────
function IERAlertsSlideout({ row, alertReviewed, onToggleAlert, onClose }) {
  const items = row.alertItems || [];
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.18)"}} />
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:520,background:"#fff",zIndex:901,display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.13)",animation:"ierAlertsSlide .22s cubic-bezier(0.32,0.72,0,1)"}}>
        <style>{`@keyframes ierAlertsSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 16px"}}>
          <span style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Referral Alerts</span>
          <button onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",padding:4,color:"#64748b",font:"400 20px/18px Roboto"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px",padding:"0 24px 16px",borderBottom:"1px solid #e5e7eb"}}>
          {[["Patient Name",row.name],["Referral ID",row.refId],["Policy Number",row.policy]].map(([l,v])=>(
            <div key={l}><div style={{font:"400 11px Roboto",color:"#94a3b8",marginBottom:2}}>{l}</div><div style={{font:"500 12px Roboto",color:"#0f172a"}}>{v}</div></div>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 90px",padding:"12px 24px",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",font:"500 11px/14px Roboto",color:"#64748b"}}>
            <div>ALERT</div><div>DESCRIPTION</div><div style={{textAlign:"center"}}>REVIEWED</div>
          </div>
          {items.length===0
            ? <div style={{padding:"32px 24px",textAlign:"center",color:"#94a3b8",font:"400 13px Roboto"}}>No alerts for this referral.</div>
            : items.map((a,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 2fr 90px",padding:"14px 24px",borderBottom:"1px solid #f1f5f9",alignItems:"center"}}>
                <div style={{font:"500 13px/18px Roboto",color:"#dc2626"}}>{a.text}</div>
                <div style={{font:"400 13px/18px Roboto",color:"#334155",paddingRight:12}}>{a.desc}</div>
                <div style={{display:"flex",justifyContent:"center"}}><IERCheckbox checked={!!(alertReviewed[row.id]&&alertReviewed[row.id][i])} onToggle={()=>onToggleAlert(row.id,i,items.length)} /></div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

function IERRow({ row, onDocsClick, onRespClick, onAlertsClick, reviewed, onReviewed }) {
  const cell = (align) => ({font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",justifyContent:align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0});
  return (
    <div style={{marginBottom:8}}>
      <div style={{display:"grid",gridTemplateColumns:IER_GRID,alignItems:"center",height:48,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:6,boxShadow:"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",gap:6}}>
        <div style={{...cell(),position:"sticky",left:0,zIndex:1,background:"#fff",alignSelf:"stretch",margin:"0 0 0 -11px",paddingLeft:11,boxShadow:"6px 0 6px -6px rgba(15,23,42,0.15)"}}><a href="#" title={row.name} onClick={(e)=>{e.preventDefault(); e.stopPropagation(); window.__openReferralDrawer && window.__openReferralDrawer(row);}} style={{color:"#1677ff",font:"500 13px/16px Roboto",textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.name}</a></div>
        <div style={cell()}>{row.agency}</div>
        <div style={{...cell(),color:"#3b82f6",fontWeight:600}}>{row.branch}</div>
        <div style={cell()}>{row.zip}</div>
        <div style={cell()} title={row.plan}>{row.plan}</div>
        <div style={{...cell(),color:"#1e40af"}}>{row.refId}</div>
        <div style={cell()}>{row.refDate}</div>
        <div style={cell("center")}><span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",minWidth:36,height:20,padding:"0 8px",borderRadius:10,font:"500 11px/20px Roboto",background:row.payerMatched==="Yes"?"#EFFCEF":"#FFEDEC",color:row.payerMatched==="Yes"?"#16a34a":"#dc2626"}}>{row.payerMatched}</span></div>
        <div style={cell("center")}><span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",minWidth:36,height:20,padding:"0 8px",borderRadius:10,font:"500 11px/20px Roboto",background:row.zipMatched==="Yes"?"#EFFCEF":"#FFEDEC",color:row.zipMatched==="Yes"?"#16a34a":"#dc2626"}}>{row.zipMatched}</span></div>
        <div style={cell("center")}><span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",minWidth:36,height:20,padding:"0 8px",borderRadius:10,font:"500 11px/20px Roboto",background:row.srcMatched==="Yes"?"#EFFCEF":"#FFEDEC",color:row.srcMatched==="Yes"?"#16a34a":"#dc2626"}}>{row.srcMatched}</span></div>
        <div style={cell("center")}><IERRespPill resp={row.resp} onClick={()=>onRespClick(row)} /></div>
        <div style={cell("center")}><IEREHRSyncIcon synced={row.ehrSync} /></div>
        <div style={cell("center")}><window.ARVATIcon kind={row.at} /></div>
        <div style={{...cell("center"),cursor:row.docs?"pointer":"default"}} onClick={row.docs?()=>onDocsClick(row):undefined}><IERDocIcon size={18} faded={!row.docs} /></div>
        <div style={cell("center")}><IERCheckbox checked={reviewed} onToggle={()=>onReviewed(row.id)} /></div>
      </div>
          </div>
  );
}

function IERTableHeader() {
  return (
    <div style={{display:"grid",gridTemplateColumns:IER_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",gap:6}}>
      {[...IER_COLS].map(c=>(
        <div key={c.key} style={{font:"500 11px/14px Roboto",color:"#64748b",textAlign:c.align||"left",display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",...(c.key==="name"?{position:"sticky",left:0,zIndex:2,background:"#f8fafc",alignSelf:"stretch",margin:"0 0 0 -12px",paddingLeft:12,boxShadow:"6px 0 6px -6px rgba(15,23,42,0.15)"}:{})}}>{c.label}</div>
      ))}
    </div>
  );
}

// ── Response-status popup (Response reason) ───────────────────
function IERRespPopup({ row, onClose }) {
  const s = IER_RESP_PILL[row.resp] || {};
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.25)"}} />
      <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:420,background:"#fff",borderRadius:10,zIndex:901,boxShadow:"0 24px 60px rgba(0,0,0,0.25)",padding:"22px 24px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <span style={{font:"600 16px/22px Roboto",color:"#0f172a"}}>Referral Response Summary</span>
          <button onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",color:"#64748b",font:"400 18px/16px Roboto"}}>✕</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <IERRespPill resp={row.resp} />
          <span style={{font:"500 13px/18px Roboto",color:"#0f172a"}}>{row.name} — {row.refId}</span>
        </div>
        <div style={{font:"400 11px Roboto",color:"#94a3b8",marginBottom:4}}>Response Reason</div>
        <div style={{font:"400 13px/19px Roboto",color:"#334155",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"10px 12px"}}>{row.respReason}</div>
      </div>
    </>
  );
}

// ── Docs slideout ───────────────────────────────────────────────
function IERDocsSlideout({ row, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.18)"}} />
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:420,background:"#fff",zIndex:901,display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.13)",animation:"ierDocsSlide .22s cubic-bezier(0.32,0.72,0,1)"}}>
        <style>{`@keyframes ierDocsSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 16px"}}>
          <span style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Referral Documents</span>
          <button onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",padding:4,color:"#64748b",font:"400 20px/18px Roboto"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px",padding:"0 24px 16px",borderBottom:"1px solid #e5e7eb"}}>
          {[["Patient Name",row.name],["Referral ID",row.refId],["Referral Date",row.refDate]].map(([l,v])=>(
            <div key={l}><div style={{font:"400 11px Roboto",color:"#94a3b8",marginBottom:2}}>{l}</div><div style={{font:"500 12px Roboto",color:"#0f172a"}}>{v}</div></div>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 24px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",border:"1px solid #e5e7eb",borderRadius:8,background:"#f8fafc"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <IERDocIcon size={16} />
              <span style={{font:"500 13px Roboto",color:"#0f172a"}}>Patient Details.pdf</span>
            </div>
            <span style={{color:"#1677ff",font:"500 13px Roboto"}}>View</span>
          </div>
        </div>
      </div>
    </>
  );
}

// One scroll box for both axes so the wide table scrolls sideways and the header stays pinned on top.
function IERScroll({ children }) {
  const ref = React.useRef(null);
  const [maxH, setMaxH] = React.useState(null);
  React.useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const calc = () => { setMaxH(Math.max(240, Math.floor(window.innerHeight - el.getBoundingClientRect().top - 56))); el.style.setProperty("--ier-view-w", el.clientWidth + "px"); };
    calc(); window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return <div ref={ref} className="ws-scrollbody" style={{maxHeight:maxH?maxH+"px":undefined,overflow:"auto",minWidth:0}}>{children}</div>;
}

function IERTable({ rows, onDocsClick, onRespClick, onAlertsClick, reviewedSet, onReviewed }) {
  const Body = ({children}) => window.ScrollBody ? <window.ScrollBody>{children}</window.ScrollBody> : <div style={{overflowY:"auto",flex:1}}>{children}</div>;
  if (rows.length===0) return <div style={{padding:"48px",textAlign:"center",color:"#94a3b8",font:"400 14px Roboto"}}>No records match the current filters.</div>;
  return (
    <div style={{padding:"0 24px 24px",minWidth:0}}>
      <IERScroll>
        <div style={{width:"max-content",minWidth:"100%"}}>
          <div style={{position:"sticky",top:0,zIndex:3,marginBottom:8}}><IERTableHeader /></div>
          {rows.map(r=><IERRow key={r.id} row={r} onDocsClick={onDocsClick} onRespClick={onRespClick} onAlertsClick={onAlertsClick} reviewed={!!reviewedSet[r.id]} onReviewed={onReviewed} />)}
        </div>
      </IERScroll>
      <div style={{padding:"16px 24px",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} records shown</div>
    </div>
  );
}

const IER_AT_MAP = { completed:"thumb", warning:"warning", inprogress:"hourglass" };
function IntakeEReferralView({ review }) {
  const [respFilter, setRespFilter] = useIER(null);
  const [atFilter, setAtFilter] = useIER(null);
  const [atReasonFilter, setAtReasonFilter] = useIER(null);
  const [fieldFilters, setFieldFilters] = useIER([]);
  const [initDate, setInitDate] = useIER(()=>window.defaultDateRange([...new Set(IER_ROWS.map(r=>r.refDate))],30));
  const [search, setSearch] = useIER("");
  // Arriving from the E-Referral dashboard: show exactly the records behind the clicked count.
  const [focus, setFocus] = useIER(()=>{ const f = window.__ierFocus; window.__ierFocus = null; return f && f.ids ? f : null; });
  const [docsRow, setDocsRow] = useIER(null);
  const [respRow, setRespRow] = useIER(null);
  const [reviewedSet, setReviewedSet] = useIER({});
  const [alertsRow, setAlertsRow] = useIER(null);
  const [alertReviewed, setAlertReviewed] = useIER({});
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

  let rows = IER_ROWS;
  if (respFilter) rows = rows.filter(r=>r.resp===respFilter);
  if (atFilter==="completed")  rows = rows.filter(r=>r.at==="thumb");
  if (atFilter==="warning")    rows = rows.filter(r=>r.at==="warning"&&(!atReasonFilter||atReasonFilter.includes(r.atReason)));
  if (atFilter==="inprogress") rows = rows.filter(r=>r.at==="hourglass");
  rows = rows.filter(r=>fieldFilters.every(f=>f.values.includes(r[f.field])));
  if (focus) rows = rows.filter(r=>focus.ids.includes(r.id));
  else rows = rows.filter(r=>window.dateInRange(r.refDate, initDate));
  if (search.trim()) { const q=search.toLowerCase(); rows = rows.filter(r=>r.name.toLowerCase().includes(q)||r.refId.toLowerCase().includes(q)||String(r.zip||"").includes(q)); }
  if (review) rows = rows.filter(r=>r.at==="warning");

  const respScoped = atFilter ? IER_ROWS.filter(r=>r.at===IER_AT_MAP[atFilter]) : IER_ROWS;
  const respCounts = { all: ierPad(respScoped.length), accepted: ierPad(respScoped.filter(r=>r.resp==="accepted").length), declined: ierPad(respScoped.filter(r=>r.resp==="declined").length), ineligible: ierPad(respScoped.filter(r=>r.resp==="ineligible").length) };
  const atScoped = respFilter ? IER_ROWS.filter(r=>r.resp===respFilter) : IER_ROWS;
  const warningCount = (atReasonFilter && atReasonFilter.length) ? atScoped.filter(r=>r.at==="warning"&&atReasonFilter.includes(r.atReason)).length : atScoped.filter(r=>r.at==="warning").length;
  const atCounts = { completed: ierPad(atScoped.filter(r=>r.at==="thumb").length), needsAttn: ierPad(warningCount), inProgress: ierPad(atScoped.filter(r=>r.at==="hourglass").length) };

  const chips = [];
  if (focus) chips.push({ id:"focus", label:`Dashboard: ${focus.label}`, onRemove:()=>setFocus(null) });
  if (respFilter) { const s = IER_RESP_ITEMS.find(x=>x.id===respFilter); chips.push({ id:"resp", label:`Response Status: ${s?s.label:respFilter}`, onRemove:()=>setRespFilter(null) }); }
  if (atFilter) { const a = IER_AT.find(x=>x.id===atFilter); chips.push({ id:"at", label:`AT Status: ${a?a.label:atFilter}`, onRemove:()=>{ setAtFilter(null); setAtReasonFilter(null); } }); }
  if (atReasonFilter && atReasonFilter.length) atReasonFilter.forEach(rsn=>chips.push({ id:"atr-"+rsn, label:`Reason: ${rsn}`, onRemove:()=>setAtReasonFilter(prev=>{ const nx=(prev||[]).filter(x=>x!==rsn); return nx.length?nx:null; }) }));

  return (
    <div style={{background:"#fff",minHeight:"100%",display:"flex",flexDirection:"column"}}>
      <IERFilterBar search={search} onSearch={setSearch} datePicker={{label:"Referral Date", value:initDate, available:IER_ROWS.map(r=>r.refDate), onChange:setInitDate}} filterFields={IER_FILTER_FIELDS} filterRows={IER_ROWS} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters} chips={chips} onClearFilters={()=>{ setFocus(null); setRespFilter(null); setAtFilter(null); setAtReasonFilter(null); setFieldFilters([]); }} />
      <div style={{padding:"18px 24px 14px",display:"flex",alignItems:"flex-start",gap:24,borderBottom:"1px solid #e2e8f0"}}>
        <IERTitleCluster />
        <div style={{marginLeft:"auto",display:"flex",flexDirection:"column",alignItems:"stretch",gap:8,width:640}}>
          <IERSummaryStrip counts={respCounts} activeResp={respFilter} onPick={setRespFilter} />
          <IERAutomationStatus atCounts={atCounts} atFilter={atFilter} onFilter={(v)=>{ setAtFilter(v); if(!v) setAtReasonFilter(null); }} atReasonFilter={atReasonFilter} onApply={(grp)=>{ setAtReasonFilter(grp); setAtFilter("warning"); }} />
        </div>
      </div>
      <IERTable rows={rows} onDocsClick={setDocsRow} onRespClick={setRespRow} onAlertsClick={setAlertsRow} reviewedSet={reviewedSet} onReviewed={toggleReviewed} />
      {docsRow && <IERDocsSlideout row={docsRow} onClose={()=>setDocsRow(null)} />}
      {respRow && <IERRespPopup row={respRow} onClose={()=>setRespRow(null)} />}
      {alertsRow && <IERAlertsSlideout row={alertsRow} alertReviewed={alertReviewed} onToggleAlert={toggleAlert} onClose={()=>setAlertsRow(null)} />}
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { IntakeEReferralView, IER_ROWS });
