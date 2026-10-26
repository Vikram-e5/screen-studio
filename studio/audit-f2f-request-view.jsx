// F2F (Face-to-Face) Encounter Audit — Request View + detail drawer.
// Mirrors the app's existing Eligibility/Authorization request-view pattern
// (SectionBand host, filter-chip strap, dense grid table, right slide-out
// drawer with accordions) with F2F-audit-specific columns and content.
const { useState: useF } = React;

// Columns/data from Figma frame "Slide 16:9 - 6" (Face To Face Encounter Audit View).
const F2F_COLS = [
  { key:"name", label:"Name", grid:"minmax(120px,1.3fr)" },
  { key:"mrn", label:"MRN", grid:"minmax(118px,1.2fr)" },
  { key:"branch", label:"Branch", grid:"minmax(56px,.6fr)" },
  { key:"refSrc", label:"Referral Source", grid:"minmax(78px,.8fr)" },
  { key:"soc", label:"SOC", grid:"minmax(66px,.7fr)" },
  { key:"trigger", label:"Audit Trigger", grid:"minmax(76px,.8fr)" },
  { key:"auditDate", label:"Audit Date", grid:"minmax(70px,.75fr)" },
  { key:"encounter", label:"F2F Encounter Date", grid:"minmax(84px,.85fr)", align:"center" },
  { key:"due", label:"F2F Encounter Due Date", grid:"minmax(96px,.9fr)", align:"center", info:true },
  { key:"remain", label:"Days Remaining", grid:"minmax(100px,.95fr)", align:"center", info:true },
  { key:"ehr", label:"EHR Sync", grid:"58px", align:"center" },
  { key:"at", label:"AT Status", grid:"62px", align:"center" },
  { key:"auditor", label:"Auditor", grid:"minmax(84px,.85fr)", align:"center" },
  { key:"req", label:"F2F Requirements Met?", grid:"150px", align:"center" },
  { key:"details", label:"View Details", grid:"72px", align:"center" },
  { key:"reviewed", label:"Reviewed?", grid:"70px", align:"center" },
];
const F2F_GRID = F2F_COLS.map(c=>c.grid).join(" ");

const f2fRows = [
  { name:"Marvin Mckinney", mrn:"B6100062245601", branch:"Bcode", refSrc:"Institution", soc:"07/08/25", trigger:"485", auditDate:"08/11/25", encounter:"07/15/25", due:"08/07/25", remain:"Closed", remainKind:"closed", ehr:true, at:"complete", auditor:"E5 Agent", req:"Met" },
  { name:"Rachel Martin", mrn:"B6789012345685", branch:"Bcode", refSrc:"Institution", soc:"06/26/25", trigger:"Pre-Bill", auditDate:"08/11/25", encounter:"07/11/25", due:"07/26/25", remain:"15 days left", remainKind:"warn", ehr:true, at:"incomplete", auditor:"E5 Agent", req:"Not Met" },
  { name:"John Doe", mrn:"B6100054445634", branch:"Bcode", refSrc:"Institution", soc:"08/08/25", trigger:"Pre-Bill", auditDate:"08/10/25", encounter:"07/10/25", due:"09/07/25", remain:"Closed", remainKind:"closed", ehr:true, at:"complete", auditor:"E5 Agent", req:"Met" },
  { name:"John Peel", mrn:"B6789012345685", branch:"Bcode", refSrc:"Community", soc:"06/26/25", trigger:"485", auditDate:"08/10/25", encounter:"07/01/25", due:"07/26/25", remain:"Closed", remainKind:"closed", ehr:true, at:"complete", auditor:"Fiona Gallagher", req:"Met", source:"override" },
  { name:"Kena White", mrn:"B6789012345678", branch:"Bcode", refSrc:"Institution", soc:"08/05/25", trigger:"Referral", auditDate:"08/10/25", encounter:"07/07/25", due:"09/04/25", remain:"Closed", remainKind:"closed", ehr:true, at:"complete", auditor:"E5 Agent", req:"Met" },
  { name:"William Peel", mrn:"B6789012345685", branch:"Bcode", refSrc:"Institution", soc:"07/12/25", trigger:"485", auditDate:"08/07/25", encounter:"07/27/25", due:"08/12/25", remain:"01 day left", remainKind:"danger", ehr:true, at:"incomplete", auditor:"Ethan Hunt", req:"Not Met" },
  { name:"Sarah Lee", mrn:"B6789012345720", branch:"Bcode", refSrc:"Institution", soc:"08/09/25", trigger:"Referral", auditDate:"08/07/25", encounter:"07/08/25", due:"09/08/25", remain:"Closed", remainKind:"closed", ehr:false, at:"complete", auditor:"E5 Agent", req:"Met" },
  { name:"Joseph Dyan", mrn:"B6100054445634", branch:"Bcode", refSrc:"Community", soc:"05/18/25", trigger:"Pre-Bill", auditDate:"08/07/25", encounter:"—", due:"06/17/25", remain:"Past Due", remainKind:"danger", ehr:true, at:"inprogress", auditor:"Ethan Hunt", req:"Not Met" },
  { name:"Harry Jacobs", mrn:"B6789012345685", branch:"Bcode", refSrc:"Institution", soc:"05/01/25", trigger:"485", auditDate:"07/05/25", encounter:"06/03/25", due:"06/04/25", remain:"Closed", remainKind:"closed", ehr:true, at:"complete", auditor:"E5 Agent", req:"Met" },
  { name:"Tiger White", mrn:"B6789012345678", branch:"Bcode", refSrc:"Institution", soc:"06/06/25", trigger:"SOC", auditDate:"06/06/25", encounter:"—", due:"—", remain:"—", remainKind:"none", ehr:false, at:"incomplete", auditor:"Ethan Hunt", req:"Exception" },
  { name:"Singh Rajiv", mrn:"B6789012345720", branch:"Bcode", refSrc:"Community", soc:"06/06/25", trigger:"Referral", auditDate:"06/10/25", encounter:"—", due:"—", remain:"—", remainKind:"none", ehr:false, at:"inprogress", auditor:"Auditor", req:"Exception" },
  { name:"Dolores Kemp", mrn:"B6100062245733", branch:"Bcode", refSrc:"Institution", soc:"08/04/25", trigger:"485", auditDate:"", encounter:"", due:"", remain:"", remainKind:"none", ehr:null, at:"inprogress", auditor:"E5 Agent", req:"485 Delayed" },
  { name:"Franklin Ames", mrn:"B6789012345902", branch:"Bcode", refSrc:"Community", soc:"08/06/25", trigger:"485", auditDate:"", encounter:"", due:"", remain:"", remainKind:"none", ehr:null, at:"incomplete", auditor:"E5 Agent", req:"485 Delayed" },
];
function f2fBizOf(r) { return r.req==="485 Delayed" ? "delayed" : r.req==="Met" ? "met" : r.req==="Not Met" ? "unmet" : "exception"; }
function f2fKey(r) { return r.mrn+"|"+r.name+"|"+r.auditDate; }

function F2FFilterChip({ label, onRemove }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:10,background:"#f4f6f9",border:"1px solid #d8dee6",borderRadius:6,padding:"6px 10px",font:"400 12px/16px Roboto",color:"#334155",whiteSpace:"nowrap",flexShrink:0}}>
      {label}
      {onRemove && <span onClick={onRemove} style={{cursor:"pointer",color:"#94a3b8",fontWeight:600}}>×</span>}
    </span>
  );
}

function F2FFilterStrap({ onOpenFilters }) {
  const [chips, setChips] = useF([{ id:"req", label:"F2F Requirements: All" }, { id:"status", label:"Status: Open" }]);
  return (
    <div style={{background:"rgba(163,203,255,.28)",padding:"10px 32px",display:"flex",alignItems:"center",gap:14}}>
      <span style={{fontSize:14,color:"#6660A6",flexShrink:0}}>▽</span>
      <div className="chip-scroll" style={{display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap",overflowX:"auto",flex:"1 1 auto",minWidth:0}}>
        {chips.map(c=>(<F2FFilterChip key={c.id} label={c.label} onRemove={()=>setChips(l=>l.filter(x=>x.id!==c.id))} />))}
      </div>
      <button type="button" onClick={onOpenFilters} style={{background:"transparent",border:"none",color:"#6660A6",font:"500 13px/18px Roboto",cursor:"pointer",padding:"5px 4px",flexShrink:0}}>+ Add More Filters</button>
      <input placeholder="Search patient, MRN…" style={{width:220,height:32,borderRadius:6,border:"1px solid #cbd5e1",padding:"0 12px",font:"400 13px/18px Roboto",flexShrink:0}} />
    </div>
  );
}

function SparkleBadge() {
  const star = (size, fill) => (
    <path d="M12 2c.6 3.2 1.2 4.6 2 5.5.9.9 2.3 1.5 5.5 2-3.2.6-4.6 1.2-5.5 2-.9.9-1.5 2.3-2 5.5-.6-3.2-1.2-4.6-2-5.5-.9-.9-2.3-1.5-5.5-2 3.2-.6 4.6-1.2 5.5-2 .9-.9 1.5-2.3 2-5.5z" fill={fill}/>
  );
  return (
    <span style={{position:"absolute",top:-9,right:-9,width:22,height:22}}>
      <svg width="22" height="22" viewBox="0 0 24 24">{star(24,"#F5B92B")}</svg>
      <svg width="11" height="11" viewBox="0 0 24 24" style={{position:"absolute",bottom:-3,left:-4}}>{star(24,"#39A6E0")}</svg>
    </span>
  );
}

function ReqMetPill({ status }) {
  const met = status === "Met";
  return (
    <span style={{position:"relative",display:"inline-flex",justifySelf:"center",background:met?"#EAF9EA":"#FDEDEC",border:`1px solid ${met?"#8fd19e":"#f3b4ae"}`,borderRadius:6,padding:"5px 22px",font:"400 13px/18px Roboto",color:met?"#2E7D32":"#C0392B",textDecoration:"underline"}}>
      {status}
      <SparkleBadge />
    </span>
  );
}

function DaysRemainingPill({ text, kind }) {
  if (kind === "closed") {
    return <span style={{display:"inline-flex",justifySelf:"center",background:"#EFFCEF",color:"#3E9F4A",borderRadius:4,padding:"4px 14px",font:"400 12px/16px Roboto"}}>{text}</span>;
  }
  const bg = kind === "warn" ? "#E9A227" : "#C0392B";
  return <span style={{display:"inline-flex",justifySelf:"center",background:bg,color:"#fff",borderRadius:4,padding:"4px 14px",font:"500 12px/16px Roboto",whiteSpace:"nowrap"}}>{text}</span>;
}

function ThumbsUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M7 22h11a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2.5l1-4.5a1.8 1.8 0 0 0-1.8-2.3c-.5 0-1 .2-1.3.6L9 11H7v11z" fill="#8C97A6"/>
      <rect x="2" y="11" width="4" height="11" rx="1" fill="#8C97A6"/>
    </svg>
  );
}

const F2F_STATUS = [
  { id:"all",       label:"All Patients",         color:"#155F82" },
  { id:"met",       label:"Requirements Met",     color:"#16a34a", caret:true },
  { id:"unmet",     label:"Requirements Not Met", color:"#dc2626", caret:true },
  { id:"exception", label:"Exceptions",           color:"#D7A718" },
  { id:"delayed",   label:"485 Delayed",          color:"#E9572A", divider:true },
];

function F2FDelayedTag() {
  return <span style={{display:"inline-flex",alignItems:"center",border:"1px solid #f5b8a3",borderRadius:5,padding:"5px 12px",font:"500 12px/16px Roboto",color:"#B7401A",background:"#FEF1EC",whiteSpace:"nowrap"}}>485 Delayed</span>;
}
function F2FExceptionTag() {
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,border:"1px solid #f1d58a",borderRadius:5,padding:"5px 12px",font:"500 12px/16px Roboto",color:"#a37a06",background:"#FFF8E6"}}>Exception</span>;
}

const F2FTableRow = React.memo(function F2FTableRow({ r, onView, reviewed, onReviewed }) {
  const cell = (align)=>({ font:"500 12px/16px Roboto", color:"#333333", textAlign:align||"left", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" });
  const R = window.__resources||{};
  const atSrc = r.at==="complete" ? (R.atCompleted||"icons/at-completed.png") : r.at==="inprogress" ? (R.atInProgress||"icons/at-in-progress.png") : (R.atNeedsAttention||"icons/at-needs-attention.png");
  const atLabel = r.at==="complete" ? "Complete" : r.at==="inprogress" ? "In Progress" : "Needs Attention";
  const biz = f2fBizOf(r);
  const delayed = biz==="delayed";
  return (
    <div style={{display:"grid",gridTemplateColumns:F2F_GRID,alignItems:"center",height:66,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:8,boxShadow:"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",gap:8}}>
      <div style={cell()} title={r.name}>{r.name}</div>
      <div style={cell()}>{r.mrn}</div>
      <div style={cell()}>{r.branch}</div>
      <div style={cell()}>{r.refSrc}</div>
      <div style={cell()}>{r.soc}</div>
      <div style={cell()}>{r.trigger}</div>
      <div style={cell()}>{delayed ? "" : r.auditDate}</div>
      <div style={cell("center")}>{delayed ? "" : r.encounter}</div>
      <div style={cell("center")}>{delayed ? "" : r.due}</div>
      <div style={{display:"flex",justifyContent:"center"}}>{delayed ? null : r.remainKind==="none" ? <span style={cell("center")}>—</span> : <DaysRemainingPill text={r.remain} kind={r.remainKind} />}</div>
      <div style={{display:"flex",justifyContent:"center"}}>
        {delayed ? <span style={{...cell("center"),color:"#64748b"}}>-</span> : <svg width="15" height="15" viewBox="0 0 24 24" fill="none">{r.ehr
          ? <path d="M20 6L9 17l-5-5" stroke="#3E9F4A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M18 6L6 18M6 6l12 12" stroke="#E9572A" strokeWidth="2.6" strokeLinecap="round"/>}
        </svg>}
      </div>
      <div style={{display:"flex",justifyContent:"center"}}><img title={atLabel} src={atSrc} alt={atLabel} style={{width:18,height:18,objectFit:"contain"}} /></div>
      <div style={{...cell("center"),whiteSpace:"normal"}}>{r.auditor}</div>
      <div style={{display:"flex",justifyContent:"center"}}>{delayed ? <F2FDelayedTag /> : biz==="exception" ? <F2FExceptionTag /> : <PBComplianceCell met={biz==="met"} source={r.source||"ai"} />}</div>
      <div style={cell("center")}>
        {delayed
          ? <span aria-disabled="true" title="Unavailable until the 485 is received" style={{color:"#b0b0b0",font:"500 12px/16px Roboto",cursor:"not-allowed"}}>View Details</span>
          : <a href="#" onClick={(e)=>{e.preventDefault(); onView&&onView(r);}} style={{color:"#2563eb",font:"500 12px/16px Roboto",textDecoration:"none"}}>View Details</a>}
      </div>
      <div style={cell("center")}>
        <span role="checkbox" aria-checked={!!reviewed} tabIndex={0} onClick={()=>onReviewed&&onReviewed()} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:`1px solid ${reviewed?"#2563eb":"#d8d8d8"}`,borderRadius:3,background:reviewed?"#2563eb":"#fff",cursor:"pointer"}}>
          {reviewed && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}
        </span>
      </div>
    </div>
  );
});

function F2FAuditTable({ rows, onView, reviewed, onReviewed }) {
  return (
    <div style={{padding:"0 24px 24px",overflowX:"auto"}}>
      <div style={{minWidth:1500}}>
        <div style={{display:"grid",gridTemplateColumns:F2F_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",minHeight:48,padding:"4px 12px",gap:8,marginBottom:8}}>
          {F2F_COLS.map(c=>(
            <div key={c.key} style={{font:"500 11px/14px Roboto",color:"#64748b",display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",textAlign:c.align||"left",userSelect:"none",gap:2}}>
              {!["details","reviewed","ehr","at","req"].includes(c.key) && <SortArrows active={false} dir="asc" />}
              <span>{c.label}</span>
              {c.info && <InfoCircle />}
            </div>
          ))}
        </div>
        <ScrollBody>
          {rows.length===0
            ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>No F2F audits match the current filters.</div>
            : rows.map((r,i)=>(<F2FTableRow key={i} r={r} onView={onView} reviewed={!!reviewed[f2fKey(r)]} onReviewed={()=>onReviewed(f2fKey(r))} />))}
          <div style={{padding:"16px 24px",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} of {f2fRows.length} patients shown</div>
        </ScrollBody>
      </div>
    </div>
  );
}

function F2FTitleCluster() {
  return (
    <div>
      <div style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Face To Face Encounter Audit View</div>
      <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Face to Face Audit Details Summary</div>
      <div style={{marginTop:10,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block"}}>Click View Details to view Face to Face audit details for specific patients</div>
    </div>
  );
}

function F2FStatusStrip({ counts, active, onPick, onReset, anyFilter, sourceFilter, onSourceFilter }) {
  const [openMenu, setOpenMenu] = useF(null);
  const rootRef = React.useRef(null);
  React.useEffect(()=>{ if(!openMenu) return; const h=(e)=>{ if(rootRef.current && !rootRef.current.contains(e.target)) setOpenMenu(null); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[openMenu]);
  return (
    <div ref={rootRef} style={{display:"flex",alignItems:"stretch",flexWrap:"wrap",width:"fit-content",maxWidth:"100%",marginLeft:"auto",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",borderTopLeftRadius:8,borderBottomLeftRadius:8,display:"flex",flexDirection:"column",justifyContent:"center",font:"500 13px/18px Roboto",color:"#0f172a"}}>
        <span>F2F Audit</span><span>Status</span>
      </div>
      {F2F_STATUS.map((s,si)=>{
        const on = active===s.id, dim = active && !on;
        const grey = (dim||anyFilter) && s.id==="all";
        return (
          <div key={s.id} style={{padding:"10px 14px",cursor:"pointer",opacity:dim && s.id!=="all"?0.35:1,transition:"opacity .12s",background:on?"#f8fafc":"transparent",position:"relative",borderLeft:s.divider?"1px solid #e2e8f0":"none",borderTopRightRadius:si===F2F_STATUS.length-1?8:0,borderBottomRightRadius:si===F2F_STATUS.length-1?8:0}}>
            <div onClick={()=>onPick(on?null:s.id)}>
              <div style={{height:3,borderRadius:2,background:s.color,opacity:on?1:0.85,marginBottom:8}}></div>
              <div style={{display:"flex",alignItems:"center",gap:5,font:"400 12px/16px Roboto",color:grey?"#b0b0b0":"#333333",whiteSpace:"nowrap"}}>
                <span>{s.label}</span>
                {s.caret && (
                  <button type="button" title="Sub-status breakdown" onClick={(e)=>{ e.stopPropagation(); setOpenMenu(m=>m===s.id?null:s.id); }} style={{width:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center",border:"none",background:"transparent",cursor:"pointer",color:"#2563eb",padding:0}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 8 L19 8 L12 17 Z" fill="currentColor" /></svg>
                  </button>
                )}
              </div>
              <div style={{font:"600 18px/22px Roboto",color:grey?"#b0b0b0":"#0f172a",marginTop:4}}>{counts.byChip[s.id]}</div>
              {(active||anyFilter) && s.id==="all" && (
                <button type="button" onClick={(e)=>{ e.stopPropagation(); onReset(); }} style={{marginTop:4,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}>
                  <span style={{fontSize:11,lineHeight:1}}>↻</span>Reset
                </button>
              )}
            </div>
            {s.caret && openMenu===s.id && (
              <PBSubStatusMenu items={PB_SUBSTATUS_OPTS.map(o=>({ ...o, count:counts.sub[s.id][o.id] }))}
                initial={sourceFilter && sourceFilter.status===s.id ? sourceFilter.sources : null}
                onClose={()=>setOpenMenu(null)}
                onApply={(sources)=>{ onPick(s.id); onSourceFilter(sources.length<2 ? { status:s.id, sources } : null); setOpenMenu(null); }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Detail drawer accordion row ─────────────────────────────────
function F2FAccordion({ title, status, open, onToggle, children }) {
  const statusColor = status==="warn" ? "#D7A718" : status==="fail" ? "#CF1322" : "#3E9F4A";
  const statusBg = status==="warn" ? "#FFF9EC" : status==="fail" ? "#FFF4F4" : "#EFFCEF";
  return (
    <div style={{border:"1px solid #d9d9d9",borderRadius:5,overflow:"hidden",width:"100%"}}>
      <div onClick={onToggle} style={{display:"flex",alignItems:"center",gap:10,padding:"14px 17px",background:open?"#E8F3FF":"#F6F6F6",cursor:"pointer",userSelect:"none"}}>
        <span style={{display:"inline-block",transform:open?"rotate(90deg)":"none",transition:"transform .15s",fontSize:11,color:"rgba(0,0,0,.5)"}}>▸</span>
        <span style={{font:"500 14px/19px Roboto",color:"rgba(0,0,0,.85)"}}>{title}</span>
        <span style={{marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:6,background:statusBg,color:statusColor,borderRadius:4,padding:"3px 10px",font:"500 12px/16px Roboto"}}>
          {status==="pass" ? "Met" : status==="warn" ? "Review" : "Not Found"}
        </span>
      </div>
      {open && <div style={{padding:"20px 17px",background:"#fff"}}>{children}</div>}
    </div>
  );
}

function HomeboundCriterion({ label, met }) {
  return (
    <label style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderBottom:"1px solid #f1f3f5",cursor:"pointer"}}>
      <input type="checkbox" checked={met} readOnly style={{marginTop:3,width:15,height:15,accentColor:"#1677FF"}} />
      <span style={{font:"400 13px/18px Roboto",color:"#3A424A"}}>{label}</span>
    </label>
  );
}

function F2FDetailDrawer({ row, onClose }) {
  const r = row || {};
  const [open, setOpen] = useF({ timely:false, eligible:false, primary:false, homebound:true, skilled:false, docs:false, log:false });
  const toggle = (k)=>setOpen(o=>({...o,[k]:!o[k]}));
  const homeboundFail = r.req !== "Met";
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex"}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(15,23,42,.45)"}} />
      <div style={{position:"relative",marginLeft:"auto",width:"min(1600px, 96vw)",height:"100%",background:"#fff",display:"flex",flexDirection:"column",boxShadow:"-8px 0 30px rgba(0,0,0,.15)"}}>
        <div style={{height:72,background:"#F7F7F9",display:"flex",alignItems:"center",padding:"0 32px",flexShrink:0}}>
          <div style={{font:"500 16px/20px Roboto",color:"#3A424A"}}>{r.name || "Patient"} <span style={{color:"#6A717D",fontWeight:400}}>· MRN {r.mrn}</span></div>
          <button onClick={onClose} style={{marginLeft:"auto",background:"transparent",border:"none",cursor:"pointer",fontSize:20,color:"#6A717D"}}>✕</button>
        </div>
        <div style={{flex:1,overflow:"auto",display:"flex",gap:40,padding:"24px 40px 40px"}} className="ws-scrollbody">
          <div style={{width:624,flexShrink:0,display:"flex",flexDirection:"column",gap:17}}>
            <div style={{font:"400 13px/19px Roboto",color:"#6A717D"}}>
              Ms. {r.name || "Patient"} presents with a diagnosis consistent with the referral for home health services; the clinical summary below reflects the discharge documentation on file for this episode.
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{font:"600 22px/24px Roboto",color:"#333",textTransform:"capitalize"}}>F2F Encounter Audit Summary</span>
              <span style={{background:homeboundFail?"#FDEDEC":"#EAF9EA",color:homeboundFail?"#C0392B":"#2E7D32",borderRadius:4,padding:"6px 14px",font:"500 13px/16px Roboto"}}>F2F Requirements: {r.req || "Not Met"}</span>
            </div>
            <div style={{height:1,background:"#dadada",alignSelf:"stretch",margin:"2px 0"}} />
            <div style={{display:"flex",flexDirection:"column",gap:16,width:"100%"}}>
              <F2FAccordion title="Timely Encounter" status="pass" open={open.timely} onToggle={()=>toggle("timely")}>
                <div style={{font:"400 13px/18px Roboto",color:"#3A424A"}}>Encounter performed on {r.encounter} — within 90 days prior / 30 days after SOC ({r.soc}).</div>
              </F2FAccordion>
              <F2FAccordion title="Eligible Practitioner" status="pass" open={open.eligible} onToggle={()=>toggle("eligible")}>
                <div style={{font:"400 13px/18px Roboto",color:"#3A424A"}}>Encounter documented by a physician, NP, PA, or certifying practitioner permitted to perform the F2F encounter.</div>
              </F2FAccordion>
              <F2FAccordion title="Primary Home Health Reason" status="pass" open={open.primary} onToggle={()=>toggle("primary")}>
                <div style={{font:"400 13px/18px Roboto",color:"#3A424A"}}>Encounter documentation identifies the primary reason for home health services and supports medical necessity.</div>
              </F2FAccordion>

              <F2FAccordion title="Homebound Status" status={homeboundFail ? "fail" : "pass"} open={open.homebound} onToggle={()=>toggle("homebound")}>
                <div style={{display:"flex",alignItems:"center",gap:10,background:homeboundFail?"#FFF4F4":"#EFFCEF",border:`1px solid ${homeboundFail?"#FFCFC9":"#c9ecc9"}`,borderRadius:6,padding:"12px 16px",marginBottom:16}}>
                  <span style={{fontSize:15}}>{homeboundFail ? "⚠" : "✓"}</span>
                  <div>
                    <div style={{font:"500 13px/18px Roboto",color:"#0f172a"}}>Homebound Reason</div>
                    <div style={{font:"400 13px/18px Roboto",color:"#3A424A"}}>{homeboundFail ? "No Reason Found" : "Considerable and taxing effort required to leave home"}</div>
                  </div>
                  <span style={{marginLeft:"auto",color:"#1677FF",font:"500 13px/16px Roboto",cursor:"pointer"}}>Sources (0)</span>
                </div>
                <div style={{font:"500 13px/18px Roboto",color:"#0f172a",marginBottom:6}}>CMS Homebound Criteria</div>
                <HomeboundCriterion met={!homeboundFail} label="Because of illness or injury, the patient needs supportive devices, special transportation, or the assistance of another person to leave the home." />
                <HomeboundCriterion met={!homeboundFail} label="Leaving home is medically contraindicated." />
                <HomeboundCriterion met={!homeboundFail} label="Leaving home requires a considerable and taxing effort by the patient." />
                <HomeboundCriterion met={false} label="Absences from the home are infrequent, of short duration, or for medical care." />
              </F2FAccordion>

              <F2FAccordion title="Skilled Service Need" status="pass" open={open.skilled} onToggle={()=>toggle("skilled")}>
                <div style={{font:"400 13px/18px Roboto",color:"#3A424A"}}>Plan of care documents a skilled nursing or therapy need consistent with the certifying diagnosis.</div>
              </F2FAccordion>
              <F2FAccordion title="Documentation & Signature" status="pass" open={open.docs} onToggle={()=>toggle("docs")}>
                <div style={{font:"400 13px/18px Roboto",color:"#3A424A"}}>Encounter note is signed and dated by the certifying practitioner within the required timeframe.</div>
              </F2FAccordion>
              <F2FAccordion title="Audit Log" status="pass" open={open.log} onToggle={()=>toggle("log")}>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[["Automated audit completed","Today, 9:04 AM"],["Discharge summary linked","Yesterday, 4:41 PM"],["F2F requirement flagged for review","2 days ago"]].map(([t,d])=>(
                    <div key={t} style={{display:"flex",justifyContent:"space-between",font:"400 13px/18px Roboto",color:"#3A424A"}}><span>{t}</span><span style={{color:"#94a3b8"}}>{d}</span></div>
                  ))}
                </div>
              </F2FAccordion>
            </div>
          </div>

          <div style={{flex:1,minWidth:0,background:"#F7F7F9",borderRadius:6,display:"flex",flexDirection:"column"}}>
            <div style={{padding:"14px 20px",font:"500 13px/18px Roboto",color:"#3A424A",borderBottom:"1px solid #e5e7eb"}}>Discharge Summary — {r.name || "Patient"}</div>
            <div style={{flex:1,padding:20,display:"flex",flexDirection:"column",gap:16,overflow:"auto"}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{alignSelf:"center",width:"90%",aspectRatio:"773/1093",background:"repeating-linear-gradient(135deg, #fff 0 14px, #eef1f5 14px 28px)",boxShadow:"0 3px 10px rgba(0,0,0,.08)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{font:"400 12px/16px ui-monospace,monospace",color:"#94a3b8"}}>discharge summary — page {i+1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const F2F_FILTER_FIELDS = [
  { key:"branch",  label:"Branch" },
  { key:"refSrc",  label:"Referral Source" },
  { key:"trigger", label:"Audit Trigger" },
  { key:"auditor", label:"Auditor" },
];

function F2FAuditRequestView({ review, onExitReview }) {
  const [drawerRow, setDrawerRow] = useF(null);
  const [statusFilter, setStatusFilter] = useF(null);
  const [sourceFilter, setSourceFilter] = useF(null);
  const [atFilter, setAtFilter] = useF(null);
  const [searchQ, setSearchQ] = useF("");
  const [fieldFilters, setFieldFilters] = useF([]);
  const [reviewed, setReviewed] = useF({});
  const auditDates = React.useMemo(()=>[...new Set(f2fRows.map(r=>r.auditDate).filter(Boolean))], []);
  const [dateRange, setDateRange] = useF({ start:"06/01/25", end:"08/12/25" });
  const toTime = (d)=>{ const [m,dd,y] = d.split("/").map(Number); return new Date(2000+y, m-1, dd).getTime(); };
  const pad = (n)=>String(n).padStart(2,"0");
  const atMap = { completed:"complete", warning:"incomplete", inprogress:"inprogress" };

  const searched = React.useMemo(()=>{
    let out = dateRange ? f2fRows.filter(r=>{ if (!r.auditDate) return true; const t=toTime(r.auditDate); return t>=toTime(dateRange.start) && t<=toTime(dateRange.end); }) : f2fRows;
    if (fieldFilters.length) out = out.filter(r=>fieldFilters.every(f=>f.values.includes(r[f.field])));
    if (searchQ) { const q=searchQ.toLowerCase(); out = out.filter(r=>[r.name,r.mrn,r.auditor].join(" ").toLowerCase().includes(q)); }
    return out;
  }, [dateRange, fieldFilters, searchQ]);
  const atScoped = atFilter ? searched.filter(r=>r.at===atMap[atFilter]) : searched;
  const statusScoped = statusFilter && statusFilter!=="all" ? searched.filter(r=>f2fBizOf(r)===statusFilter) : searched;
  const src = (r)=>r.source||"ai";
  const counts = {
    byChip: {
      all: pad(atScoped.length),
      met: pad(atScoped.filter(r=>f2fBizOf(r)==="met").length),
      unmet: pad(atScoped.filter(r=>f2fBizOf(r)==="unmet").length),
      exception: pad(atScoped.filter(r=>f2fBizOf(r)==="exception").length),
      delayed: pad(atScoped.filter(r=>f2fBizOf(r)==="delayed").length),
    },
    sub: {
      met: { ai:pad(atScoped.filter(r=>f2fBizOf(r)==="met"&&src(r)==="ai").length), override:pad(atScoped.filter(r=>f2fBizOf(r)==="met"&&src(r)==="override").length) },
      unmet: { ai:pad(atScoped.filter(r=>f2fBizOf(r)==="unmet"&&src(r)==="ai").length), override:pad(atScoped.filter(r=>f2fBizOf(r)==="unmet"&&src(r)==="override").length) },
    },
    at: {
      completed: pad(statusScoped.filter(r=>r.at==="complete").length),
      needsAttn: pad(statusScoped.filter(r=>r.at==="incomplete").length),
      inProgress: pad(statusScoped.filter(r=>r.at==="inprogress").length),
    },
  };
  let rows = statusScoped;
  if (sourceFilter && sourceFilter.status===statusFilter) rows = rows.filter(r=>sourceFilter.sources.includes(src(r)));
  if (atFilter) rows = rows.filter(r=>r.at===atMap[atFilter]);
  if (review) rows = rows.filter(r=>f2fBizOf(r)!=="met" && !reviewed[f2fKey(r)]);

  const chips = [];
  if (statusFilter) { const s=F2F_STATUS.find(x=>x.id===statusFilter); chips.push({ id:"status", label:`F2F Status: ${s?s.label:statusFilter}`, onRemove:()=>{ setStatusFilter(null); setSourceFilter(null); } }); }
  if (atFilter) { const l={ completed:"Completed", warning:"Needs Attention", inprogress:"In Progress" }; chips.push({ id:"at", label:`AT Status: ${l[atFilter]}`, onRemove:()=>setAtFilter(null) }); }
  if (review) [{ id:"rv-unmet", label:"F2F Requirements: Not Met / Exception" },{ id:"rv-nr", label:"Reviewed : Not Reviewed" }].forEach(c=>chips.push({ ...c, onRemove:()=>onExitReview&&onExitReview() }));

  return (
    <div style={{background:"#fff"}}>
      <ERVFilterBar chips={chips} filterFields={F2F_FILTER_FIELDS} filterRows={f2fRows} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters}
        datePicker={{label:"Audit Date", value:dateRange, available:auditDates, onChange:(d)=>setDateRange(d)}}
        onClearFilters={review ? (()=>onExitReview&&onExitReview()) : null} searchValue={searchQ} onSearch={setSearchQ} />
      <div style={{padding:"20px 24px 0",display:"flex",alignItems:"flex-start",gap:32,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 380px",minWidth:0}}><F2FTitleCluster /></div>
        <div style={{flex:"1 1 640px",minWidth:0}}>
          <F2FStatusStrip counts={counts} active={statusFilter} onPick={(v)=>{ setStatusFilter(v); if(!v) setSourceFilter(null); }} anyFilter={!!(statusFilter||atFilter)} onReset={()=>{ setStatusFilter(null); setAtFilter(null); setSourceFilter(null); }} sourceFilter={sourceFilter} onSourceFilter={setSourceFilter} />
        </div>
      </div>
      <div style={{padding:"8px 24px",display:"flex",justifyContent:"flex-end",position:"relative",top:-8}}>
        <PBAutomationStatus counts={counts} atFilter={atFilter} onFilter={setAtFilter} />
      </div>
      <F2FAuditTable rows={rows} onView={setDrawerRow} reviewed={reviewed} onReviewed={(k)=>setReviewed(m=>({ ...m, [k]:!m[k] }))} />
      {drawerRow && <F2FDetailDrawer row={drawerRow} onClose={()=>setDrawerRow(null)} />}
    </div>
  );
}

function F2FAuditSection({ sub, onSub }) {
  const subTabs = [{ label:"F2F Encounter Audit View", icon:"☰" }, { label:"Automation Log", icon:"" }, { label:"Order Management", icon:"" }];
  const [review, setReview] = useF(false);
  const s = sub||0;
  return (
    <div>
      <SectionBand title="Face-To Face Encounter Audit Center" subTabs={subTabs} activeSub={s} onSub={onSub} showReview={true} review={review} onReview={()=>setReview(v=>!v)} />
      {s===0
        ? <F2FAuditRequestView review={review} onExitReview={()=>setReview(false)} />
        : <div style={{padding:60,textAlign:"center",color:"#94a3b8",font:"400 14px/20px Roboto"}}>{subTabs[s].label} — coming soon</div>}
    </div>
  );
}

// ── Pre-Bill Audit grid — columns/data from Figma frame "Group 1410083925" ──
const PB_COLS = [
  { key:"name", label:"Name", grid:"minmax(130px,1.3fr)" },
  { key:"mrn", label:"MRN", grid:"minmax(120px,1.1fr)" },
  { key:"branch", label:"Branch", grid:"minmax(70px,0.7fr)" },
  { key:"soc", label:"SOC", grid:"minmax(80px,0.8fr)" },
  { key:"trigger", label:"Audit Trigger", grid:"minmax(100px,1fr)" },
  { key:"auditDate", label:"Audit Date", grid:"minmax(90px,0.9fr)" },
  { key:"compliance", label:"Pre-Bill Audit Results", grid:"200px", align:"center" },
  { key:"at", label:"AT Status", grid:"72px", align:"center" },
  { key:"details", label:"View Details", grid:"minmax(90px,1fr)", align:"center" },
  { key:"reviewed", label:"Reviewed?", grid:"78px", align:"center" },
];
const PB_GRID = PB_COLS.map(c=>c.grid).join(" ");

const pbRows = [
  { name:"Marvin Mckinney", mrn:"B6100062245601", branch:"Bcode", soc:"05/11/25", trigger:"Admission", auditDate:"05/11/25", auditTime:"09:04 AM", met:false, source:"ai", pct:78, next:1, ehr:true, agent:"E5 Agent", at:"complete" },
  // earlier audits of the same patient — every rule met and verified
  { name:"Marvin Mckinney", mrn:"B6100062245601", branch:"Bcode", soc:"05/11/25", trigger:"Recertification", auditDate:"05/08/25", auditTime:"11:20 AM", auditEndTime:"11:27 AM", met:true, source:"ai", pct:100, next:null, ehr:true, agent:"E5 Agent", at:"complete", allVerified:true },
  { name:"Marvin Mckinney", mrn:"B6100062245601", branch:"Bcode", soc:"05/11/25", trigger:"Resumption of Care", auditDate:"05/06/25", auditTime:"02:15 PM", auditEndTime:"02:22 PM", met:true, source:"ai", pct:100, next:null, ehr:true, agent:"Fiona Gallagher", at:"complete", allVerified:true },
  { name:"Rachel Martin", mrn:"B6789012345685", branch:"Bcode", soc:"05/11/25", trigger:"Admission", auditDate:"05/11/25", met:true, source:"ai", pct:100, next:null, ehr:false, agent:"Bob Smith", at:"incomplete" },
  { name:"John Doe", mrn:"B6100054445634", branch:"Bcode", soc:"05/11/25", trigger:"Admission", auditDate:"05/11/25", met:true, source:"ai", pct:100, next:null, ehr:true, agent:"E5 Agent" },
  { name:"John Peel", mrn:"B6789012345685", branch:"Bcode", soc:"05/11/25", trigger:"Discharge", auditDate:"05/11/25", met:true, source:"override", pct:100, next:null, ehr:true, agent:"Fiona Gallagher" },
  { name:"Kena White", mrn:"B6789012345678", branch:"Bcode", soc:"05/11/25", trigger:"Admission", auditDate:"05/11/25", met:true, source:"ai", pct:100, next:null, ehr:true, agent:"Fiona Gallagher" },
  { name:"Joseph Dyan", mrn:"B6100054445634", branch:"Bcode", soc:"05/05/25", trigger:"Admission", auditDate:"05/05/25", met:false, source:"ai", pct:25, next:2, ehr:true, agent:"E5 Agent", at:"inprogress" },
  { name:"Sarah Lee", mrn:"B6789012345720", branch:"Bcode", soc:"05/11/25", trigger:"Admission", auditDate:"05/11/25", met:true, source:"ai", pct:100, next:null, ehr:true, agent:"Diana Ross" },
  { name:"Harry Jacobs", mrn:"B6789012345685", branch:"Bcode", soc:"05/05/25", trigger:"Discharge", auditDate:"05/05/25", met:true, source:"ai", pct:100, next:null, ehr:true, agent:"E5 Agent" },
  { name:"William Peel", mrn:"B6789012345685", branch:"Bcode", soc:"05/05/25", trigger:"Discharge", auditDate:"05/05/25", met:false, source:"ai", pct:65, next:1, ehr:false, agent:"Ethan Hunt" },
  { name:"Nora Whitfield", mrn:"B6100062245712", branch:"Bcode", soc:"05/12/25", trigger:"Admission", auditDate:"05/12/25", met:false, source:"ai", pct:82, next:1, ehr:true, agent:"E5 Agent", at:"inprogress" },
  { name:"Dennis Grant", mrn:"B6789012345811", branch:"Bcode", soc:"05/12/25", trigger:"Admission", auditDate:"05/12/25", met:true, source:"ai", pct:100, next:null, ehr:true, agent:"Bob Smith" },
  { name:"Alma Reyes", mrn:"B6100054445901", branch:"Bcode", soc:"05/12/25", trigger:"Discharge", auditDate:"05/12/25", met:false, source:"override", pct:55, next:2, ehr:true, agent:"Fiona Gallagher" },
  { name:"Curtis Bowen", mrn:"B6789012345623", branch:"Bcode", soc:"05/10/25", trigger:"Admission", auditDate:"05/10/25", met:true, source:"ai", pct:100, next:null, ehr:false, agent:"Diana Ross", at:"inprogress" },
  { name:"Priya Nandakumar", mrn:"B6100062245688", branch:"Bcode", soc:"05/10/25", trigger:"Admission", auditDate:"05/10/25", met:false, source:"ai", pct:71, next:1, ehr:true, agent:"E5 Agent" },
  { name:"Walter Boyd", mrn:"B6789012345555", branch:"Bcode", soc:"05/09/25", trigger:"Discharge", auditDate:"05/09/25", met:true, source:"override", pct:100, next:null, ehr:true, agent:"Ethan Hunt" },
  { name:"Gloria Sandoval", mrn:"B6100054445777", branch:"Bcode", soc:"05/09/25", trigger:"Admission", auditDate:"05/09/25", met:false, source:"ai", pct:38, next:3, ehr:false, agent:"E5 Agent" },
  { name:"Theodore Park", mrn:"B6789012345490", branch:"Bcode", soc:"05/09/25", trigger:"Admission", auditDate:"05/09/25", met:true, source:"ai", pct:100, next:null, ehr:true, agent:"Bob Smith" },
  { name:"Ida Fletcher", mrn:"B6100062245455", branch:"Bcode", soc:"05/08/25", trigger:"Discharge", auditDate:"05/08/25", met:false, source:"ai", pct:64, next:2, ehr:true, agent:"Diana Ross" },
  { name:"Samuel Ortiz", mrn:"B6789012345344", branch:"Bcode", soc:"05/08/25", trigger:"Admission", auditDate:"05/08/25", met:true, source:"ai", pct:100, next:null, ehr:true, agent:"E5 Agent" },
  { name:"Bernice Holloway", mrn:"B6100054445288", branch:"Bcode", soc:"05/08/25", trigger:"Admission", auditDate:"05/08/25", met:false, source:"ai", pct:47, next:2, ehr:false, agent:"Fiona Gallagher" },
  { name:"Owen Castellano", mrn:"B6789012345277", branch:"Bcode", soc:"05/07/25", trigger:"Discharge", auditDate:"05/07/25", met:true, source:"ai", pct:100, next:null, ehr:true, agent:"Ethan Hunt" },
  { name:"Marcia Odell", mrn:"B6100062245166", branch:"Bcode", soc:"05/07/25", trigger:"Admission", auditDate:"05/07/25", met:false, source:"ai", pct:88, next:1, ehr:true, agent:"E5 Agent" },
  { name:"Leonard Frye", mrn:"B6789012345155", branch:"Bcode", soc:"05/07/25", trigger:"Admission", auditDate:"05/07/25", met:true, source:"ai", pct:100, next:null, ehr:true, agent:"Diana Ross" },
  { name:"Estelle Rankin", mrn:"B6100054445044", branch:"Bcode", soc:"05/06/25", trigger:"Discharge", auditDate:"05/06/25", met:false, source:"override", pct:59, next:2, ehr:true, agent:"Bob Smith" },
];

const IconCheckCircle = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const IconWarnTriangle = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 4l9 15H3l9-15z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><rect x="11.15" y="10" width="1.7" height="4.5" rx=".8" fill={color}/><circle cx="12" cy="17" r="1" fill={color}/></svg>
);
const IconPersonEdit = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="10" cy="7" r="4" fill={color}/><path d="M2 21c0-4.4 3.6-7 8-7 1 0 2 .15 2.9.43" stroke={color} strokeWidth="0" fill={color}/><path d="M17.5 13.5l3 3L12 25l-3.6.6.6-3.6 8.5-8.5z" fill={color}/></svg>
);
const IconSparkleSmall = ({ color }) => (
  <svg width="12" height="12" viewBox="0 0 24 24"><path d="M12 2c.6 3.2 1.2 4.6 2 5.5.9.9 2.3 1.5 5.5 2-3.2.6-4.6 1.2-5.5 2-.9.9-1.5 2.3-2 5.5-.6-3.2-1.2-4.6-2-5.5-.9-.9-2.3-1.5-5.5-2 3.2-.6 4.6-1.2 5.5-2 .9-.9 1.5-2.3 2-5.5z" fill={color}/></svg>
);
function PBNextStepHint({ n, row }) {
  const [open, setOpen] = useF(false);
  // the steps come from the same unmet rules the drawer explains
  const unmet = pbFlattenIndicators(PB_AUDIT_GROUPS).filter(r=>r.matches==="Unmet").slice(0, n || 1);
  const steps = unmet.map(r=>{
    const ev = pbEvidenceFor(r);
    return { rule:r.indicator, step:(ev.summary||[])[(ev.summary||[]).length-1] };
  });
  const ref = React.useRef(null);
  const [pos, setPos] = useF({ top:0, left:0 });
  const show = ()=>{
    const el = ref.current;
    if (el) { const b = el.getBoundingClientRect(); setPos({ top:b.bottom + 9, left:b.left + b.width/2 }); }
    setOpen(true);
  };
  return (
    <span ref={ref} style={{position:"relative",display:"inline-flex"}}
      onMouseEnter={show} onMouseLeave={()=>setOpen(false)}>
      <IconUnresolvedBadge n={n} />
      {open && (
        <span style={{position:"fixed",top:pos.top,left:pos.left,transform:"translateX(-50%)",width:300,background:"rgb(28,45,66)",color:"#fff",borderRadius:8,padding:"11px 13px",boxShadow:"0 14px 30px rgba(15,23,42,.3)",zIndex:2000,textAlign:"left",font:"400 11.5px/17px Roboto",whiteSpace:"normal",pointerEvents:"none"}}>
          <span style={{position:"absolute",top:-6,left:"50%",marginLeft:-6,width:12,height:12,background:"rgb(28,45,66)",transform:"rotate(45deg)",borderRadius:2}} />
          <span style={{display:"block",font:"600 11.5px/16px Roboto",marginBottom:6}}>{steps.length>1?steps.length+" unresolved findings":"Unresolved finding"}</span>
          {steps.map((s2,i)=>(
            <span key={i} style={{display:"block",marginBottom:i<steps.length-1?8:0}}>
              <span style={{display:"block"}}>{s2.rule}</span>
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
const IconUnresolvedBadge = ({ n }) => (
  <span style={{display:"inline-flex",alignItems:"center",gap:5,border:"1px solid #f6c9c4",borderRadius:5,padding:"3px 9px",font:"500 12px/16px Roboto",color:"#D6392C",background:"#FFEDEC"}}>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 4l9 15H3l9-15z" stroke="#F04E23" strokeWidth="1.7" strokeLinejoin="round"/><rect x="11.2" y="9.5" width="1.6" height="4.6" rx=".8" fill="#F04E23"/><circle cx="12" cy="16.4" r=".95" fill="#F04E23"/></svg>
    {String(n).padStart(2,"0")}
  </span>
);

function PBComplianceCell({ met, source }) {
  const R = (window.__resources||{});
  const src = !met ? (R.tagNotMet||"assets/tag-not-met.svg") : source==="override" ? (R.tagMetOverride||"assets/tag-met-override.svg") : (R.tagMet||"assets/tag-met.svg");
  return (
    <img src={src} alt={met?"Met":"Not Met"} decoding="async" loading="eager" style={{height:58,width:113,display:"block",objectFit:"contain"}} />
  );
}

function PBHeadCell({ c }) {
  return (
    <div style={{font:"500 11px/14px Roboto",color:"#64748b",textAlign:c.align||"left",display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",userSelect:"none",overflow:"hidden",whiteSpace:"nowrap"}}>
      <SortArrows active={false} dir="asc" />
      {c.label}
      {c.info && <InfoCircle />}
    </div>
  );
}

// Follow-up flags seeded per patient so the grid badge and the drawer agree.
function pbRowKey(r) { return String(r.mrn) + "|" + String(r.name) + "|" + String(r.auditDate||"") + "|" + String(r.trigger||""); }
// every audit run for the same patient, newest first — feeds the drawer's Audit switcher
function pbAuditsFor(r) {
  const t = (x)=>{ const [m,d,y] = String(x.auditDate||"").split("/").map(Number); const tm = String(x.auditTime||"09:04 AM"); const [hm,ap] = tm.split(" "); let [h,mi] = hm.split(":").map(Number); if (ap==="PM" && h<12) h+=12; if (ap==="AM" && h===12) h=0; return new Date(2000+(y||0), (m||1)-1, d||1, h||0, mi||0).getTime(); };
  return pbRows.filter(x=>x.mrn===r.mrn && x.name===r.name).sort((a,b)=>t(b)-t(a));
}
function pbAuditLabel(x) { return (x.auditDate||"07/18/25")+" · "+(x.auditTime||"09:04 AM")+" — "+(x.trigger||"Pre-Bill"); }
function pbDefaultFlagCount(r) {
  if (r.met) return 0;
  const n = ((parseInt(String(r.mrn).slice(-1),10)||1) % 3) + 1;
  const unmet = pbFlattenIndicators(pbGroupsFor(r)).filter(x=>x.matches==="Unmet").length;
  return Math.min(n, unmet);
}
const PBTableRow = React.memo(function PBTableRow({ r, onView, reviewed, onReviewed, flagCount }) {
  const cellBase = (align)=>({ font:"500 12px/16px Roboto", color:"#333333", textAlign:align||"left", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" });
  return (
    <div style={{display:"grid",gridTemplateColumns:PB_GRID,alignItems:"center",height:66,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:8,boxShadow:"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",gap:8}}>
      <div style={cellBase()}>{r.name}</div>
      <div style={cellBase()}>{r.mrn}</div>
      <div style={cellBase()}>{r.branch}</div>
      <div style={cellBase()}>{r.soc}</div>
      <div style={cellBase()}>{r.trigger}</div>
      <div style={cellBase()}>{r.auditDate}</div>
      <div style={{...cellBase("center"),display:"flex",justifyContent:"center"}}><PBComplianceCell met={r.met} source={r.source} /></div>
      <div style={{...cellBase("center"),display:"flex",justifyContent:"center"}}>
        {(()=>{ const v = pbAtOf(r);
          const src = v==="complete" ? ((window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png")
            : v==="inprogress" ? ((window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png")
            : ((window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png");
          const label = v==="complete" ? "Complete" : v==="inprogress" ? "In Progress" : "Incomplete";
          return <img title={label} src={src} alt={label} style={{width:18,height:18,objectFit:"contain"}} />;
        })()}
      </div>
      <div style={cellBase("center")} onClick={(e)=>e.stopPropagation()}>
        <a href="#" onClick={(e)=>{e.preventDefault(); onView&&onView(r);}} style={{color:"#2563eb",font:"500 12px/16px Roboto",textDecoration:"none"}}>View Details</a>
      </div>
      <div style={cellBase("center")}>
        <span role="checkbox" aria-checked={!!reviewed} tabIndex={0} onClick={()=>onReviewed&&onReviewed()} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:`1px solid ${reviewed?"#2563eb":"#d8d8d8"}`,borderRadius:3,background:reviewed?"#2563eb":"#fff",cursor:"pointer"}}>
          {reviewed && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}
        </span>
      </div>
    </div>
  );
})

function PreBillAuditGrid({ onView, rows, reviewed, onReviewed, autoReviewed, flagCounts }) {
  const list = rows || pbRows;
  return (
    <div style={{padding:"0 24px 24px"}}>
      <div style={{display:"grid",gridTemplateColumns:PB_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",gap:8,marginBottom:8}}>
        {PB_COLS.map(c=>(<PBHeadCell key={c.key} c={c} />))}
      </div>
      <ScrollBody>
        {list.length===0
          ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>No pre-bill audits match the current filters.</div>
          : list.map((r,i)=>(<PBTableRow key={i} r={r} onView={onView} flagCount={flagCounts ? flagCounts[pbRowKey(r)] : undefined} reviewed={(reviewed && !!reviewed[pbRowKey(r)]) || (autoReviewed && !!autoReviewed[pbRowKey(r)])} onReviewed={()=>onReviewed && onReviewed(pbRowKey(r))} />))}
        <div style={{padding:"16px 24px",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {list.length} of 120 patients shown</div>
      </ScrollBody>
    </div>
  );
}

// ── Pre-Bill status summary chips (mirrors Eligibility strip) ────────
const PB_STATUS = [
  { id:"all",       label:"All Records",              color:"#64748b", weight:1.0 },
  { id:"met",       label:"Requirements Met",         color:"#16a34a", weight:1.2, caret:true },
  { id:"unmet",     label:"Requirements Unmet",       color:"#dc2626", weight:1.3, caret:true },
  { id:"unaudited", label:"Unaudited",   color:"#d97706", weight:1.3 },
];
const PB_SUBSTATUS_OPTS = [ {id:"ai", label:"AI Processed"}, {id:"override", label:"Manually Overridden"} ];
const pbPad2 = (n)=>String(n).padStart(2,"0");
// Automation status is independent of the business result — a record can be
// AT-complete and still have unmet audit requirements.
function pbAtOf(r) { return r.at || (r.met ? "complete" : "incomplete"); }
// Business status buckets are mutually exclusive and sum to All Records:
// a record whose documentation never synced could not be audited at all.
function pbBizOf(r) { return !r.ehr ? "unaudited" : (r.met ? "met" : "unmet"); }
function pbFilterByStatus(rows, id) {
  if (!id || id==="all") return rows;
  if (id==="met" || id==="unmet" || id==="unaudited") return rows.filter(r=>pbBizOf(r)===id);
  if (id==="ai") return rows.filter(r=>r.source==="ai");
  if (id==="override") return rows.filter(r=>r.source==="override");
  return rows;
}
function pbCounts(allRows, activeStatus) {
  const sub = pbFilterByStatus(allRows, activeStatus);
  return {
    byChip: {
      all: pbPad2(allRows.length),
      met: pbPad2(sub.filter(r=>pbBizOf(r)==="met").length),
      unmet: pbPad2(sub.filter(r=>pbBizOf(r)==="unmet").length),
      unaudited: pbPad2(sub.filter(r=>pbBizOf(r)==="unaudited").length),
    },
    subByStatus: {
      met: { ai: pbPad2(allRows.filter(r=>r.met && r.source==="ai").length), override: pbPad2(allRows.filter(r=>r.met && r.source==="override").length) },
      unmet: { ai: pbPad2(allRows.filter(r=>!r.met && r.source==="ai").length), override: pbPad2(allRows.filter(r=>!r.met && r.source==="override").length) },
    },
    at: {
      completed: pbPad2(sub.filter(r=>pbAtOf(r)==="complete").length),
      needsAttn: pbPad2(sub.filter(r=>pbAtOf(r)==="incomplete").length),
      inProgress: pbPad2(sub.filter(r=>pbAtOf(r)==="inprogress").length),
    },
  };
}

function PBTitleCluster() {
  return (
    <div>
      <div style={{display:"flex",alignItems:"baseline",gap:6,flexWrap:"wrap"}}>
        <span style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Pre-Bill Audit Request View —</span>
        <span style={{font:"500 15px/20px Roboto",color:"#2563eb"}}>All Patients</span>
      </div>
      <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Status Summary of Pre-Bill Audit Results</div>
      <div style={{marginTop:10,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block"}}>Click View Details To Open The Pre-Bill Audit Summary</div>
    </div>
  );
}

function PBSubStatusMenu({ items, onClose, onApply, initial }) {
  const [checked, setChecked] = useF(()=>{ const m={}; items.forEach(i=>m[i.id]= initial ? initial.includes(i.id) : true); return m; });
  const allOn = items.every(i=>checked[i.id]);
  const toggle = (id)=>setChecked(c=>({...c,[id]:!c[id]}));
  const toggleAll = ()=>{ const v=!allOn; const m={}; items.forEach(i=>m[i.id]=v); setChecked(m); };
  const box = (on)=>(
    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,borderRadius:4,border:`1px solid ${on?"#2563eb":"#cbd5e1"}`,background:on?"#2563eb":"#fff",flexShrink:0}}>
      {on && <span style={{color:"#fff",fontSize:11,fontWeight:700,lineHeight:1}}>✓</span>}
    </span>
  );
  return (
    <div onClick={(e)=>e.stopPropagation()} style={{position:"absolute",top:"100%",left:0,marginTop:8,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,boxShadow:"0 16px 40px rgba(15,23,42,0.18)",minWidth:230,zIndex:60}}>
      <label onClick={toggleAll} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderBottom:"1px solid #f1f5f9",cursor:"pointer",font:"500 13px/16px Roboto",color:"#2563eb"}}>
        {box(allOn)} Select All/Unselect All
      </label>
      {items.map(it=>(
        <label key={it.id} onClick={()=>toggle(it.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 16px",cursor:"pointer",font:"400 13px/16px Roboto",color:"#334155"}}>
          <span style={{display:"inline-flex",alignItems:"center",gap:10}}>{box(!!checked[it.id])} {it.label}</span>
          <span style={{color:"#94a3b8",fontWeight:600}}>{it.count}</span>
        </label>
      ))}
      <div style={{display:"flex",justifyContent:"flex-end",padding:"10px 16px 12px"}}>
        <button type="button" onClick={()=>onApply(Object.keys(checked).filter(k=>checked[k]))} style={{border:"none",borderRadius:6,padding:"6px 14px",font:"500 12px/16px Roboto",cursor:"pointer",background:"#2563eb",color:"#fff"}}>Show Records</button>
      </div>
    </div>
  );
}
function PBStatusStrip({ counts, activeStatus, onPick, anyFilter, onReset, sourceFilter, onSourceFilter }) {
  const byChip = counts.byChip;
  const [openMenu, setOpenMenu] = useF(null);
  const rootRef = React.useRef(null);
  React.useEffect(()=>{ if(!openMenu) return; const h=(e)=>{ if(rootRef.current && !rootRef.current.contains(e.target)) setOpenMenu(null); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[openMenu]);
  return (
    <div ref={rootRef} style={{display:"flex",alignItems:"stretch",flexWrap:"wrap",width:"fit-content",maxWidth:"100%",marginLeft:"auto",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",borderTopLeftRadius:8,borderBottomLeftRadius:8,display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",font:"500 13px/18px Roboto",color:"#0f172a",flexShrink:0}}>
        <span>Pre-Bill Audit</span>
        <span>Compliance</span>
      </div>
      {PB_STATUS.map((s,si)=>{
        const active = activeStatus === s.id;
        const dim = activeStatus && !active;
        const isLast = si === PB_STATUS.length-1;
        return (
          <div key={s.id} style={{flex:"0 0 auto",padding:"10px 14px",borderLeft:s.divider?"1px solid #e2e8f0":"none",cursor:"pointer",opacity:dim && s.id!=="all"?0.35:1,transition:"opacity .12s, background .12s",background:active?"#f8fafc":"transparent",position:"relative",borderTopRightRadius:isLast?8:0,borderBottomRightRadius:isLast?8:0}}>
            <div onClick={()=>onPick(active?null:s.id)}>
              <div style={{height:3,borderRadius:2,background:s.color,opacity:active?1:0.85,marginBottom:8}}></div>
              <div style={{display:"flex",alignItems:"center",gap:5,font:"400 12px/16px Roboto",color:((dim||anyFilter)&&s.id==="all")?"#b0b0b0":"#333333",whiteSpace:"nowrap"}}>
                <span style={{whiteSpace:"nowrap"}}>{s.label}</span>
                {s.caret && (
                  <button type="button" title="Sub-status breakdown" onClick={(e)=>{ e.stopPropagation(); setOpenMenu(m=>m===s.id?null:s.id); }} style={{width:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center",border:"none",background:"transparent",cursor:"pointer",color:"#2563eb",padding:0,flexShrink:0}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 8 L19 8 L12 17 Z" fill="currentColor" /></svg>
                  </button>
                )}
              </div>
              <div style={{font:"600 18px/22px Roboto",color:((dim||anyFilter)&&s.id==="all")?"#b0b0b0":"#0f172a",marginTop:4}}>{byChip[s.id]}</div>
              {(activeStatus || anyFilter) && s.id==="all" && (
                <button type="button" onClick={(e)=>{ e.stopPropagation(); onReset ? onReset() : onPick(null); }}
                  style={{marginTop:4,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}>
                  <span style={{fontSize:11,lineHeight:1}}>↻</span>
                  Reset
                </button>
              )}
            </div>
            {s.caret && openMenu===s.id && (
              <PBSubStatusMenu
                items={PB_SUBSTATUS_OPTS.map(o=>({ ...o, count:counts.subByStatus[s.id][o.id] }))}
                initial={sourceFilter && sourceFilter.status===s.id ? sourceFilter.sources : null}
                onClose={()=>setOpenMenu(null)}
                onApply={(sources)=>{ onPick(s.id); onSourceFilter(sources.length<2 ? { status:s.id, sources } : null); setOpenMenu(null); }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PBAutomationStatus({ counts, atFilter, onFilter }) {
  const at = counts.at;
  const items = [
    { id:"completed",  label:"Complete",       n:at.completed,  icon:(window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png" },
    { id:"warning",    label:"Incomplete",     n:at.needsAttn,  icon:(window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png" },
    { id:"inprogress", label:"In Progress",     n:at.inProgress, icon:(window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png" },
  ];
  return (
    <div style={{display:"flex",alignItems:"center",font:"400 13px/16px Roboto",color:"#333333"}}>
      <span style={{color:atFilter?"#b0b0b0":"#94a3b8",marginRight:12}}>Automation (AT) Status :</span>
      {items.map((s,i)=>{
        const active = atFilter === s.id;
        const dim = atFilter && !active;
        return (
          <React.Fragment key={s.id}>
            {i>0 && <span style={{width:1,height:18,background:"#e2e8f0",margin:"0 12px"}}></span>}
            <button type="button" onClick={()=>onFilter(active?null:s.id)} title={`Filter: ${s.label}`}
              style={{background:"transparent",border:"none",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,padding:"2px 6px",borderRadius:4,opacity:dim?0.4:1,transition:"opacity .12s"}}>
              <img src={s.icon} alt="" style={{width:18,height:18,objectFit:"contain"}} />
              <span style={{color:"#0f172a",fontSize:14}}>{s.label}</span>
              <span style={{fontWeight:600,color:"#0f172a",fontSize:15}}>{s.n}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

const PB_FILTER_FIELDS = [
  { key:"branch",  label:"Branch" },
  { key:"trigger", label:"Audit Trigger" },
  { key:"agent",   label:"Auditor" },
];

function PreBillRequestView({ review, onExitReview, onOpenLog, openRow, onOpenRowConsumed }) {
  const [drawerRow, setDrawerRow] = useF(null);
  React.useEffect(()=>{ if (openRow) { setDrawerRow(openRow); onOpenRowConsumed && onOpenRowConsumed(); } }, [openRow]);
  const [statusFilter, setStatusFilter] = useF(null);
  const [atFilter, setAtFilter] = useF(null);
  const [searchQ, setSearchQ] = useF("");
  const [fieldFilters, setFieldFilters] = useF([]);
  // audit date defaults to the last 7 days of audit activity in the data
  const auditDates = React.useMemo(()=>[...new Set(pbRows.map(r=>r.auditDate))], []);
  const toTime = (d)=>{ const [m,dd,y] = d.split("/").map(Number); return new Date(2000+y, m-1, dd).getTime(); };
  const defaultRange = React.useMemo(()=>{
    const latest = auditDates.reduce((best,d)=>toTime(d)>toTime(best)?d:best, auditDates[0]);
    const start = new Date(toTime(latest) - 6*864e5);
    const p = (n)=>String(n).padStart(2,"0");
    return { start: `${p(start.getMonth()+1)}/${p(start.getDate())}/${String(start.getFullYear()).slice(2)}`, end: latest };
  }, [auditDates]);
  const [dateRange, setDateRange] = useF(defaultRange);
  const [reviewedSet, setReviewedSet] = useF({});
  const [autoReviewed, setAutoReviewed] = useF(()=>{ const m={}; pbRows.forEach(r=>{ if (r.allVerified) m[pbRowKey(r)] = true; }); return m; });
  const [flagCounts, setFlagCounts] = useF({});
  const [metOverride, setMetOverride] = useF({});
  const liveRows = React.useMemo(()=>pbRows.map(r=>{ const k=pbRowKey(r); return (k in metOverride && metOverride[k]!==r.met) ? { ...r, met:metOverride[k], source:"override" } : r; }), [metOverride]);
  const toggleReviewed = (k)=>{ setReviewedSet(s=>({...s,[k]:!s[k]})); setAutoReviewed(m=>{ const n={...m}; delete n[k]; return n; }); };

  const searched = React.useMemo(()=>{
    const dated = dateRange ? liveRows.filter(r=>{ const t=toTime(r.auditDate); return t>=toTime(dateRange.start) && t<=toTime(dateRange.end); }) : liveRows;
    const scoped = fieldFilters.length ? dated.filter(r => fieldFilters.every(f => f.values.includes(r[f.field]))) : dated;
    if (!searchQ) return scoped;
    const q = searchQ.toLowerCase();
    return scoped.filter(r=>[r.name,r.mrn,r.agent].join(" ").toLowerCase().includes(q));
  }, [fieldFilters, searchQ, dateRange, liveRows]);
  const atScope = (list)=>{
    if (atFilter === "completed") return list.filter(r=>pbAtOf(r)==="complete");
    if (atFilter === "warning") return list.filter(r=>pbAtOf(r)==="incomplete");
    if (atFilter === "inprogress") return list.filter(r=>pbAtOf(r)==="inprogress");
    return list;
  };
  const counts = React.useMemo(()=>pbCounts(atScope(searched), statusFilter), [searched, statusFilter, atFilter]);
  const [sourceFilter, setSourceFilter] = useF(null);
  const rows = React.useMemo(()=>{
    let out = pbFilterByStatus(searched, statusFilter);
    if (sourceFilter && sourceFilter.status===statusFilter) out = out.filter(r=>sourceFilter.sources.includes(r.source));
    if (atFilter === "completed") out = out.filter(r=>pbAtOf(r)==="complete");
    if (atFilter === "warning") out = out.filter(r=>pbAtOf(r)==="incomplete");
    if (atFilter === "inprogress") out = out.filter(r=>pbAtOf(r)==="inprogress");
    if (review) out = out.filter((r,i)=>(!r.met || r.pct<100) && !reviewedSet[pbRowKey(r)]);
    return out;
  }, [searched, statusFilter, atFilter, review, reviewedSet]);

  const chips = [];
  if (statusFilter) {
    const s = PB_STATUS.find(x=>x.id===statusFilter);
    chips.push({ id:"status", label:`Audit Result: ${s?s.label:statusFilter}`, onRemove:()=>setStatusFilter(null) });
  }
  if (atFilter) {
    const labels = { completed:"Complete", warning:"Incomplete", inprogress:"In Progress" };
    chips.push({ id:"at", label:`AT Status: ${labels[atFilter]}`, onRemove:()=>setAtFilter(null) });
  }
  if (review) {
    [{ id:"rv-unmet", label:"Audit Result: Requirements Unmet" },{ id:"rv-nr", label:"Reviewed : Not Reviewed" }]
      .forEach(c=>chips.push({ ...c, onRemove:()=>onExitReview&&onExitReview() }));
  }

  return (
    <div style={{background:"#fff"}}>
      <ERVFilterBar chips={chips} filterFields={PB_FILTER_FIELDS} filterRows={pbRows} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters}
        datePicker={{label:"Audit Date", value:dateRange, available:auditDates, onChange:(d)=>setDateRange(d)}}
        onClearFilters={review ? (()=>onExitReview&&onExitReview()) : null} searchValue={searchQ} onSearch={setSearchQ} />
      <div style={{padding:"20px 24px 0",display:"flex",alignItems:"flex-start",gap:32,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 380px",minWidth:0}}><PBTitleCluster /></div>
        <div style={{flex:"1 1 640px",minWidth:0}}>
          <PBStatusStrip counts={counts} activeStatus={statusFilter} onPick={(v)=>{ setStatusFilter(v); if(!v) setSourceFilter(null); }} anyFilter={!!(statusFilter||atFilter)} onReset={()=>{ setStatusFilter(null); setAtFilter(null); setSourceFilter(null); }} sourceFilter={sourceFilter} onSourceFilter={setSourceFilter} />
        </div>
      </div>
      <div style={{padding:"8px 24px",display:"flex",justifyContent:"flex-end",position:"relative",top:-8}}>
        <PBAutomationStatus counts={counts} atFilter={atFilter} onFilter={(v)=>setAtFilter(v)} />
      </div>
      <PreBillAuditGrid rows={rows} onView={setDrawerRow} reviewed={reviewedSet} autoReviewed={autoReviewed} flagCounts={flagCounts} onReviewed={toggleReviewed} />
      {drawerRow && <PBDetailDrawer key={pbRowKey(drawerRow)} row={drawerRow} instant={!!drawerRow._switched} onSwitchAudit={(nx)=>setDrawerRow({ ...nx, _switched:true })} preVerified={!!(reviewedSet[pbRowKey(drawerRow)] || autoReviewed[pbRowKey(drawerRow)])} onClose={()=>setDrawerRow(null)} onOpenLog={onOpenLog} onResultChange={(key,met)=>setMetOverride(m=>({ ...m, [key]:met }))} onAllVerified={(key)=>setAutoReviewed(m=>({ ...m, [key]:true }))} onFlagsChange={(key,count)=>setFlagCounts(m=>({ ...m, [key]:count }))} />}
    </div>
  );
}

// ── Pre-Bill detail drawer — matches Figma "Slideout" frame ──────────
function pbIcon(p){ const R=(typeof window!=="undefined"&&window.__resources)||{}; const m={"icons/pb-met-ai.svg":["iconMetAi","assets/icon-met-ai.svg"],"icons/pb-met-user.svg":["iconMetUser","assets/icon-met-user.svg"],"icons/pb-unmet-ai.svg":["iconUnmetAi","assets/icon-unmet-ai.svg"],"icons/pb-edit.svg":["iconEdit","assets/icon-edit.svg"],"icons/pb-tag-met.svg":["tagMet","assets/tag-met.svg"],"icons/pb-tag-not-met.svg":["tagNotMet","assets/tag-not-met.svg"],"icons/pb-tag-met-override.svg":["tagMetOverride","assets/tag-met-override.svg"]}[p]; return m ? (R[m[0]] || m[1]) : p; }

const PB_DOCS = {
  elig: { key:"elig", label:"Medicare Eligibility Verification" },
  ehr:  { key:"ehr",  label:"EHR — Patient Record" },
  visit:  { key:"visit",  label:"RN Admission Visit Note" },
  roster: { key:"roster", label:"Care Team & Provider Roster" },
  cti:    { key:"cti",    label:"Certification of Terminal Illness" },
};

// Field-level content of the source documents named in the workbook's Source
// column. Every value a rule is evaluated against lives here, so the
// comparison strip, the parsed page and the document highlight always agree.
// valueUnmet is what this sample chart actually reads for the rules that fail.
const PB_DOC_FIELDS = {
  elig: {
    title:              { label:"Document",                            value:"Medicare Eligibility Verification — HETS response" },
    verificationStatus: { label:"Verification Status",                 value:"Completed" },
    verificationDate:   { label:"Date/Time of Verification",           value:"10/15/2023 03:04 PM", valueUnmet:"10/17/2023 02:15 AM" },
    beneficiaryName:    { label:"Beneficiary Name",                    value:"Jane Doe" },
    dob:                { label:"Date of Birth",                       value:"03/07/1941" },
    gender:             { label:"Gender",                              value:"F" },
    mbi:                { label:"Medicare Beneficiary Identifier",     value:"1EG4TE5MK72" },
    bpNumber:           { label:"Benefit Period Number",               value:"1" },
    bpDates:            { label:"Benefit Period Start - End",          value:"01/01/2023 – 03/31/2023" },
    partA:              { label:"Part A Entitlement",                  value:"Active — effective 04/01/2006" },
  },
  ehr: {
    title:            { label:"Document",                          value:"EHR — Patient Record" },
    patientName:      { label:"Patient Name",                      value:"Jane Doe" },
    dob:              { label:"Date of Birth",                     value:"03/07/1941" },
    gender:           { label:"Gender",                            value:"F" },
    medicareId:       { label:"Medicare ID",                       value:"1EG4TE5MK72" },
    startOfCare:      { label:"Start Of Care",                     value:"10/15/2023" },
    eligUpload:       { label:"Eligibility Verification Uploaded", value:"Yes — 10/15/2023 03:20 PM", valueUnmet:"Yes — 10/17/2023 02:30 AM" },
    eobBpDates:       { label:"Benefit Period Start - End",        value:"01/01/2023 – 03/31/2023", valueUnmet:"01/01/2023 – 03/31/2024" },
    verbalSoc:        { label:"Verbal Start of Care Date",         value:"10/15/2023" },
    medicalDirector:  { label:"Hospice Medical Director",          value:"Robert Brown, MD", valueUnmet:"Not assigned" },
    primaryDx:        { label:"Primary Diagnosis",                 value:"I50.9 — Heart failure, unspecified" },
    additionalDx:     { label:"Additional Diagnoses",              value:"J44.9; N18.6" },
    excludedDx:       { label:"Excluded from Count",               value:"F03.90 (F-series not counted)" },
  },
  visit: {
    title:      { label:"Document",                 value:"RN Admission Visit Note" },
    rnVisit:    { label:"RN Admission Visit Date",  value:"10/15/2023" },
    visitTime:  { label:"Visit Start Time",         value:"09:05 AM" },
    clinician:  { label:"Visiting Clinician",       value:"Karen Ellis, RN" },
    admitNote:  { label:"Admission Confirmed",      value:"Yes — patient admitted to service at this visit" },
  },
  roster: {
    title:       { label:"Document",                     value:"Care Team & Provider Roster" },
    director:    { label:"Hospice Medical Director",     value:"Robert Brown, MD", valueUnmet:"No active assignment on the roster" },
    directorNpi: { label:"National Provider Identifier", value:"1234567890 (10-digit)", valueUnmet:"—" },
    effective:   { label:"Assignment Effective",         value:"01/01/2023", valueUnmet:"—" },
  },
  cti: {
    title:              { label:"Document",             value:"Certification of Terminal Illness (CTI)" },
    terminalDx:         { label:"Terminal diagnosis",   value:"J44.9" },
    prognosis:          { label:"Prognosis Statement",  value:"Six months or less if the disease runs its normal course" },
    verbalCert:         { label:"Verbal Certification", value:"Received from the physician listed above on the order date" },
    diseaseProgression: { label:"Disease progression",  value:"Addressed — worsening dyspnea and fluid overload described" },
    functionalStatus:   { label:"Functional status",    value:"Addressed — reduced independence in bathing and dressing described" },
    objectiveMeasures:  { label:"Objective measures",   value:"Not addressed — no scale scores, weights, laboratory or imaging value" },
  },
};
// Which variant of the chart is on screen — set by the drawer from the row's
// compliance, so a fully-compliant patient's document reads clean.
let PB_DOC_VARIANT = "unmet";
function pbDocValue(f){ return (PB_DOC_VARIANT === "unmet" && f.valueUnmet) ? f.valueUnmet : f.value; }
function pbFoundValue(row){
  if (!row) return "";
  return row.matches === "Unmet" ? (row.valueUnmet || row.value) : row.value;
}
function pbField(doc, key){ const f = (PB_DOC_FIELDS[doc]||{})[key]; return f ? { doc, key, label:f.label, value:pbDocValue(f) } : null; }

// How each rule was decided: the rule statement, the summary template it
// renders from, and the document fields it was read from. Field values come
// from PB_DOC_FIELDS so the strip can never disagree with the document.
// Source data: "Neos — View Details — Table View" (Audit Rule / Audit Summary).
const PB_EVIDENCE = {
  "Medicare Eligibility Verification completed and Uploaded into EHR": {
    rule: "Medicare eligibility verification must be completed and uploaded into the EHR within 24 hours of admission",
    template: "Verification on file — completed {hours} hrs after admission",
    srcRows: [
      ["Medicare Eligibility Verification","Verification Status","elig","verificationStatus"],
      ["Medicare Eligibility Verification","Date/Time of Verification","elig","verificationDate"],
      ["EHR — Patient Record","Start Of Care","ehr","startOfCare"],
    ],
    summary: ["Verification is on file with a status of Completed against a start of care of 10/15/2023.", "Verification on file — completed 6 hrs after admission."],
    summaryUnmet: ["Verification was not completed until 10/17/2023, 41 hrs after the recorded admission.", "Verification late — 41 hrs after admission, exceeds 24 hr limit."],
  },
  "Beneficiary name on the eligibility file matches the EHR": {
    rule: "Beneficiary name on the eligibility file must match the name in the EHR",
    template: "{name} — match",
    srcRows: [
      ["Medicare Eligibility Verification","Beneficiary Name","elig","beneficiaryName"],
      ["EHR — Patient Demographics","Patient Name","ehr","patientName"],
    ],
    summary: ["Eligibility file and EHR demographics both read Jane Doe.", "Jane Doe — match."],
    summaryUnmet: ["Eligibility file reads Jane Doe; EHR demographics read Jane Do.", "Name mismatch — Eligibility: Jane Doe | EHR: Jane Do."],
  },
  "Date of birth on the eligibility file matches the EHR": {
    rule: "Date of birth on the eligibility file must match the date of birth in the EHR",
    template: "{dob} — match",
    srcRows: [
      ["Medicare Eligibility Verification","Date of Birth","elig","dob"],
      ["EHR — Patient Demographics","Date of Birth","ehr","dob"],
    ],
    summary: ["Both records carry a date of birth of 03/07/1941.", "03/07/1941 — match."],
    summaryUnmet: ["Eligibility reads 03/07/1941; the EHR reads 07/03/1941 — day and month transposed.", "DOB mismatch — Eligibility: 03/07/1941 | EHR: 07/03/1941."],
  },
  "Medicare Beneficiary Identifier matches the EHR payer record": {
    rule: "Medicare Beneficiary Identifier must match the EHR payer record and be a valid 11-character MBI",
    template: "{mbi} — match, 11-character format valid",
    srcRows: [
      ["Medicare Eligibility Verification","Medicare Beneficiary Identifier","elig","mbi"],
      ["EHR — Payer Record","Medicare ID","ehr","medicareId"],
    ],
    summary: ["Eligibility and the EHR payer record both read 1EG4TE5MK72, an 11-character MBI.", "1EG4TE5MK72 — match, 11-character format valid."],
    summaryUnmet: ["Eligibility reads 1EG4TE5MK71 against 1EG4TE5MK72 on the payer record.", "MBI mismatch — Eligibility: 1EG4TE5MK71 | EHR: 1EG4TE5MK72."],
  },
  "Benefit period sequence and dates match the eligibility file": {
    rule: "Benefit period sequence and start–end dates must match the eligibility file",
    template: "Benefit Period {n} — {start} to {end} — match",
    srcRows: [
      ["Medicare Eligibility Verification","Benefit Period Number","elig","bpNumber"],
      ["Medicare Eligibility Verification","Benefit Period Start - End","elig","bpDates"],
      ["EHR — Election of Benefits","Benefit Period Start - End","ehr","eobBpDates"],
    ],
    summary: ["Eligibility and the election of benefits both record Benefit Period 1, 01/01/2023 – 03/31/2023.", "Benefit Period 1 — 01/01/2023 to 03/31/2023 — match."],
    summaryUnmet: ["Eligibility ends the period 03/31/2023; the election of benefits ends it 03/31/2024.", "Benefit period mismatch — Eligibility: BP1 01/01/2023–03/31/2023 | EHR: BP1 01/01/2023–03/31/2024."],
  },
  "Gender on the eligibility file matches the EHR": {
    rule: "Gender on the eligibility file must match the gender in the EHR",
    template: "{gender} — match",
    srcRows: [
      ["Medicare Eligibility Verification","Gender","elig","gender"],
      ["EHR — Patient Demographics","Gender","ehr","gender"],
    ],
    summary: ["Eligibility and EHR demographics both read F.", "F — match."],
    summaryUnmet: ["Eligibility reads F; the EHR reads M.", "Gender mismatch — Eligibility: F | EHR: M."],
  },
  "Start Of Care is accurate and supported by the RN admission visit date": {
    rule: "Start of care must be accurate and supported by the RN admission visit date",
    template: "{SOC} — matches RN admission visit",
    srcRows: [
      ["RN Admission Visit Note","RN Admission Visit Date","visit","rnVisit"],
      ["RN Admission Visit Note","Admission Confirmed","visit","admitNote"],
    ],
    summary: ["Verbal start of care and the RN admission visit are both dated 10/15/2023.", "10/15/2023 — matches RN admission visit."],
    summaryUnmet: ["EHR start of care reads 10/14/2023 against an RN admission visit of 10/15/2023.", "Date mismatch — EHR SOC: 10/14/2023 | RN admission visit date: 10/15/2023."],
  },
  "Hospice Medical Director is identified on the record": {
    rule: "A hospice medical director must be identified on the record with a valid NPI",
    template: "{physician}, {credential} — NPI {npi}",
    srcRows: [
      ["Care Team & Provider Roster","Hospice Medical Director","roster","director"],
      ["Care Team & Provider Roster","National Provider Identifier","roster","directorNpi"],
    ],
    summary: ["Care team lists Robert Brown, MD with a 10-digit NPI of 1234567890.", "Robert Brown, MD — NPI 1234567890."],
    summaryUnmet: ["No medical director is recorded on the care team, so no NPI could be read.", "No Medical Director assigned on the record."],
  },
  "More than one valid ICD-10 diagnosis is coded": {
    rule: "At least two valid ICD-10 diagnoses must be coded; F-series codes are not counted",
    template: "{count} qualifying codes — meets minimum of 2",
    srcRows: [
      ["EHR — Diagnosis Record","Primary Diagnosis","ehr","primaryDx"],
      ["EHR — Diagnosis Record","Additional Diagnoses","ehr","additionalDx"],
      ["EHR — Diagnosis Record","Excluded from Count","ehr","excludedDx"],
    ],
    summary: ["I50.9, J44.9 and N18.6 all qualify; F03.90 is excluded as an F-series code.", "3 qualifying codes — meets minimum of 2."],
    summaryUnmet: ["Only I50.9 qualifies once F03.90 is excluded from the count.", "Only 1 qualifying code — minimum of 2 not met (F03.90 excluded from count)."],
  },
  "CTI Narrative supports terminal prognosis with measurable decline": {
    rule: "The CTI narrative must support a terminal prognosis with measurable decline across clinical domains",
    template: "Supports prognosis — decline evidenced in {domains}",
    srcRows: [
      ["CTI","Terminal diagnosis","cti","terminalDx"],
      ["CTI","Disease progression","cti","diseaseProgression"],
      ["CTI","Functional status","cti","functionalStatus"],
      ["CTI","Objective measures","cti","objectiveMeasures"],
    ],
    summary: ["Disease progression and functional status are both addressed with described decline; terminal diagnosis is coded J44.9.", "Supports prognosis — decline evidenced in functional status, nutrition and disease progression."],
    summaryUnmet: ["Functional status is addressed, but no objective measures or prognosis rationale are documented.", "Indeterminate — functional status addressed; no objective measures or prognosis rationale."],
  },
};

// Sub-criteria checked for each rule — the rule is Met only when every one
// passes. [check, value when met, value when unmet, fails when rule unmet, reference indexes]
const PB_SUBCRITERIA = {
  "Medicare Eligibility Verification completed and Uploaded into EHR": [
    ["Verification status is Completed","Completed","Completed",false,[0]],
    ["Verification uploaded into EHR","Uploaded 10/15/2023","Uploaded 10/17/2023",false,[1]],
    ["Completed within 24 hrs of admission","6 hrs after admission","41 hrs after admission",true,[1,2]],
  ],
  "Beneficiary name on the eligibility file matches the EHR": [
    ["First name matches","Jane = Jane","Jane = Jane",false,[0,1]],
    ["Last name matches","Doe = Doe","Doe \u2260 Do",true,[0,1]],
  ],
  "Date of birth on the eligibility file matches the EHR": [
    ["Month matches","03 = 03","03 \u2260 07",true,[0,1]],
    ["Day matches","07 = 07","07 \u2260 03",true,[0,1]],
    ["Year matches","1941 = 1941","1941 = 1941",false,[0,1]],
  ],
  "Medicare Beneficiary Identifier matches the EHR payer record": [
    ["MBI present on eligibility file","1EG4TE5MK72","1EG4TE5MK71",false,[0]],
    ["11-character format valid","11 characters","11 characters",false,[0]],
    ["Matches EHR payer record","1EG4TE5MK72 = 1EG4TE5MK72","1EG4TE5MK71 \u2260 1EG4TE5MK72",true,[0,1]],
  ],
  "Benefit period sequence and dates match the eligibility file": [
    ["Benefit period number matches","BP1 = BP1","BP1 = BP1",false,[0]],
    ["Start date matches","01/01/2023 = 01/01/2023","01/01/2023 = 01/01/2023",false,[1,2]],
    ["End date matches","03/31/2023 = 03/31/2023","03/31/2023 \u2260 03/31/2024",true,[1,2]],
  ],
  "Gender on the eligibility file matches the EHR": [
    ["Gender recorded on both records","F | F","F | M",false,[0,1]],
    ["Values match","F = F","F \u2260 M",true,[0,1]],
  ],
  "Start Of Care is accurate and supported by the RN admission visit date": [
    ["RN admission visit documented","10/15/2023","10/15/2023",false,[0]],
    ["Admission confirmed in visit note","Confirmed","Confirmed",false,[1]],
    ["SOC equals RN admission visit date","10/15/2023 = 10/15/2023","10/14/2023 \u2260 10/15/2023",true,[0]],
  ],
  "Hospice Medical Director is identified on the record": [
    ["Medical director named on care team","Robert Brown, MD","Not recorded",true,[0]],
    ["Valid 10-digit NPI","1234567890","Not available",true,[1]],
  ],
  "More than one valid ICD-10 diagnosis is coded": [
    ["Primary diagnosis is a valid ICD-10 code","I50.9","I50.9",false,[0]],
    ["F-series codes excluded from count","F03.90 excluded","F03.90 excluded",false,[2]],
    ["At least 2 qualifying codes","3 codes","1 code",true,[0,1,2]],
  ],
  "CTI Narrative supports terminal prognosis with measurable decline": [
    ["Terminal diagnosis stated","J44.9","J44.9",false,[0]],
    ["Disease progression described","Documented","Documented",false,[1]],
    ["Functional decline documented","Documented","Documented",false,[2]],
    ["Objective measures documented","Weight loss, PPS 40%","Not documented",true,[3]],
    ["Prognosis rationale stated","Documented","Not documented",true,[]],
  ],
};
// Rules whose fields are answers (not individual Met/Unmet checks); the rule
// result is evaluated from the combination of answers.
// Generalised rule model. Each question has:
//  options  – any number of possible answers
//  pass     – answers that satisfy the question
//  refs     – a fixed number of reference fields to annotate (label = slot hint);
//             met/unmet hold the sample annotated line for each slot
//  when     – optional condition on earlier answers; otherwise the question is N/A
// The rule is Met when every applicable question has a passing answer.
const PB_LOGIC_RULES = {
  "Medicare Eligibility Verification completed and Uploaded into EHR": { questions:[
    { label:"What is the eligibility verification status?", options:["Completed","Pending","Failed","Not Started"], pass:["Completed"], more:["Verification Date","Verified By","Payer Name"], answer:{ met:"Completed", unmet:"Completed" },
      refs:[{ label:"Verification Status", src:"Medicare Eligibility Verification", page:1, met:"Eligibility Verification Status - Completed - 10/15/2023 09:12AM", unmet:"Eligibility Verification Status - Completed - 10/17/2023 01:40AM" },{ label:"EHR Verification Status", src:"EHR — Patient Record", page:1, met:"Eligibility Verification - Completed - 10/15/2023", unmet:"Eligibility Verification - Completed - 10/17/2023" }] },
    { label:"Is the verification uploaded into the EHR?", options:["Yes","No"], pass:["Yes"], more:["Upload Date","Document Name","Uploaded By"], answer:{ met:"Yes", unmet:"Yes" },
      refs:[{ label:"Verification Uploaded", src:"Medicare Eligibility Verification", page:1, met:"Eligibility Verification Uploaded - Yes - 10/15/2023 03:20PM", unmet:"Eligibility Verification Uploaded - Yes - 10/17/2023 02:05AM" },{ label:"EHR Attachment", src:"EHR — Patient Record", page:3, met:"Attached Document - Medicare Eligibility Verification - 10/15/2023", unmet:"Attached Document - Medicare Eligibility Verification - 10/17/2023" }] },
    { label:"Was it completed within 24 hrs of admission?", options:["Yes","No"], pass:["Yes"], more:["Referral Date","Verification Completed Date"], answer:{ met:"Yes", unmet:"No" },
      refs:[{ label:"Admission Date", src:"EHR — Patient Record", page:2, met:"Admission Date - 10/15/2023 09:00AM", unmet:"Admission Date - 10/15/2023 09:00AM" },{ label:"Verification Upload Date", src:"Medicare Eligibility Verification", page:1, met:"Eligibility Verification Uploaded - Yes - 10/15/2023 03:20PM", unmet:"Eligibility Verification Uploaded - Yes - 10/17/2023 02:05AM" }] },
  ]},
  "Patient has an open election form": { questions:[
    { label:"Does the patient have an open election form?", options:["Yes","No"], pass:["Yes","No"], more:["Election Date","Signed By","Benefit Period"], answer:{ met:"Yes", unmet:"No" },
      refs:[{ label:"Election Form Status", src:"EHR — Election of Benefits", page:1, met:"Open Election Form - Yes - Signed 10/14/2023", unmet:"Open Election Form - No - None on file" },{ label:"Eligibility Election", src:"Medicare Eligibility Verification", page:1, met:"Hospice Election - Open - 10/14/2023", unmet:"Hospice Election - None on file" }] },
    { label:"Patient is on service with", options:["Compassus","Other Agency"], pass:["Compassus"], more:["Provider Start Date","Provider NPI","Transfer Date"], answer:{ met:"Compassus", unmet:"Other Agency" }, when:a=>a[0]==="No", naNote:"Not required — open election form exists",
      refs:[{ label:"Current Hospice Provider", src:"EHR — Patient Record", page:2, met:"Current Hospice Provider - Compassus - Since 10/14/2023", unmet:"Current Hospice Provider - Other Agency - Since 09/02/2023" },{ label:"Eligibility Hospice Provider", src:"Medicare Eligibility Verification", page:1, met:"Hospice Provider - Compassus", unmet:"Hospice Provider - Other Agency" }] },
  ], logicText:"Met if an open election form exists. If not, Met only when the patient is on service with Compassus." },
};
// Remaining rules on the same question model.
(function(){
  const EL="Medicare Eligibility Verification", EHR="EHR — Patient Record", RN="RN Admission Visit Note", ROS="Care Team Roster", CTI="CTI Narrative";
  const R=(label,src,page,met,unmet)=>({ label, src, page, met, unmet:unmet===undefined?met:unmet });
  const PB_PARAM={"Was it completed within 24 hrs of admission?":"Verification Upload Timing","What is the eligibility verification status?":"Eligibility Verification Status","Is the verification uploaded into the EHR?":"Verification Upload","Does the patient have an open election form?":"Election Form Status","Patient is on service with":"Current Hospice Provider","Does the first name match?":"First Name","Does the last name match?":"Last Name","Does the date of birth match?":"Date of Birth","Is an MBI present on the eligibility file?":"MBI","Is the MBI format valid?":"MBI Format","Does it match the EHR payer record?":"MBI","Does the benefit period number match?":"Benefit Period Number","Does the start date match?":"Benefit Period Start Date","Does the end date match?":"Benefit Period End Date","Do the billing periods match?":"Billing Periods","Is gender recorded on both records?":"Gender","Do the values match?":"Gender","Is an RN admission visit documented?":"RN Admission Visit Date","Is admission confirmed in the visit note?":"Admission Status","Does the SOC equal the RN admission visit date?":"Start of Care Date","Is a medical director named on the care team?":"Medical Director","Is a valid 10-digit NPI on file?":"Medical Director NPI","Is the primary diagnosis a valid ICD-10 code?":"Primary Diagnosis","How many qualifying codes (F-series excluded)?":"Secondary Diagnosis Codes","Is a terminal diagnosis stated?":"Terminal Diagnosis","Is disease progression described?":"Disease Progression","Is functional decline documented?":"Functional Decline","Are objective measures documented?":"Objective Measures","Is the prognosis rationale stated?":"Prognosis Rationale"};
  Object.keys(PB_LOGIC_RULES).forEach(k=>(PB_LOGIC_RULES[k].questions||[]).forEach(q=>{ if (!q.param && PB_PARAM[q.label]) q.param = PB_PARAM[q.label]; }));
  const Q=(label,options,pass,met,unmet,refs,more,extra)=>({ label, param:PB_PARAM[label], options, pass, answer:{ met, unmet }, refs, more:more||[], ...(extra||{}) });
  const YN=["Yes","No"];
  Object.assign(PB_LOGIC_RULES, {
    "Beneficiary name on the eligibility file matches the EHR": { questions:[
      Q("Does the first name match?",YN,["Yes"],"Yes","Yes",[R("Eligibility First Name",EL,1,"Beneficiary First Name - Jane"),R("EHR First Name",EHR,1,"Patient First Name - Jane")],["Middle Initial","Name Suffix"]),
      Q("Does the last name match?",YN,["Yes"],"Yes","No",[R("Eligibility Last Name",EL,1,"Beneficiary Last Name - Doe"),R("EHR Last Name",EHR,1,"Patient Last Name - Doe","Patient Last Name - Do")],["Maiden Name","Alias"]),
    ]},
    "Date of birth on the eligibility file matches the EHR": { questions:[
      Q("Does the date of birth match?",["Yes","No — month/day swapped","No — different date"],["Yes"],"Yes","No — month/day swapped",[R("Eligibility DOB",EL,1,"Beneficiary Date of Birth - 03/07/1941"),R("EHR DOB",EHR,1,"Patient Date of Birth - 03/07/1941","Patient Date of Birth - 07/03/1941")],["Age at Admission"]),
    ]},
    "Medicare Beneficiary Identifier matches the EHR payer record": { questions:[
      Q("Is an MBI present on the eligibility file?",YN,["Yes"],"Yes","Yes",[R("Eligibility MBI",EL,1,"Medicare Beneficiary Identifier - 1EG4TE5MK72","Medicare Beneficiary Identifier - 1EG4TE5MK71"),R("EHR MBI",EHR,1,"Patient MBI - 1EG4TE5MK72")],["MBI Effective Date"]),
      Q("Is the MBI format valid?",["Valid — 11 characters","Invalid length","Invalid characters"],["Valid — 11 characters"],"Valid — 11 characters","Valid — 11 characters",[R("MBI Format Check",EL,1,"MBI Format - Valid - 11 characters"),R("EHR MBI Format",EHR,1,"Patient MBI - 1EG4TE5MK72 - 11 characters")],[],{ when:a=>a[0]==="Yes", naNote:"Not required — no MBI on file" }),
      Q("Does it match the EHR payer record?",YN,["Yes"],"Yes","No",[R("EHR Payer MBI",EHR,2,"Payer Record MBI - 1EG4TE5MK72"),R("Eligibility MBI",EL,1,"Medicare Beneficiary Identifier - 1EG4TE5MK72")],["Payer Name","Policy Effective Date"],{ when:a=>a[0]==="Yes", naNote:"Not required — no MBI on file" }),
    ]},
    "Benefit period sequence and dates match the eligibility file": { questions:[
      Q("Does the benefit period number match?",YN,["Yes"],"Yes","Yes",[R("Eligibility Benefit Period",EL,1,"Benefit Period - BP1"),R("EHR Benefit Period",EHR,2,"Election Benefit Period - BP1")],["Days Remaining"]),
      Q("Does the start date match?",YN,["Yes"],"Yes","Yes",[R("Eligibility Start Date",EL,1,"Benefit Period Start - 01/01/2023"),R("EHR Start Date",EHR,2,"Election Start Date - 01/01/2023")]),
      Q("Does the end date match?",YN,["Yes"],"Yes","No",[R("Eligibility End Date",EL,1,"Benefit Period End - 03/31/2023"),R("EHR End Date",EHR,2,"Election End Date - 03/31/2023","Election End Date - 03/31/2024")]),
      Q("Do the billing periods match?",YN,["Yes"],"Yes","No",[R("Eligibility Billing Periods",EL,1,"Billing Periods - 01/01/2023 – 01/31/2023, 02/01/2023 – 02/28/2023"),R("EHR Billing Periods",EHR,2,"Billing Periods - 01/01/2023 – 01/31/2023, 02/01/2023 – 02/28/2023","Billing Periods - 01/01/2023 – 01/31/2023, 02/01/2023 – 02/27/2023")],[],{ list:{ name:"Billing Periods", docs:[
        { label:"Eligibility Billing Period", src:EL, page:1, met:["01/01/2023 – 01/31/2023","02/01/2023 – 02/28/2023"] },
        { label:"EHR Billing Period", src:EHR, page:2, met:["01/01/2023 – 01/31/2023","02/01/2023 – 02/28/2023"], unmet:["01/01/2023 – 01/31/2023","02/01/2023 – 02/27/2023"] },
      ]} }),
    ]},
    "Gender on the eligibility file matches the EHR": { questions:[
      Q("Is gender recorded on both records?",YN,["Yes"],"Yes","Yes",[R("Eligibility Gender",EL,1,"Beneficiary Gender - F"),R("EHR Gender",EHR,1,"Patient Gender - F","Patient Gender - M")]),
      Q("Do the values match?",YN,["Yes"],"Yes","No",[R("Comparison",EHR,1,"Gender Comparison - F = F","Gender Comparison - F ≠ M"),R("Eligibility Gender",EL,1,"Beneficiary Gender - F")],[],{ when:a=>a[0]==="Yes", naNote:"Not required — gender missing on a record" }),
    ]},
    "Start Of Care is accurate and supported by the RN admission visit date": { questions:[
      Q("Is an RN admission visit documented?",YN,["Yes"],"Yes","Yes",[R("RN Visit Date",RN,1,"RN Admission Visit - Yes - 10/15/2023 10:30AM"),R("EHR Visit Schedule",EHR,2,"Admission Visit - RN - 10/15/2023")],["Visit Clinician","Visit Type"]),
      Q("Is admission confirmed in the visit note?",["Confirmed","Not confirmed","Pending signature"],["Confirmed"],"Confirmed","Confirmed",[R("Admission Confirmation",RN,1,"Admission Status - Confirmed - Signed 10/15/2023"),R("EHR Admission Status",EHR,2,"Admission Status - Admitted - 10/15/2023")],[],{ when:a=>a[0]==="Yes", naNote:"Not required — no RN admission visit" }),
      Q("Does the SOC equal the RN admission visit date?",YN,["Yes"],"Yes","No",[R("EHR Start of Care",EHR,2,"Start Of Care - 10/15/2023","Start Of Care - 10/14/2023"),R("RN Visit Date",RN,1,"RN Admission Visit - 10/15/2023")],[],{ when:a=>a[0]==="Yes", naNote:"Not required — no RN admission visit" }),
    ]},
    "Hospice Medical Director is identified on the record": { questions:[
      Q("Is a medical director named on the care team?",YN,["Yes"],"Yes","No",[R("Medical Director",ROS,1,"Medical Director - Robert Brown, MD","Medical Director - Not recorded"),R("CTI Signing Physician",CTI,2,"Certifying Physician - Robert Brown, MD","Certifying Physician - Not signed")],["Attending Physician","Effective Date"]),
      Q("Is a valid 10-digit NPI on file?",["Valid","Invalid","Missing"],["Valid"],"Valid","Missing",[R("Medical Director NPI",ROS,1,"NPI - 1234567890","NPI - Not available"),R("CTI Physician NPI",CTI,2,"Physician NPI - 1234567890","Physician NPI - Not available")],[],{ when:a=>a[0]==="Yes", naNote:"Not required — no medical director named" }),
    ], logicText:"Met only when a medical director is named and has a valid NPI." },
    "More than one valid ICD-10 diagnosis is coded": { questions:[
      Q("Is the primary diagnosis a valid ICD-10 code?",YN,["Yes"],"Yes","Yes",[R("Primary Diagnosis",EHR,3,"Primary Diagnosis - I50.9 - Heart failure, unspecified"),R("CTI Primary Diagnosis",CTI,1,"Primary Diagnosis - I50.9 - Heart failure, unspecified")],["Diagnosis Onset Date"]),
      Q("How many qualifying codes (F-series excluded)?",["0","1","2","3","4+"],["2","3","4+"],"3","1",[R("Secondary Diagnosis",EHR,3,"Secondary Diagnosis - J44.9 - COPD","Secondary Diagnosis - F03.90 - Excluded"),R("Excluded Code",EHR,3,"F-series Code - F03.90 - Excluded from count")],["Additional Diagnosis","Related Condition"]),
    ], logicText:"Met when the primary code is valid and at least 2 qualifying codes are present." },
    "CTI Narrative supports terminal prognosis with measurable decline": { questions:[
      Q("Is a terminal diagnosis stated?",YN,["Yes"],"Yes","Yes",[R("Terminal Diagnosis",CTI,1,"Terminal Diagnosis - J44.9 - COPD"),R("EHR Terminal Diagnosis",EHR,3,"Terminal Diagnosis - J44.9 - COPD")]),
      Q("Is disease progression described?",["Documented","Partially documented","Not documented"],["Documented"],"Documented","Documented",[R("Disease Progression",CTI,1,"Disease Progression - Documented - 3 exacerbations in 6 months"),R("RN Visit Progression",RN,1,"Disease Progression - 3 hospitalizations in 6 months")]),
      Q("Is functional decline documented?",["Documented","Partially documented","Not documented"],["Documented"],"Documented","Documented",[R("Functional Status",CTI,1,"Functional Decline - Documented - ADL dependence 4/6"),R("RN Visit Functional Status",RN,1,"ADL Dependence - 4/6 - Bedbound")],["ADL Score","Ambulation Status"]),
      Q("Are objective measures documented?",["Documented","Not documented"],["Documented"],"Documented","Not documented",[R("Objective Measure",CTI,2,"Objective Measures - Weight loss 8% - PPS 40%","Objective Measures - Not documented"),R("RN Visit Measures",RN,1,"Weight Loss - 8% in 3 months - PPS 40%","Weight Loss - Not recorded")],["Weight Trend","PPS Score","FAST Score"]),
      Q("Is the prognosis rationale stated?",["Documented","Not documented"],["Documented"],"Documented","Not documented",[R("Prognosis Rationale",CTI,2,"Prognosis Rationale - Documented - Life expectancy ≤ 6 months","Prognosis Rationale - Not documented"),R("Physician Narrative",EHR,3,"Physician Narrative - Prognosis ≤ 6 months","Physician Narrative - Not documented")]),
    ]},
  });
})();
function pbApplyLogic(indicator, items) {
  const L = PB_LOGIC_RULES[indicator]; if (!L) return items;
  const a = items.map(x=>x.answer);
  const res = L.questions.map(q=>{ const na = !!(q.when && !q.when(a)); return { na, pass: na || q.pass.includes(a[L.questions.indexOf(q)]) }; });
  const ok = res.every(r=>r.pass);
  const text = L.logicText || (ok ? "every question has a passing answer" : `${res.filter(r=>!r.pass).length} of ${res.filter(r=>!r.na).length} questions not satisfied`);
  return items.map((x,i)=>({ ...x, na:res[i].na, naNote:L.questions[i].naNote, met:res[i].pass, ruleMet:ok, logicText:text }));
}
function pbSubCriteriaFor(row) {
  if (!row) return [];
  const met = row.matches === "Met";
  const L = PB_LOGIC_RULES[row.indicator];
  if (L) return pbApplyLogic(row.indicator, L.questions.map(q=>{ const ans = met ? q.answer.met : q.answer.unmet; return { label:q.label, param:q.param, value:ans, answer:ans, options:q.options, pass:q.pass, logic:true, refs:[], slotCount:q.refs.length, slotLabels:q.refs.map(r=>r.label), slotSrc:q.refs.map(r=>({ src:r.src, page:r.page })), more:q.more||[], slotTexts:q.refs.map(r=>met?r.met:r.unmet), list: q.list ? { name:q.list.name, docs:q.list.docs.map(d=>({ label:d.label, src:d.src, page:d.page, values: met ? d.met : (d.unmet||d.met) })) } : null }; }));
  const list = PB_SUBCRITERIA[row.indicator];
  if (!list) return [{ label: row.indicator, value: met ? row.value : (row.valueUnmet || row.value), met, refs:null }];
  return list.map(s => ({ label: s[0], value: met ? s[1] : s[2], met: met ? true : !s[3], refs: s[4] || null }));
}
function pbMidEllipsis(t, head = 22, tail = 14){ t = String(t||""); return t.length > head + tail + 3 ? t.slice(0, head).trimEnd() + "…" + t.slice(-tail).trimStart() : t; }
function pbRefsForSub(s, list, pick){ return list.filter(x => s.refs==null || s.refs.includes(pick(x))); }
function PBRefReadOnly({ f }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:1,minWidth:0}}>
      <span style={{font:"500 11px/15px Roboto",color:"#64748b"}}>{f.label}</span>
      <span style={{font:"600 13px/18px Roboto",color:"#0f172a",overflowWrap:"anywhere"}}>{f.value}</span>
      <span style={{font:"400 11px/15px Roboto",color:"#94a3b8"}}>{f.source || (PB_DOCS[f.doc]||{}).label}{f.page ? " · Page "+f.page : ""}</span>
    </div>
  );
}
function PBSubCriteriaTable({ items, compact, onToggle, sources, renderRefs, extraRow, onAddRef, addingIdx, focusIdx }) {
  const hasFocus = typeof focusIdx==="number";
  const isLogic = items.some(s=>s.logic);
  const G = "minmax(0,1fr) " + (isLogic ? (onToggle ? "170px" : "96px") : (onToggle ? "118px" : "64px"));
  const th = { font:"500 10px/14px Roboto", color:"#8a95a3", textTransform:"uppercase", letterSpacing:".04em" };
  const passed = items.filter(s=>s.met).length;
  const allMet = isLogic ? !!(items[0]&&items[0].ruleMet) : passed === items.length;
  const refsCell = (s,i)=>{
    if (renderRefs) return renderRefs(s,i);
    if (s.logic) return (s.slotTexts||[]).map((t,k)=>(
      <div key={k} style={{display:"flex",flexDirection:"column",gap:4}}>
        <span style={{display:"flex",alignItems:"center",gap:6,font:"500 11px/14px Roboto",color:"#64748b"}}><span style={{flexShrink:0,background:"#E2A700",color:"#fff",borderRadius:20,minWidth:16,height:16,padding:"0 4px",boxSizing:"border-box",display:"inline-flex",alignItems:"center",justifyContent:"center",font:"600 10px/1 Roboto"}}>{(i+1)+String.fromCharCode(97+k)}</span>{(s.slotLabels&&s.slotLabels[k])||("Field "+(k+1))}</span>
        <div style={{background:"#F7F9FC",border:"1px solid #EEF1F5",borderRadius:5,padding:"7px 9px",font:"500 12px/17px Roboto",color:"#0f172a",overflowWrap:"anywhere"}}>{t}</div>
      </div>
    ));
    const rs = pbRefsForSub(s, (sources||[]).map((f,k)=>({ f, k })), x=>x.k);
    return rs.length ? rs.map(({f,k},j)=>(
      <div key={k} style={{display:"flex",gap:8,alignItems:"flex-start",background:"#F7F9FC",border:"1px solid #EEF1F5",borderRadius:5,padding:"7px 9px"}}>
        <span style={{flexShrink:0,marginTop:1,background:f.doc?"#E2A700":"#e7ebf1",color:f.doc?"#fff":"#64748b",borderRadius:20,minWidth:14,height:14,padding:"0 3px",boxSizing:"border-box",display:"inline-flex",alignItems:"center",justifyContent:"center",font:"600 9px/1 Roboto"}}>{(i+1)+String.fromCharCode(97+j)}</span>
        <PBRefReadOnly f={f} />
      </div>
    )) : <span style={{font:"400 12px/17px Roboto",color:"#94a3b8"}}>No reference annotated</span>;
  };
  return (
    <div style={{background:"#FAFBFD",border:"1px solid #dfe4ea",borderRadius:5,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:G,gap:10,padding:"7px 12px",background:"#EEF1F5",borderBottom:"1px solid #dfe4ea"}}>
        <div style={th}>{isLogic ? "Question & References" : <React.Fragment>Sub-criterion &amp; References</React.Fragment>}</div><div style={th}>{isLogic ? "Decision" : "Result"}</div>
      </div>
      {items.map((s,i)=> (hasFocus && i!==focusIdx) ? null : (
        <div key={i} style={{display:"grid",gridTemplateColumns:G,gap:10,padding:"10px 12px",borderTop:(i && !hasFocus)?"1px solid #eceff3":"none",alignItems:"start",background:"#fff"}}>
                    <div style={{display:"flex",flexDirection:"column",gap:2,minWidth:0}}>
            <span style={{font:"500 12px/17px Roboto",color:s.na?"#94a3b8":"#333",overflowWrap:"anywhere"}}>{s.label}</span>
            {s.logic ? (s.na && <span style={{font:"400 11px/15px Roboto",color:"#94a3b8",fontStyle:"italic"}}>{s.naNote||"Not required"}</span>)
              : <span style={{font:"400 11px/15px Roboto",color:"#64748b",overflowWrap:"anywhere"}}>{s.value}</span>}
          </div>
          {s.logic ? (
            s.na ? <span style={{font:"500 11px/18px Roboto",color:"#94a3b8",justifySelf:"start",background:"#f1f5f9",borderRadius:4,padding:"1px 8px"}}>N/A</span>
            : onToggle ? (true ? (
              <select value={s.answer||""} onClick={(e)=>e.stopPropagation()} onChange={(e)=>onToggle(i, e.target.value)} style={{justifySelf:"stretch",border:"1px solid #cbd5e1",borderRadius:4,padding:"3px 6px",font:"500 12px/16px Roboto",color:"#1677FF",background:"#fff",cursor:"pointer"}}>
                {!s.answer && <option value="">Select decision</option>}
                {s.options.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <span style={{display:"inline-flex",gap:1,background:"#eef2f7",borderRadius:4,padding:1,justifySelf:"start"}}>
                {s.options.map(o=>(
                  <span key={o} onClick={(e)=>{ e.stopPropagation(); onToggle(i, o); }} style={{cursor:"pointer",padding:"2px 9px",borderRadius:3,font:"500 11px/16px Roboto",whiteSpace:"nowrap",background:s.answer===o?"#fff":"transparent",color:s.answer===o?"#1677FF":"#64748b",boxShadow:s.answer===o?"0 1px 1px rgba(15,23,42,.12)":"none"}}>{o}</span>
                ))}
              </span>
            )) : <span style={{font:"600 12px/17px Roboto",color:"#0f172a"}}>{s.answer || "—"}</span>
          ) : onToggle ? (
            <span style={{display:"inline-flex",gap:1,background:"#eef2f7",borderRadius:4,padding:1,justifySelf:"start"}}>
              {[["Met",true,"#2E9E4A"],["Unmet",false,"#C0392B"]].map(([lbl,v,c])=>(
                <span key={lbl} onClick={(e)=>{ e.stopPropagation(); onToggle(i, v); }} style={{cursor:"pointer",padding:"2px 9px",borderRadius:3,font:"500 11px/16px Roboto",background:s.met===v?"#fff":"transparent",color:s.met===v?c:"#64748b",boxShadow:s.met===v?"0 1px 1px rgba(15,23,42,.12)":"none"}}>{lbl}</span>
              ))}
            </span>
          ) : (
            <span style={{display:"inline-flex",alignItems:"center",gap:5,font:"500 12px/17px Roboto",color:s.met?"#2E9E4A":"#C0392B"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:s.met?"#2E9E4A":"#C0392B"}}></span>{s.met?"Met":"Unmet"}
            </span>
          )}
          <div style={{gridColumn:"1 / -1",display:"flex",flexDirection:"column",gap:8,minWidth:0}}>
            {onAddRef && !s.logic && (
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{font:"500 10px/14px Roboto",color:"#8a95a3",textTransform:"uppercase",letterSpacing:".04em"}}>Annotated References</span>
                
              </div>
            )}
            {refsCell(s,i)}
          </div>
        </div>
      ))}
      {extraRow}
      {hasFocus ? (()=>{ const q=items[focusIdx]||{}; const ok=!q.na && !!q.met; return (
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderTop:"1px solid #dfe4ea",background:q.na?"#F5F7FA":ok?"#F3FBF4":"#FDF3F2",font:"500 12px/17px Roboto",color:q.na?"#64748b":ok?"#2E7D32":"#B03A2E"}}>
        {isLogic?"Question":"Sub-criterion"} {q.na?"N/A":ok?"Met":"Unmet"} — {q.na ? "not required for this rule" : isLogic ? (ok ? "answer satisfies the rule" : "answer does not satisfy the rule") : (ok ? "value matches the requirement" : "value does not match the requirement")}
      </div>); })() : (
      null)}
    </div>
  );
}

// Anything without a hand-written entry still gets a comparison strip, built
// from a field of each document the indicator is linked to.
function pbEvidenceFor(row) {
  if (!row) return null;
  const met = row.matches === "Met";
  const e = PB_EVIDENCE[row.indicator];
  if (e) return { rule:e.rule, template:e.template, summary:(!met && e.summaryUnmet) ? e.summaryUnmet : e.summary, met,
    sources:(e.srcRows||[]).map(r=>{ const f = pbField(r[2], r[3]); return { source:r[0], label:r[1], value:f?f.value:"", doc:r[2], key:r[3], page:pbPageOf(r[2], r[3]) }; }) };
  const keys = (row.docs||[]).map(d => {
    const ks = Object.keys(PB_DOC_FIELDS[d]||{});
    return pbField(d, ks[1] || ks[0]);
  }).filter(Boolean);
  const read = keys.map(k => ((PB_DOCS[k.doc]||{}).label) + " reads \u201c" + k.value + "\u201d for " + k.label.toLowerCase() + ".").join(" ");
  return {
    rule: row.value,
    sources: keys,
    met,
    summary: keys.length
      ? [read, met ? "The values agree with the rule as written, so the indicator is met."
                   : "The values read from the source do not satisfy the rule, so the indicator is unmet."]
      : ["No source document is linked to this indicator, so nothing could be compared automatically."],
  };
}

// Fields the selected indicator was read from \u2014 drives the document highlight.
function pbHighlightFields(indicator, groups) {
  if (!indicator) return {};
  let row = null;
  (groups || PB_AUDIT_GROUPS).forEach(g => g.rows.forEach(r => { if (r.indicator === indicator && !row) row = r; }));
  const ev = pbEvidenceFor(row || { indicator, docs:[], matches:"Met" });
  const out = {};
  const srcs = ev.sources||[];
  const tag = {};
  const subs = row ? pbSubCriteriaFor(row) : [];
  const LR = row && PB_LOGIC_RULES[row.indicator];
  if (LR) {
    const words = (s)=>String(s||"").toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>2);
    const used = new Set();
    const docOf = (f)=>((PB_DOCS[f.doc]||{}).label);
    LR.questions.forEach((q,qi)=>(q.refs||[]).forEach((r,k)=>{
      const rw = words(r.label);
      let best = -1, bs = -1;
      srcs.forEach((f,i)=>{ const fw = words(f.label+" "+f.key); const ov = rw.filter(w=>fw.some(x=>x.startsWith(w.slice(0,5)))).length; const s = (docOf(f)===r.src?100:0) + (used.has(i)?0:10) + ov; if (s > bs) { bs = s; best = i; } });
      if (best < 0) return;
      used.add(best);
      (tag[best] = tag[best]||[]).push((qi+1)+String.fromCharCode(97+k));
    }));
    srcs.forEach((f,i)=>{ if (tag[i]) return;
      let qi = LR.questions.map((q,j)=>j).reverse().find(j=>(LR.questions[j].refs||[]).some(r=>r.src===docOf(f)));
      if (qi===undefined) qi = LR.questions.length-1;
      const n = (LR.questions[qi].refs||[]).length + Object.values(tag).flat().filter(t=>t.startsWith((qi+1)) && t.length===String(qi+1).length+1 && t.charCodeAt(t.length-1)-97 >= (LR.questions[qi].refs||[]).length).length;
      tag[i] = [(qi+1)+String.fromCharCode(97+n)];
    });
  }
  subs.forEach((q,qi)=>{ if (q.logic) return; pbRefsForSub(q, srcs.map((f,k)=>({ f, k })), x=>x.k).forEach((x,j)=>{ (tag[x.k] = tag[x.k]||[]).push((qi+1)+String.fromCharCode(97+j)); }); });
  srcs.forEach((f,i) => { out[f.doc+"."+f.key] = tag[i] ? tag[i].join(", ") : i+1; });
  return out;
}
// Sample source documents. Field values come from PB_DOC_FIELDS, so the page
// and the comparison strip can never disagree; fields the selected indicator
// was read from are highlighted and numbered.
const PBAnnotateCtx = React.createContext(null);
// Opens a read-only copy of a source document in a new browser tab.
function pbOpenDocInTab(docKey) {
  const doc = PB_DOCS[docKey] || { label: docKey };
  const fields = PB_DOC_FIELDS[docKey] || {};
  const rows = Object.keys(fields).map(k=>{
    const f = fields[k];
    const v = String(pbDocValue(f)).replace(/&/g,"&amp;").replace(/</g,"&lt;");
    return `<tr><th>${String(f.label).replace(/&/g,"&amp;").replace(/</g,"&lt;")}</th><td>${v}</td></tr>`;
  }).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${doc.label}</title>
<style>body{margin:0;background:#e9ebef;font:400 14px/20px Roboto,system-ui,sans-serif;color:#1a1a1a}
.sheet{width:794px;min-height:1123px;margin:24px auto;background:#fff;box-shadow:0 3px 14px rgba(0,0,0,.14);padding:56px 60px;box-sizing:border-box}
h1{font:700 21px/28px Roboto,system-ui,sans-serif;margin:0 0 4px}
.sub{font:400 13px/18px Roboto,system-ui,sans-serif;color:#64748b;margin:0 0 26px}
table{border-collapse:collapse;width:100%}
th{width:42%;text-align:left;font:400 15px/20px Roboto,system-ui,sans-serif;color:#7a8493;text-transform:uppercase;letter-spacing:.04em;padding:11px 12px 11px 0;vertical-align:top;border-bottom:1px solid #e3e7ec}
td{font:500 17px/23px Roboto,system-ui,sans-serif;padding:11px 0;border-bottom:1px solid #d5dae1}</style></head>
<body><div class="sheet"><h1>${doc.label}</h1><p class="sub">Source document — read-only copy opened from the Pre-Bill audit</p><table>${rows}</table></div></body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.open(); w.document.write(html); w.document.close(); }
}
function PBDocField({ doc, k, highlight, block }) {
  const f = (PB_DOC_FIELDS[doc]||{})[k];
  if (!f) return null;
  const anno = React.useContext(PBAnnotateCtx);
  const key = doc+"."+k;
  const baseN = (anno && anno.base) ? anno.base[key] : null;
  const n = anno
    ? (baseN || (((anno.annotations||{})[key]) ? (anno.tagFor ? (anno.tagFor(anno.annotations[key]) || anno.annotations[key] + (anno.numOffset||0)) : anno.annotations[key] + (anno.numOffset||0)) : null))
    : (highlight && highlight[key]);
  const hl = !!n;
  return (
    <div title={baseN?"Already annotated as a reference for this rule":undefined} onClick={(anno && anno.onFieldClick && !baseN) ? ()=>anno.onFieldClick(key) : undefined} style={{position:"relative",display:block?"block":"grid",gridTemplateColumns:block?undefined:"minmax(0,150px) minmax(0,1fr)",gap:block?4:12,alignItems:"baseline",padding:hl?"5px 8px":"5px 0",margin:hl?"0 -8px":0,borderRadius:hl?4:0,background:hl?"#FFF6D6":"transparent",outline:hl?"1.5px solid #E2A700":"none",cursor:anno?"pointer":"default"}}>
      <div style={{font:"400 19px/25px Roboto",color:"#7a8493",textTransform:"uppercase",letterSpacing:".04em"}}>{f.label}</div>
      <div style={{font:"500 21px/28px Roboto",color:"#1a1a1a",borderBottom:"1px solid #d5dae1",paddingBottom:2,display:"flex",alignItems:"center",gap:8}}>
        <span>{pbDocValue(f)}</span>
        {hl && !(anno && anno.hideNums) && <span style={{marginLeft:"auto",flexShrink:0,background:"#E2A700",color:"#fff",borderRadius:20,padding:"1px 8px",font:"600 10px/14px Roboto",whiteSpace:"nowrap"}}>{n}</span>}
      </div>
    </div>
  );
}
function PBDocHeading({ children }) {
  return <div style={{font:"600 18px/24px Roboto",color:"#334155",letterSpacing:".08em",textTransform:"uppercase",borderBottom:"1.5px solid #334155",paddingBottom:4,marginTop:18,marginBottom:8}}>{children}</div>;
}
function PBEligSheet({ highlight }) {
  return (
    <div>
      <div style={{textAlign:"center",borderBottom:"2px solid #1a1a1a",paddingBottom:10}}>
        <div style={{font:"600 14px/19px Roboto",color:"#64748b",letterSpacing:".14em"}}>MEDICARE ELIGIBILITY VERIFICATION</div>
        <div style={{font:"700 21px/28px Roboto",color:"#111",marginTop:4}}>HETS ELIGIBILITY RESPONSE</div>
        <div style={{font:"400 14px/19px Roboto",color:"#64748b",marginTop:2}}>Medicare Part A — Beneficiary eligibility inquiry — Page 1 of 1</div>
      </div>
      <PBDocHeading>Section A — Verification</PBDocHeading>
      <PBDocField doc="elig" k="verificationStatus" highlight={highlight} />
      <PBDocField doc="elig" k="verificationDate" highlight={highlight} />
      <PBDocHeading>Section B — Beneficiary</PBDocHeading>
      <PBDocField doc="elig" k="beneficiaryName" highlight={highlight} />
      <PBDocField doc="elig" k="dob" highlight={highlight} />
      <PBDocField doc="elig" k="gender" highlight={highlight} />
      <PBDocField doc="elig" k="mbi" highlight={highlight} />
      <PBDocHeading>Section C — Hospice Benefit Period</PBDocHeading>
      <PBDocField doc="elig" k="bpNumber" highlight={highlight} />
      <PBDocField doc="elig" k="bpDates" highlight={highlight} />
      <PBDocField doc="elig" k="partA" highlight={highlight} />
      <div style={{marginTop:22,paddingTop:8,borderTop:"1px solid #d5dae1",font:"400 13px/18px Roboto",color:"#94a3b8"}}>Response returned by the HETS 270/271 eligibility service. Retain with the patient record.</div>
    </div>
  );
}
function PBEhrSheet({ highlight }) {
  return (
    <div>
      <div style={{borderBottom:"2px solid #1a1a1a",paddingBottom:10}}>
        <div style={{font:"700 20px/27px Roboto",color:"#111",textTransform:"uppercase"}}>EHR — Patient Record</div>
        <div style={{font:"400 14px/19px Roboto",color:"#64748b",marginTop:2}}>Confidential medical record — Jane Doe — Page 1 of 1</div>
      </div>
      <PBDocHeading>Patient Demographics</PBDocHeading>
      <PBDocField doc="ehr" k="patientName" highlight={highlight} />
      <PBDocField doc="ehr" k="dob" highlight={highlight} />
      <PBDocField doc="ehr" k="gender" highlight={highlight} />
      <PBDocHeading>Payer Record</PBDocHeading>
      <PBDocField doc="ehr" k="medicareId" highlight={highlight} />
      <PBDocField doc="ehr" k="eligUpload" highlight={highlight} />
      <PBDocHeading>Election of Benefits</PBDocHeading>
      <PBDocField doc="ehr" k="eobBpDates" highlight={highlight} />
      <PBDocHeading>Clinical Record</PBDocHeading>
      <PBDocField doc="ehr" k="startOfCare" highlight={highlight} />
      <PBDocField doc="ehr" k="verbalSoc" highlight={highlight} />
      <PBDocHeading>Care Team</PBDocHeading>
      <PBDocField doc="ehr" k="medicalDirector" highlight={highlight} />
      <PBDocHeading>Diagnosis Record</PBDocHeading>
      <PBDocField doc="ehr" k="primaryDx" highlight={highlight} />
      <PBDocField doc="ehr" k="additionalDx" highlight={highlight} />
      <PBDocField doc="ehr" k="excludedDx" highlight={highlight} />
      <div style={{marginTop:22,paddingTop:8,borderTop:"1px solid #d5dae1",font:"400 13px/18px Roboto",color:"#94a3b8"}}>Extracted from the agency EHR on 10/18/2023.</div>
    </div>
  );
}
function PBCtiSheet({ highlight }) {
  return (
    <div>
      <div style={{textAlign:"center",borderBottom:"2px solid #1a1a1a",paddingBottom:10}}>
        <div style={{font:"700 21px/28px Roboto",color:"#111"}}>CERTIFICATION OF TERMINAL ILLNESS</div>
        <div style={{font:"400 14px/19px Roboto",color:"#64748b",marginTop:2}}>Physician order — Jane Doe — Page 1 of 1</div>
      </div>
      <PBDocHeading>Certification</PBDocHeading>
      <div style={{font:"400 17px/24px Roboto",color:"#3f4855",marginBottom:8}}>I CERTIFY THAT THE PATIENT'S PROGNOSIS IS SIX MONTHS OR LESS IF THE DISEASE RUNS ITS NORMAL COURSE. VERBAL CERTIFICATION WAS RECEIVED FROM THE PHYSICIAN LISTED ABOVE ON THIS ORDER DATE. TERMINAL DIAGNOSIS: CHRONIC OBSTRUCTIVE PULMONARY DISEASE, UNSPECIFIED.</div>
      <PBDocField doc="cti" k="terminalDx" highlight={highlight} />
      <PBDocField doc="cti" k="prognosis" highlight={highlight} />
      <PBDocField doc="cti" k="verbalCert" highlight={highlight} />
      <PBDocHeading>Narrative — Clinical Domains</PBDocHeading>
      <PBDocField doc="cti" k="diseaseProgression" highlight={highlight} block />
      <PBDocField doc="cti" k="functionalStatus" highlight={highlight} block />
      <PBDocField doc="cti" k="objectiveMeasures" highlight={highlight} block />
      <div style={{marginTop:22,paddingTop:8,borderTop:"1px solid #d5dae1",font:"400 13px/18px Roboto",color:"#94a3b8"}}>Hospice medical director may act as a secondary physician for the palliation of patient symptoms as necessary.</div>
    </div>
  );
}
// Line-numbered, paginated document content — plain left-aligned lines with a
// line-number gutter, split across pages. Text is built from PB_DOC_FIELDS at
// render time, so the parsed pane, the original pane and the comparison strip
// always read the same values.
const PB_PAGE_SPEC = {
  elig: [
    [ { t:"MEDICARE ELIGIBILITY VERIFICATION", type:"title" }, { t:"HETS 271 eligibility response · Page 1 of 3", type:"meta" },
      { t:"VERIFICATION", type:"section" }, { f:"verificationStatus" }, { f:"verificationDate" },
      { t:"BENEFICIARY", type:"section" }, { f:"beneficiaryName" }, { f:"dob" }, { f:"gender" }, { f:"mbi" } ],
    [ { t:"HOSPICE BENEFIT PERIOD", type:"section" }, { f:"bpNumber" }, { f:"bpDates" }, { f:"partA" },
      { t:"Benefit period returned by the MAC for this beneficiary." },
      { t:"No prior hospice election recorded for this period." } ],
    [ { t:"INQUIRY DETAIL", type:"section" }, { t:"Submitted by: E5 Agent · NPI 1234567890" },
      { t:"Payer: Medicare Part A (MAC J-M)" }, { t:"Trace number: 271-10152023-0914" },
      { t:"— end of response —" } ],
  ],
  ehr: [
    [ { t:"EHR — PATIENT RECORD", type:"title" }, { t:"Confidential medical record · Page 1 of 3", type:"meta" },
      { t:"PATIENT DEMOGRAPHICS", type:"section" }, { f:"patientName" }, { f:"dob" }, { f:"gender" },
      { t:"PAYER RECORD", type:"section" }, { f:"medicareId" }, { f:"eligUpload" } ],
    [ { t:"ELECTION OF BENEFITS", type:"section" }, { f:"eobBpDates" },
      { t:"CLINICAL RECORD", type:"section" }, { f:"startOfCare" }, { f:"verbalSoc" },
      { t:"RN admission visit completed in the home; vitals and" },
      { t:"functional assessment recorded at the same visit." } ],
    [ { t:"CARE TEAM", type:"section" }, { f:"medicalDirector" },
      { t:"DIAGNOSIS RECORD", type:"section" }, { f:"primaryDx" }, { f:"additionalDx" }, { f:"excludedDx" },
      { t:"— end of extract —" } ],
  ],
  cti: [
    [ { t:"CERTIFICATION OF TERMINAL ILLNESS", type:"title" }, { t:"Physician order · Page 1 of 3", type:"meta" },
      { t:"CERTIFICATION", type:"section" },
      { t:"I CERTIFY THAT THE PATIENT'S PROGNOSIS IS SIX MONTHS OR" },
      { t:"LESS IF THE DISEASE RUNS ITS NORMAL COURSE." },
      { t:"VERBAL CERTIFICATION WAS RECEIVED FROM THE PHYSICIAN" },
      { t:"LISTED ABOVE ON THIS ORDER DATE." },
      { f:"terminalDx" }, { f:"prognosis" }, { f:"verbalCert" } ],
    [ { t:"NARRATIVE — CLINICAL DOMAINS", type:"section" }, { f:"diseaseProgression" }, { f:"functionalStatus" }, { f:"objectiveMeasures" },
      { t:"TERMINAL DIAGNOSIS: CHRONIC OBSTRUCTIVE PULMONARY" },
      { t:"DISEASE, UNSPECIFIED." } ],
    [ { t:"SIGNATURES", type:"section" },
      { t:"HOSPICE MEDICAL DIRECTOR MAY ACT AS A SECONDARY" },
      { t:"PHYSICIAN FOR THE PALLIATION OF PATIENT SYMPTOMS AS" },
      { t:"NECESSARY." },
      { t:"— end of document —" } ],
  ],
};
// Which printed page a field appears on — shown beside its source.
function pbPageOf(docKey, key) {
  const spec = PB_PAGE_SPEC[docKey];
  if (!spec) return 1;
  for (let p = 0; p < spec.length; p++) if (spec[p].some(ln => ln.f === key)) return p+1;
  return 1;
}
function pbPagesFor(docKey) {
  const fields = PB_DOC_FIELDS[docKey] || {};
  const spec = PB_PAGE_SPEC[docKey];
  if (spec) return spec.map(page => page.map(ln => {
    if (!ln.f) return ln;
    const f = fields[ln.f] || {};
    return { t: f.label + ": " + pbDocValue(f), field:[docKey, ln.f] };
  }));
  const lines = Object.keys(fields).filter(k=>k!=="title").map(k=>({ t: fields[k].label+": "+pbDocValue(fields[k]), field:[docKey,k] }));
  const perPage = Math.max(1, Math.ceil(lines.length/3));
  const pages = [[],[],[]];
  lines.forEach((ln,i)=>{ pages[Math.min(2,Math.floor(i/perPage))].push(ln); });
  pages[0].unshift({ t:(PB_DOCS[docKey]||{}).label || "Document", type:"title" }, { t:"Confidential medical record · Page 1 of 3", type:"meta" });
  pages[1].unshift({ t:"CONTINUED", type:"section" }, { t:"Page 2 of 3", type:"meta" });
  pages[2].unshift({ t:"ADDITIONAL DOCUMENTATION", type:"section" }, { t:"Page 3 of 3", type:"meta" });
  return pages;
}
// Key of the most recently added annotation — used to anchor the Confirm
// Selection button to that line instead of a fixed corner.
function pbLastAnnotationKey(annotations) {
  const keys = Object.keys(annotations || {});
  if (!keys.length) return null;
  return keys.reduce((best,k)=> annotations[k] > annotations[best] ? k : best, keys[0]);
}
function PBLinedPages({ pages, highlight, only }) {
  const anno = React.useContext(PBAnnotateCtx);
  const search = React.useContext(PBSearchCtx);
  const total = pages.length;
  const list = (typeof only === "number") ? [[pages[only], only]] : pages.map((p,i)=>[p,i]);
  return (
    <div>
      {list.map(([page, pi]) => (
        <div key={pi} data-page={pi} style={{ paddingBottom:(typeof only!=="number" && pi<total-1)?30:0, marginBottom:(typeof only!=="number" && pi<total-1)?26:0, borderBottom:(typeof only!=="number" && pi<total-1)?"2px dashed #c8cfd8":"none" }}>
          {typeof only !== "number" && <div style={{ textAlign:"right", font:"600 10px/14px Roboto", color:"#94a3b8", letterSpacing:".06em", textTransform:"uppercase", marginBottom:8 }}>Page {pi+1} of {total}</div>}
          {page.map((ln, li) => {
            const key = ln.field ? ln.field[0]+"."+ln.field[1] : null;
            const baseN = (key && anno && anno.base) ? anno.base[key] : null;
            const n = key
              ? (anno ? (baseN || (((anno.annotations||{})[key]) ? (anno.tagFor ? (anno.tagFor(anno.annotations[key]) || anno.annotations[key] + (anno.numOffset||0)) : anno.annotations[key] + (anno.numOffset||0)) : null)) : (highlight && highlight[key]))
              : null;
            const hl = !!n;
            const isTitle = ln.type === "title";
            const isSection = ln.type === "section";
            const isMeta = ln.type === "meta";
            const showConfirm = key && anno && anno.confirmNear === key;
            return (
              <React.Fragment key={li}>
                <div title={baseN?"Already annotated as a reference for this rule":undefined} onClick={key && anno && anno.onFieldClick && !baseN ? ()=>anno.onFieldClick(key) : undefined} style={{ display:"flex", alignItems:"baseline", gap:10, padding:hl?"3px 6px":"3px 0", margin:hl?"0 -6px":0, borderRadius:hl?4:0, background:hl?"#FFF6D6":"transparent", outline:hl?"1.5px solid #E2A700":"none", cursor:key&&anno&&!baseN?"pointer":"default" }}>
                  <span style={{ flexShrink:0, width:26, textAlign:"right", font:"400 12px/24px ui-monospace,monospace", color:"#b6bec9" }}>{li+1}</span>
                  <span style={{
                    flex:1, textAlign:"left",
                    font: isTitle ? "700 21px/28px Roboto" : isSection ? "600 18px/24px Roboto" : isMeta ? "400 14px/20px Roboto" : "400 17px/24px Roboto",
                    color: isTitle ? "#111" : isSection ? "#334155" : isMeta ? "#64748b" : "#1a1a1a",
                    textTransform: isSection ? "uppercase" : "none",
                    letterSpacing: isSection ? ".05em" : "normal",
                    borderBottom: isSection ? "1.5px solid #334155" : "none",
                    paddingBottom: isSection ? 3 : 0,
                  }}>{search ? pbMark(ln.t, search) : ln.t}</span>
                  {hl && !(anno && anno.hideNums) && <span style={{ flexShrink:0, background:"#E2A700", color:"#fff", borderRadius:20, padding:"1px 8px", font:"600 10px/14px Roboto" }}>{n}</span>}
                </div>
                {showConfirm && (
                  <div style={{ display:"flex", justifyContent:"flex-end", margin:"6px 0 10px" }}>
                    <button type="button" onClick={anno.onConfirm} style={{background:"#1677FF",border:"none",borderRadius:6,padding:"9px 16px",font:"500 13px/17px Roboto",color:"#fff",cursor:"pointer",boxShadow:"0 6px 16px rgba(22,119,255,.4)"}}>Confirm Selection</button>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      ))}
    </div>
  );
}
// Subtitle/footer for documents rendered by the generic sheet.
const PB_DOC_META = {
  visit:  { sub:"Clinical visit note · Jane Doe · Page 1 of 1",
            footer:"Electronically signed by Karen Ellis, RN on 10/15/2023 at 10:42 AM." },
  roster: { sub:"Agency care team & provider roster · Effective 01/01/2023",
            footer:"Maintained by the agency administrator — last reviewed 10/01/2023." },
};
function PBGenericSheet({ docKey, highlight }) {
  const fields = PB_DOC_FIELDS[docKey] || {};
  const title = (fields.title && fields.title.value) || (PB_DOCS[docKey]||{}).label || "Document";
  return (
    <div>
      <div style={{borderBottom:"2px solid #1a1a1a",paddingBottom:10}}>
        <div style={{font:"700 20px/27px Roboto",color:"#111",textTransform:"uppercase"}}>{title}</div>
        <div style={{font:"400 14px/19px Roboto",color:"#64748b",marginTop:2}}>{PB_DOC_META[docKey] ? PB_DOC_META[docKey].sub : "Confidential medical record · Jane Doe · Page 1 of 1"}</div>
      </div>
      <PBDocHeading>Recorded Values</PBDocHeading>
      {Object.keys(fields).filter(k=>k!=="title").map(k=>(<PBDocField key={k} doc={docKey} k={k} highlight={highlight} />))}
      <div style={{marginTop:22,paddingTop:8,borderTop:"1px solid #d5dae1",font:"400 13px/18px Roboto",color:"#94a3b8"}}>{PB_DOC_META[docKey] ? PB_DOC_META[docKey].footer : "Extracted from the agency EHR on 10/18/2023."}</div>
    </div>
  );
}
function PBHandwrittenSheet({ docKey, scale, paged }) {
  const pages = paged ? pbPagesFor(docKey) : null;
  const PAGE_H = 794*1.4142 - 64;
  const wrap = React.useRef(null);
  const [flash, setFlash] = useF(-1);
  React.useEffect(()=>{
    if (!paged) return;
    const h = (e)=>{ const d=e.detail||{}; if (d.doc!==docKey || !d.page) return;
      const w = wrap.current; if (!w) return;
      const idx = Math.min(pages.length-1, Math.max(0, d.page-1));
      const el = w.querySelector('[data-page="'+idx+'"]');
      let sc = w.parentElement;
      while (sc && sc !== document.body) { const s=getComputedStyle(sc); if (/(auto|scroll)/.test(s.overflowY) && sc.scrollHeight > sc.clientHeight+2) break; sc = sc.parentElement; }
      if (el && sc && sc !== document.body) sc.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 8), behavior:"smooth" });
      setFlash(idx); setTimeout(()=>setFlash(-1), 1400); };
    window.addEventListener("pb-source-jump", h); return ()=>window.removeEventListener("pb-source-jump", h);
  }, [docKey, paged]);
  const fl = (i)=>flash===i ? { outline:"3px solid rgba(22,119,255,.55)", outlineOffset:6, transition:"outline-color .3s" } : {};
  return (
    <div ref={wrap} style={{width:(100/scale)+"%",transform:"scale("+scale+")",transformOrigin:"top left",padding:"30px 34px 34px",boxSizing:"border-box"}}>
      <div data-page={0} style={paged?{minHeight:PAGE_H,boxSizing:"border-box",paddingBottom:18,marginBottom:18,borderBottom:"2px dashed #c8cfd8",...fl(0)}:null}>
        {docKey === "elig" ? <PBEligSheet highlight={{}} />
          : docKey === "ehr" ? <PBEhrSheet highlight={{}} />
          : docKey === "cti" ? <PBCtiSheet highlight={{}} />
          : <PBGenericSheet docKey={docKey} highlight={{}} />}
      </div>
      {paged && pages.slice(1).map((lines,i)=>(
        <div key={i} data-page={i+1} style={{minHeight:PAGE_H,boxSizing:"border-box",paddingBottom:i<pages.length-2?18:0,marginBottom:i<pages.length-2?18:0,borderBottom:i<pages.length-2?"2px dashed #c8cfd8":"none",...fl(i+1)}}>
          {lines.map((ln,li)=>{
            if (ln.type === "title") return <div key={li} style={{font:"700 20px/27px Roboto",color:"#111",textTransform:"uppercase",borderBottom:"2px solid #1a1a1a",paddingBottom:10}}>{ln.t}</div>;
            if (ln.type === "meta") return <div key={li} style={{font:"400 13px/18px Roboto",color:"#94a3b8",marginTop:4,marginBottom:6}}>{ln.t}</div>;
            if (ln.type === "section") return <PBDocHeading key={li}>{ln.t}</PBDocHeading>;
            if (ln.field) return <PBDocField key={li} doc={ln.field[0]} k={ln.field[1]} highlight={{}} />;
            return <div key={li} style={{font:"400 15px/21px Roboto",color:"#334155",padding:"4px 0"}}>{ln.t}</div>;
          })}
        </div>
      ))}
    </div>
  );
}
// Renders the sheet at a fixed A4 layout width (794px) and scales it to the
// frame, so zooming magnifies the same page instead of reflowing the text.
const PBFitCtx = React.createContext({ mode:"page", panes:1 });
const PBSearchCtx = React.createContext("");
function pbMark(text, q){
  const t = String(text||""); const n = String(q||"").trim(); if (!n) return t;
  const lo = t.toLowerCase(), nl = n.toLowerCase(); const out = []; let i = 0, j;
  while ((j = lo.indexOf(nl, i)) >= 0) { if (j>i) out.push(t.slice(i,j)); out.push(<mark key={j} data-pb-hit="" style={{background:"#FFE58F",color:"inherit",borderRadius:2,padding:"0 1px"}}>{t.slice(j,j+n.length)}</mark>); i = j + n.length; }
  if (i < t.length) out.push(t.slice(i));
  return out;
}
function PBFitBox({ zoom, maxHeight, style, scrollable, fitMode, children }) {
  const outer = React.useRef(null);
  const inner = React.useRef(null);
  const BASE = 794;
  const fitCtx = React.useContext(PBFitCtx);
  const winMode = (fitMode || (fitCtx && fitCtx.mode)) === "window";
  const [avail, setAvail] = useF(0);
  React.useEffect(()=>{
    if (!winMode) return;
    const m = ()=>{ const el = outer.current; const pane = el && el.parentElement && el.parentElement.closest(".pb-thin-scroll"); if (!pane) return;
      const n = Math.max(1, fitCtx.panes||1); const w = Math.floor((pane.clientWidth - 28 - 14*(n-1)) / n); setAvail(a => Math.abs(a-w) < 1 ? a : w); };
    m(); const t = setTimeout(m, 60); window.addEventListener("resize", m);
    let ro = null; const pane = outer.current && outer.current.parentElement && outer.current.parentElement.closest(".pb-thin-scroll");
    if (typeof ResizeObserver !== "undefined" && pane) { ro = new ResizeObserver(m); ro.observe(pane); }
    return ()=>{ clearTimeout(t); window.removeEventListener("resize", m); if (ro) ro.disconnect(); };
  }, [winMode, fitCtx.panes]);
  const [box, setBox] = useF({ w:0, h:1123 });
  React.useEffect(()=>{
    let raf = 0;
    const measure = ()=>{
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{
        if (!outer.current) return;
        const w = outer.current.clientWidth;
        const h = inner.current ? Math.max(BASE*1.4142, inner.current.scrollHeight) : BASE*1.4142;
        setBox(b => (Math.abs(b.w-w) < 0.5 && Math.abs(b.h-h) < 1) ? b : { w, h });
      });
    };
    measure();
    const t1 = setTimeout(measure, 80), t2 = setTimeout(measure, 300);
    // outer only — observing the scaled content too can trip the observer's
    // loop guard and silently stop all further callbacks
    let ro = null;
    if (typeof ResizeObserver !== "undefined" && outer.current) { ro = new ResizeObserver(measure); ro.observe(outer.current); }
    const poll = setInterval(measure, 500);
    window.addEventListener("resize", measure);
    return ()=>{ cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2); clearInterval(poll); if (ro) ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  const fit = box.w ? box.w / BASE : 1;
  const k = fit * (zoom || 1);
  return (
    <div ref={outer} className="pb-thin-scroll" style={{background:"#fff",boxShadow:"0 3px 10px rgba(0,0,0,.12)",overflow:"auto",aspectRatio:"1 / 1.4142",height:"100%",maxHeight:BASE*1.4142,width:"auto",minWidth:0,maxWidth:"100%",flexShrink:0,margin:"0 auto",...(winMode && avail ? { aspectRatio:"auto", width:avail, maxWidth:"none", maxHeight:"none" } : null),...(style||null)}}>
      <div style={{width:BASE*k,height:box.h*k}}>
        <div ref={inner} style={{width:BASE,transform:"scale("+k+")",transformOrigin:"top left"}}>{children}</div>
      </div>    </div>
  );
}
function PBDocSheet({ docKey, label, scale, highlight }) {
  const pages = pbPagesFor(docKey);
  // land on the page the selected rule was actually read from
  const target = React.useMemo(()=>{
    const keys = Object.keys(highlight||{});
    if (!keys.length) return 0;
    for (let p=0;p<pages.length;p++) if (pages[p].some(ln=>ln.field && keys.includes(ln.field[0]+"."+ln.field[1]))) return p;
    return 0;
  }, [docKey, JSON.stringify(Object.keys(highlight||{}))]);
  const [page, setPage] = useF(target);
  const wrap = React.useRef(null);
  // all pages render in one continuous scroll; the target page is scrolled to
  const scrollToPage = (idx)=>{
    const w = wrap.current; if (!w) return;
    const el = w.querySelector('[data-page="'+idx+'"]');
    let sc = w.parentElement;
    while (sc && sc !== document.body) { const s=getComputedStyle(sc); if (/(auto|scroll)/.test(s.overflowY) && sc.scrollHeight > sc.clientHeight+2) break; sc = sc.parentElement; }
    if (el && sc && sc !== document.body) sc.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 8), behavior:"smooth" });
  };
  React.useEffect(()=>{ setPage(target); const t=setTimeout(()=>scrollToPage(target), 160); return ()=>clearTimeout(t); }, [target, docKey]);
  const p = Math.min(pages.length-1, Math.max(0, page));
  const navBtn = (dis)=>({display:"inline-flex",alignItems:"center",justifyContent:"center",width:22,height:22,borderRadius:5,border:"1px solid #d8dee6",background:"#fff",color:dis?"#c6ced9":"#475569",font:"500 13px/1 Roboto",cursor:dis?"default":"pointer",padding:0});
  const jump = (idx)=>{ setPage(idx); scrollToPage(idx); };
  React.useEffect(()=>{
    const h = (e)=>{ const d=e.detail||{}; if (d.doc && d.doc!==docKey) return;
      let idx = d.key ? pages.findIndex(pg=>pg.some(ln=>ln.field && ln.field[0]+"."+ln.field[1]===d.key)) : -1;
      if (idx<0 && d.page) idx = d.page-1;
      if (idx>=0) jump(Math.min(pages.length-1, idx)); };
    window.addEventListener("pb-source-jump", h); return ()=>window.removeEventListener("pb-source-jump", h);
  }, [docKey, pages]);
  const PAGE_H = 794*1.4142 - 64; // one A4 page inside the frame's padding
  return (
    <div ref={wrap} style={{width:(100/scale)+"%",transform:"scale("+scale+")",transformOrigin:"top left",padding:"30px 34px 34px",boxSizing:"border-box"}}>
      <div style={{position:"sticky",top:0,zIndex:4,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6,padding:"2px 0 6px",background:"#fff"}} onClick={(e)=>e.stopPropagation()}>
        <button type="button" disabled={p===0} onClick={()=>jump(p-1)} style={navBtn(p===0)}>‹</button>
        {pages.map((_,i)=>(
          <button key={i} type="button" onClick={()=>jump(i)} title={"Scroll to page "+(i+1)}
            style={{...navBtn(false),width:"auto",padding:"0 8px",background:i===p?"#1677FF":"#fff",color:i===p?"#fff":"#475569",borderColor:i===p?"#1677FF":"#d8dee6",font:"500 11px/1 Roboto"}}>{i+1}</button>
        ))}
        <button type="button" disabled={p===pages.length-1} onClick={()=>jump(p+1)} style={navBtn(p===pages.length-1)}>›</button>
      </div>
      {pages.map((_,i)=>(
        <div key={i} data-page={i} style={{minHeight:PAGE_H,boxSizing:"border-box",paddingBottom:i<pages.length-1?18:0,marginBottom:i<pages.length-1?18:0,borderBottom:i<pages.length-1?"2px dashed #c8cfd8":"none"}}>
          <PBLinedPages pages={pages} highlight={highlight} only={i} />
        </div>
      ))}
    </div>
  );
}
const PB_AUDIT_GROUPS = [
  { key:"TC", label:"TC", rows:[
    { indicator:"Medicare Eligibility Verification completed and Uploaded into EHR", value:"Verification on file \u2014 completed 6 hrs after admission", valueUnmet:"Verification late \u2014 41 hrs after admission, exceeds 24 hr limit", matches:"Unmet", docs:["elig","ehr"] },
    { indicator:"Beneficiary name on the eligibility file matches the EHR", value:"Jane Doe \u2014 match", valueUnmet:"Name mismatch \u2014 Eligibility: Jane Doe | EHR: Jane Do", matches:"Met", docs:["elig","ehr"] },
    { indicator:"Date of birth on the eligibility file matches the EHR", value:"03/07/1941 \u2014 match", valueUnmet:"DOB mismatch \u2014 Eligibility: 03/07/1941 | EHR: 07/03/1941", matches:"Met", docs:["elig","ehr"] },
    { indicator:"Medicare Beneficiary Identifier matches the EHR payer record", value:"1EG4TE5MK72 \u2014 match, 11-character format valid", valueUnmet:"MBI mismatch \u2014 Eligibility: 1EG4TE5MK71 | EHR: 1EG4TE5MK72", matches:"Met", docs:["elig","ehr"] },
    { indicator:"Benefit period sequence and dates match the eligibility file", value:"Benefit Period 1 \u2014 01/01/2023 to 03/31/2023 \u2014 match", valueUnmet:"Benefit period mismatch \u2014 Eligibility: BP1 01/01/2023\u201303/31/2023 | EHR: BP1 01/01/2023\u201303/31/2024", matches:"Unmet", docs:["elig","ehr"] },
    { indicator:"Gender on the eligibility file matches the EHR", value:"F \u2014 match", valueUnmet:"Gender mismatch \u2014 Eligibility: F | EHR: M", matches:"Met", docs:["elig","ehr"] },
    { indicator:"Start Of Care is accurate and supported by the RN admission visit date", value:"10/15/2023 \u2014 matches RN admission visit", valueUnmet:"Date mismatch \u2014 EHR SOC: 10/14/2023 | RN admission visit date: 10/15/2023", matches:"Met", docs:["visit"] },
    { indicator:"Hospice Medical Director is identified on the record", value:"Robert Brown, MD \u2014 NPI 1234567890", valueUnmet:"No Medical Director assigned on the record", matches:"Unmet", docs:["roster"] },
    { indicator:"Patient has an open election form", value:"Open election form on file", valueUnmet:"No open election form — on service with Other Agency", matches:"Unmet", docs:["ehr"] },
    { indicator:"More than one valid ICD-10 diagnosis is coded", value:"3 qualifying codes \u2014 meets minimum of 2", valueUnmet:"Only 1 qualifying code \u2014 minimum of 2 not met (F03.90 excluded from count)", matches:"Met", docs:["ehr"] },
  ]},
  { key:"DCS", label:"DCS", rows:[
    { indicator:"CTI Narrative supports terminal prognosis with measurable decline", value:"Supports prognosis \u2014 decline evidenced in functional status, nutrition and disease progression", valueUnmet:"Indeterminate \u2014 functional status addressed; no objective measures or prognosis rationale", matches:"Met", docs:["cti"] },
  ]},
];
// A fully-compliant patient has every indicator Met; otherwise the base set applies.
function pbGroupsFor(row) {
  if (!row || row.met === false) return PB_AUDIT_GROUPS;
  return PB_AUDIT_GROUPS.map(g => ({ ...g, rows: g.rows.map(r => ({ ...r, matches:"Met" })) }));
}

// Which team the signed-in user belongs to — their accordion opens by default.
const PB_USER_TEAM = "TC";

// Same indicators, regrouped by the source document they were read from. A
// criterion backed by two documents appears under each — so an auditor working
// one document sees every criterion it has to satisfy, whatever the role.
function pbGroupByDocument(groups) {
  const buckets = new Map();
  groups.forEach(g => g.rows.forEach(r => {
    (r.docs && r.docs.length ? r.docs : ["unlinked"]).forEach(dk => {
      if (!buckets.has(dk)) buckets.set(dk, []);
      buckets.get(dk).push({ ...r, team: g.key });
    });
  }));
  return [...buckets.entries()].map(([dk, rows]) => ({
    key: dk,
    label: (PB_DOCS[dk] && PB_DOCS[dk].label) || "Not linked to a document",
    rows,
  }));
}

const PB_ROW_GRID = "14px 42px minmax(0,1.15fr) minmax(0,0.8fr) 50px 92px";
const PB_ROW_GRID_COMPACT = "14px minmax(0,1.05fr) minmax(0,0.7fr) 44px 88px";

// Functional-section grouping — provisional buckets until the section list is
// supplied; a rule that matches nothing lands in "Other Requirements".
const PB_SECTIONS = [
  { key:"Eligibility & Coverage", match:/eligib|medicare|coverage|payer|insur/i },
  { key:"Physician Orders & Certification", match:/order|certif|physician|signature|sign/i },
  { key:"Face-to-Face Encounter", match:/face.to.face|f2f|encounter/i },
  { key:"Clinical Documentation", match:/diagnos|icd|assessment|oasis|plan of care|visit|clinical/i },
  { key:"Billing & Claim Readiness", match:/bill|claim|charge|revenue|code/i },
];
function pbGroupByFunction(groups) {
  const buckets = new Map();
  PB_SECTIONS.forEach(s=>buckets.set(s.key, []));
  buckets.set("Other Requirements", []);
  groups.forEach(g => g.rows.forEach(r => {
    const hit = PB_SECTIONS.find(s => s.match.test(r.indicator || ""));
    buckets.get(hit ? hit.key : "Other Requirements").push({ ...r, team: g.key });
  }));
  return [...buckets.entries()].filter(([,rows])=>rows.length).map(([key,rows])=>({ key, label:key, rows }));
}
function PBMatchPill({ value, source }) {
  const met = value === "Met";
  const src = !met ? pbIcon("icons/pb-unmet-ai.svg") : source==="user" ? pbIcon("icons/pb-met-user.svg") : pbIcon("icons/pb-met-ai.svg");
  const title = value + (source==="user" ? " \u00b7 auditor reviewed" : " \u00b7 AI detected");
  return <img src={src} alt={value} title={title} style={{height:24,width:"auto",display:"block",objectFit:"contain"}} />;
}

// Short forms used by the selected-row strip — the long text stays in the log.
const PB_BRIEF = {};

// Merged row that opens under the selected indicator: the rule, what each
// source document actually said, and how the comparison came out.
function PBEvidenceStrip({ row, compact, onResolve, resolvedInfo, onEdit }) {
  const ev = pbEvidenceFor(row);
  if (!ev) return null;
  const brief = PB_BRIEF[row.indicator] || {};
  const met = ev.met;
  const accent = met ? "#2E9E4A" : "#C0392B";
  const G = "22px minmax(0,1.05fr) minmax(0,1fr) minmax(0,1fr)";
  const th = { font:"500 10px/14px Roboto", color:"#8a95a3", textTransform:"uppercase", letterSpacing:".04em" };
  const td = { font:"400 12px/17px Roboto", color:"#333", minWidth:0, overflow:"hidden", textOverflow:"ellipsis" };
  return (
    <div style={{position:"relative",zIndex:3,borderBottom:"0.5px solid rgba(28,45,66,.17)",background:"#fff",boxShadow:"0 10px 22px rgba(15,23,42,.054)",padding:"11px 12px 12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:9,borderTop:"1px solid #d8dee7",marginTop:-2,paddingTop:10}}>
        <div style={{font:"500 12px/17px Roboto",color:"#475569",minWidth:0,flex:"1 1 auto"}}>How this result was calculated</div>
      </div>
      <PBViewTable onEdit={onEdit} hint={brief.howToResolve} items={pbSubCriteriaFor(row).map(q=>({ ...q, sources: q.logic ? null : pbRefsForSub(q, (ev.sources||[]).map((f,k)=>({ f, k })), x=>x.k).map(x=>x.f) }))} />
    </div>
  );
}
// Read-only calculation table: one row per annotated sub-field, grouped by
// question. Reference is shortened; hovering shows the full annotated line.
function pbShortValue(line){ const parts = String(line||"").split(" - "); return parts.length > 1 ? parts.slice(1).join(" · ") : line; }
// Parameter = the field being checked, never "A vs B". Strip source prefixes and dedupe.
const PB_DOC_KEY_BY_LABEL = { "Medicare Eligibility Verification":"elig", "EHR — Patient Record":"ehr", "EHR — Election of Benefits":"ehr", "RN Admission Visit Note":"visit", "Care Team Roster":"roster", "Care Team & Provider Roster":"roster", "CTI Narrative":"cti", "Certification of Terminal Illness":"cti" };
// Line within the page the value was read from: exact for field-keyed refs, stable otherwise.
function pbLineNo(tg){
  if (tg.docKey && tg.key) { const pages = pbPagesFor(tg.docKey); for (let p=0;p<pages.length;p++){ const i = pages[p].findIndex(ln=>ln.field && ln.field[1]===tg.key); if (i>=0) return i+1; } }
  let h = 0; const str = String(tg.label||"")+"|"+String(tg.doc||""); for (let i=0;i<str.length;i++) h = (h*31 + str.charCodeAt(i))>>>0;
  return 6 + (h % 22);
}
function pbOpenSource(doc, page, key){ if(!doc) return; window.dispatchEvent(new CustomEvent("pb-doc-open",{ detail:{ doc, page, key } })); }
function pbParamName(labels){
  const strip = l=>String(l||"").replace(/^(Eligibility|EHR Payer|EHR|Payer|RN|CTI|Roster)\s+/i,"").replace(/\bDOB\b/,"Date of Birth").trim();
  const u = [...new Set(labels.map(strip).filter(Boolean))];
  return u[0] || "—";
}
function pbViewParams(q){
  const docName = (d)=>(PB_DOCS[d]&&PB_DOCS[d].label)||d;
  if (q.list) {
    const docs = q.list.docs, n = Math.max(...docs.map(d=>d.values.length));
    return [{ name:q.list.name, general:true, items:Array.from({length:n},(_,k)=>docs.map(d=>({ value:d.values[k]||"—", doc:d.src, docKey:PB_DOC_KEY_BY_LABEL[d.src], page:d.page, line:d.label+" - "+(d.values[k]||"Not found") }))) }];
  }
  const tags = q.logic
    ? (q.slotTexts||[]).map((t,k)=>({ label:(q.slotLabels&&q.slotLabels[k])||("Field "+(k+1)), value:pbShortValue(t), doc:((q.slotSrc&&q.slotSrc[k])||{}).src, docKey:PB_DOC_KEY_BY_LABEL[((q.slotSrc&&q.slotSrc[k])||{}).src], page:((q.slotSrc&&q.slotSrc[k])||{}).page, line:t }))
    : (q.sources||[]).map(f=>({ label:f.label, value:f.value, doc:docName(f.doc), docKey:f.doc, key:f.key, page:1, line:f.label+" - "+f.value }));
  if (!tags.length) return [];
  return [{ name:q.param||pbParamName(tags.map(t=>t.label)), general:false, items:[tags] }];
}
function PBTagPopup({ tag, rect, onClose }) {
  const ref = React.useRef(null);
  React.useEffect(()=>{
    const down=(e)=>{ if(ref.current && !ref.current.contains(e.target) && !(e.target.closest && e.target.closest("[data-pb-tag]"))) onClose(); };
    const sc=(e)=>{ if(ref.current && ref.current.contains(e.target)) return; onClose(); };
    document.addEventListener("mousedown",down); window.addEventListener("scroll",sc,true);
    return ()=>{ document.removeEventListener("mousedown",down); window.removeEventListener("scroll",sc,true); };
  }, []);
  const W = 300, left = Math.max(12, Math.min(window.innerWidth-W-12, rect.left));
  const below = rect.bottom + 180 < window.innerHeight;
  return ReactDOM.createPortal(
    <div ref={ref} onClick={(e)=>e.stopPropagation()} style={{position:"fixed",left,top:below?rect.bottom+6:rect.top-6,transform:below?"none":"translateY(-100%)",width:W,background:"#fff",border:"1px solid #dfe4ea",borderRadius:6,boxShadow:"0 12px 28px rgba(15,23,42,.18)",padding:"10px 12px",zIndex:2147483000,display:"flex",flexDirection:"column",gap:6,textAlign:"left"}}>
      <div style={{display:"flex",flexDirection:"column",gap:1}}>
        <span style={{font:"500 12px/17px Roboto",color:"#1f2937"}}>{tag.doc || "—"}</span>
        {tag.page && <span style={{font:"400 11px/15px Roboto",color:"#64748b"}}>Page {tag.page}</span>}
      </div>
      <div style={{font:"400 12px/17px Roboto",color:"#333",background:"#F5F7FA",border:"1px solid #eceff3",borderRadius:4,padding:"6px 8px",overflowWrap:"anywhere"}}>{tag.line}</div>
    </div>, document.body);
}
function PBViewTable({ items, onEdit, hint }) {
  const G = "minmax(180px,1.1fr) minmax(130px,0.8fr) 340px 84px";
  const GAP = 16;
  const th = { font:"500 10px/14px Roboto", color:"#8a95a3", textTransform:"uppercase", letterSpacing:".04em", textAlign:"left" };
  const isLogic = items.some(x=>x.logic);
  const allMet = isLogic ? !!(items[0]&&items[0].ruleMet) : items.every(x=>x.met);
  const [pop, setPop] = useF(null);
  const cell = { font:"400 12px/17px Roboto", color:"#333", minWidth:0, overflowWrap:"anywhere", textAlign:"left" };
  const norm = (v)=>String(v||"").trim().toLowerCase();
  const [openQ, setOpenQ] = useF(()=>{ const o={}; items.forEach((q,i)=>{ if (!q.na && !q.met) o[i]=true; }); return o; });
  const thc = { ...th, padding:"6px 10px", borderRight:"1px solid #dfe4ea" };
  return (
    <div style={{background:"#fff",border:"1px solid #dfe4ea",borderRadius:5,overflow:"hidden"}}>
      {items.map((q,qi)=>{
        const params = pbViewParams(q);
        const answer = q.logic ? (q.na ? "N/A" : (q.answer||"—")) : (q.met ? "Met" : "Unmet");
        const pass = !q.na && !!q.met;
        const tag = q.na ? { bg:"#f1f5f9", bd:"#e2e8f0", c:"#64748b" } : pass ? { bg:"#EFFCEF", bd:"#9ecfa6", c:"#2E7D32" } : { bg:"#FFEDEC", bd:"#f6c9c4", c:"#C0392B" };
        const rows = q.na ? [] : params.flatMap((pr,pi)=>pr.items.map((tags,ii)=>({ name: ii===0 ? pr.name : "", key:pi+"-"+ii, tags })));
        const docs = []; rows.forEach(r=>r.tags.forEach(tg=>{ const d = tg.doc || "Source"; if (!docs.includes(d)) docs.push(d); }));
        const TG = "30% 30% minmax(0,1fr)";
        const open = !!openQ[qi];
        let t = 0;
        return (
          <div key={qi} style={{borderTop:qi?"1px solid #dfe4ea":"none"}}>
            <div onClick={()=>setOpenQ(o=>({ ...o, [qi]:!o[qi] }))} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#FAFBFD",cursor:"pointer"}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{flexShrink:0,transform:open?"rotate(90deg)":"none",transition:"transform .15s"}}><path d="M9 6l6 6-6 6" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{minWidth:0,font:"500 12px/17px Roboto",color:q.na?"#94a3b8":"#1f2937"}}>{q.label}</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:6}} onClick={(e)=>e.stopPropagation()}>
                {!q.na && !pass && <PBResolveHint boxed text={hint || "Open Edit, review the source document, and update or annotate the correct value — then use Resolve Findings once it's fixed."} />}
                {onEdit && <button type="button" title={"Edit this "+(q.logic?"question":"field")} onClick={(e)=>{ e.stopPropagation(); onEdit(qi); }} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:24,height:24,background:"#fff",border:"1px solid #dfe4ea",borderRadius:5,padding:0,color:"#64748b",cursor:"pointer",lineHeight:0}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/></svg>
                </button>}
              </span>
              <span style={{marginLeft:"auto",flexShrink:0}} onClick={(e)=>e.stopPropagation()}>
                <PBWhyTip text={q.na ? null : pass ? null : (q.logic ? "Declared unmet because the decision is \u201c"+answer+"\u201d"+((q.pass&&q.pass.length) ? ", but this question needs \u201c"+q.pass.join("\u201d or \u201c")+"\u201d to pass." : ".") : "Declared unmet because the value found doesn\u2019t satisfy this sub-criterion.")}><span style={{display:"inline-flex",alignItems:"center",gap:4,background:tag.bg,border:"1px solid "+tag.bd,color:tag.c,borderRadius:20,padding:"1px 9px",font:"500 11px/16px Roboto",whiteSpace:"nowrap",cursor:(!q.na&&!pass)?"help":"default"}}>{answer}</span></PBWhyTip>
              </span>
            </div>
            {open && (
              <div style={{padding:"4px 12px 12px 34px",background:"#FAFBFD"}}>
                {rows.length === 0 ? (
                  <div style={{...cell,color:"#94a3b8",fontStyle:q.na?"italic":"normal",padding:"4px 0"}}>{q.na ? (q.naNote || "Not required") : "No reference annotated"}</div>
                ) : (
                  <div style={{border:"1px solid #dfe4ea",borderRadius:4,overflow:"hidden",background:"#fff"}}>
                    <div style={{display:"grid",gridTemplateColumns:TG,background:"#F5F7FA",borderBottom:"1px solid #dfe4ea"}}>
                      <div style={{...thc}}>Parameter</div>
                      <div style={{...thc}}>Document Name</div>
                      <div style={{...thc,borderRight:"none"}}>Value Found</div>
                    </div>
                    {(()=>{ const flat = rows.flatMap(r=>r.tags.map((tg,k)=>({ name: k===0 ? r.name : "", tg, key:r.key+"-"+k })));
                      const groups = []; flat.forEach((x,i)=>{ if (!groups.length || (x.name && x.name!==groups[groups.length-1].name)) groups.push({ name:x.name, key:x.key, items:[] }); groups[groups.length-1].items.push(x); });
                      return groups; })().map((g,gi)=>{
                      const clamp = {display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden",overflowWrap:"anywhere"};
                      return (
                        <div key={g.key} style={{display:"grid",gridTemplateColumns:TG,borderTop:gi?"1px solid #e5e9ef":"none"}}>
                          <div title={g.name || undefined} style={{...cell,color:"#64748b",padding:"7px 10px",borderRight:"1px solid #eceff3",gridColumn:1,gridRow:"1 / span "+g.items.length}}><span style={clamp}>{g.name}</span></div>
                          {g.items.map((x,k)=>{
                            const id = (qi+1)+String.fromCharCode(97+(t++)); const on = pop && pop.tag.id===id;
                            const bt = k ? "1px solid #f1f4f7" : "none";
                            return (
                              <React.Fragment key={x.key}>
                                <div style={{...cell,color:"#475569",padding:"7px 10px",borderRight:"1px solid #eceff3",borderTop:bt,display:"flex",flexDirection:"column",gap:2,gridColumn:2,gridRow:k+1}}>
                                  <span title={x.tg.doc || undefined} style={clamp}>{x.tg.doc || "—"}</span>
                                  {x.tg.page && <span role="link" tabIndex={0} title="Show in document preview" onClick={(e)=>{ e.stopPropagation(); pbOpenSource(x.tg.docKey||PB_DOC_KEY_BY_LABEL[x.tg.doc], x.tg.page, x.tg.key); }} style={{alignSelf:"flex-start",font:"400 11px/15px Roboto",color:"#1677FF",textDecoration:"underline",textUnderlineOffset:2,cursor:"pointer",whiteSpace:"nowrap"}}>Page {x.tg.page}</span>}
                                </div>
                                <div style={{padding:"4px 6px",minWidth:0,borderTop:bt,gridColumn:3,gridRow:k+1}}>
                                  <div style={{padding:"2px 4px",font:"500 12px/17px Roboto",color:"#0f172a",overflowWrap:"anywhere",textWrap:"pretty"}}>{x.tg.value}</div>
                                </div>
                              </React.Fragment>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      {pop && <PBTagPopup key={pop.tag.id} tag={pop.tag} rect={pop.rect} onClose={()=>setPop(null)} />}
    </div>
  );
}
function PBWhyTip({ text, children, heading }) {
  const [pos, setPos] = useF(null);
  if (!text) return children;
  return (
    <span onMouseEnter={(e)=>{ const b=e.currentTarget.getBoundingClientRect(); setPos({ top:b.top-8, left:b.left+b.width/2 }); }} onMouseLeave={()=>setPos(null)} style={{display:"inline-flex"}}>
      {children}
      {pos && ReactDOM.createPortal(
        <span style={{position:"fixed",top:pos.top,left:pos.left,transform:"translate(-50%,-100%)",background:"#1f2937",color:"#fff",borderRadius:6,padding:"8px 11px",font:"400 11.5px/16px Roboto",width:230,boxShadow:"0 10px 24px rgba(15,23,42,.25)",zIndex:2147483000,pointerEvents:"none"}}>
          <span style={{display:"block",fontWeight:600,marginBottom:3}}>{heading || "Why unmet"}</span>
          {text}
        </span>, document.body)}
    </span>
  );
}
function PBResolveHint({ text, boxed }) {
  const [open, setOpen] = useF(false);
  const ref = React.useRef(null);
  const [pos, setPos] = useF({ top:0, left:0 });
  const show = ()=>{
    const el = ref.current;
    if (el) { const b = el.getBoundingClientRect(); setPos({ top:b.top - 10, left:b.left + b.width/2 }); }
    setOpen(true);
  };
  return (
    <span ref={ref} style={{position:"relative",flexShrink:0,display:"inline-flex"}}>
      <span onClick={(e)=>{ e.stopPropagation(); open ? setOpen(false) : show(); }} onMouseEnter={show} onMouseLeave={()=>setOpen(false)} style={boxed ? {cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",width:24,height:24,background:"#fff",border:"1px solid #dfe4ea",borderRadius:5,lineHeight:0,boxSizing:"border-box"} : {cursor:"pointer",display:"inline-flex"}} title="How to resolve">
        <svg width={boxed?13:15} height={boxed?13:15} viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.2 11.1c.5.3.7.9.7 1.5V16h5v-.4c0-.6.3-1.2.7-1.5A6 6 0 0 0 12 3z" stroke="#E2A700" strokeWidth="1.7" strokeLinejoin="round"/></svg>
      </span>
      {open && ReactDOM.createPortal(
        <span style={{position:"fixed",top:pos.top,left:pos.left,transform:"translate(-50%,-100%)",background:"#1f2937",color:"#fff",borderRadius:6,padding:"9px 12px",font:"400 11.5px/16px Roboto",whiteSpace:"normal",width:240,boxShadow:"0 10px 24px rgba(15,23,42,.25)",zIndex:2147483000,pointerEvents:"none"}}>
          <span style={{display:"block",fontWeight:600,marginBottom:3}}>Dev notes</span>
          Custom "How to resolve" text will be given by the product team.
        </span>, document.body)}
    </span>
  );
}
function PBResolvedTag({ info }) {
  const [hover, setHover] = useF(false);
  if (!info) return null;
  return (
    <span onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} style={{position:"relative",display:"inline-flex",alignItems:"center",gap:4,flexShrink:0,background:"#EFFCEF",border:"1px solid #c7e8c9",color:"#2E9E4A",borderRadius:20,padding:"1px 7px 1px 5px",font:"600 10px/14px Roboto",whiteSpace:"nowrap"}}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M6 21H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h2v10z" fill="#2E9E4A"/><path d="M8 11l3.6-7.2A1.6 1.6 0 0 1 14.6 5l-.7 4.2h4.6A2 2 0 0 1 20.4 12l-1.5 7.4A2 2 0 0 1 17 21H8V11z" fill="#2E9E4A"/></svg>
      Findings Resolved
      {hover && (
        <span style={{position:"absolute",bottom:"calc(100% + 7px)",left:0,background:"#1f2937",color:"#fff",borderRadius:5,padding:"7px 10px",font:"400 11px/16px Roboto",whiteSpace:"nowrap",boxShadow:"0 6px 18px rgba(15,23,42,.24)",zIndex:40}}>
          Findings resolved by {info.by} · {info.at}
          {info.note && <span style={{display:"block",color:"#cbd5e1",maxWidth:280,whiteSpace:"normal"}}>{info.note}</span>}
        </span>
      )}
    </span>
  );
}
function pbRoleColor(k){ return k==="TC" ? "#1677FF" : k==="DSC" || k==="DCS" ? "#0EA5A5" : k==="Billing" ? "#B8860B" : "#64748b"; }
// Flat, ordered list of every indicator row across groups — drives the
// prev/next criteria arrows in the document preview's full-screen mode.
function pbFlattenIndicators(groups) {
  return (groups||[]).flatMap(g => g.rows.map(r => ({ ...r, team: r.team || g.key })));
}
function PBAuditGroup({ group, rowFilter, reviewed, onToggleReviewed, onRequestReview, onEdit, editRow, compact, selected, onSelect, defaultOpen, resolved, onRequestResolve, confirmedRefs, onRemoveRef, flagged, onToggleFlag, hideHeader }) {
  const [open, setOpen] = useF(defaultOpen !== undefined ? defaultOpen : group.key === PB_USER_TEAM);
  const rowPasses = (r)=>{
    if (rowFilter==="unmet") return r.matches==="Unmet";
    if (rowFilter==="resolved") return !!(resolved && resolved[r.indicator]);
    if (rowFilter==="unresolved") return r.matches==="Unmet" && !(resolved && resolved[r.indicator]);
    return true;
  };
  const rows = rowFilter && rowFilter!=="all" ? group.rows.filter(rowPasses) : group.rows;
  const unmet = group.rows.filter(r=>r.matches==="Unmet").length;
  if (rowFilter && rowFilter!=="all" && rows.length===0) return null;
  const teamColor = pbRoleColor(group.key);
  return (
    <div>
      {!hideHeader && <div onClick={()=>{ if(!editRow) setOpen(v=>!v); }} style={{opacity:editRow?0.18:1,pointerEvents:editRow?"none":"auto",display:"flex",alignItems:"center",gap:10,height:52,background:"#F5F7FA",borderTop:"1px solid #d9dee5",borderBottom:"1px solid #d9dee5",padding:"0 14px",cursor:"pointer",userSelect:"none"}}>
        <span style={{fontSize:11,color:"#666673",display:"inline-block",transform:open?"none":"rotate(-90deg)",transition:"transform .15s"}}>▼</span>
        <span style={{font:"600 14px/18px Inter, Roboto",color:"#333340"}}>{group.label}</span>
        <span style={{background:"#fff",border:"1px solid #d9dee5",borderRadius:20,padding:"3px 10px",font:"500 11px/15px Roboto",color:"#475569"}}>{group.rows.length - unmet} met</span>
        {unmet > 0 && <span style={{background:"#FFEDEC",border:"1px solid #f6c9c4",borderRadius:20,padding:"3px 10px",font:"500 11px/15px Roboto",color:"#D6392C"}}>{unmet} unmet</span>}
      </div>}
      {open && rows.map((r,i)=>{
        const isSel = selected && selected.indicator === r.indicator;
        const isEditing = false; // the edit panel floats over the list, so the row itself just dims
        const dimmed = !!editRow;
        return (
          <React.Fragment key={i}>
          <div onClick={()=>{ if(!dimmed) onSelect(isSel ? null : r); }} style={{display:"grid",gridTemplateColumns:compact?PB_ROW_GRID_COMPACT:PB_ROW_GRID,alignItems:"center",gap:compact?12:10,padding:compact?"14px 10px":"14px 10px",borderTop:(isSel&&!dimmed)?"0.5px solid rgba(28,45,66,.17)":"none",borderBottom:(isSel&&!dimmed)?"none":"1px solid #eef1f5",cursor:dimmed?"not-allowed":"pointer",background:isEditing?"#F5F9FF":(isSel&&!dimmed?"#fff":"#F2F4F7"),boxShadow:isEditing?"0 -10px 24px rgba(15,23,42,.10), 0 2px 6px rgba(15,23,42,.05)":(isSel&&!dimmed?(isSel&&!dimmed&&!isEditing ? "0 -8px 18px rgba(15,23,42,.054)" : "0 -8px 18px rgba(15,23,42,.054), 0 10px 22px rgba(15,23,42,.054)"):"none"),borderRadius:isEditing?"10px 10px 0 0":0,margin:isEditing?(compact?"8px 8px 0":"10px 14px 0"):0,border:isEditing?"1px solid #e6ebf1":"none",borderBottom:isEditing?"none":undefined,position:(isEditing||(isSel&&!dimmed))?"relative":"static",zIndex:isEditing?6:(isSel&&!dimmed?4:"auto"),transition:"opacity .16s ease, background .16s ease, margin .16s ease",opacity:dimmed?0.18:1,pointerEvents:dimmed?"none":"auto",userSelect:dimmed?"none":"auto"}}>
            <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",lineHeight:0,color:"#64748b"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{transform:isSel&&!dimmed?"rotate(90deg)":"none",transition:"transform .15s"}}><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            {!compact && <div style={{font:"500 12px/16px Roboto",color:"#333"}}>{r.team || group.key}</div>}
            <div style={{font:(isSel&&!dimmed?"500":"400")+" 13px/18px Roboto",color:isSel&&!dimmed?"#1A2330":"#333",minWidth:0}}>
              <div style={{overflowWrap:"anywhere",textWrap:"pretty"}}>{r.indicator}</div>
            </div>
            <div style={{font:(isSel&&!dimmed?"500":"400")+" 13px/18px Roboto",color:isSel&&!dimmed?"#1A2330":"#333",minWidth:0,overflowWrap:"anywhere",textWrap:"pretty"}}>{pbFoundValue(r)}</div>
            <div style={{display:"flex",justifyContent:"center"}}><PBMatchPill value={r.matches} source={r.reviewSource} /></div>
            <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:8}} onClick={(e)=>e.stopPropagation()}>
              {(r.matches==="Unmet" || (resolved||{})[r.indicator]) ? (()=>{ const info=(resolved||{})[r.indicator];
                const um = group.rows.filter(x=>x.matches==="Unmet");
                const techOnly = !info && r.matches==="Unmet" && um.length>1 && um[um.length-1]===r;
                if (techOnly) return (
                  <PBWhyTip heading="Can't be resolved here" text="This finding can't be resolved by a user. It needs technical intervention — please raise it with the support team.">
                    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:7,cursor:"not-allowed",border:"1px solid #e5e9ef",background:"#f3f5f8",lineHeight:0,opacity:.55}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{display:"block"}}><path d="M7 3h7l4 4v6.5" stroke="#a8b3c2" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 3v4h4" stroke="#a8b3c2" strokeWidth="1.7" strokeLinejoin="round"/><path d="M11 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2" stroke="#a8b3c2" strokeWidth="1.7" strokeLinecap="round"/><path d="M8.5 10h5M8.5 13.5h3" stroke="#a8b3c2" strokeWidth="1.6" strokeLinecap="round"/><path d="M14 18.2l2.1 2.1 4.2-4.3" stroke="#a8b3c2" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  </PBWhyTip>
                );
                return (
                  <span title={info?("Findings resolved by "+info.by+" · "+info.at):"Resolve findings"}
                    onClick={(e)=>{ if (info) return; const rect=e.currentTarget.getBoundingClientRect(); onRequestResolve && onRequestResolve(r, { x:rect.left+rect.width/2, y:rect.top }); }}
                    style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:7,cursor:info?"default":"pointer",border:"1px solid "+(info?"#9ecfa6":"#dfe4ea"),background:info?"#EFFCEF":"#fff",lineHeight:0}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{display:"block"}}><path d="M7 3h7l4 4v6.5" stroke={info?"#2E9E4A":"#8a96a6"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 3v4h4" stroke={info?"#2E9E4A":"#8a96a6"} strokeWidth="1.7" strokeLinejoin="round"/><path d="M11 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2" stroke={info?"#2E9E4A":"#8a96a6"} strokeWidth="1.7" strokeLinecap="round"/><path d="M8.5 10h5M8.5 13.5h3" stroke={info?"#2E9E4A":"#8a96a6"} strokeWidth="1.6" strokeLinecap="round"/><path d="M14 18.2l2.1 2.1 4.2-4.3" stroke={info?"#2E9E4A":"#8a96a6"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                );
              })() : <span style={{width:32,height:32}} />}
              <span title={reviewed[r.indicator]?"Findings Verified — click to clear":"Verify Findings"} onClick={()=>onToggleReviewed(r.indicator)}
                style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:7,cursor:"pointer",border:"1px solid "+(reviewed[r.indicator]?"#9ecfa6":"#dfe4ea"),background:reviewed[r.indicator]?"#EFFCEF":"#fff",lineHeight:0}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{display:"block"}}><circle cx="10.5" cy="10.5" r="6.5" stroke={reviewed[r.indicator]?"#2E9E4A":"#8a96a6"} strokeWidth="1.7"/><path d="M15.5 15.5L20 20" stroke={reviewed[r.indicator]?"#2E9E4A":"#8a96a6"} strokeWidth="1.9" strokeLinecap="round"/><path d="M7.8 10.6l1.9 1.9 3.3-3.4" stroke={reviewed[r.indicator]?"#2E9E4A":"#8a96a6"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
          </div>
          {isSel && !dimmed && !isEditing && <PBEvidenceStrip row={r} compact={compact} resolvedInfo={(resolved||{})[r.indicator]} onEdit={(qi)=>onEdit(typeof qi==="number" ? { ...r, _focusQ: qi } : r)} onResolve={(e)=>{ const rect=e.currentTarget.getBoundingClientRect(); onRequestResolve && onRequestResolve(r, { x:rect.left+rect.width/2, y:rect.top }); }} />}
          {isEditing && null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Reviewer-activity log, derived from the audit indicator set: one field-level
// change per rule, so the log reads as an edit history of the source document.
function pbAuditLog(groups) {
  const people = ["Priya Sharma","Fiona Gallagher","Bob Smith","Ethan Hunt","Diana Ross"];
  const stamps = ["05/11/25 09:04 AM","05/11/25 09:06 AM","05/10/25 04:41 PM","05/10/25 04:38 PM","05/09/25 11:12 AM","05/09/25 10:02 AM"];
  const notes  = ["Auto-detected from source document","Reviewer confirmed against election form","Overridden after chart review","Document re-linked to indicator","Flagged for follow-up with the agency"];
  const out = [];
  (groups || PB_AUDIT_GROUPS).forEach(g => g.rows.forEach((r,i) => {
    const ev = pbEvidenceFor(r);
    const src = ((ev && ev.sources) || [])[0];
    out.push({
      team: g.key,
      indicator: r.indicator,
      action: (people[(i + g.key.length) % people.length]==="Priya Sharma") ? "Annotation added" : "Reference edited",
      field: src ? src.label : "—",
      src: notes[(i + g.rows.length) % notes.length],
      prev: r.matches === "Unmet" ? (r.value || "—") : (r.valueUnmet || "—"),
      next: src ? src.value : (r.matches === "Unmet" ? (r.valueUnmet || r.value) : r.value),
      by: people[(i + g.key.length) % people.length],
      at: stamps[(i + g.key.length) % stamps.length],
    });
  }));
  return out;
}

const PB_LOG_GRID = "1.2fr 1.4fr 96px 96px 120px 1.2fr 140px";

function PBAuditLogTable({ indicator, onClear, groups, extra }) {
  const all = (extra||[]).concat(pbAuditLog(groups));
  const rows = indicator ? all.filter(l => l.indicator === indicator) : all;
  // one group per Edit → Save: annotations, reference edits and status change share the auditor's note
  const sets = [];
  rows.forEach(l=>{ const last = sets[sets.length-1]; if (l.sid && last && last.sid===l.sid && last.indicator===l.indicator) last.items.push(l); else sets.push({ sid:l.sid, indicator:l.indicator, items:[l] }); });
  sets.forEach(g=>{ g.items = g.items.slice().reverse(); const sv = g.sid ? g.items.find(x=>x.saved) : null; g.note = sv ? sv.note : ""; g.at = (g.items[0]||{}).at; g.by = (g.items[0]||{}).by; g.open = !sv && g.items.some(x=>x.sid); });
  const hd = {font:"500 11px/14px Roboto",color:"#64748b",padding:"8px 8px",background:"#f8fafc",border:"1px solid #e2e8f0",whiteSpace:"normal",overflowWrap:"anywhere",textAlign:"left",verticalAlign:"bottom"};
  const td = {padding:"8px 8px",border:"1px solid #e2e8f0",font:"400 12px/16px Roboto",color:"#334155",verticalAlign:"top",overflowWrap:"anywhere",wordBreak:"break-word",textWrap:"pretty"};
  const PB_LOG_W = { "Audit Rule":"17%", "Sub Rule":"15%", "Parameter":"11%", "Changed From":"12%", "Changed To":"12%", "Rationale":"15%", "Modified By":"9%", "Modified At":"9%" };
  const tone = (a)=> /notes/i.test(a) ? ["#FFF6E5","#B26A00"] : /added/i.test(a) ? ["#EFFCEF","#2E7D3E"] : /removed/i.test(a) ? ["#FFEDEC","#C0362B"] : /status|resolved/i.test(a) ? ["#EAF2FF","#1677FF"] : ["#F4F6F9","#475569"];
  const actionOf = (l)=> l.action || (/\(annotated\)/.test(l.field||"") ? "Annotation added" : /\(removed\)/.test(l.field||"") ? "Annotation removed" : l.field==="Audit result" ? "Status changed" : "Updated");
  const typeOf = (a)=> /annotation/i.test(a) ? "Annotation" : /reference/i.test(a) ? "Reference" : /criterion|rule field/i.test(a) ? "Criteria" : /notes/i.test(a) ? "Notes" : /status|resolved|saved/i.test(a) ? "Status" : "Reference";
  // the auditor's notes are a transaction of their own, listed after the changes they explain
  sets.forEach(g=>{ g.rows = g.items; });
  for (let i=sets.length-1;i>=0;i--) if (sets[i].open) sets.splice(i,1);
  // Transaction Type says WHAT was touched; Action says WHAT HAPPENED to it
  const verbOf = (a)=> /added/i.test(a) ? "Added" : /removed/i.test(a) ? "Removed" : /edited/i.test(a) ? "Edited" : /resolved/i.test(a) ? "Resolved" : /unchanged/i.test(a) ? "Saved" : "Changed";
  const fieldOf = (l)=> String(l.field||"—").replace(/ \((annotated|removed)\)$/,"");
  // Sub Rule: the sub-criterion / question the change belongs to
  const flatRows = []; (groups || PB_AUDIT_GROUPS).forEach(g=>g.rows.forEach(r=>flatRows.push(r)));
  const subCache = {};
  const subsFor = (ind)=>{ if (!(ind in subCache)) { const r = flatRows.find(x=>x.indicator===ind); subCache[ind] = r ? pbSubCriteriaFor(r) : []; } return subCache[ind]; };
  const subRuleOf = (l)=>{
    if (l.subRule) return l.subRule;
    if (l._note) return "—";
    const subs = subsFor(l.indicator); if (!subs.length) return "—";
    const f = fieldOf(l);
    const hit = subs.find(s=>s.label===f) || subs.find(s=>s.param===f) || subs.find(s=>(s.slotLabels||[]).includes(f));
    if (hit) return hit.label;
    if (typeof l.sub==="number" && subs[l.sub]) return subs[l.sub].label;
    const r = flatRows.find(x=>x.indicator===l.indicator); const ev = r ? pbEvidenceFor(r) : null;
    const k = ((ev&&ev.sources)||[]).findIndex(s=>s.label===f);
    if (k>=0) { const s2 = subs.find(s=>s.refs==null || s.refs.includes(k)); if (s2) return s2.label; }
    return l.field==="Audit result" || /status|saved/i.test(l.action||"") ? "All sub-rules" : subs[0].label;
  };
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,background:"#fff"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px 0"}}>
        <span style={{font:"400 12px/16px Roboto",color:"#94a3b8"}}>Showing for</span>
        <span style={{display:"inline-flex",alignItems:"center",gap:10,background:"#f4f6f9",border:"1px solid #d8dee6",borderRadius:6,padding:"5px 10px",font:"400 12px/16px Roboto",color:"#334155",maxWidth:520}}>
          <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{indicator || "All audit indicators"}</span>
          {indicator && <span onClick={onClear} title="Show all activity" style={{cursor:"pointer",color:"#64748b",fontWeight:600}}>✕</span>}
        </span>
      </div>
      <div className="pb-thin-scroll" style={{flex:1,overflow:"auto",padding:"12px 16px 16px"}}>
        <table style={{borderCollapse:"collapse",width:"100%",tableLayout:"fixed"}}>
          <thead><tr>{["Audit Rule","Sub Rule","Parameter","Changed From","Changed To","Rationale","Modified By","Modified At"].map(h=><th key={h} style={{...hd,width:PB_LOG_W[h]}}>{h}</th>)}</tr></thead>
          {sets.map((g,gi)=>(
            <tbody key={gi} style={{borderTop:gi?"2px solid #cbd5e1":"none"}}>
              {g.rows.map((l,i)=>{ return (
                <tr key={i}>
                  <td style={{...td,color:"#0f172a",fontWeight:500}}>{l.indicator || g.indicator || "—"}</td>
                  <td style={{...td,color:"#334155"}}>{subRuleOf({ ...l, indicator:l.indicator||g.indicator })}</td>
                  <td style={{...td,color:"#475569"}}>{fieldOf(l)}</td>
                  <td style={{...td,color:"#94a3b8"}}>{l.prev || "—"}</td>
                  <td style={{...td,color:"#0f172a",fontWeight:500}}>{l.next || "—"}</td>
                  <td style={td}>{g.sid ? (g.note || "—") : (l.note || l.src || "—")}</td>
                  <td style={td}>{l.by}</td>
                  <td style={{...td,color:"#94a3b8"}}>{l.at}</td>
                </tr>
              ); })}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}

function PBDocumentViewer({ docs, patient, onCloseDrawer, indicator, row, flatRows, onSelectRow, fullScreen, onToggleFullScreen, onClearFilter, groups, logExtra, editRow, annotations, onFieldClick, onConfirm, annotateOn, picking, pickFocus, keyRemap, annotTag }) {
  const highlight = pbHighlightFields(indicator, groups);
  // references the rule already carries — shown highlighted the moment Edit opens
  const editHighlight = (()=>{
    const base = editRow ? pbHighlightFields(editRow.indicator, groups) : {};
    const rm = keyRemap || {};
    const out = {};
    // two references can point at the same line — show both numbers on it
    Object.keys(base).forEach(k=>{ const t = rm[k] || k; out[t] = out[t] ? [].concat(String(out[t]).split(", "), String(base[k])).sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true})).join(", ") : base[k]; });
    return out;
  })();
  const [tab, setTab] = useF(0);
  React.useEffect(()=>{ if (fullScreen) setTab(0); }, [fullScreen]);
  const [showCalc, setShowCalc] = useF(null);
  const [compareMode, setCompareMode] = useF("docs");
  React.useEffect(()=>{ if (docs.length<2 && compareMode==="docs") setCompareMode("original-parsed"); }, [docs.length]);
  const [zooms, setZooms] = useF({});
  // Auditors can swap either pane for any other document in the chart.
  const linked = docs.map(d=>d.key).join("|");
  const [picked, setPicked] = useF(null);
  React.useEffect(()=>{ setPicked(null); }, [linked]);
  const [docMode, setDocMode] = useF("compare");
  const shown = (picked || docs.map(d=>d.key)).map(k=>PB_DOCS[k]).filter(Boolean).slice(0, (docMode==="single" && docs.length>1) ? 1 : undefined);
  const swap = (i, key)=>setPicked(p => { const next = (p || docs.map(d=>d.key)).slice(); next[i] = key; return next; });
  const single = shown.length === 1;
  const [fitMode, setFitMode] = useF("page");
  const [searchOpen, setSearchOpen] = useF(false);
  const [searchQ, setSearchQ] = useF("");
  const parsedRef = React.useRef(null);
  const hitCount = React.useMemo(()=>{ const n = searchQ.trim().toLowerCase(); if (!n || !shown[0]) return 0; let c = 0; pbPagesFor(shown[0].key).forEach(pg=>pg.forEach(ln=>{ const t = String(ln.t||"").toLowerCase(); let i = 0, j; while ((j = t.indexOf(n, i)) >= 0) { c++; i = j + n.length; } })); return c; }, [searchQ, shown[0] && shown[0].key]);
  React.useEffect(()=>{ if (!searchQ.trim()) return; const t = setTimeout(()=>{ const root = parsedRef.current; const hit = root && root.querySelector("[data-pb-hit]"); if (!hit) return;
    let sc = hit.parentElement; while (sc && sc !== root.parentElement) { const st = getComputedStyle(sc); if (/(auto|scroll)/.test(st.overflowY) && sc.scrollHeight > sc.clientHeight+2) break; sc = sc.parentElement; }
    if (sc && sc !== root.parentElement) sc.scrollTo({ top: Math.max(0, hit.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 60), behavior:"smooth" }); }, 120); return ()=>clearTimeout(t); }, [searchQ, shown[0] && shown[0].key]);
  const [fitModes, setFitModes] = useF({});
  const [editView, setEditView] = useF("both");
  const fitOf = (i)=>fitModes[i] || "page";
  const [zoomPop, setZoomPop] = useF(null);
  const ctlBtn = (on)=>({width:26,height:26,borderRadius:4,border:"1px solid "+(on?"#1677FF":"#d8dee6"),background:on?"#EAF3FF":"#fff",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",padding:0,flexShrink:0});
  // per pane: Fit page · Fit to window · Zoom (opens a small popover)
  const viewCtl = (i)=>(
    <span style={{display:"inline-flex",alignItems:"center",gap:4,marginLeft:"auto"}} onClick={(e)=>e.stopPropagation()}>
      <button type="button" title="Fit page" aria-label="Fit page" onClick={()=>{ setFitModes(m=>({ ...m, [i]:"page" })); setZooms(z=>({ ...z, [i]:1 })); }} style={ctlBtn(fitOf(i)==="page")}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="6" y="3" width="12" height="18" rx="1.5" stroke="#475569" strokeWidth="1.8"/><path d="M12 7v10M10 9l2-2 2 2M10 15l2 2 2-2" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <button type="button" title="Fit to window" aria-label="Fit to window" onClick={()=>{ setFitModes(m=>({ ...m, [i]:"window" })); setZooms(z=>({ ...z, [i]:1 })); }} style={ctlBtn(fitOf(i)==="window")}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="1.5" stroke="#475569" strokeWidth="1.8"/><path d="M7 12h10M9 10l-2 2 2 2M15 10l2 2-2 2" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <span style={{position:"relative",display:"inline-flex"}}>
        <button type="button" title={"Zoom · "+Math.round(zoomOf(i)*100)+"%"} aria-label="Zoom" onClick={()=>setZoomPop(p=>p===i?null:i)} style={ctlBtn(zoomPop===i || zoomOf(i)!==1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="#475569" strokeWidth="1.8"/><path d="M16 16l4 4M8.5 11h5M11 8.5v5" stroke="#475569" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
        {zoomPop===i && (
          <React.Fragment>
            <span onClick={()=>setZoomPop(null)} style={{position:"fixed",inset:0,zIndex:30}}></span>
            <span style={{position:"absolute",top:"calc(100% + 6px)",right:0,zIndex:31,display:"inline-flex",alignItems:"center",gap:6,background:"#fff",border:"1px solid #e2e8f0",borderRadius:6,boxShadow:"0 10px 24px rgba(15,23,42,.16)",padding:6,whiteSpace:"nowrap"}}>
              <button type="button" onClick={()=>setZoom(i, z=>z-0.25)} style={zoomBtn}>−</button>
              <span style={{font:"400 12px/16px Roboto",color:"#334155",minWidth:40,textAlign:"center"}}>{Math.round(zoomOf(i)*100)}%</span>
              <button type="button" onClick={()=>setZoom(i, z=>z+0.25)} style={zoomBtn}>+</button>
            </span>
          </React.Fragment>
        )}
      </span>
    </span>
  );
  React.useEffect(()=>{
    const h = (e)=>{ const d=e.detail||{}; if(!d.doc || !PB_DOCS[d.doc]) return;
      setTab(0);
      setPicked(p=>{ const cur=(p || docs.map(x=>x.key)).slice(); if (cur.includes(d.doc)) return p || cur; if (!cur.length) return [d.doc]; cur[0]=d.doc; return cur; });
      setTimeout(()=>window.dispatchEvent(new CustomEvent("pb-source-jump",{ detail:{ doc:d.doc, page:d.page, key:d.key } })), 220); };
    window.addEventListener("pb-doc-open", h); return ()=>window.removeEventListener("pb-doc-open", h);
  }, [linked]);
  const zoomOf = (i)=>zooms[i] || 1;
  const setZoom = (i, fn)=>setZooms(z=>({ ...z, [i]: Math.min(3, Math.max(0.5, +fn(z[i]||1).toFixed(2))) }));
  const zoomBtn = { width:26, height:26, borderRadius:4, border:"1px solid #d8dee6", background:"#fff", cursor:"pointer", font:"500 14px/1 Roboto", color:"#334155" };
  const flat = flatRows || [];
  const curIdx = row ? flat.findIndex(r=>r.indicator===row.indicator) : -1;
  const prevRow = curIdx > 0 ? flat[curIdx-1] : null;
  const nextRow = curIdx > -1 && curIdx < flat.length-1 ? flat[curIdx+1] : null;
  const evidence = row ? pbEvidenceFor(row) : null;
  const navBtn = { width:28, height:28, borderRadius:6, border:"1px solid #d8dee6", background:"#fff", cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#334155", flexShrink:0 };
  return (
    <PBFitCtx.Provider value={{ mode:"page", panes: ((editRow && editView!=="parsed") || (!editRow && fullScreen && compareMode==="original-parsed")) ? 2 : editRow ? 1 : Math.max(1, shown.length) }}>
    <React.Fragment>
      {!fullScreen && <div style={{display:"flex",alignItems:"stretch",background:"#fff",borderBottom:"1px solid #e5e7eb",flexShrink:0}}>
        {[{ label:"Document" }, { label:"Audit Log" }].map((t,i)=>(
          <div key={t.label} onClick={()=>setTab(i)} style={{padding:"8px 18px",cursor:"pointer",borderBottom:`2px solid ${tab===i?"#1677FF":"transparent"}`,background:tab===i?"#F5F9FF":"transparent"}}>
            <div style={{font:`${tab===i?500:400} 13px/18px Roboto`,color:tab===i?"#1677FF":"#334155"}}>{t.label}</div>
          </div>
        ))}
        {tab===0 && docs.length>0 && !editRow && (
          <span title={docs.length<2 ? "Only one document is linked to this rule" : undefined} style={{marginLeft:"auto",alignSelf:"center",marginRight:16,position:"relative",display:"inline-flex",alignItems:"center",gap:4,font:"500 12px/16px Roboto",color:docs.length<2?"#a8b3c2":"#1677FF",cursor:docs.length<2?"not-allowed":"pointer"}}>
            {(docs.length<2 || docMode==="single") ? "Single document mode" : "Comparison mode"}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <select value={docs.length<2 ? "single" : docMode} disabled={docs.length<2} onChange={e=>setDocMode(e.target.value)} style={{position:"absolute",inset:0,opacity:0,cursor:docs.length<2?"not-allowed":"pointer"}}>
              <option value="single">Single document mode</option>
              <option value="compare">Comparison mode</option>
            </select>
          </span>
        )}
      </div>}
      {fullScreen && tab===0 && row && (
        <div style={{position:"relative",display:"flex",alignItems:"center",gap:14,padding:"20px 24px 14px",borderBottom:"1px solid #e5e7eb",background:"#fff",flexShrink:0}}>
          <button type="button" onClick={()=>prevRow && onSelectRow(prevRow)} disabled={!prevRow} style={{...navBtn,opacity:prevRow?1:0.35,cursor:prevRow?"pointer":"default"}} title="Previous criteria">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div style={{flex:1,minWidth:0}}>
            <div style={{font:"600 10px/14px Roboto",color:pbRoleColor(row.team),letterSpacing:".04em",textTransform:"uppercase"}}>{(patient && patient.name) || "Patient"}{patient && patient.mrn ? " · " + patient.mrn : ""} · {row.team} Role</div>
            <div style={{font:"500 13px/18px Roboto",color:"#1a1a1a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.indicator}</div>
            <div style={{font:"400 12px/16px Roboto",color:"#64748b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{evidence ? evidence.rule : row.value}</div>
          </div>
          <span style={{flexShrink:0,background:row.matches==="Met"?"#EFFCEF":"#FFEDEC",color:row.matches==="Met"?"#2E9E4A":"#D6392C",border:`1px solid ${row.matches==="Met"?"#c7e8c9":"#f6c9c4"}`,borderRadius:5,padding:"5px 12px",font:"600 12px/16px Roboto",whiteSpace:"nowrap"}}>{row.matches}</span>
          <button type="button" onClick={()=>setShowCalc(v=>v==="calc"?null:"calc")} title="How this was calculated" style={{...navBtn,color:showCalc==="calc"?"#fff":"#1677FF",background:showCalc==="calc"?"#1677FF":"#fff",borderColor:"#1677FF"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 8v.01M11.2 11h1v5h1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          {row.matches!=="Met" && (
            <button type="button" onClick={()=>setShowCalc(v=>v==="resolve"?null:"resolve")} title="How to resolve" style={{...navBtn,color:showCalc==="resolve"?"#fff":"#E2A700",background:showCalc==="resolve"?"#E2A700":"#fff",borderColor:"#E2A700"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.2 11.1c.5.32.7.66.7 1.15V16h5v-.75c0-.49.2-.83.7-1.15A6 6 0 0 0 12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
          <button type="button" onClick={()=>nextRow && onSelectRow(nextRow)} disabled={!nextRow} style={{...navBtn,opacity:nextRow?1:0.35,cursor:nextRow?"pointer":"default"}} title="Next criteria">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button type="button" onClick={onToggleFullScreen} style={{flexShrink:0,background:"transparent",border:"none",cursor:"pointer",font:"500 12px/16px Roboto",color:"#1677FF"}}>Exit Full Screen</button>
          {onCloseDrawer && <span onClick={onCloseDrawer} title="Close" style={{flexShrink:0,cursor:"pointer",fontSize:20,color:"#64748b"}}>✕</span>}
          {showCalc && evidence && (
            <div style={{position:"absolute",top:"100%",right:20,marginTop:8,width:380,background:"#1f2937",color:"#fff",borderRadius:8,padding:"14px 16px",boxShadow:"0 12px 30px rgba(15,23,42,.3)",zIndex:5,font:"400 12px/18px Roboto"}}>
              <div style={{font:"600 12px/16px Roboto",marginBottom:6}}>{showCalc==="calc" ? "How this result was calculated" : "Dev notes"}</div>
              {showCalc==="calc" ? (
                <React.Fragment>
                  <div style={{color:"#cbd5e1",marginBottom:8}}>{evidence.rule}</div>
                  <ul style={{margin:0,padding:"0 0 0 16px",display:"flex",flexDirection:"column",gap:5}}>
                    {evidence.summary.map((s,i)=><li key={i}>{s}</li>)}
                  </ul>
                </React.Fragment>
              ) : (
                <div style={{color:"#cbd5e1"}}>Custom "How to resolve" text will be given by the product team.</div>
              )}
            </div>
          )}
        </div>
      )}
      {fullScreen && tab===0 && docs.length>0 && !editRow && (
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 20px",borderBottom:"1px solid #e5e7eb",background:"#fafbfc",flexShrink:0}}>
          <span style={{font:"400 12px/16px Roboto",color:"#64748b"}}>View mode:</span>
          {[{id:"docs",label:"Two source documents"},{id:"original-parsed",label:"Scanned original vs. parsed text"}].filter(o=>o.id!=="docs" || docs.length>1).map(o=>(
            <button key={o.id} type="button" onClick={()=>setCompareMode(o.id)} style={{background:compareMode===o.id?"#1677FF":"#fff",color:compareMode===o.id?"#fff":"#334155",border:"1px solid "+(compareMode===o.id?"#1677FF":"#d8dee6"),borderRadius:5,padding:"5px 12px",font:"500 12px/16px Roboto",cursor:"pointer"}}>{o.label}</button>
          ))}
        </div>
      )}
      {tab===0 ? (
        shown.length === 0 ? (
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,padding:32,textAlign:"center"}}>
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none"><path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="#b6c0cd" strokeWidth="1.4"/><path d="M15 2v5h5" stroke="#b6c0cd" strokeWidth="1.4"/><path d="M8 13h8M8 17h5" stroke="#b6c0cd" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <div style={{font:"400 13px/18px Roboto",color:"#94a3b8",maxWidth:320}}>Select a rule on the left to open the document it was audited against.</div>
          </div>
        ) : editRow ? (
          <div className="pb-thin-scroll" style={{flex:1,minHeight:0,overflow:"auto",padding:14,background:"#e9ebef",display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 4px 10px",flexShrink:0}}>
              <span style={{position:"relative",display:"inline-flex",alignItems:"center",gap:5,minWidth:0}} title="Choose the document to compare">
                <span style={{font:"500 13px/18px Roboto",color:"#1a1a1a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{shown[0].label}</span>
                <span style={{fontSize:14,lineHeight:1,color:"#5b6674",flexShrink:0}}>▾</span>
                <select value={shown[0].key} onChange={e=>swap(0, e.target.value)} style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0,cursor:"pointer",border:"none"}}>
                  {Object.keys(PB_DOCS).map(k=>(<option key={k} value={k}>{PB_DOCS[k].label}</option>))}
                </select>
              </span>
              <span style={{width:1,height:16,background:"#cbd5e1",flexShrink:0}}></span>
              <span style={{position:"relative",display:"inline-flex",alignItems:"center",gap:5,minWidth:0}} title="Choose what to show">
                <span style={{font:"500 13px/18px Roboto",color:"#1a1a1a",whiteSpace:"nowrap"}}>{editView==="parsed" ? "Parsed only" : "Parsed + Original"}</span>
                <span style={{fontSize:14,lineHeight:1,color:"#5b6674",flexShrink:0}}>▾</span>
                <select value={editView} onChange={e=>setEditView(e.target.value)} style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0,cursor:"pointer",border:"none"}}>
                  <option value="parsed">Parsed only</option>
                  <option value="both">Parsed + Original</option>
                </select>
              </span>
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
              </div>
            </div>
            <div style={{display:"flex",gap:14,alignItems:"stretch",justifyContent:"center",flex:1,minHeight:0}}>
              <div style={{display:"flex",flexDirection:"column",minWidth:0,height:"100%",minHeight:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",padding:"0 4px 8px",flexShrink:0}}>
                  <span style={{font:"600 10px/14px Roboto",color:"#1677FF",letterSpacing:".04em",textTransform:"uppercase"}}>Parsed</span>
                  {viewCtl(0)}
                  <span style={{display:"inline-flex",alignItems:"center",gap:4}}>
                  <span style={{position:"relative",display:"inline-flex",flexShrink:0}}>
                    <button type="button" title="Search document" aria-label="Search document" onClick={()=>setSearchOpen(true)} style={{...zoomBtn,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:0}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="#475569" strokeWidth="2"/><path d="M16 16l4 4" stroke="#475569" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                    {searchOpen && (
                    <span style={{position:"absolute",top:0,right:0,zIndex:32,display:"inline-flex",alignItems:"center",gap:6,height:26,boxSizing:"border-box",border:"1px solid #1677FF",borderRadius:4,background:"#fff",padding:"0 6px 0 8px",boxShadow:"0 6px 16px rgba(15,23,42,.14)",whiteSpace:"nowrap"}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="#64748b" strokeWidth="2"/><path d="M16 16l4 4" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/></svg>
                      <input autoFocus value={searchQ} onChange={(e)=>setSearchQ(e.target.value)} onKeyDown={(e)=>{ if (e.key==="Escape") { setSearchQ(""); setSearchOpen(false); } }} placeholder="Search document"
                        style={{width:150,border:"none",outline:"none",font:"400 12px/16px Roboto",color:"#0f172a",background:"transparent",padding:0}} />
                      {searchQ.trim() && <span style={{font:"400 11px/16px Roboto",color:hitCount?"#64748b":"#D6392C",whiteSpace:"nowrap"}}>{hitCount ? hitCount+" found" : "No match"}</span>}
                      <span onClick={()=>{ setSearchQ(""); setSearchOpen(false); }} title="Close search" style={{cursor:"pointer",lineHeight:0,padding:2}}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#64748b" strokeWidth="2.6" strokeLinecap="round"/></svg>
                      </span>
                    </span>
                    )}
                  </span>
                  </span>
                </div>
                <div style={{position:"relative",paddingTop:annotateOn?18:0,flex:1,minHeight:0,display:"flex",flexDirection:"column"}}>
                  {annotateOn && (
                  <span style={{position:"absolute",top:18,left:"50%",transform:"translate(-50%,-50%)",zIndex:2,display:"inline-flex",alignItems:"center",gap:6,background:"#1677FF",color:"#fff",borderRadius:999,padding:"5px 14px 5px 10px",font:"600 12px/16px Roboto",whiteSpace:"nowrap",boxShadow:"0 4px 10px rgba(22,119,255,.35)"}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M9 12V6a2 2 0 1 1 4 0v5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/><path d="M13 11V4.5a2 2 0 1 1 4 0V12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/><path d="M17 11.5V8a2 2 0 1 1 4 0v7c0 3.5-2.5 6.5-6.5 6.5h-2c-2.3 0-3.6-.8-4.8-2.3L4 14.8c-.6-.8-.4-1.9.5-2.4.8-.4 1.7-.2 2.3.5L9 15" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Annotate Reference
                  </span>
                  )}
                  <div ref={parsedRef} style={{flex:1,minHeight:0}}>
                    <PBSearchCtx.Provider value={searchQ}>
                    <PBAnnotateCtx.Provider value={(annotateOn || (picking && pickFocus)) ? {annotations: annotateOn ? annotations : {}, tagFor:annotTag, onFieldClick: annotateOn ? onFieldClick : null, base:(picking ? (pickFocus ? { [pickFocus]:1 } : {}) : editHighlight), hideNums:!!picking, numOffset:picking?0:Object.keys(editHighlight).length, confirmNear:pbLastAnnotationKey(annotations), onConfirm:()=>onConfirm && onConfirm(shown[0].label)} : {base:editHighlight, numOffset:Object.keys(editHighlight).length}}>
                      <PBFitBox zoom={zoomOf(0)} fitMode={fitOf(0)} scrollable style={annotateOn?{background:"#f2f7ff",border:"2.5px dashed #1677FF",boxShadow:"0 3px 10px rgba(0,0,0,.08)"}:null}>
                        <PBDocSheet docKey={shown[0].key} label={shown[0].label} scale={1} highlight={editRow ? editHighlight : {}} />
                      </PBFitBox>
                    </PBAnnotateCtx.Provider>
                    </PBSearchCtx.Provider>
                  </div>
                </div>
              </div>
              {editView!=="parsed" && (<div style={{display:"flex",flexDirection:"column",minWidth:0,height:"100%",minHeight:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 4px 8px",flexShrink:0}}><span style={{font:"600 10px/14px Roboto",color:"#1677FF",letterSpacing:".04em",textTransform:"uppercase"}}>Original</span>{viewCtl(1)}</div>
                <div style={{paddingTop:annotateOn?18:0,flex:1,minHeight:0,display:"flex",flexDirection:"column"}}>
                  <div style={{flex:1,minHeight:0}}>
                    <PBFitBox zoom={zoomOf(1)} fitMode={fitOf(1)} scrollable>
                      <PBHandwrittenSheet docKey={shown[0].key} scale={1} paged />
                    </PBFitBox>
                  </div>
                </div>
              </div>)}
            </div>
          </div>
        ) : (fullScreen && compareMode==="original-parsed") ? (
          <div className="pb-thin-scroll" style={{flex:1,minHeight:0,overflow:"auto",padding:14,background:"#e9ebef",display:"flex",justifyContent:"center"}}>
            <div style={{display:"flex",gap:14,alignItems:"stretch",justifyContent:"center",height:"100%",minHeight:0,maxWidth:"100%"}}>
              <div style={{display:"flex",flexDirection:"column",minWidth:0,height:"100%",minHeight:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 4px 8px",flexShrink:0}}><span style={{font:"600 10px/14px Roboto",color:"#1677FF",letterSpacing:".04em",textTransform:"uppercase"}}>Parsed</span>{viewCtl(0)}</div>
                <div style={{flex:1,minHeight:0}}>
                  <PBFitBox zoom={zoomOf(0)} fitMode={fitOf(0)} scrollable>
                    <PBDocSheet docKey={shown[0].key} label={shown[0].label} scale={1} highlight={highlight} />
                  </PBFitBox>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",minWidth:0,height:"100%",minHeight:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 4px 8px",flexShrink:0}}><span style={{font:"600 10px/14px Roboto",color:"#1677FF",letterSpacing:".04em",textTransform:"uppercase"}}>Original</span>{viewCtl(1)}</div>
                <div style={{flex:1,minHeight:0}}>
                  <PBFitBox zoom={zoomOf(1)} fitMode={fitOf(1)}>
                    <PBHandwrittenSheet docKey={shown[0].key} scale={1} />
                  </PBFitBox>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="pb-thin-scroll" style={{flex:1,minHeight:0,overflow:"auto",padding:single?14:12,background:"#e9ebef",display:"flex",justifyContent:"center"}}>
            <div style={{display:"flex",gap:14,alignItems:"stretch",justifyContent:"center",height:"100%",minHeight:0,maxWidth:"100%"}}>
              {shown.map((d,i)=>(
                <div key={i} style={{display:"flex",flexDirection:"column",minWidth:0,height:"100%",minHeight:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 4px 10px",flexShrink:0}}>
                    <button type="button" title="Open this document in a new tab" onClick={()=>pbOpenDocInTab(d.key)}
                      style={{flexShrink:0,display:"inline-flex",alignItems:"center",justifyContent:"center",width:24,height:24,borderRadius:5,border:"1px solid #d8dee6",background:"#fff",cursor:"pointer",padding:0}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M14 4h6v6" stroke="#475569" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 4l-8.5 8.5" stroke="#475569" strokeWidth="1.9" strokeLinecap="round"/><path d="M18 14.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.5" stroke="#475569" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <span style={{position:"relative",display:"inline-flex",alignItems:"center",gap:5,minWidth:0}} title="Choose the document to compare">
                      <span style={{font:"500 13px/18px Roboto",color:"#1a1a1a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.label}</span>
                      <span style={{fontSize:14,lineHeight:1,color:"#5b6674",flexShrink:0}}>▾</span>
                      <select value={d.key} onChange={e=>swap(i, e.target.value)} style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0,cursor:"pointer",border:"none"}}>
                        {Object.keys(PB_DOCS).map(k=>(<option key={k} value={k}>{PB_DOCS[k].label}</option>))}
                      </select>
                    </span>
                    {viewCtl(i)}
                  </div>
                  <div style={{flex:1,minHeight:0}}>
                    <PBFitBox zoom={zoomOf(i)} fitMode={fitOf(i)} scrollable>
                      <PBHandwrittenSheet docKey={d.key} scale={1} paged />
                    </PBFitBox>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <PBAuditLogTable indicator={indicator} onClear={onClearFilter} groups={groups} extra={logExtra} />
      )}
    </React.Fragment>
    </PBFitCtx.Provider>
  );
}

function PBEditPanel({ row, onClose, inline, compact, floating, refs, onRemoveRef, onLog, onAnnotateMode, annotateOn, onPickFromDoc, onFocusRef, onRefKeyChange, onStatusChange }) {
  const twoDocs = (row.docs || []).length > 1;
  // the rule already carries its annotated sources — show them as existing
  // references so the auditor only has to confirm or change the result
  const ev = pbEvidenceFor(row);
  const autoRefs = ((ev && ev.sources) || []).map(f => ({
    label: f.label, value: f.value,
    fieldKey: (f.doc && f.key) ? f.doc + "." + f.key : null,
    text: f.label + " : " + f.value,
    source: (f.source || (PB_DOCS[f.doc]||{}).label || f.doc || "Document") + ((f.page || (f.doc && f.key && pbPageOf(f.doc, f.key))) ? " · Page " + (f.page || pbPageOf(f.doc, f.key)) : ""),
    auto: true,
  }));
  const [removedAuto, setRemovedAuto] = useF({});
  React.useEffect(()=>{ setRemovedAuto({}); }, [row.indicator]);
  // pre-loaded references (from the rule's own sources) plus anything the
  // auditor annotated — each one deletable on its own
  const shownRefs = autoRefs.map((r,i)=>({ ...r, _auto:true, _i:i })).filter(r=>!removedAuto[r._i])
    .concat((refs||[]).map((r,i)=>({ ...r, _auto:false, _i:i })));
  const removeRef = (ref)=>{
    if (ref._auto) setRemovedAuto(m=>({ ...m, [ref._i]:true })); else onRemoveRef && onRemoveRef(ref._i);
    onLog && onLog({ action:"Annotation removed", field:(ref.label||"Reference"), prev:ref.value||ref.text, src:ref.source });
  };
  const [refsOpen, setRefsOpen] = useF(true);
  const [editingRef, setEditingRef] = useF(null);
  const [refDraft, setRefDraft] = useF({ label:"", value:"" });
  const refKey = (ref)=> ref._auto ? ("a"+ref._i) : ("c"+ref._i);
  const refPair = (ref)=>{
    const e = refEdits[refKey(ref)];
    if (e) return e;
    if (ref.label !== undefined) return { label: ref.label, value: ref.value };
    const t = String(ref.text||""); const k = t.indexOf(" : ");
    return k > -1 ? { label: t.slice(0,k), value: t.slice(k+3) } : { label: "Field", value: t };
  };
  const [refEdits, setRefEdits] = useF({});
  const [editMethod, setEditMethod] = useF("text");
  const [srcEdits, setSrcEdits] = useF({});
  const [pickedKeys, setPickedKeys] = useF({});
  const [picking, setPicking] = useF(false);
  const locked = editingRef !== null;
  const stopPicking = ()=>{ if (picking) { setPicking(false); onPickFromDoc && onPickFromDoc(null); } };
  const closeEdit = ()=>{ setPicking(false); setEditingRef(null); setEditMethod("text"); onPickFromDoc && onPickFromDoc(null); onFocusRef && onFocusRef(null); };
  // fresh=true after the auditor deleted the value: nothing stays highlighted,
  // only their new selection shows in the preview.
  const startPicking = (fresh)=>{
    setEditMethod("doc"); setPicking(true);
    const cur = editingRef!==null ? shownRefs[editingRef] : null;
    const focusKey = (fresh===true || !cur || !refDraft.value) ? null : (pickedKeys[refKey(cur)] || cur.fieldKey || null);
    onPickFromDoc && onPickFromDoc((key)=>{
      if (cur) setPickedKeys(m=>({ ...m, [refKey(cur)]:key }));
      const [doc,field] = key.split(".");
      const f = (PB_DOC_FIELDS[doc]||{})[field];
      const value = field==="narrative" ? "Left blank — no narrative text recorded" : (f ? pbDocValue(f) : "");
      const docLabel = (PB_DOCS[doc] && PB_DOCS[doc].label) || doc;
      setRefDraft(d=>({ ...d, value, source: docLabel + " · Page " + pbPageOf(doc, field) }));
      setPicking(false);
    }, focusKey);
  };
  const [annotSub, setAnnotSub] = useF(null);
  React.useEffect(()=>{ if (!annotateOn) setAnnotSub(null); }, [annotateOn]);
  const [subOverride, setSubOverride] = useF({});
  React.useEffect(()=>{ setSubOverride({}); }, [row.indicator]);
  const subItems = pbApplyLogic(row.indicator, pbSubCriteriaFor(row).map((s,i)=> (i in subOverride) ? (s.logic ? { ...s, answer:subOverride[i], value:subOverride[i] } : { ...s, met: subOverride[i] }) : s));
  const isLogic = subItems.some(s=>s.logic);
  const [removedSlot, setRemovedSlot] = useF({});
  React.useEffect(()=>{ setRemovedSlot({}); }, [row.indicator]);
  // an annotated line fills the question's answer when it contains one of the options
  const lastLogicRef = (refs||[]).filter(r=>r.sub!=null).slice(-1)[0];
  React.useEffect(()=>{ if (!lastLogicRef) return; const q = subItems[lastLogicRef.sub]; if (!q || !q.logic) return;
    const line = " "+String(lastLogicRef.line || (lastLogicRef.label+" - "+lastLogicRef.value)).toLowerCase()+" ";
    const opt = q.options.slice().sort((x,y)=>y.length-x.length).find(o=>line.includes(" "+o.toLowerCase()+" ") || line.includes(" "+o.toLowerCase()+"-") || line.includes("- "+o.toLowerCase()));
    if (opt && opt!==q.answer) setSubOverride(m=>({ ...m, [lastLogicRef.sub]:opt })); }, [(refs||[]).length]);
  const [annotSlot, setAnnotSlot] = useF(null);
  const [extraSlots, setExtraSlots] = useF({});
  const [slotEdit, setSlotEdit] = useF({});
  const [noRefSlot, setNoRefSlot] = useF({});
  const [editingSlot, setEditingSlot] = useF(null);
  const [slotDraft, setSlotDraft] = useF("");
  React.useEffect(()=>{ setExtraSlots({}); setSlotEdit({}); setNoRefSlot({}); setEditingSlot(null); }, [row.indicator]);
  // a fresh annotation replaces any typed edit / "no reference" flag on that sub-field
  React.useEffect(()=>{ if (!lastLogicRef || lastLogicRef.slot==null) return; const key = lastLogicRef.sub+"-"+lastLogicRef.slot;
    setNoRefSlot(m=>{ const n={...m}; delete n[key]; return n; }); }, [(refs||[]).length]);
  const [slotMenu, setSlotMenu] = useF(null);
  const slotNames = (s, qi)=> (s.slotLabels||[]).concat((s.more||[]).filter(m=>!(s.slotLabels||[]).includes(m)));
  const isNoRef = (s, qi, k)=>{ const key = qi+"-"+k; if (noRefSlot[key]!==undefined) return !!noRefSlot[key]; return k >= (s.slotCount||0) && !(refs||[]).some(r=>r.sub===qi && r.slot===k); };
  React.useEffect(()=>{ if (!annotateOn) setAnnotSlot(null); }, [annotateOn]);
  // each sub-field can hold several annotated lines
  const slotEntries = (s, qi, k)=>{
    const key = qi+"-"+k, out = [];
    if (isNoRef(s, qi, k)) return out;
    if (!removedSlot[key] && s.slotTexts && s.slotTexts[k]) { const id = key+"-base"; const ss = (s.slotSrc&&s.slotSrc[k])||{}; out.push({ id, t: slotEdit[id] ?? s.slotTexts[k], doc: ss.src, page: ss.page, remove:()=>setRemovedSlot(m=>({ ...m, [key]:true })) }); }
    (refs||[]).forEach((r,i)=>{ if (r.sub!==qi || r.slot!==k) return; const id = key+"-r"+(r.fieldKey||r.line||"")+"#"+i; out.push({ id, t: slotEdit[id] ?? (r.line || (r.label+" - "+r.value)), doc: r.source || (PB_DOCS[r.doc]||{}).label || r.doc, page: r.page, remove:()=>onRemoveRef && onRemoveRef(i) }); });
    return out;
  };
  const slotEntry = (s, qi, k)=>{ if (isNoRef(s,qi,k)) return { noRef:true }; return slotEntries(s,qi,k)[0] || null; };
  const startSlot = (qi, k)=>{ if (locked) return; const on = annotateOn && annotSub===qi && annotSlot===k; setAnnotSub(on?null:qi); setAnnotSlot(on?null:k); onAnnotateMode && onAnnotateMode(!on, qi, k); };
  const firstEmptySlot = (s, qi)=>{ const n = slotNames(s,qi).length; for (let k=0;k<n;k++) if (!slotEntry(s,qi,k)) return k; return 0; };
  const addSubField = (qi, name)=>{ if (!name) return; const s = subItems[qi]; const k = slotNames(s,qi).length; setExtraSlots(m=>({ ...m, [qi]:[ ...(m[qi]||[]), name ] })); setTimeout(()=>startSlot(qi, k), 0); };
  const removeSubField = (qi, k, base)=>{ setExtraSlots(m=>({ ...m, [qi]:(m[qi]||[]).filter((_,j)=>j!==k-base) })); };
  const iconBtn = { flexShrink:0,cursor:"pointer",width:22,height:22,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",background:"#fff" };
  const renderSlots = (s, qi)=>{
    const names = slotNames(s, qi), base = s.slotCount;
    const tagOf = {}; let tn = 0;
    names.forEach((_,k)=>slotEntries(s,qi,k).forEach(en=>{ if (/-base$/.test(en.id)) tagOf[en.id] = (qi+1)+String.fromCharCode(97+tn++); }));
    (refs||[]).forEach((r,i)=>{ if (r.sub!==qi || r.slot==null) return; const id = qi+"-"+r.slot+"-r"+(r.fieldKey||r.line||"")+"#"+i; if (!tagOf[id]) tagOf[id] = (qi+1)+String.fromCharCode(97+tn++); });
    const remaining = (s.more||[]).filter(m=>!names.includes(m));
    const xBtn = (onClick, title)=>(
      <span onClick={locked?undefined:onClick} title={title} style={{...iconBtn,border:"1px solid #f3c1bc"}}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#D6392C" strokeWidth="2.6" strokeLinecap="round"/></svg>
      </span>);
    const TG = "18% 21% minmax(0,1fr) 82px 72px";
    const th = { font:"500 10px/14px Roboto", color:"#8a95a3", textTransform:"uppercase", letterSpacing:".04em", padding:"6px 10px", borderRight:"1px solid #dfe4ea" };
    const cl = { font:"400 12px/17px Roboto", minWidth:0, padding:"8px 10px", borderRight:"1px solid #eceff3" };
    const clamp = { display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden", overflowWrap:"anywhere" };
    const mItem = (danger)=>({display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:4,font:"400 12px/16px Roboto",color:danger?"#D6392C":"#1f2937",cursor:"pointer"});
    const ico = {
      edit:<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 20h4L18.5 9.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4z" stroke="#1677FF" strokeWidth="2" strokeLinejoin="round"/></svg>,
      trash:<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" stroke="#D6392C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      plus:<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#1677FF" strokeWidth="2.4" strokeLinecap="round"/></svg>,
      none:<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#64748b" strokeWidth="2"/><path d="M6.5 17.5l11-11" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/></svg>,
    };
    // one menu per row: edit / remove the reference, or mark the parameter as having no reference
    const moreMenu = (mid, items)=>(
      <span style={{position:"relative",flexShrink:0}}>
        <button type="button" disabled={locked} onClick={(ev)=>{ ev.stopPropagation(); window.__pbMenuRect = ev.currentTarget.getBoundingClientRect(); setSlotMenu(v=>v===mid?null:mid); }} title="Actions" style={{boxSizing:"border-box",height:24,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:4,background:slotMenu===mid?"#EAF3FF":"#fff",border:"1px solid "+(slotMenu===mid?"#1677FF":"#d8dee6"),borderRadius:4,padding:"0 7px",font:"500 11px/16px Roboto",color:"#334155",cursor:"pointer",whiteSpace:"nowrap"}}>
          Action
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        {slotMenu===mid && ReactDOM.createPortal(
          <React.Fragment>
            <span onClick={()=>setSlotMenu(null)} style={{position:"fixed",inset:0,zIndex:9998}}></span>
            <div style={{position:"fixed",...(()=>{ const r=window.__pbMenuRect||{bottom:0,right:0,top:0}; const below=window.innerHeight-r.bottom>130; return below?{top:r.bottom+4}:{bottom:window.innerHeight-r.top+4}; })(),right:Math.max(8,window.innerWidth-((window.__pbMenuRect||{}).right||0)),zIndex:9999,minWidth:190,background:"#fff",border:"1px solid #e2e8f0",borderRadius:6,boxShadow:"0 10px 24px rgba(15,23,42,.14)",padding:4,display:"flex",flexDirection:"column"}}>
              {items.map((it,ii)=>(
                <span key={ii} onClick={()=>{ setSlotMenu(null); it.on(); }} style={mItem(it.danger)} onMouseEnter={(e)=>e.currentTarget.style.background="#F5F7FA"} onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}>{it.icon}{it.label}</span>
              ))}
            </div>
          </React.Fragment>, document.body
        )}
      </span>
    );
    const addBtn = (qi, k, active, name)=>(
      <button type="button" disabled={locked} onClick={()=>startSlot(qi,k)} title={active ? "Stop annotating" : "Annotate "+name+" from document"} aria-label="Add annotation"
        style={{flexShrink:0,width:24,height:24,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:0,borderRadius:4,border:"1px solid "+(active?"#1677FF":"#bcd9ff"),background:active?"#1677FF":"#fff",cursor:locked?"default":"pointer"}}>
        {active
          ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth="2.8" strokeLinecap="round"/></svg>
          : <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#1677FF" strokeWidth="2.4" strokeLinecap="round"/></svg>}
      </button>
    );
    const annBtn = (qi,k,name)=>(
      <button type="button" disabled={locked} onClick={()=>startSlot(qi,k)} title={"Annotate "+name+" from document"} style={{flexShrink:0,boxSizing:"border-box",height:24,padding:"0 8px",display:"inline-flex",alignItems:"center",gap:4,background:"#fff",border:"1px solid #bcd9ff",borderRadius:4,font:"500 11px/16px Roboto",color:"#1677FF",cursor:locked?"default":"pointer",whiteSpace:"nowrap"}}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#1677FF" strokeWidth="2.6" strokeLinecap="round"/></svg>
        Ref
      </button>
    );
    const actCell = (children, extra)=>(<div style={{...cl,...extra,boxSizing:"border-box",gridColumn:4,padding:"6px 10px",display:"flex",justifyContent:"center",alignItems:"flex-start"}}>{children}</div>);
    return (
      <div style={{border:"1px solid #dfe4ea",borderRadius:4,overflow:"hidden",background:"#fff"}}>
        <div style={{display:"grid",gridTemplateColumns:TG,background:"#F5F7FA",borderBottom:"1px solid #dfe4ea"}}>
          <div style={th}>Parameter</div><div style={th}>Document Name</div><div style={th}>Value Found</div><div style={th}></div><div style={{...th,borderRight:"none"}}></div>
        </div>
        {names.map((name0,k)=>{
          // a question's references share one parameter (e.g. First Name) — the document column says where each came from
          const disp = (j)=> j < (s.slotCount||0) ? (s.param || pbParamName([names[j]])) : names[j];
          const name = disp(k);
          const cont = k > 0 && disp(k-1) === name;
          const key = qi+"-"+k, entries = slotEntries(s, qi, k);
          const active = annotateOn && annotSub===qi && annotSlot===k;
          const noRef = isNoRef(s,qi,k);
          const setNoRef = (v)=>{ setNoRefSlot(m=>({ ...m, [key]:v })); if (active) startSlot(qi,k); onLog && onLog({ action: v ? "Marked no reference" : "No reference cleared", field:name }); };
          const SPAN = Math.max(1, noRef ? 1 : (entries.length ? entries.length + (active?1:0) : 1));
          const ANN_SPAN = SPAN - (active ? 1 : 0);
          const editingHere = entries.some(en=>en.id===editingSlot);
          const annCell = ANN_SPAN > 0 && !editingHere && (
            <div style={{gridColumn:5,gridRow:"1 / span "+ANN_SPAN,padding:"6px 8px",display:"flex",justifyContent:"center",alignItems:"flex-start",background:"#fff"}}>
              {!active && !cont && annBtn(qi,k,name)}
            </div>
          );
          const nameCell = (
            <div style={{...cl,gridColumn:1,gridRow:"1 / span "+SPAN}}>
              {!cont && <span title={name} style={{...clamp,color:active?"#1677FF":"#64748b",fontWeight:active?500:400}}>{name}</span>}
            </div>
          );
          const rowsOut = [];
          if (noRef && !active) rowsOut.push(
            <React.Fragment key="nr">
              <div style={{...cl,gridColumn:2,color:"#94a3b8",fontStyle:"italic"}}>No reference available</div>
              <div style={{...cl,gridColumn:3}}></div>
              {actCell(null)}
            </React.Fragment>);
          else if (!entries.length && !active) rowsOut.push(
            <React.Fragment key="empty">
              <div style={{...cl,gridColumn:2,color:"#94a3b8",fontStyle:"italic"}}>No reference</div>
              <div style={{...cl,gridColumn:3}}></div>
              {actCell(null)}
            </React.Fragment>);
          else entries.forEach((en,j)=>{ const bt = j ? {borderTop:"1px solid #f1f4f7"} : null; rowsOut.push(
              <React.Fragment key={en.id}>
                <div title={en.doc||undefined} style={{...cl,...bt,color:"#475569",gridColumn:2,background:editingSlot===en.id?"#F5F9FF":"#fff"}}><span style={clamp}>{en.doc || "—"}</span></div>
                {editingSlot===en.id ? (
                  <div style={{...bt,gridColumn:"3 / 6",background:"#F5F9FF",display:"flex",alignItems:"flex-start",gap:6,padding:"6px 8px",minWidth:0}}>
                    <textarea value={slotDraft} autoFocus rows={3} onChange={(ev)=>setSlotDraft(ev.target.value)} onKeyDown={(ev)=>{ if (ev.key==="Enter" && !ev.shiftKey) { ev.preventDefault(); (()=>{ if(!slotDraft.trim()) return; setSlotEdit(m=>({ ...m, [en.id]:slotDraft.trim() })); onLog && onLog({ action:"Reference edited", field:name, prev:en.t, next:slotDraft.trim() }); setEditingSlot(null); })(); } if (ev.key==="Escape") setEditingSlot(null); }}
                      style={{flex:1,minWidth:0,height:59,boxSizing:"border-box",resize:"vertical",border:"1px solid #1677FF",borderRadius:4,padding:"5px 8px",font:"400 12px/17px Roboto",color:"#0f172a",outline:"none"}} />
                    <div style={{display:"flex",flexDirection:"column",gap:4,flex:"none"}}>
                      <button type="button" title="Save" aria-label="Save" disabled={!slotDraft.trim()} onClick={()=>{ if(!slotDraft.trim()) return; setSlotEdit(m=>({ ...m, [en.id]:slotDraft.trim() })); onLog && onLog({ action:"Reference edited", field:name, prev:en.t, next:slotDraft.trim() }); setEditingSlot(null); }} style={{width:26,height:26,display:"inline-flex",alignItems:"center",justifyContent:"center",background:slotDraft.trim()?"#1677FF":"#c9d6e6",border:"none",borderRadius:4,padding:0,cursor:slotDraft.trim()?"pointer":"not-allowed"}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
                      </button>
                      <button type="button" title="Cancel" aria-label="Cancel" onClick={()=>setEditingSlot(null)} style={{width:26,height:26,display:"inline-flex",alignItems:"center",justifyContent:"center",background:"#fff",border:"1px solid #d8dee6",borderRadius:4,padding:0,cursor:"pointer"}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <React.Fragment>
                    <div title={en.t} style={{...cl,...bt,gridColumn:3,display:"flex",alignItems:"flex-start",gap:6,font:"500 12px/17px Roboto",color:"#0f172a",overflowWrap:"anywhere",textWrap:"pretty"}}>
                      {tagOf[en.id] && <span title={"Reference "+tagOf[en.id]+" — marked on the document"} style={{flexShrink:0,marginTop:1,minWidth:18,height:16,padding:"0 4px",boxSizing:"border-box",borderRadius:8,background:"#E2A700",color:"#fff",font:"600 10px/16px Roboto",textAlign:"center"}}>{tagOf[en.id]}</span>}
                      <span style={{minWidth:0}}>{pbShortValue(en.t)}</span>
                    </div>
                    <div style={{...cl,...bt,boxSizing:"border-box",gridColumn:4,padding:"6px 10px",display:"flex",justifyContent:"center",alignItems:"flex-start"}}>
                      {moreMenu(en.id,[
                        { label:"Edit reference text", icon:ico.edit, on:()=>{ setSlotDraft(en.t); setEditingSlot(en.id); } },
                        { label:"Remove reference", icon:ico.trash, danger:true, on:()=>{ onLog && onLog({ action:"Annotation removed", field:name, prev:en.t }); en.remove(); } },
                      ])}
                    </div>
                  </React.Fragment>
                )}
              </React.Fragment>); });
          if (active) rowsOut.push(
            <React.Fragment key="act">
              <div style={{...cl,gridColumn:"2 / 5",borderRight:"none",color:"#1677FF",background:"#F5F9FF",borderTop:(entries.length&&!noRef)?"1px solid #f1f4f7":"none",display:"flex",alignItems:"center",gap:10}}>
                <span style={{flex:1,minWidth:0}}>Select the line in the parsed document</span>
              </div>
              <div style={{gridColumn:5,padding:"6px 8px",display:"flex",justifyContent:"center",alignItems:"center",background:"#F5F9FF",borderTop:(entries.length&&!noRef)?"1px solid #f1f4f7":"none"}}>
                <button type="button" onClick={()=>startSlot(qi,k)} title="Stop annotating" style={{flexShrink:0,boxSizing:"border-box",height:24,padding:"0 10px",display:"inline-flex",alignItems:"center",background:"#fff",border:"1px solid #bcd9ff",borderRadius:4,font:"500 11px/16px Roboto",color:"#1677FF",cursor:"pointer"}}>Cancel</button>
              </div>
              
            </React.Fragment>);
          return <div key={k} style={{position:"relative",display:"grid",gridTemplateColumns:TG,borderTop:(k && !cont)?"1px solid #e5e9ef":"none"}}>{cont && <span style={{position:"absolute",top:0,left:"18%",right:72,borderTop:"1px solid #f1f4f7",pointerEvents:"none"}}></span>}{nameCell}{rowsOut}{annCell}</div>;
        })}
      </div>
    );
  };
  const [subOpen, setSubOpen] = useF(true);
  const status = subItems.every(s=>s.met) ? "Requirement Met" : "Requirement Unmet";
  // rule result follows its sub-criteria: all met → Met, any unmet → Unmet
  const statusFirst = React.useRef(true);
  React.useEffect(()=>{ const v = status==="Requirement Met" ? "Met" : "Unmet"; if (statusFirst.current) { statusFirst.current = false; if (v === row.matches) return; } onStatusChange && onStatusChange(v); }, [status]);
  const renderRef = (ref,idx,tag)=>(
    <div key={idx} style={{position:"relative",border:"1px solid "+(editingRef===idx?"#1677FF":"#e2e8f0"),background:editingRef===idx?"#fff":"#f8fafc",borderRadius:6,padding:compact?"8px 30px 8px 10px":"9px 34px 9px 11px",opacity:(locked&&editingRef!==idx)?0.45:1,pointerEvents:(locked&&editingRef!==idx)?"none":"auto",transition:"opacity .15s"}}>
      <span style={{position:"absolute",top:8,right:8,display:editingRef===idx?"none":"flex",alignItems:"center",gap:2}}>
        <span onClick={(e)=>{ e.stopPropagation(); const fk = pickedKeys[refKey(ref)] || ref.fieldKey; setEditingRef(idx); setRefDraft({ ...refPair(ref), source: srcEdits[refKey(ref)] || ref.source }); if (fk) { setEditMethod("doc"); onFocusRef && onFocusRef(fk); } else { setEditMethod("text"); onFocusRef && onFocusRef(null); } }} title="Edit annotated value" style={{cursor:"pointer",padding:4,borderRadius:4,lineHeight:0}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 20h4l10-10-4-4L4 16v4z" stroke="#1677FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M14.5 5.5l4 4" stroke="#1677FF" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </span>
        <span onClick={(e)=>{ e.stopPropagation(); removeRef(ref); }} title="Delete this reference" style={{cursor:"pointer",padding:4,borderRadius:4,lineHeight:0}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" stroke="#D6392C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      </span>
      {editingRef===idx ? (
        <div style={{display:"flex",flexDirection:"column",gap:7,paddingRight:4}}>
          <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr)",gap:6}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
              <span title="Field name can't be changed" style={{justifySelf:"start",display:"inline-flex",alignItems:"center",gap:5,font:`500 ${compact?11:12}px/16px Roboto`,color:"#64748b"}}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="#64748b" strokeWidth="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#64748b" strokeWidth="2"/></svg>
              {refDraft.label}
            </span>
              <span style={{display:"inline-flex",gap:1,background:"#eef2f7",borderRadius:4,padding:1}}>
                <span onClick={()=>{ stopPicking(); setEditMethod("text"); onFocusRef && onFocusRef(pickedKeys[refKey(ref)] || ref.fieldKey || null); }} style={{cursor:"pointer",padding:"1px 7px",borderRadius:3,font:"500 11px/16px Roboto",background:editMethod==="text"?"#fff":"transparent",color:editMethod==="text"?"#1677FF":"#64748b",boxShadow:editMethod==="text"?"0 1px 1px rgba(15,23,42,.12)":"none",whiteSpace:"nowrap"}}>Type</span>
                <span onClick={()=>{ if (editMethod==="doc") return; if (refDraft.value) { const fk = pickedKeys[refKey(ref)] || ref.fieldKey; setEditMethod("doc"); onFocusRef && onFocusRef(fk || null); } else startPicking(); }} style={{cursor:"pointer",padding:"1px 7px",borderRadius:3,font:"500 11px/16px Roboto",background:editMethod==="doc"?"#fff":"transparent",color:editMethod==="doc"?"#1677FF":"#64748b",boxShadow:editMethod==="doc"?"0 1px 1px rgba(15,23,42,.12)":"none",whiteSpace:"nowrap"}}>From document</span>
              </span>
            </div>
            {editMethod==="text" ? (
              <input value={refDraft.value} onChange={(e)=>setRefDraft(d=>({ ...d, value:e.target.value }))} autoFocus
                style={{width:"100%",border:"1px solid #1677FF",borderRadius:4,padding:"6px 9px",font:`400 ${compact?12:13}px/18px Roboto`,color:"#0f172a",outline:"none",boxSizing:"border-box"}} />
            ) : (
              (picking || !refDraft.value) ? (
                <div onClick={picking?stopPicking:()=>startPicking()} style={{display:"flex",alignItems:"center",gap:6,border:"1px dashed #1677FF",background:picking?"#EAF3FF":"#f8fbff",borderRadius:4,padding:"8px 10px",cursor:"pointer"}}>
                  <span style={{font:"500 12px/16px Roboto",color:"#1677FF"}}>{picking ? "Select a line in the parsed document, then Confirm Selection (click here to stop)" : "Click here to annotate from the document"}</span>
                </div>
              ) : (
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1,minWidth:0,border:"1.5px dashed #1677FF",background:"#f8fbff",borderRadius:4,padding:"6px 10px"}}>
                    <span style={{font:`500 ${compact?13:14}px/19px Roboto`,color:"#0f172a",textWrap:"pretty"}}>{refDraft.value}</span>
                  </div>
                  <span onClick={()=>{ setRefDraft(d=>({ ...d, value:"" })); onFocusRef && onFocusRef(null); startPicking(true); }} title="Remove this value and annotate again" style={{flexShrink:0,cursor:"pointer",width:22,height:22,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",background:"#fff",border:"1px solid #f3c1bc"}}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#D6392C" strokeWidth="2.6" strokeLinecap="round"/></svg>
                  </span>
                </div>
              )
            )}
            <span style={{display:"none"}}></span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button type="button" disabled={!refDraft.value.trim()} onClick={()=>{ const p=refPair(ref); const n={ label:p.label, value:refDraft.value.trim() }; if(!n.value) return; setRefEdits(m=>({ ...m, [refKey(ref)]:n })); if (refDraft.source && refDraft.source!==ref.source) setSrcEdits(m=>({ ...m, [refKey(ref)]:refDraft.source })); { const nk = pickedKeys[refKey(ref)]; if (nk && ref.fieldKey && nk!==ref.fieldKey) onRefKeyChange && onRefKeyChange(ref.fieldKey, nk); } onLog && onLog({ action:"Reference edited", field:n.label, prev:p.value, next:n.value, src:(refDraft.source||ref.source) }); closeEdit(); }}
              style={{background:refDraft.value.trim()?"#1677FF":"#c9d6e6",border:"none",borderRadius:4,padding:"5px 12px",font:"500 12px/16px Roboto",color:"#fff",cursor:refDraft.value.trim()?"pointer":"not-allowed"}}>Update</button>
            <span onClick={closeEdit} style={{font:"400 12px/16px Roboto",color:"#64748b",cursor:"pointer"}}>Cancel</span>
          </div>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:4}}>
          <span style={{display:"flex",alignItems:"center",gap:6,font:`500 ${compact?11:12}px/16px Roboto`,color:"#64748b"}}>{tag && <span style={{flexShrink:0,background:"#E2A700",color:"#fff",borderRadius:20,minWidth:16,height:16,padding:"0 4px",boxSizing:"border-box",display:"inline-flex",alignItems:"center",justifyContent:"center",font:"600 10px/1 Roboto"}}>{tag}</span>}{refPair(ref).label}</span>
          <div style={{alignSelf:"stretch",font:`600 ${compact?13:14}px/19px Roboto`,color:"#0f172a",textWrap:"pretty"}}>{refPair(ref).value}</div>
        </div>
      )}
      {editingRef!==idx && <div style={{font:`400 ${compact?11:12}px/16px Roboto`,color:"#64748b",marginTop:6}}>Source : <span title={srcEdits[refKey(ref)] || ref.source} style={{color:"#1677FF",textDecoration:"underline",cursor:"pointer",whiteSpace:"nowrap"}}>{pbMidEllipsis(srcEdits[refKey(ref)] || ref.source)}</span></div>}
    </div>
  );
  const toggleSub = (i, v)=>{ const prev = subItems[i];
    if (prev.logic) { if (prev.answer === v) return; setSubOverride(m=>({ ...m, [i]:v })); onLog && onLog({ action:"Rule field changed", field:"Audit result", subRule:prev.label, prev:prev.answer, next:v }); return; }
    if (prev.met === v) return; setSubOverride(m=>({ ...m, [i]:v })); onLog && onLog({ action:"Sub-criterion changed", field:"Audit result", subRule:prev.label, prev:prev.met?"Met":"Unmet", next:v?"Met":"Unmet" }); };
  const [notes, setNotes] = useF("");
  React.useEffect(()=>{ setNotes(""); }, [row.indicator, row._focusQ]);
  const [statusOpen, setStatusOpen] = useF(false);
  const [docKey, setDocKey] = useF((row.docs && row.docs[0]) || "elig");
  const [zoomParsed, setZoomParsed] = useF(1);
  const [zoomOrig, setZoomOrig] = useF(1);
  const zClamp = (n)=>Math.min(3, Math.max(0.5, +n.toFixed(2)));
  const zoomBtn = { width:22, height:22, borderRadius:4, border:"1px solid #d8dee6", background:"#fff", cursor:"pointer", font:"500 13px/1 Roboto", color:"#334155" };
  const paneLabel = (text)=>({ font:"600 10px/14px Roboto", color:"#334155", letterSpacing:".04em", textTransform:"uppercase", background:"#eef2f7", borderRadius:4, padding:"2px 8px" });
  return (
    <div style={{background:"#fff",position:"relative",zIndex:6,margin:floating?0:(compact?"0 8px 10px":"0 14px 14px"),border:floating?"none":"1px solid #e6ebf1",borderTop:"none",borderRadius:floating?0:"0 0 10px 10px",boxShadow:floating?"none":"0 18px 40px rgba(15,23,42,.14), 0 4px 10px rgba(15,23,42,.05)"}}>
      <div style={{width:"100%",background:"#fff",borderRadius:floating?0:"0 0 10px 10px",overflow:"hidden"}}>
        <div style={{padding:compact?"12px 12px 14px":"18px 18px 20px",borderBottom:"1px solid #e2e8f0"}}>
          {(
          <React.Fragment>
          <div style={{marginBottom:compact?10:14}}>
            <PBSubCriteriaTable items={subItems} focusIdx={typeof row._focusQ==="number" ? row._focusQ : undefined} compact={compact} onToggle={toggleSub}
              addingIdx={annotateOn ? annotSub : null}
              onAddRef={locked ? null : (i)=>{ if (i!==null && subItems[i] && subItems[i].logic) { startSlot(i, firstEmptySlot(subItems[i], i)); return; } setAnnotSub(i); setAnnotSlot(null); onAnnotateMode && onAnnotateMode(i!==null, i); }}
              renderRefs={(s,si)=>{ if (s.logic) return renderSlots(s,si); const all = shownRefs.map((ref,idx)=>({ ref, idx })); const rs = pbRefsForSub(s, all.filter(x=>x.ref._auto), x=>x.ref._i).concat(all.filter(x=>!x.ref._auto && x.ref.sub===si)); return rs.length ? rs.map(({ref,idx},j)=>renderRef(ref,idx,(si+1)+String.fromCharCode(97+j))) : <span style={{font:"400 12px/17px Roboto",color:"#94a3b8"}}>No reference annotated</span>; }}
              extraRow={shownRefs.some(r=>!r._auto && (r.sub===undefined || r.sub===null)) ? (
                <div style={{display:"grid",gridTemplateColumns:"22px minmax(0,1fr) 118px",gap:10,padding:"10px 12px",borderTop:"1px solid #eceff3",alignItems:"start",background:"#fff"}}>
                  <div></div>
                  <span style={{font:"500 12px/17px Roboto",color:"#333"}}>Added references</span>
                  <div></div>
                  <div style={{gridColumn:"2 / -1",display:"flex",flexDirection:"column",gap:8,minWidth:0}}>{shownRefs.map((ref,idx)=>({ ref, idx })).filter(x=>!x.ref._auto && (x.ref.sub===undefined || x.ref.sub===null)).map(({ref,idx})=>renderRef(ref,idx))}</div>
                </div>
              ) : null} />
          </div>
          </React.Fragment>
          )}
        </div>
        <div style={{padding:compact?"12px":"18px",opacity:locked?0.45:1,pointerEvents:locked?"none":"auto",transition:"opacity .15s"}} aria-disabled={locked}>
          {typeof row._focusQ==="number" ? null : (
          <div style={{display:"flex",alignItems:"center",gap:8,position:"relative",flexWrap:"wrap"}}>
            <span style={{font:`400 ${compact?12:13}px/17px Roboto`,color:"#475569"}}>Audit Result :</span>
            <span style={{display:"inline-flex",alignItems:"center",gap:6,font:`500 ${compact?12:13}px/17px Roboto`,color:status==="Requirement Met"?"#2E9E4A":"#C0392B"}}>
              {status==="Requirement Met"
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#3E9F4A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 4l9 15H3l9-15z" stroke="#F04E23" strokeWidth="1.7" strokeLinejoin="round"/><rect x="11.2" y="9.5" width="1.6" height="4.6" rx=".8" fill="#F04E23"/><circle cx="12" cy="16.4" r=".95" fill="#F04E23"/></svg>}
              {status}
            </span>
            <span style={{font:`400 ${compact?11:12}px/16px Roboto`,color:"#94a3b8"}}>· based on sub-criteria</span>
          </div>)}
          <div style={{font:`500 ${compact?12:13}px/17px Roboto`,color:"#1a1a1a",margin:compact?"12px 0 6px":"16px 0 8px"}}>Rationale <span style={{color:"#D6392C"}}>*</span> <span style={{font:`400 ${compact?11:12}px/16px Roboto`,color:"#94a3b8"}}>(required)</span></div>
          <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Enter rationale for the change"
            style={{width:"100%",minHeight:compact?60:84,resize:"vertical",border:"1px solid #cbd5e1",borderRadius:4,padding:compact?"8px 10px":"10px 12px",font:`400 ${compact?12:13}px/17px Roboto`,color:"#0f172a",outline:"none",boxSizing:"border-box"}} />
          <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:compact?10:14,marginTop:compact?12:18}}>
            <span onClick={onClose} style={{font:`400 ${compact?12:13}px/17px Roboto`,color:"#64748b",cursor:"pointer"}}>Cancel</span>
            <button type="button" disabled={!notes.trim()} title={!notes.trim()?"Rationale is required":undefined}
              onClick={()=>{ if(!notes.trim()) return; onLog && onLog({ action: String(row.matches)===String(status) ? "Saved (status unchanged)" : "Status changed", saved:true, field: typeof row._focusQ==="number" && subItems[row._focusQ] ? subItems[row._focusQ].label : "Audit result", prev:row.matches, next:status, note:notes.trim() }); onClose && onClose(); }}
              style={{background:notes.trim()?"#1677FF":"#c9d6e6",border:"none",borderRadius:4,padding:compact?"7px 14px":"8px 18px",font:`500 ${compact?12:13}px/17px Roboto`,color:"#fff",cursor:notes.trim()?"pointer":"not-allowed"}}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PBAutomationLogView({ patient, onRefClick }) {
  const p = patient || {};
  const hd = {font:"500 11px/14px Roboto",color:"#64748b",padding:"8px 10px",background:"#f8fafc",border:"1px solid #e2e8f0",whiteSpace:"nowrap",textAlign:"left"};
  const td = {padding:"10px 10px",border:"1px solid #e2e8f0",font:"400 12px/16px Roboto",color:"#334155",whiteSpace:"nowrap"};
  const start = (p.auditDate||"07/18/25")+" "+(p.auditTime||"09:04 AM");
  const endAt = (mins)=>(p.auditDate||"07/18/25")+" 09:"+String(4+mins).padStart(2,"0")+" AM";
  const rows = [
    { ref:"REFB3"+(p.mrn||"0000").slice(-6)+"01", type:p.trigger||"Pre-Bill", stage:"Identify Records for Audit", name:p.name||"Patient", mrn:p.mrn||"—", ts:start, te:endAt(1), status:"completed", haltedAt:"—", reason:"—", action:"—" },
    { ref:"REFB3"+(p.mrn||"0000").slice(-6)+"02", type:p.trigger||"Pre-Bill", stage:"Collect Data for Audit", name:p.name||"Patient", mrn:p.mrn||"—", ts:endAt(1), te:endAt(3), status:"completed", haltedAt:"—", reason:"—", action:"—" },
    { ref:"REFB3"+(p.mrn||"0000").slice(-6)+"03", type:p.trigger||"Pre-Bill", stage:"Derive Audit Facts from Collected Data", name:p.name||"Patient", mrn:p.mrn||"—", ts:endAt(3), te:endAt(5), status:"completed", haltedAt:"—", reason:"—", action:"—" },
    { ref:"REFB3"+(p.mrn||"0000").slice(-6)+"04", type:p.trigger||"Pre-Bill", stage:"Validate Audit Information Against Rules", name:p.name||"Patient", mrn:p.mrn||"—", ts:endAt(5), te:endAt(7), status:p.met?"completed":"needs-attention", haltedAt:p.met?"—":"Download 485 order from HCHB", reason:p.met?"—":"Unable to fetch documentation for audit", action:p.met?"—":"Audit the record manually" },
  ];
  const AT_ICON = {
    completed: (window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png",
    "needs-attention": (window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png",
    "in-progress": (window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png",
  };
  const AT_LABEL = { completed:"Complete", "needs-attention":"Incomplete", "in-progress":"In Progress" };
  const StatusIcon = ({ v }) => (
    <span style={{display:"inline-flex",alignItems:"center",gap:8,font:"400 13px/16px Roboto",color:"#333333"}}>
      <img src={AT_ICON[v]||AT_ICON.completed} alt="" style={{width:18,height:18,objectFit:"contain"}} />
      {AT_LABEL[v]||AT_LABEL.completed}
    </span>
  );
  return (
    <div style={{flex:1,overflow:"auto",padding:"20px 28px 32px"}}>
      <div style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Automation Log</div>
      <div style={{font:"400 13px/18px Roboto",color:"#3A424A",marginTop:8,marginBottom:16}}>Transaction Status of Pre-Bill Audit Workflows</div>
      <div style={{overflowX:"auto"}}>
        <table style={{borderCollapse:"collapse",width:"100%",minWidth:900}}>
          <thead><tr>{["Ref ID","MRN","Patient Name","Audit Type","Start Time","End Time","AT Status","Reason","Execution halted at","Action required"].map(h=><th key={h} style={hd}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r,i)=>(
            <tr key={i} style={{background:i%2===0?"#fff":"#fafafa"}}>
              <td style={{...td,color:"#1677FF",fontWeight:500,cursor:onRefClick?"pointer":"default"}} onClick={()=>onRefClick && onRefClick(r)}>{r.ref}</td>
              <td style={td}>{r.mrn}</td><td style={td}>{r.name}</td>
              <td style={td}>{r.type}</td>
              <td style={td}>{r.ts}</td>
              <td style={td}>{r.te}</td>
              <td style={td}><StatusIcon v={r.status} /></td>
              <td style={{...td,whiteSpace:"normal",maxWidth:260,color:r.status==="needs-attention"?"#D6392C":"#94a3b8"}}>{r.reason}</td>
              <td style={{...td,whiteSpace:"normal",maxWidth:220,color:r.status==="needs-attention"?"#334155":"#94a3b8"}}>{r.haltedAt}</td>
              <td style={{...td,whiteSpace:"normal",maxWidth:200,color:r.status==="needs-attention"?"#334155":"#94a3b8"}}>{r.action}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
function PBDetailDrawer({ row, onClose, onOpenLog, onResultChange, onAllVerified, onFlagsChange, preVerified, onSwitchAudit, instant }) {
  const r = row || {};
  PB_DOC_VARIANT = (r.met === false) ? "unmet" : "met";
  const [showOnlyUnmet, setRowFilter] = useF("all");
  const [reviewed, setReviewed] = useF({});
  const [flagged, setFlagged] = useF({});
  const flagCount = Object.keys(flagged).length;
  React.useEffect(()=>{ if (onFlagsChange) onFlagsChange(pbRowKey(r), flagCount); }, [flagCount]);
  const toggleFlag = (ind)=>setFlagged(m=>{ const n={...m}; if (n[ind]) delete n[ind]; else { n[ind]=true; setReviewed(rv=>{ const g={...rv}; delete g[ind]; return g; }); } return n; });
  const [selected, setSelected] = useF(null);
  const [reviewPrompt, setReviewPrompt] = useF(null);
  const [editRow, setEditRow] = useF(null);
  const [changedDocs, setChangedDocs] = useF([]);
  const [otherOpen, setOtherOpen] = useF(false);
  React.useEffect(()=>{ setOtherOpen(false); }, [reviewPrompt]);
  const [resolveNote, setResolveNote] = useF("");
  const [resolvedMap, setResolvedMap] = useF({});
  // switching audits from the header dropdown remounts in place: no slide-in,
  // just a short loader over the same drawer
  const [shown, setShown] = useF(!!instant);
  const [switching, setSwitching] = useF(!!instant);
  React.useEffect(()=>{ if (instant) { const t = setTimeout(()=>setSwitching(false), 650); return ()=>clearTimeout(t); } const t = requestAnimationFrame(()=>setShown(true)); return ()=>cancelAnimationFrame(t); }, []);
  const close = () => { setShown(false); setTimeout(()=>onClose&&onClose(), 260); };
  const toggleReviewed = (k)=>setReviewed(o=>{ const n={...o}; if (n[k]) delete n[k]; else { n[k]=true; setFlagged(f=>{ const g={...f}; delete g[k]; return g; }); } return n; });
  const stamp = ()=>{ const d=new Date(); const p=(n)=>String(n).padStart(2,"0"); const h=d.getHours(); return `${p(d.getMonth()+1)}/${p(d.getDate())}/${String(d.getFullYear()).slice(2)} ${p(h%12||12)}:${p(d.getMinutes())} ${h<12?"AM":"PM"}`; };
  const resolveRow = (row, note)=>setResolvedMap(m=>({ ...m, [row.indicator]: { by:"Fiona Gallagher", at:stamp(), note:(note||"").trim() } }));
  const activeDocs = selected ? (selected.docs||[]).map(k=>PB_DOCS[k]).filter(Boolean) : [];
  const compare = activeDocs.length > 1;
  const [resultOverride, setResultOverride] = useF({});
  const [annotSubIdx, setAnnotSubIdx] = useF(null);
  const [annotSlotIdx, setAnnotSlotIdx] = useF(null);
  const baseGroups = pbGroupsFor(r);
  const groups = React.useMemo(()=>baseGroups.map(g=>({ ...g, rows:g.rows.map(x=>resultOverride[x.indicator] ? { ...x, matches:resultOverride[x.indicator], source:"user", reviewSource:"user" } : x) })), [baseGroups, resultOverride]);
  const totalUnmet = groups.reduce((n,g)=>n+g.rows.filter(x=>x.matches==="Unmet").length,0);
  const tcUnmet = groups.find(g=>g.key==="TC").rows.filter(x=>x.matches==="Unmet").length;
  const allMet = totalUnmet === 0;
  // patient result follows every rule: all met → Met, any unmet → Unmet
  React.useEffect(()=>{ onResultChange && onResultChange(pbRowKey(r), allMet); }, [allMet]);
  // the grid's Reviewed checkbox marks every rule in this record as verified
  React.useEffect(()=>{
    if (!preVerified) return;
    const seed = {};
    pbFlattenIndicators(groups).forEach(x=>{ seed[x.indicator] = true; });
    setReviewed(seed);
    setFlagged({});
  }, [preVerified, r.mrn]);
  // seed the drawer's follow-up flags from the same default the grid badge uses
  React.useEffect(()=>{
    if (preVerified) return;
    const n = pbDefaultFlagCount(r);
    if (!n) return;
    const seed = {};
    pbFlattenIndicators(groups).filter(x=>x.matches==="Unmet").slice(0, n).forEach(x=>{ seed[x.indicator] = true; });
    setFlagged(seed);
  }, [r.mrn]);
  const [groupBy, setGroupBy] = useF("none");
  const shownGroups = groupBy === "document" ? pbGroupByDocument(groups)
    : groupBy === "function" ? pbGroupByFunction(groups)
    : groupBy === "none" ? [{ key:"ALL", label:"All audit rules", rows:pbFlattenIndicators(groups) }]
    : groups;
  const allVerified = React.useMemo(()=>{ const flat = pbFlattenIndicators(groups); return flat.length>0 && flat.every(x=>reviewed[x.indicator]); }, [reviewed, groups]);
  React.useEffect(()=>{ if (allVerified && onAllVerified) onAllVerified(pbRowKey(r)); }, [allVerified]);
  const [showAutoLog, setShowAutoLog] = useF(!!r._focusAutoLog);
  const [fullScreenDoc, setFullScreenDoc] = useF(false);
  const [liveAnnotations, setLiveAnnotations] = useF({});
  const [annotateMode, setAnnotateMode] = useF(false);
  React.useEffect(()=>{ setAnnotateMode(false); }, [editRow && editRow.indicator]);
  React.useEffect(()=>{ setLiveAnnotations({}); }, [editRow && editRow.indicator]);
  const [pickTarget, setPickTarget] = useF(null);
  const [pickFocus, setPickFocus] = useF(null);
  const [keyRemap, setKeyRemap] = useF({});
  React.useEffect(()=>{ setPickTarget(null); setPickFocus(null); }, [editRow && editRow.indicator]);
  // In edit-reference pick mode a click only stages ONE highlighted selection;
  // it's applied to the reference when the auditor hits Confirm Selection.
  const onFieldClick = (key)=> pickTarget ? setLiveAnnotations(a=> a[key] ? {} : { [key]:1 }) : setLiveAnnotations(a=>{
    if (a[key]) { const rest={...a}; delete rest[key]; return rest; }
    return { ...a, [key]: Object.keys(a).length+1 };
  });
  const [confirmedRefs, setConfirmedRefs] = useF({});
  const [logEntries, setLogEntries] = useF([]);
  // every edit-panel action lands in the Audit Log, with or without a note
  const sessRef = React.useRef(0);
  React.useEffect(()=>{ if (editRow) sessRef.current = Date.now(); }, [editRow && editRow.indicator]);
  const addLog = (indicator, partial)=>setLogEntries(l=>[{ indicator, field:"—", prev:"—", next:"—", note:"", by:"Fiona Gallagher", at:stamp(), sid:sessRef.current, ...partial }, ...l]);
  const onConfirmAnnotations = (docLabel)=>{
    if (!editRow) return;
    if (pickTarget) {
      const key = Object.keys(liveAnnotations)[0];
      if (key) pickTarget(key);
      setPickTarget(null); setPickFocus(key || null); setAnnotateMode(false); setLiveAnnotations({});
      return;
    }
    const items = Object.keys(liveAnnotations).sort((a,b)=>liveAnnotations[a]-liveAnnotations[b]).map((key,i)=>{
      const [doc,field] = key.split(".");
      const f = (PB_DOC_FIELDS[doc]||{})[field];
      const label = field==="narrative" ? "Narrative" : (f ? f.label : field);
      const value = field==="narrative" ? "Left blank — no narrative text recorded" : (f ? f.value : "");
      const line = 12 + i*4;
      return { label, value, line: label + " - " + value, fieldKey:key, sub:annotSubIdx, slot:annotSlotIdx, text: label + " : " + value, source: `${docLabel}, line ${line}-${line+2}` };
    });
    setConfirmedRefs(m=>({ ...m, [editRow.indicator]: [ ...(m[editRow.indicator]||[]), ...items ] }));
    // a sub-field holds one line — end annotation once it's filled
    if (annotSlotIdx!==null) { setAnnotateMode(false); setAnnotSubIdx(null); setAnnotSlotIdx(null); }
    items.forEach(it=>addLog(editRow.indicator, { action:"Annotation added", field:it.label, next:it.value, src:it.source }));
    setLiveAnnotations({});
  };
  const onRemoveRef = (indicator, idx)=> setConfirmedRefs(m=>({ ...m, [indicator]: (m[indicator]||[]).filter((_,i)=>i!==idx) }));
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex"}}>
      <style>{".pb-thin-scroll{scrollbar-width:thin;scrollbar-color:#c3cbd6 transparent}.pb-thin-scroll::-webkit-scrollbar{width:3px;height:3px}.pb-thin-scroll::-webkit-scrollbar-track{background:transparent}.pb-thin-scroll::-webkit-scrollbar-thumb{background:#c3cbd6;border-radius:3px}.pb-thin-scroll::-webkit-scrollbar-corner{background:transparent}"}</style>
      <div onClick={close} style={{position:"absolute",inset:0,background:"rgba(15,23,42,.45)",opacity:shown?1:0,transition:instant?"none":"opacity .26s ease"}} />
      <div style={{position:"relative",marginLeft:"auto",width:"99vw",height:"100%",background:"#fff",display:"flex",flexDirection:"column",boxShadow:"-8px 0 30px rgba(0,0,0,.15)",transform:shown?"translateX(0)":"translateX(100%)",transition:(instant&&shown&&switching)?"none":"transform .3s cubic-bezier(.22,.61,.36,1)"}}>
        {switching && (
          <div style={{position:"absolute",inset:0,zIndex:50,background:"rgba(255,255,255,.92)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
            <svg width="34" height="34" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" stroke="#e2e8f0" strokeWidth="4"/><circle cx="25" cy="25" r="20" fill="none" stroke="#1677FF" strokeWidth="4" strokeLinecap="round" strokeDasharray="40 126"><animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite"/></circle></svg>
            <span style={{font:"400 13px/18px Roboto",color:"#475569"}}>Loading audit {pbAuditLabel(r)}…</span>
          </div>
        )}
        {!fullScreenDoc && <div style={{height:72,boxShadow:"0 4px 4px rgba(0,0,0,0.06)",display:"flex",alignItems:"center",padding:"0 24px",flexShrink:0,gap:14}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#3F7EA1"/></svg>
          <span style={{font:"500 20px/24px Roboto",color:"rgba(0,0,0,.75)",textTransform:"capitalize"}}>{r.name || "Patient"} - {r.mrn}</span>
          <span style={{font:"500 20px/24px Roboto",color:"rgba(0,0,0,.75)",marginLeft:20}}>SOC : {r.soc}</span>
          <span style={{display:"inline-flex",alignItems:"center",gap:8,background:allMet?"#2E9E4A":"#D6392C",color:"#fff",borderRadius:20,padding:"6px 14px",font:"500 13px/16px Roboto",marginLeft:16,whiteSpace:"nowrap"}}>{allMet ? "✓ Pre-bill Requirement Met" : "✕ Pre-bill Requirement Unmet"}</span>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:11}}>
            <span style={{font:"400 16px/24px Roboto",color:"rgba(0,0,0,.75)"}}>Audit :</span>
            <span style={{position:"relative",display:"inline-flex",alignItems:"center",gap:8,borderRadius:6,boxShadow:"inset 0 0 0 1px #1677FF",padding:"2px 16px",font:"400 14px/22px Roboto",color:"#1677FF"}}>
              {r.auditDate || "07/18/25"} · {r.auditTime || "09:04 AM"} — {r.trigger || "Pre-Bill"} <span style={{fontSize:10}}>▾</span>
              <select value={pbRowKey(r)} onChange={(e)=>{ const nx = pbAuditsFor(r).find(x=>pbRowKey(x)===e.target.value); if (nx && onSwitchAudit) onSwitchAudit(nx); }} style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0,cursor:"pointer",border:"none"}}>
                {pbAuditsFor(r).length ? pbAuditsFor(r).map(x=>(<option key={pbRowKey(x)} value={pbRowKey(x)}>{pbAuditLabel(x)}</option>)) : <option value={pbRowKey(r)}>{pbAuditLabel(r)}</option>}
              </select>
            </span>
            <span onClick={close} style={{cursor:"pointer",fontSize:22,color:"#333",marginLeft:14}}>✕</span>
          </div>
        </div>}

        {fullScreenDoc ? null : !showAutoLog ? (
          <div style={{display:"flex",alignItems:"flex-end",padding:"8px 24px 0",background:"#fff",flexShrink:0}}>
            <button onClick={()=>setShowAutoLog(false)} style={{appearance:"none",WebkitAppearance:"none",outline:"none",boxShadow:"none",background:"#fff",border:"1px solid #CFCFCF",borderBottom:"none",borderRadius:"6px 6px 0 0",cursor:"pointer",padding:"9px 18px",font:"500 14px/18px Roboto",color:"#1677FF",marginRight:4,marginBottom:-1,position:"relative",zIndex:2}}>Pre Bill Audit</button>
            <a href="#" onClick={(e)=>{e.preventDefault(); setShowAutoLog(true);}} style={{marginLeft:"auto",marginBottom:10,font:"400 13px/16px Roboto",color:"#1677FF",textDecoration:"none",cursor:"pointer"}}>Automation Log</a>
          </div>
        ) : (
          <div style={{padding:"8px 24px 0",flexShrink:0}}>
            <a href="#" onClick={(e)=>{e.preventDefault(); setShowAutoLog(false);}} style={{display:"inline-flex",alignItems:"center",gap:6,font:"400 13px/18px Roboto",color:"#1677FF",textDecoration:"none",marginBottom:8,paddingBottom:6}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="#1677FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Patient Information
            </a>
            <div style={{display:"flex",alignItems:"flex-end",position:"relative"}}>
              <div style={{background:"#fff",border:"1px solid #CFCFCF",borderBottom:"none",borderRadius:"6px 6px 0 0",padding:"9px 18px",font:"500 14px/18px Roboto",color:"#1677FF",marginBottom:-1,position:"relative",zIndex:2}}>Automation Log</div>
            </div>
          </div>
        )}

        {showAutoLog ? (
          <div style={{flex:1,overflow:"hidden",margin:"0 24px 24px",border:"1px solid #CFCFCF",borderRadius:"0 0 6px 6px",display:"flex",flexDirection:"column"}}>
            <PBAutomationLogView patient={r} onRefClick={()=>{ if (onOpenLog) { onOpenLog(r.name); close(); } }} />
          </div>
        ) : (
        <div style={{flex:1,overflow:"hidden",display:"flex",margin:fullScreenDoc?0:"0 24px 24px",padding:fullScreenDoc?0:16,gap:24,border:fullScreenDoc?"none":"1px solid #CFCFCF",borderRadius:fullScreenDoc?0:"0 0 6px 6px"}}>
          {!fullScreenDoc && (
          <div style={{width:"42%",minWidth:380,maxWidth:740,display:"flex",flexDirection:"column",position:"relative",transition:"width .22s ease, min-width .22s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:14,rowGap:10,flexWrap:"wrap",paddingBottom:14,flexShrink:0,opacity:editRow?0.18:1,pointerEvents:editRow?"none":"auto",transition:"opacity .12s"}}>
              {(()=>{ const all = pbFlattenIndicators(groups);
                const unmetRows = all.filter(r=>r.matches==="Unmet");
                const on = showOnlyUnmet==="unmet";
                return (
                  <React.Fragment>
                    <span style={{flexShrink:0,background:"#FDF2F1",border:"1px solid #f4dbd8",borderRadius:6,padding:"5px 11px",font:"500 12px/16px Roboto",color:"#B3261E",whiteSpace:"nowrap"}}>
                      {unmetRows.length} Unmet overall
                    </span>
                    <select value={groupBy} onChange={e=>setGroupBy(e.target.value)} style={{flexShrink:0,maxWidth:150,border:"1px solid #d8dee6",borderRadius:5,padding:"5px 6px",font:"400 12px/16px Roboto",color:"#334155",background:"#fff",outline:"none",cursor:"pointer"}}>
                      <option value="function">Group by Functional Section</option>
                      <option value="none">No Grouping</option>
                    </select>
                    <div onClick={()=>setRowFilter(on?"all":"unmet")} style={{marginLeft:"auto",flexShrink:0,display:"inline-flex",alignItems:"center",gap:9,cursor:"pointer",whiteSpace:"nowrap"}}>
                      <span style={{font:"400 12px/16px Roboto",color:"#475569"}}>Show Only Unmet</span>
                      <span style={{width:34,height:18,borderRadius:999,background:on?"#1677FF":"#cbd5e1",position:"relative",transition:"background .18s ease",flexShrink:0}}>
                        <span style={{position:"absolute",top:2,left:on?18:2,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left .18s ease"}} />
                      </span>
                    </div>
                  </React.Fragment>
                );
              })()}
            </div>
            <div style={{flex:1,minHeight:0,position:"relative",display:"flex",flexDirection:"column"}}>
            <div className="pb-thin-scroll" style={{flex:1,minHeight:0,overflowY:"auto",overflowX:"hidden",paddingRight:1}}>
              <div style={{border:"1px solid #e5e7eb",borderRadius:6,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:PB_ROW_GRID,gap:10,padding:"10px 10px",font:"400 12px/16px Roboto",color:"rgba(0,0,0,.65)",background:"#fafbfc",borderBottom:"1px solid #e5e7eb",position:"sticky",top:0,zIndex:2,opacity:editRow?0.18:1,pointerEvents:editRow?"none":"auto",transition:"opacity .12s"}}>
                <div></div><div>Role</div><div>Rule</div><div>Summary</div>
                <div style={{textAlign:"center"}}>Audit Result</div>
                <div style={{textAlign:"center"}}>Actions</div>
              </div>
              <div className="pb-thin-scroll" style={{flex:1,overflow:"auto"}}>
              {shownGroups.map((g,gi)=>(<PBAuditGroup key={groupBy+"-"+g.key} group={g} defaultOpen={groupBy==="none" ? true : (groupBy==="document" ? gi===0 : undefined)} hideHeader={groupBy==="none"} rowFilter={showOnlyUnmet} reviewed={reviewed} flagged={flagged} onToggleFlag={toggleFlag} confirmedRefs={confirmedRefs} onRemoveRef={onRemoveRef} onToggleReviewed={toggleReviewed} onRequestReview={(p)=>{ setReviewPrompt(p); setChangedDocs([]); setResolveNote(""); setSelected(p.row); }} resolved={resolvedMap} onRequestResolve={(row, anchor)=>{ setReviewPrompt({ mode:"resolve", row, anchor, key:null }); setChangedDocs([]); setResolveNote(""); }} onEdit={(r)=>{ if(r) setSelected(r); setEditRow(r); }} editRow={editRow} compact={false} selected={selected} onSelect={setSelected} />))}
              </div>
              </div>
            </div>
            {editRow && (
              <div style={{position:"absolute",inset:0,zIndex:20,display:"flex",alignItems:"center",justifyContent:"center",padding:"6px 2px",pointerEvents:"none"}}>
                <div className="pb-thin-scroll" style={{pointerEvents:"auto",width:"100%",maxHeight:"100%",overflowY:"auto",background:"#fff",border:"1px solid #e6ebf1",borderRadius:10,boxShadow:"0 18px 44px rgba(15,23,42,.20)"}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 14px",borderBottom:"1px solid #eef1f5",background:"#F5F9FF",position:"sticky",top:0,zIndex:2}}>
                    <div style={{minWidth:0,flex:1}}>
                      <div style={{font:"500 13px/18px Roboto",color:"#1A2330",overflowWrap:"anywhere",textWrap:"pretty"}}>{editRow.indicator}</div>
                      <div style={{font:"400 12px/17px Roboto",color:"#64748b",overflowWrap:"anywhere",textWrap:"pretty",marginTop:3}}>{pbFoundValue(editRow)}</div>
                    </div>
                    <PBMatchPill value={editRow.matches} source={editRow.reviewSource} />
                    <span onClick={()=>setEditRow(null)} title="Close" style={{cursor:"pointer",fontSize:16,lineHeight:1,color:"#64748b",padding:2}}>✕</span>
                  </div>
                  <PBEditPanel row={editRow} floating compact annotateOn={annotateMode} onAnnotateMode={(v,sub,slot)=>{ setAnnotateMode(v); setAnnotSubIdx(v && sub!==undefined ? sub : null); setAnnotSlotIdx(v && slot!==undefined ? slot : null); }} onPickFromDoc={(fn, focusKey)=>{ setPickTarget(fn ? ()=>fn : null); setPickFocus(fn ? (focusKey||null) : null); setLiveAnnotations({}); setAnnotateMode(!!fn); }} onFocusRef={(k)=>setPickFocus(k||null)} onStatusChange={(v)=>setResultOverride(m=>({ ...m, [editRow.indicator]: v }))} onRefKeyChange={(from,to)=>setKeyRemap(m=>({ ...m, [editRow.indicator]: { ...(m[editRow.indicator]||{}), [from]:to } }))} onClose={()=>setEditRow(null)} refs={(confirmedRefs||{})[editRow.indicator]||[]} onRemoveRef={(idx)=>onRemoveRef(editRow.indicator,idx)} onLog={(partial)=>{ addLog(editRow.indicator, partial); if (partial && partial.field==="Audit result" && partial.next) { const v = /unmet/i.test(partial.next) ? "Unmet" : "Met"; setResultOverride(m=>({ ...m, [editRow.indicator]: v })); // an Unmet rule re-annotated and saved as Requirement Met counts as resolved
                    if (v==="Met" && /unmet/i.test(String(partial.prev||""))) setResolvedMap(m=>({ ...m, [editRow.indicator]: { by:"Fiona Gallagher", at:stamp(), note:(partial.note||"").trim(), via:"edit" } }));
                    else if (v==="Unmet") setResolvedMap(m=>{ const rest={...m}; delete rest[editRow.indicator]; return rest; }); } }} />
                </div>
              </div>
            )}
            </div>
          </div>
          )}

          <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,background:"#f4f5f7",borderRadius:6,overflow:"hidden"}}>
            <PBDocumentViewer docs={activeDocs} patient={r} onCloseDrawer={close} indicator={selected ? selected.indicator : null} row={selected} flatRows={pbFlattenIndicators(groups)} onSelectRow={setSelected} fullScreen={fullScreenDoc} onToggleFullScreen={()=>setFullScreenDoc(v=>!v)} onClearFilter={()=>setSelected(null)} groups={groups} editRow={editRow} annotations={liveAnnotations} onFieldClick={onFieldClick} onConfirm={onConfirmAnnotations} annotateOn={annotateMode} picking={!!pickTarget || !!pickFocus} pickFocus={pickFocus} keyRemap={editRow ? (keyRemap[editRow.indicator]||{}) : {}} annotTag={(n)=>{ if (annotSubIdx===null || !editRow) return null; const lt=(i)=>String.fromCharCode(97+i); const q = pbSubCriteriaFor(editRow)[annotSubIdx]; const ev = pbEvidenceFor(editRow); const base = (q && q.logic) ? (q.slotTexts||[]).filter(Boolean).length : q ? pbRefsForSub(q,(ev.sources||[]).map((f,k)=>({ f, k })),x=>x.k).length : 0; const extra = ((confirmedRefs||{})[editRow.indicator]||[]).filter(x=>x.sub===annotSubIdx).length; return (annotSubIdx+1)+lt(base+extra+n-1); }}
              logExtra={logEntries.concat(Object.keys(resolvedMap).map(ind=>({ indicator:ind, action:"Resolved", field:"Audit result", prev:"Unmet", next:"Resolved", by:resolvedMap[ind].by, src:resolvedMap[ind].note || "Findings resolved by auditor", at:resolvedMap[ind].at })))} />
          </div>
        </div>
        )}

        {reviewPrompt && (()=>{
          const isResolve = reviewPrompt.mode === "resolve";
          const promptDocs = (reviewPrompt.row.docs||[]).map(k=>PB_DOCS[k]).filter(Boolean);
          const toggleDoc = (label)=>setChangedDocs(l=>l.includes(label)?l.filter(x=>x!==label):[...l,label]);
          // flip below the anchor when there isn't room above, so the header is never cut off
          const anchorY = reviewPrompt.anchor ? reviewPrompt.anchor.y : 400;
          const EST_H = 420;
          const below = anchorY - EST_H - 20 < 8;
          return (
            <div style={{position:"fixed",left:Math.max(320, Math.min(window.innerWidth-220, (reviewPrompt.anchor?reviewPrompt.anchor.x:600))),top:below ? anchorY+38 : anchorY-14,transform:below?"translate(-50%, 0)":"translate(-50%, -100%)",background:"#fff",borderRadius:10,boxShadow:"0 12px 34px rgba(15,23,42,.22)",border:"1px solid #e2e8f0",padding:"14px 16px",display:"flex",flexDirection:"column",gap:11,zIndex:2100,width:400}}>
              <span style={{position:"absolute",...(below?{top:-7}:{bottom:-7}),left:"50%",transform:"translateX(-50%) rotate(45deg)",width:12,height:12,background:"#fff",...(below?{borderLeft:"1px solid #e2e8f0",borderTop:"1px solid #e2e8f0"}:{borderRight:"1px solid #e2e8f0",borderBottom:"1px solid #e2e8f0"})}} />
              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <div style={{minWidth:0}}>
                  <div style={{font:"500 14px/19px Roboto",color:"#1a1a1a"}}>{isResolve ? "Resolve this finding — was a document changed?" : "This finding is unmet — was a document changed?"}</div>
                  <div style={{font:"400 12px/17px Roboto",color:"#64748b",marginTop:3,overflowWrap:"anywhere",textWrap:"pretty"}}>{reviewPrompt.row.indicator}</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                {promptDocs.map((d)=>{
                  const on = changedDocs.includes(d.label);
                  return (
                    <span key={d.label} onClick={()=>toggleDoc(d.label)} style={{display:"inline-flex",alignItems:"center",gap:8,border:`1px solid ${on?"#1677FF":"#d8dee6"}`,background:on?"#EAF3FF":"#fff",color:on?"#1677FF":"#334155",borderRadius:6,padding:"6px 12px",font:"400 12px/16px Roboto",cursor:"pointer"}}>
                      <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:3,border:`1px solid ${on?"#1677FF":"#c3ccd6"}`,background:on?"#1677FF":"#fff",color:"#fff",fontSize:10,lineHeight:1}}>{on?"✓":""}</span>
                      {d.label}
                    </span>
                  );
                })}
              </div>
              {(()=>{ const promptLabels = promptDocs.map(d=>d.label);
                const otherDocs = Object.keys(PB_DOCS).map(k=>PB_DOCS[k]).filter(d=>d && !promptLabels.includes(d.label));
                const picked = changedDocs.filter(l=>!promptLabels.includes(l));
                return (
                  <div>
                    <div style={{font:"500 11px/15px Roboto",color:"#64748b",marginBottom:5}}>Other documents updated <span style={{color:"#94a3b8",fontWeight:400}}>(optional — changes not tied to this rule)</span></div>
                    <div style={{position:"relative"}}>
                      <div onClick={()=>setOtherOpen(v=>!v)} style={{display:"flex",alignItems:"center",gap:8,border:"1px solid "+(otherOpen?"#1677FF":"#d8dee6"),borderRadius:5,padding:"7px 9px",background:"#fff",cursor:"pointer"}}>
                        <span style={{flex:1,minWidth:0,display:"flex",alignItems:"center",gap:5,overflow:"hidden"}}>
                          {picked.length===0 ? (
                            <span style={{font:"400 12px/16px Roboto",color:"#94a3b8"}}>Select documents…</span>
                          ) : (
                            <React.Fragment>
                              <span title={picked[0]} style={{minWidth:0,flex:"0 1 auto",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",background:"#EAF3FF",border:"1px solid #bcd9ff",color:"#1677FF",borderRadius:4,padding:"1px 7px",font:"400 11.5px/16px Roboto"}}>{picked[0]}</span>
                              {picked.length>1 && <span title={picked.slice(1).join(", ")} style={{flexShrink:0,background:"#f1f5f9",border:"1px solid #dbe3ec",color:"#475569",borderRadius:4,padding:"1px 7px",font:"500 11.5px/16px Roboto",whiteSpace:"nowrap"}}>+{picked.length-1} more</span>}
                            </React.Fragment>
                          )}
                        </span>
                        <span style={{flexShrink:0,fontSize:10,color:"#64748b",transform:otherOpen?"rotate(180deg)":"none",transition:"transform .15s"}}>▾</span>
                      </div>
                      {otherOpen && (
                        <div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:4,background:"#fff",border:"1px solid #e2e8f0",borderRadius:6,boxShadow:"0 10px 24px rgba(15,23,42,.14)",padding:4,zIndex:5,maxHeight:220,overflow:"auto"}}>
                          {(()=>{ const all = otherDocs.length>0 && picked.length===otherDocs.length; const some = picked.length>0 && !all;
                            const row = (label, on, partial, onClick, bold)=>(
                              <div key={label} onClick={onClick} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 8px",borderRadius:4,cursor:"pointer",font:`${bold?500:400} 12px/16px Roboto`,color:"#1a1a1a"}} onMouseEnter={e=>e.currentTarget.style.background="#f5f8fc"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                                <span style={{flexShrink:0,display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:3,border:`1px solid ${(on||partial)?"#1677FF":"#c3ccd6"}`,background:(on||partial)?"#1677FF":"#fff",color:"#fff",fontSize:10,lineHeight:1}}>{on?"✓":partial?"–":""}</span>
                                {label}
                              </div>
                            );
                            return (
                              <React.Fragment>
                                {row("Select All", all, some, ()=>{ const labels = otherDocs.map(d=>d.label); setChangedDocs(c=> all ? c.filter(l=>!labels.includes(l)) : Array.from(new Set(c.concat(labels)))); }, true)}
                                <div style={{height:1,background:"#eef1f5",margin:"3px 4px"}}></div>
                                {otherDocs.map(d=>row(d.label, picked.includes(d.label), false, ()=>toggleDoc(d.label)))}
                              </React.Fragment>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              {isResolve && (
                <div>
                  <div style={{font:"500 11px/15px Roboto",color:"#64748b",marginBottom:5}}>Resolution notes</div>
                  <textarea value={resolveNote} onChange={e=>setResolveNote(e.target.value)} placeholder="What was corrected, and where?" rows={3} style={{width:"100%",boxSizing:"border-box",resize:"vertical",border:"1px solid #d8dee6",borderRadius:5,padding:"8px 10px",font:"400 12px/17px Roboto",color:"#1a1a1a",outline:"none"}} />
                </div>
              )}
              <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"flex-end"}}>
                <button type="button" onClick={()=>{ setReviewPrompt(null); setChangedDocs([]); setResolveNote(""); }} style={{background:"#fff",border:"1px solid #d8dee6",borderRadius:4,padding:"7px 14px",font:"400 12px/16px Roboto",color:"#334155",cursor:"pointer",whiteSpace:"nowrap"}}>Cancel</button>
                {isResolve
                  ? <button type="button" onClick={()=>{ resolveRow(reviewPrompt.row, resolveNote); setReviewPrompt(null); setChangedDocs([]); setResolveNote(""); }} style={{background:"#2E7D3A",border:"none",borderRadius:4,padding:"7px 16px",font:"500 12px/16px Roboto",color:"#fff",cursor:"pointer",whiteSpace:"nowrap"}}>Resolve Findings</button>
                  : <button type="button" onClick={()=>{ toggleReviewed(reviewPrompt.row.indicator); setReviewPrompt(null); setChangedDocs([]); }} style={{background:"#2563eb",border:"none",borderRadius:4,padding:"7px 16px",font:"500 12px/16px Roboto",color:"#fff",cursor:"pointer",whiteSpace:"nowrap"}}>Mark as Reviewed</button>}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// Center-wide Automation Log — real pbRows data (not a generic mock), so a
// Ref ID here always maps to an actual patient the drawer can open. Card-row
// and summary-strip styling mirrors the Eligibility/Authorization Automation Log.
const PB_AL_SUMMARY_CARDS = [
  { id:"all",       label:"All Transaction", color:"rgb(21,95,130)",   match:()=>true,                          icon:null },
  { id:"completed", label:"Complete",        color:"rgb(14,165,233)",  match:(r)=>r.status==="completed",       icon:(window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png" },
  { id:"warning",   label:"Incomplete",      color:"rgb(245,158,11)",  match:(r)=>r.status==="needs-attention", icon:(window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png" },
  { id:"inprogress",label:"In Progress",     color:"rgb(148,163,184)", match:(r)=>r.status==="in-progress",     icon:(window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png" },
];
function PBALSummaryStrip({ rows, activeCard, onPick }) {
  const pad = (n)=>String(n).padStart(2,"0");
  return (
    <div style={{display:"flex",gap:28,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
      {PB_AL_SUMMARY_CARDS.map(c=>{
        const active=activeCard===c.id, dim=activeCard&&!active, isAll=c.id==="all";
        const val=rows.filter(c.match).length;
        return (
          <div key={c.id} role="button" onClick={()=>onPick(active?null:c.id)}
            style={{minWidth:82,display:"flex",flexDirection:"column",gap:8,cursor:"pointer",opacity:(dim&&!isAll)?0.4:1,transition:"opacity .12s"}}>
            <div style={{height:3,borderRadius:2,background:c.color,opacity:active?1:0.85}}></div>
            <div style={{display:"flex",alignItems:"center",gap:5,font:"400 13px/17px Roboto",color:active?"#0f172a":(dim&&isAll)?"#b0b0b0":"#605D5D",whiteSpace:"nowrap"}}>
              {c.icon && <img src={c.icon} alt="" style={{width:14,height:14,objectFit:"contain",flexShrink:0}} />}
              {c.label}
            </div>
            <div style={{font:"500 16px/20px Roboto",color:active?"#0f172a":(dim&&isAll)?"#b0b0b0":"#605D5D"}}>{pad(val)}</div>
            {activeCard && c.id==="all" && (
              <button type="button" onClick={(e)=>{e.stopPropagation();onPick(null);}} style={{marginTop:2,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:11}}>↻</span>Reset
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
const PB_AL_COLS = [
  { key:"ref",     label:"Ref ID",              w:"minmax(100px,1fr)",   sort:true },
  { key:"mrn",     label:"MRN",                 w:"minmax(110px,1fr)",   sort:true },
  { key:"name",    label:"Patient Name",        w:"minmax(110px,1fr)",   sort:true },
  { key:"trigger", label:"Audit Type",          w:"minmax(90px,0.85fr)", sort:true },
  { key:"ts",      label:"Start Time",          w:"minmax(100px,0.95fr)",sort:true },
  { key:"te",      label:"End Time",            w:"minmax(100px,0.95fr)",sort:true },
  { key:"status",  label:"AT Status",           w:"104px",               sort:false, align:"center" },
  { key:"reason",  label:"Reason",              w:"minmax(160px,1.5fr)", sort:false, wrap:true },
  { key:"haltedAt",label:"Execution halted at", w:"minmax(125px,1.15fr)",sort:false, wrap:true },
  { key:"action",  label:"Action required",     w:"minmax(120px,1.1fr)", sort:false, wrap:true },
];
const PB_AL_STICKY = PB_AL_COLS[PB_AL_COLS.length-1].key;
const PB_AL_MIN_WIDTH = 1150;
const PB_AL_GRID = PB_AL_COLS.map(c=>c.w).join(" ");
function PBALHeader({ sortKey, sortDir, onSort }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:PB_AL_GRID,alignItems:"stretch",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",minHeight:44,minWidth:PB_AL_MIN_WIDTH,padding:"0 12px",gap:6}}>
      {PB_AL_COLS.map(c=>(
        <div key={c.key} onClick={c.sort?()=>onSort(c.key):undefined}
          style={{display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",gap:3,font:"500 11px/14px Roboto",color:"#64748b",cursor:c.sort?"pointer":"default",userSelect:"none",overflow:"hidden",padding:"4px 2px",whiteSpace:"normal",textWrap:"pretty",...(c.key===PB_AL_STICKY?{position:"sticky",right:-12,background:"#f8fafc",boxShadow:"-8px 0 8px -6px rgba(15,23,42,.14)",paddingRight:14,zIndex:3}:null)}}>
          {c.sort&&<ARVSortArrows active={sortKey===c.key} dir={sortDir} />}
          {c.label}
        </div>
      ))}
    </div>
  );
}
function PBALRow({ row, onOpenRow }) {
  const cell = {font:"500 12px/16px Roboto",color:"#333333",display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,padding:"0 2px"};
  const wrapCell = {font:"400 12px/16px Roboto",color:"#334155",display:"flex",alignItems:"center",minWidth:0,padding:"0 2px",whiteSpace:"normal",overflowWrap:"anywhere",textWrap:"pretty"};
  const AT_ICON = {
    completed: (window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png",
    "needs-attention": (window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png",
    "in-progress": (window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png",
  };
  const AT_LABEL = { completed:"Complete", "needs-attention":"Incomplete", "in-progress":"In Progress" };
  return (
    <div style={{display:"grid",gridTemplateColumns:PB_AL_GRID,alignItems:"center",minHeight:52,minWidth:PB_AL_MIN_WIDTH,padding:"6px 12px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:6,background:"#fff",boxShadow:"0 1px 2px rgba(15,23,42,0.03)",gap:6,position:"relative"}}>
      <div style={{position:"absolute",left:8,top:8,bottom:8,width:3,background:"#A66092",borderRadius:2}}></div>
      <div style={{...cell,color:"#2563eb",fontWeight:500,cursor:"pointer",paddingLeft:18}} onClick={()=>onOpenRow&&onOpenRow(row)}>{row.ref}</div>
      <div style={cell}>{row.mrn}</div>
      <div style={cell}>{row.name}</div>
      <div style={cell}>{row.trigger}</div>
      <div style={cell}>{row.ts}</div>
      <div style={cell}>{row.te}</div>
      <div style={{...cell,justifyContent:"center",gap:6}}><img src={AT_ICON[row.status]||AT_ICON.completed} alt="" style={{width:18,height:18,objectFit:"contain"}} />{AT_LABEL[row.status]||AT_LABEL.completed}</div>
      <div style={{...wrapCell,color:row.status==="needs-attention"?"#D6392C":"#94a3b8"}}>{row.reason}</div>
      <div style={{...wrapCell,color:row.status==="needs-attention"?"#334155":"#94a3b8"}}>{row.haltedAt}</div>
      <div style={{...wrapCell,color:row.status==="needs-attention"?"#334155":"#94a3b8",position:"sticky",right:-12,background:"#fff",boxShadow:"-8px 0 8px -6px rgba(15,23,42,.14)",paddingRight:14,zIndex:2}}>{row.action}</div>
    </div>
  );
}
function PBCenterAutomationLogView({ rows, onOpenRow, initialSearch }) {
  const [cardFilter, setCardFilter] = useF(null);
  const [searchQ, setSearchQ] = useF(initialSearch || "");
  React.useEffect(()=>{ if (initialSearch) setSearchQ(initialSearch); }, [initialSearch]);
  const [sortKey, setSortKey] = useF(null);
  const [sortDir, setSortDir] = useF("asc");
  const handleSort = (k)=>{ if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };
  const base = React.useMemo(()=>rows.map((r,i)=>{
    const status = pbAtOf(r)==="complete" ? "completed" : (pbAtOf(r)==="inprogress" ? "in-progress" : "needs-attention");
    const attention = status === "needs-attention";
    return {
      ...r,
      ref: "REFB3"+(r.mrn||"0000").slice(-6)+String(i+1).padStart(2,"0"),
      status,
      wf: "Pre-Bill Audit — Workflow",
      stage: status==="in-progress"
        ? ["Identify Records for Audit","Collect Data for Audit","Derive Audit Facts from Collected Data"][i % 3]
        : "Validate Audit Information Against Rules",
      ts: (r.auditDate||"07/18/25")+" "+(r.auditTime||"09:04 AM"),
      te: status==="in-progress" ? "—" : (r.auditDate||"07/18/25")+" "+(r.auditEndTime||"09:11 AM"),
      haltedAt: attention ? "Download 485 order from HCHB" : "—",
      reason: attention ? "Unable to fetch documentation for audit" : "—",
      action: attention ? "Audit the record manually" : "—",
    };
  }), [rows]);
  const activeCard = cardFilter ? PB_AL_SUMMARY_CARDS.find(c=>c.id===cardFilter) : null;
  const searched = searchQ ? base.filter(r=>[r.name,r.mrn,r.agent,r.ref].join(" ").toLowerCase().includes(searchQ.toLowerCase())) : base;
  const scoped = activeCard ? searched.filter(activeCard.match) : searched;
  const list = sortKey ? [...scoped].sort((a,b)=>{ const av=String(a[sortKey]||""), bv=String(b[sortKey]||""); return sortDir==="asc"?av.localeCompare(bv):bv.localeCompare(av); }) : scoped;
  return (
    <div style={{background:"#fff",minHeight:"100%"}}>
      <ARVFilterBarChips hideSearch={false} searchValue={searchQ} onSearch={setSearchQ} filterFields={[]} filterRows={base} fieldFilters={[]} onFieldFilters={()=>{}} />
      <div style={{padding:"20px 32px 0"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,flexWrap:"wrap",marginBottom:12}}>
          <div>
            <div style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Automation Log</div>
            <div style={{font:"400 13px/18px Roboto",color:"#3A424A",marginTop:8}}>Transaction Status of Pre-Bill Audit Workflows</div>
          </div>
          <PBALSummaryStrip rows={base} activeCard={cardFilter} onPick={setCardFilter} />
        </div>
        <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block",marginBottom:16}}>
          Click Ref ID to open that patient's Pre-Bill Audit slider
        </div>
        <div className="pb-thin-scroll" style={{overflow:"auto",maxHeight:"calc(100vh - 300px)",paddingBottom:10}}>
          <div style={{minWidth:PB_AL_MIN_WIDTH}}>
            <div style={{position:"sticky",top:0,zIndex:4}}>
              <PBALHeader sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
            </div>
            <div style={{paddingTop:8}}>
              {list.length===0
                ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>No records match the current filters.</div>
                : list.map((r,i)=><PBALRow key={i} row={r} onOpenRow={onOpenRow} />)}
              <div style={{padding:"12px 0",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {list.length} of {base.length} records shown</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function PreBillAuditSection({ sub, onSub }) {
  const subTabs = [
    { label: "Prebill Audit Request View", icon: "☰" },
    { label: "Automation Log",             icon: ""  },
  ];
  const [review, setReview] = useF(false);
  const [logFocusName, setLogFocusName] = useF("");
  const [openRow, setOpenRow] = useF(null);
  return (
    <div>
      <SectionBand title="Pre-Bill Audit Center" subTabs={subTabs} activeSub={sub||0} onSub={onSub} showReview={true} review={review} onReview={()=>setReview(v=>!v)} />
      {(sub||0)===0
        ? <PreBillRequestView review={review} onExitReview={()=>setReview(false)} onOpenLog={(name)=>{ setLogFocusName(name); onSub(1); }} openRow={openRow} onOpenRowConsumed={()=>setOpenRow(null)} />
        : <PBCenterAutomationLogView rows={pbRows} initialSearch={logFocusName} onOpenRow={(r)=>{ setOpenRow({ ...r, _focusAutoLog:true }); onSub(0); }} />}
    </div>
  );
}
