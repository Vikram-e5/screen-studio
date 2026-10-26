// ── Authorization Automation Log main tab ────────────────────
// Mirrors ERVAutomationLogView exactly: same filter bar, same summary strip
// style, same grid rows with left accent bar and ARVATIcon.

const ARV_AL_SVC_COLORS = {
  "Initial-Req":  { bg:"#e6f4ea", bd:"#4caf50", c:"#2e7d32" },
  "Initial-Resp": { bg:"#e3f2fd", bd:"#42a5f5", c:"#1565c0" },
  "Re-cert-Req":  { bg:"#f3e5f5", bd:"#ab47bc", c:"#6a1b9a" },
  "Re-cert-Resp": { bg:"#fff3e0", bd:"#ffa726", c:"#e65100" },
  "Addl-Req":     { bg:"#fce4ec", bd:"#ec407a", c:"#880e4f" },
  "Addl-Resp":    { bg:"#e0f7fa", bd:"#26c6da", c:"#00695c" },
};
function ARVALSvcTag({ label }) {
  const s = ARV_AL_SVC_COLORS[label] || { bg:"#f1f5f9", bd:"#94a3b8", c:"#475569" };
  return <span style={{display:"inline-block",background:s.bg,border:"1px solid "+s.bd,color:s.c,borderRadius:4,padding:"2px 7px",font:"500 11px/14px Roboto",whiteSpace:"nowrap"}}>{label}</span>;
}
function ARVALTypePills({ types }) {
  const show = types.slice(0,2), rest = types.length - 2;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:3}}>
      {show.map(t=><span key={t} style={{background:"#EEF0F3",borderRadius:3,padding:"2px 5px",font:"500 11px/14px Roboto",color:"#374151"}}>{t}</span>)}
      {rest>0&&<span style={{background:"#EEF0F3",borderRadius:3,padding:"2px 5px",font:"500 11px/14px Roboto",color:"#2563eb"}}>+{rest}</span>}
    </span>
  );
}

const ARV_AL_ROWS = [
  { ref:"REF0320240451",  svc:"Initial-Req",  wf:"Auth UHC - Request Initial Authorization",    name:"Marvin Mckinney",   agency:"Agency 1", mrn:"B6100062245601", memId:"11521357", src:"Aetna Medicare G..", gw:"Carelon",  types:["SN","OT","PT"],  at:"thumb",     comment:"-",                          dk:"medicare_advantage" },
  { ref:"REFA052217621",  svc:"Initial-Req",  wf:"Auth Carelon - Request Initial Authorization", name:"Esther Howard",     agency:"Agency 1", mrn:"B6789012345678", memId:"55493027", src:"Humanaochoice",     gw:"Availity", types:["SN","OT","PT"],  at:"thumb",     comment:"-",                          dk:"medicare_advantage" },
  { ref:"REFA0511142389", svc:"Initial-Resp", wf:"Auth Carelon - Request Initial Authorization", name:"Wade Warren",       agency:"Agency 1", mrn:"B6789012345685", memId:"49625034", src:"UHC - HMO plan",    gw:"UHC",      types:["SN","OT","PT"],  at:"thumb",     comment:"-",                          dk:"medicare_advantage" },
  { ref:"REF0320240542",  svc:"Initial-Req",  wf:"Auth Carelon - Request Initial Authorization", name:"Cameron William..", agency:"Agency 1", mrn:"B6100054445634", memId:"97014890", src:"Aetna Gold Plus",   gw:"Carelon",  types:["SN","OT","PT"],  at:"thumb",     comment:"-",                          dk:"cameron_williamson" },
  { ref:"REFA0511245201", svc:"Initial-Req",  wf:"Auth Carelon - Request Initial Authorization", name:"Robert Fox",        agency:"Agency 1", mrn:"V6789012345686", memId:"69420061", src:"Aetna Gold Plus",   gw:"Carelon",  types:["SN","OT","PT"],  at:"thumb",     comment:"-",                          dk:"robert_fox" },
  { ref:"REFA052214179",  svc:"Re-cert-Req",  wf:"Auth Carelon - Request Initial Authorization", name:"Jenny Wilson",      agency:"Agency 1", mrn:"B6789012345711", memId:"43242523", src:"Humanaochoice",     gw:"Carelon",  types:["SN","OT","PT"],  at:"thumb",     comment:"-",                          dk:"medicare_advantage" },
  { ref:"REFA051124191",  svc:"Re-cert-Resp", wf:"Auth Carelon - Request Initial Authorization", name:"Leslie Alexander",  agency:"Agency 1", mrn:"B6789012345697", memId:"76722340", src:"Humanaochoice",     gw:"Availity", types:["SN","OT","PT"],  at:"warning",   comment:"Patient Record not Found",   dk:"medicare_advantage" },
  { ref:"REFA051124191",  svc:"Addl-Req",     wf:"Auth Carelon - Request Initial Authorization", name:"Guy Hawkins",       agency:"Agency 1", mrn:"L700093345918",  memId:"42512413", src:"Humanaochoice",     gw:"Availity", types:["SN","OT","PT"],  at:"thumb",     comment:"-",                          dk:"medicare_advantage" },
  { ref:"REFA051162590",  svc:"Initial-Req",  wf:"Auth Carelon - Request Initial Authorization", name:"Jane Cooper",       agency:"Agency 1", mrn:"B6789012345720", memId:"30214786", src:"Humanaochoice",     gw:"Availity", types:["SN","OT","PT"],  at:"thumb",     comment:"-",                          dk:"medicare_advantage" },
  { ref:"REFA051124324",  svc:"Initial-Req",  wf:"Auth Carelon - Request Initial Authorization", name:"Brooklyn Simmons",  agency:"Agency 1", mrn:"V6789012345678", memId:"16628235", src:"Humanaochoice",     gw:"Availity", types:["SN","OT","PT"],  at:"thumb",     comment:"-",                          dk:"medicare_advantage" },
  { ref:"REF0320511752",  svc:"Addl-Resp",    wf:"Auth Carelon - Request Initial Authorization", name:"Jacob Jones",       agency:"Agency 1", mrn:"B6789012345716", memId:"10424991", src:"Humanaochoice",     gw:"Availity", types:["SN","OT","PT"],  at:"thumb",     comment:"-",                          dk:"medicare_advantage" },
  { ref:"REFA051124392",  svc:"Re-cert-Req",  wf:"Auth Carelon - Request Initial Authorization", name:"Kristin Watson",    agency:"Agency 1", mrn:"B6789012345801", memId:"20481123", src:"Humanaochoice",     gw:"Availity", types:["SN","OT","PT"],  at:"warning",   comment:"Auth expired",               dk:"medicare_advantage" },
  { ref:"REFA051124802",  svc:"Initial-Req",  wf:"Auth Carelon - Request Initial Authorization", name:"Cody Fisher",       agency:"Agency 1", mrn:"B6789012345802", memId:"20481124", src:"Humanaochoice",     gw:"Inovalon", types:["SN","OT","PT"],  at:"thumb",     comment:"-",                          dk:"medicare_advantage" },
  { ref:"REFA051124803",  svc:"Addl-Req",     wf:"Auth Carelon - Request Initial Authorization", name:"Telo Hetry",         agency:"Agency 1", mrn:"J700093345753",  memId:"16628235", src:"Aetna Gold..",      gw:"Waystar",  types:["SN","OT","PT"],  at:"hourglass", comment:"Pending payor response",     dk:"medicare_advantage" },
  { ref:"REFA051124804",  svc:"Re-cert-Resp", wf:"Auth Carelon - Request Initial Authorization", name:"Utar Ganthir",       agency:"Agency 1", mrn:"K700093345989",  memId:"20481126", src:"Aetna Gold..",      gw:"Waystar",  types:["SN","OT","PT"],  at:"thumb",     comment:"-",                          dk:"medicare_advantage" },
];

const ARV_AL_SUMMARY_CARDS = [
  { id:"all",         label:"All Transaction",   color:"rgb(21,95,130)",    match:()=>true,                  icon:null },
  { id:"thumb",       label:"Completed",         color:"rgb(14,165,233)",   match:(r)=>r.at==="thumb",       icon:"icons/at-completed.png" },
  { id:"warning",     label:"Needs Attention",   color:"rgb(245,158,11)",   match:(r)=>r.at==="warning",     icon:"icons/at-needs-attention.png" },
  { id:"hourglass",   label:"In Progress",       color:"rgb(148,163,184)",  match:(r)=>r.at==="hourglass",   icon:"icons/at-in-progress.png" },
];

function ARVALSummaryStrip({ rows, activeCard, onPick }) {
  const pad = (n) => String(n).padStart(2,"0");
  return (
    <div style={{display:"flex",gap:28,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
      {ARV_AL_SUMMARY_CARDS.map(c=>{
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

const ARV_AL_FILTER_FIELDS = [
  { key:"agency", label:"Agency" },
  { key:"gw",     label:"Gateway" },
  { key:"src",    label:"Payor Src" },
  { key:"svc",    label:"Svc Type" },
];

const ARV_AL_COLS = [
  { key:"ref",    label:"Ref ID",        w:"minmax(110px,1.1fr)", sort:true },
  { key:"svc",    label:"Svc Type",      w:"minmax(90px,0.9fr)",  sort:true },
  { key:"wf",     label:"Workflow",      w:"minmax(200px,2fr)",   sort:true },
  { key:"name",   label:"Patient Name",  w:"minmax(110px,1.1fr)", sort:true },
  { key:"agency", label:"Agency",        w:"minmax(68px,0.68fr)", sort:true },
  { key:"mrn",    label:"MRN",           w:"minmax(110px,1.1fr)", sort:true },
  { key:"memId",  label:"Mem ID",        w:"minmax(78px,0.78fr)", sort:true },
  { key:"src",    label:"Payor Src",     w:"minmax(100px,1fr)",   sort:true },
  { key:"gw",     label:"GW",            w:"minmax(70px,0.7fr)",  sort:true },
  { key:"types",  label:"Type",          w:"minmax(80px,0.8fr)",  sort:false },
  { key:"at",     label:"AT Status",     w:"70px",                sort:false, align:"center" },
  { key:"comment",label:"Comments",      w:"minmax(120px,1.2fr)", sort:false },
];
const ARV_AL_GRID = ARV_AL_COLS.map(c=>c.w).join(" ");

function ARVALHeader({ sortKey, sortDir, onSort }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:ARV_AL_GRID,alignItems:"stretch",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",minHeight:44,padding:"0 12px",gap:6}}>
      {ARV_AL_COLS.map(c=>(
        <div key={c.key} onClick={c.sort?()=>onSort(c.key):undefined}
          style={{display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",gap:3,font:"500 11px/14px Roboto",color:"#64748b",whiteSpace:"nowrap",cursor:c.sort?"pointer":"default",userSelect:"none",overflow:"hidden",padding:"0 2px"}}>
          {c.sort&&<ARVSortArrows active={sortKey===c.key} dir={sortDir} />}
          {c.label}
        </div>
      ))}
    </div>
  );
}

function ARVALRow({ row, onRefClick }) {
  const cell = {font:"500 12px/16px Roboto",color:"#333333",display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,padding:"0 2px"};
  const isWarningComment = row.comment && row.comment !== "-";
  return (
    <div style={{display:"grid",gridTemplateColumns:ARV_AL_GRID,alignItems:"center",minHeight:52,padding:"6px 12px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:6,background:"#fff",boxShadow:"0 1px 2px rgba(15,23,42,0.03)",gap:6,position:"relative"}}>
      <div style={{position:"absolute",left:8,top:8,bottom:8,width:3,background:"#6660A6",borderRadius:2}}></div>
      <div style={{...cell,color:"#2563eb",fontWeight:500,cursor:"pointer",paddingLeft:18}} onClick={()=>onRefClick&&onRefClick(row.dk)}>{row.ref}</div>
      <div style={cell}><ARVALSvcTag label={row.svc} /></div>
      <div style={{...cell,color:"#334155"}}>{row.wf}</div>
      <div style={cell}>{row.name}</div>
      <div style={cell}>{row.agency}</div>
      <div style={cell}>{row.mrn}</div>
      <div style={{...cell,color:"#16a34a"}}>{row.memId}</div>
      <div style={cell}>{row.src}</div>
      <div style={cell}>{row.gw}</div>
      <div style={cell}><ARVALTypePills types={row.types} /></div>
      <div style={{...cell,justifyContent:"center"}}><ARVATIcon kind={row.at} /></div>
      <div style={{...cell,color:isWarningComment?"#d97706":"#94a3b8",font:`400 12px/16px Roboto`}}>{row.comment}</div>
    </div>
  );
}

function ARVAutomationLogView({ onRefClick }) {
  const [cardFilter, setCardFilter] = React.useState(null);
  const [searchQ, setSearchQ] = React.useState("");
  const [sortKey, setSortKey] = React.useState(null);
  const [sortDir, setSortDir] = React.useState("asc");
  const [fieldFilters, setFieldFilters] = React.useState([]);
  const handleSort = (k) => { if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else{ setSortKey(k); setSortDir("asc"); } };
  const activeCard = cardFilter ? ARV_AL_SUMMARY_CARDS.find(c=>c.id===cardFilter) : null;
  const filtered = fieldFilters.length ? ARV_AL_ROWS.filter(r=>fieldFilters.every(f=>f.values.includes(r[f.field]))) : ARV_AL_ROWS;
  const searched = searchQ ? filtered.filter(r=>Object.values(r).filter(v=>typeof v==="string").join(" ").toLowerCase().includes(searchQ.toLowerCase())) : filtered;
  const scoped = activeCard ? searched.filter(activeCard.match) : searched;
  const rows = sortKey ? [...scoped].sort((a,b)=>{ const av=String(a[sortKey]||""), bv=String(b[sortKey]||""); return sortDir==="asc"?av.localeCompare(bv):bv.localeCompare(av); }) : scoped;
  return (
    <div style={{background:"#fff",minHeight:"100%"}}>
      <ARVFilterBarChips
        hideSearch={false}
        searchValue={searchQ}
        onSearch={setSearchQ}
        filterFields={ARV_AL_FILTER_FIELDS}
        filterRows={ARV_AL_ROWS}
        fieldFilters={fieldFilters}
        onFieldFilters={setFieldFilters}
        onClearFilters={fieldFilters.length?()=>setFieldFilters([]):null}
      />
      <div style={{padding:"20px 32px 0"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,flexWrap:"wrap",marginBottom:12}}>
          <div>
            <div style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Automation Log</div>
            <div style={{font:"400 13px/18px Roboto",color:"#3A424A",marginTop:8}}>Transaction Status of Authorization Workflows</div>
          </div>
          <ARVALSummaryStrip rows={filtered} activeCard={cardFilter} onPick={setCardFilter} />
        </div>
        <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",marginBottom:16,display:"inline-block"}}>
          Click Ref ID to view related auth transactions for specific auth request
        </div>
        <ARVALHeader sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
        <ScrollBody>
          {rows.length===0
            ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>No records match the current filters.</div>
            : rows.map((r,i)=><ARVALRow key={i} row={r} onRefClick={onRefClick} />)}
          <div style={{padding:"12px 0",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} of {ARV_AL_ROWS.length} records shown</div>
        </ScrollBody>
      </div>
    </div>
  );
}

Object.assign(window, { ARVAutomationLogView });
