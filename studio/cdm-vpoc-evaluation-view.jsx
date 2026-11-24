
// CDM · VPOC Evaluation — mirrors the Notifications View: filter strip, title + clickable
// VPOC Status summary (top right) with the AT Status row beneath, grid table, review mode.
const { useState: useVPE, useEffect: useVPEE, useRef: useVPER } = React;

// id, name, mrn, branch, episode, stage, oasisType, oasisDate, evalInit, at, vpoc, ehr{note,disc,stage}, reason
const _VP = [
  ["v1","Marvin Mckinney","01500017797001","BC001","12345","Start of Care Eval","SOC","10/19/26","10/20/26","thumb","approved",["success","na","success"]],
  ["v2","Esther Howard","01500017797007","BC002","12736","Recert Eval","Recertification","10/20/26","10/21/26","thumb","approved",["na","na","success"]],
  ["v3","Cameron Williamson","01500017797005","BC001","12345","Start of Care Eval","SOC","10/21/26","10/22/26","hourglass","pending",["pending","na","pending"]],
  ["v4","Darrell Steward","01500017797003","BC003","12789","ROC Eval","ROC","10/21/26","10/22/26","warning","exception",["failed","na","pending"],"VPOC note not found in HCHB"],
  ["v5","Jane Cooper","01500017797004","BC001","12458","Recert Eval","Recertification","10/22/26","10/23/26","thumb","approved",["success","na","success"]],
  ["v6","Floyd Miles","01500017797006","BC002","12567","Start of Care Eval","SOC","10/23/26","10/24/26","warning","exception",["success","failed","na"],"Discrepancy between VPOC and OASIS"],
  ["v7","Brooklyn Simmons","01500017797002","BC003","12576","Recert Eval","Recertification","10/23/26","10/25/26","hourglass","pending",["success","success","pending"]],
  ["v8","Ronald Richards","01500017797008","BC001","12678","Recert Eval","Recertification","10/24/26","10/25/26","thumb","approved",["na","na","success"]],
  ["v9","Kathryn Hughes","01500017797009","BC002","12438","ROC Eval","ROC","10/25/26","10/26/26","warning","exception",["success","na","failed"],"Unable to update stage complete status"],
  ["v10","Albert Flores","01500017797023","BC003","12656","Start of Care Eval","SOC","10/26/26","10/27/26","hourglass","pending",["pending","na","pending"]],
  ["v11","Bessie Cooper","01500017797025","BC001","12438","Recert Eval","Recertification","10/27/26","10/28/26","thumb","approved",["success","na","success"]],
  ["v12","Thistlewood, Orla","01500017797031","BC002","12814","Recert Eval","SOC","10/27/26","10/28/26","hourglass","pending",["pending","na","pending"]],
  ["v13","Devon Lane","01500017797040","BC003","12902","ROC Eval","ROC","10/28/26","10/29/26","warning","exception",["failed","na","pending"],"VPOC note not found in HCHB"],
  ["v14","Arlene McCoy","01500017797041","BC001","12915","Start of Care Eval","SOC","10/28/26","10/29/26","thumb","approved",["na","na","success"]],
];
const vpePad = n => String(n).padStart(2,"0");
const VPE_ROWS = _VP.map(r=>({ id:r[0], name:r[1], mrn:r[2], branchId:r[3], episodeId:r[4], stageName:r[5], oasisType:r[6], oasisDate:r[7], evalInitDate:r[8], at:r[9], vpoc:r[10], ehr:{ note:r[11][0], disc:r[11][1], stage:r[11][2] }, atReason:r[12]||"", approvalDate: r[10]==="approved" ? (()=>{ const [m,d,y]=r[8].split("/").map(Number); const x=new Date(2000+y,m-1,d+1); return vpePad(x.getMonth()+1)+"/"+vpePad(x.getDate())+"/"+String(x.getFullYear()).slice(2); })() : "" }));
if (typeof window !== "undefined") window.VPOC_EVAL_ROWS = VPE_ROWS;

const vpeIcon = (k, fb) => (typeof window !== "undefined" && window.__resources && window.__resources[k]) || fb;
const VPE_DASH = <span style={{color:"#cbd5e1"}}>—</span>;
const VPE_AT_MAP = { completed:"thumb", warning:"warning", inprogress:"hourglass" };
const VPE_AT_ITEMS = [
  { id:"completed",  label:"Completed",       kind:"thumb" },
  { id:"warning",    label:"Needs Attention", kind:"warning", num:"#d97706" },
  { id:"inprogress", label:"In Progress",     kind:"hourglass" },
];
const VPE_STATUS = {
  approved:  { bg:"#f0fdf4", bd:"#16a34a", c:"#16a34a", label:"Approved" },
  pending:   { bg:"#eaf2f8", bd:"#3f7ba8", c:"#3f7ba8", label:"Pending" },
  exception: { bg:"#fff1f0", bd:"#dc2626", c:"#dc2626", label:"Exception" },
};
const VPE_BIZ = [
  { id:"all",       label:"All Records", color:"#64748b" },
  { id:"approved",  label:"Approved",    color:"#16a34a" },
  { id:"pending",   label:"Pending",     color:"#3f7ba8" },
  { id:"exception", label:"Exception",   color:"#dc2626" },
];

function VPEATIcon({ kind, reason }) {
  const st = {width:18,height:18,objectFit:"contain"};
  if (kind==="thumb")     return <img title="Completed" alt="Completed" src={vpeIcon("atCompleted","icons/at-completed.png")} style={st} />;
  if (kind==="warning")   return <img title={reason ? "Needs Attention - "+reason : "Needs Attention"} alt="Needs Attention" src={vpeIcon("atNeedsAttention","icons/at-needs-attention.png")} style={st} />;
  if (kind==="hourglass") return <img title="In Progress" alt="In Progress" src={vpeIcon("atInProgress","icons/at-in-progress.png")} style={st} />;
  return VPE_DASH;
}

function VPEStatusPill({ kind }) {
  const d = VPE_STATUS[kind]; if (!d) return VPE_DASH;
  return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"4px 10px",borderRadius:4,background:d.bg,border:`1px solid ${d.bd}`,color:d.c,font:"500 11px/16px Roboto",whiteSpace:"nowrap",minWidth:96,boxSizing:"border-box"}}>{d.label}</span>;
}

const VPE_EHR_STAGES = [["note","Missing VPOC Note"],["disc","Discrepancy Note"],["stage","Stage Complete Status"]];
const VPE_EHR_ST = { na:{ c:"#94a3b8", l:"NA" }, success:{ c:"#16a34a", l:"Success" }, failed:{ c:"#dc2626", l:"Failed" }, pending:{ c:"#94a3b8", l:"Pending" } };
function VPEEhrSync({ ehr }) {
  const [pos, setPos] = useVPE(null);
  const vals = VPE_EHR_STAGES.map(([k])=>ehr[k]);
  const all = vals.some(v=>v==="success") && vals.every(v=>v==="success"||v==="na"), anyFail = vals.some(v=>v==="failed"), dash = !all && !anyFail;
  const icon = all
    ? <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3.2 8.6 L6.3 11.7 L12.8 5.2" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    : anyFail
    ? <svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 4 L12 12 M12 4 L4 12" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/></svg>
    : <span style={{color:"#94a3b8",font:"500 12px/16px Roboto"}}>—</span>;
  return (
    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:28,height:24,cursor:"default"}}
      onMouseEnter={e=>{ const b=e.currentTarget.getBoundingClientRect(); setPos({ x:b.left+b.width/2, y:b.bottom+6 }); }}
      onMouseLeave={()=>setPos(null)}>
      {icon}
      {pos && ReactDOM.createPortal(
        <div style={{position:"fixed",left:pos.x,top:pos.y,transform:"translateX(-50%)",zIndex:1100,background:"#fff",border:"1px solid #e2e8f0",borderRadius:6,boxShadow:"0 6px 18px rgba(15,23,42,0.14)",padding:"10px 12px",minWidth:230,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none",whiteSpace:"nowrap"}}>
          <span style={{font:"500 12px/16px Roboto",color:"#0f172a"}}>EHR Sync</span>
          {VPE_EHR_STAGES.map(([k,l])=>{ const st = VPE_EHR_ST[ehr[k]]; return (
            <div key={k} style={{display:"flex",alignItems:"center",gap:8,font:"400 12px/16px Roboto",color:"#333"}}>
              <span style={{flex:1}}>{l}</span>
              {!st || (dash && ehr[k]!=="na") ? <span style={{font:"500 12px/14px Roboto",color:"#94a3b8"}}>—</span> : <span style={{display:"inline-flex",alignItems:"center",gap:5,font:"500 11px/14px Roboto",color:st.c}}><span style={{width:7,height:7,borderRadius:"50%",background:st.c}}></span>{st.l}</span>}
            </div>
          ); })}
        </div>, document.body
      )}
    </span>
  );
}

function VPEChip({ label, onRemove }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:10,background:"#f4f6f9",border:"1px solid #d8dee6",borderRadius:6,padding:"6px 10px",font:"400 12px/16px Roboto",color:"#334155",whiteSpace:"nowrap",flexShrink:0}}>
      {label}
      <button type="button" title="Remove filter" onClick={onRemove} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",border:"none",background:"transparent",color:"#64748b",fontSize:13,lineHeight:1,cursor:"pointer",padding:0}}>✕</button>
    </span>
  );
}

const VPE_FILTER_FIELDS = [
  { key:"branchId",  label:"Branch" },
  { key:"stageName", label:"HCHB Stage Name" },
  { key:"oasisType", label:"OASIS Type" },
];

function VPEFilterBar({ chips, datePicker, fieldFilters, onFieldFilters, onClearAll, searchValue, onSearch }) {
  const [open, setOpen] = useVPE(false);
  const [dpOpen, setDpOpen] = useVPE(false);
  const dref = useVPER(null);
  useVPEE(()=>{ if(!dpOpen) return; const h=(e)=>{ if(dref.current && !dref.current.contains(e.target)) setDpOpen(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[dpOpen]);
  const DP = typeof window !== "undefined" && window.DatePicker;
  const FP = typeof window !== "undefined" && window.FilterPopover;
  const labelOf = (k) => (VPE_FILTER_FIELDS.find(f=>f.key===k) || {}).label || k;
  const fieldTags = [];
  (fieldFilters||[]).forEach(f => f.values.forEach(v => fieldTags.push({
    id:`${f.field}:${v}`, label:`${labelOf(f.field)}: ${v}`,
    onRemove: () => onFieldFilters(fieldFilters.map(x => x.field===f.field ? {...x, values:x.values.filter(y=>y!==v)} : x).filter(x=>x.values.length)),
  })));
  return (
    <div style={{background:"#eef4fb",borderBottom:"1px solid #e2e8f0",padding:"10px 24px",display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap"}}>
      <div style={{position:"relative",flexShrink:0}} ref={dref}>
        <button type="button" onClick={()=>setDpOpen(v=>!v)} style={{background:"#fff",border:"1px solid #d8d8d8",borderRadius:4,padding:"5px 12px",font:"400 12px/16px Roboto",color:"#0f172a",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,whiteSpace:"nowrap"}}>
          {`Evaluation Init Date : ${datePicker.value ? datePicker.value.start + " – " + datePicker.value.end : "All"}`}
          <span style={{color:"#94a3b8",fontSize:9}}>▾</span>
        </button>
        {dpOpen && DP && <DP value={datePicker.value} available={datePicker.available} onChange={(d)=>{ datePicker.onChange(d); setDpOpen(false); }} />}
      </div>
      <div style={{position:"relative",flexShrink:0}}>
        <button type="button" onClick={()=>setOpen(v=>!v)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:6,padding:"5px 4px",whiteSpace:"nowrap"}}>
          <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:"#2563eb",color:"#fff",fontSize:10,fontWeight:600,lineHeight:1}}>+</span>
          Add More Filters
        </button>
        {open && FP && <FP fields={VPE_FILTER_FIELDS} rows={VPE_ROWS} initial={fieldFilters} onApply={(f)=>{ onFieldFilters(f); setOpen(false); }} onClose={()=>setOpen(false)} />}
      </div>
      <div className="chip-scroll" style={{display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap",overflowX:"auto",flex:"1 1 auto",minWidth:0}}>
        {chips.map(c => <VPEChip key={c.id} label={c.label} onRemove={c.onRemove} />)}
        {fieldTags.map(t => <VPEChip key={t.id} label={t.label} onRemove={t.onRemove} />)}
      </div>
      {(chips.length + fieldTags.length) > 0 && (
        <button type="button" onClick={onClearAll} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",padding:"5px 4px",flexShrink:0,whiteSpace:"nowrap"}}>Clear all</button>
      )}
      <div style={{position:"relative",flexShrink:0}}>
        <img src={vpeIcon("searchIcon","icons/search.svg")} alt="search" style={{width:14,height:14,objectFit:"contain",position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}} />
        <input type="text" value={searchValue} onChange={e=>onSearch(e.target.value)} placeholder="Search Patient, MRN, Episode ID" style={{width:240,background:"#fff",border:"1px solid #93c5e8",borderRadius:6,padding:"6px 12px 6px 32px",font:"400 12px/16px Roboto",color:"#0f172a",outline:"none"}} />
      </div>
    </div>
  );
}

function VPETitleCluster() {
  return (
    <div>
      <div style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>VPOC Evaluation</div>
      <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Status Summary of Verbal Plan of Care Evaluations</div>
    </div>
  );
}

function VPEStatusStrip({ activeStatus, onPick, counts, highlight }) {
  return (
    <div style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333333",flexShrink:0,letterSpacing:"0.01em",borderRadius:"8px 0 0 8px"}}>
        <span>VPOC</span><span>Status</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-start"}}>
        {VPE_BIZ.map(st=>{
          const active = activeStatus===st.id;
          const dim = activeStatus ? !active : !!(highlight && st.id!=="all" && !highlight.has(st.id));
          return (
            <div key={st.id} role="button" onClick={()=>onPick(active||st.id==="all"?null:st.id)}
              style={{flex:"0 0 auto",width:118,boxSizing:"border-box",padding:"10px 16px 12px",cursor:"pointer",opacity:(dim&&st.id!=="all")?0.35:1,transition:"opacity .12s, background .12s",background:active?"#f8fafc":"transparent"}}
              onMouseEnter={e=>{ if(!active&&!dim) e.currentTarget.style.background="#fafbfc"; }}
              onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
              <div style={{height:3,borderRadius:2,background:st.color,opacity:active?1:0.85,marginBottom:8,marginLeft:-9,marginRight:-9}}></div>
              <div style={{font:"400 12px/16px Roboto",color:(dim&&st.id==="all")?"#b0b0b0":"#333333",whiteSpace:"nowrap"}}>{st.label}</div>
              <div style={{font:"600 18px/22px Roboto",color:(dim&&st.id==="all")?"#b0b0b0":"#0f172a",marginTop:4}}>{vpePad(counts[st.id]||0)}</div>
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

function VPEATRow({ atCounts, atFilter, onFilter, highlight }) {
  return (
    <div style={{display:"flex",alignItems:"center",font:"400 13px/16px Roboto",color:"#333333"}}>
      <span style={{color:"#94a3b8",marginRight:12}}>Automation (AT) Status :</span>
      {VPE_AT_ITEMS.map((it,i)=>{
        const active = atFilter===it.id;
        const dim = atFilter ? !active : !!(highlight && !highlight.has(it.id));
        return (
          <React.Fragment key={it.id}>
            {i>0 && <span style={{width:1,height:18,background:"#e2e8f0",margin:"0 12px"}}></span>}
            <button type="button" onClick={()=>onFilter(active?null:it.id)} title={`Filter: ${it.label}`}
              style={{background:"transparent",border:"none",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,padding:"2px 6px",borderRadius:4,opacity:dim?0.4:1,transition:"opacity .12s"}}>
              <VPEATIcon kind={it.kind} />
              <span style={{color:"#0f172a",fontSize:14}}>{it.label}</span>
              <span style={{fontWeight:600,color:it.num||"#0f172a"}}>{vpePad(atCounts[it.id]||0)}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

const VPE_COLS = [
  { key:"name",         label:"Patient Name",     grid:"minmax(130px,1.4fr)", sortable:true },
  { key:"mrn",          label:"MRN",              grid:"minmax(120px,1.2fr)", sortable:true },
  { key:"branchId",     label:"Branch",           grid:"minmax(70px,0.7fr)",  sortable:true },
  { key:"episodeId",    label:"Episode ID",       grid:"minmax(84px,0.85fr)", sortable:true },
  { key:"stageName",    label:"HCHB Stage Name",  grid:"minmax(140px,1.4fr)", sortable:true },
  { key:"oasisType",    label:"OASIS Type",       grid:"minmax(110px,1.1fr)", sortable:true },
  { key:"oasisDate",    label:"OASIS Date",       grid:"minmax(84px,0.9fr)",  sortable:true },
  { key:"approvalDate", label:"Approval Date",    grid:"minmax(92px,0.9fr)",  sortable:true },
  { key:"evalInitDate", label:"Evaluation Init Date", grid:"minmax(120px,1.1fr)", sortable:true },
  { key:"at",           label:"AT Status",        grid:"70px",  sortable:true,  align:"center" },
  { key:"vpoc",         label:"VPOC Status",      grid:"120px", sortable:true,  align:"center" },
  { key:"ehrSync",      label:"EHR Sync",         grid:"72px",  sortable:false, align:"center" },
  { key:"reviewed",     label:"Reviewed?",        grid:"78px",  sortable:false, align:"center" },
];
const VPE_GRID = VPE_COLS.map(c=>c.grid).join(" ");

function VPESortArrows({ active, dir }) {
  const up   = active && dir==="asc"  ? "#2563eb" : "rgba(0,0,0,0.25)";
  const down = active && dir==="desc" ? "#2563eb" : "rgba(0,0,0,0.25)";
  return (
    <svg width="10" height="15" viewBox="0 0 9 14" fill="none" style={{marginRight:3,flex:"none"}}>
      <path d="M7.74699 7.40234H1.25301C1.05823 7.40234 0.949473 7.608 1.0701 7.7484L4.31708 11.5135C4.41003 11.6213 4.58899 11.6213 4.68291 11.5135L7.9299 7.7484C8.05053 7.608 7.94177 7.40234 7.74699 7.40234Z" fill={down}/>
      <path d="M7.9299 6.24825L4.68291 2.48317C4.58997 2.3754 4.41101 2.3754 4.31708 2.48317L1.0701 6.24825C0.949473 6.38865 1.05823 6.59431 1.25301 6.59431H7.74699C7.94177 6.59431 8.05053 6.38865 7.9299 6.24825Z" fill={up}/>
    </svg>
  );
}

function VPETableHeader({ sortKey, sortDir, onSort }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:VPE_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",gap:6,position:"sticky",top:0,zIndex:6,boxShadow:"0 1px 0 #e2e8f0"}}>
      {VPE_COLS.map(c=>(
        <div key={c.key} onClick={c.sortable?()=>onSort(c.key):undefined}
          style={{font:"500 11px/14px Roboto",color:"#64748b",display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",cursor:c.sortable?"pointer":"default",userSelect:"none",overflow:"hidden",whiteSpace:"nowrap"}}>
          {c.sortable && <VPESortArrows active={sortKey===c.key} dir={sortDir} />}
          {c.label}
        </div>
      ))}
    </div>
  );
}

function VPETableRow({ row, reviewed, onReviewed, accent="#2563eb" }) {
  const cell = (align) => ({font:"500 12px/16px Roboto",color:"#333333",display:"flex",alignItems:"center",justifyContent:align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0});
  return (
    <div style={{display:"grid",gridTemplateColumns:VPE_GRID,alignItems:"center",height:48,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:8,boxShadow:"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",gap:6}}>
      <div style={cell()}><span title={"Open patient details — "+row.name} style={{font:"500 13px/16px Roboto",color:"#2563eb",overflow:"hidden",textOverflow:"ellipsis",cursor:"pointer"}}>{row.name}</span></div>
      <div style={cell()}>{row.mrn}</div>
      <div style={cell()}>{row.branchId}</div>
      <div style={cell()}>{row.episodeId}</div>
      <div style={cell()} title={row.stageName}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{row.stageName}</span></div>
      <div style={cell()}>{row.oasisType}</div>
      <div style={cell()}>{row.oasisDate}</div>
      <div style={cell()}>{row.approvalDate || VPE_DASH}</div>
      <div style={cell()} title="Evaluation Init Date">{row.evalInitDate}</div>
      <div style={cell("center")}><VPEATIcon kind={row.at} reason={row.atReason} /></div>
      <div style={cell("center")}><VPEStatusPill kind={row.vpoc} /></div>
      <div style={cell("center")}><VPEEhrSync ehr={row.ehr} /></div>
      <div style={cell("center")}>
        {reviewed
          ? <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:"1px solid #cbd5e1",borderRadius:3,background:"#cbd5e1"}}><span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span></span>
          : <span role="checkbox" aria-checked="false" tabIndex={0} onClick={()=>onReviewed(row.id)} style={{display:"inline-flex",width:16,height:16,border:"1px solid #d8d8d8",borderRadius:3,background:"#fff",cursor:"pointer"}}></span>}
      </div>
    </div>
  );
}

function VPOCEvaluationView({ review, onExitReview }) {
  const [atFilter, setAtFilter]         = useVPE(null);
  const [statusFilter, setStatusFilter] = useVPE(null);
  const [searchQ, setSearchQ]           = useVPE("");
  const [sortKey, setSortKey]           = useVPE(null);
  const [sortDir, setSortDir]           = useVPE("asc");
  const [fieldFilters, setFieldFilters] = useVPE([]);
  const [reviewedSet, setReviewedSet]   = useVPE({});
  const [dateRange, setDateRange]       = useVPE(()=> window.defaultDateRange ? window.defaultDateRange([...new Set(VPE_ROWS.map(r=>r.evalInitDate))], 30) : null);
  const onSort = (k) => { if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };

  let base = VPE_ROWS.filter(r => fieldFilters.every(f => f.values.includes(r[f.field])));
  if (searchQ.trim()) { const q = searchQ.toLowerCase(); base = base.filter(r=>[r.name,r.mrn,r.episodeId].join(" ").toLowerCase().includes(q)); }
  if (dateRange && window.dateInRange) base = base.filter(r=>window.dateInRange(r.evalInitDate, dateRange));
  if (review) base = base.filter(r => (r.vpoc==="exception" || r.at==="warning") && !reviewedSet[r.id]);

  const atMatch = (r) => !atFilter || r.at===VPE_AT_MAP[atFilter];
  const stMatch = (r) => !statusFilter || r.vpoc===statusFilter;
  const atBase = base.filter(stMatch), bizBase = base.filter(atMatch);
  const atCounts = {}; VPE_AT_ITEMS.forEach(s=>{ atCounts[s.id] = atBase.filter(r=>r.at===s.kind).length; });
  const bizCounts = { all:0 }; ["approved","pending","exception"].forEach(k=>{ bizCounts[k] = bizBase.filter(r=>r.vpoc===k).length; bizCounts.all += bizCounts[k]; });
  let rows = base.filter(r=>atMatch(r) && stMatch(r));
  const anyFilter = !!(statusFilter || atFilter || fieldFilters.length || searchQ.trim());
  const bizHi = review ? new Set(["exception"]) : anyFilter ? new Set(Object.keys(bizCounts).filter(k=>k!=="all" && bizCounts[k]>0)) : null;
  const atHi  = review ? new Set(["warning"]) : anyFilter ? new Set(VPE_AT_ITEMS.filter(s=>atCounts[s.id]>0).map(s=>s.id)) : null;
  if (sortKey) rows = [...rows].sort((a,b)=>{
    const av = (a[sortKey]==null?"":a[sortKey]).toString().toLowerCase(), bv = (b[sortKey]==null?"":b[sortKey]).toString().toLowerCase();
    return av<bv ? (sortDir==="asc"?-1:1) : av>bv ? (sortDir==="asc"?1:-1) : 0;
  });

  const chips = [];
  if (statusFilter) chips.push({ id:"biz", label:`VPOC Status: ${VPE_STATUS[statusFilter].label}`, onRemove:()=>setStatusFilter(null) });
  if (atFilter) { const a = VPE_AT_ITEMS.find(x=>x.id===atFilter); chips.push({ id:"at", label:`AT Status: ${a?a.label:atFilter}`, onRemove:()=>setAtFilter(null) }); }
  if (review) [
    { id:"rv-at", label:"Automation Status: Needs Attention" },
    { id:"rv-ex", label:"VPOC Status: Exception" },
    { id:"rv-nr", label:"Reviewed : Not Reviewed" },
  ].forEach(c=>chips.push({ ...c, onRemove:()=>onExitReview&&onExitReview() }));
  const clearAll = () => { setStatusFilter(null); setAtFilter(null); setFieldFilters([]); if(review && onExitReview) onExitReview(); };

  const ScrollBodyCmp = (typeof window!=="undefined" && window.ScrollBody) || null;
  const Body = ({children}) => ScrollBodyCmp ? <ScrollBodyCmp>{children}</ScrollBodyCmp> : <div className="ws-scrollbody" style={{maxHeight:"calc(100vh - 400px)",overflowY:"auto",paddingTop:8}}>{children}</div>;

  return (
    <div style={{background:"#fff"}} data-screen-label="01 VPOC Evaluation">
      <VPEFilterBar chips={chips}
        datePicker={{ value:dateRange, available:[...new Set(VPE_ROWS.map(r=>r.evalInitDate))], onChange:setDateRange }}
        fieldFilters={fieldFilters} onFieldFilters={setFieldFilters}
        onClearAll={clearAll} searchValue={searchQ} onSearch={setSearchQ} />
      <div style={{padding:"20px 24px 0",display:"flex",alignItems:"center",gap:32,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 380px",minWidth:0}}><VPETitleCluster /></div>
        <div style={{flex:"0 1 auto",minWidth:0}}>
          <VPEStatusStrip activeStatus={statusFilter} counts={bizCounts} highlight={bizHi} onPick={v=>{ setStatusFilter(v); if(v) setAtFilter(null); }} />
        </div>
      </div>
      <div style={{padding:"10px 24px 0",display:"flex",justifyContent:"flex-end"}}>
        <VPEATRow atCounts={atCounts} atFilter={atFilter} highlight={atHi} onFilter={v=>{ setAtFilter(v); if(v) setStatusFilter(null); }} />
      </div>
      <div style={{padding:"12px 24px 0"}}>
        <Body>
          <div className="chip-scroll" style={{overflowX:"auto",overflowY:"hidden"}}>
            <div style={{minWidth:1380}}>
              <VPETableHeader sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              {rows.length===0
                ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>No VPOC evaluations match the current filters.</div>
                : rows.map(r=><VPETableRow key={r.id} row={r} reviewed={!!reviewedSet[r.id]} onReviewed={id=>setReviewedSet(m=>({...m,[id]:true}))} />)}
            </div>
          </div>
        </Body>
      </div>
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { VPOCEvaluationView });
