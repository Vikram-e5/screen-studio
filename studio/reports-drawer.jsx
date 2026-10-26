// Reports slide-out — opened from the "Reports" button in the top nav.
// Layout follows the Figma "Ticket slider" (610px panel, 3 steps, Reset / Generate Report, success state).
const RPT_SKIP = /^(docs|reviewed\??|view details|action|key|value|alerts|elig alerts)$/i;
const rptCols = (...lists) => { const seen = new Set(), out = []; lists.flat().forEach(l => { const k = l.toLowerCase(); if (!RPT_SKIP.test(l) && !seen.has(k)) { seen.add(k); out.push(l); } }); return out; };

const RPT_SERVICES = [
  { key:"intake", label:"Intake", sections:["intake"],
    filters:["date","branch","agency","referralHub"],
    cols: rptCols(["Patient Name","Patient DOB","Gender","Agency","Policy Number","Referral Hub","Portal Sync","Patient Zipcode","Primary Plan","Referral ID","Referral Date","SOC","Referral Comment","Discharge Date","Type of Care","Branch","Sending Facility","Sending Organization","Referral Source","Payer Matched","Zipcode Matched","Referral Source Matched","Rules Engine Response","Referral Response","Referral Response Reason","Agency Referral Response","Agency Referral Response Reason","Document Send Status","Referral Hub Ack Status","Receiver Branch Code","AT Status"],
                  ["MRN","Episode ID","EHR Sync","Chart Status","Error Reasons"]) },
  { key:"eligibility", label:"Eligibility", sections:["eligibility"],
    filters:["date","gateway","branch","payorSource"],
    cols: rptCols(["Patient Name","MRN","Agency","Branch","Mem ID","Payor Src","Payor","SOC","Elig Init Date","Mode","GW","Elig Chk Dt","Follow up Dt","AT Status","Cov. Status","Transaction Type","Stage","Episode ID","Service Line","EHR Sync","Payer Hierarchy"],
                  ["Ref ID","Plan St Date","Plan End Date"]) },
  { key:"authorization", label:"Authorization", sections:["authorization"],
    filters:["date","gateway","branch","payorSource","authType"],
    cols: rptCols(["Patient Name","MRN","SOC","SOE","EOE","Payor Source","Gateway","Auth Type","HCHB Task","Arrival Stage","Episode ID","Auth Initiation Date","Auth Subm Date","Payor Resp Date","Payor Resp Time","Auto Approved","Status check done","AT Status","Reason","EHR Sync","Auth Status","Authorization No","PH Auth","SVC","Requested","Approved","Denied","Pending","Stage Completed","Coord Note Entered"],
                  ["Mem ID","Agency","Branch","Mode","Auth Tracking #","Days to Expire","Follow up Dt"]) },
  { key:"cdm", label:"CDM", sections:["cdm"], filters:["date","branch","payorSource"],
    cols: rptCols(["Patient Name","Worker Name","MRN","Branch","Episode ID","Primary Payor","Secondary Payor Source","CDM Init Time","Eligible PC Hours","PC Auth Hours","Eligible Attend Hours","Attend Auth Hours","AT Status"]) },
  { key:"assessments", label:"Assessments", sections:["assessments"], filters:["date","branch","validationStatus"],
    cols: rptCols(["Patient Name","Assessment ID","MRN","Agency","Facility ID","Branch","Assessment Init Date","Submission Date","M0090 Date","Visit Date","Eff Date","XML File Name (M0040)","Message No. / Severity","AT Status","Validation Status"],
                  ["Submission ID","Episode ID","RFA Code","RFA Type","Type of Transaction","Reason Code","WellSky Location","Payor Name","WellSky Task Name","Assessment Date","CCN"]) },
  { key:"notifications", label:"Notifications", sections:["notifications"], filters:["date","branch","commMethod"],
    cols: rptCols(["Patient Name","MRN","Episode ID","Service line","Branch ID","Event","Notification option","Task/Note type","Notif. Init Date","Report name","Physician/Facility","Physician/Facility name","Fax number","Communication method","Notif. (Fax) Status","EHR Sync","AT Status"]) },
  { key:"pcr", label:"PCR", sections:["preclaims"], filters:["date","branch","submissionType","decision"],
    cols: rptCols(["Patient Name","MRN","BP Start Date","Submission Type","PCR Init Date","DCN","UTN","Decision status","EHR Sync","AT Status"],
                  ["Episode Start Date","Receipt Number","SOC Date","Discharge Date","Benefit Period Status","Billing Period Submitted","PCR Submission Date","DCN Arrived Date","UTN Arrived Date","Reason","Stage"]) },
  { key:"claims", label:"Claims", sections:["rcd"], filters:["date","gateway","branch","billType"],
    cols: rptCols(["Patient Name","Agency","MRN","Branch","Mem ID","Claim Number","Bill Type","Batch File Name","Payor","GW","SOC Date","EOB Date","Discharge Date","Submission Date","Claim Charge Amt","Timely Filing Days","EHR Sync","AT Status","Status"],
                  ["Batch E5 ID","Batch ID","Total Claims in Batch","Payment Model","Batch Status","Parsing Status","Reason","Stage"]) },
  { key:"remits", label:"Remits", sections:["remits"], filters:["date","serviceLine"],
    cols: rptCols(["Patient Name","Trans Init Date","Service Line","Patient Control Number","Payment ID","Denial Codes","Clearing House Location","Clearing House Payor","Clearing House Insurance Code","EOB Uploaded","AT Status","EHR Sync"]) },
  { key:"docext", label:"Doc Extraction", sections:["docext"], filters:["date","branch","eventType"],
    cols: rptCols(["Patient Name","Patient MRN","Agency Name","Branch Code","Episode ID","Event Type","Referral Attachment","Visit Notes","Download Status","AT Status"]) },
  { key:"f2f", label:"F2F Audit", sections:["audit_f2f"], filters:["date","branch","auditor"],
    cols: rptCols(["Name","MRN","Branch","Referral Source","SOC","Audit Trigger","Audit Date","F2F Encounter Date","F2F Encounter Due Date","Days Remaining","EHR Sync","AT Status","Auditor","F2F Requirements Met?"]) },
  { key:"prebill", label:"Pre-Bill Audit", sections:["audit_prebill"], filters:["date","branch","auditResult"],
    cols: rptCols(["Name","MRN","Branch","SOC","Audit Trigger","Audit Date","Pre-Bill Audit Results","AT Status"],
                  ["Audit Type","Reason","Execution halted at","Action required"]) },
];

const RPT_FILTERS = {
  date:            { label:"Date Range", type:"date" },
  gateway:         { label:"Gateway", options:["All","Availity","Waystar","Payer Portal"] },
  branch:          { label:"Branch", options:["All","Bcode","BR-101","BR-204","BR-310"] },
  agency:          { label:"Agency", options:["All","Agency 1","Agency 2","Agency 3"] },
  referralHub:     { label:"Referral Hub", options:["All","Availity","Waystar"] },
  payorSource:     { label:"Payor Source", options:["All","Medicare","Medicare Advantage","Medicaid","Commercial"], wide:true },
  authType:        { label:"Auth Type", options:["All","Recert","SOC","ROC"] },
  validationStatus:{ label:"Validation Status", options:["All","Accepted","Rejected","Warning"] },
  commMethod:      { label:"Communication Method", options:["All","Fax","Email","Portal"] },
  submissionType:  { label:"Submission Type", options:["All","Initial","Resubmission"] },
  decision:        { label:"Decision Status", options:["All","Affirmed","Partially-Affirmed","Non-Affirmed","Pending"] },
  billType:        { label:"Bill Type", options:["All","322","327","329"] },
  serviceLine:     { label:"Service Line", options:["All","Home Health","Hospice","Personal Care"] },
  eventType:       { label:"Event Type", options:["All","SOC","ROC","Recert","Discharge"] },
  auditor:         { label:"Auditor", options:["All","Fiona Gallagher","Bob Smith","Ethan Hunt","Diana Ross"] },
  auditResult:     { label:"Audit Result", options:["All","Met","Unmet","Resolved"] },
};

const RPT_BLUE = "rgb(22,119,255)", RPT_STEP = "rgb(53,78,180)", RPT_LINE = "rgb(237,237,237)", RPT_INPUT = "rgb(217,217,217)";
const RptFont = "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

function RptHelp() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flex:"none"}}><circle cx="7" cy="7" r="6.1" stroke="rgba(0,0,0,0.45)" strokeWidth="1"/><path d="M5.4 5.3a1.6 1.6 0 1 1 2.3 1.45c-.45.22-.7.55-.7 1.05v.3" stroke="rgba(0,0,0,0.45)" strokeWidth="1" strokeLinecap="round"/><circle cx="7" cy="10" r=".6" fill="rgba(0,0,0,0.45)"/></svg>;
}
function RptCaret() { return <svg width="12" height="12" viewBox="0 0 12 12" style={{flex:"none"}}><path d="M2.5 4.5h7L6 8.5z" fill="rgba(0,0,0,0.45)"/></svg>; }
function RptStep({ n, text }) {
  return <div style={{display:"flex",gap:5,font:`400 14px/22px ${RptFont}`,color:"rgba(0,0,0,0.7)"}}><span style={{fontWeight:500,color:RPT_STEP}}>Step {n}/3 :</span><span>{text}</span></div>;
}
function RptRadio({ on, label, onClick }) {
  return (
    <label onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:8,cursor:"pointer",font:`400 14px/22px ${RptFont}`,color:"rgba(0,0,0,0.88)",whiteSpace:"nowrap"}}>
      <span style={{width:16,height:16,borderRadius:"50%",boxSizing:"border-box",border:`1px solid ${on?RPT_BLUE:RPT_INPUT}`,background:on?RPT_BLUE:"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",flex:"none"}}>
        {on && <span style={{width:6,height:6,borderRadius:"50%",background:"#fff"}}></span>}
      </span>{label}
    </label>
  );
}
function RptCheck({ on, label, onClick, bold }) {
  return (
    <label onClick={onClick} title={label} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",font:`${bold?500:400} 14px/22px ${RptFont}`,color:"rgba(0,0,0,0.88)",minWidth:0}}>
      <span style={{width:16,height:16,borderRadius:4,boxSizing:"border-box",border:`1px solid ${on?RPT_BLUE:RPT_INPUT}`,background:on?RPT_BLUE:"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",flex:"none"}}>
        {on && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l2.6 2.6L9 1.2" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </span>
      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</span>
    </label>
  );
}
function RptField({ label, children, wide }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4,minWidth:0,gridColumn:wide?"1 / -1":undefined}}>
      <div style={{display:"flex",alignItems:"center",gap:8,font:`400 14px/22px ${RptFont}`,color:"rgba(0,0,0,0.88)"}}>{label}<RptHelp /></div>
      {children}
    </div>
  );
}
const rptInput = {height:32,borderRadius:6,background:"#fff",boxShadow:`inset 0 0 0 1px ${RPT_INPUT}`,border:"none",padding:"0 12px",display:"flex",alignItems:"center",gap:8,font:`400 14px/22px ${RptFont}`,color:"rgba(0,0,0,0.88)",boxSizing:"border-box",width:"100%"};

function RptSelect({ value, options, onChange }) {
  return (
    <div style={{...rptInput,position:"relative",padding:0}}>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{appearance:"none",WebkitAppearance:"none",border:"none",outline:"none",background:"transparent",font:"inherit",color:"inherit",width:"100%",height:"100%",padding:"0 32px 0 12px",cursor:"pointer"}}>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{position:"absolute",right:12,top:10,pointerEvents:"none",display:"flex"}}><RptCaret /></span>
    </div>
  );
}

const rptFmt = (d) => d ? `${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}/${String(d.getFullYear()).slice(2)}` : "";
const rptIso = (d) => d.toISOString().slice(0,10);

function RptDateRange({ from, to, setFrom, setTo }) {
  const d = (s) => { const [y,m,dd] = s.split("-").map(Number); return new Date(y, m-1, dd); };
  const iso = (x) => `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`;
  const [pop, setPop] = React.useState(false);
  const [view, setView] = React.useState(() => { const t = d(to); return new Date(t.getFullYear(), t.getMonth()-1, 1); });
  const [start, setStart] = React.useState(null);   // first click of a new range
  const [hover, setHover] = React.useState(null);
  const openPop = () => { const t = d(to); setView(new Date(t.getFullYear(), t.getMonth()-1, 1)); setStart(null); setHover(null); setPop(true); };
  const pick = (day) => {
    if (!start) { setStart(day); return; }
    const [a, b] = day < start ? [day, start] : [start, day];
    setFrom(iso(a)); setTo(iso(b)); setStart(null); setPop(false);
  };
  const lo = start ? (hover && hover < start ? hover : start) : d(from);
  const hi = start ? (hover && hover > start ? hover : start) : d(to);
  const same = (a, b) => a && b && a.getTime() === b.getTime();
  const MN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const Month = ({ m }) => {
    const first = new Date(m.getFullYear(), m.getMonth(), 1), lead = first.getDay(), n = new Date(m.getFullYear(), m.getMonth()+1, 0).getDate();
    const cells = Array.from({ length: lead }, () => null).concat(Array.from({ length: n }, (_, i) => new Date(m.getFullYear(), m.getMonth(), i+1)));
    return (
      <div style={{width:224}}>
        <div style={{textAlign:"center",font:`500 14px/22px ${RptFont}`,color:"rgba(0,0,0,0.88)",marginBottom:8}}>{MN[m.getMonth()]} {m.getFullYear()}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7, 32px)",rowGap:2}}>
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(w => <div key={w} style={{height:24,textAlign:"center",font:`400 12px/24px ${RptFont}`,color:"rgba(0,0,0,0.45)"}}>{w}</div>)}
          {cells.map((day, i) => {
            if (!day) return <div key={i}></div>;
            const edge = same(day, lo) || same(day, hi), inR = day > lo && day < hi;
            return (
              <div key={i} onClick={() => pick(day)} onMouseEnter={() => start && setHover(day)}
                style={{height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",background:inR?"#e6f4ff":"transparent",
                  borderRadius: same(day, lo) && same(day, hi) ? 4 : same(day, lo) ? "4px 0 0 4px" : same(day, hi) ? "0 4px 4px 0" : 0,
                  ...(edge ? {background:RPT_BLUE} : {})}}>
                <span style={{font:`400 13px/28px ${RptFont}`,color:edge?"#fff":"rgba(0,0,0,0.88)"}}>{day.getDate()}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  const nav = (dm) => setView(v => new Date(v.getFullYear(), v.getMonth()+dm, 1));
  const navBtn = {width:24,height:24,border:"none",background:"transparent",cursor:"pointer",color:"rgba(0,0,0,0.45)",font:`400 16px/24px ${RptFont}`,borderRadius:4};
  const presets = [["Last 7 days",7],["Last 30 days",30],["Last 90 days",90]];
  return (
    <div style={{position:"relative"}}>
      <div onClick={openPop} style={{...rptInput,cursor:"pointer",justifyContent:"space-between",boxShadow:`inset 0 0 0 1px ${pop?RPT_BLUE:RPT_INPUT}`}}>
        <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{rptFmt(d(from))}-{rptFmt(d(to))}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flex:"none"}}><rect x="2" y="3" width="12" height="11" rx="1" stroke="rgba(0,0,0,0.35)"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="rgba(0,0,0,0.35)" strokeLinecap="round"/></svg>
      </div>
      {pop && (
        <React.Fragment>
          <div onClick={()=>setPop(false)} style={{position:"fixed",inset:0,zIndex:1}}></div>
          <div onMouseLeave={()=>setHover(null)} style={{position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:2,background:"#fff",borderRadius:8,boxShadow:"0 6px 16px rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)",padding:"12px 14px"}}>
            <div style={{position:"relative",display:"flex",gap:20}}>
              <button onClick={()=>nav(-1)} style={{...navBtn,position:"absolute",left:0,top:-1}} title="Previous month">‹</button>
              <button onClick={()=>nav(1)} style={{...navBtn,position:"absolute",right:0,top:-1}} title="Next month">›</button>
              <Month m={view} />
              <Month m={new Date(view.getFullYear(), view.getMonth()+1, 1)} />
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10,paddingTop:10,borderTop:`1px solid ${RPT_LINE}`}}>
              {presets.map(([l,n]) => <span key={l} onClick={()=>{ const t=new Date(); t.setHours(0,0,0,0); const f=new Date(t); f.setDate(t.getDate()-n+1); setFrom(iso(f)); setTo(iso(t)); setPop(false); }} style={{font:`400 12px/20px ${RptFont}`,color:RPT_BLUE,background:"#e6f4ff",border:"1px solid #91caff",borderRadius:4,padding:"0 7px",cursor:"pointer"}}>{l}</span>)}
              <span style={{marginLeft:"auto",font:`400 12px/20px ${RptFont}`,color:"rgba(0,0,0,0.45)"}}>{start ? "Select end date" : "Select start date"}</span>
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

function ReportsDrawer({ section }) {
  const [open, setOpen] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const pickDefault = () => (RPT_SERVICES.find(s => s.sections.includes(section)) || RPT_SERVICES[2]).key;
  const [svc, setSvc] = React.useState(pickDefault);
  const today = new Date(), monthAgo = new Date(Date.now() - 30*864e5);
  const [from, setFrom] = React.useState(rptIso(monthAgo));
  const [to, setTo] = React.useState(rptIso(today));
  const [filters, setFilters] = React.useState({});
  const service = RPT_SERVICES.find(s => s.key === svc);
  const [sel, setSel] = React.useState(() => new Set(service.cols));

  React.useEffect(() => {
    window.__openReports = () => { setSvc(pickDefault()); setDone(false); setOpen(true); };
    return () => { if (window.__openReports) delete window.__openReports; };
  });
  React.useEffect(() => { setSel(new Set(service.cols)); setFilters({}); }, [svc]);
  React.useEffect(() => {
    if (!open) return;
    const k = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [open]);

  if (!open) return null;
  const allOn = sel.size === service.cols.length;
  const toggle = (c) => setSel(s => { const n = new Set(s); n.has(c) ? n.delete(c) : n.add(c); return n; });
  const reset = () => { setSel(new Set(service.cols)); setFilters({}); setFrom(rptIso(monthAgo)); setTo(rptIso(today)); };
  const fval = (k) => filters[k] || "All";

  return (
    <React.Fragment>
      <style>{`@keyframes rptSlide { from { transform: translateX(100%); } to { transform: translateX(0); } } @keyframes rptFade { from { opacity:0 } to { opacity:1 } }`}</style>
      <div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.18)",animation:"rptFade .15s ease-out"}}></div>
      <div role="dialog" aria-label="Reports" style={{position:"fixed",top:0,right:0,bottom:0,width:"min(610px, 100vw)",background:"#fff",zIndex:901,display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.13)",borderRadius:"7px 0 0 7px",animation:"rptSlide .22s ease-out",fontFamily:RptFont}}>
        <div style={{flex:"none",margin:"13px 25px 0 26px",height:54,display:"flex",alignItems:"center",borderBottom:"1px solid rgb(203,203,203)"}}>
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" style={{flex:"none"}}><path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8L14 2.5Z" stroke="rgb(30,92,130)" strokeWidth="1.8" strokeLinejoin="round"/><path d="M14 2.5V8h5.5M8.5 12.5h7M8.5 16h7M8.5 9h2.5" stroke="rgb(30,92,130)" strokeWidth="1.8" strokeLinecap="round"/></svg>
          <span style={{marginLeft:12,font:`500 18px/24px ${RptFont}`,color:"rgba(0,0,0,0.75)"}}>Reports</span>
          <span onClick={()=>setOpen(false)} title="Close" style={{marginLeft:"auto",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",borderRadius:4}}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M3 3l12 12M15 3L3 15" stroke="rgba(0,0,0,0.45)" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </span>
        </div>

        {done ? (
          <div style={{padding:"30px 26px"}}>
            <div style={{background:"rgb(239,246,255)",borderRadius:16,padding:"60px 32px 96px",display:"flex",flexDirection:"column",alignItems:"center",gap:14,textAlign:"center"}}>
              <div style={{width:99,height:99,borderRadius:"50%",background:RPT_BLUE,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="44" height="34" viewBox="0 0 44 34"><path d="M4 17l12 12L40 4" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{font:`600 24px/32px ${RptFont}`,color:"#000"}}>Report Generation is Successful!</div>
              <div style={{font:`500 16px/26px ${RptFont}`,color:"rgba(0,0,0,0.65)",maxWidth:430}}>Your {service.label} report is being prepared and will be mailed to you shortly. Please visit your inbox after a few minutes.</div>
              <button onClick={()=>setDone(false)} style={{marginTop:10,height:32,padding:"0 15px",borderRadius:6,border:`1px solid ${RPT_INPUT}`,background:"#fff",font:`400 14px/22px ${RptFont}`,color:"rgba(0,0,0,0.88)",cursor:"pointer"}}>Generate another report</button>
            </div>
          </div>
        ) : (
          <React.Fragment>
            <div className="ws-scrollbody" style={{flex:1,overflowY:"auto",padding:"35px 26px 24px"}}>
              <div style={{display:"flex",flexDirection:"column",gap:16,paddingBottom:24,borderBottom:`1px solid ${RPT_LINE}`}}>
                <RptStep n={1} text="Select Service for the Report" />
                <div style={{display:"grid",gridTemplateColumns:"repeat(5, max-content)",justifyContent:"space-between",gap:"12px 18px"}}>
                  {RPT_SERVICES.map(s => <RptRadio key={s.key} on={svc===s.key} label={s.label} onClick={()=>setSvc(s.key)} />)}
                </div>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:16,padding:"24px 0",borderBottom:`1px solid ${RPT_LINE}`}}>
                <RptStep n={2} text="Select Filters to Generate Data" />
                <div style={{display:"grid",gridTemplateColumns:"repeat(3, minmax(0,1fr))",gap:"20px 18px"}}>
                  {service.filters.map(k => {
                    const f = RPT_FILTERS[k];
                    if (f.type === "date") return (
                      <RptField key={k} label={f.label}>
                        <RptDateRange from={from} to={to} setFrom={setFrom} setTo={setTo} />
                      </RptField>
                    );
                    return (
                      <RptField key={k} label={f.label} wide={f.wide}>
                        <div style={{maxWidth:f.wide?"100%":undefined}}><RptSelect value={fval(k)} options={f.options} onChange={v=>setFilters(o=>({...o,[k]:v}))} /></div>
                      </RptField>
                    );
                  })}
                </div>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:16,paddingTop:24}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                  <RptStep n={3} text="Select the Fields to Display in the Report" />
                  <span style={{font:`400 12px/20px ${RptFont}`,color:"rgba(0,0,0,0.45)"}}>{sel.size} of {service.cols.length} selected</span>
                </div>
                <RptCheck bold on={allOn} label="Select all" onClick={()=>setSel(allOn ? new Set() : new Set(service.cols))} />
                <div style={{display:"grid",gridTemplateColumns:"repeat(3, minmax(0,1fr))",gap:"14px 18px"}}>
                  {service.cols.map(c => <RptCheck key={c} on={sel.has(c)} label={c} onClick={()=>toggle(c)} />)}
                </div>
              </div>
            </div>
            <div style={{flex:"none",display:"flex",justifyContent:"flex-end",alignItems:"center",gap:6,padding:"16px 32px 24px",borderTop:`1px solid ${RPT_LINE}`}}>
              <button onClick={reset} style={{height:40,padding:"0 15px",border:"none",background:"transparent",borderRadius:8,font:`400 16px/24px ${RptFont}`,color:"rgba(0,0,0,0.88)",cursor:"pointer"}}>Reset</button>
              <button disabled={!sel.size} onClick={()=>setDone(true)} style={{height:40,padding:"0 15px",border:"none",borderRadius:8,background:sel.size?RPT_BLUE:"rgba(0,0,0,0.04)",color:sel.size?"#fff":"rgba(0,0,0,0.25)",font:`400 16px/24px ${RptFont}`,cursor:sel.size?"pointer":"not-allowed",boxShadow:sel.size?"0 2px 0 rgba(5,145,255,0.1)":"none"}}>Generate Report</button>
            </div>
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
}
window.ReportsDrawer = ReportsDrawer;
