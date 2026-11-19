/* Neos Collections prototype: sample data.
   Everything here is fictional: claim numbers, patient IDs, and people's names.
   Payer names are used only to make the screens realistic. */

window.DEMO_TODAY = '2026-11-12';

window.SEED = (function () {
  const PAYERS = {
    pal: { name: 'Palmetto GBA (Medicare)', type: 'Medicare', expDays: 14 },
    cgs: { name: 'CGS (Medicare)', type: 'Medicare', expDays: 14 },
    hum: { name: 'Humana Medicare Advantage', type: 'Medicare Advantage', expDays: 30 },
    uhc: { name: 'UnitedHealthcare MA', type: 'Medicare Advantage', expDays: 30 },
    aet: { name: 'Aetna Medicare Advantage', type: 'Medicare Advantage', expDays: 30 },
    mcd: { name: 'Medicaid Managed Care', type: 'Medicaid', expDays: 30 },
    bcb: { name: 'BCBS Commercial', type: 'Commercial', expDays: 30 },
    cig: { name: 'Cigna', type: 'Commercial', expDays: 30 },
  };

  // Common reasons: label, suggested next step, default next-step code.
  const REASONS = {
    auth: { label: 'Authorization', next: 'Route to the branch to locate the authorization number or request a retro review.', code: 'RB' },
    medn: { label: 'Medical necessity', next: 'Pull the plan of care and visit notes, then file an appeal.', code: 'AP' },
    miss: { label: 'Missing information', next: 'Fix the missing field and send a corrected claim.', code: 'CC' },
    dup: { label: 'Duplicate claim', next: 'Confirm the original claim paid, then close. Check back in 5 days.', code: 'D5' },
    tf: { label: 'Timely filing', next: 'Appeal with proof of timely submission, or request a reopening.', code: 'AP' },
    cov: { label: 'Coverage / eligibility', next: 'Re-verify coverage and check for another primary payer.', code: 'D5' },
    nresp: { label: 'No payer response', next: 'Let the automatic status check run again. Call the payer if it stays blank.', code: 'P4' },
    shows: { label: 'Payer shows paid', next: 'Hold until the remit is due, then confirm posting.', code: 'C15' },
    rec: { label: 'Records request', next: 'Route to the branch to collect records before the response window closes.', code: 'RB' },
    ptshare: { label: 'Patient share', next: 'Confirm the patient responsibility (PR) amount and hand it to patient billing.', code: 'D5' },
    second: { label: 'Second payer due', next: 'Bill the secondary payer with the primary remit attached.', code: 'D10' },
    paidfull: { label: 'Paid in full', next: 'Confirm the payment is posted in HCHB, then close the claim.', code: 'OK' },
    mbi: { label: 'Invalid MBI / demographics', next: 'Correct the patient data in HCHB and resubmit through E5 Claims.', code: 'CC' },
    npi: { label: 'Provider NPI mismatch', next: 'Correct the attending or certifying NPI and resubmit.', code: 'CC' },
  };

  // Next-step codes (PRD Appendix C).
  const CODES = [
    { code: 'D0', label: 'Work today', days: 0, does: 'Sets the follow-up date' },
    { code: 'D5', label: 'Work in 5 days', days: 5, does: 'Sets the follow-up date' },
    { code: 'D10', label: 'Work in 10 days', days: 10, does: 'Sets the follow-up date' },
    { code: 'P4', label: 'Recheck status in 4 days', days: 4, does: 'Automatic status recheck' },
    { code: 'C15', label: 'Payer contacted, confirm in 15 days', days: 15, does: 'Sets the follow-up date' },
    { code: 'AP', label: 'Appeal filed', days: 30, does: 'Sets the follow-up date' },
    { code: 'CC', label: 'Corrected claim sent', days: 10, does: 'Sets the follow-up date' },
    { code: 'RB', label: 'Route to branch', days: 3, does: 'Creates a task in the branch inbox' },
    { code: 'ES', label: 'Escalate to Team Lead', days: 0, does: 'Moves the claim to the Team Lead' },
    { code: 'OK', label: 'Mark resolved', days: null, does: 'Closes the claim' },
  ];

  // Claim adjustment reason codes used in the sample 835s.
  const CARC = {
    'CO-45': 'Charge exceeds fee schedule / contracted amount',
    'CO-50': 'Not deemed a medical necessity by the payer',
    'CO-197': 'Precertification / authorization absent',
    'CO-15': 'Authorization number missing or invalid',
    'CO-27': 'Expenses incurred after coverage terminated',
    'CO-29': 'Time limit for filing has expired',
    'CO-18': 'Exact duplicate claim',
    'CO-16': 'Claim lacks information needed for adjudication',
    'PR-1': 'Deductible amount',
    'PR-2': 'Coinsurance amount',
    'PR-3': 'Copayment amount',
  };

  const BRANCHES = {
    S1: 'South', S2: 'South', N1: 'North', N2: 'North', W1: 'West', E1: 'East',
  };

  const USERS = [
    { id: 'u1', name: 'Asha Menon', role: 'collector', scope: 'South region', touched: 14 },
    { id: 'u2', name: 'Daniel Brooks', role: 'collector', scope: 'North region', touched: 11 },
    { id: 'u3', name: 'Maria Lopez', role: 'collector', scope: 'West region', touched: 9 },
    { id: 'u4', name: 'Kevin Osei', role: 'collector', scope: 'All regions · authorizations', touched: 7 },
    { id: 'u5', name: 'Priya Shah', role: 'collector', scope: 'All regions · high dollar', touched: 12 },
    { id: 'lead', name: 'Jordan Ellis', role: 'lead', scope: 'All regions' },
    { id: 'bS1', name: 'Lena Ford', role: 'branch', branch: 'S1' },
    { id: 'bS2', name: 'Omar Haddad', role: 'branch', branch: 'S2' },
    { id: 'bN1', name: 'Grace Kim', role: 'branch', branch: 'N1' },
    { id: 'bN2', name: 'Tom Becker', role: 'branch', branch: 'N2' },
    { id: 'bW1', name: 'Rosa Diaz', role: 'branch', branch: 'W1' },
    { id: 'bE1', name: 'Sam Patel', role: 'branch', branch: 'E1' },
  ];

  // Ordered assignment rules: first match wins. East has no rule on purpose,
  // so its claims land in "Unassigned".
  const RULES = [
    { id: 'r1', on: true, cond: { reason: 'auth' }, to: 'u4' },
    { id: 'r2', on: true, cond: { minAmt: 8000 }, to: 'u5' },
    { id: 'r3', on: true, cond: { region: 'South' }, to: 'u1' },
    { id: 'r4', on: true, cond: { region: 'North' }, to: 'u2' },
    { id: 'r5', on: true, cond: { region: 'West' }, to: 'u3' },
  ];

  // [id, patientId, payer, branch, billed, ageDays, status, reason, payerCode, fuOffset, code, deadlineType, deadlineDays, extra]
  const ROWS = [
    ['CLM-30388', 'PT-1874', 'uhc', 'S2', 3150, 96, 'denied', 'medn', 'CO-50', 0, 'D0', 'Appeal window', 21],
    ['CLM-30391', 'PT-2011', 'hum', 'S1', 8420, 112, 'denied', 'auth', 'CO-197', 0, 'RB', 'Appeal window', 9, { task: { status: 'open', ago: 5, instr: 'Locate the authorization number for this period, or request a retro authorization.', by: 'u4' } }],
    ['CLM-30402', 'PT-1930', 'aet', 'N1', 4610, 58, 'denied', 'auth', 'CO-15', 0, 'RB', 'Appeal window', 62, { task: { status: 'blocked', ago: 4, instr: 'Send the authorization number used for these visits.', by: 'u4', reason: 'Authorization not on file. Retro request sent to the plan; waiting on reply.' } }],
    ['CLM-30415', 'PT-2310', 'bcb', 'N2', 2980, 44, 'denied', 'cov', 'CO-27', 0, 'D5', 'Appeal window', 76],
    ['CLM-30419', 'PT-2051', 'pal', 'W1', 5460, 71, 'denied', 'tf', 'CO-29', 1, 'ES', 'Appeal window', 12, { escalated: true }],
    ['CLM-30427', 'PT-1766', 'cig', 'E1', 1890, 38, 'denied', 'dup', 'CO-18', 0, 'D0', 'Appeal window', 90],
    ['CLM-30433', 'PT-2398', 'mcd', 'S2', 2240, 64, 'denied', 'miss', 'CO-16', -1, 'D0', 'Appeal window', 5],
    ['CLM-30436', 'PT-2104', 'uhc', 'N1', 3720, 49, 'denied', 'medn', 'CO-50', 0, 'RB', 'Appeal window', 33, { task: { status: 'done', ago: 3, doneAgo: 0, instr: 'Upload the signed plan of care and visit notes for the period.', by: 'u2' } }],
    ['CLM-30498', 'PT-1590', 'uhc', 'S2', 5200, 158, 'denied', 'medn', 'CO-50', 0, 'D0', 'Appeal window', 3],
    ['CLM-30444', 'PT-2244', 'hum', 'S1', 6120, 36, 'partial', 'ptshare', 'PR-2', 0, 'D0', null, null, { paid: 4890, co: 618, pr: 612, prCode: 'PR-2' }],
    ['CLM-30447', 'PT-1981', 'pal', 'S2', 7340, 33, 'partial', 'second', 'PR-1', 2, 'D10', null, null, { paid: 5390, co: 482, pr: 1468, prCode: 'PR-1' }],
    ['CLM-30455', 'PT-2367', 'mcd', 'E1', 2650, 29, 'partial', 'ptshare', 'PR-3', 0, 'D0', null, null, { paid: 2210, co: 290, pr: 150, prCode: 'PR-3' }],
    ['CLM-30458', 'PT-2189', 'aet', 'N2', 4180, 40, 'partial', 'ptshare', 'PR-2', -2, 'D5', null, null, { paid: 3280, co: 482, pr: 418, prCode: 'PR-2' }],
    ['CLM-30461', 'PT-2033', 'pal', 'N1', 6740, 33, 'pending', 'nresp', '277CA A2', 0, 'P4', null, null],
    ['CLM-30463', 'PT-1708', 'mcd', 'W1', 2240, 134, 'pending', 'nresp', 'Portal: In process', -1, 'P4', 'Timely filing', 31],
    ['CLM-30466', 'PT-2277', 'bcb', 'S2', 3410, 47, 'pending', 'nresp', '277 A1:20', 0, 'P4', null, null],
    ['CLM-30468', 'PT-1899', 'hum', 'N2', 9870, 27, 'pending', 'shows', 'Portal: Paid', 0, 'C15', null, null],
    ['CLM-30471', 'PT-2185', 'cig', 'S1', 2760, 19, 'pending', 'nresp', '277CA A2', 11, 'P4', null, null],
    ['CLM-30473', 'PT-2420', 'aet', 'N1', 5120, 8, 'pending', 'nresp', '277CA A2', 22, 'P4', null, null],
    ['CLM-30475', 'PT-2302', 'pal', 'S1', 7210, 6, 'pending', 'nresp', '277CA A2', 8, 'P4', null, null, { claimsRecheck: true }],
    ['CLM-30478', 'PT-1612', 'uhc', 'W1', 4300, 92, 'pending', 'nresp', 'Portal: No record yet', -4, 'P4', null, null],
    ['CLM-30480', 'PT-2013', 'mcd', 'E1', 1980, 61, 'pending', 'nresp', 'Portal: In process', -2, 'P4', null, null],
    ['CLM-30499', 'PT-1520', 'mcd', 'N2', 2120, 171, 'pending', 'nresp', 'Portal: In process', -6, 'P4', 'Timely filing', 18],
    ['CLM-30483', 'PT-2290', 'pal', 'S2', 6480, 4, 'rejected', 'mbi', 'Waystar: invalid MBI', 0, 'D0', null, null],
    ['CLM-30485', 'PT-1777', 'hum', 'N2', 5730, 12, 'rejected', 'npi', 'RTP: NPI mismatch', 0, 'CC', null, null],
    ['CLM-30412', 'PT-2207', 'hum', 'S1', 9870, 27, 'paid', 'paidfull', '835 paid', 0, 'D0', null, null, { paid: 8120, co: 1750 }],
    ['CLM-30489', 'PT-2066', 'bcb', 'N1', 3150, 31, 'paid', 'paidfull', '835 paid', 0, 'D0', null, null, { paid: 2840, co: 310 }],
    ['CLM-30492', 'PT-1840', 'pal', 'N1', 12980, 41, 'adr', 'rec', 'ADR: 277CA R1', 0, 'D0', 'ADR response', 23],
    ['CLM-30495', 'PT-2355', 'cgs', 'S1', 8740, 55, 'adr', 'rec', 'ADR letter', 0, 'D0', 'ADR response', 6],
    ['CLM-30501', 'PT-2431', 'cgs', 'W1', 5980, 23, 'pending', 'nresp', '277CA A2', -1, 'P4', null, null],
    ['CLM-30503', 'PT-1955', 'bcb', 'E1', 3360, 52, 'denied', 'cov', 'CO-27', 0, 'D0', 'Appeal window', 41],
    ['CLM-30506', 'PT-2120', 'aet', 'S1', 4470, 67, 'denied', 'miss', 'CO-16', -3, 'D0', 'Appeal window', 28],
  ];

  return { PAYERS, REASONS, CODES, CARC, BRANCHES, USERS, RULES, ROWS };
})();
