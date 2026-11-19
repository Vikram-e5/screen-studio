(function(){
const R = React, useS = R.useState, useE = R.useEffect, useR = R.useRef;
const F = "Roboto, sans-serif";
const usd = (n) => "$" + (+n || 0).toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 });
const num = (s) => +String(s == null ? 0 : s).replace(/[^0-9.\-]/g, "") || 0;
const GRAD = "linear-gradient(135deg,#4285F4 0%,#9B72CB 50%,#D96570 100%)";

function Spark({ size = 22, id = "a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
      <defs><linearGradient id={"gm" + id} x1="4" y1="24" x2="24" y2="4" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#4285F4" /><stop offset=".45" stopColor="#9B72CB" /><stop offset=".8" stopColor="#D96570" /><stop offset="1" stopColor="#F9AB00" /></linearGradient></defs>
      <path d="M14 1c.9 6.9 6.1 12.1 13 13-6.9.9-12.1 6.1-13 13-.9-6.9-6.1-12.1-13-13C7.9 13.1 13.1 7.9 14 1z" fill={"url(#gm" + id + ")"} />
    </svg>
  );
}

function getCtx() {
  const c = window.__aiCtx, d = window.__v2DrawerFocus;
  if (c && c.kind === "collection") {
    const r = c.r, cls = r.claims || [r];
    return { kind:"collection", name:r.patientName, mrn:r.mrn || "No MRN", memId:r.memId, label:"Collection " + (r.id || ""), claims:cls.map(x => ({ no:x.claimNumber, billed:x.billed, paid:x.paidAmt || 0, bal:x.balance != null ? x.balance : x.billed - (x.paidAmt || 0), payer:x.payor, cat:x.category, reason:x.reasonLabel, next:x.code, fu:x.followUp, dlType:x.dlType, dlDays:x.dlDays, owner:x.owner, last:x.lastAction, open:x.status !== "Resolved", work:x.work, age:x.daysOpen })) };
  }
  if (d && d.row) {
    const r = d.row, sib = r.siblings || [r];
    return { kind:"patient", name:r.name || r.patientName, mrn:r.mrn || "No MRN", memId:r.memId || r.mid, label:"Patient detail", tab:d.kind, claims:sib.map(x => { const b = num(x.chargeAmt != null ? x.chargeAmt : x.billed); const p = x.collPaid != null ? x.collPaid : (x.status === "Payor Accepted" ? b : 0); return { no:x.claimNumber, billed:b, paid:p, bal:b - p, payer:x.payor, cat:x.status, reason:null, dlDays:null, open:x.status !== "Payor Accepted", timely:x.timely, sub:x.submissionDate }; }) };
  }
  return null;
}

function answer(q, ctx) {
  const t = q.toLowerCase(), cl = ctx.claims, one = cl.length === 1;
  const billed = cl.reduce((a, c) => a + c.billed, 0), paid = cl.reduce((a, c) => a + c.paid, 0), bal = billed - paid;
  const line = (c) => c.no + " · " + usd(c.billed) + " billed · " + usd(c.paid) + " received · " + usd(c.bal) + " balance";
  if (/note|draft|log/.test(t)) return ["Draft note", cl.filter(c => c.open).map(c => "Called " + (c.payer || "payer") + " re " + c.no + (c.cat ? " (" + c.cat + ")" : "") + ". Spoke with rep, ref # ____. Next: " + (c.next || "follow up") + (c.fu ? " on " + c.fu : "") + ".").join("\n") || "All claims are closed. No follow-up note needed."];
  if (/balance|owe|outstanding|due|total|bill|paid|receiv|money|amount/.test(t)) return ["Money", [usd(billed) + " billed · " + usd(paid) + " received · " + usd(bal) + " balance"].concat(one ? [] : cl.map(line)).join("\n")];
  if (/deadline|filing|timely|risk|expire|urgent/.test(t)) { const w = cl.filter(c => c.dlDays != null || c.timely); return ["Deadlines", w.length ? w.map(c => c.no + " · " + (c.dlType ? c.dlType + " in " + c.dlDays + " days" : "Timely filing: " + c.timely)).join("\n") : "No deadline risk on these claims."]; }
  if (/next|step|do|action|todo|what should/.test(t)) { const o = cl.filter(c => c.open); return ["Suggested next steps", o.length ? o.map(c => c.no + " → " + (c.next || (/Rejected/.test(c.cat || "") ? "Fix and resubmit" : c.cat === "Payor Pending" ? "Check status with payer" : "Review claim")) + (c.fu ? " · follow up " + c.fu : "")).join("\n") : "Nothing open. All claims are closed."]; }
  if (/payer|payor|insur/.test(t)) return ["Payers", cl.map(c => c.no + " · " + (c.payer || "—")).join("\n")];
  if (/status|where|stuck|why|reason|deni|reject/.test(t)) return ["Status", cl.map(c => c.no + " · " + (c.cat || "—") + (c.reason ? " · " + c.reason : "") + (c.owner ? " · assigned to " + c.owner : "")).join("\n")];
  if (/who|assign|owner|last|activity|history/.test(t)) return ["Activity", cl.map(c => c.no + " · " + (c.last || "No activity yet") + (c.owner ? " · " + c.owner : "")).join("\n")];
  if (/mrn|member|id|patient|who is/.test(t)) return ["Patient", ctx.name + "\nMRN: " + ctx.mrn + "\nMember ID: " + (ctx.memId || "—") + "\n" + cl.length + " claim" + (cl.length > 1 ? "s" : "")];
  return ["Summary", ctx.name + " · " + cl.length + " claim" + (cl.length > 1 ? "s" : "") + "\n" + usd(billed) + " billed · " + usd(paid) + " received · " + usd(bal) + " balance\n" + cl.filter(c => c.open).length + " open"];
}

const GO = (tab) => { setTimeout(() => { window.__collTab = tab; if (window.__setCollTab) window.__setCollTab(tab); }, 0); };
const ACT = {
  "What needs my attention today?": { tab:"due", msg:"Opened Collections filtered to Due Today." },
  "Open the Collections worklist": { tab:"all", msg:"Opened the Collections worklist." },
  "Show overdue follow-ups": { tab:"over", msg:"Opened Collections filtered to Overdue." },
};
const SUG = {
  collection:["Summarize this collection", "What should I do next?", "Draft a follow-up note", "How much is still owed?", "Any deadline risk?"],
  patient:["Summarize this patient", "Which claims are still open?", "How much is still owed?", "Any deadline risk?", "Which payers are involved?"],
  none:["What needs my attention today?", "Open the Collections worklist", "Show overdue follow-ups"],
};

window.__neosAsk = (q) => { const c = getCtx(); return c ? answer(q, c) : null; };
window.__neosSug = (k) => SUG[k];
function AIBar() {
  const [open, setOpen] = useS(false), [msgs, setMsgs] = useS([]), [q, setQ] = useS(""), [res, setRes] = useS(null), [, tick] = useS(0), [hot, setHot] = useS(0), inp = useR(null);
  useE(() => {
    const op = () => { const c = getCtx(); if (c && c.kind === "collection") window.dispatchEvent(new Event("neos-slider")); else setOpen(true); }, t = () => tick(n => n + 1), cl = () => { window.__v2DrawerFocus = null; t(); };
    window.addEventListener("neos-open", op); window.addEventListener("v2drawerclose", cl); window.addEventListener("aictx", t);
    const iv = setInterval(t, 700);
    const k = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); const c = getCtx(); if (c && c.kind === "collection") window.dispatchEvent(new Event("neos-slider")); else setOpen(o => !o); } else if (e.key === "Escape" && open) { setOpen(false); } };
    window.addEventListener("keydown", k, true);
    return () => { window.removeEventListener("neos-open", op); window.removeEventListener("v2drawerclose", cl); window.removeEventListener("aictx", t); clearInterval(iv); window.removeEventListener("keydown", k, true); };
  }, [open]);
  useE(() => { if (open && inp.current) inp.current.focus(); }, [open]);
  const ctx = getCtx(), key = ctx ? ctx.kind : "none";
  const ctxSig = ctx ? ctx.name + "|" + ctx.kind : "";
  useE(() => { setRes(null); setQ(""); setMsgs([]); }, [ctxSig]);
  const docked = open && !!ctx, DW = 400;
  useE(() => { let st = document.getElementById("neos-dock-css"); if (!st) { st = document.createElement("style"); st.id = "neos-dock-css"; st.textContent = "body.neos-docked [data-neos-slider]{right:420px !important;max-width:calc(100vw - 420px) !important;transition:right .2s ease}body.neos-docked [data-neos-slider-rel]{margin-right:420px !important;max-width:calc(100% - 420px) !important}[data-neos-slider],[data-neos-slider-rel]{transition:margin .2s ease,right .2s ease}"; document.head.appendChild(st); } document.body.classList.toggle("neos-docked", docked); return () => document.body.classList.remove("neos-docked"); }, [docked]);
  const sugg = SUG[key].filter(s => !q || s.toLowerCase().includes(q.toLowerCase()));
  const run = (text) => {
    const v = (text != null ? text : q).trim(); if (!v) return;
    setQ(v);
    const act = ACT[v] || (!ctx && (/overdue/i.test(v) ? ACT["Show overdue follow-ups"] : /attention|due today|today/i.test(v) ? ACT["What needs my attention today?"] : /collection/i.test(v) ? ACT["Open the Collections worklist"] : null));
    if (act && !ctx) { window.__collTab = act.tab; if (window.__goSection) window.__goSection("collections"); setTimeout(() => { window.__collTab = act.tab; window.__setCollTab && window.__setCollTab(act.tab); }, 60); setRes([v, act.msg]); setOpen(false); return; }
    if (!ctx) { setRes([v, /collection/i.test(v) ? "Open Collections from the top navigation to see the worklist." : "Open a patient or collection and I will answer from that record."]); return; }
    const a = answer(v, ctx); setRes([v].concat(a)); setMsgs(m => [...m, { q:v, t:a[0], a:a[1] }]); setQ("");
  };
  const onKey = (e) => {
    if (e.key === "Enter") { e.preventDefault(); if (!q.trim() && sugg[hot]) run(sugg[hot]); else run(); }
    else if (e.key === "Backspace" && !q && res) { e.preventDefault(); setRes(null); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setHot(h => Math.min(sugg.length - 1, h + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHot(h => Math.max(0, h - 1)); }
  };
  const thread = React.useRef(null);
  useE(() => { if (thread.current) thread.current.scrollTop = thread.current.scrollHeight; }, [msgs.length]);
  if (docked) {
    const cl = ctx.claims, tb = cl.reduce((a, c) => a + c.billed, 0), tp = cl.reduce((a, c) => a + c.paid, 0);
    return (
      <div style={{ position:"fixed", top:64, right:16, bottom:16, width:DW, zIndex:2147483000, background:"#fff", border:"1px solid #e2e8f0", borderRadius:16, overflow:"hidden", boxShadow:"0 24px 60px rgba(15,23,42,0.22)", display:"flex", flexDirection:"column", fontFamily:F }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"16px 18px", borderBottom:"1px solid #eef0f3" }}>
          <Spark size={20} id="d" /><span style={{ font:"500 15px/20px " + F, color:"#1f2937" }}>Ask Neos</span><span style={{ flex:1 }}></span>
          {msgs.length > 0 && <button type="button" onClick={() => { setMsgs([]); setRes(null); }} style={{ border:"none", background:"transparent", cursor:"pointer", font:"500 12px/16px " + F, color:"#1677FF" }}>Clear</button>}
          <button type="button" title="Close (Esc)" onClick={() => setOpen(false)} style={{ width:32, height:32, border:"none", borderRadius:16, background:"#F3F6FA", cursor:"pointer", color:"#6A717D", fontSize:18, lineHeight:1 }}>×</button>
        </div>
        <div ref={thread} style={{ flex:1, overflowY:"auto", padding:"16px 18px" }}>
          <div style={{ border:"1px solid #e6e9ee", borderRadius:12, padding:"12px 14px", background:"#FAFBFD", marginBottom:16 }}>
            <div style={{ font:"600 14px/20px " + F, color:"#0f172a" }}>{ctx.name}</div>
            <div style={{ font:"400 12px/16px " + F, color:"#6A717D", marginTop:2 }}>{ctx.mrn} · Member ID {ctx.memId || "—"}</div>
            <div style={{ display:"flex", gap:20, marginTop:10 }}>{[["Billed", usd(tb)], ["Received", usd(tp)], ["Balance", usd(tb - tp)]].map(([k, v]) => <div key={k}><div style={{ font:"400 11px/16px " + F, color:"#6A717D" }}>{k}</div><div style={{ font:"600 13px/18px " + F, color:"#0f172a" }}>{v}</div></div>)}</div>
            <div style={{ marginTop:10, borderTop:"1px solid #eef0f3" }}>{cl.map(c => <div key={c.no} style={{ display:"flex", justifyContent:"space-between", gap:10, padding:"7px 0", borderBottom:"1px solid #f3f4f6", font:"400 12px/16px " + F, color:"#3A424A" }}><span style={{ fontWeight:500, color:"#0f172a" }}>{c.no}</span><span style={{ color:"#6A717D", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.cat || "—"}</span><span>{usd(c.bal)}</span></div>)}</div>
          </div>
          {msgs.map((m, i) => <div key={i} style={{ marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:8 }}><span style={{ maxWidth:"85%", padding:"7px 12px", borderRadius:"14px 14px 4px 14px", background:"#EEF4FF", color:"#1D4ED8", font:"400 13px/18px " + F }}>{m.q}</span></div>
            <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}><span style={{ marginTop:2 }}><Spark size={16} id={"m" + i} /></span><div style={{ flex:1, minWidth:0 }}><div style={{ font:"500 12px/16px " + F, color:"#6A717D", marginBottom:4 }}>{m.t}</div><div style={{ font:"400 13px/20px " + F, color:"#1f2937", whiteSpace:"pre-wrap" }}>{m.a}</div></div></div>
          </div>)}
          {!msgs.length && <><div style={{ font:"500 11px/16px " + F, color:"#8A94A6", letterSpacing:".06em", textTransform:"uppercase", margin:"0 4px 6px" }}>Suggested for this {ctx.kind === "collection" ? "collection" : "patient"}</div>
            {SUG[key].map((s, i) => <button key={s} type="button" onClick={() => run(s)} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", textAlign:"left", border:"none", background:"transparent", borderRadius:8, padding:"9px 10px", cursor:"pointer", font:"400 13px/18px " + F, color:"#1f2937" }} onMouseEnter={e => e.currentTarget.style.background = "#F3F6FF"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}><Spark size={13} id={"ds" + i} />{s}</button>)}</>}
          {msgs.length > 0 && <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:4 }}>{SUG[key].slice(0, 4).map(s => <button key={s} type="button" onClick={() => run(s)} style={{ border:"1px solid #e2e8f0", background:"#fff", borderRadius:999, padding:"4px 12px", cursor:"pointer", font:"400 12px/16px " + F, color:"#3A424A" }}>{s}</button>)}</div>}
        </div>
        <div style={{ padding:"12px 16px 16px", borderTop:"1px solid #eef0f3" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, height:46, borderRadius:23, padding:"0 8px 0 16px", border:"1.5px solid transparent", background:"linear-gradient(#fff,#fff) padding-box, " + GRAD + " border-box" }}>
            <Spark size={18} id="di" />
            <input ref={inp} value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); run(); } }} placeholder={"Ask about " + ctx.name + "…"} style={{ flex:1, minWidth:0, border:"none", outline:"none", background:"transparent", font:"400 14px/20px " + F, color:"#1f2937" }} />
            <button type="button" onClick={() => run()} style={{ height:32, border:"none", borderRadius:16, background:q.trim() ? "#1677FF" : "#C9D6E8", color:"#fff", padding:"0 14px", cursor:"pointer", font:"500 12px/16px " + F }}>Ask</button>
          </div>
        </div>
      </div>
    );
  }
  if (ctx && ctx.kind === "collection") return null;
  return (
    <div style={{ position:"fixed", right:20, bottom:84, zIndex:2147483000, fontFamily:F, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:10 }}>
      {open && (
        <div style={{ width:380, maxHeight:"min(440px, calc(100vh - 160px))", overflowY:"auto", background:"#fff", border:"1px solid #e2e8f0", borderRadius:16, boxShadow:"0 24px 60px rgba(15,23,42,0.22)", padding:"14px 14px 10px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <Spark size={16} id="h" />
            <span style={{ font:"500 13px/18px " + F, color:"#1f2937" }}>Ask Neos</span>
            <span style={{ flex:1 }}></span>
            <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"2px 10px", borderRadius:999, background:ctx ? "#EEF4FF" : "#F1F5F9", color:ctx ? "#1D4ED8" : "#6A717D", font:"500 11px/16px " + F, maxWidth:210, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{ctx ? ctx.name + " · " + ctx.label : "No record open"}</span>
          </div>
          {ctx && <div style={{ font:"400 12px/16px " + F, color:"#6A717D", marginBottom:10 }}>{ctx.mrn} · {ctx.claims.length} claim{ctx.claims.length > 1 ? "s" : ""} in context</div>}
          {res ? (
            <div style={{ border:"1px solid #e6e9ee", borderRadius:12, padding:"12px 14px", marginBottom:10, background:"#FAFBFD" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}><button type="button" onClick={() => { setRes(null); setQ(""); setHot(0); if (inp.current) inp.current.focus(); }} style={{ display:"inline-flex", alignItems:"center", gap:4, border:"none", background:"#F3F6FA", borderRadius:999, padding:"2px 10px 2px 6px", cursor:"pointer", font:"500 12px/16px " + F, color:"#3A424A" }}><svg width="12" height="12" viewBox="0 0 12 12"><path d="M7.5 2.5L4 6l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>Back</button><span style={{ font:"400 12px/16px " + F, color:"#6A717D", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{res[0]}</span></div>
              {res[2] != null ? <><div style={{ font:"500 13px/18px " + F, color:"#1D4ED8", marginBottom:6 }}>{res[1]}</div><div style={{ font:"400 13px/20px " + F, color:"#1f2937", whiteSpace:"pre-wrap" }}>{res[2]}</div></> : <div style={{ font:"400 13px/20px " + F, color:"#1f2937" }}>{res[1]}</div>}
            </div>
          ) : null}
          <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
            {!res && <div style={{ font:"500 11px/16px " + F, color:"#8A94A6", letterSpacing:".06em", textTransform:"uppercase", margin:"2px 4px 4px" }}>{ctx ? "Suggested for this " + (ctx.kind === "collection" ? "collection" : "patient") : "Suggested"}</div>}
            {sugg.map((s, i) => (
              <button key={s} type="button" onClick={() => run(s)} onMouseEnter={() => setHot(i)} style={{ display:"flex", alignItems:"center", gap:10, textAlign:"left", border:"none", background:hot === i && !res ? "#F3F6FF" : "transparent", borderRadius:8, padding:"8px 10px", cursor:"pointer", font:"400 13px/18px " + F, color:"#1f2937" }}>
                <Spark size={13} id={"s" + i} />{s}
              </button>
            ))}
            {!sugg.length && <div style={{ padding:"8px 10px", font:"400 12px/16px " + F, color:"#8A94A6" }}>Press Enter to ask.</div>}
          </div>
        </div>
      )}
      <div style={{ display:"flex", alignItems:"center", gap:10, height:52, borderRadius:26, padding:open ? "0 8px 0 16px" : 0, width:open ? 380 : 52, justifyContent:open ? "flex-start" : "center", background:"#fff", boxShadow:"0 10px 30px rgba(66,133,244,0.28), 0 2px 8px rgba(15,23,42,0.12)", position:"relative", transition:"width .18s ease" }}>
        <span style={{ position:"absolute", inset:-2, borderRadius:28, background:GRAD, zIndex:-1 }}></span>
        <div style={{ position:"absolute", inset:0, borderRadius:26, background:"#fff", zIndex:-1 }}></div>
        {open ? <>
          <Spark size={20} id="b" />
          <input ref={inp} value={q} onChange={e => { setQ(e.target.value); setRes(null); setHot(0); }} onKeyDown={onKey} placeholder={ctx ? "Ask about " + ctx.name + "…" : "Ask or search…"} style={{ flex:1, minWidth:0, border:"none", outline:"none", background:"transparent", font:"400 14px/20px " + F, color:"#1f2937" }} />
          <span style={{ font:"500 11px/16px " + F, color:"#8A94A6", border:"1px solid #e2e8f0", borderRadius:4, padding:"1px 6px" }}>Esc</span>
          <button type="button" title="Close" onClick={() => setOpen(false)} style={{ width:36, height:36, border:"none", borderRadius:18, background:"#F3F6FA", cursor:"pointer", color:"#6A717D", fontSize:18, lineHeight:1 }}>×</button>
        </> : (
          <button type="button" title="Ask Neos (Ctrl+K)" onClick={() => setOpen(true)} style={{ width:52, height:52, border:"none", borderRadius:26, background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Spark size={26} id="c" />
            {ctx && <span style={{ position:"absolute", top:4, right:4, width:10, height:10, borderRadius:5, background:"#16A34A", border:"2px solid #fff" }}></span>}
          </button>
        )}
      </div>
    </div>
  );
}
const host = document.createElement("div"); document.body.appendChild(host);
ReactDOM.createRoot(host).render(<AIBar />);
})();
