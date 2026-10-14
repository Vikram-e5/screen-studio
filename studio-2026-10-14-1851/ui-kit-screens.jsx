// WellSky UI kit — screens
const { useState: useS } = React;

function Dashboard({ onPatient }) {
  return (
    <div style={{padding:24,display:"grid",gridTemplateColumns:"1fr 640px",gap:20,background:"#fff"}}>
      <div>
        <FilterBar filters={["Elig Initiated Date : 02/13/25 – 03/13/25","Payor : UHC, Aetna","Agency : All"]} />
        <div style={{marginTop:20,font:"500 14px/18px Roboto",color:"#266CA0"}}>Coverage Summary — <span style={{color:"#0184F7"}}>All Elig Requests ▾</span></div>
        <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
          <KPIChip label="All Patients" value="120" tone="blue" />
          <KPIChip label="Pending Submission" value="02" tone="warning" />
          <KPIChip label="Active" value="115" tone="active" />
          <KPIChip label="Inactive" value="01" tone="inactive" />
          <KPIChip label="Mixed" value="01" tone="blue" />
          <KPIChip label="Exceptions" value="01" tone="danger" />
          <KPIChip label="Eligibility Alerts" value="02" tone="danger" />
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:20}}>
          <Card title="Eligibility Status Summary">
            <div style={{display:"flex",alignItems:"center",gap:20}}>
              <div style={{flex:1}}>
                <div style={{font:"400 13px/16px Roboto",color:"#3A424A"}}>Total Coverage Status <span style={{float:"right",font:"500 13px Roboto"}}>348</span></div>
                <div style={{marginTop:12,display:"flex",gap:10,alignItems:"center"}}><span style={{width:10,height:10,background:"#389E0D"}}></span><span style={{flex:1}}>Active Coverage</span><span style={{fontWeight:500}}>264</span></div>
                <div style={{marginTop:6,display:"flex",gap:10,alignItems:"center"}}><span style={{width:10,height:10,background:"#CF1322"}}></span><span style={{flex:1}}>Inactive Coverage</span><span style={{fontWeight:500}}>84</span></div>
                <div style={{marginTop:6,display:"flex",gap:10,alignItems:"center"}}><span style={{width:10,height:10,background:"#91CAFF"}}></span><span style={{flex:1}}>Mixed Coverage</span><span style={{fontWeight:500}}>01</span></div>
              </div>
              <DonutChart />
            </div>
          </Card>
          <Card title="Eligibility Alert Summary" right={<span style={{color:"#1677FF",font:"500 12px Roboto",cursor:"pointer"}}>Sort by ▾</span>}>
            <BarRow label="Inactive coverage" value={54} />
            <BarRow label="Payor Mapping incorrect in EHR" value={44} />
            <BarRow label="Additional Coverage Detected" value={39} />
            <BarRow label="Patient outside of coverage area" value={36} />
            <BarRow label="DOB Mismatch" value={28} />
          </Card>
          <Card title="Payor Type Distribution">
            <div style={{display:"flex",alignItems:"center",gap:20}}>
              <DonutChart label="120 PATIENTS" value={120} size={140} color="#266CA0" />
              <div style={{flex:1,font:"400 13px/22px Roboto"}}>
                <div><span style={{width:10,height:10,background:"#266CA0",display:"inline-block",marginRight:8}}></span>Medicare <span style={{float:"right",fontWeight:500}}>42%</span></div>
                <div><span style={{width:10,height:10,background:"#91CAFF",display:"inline-block",marginRight:8}}></span>Medicare Adv <span style={{float:"right",fontWeight:500}}>26%</span></div>
                <div><span style={{width:10,height:10,background:"#FFD666",display:"inline-block",marginRight:8}}></span>Medicaid <span style={{float:"right",fontWeight:500}}>22%</span></div>
                <div><span style={{width:10,height:10,background:"#C6A78F",display:"inline-block",marginRight:8}}></span>Commercial <span style={{float:"right",fontWeight:500}}>10%</span></div>
              </div>
            </div>
          </Card>
          <Card title="Payor Distribution">
            <div style={{display:"flex",alignItems:"center",gap:20}}>
              <DonutChart label="120 PATIENTS" value={120} size={140} color="#266CA0" />
              <div style={{flex:1,font:"400 13px/22px Roboto"}}>
                <div><span style={{width:10,height:10,background:"#91CAFF",display:"inline-block",marginRight:8}}></span>UHC <span style={{float:"right",fontWeight:500}}>42%</span></div>
                <div><span style={{width:10,height:10,background:"#C6A78F",display:"inline-block",marginRight:8}}></span>Others <span style={{float:"right",fontWeight:500}}>22%</span></div>
                <div><span style={{width:10,height:10,background:"#276966",display:"inline-block",marginRight:8}}></span>Aetna <span style={{float:"right",fontWeight:500}}>26%</span></div>
                <div><span style={{width:10,height:10,background:"#FFD666",display:"inline-block",marginRight:8}}></span>Anthem <span style={{float:"right",fontWeight:500}}>10%</span></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <div>
        <Card elevated style={{marginTop:0}}>
          <div style={{margin:"-4px -20px 0",background:"rgba(255,231,230,.65)",padding:"12px 16px",display:"flex",justifyContent:"space-between",font:"500 14px Roboto",color:"#3A424A"}}>
            <span><span style={{color:"#CF1322",marginRight:6}}>▲</span>Action Items</span>
            <span style={{font:"400 12px Roboto",color:"#6A717D"}}>78 Items Needs Review</span>
          </div>
          <div style={{margin:"0 -20px"}}>
            <ActionItemRow label="Eligibility - Pending Submission" count={2} />
            <ActionItemRow label="Eligibility - Due For Follow Up" count={5} />
          </div>
          <div style={{padding:"12px 0 6px",font:"500 14px Roboto",color:"#3A424A",display:"flex",justifyContent:"space-between"}}>
            <span>Eligibility Alert - Action Items <span style={{background:"#FFE7E6",color:"#CF1322",borderRadius:999,padding:"1px 7px",font:"500 12px Roboto",marginLeft:6}}>69</span></span>
            <span style={{color:"#1677FF",font:"500 12px Roboto",cursor:"pointer"}}>Sort by ▾</span>
          </div>
          <div style={{margin:"0 -20px"}}>
            <ActionItemRow label="Policy with future activation date" count={19} onClick={()=>onPatient&&onPatient()} />
            <ActionItemRow label="Patient name mismatch in EHR" count={14} alt onClick={()=>onPatient&&onPatient()} />
            <ActionItemRow label="Policy is not patient's primary insurance" count={11} />
            <ActionItemRow label="Patient has other active insurance" count={9} alt />
            <ActionItemRow label="Payor mapping incorrect in EHR" count={7} />
            <ActionItemRow label="Coverage is inactive" count={1} />
            <ActionItemRow label="Agency is not within plan's service area" count={3} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function AuthReqView({ onPatient }) {
  const rows = [
    {patient:"Marvin McKinney",mrn:"102-884-19",payor:"UHC",auth:"AUTH-8842",status:{k:"green",t:"Approved"},date:"03/13/25"},
    {patient:"Esther Howard",mrn:"102-884-22",payor:"Aetna",auth:"AUTH-8851",status:{k:"red",t:"Needs Attention"},date:"03/12/25",_attention:true},
    {patient:"Wade Warren",mrn:"102-884-31",payor:"Anthem",auth:"AUTH-8859",status:{k:"gold",t:"Pending"},date:"03/12/25"},
    {patient:"Jane Cooper",mrn:"102-884-44",payor:"Medicare",auth:"AUTH-8867",status:{k:"teal",t:"Up For Recert"},date:"03/11/25"},
    {patient:"Brooklyn Simmons",mrn:"102-884-51",payor:"UHC",auth:"AUTH-8871",status:{k:"red",t:"Denied"},date:"03/11/25",_attention:true},
    {patient:"Leslie Alexander",mrn:"102-884-60",payor:"Medicaid",auth:"AUTH-8878",status:{k:"purple",t:"Processing"},date:"03/11/25"},
    {patient:"Guy Hawkins",mrn:"102-884-71",payor:"Medicare",auth:"AUTH-8884",status:{k:"green",t:"Approved"},date:"03/10/25"},
    {patient:"Robert Fox",mrn:"102-884-77",payor:"Aetna",auth:"AUTH-8891",status:{k:"gold",t:"Partial Approval"},date:"03/10/25"},
  ];
  const cols = [
    {label:"Patient · MRN",w:"28%",render:r=>(<div><div style={{fontWeight:500}}>{r.patient}</div><div style={{color:"#6A717D",fontSize:12}}>MRN {r.mrn}</div></div>)},
    {label:"Payor",key:"payor",w:"12%"},
    {label:"Auth #",key:"auth",w:"14%"},
    {label:"Status",w:"18%",render:r=>(<StatusTag kind={r.status.k}>{r.status.t}</StatusTag>)},
    {label:"Last Update",key:"date",w:"14%"},
    {label:"Action",w:"14%",render:()=>(<a href="#" style={{color:"#1677FF",textDecoration:"none",font:"500 13px Roboto"}}>View Details</a>)},
  ];
  return (
    <div style={{padding:24,background:"#fff"}}>
      <FilterBar filters={["Auth Date : 02/01/25 – 03/13/25","Payor : All","Status : All","Agency : All"]} />
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:20,marginBottom:12}}>
        <div style={{font:"500 18px/22px Roboto",color:"#3A424A"}}>Auth Request View <span style={{font:"400 13px Roboto",color:"#6A717D",marginLeft:8}}>348 results</span></div>
        <div style={{display:"flex",gap:8}}>
          <Button kind="default" small>Export</Button>
          <Button kind="primary" small>New Auth Request</Button>
        </div>
      </div>
      <DataTable columns={cols} rows={rows} onRowClick={()=>onPatient&&onPatient()} />
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12,font:"400 12px Roboto",color:"#6A717D"}}>
        <span>Showing 1–8 of 348</span>
        <div style={{display:"flex",gap:4}}>
          {["‹","1","2","3","4","5","›"].map((p,i)=>(<span key={i} style={{padding:"4px 10px",border:`1px solid ${i===1?'#1677FF':'#D8D8D8'}`,borderRadius:4,color:i===1?'#1677FF':'#3A424A',cursor:"pointer"}}>{p}</span>))}
        </div>
      </div>
    </div>
  );
}

function PatientDetail({ onClose }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(28,45,66,.35)",zIndex:50,display:"flex",justifyContent:"flex-end"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:720,height:"100%",background:"#fff",boxShadow:"-22px 0 26px rgba(86,86,86,.09)",overflow:"auto"}}>
        <div style={{padding:"18px 24px",borderBottom:`1px solid #E8E9EA`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{font:"500 20px/24px Roboto",color:"#3A424A"}}>Marvin McKinney</div>
            <div style={{font:"400 13px Roboto",color:"#6A717D"}}>MRN 102-884-19 · DOB 03/14/1962 · Medicare</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#6A717D"}}>✕</button>
        </div>
        <div style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>
          <Card title="Coverage Summary" subtitle="Medicare (Primary)">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,font:"400 13px/18px Roboto"}}>
              <div><div style={{color:"#6A717D"}}>Part A</div><div style={{fontWeight:500}}>Active since 05/01/2020</div></div>
              <div><div style={{color:"#6A717D"}}>Part B</div><div style={{fontWeight:500}}>Active since 05/01/2020</div></div>
              <div><div style={{color:"#6A717D"}}>Plan</div><div style={{fontWeight:500}}>Traditional Medicare</div></div>
              <div><div style={{color:"#6A717D"}}>Policy #</div><div style={{fontWeight:500}}>1EG4-TE5-MK72</div></div>
            </div>
          </Card>
          <Card title="Deductibles">
            <div style={{font:"400 13px/20px Roboto"}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span>Annual Deductible</span><span style={{fontWeight:500}}>$1,632.00</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span>Met to date</span><span style={{fontWeight:500}}>$640.00</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span>Remaining</span><span style={{fontWeight:500,color:"#CF1322"}}>$992.00</span></div>
              <div style={{height:8,background:"#EEF0F3",borderRadius:2,marginTop:8,overflow:"hidden"}}><div style={{width:"39%",height:"100%",background:"#0E91C6"}}></div></div>
            </div>
          </Card>
          <Card title="Copay — Home Health Episodes">
            <div style={{font:"400 13px/20px Roboto"}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span>Skilled Nursing</span><span style={{fontWeight:500}}>$20 / visit</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span>Physical Therapy</span><span style={{fontWeight:500}}>$20 / visit</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span>Home Health Aide</span><span style={{fontWeight:500}}>$0</span></div>
            </div>
          </Card>
          <Card title="Activity">
            <div style={{font:"400 13px/20px Roboto",color:"#3A424A"}}>
              <div>03/13/25 · <span style={{color:"#6A717D"}}>Eligibility refreshed — Active</span></div>
              <div>03/01/25 · <span style={{color:"#6A717D"}}>Auth AUTH-8842 approved</span></div>
              <div>02/18/25 · <span style={{color:"#6A717D"}}>Patient record reconciled with EHR</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [screen, setScreen] = useS("dashboard");
  const [sub, setSub] = useS(0);
  const [patient, setPatient] = useS(false);
  return (
    <div style={{minHeight:"100vh",background:"#fff",font:"400 14px/18px Roboto"}}>
      <Header active={screen==="dashboard"?"dashboard":"auth"} onNav={setScreen} />
      <SubHeader active={sub} onSub={setSub} title={screen==="dashboard"?"Summary of Eligibility Request Status":"List of Authorization Requests"} />
      {screen==="dashboard" ? <Dashboard onPatient={()=>setPatient(true)} /> : <AuthReqView onPatient={()=>setPatient(true)} />}
      {patient && <PatientDetail onClose={()=>setPatient(false)} />}
    </div>
  );
}

Object.assign(window,{App,Dashboard,AuthReqView,PatientDetail});
