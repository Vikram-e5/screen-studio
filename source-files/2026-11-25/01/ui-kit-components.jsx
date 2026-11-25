// WellSky Eligibility & Auth — UI kit components
const { useState } = React;

// ── Primitives ────────────────────────────────────────────────
const colors = {
  headerTop: "rgb(56,71,90)", headerMid: "rgb(44,60,80)", headerBot: "rgb(28,45,66)",
  blue: "#1677FF", teal: "#276966", danger: "#CF1322", success: "#389E0D", warning: "#D7A718", processing: "#6660A6",
  textPri: "#3A424A", textSec: "#6A717D", border1: "#E8E9EA", border2: "#EEF0F3", border3: "#D8D8D8",
  surfaceFilter: "#F0F5FF", dangerBg: "#FFF4F4", dangerBgSoft: "rgba(255,231,230,.65)",
};

function Header({ active, onNav }) {
  const tabs = [["Dashboard","dashboard"],["Eligibility","auth"],["Authorization","auth"]];
  return (
    <div style={{height:72,background:`linear-gradient(${colors.headerTop} 0%, ${colors.headerMid} 42%, ${colors.headerBot} 100%)`,display:"flex",alignItems:"center",padding:"0 20px",color:"#fff",gap:24}}>
      <img src={(window.__resources&&window.__resources.wellskyLogo)||"../../assets/wellsky-logo-white.svg"} style={{height:34}} alt="WellSky" />
      <div style={{display:"flex",gap:24,marginLeft:16}}>
        {tabs.map(([label,key],i)=>(
          <button key={label+i} onClick={()=>onNav&&onNav(key)} style={{background:"transparent",border:"none",padding:"0 2px 6px",cursor:"pointer",color:active===key?"#fff":"rgba(255,255,255,.65)",borderBottom:active===key?"2px solid #fff":"2px solid transparent",font:"400 14px/18px Roboto"}}>{label}</button>
        ))}
      </div>
      <div style={{marginLeft:"auto",display:"flex",gap:16,alignItems:"center"}}>
        <span style={{color:"rgba(255,255,255,.6)",fontSize:18}}>📖</span>
        <div style={{width:28,height:28,borderRadius:"50%",background:"#C6A78F",display:"flex",alignItems:"center",justifyContent:"center",font:"500 12px Roboto",color:"#fff"}}>JM</div>
      </div>
    </div>
  );
}

function SubHeader({ active, onSub, title }) {
  return (
    <div style={{background:`linear-gradient(${colors.headerMid} 0%, ${colors.headerBot} 100%)`,padding:"0 20px",color:"#fff",display:"flex",flexDirection:"column",gap:6,paddingBottom:14}}>
      <div style={{display:"flex",gap:28}}>
        {["Eligibility","Authorization"].map((t,i)=>(
          <button key={t} onClick={()=>onSub&&onSub(i)} style={{background:"transparent",border:"none",padding:"12px 2px 8px",cursor:"pointer",color:active===i?"#fff":"rgba(255,255,255,.45)",borderBottom:active===i?"2px solid #fff":"2px solid transparent",font:"500 16px/20px Roboto"}}>{t}</button>
        ))}
      </div>
      <div style={{font:"400 13px/16px Roboto",color:"rgba(255,255,255,.75)"}}>{title}</div>
    </div>
  );
}

function Button({ children, kind="default", small, onClick, style }) {
  const map = {
    primary:{bg:colors.blue,c:"#fff",bd:colors.blue},
    default:{bg:"#fff",c:colors.textPri,bd:colors.border3},
    ghost:{bg:"transparent",c:colors.blue,bd:colors.blue},
    danger:{bg:"#fff",c:colors.danger,bd:colors.danger},
    link:{bg:"transparent",c:colors.blue,bd:"transparent"},
  };
  const s = map[kind]||map.default;
  return <button onClick={onClick} style={{background:s.bg,color:s.c,border:`1px solid ${s.bd}`,borderRadius:4,padding:small?"3px 11px":"7px 15px",font:`500 ${small?12:14}px/${small?16:18}px Roboto`,cursor:"pointer",...style}}>{children}</button>;
}

function StatusTag({ kind="blue", children }) {
  const map = {
    blue:{bg:"#E6F4FF",bd:"#91CAFF",c:"#1677FF"},
    green:{bg:"#F6FFED",bd:"#B7EB8F",c:"#389E0D"},
    gold:{bg:"#FFFBE6",bd:"#FFE58F",c:"#D7A718"},
    red:{bg:"#FFF1F0",bd:"#FFA39E",c:"#CF1322"},
    purple:{bg:"#F9F0FF",bd:"#D3ADF7",c:"#6660A6"},
    teal:{bg:"#E6F5F4",bd:"#95CFCD",c:"#276966"},
    gray:{bg:"#FAFAFA",bd:"#D9D9D9",c:"#3A424A"},
  };
  const s = map[kind];
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"1px 8px",borderRadius:2,background:s.bg,border:`1px solid ${s.bd}`,color:s.c,font:"400 12px/18px Roboto"}}><span style={{width:6,height:6,borderRadius:"50%",background:s.c}}></span>{children}</span>;
}

function KPIChip({ label, value, tone="neutral" }) {
  const marks = {
    neutral:{bg:"#EAE9F5",c:"#6660A6"},
    active:{bg:"#E6F5F4",c:"#276966"},
    inactive:{bg:"#FAFAFA",c:"#6A717D"},
    warning:{bg:"#FFF7E6",c:"#D7A718"},
    danger:{bg:"#FFE7E6",c:"#CF1322"},
    blue:{bg:"#E6F4FF",c:"#1677FF"},
  };
  const m = marks[tone]||marks.neutral;
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",border:`1px solid ${colors.border1}`,borderRadius:6,background:"#fff",minWidth:150}}>
      <div style={{width:28,height:28,borderRadius:"50%",background:m.bg,color:m.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>●</div>
      <div>
        <div style={{font:"400 12px/14px Roboto",color:colors.textSec}}>{label}</div>
        <div style={{font:"500 20px/24px Roboto",color:colors.textPri}}>{value}</div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, right, children, elevated, style }) {
  return (
    <div style={{border:`1px solid ${colors.border1}`,borderRadius:8,background:"#fff",boxShadow:elevated?"0 22px 26px rgba(86,86,86,.09)":"none",overflow:"hidden",...style}}>
      {(title||right) && <div style={{padding:"14px 20px 8px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div><div style={{font:"500 16px/20px Roboto",color:colors.textPri}}>{title}</div>{subtitle && <div style={{font:"400 12px/16px Roboto",color:colors.textSec,marginTop:2}}>{subtitle}</div>}</div>
        {right}
      </div>}
      <div style={{padding:"4px 20px 20px"}}>{children}</div>
    </div>
  );
}

function FilterBar({ filters=[], onAdd }) {
  return (
    <div style={{background:colors.surfaceFilter,borderRadius:6,padding:"10px 14px",display:"flex",alignItems:"center",gap:12,font:"400 13px/18px Roboto",color:colors.textPri,flexWrap:"nowrap"}}>
      <span style={{fontSize:14,color:colors.textSec,flexShrink:0}}>🛒</span>
      <div className="chip-scroll" style={{display:"flex",alignItems:"center",gap:12,flexWrap:"nowrap",overflowX:"auto",flex:"1 1 auto",minWidth:0}}>
        {filters.map((f,i)=>(<span key={i} style={{background:"#fff",border:`1px solid ${colors.border3}`,borderRadius:4,padding:"4px 10px",whiteSpace:"nowrap",flexShrink:0}}>{f} ▾</span>))}
      </div>
      <span onClick={onAdd} style={{color:colors.processing,font:"500 13px Roboto",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6,flexShrink:0,whiteSpace:"nowrap"}}>
        <span style={{width:14,height:14,borderRadius:"50%",background:colors.processing,color:"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11}}>+</span>Add More Filters
      </span>
    </div>
  );
}

function ActionItemRow({ label, count, alt, onClick }) {
  return (
    <div onClick={onClick} style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",font:"400 14px/18px Roboto",color:colors.textPri,borderTop:`1px solid ${colors.border2}`,background:alt?colors.dangerBg:"#fff",cursor:"pointer"}}>
      <span>{label}</span>
      <span style={{font:"500 14px Roboto",color:colors.danger,border:`.94px solid ${colors.danger}`,borderRadius:2,padding:"1px 8px",minWidth:26,textAlign:"center"}}>{String(count).padStart(2,"0")}</span>
    </div>
  );
}

function DonutChart({ value=348, total=348, color=colors.blueChart||"#0E91C6", label="Total Cov.Status", size=180 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 180 180">
      <circle cx="90" cy="90" r="75" fill={color} />
      <text x="90" y="86" textAnchor="middle" fill="#fff" style={{font:"400 13px Roboto"}}>{label}</text>
      <text x="90" y="108" textAnchor="middle" fill="#fff" style={{font:"500 22px Roboto"}}>{value}</text>
    </svg>
  );
}

function BarRow({ label, value, max=60, color="#0E91C6" }) {
  const w = Math.min(1,value/max)*100;
  return (
    <div style={{marginBottom:10}}>
      <div style={{font:"400 13px/16px Roboto",color:colors.textPri,marginBottom:4}}>{label} - {value}</div>
      <div style={{height:8,background:"#EEF0F3",borderRadius:2,overflow:"hidden"}}><div style={{width:`${w}%`,height:"100%",background:color}}></div></div>
    </div>
  );
}

function DataTable({ columns, rows, onRowClick }) {
  return (
    <div style={{border:`1px solid ${colors.border1}`,borderRadius:6,overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse",font:"400 13px/16px Roboto",color:colors.textPri}}>
        <thead><tr>{columns.map((c,i)=>(<th key={i} style={{background:"#F8FAFD",padding:"10px 12px",textAlign:"left",font:"500 13px/16px Roboto",color:colors.textPri,borderBottom:`1px solid ${colors.border1}`,width:c.w}}>{c.label}</th>))}</tr></thead>
        <tbody>{rows.map((r,i)=>(<tr key={i} onClick={()=>onRowClick&&onRowClick(r)} style={{background:r._attention?colors.dangerBg:"#fff",cursor:onRowClick?"pointer":"default"}}>{columns.map((c,j)=>(<td key={j} style={{padding:"12px",borderBottom:`1px solid ${colors.border2}`}}>{c.render?c.render(r):r[c.key]}</td>))}</tr>))}</tbody>
      </table>
    </div>
  );
}

Object.assign(window,{Header,SubHeader,Button,StatusTag,KPIChip,Card,FilterBar,ActionItemRow,DonutChart,BarRow,DataTable,colors});
