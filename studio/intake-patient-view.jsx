// Intake — Patient Intake View. "Style B" — AT status only, no clickable
// status-summary cards.
const { useState: useIPT } = React;

const IPT_ROWS = [
  { id:"it1",  mrn:"MRN20457947", refHub:"CarePort", name:"Marvin Mckinney",    dob:"04/02/1958", branch:"Bcode", agency:"Agency 1", policy:"POL1152135", plan:"Aetna Medicare",  sendFac:"Silver Cross ED", zip:"60441", gw:"Availity", ehrSync:true,  at:"thumb",     alerts:0, docs:true,  gender:"Female", episodeId:"Epi23456", chartStage:"Chart Completed", chartPct:100, arrivedDate:"04/15/25 08:02 AM", endDate:"04/15/25 08:31 AM", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[] },
  { id:"it2",  mrn:"MRN20458084", refHub:"Forcura", name:"Esther Howard",      dob:"11/19/1966", branch:"Bcode", agency:"Agency 1", policy:"POL1152136", plan:"Texas Medicaid",  sendFac:"St. Luke's ICU",  zip:"77002", gw:"",         ehrSync:false, at:"warning",   alerts:1, docs:false, gender:"Female", episodeId:"I1J2K3L4", alertItems:[{text:"Payor Source - Add Payor Source details -> Unable to enter Payor Source details.",desc:"Error while entering value in Payor Type field & Unable to proceed further as we are unable to enter information under Payor Source tab"}], chartStage:"Chart Failed", chartPct:35, arrivedDate:"04/16/25 09:10 AM", endDate:"", terminatedOn:"", reasonTermination:"", reasonFailure:"Unable to complete chart intake due to missing Payor Source details.", failedOn:"04/16/25 09:24 AM", errorReasons:[{loc:"Clinical - Patient Information details -> Unable to update Initial Documentation Status/Pending Reason ,",desc:"Unprocessed tabs: Demographics, Scheduling, Diagnoses, Physicians"}] },
  { id:"it3",  mrn:"MRN20458221", refHub:"Epic Care Link", name:"Cameron Williamson", dob:"02/27/1971", branch:"Bcode", agency:"Agency 1", policy:"POL1152137", plan:"Humana",          sendFac:"Rush Copley Rehab", zip:"60540", gw:"Availity", ehrSync:true, at:"hourglass", alerts:0, docs:false, gender:"Male",   episodeId:"TY964257", chartStage:"Chart In Progress", chartPct:60, arrivedDate:"04/19/25 10:00 AM", endDate:"", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[] },
  { id:"it4",  mrn:"MRN20458358", refHub:"Ensocare", name:"Leslie Alexander",   dob:"06/09/1949", branch:"Bcode", agency:"Agency 1", policy:"POL1152138", plan:"Medicare",        sendFac:"Advocate Christ ED", zip:"60453", gw:"Inovalon", ehrSync:false, at:"warning", alerts:2, docs:true,  gender:"Female", episodeId:"K7L8M9N0", alertItems:[{text:"Secondary plan unverified",desc:"Only the primary plan returned an active 271 response."},{text:"Auth number not returned",desc:"Payor accepted the request but has not issued an authorization number."}], chartStage:"Chart Terminated", chartPct:70, arrivedDate:"04/22/25 07:44 AM", endDate:"04/22/25 08:15 AM", terminatedOn:"04/22/25 08:15 AM", reasonTermination:"Referral fell outside branch coverage area — intake stopped.", reasonFailure:"", failedOn:"", errorReasons:[{loc:"Clinical - Patient Information details -> Unable to update Initial Documentation Status/Pending Reason ,",desc:"Unprocessed tabs: Demographics, Scheduling, Diagnoses, Physicians"}] },
  { id:"it5",  mrn:"MRN20458495", refHub:"CarePort", name:"Robert Fox",         dob:"01/14/1963", branch:"Bcode", agency:"Agency 1", policy:"POL1152139", plan:"UHC",             sendFac:"Elmhurst Med Surg", zip:"60126", gw:"UHC",      ehrSync:true,  at:"thumb",     alerts:0, docs:true,  gender:"Male",   episodeId:"G3H4I5J6", chartStage:"Chart Completed", chartPct:100, arrivedDate:"04/18/25 09:05 AM", endDate:"04/18/25 09:38 AM", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[] },
  { id:"it6",  mrn:"MRN20458632", refHub:"Forcura", name:"Jenny Wilson",       dob:"09/30/1957", branch:"Bcode", agency:"Agency 1", policy:"POL1152140", plan:"Humana",          sendFac:"Northwestern Cards", zip:"60611", gw:"Availity", ehrSync:true, at:"thumb",     alerts:0, docs:true,  gender:"Female", episodeId:"M5N6O7P8", chartStage:"Chart Completed", chartPct:100, arrivedDate:"04/24/25 08:12 AM", endDate:"04/24/25 08:40 AM", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[] },
  { id:"it7",  mrn:"MRN20458769", refHub:"Epic Care Link", name:"Jacob Jones",        dob:"05/03/1980", branch:"Bcode", agency:"Agency 1", policy:"POL1152141", plan:"Aetna",           sendFac:"Loyola Ortho",     zip:"60153", gw:"Waystar",  ehrSync:false, at:"warning",   alerts:0, docs:false, gender:"Male",   episodeId:"Y7Z8A9B0", chartStage:"Chart Failed", chartPct:25, arrivedDate:"04/21/25 07:50 AM", endDate:"", terminatedOn:"", reasonTermination:"", reasonFailure:"Chart entry failed while mapping physician orders to the EHR template.", failedOn:"04/21/25 08:05 AM", errorReasons:[{loc:"Clinical - Patient Information details -> Unable to update Initial Documentation Status/Pending Reason ,",desc:"Unprocessed tabs: Demographics, Scheduling, Diagnoses, Physicians"}] },
  { id:"it8",  mrn:"MRN20458906", refHub:"Ensocare", name:"Guy Hawkins",        dob:"08/21/1969", branch:"Bcode", agency:"Agency 1", policy:"POL1152142", plan:"UHC",             sendFac:"Amita St Alexius ED", zip:"60067", gw:"UHC",   ehrSync:true,  at:"thumb",     alerts:0, docs:true,  gender:"Male",   episodeId:"A3B4C5D6", chartStage:"Chart Completed", chartPct:100, arrivedDate:"04/23/25 08:22 AM", endDate:"04/23/25 08:49 AM", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[] },
  { id:"it9",  mrn:"MRN20459043", refHub:"CarePort", name:"Jane Cooper",        dob:"03/11/1975", branch:"Bcode", agency:"Agency 1", policy:"POL1152143", plan:"Aetna",           sendFac:"Edward Hosp Rehab", zip:"60563", gw:"Waystar",  ehrSync:true,  at:"hourglass", alerts:0, docs:false, gender:"Female", episodeId:"Q9R0S1T2", chartStage:"Chart In Progress", chartPct:45, arrivedDate:"04/17/25 08:47 AM", endDate:"", terminatedOn:"", reasonTermination:"", reasonFailure:"", failedOn:"", errorReasons:[] },
  { id:"it10", mrn:"MRN20459180", refHub:"Forcura", name:"Kristin Watson",     dob:"12/05/1961", branch:"Bcode", agency:"Agency 1", policy:"POL1152144", plan:"Humana",          sendFac:"Adventist LaGrange ED", zip:"60525", gw:"Availity", ehrSync:false, at:"warning", alerts:1, docs:false, gender:"Female", episodeId:"TY964258", alertItems:[{text:"Auth number not returned",desc:"Payor accepted the request but has not issued an authorization number."}], chartStage:"Chart Failed", chartPct:40, arrivedDate:"04/25/25 09:31 AM", endDate:"", terminatedOn:"", reasonTermination:"", reasonFailure:"Payor Source details could not be entered into the chart.", failedOn:"04/25/25 09:46 AM", errorReasons:[{loc:"Clinical - Patient Information details -> Unable to update Initial Documentation Status/Pending Reason ,",desc:"Unprocessed tabs: Demographics, Scheduling, Diagnoses, Physicians"}] },
];
if (typeof window !== "undefined") window.IPT_ROWS = IPT_ROWS;

function IPTFilterBar({ search, onSearch }) {
  return (
    <div style={{background:"#eef4fb",borderBottom:"1px solid #e2e8f0",padding:"10px 24px",display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap"}}>
      <button type="button" style={{background:"#fff",border:"1px solid #d8d8d8",borderRadius:4,padding:"5px 12px",font:"400 12px/16px Roboto",color:"#0f172a",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,flexShrink:0,whiteSpace:"nowrap"}}>
        Intake Date : 04/01/25 – 04/30/25<span style={{color:"#94a3b8",fontSize:9}}>▾</span>
      </button>
      <button type="button" style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:6,padding:"5px 4px",whiteSpace:"nowrap"}}>
        <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:"#2563eb",color:"#fff",fontSize:10,fontWeight:600,lineHeight:1}}>+</span>
        Add More Filters
      </button>
      <div style={{flex:1}}></div>
      <div style={{position:"relative",flexShrink:0}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" value={search} onChange={e=>onSearch(e.target.value)} placeholder="Search Patient Records" style={{width:240,background:"#fff",border:"1px solid #93c5e8",borderRadius:6,padding:"6px 12px 6px 30px",font:"400 12px/16px Roboto",color:"#0f172a",outline:"none"}} />
      </div>
    </div>
  );
}

// ── Title cluster + AT-status-only clickable summary cards ("Style B") ──
// Mirrors the Automation Log's clickable summary card format exactly.
const IPT_AT_CARDS = [
  { id:"all",        label:"All Patients", color:"rgb(21,95,130)",   match:()=>true,                icon:null },
  { id:"thumb",      label:"Completed",       color:"rgb(14,165,233)",  match:(r)=>r.at==="thumb",     get icon(){ return (window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png"; } },
  { id:"warning",    label:"Needs Attention", color:"rgb(245,158,11)",  match:(r)=>r.at==="warning",   get icon(){ return (window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png"; } },
  { id:"hourglass",  label:"In Progress",     color:"rgb(148,163,184)", match:(r)=>r.at==="hourglass", get icon(){ return (window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png"; } },
];
function IPTTitleCluster({ allRows, atFilter, onFilter }) {
  const pad = n=>String(n).padStart(2,"0");
  return (
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,width:"100%",flexWrap:"wrap"}}>
      <div>
        <span style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Patient Intake View</span>
        <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Status of Patient Intake Records Received from Referral Sources</div>
        <div style={{marginTop:10,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block"}}>Click Patient Name to view related intake details</div>
      </div>
      <div style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",overflow:"hidden",flexShrink:0,marginLeft:"auto"}}>
        <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333",flexShrink:0}}>
          <span>Automation</span><span>Status</span>
        </div>
        <div style={{display:"flex",alignItems:"flex-start"}}>
          {IPT_AT_CARDS.map(c=>{
            const isAll=c.id==="all", active=!isAll&&atFilter===c.id;
            const dim=atFilter&&atFilter!=="all"&&!active;
            const val=allRows.filter(c.match).length;
            return (
              <div key={c.id} role="button" onClick={()=>onFilter(active||isAll?null:c.id)}
                style={{flex:"0 0 auto",padding:"10px 16px 12px",cursor:"pointer",opacity:(dim&&!isAll)?0.35:1,transition:"opacity .12s,background .12s",background:active?"#f8fafc":"transparent"}}
                onMouseEnter={e=>{if(!active&&!dim)e.currentTarget.style.background="#fafbfc";}}
                onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent";}}>
                <div style={{height:3,borderRadius:2,background:c.color,opacity:active?1:0.85,marginBottom:8,marginLeft:-9,marginRight:-9}}></div>
                <div style={{display:"flex",alignItems:"center",gap:5,font:"400 12px/16px Roboto",color:(dim&&isAll)?"#b0b0b0":"#333",whiteSpace:"nowrap"}}>
                  {c.icon&&<img src={c.icon} alt="" style={{width:14,height:14,objectFit:"contain",flexShrink:0}} />}
                  {c.label}
                </div>
                <div style={{font:"600 18px/22px Roboto",color:(dim&&isAll)?"#b0b0b0":"#0f172a",marginTop:4}}>{pad(val)}</div>
                {atFilter&&atFilter!=="all"&&isAll&&<button type="button" onClick={e=>{e.stopPropagation();onFilter(null);}} style={{marginTop:4,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}><span style={{fontSize:11}}>↻</span>Reset</button>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function IPTDocIcon({ size=18, faded=false }) {
  return <img src={(window.__resources&&window.__resources.attachmentType)||"icons/attachment-type.svg"} width={size} height={size} alt="" style={{display:"block",opacity:faded?0.35:1}} aria-hidden="true" />;
}
function IPTEHRSyncBadge({ synced }) {
  return synced
    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 9 18 20 6"/></svg>
    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>;
}

const IPT_COLS = [
  { key:"name",    label:"Patient Name",  grid:"minmax(120px,1.3fr)" },
  { key:"mrn",     label:"MRN",           grid:"minmax(100px,1fr)" },
  { key:"episodeId",label:"Episode ID",   grid:"minmax(84px,0.8fr)" },
  { key:"dob",     label:"Patient DOB",   grid:"minmax(90px,0.9fr)" },
  { key:"gender",  label:"Gender",        grid:"minmax(64px,0.6fr)" },
  { key:"branch",  label:"Branch",        grid:"minmax(64px,0.6fr)" },
  { key:"policy",  label:"Policy Number", grid:"minmax(100px,1fr)" },
  { key:"plan",    label:"Primary Plan",  grid:"minmax(100px,1fr)" },
  { key:"refHub",  label:"Referral Hub",  grid:"minmax(100px,1fr)" },
  { key:"zip",     label:"Zipcode",       grid:"minmax(70px,0.6fr)" },
  { key:"ehrSync", label:"EHR Sync",      grid:"88px", align:"center" },
  { key:"chart",   label:"Chart Status",  grid:"minmax(96px,0.9fr)", align:"center" },
  { key:"errors",  label:"Error Reasons", grid:"minmax(150px,1.4fr)" },
  { key:"reviewed",label:"Reviewed?",     grid:"78px", align:"center" },
];
const IPT_GRID = IPT_COLS.map(c=>c.grid).join(" ");

function IPTCheckbox({ checked, onToggle, accent="#2563eb" }) {
  return <span role="checkbox" aria-checked={!!checked} tabIndex={0} onClick={onToggle} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:`1px solid ${checked?accent:"#d8d8d8"}`,borderRadius:3,background:checked?accent:"#fff",cursor:"pointer"}}>{checked && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}</span>;
}

function IPTAlertsSlideout({ row, alertReviewed, onToggleAlert, onClose }) {
  const items = row.alertItems || [];
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.18)"}} />
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:520,background:"#fff",zIndex:901,display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.13)",animation:"iptAlertsSlide .22s cubic-bezier(0.32,0.72,0,1)"}}>
        <style>{`@keyframes iptAlertsSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 16px"}}>
          <span style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Intake Alerts</span>
          <button onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",padding:4,color:"#64748b",font:"400 20px/18px Roboto"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px",padding:"0 24px 16px",borderBottom:"1px solid #e5e7eb"}}>
          {[["Patient Name",row.name],["MRN",row.mrn],["Episode ID",row.episodeId]].map(([l,v])=>(
            <div key={l}><div style={{font:"400 11px Roboto",color:"#94a3b8",marginBottom:2}}>{l}</div><div style={{font:"500 12px Roboto",color:"#0f172a"}}>{v}</div></div>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 90px",padding:"12px 24px",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",font:"500 11px/14px Roboto",color:"#64748b"}}>
            <div>ALERT</div><div>DESCRIPTION</div><div style={{textAlign:"center"}}>REVIEWED</div>
          </div>
          {items.length===0
            ? <div style={{padding:"32px 24px",textAlign:"center",color:"#94a3b8",font:"400 13px Roboto"}}>No alerts for this patient.</div>
            : items.map((a,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 2fr 90px",padding:"14px 24px",borderBottom:"1px solid #f1f5f9",alignItems:"center"}}>
                <div style={{font:"500 13px/18px Roboto",color:"#dc2626"}}>{a.text}</div>
                <div style={{font:"400 13px/18px Roboto",color:"#334155",paddingRight:12}}>{a.desc}</div>
                <div style={{display:"flex",justifyContent:"center"}}><IPTCheckbox checked={!!(alertReviewed[row.id]&&alertReviewed[row.id][i])} onToggle={()=>onToggleAlert(row.id,i,items.length)} /></div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

function IPTChartPill({ row, onClick }) {
  const c = row.at==="warning" ? (row.terminatedOn?"#475569":"#dc2626") : row.at==="hourglass" ? "#64748b" : "#16a34a";
  return <span onClick={onClick} style={{color:c,font:"500 12px/16px Roboto",cursor:"pointer"}}>{row.chartPct}%</span>;
}

function IPTChartStatusSlideout({ row, onClose }) {
  const fields = [["Current Stage",row.chartStage],["Transaction Arrived Date",row.arrivedDate],["Transaction End Date",row.endDate],["Terminated On",row.terminatedOn],["Reason for Termination",row.reasonTermination],["Reason for Failure",row.reasonFailure],["Failed On",row.failedOn]];
  const errors = row.errorReasons || [];
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.18)"}} />
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:520,background:"#fff",zIndex:901,display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.13)",animation:"iptChartSlide .22s cubic-bezier(0.32,0.72,0,1)"}}>
        <style>{`@keyframes iptChartSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 16px"}}>
          <span style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Chart Status</span>
          <button onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",padding:4,color:"#64748b",font:"400 20px/18px Roboto"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px",padding:"0 24px 16px",borderBottom:"1px solid #e5e7eb"}}>
          {[["Patient Name",row.name],["MRN",row.mrn],["Episode ID",row.episodeId]].map(([l,v])=>(
            <div key={l}><div style={{font:"400 11px Roboto",color:"#94a3b8",marginBottom:2}}>{l}</div><div style={{font:"500 12px Roboto",color:"#0f172a"}}>{v}</div></div>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"18px 24px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16,marginBottom:24}}>
            {fields.map(([label,v])=>(
              <div key={label}>
                <div style={{font:"400 11px Roboto",color:"#94a3b8",marginBottom:3}}>{label}</div>
                <div style={{font:"500 12px/17px Roboto",color:"#0f172a"}}>{v || <span style={{color:"#94a3b8"}}>—</span>}</div>
              </div>
            ))}
          </div>
          <div style={{font:"600 11px/16px Roboto",color:"#64748b",letterSpacing:".04em",marginBottom:10}}>ERROR REASONS</div>
          {errors.length===0
            ? <div style={{padding:"16px",textAlign:"center",color:"#94a3b8",font:"400 13px Roboto",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6}}>No error reasons recorded.</div>
            : errors.map((e,i)=>(
              <div key={i} style={{display:"flex",gap:12,padding:"12px 14px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,marginBottom:8}}>
                <span style={{font:"700 12px/18px Roboto",color:"#dc2626",flexShrink:0}}>{String(i+1).padStart(2,"0")}</span>
                <div style={{font:"400 13px/19px Roboto",color:"#334155"}}><span style={{color:"#dc2626",fontWeight:500}}>{e.loc}</span> {e.desc}</div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

function IPTRow({ row, onNameClick, onDocsClick, onAlertsClick, onChartClick, reviewed, onReviewed }) {
  const cell = (align) => ({font:"500 12px/16px Roboto",color:"#333",display:"flex",alignItems:"center",justifyContent:align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0});
  const dash = <span style={{color:"#94a3b8"}}>—</span>;
  const errs = row.errorReasons || [];
  return (
    <div style={{marginBottom:8}}>
      <div style={{display:"grid",gridTemplateColumns:IPT_GRID,alignItems:"center",height:48,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:6,boxShadow:"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",gap:6}}>
        <div style={cell()} title={row.name}><span onClick={()=>onNameClick(row)} style={{color:"#2563eb",cursor:"pointer",overflow:"hidden",textOverflow:"ellipsis"}}>{row.name}</span></div>
        <div style={cell()}>{row.mrn}</div>
        <div style={cell()}>{row.episodeId}</div>
        <div style={cell()}>{row.dob}</div>
        <div style={cell()}>{row.gender || dash}</div>
        <div style={{...cell(),color:"#3b82f6",fontWeight:600}}>{row.branch}</div>
        <div style={cell()}>{row.policy}</div>
        <div style={cell()} title={row.plan}>{row.plan}</div>
        <div style={cell()} title={row.refHub}>{row.refHub || dash}</div>
        <div style={cell()}>{row.zip}</div>
        <div style={cell("center")}><IPTEHRSyncBadge synced={row.ehrSync} /></div>
        <div style={cell("center")}><IPTChartPill row={row} onClick={()=>onChartClick(row)} /></div>
        <div style={cell()} title={errs.map(e=>e.loc).join("\n")}>{errs.length ? <span onClick={()=>onChartClick(row)} style={{color:"#dc2626",cursor:"pointer",overflow:"hidden",textOverflow:"ellipsis"}}>{errs[0].loc}</span> : dash}</div>
        <div style={cell("center")}><IPTCheckbox checked={reviewed} onToggle={()=>onReviewed(row.id)} /></div>
      </div>
    </div>
  );
}

function IPTTableHeader() {
  return (
    <div style={{display:"grid",gridTemplateColumns:IPT_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",gap:6}}>
      {IPT_COLS.map(c=>(
        <div key={c.key} style={{font:"500 11px/14px Roboto",color:"#64748b",textAlign:c.align||"left",display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden"}}>{c.label}</div>
      ))}
    </div>
  );
}

function IPTDocsSlideout({ row, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.18)"}} />
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:420,background:"#fff",zIndex:901,display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.13)",animation:"iptDocsSlide .22s cubic-bezier(0.32,0.72,0,1)"}}>
        <style>{`@keyframes iptDocsSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 16px"}}>
          <span style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Intake Documents</span>
          <button onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",padding:4,color:"#64748b",font:"400 20px/18px Roboto"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px",padding:"0 24px 16px",borderBottom:"1px solid #e5e7eb"}}>
          {[["Episode ID",row.episodeId],["Policy Number",row.policy],["Gateway",row.gw||"—"]].map(([l,v])=>(
            <div key={l}><div style={{font:"400 11px Roboto",color:"#94a3b8",marginBottom:2}}>{l}</div><div style={{font:"500 12px Roboto",color:"#0f172a"}}>{v}</div></div>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 24px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",border:"1px solid #e5e7eb",borderRadius:8,background:"#f8fafc"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <IPTDocIcon size={16} />
              <span style={{font:"500 13px Roboto",color:"#0f172a"}}>Intake assessment.pdf</span>
            </div>
            <span style={{color:"#1677ff",font:"500 13px Roboto"}}>View</span>
          </div>
        </div>
      </div>
    </>
  );
}

function IPTTable({ rows, onNameClick, onDocsClick, onAlertsClick, onChartClick, reviewedSet, onReviewed }) {
  const Body = ({children}) => window.ScrollBody ? <window.ScrollBody>{children}</window.ScrollBody> : <div style={{overflowY:"auto",flex:1}}>{children}</div>;
  if (rows.length===0) return <div style={{padding:"48px",textAlign:"center",color:"#94a3b8",font:"400 14px Roboto"}}>No records match the current filters.</div>;
  return (
    <div style={{padding:"0 24px 24px"}}>
      <IPTTableHeader />
      <Body>
        {rows.map(r=><IPTRow key={r.id} row={r} onNameClick={onNameClick} onDocsClick={onDocsClick} onAlertsClick={onAlertsClick} onChartClick={onChartClick} reviewed={!!reviewedSet[r.id]} onReviewed={onReviewed} />)}
        <div style={{padding:"16px 24px",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} records shown</div>
      </Body>
    </div>
  );
}

function IntakePatientView({ review }) {
  const [atFilter, setAtFilter] = useIPT(null);
  const [search, setSearch] = useIPT("");
  const [docsRow, setDocsRow] = useIPT(null);
  const [reviewedSet, setReviewedSet] = useIPT({});
  const [alertsRow, setAlertsRow] = useIPT(null);
  const [alertReviewed, setAlertReviewed] = useIPT({});
  const [chartRow, setChartRow] = useIPT(null);
  const [detailRow, setDetailRow] = useIPT(null);
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

  let rows = IPT_ROWS;
  if (atFilter && atFilter!=="all") rows = rows.filter(r=>r.at===atFilter);
  if (search.trim()) { const q=search.toLowerCase(); rows = rows.filter(r=>r.name.toLowerCase().includes(q)||r.episodeId.toLowerCase().includes(q)||r.mrn.toLowerCase().includes(q)); }
  if (review) rows = rows.filter(r=>r.at==="warning");

  return (
    <div style={{background:"#fff",minHeight:"100%",display:"flex",flexDirection:"column"}}>
      <IPTFilterBar search={search} onSearch={setSearch} />
      <div style={{padding:"18px 24px 14px",borderBottom:"1px solid #e2e8f0"}}>
        <IPTTitleCluster allRows={IPT_ROWS} atFilter={atFilter} onFilter={setAtFilter} />
      </div>
      <IPTTable rows={rows} onNameClick={setDetailRow} onDocsClick={setDocsRow} onAlertsClick={setAlertsRow} onChartClick={setChartRow} reviewedSet={reviewedSet} onReviewed={toggleReviewed} />
      {docsRow && <IPTDocsSlideout row={docsRow} onClose={()=>setDocsRow(null)} />}
      {alertsRow && <IPTAlertsSlideout row={alertsRow} alertReviewed={alertReviewed} onToggleAlert={toggleAlert} onClose={()=>setAlertsRow(null)} />}
      {chartRow && <IPTChartStatusSlideout row={chartRow} onClose={()=>setChartRow(null)} />}
      {detailRow && window.IntakePatientDetail && <window.IntakePatientDetail row={detailRow} onClose={()=>setDetailRow(null)} />}
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { IntakePatientView, IPT_ROWS });
