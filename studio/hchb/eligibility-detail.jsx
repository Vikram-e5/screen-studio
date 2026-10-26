// EligibilityDetail — right-sliding overlay, fully data-driven.
// 75vw width, fixed right, internal scroll. Patient header + tab bar
// (Eligibility Info / Authorization Info) + Automation Log link.

const { useState: useED, useEffect: useEDEffect, useRef: useEDRef } = React;

const fmtMoney = (n) => (n===null || n===undefined) ? "—" : Number(n).toLocaleString("en-US", { style:"currency", currency:"USD", maximumFractionDigits: 0 });
const isPresent = (v) => v!==null && v!==undefined && v!=="";
const pctSafe = (used, total) => {
  if (!isPresent(used) || !isPresent(total) || total<=0) return null;
  return Math.min(100, Math.max(0, Math.round((used/total)*100)));
};

// ── Sample payloads ───────────────────────────────────────────
const SAMPLE_PAYLOADS = {
  medicare_advantage: {
    label: "Medicare Advantage",
    data: {
      patient: { name:"Marvin Mckinney", mrn:"B6100062245601", dob:"02/10/1956", memberId:"11521357", relationship:"Self", payorName:"Aetna", payorSource:"Aetna Medicare Gold Advantage (PPO)", payorType:"Mcare Adv", planType:"Medicare Advantage", gateway:"Carelon", startOfCare:"01/21/25" },
      plan: { status:"active", startDate:"01/01/2025", endDate:"12/31/2025", network:"In-Network", groupNumber:"GRP-77881",
              refId:"REFE023948357", checkDate:"04/01/25", checkTime:"10:53 PM", checkDateOnly:"01/07/25",
              fullName:"Aetna Medicare Gold Advantage (PPO) for senior citizen",
              payorId:"77856", planTypeShort:"HMO" },
      planResponse: { patientName:"Marvin Mckinney", gender:"Male", relationship:"Self", memberId:"55493027", dob:"10/04/1956", address:"204 Spicer Dr, Gordonsville, TN –38563", mbi:"3543657457445" },
      otherPlans: [],
      additionalCoverage: [
        { planName:"AARP Medicare Advantage",        payorId:"452674", memberId:"3543532423", coverageDate:"01/25/25 – 01/25/26" },
        { planName:"UHC Medicare For Senior Citizen", payorId:"124689", memberId:"56785426645", coverageDate:"12/04/25 – 12/04/26" },
      ],
      pcp: { physicianName:"Dr. John Naren", phoneNumber:"574-686-5453", pcpGroupNumber:"354657545", address:"204 Spicer Dr Gordonsville, TN–38563" },
      tiers: [
        { name:"Individual · In-Network",     deductible:{ total:1632, used:640,  remaining:992  }, oop:{ total:4500,  used:1200, remaining:3300 }, network:"in" },
        { name:"Individual · Out-of-Network", deductible:{ total:3000, used:0,    remaining:3000 }, oop:{ total:7500,  used:0,    remaining:7500 }, network:"out" },
        { name:"Family · In-Network",         deductible:{ total:3264, used:1480, remaining:1784 }, oop:{ total:9000,  used:2400, remaining:6600 }, network:"in" },
        { name:"Family · Out-of-Network",     deductible:{ total:6000, used:0,    remaining:6000 }, oop:{ total:15000, used:0,    remaining:15000}, network:"out" },
      ],
      alerts: [
        { kind:"warning", title:"Policy renewal upcoming", body:"Policy renews 12/31/2025 — verify continuing eligibility before SOC." },
        { kind:"info",    title:"Coordination of Benefits", body:"Secondary coverage detected — Aetna Supplement. Verify primary/secondary order." },
      ],
      benefits: [
        { name:"Home Health",     status:"Covered",       fields:{ auth_required:true,  copay:"$0 / visit",          co_insurance:"20%", service_deductible:[ { name:"Individual", remaining:2400, used:600, total:3000 }, { name:"Family", remaining:2400, used:600, total:3000 } ], visit_limit:60,  visits_used:12, prior_auth_phone:"1-800-624-0756", network_note:"In-network provider required" } },
        { name:"Skilled Nursing", status:"Covered",       fields:{ auth_required:true,  copay:"$185 (days 1–20)",      co_insurance:"0%",  days_limit:100,  days_used:24,    prior_auth_phone:"1-800-624-0756" } },
        { name:"Physical & Occupational Therapy", status:"Covered", fields:{ auth_required:false, copay:"$0 / visit", visit_limit:30, visits_used:8 } },
        { name:"Hospice",         status:"Covered",       fields:{ auth_required:false, copay:"$0" } },
      ],
      auths: [
        { num:"AUTH-8842", status:"Approved", service:"Home Health", start:"01/15/25", end:"04/15/25", unitsTotal:60, unitsUsed:24 },
        { num:"AUTH-8851", status:"Pending",  service:"Skilled Nursing", start:"02/01/25", end:"05/01/25", unitsTotal:100, unitsUsed:0 },
        { num:"AUTH-8867", status:"Denied",   service:"Physical Therapy", start:"03/01/25", end:"06/01/25", unitsTotal:30, unitsUsed:0 },
        { num:"AUTH-8801", status:"Expired",  service:"Occupational Tx", start:"09/01/24", end:"12/01/24", unitsTotal:24, unitsUsed:24 },
      ],
    },
  },
  commercial_ppo: {
    label: "Commercial PPO",
    data: {
      patient: { name:"Esther Howard", mrn:"B6789012345678", dob:"08/22/1978", memberId:"BCBS-883-7712", relationship:"Spouse", payorName:"Blue Cross Blue Shield PPO", payorSource:"Availity", planType:"Commercial PPO", gateway:"Availity", startOfCare:"06/01/25" },
      plan: { status:"active", startDate:"01/01/2025", endDate:"12/31/2025", network:"In-Network", groupNumber:"GRP-91024",
              refId:"REFE018822401", checkDate:"06/02/25", checkTime:"09:12 AM", checkDateOnly:"06/02/25",
              fullName:"Blue Cross Blue Shield PPO Select for Group 91024",
              payorId:"00123", planTypeShort:"PPO" },
      planResponse: { patientName:"Esther Howard", gender:"Female", relationship:"Spouse", memberId:"BCBS-883-7712", dob:"08/22/1978", address:"712 Main St, Nashville, TN –37203", mbi:"—" },
      otherPlans: [
        { id:"sec", label:"Secondary — Blue Shield Medigap" },
      ],
      additionalCoverage: [
        { planName:"Blue Shield Medigap Supplement", payorId:"00345", memberId:"BS-447-8821", coverageDate:"01/01/25 – 12/31/25" },
      ],
      pcp: { physicianName:"Dr. Sara Patel", phoneNumber:"615-555-0184", pcpGroupNumber:"212098341", address:"712 Main St, Nashville, TN–37203" },
      tiers: [
        { name:"Self · In-Network",              deductible:{ total:2000, used:450,  remaining:1550 }, oop:{ total:6500,  used:900,  remaining:5600 },  network:"in"  },
        { name:"Self · Out-of-Network",          deductible:{ total:4000, used:0,    remaining:4000 }, oop:{ total:12000, used:0,    remaining:12000 }, network:"out" },
        { name:"Dependent · In-Network",         deductible:{ total:2000, used:120,  remaining:1880 }, oop:{ total:6500,  used:240,  remaining:6260 },  network:"in"  },
        { name:"Domestic Partner · In-Network",  deductible:{ total:2000, used:0,    remaining:2000 }, oop:{ total:6500,  used:0,    remaining:6500 },  network:"in"  },
        { name:"Family · In-Network",            deductible:{ total:4000, used:800,  remaining:3200 }, oop:{ total:13000, used:1800, remaining:11200 }, network:"in"  },
        { name:"Family · Out-of-Network",        deductible:{ total:8000, used:0,    remaining:8000 }, oop:{ total:24000, used:0,    remaining:24000 }, network:"out" },
      ],
      alerts: [
        { kind:"error", title:"Deductible not yet met", body:"Patient owes co-insurance until deductible is met." },
      ],
      benefits: [
        { name:"Home Health",                     status:"Covered",       fields:{ auth_required:false, copay:"$25 / visit", co_insurance:"20%", service_deductible:[ { name:"Individual", remaining:2400, used:600, total:3000 }, { name:"Family", remaining:2400, used:600, total:3000 } ], visit_limit:60, visits_used:8, network_note:"In-network provider required" } },
        { name:"Physical & Occupational Therapy", status:"Covered",       fields:{ auth_required:false, copay:"$30 / visit", co_insurance:"20%", visit_limit:40, visits_used:8 } },
        { name:"Mental Health",       status:"Covered",       fields:{ auth_required:true,  copay:"$25 / visit", co_insurance:"10%", session_limit:52, sessions_used:6, prior_auth_phone:"1-888-555-0142", network_note:"Telehealth covered at parity" } },
        { name:"Durable Medical Equipment", status:"Requires Auth", fields:{ auth_required:true, co_insurance:"20%", prior_auth_phone:"1-888-555-0142", network_note:"Prior authorization required for items over $500" } },
      ],
      auths: [
        { num:"AUTH-9201", status:"Approved", service:"Physical Therapy", start:"01/15/25", end:"07/15/25", unitsTotal:60, unitsUsed:4 },
        { num:"AUTH-9221", status:"Pending",  service:"Mental Health",    start:"02/01/25", end:"08/01/25", unitsTotal:20, unitsUsed:0 },
      ],
    },
  },
  medicaid: {
    label: "Medicaid",
    data: {
      patient: { name:"Jane Cooper", mrn:"B6789012345720", dob:"11/04/1989", memberId:"MCD-552-1023", relationship:"Self", payorName:"State Medicaid", payorSource:"Direct", planType:"Medicaid", startOfCare:"04/01/25" },
      plan: { status:"active", startDate:"01/01/2025", endDate:null, network:"In-Network",
              refId:"REFE007722901", checkDate:"04/01/25", checkTime:"08:30 AM", checkDateOnly:"04/01/25",
              fullName:"State Medicaid",
              payorId:"55001", planTypeShort:"Medicaid" },
      planResponse: { patientName:"Jane Cooper", gender:"Female", relationship:"Self", memberId:"MCD-552-1023", dob:"11/04/1989", address:"45 Oak Ave, Memphis, TN –38104", mbi:"—" },
      otherPlans: [],
      additionalCoverage: [],
      pcp: { physicianName:"Dr. Marcus Lee", phoneNumber:"901-555-0107", pcpGroupNumber:"550100182", address:"45 Oak Ave, Memphis, TN–38104" },
      tiers: [
        { name:"Member", deductible:{ total:null, used:null, remaining:null }, oop:{ total:0, used:0, remaining:0 }, network:"in" },
      ],
      alerts: [],
      benefits: [
        { name:"Home Health",    status:"Covered", fields:{ auth_required:true,  copay:"$0", service_deductible:[ { name:"Individual", remaining:0, used:0, total:0 }, { name:"Family", remaining:0, used:0, total:0 } ], visit_limit:60, visits_used:4, prior_auth_phone:"1-855-555-0123", network_note:"No deductible — Medicaid covers in full" } },
        { name:"EPSDT",          status:"Covered", fields:{ auth_required:false, copay:"$0", network_note:"All medically necessary services covered" } },
        { name:"Dental",         status:"Covered", fields:{ auth_required:false, copay:"$0", visit_limit:2, visits_used:1 } },
        { name:"Transportation", status:"Covered", fields:{ auth_required:true,  copay:"$0", prior_auth_phone:"1-855-555-0123", network_note:"Non-emergency medical transport only" } },
      ],
      auths: [],
    },
  },
  sparse: {
    label: "Sparse Payload",
    data: {
      patient: { name:"Wade Warren", mrn:"B6789012345685", payorName:"Humana" },
      plan: { status:"inactive",
              refId:"REFE000000128", checkDate:"05/04/25", checkTime:"—", checkDateOnly:"05/04/25",
              fullName:"Humana Gold Plan" },
      planResponse: { patientName:"Wade Warren" },
      otherPlans: [],
      tiers: [
        { name:"Member", deductible:{ total:null, used:null, remaining:null }, oop:{ total:null, used:null, remaining:null } },
      ],
      alerts: [{ kind:"warning", title:"Coverage is inactive", body:"Patient has no active coverage at this time." }],
      benefits: [{ name:"Home Health", status:"Not Covered", fields:{ auth_required:null, copay:null } }],
      auths: [],
    },
  },
  leslie_alexander: {
    label: "Leslie Alexander — Medicare",
    hidden: true,
    data: {
      patient: { name:"Leslie Alexander", mrn:"B6789012345697", dob:"09/14/1957", memberId:"69420061", relationship:"Self", payorName:"Medicare", payorSource:"Medicare - Direct", planType:"Medicare", gateway:"Inovalon", startOfCare:"12/30/25" },
      plan: { status:"active", startDate:"01/01/2025", endDate:"12/31/2025", network:"In-Network", groupNumber:"GRP-16401",
              refId:"REFA051124191", checkDate:"12/30/25", checkTime:"11:20 AM", checkDateOnly:"12/30/25",
              fullName:"Medicare Part A/B",
              payorId:"16401235544", planTypeShort:"FFS" },
      planResponse: { patientName:"Leslie Alexander", gender:"Female", relationship:"Self", memberId:"69420061", dob:"09/14/1957", address:"118 Redwood Ct, Franklin, TN –37064", mbi:"1EG4-TE5-MK73" },
      otherPlans: [],
      additionalCoverage: [
        { planName:"STATE FARM INSURANCE CO. PR", payorId:"PR 00", memberId:"1234512345", coverageDate:"01/05/26 – 02/03/26" },
      ],
      pcp: { physicianName:"Dr. Angela Foster", phoneNumber:"615-555-0198", pcpGroupNumber:"164012355", address:"118 Redwood Ct, Franklin, TN–37064" },
      tiers: [
        { name:"Member", deductible:{ total:257, used:0, remaining:257 }, oop:{ total:0, used:0, remaining:0 }, network:"in" },
      ],
      alerts: [
        { kind:"warning", title:"On service with another provider", body:"On service with another provider Home health/hospice NPI: 1133445533",
          detail:{
            intro:"Beneficiary appears currently **on service with another Home Health or Hospice agency**. Verify discharge/transfer status before admitting or billing.",
            sections:[
              { heading:"Home Health episode (Time Period: Episode)", link:true, items:[
                "Service range: 2026-01-05 – 2026-02-03",
                "Period start: 2026-01-06",
                "Period end: 2026-02-03",
                "Note: 30 Still patient",
                "Related entity: Palmetto GBA, IP: 00, 16401235544, P.O Box 100104, IP 00, 16401235544A",
              ] },
            ],
          } },
        { kind:"warning", title:"Medicare Secondary / No-fault", body:"Medicare Secondary: No-Fault Auto primary (payer code30)",
          detail:{
            sections:[
              { heading:"Related Payer / Entity", items:[
                "STATE FARM INSURANCE CO. PR, Payer Identifier: PR 00, 1234512345",
                "Source Code: 22 (1122) (NR-Non-Group/Health Plan",
                "Patient Relationship: 1L Spouse is insured.",
              ] },
              { heading:"Payer Messages", items:[
                "OMF - V",
                "SUBRCSA",
                "Source Code: 22 (1122) (NR-Non-Group/Health Plan",
                "Patient Relationship: 1L Spouse is insured.",
              ] },
            ],
          } },
      ],
      benefits: [
        { name:"Home Health", status:"Covered", fields:{ auth_required:false, copay:"$0", network_note:"Medicare Part A — no authorization required" } },
        { name:"Hospice", status:"Covered", fields:{ auth_required:false, copay:"$0" } },
      ],
      auths: [],
    },
  },
  robert_fox: {
    label: "Robert Fox — HumanaChoice (PPO)",
    hidden: true,
    data: {
      patient: { name:"Robert Fox", mrn:"V6789012345686", dob:"06/22/1958", memberId:"H1036-298-04", relationship:"Self", payorName:"HumanaChoice Medicare Advantage (PPO)", payorSource:"Availity", planType:"Medicare Advantage", gateway:"Availity", startOfCare:"04/18/25" },
      plan: { status:"active", startDate:"01/01/2025", endDate:"12/31/2025", network:"In-Network", groupNumber:"GRP-46812",
              refId:"REFE694200611", checkDate:"04/18/25", checkTime:"08:41 AM", checkDateOnly:"04/18/25",
              fullName:"HumanaChoice H1036-298 (PPO)",
              payorId:"61101", planTypeShort:"PPO" },
      planResponse: { patientName:"Robert Fox", gender:"Male", relationship:"Self", memberId:"H1036-298-04", dob:"06/22/1958", address:"3812 Hill Crest Dr, Knoxville, TN –37917", mbi:"4HG7-EE9-RF26" },
      otherPlans: [],
      additionalCoverage: [
        { planName:"Humana Gold Plus HMO",            payorId:"61102", memberId:"H1036-298-04-A", coverageDate:"01/01/25 – 12/31/25" },
        { planName:"Humana Walmart Value Rx Plan",    payorId:"61103", memberId:"H1036-298-04-B", coverageDate:"01/01/25 – 12/31/25" },
      ],
      pcp: { physicianName:"Dr. Marisa Quintero", phoneNumber:"865-555-0163", pcpGroupNumber:"611014782", address:"3812 Hill Crest Dr, Knoxville, TN–37917" },
      tiers: [
        { name:"Individual · In-Network",     deductible:{ total:1632, used:640,  remaining:992  }, oop:{ total:4500,  used:1200, remaining:3300 }, network:"in" },
        { name:"Individual · Out-of-Network", deductible:{ total:3000, used:0,    remaining:3000 }, oop:{ total:7500,  used:0,    remaining:7500 }, network:"out" },
        { name:"Family · In-Network",         deductible:{ total:3264, used:1480, remaining:1784 }, oop:{ total:9000,  used:2400, remaining:6600 }, network:"in" },
        { name:"Family · Out-of-Network",     deductible:{ total:6000, used:0,    remaining:6000 }, oop:{ total:15000, used:0,    remaining:15000}, network:"out" },
      ],
      alerts: [
        { kind:"warning", title:"Out-of-network referral required", body:"Plan is PPO — out-of-network visits allowed but cost-share doubles. Confirm referral path before scheduling." },
        { kind:"info",    title:"Coordination of Benefits", body:"Secondary Rx plan detected — Humana Walmart Value Rx. Verify primary/secondary order at intake." },
      ],
      // Service Benefits — Robert Fox uses the COLUMN-MATRIX model. Each
      // benefit declares `columns` (the network variants — 2 or 3 of them),
      // and EVERY field can carry a per-column response: an array whose
      // length matches `columns`. Fields with a plain scalar value span all
      // columns (e.g. a phone number or a yearly visit limit). This renders
      // as a divider-label table — labels down the left, one value column per
      // network variant — and cascades through all three layouts (A / B / C).
      benefits: [
        { name:"Home Health", status:"Covered",
          columns:["In-Network","Out-of-Network"],
          fields:{
            auth_required:[true, true],
            copay:["$0 / visit", "$45 / visit"],
            co_insurance:["20%", "40%"],
            service_deductible:[
              { remaining:992,  used:640, total:1632 },
              { remaining:3000, used:0,   total:3000 },
            ],
            visit_limit:[60, 30], visits_used:[12, 4],
            prior_auth_phone:"1-800-457-4708",
            network_note:"PPO — out-of-network allowed at higher cost share",
        } },
        { name:"Skilled Nursing", status:"Covered",
          columns:["In-Network","Out-of-Network"],
          fields:{
            auth_required:[true, true],
            copay:["$195 (days 1–20)", "$420 (days 1–20)"],
            co_insurance:["0%", "30%"],
            service_deductible:[
              { remaining:992,  used:640, total:1632 },
              { remaining:3000, used:0,   total:3000 },
            ],
            days_limit:[100, 60], days_used:[18, 8],
            prior_auth_phone:"1-800-457-4708",
        } },
        // Three-column example — Individual In/Out plus a Family tier.
        { name:"Physical & Occupational Therapy", status:"Covered",
          columns:["Individual · In-Network","Individual · Out-of-Network","Family · In-Network"],
          fields:{
            auth_required:[false, false, false],
            copay:["$20 / visit", "$50 / visit", "$20 / visit"],
            co_insurance:["20%", "40%", "20%"],
            service_deductible:[
              { remaining:992,  used:640,  total:1632 },
              { remaining:3000, used:0,    total:3000 },
              { remaining:1784, used:1480, total:3264 },
            ],
            visit_limit:[30, 15, 30], visits_used:[6, 2, 6],
        } },
        { name:"Durable Medical Equipment", status:"Requires Auth",
          columns:["In-Network","Out-of-Network"],
          fields:{
            auth_required:[true, true],
            co_insurance:["20%", "40%"],
            prior_auth_phone:"1-800-457-4708",
            network_note:"Prior auth required for items over $500",
        } },
        // Mixed example — single-value benefit (no columns) still works.
        { name:"Hospice", status:"Covered", fields:{ auth_required:false, copay:"$0" } },
      ],
      auths: [
        { num:"AUTH-G3H4", status:"Approved", service:"Home Health",     start:"04/18/25", end:"07/18/25", unitsTotal:60, unitsUsed:12 },
        { num:"AUTH-I5J6", status:"Pending",  service:"Skilled Nursing", start:"04/22/25", end:"07/22/25", unitsTotal:100, unitsUsed:0 },
        { num:"AUTH-K7L8", status:"Approved", service:"Physical Therapy",start:"04/22/25", end:"07/22/25", unitsTotal:30,  unitsUsed:6 },
      ],
    },
  },
  cameron_williamson: {
    label: "Cameron Williamson — BCBS Nevada",
    hidden: true,
    data: {
      patient: { name:"Cameron Williamson", mrn:"B6100054445634", dob:"05/12/1968", memberId:"XEO910779295", relationship:"Self", payorName:"BCBS Nevada", payorSource:"Availity", planType:"HMO", gateway:"Availity", startOfCare:"02/06/25" },
      plan: { status:"mixed", startDate:"01/01/2025", endDate:"12/31/9999", network:"In-Network", groupNumber:"X0001004",
              refId:"REF6865913232", checkDate:"02/11/25", checkTime:"07:37 AM", checkDateOnly:"02/11/25",
              fullName:"BCBS Nevada — Silver 94 Trio HMO Jan25",
              payorId:"2001ZH002660", planTypeShort:"HMO" },
      planResponse: { patientName:"Cameron Williamson", gender:"Male", relationship:"Self", memberId:"XEO910779295", dob:"05/12/1968", address:"2140 Big Buck Ln, Paso Robles, CA 93446", mbi:"—" },
      otherPlans: [],
      additionalCoverage: [
        { planName:"Silver 94 Trio HMO Jan25 (Family — Active)",  payorId:"BCBS-CA", memberId:"2001ZH002660", coverageDate:"01/01/25 – Open-ended" },
        { planName:"IFP EMB PED Dental HMO Jan17 (Inactive)",     payorId:"BCBS-CA", memberId:"2001D0000334", coverageDate:"09/01/21 – Open-ended" },
        { planName:"IFP EMB PED Vision HMO Jan17 (Inactive)",     payorId:"BCBS-CA", memberId:"2001V0000346", coverageDate:"09/01/21 – Open-ended" },
      ],
      pcp: { physicianName:"Dr. Tiffney Taylor", phoneNumber:"(888) 560-8799", pcpGroupNumber:"NPI 1003116674", address:"265 Posada Ln Ste B, Templeton, CA 93465" },
      tiers: [
        { name:"Individual · In-Network", deductible:{ total:0, used:0, remaining:0 }, oop:{ total:1150, used:710.99, remaining:439.01  }, network:"in" },
        { name:"Family · In-Network",     deductible:{ total:0, used:0, remaining:0 }, oop:{ total:2300, used:710.99, remaining:1589.01 }, network:"in" },
      ],
      alerts: [
        { kind:"warning", title:"Mixed Coverage detected", body:"Family (Silver 94 Trio HMO Jan25) is Active. Spouse & Children Dental + Vision (IFP EMB PED) are Inactive. Verify pediatric coverage before scheduling." },
        { kind:"info",    title:"Deductible already at $0", body:"$0 calendar-year deductible. Co-insurance (typically 10%) and per-visit copays apply for in-network services." },
        { kind:"info",    title:"Authorization required for inpatient", body:"Inpatient hospital + psychiatric admissions require pre-auth via Blue Shield of CA Authorization Dept — (800) 541-6652." },
      ],
      benefits: [
        { name:"Home Health", status:"Covered", fields:{ auth_required:false, copay:"$25 / visit", co_insurance:"10%", service_deductible:[ { name:"Individual", remaining:439.01, used:710.99, total:1150 }, { name:"Family", remaining:1589.01, used:710.99, total:2300 } ], visit_limit:60, visits_used:8, network_note:"In-network provider required" } },
        { name:"Emergency Room — Physician", status:"Covered", fields:{ auth_required:false, copay:"$0 / visit", network_note:"Physician benefit — Emergency Room (POS: Emergency Room - Hospital)" } },
        { name:"Emergency Room — Facility",  status:"Covered", fields:{ auth_required:false, copay:"$50 / visit", network_note:"Facility benefit — Emergency Room (POS: Emergency Room - Hospital)" } },
        { name:"Ambulance — Air",            status:"Covered", fields:{ auth_required:false, copay:"$30 / visit", network_note:"Physician benefit — Air ambulance (POS: Ambulance - Air or Water)" } },
        { name:"Ambulance — Surface",        status:"Covered", fields:{ auth_required:false, copay:"$30 / visit", network_note:"Physician benefit — Surface ambulance (POS: Ambulance - Land)" } },
        { name:"Urgent Care — Facility",     status:"Covered", fields:{ auth_required:false, copay:"$5 / visit",  network_note:"Urgent Care Center (POS: Emergency Room - Hospital)" } },
        { name:"Urgent Care — Office Visit", status:"Covered", fields:{ auth_required:false, copay:"$5 / visit",  network_note:"Physician benefit — Urgent office visit (POS: Office)" } },
        { name:"Hospital — Inpatient",       status:"Requires Auth", fields:{ auth_required:true,  co_insurance:"10%", prior_auth_phone:"(800) 541-6652", network_note:"Authorization required: Blue Shield of CA Auth Dept. Fax (844) 295-4637. Includes alcohol/substance detox, mental health, maternity delivery, dental medical, transplant. Excludes maternity (auth)." } },
        { name:"Hospital — Outpatient",      status:"Covered",       fields:{ auth_required:false, co_insurance:"10%", network_note:"Outpatient hospital + ambulatory surgery center: procedures, surgeries, facility fees, newborn services." } },
        { name:"Mental Health — Inpatient",  status:"Requires Auth", fields:{ auth_required:true,  co_insurance:"10%", prior_auth_phone:"(800) 541-6652", network_note:"Inpatient psychiatric facility — sub abuse, mental health" } },
        { name:"Pharmacy",                   status:"Covered",       fields:{ auth_required:false, network_note:"Active coverage — refer to plan formulary for tier pricing" } },
        { name:"Dental Care",                status:"Covered",       fields:{ auth_required:false, network_note:"Adult dental: Active in-network. Pediatric dental (IFP EMB PED) on separate plan: Inactive." } },
        { name:"Physician — Preventive Care",       status:"Covered", fields:{ auth_required:false, copay:"$0 / visit", network_note:"Preventive health care services: annual checkups, screenings (POS: Office)" } },
        { name:"Physician — Diabetes Care",          status:"Covered", fields:{ auth_required:false, copay:"$0 / visit", network_note:"Diabetic counseling + self-management training (POS: Home)" } },
        { name:"Physician — Specialist Office Visit",status:"Covered", fields:{ auth_required:false, copay:"$8 / visit", network_note:"Access Plus self-referral: lab specialist, radiology specialist, office consultation, second opinion" } },
        { name:"Podiatrist Office Visit",            status:"Covered", fields:{ auth_required:false, copay:"$5 / visit", network_note:"Physician services in office (POS: Office)" } },
      ],
      auths: [
        { num:"AUTH-9301", status:"Approved", service:"Hospital — Inpatient",      start:"02/06/25", end:"08/06/25", unitsTotal:5, unitsUsed:0 },
        { num:"AUTH-9302", status:"Pending",  service:"Mental Health — Inpatient", start:"02/06/25", end:"08/06/25", unitsTotal:7, unitsUsed:0 },
        { num:"AUTH-9303", status:"Approved", service:"Outpatient Surgery",        start:"02/06/25", end:"05/06/25", unitsTotal:1, unitsUsed:0 },
      ],
    },
  },
};

const COLORS = {
  textPri:"#1F2530", textBody:"#3A424A", textMute:"#6A717D", textFaint:"#8D949D",
  border:"#E8E9EA", divider:"#EEF0F3", blue:"#2F6FED", teal:"#276966",
  amber:"#E6A817", amberBg:"#FFFBF0", red:"#E53E3E", redBg:"#FFF5F5", green:"#1F7A3A", greenBg:"#E6F7E0", greenBd:"#9FCB8A",
  blueBg:"#F0F6FF",
};

// ── Header line builders ──────────────────────────────────────
const Inline = ({ children }) => <div style={{display:"flex",flexWrap:"wrap",gap:"2px 18px",font:"400 13px/20px Roboto",color:COLORS.textBody}}>{children}</div>;
const LabeledField = ({ label, value }) => (
  isPresent(value)
    ? <span><span style={{color:COLORS.textMute}}>{label}</span> <span style={{color:COLORS.textPri,fontWeight:500}}>{value}</span></span>
    : null
);
const Dot = () => <span style={{color:COLORS.textFaint}}>·</span>;

function StatusPill({ status }) {
  const m = {
    active:     { bg:"#E6F7E0", bd:"#9FCB8A", c:"#1F7A3A", label:"Active" },
    inactive:   { bg:"#FBE4E4", bd:"#E8A1A1", c:"#B92D2D", label:"Inactive" },
    terminated: { bg:"#FFFBE6", bd:"#FFE58F", c:"#9C7719", label:"Termed" },
  };
  const s = m[status] || m.active;
  return <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 12px",borderRadius:999,background:s.bg,border:`1px solid ${s.bd}`,color:s.c,font:"500 12px/16px Roboto"}}>{s.label==="Active" && <span>✓</span>}{s.label}</span>;
}

function PatientHeader({ patient, plan, onClose, slim }) {
  const nameParts = (patient.name || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "—";
  const lastName  = nameParts.slice(1).join(" ");

  const fields = [
    { key:"mrn",          label:"MRN",                        value:patient.mrn },
    { key:"dob",          label:"DOB",                        value:patient.dob },
    { key:"memberId",     label:"Mem ID",                     value:patient.memberId },
    { key:"relationship", label:"Relationship to Subscriber", value:patient.relationship },
    { key:"payorName",    label:"Payor Name",                 value:patient.payorName },
    { key:"payorSource",  label:"Payor Source",               value:patient.payorSource },
    { key:"payorType",    label:"Payor Type",                 value:patient.payorType || patient.planType },
    { key:"gateway",      label:"Gateway",                    value:patient.gateway },
    { key:"startOfCare",  label:"Start of Care",              value:patient.startOfCare },
  ].filter(f => isPresent(f.value))
   .filter(f => !slim || ["mrn","memberId","startOfCare"].includes(f.key));

  return (
    <div style={{position:"relative",padding:"22px clamp(16px, 2.4vw, 36px) 18px",background:"#fff"}}>
      <button onClick={onClose} aria-label="Close" style={{position:"absolute",top:14,right:14,background:"transparent",border:"none",color:COLORS.textMute,fontSize:20,cursor:"pointer",lineHeight:1,padding:6}}>✕</button>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:32,flexWrap:"wrap"}}>
        {/* Name — single line, left-aligned, bold */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",lineHeight:"1.1",flexShrink:0}}>
          <div style={{font:"400 13px/16px Roboto",color:"#6B7280",marginBottom:4}}>Patient Name</div>
          <span style={{font:"700 28px/1.1 Roboto",color:"#111827",whiteSpace:"nowrap"}}>{patient.name || firstName}</span>
        </div>
        {/* Metadata grid — bottom-aligned label-on-top fields */}
        <div style={{display:"flex",flexWrap:"wrap",gap:"14px 28px",alignItems:"flex-start",flex:1,minWidth:0,paddingRight:32,paddingTop:2}}>
          {fields.map(f => (
            <div key={f.key} style={{display:"flex",flexDirection:"column",minWidth:0}}>
              <div style={{font:"400 11px/14px Roboto",color:"#6B7280",letterSpacing:"0.01em"}}>{f.label}</div>
              <div style={{font:"500 14px/18px Roboto",color:"#111827",marginTop:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:260}}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TierChips({ plan, alertCount }) {
  if (!plan) return null;
  const chips = [];
  if (isPresent(plan.network))     chips.push({ key:"net",   text: plan.network });
  if (isPresent(plan.groupNumber)) chips.push({ key:"grp",   text: `Group ${plan.groupNumber}` });
  if (isPresent(plan.startDate) || isPresent(plan.endDate)) chips.push({ key:"r", text: `${plan.startDate || "—"} → ${plan.endDate || "—"}` });
  if (alertCount > 0) chips.push({ key:"a", text:`${alertCount} alert${alertCount>1?"s":""}`, tone:"warn" });
  if (!chips.length) return null;
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:6,padding:"10px clamp(16px, 2.4vw, 36px) 12px",background:"#fff"}}>
      {chips.map(c=>{
        const warn = c.tone==="warn";
        return (
          <span key={c.key} style={{display:"inline-block",padding:"3px 10px",borderRadius:999,background:warn?COLORS.amberBg:"#FAFBFC",border:`1px solid ${warn?"#F1D89A":COLORS.border}`,color:warn?"#8A6A14":COLORS.textBody,font:"400 12px/16px Roboto"}}>{c.text}</span>
        );
      })}
    </div>
  );
}

function TabBar({ active, onTab, onAutoLog, notifOnly }) {
  const only = notifOnly === true ? "notif" : notifOnly === "eligStd" ? "elig" : (notifOnly || null);
  const Tab = ({ k, label }) => {
    if (only && only !== k) return null;
    const isActive = active === k;
    return (
      <button onClick={()=>onTab(k)} style={{background:isActive?"#fff":"transparent",border:isActive?"1px solid #CFCFCF":"none",borderBottom:isActive?"1px solid #fff":"none",borderRadius:"6px 6px 0 0",cursor:"pointer",padding:"9px 18px",font:`${isActive?500:400} 14px/18px Roboto`,color:isActive?COLORS.blue:COLORS.textBody,marginRight:4,marginBottom:-1,position:"relative",zIndex:isActive?2:1}}>{label}</button>
    );
  };
  return (
    <div style={{display:"flex",alignItems:"flex-end",padding:"12px 0 0",background:"#fff",borderBottom:"1px solid #CFCFCF"}}>
      {<Tab k="elig" label="Eligibility Info" />}
      {<Tab k="auth" label="Authorization Info" />}
      {<Tab k="pcr" label="PCR Info" />}
      {typeof window!=="undefined" && (window.V2_PATIENT_TABS||[]).map(([k,l]) => <Tab key={k} k={"v2"+k} label={l} />)}
      {<Tab k="referral" label="Ereferral Info" />}
      {<Tab k="eligAlert" label="Eligibility Alerts" />}
      {<Tab k="hoIntake" label="HO Intake" />}
      <Tab k="notif" label="Notification Info" />
      {typeof window!=="undefined" && window.__recForDrawer && window.REC_TAB_LABEL && <Tab k={"rec_" + window.__recForDrawer.kind} label={window.REC_TAB_LABEL[window.__recForDrawer.kind]} />}
      {!only && <a href="#" onClick={(e)=>{e.preventDefault(); onAutoLog&&onAutoLog();}} style={{marginLeft:"auto",marginBottom:10,font:"400 13px/16px Roboto",color:COLORS.blue,textDecoration:"none"}}>Automation Log</a>}
    </div>
  );
}

// ── Tier card (Plan Benefit) ─────────────────────────────────
function tierAccent(name){
  const s = name || "";
  if (/Dependent|Domestic Partner/i.test(s)) return "#7c3aed";        // purple
  if (/Out[- ]of[- ]Network|OON/i.test(s))   return "#94a3b8";        // slate
  return "#2563eb";                                                    // blue
}
function tierNetworkPill(name){
  const s = name || "";
  if (/Dependent|Domestic Partner/i.test(s)) return { bg:"#f5f3ff", c:"#6d28d9", bd:"#ddd6fe", label: /Dependent/i.test(s) ? "Dependent" : "Domestic Partner" };
  if (/Out[- ]of[- ]Network|OON/i.test(s))   return { bg:"#f8fafc", c:"#64748b", bd:"#e2e8f0", label:"Out-of-Network" };
  if (/In[- ]Network/i.test(s))              return { bg:"#eff6ff", c:"#1d4ed8", bd:"#bfdbfe", label:"In-Network" };
  return null;
}
function tierBaseName(name){
  // Strip the " · <network>" suffix when present so the chip carries network info.
  const s = name || "";
  const idx = s.indexOf(" · ");
  if (idx === -1) return s;
  const head = s.slice(0, idx);
  const tail = s.slice(idx + 3);
  // If the qualifier IS the network suffix, drop it; otherwise keep entire name.
  if (/^(In[- ]Network|Out[- ]of[- ]Network|OON)$/i.test(tail)) return head;
  return s;
}

// Variant: 'default' (Medicare Advantage / Sparse Payload), 'option-b' (Commercial PPO), 'option-c' (Medicaid)
function getPlanCardVariant(payloadKey){
  if (payloadKey === "commercial_ppo") return "option-b";
  if (payloadKey === "medicaid")       return "option-c";
  return "default";
}

function TierCardDefault({ tier }) {
  const accent = tierAccent(tier.name);
  const parts = (tier.name || "").split(" · ");
  const primary = parts[0] || "";
  const secondary = parts.slice(1).join(" · ");

  const Metric = ({ label, total, used, remaining }) => {
    const hasAmount = isPresent(remaining);
    const pct = pctSafe(used, total);
    return (
      <div>
        <div style={{font:"600 10px/14px Roboto",color:"#94a3b8",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5}}>{label}</div>
        {hasAmount ? (
          <React.Fragment>
            <div style={{font:"600 24px/1 Roboto",color:"#0f172a",marginBottom:3}}>{fmtMoney(remaining)}</div>
            {(isPresent(used) || isPresent(total)) && (
              <div style={{font:"400 12px/16px Roboto",color:"#94a3b8",marginBottom:8}}>{fmtMoney(used)} of {fmtMoney(total)}</div>
            )}
            {pct!==null && (
              <div style={{height:3,background:"#f1f5f9",borderRadius:2,overflow:"hidden"}}>
                <div style={{width:`${pct}%`,height:"100%",background:accent,borderRadius:2}}></div>
              </div>
            )}
          </React.Fragment>
        ) : (
          <div style={{font:"500 20px/1 Roboto",color:"#cbd5e1"}}>—</div>
        )}
      </div>
    );
  };

  return (
    <div className="ed-tier-card" style={{
      borderRadius:12,
      padding:"20px 24px",
      background:"#fff",
      boxShadow:"0 1px 2px rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.06)",
      transition:"box-shadow 0.15s ease, transform 0.15s ease",
    }}>
      <div style={{marginBottom:18,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
        <span style={{font:"500 14px/18px Roboto",color:"#0f172a"}}>{primary}</span>
        {secondary && <span style={{font:"400 13px/18px Roboto",color:"#94a3b8"}}> · {secondary}</span>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:28}}>
        <Metric label="Deductible Remaining"     total={tier.deductible && tier.deductible.total} used={tier.deductible && tier.deductible.used} remaining={tier.deductible && tier.deductible.remaining} />
        <Metric label="Out-of-Pocket Remaining" total={tier.oop && tier.oop.total}                used={tier.oop && tier.oop.used}                remaining={tier.oop && tier.oop.remaining} />
      </div>
    </div>
  );
}

// Option B — Commercial PPO. Header chip carries the network type; body is
// stacked rows (label left, amount + subtext right). No progress bars.
function TierCardOptionB({ tier }) {
  const pill = tierNetworkPill(tier.name);
  const base = tierBaseName(tier.name);
  const Row = ({ label, total, used, remaining, last }) => {
    const hasAmount = isPresent(remaining);
    return (
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px 16px",borderBottom: last ? "none" : "1px solid #f8fafc",gap:12}}>
        <div style={{font:"400 12px/18px Roboto",color:"#94a3b8"}}>{label}</div>
        <div style={{textAlign:"right",minWidth:0}}>
          {hasAmount ? (
            <React.Fragment>
              <div style={{font:"500 14px/18px Roboto",color:"#0f172a"}}>{fmtMoney(remaining)}</div>
              {(isPresent(used) || isPresent(total)) && (
                <div style={{font:"400 11px/14px Roboto",color:"#94a3b8",marginTop:1}}>{fmtMoney(used)} of {fmtMoney(total)}</div>
              )}
            </React.Fragment>
          ) : (
            <div style={{font:"500 14px/18px Roboto",color:"#cbd5e1"}}>—</div>
          )}
        </div>
      </div>
    );
  };
  return (
    <div className="ed-tier-card" style={{
      borderRadius:12,
      border:"1px solid #e2e8f0",
      background:"#fff",
      overflow:"hidden",
      transition:"box-shadow 0.15s ease",
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:"1px solid #f1f5f9",gap:10}}>
        <span style={{font:"500 14px/18px Roboto",color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{base}</span>
        {pill && (
          <span style={{font:"500 11px/16px Roboto",padding:"2px 10px",borderRadius:20,background:pill.bg,color:pill.c,border:`1px solid ${pill.bd}`,whiteSpace:"nowrap"}}>{pill.label}</span>
        )}
      </div>
      <Row label="Deductible remaining" total={tier.deductible && tier.deductible.total} used={tier.deductible && tier.deductible.used} remaining={tier.deductible && tier.deductible.remaining} />
      <Row label="Out-of-pocket remaining" total={tier.oop && tier.oop.total} used={tier.oop && tier.oop.used} remaining={tier.oop && tier.oop.remaining} last />
    </div>
  );
}

// Option C — Medicaid. Bordered card with a divider between tier label and
// the 2-column metric grid (Deductible / Out-of-Pocket). No progress bar.
// Labels truncate with ellipsis + tooltip when space is tight.
function TierCardOptionC({ tier }) {
  const parts = (tier.name || "").split(" · ");
  const primary = parts[0] || "";
  const secondary = parts.slice(1).join(" · ");
  const Metric = ({ label, total, used, remaining }) => {
    const hasAmount = isPresent(remaining);
    return (
      <div style={{minWidth:0}}>
        <div
          title={label}
          style={{
            font:"600 11px/14px Roboto",
            letterSpacing:"0.08em",
            textTransform:"uppercase",
            color:"#94a3b8",
            marginBottom:6,
            whiteSpace:"nowrap",
            overflow:"hidden",
            textOverflow:"ellipsis",
          }}
        >
          {label}
        </div>
        {hasAmount ? (
          <React.Fragment>
            <div style={{font:"700 22px/1 Roboto",color:"#0f172a",marginBottom:4}}>{fmtMoney(remaining)}</div>
            {(isPresent(used) || isPresent(total)) && (
              <div style={{font:"400 12px/16px Roboto",color:"#94a3b8"}}>{fmtMoney(used)} of {fmtMoney(total)}</div>
            )}
          </React.Fragment>
        ) : (
          <div style={{font:"500 20px/1 Roboto",color:"#cbd5e1"}}>—</div>
        )}
      </div>
    );
  };
  return (
    <div className="ed-tier-card" style={{
      borderRadius:12,
      border:"1px solid #e2e8f0",
      background:"#fff",
      padding:"16px 22px",
      overflow:"hidden",
      transition:"box-shadow 0.15s ease",
    }}>
      <div style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",paddingBottom:12,borderBottom:"1px solid #f1f5f9"}}>
        <span style={{font:"600 14px/18px Roboto",color:"#0f172a"}}>{primary}</span>
        {secondary && <span style={{font:"400 13px/18px Roboto",color:"#94a3b8"}}> · {secondary}</span>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,paddingTop:14}}>
        <Metric label="Deductible Remaining"     total={tier.deductible && tier.deductible.total} used={tier.deductible && tier.deductible.used} remaining={tier.deductible && tier.deductible.remaining} />
        <Metric label="Out-of-Pocket Remaining" total={tier.oop && tier.oop.total}                used={tier.oop && tier.oop.used}                remaining={tier.oop && tier.oop.remaining} />
      </div>
    </div>
  );
}

function TierCard({ tier, variant }) {
  if (variant === "option-b") return <TierCardOptionB tier={tier} />;
  if (variant === "option-c") return <TierCardOptionC tier={tier} />;
  return <TierCardDefault tier={tier} />;
}

function TierGrid({ tiers, variant }) {
  if (!tiers || !tiers.length) return null;
  const n = tiers.length;
  const gap = variant === "default" ? 16 : 12;

  // Single tier: cap so it doesn't span the entire 85vw drawer.
  if (n===1) {
    return (
      <div style={{display:"grid",gridTemplateColumns:"minmax(280px, 520px)",gap}}>
        <TierCard tier={tiers[0]} variant={variant} />
      </div>
    );
  }

  // 5-card layout: 2 top · 3 bottom (Self tiers up top, Family + extras below).
  if (n===5) {
    return (
      <div style={{display:"flex",flexDirection:"column",gap}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2, minmax(0, 1fr))",gap}}>
          {tiers.slice(0,2).map((t,i)=>(<TierCard key={i} tier={t} variant={variant} />))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3, minmax(0, 1fr))",gap}}>
          {tiers.slice(2).map((t,i)=>(<TierCard key={i+2} tier={t} variant={variant} />))}
        </div>
      </div>
    );
  }

  // 6-card layout (e.g. Commercial PPO): 3×2 with a thin rule between rows.
  if (n===6) {
    return (
      <div style={{display:"flex",flexDirection:"column",gap}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3, minmax(0, 1fr))",gap}}>
          {tiers.slice(0,3).map((t,i)=>(<TierCard key={i} tier={t} variant={variant} />))}
        </div>
        <div style={{borderTop:"1px solid #f1f5f9"}}></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3, minmax(0, 1fr))",gap}}>
          {tiers.slice(3).map((t,i)=>(<TierCard key={i+3} tier={t} variant={variant} />))}
        </div>
      </div>
    );
  }

  // Responsive grid logic
  let cols, rows = null;
  if (n===2)       cols = "repeat(2, minmax(0, 1fr))";
  else if (n===3)  cols = "repeat(3, minmax(0, 1fr))";
  else if (n===4)  cols = "repeat(2, minmax(0, 1fr))";
  else if (n===5)  { cols = "repeat(3, minmax(0, 1fr))"; rows = [2,3]; }
  else if (n===7)  { cols = "repeat(4, minmax(0, 1fr))"; rows = [4,3]; }
  else             cols = "repeat(auto-fit, minmax(240px, 1fr))";

  if (!rows) {
    return (
      <div style={{display:"grid",gridTemplateColumns:cols,gap}}>
        {tiers.map((t,i)=>(<TierCard key={i} tier={t} variant={variant} />))}
      </div>
    );
  }
  const [r1, r2] = rows;
  return (
    <div style={{display:"flex",flexDirection:"column",gap}}>
      <div style={{display:"grid",gridTemplateColumns:cols,gap}}>
        {tiers.slice(0, r1).map((t,i)=>(<TierCard key={i} tier={t} variant={variant} />))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${r2}, minmax(0, ${r1 === 4 ? "calc(100%/4 - 12px)" : "calc(100%/3 - 11px)"}))`,gap,justifyContent:"center"}}>
        {tiers.slice(r1).map((t,i)=>(<TierCard key={i+r1} tier={t} variant={variant} />))}
      </div>
    </div>
  );
}

// ── Alerts ────────────────────────────────────────────────────
const ALERT_TONES = {
  warning: { bd:"#E6A817", bg:"#FFFBF0", titleC:"#8A6A14" },
  info:    { bd:"#2F6FED", bg:"#F0F6FF", titleC:"#1B4FCB" },
  error:   { bd:"#E53E3E", bg:"#FFF5F5", titleC:"#9B2C2C" },
};

function AlertsAccordion({ alerts }) {
  const [open, setOpen] = useED(() => { const v = !!window.__eligOpenAlerts; window.__eligOpenAlerts = false; return v; });
  if (!alerts || !alerts.length) return null;
  return (
    <div>
      <div onClick={()=>setOpen(v=>!v)} style={{display:"flex",alignItems:"center",cursor:"pointer",padding:"6px 0",font:"500 14px/18px Roboto",color:COLORS.textPri,gap:10}}>
        <span style={{display:"inline-block",transform:open?"rotate(90deg)":"none",transition:"transform .15s",fontSize:10,color:COLORS.textMute}}>▸</span>
        Eligibility Alerts
        <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:20,height:20,borderRadius:"50%",background:COLORS.amber,color:"#fff",font:"600 11px/20px Roboto"}}>{alerts.length}</span>
      </div>
      {open && (
        <div style={{display:"flex",flexDirection:"column",marginTop:6}}>
          {alerts.map((a,i)=>{
            const t = ALERT_TONES[a.kind] || ALERT_TONES.info;
            return (
              <div key={i} style={{background:t.bg,borderLeft:`3px solid ${t.bd}`,padding:"12px 16px",borderRadius:"0 8px 8px 0",marginBottom:10}}>
                {isPresent(a.title) && <div style={{font:"500 14px/18px Roboto",color:t.titleC}}>{a.title}</div>}
                {isPresent(a.body)  && <div style={{font:"400 13px/18px Roboto",color:COLORS.textBody,marginTop:isPresent(a.title)?4:0}}>{a.body}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Service Benefits (accordion rows) ─────────────────────────
const FIELD_LABELS = {
  auth_required:"Auth Required", copay:"Copay", co_insurance:"Co-Insurance",
  visit_limit:"Visit Limit", visits_used:"Visits Used",
  days_limit:"Days Limit", days_used:"Days Used",
  session_limit:"Session Limit", sessions_used:"Sessions Used",
  service_deductible:"Service Deductibles",
  prior_auth_phone:"Prior Auth Phone", network_note:"Network Note",
  // Additional coverage + PCP info
  plan_name:"Plan Name",
  payor_id:"Payor ID",
  member_id:"Member ID",
  coverage_date:"Coverage Date",
  physician_name:"Physician Name",
  phone_number:"Phone Number",
  pcp_group_number:"PCP Group Number",
  address:"Address",
};

const STATUS_DOT = { "Covered":"#16a34a", "Requires Auth":"#d97706", "Not Covered":"#dc2626" };

function CoverageBadgeV2({ status }) {
  const m = {
    "Covered":       { bg:"#f0fdf4", c:"#166534", bd:"#bbf7d0", label:"Active" },
    "Requires Auth": { bg:"#fffbeb", c:"#92400e", bd:"#fde68a", label:"Auth Required" },
    "Not Covered":   { bg:"#fef2f2", c:"#991b1b", bd:"#fecaca", label:"Inactive" },
  };
  const s = m[status] || { bg:"#f8fafc", c:"#475569", bd:"#e2e8f0", label:status||"Unknown" };
  return (
    <span style={{display:"inline-block",font:"500 11px/16px Roboto",padding:"3px 12px",borderRadius:20,background:s.bg,color:s.c,border:`1px solid ${s.bd}`,whiteSpace:"nowrap"}}>{s.label}</span>
  );
}

// Detects whether a service_deductible field uses the grouped structure
// (Individual / Family → In-Network / Out-of-Network).
function isGroupedDeductible(tiers) {
  return Array.isArray(tiers) && tiers.length>0 && tiers[0] && tiers[0].group === true && Array.isArray(tiers[0].columns);
}

// Renders the 6-column "divider-label" deductible table — two top-level
// group columns (Individual / Family), each split into sub-columns
// (In-Network / Out-of-Network), with horizontal dividers between rows
// of labels and values. Reused inside every Service-Benefit layout so the
// visual stays identical regardless of layout choice (A / B / C).
function GroupedDeductibleTable({ groups, dense }) {
  const totalCols = groups.reduce((n,g)=>n + ((g.columns && g.columns.length) || 0), 0) || 1;
  const cellPadV = dense ? 8 : 10;
  const cellPadH = dense ? 10 : 14;
  const borderCol = "#e2e8f0";
  const innerBorderCol = "#f1f5f9";
  return (
    <div style={{
      border:`1px solid ${borderCol}`,
      borderRadius:8,
      overflow:"hidden",
      background:"#fff",
      width:"100%",
    }}>
      {/* Row 1 — Group labels (Individual / Family) */}
      <div style={{display:"grid",gridTemplateColumns:groups.map(g=>`${g.columns.length}fr`).join(" "),background:"#f8fafc",borderBottom:`1px solid ${borderCol}`}}>
        {groups.map((g,gi)=>(
          <div key={gi} style={{
            padding:`${cellPadV}px ${cellPadH}px`,
            font:"600 11px/14px Roboto",
            letterSpacing:"0.08em",
            textTransform:"uppercase",
            color:"#475569",
            borderLeft: gi>0 ? `1px solid ${borderCol}` : "none",
            textAlign:"center",
          }}>{g.name}</div>
        ))}
      </div>
      {/* Row 2 — Sub-column labels (In-Network / Out-of-Network) */}
      <div style={{display:"grid",gridTemplateColumns:`repeat(${totalCols}, 1fr)`,borderBottom:`1px solid ${borderCol}`,background:"#fcfdfe"}}>
        {groups.flatMap((g,gi)=>g.columns.map((c,ci)=>{
          const isGroupStart = ci===0 && gi>0;
          return (
            <div key={`${gi}-${ci}`} style={{
              padding:`${cellPadV-2}px ${cellPadH}px`,
              font:"500 12px/16px Roboto",
              color:"#2563eb",
              borderLeft: ci>0 || isGroupStart ? `1px solid ${isGroupStart ? borderCol : innerBorderCol}` : "none",
            }}>{c.name}</div>
          );
        }))}
      </div>
      {/* Row 3 — Values */}
      <div style={{display:"grid",gridTemplateColumns:`repeat(${totalCols}, 1fr)`}}>
        {groups.flatMap((g,gi)=>g.columns.map((c,ci)=>{
          const isGroupStart = ci===0 && gi>0;
          return (
            <div key={`v-${gi}-${ci}`} style={{
              padding:`${cellPadV}px ${cellPadH}px`,
              borderLeft: ci>0 || isGroupStart ? `1px solid ${isGroupStart ? borderCol : innerBorderCol}` : "none",
              minWidth:0,
            }}>
              <div style={{font:`600 ${dense?13:15}px/18px Roboto`,color:"#0f172a"}}>
                {fmtMoney(c.remaining)}
                <span style={{color:"#94a3b8",fontWeight:400,fontSize:11,marginLeft:5}}>remaining</span>
              </div>
              <div style={{font:"400 11px/14px Roboto",color:"#94a3b8",marginTop:3}}>{fmtMoney(c.used)} of {fmtMoney(c.total)}</div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}

// Shared block for the `service_deductible` field. Two render modes:
//   • Grouped (6-column divider-label table) — when data has `group:true`
//     entries with `columns` arrays. Used by Robert Fox.
//   • Flat — original side-by-side tiers. Used by Marvin McKinney etc.
// Both modes cascade unchanged through Layouts A / B / C.
function ServiceDeductibleBlock({ tiers, compact, columns }) {
  if (!Array.isArray(tiers) || !tiers.length) return null;
  if (isGroupedDeductible(tiers)) {
    return <GroupedDeductibleTable groups={tiers} dense={!!compact} />;
  }
  const renderTier = (t) => (
    <div style={{minWidth:0}}>
      <div style={{font:`500 ${compact?12:13}px/16px Roboto`,color:"#2563eb"}}>{t.name}</div>
      <div style={{font:`500 ${compact?14:16}px/20px Roboto`,color:"#0f172a",marginTop:3}}>
        {fmtMoney(t.remaining)}
        <span style={{color:"#94a3b8",fontWeight:400,fontSize:11,marginLeft:5}}>remaining</span>
      </div>
      <div style={{font:"400 11px/14px Roboto",color:"#94a3b8",marginTop:3}}>{fmtMoney(t.used)} Used of {fmtMoney(t.total)}</div>
    </div>
  );
  if (columns) {
    // Layout B: grid that matches the parent's 3-col layout. No dividers
    // between tiers — alignment alone communicates the column grouping.
    return (
      <div style={{display:"grid",gridTemplateColumns:`repeat(${columns}, 1fr)`,width:"100%"}}>
        {tiers.map((t,i)=>(<React.Fragment key={i}>{renderTier(t)}</React.Fragment>))}
      </div>
    );
  }
  // Default flex layout (Layout A / Layout C): tiers sit close together
  // with a 48px gap rather than stretching across the full row.
  return (
    <div style={{display:"flex",alignItems:"flex-start",flexWrap:"wrap",gap:48}}>
      {tiers.map((t,i)=>(<React.Fragment key={i}>{renderTier(t)}</React.Fragment>))}
    </div>
  );
}

// Detects the column-matrix model: benefit declares `columns` and fields
// carry per-column arrays. Returns true when a fields object should be
// rendered as a matrix (labels left, one value column per network variant).
function hasColumnMatrix(columns) {
  return Array.isArray(columns) && columns.length > 1;
}

// Renders a single matrix cell value. Mirrors renderFieldValue but also
// knows how to draw the service_deductible mini-block ($X remaining / used).
function renderCellValue(key, value, fields, colIdx) {
  if (value === undefined || value === null || value === "") {
    return <span style={{color:"#cbd5e1"}}>—</span>;
  }
  if (key === "service_deductible" && value && typeof value === "object") {
    return (
      <div>
        <div style={{font:"600 14px/18px Roboto",color:"#0f172a"}}>
          {fmtMoney(value.remaining)}
          <span style={{color:"#94a3b8",fontWeight:400,fontSize:11,marginLeft:5}}>remaining</span>
        </div>
        <div style={{font:"400 11px/14px Roboto",color:"#94a3b8",marginTop:3}}>{fmtMoney(value.used)} of {fmtMoney(value.total)}</div>
      </div>
    );
  }
  if (key === "auth_required") {
    const yes = value === true;
    return <span style={{color:yes?"#d97706":"#16a34a",fontWeight:600}}>{yes?"Yes":"No"}</span>;
  }
  if (key === "visits_used") {
    const lim = Array.isArray(fields.visit_limit) ? fields.visit_limit[colIdx] : fields.visit_limit;
    if (isPresent(lim)) return <React.Fragment><span style={{color:"#0f172a"}}>{value}</span><span style={{color:"#94a3b8"}}> of {lim}</span></React.Fragment>;
  }
  if (key === "days_used") {
    const lim = Array.isArray(fields.days_limit) ? fields.days_limit[colIdx] : fields.days_limit;
    if (isPresent(lim)) return <React.Fragment><span style={{color:"#0f172a"}}>{value}</span><span style={{color:"#94a3b8"}}> of {lim}</span></React.Fragment>;
  }
  if (key === "visit_limit") return `${value} per year`;
  if (key === "days_limit")  return `${value} days`;
  if (key === "prior_auth_phone") return <span style={{color:"#2563eb"}}>{value}</span>;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

// Renders per-column (In-Network / Out-of-Network / …) values as side-by-side
// sub-columns in the Layout-B metric-tile idiom: network name in blue on top,
// value directly beneath — exactly the treatment the original tile grid uses
// for its Service Deductibles row (Individual / Family).
//   • compact (default for ordinary fields): networks sit close together with
//     a small gap so two fields fit on one row.
//   • spread (deductible / full-width rows): networks stretch across the row.
function ColumnGridValues({ keyName, values, columns, fields, spread }) {
  if (spread) {
    return (
      <div style={{display:"grid",gridTemplateColumns:`repeat(${columns.length}, minmax(0,1fr))`,gap:32,marginTop:2}}>
        {columns.map((c,ci)=>(
          <div key={ci} style={{minWidth:0}}>
            <div style={{font:"500 13px/18px Roboto",color:"#2563eb"}}>{c}</div>
            <div style={{font:"500 14px/20px Roboto",color:"#0f172a",marginTop:5,wordBreak:"break-word"}}>{renderCellValue(keyName, values[ci], fields, ci)}</div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:"6px 28px",marginTop:2}}>
      {columns.map((c,ci)=>(
        <div key={ci} style={{minWidth:84}}>
          <div style={{font:"500 12px/16px Roboto",color:"#2563eb"}}>{c}</div>
          <div style={{font:"500 14px/20px Roboto",color:"#0f172a",marginTop:4,wordBreak:"break-word"}}>{renderCellValue(keyName, values[ci], fields, ci)}</div>
        </div>
      ))}
    </div>
  );
}

// Renders per-column (In-Network / Out-of-Network / …) values stacked as
// "network label : value" rows, sized to drop into the ORIGINAL metric-tile
// (Layout B) and pill-chip (Layout C) designs without changing their chrome.
function NetworkValueRows({ keyName, values, columns, fields, size }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5,marginTop:2}}>
      {columns.map((c,ci)=>(
        <div key={ci} style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:14}}>
          <span style={{font:"500 11px/16px Roboto",color:"#2563eb",whiteSpace:"nowrap"}}>{c}</span>
          <span style={{font:`500 ${size||13}px/18px Roboto`,color:"#0f172a",textAlign:"right"}}>{renderCellValue(keyName, values[ci], fields, ci)}</span>
        </div>
      ))}
    </div>
  );
}

// Column-matrix renderer used by Robert Fox. Labels run down the left;
// each network variant (In-Network / Out-of-Network / …) is its own value
// column. A field whose value is a per-column array fills each column; a
// scalar field spans all value columns. Divider-label styling (horizontal
// rules between every label row, vertical rules between columns) is shared,
// while `variant` tunes chrome to match Layout A / B / C.
function BenefitMatrix({ fields, columns, variant }) {
  const keys = Object.keys(fields).filter(k => {
    const v = fields[k];
    return Array.isArray(v) ? v.length>0 : (isPresent(v) || v===false);
  });
  const nCol = columns.length;
  const borderCol = "#e2e8f0";
  const innerCol  = "#f1f5f9";
  // Variant chrome
  const outerStyle = variant === "C"
    ? { border:"none", borderRadius:0, background:"transparent" }
    : { border:`1px solid ${borderCol}`, borderRadius:10, background:"#fff", overflow:"hidden" };
  const headerBg = variant === "B" ? "#f1f5f9" : "#f8fafc";
  const labelColW = "minmax(150px, 0.9fr)";
  const gridCols = `${labelColW} repeat(${nCol}, 1fr)`;
  const headerColor = variant === "B" ? "#334155" : "#2563eb";

  return (
    <div style={{padding: variant==="C" ? "12px 18px 16px" : "14px 18px 18px"}}>
      <div style={outerStyle}>
        {/* Header row — empty corner + column (network) labels */}
        <div style={{display:"grid",gridTemplateColumns:gridCols,background:headerBg,borderBottom:`1px solid ${borderCol}`}}>
          <div style={{padding:"10px 14px",font:"600 10px/14px Roboto",letterSpacing:"0.07em",textTransform:"uppercase",color:"#94a3b8"}}>Benefit</div>
          {columns.map((c,ci)=>(
            <div key={ci} style={{
              padding:"10px 14px",
              font:"600 12px/16px Roboto",
              color:headerColor,
              borderLeft:`1px solid ${borderCol}`,
            }}>{c}</div>
          ))}
        </div>
        {/* One row per label */}
        {keys.map((k,ri)=>{
          const v = fields[k];
          const perCol = Array.isArray(v) && v.length === nCol;
          const last = ri === keys.length-1;
          return (
            <div key={k} style={{display:"grid",gridTemplateColumns:gridCols,borderBottom:last?"none":`1px solid ${innerCol}`}}>
              <div style={{padding:"11px 14px",font:"400 12px/18px Roboto",color:"#64748b",background: variant==="C" ? "transparent" : "#fcfdfe"}}>{FIELD_LABELS[k]||k}</div>
              {perCol
                ? v.map((cellVal,ci)=>(
                    <div key={ci} style={{padding:"11px 14px",font:"500 13px/18px Roboto",color:"#0f172a",borderLeft:`1px solid ${innerCol}`,minWidth:0,wordBreak:"break-word"}}>
                      {renderCellValue(k, cellVal, fields, ci)}
                    </div>
                  ))
                : (
                    // Scalar field — spans all value columns
                    <div style={{gridColumn:`2 / span ${nCol}`,padding:"11px 14px",font:"500 13px/18px Roboto",color:"#0f172a",borderLeft:`1px solid ${innerCol}`,wordBreak:"break-word"}}>
                      {scalarValueNode(k, v, fields)}
                    </div>
                  )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Renders a scalar (column-spanning) field value inside the matrix, reusing
// the limit/used pairing logic.
function scalarValueNode(key, value, fields) {
  if (key === "visits_used" && isPresent(fields.visit_limit))
    return <React.Fragment><span style={{color:"#0f172a"}}>{value}</span><span style={{color:"#94a3b8"}}> of {fields.visit_limit}</span></React.Fragment>;
  if (key === "days_used" && isPresent(fields.days_limit))
    return <React.Fragment><span style={{color:"#0f172a"}}>{value}</span><span style={{color:"#94a3b8"}}> of {fields.days_limit}</span></React.Fragment>;
  if (key === "visit_limit")   return `${value} per year`;
  if (key === "days_limit")    return `${value} days`;
  if (key === "session_limit") return `${value} per year`;
  return renderFieldValue(key, value, fields);
}

// Format a single field value according to its key. Returns a React node.
function renderFieldValue(key, value, fields, opts={}) {
  if (key === "auth_required") {
    const yes = value === true;
    return <span style={{color:yes?"#d97706":"#16a34a",fontWeight:600}}>{yes?"Yes":"No"}</span>;
  }
  if (key === "prior_auth_phone") {
    return <span style={{color:"#2563eb"}}>{value}</span>;
  }
  if (key === "visits_used" && isPresent(fields.visit_limit)) {
    return <React.Fragment><span style={{color:"#0f172a"}}>{value}</span><span style={{color:"#94a3b8"}}> of {fields.visit_limit}</span></React.Fragment>;
  }
  if (key === "days_used" && isPresent(fields.days_limit)) {
    return <React.Fragment><span style={{color:"#0f172a"}}>{value}</span><span style={{color:"#94a3b8"}}> of {fields.days_limit}</span></React.Fragment>;
  }
  if (key === "sessions_used" && isPresent(fields.session_limit)) {
    return <React.Fragment><span style={{color:"#0f172a"}}>{value}</span><span style={{color:"#94a3b8"}}> of {fields.session_limit}</span></React.Fragment>;
  }
  if (key === "visit_limit")   return `${value} per year`;
  if (key === "session_limit") return `${value} per year`;
  if (key === "days_limit")    return `${value} days`;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

// Layout A — Medicare Advantage / Sparse: two-column grid (label | value)
function BenefitContentA({ fields, columns }) {
  if (hasColumnMatrix(columns)) return <BenefitMatrix fields={fields} columns={columns} variant="A" />;
  const keys = Object.keys(fields).filter(k => isPresent(fields[k]) || fields[k]===false);
  return (
    <div style={{borderTop:"1px solid #f1f5f9"}}>
      {keys.map((k,i)=>{
        const isSvcDed = k === "service_deductible";
        const isGrouped = isSvcDed && isGroupedDeductible(fields[k]);
        // Grouped deductible breaks out of the 40/60 grid so its 6-column
        // divider-label table has the full row to breathe.
        if (isGrouped) {
          return (
            <div key={k} style={{padding:"12px 18px 14px",borderBottom:i<keys.length-1?"1px solid #f8fafc":"none"}}>
              <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginBottom:8}}>{FIELD_LABELS[k]||k}</div>
              <ServiceDeductibleBlock tiers={fields[k]} compact />
            </div>
          );
        }
        return (
          <div key={k} style={{display:"grid",gridTemplateColumns:"40% 60%",borderBottom:i<keys.length-1?"1px solid #f8fafc":"none",alignItems:isSvcDed?"flex-start":"stretch"}}>
            <div style={{padding:"10px 18px",font:"400 12px/18px Roboto",color:"#94a3b8",borderRight:"1px solid #f1f5f9"}}>{FIELD_LABELS[k]||k}</div>
            <div style={{padding:"10px 18px",font:"500 12px/18px Roboto",color:"#0f172a",wordBreak:"break-word"}}>
              {isSvcDed ? <ServiceDeductibleBlock tiers={fields[k]} compact /> : renderFieldValue(k, fields[k], fields)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Layout B — Commercial PPO: 3-column metric tile grid
function BenefitContentB({ fields, columns }) {
  const matrix = hasColumnMatrix(columns);
  const all = Object.keys(fields).filter(k => {
    const v = fields[k];
    return Array.isArray(v) ? v.length>0 : (isPresent(v) || v===false);
  });
  // service_deductible always renders LAST (below network_note), separated
  // from the rest by a divider line.
  const keys = all.filter(k => k !== "service_deductible")
                  .concat(all.includes("service_deductible") ? ["service_deductible"] : []);
  return (
    <div style={{display:"grid",gridTemplateColumns: matrix ? "repeat(2, 1fr)" : "repeat(3, 1fr)",padding:"16px 18px",columnGap: matrix ? 48 : 0,rowGap:0,borderTop:"1px solid #f1f5f9"}}>
      {keys.map(k=>{
        const v = fields[k];
        const perCol = matrix && Array.isArray(v) && v.length === columns.length;
        const isSvcDed = k === "service_deductible";
        // Only the deductible and the network note span the full row; ordinary
        // per-column fields stay one-per-cell so two sit side by side per row.
        const isFull = k === "network_note" || isSvcDed;
        const valStyle = { font:"500 14px/20px Roboto", color:"#0f172a" };
        if (k === "prior_auth_phone") { valStyle.color = "#2563eb"; valStyle.font = "500 13px/20px Roboto"; }
        return (
          <div key={k} style={{
            paddingBottom:16,
            gridColumn: isFull ? "1 / -1" : "auto",
            borderTop: isSvcDed ? "1px solid #f1f5f9" : "none",
            paddingTop: isSvcDed ? 16 : 0,
            marginTop: isSvcDed ? 4 : 0,
          }}>
            <div style={{font:"600 10px/14px Roboto",letterSpacing:"0.07em",textTransform:"uppercase",color:"#94a3b8",marginBottom:isSvcDed||perCol?10:5}}>{FIELD_LABELS[k]||k}</div>
            {perCol
              ? <ColumnGridValues keyName={k} values={v} columns={columns} fields={fields} spread={isSvcDed} />
              : isSvcDed
                ? <ServiceDeductibleBlock tiers={v} columns={3} />
                : <div style={valStyle}>{renderFieldValue(k, v, fields)}</div>}
          </div>
        );
      })}
    </div>
  );
}

// Layout C — Medicaid: floating pill chips
function BenefitContentC({ fields, columns }) {
  const matrix = hasColumnMatrix(columns);
  const keys = Object.keys(fields).filter(k => {
    const v = fields[k];
    return Array.isArray(v) ? v.length>0 : (isPresent(v) || v===false);
  });
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:10,padding:"14px 18px",borderTop:"1px solid #f1f5f9"}}>
      {keys.map(k=>{
        const v = fields[k];
        const perCol = matrix && Array.isArray(v) && v.length === columns.length;
        const isAuth   = k === "auth_required";
        const isNote   = k === "network_note";
        const isPhone  = k === "prior_auth_phone";
        const isSvcDed = k === "service_deductible";
        let chipBg = "#f8fafc";
        // auth bg only tints when it's a single scalar bool
        if (isAuth && !perCol) chipBg = v===true ? "#fffbeb" : "#f0fdf4";
        const valStyle = { font:"500 13px/18px Roboto", color:"#0f172a" };
        if (isPhone) { valStyle.color = "#2563eb"; valStyle.font = "500 12px/18px Roboto"; }
        // Per-column chips (and the deductible) get more room so both
        // network values sit comfortably inside the original chip.
        const wide = isSvcDed || perCol;
        return (
          <div key={k} style={{
            background: chipBg,
            borderRadius:8,
            padding:"9px 14px",
            display:"flex",
            flexDirection:"column",
            gap:wide?6:3,
            flex: isSvcDed ? "1 1 100%" : perCol ? "1 1 240px" : isNote ? "1 1 200px" : "0 0 auto",
            minWidth: isSvcDed ? "100%" : perCol ? 240 : isNote ? 200 : "auto",
          }}>
            <div style={{font:"600 10px/14px Roboto",letterSpacing:"0.06em",textTransform:"uppercase",color:"#94a3b8"}}>{FIELD_LABELS[k]||k}</div>
            {perCol
              ? <NetworkValueRows keyName={k} values={v} columns={columns} fields={fields} size={13} />
              : isSvcDed
                ? <ServiceDeductibleBlock tiers={v} compact />
                : <div style={valStyle}>{renderFieldValue(k, v, fields)}</div>}
          </div>
        );
      })}
    </div>
  );
}

function BenefitRow({ benefit, open, onToggle, layout }) {
  const Content = layout === "B" ? BenefitContentB : layout === "C" ? BenefitContentC : BenefitContentA;
  const hasFields = benefit.fields && Object.keys(benefit.fields).some(k => isPresent(benefit.fields[k]) || benefit.fields[k]===false);
  return (
    <div style={{border:"1px solid #e2e8f0",borderRadius:12,marginBottom:10,overflow:"hidden",background:"#fff"}}>
      <div
        onClick={onToggle}
        className="ed-benefit-header"
        style={{display:"flex",alignItems:"center",padding:"14px 18px",cursor:"pointer",gap:10}}
      >
        <span style={{
          display:"inline-flex",
          alignItems:"center",
          justifyContent:"center",
          width:12,
          color:"#94a3b8",
          fontSize:10,
          lineHeight:1,
          transition:"transform .15s ease",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          flexShrink:0,
        }}>▶</span>
        <span style={{font:"500 13px/18px Roboto",color:"#0f172a",flex:1}}>{benefit.name}</span>
        <CoverageBadgeV2 status={benefit.status} />
      </div>
      {open && hasFields && <Content fields={benefit.fields} columns={benefit.columns} />}
    </div>
  );
}

function BenefitsList({ benefits, layout }) {
  const [openIdx, setOpenIdx] = useED(0);
  if (!benefits || !benefits.length) return null;
  return (
    <div>
      {benefits.map((b,i)=>(
        <BenefitRow key={i} benefit={b} open={openIdx===i} onToggle={()=>setOpenIdx(openIdx===i?-1:i)} layout={layout} />
      ))}
    </div>
  );
}

// Generic accordion using the same layout vocabulary as Service Benefits
// (A/B/C), but without a coverage badge. Used by Additional Coverage and
// PCP Information sections so the visual language stays consistent.
function InfoAccordion({ title, subtitle, fields, open, onToggle, layout }) {
  const Content = layout === "B" ? BenefitContentB : layout === "C" ? BenefitContentC : BenefitContentA;
  const hasFields = fields && Object.keys(fields).some(k => isPresent(fields[k]) || fields[k]===false);
  return (
    <div style={{border:"1px solid #e2e8f0",borderRadius:12,marginBottom:10,overflow:"hidden",background:"#fff"}}>
      <div
        onClick={onToggle}
        className="ed-benefit-header"
        style={{display:"flex",alignItems:"center",padding:"14px 18px",cursor:"pointer",gap:12}}
      >
        <span style={{
          display:"inline-flex",
          alignItems:"center",
          justifyContent:"center",
          width:12,
          color:"#94a3b8",
          fontSize:10,
          lineHeight:1,
          transition:"transform .15s ease",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          flexShrink:0,
        }}>▶</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{font:"500 13px/18px Roboto",color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{title}</div>
          {subtitle && <div style={{font:"400 11px/14px Roboto",color:"#94a3b8",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{subtitle}</div>}
        </div>
      </div>
      {open && hasFields && <Content fields={fields} />}
    </div>
  );
}

function AdditionalCoverageList({ coverages, layout }) {
  const [openIdx, setOpenIdx] = useED(0);
  if (!coverages || !coverages.length) return null;
  return (
    <div>
      {coverages.map((c, i) => (
        <InfoAccordion
          key={i}
          title={`Additional Coverage ${String(i+1).padStart(2, "0")}`}
          subtitle={c.planName}
          fields={{
            plan_name:     c.planName,
            payor_id:      c.payorId,
            member_id:     c.memberId,
            coverage_date: c.coverageDate,
          }}
          open={openIdx === i}
          onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          layout={layout}
        />
      ))}
    </div>
  );
}

function PCPInformationCard({ pcp, layout }) {
  const [open, setOpen] = useED(true);
  if (!pcp) return null;
  return (
    <InfoAccordion
      title="Primary Care Provider"
      subtitle={pcp.physicianName}
      fields={{
        physician_name:   pcp.physicianName,
        phone_number:     pcp.phoneNumber,
        pcp_group_number: pcp.pcpGroupNumber,
        address:          pcp.address,
      }}
      open={open}
      onToggle={()=>setOpen(v=>!v)}
      layout={layout}
    />
  );
}

// ── Eligibility Info tab content ──────────────────────────────
const SectionTitle = ({ children, mt="2rem", mb=16 }) => <div style={{font:"500 15px/20px Roboto",color:COLORS.textPri,marginTop:mt,marginBottom:mb}}>{children}</div>;

// Plan selector row (slim, between tabs and verification card)
// The plan tabs ARE the sample-data switcher — each tab loads a different
// plan payload under the same patient header.
function PlanSelectorRow({ plan, payloadKey, onPayloadChange }) {
  if (!payloadKey && !onPayloadChange) return null;
  const current = SAMPLE_PAYLOADS[payloadKey];
  const isHidden = current && current.hidden;
  // When viewing a hidden (per-patient) payload, lock the tab strip to that
  // single tab — switching to a different sample tab would replace the
  // patient identity, which the demo flow doesn't support.
  const entries = isHidden
    ? [[payloadKey, current]]
    : Object.entries(SAMPLE_PAYLOADS).filter(([, p]) => !p.hidden);
  return (
    <div style={{display:"flex",alignItems:"center",padding:"6px clamp(16px, 2.4vw, 36px) 0",margin:"0 calc(-1 * clamp(16px, 2.4vw, 36px))",borderBottom:`1px solid ${COLORS.divider}`,font:"400 13px/18px Roboto",gap:18,flexWrap:"nowrap"}}>
      <div style={{display:"flex",alignItems:"stretch",gap:0,flex:1,minWidth:0,flexWrap:"nowrap",overflow:"hidden"}}>
        {entries.map(([k,p])=>{
          const sel = payloadKey===k;
          const planName = (p.data && p.data.plan && (p.data.plan.fullName || p.data.plan.payorName)) || p.label;
          return (
            <button
              key={k}
              onClick={()=>onPayloadChange && onPayloadChange(k)}
              title={`${p.label} — ${planName}`}
              style={{
                background:"transparent",
                border:"none",
                cursor:"pointer",
                padding:"8px 0 10px",
                marginRight:20,
                font:`${sel?500:400} 13px/18px Roboto`,
                color:sel?COLORS.blue:COLORS.textBody,
                borderBottom:`2px solid ${sel?COLORS.blue:"transparent"}`,
                marginBottom:-1,
                whiteSpace:"nowrap",
                display:"inline-flex",
                alignItems:"center",
                gap:6,
                minWidth:0,
              }}
            >
              <span style={{color:sel?COLORS.textMute:COLORS.textFaint,fontWeight:400,flexShrink:0}}>{p.label} —</span>
              <span style={{maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"inline-block"}}>{planName}</span>
            </button>
          );
        })}
      </div>
      <div style={{marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:6,color:COLORS.textMute,paddingBottom:8}}>
        Eligibility Check Date :
        <span style={{color:COLORS.blue,fontWeight:600}}>{plan && plan.checkDateOnly}</span>
        <span style={{fontSize:10,color:COLORS.textMute,cursor:"pointer"}}>▾</span>
      </div>
    </div>
  );
}

// Outlined chip used inside the verification card
function OutlinedChip({ label, value, valueColor, borderColor }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 12px",border:`1px solid ${borderColor||COLORS.border}`,borderRadius:20,font:"400 12px/16px Roboto",color:COLORS.textBody,whiteSpace:"nowrap"}}>
      <span style={{color:COLORS.textMute}}>{label}:</span>
      <span style={{color:valueColor||COLORS.textPri,fontWeight:500}}>{value}</span>
    </span>
  );
}

function PlanVerificationCard({ plan, response }) {
  const status = (plan && plan.status) || "active";
  const tones = {
    active:     { border:"#1F7A3A", heading:"#1A7F4B", badgeBg:"#1F7A3A", badgeC:"#fff", badgeLabel:"Active",           icon:"✓" },
    inactive:   { border:"#C0392B", heading:"#C0392B", badgeBg:"#DC2626", badgeC:"#fff", badgeLabel:"Inactive",         icon:"✕" },
    expiring:   { border:"#E6A817", heading:"#B8870F", badgeBg:"#E6A817", badgeC:"#fff", badgeLabel:"Expiring",         icon:"⏱" },
    mixed:      { border:"#8a6a14", heading:"#8a6a14", badgeBg:"#8a6a14", badgeC:"#fff", badgeLabel:"Mixed",            icon:"!" },
    pending:    { border:"#3f7ba8", heading:"#3f7ba8", badgeBg:"#eaf2f8", badgeC:"#3f7ba8", badgeLabel:"Pending Submission", icon:"○" },
    exception:  { border:"#f97316", heading:"#c2570a", badgeBg:"#fff7ed", badgeC:"#c2570a", badgeLabel:"Exception",       icon:"!" },
  };
  const t = tones[status] || tones.active;
  const r = response || {};
  const detailFields = [
    { k:"patientName",  label:"Patient Name",         valueStyle:{font:"500 14px/18px Roboto",color:COLORS.textPri} },
    { k:"gender",       label:"Gender" },
    { k:"relationship", label:"Reln. to Subscriber",  info:true },
    { k:"memberId",     label:"Member Id" },
    { k:"dob",          label:"DOB" },
    { k:"address",      label:"Address" },
    { k:"mbi",          label:"MBI" },
  ];
  const providerStatusColor = "#1F7A3A";
  return (
    <div style={{border:`1px solid ${COLORS.border}`,borderLeft:`3px solid ${t.border}`,borderRadius:8,padding:"20px clamp(16px, 2vw, 28px)",marginTop:16,background:"#fff",boxShadow:"0 1px 2px rgba(0,0,0,0.03)"}}>
      {/* Line 1: REF ID + Elig Check Date */}
      <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",font:"400 11px/14px Roboto",color:COLORS.textMute}}>
        {isPresent(plan && plan.refId) && <span>REF ID : <span style={{color:COLORS.textBody}}>{plan.refId}</span></span>}
        {isPresent(plan && plan.checkDate) && <span>Elig Check Date : <span style={{color:COLORS.textBody}}>{plan.checkDate}{plan.checkTime ? ` ${plan.checkTime}` : ""}</span></span>}
      </div>

      {/* Line 2: plan name + badge */}
      <div style={{display:"flex",alignItems:"flex-start",gap:14,marginTop:8}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{font:"500 18px/24px Roboto",color:t.heading}}>{(plan && plan.fullName) || "—"}</div>
          {/* Line 3: plan facts under the plan name (same meta-text style as REF ID) */}
          <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",font:"400 11px/14px Roboto",color:COLORS.textMute,marginTop:6}}>
            {isPresent(plan && plan.payorId)       && <span>Payor Id : <span style={{color:COLORS.textBody}}>{plan.payorId}</span></span>}
            {isPresent(plan && plan.planTypeShort) && <span>Plan Type : <span style={{color:COLORS.textBody}}>{plan.planTypeShort}</span></span>}
            {isPresent(plan && plan.groupNumber)   && <span>Group No : <span style={{color:COLORS.textBody}}>{plan.groupNumber}</span></span>}
            {isPresent(plan && plan.network)       && <span>Provider Status : <span style={{color:providerStatusColor,fontWeight:500}}>{plan.network}</span></span>}
          </div>
        </div>
        <div style={{display:"inline-flex",flexDirection:"column",alignItems:"stretch",flexShrink:0,gap:6}}>
          <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"5px 18px",background:t.badgeBg,color:t.badgeC,borderRadius:999,font:"500 13px/16px Roboto",width:"100%",boxSizing:"border-box"}}>
            <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:"rgba(255,255,255,0.25)",fontSize:10}}>{t.icon}</span>
            {t.badgeLabel}
          </span>
          {isPresent(plan && plan.startDate) && (
            <div style={{font:"500 12px/16px Roboto",color:t.heading,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,whiteSpace:"nowrap"}}>
              {plan.startDate} - {plan.endDate || "—"}
              <span style={{color:COLORS.textFaint,fontSize:11,cursor:"pointer"}}>ⓘ</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Patient Details — standalone card sitting beneath the Plan Verification Card.
function PatientDetailsCard({ response }) {
  const r = response || {};
  const detailFields = [
    { k:"patientName",  label:"Patient Name",         valueStyle:{font:"500 14px/18px Roboto",color:COLORS.textPri,marginTop:2} },
    { k:"gender",       label:"Gender" },
    { k:"relationship", label:"Reln. to Subscriber",  info:true },
    { k:"memberId",     label:"Member Id" },
    { k:"dob",          label:"DOB" },
    { k:"address",      label:"Address" },
    { k:"mbi",          label:"MBI" },
  ];
  const hasAny = detailFields.some(f => isPresent(r[f.k]));
  if (!hasAny) return null;
  return (
    <div style={{marginTop:18}}>
      <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:10,padding:"0 4px"}}>
        <span style={{font:"500 14px/18px Roboto",color:COLORS.textPri}}>Patient Details</span>
        <span style={{font:"400 12px/16px Roboto",color:COLORS.textMute,fontStyle:"italic"}}>(As per Plan's Eligibility response)</span>
      </div>
      <div style={{borderRadius:8,padding:"20px clamp(16px, 2vw, 28px)",background:"#fff",boxShadow:"0 1px 2px rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.06)"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:24}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:"12px 24px"}}>
              {detailFields.map(f => {
                const v = r[f.k];
                if (!isPresent(v)) return null;
                return (
                  <div key={f.k} style={{minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:4,font:"400 11px/14px Roboto",color:COLORS.textMute}}>
                      {f.label}
                      {f.info && <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:12,height:12,borderRadius:"50%",background:COLORS.blue,color:"#fff",fontSize:8,fontWeight:600}}>i</span>}
                    </div>
                    <div style={f.valueStyle || {font:"500 13px/16px Roboto",color:COLORS.textPri,marginTop:2}}>{v}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:0,flexShrink:0,alignSelf:"center"}}>
            <a href="#" onClick={(e)=>e.preventDefault()} style={{display:"flex",alignItems:"center",gap:10,color:COLORS.blue,textDecoration:"none",font:"500 13px/16px Roboto",cursor:"pointer",padding:"4px 16px 4px 4px"}}>
              <img src={(window.__resources&&window.__resources.payorEligibilityResponse)||"icons/payor-eligibility-response.png"} alt="" style={{width:28,height:28,objectFit:"contain",flexShrink:0}} />
              <span style={{maxWidth:96}}>Payor Eligibility Response</span>
            </a>
            <div style={{width:1,alignSelf:"stretch",background:COLORS.divider,margin:"4px 0"}}></div>
            <a href="#" onClick={(e)=>e.preventDefault()} style={{display:"flex",alignItems:"center",gap:10,color:COLORS.blue,textDecoration:"none",font:"500 13px/16px Roboto",cursor:"pointer",padding:"4px 4px 4px 16px"}}>
              <img src={(window.__resources&&window.__resources.memberIdCard)||"icons/member-id-card.png"} alt="" style={{width:32,height:32,objectFit:"contain",flexShrink:0}} />
              <span style={{maxWidth:80}}>Member ID Card</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Plan Benefits preview tweaks (inline dropdown next to header) ─
const PLAN_BENEFITS_TWEAK_OPTIONS = [
  { id:"default", label:"Default (from payload)" },
  { id:"empty",   label:"Without data" },
  { id:"one",     label:"1 card" },
  { id:"two",     label:"2 cards" },
  { id:"three",   label:"3 cards" },
  { id:"four",    label:"4 cards" },
  { id:"five",    label:"5 cards" },
  { id:"six",     label:"6 cards" },
];

// Stand-in tier blueprints used when the preview overrides the natural payload.
const SAMPLE_TIER_BLUEPRINTS = {
  one: [
    { name:"Individual · In-Network",     deductible:{ total:2000, used:450,  remaining:1550 }, oop:{ total:6500,  used:900,  remaining:5600 } },
  ],
  two: [
    { name:"Self · In-Network",            deductible:{ total:2000, used:450,  remaining:1550 }, oop:{ total:6500,  used:900,  remaining:5600 } },
    { name:"Family · In-Network",          deductible:{ total:4000, used:1200, remaining:2800 }, oop:{ total:13000, used:2400, remaining:10600 } },
  ],
  three: [
    { name:"Self · In-Network",            deductible:{ total:2000, used:450,  remaining:1550 }, oop:{ total:6500,  used:900,  remaining:5600 } },
    { name:"Family · In-Network",          deductible:{ total:4000, used:1200, remaining:2800 }, oop:{ total:13000, used:2400, remaining:10600 } },
    { name:"Dependent · In-Network",       deductible:{ total:2000, used:120,  remaining:1880 }, oop:{ total:6500,  used:240,  remaining:6260 } },
  ],
  four: [
    { name:"Self · In-Network",            deductible:{ total:2000, used:450,  remaining:1550 }, oop:{ total:6500,  used:900,  remaining:5600 } },
    { name:"Self · Out-of-Network",        deductible:{ total:4000, used:0,    remaining:4000 }, oop:{ total:12000, used:0,    remaining:12000 } },
    { name:"Family · In-Network",          deductible:{ total:4000, used:1200, remaining:2800 }, oop:{ total:13000, used:2400, remaining:10600 } },
    { name:"Family · Out-of-Network",      deductible:{ total:8000, used:0,    remaining:8000 }, oop:{ total:24000, used:0,    remaining:24000 } },
  ],
  five: [
    { name:"Self · In-Network",            deductible:{ total:2000, used:450,  remaining:1550 }, oop:{ total:6500,  used:900,  remaining:5600 } },
    { name:"Self · Out-of-Network",        deductible:{ total:4000, used:0,    remaining:4000 }, oop:{ total:12000, used:0,    remaining:12000 } },
    { name:"Family · In-Network",          deductible:{ total:4000, used:1200, remaining:2800 }, oop:{ total:13000, used:2400, remaining:10600 } },
    { name:"Family · Out-of-Network",      deductible:{ total:8000, used:0,    remaining:8000 }, oop:{ total:24000, used:0,    remaining:24000 } },
    { name:"Dependent · In-Network",       deductible:{ total:2000, used:120,  remaining:1880 }, oop:{ total:6500,  used:240,  remaining:6260 } },
  ],
  six: [
    { name:"Self · In-Network",            deductible:{ total:2000, used:450,  remaining:1550 }, oop:{ total:6500,  used:900,  remaining:5600 } },
    { name:"Self · Out-of-Network",        deductible:{ total:4000, used:0,    remaining:4000 }, oop:{ total:12000, used:0,    remaining:12000 } },
    { name:"Dependent · In-Network",       deductible:{ total:2000, used:120,  remaining:1880 }, oop:{ total:6500,  used:240,  remaining:6260 } },
    { name:"Domestic Partner · In-Network",deductible:{ total:2000, used:0,    remaining:2000 }, oop:{ total:6500,  used:0,    remaining:6500 } },
    { name:"Family · In-Network",          deductible:{ total:4000, used:1200, remaining:2800 }, oop:{ total:13000, used:2400, remaining:10600 } },
    { name:"Family · Out-of-Network",      deductible:{ total:8000, used:0,    remaining:8000 }, oop:{ total:24000, used:0,    remaining:24000 } },
  ],
};

function resolveTiers(tweak, naturalTiers){
  if (tweak === "default") return naturalTiers || [];
  if (tweak === "empty")   return [];
  return SAMPLE_TIER_BLUEPRINTS[tweak] || naturalTiers || [];
}

// Service Benefits preview — lets the user force a specific layout.
const SERVICE_BENEFITS_TWEAK_OPTIONS = [
  { id:"default", label:"Default (from payload)" },
  { id:"A",       label:"Two-column grid (Layout A)" },
  { id:"B",       label:"Metric tile grid (Layout B)" },
  { id:"C",       label:"Pill chips (Layout C)" },
];

// ── Plan Benefits sectioned preview tweaks ───────────────────
// Three independent dimensions: card style, data state, card count.
const PLAN_BENEFITS_STYLE_OPTIONS = [
  { id:"default", label:"Default (from tab)" },
  { id:"A",       label:"Option A — Shadow card with progress bar" },
  { id:"B",       label:"Option B — Bordered card with header chip" },
  { id:"C",       label:"Option C — Bordered card with divider" },
];
const PLAN_BENEFITS_DATA_OPTIONS = [
  { id:"default", label:"Default (from payload)" },
  { id:"filled",  label:"With data" },
  { id:"empty",   label:"Without data" },
];
const PLAN_BENEFITS_COUNT_OPTIONS = [
  { id:"default", label:"Default (from payload)" },
  { id:"one",     label:"1 card" },
  { id:"two",     label:"2 cards" },
  { id:"three",   label:"3 cards" },
  { id:"four",    label:"4 cards" },
  { id:"five",    label:"5 cards" },
  { id:"six",     label:"6 cards" },
];

// Pretty short labels surfaced as chips in the trigger pill.
const PLAN_BENEFITS_SHORT_LABEL = {
  style:   { A:"Option A", B:"Option B", C:"Option C" },
  data:    { filled:"With data", empty:"Without data" },
  count:   { one:"1 card", two:"2 cards", three:"3 cards", four:"4 cards", five:"5 cards", six:"6 cards" },
};

function styleTweakToVariant(styleTweak, payloadKey){
  if (styleTweak === "A") return "default";
  if (styleTweak === "B") return "option-b";
  if (styleTweak === "C") return "option-c";
  return getPlanCardVariant(payloadKey);
}

function resolvePlanBenefitTiers(tweaks, naturalTiers){
  if (tweaks.data === "empty") return [];
  if (tweaks.count !== "default") return SAMPLE_TIER_BLUEPRINTS[tweaks.count] || naturalTiers || [];
  // data === "filled" or "default" → fall back to payload's natural tiers
  return naturalTiers || [];
}

function PlanBenefitsPreviewHeader({ title, tweaks, onTweaks, mt=28, mb=16 }) {
  const [open, setOpen] = useED(false);
  const ref = useEDRef(null);
  useEDEffect(()=>{
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const activeChips = [
    tweaks.style !== "default" && PLAN_BENEFITS_SHORT_LABEL.style[tweaks.style],
    tweaks.data  !== "default" && PLAN_BENEFITS_SHORT_LABEL.data[tweaks.data],
    tweaks.count !== "default" && PLAN_BENEFITS_SHORT_LABEL.count[tweaks.count],
  ].filter(Boolean);
  const isCustom = activeChips.length > 0;

  const Section = ({ label, dim, options }) => (
    <div style={{padding:"4px 0"}}>
      <div style={{font:"600 10px/14px Roboto",letterSpacing:"0.06em",textTransform:"uppercase",color:COLORS.textMute,padding:"6px 10px 4px"}}>{label}</div>
      {options.map(o => {
        const sel = o.id === tweaks[dim];
        return (
          <button
            key={o.id}
            onClick={()=>onTweaks({ ...tweaks, [dim]: o.id })}
            style={{
              display:"flex",
              alignItems:"center",
              justifyContent:"space-between",
              width:"100%",
              background:sel?"#eff6ff":"transparent",
              border:"none",
              borderRadius:6,
              padding:"7px 10px",
              cursor:"pointer",
              font:`${sel?500:400} 12px/16px Roboto`,
              color:sel?"#1d4ed8":COLORS.textBody,
              textAlign:"left",
            }}
          >
            <span>{o.label}</span>
            {sel && <span style={{color:"#1d4ed8",fontSize:11}}>✓</span>}
          </button>
        );
      })}
    </div>
  );

  return (
    <div ref={ref} style={{display:"flex",alignItems:"center",gap:8,marginTop:mt,marginBottom:mb,position:"relative",flexWrap:"wrap"}}>
      <span style={{font:"500 15px/20px Roboto",color:COLORS.textPri}}>{title}</span>
      <button
        type="button"
        onClick={()=>setOpen(v=>!v)}
        title="Preview options"
        style={{
          display:"inline-flex",
          alignItems:"center",
          gap:6,
          padding:"2px 8px",
          background:isCustom?"#eff6ff":"transparent",
          border:`1px solid ${isCustom ? "#bfdbfe" : "transparent"}`,
          borderRadius:6,
          cursor:"pointer",
          color:isCustom?"#1d4ed8":COLORS.textMute,
          font:"500 11px/16px Roboto",
        }}
      >
        {activeChips.length > 0 && <span>{activeChips.join(" · ")}</span>}
        <span style={{fontSize:9,lineHeight:1,transition:"transform .15s",transform:open?"rotate(180deg)":"rotate(0)",display:"inline-block"}}>▼</span>
      </button>
      {isCustom && (
        <button
          type="button"
          onClick={()=>onTweaks({ style:"default", data:"default", count:"default" })}
          style={{background:"transparent",border:"none",cursor:"pointer",color:COLORS.textMute,font:"400 11px/16px Roboto",padding:"2px 4px"}}
          title="Reset to default"
        >
          Reset
        </button>
      )}
      {open && (
        <div style={{
          position:"absolute",
          top:"100%",
          left:0,
          marginTop:6,
          background:"#fff",
          border:`1px solid ${COLORS.border}`,
          borderRadius:8,
          boxShadow:"0 8px 24px rgba(15,23,42,0.12)",
          padding:"4px 6px",
          minWidth:300,
          zIndex:10,
        }}>
          <Section label="Card style" dim="style" options={PLAN_BENEFITS_STYLE_OPTIONS} />
          <div style={{borderTop:`1px solid ${COLORS.divider}`,margin:"4px 6px"}}></div>
          <Section label="Data" dim="data" options={PLAN_BENEFITS_DATA_OPTIONS} />
          <div style={{borderTop:`1px solid ${COLORS.divider}`,margin:"4px 6px"}}></div>
          <Section label="Number of cards" dim="count" options={PLAN_BENEFITS_COUNT_OPTIONS} />
        </div>
      )}
    </div>
  );
}

// Generic header with inline preview dropdown. Used for Service Benefits.
function PreviewHeader({ title, tweak, defaultTweak="default", options, onTweak, mt=28, mb=16 }) {
  const [open, setOpen] = useED(false);
  const ref = useEDRef(null);
  useEDEffect(()=>{
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const active = options.find(o => o.id === tweak) || options[0];
  const isCustom = tweak !== defaultTweak;
  return (
    <div ref={ref} style={{display:"flex",alignItems:"center",gap:8,marginTop:mt,marginBottom:mb,position:"relative"}}>
      <span style={{font:"500 15px/20px Roboto",color:COLORS.textPri}}>{title}</span>
      <button
        type="button"
        onClick={()=>setOpen(v=>!v)}
        title="Preview options"
        style={{
          display:"inline-flex",
          alignItems:"center",
          gap:6,
          padding:"2px 8px",
          background:isCustom?"#eff6ff":"transparent",
          border:`1px solid ${isCustom ? "#bfdbfe" : "transparent"}`,
          borderRadius:6,
          cursor:"pointer",
          color:isCustom?"#1d4ed8":COLORS.textMute,
          font:"500 11px/16px Roboto",
        }}
      >
        {isCustom && <span>{active.label}</span>}
        <span style={{fontSize:9,lineHeight:1,transition:"transform .15s",transform:open?"rotate(180deg)":"rotate(0)",display:"inline-block"}}>▼</span>
      </button>
      {open && (
        <div style={{
          position:"absolute",
          top:"100%",
          left:0,
          marginTop:6,
          background:"#fff",
          border:`1px solid ${COLORS.border}`,
          borderRadius:8,
          boxShadow:"0 8px 24px rgba(15,23,42,0.12)",
          padding:6,
          minWidth:240,
          zIndex:10,
        }}>
          <div style={{font:"600 10px/14px Roboto",letterSpacing:"0.06em",textTransform:"uppercase",color:COLORS.textMute,padding:"6px 10px 4px"}}>Preview options</div>
          {options.map(o => {
            const sel = o.id === tweak;
            return (
              <button
                key={o.id}
                onClick={()=>{ onTweak(o.id); setOpen(false); }}
                style={{
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"space-between",
                  width:"100%",
                  background:sel?"#eff6ff":"transparent",
                  border:"none",
                  borderRadius:6,
                  padding:"7px 10px",
                  cursor:"pointer",
                  font:`${sel?500:400} 12px/16px Roboto`,
                  color:sel?"#1d4ed8":COLORS.textBody,
                  textAlign:"left",
                }}
              >
                <span>{o.label}</span>
                {sel && <span style={{color:"#1d4ed8",fontSize:11}}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PlanBenefitsEmptyState() {
  return (
    <div style={{
      borderRadius:12,
      background:"#fff",
      padding:"40px 24px",
      textAlign:"center",
      color:COLORS.textMute,
      font:"400 13px/18px Roboto",
      boxShadow:"0 1px 2px rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.06)",
    }}>
      No plan benefits returned in this eligibility response.
    </div>
  );
}

function EligibilityInfo({ data, payloadKey, onPayloadChange }) {
  const defaultBenefitLayout = payloadKey === "commercial_ppo" ? "B"
                              : payloadKey === "medicaid"       ? "C"
                              : "A";
  const [planTweaks, setPlanTweaks] = useED({ style:"default", data:"default", count:"default" });
  const [benefitTweak, setBenefitTweak] = useED("default");
  // Reset preview tweaks when the user switches sample data tabs.
  useEDEffect(()=>{
    setPlanTweaks({ style:"default", data:"default", count:"default" });
    setBenefitTweak("default");
  }, [payloadKey]);
  const tierVariant = styleTweakToVariant(planTweaks.style, payloadKey);
  const tiersToShow = resolvePlanBenefitTiers(planTweaks, data.tiers);
  const effectiveBenefitLayout = benefitTweak === "default" ? defaultBenefitLayout : benefitTweak;
  return (
    <div style={{padding:"4px clamp(16px, 2.4vw, 36px) 32px"}}>
      <PlanSelectorRow plan={data.plan} payloadKey={payloadKey} onPayloadChange={onPayloadChange} />
      <PlanVerificationCard plan={data.plan} response={data.planResponse} />
      <PatientDetailsCard response={data.planResponse} />

      {data.alerts && data.alerts.length>0 && (
        <div style={{marginTop:24}}>
          <AlertsAccordion alerts={data.alerts} />
        </div>
      )}

      <PlanBenefitsPreviewHeader
        title="Plan Benefits"
        tweaks={planTweaks}
        onTweaks={setPlanTweaks}
      />
      {tiersToShow.length === 0
        ? <PlanBenefitsEmptyState />
        : <TierGrid tiers={tiersToShow} variant={tierVariant} />}

      {data.benefits && data.benefits.length>0 && (
        <React.Fragment>
          <PreviewHeader
            title="Service Benefits"
            tweak={benefitTweak}
            options={SERVICE_BENEFITS_TWEAK_OPTIONS}
            onTweak={setBenefitTweak}
            mt={32}
          />
          <BenefitsList benefits={data.benefits} layout={effectiveBenefitLayout} />
        </React.Fragment>
      )}

      {data.additionalCoverage && data.additionalCoverage.length>0 && (
        <React.Fragment>
          <SectionTitle mt="32px">Additional Coverage <span style={{color:COLORS.textMute,fontWeight:400}}>({String(data.additionalCoverage.length).padStart(2,"0")})</span></SectionTitle>
          <AdditionalCoverageList coverages={data.additionalCoverage} layout={effectiveBenefitLayout} />
        </React.Fragment>
      )}

      {data.pcp && (
        <React.Fragment>
          <SectionTitle mt="28px">PCP Information</SectionTitle>
          <PCPInformationCard pcp={data.pcp} layout={effectiveBenefitLayout} />
        </React.Fragment>
      )}
    </div>
  );
}

// ── Authorization Info tab content ────────────────────────────
const AUTH_C = {
  panelBg:"#FAFBFC", panelBd:"#EAECEF",
  chipBg:"#F4F5F7",
  headGray:"#F6F7F9", headLav:"#F3F2FB",
  rowBd:"#EEF0F3", tableBd:"#E8E9EC",
  green:"#1F9D57", blue:"#2F6FED",
  purpleC:"#6B5CD1", purpleBg:"#F4F2FD", purpleBd:"#DDD6F7",
};

function ChevRight({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{transform:open?"rotate(90deg)":"none",transition:"transform .15s",flexShrink:0}}>
      <path d="M9 6l6 6-6 6" stroke="#6A717D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{flexShrink:0,cursor:"pointer"}}>
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="#9AA0A8" strokeWidth="1.7"/>
      <path d="M5 15V5a2 2 0 012-2h8" stroke="#9AA0A8" strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style={{cursor:"pointer"}}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke={AUTH_C.blue} strokeWidth="1.7"/>
      <circle cx="12" cy="12" r="3" stroke={AUTH_C.blue} strokeWidth="1.7"/>
    </svg>
  );
}
function SaveColIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{cursor:"pointer"}}>
      <path d="M6 3h9l4 4v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" stroke={AUTH_C.blue} strokeWidth="1.7" strokeLinejoin="round"/>
      <path d="M8 3v5h6" stroke={AUTH_C.blue} strokeWidth="1.7" strokeLinejoin="round"/>
      <path d="M8 21v-5h8v5" stroke={AUTH_C.blue} strokeWidth="1.7" strokeLinejoin="round"/>
    </svg>
  );
}
function AuthDot({ color, text }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:7,whiteSpace:"nowrap"}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:color,flexShrink:0}}></span>
      <span style={{color,font:"400 13px/17px Roboto"}}>{text}</span>
    </span>
  );
}

function AuthAccordion({ title, children, defaultOpen, thin, headerBg, bold, right, borderColor }) {
  const [open, setOpen] = useED(!!defaultOpen);
  if (thin) return (
    <div style={{border:"1px solid #e2e8f0",borderRadius:6,background:"#fff",marginBottom:14,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:14,width:"100%",background:"#fff",border:"none",cursor:"pointer",padding:"15px 20px",font:"400 14px/20px Roboto",color:"#334155",textAlign:"left"}}>
        <ChevRight open={open} />
        <span>{title}</span>
      </button>
      {open && <div style={{padding:"4px 20px 20px",borderTop:"1px solid #eef2f7"}}>{children}</div>}
    </div>
  );
  return (
    <div style={{border:`1px solid ${borderColor||AUTH_C.panelBd}`,borderRadius:8,background:headerBg||AUTH_C.panelBg,marginBottom:14,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center"}}>
        <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:16,flex:1,minWidth:0,background:"transparent",border:"none",cursor:"pointer",padding:"16px 22px",font:`${bold?600:400} 15px/20px Roboto`,color:COLORS.textPri,textAlign:"left"}}>
          <ChevRight open={open} />
          <span>{title}</span>
        </button>
        {right && <div style={{flexShrink:0,padding:"0 22px"}}>{right}</div>}
      </div>
      {open && (
        <div style={{padding:"18px 24px 24px 50px",background:headerBg?headerBg:"#fff",borderTop:`1px solid ${borderColor||AUTH_C.panelBd}`}}>{children}</div>
      )}
    </div>
  );
}

// Label-over-value field, matching the Figma slideout typography.
function LV({ label, value, labelColor, w }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6,minWidth:0,width:w}}>
      <span style={{font:"400 14px/18px Roboto",color:labelColor||"rgba(0,0,0,0.45)",whiteSpace:"nowrap"}}>{label}</span>
      <span style={{font:"400 16px/20px Roboto",color:"rgba(0,0,0,0.88)"}}>{value}</span>
    </div>
  );
}
const NAVY = "rgb(15,15,89)";
const DXBLUE = "rgb(22,119,255)";

function ReferralContent() {
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:"20px 48px"}}>
      <LV label="Referring Facility" value="252 Abby Knolls Apt. 796, Tennessee-21346" />
      <LV label="Referring Source" value="Dr. John Smith" />
      <LV label="Referral Date" value="01/10/23" />
    </div>
  );
}
function ProviderContent() {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:22}}>
      <div>
        <div style={{font:"500 14px/18px Roboto",color:"#000",marginBottom:16}}>Ordering Provider</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"18px 42px"}}>
          <LV label="Provider Name" value="Dr. John Smith" labelColor={NAVY} />
          <LV label="NPI" value="11521357" labelColor={NAVY} />
          <LV label="Address" value="252 Abby Knolls Apt. 796" labelColor={NAVY} />
          <LV label="City" value="Marielleshire" labelColor={NAVY} />
          <LV label="State" value="Tennessee" labelColor={NAVY} />
          <LV label="Zipcode" value="21346" labelColor={NAVY} />
        </div>
      </div>
      <div style={{height:1,background:"rgb(240,238,238)"}}></div>
      <div>
        <div style={{font:"500 14px/18px Roboto",color:"#000",marginBottom:16}}>Service Provider</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"18px 36px"}}>
          <LV label="Agency Name" value="Alvita Care" labelColor={NAVY} />
          <LV label="NPI" value="11521357" labelColor={NAVY} />
          <LV label="Facility Address" value="252 Abby Knolls Apt. 796" labelColor={NAVY} />
          <LV label="City" value="Marielleshire" labelColor={NAVY} />
          <LV label="State" value="Tennessee" labelColor={NAVY} />
          <LV label="Zipcode" value="21346" labelColor={NAVY} />
          <LV label="Contact Name" value="Joseph Deo" labelColor={NAVY} />
          <LV label="Contact Phone" value="720-429-1385" labelColor={NAVY} />
        </div>
      </div>
    </div>
  );
}
function DiagnosisContent() {
  const rows = [
    { code:"Diagnosis Code  (Primary)", val:"Z47.1",   desc:"Aftercare following joint replacement surgery(use additional code to identify joint)" },
    { code:"Diagnosis Code",            val:"Z51.89",  desc:"Encounter for other specified aftercare" },
    { code:"Diagnosis Code",            val:"Z48.812", desc:"Encounter for surgical aftercare following surgery on the circulatory system" },
  ];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:22}}>
      {rows.map((d,i)=>(
        <div key={i} style={{display:"flex",gap:42,flexWrap:"wrap"}}>
          <LV label={d.code} value={d.val} labelColor={DXBLUE} w={200} />
          <LV label="Diagnosis Description" value={d.desc} labelColor={NAVY} />
        </div>
      ))}
    </div>
  );
}

function EpisodeStat({ label, value }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:20,background:AUTH_C.chipBg,borderRadius:8,padding:"15px 22px"}}>
      <span style={{font:"400 13px/17px Roboto",color:COLORS.textMute,maxWidth:64}}>{label}</span>
      <span style={{font:"500 15px/20px Roboto",color:COLORS.textPri,marginLeft:"auto",whiteSpace:"nowrap"}}>{value}</span>
    </div>
  );
}

const AUTH_COLS = [
  { key:"svc",     head:"SVC",                  w:56 },
  { key:"refId",   head:"Ref ID",               w:104 },
  { key:"auth",    head:"Authorization#",       w:146, copy:true },
  { key:"track",   head:"Auth Tracking#",       w:120 },
  { key:"init",    head:"Auth Init Dt",         w:96 },
  { key:"sub",     head:"Auth Sub Dt",          w:96 },
  { key:"req",     head:"Auth Req St & End Dt", w:156 },
  { key:"resp",    head:"Resp. Dt",             w:88,  grp:true },
  { key:"appr",    head:"Approved St & End Dt", w:156, grp:true },
  { key:"reqN",    head:"Req",                  w:52 },
  { key:"apprN",   head:"Approved",             w:88,  pill:true },
  { key:"denied",  head:"Denied",               w:76 },
  { key:"pending", head:"Pending",              w:80 },
  { key:"expire",  head:"Days to Expire",       w:106 },
  { key:"at",      head:"AT Status",            w:126, dot:AUTH_C.blue },
  { key:"status",  head:"Auth Status",          w:126, dot:AUTH_C.green },
];

function AuthRow({ r, onEye }) {
  return (
    <tr>
      {AUTH_COLS.map((c)=>{
        const v = r[c.key];
        let inner;
        const isDash = v==="-" || v===undefined || v==="";
        if (isDash) {
          inner = <span style={{color:"#cbd5e1"}}>-</span>;
        } else if (c.copy) {
          inner = <span style={{display:"inline-flex",alignItems:"center",gap:8}}>{v}<CopyIcon /></span>;
        } else if (c.pill) {
          inner = <span style={{display:"inline-block",minWidth:26,textAlign:"center",padding:"3px 9px",borderRadius:999,background:AUTH_C.green,color:"#fff",font:"500 12px/14px Roboto"}}>{v}</span>;
        } else if (c.dot) {
          inner = <AuthDot color={(c.key==="status" && r.statusColor) ? r.statusColor : c.dot} text={v} />;
        } else {
          inner = v;
        }
        return (
          <td key={c.key} style={{padding:"18px 14px",font:"400 13px/17px Roboto",color:COLORS.textPri,borderBottom:`1px solid ${AUTH_C.rowBd}`,borderLeft:c.grp&&c.key==="resp"?`1px solid ${AUTH_C.tableBd}`:"none",whiteSpace:"nowrap",verticalAlign:"middle"}}>{inner}</td>
        );
      })}
      <td style={{padding:"18px 16px",borderBottom:`1px solid ${AUTH_C.rowBd}`,textAlign:"center",verticalAlign:"middle",cursor:"pointer"}} onClick={()=>onEye&&onEye(r)}><EyeIcon /></td>
    </tr>
  );
}

function AuthEditOverlay({ data, authCtx, onClose }) {
  const AED = (typeof window!=="undefined") && window.AuthEntryDrawer;
  if (!AED) return null;
  const patient = (data && data.patient) || {};
  const fakeRow = { key:"auth-detail", name:patient.name||"", mode:"person", mrn:patient.mrn||"", mid:patient.memberId||"", src:patient.payorSource||"", gw:patient.gateway||"" };
  const initEntry = (authCtx && authCtx.entry) || null;
  return <AED row={fakeRow} initialEntry={initEntry} onClose={onClose} onSave={onClose} />;
}

function AuthorizationInfo({ data, onEditAuthDetails, isAutomated }) {
  const [ep, setEp] = useED(0);
  const [editAuthOpen, setEditAuthOpen] = useED(false);
  const episodes = [
    { id:"Epi964256", start:"3/22/2024", end:"5/21/2024", recert:"08 Days" },
    { id:"Epi746523", start:"6/02/2024", end:"8/01/2024", recert:"12 Days" },
  ];
  const cur = episodes[ep] || episodes[0];
  const authCtx = (typeof window!=="undefined" && window.__authForDrawer && data && data.patient && window.__authForDrawer.name===data.patient.name) ? window.__authForDrawer : null;
  const kindLabel = { approved:"Approved", denied:"Denied", partial:"Partially Approved", pending:"Pending", pending_submission:"Pending Submission" };
  const kindColor = { approved:AUTH_C.green, denied:"#dc2626", partial:"#d97706", pending:"#d97706", pending_submission:AUTH_C.blue };
  const groupLabel = (authCtx && authCtx.authType && authCtx.authType!=="-") ? authCtx.authType : "Recert";
  const recertDate = "03/20/2024";
  let rows;
  if (authCtx && authCtx.entry) {
    const _fmtSub = (s) => { if(!s) return "-"; const p=s.split("-"); return p.length===3?`${p[1]}/${p[2]}/${p[0].slice(2)}`:s; };
    rows = authCtx.entry.lines.map(l => ({ svc:l.svc, refId:authCtx.entry.authNo, auth:l.auth, track:l.track, init:"-", sub:_fmtSub(authCtx.entry.submittedAt), req:l.reqRange, resp:l.pyrResp, appr:l.apprRange, reqN:l.req, apprN:l.apprvd, denied:l.denied, pending:l.pending, expire:l.expire||"-", at:l.at==="thumb"?"Completed":"-", status:kindLabel[l.status]||"Pending Submission", statusColor:kindColor[l.status]||AUTH_C.blue }));
  } else if (authCtx && authCtx.status==="pending_submission") {
    rows = [{svc:"SN"},{svc:"PT"}].map(x=>({ svc:x.svc, refId:"-", auth:"-", track:"-", init:"-", sub:"-", req:"-", resp:"-", appr:"-", reqN:"03", apprN:"-", denied:"-", pending:"-", expire:"-", at:"-", status:"Pending Submission", statusColor:AUTH_C.blue }));
  } else {
    rows = [
      { svc:"SN", refId:"REF20240789", auth:"B245054741", track:"P2114324789", init:"04/25/25", sub:"04/26/25", req:"04/28/25 - 05/19/25", resp:"04/28/25", appr:"04/28/25 - 05/19/25", reqN:"03", apprN:"03", denied:"-", pending:"-", expire:"09", at:"Completed", status:"Approved" },
      { svc:"PT", refId:"REF20240789", auth:"B245054742", track:"P2114324789", init:"04/25/25", sub:"04/26/25", req:"04/28/25 - 05/19/25", resp:"04/30/25", appr:"04/28/25 - 05/19/25", reqN:"03", apprN:"03", denied:"-", pending:"-", expire:"09", at:"Completed", status:"Approved" },
    ];
  }

  return (
    <div style={{padding:"22px clamp(16px, 2.4vw, 36px) 40px"}}>
      {/* Referral Information */}
      <AuthAccordion title="Referral Information"><ReferralContent /></AuthAccordion>

      {/* Episode tabs */}
      <div style={{display:"flex",gap:0,borderBottom:`1px solid ${AUTH_C.rowBd}`,marginTop:6}}>
        {episodes.map((e,i)=>{
          const sel = ep===i;
          return (
            <button key={e.id} onClick={()=>setEp(i)} style={{background:"transparent",border:"none",cursor:"pointer",padding:"6px 4px 12px",marginRight:34,font:`${sel?600:400} 15px/20px Roboto`,color:sel?AUTH_C.blue:COLORS.textMute,borderBottom:`2px solid ${sel?AUTH_C.blue:"transparent"}`,marginBottom:-1}}>Episode - {e.id}</button>
          );
        })}
      </div>

      {/* Episode stat chips */}
      <div style={{display:"flex",gap:14,marginTop:20,flexWrap:"wrap"}}>
        <EpisodeStat label="Episode Start Date" value={cur.start} />
        <EpisodeStat label="Episode End Date" value={cur.end} />
        <EpisodeStat label="Days To Recert" value={cur.recert} />
      </div>

      {/* Provider / Diagnosis */}
      <div style={{marginTop:22}}>
        <AuthAccordion title="Provider Information"><ProviderContent /></AuthAccordion>
        <AuthAccordion title="Diagnosis Information"><DiagnosisContent /></AuthAccordion>
      </div>

      <div style={{height:1,background:AUTH_C.rowBd,margin:"10px 0 24px"}}></div>

      {/* Authorization Details heading */}
      <div style={{font:"600 18px/24px Roboto",color:COLORS.textPri}}>Authorization Details</div>
      <div style={{font:"400 13px/18px Roboto",color:COLORS.textMute,marginTop:6}}>Detailed view of authorizations and the Payor approval status.</div>
      <div style={{height:1,background:AUTH_C.rowBd,margin:"18px 0 22px"}}></div>

      {/* Recert group label */}
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
        <span style={{font:"600 15px/20px Roboto",color:COLORS.textPri}}>{groupLabel}</span>
        <span style={{display:"inline-block",padding:"3px 12px",borderRadius:6,background:AUTH_C.purpleBg,border:`1px solid ${AUTH_C.purpleBd}`,color:AUTH_C.purpleC,font:"500 13px/16px Roboto"}}>{recertDate}</span>
        {!isAutomated && <button type="button" onClick={()=>{ if(onEditAuthDetails) onEditAuthDetails(); else setEditAuthOpen(true); }} style={{border:"none",background:"#1677FF",color:"#fff",borderRadius:4,padding:"5px 14px",font:"500 13px/16px Roboto",cursor:"pointer"}}>Edit Details</button>}
      </div>

      {/* Table */}
      <div style={{border:`1px solid ${AUTH_C.tableBd}`,borderRadius:10,overflowX:"auto"}}>
        <table style={{borderCollapse:"collapse",width:"100%",minWidth:1560,tableLayout:"fixed"}}>
          <colgroup>
            {AUTH_COLS.map(c=><col key={c.key} style={{width:c.w}} />)}
            <col style={{width:56}} />
          </colgroup>
          <thead>
            <tr>
              {AUTH_COLS.map((c)=>(
                <th key={c.key} style={{padding:"14px 14px",textAlign:"left",font:"500 13px/17px Roboto",color:COLORS.textBody,background:c.grp||["reqN","apprN","denied","pending","expire","at","status"].includes(c.key)?AUTH_C.headLav:AUTH_C.headGray,borderBottom:`1px solid ${AUTH_C.tableBd}`,borderLeft:c.key==="resp"?`1px solid ${AUTH_C.tableBd}`:"none",whiteSpace:"nowrap"}}>{c.head}</th>
              ))}
              <th style={{padding:"14px 16px",textAlign:"center",background:AUTH_C.headLav,borderBottom:`1px solid ${AUTH_C.tableBd}`,verticalAlign:"middle"}}><img src={(window.__resources&&window.__resources.attachmentType)||"icons/attachment-type.svg"} width={18} height={18} alt="" style={{display:"block",opacity:1}} aria-hidden="true" /></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=><AuthRow key={i} r={r} onEye={(row)=>{ if(typeof window!=="undefined"&&window.__openDocs){ const patient=(data&&data.patient)||{}; window.__openDocs({...row,mid:row.mid||patient.memberId||patient.mid,type:row.type||groupLabel,name:patient.name,key:"auth-detail-"+i},true); } }} />)}
          </tbody>
        </table>
      </div>
      {editAuthOpen && <AuthEditOverlay data={data} authCtx={authCtx} onClose={()=>setEditAuthOpen(false)} />}
    </div>
  );
}

// ── Payload toggle (small outlined buttons) ───────────────────
function PayloadToggle({ value, onChange }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,padding:"10px clamp(16px, 2.4vw, 36px)",borderBottom:`0.5px solid ${COLORS.divider}`,background:"#fff"}}>
      <span style={{font:"400 12px/16px Roboto",color:COLORS.textMute,marginRight:6}}>Sample data:</span>
      {Object.entries(SAMPLE_PAYLOADS).map(([k,p])=>{
        const sel = value===k;
        return (
          <button key={k} onClick={()=>onChange(k)} style={{background:sel?COLORS.blueBg:"#fff",color:sel?COLORS.blue:COLORS.textBody,border:`1px solid ${sel?COLORS.blue:COLORS.border}`,borderRadius:6,padding:"4px 10px",font:`${sel?500:400} 12px/16px Roboto`,cursor:"pointer"}}>{p.label}</button>
        );
      })}
    </div>
  );
}

// ── Drawer shell ──────────────────────────────────────────────
function PendingEligState({ onEditDetails }) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,padding:"60px 24px",textAlign:"center"}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:"#EFF6FF",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:24}}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M6 2.75h7.2L19 8.55V19.5a1.75 1.75 0 0 1-1.75 1.75H6A1.75 1.75 0 0 1 4.25 19.5v-15A1.75 1.75 0 0 1 6 2.75z" stroke="#93C5FD" strokeWidth="1.4" strokeLinejoin="round"/><path d="M13 2.9v5.1h5" stroke="#93C5FD" strokeWidth="1.4" strokeLinejoin="round"/><path d="M9 13l6 6m0-6l-6 6" stroke="#93C5FD" strokeWidth="1.4" strokeLinecap="round"/></svg>
      </div>
      <div style={{font:"400 15px/22px Roboto",color:"#94a3b8",marginBottom:4}}>Eligibility check is yet to be updated.</div>
      <div style={{font:"400 14px/20px Roboto",color:"#94a3b8",marginBottom:24}}>Please update the details using the button below.</div>
      <button onClick={onEditDetails} style={{background:"#2563EB",color:"#fff",border:"none",borderRadius:6,padding:"10px 28px",font:"500 14px/20px Roboto",cursor:"pointer"}}>Edit Details</button>
    </div>
  );
}

// ── Patient Automation Log ────────────────────────────────────
const AL_ELIG_ROWS = [
  { ref:"REFE320240293", type:"Recert",         wf:"Eligibility - Workflow", stage:"ModuleName", name:"Marvin Mckinney", mrn:"B6100062245601", memId:"Mem62245602", gw:"Carelon",  src:"Cigna TotalCare (HMO D-SNP)",    ts:"06/05/25 09:39 PM", at:"thumb" },
  { ref:"REFE320240511", type:"Recert",         wf:"Eligibility - Workflow", stage:"ModuleName", name:"Marvin Mckinney", mrn:"B6100062245601", memId:"Mem62245603", gw:"Carelon",  src:"Anthem MediBlue (HMO & PPO)",    ts:"05/05/25 09:39 PM", at:"warn" },
  { ref:"REFE320240788", type:"Reverification", wf:"Eligibility - Workflow", stage:"ModuleName", name:"Marvin Mckinney", mrn:"B6100062245601", memId:"Mem62245606", gw:"Carelon",  src:"Cigna Preferred Medicare (PPO)", ts:"04/05/25 09:39 PM", at:"thumb" },
  { ref:"REFE320240099", type:"Recert",         wf:"Eligibility - Workflow", stage:"ModuleName", name:"Marvin Mckinney", mrn:"B6100062245601", memId:"Mem62245604", gw:"Availity", src:"AARP Medicare Advantage",        ts:"03/05/25 09:39 PM", at:"thumb" },
  { ref:"REFE320270355", type:"Recert",         wf:"Eligibility - Workflow", stage:"ModuleName", name:"Marvin Mckinney", mrn:"B6100062245601", memId:"Mem62245605", gw:"Availity", src:"Humana Gold Plus (HMO)",         ts:"02/05/25 09:39 PM", at:"thumb" },
  { ref:"REFE320120858", type:"SOC",            wf:"Eligibility - Workflow", stage:"ModuleName", name:"Marvin Mckinney", mrn:"B6100062245601", memId:"Mem62245607", gw:"Carelon",  src:"Aetna Medicare Value (HMO)",     ts:"01/05/25 09:39 PM", at:"thumb" },
];
const AL_AUTH_ROWS = [
  { ref:"REF0320240451", epi:"Epi964256", soe:"03/22/25", eoe:"05/21/25", type:"Addl-Resp",  wf:"Auth Carelon - Update...",          st:"03/22/25 09:39 PM", et:"03/22/25 11:23 PM", sn:{r:"-",a:"03",d:"-",p:"-"}, pt:{r:"-",a:"-",d:"-",p:"-"}, ot:{r:"-",a:"-",d:"-",p:"-"}, at:"thumb" },
  { ref:"REF0320240451", epi:"Epi964256", soe:"11/05/25", eoe:"11/08/25", type:"Addl-Req",   wf:"Auth Carelon - Update...",          st:"03/22/25 09:39 PM", et:"03/22/25 11:23 PM", sn:{r:"03",a:"-",d:"-",p:"03"}, pt:{r:"-",a:"-",d:"-",p:"-"}, ot:{r:"-",a:"-",d:"-",p:"-"}, at:"warn" },
  { ref:"REF0320240356", epi:"Epi964256", soe:"03/22/25", eoe:"05/21/25", type:"Recert-Resp",wf:"Auth Carelon - Request Initi...",   st:"03/22/25 09:39 PM", et:"01/15/25 09:39 PM", sn:{r:"-",a:"04",d:"-",p:"04"}, pt:{r:"-",a:"-",d:"-",p:"-"}, ot:{r:"-",a:"-",d:"-",p:"-"}, at:"thumb" },
  { ref:"REF0320240356", epi:"Epi964256", soe:"03/22/25", eoe:"05/21/25", type:"Recert-Req", wf:"Auth Carelon - Update...",          st:"11/05/25 09:39 PM", et:"01/15/25 09:39 PM", sn:{r:"03",a:"-",d:"-",p:"03"}, pt:{r:"-",a:"-",d:"-",p:"-"}, ot:{r:"-",a:"-",d:"-",p:"-"}, at:"thumb" },
];
const AL_TYPE_COLORS = { "Addl-Resp":"#52c41a","Addl-Req":"#1677FF","Recert-Resp":"#52c41a","Recert-Req":"#1677FF" };
function ALStatusIcon({ at }) {
  if (at==="thumb") return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 22V11l5-9 1.2.6c.5.25.8.8.8 1.4V9h5.5a1.5 1.5 0 0 1 1.5 1.7l-1.5 8A1.5 1.5 0 0 1 18 20H7zm-4 0V11h3v11H3z" fill="#8c8cff"/></svg>;
  if (at==="warn")  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3 1.5 21h21L12 3Z" fill="none" stroke="#FAAD14" strokeWidth="1.8" strokeLinejoin="round"/><path d="M12 10v5" stroke="#FAAD14" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="17.5" r="1" fill="#FAAD14"/></svg>;
  return <span style={{color:"#cbd5e1"}}>—</span>;
}
function PatientAutomationLog({ patient, onBack, initialSubTab, onSubTab }) {
  const [subTab, setSubTabRaw] = useED(initialSubTab || "elig");
  const setSubTab = (k)=>{ setSubTabRaw(k); onSubTab && onSubTab(k); };
  // PCR rows for this patient, one entry per PCR accordion shown in PCR Info,
  // oldest-first so the chronology matches the drawer.
  const pcrRow = (typeof window!=="undefined" && window.__pcrForDrawer) || null;
  const pcrKids = (pcrRow && typeof window!=="undefined" && window.rcdChildRows) ? window.rcdChildRows(pcrRow) : [];
  const pcrLog = (()=>{
    if (!pcrRow) return [];
    const all = (typeof window!=="undefined" && window.rcdPcrLogRows) ? window.rcdPcrLogRows() : [];
    const base = all.find(r=>r.id===pcrRow.id) || {};
    const STAGES = (typeof window!=="undefined" && window.RCD_PCR_STAGE_LIST) || [];
    return pcrKids.slice(0,2).map((k,i)=>({
      ref: "PCR0000008",
      wf: "PCR Submission",
      stage: STAGES[i] || ("Stage " + (i+1)),
      name: pcrRow.name,
      mrn: pcrRow.mrn,
      bp: String(Number(pcrRow.benefitPeriod || 1) + i),
      bpStart: k.bp && k.bp!=="—" ? k.bp : (pcrRow.bpStartDate || "—"),
      st: k.pcr ? k.pcr + " 09:39 AM" : (base.st || "—"),
      et: base.et && base.et!=="—" ? base.et : (k.pcr ? k.pcr + " 04:12 PM" : "—"),
      lastCheck: "—",
      retries: "0",
      status: "Completed",
    })).sort((a,b)=> new Date(a.st) - new Date(b.st)).concat(
      // Remaining automation stages for the same reference, one row per stage.
      [2,3,4,5].map((n)=>({
        ref: "PCR0000008",
        wf: "PCR Submission",
        stage: STAGES[n] || ("Stage " + (n+1)),
        name: pcrRow.name,
        mrn: pcrRow.mrn,
        bp: String(Number(pcrRow.benefitPeriod || 1)),
        bpStart: pcrRow.bpStartDate || "—",
        st: (base.st || "—"),
        et: (base.et && base.et!=="—" ? base.et : "—"),
        lastCheck: base.lastCheck || "—",
        retries: base.retries || "0",
        status: n===5 ? (base.status || "Completed") : "Completed",
      }))
    );
  })();
  const hd = {font:"500 11px/14px Roboto",color:"#64748b",padding:"8px 10px",background:"#f8fafc",border:"1px solid #e2e8f0",whiteSpace:"nowrap",textAlign:"left"};
  const td = {padding:"10px 10px",border:"1px solid #e2e8f0",font:"400 12px/16px Roboto",color:"#334155",whiteSpace:"nowrap"};
  const numCell = (v) => v==="-" ? <span style={{color:"#cbd5e1"}}>-</span> : <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",minWidth:22,height:22,borderRadius:"50%",background:"#e0e7ff",color:"#3730a3",font:"600 11px Roboto"}}>{v}</span>;
  const selSt = {border:"1px solid #d1d5db",borderRadius:4,padding:"5px 24px 5px 10px",font:"400 12px/16px Roboto",color:"#374151",background:"#fff",appearance:"none",cursor:"pointer"};
  return (
    <div style={{padding:"0 28px 32px"}}>
        <div style={{display:"flex",alignItems:"flex-end",borderBottom:"1px solid #e2e8f0",marginBottom:14}}>
          {[["elig","Eligibility"],["auth","Authorization"],["pcr","PCR"]].map(([k,lbl])=>{
            const isSel=subTab===k;
            return <button key={k} type="button" onClick={()=>setSubTab(k)} style={{background:"transparent",border:"none",cursor:"pointer",padding:"10px 2px",font:`${isSel?500:400} 14px/18px Roboto`,color:isSel?COLORS.blue:"#64748b",borderBottom:`2px solid ${isSel?COLORS.blue:"transparent"}`,marginRight:28,marginBottom:-1}}>{lbl}</button>;
          })}
        </div>
        <div style={{font:"400 12px/16px Roboto",color:"#64748b",marginBottom:12}}>Transaction Status of {subTab==="elig"?"Eligibility":subTab==="auth"?"Authorization":"PCR"} Workflows</div>
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          {subTab==="elig"
            ? <React.Fragment>
                <select style={selSt}><option>Select Workflow</option></select>
                <select style={selSt}><option>Select Ref ID</option></select>
              </React.Fragment>
            : subTab==="pcr"
            ? <React.Fragment>
                <select style={selSt}><option>Billing Period Start Date</option></select>
                <select style={selSt}><option>Select Ref ID</option></select>
              </React.Fragment>
            : <React.Fragment>
                <select style={selSt}><option>Select Episode ID</option></select>
                <select style={selSt}><option>Select Ref ID</option></select>
              </React.Fragment>}
        </div>
        {subTab==="pcr" ? (
          <div style={{overflowX:"auto"}}>
            <table style={{borderCollapse:"collapse",width:"100%",minWidth:1220}}>
              <thead><tr>{["Ref ID","Workflow","Current Stage","Patient Name","MRN","Billing Period","BP Start Date","Start Time","End Time","Last Elapsed Check","Retries","Status"].map(h=><th key={h} style={hd}>{h}</th>)}</tr></thead>
              <tbody>{pcrLog.length===0
                ? <tr><td colSpan={12} style={{...td,color:COLORS.textMute,textAlign:"center",padding:"28px 10px"}}>No PCR workflows for this patient.</td></tr>
                : pcrLog.map((r,i)=>(
                  <tr key={r.ref+i} style={{background:i%2===0?"#fff":"#fafafa"}}>
                    <td style={{...td,color:COLORS.blue,fontWeight:500}}>{r.ref}</td>
                    <td style={td}>{r.wf}</td>
                    <td style={{...td,maxWidth:360,overflow:"hidden",textOverflow:"ellipsis"}} title={r.stage}>{r.stage}</td>
                    <td style={td}>{r.name}</td><td style={td}>{r.mrn}</td>
                    <td style={td}>{r.bp}</td><td style={td}>{r.bpStart}</td><td style={td}>{r.st}</td><td style={td}>{r.et}</td>
                    <td style={td}>{r.lastCheck}</td><td style={td}>{r.retries}</td>
                    <td style={td}>{r.status}</td>
                  </tr>
                ))}</tbody>
            </table>
          </div>
        ) : subTab==="elig" ? (
          <div style={{overflowX:"auto"}}>
            <table style={{borderCollapse:"collapse",width:"100%",minWidth:900}}>
              <thead><tr>{["Ref ID","Transaction Type","Workflow","Current Stage","Patient Name","MRN","Member ID","Gateway","Payor Source","Start Time","Status"].map(h=><th key={h} style={hd}>{h}</th>)}</tr></thead>
              <tbody>{AL_ELIG_ROWS.map((r,i)=>(
                <tr key={i} style={{background:i%2===0?"#fff":"#fafafa"}}>
                  <td style={{...td,color:COLORS.blue,fontWeight:500}}>{r.ref}</td>
                  <td style={td}>{r.type}</td><td style={td}>{r.wf}</td><td style={td}>{r.stage}</td>
                  <td style={td}>{r.name}</td><td style={td}>{r.mrn}</td><td style={td}>{r.memId}</td>
                  <td style={td}>{r.gw}</td><td style={{...td,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis"}}>{r.src}</td>
                  <td style={td}>{r.ts}</td>
                  <td style={{...td,textAlign:"center"}}><ALStatusIcon at={r.at} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table style={{borderCollapse:"collapse",width:"100%",minWidth:1200}}>
              <thead>
                <tr>
                  {["Ref ID","Epi ID","SOE","EOE","Type","Workflow","Start Time","End Time"].map(h=><th key={h} style={hd} rowSpan={2}>{h}</th>)}
                  <th colSpan={4} style={{...hd,textAlign:"center"}}>Skilled Nursing</th>
                  <th colSpan={4} style={{...hd,textAlign:"center"}}>Physical Therapy</th>
                  <th colSpan={4} style={{...hd,textAlign:"center"}}>Occupational Therapy</th>
                  <th style={hd} rowSpan={2}>Status</th>
                </tr>
                <tr>{[0,1,2].flatMap(()=>["R","A","D","P"].map((l,j)=><th key={l+j} style={{...hd,textAlign:"center",fontSize:10}}>{l}</th>))}</tr>
              </thead>
              <tbody>{AL_AUTH_ROWS.map((r,i)=>{
                const tc=AL_TYPE_COLORS[r.type]||"#64748b";
                return (
                  <tr key={i} style={{background:i%2===0?"#fff":"#fafafa"}}>
                    <td style={{...td,color:COLORS.blue,fontWeight:500}}>{r.ref}</td>
                    <td style={td}>{r.epi}</td><td style={td}>{r.soe}</td><td style={td}>{r.eoe}</td>
                    <td style={td}><span style={{border:`1px solid ${tc}`,color:tc,borderRadius:3,padding:"2px 6px",font:"500 11px Roboto"}}>{r.type}</span></td>
                    <td style={{...td,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis"}}>{r.wf}</td>
                    <td style={td}>{r.st}</td><td style={td}>{r.et}</td>
                    {[r.sn,r.pt,r.ot].flatMap((svc,gi)=>["r","a","d","p"].map(k=><td key={gi+k} style={{...td,textAlign:"center"}}>{numCell(svc[k])}</td>))}
                    <td style={{...td,textAlign:"center"}}><ALStatusIcon at={r.at} /></td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        )}
      </div>
  );
}

// ── PCR Info tab content ──────────────────────────────────────
// Reads the PCR row the drawer was opened from (window.__pcrForDrawer), so the
// tab always agrees with the PCR grid row that was clicked.
// Needs Intervention accordion inside the PCR tab — same table as the PCR grid's
// Needs Intervention slideout, with the same Mark-as-complete flow.
function PCRInterventions({ row }) {
  const [done, setDone] = useED({});
  const IntTable = (typeof window!=="undefined") && window.RCDIntTable;
  const cols = (typeof window!=="undefined") && window.RCD_DONE_COLS;
  const all = (typeof window!=="undefined" && window.rcdInterventions) ? window.rcdInterventions(row) : [];
  const isDone = (it)=> !!done[it.id] || it.status==="Completed";
  const items = all.map(it=> isDone(it)
    ? (done[it.id]
        ? {...it, _done:true, status:"Completed", completed:done[it.id].at, by:done[it.id].by, notes:done[it.id].notes}
        : {...it, _done:true, notes:it.notes||""})
    : it);
  const active = items.filter(it=>!it._done).length;
  const completed = items.length - active;
  const markDone = (it, notes)=>{
    const d = new Date();
    const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
    const p = (n)=>String(n).padStart(2,"0");
    const at = `${d.getDate()} ${mon} ${d.getFullYear()} ${p(((d.getHours()+11)%12)+1)}:${p(d.getMinutes())} ${d.getHours()<12?"AM":"PM"}`;
    setDone(m=>({...m,[it.id]:{ at, by:row.clinician, notes }}));
  };
  const pad2 = (n)=>String(n).padStart(2,"0");
  const pending = items.filter(it=>!it._done);
  const doneItems = items.filter(it=>it._done);
  const [subTab, setSubTab] = useED("pending");
  const shown = subTab==="pending" ? pending : doneItems;
  const tabs = [["pending",`Pending Interventions (${pad2(active)})`],["done",`Completed Interventions (${pad2(completed)})`]];
  const focusOpen = typeof window!=="undefined" && window.__pcrIntFocus;
  // Ineligible records: show the pending item, but it cannot be marked complete.
  const inelig = row.ineligible && (all)[0] && (all)[0].key==="ELIGIBILITY_CHECK";
  if (inelig) {
    const it = all[0];
    return (
      <div style={{border:"1px solid #F3D3D3",background:"#fff",borderRadius:8,boxShadow:"0 1px 3px rgba(86,86,86,.06)",margin:"0 0 14px",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 18px",background:"#FFF4F4",borderBottom:"1px solid #F3D3D3"}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:"#dc2626",flexShrink:0}}></span>
          <span style={{font:"600 15px/20px Roboto",color:"#1e293b"}}>Ineligible</span>
          <span style={{marginLeft:"auto",display:"inline-flex",alignItems:"center",height:22,padding:"0 10px",borderRadius:11,background:"#FFEDEC",color:"#dc2626",font:"500 12px/22px Roboto"}}>Not eligible for pre-claim review</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"140px minmax(0,1fr)",rowGap:10,columnGap:16,padding:"14px 18px"}}>
          <span style={{font:"400 13px/18px Roboto",color:COLORS.textMute}}>Reason</span>
          <span style={{font:"500 13px/18px Roboto",color:"#1e293b"}}>{it.reason}</span>
          <span style={{font:"400 13px/18px Roboto",color:COLORS.textMute}}>Last Checked On</span>
          <span style={{font:"500 13px/18px Roboto",color:"#1e293b"}}>{it.created}</span>
        </div>
      </div>
    );
  }

  return (
    <AuthAccordion title={`Needs Intervention (Active: ${pad2(active)}, Completed: ${pad2(completed)})`} thin={true} headerBg="#CADAE4" defaultOpen={!!focusOpen}>
      <div style={{display:"flex",gap:0,borderBottom:`1px solid ${AUTH_C.rowBd}`,margin:"6px 0 14px"}}>
        {tabs.map(([k,label])=>{
          const sel = subTab===k;
          return <button key={k} type="button" onClick={()=>setSubTab(k)} style={{background:"transparent",border:"none",cursor:"pointer",padding:"6px 4px 12px",marginRight:34,font:`${sel?600:400} 15px/20px Roboto`,color:sel?AUTH_C.blue:COLORS.textMute,borderBottom:`2px solid ${sel?AUTH_C.blue:"transparent"}`,marginBottom:-1}}>{label}</button>;
        })}
      </div>
      {IntTable
        ? <IntTable items={shown} cols={subTab==="pending" ? (cols||[]).filter(c=>!["by","completed","notes"].includes(c.k)) : cols} onComplete={markDone} completeDisabled={inelig} empty={subTab==="pending"?"No pending interventions for this record.":"No completed interventions yet."} />
        : <div style={{font:"400 13px/18px Roboto",color:COLORS.textMute}}>Loading interventions…</div>}
    </AuthAccordion>
  );
}

// Terminate confirmation — center modal with focus scrim, small accordion-header recap, optional notes.
function PCRTerminateModal({ row, count, onClose, onTerminate }) {
  const [note, setNote] = useED("");
  const [phase, setPhase] = useED("confirm"); // confirm -> progress -> done
  const [frozenCount] = useED(count);
  useEDEffect(()=>{
    if (phase !== "progress") return;
    const t = setTimeout(()=>{ onTerminate(note.trim()); setPhase("done"); }, 900);
    return ()=>clearTimeout(t);
  },[phase]);
  const label = row ? "this PCR" : `${count} PCR record${count===1?"":"s"}`;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",zIndex:950,display:"flex",alignItems:"center",justifyContent:"center"}} onMouseDown={(e)=>{ if(e.target===e.currentTarget && phase!=="progress") onClose(); }}>
      <div style={{width:600,background:"#fff",borderRadius:10,boxShadow:"0 12px 36px rgba(15,23,42,0.28)",overflow:"hidden"}}>
        <div style={{padding:"20px 26px",borderBottom:"1px solid #e2e8f0",font:"600 17px/22px Roboto",color:"#1e293b"}}>Terminate PCR</div>
        {phase!=="confirm" ? (
          <div style={{padding:"48px 26px",display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
            {phase==="progress" ? (
              <React.Fragment>
                <div style={{width:36,height:36,border:"3px solid #e2e8f0",borderTopColor:"#2563eb",borderRadius:"50%",animation:"pcrSpin .8s linear infinite"}}></div>
                <style>{`@keyframes pcrSpin { to { transform: rotate(360deg); } }`}</style>
                <div style={{font:"500 14px/20px Roboto",color:"#1e293b"}}>Terminating request is being processed</div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div style={{width:40,height:40,borderRadius:"50%",background:"#2563eb",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",font:"700 18px/1 Roboto"}}>✓</div>
                <div style={{font:"500 14px/20px Roboto",color:"#1e293b"}}>Terminating request is progressing</div>
                <div style={{font:"400 13px/18px Roboto",color:"#64748b"}}>{row ? "1 PCR record" : `${frozenCount} PCR record${frozenCount===1?"":"s"}`}</div>
              </React.Fragment>
            )}
          </div>
        ) : (
        <div style={{padding:"22px 26px"}}>
          {row ? (
            <div style={{display:"flex",gap:32,marginBottom:18,flexWrap:"nowrap"}}>
              <div style={{whiteSpace:"nowrap"}}><div style={{font:"400 12px/16px Roboto",color:"#94a3b8",marginBottom:2}}>Benefit Period Start Date :</div><div style={{font:"600 14px/18px Roboto",color:"#1e293b"}}>{row.bpStartDate || "-"}</div></div>
              <div style={{whiteSpace:"nowrap"}}><div style={{font:"400 12px/16px Roboto",color:"#94a3b8",marginBottom:2}}>PCR Init Date :</div><div style={{font:"600 14px/18px Roboto",color:"#1e293b"}}>{row.txnInitDate || "-"}</div></div>
              <div style={{whiteSpace:"nowrap"}}><div style={{font:"400 12px/16px Roboto",color:"#94a3b8",marginBottom:2}}>Status :</div>{(typeof window!=="undefined" && window.RCDPill) ? <window.RCDPill status={row.status} /> : <div style={{font:"600 14px/18px Roboto",color:"#1e293b"}}>{row.status || "-"}</div>}</div>
            </div>
          ) : (
            <div style={{marginBottom:18}}>
              <div style={{font:"400 12px/16px Roboto",color:"#94a3b8",marginBottom:2}}>Records Selected :</div>
              <div style={{font:"600 16px/20px Roboto",color:"#1e293b"}}>{count} PCR record{count===1?"":"s"}</div>
            </div>
          )}
          <div style={{font:"500 13px/18px Roboto",color:"#1e293b",marginBottom:14}}>Are you sure you want to terminate {label}?</div>
          <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,padding:"10px 14px",font:"500 12px/17px Roboto",color:"#b91c1c",marginBottom:16}}>If this PCR is part of a combined billing period submission, terminating it will also terminate that entire submission.</div>
          <div style={{font:"500 12px/16px Roboto",color:"#1f2937",marginBottom:6}}>Optional Notes</div>
          <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder="Notes goes here"
            style={{width:"100%",boxSizing:"border-box",resize:"vertical",border:"1px solid #d8dee6",borderRadius:4,padding:"8px 10px",font:"400 12px/17px Roboto",color:"#1f2937",outline:"none"}}></textarea>
        </div>
        )}
        <div style={{display:"flex",justifyContent:"flex-end",gap:8,padding:"16px 26px",borderTop:"1px solid #e2e8f0"}}>
          {phase==="confirm" && <button type="button" onClick={onClose} style={{border:"1px solid #d8dee6",background:"#fff",color:"#475569",font:"500 13px/18px Roboto",padding:"8px 16px",borderRadius:4,cursor:"pointer"}}>Cancel</button>}
          {phase==="confirm" && <button type="button" onClick={()=>setPhase("progress")} style={{border:"none",background:"#dc2626",color:"#fff",font:"500 13px/18px Roboto",padding:"8px 18px",borderRadius:4,cursor:"pointer"}}>Terminate</button>}
          {phase==="done" && <button type="button" onClick={onClose} style={{border:"none",background:"#0f172a",color:"#fff",font:"500 13px/18px Roboto",padding:"8px 18px",borderRadius:4,cursor:"pointer"}}>Close</button>}
        </div>
      </div>
    </div>
  );
}

function PCRMarkReviewedModal({ count, onClose, onConfirm }) {
  const [phase, setPhase] = useED("confirm");
  const [frozenCount] = useED(count);
  useEDEffect(()=>{
    if (phase !== "progress") return;
    const t = setTimeout(()=>{ onConfirm(); setPhase("done"); }, 700);
    return ()=>clearTimeout(t);
  },[phase]);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",zIndex:950,display:"flex",alignItems:"center",justifyContent:"center"}} onMouseDown={(e)=>{ if(e.target===e.currentTarget && phase!=="progress") onClose(); }}>
      <div style={{width:440,background:"#fff",borderRadius:10,boxShadow:"0 12px 36px rgba(15,23,42,0.28)",overflow:"hidden"}}>
        <div style={{padding:"20px 26px",borderBottom:"1px solid #e2e8f0",font:"600 16px/20px Roboto",color:"#1e293b"}}>Mark as Reviewed</div>
        {phase==="confirm" ? (
          <div style={{padding:"22px 26px"}}>
            <div style={{font:"500 13px/18px Roboto",color:"#1e293b"}}>Mark {frozenCount} PCR record{frozenCount===1?"":"s"} as reviewed?</div>
          </div>
        ) : (
          <div style={{padding:"40px 26px",display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
            {phase==="progress" ? (
              <React.Fragment>
                <div style={{width:32,height:32,border:"3px solid #e2e8f0",borderTopColor:"#1677FF",borderRadius:"50%",animation:"pcrSpin2 .8s linear infinite"}}></div>
                <style>{`@keyframes pcrSpin2 { to { transform: rotate(360deg); } }`}</style>
                <div style={{font:"500 14px/20px Roboto",color:"#1e293b"}}>Marking as reviewed…</div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div style={{width:40,height:40,borderRadius:"50%",background:"#16a34a",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",font:"700 18px/1 Roboto"}}>✓</div>
                <div style={{font:"500 14px/20px Roboto",color:"#1e293b"}}>{frozenCount} PCR record{frozenCount===1?"":"s"} marked as reviewed.</div>
              </React.Fragment>
            )}
          </div>
        )}
        <div style={{display:"flex",justifyContent:"flex-end",gap:8,padding:"14px 26px",borderTop:"1px solid #e2e8f0"}}>
          {phase==="confirm" && <button type="button" onClick={onClose} style={{border:"1px solid #d8dee6",background:"#fff",color:"#475569",font:"500 13px/18px Roboto",padding:"8px 16px",borderRadius:4,cursor:"pointer"}}>Cancel</button>}
          {phase==="confirm" && <button type="button" onClick={()=>setPhase("progress")} style={{border:"none",background:"#1677FF",color:"#fff",font:"500 13px/18px Roboto",padding:"8px 18px",borderRadius:4,cursor:"pointer"}}>Mark as Reviewed</button>}
          {phase==="done" && <button type="button" onClick={onClose} style={{border:"none",background:"#0f172a",color:"#fff",font:"500 13px/18px Roboto",padding:"8px 18px",borderRadius:4,cursor:"pointer"}}>Close</button>}
        </div>
      </div>
    </div>
  );
}

// Red banner + tag shown once a PCR has been manually terminated.
function PCRTerminatedStrip({ by, at, note }) {
  return (
    <div style={{border:"1px solid #fecaca",background:"#fef2f2",borderRadius:6,padding:"12px 16px",marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8,font:"500 13px/18px Roboto",color:"#b91c1c"}}>
        <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="none" stroke="#dc2626" strokeWidth="1.5"/><path d="M5.2 5.2 L10.8 10.8 M10.8 5.2 L5.2 10.8" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/></svg>
        <span>This record is being terminated by {by || "user"}{at ? " on " + at : ""}.</span>
      </div>
      {note && (
        <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid #fecaca",font:"400 12px/17px Roboto",color:"#7f1d1d"}}>
          <span style={{font:"500 12px/17px Roboto",color:"#b91c1c"}}>Notes : </span>{note}
        </div>
      )}
    </div>
  );
}
function PCRTerminatedTag() {
  return (
    <span title="This record has been manually terminated" style={{display:"inline-flex",alignItems:"center",gap:7,border:"1px solid #dc2626",background:"#fef2f2",color:"#b91c1c",font:"500 13px/18px Roboto",padding:"7px 14px",borderRadius:4}}>
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" style={{color:"#dc2626"}}><circle cx="8" cy="5" r="2.6" fill="currentColor" /><path d="M2.6 13.4c0-2.6 2.4-4.2 5.4-4.2s5.4 1.6 5.4 4.2z" fill="currentColor" /></svg>
      Manually Terminated
    </span>
  );
}
const pcrNowStamp = () => {
  const d = new Date();
  const p = (n)=>String(n).padStart(2,"0");
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
  return `${d.getDate()} ${mon} ${d.getFullYear()} ${p(((d.getHours()+11)%12)+1)}:${p(d.getMinutes())} ${d.getHours()<12?"AM":"PM"}`;
};

function PCRInfo({ patient }) {
  const [showTerm, setShowTerm] = useED(false);
  const [term, setTerm] = useED(null);
  const row = (typeof window!=="undefined" && window.__pcrForDrawer) || null;
  if (!row) return (
    <div style={{padding:"28px",font:"400 13px/18px Roboto",color:COLORS.textMute}}>No pre-claim review record for this patient.</div>
  );
  const kids = (typeof window!=="undefined" && window.rcdChildRows) ? window.rcdChildRows(row) : [];
  const CH = ["Receipt #","Billing Period #","Benefit Period #","SOC date","Discharge date","Benefit period status","Billing period submitted","Episode start date","Clinical Auditor Name","Clinical Auditor phone #","PCR Submission Date","DCN Arrived date","UTN Arrived date","DL Arrived date"];
  const CW = "130px 130px 132px 108px 122px 156px 176px 146px 168px 168px 148px 146px 136px";
  const phone = (row.auditor && row.auditor.phone) || "—";
  const auditorName = (row.auditor && row.auditor.name) || "—";
  const k0 = kids[0];
  // Terminate is only offered for records the automation is still working —
  // the same rule the grid's Bulk Terminate checkboxes use.
  // Ineligible records can't be terminated from the patient detail screen.
  const canTerminate = !row.ineligible && (row.at==="intervention" || row.at==="hourglass");
  const termInfo = term || (row.naGroup==="manual"
    ? { by: row.termBy || row.clinician, at: row.termAt, note: row.manualNote }
    : null);
  const data = k0 ? [[k0.receiptNo,"1",row.benefitPeriodNo,k0.socDate,k0.dischargeDate,k0.bpStatus,"Combined",k0.epi,auditorName,phone,k0.pcr,k0.dcn,k0.utn,k0.dl]] : [];
  return (
    <div style={{padding:"22px clamp(16px, 2.4vw, 36px) 40px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(140px,1fr))",rowGap:16,columnGap:24,paddingBottom:18,borderBottom:"1px solid #e5e7eb",marginBottom:18}}>
        {[["Patient Name",row.name],["MRN",row.mrn],["Branch",row.branch || "ABC"],["Medicare ID",row.medicareid],["PTAN",row.ptan],["Submission Type",row.submissionType],["DCN",row.dcn],["UTN",row.utn]].map(([l,v])=>(
          <div key={l}>
            <div style={{font:"400 12px/16px Roboto",color:"#94a3b8",marginBottom:2}}>{l}</div>
            <div style={{font:"500 14px/18px Roboto",color:"#1e293b"}}>{v && v!=="—" ? v : "-"}</div>
          </div>
        ))}
      </div>
      <AuthAccordion defaultOpen={true} headerBg="rgba(208,217,229,0.11)" borderColor="rgba(63,126,161,0.43)" bold={true}
        right={termInfo ? <PCRTerminatedTag /> : !canTerminate ? null : <button type="button" onClick={()=>setShowTerm(true)} style={{border:"1px solid #dc2626",background:"#fff",color:"#dc2626",font:"500 13px/18px Roboto",padding:"7px 16px",borderRadius:4,cursor:"pointer"}}>Terminate</button>}
        title={<div style={{display:"flex",gap:32}}>
          <div><div style={{font:"400 13px/17px Roboto",color:"#94a3b8",marginBottom:2}}>Benefit Period Start Date :</div><div style={{font:"600 16px/20px Roboto",color:"#1e293b"}}>{row.bpStartDate || "-"}</div></div>
          <div><div style={{font:"400 13px/17px Roboto",color:"#94a3b8",marginBottom:2}}>BP Start Date :</div><div style={{font:"600 16px/20px Roboto",color:"#1e293b"}}>{(k0 && k0.bp) || row.bpStartDate || "-"}</div></div>
          <div><div style={{font:"400 13px/17px Roboto",color:"#94a3b8",marginBottom:2}}>Billing Period # :</div><div style={{font:"600 16px/20px Roboto",color:"#1e293b"}}>1</div></div>
          <div><div style={{font:"400 13px/17px Roboto",color:"#94a3b8",marginBottom:2}}>PCR Init Date :</div><div style={{font:"600 16px/20px Roboto",color:"#1e293b"}}>{row.txnInitDate || "-"}</div></div>
          <div><div style={{font:"400 13px/17px Roboto",color:"#94a3b8",marginBottom:2}}>Status :</div>{(typeof window!=="undefined" && window.RCDPill) ? <window.RCDPill status={row.status} /> : <div style={{font:"600 14px/18px Roboto",color:COLORS.textBody}}>{row.status || "-"}</div>}</div>
        </div>}>
        {termInfo && <PCRTerminatedStrip by={termInfo.by} at={termInfo.at} note={termInfo.note} />}
        <PCRInterventions row={row} />
        <div style={{border:"1px solid #dbe4ec",borderRadius:6,overflow:"hidden"}}>
          <div style={{background:"#6B99B2",padding:"12px 18px",font:"500 14px/20px Roboto",color:"#fff"}}>Submission Details</div>
          <div style={{background:"#fff",padding:18}}>
            {data.length===0 && <div style={{font:"400 13px/18px Roboto",color:COLORS.textMute}}>No review submissions yet.</div>}
            {data.map((r,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(140px,1fr))",rowGap:20,columnGap:24,padding:i===0?"0 0 20px":"20px 0 0",borderTop:i===0?"none":"1px solid #eef2f7"}}>
                {r.map((v,j)=>(
                  <div key={j} style={{textAlign:"left"}}>
                    <div style={{font:"400 12px/16px Roboto",color:COLORS.textMute,marginBottom:4,whiteSpace:"nowrap"}}>{CH[j]}</div>
                    <div style={{font:"500 14px/18px Roboto",color:COLORS.textBody,whiteSpace:"nowrap"}}>{v && v!=="—" ? v : "-"}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </AuthAccordion>
      {kids.slice(1,2).map((k,ki)=>{
        const bpNo = "2";
        const r = [k.receiptNo,bpNo,row.benefitPeriodNo,k.socDate,k.dischargeDate,k.bpStatus,"Combined",k.epi,auditorName,phone,k.pcr,k.dcn,k.utn,k.dl];
        return (
          <div key={k.receiptNo} style={{marginTop:14}}>
            <AuthAccordion defaultOpen={false} headerBg="rgba(208,217,229,0.11)" borderColor="rgba(63,126,161,0.43)" bold={true}
              right={termInfo ? <PCRTerminatedTag /> : !canTerminate ? null : <button type="button" onClick={()=>setShowTerm(true)} style={{border:"1px solid #dc2626",background:"#fff",color:"#dc2626",font:"500 13px/18px Roboto",padding:"7px 16px",borderRadius:4,cursor:"pointer"}}>Terminate</button>}
              title={<div style={{display:"flex",gap:32}}>
                <div><div style={{font:"400 13px/17px Roboto",color:"#94a3b8",marginBottom:2}}>Benefit Period Start Date :</div><div style={{font:"600 16px/20px Roboto",color:"#1e293b"}}>{row.bpStartDate || "-"}</div></div>
                <div><div style={{font:"400 13px/17px Roboto",color:"#94a3b8",marginBottom:2}}>BP Start Date :</div><div style={{font:"600 16px/20px Roboto",color:"#1e293b"}}>{k.bp || "-"}</div></div>
                <div><div style={{font:"400 13px/17px Roboto",color:"#94a3b8",marginBottom:2}}>Billing Period # :</div><div style={{font:"600 16px/20px Roboto",color:"#1e293b"}}>{bpNo}</div></div>
                <div><div style={{font:"400 13px/17px Roboto",color:"#94a3b8",marginBottom:2}}>PCR Init Date :</div><div style={{font:"600 16px/20px Roboto",color:"#1e293b"}}>{row.txnInitDate || "-"}</div></div>
                <div><div style={{font:"400 13px/17px Roboto",color:"#94a3b8",marginBottom:2}}>Status :</div>{(typeof window!=="undefined" && window.RCDPill) ? <window.RCDPill status={row.status} /> : <div style={{font:"600 14px/18px Roboto",color:COLORS.textBody}}>{row.status || "-"}</div>}</div>
              </div>}>
              {termInfo && <PCRTerminatedStrip by={termInfo.by} at={termInfo.at} note={termInfo.note} />}
              <PCRInterventions row={row} />
              <div style={{border:"1px solid #dbe4ec",borderRadius:6,overflow:"hidden"}}>
                <div style={{background:"#6B99B2",padding:"12px 18px",font:"500 14px/20px Roboto",color:"#fff"}}>Submission Details</div>
                <div style={{background:"#fff",padding:18}}>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(140px,1fr))",rowGap:20,columnGap:24}}>
                    {r.map((v,j)=>(
                      <div key={j} style={{textAlign:"left"}}>
                        <div style={{font:"400 12px/16px Roboto",color:COLORS.textMute,marginBottom:4,whiteSpace:"nowrap"}}>{CH[j]}</div>
                        <div style={{font:"500 14px/18px Roboto",color:COLORS.textBody,whiteSpace:"nowrap"}}>{v && v!=="—" ? v : "-"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AuthAccordion>
          </div>
        );
      })}
      {showTerm && <PCRTerminateModal row={row} onClose={()=>setShowTerm(false)} onTerminate={(note)=>{
        const info = { by: row.clinician || "user", at: pcrNowStamp(), note: note || "" };
        setTerm(info);
        if (typeof window!=="undefined" && window.__rcdTerminateRow) window.__rcdTerminateRow(row, note || "");
      }} />}
    </div>
  );
}

function EligibilityDetail({ data, onClose, showPayloadToggle, payloadKey, onPayloadChange, initialTab, useV2, isPending, onEditDetails, initialShowAutoLog, initialAutoLogSubTab, onEditAuthDetails, notifOnly }) {
  const [tab, setTab] = useED(initialTab || "elig");
  const [showAutoLog, setShowAutoLog] = useED(!!initialShowAutoLog);
  // The log sub-tab follows the info tab the user came from, and vice versa.
  const [autoLogSub, setAutoLogSub] = useED(initialAutoLogSubTab || (initialTab==="pcr" ? "pcr" : initialTab==="auth" ? "auth" : "elig"));
  const safe = data || {};
  const patient = safe.patient || {};
  const plan = safe.plan || {};
  // New Figma "a new eliggg" eligibility layout — used for every patient
  // EXCEPT Robert Fox (useV2=false), who keeps the original EligibilityInfo.
  const V2 = (typeof window !== "undefined") && window.EligibilityInfoV2;
  const showV2 = useV2 && !!V2;
  return (
    <div style={{position:"fixed",inset:0,zIndex:60}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.25)",animation:"edFade .14s ease-out"}}></div>
      <div style={{position:"fixed",right:0,top:0,height:"100vh",width:"97vw",background:"#fff",borderLeft:`1px solid ${COLORS.border}`,boxShadow:"-12px 0 24px rgba(28,45,66,.10)",display:"flex",flexDirection:"column",animation:"edSlide .22s ease-out"}}>
        {/* Fixed header — patient banner + tab bar */}
        <div style={{flexShrink:0,background:"#fff"}}>
          <PatientHeader patient={(notifOnly === "elig" && window.__preEligForDrawer) ? (r => ({ name:r.name, mrn:"—", dob:r.dob, memberId:r.policy, payorSource:r.plan, gateway:r.gw || undefined }))(window.__preEligForDrawer) : (notifOnly === "eligStd" && window.__batchForDrawer) ? (r => ({ name:r.name, mrn:r.mrn || "—", payorName:r.payerName }))(window.__batchForDrawer) : patient} plan={plan} onClose={onClose} slim={(tab==="pcr" && !showAutoLog) || (showAutoLog && autoLogSub==="pcr")} />
          <div style={{margin:"0 20px",height:1,background:"#CFCFCF"}} />
          {!showAutoLog && <div style={{margin:"0 20px"}}><TabBar active={tab} onTab={setTab} notifOnly={notifOnly} onAutoLog={()=>{ setAutoLogSub(tab==="pcr" ? "pcr" : tab==="auth" ? "auth" : "elig"); setShowAutoLog(true); }} /></div>}
          {showAutoLog && (
            <div style={{margin:"0 20px",padding:"10px 0 0"}}>
              <a href="#" onClick={(e)=>{e.preventDefault(); setTab(autoLogSub==="pcr" ? "pcr" : autoLogSub==="auth" ? "auth" : "elig"); setShowAutoLog(false);}} style={{display:"inline-flex",alignItems:"center",gap:6,font:"400 13px/18px Roboto",color:COLORS.blue,textDecoration:"none",marginBottom:8,paddingTop:6,paddingBottom:6}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke={COLORS.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Back to Patient Information
              </a>
              <div style={{display:"flex",alignItems:"flex-end",borderBottom:"1px solid #CFCFCF"}}>
                <div style={{background:"#fff",border:"1px solid #CFCFCF",borderBottom:"1px solid #fff",borderRadius:"6px 6px 0 0",padding:"9px 18px",font:"500 14px/18px Roboto",color:COLORS.blue,marginBottom:-1,position:"relative",zIndex:2}}>Automation Log</div>
              </div>
            </div>
          )}
        </div>
        {/* Scroll region — borders start right below the tab bar */}
        <div className="ed-scroll" style={{flex:1,overflowY:"auto",overflowX:"hidden",background:"#fff",margin:"0 20px 20px",borderLeft:"1px solid #CFCFCF",borderRight:"1px solid #CFCFCF",borderBottom:"1px solid #CFCFCF",borderRadius:"0 0 6px 6px"}}>
          {showAutoLog
            ? <PatientAutomationLog patient={patient} onBack={()=>setShowAutoLog(false)} initialSubTab={autoLogSub} onSubTab={setAutoLogSub} />
            : (notifOnly === "eligStd" && window.RecordInfo && window.__batchForDrawer
                ? <window.RecordInfo kind="batch" row={window.__batchForDrawer} />
                : /^rec_/.test(tab) && window.RecordInfo && window.__recForDrawer
                ? <window.RecordInfo kind={window.__recForDrawer.kind} row={window.__recForDrawer.row} />
                : notifOnly === "elig" && window.IPEPatientInfo
                ? <window.IPEPatientInfo row={window.__preEligForDrawer} />
                : tab==="notif"
                ? ((typeof window!=="undefined" && window.NOTPatientNotifications) ? React.createElement(window.NOTPatientNotifications, { row: window.__notifForDrawer }) : null)
                : tab==="referral"
                ? (window.ReferralInfo ? <window.ReferralInfo /> : null)
                : tab==="eligAlert"
                ? (window.EligSectionInfo ? <window.EligSectionInfo patient={patient} section="alert" /> : null)
                : tab==="hoIntake"
                ? (window.EligSectionInfo ? <window.EligSectionInfo patient={patient} section="hospice" /> : null)
                : /^v2/.test(tab) && typeof window!=="undefined" && window.V2RecordInfo
                ? React.createElement(window.V2RecordInfo, { patient, kind: tab.slice(2), key: tab })
                : tab==="pcr"
                ? <PCRInfo patient={patient} />
                : tab==="elig"
                ? (isPending
                    ? <PendingEligState onEditDetails={onEditDetails} />
                    : showV2
                      ? <V2 data={safe} onEditDetails={onEditDetails} />
                      : <EligibilityInfo data={safe} payloadKey={payloadKey} onPayloadChange={onPayloadChange} />)
                : <AuthorizationInfo data={safe} onEditAuthDetails={onEditAuthDetails} isAutomated={(safe.patient&&safe.patient.mode)==="gear"} />)}
        </div>
      </div>
      <style>{`
        @keyframes edFade  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes edSlide { from { transform: translateX(28px); opacity: .6 } to { transform: translateX(0); opacity: 1 } }
        .ed-tier-card:hover { box-shadow: 0 4px 14px rgba(15,23,42,0.10), 0 2px 4px rgba(15,23,42,0.06); transform: translateY(-1px); }
        .ed-benefit-header:hover { background: #f8fafc; }
        .ed-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
        .ed-scroll::-webkit-scrollbar { width: 4px; }
        .ed-scroll::-webkit-scrollbar-track { background: transparent; }
        .ed-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .ed-scroll::-webkit-scrollbar-button { display: none; }
      `}</style>
    </div>
  );
}

// Converts a saved EligEntryDrawer form state → SAMPLE_PAYLOADS-compatible shape
// so the patient detail screen can render it in the Eligibility Info tab.
function entryToPayload(entry, row) {
  row = row || {};
  const fmtD = (d) => {
    if (!d) return "";
    const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? `${m[2]}/${m[3]}/${m[1].slice(2)}` : d;
  };
  const pcp0 = entry.pcpLines && entry.pcpLines[0];
  return {
    patient: {
      name: row.name||"", mrn: row.mrn||"",
      dob: fmtD(entry.patDob)||entry.patDob||"",
      memberId: entry.patMemId||row.memId||"",
      relationship: entry.patReln||"Self",
      payorName: row.payor||"", payorSource: row.payorSrc||"",
      payorType: entry.planType||row.payor||"",
      gateway: row.gw||"", startOfCare: row.soc||"",
    },
    plan: {
      status: entry.cov||"pending",
      startDate: fmtD(entry.covRangeStart),
      endDate:   fmtD(entry.covRangeEnd),
      network: "In-Network",
      groupNumber: entry.groupNo||"",
      refId: entry.refId||"",
      checkDate: entry.submittedAt||"", checkTime: "",
      checkDateOnly: entry.submittedAt||"",
      fullName: entry.planName||"",
      payorId: entry.payorId||"", planTypeShort: entry.planType||"",
    },
    planResponse: {
      patientName: row.name||"", gender: entry.patGender||"",
      relationship: entry.patReln||"Self",
      memberId: entry.patMemId||"",
      dob: fmtD(entry.patDob)||"",
      address: entry.patAddr||"", mbi: entry.patMbi||"",
    },
    otherPlans: [],
    additionalCoverage: (entry.addlCov||[]).filter(ac=>ac.planName).map(ac=>({
      planName: ac.planName, payorId: ac.payorId, memberId: ac.memberId,
      coverageDate: [fmtD(ac.covStart), fmtD(ac.covEnd)].filter(Boolean).join(" \u2013 "),
    })),
    pcp: pcp0 ? {
      physicianName: [pcp0.firstName, pcp0.middleName, pcp0.lastName].filter(Boolean).join(" "),
      phoneNumber: pcp0.phone,
      pcpGroupNumber: pcp0.pcpGroup1,
      address: [pcp0.addr1, pcp0.addr2, pcp0.city, pcp0.state, pcp0.zip].filter(Boolean).join(", "),
    } : null,
    tiers: [],
    alerts: (entry.alertLines||[]).filter(a=>a.type||a.desc).map(a=>({kind:"warning",title:a.type,body:a.desc})),
    benefits: [{
      name:"Home Health", status:"Covered",
      fields:{
        auth_required: entry.authIn==="Yes",
        copay: entry.copayIn||"",
        co_insurance: entry.coinsIn||"",
        network_note: entry.visitIn||"",
      },
    }],
    eligRuns: [{
      date: entry.submittedAt||"",
      time: "",
      plan: entry.planName||"",
      payorId: entry.payorId||"",
      planType: entry.planType||"",
      groupNo: entry.groupNo||"",
      network: entry.provStatus||"In-Network",
      status: (entry.covStatus||"Active").toLowerCase()==="active"?"active":"inactive",
      refId: entry.refId||"",
      termDate: fmtD(entry.covRangeEnd)||"",
      coverage: (entry.covRangeStart&&entry.covRangeEnd)?`${fmtD(entry.covRangeStart)} - ${fmtD(entry.covRangeEnd)}`:"",
    }],
    auths: [],
  };
}

// Patient identity is taken from the payload the drawer is initially
// opened with (so clicking different rows shows different patients).
// Switching the sample-data tabs swaps only the plan/eligibility slice.
function EligibilityDetailContainer({ initialKey="medicare_advantage", onClose, initialTab, patientOverride, eligEntry, eligEntryRow, isPending, onEditDetails, initialShowAutoLog, initialAutoLogSubTab, onEditAuthDetails, notifOnly }) {
  const [key, setKey] = useED(initialKey);

  // When an eligEntry is present (saved from Manage Eligibility Request overlay),
  // build the payload directly from the entered data rather than sample data.
  if (eligEntry && eligEntryRow) {
    const data = entryToPayload(eligEntry, eligEntryRow);
    return (
      <EligibilityDetail
        data={data}
        onClose={onClose}
        payloadKey={null}
        onPayloadChange={null}
        initialTab={initialTab||"elig"}
        useV2={true}
        isPending={isPending}
        onEditDetails={onEditDetails}
        initialShowAutoLog={initialShowAutoLog}
        initialAutoLogSubTab={initialAutoLogSubTab}
        onEditAuthDetails={onEditAuthDetails}
        notifOnly={notifOnly}
      />
    );
  }

  // Baseline = the payload's patient that was opened. Stays pinned across tab switches.
  const baseline = SAMPLE_PAYLOADS[initialKey] && SAMPLE_PAYLOADS[initialKey].data;
  const selected = SAMPLE_PAYLOADS[key] && SAMPLE_PAYLOADS[key].data;
  // Compose: pinned patient identity + swappable plan/eligibility slice. When a
  // row is clicked we merge that row's real identity (name / MRN / member id /
  // payor) over the sample patient so the drawer shows the respective patient
  // rather than always Marvin Mckinney.
  const basePatient = (baseline && baseline.patient) || (selected && selected.patient) || {};
  const patient = patientOverride ? { ...basePatient, ...Object.fromEntries(Object.entries(patientOverride).filter(([,v]) => v!==undefined && v!=="")) } : basePatient;
  const data = selected && {
    ...selected,
    patient,
    planResponse: (patientOverride && selected.planResponse)
      ? { ...selected.planResponse, patientName: patientOverride.name || selected.planResponse.patientName, memberId: patientOverride.memberId || selected.planResponse.memberId }
      : selected.planResponse,
  };
  return (
    <EligibilityDetail
      data={data}
      onClose={onClose}
      payloadKey={key}
      onPayloadChange={setKey}
      initialTab={initialTab}
      useV2={initialKey !== "robert_fox"}
      isPending={isPending}
      onEditDetails={onEditDetails}
      initialShowAutoLog={initialShowAutoLog}
      initialAutoLogSubTab={initialAutoLogSubTab}
      onEditAuthDetails={onEditAuthDetails}
      notifOnly={notifOnly}
    />
  );
}

Object.assign(window, { EligibilityDetail, EligibilityDetailContainer, SAMPLE_PAYLOADS, PCRTerminateModal, PCRMarkReviewedModal });

// EligibilityInfoV2 — Eligibility Info tab content, rebuilt to match the
// "a new eliggg" Figma frame. Fully data-driven from the same SAMPLE_PAYLOADS
// payload shape used by eligibility-detail.jsx. Rendered for every patient
// EXCEPT Robert Fox (who keeps the original EligibilityInfo layout).
//
// Sections, top → bottom (mirrors the frame):
//   1. Plan info band  — green accent card: REF ID / Elig Check Date chips,
//      big plan name, Plan Type / Group No / Provider Status, Active pill +
//      coverage dates on the right.
//   2. Patient Details (As per Plan's Eligibility response) — field row +
//      "Payor Eligibility Response" (PDF) and "Member ID Card" (download).
//   3. Plan Benefits — Deductible / Out of Pocket / Coverage matrix by tier.
//   4. Service Benefits — per-benefit matrix (In-Network / Out of Network ×
//      Individual / Family) with Auth Required / Copay / Co-Insurance /
//      Service Deductibles rows.
//   5. Additional Coverage — coverage cards with dates.
//   6. PCP Information.

const { useState: useV2State } = React;

// ── palette (from the frame / METADATA) ──────────────────────
const V2 = {
  green:     "rgb(56,158,13)",
  greenBg:   "rgb(56,158,13)",
  label:     "rgb(98,109,138)",
  value:     "rgba(0,0,0,0.85)",
  valueSolid:"rgb(0,0,0)",
  title65:   "rgba(0,0,0,0.65)",
  title85:   "rgba(0,0,0,0.85)",
  amount:    "rgb(73,81,74)",
  sub1:      "rgb(86,86,86)",
  sub2:      "rgb(132,128,128)",
  muted:     "rgb(140,140,144)",
  faint:     "rgba(0,0,0,0.6)",
  blue:      "rgb(22,119,255)",
  teal:      "rgb(63,126,161)",
  border:    "rgb(218,218,218)",
  borderLt:  "rgb(223,223,223)",
  chipBd:    "rgb(200,200,200)",
  headFill:  "rgb(246,246,246)",
  indTint:   "rgb(243,249,252)",
  cellBd:    "rgba(0,0,0,0.06)",
  divider:   "rgb(210,210,210)",
  greenSoft: "rgb(56,158,13)",
};

const v2Money = (n) => (n===null||n===undefined||n==="") ? "—"
  : (typeof n === "string" ? n : "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const v2Present = (v) => v!==null && v!==undefined && v!=="";

// ── small icons ──────────────────────────────────────────────
function V2CheckCircle({ size=24, fill=V2.green }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill={fill} />
      <path d="M7.5 12.4l3 3 6-6.2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function V2XCircle({ size=24, fill="rgb(196,40,40)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill={fill} />
      <path d="M8.4 8.4l7.2 7.2M15.6 8.4l-7.2 7.2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function V2InfoCircle({ size=16, color=V2.green }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" stroke={color} strokeWidth="1.6" />
      <path d="M12 11v5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="7.6" r="1.1" fill={color} />
    </svg>
  );
}
function V2PdfIcon({ size=30, color=V2.blue }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 2.75h7.2L19 8.55V19.5a1.75 1.75 0 0 1-1.75 1.75H6A1.75 1.75 0 0 1 4.25 19.5v-15A1.75 1.75 0 0 1 6 2.75z" fill="#fff" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M13 2.9v5.1h5" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <text x="12" y="17.4" textAnchor="middle" fontFamily="Roboto, sans-serif" fontWeight="700" fontSize="5.4" fill={color}>PDF</text>
    </svg>
  );
}
function V2IdCard({ size=30, color=V2.teal }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="5" width="19" height="14" rx="2.2" fill={color} />
      <circle cx="8" cy="11" r="2.1" fill="#fff" />
      <path d="M4.4 16c.5-1.7 2-2.4 3.6-2.4s3.1.7 3.6 2.4" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M13.4 9.6h5.2M13.4 12h5.2M13.4 14.4h3.4" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
function V2Download({ size=14, color=V2.teal }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v11m0 0l-4-4m4 4l4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19h14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ── label / value stack ──────────────────────────────────────
function V2Field({ label, value, minWidth }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6,minWidth:minWidth||0}}>
      <span style={{font:"400 14px/18px Roboto",color:V2.label,whiteSpace:"nowrap"}}>{label}</span>
      <span style={{font:"400 16px/20px Roboto",color:V2.value}}>{v2Present(value)?value:"—"}</span>
    </div>
  );
}

// ── status tag (green In-Network / gray) ─────────────────────
function V2StatusTag({ text, tone="green" }) {
  const map = {
    green: { bg:"#EAF7E1", c:V2.green, bd:"#B7E0A0" },
    gray:  { bg:"#F1F3F5", c:"#556070", bd:"#D7DDE4" },
  };
  const t = map[tone] || map.green;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 12px",borderRadius:6,background:t.bg,border:`1px solid ${t.bd}`,color:t.c,font:"600 13px/16px Roboto",whiteSpace:"nowrap"}}>
      <span style={{width:7,height:7,borderRadius:"50%",background:t.c}} />{text}
    </span>
  );
}

// ── eligibility runs (multiple checks / plans) ───────────────
// The flat list of eligibility checks. runs[0] is the PRIMARY (current /
// latest) run; every other run belongs to "Other Plan(s)". Both the
// "Eligibility Check Date" dropdown (first entry = primary) and the
// "Other Plan(s)" dropdown (grouped by plan, primary excluded) drive the
// same selectedIdx, so picking a date or a plan swaps the whole response.
const V2_DEFAULT_RUNS = [
  { date:"01/07/25", time:"10:53 PM", plan:"Aetna Medicare Gold Advantage (PPO) for senior citizen", payorId:"77856", planType:"HMO", groupNo:"18641881288", network:"In-Network", status:"active", refId:"REFE023948357", termDate:"12/09/25" },
  { date:"04/07/25", time:"09:20 AM", plan:"Aetna Medicare Gold Advantage (PPO) for senior citizen", payorId:"77856", planType:"HMO", groupNo:"18641881288", network:"In-Network", status:"active", refId:"REFE023948357", termDate:"12/09/25" },
  { date:"04/05/25", time:"11:15 AM", plan:"Aetna Medicare Value Plus (PPO)", payorId:"77856", planType:"HMO", groupNo:"", network:"", status:"inactive", refId:"REFE023948357", termDate:"12/09/25" },
  { date:"04/01/25", time:"02:40 PM", plan:"UHC Medicare Advantage TX-001 HMO", payorId:"87126", planType:"HMO", groupNo:"22014477", network:"In-Network", status:"active", refId:"REFU118820045", termDate:"04/12/26" },
  { date:"03/27/25", time:"08:05 AM", plan:"Aetna Medicare Value Plus (PPO)", payorId:"77856", planType:"HMO", groupNo:"", network:"", status:"inactive", refId:"REFE023948357", termDate:"12/09/25" },
  { date:"03/15/25", time:"04:30 PM", plan:"UHC Medicare Plus for Senior (HMO)", payorId:"87126", planType:"HMO", groupNo:"22014477", network:"Out-of-Network", status:"inactive", refId:"REFU118820046", termDate:"01/04/23" },
  { date:"03/10/25", time:"10:10 AM", plan:"Anthem Medicare Plus (HMO)", payorId:"41288", planType:"HMO", groupNo:"55120983", network:"In-Network", status:"active", refId:"REFA772013558", termDate:"12/09/25" },
  { date:"02/28/25", time:"01:25 PM", plan:"Anthem Medicare Advantage For Senior Citizen", payorId:"41288", planType:"HMO", groupNo:"55120983", network:"In-Network", status:"inactive", refId:"REFA772013559", termDate:"01/04/23" },
];

// Build the V2PlanBand plan object from a selected run (falls back to the
// payload's own plan for anything the run doesn't carry).
function v2PlanFromRun(run, basePlan) {
  const b = basePlan || {};
  return {
    refId: run.refId || b.refId,
    checkDate: run.date,
    checkTime: run.time || b.checkTime,
    fullName: run.plan,
    planTypeShort: run.planType || b.planTypeShort,
    groupNumber: run.groupNo || b.groupNumber,
    network: run.network || "In-Network",
    status: run.status || "active",
    payorId: run.payorId || b.payorId,
    coverageDate: run.coverage || (run.termDate ? `${run.termDate} - ${run.termDate}` : (b.startDate && b.endDate ? `${b.startDate} - ${b.endDate}` : "—")),
  };
}

function V2Chevron({ open, color=V2.blue }) {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{transform:open?"rotate(180deg)":"none",transition:"transform .15s",flexShrink:0}} aria-hidden="true"><path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function V2Caret({ open }) {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{transform:open?"rotate(90deg)":"none",transition:"transform .15s",flexShrink:0}} aria-hidden="true"><path d="M9 6l6 6-6 6" stroke={V2.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

// ── 0. Plan selector row (Primary / Other Plan(s) + Check Date) ──
function V2PlanSelectorRow({ runs, selectedIdx, onSelect }) {
  const [openOther, setOpenOther] = useV2State(null);
  const [openDate, setOpenDate]   = useV2State(false);
  const [expanded, setExpanded]   = useV2State(() => ({}));
  const sel = runs[selectedIdx] || runs[0];
  // Plans in run order: first = Primary, second = Secondary, the rest = Tertiary.
  const planOrder = [];
  runs.forEach(r => { if (planOrder.indexOf(r.plan) === -1) planOrder.push(r.plan); });
  const tierOf = (plan) => { const i = planOrder.indexOf(plan); return i <= 0 ? 0 : i === 1 ? 1 : 2; };
  const tierGroups = [0,1,2].map(t => {
    const gs = [], gm = {};
    runs.forEach((r, idx) => {
      if (tierOf(r.plan) !== t) return;
      if (!gm[r.plan]) { gm[r.plan] = { plan:r.plan, termDate:r.termDate, items:[] }; gs.push(gm[r.plan]); }
      gm[r.plan].items.push({ idx, date:r.date });
    });
    return gs;
  });
  const activeTier = tierOf(sel.plan);
  const pick = (idx) => { onSelect(idx); setOpenOther(null); setOpenDate(false); };
  const Backdrop = ({ onClose }) => <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:40}} />;
  const TIER_LABELS = ["Primary","Secondary","Tertiary"];

  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap",paddingBottom:14,padding:`0 clamp(16px, 2.4vw, 36px) 14px`,margin:`0 calc(-1 * clamp(16px, 2.4vw, 36px))`,borderBottom:`1px solid ${V2.divider}`,height:30}}>
      {/* left: Primary / Secondary / Tertiary — each a tab with its own plan dropdown */}
      <div style={{display:"flex",alignItems:"center",gap:26,minWidth:0}}>
        {TIER_LABELS.map((label, t) => {
          const groups = tierGroups[t];
          const isActive = activeTier === t;
          const isOpenMenu = openOther === t;
          const disabled = groups.length === 0;
          const color = disabled ? "#b7bdc7" : isActive ? V2.blue : "rgba(0,0,0,0.45)";
          return (
            <div key={label} style={{position:"relative"}}>
              <button type="button" disabled={disabled}
                onClick={()=>{ setOpenDate(false); setOpenOther(o => o===t ? null : t); if (!isActive && groups[0]) onSelect(groups[0].items[0].idx); }}
                style={{display:"inline-flex",alignItems:"center",gap:6,background:"transparent",border:"none",cursor:disabled?"default":"pointer",font:`${isActive?500:400} 15px/20px Roboto`,color,paddingBottom:6,borderBottom:`2px solid ${isActive?V2.blue:"transparent"}`,marginBottom:-1,whiteSpace:"nowrap"}}>
                {label} <V2Chevron open={isOpenMenu} color={color} />
              </button>
              {isOpenMenu && !disabled && (
                <React.Fragment>
                  <Backdrop onClose={()=>setOpenOther(null)} />
                  <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:50,background:"#fff",border:"1px solid rgb(234,234,234)",borderRadius:6,boxShadow:"0 2px 8px rgba(0,0,0,0.15)",minWidth:433,padding:"5px 0"}}>
                    {groups.map((g,gi)=>{
                      const gOpen = !!expanded[g.plan];
                      return (
                        <div key={gi}>
                          <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 16px",height:32,boxSizing:"border-box"}}>
                            <button type="button" onClick={()=>setExpanded(e=>({...e,[g.plan]:!e[g.plan]}))} style={{background:"transparent",border:"none",cursor:"pointer",padding:0,display:"inline-flex"}}><V2Caret open={gOpen} /></button>
                            <span style={{flex:1,minWidth:0,font:"400 14px/22px Roboto",color:"rgba(0,0,0,0.85)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{g.plan}</span>
                            <span style={{flexShrink:0,padding:"0 8px",border:"1px solid rgb(217,217,217)",borderRadius:4,font:"400 12px/22px Roboto",color:"rgba(0,0,0,0.88)",background:"rgba(0,0,0,0.02)"}}>Term Date: {g.termDate}</span>
                          </div>
                          {gOpen && g.items.map((it,ii)=>(
                            <button key={ii} type="button" onClick={()=>pick(it.idx)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",height:32,background: it.idx===selectedIdx?"rgb(248,248,253)":"transparent",border:"none",cursor:"pointer",padding:"0 16px 0 40px",font:"400 14px/22px Roboto",color:"rgb(11,144,200)",textAlign:"left"}}>
                              {it.idx===selectedIdx
                                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 6" stroke={V2.blue} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                : <span style={{width:14}} />}
                              {it.date}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </React.Fragment>
              )}
            </div>
          );
        })}
      </div>
      {/* right: Eligibility Check Date */}
      <div style={{position:"relative"}}>
        <button type="button" onClick={()=>{ setOpenDate(o=>!o); setOpenOther(false); }} style={{display:"inline-flex",alignItems:"center",gap:6,background:"transparent",border:"none",cursor:"pointer",font:"400 15px/20px Roboto",color:"#556070",padding:"0 0 6px"}}>
          Eligibility Check Date : <span style={{color:V2.blue,fontWeight:500}}>{sel.date}</span> <V2Chevron open={openDate} />
        </button>
        {openDate && (
          <React.Fragment>
            <Backdrop onClose={()=>setOpenDate(false)} />
            <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,zIndex:50,background:"#fff",border:`1px solid ${V2.border}`,borderRadius:8,boxShadow:"0 16px 40px rgba(15,23,42,0.16)",minWidth:360,maxWidth:440,padding:"6px 0"}}>
              {runs.map((r,idx)=>(
                <button key={idx} type="button" onClick={()=>pick(idx)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",background: idx===selectedIdx?"#f3f8ff":"transparent",border:"none",cursor:"pointer",padding:"9px 16px",font:"400 14px/18px Roboto",color:"rgba(0,0,0,0.85)",textAlign:"left"}}>
                  {idx===selectedIdx
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M5 12l5 5L20 6" stroke={V2.blue} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : <span style={{width:15,flexShrink:0}} />}
                  <span style={{whiteSpace:"nowrap"}}>{r.date}</span>
                  <span style={{color:"#8a93a3"}}>-</span>
                  <span style={{minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"rgba(0,0,0,0.75)"}}>{r.plan}</span>
                </button>
              ))}
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

// ── 1. Plan info band (Group 1410083768) ─────────────────────
function V2PlanBand({ plan, onEditDetails }) {
  const p = plan || {};
  const planName = p.fullName || "—";
  const network  = p.network || "In-Network";
  const active   = (p.status || "active") === "active";
  const coverage = (p.startDate && p.endDate) ? `${p.startDate} - ${p.endDate}` : (p.coverageDate || "—");
  const accent   = active ? V2.green : "rgb(196,40,40)";
  const nameColor= active ? V2.green : "rgba(0,0,0,0.82)";
  const outNet   = /out/i.test(network);
  const meta = [["Payor Id", p.payorId], ["Plan Type", p.planTypeShort]];
  if (v2Present(p.groupNumber)) meta.push(["Group No", p.groupNumber]);
  const divider = <span style={{width:1,height:14,background:"rgb(214,214,214)",margin:"0 14px"}} />;
  return (
    <div style={{display:"flex",alignItems:"stretch",border:`1px solid ${V2.borderLt}`,borderRadius:8,background:"#fff",overflow:"hidden",boxShadow:"0 1px 3px rgba(86,86,86,.05)"}}>
      <div style={{width:4,background:accent,flexShrink:0}} />
      {/* Left group + Active pill/date on far right */}
      <div style={{flex:1,minWidth:0,padding:"12px 18px 14px 18px",display:"flex",alignItems:"center",gap:24}}>
        {/* Left: three stacked rows */}
        <div style={{width:680,flexShrink:0,minWidth:0,display:"flex",flexDirection:"column",gap:7}}>
          <div style={{display:"flex",gap:22,flexWrap:"wrap"}}>
            <span style={{font:"500 11px/16px Roboto",color:V2.muted}}>REF ID :{p.refId || "—"}</span>
            <span style={{font:"500 11px/16px Roboto",color:V2.muted}}>Elig Check Date : {[p.checkDate,p.checkTime].filter(Boolean).join(" ") || "—"}</span>
          </div>
          <div style={{font:"600 24px/30px Roboto",color:nameColor,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{planName}</div>
          <div style={{display:"flex",alignItems:"center",flexWrap:"wrap"}}>
            {meta.map(([k,v],i)=>(
              <React.Fragment key={k}>
                {i>0 && divider}
                <span style={{font:"400 14px/20px Roboto",color:V2.muted,whiteSpace:"nowrap"}}>{k} :{v || "—"}</span>
              </React.Fragment>
            ))}
            {v2Present(network) && divider}
            {v2Present(network) && (
              <span style={{display:"inline-flex",alignItems:"center",gap:9}}>
                <span style={{font:"400 14px/20px Roboto",color:V2.muted}}>Provider Status :</span>
                <V2StatusTag text={network} tone={outNet?"gray":"green"} />
              </span>
            )}
          </div>
        </div>
        {/* Right: Active pill + coverage date, 24px from left group */}
        <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
          <span style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 20px",borderRadius:21,background:accent,color:"#fff",font:"400 17px/24px Roboto",whiteSpace:"nowrap"}}>
            {active
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.8"/><path d="M7.5 12.4l3 3 6-6.2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.8"/><path d="M8.4 8.4l7.2 7.2M15.6 8.4l-7.2 7.2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>}
            {active ? "Active" : "Inactive"}
          </span>
          <span style={{display:"inline-flex",alignItems:"center",gap:5,font:"500 13px/17px Roboto",color:accent,whiteSpace:"nowrap"}}>
            {coverage}<V2InfoCircle size={13} color={accent} />
          </span>
        </div>
      </div>
      {/* Edit Details — far right, only when handler provided */}
      {onEditDetails && (
        <div style={{flexShrink:0,width:140,display:"flex",alignItems:"center",justifyContent:"center",padding:"14px 18px",borderLeft:`1px solid ${V2.borderLt}`}}>
          <button type="button" onClick={onEditDetails} style={{background:"#2563EB",color:"#fff",border:"none",borderRadius:6,padding:"9px 18px",font:"500 13px/18px Roboto",cursor:"pointer",whiteSpace:"nowrap"}}>Edit Details</button>
        </div>
      )}
    </div>
  );
}

// ── 2. Patient Details (heading outside, details in a box) ───
function V2PatientDetails({ response, patientName, active=true }) {
  const r = response || {};
  const relNode = v2Present(r.relationship)
    ? <span style={{display:"inline-flex",alignItems:"center",gap:5}}>{r.relationship}<V2InfoCircle size={13} color="#8a93a3" /></span>
    : "—";
  const fields = [
    { label:"Patient Name",         value: patientName || r.patientName, minWidth:151 },
    { label:"Gender",               value: r.gender },
    { label:"Reln. to Subscriber",  value: relNode },
    { label:"Member Id",            value: r.memberId },
    { label:"DOB",                  value: r.dob },
    { label:"Address",              value: r.address, minWidth:240 },
    { label:"MBI",                  value: r.mbi },
  ];
  const idColor = active ? V2.teal : "#b6bcc6";
  return (
    <div>
      <div style={{font:"600 14px/18px Roboto",color:V2.title85,marginBottom:10}}>
        Patient Details <span style={{fontWeight:400,fontSize:12,color:V2.sub2,fontStyle:"italic"}}>(As per Plan’s Eligibility response)</span>
      </div>
      <div style={{border:`1px solid ${V2.border}`,borderRadius:8,background:"#fff",padding:"16px 22px",boxShadow:"0 1px 3px rgba(86,86,86,.05)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:24,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:"14px 36px",flexWrap:"wrap",flex:1,minWidth:0}}>
          {fields.map((f,i)=><V2Field key={i} {...f} />)}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:28,flexShrink:0}}>
          <a href="#" onClick={(e)=>e.preventDefault()} style={{display:"inline-flex",alignItems:"center",gap:10,textDecoration:"none",font:"400 15px/18px Roboto",color:V2.blue}}>
            <V2PdfIcon size={28} /><span>Payor Eligibility<br />Response</span>
          </a>
          <span style={{display:"inline-flex",alignItems:"center",gap:10,font:"400 15px/18px Roboto",color:idColor,cursor: active?"pointer":"default"}}>
            <span style={{position:"relative",display:"inline-flex",opacity: active?1:0.55}}><V2IdCard size={28} color={idColor} /><span style={{position:"absolute",right:-4,bottom:-2,background:"#fff",borderRadius:"50%",width:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><V2Download size={11} color={idColor} /></span></span>
            <span>Member ID<br />Card</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── 2b. Eligibility Alerts (peach collapsible bar) ───────────
function V2AlertDetailText({ text }) {
  // supports **bold** spans only
  const parts = String(text||"").split(/\*\*(.+?)\*\*/g);
  return <React.Fragment>{parts.map((p,i)=> i%2===1 ? <strong key={i}>{p}</strong> : <React.Fragment key={i}>{p}</React.Fragment>)}</React.Fragment>;
}
function V2AlertDetailPanel({ detail }) {
  if (!detail) return null;
  return (
    <div style={{padding:"14px 16px 16px",background:"#fff"}}>
      <div style={{font:"600 13px/18px Roboto",color:"rgba(0,0,0,0.85)",marginBottom:10}}>Alert details</div>
      {detail.intro && (
        <div style={{background:"#FFF9E0",border:"1px solid #F3E7A8",borderRadius:6,padding:"10px 14px",font:"400 13px/19px Roboto",color:"rgba(0,0,0,0.8)",marginBottom:14}}>
          <V2AlertDetailText text={detail.intro} />
        </div>
      )}
      {(detail.sections||[]).map((s,i)=>(
        <div key={i} style={{marginBottom:i<detail.sections.length-1?14:0}}>
          <div style={{font:s.link?"500 13px/18px Roboto":"600 13px/18px Roboto",color:s.link?"#1677FF":"rgba(0,0,0,0.85)",marginBottom:6}}>{s.heading}</div>
          <ul style={{margin:0,paddingLeft:18,display:"flex",flexDirection:"column",gap:3}}>
            {(s.items||[]).map((it,j)=>(<li key={j} style={{font:"400 13px/19px Roboto",color:"rgba(0,0,0,0.72)"}}>{it}</li>))}
          </ul>
        </div>
      ))}
    </div>
  );
}
function V2EligibilityAlerts({ alerts }) {
  const [open, setOpen] = useV2State(() => { const v = !!window.__eligOpenAlerts; window.__eligOpenAlerts = false; return v; });
  const [reviewed, setReviewed] = useV2State([]);
  const [expandedIdx, setExpandedIdx] = useV2State(null);
  // reset per-alert reviewed state when alert count changes
  React.useEffect(() => { setReviewed((alerts||[]).map(()=>false)); }, [(alerts||[]).length]);
  if (!Array.isArray(alerts) || !alerts.length) return null;
  const count = String(alerts.length).padStart(2, "0");
  const allReviewed = reviewed.length > 0 && reviewed.every(Boolean);
  // sync grid badge colour
  React.useEffect(() => {
    const rowId = window.__eligCurrentDrawerRowId;
    if (!rowId) return;
    if (!window.__eligAlertReviewedRows) window.__eligAlertReviewedRows = new Set();
    if (allReviewed) window.__eligAlertReviewedRows.add(rowId);
    else window.__eligAlertReviewedRows.delete(rowId);
    document.dispatchEvent(new CustomEvent('eligAlertReviewedChange'));
  }, [allReviewed]);
  const toggle = (i) => setReviewed(r => r.map((v,j) => j===i ? !v : v));
  const bg      = allReviewed ? "#f3f4f6" : "#FDF1EC";
  const border  = allReviewed ? "#d1d5db" : "#F3D9CE";
  const badgeBg = allReviewed ? "#9ca3af" : "#FF7A45";
  const labelCl = allReviewed ? "#6b7280" : "#8a4b2f";
  return (
    <div style={{border:`1px solid ${border}`,borderRadius:8,overflow:"hidden",background:bg}}>
      <button type="button" onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:"transparent",border:"none",cursor:"pointer",padding:"12px 18px",textAlign:"left"}}>
        <V2Caret open={open} />
        <span style={{font:"500 15px/20px Roboto",color:labelCl}}>Eligibility Alerts</span>
        <span style={{background:badgeBg,color:"#fff",borderRadius:999,minWidth:22,height:20,padding:"0 6px",display:"inline-flex",alignItems:"center",justifyContent:"center",font:"600 12px/1 Roboto"}}>{count}</span>
      </button>
      {open && (
        <div style={{padding:"0 18px 14px 40px"}}>
          <div style={{border:"1px solid #e2e8f0",borderRadius:6,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"190px 1fr 90px",background:"#f1f3f5"}}>
              <div style={{padding:"8px 12px",font:"600 13px/18px Roboto",color:"rgba(0,0,0,0.65)"}}>Alert Type</div>
              <div style={{padding:"8px 12px",font:"600 13px/18px Roboto",color:"rgba(0,0,0,0.65)"}}>Description</div>
              <div style={{padding:"8px 12px",font:"600 13px/18px Roboto",color:"rgba(0,0,0,0.65)",textAlign:"center"}}>Reviewed?</div>
            </div>
            {alerts.map((a,i)=>{
              const isOpen = expandedIdx===i;
              return (
              <React.Fragment key={i}>
              <div style={{display:"grid",gridTemplateColumns:"190px 1fr 90px",borderTop:"1px solid #e2e8f0",background:"#fff"}}>
                <div style={{padding:"10px 12px",font:"400 13px/18px Roboto",color:"rgba(0,0,0,0.82)"}}>{a.title}</div>
                <div style={{padding:"10px 12px",font:"400 13px/18px Roboto",color:"rgba(0,0,0,0.65)"}}>
                  {a.body||"—"}
                  {a.detail && (
                    <button type="button" onClick={()=>setExpandedIdx(isOpen?null:i)} style={{marginLeft:10,background:"transparent",border:"none",padding:0,cursor:"pointer",font:"400 13px/18px Roboto",color:"#1677FF"}}>
                      {isOpen ? "Close Details" : "View Details"}
                    </button>
                  )}
                </div>
                <div style={{padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <input type="checkbox" checked={!!reviewed[i]} onChange={()=>toggle(i)} style={{width:16,height:16,cursor:"pointer",accentColor:"#2563eb"}} />
                </div>
              </div>
              {isOpen && a.detail && (
                <div style={{borderTop:"1px solid #e2e8f0"}}>
                  <V2AlertDetailPanel detail={a.detail} />
                </div>
              )}
              </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── section header ───────────────────────────────────────────
function V2SectionTitle({ children, right }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:14}}>
      <span style={{font:"500 18px/23px Roboto",color:V2.title85}}>{children}</span>
      {right}
    </div>
  );
}

// ── 3. Plan Benefits matrix (Deductible / OOP / Coverage) ────
function V2AmountCell({ used, total, remaining }) {
  const rem = v2Present(remaining) ? remaining : (v2Present(total)&&v2Present(used) ? (Number(total)-Number(used)) : null);
  if (!v2Present(rem) && !v2Present(total)) return <span style={{color:"#cbd5e1"}}>—</span>;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <span style={{font:"600 20px/17px Roboto",color:V2.amount}}>
        {v2Money(rem)} <span style={{font:"400 12px/17px Roboto",color:V2.sub1}}>remaining</span>
      </span>
      <span style={{font:"400 12px/14px Roboto",color:V2.sub2}}>{v2Money(used)} Used of {v2Money(total)}</span>
    </div>
  );
}
function V2PlanBenefits({ tiers }) {
  if (!Array.isArray(tiers) || !tiers.length) return null;
  const colW = `220px repeat(${tiers.length}, minmax(190px,1fr))`;
  const tint = "rgb(253,248,246)";
  const labelCell = (txt, head) => (
    <div style={{padding: head?"14px 18px":"18px 18px",background:tint,borderRight:`1px solid ${V2.cellBd}`,font: head?"600 15px/20px Roboto":"500 16px/20px Roboto",color:V2.title65,display:"flex",alignItems:"center"}}>{txt}</div>
  );
  const amtCell = (m, first) => (
    <div style={{padding:"16px 18px",borderLeft: first?"none":`1px solid ${V2.cellBd}`,borderTop:`1px solid ${V2.cellBd}`}}>
      <V2AmountCell used={m&&m.used} total={m&&m.total} remaining={m&&m.remaining} />
    </div>
  );
  return (
    <div style={{display:"flex",gap:24,alignItems:"flex-start"}}>
      <div style={{width:150,flexShrink:0,font:"500 18px/23px Roboto",color:V2.title85,paddingTop:14}}>Plan Benefits</div>
      <div style={{flex:1,minWidth:0,overflowX:"auto"}}>
        <div style={{minWidth:tiers.length*210+220,border:`1px solid ${V2.border}`,borderRadius:8,overflow:"hidden",background:"#fff",boxShadow:"0 1px 3px rgba(86,86,86,.04)"}}>
          {/* header */}
          <div style={{display:"grid",gridTemplateColumns:colW,background:V2.headFill}}>
            {labelCell("Coverage", true)}
            {tiers.map((t,i)=><div key={i} style={{padding:"14px 18px",font:"600 15px/20px Roboto",color:V2.title65,borderLeft:`1px solid ${V2.cellBd}`,display:"flex",alignItems:"center"}}>{(t.name||"").replace(" · ", ", ")}</div>)}
          </div>
          {/* Total Deductibles */}
          <div style={{display:"grid",gridTemplateColumns:colW}}>
            {labelCell("Total Deductibles")}
            {tiers.map((t,i)=>amtCell(t.deductible, i===0))}
          </div>
          {/* Out of Pocket */}
          <div style={{display:"grid",gridTemplateColumns:colW}}>
            {labelCell("Out of Pocket")}
            {tiers.map((t,i)=>amtCell(t.oop, i===0))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 4. Service Benefits matrix (In-Network / Out of Network) ──
function V2SvcValue({ big, small, color }) {
  return (
    <span style={{font:"400 20px/22px Roboto",color:color||V2.value}}>
      {big}{small ? <span style={{font:"500 14px/22px Roboto",color:"rgb(160,160,160)"}}> {small}</span> : null}
    </span>
  );
}
// Build the display rows for one benefit (values repeat across In / Out cols).
function v2ServiceRows(benefit) {
  const f = (benefit && benefit.fields) || {};
  const rows = [];
  rows.push({ label:"Auth Required", node: (f.auth_required===true
    ? <span style={{display:"inline-flex",alignItems:"center",gap:8}}><V2CheckCircle size={22} /><span style={{font:"400 20px/22px Roboto",color:V2.green}}>Yes</span></span>
    : <span style={{display:"inline-flex",alignItems:"center",gap:8}}><V2XCircle size={22} /><span style={{font:"400 20px/22px Roboto",color:"rgb(196,40,40)"}}>No</span></span>) });
  if (v2Present(f.copay)) {
    const c = String(f.copay); const big = c.split("/")[0].trim();
    const small = /visit/i.test(c) ? "Per Visit" : (/day/i.test(c) ? "" : "");
    rows.push({ label:"Copay", node:<V2SvcValue big={big} small={small} /> });
  }
  if (v2Present(f.co_insurance)) rows.push({ label:"Co-Insurance", node:<V2SvcValue big={f.co_insurance} small="Per Visit" /> });
  if (v2Present(f.visit_limit)) rows.push({ label:"Visit Limit", node:<V2SvcValue big={v2Present(f.visits_used)?`${f.visits_used} of ${f.visit_limit}`:String(f.visit_limit)} /> });
  if (v2Present(f.days_limit)) rows.push({ label:"Days Limit", node:<V2SvcValue big={v2Present(f.days_used)?`${f.days_used} of ${f.days_limit}`:String(f.days_limit)} /> });
  const sd = Array.isArray(f.service_deductible) ? f.service_deductible : [];
  if (sd.length) rows.push({ label:"Service Deductibles", split:true, node:(
    <div style={{display:"flex",width:"100%"}}>
      {sd.map((g,i)=>{
        const rem = v2Present(g.remaining) ? g.remaining : (v2Present(g.total)&&v2Present(g.used) ? Number(g.total)-Number(g.used) : null);
        return (
          <div key={i} style={{flex:1,minWidth:0,textAlign:"center",padding:"0 10px",borderLeft: i>0?`1px solid ${V2.cellBd}`:"none"}}>
            <div style={{font:"500 13px/16px Roboto",color:V2.blue,marginBottom:4}}>{g.name}</div>
            <div style={{font:"600 18px/18px Roboto",color:V2.amount}}>{v2Money(rem)} <span style={{font:"400 11px Roboto",color:V2.sub1}}>remaining</span></div>
            <div style={{font:"400 11px/14px Roboto",color:V2.sub2,marginTop:3}}>{v2Money(g.used)} Used of {v2Money(g.total)}</div>
          </div>
        );
      })}
    </div>) });
  if (v2Present(f.prior_auth_phone)) rows.push({ label:"Prior Auth Phone", node:<V2SvcValue big={f.prior_auth_phone} /> });
  return rows;
}
function V2ServiceBenefits({ benefits }) {
  const [sel, setSel] = useV2State(0);
  const [openOther, setOpenOther] = useV2State(null);
  if (!Array.isArray(benefits) || !benefits.length) return null;
  const b = benefits[sel] || benefits[0];
  const rows = v2ServiceRows(b);
  const grid = "minmax(180px,0.9fr) 1fr 1fr";
  const others = benefits.map((x,i)=>({ name:x.name, i })).filter(x=>x.i!==0);
  return (
    <div style={{display:"flex",gap:24,alignItems:"flex-start"}}>
      <div style={{width:150,flexShrink:0,font:"500 18px/23px Roboto",color:V2.title85,paddingTop:8}}>Service Benefits</div>
      <div style={{flex:1,minWidth:0}}>
        {/* benefit tabs */}
        <div style={{display:"flex",alignItems:"center",gap:28,borderBottom:`1px solid ${V2.cellBd}`,marginBottom:14}}>
          <button type="button" onClick={()=>setSel(0)} style={{background:"transparent",border:"none",cursor:"pointer",padding:"0 0 10px",font:`${sel===0?500:400} 15px/20px Roboto`,color:sel===0?V2.blue:"#556070",borderBottom:`2px solid ${sel===0?V2.blue:"transparent"}`,marginBottom:-1,whiteSpace:"nowrap"}}>{benefits[0].name} Benefits</button>
          <div style={{position:"relative"}}>
            <button type="button" onClick={()=>{ if(others.length) setOpenOther(o=>!o); }} style={{background:"transparent",border:"none",cursor: others.length?"pointer":"default",padding:"0 0 10px",font:`${sel!==0?500:400} 15px/20px Roboto`,color:sel!==0?V2.blue:"#556070",display:"inline-flex",alignItems:"center",gap:6,borderBottom:`2px solid ${sel!==0?V2.blue:"transparent"}`,marginBottom:-1,opacity:others.length?1:0.5,whiteSpace:"nowrap"}}>
              Other Service Benefits <V2Chevron open={openOther} color={sel!==0?V2.blue:"#556070"} />
            </button>
            {openOther && others.length>0 && (
              <React.Fragment>
                <div onClick={()=>setOpenOther(false)} style={{position:"fixed",inset:0,zIndex:40}} />
                <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,zIndex:50,background:"#fff",border:`1px solid ${V2.border}`,borderRadius:8,boxShadow:"0 16px 40px rgba(15,23,42,0.16)",minWidth:240,padding:"6px 0"}}>
                  {others.map(o=>(
                    <button key={o.i} type="button" onClick={()=>{ setSel(o.i); setOpenOther(false); }} style={{display:"block",width:"100%",textAlign:"left",background:o.i===sel?"#f3f8ff":"transparent",border:"none",cursor:"pointer",padding:"8px 16px",font:"400 14px/18px Roboto",color:"rgba(0,0,0,0.85)"}}>{o.name}</button>
                  ))}
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
        {/* matrix */}
        <div style={{border:`1px solid ${V2.border}`,borderRadius:8,overflow:"hidden",background:"#fff",boxShadow:"0 1px 3px rgba(86,86,86,.04)"}}>
          <div style={{display:"grid",gridTemplateColumns:grid,background:V2.headFill}}>
            <div style={{padding:"12px 16px",font:"600 15px/20px Roboto",color:V2.title65}}>Service Benefits</div>
            <div style={{padding:"12px 16px",textAlign:"center",font:"600 15px/20px Roboto",color:V2.title65,borderLeft:`1px solid ${V2.cellBd}`}}>In-Network</div>
            <div style={{padding:"12px 16px",textAlign:"center",font:"600 15px/20px Roboto",color:V2.title65,borderLeft:`1px solid ${V2.cellBd}`}}>Out of Network</div>
          </div>
          {rows.map((r,ri)=>(
            <div key={ri} style={{display:"grid",gridTemplateColumns:grid,borderTop:`1px solid ${V2.cellBd}`,minHeight:56}}>
              <div style={{padding:"12px 16px",font:"400 16px/22px Roboto",color:V2.faint,display:"flex",alignItems:"center"}}>{r.label}</div>
              <div style={{padding:"12px 16px",borderLeft:`1px solid ${V2.cellBd}`,display:"flex",justifyContent:"center",alignItems:"center",textAlign:"center"}}>{r.node}</div>
              <div style={{padding:"12px 16px",borderLeft:`1px solid ${V2.cellBd}`,display:"flex",justifyContent:"center",alignItems:"center",textAlign:"center"}}>{r.node}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 5. Additional Coverage Details (Group 1410083652) ────────
function V2AdditionalCoverage({ coverages }) {
  if (!Array.isArray(coverages) || !coverages.length) return null;
  return (
    <div style={{display:"flex",gap:24,alignItems:"flex-start"}}>
      <div style={{width:150,flexShrink:0,font:"500 18px/23px Roboto",color:V2.title85,paddingTop:6}}>Additional Coverage Details</div>
      <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:14}}>
        {coverages.map((c,i)=>(
          <div key={i} style={{border:`1px solid ${V2.border}`,borderRadius:6,background:"#fff",padding:"14px 31px",boxShadow:"0 1px 3px rgba(86,86,86,.04)"}}>
            <div style={{font:"700 17px/1.2 Inter, Roboto, sans-serif",color:"rgba(0,0,0,0.85)",marginBottom:14}}>{c.planName || `Additional Coverage ${String(i+1).padStart(2,"0")}`}</div>
            <div style={{display:"flex",gap:"14px 30px",flexWrap:"wrap"}}>
              <V2Field label="Payor ID" value={c.payorId} />
              <V2Field label="Member ID" value={c.memberId} />
              <V2Field label="Coverage Date" value={c.coverageDate} minWidth={160} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 6. PCP Information ───────────────────────────────────────
function V2PCP({ pcp }) {
  if (!pcp) return null;
  return (
    <div style={{display:"flex",gap:24,alignItems:"flex-start"}}>
      <div style={{width:150,flexShrink:0,font:"500 18px/23px Roboto",color:V2.title85,paddingTop:6}}>PCP Information</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{border:`1px solid ${V2.border}`,borderRadius:8,background:"#fff",padding:"18px 22px",boxShadow:"0 1px 3px rgba(86,86,86,.04)"}}>
          <div style={{display:"flex",gap:"16px 56px",flexWrap:"wrap"}}>
            <V2Field label="Physician Name" value={pcp.physicianName} />
            <V2Field label="Phone Number" value={pcp.phoneNumber} />
            <V2Field label="PCP Group Number" value={pcp.pcpGroupNumber} />
            <V2Field label="Address" value={pcp.address} minWidth={260} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Leslie Alexander placeholder accordion rows (static, closed) ──
function V2StaticAccordionRow({ label }) {
  return (
    <div style={{border:"1px solid #e2e8f0",borderRadius:8,padding:"14px 18px",display:"flex",alignItems:"center",gap:10}}>
      <span style={{color:"#94a3b8",fontSize:12}}>&#8250;</span>
      <span style={{font:"600 14px/20px Roboto",color:"rgba(0,0,0,0.85)"}}>{label}</span>
    </div>
  );
}

// ── tab content root ─────────────────────────────────────────
function EligibilityInfoV2({ data, onEditDetails }) {
  const d = data || {};
  const runs = (Array.isArray(d.eligRuns) && d.eligRuns.length) ? d.eligRuns : V2_DEFAULT_RUNS;
  // A status click in the Patient Elig Summary View carries the coverage tier
  // (0 = Primary, 1 = Secondary, 2+ = Tertiary); preselect the first run on it.
  const wantTier = (typeof window !== "undefined" && typeof window.__esvTierIndex === "number") ? window.__esvTierIndex : null;
  const initIdx = (() => {
    if (wantTier === null) return 0;
    const order = [];
    runs.forEach(r => { if (order.indexOf(r.plan) === -1) order.push(r.plan); });
    const tierOfPlan = (p) => { const i = order.indexOf(p); return i <= 0 ? 0 : i === 1 ? 1 : 2; };
    const target = Math.min(wantTier, 2);
    const hit = runs.findIndex(r => tierOfPlan(r.plan) === target);
    return hit > -1 ? hit : 0;
  })();
  const [selIdx, setSelIdx] = useV2State(initIdx);
  React.useEffect(()=>{ if (typeof window !== "undefined") window.__esvTierIndex = null; },[]);
  const idx = selIdx < runs.length ? selIdx : 0;
  const plan = v2PlanFromRun(runs[idx], d.plan);
  const isLeslie = d.patient && d.patient.name === "Leslie Alexander";
  return (
    <div style={{padding:"18px clamp(16px, 2.4vw, 36px) 44px",display:"flex",flexDirection:"column",gap:22,background:"#fff"}}>
      <V2PlanSelectorRow runs={runs} selectedIdx={idx} onSelect={setSelIdx} />
      <V2PlanBand plan={plan} onEditDetails={onEditDetails} />
      <V2PatientDetails response={d.planResponse} patientName={d.patient && d.patient.name} active={(plan.status||"active")==="active"} />
      <V2EligibilityAlerts alerts={d.alerts} />
      {isLeslie ? (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <V2StaticAccordionRow label="Medicare Coverage Summary" />
          <V2StaticAccordionRow label="Home Health Episodes" />
          <V2StaticAccordionRow label="Deductibles" />
          <V2StaticAccordionRow label="Copays / Limits" />
          <V2StaticAccordionRow label="Other Coverage/Coordination of Benefits(COB)" />
        </div>
      ) : (
        <React.Fragment>
          <V2PlanBenefits tiers={d.tiers} />
          <V2ServiceBenefits benefits={d.benefits} />
          <V2AdditionalCoverage coverages={d.additionalCoverage} />
          <V2PCP pcp={d.pcp} />
        </React.Fragment>
      )}
    </div>
  );
}

if (typeof window !== "undefined") { window.EligibilityInfoV2 = EligibilityInfoV2; window.V2EligibilityAlerts = V2EligibilityAlerts; }
