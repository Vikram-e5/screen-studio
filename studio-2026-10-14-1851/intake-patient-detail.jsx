// Intake — Patient Detail slider. Same chrome as the Eligibility patient drawer
// (97vw right slide-out, patient banner, boxed tab bar) with a single Intake tab.
const { useState: useIPD, useRef: useIPDRef } = React;

const IPD_BASE = {
  BasicInfo:{ BranchAssignment:{ Branch:"BTC - BEAUMONT HOMECARE", Team:"E-BLUE", location:"E-BLUE" }, PatientName:{ LastName:"DOE", FirstName:"JOHN", MI:"A" }, InformationList:[{ Information:"Enter team as location for BTC or NKC branches." }] },
  Demographics:{
    PersonalInformation:{ Gender:"Male", DateOfBirth:"01/15/1950", SSN:"123-45-6789", LegacyMRNumber:"MR12345678" },
    service_location:{ ServiceLocationType:"Home/Primary Residence", FacilityName:null, Address:"1234 Elm Street", City:"Detroit", State:"MI", Zip:"48201", Phone:"+1 (313) 555-0199", Mobile:"+1 (313) 555-0199", Floor:null, RoomNo:null, VisitInstructions:"Call before visit.", PatientApprovalReceivedForWebAccess:"Yes" },
    PatientContactInformation:{ PrimaryPhone:"(313) 555-0199", AlternatePhone:"(313) 555-5678", MobilePhone:"(313) 555-0199", EmailAddress:"john.doe@example.com" },
    ContactInformation:[{ ContactType:"EMERGENCY CONTACT 1", RelationshipToPatient:"Spouse", LastName:"Doe", FirstName:"Jane", PrimaryPhone:"(313) 555-1234", AlternatePhone:"(313) 555-5678", Email:"jane.doe@example.com", Notes:"Available after 5 PM" }],
    InformationList:[{ Information:"Patient approval for web access received." }],
    EOB:{ Type:"New", Date:"07/15/2025", SOC:"07/15/2025", SOE:"07/15/2025", NumberOfDischarge:"0", Discharges:[{ DischargeDate1:"07/20/2025", LastDayOfService1:"07/19/2025", DischargeDate2:"08/20/2025", LastDayOfService2:"08/19/2025", DischargeDate3:"09/20/2025", LastDayOfService3:"09/19/2025", DischargeDate4:"10/20/2025", LastDayOfService4:"10/19/2025", DischargeDate5:"11/20/2025", LastDayOfService5:"11/19/2025" }] },
  },
  ReferralSource:{
    ReferralInformation:{ ReferralDate:"07/15/2025", ReferralTakenBy:"CLIENT REFERRAL PRODUCT", ReferralSources:"Facility", ReferralFacility:"DETROIT MEDICAL CENTER", ReferralPhysician:"DETROIT MEDICAL CENTER", ReferralFacilityContact:null, ReferralPhysicianContact:null, ReferralProviderAddress:{ street_address:"3990 John R St", city:"Detroit", state:"MI", zip:"48201", phone_number:"(313) 745-5000" } },
    CareTypes:[{ CareType:"MEDICATION HISTORY CONSENT", EffectiveFrom:"07/16/2025" }],
  },
  OtherInformation:{ HomecareCoordinator:"Jessica Morgan", ClinicalIntakeSpecialist:"Kevin Harris" },
  PayorSources:{
    PayorSource:[{ Payor_Source:"PDGM - BCBS MEDICARE PLUS BLUE", AdditionalInformation:"Primary", PayorType:"MEDICARE MANGD CARE - EPISODIC", MBI:"MPB123456789", MedicaidNumber:"MPB123456789", PolicyNumber:"MPB123456789", PointOfOrigin:"01 - NON-HEALTH CARE FACILITY/PHYSICIAN REFERRAL", PatientTransferredFromAnotherHHA:"True",
      InsuredPartyInfoforPayorSource:{ RelationshipToInsured:"Self", Gender:"Male", LastName:"DOE", FirstName:"JOHN", DateOfBirth:"01/15/1950", Address:"1234 Elm Street, Detroit, MI, 48201", InsuredPhoneNumber:"(313) 555-0199", Email:"jane.doe@example.com" },
      Authorization:{ ProgramName:"PDGM Home Health", AuthorizationNumber:"AUTH-123456", AuthorizationStartDate:"07/15/2025", AuthorizationEndDate:"10/15/2025", AuthorizationRequestedDate:"07/10/2025", FollowUpOnPendingDue:"07/20/2025", Comments:"Pending clinical review", AuthorizationDetailLine:[{ BillingCodes:"G0151", QtyPerPeriod:"3" }] } }],
    InformationList:[{ Information:"Point of Origin: 01 - NON-HEALTH CARE FACILITY/PHYSICIAN REFERRAL" }],
  },
  Physicians:{ Physician:[{ LastName:"Smith", FirstName:"Emily", PrimaryPhysician:"Yes", ContactNumber:"(313) 555-8888", Address:"5678 Oak Medical Blvd, Suite 100, Detroit, MI 48201", NPI:"1234567890", MedicalDirector:"Yes" }] },
  Diagnoses:{ Diagnosis:[{ ICD10Code:"Z47.89", PrimaryDiagnosis:"Yes", Description:"Encounter for other orthopedic aftercare", DiagnosisType:"Exacerbation", Date:"07/15/2025" }] },
  ClinicalIntakeNotes:{ Notes:"SOC clinician to verify discharge date. Patient s/p right knee replacement. Ordered: PT/OT. Fresh ortho case." },
  Scheduling:{ EvaluationVisits:{ RequestedDateOfEvaluation:"07/17/2025", SkilledDisciplines:"PT, OT" } },
  Clinical:{
    InpatientEvents:{ Facility:"DETROIT MEDICAL CENTER", facility_admit_date:"07/13/2025", DischargeDate:"07/15/2025" },
    is_observation:false,
    OtherFacilities:{ Facility:"DETROIT MEDICAL CENTER", FacilityType:"HOSPITAL", PatientApprovalReceivedForWebAccess:"Yes" },
    InstructionList:[{ Instruction:"Use Inpatient Facility for Other Facility as well." }],
    PatientInformation:{ InitialDocumentationStatus:"NOT VERIFIED", PendingReason:"HH - WAITING ON PCP VERIFICATION" },
  },
  Attachments:[{ URL:"https://prod-client-phi-api-management.azure-api.net/element-5/attachments/78344022_cover.pdf", FileType:".pdf", AttachmentType:"", Location:"", Comments:"", EffectiveDateRange:{ FromDate:"", ToDate:"" } }],
  DataEntryStatus:"Pending", PatientID:"4001234", UniversalPatientID:"9980099",
  ReferralDocumentFileName:"referral-document-pacc_001_9980099_4001234.pdf",
  RPA_Chart_Status:"100", RPA_Event_Status_Reason:"[]:",
};

// Row-specific values override the sample payload so each patient reads as their own record.
function ipdPayloadFor(row) {
  const d = JSON.parse(JSON.stringify(IPD_BASE));
  const [first, ...rest] = (row.name||"").split(" ");
  d.BasicInfo.PatientName = { LastName:rest.join(" ").toUpperCase(), FirstName:(first||"").toUpperCase(), MI:"" };
  Object.assign(d.Demographics.PersonalInformation, { Gender:row.gender, DateOfBirth:row.dob, LegacyMRNumber:row.mrn });
  d.Demographics.service_location.Zip = row.zip;
  d.PayorSources.PayorSource[0].PolicyNumber = row.policy;
  d.PayorSources.PayorSource[0].Payor_Source = row.plan;
  d.RPA_Chart_Status = String(row.chartPct);
  d.DataEntryStatus = row.chartPct===100 ? "Completed" : row.terminatedOn ? "Terminated" : row.at==="warning" ? "Failed" : "Pending";
  return d;
}

const IPD = { pri:"#1F2530", body:"#3A424A", mute:"#6A717D", faint:"#8D949D", border:"#E8E9EA", divider:"#EEF0F3", blue:"#2F6FED", tab:"#CFCFCF" };
const ipdPresent = v => v!==null && v!==undefined && v!=="";
const ipdVal = v => ipdPresent(v) ? (typeof v==="boolean" ? (v?"Yes":"No") : v) : <span style={{color:"#cbd5e1"}}>—</span>;

function IPDFields({ items, min=180 }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${min}px,1fr))`,gap:"14px 24px"}}>
      {items.map(([label,v,span])=>(
        <div key={label} style={{minWidth:0,gridColumn:span?"1 / -1":undefined}}>
          <div style={{font:"400 11px/14px Roboto",color:IPD.mute}}>{label}</div>
          <div style={{font:"500 13px/18px Roboto",color:IPD.pri,marginTop:3,overflowWrap:"anywhere"}}>{ipdVal(v)}</div>
        </div>
      ))}
    </div>
  );
}
function IPDSub({ children, first }) {
  return <div style={{font:"500 13px/18px Roboto",color:IPD.body}}>{children}</div>;
}
function IPDNotes({ list, k="Information" }) {
  if (!list||!list.length) return null;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:16}}>
      {list.map((n,i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"8px 12px",background:"#F0F6FF",borderRadius:6,font:"400 12px/17px Roboto",color:"#1B4FCB"}}>
          <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:IPD.blue,color:"#fff",fontSize:9,fontWeight:600,flexShrink:0,marginTop:1}}>i</span>
          {n[k]}
        </div>
      ))}
    </div>
  );
}
function IPDTable({ cols, rows }) {
  const grid = cols.map(c=>c[2]||"minmax(0,1fr)").join(" ");
  return (
    <div style={{border:`1px solid ${IPD.border}`,borderRadius:6,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:grid,gap:12,padding:"9px 14px",background:"#f8fafc",borderBottom:`1px solid ${IPD.border}`,font:"500 11px/14px Roboto",color:"#64748b"}}>
        {cols.map(c=><div key={c[0]}>{c[0]}</div>)}
      </div>
      {rows.map((r,i)=>(
        <div key={i} style={{display:"grid",gridTemplateColumns:grid,gap:12,padding:"10px 14px",borderTop:i?`1px solid ${IPD.divider}`:"none",font:"500 12px/17px Roboto",color:IPD.pri,alignItems:"start"}}>
          {cols.map(c=><div key={c[0]} style={{minWidth:0,overflowWrap:"anywhere"}}>{ipdVal(typeof c[1]==="function"?c[1](r):r[c[1]])}</div>)}
        </div>
      ))}
    </div>
  );
}
// Each IPDSub starts its own box, so sub-categories read as separate cards
// instead of stacking inside one shared container.
function IPDCard({ id, title, children, refs }) {
  const groups = [], notes = [];
  React.Children.toArray(children).forEach(ch => {
    if (ch && ch.type === IPDNotes) notes.push(ch);
    else if (ch && ch.type === IPDSub) groups.push({ title: ch.props.children, items: [] });
    else { if (!groups.length) groups.push({ title: null, items: [] }); groups[groups.length-1].items.push(ch); }
  });
  return (
    <div ref={el=>{ refs.current[id]=el; }} data-sec={id} style={{marginBottom:28}}>
      <div style={{font:"500 15px/20px Roboto",color:IPD.pri,marginBottom:12,padding:"0 4px"}}>{title}</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {groups.map((g,i)=>(
          <div key={i} style={{borderRadius:8,background:"#fff",border:`1px solid ${IPD.border}`,boxShadow:"0 1px 2px rgba(15,23,42,0.04)",overflow:"hidden"}}>
            {g.title && <div style={{padding:"10px clamp(16px,2vw,24px)",background:"#f8fafc",borderBottom:`1px solid ${IPD.border}`,font:"500 13px/18px Roboto",color:IPD.body}}>{g.title}</div>}
            <div style={{padding:"16px clamp(16px,2vw,24px)"}}>{g.items}</div>
          </div>
        ))}
      </div>
      {notes}
    </div>
  );
}

const IPD_SECTIONS = [
  ["status","Intake Status"],["basic","Basic Info"],["demo","Demographics"],["referral","Referral Source"],["other","Other Information"],
  ["payor","Payor Sources"],["phys","Physicians"],["dx","Diagnoses"],["notes","Clinical Intake Notes"],["sched","Scheduling"],["clinical","Clinical"],["attach","Attachments"],
];

function IPDIntakeInfo({ d, row }) {
  const [active, setActive] = useIPD("status");
  const scroller = useIPDRef(null), refs = useIPDRef({});
  const jump = id => { const el=refs.current[id], sc=scroller.current; if(el&&sc) sc.scrollTo({top:el.offsetTop-sc.offsetTop-8,behavior:"smooth"}); setActive(id); };
  const onScroll = () => {
    const sc=scroller.current; if(!sc) return;
    let cur=IPD_SECTIONS[0][0];
    for (const [id] of IPD_SECTIONS) { const el=refs.current[id]; if(el && el.offsetTop-sc.offsetTop-24 <= sc.scrollTop) cur=id; }
    if (sc.scrollTop+sc.clientHeight >= sc.scrollHeight-4) cur=IPD_SECTIONS[IPD_SECTIONS.length-1][0];
    if (cur!==active) setActive(cur);
  };
  const B=d.BasicInfo, Dm=d.Demographics, P=Dm.PersonalInformation, SL=Dm.service_location, PC=Dm.PatientContactInformation, E=Dm.EOB;
  const RI=d.ReferralSource.ReferralInformation, RA=RI.ReferralProviderAddress||{};
  const C=d.Clinical;
  const pct=Number(d.RPA_Chart_Status)||0;
  const errs=row.errorReasons||[];
  const stTone={ Completed:["#E6F7E0","#9FCB8A","#1F7A3A"], Pending:["#FFFBF0","#F1D89A","#8A6A14"], Failed:["#FBE4E4","#E8A1A1","#B92D2D"], Terminated:["#f1f5f9","#cbd5e1","#475569"] }[d.DataEntryStatus] || ["#f1f5f9","#cbd5e1","#475569"];
  const discharges=[]; const dz=(E.Discharges&&E.Discharges[0])||{};
  for (let i=1;i<=5;i++) if (ipdPresent(dz["DischargeDate"+i])||ipdPresent(dz["LastDayOfService"+i])) discharges.push({ n:i, dd:dz["DischargeDate"+i], ld:dz["LastDayOfService"+i] });
  const fileName = u => (u||"").split("/").pop();

  return (
    <div style={{display:"flex",height:"100%",minHeight:0}}>
      <div style={{width:196,flexShrink:0,borderRight:`1px solid ${IPD.divider}`,padding:"18px 10px",overflowY:"auto",display:"flex",flexDirection:"column",gap:2}}>
        {IPD_SECTIONS.map(([id,label])=>{
          const on=active===id;
          return <button key={id} type="button" onClick={()=>jump(id)} style={{textAlign:"left",background:on?"#F0F6FF":"transparent",border:"none",borderRadius:6,padding:"8px 12px",font:`${on?500:400} 13px/17px Roboto`,color:on?IPD.blue:IPD.body,cursor:"pointer"}}>{label}</button>;
        })}
      </div>
      <div ref={scroller} onScroll={onScroll} style={{flex:1,minWidth:0,overflowY:"auto",padding:"20px clamp(16px,2vw,28px) 40px",background:"#FAFBFC"}}>
        <IPDCard id="status" title="Intake Status" refs={refs}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"16px 32px",alignItems:"start"}}>
            <div>
              <div style={{font:"400 11px/14px Roboto",color:IPD.mute}}>Data Entry Status</div>
              <span style={{display:"inline-block",marginTop:6,padding:"3px 12px",borderRadius:999,background:stTone[0],border:`1px solid ${stTone[1]}`,color:stTone[2],font:"500 12px/16px Roboto"}}>{d.DataEntryStatus}</span>
            </div>
            <div>
              <div style={{font:"400 11px/14px Roboto",color:IPD.mute}}>Chart Status</div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8}}>
                <div style={{flex:1,maxWidth:160,height:6,borderRadius:3,background:IPD.divider,overflow:"hidden"}}><div style={{width:pct+"%",height:"100%",background:pct===100?"#16a34a":errs.length?"#dc2626":"#64748b"}}></div></div>
                <span style={{font:"500 13px/16px Roboto",color:IPD.pri}}>{pct}%</span>
              </div>
            </div>
            <div>
              <div style={{font:"400 11px/14px Roboto",color:IPD.mute}}>Referral Document</div>
              <a href="#" onClick={e=>e.preventDefault()} style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:4,font:"500 13px/18px Roboto",color:IPD.blue,textDecoration:"none",overflowWrap:"anywhere"}}>
                <img src={(window.__resources&&window.__resources.attachmentType)||"icons/attachment-type.svg"} width="16" height="16" alt="" />{d.ReferralDocumentFileName}
              </a>
            </div>
          </div>
          <IPDSub>Error Reasons</IPDSub>
          {errs.length===0
            ? <div style={{font:"400 13px/18px Roboto",color:IPD.faint}}>No error reasons recorded.</div>
            : errs.map((e,i)=>(
              <div key={i} style={{display:"flex",gap:12,padding:"12px 14px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,marginBottom:8}}>
                <span style={{font:"700 12px/18px Roboto",color:"#dc2626",flexShrink:0}}>{String(i+1).padStart(2,"0")}</span>
                <div style={{font:"400 13px/19px Roboto",color:"#334155"}}><span style={{color:"#dc2626",fontWeight:500}}>{e.loc}</span> {e.desc}</div>
              </div>
            ))}
        </IPDCard>

        <IPDCard id="basic" title="Basic Info" refs={refs}>
          <IPDSub first>Branch Assignment</IPDSub>
          <IPDFields items={[["Branch",B.BranchAssignment.Branch],["Team",B.BranchAssignment.Team],["Location",B.BranchAssignment.location]]} />
          <IPDSub>Patient Name</IPDSub>
          <IPDFields items={[["Last Name",B.PatientName.LastName],["First Name",B.PatientName.FirstName],["MI",B.PatientName.MI]]} />
          <IPDNotes list={B.InformationList} />
        </IPDCard>

        <IPDCard id="demo" title="Demographics" refs={refs}>
          <IPDSub first>Personal Information</IPDSub>
          <IPDFields items={[["Gender",P.Gender],["Date of Birth",P.DateOfBirth],["SSN",P.SSN],["Legacy MR Number",P.LegacyMRNumber]]} />
          <IPDSub>Service Location</IPDSub>
          <IPDFields items={[["Service Location Type",SL.ServiceLocationType],["Facility Name",SL.FacilityName],["Address",SL.Address],["City",SL.City],["State",SL.State],["Zip",SL.Zip],["Phone",SL.Phone],["Mobile",SL.Mobile],["Floor",SL.Floor],["Room No",SL.RoomNo],["Web Access Approval",SL.PatientApprovalReceivedForWebAccess],["Visit Instructions",SL.VisitInstructions]]} />
          <IPDSub>Patient Contact Information</IPDSub>
          <IPDFields items={[["Primary Phone",PC.PrimaryPhone],["Alternate Phone",PC.AlternatePhone],["Mobile Phone",PC.MobilePhone],["Email Address",PC.EmailAddress]]} />
          <IPDSub>Contact Information</IPDSub>
          <IPDTable cols={[["Contact Type","ContactType","minmax(0,1.3fr)"],["Relationship","RelationshipToPatient"],["Name",r=>`${r.FirstName} ${r.LastName}`],["Primary Phone","PrimaryPhone"],["Alternate Phone","AlternatePhone"],["Email","Email","minmax(0,1.3fr)"],["Notes","Notes"]]} rows={Dm.ContactInformation||[]} />
          <IPDSub>Episode (EOB)</IPDSub>
          <IPDFields items={[["Type",E.Type],["Date",E.Date],["SOC",E.SOC],["SOE",E.SOE],["Number of Discharges",E.NumberOfDischarge]]} />
          {discharges.length>0 && <div style={{marginTop:14,maxWidth:560}}><IPDTable cols={[["#","n","40px"],["Discharge Date","dd"],["Last Day of Service","ld"]]} rows={discharges} /></div>}
          <IPDNotes list={Dm.InformationList} />
        </IPDCard>

        <IPDCard id="referral" title="Referral Source" refs={refs}>
          <IPDSub first>Referral Information</IPDSub>
          <IPDFields items={[["Referral Date",RI.ReferralDate],["Referral Taken By",RI.ReferralTakenBy],["Referral Source",RI.ReferralSources],["Referral Facility",RI.ReferralFacility],["Referral Physician",RI.ReferralPhysician],["Facility Contact",RI.ReferralFacilityContact],["Physician Contact",RI.ReferralPhysicianContact]]} />
          <IPDSub>Referral Provider Address</IPDSub>
          <IPDFields items={[["Street Address",RA.street_address],["City",RA.city],["State",RA.state],["Zip",RA.zip],["Phone Number",RA.phone_number]]} />
          <IPDSub>Care Types</IPDSub>
          <div style={{maxWidth:560}}><IPDTable cols={[["Care Type","CareType","minmax(0,2fr)"],["Effective From","EffectiveFrom"]]} rows={d.ReferralSource.CareTypes||[]} /></div>
        </IPDCard>

        <IPDCard id="other" title="Other Information" refs={refs}>
          <IPDFields items={[["Homecare Coordinator",d.OtherInformation.HomecareCoordinator],["Clinical Intake Specialist",d.OtherInformation.ClinicalIntakeSpecialist]]} />
        </IPDCard>

        <IPDCard id="payor" title="Payor Sources" refs={refs}>
          {(d.PayorSources.PayorSource||[]).flatMap((p,i)=>{
            const ins=p.InsuredPartyInfoforPayorSource||{}, au=p.Authorization||{};
            return [
              <IPDSub key={"ps"+i}><span style={{display:"inline-flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>{p.Payor_Source}{p.AdditionalInformation && <span style={{padding:"2px 10px",borderRadius:999,background:"#F0F6FF",border:"1px solid #C9DBFB",color:"#1B4FCB",font:"500 11px/16px Roboto"}}>{p.AdditionalInformation}</span>}</span></IPDSub>,
              <IPDFields key={"pf"+i} items={[["Payor Type",p.PayorType],["MBI",p.MBI],["Medicaid Number",p.MedicaidNumber],["Policy Number",p.PolicyNumber],["Transferred from Another HHA",p.PatientTransferredFromAnotherHHA==="True"?"Yes":p.PatientTransferredFromAnotherHHA],["Point of Origin",p.PointOfOrigin,true]]} />,
              <IPDSub key={"is"+i}>Insured Party</IPDSub>,
              <IPDFields key={"if"+i} items={[["Relationship to Insured",ins.RelationshipToInsured],["Name",[ins.FirstName,ins.LastName].filter(Boolean).join(" ")],["Gender",ins.Gender],["Date of Birth",ins.DateOfBirth],["Phone Number",ins.InsuredPhoneNumber],["Email",ins.Email],["Address",ins.Address]]} />,
              <IPDSub key={"as"+i}>Authorization</IPDSub>,
              <IPDFields key={"af"+i} items={[["Program Name",au.ProgramName],["Authorization Number",au.AuthorizationNumber],["Start Date",au.AuthorizationStartDate],["End Date",au.AuthorizationEndDate],["Requested Date",au.AuthorizationRequestedDate],["Follow-up on Pending Due",au.FollowUpOnPendingDue],["Comments",au.Comments]]} />,
              (au.AuthorizationDetailLine||[]).length>0 && <div key={"al"+i} style={{marginTop:14,maxWidth:420}}><IPDTable cols={[["Billing Code","BillingCodes"],["Qty per Period","QtyPerPeriod"]]} rows={au.AuthorizationDetailLine} /></div>,
            ];
          })}
          <IPDNotes list={d.PayorSources.InformationList} />
        </IPDCard>

        <IPDCard id="phys" title="Physicians" refs={refs}>
          <IPDTable cols={[["Name",r=>`${r.FirstName} ${r.LastName}`],["NPI","NPI"],["Primary","PrimaryPhysician","80px"],["Medical Director","MedicalDirector","110px"],["Contact Number","ContactNumber"],["Address","Address","minmax(0,2fr)"]]} rows={d.Physicians.Physician||[]} />
        </IPDCard>

        <IPDCard id="dx" title="Diagnoses" refs={refs}>
          <IPDTable cols={[["ICD-10","ICD10Code","90px"],["Description","Description","minmax(0,2.4fr)"],["Primary","PrimaryDiagnosis","80px"],["Type","DiagnosisType"],["Date","Date"]]} rows={d.Diagnoses.Diagnosis||[]} />
        </IPDCard>

        <IPDCard id="notes" title="Clinical Intake Notes" refs={refs}>
          <div style={{font:"400 13px/20px Roboto",color:IPD.body,maxWidth:760}}>{ipdVal(d.ClinicalIntakeNotes.Notes)}</div>
        </IPDCard>

        <IPDCard id="sched" title="Scheduling" refs={refs}>
          <IPDSub first>Evaluation Visits</IPDSub>
          <IPDFields items={[["Requested Date of Evaluation",d.Scheduling.EvaluationVisits.RequestedDateOfEvaluation],["Skilled Disciplines",d.Scheduling.EvaluationVisits.SkilledDisciplines]]} />
        </IPDCard>

        <IPDCard id="clinical" title="Clinical" refs={refs}>
          <IPDSub first>Inpatient Events</IPDSub>
          <IPDFields items={[["Facility",C.InpatientEvents.Facility],["Facility Admit Date",C.InpatientEvents.facility_admit_date],["Discharge Date",C.InpatientEvents.DischargeDate],["Observation Stay",C.is_observation]]} />
          <IPDSub>Other Facilities</IPDSub>
          <IPDFields items={[["Facility",C.OtherFacilities.Facility],["Facility Type",C.OtherFacilities.FacilityType],["Web Access Approval",C.OtherFacilities.PatientApprovalReceivedForWebAccess]]} />
          <IPDSub>Patient Information</IPDSub>
          <IPDFields items={[["Initial Documentation Status",C.PatientInformation.InitialDocumentationStatus],["Pending Reason",C.PatientInformation.PendingReason]]} />
          <IPDNotes list={C.InstructionList} k="Instruction" />
        </IPDCard>

        <IPDCard id="attach" title="Attachments" refs={refs}>
          <IPDTable cols={[["File",r=><a href="#" onClick={e=>e.preventDefault()} style={{color:IPD.blue,textDecoration:"none"}}>{fileName(r.URL)}</a>,"minmax(0,2fr)"],["File Type","FileType","80px"],["Attachment Type","AttachmentType"],["Location","Location"],["Effective Range",r=>{const e=r.EffectiveDateRange||{}; return ipdPresent(e.FromDate)||ipdPresent(e.ToDate) ? `${e.FromDate||"—"} → ${e.ToDate||"—"}` : "";}],["Comments","Comments"]]} rows={d.Attachments||[]} />
        </IPDCard>
      </div>
    </div>
  );
}

function IntakePatientDetail({ row, onClose }) {
  const d = ipdPayloadFor(row);
  const fields = [["MRN",row.mrn],["Episode ID",row.episodeId],["DOB",row.dob],["Gender",row.gender],["Branch",d.BasicInfo.BranchAssignment.Branch],["Primary Plan",row.plan],["Policy Number",row.policy],["Referral Hub",row.refHub],["Patient ID",d.PatientID],["Universal Patient ID",d.UniversalPatientID]].filter(f=>ipdPresent(f[1]));
  return (
    <div style={{position:"fixed",inset:0,zIndex:60}}>
      <style>{`@keyframes ipdFade{from{opacity:0}to{opacity:1}} @keyframes ipdSlide{from{transform:translateX(28px);opacity:.6}to{transform:translateX(0);opacity:1}}`}</style>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.25)",animation:"ipdFade .14s ease-out"}}></div>
      <div style={{position:"fixed",right:0,top:0,height:"100vh",width:"97vw",background:"#fff",borderLeft:`1px solid ${IPD.border}`,boxShadow:"-12px 0 24px rgba(28,45,66,.10)",display:"flex",flexDirection:"column",animation:"ipdSlide .22s ease-out"}}>
        <div style={{flexShrink:0,background:"#fff"}}>
          <div style={{position:"relative",padding:"22px clamp(16px,2.4vw,36px) 18px"}}>
            <button onClick={onClose} aria-label="Close" style={{position:"absolute",top:14,right:14,background:"transparent",border:"none",color:IPD.mute,fontSize:20,cursor:"pointer",lineHeight:1,padding:6}}>✕</button>
            <div style={{display:"flex",alignItems:"flex-start",gap:32,flexWrap:"wrap"}}>
              <div style={{display:"flex",flexDirection:"column",flexShrink:0}}>
                <div style={{font:"400 13px/16px Roboto",color:"#6B7280",marginBottom:4}}>Patient Name</div>
                <span style={{font:"700 28px/1.1 Roboto",color:"#111827",whiteSpace:"nowrap"}}>{row.name}</span>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"14px 28px",flex:1,minWidth:0,paddingRight:32,paddingTop:2}}>
                {fields.map(([l,v])=>(
                  <div key={l} style={{display:"flex",flexDirection:"column",minWidth:0}}>
                    <div style={{font:"400 11px/14px Roboto",color:"#6B7280"}}>{l}</div>
                    <div style={{font:"500 14px/18px Roboto",color:"#111827",marginTop:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:260}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{margin:"0 20px",height:1,background:IPD.tab}}></div>
          <div style={{margin:"0 20px",display:"flex",alignItems:"flex-end",padding:"12px 0 0",borderBottom:`1px solid ${IPD.tab}`}}>
            <div style={{background:"#fff",border:`1px solid ${IPD.tab}`,borderBottom:"1px solid #fff",borderRadius:"6px 6px 0 0",padding:"9px 18px",font:"500 14px/18px Roboto",color:IPD.blue,marginBottom:-1,position:"relative",zIndex:2}}>Intake Info</div>
            <a href="#" onClick={e=>e.preventDefault()} style={{marginLeft:"auto",marginBottom:10,font:"400 13px/16px Roboto",color:IPD.blue,textDecoration:"none"}}>Automation Log</a>
          </div>
        </div>
        <div style={{flex:1,minHeight:0,overflow:"hidden",background:"#fff",margin:"0 20px 20px",borderLeft:`1px solid ${IPD.tab}`,borderRight:`1px solid ${IPD.tab}`,borderBottom:`1px solid ${IPD.tab}`,borderRadius:"0 0 6px 6px"}}>
          <IPDIntakeInfo d={d} row={row} />
        </div>
      </div>
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { IntakePatientDetail, IPD_BASE });
