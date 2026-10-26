// WellSky — Clickable Prototype
// Flow: Top nav (Dashboard / Eligibility / Authorization) swaps whole screens.
// Each screen has sub-tabs that swap the main content. Patient rows → detail (full Auth dashboard).
const { useState: useP } = React;

// ── Shared chrome (dark navy) ────────────────────────────────
function TopNav({ section, onSection, onLogo }) {
  const [builder, setBuilder] = useP(false);
  const [auditOpen, setAuditOpen] = useP(false);
  const [userMenuOpen, setUserMenuOpen] = useP(false);
  const [inspectOn, setInspectOn] = useP(()=>{ try { return localStorage.getItem("__inspectModeEnabled")==="1"; } catch(e){ return false; } });
  // Demo version — WellSky (full prototype) vs HCHB (hides pending-submission flows).
  const [demoVer, setDemoVer] = useP(()=>{ try { return localStorage.getItem("__demoVersion") || "wellsky"; } catch(e){ return "wellsky"; } });
  const [verMenu, setVerMenu] = useP(false);
  React.useEffect(()=>{ window.__demoVersion = demoVer; try { localStorage.setItem("__demoVersion", demoVer); } catch(e){}
    document.dispatchEvent(new CustomEvent("demoVersionChange",{detail:demoVer})); }, [demoVer]);
  // HCHB labels every "Ref ID" as "E5 ID"; WellSky keeps "Ref ID".
  React.useEffect(()=>{
    const RX = /\bRef\s?ID\b/gi;
    const orig = window.__e5Orig || (window.__e5Orig = new Map());
    const fixNode = (n) => {
      if (n.nodeType===3) { const v=n.nodeValue; if (v && RX.test(v)) { RX.lastIndex=0; if(!orig.has(n)) orig.set(n,{t:v}); else orig.get(n).t=v; n.nodeValue=v.replace(RX,"E5 ID"); } RX.lastIndex=0; return; }
      if (n.nodeType!==1 || n.tagName==="SCRIPT" || n.tagName==="STYLE") return;
      ["placeholder","title","aria-label"].forEach(a=>{ const v=n.getAttribute(a); if (v && RX.test(v)) { RX.lastIndex=0; const o=orig.get(n)||{attrs:{}}; o.attrs=o.attrs||{}; o.attrs[a]=v; orig.set(n,o); n.setAttribute(a, v.replace(RX,"E5 ID")); } RX.lastIndex=0; });
      const w=document.createTreeWalker(n, NodeFilter.SHOW_TEXT); let t; while((t=w.nextNode())) fixNode(t);
      n.querySelectorAll && n.querySelectorAll("[placeholder],[title],[aria-label]").forEach(el=>{ if(el!==n) ["placeholder","title","aria-label"].forEach(a=>{ const v=el.getAttribute(a); if (v && RX.test(v)) { RX.lastIndex=0; const o=orig.get(el)||{attrs:{}}; o.attrs=o.attrs||{}; o.attrs[a]=v; orig.set(el,o); el.setAttribute(a, v.replace(RX,"E5 ID")); } RX.lastIndex=0; }); });
    };
    if (window.__e5Obs) { window.__e5Obs.disconnect(); window.__e5Obs=null; }
    if (demoVer==="hchb") {
      fixNode(document.body);
      const obs = new MutationObserver(ms=>ms.forEach(m=>{ if (m.type==="characterData") fixNode(m.target); else if (m.type==="attributes") fixNode(m.target); else m.addedNodes.forEach(fixNode); }));
      obs.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["placeholder","title","aria-label"]});
      window.__e5Obs = obs;
    } else {
      orig.forEach((o,n)=>{ if (!n.isConnected) return; if (o.t!=null && n.nodeType===3 && /\bE5 ID\b/.test(n.nodeValue)) n.nodeValue=o.t; if (o.attrs) Object.keys(o.attrs).forEach(a=>n.setAttribute(a,o.attrs[a])); });
      orig.clear();
    }
  }, [demoVer]);
  React.useEffect(()=>{ if (window.__inspectMode) window.__inspectMode.setEnabled(inspectOn); }, []);
  const auditCloseTimer = React.useRef(null);
  const openAudit = () => { if (auditCloseTimer.current) { clearTimeout(auditCloseTimer.current); auditCloseTimer.current = null; } setAuditOpen(true); };
  const scheduleCloseAudit = () => { auditCloseTimer.current = setTimeout(() => setAuditOpen(false), 250); };
  const items = [
    { key: "dashboard",     label: "Dashboard"     },
    { key: "intake",        label: "Intake"        },
    { key: "eligibility",   label: "Eligibility"   },
    { key: "authorization", label: "Authorization" },
    { key: "cdm",           label: "CDM"           },
    { key: "assessments",   label: "Assessments"   },
    { key: "notifications", label: "Notifications" },
    { key: "preclaims",     label: "PCR"           },
    { key: "rcd",           label: "Claims"        },
    { key: "remits",        label: "Remits"        },
    { key: "docext",        label: "Doc Extraction" },
  ];
  const auditActive = section==="audit_f2f" || section==="audit_prebill";
  return (
    <div style={{height:72,background:"linear-gradient(to right, rgb(56,71,90) 0%, rgb(28,45,66) 100%)",display:"flex",alignItems:"center",padding:"0 32px",color:"#fff",gap:28,position:"relative"}}>
      <div style={{position:"absolute",bottom:0,left:32,right:32,height:1,background:"#4B586A"}}></div>
      <img src={(window.__resources&&window.__resources.neosLogo)||"../../assets/neos-logo.png"} style={{height:20,cursor:"pointer"}} alt="neos" onClick={onLogo} />
      <div style={{display:"flex",gap:28,marginLeft:20}}>
        {items.map(it=>{
          const act = section===it.key;
          return (
            <button key={it.key} onClick={()=>onSection(it.key)} style={{background:"transparent",border:"none",padding:"0 2px 0",cursor:"pointer",color:act?"#fff":"rgba(255,255,255,.55)",borderBottom:"2px solid transparent",font:`${act?500:400} 14px/18px Roboto`}}>{it.label}</button>
          );
        })}
        <div style={{position:"relative"}} onMouseEnter={openAudit} onMouseLeave={scheduleCloseAudit}>
          <button onClick={()=>{ if (auditCloseTimer.current) clearTimeout(auditCloseTimer.current); setAuditOpen(v=>!v); }} style={{background:"transparent",border:"none",padding:"0 2px 0",cursor:"pointer",color:auditActive?"#fff":"rgba(255,255,255,.55)",borderBottom:"2px solid transparent",font:`${auditActive?500:400} 14px/18px Roboto`,display:"inline-flex",alignItems:"center",gap:6}}>
            Audit <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{transform:auditOpen?"rotate(180deg)":"none",transition:"transform .12s"}}><path d="M6 9.5l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          {auditOpen && (
            <div style={{position:"absolute",top:"100%",left:0,paddingTop:16,minWidth:190,zIndex:50}}>
              <div style={{background:"#fff",borderRadius:6,boxShadow:"0 8px 24px rgba(6,17,33,.3)",overflow:"hidden"}}>
                {[["F2F Audit","audit_f2f"],["Pre-Bill Audit","audit_prebill"]].map(([label,key])=>(
                  <div key={key} onClick={()=>{ if (auditCloseTimer.current) clearTimeout(auditCloseTimer.current); onSection(key); setAuditOpen(false); }} style={{padding:"10px 16px",font:"400 13px/18px Roboto",color:section===key?"#1677FF":"#3A424A",cursor:"pointer",background:section===key?"#F0F5FF":"transparent"}}>{label}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{marginLeft:"auto",display:"flex",gap:18,alignItems:"center"}}>
        <img src={(window.__resources&&window.__resources.navReports)||"icons/nav-reports.svg"} alt="Reports" title="Reports" onClick={()=>window.__openReports && window.__openReports()} style={{height:25,width:81,cursor:"pointer",display:"block"}} />
        {window.ReportsDrawer && <window.ReportsDrawer section={section} />}
        <img src={(window.__resources&&window.__resources.navUserGuide)||"icons/nav-user-guide.svg"} alt="User Guide" title="User Guide" onClick={()=>window.open("NEOS%20User%20Guide.dc.html","_blank")} style={{height:28,width:28,cursor:"pointer",display:"block"}} />
        {window.ScreenBuilderDrawer && <window.ScreenBuilderDrawer open={builder} onClose={()=>setBuilder(false)} />}
        <div style={{position:"relative"}}>
          <div onClick={()=>setUserMenuOpen(v=>!v)} style={{width:28,height:28,borderRadius:"50%",background:"#C6A78F",display:"flex",alignItems:"center",justifyContent:"center",font:"500 12px Roboto",cursor:"pointer"}}>JM</div>
          {userMenuOpen && (
            <React.Fragment>
              <div onClick={()=>setUserMenuOpen(false)} style={{position:"fixed",inset:0,zIndex:59}} />
              <div style={{position:"absolute",top:"100%",right:0,paddingTop:12,minWidth:220,zIndex:60}}>
                <div style={{background:"#fff",borderRadius:8,boxShadow:"0 8px 24px rgba(6,17,33,.3)",overflow:"visible",padding:"6px 0"}}>
                  <div style={{padding:"10px 16px",font:"400 13px/18px Roboto",color:"#3A424A"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:8}}>
                      <span>Demo Version</span>
                    </div>
                    <div style={{position:"relative"}}>
                      <button type="button" onClick={()=>setVerMenu(v=>!v)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,background:"#fff",border:"1px solid #d8dee6",borderRadius:6,padding:"6px 10px",font:"400 13px/18px Roboto",color:"#3A424A",cursor:"pointer"}}>
                        <span>{demoVer==="hchb" ? "HCHB" : "WellSky"}</span>
                        <span style={{fontSize:11,color:"#64748b"}}>▾</span>
                      </button>
                      {verMenu && (
                        <div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:4,background:"#fff",border:"1px solid #e2e8f0",borderRadius:6,boxShadow:"0 8px 24px rgba(15,23,42,.14)",padding:4,zIndex:70}}>
                          {[["wellsky","WellSky"],["hchb","HCHB"]].map(([id,lbl])=>{
                            const sel = demoVer===id;
                            return <button key={id} type="button" onClick={()=>{ setDemoVer(id); setVerMenu(false); }} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:sel?"#eff6ff":"transparent",border:"none",borderRadius:4,padding:"7px 8px",font:`${sel?500:400} 13px/18px Roboto`,color:sel?"#1d4ed8":"#3A424A",cursor:"pointer",textAlign:"left"}}>
                              <span>{lbl}</span>{sel && <span style={{fontSize:11}}>✓</span>}
                            </button>;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{height:1,background:"#eef2f6",margin:"4px 0"}}></div>
                  <div onClick={()=>{ const v=!inspectOn; setInspectOn(v); if (window.__inspectMode) window.__inspectMode.setEnabled(v); }} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"10px 16px",cursor:"pointer",font:"400 13px/18px Roboto",color:"#3A424A"}}>
                    <span>Inspect Mode</span>
                    <span style={{width:32,height:18,borderRadius:999,background:inspectOn?"#1677FF":"#d1d5db",position:"relative",flexShrink:0,transition:"background .15s"}}>
                      <span style={{position:"absolute",top:2,left:inspectOn?16:2,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left .15s"}} />
                    </span>
                  </div>
                  <div style={{height:1,background:"#eef2f6",margin:"4px 0"}}></div>
                  <div onClick={()=>{ setUserMenuOpen(false); setBuilder(true); }} title="Generate a prompt for a new screen" style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",cursor:"pointer",font:"400 13px/18px Roboto",color:"#3A424A"}}>
                    <span style={{fontSize:15}}>📖</span>
                    <span>Screen Builder</span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Section header band (contains sub-tabs + review toggle + download) ─
function SectionBand({ title, subTabs, activeSub, onSub, review, onReview, showReview, breadcrumb, onBack, bulk, onBulk, bulkApi, bulkKind, onBulkKind }) {
  const [bulkMenu, setBulkMenu] = useP(false);
  return (
    <div style={{background:"linear-gradient(to right, rgb(56,71,90) 0%, rgb(28,45,66) 100%)",padding:"18px 32px 16px",color:"#fff"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,font:"500 20px/24px Roboto"}}>
        {breadcrumb
          ? (<div style={{display:"flex",alignItems:"center",gap:8,font:"400 14px/20px Roboto",color:"rgba(255,255,255,.7)"}}>
              <span style={{cursor:"pointer"}} onClick={onBack}>{breadcrumb[0]}</span>
              <span style={{opacity:.5}}>/</span>
              <span style={{color:"#fff",font:"500 20px/24px Roboto"}}>{breadcrumb[1]}</span>
            </div>)
          : <span>{title}</span>}
      </div>
      <div style={{display:"flex",gap:12,alignItems:"center",marginTop:14,position:"relative"}}>
        {bulk && bulkApi && (
          <div style={{position:"absolute",left:"50%",top:-6,transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:12,background:"#fff",borderRadius:999,padding:"7px 10px 7px 18px",boxShadow:"0 8px 24px rgba(6,17,33,.35)",zIndex:20,whiteSpace:"nowrap"}}>
            <span style={{font:"500 13px/18px Roboto",color:"#0f172a"}}>{bulkApi.count} selected</span>
            {(bulkKind ? bulkKind==="review" : review)
              ? <button type="button" disabled={!bulkApi.count} onClick={bulkApi.markReviewed} style={{background:bulkApi.count?"#1677FF":"#f4f6f9",border:"none",borderRadius:999,padding:"7px 16px",font:"500 13px/18px Roboto",color:bulkApi.count?"#fff":"#b6bcc6",cursor:bulkApi.count?"pointer":"default"}}>Mark as Reviewed</button>
              : <button type="button" disabled={!bulkApi.count} onClick={bulkApi.terminate} style={{background:bulkApi.count?"#FFF1F0":"#f4f6f9",border:`1px solid ${bulkApi.count?"#FFA39E":"#e2e8f0"}`,borderRadius:999,padding:"6px 14px",font:"500 13px/18px Roboto",color:bulkApi.count?"#CF1322":"#b6bcc6",cursor:bulkApi.count?"pointer":"default"}}>Terminate</button>}
            <button type="button" onClick={onBulk} title="Close bulk selection" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:20,height:20,borderRadius:"50%",border:"none",background:"#f1f3f5",color:"#64748b",font:"400 13px/1 Roboto",cursor:"pointer",padding:0}}>✕</button>
          </div>
        )}
        {subTabs.map((t,i)=>{
          if (t.hidden) return null;
          const idx = t.id !== undefined ? t.id : i;
          const act = activeSub===idx;
          return (
            <button key={t.label} onClick={()=>onSub(idx)} style={{background:act?"#1677FF":"rgba(208,217,229,0.11)",color:"#fff",border:"none",borderRadius:4,padding:"6px 14px",font:`${act?500:400} 13px/18px Roboto`,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8}}>
              {t.icon && <span style={{opacity:.9,fontSize:13}}>{t.icon}</span>}{t.label}
            </button>
          );
        })}
        {showReview && (
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:12}}>
            {onBulkKind && !bulk && (
              <React.Fragment>
                <span style={{position:"relative",display:"inline-flex",alignItems:"center",gap:7}}>
                  <span onClick={()=>setBulkMenu(v=>!v)} style={{color:"#fff",font:"400 13px Roboto",cursor:"pointer",opacity:.85}}>Bulk Selection</span>
                  <span onClick={()=>setBulkMenu(v=>!v)} title="Bulk actions" style={{color:"#fff",opacity:.85,cursor:"pointer",display:"inline-flex",transform:bulkMenu?"rotate(180deg)":"none"}}>
                    <svg width="10" height="7" viewBox="0 0 10 7" fill="none"><path d="M1 1.5L5 5.5L9 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  {bulkMenu && (
                    <React.Fragment>
                      <span onClick={()=>setBulkMenu(false)} style={{position:"fixed",inset:0,zIndex:39}}></span>
                      <span style={{position:"absolute",top:"calc(100% + 9px)",right:0,zIndex:40,background:"#fff",borderRadius:6,boxShadow:"0 10px 28px rgba(6,17,33,.28)",padding:"5px 0",minWidth:168,display:"flex",flexDirection:"column"}}>
                        {[["terminate","Bulk Terminate"],["review","Bulk Review"]].map(([k,l])=>(
                          <span key={k} onClick={()=>{ setBulkMenu(false); onBulkKind(k); }}
                            style={{font:"400 13px/18px Roboto",color:"#0f172a",padding:"9px 16px",cursor:"pointer",whiteSpace:"nowrap"}}>{l}</span>
                        ))}
                      </span>
                    </React.Fragment>
                  )}
                </span>
                <span style={{width:1,height:16,background:"#fff",opacity:.5}}></span>
              </React.Fragment>
            )}
            <span style={{color:"#fff",font:"400 13px Roboto"}}>Review Mode</span>
            <button onClick={onReview} style={{width:32,height:18,borderRadius:999,background:review?"#1677FF":"rgba(255,255,255,.3)",border:"none",cursor:"pointer",position:"relative",padding:0}}>
              <span style={{position:"absolute",top:2,left:review?16:2,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left .15s"}}></span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Home / landing tiles ─────────────────────────────────────
function Home({ onGo }) {
  const tiles = [
    { key:"dashboard",     label:"Dashboard",         desc:"Eligibility overview, alerts and action items", icon:"📊" },
    { key:"intake",        label:"Intake",            desc:"Referral, pre-eligibility and patient intake", icon:"📥" },
    { key:"eligibility",   label:"Eligibility",       desc:"Request status, summary and patient view",      icon:"🩺" },
    { key:"authorization", label:"Authorization",     desc:"Patient auth summary, requests and recert",     icon:"📑" },
    { key:"notifications", label:"Notifications",     desc:"Assessment notifications, tasks and reports",   icon:"🔔" },
    { key:"rcd",           label:"Claims",            desc:"PCR, claim requests and payer batches",          icon:"🗂" },
  ];
  return (
    <div style={{padding:"56px 32px",maxWidth:1200,margin:"0 auto"}}>
      <div style={{font:"500 28px/34px Roboto",color:"#3A424A",marginBottom:6}}>Welcome back, Jessica</div>
      <div style={{font:"400 14px/20px Roboto",color:"#6A717D",marginBottom:32}}>Open any area to start working. Your top nav swaps here too.</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:20}}>
        {tiles.map(t=>(
          <div key={t.key} onClick={()=>onGo(t.key)} style={{border:"1px solid #E8E9EA",borderRadius:8,padding:"22px 22px 26px",background:"#fff",cursor:"pointer",transition:"box-shadow .12s"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 8px 22px rgba(28,45,66,.09)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
            <div style={{fontSize:28,marginBottom:12}}>{t.icon}</div>
            <div style={{font:"500 18px/22px Roboto",color:"#3A424A"}}>{t.label}</div>
            <div style={{font:"400 13px/18px Roboto",color:"#6A717D",marginTop:6}}>{t.desc}</div>
            <div style={{marginTop:14,font:"500 13px Roboto",color:"#1677FF"}}>Open →</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ELIGIBILITY SECTION ──────────────────────────────────────
function EligibilitySection({ sub, onSub, onPatient, alertFilter, onClearAlert, openManageRow, onManageRowOpened, eligFilters, onRefClick }) {
  // HCHB demo version has no Eligibility Batch View.
  const [hchbVer, setHchbVer] = useP(()=>(typeof window!=="undefined" && window.__demoVersion==="hchb"));
  React.useEffect(()=>{ const h=()=>setHchbVer(window.__demoVersion==="hchb"); document.addEventListener("demoVersionChange",h); return ()=>document.removeEventListener("demoVersionChange",h); },[]);
  React.useEffect(()=>{ if (!hchbVer && sub===0) onSub(3); if (hchbVer && sub===3) onSub(0); },[hchbVer, sub]);
  // HCHB demo version uses its own Eligibility screen set (hchb/*.jsx).
  const HNS = hchbVer && window.HCHB;
  const ERVComp = (HNS && HNS.EligibilityRequestView) || EligibilityRequestView;
  const EBVComp = (HNS && HNS.EligibilityBatchView) || EligibilityBatchView;
  const subTabs = [
    { label: "Patient Eligibility Summary View", icon: "▦", id: 3, hidden: hchbVer },
    { label: "Eligibility Batch View",   icon: "☰", id: 0, hidden: !hchbVer },
    { label: "Eligibility Request View", icon: "☰", id: 1 },
    { label: "Alert Adjudication",       icon: "☰", id: 4 },
    { label: "Automation Log",           icon: "",  id: 2 },
  ];
  const [review, setReview] = useP(false);
  // WellSky has no Alert / HO Intake grids — dashboard drill-ins render the HCHB section grid.
  const [secFocus, setSecFocus] = useP(()=>{ const f=window.__ervFocus; return f && !f.used && !hchbVer ? f.section : null; });
  React.useEffect(()=>{ if (sub!==1) setSecFocus(null); },[sub]);
  const [batchFileFilter, setBatchFileFilter] = useP(null);
  const [batchRecords, setBatchRecords] = useP(null);
  return (
    <div>
      <SectionBand title="Eligibility Center" subTabs={subTabs} activeSub={sub} onSub={onSub} showReview={sub===1} review={review} onReview={()=>setReview(v=>!v)} />
      {sub===3
        ? (window.EligibilitySummaryView
            ? <window.EligibilitySummaryView onPatient={onPatient} sharedInitDate={eligFilters&&eligFilters.initDate} setSharedInitDate={eligFilters&&eligFilters.setInitDate} sharedFieldFilters={eligFilters&&eligFilters.fieldFilters} setSharedFieldFilters={eligFilters&&eligFilters.setFieldFilters} />
            : <div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Loading patient eligibility summary view…</div>)
        : sub===4
        ? (window.HCHB && window.HCHB.ERVSectionGrid
            ? <div style={{background:"#fff",maxWidth:"100%"}}><window.HCHB.ERVSectionGrid section="alert" onPatient={onPatient} /></div>
            : <div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Loading alert adjudication…</div>)
        : sub===1 && secFocus && window.HCHB && window.HCHB.ERVSectionGrid
        ? <div style={{background:"#fff",maxWidth:"100%"}}><window.HCHB.ERVSectionGrid section={secFocus} onPatient={onPatient} onSection={(s)=>setSecFocus(s==="ntm"||s==="pre"?null:s)} /></div>
        : sub===1
        ? <ERVComp batchFilter={batchRecords} onClearBatch={()=>setBatchRecords(null)} onViewBatch={(bf)=>{ setBatchFileFilter(bf.file); setBatchRecords(null); onSub(0); }} onPatient={onPatient} review={review} onExitReview={()=>setReview(false)} alertFilter={alertFilter} onClearAlert={onClearAlert} openManageRow={openManageRow} onManageRowOpened={onManageRowOpened} sharedInitDate={eligFilters&&eligFilters.initDate} setSharedInitDate={eligFilters&&eligFilters.setInitDate} sharedFieldFilters={eligFilters&&eligFilters.fieldFilters} setSharedFieldFilters={eligFilters&&eligFilters.setFieldFilters} sharedFollowUp={eligFilters&&eligFilters.followUp} setSharedFollowUp={eligFilters&&eligFilters.setFollowUp} sharedEligEntries={eligFilters&&eligFilters.eligEntries} setSharedEligEntries={eligFilters&&eligFilters.setEligEntries} />
        : sub===0
        ? <EBVComp fileFilter={batchFileFilter} onClearFileFilter={()=>setBatchFileFilter(null)} onTotalRecords={(row)=>{ setBatchRecords({ batch:row.batch, file:row.file, ids:row.members || null, total:row.total }); onSub(1); }} />
        : <ERVAutomationLogView onRefClick={onRefClick} />}
    </div>
  );
}

// ── INTAKE SECTION ────────────────────────────────────────────
function IntakeSection({ sub, onSub }) {
  const subTabs = [
    { label: "E-referral",       icon: ""  },
    { label: "Patient intake",   icon: ""  },
    { label: "Automation Log",   icon: ""  },
  ];
  const [review, setReview] = useP(false);
  const EReferral = typeof window !== "undefined" && window.IntakeEReferralView;
  const PatientIn = typeof window !== "undefined" && window.IntakePatientView;
  const AutoLog   = typeof window !== "undefined" && window.IntakeAutomationLogView;
  const loading = (what)=><div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Loading {what}…</div>;
  return (
    <div>
      <SectionBand title="Intake Center" subTabs={subTabs} activeSub={sub} onSub={onSub} showReview={sub!==2} review={review} onReview={()=>setReview(v=>!v)} />
      {sub===0 && (EReferral ? <EReferral review={review} /> : loading("E-referral view"))}
      {sub===1 && (PatientIn ? <PatientIn review={review} /> : loading("Patient intake view"))}
      {sub===2 && (AutoLog ? <AutoLog onRefClick={()=>{}} /> : loading("log"))}
    </div>
  );
}

// ── DOC EXTRACTION SECTION ─────────────────────────────────
function DocExtractionSection({ sub, onSub }) {
  const subTabs = [
    { label: "Doc Extraction View", icon: "☰" },
    { label: "Automation Log",      icon: ""  },
  ];
  const [review, setReview] = useP(false);
  const View = window.DocExtractionView, Log = window.DocExtractionAutomationLog;
  const loading = <div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Loading…</div>;
  return (
    <div>
      <SectionBand title="Documents Extraction Center" subTabs={subTabs} activeSub={sub} onSub={onSub} showReview={sub===0} review={review} onReview={()=>setReview(v=>!v)} />
      {sub===0 ? (View ? <View review={review} /> : loading) : (Log ? <Log /> : loading)}
    </div>
  );
}

// ── CDM SECTION ─────────────────────────────────────────────
function CDMSection({ sub, onSub }) {
  const subTabs = [
    { label: "CDM Request View", icon: "☰" },
    { label: "Automation Log",   icon: ""  },
  ];
  const [review, setReview] = useP(false);
  const CDMReqView = typeof window !== "undefined" && window.CDMRequestView;
  const CDMAutoLog = typeof window !== "undefined" && window.CDMAutomationLogView;
  return (
    <div>
      <SectionBand title="CDM Center" subTabs={subTabs} activeSub={sub} onSub={onSub} showReview={true} review={review} onReview={()=>setReview(v=>!v)} />
      {sub===0
        ? (CDMReqView ? <CDMReqView review={review} /> : <div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Loading CDM view…</div>)
        : (CDMAutoLog ? <CDMAutoLog /> : <div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Loading log…</div>)}
    </div>
  );
}

// ── REMITS SECTION ──────────────────────────────────────────
function RemitsSection({ sub, onSub }) {
  const subTabs = [
    { label: "Denial Management", icon: "☰" },
    { label: "Cash Posting",      icon: "▦" },
    { label: "Automation Log",    icon: ""  },
  ];
  const [review, setReview] = useP(false);
  const Denial = typeof window !== "undefined" && window.RemitsDenialView;
  const Cash = typeof window !== "undefined" && window.RemitsCashPostingView;
  const AutoLog = typeof window !== "undefined" && window.RemitsAutomationLogView;
  const loading = (what)=><div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Loading {what}…</div>;
  return (
    <div>
      <SectionBand title="Remits Center" subTabs={subTabs} activeSub={sub} onSub={onSub} showReview={sub===0} review={review} onReview={()=>setReview(v=>!v)} />
      {sub===0 && (Denial ? <Denial review={review} /> : loading("Denial Management"))}
      {sub===1 && (Cash ? <Cash /> : loading("Cash Posting"))}
      {sub===2 && (AutoLog ? <AutoLog /> : loading("log"))}
    </div>
  );
}

// ── NOTIFICATIONS SECTION ────────────────────────────────────
function NotificationsSection({ sub, onSub, focus }) {
  const subTabs = [
    { label: "Notifications View", icon: "☰" },
    { label: "Automation Log",             icon: ""  },
  ];
  const [review, setReview] = useP(false);
  const ReqView = typeof window !== "undefined" && window.NotificationsRequestView;
  const AutoLog = typeof window !== "undefined" && window.NotificationsAutomationLogView;
  return (
    <div>
      <SectionBand title="Notifications Center" subTabs={subTabs} activeSub={sub} onSub={onSub}
        showReview={true} review={review} onReview={()=>setReview(v=>!v)} />
      {sub===0
        ? (ReqView ? <ReqView review={review} onExitReview={()=>setReview(false)} focus={focus} /> : <div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Loading Notifications view…</div>)
        : (AutoLog ? <AutoLog onRefClick={()=>onSub(0)} /> : <div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Loading log…</div>)}
    </div>
  );
}

// ── RCD SECTION ─────────────────────────────────────────────
function RCDSection({ sub, onSub, naGroupFocus }) {
  const subTabs = [
    { label: "Claim Status View", icon: "☰" },
    { label: "Claim Batch View",   icon: "▦" },
    { label: "Automation Log",     icon: ""  },
  ];
  const [review, setReview] = useP(false);
  const [logFocus, setLogFocus] = useP(null);
  const ReqView = typeof window !== "undefined" && window.RCDRequestView;
  const AutoLog = typeof window !== "undefined" && window.RCDAutomationLogView;
  const ClaimReq = typeof window !== "undefined" && window.ClaimStatusView;
  const ClaimBatch = typeof window !== "undefined" && window.ClaimBatchView;
  const loading = (what)=><div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Loading {what}…</div>;
  return (
    <div>
      <SectionBand title="Claim Center" subTabs={subTabs} activeSub={sub} onSub={onSub}
        showReview={true} review={review} onReview={()=>setReview(v=>!v)} />
      {sub===0 && (ClaimReq ? <ClaimReq review={review} onExitReview={()=>setReview(false)} /> : loading("claim status view"))}
      {sub===1 && (ClaimBatch ? <ClaimBatch review={review} onExitReview={()=>setReview(false)} /> : loading("claim batch view"))}
      {sub===2 && (AutoLog ? <AutoLog onlyClaims={true} onRefClick={(id)=>{ setLogFocus(id); onSub(0); }} /> : loading("log"))}
    </div>
  );
}

// ── PRE-CLAIMS SECTION (Claim Center minus Claim Status / Batch views) ──
function PreClaimsSection({ sub, onSub, naGroupFocus, onPatient }) {
  const subTabs = [
    { label: "PCR View",       icon: "☰" },
    { label: "Automation Log", icon: ""  },
  ];
  const [review, setReview] = useP(false);
  // Dashboard action items only list unreviewed alerts, so arriving from one
  // lands in review mode.
  React.useEffect(()=>{ if (naGroupFocus) { setReview(true); setNavScoped(true); } },[naGroupFocus]);
  const [navScoped, setNavScoped] = useP(false);
  const [bulk, setBulk] = useP(false);
  const [bulkApi, setBulkApi] = useP(null);
  const [bulkKind, setBulkKind] = useP("terminate");
  const [logFocus, setLogFocus] = useP(null);
  const ReqView = typeof window !== "undefined" && window.RCDRequestView;
  const AutoLog = typeof window !== "undefined" && window.RCDAutomationLogView;
  const loading = (what)=><div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Loading {what}…</div>;
  return (
    <div>
      <SectionBand title="Pre-Claims Review Center" subTabs={subTabs} activeSub={sub} onSub={onSub}
        showReview={sub===0} review={review} onReview={()=>{ setNavScoped(false); setReview(v=>!v); }}
        bulk={sub===0 ? bulk : undefined} onBulk={sub===0 ? (()=>{ setBulk(false); setBulkApi(null); }) : undefined}
        bulkKind={bulkKind} onBulkKind={sub===0 ? ((k)=>{ setBulkKind(k); setBulk(true); }) : undefined} bulkApi={bulkApi} />
      {sub===0 && (ReqView ? <ReqView review={review} reviewUnreviewedOnly={navScoped} onExitReview={()=>{ setNavScoped(false); setReview(false); }} focusId={logFocus} naGroupFocus={naGroupFocus} bulkMode={bulk} bulkKind={bulkKind} onBulkApi={setBulkApi} onPatient={onPatient} onExitBulk={()=>setBulk(false)} /> : loading("PCR view"))}
      {sub===1 && (AutoLog ? <AutoLog hideTabs={true} onRefClick={(id)=>{ const r=(window.RCD_ROWS||[]).find(x=>x.id===id); if(r) onPatient && onPatient(r, true); else { setLogFocus(id); onSub(0); } }} /> : loading("log"))}
    </div>
  );
}

// ── ASSESSMENTS SECTION ──────────────────────────────────────
function AssessmentsSection({ sub, onSub, logFocus, onLogFocus, onClearLogFocus }) {
  const subTabs = [
    { label: "Assessment Request View", icon: "☰" },
    { label: "Automation Log",          icon: ""  },
  ];
  const [review, setReview] = useP(false);
  const ReqView = typeof window !== "undefined" && window.AssessmentRequestView;
  const AutoLog = typeof window !== "undefined" && window.AssessmentAutomationLogView;
  return (
    <div>
      <SectionBand title="Assessment Center" subTabs={subTabs} activeSub={sub} onSub={onSub} showReview={true} review={review} onReview={()=>setReview(v=>!v)} />
      {sub===0
        ? (ReqView ? <ReqView review={review} onPatient={(row)=>{ onLogFocus(row.id); onSub(1); }} /> : <div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Loading Assessment view…</div>)
        : (AutoLog ? <AutoLog focusId={logFocus} onClearFocus={onClearLogFocus} /> : <div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Loading log…</div>)}
    </div>
  );
}

// ── AUTHORIZATION SECTION ─────────────────────────────────────
// Patient Auth Summary View — patient-level roll-up (own column set per the
// Figma "Patient summary view - main"). No accordion; no Pyr Resp / Follow-up /
// AT Status / Auth Status. Recert Status, Expiring Auth(s) and Expired Auth(s)
// are three INDEPENDENT columns — a row may carry any combination. The five
// summary cards are clickable filters whose counts derive from the rows.

const pasRows = [
  { key:"p1", authInit:"04/15/25",  name:"Marvin Mckinney",    mrn:"B6100062245601", agency:"Agency 1", branch:"Bcode", mid:"11521357", src:"Aetna Medicare",   type:"Mcare Adv", gateway:"Carelon",  soc:"01/15/25",  epiSt:"01/15/25", epiId:"Epi23456", sum:{r:"06",a:"06",d:"-",p:"-"},  recert:"current",  expiring:false, expired:false },
  { key:"p2", authInit:"04/16/25",  name:"Esther Howard",      mrn:"B6789012345678", agency:"Agency 1", branch:"Bcode", mid:"55493027", src:"Star + Plus Heal", type:"Medicare",  gateway:"-",        soc:"01/15/25",  epiSt:"3/22/25",  epiId:"I1J2K3L4", sum:{r:"12",a:"06",d:"-",p:"06"}, recert:"",         expiring:false, expired:false },
  { key:"p3", authInit:"04/17/25",  name:"Wade Warren",        mrn:"B6789012345685", agency:"Agency 1", branch:"Bcode", mid:"49625034", src:"UHC -  AARP M..",  type:"Mcare Adv", gateway:"UHC",      soc:"01/17/25",  epiSt:"03/30/25", epiId:"TY964257", sum:{r:"-",a:"-",d:"-",p:"-"},   recert:"current",  expiring:false, expired:false },
  { key:"p4", authInit:"04/19/25",  name:"Cameron Williamson", mrn:"B6100054445634", agency:"Agency 1", branch:"Bcode", mid:"97014890", src:"Aetna Gold Plu..", type:"Mcare Adv", gateway:"Carelon",  soc:"01/18/25",  epiSt:"04/04/25", epiId:"K7L8M9N0", sum:{r:"34",a:"34",d:"-",p:"-"},  recert:"current",  expiring:false, expired:false },
  { key:"p5", authInit:"04/18/25",  name:"Robert Fox",         mrn:"V6789012345686", agency:"Agency 1", branch:"Bcode", mid:"69420061", src:"HumanaChoice..",   type:"Mcare Adv", gateway:"Availity", soc:"04/18/25",  epiSt:"04/18/25", epiId:"G3H4I5J6", sum:{r:"28",a:"28",d:"-",p:"-"},  recert:"due",      expiring:true,  expired:false },
  { key:"p6", authInit:"04/24/25",  name:"Jenny Wilson",       mrn:"B6789012345711", agency:"Agency 1", branch:"Bcode", mid:"43242523", src:"Humana Gold P..",  type:"Mcare Adv", gateway:"Availity", soc:"01/21/25",  epiSt:"04/04/25", epiId:"M5N6O7P8", sum:{r:"56",a:"32",d:"24",p:"-"}, recert:"current",  expiring:false, expired:false },
  { key:"p7", authInit:"04/21/25",  name:"Jacob Jones",        mrn:"B6789012345716", agency:"Agency 1", branch:"Bcode", mid:"10434991", src:"Anthem Adv..",     type:"Mcare Adv", gateway:"Carelon",  soc:"01/15/25",  epiSt:"03/16/25", epiId:"Y7Z8A9B0", sum:{r:"64",a:"64",d:"-",p:"-"},  recert:"past_due", expiring:true,  expired:true, reviewed:true },
  { key:"p8", authInit:"04/22/25",  name:"Leslie Alexander",   mrn:"B6789012345697", agency:"Agency 1", branch:"Bcode", mid:"76722340", src:"Humana Gold P..",  type:"Mcare Adv", gateway:"Availity", soc:"01/15/25",  epiSt:"05/12/25", epiId:"S5T6U7V8", sum:{r:"03",a:"-",d:"-",p:"03"},  recert:"current",  expiring:false, expired:false },
  { key:"p9", authInit:"04/23/25",  name:"Guy Hawkins",        mrn:"L700093345918",  agency:"Agency 1", branch:"Bcode", mid:"30214786", src:"Humana Gold P..",  type:"Mcare Adv", gateway:"Availity", soc:"01/203/25", epiSt:"04/17/25", epiId:"A3B4C5D6", sum:{r:"14",a:"-",d:"-",p:"14"},  recert:"current",  expiring:true,  expired:false },
  { key:"p10", authInit:"04/20/25", name:"Jane Cooper",        mrn:"B6789012345720", agency:"Agency 1", branch:"Bcode", mid:"42512413", src:"Humana Gold P..",  type:"Mcare Adv", gateway:"Availity", soc:"04/01/25",  epiSt:"04/01/25", epiId:"Q9R0S1T2", sum:{r:"29",a:"15",d:"-",p:"-"},  recert:"current",  expiring:false, expired:false },
  { key:"p11", authInit:"04/25/25", name:"Kristin Watson",     mrn:"B6789012345801", agency:"Agency 1", branch:"Bcode", mid:"20481123", src:"UHC - AARP M..",  type:"Medicare",  gateway:"UHC",      soc:"01/17/25",  epiSt:"03/30/25", epiId:"TY964257", sum:{r:"12",a:"-",d:"-",p:"-"},  recert:"due",      expiring:false, expired:false },
  { key:"p12", authInit:"04/26/25", name:"Cody Fisher",        mrn:"B6789012345802", agency:"Agency 1", branch:"Bcode", mid:"20481124", src:"Aetna Gold Plu..", type:"Medicare",  gateway:"Carelon",  soc:"01/18/25",  epiSt:"04/04/25", epiId:"K7L8M9N0", sum:{r:"34",a:"34",d:"-",p:"-"},  recert:"current",  expiring:false, expired:false },
  { key:"p13", authInit:"04/27/25", name:"Kathryn Murphy",     mrn:"B6789012345803", agency:"Agency 1", branch:"Bcode", mid:"20481125", src:"HumanaChoice..",   type:"Medicare",  gateway:"Availity", soc:"04/18/25",  epiSt:"04/18/25", epiId:"G3H4I5J6", sum:{r:"28",a:"28",d:"-",p:"-"},  recert:"current",  expiring:true,  expired:false },
  { key:"p14", authInit:"04/28/25", name:"Devon Lane",         mrn:"B6789012345804", agency:"Agency 1", branch:"Bcode", mid:"20481126", src:"Humana Gold P..",  type:"Medicare",  gateway:"Availity", soc:"01/21/25",  epiSt:"04/04/25", epiId:"M5N6O7P8", sum:{r:"56",a:"32",d:"24",p:"-"}, recert:"due",      expiring:false, expired:false },
  { key:"p15", authInit:"04/29/25", name:"Dianne Russell",     mrn:"B6789012345805", agency:"Agency 1", branch:"Bcode", mid:"20481127", src:"Anthem Adv..",     type:"Medicare",  gateway:"Carelon",  soc:"01/15/25",  epiSt:"03/16/25", epiId:"Y7Z8A9B0", sum:{r:"64",a:"64",d:"-",p:"-"},  recert:"past_due", expiring:false, expired:true  },
  { key:"p16", authInit:"04/30/25", name:"Arlene McCoy",       mrn:"B6789012345806", agency:"Agency 1", branch:"Bcode", mid:"20481129", src:"Humana Gold P..",  type:"Medicare",  gateway:"Availity", soc:"01/15/25",  epiSt:"05/12/25", epiId:"S5T6U7V8", sum:{r:"03",a:"-",d:"-",p:"03"},  recert:"current",  expiring:false, expired:false },
];
// Expose Patient Auth Summary rows so the Dashboard's Action Items panel can
// derive recert / expiring counts from the same source as the Authorization tab.
if (typeof window !== "undefined") window.pasRows = pasRows;

// Summary-card definitions. `count(rows)` derives the number so cards always
// match the table; `match(row)` is the filter predicate.
const PAS_CARDS = [
  { id:"all",      label:"All Patients",        color:"rgb(21,95,130)",  chip:"All Patients",           count:(rows)=>rows.length,                              match:()=>true },
  { id:"past_due", label:"Past Due for Recert", color:"rgb(102,96,166)", chip:"Recert: Past Due",       count:(rows)=>rows.filter(r=>r.recert==="past_due").length, match:(r)=>r.recert==="past_due" },
  { id:"due",      label:"Due for Recert",      color:"rgb(196,112,151)",chip:"Recert: Due",            count:(rows)=>rows.filter(r=>r.recert==="due").length,      match:(r)=>r.recert==="due" },
  { id:"expiring", label:"Expiring Auths",      color:"rgb(215,137,90)", chip:"Expiring Auths",         count:(rows)=>rows.filter(r=>r.expiring).length,            match:(r)=>!!r.expiring },
  { id:"expired",  label:"Expired Auths",       color:"rgb(207,19,34)",  chip:"Expired Auths",          count:(rows)=>rows.filter(r=>r.expired).length,             match:(r)=>!!r.expired },
];
const pad2 = (n) => String(n).padStart(2,"0");

// Field config for the "Add More Filters" popover (Patient Auth Summary).
const PAS_FILTER_FIELDS = [
  { key:"agency",  label:"Agency" },
  { key:"branch",  label:"Branch" },
  { key:"src",     label:"Payor Source" },
  { key:"type",    label:"Payor Type" },
  { key:"gateway", label:"Gateway" },
];

// ── Docs Slideout ───────────────────────────────────────────
function DocsSlideout({ row, entry, fromDetail, onClose }) {
  const [tab, setTab] = React.useState("request");
  // Derive real metadata from row + optional entry
  const refId = (entry&&entry.authNo) || row.auth || row.refId || ("REF"+String(row.key||"").replace(/\D/g,"").padStart(10,"0").slice(0,10));
  const payorAuthId = row.mid || row.memId || row.memberId || "-";
  const authType = row.type || (entry&&entry.type) || "-";
  const svc = (entry&&entry.lines&&entry.lines.length ? [...new Set(entry.lines.map(l=>l.svc).filter(Boolean))].join(", ") : null) || row.svc || "SN, PT";
  const isPcr = !!row.__pcr;
  const requestDocs = isPcr
    ? [{ date:"04/26/25", name:"PCR sheet" },{ date:"04/26/25", name:"Oasis.pdf" },{ date:"04/26/25", name:"Plan of Care" }]
    : [{ date:"04/26/25", name:"Auth Request Doc" }];
  const responseDocs = isPcr
    ? [{ date:"04/26/25", name:"Decision letter" }]
    : [{ date:"04/26/25", name:"Payor Auth Response" }];
  const docs = tab==="request" ? requestDocs : responseDocs;
  const meta = isPcr
    ? [["Ref Id", row.refId || row.dcn || "-"],["Patient Name", row.name || "-"],["MRN", row.mrn || "-"]]
    : [["REF ID",refId],["Payor Auth ID",payorAuthId],["Auth Type",authType],["Service Type",svc]];
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.18)"}} />
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:480,background:"#fff",zIndex:901,display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.13)",animation:"docsSlide .22s cubic-bezier(0.32,0.72,0,1)"}}>
      <style>{`@keyframes docsSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"22px 24px 16px"}}>
          <span style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Documents</span>
          <button onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",padding:4,color:"#64748b",font:"400 18px/18px Roboto"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:isPcr?"1fr 1fr 1fr":"1fr 1fr 1fr 1fr",gap:"0 16px",padding:"0 24px 16px",borderBottom:"1px solid #e5e7eb"}}>
          {meta.map(([l,v])=>(
            <div key={l}>
              <div style={{font:"400 11px/14px Roboto",color:"#94a3b8",marginBottom:2}}>{l}</div>
              <div style={{font:"500 13px/18px Roboto",color:"#0f172a"}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",padding:"0 24px",borderBottom:"1px solid #e5e7eb",gap:0}}>
          {["request","response"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{border:"none",background:"transparent",padding:"12px 0",marginRight:20,cursor:"pointer",font:"500 13px/16px Roboto",color:tab===t?"#2563eb":"#475569",borderBottom:tab===t?"2px solid #2563eb":"2px solid transparent"}}>
              {t==="request"?"Request Docs":"Response Docs"}
            </button>
          ))}
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,color:"#2563eb",font:"500 13px/16px Roboto",cursor:"pointer"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 16l-5-5h3V4h4v7h3l-5 5z" fill="#2563eb"/><path d="M5 20h14" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/></svg>
            Download All
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 24px"}}>
          {docs.map((g,gi)=>(
            <div key={gi}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="#2563eb" strokeWidth="1.8"/><path d="M3 9h18" stroke="#2563eb" strokeWidth="1.8"/><circle cx="7" cy="6.5" r="1" fill="#2563eb"/><circle cx="10" cy="6.5" r="1" fill="#2563eb"/></svg>
                <span style={{font:"600 13px/16px Roboto",color:"#0f172a"}}>{g.date}</span>
              </div>
              <div style={{border:"1px solid #e5e7eb",borderRadius:6,padding:"14px 16px",display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <img src={(window.__resources&&window.__resources.attachmentType)||"icons/attachment-type.svg"} width={16} height={16} alt="" />
                <span style={{flex:1,font:"400 13px/18px Roboto",color:"#0f172a"}}>{g.name}</span>
                <span style={{font:"500 13px/16px Roboto",color:"#2563eb",cursor:"pointer"}}>View</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Document (attachment) icon
function DocIcon({ size=18, faded=false }) {
  return <img src={(window.__resources&&window.__resources.attachmentType)||"icons/attachment-type.svg"} width={size} height={size} alt="" style={{display:"block",opacity:faded?0.35:1}} aria-hidden="true" />;
}

// Status tag (Recert / Expiring / Expired) — solid outline, per Figma.
function PASDashTag({ text, color }) {
  return <span style={{display:"inline-block",border:`1px solid ${color}`,color,borderRadius:4,padding:"2px 8px",font:"400 11px/14px Roboto",whiteSpace:"nowrap",background:"#fff"}}>{text}</span>;
}

// Clickable summary cards (colored top bar + label + count) — right of heading.
function PASSummaryStrip({ activeCard, onPick, rows }) {
  const data = rows || pasRows;
  return (
    <div style={{display:"flex",gap:28,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
      {PAS_CARDS.map((c) => {
        const active = activeCard === c.id;
        const dim = activeCard && !active;
        const isAll = c.id === "all";
        const val = c.count(data);
        return (
          <div key={c.id} role="button" onClick={()=>onPick(active ? null : c.id)} title={c.label}
            style={{minWidth:82,display:"flex",flexDirection:"column",gap:8,cursor:"pointer",opacity:(dim&&!isAll)?0.4:1,transition:"opacity .12s"}}>
            <div style={{height:3,borderRadius:2,background:c.color,opacity: active ? 1 : 0.85}}></div>
            <div style={{font:"400 13px/17px Roboto",color:active?"#0f172a":(dim&&isAll)?"#b0b0b0":"#605D5D",whiteSpace:"nowrap"}}>{c.label}</div>
            <div style={{font:"500 16px/20px Roboto",color:active?"#0f172a":(dim&&isAll)?"#b0b0b0":"#605D5D"}}>{pad2(val)}</div>
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

// Column geometry (CSS grid — spreads to the end).
const PAS_COLS = [
  { key:"name",     label:"Patient Name",         grid:"minmax(140px,1.4fr)",  sortable:true },
  { key:"mrn",      label:"MRN",                  grid:"minmax(112px,1.05fr)", sortable:true },
  { key:"agency",   label:"Agency",               grid:"minmax(58px,0.62fr)",  sortable:true },
  { key:"branch",   label:"Branch",               grid:"minmax(50px,0.54fr)",  sortable:true },
  { key:"mid",      label:"Mem ID",               grid:"minmax(66px,0.72fr)",  sortable:true },
  { key:"src",      label:"Payor Src",            grid:"minmax(100px,1.05fr)", sortable:true },
  { key:"type",     label:"Payor Type",           grid:"minmax(64px,0.68fr)",  sortable:true },
  { key:"gateway",  label:"Gateway",              grid:"minmax(62px,0.66fr)",  sortable:true },
  { key:"soc",      label:"SOC",                  grid:"minmax(58px,0.62fr)",  sortable:true },
  { key:"epiSt",    label:"Epi St Date",          grid:"minmax(66px,0.72fr)",  sortable:true, sub:"(Current)" },
  { key:"epiId",    label:"Epi ID",               grid:"minmax(74px,0.82fr)",  sortable:true, sub:"(Current)" },
  { key:"summary",  label:"Episode Auth Summary", grid:"minmax(116px,1.2fr)",  align:"center" },
  { key:"recert",   label:"Recert Status",        grid:"minmax(78px,0.88fr)",  info:true },
  { key:"expiring", label:"Expiring Auth(s)",     grid:"minmax(82px,0.9fr)",   info:true },
  { key:"expired",  label:"Expired Auth(s)",      grid:"minmax(80px,0.86fr)",  info:true },
  { key:"docs",     label:"Docs",                 grid:"42px",                 align:"center" },
  { key:"reviewed", label:"Reviewed?",            grid:"66px",                 align:"center" },
];
const PAS_GRID = PAS_COLS.map(c => c.grid).join(" ");

const PAS_SEP = "1px solid #E5E7EB";
const PAS_BORDERED = { summary:{borderLeft:PAS_SEP}, recert:{borderLeft:PAS_SEP}, expiring:{borderLeft:PAS_SEP}, expired:{borderLeft:PAS_SEP,borderRight:PAS_SEP} };

function PASHeader({ sortKey, sortDir, onSort }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:PAS_GRID,alignItems:"stretch",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",minHeight:56,padding:"0 12px",gap:8}}>
      {PAS_COLS.map(c => {
        const bd = PAS_BORDERED[c.key] || {};
        const pad = (bd.borderLeft||bd.borderRight) ? {paddingLeft:10,paddingRight:8} : {};
        if (c.key === "summary") {
          return (
            <div key={c.key} style={{display:"flex",flexDirection:"column",justifyContent:"center",textAlign:"center",...bd,...pad}}>
              <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:3,font:"500 11px/14px Roboto",color:"#64748b",whiteSpace:"nowrap"}}><InfoCircle />Episode Auth Summary</div>
              <div style={{font:"400 9px/12px Roboto",color:"#94a3b8"}}>(Current)</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",marginTop:2,font:"500 11px Roboto",color:"#94a3b8"}}><span style={{textAlign:"center"}}>R</span><span style={{textAlign:"center"}}>A</span><span style={{textAlign:"center"}}>D</span><span style={{textAlign:"center"}}>P</span></div>
            </div>
          );
        }
        return (
          <div key={c.key} onClick={c.sortable ? ()=>onSort(c.key) : undefined}
            style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:c.align==="center"?"center":"flex-start",cursor:c.sortable?"pointer":"default",userSelect:"none",gap:1,overflow:"hidden",...bd,...pad}}>
            <div style={{font:"500 11px/14px Roboto",color:"#64748b",display:"flex",alignItems:"center",gap:2,whiteSpace:"nowrap"}}>
              {c.sortable && <ARVSortArrows active={sortKey === c.key} dir={sortDir} />}
              {c.label}
              {c.info && <InfoCircle />}
            </div>
            {c.sub && <div style={{font:"400 9px/12px Roboto",color:"#94a3b8"}}>{c.sub}</div>}
          </div>
        );
      })}
    </div>
  );
}

function PASRow({ row, onPatient, reviewed, onReviewed }) {
  const accent = "#2563eb";
  const rowSep = "1px solid #EEF0F3";
  const bordered = { summary:{borderLeft:rowSep}, recert:{borderLeft:rowSep}, expiring:{borderLeft:rowSep}, expired:{borderLeft:rowSep,borderRight:rowSep} };
  const cell = (align, key) => ({font:"500 12px/16px Roboto",color:"#333333",display:"flex",alignItems:"center",justifyContent:align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0, ...(bordered[key]||{}), ...(bordered[key]?{paddingLeft:10,paddingRight:8}:{})});
  const dash = <span style={{color:"#cbd5e1"}}>-</span>;
  const sumCell = (v, tone) => (v==="-"||v==null)
    ? <span style={{color:"#cbd5e1",font:"500 11px Roboto"}}>-</span>
    : <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",minWidth:26,padding:"2px 6px",borderRadius:10,font:"500 11px/14px Roboto",color:"#334155",background: tone==="a"?"rgba(22,163,74,0.16)":tone==="d"?"rgba(220,38,38,0.14)":"transparent"}}>{v}</span>;
  const s = row.sum;
  const recertContent = row.recert==="past_due" ? <PASDashTag text="Past Due" color="#6660A6" />
    : row.recert==="due" ? <PASDashTag text="Recert Due" color="#6660A6" />
    : row.recert==="current" ? <span style={{color:"#64748b"}}>Current</span>
    : dash;
  return (
    <div style={{display:"grid",gridTemplateColumns:PAS_GRID,alignItems:"stretch",minHeight:56,padding:"6px 11px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:8,boxShadow:"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",gap:8,position:"relative"}}>
      <div style={{position:"absolute",left:8,top:8,bottom:8,width:3,background:"rgb(16,134,133)",borderRadius:2}}></div>
      <div style={{...cell(),paddingLeft:18}}>
        <a href="#" onClick={(e)=>{e.preventDefault(); onPatient&&onPatient(row);}} style={{color:accent,font:"500 13px/16px Roboto",textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis"}}>{row.name}</a>
      </div>
      <div style={cell()} title={row.mrn}>{row.mrn}</div>
      <div style={cell()} title={row.agency}>{row.agency}</div>
      <div style={cell()} title={row.branch}>{row.branch}</div>
      <div style={{...cell(),font:"500 12px/16px Roboto",color:"#16a34a"}} title={row.mid}>{row.mid}</div>
      <div style={cell()} title={row.src}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{row.src}</span></div>
      <div style={cell()} title={row.type}>{row.type}</div>
      <div style={cell()} title={row.gateway}>{row.gateway==="-" ? dash : row.gateway}</div>
      <div style={cell()}>{row.soc || dash}</div>
      <div style={cell()}>{row.epiSt || dash}</div>
      <div style={cell()} title={row.epiId}>{row.epiId}</div>
      <div style={{...cell("center","summary"),display:"grid",gridTemplateColumns:"repeat(4,1fr)",alignItems:"center"}}>
        <span style={{display:"flex",justifyContent:"center"}}>{sumCell(s.r,"r")}</span>
        <span style={{display:"flex",justifyContent:"center"}}>{sumCell(s.a,"a")}</span>
        <span style={{display:"flex",justifyContent:"center"}}>{sumCell(s.d,"d")}</span>
        <span style={{display:"flex",justifyContent:"center"}}>{sumCell(s.p,"p")}</span>
      </div>
      <div style={cell(null,"recert")}>{recertContent}</div>
      <div style={cell(null,"expiring")}>{row.expiring ? <PASDashTag text="02 Expiring" color="#E0823C" /> : dash}</div>
      <div style={cell(null,"expired")}>{row.expired ? <PASDashTag text="01 Expired" color="#CF1322" /> : dash}</div>
      <div style={{...cell("center"),cursor:"pointer"}} onClick={(e)=>{e.stopPropagation();window.__openDocs&&window.__openDocs(row,false);}}><DocIcon size={18} /></div>
      <div style={cell("center")} onClick={()=>onReviewed&&onReviewed()}>
        <span role="checkbox" aria-checked={!!reviewed} tabIndex={0} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:`1px solid ${reviewed?"#2563eb":"#d8d8d8"}`,borderRadius:3,background:reviewed?"#2563eb":"#fff",cursor:"pointer"}}>
          {reviewed && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}
        </span>
      </div>
    </div>
  );
}

// Full Patient Auth Summary (used both as sub-tab content AND as fullscreen detail)
function PatientAuthSummaryView({ onRow, review, onExitReview, sharedInitDate, setSharedInitDate, sharedFieldFilters, setSharedFieldFilters }) {
  const [cardFilter, setCardFilter] = useP(null);
  const [searchQ, setSearchQ] = useP("");
  const [_initDate, _setInitDate] = useP(()=>defaultDateRange([...new Set(pasRows.map(r=>r.authInit))],30));
  const initDate = sharedInitDate !== undefined ? sharedInitDate : _initDate;
  const setInitDate = setSharedInitDate || _setInitDate;
  const [_fieldFilters, _setFieldFilters] = useP([]);
  const fieldFilters = sharedFieldFilters !== undefined ? sharedFieldFilters : _fieldFilters;
  const setFieldFilters = setSharedFieldFilters || _setFieldFilters;
  const [reviewedSet, setReviewedSet] = useP(()=>{ const m={}; pasRows.forEach(r=>{ if(r.reviewed) m[r.key]=true; }); return m; });
  const [sortKey, setSortKey] = useP(null);
  const [sortDir, setSortDir] = useP("asc");
  const onSort = (k) => { if (sortKey === k) setSortDir(d => d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };
  const toggleReviewed = (k) => setReviewedSet(s => ({ ...s, [k]: !s[k] }));

  const scoped = pasRows.filter(r => fieldFilters.every(f => f.values.includes(r[f.field])));
  const searched = searchQ ? scoped.filter(r=>[r.name,r.mrn,r.mid,r.src].join(" ").toLowerCase().includes(searchQ.toLowerCase())) : scoped;
  const activeCard = cardFilter ? PAS_CARDS.find(c => c.id === cardFilter) : null;
  let rows = activeCard ? searched.filter(activeCard.match) : searched;
  if (initDate) rows = rows.filter(r => dateInRange(r.authInit, initDate));
  // Review mode: only patients that still need review (recert past-due / due, or
  // expiring / expired auths) AND not yet reviewed. Checking a row's Reviewed box
  // drops it from the list; with review off, all rows show.
  const pasNeedsReview = (r) => r.recert==="past_due" || r.recert==="due" || !!r.expiring || !!r.expired;
  if (review) rows = rows.filter(r => pasNeedsReview(r) && !reviewedSet[r.key]);
  if (sortKey) {
    rows = [...rows].sort((a,b) => {
      const av = (a[sortKey] || "").toString().toLowerCase();
      const bv = (b[sortKey] || "").toString().toLowerCase();
      if (av < bv) return sortDir==="asc" ? -1 : 1;
      if (av > bv) return sortDir==="asc" ? 1 : -1;
      return 0;
    });
  }

  const chips = [];
  if (activeCard && activeCard.id !== "all") chips.push({ id:"card", label: activeCard.chip, onRemove: () => setCardFilter(null) });
  if (review) {
    [
      { id:"rv-pd",  label:"Recert Status: Past due for recert" },
      { id:"rv-due", label:"Recert Status: Due for recert" },
      { id:"rv-exp", label:"Recert Status: Expiring Auths" },
      { id:"rv-exd", label:"Recert Status: Expired Auths" },
      { id:"rv-nr",  label:"Reviewed : Not Reviewed" },
    ].forEach(c => chips.push({ ...c, onRemove: () => onExitReview && onExitReview() }));
  }

  return (
    <div style={{background:"#fff"}}>
      <ARVFilterBarChips chips={chips} filterFields={PAS_FILTER_FIELDS} filterRows={pasRows} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters} datePicker={{label:"Auth Initiated Date", value:initDate, available:[...new Set(pasRows.map(r=>r.authInit))], onChange:setInitDate}} searchValue={searchQ} onSearch={setSearchQ} onClearFilters={review ? (()=>onExitReview&&onExitReview()) : null} />
      <div style={{padding:"24px 32px 20px",display:"flex",alignItems:"flex-start",gap:32,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 300px",minWidth:0}}>
          <div style={{font:"500 16px/20px Roboto",color:"#0f172a"}}>Patient Auth Summary</div>
          <div style={{font:"400 13px/18px Roboto",color:"#3A424A",marginTop:8}}>Transaction status of the Auth request and response workflows</div>
        </div>
        <PASSummaryStrip activeCard={cardFilter} onPick={setCardFilter} rows={scoped} />
      </div>
      <div style={{padding:"0 32px 32px"}}>
        <PASHeader sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
        <ScrollBody>
          {rows.length === 0 ? (
            <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>
              No patients match the current filter.
            </div>
          ) : rows.map(r => (
            <PASRow
              key={r.key}
              row={r}
              onPatient={onRow}
              reviewed={!!reviewedSet[r.key]}
              onReviewed={()=>toggleReviewed(r.key)}
            />
          ))}
        </ScrollBody>
      </div>
    </div>
  );
}

// ── Auth Request View (mirrors the Eligibility Request View exactly) ──
// Same grid table, clickable status-summary strip, filter chips, AT
// status icons, accordion + interactions — with Authorization columns.

// === Status summary strip config ================================
const ARV_AUTH_STATUS = [
  { id:"all",                label:"Authorizations",     color:"#155f82", value:"106", weight:0.9 },
  { id:"pending_submission", label:"Pending Submission", color:"#3f7ba8", value:"02",  icon:"person", weight:1.5 },
  { id:"approved",           label:"Approved",           color:"#16a34a", value:"60",  weight:0.7 },
  { id:"partial",            label:"Partially Approved", color:"#237147", value:"10",  weight:1.3 },
  { id:"denied",             label:"Denied",             color:"#dc2626", value:"10",  caret:true, weight:0.75 },
  { id:"pending",            label:"Pending",            color:"#3f7ba8", value:"08",  weight:0.7 },
  { id:"exception",          label:"Exceptions",         color:"#d97706", value:"16",  caret:true, weight:0.95 },
];

// === Auth status pill (row cell) ================================
const ARV_STATUS = {
  approved:           { bg:"#f0fdf4", bd:"#16a34a", c:"#16a34a", label:"Approved" },
  denied:             { bg:"#fef2f2", bd:"#dc2626", c:"#dc2626", label:"Denied" },
  exception:          { bg:"#fff7ed", bd:"#f97316", c:"#f97316", label:"Exception" },
  partial:            { bg:"#f0fdfa", bd:"#0d9488", c:"#0f766e", label:"Partially Approved" },
  pending:            { bg:"#eaf2f8", bd:"#3f7ba8", c:"#3f7ba8", label:"Pending" },
  pending_submission: { bg:"#eaf2f8", bd:"#b8d3e6", c:"#3f7ba8", label:"Pending Submission", icon:true },
};
function ARVAuthPill({ kind, onClick, userIcon }) {
  const s = ARV_STATUS[kind] || ARV_STATUS.pending;
  const clickable = typeof onClick === "function";
  return (
    <span onClick={clickable ? (e)=>{ e.stopPropagation(); onClick(e); } : undefined}
      title={clickable ? "Enter authorization details" : undefined}
      style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,padding:"4px 12px",borderRadius:4,background:s.bg,border:`1px solid ${s.bd}`,color:s.c,font:"500 11px/16px Roboto",whiteSpace:"nowrap",minWidth:132,boxSizing:"border-box",cursor: clickable?"pointer":"default",textDecoration: clickable?"underline":"none"}}>
      {(s.icon || userIcon) && <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0}}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
      {s.label}
    </span>
  );
}

// === AT status icon (shared look with Eligibility) =============
function ARVATIcon({ kind, reason }) {
  if (kind === "thumb")     return <img title="Completed"       src={(window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png"} alt="Completed"       style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind === "warning")   return <img title={reason || "Needs Attention"} src={(window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png"} alt={reason || "Needs Attention"} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind === "hourglass") return <img title="In Progress"     src={(window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png"} alt="In Progress"     style={{width:18,height:18,objectFit:"contain"}} />;
  return <span style={{color:"#cbd5e1"}}>—</span>;
}

// === Trash icon (remove filter row) =============================
function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7m2 0v12.5A1.5 1.5 0 0 1 15.5 21h-7A1.5 1.5 0 0 1 7 19.5V7" stroke="#e0533d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

// === Multi-value picker (alphabetical, grouped, searchable) =====
function FilterValueSelect({ options, selected, onToggle, placeholder, single }) {
  const [open, setOpen] = useP(false);
  const [q, setQ] = useP("");
  const ref = React.useRef(null);
  React.useEffect(()=>{ if(!open) return; const h=(e)=>{ if(ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[open]);
  const filtered = options.filter(o=>String(o).toLowerCase().includes(q.toLowerCase()));
  const groups = {};
  filtered.forEach(o=>{ const L=(String(o)[0]||"#").toUpperCase(); (groups[L]=groups[L]||[]).push(o); });
  const letters = Object.keys(groups).sort();
  return (
    <div ref={ref} style={{position:"relative"}}>
      <div onClick={()=>setOpen(v=>!v)} style={{minHeight:34,border:"1px solid #d1d5db",borderRadius:6,padding:"3px 8px",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",cursor:"pointer",background:"#fff"}}>
        {selected.length===0 && <span style={{color:"#94a3b8",font:"400 12px/16px Roboto"}}>{placeholder}</span>}
        {selected.map(v=>(
          <span key={v} style={{display:"inline-flex",alignItems:"center",gap:6,background:"#eef4fb",border:"1px solid #d8dee6",borderRadius:4,padding:"1px 6px",font:"400 11px/16px Roboto",color:"#334155"}}>
            {v}<button type="button" onClick={(e)=>{e.stopPropagation(); onToggle(v);}} style={{border:"none",background:"transparent",cursor:"pointer",color:"#64748b",fontSize:11,padding:0,lineHeight:1}}>✕</button>
          </span>
        ))}
        <span style={{marginLeft:"auto",color:"#94a3b8",fontSize:9}}>▾</span>
      </div>
      {open && (
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,boxShadow:"0 8px 24px rgba(15,23,42,0.12)",zIndex:60,maxHeight:230,overflow:"auto"}}>
          <div style={{padding:8,position:"sticky",top:0,background:"#fff",borderBottom:"1px solid #f1f5f9"}}>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search" style={{width:"100%",border:"1px solid #e2e8f0",borderRadius:6,padding:"5px 8px",font:"400 12px/16px Roboto",outline:"none",boxSizing:"border-box"}} />
          </div>
          {letters.length===0 && <div style={{padding:"10px 12px",color:"#94a3b8",font:"400 12px Roboto"}}>No matches</div>}
          {letters.map(L=>(
            <div key={L}>
              <div style={{padding:"4px 12px",font:"600 11px/14px Roboto",color:"#94a3b8"}}>{L}</div>
              {groups[L].map(o=>(
                <label key={o} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 12px",cursor:"pointer",font:"400 12px/16px Roboto",color:"#0f172a"}}>
                  <input type={single?"radio":"checkbox"} checked={selected.includes(o)} onChange={()=>{ onToggle(o); if (single) setOpen(false); }} style={single?{margin:0,accentColor:"#2563eb"}:undefined} />
                  {o}
                </label>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// === "Add More Filters" popover =================================
function FilterPopover({ fields, rows, initial, onApply, onClose }) {
  const [draft, setDraft] = useP(() => (initial && initial.length) ? initial.map(f=>({field:f.field, values:[...f.values]})) : [{field:"",values:[]}]);
  const ref = React.useRef(null);
  React.useEffect(()=>{ const h=(e)=>{ if(ref.current && !ref.current.contains(e.target)) onClose(); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[]);
  const labelOf = (k)=> (fields.find(f=>f.key===k)||{}).label || k;
  const optionsFor = (k)=> k ? [...new Set(rows.map(r=>r[k]).filter(v=>v&&v!=="-"&&v!=="—"))].sort((a,b)=>String(a).localeCompare(String(b))) : [];
  const setRow=(i,patch)=>setDraft(d=>d.map((r,j)=>j===i?{...r,...patch}:r));
  const removeRow=(i)=>setDraft(d=>{const n=d.filter((_,j)=>j!==i); return n.length?n:[{field:"",values:[]}];});
  const toggleVal=(i,v)=>setDraft(d=>d.map((r,j)=>{ if(j!==i) return r; const has=r.values.includes(v); return {...r,values: has?r.values.filter(x=>x!==v):[...r.values,v]}; }));
  const usedFields=(i)=>draft.filter((_,j)=>j!==i).map(r=>r.field).filter(Boolean);
  const canApply = draft.some(r=>r.field && r.values.length);
  return (
    <div ref={ref} style={{position:"absolute",top:"calc(100% + 8px)",left:0,width:640,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,boxShadow:"0 16px 40px rgba(15,23,42,0.18)",zIndex:50}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",borderBottom:"1px solid #eef0f3"}}>
        <span style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Filter</span>
        <button type="button" onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",color:"#64748b",fontSize:16,lineHeight:1}}>✕</button>
      </div>
      <div style={{padding:"14px 18px"}}>
        <div style={{display:"grid",gridTemplateColumns:"260px 1fr 28px",gap:12,marginBottom:6,font:"500 11px/14px Roboto",color:"#94a3b8"}}>
          <span>Filter Fields</span><span>Filter Value(s)</span><span></span>
        </div>
        {draft.map((r,i)=>{
          const avail = fields.filter(f=> f.key===r.field || !usedFields(i).includes(f.key));
          return (
            <div key={i} style={{display:"grid",gridTemplateColumns:"260px 1fr 28px",gap:12,alignItems:"start",marginBottom:10}}>
              <select value={r.field} onChange={e=>setRow(i,{field:e.target.value, values:[]})} style={{height:34,border:"1px solid #cbd5e1",borderRadius:6,padding:"0 8px",font:"400 12px/16px Roboto",color:r.field?"#0f172a":"#94a3b8",background:"#fff",outline:"none"}}>
                <option value="">Select Field</option>
                {avail.map(f=><option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
              {r.field && (fields.find(f=>f.key===r.field)||{}).radio
                ? <FilterValueSelect single options={fields.find(f=>f.key===r.field).radio} selected={r.values} onToggle={(v)=>setRow(i,{values: r.values[0]===v ? [] : [v]})} placeholder={`Select ${labelOf(r.field)}`} />
                : r.field
                ? <FilterValueSelect options={optionsFor(r.field)} selected={r.values} onToggle={(v)=>toggleVal(i,v)} placeholder={`Input ${labelOf(r.field)} value`} />
                : <div style={{height:34,border:"1px solid #e2e8f0",borderRadius:6,display:"flex",alignItems:"center",padding:"0 8px",font:"400 12px/16px Roboto",color:"#cbd5e1",background:"#f8fafc"}}>Select Value(s) to Filter</div>}
              <button type="button" onClick={()=>removeRow(i)} title="Remove" style={{border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",height:34}}><TrashIcon /></button>
            </div>
          );
        })}
        {draft.every(r=>r.field) && draft.length < fields.length && (
          <button type="button" onClick={()=>setDraft(d=>[...d,{field:"",values:[]}])} style={{border:"none",background:"transparent",color:"#2563eb",cursor:"pointer",font:"500 12px/16px Roboto",padding:"2px 0"}}>+ Add filter field</button>
        )}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:12,padding:"12px 18px",borderTop:"1px solid #eef0f3"}}>
        <button type="button" onClick={()=>setDraft([{field:"",values:[]}])} style={{border:"none",background:"transparent",color:"#333333",cursor:"pointer",font:"500 13px/18px Roboto"}}>Reset</button>
        <button type="button" disabled={!canApply} onClick={()=>onApply(draft.filter(r=>r.field&&r.values.length))} style={{border:"none",borderRadius:6,padding:"7px 16px",font:"500 13px/18px Roboto",cursor:canApply?"pointer":"not-allowed",background:canApply?"#2563eb":"#e2e8f0",color:canApply?"#fff":"#94a3b8"}}>Apply Filter</button>
      </div>
    </div>
  );
}

// Expose the filter popover for other babel files (e.g. Eligibility Request View).
if (typeof window !== "undefined") { window.InfoCircle = InfoCircle; window.FilterPopover = FilterPopover; window.ARVNeedsAttentionMenu = ARVNeedsAttentionMenu; window.NAReasonMenu = NAReasonMenu; window.DatePicker = DatePicker; window.dateInRange = dateInRange; window.defaultDateRange = defaultDateRange; }

// === Filter chip (shared look with Eligibility) ================
function ARVFilterChip({ label, onRemove }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:10,background:"#f4f6f9",border:"1px solid #d8dee6",borderRadius:6,padding:"6px 10px",font:"400 12px/16px Roboto",color:"#334155",whiteSpace:"nowrap",flexShrink:0}}>
      {label}
      <button type="button" onClick={onRemove} title="Remove filter" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",border:"none",background:"transparent",color:"#64748b",fontSize:13,lineHeight:1,cursor:"pointer",padding:0}}>✕</button>
    </span>
  );
}

// === Filter bar with chips ======================================
// === Date-filter calendar popup ================================
function parseMDY(s){ if(!s) return null; const p=s.split("/"); if(p.length!==3) return null; const m=+p[0], d=+p[1], y=+p[2]; return new Date(2000+y, m-1, d); }
function fmtMDY(dt){ return String(dt.getMonth()+1).padStart(2,"0")+"/"+String(dt.getDate()).padStart(2,"0")+"/"+String(dt.getFullYear()).slice(2); }
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MON3 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function addDays(dt,n){ const r=new Date(dt); r.setDate(r.getDate()+n); return r; }
function sameYMD(a,b){ return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(); }
function fmtFull(dt){ return dt ? String(dt.getMonth()+1).padStart(2,"0")+"/"+String(dt.getDate()).padStart(2,"0")+"/"+dt.getFullYear() : ""; }
function dateInRange(ds, r){ if(!r) return true; const d=parseMDY(ds); if(!d) return false; const a=parseMDY(r.start), b=parseMDY(r.end); return a && b && d>=a && d<=b; }
function defaultDateRange(dates, days){ const ds=(dates||[]).map(parseMDY).filter(Boolean).sort((a,b)=>b-a); const end=ds[0]||new Date(); const start=addDays(end,-(days-1)); return { start: fmtMDY(start), end: fmtMDY(end) }; }

function DatePicker({ value, available = [], onChange }) {
  const ref = React.useMemo(()=>{
    const ds = available.map(parseMDY).filter(Boolean).sort((a,b)=>b-a);
    return ds[0] || new Date();
  }, [available.join(",")]);
  const seedStart = (value && parseMDY(value.start)) || addDays(ref,-29);
  const seedEnd   = (value && parseMDY(value.end))   || ref;
  const [draft, setDraft] = useP({ start: seedStart, end: seedEnd });
  const [base, setBase]   = useP(new Date(seedStart.getFullYear(), seedStart.getMonth(), 1));

  const preset = (n) => { const s = addDays(ref, -(n-1)), e = ref; setDraft({ start: s, end: e }); onChange({ start: fmtMDY(s), end: fmtMDY(e) }); };
  const clickDay = (d) => {
    if (!draft.start || (draft.start && draft.end)) setDraft({ start: d, end: null });
    else if (d < draft.start) setDraft({ start: d, end: draft.start });
    else setDraft({ start: draft.start, end: d });
  };
  const inRange = (d) => draft.start && draft.end && d >= draft.start && d <= draft.end;

  const Month = ({ mBase }) => {
    const y = mBase.getFullYear(), m = mBase.getMonth();
    const first = new Date(y,m,1).getDay();
    const days = new Date(y,m+1,0).getDate();
    const cells = [];
    for (let i=0;i<first;i++) cells.push(null);
    for (let d=1;d<=days;d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return (
      <div style={{width:238}}>
        <div style={{textAlign:"center",font:"500 13px/16px Roboto",color:"#0f172a",marginBottom:10}}>{MON3[m]} {y}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d,i)=>(<span key={i} style={{textAlign:"center",font:"400 11px/14px Roboto",color:"#94a3b8",paddingBottom:6}}>{d}</span>))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
          {cells.map((d,i)=>{
            if (d==null) return <span key={i} style={{height:32}} />;
            const dt = new Date(y,m,d);
            const isStart = sameYMD(dt, draft.start), isEnd = sameYMD(dt, draft.end);
            const between = inRange(dt) && !isStart && !isEnd;
            const edge = isStart || isEnd;
            return (
              <button key={i} type="button" onClick={()=>clickDay(dt)}
                style={{height:32,border:"none",cursor:"pointer",font:`${edge?600:400} 12px/16px Roboto`,color: edge?"#fff":"#0f172a",
                  background: edge ? "#2563eb" : between ? "#E8F1FE" : "transparent",
                  borderRadius: isStart&&isEnd?6 : isStart?"6px 0 0 6px" : isEnd?"0 6px 6px 0" : between?0:6,
                  padding:0}}>
                {d}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const presets = [["Today",1],["Last 7 Days",7],["Last 14 Days",14],["Last 30 Days",30],["Last 90 Days",90]];
  return (
    <div onClick={(e)=>e.stopPropagation()} style={{position:"absolute",top:"100%",left:0,marginTop:6,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,boxShadow:"0 16px 40px rgba(15,23,42,0.18)",zIndex:60,width:640,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderBottom:"1px solid #eef0f3"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,border:"1px solid #2563eb",borderRadius:6,padding:"5px 10px",font:"400 12px/16px Roboto",color:"#0f172a"}}>
          <span>{fmtFull(draft.start) || "Start"}</span>
          <span style={{color:"#94a3b8"}}>→</span>
          <span>{fmtFull(draft.end) || "End"}</span>
        </div>
      </div>
      <div style={{display:"flex"}}>
        <div style={{width:142,borderRight:"1px solid #eef0f3",padding:"12px 8px",display:"flex",flexDirection:"column",gap:2}}>
          {presets.map(([lbl,n])=>(
            <button key={n} type="button" onClick={()=>preset(n)} style={{textAlign:"left",border:"none",background:"transparent",cursor:"pointer",font:"400 13px/18px Roboto",color:"#334155",padding:"8px 10px",borderRadius:6,whiteSpace:"nowrap"}}
              onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{lbl}</button>
          ))}
        </div>
        <div style={{flex:1,padding:"12px 16px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <div style={{display:"flex",gap:2}}>
              <button type="button" onClick={()=>setBase(new Date(base.getFullYear()-1,base.getMonth(),1))} style={{border:"none",background:"transparent",cursor:"pointer",color:"#64748b",fontSize:14,padding:"2px 6px"}}>«</button>
              <button type="button" onClick={()=>setBase(new Date(base.getFullYear(),base.getMonth()-1,1))} style={{border:"none",background:"transparent",cursor:"pointer",color:"#64748b",fontSize:14,padding:"2px 6px"}}>‹</button>
            </div>
            <div style={{display:"flex",gap:2}}>
              <button type="button" onClick={()=>setBase(new Date(base.getFullYear(),base.getMonth()+1,1))} style={{border:"none",background:"transparent",cursor:"pointer",color:"#64748b",fontSize:14,padding:"2px 6px"}}>›</button>
              <button type="button" onClick={()=>setBase(new Date(base.getFullYear()+1,base.getMonth(),1))} style={{border:"none",background:"transparent",cursor:"pointer",color:"#64748b",fontSize:14,padding:"2px 6px"}}>»</button>
            </div>
          </div>
          <div style={{display:"flex",gap:20}}>
            <Month mBase={base} />
            <Month mBase={new Date(base.getFullYear(),base.getMonth()+1,1)} />
          </div>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:12,padding:"12px 16px",borderTop:"1px solid #eef0f3"}}>
        <button type="button" onClick={()=>{ const s=addDays(ref,-29), e=ref; setDraft({start:s,end:e}); onChange({ start: fmtMDY(s), end: fmtMDY(e) }); }} style={{border:"none",background:"transparent",color:"#64748b",cursor:"pointer",font:"500 13px/18px Roboto"}}>Reset</button>
        <button type="button" disabled={!(draft.start&&draft.end)} onClick={()=>onChange({ start: fmtMDY(draft.start), end: fmtMDY(draft.end) })} style={{border:"none",borderRadius:6,padding:"7px 16px",font:"500 13px/18px Roboto",cursor:(draft.start&&draft.end)?"pointer":"not-allowed",background:(draft.start&&draft.end)?"#2563eb":"#e2e8f0",color:(draft.start&&draft.end)?"#fff":"#94a3b8"}}>Apply Filter</button>
      </div>
    </div>
  );
}

function ARVFilterBarChips({ chips = [], dateLabel = "Auth Initiated Date : 01/01/25 – 05/103/25", datePicker = null, hideSearch = false, searchPlaceholder = "Search Patient Records", filterFields = [], filterRows = [], fieldFilters = [], onFieldFilters = null, onClearFilters = null, searchValue = "", onSearch = null }) {
  const [open, setOpen] = useP(false);
  const [dpOpen, setDpOpen] = useP(false);
  const dref = React.useRef(null);
  React.useEffect(()=>{ if(!dpOpen) return; const h=(e)=>{ if(dref.current && !dref.current.contains(e.target)) setDpOpen(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); }, [dpOpen]);
  const labelOf = (k)=> ((filterFields||[]).find(f=>f.key===k)||{}).label || k;
  const fieldTags = [];
  (fieldFilters||[]).forEach(f => f.values.forEach(v => fieldTags.push({
    id:`${f.field}:${v}`, label:`${labelOf(f.field)}: ${v}`,
    onRemove: () => onFieldFilters((fieldFilters.map(x=> x.field===f.field ? {...x, values:x.values.filter(y=>y!==v)} : x)).filter(x=>x.values.length))
  })));
  return (
    <div style={{background:"#eef4fb",borderBottom:"1px solid #e2e8f0",padding:"10px 32px",display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap"}}>
      <div style={{position:"relative",flexShrink:0}} ref={dref}>
        <button type="button" onClick={()=> datePicker && setDpOpen(v=>!v)} style={{background:"#fff",border:"1px solid #d8d8d8",borderRadius:4,padding:"5px 12px",font:"400 12px/16px Roboto",color:"#0f172a",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,flexShrink:0,whiteSpace:"nowrap"}}>
          {datePicker ? `${datePicker.label} : ${datePicker.value ? datePicker.value.start + " – " + datePicker.value.end : "All"}` : dateLabel}
          <span style={{color:"#94a3b8",fontSize:9}}>▾</span>
        </button>
        {dpOpen && datePicker && (
          <DatePicker value={datePicker.value} available={datePicker.available}
            onChange={(d)=>{ datePicker.onChange(d); setDpOpen(false); }} />
        )}
      </div>
      <div style={{position:"relative",flexShrink:0}}>
        <button type="button" onClick={()=> filterFields && setOpen(v=>!v)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:6,padding:"5px 4px",whiteSpace:"nowrap"}}>
          <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:"#2563eb",color:"#fff",fontSize:10,fontWeight:600,lineHeight:1}}>+</span>
          Add More Filters
        </button>
        {open && filterFields && (
          <FilterPopover fields={filterFields} rows={filterRows} initial={fieldFilters}
            onApply={(f)=>{ onFieldFilters(f); setOpen(false); }} onClose={()=>setOpen(false)} />
        )}
      </div>
      <div className="chip-scroll" style={{display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap",overflowX:"auto",flex:"1 1 auto",minWidth:0}}>
        {chips.map(c => (<ARVFilterChip key={c.id} label={c.label} onRemove={c.onRemove} />))}
        {fieldTags.map(t => (<ARVFilterChip key={t.id} label={t.label} onRemove={t.onRemove} />))}
      </div>
      {onClearFilters && (<button type="button" onClick={onClearFilters} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",padding:"5px 4px",flexShrink:0,whiteSpace:"nowrap"}}>Clear filters</button>)}
      {!hideSearch && (<div style={{position:"relative",flexShrink:0}}>
        <img src={(window.__resources&&window.__resources.searchIcon)||"icons/search.svg"} alt="search" style={{width:14,height:14,objectFit:"contain",position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}} />
        <input type="text" value={searchValue} onChange={e=>onSearch&&onSearch(e.target.value)} placeholder={searchPlaceholder} style={{width:240,background:"#fff",border:"1px solid #93c5e8",borderRadius:6,padding:"6px 12px 6px 32px",font:"400 12px/16px Roboto",color:"#0f172a",outline:"none"}} />
      </div>)}
    </div>
  );
}

// === Title cluster with "All Auth Requests" dropdown ============
const ARV_MODE_OPTIONS = [
  { id:"all",       label:"All Auth Requests" },
  { id:"manual",    label:"Non-Automated Auth Requests only" },
  { id:"automated", label:"Automated Auth Requests only" },
];
// Field config for the "Add More Filters" popover (Auth Request View).
const ARV_FILTER_FIELDS = [
  { key:"agency", label:"Agency" },
  { key:"branch", label:"Branch" },
  { key:"src",    label:"Payor Source" },
  { key:"ptype",  label:"Payor Type" },
  { key:"gw",     label:"Gateway" },
  { key:"type",   label:"Auth Type" },
];
function ARVTitleCluster({ activeStatus, statusLabel, onClearStatus, modeFilter, onModeFilter }) {
  const [open, setOpen] = useP(false);
  const ref = React.useRef(null);
  React.useEffect(()=>{
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const activeMode = ARV_MODE_OPTIONS.find(o => o.id === modeFilter) || ARV_MODE_OPTIONS[0];
  const headerLabel = activeMode.label;
  return (
    <div>
      <div style={{display:"flex",alignItems:"baseline",gap:6,flexWrap:"wrap",position:"relative"}} ref={ref}>
        <span style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Auth Request View —</span>
        <button type="button" onClick={()=>setOpen(v=>!v)} style={{background:"transparent",border:"none",cursor:"pointer",font:"500 15px/20px Roboto",color:"#2563eb",display:"inline-flex",alignItems:"center",gap:4,padding:0}}>
          {headerLabel}
          <span style={{fontSize:18,position:"relative",top:0,transition:"transform .15s",transform:open?"rotate(180deg)":"rotate(0)",display:"inline-block"}}>▾</span>
        </button>
        {open && (
          <div style={{position:"absolute",top:"100%",left:160,marginTop:6,background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,boxShadow:"0 8px 24px rgba(15,23,42,0.12)",padding:6,minWidth:260,zIndex:20}}>
            <div style={{font:"600 10px/14px Roboto",letterSpacing:"0.06em",textTransform:"uppercase",color:"#94a3b8",padding:"6px 10px 4px"}}>Filter by request mode</div>
            {ARV_MODE_OPTIONS.map(o => {
              const sel = o.id === modeFilter;
              return (
                <button key={o.id} type="button" onClick={()=>{ onModeFilter(o.id); setOpen(false); }} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:sel?"#eff6ff":"transparent",border:"none",borderRadius:6,padding:"7px 10px",cursor:"pointer",font:`${sel?500:400} 12px/16px Roboto`,color:sel?"#1d4ed8":"#333333",textAlign:"left"}}>
                  <span>{o.label}</span>
                  {sel && <span style={{color:"#1d4ed8",fontSize:11}}>✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Status Summary of Auth Requests Submitted to Payors</div>
    </div>
  );
}

// === Sub-status breakdown menu (Denied / Exception caret) =======
const ARV_SUBSTATUS = {
  denied:    [ {id:"denied",label:"Denied",count:"05"}, {id:"cancelled",label:"Cancelled",count:"02"}, {id:"contact",label:"Contact Payor",count:"01"}, {id:"term",label:"Term Expired",count:"02"} ],
  exception: [ {id:"denied",label:"Denied",count:"07"}, {id:"term",label:"Term Expired",count:"02"} ],
  warning:   [ {id:"terminated",label:"Terminated",count:"02"}, {id:"failed",label:"Failed",count:"03"} ],
};
function ARVSubStatusMenu({ items, disabled, onClose, alignRight }) {
  const [checked, setChecked] = useP(() => { const m={}; items.forEach(i=>m[i.id]=true); return m; });
  const allOn = items.every(i=>checked[i.id]);
  const toggle = (id) => { if(disabled) return; setChecked(c=>({...c,[id]:!c[id]})); };
  const toggleAll = () => { if(disabled) return; const v=!allOn; const m={}; items.forEach(i=>m[i.id]=v); setChecked(m); };
  const box = (on) => (
    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,borderRadius:4,border:`1px solid ${disabled ? "#c3c9d4" : (on?"#2563eb":"#cbd5e1")}`,background: disabled ? (on?"#c3c9d4":"#eef1f5") : (on?"#2563eb":"#fff"),flexShrink:0}}>
      {on && <span style={{color:"#fff",fontSize:11,fontWeight:700,lineHeight:1}}>✓</span>}
    </span>
  );
  return (
    <div onClick={(e)=>e.stopPropagation()} style={{position:"absolute",top:"100%",...(alignRight?{right:0}:{left:0}),marginTop:8,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,boxShadow:"0 16px 40px rgba(15,23,42,0.18)",minWidth:250,zIndex:60}}>
      {!disabled && (
        <label onClick={toggleAll} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderBottom:"1px solid #f1f5f9",cursor:"pointer",font:"500 13px/16px Roboto",color:"#2563eb"}}>
          {box(allOn)} Select All/Unselect All
        </label>
      )}
      {items.map(it=>(
        <label key={it.id} onClick={()=>toggle(it.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 16px",cursor:disabled?"default":"pointer",font:"400 13px/16px Roboto",color: disabled ? "#b6bcc6" : "#334155"}}>
          <span style={{display:"inline-flex",alignItems:"center",gap:10}}>{box(!!checked[it.id])} {it.label}</span>
          <span style={{color: disabled ? "#cbd5e1" : "#94a3b8",fontWeight:600}}>{it.count}</span>
        </label>
      ))}
      {!disabled && (
        <div style={{display:"flex",justifyContent:"flex-end",padding:"10px 16px 12px"}}>
          <button type="button" onClick={onClose} style={{border:"none",borderRadius:6,padding:"6px 14px",font:"500 12px/16px Roboto",cursor:"pointer",background:"#2563eb",color:"#fff"}}>Show Records</button>
        </div>
      )}
    </div>
  );
}

// === Needs Attention breakdown menu (grouped, per Figma frame) ==
// The Needs Attention "wire": one source of truth shared by the Auth Req View
// dropdown (below) and the Dashboard → Authorization automation alerts area.
// Reasons are classified into their exception category here, but the COUNTS are
// NOT hardcoded — they are tallied live from the Auth Request rows actually
// present in the table (see computeAuthNA), so the numbers always match the
// real data and the number of rows on screen.
const AUTH_NA_TERM_LABELS = [
  "Patient record not available in the grid",
  "Review eligibility popup occurred",
  "Unable to perform Update Auth Line and(or) Stage Complete",
  "SOC or SOE field has blank value",
  "Order form for the CMS 485 is not available",
  "Member ID mismatch",
  "Invalid billing code identified for the patient",
  "Duplicate authorization request",
  "Payor not configured in the system",
  "Authorization already exists for the period",
  "Missing physician NPI",
  "Service line not mapped",
  "Episode date out of range",
  "Diagnosis code not supported",
  "Patient discharged before auth",
  "Coverage terminated",
  "Referral missing",
  "Auth request past timely filing",
  "Branch not configured",
  "Plan requires manual review",
];
const AUTH_NA_FAIL_LABELS = [
  "Availity error message occurred preventing submission",
  "Unable to select the desired location",
  "Unable to update authorization information in HCHB",
  "Session timed out during submission",
];
// Tally the Needs-Attention reasons from the warning rows actually present.
// Returns { termReasons:[[label,count],…], failReasons:[…], termTotal, failTotal }
// sorted by count desc; only reasons that actually occur are included.
function computeAuthNA(rows) {
  rows = rows || (typeof window !== "undefined" && window.arvRows) || [];
  const failSet = new Set(AUTH_NA_FAIL_LABELS);
  const term = {}, fail = {};
  rows.forEach(r => {
    if (r.at !== "warning") return;
    const reason = r.atReason || "Unspecified reason";
    if (failSet.has(reason)) fail[reason] = (fail[reason] || 0) + 1;
    else term[reason] = (term[reason] || 0) + 1;
  });
  const sorted = (m) => Object.entries(m).sort((a, b) => b[1] - a[1]);
  const termReasons = sorted(term), failReasons = sorted(fail);
  const sum = (l) => l.reduce((s, x) => s + x[1], 0);
  return { termReasons, failReasons, termTotal: sum(termReasons), failTotal: sum(failReasons) };
}
if (typeof window !== "undefined") window.computeAuthNA = computeAuthNA;
function NABox({ on, disabled }) {
  return (
    <span style={{width:18,height:18,borderRadius:4,border:`1.5px solid ${disabled?"#c3c9d4":(on?"#2563eb":"#cbd5e1")}`,background: disabled?(on?"#c3c9d4":"#eef1f5"):(on?"#2563eb":"#fff"),display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      {on && <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 6" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </span>
  );
}

// Flat reason checklist (Automation "Needs Attention" breakdown) — the pattern
// used by the Patient Auth Summary View: select-all row, reason rows with counts,
// and a Show Records action that applies the selection.
function NAReasonMenu({ reasons=[], selected, onApply, onClose, align="right" }) {
  const labels = reasons.map(r=>r.label);
  const [checked, setChecked] = useP(()=>{
    const sel = selected && selected.length ? selected : null;
    const m = {}; labels.forEach(l=>{ m[l] = sel ? sel.includes(l) : true; }); return m;
  });
  const allOn = labels.length>0 && labels.every(l=>checked[l]);
  const toggle = l => setChecked(c=>({...c,[l]:!c[l]}));
  const toggleAll = () => { const v=!allOn; const m={}; labels.forEach(l=>m[l]=v); setChecked(m); };
  const chosen = labels.filter(l=>checked[l]);
  return (
    <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:"100%",[align]:0,marginTop:8,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,boxShadow:"0 16px 40px rgba(15,23,42,0.18)",width:300,zIndex:60,overflow:"hidden",textAlign:"left",cursor:"default"}}>
      <div style={{padding:"14px 18px 6px"}}>
        <label onClick={toggleAll} style={{display:"inline-flex",alignItems:"center",gap:10,cursor:"pointer",font:"600 14px/18px Roboto",color:"#2563eb"}}>
          <NABox on={allOn} /> Select All/Unselect All
        </label>
      </div>
      <div style={{maxHeight:300,overflow:"auto",padding:"4px 0 6px"}}>
        {reasons.length===0 && <div style={{padding:"10px 18px",font:"400 13px/18px Roboto",color:"#94a3b8"}}>No records</div>}
        {reasons.map(r=>(
          <label key={r.label} onClick={()=>toggle(r.label)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 18px",cursor:"pointer"}}>
            <NABox on={!!checked[r.label]} />
            <span style={{font:"400 14px/18px Roboto",color:"#1f2937",flex:1,minWidth:0}}>{r.label}</span>
            <span style={{font:"600 13px/16px Roboto",color:"#94a3b8",whiteSpace:"nowrap"}}>{pad2(r.count)}</span>
          </label>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",padding:"10px 18px 16px"}}>
        <button type="button" onClick={()=>{ onApply && onApply(chosen.length===labels.length?null:chosen); onClose && onClose(); }}
          style={{background:"#2563eb",border:"none",borderRadius:6,padding:"9px 16px",font:"500 14px/18px Roboto",color:"#fff",cursor:"pointer"}}>Show Records</button>
      </div>
    </div>
  );
}
function ARVNeedsAttentionMenu({ disabled, onClose, naCount, onApply, selectedReasons, na, groupDefs, noteOverrides, hideCounts }) {
  // Groups are built from the live tally of warning rows actually present, so
  // the reasons + counts here match the real data and the Dashboard alerts.
  // `na` may be supplied by the caller (e.g. the Eligibility Request View passes
  // its own eligibility breakdown); default to the Authorization tally.
  const naData = na || computeAuthNA();
  const groups = [];
  if (groupDefs && groupDefs.length) {
    groupDefs.forEach(g => groups.push({ id:g.id, label:g.label, note:g.note, reasons:(g.reasons||[]).map(([label,count])=>({label,count})), initial:g.initial || 3 }));
  } else {
  if (naData.manualReasons && naData.manualReasons.length) groups.push({ id:"manual", label:"Manually Terminated", note:"User Terminated - notes", reasons: naData.manualReasons.map(([label,count])=>({label,count})), initial:3 });
  if (naData.termReasons.length) groups.push({ id:"terminated", label:"Terminated", note:"Business Exception", reasons: naData.termReasons.map(([label,count])=>({label,count})), initial:3 });
  if (naData.failReasons.length) groups.push({ id:"failed", label:"Failed", note:"Technical Exception", reasons: naData.failReasons.map(([label,count])=>({label,count})), initial:3 });
  }
  if (noteOverrides) groups.forEach(g => { if (noteOverrides[g.id]) g.note = noteOverrides[g.id]; });
  groups.forEach(g => { g.total = g.reasons.reduce((s,r)=>s+r.count,0); });
  const idOf = (gid, r) => gid + "::" + r.label;
  const allIds = groups.flatMap(g => g.reasons.map(r => idOf(g.id, r)));
  // Seed the checkboxes from the currently-applied reason filter: when a subset
  // of reasons is active, reopening the dropdown shows the full list with only
  // those reasons checked (null/empty selection = everything checked, as usual).
  const [checked, setChecked] = useP(() => {
    const m = {};
    const sel = selectedReasons && selectedReasons.length ? selectedReasons : null;
    groups.forEach(g => g.reasons.forEach(r => { m[idOf(g.id, r)] = sel ? sel.includes(r.label) : true; }));
    return m;
  });
  const [expanded, setExpanded] = useP(()=>{ const m={manual:true,terminated:true,failed:true}; groups.forEach(g=>{ m[g.id]=true; }); return m; });
  const [showMore, setShowMore] = useP({});
  const allOn = allIds.every(id => checked[id]);
  const toggle = (id) => { if(disabled) return; setChecked(c=>({...c,[id]:!c[id]})); };
  const toggleAll = () => { if(disabled) return; const v=!allOn; const m={}; allIds.forEach(id=>m[id]=v); setChecked(m); };
  const grpChecked = (g) => g.reasons.every(r => checked[idOf(g.id,r)]);
  const toggleGroup = (g) => { if(disabled) return; const v=!grpChecked(g); setChecked(c=>{ const m={...c}; g.reasons.forEach(r=>m[idOf(g.id,r)]=v); return m; }); };
  const grpSelected = (g) => g.reasons.reduce((n,r)=> n + (checked[idOf(g.id,r)] ? parseInt(r.count,10) : 0), 0);
  return (
    <div onClick={(e)=>e.stopPropagation()} style={{position:"absolute",top:"100%",right:0,marginTop:8,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,boxShadow:"0 16px 40px rgba(15,23,42,0.18)",width:470,zIndex:60,overflow:"hidden"}}>
      {!disabled && (
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",borderBottom:"1px solid #f1f5f9"}}>
          <label onClick={toggleAll} style={{display:"inline-flex",alignItems:"center",gap:10,cursor:"pointer",font:"600 14px/18px Roboto",color:"#2563eb"}}>
            <NABox on={allOn} /> Select All /Unselect All
          </label>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 4v16M7 4L4 7.5M7 4l3 3.5M17 20V4M17 20l3-3.5M17 20l-3-3.5" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      )}
      <div style={{maxHeight:440,overflow:"auto"}}>
        {groups.map(g => {
          const gOn = grpChecked(g);
          const open = expanded[g.id];
          const visible = showMore[g.id] ? g.reasons : g.reasons.slice(0, g.initial || g.reasons.length);
          const moreCount = g.reasons.length - (g.initial || g.reasons.length);
          return (
            <div key={g.id}>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 18px",background:"#f7f9fc",borderTop:"1px solid #f1f5f9"}}>
                <span onClick={()=>{ if(!disabled) setExpanded(e=>({...e,[g.id]:!e[g.id]})); }} style={{display:"inline-flex",cursor:disabled?"default":"pointer",color:"#333333",transition:"transform .15s",transform:open?"rotate(0deg)":"rotate(-90deg)"}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 8 L19 8 L12 17 Z" fill="currentColor" /></svg>
                </span>
                <label onClick={()=>toggleGroup(g)} style={{display:"inline-flex",alignItems:"center",gap:10,cursor:disabled?"default":"pointer",flex:1,minWidth:0}}>
                  <NABox on={gOn} disabled={disabled} />
                  <span style={{display:"inline-flex",alignItems:"center",gap:6,minWidth:0}}>
                    {g.id==="manual" && (
                      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" style={{flexShrink:0,color:disabled?"#9aa1ad":"#5B8FF9"}}>
                        <circle cx="8" cy="5" r="2.6" fill="currentColor" />
                        <path d="M2.6 13.4c0-2.6 2.4-4.2 5.4-4.2s5.4 1.6 5.4 4.2z" fill="currentColor" />
                      </svg>
                    )}
                    <span style={{font:"500 14px/18px Roboto",color: disabled?"#9aa1ad":"#1f2937",whiteSpace:"nowrap"}}>{g.label}</span>
                  </span>
                  <span style={{font:"400 12px/16px Roboto",color:"#94a3b8",whiteSpace:"nowrap"}}>- {g.note}</span>
                </label>
                <span style={{font:"600 13px/16px Roboto",color: disabled?"#b6bcc6":"#2563eb",whiteSpace:"nowrap"}}>{hideCounts ? "" : `${pad2(grpSelected(g))} / ${pad2(g.total)}`}</span>
              </div>
              {open && visible.map(r => {
                const id = idOf(g.id, r); const on = !!checked[id];
                return (
                  <label key={id} onClick={()=>toggle(id)} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px 10px 42px",cursor:disabled?"default":"pointer"}}>
                    <NABox on={on} disabled={disabled} />
                    <span title={r.label} style={{font:"400 13px/17px Roboto",color: disabled?"#b6bcc6":"#334155",flex:1,minWidth:0,textAlign:"left",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.label}</span>
                    {!hideCounts && <span style={{font:"600 13px/16px Roboto",color: disabled?"#d8b4b4":"#dc2626",whiteSpace:"nowrap"}}>{pad2(r.count)}</span>}
                  </label>
                );
              })}
              {open && !showMore[g.id] && moreCount > 0 && (
                <div style={{padding:"2px 18px 12px",textAlign:"center"}}>
                  <button type="button" onClick={()=>setShowMore(s=>({...s,[g.id]:true}))} style={{border:"none",background:"transparent",color:"#2563eb",cursor:"pointer",font:"500 13px/16px Roboto",padding:0}}>+ {pad2(moreCount)} More</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!disabled && (
        <div style={{display:"flex",justifyContent:"flex-end",padding:"12px 18px",borderTop:"1px solid #f1f5f9"}}>
          <button type="button" onClick={() => {
            if (onApply) {
              const selected = [];
              groups.forEach(g => g.reasons.forEach(r => { if (checked[idOf(g.id, r)]) selected.push(r.label); }));
              // All selected → no reason narrowing (just the Needs-Attention filter).
              onApply(selected.length === allIds.length ? [] : selected);
            }
            onClose();
          }} style={{border:"none",borderRadius:6,padding:"7px 16px",font:"500 13px/18px Roboto",cursor:"pointer",background:"#2563eb",color:"#fff"}}>Show Records</button>
        </div>
      )}
    </div>
  );
}

// === Status summary strip (clickable, mirrors ERVStatusStrip) ===
function ARVStatusStrip({ activeStatus, onPick, counts, atActive }) {
  const [openMenu, setOpenMenu] = useP(null);
  const rootRef = React.useRef(null);
  React.useEffect(()=>{ if(!openMenu) return; const h=(e)=>{ if(rootRef.current && !rootRef.current.contains(e.target)) setOpenMenu(null); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[openMenu]);
  return (
    <div ref={rootRef} style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333333",flexShrink:0,letterSpacing:"0.01em"}}>
        <span>Auth</span>
        <span>Status</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-start",flex:1}}>
        {ARV_AUTH_STATUS.map((s) => {
          const active = activeStatus === s.id;
          const dim = activeStatus && !active;
          return (
            <div key={s.id} role="button" onClick={()=>onPick(active ? null : s.id)}
              style={{flex:`${s.weight || 1} 1 0`,minWidth:0,padding:"10px 12px 12px",cursor:"pointer",opacity:(dim&&s.id!=="all")?0.35:1,transition:"opacity .12s, background .12s",background: active ? "#f8fafc" : "transparent",position:"relative"}}
              onMouseEnter={(e)=>{ if(!active && !dim) e.currentTarget.style.background = "#fafbfc"; }}
              onMouseLeave={(e)=>{ if(!active) e.currentTarget.style.background = "transparent"; }}>
              <div style={{height:3,borderRadius:2,background:s.color,opacity: active ? 1 : 0.85,marginBottom:8}}></div>
              <div style={{display:"flex",alignItems:"center",gap:5,font:"400 12px/16px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#333333",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={s.label}>
                {s.icon === "person" && <img src={(window.__resources&&window.__resources.mdiUser)||"icons/mdi-user.png"} alt="" style={{width:14,height:14,objectFit:"contain",flexShrink:0}} />}
                <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{s.label}</span>
                {s.caret && (
                  <span style={{display:"inline-flex",flexShrink:0}}>
                    <button type="button" title="Sub-status breakdown" onClick={(e)=>{ e.stopPropagation(); setOpenMenu(m=>m===s.id?null:s.id); }}
                      style={{width:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center",border:"none",background:"transparent",cursor:"pointer",color:"#2563eb",padding:0}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 8 L19 8 L12 17 Z" fill="currentColor" /></svg>
                    </button>
                  </span>
                )}
              </div>
              <div style={{font:"600 18px/22px Roboto",color:(dim&&s.id==="all")?"#b0b0b0":"#0f172a",marginTop:4}}>{counts ? pad2(counts[s.id] || 0) : s.value}</div>
              {s.caret && openMenu===s.id && <ARVSubStatusMenu items={ARV_SUBSTATUS[s.id]} disabled={!!atActive} onClose={()=>setOpenMenu(null)} />}
              {activeStatus && s.id === "all" && (
                <button type="button" onClick={(e)=>{ e.stopPropagation(); onPick(null); }} style={{marginTop:4,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}>
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

// === Automation (AT) status line (icons, mirrors ERV) ==========
// === Automation (AT) status line (clickable, dynamic, dims siblings) ===
const ARV_AT = [
  { id:"completed",  label:"Completed",       icon:(window.__resources&&window.__resources.atCompleted)||"icons/at-completed.png",       at:"thumb" },
  { id:"warning",    label:"Needs Attention", icon:(window.__resources&&window.__resources.atNeedsAttention)||"icons/at-needs-attention.png", at:"warning", caret:true, num:"#d97706" },
  { id:"inprogress", label:"In Progress",     icon:(window.__resources&&window.__resources.atInProgress)||"icons/at-in-progress.png",     at:"hourglass" },
];
function ARVAutomationStatus({ atFilter, onFilter, atCounts, statusActive, onApply, selectedReasons }) {
  const [openMenu, setOpenMenu] = useP(false);
  const rootRef = React.useRef(null);
  React.useEffect(()=>{ if(!openMenu) return; const h=(e)=>{ if(rootRef.current && !rootRef.current.contains(e.target)) setOpenMenu(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[openMenu]);
  return (
    <div ref={rootRef} style={{display:"flex",alignItems:"center",font:"400 13px/16px Roboto",color:"#333333"}}>
      <span style={{color:"#94a3b8",marginRight:12}}>Automation (AT) Status :</span>
      {ARV_AT.map((s,i)=>{
        const active = atFilter===s.id;
        const dim = atFilter && !active;
        return (
          <React.Fragment key={s.id}>
            {i>0 && <span style={{width:1,height:18,background:"#e2e8f0",margin:"0 12px"}}></span>}
            <button type="button" onClick={()=>onFilter(active?null:s.id)} title={`Filter: ${s.label}`}
              style={{background:"transparent",border:"none",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,padding:"2px 6px",borderRadius:4,opacity:dim?0.4:1,transition:"opacity .12s",position:"relative"}}>
              <img src={s.icon} alt="" style={{width:18,height:18,objectFit:"contain"}} />
              <span style={{color:"#0f172a",fontSize:14}}>{s.label}</span>
              {s.id==="warning" && selectedReasons && selectedReasons.length
                ? <span style={{display:"inline-flex",alignItems:"center",gap:7,background:"#FBF3DE",borderRadius:8,padding:"3px 12px"}}>
                    <img src={(window.__resources&&window.__resources.filterIcon)||"icons/filter.svg"} alt="" style={{width:16,height:16,objectFit:"contain"}} />
                    <span style={{fontWeight:600,color:"#5c5c5c",fontSize:15}}>{pad2(atCounts?(atCounts.warning||0):0)}</span>
                  </span>
                : <span style={{fontWeight:600,color:s.num||"#0f172a"}}>{pad2(atCounts?(atCounts[s.id]||0):0)}</span>}
              {s.caret && (
                <span style={{position:"relative",display:"inline-flex"}}>
                  <span title="Sub-status breakdown" onClick={(e)=>{ e.stopPropagation(); setOpenMenu(o=>!o); }}
                    style={{width:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#2563eb"}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 8 L19 8 L12 17 Z" fill="currentColor" /></svg>
                  </span>
                  {openMenu && <ARVNeedsAttentionMenu disabled={!!statusActive} naCount={atCounts?(atCounts.warning||0):0} selectedReasons={selectedReasons} onApply={onApply} onClose={()=>setOpenMenu(false)} />}
                </span>
              )}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// === Auth Details sub-table (accordion child, gray panel) =======
const svcLines = {
  default: [
    { svc:"SN", track:"P2114324789", reqRange:"04/28/25 - 05/19/25", auth:"B235054831", pyrResp:"04/26/25", apprRange:"04/28/25 - 05/19/25", req:"04", apprvd:"04", denied:"-", pending:"-", expire:"09", lastChk:"04/25/25", at:"thumb", status:"approved" },
    { svc:"PT", track:"P2114324789", reqRange:"04/28/25 - 05/19/25", auth:"B235054831", pyrResp:"04/26/25", apprRange:"04/28/25 - 05/19/25", req:"04", apprvd:"04", denied:"-", pending:"-", expire:"09", lastChk:"04/25/25", at:"thumb", status:"approved" },
  ],
};
const ARV_CHILD_GRID =
  "56px minmax(120px,1.2fr) minmax(170px,1.7fr) minmax(120px,1.2fr) minmax(96px,1fr) " +
  "minmax(170px,1.7fr) 54px 64px 64px 70px minmax(96px,1fr) minmax(100px,1.05fr) " +
  "minmax(120px,1.25fr) minmax(120px,1.3fr) 74px";
const ARV_CHILD_COLS = [
  { label:"SVC" }, { label:"Auth Tracking #" }, { label:"Auth Req Start & End Date" },
  { label:"Authorization#" }, { label:"Pyr Resp Date" }, { label:"Approved Start & End Date" },
  { label:"Req", align:"center" }, { label:"Apprvd", align:"center" }, { label:"Denied", align:"center" },
  { label:"Pending", align:"center" }, { label:"Days to Expire", align:"center" }, { label:"Last Status Chck" },
  { label:"AT Status" }, { label:"Auth Status" }, { label:"Reviewed?", align:"center", key:"docs" },
];
function AuthDetailsPanel({ row, entry, onEdit }) {
  const pending = !entry && row.status === "pending_submission";
  const refNo = (entry && entry.authNo) || ("REF" + String(row.epi||"").replace(/\D/g,"").padEnd(10,"0").slice(0,10));
  let lines;
  if (entry) lines = entry.lines;
  else if (pending) lines = [{ svc:"SN", req:"03" },{ svc:"PT", req:"03" }].map(x => ({ svc:x.svc, track:"-", reqRange:"-", auth:"-", pyrResp:"-", apprRange:"-", req:x.req, apprvd:"-", denied:"-", pending:"-", expire:"-", lastChk:"-", at:"none", status:"pending_submission" }));
  else lines = svcLines.default;
  const cell = (align) => ({font:"500 12px/16px Roboto",color:"#334155",display:"flex",alignItems:"center",justifyContent:align==="center"?"center":"flex-start",height:52,padding:"0 8px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0});
  const dash = <span style={{color:"#cbd5e1"}}>-</span>;
  return (
    <div style={{background:"#f4f5f7",border:"1px solid #e2e8f0",borderTop:"none",borderRadius:"0 0 6px 6px",padding:"16px 20px 18px",marginBottom:8}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
        <span style={{font:"600 15px/20px Roboto",color:"#0f172a"}}>Auth Details - {refNo}</span>
        {(pending || entry) && onEdit && (
          <button type="button" onClick={(e)=>{ e.stopPropagation(); onEdit(); }} style={{border:"none",background:"#2563eb",color:"#fff",borderRadius:5,padding:"5px 12px",font:"500 12px/16px Roboto",cursor:"pointer"}}>Edit Details</button>
        )}
        <a href="#" onClick={(e)=>e.preventDefault()} style={{font:"400 12px/16px Roboto",color:"#2563eb",textDecoration:"none"}}>View Automation Log</a>
      </div>
      <div style={{border:"1px solid #e5e7eb",borderRadius:8,overflow:"hidden",background:"#fff"}}>
        <div style={{overflowX:"auto"}}>
          <div style={{minWidth:1500}}>
            <div style={{display:"grid",gridTemplateColumns:ARV_CHILD_GRID,alignItems:"center",background:"#f0f1fb",borderBottom:"1px solid #e5e7eb"}}>
              {ARV_CHILD_COLS.map((c,i)=>(
                <div key={i} style={{font:"500 12px/16px Roboto",color:"#333333",display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",height:44,padding:"0 8px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.key==="docs"?<img src={(window.__resources&&window.__resources.attachmentType)||"icons/attachment-type.svg"} width={18} height={18} alt="Docs" style={{display:"block"}} />:c.label}</div>
              ))}
            </div>
            {lines.map((l,i)=>{
              const isDash = (v) => v==null || v==="-" || v==="";
              return (
              <div key={i} style={{display:"grid",gridTemplateColumns:ARV_CHILD_GRID,alignItems:"center",background:"#fff",borderBottom:i===lines.length-1?"none":"1px solid #eef2f7"}}>
                <div style={{...cell(),fontWeight:500}}>{l.svc}</div>
                <div style={cell()}>{isDash(l.track)?dash:l.track}</div>
                <div style={cell()}>{isDash(l.reqRange)?dash:l.reqRange}</div>
                <div style={cell()}>{isDash(l.auth)?dash:l.auth}</div>
                <div style={cell()}>{isDash(l.pyrResp)?dash:l.pyrResp}</div>
                <div style={cell()}>{isDash(l.apprRange)?dash:l.apprRange}</div>
                <div style={cell("center")}>{isDash(l.req)?dash:l.req}</div>
                <div style={cell("center")}>{isDash(l.apprvd)?dash:<span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",minWidth:26,padding:"2px 6px",borderRadius:10,background:"rgba(22,163,74,0.16)",font:"500 11px/14px Roboto",color:"#334155"}}>{l.apprvd}</span>}</div>
                <div style={cell("center")}>{isDash(l.denied)?dash:<span style={{color:"#dc2626",fontWeight:600}}>{l.denied}</span>}</div>
                <div style={cell("center")}>{isDash(l.pending)?dash:l.pending}</div>
                <div style={cell("center")}>{isDash(l.expire)?dash:l.expire}</div>
                <div style={cell()}>{isDash(l.lastChk)?dash:l.lastChk}</div>
                <div style={cell()}>{l.at==="none"||!l.at ? dash : <span style={{display:"inline-flex",alignItems:"center",gap:6}}><ARVATIcon kind={l.at} /><span style={{color:"#0f172a"}}>Completed</span></span>}</div>
                <div style={cell()}><ARVAuthPill kind={l.status} /></div>
                <div style={cell("center")} onClick={(e)=>{e.stopPropagation();window.__openDocs&&window.__openDocs({...row,...l},true);}} style={{cursor:"pointer"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="9" ry="6" stroke="#2563eb" strokeWidth="1.8"/><circle cx="12" cy="12" r="2.5" fill="#2563eb"/></svg></div>
              </div>
            );})}
          </div>
        </div>
      </div>
    </div>
  );
}

// === Auth Request rows (matches Figma sample) ===================
const arvRows = [
  { key:"r1",  name:"Marvin Mckinney",   mrn:"B6100062245601", mid:"11521357", agency:"Agency 2", branch:"A02", src:"Aetna Me.",   ptype:"Mcare Adv",  gw:"Carelon",  mode:"gear",   epi:"Epi964256", type:"Re-cert", init:"04/15/25", sub:"04/25/25", auth:"Multiple",    sum:{r:"08",a:"08",d:"-",p:"-"},  pyrResp:"04/26/25", at:"thumb",     status:"approved" },
  { key:"r2",  name:"Esther Howard",     mrn:"B6789012345678", mid:"55493027", agency:"Agency 1", branch:"A01", src:"Star + Plu:", ptype:"Medicare",   gw:"-",        mode:"person", epi:"I1J2K3L4",  type:"Recert",  init:"04/16/25", sub:"-",        auth:"-",           sum:{r:"06",a:"-",d:"-",p:"-"},   pyrResp:"-",         at:"none",      status:"pending_submission" },
  { key:"r3",  name:"Wade Warren",       mrn:"B6789012345685", mid:"42512413", agency:"Agency 1", branch:"A05", src:"Humana",      ptype:"Mcare Adv",  gw:"Availity", mode:"gear",   epi:"TY964257",  type:"Addl.",   init:"04/17/25", sub:"04/21/25", auth:"-",           sum:{r:"06",a:"06",d:"-",p:"-"},  pyrResp:"04/11/25", at:"thumb",     status:"approved" },
  { key:"r4",  name:"Robert Fox",        mrn:"B6789012345685", mid:"69420061", agency:"Agency 1", branch:"A03", src:"Humana",      ptype:"Commercial", gw:"Availity", mode:"gear",   epi:"G3H4I5J6",  type:"Addl.",   init:"04/18/25", sub:"04/20/25", auth:"Multiple",    sum:{r:"28",a:"28",d:"-",p:"-"},  pyrResp:"04/17/25", at:"warning",   status:"exception", atReason:"Patient record not available in the grid" },
  { key:"r5",  name:"Cameron William",   mrn:"B6100054445634", mid:"97014890", agency:"Agency 1", branch:"A08", src:"Aetna Me.",   ptype:"Mcare Adv",  gw:"Carelon",  mode:"gear",   epi:"K7L8M9N0",  type:"Initial.",init:"04/19/25", sub:"04/19/25", auth:"-",           sum:{r:"05",a:"-",d:"05",p:"-"},  pyrResp:"04/01/25", at:"warning",   status:"exception", atReason:"Review eligibility popup occurred" },
  { key:"r6",  name:"Brooklyn Sims",     mrn:"V6789012345678", mid:"16628235", agency:"Agency 1", branch:"A01", src:"Humana",      ptype:"Mcare Adv",  gw:"Availity", mode:"gear",   epi:"E7F8G9H0",  type:"Addl.",   init:"04/20/25", sub:"04/19/25", auth:"A235031279",  sum:{r:"34",a:"34",d:"-",p:"-"},  pyrResp:"03/12/25", followUp:"", at:"thumb",     status:"approved" },
  { key:"r7",  name:"Jacob Jones",       mrn:"V6789012345678", mid:"10434991", agency:"Agency 1", branch:"A04", src:"Anthem A",    ptype:"Medicare",   gw:"Carelon",  mode:"gear",   epi:"Y7Z8A9B0",  type:"Initial", init:"04/21/25", sub:"04/19/25", auth:"A235038713",  sum:{r:"21",a:"12",d:"09",p:"-"}, pyrResp:"03/11/25", followUp:"", at:"hourglass", status:"partial" },
  { key:"r8",  name:"Jamie Hebert",      mrn:"B6789015455688", mid:"63928475", agency:"Agency 1", branch:"A02", src:"Star + Plu:", ptype:"Medicare",   gw:"-",        mode:"person", epi:"I1J2K3L4",  type:"Recert",  init:"04/22/25", sub:"04/19/25", auth:"-",           sum:{r:"06",a:"-",d:"-",p:"-"},   pyrResp:"-",        followUp:"",         at:"none",      status:"pending_submission" },
  { key:"r9",  name:"Guy Hawkins",       mrn:"B6789012345685", mid:"30214786", agency:"Agency 1", branch:"A06", src:"Aetna Me.",   ptype:"Mcare Adv",  gw:"Carelon",  mode:"gear",   epi:"A3B4C5D6",  type:"Initial", init:"04/23/25", sub:"04/103/25",auth:"-",           sum:{r:"14",a:"-",d:"-",p:"14"},  pyrResp:"-",        followUp:"", at:"thumb",     status:"pending" },
  { key:"r10", name:"Jenny Wilson",      mrn:"B6789012345711", mid:"43242523", agency:"Agency 1", branch:"A03", src:"Humana",      ptype:"Commercial", gw:"Availity", mode:"gear",   epi:"M5N6O7P8",  type:"Addl.",   init:"04/24/25", sub:"04/01/25", auth:"A235037543",  sum:{r:"05",a:"05",d:"-",p:"-"},  pyrResp:"03/28/25", followUp:"", at:"thumb",     status:"denied" },
  { key:"r11", name:"Kristin Watson",    mrn:"B6789012345801", mid:"20481123", agency:"Agency 1", branch:"A05", src:"Humana",      ptype:"Mcare Adv",  gw:"Availity", mode:"gear",   epi:"TY964257",  type:"Addl.",   init:"04/25/25", sub:"04/21/25", auth:"-",           sum:{r:"06",a:"06",d:"-",p:"-"},  pyrResp:"04/11/25", followUp:"", at:"warning",   status:"approved", atReason:"Unable to perform Update Auth Line and(or) Stage Complete" },
  { key:"r12", name:"Cody Fisher",       mrn:"B6789012345802", mid:"20481124", agency:"Agency 1", branch:"A01", src:"Humana",      ptype:"Mcare Adv",  gw:"Availity", mode:"gear",   epi:"E7F8G9H0",  type:"Addl.",   init:"04/26/25", sub:"04/19/25", auth:"A235031279",  sum:{r:"34",a:"34",d:"-",p:"-"},  pyrResp:"03/12/25", followUp:"", at:"thumb",     status:"approved" },
  { key:"r13", name:"Kathryn Murphy",    mrn:"B6789012345803", mid:"20481125", agency:"Agency 1", branch:"A04", src:"Anthem A",    ptype:"Medicare",   gw:"Carelon",  mode:"gear",   epi:"Y7Z8A9B0",  type:"Initial", init:"04/27/25", sub:"04/19/25", auth:"A235038713",  sum:{r:"21",a:"12",d:"09",p:"-"}, pyrResp:"03/11/25", followUp:"", at:"warning",   status:"partial", atReason:"Availity error message occurred preventing submission" },
  { key:"r14", name:"Devon Lane",        mrn:"B6789012345804", mid:"20481126", agency:"Agency 1", branch:"A06", src:"Aetna Me.",   ptype:"Mcare Adv",  gw:"Carelon",  mode:"gear",   epi:"A3B4C5D6",  type:"Initial", init:"04/28/25", sub:"04/103/25",auth:"-",           sum:{r:"14",a:"-",d:"-",p:"14"},  pyrResp:"-",        followUp:"", at:"thumb",     status:"pending" },
  { key:"r15", name:"Dianne Russell",    mrn:"B6789012345805", mid:"20481127", agency:"Agency 1", branch:"A03", src:"Humana",      ptype:"Commercial", gw:"Availity", mode:"gear",   epi:"M5N6O7P8",  type:"Addl.",   init:"04/29/25", sub:"04/01/25", auth:"A235037543",  sum:{r:"05",a:"05",d:"-",p:"-"},  pyrResp:"03/28/25", followUp:"", at:"warning",   status:"denied", atReason:"Unable to select the desired location" },
  { key:"r16", name:"Arlene McCoy",      mrn:"B6789012345806", mid:"20481129", agency:"Agency 2", branch:"A02", src:"Aetna Me.",   ptype:"Mcare Adv",  gw:"Carelon",  mode:"gear",   epi:"Epi964256", type:"Re-cert", init:"04/30/25", sub:"04/25/25", auth:"Multiple",    sum:{r:"08",a:"08",d:"-",p:"-"},  pyrResp:"04/26/25", followUp:"", at:"thumb",     status:"approved" },
];
// Expose the Auth Request rows so the Dashboard's Authorization charts can
// derive every KPI + chart directly from this table.
if (typeof window !== "undefined") window.arvRows = arvRows;

// === Column geometry (CSS grid, spreads to the end) ============
const ARV_COLS = [
  { key:"name",     label:"Patient Name",   grid:"minmax(148px,1.4fr)",  sortable:true                  },
  { key:"mrn",      label:"MRN",            grid:"minmax(108px,0.95fr)", sortable:true                  },
  { key:"mid",      label:"Mem ID",         grid:"minmax(68px,0.78fr)",  sortable:true                  },
  { key:"agency",   label:"Agency",         grid:"minmax(52px,0.58fr)",  sortable:true                  },
  { key:"branch",   label:"Branch",         grid:"minmax(46px,0.5fr)",   sortable:true                  },
  { key:"src",      label:"Pyr Src",        grid:"minmax(54px,0.6fr)",   sortable:true                  },
  { key:"gw",       label:"GW",             grid:"minmax(52px,0.56fr)",  sortable:true                  },
  { key:"mode",     label:"Mode",           grid:"72px",                 sortable:true,  align:"center", info:true },
  { key:"epi",      label:"Epi ID",         grid:"minmax(60px,0.65fr)"                                  },
  { key:"type",     label:"Auth Type",      grid:"minmax(50px,0.55fr)"                                  },
  { key:"init",     label:"Auth Init Dt",   grid:"minmax(64px,0.7fr)",   info:true                      },
  { key:"sub",      label:"Auth Sub Dt",    grid:"minmax(64px,0.7fr)",   info:true                      },
  { key:"auth",     label:"Authorization#", grid:"minmax(84px,0.95fr)"                                  },
  { key:"summary",  label:"Auth Req Summary",grid:"minmax(140px,1.4fr)", align:"center"                 },
  { key:"pyrResp",  label:"Pyr Resp Dt",    grid:"minmax(70px,0.78fr)",  sortable:true                  },
  { key:"followUp", label:"Follow up Dt",   grid:"minmax(72px,0.8fr)",   sortable:true                  },
  { key:"at",       label:"AT Status",      grid:"72px",                 sortable:true,  align:"center" },
  { key:"status",   label:"Auth Status",    grid:"minmax(122px,1.3fr)",  sortable:true,  align:"center", caret:true },
  { key:"docs",     label:"Docs",           grid:"44px",                 align:"center"                 },
  { key:"reviewed", label:"Reviewed?",      grid:"70px",                 align:"center"                 },
];
const ARV_GRID = ARV_COLS.map(c => c.grid).join(" ");

function InfoCircle({ size=13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{display:"inline-block",verticalAlign:"middle",flex:"none"}}>
      <path d="M7 0.875C3.61758 0.875 0.875 3.61758 0.875 7C0.875 10.3824 3.61758 13.125 7 13.125C10.3824 13.125 13.125 10.3824 13.125 7C13.125 3.61758 10.3824 0.875 7 0.875ZM7.4375 9.95312C7.4375 10.0133 7.38828 10.0625 7.32812 10.0625H6.67188C6.61172 10.0625 6.5625 10.0133 6.5625 9.95312V6.23438C6.5625 6.17422 6.61172 6.125 6.67188 6.125H7.32812C7.38828 6.125 7.4375 6.17422 7.4375 6.23438V9.95312ZM7 5.25C6.82827 5.24649 6.66476 5.17581 6.54455 5.05312C6.42434 4.93044 6.35701 4.76551 6.35701 4.59375C6.35701 4.42199 6.42434 4.25706 6.54455 4.13438C6.66476 4.01169 6.82827 3.94101 7 3.9375C7.17173 3.94101 7.33524 4.01169 7.45545 4.13438C7.57566 4.25706 7.64299 4.42199 7.64299 4.59375C7.64299 4.76551 7.57566 4.93044 7.45545 5.05312C7.33524 5.17581 7.17173 5.24649 7 5.25Z" fill="rgba(0,0,0,0.45)"/>
    </svg>
  );
}

function ScrollBody({ children }) {
  const ref = React.useRef(null);
  const [maxH, setMaxH] = React.useState(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const calc = () => {
      const top = el.getBoundingClientRect().top;
      setMaxH(Math.max(200, Math.floor(window.innerHeight - top - 16)));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return (
    <div ref={ref} className="ws-scrollbody"
      style={{ maxHeight: maxH ? maxH + "px" : undefined, overflowY: "auto", paddingTop: 8, paddingRight: 8, marginRight: -18 }}>
      {children}
    </div>
  );
}

function ARVSortArrows({ active, dir }) {
  const up = active && dir==="asc" ? "#2563eb" : "rgba(0,0,0,0.25)";
  const down = active && dir==="desc" ? "#2563eb" : "rgba(0,0,0,0.25)";
  return (
    <svg width="10" height="15" viewBox="0 0 9 14" fill="none" style={{marginRight:3,flex:"none"}}>
      <path d="M7.74699 7.40234H1.25301C1.05823 7.40234 0.949473 7.608 1.0701 7.7484L4.31708 11.5135C4.41003 11.6213 4.58899 11.6213 4.68291 11.5135L7.9299 7.7484C8.05053 7.608 7.94177 7.40234 7.74699 7.40234Z" fill={down}/>
      <path d="M7.9299 6.24825L4.68291 2.48317C4.58997 2.3754 4.41101 2.3754 4.31708 2.48317L1.0701 6.24825C0.949473 6.38865 1.05823 6.59431 1.25301 6.59431H7.74699C7.94177 6.59431 8.05053 6.38865 7.9299 6.24825Z" fill={up}/>
    </svg>
  );
}

function ARVHeader({ sortKey, sortDir, onSort }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:ARV_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",minHeight:48,padding:"0 12px",gap:8}}>
      {ARV_COLS.map(c => {
        if (c.key === "summary") {
          return (
            <div key={c.key} style={{textAlign:"center"}}>
              <div style={{font:"500 11px/14px Roboto",color:"#64748b",whiteSpace:"nowrap"}}>Auth Req Summary</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",marginTop:3,font:"500 11px Roboto",color:"#94a3b8"}}><span style={{textAlign:"center"}}>R</span><span style={{textAlign:"center"}}>A</span><span style={{textAlign:"center"}}>D</span><span style={{textAlign:"center"}}>P</span></div>
            </div>
          );
        }
        return (
          <div key={c.key} onClick={c.sortable ? ()=>onSort(c.key) : undefined}
            style={{font:"500 11px/14px Roboto",color:"#64748b",display:"flex",alignItems:"center",justifyContent:c.align==="center"?"center":"flex-start",cursor:c.sortable?"pointer":"default",userSelect:"none",whiteSpace:"nowrap",overflow:"hidden",gap:2}}>
            {c.sortable && <ARVSortArrows active={sortKey === c.key} dir={sortDir} />}
            {c.key==="docs" ? c.label : c.label}
            {c.info && <InfoCircle />}
            {c.caret && <span style={{color:"#cbd5e1",fontSize:9}}>▽</span>}
          </div>
        );
      })}
    </div>
  );
}

// ── Add Note + Follow-up Modal (shared, exported to window) ─
function AddNoteModal({ row, onSave, onClose }) {
  const [note, setNote] = useP("");
  const [date, setDate] = useP("");
  const canSave = note.trim() && date;
  const fmtDate = (d) => { if(!d) return ""; const [y,m,dd]=d.split("-"); return `${m}/${dd}/${y.slice(2)}`; };
  React.useEffect(()=>{
    const h=(e)=>{ if(e.key==="Escape") onClose(); };
    document.addEventListener("keydown",h); return ()=>document.removeEventListener("keydown",h);
  },[]);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:10,padding:"28px 32px",width:440,boxShadow:"0 12px 40px rgba(15,23,42,0.18)",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{font:"600 16px/22px Roboto",color:"#0f172a"}}>Add Note &amp; Follow-up Date</div>
        {row && <div style={{font:"400 12px/16px Roboto",color:"#64748b"}}>{row.name} · {row.mrn}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <label style={{font:"500 12px/16px Roboto",color:"#374151"}}>Note <span style={{color:"#ef4444"}}>*</span></label>
          <textarea value={note} onChange={e=>setNote(e.target.value)} autoFocus rows={4} placeholder="Write a note…"
            style={{border:"1px solid #d1d5db",borderRadius:6,padding:"8px 10px",font:"400 13px/18px Roboto",color:"#0f172a",outline:"none",resize:"vertical",fontFamily:"Roboto,sans-serif"}} />
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <label style={{font:"500 12px/16px Roboto",color:"#374151"}}>Follow-up Date <span style={{color:"#ef4444"}}>*</span></label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)}
            style={{border:"1px solid #d1d5db",borderRadius:6,padding:"8px 10px",font:"400 13px/18px Roboto",color:"#0f172a",outline:"none",width:"100%",boxSizing:"border-box"}} />
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:4}}>
          <button onClick={onClose} style={{border:"1px solid #d1d5db",background:"#fff",color:"#374151",borderRadius:6,padding:"8px 20px",font:"500 13px/18px Roboto",cursor:"pointer"}}>Cancel</button>
          <button disabled={!canSave} onClick={()=>canSave&&onSave(note.trim(),fmtDate(date))}
            style={{border:"none",background:canSave?"#1677FF":"#93c5fd",color:"#fff",borderRadius:6,padding:"8px 20px",font:"500 13px/18px Roboto",cursor:canSave?"pointer":"default"}}>Save</button>
        </div>
      </div>
    </div>
  );
}
if(typeof window!=="undefined") window.AddNoteModal = AddNoteModal;

function ARVRow({ row, expanded, onToggle, onPatient, onEnterDetails, entry, reviewed, onReviewed, onFollowUp, showLeftBar, density="comfortable", showRowShadow=true, chevronStyle="triangle", checkboxAccent="#2563eb" }) {
  const accent = "#2563eb";
  const effStatus = entry ? entry.status : row.status;
  const fmtISO = (iso) => { if(!iso) return null; const p=String(iso).split("-"); return p.length===3?`${p[1]}/${p[2]}/${p[0].slice(2)}`:iso; };
  const entryPyrResp = entry&&entry.lines&&entry.lines.map(l=>l.pyrResp).find(v=>v&&v!=="-");
  const cell = (align) => ({font:"500 12px/16px Roboto",color:"#333333",display:"flex",alignItems:"center",justifyContent:align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0});
  const stop = (e) => e.stopPropagation();
  const rowH = density==="cozy" ? 46 : density==="roomy" ? 60 : 52;
  const dash = <span style={{color:"#cbd5e1"}}>—</span>;
  const box = (v, muted) => <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"4px 8px",border:"1px solid #e2e8f0",borderRadius:4,background:"#fff",font:"400 12px/15px Roboto",color: muted?"#94a3b8":"#0f172a",width:"100%",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</span>;
  const sumCell = (v, tone) => (v==="-"||v==null)
    ? <span style={{color:"#cbd5e1",font:"500 11px Roboto"}}>-</span>
    : <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",minWidth:26,padding:"2px 6px",borderRadius:10,font:"500 11px/14px Roboto",color:"#334155",background: tone==="a"?"rgba(22,163,74,0.16)":tone==="d"?"rgba(220,38,38,0.14)":"transparent"}}>{v}</span>;
  // Derive RADP from saved entry lines when available, so the row reflects entered values.
  function computeS() {
    if (entry && entry.lines && entry.lines.length) {
      const tot = (field) => entry.lines.reduce((acc, ln) => { const v = ln[field]; return acc + (v && v !== "-" ? (parseInt(v, 10) || 0) : 0); }, 0);
      const fmt = (n) => n > 0 ? String(n).padStart(2, "0") : "-";
      return { r: fmt(tot("req")), a: fmt(tot("apprvd")), d: fmt(tot("denied")), p: fmt(tot("pending")) };
    }
    return row.sum;
  }
  const s = computeS();
  return (
    <React.Fragment>
      <div className="arv-row"
        style={{display:"grid",gridTemplateColumns:ARV_GRID,alignItems:"center",height:rowH,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius: expanded ? "6px 6px 0 0" : 6,marginBottom: expanded ? 0 : (density==="cozy"?6:density==="roomy"?12:8),boxShadow: (showRowShadow && !expanded) ? "0 1px 2px rgba(15,23,42,0.03)" : "none",background:"#fff",gap:8,position:"relative"}}>
        {showLeftBar && <div style={{position:"absolute",left:8,top:8,bottom:8,width:3,background:"rgb(16,134,133)",borderRadius:2}}></div>}
        <div style={{...cell(),paddingLeft:showLeftBar?18:undefined}}>
          <span onClick={(e)=>{e.stopPropagation(); onToggle&&onToggle(row.key);}} title={expanded?"Collapse":"Expand"} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginRight:8,color:accent,transition:"transform .15s",transform: expanded?"rotate(90deg)":"rotate(0deg)",flexShrink:0}}>
            {chevronStyle==="plus"
              ? <span style={{font:"600 13px/1 Roboto"}}>{expanded?"":"+"}</span>
              : <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2 L11 7 L4 12 Z" fill="currentColor" /></svg>}
          </span>
          <a href="#" onClick={(e)=>{e.preventDefault(); e.stopPropagation(); onPatient&&onPatient(row);}} style={{color:accent,font:"500 13px/16px Roboto",textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis"}}>{row.name}</a>
        </div>
        <div style={cell()} title={row.mrn}>{row.mrn}</div>
        <div style={{...cell(),font:"500 12px/16px Roboto",color:"#16a34a"}} title={row.mid}>{row.mid}</div>
        <div style={cell()} title={row.agency}>{row.agency}</div>
        <div style={cell()} title={row.branch}>{row.branch}</div>
        <div style={cell()} title={row.src}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{row.src}</span></div>
        <div style={cell()} title={row.gw==='-'?'':row.gw}>{row.gw === "-" ? dash : row.gw}</div>
        <div style={cell("center")}>
          {row.mode === "gear"
            ? <img title="Automated" src={(window.__resources&&window.__resources.automated)||"icons/automated.png"} alt="Automated" style={{width:18,height:18,objectFit:"contain"}} />
            : row.mode === "person"
              ? <img title="Manual" src={(window.__resources&&window.__resources.mdiUser)||"icons/mdi-user.png"} alt="Manual" style={{width:16,height:16,objectFit:"contain"}} />
              : dash}
        </div>
        <div style={cell()} title={row.epi}>{row.epi}</div>
        <div style={cell()} title={row.type}>{row.type}</div>
        <div style={cell()}>{row.init || dash}</div>
        <div style={cell()}>{(entry&&entry.submittedAt?fmtISO(entry.submittedAt):null)||row.sub||dash}</div>
        <div style={cell()} onClick={stop}>{box(entry?entry.authNo:(row.auth==="-"?"-":row.auth), !entry&&(row.auth==="-"))}</div>
        <div style={{...cell("center"),display:"grid",gridTemplateColumns:"repeat(4,1fr)",alignItems:"center"}}>
          <span style={{display:"flex",justifyContent:"center"}}>{sumCell(s.r,"r")}</span>
          <span style={{display:"flex",justifyContent:"center"}}>{sumCell(s.a,"a")}</span>
          <span style={{display:"flex",justifyContent:"center"}}>{sumCell(s.d,"d")}</span>
          <span style={{display:"flex",justifyContent:"center"}}>{sumCell(s.p,"p")}</span>
        </div>
        <div style={cell()} onClick={stop}>{box(entryPyrResp||row.pyrResp||"-", !entryPyrResp&&(!row.pyrResp||row.pyrResp==="-"))}</div>
        <div style={cell()} onClick={stop}>
          <input type="text" value={row.followUp || ""} placeholder="—" onChange={(e)=>onFollowUp&&onFollowUp(row.key, e.target.value)}
            style={{width:"100%",border:"1px solid #e2e8f0",borderRadius:4,font:"400 11px/14px Roboto",padding:"4px 6px",color:"#0f172a",outline:"none",background:"#fff",minWidth:0}} />
        </div>
        <div style={cell("center")} title={row.at==="warning" ? (row.atReason || "Needs Attention") : undefined}><ARVATIcon kind={row.at} reason={row.atReason} /></div>
        <div style={cell("center")}><ARVAuthPill kind={effStatus} userIcon={row.mode!=="gear"} onClick={effStatus==="pending_submission" ? ()=>onEnterDetails&&onEnterDetails(row) : undefined} /></div>
        <div style={{...cell("center"),cursor:"pointer"}} onClick={(e)=>{e.stopPropagation();window.__openDocs&&window.__openDocs(row,false,entry);}}><DocIcon size={18} /></div>
        <div style={cell("center")} onClick={(e)=>{e.stopPropagation(); onReviewed&&onReviewed();}}>
          <span role="checkbox" aria-checked={!!reviewed} tabIndex={0} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:`1px solid ${reviewed?checkboxAccent:"#d8d8d8"}`,borderRadius:3,background:reviewed?checkboxAccent:"#fff",cursor:"pointer"}}>
            {reviewed && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}
          </span>
        </div>
      </div>
      {expanded && <AuthDetailsPanel row={row} entry={entry} onEdit={()=>onEnterDetails&&onEnterDetails(row)} />}
    </React.Fragment>
  );
}

// === Manage Authorization Request (Pending Submission → enter details) ===
// Full-screen modal for non-automated Pending-Submission auth requests, styled
// per the "Manage Authorization Request" frame. Opened from the row's "Edit
// Details" link or the "Pending Submission" status hyperlink.
const MA_INPUT = {width:"100%",border:"1px solid #d7dee7",borderRadius:6,padding:"8px 10px",font:"400 13px/18px Roboto",color:"#0f172a",outline:"none",background:"#fff",boxSizing:"border-box"};
function MADateInput({ value, onChange, placeholder="Enter Date" }) {
  return (
    <span style={{position:"relative",display:"block"}}>
      <input type="text" value={value||""} onChange={onChange} placeholder={placeholder} style={{...MA_INPUT, paddingRight:30}} />
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><rect x="3.5" y="5" width="17" height="15" rx="2" stroke="#94a3b8" strokeWidth="1.6"/><path d="M3.5 9.5h17M8 3.5v3.5M16 3.5v3.5" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round"/></svg>
    </span>
  );
}
function MABannerField({ label, value, big }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:big?4:5,minWidth:0}}>
      <span style={{font:"400 13px/16px Roboto",color:"#7c8698",whiteSpace:"nowrap"}}>{label}</span>
      <span style={{font: big ? "600 21px/26px Roboto" : "400 15px/20px Roboto", color: big ? "#1c2d42" : "#334155", whiteSpace:"nowrap"}}>{value || "—"}</span>
    </div>
  );
}
function MASmallBox({ value, highlight }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",minWidth:38,height:34,padding:"0 8px",borderRadius:6,border:`1px solid ${highlight?"#9CC3F5":"#dbe2ea"}`,background: highlight?"#EAF3FE":"#fff",font:"500 14px/1 Roboto",color: value==="-"?"#94a3b8":"#0f172a"}}>{value}</span>
  );
}
function AuthEntryDrawer({ row, onClose, onSave, initialEntry, onNoteAdded }) {
  const r = row || {};
  const [tab, setTab] = useP("auth");
  const [authSubDate, setAuthSubDate] = useP(initialEntry && initialEntry.submittedAt ? initialEntry.submittedAt : "");
  const [docsOpen, setDocsOpen] = useP(false);
  const [docsTab, setDocsTab] = useP("request");
  const [notes, setNotes] = useP(initialEntry && Array.isArray(initialEntry.notes) ? initialEntry.notes : (window.__authNotes && window.__authNotes[r.key] || []));
  const persistAuthNotes = (n) => { window.__authNotes = window.__authNotes||{}; window.__authNotes[r.key]=n; setNotes(n); };
  const [addingNote, setAddingNote] = useP(false);
  const [noteDraft, setNoteDraft] = useP("");
  const [noteFollow, setNoteFollow] = useP("");
  const [noteService, setNoteService] = useP("Authorization");
  const newLine = (svc) => ({ svc: svc||"Skilled Nursing", auth:"", reqStart:"", reqEnd:"", payorResp:"", apprStart:"", apprEnd:"", req:"03", apprvd:"", denied:"", pending:"" });
  const SVC_REVERSE = { SN:"Skilled Nursing", PT:"Physical Therapy", OT:"Occupational Therapy", ST:"Speech Therapy", HHA:"Home Health Aide" };
  const [lines, setLines] = useP(() => {
    if (initialEntry && initialEntry.lines && initialEntry.lines.length) {
      const parseRange = (range) => {
        if (!range || range === "-") return ["", ""];
        const parts = range.split(" - ");
        const toISO = (d) => { if(!d||d==="—") return ""; const p=d.split("/"); return p.length===3?`20${p[2]}-${p[0].padStart(2,"0")}-${p[1].padStart(2,"0")}`:d; };
        return [toISO(parts[0]||""), toISO(parts[1]||"")];
      };
      return initialEntry.lines.map(ln => {
        const [reqStart,reqEnd] = parseRange(ln.reqRange);
        const [apprStart,apprEnd] = parseRange(ln.apprRange);
        const toISO = (d) => { if(!d||d==="-") return ""; const p=d.split("/"); return p.length===3?`20${p[2]}-${p[0].padStart(2,"0")}-${p[1].padStart(2,"0")}`:d; };
        return {
          svc: SVC_REVERSE[ln.svc] || ln.svc || "Skilled Nursing",
          auth: (!ln.auth || ln.auth === "-") ? "" : ln.auth,
          reqStart, reqEnd,
          payorResp: toISO((!ln.pyrResp || ln.pyrResp === "-") ? "" : ln.pyrResp),
          apprStart, apprEnd,
          req: (!ln.req || ln.req === "-") ? "03" : ln.req,
          apprvd: (!ln.apprvd || ln.apprvd === "-") ? "" : ln.apprvd,
          denied: (!ln.denied || ln.denied === "-") ? "" : ln.denied,
          pending: (!ln.pending || ln.pending === "-") ? "" : ln.pending,
        };
      });
    }
    return [newLine("Skilled Nursing"), newLine("Physical Therapy")];
  });
  const _ss=lines.map(l=>{ const A=parseInt(l.apprvd,10)||0,D=parseInt(l.denied,10)||0,P=parseInt(l.pending,10)||0; if(A+D+P===0) return "pending_submission"; if(A>0&&D===0&&P===0) return "approved"; if(D>0&&A===0&&P===0) return "denied"; if(A===0&&D===0&&P>0) return "pending"; return "partial"; });
  const _aA=_ss.every(s=>s==="approved"),_aD=_ss.every(s=>s==="denied"),_hA=_ss.some(s=>s==="approved"),_hD=_ss.some(s=>s==="denied"),_hP=_ss.some(s=>s==="pending");
  const _hasPartial=_ss.some(s=>s==="partial");
  const overallStatus = _aA ? {label:"Approved",bg:"#e6f4ea",border:"#86c98a",color:"#1a7a2d"} : _aD ? {label:"Denied",bg:"#fde8e8",border:"#f08080",color:"#b91c1c"} : (_hA&&_hD)||_hasPartial ? {label:"Partially Approved",bg:"#f0fdfa",border:"#0d9488",color:"#0f766e"} : _hP ? {label:"Pending",bg:"#eaf2f8",border:"#3f7ba8",color:"#3f7ba8"} : _hA ? {label:"Partially Approved",bg:"#f0fdfa",border:"#0d9488",color:"#0f766e"} : _hD ? {label:"Partially Approved",bg:"#f0fdfa",border:"#0d9488",color:"#0f766e"} : {label:"Pending Submission",bg:"#eaf2f8",border:"#b8d3e6",color:"#3f7ba8"};
  const startNote = () => setAddingNote(true);
  const fillAuthDemo = () => {
    const today = new Date(); const fmt=(d)=>d.toISOString().split('T')[0];
    const start = new Date(today); start.setDate(today.getDate()-5);
    const end = new Date(today); end.setDate(today.getDate()+90);
    setAuthSubDate(fmt(today));
    setLines(ls => ls.map(l => ({
      ...l,
      auth: l.auth||"B235054831",
      reqStart: fmt(start), reqEnd: fmt(end),
      payorResp: fmt(today),
      apprStart: fmt(start), apprEnd: fmt(end),
      req: l.req||"03", apprvd: "03", denied: "-", pending: "-",
      expire: "09", at:"thumb", status:"approved"
    })));
  };
  const saveNote = () => {
    if (!noteDraft.trim()) { setAddingNote(false); return; }
    const d = new Date();
    const ts = d.toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"2-digit"}) + " " + d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
    const _nfp = noteFollow ? noteFollow.split('-') : null; const fmtFollow = _nfp ? _nfp[1]+"/"+_nfp[2]+"/"+_nfp[0].slice(2) : "";
    const newNotes = [...notes, { id: Date.now(), text: noteDraft.trim(), follow: fmtFollow, ts, by:"John Smith" }];
    persistAuthNotes(newNotes);
    if(fmtFollow && onNoteAdded){ onNoteAdded(fmtFollow); }
    setAddingNote(false); setNoteDraft(""); setNoteFollow(""); setNoteService("Authorization");
  };
  const rmNote = (id) => setNotes(n => n.filter(x => x.id !== id));
  const setLine = (i,k,v) => setLines(l => l.map((x,idx)=> idx===i ? {...x,[k]:v} : x));
  // Apprvd / Denied / Pending are editable but their sum can never exceed Req
  // (Req itself is read-only). Each entry clamps to the remaining allowance.
  const setCount = (i, field, v) => setLines(l => l.map((x,idx)=>{
    if (idx!==i) return x;
    const digits = String(v).replace(/[^0-9]/g,"");
    const req = parseInt(x.req,10)||0;
    const others = ["apprvd","denied","pending"].filter(f=>f!==field).reduce((s,f)=>s+(parseInt(x[f],10)||0),0);
    const cap = Math.max(0, req - others);
    const num = digits==="" ? "" : String(Math.min(parseInt(digits,10), cap));
    return {...x, [field]: num};
  }));
  // Status is DERIVED from the entered counts (no manual dropdown).
  const lineStatusLabel = (ln) => {
    const A=parseInt(ln.apprvd,10)||0, D=parseInt(ln.denied,10)||0, P=parseInt(ln.pending,10)||0;
    if (A+D+P===0) return "Pending Submission";
    if (A>0 && D===0 && P===0) return "Approved";
    if (D>0 && A===0 && P===0) return "Denied";
    if (A===0 && D===0 && P>0) return "Pending";
    return "Partially Approved";
  };
  const kindOf = (label) => label==="Approved"?"approved":label==="Denied"?"denied":label==="Pending"?"pending":label==="Partially Approved"?"partial":"pending_submission";
  const fmtD = (iso) => { if(!iso) return ""; const p=String(iso).split("-"); return p.length===3 ? `${p[1]}/${p[2]}/${p[0].slice(2)}` : iso; };
  const SVC_CODE = { "Skilled Nursing":"SN", "Physical Therapy":"PT", "Occupational Therapy":"OT", "Speech Therapy":"ST", "Home Health Aide":"HHA", "Authorization":"AUTH" };
  const buildEntry = () => {
    const el = lines.map(ln => {
      const label = lineStatusLabel(ln);
      const reqRange = (ln.reqStart||ln.reqEnd) ? `${fmtD(ln.reqStart)||"—"} - ${fmtD(ln.reqEnd)||"—"}` : "-";
      const apprRange = (ln.apprStart||ln.apprEnd) ? `${fmtD(ln.apprStart)||"—"} - ${fmtD(ln.apprEnd)||"—"}` : "-";
      const p2e = (v) => (!v || v==="-") ? "-" : String(parseInt(v,10)||0).padStart(2,"0");
      return { svc: SVC_CODE[ln.svc]||ln.svc, track: ln.auth?("P"+ln.auth):"-", reqRange, auth: ln.auth||"-", pyrResp: fmtD(ln.payorResp)||"-", apprRange, req: p2e(ln.req), apprvd: p2e(ln.apprvd), denied: p2e(ln.denied), pending: p2e(ln.pending), expire:"-", lastChk: fmtD(ln.payorResp)||"-", at: label==="Approved"?"thumb":"none", status: kindOf(label) };
    });
    const labels = lines.map(lineStatusLabel);
    const anyPending = labels.some(k => k==="Pending Submission");
    let status;
    if (anyPending) status="pending_submission";
    else if (labels.every(k=>k==="Approved")) status="approved";
    else if (labels.every(k=>k==="Denied")) status="denied";
    else if (labels.every(k=>k==="Pending")) status="pending";
    else status="partial";
    return { authNo: "REFA"+String(Date.now()).slice(-10), status, lines: el, submittedAt: authSubDate || new Date().toISOString().split('T')[0], notes:[...notes] };
  };
  const doSave = () => { if (onSave) onSave(buildEntry()); onClose(); };
  const MADate = ({ value, onChange }) => (
    <span style={{position:"relative",display:"block",minWidth:0}}>
      <span style={{...MA_INPUT, padding:"7px 28px 7px 8px", display:"flex", alignItems:"center", minWidth:0, cursor:"pointer", overflow:"hidden", whiteSpace:"nowrap"}}>
        <span style={{color: value?"#0f172a":"#a9b2bd", overflow:"hidden", textOverflow:"ellipsis"}}>{value ? fmtD(value) : "Enter Date"}</span>
      </span>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><rect x="3.5" y="5" width="17" height="15" rx="2" stroke="#c3ccd6" strokeWidth="1.6"/><path d="M3.5 9.5h17M8 3.5v3.5M16 3.5v3.5" stroke="#c3ccd6" strokeWidth="1.6" strokeLinecap="round"/></svg>
      <input type="date" value={value || ""} onChange={onChange} onMouseDown={(e)=>{ try { e.currentTarget.showPicker && e.currentTarget.showPicker(); } catch(_){} }} onClick={(e)=>{ try { e.currentTarget.showPicker && e.currentTarget.showPicker(); } catch(_){} }} style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0,margin:0,padding:0,border:"none",cursor:"pointer"}} />
    </span>
  );
  const numStyle = {width:"100%",minWidth:0,height:34,border:"1px solid #dbe2ea",borderRadius:6,textAlign:"center",font:"500 14px/1 Roboto",color:"#0f172a",outline:"none",background:"#fff",boxSizing:"border-box"};
  const rmLine = (i) => setLines(l => l.filter((_,x)=>x!==i));
  const addLine = () => setLines(l => [...l, newLine("Occupational Therapy")]);
  const banner = [
    ["MRN", r.mrn], ["DOB", r.dob || "12/08/1932"], ["Mem ID", r.mid],
    ["Payor Name", r.payorName || r.ptype], ["Payor Source", r.src && r.src!=="-" ? r.src : "—"],
    ["Payor Type", r.ptype], ["Gateway", r.gw && r.gw!=="-" ? r.gw : "TMHP"],
    ["Start of Care", r.soc || "01/21/25"], ["Reln to Subscriber", "Self"],
  ];
  const SVC_GRID = "minmax(110px,0.9fr) 116px minmax(220px,1.7fr) 132px minmax(220px,1.7fr) 44px 50px 50px 54px 150px 72px";
  const th = (t, extra) => <span style={{font:"400 13px/16px Roboto",color:"#8A94A6",...extra}}>{t}</span>;
  const statusPill = (
    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"4px 10px",borderRadius:4,background:"#eaf2f8",border:"1px solid #b8d3e6",color:"#3f7ba8",font:"500 11px/15px Roboto",whiteSpace:"nowrap"}}>Pending Submission</span>
  );
  return (
    <div style={{position:"fixed",inset:0,zIndex:70}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(15,23,42,0.28)",animation:"aedFade .14s ease-out"}}></div>
      <div style={{position:"fixed",right:0,top:0,height:"100vh",width: docsOpen ? "min(1980px, 98vw)" : "min(1520px, 98vw)",boxShadow:"-16px 0 40px rgba(15,23,42,0.18)",display:"flex",flexDirection:"row",animation:"aedSlide .22s ease-out",transition:"width .18s ease"}}>
      <div style={{flex:1,minWidth:0,background:"#fff",borderLeft:"1px solid #e2e8f0",display:"flex",flexDirection:"column"}}>
      {/* header */}
      <div style={{flexShrink:0,padding:"20px 30px",display:"flex",alignItems:"center",gap:16,borderBottom:"1px solid #eef2f7"}}>
        <span style={{font:"600 20px/26px Roboto",color:"#1c2d42",flex:1}}>Manage Authorization Request</span>
        <button type="button" onClick={onClose} aria-label="Close" style={{border:"none",background:"transparent",cursor:"pointer",color:"#1c2d42",fontSize:24,lineHeight:1,padding:4}}>×</button>
      </div>
      {/* patient banner */}
      <div style={{flexShrink:0,background:"#F5F8FB",borderBottom:"1px solid #e8eef4",padding:"16px 30px",display:"flex",alignItems:"center",gap:34,flexWrap:"wrap"}}>
        <MABannerField label="Patient Name" value={r.name} big />
        {banner.map(([l,v])=><MABannerField key={l} label={l} value={v} />)}
        <button type="button" onClick={fillAuthDemo} style={{marginLeft:"auto",flexShrink:0,background:"#f0f6ff",border:"1px solid #93c5fd",color:"#1d4ed8",borderRadius:6,padding:"6px 16px",font:"500 12px/18px Roboto",cursor:"pointer"}}>Demo : Fill Details</button>
      </div>
      {/* tabs */}
      <div style={{flexShrink:0,padding:"0 30px",borderBottom:"1px solid #e8eef4",display:"flex",gap:30}}>
        {[["auth","Authorization Response"],["notes","Notes"]].map(([k,lbl])=>(
          <button key={k} type="button" onClick={()=>setTab(k)} style={{background:"transparent",border:"none",cursor:"pointer",padding:"12px 2px",font:`${tab===k?500:400} 14px/18px Roboto`,color: tab===k?"#1677FF":"#5a6675",borderBottom:`2px solid ${tab===k?"#1677FF":"transparent"}`,marginBottom:-1}}>{lbl}</button>
        ))}
      </div>
      {/* body */}
      <div className="ws-scrollbody" style={{flex:1,overflow:"auto",padding:"22px 30px 40px"}}>
        {tab==="notes" ? (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {!addingNote && (
              <div style={{border:"1px solid #d0e4f7",background:"#eef4fc",borderRadius:10,padding:"48px 24px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,minHeight:180}}>
                <span style={{font:"400 14px/20px Roboto",color:"#6b7a90"}}>Add any notes associated to this request</span>
                <button type="button" onClick={startNote} style={{border:"none",background:"#1677FF",color:"#fff",borderRadius:6,padding:"8px 22px",font:"500 13px/18px Roboto",cursor:"pointer"}}>+ Add New Note</button>
              </div>
            )}
            {addingNote && (
              <div style={{border:"1px solid #cfe0f5",background:"#F7FAFE",borderRadius:10,padding:"16px 18px",display:"flex",flexDirection:"column",gap:14}}>
                <textarea value={noteDraft} onChange={(e)=>setNoteDraft(e.target.value)} autoFocus rows={4} placeholder="Write a note…" style={{...MA_INPUT, resize:"vertical", fontFamily:"Roboto"}} />
                <div style={{display:"flex",alignItems:"flex-end",gap:16,flexWrap:"wrap"}}>
                  {r.mode !== "gear" && <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    <span style={{font:"400 12px/16px Roboto",color:"#7c8698"}}>Set follow-up date</span>
                    <input type="date" value={noteFollow} onChange={(e)=>setNoteFollow(e.target.value)} style={{...MA_INPUT,width:200}} />
                  </div>}
                  <div style={{marginLeft:"auto",display:"flex",gap:10}}>
                    <button type="button" onClick={()=>{ setAddingNote(false); setNoteDraft(""); setNoteFollow(""); }} style={{border:"1px solid #cdd6e0",background:"#fff",color:"#475569",borderRadius:6,padding:"8px 18px",font:"500 13px/18px Roboto",cursor:"pointer"}}>Cancel</button>
                    <button type="button" onClick={saveNote} style={{border:"none",background:"#1677FF",color:"#fff",borderRadius:6,padding:"8px 22px",font:"500 13px/18px Roboto",cursor:"pointer"}}>Save Note</button>
                  </div>
                </div>
              </div>
            )}
            {notes.length>0 && <MANotesTable notes={notes} />}
          </div>
        ) : (
        <React.Fragment>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
            <span style={{font:"600 16px/22px Roboto",color:"#1c2d42"}}>Auth Request Summary</span>
            <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:5,border:"1px solid "+overallStatus.border,background:overallStatus.bg,font:"500 12px/16px Roboto",color:overallStatus.color,cursor:"default"}}>
                {r.mode!=="gear" && <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0}}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}{overallStatus.label}
              </span>
          </div>
          <div style={{border:"1px solid #e4ebf3",borderRadius:9,overflow:"hidden"}}>
            {/* summary strip */}
            <div style={{background:"#EAF3FE",padding:"16px 20px",display:"flex",alignItems:"center",gap:40,flexWrap:"wrap"}}>
              <MASummaryItem label="Auth Type" value={r.type && r.type!=="-" ? r.type : "Additional"} />
              <MASummaryItem label="Auth Initiation Date" value={r.init || "04/25/25"} />
              <MASummaryItem label="Episode ID" value={r.epi || "Epi964256"} />
              <MASummaryItem label="Episode Start Date" value={r.init || "04/25/25"} />
              <div style={{display:"flex",flexDirection:"column",gap:6,minWidth:150}}>
                <span style={{font:"400 13px/16px Roboto",color:"#7c8698"}}>Auth Submission date</span>
                <MADate value={authSubDate} onChange={(e)=>setAuthSubDate(e.target.value)} />
              </div>
              <button type="button" onClick={()=>setDocsOpen(o=>!o)} style={{marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:8,border:"1px solid #1677FF",background: docsOpen?"#EAF3FE":"#fff",color:"#1677FF",borderRadius:6,padding:"8px 16px",font:"500 13px/18px Roboto",cursor:"pointer"}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 2.75h7.2L19 8.55V19.5a1.75 1.75 0 0 1-1.75 1.75H6A1.75 1.75 0 0 1 4.25 19.5v-15A1.75 1.75 0 0 1 6 2.75z" fill="#fff" stroke="#1677FF" strokeWidth="1.5" strokeLinejoin="round"/><path d="M13 2.9v5.1h5" stroke="#1677FF" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                Documents
              </button>
            </div>
            {/* table header */}
            <div style={{display:"grid",gridTemplateColumns:SVC_GRID,alignItems:"center",gap:12,padding:"11px 20px",background:"#F7F8FA",borderTop:"1px solid #eef1f5",borderBottom:"1px solid #eef1f5"}}>
              {th("Service")}{th("Authorization#")}{th("Auth Req Start & End Date")}{th("Payor Response Date")}{th("Approved Start & End Date")}{th("Req")}{th("Apprvd")}{th("Denied")}{th("Pending")}{th("Status")}<span />
            </div>
            {/* rows */}
            {lines.map((ln,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:SVC_GRID,alignItems:"center",gap:12,padding:"16px 20px",borderBottom: i===lines.length-1?"none":"1px solid #eef1f5"}}>
                <span style={{font:"500 15px/20px Roboto",color:"#1c2d42"}}>{ln.svc}</span>
                <input value={ln.auth} onChange={(e)=>setLine(i,"auth",e.target.value)} placeholder="Enter Auth#" style={MA_INPUT} />
                <span style={{display:"flex",gap:6,minWidth:0}}><MADate value={ln.reqStart} onChange={(e)=>setLine(i,"reqStart",e.target.value)} /><MADate value={ln.reqEnd} onChange={(e)=>setLine(i,"reqEnd",e.target.value)} /></span>
                <span style={{borderLeft:"1px solid #e4ebf3",paddingLeft:12,marginLeft:-12,minWidth:0}}><MADate value={ln.payorResp} onChange={(e)=>setLine(i,"payorResp",e.target.value)} /></span>
                <span style={{display:"flex",gap:6,minWidth:0}}><MADate value={ln.apprStart} onChange={(e)=>setLine(i,"apprStart",e.target.value)} /><MADate value={ln.apprEnd} onChange={(e)=>setLine(i,"apprEnd",e.target.value)} /></span>
                <MASmallBox value={ln.req} highlight />
                <input value={ln.apprvd} onChange={(e)=>setCount(i,"apprvd",e.target.value)} placeholder="-" inputMode="numeric" style={numStyle} />
                <input value={ln.denied} onChange={(e)=>setCount(i,"denied",e.target.value)} placeholder="-" inputMode="numeric" style={numStyle} />
                <input value={ln.pending} onChange={(e)=>setCount(i,"pending",e.target.value)} placeholder="-" inputMode="numeric" style={numStyle} />
                <ARVAuthPill kind={kindOf(lineStatusLabel(ln))} />
                <span style={{display:"inline-flex",alignItems:"center",gap:8}}>
                  <button type="button" title="Reset" style={{border:"none",background:"transparent",cursor:"pointer",padding:0,display:"inline-flex"}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 5v4h4" stroke="#1677FF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.5 9a7.5 7.5 0 1 1-1.3 4.2" stroke="#1677FF" strokeWidth="1.7" strokeLinecap="round"/></svg>
                  </button>
                  <button type="button" title="Remove" onClick={()=>rmLine(i)} style={{border:"none",background:"transparent",cursor:"pointer",padding:0,display:"inline-flex"}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4.5 7h15M9 7V5h6v2M6.5 7l.9 12.5h9.2L17.5 7" stroke="#dc2626" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </span>
              </div>
            ))}
            {/* add service */}
            <div style={{padding:"18px 20px 22px"}}>
              <button type="button" onClick={addLine} style={{border:"1px solid #cdd6e0",background:"#fff",color:"#3a424a",borderRadius:6,padding:"9px 16px",font:"500 13px/18px Roboto",cursor:"pointer"}}>+ Add New Service</button>
            </div>
          </div>
        </React.Fragment>
        )}
      </div>
      {/* footer */}
      <div style={{flexShrink:0,background:"#EEF4FB",borderTop:"1px solid #e0e8f1",padding:"16px 30px",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:12}}>
        <button type="button" tabIndex={-1} title="Reset notes (demo)" onClick={()=>{ setNotes([]); setAddingNote(false); }} style={{marginRight:"auto",border:"none",background:"transparent",cursor:"pointer",padding:6,display:"inline-flex",opacity:0}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4.5 7h15M9 7V5h6v2M6.5 7l.9 12.5h9.2L17.5 7" stroke="#dc2626" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button type="button" onClick={onClose} style={{border:"1px solid #cdd6e0",background:"#fff",color:"#475569",borderRadius:6,padding:"9px 22px",font:"500 13px/18px Roboto",cursor:"pointer"}}>cancel</button>
        <button type="button" onClick={doSave} style={{border:"1px solid #1677FF",background:"#1677FF",color:"#fff",borderRadius:6,padding:"9px 28px",font:"500 13px/18px Roboto",cursor:"pointer"}}>Save</button>
      </div>
      </div>
      {docsOpen && (
        <div style={{width:388,flexShrink:0,background:"#fff",borderLeft:"1px solid #e8eef4",display:"flex",flexDirection:"column",height:"100%"}}>
          <div style={{flexShrink:0,padding:"20px 24px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid #eef2f7"}}>
            <span style={{font:"600 18px/24px Roboto",color:"#1c2d42",flex:1}}>Documents</span>
            <button type="button" onClick={()=>setDocsOpen(false)} aria-label="Close documents" style={{border:"none",background:"transparent",cursor:"pointer",color:"#1c2d42",fontSize:20,lineHeight:1,padding:2}}>×</button>
          </div>
          <div style={{flexShrink:0,padding:"0 24px",borderBottom:"1px solid #e8eef4",display:"flex",gap:26}}>
            {[["request","Request Docs"],["response","Response Docs"]].map(([k,lbl])=>(
              <button key={k} type="button" onClick={()=>setDocsTab(k)} style={{background:"transparent",border:"none",cursor:"pointer",padding:"12px 2px",font:`${docsTab===k?500:400} 14px/18px Roboto`,color: docsTab===k?"#1677FF":"#5a6675",borderBottom:`2px solid ${docsTab===k?"#1677FF":"transparent"}`,marginBottom:-1}}>{lbl}</button>
            ))}
          </div>
          <div className="ws-scrollbody" style={{flex:1,overflow:"auto",padding:"20px 24px",display:"flex",flexDirection:"column",gap:18}}>
            <div style={{border:"1.5px dashed #9CC3F5",background:"#EAF3FE",borderRadius:10,padding:"34px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:14,textAlign:"center",cursor:"pointer"}}>
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none"><path d="M7 18.5a4.2 4.2 0 0 1-.5-8.37 5.6 5.6 0 0 1 10.8-1.03A3.9 3.9 0 0 1 17.4 18.5" stroke="#1677FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 21v-8M12 13l-2.4 2.4M12 13l2.4 2.4" stroke="#1677FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{font:"400 14px/20px Roboto",color:"#1677FF"}}>Add Files or Drop files here to<br/>upload a {docsTab==="response"?"response":"request"} doc</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12,border:"1px solid #e6ebf1",borderRadius:8,padding:"14px 16px"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 2.75h7.2L19 8.55V19.5a1.75 1.75 0 0 1-1.75 1.75H6A1.75 1.75 0 0 1 4.25 19.5v-15A1.75 1.75 0 0 1 6 2.75z" fill="#fff" stroke="#3F7EA1" strokeWidth="1.5" strokeLinejoin="round"/><path d="M13 2.9v5.1h5" stroke="#3F7EA1" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              <span style={{flex:1,font:"500 14px/18px Roboto",color:"#1c2d42"}}>{docsTab==="response"?"Auth Response Docs":"Auth Request Docs"}</span>
              <a href="#" onClick={(e)=>e.preventDefault()} style={{font:"500 14px/18px Roboto",color:"#1677FF",textDecoration:"none"}}>View</a>
            </div>
          </div>
        </div>
      )}
      </div>
      <style>{`@keyframes aedFade { from { opacity: 0 } to { opacity: 1 } } @keyframes aedSlide { from { transform: translateX(28px); opacity: .6 } to { transform: translateX(0); opacity: 1 } }`}</style>
    </div>
  );
}
function MASummaryItem({ label, value }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6,minWidth:0}}>
      <span style={{font:"400 13px/16px Roboto",color:"#7c8698",whiteSpace:"nowrap"}}>{label}</span>
      <span style={{font:"500 15px/20px Roboto",color:"#1c2d42",whiteSpace:"nowrap"}}>{value}</span>
    </div>
  );
}
if(typeof window!=="undefined") window.AuthEntryDrawer = AuthEntryDrawer;

function MANotesTable({ notes }) {
  const cols = [
    { key:"ts",     label:"Created Date & Time", w:"180px" },
    { key:"text",   label:"Notes",               w:"minmax(0,1fr)", wrap:true },
    { key:"follow", label:"Followup Date",        w:"140px" },
    { key:"by",     label:"Created by",           w:"160px" },
  ];
  const GRID = cols.map(c=>c.w).join(" ");
  const bd = "1px solid rgba(0,0,0,0.06)";
  return (
    <div style={{border:"1px solid #e8e8e8",borderRadius:6,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:GRID}}>
        {cols.map((c,i)=><div key={c.key} style={{padding:"11px 12px",font:"500 13px/16px Roboto",color:"#5a6675",background:"#F8FAFC",borderLeft:i>0?bd:"none",borderBottom:bd}}>{c.label}</div>)}
      </div>
      {notes.map(n => (
        <div key={n.id} style={{display:"grid",gridTemplateColumns:GRID}}>
          {cols.map((c,i)=>(
            <div key={c.key} style={{padding:"12px",font:"400 14px/22px Roboto",color:"rgba(0,0,0,0.85)",borderLeft:i>0?bd:"none",borderTop:bd,whiteSpace: c.wrap?"pre-wrap":"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              {c.key==="follow" ? (n.follow || "—") : (n[c.key] || "—")}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function AuthRequestView({ onPatient, review, onExitReview, reasonFilter, showLeftBar=false, density="comfortable", showRowShadow=true, chevronStyle="triangle", checkboxAccent="#2563eb", sharedInitDate, setSharedInitDate, sharedFieldFilters, setSharedFieldFilters, followupFilter=false, onClearFollowup, sharedFollowUp, setSharedFollowUp, sharedAuthEntries, setSharedAuthEntries, openManageRow, onManageRowOpened }) {
  const [statusFilter, setStatusFilter] = useP(null);
  const [atReasonFilter, setAtReasonFilter] = useP(null);
  const [_initDate, _setInitDate]          = useP(()=>defaultDateRange([...new Set(arvRows.map(r=>r.init))],30));
  const initDate = sharedInitDate !== undefined ? sharedInitDate : _initDate;
  const setInitDate = setSharedInitDate || _setInitDate;
  const [atFilter, setAtFilter]         = useP(null);
  const [entryRow, setEntryRow]         = useP(null);
  React.useEffect(()=>{ if(openManageRow){ setEntryRow(openManageRow); onManageRowOpened&&onManageRowOpened(); } }, [openManageRow]);
  const [_authEntries, _setAuthEntries] = useP({});
  const authEntries = sharedAuthEntries !== undefined ? sharedAuthEntries : _authEntries;
  const setAuthEntries = setSharedAuthEntries || _setAuthEntries;
  const [modeFilter, setModeFilter]     = useP("all");
  const [_fieldFilters, _setFieldFilters] = useP([]);
  const fieldFilters = sharedFieldFilters !== undefined ? sharedFieldFilters : _fieldFilters;
  const setFieldFilters = setSharedFieldFilters || _setFieldFilters;
  const [expandedId, setExpandedId]     = useP(null);
  const [reviewedSet, setReviewedSet]   = useP({});
  const [_followUp, _setFollowUp]       = useP({});
  const followUp = sharedFollowUp !== undefined ? sharedFollowUp : _followUp;
  const setFollowUp = setSharedFollowUp || _setFollowUp;
  const [sortKey, setSortKey]           = useP(null);
  const [sortDir, setSortDir]           = useP("asc");
  const [searchQ, setSearchQ]           = useP("");
  const onSort = (k) => { if (sortKey === k) setSortDir(d => d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };
  const toggleReviewed = (k) => setReviewedSet(s => ({ ...s, [k]: !s[k] }));
  const onFollowUpChange = (k, v) => setFollowUp(s => ({ ...s, [k]: v }));
  // When a patient name is clicked, publish this row's auth context so the
  // detail slide-out's Authorization Info tab shows the matching pending "-" /
  // entered rows (rather than the generic sample).
  const openPatient = (r) => {
    if (typeof window !== "undefined") {
      const e = authEntries[r.key];
      window.__authForDrawer = { name: r.name, status: e ? e.status : r.status, entry: e || null, authType: r.type, refId: (e && e.authNo) || null };
    }
    onPatient && onPatient(r);
  };

  // Apply a reason filter pushed in from the Dashboard (Terminated/Failed count
  // or a single reason). Narrows to Needs-Attention rows carrying those reasons.
  React.useEffect(() => {
    if (reasonFilter && reasonFilter.length) { setAtReasonFilter(reasonFilter); setAtFilter("warning"); setStatusFilter(null); }
  }, [reasonFilter]);

  let base = arvRows.filter(r => modeFilter==="automated" ? r.mode==="gear" : modeFilter==="manual" ? r.mode==="person" : true);
  base = base.filter(r => fieldFilters.every(f => f.values.includes(r[f.field])));
  if (searchQ) base = base.filter(r=>[r.name,r.mrn,r.mid,r.src,r.gw].join(" ").toLowerCase().includes(searchQ.toLowerCase()));
  if (followupFilter) base = base.filter(r => r.followUp && r.followUp !== "-" && r.followUp !== "");
  const AT_MAP = { completed:"thumb", warning:"warning", inprogress:"hourglass" };
  // Auth Status counts respect the AT filter (but not the status filter itself).
  const authScoped = atFilter ? base.filter(r => r.at === AT_MAP[atFilter]) : base;
  const counts = { all: authScoped.length };
  ARV_AUTH_STATUS.forEach(s => { if (s.id !== "all") counts[s.id] = authScoped.filter(r => r.status === s.id).length; });
  // AT Status counts respect the Auth-status filter (but not the AT filter itself).
  const atScoped = (statusFilter && statusFilter !== "all") ? base.filter(r => r.status === statusFilter) : base;
  const atCounts = { completed: atScoped.filter(r=>r.at==="thumb").length, warning: atScoped.filter(r=>r.at==="warning").length, inprogress: atScoped.filter(r=>r.at==="hourglass").length };
  // When a reason subset is applied, the Needs-Attention number reflects the real filtered count.
  const atCountsDisplay = (atReasonFilter && atReasonFilter.length)
    ? { ...atCounts, warning: atScoped.filter(r=>r.at==="warning" && atReasonFilter.includes(r.atReason)).length }
    : atCounts;
  let rows = base.map(r => ({ ...r, followUp: followUp[r.key] || r.followUp }));
  if (statusFilter && statusFilter !== "all") rows = rows.filter(r => r.status === statusFilter);
  if (initDate) rows = rows.filter(r => dateInRange(r.init, initDate));
  if (atFilter) rows = rows.filter(r => r.at === AT_MAP[atFilter]);
  // Needs-Attention reason narrowing (from the dropdown's Show Records or the Dashboard).
  if (atReasonFilter && atReasonFilter.length) rows = rows.filter(r => r.at === "warning" && atReasonFilter.includes(r.atReason));
  // Review mode: only requests that still need review (denied / pending / partially
  // approved / exception auth status, or automation needs attention) AND not yet
  // reviewed. Checking a row's Reviewed box drops it; with review off, all rows show.
  const arvNeedsReview = (r) => ["denied","pending","partial","exception"].includes(r.status) || r.at === "warning";
  if (review) rows = rows.filter(r => arvNeedsReview(r) && !reviewedSet[r.key]);
  if (sortKey) {
    rows = [...rows].sort((a,b) => {
      const av = (a[sortKey] || "").toString().toLowerCase();
      const bv = (b[sortKey] || "").toString().toLowerCase();
      if (av < bv) return sortDir==="asc" ? -1 : 1;
      if (av > bv) return sortDir==="asc" ? 1 : -1;
      return 0;
    });
  }

  const chips = [];
  if (followupFilter) {
    chips.push({ id:"followup", label:"Due For Follow Up", onRemove: () => onClearFollowup && onClearFollowup() });
  }
  if (statusFilter) {
    const s = ARV_AUTH_STATUS.find(x => x.id === statusFilter);
    chips.push({ id:"status", label:`Auth Status: ${s ? s.label : statusFilter}`, onRemove: () => setStatusFilter(null) });
  }
  if (atFilter) { const a = ARV_AT.find(x => x.id === atFilter); chips.push({ id:"at", label:`AT Status: ${a ? a.label : atFilter}`, onRemove: () => { setAtFilter(null); setAtReasonFilter(null); } }); }
  if (atReasonFilter && atReasonFilter.length) {
    atReasonFilter.forEach(rsn => chips.push({ id:"atr-"+rsn, label:`Reason: ${rsn}`, onRemove: () => setAtReasonFilter(prev => { const nx=(prev||[]).filter(x=>x!==rsn); return nx.length?nx:null; }) }));
  }
  if (review) {
    [
      { id:"rv-den", label:"Auth Status: Denied" },
      { id:"rv-pen", label:"Auth Status: Pending" },
      { id:"rv-par", label:"Auth Status: Partially Approved" },
      { id:"rv-exc", label:"Auth Status: Exceptions" },
      { id:"rv-at",  label:"Automation Status: Needs Attention" },
      { id:"rv-nr",  label:"Reviewed : Not Reviewed" },
    ].forEach(c => chips.push({ ...c, onRemove: () => onExitReview && onExitReview() }));
  }
  const statusLabel = statusFilter ? (ARV_AUTH_STATUS.find(x => x.id === statusFilter)||{}).label : null;

  return (
    <div style={{background:"#fff"}}>
      <ARVFilterBarChips chips={chips} filterFields={ARV_FILTER_FIELDS} filterRows={arvRows} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters} datePicker={{label:"Auth Initiated Date", value:initDate, available:[...new Set(arvRows.map(r=>r.init))], onChange:setInitDate}} searchValue={searchQ} onSearch={setSearchQ} onClearFilters={review ? (()=>onExitReview&&onExitReview()) : null} />
      <div style={{padding:"20px 32px 0",display:"flex",alignItems:"center",gap:32,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 360px",minWidth:0}}>
          <ARVTitleCluster activeStatus={statusFilter} statusLabel={statusLabel} onClearStatus={()=>setStatusFilter(null)} modeFilter={modeFilter} onModeFilter={setModeFilter} />
        </div>
        <div style={{flex:"1 1 660px",minWidth:0}}>
          <ARVStatusStrip activeStatus={statusFilter} onPick={(v)=>{ setStatusFilter(v); if(v) setAtFilter(null); }} counts={counts} atActive={!!atFilter} />
        </div>
      </div>
      <div style={{padding:"10px 32px",display:"flex",justifyContent:"flex-end",position:"relative",top:0}}>
        <ARVAutomationStatus atFilter={atFilter} onFilter={(v)=>{ setAtFilter(v); if(v) setStatusFilter(null); if(!v) setAtReasonFilter(null); }} atCounts={atCountsDisplay} statusActive={!!statusFilter} selectedReasons={atReasonFilter} onApply={(reasons)=>{ setStatusFilter(null); setAtFilter("warning"); setAtReasonFilter(reasons && reasons.length ? reasons : null); }} />
      </div>
      <div style={{padding:"0 32px 32px"}}>
        <ARVHeader sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
        <ScrollBody>
          {rows.length === 0 ? (
            <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>
              No auth requests match the current filters.
            </div>
          ) : rows.map(r => (
            <ARVRow
              key={r.key}
              row={r}
              expanded={expandedId === r.key}
              onToggle={()=>setExpandedId(id => id===r.key ? null : r.key)}
              onPatient={openPatient}
              onEnterDetails={setEntryRow}
              entry={authEntries[r.key]}
              reviewed={!!reviewedSet[r.key]}
              onReviewed={()=>toggleReviewed(r.key)}
              onFollowUp={onFollowUpChange}
              showLeftBar={showLeftBar}
              density={density}
              showRowShadow={showRowShadow}
              chevronStyle={chevronStyle}
              checkboxAccent={checkboxAccent}
            />
          ))}
        </ScrollBody>
      </div>
      {entryRow && <AuthEntryDrawer key={entryRow.key} row={entryRow} initialEntry={authEntries[entryRow.key]} onSave={(e)=>{ const key=entryRow.key; setAuthEntries(m=>({...m,[key]:e})); const lastFollow=e.notes&&([...e.notes].reverse().find(n=>n.follow)||{}).follow; if(lastFollow) setFollowUp(s=>({...s,[key]:lastFollow})); if(typeof window!=="undefined"){ window.__authEntriesByName=window.__authEntriesByName||{}; if(entryRow.name) window.__authEntriesByName[entryRow.name]=e; } }} onNoteAdded={(date)=>setFollowUp(s=>({...s,[entryRow.key]:date}))} onClose={()=>setEntryRow(null)} />}
    </div>
  );
}

function AutomationLog() {
  return (
    <div style={{padding:32}}>
      <div style={{border:"1px dashed #D8D8D8",borderRadius:8,padding:"60px 24px",textAlign:"center",color:"#8D949D",font:"400 14px Roboto"}}>
        Automation Log — run-level Extraction / Parsing stages would render here.
      </div>
    </div>
  );
}

// === Patient Auth Detail (opens when a patient name is clicked) =====
function PatientAuthDetail({ patient, onBack }) {
  const p = patient || {};
  const [authEntry, setAuthEntry] = useP(null);
  const [editRow, setEditRow] = useP(null);
  const fakeRow = { key: p.key||"p-detail", name: p.name, mrn: p.mrn, mid: p.mid, src: p.src, ptype: p.type, gw: p.gw, mode: "person", epi: p.epiId||p.epi||p.auth, type: p.recert||"Additional", init: p.authInit||p.init||p.soc, status: authEntry ? authEntry.status : "pending_submission" };
  const initials = (p.name||"").split(" ").map(x=>x[0]).filter(Boolean).slice(0,2).join("");
  const field = (label, val) => (
    <div style={{minWidth:130}}>
      <div style={{font:"400 11px/14px Roboto",color:"#94a3b8"}}>{label}</div>
      <div style={{font:"500 13px/18px Roboto",color:"#333333",marginTop:3}}>{val || "\u2014"}</div>
    </div>
  );
  const recertLabel = p.recert==="past_due" ? "Past Due" : p.recert==="due" ? "Recert Due" : p.recert==="current" ? "Current" : null;
  return (
    <div style={{background:"#f4f5f7",minHeight:"calc(100vh - 72px)"}}>
      <div style={{background:"linear-gradient(to right, rgb(56,71,90) 0%, rgb(28,45,66) 100%)",padding:"16px 32px",color:"#fff",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,font:"400 13px/18px Roboto",color:"rgba(255,255,255,.7)"}}>
          <span style={{cursor:"pointer"}} onClick={onBack}>Authorization</span>
          <span style={{opacity:.5}}>/</span>
          <span style={{color:"#fff",font:"500 18px/24px Roboto"}}>{p.name}</span>
        </div>
        <button type="button" style={{background:"rgba(255,255,255,0.14)",color:"#fff",border:"1px solid rgba(255,255,255,.25)",borderRadius:6,padding:"8px 16px",font:"500 13px Roboto",cursor:"pointer"}}>+ New Auth Request</button>
      </div>
      <div style={{margin:"20px 32px",background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"20px 24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",font:"600 16px Roboto",color:"#475569",flexShrink:0}}>{initials}</div>
          <div>
            <div style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>{p.name}</div>
            <div style={{font:"400 12px/16px Roboto",color:"#64748b",marginTop:2}}>MRN {p.mrn || "—"} · Mem ID {p.mid || "—"}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:32,flexWrap:"wrap",borderTop:"1px solid #eef0f3",paddingTop:16}}>
          {field("Payor Source", p.src)}
          {field("Payor Type", p.type)}
          {field("Gateway", p.gw)}
          {field("Authorization#", p.epiId || p.epi || p.auth)}
          {field("Auth Init Dt", p.init || p.soc)}
          {recertLabel && field("Recert Status", recertLabel)}
        </div>
      </div>
      <div style={{margin:"0 32px 32px"}}>
        <div style={{border:"1px solid #e2e8f0",borderBottom:"none",borderRadius:"6px 6px 0 0",background:"#f4f5f7",height:1}}></div>
        <AuthDetailsPanel row={{...p, epi: p.epiId || p.epi || p.auth}} entry={authEntry} onEdit={()=>setEditRow(fakeRow)} />
      </div>
      {editRow && <AuthEntryDrawer row={editRow} initialEntry={authEntry} onSave={(e)=>{ setAuthEntry(e); setEditRow(null); }} onClose={()=>setEditRow(null)} />}
    </div>
  );
}

function AuthorizationSection({ sub, onSub, review, onReview, onRow, breadcrumb, onBack, reasonFilter, showLeftBar, density, showRowShadow, chevronStyle, checkboxAccent, authFilters, onAuthRefClick, followupFilter, onClearFollowup, authOpenManageRow, onAuthManageRowOpened }) {
  const subTabs = [
    { label:"Patient Auth Summary View", icon:"▦" },
    { label:"Auth Request View",         icon:"☰" },
    { label:"Automation Log",            icon:"" },
  ];
  return (
    <div>
      <SectionBand title="Authorization Center" subTabs={subTabs} activeSub={sub} onSub={onSub} review={review} onReview={onReview} showReview={true} breadcrumb={breadcrumb} onBack={onBack} />
      {sub===0 && <PatientAuthSummaryView onRow={onRow} review={review} onExitReview={onReview} sharedInitDate={authFilters&&authFilters.initDate} setSharedInitDate={authFilters&&authFilters.setInitDate} sharedFieldFilters={authFilters&&authFilters.fieldFilters} setSharedFieldFilters={authFilters&&authFilters.setFieldFilters} />}
      {sub===1 && <AuthRequestView onPatient={onRow} review={review} onExitReview={onReview} reasonFilter={reasonFilter} showLeftBar={showLeftBar} density={density} showRowShadow={showRowShadow} chevronStyle={chevronStyle} checkboxAccent={checkboxAccent} sharedInitDate={authFilters&&authFilters.initDate} setSharedInitDate={authFilters&&authFilters.setInitDate} sharedFieldFilters={authFilters&&authFilters.fieldFilters} setSharedFieldFilters={authFilters&&authFilters.setFieldFilters} followupFilter={followupFilter} onClearFollowup={onClearFollowup} sharedFollowUp={authFilters&&authFilters.followUp} setSharedFollowUp={authFilters&&authFilters.setFollowUp} sharedAuthEntries={authFilters&&authFilters.authEntries} setSharedAuthEntries={authFilters&&authFilters.setAuthEntries} openManageRow={authOpenManageRow} onManageRowOpened={onAuthManageRowOpened} />}
      {sub===2 && <ARVAutomationLogView onRefClick={onAuthRefClick} />}
    </div>
  );
}

// ── Tweak defaults (persisted via host's __edit_mode_set_keys) ──
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "showLeftBar": false,
  "rowDensity": "comfortable",
  "showRowShadow": true,
  "chevronStyle": "triangle",
  "checkboxAccent": "#2563eb"
}/*EDITMODE-END*/;

// ── Root router ──────────────────────────────────────────────
function Prototype() {
  // Default landing = Dashboard
  const [section, setSection] = useP("dashboard");   // dashboard | intake | eligibility | authorization | cdm
  const [intakeSub, setIntakeSub] = useP(0);
  const [eligSub, setEligSub] = useP(0);
  const [cdmSub, setCdmSub] = useP(0);
  const [docxSub, setDocxSub] = useP(0);
  const [remitsSub, setRemitsSub] = useP(0);
  const [asmtSub, setAsmtSub] = useP(0);
  const [notifSub, setNotifSub] = useP(0);
  const [notifFocus, setNotifFocus] = useP(null);
  const [rcdSub, setRcdSub] = useP(0);
  const [preSub, setPreSub] = useP(0);
  const [auditSub, setAuditSub] = useP(0);
  const [prebillSub, setPrebillSub] = useP(0);
  const [rcdNaFocus, setRcdNaFocus] = useP(null);
  const [asmtLogFocus, setAsmtLogFocus] = useP(null);
  const [eligAlert, setEligAlert] = useP(null);   // {type:'alert',label} | {type:'at',group}
  const [authSub, setAuthSub] = useP(0);
  const [authReasonFilter, setAuthReasonFilter] = useP(null);
  const [dashTab, setDashTab] = useP("elig");
  const [eligInitAutoLog, setEligInitAutoLog] = useP(false);
  const [eligAutoLogSubTab, setEligAutoLogSubTab] = useP("elig");
  const [authFollowupFilter, setAuthFollowupFilter] = useP(false);
  const [authOpenManageRow, setAuthOpenManageRow] = useP(null);
  const [authFollowUp, setAuthFollowUp] = useP({});
  const [authSavedEntries, setAuthSavedEntries] = useP({});
  React.useEffect(()=>{ if(typeof window!=="undefined") window.__authFollowUp = authFollowUp; }, [authFollowUp]);   // which dashboard tab to activate on landing
  // Shared filters — carried forward across all elig/auth screens + dashboards
  const [eligInitDate, setEligInitDate] = useP(() => window.defaultDateRange([...new Set((window.ERV_ROWS||[]).map(r=>r.eligInit))],30));
  const [eligFieldFilters, setEligFieldFilters] = useP([]);
  const [eligFollowUp, setEligFollowUp] = useP({});
  const [eligEntries, setEligEntries] = useP({});   // persists manage-overlay entries across nav
  React.useEffect(()=>{ if(typeof window!=="undefined") window.__eligFollowUp = eligFollowUp; }, [eligFollowUp]);
  const [authInitDate, setAuthInitDate] = useP(() => window.defaultDateRange([...new Set((window.arvRows||[]).map(r=>r.init))],30));
  const [authFieldFilters, setAuthFieldFilters] = useP([]);
  const [detail, setDetail]   = useP(null);            // null | { patient }
  const [docsRow, setDocsRow] = useP(null);            // null | row
  const [docsFromDetail, setDocsFromDetail] = useP(false);
  const [savedDrawer, setSavedDrawer] = useP(null);
  const [review, setReview]   = useP(false);
  const [tweaks, setTweak]    = useTweaks(TWEAK_DEFAULTS);

  // Holds the payload key to open the drawer with, or null when closed.
  const [eligDrawer, setEligDrawer] = useP(null);
  const [eligTab, setEligTab] = useP("elig");
  const [eligNotifOnly, setEligNotifOnly] = useP(false);
  // Identity of the clicked row, merged over the sample patient so the drawer
  // shows the respective patient (not always Marvin).
  const [drawerPatient, setDrawerPatient] = useP(null);
  // When a row is saved from Manage Eligibility overlay, store the entry + row
  // so the detail screen renders the entered data instead of sample data.
  const [eligEntry, setEligEntry] = useP(null);
  const [eligEntryRow, setEligEntryRow] = useP(null);
  const [eligIsPending, setEligIsPending] = useP(false);
  const [pendingRow, setPendingRow] = useP(null);
  const [openManageRow, setOpenManageRow] = useP(null);
  // Per-row saved entries from Manage Eligibility overlay (keyed by row.id)
  const [savedEntries, setSavedEntries] = useP({});
  // PCR Terminate slider — replaces the patient detail slider (only one open at a time).
  const [pcrTermRow, setPcrTermRow] = useP(null);
  const [pcrTermReturn, setPcrTermReturn] = useP(null);
  window.__pcrTerminate = (r) => { setPcrTermReturn(eligDrawer || "medicare_advantage"); setEligDrawer(null); setPcrTermRow(r); };
  const rowToPatient = (r) => r ? { name:r.name, mrn:r.mrn, memberId:r.mid || r.memId, payorType:r.ptype || r.payor, payorSource:r.src || r.payorSrc, gateway:(r.gw && r.gw!=="-") ? r.gw : undefined, mode:r.mode } : null;

  const goHome = () => { setDetail(null); setEligDrawer(null); setAuthReasonFilter(null); setDashTab(section==="authorization"?"auth":section==="preclaims"?"pcr":section==="intake"?"referral":section==="notifications"?"notif":"elig"); setSection("dashboard"); setEligSub(0); };
  const goSection = (k) => { setDetail(null); setEligAlert(null); setAuthReasonFilter(null); if(k==="dashboard") setDashTab(section==="authorization"?"auth":section==="preclaims"?"pcr":section==="intake"?"referral":section==="notifications"?"notif":"elig"); setSection(k); };
  React.useEffect(()=>{
    window.__openNotifDrawer = (r) => { window.__notifForDrawer = r; const noMrn = r && r.notifOption!=="Notification"; setEligInitAutoLog(false); setEligNotifOnly(!!noMrn); setEligTab("notif"); const pt = rowToPatient(r); if (noMrn && pt) { pt.mrn = "—"; pt.memberId = "—"; } setDrawerPatient(pt); setEligDrawer(/cameron/i.test(r&&r.name||"")?"cameron_williamson":"medicare_advantage"); };
    window.__openPreEligDrawer = (r) => { window.__preEligForDrawer = r; setEligInitAutoLog(false); setEligNotifOnly("elig"); setEligTab("elig"); setDrawerPatient(r ? { name:r.name, mrn:"—", memberId:r.policy || "—", payorType:r.plan, payorSource:r.plan, gateway:r.gw || undefined } : null); setEligDrawer(/cameron/i.test(r&&r.name||"")?"cameron_williamson":"medicare_advantage"); };
    window.__openRecDrawer = (kind, r) => {
      let ctxKind = kind, row = r, pr = r, hasMrn = !!(r && r.mrn && r.mrn !== "—");
      if (kind === "denial" || kind === "cash") {
        // Denial + Cash Posting combine into one Remit Info tab; records link by row position.
        const idx = (parseInt(String(r.id).replace(/\D/g, ""), 10) || 1) - 1;
        const den = (window.RM_ROWS || [])[idx], cash = (window.CP_ROWS || [])[idx];
        const denMrn = !!(den && den.mrn && den.mrn !== "—");
        ctxKind = "remit";
        if (kind === "denial") { row = hasMrn ? { denial:r, cash } : { denial:r }; }
        else { row = denMrn ? { denial:den, cash:r } : { cash:r }; pr = denMrn ? { ...r, name:den.name } : r; }
      }
      window.__recForDrawer = { kind:ctxKind, row }; setEligInitAutoLog(false); setEligNotifOnly(hasMrn ? false : "rec_" + ctxKind); setEligTab("rec_" + ctxKind);
      const pt = rowToPatient(pr) || {}; if (!hasMrn) { pt.mrn = "—"; pt.memberId = "—"; } setDrawerPatient(pt); setEligDrawer(/cameron/i.test(pr&&pr.name||"")?"cameron_williamson":"medicare_advantage"); };
    window.__openBatchEligDrawer = (r) => { window.__batchForDrawer = r; setEligInitAutoLog(false); setEligNotifOnly("eligStd"); setEligTab("elig"); setDrawerPatient(rowToPatient(r)); setEligDrawer(/cameron/i.test(r&&r.name||"")?"cameron_williamson":"medicare_advantage"); };
    window.__openV2Drawer = (kind, r) => { window.__v2DrawerFocus = { kind, row:r }; setEligInitAutoLog(false); setEligNotifOnly(false); setEligTab("v2" + kind); setDrawerPatient(rowToPatient(r)); setEligDrawer(/cameron/i.test(r&&r.name||"")?"cameron_williamson":"medicare_advantage"); };
    window.__openReferralDrawer = (r) => { window.__referralForDrawer = r; setEligInitAutoLog(false); setEligNotifOnly("referral"); setEligTab("referral"); setDrawerPatient(rowToPatient(r)); setEligDrawer(/cameron/i.test(r&&r.name||"")?"cameron_williamson":"medicare_advantage"); };
    window.__openDocs = (row, fromDetail, entry) => {
      if (fromDetail) { setSavedDrawer(eligDrawer); setEligDrawer(null); }
      setDocsFromDetail(!!fromDetail);
      setDocsRow({...row, __entry: entry||null});
    };
  });
  const closeDocs = () => { setDocsRow(null); if (docsFromDetail && savedDrawer) { setEligDrawer(savedDrawer); setSavedDrawer(null); } };

  // Fullscreen detail replaces the viewport
  if (detail) {
    return (
      <React.Fragment>
      <div style={{minHeight:"100vh",background:"#fff",font:"400 14px/18px Roboto"}} data-screen-label="03 Patient Auth Detail">
        <TopNav section="authorization" onSection={goSection} onLogo={goHome} />
        <PatientAuthDetail patient={detail.patient} onBack={()=>setDetail(null)} />
      </div>
      <ARVTweaks tweaks={tweaks} setTweak={setTweak} />
      {docsRow && <DocsSlideout row={docsRow} entry={docsRow.__entry} fromDetail={docsFromDetail} onClose={closeDocs} />}
      </React.Fragment>
    );
  }

  const EDCComp = (window.__demoVersion==="hchb" && window.HCHB && window.HCHB.EligibilityDetailContainer) || window.EligibilityDetailContainer || (()=>null);
  return (
    <React.Fragment>
    <div style={{minHeight:"100vh",background:"#fff",font:"400 14px/18px Roboto"}} data-screen-label={
      section==="dashboard" ? "01 Dashboard" :
      section==="intake" ? "01 Intake" :
      section==="eligibility" ? "01 Eligibility Dashboard" :
      section==="cdm" ? "01 CDM" : section==="assessments" ? "01 Assessments" : section==="notifications" ? "01 Notifications" : section==="preclaims" ? "01 Pre-Claims" : section==="rcd" ? "01 Claims" : section==="remits" ? "01 Remits" : section==="docext" ? "01 Doc Extraction" : section==="audit_f2f" ? "01 Audit F2F" : section==="audit_prebill" ? "01 Audit Pre-Bill" : "01 Authorization"
    }>
      <TopNav section={section} onSection={goSection} onLogo={goHome} />
      {section==="dashboard" && (
        <DashboardView onPatient={()=>setDetail({ patient: authRows[0] })}
          onAlertNav={(f)=>{ setEligAlert(f); setEligDrawer(null); setDetail(null); setSection("eligibility"); setEligSub(1); }}
          onAuthNav={(reasons)=>{ setDetail(null); setEligDrawer(null); setEligAlert(null);
            if(reasons && reasons.type==="followup"){
              setAuthFollowupFilter(true); setAuthReasonFilter(null); setSection("authorization"); setAuthSub(1);
            } else {
              setAuthFollowupFilter(false); setAuthReasonFilter(reasons && reasons.length ? reasons : null); setSection("authorization"); setAuthSub(1);
            }
          }}
          onPcrNav={(nav)=>{ setDetail(null); setEligDrawer(null); setEligAlert(null); setRcdNaFocus(nav && nav.type ? {...nav, ts:Date.now()} : null); setSection("preclaims"); setPreSub(0); }}
          onReferralNav={(nav)=>{ setDetail(null); setEligDrawer(null); setEligAlert(null); window.__ierFocus = nav ? {...nav, ts:Date.now()} : null; setSection("intake"); setIntakeSub(0); }}
          onEligSectionNav={(nav)=>{ window.__ervFocus = { ...nav, ts:Date.now() }; setDetail(null); setEligDrawer(null); setEligAlert(null); setSection("eligibility"); setEligSub(nav && nav.section==="alert" ? 4 : 1); }}
          onNotifNav={(nav)=>{ setDetail(null); setEligDrawer(null); setEligAlert(null); setNotifFocus(nav ? {...nav, ts:Date.now()} : null); setSection("notifications"); setNotifSub(0); }}
          defaultTab={dashTab}
          eligFilters={{ initDate: eligInitDate, setInitDate: setEligInitDate, fieldFilters: eligFieldFilters, setFieldFilters: setEligFieldFilters }}
          authFilters={{ initDate: authInitDate, setInitDate: setAuthInitDate, fieldFilters: authFieldFilters, setFieldFilters: setAuthFieldFilters }} />
      )}
      {section==="eligibility" && (
        <EligibilitySection
          sub={eligSub}
          onSub={setEligSub}
          alertFilter={eligAlert}
          onClearAlert={()=>setEligAlert(null)}
          openManageRow={openManageRow}
          onManageRowOpened={()=>setOpenManageRow(null)}
          eligFilters={{ initDate: eligInitDate, setInitDate: setEligInitDate, fieldFilters: eligFieldFilters, setFieldFilters: setEligFieldFilters, followUp: eligFollowUp, setFollowUp: setEligFollowUp, eligEntries, setEligEntries }}
          onRefClick={(dk)=>{ setEligInitAutoLog(true); setEligAutoLogSubTab("elig"); setDrawerPatient(null); setEligTab("elig"); setEligDrawer(dk||"medicare_advantage"); }}
          onPatient={(row, entry)=>{
            window.__eligCurrentDrawerRowId = row && row.id;
            if (entry) {
              setSavedEntries(prev => ({ ...prev, [row.id]: entry }));
              setEligEntry(entry); setEligEntryRow(row); setEligIsPending(entry.cov==="pending"); setPendingRow(entry.cov==="pending"?row:null);
              setEligTab("elig"); setDrawerPatient(null); setEligDrawer("medicare_advantage"); return;
            }
            setEligEntry(null); setEligEntryRow(null);
            if (row && row.__tab) {
              setEligIsPending(false); setPendingRow(null);
              setEligTab(row.__tab); setDrawerPatient(rowToPatient(row)); setEligDrawer("medicare_advantage"); return;
            }
            if (row && row.cov === "pending") {
              const saved = savedEntries[row.id];
              if (saved) {
                setEligEntry(saved); setEligEntryRow(row); setEligIsPending(saved.cov==="pending"); setPendingRow(saved.cov==="pending"?row:null);
                setEligTab("elig"); setDrawerPatient(null); setEligDrawer("medicare_advantage"); return;
              }
              setEligIsPending(true); setPendingRow(row); setOpenManageRow(null);
              setEligTab("elig"); setDrawerPatient(rowToPatient(row)); setEligDrawer("medicare_advantage"); return;
            }
            setEligIsPending(false); setPendingRow(null);
            const name = (row && row.name || "").toLowerCase();
            const isCameron = /cameron/.test(name);
            const isRobert  = /robert\s+fox/.test(name);
            const isLeslie  = /leslie/.test(name);
            setEligTab((row && row.__tab) || "elig"); setDrawerPatient(rowToPatient(row));
            setEligDrawer(isCameron ? "cameron_williamson" : isRobert ? "robert_fox" : isLeslie ? "leslie_alexander" : "medicare_advantage");
          }}
        />
      )}
      {section==="intake" && (
        <IntakeSection sub={intakeSub} onSub={setIntakeSub} />
      )}
      {section==="cdm" && (
        <CDMSection sub={cdmSub} onSub={setCdmSub} />
      )}
      {section==="docext" && (
        <DocExtractionSection sub={docxSub} onSub={setDocxSub} />
      )}
      {section==="remits" && (
        <RemitsSection sub={remitsSub} onSub={setRemitsSub} />
      )}
      {section==="notifications" && (
        <NotificationsSection sub={notifSub} onSub={setNotifSub} focus={notifFocus} />
      )}
      {section==="preclaims" && (
        <PreClaimsSection sub={preSub} onSub={setPreSub} naGroupFocus={rcdNaFocus}
          onPatient={(r, openAutoLog)=>{ window.__pcrForDrawer = r; const nm=(r&&r.name||"").toLowerCase();
            if (openAutoLog) { setEligInitAutoLog(true); setEligAutoLogSubTab("pcr"); } else { setEligInitAutoLog(false); }
            setEligTab("pcr"); setDrawerPatient(rowToPatient(r));
            setEligDrawer(/cameron/.test(nm)?"cameron_williamson":"medicare_advantage"); }} />
      )}
      {section==="rcd" && (
        <RCDSection sub={rcdSub} onSub={setRcdSub} naGroupFocus={rcdNaFocus} />
      )}
      {section==="assessments" && (
        <AssessmentsSection sub={asmtSub} onSub={setAsmtSub} logFocus={asmtLogFocus}
          onLogFocus={setAsmtLogFocus} onClearLogFocus={()=>setAsmtLogFocus(null)} />
      )}
      {section==="audit_f2f" && (
        <F2FAuditSection sub={auditSub} onSub={setAuditSub} />
      )}
      {section==="audit_prebill" && (
        <PreBillAuditSection sub={prebillSub} onSub={setPrebillSub} />
      )}
      {section==="authorization" && (
        <AuthorizationSection
          showLeftBar={tweaks.showLeftBar}
          density={tweaks.rowDensity}
          showRowShadow={tweaks.showRowShadow}
          chevronStyle={tweaks.chevronStyle}
          checkboxAccent={tweaks.checkboxAccent}
          sub={authSub}
          onSub={setAuthSub}
          reasonFilter={authReasonFilter}
          review={review}
          onReview={()=>setReview(v=>!v)}
          authFilters={{ initDate: authInitDate, setInitDate: setAuthInitDate, fieldFilters: authFieldFilters, setFieldFilters: setAuthFieldFilters, followUp: authFollowUp, setFollowUp: setAuthFollowUp, authEntries: authSavedEntries, setAuthEntries: setAuthSavedEntries }}
          onRow={(r)=>{ const nm=(r&&r.name||"").toLowerCase(); setEligTab("auth"); setDrawerPatient(rowToPatient(r)); setEligDrawer(/cameron/.test(nm)?"cameron_williamson":"medicare_advantage"); }}
          onAuthRefClick={(dk)=>{ setEligInitAutoLog(true); setEligAutoLogSubTab("auth"); setDrawerPatient(null); setEligTab("elig"); setEligDrawer(dk||"medicare_advantage"); }}
          authOpenManageRow={authOpenManageRow}
          onAuthManageRowOpened={()=>setAuthOpenManageRow(null)}
          followupFilter={authFollowupFilter}
          onClearFollowup={()=>setAuthFollowupFilter(false)}
        />
      )}
    </div>
    {eligDrawer && <EDCComp
      initialKey={eligDrawer} initialTab={eligTab} patientOverride={drawerPatient} notifOnly={eligNotifOnly==="referral" && eligTab!=="referral" ? false : eligNotifOnly}
      eligEntry={eligEntry} eligEntryRow={eligEntryRow}
      isPending={eligIsPending}
      initialShowAutoLog={eligInitAutoLog}
      initialAutoLogSubTab={eligAutoLogSubTab}
      onEditDetails={eligIsPending ? ()=>{ setEligDrawer(null); setEligIsPending(false); setSection("eligibility"); setEligSub(1); setOpenManageRow(pendingRow); } : eligEntry ? ()=>{ setEligDrawer(null); setSection("eligibility"); setEligSub(1); setOpenManageRow(eligEntryRow); } : null}
      onEditAuthDetails={()=>{ const ctx=window.__authForDrawer; const row=ctx&&arvRows.find(r=>r.name===ctx.name); if(row){ setEligDrawer(null); setSection("authorization"); setAuthSub(1); setAuthOpenManageRow(row); } }}
      onClose={()=>{ window.__recForDrawer = null; setEligDrawer(null); setEligNotifOnly(false); setEligEntry(null); setEligEntryRow(null); setEligIsPending(false); setPendingRow(null); setOpenManageRow(null); setEligInitAutoLog(false); setEligAutoLogSubTab("elig"); }}
    />}
    {pcrTermRow && window.RCDInProgressDrawer && React.createElement(window.RCDInProgressDrawer, {
      row: pcrTermRow, title:"Terminate",
      onClose: ()=>{ setPcrTermRow(null); setEligTab("pcr"); setEligDrawer(pcrTermReturn || "medicare_advantage"); },
      onTerminate: ()=>{ setPcrTermRow(null); setEligTab("pcr"); setEligDrawer(pcrTermReturn || "medicare_advantage"); },
    })}
    <ARVTweaks tweaks={tweaks} setTweak={setTweak} />
    {docsRow && <DocsSlideout row={docsRow} entry={docsRow.__entry} fromDetail={docsFromDetail} onClose={closeDocs} />}
    </React.Fragment>
  );
}

// ── Tweaks panel content for the Auth Request View ─────────────
function ARVTweaks({ tweaks, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Auth Request rows">
        <TweakToggle
          label="Left status bar"
          value={tweaks.showLeftBar}
          onChange={(v)=>setTweak("showLeftBar", v)}
        />
        <TweakToggle
          label="Row drop-shadow"
          value={tweaks.showRowShadow}
          onChange={(v)=>setTweak("showRowShadow", v)}
        />
        <TweakRadio
          label="Density"
          value={tweaks.rowDensity}
          options={[
            { label:"Cozy",        value:"cozy" },
            { label:"Comfortable", value:"comfortable" },
            { label:"Roomy",       value:"roomy" },
          ]}
          onChange={(v)=>setTweak("rowDensity", v)}
        />
        <TweakRadio
          label="Chevron"
          value={tweaks.chevronStyle}
          options={[
            { label:"▸ Triangle", value:"triangle" },
            { label:"+ Plus",      value:"plus" },
          ]}
          onChange={(v)=>setTweak("chevronStyle", v)}
        />
      </TweakSection>

      <TweakSection label="Reviewed checkbox">
        <TweakColor
          label="Accent color"
          value={tweaks.checkboxAccent}
          onChange={(v)=>setTweak("checkboxAccent", v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

Object.assign(window,{Prototype});
