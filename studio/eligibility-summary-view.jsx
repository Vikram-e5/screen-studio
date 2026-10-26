// Patient Eligibility Summary View — one row per patient, coverage status
// across the payer hierarchy (Primary → Fifth). Rows are derived from the
// Eligibility Request View dataset (window.ERV_ROWS) so both views agree.
const { useState: useESV, useEffect: useESVE } = React;

const ESV_TIERS = ["Primary","Secondary","Teritary","Fourth","Fifth"];
const ESV_ST = {
  active:    { c:"#16a34a", label:"Active"    },
  inactive:  { c:"#dc2626", label:"Inactive"  },
  pending:   { c:"#3f7ba8", label:"Pending"   },
  exception: { c:"#f97316", label:"Exception" },
};
// Coverage pattern for tiers 2-5 (tier 1 comes from the patient's own record).
const ESV_PATTERNS = [
  ["inactive","inactive",null,null],
  ["pending","active",null,null],
  ["active","active",null,null],
  ["inactive","inactive",null,null],
  ["pending","pending",null,null],
  ["active","pending","active",null],
  ["active","active",null,null],
  ["active","pending",null,null],
  ["active","active",null,"inactive"],
  ["pending","pending",null,null],
  ["inactive","pending",null,null],
  ["active","active","pending",null],
];

function esvNormalize(cov) {
  if (cov === "mixed") return "active";
  if (cov === "exception") return "exception";
  if (cov === "inactive") return "inactive";
  if (cov === "pending") return "pending";
  return "active";
}
function esvRows() {
  const hchb = esvIsHCHB();
  const src = ((typeof window !== "undefined" && window.ERV_ROWS) || []).filter(r => !hchb || r.cov !== "pending");
  return src.map((r, i) => {
    const pat = ESV_PATTERNS[i % ESV_PATTERNS.length];
    const drop = (st) => hchb && st === "pending" ? "active" : st;
    const tiers = [
      { status: drop(esvNormalize(r.cov)), alerts: r.alerts || 0, manual: !hchb && r.mode === "person" },
      { status: drop(pat[0]), alerts: r.at === "warning" ? 2 : 0, manual: false },
      { status: drop(pat[1]), alerts: 0, manual: !hchb && r.mode === "person" },
      { status: drop(pat[2]), alerts: 0, manual: false },
      { status: drop(pat[3]), alerts: 0, manual: !hchb && pat[3] === "inactive" },
    ];
    return { id:r.id, name:r.name, mrn:r.mrn, agency:r.agency, branch:r.branch, soc:r.soc, eligInit:r.eligInit, raw:r, tiers };
  });
}

const esvIsHCHB = () => typeof window !== "undefined" && window.__demoVersion === "hchb";
function ESVStatusCell({ tier, onOpen }) {
  if (!tier || !tier.status) return <span style={{color:"#cbd5e1",width:100,textAlign:"center"}}>-</span>;
  const s = ESV_ST[tier.status] || ESV_ST.active;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:0,minWidth:0}}>
      <span style={{width:16,display:"inline-flex",justifyContent:"flex-start",alignItems:"center",flexShrink:0}}>
        {tier.manual
          ? <img src={(window.__resources&&window.__resources.mdiUser)||"icons/mdi-user.png"} alt="" style={{width:14,height:14,objectFit:"contain"}} />
          : <span style={{width:7,height:7,borderRadius:"50%",background:s.c,margin:"0 3px"}}></span>}
      </span>
      <a href="#" onClick={(e)=>{e.preventDefault(); onOpen&&onOpen();}} style={{color:s.c,font:"400 13px/18px Roboto",textDecoration:"underline",whiteSpace:"nowrap",marginLeft:6,flexShrink:0,cursor:"pointer"}}>{s.label}</a>
      <span style={{width:20,height:20,flexShrink:0,marginLeft:4,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
        {tier.alerts > 0 && (
          <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:20,height:20,borderRadius:"50%",background:"#f59e0b",color:"#fff",font:"600 10px/20px Roboto"}}>{String(tier.alerts).padStart(2,"0")}</span>
        )}
      </span>
    </span>
  );
}

const ESV_SUMMARY = [
  { id:"all",       label:"All Patients", color:"#2563eb", caret:false, icon:false },
  { id:"active",    label:"Active",       color:"#16a34a", caret:true,  icon:false },
  { id:"inactive",  label:"Inactive",     color:"#f87171", caret:true,  icon:false },
  { id:"pending",   label:"Pending",      color:"#3f7ba8", caret:true,  icon:true  },
  { id:"exception", label:"Exceptions",   color:"#d6b25e", caret:true,  icon:false },
];
const esvPad = (n)=>String(n).padStart(2,"0");

function ESVSummaryStrip({ rows, active, onPick }) {
  const cells = rows.reduce((acc, r) => {
    r.tiers.forEach(t => { if (t.status) acc[t.status] = (acc[t.status]||0) + 1; });
    return acc;
  }, {});
  const val = (id) => id === "all" ? esvPad(rows.length) : esvPad(cells[id] || 0);
  return (
    <div style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",overflow:"hidden"}}>
      <div style={{padding:"14px 18px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333",flexShrink:0}}>
        <span>Eligibility</span><span>Status</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-start"}}>
        {ESV_SUMMARY.filter(x => !esvIsHCHB() || x.id !== "pending").map(s => {
          const isActive = active === s.id;
          const dim = active && !isActive;
          return (
            <div key={s.id} role="button" onClick={()=>onPick(isActive ? null : (s.id==="all" ? null : s.id))}
              style={{padding:"10px 16px 12px",cursor:"pointer",opacity:(dim && s.id!=="all")?0.35:1,background:isActive?"#f8fafc":"transparent",transition:"opacity .12s, background .12s"}}
              onMouseEnter={(e)=>{ if(!isActive && !dim) e.currentTarget.style.background="#fafbfc"; }}
              onMouseLeave={(e)=>{ if(!isActive) e.currentTarget.style.background="transparent"; }}>
              <div style={{height:3,borderRadius:2,background:s.color,marginBottom:8,minWidth:70}}></div>
              <div style={{display:"flex",alignItems:"center",gap:5,font:"400 12px/16px Roboto",color:"#333",whiteSpace:"nowrap"}}>
                {s.icon && <img src={(window.__resources&&window.__resources.mdiUser)||"icons/mdi-user.png"} alt="" style={{width:13,height:13,objectFit:"contain"}} />}
                <span>{s.label}</span>
                {s.caret && <span style={{color:s.color,fontSize:9,lineHeight:1}}>▼</span>}
              </div>
              <div style={{font:"600 18px/22px Roboto",color:"#0f172a",marginTop:4}}>{val(s.id)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ESV_GRID = "minmax(150px,1.5fr) minmax(150px,1.5fr) minmax(90px,1fr) minmax(80px,0.9fr) minmax(80px,0.9fr) " +
  "minmax(150px,1.5fr) minmax(150px,1.5fr) minmax(150px,1.5fr) minmax(140px,1.4fr) minmax(140px,1.4fr)";

function ESVHeader({ sortKey, sortDir, onSort }) {
  const cols = [
    ["name","Patient Name"],["mrn","MRN"],["agency","Agency"],["branch","Branch"],["soc","SOC"],
    ["t0","Primary Cov. Status"],["t1","Secondary Cov. Status"],["t2","Teritary Cov. Status"],["t3","Fourth Cov. Status"],["t4","Fifth Cov. Status"],
  ];
  const Arrows = (window.SortArrows) || null;
  return (
    <div style={{display:"grid",gridTemplateColumns:ESV_GRID,alignItems:"center",borderBottom:"1px solid #e2e8f0",height:44,padding:"0 16px",gap:8}}>
      {cols.map(([k,label], i) => (
        <div key={k} onClick={()=>onSort&&onSort(k)}
          style={{display:"flex",alignItems:"center",gap:4,font:"400 13px/18px Roboto",color:"#334155",cursor:"pointer",userSelect:"none",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",borderLeft: i>0 ? "1px solid #eef2f6" : "none",paddingLeft: i>0 ? 12 : 0,height:20}}>
          <span style={{color:"#94a3b8",fontSize:11,lineHeight:1}}>⇅</span>{label}
        </div>
      ))}
    </div>
  );
}

function ESVRow({ row, onPatient }) {
  const cell = {font:"400 13px/18px Roboto",color:"#334155",display:"flex",alignItems:"center",minWidth:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"};
  return (
    <div style={{display:"grid",gridTemplateColumns:ESV_GRID,alignItems:"center",height:62,padding:"0 16px",gap:8,border:"1px solid #e2e8f0",borderRadius:6,marginBottom:10,background:"#fff",boxShadow:"0 1px 2px rgba(15,23,42,0.03)"}}>
      <div style={cell}>
        <a href="#" onClick={(e)=>{e.preventDefault(); onPatient&&onPatient(row.raw);}} style={{color:"#2563eb",font:"400 13px/18px Roboto",textDecoration:"underline",overflow:"hidden",textOverflow:"ellipsis"}}>{row.name}</a>
      </div>
      <div style={cell}>{row.mrn}</div>
      <div style={cell}>{row.agency}</div>
      <div style={cell}>{row.branch}</div>
      <div style={cell}>{row.soc}</div>
      {row.tiers.map((t,i)=>(
        <div key={i} style={{...cell,justifyContent:"center"}}><ESVStatusCell tier={t} onOpen={t && t.status ? (()=>{ window.__esvTierIndex = i; onPatient&&onPatient(row.raw); }) : null} /></div>
      ))}
    </div>
  );
}

function EligibilitySummaryView({ onPatient, sharedInitDate, setSharedInitDate, sharedFieldFilters, setSharedFieldFilters }) {
  const [statusFilter, setStatusFilter] = useESV(null);
  const [, setVerTick] = useESV(0);
  useESVE(()=>{ const h=()=>setVerTick(n=>n+1); document.addEventListener("demoVersionChange",h); return ()=>document.removeEventListener("demoVersionChange",h); },[]);
  const [searchQ, setSearchQ] = useESV("");
  const [sortKey, setSortKey] = useESV(null);
  const [sortDir, setSortDir] = useESV("asc");
  const [_initDate, _setInitDate] = useESV(()=>window.defaultDateRange([...new Set(((window.ERV_ROWS)||[]).map(r=>r.eligInit))],30));
  const initDate = sharedInitDate !== undefined ? sharedInitDate : _initDate;
  const setInitDate = setSharedInitDate || _setInitDate;
  const [_fieldFilters, _setFieldFilters] = useESV([]);
  const fieldFilters = sharedFieldFilters !== undefined ? sharedFieldFilters : _fieldFilters;
  const setFieldFilters = setSharedFieldFilters || _setFieldFilters;

  const FilterBar = window.ERVFilterBar;
  const all = esvRows();
  let rows = all.filter(r => fieldFilters.every(f => f.values.includes(r.raw[f.field])));
  if (initDate) rows = rows.filter(r => window.dateInRange(r.eligInit, initDate));
  if (searchQ) { const q = searchQ.toLowerCase(); rows = rows.filter(r => [r.name,r.mrn,r.agency].join(" ").toLowerCase().includes(q)); }
  if (statusFilter) rows = rows.filter(r => r.tiers.some(t => t.status === statusFilter));
  if (sortKey) {
    const get = (r) => sortKey.startsWith("t")
      ? ((r.tiers[Number(sortKey.slice(1))] || {}).status || "")
      : (r[sortKey] || "").toString().toLowerCase();
    rows = [...rows].sort((a,b) => { const av=get(a), bv=get(b); return av<bv ? (sortDir==="asc"?-1:1) : av>bv ? (sortDir==="asc"?1:-1) : 0; });
  }
  const onSort = (k) => { if (sortKey === k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };

  const chips = [];
  if (statusFilter) chips.push({ id:"st", label:`Coverage Status: ${(ESV_ST[statusFilter]||{}).label || statusFilter}`, onRemove:()=>setStatusFilter(null) });

  return (
    <div style={{background:"#fff"}}>
      {FilterBar && (
        <FilterBar chips={chips} filterFields={window.ERV_FILTER_FIELDS} filterRows={(window.ERV_ROWS)||[]} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters}
          datePicker={{label:"Elig Initiated Date", value:initDate, available:[...new Set(((window.ERV_ROWS)||[]).map(r=>r.eligInit))], onChange:setInitDate}}
          searchValue={searchQ} onSearch={setSearchQ} />
      )}
      <div style={{padding:"20px 24px 0",display:"flex",alignItems:"flex-start",gap:32,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 340px",minWidth:0}}>
          <div style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Patient Elig Summary View</div>
          <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Primary through Fifth coverage status per patient</div>
          <div style={{marginTop:10,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block"}}>A consolidated view of patient eligibility verification across the payer hierarchy</div>
        </div>
        <div style={{flex:"0 1 auto",minWidth:0,display:"flex",justifyContent:"flex-end"}}>
          <ESVSummaryStrip rows={all} active={statusFilter} onPick={setStatusFilter} />
        </div>
      </div>
      <div style={{padding:"18px 24px 24px"}}>
        <ESVHeader sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
        {window.ScrollBody
          ? <window.ScrollBody>
              {rows.length === 0
                ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6}}>No patients match the current filters.</div>
                : rows.map(r => <ESVRow key={r.id} row={r} onPatient={onPatient} />)}
              <div style={{padding:"16px 24px",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} of {all.length} patients shown</div>
            </window.ScrollBody>
          : <div>{rows.map(r => <ESVRow key={r.id} row={r} onPatient={onPatient} />)}</div>}
      </div>
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { EligibilitySummaryView });
