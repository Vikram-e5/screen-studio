// Intake — E-referral View. Mirrors CDMRequestView structure: filter bar, title
// cluster, clickable "Referral response summary" (Accepted/Declined/User Decision/Ineligible/Exceptions),
// AT status row, grid table with accordion, docs slideout, response-reason popup.
const { useState: useIER, useEffect: useIERE, useRef: useIERR } = React;

const IER_ROWS = [
  { id:"ie1",  name:"Marvin Mckinney",    dob:"04/02/1958", branch:"Enhabit Home Health - DLS", agency:"Agency 1", policy:"POL1152135", refId:"REF20240781", refDate:"04/15/25", plan:"Aetna Medicare",  sendOrg:"Silver Cross Hosp", sendFac:"Silver Cross ED", zip:"60441", gw:"Mosai", resp:"accepted",  respReason:"Referral accepted — coverage confirmed active",             at:"thumb",     alerts:0, docs:true,  gender:"Female", receiverCode:"RC-2201", comments:"Home health SOC requested within 48h", pdd:"04/20/25", ssd:"04/16/25", ehrSync:true, alertItems:[] },
  { id:"ie2",  name:"Esther Howard",      dob:"11/19/1966", branch:"Bcode", agency:"Agency 1", policy:"POL1152136", refId:"REF20240782", refDate:"04/16/25", plan:"Texas Medicaid",  sendOrg:"St. Luke's Health", sendFac:"St. Luke's ICU",  zip:"77002", gw:"Mosai",         resp:"ineligible", respReason:"Patient does not have active coverage on referral date",   at:"thumb",   alerts:1, docs:false, gender:"Female", receiverCode:"RC-2202", comments:"Requires payer verification before SOC", pdd:"04/22/25", ssd:"04/18/25", ehrSync:false, alertItems:[{text:"Secondary plan unverified",desc:"Only the primary plan returned an active 271 response."}] },
  { id:"ie3",  name:"Cameron Williamson", dob:"02/27/1971", branch:"Bcode", agency:"Agency 1", policy:"POL1152137", refId:"REF20240783", refDate:"04/19/25", plan:"Humana",          sendOrg:"Rush Copley",       sendFac:"Rush Copley Rehab", zip:"60540", gw:"Mosai", resp:"userDecision", respReason:"",             at:"hourglass", alerts:0, docs:false, gender:"Male",   receiverCode:"RC-2203", comments:"Therapy eval pending scheduling",       pdd:"04/25/25", ssd:"04/21/25", ehrSync:true, alertItems:[] },
  { id:"ie4",  name:"Leslie Alexander",   dob:"06/09/1949", branch:"Bcode", agency:"Agency 1", policy:"POL1152138", refId:"REF20240784", refDate:"04/22/25", plan:"Medicare",        sendOrg:"Advocate Christ",   sendFac:"Advocate Christ ED", zip:"60453", gw:"Mosai", resp:"declined",  respReason:"Facility declined — outside service area",                  at:"thumb",   alerts:2, docs:true,  gender:"Female", receiverCode:"RC-2204", comments:"Address falls outside branch coverage",  pdd:"04/28/25", ssd:"", ehrSync:false, alertItems:[{text:"Secondary plan unverified",desc:"Only the primary plan returned an active 271 response."},{text:"Auth number not returned",desc:"Payor accepted the request but has not issued an authorization number."}] },
  { id:"ie5",  name:"Robert Fox",         dob:"01/14/1963", branch:"Bcode", agency:"Agency 1", policy:"POL1152139", refId:"REF20240785", refDate:"04/18/25", plan:"UHC",             sendOrg:"Elmhurst Memorial", sendFac:"Elmhurst Med Surg", zip:"60126", gw:"Mosai",      resp:"accepted",  respReason:"Referral accepted — coverage confirmed active",             at:"thumb",     alerts:0, docs:true,  gender:"Male",   receiverCode:"RC-2205", comments:"", pdd:"04/24/25", ssd:"04/20/25", ehrSync:true },
  { id:"ie6",  name:"Jenny Wilson",       dob:"09/30/1957", branch:"Bcode", agency:"Agency 1", policy:"POL1152140", refId:"REF20240786", refDate:"04/24/25", plan:"Humana",          sendOrg:"Northwestern Med",  sendFac:"Northwestern Cards", zip:"60611", gw:"Mosai", resp:"ineligible", respReason:"Policy terminated prior to referral date",                  at:"thumb",   alerts:0, docs:true,  gender:"Female", receiverCode:"RC-2206", comments:"Verify secondary payer", pdd:"04/30/25", ssd:"", ehrSync:true },
  { id:"ie7",  name:"Jacob Jones",        dob:"05/03/1980", branch:"Bcode", agency:"Agency 1", policy:"POL1152141", refId:"REF20240787", refDate:"04/21/25", plan:"Aetna",           sendOrg:"Loyola Medicine",   sendFac:"Loyola Ortho",     zip:"60153", gw:"Mosai",  resp:"accepted",  respReason:"Referral accepted — coverage confirmed active",             at:"thumb",     alerts:0, docs:false, gender:"Male",   receiverCode:"RC-2207", comments:"", pdd:"04/27/25", ssd:"04/23/25", ehrSync:true },
  { id:"ie8",  name:"Guy Hawkins",        dob:"08/21/1969", branch:"Bcode", agency:"Agency 1", policy:"POL1152142", refId:"REF20240788", refDate:"04/23/25", plan:"UHC",             sendOrg:"Amita St Alexius",  sendFac:"Amita St Alexius ED", zip:"60067", gw:"Mosai",   resp:"declined",  respReason:"Facility declined — duplicate referral on file",            at:"thumb",     alerts:0, docs:true,  gender:"Male",   receiverCode:"RC-2208", comments:"Duplicate of REF20240770", pdd:"04/29/25", ssd:"", ehrSync:true },
  { id:"ie9",  name:"Jane Cooper",        dob:"03/11/1975", branch:"Bcode", agency:"Agency 1", policy:"POL1152143", refId:"REF20240789", refDate:"04/17/25", plan:"Aetna",           sendOrg:"Edward Hospital",   sendFac:"Edward Hosp Rehab", zip:"60563", gw:"Mosai",  resp:"accepted",  respReason:"Referral accepted — no outstanding conditions",             at:"thumb",     alerts:0, docs:false, gender:"Female", receiverCode:"RC-2209", comments:"", pdd:"04/23/25", ssd:"04/19/25", ehrSync:true },
  { id:"ie10", name:"Kristin Watson",     dob:"12/05/1961", branch:"Bcode", agency:"Agency 1", policy:"POL1152144", refId:"REF20240790", refDate:"04/25/25", plan:"Humana",          sendOrg:"Adventist LaGrange",sendFac:"Adventist LaGrange ED", zip:"60525", gw:"Mosai", resp:"exceptions", respReason:"Response could not be deduced — conflicting rule outcomes", at:"warning", alerts:1, docs:false, gender:"Female", receiverCode:"RC-2210", comments:"Awaiting corrected member ID", pdd:"05/01/25", ssd:"", ehrSync:false, alertItems:[{text:"Auth number not returned",desc:"Payor accepted the request but has not issued an authorization number."}] },
];
IER_ROWS.push(
  { id:"ie11", name:"Brooklyn Simmons", dob:"07/18/1959", branch:"Bcode", agency:"Agency 1", policy:"POL1152145", refId:"REF20240791", refDate:"04/26/25", plan:"Medicare", sendOrg:"Silver Cross Hosp", sendFac:"Silver Cross Med Surg", zip:"60441", gw:"Mosai", resp:"userDecision", respReason:"", at:"hourglass", alerts:0, docs:true, gender:"Female", receiverCode:"RC-2211", comments:"Coordinator decision required", pdd:"05/02/25", ssd:"", ehrSync:false },
  { id:"ie12", name:"Darlene Robertson", dob:"10/02/1954", branch:"Bcode", agency:"Agency 1", policy:"POL1152146", refId:"REF20240792", refDate:"04/27/25", plan:"Aetna Medicare", sendOrg:"Rush Copley", sendFac:"Rush Copley ED", zip:"60540", gw:"Mosai", resp:"exceptions", respReason:"Response could not be deduced — missing payer response", at:"warning", alerts:0, docs:false, gender:"Female", receiverCode:"RC-2212", comments:"", pdd:"05/03/25", ssd:"", ehrSync:false }
);
// Ineligible + User Decision: Referral Response / Reason are blank in Patient Details.
IER_ROWS.forEach(r=>{ if(r.resp==="ineligible"||r.resp==="userDecision"){ r.respBlank=true; r.respReason=""; } });
if (typeof window !== "undefined") { window.IER_ROWS = IER_ROWS; window.IER_V2 = true; }
const IER_STAGES = ["Stage I - Patient Record Identification","Stage II - Patient Information Extraction & Verification","Stage III - Referral Portal Update","Stage IV - Referral Document Download","Stage V - Referral Data Upload","Stage VI - Referral Event Notification"];
if (typeof window !== "undefined") window.IER_STAGES = IER_STAGES;

const ierPad = n => String(n).padStart(2,"0");
function ierCounts(rows) {
  return {
    all: rows.length,
    accepted:   rows.filter(r=>r.resp==="accepted").length,
    declined:   rows.filter(r=>r.resp==="declined").length,
    userDecision: rows.filter(r=>r.resp==="userDecision").length,
    ineligible: rows.filter(r=>r.resp==="ineligible").length,
    exceptions: rows.filter(r=>r.resp==="exceptions").length,
    at: {
      completed:  ierPad(rows.filter(r=>r.at==="thumb").length),
      needsAttn:  ierPad(rows.filter(r=>r.at==="warning").length),
      inProgress: ierPad(rows.filter(r=>r.at==="hourglass").length),
    },
  };
}
const IER_NA_TERM = ["Referral placed with another organisation","Referral withdrawn by sending org"];
const IER_NA_FAIL = ["Availity error message occurred preventing submission","Session timed out during referral intake"];
const IER_NA_ALL = IER_NA_TERM.map(l=>[l,"terminated"]).concat(IER_NA_FAIL.map(l=>[l,"failed"]));
(function(){ const fx={"Kristin Watson":IER_NA_TERM[0],"Darlene Robertson":IER_NA_TERM[1]}; IER_ROWS.forEach(r=>{ if(fx[r.name]){ r.atReason=fx[r.name]; r.atGroup="terminated"; } }); })();
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
  { key:"agency",    label:"Agency" },
  { key:"branch",    label:"Branch" },
  { key:"payor",     label:"Payer" },
  { key:"zip",       label:"Zip Code" },
  { key:"refSource", label:"Referral Source" },
];

const IER_RESP_ITEMS = [
  { id:"all",        label:"All Referrals", color:"rgb(21,95,130)",  weight:1.1 },
  { id:"accepted",   label:"Accepted",      color:"rgb(22,163,74)",  weight:1 },
  { id:"declined",   label:"Declined",      color:"rgb(220,38,38)",  weight:1 },
  { id:"userDecision", label:"User Decision", color:"rgb(37,99,235)", weight:1.1 },
  { id:"ineligible", label:"Ineligible",    color:"rgb(100,116,139)", weight:1 },
  { id:"exceptions", label:"Exceptions",    color:"rgb(217,119,6)",  weight:1 },
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
        <input type="text" value={search} onChange={e=>onSearch(e.target.value)} placeholder="Search by Patient Name, Referral ID" style={{width:240,background:"#fff",border:"1px solid #93c5e8",borderRadius:6,padding:"6px 12px 6px 30px",font:"400 12px/16px Roboto",color:"#0f172a",outline:"none"}} />
      </div>
    </div>
  );
}

function IERTitleCluster({ excludeInel, onExcludeInel, disabled }) {
  return (
    <div>
      <span style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>E-referral View</span>
      <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Status Summary of Referrals Received from Sending Organizations</div>
      <div style={{marginTop:10,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b"}}>Click Referral Response to view referral response details</div>
        <label title={disabled?"Not available in Review Mode":undefined} style={{display:"inline-flex",alignItems:"center",gap:8,font:"400 12px/16px Roboto",color:"#334155",cursor:disabled?"not-allowed":"pointer",whiteSpace:"nowrap",userSelect:"none",opacity:disabled?0.4:1}}>
          <IERCheckbox checked={!!excludeInel && !disabled} locked={disabled} onToggle={onExcludeInel} />Exclude Ineligible Records
        </label>
      </div>
    </div>
  );
}

// Clickable summary — "Referral response summary"
function IERSummaryStrip({ counts, activeResp, onPick, hl, xhl, onReset, disabledIds=[] }) {
  const byId = counts;
  return (
    <div style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",overflow:"hidden"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333",flexShrink:0}}>
        <span>Referral response</span><span>summary</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-start",flex:1}}>
        {IER_RESP_ITEMS.map(s=>{
          const off = disabledIds.includes(s.id);
          const active = !off && s.id!=="all" && (hl ? hl.includes(s.id) : activeResp===s.id);
          const dim = off || ((hl || activeResp) ? !active : (xhl && s.id!=="all" && !xhl.includes(s.id)));
          return (
            <div key={s.id} role="button" aria-disabled={off||undefined} title={off?"Excluded — Exclude Ineligible Records is on":undefined} onClick={off?undefined:()=>onPick(active?null:s.id)}
              style={{flex:`${s.weight} 1 0`,minWidth:0,padding:"10px 8px 12px",cursor:off?"not-allowed":"pointer",opacity:(dim&&s.id!=="all")?0.35:1,transition:"opacity .12s,background .12s",background:active?"#f8fafc":"transparent"}}
              onMouseEnter={e=>{if(!active&&!dim)e.currentTarget.style.background="#fafbfc";}}
              onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent";}}>
              <div style={{height:3,borderRadius:2,background:s.color,opacity:active?1:0.85,marginBottom:8}}></div>
              <div style={{font:"400 12px/16px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#333",whiteSpace:"normal",textWrap:"balance"}}>{s.label}</div>
              <div style={{font:"600 18px/22px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#0f172a",marginTop:4}}>{ierPad(byId[s.id]||0)}</div>
              {(activeResp || hl) && s.id==="all" && (
                <button type="button" onClick={e=>{e.stopPropagation(); onPick(null); onReset && onReset();}} style={{marginTop:4,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}>
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
function IERAutomationStatus({ atCounts, atFilter, onFilter, atReasonFilter, onApply, hl, xhl }) {
  const at = atCounts;
  const [openMenu, setOpenMenu] = useIER(false);
  const rootRef = useIERR(null);
  useIERE(()=>{ if(!openMenu) return; const h=(e)=>{ if(rootRef.current && !rootRef.current.contains(e.target)) setOpenMenu(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[openMenu]);
  const NAMenu = (typeof window !== "undefined") && window.ARVNeedsAttentionMenu;
  const ierNa = computeIerNA(IER_ROWS);
  return (
    <div ref={rootRef} style={{display:"flex",alignItems:"center",font:"400 13px/16px Roboto",color:"#333",justifyContent:"flex-end",flexWrap:"wrap",rowGap:4,width:"100%"}}>
      <span style={{color:"#94a3b8",marginRight:12}}>Automation (AT) Status :</span>
      {IER_AT.map((s,i)=>{
        const active = hl ? hl.includes(s.id) : atFilter===s.id, dim=(hl||atFilter) ? !active : !!(xhl && !xhl.includes(s.id));
        return (
          <button key={s.id} type="button" onClick={()=>onFilter(active?null:s.id)} style={{background:"transparent",border:"none",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,padding:"2px 6px",borderRadius:4,opacity:dim?0.4:1,marginLeft:i>0?8:0,position:"relative"}}>
            <img src={s.icon} alt="" style={{width:18,height:18,objectFit:"contain"}} />
            <span style={{color:"#0f172a",fontSize:14,whiteSpace:"nowrap"}}>{s.label}</span>
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
  if (synced==null) return <span style={{color:"#94a3b8"}}>—</span>;
  return synced
    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 9 18 20 6"/></svg>
    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>;
}
function IERDocSendIcon({ status }) {
  const s = String(status||"").trim();
  if (!s || s==="—") return <span style={{color:"#94a3b8"}}>—</span>;
  return <IEREHRSyncIcon synced={/^(sent|yes)$/i.test(s)} />;
}
const IER_INFO_ICON = (tip) => <span title={tip} style={{display:"inline-flex",flex:"none",color:"#94a3b8",cursor:"help"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9.5"/><line x1="12" y1="11" x2="12" y2="17" strokeLinecap="round"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none"/></svg></span>;
const IER_RESP_PILL = { accepted:{bg:"#f0fdf4",bd:"#16a34a",c:"#16a34a",label:"Accepted"}, declined:{bg:"#fef2f2",bd:"#dc2626",c:"#dc2626",label:"Declined"}, userDecision:{bg:"#eff6ff",bd:"#2563eb",c:"#2563eb",label:"User Decision"}, ineligible:{bg:"#f1f5f9",bd:"#64748b",c:"#475569",label:"Ineligible"}, exceptions:{bg:"#fffbeb",bd:"#d97706",c:"#d97706",label:"Exceptions"} };
function IERRespPill({ resp, onClick }) {
  const s = IER_RESP_PILL[resp] || { bg:"#f1f5f9", bd:"#94a3b8", c:"#64748b", label:"—" };
  return <span onClick={onClick} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"4px 12px",borderRadius:4,background:s.bg,border:`1px solid ${s.bd}`,color:s.c,font:"500 11px/16px Roboto",whiteSpace:"nowrap",minWidth:140,boxSizing:"border-box",cursor:onClick?"pointer":"default"}}>{s.label}</span>;
}

const IER_COLS = [
  { key:"name",    label:"Patient Name",      grid:"minmax(120px,1.3fr)", sortable:true },
  { key:"agency",  label:"Agency",            grid:"minmax(76px,0.7fr)",  sortable:true },
  { key:"branch",  label:"Branch",            grid:"minmax(64px,0.6fr)",  sortable:true },
  { key:"plan",    label:"Primary Plan",      grid:"minmax(100px,1fr)",   sortable:true },
  { key:"zip",     label:"Zip code",           grid:"minmax(96px,0.7fr)",  sortable:true },
  { key:"refSource", label:"Referral Source",  grid:"minmax(150px,1.3fr)", sortable:true },
  { key:"refId",   label:"Referral ID",       grid:"minmax(110px,1.1fr)", sortable:true },
  { key:"refDate", label:"Referral Date",     grid:"minmax(92px,0.9fr)",  sortable:true },
  { key:"resp",    label:"Referral Response", grid:"156px", sortable:true, align:"center" },
  { key:"docSend", label:"Referral Hub Data Sync", grid:"116px", sortable:true, align:"center", wrap:true, tip:"Status of Patient Data and Documents sent to Referral Hub" },
  { key:"at",      label:"AT Status",         grid:"72px",                sortable:true, align:"center" },
  { key:"docs",    label:"Docs",              grid:"52px",                sortable:false, align:"center" },
  { key:"reviewed",label:"Reviewed?",         grid:"78px",                sortable:true, align:"center" },
];
const IER_STICKY = { resp:348, docSend:226, at:148, docs:90, reviewed:0 };
const ierStk = (k,bg,pad) => IER_STICKY[k]===undefined ? {} : { position:"sticky", right:IER_STICKY[k], zIndex:1, background:bg, alignSelf:"stretch", marginLeft:-6, paddingLeft:6, ...(k==="reviewed"?{marginRight:-pad,paddingRight:pad}:{}), ...(k==="resp"?{boxShadow:"-6px 0 6px -6px rgba(15,23,42,0.15)"}:{}) };
const IER_GRID = IER_COLS.map(c=>c.grid).join(" ");
const IER_ACC_FIELDS = [["gender","Gender"],["ssd","SOC"],["comments","Referral Comment"],["pdd","Discharge Date"],["careType","Type of Care"],["refSource","Referral Source"],["rulesResp","Rules Engine Response"],["respReason","Referral Response Reason"],["agencyRespReason","Agency Referral Response Reason"],["docSendStatus","Document Send Status"],["hubAck","Referral Hub Ack Status"],["receiverCode","Receiver Branch Code"]];
const IER_FLAG_FIELDS = { payerMatched:1, zipMatched:1, srcMatched:1 };
(function(){
  const care=["Home Health","Hospice","Home Health","Home Health","Hospice"];
  const src=["Hospital Discharge Planner","Physician Office","SNF Case Manager","Hospital Case Manager","Physician Office"];
  IER_ROWS.forEach((r,i)=>{
    const ok = r.resp==="accepted";
    r.careType = care[i%care.length];
    r.refSource = r.refSource || src[i%src.length];
    r.payerMatched = r.payerMatched || (r.resp==="ineligible" ? "No" : "Yes");
    r.zipMatched = r.zipMatched || (i%4===3 ? "No" : "Yes");
    r.srcMatched = r.srcMatched || (i%5===4 ? "No" : "Yes");
    r.rulesResp = r.rulesResp || ({accepted:"Accept",declined:"Decline",ineligible:"Decline"}[r.resp] || "Manual Review");
    r.agencyResp = r.agencyResp || ({accepted:"Accepted",declined:"Declined",userDecision:"User Decision",ineligible:"Skip",exceptions:"Pending"}[r.resp]);
    r.agencyRespReason = r.agencyRespReason || ({accepted:"Within service area; staffing available",declined:"Outside agency acceptance criteria",userDecision:"Awaiting intake coordinator decision",ineligible:"No active coverage on file",exceptions:"Awaiting intake coordinator review"}[r.resp]);
    r.docSendStatus = r.docSendStatus || (r.docs ? "Sent" : "Not Sent");
    r.hubAck = r.hubAck || (r.gw ? (i%6===5 ? "Pending" : "Acknowledged") : "—");
  });
})();
// Ineligible: Referral response + both reasons blank, Agency response "Ineligible", Rules Engine Response "Skip".
IER_ROWS.forEach(r=>{ if(r.resp==="userDecision"){ r.docSendStatus="Yes"; r.ehrSync=false; r.rulesResp="User Decision"; } });
IER_ROWS.forEach(r=>{ if(r.resp==="ineligible"){ r.agencyResp="Ineligible"; r.agencyRespReason=""; r.rulesResp="Skip"; } });
(function(){ const f=n=>IER_ROWS.find(r=>r.name===n)||{};
  Object.assign(f("Cameron Williamson"), { resp:"accepted", respBlank:false, respReason:"", ehrSync:true, at:"thumb" });
  Object.assign(f("Esther Howard"), { ehrSync:null, payerMatched:"No", zipMatched:"No", srcMatched:"No" });
  Object.assign(f("Marvin Mckinney"), { branch:"Bcode" });
  Object.assign(f("Guy Hawkins"), { rulesResp:"User Decision" });
  ["Jenny Wilson","Jane Cooper","Jacob Jones","Robert Fox","Darlene Robertson"].forEach(nm=>{ const k = IER_ROWS.findIndex(r=>r.name===nm); if (k>=0) IER_ROWS.splice(k,1); });
  IER_ROWS.forEach(r=>{ if(r.resp==="declined") r.payerMatched="No"; });
  IER_ROWS.forEach(r=>{ if(r.resp==="exceptions"){ r.ehrSync=null; r.docSendStatus=""; r.rulesResp=""; r.respBlank=true; r.respReason=""; r.excBlank=true; } });
  Object.assign(f("Leslie Alexander"), { ehrSync:true });
  Object.assign(f("Brooklyn Simmons"), { ehrSync:null });
  Object.assign(f("Esther Howard"), { docSendStatus:"" });
  // Synthetic plan names — no real payer brands shown.
  const PLAN_MAP = { "Aetna Medicare":"Medicare Advantage HMO", "Texas Medicaid":"State Medicaid Plan", "Humana":"Commercial PPO", "Medicare":"Medicare Part A", "UHC":"Commercial HMO", "Aetna":"Commercial EPO" };
  IER_ROWS.forEach(r=>{ if (PLAN_MAP[r.plan]) r.plan = PLAN_MAP[r.plan]; });
  IER_ROWS.forEach(r=>{ r.payor = /medicaid/i.test(r.plan||"") ? "Medicaid" : String(r.plan||"").split(" ")[0]; });
  IER_ROWS.forEach(r=>{ if(r.at==="warning") r.docSendStatus="Not Sent"; });
  // E-referral Info per-patient Validation Results / Responses ("—" = blank)
  Object.assign(f("Marvin Mckinney"), { payerMatched:"Yes", zipMatched:"Yes", srcMatched:"—", hubResp:"", hubRespReason:"" });
  Object.assign(f("Cameron Williamson"), { docs:true, payerMatched:"Yes", zipMatched:"Yes", srcMatched:"—" });
  Object.assign(f("Robert Fox"), { payerMatched:"Yes", zipMatched:"Yes", srcMatched:"Yes", respReason:"", hubRespReason:"" });
  Object.assign(f("Brooklyn Simmons"), { payerMatched:"No", zipMatched:"—", srcMatched:"—" });
  Object.assign(f("Leslie Alexander"), { payerMatched:"Yes", srcMatched:"—", hubResp:"", hubRespReason:"", respReason:"Out of Service Area" });
  Object.assign(f("Guy Hawkins"), { zipMatched:"—", srcMatched:"—", respReason:"No skill available", hubRespReason:"No skill available" });
  Object.assign(f("Kristin Watson"), { srcMatched:"—", excBlank:false, respBlank:false, rulesResp:"User Decision", hubResp:"Accept", hubRespReason:"", resp:"exceptions", respReason:"Referral placed with another Organization", docSendStatus:"Sent", ehrSync:false });
})();
// Referral Hub Data Sync shown in the grid, E-referral Info and the Dashboard.
function ierDocSend(r) { if (!r) return ""; if (r.at==="warning") return r.docSendStatus||"Not Sent"; return r.excBlank ? "" : (r.docSendStatus||""); }
if (typeof window !== "undefined") window.ierDocSend = ierDocSend;

function IERCheckbox({ checked, onToggle, accent="#2563eb", locked }) {
  const c = locked ? "#BFC5CD" : accent;
  return <span role="checkbox" aria-checked={!!checked} aria-disabled={locked||undefined} tabIndex={0} onClick={locked?undefined:(e)=>{ e.stopPropagation(); e.preventDefault(); onToggle&&onToggle(); }} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,flex:"none",border:`1px solid ${checked?c:"#d8d8d8"}`,borderRadius:3,background:checked?c:"#fff",cursor:locked?"not-allowed":"pointer"}}>{checked && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}</span>;
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

function IERRow({ row, onDocsClick, onRespClick, onAlertsClick, reviewed, onReviewed, bulkMode, selected, onSelect }) {
  const cell = (align) => ({font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",justifyContent:align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0});
  return (
    <div style={{marginBottom:8}}>
      <div style={{display:"grid",gridTemplateColumns:IER_GRID,alignItems:"center",height:48,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:6,boxShadow:"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",gap:6}}>
        <div style={{...cell(),position:"sticky",left:0,zIndex:1,background:"#fff",alignSelf:"stretch",margin:"0 0 0 -11px",paddingLeft:11,boxShadow:"6px 0 6px -6px rgba(15,23,42,0.15)",gap:bulkMode?16:0}}>{bulkMode && <IERCheckbox checked={!!selected||reviewed} locked={reviewed} onToggle={()=>onSelect(row.id)} />}<a href="#" title={row.name} onClick={(e)=>{e.preventDefault(); e.stopPropagation(); window.__openReferralDrawer && window.__openReferralDrawer(row);}} style={{color:"#1677ff",font:"500 13px/16px Roboto",textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.name}</a></div>
        <div style={cell()}>{row.agency}</div>
        <div style={{...cell(),color:"#3b82f6",fontWeight:600}}>{row.branch}</div>
        <div style={cell()} title={row.plan}>{row.plan}</div>
        <div style={cell()}>{row.zip}</div>
        <div style={cell()} title={row.refSource}>{row.refSource}</div>
        <div style={{...cell(),color:"#1e40af"}}>{row.refId}</div>
        <div style={cell()}>{row.refDate}</div>
        <div style={{...cell("center"),...ierStk("resp","#fff",11)}}><IERRespPill resp={row.resp} onClick={()=>onRespClick(row)} /></div>
        <div style={{...cell("center"),...ierStk("docSend","#fff",11)}}><IERDocSendIcon status={ierDocSend(row)} /></div>
        <div style={{...cell("center"),...ierStk("at","#fff",11)}} title={row.at==="warning" ? (row.atReason || "Needs Attention") : undefined}><window.ARVATIcon kind={row.at} reason={row.atReason} /></div>
        <div style={{...cell("center"),...ierStk("docs","#fff",11),cursor:row.docs?"pointer":"default"}} onClick={row.docs?()=>onDocsClick(row):undefined}><IERDocIcon size={18} faded={!row.docs} /></div>
        <div style={{...cell("center"),...ierStk("reviewed","#fff",11)}}>{bulkMode ? null : <IERCheckbox checked={reviewed} locked={reviewed} onToggle={()=>onReviewed(row.id)} />}</div>
      </div>
          </div>
  );
}

function IERTableHeader({ bulkMode, allSelected, onToggleAll, sort, onSort }) {
  const SA = window.ARVSortArrows;
  return (
    <div style={{display:"grid",gridTemplateColumns:IER_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",gap:6}}>
      {[...IER_COLS].map(c=>(
        <div key={c.key} onClick={c.sortable?()=>onSort(c.key):undefined} title={c.sortable?"Sort by "+c.label:undefined} style={{cursor:c.sortable?"pointer":"default",userSelect:"none",gap:4,font:"500 11px/14px Roboto",color:sort&&sort.key===c.key?"#1F2530":"#64748b",textAlign:c.align||"left",display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",...ierStk(c.key,"#f8fafc",12),...(c.key==="name"?{position:"sticky",left:0,zIndex:2,background:"#f8fafc",alignSelf:"stretch",margin:"0 0 0 -12px",paddingLeft:12,boxShadow:"6px 0 6px -6px rgba(15,23,42,0.15)",gap:bulkMode?12:4}:{}),...(c.wrap?{whiteSpace:"normal",textAlign:"center",lineHeight:"13px",gap:4}:{})}}>{bulkMode&&c.key==="name"&&<IERCheckbox checked={!!allSelected} onToggle={onToggleAll} />}{c.sortable && SA && !(bulkMode&&c.key==="reviewed") && <SA active={sort&&sort.key===c.key} dir={sort?sort.dir:"asc"} />}<span>{bulkMode&&c.key==="reviewed"?"":c.label}{c.tip && <span style={{display:"inline-flex",marginLeft:3,verticalAlign:"-2px"}}>{IER_INFO_ICON(c.tip)}</span>}</span></div>
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

const IER_SORT_VAL = {
  refDate: r => { const m=/^(\d\d)\/(\d\d)\/(\d\d)$/.exec(r.refDate||""); return m ? m[3]+m[1]+m[2] : ""; },
  resp: r => (IER_RESP_PILL[r.resp]||{}).label || "",
  docSend: r => { const s=String(ierDocSend(r)); return !s ? 2 : /^(sent|yes)$/i.test(s) ? 0 : 1; },
  at: r => ({thumb:0,warning:1,hourglass:2})[r.at] ?? 3,
};
function IERTable({ rows: rawRows, onDocsClick, onRespClick, onAlertsClick, reviewedSet, onReviewed, bulkMode, selectedIds, setSelectedIds }) {
  const [sort, setSort] = useIER(null);
  const onSort = k => setSort(s => s && s.key===k ? (s.dir==="asc" ? {key:k,dir:"desc"} : null) : {key:k,dir:"asc"});
  const val = (r,k) => k==="reviewed" ? (reviewedSet[r.id]?1:0) : IER_SORT_VAL[k] ? IER_SORT_VAL[k](r) : String(r[k]??"").toLowerCase();
  const rows = sort ? [...rawRows].sort((a,b)=>{ const x=val(a,sort.key), y=val(b,sort.key); const c = typeof x==="number" ? x-y : String(x).localeCompare(String(y), undefined, {numeric:true}); return sort.dir==="asc"?c:-c; }) : rawRows;
  const el = rows.filter(r=>!reviewedSet[r.id]);
  const allSelected = el.length>0 && el.every(r=>selectedIds&&selectedIds[r.id]);
  const toggleAll = ()=>setSelectedIds(m=>{ const n={...m}; el.forEach(r=>{ n[r.id]=!allSelected; }); return n; });
  const Body = ({children}) => window.ScrollBody ? <window.ScrollBody>{children}</window.ScrollBody> : <div style={{overflowY:"auto",flex:1}}>{children}</div>;
  if (rows.length===0) return <div style={{padding:"48px",textAlign:"center",color:"#94a3b8",font:"400 14px Roboto"}}>No records match the current filters.</div>;
  return (
    <div style={{padding:"0 24px 24px",minWidth:0}}>
      <IERScroll>
        <div style={{width:"max-content",minWidth:"100%"}}>
          <div style={{position:"sticky",top:0,zIndex:3,marginBottom:8}}><IERTableHeader sort={sort} onSort={onSort} bulkMode={bulkMode} allSelected={allSelected} onToggleAll={toggleAll} /></div>
          {rows.map(r=><IERRow key={r.id} row={r} onDocsClick={onDocsClick} onRespClick={onRespClick} onAlertsClick={onAlertsClick} reviewed={!!reviewedSet[r.id]} onReviewed={onReviewed} bulkMode={bulkMode} selected={!!(selectedIds&&selectedIds[r.id])} onSelect={id=>setSelectedIds(m=>({...m,[id]:!m[id]}))} />)}
        </div>
      </IERScroll>
      <div style={{padding:"16px 24px",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} records shown</div>
    </div>
  );
}

const IER_AT_MAP = { completed:"thumb", warning:"warning", inprogress:"hourglass" };
function IntakeEReferralView({ review, bulkMode, onBulkApi, onExitBulk }) {
  React.useEffect(() => { window.__rptContext = "ereferral"; return () => { if (window.__rptContext === "ereferral") window.__rptContext = null; }; }, []);
  const [respFilter, setRespFilter] = useIER(null);
  const [atFilter, setAtFilter] = useIER(null);
  const [atReasonFilter, setAtReasonFilter] = useIER(null);
  const [fieldFilters, setFieldFilters] = useIER([]);
  const [initDate, setInitDate] = useIER(()=>window.defaultDateRange([...new Set(IER_ROWS.map(r=>r.refDate))],30));
  const [search, setSearch] = useIER("");
  // Arriving from the E-referral dashboard: show exactly the records behind the clicked count.
  const [focus, setFocus] = useIER(()=>{ const f = window.__ierFocus; window.__ierFocus = null; return f && f.ids ? f : null; });
  const [docsRow, setDocsRow] = useIER(null);
  const [respRow, setRespRow] = useIER(null);
  const [reviewedSet, setReviewedSet] = useIER({});
  const [excludeInel, setExcludeInel] = useIER(false);
  const [selectedIds, setSelectedIds] = useIER({});
  const [bulkReviewConfirm, setBulkReviewConfirm] = useIER(false);
  const selCount = Object.keys(selectedIds).filter(k=>selectedIds[k]).length;
  useIERE(()=>{ if(onBulkApi) onBulkApi(bulkMode ? { count: selCount, markReviewed: ()=>setBulkReviewConfirm(true) } : null); },[bulkMode, selCount]);
  useIERE(()=>{ setSelectedIds({}); },[bulkMode]);
  const [alertsRow, setAlertsRow] = useIER(null);
  const [alertReviewed, setAlertReviewed] = useIER({});
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

  const exclOn = excludeInel;
  const matchAt = r => !atFilter || (r.at===IER_AT_MAP[atFilter] && (atFilter!=="warning" || !atReasonFilter || atReasonFilter.includes(r.atReason)));
  // Review Mode: Needs Attention AT status, plus User Decision and Exceptions responses.
  const REV_RESP = ["userDecision","exceptions"];
  const revMatch = r => r.at==="warning" || REV_RESP.includes(r.resp);
  // One scope drives the table, the response summary and the AT status so the three always tally.
  let scope = IER_ROWS.filter(r=>fieldFilters.every(f=>f.values.includes(r[f.field])));
  scope = focus ? scope.filter(r=>focus.ids.includes(r.id)) : scope.filter(r=>window.dateInRange(r.refDate, initDate));
  if (search.trim()) { const q=search.toLowerCase(); scope = scope.filter(r=>r.name.toLowerCase().includes(q)||r.refId.toLowerCase().includes(q)); }
  if (review) scope = scope.filter(r=>revMatch(r) && !reviewedSet[r.id]);
  const visScope = exclOn ? scope.filter(r=>r.resp!=="ineligible") : scope;
  const rows = visScope.filter(r=>(!respFilter || r.resp===respFilter) && matchAt(r));

  const AT_ID = { thumb:"completed", warning:"warning", hourglass:"inprogress" };
  const hlResp = respFilter ? null : (focus||review) ? [...new Set(visScope.map(r=>r.resp))] : null;
  const hlAt = atFilter ? null : (focus||review) ? [...new Set(visScope.map(r=>AT_ID[r.at]))] : null;
  const respScoped = visScope.filter(matchAt), respScopedAll = scope.filter(matchAt);
  const respCounts = { all: ierPad(respScoped.length) }; ["accepted","declined","userDecision","ineligible","exceptions"].forEach(k=>{ respCounts[k]=ierPad((k==="ineligible"?respScopedAll:respScoped).filter(r=>r.resp===k).length); });
  const atScoped = respFilter ? visScope.filter(r=>r.resp===respFilter) : visScope;
  const warningCount = (atReasonFilter && atReasonFilter.length) ? atScoped.filter(r=>r.at==="warning"&&atReasonFilter.includes(r.atReason)).length : atScoped.filter(r=>r.at==="warning").length;
  const atCounts = { completed: ierPad(atScoped.filter(r=>r.at==="thumb").length), needsAttn: ierPad(warningCount), inProgress: ierPad(atScoped.filter(r=>r.at==="hourglass").length) };
  // Cross-highlight: a Response pick keeps matching AT statuses lit and fades the rest (with their actual counts), and vice versa.
  const xAt = (respFilter && !atFilter && !hlAt) ? [...new Set(rows.map(r=>AT_ID[r.at]))] : null;
  const xResp = (atFilter && !respFilter && !hlResp) ? [...new Set(rows.map(r=>r.resp))] : null;
  if (xAt) { const AK = { completed:["completed","thumb"], warning:["needsAttn","warning"], inprogress:["inProgress","hourglass"] }; Object.keys(AK).forEach(id=>{ if(!xAt.includes(id)) atCounts[AK[id][0]] = ierPad(visScope.filter(r=>r.at===AK[id][1]).length); }); }
  if (xResp) ["accepted","declined","userDecision","ineligible","exceptions"].forEach(k=>{ if(!xResp.includes(k)) respCounts[k] = ierPad((k==="ineligible"?scope:visScope).filter(r=>r.resp===k).length); });

  const chips = [];
  if (focus) chips.push({ id:"focus", label:`Dashboard: ${focus.label}`, onRemove:()=>setFocus(null) });
  if (respFilter) { const s = IER_RESP_ITEMS.find(x=>x.id===respFilter); chips.push({ id:"resp", label:`Response Status: ${s?s.label:respFilter}`, onRemove:()=>setRespFilter(null) }); }
  if (atFilter) { const a = IER_AT.find(x=>x.id===atFilter); chips.push({ id:"at", label:`AT Status: ${a?a.label:atFilter}`, onRemove:()=>{ setAtFilter(null); setAtReasonFilter(null); } }); }
  if (atReasonFilter && atReasonFilter.length) atReasonFilter.forEach(rsn=>chips.push({ id:"atr-"+rsn, label:`Reason: ${rsn}`, onRemove:()=>setAtReasonFilter(prev=>{ const nx=(prev||[]).filter(x=>x!==rsn); return nx.length?nx:null; }) }));

  return (
    <div style={{background:"#fff",minHeight:"100%",display:"flex",flexDirection:"column"}}>
      <IERFilterBar search={search} onSearch={setSearch} datePicker={{label:"Referral Date", value:initDate, available:IER_ROWS.map(r=>r.refDate), onChange:setInitDate}} filterFields={IER_FILTER_FIELDS} filterRows={IER_ROWS} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters} chips={chips} onClearFilters={()=>{ setFocus(null); setRespFilter(null); setAtFilter(null); setAtReasonFilter(null); setFieldFilters([]); }} />
      <div style={{padding:"18px 24px 14px",display:"flex",alignItems:"flex-start",gap:24,borderBottom:"1px solid #e2e8f0"}}>
        <IERTitleCluster excludeInel={excludeInel} disabled={false} onExcludeInel={()=>{ if(!excludeInel && respFilter==="ineligible") setRespFilter(null); setExcludeInel(x=>!x); }} />
        <div style={{marginLeft:"auto",display:"flex",flexDirection:"column",alignItems:"stretch",gap:8,flex:"1 1 820px",maxWidth:820,minWidth:0}}>
          <IERSummaryStrip disabledIds={exclOn?["ineligible"]:[]} counts={respCounts} activeResp={respFilter} onPick={setRespFilter} hl={hlResp} xhl={xResp} onReset={()=>setFocus(null)} />
          <IERAutomationStatus atCounts={atCounts} atFilter={atFilter} onFilter={(v)=>{ setAtFilter(v); if(!v) setAtReasonFilter(null); }} atReasonFilter={atReasonFilter} onApply={(grp)=>{ setAtReasonFilter(grp); setAtFilter("warning"); }} hl={hlAt} xhl={xAt} />
        </div>
      </div>
      <IERTable rows={rows} onDocsClick={setDocsRow} onRespClick={setRespRow} onAlertsClick={setAlertsRow} reviewedSet={reviewedSet} onReviewed={toggleReviewed} bulkMode={bulkMode} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
      {bulkReviewConfirm && window.PCRMarkReviewedModal && <window.PCRMarkReviewedModal noun="" count={selCount} onClose={()=>{ setBulkReviewConfirm(false); onExitBulk && onExitBulk(); }} onConfirm={()=>{ const ids=Object.keys(selectedIds).filter(k=>selectedIds[k]); setReviewedSet(m=>{ const n={...m}; ids.forEach(id=>{ n[id]=true; }); return n; }); setSelectedIds({}); }} />}
      {docsRow && <IERDocsSlideout row={docsRow} onClose={()=>setDocsRow(null)} />}
      {respRow && <IERRespPopup row={respRow} onClose={()=>setRespRow(null)} />}
      {alertsRow && <IERAlertsSlideout row={alertsRow} alertReviewed={alertReviewed} onToggleAlert={toggleAlert} onClose={()=>setAlertsRow(null)} />}
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { IntakeEReferralView, IER_ROWS });
