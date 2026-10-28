// Dashboard — Eligibility overview (rebuilt from the attached Figma frame).
// Reuses the app chrome + blue filter strap (ARVFilterBarChips) from the
// other pages; content, colors and copy are taken verbatim from the frame.
const { useState: useDash } = React;

// ── small icons ──────────────────────────────────────────────
function UserGlyph({ size = 20, color = "#626D8A" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.6 0-8 1.8-8 4.5V20h16v-1.5C20 15.8 15.6 14 12 14Z" fill={color} />
    </svg>
  );
}
function WarnGlyph({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M12 3 1.5 21h21L12 3Z" fill="none" stroke="#CF1322" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 10v5" stroke="#CF1322" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="17.6" r="1" fill="#CF1322" />
    </svg>
  );
}
function DownloadGlyph({ size = 18, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ── donut chart (SVG arcs) ───────────────────────────────────
function Donut({ segments, size = 152, thickness = 26, centerTop, centerBottom, centerTopSize = 12, centerTopWeight = 400, centerBottomSize = 20, centerBottomWeight = 600, centerTopY = "46%", centerBottomY = "60%" }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {segments.map((s, i) => {
          const len = circ * (s.value / total);
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={s.color} strokeWidth={thickness}
              strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-offset} />
          );
          offset += len;
          return el;
        })}
      </g>
      {centerTop && <text x="50%" y={centerTopY} textAnchor="middle" style={{ fontFamily: "Roboto, sans-serif", fontWeight: centerTopWeight, fontSize: centerTopSize, fill: "#7E8B99" }}>{centerTop}</text>}
      {centerBottom && <text x="50%" y={centerBottomY} textAnchor="middle" style={{ fontFamily: "Roboto, sans-serif", fontWeight: centerBottomWeight, fontSize: centerBottomSize, fill: "#1F5676" }}>{centerBottom}</text>}
    </svg>
  );
}

function Swatch({ color }) {
  return <span style={{ width: 12, height: 12, borderRadius: 2, background: color, display: "inline-block", flexShrink: 0 }} />;
}
function LegendRow({ color, label, value, divider = true, valueStyle }) {
  return (
    <div style={{ borderBottom: divider ? "1px solid #F3E0E0" : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", font: "400 15px/20px Roboto", color: "rgba(0,0,0,.65)" }}>
        <Swatch color={color} />
        <span style={{ flex: 1 }}>{label}</span>
        <span style={{ color: "rgba(59,59,59,.65)", ...valueStyle }}>{value}</span>
      </div>
    </div>
  );
}

// Legend list that caps its height: shows the first `initial` rows, then a
// "+N more" toggle that opens the rest in a scroll area inside the card.
function CollapsibleLegend({ items, initial = 4 }) {
  const [open, setOpen] = React.useState(false);
  const extra = items.length - initial;
  const shown = open ? items : items.slice(0, initial);
  return (
    <div>
      <div className="hide-sb" style={{ maxHeight: open ? 150 : "none", overflowY: open ? "auto" : "visible" }}>
        {shown.map((x, i) => <LegendRow key={x[0]} color={x[2]} label={x[0]} value={p2(x[1])} divider={i < shown.length - 1} valueStyle={{ marginRight: 4 }} />)}
      </div>
      {extra > 0 && (
        <button type="button" onClick={() => setOpen(o => !o)} style={{ marginTop: 8, border: "none", background: "transparent", padding: 0, cursor: "pointer", font: "500 13px/18px Roboto", color: "#1677FF" }}>
          {open ? "Show less" : "+" + extra + " more"}
        </button>
      )}
    </div>
  );
}

// ── dashboard card shell ─────────────────────────────────────
function DashCard({ title, right, info, legend, children, style, bodyStyle, bodyClass }) {
  return (
    <div style={{ border: "1px solid #E8E9EA", borderRadius: 9, background: "#fff", padding: "18px 28px", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box", ...style }}>
      {(title || right) && (
        <div style={{ marginBottom: 14, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 30, font: "500 16px/20px Roboto", color: "#3A424A" }}>
              {title}{info && (typeof info === "string" ? <InfoTip text={info} /> : <InfoCircle />)}
            </div>
            {right}
          </div>
          {legend && <div style={{ marginTop: 8 }}>{legend}</div>}
        </div>
      )}
      <div className={bodyClass} style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", ...bodyStyle }}>{children}</div>
    </div>
  );
}

// Info glyph with a hover tooltip describing what a chart shows.
function InfoTip({ text }) {
  const [pos, setPos] = useDash(null);
  const W = 260;
  const open = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const left = Math.max(8, Math.min(r.left - 14, window.innerWidth - W - 8));
    setPos({ left, top: r.bottom + 9, arrow: r.left + r.width / 2 - left - 4.5 });
  };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", cursor: "help" }}
      onMouseEnter={open} onMouseLeave={() => setPos(null)}>
      <InfoCircle />
      {pos && ReactDOM.createPortal(
        <span style={{ position: "fixed", left: pos.left, top: pos.top, width: W, boxSizing: "border-box", background: "#2A333D", color: "#fff", borderRadius: 6, padding: "8px 11px", font: "400 12px/17px Roboto", whiteSpace: "normal", textWrap: "pretty", boxShadow: "0 4px 14px rgba(20,32,55,.24)", zIndex: 1000, pointerEvents: "none" }}>
          {text}
          <span style={{ position: "absolute", left: pos.arrow, top: -4, transform: "rotate(45deg)", width: 9, height: 9, background: "#2A333D" }} />
        </span>, document.body)}
    </span>
  );
}

function SortByBtn() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#1677FF", font: "400 14px/18px Roboto", cursor: "pointer" }}>
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M6 4v12m0 0 3-3m-3 3-3-3M14 16V4m0 0 3 3m-3-3-3 3" stroke="#1677FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      Sort by <span style={{ fontSize: 9 }}>▾</span>
    </span>
  );
}

// ── KPI stat card (exact spec from the frame) ────────────────
function KpiIcon() {
  return (
    <div style={{ position: "relative", width: 46, height: 44, borderRadius: "50%", background: "rgb(241,244,249)", flexShrink: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 6.041, top: 7.945, width: 29.657, height: 26.452, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 23.84, height: 22.994, background: "rgba(168,141,235,0.71)", clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
        <div style={{ position: "absolute", left: 12.77, top: 10.164, width: 16.887, height: 16.288, borderRadius: "50%", background: "rgba(95,200,232,0.7)" }} />
      </div>
    </div>
  );
}
function StatCard({ label, value, compact, fill }) {
  if (compact) return (
    <div title={label} style={{ flex: "1 1 0", minWidth: 0, height: 84, borderRadius: 5, background: "#fff", boxShadow: "inset 0 0 0 1.029px rgb(238,241,247), 0 4.115px 10.287px rgba(86,86,86,0.07)", display: "flex", alignItems: "center", gap: 8, padding: "0 10px", boxSizing: "border-box" }}>
      <KpiIcon />
      <div style={{ minWidth: 0 }}>
        <div style={{ font: "400 12px/15px Roboto", color: "rgb(126,139,153)", whiteSpace: "pre-line" }}>{label}</div>
        <div style={{ font: "500 20px/1 Roboto", color: "#000", marginTop: 3 }}>{value}</div>
      </div>
    </div>
  );
  return (
    <div title={fill ? label : undefined} style={{ flex: fill ? "1 1 0" : "1 1 auto", minWidth: fill ? 0 : undefined, height: 84, borderRadius: 5, background: "#fff", boxShadow: "inset 0 0 0 1.029px rgb(238,241,247), 0 4.115px 10.287px rgba(86,86,86,0.07)", display: "flex", alignItems: "center", gap: 10, padding: "0 16px 0 12px", boxSizing: "border-box" }}>
      <KpiIcon />
      <div style={{ minWidth: 0 }}>
        <div style={{ font: "400 16px/19px Roboto", color: "rgb(126,139,153)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
        <div style={{ font: "500 24px/1 Roboto", color: "#000", marginTop: 3 }}>{value}</div>
      </div>
    </div>
  );
}
function PCRInfoDot({ statuses, compare }) {
  const [hover, setHover] = React.useState(false);
  const IC = (typeof window!=="undefined" && window.InfoCircle) || null;
  return (
    <span onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} style={{position:"relative",display:"inline-flex",flexShrink:0}}>
      {IC ? <IC size={12} /> : <span style={{width:12,height:12,borderRadius:"50%",border:"1px solid rgba(0,0,0,0.35)",color:"rgba(0,0,0,0.5)",font:"600 8px/11px Roboto",display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"default"}}>i</span>}
      {hover && statuses && (
        <div style={{position:"absolute",top:16,left:0,zIndex:20,background:"#0f172a",color:"#fff",borderRadius:6,padding:"8px 10px",font:"400 12px/16px Roboto",whiteSpace:"nowrap",boxShadow:"0 4px 12px rgba(15,23,42,0.25)"}}>
          Includes: {statuses.join(", ")}
        </div>
      )}
      {hover && compare && (
        <div style={{position:"absolute",top:16,left:0,zIndex:20,background:"#0f172a",color:"#fff",borderRadius:6,padding:"10px 12px",font:"400 12px/16px Roboto",whiteSpace:"nowrap",boxShadow:"0 4px 12px rgba(15,23,42,0.25)",display:"flex",flexDirection:"column",gap:6}}>
          <div style={{color:"#94a3b8",marginBottom:2}}>Compared to the previous {compare.lenDays} days</div>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:6,height:6,borderRadius:"50%",background:"#5fc8e8",flexShrink:0}}></span>{compare.curLabel}<span style={{fontWeight:600,marginLeft:"auto"}}>{compare.curCount}</span></div>
          <div style={{display:"flex",alignItems:"center",gap:6,color:"#94a3b8"}}><span style={{width:6,height:6,borderRadius:"50%",background:"#64748b",flexShrink:0}}></span>{compare.prevLabel}<span style={{fontWeight:600,marginLeft:"auto"}}>{compare.prevCount}</span></div>
        </div>
      )}
    </span>
  );
}
const PCR_FAILED_REASONS = [
  "Affirmed UTN cannot be used for resubmission",
  "Decision letter not available post multiple retry attempts",
  "Failure in requestor information in Palmetto",
  "Failure in Messages tab of Palmetto",
  "View or Edit submission documentation button is disabled",
  "Previous submission is not available in HCHB",
  "Application error popup occurred while downloading the task file.",
];
function PCRStatCard({ label, value, pct, count, group, growth, growthTip, onClick, fill }) {
  const isPct = pct !== undefined;
  const [hov, setHov] = useDash(false);
  const growthColor = growth ? (growth.dir==="up" ? { bg:"#fdecec", c:"#c92a2a" } : growth.dir==="down" ? { bg:"#e9f7ef", c:"#1e8e50" } : { bg:"#f1f3f5", c:"#64748b" }) : null;
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} role={onClick?"button":undefined} tabIndex={onClick?0:undefined} title={onClick?("View these records in the PCR view"):undefined}
      style={{ flex: fill ? "1 1 0" : "1 1 auto", minWidth: fill ? 0 : undefined, height: 84, borderRadius: 5, background: "#fff", boxShadow: onClick&&hov ? "inset 0 0 0 1.029px #1677FF, 0 6px 14px rgba(22,119,255,0.16)" : "inset 0 0 0 1.029px rgb(238,241,247), 0 4.115px 10.287px rgba(86,86,86,0.07)", display: "flex", alignItems: "center", gap: 10, padding: "0 16px 0 12px", boxSizing: "border-box", cursor: onClick?"pointer":"default", transition:"box-shadow .12s" }}>
      <KpiIcon />
      <div style={{minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:5,minWidth:0}}>
          <div title={fill ? label : undefined} style={{ font: "400 16px/19px Roboto", color: "rgb(126,139,153)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{label}</div>
          {group && <PCRInfoDot statuses={group} />}
          {growthTip && <PCRInfoDot compare={growthTip} />}
        </div>
        <div style={{display:"flex",alignItems:"baseline",gap:8,marginTop:3}}>
          <div style={{ font: "500 24px/1 Roboto", color: "#000" }}>{isPct ? pct : value}</div>
          {isPct && <span style={{background:"rgba(61,116,155,0.1)",color:"#3d749b",borderRadius:17,padding:"3px 12px",font:"500 12px/16px Roboto",whiteSpace:"nowrap"}}>{count}</span>}
          {growth && <span style={{background:growthColor.bg,color:growthColor.c,borderRadius:17,padding:"2px 10px",font:"500 12px/16px Roboto",whiteSpace:"nowrap"}}>{growth.dir==="up"?"▲":growth.dir==="down"?"▼":"–"} {growth.pct}%</span>}
        </div>
      </div>
    </div>
  );
}

// ── horizontal bar row ───────────────────────────────────────
// ── horizontal bar chart (categories on Y, record counts on X) ──
function HBarChart({ data, xLabel, legend, labelW = 152 }) {
  const max = Math.max(4, Math.ceil(Math.max(...data.map(d=>d.value), 1) / 4) * 4);
  const ticks = [0, max/4, max/2, (max*3)/4, max];
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {legend && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "flex-end", marginBottom: 10 }}>
          {legend.map(l => (
            <span key={l.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "400 11px/14px Roboto", color: "#6A717D" }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: l.color }} />{l.label}
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: `${labelW}px 1fr`, rowGap: 10, alignItems: "center", flex: 1 }}>
        {data.map(d => (
          <React.Fragment key={d.label}>
            <span title={d.label} style={{ font: "400 12px/16px Roboto", color: "#6A717D", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 10 }}>{d.label}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ height: 14, width: `${(d.value / max) * 100}%`, background: d.color || "#4C9FD1", borderRadius: "0 2px 2px 0", minWidth: d.value ? 2 : 0 }} />
              <span style={{ font: "500 12px/16px Roboto", color: "#3A424A" }}>{d.value}</span>
            </span>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `${labelW}px 1fr`, marginTop: 8 }}>
        <span />
        <span style={{ position: "relative", height: 16, borderTop: "1px solid #B7C2D0" }}>
          {ticks.map(t => (
            <span key={t} style={{ position: "absolute", left: (t / max) * 100 + "%", transform: "translateX(-50%)", font: "400 11px/16px Roboto", color: "#8A94A6" }}>{t}</span>
          ))}
        </span>
      </div>
      {xLabel && <div style={{ textAlign: "center", font: "400 12px Roboto", color: "#8A94A6", marginTop: 14 }}>{xLabel}</div>}
    </div>
  );
}

// ── horizontal bar row ───────────────────────────────
function BarRow({ label, value, max }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ font: "400 14px/18px Roboto", color: "#3A424A", marginBottom: 7 }}>{label} - {value}</div>
      <div style={{ height: 9, background: "#EEF1F7", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: "#1677FF", borderRadius: 2 }} />
      </div>
    </div>
  );
}

// ── action-item rows ─────────────────────────────────────────
function BigActionRow({ label, count, onClick, noIcon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#fff", border: "1px solid #F1E4E4", borderRadius: 9, marginBottom: 12, boxShadow: "0 1px 3px rgba(86,86,86,.06)" }}>
      {!noIcon && <UserGlyph />}
      <span style={{ flex: 1, font: "500 16px/20px Roboto", color: "#3A424A" }}>{label}</span>
      <span onClick={onClick} style={{ font: "400 16px Roboto", color: "#CF1322", borderBottom: "1px solid #CF1322", lineHeight: "20px", cursor: onClick ? "pointer" : "default" }}>{count}</span>
    </div>
  );
}
function AlertRow({ label, count, alt, onClick }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: alt ? "#FDF2F2" : "#fff", borderBottom: "1px solid #F1E4E4", cursor: onClick ? "pointer" : "default" }}>
      <span style={{ flex: 1, font: "400 15px/20px Roboto", color: "#3A424A" }}>{label}</span>
      <span style={{ font: "400 15px Roboto", color: "#CF1322", borderBottom: "1px solid #CF1322", lineHeight: "19px" }}>{count}</span>
    </div>
  );
}
function AutomationGroup({ title, sub, count, children, defaultOpen, onNav, linkCount, userIcon }) {
  const [open, setOpen] = useDash(!!defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid #EEF1F7" }}>
      <div onClick={() => onNav && onNav()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", cursor: "pointer", background: "#F0F6FC" }}>
        <span onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }} style={{ display: "inline-flex", color: "#1677FF", transition: "transform .15s", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 8 L19 8 L12 17 Z" fill="currentColor" /></svg>
        </span>
        {userIcon && (
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" style={{ flexShrink: 0, color: "#5B8FF9" }}>
            <circle cx="8" cy="5" r="2.6" fill="currentColor" />
            <path d="M2.6 13.4c0-2.6 2.4-4.2 5.4-4.2s5.4 1.6 5.4 4.2z" fill="currentColor" />
          </svg>
        )}
        <span style={{ font: "500 15px/20px Roboto", color: "#3A424A" }}>{title}</span>
        <span style={{ font: "400 13px/18px Roboto", color: "#8A94A6" }}>- {sub}</span>
        <span style={{ marginLeft: "auto", font: "400 15px Roboto", color: linkCount ? "#1677FF" : "#CF1322", borderBottom: `1px solid ${linkCount ? "#1677FF" : "#CF1322"}`, lineHeight: "19px" }}>{count}</span>
      </div>
      {open && children}
    </div>
  );
}
function AItemArrow() {
  return (
    <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#1677FF", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}
function AutomationItem({ label, count, more, onClick, arrow }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px 10px 34px", cursor: onClick ? "pointer" : "default", borderTop: arrow ? "1px solid #F1F5F9" : "none" }}>
      <span style={{ flex: 1, font: `400 14px/18px Roboto`, color: more ? "#1677FF" : "#3A424A" }}>{label}</span>
      {arrow && !more && <AItemArrow />}
      {!more && <span style={{ font: "400 14px Roboto", color: arrow ? "#1677FF" : "#CF1322", borderBottom: `1px solid ${arrow ? "#1677FF" : "#CF1322"}`, lineHeight: "18px", minWidth: 22, textAlign: "right" }}>{count}</span>}
    </div>
  );
}
// Small info glyph beside "Needs Attention"; hovering surfaces the exact
// terminated / failed exception counts in a tooltip.
function NeedsAttentionInfo({ terminated, failed }) {
  const [show, setShow] = useDash(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span style={{ width: 15, height: 15, borderRadius: "50%", border: "1.4px solid #8A94A6", color: "#8A94A6", font: "600 10px/1 Roboto", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "default" }}>i</span>
      {show && (
        <span style={{ position: "absolute", left: "50%", top: "calc(100% + 8px)", transform: "translateX(-50%)", background: "#2A333D", color: "#fff", borderRadius: 6, padding: "8px 11px", font: "400 12px/16px Roboto", whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(20,32,55,.24)", zIndex: 40 }}>
          <span style={{ display: "block" }}>Terminated — Business Exception: <b>{terminated}</b></span>
          <span style={{ display: "block", marginTop: 2 }}>Failed — Technical Exception: <b>{failed}</b></span>
          <span style={{ position: "absolute", left: "50%", top: -5, transform: "translateX(-50%) rotate(45deg)", width: 9, height: 9, background: "#2A333D" }} />
        </span>
      )}
    </span>
  );
}
function CollapsibleReasons({ reasons, onReason, initial = 2 }) {
  const [expanded, setExpanded] = useDash(false);
  const shown = expanded ? reasons : reasons.slice(0, initial);
  const hidden = reasons.length - initial;
  return (
    <>
      {shown.map(([r, c]) => <AutomationItem key={r} label={r} count={p2(c)} onClick={() => onReason && onReason(r)} />)}
      {hidden > 0 && <AutomationItem more label={expanded ? "Show less" : `+ ${hidden} more`} onClick={() => setExpanded(v => !v)} />}
    </>
  );
}

// ── dashboard dark band (service-line tabs) ──────────────────
const CLAIMS_TABS = [
  { key: "pcr",   label: "PCR" },
  { key: "claim", label: "Claim" },
];
const ELIG_SUBVIEWS = [["elig", "Eligibility"], ["eligAlert", "Alerts"], ["eligHO", "HO Intake"]];
function DashboardBand({ active, onTab, subtitle }) {
  const [eligOpen, setEligOpen] = useDash(false);
  const eligRef = React.useRef(null);
  React.useEffect(() => { if (!eligOpen) return; const h = (e) => { if (eligRef.current && !eligRef.current.contains(e.target)) setEligOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [eligOpen]);
  const eligSub = ELIG_SUBVIEWS.find(x => x[0] === active);
  const tabs = [
    { key: "elig", label: "Eligibility", menu: true },
    { key: "auth", label: "Authorization" },
    { key: "referral", label: "E-Referral" },
    { key: "pcr",  label: "PCR" },
    { key: "claim", label: "Claims" },
    { key: "assess", label: "Assessment" },
    { key: "notif", label: "Notifications" },
  ];
  return (
    <div style={{ background: "linear-gradient(to right, rgb(56,71,90) 0%, rgb(28,45,66) 100%)", padding: "6px 32px 0", color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 30 }}>
        {tabs.map(t => {
          if (t.menu) { const act = !!eligSub; return (
            <div key={t.key} ref={eligRef} style={{ position: "relative" }}>
              <button onClick={() => setEligOpen(v => !v)} style={{ background: "transparent", border: "none", cursor: "pointer", color: act ? "#fff" : "rgba(255,255,255,.55)", padding: "8px 2px 12px", display: "inline-flex", alignItems: "center", gap: 6, font: `${act ? 500 : 400} 16px/20px Roboto`, borderBottom: `2px solid ${act ? "#fff" : "transparent"}` }}>
                {eligSub && eligSub[0] !== "elig" ? "Eligibility · " + eligSub[1] : "Eligibility"}<span style={{ fontSize: 11 }}>▾</span>
              </button>
              {eligOpen && (
                <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 2, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 8px 24px rgba(15,23,42,.18)", padding: 6, minWidth: 180, zIndex: 40 }}>
                  {ELIG_SUBVIEWS.map(([k, l]) => (
                    <button key={k} type="button" onClick={() => { onTab(k); setEligOpen(false); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: k === active ? "#eff6ff" : "transparent", border: "none", borderRadius: 6, padding: "8px 10px", cursor: "pointer", font: `${k === active ? 500 : 400} 13px/16px Roboto`, color: k === active ? "#1d4ed8" : "#333", textAlign: "left" }}>
                      {l}{k === active && <span style={{ fontSize: 11 }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ); }
          const act = active === t.key;
          return (
            <button key={t.key} onClick={() => onTab(t.key)} style={{ background: "transparent", border: "none", cursor: "pointer", color: act ? "#fff" : "rgba(255,255,255,.55)", padding: "8px 2px 12px", display: "inline-flex", alignItems: "center", gap: 8, font: `${act ? 500 : 400} 16px/20px Roboto`, borderBottom: `2px solid ${act ? "#fff" : "transparent"}` }}>
              {t.label}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 0 14px" }}>
        <span style={{ font: "400 14px/18px Roboto", color: "rgba(255,255,255,.85)" }}>{subtitle}</span>
      </div>
    </div>
  );
}

const ELIG_DASH_FILTER_FIELDS = [
  { key: "agency",   label: "Agency" },
  { key: "branch",   label: "Branch" },
  { key: "payorSrc", label: "Payor Source" },
  { key: "payor",    label: "Payor" },
  { key: "gw",       label: "Gateway" },
];
const AUTH_DASH_FILTER_FIELDS = [
  { key: "agency",  label: "Agency" },
  { key: "branch",  label: "Branch" },
  { key: "src",     label: "Payor Source" },
  { key: "ptype",   label: "Payor Type" },
  { key: "gw",      label: "Gateway" },
];
const DASH_FILTER_FIELDS = ELIG_DASH_FILTER_FIELDS;

// Dashboard reflects the REAL Eligibility Request View data (window.ERV_ROWS),
// filtered by the selected Elig-Init date range.
const DASH_PTYPE = ["Medicare", "Medicare Adv", "Medicaid", "Commercial"];
const DASH_PAYOR = ["UHC", "Aetna", "Others", "Anthem"];
const DASH_ALERTS = ["Policy with future activation date", "Patient does not have active coverage", "Home Health benefits are not returned with eligibility", "The address of the patient falls outside the branch location", "The payer of the patient is no longer used in the system", "Inactive coverage alert", "Eligibility Retrival alert"];
const DASH_PTYPE_COLOR = { "Medicare": "#156082", "Medicare Adv": "#618EAA", "Medicaid": "#F8C87C", "Commercial": "#A18B6D" };
const DASH_PAYOR_COLOR = { "UHC": "#618EAA", "Aetna": "#156082", "Others": "#A18B6D", "Anthem": "#F8C87C" };
// Payor Type derived from the payor / payor-source combination.
function dashPtype(payor, src) {
  const p = (payor || "").toLowerCase(), s = (src || "").toLowerCase();
  if (p.includes("medicaid") || s.includes("plus")) return "Medicaid";
  if (p.includes("medicare")) return "Medicare";
  if (p.includes("humana")) return "Commercial";       // Humana plans → Commercial
  return "Medicare Adv";                                  // Aetna / UHC advantage plans
}
// Payor Distribution grouping from the payor column.
function dashPayorGroup(payor) {
  const p = (payor || "").toLowerCase();
  if (p.includes("uhc")) return "UHC";
  if (p.includes("aetna")) return "Aetna";
  if (p.includes("anthem")) return "Anthem";
  return "Others";
}
function dashRecords(rows) {
  return (rows || window.ERV_ROWS || []).map(r => ({
    date: r.eligInit, cov: r.cov, id: r.id,
    payor: dashPayorGroup(r.payor), ptype: dashPtype(r.payor, r.payorSrc),
    alertList: r.alertList || [], atGroup: r.atGroup || "", atReason: r.atReason || "",
    alert: (r.alertList || []).length > 0,
    agency: r.agency, branch: r.branch, payorSrc: r.payorSrc, gw: r.gw, at: r.at,
    followUp: r.followUp || "",
  }));
}
const p2 = (x) => String(Math.round(x)).padStart(2, "0");
function computeDashMetrics(f, N) {
  const n = f.length, sc = N ? n / N : 0;
  const cnt = (k) => f.filter(r => r.cov === k).length;
  const pctOf = (key, v) => n ? Math.round(f.filter(r => r[key] === v).length / n * 100) : 0;
  const cov = { active: cnt("active"), inactive: cnt("inactive"), mixed: cnt("mixed") };
  cov.total = cov.active + cov.inactive + cov.mixed;
  const alertRows = DASH_ALERTS.map(a => [a, f.filter(r => (r.alertList || []).includes(a)).length]);
  const alertTotal = alertRows.reduce((s, x) => s + x[1], 0);
  const term = f.filter(r => r.atGroup === "terminated").length;
  const failed = f.filter(r => r.atGroup === "failed").length;
  const reasonCounts = (grp) => {
    const m = {};
    f.filter(r => r.atGroup === grp).forEach(r => { if (r.atReason) m[r.atReason] = (m[r.atReason] || 0) + 1; });
    return Object.keys(m).map(k => [k, m[k]]);
  };
  return {
    n,
    kpi: { all: n, pending: cnt("pending"), active: cnt("active"), inactive: cnt("inactive"), mixed: cnt("mixed"), exceptions: cnt("exception"), alerts: f.filter(r => r.alert).length },
    cov,
    bars: [["Inactive coverage", 54], ["Payor Mapping incorrect in EHR", 44], ["Additional Coverage Detected", 39], ["Patient outside of coverage area", 36], ["DOB Mismatch", 28]].map(([l, v]) => [l, Math.round(v * sc)]),
    ptype: DASH_PTYPE.map(v => [v, pctOf("ptype", v), DASH_PTYPE_COLOR[v]]).sort((a, b) => b[1] - a[1]),
    payor: DASH_PAYOR.map(v => [v, pctOf("payor", v), DASH_PAYOR_COLOR[v]]).sort((a, b) => b[1] - a[1]),
    needsReview: alertTotal + term + failed,
    aiPending: cnt("pending"), aiFollow: f.filter(r=>{ const extra=(window.__eligFollowUp||{})[r.id]; return (extra&&extra!=="-"&&extra!=="")||(r.followUp&&r.followUp!=="-"&&r.followUp!==""); }).length, alertTotal,
    alerts: alertRows.slice().sort((a, b) => b[1] - a[1]),
    autoTotal: term + failed, autoTerminated: term, autoTermItem: Math.min(term, 1), autoFailed: failed,
    termReasons: reasonCounts("terminated"), failedReasons: reasonCounts("failed"),
    sc,
  };
}

// ── main dashboard ───────────────────────────────────────────
function DashboardView({ onPatient, onAlertNav, onAuthNav, onPcrNav, onReferralNav, onNotifNav, onEligSectionNav, eligFilters, authFilters, defaultTab }) {
  const [review, setReview] = useDash(false);
  const [activeTab, setActiveTab] = useDash(defaultTab || "elig");
  const [modeOpen, setModeOpen] = useDash(false);
  const [mode, setMode] = useDash("All Elig Requests");
  const [_eligInitDate, _setEligInitDate] = useDash(() => window.defaultDateRange([...new Set((window.ERV_ROWS||[]).map(r => r.eligInit))], 30));
  const initDate = (eligFilters && eligFilters.initDate !== undefined) ? eligFilters.initDate : _eligInitDate;
  const setInitDate = (eligFilters && eligFilters.setInitDate) || _setEligInitDate;
  const [_eligFF, _setEligFF] = useDash([]);
  const fieldFilters = (eligFilters && eligFilters.fieldFilters !== undefined) ? eligFilters.fieldFilters : _eligFF;
  const setFieldFilters = (eligFilters && eligFilters.setFieldFilters) || _setEligFF;
  const filteredRecords = React.useMemo(() => {
    let rows = window.ERV_ROWS || [];
    if (fieldFilters.length) rows = rows.filter(r => fieldFilters.every(f => f.values.includes(r[f.field])));
    rows = rows.filter(r => window.dateInRange(r.eligInit, initDate));
    if (mode === "All Non-Automated Requests") rows = rows.filter(r => r.mode !== "gear");
    if (mode === "All Automated Requests")     rows = rows.filter(r => r.mode === "gear");
    return dashRecords(rows);
  }, [fieldFilters, initDate, mode]);
  const m = computeDashMetrics(filteredRecords, (window.ERV_ROWS||[]).length);
  const modeRef = React.useRef(null);
  React.useEffect(() => {
    if (!modeOpen) return;
    const h = (e) => { if (modeRef.current && !modeRef.current.contains(e.target)) setModeOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [modeOpen]);
  const MODES = ["All Elig Requests", "All Non-Automated Requests", "All Automated Requests"];

  const stats = [
    ["All Patients", p2(m.kpi.all)], ["Pending Submission", p2(m.kpi.pending)], ["Active", p2(m.kpi.active)],
    ["Inactive", p2(m.kpi.inactive)], ["Mixed", p2(m.kpi.mixed)], ["Exceptions", p2(m.kpi.exceptions)], ["Eligibility Alerts", p2(m.kpi.alerts)],
  ];

  return (
    <div style={{ background: "#fff" }}>
      <DashboardBand active={activeTab} onTab={setActiveTab} subtitle={
        activeTab === "elig" ? "Summary of Eligibility Request Status" :
        activeTab === "eligAlert" ? "Eligibility Alerts Awaiting Adjudication" :
        activeTab === "eligHO" ? "Hospice Intake Referrals Pending Eligibility" :
        activeTab === "auth" ? "Authorization Status Summary and Trends" :
        activeTab === "pcr"  ? "Summary of PCR Status" :
        activeTab === "referral" ? "Summary of E-Referral Status" :
        activeTab === "assess" ? "OASIS / HOPE Submission Performance" :
        activeTab === "notif" ? "Summary of Notification Status" : "Claim Status Summary"} />

      {activeTab === "eligAlert" ? <EligSectionDashboard section="alert" onNav={onEligSectionNav} /> :
       activeTab === "eligHO" ? <EligSectionDashboard section="hospice" onNav={onEligSectionNav} /> :
       activeTab === "assess" ? <AssessmentDashboard /> :
       activeTab === "notif" ? <NotificationsDashboard onNav={onNotifNav} /> :
       activeTab === "pcr" ? <PCRDashboard onNav={onPcrNav} /> :
       activeTab === "referral" ? <ReferralDashboard onNav={onReferralNav} /> :
       activeTab === "claim" ? (
        <div style={{ padding: "80px 32px", textAlign: "center", font: "400 15px/22px Roboto", color: "#8A94A6" }}>
          Claim dashboard is not built yet — PCR is the live service line.
        </div>
       ) :
       activeTab === "auth" ? <AuthDashboard onAuthNav={onAuthNav} authFilters={authFilters} /> : (
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {/* ── left column (blue strap ends here) ── */}
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          <ARVFilterBarChips
            hideSearch={true}
            datePicker={{label:"Elig Initiated Date", value:initDate, available:[...new Set((window.ERV_ROWS||[]).map(r=>r.eligInit))], onChange:setInitDate}}
            filterFields={ELIG_DASH_FILTER_FIELDS}
            filterRows={window.ERV_ROWS||[]}
            fieldFilters={fieldFilters}
            onFieldFilters={setFieldFilters}
          />
          <div style={{ padding: "20px 32px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, font: "500 18px/22px Roboto", color: "#0f172a", position: "relative" }} ref={modeRef}>
            Coverage Summary -
            <button type="button" onClick={() => setModeOpen(v => !v)} style={{ background: "transparent", border: "none", cursor: "pointer", font: "500 18px/22px Roboto", color: "#2563eb", display: "inline-flex", alignItems: "center", gap: 4, padding: 0 }}>
              {mode}<span style={{ fontSize: 14 }}>▾</span>
            </button>
            {modeOpen && (
              <div style={{ position: "absolute", top: "100%", left: 150, marginTop: 6, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 8px 24px rgba(15,23,42,.12)", padding: 6, minWidth: 250, zIndex: 20 }}>
                {MODES.map(m => (
                  <button key={m} type="button" onClick={() => { setMode(m); setModeOpen(false); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: m === mode ? "#eff6ff" : "transparent", border: "none", borderRadius: 6, padding: "8px 10px", cursor: "pointer", font: `${m === mode ? 500 : 400} 13px/16px Roboto`, color: m === mode ? "#1d4ed8" : "#333", textAlign: "left" }}>
                    {m}{m === mode && <span style={{ color: "#1d4ed8", fontSize: 11 }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "row", gap: 9, marginTop: 16 }}>
            {stats.map(([l, v]) => <StatCard key={l} label={l} value={v} />)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "294px 294px", gap: 18, marginTop: 20 }}>
            <DashCard title="Eligibility Status Summary" style={{ height: 294 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 44 }}>
                <div style={{ flex: "0 1 260px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, font: "500 15px/20px Roboto", color: "#0f172a", paddingBottom: 8 }}>
                    <span>Total Coverage Status</span><span>{m.cov.total}</span>
                  </div>
                  <LegendRow color="#61AA6B" label="Active Coverage" value={m.cov.active} valueStyle={{ marginRight: 4 }} />
                  <LegendRow color="#F87D7C" label="Inactive Coverage" value={m.cov.inactive} valueStyle={{ marginRight: 4 }} />
                  <LegendRow color="#91DCF7" label="Mixed Coverage" value={p2(m.cov.mixed)} divider={false} valueStyle={{ marginRight: 4 }} />
                </div>
                <Donut size={196} thickness={32}
                  segments={[{ value: m.cov.active, color: "#61AA6B" }, { value: m.cov.inactive, color: "#F87D7C" }, { value: Math.max(m.cov.mixed,0.001), color: "#91DCF7" }]}
                  centerTop="Total Cov.Status" centerBottom={m.cov.total} />
              </div>
            </DashCard>

            <DashCard title="Eligibility Alert Summary" right={<SortByBtn />} style={{ height: 294 }}
              bodyClass="hide-sb" bodyStyle={{ justifyContent: "flex-start", overflowY: "auto", paddingTop: 4 }}>
              <div>
                {m.alerts.map(([l,v]) => <BarRow key={l} label={l} value={v} max={10} />)}
              </div>
            </DashCard>

            <DashCard title="Payor Type Distribution" info style={{ height: 294 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 44 }}>
                <Donut size={196} thickness={32}
                  segments={m.ptype.map(x => ({ value: x[1] || 0.001, color: x[2] }))}
                  centerTop={m.n} centerBottom="PATIENTS" centerTopSize={18} centerTopWeight={600} centerTopY="47%" centerBottomSize={10} centerBottomWeight={500} centerBottomY="61%" />
                <div style={{ flex: "0 1 260px", minWidth: 0 }}>
                  {m.ptype.map((x, i) => <LegendRow key={x[0]} color={x[2]} label={x[0]} value={x[1] + "%"} divider={i < m.ptype.length - 1} />)}
                </div>
              </div>
            </DashCard>

            <DashCard title="Payor Distribution" info style={{ height: 294 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 44 }}>
                <Donut size={196} thickness={32}
                  segments={m.payor.map(x => ({ value: x[1] || 0.001, color: x[2] }))}
                  centerTop={m.n} centerBottom="PATIENTS" centerTopSize={18} centerTopWeight={600} centerTopY="47%" centerBottomSize={10} centerBottomWeight={500} centerBottomY="61%" />
                <div style={{ flex: "0 1 260px", minWidth: 0 }}>
                  {m.payor.map((x, i) => <LegendRow key={x[0]} color={x[2]} label={x[0]} value={x[1] + "%"} divider={i < m.payor.length - 1} />)}
                </div>
              </div>
            </DashCard>
          </div>
          </div>
        </div>

        {/* ── right column: action items (pink band on top, white below) ── */}
        <div style={{ position: "relative", zIndex: 2, width: 560, flexShrink: 0, background: "#fff", boxShadow: "-10px 0 24px 0 #1C2D420C" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 51, background: "#FFF1F1" }} />
          <div style={{ position: "relative", padding: "16px 20px 28px 32px" }}>
          <div style={{ background: "#fff", border: "1px solid #F3E0E0", borderRadius: 9, boxShadow: "0 1px 3px rgba(86,86,86,.06)", display: "flex", alignItems: "center", padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <WarnGlyph />
              <span style={{ font: "500 19px/23px Roboto", color: "#3A424A" }}>Action Items</span>
            </div>
            <span style={{ marginLeft: "auto", font: "400 15px/20px Roboto", color: "#6A717D" }}><span style={{ color: "#CF1322" }}>{m.needsReview} Items</span> Needs Review</span>
          </div>

          <BigActionRow label="Eligibility - Pending Submission" count={p2(m.aiPending)} onClick={()=>onAlertNav&&onAlertNav({type:"status",status:"pending"})} />
          <BigActionRow label="Eligibility - Due For Follow Up" count={p2(m.aiFollow)} onClick={()=>onAlertNav&&onAlertNav({type:"followup"})} />

          <div style={{ display: "flex", alignItems: "center", marginTop: 20, marginBottom: 12 }}>
            <span style={{ font: "500 18px/22px Roboto", color: "#3A424A" }}>Eligibility Alert - Action Items</span>
            <span style={{ marginLeft: 10, background: "#FFE7E6", color: "#CF1322", borderRadius: 999, padding: "1px 9px", font: "500 13px Roboto" }}>{p2(m.alertTotal)}</span>
            <span style={{ marginLeft: "auto" }}><SortByBtn /></span>
          </div>
          <div className="ws-scrollbody" style={{ border: "1px solid #F1E4E4", borderRadius: 9, background: "#fff", overflow: "hidden auto", maxHeight: 392, boxShadow: "0 1px 3px rgba(86,86,86,.06)" }}>
            {m.alerts.map(([l,v],i) => <AlertRow key={l} label={l} count={p2(v)} alt={i%2===1} onClick={()=>onAlertNav&&onAlertNav({type:"alert",label:l})} />)}
          </div>

          <div style={{ display: "flex", alignItems: "center", marginTop: 28, marginBottom: 12 }}>
            <span style={{ font: "500 18px/22px Roboto", color: "#3A424A" }}>Automation Action Items</span>
            <span style={{ marginLeft: 10, background: "#FFE7E6", color: "#CF1322", borderRadius: 999, padding: "1px 9px", font: "500 13px Roboto" }}>{p2(m.autoTotal)}</span>
            <span style={{ marginLeft: "auto" }}><SortByBtn /></span>
          </div>
          <div style={{ border: "1px solid #F1E4E4", borderRadius: 9, background: "#fff", overflow: "hidden", boxShadow: "0 1px 3px rgba(86,86,86,.06)" }}>
            <AutomationGroup title="Terminated" sub="Business Exceptions" count={p2(m.autoTerminated)} defaultOpen onNav={()=>onAlertNav&&onAlertNav({type:"at",group:"terminated"})}>
              <CollapsibleReasons reasons={m.termReasons} initial={2} onReason={(r)=>onAlertNav&&onAlertNav({type:"atReason",reason:r})} />
            </AutomationGroup>
            <AutomationGroup title="Failed" sub="Technical Exception" count={p2(m.autoFailed)} defaultOpen onNav={()=>onAlertNav&&onAlertNav({type:"at",group:"failed"})}>
              {m.failedReasons.map(([r,c]) => <AutomationItem key={r} label={r} count={p2(c)} onClick={()=>onAlertNav&&onAlertNav({type:"atReason",reason:r})} />)}
            </AutomationGroup>
          </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

// ── Authorization dashboard (built from the attached frame; reuses the
// eligibility dashboard's cards, colors and chrome — only the chart types
// and data come from the frame) ─────────────────────────────
function ServiceTypeBtn({ value = "svc", onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const sel = AUTH_GROUP_DIMS.find(d => d.key === value) || AUTH_GROUP_DIMS[0];
  return (
    <span ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <span onClick={() => setOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 10, border: "1px solid #D8DEE7", borderRadius: 6, padding: "7px 12px", font: "400 13px/16px Roboto", color: "#3A424A", cursor: "pointer", background: "#fff", whiteSpace: "nowrap" }}>
        {sel.label} <span style={{ fontSize: 9, color: "#8A94A6" }}>▾</span>
      </span>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, minWidth: 168, background: "#fff", border: "1px solid #E7ECF2", borderRadius: 6, boxShadow: "0 4px 14px rgba(20,32,55,.14)", padding: 4, zIndex: 30 }}>
          {AUTH_GROUP_DIMS.map(d => {
            const active = d.key === value;
            return (
              <div key={d.key} onClick={() => { onChange && onChange(d.key); setOpen(false); }}
                style={{ padding: "8px 12px", borderRadius: 4, font: `${active ? 500 : 400} 13px/16px Roboto`, color: "#3A424A", background: active ? "#F1F5FA" : "transparent", cursor: "pointer", whiteSpace: "nowrap" }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#F6F8FB"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                {d.label}
              </div>
            );
          })}
        </div>
      )}
    </span>
  );
}

function ChartLegend({ series }) {
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", position: "relative", top: -8 }}>
      {series.map(s => (
        <span key={s.name} style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "400 11px/14px Roboto", color: "#6A717D" }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: s.color, display: "inline-block" }} />{s.name}
        </span>
      ))}
    </div>
  );
}

function StackedBarChart({ data, series, max, step, yLabel, barW = 46 }) {
  const plotH = 168;
  const ticks = []; for (let t = max; t >= 0; t -= step) ticks.push(+t.toFixed(2));
  return (
    <div style={{ display: "flex", flex: 1 }}>
      <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", font: "400 12px Roboto", color: "#8A94A6", display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 24, marginRight: 4 }}>{yLabel}</div>
      <div style={{ position: "relative", flex: 1 }}>
        <div style={{ position: "relative", height: plotH }}>
          {ticks.map(t => { const y = plotH - (t / max) * plotH; return (
            <React.Fragment key={t}>
              <div style={{ position: "absolute", left: 38, right: 4, top: y, borderTop: t === 0 ? "1px solid #B7C2D0" : "1px solid #EEF1F7" }} />
              <div style={{ position: "absolute", left: 0, top: y - 7, width: 30, textAlign: "right", font: "400 11px Roboto", color: "#8A94A6" }}>{t}</div>
            </React.Fragment>
          ); })}
          <div style={{ position: "absolute", left: 38, top: 0, bottom: 0, borderLeft: "1px solid #B7C2D0" }} />
          <div style={{ position: "absolute", left: 40, right: 4, bottom: 0, top: 0, display: "flex", justifyContent: "space-around", alignItems: "flex-end" }}>
            {data.map(d => {
              const tot = series.reduce((a, s) => a + (d.values[s.key] || 0), 0);
              return (
                <div key={d.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                  <div style={{ font: "500 13px Roboto", color: "#3A424A", marginBottom: 5 }}>{d.total != null ? d.total : tot}</div>
                  <div style={{ width: barW, height: `${(tot / max) * 100}%`, display: "flex", flexDirection: "column-reverse", borderRadius: "3px 3px 0 0", overflow: "hidden" }}>
                    {series.map(s => <div key={s.key} style={{ background: s.color, height: `${((d.values[s.key] || 0) / (tot || 1)) * 100}%` }} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ marginLeft: 40, marginRight: 4, display: "flex", justifyContent: "space-around", marginTop: 9 }}>
          {data.map(d => <span key={d.label} style={{ font: "400 12px/16px Roboto", color: "#6A717D" }}>{d.label}</span>)}
        </div>
      </div>
    </div>
  );
}

function PickerBtn({ options, value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const sel = options.find(o => o[0] === value) || options[0];
  return (
    <span ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <span onClick={() => setOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 10, border: "1px solid #D8DEE7", borderRadius: 6, padding: "7px 12px", font: "400 13px/16px Roboto", color: "#3A424A", cursor: "pointer", background: "#fff", whiteSpace: "nowrap" }}>
        {sel[1]} <span style={{ fontSize: 9, color: "#8A94A6" }}>▾</span>
      </span>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, minWidth: 148, background: "#fff", border: "1px solid #E7ECF2", borderRadius: 6, boxShadow: "0 4px 14px rgba(20,32,55,.14)", padding: 4, zIndex: 30 }}>
          {options.map(o => {
            const active = o[0] === value;
            return (
              <div key={o[0]} onClick={() => { onChange && onChange(o[0]); setOpen(false); }}
                style={{ padding: "8px 12px", borderRadius: 4, font: `${active ? 500 : 400} 13px/16px Roboto`, color: "#3A424A", background: active ? "#F1F5FA" : "transparent", cursor: "pointer", whiteSpace: "nowrap" }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#F6F8FB"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                {o[1]}
              </div>
            );
          })}
        </div>
      )}
    </span>
  );
}

// Small radio-pair control (By Day / By Week) used on trend charts.
function RadioPick({ options, value, onChange }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 18 }}>
      {options.map(o => {
        const on = o[0] === value;
        return (
          <span key={o[0]} onClick={() => onChange && onChange(o[0])} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", font: "400 12px/16px Roboto", color: "#3A424A" }}>
            <span style={{ width: 13, height: 13, borderRadius: "50%", border: `1px solid ${on ? "#E8730A" : "#B7C2D0"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
              {on && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#E8730A" }} />}
            </span>
            {o[1]}
          </span>
        );
      })}
    </span>
  );
}

// Trend line chart — x axis dates, y axis transaction counts.
function SimpleLineChart({ data, max, step, yLabel, xLabel, color = "#4C9FD1" }) {
  const plotH = 168;
  const ticks = []; for (let t = max; t >= 0; t = +(t - step).toFixed(2)) ticks.push(t);
  const n = data.length;
  const every = n > 14 ? Math.ceil(n / 10) : 1;
  const px = (i) => n <= 1 ? 50 : (i / (n - 1)) * 100;
  const py = (v) => plotH - (v / max) * plotH;
  const pts = data.map((d, i) => `${px(i)},${(py(d.value) / plotH) * 100}`).join(" ");
  return (
    <div style={{ display: "flex", flex: 1 }}>
      <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", font: "400 12px Roboto", color: "#8A94A6", display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 24, marginRight: 4 }}>{yLabel}</div>
      <div style={{ position: "relative", flex: 1 }}>
        <div style={{ position: "relative", height: plotH }}>
          {ticks.map(t => { const y = py(t); return (
            <React.Fragment key={t}>
              <div style={{ position: "absolute", left: 40, right: 4, top: y, borderTop: t === 0 ? "1px solid #B7C2D0" : "1px solid #EEF1F7" }} />
              <div style={{ position: "absolute", left: 0, top: y - 7, width: 34, textAlign: "right", font: "400 11px Roboto", color: "#8A94A6" }}>{t}</div>
            </React.Fragment>
          ); })}
          <div style={{ position: "absolute", left: 40, top: 0, bottom: 0, borderLeft: "1px solid #B7C2D0" }} />
          <div style={{ position: "absolute", left: 44, right: 10, top: 0, height: plotH }}>
            {n === 0
              ? <div style={{ font: "400 13px/18px Roboto", color: "#8A94A6", paddingTop: 60, textAlign: "center" }}>No transactions in this range.</div>
              : (
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                <polyline points={pts} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
              </svg>
            )}
            {data.map((d, i) => (
              <span key={"dot"+i} style={{ position: "absolute", left: px(i) + "%", top: (py(d.value) / plotH) * 100 + "%", width: 6, height: 6, marginLeft: -3, marginTop: -3, borderRadius: "50%", background: color }} />
            ))}
          </div>
        </div>
        <div style={{ position: "relative", marginLeft: 44, marginRight: 10, height: 18, marginTop: 8 }}>
          {data.map((d, i) => (i % every === 0 || i === n - 1) ? (
            <span key={d.label} style={{ position: "absolute", left: px(i) + "%", transform: "translateX(-50%)", font: "400 11px/16px Roboto", color: "#6A717D", whiteSpace: "nowrap" }}>{d.label}</span>
          ) : null)}
        </div>
        {xLabel && <div style={{ textAlign: "center", font: "400 12px Roboto", color: "#8A94A6", marginTop: 2 }}>{xLabel}</div>}
      </div>
    </div>
  );
}

const OASIS_FILE_SERIES = [
  { id: "skip", label: "Skipped Files",              color: "#F87D7C" },
  { id: "down", label: "Files Downloaded from HCHB", color: "#5FD3C0" },
  { id: "up",   label: "Files Uploaded to iQIES",    color: "#2E8FCF" },
  { id: "val",  label: "Downloaded Validation Files", color: "#F8C96A" },
];
function GroupedBarChart({ data, series, max, step, yLabel, barW = 7 }) {
  const plotH = 190;
  const ticks = []; for (let t = max; t >= 0; t = +(t - step).toFixed(2)) ticks.push(t);
  const [hover, setHover] = React.useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", font: "400 12px Roboto", color: "#8A94A6", display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 24, marginRight: 4 }}>{yLabel}</div>
        <div style={{ position: "relative", flex: 1 }}>
          <div style={{ position: "relative", height: plotH }}>
            {ticks.map(t => { const y = plotH - (t / max) * plotH; return (
              <React.Fragment key={t}>
                <div style={{ position: "absolute", left: 40, right: 4, top: y, borderTop: t === 0 ? "1px solid #B7C2D0" : "1px solid #EEF1F7" }} />
                <div style={{ position: "absolute", left: 0, top: y - 7, width: 34, textAlign: "right", font: "400 11px Roboto", color: "#8A94A6" }}>{Math.round(t)}</div>
              </React.Fragment>
            ); })}
            <div style={{ position: "absolute", left: 40, top: 0, bottom: 0, borderLeft: "1px solid #B7C2D0" }} />
            <div style={{ position: "absolute", left: 42, right: 4, bottom: 0, top: 0, display: "flex", justifyContent: "space-around", alignItems: "flex-end" }}>
              {data.map(d => (
                <div key={d.label} style={{ position: "relative", height: "100%", display: "flex", alignItems: "flex-end", gap: 2 }}
                  onMouseEnter={() => setHover(d.label)} onMouseLeave={() => setHover(null)}>
                  {series.map(s => <div key={s.id} title={`${s.label}: ${d.values[s.id] || 0}`} style={{ width: barW, height: `${Math.max(((d.values[s.id] || 0) / max) * 100, 0)}%`, minHeight: (d.values[s.id] || 0) > 0 ? 2 : 0, background: s.color, borderRadius: "2px 2px 0 0" }} />)}
                  {hover === d.label && (
                    <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: "#fff", border: "1px solid #E4E9F0", borderRadius: 6, boxShadow: "0 4px 12px rgba(15,23,42,0.12)", padding: "8px 10px", zIndex: 5, whiteSpace: "nowrap", display: "flex", flexDirection: "column", gap: 4, pointerEvents: "none" }}>
                      <span style={{ font: "500 12px/16px Roboto", color: "#0f172a" }}>{d.label}</span>
                      {series.map(s => <span key={s.id} style={{ display: "flex", alignItems: "center", gap: 6, font: "400 11px/14px Roboto", color: "#3A424A" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />{s.label}<b style={{ marginLeft: "auto", paddingLeft: 10 }}>{d.values[s.id] || 0}</b></span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginLeft: 42, marginRight: 4, display: "flex", justifyContent: "space-around", marginTop: 9 }}>
            {data.map(d => <span key={d.label} style={{ font: "400 12px/16px Roboto", color: "#6A717D" }}>{d.label}</span>)}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16, marginTop: 14 }}>
        {series.map(s => <span key={s.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "500 11px/14px Roboto", color: "#6A717D" }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />{s.label}</span>)}
      </div>
    </div>
  );
}

function SimpleBarChart({ data, max, step, yLabel, unit = "", color = "#4C9FD1", barW = 42 }) {
  const plotH = 168;
  const ticks = []; for (let t = max; t >= 0; t = +(t - step).toFixed(2)) ticks.push(t);
  const dec = step < 1 ? 1 : 0;
  return (
    <div style={{ display: "flex", flex: 1 }}>
      <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", font: "400 12px Roboto", color: "#8A94A6", display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 24, marginRight: 4 }}>{yLabel}</div>
      <div style={{ position: "relative", flex: 1 }}>
        <div style={{ position: "relative", height: plotH }}>
          {ticks.map(t => { const y = plotH - (t / max) * plotH; return (
            <React.Fragment key={t}>
              <div style={{ position: "absolute", left: 40, right: 4, top: y, borderTop: t === 0 ? "1px solid #B7C2D0" : "1px solid #EEF1F7" }} />
              <div style={{ position: "absolute", left: 0, top: y - 7, width: 34, textAlign: "right", font: "400 11px Roboto", color: "#8A94A6" }}>{t.toFixed(dec)}{unit}</div>
            </React.Fragment>
          ); })}
          <div style={{ position: "absolute", left: 40, top: 0, bottom: 0, borderLeft: "1px solid #B7C2D0" }} />
          <div style={{ position: "absolute", left: 42, right: 4, bottom: 0, top: 0, display: "flex", justifyContent: "space-around", alignItems: "flex-end" }}>
            {data.map(d => <div key={d.label} style={{ width: barW, height: `${Math.max((d.value / max) * 100, 0)}%`, background: color, borderRadius: "3px 3px 0 0" }} />)}
          </div>
        </div>
        <div style={{ marginLeft: 42, marginRight: 4, display: "flex", justifyContent: "space-around", marginTop: 9 }}>
          {data.map(d => <span key={d.label} style={{ font: "400 12px/16px Roboto", color: "#6A717D" }}>{d.label}</span>)}
        </div>
      </div>
    </div>
  );
}

// ── Stage-wise summary — 100% stacked bar per PCR automation stage ──
// Every record sits at a current stage (from the automation log); stages before it
// are finished, the current stage carries the record's live AT status, later stages
// have not been reached yet.
const PCR_STAGE_LABELS = [
  ["PCR data", "extraction from", "HCHB"],
  ["PCR Submission", "into Palmetto"],
  ["Extract and", "update DCN"],
  ["Extract and", "update UTN"],
  ["Download DL", "from Palmetto"],
  ["Upload DL, update", "UTN into HCHB"],
];
// Palette from the project's existing charts (coverage donut / payor-type bars).
const PCR_STAGE_STATES = [
  { id: "progress", label: "In Progress",         color: "#4C9FD1" },
  { id: "int",      label: "Needs Intervention",  color: "#F8C87C", ink: "#3A424A" },
  { id: "manual",   label: "Manually Terminated", color: "#A18B6D" },
  { id: "term",     label: "Terminated",          color: "#156082" },
  { id: "failed",   label: "Failed",              color: "#F87D7C" },
  { id: "done",     label: "Stage Completed",     color: "#61AA6B" },
];
function StageWiseStackedChart({ stages }) {
  const plotH = 300;
  const ticks = [100, 80, 60, 40, 20, 0];
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: "6px 18px", marginBottom: 14 }}>
        {PCR_STAGE_STATES.map(s => (
          <span key={s.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "400 12px/16px Roboto", color: "#3A424A" }}>
            <span style={{ width: 9, height: 9, background: s.color, borderRadius: 2 }}></span>{s.label}
          </span>
        ))}
      </div>
      <div style={{ position: "relative", height: plotH }}>
        {ticks.map(t => { const y = plotH - (t / 100) * plotH; return (
          <React.Fragment key={t}>
            <div style={{ position: "absolute", left: 44, right: 6, top: y, borderTop: t === 0 ? "1px solid #B7C2D0" : "1px dashed #D8DEE7" }}></div>
            <div style={{ position: "absolute", left: 0, top: y - 7, width: 36, textAlign: "right", font: "400 11px Roboto", color: "#8A94A6" }}>{t}%</div>
          </React.Fragment>
        ); })}
        <div style={{ position: "absolute", left: 44, top: 0, bottom: 0, borderLeft: "1px solid #B7C2D0" }}></div>
        <div style={{ position: "absolute", left: 46, right: 6, top: 0, bottom: 0, display: "flex", justifyContent: "space-around", alignItems: "flex-end" }}>
          {stages.map(st => (
            <div key={st.label} title={st.total + " records at this stage"} style={{ width: 76, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              {st.total === 0 ? null : PCR_STAGE_STATES.map(s => {
                const pct = st.pct[s.id] || 0;
                if (!pct) return null;
                return (
                  <div key={s.id} title={s.label + " — " + pct + "%"} style={{ height: pct + "%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {pct >= 9 && <span style={{ font: "500 12px/14px Roboto", color: s.ink || "#fff" }}>{pct}%</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginLeft: 46, marginRight: 6, display: "flex", justifyContent: "space-around", marginTop: 10 }}>
        {stages.map(st => (
          <span key={st.label} style={{ width: 96, textAlign: "center", font: "400 12px/15px Roboto", color: "#6A717D" }}>
            {st.lines.map((l, i) => <span key={i} style={{ display: "block" }}>{l}</span>)}
          </span>
        ))}
      </div>
    </div>
  );
}

function AuthSectionTitle({ children }) {
  return <div style={{ font: "500 16px/20px Roboto", color: "#2563eb", marginTop: 14 }}>{children}</div>;
}

function PayorAuthItem({ label, sub, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #EEF1F7" }}>
      <span style={{ flex: 1, font: "400 14px/18px Roboto", color: "#3A424A" }}>{label}{sub && <span style={{ color: "#8A94A6", fontSize: 12 }}> {sub}</span>}</span>
      <span style={{ font: "400 14px Roboto", color: "#1677FF", borderBottom: "1px solid #1677FF", lineHeight: "17px", cursor: "pointer" }}>{count}</span>
    </div>
  );
}

// Payor Auth card — mirrors the Figma frame: a bordered white card with a
// two-line bold header, a divider beneath it, then rows that each flex to
// fill so two side-by-side cards align to the same height regardless of how
// many items each holds (padding per row auto-adjusts).
function PayorAuthCard({ headerLines, items }) {
  return (
    <div style={{ border: "1px solid rgb(232,233,234)", borderRadius: 9, background: "#fff", boxShadow: "0 1px 3px rgba(86,86,86,.06)", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ font: "500 14px/18.711px Roboto", color: "rgb(58,66,74)", padding: "13px 16px 12px", borderBottom: "1px solid rgb(217,217,217)" }}>
        {headerLines[0]}<br />{headerLines[1]}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 16px" }}>
        {items.map((it, i) => (
          <div key={it.label} style={{ position: "relative", flex: 1, minHeight: 44, display: "flex", alignItems: "center", borderBottom: i < items.length - 1 ? "1px solid rgba(232,232,232,0.65)" : "none" }}>
            {it.alert && <span style={{ position: "absolute", left: -16, right: -16, top: 0, bottom: 0, background: "rgba(255,240,240,0.75)" }} />}
            <span style={{ position: "relative", flex: 1, font: "400 15px/20px Roboto", color: "rgba(0,0,0,0.65)" }}>
              {it.label}{it.sub && <span style={{ color: "rgb(138,148,166)", fontSize: 12 }}> {it.sub}</span>}
            </span>
            <span style={{ position: "relative", font: "400 15px/20px Roboto", color: "rgb(22,119,255)", borderBottom: "1px solid rgb(22,119,255)", cursor: "pointer" }}>{it.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Action Items panel data, derived live from the Authorization tab: auth-
// response counts from window.arvRows (auth status), recert / expiring counts
// from window.pasRows, and the automation Needs-Attention breakdown from the
// AT "warning" rows (same split logic as the Auth Request View menu).
function computeAuthActionItems() {
  const rows = (typeof window !== "undefined" && window.arvRows) || [];
  const pas = (typeof window !== "undefined" && window.pasRows) || [];
  const byStatus = {};
  rows.forEach(r => { byStatus[r.status] = (byStatus[r.status] || 0) + 1; });
  const payor = {
    denied: byStatus.denied || 0,
    partial: byStatus.partial || 0,
    pending: byStatus.pending || 0,
    pendingSub: byStatus.pending_submission || 0,
  };
  const recert = {
    expiring: pas.filter(r => r.expiring).length,
    expired: pas.filter(r => r.expired).length,
    due: pas.filter(r => r.recert === "due").length,
    pastDue: pas.filter(r => r.recert === "past_due").length,
  };
  const na = rows.filter(r => r.at === "warning").length;
  // Automation Needs-Attention reasons — tallied live from the warning rows
  // actually present (window.computeAuthNA, defined alongside the Auth Request
  // rows), so the dashboard's automation alerts show the exact same reasons +
  // counts as the Auth Req View dropdown and reflect the real data / row count.
  const naBreak = (typeof window !== "undefined" && window.computeAuthNA)
    ? window.computeAuthNA(rows)
    : { termReasons: [], failReasons: [] };
  const termReasons = naBreak.termReasons;
  const failReasons = naBreak.failReasons;
  const sumOf = (list) => list.reduce((s, x) => s + x[1], 0);
  const terminatedTotal = sumOf(termReasons);
  const failedTotal = sumOf(failReasons);
  const payorTotal = payor.denied + payor.partial + payor.pending + payor.pendingSub;
  const recertTotal = recert.expiring + recert.expired + recert.due + recert.pastDue;
  const followUp = rows.filter(r => { const extra=(window.__authFollowUp||{})[r.key]; return (extra&&extra!=="-"&&extra!=="") || (r.followUp&&r.followUp!=="-"&&r.followUp!==""); }).length;
  const needsReview = payorTotal + na + recertTotal + followUp;
  return { payor, recert, na, terminatedTotal, failedTotal, termReasons, failReasons, needsReview, followUp };
}

function AuthActionRail({ onAuthNav }) {
  const a = React.useMemo(() => computeAuthActionItems(), []);
  return (
    <div style={{ position: "relative", zIndex: 2, width: 560, flexShrink: 0, background: "#fff", boxShadow: "-10px 0 24px 0 #1C2D420C" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 51, background: "#FFF1F1" }} />
      <div style={{ position: "relative", padding: "16px 20px 28px 32px" }}>
        <div style={{ background: "#fff", border: "1px solid #F3E0E0", borderRadius: 9, boxShadow: "0 1px 3px rgba(86,86,86,.06)", display: "flex", alignItems: "center", padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <WarnGlyph />
            <span style={{ font: "500 19px/23px Roboto", color: "#3A424A" }}>Action Items</span>
          </div>
          <span style={{ marginLeft: "auto", font: "400 15px/20px Roboto", color: "#6A717D" }}><span style={{ color: "#CF1322" }}>{p2(a.needsReview)} Items</span> Needs Review</span>
        </div>

        <BigActionRow label="Auths - Due For Follow Up" count={p2(a.followUp)} onClick={()=>onAuthNav&&onAuthNav({type:"followup"})} />

        <div style={{ font: "500 18px/22px Roboto", color: "rgb(58,66,74)", marginTop: 22, marginBottom: 14 }}>Payor Auth Request &amp; Response Action Items</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "stretch" }}>
          <PayorAuthCard
            headerLines={["Payor Auth Response that", "Needs Attention"]}
            items={[
              { label: "Denied Auth Request", count: p2(a.payor.denied), alert: true },
              { label: "Partially Approved", count: p2(a.payor.partial) },
              { label: "Pending Auths", sub: "Past 10 Days", count: p2(a.payor.pending), alert: true },
              { label: "Pending Submission", count: p2(a.payor.pendingSub) },
            ]}
          />
          <PayorAuthCard
            headerLines={["Expiring Auth /", "Upcoming Recerts"]}
            items={[
              { label: "Expiring Auth Approvals", count: p2(a.recert.expiring) },
              { label: "Expired Auth Approvals", count: p2(a.recert.expired) },
              { label: "Patients Due For Recert", count: p2(a.recert.due) },
              { label: "Patients Past Due For Recert", count: p2(a.recert.pastDue), alert: true },
            ]}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", marginTop: 26, marginBottom: 12 }}>
          <span style={{ font: "500 18px/22px Roboto", color: "#3A424A" }}>Automation Action Items</span>
          <span style={{ marginLeft: "auto" }}><SortByBtn /></span>
        </div>
        <div style={{ border: "1px solid #E7ECF2", borderRadius: 9, background: "#fff", overflow: "hidden", boxShadow: "0 1px 3px rgba(86,86,86,.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px", borderBottom: "1px solid #EEF1F7" }}>
            <span style={{ font: "500 15px/20px Roboto", color: "#3A424A" }}>Needs Attention</span>
            <NeedsAttentionInfo terminated={a.terminatedTotal} failed={a.failedTotal} />
            <span onClick={()=>onAuthNav && onAuthNav([...a.termReasons, ...a.failReasons].map(x=>x[0]))} style={{ marginLeft: "auto", background: "#FFE7E6", color: "#CF1322", borderRadius: 999, padding: "1px 9px", font: "500 13px Roboto", cursor:"pointer" }}>{p2(a.terminatedTotal + a.failedTotal)}</span>
          </div>
          <AutomationGroup title="Terminated" sub="Business Exception" count={`${a.terminatedTotal} / ${a.terminatedTotal}`} linkCount defaultOpen onNav={()=>onAuthNav && onAuthNav(a.termReasons.map(x=>x[0]))}>
            <CollapsibleReasons reasons={a.termReasons} initial={3} onReason={(r)=>onAuthNav && onAuthNav([r])} />
          </AutomationGroup>
          <AutomationGroup title="Failed" sub="Technical Exception" count={`${a.failedTotal} / ${a.failedTotal}`} linkCount defaultOpen onNav={()=>onAuthNav && onAuthNav(a.failReasons.map(x=>x[0]))}>
            <CollapsibleReasons reasons={a.failReasons} initial={3} onReason={(r)=>onAuthNav && onAuthNav([r])} />
          </AutomationGroup>
        </div>
      </div>
    </div>
  );
}

const AUTH_VISIT_SERIES = [
  { key: "auto", color: "#156082", name: "Automated" },
  { key: "non", color: "#618EAA", name: "Non-Automated" },
];
const AUTH_STATUS_SERIES = [
  { key: "req", color: "#156082", name: "Requested" },
  { key: "app", color: "#61AA6B", name: "Approved" },
  { key: "den", color: "#F87D7C", name: "Denied" },
  { key: "pend", color: "#91DCF7", name: "Pending" },
];

// ── Authorization metrics, derived live from the Auth Request View rows
// (window.arvRows) so every KPI + chart reflects the actual table rather
// than static numbers. Each row is assigned a service line so the
// by-category charts roll up from the same source. ────────────
const AUTH_SVC_BY_ROW = { r1: "SN", r2: "PT", r3: "OT", r4: "HHA", r5: "MSW", r6: "SN", r7: "PT", r8: "OT", r9: "HHA", r10: "MSW", r11: "SN", r12: "PT", r13: "OT", r14: "HHA", r15: "MSW", r16: "SN" };
const AUTH_CATS = ["HHA", "MSW", "OT", "PT", "SN"];
// Grouping dimensions offered by the chart dropdown. `field` returns the
// bucket a row falls into, or null when that row can't be classified.
// `diag` has no source data → charts fall back and only the dropdown value shows.
const AUTH_GROUP_DIMS = [
  { key: "svc", label: "Service Type", field: (r) => AUTH_SVC_BY_ROW[r.key] || null },
  { key: "diag", label: "Primary Diagnosis", field: () => null },
  { key: "payor", label: "Payor Type", field: (r) => r.ptype && r.ptype !== "-" ? r.ptype : null },
  { key: "gw", label: "Gateway", field: (r) => r.gw && r.gw !== "-" ? r.gw : null },
];
const authNum = (v) => { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; };
const authPad2 = (n) => String(n).padStart(2, "0");
function authParseMDY(s) { if (!s || s === "-") return null; const p = s.split("/"); if (p.length !== 3) return null; const m = +p[0], d = +p[1]; let y = +p[2]; if (y < 100) y += 2000; if (!m || !d || !y || d > 31 || m > 12) return null; return new Date(y, m - 1, d); }
function authNiceStep(range, divs) { if (range <= 0) return 1; const rough = range / divs, mag = Math.pow(10, Math.floor(Math.log10(rough))), norm = rough / mag; let s; if (norm <= 1) s = 1; else if (norm <= 2) s = 2; else if (norm <= 2.5) s = 2.5; else if (norm <= 5) s = 5; else s = 10; return s * mag; }
function authNiceScale(v) { if (v <= 0) return { max: 10, step: 2 }; const step = authNiceStep(v, 5); return { max: Math.ceil(v / step) * step || step, step }; }

// Roll the Auth Request rows up by an arbitrary grouping dimension. Returns
// the three by-category chart datasets + scales, or hasData:false when the
// selected dimension has no source values (e.g. Primary Diagnosis).
function authCatMetrics(rows, dimKey) {
  const dim = AUTH_GROUP_DIMS.find(d => d.key === dimKey) || AUTH_GROUP_DIMS[0];
  const cat = {}, order = [];
  rows.forEach(r => {
    const c = dim.field(r); if (!c) return;
    if (!cat[c]) { cat[c] = { req: 0, app: 0, den: 0, pend: 0, days: [] }; order.push(c); }
    cat[c].req += authNum(r.sum.r); cat[c].app += authNum(r.sum.a); cat[c].den += authNum(r.sum.d); cat[c].pend += authNum(r.sum.p);
    const sub = authParseMDY(r.sub), resp = authParseMDY(r.pyrResp);
    if (sub && resp) cat[c].days.push(Math.abs((resp - sub) / 86400000));
  });
  order.sort();
  const emptyScale = { max: 10, step: 2 };
  if (!order.length) return { hasData: false, statusData: [], statusScale: emptyScale, approvalData: [], approvalScale: emptyScale, cycleData: [], cycleScale: emptyScale };
  const statusData = order.map(c => ({ label: c, values: { req: cat[c].req, app: cat[c].app, den: cat[c].den, pend: cat[c].pend } }));
  const statusScale = authNiceScale(Math.max(1, ...statusData.map(d => d.values.req + d.values.app + d.values.den + d.values.pend)));
  const approvalData = order.map(c => ({ label: c, value: cat[c].req ? Math.round(cat[c].app / cat[c].req * 100) : 0 }));
  const approvalScale = authNiceScale(Math.max(1, ...approvalData.map(d => d.value)));
  const cycleData = order.map(c => ({ label: c, value: cat[c].days.length ? +(cat[c].days.reduce((a, b) => a + b, 0) / cat[c].days.length).toFixed(1) : 0 }));
  const cycleScale = authNiceScale(Math.max(1, ...cycleData.map(d => d.value)));
  return { hasData: true, statusData, statusScale, approvalData, approvalScale, cycleData, cycleScale };
}

function computeAuthMetrics(rows) {
  rows = rows || ((typeof window !== "undefined" && window.arvRows) || []);
  const byStatus = {};
  rows.forEach(r => { byStatus[r.status] = (byStatus[r.status] || 0) + 1; });
  const kpi = [
    ["Authorizations", authPad2(rows.length)],
    ["Pending Submission", authPad2(byStatus.pending_submission || 0)],
    ["Approved", authPad2(byStatus.approved || 0)],
    ["Partially Approved", authPad2(byStatus.partial || 0)],
    ["Denied", authPad2(byStatus.denied || 0)],
    ["Pending", authPad2(byStatus.pending || 0)],
    ["Exceptions", authPad2(byStatus.exception || 0)],
  ];
  // Visit summary: Requested / Approved / Denied / Pending, split Automated vs Non-Automated.
  const vs = { r: { auto: 0, non: 0 }, a: { auto: 0, non: 0 }, d: { auto: 0, non: 0 }, p: { auto: 0, non: 0 } };
  rows.forEach(r => { const b = r.mode === "gear" ? "auto" : "non"; ["r", "a", "d", "p"].forEach(k => { vs[k][b] += authNum(r.sum[k]); }); });
  const visitData = [
    { label: "Requested", values: { auto: vs.r.auto, non: vs.r.non } },
    { label: "Approved", values: { auto: vs.a.auto, non: vs.a.non } },
    { label: "Denied", values: { auto: vs.d.auto, non: vs.d.non } },
    { label: "Pending", values: { auto: vs.p.auto, non: vs.p.non } },
  ];
  const visitScale = authNiceScale(Math.max(1, ...visitData.map(d => d.values.auto + d.values.non)));
  return { rows, kpi, visitData, visitScale };
}

function AuthDashboard({ onAuthNav, authFilters }) {
  const [_authInitDate, _setAuthInitDate] = useDash(() => window.defaultDateRange([...new Set((window.arvRows||[]).map(r => r.init))], 30));
  const initDate = (authFilters && authFilters.initDate !== undefined) ? authFilters.initDate : _authInitDate;
  const setInitDate = (authFilters && authFilters.setInitDate) || _setAuthInitDate;
  const [_authFF, _setAuthFF] = useDash([]);
  const fieldFilters = (authFilters && authFilters.fieldFilters !== undefined) ? authFilters.fieldFilters : _authFF;
  const setFieldFilters = (authFilters && authFilters.setFieldFilters) || _setAuthFF;
  const [authMode, setAuthMode] = useDash("All Auth Requests");
  const [authModeOpen, setAuthModeOpen] = useDash(false);
  const authModeRef = React.useRef(null);
  React.useEffect(() => {
    if (!authModeOpen) return;
    const h = (e) => { if (authModeRef.current && !authModeRef.current.contains(e.target)) setAuthModeOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [authModeOpen]);
  const AUTH_MODES = ["All Auth Requests", "All Non-Automated Requests", "All Automated Requests"];
  const filteredAuthRows = React.useMemo(() => {
    let rows = window.arvRows || [];
    if (fieldFilters.length) rows = rows.filter(r => fieldFilters.every(f => f.values.includes(r[f.field])));
    if (initDate) rows = rows.filter(r => window.dateInRange(r.init, initDate));
    if (authMode === "All Non-Automated Requests") rows = rows.filter(r => r.mode !== "gear");
    if (authMode === "All Automated Requests")     rows = rows.filter(r => r.mode === "gear");
    return rows;
  }, [fieldFilters, initDate, authMode]);
  const m = React.useMemo(() => computeAuthMetrics(filteredAuthRows), [filteredAuthRows]);
  const [statusDim, setStatusDim] = React.useState("svc");
  const [apprDim, setApprDim] = React.useState("svc");
  const [cycleDim, setCycleDim] = React.useState("svc");
  const svcCat = React.useMemo(() => authCatMetrics(m.rows, "svc"), [m.rows]);
  const statusCat = React.useMemo(() => authCatMetrics(m.rows, statusDim), [m.rows, statusDim]);
  const apprCat = React.useMemo(() => authCatMetrics(m.rows, apprDim), [m.rows, apprDim]);
  const cycleCat = React.useMemo(() => authCatMetrics(m.rows, cycleDim), [m.rows, cycleDim]);
  const statusC = statusCat.hasData ? statusCat : svcCat;
  const apprC = apprCat.hasData ? apprCat : svcCat;
  const cycleC = cycleCat.hasData ? cycleCat : svcCat;
  const chartBody = { justifyContent: "flex-start", paddingTop: 4 };
  return (
    <div style={{ display: "flex", alignItems: "stretch" }}>
      <div style={{ flex: "1 1 0", minWidth: 0 }}>
        <ARVFilterBarChips
          hideSearch={true}
          datePicker={{ label: "Auth Initiated Date", value: initDate, available: [...new Set((window.arvRows||[]).map(r => r.init))], onChange: setInitDate }}
          filterFields={AUTH_DASH_FILTER_FIELDS}
          filterRows={window.arvRows||[]}
          fieldFilters={fieldFilters}
          onFieldFilters={setFieldFilters}
        />
        <div style={{ padding: "16px 32px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, font: "500 18px/22px Roboto", color: "#0f172a" }}>
            Auth Request Status Summary -
            <div style={{ position: "relative", display: "inline-flex" }} ref={authModeRef}>
              <button type="button" onClick={() => setAuthModeOpen(v => !v)} style={{ background: "transparent", border: "none", cursor: "pointer", font: "500 18px/22px Roboto", color: "#2563eb", display: "inline-flex", alignItems: "center", gap: 4, padding: 0 }}>
                {authMode}<span style={{ fontSize: 14 }}>▾</span>
              </button>
              {authModeOpen && (
                <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 6, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 8px 24px rgba(15,23,42,.12)", padding: "6px 0", zIndex: 200, minWidth: 260 }}>
                  {AUTH_MODES.map(am => (
                    <button key={am} type="button" onClick={() => { setAuthMode(am); setAuthModeOpen(false); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "transparent", border: "none", cursor: "pointer", padding: "9px 18px", font: "400 14px/18px Roboto", color: am === authMode ? "#1d4ed8" : "#0f172a" }}>
                      {am}{am === authMode && <span style={{ color: "#1d4ed8", fontSize: 11 }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "row", gap: 9, marginTop: 16 }}>
            {m.kpi.map(([l, v]) => <StatCard key={l} label={l} value={v} />)}
          </div>

          <AuthSectionTitle>Auth - Service Line Summary - Visit Level Trends</AuthSectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 16 }}>
            <DashCard title="Auth Line Item Visit Summary" legend={<ChartLegend series={AUTH_VISIT_SERIES} />} style={{ height: 300 }} bodyStyle={chartBody}>
              <StackedBarChart data={m.visitData} series={AUTH_VISIT_SERIES} max={m.visitScale.max} step={m.visitScale.step} yLabel="Visits" barW={54} />
            </DashCard>
            <DashCard title="Auth Line Item Visit Status - By Category" right={<ServiceTypeBtn value={statusDim} onChange={setStatusDim} />} legend={<ChartLegend series={AUTH_STATUS_SERIES} />} style={{ height: 300 }} bodyStyle={chartBody}>
              <StackedBarChart data={statusC.statusData} series={AUTH_STATUS_SERIES} max={statusC.statusScale.max} step={statusC.statusScale.step} yLabel="Visits" barW={30} />
            </DashCard>
          </div>

          <AuthSectionTitle>Auth Approval Stats</AuthSectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 16 }}>
            <DashCard title="Avg. Visit Req Vs Approval - By Category" right={<ServiceTypeBtn value={apprDim} onChange={setApprDim} />} style={{ height: 300 }} bodyStyle={chartBody}>
              <SimpleBarChart data={apprC.approvalData} max={apprC.approvalScale.max} step={apprC.approvalScale.step} unit="%" yLabel="Average Approval %" />
            </DashCard>
            <DashCard title="Avg. Approval Cycle Time - By Category" right={<ServiceTypeBtn value={cycleDim} onChange={setCycleDim} />} style={{ height: 300 }} bodyStyle={chartBody}>
              <SimpleBarChart data={cycleC.cycleData} max={cycleC.cycleScale.max} step={cycleC.cycleScale.step} yLabel="Days" />
            </DashCard>
          </div>
        </div>
      </div>
      <AuthActionRail onAuthNav={onAuthNav} />
    </div>
  );
}

// ── PCR (Initial) dashboard ─────────────────────────
// Same chrome, cards, donuts and bar rows as the Eligibility dashboard;
// data comes from the real PCR grid (window.RCD_ROWS).
const PCR_DASH_FILTER_FIELDS = [
  { key: "branch",         label: "Branch" },
  { key: "submissionType", label: "Submission Type" },
  { key: "ptan",           label: "PTAN" },
  { key: "auditorName",    label: "Clinical Auditor Name" },
];
const PCR_DECISIONS = [
  ["Submitted", "#94A3B8"],
  ["DCN received", "#8B93F0"],
  ["UTN received", "#4FC3B1"],
  ["Partially-Affirmed", "#91DCF7"],
  ["Affirmed", "#61AA6B"],
  ["Non-Affirmed", "#F87D7C"],
  ["Exception", "#F8C87C"],
];
const PCR_SUBMISSION_COLOR = { "Initial": "#156082", "Re-Submitted": "#A18B6D" };

function PCRDashboard({ onNav }) {
  const [aiTab, setAiTab] = useDash("attention");
  const [pcrMode, setPcrMode] = useDash("txn");
  const [trendGrain, setTrendGrain] = useDash("day");
  const [modeOpen, setModeOpen] = useDash(false);
  const modeRef = React.useRef(null);
  React.useEffect(()=>{ if(!modeOpen) return; const h=(e)=>{ if(modeRef.current && !modeRef.current.contains(e.target)) setModeOpen(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[modeOpen]);
  const PCR_MODES = [["txn","Transaction details"],["prod","Productivity details"]];
  const all = window.RCD_ROWS || [];
  const dates = [...new Set(all.map(r => r.episodeStartDate))];
  const [dateRange, setDateRange] = useDash(() => window.defaultDateRange(dates, 60));
  const [fieldFilters, setFieldFilters] = useDash([]);
  const rows = React.useMemo(() => {
    let f = all;
    if (fieldFilters.length) f = f.filter(r => fieldFilters.every(x => x.values.includes(r[x.field])));
    if (dateRange) f = f.filter(r => window.dateInRange(r.episodeStartDate, dateRange));
    return f;
  }, [all, fieldFilters, dateRange]);

  const n = rows.length;
  const byDecision = PCR_DECISIONS.map(([label, color]) => [label, rows.filter(r => r.status === label).length, color]);
  const decisionTotal = byDecision.reduce((s, x) => s + x[1], 0);
  const needsAttn = rows.filter(r => r.at === "warning");
  const needsInt = rows.filter(r => r.at === "intervention");
  const inProgress = rows.filter(r => r.at === "hourglass");
  const completed = rows.filter(r => r.at === "thumb");
  const manual = needsAttn.filter(r => r.naGroup === "manual");
  // Action items only carry alerts that are still unreviewed — a record marked
  // Reviewed in the PCR view drops out of these counts.
  const reviewedMap = (typeof window !== "undefined" && window.__rcdReviewed) || {};
  const openRows = rows.filter(r => !reviewedMap[r.id]);
  const naOpen = openRows.filter(r => r.at === "warning");
  const manualOpen = naOpen.filter(r => r.naGroup === "manual");
  const failOpen = naOpen.filter(r => r.naGroup === "failed");
  const nonAffOpen = openRows.filter(r => r.status === "Non-Affirmed");
  const partialOpen = openRows.filter(r => r.status === "Partially-Affirmed");
  const naOpenReasonsFor = (grp) => {
    const m = {};
    naOpen.filter(r => r.naGroup === grp).forEach(r => { if (r.naReason) m[r.naReason] = (m[r.naReason] || 0) + 1; });
    return Object.keys(m).map(k => [k, m[k]]).sort((a, b) => b[1] - a[1]);
  };
  const naReasonsFor = (grp) => {
    const m = {};
    needsAttn.filter(r => r.naGroup === grp).forEach(r => { if (r.naReason) m[r.naReason] = (m[r.naReason] || 0) + 1; });
    return Object.keys(m).map(k => [k, m[k]]).sort((a, b) => b[1] - a[1]);
  };
  // Needs Attention action items — every group / reason is tallied from the
  // live unreviewed PCR records and carries the exact record ids behind the
  // badge, so the PCR grid lands on those same records.
  const idsOf = (rs) => rs.map(r => r.id);
  const naGroups = [
    ["terminated", "Terminated", "Business Exception"],
    ["failed", "Failed", "Technical/Business Exception"],
  ].map(([g, title, sub]) => {
    const gRows = naOpen.filter(r => r.naGroup === g);
    const reasons = naOpenReasonsFor(g).map(([reason, c]) => ({ reason, count: c, ids: idsOf(gRows.filter(r => r.naReason === reason)) }));
    return { g, title, sub, rows: gRows, reasons };
  }).filter(x => x.rows.length);
  const naTotal = naGroups.reduce((s, x) => s + x.rows.length, 0);
  const intRows = rows.filter(r => r.at === "intervention" && !r.intDone);
  // Per-reason tallies count records, not items — one record can raise several
  // items under the same reason, and the PCR grid filters by record.
  const intOpen = intRows.filter(r => !reviewedMap[r.id]);
  const intAlerts = (() => {
    const fn = window.rcdInterventions; if (!fn) return [];
    const m = {};
    intOpen.forEach(r => [...new Set(fn(r).filter(it => it.status !== "Completed").map(it => it.reason))].forEach(rs => { m[rs] = (m[rs] || 0) + 1; }));
    return Object.keys(m).map(k => [k, m[k]]).sort((a, b) => b[1] - a[1]);
  })();
  // Live per-reason record counts, so each badge matches the rows the PCR grid shows.
  const intLive = (() => {
    const fn = window.rcdInterventions; if (!fn) return [];
    const m = {};
    intRows.forEach(r => [...new Set(fn(r).filter(it => it.status !== "Completed").map(it => it.reason))].forEach(rs => { (m[rs] = m[rs] || []).push(r.id); }));
    return Object.keys(m).map(k => [k, m[k].length]).sort((a, b) => b[1] - a[1]).map(x => (x.ids = m[x[0]], x));
  })();
  const intIdsFor = (reason) => { const x = intLive.find(p => p[0] === reason); return x ? x.ids : undefined; };
  // Ineligible records sit in their own bucket, apart from pending interventions.
  const inelKeys = (() => { const fn = window.rcdInterventions; const s = new Set(); if (fn) intRows.forEach(r => fn(r).forEach(it => { if (it.key === "ELIGIBILITY_CHECK" && it.status !== "Completed") s.add(it.reason); })); return s; })();
  const PCR_INT_ALL = intLive.length ? intLive : [
    "HCPCS codes are missing",
    "Q1 is not available, Q2 is not available, Q3 is not available, Q4 is not available, Q6 is not available, Q7 is not available, All Q8 Q9 Q10 must not be answered 'No' at the same time",
    "PTAN is not available for selection in Palmetto",
    "No unique record found for the given filter",
  ].map(r => [r, 1]);
  const PCR_INT_REASONS = PCR_INT_ALL.filter(x => !inelKeys.has(x[0]));
  const PCR_INEL_REASONS = PCR_INT_ALL.filter(x => inelKeys.has(x[0]));
  const sumOf = (l) => l.reduce((s, x) => s + (x[1] || 0), 0);
  const idsOfReasons = (l) => [].concat(...l.map(x => intIdsFor(x[0]) || []));
  // One pending intervention per record, so the reason counts add up to the record total.
  const intPending = sumOf(PCR_INT_REASONS), intInel = sumOf(PCR_INEL_REASONS);
  const intTotal = intPending + intInel;
  const termRows = needsAttn.filter(r => r.naGroup === "terminated");
  const failRows = needsAttn.filter(r => r.naGroup === "failed");
  const naRows = (() => {
    const m = {};
    needsAttn.forEach(r => { if (r.naReason) m[r.naReason] = (m[r.naReason] || 0) + 1; });
    return Object.keys(m).map(k => [k, m[k]]).sort((a, b) => b[1] - a[1]);
  })();
  const subTypes = Object.keys(PCR_SUBMISSION_COLOR).map(k => {
    const c = rows.filter(r => r.submissionType === k).length;
    return [k, n ? Math.round(c / n * 100) : 0, PCR_SUBMISSION_COLOR[k]];
  }).sort((a, b) => b[1] - a[1]);
  const bpMax = 4;
  const bpData = ["1", "2", "3", "4"].map(bp => ({ label: "BP " + bp, value: rows.filter(r => r.benefitPeriodNo === bp).length }));
  const bpTop = Math.max(4, Math.ceil(Math.max(...bpData.map(d => d.value), 1) / 2) * 2);

  // Stage-wise summary — the six PCR automation stages from the automation log,
  // counted over the selected period.
  // Each record's current stage comes from the automation log ordering (same id
  // modulo as the log), and its live AT status decides that stage's segment.
  const stageData = (() => {
    const tally = PCR_STAGE_LABELS.map(() => ({ progress:0, int:0, manual:0, term:0, failed:0, done:0 }));
    const liveState = (r) => r.at === "thumb" ? "done"
      : r.at === "intervention" ? "int"
      : r.at === "warning" ? (r.naGroup === "failed" ? "failed" : r.naGroup === "manual" ? "manual" : "term")
      : "progress";
    rows.forEach((r, i) => {
      const k = parseInt(String(r.id).replace(/\D/g,""), 10) || i + 1;
      const cur = k % PCR_STAGE_LABELS.length;
      for (let s = 0; s < cur; s++) tally[s].done += 1;
      const st = liveState(r);
      // A finished record has cleared every stage; anything else is sitting on its
      // current stage in that state, and later stages are waiting or scheduled.
      tally[cur][st] += 1;
    });
    return PCR_STAGE_LABELS.map((lines, i) => {
      const t = tally[i];
      const total = PCR_STAGE_STATES.reduce((s, x) => s + t[x.id], 0);
      const pct = {};
      let acc = 0, keys = PCR_STAGE_STATES.filter(x => t[x.id]);
      keys.forEach((x, j) => {
        const v = j === keys.length - 1 ? 100 - acc : Math.round(t[x.id] / total * 100);
        pct[x.id] = v; acc += v;
      });
      return { label: lines.join(" "), lines, total, pct };
    });
  })();
  // Distribution of transaction processing time — records bucketed by turnaround.
  const ptData = (() => {
    const buckets = [["0 - 03 days",0],["03 - 10 days",0],["10 - 12 days",0],["12 - 13 days",0]];
    rows.forEach((r, i) => {
      const k = (parseInt(String(r.id).replace(/\D/g,""),10) || i+1);
      const b = k % 10 < 4 ? 0 : k % 10 < 8 ? 1 : k % 10 === 8 ? 2 : 3;
      buckets[b][1] += 1;
    });
    return buckets.map(([label,value]) => ({ label, value }));
  })();
  const ptMax = Math.max(4, Math.ceil(Math.max(...ptData.map(x=>x.value), 1) / 4) * 4);

  // KPI row — the decision lifecycle, in the same order as the summary strip.
  const kpiPct = (cnt) => n ? Math.round((cnt / n) * 100) + "%" : "0%";
  const parsePcrD = (s) => { const m = String(s||"").match(/(\d+)\/(\d+)\/(\d+)/); return m ? new Date(2000 + +m[3], +m[1]-1, +m[2]) : null; };
  const fmtPcrD = (d) => `${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}/${String(d.getFullYear()).slice(2)}`;
  const prevIntGrowth = React.useMemo(() => {
    if (!dateRange) return { pct: 0, dir: "flat", tip:"" };
    const s = parsePcrD(dateRange.start), e = parsePcrD(dateRange.end);
    if (!s || !e) return { pct: 0, dir: "flat", tip:"" };
    const lenDays = Math.round((e - s) / 86400000) + 1;
    const prevEnd = new Date(s); prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - (lenDays - 1));
    const prevRange = { start: fmtPcrD(prevStart), end: fmtPcrD(prevEnd) };
    let f = all;
    if (fieldFilters.length) f = f.filter(r => fieldFilters.every(x => x.values.includes(r[x.field])));
    f = f.filter(r => window.dateInRange(r.episodeStartDate, prevRange));
    const prevCnt = f.filter(r => r.at === "intervention").length;
    const curCnt = needsInt.length;
    const tip = { lenDays, curLabel: `${dateRange.start} – ${dateRange.end}`, curCount: curCnt, prevLabel: `${prevRange.start} – ${prevRange.end}`, prevCount: prevCnt };
    if (prevCnt === 0) return curCnt === 0 ? { pct: 0, dir: "flat", tip } : { pct: 100, dir: "up", tip };
    const p = Math.round(((curCnt - prevCnt) / prevCnt) * 100);
    return { pct: Math.abs(p), dir: p > 0 ? "up" : p < 0 ? "down" : "flat", tip };
  }, [all, fieldFilters, dateRange, needsInt.length]);
  const preSubCnt = rows.filter(r=>r.status==="Pre-Submission").length;
  const decPendCnt = rows.filter(r=>["Submitted","DCN received","UTN received"].includes(r.status)).length;
  const provCnt = rows.filter(r=>r.status==="Affirmed").length;
  const nonAffCnt = rows.filter(r=>r.status==="Partially-Affirmed" || r.status==="Non-Affirmed").length;
  const stats = [
    { label:"All Records", value:p2(n), nav:{ type:"rcdAll" } },
    { label:"Pre-Submission", pct:kpiPct(preSubCnt), count:p2(preSubCnt), nav:{ type:"rcdStatus", status:"pre_submission" } },
    { label:"Decision Pending", pct:kpiPct(decPendCnt), count:p2(decPendCnt), group:["Submitted","DCN received","UTN received"], nav:{ type:"rcdStatus", status:"decision_pending" } },
    { label:"Affirmed", pct:kpiPct(provCnt), count:p2(provCnt), nav:{ type:"rcdStatus", status:"affirmed" } },
    { label:"Non-Affirmed", pct:kpiPct(nonAffCnt), count:p2(nonAffCnt), group:["Partially-Affirmed","Non-Affirmed"], nav:{ type:"rcdStatus", status:"non_affirm" } },
    { label:"Interventions", value:p2(needsInt.length), growth:prevIntGrowth, growthTip:prevIntGrowth.tip, nav:{ type:"rcdIntervention" } },
  ];

  // Productivity view — automation savings derived from the same filtered set.
  const prod = (()=>{
    const done = completed.length + needsInt.filter(r=>r.intDone).length;
    const perDay = Math.max(1, Math.round(n * 1.8));
    const avgDays = (2.4 + (n % 25) / 10).toFixed(2);
    const daysSaved = Math.max(1, Math.round(n * 0.4));
    const fte = Math.max(1, Math.round(n / 42));
    const savings = (n * 0.072).toFixed(1);
    const hoursSaved = daysSaved * 8;
    const weeks = ["W1","W2","W3","W4","W5"];
    const base = Math.round(perDay * 7 / 5);
    const trend = weeks.map((w,i)=>({ label:w, value: Math.max(0, base + ((i % 3) - 1) * Math.round(base * 0.18)) }));
    const trendMax = Math.max(4, Math.ceil(Math.max(...trend.map(t=>t.value), 1) / 4) * 4);
    const stages = [["Eligibility",0.28],["Assembly",0.22],["Submission",0.2],["Doc Upload",0.16],["Decision",0.14]];
    const hours = stages.map(([l,share])=>({ label:l, value: Math.round(hoursSaved * share) }));
    const hoursMax = Math.max(4, Math.ceil(Math.max(...hours.map(h=>h.value), 1) / 4) * 4);
    // Cost saving per week — the same weekly buckets as the completion trend,
    // priced at the blended per-transaction saving.
    const perTxn = 0.072;
    const cost = trend.map(t=>({ label:t.label, value:+(t.value * perTxn).toFixed(1) }));
    const costMax = Math.max(2, Math.ceil(Math.max(...cost.map(c=>c.value), 1) / 2) * 2);
    return { perDay, avgDays, fte, daysSaved, savings, trend, trendMax, hours, hoursMax, cost, costMax };
  })();

  // Transaction completion trend — records bucketed by PCR init date, by day or
  // by week across the selected PCR Init Date range.
  const completion = (() => {
    const parse = (s) => { const m = String(s||"").match(/(\d+)\/(\d+)\/(\d+)/); return m ? new Date(2000 + +m[3], +m[1]-1, +m[2]) : null; };
    const buckets = new Map();
    rows.forEach(r => {
      const d = parse(r.txnInitDate); if (!d) return;
      const b = new Date(d);
      if (trendGrain === "week") b.setDate(b.getDate() - ((b.getDay() + 6) % 7));
      buckets.set(b.getTime(), (buckets.get(b.getTime()) || 0) + 1);
    });
    const keys = [...buckets.keys()].sort((a,b)=>a-b);
    const fmt = (t) => { const d = new Date(t); return String(d.getMonth()+1).padStart(2,"0") + "/" + String(d.getDate()).padStart(2,"0") + "/" + d.getFullYear(); };
    const data = keys.map(k => ({ label: fmt(k), value: buckets.get(k) }));
    const mx = Math.max(...data.map(d=>d.value), 1);
    const max = Math.max(4, Math.ceil(mx / 4) * 4);
    return { data, max };
  })();

  return (
    <div style={{ display: "flex", alignItems: "stretch" }}>
      <div style={{ flex: "1 1 0", minWidth: 0 }}>
        <ARVFilterBarChips
          hideSearch={true}
          datePicker={{ label: "PCR Init Date", value: dateRange, available: dates, onChange: setDateRange }}
          filterFields={PCR_DASH_FILTER_FIELDS}
          filterRows={all}
          fieldFilters={fieldFilters}
          onFieldFilters={setFieldFilters}
        />
        <div style={{ padding: "20px 32px 32px" }}>
          <div style={{ font:"500 18px/22px Roboto", color:"#0f172a" }}>PCR Summary</div>
          {/* 30-column grid: 6 summary cards span 5 each, 5 cost cards span 6 each — both rows fill the same width with equal cards. */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(30, minmax(0, 1fr))", gap: 9, marginTop: 16 }}>
            {stats.map(s => <div key={s.label} style={{ display: "flex", minWidth: 0, gridColumn: "span 5" }}><PCRStatCard {...s} fill onClick={s.nav ? () => onNav && onNav(s.nav) : undefined} /></div>)}
            <div style={{ gridColumn: "1 / -1", font:"500 18px/22px Roboto", color:"#0f172a", marginTop: 11, marginBottom: 3 }}>Cost And Time Metrics</div>
            {[
              ["Throughput Per Day", prod.perDay],
              ["Avg Completion Time", prod.avgDays + " Days"],
              ["FTE Saved", p2(prod.fte)],
              ["Days Saved", p2(prod.daysSaved)],
              ["Total Cost Savings", "$" + prod.savings + "k"],
            ].map(([l,v]) => <div key={l} style={{ display: "flex", minWidth: 0, gridColumn: "span 6" }}><StatCard label={l} value={v} fill /></div>)}
          </div>
          <React.Fragment>
          <div className="ws-scrollbody" style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 24, overflowY: "auto", maxHeight: "calc(100vh - 500px)", paddingRight: 4 }}>
          <div style={{ font:"500 16px/20px Roboto", color:"#3A424A" }}>PCR Transaction Analytics</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridAutoRows: "294px", gap: 18 }}>
            <DashCard title="Transaction Completion Trend" info right={<PickerBtn options={[["day","By Day"],["week","By Week"]]} value={trendGrain} onChange={setTrendGrain} />} style={{ height: 294, gridColumn: "1 / -1" }} bodyStyle={{ paddingTop: 10 }}>
              <SimpleLineChart data={completion.data} max={completion.max} step={completion.max / 4} yLabel="No. Of Transactions" color="#7C6BD6" />
            </DashCard>

            <DashCard title="Submission Type Distribution" info style={{ height: 294 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 44 }}>
                <Donut size={196} thickness={32}
                  segments={subTypes.map(x => ({ value: x[1] || 0.001, color: x[2] }))}
                  centerTop={n} centerBottom="RECORDS" centerTopSize={18} centerTopWeight={600} centerTopY="47%" centerBottomSize={10} centerBottomWeight={500} centerBottomY="61%" />
                <div style={{ flex: "0 1 260px", minWidth: 0 }}>
                  {subTypes.map((x, i) => <LegendRow key={x[0]} color={x[2]} label={x[0]} value={x[1] + "%"} divider={i < subTypes.length - 1} />)}
                </div>
              </div>
            </DashCard>

            <DashCard title="Distribution Of Transaction Processing Time" info style={{ height: 294 }} bodyStyle={{ paddingTop: 10 }}>
              <SimpleBarChart data={ptData} max={ptMax} step={ptMax / 4} yLabel="No. Of Transactions" color="#7C6BD6" barW={46} />
            </DashCard>
          </div>

          </div>
          </React.Fragment>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 2, width: 560, flexShrink: 0, background: "#fff", boxShadow: "-10px 0 24px 0 #1C2D420C" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 51, background: "#FFF1F1" }} />
        <div style={{ position: "relative", padding: "16px 20px 28px 32px", display: "flex", flexDirection: "column", minHeight: "calc(100vh - 190px)" }}>
          <div style={{ background: "#fff", border: "1px solid #F3E0E0", borderRadius: 9, boxShadow: "0 1px 3px rgba(86,86,86,.06)", display: "flex", alignItems: "center", padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <WarnGlyph />
              <span style={{ font: "500 19px/23px Roboto", color: "#3A424A" }}>PCR Action Items</span>
            </div>
            <span style={{ marginLeft: "auto", font: "400 15px/20px Roboto", color: "#6A717D" }}><span style={{ color: "#CF1322" }}>{nonAffOpen.length + partialOpen.length + naTotal + intTotal} Items</span> Needs Review</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
            <span style={{ font: "500 18px/22px Roboto", color: "#3A424A" }}>Palmetto Response</span>
            <span style={{ marginLeft: 10, background: "#FFE7E6", color: "#CF1322", borderRadius: 999, padding: "1px 9px", font: "500 13px Roboto" }}>{p2(nonAffOpen.length + partialOpen.length)}</span>
          </div>
          <BigActionRow noIcon label="Non-Affirmed" count={p2(nonAffOpen.length)} onClick={() => onNav && onNav({ type: "rcdStatus", status: "non_affirm", ids: idsOf(nonAffOpen) })} />
          <BigActionRow noIcon label="Partially-Affirmed" count={p2(partialOpen.length)} onClick={() => onNav && onNav({ type: "rcdStatus", status: "partial_prov", ids: idsOf(partialOpen) })} />

          <div style={{ display: "flex", alignItems: "center", marginTop: 20, marginBottom: 12 }}>
            <span style={{ font: "500 18px/22px Roboto", color: "#3A424A" }}>Automation Action Items</span>
            <span style={{ marginLeft: "auto" }}><SortByBtn /></span>
          </div>
          <div style={{ border: "1px solid #F1E4E4", borderRadius: 9, background: "#fff", overflow: "hidden auto", boxShadow: "0 1px 3px rgba(86,86,86,.06)", flex: "1 1 auto", minHeight: 0 }} className="ws-scrollbody">
            <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #F1E4E4", padding: "0 18px" }}>
              {[["attention", "Needs Attention", naTotal], ["intervention", "Needs Intervention", intTotal]].map(([k, label, count]) => {
                const sel = aiTab === k;
                return (
                  <button key={k} type="button" onClick={() => setAiTab(k)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "14px 4px 12px", marginRight: 28, display: "inline-flex", alignItems: "center", gap: 8, font: `${sel ? 500 : 400} 15px/20px Roboto`, color: sel ? "#3A424A" : "#8A94A6", borderBottom: `2px solid ${sel ? "#CF1322" : "transparent"}`, marginBottom: -1 }}>
                    {label}
                    <span style={{ background: sel ? "#CF1322" : "#FBDCDC", color: sel ? "#fff" : "#C48A8A", borderRadius: 999, padding: "1px 8px", font: "500 12px/18px Roboto" }}>{p2(count)}</span>
                  </button>
                );
              })}
            </div>
            {aiTab === "attention"
              ? (naGroups.length ? naGroups.map((grp, gi) => (
                  <AutomationGroup key={grp.g} title={grp.title} sub={grp.sub} count={p2(grp.rows.length)} defaultOpen={gi === 0} userIcon={grp.g === "manual"}
                    onNav={() => onNav && onNav({ type: "rcdNaGroup", group: grp.g, reasons: grp.reasons.map(x => x.reason), ids: idsOf(grp.rows) })}>
                    {grp.reasons.map(x => <AutomationItem key={x.reason} label={x.reason} count={p2(x.count)} onClick={() => onNav && onNav({ type: "rcdNaReason", group: grp.g, reason: x.reason, ids: x.ids })} />)}
                  </AutomationGroup>
                )) : <div style={{ padding: "18px", font: "400 14px/20px Roboto", color: "#8A94A6" }}>No open Needs Attention records</div>)
              : <>
                  {PCR_INT_REASONS.length > 0 && <AutomationGroup title="Pending Interventions" sub="Open - Awaiting Action" count={p2(intPending)} defaultOpen onNav={() => onNav && onNav({ type: "rcdIntervention", ids: idsOfReasons(PCR_INT_REASONS) })}>
                    <CollapsibleReasons reasons={PCR_INT_REASONS} initial={5} onReason={(r) => onNav && onNav({ type: "rcdIntervention", label: r, ids: intIdsFor(r) })} />
                  </AutomationGroup>}
                  {PCR_INEL_REASONS.length > 0 && <AutomationGroup title="Ineligible Records" sub="Not Eligible For Pre-Claim Review" count={p2(intInel)} defaultOpen={!PCR_INT_REASONS.length} onNav={() => onNav && onNav({ type: "rcdIntervention", label: "Ineligible Records", ids: idsOfReasons(PCR_INEL_REASONS) })}>
                    <CollapsibleReasons reasons={PCR_INEL_REASONS} initial={5} onReason={(r) => onNav && onNav({ type: "rcdIntervention", label: r, ids: intIdsFor(r) })} />
                  </AutomationGroup>}
                </>}
          </div>
        </div>
      </div>
    </div>
  );
}


// ── E-Referral dashboard ─────────────────────────────────────
// Same shell as the PCR dashboard. Every number comes from the Intake › E-referral
// rows (window.IER_ROWS); clicking a card or action item opens that grid filtered
// to the exact records behind the count.
const REF_DASH_FILTER_FIELDS = [
  { key: "branch",    label: "Branch" },
  { key: "refSource", label: "Referral Source" },
  { key: "plan",      label: "Payer Name" },
  { key: "zip",       label: "Zipcode" },
];
const REF_RESP = [["Accepted","accepted","#61AA6B"],["Declined","declined","#F87D7C"],["Exceptions","ineligible","#F8C87C"]];
const REF_RESP_V2 = [["Accepted","accepted","#61AA6B"],["Declined","declined","#F87D7C"],["User Decision","userDecision","#618EAA"],["Ineligible","ineligible","#A18B6D"],["Exceptions","exceptions","#F8C87C"]];
const REF_HUB_COLORS = ["#156082","#618EAA","#F8C87C","#A18B6D","#7C6BD6","#4FC3B1"];
function ReferralDashboard({ onNav }) {
  const [aiTab, setAiTab] = useDash("attention");
  const [trendGrain, setTrendGrain] = useDash("day");
  const [, setTick] = useDash(0);
  // E-referral data loads with the Intake screens; re-render once it lands.
  React.useEffect(() => { if (window.IER_ROWS) return; const t = setInterval(() => { if (window.IER_ROWS) { clearInterval(t); setTick(x => x + 1); } }, 300); return () => clearInterval(t); }, []);
  const all = window.IER_ROWS || [];
  const dates = [...new Set(all.map(r => r.refDate))];
  const [dateRange, setDateRange] = useDash(null);
  const range = dateRange || (dates.length ? window.defaultDateRange(dates, 60) : null);
  const [fieldFilters, setFieldFilters] = useDash([]);
  const rows = all.filter(r => (!fieldFilters.length || fieldFilters.every(x => x.values.includes(r[x.field]))) && (!range || window.dateInRange(r.refDate, range)));
  const n = rows.length;
  const ids = (rs) => rs.map(r => r.id);
  const go = (label, rs) => onNav && onNav({ label, ids: ids(rs) });
  const pct = (c) => n ? Math.round(c / n * 100) + "%" : "0%";
  const acc = rows.filter(r => r.resp === "accepted"), dec = rows.filter(r => r.resp === "declined"), inel = rows.filter(r => r.resp === "ineligible");
  const valFail = rows.filter(r => r.payerMatched === "No" || r.zipMatched === "No" || r.srcMatched === "No");
  const agPending = rows.filter(r => r.agencyResp === "Pending");
  // v2 data (window.IER_V2): summary mirrors the Referral Response Summary buckets.
  const V2 = !!window.IER_V2;
  const ud = rows.filter(r => r.resp === "userDecision"), exc = rows.filter(r => r.resp === "exceptions");
  const stat = (label, rs) => ({ label, pct: pct(rs.length), count: p2(rs.length), rs });
  const stats = [{ label: "All Referrals", value: p2(n), rs: rows }, stat("Accepted", acc), stat("Declined", dec)]
    .concat(V2 ? [stat("User Decision", ud), stat("Ineligible", inel), stat("Exceptions", exc)] : [stat("Exceptions", inel)]);
  const prod = { perDay: Math.max(1, Math.round(n * 1.6)), avg: (0.6 + (n % 7) / 10).toFixed(1), fte: Math.max(1, Math.round(n / 6)), days: Math.max(1, Math.round(n * 0.5)), cost: (n * 0.045).toFixed(2) };
  // Referral volume — by referral date, per day or per ISO week.
  const trend = (() => {
    const parse = (s) => { const m = String(s||"").match(/(\d+)\/(\d+)\/(\d+)/); return m ? new Date(2000 + +m[3], +m[1]-1, +m[2]) : null; };
    const b = new Map();
    rows.forEach(r => { const d = parse(r.refDate); if (!d) return; if (trendGrain === "week") d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); b.set(d.getTime(), (b.get(d.getTime()) || 0) + 1); });
    const data = [...b.keys()].sort((a, c) => a - c).map(k => { const d = new Date(k); return { label: String(d.getMonth()+1).padStart(2,"0") + "/" + String(d.getDate()).padStart(2,"0") + "/" + d.getFullYear(), value: b.get(k) }; });
    return { data, max: Math.max(4, Math.ceil(Math.max(...data.map(d => d.value), 1) / 4) * 4) };
  })();
  const respSeg = (V2 ? REF_RESP_V2 : REF_RESP).map(([l, k, c]) => [l, rows.filter(r => r.resp === k).length, c]);
  const hubs = (() => { const m = {}; rows.forEach(r => { const k = r.gw || "Direct"; m[k] = (m[k] || 0) + 1; }); return Object.keys(m).sort((a, b) => m[b] - m[a]).map((k, i) => [k, m[k], REF_HUB_COLORS[i % REF_HUB_COLORS.length]]); })();
  const countBy = (k) => { const m = {}; rows.forEach(r => { const v = r[k] || "—"; m[v] = (m[v] || 0) + 1; }); return Object.keys(m).sort((a, b) => m[b] - m[a]).map(l => ({ label: l, value: m[l] })); };
  const planData = countBy("plan"), zipData = countBy("zip");
  const scaleOf = (d) => Math.max(4, Math.ceil(Math.max(...d.map(x => x.value), 1) / 2) * 2);
  const planMax = scaleOf(planData), zipMax = scaleOf(zipData);
  const checks = [["Payer", "payerMatched"], ["Zipcode", "zipMatched"], ["Referral Source", "srcMatched"]];
  const valData = checks.map(([l, k]) => ({ label: l, value: rows.filter(r => r[k] === "No").length }));
  const valMax = Math.max(4, Math.ceil(Math.max(...valData.map(x => x.value), 1) / 2) * 2);
  // Action items — open (unreviewed) records only.
  const naRows = rows.filter(r => r.at === "warning");
  const reasonsOf = (rs) => { const m = {}; rs.forEach(r => { const t = r.atReason || "Unspecified reason"; (m[t] = m[t] || []).push(r); }); return Object.keys(m).sort((x, y) => m[y].length - m[x].length).map(k => ({ reason: k, rs: m[k] })); };
  const termRows = naRows.filter(r => r.atGroup !== "failed"), failRows = naRows.filter(r => r.atGroup === "failed");
  const termReasons = reasonsOf(termRows), failReasons = reasonsOf(failRows);
  const valGroups = checks.map(([l, k]) => ({ reason: l + " not matched", rs: rows.filter(r => r[k] === "No") })).filter(x => x.rs.length);
  const agDeclined = rows.filter(r => r.agencyResp === "Declined");
  const respAction = V2 ? [["Exceptions", exc], ["Ineligible", inel]] : [["Exceptions", inel], ["Declined", dec]];
  const respActionN = respAction.reduce((s, x) => s + x[1].length, 0);
  const total = respActionN + naRows.length;
  return (
    <div style={{ display: "flex", alignItems: "stretch" }}>
      <div style={{ flex: "1 1 0", minWidth: 0 }}>
        <ARVFilterBarChips hideSearch={true} datePicker={{ label: "Referral Date", value: range, available: dates, onChange: setDateRange }}
          filterFields={REF_DASH_FILTER_FIELDS} filterRows={all} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters} />
        <div style={{ padding: "20px 32px 32px" }}>
          <div style={{ font: "500 18px/22px Roboto", color: "#0f172a" }}>E-Referral Summary</div>
          <div style={{ display: "grid", gridTemplateColumns: V2 ? "repeat(3, minmax(170px, 1fr))" : "repeat(28, minmax(0, 1fr))", gap: 9, marginTop: 16 }}>
            {stats.map(s => <div key={s.label} style={{ display: "flex", minWidth: 0, gridColumn: V2 ? undefined : "span 7" }}><PCRStatCard label={s.label} value={s.value} pct={s.pct} count={s.count} fill onClick={() => go(s.label, s.rs)} /></div>)}
          </div>
          <div className="ws-scrollbody" style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 24, overflowY: "auto", maxHeight: "calc(100vh - 400px)", paddingRight: 4 }}>
            <div style={{ font: "500 16px/20px Roboto", color: "#3A424A" }}>E-Referral Analytics</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridAutoRows: "294px", gap: 18 }}>
              <DashCard title="Referral Volume Trend" info right={<PickerBtn options={[["day","By Day"],["week","By Week"]]} value={trendGrain} onChange={setTrendGrain} />} style={{ height: 294, gridColumn: "1 / -1" }} bodyStyle={{ paddingTop: 10 }}>
                <SimpleLineChart data={trend.data} max={trend.max} step={trend.max / 4} yLabel="No. Of Referrals" color="#7C6BD6" />
              </DashCard>
              <DashCard title="Referral Response Distribution" info style={{ height: 294 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 36 }}>
                  <Donut size={180} thickness={30} segments={respSeg.map(x => ({ value: x[1] || 0.001, color: x[2] }))}
                    centerTop={n} centerBottom="REFERRALS" centerTopSize={18} centerTopWeight={600} centerTopY="47%" centerBottomSize={10} centerBottomWeight={500} centerBottomY="61%" />
                  <div style={{ flex: "0 1 220px", minWidth: 0 }}>{respSeg.map((x, i) => <LegendRow key={x[0]} color={x[2]} label={x[0]} value={String(x[1]).padStart(2, "0")} divider={i < respSeg.length - 1} />)}</div>
                </div>
              </DashCard>
              <DashCard title="Validation Failures By Check" info style={{ height: 294 }} bodyStyle={{ paddingTop: 10 }}>
                <SimpleBarChart data={valData} max={valMax} step={valMax / 2} yLabel="No. Of Referrals" color="#F87D7C" barW={56} />
              </DashCard>
              <DashCard title="E-Referral Count By Primary Plan" info style={{ height: 294, gridColumn: "1 / -1" }} bodyStyle={{ paddingTop: 10 }}>
                <SimpleBarChart data={planData} max={planMax} step={planMax / 2} yLabel="No. Of Referrals" color="#618EAA" barW={44} />
              </DashCard>
              <DashCard title="E-Referral Count By Zip Code" info style={{ height: 294, gridColumn: "1 / -1" }} bodyStyle={{ paddingTop: 10 }}>
                <SimpleBarChart data={zipData} max={zipMax} step={zipMax / 2} yLabel="No. Of Referrals" color="#156082" barW={44} />
              </DashCard>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 2, width: 560, flexShrink: 0, background: "#fff", boxShadow: "-10px 0 24px 0 #1C2D420C" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 51, background: "#FFF1F1" }} />
        <div style={{ position: "relative", padding: "16px 20px 28px 32px", display: "flex", flexDirection: "column", minHeight: "calc(100vh - 190px)" }}>
          <div style={{ background: "#fff", border: "1px solid #F3E0E0", borderRadius: 9, boxShadow: "0 1px 3px rgba(86,86,86,.06)", display: "flex", alignItems: "center", padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><WarnGlyph /><span style={{ font: "500 19px/23px Roboto", color: "#3A424A" }}>E-Referral Action Items</span></div>
            <span style={{ marginLeft: "auto", font: "400 15px/20px Roboto", color: "#6A717D" }}><span style={{ color: "#CF1322" }}>{total} Items</span> Needs Review</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
            <span style={{ font: "500 18px/22px Roboto", color: "#3A424A" }}>Referral Response</span>
            <span style={{ marginLeft: 10, background: "#FFE7E6", color: "#CF1322", borderRadius: 999, padding: "1px 9px", font: "500 13px Roboto" }}>{p2(respActionN)}</span>
          </div>
          {respAction.map(([l, rs]) => <BigActionRow key={l} noIcon label={l} count={p2(rs.length)} onClick={() => go(l, rs)} />)}
          <div style={{ display: "flex", alignItems: "center", marginTop: 20, marginBottom: 12 }}>
            <span style={{ font: "500 18px/22px Roboto", color: "#3A424A" }}>Automation Action Items</span>
            <span style={{ marginLeft: "auto" }}><SortByBtn /></span>
          </div>
          <div style={{ border: "1px solid #F1E4E4", borderRadius: 9, background: "#fff", overflow: "hidden auto", boxShadow: "0 1px 3px rgba(86,86,86,.06)", flex: "1 1 auto", minHeight: 0 }} className="ws-scrollbody">
            <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #F1E4E4", padding: "0 18px" }}>
              {[["attention", "Needs Attention", naRows.length]].map(([k, label, count]) => {
                const sel = aiTab === k;
                return (
                  <button key={k} type="button" onClick={() => setAiTab(k)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "14px 4px 12px", marginRight: 28, display: "inline-flex", alignItems: "center", gap: 8, font: `${sel ? 500 : 400} 15px/20px Roboto`, color: sel ? "#3A424A" : "#8A94A6", borderBottom: `2px solid ${sel ? "#CF1322" : "transparent"}`, marginBottom: -1 }}>
                    {label}<span style={{ background: sel ? "#CF1322" : "#FBDCDC", color: sel ? "#fff" : "#C48A8A", borderRadius: 999, padding: "1px 8px", font: "500 12px/18px Roboto" }}>{p2(count)}</span>
                  </button>
                );
              })}
            </div>
            <AutomationGroup title="Terminated" sub="Business Exception" count={p2(termRows.length)} defaultOpen onNav={() => go("Terminated", termRows)}>
              {termReasons.map(x => <AutomationItem key={x.reason} label={x.reason} count={p2(x.rs.length)} onClick={() => go(x.reason, x.rs)} />)}
            </AutomationGroup>
            <AutomationGroup title="Failed" sub="Technical Exception" count={p2(failRows.length)} defaultOpen onNav={() => go("Failed", failRows)}>
              {failReasons.map(x => <AutomationItem key={x.reason} label={x.reason} count={p2(x.rs.length)} onClick={() => go(x.reason, x.rs)} />)}
            </AutomationGroup>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Assessment dashboard (OASIS / HOPE submissions) ──────────
// Chart set and content come from the OASIS dashboard reference; every card,
// colour, table and control is the prototype's own system. All numbers are
// derived from the Assessment Request View rows (window.ASV_ROWS).
const ASSESS_FILTER_FIELDS = [
  { key: "facilityId", label: "Agency" },
  { key: "branchCode", label: "Branch" },
  { key: "source",     label: "Source" },
  { key: "txnType",    label: "Transaction Type" },
];
const ASSESS_RFA = [
  ["SOC", "#F8C87C"], ["ROC", "#A18B6D"], ["Recertification", "#61AA6B"],
  ["Other follow up", "#618EAA"], ["Patient not discharged", "#C58BD6"],
  ["Patient discharged", "#E8A33D"], ["Death at home", "#9AA8C7"], ["Discharge from agency", "#4C9FD1"],
];
const ASSESS_STATUS_SERIES = [
  { key: "acc", color: "#61AA6B", name: "Accepted" },
  { key: "rej", color: "#F87D7C", name: "Rejected" },
];
const assessKey = (r, i) => (parseInt(String(r.id).replace(/\D/g, ""), 10) || i + 1);

function AssessTable({ cols, rows, maxHeight = 250 }) {
  return (
    <div className="ws-scrollbody" style={{ overflow: "hidden auto", maxHeight, border: "1px solid #EEF1F7", borderRadius: 6 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c.label} style={{ position: "sticky", top: 0, background: "#F1F4F9", textAlign: c.align || "left", font: "500 12px/16px Roboto", color: "#4A5568", padding: "9px 12px", borderBottom: "1px solid #E2E8F0", whiteSpace: "nowrap" }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={cols.length} style={{ padding: "22px 12px", textAlign: "center", font: "400 13px/18px Roboto", color: "#8A94A6" }}>No records in this range.</td></tr>
            : rows.map((r, i) => (
              <tr key={i} style={{ background: i % 2 ? "#FAFBFD" : "#fff" }}>
                {cols.map(c => (
                  <td key={c.label} style={{ textAlign: c.align || "left", font: "400 13px/18px Roboto", color: "#3A424A", padding: "9px 12px", borderBottom: "1px solid #F1F4F9", whiteSpace: "nowrap", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis" }}>{c.render ? c.render(r) : r[c.key]}</td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function AssessmentDashboard() {
  const all = (typeof window !== "undefined" && window.ASV_ROWS) || [];
  const dates = [...new Set(all.map(r => r.asmtInit || r.submitted))];
  const [dateRange, setDateRange] = useDash(() => window.defaultDateRange(dates, 60));
  const [fieldFilters, setFieldFilters] = useDash([]);
  const [tab, setTab] = useDash("perf");

  const rows = React.useMemo(() => {
    let f = all;
    if (fieldFilters.length) f = f.filter(r => fieldFilters.every(x => x.values.includes(r[x.field])));
    return f.filter(r => window.dateInRange(r.asmtInit || r.submitted, dateRange));
  }, [all, fieldFilters, dateRange]);

  const n = rows.length;
  const accepted = rows.filter(r => r.valStatus === "accepted").length;
  const rejected = rows.filter(r => r.valStatus === "rejected").length;
  const warnings = rows.filter(r => r.msgSev === "Warning").length;
  const errRate = n ? ((rejected / n) * 100).toFixed(2) : "0.00";

  // chronological buckets by submission date
  const byDate = (() => {
    const map = new Map();
    rows.forEach(r => {
      if (!map.has(r.submitted)) map.set(r.submitted, { acc: 0, rej: 0, tot: 0, fSkip: 0, fDown: 0, fUp: 0, fVal: 0 });
      const b = map.get(r.submitted);
      b.tot += 1; b[r.valStatus === "rejected" ? "rej" : "acc"] += 1;
      if (r.at === "warning") b.fSkip += 1;
      if (r.source === "OASIS Console") b.fDown += 1;
      if (r.valStatus === "accepted") b.fUp += 1;
      if (r.msgNum) b.fVal += 1;
    });
    const keys = [...map.keys()].sort((a, b) => new Date("20" + a.slice(6) + "-" + a.slice(0, 2) + "-" + a.slice(3, 5)) - new Date("20" + b.slice(6) + "-" + b.slice(0, 2) + "-" + b.slice(3, 5)));
    return keys.map(k => ({ label: k.slice(0, 5), ...map.get(k) }));
  })();
  const errTrend = byDate.map(d => ({ label: d.label, value: +((d.rej / (d.tot || 1)) * 100).toFixed(2) }));
  const errMax = Math.max(4, Math.ceil(Math.max(...errTrend.map(d => d.value), 1) / 4) * 4);
  const statusData = byDate.map(d => ({ label: d.label, values: { acc: d.acc, rej: d.rej }, total: d.tot }));
  const statusMax = Math.max(4, Math.ceil(Math.max(...byDate.map(d => d.tot), 1) / 4) * 4);

  // error & warning messages, grouped by code + severity + validation status
  const msgRows = (() => {
    const m = {};
    rows.filter(r => r.msgNum).forEach(r => {
      const k = r.msgNum + "|" + r.msgSev + "|" + r.valStatus;
      if (!m[k]) m[k] = { code: r.msgNum, sev: r.msgSev, status: r.valStatus === "rejected" ? "Rejected" : "Accepted", message: r.msgSev === "Fatal" ? "Invalid Branch" : "Inconsistent Dates", count: 0 };
      m[k].count += 1;
    });
    return Object.values(m).sort((a, b) => b.count - a.count);
  })();

  // rejection count by RFA type
  const rfa = (() => {
    const rej = rows.filter(r => r.valStatus === "rejected");
    const pool = rej.length ? rej : rows;
    const tally = ASSESS_RFA.map(([label, color]) => ({ label, color, count: 0 }));
    pool.forEach((r, i) => { tally[assessKey(r, i) % ASSESS_RFA.length].count += 1; });
    const total = tally.reduce((s, x) => s + x.count, 0) || 1;
    return { total: pool.length, items: tally.map(t => ({ ...t, pct: Math.round((t.count / total) * 100) })) };
  })();

  // agency-wise accepted / rejected
  const agencyRows = (() => {
    const m = {};
    rows.forEach(r => {
      const k = r.facilityId + "|" + r.branchCode;
      if (!m[k]) m[k] = { agency: r.facilityId, branch: r.branchCode, type: r.txnType, acc: 0, rej: 0 };
      m[k][r.valStatus === "rejected" ? "rej" : "acc"] += 1;
    });
    return Object.values(m).sort((a, b) => b.acc - a.acc);
  })();

  // days remaining before the late-submission penalty
  const penaltyRows = rows.map((r, i) => ({ id: r.submissionId + "-" + String(assessKey(r, i)).padStart(3, "0"), days: assessKey(r, i) % 10 }))
    .sort((a, b) => a.days - b.days).slice(0, 12);

  // overall summary: automation file counts
  const files = {
    skipped: rows.filter(r => r.at === "warning").length,
    downloaded: rows.filter(r => r.source === "OASIS Console").length,
    uploaded: rows.filter(r => r.valStatus === "accepted").length,
    validation: rows.filter(r => r.msgNum).length,
    sftp: rows.filter(r => r.docs).length,
  };
  const fileCount = byDate.map(d => ({ label: d.label, values: { skip: d.fSkip, down: d.fDown, up: d.fUp, val: d.fVal } }));
  const fileMax = Math.max(4, Math.ceil(Math.max(...fileCount.flatMap(d => Object.values(d.values)), 1) / 4) * 4);

  // Automation exceptions — rows the automation could not carry through, split
  // into business (terminated) and technical (failed) the same way as the other
  // dashboards.
  const ASSESS_TERM_REASONS = ["Assessment locked in EHR", "Patient record not found in iQIES", "Duplicate assessment detected"];
  const ASSESS_FAIL_REASONS = ["iQIES session timed out", "Validation file not returned", "SFTP transfer failed"];
  const autoAll = rows.filter(r => r.at === "warning");
  const autoTerm = autoAll.filter((r, i) => assessKey(r, i) % 2 === 0);
  const autoFail = autoAll.filter((r, i) => assessKey(r, i) % 2 !== 0);
  const autoTotal = autoAll.length;
  const reasonTally = (list, names) => {
    const m = {};
    list.forEach((r, i) => { const k = names[assessKey(r, i) % names.length]; m[k] = (m[k] || 0) + 1; });
    return Object.keys(m).map(k => [k, m[k]]).sort((a, b) => b[1] - a[1]);
  };
  const termReasons = reasonTally(autoTerm, ASSESS_TERM_REASONS);
  const failReasons = reasonTally(autoFail, ASSESS_FAIL_REASONS);

  const longPending = rows.filter((r, i) => assessKey(r, i) % 4 === 0).length;
  const multiReject = rows.filter(r => r.valStatus === "rejected" && r.msgSev === "Fatal").length;
  const freqMsgs = msgRows.filter(m => m.count > 1).length;

  const stats = [
    ["Total Records", p2(n)], ["Accepted", p2(accepted)], ["Rejected", p2(rejected)],
    ["Warnings", p2(warnings)], ["Completed", n ? "100.00%" : "0%"], ["Error Rate", errRate + "%"],
  ];

  return (
    <div style={{ display: "flex", alignItems: "stretch" }}>
      <div style={{ flex: "1 1 0", minWidth: 0 }}>
        <ARVFilterBarChips
          hideSearch={true}
          datePicker={{ label: "Assessment Init Date", value: dateRange, available: dates, onChange: setDateRange }}
          filterFields={ASSESS_FILTER_FIELDS}
          filterRows={all}
          fieldFilters={fieldFilters}
          onFieldFilters={setFieldFilters}
        />
        <div style={{ padding: "20px 32px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 28, borderBottom: "1px solid #eef0f3" }}>
            {[["perf", "OASIS Performance"], ["summary", "Overall Summary"]].map(([k, l]) => {
              const sel = tab === k;
              return (
                <button key={k} type="button" onClick={() => setTab(k)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0 2px 10px", font: "500 18px/22px Roboto", color: sel ? "#1677FF" : "#8A94A6", borderBottom: `2px solid ${sel ? "#1677FF" : "transparent"}`, marginBottom: -1 }}>{l}</button>
              );
            })}
          </div>

          {tab === "perf" ? (
            <React.Fragment>
              <div style={{ display: "flex", flexDirection: "row", gap: 9, marginTop: 16 }}>
                {stats.map(([l, v]) => <StatCard key={l} label={l} value={v} />)}
              </div>
              <div className="ws-scrollbody" style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 24, overflowY: "auto", maxHeight: "calc(100vh - 400px)", paddingRight: 4 }}>
                <DashCard title="Error Percentage" info style={{ height: 294 }} bodyStyle={{ paddingTop: 10 }}>
                  <SimpleLineChart data={errTrend} max={errMax} step={errMax / 4} yLabel="Error %" color="#F87D7C" />
                </DashCard>

                <DashCard title="Top Accepted & Rejected Assessments" info legend={<ChartLegend series={ASSESS_STATUS_SERIES} />} style={{ height: 320 }} bodyStyle={{ paddingTop: 10 }}>
                  <StackedBarChart data={statusData} series={ASSESS_STATUS_SERIES} max={statusMax} step={statusMax / 4} yLabel="No. Of Assessments" barW={38} />
                </DashCard>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <DashCard title="Error & Warning Messages" style={{ height: 340 }} bodyStyle={{ paddingTop: 10 }}>
                    <AssessTable maxHeight={248}
                      cols={[
                        { label: "Severity", render: r => r.code + " " + r.sev },
                        { label: "Message", key: "message" },
                        { label: "Count", key: "count", align: "right" },
                        { label: "Status", key: "status" },
                      ]}
                      rows={msgRows} />
                  </DashCard>

                  <DashCard title="Rejection Count By RFA Type" info style={{ height: 340 }} bodyStyle={{ paddingTop: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                      <Donut size={168} thickness={30}
                        segments={rfa.items.map(x => ({ value: x.count || 0.001, color: x.color }))}
                        centerTop={rfa.total} centerBottom="REJECTED" centerTopSize={18} centerTopWeight={600} centerTopY="47%" centerBottomSize={10} centerBottomWeight={500} centerBottomY="61%" />
                      <div style={{ flex: "1 1 0", minWidth: 0 }}>
                        <AssessTable maxHeight={248}
                          cols={[
                            { label: "RFA Type", render: r => <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Swatch color={r.color} />{r.label}</span> },
                            { label: "Count", key: "count", align: "right" },
                            { label: "%", render: r => r.pct + "%", align: "right" },
                          ]}
                          rows={rfa.items} />
                      </div>
                    </div>
                  </DashCard>

                  <DashCard title="Agency Wise" style={{ height: 320 }} bodyStyle={{ paddingTop: 10 }}>
                    <AssessTable maxHeight={228}
                      cols={[
                        { label: "Agency ID", key: "agency" },
                        { label: "Branch Code", key: "branch" },
                        { label: "Transaction Type", key: "type" },
                        { label: "Accepted", key: "acc", align: "right" },
                        { label: "Rejected", key: "rej", align: "right" },
                      ]}
                      rows={agencyRows} />
                  </DashCard>

                  <DashCard title="Days Remaining For Penalty" style={{ height: 320 }} bodyStyle={{ paddingTop: 10 }}>
                    <AssessTable maxHeight={228}
                      cols={[
                        { label: "Assessment", key: "id" },
                        { label: "Remaining Days", key: "days", align: "right" },
                      ]}
                      rows={penaltyRows} />
                  </DashCard>
                </div>
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div style={{ display: "flex", flexDirection: "row", gap: 9, marginTop: 16 }}>
                {[
                  ["Skipped OASIS Files", p2(files.skipped)],
                  ["Files Downloaded from HCHB", p2(files.downloaded)],
                  ["Files Uploaded to iQIES", p2(files.uploaded)],
                  ["Downloaded Validation Files", p2(files.validation)],
                  ["Placed Submission Files in SFTP", p2(files.sftp)],
                ].map(([l, v]) => <StatCard key={l} label={l} value={v} />)}
              </div>
              <div style={{ marginTop: 24 }}>
                <DashCard title="OASIS File Count" info style={{ height: 380 }} bodyStyle={{ paddingTop: 10 }}>
                  <GroupedBarChart data={fileCount} series={OASIS_FILE_SERIES} max={fileMax} step={fileMax / 4} yLabel="No. Of Files" />
                </DashCard>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 2, width: 560, flexShrink: 0, background: "#fff", boxShadow: "-10px 0 24px 0 #1C2D420C" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 51, background: "#FFF1F1" }} />
        <div style={{ position: "relative", padding: "16px 20px 28px 32px" }}>
          <div style={{ background: "#fff", border: "1px solid #F3E0E0", borderRadius: 9, boxShadow: "0 1px 3px rgba(86,86,86,.06)", display: "flex", alignItems: "center", padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <WarnGlyph />
              <span style={{ font: "500 19px/23px Roboto", color: "#3A424A" }}>Assessment Action Items</span>
            </div>
            <span style={{ marginLeft: "auto", font: "400 15px/20px Roboto", color: "#6A717D" }}><span style={{ color: "#CF1322" }}>{longPending + multiReject + freqMsgs} Items</span> Needs Review</span>
          </div>

          <BigActionRow noIcon label="Long Pending Assessments" count={p2(longPending)} />
          <BigActionRow noIcon label="Multiple Rejections" count={p2(multiReject)} />
          <BigActionRow noIcon label="Frequent Error / Warning Messages" count={p2(freqMsgs)} />

          <div style={{ display: "flex", alignItems: "center", marginTop: 20, marginBottom: 12 }}>
            <span style={{ font: "500 18px/22px Roboto", color: "#3A424A" }}>Validation Messages</span>
            <span style={{ marginLeft: 10, background: "#FFE7E6", color: "#CF1322", borderRadius: 999, padding: "1px 9px", font: "500 13px Roboto" }}>{p2(msgRows.length)}</span>
            <span style={{ marginLeft: "auto" }}><SortByBtn /></span>
          </div>
          <div className="ws-scrollbody" style={{ border: "1px solid #F1E4E4", borderRadius: 9, background: "#fff", overflow: "hidden auto", maxHeight: 196, boxShadow: "0 1px 3px rgba(86,86,86,.06)" }}>
            {msgRows.map((mrow, i) => <AlertRow key={mrow.code + i} label={mrow.code + " " + mrow.sev + " — " + mrow.message} count={p2(mrow.count)} alt={i % 2 === 1} />)}
          </div>

          <div style={{ display: "flex", alignItems: "center", marginTop: 28, marginBottom: 12 }}>
            <span style={{ font: "500 18px/22px Roboto", color: "#3A424A" }}>Automation Action Items</span>
            <span style={{ marginLeft: 10, background: "#FFE7E6", color: "#CF1322", borderRadius: 999, padding: "1px 9px", font: "500 13px Roboto" }}>{p2(autoTotal)}</span>
            <span style={{ marginLeft: "auto" }}><SortByBtn /></span>
          </div>
          <div style={{ border: "1px solid #F1E4E4", borderRadius: 9, background: "#fff", overflow: "hidden", boxShadow: "0 1px 3px rgba(86,86,86,.06)" }}>
            <AutomationGroup title="Terminated" sub="Business Exceptions" count={p2(autoTerm.length)} defaultOpen>
              <CollapsibleReasons reasons={termReasons} initial={2} />
            </AutomationGroup>
            <AutomationGroup title="Failed" sub="Technical Exception" count={p2(autoFail.length)} defaultOpen>
              {failReasons.map(([r, c]) => <AutomationItem key={r} label={r} count={p2(c)} />)}
            </AutomationGroup>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Notifications dashboard ──────────────────────────────────
// Business status + the four key/cost-time metrics as charts, from window.NOT_ROWS.
// Action items are automation-only (Needs Attention: Failed / Terminated), unreviewed.
const NOTIF_DASH_FILTER_FIELDS = [
  { key: "serviceLine",  label: "Service line" },
  { key: "branchId",     label: "Branch" },
  { key: "event",        label: "Event" },
  { key: "notifOption",  label: "Notification option" },
  { key: "physFacility", label: "Physician/Facility" },
  { key: "commMethod",   label: "Communication method" },
];
const notifParseD = (s) => { const m = String(s||"").match(/(\d+)\/(\d+)\/(\d+)/); return m ? new Date(2000 + +m[3], +m[1]-1, +m[2]) : null; };
const notifFmtD = (d) => String(d.getMonth()+1).padStart(2,"0") + "/" + String(d.getDate()).padStart(2,"0") + "/" + String(d.getFullYear()).slice(2);
const notifHours = (r) => { const k = parseInt(String(r.id).replace(/\D/g,""),10) || 1; return 2 + ((k * 37) % 70) / 10; };
function NotifHeadline({ value, growth, goodDown }) {
  const bad = growth && growth.dir !== "flat" && ((growth.dir === "up") === !!goodDown);
  const gc = !growth || growth.dir === "flat" ? { bg:"#f1f3f5", c:"#64748b" } : bad ? { bg:"#fdecec", c:"#c92a2a" } : { bg:"#e9f7ef", c:"#1e8e50" };
  return (
    <span style={{ display:"inline-flex", alignItems:"baseline", gap:8 }}>
      <span style={{ font:"500 20px/1 Roboto", color:"#000" }}>{value}</span>
      {growth && <span style={{ background:gc.bg, color:gc.c, borderRadius:17, padding:"2px 10px", font:"500 12px/16px Roboto", whiteSpace:"nowrap" }}>{growth.dir==="up"?"▲":growth.dir==="down"?"▼":"–"} {growth.pct}%</span>}
    </span>
  );
}
function NotificationsDashboard({ onNav }) {
  const [grain, setGrain] = useDash("week");
  const [tpGrain, setTpGrain] = useDash("week");
  const [hrGrain, setHrGrain] = useDash("week");
  const all = window.NOT_ROWS || [];
  const dates = [...new Set(all.map(r => r.dueDate))];
  const [dateRange, setDateRange] = useDash(() => window.defaultDateRange(dates, 30));
  // Notification rows load after first paint — if the range was picked before they
  // arrived it defaulted to today's window, so re-derive it once the data is in.
  const notifAutoRange = React.useRef(!all.length);
  React.useEffect(() => { if (notifAutoRange.current && all.length) { notifAutoRange.current = false; setDateRange(window.defaultDateRange(dates, 30)); } }, [all.length]);
  const [fieldFilters, setFieldFilters] = useDash([]);
  const byFields = (f) => fieldFilters.length ? f.filter(r => fieldFilters.every(x => x.values.includes(r[x.field]))) : f;
  const rows = React.useMemo(() => { let f = byFields(all); if (dateRange) f = f.filter(r => window.dateInRange(r.dueDate, dateRange)); return f; }, [all, fieldFilters, dateRange]);
  const prevRows = React.useMemo(() => {
    if (!dateRange) return null;
    const s = notifParseD(dateRange.start), e = notifParseD(dateRange.end); if (!s || !e) return null;
    const len = Math.round((e - s) / 86400000) + 1;
    const pe = new Date(s); pe.setDate(pe.getDate() - 1);
    const ps = new Date(pe); ps.setDate(ps.getDate() - (len - 1));
    return byFields(all).filter(r => window.dateInRange(r.dueDate, { start: notifFmtD(ps), end: notifFmtD(pe) }));
  }, [all, fieldFilters, dateRange]);
  const days = (() => { if (!dateRange) return 30; const s = notifParseD(dateRange.start), e = notifParseD(dateRange.end); return s && e ? Math.max(1, Math.round((e - s) / 86400000) + 1) : 30; })();
  const metrics = (rs) => {
    const n = rs.length, sent = rs.filter(r => r.delivery === "delivered");
    const done = sent.length ? sent.reduce((t, r) => t + notifHours(r), 0) / sent.length : 0;
    return { n, rate: n ? sent.length / n * 100 : 0, perDay: n / days, hours: done };
  };
  const cur = metrics(rows), prev = prevRows ? metrics(prevRows) : null;
  const growth = (a, b) => { if (!prev) return null; if (!b) return a ? { pct: 100, dir: "up" } : { pct: 0, dir: "flat" }; const p = (a - b) / b * 100; return { pct: Math.abs(p).toFixed(2), dir: p > 0.005 ? "up" : p < -0.005 ? "down" : "flat" }; };

  const reviewed = window.__notReviewed || {};
  const n = rows.length;
  const sentN = rows.filter(r => r.delivery === "delivered").length;
  const progN = rows.filter(r => r.delivery === "pending").length;
  const failRows = rows.filter(r => r.delivery === "failed");
  const excRows = rows.filter(r => r.delivery === "exception");
  // Notifications the automation couldn't send are the ones to work.
  const failOpen = excRows.filter(r => !reviewed[r.id]);
  const pct = (c) => n ? Math.round(c / n * 100) + "%" : "0%";
  const stats = [
    { label: "All Records", value: p2(n), nav: {} },
    { label: "Sent", pct: pct(sentN), count: p2(sentN), nav: { status: "delivered" } },
    { label: "In Progress", pct: pct(progN), count: p2(progN), nav: { status: "pending" } },
    { label: "Not Sent", pct: pct(failRows.length), count: p2(failRows.length), nav: { status: "failed" } },
    { label: "Exception", pct: pct(excRows.length), count: p2(excRows.length), nav: { status: "exception" } },
  ];

  // Time buckets (by day or Monday-start week) over Notification Initiated Date.
  const bucket = (g) => {
    const m = new Map();
    rows.forEach(r => { const d = notifParseD(r.dueDate); if (!d) return; if (g === "week") d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); const k = d.getTime(); if (!m.has(k)) m.set(k, []); m.get(k).push(r); });
    return [...m.keys()].sort((a, b) => a - b).map(k => ({ label: notifFmtD(new Date(k)), rows: m.get(k) }));
  };
  const ceil4 = (v) => Math.max(4, Math.ceil(v / 4) * 4);
  const volData = bucket(grain).map(b => ({ label: b.label, value: b.rows.length }));
  const volMax = ceil4(Math.max(...volData.map(x => x.value), 1));
  const weeks = bucket("week");
  const rateData = weeks.map(b => ({ label: b.label, value: Math.round(b.rows.filter(r => r.delivery === "delivered").length / b.rows.length * 100) }));
  const wkLabel = (lbl) => { const s = notifParseD(lbl); if (!s) return lbl; const e = new Date(s); e.setDate(e.getDate() + 6); const f = (d) => String(d.getMonth()+1).padStart(2,"0") + "/" + String(d.getDate()).padStart(2,"0"); return f(s) + " – " + f(e); };
  const tpData = bucket(tpGrain).map(b => ({ label: tpGrain === "week" ? wkLabel(b.label) : b.label, value: +(b.rows.length / (tpGrain === "week" ? 7 : 1)).toFixed(1) }));
  const tpMax = Math.max(2, Math.ceil(Math.max(...tpData.map(x => x.value), 1)));
  const hrData = bucket(hrGrain).map(b => { const s = b.rows.filter(r => r.delivery === "delivered"); return { label: b.label, value: s.length ? +(s.reduce((t, r) => t + notifHours(r), 0) / s.length).toFixed(1) : 0 }; });
  const hrMax = ceil4(Math.max(...hrData.map(x => x.value), 1));

  const daysSaved = Math.max(0, Math.round(n * 0.4));
  const cost = [
    ["Total Cost Savings", "$" + (n * 0.072).toFixed(1) + "k"],
    ["FTE Saved", p2(Math.max(1, Math.round(n / 42)))],
    ["No. Of Days Saved", p2(daysSaved)],
  ];

  // Automation action items — unreviewed Needs Attention records only.
  const naOpen = rows.filter(r => r.at === "warning" && !reviewed[r.id]);
  const naGroups = [["terminated", "Terminated", "Business Exception"], ["failed", "Failed", "Technical/Business Exception"]].map(([g, title, sub]) => {
    const gr = naOpen.filter(r => r.atGroup === g); const m = {};
    gr.forEach(r => { if (r.atReason) m[r.atReason] = (m[r.atReason] || 0) + 1; });
    return { g, title, sub, rows: gr, reasons: Object.keys(m).map(k => [k, m[k]]).sort((a, b) => b[1] - a[1]) };
  }).filter(x => x.rows.length);
  const naTotal = naOpen.length;
  const idsOf = (rs) => rs.map(r => r.id);

  // Insight — terminated records whose Physician/Facility has no fax number on file.
  const FAX_REASON = "Physician fax number is not available";
  const noFax = rows.filter(r => r.at === "warning" && r.atGroup === "terminated" && (r.atReason === FAX_REASON || !r.faxNumber));
  const COMM_REASON = "Communication method is not applicable for client";
  const badComm = rows.filter(r => r.at === "warning" && r.atGroup === "terminated" && (r.atReason === COMM_REASON || !r.commMethod));
  const noFaxBy = (() => { const m = {}; noFax.forEach(r => { const k = r.physFacilityName || "Unknown"; (m[k] = m[k] || { name: k, type: r.physFacility, count: 0 }).count++; }); return Object.values(m).sort((a, b) => b.count - a.count); })();
  // Fax sent status — fax-channel notifications by delivery status.
  const faxRows = rows.filter(r => r.commMethod === "F-Fax");
  const faxStatus = [["delivered", "Sent", "#61AA6B"], ["pending", "In Progress", "#618EAA"], ["failed", "Not Sent", "#A3A3A3"], ["exception", "Exception", "#F87D7C"]].map(([k, l, c]) => ({ k, l, c, v: faxRows.filter(r => r.delivery === k).length }));
  // RCN vs Notification.
  const optSplit = [["Notification", "Notification", "#156082"], ["Review Coordination Note (RCN)", "RCN", "#A18B6D"]].map(([k, l, c]) => ({ k, l, c, v: rows.filter(r => r.notifOption === k).length }));
  // Task / Note type mix — straight from the grid's "Task/Note type" column.
  const tcase = (s) => String(s || "").toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase()).replace(/\b(Md|Poc|Rcn|Soc)\b/g, (m) => m.toUpperCase());
  const noteTypes = (() => { const m = {}; rows.forEach(r => { const k = r.taskType || "Unspecified"; m[k] = (m[k] || 0) + 1; }); return Object.keys(m).map(k => ({ label: tcase(k), value: m[k] })).sort((a, b) => b.value - a.value); })();
  // Event type mix — the grid's "Event" column (RCN rows have no event).
  const EVT_PAL = ["#156082","#618EAA","#F8C87C","#A18B6D","#61AA6B","#7C6BD6","#F87D7C","#91DCF7"];
  const evtTypes = (() => { const m = {}; rows.forEach(r => { const k = r.event ? tcase(r.event) : "No Event (RCN)"; m[k] = (m[k] || 0) + 1; }); return Object.keys(m).map(k => [k, m[k]]).sort((a, b) => b[1] - a[1]).map(([k, v], i) => ({ k, l: k, c: EVT_PAL[i % EVT_PAL.length], v })); })();
  const mixH = Math.max(300, 120 + evtTypes.length * 34, 140 + noteTypes.length * 26);
  const donutCard = (title, items, total, center, onPick, h, tip) => (
    <DashCard title={title} info={tip || true} style={{ height: h || 300 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 36, flex: 1 }}>
        <Donut size={180} thickness={30} segments={items.map(x => ({ value: x.v || 0.001, color: x.c }))}
          centerTop={total} centerBottom={center} centerTopSize={18} centerTopWeight={600} centerTopY="47%" centerBottomSize={10} centerBottomWeight={500} centerBottomY="61%" />
        <div style={{ flex: "0 1 240px", minWidth: 0 }}>
          {items.map((x, i) => <div key={x.k} onClick={onPick ? () => onPick(x.k) : undefined} style={{ cursor: onPick ? "pointer" : "default" }}><LegendRow color={x.c} label={x.l} value={x.v + " (" + (total ? Math.round(x.v / total * 100) : 0) + "%)"} divider={i < items.length - 1} /></div>)}
        </div>
      </div>
    </DashCard>
  );

  return (
    <div style={{ display: "flex", alignItems: "stretch" }} data-screen-label="Notifications Dashboard">
      <div style={{ flex: "1 1 0", minWidth: 0 }}>
        <ARVFilterBarChips hideSearch={true}
          datePicker={{ label: "Notification Initiated Date", value: dateRange, available: dates, onChange: setDateRange }}
          filterFields={NOTIF_DASH_FILTER_FIELDS} filterRows={all} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters} />
        <div style={{ padding: "20px 32px 32px" }}>
          <div style={{ font: "500 18px/22px Roboto", color: "#0f172a" }}>Notification Status Summary</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 9, marginTop: 16 }}>
            {stats.map(s => <div key={s.label} style={{ display: "flex", minWidth: 0 }}><PCRStatCard {...s} fill onClick={() => onNav && onNav(s.nav)} /></div>)}
          </div>
          <div className="ws-scrollbody" style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 24, overflowY: "auto", maxHeight: "calc(100vh - 400px)", paddingRight: 4 }}>
            <div style={{ font: "500 16px/20px Roboto", color: "#3A424A" }}>Notification Transaction Analytics</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gridAutoRows: "300px", gap: 18 }}>
              {donutCard("Fax Sent Status", faxStatus, faxRows.length, "FAX RECORDS", (k) => onNav && onNav({ status: k }), null, "Fax-channel notifications in the selected period, split by delivery status. Click a legend row to open those records.")}
              {donutCard("RCN vs Notification", optSplit, n, "RECORDS", null, null, "Share of records initiated as a Notification vs. a Review Coordination Note (RCN).")}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18, alignItems: "stretch" }}>
            {donutCard("Notifications By Event Type", evtTypes, n, "RECORDS", null, mixH, "Records grouped by triggering event (EOE, Discharge, Transfer, etc.). RCN records carry no event.")}
            <DashCard title="Notifications By Task / Note Type" info="Records grouped by Task / Note type, as shown in the Notifications View grid." style={{ height: mixH }} bodyStyle={{ paddingTop: 10 }}>
              {noteTypes.length
                ? <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}><HBarChart labelW={210} data={noteTypes.map(x => ({ ...x, color: "#618EAA" }))} xLabel="No. Of Records" /></div>
                : <div style={{ font: "400 13px/18px Roboto", color: "#8A94A6" }}>No records in this period.</div>}
            </DashCard>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gridAutoRows: "320px", gap: 18 }}>
              <DashCard title="Overall Transaction Volume" info="Total notification transactions initiated per day or week. Headline compares against the previous period of equal length." style={{ height: 320 }} bodyStyle={{ paddingTop: 10 }}
                right={<span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}><NotifHeadline value={cur.n} growth={growth(cur.n, prev && prev.n)} /><PickerBtn options={[["day", "By Day"], ["week", "By Week"]]} value={grain} onChange={setGrain} /></span>}>
                <SimpleLineChart data={volData} max={volMax} step={volMax / 4} yLabel="No. Of Transactions" color="#7C6BD6" />
              </DashCard>
              <DashCard title="Overall Success Rate" info="Percent of transactions with Sent status, per week. Headline compares against the previous period." style={{ height: 320 }} bodyStyle={{ paddingTop: 10 }}
                right={<NotifHeadline value={cur.rate.toFixed(2) + "%"} growth={growth(cur.rate, prev && prev.rate)} />}>
                <SimpleLineChart data={rateData} max={100} step={25} yLabel="Success Rate (%)" color="#61AA6B" />
              </DashCard>
              <DashCard title={<>Throughput Per Day<InfoTip text="Average transactions processed per day, bucketed by day or week. Headline compares against the previous period." /><span style={{ marginLeft: 8 }}><NotifHeadline value={cur.perDay.toFixed(1)} growth={growth(cur.perDay, prev && prev.perDay)} /></span></>} style={{ height: 320 }} bodyStyle={{ paddingTop: 10 }}
                right={<PickerBtn options={[["day", "By Day"], ["week", "By Week"]]} value={tpGrain} onChange={setTpGrain} />}>
                <SimpleBarChart data={tpData} max={tpMax} step={tpMax / 4} yLabel="Transactions / Day" color="#618EAA" barW={38} />
              </DashCard>
              <DashCard title={<>Avg. Trans. Completion Time<InfoTip text="Average hours from initiation to Sent, for Sent transactions only. Lower is better." /><span style={{ marginLeft: 8 }}><NotifHeadline value={cur.hours.toFixed(2) + " hrs"} growth={growth(cur.hours, prev && prev.hours)} goodDown /></span></>} style={{ height: 320 }} bodyStyle={{ paddingTop: 10 }}
                right={<PickerBtn options={[["day", "By Day"], ["week", "By Week"]]} value={hrGrain} onChange={setHrGrain} />}>
                <SimpleBarChart data={hrData} max={hrMax} step={hrMax / 4} yLabel="Hrs" color="#A18B6D" barW={38} />
              </DashCard>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 2, width: 560, flexShrink: 0, background: "#fff", boxShadow: "-10px 0 24px 0 #1C2D420C" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 51, background: "#FFF1F1" }} />
        <div style={{ position: "relative", padding: "16px 20px 28px 32px", display: "flex", flexDirection: "column", minHeight: "calc(100vh - 190px)" }}>
          <div style={{ background: "#fff", border: "1px solid #F3E0E0", borderRadius: 9, boxShadow: "0 1px 3px rgba(86,86,86,.06)", display: "flex", alignItems: "center", padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <WarnGlyph />
              <span style={{ font: "500 19px/23px Roboto", color: "#3A424A" }}>Notification Action Items</span>
            </div>
            <span style={{ marginLeft: "auto", font: "400 15px/20px Roboto", color: "#6A717D" }}><span style={{ color: "#CF1322" }}>{naTotal + failOpen.length} Items</span> Needs Review</span>
          </div>
          <BigActionRow label="Exception - Fax Status" count={p2(failOpen.length)} onClick={() => onNav && onNav({ ids: idsOf(failOpen), label: "Exception - Fax Status", dateRange })} />
          <div style={{ display: "flex", alignItems: "center", marginTop: 8, marginBottom: 12 }}>
            <span style={{ font: "500 18px/22px Roboto", color: "#3A424A" }}>Automation Action Items</span>
            <span style={{ marginLeft: "auto" }}><SortByBtn /></span>
          </div>
          <div className="ws-scrollbody" style={{ border: "1px solid #F1E4E4", borderRadius: 9, background: "#fff", overflow: "hidden auto", boxShadow: "0 1px 3px rgba(86,86,86,.06)", flex: "1 1 auto", minHeight: 0 }}>
            <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #F1E4E4", padding: "0 18px" }}>
              <span style={{ padding: "14px 4px 12px", display: "inline-flex", alignItems: "center", gap: 8, font: "500 15px/20px Roboto", color: "#3A424A", borderBottom: "2px solid #CF1322", marginBottom: -1 }}>
                Needs Attention
                <span style={{ background: "#CF1322", color: "#fff", borderRadius: 999, padding: "1px 8px", font: "500 12px/18px Roboto" }}>{p2(naTotal)}</span>
              </span>
            </div>
            {naGroups.length ? naGroups.map((grp, gi) => (
              <AutomationGroup key={grp.g} title={grp.title} sub={grp.sub} count={p2(grp.rows.length)} defaultOpen={gi === 0}
                onNav={() => onNav && onNav({ ids: idsOf(grp.rows), label: grp.title + " - " + grp.sub, dateRange })}>
                {grp.reasons.map(([reason, c]) => <AutomationItem key={reason} label={reason} count={p2(c)} onClick={() => onNav && onNav({ ids: idsOf(grp.rows.filter(r => r.atReason === reason)), label: reason, dateRange })} />)}
              </AutomationGroup>
            )) : <div style={{ padding: "18px", font: "400 14px/20px Roboto", color: "#8A94A6" }}>No open Needs Attention records</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Eligibility sub-dashboards (Alerts / HO Intake) — HCHB section data ──
const ESD_COV = ["active", "inactive", "exception"];
function eligSectionRows(section) {
  const H = window.HCHB;
  if (H && H.ervSectionRows) { try { return H.ervSectionRows(section); } catch (e) {} }
  const pool = (H && H.ERV_ROWS) || window.ERV_ROWS || [];
  return pool.slice(0, 14).map((r, i) => {
    const c = { id: section + "-" + r.id, name: r.name, mrn: r.mrn, agency: r.agency, branch: r.branch, episodeId: r.episodeId || ("EP" + String(100340 + i)),
      ehrSync: i % 5 !== 0, at: ["thumb", "warning", "inprogress"][i % 3], alerts: i % 3 === 0 ? 2 : 0, eligInit: r.eligInit, cov: ESD_COV[i % 3], alertStatus: ["open", "adjudicated", "escalated"][i % 3] };
    if (section === "alert") return { ...c, serviceLine: r.serviceLine || "Skilled Nursing", payorSrc: r.payorSrc || "NGS PDGM", payorType: ["Medicare", "Medicaid", "Commercial", "Managed Care"][i % 4], wfVerified: i % 4 === 2 ? "No" : "Yes", ehrStage: ["Obtain payor source verification", "Review eligibility alert"][i % 2] };
    return { ...c, hchbStage: ["Obtain payor source verification", "Review eligibility alert"][i % 2], reqEval: r.eligInit, socDate: r.soc, policyNo: r.memId || ("POL" + String(778100 + i)), benefitPeriod: ["1", "2", "3", "4"][i % 4], discharges: i % 3, f2f: i % 3 !== 1 ? "Yes" : "No", eobType: ["New", "Discharge"][i % 2], discrepancy: i % 5 === 1 ? "Yes" : "No" };
  });
}
window.eligSectionRows = eligSectionRows;
function EligSectionDashboard({ section, onNav }) {
  const isAlert = section === "alert";
  const all = React.useMemo(() => eligSectionRows(section), [section, !!window.HCHB]);
  const dates = [...new Set(all.map(r => r.eligInit).filter(Boolean))];
  const [dateRange, setDateRange] = useDash(null);
  const [fieldFilters, setFieldFilters] = useDash([]);
  React.useEffect(() => { setDateRange(null); setFieldFilters([]); }, [section]);
  const fields = isAlert ? [{ key: "agency", label: "Agency" }, { key: "branch", label: "Branch" }, { key: "payorType", label: "Payor Type" }] : [{ key: "agency", label: "Agency" }, { key: "branch", label: "Branch" }, { key: "eobType", label: "EOB Type" }];
  const rows = all.filter(r => fieldFilters.every(x => x.values.includes(r[x.field]))).filter(r => !dateRange || window.dateInRange(r.eligInit, dateRange));
  const n = rows.length, pct = (c) => n ? Math.round(c / n * 100) + "%" : "0%";
  const count = (k, v) => rows.filter(r => r[k] === v).length;
  const go = (nav) => onNav && onNav({ section, ...nav });
  const bizK = isAlert ? "alertStatus" : "cov";
  const stats = [{ label: "All Records", value: p2(n), onClick: () => go({}) }, ...(isAlert ? [["open", "Open"], ["adjudicated", "Adjudicated"], ["escalated", "Escalated"]] : [["active", "Active"], ["inactive", "Inactive"], ["exception", "Exception"]]).map(([k, l]) => ({ label: l, pct: pct(count(bizK, k)), count: p2(count(bizK, k)), onClick: () => go({ biz: k }) }))];
  const split = (k, defs) => defs.map(([v, l, c]) => ({ k: v, l, c, v: count(k, v) }));
  const donut = (title, items, center) => { const tot = items.reduce((s, x) => s + x.v, 0); return (
    <DashCard title={title} info style={{ height: 300 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 36, flex: 1 }}>
        <Donut size={180} thickness={30} segments={items.map(x => ({ value: x.v || 0.001, color: x.c }))} centerTop={tot} centerBottom={center} centerTopSize={18} centerTopWeight={600} centerTopY="47%" centerBottomSize={10} centerBottomWeight={500} centerBottomY="61%" />
        <div style={{ flex: "0 1 240px", minWidth: 0 }}>{items.map((x, i) => <LegendRow key={x.k} color={x.c} label={x.l} value={x.v + " (" + (tot ? Math.round(x.v / tot * 100) : 0) + "%)"} divider={i < items.length - 1} />)}</div>
      </div>
    </DashCard>); };
  const bars = (title, key) => { const m = {}; rows.forEach(r => { const v = String(r[key] ?? "—"); m[v] = (m[v] || 0) + 1; }); const list = Object.entries(m).sort((a, b) => b[1] - a[1]); const mx = Math.max(1, ...list.map(x => x[1])); return (
    <DashCard title={title} info style={{ height: 300 }} bodyStyle={{ justifyContent: "flex-start", paddingTop: 8 }}>
      <div>{list.map(([l, v]) => <BarRow key={l} label={l} value={v} max={mx} />)}</div>
    </DashCard>); };
  const naRows = rows.filter(r => r.at === "warning");
  const items = isAlert
    ? [["Alerts - Open", count("alertStatus", "open"), { biz: "open" }], ["Alerts - Escalated", count("alertStatus", "escalated"), { biz: "escalated" }], ["Alerts - Workflow Not Verified", count("wfVerified", "No"), { field: "wfVerified", value: "No", label: "Workflow Verified: No" }]]
    : [["HO Intake - Discrepancy Found", count("discrepancy", "Yes"), { field: "discrepancy", value: "Yes", label: "Discrepancy: Yes" }], ["HO Intake - F2F Required", count("f2f", "Yes"), { field: "f2f", value: "Yes", label: "F2F Required: Yes" }], ["HO Intake - Open Eligibility Alerts", rows.filter(r => r.alerts > 0).length, { field: "alerts", gt0: true, label: "Eligibility Alerts: True" }]];
  const total = items.reduce((s, x) => s + x[1], 0) + naRows.length;
  return (
    <div style={{ display: "flex", alignItems: "stretch" }} data-screen-label={isAlert ? "Eligibility Alerts Dashboard" : "HO Intake Dashboard"}>
      <div style={{ flex: "1 1 0", minWidth: 0 }}>
        <ARVFilterBarChips hideSearch={true} datePicker={{ label: "Elig Initiated Date", value: dateRange, available: dates, onChange: setDateRange }}
          filterFields={fields} filterRows={all} fieldFilters={fieldFilters} onFieldFilters={setFieldFilters} />
        <div style={{ padding: "20px 32px 32px" }}>
          <div style={{ font: "500 18px/22px Roboto", color: "#0f172a" }}>{isAlert ? "Alert Status Summary" : "Coverage Status Summary"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 9, marginTop: 16 }}>
            {stats.map(s => <div key={s.label} style={{ display: "flex", minWidth: 0 }}><PCRStatCard {...s} fill /></div>)}
          </div>
          <div className="ws-scrollbody" style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 24, overflowY: "auto", maxHeight: "calc(100vh - 400px)", paddingRight: 4 }}>
            <div style={{ font: "500 16px/20px Roboto", color: "#3A424A" }}>{isAlert ? "Alert Adjudication Analytics" : "HO Intake Analytics"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gridAutoRows: "300px", gap: 18 }}>
              {isAlert ? <>
                {donut("Alert Status Breakup", split("alertStatus", [["open", "Open", "#F8C87C"], ["adjudicated", "Adjudicated", "#61AA6B"], ["escalated", "Escalated", "#F87D7C"]]), "ALERTS")}
                {donut("Workflow Verified", split("wfVerified", [["Yes", "Verified", "#156082"], ["No", "Not Verified", "#A18B6D"]]), "RECORDS")}
                {bars("Payor Type Distribution", "payorType")}
                {bars("EHR Stage", "ehrStage")}
              </> : <>
                {donut("Coverage Status", split("cov", [["active", "Active", "#61AA6B"], ["inactive", "Inactive", "#F87D7C"], ["exception", "Exception", "#F8C87C"]]), "RECORDS")}
                {donut("F2F Required", split("f2f", [["Yes", "Required", "#156082"], ["No", "Not Required", "#91DCF7"]]), "RECORDS")}
                {donut("EOB Type", split("eobType", [["New", "New", "#618EAA"], ["Discharge", "Discharge", "#A18B6D"]]), "RECORDS")}
                {bars("Admit Benefit Period", "benefitPeriod")}
              </>}
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: "relative", zIndex: 2, width: 560, flexShrink: 0, background: "#fff", boxShadow: "-10px 0 24px 0 #1C2D420C" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 51, background: "#FFF1F1" }} />
        <div style={{ position: "relative", padding: "16px 20px 28px 32px", display: "flex", flexDirection: "column", minHeight: "calc(100vh - 190px)" }}>
          <div style={{ background: "#fff", border: "1px solid #F3E0E0", borderRadius: 9, boxShadow: "0 1px 3px rgba(86,86,86,.06)", display: "flex", alignItems: "center", padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><WarnGlyph /><span style={{ font: "500 19px/23px Roboto", color: "#3A424A" }}>{isAlert ? "Alert Action Items" : "HO Intake Action Items"}</span></div>
            <span style={{ marginLeft: "auto", font: "400 15px/20px Roboto", color: "#6A717D" }}><span style={{ color: "#CF1322" }}>{total} Items</span> Needs Review</span>
          </div>
          {items.map(([l, c, nav]) => <BigActionRow key={l} label={l} count={p2(c)} onClick={() => go(nav)} />)}
          <div style={{ display: "flex", alignItems: "center", marginTop: 8, marginBottom: 12 }}><span style={{ font: "500 18px/22px Roboto", color: "#3A424A" }}>Automation Action Items</span></div>
          <BigActionRow label="Needs Attention" count={p2(naRows.length)} onClick={() => go({ at: "warning" })} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardView, AssessmentDashboard, EligSectionDashboard });
