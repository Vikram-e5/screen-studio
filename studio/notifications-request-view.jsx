// Notifications Center — Notifications Request View.
// Mirrors the Eligibility Request View (ERV) layout: filter strip, title cluster,
// Style-A status summary box + Automation (AT) Status row beneath it, grid table
// with expand-caret child table, pagination, review mode.
const { useState: useNOT, useEffect: useNOTE, useRef: useNOTR } = React;

// ── Mock data ─────────────────────────────────────────────────
const NOT_ROWS = [
  { id:"n1", name:"Marvin Mckinney", mrn:"01500017797001", episodeId:"12345", serviceLine:"Home Health", branchId:"015", event:"EOE", notifOption:"Notification", taskType:"PROCESS EPISODE SUMMARY REPORT TO PHYSICIAN", dueDate:"10/20/26", reportName:"REVIEW EPISODE SUMMARY REPORT", physFacility:"Physician", physFacilityName:"Physician name 1", faxNumber:"(916)703-7979", commMethod:"Website", delivery:"delivered", ehr:{ coord:"success", stage:"success" }, at:"thumb", status:"Completed" },
  { id:"n2", name:"Brooklyn Simmons", mrn:"01500017797002", episodeId:"12576", serviceLine:"Home Health", branchId:"016", event:"DISCHARGE", notifOption:"Notification", taskType:"PROCESS EPISODE SUMMARY REPORT TO PHYSICIAN", dueDate:"10/21/26", reportName:"REVIEW DISCHARGE TRANSFER SUMMARY REPORT", physFacility:"Physician", physFacilityName:"Physician name 2", faxNumber:"(916)703-7980", commMethod:"F-Paper", delivery:"failed", ehr:{ coord:null, stage:null }, at:"warning", atGroup:"terminated", atReason:"Communication method is not applicable", status:"In Progress" },
  { id:"n3", name:"Darrell Steward", mrn:"01500017797003", episodeId:"12789", serviceLine:"Home Health", branchId:"017", event:"TRANSFER TO INPATIENT FACILITY", notifOption:"Notification", taskType:"FAX EPISODE SUMMARY REPORT TO HOSPITAL", dueDate:"10/22/26", reportName:"VIEW DISCHARGE TRANSFER SUMMARY REPORT", physFacility:"Facility", physFacilityName:"Facitlity name 1", faxNumber:"(916)703-7981", commMethod:"", delivery:"delivered", ehr:{ coord:"failed", stage:"pending" }, at:"warning", atGroup:"failed", atReason:"Unable to enter coordination notes", status:"In Progress" },
  { id:"n4", name:"Jane Cooper", mrn:"01500017797004", episodeId:"12458", serviceLine:"Hospice", branchId:"018", event:"HOSPICE DISCHARGE", notifOption:"Notification", taskType:"NOTIFY PRIMARY PHYSICIAN OF CLIENT REVOCATION", dueDate:"10/23/26", reportName:"DISCHARGE TRANSFER SUMMARY REPORT", physFacility:"Physician", physFacilityName:"Physician name 3", faxNumber:"(916)703-7982", commMethod:"", delivery:"failed", ehr:{ coord:"success", stage:"success" }, at:"thumb", status:"Completed" },
  { id:"n5", name:"Cameron Williamson", mrn:"01500017797005", episodeId:"12345", serviceLine:"Hospice", branchId:"019", event:"HOSPICE ADD ON", notifOption:"Notification", taskType:"SEND HOSPICE ORDER AND POC UPDATE TO FACILITY", dueDate:"10/24/26", reportName:"NEW ORDER REPORT", physFacility:"Facility", physFacilityName:"Facitlity name 2", faxNumber:"(916)703-7983", commMethod:"", delivery:"delivered", ehr:{ coord:"success", stage:"success" }, at:"thumb", status:"Completed" },
  { id:"n6", name:"Floyd Miles", mrn:"", episodeId:"12567", serviceLine:"Home Health", branchId:"020", event:"", notifOption:"Review Coordination Notes (RCN)", taskType:"MEDICATION INTERACTION", dueDate:"10/26/26", reportName:"REVIEW COORDINATION NOTE", physFacility:"Physician", physFacilityName:"Physician name 3", faxNumber:"(916)703-7985", commMethod:"F-Fax", delivery:"failed", ehr:{ coord:null, stage:null }, at:"warning", atGroup:"terminated", atReason:"Fax number unavailable", status:"In Progress" },
  { id:"n7", name:"Esther Howard", mrn:"", episodeId:"12736", serviceLine:"Hospice", branchId:"021", event:"", notifOption:"Review Coordination Notes (RCN)", taskType:"FAX FOLLOW-UP NOTE FOR MD-NURSING", dueDate:"10/27/26", reportName:"REVIEW COORDINATION NOTE", physFacility:"Physician", physFacilityName:"Physician name 4", faxNumber:"(916)703-7986", commMethod:"F-Fax", delivery:"delivered", ehr:{ coord:"success", stage:"success" }, at:"thumb", status:"Completed" },
  { id:"n8", name:"Ronald Richards", mrn:"", episodeId:"12678", serviceLine:"Home Health", branchId:"022", event:"", notifOption:"Review Coordination Notes (RCN)", taskType:"MEDICATION INTERACTION", dueDate:"10/28/26", reportName:"REVIEW COORDINATION NOTE", physFacility:"", physFacilityName:"", faxNumber:"", commMethod:"", delivery:"failed", ehr:{ coord:null, stage:null }, at:"warning", atGroup:"terminated", atReason:"No records found in Workflow console", status:"In Progress" },
  { id:"n9", name:"Kathryn Hughes", mrn:"", episodeId:"12438", serviceLine:"Hospice", branchId:"023", event:"", notifOption:"Review Coordination Notes (RCN)", taskType:"FAX FOLLOW-UP NOTE FOR MD-NURSING", dueDate:"10/29/26", reportName:"REVIEW COORDINATION NOTE", physFacility:"", physFacilityName:"", faxNumber:"", commMethod:"", delivery:"failed", ehr:{ coord:null, stage:null }, at:"warning", atGroup:"failed", atReason:"Unable to extract physician details", status:"In Progress" },
  { id:"n10", name:"Albert Flores", mrn:"01500017797023", episodeId:"12656", serviceLine:"Home Health", branchId:"023", event:"DISCHARGE", notifOption:"Notification", taskType:"PROCESS EPISODE SUMMARY REPORT TO PHYSICIAN", dueDate:"10/28/26", reportName:"REVIEW DISCHARGE TRANSFER SUMMARY REPORT", physFacility:"Physician", physFacilityName:"Physician name 5", faxNumber:"", commMethod:"", delivery:"failed", ehr:{ coord:null, stage:null }, at:"warning", atGroup:"terminated", atReason:"Office address inactive", status:"In Progress" },
  { id:"n11", name:"Bessie Cooper", mrn:"01500017797025", episodeId:"12438", serviceLine:"Hospice", branchId:"025", event:"HOSPICE PHYSICIAN ORDER", notifOption:"Notification", taskType:"SEND HOSPICE ORDER AND POC UPDATE TO FACILITY", dueDate:"10/29/26", reportName:"NEW ORDER REPORT", physFacility:"Facility", physFacilityName:"facility name 4", faxNumber:"", commMethod:"", delivery:"failed", ehr:{ coord:null, stage:null }, at:"warning", atGroup:"failed", atReason:"Unable to access record from grid in Maintain Facility", status:"In Progress" },
];
NOT_ROWS.forEach(r=>{
  // Exception ⇔ AT Needs Attention (the automation couldn't send it).
  // Not Sent ⇔ AT Completed with no notification needed.
  if (r.at==="warning") r.delivery = "exception";
  else if (r.delivery==="failed" || r.delivery==="exception") { r.delivery = "failed"; r.at = "thumb"; r.atGroup = null; r.atReason = null; }
  r.assessmentType = ""; r.clinician = ""; r.mode = "gear";
  r.coordNote = r.notifOption==="Notification"
    ? `${r.event} notification for ${r.reportName} sent to ${r.physFacilityName || "—"} via ${r.commMethod || "—"} on ${r.dueDate}.`
    : `Review coordination note: ${r.taskType} for ${r.name}.`;
});
if (typeof window !== "undefined") window.NOT_ROWS = NOT_ROWS;

// ── Helpers ───────────────────────────────────────────────────
const notPad = (n) => String(n).padStart(2, "0");
const NOT_AT_MAP = { completed:"thumb", warning:"warning", inprogress:"hourglass" };
const notIcon = (k, fb) => (typeof window !== "undefined" && window.__resources && window.__resources[k]) || fb;

// Automation (AT) Status row — icons match the row-level AT Status cell exactly.
const NOT_AT_ITEMS = [
  { id:"completed",  label:"Completed",       kind:"thumb",     get icon(){ return notIcon("atCompleted","icons/at-completed.png"); } },
  { id:"warning",    label:"Needs Attention", kind:"warning",   get icon(){ return notIcon("atNeedsAttention","icons/at-needs-attention.png"); }, num:"#d97706", caret:true },
  { id:"inprogress", label:"In Progress",     kind:"hourglass", get icon(){ return notIcon("atInProgress","icons/at-in-progress.png"); } },
];

function NOTATIcon({ kind, reason, group }) {
  if (kind === "thumb")     return <img title="Completed"       alt="Completed"       src={notIcon("atCompleted","icons/at-completed.png")} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind === "warning")   return <img title={reason ? "Needs Attention — " + (group==="failed"?"Failed":"Terminated") + ": " + reason : "Needs Attention"} alt="Needs Attention" src={notIcon("atNeedsAttention","icons/at-needs-attention.png")} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind === "hourglass") return <img title="In Progress"     alt="In Progress"     src={notIcon("atInProgress","icons/at-in-progress.png")} style={{width:18,height:18,objectFit:"contain"}} />;
  return <span style={{color:"#cbd5e1"}}>—</span>;
}

const NOT_DASH = <span style={{color:"#cbd5e1"}}>—</span>;

// ── Filter bar ────────────────────────────────────────────────
function NOTFilterChip({ label, onRemove }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:10,background:"#f4f6f9",border:"1px solid #d8dee6",borderRadius:6,padding:"6px 10px",font:"400 12px/16px Roboto",color:"#334155",whiteSpace:"nowrap",flexShrink:0}}>
      {label}
      <button type="button" title="Remove filter" onClick={onRemove} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",border:"none",background:"transparent",color:"#64748b",fontSize:13,lineHeight:1,cursor:"pointer",padding:0}}>✕</button>
    </span>
  );
}

const NOT_FILTER_FIELDS = [
  { key:"serviceLine",    label:"Service line" },
  { key:"branchId",       label:"Branch" },
  { key:"event",          label:"Event" },
  { key:"notifOption",    label:"Notification option" },
  { key:"physFacility",   label:"Physician/Facility" },
];

function NOTFilterBar({ chips, datePicker, fieldFilters, onFieldFilters, onClearAll, searchValue, onSearch }) {
  const [open, setOpen] = useNOT(false);
  const [dpOpen, setDpOpen] = useNOT(false);
  const dref = useNOTR(null);
  useNOTE(()=>{ if(!dpOpen) return; const h=(e)=>{ if(dref.current && !dref.current.contains(e.target)) setDpOpen(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[dpOpen]);
  const DP = typeof window !== "undefined" && window.DatePicker;
  const FP = typeof window !== "undefined" && window.FilterPopover;
  const labelOf = (k) => (NOT_FILTER_FIELDS.find(f=>f.key===k) || {}).label || k;
  const fieldTags = [];
  (fieldFilters||[]).forEach(f => f.values.forEach(v => fieldTags.push({
    id:`${f.field}:${v}`, label:`${labelOf(f.field)}: ${v}`,
    onRemove: () => onFieldFilters(fieldFilters.map(x => x.field===f.field ? {...x, values:x.values.filter(y=>y!==v)} : x).filter(x=>x.values.length)),
  })));
  return (
    <div style={{background:"#eef4fb",borderBottom:"1px solid #e2e8f0",padding:"10px 24px",display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap"}}>
      <div style={{position:"relative",flexShrink:0}} ref={dref}>
        <button type="button" onClick={()=>setDpOpen(v=>!v)} style={{background:"#fff",border:"1px solid #d8d8d8",borderRadius:4,padding:"5px 12px",font:"400 12px/16px Roboto",color:"#0f172a",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,whiteSpace:"nowrap"}}>
          {`Notification Initiated Date : ${datePicker.value ? datePicker.value.start + " – " + datePicker.value.end : "All"}`}
          <span style={{color:"#94a3b8",fontSize:9}}>▾</span>
        </button>
        {dpOpen && DP && <DP value={datePicker.value} available={datePicker.available} onChange={(d)=>{ datePicker.onChange(d); setDpOpen(false); }} />}
      </div>
      <div style={{position:"relative",flexShrink:0}}>
        <button type="button" onClick={()=>setOpen(v=>!v)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:6,padding:"5px 4px",whiteSpace:"nowrap"}}>
          <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:"#2563eb",color:"#fff",fontSize:10,fontWeight:600,lineHeight:1}}>+</span>
          Add More Filters
        </button>
        {open && FP && <FP fields={NOT_FILTER_FIELDS} rows={NOT_ROWS} initial={fieldFilters} onApply={(f)=>{ onFieldFilters(f); setOpen(false); }} onClose={()=>setOpen(false)} />}
      </div>
      <div className="chip-scroll" style={{display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap",overflowX:"auto",flex:"1 1 auto",minWidth:0}}>
        {chips.map(c => <NOTFilterChip key={c.id} label={c.label} onRemove={c.onRemove} />)}
        {fieldTags.map(t => <NOTFilterChip key={t.id} label={t.label} onRemove={t.onRemove} />)}
      </div>
      {(chips.length + fieldTags.length) > 0 && (
        <button type="button" onClick={onClearAll} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",padding:"5px 4px",flexShrink:0,whiteSpace:"nowrap"}}>Clear all</button>
      )}
      <div style={{position:"relative",flexShrink:0}}>
        <img src={notIcon("searchIcon","icons/search.svg")} alt="search" style={{width:14,height:14,objectFit:"contain",position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}} />
        <input type="text" value={searchValue} onChange={e=>onSearch(e.target.value)} placeholder="Search Patient Records" style={{width:240,background:"#fff",border:"1px solid #93c5e8",borderRadius:6,padding:"6px 12px 6px 32px",font:"400 12px/16px Roboto",color:"#0f172a",outline:"none"}} />
      </div>
    </div>
  );
}

// ── Title cluster ─────────────────────────────────────────────
function NOTTitleCluster() {
  return (
    <div>
      <div style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Notifications View</div>
      <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Status Summary of Notifications Sent to Physicians &amp; Facilities</div>
    </div>
  );
}

// ── Delivery (business) status — tag + summary strip (mirrors Auth Request View) ──
// Needs Attention reasons (Terminated / Failed)
const NOT_NA_TERM = ["No Records retrieved for this workflow","Physician fax number is not available","Communication method is not applicable for client"];
const NOT_NA_FAIL = ["Unable to access record in grid","Technical Issue. Retry attempts exceeded","Unable to print patient file as record is locked by another user in Clinical input"];
function computeNotNA(rows) {
  const term = {}, fail = {};
  (rows||NOT_ROWS).forEach(r=>{ if(r.at!=="warning") return; const m = r.atGroup==="failed" ? fail : term; m[r.atReason] = (m[r.atReason]||0)+1; });
  const sorted = m => Object.entries(m).sort((a,b)=>b[1]-a[1]);
  const termReasons = sorted(term), failReasons = sorted(fail), sum = l => l.reduce((t,x)=>t+x[1],0);
  return { termReasons, failReasons, termTotal:sum(termReasons), failTotal:sum(failReasons) };
}
const NOT_DELIVERY = {
  delivered: { bg:"#f0fdf4", bd:"#16a34a", c:"#16a34a", label:"Sent" },
  pending:   { bg:"#eaf2f8", bd:"#3f7ba8", c:"#3f7ba8", label:"In Progress" },
  failed:    { bg:"#e5e5e5", bd:"#737373", c:"#262626", label:"Not Sent" },
  exception: { bg:"#fff1f0", bd:"#dc2626", c:"#dc2626", label:"Exception" },
};
function NOTDeliveryPill({ kind }) {
  if (!kind) return NOT_DASH;
  const d = NOT_DELIVERY[kind] || NOT_DELIVERY.pending;
  return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"4px 10px",borderRadius:4,background:d.bg,border:`1px solid ${d.bd}`,color:d.c,font:"500 11px/16px Roboto",whiteSpace:"nowrap",minWidth:118,boxSizing:"border-box"}}>{d.label}</span>;
}
const NOT_BIZ_STATUS = [
  { id:"all",       label:"All Records",      color:"#64748b" },
  { id:"delivered", label:"Sent", color:"#16a34a" },
  { id:"pending",   label:"In Progress",          color:"#3f7ba8" },
  { id:"failed",    label:"Not Sent",      color:"#404040" },
  { id:"exception", label:"Exception",     color:"#dc2626" },
];
function NOTStatusStrip({ activeStatus, onPick, counts }) {
  return (
    <div style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333333",flexShrink:0,letterSpacing:"0.01em",borderRadius:"8px 0 0 8px"}}>
        <span>Fax</span><span>Status</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-start"}}>
        {NOT_BIZ_STATUS.map(st=>{
          const active = activeStatus===st.id;
          const dim = activeStatus && !active;
          return (
            <div key={st.id} role="button" onClick={()=>onPick(active||st.id==="all"?null:st.id)}
              style={{flex:"0 0 auto",width:st.id==="delivered"?140:118,boxSizing:"border-box",padding:"10px 16px 12px",cursor:"pointer",opacity:(dim&&st.id!=="all")?0.35:1,transition:"opacity .12s, background .12s",background:active?"#f8fafc":"transparent"}}
              onMouseEnter={e=>{ if(!active&&!dim) e.currentTarget.style.background="#fafbfc"; }}
              onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
              <div style={{height:3,borderRadius:2,background:st.color,opacity:active?1:0.85,marginBottom:8,marginLeft:-9,marginRight:-9}}></div>
              <div style={{font:"400 12px/16px Roboto",color:(dim&&st.id==="all")?"#b0b0b0":"#333333",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={st.label}>{st.label}</div>
              <div style={{font:"600 18px/22px Roboto",color:(dim&&st.id==="all")?"#b0b0b0":"#0f172a",marginTop:4}}>{notPad(counts[st.id]||0)}</div>
              {activeStatus && st.id==="all" && (
                <button type="button" onClick={e=>{ e.stopPropagation(); onPick(null); }} style={{marginTop:4,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}><span style={{fontSize:11,lineHeight:1}}>↻</span>Reset</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Inline AT status row (Auth Request View style)
function NOTATRow({ atCounts, atFilter, onFilter, subMenuRows, atReasonFilter, onReasonFilter }) {
  const [openMenu, setOpenMenu] = useNOT(false);
  const rootRef = useNOTR(null);
  useNOTE(()=>{ if(!openMenu) return; const h=(e)=>{ if(rootRef.current && !rootRef.current.contains(e.target)) setOpenMenu(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[openMenu]);
  const NAMenuCmp = typeof window!=="undefined" && window.ARVNeedsAttentionMenu;
  const breakdown = {};
  (subMenuRows||[]).filter(r=>r.at==="warning").forEach(r=>{ breakdown[r.event] = (breakdown[r.event]||0)+1; });
  const breakdownList = Object.keys(breakdown).map(k=>({ label:k, count:breakdown[k] }));
  return (
    <div ref={rootRef} style={{display:"flex",alignItems:"center",font:"400 13px/16px Roboto",color:"#333333"}}>
      <span style={{color:"#94a3b8",marginRight:12}}>Automation (AT) Status :</span>
      {NOT_AT_ITEMS.map((it,i)=>{
        const active = atFilter===it.id;
        const dim = atFilter && !active;
        return (
          <React.Fragment key={it.id}>
            {i>0 && <span style={{width:1,height:18,background:"#e2e8f0",margin:"0 12px"}}></span>}
            <button type="button" onClick={()=>onFilter(active?null:it.id)} title={`Filter: ${it.label}`}
              style={{background:"transparent",border:"none",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,padding:"2px 6px",borderRadius:4,opacity:dim?0.4:1,transition:"opacity .12s",position:"relative"}}>
              <NOTATIcon kind={it.kind} />
              <span style={{color:"#0f172a",fontSize:14}}>{it.label}</span>
              <span style={{fontWeight:600,color:it.num||"#0f172a"}}>{notPad(atCounts[it.id]||0)}</span>
              {it.caret && (
                <span style={{position:"relative",display:"inline-flex"}}>
                  <span title="Sub-status breakdown" onClick={e=>{ e.stopPropagation(); setOpenMenu(o=>!o); }} style={{width:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#2563eb"}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 8 L19 8 L12 17 Z" fill="currentColor"></path></svg>
                  </span>
                  {openMenu && NAMenuCmp && <NAMenuCmp na={computeNotNA(subMenuRows)} naCount={atCounts.warning||0} selectedReasons={atReasonFilter} onApply={sel=>{ onReasonFilter && onReasonFilter(sel); onFilter("warning"); }} onClose={()=>setOpenMenu(false)} />}
                </span>
              )}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Automation (AT) Status summary (Style A — matches Assessment Request View) ──
const NOT_AT_STATUS = [
  { id:"all",        label:"All Records",     color:"#64748b" },
  { id:"completed",  label:"Completed",       color:"#16a34a" },
  { id:"warning",    label:"Needs Attention", color:"#d97706", caret:true },
  { id:"inprogress", label:"In Progress",     color:"#3f7ba8" },
];

function NOTAutomationStatus({ atCounts, atFilter, onFilter, subMenuRows, atReasonFilter, onReasonFilter }) {
  const [openMenu, setOpenMenu] = useNOT(false);
  const rootRef = useNOTR(null);
  useNOTE(()=>{ if(!openMenu) return; const h=(e)=>{ if(rootRef.current && !rootRef.current.contains(e.target)) setOpenMenu(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[openMenu]);
  const NAMenuCmp = typeof window!=="undefined" && window.ARVNeedsAttentionMenu;
  const breakdown = {};
  (subMenuRows||[]).filter(r=>r.at==="warning").forEach(r=>{ breakdown[r.event] = (breakdown[r.event]||0)+1; });
  const breakdownList = Object.keys(breakdown).map(k=>({ label:k, count:breakdown[k] }));
  return (
    <div ref={rootRef} style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",overflow:"visible"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333",flexShrink:0,borderRadius:"8px 0 0 8px"}}>
        <span>Automation</span><span>(AT) Status</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-start"}}>
        {NOT_AT_STATUS.map(s=>{
          const active = s.id!=="all" && atFilter===s.id;
          const dim = atFilter && atFilter!=="all" && !active;
          return (
            <div key={s.id} role="button" title={s.label} onClick={()=>onFilter(active?null:(s.id==="all"?null:s.id))}
              style={{position:"relative",flex:"0 0 auto",width:s.caret?152:132,boxSizing:"border-box",padding:"10px 16px 12px",cursor:"pointer",opacity:(dim&&s.id!=="all")?0.35:1,transition:"opacity .12s,background .12s",background:active?"#f8fafc":"transparent"}}
              onMouseEnter={e=>{ if(!active&&!dim) e.currentTarget.style.background="#fafbfc"; }}
              onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
              <div style={{height:3,borderRadius:2,background:s.color,opacity:active?1:0.85,marginBottom:8,marginLeft:-9,marginRight:-9}}></div>
              <div style={{display:"flex",alignItems:"center",gap:5,font:"400 12px/16px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#333",whiteSpace:"nowrap"}}>
                {s.id!=="all" && <NOTATIcon kind={NOT_AT_MAP[s.id]} />}
                {s.label}
                {s.caret && (
                  <span title="Sub-status breakdown" onClick={e=>{ e.stopPropagation(); setOpenMenu(o=>!o); }} style={{width:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#2563eb",marginLeft:1}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 8 L19 8 L12 17 Z" fill="currentColor"></path></svg>
                  </span>
                )}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4,marginTop:4}}>
                <span style={{font:"600 18px/22px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#0f172a"}}>{notPad(atCounts[s.id]||0)}</span>
              </div>
              {atFilter && atFilter!=="all" && s.id==="all" && (
                <button type="button" onClick={e=>{ e.stopPropagation(); onFilter(null); }} style={{marginTop:4,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}><span style={{fontSize:11}}>↻</span>Reset</button>
              )}
              {s.caret && openMenu && NAMenuCmp && (
                <NAMenuCmp na={computeNotNA(subMenuRows)} naCount={atCounts.warning||0} selectedReasons={atReasonFilter} onApply={sel=>{ onReasonFilter && onReasonFilter(sel); onFilter("warning"); }} onClose={()=>setOpenMenu(false)} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────
const NOT_COLS = [
  { key:"name",             label:"Patient Name",            grid:"minmax(120px,1.35fr)", sortable:true  },
  { key:"mrn",              label:"MRN",                     grid:"minmax(108px,1.2fr)",  sortable:true  },
  { key:"episodeId",        label:"Episode ID",              grid:"minmax(118px,1.2fr)",  sortable:true  },
  { key:"serviceLine",      label:"Service line",            grid:"minmax(84px,0.95fr)",  sortable:true  },
  { key:"branchId",         label:"Branch ID",               grid:"minmax(70px,0.75fr)",  sortable:true  },
  { key:"event",            label:"Event",                   grid:"minmax(180px,1.6fr)",     sortable:false },
  { key:"notifOption",      label:"Notification option",     grid:"minmax(200px,1.9fr)",  sortable:true  },
  { key:"taskType",         label:"Task/Note type",          grid:"minmax(280px,2.4fr)",    sortable:true  },
  { key:"dueDate",          label:"Notif. Init Date",        grid:"minmax(92px,1fr)",     sortable:true  },
  { key:"reportName",       label:"Report name",             grid:"minmax(102px,1.15fr)", sortable:false },
  { key:"physFacility",     label:"Physician/Facility",      grid:"minmax(140px,1.3fr)",  sortable:true  },
  { key:"physFacilityName", label:"Physician/Facility name", grid:"minmax(190px,1.8fr)",  sortable:true  },
  { key:"faxNumber",        label:"Fax number",              grid:"minmax(92px,1fr)",     sortable:true  },
  { key:"commMethod",       label:"Communication method",    grid:"140px", sortable:true,  align:"center" },
  { key:"delivery",         label:"Fax Status",     grid:"132px", sortable:true,  align:"center" },
  { key:"ehrSync",          label:"EHR Sync",                grid:"72px",  sortable:false, align:"center" },
  { key:"at",               label:"AT Status",               grid:"70px",  sortable:true,  align:"center" },
  { key:"reviewed",         label:"Reviewed?",               grid:"78px",  sortable:false, align:"center" },
];
const NOT_GRID = NOT_COLS.map(c=>c.grid).join(" ");
// Frozen edges: Patient Name on the left; Communication method / AT status / Reviewed on the right.
const NOT_RIGHT_ORDER = ["commMethod","delivery","ehrSync","at","reviewed"];
const NOT_RIGHT_W = { commMethod:140, delivery:132, ehrSync:72, at:70, reviewed:78 };
const notRightOffset = (key)=>{ const i = NOT_RIGHT_ORDER.indexOf(key); if(i<0) return null; let x=0; for(let j=NOT_RIGHT_ORDER.length-1;j>i;j--) x += NOT_RIGHT_W[NOT_RIGHT_ORDER[j]] + 6; return x; };
const notFreezeStyle = (key, bg) => {
  if (key==="name") return { position:"sticky", left:0, zIndex:3, background:bg, alignSelf:"stretch", boxShadow:`-12px 0 0 ${bg}, 6px 0 0 ${bg}, 7px 0 0 #e8edf3` };
  const r = notRightOffset(key);
  if (r===null) return null;
  const sh = key==="commMethod" ? `-6px 0 0 ${bg}, -7px 0 0 #e8edf3` : `-6px 0 0 ${bg}`;
  return { position:"sticky", right:r, zIndex:3, background:bg, alignSelf:"stretch", boxShadow: key==="reviewed" ? sh + `, 12px 0 0 ${bg}` : sh };
};
const NOT_MIN_W = 2590;

function NOTSortArrows({ active, dir }) {
  const up   = active && dir==="asc"  ? "#2563eb" : "rgba(0,0,0,0.25)";
  const down = active && dir==="desc" ? "#2563eb" : "rgba(0,0,0,0.25)";
  return (
    <svg width="10" height="15" viewBox="0 0 9 14" fill="none" style={{marginRight:3,flex:"none"}}>
      <path d="M7.74699 7.40234H1.25301C1.05823 7.40234 0.949473 7.608 1.0701 7.7484L4.31708 11.5135C4.41003 11.6213 4.58899 11.6213 4.68291 11.5135L7.9299 7.7484C8.05053 7.608 7.94177 7.40234 7.74699 7.40234Z" fill={down}/>
      <path d="M7.9299 6.24825L4.68291 2.48317C4.58997 2.3754 4.41101 2.3754 4.31708 2.48317L1.0701 6.24825C0.949473 6.38865 1.05823 6.59431 1.25301 6.59431H7.74699C7.94177 6.59431 8.05053 6.38865 7.9299 6.24825Z" fill={up}/>
    </svg>
  );
}

function NOTTableHeader({ sortKey, sortDir, onSort }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:NOT_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",gap:6,position:"sticky",top:0,zIndex:6,boxShadow:"0 1px 0 #e2e8f0"}}>
      {NOT_COLS.map(c=>(
        <div key={c.key} onClick={c.sortable?()=>onSort(c.key):undefined}
          style={{font:"500 11px/14px Roboto",color:"#64748b",display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",cursor:c.sortable?"pointer":"default",userSelect:"none",overflow:"hidden",whiteSpace:"nowrap",...(c.key==="mrn"?{paddingLeft:14}:null),...notFreezeStyle(c.key,"#f8fafc")}}>
          {c.sortable && <NOTSortArrows active={sortKey===c.key} dir={sortDir} />}
          {c.label}
        </div>
      ))}
    </div>
  );
}

// Task/Note details, derived from the parent record.
const NOT_TASK_TYPE = "HOSPICE POC UPDATE TO PRIMARY PHYSICIAN";
function notTaskArrived(row) {
  const seed = parseInt(row.id.replace(/\D/g,""),10) || 1;
  const [mm,dd,yy] = row.dueDate.split("/");
  return `${mm}/${dd}/${yy} ${notPad(7 + (seed%9))}:${notPad((seed*7)%60)} AM`;
}

function NOTOptionTag({ value }) {
  const rcn = value && value.indexOf("RCN")>=0;
  return <span title={value} style={{display:"inline-flex",alignItems:"center",padding:"2px 8px",borderRadius:4,background:"#f1f5f9",color:"#334155",font:"500 11px/16px Roboto",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%"}}>{value}</span>;
}
const NOTDocIcon = ({c="#2563eb"}) => (
  <svg width="14" height="16" viewBox="0 0 14 16" fill="none"><path d="M2 1h7l3 3v11H2z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M4.5 7h5M4.5 9.5h5M4.5 12h3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>
);

function NOTNotesDrawer({ row, onClose }) {
  useNOTE(()=>{ const h=(e)=>{ if(e.key==="Escape") onClose(); }; document.addEventListener("keydown",h); return ()=>document.removeEventListener("keydown",h); },[]);
  if (!row) return null;
  const meta = [["Patient Name", row.name], ["MRN", row.mrn], ["Episode ID", row.episodeId]];
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",justifyContent:"flex-end"}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(15,23,42,0.28)"}}></div>
      <div style={{position:"relative",width:480,maxWidth:"100%",height:"100%",background:"#fff",boxShadow:"-8px 0 24px rgba(15,23,42,0.12)",display:"flex",flexDirection:"column",animation:"notSlideIn .22s ease-out"}}>
        <style>{"@keyframes notSlideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}"}</style>
        <div style={{padding:"20px 24px 16px",borderBottom:"1px solid #e2e8f0"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
            <div style={{font:"500 17px/22px Roboto",color:"#0f172a"}}>Notes</div>
            <button type="button" title="Close" onClick={onClose} style={{border:"none",background:"transparent",color:"#64748b",fontSize:18,cursor:"pointer",padding:2,lineHeight:1}}>✕</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:16,marginTop:18}}>
            {meta.map(([k,v])=>(
              <div key={k} style={{minWidth:0}}>
                <div style={{font:"400 11px/14px Roboto",color:"#8a9bb5"}}>{k}</div>
                <div style={{font:"400 13px/18px Roboto",color:"#0f172a",marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={v}>{v || "—"}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{flex:"1 1 auto",overflowY:"auto",padding:"20px 24px"}}>
          <div style={{font:"500 13px/18px Roboto",color:"#0f172a",marginBottom:10}}>Coordination Notes</div>
          <div style={{border:"1px solid #e2e8f0",borderRadius:6,background:"#f8fafc",padding:"12px 14px",font:"400 12px/19px Roboto",color:"#333",whiteSpace:"pre-wrap",textWrap:"pretty"}}>{row.coordNote || "No coordination notes."}</div>
        </div>
      </div>
    </div>
  );
}

const NOT_EHR_STAGES = [["coord","Add coordination notes"],["stage","Stage complete status"]];
const NOT_EHR_ST = { success:{ c:"#16a34a", l:"Success" }, failed:{ c:"#dc2626", l:"Failed" }, pending:{ c:"#94a3b8", l:"Pending" } };
function NOTEhrSync({ ehr }) {
  const [pos, setPos] = useNOT(null);
  const all = ehr.coord==="success" && ehr.stage==="success";
  const anyFail = ehr.coord==="failed" || ehr.stage==="failed";
  const icon = all
    ? <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3.2 8.6 L6.3 11.7 L12.8 5.2" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    : anyFail
    ? <svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 4 L12 12 M12 4 L4 12" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/></svg>
    : <span style={{color:"#94a3b8",font:"500 12px/16px Roboto"}}>—</span>;
  const dash = !all && !anyFail;
  return (
    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:28,height:24,cursor:"default"}}
      onMouseEnter={e=>{ const b=e.currentTarget.getBoundingClientRect(); setPos({ x:b.left+b.width/2, y:b.bottom+6 }); }}
      onMouseLeave={()=>setPos(null)}>
      {icon}
      {pos && ReactDOM.createPortal(
        <div style={{position:"fixed",left:pos.x,top:pos.y,transform:"translateX(-50%)",zIndex:1100,background:"#fff",border:"1px solid #e2e8f0",borderRadius:6,boxShadow:"0 6px 18px rgba(15,23,42,0.14)",padding:"10px 12px",minWidth:220,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none",whiteSpace:"nowrap"}}>
          <span style={{font:"500 12px/16px Roboto",color:"#0f172a"}}>EHR Sync</span>
          {NOT_EHR_STAGES.map(([k,l],i)=>{ const st = NOT_EHR_ST[ehr[k]]; return (
            <div key={k} style={{display:"flex",alignItems:"center",gap:8,font:"400 12px/16px Roboto",color:"#333"}}>
              <span style={{flex:1}}>{l}</span>
              {dash ? <span style={{font:"500 12px/14px Roboto",color:"#94a3b8"}}>—</span> : <span style={{display:"inline-flex",alignItems:"center",gap:5,font:"500 11px/14px Roboto",color:st.c}}><span style={{width:7,height:7,borderRadius:"50%",background:st.c}}></span>{st.l}</span>}
            </div>
          ); })}
        </div>, document.body
      )}
    </span>
  );
}

// ── Patient detail slider — all notifications for one MRN ─────
// MRN is only present on "Notification" records; RCN records carry no MRN, so those patients group by name.
const notHasMrn = (r)=>r.notifOption==="Notification";
const notGroupKey = (r)=>notHasMrn(r) ? "m:"+r.mrn : "n:"+r.name;
const notCountByKey = (()=>{ const m={}; NOT_ROWS.forEach(r=>{ const k=notGroupKey(r); m[k]=(m[k]||0)+1; }); return m; })();
const NOT_COV = { active:{ c:"#16a34a", bg:"#f0fdf4", l:"Active" }, inactive:{ c:"#dc2626", bg:"#fef2f2", l:"Inactive" }, pending:{ c:"#3f7ba8", bg:"#eaf2f8", l:"Pending" } };
const NOT_AUTH_ST = { approved:{ c:"#16a34a", bg:"#f0fdf4", l:"Approved" }, denied:{ c:"#dc2626", bg:"#fef2f2", l:"Denied" }, exception:{ c:"#f97316", bg:"#fff7ed", l:"Exception" }, partial:{ c:"#0f766e", bg:"#f0fdfa", l:"Partially Approved" }, pending:{ c:"#3f7ba8", bg:"#eaf2f8", l:"Pending" }, pending_submission:{ c:"#3f7ba8", bg:"#eaf2f8", l:"Pending Submission" } };
function NOTMiniPill({ s }) {
  if (!s) return NOT_DASH;
  return <span style={{display:"inline-flex",alignItems:"center",padding:"4px 10px",borderRadius:4,background:s.bg,border:`1px solid ${s.c}`,color:s.c,font:"500 11px/16px Roboto",whiteSpace:"nowrap"}}>{s.l}</span>;
}
function NOTRecordCard({ title, sub, pill, fields }) {
  return (
    <div style={{border:"1px solid #e2e8f0",borderRadius:6,background:"#fff",padding:"12px 14px",display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:3}}>
          <span style={{font:"500 13px/18px Roboto",color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{title}</span>
          <span style={{font:"400 11px/14px Roboto",color:"#64748b"}}>{sub}</span>
        </div>
        {pill}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:"12px 16px"}}>
        {fields.map(([k,v])=>(
          <div key={k} style={{minWidth:0}}>
            <div style={{font:"400 11px/14px Roboto",color:"#8a9bb5"}}>{k}</div>
            <div title={v||undefined} style={{font:"400 12px/17px Roboto",color:"#333",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v && v!=="-" ? v : NOT_DASH}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
const NOTEmpty = ({ children }) => <div style={{padding:"40px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px dashed #e2e8f0",borderRadius:6}}>{children}</div>;
const notToTime = (d)=>{ const [m,dd,y]=String(d||"").split("/").map(Number); return new Date(2000+(y||0),(m||1)-1,dd||1).getTime(); };
function NOTPatientField({ k, v }) {
  return (
    <div style={{minWidth:0}}>
      <div style={{font:"400 11px/14px Roboto",color:"#8a9bb5"}}>{k}</div>
      <div title={v||undefined} style={{font:"400 13px/18px Roboto",color:"#0f172a",marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v || "—"}</div>
    </div>
  );
}
function NOTNotifCard({ r, open, onToggle, current }) {
  const field = (k,v)=>(
    <div style={{minWidth:0}}>
      <div style={{font:"400 11px/14px Roboto",color:"#8a9bb5"}}>{k}</div>
      <div title={typeof v==="string"?v:undefined} style={{font:"400 12px/17px Roboto",color:"#333",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v || NOT_DASH}</div>
    </div>
  );
  return (
    <div style={{border:`1px solid ${current?"#93c5fd":"#e2e8f0"}`,borderRadius:6,background:"#fff",overflow:"hidden"}}>
      <div onClick={onToggle} style={{display:"grid",gridTemplateColumns:"14px minmax(0,1fr) auto auto",alignItems:"center",gap:12,padding:"12px 14px",cursor:"pointer",background:open?"#f8fafc":"#fff"}}>
        <span style={{display:"inline-block",transform:open?"rotate(90deg)":"none",transition:"transform .15s",fontSize:11,color:"#64748b"}}>▸</span>
        <div style={{minWidth:0,display:"flex",flexDirection:"column",gap:3}}>
          <span style={{font:"500 13px/18px Roboto",color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.event}{r.reportName ? " · "+r.reportName : ""}</span>
          <span style={{font:"400 11px/14px Roboto",color:"#64748b"}}>{r.dueDate} · {r.episodeId} · {r.serviceLine}</span>
        </div>
        <NOTOptionTag value={r.notifOption} />
        <NOTDeliveryPill kind={r.delivery} />
      </div>
      {open && (
        <div style={{borderTop:"1px solid #eef2f7",padding:"14px 14px 16px",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:"14px 16px"}}>
            {field("Task Type", r.taskType)}
            {field("Branch", r.branchId)}
            {field("Physician / Facility", r.physFacility)}
            {field(r.physFacility==="Facility" ? "Facility Name" : "Physician Name", r.physFacilityName)}
            {field("Fax Number", r.faxNumber)}
            {field("Communication Method", r.commMethod)}
            {r.at==="warning" && r.atReason ? field("Needs Attention Reason", r.atReason) : null}
          </div>
        </div>
      )}
    </div>
  );
}
function NOTPatientDrawer({ row, onClose }) {
  const [tab, setTab] = useNOT("notifs");
  const [openId, setOpenId] = useNOT(row ? row.id : null);
  useNOTE(()=>{ const h=(e)=>{ if(e.key==="Escape") onClose(); }; document.addEventListener("keydown",h); return ()=>document.removeEventListener("keydown",h); },[]);
  if (!row) return null;
  const hasMrn = notHasMrn(row);
  const gk = notGroupKey(row);
  const list = NOT_ROWS.filter(r=>notGroupKey(r)===gk).sort((a,b)=>notToTime(b.dueDate)-notToTime(a.dueDate));
  const eligList = hasMrn ? ((typeof window!=="undefined" && window.ERV_ROWS) || []).filter(r=>r.mrn===row.mrn) : [];
  const authList = hasMrn ? ((typeof window!=="undefined" && window.arvRows) || []).filter(r=>r.mrn===row.mrn) : [];
  const uniq = (k)=>[...new Set(list.map(r=>r[k]).filter(Boolean))].join(", ");
  const cnt = (k)=>list.filter(r=>r.delivery===k).length;
  const latest = list[0] || row;
  const tabs = hasMrn
    ? [{ id:"details", label:"Patient Details" }, { id:"elig", label:"Eligibility", n:eligList.length }, { id:"auth", label:"Authorization", n:authList.length }, { id:"notifs", label:"Notifications", n:list.length }, { id:"eligAlert", label:"Eligibility Alerts", n:(window.eligSectionFor ? window.eligSectionFor(row,"alert").length : 0) }, { id:"hoIntake", label:"HO Intake", n:(window.eligSectionFor ? window.eligSectionFor(row,"hospice").length : 0) }]
    : [{ id:"notifs", label:"Notifications", n:list.length }, { id:"eligAlert", label:"Eligibility Alerts", n:(window.eligSectionFor ? window.eligSectionFor(row,"alert").length : 0) }, { id:"hoIntake", label:"HO Intake", n:(window.eligSectionFor ? window.eligSectionFor(row,"hospice").length : 0) }];
  const idLabel = hasMrn ? "MRN "+row.mrn : "No MRN";
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",justifyContent:"flex-end"}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(15,23,42,0.28)"}}></div>
      <div style={{position:"relative",width:760,maxWidth:"100%",height:"100%",background:"#fff",boxShadow:"-8px 0 24px rgba(15,23,42,0.12)",display:"flex",flexDirection:"column",animation:"notSlideIn .22s ease-out"}}>
        <style>{"@keyframes notSlideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}"}</style>
        <div style={{padding:"20px 24px 0",borderBottom:"1px solid #e2e8f0"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
            <div style={{display:"flex",alignItems:"baseline",gap:10,minWidth:0}}>
              <span style={{font:"500 17px/22px Roboto",color:"#0f172a"}}>{row.name}</span>
              <span style={{font:"400 13px/18px Roboto",color:"#64748b"}}>{idLabel}</span>
            </div>
            <button type="button" title="Close" onClick={onClose} style={{border:"none",background:"transparent",color:"#64748b",fontSize:18,cursor:"pointer",padding:2,lineHeight:1}}>✕</button>
          </div>
          <div style={{display:"flex",gap:24,marginTop:16}}>
            {tabs.map(tb=>{ const on = tab===tb.id; return (
              <button key={tb.id} type="button" onClick={()=>setTab(tb.id)} style={{border:"none",background:"transparent",padding:"0 0 10px",cursor:"pointer",borderBottom:`2px solid ${on?"#2563eb":"transparent"}`,color:on?"#2563eb":"#64748b",font:"500 13px/18px Roboto",display:"inline-flex",alignItems:"center",gap:6}}>
                {tb.label}
                {tb.n!=null && <span style={{minWidth:18,height:18,padding:"0 5px",borderRadius:9,background:on?"#2563eb":"#e2e8f0",color:on?"#fff":"#475569",font:"500 11px/18px Roboto",textAlign:"center"}}>{tb.n}</span>}
              </button>
            ); })}
          </div>
        </div>
        <div className="ws-scrollbody" style={{flex:"1 1 auto",overflowY:"auto",padding:"20px 24px"}}>
          {tab==="elig" ? (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {eligList.length===0 ? <NOTEmpty>No eligibility requests for this patient.</NOTEmpty> : eligList.map(e=>(
                <NOTRecordCard key={e.id} title={e.payor} sub={"Initiated "+e.eligInit+(e.gw?" · "+e.gw:"")} pill={<NOTMiniPill s={NOT_COV[e.cov]} />}
                  fields={[["Payor Source",e.payorSrc],["Member ID",e.memId],["SOC",e.soc],["Elig Initiated",e.eligInit],["Last Checked",e.chk],["Gateway",e.gw]]} />
              ))}
            </div>
          ) : tab==="auth" ? (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {authList.length===0 ? <NOTEmpty>No authorization requests for this patient.</NOTEmpty> : authList.map(a=>(
                <NOTRecordCard key={a.key} title={(a.type||"Authorization")+" · "+(a.epi||"")} sub={"Initiated "+a.init+(a.gw && a.gw!=="-"?" · "+a.gw:"")} pill={<NOTMiniPill s={NOT_AUTH_ST[a.status]} />}
                  fields={[["Payor Source",a.src],["Payor Type",a.ptype],["Member ID",a.mid],["Auth Initiated",a.init],["Submitted",a.sub],["Payor Response",a.pyrResp]]} />
              ))}
            </div>
          ) : (tab==="eligAlert" || tab==="hoIntake") ? (
            window.EligSectionInfo ? <window.EligSectionInfo patient={row} section={tab==="eligAlert"?"alert":"hospice"} bare /> : null
          ) : tab==="details" ? (
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:"18px 16px"}}>
              <NOTPatientField k="Patient Name" v={row.name} />
              <NOTPatientField k="MRN" v={row.mrn} />
              <NOTPatientField k="Service Line" v={uniq("serviceLine")} />
              <NOTPatientField k="Branch" v={uniq("branchId")} />
              <NOTPatientField k="Episode ID(s)" v={uniq("episodeId")} />
              <NOTPatientField k="Clinician" v={uniq("clinician")} />
              <NOTPatientField k="Assessment Type" v={latest.assessmentType} />
              <NOTPatientField k="Primary Physician / Facility" v={latest.physFacilityName} />
              <NOTPatientField k="Last Notification" v={latest.dueDate} />
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {list.map(r=>(<NOTNotifCard key={r.id} r={r} current={r.id===row.id} open={openId===r.id} onToggle={()=>setOpenId(id=>id===r.id?null:r.id)} />))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Notification Info tab content for the shared patient detail slider.
function NOTPatientNotifications({ row }) {
  const [openId, setOpenId] = useNOT(row ? row.id : null);
  if (!row) return null;
  const hasMrn = notHasMrn(row);
  const gk = notGroupKey(row);
  const list = NOT_ROWS.filter(r=>notGroupKey(r)===gk).sort((a,b)=>notToTime(b.dueDate)-notToTime(a.dueDate));
  const cnt = (k)=>list.filter(r=>r.delivery===k).length;
  return (
    <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:10}}>
      <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",marginBottom:4}}>
        <span style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Notifications</span>
      </div>
      {list.map(r=>(<NOTNotifCard key={r.id} r={r} current={r.id===row.id} open={openId===r.id} onToggle={()=>setOpenId(id=>id===r.id?null:r.id)} />))}
    </div>
  );
}
if (typeof window !== "undefined") window.NOTPatientNotifications = NOTPatientNotifications;

function NOTTableRow({ row, reviewed, onReviewed, onNotes, onPatient, accent="#2563eb" }) {
  const cell = (align) => ({font:"500 12px/16px Roboto",color:"#333333",display:"flex",alignItems:"center",justifyContent:align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0});
  return (
    <div style={{display:"grid",gridTemplateColumns:NOT_GRID,alignItems:"center",height:48,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:8,boxShadow:"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",gap:6}}>
      <div style={{...cell(),...notFreezeStyle("name","#fff")}}>
        <span title={"Open patient details — "+row.name} onClick={()=>onPatient&&onPatient(row)} style={{font:"500 13px/16px Roboto",color:"#2563eb",overflow:"hidden",textOverflow:"ellipsis",cursor:"pointer"}}>{row.name}</span>
      </div>
      <div style={{...cell(),paddingLeft:14}}>{row.notifOption==="Notification" ? row.mrn : ""}</div>
      <div style={cell()}>{row.episodeId}</div>
      <div style={cell()}>{row.serviceLine}</div>
      <div style={cell()}>{row.branchId}</div>
      <div style={cell()} title={row.event||undefined}>{row.event ? <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{row.event}</span> : NOT_DASH}</div>
      <div style={cell()}><NOTOptionTag value={row.notifOption} /></div>
      <div style={cell()} title={row.taskType}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{row.taskType}</span></div>
      <div style={cell()} title="Notification Initiated Date (transaction start)">{row.dueDate || NOT_DASH}</div>
      <div style={cell()} title={row.reportName||undefined}>{row.reportName ? <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{row.reportName}</span> : NOT_DASH}</div>
      <div style={cell()}>{row.physFacility}</div>
      <div style={cell()} title={row.physFacilityName||undefined}>{row.physFacilityName ? <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{row.physFacilityName}</span> : NOT_DASH}</div>
      <div style={cell()}>{row.faxNumber || NOT_DASH}</div>
      <div style={{...cell("center"),...notFreezeStyle("commMethod","#fff")}}>{row.commMethod || NOT_DASH}</div>
      <div style={{...cell("center"),...notFreezeStyle("delivery","#fff")}}><NOTDeliveryPill kind={row.delivery} /></div>
      <div style={{...cell("center"),...notFreezeStyle("ehrSync","#fff")}}><NOTEhrSync ehr={row.ehr} /></div>
      <div style={{...cell("center"),...notFreezeStyle("at","#fff")}}><NOTATIcon kind={row.at} reason={row.atReason} group={row.atGroup} /></div>
      <div style={{...cell("center"),...notFreezeStyle("reviewed","#fff")}} onClick={(e)=>e.stopPropagation()}>
        <span role="checkbox" aria-checked={!!reviewed} tabIndex={0} onClick={()=>onReviewed(row.id)}
          style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:`1px solid ${reviewed?accent:"#d8d8d8"}`,borderRadius:3,background:reviewed?accent:"#fff",cursor:"pointer"}}>
          {reviewed && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}
        </span>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────
function NOTPagination({ total, page, perPage, onPage, onPerPage }) {
  return null;
  const pages = Math.max(1, Math.ceil(total/perPage));
  const start = total === 0 ? 0 : (page-1)*perPage+1;
  const end = Math.min(page*perPage, total);
  const Btn = ({children,active,disabled,onClick}) => (
    <button type="button" onClick={onClick} disabled={disabled} style={{width:28,height:28,borderRadius:4,border:`1px solid ${active?"#2563eb":"#e2e8f0"}`,background:active?"#2563eb":"#fff",color:active?"#fff":disabled?"#cbd5e1":"#333333",font:"400 12px/16px Roboto",cursor:disabled?"default":"pointer",padding:0}}>{children}</button>
  );
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #e2e8f0",padding:"12px 24px"}}>
      <div style={{display:"flex",alignItems:"center",gap:16}}>
        <span style={{font:"400 12px/16px Roboto",color:"#94a3b8"}}>Showing {start}–{end} of {total}</span>
        <label style={{display:"inline-flex",alignItems:"center",gap:6,font:"400 12px/16px Roboto",color:"#94a3b8"}}>
          Rows
          <select value={perPage} onChange={(e)=>onPerPage(parseInt(e.target.value,10))} style={{border:"1px solid #e2e8f0",borderRadius:4,padding:"3px 6px",font:"400 12px/16px Roboto",color:"#333333",background:"#fff",outline:"none"}}>
            {[10,15,25,50].map(n=><option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
      <div style={{display:"flex",gap:6}}>
        <Btn onClick={()=>onPage(page-1)} disabled={page===1}>‹</Btn>
        {Array.from({length:Math.min(pages,5)},(_,i)=>i+1).map(n=><Btn key={n} active={n===page} onClick={()=>onPage(n)}>{n}</Btn>)}
        <Btn onClick={()=>onPage(page+1)} disabled={page>=pages}>›</Btn>
      </div>
    </div>
  );
}

// ── Notifications Request View (main) ─────────────────────────
function NotificationsRequestView({ review, onExitReview, focus }) {
  const [atFilter, setAtFilter]         = useNOT(null);
  const [statusFilter, setStatusFilter] = useNOT(null);
  const [atReasonFilter, setAtReason]   = useNOT(null);
  const [idFilter, setIdFilter]         = useNOT(null); // exact records behind a dashboard action item
  const [searchQ, setSearchQ]           = useNOT("");
  const [sortKey, setSortKey]           = useNOT(null);
  const [sortDir, setSortDir]           = useNOT("asc");
  const [fieldFilters, setFieldFilters] = useNOT([]);
  const [reviewedSet, setReviewedSet]   = useNOT(()=>({ ...(window.__notReviewed||{}) }));
  const [page, setPage]                 = useNOT(1);
  const [perPage, setPerPage]           = useNOT(10);
  const [dateRange, setDateRange]       = useNOT(()=> window.defaultDateRange([...new Set(NOT_ROWS.map(r=>r.dueDate))], 30));

  const [noteRow, setNoteRow]           = useNOT(null);
  const [patientRow, setPatientRow]     = useNOT(null);
  const toggleReviewed = (id) => setReviewedSet(m=>{ const nx = {...m,[id]:!m[id]}; window.__notReviewed = nx; return nx; });
  // Dashboard drill-down: land on the same records the dashboard card / action item counted.
  useNOTE(()=>{ if(!focus) return;
    setFieldFilters([]); setSearchQ("");
    const ids = focus.ids && focus.ids.length ? focus.ids : null;
    setIdFilter(ids ? { ids, label: focus.label || "Dashboard action item" } : null);
    setStatusFilter(ids ? null : (focus.status || null));
    setAtFilter(ids ? null : (focus.at || null));
    setAtReason(ids ? null : (focus.reasons && focus.reasons.length ? focus.reasons : null));
    if (focus.dateRange) setDateRange(focus.dateRange);
  }, [focus && focus.ts]);
  const onSort = (k) => { if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };

  // Reset to page 1 whenever the composed filter set changes.
  const filterSig = JSON.stringify([statusFilter,atFilter,searchQ,fieldFilters,dateRange,review,perPage,idFilter]);
  useNOTE(()=>{ setPage(1); }, [filterSig]);

  // Compose: field filters ∧ search ∧ date ∧ AT status.
  let base = NOT_ROWS.filter(r => fieldFilters.every(f => f.values.includes(r[f.field])));
  if (searchQ.trim()) { const q = searchQ.toLowerCase(); base = base.filter(r=>[r.name,r.assessmentType,r.status].join(" ").toLowerCase().includes(q)); }
  if (dateRange) base = base.filter(r=>window.dateInRange(r.dueDate, dateRange));
  const needsReview = (r) => r.at==="warning" || r.status==="Overdue";
  if (review) base = base.filter(r => needsReview(r) && !reviewedSet[r.id]);

  const atCounts = { all: base.length };
  NOT_AT_ITEMS.forEach(s=>{ atCounts[s.id] = base.filter(r=>r.at===s.kind).length; });

  const bizCounts = { all: 0 };
  ["delivered","pending","failed","exception"].forEach(k=>{ bizCounts[k] = base.filter(r=>r.delivery===k).length; bizCounts.all += bizCounts[k]; });
  let rows = atFilter ? base.filter(r=>r.at===NOT_AT_MAP[atFilter]) : base;
  if (statusFilter) rows = rows.filter(r=>r.delivery===statusFilter);
  if (atReasonFilter && atReasonFilter.length) rows = rows.filter(r=>r.at==="warning" && atReasonFilter.includes(r.atReason));
  if (idFilter) rows = rows.filter(r=>idFilter.ids.includes(r.id));
  if (sortKey) {
    rows = [...rows].sort((a,b)=>{
      const av = (a[sortKey]==null?"":a[sortKey]).toString().toLowerCase();
      const bv = (b[sortKey]==null?"":b[sortKey]).toString().toLowerCase();
      if (av<bv) return sortDir==="asc"?-1:1;
      if (av>bv) return sortDir==="asc"?1:-1;
      return 0;
    });
  }
  const total = rows.length;
  const pageRows = rows;

  const chips = [];
  if (idFilter) chips.push({ id:"ids", label:`${idFilter.label} (${notPad(idFilter.ids.length)})`, onRemove:()=>setIdFilter(null) });
  if (statusFilter) chips.push({ id:"biz", label:`Fax Status: ${NOT_DELIVERY[statusFilter].label}`, onRemove:()=>setStatusFilter(null) });
  if (atFilter) { const a = NOT_AT_ITEMS.find(x=>x.id===atFilter); chips.push({ id:"at", label:`AT Status: ${a?a.label:atFilter}`, onRemove:()=>{ setAtFilter(null); setAtReason(null); } }); }
  (atReasonFilter||[]).forEach(rsn=>chips.push({ id:"rsn-"+rsn, label:`Reason: ${rsn}`, onRemove:()=>setAtReason(prev=>{ const nx=(prev||[]).filter(x=>x!==rsn); return nx.length?nx:null; }) }));
  if (review) {
    [
      { id:"rv-at",  label:"Automation Status: Needs Attention" },
      { id:"rv-od",  label:"Status: Overdue" },
      { id:"rv-nr",  label:"Reviewed : Not Reviewed" },
    ].forEach(c=>chips.push({ ...c, onRemove:()=>onExitReview&&onExitReview() }));
  }
  const clearAll = () => { setIdFilter(null); setStatusFilter(null); setAtFilter(null); setAtReason(null); setFieldFilters([]); if(review && onExitReview) onExitReview(); };

  const ScrollBodyCmp = (typeof window!=="undefined" && window.ScrollBody) || null;
  const Body = ({children}) => ScrollBodyCmp ? <ScrollBodyCmp>{children}</ScrollBodyCmp> : <div className="ws-scrollbody" style={{maxHeight:"calc(100vh - 400px)",overflowY:"auto",paddingTop:8}}>{children}</div>;

  return (
    <div style={{background:"#fff"}} data-screen-label="01 Notifications">
      <NOTFilterBar
        chips={chips}
        datePicker={{ value:dateRange, available:[...new Set(NOT_ROWS.map(r=>r.dueDate))], onChange:setDateRange }}
        fieldFilters={fieldFilters} onFieldFilters={setFieldFilters}
        onClearAll={clearAll} searchValue={searchQ} onSearch={setSearchQ} />
      <div style={{padding:"20px 24px 0",display:"flex",alignItems:"center",gap:32,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 380px",minWidth:0}}>
          <NOTTitleCluster />
        </div>
        <div style={{flex:"0 1 auto",minWidth:0}}>
          <NOTStatusStrip activeStatus={statusFilter} counts={bizCounts} onPick={v=>{ setStatusFilter(v); if(v){ setAtFilter(null); setAtReason(null); } }} />
        </div>
      </div>
      <div style={{padding:"10px 24px 0",display:"flex",justifyContent:"flex-end"}}>
        <NOTATRow atCounts={atCounts} atFilter={atFilter} onFilter={v=>{ setAtFilter(v); if(v) setStatusFilter(null); if(!v) setAtReason(null); }} subMenuRows={base}
          atReasonFilter={atReasonFilter} onReasonFilter={sel=>setAtReason(sel && sel.length ? sel : null)} />
      </div>
      <div style={{padding:"12px 24px 0"}}>
        <Body>
          <div className="chip-scroll" style={{overflowX:"auto",overflowY:"hidden"}}>
            <div style={{minWidth:NOT_MIN_W}}>
              <NOTTableHeader sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              {pageRows.length===0 ? (
                <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>No notifications match the current filters.</div>
              ) : pageRows.map(r=>(
                <NOTTableRow key={r.id} row={r} reviewed={!!reviewedSet[r.id]} onReviewed={toggleReviewed} onNotes={setNoteRow} onPatient={(r)=>{ if (window.__openNotifDrawer) window.__openNotifDrawer(r); else setPatientRow(r); }} />
              ))}
            </div>
          </div>
        </Body>
      </div>
      {noteRow && <NOTNotesDrawer row={noteRow} onClose={()=>setNoteRow(null)} />}
      {patientRow && !window.__openNotifDrawer && <NOTPatientDrawer key={patientRow.id} row={patientRow} onClose={()=>setPatientRow(null)} />}
      <NOTPagination total={total} page={page} perPage={perPage} onPage={(p)=>setPage(Math.min(Math.max(1,p), Math.max(1,Math.ceil(total/perPage))))} onPerPage={setPerPage} />
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { NotificationsRequestView });
