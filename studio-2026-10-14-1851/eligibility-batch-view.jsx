// Eligibility Batch View — batch file submissions under Eligibility Center.
// Mirrors the Eligibility Request View shell: filter bar, title + clickable
// status summary, horizontally scrollable grid, docs slideout.
const { useState: useEBV } = React;

const EBV_STATUS = [
  { id:"all",        label:"All Batches",           color:"rgb(21,95,130)"  },
  { id:"submitted",  label:"CH Submitted",          color:"rgb(14,165,233)" },
  { id:"received",   label:"Response File Received",color:"rgb(22,163,74)"  },
  { id:"exceptions", label:"Exceptions",            color:"rgb(249,115,22)" },
];
const EBV_PILL = {
  submitted:  { bg:"#eff8fd", bd:"#0ea5e9", c:"#0284c7", label:"CH Submitted" },
  pending:    { bg:"#f8fafc", bd:"#94a3b8", c:"#475569", label:"Pending" },
  received:   { bg:"#f0fdf4", bd:"#16a34a", c:"#16a34a", label:"Response File Received" },
  exceptions: { bg:"#fff7ed", bd:"#f97316", c:"#ea580c", label:"Exceptions" },
};

const EBV_ROWS = [
  { id:"b1",  file:"ELIG_BATCH_20250415_A.csv", dl:"04/15/25 08:12 AM", ul:"04/15/25 07:40 AM", ud:"04/15/25", batch:"BID-100241", by:"Jessica Moore",  total:4,  members:["r2","r3","r4","r6"], status:"received"   },
  { id:"b2",  file:"ELIG_BATCH_20250416_B.csv", dl:"—",                 ul:"04/16/25 09:05 AM", ud:"04/16/25", batch:"BID-100242", by:"Marcus Reyes",   total:3,  members:["r5","r6","r7"],      status:"submitted"  },
  { id:"b3",  file:"ELIG_BATCH_20250417_C.csv", dl:"04/17/25 02:30 PM", ul:"04/17/25 11:10 AM", ud:"04/17/25", batch:"BID-100243", by:"Priya Nair",     total:8,   status:"exceptions" },
  { id:"b4",  file:"ELIG_BATCH_20250418_D.csv", dl:"04/18/25 10:47 AM", ul:"04/18/25 08:22 AM", ud:"04/18/25", batch:"BID-100244", by:"Jessica Moore",  total:35,  status:"received"   },
  { id:"b5",  file:"ELIG_BATCH_20250420_E.csv", dl:"—",                 ul:"04/20/25 07:58 AM", ud:"04/20/25", batch:"BID-100245", by:"Dana Whitfield", total:5,   status:"pending"    },
  { id:"b6",  file:"ELIG_BATCH_20250422_F.csv", dl:"04/22/25 04:15 PM", ul:"04/22/25 01:03 PM", ud:"04/22/25", batch:"BID-100246", by:"Marcus Reyes",   total:19,  status:"exceptions" },
];

const EBV_COLS = [
  { key:"file",   label:"File Name",        w:"minmax(240px,2.2fr)", sort:true },
  { key:"dl",     label:"Download Time",    w:"minmax(150px,1.2fr)", sort:true },
  { key:"ul",     label:"Upload Time",      w:"minmax(150px,1.2fr)", sort:true },
  { key:"batch",  label:"Batch ID",         w:"minmax(120px,1fr)",   sort:true },
  { key:"by",     label:"File Submitted By",w:"minmax(150px,1.2fr)", sort:true },
  { key:"total",  label:"Total Records",    w:"minmax(110px,0.9fr)", sort:true, align:"center" },
  { key:"status", label:"Batch Status",     w:"minmax(200px,1.6fr)", sort:true, align:"center" },
  { key:"docs",   label:"Docs",             w:"64px",                sort:false, align:"center" },
];
const EBV_GRID = EBV_COLS.map(c=>c.w).join(" ");
const EBV_TABLE_W = 1240;

function EBVDocIcon({ size=18, faded=false }) {
  return <img src={(window.__resources&&window.__resources.attachmentType)||"icons/attachment-type.svg"} width={size} height={size} alt="" style={{display:"block",opacity:faded?0.35:1}} aria-hidden="true" />;
}

function EBVStatusPill({ kind }) {
  const s = EBV_PILL[kind] || EBV_PILL.pending;
  return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"4px 12px",borderRadius:4,background:s.bg,border:`1px solid ${s.bd}`,color:s.c,font:"500 11px/16px Roboto",whiteSpace:"nowrap",minWidth:170,boxSizing:"border-box"}}>{s.label}</span>;
}

// Clickable summary — each counter filters the grid by batch status.
function EBVSummaryStrip({ rows, active, onPick }) {
  const count = (id) => id==="all" ? rows.length : rows.filter(r=>r.status===id).length;
  return (
    <div style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",overflow:"hidden"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333333",flexShrink:0,letterSpacing:"0.01em"}}>
        <span>Batch Status</span>
        <span>Summary</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-start",flex:1}}>
        {EBV_STATUS.map(s => {
          const isActive = active === s.id || (!active && s.id==="all");
          const dim = active && !isActive;
          return (
            <div key={s.id} role="button" onClick={()=>onPick(isActive ? null : (s.id==="all" ? null : s.id))}
              style={{flex:"1 1 0",minWidth:0,padding:"10px 12px 12px",cursor:"pointer",opacity:(dim && s.id!=="all")?0.35:1,transition:"opacity .12s, background .12s",background: isActive ? "#f8fafc" : "transparent",position:"relative"}}
              onMouseEnter={(e)=>{ if(!isActive && !dim) e.currentTarget.style.background = "#fafbfc"; }}
              onMouseLeave={(e)=>{ if(!isActive) e.currentTarget.style.background = "transparent"; }}>
              <div style={{height:3,borderRadius:2,background:s.color,opacity:isActive?1:0.85,marginBottom:8}}></div>
              <div style={{font:"400 12px/16px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#333333",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={s.label}>{s.label}</div>
              <div style={{font:"600 18px/22px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#0f172a",marginTop:4}}>{String(count(s.id)).padStart(2,"0")}</div>
              {active && s.id==="all" && (
                <button type="button" onClick={(e)=>{ e.stopPropagation(); onPick(null); }}
                  style={{marginTop:4,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}>
                  <span style={{fontSize:11,lineHeight:1}}>↻</span>Reset
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Docs slideout — mirrors the Auth/Eligibility Request View Documents panel.
function EBVDocsSlideout({ row, onClose }) {
  const files = [
    { name: row.file },
    { name: row.file.replace(/\.csv$/, "_RESULT.csv") },
  ];
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.18)"}} />
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:480,background:"#fff",zIndex:901,display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.13)",animation:"docsSlide .22s cubic-bezier(0.32,0.72,0,1)"}}>
        <style>{`@keyframes docsSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"22px 24px 16px"}}>
          <span style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Documents</span>
          <button onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",padding:4,color:"#64748b",font:"400 18px/18px Roboto"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"0 16px",padding:"0 24px 16px",borderBottom:"1px solid #e5e7eb"}}>
          {[["Batch ID",row.batch],["File Submitted By",row.by],["Total Records",row.total],["Batch Status",(EBV_PILL[row.status]||EBV_PILL.pending).label]].map(([l,v])=>(
            <div key={l}>
              <div style={{font:"400 11px/14px Roboto",color:"#94a3b8",marginBottom:2}}>{l}</div>
              <div style={{font:"500 13px/18px Roboto",color:"#0f172a"}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 24px"}}>
          {files.map(f => (
            <div key={f.name} style={{border:"1px solid #e5e7eb",borderRadius:6,padding:"14px 16px",display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <img src={(window.__resources&&window.__resources.attachmentType)||"icons/attachment-type.svg"} width={16} height={16} alt="" />
              <span style={{flex:1,font:"400 13px/18px Roboto",color:"#0f172a"}}>{f.name}</span>
              <span style={{font:"500 13px/16px Roboto",color:"#2563eb",cursor:"pointer"}}>Download</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function EBVHeader({ sortKey, sortDir, onSort }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:EBV_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",gap:8}}>
      {EBV_COLS.map(c => (
        <div key={c.key} onClick={c.sort?()=>onSort(c.key):undefined}
          style={{font:"500 11px/14px Roboto",color:"#64748b",display:"flex",alignItems:"center",justifyContent: c.align==="center"?"center":"flex-start",cursor:c.sort?"pointer":"default",userSelect:"none",whiteSpace:"nowrap",overflow:"hidden",gap:3}}>
          {c.sort && <span style={{color: sortKey===c.key ? "#2563eb" : "rgba(0,0,0,0.25)",fontSize:9}}>{sortKey===c.key && sortDir==="desc" ? "▼" : "▲"}</span>}
          {c.label}
        </div>
      ))}
    </div>
  );
}

const ebvVisibleMembers = (row) => {
  if (!row.members) return null;
  const hchb = typeof window !== "undefined" && window.__demoVersion === "hchb";
  const all = (typeof window !== "undefined" && window.ERV_ROWS) || [];
  return row.members.filter(id => {
    const r = all.find(x => x.id === id);
    return r && (!hchb || r.cov !== "pending");
  });
};
function EBVRow({ row, onDocs, onTotal }) {
  const vis = ebvVisibleMembers(row);
  const total = vis ? vis.length : row.total;
  const cell = (align) => ({font:"500 12px/16px Roboto",color:"#333333",display:"flex",alignItems:"center",justifyContent: align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0});
  return (
    <div style={{display:"grid",gridTemplateColumns:EBV_GRID,alignItems:"center",height:48,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:8,background:"#fff",boxShadow:"0 1px 2px rgba(15,23,42,0.03)",gap:8}}>
      <div style={cell()} title={row.file}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{row.file}</span></div>
      <div style={cell()}>{row.dl}</div>
      <div style={cell()}>{row.ul}</div>
      <div style={cell()}>{row.batch}</div>
      <div style={cell()}>{row.by}</div>
      <div style={cell("center")}><a href="#" onClick={(e)=>{e.preventDefault(); onTotal&&onTotal(row);}} title="View eligibility requests in this batch" style={{color:"#2563eb",font:"500 12px/16px Roboto",textDecoration:"underline"}}>{total}</a></div>
      <div style={cell("center")}><EBVStatusPill kind={row.status} /></div>
      <div style={cell("center")}><span onClick={()=>onDocs(row)} title="View batch documents" style={{cursor:"pointer",display:"inline-flex"}}><EBVDocIcon size={18} /></span></div>
    </div>
  );
}

const EBV_FILTER_FIELDS = [
  { key:"batch", label:"Batch ID" },
  { key:"by",    label:"File Submitted By" },
];

function EligibilityBatchView({ fileFilter, onClearFileFilter, onTotalRecords }) {
  const [status, setStatus] = useEBV(null);
  const [searchQ, setSearchQ] = useEBV("");
  const [sortKey, setSortKey] = useEBV(null);
  const [sortDir, setSortDir] = useEBV("asc");
  const [docsRow, setDocsRow] = useEBV(null);
  const [fieldFilters, setFieldFilters] = useEBV([]);
  const [initDate, setInitDate] = useEBV(()=>window.defaultDateRange([...new Set(EBV_ROWS.map(r=>r.ud))],30));
  const onSort = (k) => { if (sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };

  let rows = searchQ ? EBV_ROWS.filter(r=>[r.file,r.batch,r.by].join(" ").toLowerCase().includes(searchQ.toLowerCase())) : EBV_ROWS;
  if (fileFilter) rows = rows.filter(r=>r.file === fileFilter);
  if (initDate) rows = rows.filter(r=>window.dateInRange(r.ud, initDate));
  fieldFilters.forEach(f => { rows = rows.filter(r => f.values.includes(String(r[f.field]))); });
  const searched = rows;
  if (status) rows = rows.filter(r=>r.status===status);
  if (sortKey) rows = [...rows].sort((a,b)=>{ const av=String(a[sortKey]).toLowerCase(), bv=String(b[sortKey]).toLowerCase(); return sortDir==="asc"?av.localeCompare(bv):bv.localeCompare(av); });

  const Bar = typeof window!=="undefined" && window.ARVFilterBarChips;
  const Body = (typeof window!=="undefined" && window.ScrollBody) || (({children})=><div>{children}</div>);
  const chips = [];
  if (fileFilter) chips.push({ id:"file", label:`File Name: ${fileFilter}`, onRemove:()=>onClearFileFilter&&onClearFileFilter() });
  if (status) chips.push({ id:"st", label:`Batch Status: ${(EBV_STATUS.find(s=>s.id===status)||{}).label}`, onRemove:()=>setStatus(null) });
  const clearAll = (status||fileFilter||fieldFilters.length) ? ()=>{ setStatus(null); onClearFileFilter&&onClearFileFilter(); setFieldFilters([]); } : null;

  return (
    <div style={{background:"#fff",minHeight:"100%"}}>
      {Bar ? <Bar chips={chips} datePicker={{label:"Batch Upload Date", value:initDate, available:EBV_ROWS.map(r=>r.ud), onChange:setInitDate}} filterFields={EBV_FILTER_FIELDS} filterRows={EBV_ROWS} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters} searchPlaceholder="Search Batch Files" hideSearch={false} searchValue={searchQ} onSearch={setSearchQ} onClearFilters={clearAll} /> : null}
      <div style={{padding:"20px 24px 0",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,flexWrap:"wrap"}}>
        <div>
          <div style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Eligibility Batch View</div>
          <div style={{font:"400 13px/18px Roboto",color:"#3A424A",marginTop:8}}>Batch eligibility files submitted to the clearing house</div>
        </div>
        <EBVSummaryStrip rows={searched} active={status} onPick={setStatus} />
      </div>
      <div style={{padding:"18px 24px 24px"}}>
        <div className="ws-hscroll" style={{overflowX:"auto",paddingBottom:4}}><div style={{minWidth:EBV_TABLE_W}}>
          <EBVHeader sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
          <Body>
            {rows.length===0
              ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff",marginTop:8}}>No batches match the current filters.</div>
              : rows.map(r=><EBVRow key={r.id} row={r} onDocs={setDocsRow} onTotal={(row)=>onTotalRecords&&onTotalRecords({...row, members: ebvVisibleMembers(row) || row.members})} />)}
            <div style={{padding:"12px 0",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} of {EBV_ROWS.length} batches shown</div>
          </Body>
        </div></div>
      </div>
      {docsRow && <EBVDocsSlideout row={docsRow} onClose={()=>setDocsRow(null)} />}
    </div>
  );
}

Object.assign(window, { EligibilityBatchView, EBV_ROWS });
