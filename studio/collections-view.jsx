// Collections — worklist screen + sample data (window.COL_ROWS). Dashboard config lives in v2-extensions.jsx.
(function(){
const R = React, useS = R.useState;
const F = "Roboto, system-ui, sans-serif";
const SEED = window.SEED || { ROWS:[], PAYERS:{}, REASONS:{}, CODES:[], BRANCHES:{}, USERS:[], RULES:[] };
const CATS = ["Denied","ADR","Underpaid","Pending Payment","Rejected"];
const CATMAP = { denied:"Denied", adr:"ADR", partial:"Underpaid", pending:"Pending Payment", rejected:"Rejected", paid:"Paid", done:"Completed" };
const mmdd = (d) => String(d.getMonth()+1).padStart(2,"0")+"/"+String(d.getDate()).padStart(2,"0")+"/25";
const BASE = new Date(2025,3,30);
const userName = (id) => (SEED.USERS.find(u => u.id===id)||{}).name;
const ownerOf = (r) => { for (const ru of SEED.RULES) { if (!ru.on) continue; const c = ru.cond; if ((c.reason && c.reason===r.reasonKey) || (c.minAmt && r.billed>=c.minAmt) || (c.region && c.region===r.region)) return userName(ru.to); } return "Unassigned"; };
const PSHORT = { pal:"Palmetto", cgs:"CGS", hum:"Humana", uhc:"UHC", aet:"Aetna", mcd:"Medicaid", bcb:"BCBS", cig:"Cigna" };
const PRIN = { High:3, Medium:2, Low:1, "—":0 };
const PRI = (billed, age, dl, esc, done) => done ? "—" : (esc || (dl!=null && dl<=14) || age>120 || billed>=8000) ? "High" : (age>60 || (dl!=null && dl<=45) || billed>=5000) ? "Medium" : "Low";
const VERB = { Denied:"Claim Denied", ADR:"ADR Records Requested", Underpaid:"Claim Underpaid", "Pending Payment":"Claim Pending", Rejected:"Claim Rejected", Paid:"Claim Paid in Full", Completed:"Claim Closed" };
const PRI_C = { High:["#FFF1F0","#CF1322"], Medium:["#FFFBE6","#D48806"], Low:["#F6FFED","#389E0D"] };
const WORKS = ["Open","Due Today","Overdue","Waiting on Payer","Waiting on Branch","Deferred","Escalated","Paid","Closed"];
const WORK_T = { Open:["#F5F7FA","#3A424A","#D8DEE7"], "Due Today":["#FFFBE6","#D48806","#FFE58F"], Overdue:["#FFF2E8","#D4380D","#FFBB96"], "Waiting on Payer":["#EAF2F8","#3F7BA8","#B5D3E8"], "Waiting on Branch":["#FFF7E6","#D46B08","#FFD591"], Deferred:["#F4F0FA","#6B4EA0","#D3C4EA"], Escalated:["#FFF1F0","#CF1322","#FFA39E"], Paid:["#F0FDF4","#16A34A","#B7EB8F"], Closed:["#F1F5F9","#64748B","#CBD5E1"] };
const DEFER = /^(D0|D5|D10|C15)$/;
const PAID_OUT = ["Patient Paid","Appeal Won"];
const dueOr = (w, fo) => (fo==null || fo>0) ? w : fo<0 ? "Overdue" : "Due Today";
const workFromCode = (c, fo, closure) => DEFER.test(c) ? dueOr("Deferred", fo) : ["P4","CC","AP"].includes(c) ? dueOr("Waiting on Payer", fo) : c==="RB" ? "Waiting on Branch" : c==="ES" ? "Escalated" : c==="OK" ? (PAID_OUT.includes(closure) ? "Paid" : "Closed") : dueOr("Open", fo);
const workOf = (done, esc, tk, code, fu, paid) => done ? (paid ? "Paid" : "Closed") : esc ? "Escalated" : (tk || code==="RB") ? "Waiting on Branch" : fu<0 ? "Overdue" : fu===0 ? "Due Today" : DEFER.test(code) ? "Deferred" : ["P4","CC","AP"].includes(code) ? "Waiting on Payer" : "Open";
function WorkTag({ w, h }) { const t = WORK_T[w] || WORK_T.Open; return <span style={{display:"inline-flex",alignItems:"center",...(h ? { height:h, padding:"0 12px", font:"500 12px/16px Roboto" } : {}),padding:h?"0 12px":"1px 9px",border:"1px solid "+t[2],borderRadius:6,background:t[0],color:t[1],font:h?"500 12px/16px Roboto":"500 11px/16px Roboto",whiteSpace:"nowrap",boxSizing:"border-box"}}>{w}</span>; }
const GROUPS = {
  risk:[["timely","Timely filing",r=>isOpen(r)&&r.dlType==="Timely filing"],["adr","ADR response",r=>isOpen(r)&&r.dlType==="ADR response"],["appeal","Appeal window",r=>isOpen(r)&&r.dlType==="Appeal window"],["aged","Aged 120+ days",r=>isOpen(r)&&r.ageD>120]],
  aging:[["a1","DSO ≤ 30 days",r=>isOpen(r)&&r.ageD<=30],["a2","DSO 31-60 days",r=>isOpen(r)&&r.ageD>=31&&r.ageD<=60],["a3","DSO 61-90 days",r=>isOpen(r)&&r.ageD>=61&&r.ageD<=90],["a4","DSO >90 days",r=>isOpen(r)&&r.ageD>90]],
  amount:[["m1","Under $2,500",r=>isOpen(r)&&r.billed<2500],["m2","$2,500 - $4,999",r=>isOpen(r)&&r.billed>=2500&&r.billed<5000],["m3","$5,000 - $7,999",r=>isOpen(r)&&r.billed>=5000&&r.billed<8000],["m4","$8,000 and above",r=>isOpen(r)&&r.billed>=8000]],
};
GROUPS.work = WORKS.map((w,i) => ["w"+i, w, r => r.work===w]);
window.__setCollTab = (t) => { window.__collTab = t; document.dispatchEvent(new CustomEvent("collTabChange", { detail:t })); };
window.__collView = (() => { try { return localStorage.getItem("__collView")==="claim" ? "claim" : "both"; } catch(e) { return "both"; } })();
window.__setCollView = (v) => { window.__collView = v; try { localStorage.setItem("__collView", v); } catch(e) {} document.dispatchEvent(new CustomEvent("collViewChange", { detail:v })); };
window.__collGrid = (() => { try { return localStorage.getItem("__collGrid")==="regular" ? "regular" : "combined"; } catch(e) { return "combined"; } })();
window.__setCollGrid = (v) => { window.__collGrid = v; try { localStorage.setItem("__collGrid", v); } catch(e) {} document.dispatchEvent(new CustomEvent("collGridChange", { detail:v })); };
const idOf = (r, cv) => cv==="claim" ? (r.claims ? r.patientId : r.claimNumber) : r.colId;
const GMODES = [["status","Claim Status"],["work","Collection Status"],["risk","At Risk"],["aging","A/R Aging"],["amount","Claim Amount"]];
const OUTCOMES = ["Patient Paid","Appeal Won","Written Off","Timely Filing Blocked","Payer Recoupment"];
const EXTRA = [
  ['CLM-30510','PT-2150','pal','S1',2480,64,'done','ptshare','PR-2',0,'OK',null,null,{outcome:'Patient Paid',paid:2480}],
  ['CLM-30511','PT-2161','hum','N1',1650,52,'done','ptshare','PR-3',0,'OK',null,null,{outcome:'Patient Paid',paid:1650}],
  ['CLM-30512','PT-2172','uhc','S2',5300,121,'done','medn','CO-50',0,'OK',null,null,{outcome:'Appeal Won',paid:4710}],
  ['CLM-30513','PT-1688','mcd','W1',1980,176,'done','tf','CO-29',0,'OK',null,null,{outcome:'Written Off'}],
  ['CLM-30514','PT-1602','bcb','N2',2240,149,'done','cov','CO-27',0,'OK',null,null,{outcome:'Written Off'}],
  ['CLM-30515','PT-1544','cig','E1',3120,188,'done','tf','CO-29',0,'OK',null,null,{outcome:'Timely Filing Blocked'}],
  ['CLM-30516','PT-2099','aet','N1',4075,97,'done','dup','CO-18',0,'OK',null,null,{outcome:'Payer Recoupment'}],
];
const FN = ["Maria","James","Linda","Robert","Patricia","Michael","Barbara","William","Susan","David","Karen","Joseph","Nancy","Thomas","Helen","Charles","Dorothy","Daniel","Sandra","Paul"], LN = ["Alvarez","Brooks","Chen","Davis","Edwards","Foster","Garcia","Hughes","Ito","Johnson","Kim","Lopez","Mitchell","Nguyen","Owens","Patel","Quinn","Reyes","Stewart","Turner"];
const pHash = (pt) => String(pt).split("").reduce((h,c) => (h*31 + c.charCodeAt(0)) % 100003, 7);
const pname = (pt) => { if (pt==="PT-1520") return "James Foster"; if (pt===DEMO_PT[0]) return "Daniel Lopez"; if (pt===DEMO_PT[1]) return "Marcus Hale"; const h = pHash(pt); return FN[h % FN.length]+" "+LN[Math.floor(h/7) % LN.length]; };
const mrnOf = (pt) => pt===DEMO_PT[1] ? "" : "MRN-"+String(pHash(pt)*37 % 900000 + 100000);
const PFX = { pal:"PAL", cgs:"CGS", hum:"HUM", uhc:"UHC", aet:"AET", mcd:"MCD", bcb:"BCB", cig:"CIG" };
const memOf = (pt, py) => (PFX[py]||String(py).slice(0,3).toUpperCase())+String(pHash(pt)*53 % 90000000 + 10000000);
const ALTP = (py) => { const k = Object.keys(SEED.PAYERS), i = k.indexOf(py); return k[(i+1) % k.length]; };
const MORE = SEED.ROWS.filter(a => a[6]!=="paid" && a[6]!=="done").slice(0,8).map((a,k) => ['CLM-306'+String(k+1).padStart(2,'0'), a[1], ALTP(a[2]), a[3], Math.round(a[4]*0.6/10)*10, Math.max(12,a[5]-20), 'pending', a[7], a[8], 3+k, 'P4', null, null]);
const DEMO_PT = MORE.slice(0,2).map(m => m[1]);
const RCATS = [["Denied","Denial","den"],["ADR","ADR","adr"],["Underpaid","Underpaid","und"],["Pending Payment","Pending","pen"],["Rejected","Rejected","rej"],["Paid","Paid","pai"],["Completed","Completed","com"]];
Object.keys(SEED.REASONS).forEach(k => { delete SEED.REASONS[k]; });
RCATS.forEach(([cat,w,p]) => [1,2].forEach(n => { SEED.REASONS[p+n] = { label:w+" Reason "+n, next:"Review "+w.toLowerCase()+" reason "+n+" and follow the suggested next step.", code:"RB" }; }));
const rkOf = (cat, i) => { const t = RCATS.find(x => x[0]===cat) || RCATS[0]; return t[2] + (1 + (i % 2)); };
const rows = SEED.ROWS.concat(EXTRA, MORE).map((a, i) => {
  const [id, pt, py, br, billed, age, st, rk0, pcode, fu, code, dtype, dleft, x] = a, ex = x || {}, rk = rkOf(CATMAP[st], i);
  const P = SEED.PAYERS[py] || {}, cd = SEED.CODES.find(c => c.code===code) || {}, rs = SEED.REASONS[rk] || {};
  const done = st==="paid"||st==="done", esc = !!ex.escalated || code==="ES";
  const created = new Date(2025,3,1+((i*5)%29)), resolved = new Date(created); resolved.setDate(resolved.getDate()+5+(i%11));
  const fd = new Date(BASE); fd.setDate(fd.getDate()+fu);
  const balance = done ? 0 : st==="partial" ? (ex.pr||0) : billed;
  const tk = ex.task, urgent = dleft!=null && dleft<=14;
  const at = done ? "done" : esc ? "intervention" : (urgent || (tk && tk.status==="blocked") || fu<0) ? "warning" : "progress";
  const status = done ? "Resolved" : esc ? "Escalated" : (tk || st==="pending" || fu>0) ? "In Progress" : "Open";
  const reason = at==="warning" ? (urgent ? dtype+" closes in "+dleft+" days" : tk && tk.status==="blocked" ? tk.reason : "Follow-up overdue") : at==="intervention" ? "Escalated to Team Lead — "+dtype.toLowerCase()+" closes in "+dleft+" days" : "";
  const region = SEED.BRANCHES[br], r0 = { billed, reasonKey:rk, region };
  return {
    id, name:pname(pt), patientName:pname(pt), patientId:pt, mrn:mrnOf(pt), memId:memOf(pt,py), agency:region+" Region", region, branch:br, payor:P.name, payorType:P.type, claimNumber:id,
    category:CATMAP[st], billed, balance, paid:ex.paid||0, recovered:ex.paid||0, daysOpen:done?0:age, date:mmdd(created), resolvedDate:done?mmdd(resolved):"",
    fuOff:fu, ageD:age, reasonKey:rk, stRaw:st, work:workOf(done,esc,tk,code,fu,st==="paid"||PAID_OUT.includes(ex.outcome)), colId:"COL-"+String(id).replace(/\D/g,""), lastAction: (tk ? (tk.status==="done" ? "Branch task completed" : tk.status==="blocked" ? "Branch task blocked" : "Routed to branch") : esc ? "Escalated to Team Lead" : ex.outcome ? ex.outcome : ({denied:"Denial received",partial:"Partial payment posted",pending:"Status check sent",rejected:"Rejected at clearinghouse",paid:"Payment posted",adr:"ADR letter received"})[st]), lastSub: tk ? (userName(tk.by)||"Collector")+" · "+(tk.status==="done" ? (tk.doneAgo ? tk.doneAgo+"d ago" : "today") : tk.ago+"d ago") : "System · "+Math.min(age, 1+(i%6))+"d ago", code, dlType:dtype||"", dlDays:dleft, taskState:tk?tk.status:"", payerShort:PSHORT[py]||P.name, paidAmt:ex.paid||0, priority:PRI(billed,age,dleft,esc,done), priorityN:PRIN[PRI(billed,age,dleft,esc,done)], followUp:(done||code==="OK")?"":mmdd(fd), owner:ownerOf(r0), status, at, reason,
    reasonLabel:rs.label||"", outcome:ex.outcome||"", payerCode:pcode, nextStep:code+" · "+(cd.label||""), nextStepDoes:cd.does||"",
    deadline: dleft==null ? "" : dtype+" · "+dleft+"d", deadlineDays:dleft==null?9999:dleft, hasTask:!!tk,
  };
});
rows.forEach(r => { if (r.claimNumber==="CLM-30499") Object.assign(r, { paidAmt:1640, paid:1640, recovered:1640, balance:r.billed-1640, category:CATMAP.partial, remit:{ src:"835" }, pays:[{ ref:"CHK 7741982", amt:"1640", auto:true }], lastAction:"835 payment auto-posted", lastSub:"System · 1d ago", reasonKey:"und1", reasonLabel:SEED.REASONS.und1.label }); });
window.COL_ROWS = rows;
const WORST = ["Denied","Rejected","ADR","Underpaid","Pending Payment","Paid","Completed"];
const WPRI = ["Escalated","Overdue","Due Today","Open","Waiting on Branch","Waiting on Payer","Deferred"];
function patientRows(list) {
  const g = {}; list.forEach(r => { const k = r.mrn ? r.patientId : "~"+r.id; (g[k] = g[k] || []).push(r); });
  return Object.keys(g).map(pt => {
    const cl = g[pt], op = cl.filter(r => r.work!=="Closed" && r.work!=="Paid");
    const rep = (op.length ? op : cl).slice().sort((a,b) => (b.priorityN-a.priorityN) || (b.ageD-a.ageD))[0];
    const fuRow = op.slice().sort((a,b) => a.fuOff-b.fuOff)[0] || rep;
    const dlRow = op.filter(r => r.dlDays!=null).sort((a,b) => a.dlDays-b.dlDays)[0];
    const sum = (k) => cl.reduce((a,r) => a+(+r[k]||0), 0), cid = rep.mrn ? "COL-"+String(rep.patientId).replace(/\D/g,"") : rep.colId;
    return { ...rep, id:rep.mrn ? "P-"+rep.patientId : "P-"+rep.id, colId:cid, claimNumber:cid, claims:cl, claimCount:cl.length, claimIds:cl.map(r=>r.claimNumber).join(" "),
      billed:sum("billed"), balance:sum("balance"), paidAmt:sum("paidAmt"), daysOpen:Math.max(0,...op.map(r=>r.daysOpen)), ageD:Math.max(...cl.map(r=>r.ageD)),
      category:WORST.find(c => cl.some(r => r.category===c)), work: op.length ? WPRI.find(w => op.some(r => r.work===w)) : (cl.every(r => r.work==="Paid") ? "Paid" : "Closed"),
      fuOff:fuRow.fuOff, followUp:fuRow.followUp, code:fuRow.code, dlDays:dlRow?dlRow.dlDays:null, dlType:dlRow?dlRow.dlType:"", deadlineDays:dlRow?dlRow.deadlineDays:9999, deadline:dlRow?dlRow.deadline:"",
      status: op.some(r => r.status==="Escalated") ? "Escalated" : rep.status };
  });
}
const PROWS = patientRows(rows);
window.COL_PROWS = PROWS;
window.__collModel = (() => { try { return localStorage.getItem("__collModel")==="patient" ? "patient" : "claim"; } catch(e) { return "claim"; } })();
window.__setCollModel = (m) => { window.__collModel = m; try { localStorage.setItem("__collModel", m); } catch(e) {} document.dispatchEvent(new CustomEvent("collModelChange", { detail:m })); };

const usd = (v) => "$" + (+v||0).toLocaleString("en-US");
const TONE = { Resolved:["#389E0D","#F6FFED","#B7EB8F"], "In Progress":["#D48806","#FFFBE6","#FFE58F"], Open:["#3A424A","#F5F7FA","#D8DEE7"], Escalated:["#CF1322","#FFF1F0","#FFA39E"] };
const STAG = { Paid:["#f0fdf4","#16a34a"], Completed:["#f8fafc","#64748b"], Denied:["#fef2f2","#dc2626"], ADR:["#fffbeb","#d97706"], Underpaid:["#fff7ed","#f97316"], "Pending Payment":["#eaf2f8","#3f7ba8"], Rejected:["#fdf2f8","#be185d"] };
const CAT = { Rejected:"#E0629A", Paid:"#61AA6B", Completed:"#94A3B8", Denied:"#F87D7C", ADR:"#F8C87C", Underpaid:"#7C6BD6", "Pending Payment":"#4C9FD1" };
const FILTERS = [{key:"region",label:"Region"},{key:"branch",label:"Branch"},{key:"payor",label:"Payor"},{key:"category",label:"Status"},{key:"reasonLabel",label:"Reason"},{key:"owner",label:"Assigned to"}];
const COLS = [
  { key:"claimNumber", label:"Collection ID", w:"minmax(190px,1.5fr)", sort:true },
  { key:"payor", label:"Payer", w:"minmax(170px,1.4fr)", sort:true },
  { key:"billed", label:"Billed", w:"minmax(90px,.7fr)", sort:true, right:true },
  { key:"balance", label:"Total Due", w:"minmax(110px,.8fr)", sort:true, right:true },
  { key:"daysOpen", label:"Age", w:"minmax(70px,.5fr)", sort:true, right:true },
  { key:"work", label:"Collection Status", w:"minmax(150px,1.1fr)", sort:true },
  { key:"category", label:"Claim Status & Reason", w:"minmax(240px,2fr)", sort:true },
  { key:"deadlineDays", label:"Deadline", w:"minmax(120px,.9fr)", sort:true },
  { key:"fuOff", label:"Follow-up", w:"minmax(150px,1.1fr)", sort:true },
  { key:"lastAction", label:"Last Action", w:"minmax(190px,1.3fr)", sort:true },
  { key:"owner", label:"Assigned to", w:"minmax(190px,1.4fr)", sort:true },
];
const GRID = COLS.map(c => c.w).join(" ");

const QDEF = [["Completed","Completed","#94A3B8",1], ["Paid","Paid","#61AA6B",1], ["Denied","Denied","#F87D7C",1], ["ADR","ADR","#F8C87C",1], ["Underpaid","Underpaid","#7C6BD6",1], ["Pending Payment","Pending","#4C9FD1",1], ["Rejected","Rejected","#E0629A",1]];
const QF = Object.fromEntries(QDEF.map(([k]) => [k, r => r.category===k]));
const isOpen = (r) => r.work!=="Closed" && r.work!=="Paid";
const TABS = [["all","All"],["due","Due Today"],["over","Overdue"],["aged","Aged 90+"]];
const TABF = { all:()=>true, due:r=>isOpen(r)&&r.fuOff===0, over:r=>isOpen(r)&&r.fuOff<0, aged:r=>isOpen(r)&&r.daysOpen>=90 };
const QLAB = (k) => k==="Pending Payment" ? "Pending" : k;
function TaskQueues({ groups, off, setOff, open, setOpen }) {
  const box = (on, part) => <span style={{width:14,height:14,flexShrink:0,boxSizing:"border-box",borderRadius:2,border:"1px solid "+(on||part?"#1677FF":"#bfc5cf"),background:on||part?"#1677FF":"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#fff",font:"700 10px/1 Roboto"}}>{on?"✓":part?"–":""}</span>;
  const tog = (keys, on) => setOff(o => { const n = { ...o }; keys.forEach(k => { if (on) n[k] = true; else delete n[k]; }); return n; });
  return (
    <aside style={{width:268,flexShrink:0,borderRight:"1px solid #e2e8f0",padding:"20px 0 24px",background:"#fff"}}>
      <div style={{font:"600 14px/20px Roboto",color:"#0f172a",padding:"0 20px 10px"}}>Task Queues</div>
      {groups.map(g => { const keys = g.kids.map(c=>c.key), nOn = keys.filter(k=>!off[k]).length, all = nOn===keys.length, part = nOn>0 && !all, isOpen = !!open[g.k]; return (
        <div key={g.k}>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 20px",cursor:"pointer"}} onClick={()=>setOpen(o=>({...o,[g.k]:!o[g.k]}))}>
            <svg width="10" height="10" viewBox="0 0 10 10" style={{flexShrink:0,color:"#1677FF",transform:isOpen?"rotate(90deg)":"none",transition:"transform .15s"}}><path d="M2 1 L8 5 L2 9 Z" fill="currentColor"/></svg>
            <span onClick={(e)=>{ e.stopPropagation(); tog(keys, all); }} style={{display:"inline-flex"}}>{box(all, part)}</span>
            <span style={{font:"500 13px/18px Roboto",color:"#3A424A",flex:1}}>{g.label}</span>
            <span style={{font:"600 13px/18px Roboto",color:"#3A424A"}}>{String(g.n).padStart(2,"0")}</span>
          </div>
          {isOpen && g.kids.map(c => (
            <div key={c.key} onClick={()=>tog([c.key], !off[c.key])} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 20px 7px 44px",cursor:"pointer"}}>
              {box(!off[c.key])}
              <span style={{font:"400 12px/16px Roboto",color:"#3A424A",flex:1}}>{c.label}</span>
              <span style={{font:"400 12px/16px Roboto",color:"#6A717D"}}>{String(c.n).padStart(2,"0")}</span>
            </div>))}
        </div>); })}
    </aside>
  );
}
const iso = (mmddyy) => { const m = /^(\d\d)\/(\d\d)\/(\d\d)$/.exec(mmddyy||""); return m ? "20"+m[3]+"-"+m[1]+"-"+m[2] : ""; };
function stepsOf(r) {
  const base = [["Claim submitted","837"],["Accepted by clearinghouse","999 · A"],["Accepted into payer adjudication","277CA · A2"]];
  const last = { Denied:["Payer denied the claim", r.payerCode], ADR:["Payer requested additional documentation", r.payerCode], Underpaid:["Payer paid part of the claim", r.payerCode], "Pending Payment":["Waiting on payer response", r.payerCode], Paid:["Payer paid in full", "835 · posted"], Completed:["Claim closed", r.reasonLabel] }[r.category];
  if (r.category==="Rejected") return [base[0], ["Rejected before reaching the payer", r.payerCode]];
  return [...base, last];
}
function renderSegs(segs) { return <span style={{whiteSpace:"pre-wrap"}}>{segs.map((g,i) => g.t==="m" ? <span key={i} style={{background:"#E6F0FF",color:"#1677FF",borderRadius:4,padding:"0 5px"}}>{g.v}</span> : g.t==="p" ? <span key={i} style={{background:"#F1F3F6",color:"#3A424A",borderRadius:4,padding:"0 5px"}}>Phone {g.v}</span> : <span key={i} style={{fontWeight:g.b?600:400,fontStyle:g.i?"italic":"normal"}}>{g.v}</span>)}</span>; }
function NoteComposer({ F, fu, onFu, onSave, getRef, autoFocus, toggleFu, ph0 }) {
  const ed = React.useRef(null), [menu, setMenu] = useS(null), [has, setHas] = useS(false), [fuOn, setFuOn] = useS(false);
  const names = SEED.USERS.map(u => u.name), SL = [["phone","Phone number"],["mention","Mention someone"]];
  React.useEffect(() => { if (autoFocus && ed.current) ed.current.focus(); }, []);
  const items = !menu ? [] : menu.kind==="mention" ? names.filter(n => n.toLowerCase().includes(menu.q.toLowerCase())).slice(0,6).map(n => [n,n]) : SL.filter(x => x[1].toLowerCase().includes(menu.q.toLowerCase()));
  const check = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !sel.isCollapsed || !ed.current || !ed.current.contains(sel.anchorNode) || sel.anchorNode.nodeType!==3) { setMenu(null); return; }
    const before = sel.anchorNode.textContent.slice(0, sel.anchorOffset), m = /(^|\s)([@\/])(\w*)$/.exec(before);
    if (!m) { setMenu(null); return; }
    setMenu({ kind:m[2]==="@"?"mention":"slash", q:m[3], idx:0, node:sel.anchorNode, start:sel.anchorOffset-m[3].length-1 });
  };
  const place = (node) => { const sel = window.getSelection(), rg = sel.getRangeAt(0); rg.deleteContents(); rg.insertNode(node); const sp = document.createTextNode("\u00A0"); node.after(sp); rg.setStartAfter(sp); rg.collapse(true); sel.removeAllRanges(); sel.addRange(rg); };
  const mention = (n) => { const c = document.createElement("span"); c.contentEditable = "false"; c.dataset.kind = "mention"; c.textContent = "@"+n; c.style.cssText = "background:#E6F0FF;color:#1677FF;border-radius:4px;padding:0 5px;margin:0 1px;white-space:nowrap"; return c; };
  const phone = () => { const c = document.createElement("span"); c.contentEditable = "false"; c.dataset.kind = "phone"; c.style.cssText = "display:inline-flex;align-items:center;gap:4px;background:#F1F3F6;border-radius:4px;padding:0 4px 0 6px;margin:0 1px;font-size:12px;color:#3A424A"; c.append("Phone"); const i = document.createElement("input"); i.type = "tel"; i.placeholder = "000-000-0000"; i.style.cssText = "width:104px;height:20px;border:1px solid #d9d9d9;border-radius:3px;padding:0 5px;font:400 12px/16px "+F+";outline:none;background:#fff"; i.addEventListener("input", () => setHas(true)); c.append(i); return [c, i]; };
  const insPhone = () => { const [c, i] = phone(); place(c); setHas(true); setTimeout(() => i.focus(), 0); };
  const run = (id) => {
    if (!menu) return; const rg = document.createRange(); rg.setStart(menu.node, menu.start); rg.setEnd(menu.node, Math.min(menu.node.textContent.length, menu.start+1+menu.q.length));
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(rg); setMenu(null);
    if (id==="phone") insPhone(); else if (id==="mention") { document.execCommand("insertText", false, "@"); check(); } else { place(mention(id)); setHas(true); }
  };
  const ser = () => { const out = [], push = (t,v,f) => { const l = out[out.length-1]; if (t==="t" && l && l.t==="t" && !!l.b===!!f.b && !!l.i===!!f.i) l.v += v; else out.push({ t, v, b:f.b, i:f.i }); };
    const walk = (n, f) => n.childNodes.forEach(c => { if (c.nodeType===3) push("t", c.textContent.replace(/\u00A0/g," "), f); else if (c.dataset && c.dataset.kind==="mention") push("m", c.textContent, f); else if (c.dataset && c.dataset.kind==="phone") push("p", c.querySelector("input").value.trim() || "—", f); else if (c.nodeName==="BR") push("t","\n",f); else if (c.nodeName==="LI") { push("t","• ",f); walk(c,f); push("t","\n",f); } else if (/^(DIV|P)$/.test(c.nodeName)) { if (out.length) push("t","\n",f); walk(c,f); } else if (/^(B|STRONG)$/.test(c.nodeName)) walk(c, { ...f, b:1 }); else if (/^(I|EM)$/.test(c.nodeName)) walk(c, { ...f, i:1 }); else walk(c,f); });
    walk(ed.current, {}); while (out.length && out[out.length-1].t==="t" && !out[out.length-1].v.trim()) out.pop(); if (out.length && out[out.length-1].t==="t") out[out.length-1].v = out[out.length-1].v.replace(/\s+$/,""); return out; };
  const save = () => { const segs = ser(); if (!segs.length) return; onSave(segs, toggleFu ? (fuOn ? fu : "") : undefined); ed.current.innerHTML = ""; setHas(false); setMenu(null); setFuOn(false); };
  if (getRef) getRef.current = () => { const segs = ser(); if (!segs.length) return null; ed.current.innerHTML = ""; setHas(false); setMenu(null); return segs; };
  const key = (e) => {
    if (menu && items.length) { if (e.key==="ArrowDown" || e.key==="ArrowUp") { e.preventDefault(); setMenu(m => ({ ...m, idx:(m.idx + (e.key==="ArrowDown" ? 1 : items.length-1)) % items.length })); return; } if (e.key==="Enter" || e.key==="Tab") { e.preventDefault(); run(items[menu.idx][0]); return; } }
    if (menu && e.key==="Escape") { e.preventDefault(); e.nativeEvent.stopPropagation(); setMenu(null); return; }
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key==="Enter") { e.preventDefault(); save(); return; }
    if (mod && e.shiftKey && (e.key==="8" || e.key==="*")) { e.preventDefault(); document.execCommand("insertUnorderedList"); }
  };
  const tb = (title, fn, child) => <button type="button" title={title} onMouseDown={e=>e.preventDefault()} onClick={fn} style={{width:28,height:28,border:"none",borderRadius:4,background:"transparent",cursor:"pointer",color:"#3A424A",display:"inline-flex",alignItems:"center",justifyContent:"center",font:"600 13px/1 "+F}} onMouseEnter={e=>e.currentTarget.style.background="#EEF1F5"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{child}</button>;
  const ph = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>;
  return (
    <div style={{border:"1px solid #d9d9d9",borderRadius:8,background:"#fff",position:"relative"}}>
      <style>{".nc-ed:empty:before{content:attr(data-ph);color:#94a3b8}.nc-ed ul{margin:4px 0;padding-left:20px}"}</style>
      {(!toggleFu || fuOn) && <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid #eef0f3",font:"400 12px/16px "+F,color:"#6A717D"}}>Follow-up date
        <input type="date" value={fu} onChange={e=>onFu(e.target.value)} style={{height:30,border:"1px solid #d9d9d9",borderRadius:4,padding:"0 8px",font:"400 13px/18px "+F,color:"#0f172a",background:"#fff"}} />
        {toggleFu && <button type="button" title="Remove follow-up" onClick={()=>{ setFuOn(false); onFu(""); }} style={{marginLeft:"auto",border:"none",background:"transparent",cursor:"pointer",color:"#8A94A6",fontSize:16,lineHeight:1}}>×</button>}
      </div>}
      <div ref={ed} className="nc-ed" contentEditable suppressContentEditableWarning data-ph={ph0 || "Write a note. Type @ to tag someone, or / to insert a phone number."} onInput={()=>{ setHas(ed.current.textContent.trim().length>0 || !!ed.current.querySelector("[data-kind=phone]")); check(); }} onClick={check} onKeyDown={key} style={{minHeight:toggleFu?84:120,maxHeight:240,overflowY:"auto",padding:"12px 14px",font:"400 13px/20px "+F,color:"#0f172a",outline:"none"}}></div>
      {menu && items.length>0 && <div style={{position:"absolute",left:14,bottom:52,minWidth:220,background:"#fff",border:"1px solid #e2e8f0",borderRadius:6,boxShadow:"0 8px 24px rgba(15,23,42,0.16)",padding:4,zIndex:5}}>
        <div style={{padding:"4px 8px",font:"500 10px/14px "+F,color:"#8A94A6",textTransform:"uppercase",letterSpacing:".05em"}}>{menu.kind==="mention" ? "People" : "Insert"}</div>
        {items.map((it,i) => <div key={it[0]} onMouseDown={e=>{ e.preventDefault(); run(it[0]); }} onMouseEnter={()=>setMenu(m=>({...m,idx:i}))} style={{padding:"7px 10px",borderRadius:4,cursor:"pointer",background:i===menu.idx?"#EEF4FB":"transparent",font:"400 13px/18px "+F,color:"#0f172a"}}>{menu.kind==="mention" ? "@"+it[1] : it[1]}</div>)}
      </div>}
      <div style={{display:"flex",alignItems:"center",gap:2,padding:"6px 8px",borderTop:"1px solid #eef0f3"}}>
        {tb("Bold (Ctrl/⌘ + B)", ()=>document.execCommand("bold"), "B")}
        {tb("Italic (Ctrl/⌘ + I)", ()=>document.execCommand("italic"), <span style={{fontStyle:"italic",fontFamily:"serif",fontSize:14}}>I</span>)}
        {tb("Bullet list (Ctrl/⌘ + Shift + 8)", ()=>document.execCommand("insertUnorderedList"), <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>)}
        <span style={{width:1,height:16,background:"#e5e7eb",margin:"0 6px"}}></span>
        {tb("Mention someone (@)", ()=>{ ed.current.focus(); document.execCommand("insertText", false, "@"); check(); }, "@")}
        {tb("Insert phone number (/)", ()=>{ ed.current.focus(); const sel = window.getSelection(); if (!sel.rangeCount || !ed.current.contains(sel.anchorNode)) { const rg = document.createRange(); rg.selectNodeContents(ed.current); rg.collapse(false); sel.removeAllRanges(); sel.addRange(rg); } insPhone(); }, ph)}
        {toggleFu && <button type="button" title="Add a follow-up date with this message" onMouseDown={e=>e.preventDefault()} onClick={()=>{ const on = !fuOn; setFuOn(on); if (on && !fu) { const d = new Date(BASE); d.setDate(d.getDate()+1); onFu(d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")); } if (!on) onFu(""); }} style={{display:"inline-flex",alignItems:"center",gap:6,height:28,border:"1px solid "+(fuOn?"#1677FF":"transparent"),borderRadius:4,background:fuOn?"#EEF4FF":"transparent",color:fuOn?"#1677FF":"#3A424A",cursor:"pointer",padding:"0 8px",font:"500 12px/16px "+F}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>Follow-up</button>}
        {toggleFu ? <><span style={{flex:1}}></span><button type="button" disabled={!has} onMouseDown={e=>e.preventDefault()} onClick={save} title="Post (Ctrl/⌘ + Enter)" style={{height:28,border:"none",borderRadius:4,background:has?"#1677FF":"#C9D6E8",color:"#fff",padding:"0 14px",cursor:has?"pointer":"default",font:"500 12px/16px "+F}}>Post</button></> :
        <span style={{flex:1,textAlign:"right",font:"400 11px/16px "+F,color:"#8A94A6",paddingRight:10}}>Ctrl/⌘ + Enter to add note</span>}
      </div>
    </div>
  );
}
const MOVE_PRE = { "Due Today":{fu:"2025-04-30"}, Overdue:{fu:"2025-04-29"}, "Waiting on Payer":{code:"P4"}, "Waiting on Branch":{code:"RB"}, Deferred:{code:"D5",fu:"2025-05-05"}, Escalated:{code:"ES"}, Paid:{code:"OK",closure:"Patient Paid"}, Closed:{code:"OK",closure:"Written Off"} };
function ClaimSlider({ r, onClose, saved, onSave, moveTo, cv, focusId }) {
  const co = cv!=="claim";
  const F = "Roboto, sans-serif", cls = r.claims || [r], single = !r.claims, mvPre = (moveTo && MOVE_PRE[moveTo]) || {};
  React.useEffect(() => { window.__aiCtx = { kind:"collection", r }; try { window.dispatchEvent(new Event("aictx")); } catch(e) {} return () => { window.__aiCtx = null; try { window.dispatchEvent(new Event("aictx")); } catch(e) {} }; }, [r]);
  const cvt = (v) => v ? (() => { const a = v.split("-"); return Math.round((new Date(+a[0],+a[1]-1,+a[2]) - new Date(2025,3,30))/86400000); })() : null;
  const fmtF = (v) => v ? v.slice(5,7)+"/"+v.slice(8,10)+"/"+v.slice(2,4) : "";
  const cl = (c) => (SEED.CODES.find(x=>x.code===c)||{}).label || c;
  const payOf = (c) => ({ got:c.paidAmt>0?"yes":"no", pays:(c.pays || (c.paidAmt>0 ? [{ ref:"", amt:String(c.paidAmt) }] : [])).map(p => ({ ref:p.ref, amt:p.amt })) });
  const sumP = (d) => d.got==="yes" ? d.pays.reduce((x,p) => x+(+p.amt||0), 0) : 0;
  const initC = (c) => ({ cat:c.category, manual:false, code:mvPre.code||c.code, fu:mvPre.fu||iso(c.followUp), closure:mvPre.closure||OUTCOMES[1], force:(moveTo && isOpen(c)) ? moveTo : null, items:[] });
  const [cs, setCs] = useS(() => { const m = {}; cls.forEach(c => { m[c.id] = initC(c); }); return m; });
  const [mp, setMp] = useS(null), [mpList, setMpList] = useS([]), [mpOpen, setMpOpen] = useS(true), [es, setEs] = useS(0), [tab, setTab] = useS("sum"), [dp, setDp] = useS({}), [ed, setEd] = useS(null), [sel, setSel] = useS(focusId || cls[0].id), [oc, setOc] = useS(() => (focusId ? { [focusId]: true } : cls.length===1 ? { [cls[0].id]: true } : {})), [asg, setAsg] = useS(r.owner), [away, setAway] = useS(false), [info, setInfo] = useS(false);
  const [cq, setCq] = useS(""), [chat, setChat] = useS([]), [side, setSide] = useS("act"), [moreOpen, setMoreOpen] = useS(false), [nfu, setNfu] = useS(""), [fnotes, setFnotes] = useS(() => (window.__collNotes && window.__collNotes[r.id]) || []), noteRef = React.useRef(null), boxRefs = React.useRef({}), scRef = React.useRef(null), mRef = React.useRef(null), H = React.useRef(null);
  const [asgM, setAsgM] = useS({}), ag = (c) => asgM[c.id]!==undefined ? asgM[c.id] : c.owner;
  const [ctab, setCtab] = useS("claims"), [cons, setCons] = useS({}), [upl, setUpl] = useS({}), [resub, setResub] = useS({}), [mman, setMman] = useS({}), [mf, setMf] = useS({}), [docSel, setDocSel] = useS(null);
  React.useEffect(() => { const h = () => { setSide("notes"); setMoreOpen(true); }; window.addEventListener("neos-slider", h); return () => window.removeEventListener("neos-slider", h); }, []);
  const askNeos = (t) => { const v = (t != null ? t : cq).trim(); if (!v) return; const a = window.__neosAsk ? window.__neosAsk(v) : ["Neos", "Assistant unavailable."]; setChat(m => [...m, { q:v, t:a[0], a:a[1] }]); setCq(""); setTimeout(() => { const el = document.getElementById("neos-thread"); if (el) el.scrollTop = el.scrollHeight; }, 30); };
  const gc = (c) => cs[c.id] || initC(c), dpay = (c) => dp[c.id] || payOf(c);
  const wkD = (c) => { const x = gc(c); return x.force || (isOpen(c) ? workFromCode(x.code, cvt(x.fu), x.closure) : c.work); };
  const dirtyC = (c) => { const x = gc(c); return (isOpen(c) && (x.code!==c.code || x.fu!==iso(c.followUp) || !!x.force)) || x.cat!==c.category || x.items.length>0; };
  const dirtyP = (c) => !!dp[c.id] && JSON.stringify(dp[c.id])!==JSON.stringify(payOf(c));
  const dirty = (c) => dirtyC(c) || dirtyP(c);
  const nDirty = cls.filter(dirty).length + cls.filter(c => ag(c)!==c.owner).length + mpList.length;
  const totB = cls.reduce((x,c) => x+c.billed, 0), totR = cls.reduce((x,c) => x+(c.paidAmt||0), 0) + mpList.reduce((x,e) => x+e.amt, 0);
  const aggC = (() => { const ws = cls.map(c => c.work), op = ws.filter(w => w!=="Closed" && w!=="Paid"); return op.length ? WPRI.find(w => op.includes(w)) : (ws.every(w => w==="Paid") ? "Paid" : "Closed"); })();
  const STT = { Denied:"Payor Rejected", Rejected:"CH Rejected", "Pending Payment":"Payor Pending", ADR:"Payor Pending", Underpaid:"Payor Accepted", Paid:"Payor Accepted", Completed:"Payor Accepted" };
  const rowOf = (c) => ({ id:c.id, name:c.patientName, mrn:c.mrn||"—", memId:c.memId, agency:c.region+" Region", branch:c.branch, clinician:"—", claimNumber:c.claimNumber, billType:"322", chargeAmt:usd(c.billed), socDate:c.date, dischargeDate:"—", submissionDate:c.date, eobDate:c.date, timely:c.dlType==="Timely filing" ? c.dlDays+" days left" : "Within limit", payor:c.payor, gw:"—", batchFile:"—", auditor:"—", ehrSync:true, exceptions:0, status:STT[c.category] || "Payor Pending", at:{ done:"thumb", progress:"hourglass", warning:"warning", intervention:"warning" }[c.at] || "hourglass", collPaid:c.paidAmt||0, collBilled:c.billed });
  const openFull = (c) => { if (!window.__openV2Drawer) return; const row = rowOf(c); row.siblings = cls.map(rowOf); window.__collAway = true; setAway(true); window.__openV2Drawer("claim", row); };
  const OPT = [["later","Work it later","Come back on the follow-up date",k=>DEFER.test(k),"D5"],["payer","Follow up with payer","Call or check the portal",k=>["P4","CC","AP"].includes(k),"P4"],["branch","Route to branch","Branch uploads or fixes something",k=>k==="RB","RB"],["esc","Escalate","Hand to the Team Lead",k=>k==="ES","ES"],["close","Close","Paid, or nothing more to do",k=>k==="OK","OK"]];
  const mc = ed ? cls.find(c => c.id===ed.id) : null, md = ed ? ed.d : null, mLive = !!mc && isOpen(mc);
  const mGot = md ? sumP(md) : 0, mWk = md && mLive ? (md.force || workFromCode(md.code, cvt(md.fu), md.closure)) : null;
  const openEd = (c, st) => { setEs(st||0); setSel(c.id); setOc(m => ({ ...m, [c.id]: true })); const x = gc(c), d = dpay(c); setEd({ id:c.id, d:{ code:x.code, fu:x.fu, closure:x.closure, force:x.force, cat:x.cat, manual:!!x.manual, items:[...x.items], got:d.got, pays:d.pays.map(p => ({ ...p })) } }); };
  const ESTEPS = mLive ? ["Payment","Status","Next step","Note"] : ["Payment","Status","Note"], lastStep = ESTEPS.length-1, esc2 = Math.min(es, lastStep), curS = ESTEPS[esc2];
  const ud = (p) => setEd(e => ({ ...e, d:{ ...e.d, ...p } }));
  const pick = (i) => { const o = OPT[i]; ud({ ...(md.manual ? {} : { force:null }), code:o[4], ...(o[0]==="later" && !md.fu ? { fu:"2025-05-05" } : {}) }); };
  const applyEd = () => { const pays = md.got==="yes" ? md.pays.filter(p => p.ref.trim() || +p.amt).map(p => ({ ref:p.ref, amt:p.amt })) : []; const nseg = noteRef.current ? noteRef.current() : null, items = nseg ? [["Note saved", "You · just now", mc.id, nseg], ...md.items] : md.items; setCs(m => ({ ...m, [mc.id]: { code:md.code, fu:md.fu, closure:md.closure, force:md.force, cat:md.cat, manual:md.manual, items } })); setDp(m => ({ ...m, [mc.id]: { got:md.got==="yes" && pays.length ? "yes" : "no", pays } })); setEd(null); };
  const doSave = () => {
    const entries = [];
    const nc = cls.map(c => { const x = gc(c), ex = mpList.filter(e => e.claimId===c.id), d0 = dpay(c), d = ex.length ? { got:"yes", pays:[...(d0.got==="yes" ? d0.pays : []), ...ex.map(e => ({ ref:e.how+(e.ref ? " · "+e.ref : ""), amt:String(e.amt), date:"04/30/25" }))] } : d0, got = sumP(d), live = isOpen(c), pc = dirtyP(c) || ex.length>0, sch = live && (x.code!==c.code || x.fu!==iso(c.followUp) || !!x.force);
      entries.push(...x.items);
      ex.forEach(e => entries.push(["Marked as paid: "+e.how+" · "+usd(e.amt)+(e.ref ? " ("+e.ref+")" : ""), "You · just now", c.id]));
      if (x.cat!==c.category) entries.push(["Claim status changed to "+QLAB(x.cat), "You · just now", c.id]);
      if (pc) entries.push(["Payment updated: received "+usd(got)+" of "+usd(c.billed), "You · just now", c.id]);
      if (moveTo && live) entries.push(["Moved from "+c.work+" to "+moveTo, "You · just now", c.id]);
      else if (live) { if (x.code!==c.code) entries.push(["Next step set to "+cl(x.code), "You · just now", c.id]); if (x.fu && x.fu!==iso(c.followUp)) entries.push(["Follow-up date set to "+fmtF(x.fu), "You · just now", c.id]); }
      if (!dirty(c) && !ex.length && ag(c)===c.owner) return c;
      let o = { ...c, owner:ag(c) };
      if (x.cat!==c.category) o = { ...o, category:x.cat };
      if (pc) o = { ...o, paidAmt:got, balance:c.billed-got, pays:d.got==="yes" ? d.pays : [] };
      if (sch) { const w = wkD(c), fo = cvt(x.fu), cz = w==="Closed" || w==="Paid"; o = { ...o, work:w, code:x.code, status:cz?"Resolved":w==="Escalated"?"Escalated":"In Progress", followUp:cz?"":fmtF(x.fu), fuOff:cz?9999:(fo==null?c.fuOff:fo), lastAction:cz?"Closed · "+x.closure:"Next step: "+cl(x.code), lastSub:"You · just now" }; }
      if (ex.length && c.billed-got<=0) o = { ...o, work:"Paid", status:"Resolved", followUp:"", fuOff:9999, lastAction:"Paid · "+ex[ex.length-1].how, lastSub:"You · just now" };
      return o; });
    cls.forEach(c => { if (ag(c)!==c.owner) entries.push(["Reassigned to "+ag(c), "You · just now", c.id]); });
    const changed = entries.length>0 || nc.some((c,i) => c!==cls[i]);
    let patch = null;
    if (changed) {
      if (single) patch = nc[0];
      else { const op = nc.filter(isOpen), rp = op.slice().sort((p,q) => p.fuOff-q.fuOff)[0] || nc[0], ws = nc.map(c => c.work), opw = ws.filter(w => w!=="Closed" && w!=="Paid");
        patch = { claims:nc, owner:nc[0].owner, category:WORST.find(k => nc.some(c => c.category===k)), paidAmt:nc.reduce((p,c)=>p+(c.paidAmt||0),0), balance:nc.reduce((p,c)=>p+c.balance,0), work:opw.length ? WPRI.find(w => opw.includes(w)) : (ws.every(w => w==="Paid") ? "Paid" : "Closed"), fuOff:rp.fuOff, followUp:rp.followUp, code:rp.code, status:op.some(c=>c.status==="Escalated") ? "Escalated" : op.length ? "In Progress" : "Resolved", lastAction:rp.lastAction, lastSub:rp.lastSub }; }
    }
    onSave && onSave(r.id, entries, patch); onClose();
  };
  H.current = (e) => {
    if (window.__collAway || info) return;
    const k = e.key, mod = e.ctrlKey || e.metaKey, t = e.target, typing = !!t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
    if (mp) { const tp = !!t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable); if (k==="Escape") { e.preventDefault(); setMp(null); } else if ((e.ctrlKey || e.metaKey) && (k==="s" || k==="S")) { e.preventDefault(); saveMp(); } else if (!tp && /^[1-6]$/.test(k)) { e.preventDefault(); const h = HOW[+k-1], c = cls.find(x => x.id===mp.claimId); setMp(m => ({ ...m, how:h[0], amt:h[0]==="full" ? String(Math.max(0, remOf(c))) : m.amt })); } return; }
    if (ed) {
      if (k==="Escape") { e.preventDefault(); setEd(null); return; }
      if (mod && (k==="s" || k==="S")) { e.preventDefault(); applyEd(); return; }
      if (e.altKey && k==="Enter") { e.preventDefault(); setEs(Math.max(0, esc2-1)); return; }
      if (e.altKey && curS==="Payment" && (e.code==="KeyR" || e.code==="KeyN")) { e.preventDefault(); if (e.code==="KeyR") ud({ got:"yes", pays:md.pays.length ? md.pays.map(q => ({ ref:q.ref, amt:q.amt })) : [{ ref:"", amt:"", fresh:true }] }); else ud({ got:"no" }); return; }
      if (mod && k===" " && curS==="Payment" && md.got==="yes") { e.preventDefault(); ud({ pays:[...md.pays.map(q => ({ ref:q.ref, amt:q.amt })), { ref:"", amt:"", fresh:true }] }); return; }
      if (k==="Enter" && e.shiftKey && !mod && !(t && (t.tagName==="TEXTAREA" || t.tagName==="SELECT" || t.isContentEditable || (/^(BUTTON|A)$/.test(t.tagName) && !(t.dataset && t.dataset.opt))))) { e.preventDefault(); setEs(Math.max(0, esc2-1)); return; }
      if (k==="Enter" && !mod && !e.shiftKey && !(t && (t.tagName==="TEXTAREA" || t.tagName==="SELECT" || t.isContentEditable || (/^(BUTTON|A)$/.test(t.tagName) && !(t.dataset && t.dataset.opt))))) { e.preventDefault(); setEs(Math.min(lastStep, esc2+1)); return; }
      if (!typing && !mod && mLive && curS==="Next step" && /^[1-5]$/.test(k)) { e.preventDefault(); pick(+k-1); }
      return;
    }
    if (k==="Escape") { onClose(); return; }
    if (mod && (k==="s" || k==="S")) { e.preventDefault(); doSave(); return; }
    if (mod && (k==="e" || k==="E")) { e.preventDefault(); const c = cls.find(x => x.id===sel) || cls[0]; openEd(c); return; }
    if (typing) return;
    if (k==="ArrowDown" || k==="ArrowUp") { e.preventDefault(); const i = cls.findIndex(x => x.id===sel), n = i<0 ? 0 : Math.min(cls.length-1, Math.max(0, i+(k==="ArrowDown"?1:-1))); setSel(cls[n].id); return; }
    if ((k==="Enter" || k===" ") && t && !/^(BUTTON|A)$/.test(t.tagName) && !ed) { e.preventDefault(); setOc(m => ({ ...m, [sel]: !m[sel] })); }
  };
  React.useEffect(() => { const h = (e) => H.current && H.current(e), back = () => { window.__collAway = false; setAway(false); }; document.addEventListener("keydown", h); window.addEventListener("v2drawerclose", back); return () => { document.removeEventListener("keydown", h); window.removeEventListener("v2drawerclose", back); window.__collAway = false; }; }, []);
  React.useEffect(() => { const el = boxRefs.current[sel], ct = scRef.current; if (!el || !ct) return; const er = el.getBoundingClientRect(), cr = ct.getBoundingClientRect(); if (er.top < cr.top+8) ct.scrollTop -= (cr.top+8-er.top); else if (er.bottom > cr.bottom-8) ct.scrollTop += (er.bottom-cr.bottom+8); }, [sel, ed && ed.id]);
  React.useEffect(() => { if (!ed || !mRef.current) return; if (curS==="Note" || (curS==="Payment" && md.got==="yes")) return; mRef.current.focus(); }, [curS, ed && ed.id]);
  const inp = { height:32, border:"1px solid #d9d9d9", borderRadius:4, padding:"0 10px", font:"400 13px/18px "+F, color:"#0f172a", boxSizing:"border-box", background:"#fff" };
  const kb = (t) => <span style={{padding:"0 6px",border:"1px solid #d0d5dd",borderBottomWidth:2,borderRadius:4,background:"#fff",font:"500 11px/16px "+F,color:"#3A424A"}}>{t}</span>;
  const link = (l, fn) => <a href="#" onClick={e=>{ e.preventDefault(); e.stopPropagation(); fn && fn(); }} style={{font:"400 11px/16px "+F,color:"#2B6A8E",textDecoration:"none",whiteSpace:"nowrap"}}>{l} →</a>;
  const sec = (t) => <div style={{font:"600 11px/16px "+F,color:"#6A717D",letterSpacing:".06em",textTransform:"uppercase",marginBottom:8}}>{t}</div>;
  const dv = { borderTop:"1px solid #eef0f3", marginTop:16, paddingTop:16 };
  const L = (t) => <div style={{font:"400 11px/16px "+F,color:"#6A717D"}}>{t}</div>, V = (t, col) => <div style={{font:"600 14px/20px "+F,color:col||"#0f172a"}}>{t}</div>;
  const editBtn = (c, txt, st) => <button type="button" onClick={()=>openEd(c, st)} style={{display:"inline-flex",alignItems:"center",gap:6,border:"none",background:"transparent",cursor:"pointer",color:"#1677FF",font:"500 12px/16px "+F,padding:0}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>{txt||"Edit"}</button>;
  const sysOf = (c) => [...(c.taskState ? [[c.taskState==="done"?"Branch task completed":c.taskState==="blocked"?"Branch task blocked":"Routed to branch", "Branch user, "+c.branch]] : []), ...(c.followUp && isOpen(c) ? [["Follow-up set for "+c.followUp+" · "+c.code+" "+cl(c.code), "System rule"]] : []), ...(c.lastAction ? [[c.lastAction, c.lastSub]] : [])];
  const updOf = (c) => [...(saved||[]).filter(e => e[2]===c.id), ...sysOf(c)];
  const feed = cls.flatMap(c => [...fnotes.filter(n => n.cid===c.id).map(n => ({ u:["Follow-up note"+(n.fu ? " · follow-up "+fmtF(n.fu) : ""), "You · "+n.ts, c.id, n.segs], c, t:-1 })),...(saved||[]).filter(e => e[2]===c.id).map(u => ({ u, c, t:0 })), ...sysOf(c).map(u => ({ u, c, t:1 }))]).sort((p,q) => p.t-q.t);
  const MNS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dLab = (n) => { const d = new Date(BASE); d.setDate(d.getDate()-n); return MNS[d.getMonth()]+" "+d.getDate(); };
  const ago = (w) => { const m = /(\d+)d ago/.exec(w||""); return m ? +m[1] : 0; };
  const lowc = (v) => (v||"").charAt(0).toLowerCase()+(v||"").slice(1);
  const sumFor = (c) => { const ev = [];
    (saved||[]).filter(e => e[2]===c.id).forEach(u => ev.push({ n:0, d:"Today", t:u[3] ? "A note was added" : u[0] }));
    if (c.taskState) ev.push({ n:0, d:"Today", t:(c.taskState==="done" ? "The branch finished its task" : c.taskState==="blocked" ? "The branch task is blocked" : "Routed to the branch")+" because "+lowc(c.reasonLabel) });
    if (c.lastAction) { const n = ago(c.lastSub); ev.push({ n, d:n ? dLab(n) : "Today", t:c.lastAction+" because the claim is "+QLAB(c.category).toLowerCase()+" for "+lowc(c.reasonLabel) }); }
    const past = ev.sort((p,q) => p.n-q.n).slice(0,2);
    return { past, next: c.followUp && isOpen(c) ? "Follow-up is set for "+c.followUp+" ("+cl(c.code)+")" : null }; };
  const upItem = (u, i, tag) => <div key={i} style={{display:"flex",gap:12,padding:"5px 0"}}><span style={{width:8,height:8,borderRadius:"50%",background:"#1677FF",marginTop:5,flexShrink:0}}></span><div style={{minWidth:0}}><div style={{font:"500 13px/18px "+F,color:"#0f172a"}}>{u[3] ? renderSegs(u[3]) : u[0]}</div><div style={{font:"400 11px/14px "+F,color:"#6A717D"}}>{tag ? <b style={{fontWeight:600,color:"#2B7A8C"}}>{tag}</b> : null}{tag ? " · " : ""}{u[1]}</div></div></div>;
  const PGRID = "1fr 1.15fr 1.7fr .75fr";
  const viewPay = (c) => { const d = payOf(c), has = d.got==="yes" && d.pays.length, got = sumP(d)+mpFor(c), rem = c.billed-got, GR = "1.3fr 1fr .8fr .8fr 1fr"; return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><span style={{font:"600 11px/16px "+F,color:"#6A717D",letterSpacing:".06em",textTransform:"uppercase"}}>Payment</span>
        <button type="button" title="Manage payment" onClick={()=>openEd(c)} style={{width:28,height:28,display:"inline-flex",alignItems:"center",justifyContent:"center",border:"1px solid #d9dee5",borderRadius:6,background:"#fff",cursor:"pointer",color:"#1677FF"}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg></button></div>
      <div style={{display:"flex",gap:48,marginBottom:20}}>{[["Total billed",c.billed,"#0f172a"],["Total received",got,"#0f172a"],["Total balance",rem,rem<0?"#CF1322":"#0f172a"]].map(([k,v,col]) => <div key={k}>{L(k)}<div style={{font:"600 18px/24px "+F,color:col}}>{usd(v)}</div></div>)}</div>
      <div style={{border:"1px solid #e5e7eb",borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",padding:"10px 16px",background:"#F8FAFC",borderBottom:"1px solid #e5e7eb"}}><span style={{flex:1,font:"600 13px/18px "+F,color:"#0f172a"}}>Received Remit</span><button type="button" onClick={()=>openMp(c)} style={{border:"none",background:"transparent",cursor:"pointer",color:"#1677FF",font:"500 12px/16px "+F,padding:0}}>+ Add payment</button></div>
        {has ? <div style={{padding:"0 16px"}}>
          <div style={{display:"grid",gridTemplateColumns:GR,gap:16,padding:"10px 0",borderBottom:"1px solid #eef0f3"}}>{L("Check number")}{L("Received date")}<div style={{textAlign:"right"}}>{L("Amount")}</div><div style={{textAlign:"right"}}>{L("Total balance")}</div><div style={{textAlign:"right"}}>{L("Remit advice")}</div></div>
          {d.pays.map((p,i) => <div key={i} style={{display:"grid",gridTemplateColumns:GR,gap:16,alignItems:"center",padding:"11px 0",borderBottom:i<d.pays.length-1?"1px solid #f3f4f6":"none",font:"500 13px/18px "+F,color:"#0f172a"}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:8,minWidth:0}}>{p.ref || "No reference"}{c.remit && i===0 && <span style={{padding:"0 8px",borderRadius:999,background:"#EEF4FF",color:"#1D4ED8",font:"500 11px/16px "+F,whiteSpace:"nowrap"}}>835</span>}</span>
            <span style={{fontWeight:400,color:"#3A424A"}}>{p.date || (c.remit ? "04/22/25" : "04/30/25")}</span>
            <span style={{textAlign:"right"}}>{usd(+p.amt||0)}</span>
            <span style={{textAlign:"right",color:c.billed-d.pays.slice(0,i+1).reduce((x,q)=>x+(+q.amt||0),0)<0?"#CF1322":"#0f172a"}}>{usd(c.billed-d.pays.slice(0,i+1).reduce((x,q)=>x+(+q.amt||0),0))}</span>
            <span style={{textAlign:"right"}}>{c.remit && i===0 ? <a href="#" onClick={e=>{ e.preventDefault(); e.stopPropagation(); }} style={{font:"500 12px/16px "+F,color:"#1677FF",textDecoration:"none",whiteSpace:"nowrap"}} onMouseEnter={e=>e.currentTarget.style.textDecoration="underline"} onMouseLeave={e=>e.currentTarget.style.textDecoration="none"}>View remit advice</a> : <span style={{color:"#B0B7C3"}}>—</span>}</span>
          </div>)}
        </div> : <div style={{padding:"16px",font:"400 13px/20px "+F,color:"#8A94A6"}}>No remit received yet</div>}
      </div>
    </div>); };
  const unsaved = (c) => { const x = gc(c), d = dpay(c), bits = []; if (x.cat!==c.category) bits.push("claim status "+QLAB(x.cat)); if (dirtyP(c)) bits.push("payment "+usd(sumP(d))+" received"); if (isOpen(c) && (x.force || x.code!==c.code)) bits.push("next step "+(x.force ? x.force : cl(x.code))); if (isOpen(c) && x.fu && x.fu!==iso(c.followUp)) bits.push("follow-up "+fmtF(x.fu)); if (x.items.length) bits.push(x.items.length+(x.items.length===1?" note":" notes")); return bits.join(" · "); };
  const tf = cls.map(c => c.dlType==="Timely filing" ? c.dlDays : null).filter(v => v!=null), tfMin = tf.length ? Math.min.apply(null, tf) : null, tfRisk = tfMin!=null && tfMin<=30;
  const mUnder = md ? md.pays : [];
  const mpFor = (c) => mpList.filter(e => e.claimId===c.id).reduce((a,e) => a+e.amt, 0), remOf = (c) => c.billed-(c.paidAmt||0)-mpFor(c), mpTot = mpList.reduce((a,e) => a+e.amt, 0), hasBal = cls.some(c => remOf(c)>0);
  const HOW = [["full","Payer paid in full"],["part","Payer paid partially"],["patient","Patient paid"],["appeal","Appeal won"],["second","Secondary payer paid"],["other","Others"]];
  const openMp = (cc) => { const c = (cc && cc.claimNumber ? cc : null) || cls.find(x => remOf(x)>0) || cls[0]; setMp({ claimId:c.id, how:"full", amt:String(Math.max(0, remOf(c))), ref:"", other:"" }); };
  const saveMp = () => { const a = +mp.amt; if (!(a>0)) return; setMpList(l => [...l, { id:"m"+Math.random().toString(36).slice(2,7), claimId:mp.claimId, how:mp.how==="other" ? (mp.other.trim() || "Other") : (HOW.find(h => h[0]===mp.how)||[])[1], ref:mp.ref.trim(), amt:a }]); setMp(null); setMpOpen(true); };
  const blurS = (ed || mp) ? { filter:"blur(3px)", opacity:0.5, pointerEvents:"none", transition:"filter .15s, opacity .15s" } : { transition:"filter .15s, opacity .15s" };
  const editUI = (ed && mc && md) ? (
    <div ref={mRef} tabIndex={-1} style={{width:"100%",boxSizing:"border-box",minWidth:0,border:"1px solid #BAD7FF",borderRadius:8,background:"#F8FBFF",outline:"none"}}>
      <div style={{padding:"12px 16px",borderBottom:"1px solid #DCE9FA",font:"600 13px/18px "+F,color:"#0f172a"}}>Editing <span style={{color:"#2B7A8C"}}>{mc.claimNumber}</span><span style={{font:"400 12px/16px "+F,color:"#6A717D",marginLeft:10}}>Nothing changes until you click Save Changes at the bottom.</span></div>
      <div style={{display:"flex",gap:8,padding:"10px 16px",borderBottom:"1px solid #DCE9FA"}}>{ESTEPS.map((n,i) => { const on = i===esc2, done = i<esc2; return <button key={n} type="button" onClick={()=>setEs(i)} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"4px 12px 4px 4px",border:"1px solid "+(on?"#1677FF":"#d9d9d9"),borderRadius:6,background:on?"#fff":"transparent",cursor:"pointer",font:(on?"600":"500")+" 12px/16px "+F,color:on?"#1677FF":"#3A424A"}}><span style={{width:20,height:20,borderRadius:"50%",background:on||done?"#1677FF":"#d9d9d9",color:"#fff",font:"600 11px/20px "+F,textAlign:"center"}}>{done?"✓":i+1}</span>{n}</button>; })}</div>
      <div style={{padding:"16px 16px 18px"}}>
              {curS==="Payment" && <div>
                {sec("Payment")}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:12}}>
                  <span style={{display:"inline-flex",gap:2,padding:2,background:"#EEF1F5",borderRadius:6}}>{[["yes","Received","R"],["no","Not received","N"]].map(([k,l,hk]) => { const on = md.got===k; return <button key={k} type="button" onClick={()=>ud(k==="yes" ? { got:"yes", pays:md.pays.length ? md.pays : [{ ref:"", amt:"", fresh:true }] } : { got:"no" })} style={{width:k==="yes"?132:156,justifyContent:"center",padding:"4px 0",border:"none",borderRadius:4,background:on?"#fff":"transparent",boxShadow:on?"0 1px 2px rgba(15,23,42,0.12)":"none",cursor:"pointer",font:(on?"600":"500")+" 12px/16px "+F,color:on?"#0f172a":"#6A717D"}}>{l} <span style={{marginLeft:4,font:"400 10px/14px "+F,color:"#8A94A6"}}>Alt+{hk}</span></button>; })}</span>
                  <div style={{display:"flex",gap:28,flexShrink:0}}><div style={{textAlign:"right"}}>{L("Billed")}{V(usd(mc.billed))}</div><div style={{textAlign:"right"}}>{L("Balance")}{V(usd(mc.billed-mGot), mc.billed-mGot<0?"#CF1322":"#0f172a")}</div></div>
                </div>
                {md.got==="yes" ? <div>
                  <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 28px",gap:10,marginBottom:6}}>{L("Check / reference number")}{L("Amount received")}<span></span></div>
                  {mUnder.map((p,i) => <div key={i} style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 28px",gap:10,marginBottom:8,alignItems:"center"}}>
                    <input autoFocus={!!p.fresh || i===0} value={p.ref} placeholder="e.g. check no. 10432" onChange={e=>ud({ pays:mUnder.map((q,j) => j===i ? { ...q, ref:e.target.value } : q) })} style={{...inp,width:"100%"}} />
                    <input type="number" min="0" step="0.01" value={p.amt} placeholder="0.00" onChange={e=>ud({ pays:mUnder.map((q,j) => j===i ? { ...q, amt:e.target.value } : q) })} style={{...inp,width:"100%"}} />
                    <button type="button" title="Remove payment" onClick={()=>ud({ pays:mUnder.length>1 ? mUnder.filter((q,j) => j!==i) : [{ ref:"", amt:"" }] })} style={{width:28,height:28,border:"none",borderRadius:4,background:"transparent",cursor:"pointer",color:"#8A94A6",fontSize:18,lineHeight:1}}>×</button>
                  </div>)}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <button type="button" onClick={()=>ud({ pays:[...mUnder.map(q => ({ ref:q.ref, amt:q.amt })), { ref:"", amt:"", fresh:true }] })} style={{border:"none",background:"transparent",cursor:"pointer",color:"#1677FF",font:"500 12px/16px "+F,padding:"4px 0"}}>+ Add more payment <span style={{color:"#8A94A6",fontWeight:400}}>(Ctrl+Space)</span></button>
                    <div style={{textAlign:"right"}}>{L("Total received")}{V(usd(mGot))}</div>
                  </div>
                </div> : <div style={{font:"400 13px/20px "+F,color:"#8A94A6"}}>No payment received for this claim.</div>}
              </div>}
              {curS==="Status" && <div>
                {sec("Status")}
                <div style={{display:"grid",gridTemplateColumns:mLive?"1fr 1fr":"1fr",gap:16,maxWidth:mLive?"none":320}}>
                  <div>{L("Claim status")}<select value={md.cat} onChange={e=>ud({ cat:e.target.value })} style={{...inp,width:"100%",marginTop:4}}>{QDEF.map(([k]) => <option key={k} value={k}>{QLAB(k)}</option>)}</select></div>
                  {mLive && <div>{L("Collection status")}<select value={mWk} onChange={e=>ud({ force:e.target.value, manual:true })} style={{...inp,width:"100%",marginTop:4}}>{WORKS.map(w => <option key={w}>{w}</option>)}</select></div>}
                </div>
                {mLive && <div style={{font:"400 11px/16px "+F,color:"#6A717D",marginTop:10}}>Picking a collection status here keeps it. Otherwise it follows the next step you choose on the next screen.</div>}
              </div>}
              {mLive && curS==="Next step" && <div>
                {sec("Next step")}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{OPT.map(([k,l,d,f,id],i) => { const on = !md.force && f(md.code); return <button key={k} type="button" data-opt="1" onClick={()=>pick(i)} style={{textAlign:"left",padding:"12px 14px",border:"1px solid "+(on?"#1677FF":"#d9d9d9"),background:on?"#F0F7FF":"#fff",borderRadius:8,cursor:"pointer",position:"relative"}}><span style={{position:"absolute",top:10,right:10}}>{kb(String(i+1))}</span><div style={{font:"600 13px/18px "+F,color:on?"#1677FF":"#0f172a"}}>{l}</div><div style={{font:"400 11px/16px "+F,color:"#6A717D",marginTop:2}}>{d}</div></button>; })}</div>
                <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginTop:12,font:"400 12px/16px "+F,color:"#6A717D"}}>{co ? <>Collection status after saving <WorkTag w={mWk} /></> : (md.code==="OK" && !md.force ? <span>Closure reason</span> : null)}
                  {!md.force && md.code==="OK" && <select value={md.closure} onChange={e=>ud({ closure:e.target.value })} style={{...inp,height:28,font:"400 12px/16px "+F}}>{OUTCOMES.filter(o => o!=="Patient Paid").map(o=><option key={o}>{o}</option>)}</select>}
                </div>
              </div>}
              {curS==="Note" && <div>
                {sec("Note")}
                <NoteComposer F={F} autoFocus getRef={noteRef} fu={md.fu} onFu={(v)=>ud({ ...(md.manual ? {} : { force:null }), fu:v })} onSave={(segs)=>ud({ items:[["Note saved", "You · just now", mc.id, segs], ...md.items] })} />
                {md.items.length>0 && <div style={{marginTop:12}}><div style={{font:"500 11px/16px "+F,color:"#B7791F",marginBottom:4}}>Notes added (saved with Save Changes)</div>{md.items.map((u,i) => upItem(u, i))}</div>}
              </div>}
            </div>
      <div style={{borderTop:"1px solid #DCE9FA",padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flex:1,font:"400 11px/16px "+F,color:"#6A717D",flexWrap:"wrap"}}>{curS==="Payment" && <>{kb("Enter")}Next {kb("Ctrl+Space")}Add payment {kb("Alt+R")}Received {kb("Alt+N")}Not received</>}{curS==="Next step" && <>{kb("1–5")}Choose {kb("Enter")}Next {kb("Shift+Enter")}Back</>}{curS==="Note" && <>{kb("Ctrl+Enter")}Add note {kb("Ctrl+S")}Done</>} {esc2>0 && <>{kb("Alt+Enter")}Back</>} {kb("Esc")}Cancel</div>
              {esc2>0 && <button type="button" onClick={()=>setEs(esc2-1)} style={{height:32,border:"1px solid #d9d9d9",borderRadius:4,background:"#fff",padding:"0 16px",cursor:"pointer",font:"500 13px/18px "+F,color:"#1f2937"}}>Back</button>}
              <button type="button" onClick={()=>setEd(null)} style={{height:32,border:"1px solid #d9d9d9",borderRadius:4,background:"#fff",padding:"0 18px",cursor:"pointer",font:"500 13px/18px "+F,color:"#1f2937"}}>Cancel</button>
              {esc2<lastStep ? <button type="button" onClick={()=>setEs(esc2+1)} style={{height:32,border:"none",borderRadius:4,background:"#1677FF",color:"#fff",padding:"0 20px",cursor:"pointer",font:"500 13px/18px "+F}}>Next</button> : <button type="button" onClick={applyEd} style={{height:32,border:"none",borderRadius:4,background:"#1677FF",color:"#fff",padding:"0 20px",cursor:"pointer",font:"500 13px/18px "+F}}>Done</button>}
            </div>
    </div>) : null;
  const isDen = (c) => ["Denied","Rejected","ADR"].includes(c.category);
  const ehrDocs = (c) => { const h = pHash(c.id); if (h%3===0) return []; return [["Plan of care","HCHB clinical record"],["Signed orders","HCHB clinical record"],["Visit notes","HCHB clinical record"]].slice(0, 2+h%2); };
  const accD = (c, got) => <div style={{padding:"4px 12px 12px"}}>{[["Claim number",c.claimNumber],["Payer",c.payor],["Claim status",QLAB(c.category)],["Reason",c.reasonLabel+" · "+c.payerCode],["Billed",usd(c.billed)],["Received",usd(got)],["Balance",usd(c.billed-got)],["Branch",c.branch+" · "+c.region],["Days open",c.daysOpen ? c.daysOpen+"d" : "—"],["Deadline",isOpen(c)&&c.dlDays!=null ? c.dlType+" · "+c.dlDays+" days" : "—"]].map(([k,v]) => <div key={k} style={{display:"flex",justifyContent:"space-between",gap:10,padding:"4px 0",font:"400 12px/16px "+F}}><span style={{color:"#6A717D",flexShrink:0}}>{k}</span><span style={{color:"#0f172a",fontWeight:500,textAlign:"right",minWidth:0}}>{v}</span></div>)}</div>;
  const remitNA = (c) => <div style={{padding:"28px 20px",border:"1px dashed #d0d7e2",borderRadius:8,textAlign:"center",font:"400 13px/20px "+F,color:"#6A717D"}}><b style={{display:"block",font:"600 14px/20px "+F,color:"#0f172a",marginBottom:4}}>No remittance for {QLAB(c.category).toLowerCase()} claims</b>Payment and remit advice appear here once the payer pays. Work the denial in the Claims tab.</div>;
  const SPK = (id) => <svg width="16" height="16" viewBox="0 0 28 28" style={{flexShrink:0}}><defs><linearGradient id={id} x1="4" y1="24" x2="24" y2="4" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#4285F4"/><stop offset=".5" stopColor="#9B72CB"/><stop offset="1" stopColor="#D96570"/></linearGradient></defs><path d="M14 1c.9 6.9 6.1 12.1 13 13-6.9.9-12.1 6.1-13 13-.9-6.9-6.1-12.1-13-13C7.9 13.1 13.1 7.9 14 1z" fill={"url(#"+id+")"}/></svg>;
  const manualUI = (c) => { const bal = Math.max(0, c.billed-(c.paidAmt||0)-mpFor(c)), f = { act:"Resubmit with corrections", fix:"", fixNote:"", lvl:"First-level appeal", amt:"", basis:"", wreason:"", approver:"", ask:"", cb:"", method:"", who:"", fu:"", note:"", ...(mf[c.id]||{}) }, set = (p) => setMf(m => ({ ...m, [c.id]:{ ...f, ...p } })), lb = (t) => <div style={{font:"400 11px/16px "+F,color:"#6A717D",marginBottom:4}}>{t}</div>, fld = { ...inp, width:"100%" };
    const sel = (k, opts, ph) => <select value={f[k]} onChange={e=>set({ [k]:e.target.value })} style={fld}>{ph && <option value="">{ph}</option>}{opts.map(o=><option key={o}>{o}</option>)}</select>;
    const txt = (k, ph, type) => <input type={type||"text"} value={f[k]} onChange={e=>set({ [k]:e.target.value })} placeholder={ph} style={fld} />;
    const amtV = f.amt!=="" ? f.amt : String(bal), amtNum = parseFloat(amtV) || 0;
    const amtF = (t) => <div>{lb(t)}<div style={{position:"relative"}}><span style={{position:"absolute",left:10,top:7,font:"400 13px/18px "+F,color:"#6A717D"}}>$</span><input type="number" min="0" value={amtV} onChange={e=>set({ amt:e.target.value })} style={{...fld,paddingLeft:22}} /></div></div>;
    const need = f.act==="Resubmit with corrections" ? !!f.fix : f.act==="File appeal" ? amtNum>0 : f.act==="Request write-off" ? amtNum>0 && !!f.wreason && !!f.approver : !!f.ask;
    const ok = need && !!f.method, sec = (t, sub) => <div style={{marginBottom:12}}><div style={{font:"600 11px/16px "+F,color:"#6A717D",letterSpacing:".06em",textTransform:"uppercase"}}>{t}</div>{sub && <div style={{font:"400 12px/18px "+F,color:"#8A94A6",marginTop:2}}>{sub}</div>}</div>;
    const g2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 };
    return (
    <div>
      <div style={{padding:"0 0 16px",borderBottom:"1px solid #eef0f3",marginBottom:16}}>
        {sec("Action","Pick what you are doing. The fields below follow your choice.")}
        <div style={{maxWidth:320,marginBottom:14}}>{lb("Action")}{sel("act",["Resubmit with corrections","File appeal","Request write-off","Call payer first"])}</div>
        {f.act==="Resubmit with corrections" && <div style={g2}><div>{lb("What was corrected")}{sel("fix",["Diagnosis code","Modifier","Authorization number","Member ID","Billing provider","Other"],"Select")}</div><div>{lb("Corrected value")}{txt("fixNote","e.g. new code or number")}</div></div>}
        {f.act==="File appeal" && <div style={g2}><div>{lb("Appeal level")}{sel("lvl",["First-level appeal","Second-level appeal","External review"])}</div>{amtF("Amount disputed (balance "+usd(bal)+")")}<div style={{gridColumn:"1 / -1"}}>{lb("Basis for appeal")}{sel("basis",["Medical necessity","Contract rate underpaid","Timely filing proof","Records submitted","Other"],"Select")}</div></div>}
        {f.act==="Request write-off" && <div><div style={{display:"flex",alignItems:"baseline",gap:10,padding:"10px 14px",background:"#FFF7E6",border:"1px solid #FFD591",borderRadius:6,marginBottom:14}}><span style={{font:"400 12px/18px "+F,color:"#6A717D"}}>Outstanding balance</span><b style={{font:"600 15px/20px "+F,color:"#0f172a"}}>{usd(bal)}</b></div><div style={g2}>{amtF("Amount to write off")}<div>{lb("Write-off reason")}{sel("wreason",["Timely filing missed","Non-covered service","Uncollectible","Small balance","Contractual adjustment"],"Select")}</div><div>{lb("Approver")}{sel("approver",SEED.USERS.filter(u=>u.role!=="branch").map(u=>u.name),"Select approver")}</div></div></div>}
        {f.act==="Call payer first" && <div style={g2}><div style={{gridColumn:"1 / -1"}}>{lb("What to confirm")}{sel("ask",["Claim status","Denial reason detail","Documents required","Appeal process","Payment date"],"Select")}</div><div>{lb("Expected callback")}{txt("cb","",  "date")}</div></div>}
      </div>
      <div>
        {sec("Contact","How and who you reached, and when to follow up.")}
        <div style={g2}>
          <div>{lb("Contact method")}{sel("method",["Payer portal","Phone","Fax","Email"],"Select")}</div>
          <div>{lb("Person and reference")}{txt("who","Rep name or call ref")}</div>
          <div>{lb("Follow-up date")}{txt("fu","","date")}</div>
          <div>{lb("Attachment")}<label style={{...fld,display:"flex",alignItems:"center",cursor:"pointer",color:"#1677FF",font:"500 12px/18px "+F}}><input type="file" style={{display:"none"}} onChange={e=>{ const n = e.target.files && e.target.files[0] ? e.target.files[0].name : ""; setUpl(m=>({...m,[c.id]:n})); }} /><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{upl[c.id] ? upl[c.id] : "+ Attach file"}</span></label></div>
        </div>
        <div style={{marginTop:14}}>{lb("Note")}<textarea value={f.note} onChange={e=>set({ note:e.target.value })} placeholder="What was done, what happens next" rows={2} style={{...fld,height:"auto",padding:"8px 10px",resize:"vertical"}}></textarea></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginTop:16}}>
        <button type="button" disabled={!ok} onClick={()=>setResub(m=>({...m,[c.id]:"manual"}))} style={{height:34,border:"none",borderRadius:4,background:ok?"#1677FF":"#C9D6E8",color:"#fff",padding:"0 18px",cursor:ok?"pointer":"not-allowed",font:"500 13px/18px "+F}}>{f.act==="Request write-off" ? "Submit write-off" : f.act==="File appeal" ? "File appeal" : f.act==="Call payer first" ? "Log call" : "Save and resubmit"}</button>
        {!ok && <span style={{font:"400 11px/16px "+F,color:"#8A94A6"}}>{need ? "Pick a contact method to continue" : "Complete the action fields to continue"}</span>}
      </div>
    </div>); };
  const docsFor = () => { const c = cls.find(z => z.id===sel) || cls[0]; if (!c) return []; const h = pHash(c.id), out = [{ id:"img", t:"Claim image ("+(800+h%90)+")", s:"Submitted", body:["Claim "+c.claimNumber,"Payer: "+c.payor,"Billed: "+usd(c.billed),"Form: CMS-1450 (UB-04)"] },{ id:"ack", t:"Acknowledgments", s:"999 accepted, 277CA", body:["999 — Accepted","277CA — "+(c.category==="Rejected"?"Rejected at clearinghouse: "+c.reasonLabel:"Accepted for adjudication"),"Payer claim control number on file"] }]; ehrDocs(c).forEach(([n,s],i) => out.push({ id:"e"+i, t:n, s, body:[n+" — "+c.patientName,"Source: "+s,"Dated within the episode of care","Signed and on file"] })); if (c.category==="ADR") out.push({ id:"adr", t:"ADR letter", s:"Documents requested by the MAC", body:["Additional Documentation Request from "+c.payor,"Reason: "+c.reasonLabel+" ("+c.payerCode+")","Respond within the payer deadline"] }); return out; };
  const denialUI = (c) => { const docs = ehrDocs(c), done = resub[c.id], ok = !!cons[c.id], f = upl[c.id], man = !!mman[c.id]; const btn = (en, on, txt) => <button type="button" disabled={!en} onClick={on} style={{height:34,border:"none",borderRadius:4,background:en?"#1677FF":"#C9D6E8",color:"#fff",padding:"0 18px",cursor:en?"pointer":"not-allowed",font:"500 13px/18px "+F}}>{txt}</button>; return (
    <div style={{border:"1px solid "+(man&&!done?"#d9dee5":"#FFE0B2"),borderRadius:8,background:man&&!done?"#fff":"#FFFDF8",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderBottom:"1px solid "+(man&&!done?"#eef0f3":"#FDEBD0")}}>{SPK("dn"+c.id)}<span style={{font:"600 13px/18px "+F,color:"#0f172a"}}>Neos analysis</span><span style={{font:"600 14px/20px "+F,color:"#0f172a"}}>{c.reasonLabel}</span>{!done && <div style={{marginLeft:"auto",display:"inline-flex",gap:2,padding:2,background:"#EEF1F5",borderRadius:6}}>{[[false,"AI prepared"],[true,"Prepare manually"]].map(([k,l]) => { const on = man===k; return <button key={l} type="button" onClick={()=>setMman(m=>({...m,[c.id]:k}))} style={{padding:"4px 14px",border:"none",borderRadius:4,background:on?"#fff":"transparent",boxShadow:on?"0 1px 2px rgba(15,23,42,0.12)":"none",cursor:"pointer",font:(on?"600":"500")+" 12px/16px "+F,color:on?"#0f172a":"#6A717D"}}>{l}</button>; })}</div>}</div>
      <div style={{padding:"14px 16px 16px"}}>
        {!man && <div style={{font:"400 13px/20px "+F,color:"#3A424A"}}>Neos analyzed this {QLAB(c.category).toLowerCase()} claim. <b style={{fontWeight:600,color:"#0f172a"}}>{c.payor}</b> returned it with reason <b style={{fontWeight:600,color:"#0f172a"}}>{c.reasonLabel}</b> ({c.payerCode}). Billing configuration from the first pass is on file and will be reused on resubmission.</div>}
        {done ? <div style={{marginTop:14,padding:"10px 14px",borderRadius:6,background:"#F6FFED",border:"1px solid #B7EB8F",font:"500 13px/18px "+F,color:"#389E0D"}}>{done==="manual" ? "Prepared manually and sent to "+c.payor+"." : "Resubmitted to "+c.payor}{done==="manual" ? "" : docs.length ? " with "+docs.length+" EHR documents attached." : f ? " with "+f+" attached." : "."} Tracking continues in Claim Status.</div>
        : man ? manualUI(c) : docs.length ? <div style={{marginTop:14}}>
          <div style={{font:"600 11px/16px "+F,color:"#6A717D",letterSpacing:".06em",textTransform:"uppercase",marginBottom:8}}>Supporting documents found in EHR</div>
          {docs.map(([n,s]) => <div key={n} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",border:"1px solid #e5e7eb",borderRadius:6,background:"#fff",marginBottom:6}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#389E0D" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg><span style={{font:"500 13px/18px "+F,color:"#0f172a"}}>{n}</span><span style={{font:"400 11px/16px "+F,color:"#6A717D"}}>{s}</span></div>)}
          
          <div style={{marginTop:12}}>{btn(true, ()=>setResub(m=>({...m,[c.id]:true})), "Upload from EHR and resubmit")}</div>
        </div> : <div style={{marginTop:14}}>
          <div style={{font:"400 13px/20px "+F,color:"#6A717D",marginBottom:10}}>No matching documents were found in the EHR. Upload the supporting file below, then resubmit.</div>
          <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,padding:"22px 16px",border:"1.5px dashed "+(f?"#389E0D":"#b9c8dc"),borderRadius:8,background:"#fff",cursor:"pointer",font:"400 13px/18px "+F,color:"#3A424A",marginBottom:12}}><input type="file" style={{display:"none"}} onChange={e=>{ const n = e.target.files && e.target.files[0] ? e.target.files[0].name : ""; setUpl(m=>({...m,[c.id]:n})); }} />{f ? <b style={{fontWeight:600,color:"#389E0D"}}>{f}</b> : <><b style={{fontWeight:600,color:"#1677FF"}}>Choose a file</b><span style={{color:"#8A94A6"}}>PDF, image or document</span></>}</label>
          {btn(!!f, ()=>setResub(m=>({...m,[c.id]:true})), "Resubmit claim")}
        </div>}
      </div>
    </div>); };
  const postNote = (segs, fu) => { const cc = cls.find(z => z.id===sel) || cls[0], e = { segs, fu:fu||"", cid:cc.id, ts:"just now" }; setFnotes(l => { const n = [...l, e]; window.__collNotes = { ...(window.__collNotes||{}), [r.id]:n }; return n; }); if (fu) setCs(m => { const x = m[cc.id] || initC(cc); return { ...m, [cc.id]:{ ...x, fu, ...(x.manual ? {} : { force:null }) } }; }); setNfu(""); setTimeout(() => { const el = document.getElementById("fn-thread"); if (el) el.scrollTop = el.scrollHeight; }, 30); };
  const notesUI = <>
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"16px 20px",borderBottom:"1px solid #eef0f3"}}><span style={{flex:1,font:"600 15px/20px "+F,color:"#0f172a"}}>Follow-up notes</span><span style={{font:"500 12px/16px "+F,color:"#6A717D"}}>{fnotes.length}</span></div>
    <div id="fn-thread" style={{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:14}}>
      {fnotes.length===0 && <div style={{font:"400 13px/20px "+F,color:"#8A94A6"}}>No notes yet. Write what happened, paste call details, and use Follow-up to set the next date.</div>}
      {fnotes.map((n,i) => { const cc = cls.find(z => z.id===n.cid) || cls[0]; return <div key={i} style={{display:"flex",gap:10}}>
        <span style={{width:28,height:28,borderRadius:"50%",background:"#C6A78F",color:"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",font:"500 11px/1 "+F,flexShrink:0}}>You</span>
        <div style={{flex:1,minWidth:0,border:"1px solid #e6e9ee",borderRadius:"4px 12px 12px 12px",padding:"10px 12px",background:"#FAFBFD"}}>
          <div style={{font:"400 11px/16px "+F,color:"#6A717D",marginBottom:4}}>You · {n.ts}{cls.length>1 ? " · " : ""}{cls.length>1 && <b style={{fontWeight:600,color:"#2B7A8C"}}>{cc.colId}</b>}</div>
          <div style={{font:"400 13px/20px "+F,color:"#1f2937",wordBreak:"break-word"}}>{renderSegs(n.segs)}</div>
          {n.fu && <div style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:8,padding:"2px 8px",borderRadius:4,background:"#EEF4FF",color:"#1677FF",font:"500 11px/16px "+F}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>Follow-up {fmtF(n.fu)}</div>}
        </div>
      </div>; })}
    </div>
    <div style={{padding:"12px 16px 16px",borderTop:"1px solid #eef0f3"}}><NoteComposer F={F} toggleFu fu={nfu} onFu={setNfu} onSave={postNote} ph0="Write a note or paste details. Type @ to tag someone, / for a phone number." /></div>
  </>;
  return (
    <React.Fragment>
    <div style={{position:"fixed",inset:0,zIndex:200,display:away?"none":"flex",justifyContent:"flex-end",background:"rgba(15,23,42,0.3)"}} onClick={onClose}>
      <div data-neos-slider-rel="1" onClick={e=>e.stopPropagation()} style={{position:"relative",width:moreOpen?1881:1496,maxWidth:"100%",transition:"width .2s ease",height:"100%",background:"#fff",boxSizing:"border-box",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"-12px 0 32px rgba(15,23,42,0.18)",fontFamily:F}}>

      <div style={{height:61,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 37px",background:"#fff",...blurS}}>
        <span style={{flex:1,font:"500 20px/21px Roboto",color:"#000"}}>Collection Details View</span>
        
        <button type="button" title="Close" onClick={onClose} style={{width:28,height:28,border:"none",borderRadius:"50%",background:"transparent",cursor:"pointer",fontSize:24,color:"#000",lineHeight:"26px",padding:0}}>×</button>
      </div>
      <div style={{flexShrink:0,minHeight:107,boxSizing:"border-box",background:"#F5FAFF",boxShadow:"inset 0 0 0 1px #EDEDED",padding:"19px 38px",display:"flex",alignItems:"center",gap:24,overflowX:"auto",...blurS}}>
        <span style={{font:"700 26px/31px Roboto",color:"#000",whiteSpace:"nowrap",flexShrink:0,marginRight:8}}>{r.patientName}</span>
        <div style={{display:"flex",flexDirection:"column",gap:2,flexShrink:0}}><span style={{font:"400 14px/18px Roboto",color:"#0F0F59",whiteSpace:"nowrap"}}>MRN</span><span style={{font:"400 16px/20px Roboto",color:"#000",whiteSpace:"nowrap"}}>{r.mrn || "—"}</span></div>
        <div style={{display:"flex",flexDirection:"column",gap:2,flexShrink:0}}><span style={{font:"400 14px/18px Roboto",color:"#0F0F59",whiteSpace:"nowrap"}}>Member ID</span><span style={{font:"400 16px/20px Roboto",color:"#000",whiteSpace:"nowrap"}}>{r.memId || "—"}</span></div>
        <div style={{display:"flex",flexDirection:"column",gap:2,flexShrink:0}}><span style={{font:"400 14px/18px Roboto",color:"#0F0F59",whiteSpace:"nowrap"}}>Payor Name</span><span style={{font:"400 16px/20px Roboto",color:"#000",whiteSpace:"nowrap"}}>{(cls[0]||{}).payor || "—"}</span></div>
        <div style={{display:"flex",flexDirection:"column",gap:2,flexShrink:0}}><span style={{font:"400 14px/18px Roboto",color:"#0F0F59",whiteSpace:"nowrap"}}>Payor Type</span><span style={{font:"400 16px/20px Roboto",color:"#000",whiteSpace:"nowrap"}}>{r.payorType || "—"}</span></div>
        <div style={{display:"flex",flexDirection:"column",gap:2,flexShrink:0}}><span style={{font:"400 14px/18px Roboto",color:"#0F0F59",whiteSpace:"nowrap"}}>Agency</span><span style={{font:"400 16px/20px Roboto",color:"#000",whiteSpace:"nowrap"}}>{r.agency || "—"}</span></div>
        <div style={{display:"flex",flexDirection:"column",gap:2,flexShrink:0}}><span style={{font:"400 14px/18px Roboto",color:"#0F0F59",whiteSpace:"nowrap"}}>Collections</span><span style={{font:"400 16px/20px Roboto",color:"#000",whiteSpace:"nowrap"}}>{String(cls.length).padStart(2,"0")}</span></div>
      </div>
      <div style={{flex:1,minHeight:0,display:"flex"}}>
      <div style={{flex:"1 1 560px",minWidth:560,display:"flex",flexDirection:"column",position:"relative",background:"#fff",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"flex-end",gap:32,padding:"0 36px",height:46,flexShrink:0,borderBottom:"1px solid #e1e1e1",overflowX:"auto",...blurS}}>{cls.map(c => { const on = sel===c.id; return <button key={c.id} type="button" onClick={()=>{ setSel(c.id); setOc(m=>({...m,[c.id]:true})); }} style={{border:"none",background:"transparent",cursor:"pointer",height:46,padding:"0 2px",whiteSpace:"nowrap",font:(on?"600":"500")+" 14px/20px "+F,color:on?"#1677FF":"rgba(0,0,0,0.6)",borderBottom:"2px solid "+(on?"#1677FF":"transparent"),marginBottom:-1}}>{c.colId}<span style={{marginLeft:8,font:"400 12px/16px "+F,color:on?"#1677FF":"#6A717D"}}>{usd(c.billed-(c.paidAmt||0)-mpFor(c))}</span></button>; })}</div>
        <div style={{padding:"14px 24px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",...blurS}}>
          {(() => { const c = cls.find(z => z.id===sel) || cls[0], dr = dirty(c); return <>
          <div style={{flex:1,minWidth:0,font:"500 15px/22px "+F,color:"#3A424A",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.colId}<span style={{color:"#94a3b8",margin:"0 8px"}}>|</span><span style={{color:"#0f172a"}}>{c.claimNumber}</span></div>
          {(dr || mpList.length>0) && <span style={{font:"500 11px/16px "+F,color:"#B7791F"}}>Unsaved</span>}
          <span style={{font:"400 13px/18px "+F,color:"#6A717D",whiteSpace:"nowrap"}}>Assigned to <b style={{fontWeight:500,color:"#1f2937"}}>{ag(c)}</b></span><span style={{width:1,height:14,background:"#d9dee5"}}></span><span style={{font:"500 13px/18px "+F,color:(c.dlType==="Timely filing" && c.dlDays<=30)?"#CF1322":"#3A424A",whiteSpace:"nowrap"}}>{c.dlType==="Timely filing" ? c.dlDays+" days left" : "Within limit"}</span><span style={{width:1,height:14,background:"#d9dee5"}}></span><span style={{font:"500 13px/18px "+F,color:"#1677FF",whiteSpace:"nowrap"}}>{wkD(c)}</span>
          {!moreOpen && <button type="button" onClick={()=>setMoreOpen(true)} style={{height:30,border:"none",borderRadius:4,background:"#1677FF",color:"#fff",padding:"0 16px",cursor:"pointer",font:"500 13px/18px "+F,flexShrink:0}}>More Info</button>}
          </>; })()}
        </div>
        <div ref={scRef} style={{borderTop:"1px solid #e5e7eb",overflowY:"auto",overflowX:"hidden",padding:"20px 32px 36px",flex:1}}>
          <div style={{display:"flex",alignItems:"flex-end",gap:24,borderBottom:"1px solid #e5e7eb",marginBottom:18,marginTop:-8}}>{[["claims","Claims"],["remit","Remittance"]].map(([k,l]) => { const on = ctab===k; return <button key={k} type="button" onClick={()=>setCtab(k)} style={{border:"none",background:"transparent",cursor:"pointer",padding:"8px 2px 10px",font:(on?"600":"500")+" 14px/20px "+F,color:on?"#1677FF":"#6A717D",borderBottom:"2px solid "+(on?"#1677FF":"transparent"),marginBottom:-1}}>{l}</button>; })}
            {(() => { const cc = cls.find(z => z.id===sel) || cls[0], tt = STAG[cc.category]; const kv = (k, v) => <div style={{display:"flex",flexDirection:"column",gap:2,minWidth:0}}><span style={{font:"400 11px/14px "+F,color:"#6A717D"}}>{k}</span>{v}</div>; return <div style={{marginLeft:"auto",display:"flex",gap:28,paddingBottom:8,minWidth:0}}>{kv("Payer",<span style={{font:"500 12px/18px "+F,color:"#0f172a",whiteSpace:"nowrap"}}>{cc.payor}</span>)}{kv("Claim status",<span style={{alignSelf:"flex-start",padding:"0 8px",border:"1px solid "+tt[1],borderRadius:6,color:tt[1],background:tt[0],font:"500 11px/16px "+F}}>{QLAB(cc.category)}</span>)}{kv("Additional info",<span style={{font:"500 12px/18px "+F,color:"#0f172a",whiteSpace:"nowrap"}}>{cc.reasonLabel} · {cc.payerCode}</span>)}</div>; })()}
          </div>
          {moveTo && <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",background:"#F0F7FF",border:"1px solid #BAD7FF",borderRadius:6,padding:"10px 14px",marginBottom:18,font:"400 13px/18px "+F,color:"#0f172a"}}>Moving from <WorkTag w={r.work} /> to <WorkTag w={moveTo} /><span style={{color:"#6A717D"}}>Nothing changes until you click Save Changes.</span></div>}
          {tab==="sum" && <>
          {cls.filter(c => c.id===(cls.find(z => z.id===sel) || cls[0]).id).map(c => { const o = true, isSel = sel===c.id, got = (c.paidAmt||0) + mpFor(c), t2 = STAG[c.category], live = isOpen(c), dr = dirty(c), x = gc(c); return (
            <div key={c.id} ref={el=>{ boxRefs.current[c.id] = el; }} style={ed && ed.id===c.id ? {border:"1px solid #1677FF",boxShadow:"0 18px 44px rgba(15,23,42,0.30), 0 0 0 3px rgba(22,119,255,0.16)",borderRadius:8,marginBottom:12,overflow:"hidden",background:"#fff",position:"relative",zIndex:2,transform:"translateY(-2px)",transition:"box-shadow .15s, transform .15s"} : {border:"none",boxShadow:"none",borderRadius:8,marginBottom:12,overflow:"hidden",background:"#fff",...blurS}}>
              <div style={{padding:ed && ed.id===c.id ? "16px 16px 20px" : "0 0 20px"}}>
                {ed && ed.id===c.id ? editUI : (<>
                                {dr && <div style={{marginTop:14,padding:"8px 12px",borderRadius:6,background:"#FFFBE6",border:"1px solid #FFE58F",font:"400 12px/18px "+F,color:"#7A5A00"}}><b style={{fontWeight:600}}>Unsaved</b> · {unsaved(c) || "changes"}. Click Save Changes to apply.</div>}
                {ctab==="remit" ? <div style={isDen(c) ? { ...dv, borderTop:"none", marginTop:0, paddingTop:0 } : dv}>{isDen(c) ? remitNA(c) : viewPay(c)}</div> : isDen(c) && <div style={{ ...dv, borderTop:"none", marginTop:0, paddingTop:0 }}>{denialUI(c)}</div>}
                {ctab==="claims" && !isDen(c) && <div style={dv}>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}><span style={{font:"600 11px/16px "+F,color:"#6A717D",letterSpacing:".06em",textTransform:"uppercase"}}>Next step</span>{live && editBtn(c, "Edit", 1)}</div>
                  <div style={{font:"500 13px/20px "+F,color:"#0f172a"}}>{live ? cl(c.code)+(c.followUp ? " · follow-up "+c.followUp : "") : "Closed — no next step needed"}{live && isOpen(c) && (x.force || x.code!==c.code) && <span style={{color:"#B7791F",marginLeft:8}}>→ {x.force ? x.force : cl(x.code)} (unsaved)</span>}</div>
                </div>}
</>)}
              </div>
            </div>); })}

          {mp && (() => { const c = cls.find(x => x.id===mp.claimId) || cls[0], rm = remOf(c); return (
            <div style={{position:"absolute",inset:0,zIndex:30,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(15,23,42,0.28)",backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)"}} onClick={()=>setMp(null)}><div onClick={e=>e.stopPropagation()} style={{width:"calc(100% - 64px)",maxWidth:760,maxHeight:"calc(100% - 64px)",overflowY:"auto",border:"1px solid #BAD7FF",borderRadius:10,background:"#F8FBFF",boxShadow:"0 24px 64px rgba(15,23,42,0.35)"}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #DCE9FA",font:"600 13px/18px "+F,color:"#0f172a"}}>Mark as paid<span style={{font:"400 12px/16px "+F,color:"#6A717D",marginLeft:10}}>Nothing changes until you click Save Changes at the bottom.</span></div>
              <div style={{padding:"16px 16px 18px"}}>
                {cls.length>1 && <div style={{marginBottom:14}}>{L("Claim")}<select value={mp.claimId} onChange={e=>{ const cc = cls.find(x => x.id===e.target.value); setMp(m => ({ ...m, claimId:cc.id, amt:m.how==="full" ? String(Math.max(0, remOf(cc))) : m.amt })); }} style={{...inp,width:"100%",maxWidth:420,marginTop:4}}>{cls.map(x => <option key={x.id} value={x.id}>{x.claimNumber} · remaining {usd(remOf(x))}</option>)}</select></div>}
                {sec("How was it paid")}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{HOW.map(([k,l],i) => { const on = mp.how===k; return <button key={k} type="button" onClick={()=>setMp(m => ({ ...m, how:k, amt:k==="full" ? String(Math.max(0, rm)) : m.amt }))} style={{textAlign:"left",padding:"12px 14px",border:"1px solid "+(on?"#1677FF":"#d9d9d9"),background:on?"#F0F7FF":"#fff",borderRadius:8,cursor:"pointer",position:"relative"}}><span style={{position:"absolute",top:10,right:10}}>{kb(String(i+1))}</span><div style={{font:"600 13px/18px "+F,color:on?"#1677FF":"#0f172a"}}>{l}</div></button>; })}</div>
                {mp.how==="other" && <div style={{marginTop:12}}>{L("Describe how it was paid")}<input autoFocus value={mp.other} onChange={e=>setMp(m => ({ ...m, other:e.target.value }))} placeholder="Type how it was paid" style={{...inp,width:"100%",marginTop:4}} /></div>}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:16}}>
                  <div>{L("Amount received ($)")}<input type="number" min="0" step="0.01" value={mp.amt} onChange={e=>setMp(m => ({ ...m, amt:e.target.value }))} style={{...inp,width:"100%",marginTop:4}} /></div>
                  <div>{L("Check / reference number")}<input value={mp.ref} onChange={e=>setMp(m => ({ ...m, ref:e.target.value }))} placeholder="e.g. check no. 10432" style={{...inp,width:"100%",marginTop:4}} /></div>
                </div>
                <div style={{display:"flex",gap:32,marginTop:14,paddingTop:12,borderTop:"1px solid #E3EDF9"}}><div>{L("Billed")}{V(usd(c.billed))}</div><div>{L("Remaining before")}{V(usd(rm))}</div><div>{L("Remaining after")}{V(usd(rm-(+mp.amt||0)), rm-(+mp.amt||0)<0?"#CF1322":"#0f172a")}</div></div>
              </div>
              <div style={{borderTop:"1px solid #DCE9FA",padding:"12px 16px",display:"flex",alignItems:"center",gap:12,background:"#fff"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flex:1,font:"400 11px/16px "+F,color:"#6A717D",flexWrap:"wrap"}}>{kb("1–6")}How paid {kb("Ctrl+S")}Add {kb("Esc")}Cancel</div>
                <button type="button" onClick={()=>setMp(null)} style={{height:32,border:"1px solid #d9d9d9",borderRadius:4,background:"#fff",padding:"0 18px",cursor:"pointer",font:"500 13px/18px "+F,color:"#1f2937"}}>Cancel</button>
                <button type="button" onClick={saveMp} style={{height:32,border:"none",borderRadius:4,background:+mp.amt>0?"#1677FF":"#9CC4FF",color:"#fff",padding:"0 20px",cursor:"pointer",font:"500 13px/18px "+F}}>Add payment</button>
              </div>
            </div></div>); })()}
          {!mp && mpList.length>0 && <div style={{border:"1px solid #e5e7eb",borderRadius:8,background:"#fff",overflow:"hidden",marginBottom:12,...blurS}}>
            <div onClick={()=>setMpOpen(o => !o)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",cursor:"pointer",background:"#F6F5FC"}}>
              <svg width="12" height="12" viewBox="0 0 12 12" style={{color:"#6A717D",transform:mpOpen?"rotate(90deg)":"none",transition:"transform .15s"}}><path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>
              <div style={{font:"600 13px/18px "+F,color:"#0f172a",flex:1}}>Marked as paid</div>
              <div style={{font:"500 12px/16px "+F,color:"#B7791F"}}>Unsaved</div>
              <div>{L("Amount")}<div style={{font:"600 13px/18px "+F,color:"#0f172a"}}>{usd(mpTot)}</div></div>
            </div>
            {mpOpen && <div style={{padding:"8px 16px 14px",borderTop:"1px solid #eef0f3"}}>
              {mpList.map(en => <div key={en.id} style={{display:"grid",gridTemplateColumns:"1.2fr 1.6fr 1.3fr .8fr 28px",gap:12,alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f1f3f6",font:"400 13px/18px "+F,color:"#0f172a"}}>
                <span style={{fontWeight:600}}>{(cls.find(x => x.id===en.claimId)||{}).claimNumber}</span><span>{en.how}</span><span style={{color:"#6A717D"}}>{en.ref || "No reference"}</span><span style={{fontWeight:600,textAlign:"right"}}>{usd(en.amt)}</span>
                <button type="button" title="Remove" onClick={()=>setMpList(l => l.filter(x => x.id!==en.id))} style={{width:24,height:24,border:"none",borderRadius:4,background:"transparent",cursor:"pointer",color:"#8A94A6",fontSize:18,lineHeight:1}}>×</button>
              </div>)}
            </div>}
          </div>}
          </>}
        </div>
        <div style={{borderTop:"1px solid #e5e7eb",padding:"12px 32px",display:"flex",alignItems:"center",gap:12,background:"#fff",...blurS}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",flex:1,minWidth:0,font:"400 11px/16px "+F,color:"#6A717D"}}>{kb("↑↓")}Select claim {kb("Enter")}Expand {kb("Ctrl+E")}Edit {kb("Ctrl+S")}Save {kb("Esc")}Close</div>
          {nDirty>0 && <span style={{font:"500 12px/16px "+F,color:"#B7791F"}}>{nDirty} unsaved</span>}
          <button type="button" onClick={onClose} style={{height:32,border:"1px solid #d9d9d9",borderRadius:4,background:"#fff",padding:"0 18px",cursor:"pointer",font:"500 13px/18px "+F,color:"#1f2937"}}>Cancel</button>
          <button type="button" onClick={doSave} style={{height:32,border:"none",borderRadius:4,background:"#1677FF",color:"#fff",padding:"0 18px",cursor:"pointer",font:"500 13px/18px "+F}}>Save Changes</button>
        </div>
      </div>
      {moreOpen && <div style={{width:385,flexShrink:0,borderLeft:"1px solid #e5e3e3",background:"#fff",display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}} onClick={ev=>ev.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 22px",height:46,flexShrink:0,...blurS}}><span style={{font:"500 16px/20px Roboto",color:"#000"}}>More Info</span><button type="button" title="Close" onClick={()=>setMoreOpen(false)} style={{width:28,height:28,border:"none",borderRadius:"50%",background:"transparent",cursor:"pointer",fontSize:20,color:"#000",lineHeight:"26px",padding:0}}>×</button></div>
        <div style={{display:"flex",alignItems:"flex-end",gap:22,padding:"0 22px",height:46,flexShrink:0,borderBottom:"1px solid #e1e1e1",...blurS}}>{[["docs","Documents"],["act","Activity"],["notes","Notes & Followup"]].map(([k,l]) => { const on = side===k; return <button key={k} type="button" onClick={()=>setSide(k)} style={{border:"none",background:"transparent",cursor:"pointer",height:46,padding:"0 2px",whiteSpace:"nowrap",font:(on?"600":"500")+" 14px/20px "+F,color:on?"#1677FF":"rgba(0,0,0,0.6)",borderBottom:"2px solid "+(on?"#1677FF":"transparent"),marginBottom:-1}}>{l}</button>; })}</div>
        {side==="notes" ? notesUI : side==="ask" ? (() => { const sg = (window.__neosSug && window.__neosSug("collection")) || []; return <>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"16px 20px",borderBottom:"1px solid #eef0f3"}}><svg width="20" height="20" viewBox="0 0 28 28"><defs><linearGradient id="rn1" x1="4" y1="24" x2="24" y2="4" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#4285F4"/><stop offset=".5" stopColor="#9B72CB"/><stop offset="1" stopColor="#D96570"/></linearGradient></defs><path d="M14 1c.9 6.9 6.1 12.1 13 13-6.9.9-12.1 6.1-13 13-.9-6.9-6.1-12.1-13-13C7.9 13.1 13.1 7.9 14 1z" fill="url(#rn1)"/></svg><span style={{flex:1,font:"500 15px/20px "+F,color:"#1f2937"}}>Ask Neos</span></div>
          <div id="neos-thread" style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
            <div style={{border:"1px solid #e6e9ee",borderRadius:12,padding:"12px 14px",background:"#FAFBFD",marginBottom:16}}>
              <div style={{font:"600 14px/20px "+F,color:"#0f172a"}}>{r.patientName}</div>
              <div style={{font:"400 12px/16px "+F,color:"#6A717D",marginTop:2}}>{r.mrn ? "MRN-"+r.mrn : "No MRN"} · Member ID {r.memId}</div>
              <div style={{display:"flex",gap:20,marginTop:10}}>{[["Billed",usd(totB)],["Received",usd(totR)],["Balance",usd(totB-totR)]].map(([k,v]) => <div key={k}><div style={{font:"400 11px/16px "+F,color:"#6A717D"}}>{k}</div><div style={{font:"600 13px/18px "+F,color:"#0f172a"}}>{v}</div></div>)}</div>
              <div style={{marginTop:10,borderTop:"1px solid #eef0f3"}}>{cls.map(c => <div key={c.id} style={{display:"flex",justifyContent:"space-between",gap:10,padding:"7px 0",borderBottom:"1px solid #f3f4f6",font:"400 12px/16px "+F,color:"#3A424A"}}><span style={{fontWeight:500,color:"#0f172a"}}>{c.claimNumber}</span><span style={{color:"#6A717D"}}>{QLAB(c.category)}</span><span>{usd(c.billed-(c.paidAmt||0)-mpFor(c))}</span></div>)}</div>
            </div>
            {chat.map((m,i) => <div key={i} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}><span style={{maxWidth:"85%",padding:"7px 12px",borderRadius:"14px 14px 4px 14px",background:"#EEF4FF",color:"#1D4ED8",font:"400 13px/18px "+F}}>{m.q}</span></div>
              <div style={{display:"flex",gap:8,alignItems:"flex-start"}}><span style={{marginTop:2}}><svg width="16" height="16" viewBox="0 0 28 28"><defs><linearGradient id="rn2" x1="4" y1="24" x2="24" y2="4" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#4285F4"/><stop offset=".5" stopColor="#9B72CB"/><stop offset="1" stopColor="#D96570"/></linearGradient></defs><path d="M14 1c.9 6.9 6.1 12.1 13 13-6.9.9-12.1 6.1-13 13-.9-6.9-6.1-12.1-13-13C7.9 13.1 13.1 7.9 14 1z" fill="url(#rn2)"/></svg></span><div style={{flex:1,minWidth:0}}><div style={{font:"500 12px/16px "+F,color:"#6A717D",marginBottom:4}}>{m.t}</div><div style={{font:"400 13px/20px "+F,color:"#1f2937",whiteSpace:"pre-wrap"}}>{m.a}</div></div></div>
            </div>)}
            {!chat.length && <><div style={{font:"500 11px/16px "+F,color:"#8A94A6",letterSpacing:".06em",textTransform:"uppercase",margin:"0 4px 6px"}}>Suggested for this collection</div>
              {sg.map(t => <button key={t} type="button" onClick={()=>askNeos(t)} onMouseEnter={e=>e.currentTarget.style.background="#F3F6FF"} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{display:"flex",alignItems:"center",gap:10,width:"100%",textAlign:"left",border:"none",background:"transparent",borderRadius:8,padding:"9px 10px",cursor:"pointer",font:"400 13px/18px "+F,color:"#1f2937"}}><svg width="13" height="13" viewBox="0 0 28 28"><defs><linearGradient id="rn3" x1="4" y1="24" x2="24" y2="4" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#4285F4"/><stop offset=".5" stopColor="#9B72CB"/><stop offset="1" stopColor="#D96570"/></linearGradient></defs><path d="M14 1c.9 6.9 6.1 12.1 13 13-6.9.9-12.1 6.1-13 13-.9-6.9-6.1-12.1-13-13C7.9 13.1 13.1 7.9 14 1z" fill="url(#rn3)"/></svg>{t}</button>)}</>}
            {chat.length>0 && <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{sg.slice(0,4).map(t => <button key={t} type="button" onClick={()=>askNeos(t)} style={{border:"1px solid #e2e8f0",background:"#fff",borderRadius:999,padding:"4px 12px",cursor:"pointer",font:"400 12px/16px "+F,color:"#3A424A"}}>{t}</button>)}</div>}
          </div>
          <div style={{padding:"12px 16px 16px",borderTop:"1px solid #eef0f3"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,height:46,borderRadius:23,padding:"0 8px 0 16px",border:"1.5px solid transparent",background:"linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,#4285F4 0%,#9B72CB 50%,#D96570 100%) border-box"}}><svg width="18" height="18" viewBox="0 0 28 28"><defs><linearGradient id="rn4" x1="4" y1="24" x2="24" y2="4" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#4285F4"/><stop offset=".5" stopColor="#9B72CB"/><stop offset="1" stopColor="#D96570"/></linearGradient></defs><path d="M14 1c.9 6.9 6.1 12.1 13 13-6.9.9-12.1 6.1-13 13-.9-6.9-6.1-12.1-13-13C7.9 13.1 13.1 7.9 14 1z" fill="url(#rn4)"/></svg><input value={cq} onChange={e=>setCq(e.target.value)} onKeyDown={e=>{ if (e.key==="Enter") { e.preventDefault(); askNeos(); } }} placeholder={"Ask about "+r.patientName+"…"} style={{flex:1,minWidth:0,border:"none",outline:"none",background:"transparent",font:"400 14px/20px "+F,color:"#1f2937"}} /><button type="button" onClick={()=>askNeos()} style={{height:32,border:"none",borderRadius:16,background:cq.trim()?"#1677FF":"#C9D6E8",color:"#fff",padding:"0 14px",cursor:"pointer",font:"500 12px/16px "+F}}>Ask</button></div>
          </div></>; })() : <>
        <div style={{display:"flex",alignItems:"center",padding:"16px 20px",borderBottom:"1px solid #eef0f3"}}><span style={{flex:1,font:"600 15px/20px "+F,color:"#0f172a"}}>{side==="act" ? "Activity Log" : side==="docs" ? "Documents ("+docsFor().length+")" : "AI Summary"}</span></div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
          {side==="docs" ? (() => { const ds = docsFor(); const open = ds.find(d => d.id===docSel); return <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {ds.map(d => { const on = d.id===docSel; return <button key={d.id} type="button" onClick={()=>setDocSel(on?null:d.id)} style={{textAlign:"left",border:"1px solid "+(on?"#1677FF":"#e2e8f0"),borderRadius:8,background:on?"#F0F7FF":"#fff",padding:"10px 14px",cursor:"pointer"}}><div style={{font:"600 14px/20px "+F,color:"#0f172a"}}>{d.t}</div><div style={{font:"400 12px/16px "+F,color:"#6A717D",marginTop:2}}>{d.s}</div></button>; })}
            {open ? <div style={{border:"1px solid #e2e8f0",borderRadius:8,padding:"14px 16px",background:"#FAFBFD"}}><div style={{font:"600 13px/18px "+F,color:"#0f172a",marginBottom:8}}>{open.t}</div>{open.body.map((l,i) => <div key={i} style={{font:"400 12px/18px "+F,color:"#3A424A",padding:"3px 0"}}>{l}</div>)}</div>
            : null}
          </div>; })()
          : side==="act" ? (feed.length ? feed.map((f,i) => upItem(f.u, i, f.c.claimNumber)) : <div style={{font:"400 12px/18px "+F,color:"#8A94A6"}}>No activity yet.</div>)
          : cls.map((c,ci) => { const sm = sumFor(c); return (
            <div key={c.id} style={{marginTop:ci?16:0}}>
              <div style={{font:"600 13px/18px "+F,color:"#0f172a",marginBottom:6}}>{c.claimNumber}</div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {sm.past.length===0 && !sm.next && <div style={{font:"400 12px/18px "+F,color:"#8A94A6"}}>No activity yet.</div>}
                {sm.past.map((x,i) => <div key={i} style={{display:"flex",gap:10,font:"400 12px/18px "+F,color:"#3A424A"}}><span style={{width:5,height:5,borderRadius:"50%",background:"#94A3B8",marginTop:7,flexShrink:0}}></span><span><b style={{fontWeight:600,color:"#0f172a"}}>{x.d}</b> — {x.t}</span></div>)}
                {sm.next && <div style={{display:"flex",gap:10,font:"400 12px/18px "+F,color:"#3A424A"}}><span style={{width:5,height:5,borderRadius:"50%",background:"#1677FF",marginTop:7,flexShrink:0}}></span><span><b style={{fontWeight:600,color:"#1677FF"}}>Next</b> — {sm.next}</span></div>}
              </div>
            </div>); })}
        </div></>}
      </div>}
      </div>

      </div>
    </div>
    
    </React.Fragment>
  );
}
const BOARD_C = { Completed:"#75859B", Paid:"#55996A", Denied:"#D0645F", ADR:"#CC9A3A", Underpaid:"#7466BD", "Pending Payment":"#4F93C2", Rejected:"#C25F92" };
const WBOARD_C = { Open:"#75859B", "Due Today":"#C99A35", Overdue:"#D2735A", "Waiting on Payer":"#4F93C2", "Waiting on Branch":"#CC9A3A", Deferred:"#7466BD", Escalated:"#D0645F", Paid:"#55996A", Closed:"#64748B" };
const BOARD_ORD = { claim:null, work:null };
function ClaimBoard({ rows, onOpen, onMove, by, setBy, cv }) {
  const only = cv==="claim";
  const [, bump] = useS(0), [over, setOver] = useS(null), drag = React.useRef(null);
  const claimMode = only || by==="claim", prim = claimMode ? "category" : "work", ok = claimMode ? "claim" : "work";
  const base = claimMode ? QDEF.map(([k]) => [k, QLAB(k), BOARD_C[k]]) : WORKS.map(w => [w, w, WBOARD_C[w]]);
  const ord = BOARD_ORD[ok] || base.map(d => d[0]);
  const defs = ord.map(k => base.find(d => d[0]===k)).filter(Boolean);
  const cols = defs.map(([k,l,col]) => ({ k, l, col, items: rows.filter(r => r[prim]===k) }));
  const canMove = !claimMode;
  const stat = (l, v, red) => <div style={{minWidth:0}}><div style={{font:"400 10px/14px Roboto",color:"#6A717D",whiteSpace:"nowrap"}}>{l}</div><div style={{font:"500 11px/16px Roboto",color:red?"#CF1322":"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={typeof v==="string"?v:undefined}>{v}</div></div>;
  const chip = (r) => { const t = STAG[r.category]; return <span style={{padding:"1px 8px",border:"1px solid "+t[1],borderRadius:6,color:t[1],background:t[0],font:"500 10px/14px Roboto",whiteSpace:"nowrap"}}>{QLAB(r.category)}</span>; };
  const card = (r, c) => { const open = isOpen(r), fu = !open||!r.followUp ? "—" : r.fuOff===0 ? "Today" : r.fuOff<0 ? "Overdue" : r.followUp; return (
    <div key={r.id} draggable={canMove} onDragStart={e=>{ drag.current = { t:"card", r }; e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", r.id); } catch(x) {} }} onDragEnd={()=>{ drag.current = null; setOver(null); }} onClick={()=>onOpen&&onOpen(r)} title={canMove?undefined:"Claim status is set by the payer. Switch to Collection Status to move cards."} style={{cursor:canMove?"grab":"pointer",border:"1px solid "+c.col+"66",borderRadius:8,background:"#fff",padding:"8px 12px 10px",boxShadow:"0 1px 3px rgba(15,23,42,0.06)"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
        {only ? <span></span> : <div><div style={{font:"400 10px/14px Roboto",color:"#6A717D"}}>{claimMode ? "Collection Status:" : "Claim Status:"}</div><div style={{marginTop:2}}>{claimMode ? <WorkTag w={r.work} /> : chip(r)}</div></div>}
        {r.daysOpen>0 && <span style={{padding:"1px 10px",borderRadius:3,background:"#F0F0F0",color:r.daysOpen>60?"#CF1322":"#3A424A",font:"500 11px/16px Roboto"}}>{r.daysOpen}d</span>}
      </div>
      
      <div style={{margin:"8px 0 2px",font:"600 13px/18px Roboto",color:"#2B7A8C"}}>{idOf(r,cv)}{r.claims && <span style={{font:"400 11px/16px Roboto",color:"#6A717D",marginLeft:8}}>{r.claimCount} {r.claimCount===1?"claim":"claims"}</span>}</div>
      <div style={{font:"400 11px/16px Roboto",color:"#6A717D",marginBottom:8,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={r.reasonLabel+" · "+r.payerCode}>{r.reasonLabel} · {r.payerCode}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 10px"}}>
        {stat("Payer", r.payor)}{stat("Billed", usd(r.billed))}
        {stat("Deadline", open&&r.dlDays!=null ? r.dlDays+" days" : "—", open&&r.dlDays!=null&&r.dlDays<=14)}
        {stat("Follow-up", fu+(open?" "+r.code:""), open&&(r.fuOff<0||!r.followUp))}
        {stat("Last Action", r.lastAction)}{stat("Owner", r.owner, r.owner==="Unassigned")}
      </div>
    </div>); };
  const seg = (k, l) => { const on = by===k; return <button key={k} type="button" onClick={()=>setBy(k)} style={{padding:"4px 14px",border:"none",borderRadius:4,background:on?"#fff":"transparent",boxShadow:on?"0 1px 2px rgba(15,23,42,0.12)":"none",cursor:"pointer",font:(on?"600":"500")+" 12px/16px Roboto",color:on?"#0f172a":"#6A717D"}}>{l}</button>; };
  const onDrop = (c) => { const d = drag.current; drag.current = null; setOver(null); if (!d) return;
    if (d.t==="col") { if (d.k!==c.k) { const o = ord.filter(k => k!==d.k); o.splice(o.indexOf(c.k), 0, d.k); BOARD_ORD[ok] = o; bump(n => n+1); } }
    else if (d.t==="card" && canMove && d.r.work!==c.k) onMove && onMove(d.r, c.k); };
  return (
    <div style={{background:"#f8fafc",borderRadius:8,padding:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,font:"400 12px/16px Roboto",color:"#6A717D",flexWrap:"wrap"}}>{!only && <>Group by
        <span style={{display:"inline-flex",gap:2,padding:2,background:"#EEF1F5",borderRadius:6}}>{seg("claim","Claim Status")}{seg("work","Collection Status")}</span></>}
        <span style={{color:"#8A94A6"}}>{canMove ? "Drag a card to another column to change its collection status. Drag a column header to reorder." : "Drag a column header to reorder."}</span>
      </div>
      <div className="cb-h" style={{display:"flex",alignItems:"flex-start",gap:16,overflowX:"scroll",overflowY:"hidden",width:"100%",maxWidth:"100%",boxSizing:"border-box",paddingBottom:10}}>
        <style>{".cb-h::-webkit-scrollbar{height:5px;display:block}.cb-h::-webkit-scrollbar-track{background:#e2e8f0;border-radius:3px}.cb-h::-webkit-scrollbar-thumb{background:#94a3b8;border-radius:3px}.cb-h::-webkit-scrollbar-thumb:hover{background:#64748b}.cb-v{scrollbar-width:thin;scrollbar-color:#d9dee5 transparent}.cb-v::-webkit-scrollbar{width:2px}.cb-v::-webkit-scrollbar-thumb{background:#d9dee5}"}</style>
        {cols.map(c => { const hot = over===c.k, d = drag.current; return (
          <div key={c.k} onDragOver={e=>{ const dd = drag.current; if (dd && (dd.t==="col" || canMove)) { e.preventDefault(); if (over!==c.k) setOver(c.k); } }} onDragLeave={e=>{ if (!e.currentTarget.contains(e.relatedTarget)) setOver(o => o===c.k ? null : o); }} onDrop={e=>{ e.preventDefault(); onDrop(c); }}
            style={{width:300,flexShrink:0,boxSizing:"border-box",background:hot?"#EAF2FB":"transparent",outline:hot?"2px dashed #1677FF":"none",outlineOffset:4,borderRadius:8,padding:0,transition:"background .1s"}}>
            <div draggable onDragStart={e=>{ drag.current = { t:"col", k:c.k }; e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", c.k); } catch(x) {} }} onDragEnd={()=>{ drag.current = null; setOver(null); }} title="Drag to reorder" style={{cursor:"grab",display:"flex",alignItems:"center",justifyContent:"space-between",background:c.col,color:"#fff",borderRadius:4,padding:"8px 12px",font:"600 13px/18px Roboto",marginBottom:12}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:8}}><svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" style={{opacity:.7}}><circle cx="2" cy="2" r="1.2"/><circle cx="8" cy="2" r="1.2"/><circle cx="2" cy="7" r="1.2"/><circle cx="8" cy="7" r="1.2"/><circle cx="2" cy="12" r="1.2"/><circle cx="8" cy="12" r="1.2"/></svg>{c.l}</span>
              <span style={{font:"500 11px/16px Roboto",display:"inline-flex",alignItems:"center",gap:8}}>{String(c.items.length).padStart(2,"0")} {c.items.length===1?"Claim":"Claims"}<i style={{width:1,height:12,background:"rgba(255,255,255,.6)"}}></i>{usd(c.items.reduce((a,r)=>a+r.billed,0))}</span>
            </div>
            <div className="cb-v" style={{display:"flex",flexDirection:"column",gap:12,maxHeight:"calc(100vh - 430px)",minHeight:220,overflowY:"auto",paddingRight:4}}>
              {!c.items.length && <div style={{padding:"36px 8px",textAlign:"center",font:"400 12px/16px Roboto",color:"#94a3b8",border:"1px dashed #d9dee5",borderRadius:8,background:"#fff"}}>No claims available</div>}
              {c.items.map(r => card(r, c))}
            </div>
          </div>); })}
      </div>
    </div>
  );
}
function seedQ() {
  const us = SEED.USERS.filter(u => u.role!=="branch").map(u => u.name), U = (i) => us[i % Math.max(1, us.length)] || "Unassigned";
  const rk = Object.keys(SEED.REASONS), pk = Object.keys(SEED.PAYERS), n = Math.ceil(rk.length/4);
  const groups = [{ id:"g1", name:"Group 1", owners:[U(0),U(1)] }, { id:"g2", name:"Group 2", owners:[U(2),U(3)] }, { id:"g3", name:"Group 3", owners:[U(4)] }];
  const SPLIT = [["den1","den2","rej1","rej2"],["adr1","adr2","und1","und2"],["pen1","pen2","pai1","pai2","com1","com2"]];
  const rules = groups.map((g,i) => ({ id:"r"+(i+1), group:g.id, errors:SPLIT[i], payers:[] }));
  return { groups, rules };
}
function CollSettings() {
  const F = "Roboto, sans-serif", users = SEED.USERS.filter(u => u.role!=="branch").map(u => u.name).concat(["Unassigned"]);
  const [open, setOpen] = useS(false), [ed, setEd] = useS(null);
  const [data, setData] = useS(() => { try { const j = JSON.parse(localStorage.getItem("__collQueues3")); if (j && j.groups && j.rules) return j; } catch(e) {} return seedQ(); });
  React.useEffect(() => { const h = () => setOpen(true); document.addEventListener("openCollSettings", h); return () => document.removeEventListener("openCollSettings", h); }, []);
  React.useEffect(() => { try { localStorage.setItem("__collQueues3", JSON.stringify(data)); } catch(e) {} }, [data]);
  React.useEffect(() => { if (!open) return; const h = (e) => { if (e.key==="Escape") { e.stopPropagation(); if (ed) setEd(null); else setOpen(false); } }; document.addEventListener("keydown", h, true); return () => document.removeEventListener("keydown", h, true); }, [open, ed]);
  if (!open) return null;
  const gName = (id) => (data.groups.find(g => g.id===id) || {}).name || "—";
  const tag = (t, i) => <span key={i} style={{display:"inline-flex",alignItems:"center",padding:"2px 8px",border:"1px solid #d9d9d9",borderRadius:2,background:"#fff",font:"400 12px/16px "+F,color:"#333",whiteSpace:"nowrap"}}>{t}</span>;
  const tags = (arr, all) => !arr.length ? (all ? tag(all) : <span style={{color:"#94a3b8",font:"400 12px/16px "+F}}>None</span>) : <>{arr.slice(0,3).map(tag)}{arr.length>3 && <span style={{padding:"2px 8px",border:"1px solid #d9d9d9",borderRadius:2,background:"#f8fafc",font:"400 12px/16px "+F,color:"#3A424A",whiteSpace:"nowrap"}} title={arr.slice(3).join(", ")}>+{arr.length-3} more</span>}</>;
  const docI = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b6bcc6" strokeWidth="1.6"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></svg>;
  const acts = (onE, onD) => <div style={{display:"flex",gap:14,justifyContent:"center"}}><button type="button" title="Edit" onClick={onE} style={{border:"none",background:"transparent",cursor:"pointer",color:"#1677FF",padding:0}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg></button><button type="button" title="Delete" onClick={onD} style={{border:"none",background:"transparent",cursor:"pointer",color:"#E5484D",padding:0}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg></button></div>;
  const addBtn = (l, fn) => <button type="button" onClick={fn} style={{display:"inline-flex",alignItems:"center",gap:8,height:34,border:"none",borderRadius:4,background:"#1677FF",color:"#fff",padding:"0 14px",cursor:"pointer",font:"500 13px/18px "+F}}><span style={{width:16,height:16,borderRadius:"50%",background:"rgba(255,255,255,.95)",color:"#1677FF",font:"700 13px/16px "+F,textAlign:"center"}}>+</span>{l}</button>;
  const head = (cols, labels) => <div style={{display:"grid",gridTemplateColumns:cols,alignItems:"center",background:"#f8fafc",minHeight:44,borderBottom:"1px solid #e5e7eb",font:"500 13px/18px "+F,color:"#1f2937"}}>{labels.map((l,i) => <div key={i} style={{padding:"0 14px",textAlign:i===labels.length-1?"center":"left"}}>{l}</div>)}</div>;
  const GC = "36px 1.1fr 1.7fr 1.5fr 90px", RC = "36px 1.1fr 1.8fr 1.4fr 90px";
  const row = (cols, cells, key) => <div key={key} style={{display:"grid",gridTemplateColumns:cols,alignItems:"center",minHeight:52,borderBottom:"1px solid #f1f3f6"}}>{cells.map((c,i) => <div key={i} style={{padding:"8px 14px",minWidth:0,display:"flex",flexWrap:"wrap",gap:6,alignItems:"center",justifyContent:i===cells.length-1?"center":"flex-start",font:"400 13px/18px "+F,color:"#1f2937"}}>{c}</div>)}</div>;
  const sec = (title, sub, btn, table) => <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:32,padding:"28px 0",borderBottom:"1px solid #e5e7eb"}}>
    <div><div style={{font:"500 15px/20px "+F,color:"#0f172a"}}>{title}</div><div style={{font:"400 13px/18px "+F,color:"#6A717D",margin:"8px 0 16px"}}>{sub}</div>{btn}</div>
    <div style={{border:"1px solid #e5e7eb",borderRadius:4,overflow:"hidden",background:"#fff",alignSelf:"start"}}>{table}</div></div>;
  const chip = (on, l, fn, k) => <button key={k} type="button" onClick={fn} style={{padding:"4px 12px",border:"1px solid "+(on?"#1677FF":"#d9d9d9"),borderRadius:6,background:on?"#F0F7FF":"#fff",color:on?"#1677FF":"#3A424A",cursor:"pointer",font:(on?"500":"400")+" 12px/16px "+F}}>{on?"✓ ":""}{l}</button>;
  const tog = (arr, v) => arr.includes(v) ? arr.filter(x => x!==v) : [...arr, v];
  const lab = (t) => <div style={{font:"500 12px/16px "+F,color:"#3A424A",margin:"16px 0 8px"}}>{t}</div>;
  const uid = () => "x"+Math.random().toString(36).slice(2,7);
  const saveEd = () => { const d = ed.d; if (ed.k==="group") { if (!d.name.trim()) return; setData(x => ({ ...x, groups: x.groups.some(g => g.id===d.id) ? x.groups.map(g => g.id===d.id ? d : g) : [...x.groups, d] })); } else { if (!d.group) return; let nd = d, ng = null; if (d.group==="__new") { if (!(d.ng && d.ng.name.trim())) return; ng = { id:uid(), name:d.ng.name.trim(), owners:d.ng.owners, payers:[] }; nd = { ...d, group:ng.id }; delete nd.ng; } setData(x => ({ ...x, groups: ng ? [...x.groups, ng] : x.groups, rules: x.rules.some(r => r.id===nd.id) ? x.rules.map(r => r.id===nd.id ? nd : r) : [...x.rules, nd] })); } setEd(null); };
  const delGroup = (id) => setData(x => ({ groups:x.groups.filter(g => g.id!==id), rules:x.rules.filter(r => r.group!==id) }));
  const rKeys = Object.keys(SEED.REASONS), pKeys = Object.keys(SEED.PAYERS);
  const isNewG = !!ed && ed.k==="group" && !data.groups.some(g => g.id===ed.d.id), isNewR = !!ed && ed.k==="rule" && !data.rules.some(r => r.id===ed.d.id);
  const ttl = !ed ? "" : ed.k==="group" ? (isNewG ? "Add queue group" : "Edit queue group") : (isNewR ? "Add routing rule" : "Edit routing rule");
  const editPanel = !ed ? null : (
    <div style={{margin:"28px 0",border:"1px solid #BAD7FF",borderRadius:8,background:"#fff",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 20px",background:"#F0F7FF",borderBottom:"1px solid #DCE9FA"}}>
        <svg width="12" height="12" viewBox="0 0 12 12" style={{color:"#1677FF",transform:"rotate(180deg)"}}><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>
        <div style={{font:"600 15px/20px "+F,color:"#0f172a",flex:1}}>{ttl}</div>
        <span style={{font:"400 12px/16px "+F,color:"#6A717D"}}>Other settings are hidden while you edit</span>
      </div>
      <div style={{padding:"4px 20px 20px"}}>
        {ed.k==="group" ? <>
          {lab("Queue group name")}<input autoFocus value={ed.d.name} onChange={e=>setEd({ ...ed, d:{ ...ed.d, name:e.target.value } })} placeholder="e.g. Group 4" style={{width:"100%",maxWidth:520,height:36,border:"1px solid #d9d9d9",borderRadius:4,padding:"0 12px",font:"400 13px/18px "+F,boxSizing:"border-box"}} />
          {lab("Assigned to (owners)")}<div style={{display:"flex",flexWrap:"wrap",gap:8}}>{users.map(u => chip(ed.d.owners.includes(u), u, ()=>setEd({ ...ed, d:{ ...ed.d, owners:tog(ed.d.owners,u) } }), u))}</div>
          {lab("Payers (none selected = all payers)")}<div style={{display:"flex",flexWrap:"wrap",gap:8}}>{pKeys.map(k => chip((ed.d.payers||[]).includes(k), SEED.PAYERS[k].name, ()=>setEd({ ...ed, d:{ ...ed.d, payers:tog(ed.d.payers||[],k) } }), k))}</div>
        </> : <>
          {lab("Queue group")}<select value={ed.d.group} onChange={e=>setEd({ ...ed, d:{ ...ed.d, group:e.target.value, ng:e.target.value==="__new" ? (ed.d.ng||{ name:"", owners:[] }) : ed.d.ng } })} style={{width:"100%",maxWidth:520,height:36,border:"1px solid #d9d9d9",borderRadius:4,padding:"0 10px",font:"400 13px/18px "+F,background:"#fff"}}>{data.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}<option value="__new">+ Add new queue group…</option></select>
          {ed.d.group==="__new" && ed.d.ng && <div style={{marginTop:12,padding:"12px 16px",border:"1px dashed #BAD7FF",borderRadius:6,background:"#F8FBFF"}}>
            <div style={{font:"500 12px/16px "+F,color:"#3A424A",marginBottom:8}}>New queue group name</div>
            <input autoFocus value={ed.d.ng.name} onChange={e=>setEd({ ...ed, d:{ ...ed.d, ng:{ ...ed.d.ng, name:e.target.value } } })} placeholder="e.g. Records Follow-up" style={{width:"100%",maxWidth:520,height:36,border:"1px solid #d9d9d9",borderRadius:4,padding:"0 12px",font:"400 13px/18px "+F,boxSizing:"border-box"}} />
            {lab("Assigned to (owners)")}<div style={{display:"flex",flexWrap:"wrap",gap:8}}>{users.map(u => chip(ed.d.ng.owners.includes(u), u, ()=>setEd({ ...ed, d:{ ...ed.d, ng:{ ...ed.d.ng, owners:tog(ed.d.ng.owners,u) } } }), u))}</div>
          </div>}
          {lab("Errors (none selected = all errors)")}<div style={{display:"flex",flexWrap:"wrap",gap:8}}>{rKeys.map(k => chip(ed.d.errors.includes(k), SEED.REASONS[k].label, ()=>setEd({ ...ed, d:{ ...ed.d, errors:tog(ed.d.errors,k) } }), k))}</div>
          {lab("Payers (none selected = all payers)")}<div style={{display:"flex",flexWrap:"wrap",gap:8}}>{pKeys.map(k => chip(ed.d.payers.includes(k), SEED.PAYERS[k].name, ()=>setEd({ ...ed, d:{ ...ed.d, payers:tog(ed.d.payers,k) } }), k))}</div>
        </>}
      </div>
      <div style={{padding:"12px 20px",borderTop:"1px solid #e5e7eb",display:"flex",justifyContent:"flex-end",gap:10,background:"#fff"}}>
        <button type="button" onClick={()=>setEd(null)} style={{height:32,border:"1px solid #d9d9d9",borderRadius:4,background:"#fff",padding:"0 18px",cursor:"pointer",font:"500 13px/18px "+F,color:"#1f2937"}}>Cancel</button>
        <button type="button" onClick={saveEd} style={{height:32,border:"none",borderRadius:4,background:"#1677FF",color:"#fff",padding:"0 20px",cursor:"pointer",font:"500 13px/18px "+F}}>Save</button>
      </div>
    </div>);
  return (
    <div style={{position:"fixed",inset:0,zIndex:400,display:"flex",justifyContent:"flex-end",background:"rgba(15,23,42,0.3)"}} onClick={()=>setOpen(false)}>
      <div onClick={e=>e.stopPropagation()} style={{position:"relative",width:1240,maxWidth:"100%",height:"100%",background:"#fff",display:"flex",flexDirection:"column",boxShadow:"-12px 0 32px rgba(15,23,42,0.18)",fontFamily:F}}>
        <div style={{padding:"22px 36px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid #e5e7eb"}}>
          <div style={{flex:1}}><div style={{font:"500 18px/24px "+F,color:"#0f172a"}}>Collections Queue Settings</div><div style={{font:"400 13px/18px "+F,color:"#6A717D",marginTop:2}}>Route errors and payers to a queue group, and choose who works each group.</div></div>
          <button type="button" onClick={()=>setOpen(false)} style={{border:"none",background:"transparent",cursor:"pointer",fontSize:22,color:"#6A717D",lineHeight:1}}>×</button>
        </div>
        <div style={{overflowY:"auto",padding:"0 36px 32px",flex:1}}>
          {ed ? editPanel : <>
          {sec("Queue Group Management","Create queue groups, add the owners (assigned to) who work them, and pick the payers they cover.", addBtn("Add New Queue Group", ()=>setEd({ k:"group", d:{ id:uid(), name:"", owners:[], payers:[] } })),
            <><div>{head(GC, ["", "Queue Groups", "Assigned to", "Payers", "Action"])}</div>
            {data.groups.map(g => row(GC, [docI, <b style={{fontWeight:500}}>{g.name}</b>, tags(g.owners,"Unassigned"), tags((g.payers||[]).map(k => (SEED.PAYERS[k]||{}).name||k),"All payers"), acts(()=>setEd({ k:"group", d:{ ...g, owners:[...g.owners], payers:[...(g.payers||[])] } }), ()=>delGroup(g.id))], g.id))}
            {!data.groups.length && <div style={{padding:"28px",textAlign:"center",font:"400 13px/18px "+F,color:"#94a3b8"}}>No queue groups yet.</div>}</>)}
          {sec("Error & Payer Routing","Send claims with these errors, from these payers, to a queue group.", addBtn("Add New Routing Rule", ()=>setEd({ k:"rule", d:{ id:uid(), group:(data.groups[0]||{}).id||"", errors:[], payers:[] } })),
            <><div>{head(RC, ["", "Queue Group", "Errors", "Payers", "Action"])}</div>
            {data.rules.map(r => row(RC, [docI, <b style={{fontWeight:500}}>{gName(r.group)}</b>, tags(r.errors.map(k => (SEED.REASONS[k]||{}).label||k),"All errors"), tags(r.payers.map(k => (SEED.PAYERS[k]||{}).name||k),"All payers"), acts(()=>setEd({ k:"rule", d:{ ...r, errors:[...r.errors], payers:[...r.payers] } }), ()=>setData(x => ({ ...x, rules:x.rules.filter(q => q.id!==r.id) })))], r.id))}
            {!data.rules.length && <div style={{padding:"28px",textAlign:"center",font:"400 13px/18px "+F,color:"#94a3b8"}}>No routing rules yet.</div>}</>)}
          </>}
        </div>
      </div>
    </div>
  );
}
window.CollSettings = CollSettings;
const CHKW = 44;
function Chk({ on, part, onClick, label }) { return <span role="checkbox" aria-checked={part?"mixed":!!on} aria-label={label} onClick={(e)=>{ e.stopPropagation(); onClick(); }} style={{width:16,height:16,borderRadius:3,border:"1px solid "+(on||part?"#1677FF":"#c5ccd6"),background:on||part?"#1677FF":"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>{on && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.2 4.2 7.4 8 2.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}{!on && part && <span style={{width:8,height:2,background:"#fff",borderRadius:1}}></span>}</span>; }
function MiniCal({ value, onPick }) {
  const F = "Roboto, sans-serif", [m, setM] = useS(() => value ? new Date(+value.slice(0,4), +value.slice(5,7)-1, 1) : new Date(2025,4,1));
  const y = m.getFullYear(), mo = m.getMonth(), first = new Date(y,mo,1).getDay(), dim = new Date(y,mo+1,0).getDate(), cells = [];
  for (let i=0;i<first;i++) cells.push(null); for (let d=1; d<=dim; d++) cells.push(d);
  const iso2 = (d) => y+"-"+String(mo+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");
  const nb = { width:26, height:26, border:"none", borderRadius:4, background:"transparent", cursor:"pointer", color:"#3A424A", fontSize:16, lineHeight:1 };
  return (<div style={{padding:"12px 12px 8px",fontFamily:F}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}><button type="button" style={nb} onClick={()=>setM(new Date(y,mo-1,1))}>‹</button><span style={{font:"600 13px/18px "+F,color:"#0f172a"}}>{["January","February","March","April","May","June","July","August","September","October","November","December"][mo]} {y}</span><button type="button" style={nb} onClick={()=>setM(new Date(y,mo+1,1))}>›</button></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,textAlign:"center"}}>
      {["S","M","T","W","T","F","S"].map((d,i) => <div key={i} style={{font:"500 11px/24px "+F,color:"#8A94A6"}}>{d}</div>)}
      {cells.map((d,i) => d==null ? <div key={i}></div> : <button key={i} type="button" onClick={()=>onPick(iso2(d))} style={{height:30,border:"none",borderRadius:4,cursor:"pointer",background:value===iso2(d)?"#1677FF":"transparent",color:value===iso2(d)?"#fff":"#0f172a",font:"400 12px/16px "+F}}>{d}</button>)}
    </div></div>);
}
const ehrDocsOf = (c) => { const h = pHash(c.id); if (h%3===0) return []; return ["Plan of care","Signed orders","Visit notes"].slice(0, 2+h%2); };
const SOLS = [
  { k:"ehr", title:"Attach EHR documents and resubmit", desc:"Payer asked for clinical records. They were found in the EHR and can be attached automatically.", ehr:true, label:"Resubmitted with EHR documents" },
  { k:"upload", title:"Upload missing documents, then resubmit", desc:"Payer needs supporting records that are not in the EHR. Upload them in the claim, then resubmit.", label:"Documents requested" },
  { k:"fix", title:"Correct claim data and resubmit", desc:"Rejected at the clearinghouse. Billing configuration from the first pass is reused.", label:"Corrected and resubmitted" },
  { k:"appeal", title:"File underpayment appeal", desc:"Payer paid less than the contracted rate. Neos prepares the appeal with the remit detail.", label:"Underpayment appeal filed" },
  { k:"payer", title:"Follow up with payer", desc:"Claim is pending with no new response. Check the portal or call the payer.", label:"Payer follow-up logged" },
  { k:"close", title:"Close out", desc:"Paid or complete. Nothing more to work.", label:"Closed" },
];
const solOf = (c) => { const k = c.category==="Denied" || c.category==="ADR" ? (ehrDocsOf(c).length ? "ehr" : "upload") : c.category==="Rejected" ? "fix" : c.category==="Underpaid" ? "appeal" : c.category==="Pending Payment" ? "payer" : "close"; return SOLS.find(s => s.k===k); };
function BulkSlider({ items, onClose, onExec }) {
  const F = "Roboto, sans-serif";
  const [sel, setSel] = useS(() => Object.fromEntries(items.map(i => [i.c.id, true]))), [cons, setCons] = useS({}), [done, setDone] = useS({});
  const gs = SOLS.map(s => ({ s, it: items.filter(i => solOf(i.c).k===s.k) })).filter(g => g.it.length);
  const runnable = gs.filter(g => !done[g.s.k] && true).flatMap(g => g.it.filter(i => sel[i.c.id]).map(i => ({ ...i, s:g.s })));
  const needConsent = 0;
  const exec = () => { const ks = {}; runnable.forEach(x => { ks[x.s.k] = true; }); setDone(d => ({ ...d, ...ks })); onExec(runnable.map(x => ({ rid:x.rid, label:x.s.label }))); };
  const spk = <svg width="16" height="16" viewBox="0 0 28 28" style={{flexShrink:0}}><defs><linearGradient id="bkg" x1="4" y1="24" x2="24" y2="4" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#4285F4"/><stop offset=".5" stopColor="#9B72CB"/><stop offset="1" stopColor="#D96570"/></linearGradient></defs><path d="M14 1c.9 6.9 6.1 12.1 13 13-6.9.9-12.1 6.1-13 13-.9-6.9-6.1-12.1-13-13C7.9 13.1 13.1 7.9 14 1z" fill="url(#bkg)"/></svg>;
  const anyDone = Object.keys(done).length>0;
  return (
    <div style={{position:"fixed",inset:0,zIndex:210,display:"flex",justifyContent:"flex-end",background:"rgba(15,23,42,0.3)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:1000,maxWidth:"100%",height:"100%",background:"#EEF1F5",padding:16,boxSizing:"border-box",display:"flex",flexDirection:"column",boxShadow:"-12px 0 32px rgba(15,23,42,0.18)",fontFamily:F}}>
        <div style={{flex:1,minHeight:0,display:"flex",flexDirection:"column",background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"18px 28px",borderBottom:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:12}}>
            <div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:8,font:"600 16px/22px "+F,color:"#0f172a"}}>{spk}Do next step · {items.length} {items.length===1?"claim":"claims"}</div><div style={{font:"400 12px/18px "+F,color:"#6A717D",marginTop:2}}>Neos grouped these by the solution it recommends. Review each group, then execute.</div></div>
            <button type="button" title="Close" onClick={onClose} style={{width:32,height:32,border:"1px solid #e2e8f0",borderRadius:"50%",background:"#fff",cursor:"pointer",fontSize:20,lineHeight:"28px",color:"#3A424A",padding:0}}>×</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"20px 28px",display:"flex",flexDirection:"column",gap:16}}>
            {gs.map(({ s, it }) => { const all = it.every(i => sel[i.c.id]), some = it.some(i => sel[i.c.id]), dn = done[s.k]; return (
              <div key={s.k} style={{flexShrink:0,border:"1px solid "+(dn?"#B7EB8F":"#FFE0B2"),borderRadius:8,background:dn?"#F6FFED":"#FFFDF8",overflow:"hidden"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderBottom:"1px solid "+(dn?"#D9F0C2":"#FDEBD0")}}>
                  {!dn && <Chk on={all} part={some && !all} label="Select group" onClick={()=>setSel(m => { const n = { ...m }; it.forEach(i => { n[i.c.id] = !all; }); return n; })} />}
                  {spk}<span style={{font:"600 14px/20px "+F,color:"#0f172a"}}>{s.title}</span>
                  <span style={{marginLeft:"auto",padding:"0 8px",borderRadius:999,background:"#fff",border:"1px solid #e2e8f0",font:"500 11px/18px "+F,color:"#3A424A"}}>{it.length} {it.length===1?"claim":"claims"}</span>
                  {dn && <span style={{font:"600 12px/16px "+F,color:"#389E0D"}}>Done</span>}
                </div>
                <div style={{padding:"12px 16px 14px"}}>
                  <div style={{font:"400 13px/20px "+F,color:"#3A424A",marginBottom:10}}>{s.desc}</div>
                  {it.map(({ c }) => { const dc = s.ehr ? ehrDocsOf(c) : null; return (
                    <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 12px",border:"1px solid #e5e7eb",borderRadius:6,background:"#fff",marginBottom:6}}>
                      {!dn && <Chk on={!!sel[c.id]} label="Select claim" onClick={()=>setSel(m => ({ ...m, [c.id]:!m[c.id] }))} />}
                      <span style={{font:"600 13px/18px "+F,color:"#1677FF",width:96,flexShrink:0}}>{c.claimNumber}</span>
                      <span style={{font:"500 13px/18px "+F,color:"#0f172a",width:150,flexShrink:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.patientName}</span>
                      <span style={{font:"400 12px/16px "+F,color:"#3A424A",flex:1,minWidth:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.payor} · {c.reasonLabel} · {c.payerCode}{dc ? " · "+dc.join(", ") : ""}</span>
                      <span style={{font:"500 13px/18px "+F,color:"#0f172a",flexShrink:0}}>{usd(c.billed)}</span>
                    </div>); })}
                  
                </div>
              </div>); })}
          </div>
          <div style={{borderTop:"1px solid #e5e7eb",padding:"12px 28px",display:"flex",alignItems:"center",gap:12}}>
            <span style={{flex:1,font:"400 12px/16px "+F,color:needConsent?"#B7791F":"#6A717D"}}>{needConsent ? "Consent is needed for "+needConsent+(needConsent===1?" group":" groups")+" before it can run." : anyDone ? "Executed groups are logged on their claims." : "Only checked claims are executed."}</span>
            <button type="button" onClick={onClose} style={{height:32,border:"1px solid #d9d9d9",borderRadius:4,background:"#fff",padding:"0 18px",cursor:"pointer",font:"500 13px/18px "+F,color:"#1f2937"}}>{anyDone ? "Close" : "Cancel"}</button>
            <button type="button" disabled={!runnable.length} onClick={exec} style={{height:32,border:"none",borderRadius:4,background:runnable.length?"#1677FF":"#C9D6E8",color:"#fff",padding:"0 20px",cursor:runnable.length?"pointer":"not-allowed",font:"500 13px/18px "+F}}>Execute {runnable.length} {runnable.length===1?"claim":"claims"}</button>
          </div>
        </div>
      </div>
    </div>);
}
function CollOverview({ rows, onOwner }) {
  const [openG, setOpenG] = useS({ g1:true });
  const Q = (() => { try { const j = JSON.parse(localStorage.getItem("__collQueues3")); if (j && j.groups && j.rules) return j; } catch(e) {} return seedQ(); })();
  const grpOf = (r) => { const ru = Q.rules.find(x => (x.errors||[]).includes(r.reasonKey)); return ru ? ru.group : "none"; };
  const gs = [...Q.groups, { id:"none", name:"Unrouted", owners:[] }];
  const k = (v) => v>=1e6 ? "$"+(v/1e6).toFixed(2)+"M" : v>=1e4 ? "$"+Math.round(v/1e3)+"K" : usd(v);
  const p2 = (n) => String(n).padStart(2,"0");
  const st = (a) => { const op = a.filter(isOpen), sum = (l,f) => l.reduce((x,r)=>x+f(r),0); return { total:a.length, open:op.length, due:op.filter(r=>r.fuOff===0).length, over:op.filter(r=>r.fuOff<0).length, esc:op.filter(r=>r.status==="Escalated").length, bal:sum(op,r=>r.balance), dueAmt:sum(op.filter(r=>r.fuOff===0),r=>r.balance), overAmt:sum(op.filter(r=>r.fuOff<0),r=>r.balance), billed:sum(a,r=>r.billed), rec:sum(a,r=>r.paid||0) }; };
  const all = st(rows), op = rows.filter(isOpen), un = op.filter(r => !r.owner || r.owner==="Unassigned").length, rate = all.billed ? Math.round(all.rec/all.billed*100) : 0, avg = op.length ? Math.round(op.reduce((x,r)=>x+r.daysOpen,0)/op.length) : 0;
  const data = gs.map(g => { const a = rows.filter(r => grpOf(r)===g.id), names = Array.from(new Set([...(g.owners||[]), ...a.map(r => r.owner || "Unassigned")])); return { g, s:st(a), people:names.map(n => ({ n, s:st(a.filter(r => (r.owner||"Unassigned")===n)) })).filter(x => x.s.total>0 || (g.owners||[]).includes(x.n)) }; }).filter(d => d.s.total>0 || d.g.id!=="none");
  const maxOpen = Math.max(1, ...data.flatMap(d => d.people.map(p => p.s.open)));
  const I = (d, col) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
  const kpi = (icon, col, bg, label, v, sub) => <div style={{flex:"1 1 190px",minWidth:0,display:"flex",alignItems:"center",gap:14,border:"1px solid #e2e8f0",borderRadius:8,padding:"16px 18px",background:"#fff",boxShadow:"0 1px 2px rgba(15,23,42,0.04)"}}><span style={{width:44,height:44,borderRadius:10,background:bg,display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{I(icon,col)}</span><div style={{minWidth:0}}><div style={{font:"400 12px/16px Roboto",color:"#6A717D"}}>{label}</div><div style={{font:"500 24px/30px Roboto",color:"#1C2D42"}}>{v}</div><div style={{font:"400 11px/16px Roboto",color:"#8A94A6",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sub}</div></div></div>;
  const panel = (title, sub, body, style) => <div style={{flex:1,minHeight:0,boxSizing:"border-box",display:"flex",flexDirection:"column",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",padding:"16px 18px",boxShadow:"0 1px 2px rgba(15,23,42,0.04)",...style}}><div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:12}}><span style={{font:"600 14px/20px Roboto",color:"#1C2D42"}}>{title}</span>{sub && <span style={{font:"400 11px/16px Roboto",color:"#8A94A6"}}>{sub}</span>}</div>{body}</div>;
  const bar = (label, val, max, col, right, sub) => <div style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",gap:8,font:"400 12px/16px Roboto",color:"#3A424A",marginBottom:4}}><span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{label}{sub && <span style={{color:"#8A94A6"}}> · {sub}</span>}</span><b style={{fontWeight:500,color:"#1C2D42",whiteSpace:"nowrap"}}>{right}</b></div><div style={{height:6,borderRadius:3,background:"#EEF1F5"}}><div style={{height:6,borderRadius:3,width:Math.max(2, max ? val/max*100 : 0)+"%",background:col}}></div></div></div>;
  const num = (l, v, sub, col) => <div style={{display:"flex",flexDirection:"column",gap:2,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:6,font:"400 12px/16px Roboto",color:"#6A717D"}}><span style={{width:8,height:8,borderRadius:2,background:col,flexShrink:0}}></span>{l}</div><div style={{font:"500 20px/26px Roboto",color:"#1C2D42"}}>{v}</div><div style={{font:"400 11px/14px Roboto",color:"#8A94A6"}}>{sub}</div></div>;
  const stat = (l, v, col) => <div style={{textAlign:"right",minWidth:54}}><div style={{font:"500 14px/18px Roboto",color:v ? col : "#c0c7d1"}}>{p2(v)}</div><div style={{font:"400 10px/12px Roboto",color:"#8A94A6"}}>{l}</div></div>;
  const byCat = QDEF.map(([key,l,col]) => { const a = op.filter(r => r.category===key); return [l, a.reduce((x,r)=>x+r.balance,0), col, a.length]; }).filter(x => x[3]>0).sort((x,y) => y[1]-x[1]);
  const aging = [["0–30 days",0,30,"#5BA67A"],["31–60 days",31,60,"#D9A441"],["61–90 days",61,90,"#E07B5A"],["90+ days",91,9999,"#CF1322"]].map(([l,lo,hi,col]) => { const a = op.filter(r => r.ageD>=lo && r.ageD<=hi); return [l, a.reduce((x,r)=>x+r.balance,0), col, a.length]; });
  const payers = Object.entries(op.reduce((m,r) => { m[r.payor] = (m[r.payor]||0)+r.balance; return m; }, {})).sort((x,y) => y[1]-x[1]).slice(0,5);
  const attn = op.filter(r => r.fuOff<0 || r.status==="Escalated").sort((x,y) => y.balance-x.balance).slice(0,4);
  return (
    <div style={{padding:"24px 32px 40px",background:"#F7F9FC",minHeight:"100%"}}>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:20}}>
        {kpi(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,"#1677FF","#EAF2FF","Open tickets",p2(all.open),"of "+all.total+" total · avg "+avg+" days open")}
        {kpi(<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>,"#D48806","#FFF6E0","Due today",p2(all.due),k(all.dueAmt)+" to work today")}
        {kpi(<><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/></>,"#CF1322","#FFECEA","Overdue",p2(all.over),k(all.overAmt)+" past follow-up date")}
        {kpi(<><path d="M12 2v13M12 19v3M5 9l7-7 7 7"/></>,"#7466BD","#F0EDFB","Escalated",p2(all.esc),un+" open unassigned")}
        {kpi(<><path d="M12 2v20M17 6.5c-1-1.5-3-2-5-2-3 0-5 1.5-5 3.5s2 3 5 3.5 5 1.5 5 3.5-2 3.5-5 3.5c-2 0-4.200-.7-5.200-2.200"/></>,"#2B7A8C","#E5F3F6","Open balance",k(all.bal),k(all.billed)+" billed in worklist")}
        {kpi(<><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></>,"#389E0D","#EAF7E0","Recovered",k(all.rec),rate+"% of billed recovered")}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"stretch"}}>
        <div style={{flex:"1 1 620px",minWidth:0,height:380,display:"flex",flexDirection:"column"}}>
          {panel("Queue groups","Expand a group to see who is carrying it",<div style={{margin:"0 -18px -16px",borderTop:"1px solid #eef0f3",flex:1,minHeight:0,overflowY:"auto"}}>
            {data.map(({ g, s, people }) => { const on = !!openG[g.id]; return (
              <div key={g.id} style={{borderBottom:"1px solid #eef0f3"}}>
                <div onClick={()=>setOpenG(o => ({ ...o, [g.id]:!o[g.id] }))} style={{display:"flex",alignItems:"center",gap:12,padding:"20px 18px",cursor:"pointer",background:on?"#F5FAFF":"#fff"}}>
                  <svg width="14" height="14" viewBox="0 0 14 14" style={{flexShrink:0,transform:on?"rotate(90deg)":"none",transition:"transform .18s"}}><path d="M5 2.5L9.500 7 5 11.500" fill="none" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div style={{flex:1,minWidth:0}}><div style={{font:"600 14px/20px Roboto",color:"#1C2D42"}}>{g.name}</div><div style={{font:"400 11px/16px Roboto",color:"#6A717D"}}>{people.length} {people.length===1?"collector":"collectors"} · {s.total} tickets</div></div>
                  {stat("Open",s.open,"#1C2D42")}{stat("Due",s.due,"#D48806")}{stat("Overdue",s.over,"#CF1322")}
                  <div style={{textAlign:"right",minWidth:78}}><div style={{font:"500 14px/18px Roboto",color:"#2B7A8C"}}>{k(s.bal)}</div><div style={{font:"400 10px/12px Roboto",color:"#8A94A6"}}>Open balance</div></div>
                </div>
                {on && <div style={{padding:"8px 18px 20px 44px",background:"#F5FAFF"}}>
                  <div style={{display:"grid",gridTemplateColumns:"minmax(130px,1.3fr) 60px 60px 60px minmax(70px,1fr) 80px",gap:12,padding:"6px 0",font:"500 10px/14px Roboto",color:"#8A94A6",textTransform:"uppercase",letterSpacing:".05em"}}><span>Collector</span><span style={{textAlign:"right"}}>Open</span><span style={{textAlign:"right"}}>Due</span><span style={{textAlign:"right"}}>Overdue</span><span>Load</span><span style={{textAlign:"right"}}>Balance</span></div>
                  {people.map(({ n, s:ps }) => <div key={n} onClick={()=>onOwner(n)} title="Open worklist for this collector" onMouseEnter={e=>e.currentTarget.style.background="#fff"} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{display:"grid",gridTemplateColumns:"minmax(130px,1.3fr) 60px 60px 60px minmax(70px,1fr) 80px",gap:12,alignItems:"center",padding:"12px 6px",margin:"0 -6px",borderRadius:6,cursor:"pointer",font:"400 13px/18px Roboto",color:"#1f2937"}}>
                    <span style={{font:"500 13px/18px Roboto",color:n==="Unassigned"?"#6A717D":"#1677FF"}}>{n}</span>
                    <span style={{textAlign:"right"}}>{ps.open}</span><span style={{textAlign:"right",color:ps.due?"#D48806":"#c0c7d1"}}>{ps.due}</span><span style={{textAlign:"right",color:ps.over?"#CF1322":"#c0c7d1"}}>{ps.over}</span>
                    <div style={{height:6,borderRadius:3,background:"#E3EAF3"}}><div style={{height:6,borderRadius:3,width:Math.max(3,ps.open/maxOpen*100)+"%",background:"#1677FF"}}></div></div>
                    <span style={{textAlign:"right",font:"500 13px/18px Roboto"}}>{k(ps.bal)}</span>
                  </div>)}
                </div>}
              </div>); })}
          </div>)}
        </div>
        <div style={{flex:"0 1 380px",minWidth:300,height:380,display:"flex",flexDirection:"column"}}>
          {panel("Needs attention","overdue or escalated, largest first",attn.length ? attn.map(r => <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderTop:"1px solid #f1f3f6"}}><span style={{width:8,height:8,borderRadius:"50%",background:r.status==="Escalated"?"#7466BD":"#CF1322",flexShrink:0}}></span><div style={{flex:1,minWidth:0}}><div style={{font:"500 13px/18px Roboto",color:"#1f2937",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.patientName}</div><div style={{font:"400 11px/16px Roboto",color:"#6A717D"}}>{r.status==="Escalated" ? "Escalated" : "Follow-up overdue"} · {r.owner}</div></div><b style={{font:"500 13px/18px Roboto",color:"#1C2D42"}}>{k(r.balance)}</b></div>) : <div style={{font:"400 12px/18px Roboto",color:"#8A94A6"}}>Nothing overdue or escalated.</div>)}
        </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:20,alignItems:"stretch"}}>
          {panel("Open balance by claim status",k(all.bal)+" open",<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"14px 16px"}}>{byCat.map(([l,v,col,n]) => num(l, k(v), n+" claims", col))}</div>)}
          {panel("A/R aging","open balance by days",<div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:"14px 16px"}}>{aging.map(([l,v,col,n]) => num(l, k(v), n+" claims", col))}</div>)}
          {panel("Top payers by open balance",null,<div>{payers.map(([n,v],i) => <div key={n} style={{display:"flex",justifyContent:"space-between",gap:10,padding:"8px 0",borderTop:i?"1px solid #f1f3f6":"none",font:"400 13px/18px Roboto",color:"#3A424A"}}><span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{n}</span><b style={{fontWeight:500,color:"#1C2D42"}}>{k(v)}</b></div>)}</div>)}
        </div>
      </div>
    </div>
  );
}
function CollectionsSection() {
  const [gs, setGs] = useS(window.__collGrid||"combined"), [focus, setFocus] = useS(null), [vmOpen, setVmOpen] = useS(false), vref = React.useRef(null), [cv, setCv] = useS(window.__collView||"both"), [mv, setMv] = useS(null), [bby, setBby] = useS(window.__collView==="claim" ? "claim" : "work"), [model, setModelS] = useS(window.__collModel||"claim"), [ov, setOv] = useS({}), [savedUpd, setSavedUpd] = useS({}), [openRow, setOpenRow] = useS(null), [gmode, setGmode] = useS("status"), [gOpen, setGOpen] = useS(false), [seg, setSeg] = useS(null), [view, setView] = useS("list"), [off, setOff] = useS({}), [qopen, setQopen] = useS({}), [tab, setTab] = useS(window.__collTab || "all"), [sel, setSel] = useS({}), [chk, setChk] = useS({}), [bulk, setBulk] = useS(null), [bpop, setBpop] = useS(null), [bdraft, setBdraft] = useS(""), [bmsg, setBmsg] = useS(""), [menu, setMenu] = useS(false), [asg, setAsg] = useS("All"), [q, setQ] = useS(""), [ff, setFF] = useS([]), [card, setCard] = useS("all"), [sort, setSort] = useS({ k:"daysOpen", dir:"desc" });
  const [pers, setPers] = useS(window.__persona || { role:"lead" }), isCol = pers.role==="collector", [lsub, setLsub] = useS(0), subN = isCol ? 1 : lsub;
  React.useEffect(() => { const h = (e) => { setPers(e.detail); setLsub(0); setAsg("All"); setFF([]); setOpenRow(null); setSeg(null); setCard("all"); }; document.addEventListener("personaChange", h); return () => document.removeEventListener("personaChange", h); }, []);
  const Bar = window.ARVFilterBarChips, Arrows = window.ARVSortArrows, Body = window.ScrollBody || (({children}) => <div>{children}</div>);
  React.useEffect(() => { const h = (e) => { setModelS(e.detail); setOpenRow(null); setSeg(null); setCard("all"); }; document.addEventListener("collModelChange", h); return () => document.removeEventListener("collModelChange", h); }, []);
  React.useEffect(() => { const h = (e) => { setTab(e.detail); setCard("all"); setSeg(null); setOpenRow(null); }; document.addEventListener("collTabChange", h); if (window.__collTab) { setTab(window.__collTab); } return () => document.removeEventListener("collTabChange", h); }, []);
  React.useEffect(() => { const h = (e) => setGs(e.detail); document.addEventListener("collGridChange", h); return () => document.removeEventListener("collGridChange", h); }, []);
  React.useEffect(() => { const h = (e) => setCv(e.detail); document.addEventListener("collViewChange", h); return () => document.removeEventListener("collViewChange", h); }, []);
  React.useEffect(() => { if (cv==="claim" && gmode==="work") { setGmode("status"); setSeg(null); setCard("all"); } if (cv==="claim") setBby("claim"); }, [cv]);
  React.useEffect(() => { if (!vmOpen) return; const h = (e) => { if (vref.current && !vref.current.contains(e.target)) setVmOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [vmOpen]);
  const srcRows = React.useMemo(() => (model==="patient" ? PROWS : rows).map(r => ov[r.id] ? { ...r, ...ov[r.id] } : r), [model, ov]);
  const ASG = ["All", ...SEED.USERS.filter(u=>u.role!=="branch").map(u=>u.name+(u.role==="lead"?" (Team Lead)":" (Collector)")), "Unassigned"];
  const asgName = asg.replace(/ \((Team Lead|Collector)\)$/,"");
  const base0 = srcRows.filter(r => (isCol ? r.owner===pers.name : (asg==="All" || r.owner===asgName)) && (!q || ((r.claimIds||r.claimNumber)+r.colId+r.patientId+(r.patientName||"")+(r.mrn||"")+r.payor+r.reasonLabel).toLowerCase().includes(q.toLowerCase())) && (!ff.length || ff.every(x => x.values.includes(r[x.field]))));
  const base = base0.filter(r => !off[r.category+"|"+r.reasonLabel]);
  const groups = QDEF.map(([k]) => { const m = {}; base0.filter(r=>r.category===k).forEach(r => { m[r.reasonLabel]=(m[r.reasonLabel]||0)+1; }); const kids = Object.keys(m).sort((x,y)=>m[y]-m[x]).map(n => ({ key:k+"|"+n, label:n, n:m[n] })); return { k, label:QLAB(k), kids, n:kids.reduce((a,b)=>a+b.n,0) }; }).filter(g => g.n);
  const shown = base.filter(r => (card==="all" || ((QF[card]||(()=>true))(r) && (!sel[card] || sel[card].includes(r.reasonLabel)))) && (TABF[tab]||(()=>true))(r) && (gmode==="status"||!seg ? true : GROUPS[gmode].find(g=>g[0]===seg)[2](r))).sort((a,b) => { const x=a[sort.k], y=b[sort.k]; return (typeof x==="number" ? x-y : String(x).localeCompare(String(y))) * (sort.dir==="asc"?1:-1); });
  const tb = base.filter(TABF[tab]||(()=>true));
  const cards = [["all","All Accounts",tb.length,"#1C2D42"], ...QDEF.map(([k,l,col,cv]) => [k,l,tb.filter(QF[k]).length,col,cv])];
  const op = base.filter(isOpen);
  const S = { due:op.filter(r=>r.fuOff===0).length, over:op.filter(r=>r.fuOff<0).length, esc:op.filter(r=>r.status==="Escalated").length, near:op.filter(r=>r.deadlineDays<=14).length, scope: asg==="All" ? "Corporate (all regions)" : asgName };
  const openR = (r) => { setMv(null); if (model==="claim" && r.mrn && !r.claims) { const sb = srcRows.filter(c => c.patientId===r.patientId); if (sb.length>1) { setFocus(r.id); setOpenRow(patientRows(sb)[0]); return; } } setFocus(null); setOpenRow(r); };
  const colsB = (cv==="claim" ? COLS.filter(c => c.key!=="work") : COLS).map(c => (c.key==="claimNumber" && cv==="claim") ? { ...c, label: "Claim" } : c), colsV = model==="patient" ? colsB.flatMap(c => c.key==="claimNumber" ? [{ key:"patientName", label:"Patient", w:"minmax(210px,1.5fr)", sort:true }, { key:"colId", label:cv==="claim" ? "Claims" : "Collection ID", w:"minmax(140px,1fr)", sort:true }] : [c]) : colsB.flatMap(c => c.key==="claimNumber" ? [c, { key:"patientName", label:"Patient", w:"minmax(190px,1.3fr)", sort:true }] : [c]), GRIDV = CHKW+"px "+colsV.map(c => c.w).join(" ");
  const SEGC = { work:["#94A3B8","#D9A441","#E07B5A","#4F93C2","#D9902B","#7466BD","#D0645F","#55996A","#64748B"], risk:["#D9544F","#D99A2B","#2F7FB8","#8F85C4"], aging:["#346F93","#2BA063","#C58585","#8F85C4"], amount:["#8FB8D6","#4C9FD1","#346F93","#1C2D42"] };
  const sumB = (a) => a.reduce((x,r)=>x+r.balance,0);
  const segs = gmode==="status"
    ? cards.map(([k,l,n,col,cv]) => { const it = k==="all" ? tb : tb.filter(QF[k]); return { k, l, col, cv, n:it.length, amt:sumB(it), active:card===k, dim:card!=="all"&&card!==k, onClick:()=>{ setMenu(false); setCard(card===k&&k!=="all"?"all":k); } }; })
    : GROUPS[gmode].map(([k,l,f],i) => { const it = tb.filter(f); return { k, l, col:SEGC[gmode][i], n:it.length, amt:sumB(it), active:seg===k, dim:!!seg&&seg!==k, onClick:()=>setSeg(seg===k?null:k) }; });
  const onSort = (k) => setSort(s => ({ k, dir: s.k===k && s.dir==="asc" ? "desc" : "asc" }));
  const cell = (c) => ({ font:"500 12px/16px Roboto", color:"#333333", display:"flex", alignItems:"center", justifyContent:c&&c.center?"center":c&&c.right?"flex-end":"flex-start", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", minWidth:0 });
  const pm = model==="patient", dt = (v) => v==null||v==="" ? "—" : v;
  const RC = [
    ["colId", pm ? "Patient ID" : "Collection ID", 140, r => <a href="#" onClick={e=>{ e.preventDefault(); e.stopPropagation(); openR(r); }} style={{color:"#1f2937",textDecoration:"none",fontWeight:400}}>{pm ? r.patientId : idOf(r,cv)}</a>],
    ["patientName", "Patient Name", 170, r => <a href="#" onClick={e=>{ e.preventDefault(); e.stopPropagation(); openR(r); }} style={{color:"#1677FF",textDecoration:"none",fontWeight:500}}>{r.patientName}</a>],
    ["mrn", "MRN", 110, r => r.mrn || "—"],
    ["memId", "Member ID", 120, r => dt(r.memId)],
    ["claimNumber", pm ? "Claim IDs" : "Claim Number", 150, r => pm ? dt(r.claimIds) : r.claimNumber],
    ["payor", "Payer", 190, r => { const ps = r.claims ? Array.from(new Set(r.claims.map(c => c.payor))) : [r.payor]; return <span style={{display:"inline-flex",alignItems:"center",gap:6}}>{ps[0]}{ps.length>1 && <span style={{padding:"0 6px",border:"1px solid #d9d9d9",borderRadius:4,background:"#F5F7FA",font:"500 11px/16px Roboto",color:"#3A424A"}}>+{ps.length-1}</span>}</span>; }],
    ["branch", "Branch", 100, r => dt(r.branch)],
    ["region", "Region", 100, r => dt(r.region)],
    ["billed", "Billed", 100, r => usd(r.billed), 1],
    ["balance", "Balance", 100, r => usd(r.balance), 1],
    ["daysOpen", "Days Open", 100, r => r.daysOpen ? r.daysOpen+"d" : "—", 1],
    ...(cv==="claim" ? [] : [["work", "Collection Status", 160, r => <WorkTag w={r.work} />]]),
    ["reasonLabel", "Reason", 190, r => dt(r.reasonLabel)],
    ["payerCode", "Payer Code", 100, r => dt(r.payerCode)],
    ["dlType", "Deadline Type", 140, r => isOpen(r) ? dt(r.dlType) : "—"],
    ["dlDays", "Days Left", 100, r => isOpen(r)&&r.dlDays!=null ? <span style={{color:r.dlDays<=14?"#CF1322":"#333"}}>{r.dlDays} days</span> : "—"],
    ["followUp", "Follow-up Date", 130, r => { const o = isOpen(r); return !o||!r.followUp ? "—" : <span style={{color:r.fuOff<0?"#CF1322":"#333"}}>{r.fuOff===0 ? "Today" : r.fuOff<0 ? "Overdue · "+r.followUp : r.followUp}</span>; }],
    ["code", "Next Step", 150, r => isOpen(r) ? dt(r.code) : "—"],
    ["lastAction", "Last Action", 200, r => dt(r.lastAction)],
    ["lastSub", "Last Updated By", 160, r => dt(r.lastSub)],
    ["category", "Claim Status", 150, r => { const t = STAG[r.category]; return <span style={{padding:"1px 8px",border:"1px solid "+t[1],borderRadius:6,color:t[1],background:t[0],font:"500 11px/16px Roboto"}}>{QLAB(r.category)}</span>; }],
    ["owner", "Assigned To", 150, r => <span style={{color:r.owner==="Unassigned"?"#CF1322":"#333"}}>{r.owner}</span>],
  ];
  const nChk = shown.filter(r => chk[r.id]).length, allChk = shown.length>0 && nChk===shown.length;
  const hdrChk = <div onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",justifyContent:"center"}}><Chk on={allChk} part={nChk>0 && !allChk} label="Select all" onClick={()=>setChk(allChk ? {} : Object.fromEntries(shown.map(r=>[r.id,true])))} /></div>;
  const rowChk = (r) => <div onClick={e=>e.stopPropagation()} style={{alignSelf:"stretch",display:"flex",alignItems:"center",justifyContent:"center"}}><Chk on={!!chk[r.id]} label="Select row" onClick={()=>setChk(m=>({ ...m, [r.id]:!m[r.id] }))} /></div>;
  const stk = (k, bg) => k==="owner" ? { position:"sticky", right:0, zIndex:2, background:bg, alignSelf:"stretch" } : k==="category" ? { position:"sticky", right:150, zIndex:2, background:bg, alignSelf:"stretch", boxShadow:"-8px 0 8px -8px rgba(15,23,42,.14)" } : {};
  const RG = CHKW+"px "+RC.map(c => c[2]+"px").join(" "), RW = RC.reduce((x,c) => x+c[2], CHKW);
  const REG = (
    <div style={{overflowX:"auto"}}>
      <div style={{minWidth:RW,fontFamily:"Roboto"}}>
        <div style={{display:"grid",gridTemplateColumns:RG,alignItems:"center",minHeight:64,padding:"0 8px",background:"#F3F6FA",borderBottom:"1px solid #e2e8f0",marginBottom:8}}>
          {hdrChk}{RC.map(c => <div key={c[0]} onClick={()=>onSort(c[0])} style={{...stk(c[0],"#F3F6FA"),padding:"0 6px",font:"500 12px/16px Roboto",color:"#3A4A5E",display:"flex",alignItems:"center",justifyContent:c[4]?"flex-end":"flex-start",gap:2,cursor:"pointer",userSelect:"none",whiteSpace:"nowrap",overflow:"hidden"}}>{Arrows && <Arrows active={sort.k===c[0]} dir={sort.dir} />}<span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{c[1]}</span></div>)}
        </div>
        {shown.length===0 ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6}}>No accounts match the current filters.</div>
        : shown.map(r => <div key={r.id} onClick={()=>openR(r)} style={{cursor:"pointer",display:"grid",gridTemplateColumns:RG,alignItems:"center",minHeight:56,padding:"0 8px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:8,background:"#fff",boxShadow:"0 1px 2px rgba(15,23,42,0.04)"}}>
          {rowChk(r)}{RC.map((c,i) => <div key={c[0]} style={{...stk(c[0],"#fff"),padding:"0 6px",font:(i===1?"500 ":"400 ")+"13px/18px Roboto",color:i===1?"#1677FF":"#1f2937",display:"flex",alignItems:"center",justifyContent:c[4]?"flex-end":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0}}>{c[3](r)}</div>)}
        </div>)}
      </div>
    </div>
  );
  const SB = window.SectionBand, band = (!isCol && SB) ? <SB title="Collections Center" subTabs={[{label:"Queue Overview"},{label:"Worklist"}]} activeSub={subN} onSub={setLsub} showReview={false} /> : null;
  if (subN===0) return <div style={{background:"#fff",minHeight:"100%"}} data-screen-label="01 Collections Overview">{band}<CollOverview rows={rows.map(r => ov[r.id] ? { ...r, ...ov[r.id] } : r)} onOwner={(n) => { const m = ASG.find(a => a.indexOf(n)===0); setAsg(m || "All"); setLsub(1); }} /></div>;
  return (
    <div style={{background:"#fff",minHeight:"100%"}} data-screen-label="01 Collections">{band}
      {nChk>0 && view!=="card" && (() => { const selRows = shown.filter(r => chk[r.id]), patch = (p) => setOv(m => { const n = { ...m }; selRows.forEach(r => { n[r.id] = { ...(n[r.id]||{}), ...p }; }); return n; }), bi = { height:30, border:"1px solid #d9d9d9", borderRadius:4, background:"#fff", color:"#0f172a", padding:"0 8px", font:"400 12px/16px Roboto" }, pb = (k,l) => <button type="button" onClick={()=>{ setBpop(bpop===k?null:k); setBdraft(""); }} style={{...bi,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,padding:"0 12px",borderColor:bpop===k?"#1677FF":"#d9d9d9"}}>{l}<span style={{color:"#64748b",fontSize:13}}>▾</span></button>, pop = (k, body, ok, save) => bpop===k && <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,zIndex:60,background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,boxShadow:"0 12px 32px rgba(15,23,42,0.18)",width:k==="fu"?272:240}}>{body}<div style={{display:"flex",justifyContent:"flex-end",gap:8,padding:"10px 12px",borderTop:"1px solid #eef0f3"}}><button type="button" onClick={()=>{ setBpop(null); setBdraft(""); }} style={{height:30,border:"1px solid #d9d9d9",borderRadius:4,background:"#fff",padding:"0 14px",cursor:"pointer",font:"500 12px/16px Roboto",color:"#1f2937"}}>Cancel</button><button type="button" disabled={!ok} onClick={()=>{ save(); setBpop(null); setBdraft(""); }} style={{height:30,border:"none",borderRadius:4,background:ok?"#1677FF":"#C9D6E8",color:"#fff",padding:"0 16px",cursor:ok?"pointer":"not-allowed",font:"500 12px/16px Roboto"}}>Save</button></div></div>; return (
      <div style={{position:"relative",height:0,zIndex:40}}><div style={{position:"absolute",top:-20,left:0,right:0,display:"flex",justifyContent:"center",pointerEvents:"none"}}><div style={{pointerEvents:"auto",width:"fit-content",maxWidth:"calc(100% - 48px)",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",padding:"8px 18px",borderRadius:999,background:"#fff",border:"1px solid #e2e8f0",color:"#0f172a",boxShadow:"0 8px 24px rgba(15,23,42,0.16)"}}>
        <span style={{font:"500 13px/18px Roboto"}}><b style={{fontWeight:600,color:"#1677FF"}}>{nChk}</b> selected</span><span style={{width:1,height:20,background:"#e2e8f0"}}></span>
        <div style={{position:"relative"}}>{pb("fu","Follow-up date"+(bpop==="fu"&&bdraft ? " · "+bdraft.slice(5,7)+"/"+bdraft.slice(8,10) : ""))}{pop("fu", <MiniCal value={bdraft} onPick={setBdraft} />, !!bdraft, () => { const a = bdraft.split("-"); patch({ followUp:a[1]+"/"+a[2]+"/"+a[0].slice(2), fuOff:Math.round((new Date(+a[0],+a[1]-1,+a[2]) - new Date(2025,3,30))/86400000) }); setBmsg("Follow-up set to "+a[1]+"/"+a[2]+"/"+a[0].slice(2)+" on "+nChk+" selected"); })}</div>
        <div style={{position:"relative"}}>{pb("asg","Assign to")}{pop("asg", <div style={{padding:"6px 8px",maxHeight:240,overflowY:"auto"}}>{[...SEED.USERS.filter(u=>u.role!=="branch").map(u=>u.name),"Unassigned"].map(n => <label key={n} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 8px",borderRadius:4,cursor:"pointer",font:"400 13px/18px Roboto",color:"#0f172a",background:bdraft===n?"#F0F7FF":"transparent"}}><input type="radio" name="bulk-asg" checked={bdraft===n} onChange={()=>setBdraft(n)} />{n}</label>)}</div>, !!bdraft, () => { patch({ owner:bdraft }); setBmsg("Assigned "+nChk+" selected to "+bdraft); })}</div>
        <button type="button" onClick={()=>{ setBmsg(""); setBulk(selRows.flatMap(r => (r.claims||[r]).map(cl => ({ c:cl, rid:r.id })))); }} style={{height:30,border:"none",borderRadius:4,background:"#1677FF",color:"#fff",padding:"0 16px",cursor:"pointer",font:"500 12px/16px Roboto"}}>Do next step</button>
        {bmsg && <span style={{font:"400 12px/16px Roboto",color:"#389E0D"}}>{bmsg}</span>}
        <button type="button" onClick={()=>{ setChk({}); setBmsg(""); }} style={{marginLeft:"auto",border:"none",background:"transparent",color:"#1677FF",cursor:"pointer",font:"500 12px/16px Roboto"}}>Clear selection</button>
      </div></div></div>); })()}
      {Bar && <Bar trailing={<div style={{display:"inline-flex",border:"1px solid #93c5e8",borderRadius:6,overflow:"hidden",background:"#fff"}}><button type="button" title="List view" onClick={()=>setView("list")} style={{width:40,height:28,border:"none",background:view==="list"?"#1677FF":"#fff",color:view==="list"?"#fff":"#1677FF",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1" fill="currentColor"/><circle cx="3.5" cy="12" r="1" fill="currentColor"/><circle cx="3.5" cy="18" r="1" fill="currentColor"/></svg></button><button type="button" title="Card view" onClick={()=>setView("card")} style={{width:40,height:28,border:"none",background:view==="card"?"#1677FF":"#fff",color:view==="card"?"#fff":"#1677FF",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="7" height="16" rx="1.5"/><rect x="14" y="4" width="7" height="10" rx="1.5"/></svg></button></div>} hideDate assignee={isCol ? undefined : {label:"Assigned To",value:asg,options:ASG,onChange:setAsg}} dateLabel="Worklist Created Date : 04/01/25 – 04/30/25" searchValue={q} onSearch={setQ} filterFields={isCol ? FILTERS.filter(f=>f.key==="payor") : FILTERS} inlineFilters={isCol ? FILTERS.filter(f=>f.key==="payor") : FILTERS.filter(f=>f.key!=="owner"&&f.key!=="reasonLabel"&&f.key!=="category")} filterRows={srcRows} fieldFilters={ff} onFieldFilters={setFF} onClearFilters={ff.length?()=>setFF([]):null} />}
      <div style={{display:"flex",alignItems:"flex-start"}}>
      <div style={{flex:1,minWidth:0}}>
            <div style={{padding:"20px 24px 0",display:"flex",alignItems:"center",gap:32,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 380px",minWidth:0}}>
          <div style={{position:"relative",display:"flex",alignItems:"baseline",gap:6,flexWrap:"wrap"}} ref={vref}>
            <span style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Collections View —</span>
            <button type="button" onClick={()=>setVmOpen(v=>!v)} style={{background:"transparent",border:"none",cursor:"pointer",font:"500 15px/20px Roboto",color:"#2563eb",display:"inline-flex",alignItems:"center",gap:4,padding:0}}>
              {model==="patient" ? "View by Patient" : "View by Claim"}
              <span style={{fontSize:20,transition:"transform .15s",transform:vmOpen?"rotate(180deg)":"rotate(0)",display:"inline-block"}}>▾</span>
            </button>
            {vmOpen && <div style={{position:"absolute",top:"100%",left:170,marginTop:6,background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,boxShadow:"0 8px 24px rgba(15,23,42,0.12)",padding:6,minWidth:240,zIndex:20}}>
              <div style={{font:"600 10px/14px Roboto",letterSpacing:"0.06em",textTransform:"uppercase",color:"#94a3b8",padding:"6px 10px 4px"}}>One Collection ID per</div>
              {[["claim","View by Claim"],["patient","View by Patient"]].map(([k,l]) => { const sel = model===k; return <button key={k} type="button" onClick={()=>{ window.__setCollModel(k); setVmOpen(false); }} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:sel?"#eff6ff":"transparent",border:"none",borderRadius:6,padding:"7px 10px",cursor:"pointer",font:(sel?500:400)+" 12px/16px Roboto",color:sel?"#1d4ed8":"#333333",textAlign:"left"}}><span>{l}</span>{sel && <span style={{color:"#1d4ed8",fontSize:11}}>✓</span>}</button>; })}
            </div>}
          </div>
          <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}><b style={{fontWeight:500,color:"#3A424A"}}>{S.due}</b> {S.due===1?"task is":"tasks are"} due today · <b style={{fontWeight:500,color:"#3A424A"}}>{S.over}</b> overdue · <b style={{fontWeight:500,color:"#3A424A"}}>{S.near}</b> near filing</div>
                    <div style={{display:"inline-flex",gap:2,marginTop:14,padding:3,background:"#EEF1F5",borderRadius:8}}>
            {TABS.map(([k,l]) => { const on = tab===k; return (
              <button key={k} type="button" onClick={()=>setTab(k)} style={{display:"inline-flex",alignItems:"baseline",gap:6,padding:"6px 14px",border:"none",borderRadius:6,background:on?"#fff":"transparent",boxShadow:on?"0 1px 2px rgba(15,23,42,0.12)":"none",cursor:"pointer",font:(on?"600":"500")+" 13px/18px Roboto",color:on?"#0f172a":"#6A717D",transition:"background .12s"}}>
                {l}<span style={{font:"500 12px/18px Roboto",color:on?"#1677FF":"#8A94A6"}}>{base.filter(TABF[k]).length}</span>
              </button>); })}
          </div>
        </div>
        <div style={{flex:"0 1 auto",minWidth:0,display:"flex",justifyContent:"flex-end"}}>
          <div style={{display:"inline-flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",maxWidth:"100%"}}>
            <div style={{position:"relative",borderRadius:"8px 0 0 8px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",flexShrink:0,display:"flex"}}>
              <button type="button" onClick={()=>setGOpen(o=>!o)} style={{padding:"14px 16px",border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:8,font:"500 13px/18px Roboto",color:"#333333",letterSpacing:"0.01em",textAlign:"left"}}>
                <span style={{display:"flex",flexDirection:"column",alignItems:"flex-start"}}>{(() => { const P = {status:["Claim","Status"],work:["Collection","Status"],risk:["At","Risk"],aging:["A/R","Aging"],amount:["Claim","Amount"]}[gmode] || ["Claim","Status"]; return <><span>{P[0]}</span><span style={{display:"inline-flex",alignItems:"center"}}>{P[1]}<svg width="10" height="10" viewBox="0 0 10 10" style={{color:"#2563eb",marginLeft:6,flexShrink:0}}><path d="M1 3 L5 7 L9 3" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg></span></>; })()}</span>
              </button>
              {gOpen && <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:60,minWidth:180,background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,boxShadow:"0 12px 32px rgba(15,23,42,0.16)",padding:4}}>
                {GMODES.filter(g => cv!=="claim" || g[0]!=="work").map(([k,l]) => { const on = gmode===k; return <div key={k} onClick={()=>{ setGmode(k); setSeg(null); setCard("all"); setGOpen(false); }} onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"} onMouseLeave={e=>e.currentTarget.style.background=on?"#eef4fb":"transparent"} style={{padding:"8px 12px",borderRadius:4,cursor:"pointer",background:on?"#eef4fb":"transparent",font:(on?500:400)+" 13px/18px Roboto",color:on?"#1677FF":"#1f2937"}}>{l}</div>; })}
              </div>}
            </div>
            <div style={{display:"flex",alignItems:"flex-start",flexWrap:"wrap",minWidth:0}}>
              {segs.map((g,i) => { const last = i===segs.length-1; return (
                <div key={g.k} role="button" onClick={g.onClick}
                  style={{flex:"0 0 auto",padding:"10px 20px 12px",cursor:"pointer",transition:"background .12s",background:g.active&&g.k!=="all"?"#EEF4FB":"transparent",position:"relative",zIndex:menu===g.k?30:0,borderRadius:last?"0 8px 8px 0":0}}
                  onMouseEnter={(e)=>{ if(!g.active && !g.dim) e.currentTarget.style.background="#fafbfc"; }} onMouseLeave={(e)=>{ e.currentTarget.style.background=g.active&&g.k!=="all"?"#EEF4FB":"transparent"; }}>
                  {i>0 && <span style={{position:"absolute",left:0,top:10,bottom:10,width:1,background:"#e2e8f0"}}></span>}
                  <div style={{display:"inline-flex",flexDirection:"column",alignItems:"flex-start",width:"fit-content",maxWidth:"100%",opacity:(g.dim&&g.k!=="all")?0.35:1,transition:"opacity .12s"}}>
                    <div style={{height:3,borderRadius:2,background:g.col,opacity:g.active?1:0.85,marginBottom:8,width:"calc(100% + 5px)",minWidth:56}}></div>
                    <div style={{display:"flex",alignItems:"center",font:"400 12px/16px Roboto",color:"#333333",whiteSpace:"nowrap"}}><span>{g.l}</span>{g.cv && <button type="button" title="Reason breakdown" onClick={(e)=>{ e.stopPropagation(); setMenu(m=>m===g.k?false:g.k); }} style={{width:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center",border:"none",background:"transparent",cursor:"pointer",color:"#2563eb",padding:0,marginLeft:5}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 8 L19 8 L12 17 Z" fill="currentColor" /></svg></button>}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8,font:"600 18px/22px Roboto",color:"#0f172a",marginTop:4,whiteSpace:"nowrap"}}>{String(g.n).padStart(2,"0")}<span style={{font:"400 12px/22px Roboto",color:"#8A94A6"}}>{usd(g.amt)}</span></div>
                  </div>
                  {g.cv && menu===g.k && window.ARVSubStatusMenu && (() => { const cnt = srcRows.filter(r=>r.category===g.k).reduce((m,r)=>{ m[r.reasonLabel]=(m[r.reasonLabel]||0)+1; return m; },{}), ids = Object.keys(cnt).sort((x,y)=>cnt[y]-cnt[x]); return <div style={{textAlign:"left"}}><window.ARVSubStatusMenu alignRight={last} initial={sel[g.k]||null} items={ids.map(o=>({id:o,label:o,count:String(cnt[o]).padStart(2,"0")}))} onClose={()=>setMenu(false)} onApply={(sl)=>{ setSel(v=>({...v,[g.k]: sl.length===ids.length ? null : sl})); setCard(g.k); }} /></div>; })()}
                </div>); })}
            </div>
          </div>
        </div>
      </div>
            <div style={{padding:"16px 32px 32px",overflowX:view==="card"?"hidden":"auto"}}>
        {view==="card" ? <ClaimBoard rows={shown} onOpen={openR} onMove={(r,k)=>{ setFocus(null); setMv(k); setOpenRow(r); }} by={bby} setBy={setBby} cv={cv} /> : gs==="regular" ? REG : <div style={{minWidth:1884}}>
          <div style={{display:"grid",gridTemplateColumns:GRIDV,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",minHeight:48}}>
            {hdrChk}{colsV.map(c => (
              <div key={c.key} onClick={c.sort?()=>onSort(c.key):undefined} style={{padding:"0 16px",font:"500 11px/14px Roboto",color:"#64748b",display:"flex",alignItems:"center",justifyContent:c.right?"flex-end":"flex-start",cursor:c.sort?"pointer":"default",userSelect:"none",whiteSpace:"nowrap",overflow:"hidden",gap:2}}>
                {c.sort && Arrows && <Arrows active={sort.k===c.key} dir={sort.dir} />}{c.label}
              </div>))}
          </div>
          <Body>
            {shown.length===0 ? <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>No accounts match the current filters.</div>
            : shown.map(r => { const t = STAG[r.category], sep = {borderLeft:"1px solid #e5e7eb"}, cs = (al) => ({ ...sep, alignSelf:"stretch", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:al==="r"?"flex-end":"flex-start", padding:"10px 16px", minWidth:0, gap:3 }), main = { font:"500 13px/18px Roboto", color:"#1f2937", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"100%" }, sub = { font:"400 11px/16px Roboto", color:"#6A717D", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"100%" }, open = isOpen(r), fuTxt = !open||!r.followUp ? "—" : r.fuOff===0 ? "Today" : r.fuOff<0 ? "Overdue" : r.followUp, fuRed = open && (r.fuOff<0 || !r.followUp), tk = r.taskState;
              return (
              <div key={r.id} onClick={()=>openR(r)} style={{cursor:"pointer",display:"grid",gridTemplateColumns:GRIDV,alignItems:"center",minHeight:76,border:"1px solid #e2e8f0",borderRadius:6,marginBottom:8,boxShadow:"0 1px 2px rgba(15,23,42,0.04)",background:"#fff",overflow:"hidden"}}>
                {rowChk(r)}{model==="patient" ? <>
                  <div style={{...cs(),borderLeft:"none"}}>
                    <a href="#" onClick={e=>{ e.preventDefault(); e.stopPropagation(); openR(r); }} style={{font:"600 14px/18px Roboto",color:"#1677FF",textDecoration:"underline",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%",cursor:"pointer"}}>{r.patientName}</a>
                    <div style={sub}>{r.patientId} · {r.mrn || "No MRN"}</div>
                  </div>
                  <div style={cs()}>
                    <div style={{...main,color:"#2B7A8C",fontWeight:600}}>{cv==="claim" ? r.claimCount+(r.claimCount===1?" claim":" claims") : r.colId}</div>
                    {cv!=="claim" && <div style={sub}>{r.claimCount} {r.claimCount===1?"claim":"claims"}</div>}
                  </div>
                </> : <div style={{...cs(),borderLeft:"none"}}>
                  <a href="#" onClick={e=>{ e.preventDefault(); e.stopPropagation(); openR(r); }} style={{font:"600 14px/18px Roboto",color:"#1677FF",textDecoration:"underline",cursor:"pointer"}}>{idOf(r,cv)}</a>
                </div>}
                {model!=="patient" && <div style={cs()}>
                  <div style={{...main,color:"#2B7A8C",fontWeight:600}} title={r.patientName}>{r.patientName}</div>
                  <div style={sub}>{r.patientId} · {r.mrn || "No MRN"}</div>
                </div>}
                <div style={cs()}>{(() => { const ps = r.claims ? Array.from(new Set(r.claims.map(c => c.payor))) : [r.payor]; return <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0,maxWidth:"100%"}}><div style={{...main,minWidth:0}} title={ps.join(", ")}>{ps[0]}</div>{ps.length>1 && <span style={{flexShrink:0,padding:"1px 6px",border:"1px solid #d9d9d9",borderRadius:4,background:"#F5F7FA",font:"500 11px/16px Roboto",color:"#3A424A",whiteSpace:"nowrap"}}>+{ps.length-1} more</span>}</div>; })()}</div>
                <div style={cs("r")}><div style={main}>{usd(r.billed)}</div></div>
                <div style={{...cs("r"),background:"#F0F7F9"}}><div style={{...main,color:r.balance>0?"#2B7A8C":"#6A717D",fontWeight:600}}>{usd(r.balance)}</div></div>
                <div style={cs("r")}><div style={{...main,color:r.daysOpen>60?"#CF1322":"#1f2937"}}>{r.daysOpen?r.daysOpen+"d":"—"}</div></div>
                {cv!=="claim" && <div style={cs()}><WorkTag w={r.work} /></div>}
                <div style={cs()}>
                  <span style={{padding:"1px 8px",border:"1px solid "+t[1],borderRadius:6,color:t[1],background:t[0],font:"500 11px/16px Roboto"}}>{QLAB(r.category)}</span>
                  <div style={sub} title={r.reasonLabel+" · "+r.payerCode}>{r.reasonLabel} · {r.payerCode}</div>
                </div>
                <div style={cs()}>
                  <div style={{...main,color:open&&r.dlDays!=null&&r.dlDays<=14?"#CF1322":"#1f2937"}}>{open&&r.dlDays!=null?r.dlDays+" days":"—"}</div>
                  {open&&r.dlDays!=null&&<div style={sub}>{r.dlType}</div>}
                </div>
                <div style={cs()}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{...main,color:fuRed?"#CF1322":"#1f2937"}}>{fuTxt}</span>{open&&<span style={{padding:"0 5px",border:"1px solid #d8dee7",borderRadius:3,background:"#f5f7fa",font:"500 10px/14px Roboto",color:"#3A424A"}}>{r.code}</span>}</div>
                  {open&&tk&&<div style={{...sub,color:tk==="done"?"#389E0D":tk==="blocked"?"#CF1322":"#2563eb"}}>{tk==="done"?"Branch finished its task":tk==="blocked"?"Blocked at branch":"Waiting on branch"}</div>}
                </div>
                <div style={cs()}><div style={main} title={r.lastAction}>{r.lastAction}</div><div style={sub}>{r.lastSub}</div></div>
                <div style={cs()}>
                  <div style={{display:"flex",alignItems:"center",gap:6,maxWidth:"100%"}}><span style={{...main,color:r.owner==="Unassigned"?"#CF1322":"#1f2937"}}>{r.owner==="Unassigned"?"Unassigned":r.owner}</span>{r.status==="Escalated"&&<span style={{padding:"0 6px",borderRadius:3,background:"#FFF1F0",border:"1px solid #FFA39E",font:"500 10px/16px Roboto",color:"#CF1322"}}>Escalated</span>}</div>
                </div>
              </div>); })}
          </Body>
        </div>}
      </div>
      </div>
      </div>
      {bulk && <BulkSlider items={bulk} onClose={()=>{ setBulk(null); setChk({}); }} onExec={(l)=>setOv(m => { const n = { ...m }; l.forEach(x => { n[x.rid] = { ...(n[x.rid]||{}), lastAction:x.label, lastSub:"You · just now" }; }); return n; })} />}
      {openRow && <ClaimSlider key={openRow.id+"|"+(mv||"")+"|"+(focus||"")} focusId={focus} cv={cv} moveTo={mv} r={openRow} saved={savedUpd[openRow.id]} onSave={(id,h,p)=>{ setSavedUpd(m=>({...m,[id]:[...h,...(m[id]||[])]})); if (p) setOv(m => { if (p.claims && model==="claim") { const n = { ...m }; p.claims.forEach(c => { n[c.id] = c; }); return n; } return { ...m, [id]:p }; }); }} onClose={()=>{ setOpenRow(null); setMv(null); }} />}
    </div>
  );
}

// ── Dashboard insight sections (sample data) ────────────────────────
const MONTHS = ["Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"];
const AGE_C = ["#91DCF7","#4C9FD1","#F8C87C","#F5A25D","#F87D7C"];
const AGE_L = ["0–30 days","31–60 days","61–90 days","91–120 days","120+ days"];
const PAYER_AGING = [["Humana Medicare Advantage",[210,160,110,55,25]],["UnitedHealthcare",[185,140,95,55,24]],["Palmetto GBA (Medicare)",[260,185,70,38,19]],["Medicaid managed care",[95,110,85,68,54]],["Cigna HealthSpring",[60,48,38,28,17]],["Aetna, BCBS and other",[95,92,32,18,15]]];
const MOM = [
  { t:"Cash collected", v:"$2.39M", d:"+3.5% vs Sep", c:"#4C9FD1", bar:true, s:[1.7,1.65,1.55,1.75,1.85,1.92,1.98,2.02,2.08,2.15,2.2,2.39], note:"Payments posted in the month, all payers." },
  { t:"Days in A/R", v:"47 days", d:"No change vs Sep", c:"#1C2D42", s:[55,57,60,57,53,50,49,46,44,43,47,47], note:"Lower is better. Common target is under 40." },
  { t:"Share of A/R past 90 days", v:"19%", d:"No change vs Sep", c:"#F87D7C", s:[25,26,29,26,24,22,22,21,19,20,19,19], note:"Money most at risk of never being collected." },
  { t:"Initial denial rate", v:"9.6%", d:"−0.2 pts vs Sep", c:"#F5A25D", s:[12.4,12.9,14.4,13,12,11.4,10.9,10.6,10.3,10.1,9.8,9.6], note:"Share of claims denied on first adjudication." },
  { t:"Net collection rate", v:"96%", d:"+1 pts vs Sep", c:"#61AA6B", s:[91,91,89,92,93,93,94,94,94,95,95,96], note:"Collected as a share of what was collectible." },
  { t:"Appeal overturn rate", v:"60%", d:"+1 pts vs Sep", c:"#7C6BD6", s:[48,49,47,50,52,53,54,55,56,57,59,60], note:"Appeals that reversed the denial." },
];
const BAL = MONTHS.map((m,i)=>[300-i*1.2+(i%3),330-(i%4)*3,225-i*2,195-i*3.5,285-i*11.4]).map(a=>a.map(v=>Math.round(v)));
const PAYERS = [["Humana Medicare Advantage","$530K",31,12.8,58],["UnitedHealthcare","$499K",28,10.2,61],["Palmetto GBA (Medicare)","$572K",17,4.1,74],["Medicaid managed care","$412K",46,15.6,49],["Cigna HealthSpring","$191K",33,11.3,55],["Aetna, BCBS and other","$252K",29,9.4,60]];
const RISK = [["all","All at-risk"],["timely","Timely filing"],["adr","ADR response"],["appeal","Appeal window"],["aged","Aged past 120 days"],["noresp","No response in 90+ days"]];
const BUCKETS = [["7 days or less",0,7,"#CF1322"],["8–14 days",8,14,"#F5A25D"],["15–30 days",15,30,"#4C9FD1"],["31–60 days",31,60,"#91DCF7"]];
const k$ = (v) => v>=1e6 ? "$"+(v/1e6).toFixed(2)+"M" : v>=1000 ? "$"+Math.round(v/1000)+"K" : "$"+Math.round(v);
const full = (v) => "$"+Math.round(v).toLocaleString("en-US");
const SecT = ({children}) => <div style={{font:"500 16px/20px Roboto",color:"#2563eb",marginTop:14}}>{children}</div>;
const Sub = ({children}) => <div style={{font:"400 13px/18px Roboto",color:"#6A717D",margin:"4px 0 12px"}}>{children}</div>;
const box = { border:"1px solid #E8E9EA", borderRadius:9, background:"#fff", padding:"18px 28px", boxSizing:"border-box" };
const Legend = () => <div style={{display:"flex",gap:14,flexWrap:"wrap",margin:"4px 0 14px"}}>{AGE_L.map((l,i)=><span key={l} style={{display:"inline-flex",alignItems:"center",gap:6,font:"400 12px/16px Roboto",color:"#6A717D"}}><i style={{width:10,height:10,borderRadius:2,background:AGE_C[i]}}></i>{l}</span>)}</div>;

function Spark({ s, c, bar }) {
  const W=240,H=96,p=6, mn=Math.min(...s), mx=Math.max(...s), lo=bar?0:mn-(mx-mn)*.2, hi=mx+(mx-mn)*.15, X=i=>p+i*(W-2*p)/(s.length-1), Y=v=>H-14-(v-lo)/(hi-lo||1)*(H-24);
  return (
    <svg viewBox={"0 0 "+W+" "+(H+4)} style={{width:"100%",height:"auto",display:"block"}}>
      {bar ? s.map((v,i)=><rect key={i} x={X(i)-6} y={Y(v)} width={12} height={H-14-Y(v)} fill={c} opacity={i===s.length-1?1:.55} />)
           : <><polyline fill="none" stroke={c} strokeWidth="1.8" points={s.map((v,i)=>X(i)+","+Y(v)).join(" ")} />{s.map((v,i)=><circle key={i} cx={X(i)} cy={Y(v)} r={i===s.length-1?3.5:2} fill={i===s.length-1?c:"#fff"} stroke={c} strokeWidth="1.4" />)}</>}
      {[0,5,11].map(i=><text key={i} x={X(i)} y={H+2} textAnchor="middle" fontSize="8" fill="#8A94A6">{MONTHS[i]}</text>)}
    </svg>
  );
}
function StackCols() {
  const W=1100,H=300,pl=60,pb=28, tot=BAL.map(a=>a.reduce((x,y)=>x+y,0)), mx=3000, bw=56, gap=(W-pl-20-bw*12)/11, Y=v=>H-pb-v/mx*(H-pb-20);
  return (
    <svg viewBox={"0 0 "+W+" "+(H+4)} style={{width:"100%",height:"auto",display:"block"}}>
      {[0,1500,3000].map(t=><g key={t}><line x1={pl} x2={W-10} y1={Y(t)} y2={Y(t)} stroke="#EEF0F3" /><text x={pl-8} y={Y(t)+4} textAnchor="end" fontSize="11" fill="#6A717D">{t?("$"+(t/1000).toFixed(1)+"M"):"$0K"}</text></g>)}
      {BAL.map((a,i)=>{ let acc=0; const x=pl+10+i*(bw+gap); return <g key={i}>{a.map((v,j)=>{ const y0=Y(acc), y1=Y(acc+v); acc+=v; return <rect key={j} x={x} y={y1} width={bw} height={y0-y1} fill={AGE_C[j]} />; })}<text x={x+bw/2} y={H-8} textAnchor="middle" fontSize="11" fill="#6A717D">{MONTHS[i]}</text>{i===11 && <text x={x+bw/2} y={Y(tot[i])-6} textAnchor="middle" fontSize="12" fontWeight="600" fill="#1C2D42">{"$"+(tot[i]/1000).toFixed(1)+"M"}</text>}</g>; })}
    </svg>
  );
}

const RISK_LABELS = [["all","All at-risk"],["timely","Timely filing"],["adr","ADR response"],["appeal","Appeal window"],["aged","Aged past 120 days"],["noresp","No response in 90+ days"]];
function riskItemsOf(rows) {
  return rows.filter(r=>r.status!=="Resolved").map((r,i)=>({ r, left: 3+((i*11)%58), type: r.category==="ADR"?"adr":r.category==="Denied"?"appeal":r.category==="Underpaid"?"aged":(i%2?"noresp":"timely") }));
}
window.collRiskItems = (rows) => { const it = riskItemsOf(rows); return RISK_LABELS.map(([k,l]) => [k, l, it.filter(x=>k==="all"||x.type===k).map(x=>x.r)]); };
function CollectionsInsights({ rows, part }) {
  const [rOpen, setROpen] = useS(false), [risk, setRisk] = useS("all"), [tab, setTab] = useS("mom");
  const Stat = window.StatCard;
  const open = rows.filter(r=>r.status!=="Resolved");
  const items = riskItemsOf(rows);
  const inType = (t)=>items.filter(x=>t==="all"||x.type===t);
  const sum = (a)=>a.reduce((s,x)=>s+x.r.balance,0);
  const all = inType("all"), soon = all.filter(x=>x.left<=7);
  const sel = inType(risk), selMax = Math.max(1,...BUCKETS.map(([,lo,hi])=>sum(sel.filter(x=>x.left>=lo&&x.left<=hi))));
  const soon14 = sel.filter(x=>x.left<=14).length;
  const th = (a,al)=>({font:"400 12px/16px Roboto",color:"#6A717D",textAlign:al||"left",padding:"8px 0"});
  return (
    <div style={{display:"flex",flexDirection:"column",gap:0,paddingTop:6}}>
      {part==="risk" && <>
      <SecT>Collections - Deadline Risk - Claims At Risk</SecT>
      <Sub>{all.length} claims worth {full(sum(all))} could expire or age out. {soon.length} have 7 days or less. Timely filing limits differ by payor.</Sub>
      <div style={{...box,marginTop:14}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
          <div style={{minWidth:0}}>
            <div style={{font:"500 15px/20px Roboto",color:"#1f2937"}}>Time left on deadlines</div>
            <Sub>Dollars by how soon the clock runs out. Claims with no deadline are not shown.</Sub>
          </div>
          <div style={{position:"relative",flexShrink:0}}>
            <button type="button" onClick={()=>setROpen(o=>!o)} style={{display:"inline-flex",alignItems:"center",gap:8,background:"#fff",border:"1px solid #d9d9d9",borderRadius:4,padding:"6px 12px",font:"400 13px/18px Roboto",color:"#1f2937",cursor:"pointer",whiteSpace:"nowrap"}}>
              {(RISK.find(x=>x[0]===risk)||[])[1]} · {inType(risk).length}<span style={{color:"#94a3b8",fontSize:9}}>▾</span>
            </button>
            {rOpen && <div style={{position:"absolute",top:"calc(100% + 4px)",right:0,zIndex:20,minWidth:240,background:"#fff",border:"1px solid #e2e8f0",borderRadius:6,boxShadow:"0 8px 24px rgba(15,23,42,0.12)",padding:4}}>
              {RISK.map(([k,l])=>{ const on=risk===k; return (
                <div key={k} onClick={()=>{ setRisk(k); setROpen(false); }} onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"} onMouseLeave={e=>e.currentTarget.style.background=on?"#eef4fb":"transparent"} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,padding:"8px 12px",borderRadius:4,cursor:"pointer",background:on?"#eef4fb":"transparent",font:(on?500:400)+" 13px/18px Roboto",color:on?"#1677FF":"#1f2937"}}>
                  <span>{l}</span><span style={{color:"#6A717D",font:"400 12px/16px Roboto"}}>{String(inType(k).length).padStart(2,"0")} · {full(sum(inType(k)))}</span>
                </div>); })}
            </div>}
          </div>
        </div>
        {BUCKETS.map(([l,lo,hi,c])=>{ const b=sel.filter(x=>x.left>=lo&&x.left<=hi), v=sum(b); return (
          <div key={l} style={{display:"grid",gridTemplateColumns:"120px 1fr 90px 70px",gap:12,alignItems:"center",marginBottom:10,font:"400 13px/18px Roboto",color:"#3A424A"}}>
            <span style={{color:lo===0?"#CF1322":undefined}}>{l}</span>
            <div style={{height:14,background:"#EEF0F3",borderRadius:3,overflow:"hidden"}}><div style={{width:(v/selMax*100)+"%",height:"100%",background:c}}></div></div>
            <b style={{textAlign:"right",fontWeight:500}}>{full(v)}</b><span style={{color:"#8A94A6",fontSize:12}}>{b.length} {b.length===1?"claim":"claims"}</span>
          </div>); })}
      </div>

      </>}
      {part==="work" && (() => {
        const by = {}; rows.forEach(r => { const o = r.owner || "Unassigned"; (by[o] = by[o] || []).push(r); });
        const L = Object.keys(by).filter(o => o!=="Unassigned").map((o,i) => { const rs = by[o], n = rs.length, closed = rs.filter(r => r.status==="Resolved").length, op = n-closed, wk = Math.min(op, Math.round(op*(0.42+((i*13)%40)/100))), rec = rs.reduce((x,r) => x+(r.paidAmt||0), 0), over = rs.filter(r => r.status!=="Resolved" && r.fuOff<0).length; return { o, n, closed, wk, nw:op-wk, rec, over, touch:closed+wk, acts:closed*3+wk*2+((i*7)%9) }; }).sort((a,b) => b.touch-a.touch);
        const tot = (k) => L.reduce((x,c) => x+c[k], 0), mx = Math.max(1, ...L.map(c => c.n)), pc = (a,b) => b ? Math.round(a/b*100)+"%" : "—";
        const seg = [["Closed","closed","#55996A"],["Worked, still open","wk","#4F93C2"],["Not yet worked","nw","#E1E5EA"]];
        return <>
        <SecT>Collector Activity</SecT>
        <Sub>How much of each collector's assigned work has been touched. Worked means a note, follow-up date or status change was saved.</Sub>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4, minmax(0,1fr))",gap:9}}>
          {Stat && [["Assigned Claims",String(tot("n"))],["Worked",String(tot("touch"))+" ("+pc(tot("touch"),tot("n"))+")"],["Closed",String(tot("closed"))],["Recovered",full(tot("rec"))]].map(([l,v]) => <div key={l} style={{display:"flex"}}><Stat label={l} value={v} fill /></div>)}
        </div>
        <div style={{...box,marginTop:14}}>
          <div style={{font:"500 15px/20px Roboto",color:"#1f2937"}}>Work done by collector</div>
          <div style={{display:"flex",gap:14,flexWrap:"wrap",margin:"4px 0 14px"}}>{seg.map(([l,,c]) => <span key={l} style={{display:"inline-flex",alignItems:"center",gap:6,font:"400 12px/16px Roboto",color:"#3A424A"}}><i style={{width:10,height:10,borderRadius:2,background:c}}></i>{l}</span>)}</div>
          {L.map(c => <div key={c.o} style={{display:"grid",gridTemplateColumns:"170px 1fr 120px",gap:12,alignItems:"center",marginBottom:10,font:"400 13px/18px Roboto",color:"#3A424A"}}>
            <span style={{fontWeight:500,color:"#1f2937"}}>{c.o}</span>
            <div style={{display:"flex",height:20,width:(c.n/mx*100)+"%",minWidth:60,borderRadius:3,overflow:"hidden"}}>{seg.map(([l,k,col]) => c[k]>0 && <div key={k} title={l+": "+c[k]} style={{width:(c[k]/c.n*100)+"%",background:col}}></div>)}</div>
            <span style={{textAlign:"right",color:"#6A717D",font:"400 12px/16px Roboto"}}>{c.touch} of {c.n} worked</span>
          </div>)}
        </div>
        <div style={{...box,marginTop:14}}>
          <div style={{font:"500 15px/20px Roboto",color:"#1f2937",marginBottom:8}}>Collector summary</div>
          <div style={{display:"grid",gridTemplateColumns:"minmax(150px,1.6fr) repeat(6, minmax(80px,1fr))",columnGap:12,alignItems:"center"}}>
            {["Collector","Assigned","Worked","Closed","Overdue","Activities","Recovered"].map((h,i) => <div key={h} style={th(h,i?"right":"left")}>{h}</div>)}
            {L.map(c => <React.Fragment key={c.o}>
              <div style={{padding:"10px 0",borderTop:"1px solid #EEF0F3",font:"500 13px/18px Roboto",color:"#1f2937"}}>{c.o}</div>
              {[c.n, pc(c.touch,c.n), c.closed, c.over, c.acts, full(c.rec)].map((x,i) => <div key={i} style={{padding:"10px 0",borderTop:"1px solid #EEF0F3",font:"400 13px/18px Roboto",textAlign:"right",color:i===3&&c.over>0?"#CF1322":undefined}}>{x}</div>)}
            </React.Fragment>)}
          </div>
        </div>
        </>; })()}
      {part==="aging" && <>
      <SecT>A/R Aging Metrics</SecT>
      <Sub>19% of open A/R is past 90 days. Neos works the receivable; HCHB stays the record of truth and receives a write-back every night.</Sub>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4, minmax(0,1fr))",gap:9}}>
        {Stat && [["Open A/R","$2,456K"],["Days in A/R","47"],["Past 90 Days","19%"],["Expected In Next 14 Days","$418K"]].map(([l,v])=><div key={l} style={{display:"flex"}}><Stat label={l} value={v} fill /></div>)}
      </div>
      <div style={{...box,marginTop:14}}>
        <div style={{font:"500 15px/20px Roboto",color:"#1f2937"}}>Aging by payor</div>
        <Legend />
        {PAYER_AGING.map(([n,a])=>{ const t=a.reduce((x,y)=>x+y,0); return (
          <div key={n} style={{display:"grid",gridTemplateColumns:"190px 1fr 70px",gap:12,alignItems:"center",marginBottom:10,font:"400 13px/18px Roboto",color:"#3A424A"}}>
            <span>{n}</span>
            <div style={{display:"flex",height:20,width:(t/600*100)+"%",minWidth:60}}>{a.map((v,i)=><div key={i} title={AGE_L[i]+": $"+v+"K"} style={{width:(v/t*100)+"%",background:AGE_C[i]}}></div>)}</div>
            <b style={{textAlign:"right",fontWeight:500}}>{"$"+t+"K"}</b>
          </div>); })}
      </div>
      <div style={{...box,marginTop:14}}>
        <div style={{font:"500 15px/20px Roboto",color:"#1f2937"}}>Neos A/R against HCHB</div>
        <Sub>The two will not match to the dollar. Payments land and notes post at different times. This shows the gap and why it exists.</Sub>
        {[["Neos open A/R","$2,456,000"],["HCHB A/R (record of truth)","$2,431,000"]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:"1px solid #EEF0F3",font:"400 13px/18px Roboto",color:"#3A424A"}}><span>{l}</span><span>{v}</span></div>)}
        <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:"1px solid #EEF0F3"}}><div><div style={{font:"500 13px/18px Roboto",color:"#1f2937"}}>Difference</div><div style={{font:"400 12px/16px Roboto",color:"#6A717D"}}>$19,000 paid after the last write-back · $6,000 resolved in Neos, posting in HCHB tonight</div></div><b style={{font:"500 13px/18px Roboto"}}>$25,000</b></div>
      </div>

      </>}
      {part==="cash" && <>
      <SecT>Cash and Performance</SecT>
      <Sub>Cash collected rose 3.5% in October. Days in A/R held at 47. Twelve months of sample data.</Sub>
      <div style={{display:"flex",gap:4,borderBottom:"1px solid #E8E9EA",marginBottom:14}}>
        {[["mom","Month Over Month"],["bal","Balances"],["pay","Payers"]].map(([k,l])=><button key={k} type="button" onClick={()=>setTab(k)} style={{background:"transparent",border:"none",borderBottom:"2px solid "+(tab===k?"#1677FF":"transparent"),marginBottom:-1,padding:"8px 14px",cursor:"pointer",font:(tab===k?500:400)+" 14px/18px Roboto",color:tab===k?"#1677FF":"#6A717D"}}>{l}</button>)}
      </div>
      {tab==="mom" && <div style={{display:"grid",gridTemplateColumns:"repeat(3, minmax(0,1fr))",gap:14}}>
        {MOM.map(m=>(
          <div key={m.t} style={{...box,padding:"14px 18px"}}>
            <div style={{font:"500 14px/18px Roboto",color:"#1f2937"}}>{m.t}</div>
            <div style={{display:"flex",alignItems:"baseline",gap:8,margin:"6px 0"}}><b style={{font:"500 24px/30px Roboto",color:"#1C2D42"}}>{m.v}</b><span style={{font:"400 11px/14px Roboto",color:"#6A717D"}}>{m.d}</span></div>
            <Spark s={m.s} c={m.c} bar={m.bar} />
            <div style={{font:"400 11px/15px Roboto",color:"#6A717D",marginTop:4}}>{m.note}</div>
          </div>))}
      </div>}
      {tab==="bal" && <>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4, minmax(0,1fr))",gap:9}}>
          {Stat && [["Open Balance, Oct","$2,456K"],["Change Vs Sep","−$3K"],["Change Vs Nov 2025","−$54K"],["Past 120 Days, Oct","$160K"]].map(([l,v])=><div key={l} style={{display:"flex"}}><Stat label={l} value={v} fill /></div>)}
        </div>
        <div style={{...box,marginTop:14}}>
          <div style={{font:"500 15px/20px Roboto",color:"#1f2937"}}>Open A/R by age, month by month</div>
          <Legend /><StackCols />
          <div style={{font:"400 12px/16px Roboto",color:"#6A717D",marginTop:6}}>The oldest bucket shrank from $285K in January to $160K in October while the newest bucket grew. That pattern means older claims are being worked down, not just ageing out.</div>
        </div>
      </>}
      {tab==="pay" && <div style={box}>
        <div style={{font:"500 15px/20px Roboto",color:"#1f2937"}}>How each payor behaves</div>
        <Sub>Slow payors and high denial rates point to where collection effort and upstream fixes pay off most.</Sub>
        <div style={{display:"grid",gridTemplateColumns:"minmax(160px,1.4fr) 90px 130px minmax(160px,2fr) 60px 110px",columnGap:16,alignItems:"center"}}>
          {["Payor","Balance","Avg days to pay","Initial denial rate","","Appeal overturn"].map((h,i)=><div key={i} style={th(h,i===1||i===2||i===5?"right":"left")}>{h}</div>)}
          {PAYERS.map(([n,b,d,dr,ap])=><React.Fragment key={n}>
            <div style={{padding:"10px 0",borderTop:"1px solid #EEF0F3",font:"500 13px/18px Roboto",color:"#1f2937"}}>{n}</div>
            <div style={{padding:"10px 0",borderTop:"1px solid #EEF0F3",font:"400 13px/18px Roboto",textAlign:"right"}}>{b}</div>
            <div style={{padding:"10px 0",borderTop:"1px solid #EEF0F3",font:"400 13px/18px Roboto",textAlign:"right",color:d>40?"#CF1322":undefined}}>{d}</div>
            <div style={{padding:"10px 0",borderTop:"1px solid #EEF0F3"}}><div style={{height:6,background:"#EEF0F3",borderRadius:3,overflow:"hidden"}}><div style={{width:(dr/16*100)+"%",height:"100%",background:dr>10?"#F87D7C":"#4C9FD1"}}></div></div></div>
            <div style={{padding:"10px 0",borderTop:"1px solid #EEF0F3",font:"400 12px/18px Roboto"}}>{dr}%</div>
            <div style={{padding:"10px 0",borderTop:"1px solid #EEF0F3",font:"400 13px/18px Roboto",textAlign:"right"}}>{ap}%</div>
          </React.Fragment>)}
        </div>
      </div>}
      </>}
    </div>
  );
}
window.CollectionsInsights = CollectionsInsights;
window.CollectionsSection = CollectionsSection;
})();
