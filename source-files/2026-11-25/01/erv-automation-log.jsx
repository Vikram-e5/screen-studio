// ── Eligibility Automation Log main tab ─────────────────────
// Mirrors PatientAuthSummaryView exactly: PASSummaryStrip-style cards,
// ARVFilterBarChips, ARVSortArrows, ARVATIcon, ScrollBody.

const ERV_AL_ROWS = [
  { ref:"REF0320240451",  wf:"Eligibility - Obtain Insurance Verification", stage:"Module Name", agency:"Agency 1", name:"Marvin Mckinney",   mrn:"B6100062245601", memId:"11521357", src:"Aetna Medicare G..", gw:"Carelon",  st:"01/15/25 09:39 PM", et:"01/15/25 09:39 PM", at:"thumb",     dk:"medicare_advantage" },
  { ref:"REFA052217621",  wf:"Eligibility - Obtain Insurance Verification", stage:"Module Name", agency:"Agency 1", name:"Esther Howard",     mrn:"B6789012345678", memId:"55493027", src:"Humanaochoice",     gw:"Availity", st:"01/15/25 09:39 PM", et:"01/15/25 09:39 PM", at:"thumb",     dk:"medicare_advantage" },
  { ref:"REFA051142389",  wf:"Eligibility - Obtain Insurance Verification", stage:"Module Name", agency:"Agency 1", name:"Wade Warren",       mrn:"B6789012345685", memId:"49625034", src:"UHC - HMO plan",    gw:"UHC",      st:"01/15/25 09:39 PM", et:"01/15/25 09:39 PM", at:"thumb",     dk:"medicare_advantage" },
  { ref:"REF0320240542",  wf:"Eligibility - Obtain Insurance Verification", stage:"Module Name", agency:"Agency 1", name:"Cameron William..", mrn:"B6100054445634", memId:"97014890", src:"Aetna Gold Plus",   gw:"Carelon",  st:"01/15/25 09:39 PM", et:"01/15/25 09:39 PM", at:"thumb",     dk:"cameron_williamson" },
  { ref:"REFA0511245201", wf:"Eligibility - Obtain Insurance Verification", stage:"Module Name", agency:"Agency 1", name:"Robert Fox",        mrn:"V6789012345686", memId:"69420061", src:"Aetna Gold Plus",   gw:"Carelon",  st:"01/15/25 09:39 PM", et:"01/15/25 09:39 PM", at:"thumb",     dk:"robert_fox" },
  { ref:"REFA052214179",  wf:"Eligibility - Obtain Insurance Verification", stage:"Module Name", agency:"Agency 1", name:"Jenny Wilson",      mrn:"B6789012345711", memId:"43242523", src:"Humanaochoice",     gw:"Carelon",  st:"01/15/25 09:39 PM", et:"01/15/25 09:39 PM", at:"thumb",     dk:"medicare_advantage" },
  { ref:"REFA051124191",  wf:"Eligibility - Obtain Insurance Verification", stage:"Module Name", agency:"Agency 1", name:"Leslie Alexander",  mrn:"B6789012345697", memId:"76722340", src:"Humanaochoice",     gw:"Availity", st:"01/15/25 09:39 PM", et:"01/15/25 09:39 PM", at:"warning",   dk:"medicare_advantage" },
  { ref:"REFA051124GH8",  wf:"Eligibility - Obtain Insurance Verification", stage:"Module Name", agency:"Agency 1", name:"Guy Hawkins",       mrn:"L700093345918",  memId:"42512413", src:"Humanaochoice",     gw:"Availity", st:"01/15/25 09:39 PM", et:"01/15/25 09:39 PM", at:"thumb",     dk:"medicare_advantage" },
  { ref:"REFA051162590",  wf:"Eligibility - Obtain Insurance Verification", stage:"Module Name", agency:"Agency 1", name:"Jane Cooper",       mrn:"B6789012345720", memId:"30214786", src:"Humanaochoice",     gw:"Availity", st:"01/15/25 09:39 PM", et:"01/15/25 09:39 PM", at:"warning",   dk:"medicare_advantage" },
  { ref:"REFA051124324",  wf:"Eligibility - Obtain Insurance Verification", stage:"Module Name", agency:"Agency 1", name:"Brooklyn Simmons",  mrn:"V6789012345678", memId:"16628235", src:"Humanaochoice",     gw:"Availity", st:"01/15/25 09:39 PM", et:"01/15/25 09:39 PM", at:"warning",   dk:"medicare_advantage" },
  { ref:"REF0320511752",  wf:"Eligibility - Obtain Insurance Verification", stage:"Module Name", agency:"Agency 1", name:"Jacob Jones",       mrn:"B6789012345716", memId:"10424991", src:"Humanaochoice",     gw:"Availity", st:"01/15/25 09:39 PM", et:"01/15/25 09:39 PM", at:"warning",   dk:"medicare_advantage" },
  { ref:"REFA051124392",  wf:"Eligibility - Obtain Insurance Verification", stage:"Module Name", agency:"Agency 1", name:"Kristin Watson",    mrn:"B6789012345801", memId:"20481123", src:"Humanaochoice",     gw:"Availity", st:"01/15/25 09:39 PM", et:"01/15/25 09:39 PM", at:"warning",   dk:"medicare_advantage" },
  { ref:"REFA051124802",  wf:"Eligibility - Obtain Insurance Verification", stage:"Module Name", agency:"Agency 1", name:"Cody Fisher",       mrn:"B6789012345802", memId:"20481124", src:"Humanaochoice",     gw:"Inovalon", st:"01/15/25 09:39 PM", et:"01/15/25 09:39 PM", at:"warning",   dk:"medicare_advantage" },
  { ref:"REFA051124803",  wf:"Eligibility - Obtain Insurance Verification", stage:"Module Name", agency:"Agency 1", name:"Telo Hetry",         mrn:"J700093345753",  memId:"16628235", src:"Aetna Gold..",      gw:"Waystar",  st:"01/15/25 09:39 PM", et:"01/15/25 09:39 PM", at:"hourglass", dk:"medicare_advantage" },
  { ref:"REFA051124804",  wf:"Eligibility - Obtain Insurance Verification", stage:"Module Name", agency:"Agency 1", name:"Utar Ganthir",       mrn:"K700093345989",  memId:"20481126", src:"Aetna Gold..",      gw:"Waystar",  st:"01/15/25 09:39 PM", et:"01/15/25 09:39 PM", at:"hourglass", dk:"medicare_advantage" },
];

const ERV_AL_SUMMARY_CARDS = [
  { id:"all",       label:"All Transaction",  color:"rgb(21,95,130)",   match:()=>true,                icon:null,                              caret:false },
  { id:"thumb",     label:"Completed",        color:"rgb(14,165,233)",  match:(r)=>r.at==="thumb",     icon:"icons/at-completed.png",           caret:false },
  { id:"warning",   label:"Needs Attention",  color:"rgb(245,158,11)",  match:(r)=>r.at==="warning",   icon:"icons/at-needs-attention.png",     caret:false },
  { id:"hourglass", label:"In Progress",      color:"rgb(148,163,184)", match:(r)=>r.at==="hourglass", icon:"icons/at-in-progress.png",         caret:false },
];

function ERVALSummaryStrip({ rows, activeCard, onPick }) {
  const pad = (n) => String(n).padStart(2,"0");
  return (
    <div style={{display:"flex",gap:28,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
      {ERV_AL_SUMMARY_CARDS.map(c=>{
        const active=activeCard===c.id, dim=activeCard&&!active, isAll=c.id==="all";
        const val=rows.filter(c.match).length;
        return (
          <div key={c.id} role="button" onClick={()=>onPick(active?null:c.id)}
            style={{minWidth:82,display:"flex",flexDirection:"column",gap:8,cursor:"pointer",opacity:(dim&&!isAll)?0.4:1,transition:"opacity .12s"}}>
            <div style={{height:3,borderRadius:2,background:c.color,opacity:active?1:0.85}}></div>
            <div style={{display:"flex",alignItems:"center",gap:5,font:"400 13px/17px Roboto",color:active?"#0f172a":(dim&&isAll)?"#b0b0b0":"#605D5D",whiteSpace:"nowrap"}}>
              {c.icon && <img src={c.icon} alt="" style={{width:14,height:14,objectFit:"contain",flexShrink:0}} />}
              {c.label}
              {c.caret && <span style={{font:"400 10px Roboto",color:"#605D5D"}}>▼</span>}
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

const ERV_AL_FILTER_FIELDS = [
  { key:"agency", label:"Agency" },
  { key:"gw",     label:"Gateway" },
  { key:"src",    label:"Payor Src" },
];

const ERV_AL_COLS = [
  { key:"ref",   label:"Ref ID",        w:"minmax(110px,1.1fr)", sort:true },
  { key:"wf",    label:"Workflow",       w:"minmax(220px,2.2fr)", sort:true },
  { key:"stage", label:"Current Stage", w:"minmax(90px,0.9fr)",  sort:true },
  { key:"agency",label:"Agency",        w:"minmax(68px,0.68fr)", sort:true },
  { key:"name",  label:"Patient Name",  w:"minmax(120px,1.2fr)", sort:true },
  { key:"mrn",   label:"MRN",           w:"minmax(110px,1.1fr)", sort:true },
  { key:"memId", label:"Mem ID",        w:"minmax(78px,0.78fr)", sort:true },
  { key:"src",   label:"Payor Src",     w:"minmax(100px,1fr)",   sort:true },
  { key:"gw",    label:"Gateway",       w:"minmax(70px,0.7fr)",  sort:true },
  { key:"st",    label:"Start Time",    w:"minmax(110px,1.1fr)", sort:true },
  { key:"et",    label:"End Time",      w:"minmax(110px,1.1fr)", sort:true },
  { key:"at",    label:"AT Status",     w:"70px",                sort:false, align:"center" },
];
const ERV_AL_GRID = ERV_AL_COLS.map(c=>c.w).join(" ");

function ERVALHeader({ sortKey, sortDir, onSort }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:ERV_AL_GRID,alignItems:"stretch",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",minHeight:44,padding:"0 12px",gap:6}}>
      {ERV_AL_COLS.map(c=>(
        <div key={c.key} onClick={c.sort?()=>onSort(c.key):undefined}
          style={{display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",gap:3,font:"500 11px/14px Roboto",color:"#64748b",whiteSpace:"nowrap",cursor:c.sort?"pointer":"default",userSelect:"none",overflow:"hidden",padding:"0 2px"}}>
          {c.sort&&<ARVSortArrows active={sortKey===c.key} dir={sortDir} />}
          {c.label}
        </div>
      ))}
    </div>
  );
}

function ERVALRow({ row, onRefClick }) {
  const cell = {font:"500 12px/16px Roboto",color:"#333333",display:"flex",alignItems:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,padding:"0 2px"};
  return (
    <div style={{display:"grid",gridTemplateColumns:ERV_AL_GRID,alignItems:"center",minHeight:52,padding:"6px 12px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:6,background:"#fff",boxShadow:"0 1px 2px rgba(15,23,42,0.03)",gap:6,position:"relative"}}>
      <div style={{position:"absolute",left:8,top:8,bottom:8,width:3,background:"#A66092",borderRadius:2}}></div>
      <div style={{...cell,color:"#2563eb",fontWeight:500,cursor:"pointer",paddingLeft:18}} onClick={()=>onRefClick&&onRefClick(row.dk)}>{row.ref}</div>
      <div style={{...cell,color:"#334155"}}>{row.wf}</div>
      <div style={cell}>{row.stage}</div>
      <div style={cell}>{row.agency}</div>
      <div style={cell}>{row.name}</div>
      <div style={cell}>{row.mrn}</div>
      <div style={{...cell,color:"#16a34a"}}>{row.memId}</div>
      <div style={cell}>{row.src}</div>
      <div style={cell}>{row.gw}</div>
      <div style={cell}>{row.st}</div>
      <div style={cell}>{row.et}</div>
      <div style={{...cell,justifyContent:"center"}}><ARVATIcon kind={row.at} /></div>
    </div>
  );
}

function ERVAutomationLogView({ onRefClick, initialSearch }) {
  const [cardFilter, setCardFilter] = React.useState(null);
  const [searchQ, setSearchQ] = React.useState(initialSearch || "");
  React.useEffect(()=>{ if (initialSearch) setSearchQ(initialSearch); }, [initialSearch]);
  const [sortKey, setSortKey] = React.useState(null);
  const [sortDir, setSortDir] = React.useState("asc");
  const [fieldFilters, setFieldFilters] = React.useState([]);
  const handleSort = (k) => { if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else{ setSortKey(k); setSortDir("asc"); } };
  const activeCard = cardFilter ? ERV_AL_SUMMARY_CARDS.find(c=>c.id===cardFilter) : null;
  const filtered = fieldFilters.length ? ERV_AL_ROWS.filter(r=>fieldFilters.every(f=>f.values.includes(r[f.field]))) : ERV_AL_ROWS;
  const searched = searchQ ? filtered.filter(r=>Object.values(r).join(" ").toLowerCase().includes(searchQ.toLowerCase())) : filtered;
  const scoped = activeCard ? searched.filter(activeCard.match) : searched;
  const rows = sortKey ? [...scoped].sort((a,b)=>{ const av=a[sortKey]||"", bv=b[sortKey]||""; return sortDir==="asc"?av.localeCompare(bv):bv.localeCompare(av); }) : scoped;
  return (
    <div style={{background:"#fff",minHeight:"100%"}}>
      <ARVFilterBarChips
        hideSearch={false}
        searchValue={searchQ}
        onSearch={setSearchQ}
        filterFields={ERV_AL_FILTER_FIELDS}
        filterRows={ERV_AL_ROWS}
        fieldFilters={fieldFilters}
        onFieldFilters={setFieldFilters}
        onClearFilters={fieldFilters.length?()=>setFieldFilters([]):null}
      />
      <div style={{padding:"20px 32px 0"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,flexWrap:"wrap",marginBottom:12}}>
          <div>
            <div style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Automation Log</div>
            <div style={{font:"400 13px/18px Roboto",color:"#3A424A",marginTop:8}}>Transaction Status of Eligibility Workflows</div>
          </div>
          <ERVALSummaryStrip rows={filtered} activeCard={cardFilter} onPick={setCardFilter} />
        </div>
        <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block",marginBottom:16}}>
          Click Ref ID to view related auth transactions for specific eligibility verification request
        </div>
        <ERVALHeader sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
        <ScrollBody>
          {rows.length===0
            ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>No records match the current filters.</div>
            : rows.map((r,i)=><ERVALRow key={i} row={r} onRefClick={onRefClick} />)}
          <div style={{padding:"12px 0",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} of {ERV_AL_ROWS.length} records shown</div>
        </ScrollBody>
      </div>
    </div>
  );
}

Object.assign(window, { ERVAutomationLogView });
