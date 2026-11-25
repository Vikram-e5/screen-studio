// Document slider — the narrow white "Documents" drawer opened from the Docs
// cell in the Assessment request table. Mirrors the reference Documents slider.
const { useState: useASVD, useEffect: useASVDE, useRef: useASVDR } = React;

const ASVD_LINE = "#e2e8f0", ASVD_INK = "#1f2937", ASVD_MUTED = "#6A717D", ASVD_LINK = "#2563eb";

function asvdDocsFor(row){
  if (!row || row.docs === false) return [];
  const isHope = row.source === "HOPE Console";
  const d1 = row.submitted || "04/26/25";
  const d2 = row.asmtInit || d1;
  const list = [
    { id:"d1", name:(isHope?"HOPE Submission File":"OASIS Submission File"), date:d1 },
    { id:"d2", name:"Validation Response Doc", date:d1 },
    { id:"d3", name:"Assessment Request Doc", date:d2 },
  ];
  return row.valStatus === "rejected" ? list : list.slice(0, 2);
}

function ASVDCalendarGlyph(){
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ASVD_LINK} strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function ASVDPaperclip(){
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ASVD_MUTED} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>;
}
function ASVDDownloadGlyph(){
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}

function ASVDocumentDrawer({ row, onClose }){
  const docs = asvdDocsFor(row);
  useASVDE(()=>{ const h=e=>{ if(e.key==="Escape") onClose && onClose(); }; document.addEventListener("keydown",h); return ()=>document.removeEventListener("keydown",h); },[onClose]);
  const meta = [
    ["REF ID", (row && row.episodeId) || "—"],
    ["Submission ID", (row && row.submissionId) || "—"],
    ["Transaction Type", (row && row.txnType) || "—"],
    ["Source", (row && row.source) || "—"],
  ];
  return (<React.Fragment>
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(15,23,42,.45)"}}></div>
    <div role="dialog" aria-label="Documents" style={{position:"fixed",top:0,right:0,bottom:0,width:520,maxWidth:"96vw",background:"#fff",zIndex:901,display:"flex",flexDirection:"column",boxShadow:"-8px 0 32px rgba(15,23,42,.22)",animation:"asvdDocsSlide .22s cubic-bezier(.32,.72,0,1)"}}>
      <style>{"@keyframes asvdDocsSlide{from{transform:translateX(100%)}to{transform:translateX(0)}}"}</style>
      <div style={{padding:"20px 24px 16px",flexShrink:0,borderBottom:`1px solid ${ASVD_LINE}`}}>
        <div style={{display:"flex",alignItems:"center"}}>
          <span style={{font:"500 20px/26px Roboto",color:ASVD_INK}}>Documents</span>
          <button type="button" onClick={onClose} aria-label="Close" style={{marginLeft:"auto",background:"transparent",border:"none",cursor:"pointer",padding:0,color:"#64748b",font:"300 22px/1 Roboto"}}>×</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"0 18px",marginTop:14}}>
          {meta.map(m=>(<span key={m[0]} style={{display:"flex",flexDirection:"column",gap:2,minWidth:0}}>
            <span style={{font:"400 11px/14px Roboto",color:ASVD_MUTED}}>{m[0]}</span>
            <span style={{font:"500 14px/18px Roboto",color:ASVD_INK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={m[1]}>{m[1]}</span>
          </span>))}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",padding:"10px 24px",borderBottom:`1px solid ${ASVD_LINE}`,flexShrink:0}}>
        <a href="#" onClick={e=>e.preventDefault()} style={{marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:6,color:ASVD_LINK,font:"500 13px/18px Roboto",textDecoration:"none"}}><ASVDDownloadGlyph />Download All</a>
      </div>
      <div className="ws-scrollbody" style={{flex:1,overflowY:"auto",padding:"16px 24px 24px",display:"flex",flexDirection:"column",gap:16}}>
        {docs.length === 0
          ? <div style={{textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",padding:"32px 0"}}>No documents on this record.</div>
          : Object.entries(docs.reduce((acc,d)=>{ (acc[d.date]=acc[d.date]||[]).push(d); return acc; },{})).map(([date,items])=>(
            <div key={date} style={{display:"flex",flexDirection:"column",gap:8}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:8,font:"500 14px/18px Roboto",color:ASVD_INK}}><ASVDCalendarGlyph />{date}</span>
              {items.map(d=>(
                <div key={d.id} style={{display:"flex",alignItems:"center",gap:10,minHeight:44,padding:"10px 14px",border:`1px solid ${ASVD_LINE}`,borderRadius:4,background:"#fff"}}>
                  <ASVDPaperclip />
                  <span style={{font:"400 14px/18px Roboto",color:ASVD_INK}}>{d.name}</span>
                  <a href="#" onClick={e=>e.preventDefault()} style={{marginLeft:"auto",color:ASVD_LINK,font:"500 14px/18px Roboto",textDecoration:"none"}}>View</a>
                </div>
              ))}
            </div>
          ))}
      </div>
      <div style={{flexShrink:0,borderTop:`1px solid ${ASVD_LINE}`,padding:"12px 24px",display:"flex"}}>
        <button type="button" onClick={onClose} style={{marginLeft:"auto",background:"#fff",border:`1px solid ${ASVD_LINE}`,borderRadius:4,padding:"8px 16px",font:"400 13px Roboto",color:ASVD_INK,cursor:"pointer"}}>Close</button>
      </div>
    </div>
  </React.Fragment>);
}

if (typeof window !== "undefined") { window.ASVDocumentDrawer = ASVDocumentDrawer; }
