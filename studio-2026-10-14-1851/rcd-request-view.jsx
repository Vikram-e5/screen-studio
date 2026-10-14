// RCD Request View — Review Choice Demonstration Center.
// Mirrors the Eligibility Request View: filter strip, title cluster, Style-A status
// summary box with the Automation (AT) Status row beneath it, grid table with an
// expandable child table, pagination and review mode.
const { useState: useRCD, useEffect: useRCDE, useRef: useRCDR } = React;

// ── Mock data ─────────────────────────────────────────────────
// [name, mrn, medicareId, submissionType, ptan, episodeStart, benefitPeriod, bpStart, dcn, utn, status, assessmentType, clinician, dueDate, at]
const RCD_SEED = [
  ["Marvin Mckinney",   "B6100062245601","1EG4-TE5-MK73","Initial","PT0093412","04/02/25","BP1 04/02–06/30/25","04/02/25","2519004512001","AFRM25100412","Completed",    "Start of Care",  "Sarah Mitchell",   "05/30/25","thumb"],
  ["Esther Howard",     "B6789012345678","2FH5-UF6-NL84","Initial","PT0093413","04/04/25","BP2 07/01–09/28/25","04/04/25","2519004512002","AFRM25100413","In Progress",  "Recertification","James Thornton",   "05/28/25","hourglass"],
  ["Wade Warren",       "B6789012345685","3GI6-VG7-OM95","Re-Submitted","PT0093414","04/06/25","BP1 04/06–07/04/25","04/06/25","2519004512003","—",        "Overdue",      "Resumption",     "Linda Patel",      "05/26/25","warning"],
  ["Cameron Williamson","B6100054445634","4HJ7-WH8-PN06","Initial","PT0093415","04/08/25","BP1 04/08–07/06/25","04/08/25","2519004512004","AFRM25100415","Completed",    "Recertification","Robert Chen",      "05/24/25","thumb"],
  ["Robert Fox",        "V6789012345686","5IK8-XI9-QO17","Re-Submitted","PT0093416","04/10/25","BP2 07/07–10/04/25","04/10/25","2519004512005","—",        "Interventions","Discharge",      "Maria Gonzalez",   "05/22/25","warning"],
  ["Jenny Wilson",      "B6789012345711","6JL9-YJ0-RP28","Initial","PT0093417","04/12/25","BP1 04/12–07/10/25","04/12/25","2519004512006","AFRM25100417","In Progress",  "Follow Up",      "David Kim",        "05/20/25","hourglass"],
  ["Jacob Jones",       "B6789012345716","7KM0-ZK1-SQ39","Initial","PT0093418","04/14/25","BP1 04/14–07/12/25","04/14/25","2519004512007","AFRM25100418","Completed",    "Follow Up",      "Angela Foster",    "05/18/25","thumb"],
  ["Leslie Alexander",  "B6789012345697","8LN1-AL2-TR40","Re-Submitted","PT0093419","04/16/25","BP2 07/13–10/10/25","04/16/25","2519004512008","AFRM25100419","In Progress",  "Start of Care",  "Sarah Mitchell",   "05/16/25","hourglass"],
  ["Guy Hawkins",       "L700093345918", "9MO2-BM3-US51","Initial","PT0093420","04/18/25","BP1 04/18–07/16/25","04/18/25","2519004512009","—",        "Interventions","Resumption",     "Linda Patel",      "05/14/25","warning"],
  ["Jane Cooper",       "B6789012345720","0NP3-CN4-VT62","Initial","PT0093421","04/20/25","BP1 04/20–07/18/25","04/20/25","2519004512010","AFRM25100421","Completed",    "Start of Care",  "Nancy Brooks",     "05/12/25","thumb"],
  ["Kristin Watson",    "B6789012345801","1OQ4-DO5-WU73","Re-Submitted","PT0093422","04/22/25","BP2 07/19–10/16/25","04/22/25","2519004512011","AFRM25100422","In Progress",  "Recertification","Kevin Walsh",      "05/10/25","hourglass"],
  ["Cody Fisher",       "B6789012345802","2PR5-EP6-XV84","Initial","PT0093423","04/24/25","BP1 04/24–07/22/25","04/24/25","2519004512012","—",        "Interventions","Follow Up",      "Patricia Simmons", "05/08/25","warning"],
  ["Kathryn Murphy",    "B6789012345803","3QS6-FQ7-YW95","Initial","PT0093424","04/26/25","BP1 04/26–07/24/25","04/26/25","2519004512013","AFRM25100424","Completed",    "Discharge",      "Michael Torres",   "05/06/25","thumb"],
  ["Devon Lane",        "B6789012345804","4RT7-GR8-ZX06","Re-Submitted","PT0093425","04/28/25","BP2 07/25–10/22/25","04/28/25","2519004512014","AFRM25100425","In Progress",  "Recertification","Sandra Hughes",    "05/04/25","hourglass"],
  ["Dianne Russell",    "B6789012345805","5SU8-HS9-AY17","Initial","PT0093426","04/30/25","BP1 04/30–07/28/25","04/30/25","2519004512015","—",        "Interventions","Start of Care",  "Christopher Lane", "05/02/25","warning"],
  ["Arlene McCoy",      "B6789012345806","6TV9-IT0-BZ28","Initial","PT0093427","05/02/25","BP1 05/02–07/30/25","05/02/25","2519004512016","AFRM25100427","Completed",    "Follow Up",      "Rebecca Flores",   "04/30/25","thumb"],
  ["Theresa Webb",      "B6789012345901","7UW0-JU1-CA39","Re-Submitted","PT0093428","05/04/25","BP2 08/01–10/29/25","05/04/25","2519004512017","AFRM25100428","In Progress",  "Recertification","Daniel Morgan",    "04/28/25","hourglass"],
  ["Darlene Robertson", "B6789012345902","8VX1-KV2-DB40","Initial","PT0093429","05/06/25","BP1 05/06–08/03/25","05/06/25","2519004512018","—",        "Interventions","Resumption",     "Catherine Bell",   "04/26/25","warning"],
  ["Courtney Henry",    "B6789012345903","9WY2-LW3-EC51","Initial","PT0093430","05/08/25","BP1 05/08–08/05/25","05/08/25","2519004512019","AFRM25100430","Completed",    "Start of Care",  "Steven Murphy",    "04/24/25","thumb"],
  ["Ralph Edwards",     "B6789012345904","0XZ3-MX4-FD62","Re-Submitted","PT0093431","05/10/25","BP2 08/06–11/02/25","05/10/25","2519004512020","AFRM25100431","In Progress",  "Discharge",      "Jennifer Cole",    "04/22/25","hourglass"],
  ["Annette Black",     "B6789012345905","1YA4-NY5-GE73","Initial","PT0093432","05/12/25","BP1 05/12–08/09/25","05/12/25","2519004512021","—",        "Interventions","Follow Up",      "Andrew Price",     "04/20/25","warning"],
  ["Marvin Mckinney",   "B6100062245601","1EG4-TE5-MK73","Re-Submitted","PT0093433","05/14/25","BP2 08/10–11/06/25","05/14/25","2519004512022","AFRM25100433","Completed",    "Follow Up",      "Sarah Mitchell",   "04/18/25","thumb"],
  ["Esther Howard",     "B6789012345678","2FH5-UF6-NL84","Initial","PT0093434","05/16/25","BP1 05/16–08/13/25","05/16/25","2519004512023","AFRM25100434","In Progress",  "Start of Care",  "James Thornton",   "04/16/25","hourglass"],
  ["Jane Cooper",       "B6789012345720","0NP3-CN4-VT62","Initial","PT0093435","05/18/25","BP1 05/18–08/15/25","05/18/25","2519004512024","—",        "Interventions","Recertification","Nancy Brooks",     "04/14/25","warning"],
  ["Brooklyn Simmons","B6789012346001","2AB5-CD6-EF71","Initial","PT0093436","05/20/25","BP1 05/20/25–06/19/25","05/20/25","2519004513001","—","Overdue","Start of Care","Sarah Mitchell","06/19/25","warning"],
  ["Ronald Richards","B6789012346002","3BC6-DE7-FG82","Initial","PT0093437","05/21/25","BP2 05/21/25–06/20/25","05/21/25","2519004513002","—","Interventions","Recertification","James Thornton","06/20/25","warning"],
  ["Eleanor Pena","B6789012346003","4CD7-EF8-GH93","Re-Submitted","PT0093438","05/22/25","BP3 05/22/25–06/21/25","05/22/25","2519004513003","AFRM25105002","In Progress","Resumption","Linda Patel","06/21/25","hourglass"],
  ["Savannah Nguyen","B6789012346004","5DE8-FG9-HI04","Initial","PT0093439","05/23/25","BP4 05/23/25–06/22/25","05/23/25","2519004513004","—","Interventions","Discharge","Robert Chen","06/22/25","warning"],
  ["Bessie Cooper","B6789012346005","6EF9-GH0-IJ15","Initial","PT0093440","05/24/25","BP1 05/24/25–06/23/25","05/24/25","2519004513005","AFRM25105004","Completed","Follow Up","Maria Gonzalez","06/23/25","thumb"],
  ["Floyd Miles","B6789012346006","7FG0-HI1-JK26","Re-Submitted","PT0093441","05/25/25","BP2 05/25/25–06/24/25","05/25/25","2519004513006","—","Interventions","Start of Care","David Kim","06/24/25","warning"],
  ["Albert Flores","B6789012346007","8GH1-IJ2-KL37","Initial","PT0093442","05/26/25","BP3 05/26/25–06/25/25","05/26/25","2519004513007","—","Interventions","Recertification","Angela Foster","06/25/25","warning"],
  ["Jerome Bell","B6789012346008","9HI2-JK3-LM48","Initial","PT0093443","05/27/25","BP4 05/27/25–06/26/25","05/27/25","2519004513008","AFRM25105007","In Progress","Resumption","Nancy Brooks","06/26/25","hourglass"],
  ["Priscilla Alvarado","B6789012346009","0IJ3-KL4-MN59","Re-Submitted","PT0093444","05/28/25","BP1 05/28/25–06/27/25","05/28/25","2519004513009","—","Overdue","Discharge","Sarah Mitchell","06/27/25","warning"],
  ["Gregory Fisher","B6789012346010","1JK4-LM5-NO60","Initial","PT0093445","05/29/25","BP2 05/29/25–06/28/25","05/29/25","2519004513010","—","Interventions","Follow Up","James Thornton","06/28/25","warning"],
  ["Lorraine Hart","B6789012346011","2KL5-MN6-OP71","Initial","PT0093446","05/30/25","BP3 05/30/25–06/29/25","05/30/25","2519004513011","AFRM25105010","In Progress","Start of Care","Linda Patel","06/29/25","hourglass"],
  ["Bernard Boyd","B6789012346012","3LM6-NO7-PQ82","Re-Submitted","PT0093447","05/31/25","BP4 05/31/25–06/30/25","05/31/25","2519004513012","—","Interventions","Recertification","Robert Chen","06/30/25","warning"],
  ["Hattie Sanders","B6789012346013","4MN7-OP8-QR93","Initial","PT0093448","06/01/25","BP1 06/01/25–07/01/25","06/01/25","2519004513013","AFRM25105012","Completed","Resumption","Maria Gonzalez","07/01/25","thumb"],
  ["Vernon Blake","B6789012346014","5NO8-PQ9-RS04","Initial","PT0093449","06/02/25","BP2 06/02/25–07/02/25","06/02/25","2519004513014","—","Overdue","Discharge","David Kim","07/02/25","warning"],
  ["Rosalie Chandler","B6789012346015","6OP9-QR0-ST15","Re-Submitted","PT0093450","06/03/25","BP3 06/03/25–07/03/25","06/03/25","2519004513015","—","Interventions","Follow Up","Angela Foster","07/03/25","warning"],
  ["Clifford Weaver","B6789012346016","7PQ0-RS1-TU26","Initial","PT0093451","06/04/25","BP4 06/04/25–07/04/25","06/04/25","2519004513016","AFRM25105015","In Progress","Start of Care","Nancy Brooks","07/04/25","hourglass"],
  ["Marjorie Dunn","B6789012346017","8QR1-ST2-UV37","Initial","PT0093452","06/05/25","BP1 06/05/25–07/05/25","06/05/25","2519004513017","—","Interventions","Recertification","Sarah Mitchell","07/05/25","warning"],
  ["Alfred Barnett","B6789012346018","9RS2-TU3-VW48","Re-Submitted","PT0093453","06/06/25","BP2 06/06/25–07/06/25","06/06/25","2519004513018","—","Interventions","Resumption","James Thornton","07/06/25","warning"],
  ["Gladys Mccarthy","B6789012346019","0ST3-UV4-WX59","Initial","PT0093454","06/07/25","BP3 06/07/25–07/07/25","06/07/25","2519004513019","AFRM25105018","In Progress","Discharge","Linda Patel","07/07/25","hourglass"],
  ["Curtis Hansen","B6789012346020","1TU4-VW5-XY60","Initial","PT0093455","06/08/25","BP4 06/08/25–07/08/25","06/08/25","2519004513020","—","Overdue","Follow Up","Robert Chen","07/08/25","warning"],
  ["Ethel Mullins","B6789012346021","2UV5-WX6-YZ71","Re-Submitted","PT0093456","06/09/25","BP1 06/09/25–07/09/25","06/09/25","2519004513021","AFRM25105020","Completed","Start of Care","Maria Gonzalez","07/09/25","thumb"],
  ["Wallace Bryant","B6789012346022","3VW6-XY7-ZA82","Initial","PT0093457","06/10/25","BP2 06/10/25–07/10/25","06/10/25","2519004513022","—","Interventions","Recertification","David Kim","07/10/25","warning"],
  ["Norma Reeves","B6789012346023","4WX7-YZ8-AB93","Initial","PT0093458","06/11/25","BP3 06/11/25–07/11/25","06/11/25","2519004513023","—","Interventions","Resumption","Angela Foster","07/11/25","warning"],
  ["Leonard Tate","B6789012346024","5XY8-ZA9-BC04","Re-Submitted","PT0093459","06/12/25","BP4 06/12/25–07/12/25","06/12/25","2519004513024","AFRM25105023","In Progress","Discharge","Nancy Brooks","07/12/25","hourglass"],
  ["Wilma Hodges","B6789012346025","AB01-XY0-Z02","Initial","PT0093460","06/13/25","BP1 06/13/25–08/12/25","06/13/25","2519004513025","—","Overdue","Discharge","Angela Foster","08/12/25","warning"],
  ["Otis Pittman","B6789012346026","BC12-XY1-Z13","Initial","PT0093461","06/14/25","BP2 06/14/25–08/13/25","06/14/25","2519004513026","—","Interventions","Follow Up","Nancy Brooks","08/13/25","warning"],
  ["Lucille Barker","B6789012346027","CD23-XY2-Z24","Re-Submitted","PT0093462","06/15/25","BP3 06/15/25–08/14/25","06/15/25","2519004513027","—","Overdue","Start of Care","Sarah Mitchell","08/14/25","warning"],
  ["Roland Craft","B6789012346028","DE34-XY3-Z35","Initial","PT0093463","06/16/25","BP4 06/16/25–08/15/25","06/16/25","2519004513028","AFRM25105028","In Progress","Recertification","James Thornton","08/15/25","hourglass"],
  ["Myrtle Osborn","B6789012346029","EF45-XY4-Z46","Initial","PT0093464","06/17/25","BP1 06/17/25–08/16/25","06/17/25","2519004513029","—","Overdue","Resumption","Linda Patel","08/16/25","warning"],
  ["Chester Nash","B6789012346030","FG56-XY5-Z57","Re-Submitted","PT0093465","06/18/25","BP2 06/18/25–08/17/25","06/18/25","2519004513030","—","Overdue","Discharge","Robert Chen","08/17/25","warning"],
  ["Verna Whitfield","B6789012346031","GH67-XY6-Z68","Initial","PT0093466","06/19/25","BP3 06/19/25–08/18/25","06/19/25","2519004513031","AFRM25105031","Completed","Follow Up","Maria Gonzalez","08/18/25","thumb"],
  ["Emmett Sparks","B6789012346032","HI78-XY7-Z79","Initial","PT0093467","06/20/25","BP4 06/20/25–08/19/25","06/20/25","2519004513032","—","Overdue","Start of Care","David Kim","08/19/25","warning"],
  ["Josephine Ware","B6789012346033","IJ89-XY8-Z810","Re-Submitted","PT0093468","06/21/25","BP1 06/21/25–08/20/25","06/21/25","2519004513033","—","Interventions","Recertification","Angela Foster","08/20/25","warning"],
  ["Clayton Dorsey","B6789012346034","JK910-XY9-Z911","Initial","PT0093469","06/22/25","BP2 06/22/25–08/21/25","06/22/25","2519004513034","—","Overdue","Resumption","Nancy Brooks","08/21/25","warning"],
  ["Ada Kirkland","B6789012346035","KL1011-XY10-Z1012","Initial","PT0093470","06/23/25","BP3 06/23/25–08/22/25","06/23/25","2519004513035","AFRM25105035","In Progress","Discharge","Sarah Mitchell","08/22/25","hourglass"],
  ["Horace Vaughn","B6789012346036","LM1112-XY11-Z1113","Re-Submitted","PT0093471","06/24/25","BP4 06/24/25–08/23/25","06/24/25","2519004513036","—","Overdue","Follow Up","James Thornton","08/23/25","warning"],
  ["Lena Frost","B6789012346037","MN1213-XY12-Z1214","Initial","PT0093472","06/25/25","BP1 06/25/25–08/24/25","06/25/25","2519004513037","—","Overdue","Start of Care","Linda Patel","08/24/25","warning"],
  ["Elmer Ashby","B6789012346038","NO1314-XY13-Z1315","Initial","PT0093473","06/26/25","BP2 06/26/25–08/25/25","06/26/25","2519004513038","—","Interventions","Recertification","Robert Chen","08/25/25","warning"],
  ["Naomi Whitaker","B6789012346039","OP1415-XY14-Z1416","Re-Submitted","PT0093474","06/27/25","BP3 06/27/25–08/26/25","06/27/25","2519004513039","—","Overdue","Resumption","Maria Gonzalez","08/26/25","warning"],
  ["Silas Redmond","B6789012346040","PQ1516-XY15-Z1517","Initial","PT0093475","06/28/25","BP4 06/28/25–08/27/25","06/28/25","2519004513040","AFRM25105040","Completed","Discharge","David Kim","08/27/25","thumb"],
  ["Opal Guthrie","B6789012346041","QR1617-XY16-Z1618","Initial","PT0093476","06/29/25","BP1 06/29/25–08/28/25","06/29/25","2519004513041","—","Overdue","Follow Up","Angela Foster","08/28/25","warning"],
  ["Rufus Colvin","B6789012346042","RS1718-XY17-Z1719","Re-Submitted","PT0093477","06/30/25","BP2 06/30/25–08/29/25","06/30/25","2519004513042","AFRM25105042","In Progress","Start of Care","Nancy Brooks","08/29/25","hourglass"],
  ["Harold Whitmore","B679100002442","AB10-XY20-Z900","Initial","PT0093510","07/01/25","BP1 07/01/25–09/29/25","07/01/25","251900461066","AFRM25111066","Completed","Start of Care","Sarah Mitchell","07/31/25","thumb"],
  ["Ivy Castillo","B679100002479","BC11-XY21-Z901","Re-Submitted","PT0093511","07/02/25","BP2 07/02/25–09/30/25","07/02/25","251900461067","—","Interventions","Recertification","James Thornton","08/16/25","warning"],
  ["Dennis Pruitt","B679100002516","CD12-XY22-Z902","Initial","PT0093512","07/03/25","BP3 07/03/25–10/01/25","07/03/25","251900461068","—","Overdue","Resumption","Linda Patel","09/01/25","warning"],
  ["Clara Hancock","B679100002553","DE13-XY23-Z903","Re-Submitted","PT0093513","07/04/25","BP4 07/04/25–10/02/25","07/04/25","251900461069","—","In Progress","Discharge","Robert Chen","08/03/25","hourglass"],
  ["Marcus Bellamy","B679100002590","EF14-XY24-Z904","Initial","PT0093514","07/05/25","BP1 07/05/25–10/03/25","07/05/25","251900461070","—","Interventions","Follow Up","Maria Gonzalez","08/19/25","warning"],
  ["Ruth Sutton","B679100002627","FG15-XY25-Z905","Re-Submitted","PT0093515","07/06/25","BP2 07/06/25–10/04/25","07/06/25","251900461071","—","Overdue","Start of Care","Sarah Mitchell","09/04/25","warning"],
  ["Elmer Marsh","B679100002664","GH16-XY26-Z906","Initial","PT0093516","07/07/25","BP3 07/07/25–10/05/25","07/07/25","251900461072","AFRM25111072","Completed","Recertification","James Thornton","08/06/25","thumb"],
  ["June Cantrell","B679100002701","HI17-XY27-Z907","Re-Submitted","PT0093517","07/08/25","BP4 07/08/25–10/06/25","07/08/25","251900461073","—","Interventions","Resumption","Linda Patel","08/22/25","warning"],
  ["Percy Odom","B679100002738","IJ18-XY28-Z908","Initial","PT0093518","07/09/25","BP1 07/09/25–10/07/25","07/09/25","251900461074","—","Overdue","Discharge","Robert Chen","09/07/25","warning"],
  ["Wanda Beasley","B679100002775","JK19-XY29-Z909","Re-Submitted","PT0093519","07/10/25","BP2 07/10/25–10/08/25","07/10/25","251900461075","—","In Progress","Follow Up","Maria Gonzalez","08/09/25","hourglass"],
  ["Leon Yates","B679100002812","KL20-XY30-Z910","Initial","PT0093520","07/11/25","BP3 07/11/25–10/09/25","07/11/25","251900461076","—","Interventions","Start of Care","Sarah Mitchell","08/25/25","warning"],
  ["Sadie Rowe","B679100002849","LM21-XY31-Z911","Re-Submitted","PT0093521","07/12/25","BP4 07/12/25–10/10/25","07/12/25","251900461077","—","Overdue","Recertification","James Thornton","09/10/25","warning"],
  ["Gilbert Pratt","B679100002886","MN22-XY32-Z912","Initial","PT0093522","07/13/25","BP1 07/13/25–10/11/25","07/13/25","251900461078","AFRM25111078","Completed","Resumption","Linda Patel","08/12/25","thumb"],
  ["Ora Sloan","B679100002923","NO23-XY33-Z913","Re-Submitted","PT0093523","07/14/25","BP2 07/14/25–10/12/25","07/14/25","251900461079","—","Interventions","Discharge","Robert Chen","08/28/25","warning"],
  ["Homer Kirby","B679100002960","OP24-XY34-Z914","Initial","PT0093524","07/15/25","BP3 07/15/25–10/13/25","07/15/25","251900461080","—","Overdue","Follow Up","Maria Gonzalez","09/13/25","warning"],
  ["Fern Talley","B679100002997","PQ25-XY35-Z915","Re-Submitted","PT0093525","07/16/25","BP4 07/16/25–10/14/25","07/16/25","251900461081","—","In Progress","Start of Care","Sarah Mitchell","08/15/25","hourglass"],
  ["Milton Guerra","B679100003034","QR26-XY36-Z916","Initial","PT0093526","07/17/25","BP1 07/17/25–10/15/25","07/17/25","251900461082","—","Interventions","Recertification","James Thornton","08/31/25","warning"],
  ["Iris Wheeler","B679100003071","RS27-XY37-Z917","Re-Submitted","PT0093527","07/18/25","BP2 07/18/25–10/16/25","07/18/25","251900461083","—","Overdue","Resumption","Linda Patel","09/16/25","warning"],
  ["Sherman Stokes","B679100003108","ST28-XY38-Z918","Initial","PT0093528","07/19/25","BP3 07/19/25–10/17/25","07/19/25","251900461084","AFRM25111084","Completed","Discharge","Robert Chen","08/18/25","thumb"],
  ["Doris Merritt","B679100003145","TU29-XY39-Z919","Re-Submitted","PT0093529","07/20/25","BP4 07/20/25–10/18/25","07/20/25","251900461085","—","Interventions","Follow Up","Maria Gonzalez","09/03/25","warning"],
  ["Chester Rhodes","B679100003182","UV30-XY40-Z920","Initial","PT0093530","07/21/25","BP1 07/21/25–10/19/25","07/21/25","251900461086","—","Overdue","Start of Care","Sarah Mitchell","09/19/25","warning"],
  ["Effie Tanner","B679100003219","VW31-XY41-Z921","Re-Submitted","PT0093531","07/22/25","BP2 07/22/25–10/20/25","07/22/25","251900461087","—","In Progress","Recertification","James Thornton","08/21/25","hourglass"],
  ["Alonzo Cobb","B679100003256","WX32-XY42-Z922","Initial","PT0093532","07/23/25","BP3 07/23/25–10/21/25","07/23/25","251900461088","—","Interventions","Resumption","Linda Patel","09/06/25","warning"],
  ["Nettie Vance","B679100003293","XY33-XY43-Z923","Re-Submitted","PT0093533","07/24/25","BP4 07/24/25–10/22/25","07/24/25","251900461089","—","Overdue","Discharge","Robert Chen","09/22/25","warning"],
  ["Delbert Winters","B679100003330","YZ34-XY44-Z924","Initial","PT0093534","07/25/25","BP1 07/25/25–10/23/25","07/25/25","251900461090","AFRM25111090","Completed","Follow Up","Maria Gonzalez","08/24/25","thumb"],
  ["Vera Doyle","B679100003367","ZB35-XY45-Z925","Re-Submitted","PT0093535","07/26/25","BP2 07/26/25–10/24/25","07/26/25","251900461091","—","Interventions","Start of Care","Sarah Mitchell","09/09/25","warning"],
  ["Ezra Pierce","B679100003404","AC36-XY46-Z926","Initial","PT0093536","07/27/25","BP3 07/27/25–10/25/25","07/27/25","251900461092","—","Overdue","Recertification","James Thornton","09/25/25","warning"],
  ["Lula Lambert","B679100003441","BD37-XY47-Z927","Re-Submitted","PT0093537","07/28/25","BP4 07/28/25–10/26/25","07/28/25","251900461093","—","In Progress","Resumption","Linda Patel","08/27/25","hourglass"],
  ["Wilbur Holloway","B679100003478","CE38-XY48-Z928","Initial","PT0093538","07/29/25","BP1 07/29/25–10/27/25","07/29/25","251900461094","—","Interventions","Discharge","Robert Chen","09/12/25","warning"],
  ["Agnes Duncan","B679100003515","DF39-XY49-Z929","Re-Submitted","PT0093539","07/30/25","BP2 07/30/25–10/28/25","07/30/25","251900461095","—","Overdue","Follow Up","Maria Gonzalez","09/28/25","warning"],
];
// Decision status vocabulary — the PCR decision lifecycle.
const RCD_DECISIONS = ["Pre-Submission","Submitted","DCN received","UTN received","Partially-Affirmed","Affirmed","Non-Affirmed"];
const RCD_AUDITORS = [
  { name:"Sarah Mitchell",  phone:"(469) 555-0142" },
  { name:"James Thornton",  phone:"(214) 555-0188" },
  { name:"Linda Patel",     phone:"(972) 555-0117" },
  { name:"Robert Chen",     phone:"(817) 555-0163" },
  { name:"Maria Gonzalez",  phone:"(469) 555-0129" },
];
function rcdShiftDate(mdY, days) {
  const [mm,dd,yy] = mdY.split("/").map(n=>parseInt(n,10));
  const d = new Date(2000+yy, mm-1, dd+days);
  return String(d.getMonth()+1).padStart(2,"0")+"/"+String(d.getDate()).padStart(2,"0")+"/"+String(d.getFullYear()-2000).padStart(2,"0");
}
// Needs Attention buckets. Manually Terminated carries the note the user typed
// when they terminated an In-Progress record; Terminated / Failed are the usual
// business / technical exceptions.
const RCD_NA_MANUAL = [
  "Duplicate PCR submission for the episode",
  "Patient discharged before submission",
  "Re-submit requested with corrected DCN",
  "Episode cancelled in the EHR after submission",
  "Wrong benefit period selected by the agency",
  "Payor advised to withdraw the PCR request",
  "Documentation not ready before the deadline",
];
// Needs Attention reasons from the client's RCD error-message export ("reason in RCD.xlsx"):
// Failed = technical exception, Terminated = business exception. Each reason belongs to the
// automation step that raises it; the trailing client procedure is kept alongside.
const RCD_NA_POOL = {"0":{"failed":["Unable to extract PCR details from PCR console - Issue while applying filters","Unable to download PCR task documents from PCR console - Issue while applying filters","Unable to extract PCR details from PCR console - Navigation issue","Unable to download PCR task documents from PCR console - Navigation issue","Unable to extract PCR details from PCR console - File handling issue","Unable to extract PCR details from PCR console - Issue while exporting HCPCS codes","Unable to download PCR task documents from PCR console - File handling issue","Unable to download PCR task documents from PCR console - Pop-up encountered"],"terminated":["Unable to extract PCR details from PCR console - No records found after applying filters","Unable to download PCR task documents from PCR console - No records found after applying filters","Unable to export grid from PCR console - No records found after applying filters","Unable to extract PCR details from PCR console - Invalid input in plan of care status - Issue while applying filters","Unable to extract PCR details from PCR console - Invalid input in claim status - Issue while applying filters","Unable to extract PCR details from PCR console - Required values not found in Current Coverage Determination filter - Issue while applying filters","Unable to extract PCR details from PCR console - View edit submission documentation button not enabled - Issue while applying filters","Unable to export grid from PCR console - Multiple records found after applying filters","Unable to download PCR task documents from PCR console - Invalid input in plan of care status - Issue while applying filters","Unable to download PCR task documents from PCR console - Invalid input in claim status - Issue while applying filters","Unable to download PCR task documents from PCR console - Multiple records found after applying filters","Unable to extract PCR details from PCR console - Multiple records found after applying filters","Unable to extract PCR details from PCR console - Invalid file type - File handling issue","Unable to extract PCR details from PCR console - Invalid submission type - Issue while applying filters","Unable to extract PCR details from PCR console - Invalid period begin from date - Issue while applying filters","Unable to extract PCR details from PCR console - View edit button not found - Issue while applying filters","Unable to extract PCR details from PCR console - View edit submission documentation button not found - Issue while applying filters"]},"1":{"failed":["Unable to submit pre-claim review information - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Issue while entering billing period 2 information","Unable to submit pre-claim review information - Issue while entering beneficiary information","Unable to submit pre-claim review information - Issue while entering billing period 1 information","Unable to submit pre-claim review information - Navigation issue","Unable to submit pre-claim review information - Issue while entering provider information","Unable to submit pre-claim review information - Issue while entering ordering/referring physician information","Unable to submit pre-claim review information - Issue while entering attending/certifying physician information","Unable to submit pre-claim review information","Unable to submit pre-claim review information - File handling issue"],"terminated":["Unable to submit pre-claim review information - Task documents field <1,2,3,4,5,6,7> not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Issue while getting previous submission details for Resubmission","Unable to submit pre-claim review information - Same as above button not available to auto-fill physician details - Issue while entering attending/certifying physician information","Unable to submit pre-claim review information - Issue while submitting pcr request - Issue while clicking submit button","Unable to submit pre-claim review information - Issue while uploading Q2 Task1 attachments","Unable to submit pre-claim review information - Issue while uploading Q3 Task2 attachments","Unable to submit pre-claim review information - Issue while uploading Q3 Task3 attachments","Unable to submit pre-claim review information - Issue while uploading Q3 Task4 attachments","Unable to submit pre-claim review information - Issue while uploading Q4 Task5 attachments","Unable to submit pre-claim review information - Issue while uploading Q5 Task5 attachments","Unable to submit pre-claim review information - Issue while uploading Q7 Task7 attachments","Unable to submit pre-claim review information - Issue while uploading BP2 Task3 attachments","Unable to submit pre-claim review information - Provider dropdown not available - Issue while entering provider information","Unable to submit pre-claim review information - Provider dropdown not enabled - Issue while entering provider information","Unable to submit pre-claim review information - Required provider option not available - Issue while entering provider information","Unable to submit pre-claim review information - Required provider option not enabled - Issue while entering provider information","Unable to submit pre-claim review information - RCD menu not available - Navigation issue","Unable to submit pre-claim review information - Pre claim review submission sub menu not available - Navigation issue","Unable to submit pre-claim review information - Requestor name field not available - Issue while entering provider information","Unable to submit pre-claim review information - Requestor name field not enabled - Issue while entering provider information","Unable to submit pre-claim review information - Phone number field not available - Issue while entering provider information","Unable to submit pre-claim review information - Phone number field not enabled - Issue while entering provider information","Unable to submit pre-claim review information - Requestor email not available - Issue while entering provider information","Unable to submit pre-claim review information - Requestor email not enabled - Issue while entering provider information","Unable to submit pre-claim review information - Resubmission option not available - Issue while entering Resubmission details","Unable to submit pre-claim review information - Resubmission option not enabled - Issue while entering Resubmission details","Unable to submit pre-claim review information - UTN field not available - Issue while entering Resubmission details","Unable to submit pre-claim review information - UTN field not enabled - Issue while entering Resubmission details","Unable to submit pre-claim review information - Resubmission not allowed as the previous submission has not received a final decision - Issue while entering Resubmission details","Unable to submit pre-claim review information - Validate beneficiary button not available - Issue while entering beneficiary information","Unable to submit pre-claim review information - Referring physician NPI not enabled - Issue while entering ordering/referring physician information","Unable to submit pre-claim review information - Referring physician name not enabled - Issue while entering ordering/referring physician information","Unable to submit pre-claim review information - Referring physician address1 not enabled - Issue while entering ordering/referring physician information","Unable to submit pre-claim review information - Referring physician address2 not enabled - Issue while entering ordering/referring physician information","Unable to submit pre-claim review information - Referring physician state not enabled - Issue while entering ordering/referring physician information","Unable to submit pre-claim review information - Required referring physician state option not enabled - Issue while entering ordering/referring physician information","Unable to submit pre-claim review information - Referring physician city not enabled - Issue while entering ordering/referring physician information","Unable to submit pre-claim review information - Referring physician zip not enabled - Issue while entering ordering/referring physician information","Unable to submit pre-claim review information - Attending physician NPI not enabled - Issue while entering attending/certifying physician information","Unable to submit pre-claim review information - Attending physician name not enabled - Issue while entering attending/certifying physician information","Unable to submit pre-claim review information - Attending physician address1 not enabled - Issue while entering attending/certifying physician information","Unable to submit pre-claim review information - Attending physician address2 not enabled - Issue while entering attending/certifying physician information","Unable to submit pre-claim review information - Attending physician state not enabled - Issue while entering attending/certifying physician information","Unable to submit pre-claim review information - Required attending physician state option not enabled - Issue while entering attending/certifying physician information","Unable to submit pre-claim review information - Attending physician city not enabled - Issue while entering attending/certifying physician information","Unable to submit pre-claim review information - Attending physician zip not enabled - Issue while entering attending/certifying physician information","Unable to submit pre-claim review information - Billing period start date not available - Issue while entering billing period 1 information","Unable to submit pre-claim review information - Billing period end date not available - Issue while entering billing period 1 information","Unable to submit pre-claim review information - Type of bill dropdown not available - Issue while entering billing period 1 information","Unable to submit pre-claim review information - Required type of bill option not available - Issue while entering billing period 1 information","Unable to submit pre-claim review information - Q1 'Yes' option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q1 'Yes' option not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Facility type dropdown not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Required facility type option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q1 'No' option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q1 'No' option not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q2 'Yes' option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q2 'Yes' option not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q2 'No' option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q2 'No' option not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - F2F provider dropdown not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - F2F provider dropdown not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - F2F provider dropdown option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - F2F provider dropdown option not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q3 'Yes' option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q3 'Yes' option not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q3 'No' option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q3 'No' option not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q4 'Yes' option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q4 'Yes' option not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q4 'No' option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q4 'No' option not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q5 'Yes' option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q5 'Yes' option not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - ICD-10 code not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q6 'Yes' option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q6 'Yes' option not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q7 'Yes' option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q7 'Yes' option not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q8 'Yes' option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q8 'Yes' option not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Structural impairment option for Q8 not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Structural impairment option for Q8 not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q8 'No' option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q8 'No' option not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q9 'Yes' option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q9 'Yes' option not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Functional impairment option for Q9 not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Functional impairment option for Q9 not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q9 'No' option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q9 'No' option not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q10 'Yes' option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q10 'Yes' option not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Activity limitation option for Q10 not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Activity limitation option for Q10 not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q10 'No' option not available - Issue while entering dynamic tree information","Unable to submit pre-claim review information - Q10 'No' option not enabled - Issue while entering dynamic tree information","Unable to submit pre-claim review information - BP2 subsequent BP 'Yes' option not available - Issue while entering billing period 2 information","Unable to submit pre-claim review information - BP2 type of bill dropdown not available - Issue while entering billing period 2 information","Unable to submit pre-claim review information - Required BP2 type of bill option not available - Issue while entering billing period 2 information","Unable to submit pre-claim review information - BP2 HCPCS code not available - Issue while entering billing period 2 information","Unable to submit pre-claim review information - BP2 subsequent BP 'No' option not available - Issue while entering billing period 2 information","Unable to submit pre-claim review information - BP3 subsequent BP 'No' option not available - Issue while entering billing period 2 information","Unable to submit pre-claim review information - Requestor phone extension not available - Issue while entering billing period 2 information","Unable to submit pre-claim review information - Issue while uploading Q6 Task6 attachments","Unable to submit pre-claim review information - Total task documents size exceeds limit - File handling issue","Unable to submit pre-claim review information - Invalid billing period dates in palmetto","Unable to submit pre-claim review information - PCR end date must be after start date - Invalid billing period dates in palmetto","Unable to submit pre-claim review information - PCR end date must be less than 30 days - Invalid billing period dates in palmetto","Unable to submit pre-claim review information - UTN value not available - Issue while entering provider information"]},"2":{"failed":["Unable to writeback PCR details into EHR - Issue while applying filters","Unable to retrieve the pre-claim review information - Issue while applying filters","Unable to writeback PCR details into EHR - Navigation issue","Unable to retrieve the pre-claim review information - Navigation issue","Unable to retrieve the pre-claim review information - File handling issue","Unable to retrieve the pre-claim review information - Issue while entering provider information"],"terminated":["Unable to writeback PCR details into EHR - No records found after applying filters","Unable to retrieve the pre-claim review information - Issue while clearing search filters","Unable to retrieve the pre-claim review information - Issue while executing search - Issue while applying filters","Unable to writeback PCR details into EHR - View edit submission documentation button not enabled - Issue while applying filters","Unable to retrieve the pre-claim review information - Issue while opening advance search","Unable to retrieve the pre-claim review information - No records found after applying filters","Unable to retrieve the pre-claim review information - Multiple records found after applying filters","Unable to writeback PCR details into EHR - Invalid input in plan of care status - Issue while applying filters","Unable to writeback PCR details into EHR - Invalid input in claim status - Issue while applying filters","Unable to writeback PCR details into EHR - Required values not found in Current Coverage Determination filter - Issue while applying filters","Unable to writeback PCR details into EHR - Multiple records found after applying filters","Unable to retrieve the pre-claim review information - Provider field not available - Issue while entering provider information","Unable to retrieve the pre-claim review information - Provider field not enabled - Issue while entering provider information","Unable to retrieve the pre-claim review information - Required provider option not enabled - Issue while entering provider information","Unable to retrieve the pre-claim review information - Messages main menu not available - Navigation issue","Unable to retrieve the pre-claim review information - Messages main menu not enabled - Navigation issue","Unable to retrieve the pre-claim review information - Notification center messages sub menu not available - Navigation issue","Unable to retrieve the pre-claim review information - Pre claim review option not available - Navigation issue","Unable to retrieve the pre-claim review information - Pre claim review option disabled - Navigation issue","Unable to retrieve the pre-claim review information - Notification message dropdown not available - Navigation issue","Unable to retrieve the pre-claim review information - Notification message dropdown not enabled - Issue while applying filters","Unable to retrieve the pre-claim review information - Medicare ID not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Medicare ID not enabled - Issue while applying filters","Unable to retrieve the pre-claim review information - Billing period start date not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Billing period start date not enabled","Unable to retrieve the pre-claim review information - DOB not available - Issue while applying filters","Unable to retrieve the pre-claim review information - DOB field not enabled - Billing period dates mismatch","Unable to retrieve the pre-claim review information - Form name field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Status field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Submitted by field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - DOB field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Billing period start date field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Last name field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Medicare ID field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Transaction ID not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Transaction ID field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Transaction ID mismatch with extracted transaction ID - Transaction id mismatch","Unable to retrieve the pre-claim review information - Billing period number not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Billing period end date not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Submitted by textbox not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Submitted by textbox not enabled - Issue while applying filters","Unable to retrieve the pre-claim review information - Beneficiary dob mismatch","Unable to retrieve the pre-claim review information - UTN text box not enabled - Issue while applying filters","Unable to retrieve the pre-claim review information - To date textbox not enabled - Issue while applying filters","Unable to retrieve the pre-claim review information - Billing period number field not available - Billing period dates mismatch","Unable to retrieve the pre-claim review information - Billing period end date field not available - Billing period dates mismatch"]},"3":{"failed":["Unable to writeback PCR details into EHR - Issue while applying filters","Unable to retrieve the pre-claim review information - Issue while applying filters","Unable to writeback PCR details into EHR - Navigation issue","Unable to retrieve the pre-claim review information - Navigation issue","Unable to retrieve the pre-claim review information - File handling issue","Unable to retrieve the pre-claim review information - Issue while entering provider information"],"terminated":["Unable to writeback PCR details into EHR - No records found after applying filters","Unable to retrieve the pre-claim review information - Issue while clearing search filters","Unable to retrieve the pre-claim review information - Issue while executing search - Issue while applying filters","Unable to writeback PCR details into EHR - View edit submission documentation button not enabled - Issue while applying filters","Unable to retrieve the pre-claim review information - Issue while opening advance search","Unable to retrieve the pre-claim review information - No records found after applying filters","Unable to retrieve the pre-claim review information - Multiple records found after applying filters","Unable to writeback PCR details into EHR - Invalid input in plan of care status - Issue while applying filters","Unable to writeback PCR details into EHR - Invalid input in claim status - Issue while applying filters","Unable to writeback PCR details into EHR - Required values not found in Current Coverage Determination filter - Issue while applying filters","Unable to writeback PCR details into EHR - Multiple records found after applying filters","Unable to retrieve the pre-claim review information - Provider field not available - Issue while entering provider information","Unable to retrieve the pre-claim review information - Provider field not enabled - Issue while entering provider information","Unable to retrieve the pre-claim review information - Required provider option not enabled - Issue while entering provider information","Unable to retrieve the pre-claim review information - Messages main menu not available - Navigation issue","Unable to retrieve the pre-claim review information - Messages main menu not enabled - Navigation issue","Unable to retrieve the pre-claim review information - Notification center messages sub menu not available - Navigation issue","Unable to retrieve the pre-claim review information - Pre claim review option not available - Navigation issue","Unable to retrieve the pre-claim review information - Pre claim review option disabled - Navigation issue","Unable to retrieve the pre-claim review information - Notification message dropdown not available - Navigation issue","Unable to retrieve the pre-claim review information - Notification message dropdown not enabled - Issue while applying filters","Unable to retrieve the pre-claim review information - Medicare ID not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Medicare ID not enabled - Issue while applying filters","Unable to retrieve the pre-claim review information - Billing period start date not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Billing period start date not enabled","Unable to retrieve the pre-claim review information - DOB not available - Issue while applying filters","Unable to retrieve the pre-claim review information - DOB field not enabled - Billing period dates mismatch","Unable to retrieve the pre-claim review information - Form name field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Status field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Submitted by field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - DOB field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Billing period start date field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Last name field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Medicare ID field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Transaction ID not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Transaction ID field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Transaction ID mismatch with extracted transaction ID - Transaction id mismatch","Unable to retrieve the pre-claim review information - Billing period number not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Billing period end date not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Submitted by textbox not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Submitted by textbox not enabled - Issue while applying filters","Unable to retrieve the pre-claim review information - Beneficiary dob mismatch","Unable to retrieve the pre-claim review information - UTN text box not enabled - Issue while applying filters","Unable to retrieve the pre-claim review information - To date textbox not enabled - Issue while applying filters","Unable to retrieve the pre-claim review information - Billing period number field not available - Billing period dates mismatch","Unable to retrieve the pre-claim review information - Billing period end date field not available - Billing period dates mismatch"]},"4":{"failed":["Unable to import DL in EHR - Issue while applying filters","Unable to retrieve the pre-claim review information - Issue while applying filters","Unable to import DL in EHR - Navigation issue","Unable to import DL in EHR - File handling issue","Unable to retrieve the pre-claim review information - Navigation issue","Unable to retrieve the pre-claim review information - File handling issue","Unable to retrieve the pre-claim review information - Issue while downloading decision letter","Unable to retrieve the pre-claim review information - Issue while entering provider information"],"terminated":["Unable to import DL in EHR - No records found after applying filters","Unable to retrieve the pre-claim review information - Issue while clearing search filters","Unable to retrieve the pre-claim review information - Issue while executing search - Issue while applying filters","Unable to import DL in EHR - View edit submission documentation button not enabled - Issue while applying filters","Unable to retrieve the pre-claim review information - Issue while opening advance search","Unable to retrieve the pre-claim review information - No records found after applying filters","Unable to retrieve the pre-claim review information - Multiple records found after applying filters","Unable to import DL in EHR - Invalid input in plan of care status - Issue while applying filters","Unable to import DL in EHR - Invalid input in claim status - Issue while applying filters","Unable to import DL in EHR - Required values not found in Current Coverage Determination filter - Issue while applying filters","Unable to import DL in EHR - Multiple records found after applying filters","Unable to retrieve the pre-claim review information - Provider field not available - Issue while entering provider information","Unable to retrieve the pre-claim review information - Provider field not enabled - Issue while entering provider information","Unable to retrieve the pre-claim review information - Required provider option not enabled - Issue while entering provider information","Unable to retrieve the pre-claim review information - Messages main menu not available - Navigation issue","Unable to retrieve the pre-claim review information - Messages main menu not enabled - Navigation issue","Unable to retrieve the pre-claim review information - Notification center messages sub menu not available - Navigation issue","Unable to retrieve the pre-claim review information - Pre claim review option not available - Navigation issue","Unable to retrieve the pre-claim review information - Pre claim review option disabled - Navigation issue","Unable to retrieve the pre-claim review information - Notification message dropdown not available - Navigation issue","Unable to retrieve the pre-claim review information - Notification message dropdown not enabled - Issue while applying filters","Unable to retrieve the pre-claim review information - Medicare ID not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Medicare ID not enabled - Issue while applying filters","Unable to retrieve the pre-claim review information - Billing period start date not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Billing period start date not enabled","Unable to retrieve the pre-claim review information - DOB not available - Issue while applying filters","Unable to retrieve the pre-claim review information - DOB field not enabled - Billing period dates mismatch","Unable to retrieve the pre-claim review information - Form name field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Status field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Submitted by field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - DOB field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Billing period start date field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Last name field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Medicare ID field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Transaction ID not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Transaction ID field not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Transaction ID mismatch with extracted transaction ID - Transaction id mismatch","Unable to retrieve the pre-claim review information - Billing period number not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Billing period end date not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Decision letter hyperlink not enabled - Billing period dates mismatch","Unable to retrieve the pre-claim review information - Submitted by textbox not available - Issue while applying filters","Unable to retrieve the pre-claim review information - Submitted by textbox not enabled - Issue while applying filters","Unable to retrieve the pre-claim review information - Beneficiary dob mismatch","Unable to retrieve the pre-claim review information - UTN text box not enabled - Issue while applying filters","Unable to retrieve the pre-claim review information - To date textbox not enabled - Issue while applying filters","Unable to retrieve the pre-claim review information - Billing period number field not available - Billing period dates mismatch","Unable to retrieve the pre-claim review information - Billing period end date field not available - Billing period dates mismatch"]}};
const RCD_NA_PROCEDURE = {"Unable to extract PCR details from PCR console - Issue while applying filters":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to writeback PCR details into EHR - Issue while applying filters":"Client to perform writeback into the EHR manually.","Unable to import DL in EHR - Issue while applying filters":"Client to proceed with retrieving DL and perform writeback into the EHR.","Unable to download PCR task documents from PCR console - Issue while applying filters":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to extract PCR details from PCR console - Navigation issue":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to download PCR task documents from PCR console - Navigation issue":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to import DL in EHR - Navigation issue":"Client to proceed with retrieving DL and perform writeback into the EHR.","Unable to writeback PCR details into EHR - Navigation issue":"Client to perform writeback into the EHR manually.","Unable to submit pre-claim review information - Issue while entering billing period 2 information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to import DL in EHR - File handling issue":"Client to proceed with retrieving DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Issue while entering beneficiary information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Issue while entering billing period 1 information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to extract PCR details from PCR console - File handling issue":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Navigation issue":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Issue while entering provider information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Issue while entering ordering/referring physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Issue while entering attending/certifying physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to extract PCR details from PCR console - Issue while exporting HCPCS codes":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Navigation issue":"E5 encountered disabled navigation/portal controls during execution. Client to review the record in Palmetto, verify site functionality. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to download PCR task documents from PCR console - File handling issue":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - File handling issue":"Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to download PCR task documents from PCR console - Pop-up encountered":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - File handling issue":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Issue while downloading decision letter":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Issue while entering provider information":"Client to verify that the PTAN in EHR matches the exact active PTAN in Palmetto. If not link the PTAN to palmetto account  Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Task documents field <1,2,3,4,5,6,7> not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to extract PCR details from PCR console - No records found after applying filters":"Client to verify if the patient episode exists under required filter criteria and submit if available. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to import DL in EHR - No records found after applying filters":"Client to verify if the patient episode exists under required filter criteria and Proceed with retrieving DL and perform writeback into the EHR.","Unable to writeback PCR details into EHR - No records found after applying filters":"Client to verify if the patient episode exists under required filter criteria and perform writeback into the EHR manually.","Unable to download PCR task documents from PCR console - No records found after applying filters":"Client to verify if the patient episode exists under required filter criteria and submit if available. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Issue while clearing search filters":"E5 encountered disabled navigation/portal controls during execution. Client to review the record in Palmetto, verify site functionality. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Issue while executing search - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to export grid from PCR console - No records found after applying filters":"Client to verify if the patient episode exists under required filter criteria in EHR and submit if available. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to import DL in EHR - View edit submission documentation button not enabled - Issue while applying filters":"Client to proceed with retrieving DL and perform writeback into the EHR.","Unable to writeback PCR details into EHR - View edit submission documentation button not enabled - Issue while applying filters":"Client to perform writeback into the EHR manually.","Unable to extract PCR details from PCR console - Invalid input in plan of care status - Issue while applying filters":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to extract PCR details from PCR console - Invalid input in claim status - Issue while applying filters":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to extract PCR details from PCR console - Required values not found in Current Coverage Determination filter - Issue while applying filters":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to extract PCR details from PCR console - View edit submission documentation button not enabled - Issue while applying filters":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Issue while getting previous submission details for Resubmission":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Same as above button not available to auto-fill physician details - Issue while entering attending/certifying physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Issue while submitting pcr request - Issue while clicking submit button":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Issue while uploading Q2 Task1 attachments":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Issue while uploading Q3 Task2 attachments":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Issue while uploading Q3 Task3 attachments":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Issue while uploading Q3 Task4 attachments":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Issue while uploading Q4 Task5 attachments":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Issue while uploading Q5 Task5 attachments":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Issue while uploading Q7 Task7 attachments":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Issue while uploading BP2 Task3 attachments":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Issue while opening advance search":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to export grid from PCR console - Multiple records found after applying filters":"Client to review EHR PCR Console to resolve duplicate or overlapping patient records and submit the correct record available. Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to import DL in EHR - Invalid input in plan of care status - Issue while applying filters":"Client to proceed with retrieving DL and perform writeback into the EHR.","Unable to import DL in EHR - Invalid input in claim status - Issue while applying filters":"Client to proceed with retrieving DL and perform writeback into the EHR.","Unable to import DL in EHR - Required values not found in Current Coverage Determination filter - Issue while applying filters":"Client to proceed with retrieving DL and perform writeback into the EHR.","Unable to import DL in EHR - Multiple records found after applying filters":"Client to review EHR PCR Console to resolve duplicate or overlapping patient records and submit the correct record available. Client to proceed with retrieving DL and perform writeback into the EHR.","Unable to writeback PCR details into EHR - Invalid input in plan of care status - Issue while applying filters":"Client to perform writeback into the EHR manually.","Unable to writeback PCR details into EHR - Invalid input in claim status - Issue while applying filters":"Client to perform writeback into the EHR manually.","Unable to writeback PCR details into EHR - Required values not found in Current Coverage Determination filter - Issue while applying filters":"Client to perform writeback into the EHR manually.","Unable to writeback PCR details into EHR - Multiple records found after applying filters":"Client to review EHR PCR Console to resolve duplicate or overlapping patient records and submit the correct record available. Client to perform writeback into the EHR manually.","Unable to download PCR task documents from PCR console - Invalid input in plan of care status - Issue while applying filters":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to download PCR task documents from PCR console - Invalid input in claim status - Issue while applying filters":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to download PCR task documents from PCR console - Multiple records found after applying filters":"Client to review EHR PCR console to resolve duplicate or overlapping patient records and submit the correct record available. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to extract PCR details from PCR console - Multiple records found after applying filters":"Client to review EHR PCR console to resolve duplicate or overlapping patient records and submit the correct record available. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to extract PCR details from PCR console - Invalid file type - File handling issue":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to extract PCR details from PCR console - Invalid submission type - Issue while applying filters":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to extract PCR details from PCR console - Invalid period begin from date - Issue while applying filters":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to extract PCR details from PCR console - View edit button not found - Issue while applying filters":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to extract PCR details from PCR console - View edit submission documentation button not found - Issue while applying filters":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Provider dropdown not available - Issue while entering provider information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Provider dropdown not enabled - Issue while entering provider information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Required provider option not available - Issue while entering provider information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Required provider option not enabled - Issue while entering provider information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - RCD menu not available - Navigation issue":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Pre claim review submission sub menu not available - Navigation issue":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Requestor name field not available - Issue while entering provider information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Requestor name field not enabled - Issue while entering provider information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Phone number field not available - Issue while entering provider information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Phone number field not enabled - Issue while entering provider information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Requestor email not available - Issue while entering provider information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Requestor email not enabled - Issue while entering provider information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Resubmission option not available - Issue while entering Resubmission details":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Resubmission option not enabled - Issue while entering Resubmission details":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - UTN field not available - Issue while entering Resubmission details":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - UTN field not enabled - Issue while entering Resubmission details":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Resubmission not allowed as the previous submission has not received a final decision - Issue while entering Resubmission details":"Client to contact palmetto regarding decision delay and process manually. Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Validate beneficiary button not available - Issue while entering beneficiary information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Referring physician NPI not enabled - Issue while entering ordering/referring physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Referring physician name not enabled - Issue while entering ordering/referring physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Referring physician address1 not enabled - Issue while entering ordering/referring physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Referring physician address2 not enabled - Issue while entering ordering/referring physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Referring physician state not enabled - Issue while entering ordering/referring physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Required referring physician state option not enabled - Issue while entering ordering/referring physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Referring physician city not enabled - Issue while entering ordering/referring physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Referring physician zip not enabled - Issue while entering ordering/referring physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Attending physician NPI not enabled - Issue while entering attending/certifying physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Attending physician name not enabled - Issue while entering attending/certifying physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Attending physician address1 not enabled - Issue while entering attending/certifying physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Attending physician address2 not enabled - Issue while entering attending/certifying physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Attending physician state not enabled - Issue while entering attending/certifying physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Required attending physician state option not enabled - Issue while entering attending/certifying physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Attending physician city not enabled - Issue while entering attending/certifying physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Attending physician zip not enabled - Issue while entering attending/certifying physician information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Billing period start date not available - Issue while entering billing period 1 information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Billing period end date not available - Issue while entering billing period 1 information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Type of bill dropdown not available - Issue while entering billing period 1 information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Required type of bill option not available - Issue while entering billing period 1 information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q1 'Yes' option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q1 'Yes' option not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Facility type dropdown not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Required facility type option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q1 'No' option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q1 'No' option not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q2 'Yes' option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q2 'Yes' option not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q2 'No' option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q2 'No' option not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - F2F provider dropdown not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - F2F provider dropdown not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - F2F provider dropdown option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - F2F provider dropdown option not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q3 'Yes' option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q3 'Yes' option not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q3 'No' option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q3 'No' option not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q4 'Yes' option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q4 'Yes' option not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q4 'No' option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q4 'No' option not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q5 'Yes' option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q5 'Yes' option not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - ICD-10 code not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q6 'Yes' option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q6 'Yes' option not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q7 'Yes' option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q7 'Yes' option not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q8 'Yes' option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q8 'Yes' option not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Structural impairment option for Q8 not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Structural impairment option for Q8 not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q8 'No' option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q8 'No' option not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q9 'Yes' option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q9 'Yes' option not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Functional impairment option for Q9 not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Functional impairment option for Q9 not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q9 'No' option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q9 'No' option not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q10 'Yes' option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q10 'Yes' option not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Activity limitation option for Q10 not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Activity limitation option for Q10 not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q10 'No' option not available - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Q10 'No' option not enabled - Issue while entering dynamic tree information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - BP2 subsequent BP 'Yes' option not available - Issue while entering billing period 2 information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - BP2 type of bill dropdown not available - Issue while entering billing period 2 information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Required BP2 type of bill option not available - Issue while entering billing period 2 information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - BP2 HCPCS code not available - Issue while entering billing period 2 information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - BP2 subsequent BP 'No' option not available - Issue while entering billing period 2 information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - BP3 subsequent BP 'No' option not available - Issue while entering billing period 2 information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Requestor phone extension not available - Issue while entering billing period 2 information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Issue while uploading Q6 Task6 attachments":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Total task documents size exceeds limit - File handling issue":"Client to reupload correct task documents in EHR and process manually. Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - Invalid billing period dates in palmetto":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - PCR end date must be after start date - Invalid billing period dates in palmetto":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - PCR end date must be less than 30 days - Invalid billing period dates in palmetto":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to submit pre-claim review information - UTN value not available - Issue while entering provider information":"Client to submit the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Provider field not available - Issue while entering provider information":"Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Provider field not enabled - Issue while entering provider information":"E5 encountered disabled navigation/portal controls during execution. Client to review the record in Palmetto, verify site functionality Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Required provider option not enabled - Issue while entering provider information":"Client to verify that the PTAN in EHR matches the exact active PTAN in Palmetto. If not link the PTAN to palmetto account  Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Messages main menu not available - Navigation issue":"E5 encountered disabled navigation/portal controls during execution. Client to review the record in Palmetto, verify site functionality. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Messages main menu not enabled - Navigation issue":"E5 encountered disabled navigation/portal controls during execution. Client to review the record in Palmetto, verify site functionality. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Notification center messages sub menu not available - Navigation issue":"E5 encountered disabled navigation/portal controls during execution. Client to review the record in Palmetto, verify site functionality. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Pre claim review option not available - Navigation issue":"E5 encountered disabled navigation/portal controls during execution. Client to review the record in Palmetto, verify site functionality. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Pre claim review option disabled - Navigation issue":"E5 encountered disabled navigation/portal controls during execution. Client to review the record in Palmetto, verify site functionality. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Notification message dropdown not available - Navigation issue":"E5 encountered disabled navigation/portal controls during execution. Client to review the record in Palmetto, verify site functionality. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Notification message dropdown not enabled - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - Medicare ID not available - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - Medicare ID not enabled - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - Billing period start date not available - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - Billing period start date not enabled":"Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - DOB not available - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - DOB field not enabled - Billing period dates mismatch":"Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - No records found after applying filters":"Client to verify if submission made in palmetto, if not try re-submitting the record manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Multiple records found after applying filters":"Client to compare all submission records, review correct DCN, UTN, DL and identify appropriate record to process manually. Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Form name field not available - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - Status field not available - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - Submitted by field not available - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - DOB field not available - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - Billing period start date field not available - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - Last name field not available - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - Medicare ID field not available - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - Transaction ID not available - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - Transaction ID field not available - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - Transaction ID mismatch with extracted transaction ID - Transaction id mismatch":"Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - Billing period number not available - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - Billing period end date not available - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - Decision letter hyperlink not enabled - Billing period dates mismatch":"Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Submitted by textbox not available - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - Submitted by textbox not enabled - Issue while applying filters":"Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Beneficiary dob mismatch":"Client to correct data in EHR  Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - UTN text box not enabled - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - To date textbox not enabled - Issue while applying filters":"Client to proceed with retrieving DCN, UTN, DL and perform writeback into the EHR manually","Unable to retrieve the pre-claim review information - Billing period number field not available - Billing period dates mismatch":"Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR.","Unable to retrieve the pre-claim review information - Billing period end date field not available - Billing period dates mismatch":"Proceed with retrieving DCN, UTN, DL and perform writeback into the EHR."};
if (typeof window !== "undefined") { window.RCD_NA_POOL = RCD_NA_POOL; window.RCD_NA_PROCEDURE = RCD_NA_PROCEDURE; }
// Spread records over the most frequent reasons of the step so counts look like production.
function rcdNaPick(stage, group, i) {
  const p = (RCD_NA_POOL[stage] || RCD_NA_POOL[1])[group] || [];
  if (!p.length) return null;
  return p[(i * 5) % Math.min(p.length, 6)];
}
// Wait is a sub-bucket of In Progress again, alongside Terminating / In Progress.
const RCD_IP_KEYS = ["terminating","running","wait"];
const RCD_IP_BUCKETS = [
  { id:"terminating", label:"Terminating", note:"Shutting the transaction down" },
  { id:"running",     label:"In Progress", note:"Actively processing" },
  { id:"wait",        label:"Wait",        note:"Waiting on the payor or an external system" },
];
// In-Progress rows the user manually terminated (they move into Needs Attention).
const RCD_MANUAL_IDX = [1, 13, 24, 27, 31, 35, 38, 43, 46];

const RCD_PCR_STAGE_LIST = [
  "PCR data extraction from HCHB",
  "PCR Submission into Palmetto",
  "Extract and update DCN",
  "Extract and update UTN",
  "Download DL from Palmetto",
  "Upload DL into HCHB",
];
const RCD_ROWS = RCD_SEED.map((s,i)=>({
  id:"r"+(i+1), name:s[0], mrn:s[1], medicareid:s[2], submissionType:s[3], ptan:s[4],
  episodeStartDate:s[5],
  benefitPeriod:(s[6].match(/^BP(\d+)/)||[,"1"])[1],
  bpStartDate:s[7], dcn:s[8], utn:s[9],
  status:RCD_DECISIONS[i % RCD_DECISIONS.length], assessmentType:s[11], clinician:s[12], dueDate:s[13],
  // Record Status mirrors the automation log's Current Stage for the same ref.
  stage: RCD_PCR_STAGE_LIST[i % RCD_PCR_STAGE_LIST.length],
  benefitPeriodNo: String(1 + (i % 4)),
  billingPeriodNo: String(1 + (i % 2)),
  billingPeriodSubmitted: i % 3 !== 0 ? "Submitted" : "Not Submitted",
  ehrSync: i % 4 !== 2,
  receiptNo: "RCP" + String(480120 + i*7),
  txnInitDate: rcdShiftDate(s[5], 2 + (i % 6)),
  pcrSubDate: rcdShiftDate(s[5], 0),
  dcnArrived: rcdShiftDate(s[5], 2),
  utnArrived: rcdShiftDate(s[5], 4),
  dlArrived: rcdShiftDate(s[5], 7),
  socDate: s[5],
  dischargeDate: (i % 5 === 0) ? "—" : rcdShiftDate(s[5], 60 + (i%4)*15),
  bpStatus: ["Active","Closed","Pending"][i % 3],
  bpSubmitted: (i % 2 === 0) ? "Combine" : "Individual",
  auditor: RCD_AUDITORS[i % RCD_AUDITORS.length],
  auditorName: RCD_AUDITORS[i % RCD_AUDITORS.length].name,
  branch: ["Bcode","Bcode 2","Bcode 3"][i % 3],
  // Records that came back Ineligible are the ones an automation intervention is queued on.
  at: s[10]==="Interventions" ? "intervention" : (RCD_MANUAL_IDX.includes(i) ? "warning" : s[14]),
  naGroup: s[10]==="Interventions" ? null
    : RCD_MANUAL_IDX.includes(i) ? "manual"
    : s[14]==="warning" ? (i % 3 === 1 ? "terminated" : "failed") : null,
  naReason: s[10]==="Interventions" ? null
    : RCD_MANUAL_IDX.includes(i) ? RCD_NA_MANUAL[RCD_MANUAL_IDX.indexOf(i) % RCD_NA_MANUAL.length]
    : s[14]==="warning" ? "" : null,
})).map((r,i)=>{
  // Records the automation stopped before submission: they sit in Pre-Submission
  // on the decision summary. Every third one is raised as an Ineligible Record
  // under Needs Intervention (correct and continue?); the rest stay In Progress
  // while the automation keeps working them.
  if (r.at!=="intervention") {
    if (r.at!=="hourglass") return r;
    // Wait is a first-class AT status now: the share that used to sit in the
    return {...r, ipGroup: (i % 3 === 0) ? "wait" : RCD_IP_KEYS[i % 2]};
  }
  // Any Pre-Submission record raised for intervention is there for one reason only:
  // the automation marked it Ineligible before submission.
  if (r.status==="Pre-Submission") return {...r, ineligible:true};
  if (i % 3 !== 0) return r;
  return (i % 9 === 0)
    ? {...r, status:"Pre-Submission", ineligible:true}
    : (i % 4 === 1)
    ? {...r, status:"Pre-Submission", at:"hourglass", ipGroup:"wait", naGroup:null, naReason:null}
    : {...r, status:"Pre-Submission", at:"hourglass", ipGroup:RCD_IP_KEYS[i % RCD_IP_KEYS.length], naGroup:null, naReason:null};
}).map((r,i)=>{
  // Make each record internally consistent with the real PCR lifecycle:
  //   Pre-Submission        → nothing issued yet
  //   Submitted             → in Palmetto, no DCN yet
  //   DCN received       → DCN issued, awaiting UTN
  //   UTN received          → DCN + UTN, decision not returned yet
  //   Affirmative / Partial / Non-Affirmed → DCN + UTN + decision letter
  const dcn = "25190045" + String(12001 + i);
  const decided = ["Affirmed","Partially-Affirmed","Non-Affirmed"].indexOf(r.status) > -1;
  const utnPrefix = r.status==="Non-Affirmed" ? "NAFF" : r.status==="Partially-Affirmed" ? "PAFF" : "AFRM";
  const utn = utnPrefix + "251004" + String(12 + i);
  if (r.status==="Pre-Submission") {
    // Ineligible records only ever surface at the HCHB extraction step, so every
    // Pre-Submission record (ineligible or not) sits on stage 1.
    return {...r, dcn:"—", utn:"—", stage:RCD_PCR_STAGE_LIST[0],
      pcrSubDate:"—", dcnArrived:"—", utnArrived:"—", dlArrived:"—", ehrSync:null };
  }
  if (r.status==="Submitted") {
    return {...r, ineligible:false, dcn:"—", utn:"—", stage:RCD_PCR_STAGE_LIST[1],
      dcnArrived:"—", utnArrived:"—", dlArrived:"—", ehrSync:true };
  }
  if (r.status==="DCN received") {
    return {...r, ineligible:false, dcn, utn:"—", stage:RCD_PCR_STAGE_LIST[2],
      utnArrived:"—", dlArrived:"—", ehrSync:true };
  }
  if (r.status==="UTN received") {
    return {...r, ineligible:false, dcn, utn, stage:RCD_PCR_STAGE_LIST[3],
      dlArrived:"—", ehrSync:true };
  }
  if (decided) {
    // A decision status only exists once the record reaches "Upload DL into HCHB".
    // Records still sitting at "Download DL from Palmetto" have no decision yet,
    // so they fall back to Decision Pending (UTN received).
    if (i % 3 === 2) {
      return {...r, status:"UTN received", dcn, utn:"AFRM" + "251004" + String(12 + i),
        stage:RCD_PCR_STAGE_LIST[4], ehrSync:true };
    }
    return {...r, dcn, utn, stage:RCD_PCR_STAGE_LIST[5], ehrSync:true };
  }
  return r;
}).map((r,i)=>{
  // AT status has to agree with the stage the record is sitting on:
  //   stage 1 + ineligible → Needs Intervention (Ineligible Record)
  //   stage 1 otherwise    → still being worked: In Progress / Wait / Needs Attention
  //   stages 2-5 (pending) → never Completed; the automation is mid-pipeline
  //   Upload DL into HCHB  → Completed; a record already in HCHB isn't waiting
  const idx = RCD_PCR_STAGE_LIST.indexOf(r.stage);
  const clearNA = { naGroup:null, naReason:null };
  if (r.id==="r92") return {...r, submissionType:"Initial", ineligible:false, at:"warning", ipGroup:null, naGroup:"failed", naReason:rcdNaPick(0,"failed",0) };
  if (idx === 5) return {...r, at:"thumb", ipGroup:null, ...clearNA };
  if (r.ineligible) return {...r, at:"intervention", ipGroup:null, niIdx: (r.id==="r28" || r.id==="r57" || r.id==="r46") ? 0 : r.id==="r15" ? 1 : 1 + (i % 2), ...clearNA };
  if (r.at==="thumb") {
    // Completed before the DL is uploaded is a sync error — put the record back
    // on the work it is actually doing.
    return {...r, at:"hourglass", ipGroup: (i % 4 === 1) ? "wait" : RCD_IP_KEYS[i % 2], ...clearNA };
  }
  if (r.at==="intervention" && idx === 0) {
    // Only the eligibility check raises interventions at extraction; anything
    // else at this stage is simply still running.
    return {...r, at:"hourglass", ipGroup:RCD_IP_KEYS[i % RCD_IP_KEYS.length], ...clearNA };
  }
  if (r.status==="Pre-Submission" && (r.at==="warning" || (r.at==="hourglass" && ["r22","r29","r43"].includes(r.id)))) {
    // Pre-Submission Needs Attention: Initial → task-file download error;
    // Re-Submitted → previous submission missing in HCHB.
    const g = (i % 3 === 1) ? "terminated" : "failed";
    return {...r, at:"warning", ipGroup:null, naGroup:g, naReason: rcdNaPick(0, g, i) };
  }
  // Wait only applies after Palmetto submission — Pre-Submission records are still being worked.
  if (r.status==="Pre-Submission" && r.at==="hourglass" && r.ipGroup==="wait") return {...r, ipGroup: (i % 2) ? "terminating" : "running" };
  if (r.at==="warning" && r.naGroup!=="manual") {
    const g = r.naGroup==="terminated" ? "terminated" : "failed";
    const pick = rcdNaPick(idx, g, i);
    if (!pick) return {...r, at:"hourglass", ipGroup:RCD_IP_KEYS[i % RCD_IP_KEYS.length], ...clearNA };
    const pool = (RCD_NA_POOL[idx] || {})[g] || [];
    if (!pool.includes(r.naReason)) return {...r, naGroup:g, naReason: pick };
  }
  return r;
});
RCD_ROWS.forEach((r,i)=>{ if (r.status==="Pre-Submission" && r.ipGroup==="wait") r.ipGroup = (i % 2) ? "terminating" : "running"; });
// Example: AT In Progress with sub-status In Progress, mid-pipeline (DCN received).
(function(){
  const tpl = RCD_ROWS.find(x=>x.status==="DCN received") || RCD_ROWS[0];
  if (!tpl || RCD_ROWS.some(x=>x.id==="r900")) return;
  RCD_ROWS.splice(1, 0, { ...tpl, id:"r900", name:"John Carter", mrn:"B679100009001", medicareid:"DE91-XY90-Z901",
    status:"DCN received", stage:RCD_PCR_STAGE_LIST[2], at:"hourglass", ipGroup:"running", naGroup:null, naReason:null, ineligible:false });
})();
// Two more In Progress › In Progress records at other non-final business statuses.
(function(){
  if (RCD_ROWS.some(x=>x.id==="r901")) return;
  const add = [
    { id:"r901", name:"Harold Bennett", mrn:"B679100009011", medicareid:"HB91-XY91-Z911", status:"Submitted",    stage:RCD_PCR_STAGE_LIST[1] },
    { id:"r902", name:"Lucia Moreno",   mrn:"B679100009021", medicareid:"LM92-XY92-Z921", status:"UTN received", stage:RCD_PCR_STAGE_LIST[3] },
  ];
  add.forEach((a,k)=>{
    const tpl = RCD_ROWS.find(x=>x.status===a.status) || RCD_ROWS.find(x=>x.status==="DCN received") || RCD_ROWS[0];
    RCD_ROWS.splice(2+k, 0, { ...tpl, ...a, at:"hourglass", ipGroup:"running", naGroup:null, naReason:null, ineligible:false });
  });
})();
// Rebase every record's dates onto the last 90 days (relative to today), keeping
// each record's internal spacing. The In Progress examples land in the last 7 days.
(function(){
  if (RCD_ROWS.__rebased) return; RCD_ROWS.__rebased = true;
  const RX = /^\d{2}\/\d{2}\/\d{2}$/;
  const parse = (s)=>{ const [m,d,y]=s.split("/").map(n=>parseInt(n,10)); return new Date(2000+y,m-1,d); };
  const today = new Date(); today.setHours(0,0,0,0);
  const recent = { r900:4, r901:5, r902:6 };
  const F = ["episodeStartDate","bpStartDate","dueDate","txnInitDate","pcrSubDate","dcnArrived","utnArrived","dlArrived","socDate","dischargeDate"];
  RCD_ROWS.forEach((r,i)=>{
    if (!r.txnInitDate || !RX.test(r.txnInitDate)) return;
    const ago = recent[r.id] != null ? recent[r.id] : r.name==="Clara Hancock" ? 2 : (i * 11) % 90;
    const target = new Date(today); target.setDate(today.getDate() - ago);
    const delta = Math.round((target - parse(r.txnInitDate)) / 86400000);
    F.forEach(k=>{ if (typeof r[k]==="string" && RX.test(r[k])) r[k] = rcdShiftDate(r[k], delta); });
  });
  // Clara Hancock leads the PCR view and automation log.
  const ci = RCD_ROWS.findIndex(r=>r.name==="Clara Hancock");
  if (ci > 0) RCD_ROWS.unshift(RCD_ROWS.splice(ci,1)[0]);
})();
// Interventions belong to the step the record is on — a UTN mismatch can't be
// raised on a record that hasn't reached the UTN step yet.
const RCD_PRESUB_NI = [
  { key:"ELIGIBILITY_CHECK", reason:"BP2 is not available" },
  { key:"HCPCS_CODES", reason:"HCPCS codes are missing" },
  { key:"ASSESSMENT_QUESTIONS", reason:"Q1 is not available, Q2 is not available, Q3 is not available, Q4 is not available, Q6 is not available, Q7 is not available, All Q8 Q9 Q10 must not be answered 'No' at the same time" },
];
const RCD_INT_KEYS_BY_STAGE = {
  0: ["ELIGIBILITY_CHECK"],
  1: ["HIC_NUMBER","PTAN","PHYSICIAN_NPI","BENEFIT_PERIOD","DOC_PACKET","PORTAL_SESSION"],
  2: ["PORTAL_SESSION","BENEFIT_PERIOD","HIC_NUMBER"],
  3: ["UTN_MISMATCH","PORTAL_SESSION"],
  4: ["F2F_ENCOUNTER","DOC_PACKET","PORTAL_SESSION"],
  5: [],
};
// Tally the Needs-Attention reasons for the dropdown, in the shape the shared
// ARVNeedsAttentionMenu expects.
function computeRcdNA(rows) {
  const bucket = { manual:{}, terminated:{}, failed:{} };
  (rows||RCD_ROWS).filter(r=>r.at==="warning" && r.naGroup).forEach(r=>{
    bucket[r.naGroup][r.naReason] = (bucket[r.naGroup][r.naReason]||0) + 1;
  });
  const pairs = (o)=>Object.keys(o).map(k=>[k,o[k]]).sort((x,y)=>y[1]-x[1]);
  return { manualReasons:pairs(bucket.manual), termReasons:pairs(bucket.terminated), failReasons:pairs(bucket.failed) };
}
if (typeof window !== "undefined") window.RCD_ROWS = RCD_ROWS;
// Manual termination: record sits in In Progress › Terminating for 30s, then
// flips to Needs Attention › Manually Terminated.
const RCD_TERM_MS = 30000;
function rcdIsTerminating(rec){ return !!(rec && rec.until && Date.now() < rec.until); }
function rcdStartManualTerm(row, rec){
  const full = {...rec, until: Date.now() + RCD_TERM_MS};
  window.__rcdManualTerm = {...(window.__rcdManualTerm||{}), [row.id]: full};
  const d = window.__pcrForDrawer;
  if (d && d.id===row.id) window.__pcrForDrawer = {...d, at:"hourglass", ipGroup:"terminating", naGroup:undefined, manualNote:full.note, termBy:full.by, termAt:full.at};
  window.dispatchEvent(new Event("rcd-terminated"));
  if (window.__renderApp) setTimeout(window.__renderApp, 0);
  setTimeout(()=>{
    const cur = window.__pcrForDrawer;
    if (cur && cur.id===row.id) window.__pcrForDrawer = {...cur, at:"warning", naGroup:"manual", naReason:full.reason, manualNote:full.note, termBy:full.by, termAt:full.at};
    window.dispatchEvent(new Event("rcd-terminated"));
    if (window.__renderApp) window.__renderApp();
  }, RCD_TERM_MS + 50);
}
if (typeof window !== "undefined") { window.rcdIsTerminating = rcdIsTerminating; window.rcdStartManualTerm = rcdStartManualTerm; }

// ── Helpers ───────────────────────────────────────────────────
const rcdLongDate = (mdY, time) => {
  const m = String(mdY||"").match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!m) return mdY || "—";
  const yr = m[3].length===2 ? "20"+m[3] : m[3];
  return `${parseInt(m[2],10)} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m[1],10)-1]} ${yr} ${time}`;
};
const rcdPad = (n) => String(n).padStart(2,"0");
const rcdNowStamp = () => {
  const d = new Date();
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
  return `${d.getDate()} ${mon} ${d.getFullYear()} ${rcdPad(((d.getHours()+11)%12)+1)}:${rcdPad(d.getMinutes())} ${d.getHours()<12?"AM":"PM"}`;
};
const rcdIcon = (k, fb) => (typeof window!=="undefined" && window.__resources && window.__resources[k]) || fb;
const RCD_AT_MAP = { completed:"thumb", warning:"warning", inprogress:"hourglass", intervention:"intervention" };
const RCD_DASH = <span style={{color:"#cbd5e1"}}>—</span>;

function RCDATIcon({ kind }) {
  if (kind==="thumb")     return <img title="Completed"       alt="Completed"       src={rcdIcon("atCompleted","icons/at-completed.png")} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind==="hourglass") return <img title="In Progress"     alt="In Progress"     src={rcdIcon("atInProgress","icons/at-in-progress.png")} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind==="wait") return (
    <span title="Wait" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:18,height:18}}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#8b5cf6" strokeWidth="1.8"/><path d="M12 7.5V12l3 2" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </span>
  );
  if (kind==="warning")   return <img title="Needs Attention" alt="Needs Attention" src={rcdIcon("atNeedsAttention","icons/at-needs-attention.png")} style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind==="manual") return (
    <svg width="16" height="16" viewBox="0 0 16 16" role="img" aria-label="Manually Terminated" style={{color:"#5B8FF9"}}><title>Manually Terminated</title>
      <circle cx="8" cy="5" r="2.6" fill="currentColor" />
      <path d="M2.6 13.4c0-2.6 2.4-4.2 5.4-4.2s5.4 1.6 5.4 4.2z" fill="currentColor" />
    </svg>
  );
  if (kind==="interventionDone") return <RCDInterventionGlyph done />;
  if (kind==="intervention") return <RCDInterventionGlyph />;
  return RCD_DASH;
}

// Needs Intervention — a wrench inside a ring, drawn so it reads at 18px alongside
// the three raster AT icons. `done` = every intervention worked off: green ring
// with a tick badge, so the grid separates active from completed at a glance.
function RCDInterventionGlyph({ size=18, done=false }) {
  const c = done ? "#16a34a" : "#d97706";
  const bg = done ? "#f0fdf4" : "#fff7ed";
  const label = done ? "Completed Interventions" : "Pending Intervention";
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" role="img" aria-label={label}><title>{label}</title>
      <circle cx="10" cy="10" r="9" fill={bg} stroke={c} strokeWidth="1.4" />
      <path d="M12.7 5.1a2.9 2.9 0 0 0-3.6 3.6l-3.6 3.6a1 1 0 0 0 0 1.4l.8.8a1 1 0 0 0 1.4 0l3.6-3.6a2.9 2.9 0 0 0 3.6-3.6l-1.6 1.6-1.4-.2-.2-1.4 1.6-1.6z" fill={c} />
      {done && (
        <g>
          <circle cx="15" cy="15" r="4.6" fill="#16a34a" stroke="#fff" strokeWidth="1.1" />
          <path d="M12.9 15.1 L14.4 16.6 L17.1 13.6" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
}

// AT Status cell — the icon alone can't say *why* a record needs attention or
// intervention, so those two states carry their reason inline (ineligible
// records raised at HCHB extraction read "Ineligible Record").
function rcdAtReason(row) {
  if (row.at==="intervention") {
    if (row.ineligible) return ((row.niIdx||0)===0 ? "Ineligible Record: " : "") + RCD_PRESUB_NI[row.niIdx||0].reason;
    const open = rcdInterventions(row).filter(it=>it.status!=="Completed");
    const reasons = Array.from(new Set((open.length?open:rcdInterventions(row)).map(it=>it.reason)));
    if (!reasons.length) return "Pending Intervention";
    return reasons.length>1 ? reasons[0] + " +" + (reasons.length-1) : reasons[0];
  }
  if (row.at==="warning") return row.naReason || "Needs Attention";
  if (row.at==="hourglass") return (RCD_IP_BUCKETS.find(b=>b.id===(row.ipGroup||"running"))||{}).label || "In Progress";
  if (row.at==="completed" || row.at==="thumb") return "Completed";
  return null;
}
// Full "Needs Intervention — Ineligible Record" style wording, shared with the
// automation log.
function rcdAtLabel(row) {
  if (row.at==="warning" && row.naGroup==="manual") return "Manually Terminated" + (row.manualNote ? " — " + row.manualNote : "");
  const base = ({ intervention:"Needs Intervention", warning:"Needs Attention", hourglass:"In Progress", thumb:"Completed", completed:"Completed" })[row.at];
  if (!base) return "";
  const reason = rcdAtReason(row);
  return reason && reason!==base ? base + " — " + reason : base;
}
function RCDATCell({ row, onIntervention, onInProgress }) {
  const reason = rcdAtReason(row);
  const clickable = row.at==="intervention" || row.at==="hourglass";
  const manual = row.at==="warning" && row.naGroup==="manual";
  const full = row.at==="intervention" ? "Needs Intervention — " + reason
    : manual ? "Manually Terminated" + (row.manualNote ? " — " + row.manualNote : "")
    : row.at==="warning" ? "Needs Attention — " + reason : reason;
  if (!row.at || row.at==="none") return RCD_DASH;
  return (
    <span role={clickable ? "button" : undefined} title={full || undefined}
      onClick={clickable ? (e)=>{ e.stopPropagation(); if(row.at==="intervention") onIntervention && onIntervention(row); else onInProgress && onInProgress(row); } : undefined}
      style={{display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:clickable?"pointer":"default"}}>
      <span style={{display:"inline-flex",pointerEvents:"none"}}><RCDATIcon kind={manual ? "manual" : row.at} /></span>
    </span>
  );
}

const RCD_PILL = {
  "Decision Pending":                { bg:"#eff6ff", bd:"#3f7ba8", c:"#3f7ba8" },
  "Submitted":                       { bg:"#f1f5f9", bd:"#64748b", c:"#475569" },
  "UTN received":                    { bg:"#f0fdfa", bd:"#0d9488", c:"#0d9488" },
  "DCN received":               { bg:"#eef2ff", bd:"#6366f1", c:"#6366f1" },
  "Partially-Affirmed": { bg:"#eff6ff", bd:"#3f7ba8", c:"#3f7ba8" },
  "Affirmed":         { bg:"#f0fdf4", bd:"#16a34a", c:"#16a34a" },
  "Non-Affirmed":                 { bg:"#fef2f2", bd:"#dc2626", c:"#dc2626" },
  "Pre-Submission":                  { bg:"#fff7ed", bd:"#f97316", c:"#f97316" },
};
function RCDPill({ status }) {
  const pending = false;
  const shown = status;
  const s = RCD_PILL[shown] || RCD_PILL[status] || { bg:"#f1f5f9", bd:"#94a3b8", c:"#64748b" };
  const [tip, setTip] = useRCD(null);
  const wrapRef = React.useRef(null);
  return (
    <span ref={wrapRef} style={{position:"relative",display:"inline-block",width:180,maxWidth:"100%"}}
      onMouseEnter={()=>{ if(!pending || !wrapRef.current) return; const r=wrapRef.current.getBoundingClientRect(); setTip({ top:r.top-8, left:r.left+r.width/2 }); }}
      onMouseLeave={()=>setTip(null)}>
      <span style={{display:"block",boxSizing:"border-box",padding:"2px 2px",borderRadius:2,background:s.bg,border:`1px solid ${s.bd}`,color:s.c,font:"500 11px/14px Roboto",textAlign:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{shown}</span>
      {pending && tip && ReactDOM.createPortal(
        <span style={{position:"fixed",top:tip.top,left:tip.left,transform:"translate(-50%,-100%)",background:"#1f2937",color:"#fff",borderRadius:5,padding:"5px 10px",font:"400 11px/15px Roboto",whiteSpace:"nowrap",boxShadow:"0 6px 16px rgba(15,23,42,.22)",zIndex:2147483000,pointerEvents:"none"}}>{status}</span>,
        document.body)}
    </span>
  );
}

// ── Filter bar ────────────────────────────────────────────────
function RCDFilterChip({ label, onRemove }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:10,background:"#f4f6f9",border:"1px solid #d8dee6",borderRadius:6,padding:"6px 10px",font:"400 12px/16px Roboto",color:"#334155",whiteSpace:"nowrap",flexShrink:0}}>
      {label}
      <button type="button" title="Remove filter" onClick={onRemove} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",border:"none",background:"transparent",color:"#64748b",fontSize:13,lineHeight:1,cursor:"pointer",padding:0}}>✕</button>
    </span>
  );
}

const RCD_FILTER_FIELDS = [
  { key:"branch",         label:"Branch" },
  { key:"submissionType", label:"Submission Type" },
  { key:"ptan",           label:"PTAN" },
  { key:"auditorName",    label:"Clinical Auditor Name" },
];

function RCDFilterBar({ chips, datePicker, fieldFilters, onFieldFilters, onClearAll, searchValue, onSearch }) {
  const [open, setOpen] = useRCD(false);
  const [dpOpen, setDpOpen] = useRCD(false);
  const dref = useRCDR(null);
  useRCDE(()=>{ if(!dpOpen) return; const h=(e)=>{ if(dref.current && !dref.current.contains(e.target)) setDpOpen(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[dpOpen]);
  const DP = typeof window!=="undefined" && window.DatePicker;
  const FP = typeof window!=="undefined" && window.FilterPopover;
  const labelOf = (k) => (RCD_FILTER_FIELDS.find(f=>f.key===k)||{}).label || k;
  const fieldTags = [];
  (fieldFilters||[]).forEach(f => f.values.forEach(v => fieldTags.push({
    id:`${f.field}:${v}`, label:`${labelOf(f.field)}: ${v}`,
    onRemove: () => onFieldFilters(fieldFilters.map(x => x.field===f.field ? {...x, values:x.values.filter(y=>y!==v)} : x).filter(x=>x.values.length)),
  })));
  return (
    <div style={{background:"#eef4fb",borderBottom:"1px solid #e2e8f0",padding:"10px 24px",display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap"}}>
      <div style={{position:"relative",flexShrink:0}} ref={dref}>
        <button type="button" onClick={()=>setDpOpen(v=>!v)} style={{background:"#fff",border:"1px solid #d8d8d8",borderRadius:4,padding:"5px 12px",font:"400 12px/16px Roboto",color:"#0f172a",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,whiteSpace:"nowrap"}}>
          {`PCR Init Date : ${datePicker.value ? datePicker.value.start + " – " + datePicker.value.end : "All"}`}
          <span style={{color:"#94a3b8",fontSize:9}}>▾</span>
        </button>
        {dpOpen && DP && <DP value={datePicker.value} available={datePicker.available} onChange={(d)=>{ datePicker.onChange(d); setDpOpen(false); }} />}
      </div>
      <div style={{position:"relative",flexShrink:0}}>
        <button type="button" onClick={()=>setOpen(v=>!v)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:6,padding:"5px 4px",whiteSpace:"nowrap"}}>
          <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:"#2563eb",color:"#fff",fontSize:10,fontWeight:600,lineHeight:1}}>+</span>
          Add More Filters
        </button>
        {open && FP && <FP fields={RCD_FILTER_FIELDS} rows={RCD_ROWS} initial={fieldFilters} onApply={(f)=>{ onFieldFilters(f); setOpen(false); }} onClose={()=>setOpen(false)} />}
      </div>
      <div className="chip-scroll" style={{display:"flex",alignItems:"center",gap:14,flexWrap:"nowrap",overflowX:"auto",flex:"1 1 auto",minWidth:0}}>
        {chips.map(c => <RCDFilterChip key={c.id} label={c.label} onRemove={c.onRemove} />)}
        {fieldTags.map(t => <RCDFilterChip key={t.id} label={t.label} onRemove={t.onRemove} />)}
      </div>
      {(chips.length + fieldTags.length) > 0 && (
        <button type="button" onClick={onClearAll} style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",padding:"5px 4px",flexShrink:0,whiteSpace:"nowrap"}}>Clear all</button>
      )}
      <div style={{position:"relative",flexShrink:0}}>
        <img src={rcdIcon("searchIcon","icons/search.svg")} alt="search" style={{width:14,height:14,objectFit:"contain",position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}} />
        <input type="text" value={searchValue} onChange={e=>onSearch(e.target.value)} placeholder="Search Patient Records" style={{width:240,background:"#fff",border:"1px solid #93c5e8",borderRadius:6,padding:"6px 12px 6px 32px",font:"400 12px/16px Roboto",color:"#0f172a",outline:"none"}} />
      </div>
    </div>
  );
}

// ── Title cluster ─────────────────────────────────────────────
function RCDTitleCluster() {
  return (
    <div>
      <div style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>PCR View</div>
      <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Decision Status Summary of Claim Center</div>
      <div style={{marginTop:10,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block"}}>Expand a row to view its previous review submissions</div>
    </div>
  );
}

// ── Status summary box (Style A) ──────────────────────────────
// Decision Pending folds the three pre-decision states into one chip; the
// caret opens their breakdown so a user can narrow to any subset.
const RCD_PENDING_SUBS = [
  { id:"submitted", label:"Submitted",       color:"#475569", match:(r)=>r.status==="Submitted" },
  { id:"dcn",       label:"DCN received", color:"#6366f1", match:(r)=>r.status==="DCN received" },
  { id:"utn",       label:"UTN received",    color:"#0d9488", match:(r)=>r.status==="UTN received" },
];
const RCD_PENDING_STATUSES = ["Submitted","DCN received","UTN received"];
const RCD_STATUS = [
  { id:"all_records",  label:"All Records",                          color:"#64748b",         weight:1.0, match:null },
  { id:"pre_submission", label:"Pre-Submission",                     color:"#f97316",         weight:1.1, match:(r)=>r.status==="Pre-Submission" },
  { id:"submitted",    label:"Submitted",                      color:"#64748b",         weight:1.1, match:(r)=>r.status==="Submitted" },
  { id:"dcn_received", label:"DCN received",                   color:"#6366f1",         weight:1.2, match:(r)=>r.status==="DCN received" },
  { id:"utn_received", label:"UTN received",                   color:"#0d9488",         weight:1.2, match:(r)=>r.status==="UTN received" },
  { id:"partial_prov", label:"Partially-Affirmed",      color:"#3f7ba8",         weight:1.7, match:(r)=>r.status==="Partially-Affirmed" },
  { id:"prov",         label:"Affirmed",              color:"#16a34a",         weight:1.2, match:(r)=>r.status==="Affirmed" },
  { id:"non_affirm",   label:"Non-Affirmed",                      color:"#dc2626",         weight:1.4, match:(r)=>r.status==="Non-Affirmed" },
];

function RCDStatusStrip({ scopedRows, totalRows, activeStatus, onPick, anyFilter, onReset, review, pendingSubs, onPendingSubs }) {
  const reviewIds = ["non_affirm","partial_prov"];
  const [openMenu, setOpenMenu] = useRCD(false);
  const rootRef = React.useRef(null);
  useRCDE(()=>{ if(!openMenu) return; const h=(e)=>{ if(rootRef.current && !rootRef.current.contains(e.target)) setOpenMenu(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); }, [openMenu]);
  return (
    <div ref={rootRef} style={{display:"inline-flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",overflow:"visible",maxWidth:"100%",marginLeft:"auto"}}>
      <div style={{padding:"12px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",justifyContent:"center",font:"500 13px/18px Roboto",color:"#333",flexShrink:0}}>
        <span>Decision Status</span><span>Summary</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-start",gap:12,minWidth:0,overflowX:openMenu?"visible":"auto",padding:"0 12px"}} className="ws-hscroll">
        {RCD_STATUS.map(s=>{
          const isAll = s.id==="all_records";
          const active = !isAll && activeStatus===s.id;
          const dim = activeStatus && !active;
          const count = isAll ? totalRows : scopedRows.filter(s.match).length;
          // In review mode, tiles outside the review set only fade when they hold no records.
          const irrelevant = review && !isAll && !reviewIds.includes(s.id) && count===0;
          return (
            <div key={s.id} role="button" title={s.label} onClick={()=>onPick(isAll ? null : (active ? null : s.id))}
              style={{position:"relative",flex:"0 0 auto",minWidth:0,boxSizing:"border-box",padding:"12px 6px",cursor:"pointer",opacity:irrelevant?0.22:((dim&&!isAll)?0.35:1),transition:"opacity .12s,background .12s",background:active?"#f8fafc":"transparent"}}
              onMouseEnter={e=>{ if(!active&&!dim) e.currentTarget.style.background="#fafbfc"; }}
              onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
              <div style={{display:"inline-flex",flexDirection:"column",alignItems:"stretch",minWidth:0}}>
                <div style={{height:3,borderRadius:2,background:s.color,opacity:active?1:0.85,marginBottom:8,marginLeft:-6,marginRight:-6}}></div>
                <div style={{display:"flex",alignItems:"center",gap:5,font:"400 12px/15px Roboto",color:(isAll&&(dim||anyFilter))?"#b0b0b0":"#333",whiteSpace:"nowrap"}}>
                  <span>{s.label}</span>
                  {s.caret && (
                    <span title="Sub-status breakdown" onClick={(e)=>{ e.stopPropagation(); setOpenMenu(o=>!o); }}
                      style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,cursor:"pointer",color:"#2563eb"}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 8 L19 8 L12 17 Z" fill="currentColor" /></svg>
                    </span>
                  )}
                </div>
                <div style={{font:"600 18px/22px Roboto",color:(isAll&&(dim||anyFilter))?"#b0b0b0":"#0f172a",marginTop:4}}>{rcdPad(count)}</div>
                {anyFilter && isAll && (
                  <button type="button" onClick={e=>{ e.stopPropagation(); onReset ? onReset() : onPick(null); }} style={{marginTop:4,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4}}><span style={{fontSize:11}}>↻</span>Reset</button>
                )}
              </div>
              {s.caret && openMenu && (
                <div onClick={(e)=>e.stopPropagation()} style={{position:"absolute",top:"100%",left:0,zIndex:60}}>
                  <RCDBucketMenu buckets={RCD_PENDING_SUBS}
                    counts={RCD_PENDING_SUBS.reduce((m,b)=>{ m[b.id]=scopedRows.filter(b.match).length; return m; },{})}
                    selected={pendingSubs}
                    onApply={(ids)=>{ onPendingSubs && onPendingSubs(ids && ids.length && ids.length<RCD_PENDING_SUBS.length ? ids : null); onPick("decision_pending"); setOpenMenu(false); }}
                    onClose={()=>setOpenMenu(false)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Automation (AT) Status row — sits directly below the box ──
const RCD_AT_ITEMS = [
  { id:"completed",  label:"Completed",       kind:"thumb",     match:(r)=>r.at==="thumb" },
  { id:"warning",    label:"Needs Attention", kind:"warning",   num:"#d97706", caret:true, match:(r)=>r.at==="warning" && r.naGroup!=="manual" },
  { id:"manualterm", label:"Manually Terminated", kind:"manual", num:"#d97706", match:(r)=>r.at==="warning" && r.naGroup==="manual" },
  { id:"intervention", label:"Needs Intervention", kind:"intervention", num:"#d97706", caret:true, match:(r)=>r.at==="intervention" },
  { id:"inprogress", label:"In Progress",     kind:"hourglass", caret:true, match:(r)=>r.at==="hourglass" },
];
// Sub-buckets behind the Needs Intervention caret.
const RCD_INT_BUCKETS = [
  { id:"interventionActive", label:"Pending Interventions", kind:"intervention", color:"#d97706", match:(r)=>r.at==="intervention" },
];
const RCD_AT_LOOKUP = RCD_AT_ITEMS.concat(RCD_INT_BUCKETS);
function RCDBucketMenu({ buckets, counts, selected, onApply, onClose }) {
  const all = buckets.map(b=>b.id);
  const [checked, setChecked] = useRCD(()=> (selected && selected.length) ? selected.slice() : all.slice());
  const toggle = (id) => setChecked(c => c.includes(id) ? c.filter(x=>x!==id) : c.concat(id));
  const allOn = checked.length===all.length;
  return (
    <div style={{width:330,background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,boxShadow:"0 12px 30px rgba(15,23,42,0.18)",padding:"12px 0 0"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 16px 10px",borderBottom:"1px solid #eef1f5"}}>
        <span role="checkbox" aria-checked={allOn} onClick={()=>setChecked(allOn?[]:all.slice())} style={{width:15,height:15,border:`1px solid ${allOn?"#1677FF":"#cbd5e1"}`,borderRadius:3,background:allOn?"#1677FF":"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",font:"700 10px/1 Roboto"}}>{allOn?"✓":""}</span>
        <span style={{font:"500 13px/18px Roboto",color:"#1677FF",cursor:"pointer"}} onClick={()=>setChecked(allOn?[]:all.slice())}>Select All /Unselect All</span>
      </div>
      <div style={{padding:"6px 0"}}>
        {buckets.map(b=>{
          const on = checked.includes(b.id);
          return (
            <div key={b.id} onClick={()=>toggle(b.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 16px",cursor:"pointer"}}>
              <span role="checkbox" aria-checked={on} style={{width:15,height:15,border:`1px solid ${on?"#1677FF":"#cbd5e1"}`,borderRadius:3,background:on?"#1677FF":"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#fff",font:"700 10px/1 Roboto",flexShrink:0}}>{on?"✓":""}</span>
              <span style={{font:"500 13px/18px Roboto",color:"#0f172a"}}>{b.label}</span>
              <span style={{marginLeft:"auto",font:"600 12px/16px Roboto",color:"#d97706"}}>{rcdPad((counts&&counts[b.id])||0)}</span>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:10,padding:"10px 16px 14px",borderTop:"1px solid #eef1f5"}}>
        <button type="button" onClick={onClose} style={{background:"transparent",border:"none",font:"400 13px/18px Roboto",color:"#64748b",cursor:"pointer"}}>Cancel</button>
        <button type="button" onClick={()=>onApply(checked.length===all.length?null:checked)} style={{background:"#1677FF",border:"none",borderRadius:4,padding:"7px 16px",font:"500 13px/18px Roboto",color:"#fff",cursor:"pointer"}}>Show Records</button>
      </div>
    </div>
  );
}

function RCDAutomationStatus({ scopedRows, atFilter, onFilter, naReasons, onNaReasons, intReasons, onIntReasons, ipBuckets, onIpBuckets, otherActive, review }) {
  const reviewAtIds = ["warning","intervention"];
  const [openMenu, setOpenMenu] = useRCD(null);
  const ref = useRCDR(null);
  useRCDE(()=>{ if(!openMenu) return; const h=(e)=>{ if(ref.current && !ref.current.contains(e.target)) setOpenMenu(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); },[openMenu]);
  const [menuLeft, setMenuLeft] = useRCD(0);
  const [menuRight, setMenuRight] = useRCD(0);
  const NAMenu = typeof window!=="undefined" && window.ARVNeedsAttentionMenu;
  const reasons = {};
  // Counted by record (one record can raise several items under one reason), so
  // the dropdown tally matches the rows the filter actually returns.
  // Ineligible records are their own bucket; everything else is a pending intervention.
  const inelReasons = {};
  scopedRows.filter(r=>r.at==="intervention").forEach(r=>{ const open = rcdInterventions(r).filter(it=>it.status!=="Completed"); const bag = open.some(it=>it.key==="ELIGIBILITY_CHECK") ? inelReasons : reasons; [...new Set(open.map(it=>it.reason))].forEach(rs=>{ bag[rs] = (bag[rs]||0)+1; }); });
  const pairs = (o)=>Object.keys(o).map(k=>[k,o[k]]).sort((a,b)=>b[1]-a[1]);
  const intGroups = [];
  if (pairs(reasons).length) intGroups.push({ id:"intActive", label:"Pending Interventions", note:"Open - awaiting action", reasons:pairs(reasons) });
  if (pairs(inelReasons).length) intGroups.push({ id:"intIneligible", label:"Ineligible Records", note:"Not eligible for pre-claim review", reasons:pairs(inelReasons) });
  // With nothing in scope the shared menu falls back to sample reasons — show an empty state instead.
  const naScoped = computeRcdNA(scopedRows);
  const naEmpty = !naScoped.termReasons.length && !naScoped.failReasons.length;
  const emptyMenu = (msg)=>(
    <div style={{width:280,background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,boxShadow:"0 8px 24px rgba(15,23,42,.14)",padding:"18px 16px",font:"400 13px/18px Roboto",color:"#64748b",textAlign:"center",whiteSpace:"normal"}}>{msg}</div>
  );
  return (
    <div ref={ref} className="ws-hscroll" style={{width:"100%",marginTop:12,overflowX:openMenu?"visible":"auto",overflowY:"visible"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",flexWrap:"nowrap",whiteSpace:"nowrap",font:"400 13px/16px Roboto",color:"#333",position:"relative",minWidth:"max-content",marginLeft:"auto"}}>
      <span style={{color:"#94a3b8",marginRight:12,whiteSpace:"nowrap",flexShrink:0}}>Automation (AT) Status :</span>
      {RCD_AT_ITEMS.map((s,i)=>{
        const active = atFilter===s.id || (s.id==="intervention" && String(atFilter||"").indexOf("intervention")===0);
        const dim = atFilter && !active;
        const irrelevant = review && !reviewAtIds.includes(s.id);
        // A reason-level subset (from this dropdown or from the Dashboard action
        // items) shows the filter pill with the narrowed count; a whole-bucket
        // pick keeps the plain total, same as Eligibility / Authorization.
        const naActive  = s.id==="warning" && naReasons && naReasons.length;
        const intActive = s.id==="intervention" && intReasons && intReasons.length;
        const count = naActive
          ? scopedRows.filter(r=>s.match(r) && naReasons.includes(r.naReason)).length
          : intActive
            ? scopedRows.filter(r=>s.match(r) && rcdInterventions(r).some(it=>it.status!=="Completed" && intReasons.includes(it.reason))).length
            : scopedRows.filter(s.match).length;
        return (
          <React.Fragment key={s.id}>
            {i>0 && <span style={{width:1,height:18,background:"#e2e8f0",margin:"0 8px",flexShrink:0}}></span>}
            <button type="button" onClick={()=>onFilter(active?null:s.id)} style={{background:"transparent",border:"none",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,padding:"2px 6px",borderRadius:4,whiteSpace:"nowrap",flexShrink:0,opacity:irrelevant?0.22:(dim?0.4:1),transition:"opacity .12s"}}>
              <RCDATIcon kind={s.kind} />
              <span style={{color:"#0f172a",font:"400 13px/16px Roboto",whiteSpace:"nowrap"}}>{s.label}</span>
              {(naActive||intActive)
                ? <span style={{display:"inline-flex",alignItems:"center",gap:7,background:"#FBF3DE",borderRadius:8,padding:"2px 10px"}}>
                    <img src={rcdIcon("filterIcon","icons/filter.svg")} alt="" style={{width:14,height:14,objectFit:"contain"}} />
                    <span style={{font:"600 13px/16px Roboto",color:"#5c5c5c"}}>{rcdPad(count)}</span>
                  </span>
                : <span style={{font:"600 13px/16px Roboto",color:s.num||"#0f172a"}}>{rcdPad(count)}</span>}
            </button>
            {s.caret && (
              <span title="Sub-status breakdown" onClick={(e)=>{ setMenuLeft(e.currentTarget.offsetLeft); setMenuRight(Math.max(0,(ref.current?ref.current.offsetWidth:0) - (e.currentTarget.offsetLeft + e.currentTarget.offsetWidth))); setOpenMenu(o=>o===s.id?null:s.id); }} style={{width:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#2563eb"}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 8 L19 8 L12 17 Z" fill="currentColor" /></svg>
              </span>
            )}
          </React.Fragment>
        );
      })}
      {openMenu==="warning" && NAMenu && naEmpty && (
        <div style={{position:"absolute",top:"100%",left:menuLeft,zIndex:60}}>{emptyMenu("No Needs Attention records for the current selection.")}</div>
      )}
      {openMenu==="warning" && NAMenu && !naEmpty && (
        <div style={{position:"absolute",top:"100%",left:menuLeft,zIndex:60}}>
          <NAMenu na={{...naScoped, manualReasons:[]}} selectedReasons={naReasons}
            noteOverrides={{ manual:"User Terminated", failed:"Technical/Business Exception" }}
            onApply={(sel)=>{ onNaReasons && onNaReasons(sel && sel.length ? sel : null); if(sel&&sel.length&&atFilter!=="warning") onFilter("warning"); setOpenMenu(null); }}
            onClose={()=>setOpenMenu(null)} />
        </div>
      )}
      {openMenu==="intervention" && NAMenu && !intGroups.length && (
        <div style={{position:"absolute",top:"100%",left:menuLeft,zIndex:60}}>{emptyMenu("No Needs Intervention records for the current selection.")}</div>
      )}
      {openMenu==="intervention" && NAMenu && intGroups.length>0 && (
        <div style={{position:"absolute",top:"100%",left:menuLeft,zIndex:60}}>
          <NAMenu groupDefs={intGroups} selectedReasons={intReasons}
            onApply={(sel)=>{ onIntReasons && onIntReasons(sel && sel.length ? sel : null); if(atFilter!=="intervention") onFilter("intervention"); setOpenMenu(null); }}
            onClose={()=>setOpenMenu(null)} />
        </div>
      )}
      {openMenu==="inprogress" && (
        <div style={{position:"absolute",top:"100%",right:menuRight,zIndex:60}}>
          <RCDBucketMenu buckets={RCD_IP_BUCKETS}
            counts={RCD_IP_BUCKETS.reduce((m,b)=>{ m[b.id]=scopedRows.filter(r=>r.at==="hourglass" && (r.ipGroup||"running")===b.id).length; return m; },{})}
            selected={ipBuckets}
            onApply={(sel)=>{ onIpBuckets && onIpBuckets(sel && sel.length ? sel : null); if(atFilter!=="inprogress") onFilter("inprogress"); setOpenMenu(null); }}
            onClose={()=>setOpenMenu(null)} />
        </div>
      )}
    </div>
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────
const RCD_COLS = [
  { key:"name",             label:"Patient Name",             grid:"190px", sortable:true  },
  { key:"mrn",              label:"MRN",                      grid:"140px", sortable:true  },
  { key:"bpStartDate",      label:"BP Start Date",            grid:"118px", sortable:true  },
  { key:"submissionType",   label:"Submission Type",          grid:"140px", sortable:true  },
  { key:"txnInitDate",      label:"PCR Init Date",            grid:"124px", sortable:true  },
  { key:"dcn",              label:"DCN",                      grid:"132px", sortable:true  },
  { key:"utn",              label:"UTN",                      grid:"124px", sortable:true  },
  { key:"status",           label:"Decision status",          grid:"202px", sortable:true  },
  { key:"ehrSync",          label:"EHR Sync",                 grid:"84px",  sortable:true,  align:"center" },
  { key:"docs",             label:"Docs",                     grid:"56px",  sortable:false, align:"center" },
  { key:"at",               label:"AT Status",                grid:"80px",  sortable:true,  align:"center" },
  { key:"reviewed",         label:"Reviewed?",                grid:"80px",  sortable:false, align:"center" },
];
const RCD_GRID = RCD_COLS.map(c=>c.grid).join(" ");
// Slack is shared across the scrollable middle columns instead of piling up
// behind Submission Type.
const RCD_FLEX_KEYS = ["name","mrn","bpStartDate","submissionType","txnInitDate","dcn","utn"];
const RCD_GRID_FLEX = RCD_COLS.map(c=> RCD_FLEX_KEYS.indexOf(c.key)>-1 ? `minmax(${c.grid},1fr)` : c.grid).join(" ");
const RCD_FROZEN = 5;
// Last six columns stay pinned to the right edge while the rest scroll under them.
// Patient Name + MRN stay pinned to the left edge; same opaque-fill trick as the right side.
const RCD_FROZEN_LEFT = 2;
const rcdFrozenLeft = (i, pad, isHeader) => {
  const bg = isHeader ? "#f8fafc" : "#fff";
  let l = 0;
  for (let k=0;k<i;k++) l += parseInt(RCD_COLS[k].grid,10) + 6;
  const fills = [
    i === 0 ? `-${pad + 8}px 0 0 0 ${bg}` : `-8px 0 0 0 ${bg}`,
    `8px 0 0 0 ${bg}`,
  ];
  if (i === RCD_FROZEN_LEFT - 1) fills.push("12px 0 9px -7px rgba(15,23,42,0.18)");
  return { position:"sticky", left:l, zIndex:isHeader?9:5, background:bg, boxShadow:fills.join(", ") };
};
const rcdFrozen = (i, pad, isHeader) => {
  if (i >= 0 && i < RCD_FROZEN_LEFT) return rcdFrozenLeft(i, pad, isHeader);
  if (i < RCD_COLS.length - RCD_FROZEN) return null;
  let r = pad;
  for (let k=i+1;k<RCD_COLS.length;k++) r += parseInt(RCD_COLS[k].grid,10) + 6;
  const bg = isHeader ? "#f8fafc" : "#fff";
  const isFirst = i === RCD_COLS.length - RCD_FROZEN;
  const isLast  = i === RCD_COLS.length - 1;
  // Opaque box-shadows fill the 6px grid gaps (and the row's right padding) so no
  // scrolling content shows between the pinned columns.
  const fills = [
    isLast ? `${pad + 8}px 0 0 0 ${bg}` : `8px 0 0 0 ${bg}`,
    `-8px 0 0 0 ${bg}`,
  ];
  if (isFirst) fills.push("-12px 0 9px -7px rgba(15,23,42,0.18)");
  return { position:"sticky", right:r, zIndex:isHeader?9:5, background:bg, boxShadow:fills.join(", ") };
};
const RCD_TABLE_W = RCD_COLS.reduce((a,c)=>a+parseInt(c.grid,10),0) + RCD_COLS.length*6 + 24;

function RCDTick() {
  return <svg width="16" height="16" viewBox="0 0 16 16" role="img" aria-label="Synced"><title>Synced with EHR</title><path d="M3.2 8.6 L6.3 11.7 L12.8 5.2" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function RCDCross() {
  return <svg width="16" height="16" viewBox="0 0 16 16" role="img" aria-label="Not synced"><title>Not synced with EHR</title><path d="M4 4 L12 12 M12 4 L4 12" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" /></svg>;
}
function RCDDocIcon() {
  return <img src={(window.__resources&&window.__resources.attachmentType)||"icons/attachment-type.svg"} width={18} height={18} alt="" style={{display:"block"}} aria-hidden="true" />;
}
function RCDContactGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" role="img" aria-label="Contact clinical auditor"><title>Contact clinical auditor</title>
      <path d="M6.4 3.4c.5-.3 1.1-.2 1.4.3l1.3 2c.3.5.2 1.1-.3 1.4l-1 .7c.6 1.5 1.8 2.7 3.3 3.4l.7-1c.3-.5 1-.6 1.4-.3l2 1.3c.5.3.6.9.3 1.4l-.9 1.4c-.4.6-1.1.8-1.8.6C9 13.8 6.1 10.9 5 7.2c-.2-.7 0-1.4.6-1.8l.8-2z" fill="#2563eb" />
    </svg>
  );
}
function RCDContactPopover({ pop, onClose }) {
  const [copied, setCopied] = useRCD(false);
  useRCDE(()=>{ const h=()=>onClose(); document.addEventListener("mousedown",h); document.addEventListener("scroll",h,true); return ()=>{ document.removeEventListener("mousedown",h); document.removeEventListener("scroll",h,true); }; },[onClose]);
  useRCDE(()=>{ setCopied(false); },[pop&&pop.auditor&&pop.auditor.phone]);
  if (!pop) return null;
  const copy = ()=>{ try { navigator.clipboard && navigator.clipboard.writeText(pop.auditor.phone); } catch(e){} setCopied(true); };
  return (
    <div onMouseDown={(e)=>e.stopPropagation()} style={{position:"fixed",top:pop.y,left:Math.max(12,pop.x-260),zIndex:130,width:250,background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,boxShadow:"0 10px 28px rgba(15,23,42,0.16)",padding:"14px 16px"}}>
      <div style={{font:"500 12px/16px Roboto",color:"#0f172a",marginBottom:10}}>Clinical Auditor</div>
      <div style={{font:"400 11px/14px Roboto",color:"#6A717D"}}>Clinical Auditor Name</div>
      <div style={{font:"500 13px/18px Roboto",color:"#1f2937",marginBottom:10}}>{pop.auditor.name}</div>
      <div style={{font:"400 11px/14px Roboto",color:"#6A717D"}}>Clinical Auditor Contact Number</div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
        <span style={{font:"500 13px/18px Roboto",color:"#1f2937"}}>{pop.auditor.phone}</span>
        <button type="button" title="Copy phone number" onClick={copy} style={{marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:5,background:"#f4f6f9",border:"1px solid #d8dee6",borderRadius:4,padding:"3px 8px",font:"500 11px/14px Roboto",color:copied?"#16a34a":"#2563eb",cursor:"pointer"}}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><rect x="5.2" y="5.2" width="8.3" height="8.3" rx="1.4" stroke="currentColor" strokeWidth="1.3"/><path d="M10.6 3.4V2.9c0-.8-.6-1.4-1.4-1.4H3.9c-.8 0-1.4.6-1.4 1.4v5.3c0 .8.6 1.4 1.4 1.4h.5" stroke="currentColor" strokeWidth="1.3"/></svg>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function RCDSortArrows({ active, dir }) {
  const up   = active && dir==="asc"  ? "#2563eb" : "rgba(0,0,0,0.25)";
  const down = active && dir==="desc" ? "#2563eb" : "rgba(0,0,0,0.25)";
  return (
    <svg width="10" height="15" viewBox="0 0 9 14" fill="none" style={{marginRight:3,flex:"none"}}>
      <path d="M7.74699 7.40234H1.25301C1.05823 7.40234 0.949473 7.608 1.0701 7.7484L4.31708 11.5135C4.41003 11.6213 4.58899 11.6213 4.68291 11.5135L7.9299 7.7484C8.05053 7.608 7.94177 7.40234 7.74699 7.40234Z" fill={down}/>
      <path d="M7.9299 6.24825L4.68291 2.48317C4.58997 2.3754 4.41101 2.3754 4.31708 2.48317L1.0701 6.24825C0.949473 6.38865 1.05823 6.59431 1.25301 6.59431H7.74699C7.94177 6.59431 8.05053 6.38865 7.9299 6.24825Z" fill={up}/>
    </svg>
  );
}

function RCDCheck({ on, onClick, accent="#2563eb", title, disabled }) {
  return (
    <span role="checkbox" aria-checked={!!on} title={disabled?"Not eligible for bulk selection":title} onClick={(e)=>{ e.stopPropagation(); if(disabled) return; onClick && onClick(); }}
      style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,flexShrink:0,border:`1px solid ${disabled?"#e2e8f0":(on?accent:"#d8d8d8")}`,borderRadius:3,background:disabled?"#f1f3f5":(on?accent:"#fff"),cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.6:1}}>
      {on && !disabled && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}
    </span>
  );
}

function RCDTableHeader({ sortKey, sortDir, onSort, bulkMode, allSelected, onToggleAll }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:RCD_GRID_FLEX,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",gap:6,position:"sticky",top:0,zIndex:6,boxShadow:"0 1px 0 #e2e8f0"}}>
      {RCD_COLS.map((c,ci)=>(
        <div key={c.key} onClick={c.sortable?()=>onSort(c.key):undefined}
          style={{font:"500 11px/14px Roboto",color:"#64748b",display:"flex",alignItems:"center",gap:8,justifyContent:c.align==="center"?"center":"flex-start",cursor:c.sortable?"pointer":"default",userSelect:"none",overflow:"hidden",whiteSpace:"nowrap",...(rcdFrozen(ci,12,true)||{})}}>
          {bulkMode && c.key==="name" && <RCDCheck on={allSelected} onClick={onToggleAll} title="Select all records" />}
          {c.sortable && <RCDSortArrows active={sortKey===c.key} dir={sortDir} />}
          {bulkMode && c.key==="reviewed" ? null : c.label}
        </div>
      ))}
    </div>
  );
}

// Child accordion — previous review submissions, derived from the parent row.
const RCD_CHILD_COLS = ["Episode Start Date","BP Start Date","Receipt Number","SOC Date","Discharge Date","Benefit Period Status","Billing Period Submitted","PCR Submission date","DCN Arrived date","UTN Arrived date","DL Arrived date"];
const RCD_CHILD_GRID = "150px 130px 140px 110px 124px 158px 178px 160px 148px 142px 132px";
function rcdChildRows(row) {
  const seed = parseInt(row.id.replace(/\D/g,""),10) || 1;
  // Max two billing periods: combined submissions carry both, individual ones just one.
  const count = row.bpSubmitted==="Combine" ? 2 : 1;
  const [mm,dd,yy] = row.episodeStartDate.split("/").map(n=>parseInt(n,10));
  const shift = (n) => { const d = new Date(2000+yy, mm-1, dd+n); return `${rcdPad(d.getMonth()+1)}/${rcdPad(d.getDate())}/${rcdPad(d.getFullYear()-2000)}`; };
  return Array.from({length:count},(_,i)=>({
    epi: row.episodeStartDate,
    bp:  row.bpStartDate || "—",
    receiptNo: row.receiptNo + "-" + (i+1),
    socDate: row.socDate,
    dischargeDate: row.dischargeDate,
    bpStatus: row.bpStatus,
    bpSubmitted: row.bpSubmitted,
    pcr: shift(-(i*14)),
    dcn: shift(-(i*14)+2),
    utn: row.utn==="—" && i===0 ? "—" : shift(-(i*14)+4),
    dl:  shift(-(i*14)+7),
  }));
}

function RCDChildSection({ row }) {
  const kids = rcdChildRows(row);
  return (
    <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderTop:"none",borderRadius:"0 0 6px 6px",padding:"14px 20px 16px 44px",marginBottom:8}}>
      <div style={{font:"500 12px/16px Roboto",color:"#0f172a",marginBottom:8}}>Previous Review Submissions — {row.name}</div>
      <div className="ws-hscroll" style={{border:"1px solid #e5e7eb",borderRadius:2,overflowX:"auto",background:"#fff"}}><div style={{minWidth:1572}}>
        <div style={{display:"grid",gridTemplateColumns:RCD_CHILD_GRID,background:"#f8fafc",borderBottom:"1px solid #e5e7eb"}}>
          {RCD_CHILD_COLS.map(c=>(
            <div key={c} style={{font:"500 11px/14px Roboto",letterSpacing:"0.04em",textTransform:"uppercase",color:"#64748b",padding:"10px 12px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c}</div>
          ))}
        </div>
        {kids.map((k,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:RCD_CHILD_GRID,borderBottom:i===kids.length-1?"none":"1px solid #eef2f7"}}>
            {[k.epi,k.bp,k.receiptNo,k.socDate,k.dischargeDate,k.bpStatus,k.bpSubmitted,k.pcr,k.dcn,k.utn,k.dl].map((v,j)=>(
              <div key={j} style={{font:"500 12px/16px Roboto",color:"#334155",padding:"11px 12px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v==="—" ? RCD_DASH : v}</div>
            ))}
          </div>
        ))}
      </div></div>
    </div>
  );
}

function RCDTableRow({ row, expanded, onToggle, reviewed, onReviewed, onIntervention, onInProgress, onContact, onPatient, accent="#2563eb", bulkMode, selected, onSelect, reviewModeOn }) {
  const cell = (align, ci) => ({font:"500 12px/16px Roboto",color:"#333333",display:"flex",alignItems:"center",gap:bulkMode&&ci===0?16:8,justifyContent:align==="center"?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,...(rcdFrozen(ci==null?-1:ci,11)||{})});
  return (
    <div style={{position:"relative",display:"grid",gridTemplateColumns:RCD_GRID_FLEX,alignItems:"center",height:48,padding:"0 11px",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:8,boxShadow:"0 1px 2px rgba(15,23,42,0.03)",background:"#fff",gap:6}}>
      <div style={cell(null,0)}>
        {bulkMode && <RCDCheck on={selected} accent={accent} onClick={()=>onSelect && onSelect(row.id)} title="Select record" disabled={!reviewModeOn && row.at!=="intervention" && row.at!=="hourglass"} />}
        <a href="#" title={row.name} onClick={(e)=>{e.preventDefault(); e.stopPropagation(); onPatient && onPatient(row);}} style={{color:accent,font:"500 13px/16px Roboto",textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.name}</a>
      </div>
      <div style={cell(null,1)}>{row.mrn}</div>
      <div style={cell()}>{row.bpStartDate}</div>
      <div style={cell()} title={row.submissionType}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{row.submissionType}</span></div>
      <div style={cell()}>{row.txnInitDate}</div>
      <div style={cell()}>{row.dcn==="—" ? RCD_DASH : row.dcn}</div>
      <div style={cell()}>{row.utn==="—" ? RCD_DASH : row.utn}</div>
      <div style={cell(null,7)}><RCDPill status={row.status} /></div>
      <div style={cell("center",8)}>{row.ehrSync==null ? RCD_DASH : row.ehrSync ? <RCDTick /> : <RCDCross />}</div>
      <div style={{...cell("center",9),cursor:"pointer"}} title="Documents" onClick={(e)=>{ e.stopPropagation(); window.__openDocs && window.__openDocs({...row, __pcr:true}, false); }}><RCDDocIcon /></div>
      <div style={cell("center",10)}>
        <RCDATCell row={row} onIntervention={onIntervention} onInProgress={onInProgress} />
      </div>
      <div style={cell("center",11)} onClick={(e)=>e.stopPropagation()}>
        {bulkMode ? null : (
        <span role="checkbox" aria-checked={!!reviewed} tabIndex={0} onClick={()=>onReviewed(row.id)}
          style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:`1px solid ${reviewed?accent:"#d8d8d8"}`,borderRadius:3,background:reviewed?accent:"#fff",cursor:"pointer"}}>
          {reviewed && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}
        </span>
        )}
      </div>
    </div>
  );
}

// ── Needs-Intervention slideout ───────────────────────────────
// Derived deterministically from the row so the panel always agrees with the grid.
function rcdInterventions(row) {
  const n = parseInt(row.id.replace(/\D/g,""),10) || 1;
  if (row.ineligible) {
    return [{
      id: row.id + "-i0",
      txnId: "TXN" + String(90000 + n*137).slice(0,5) + "-" + String(n).padStart(4,"0"),
      key:RCD_PRESUB_NI[row.niIdx||0].key, value:row.medicareid,
      reason:RCD_PRESUB_NI[row.niIdx||0].reason,
      stage:"PCR data extraction from HCHB",
      status: "Open",
      created: rcdLongDate(row.episodeStartDate, "09:12 AM"),
      completed: "—",
      notes: "Automation stopped this record before PCR submission, so it stays in Pre-Submission. Correct the data in HCHB and confirm to continue with submission.",
      by: "—",
    }];
  }
  const defs = [
    { key:"HIC_NUMBER",      value:row.medicareid,    reason:"Medicare ID returned no match at the MAC portal",            stage:"Eligibility Verification" },
    { key:"PTAN",            value:row.ptan,          reason:"PTAN not associated with the submitting provider",           stage:"Submission" },
    { key:"BENEFIT_PERIOD",  value:row.benefitPeriod, reason:"Benefit period could not be resolved from the episode dates", stage:"PCR Assembly" },
    { key:"DOC_PACKET",      value:"3 of 5 attached", reason:"Required documentation packet incomplete at submission time", stage:"Document Upload" },
    { key:"F2F_ENCOUNTER",   value:row.dcn,           reason:"Face-to-face encounter date outside the allowable window",    stage:"Clinical Review" },
    { key:"PHYSICIAN_NPI",   value:row.ptan,          reason:"Physician NPI missing on the episode",                        stage:"Eligibility Verification" },
    { key:"PORTAL_SESSION",  value:row.receiptNo,     reason:"MAC portal session dropped before acknowledgement",           stage:"Submission" },
    { key:"UTN_MISMATCH",    value:row.utn,           reason:"UTN returned by the portal does not match the DCN",           stage:"Decision Letter" },
  ];
  // Only reasons that belong to the record's current stage.
  const allowed = RCD_INT_KEYS_BY_STAGE[RCD_PCR_STAGE_LIST.indexOf(row.stage)] || [];
  const staged = defs.filter(d=>allowed.includes(d.key));
  const pool = staged.length ? staged : defs;
  const count = Math.min(pool.length, 1 + (n % 3));
  const items = pool.slice(0, count).map((d,i)=>{
    const k = n + i;
    const done = k % 3 === 0;
    return {
      id: row.id + "-i" + i,
      txnId: "TXN" + String(90000 + k*137).slice(0,5) + "-" + String(k).padStart(4,"0"),
      key:d.key, value:d.value, reason:d.reason, stage:d.stage,
      status: done ? "Completed" : (k % 3 === 1 ? "Open" : "In Progress"),
      created: rcdLongDate(row.episodeStartDate, "10:35 AM"),
      completed: done ? rcdLongDate(row.bpStartDate, "02:18 PM") : "—",
      notes: done ? "Resolved on automated retry — no manual action required." : "",
      by: done ? row.clinician : "—",
    };
  });
  // One pending intervention per record: keep the first open/in-progress item,
  // drop any further pending ones; resolved history stays.
  let pendingSeen = false;
  const one = items.filter(it=>{ if (it.status==="Completed") return true; if (pendingSeen) return false; pendingSeen = true; return true; });
  if (!pendingSeen && one.length) one[0] = {...one[0], status:"Open", completed:"—", notes:"", by:"—"};
  return one;
}

const RCD_INT_COLS = [
  { k:"key",     label:"Key",          w:"minmax(210px,1.1fr)", bold:true },
  { k:"value",   label:"Value",        w:"minmax(110px,0.8fr)" },
  { k:"reason",  label:"Reason",       w:"minmax(240px,1.6fr)", tone:"#b45309" },
  { k:"stage",   label:"Stage",        w:"minmax(170px,1.1fr)" },
  { k:"created", label:"Date Created", w:"minmax(180px,1.1fr)" },
];
const RCD_DONE_COLS = RCD_INT_COLS.concat([
  { k:"by",        label:"Completed By",   w:"minmax(150px,1fr)" },
  { k:"completed", label:"Date Completed", w:"minmax(180px,1.1fr)" },
  { k:"notes",     label:"Notes",          w:"minmax(200px,1.3fr)" },
]);

function RCDIntSortIcon({ active }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,borderRadius:"50%",background:active?"#1677FF":"#f1f5f9",border:active?"none":"1px solid #dbe2ea",flexShrink:0}}>
      <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><path d="M4 1.4 L6.4 4.4 H1.6 Z" fill={active?"#fff":"#94a3b8"} /></svg>
    </span>
  );
}

function RCDIntTable({ items, cols, onComplete, empty, completeDisabled }) {
  const [noteFor, setNoteFor] = useRCD(null);
  const [note, setNote]       = useRCD("");
  const [followUp, setFollowUp] = useRCD("");
  const template = cols.map(c=>c.w).join(" ") + (onComplete ? " 190px" : "");
  const rows = items;
  const cellBase = {padding:"12px 16px",display:"flex",alignItems:"center",minWidth:0};
  const lastCellBase = {padding:"12px 16px",display:"flex",alignItems:"center",minWidth:0};
  const nCols = cols.length + (onComplete?1:0);
  return (
    <div style={{border:"1px solid rgb(233,233,233)",borderRadius:5,overflow:"hidden",background:"#fff"}}>
      <div style={{display:"grid",gridTemplateColumns:template,background:"#fafafa",borderBottom:"1px solid rgb(233,233,233)"}}>
        {cols.map((c,i)=>(
          <div key={c.k} style={{...(i===nCols-1?lastCellBase:cellBase),gap:8,font:"500 13px/18px Roboto",color:"#5b6472",borderRight:i===nCols-1?"none":"1px solid rgb(233,233,233)"}}>
            {c.label}
          </div>
        ))}
        {onComplete && <div style={lastCellBase}><span style={{font:"500 13px/18px Roboto",color:"#5b6472"}}>Action</span></div>}
      </div>
      {rows.length===0 && <div style={{padding:"22px 16px",font:"400 13px/18px Roboto",color:"#94a3b8"}}>{empty}</div>}
      {rows.map((it,ri)=>(
        <React.Fragment key={it.id}>
          <div style={{display:"grid",gridTemplateColumns:template,borderBottom:ri===rows.length-1&&!(onComplete&&!it._done&&noteFor===it.id)?"none":"1px solid rgb(233,233,233)"}}>
            {cols.map((c,i)=>(
              <div key={c.k} style={{...(i===nCols-1?lastCellBase:cellBase),font:`${c.bold?"600":"400"} 14px/20px Roboto`,color:c.tone||(c.bold?"#111827":"#3a424a"),textWrap:"pretty",overflowWrap:"anywhere"}}>
                {it[c.k] && it[c.k]!=="—" ? it[c.k] : <span style={{color:"#94a3b8"}}>-</span>}
              </div>
            ))}
            {onComplete && (
              <div style={lastCellBase}>
                {it._done
                  ? <span style={{display:"inline-flex",alignItems:"center",gap:6,font:"500 12px/16px Roboto",color:"#16a34a",whiteSpace:"nowrap"}}>
                      <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="none" stroke="#16a34a" strokeWidth="1.4"/><path d="M4.7 8.2 L6.9 10.4 L11.2 5.8" fill="none" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Completed
                    </span>
                  : noteFor===it.id
                  ? <button type="button" disabled style={{border:"1px solid #d8dee6",background:"#f1f3f5",color:"#94a3b8",font:"500 12px/16px Roboto",padding:"6px 12px",borderRadius:4,cursor:"not-allowed",whiteSpace:"nowrap"}}>Mark as complete</button>
                  : completeDisabled
                  ? <button type="button" disabled title="Ineligible records cannot be marked complete" style={{border:"1px solid #d8dee6",background:"#f1f3f5",color:"#94a3b8",font:"500 12px/16px Roboto",padding:"6px 14px",borderRadius:4,cursor:"not-allowed",whiteSpace:"nowrap"}}>Mark as complete</button>
                  : <button type="button" onClick={()=>{ setNoteFor(it.id); setNote(""); }} style={{border:"1px solid #1677FF",background:"#fff",color:"#1677FF",font:"500 12px/16px Roboto",padding:"6px 14px",borderRadius:4,cursor:"pointer",whiteSpace:"nowrap"}}>Mark as complete</button>}
              </div>
            )}
          </div>
          {onComplete && !it._done && noteFor===it.id && (
            <div style={{borderBottom:"1px solid #eef2f7",background:"#eef4fb",padding:"16px"}}>
              <div style={{font:"500 12px/16px Roboto",color:"#1f2937",marginBottom:6}}>Optional Notes</div>
              <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder="Notes goes here"
                style={{width:"100%",boxSizing:"border-box",resize:"vertical",border:"1px solid #d8dee6",borderRadius:4,padding:"8px 10px",font:"400 12px/17px Roboto",color:"#1f2937",outline:"none",background:"#fff"}}></textarea>
              <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:16}}>
                <button type="button" onClick={()=>{ setNoteFor(null); setNote(""); }} style={{border:"1px solid #d8dee6",background:"#fff",color:"#475569",font:"500 12px/16px Roboto",padding:"7px 14px",borderRadius:4,cursor:"pointer"}}>Cancel</button>
                <button type="button" onClick={()=>{ onComplete(it, note.trim()); setNoteFor(null); setNote(""); }} style={{border:"none",background:"#1677FF",color:"#fff",font:"500 12px/16px Roboto",padding:"7px 16px",borderRadius:4,cursor:"pointer"}}>Mark as Complete</button>
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function RCDInterventionDrawer({ row, onClose, onTerminate, onResolved }) {
  useRCDE(()=>{ const h=(e)=>{ if(e.key==="Escape") onClose(); }; document.addEventListener("keydown",h); return ()=>document.removeEventListener("keydown",h); },[onClose]);
  const [done, setDone] = useRCD({});
  const [showTerm, setShowTerm] = useRCD(false);
  const terminated = !!row && row.naGroup === "manual";
  const all = row ? rcdInterventions(row) : [];
  if (!row) return null;
  const isDone = (it)=> !!done[it.id] || it.status === "Completed";
  const open = all.filter(it=>!isDone(it));
  // One table: every intervention, pending and completed, in a single list.
  const items = all.map(it=> isDone(it)
    ? (done[it.id]
        ? {...it, _done:true, status:"Completed", completed:done[it.id].at, by:done[it.id].by, notes:done[it.id].notes}
        : {...it, _done:true, notes:it.notes||""})
    : it);
  // Queue fully worked off → the record moves to In Progress in the main grid.
  useRCDE(()=>{ if (row && all.length && open.length===0) onResolved && onResolved(row); },[row && row.id, open.length]);
  const markDone = (it, notes)=>{
    const d = new Date();
    const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
    const at = `${d.getDate()} ${mon} ${d.getFullYear()} ${rcdPad(((d.getHours()+11)%12)+1)}:${rcdPad(d.getMinutes())} ${d.getHours()<12?"AM":"PM"}`;
    setDone(m=>({...m,[it.id]:{ at, by:row.clinician, notes }}));
  };
  // Terminate takes over the slot: the Needs Intervention slider closes while it is
  // open and comes back when the terminate slider is dismissed.
  if (showTerm) return (
    <RCDInProgressDrawer row={row} title="Terminate" onClose={()=>setShowTerm(false)}
      onTerminate={(r,n)=>{ onTerminate && onTerminate(r,n); onClose(); }} />
  );
  return (
    <React.Fragment>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.18)"}}></div>
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:1180,maxWidth:"94vw",background:"#fff",zIndex:901,display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.13)",animation:"rcdIntSlide .22s cubic-bezier(0.32,0.72,0,1)"}}>
        <style>{`@keyframes rcdIntSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"22px 24px 16px"}}>
          <span style={{font:"600 18px/24px Roboto",color:"#0f172a"}}>Needs Intervention</span>
          <span style={{display:"flex",alignItems:"center",gap:14}}>
            {terminated
              ? <span title="This record has been manually terminated" style={{display:"inline-flex",alignItems:"center",gap:7,border:"1px solid #dc2626",background:"#fef2f2",color:"#b91c1c",font:"500 13px/18px Roboto",padding:"7px 14px",borderRadius:4}}>
                  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" style={{color:"#dc2626"}}><circle cx="8" cy="5" r="2.6" fill="currentColor" /><path d="M2.6 13.4c0-2.6 2.4-4.2 5.4-4.2s5.4 1.6 5.4 4.2z" fill="currentColor" /></svg>
                  Manually Terminated
                </span>
              : <button type="button" onClick={()=>setShowTerm(true)}
                  style={{border:"1px solid #dc2626",background:"#fff",color:"#dc2626",font:"500 13px/18px Roboto",padding:"7px 16px",borderRadius:4,cursor:"pointer"}}>Terminate</button>}
            <button onClick={onClose} style={{border:"none",background:"transparent",cursor:"pointer",padding:4,color:"#64748b",font:"400 18px/18px Roboto"}}>✕</button>
          </span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"0 16px",padding:"0 24px 16px",borderBottom:"1px solid #e5e7eb"}}>
          {[["Patient Name",row.name],["Submission Type",row.submissionType],["DCN",row.dcn],["Decision status",row.status]].map(([l,v])=>(
            <div key={l}>
              <div style={{font:"400 11px/14px Roboto",color:"#94a3b8",marginBottom:2}}>{l}</div>
              <div style={{font:"500 13px/18px Roboto",color:"#0f172a"}}>{v}</div>
            </div>
          ))}
        </div>
        <div className="ws-scrollbody" style={{flex:1,overflow:"auto",padding:"18px 24px 28px"}}>
          {terminated && (
            <div style={{border:"1px solid #fecaca",background:"#fef2f2",borderRadius:6,padding:"12px 16px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8,font:"500 13px/18px Roboto",color:"#b91c1c"}}>
                <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="none" stroke="#dc2626" strokeWidth="1.5"/><path d="M5.2 5.2 L10.8 10.8 M10.8 5.2 L5.2 10.8" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span>This record is being terminated by {row.termBy || row.clinician || "user"}{row.termAt ? " on " + row.termAt : ""}.</span>
              </div>
              {row.manualNote && (
                <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid #fecaca",font:"400 12px/17px Roboto",color:"#7f1d1d"}}>
                  <span style={{font:"500 12px/17px Roboto",color:"#b91c1c"}}>Notes : </span>{row.manualNote}
                </div>
              )}
            </div>
          )}
          <RCDIntTable items={items} cols={RCD_DONE_COLS} onComplete={markDone} empty="No interventions for this patient." />
        </div>
      </div>
    </React.Fragment>
  );
}

// ── In-Progress terminate confirmation \u2014 center modal (matches PCR info tab's Terminate PCR) ──
function RCDInProgressDrawer({ row, onClose, onTerminate, title }) {
  useRCDE(()=>{ const h=(e)=>{ if(e.key==="Escape") onClose(); }; document.addEventListener("keydown",h); return ()=>document.removeEventListener("keydown",h); },[onClose]);
  const [note, setNote] = useRCD("");
  if (!row) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",zIndex:950,display:"flex",alignItems:"center",justifyContent:"center"}} onMouseDown={(e)=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{width:600,background:"#fff",borderRadius:10,boxShadow:"0 12px 36px rgba(15,23,42,0.28)",overflow:"hidden"}}>
        <div style={{padding:"20px 26px",borderBottom:"1px solid #e2e8f0",font:"600 17px/22px Roboto",color:"#1e293b"}}>Terminate PCR</div>
        <div style={{padding:"22px 26px"}}>
          <div style={{display:"flex",gap:32,marginBottom:18,flexWrap:"nowrap"}}>
            <div style={{whiteSpace:"nowrap"}}><div style={{font:"400 12px/16px Roboto",color:"#94a3b8",marginBottom:2}}>Benefit Period Start Date :</div><div style={{font:"600 14px/18px Roboto",color:"#1e293b"}}>{row.bpStartDate || "-"}</div></div>
            <div style={{whiteSpace:"nowrap"}}><div style={{font:"400 12px/16px Roboto",color:"#94a3b8",marginBottom:2}}>PCR Init Date :</div><div style={{font:"600 14px/18px Roboto",color:"#1e293b"}}>{row.txnInitDate || "-"}</div></div>
            <div style={{whiteSpace:"nowrap"}}><div style={{font:"400 12px/16px Roboto",color:"#94a3b8",marginBottom:2}}>Status :</div>{(typeof window!=="undefined" && window.RCDPill) ? <window.RCDPill status={row.status} /> : <div style={{font:"600 14px/18px Roboto",color:"#1e293b"}}>{row.status || "-"}</div>}</div>
          </div>
          <div style={{font:"500 13px/18px Roboto",color:"#1e293b",marginBottom:14}}>Are you sure you want to terminate this PCR?</div>
          <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,padding:"10px 14px",font:"500 12px/17px Roboto",color:"#b91c1c",marginBottom:16}}>If this PCR is part of a combined billing period submission, terminating it will also terminate that entire submission.</div>
          <div style={{font:"500 12px/16px Roboto",color:"#1f2937",marginBottom:6}}>Optional Notes</div>
          <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder="Notes goes here"
            style={{width:"100%",boxSizing:"border-box",resize:"vertical",border:"1px solid #d8dee6",borderRadius:4,padding:"8px 10px",font:"400 12px/17px Roboto",color:"#1f2937",outline:"none"}}></textarea>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:8,padding:"16px 26px",borderTop:"1px solid #e2e8f0"}}>
          <button type="button" onClick={onClose} style={{border:"1px solid #d8dee6",background:"#fff",color:"#475569",font:"500 13px/18px Roboto",padding:"8px 16px",borderRadius:4,cursor:"pointer"}}>Cancel</button>
          <button type="button" onClick={()=>{ onTerminate(row, note.trim()); onClose(); }} style={{border:"none",background:"#dc2626",color:"#fff",font:"500 13px/18px Roboto",padding:"8px 18px",borderRadius:4,cursor:"pointer"}}>Terminate</button>
        </div>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────
function RCDPagination({ total, page, perPage, onPage, onPerPage }) {
  return null;
  const pages = Math.max(1, Math.ceil(total/perPage));
  const start = total===0 ? 0 : (page-1)*perPage+1;
  const end = Math.min(page*perPage, total);
  const Btn = ({children,active,disabled,onClick}) => (
    <button type="button" onClick={onClick} disabled={disabled} style={{width:28,height:28,borderRadius:4,border:`1px solid ${active?"#2563eb":"#e2e8f0"}`,background:active?"#2563eb":"#fff",color:active?"#fff":disabled?"#cbd5e1":"#333333",font:"400 12px/16px Roboto",cursor:disabled?"default":"pointer",padding:0}}>{children}</button>
  );
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #e2e8f0",padding:"12px 24px"}}>
      <div style={{display:"flex",alignItems:"center",gap:16}}>
        <span style={{font:"400 12px/16px Roboto",color:"#94a3b8"}}>Showing {start}–{end} of {total}</span>
        <label style={{display:"inline-flex",alignItems:"center",gap:6,font:"400 12px/16px Roboto",color:"#94a3b8"}}>
          Rows
          <select value={perPage} onChange={(e)=>onPerPage(parseInt(e.target.value,10))} style={{border:"1px solid #e2e8f0",borderRadius:4,padding:"3px 6px",font:"400 12px/16px Roboto",color:"#333333",background:"#fff",outline:"none"}}>
            {[10,15,25,50].map(n=><option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
      <div style={{display:"flex",gap:6}}>
        <Btn onClick={()=>onPage(page-1)} disabled={page===1}>‹</Btn>
        {Array.from({length:Math.min(pages,5)},(_,i)=>i+1).map(n=><Btn key={n} active={n===page} onClick={()=>onPage(n)}>{n}</Btn>)}
        <Btn onClick={()=>onPage(page+1)} disabled={page>=pages}>›</Btn>
      </div>
    </div>
  );
}

// ── RCD Request View (main) ───────────────────────────────────
function RCDRequestView({ review, reviewUnreviewedOnly, onExitReview, focusId, naGroupFocus, bulkMode, bulkKind, onBulkApi, onPatient, onExitBulk }) {
  const [selectedIds, setSelectedIds] = useRCD({});
  const [statusFilter, setStatusFilter] = useRCD(null);
  const [pendingSubs, setPendingSubs]   = useRCD(null);
  const [atFilter, setAtFilter]         = useRCD(null);
  const [naReasons, setNaReasons]       = useRCD(null);
  // Exact record ids behind a Dashboard action-item badge.
  const [scopeIds, setScopeIds]         = useRCD(null);
  const [intReasons, setIntReasons]     = useRCD(null);
  const [ipBuckets, setIpBuckets]       = useRCD(null);
  const [modeFilter, setModeFilter]     = useRCD("all");
  const [stageFilter, setStageFilter]   = useRCD("all");
  const [searchQ, setSearchQ]           = useRCD("");
  const [sortKey, setSortKey]           = useRCD(null);
  const [sortDir, setSortDir]           = useRCD("asc");
  const [fieldFilters, setFieldFilters] = useRCD([]);
  const [reviewedSet, setReviewedSet]   = useRCD(()=> (typeof window!=="undefined" && window.__rcdReviewed) || {});
  const [expandedIds, setExpandedIds]   = useRCD({});
  const [page, setPage]                 = useRCD(1);
  const [perPage, setPerPage]           = useRCD(10);
  const [dateRange, setDateRange]       = useRCD(()=> window.defaultDateRange([...new Set(RCD_ROWS.map(r=>r.txnInitDate))], 90));
  const [bodyH, setBodyH]               = useRCD(()=> Math.max(280, window.innerHeight - 430));
  const [interventionRow, setInterventionRow] = useRCD(null);
  const [inProgressRow, setInProgressRow] = useRCD(null);
  // Records the user manually terminated in this session — they leave In Progress
  // and show up under Needs Attention › Manually Terminated with the note as reason.
  // Shared store so terminations from the patient detail page survive the grid unmounting.
  if (typeof window!=="undefined" && !window.__rcdManualTerm) window.__rcdManualTerm = {};
  const [manualTerm, setManualTerm] = useRCD(()=>({...((typeof window!=="undefined"&&window.__rcdManualTerm)||{})}));
  // Intervention records whose whole queue was worked off in the slider.
  const [intResolved, setIntResolved] = useRCD({});
  const terminateRow = (row, note) => {
    const info = { reason: note || "Manually terminated by user", note, by:row.clinician, at:rcdNowStamp() };
    rcdStartManualTerm(row, info);
    setManualTerm({...(window.__rcdManualTerm||{})});
  };
  useRCDE(()=>{ window.__rcdTerminateRow = terminateRow; const sync=()=>setManualTerm({...(window.__rcdManualTerm||{})}); window.addEventListener("rcd-terminated", sync); return ()=>window.removeEventListener("rcd-terminated", sync); },[]);
  const allRows = RCD_ROWS.map(r => rcdIsTerminating(manualTerm[r.id])
    ? {...r, at:"hourglass", ipGroup:"terminating", naGroup:undefined, manualNote:manualTerm[r.id].note, termBy:manualTerm[r.id].by, termAt:manualTerm[r.id].at}
    : manualTerm[r.id]
    ? {...r, at:"warning", naGroup:"manual", naReason:manualTerm[r.id].reason, manualNote:manualTerm[r.id].note, termBy:manualTerm[r.id].by, termAt:manualTerm[r.id].at}
    : intResolved[r.id] ? {...r, at:"hourglass"} : r);
  const [contactPop, setContactPop] = useRCD(null);

  useRCDE(()=>{ const h=()=>setBodyH(Math.max(280, window.innerHeight - 430)); window.addEventListener("resize",h); return ()=>window.removeEventListener("resize",h); },[]);
  useRCDE(()=>{
    if (!focusId) return;
    setExpandedIds(m=>({...m,[focusId]:true}));
    setDateRange(null); setStatusFilter(null); setAtFilter(null); setNaReasons(null); setIntReasons(null);
    setScopeIds(null); setIpBuckets(null); setSearchQ(""); setFieldFilters([]);
    const idx = RCD_ROWS.findIndex(r=>r.id===focusId);
    if (idx>=0) setPage(Math.floor(idx/perPage)+1);
  },[focusId]);
  // Arriving from the dashboard's "PCR - Manually Terminated" row: filter to
  // Needs Attention with only the Manually Terminated reasons selected.
  // Arriving from a Dashboard PCR action item. A bucket-level pick lands on the
  // bucket alone; a reason-level pick also narrows the reasons, which is what
  // puts the filter pill on Needs Attention / Needs Intervention.
  useRCDE(()=>{
    if (!naGroupFocus) return;
    const nav = typeof naGroupFocus === "string" ? { type:"rcdManualAll" } : naGroupFocus;
    // Dashboard counts span its own date window, so arriving from an action item
    // clears the grid's date filter — the row count then matches the badge.
    setStatusFilter(null); setIpBuckets(null); setDateRange(null); setPage(1);
    setScopeIds(Array.isArray(nav.ids) ? nav.ids : null);
    if (nav.type==="rcdAll") { setAtFilter(null); setNaReasons(null); setIntReasons(null); setStatusFilter(null); }
    else if (nav.type==="rcdStatus") { setAtFilter(null); setNaReasons(null); setIntReasons(null); setStatusFilter(nav.status); }
    else if (nav.type==="rcdManualAll") { setAtFilter("manualterm"); setNaReasons(null); setIntReasons(null); }
    else if (nav.type==="rcdNaGroup") {
      const key = nav.group==="failed" ? "failReasons" : nav.group==="manual" ? "manualReasons" : "termReasons";
      const reasons = nav.reasons || (computeRcdNA(allRows)[key]||[]).map(x=>x[0]);
      setAtFilter(nav.group==="manual" ? "manualterm" : "warning"); setNaReasons(reasons.length?reasons:null); setIntReasons(null);
    }
    else if (nav.type==="rcdNaReason") { setAtFilter(nav.group==="manual" ? "manualterm" : "warning"); setNaReasons([nav.reason]); setIntReasons(null); }
    else if (nav.type==="rcdIntervention") { setAtFilter("intervention"); setNaReasons(null); setIntReasons(nav.label?[nav.label]:null); }
  },[naGroupFocus]);

  const toggleExpand   = (id) => setExpandedIds(m=>({...m,[id]:!m[id]}));
  // Reviewed marks are shared with the Dashboard action items, which only count
  // alerts that are still unreviewed.
  useRCDE(()=>{ if (typeof window!=="undefined") window.__rcdReviewed = reviewedSet; },[reviewedSet]);
  const toggleReviewed = (id) => setReviewedSet(m=>({...m,[id]:!m[id]}));
  const onSort = (k) => { if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };

  const filterSig = JSON.stringify([scopeIds,statusFilter,pendingSubs,atFilter,naReasons,intReasons,ipBuckets,modeFilter,stageFilter,searchQ,fieldFilters,dateRange,review,perPage,manualTerm,intResolved]);
  useRCDE(()=>{ setPage(1); }, [filterSig]);

  // Compose: mode ∧ field filters ∧ search ∧ date.
  let base = allRows;
  if (scopeIds) { const s = new Set(scopeIds); base = base.filter(r=>s.has(r.id)); }
  if (modeFilter==="automated") base = base.filter(r=>r.at && r.at!=="none");
  if (modeFilter==="manual")    base = base.filter(r=>!r.at || r.at==="none");
  if (stageFilter && stageFilter!=="all") base = base.filter(r=>r.stage===stageFilter);
  base = base.filter(r => fieldFilters.every(f => f.values.includes(r[f.field])));
  if (searchQ.trim()) { const q = searchQ.toLowerCase(); base = base.filter(r=>[r.name,r.assessmentType,r.status].join(" ").toLowerCase().includes(q)); }
  if (dateRange) base = base.filter(r=>window.dateInRange(r.txnInitDate, dateRange));
  const needsReview = (r) => r.at==="warning" || r.at==="intervention" || r.status==="Non-Affirmed" || r.status==="Partially-Affirmed";
  if (review) base = base.filter(r => (reviewUnreviewedOnly ? true : needsReview(r)) && !reviewedSet[r.id]);

  // Counts recompute from the composed subset ∧ the *other* status dimension.
  const atMatch = atFilter ? (RCD_AT_LOOKUP.find(s=>s.id===atFilter)||{}).match : null;
  const scopedForStatus = atMatch ? base.filter(atMatch) : base;
  const statusMatchBase = statusFilter ? (RCD_STATUS.find(s=>s.id===statusFilter)||{}).match : null;
  const statusMatch = (statusFilter==="decision_pending" && pendingSubs && pendingSubs.length)
    ? ((r)=>pendingSubs.some(id=>{ const b=RCD_PENDING_SUBS.find(x=>x.id===id); return b && b.match(r); }))
    : statusMatchBase;
  const scopedForAt = statusMatch ? base.filter(statusMatch) : base;

  let rows = base;
  if (statusMatch) rows = rows.filter(statusMatch);
  if (atMatch)     rows = rows.filter(atMatch);
  if (naReasons && naReasons.length) rows = rows.filter(r=>r.at==="warning" && naReasons.includes(r.naReason));
  if (intReasons && intReasons.length) rows = rows.filter(r=>r.at==="intervention" && rcdInterventions(r).some(it=>intReasons.includes(it.reason)));
  if (ipBuckets && ipBuckets.length) rows = rows.filter(r=>r.at==="hourglass" && ipBuckets.includes(r.ipGroup||"running"));
  if (sortKey) {
    rows = [...rows].sort((a,b)=>{
      const av = (a[sortKey]==null?"":a[sortKey]).toString().toLowerCase();
      const bv = (b[sortKey]==null?"":b[sortKey]).toString().toLowerCase();
      if (av<bv) return sortDir==="asc"?-1:1;
      if (av>bv) return sortDir==="asc"?1:-1;
      return 0;
    });
  }
  const total = rows.length;
  const pageRows = rows;

  // Bulk Review can select any visible row; Bulk Terminate only rows the
  // automation is still working (Needs Intervention / In Progress).
  const bulkReviewMode = bulkKind ? bulkKind==="review" : review;
  const bulkSelectable = (rs) => bulkReviewMode ? rs : rs.filter(r=>r.at==="intervention"||r.at==="hourglass");
  const selCount = Object.keys(selectedIds).filter(k=>selectedIds[k]).length;
  const [bulkTermConfirm, setBulkTermConfirm] = useRCD(false);
  const [bulkReviewConfirm, setBulkReviewConfirm] = useRCD(false);
  useRCDE(()=>{
    if (!onBulkApi) return;
    onBulkApi(bulkMode ? {
      count: selCount,
      terminate: () => setBulkTermConfirm(true),
      markReviewed: () => setBulkReviewConfirm(true),
    } : null);
  },[bulkMode, selCount]);
  // Switching between Bulk Terminate and Bulk Review starts from a clean selection.
  useRCDE(()=>{ setSelectedIds({}); },[bulkKind, bulkMode]);

  const chips = [];
  // Dashboard scoping stays active but isn't shown as a chip (Clear All still resets it).
  if (statusFilter) { const s = RCD_STATUS.find(x=>x.id===statusFilter); chips.push({ id:"status", label:`Status: ${s?s.label:statusFilter}`, onRemove:()=>{ setStatusFilter(null); setPendingSubs(null); } }); }
  if (statusFilter==="decision_pending" && pendingSubs && pendingSubs.length) pendingSubs.forEach((id,i)=>{ const b=RCD_PENDING_SUBS.find(x=>x.id===id); chips.push({ id:"ps"+i, label:`Decision Pending: ${b?b.label:id}`, onRemove:()=>{ const rest=pendingSubs.filter(x=>x!==id); setPendingSubs(rest.length?rest:null); } }); });
  if (atFilter) { const a = RCD_AT_LOOKUP.find(x=>x.id===atFilter); chips.push({ id:"at", label:`AT Status: ${a?a.label:atFilter}`, onRemove:()=>setAtFilter(null) }); }
  if (naReasons && naReasons.length) naReasons.forEach((r,i)=>chips.push({ id:"na"+i, label:`Reason: ${r}`, onRemove:()=>setNaReasons(naReasons.filter(x=>x!==r).length ? naReasons.filter(x=>x!==r) : null) }));
  if (intReasons && intReasons.length) intReasons.forEach((r,i)=>chips.push({ id:"int"+i, label:`Intervention: ${r}`, onRemove:()=>setIntReasons(intReasons.filter(x=>x!==r).length ? intReasons.filter(x=>x!==r) : null) }));
  if (ipBuckets && ipBuckets.length) ipBuckets.forEach((b,i)=>chips.push({ id:"ip"+i, label:`In Progress: ${(RCD_IP_BUCKETS.find(x=>x.id===b)||{}).label||b}`, onRemove:()=>setIpBuckets(ipBuckets.filter(x=>x!==b).length ? ipBuckets.filter(x=>x!==b) : null) }));
  if (review) {
    // Arriving from a Dashboard action item, review mode narrows to unreviewed
    // rows only — the clicked reason / decision status is the whole scope.
    (reviewUnreviewedOnly ? [{ id:"rv-nr", label:"Reviewed : Not Reviewed" }] : [
      { id:"rv-at", label:"Automation Status: Needs Attention" },
      { id:"rv-od", label:"Decision status: Non-Affirmed" },
      { id:"rv-nr", label:"Reviewed : Not Reviewed" },
    ]).forEach(c=>chips.push({ ...c, onRemove:()=>onExitReview&&onExitReview() }));
  }
  const clearAll = () => { setScopeIds(null); setStatusFilter(null); setPendingSubs(null); setAtFilter(null); setNaReasons(null); setIntReasons(null); setIpBuckets(null); setFieldFilters([]); setSearchQ(""); if(review && onExitReview) onExitReview(); };

  return (
    <div style={{background:"#fff"}} data-screen-label="01 RCD">
      <RCDFilterBar
        chips={chips}
        datePicker={{ value:dateRange, available:[...new Set(RCD_ROWS.map(r=>r.txnInitDate))], onChange:setDateRange }}
        fieldFilters={fieldFilters} onFieldFilters={setFieldFilters}
        onClearAll={clearAll} searchValue={searchQ} onSearch={setSearchQ} />
      <div style={{padding:"20px 24px 0",display:"flex",alignItems:"flex-start",gap:32,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 320px",minWidth:0}}>
          <RCDTitleCluster />
        </div>
        <div style={{flex:"1 1 640px",minWidth:0,display:"flex",justifyContent:"flex-end"}}>
          <RCDStatusStrip scopedRows={scopedForStatus} totalRows={base.length} activeStatus={statusFilter} onPick={(id)=>{ setStatusFilter(id); if(id!=="decision_pending") setPendingSubs(null); }} review={review}
            pendingSubs={pendingSubs} onPendingSubs={setPendingSubs}
            anyFilter={!!(statusFilter||atFilter||(naReasons&&naReasons.length)||(intReasons&&intReasons.length)||(ipBuckets&&ipBuckets.length))}
            onReset={()=>{ setStatusFilter(null); setPendingSubs(null); setAtFilter(null); setNaReasons(null); setIntReasons(null); setIpBuckets(null); }} />
        </div>
      </div>
      {/* AT status sits on its own full-width row so all eight statuses stay on one line
          without widening the Decision Status Summary box. */}
      <div style={{padding:"0 24px"}}>
        <RCDAutomationStatus scopedRows={scopedForAt} atFilter={atFilter} onFilter={setAtFilter} otherActive={!!statusFilter} review={review} naReasons={naReasons} onNaReasons={setNaReasons} intReasons={intReasons} onIntReasons={setIntReasons} ipBuckets={ipBuckets} onIpBuckets={setIpBuckets} />
      </div>
      <div style={{padding:"18px 24px 0"}}>
        <div className="ws-hscroll ws-scrollbody" style={{overflow:"auto",maxHeight:bodyH+48,paddingBottom:4}}><div style={{minWidth:RCD_TABLE_W}}>
        <RCDTableHeader sortKey={sortKey} sortDir={sortDir} onSort={onSort} bulkMode={bulkMode}
          allSelected={(bulkSelectable(pageRows)).length>0 && bulkSelectable(pageRows).every(r=>selectedIds[r.id])}
          onToggleAll={()=>{ const eligible = bulkSelectable(pageRows); const on = eligible.length>0 && eligible.every(r=>selectedIds[r.id]); setSelectedIds(m=>{ const next={...m}; eligible.forEach(r=>{ if(on) delete next[r.id]; else next[r.id]=true; }); return next; }); }} />
        <div style={{paddingTop:8}}>
          {pageRows.length===0 ? (
            <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>No RCD records match the current filters.</div>
          ) : pageRows.map(r=>(
            <React.Fragment key={r.id}>
              <RCDTableRow row={r} bulkMode={bulkMode} selected={!!selectedIds[r.id]} onSelect={(id)=>setSelectedIds(m=>({...m,[id]:!m[id]}))} reviewModeOn={bulkKind ? bulkKind==="review" : review}
                reviewed={!!reviewedSet[r.id]} onReviewed={toggleReviewed} onIntervention={(row)=>{ window.__pcrIntFocus = true; onPatient && onPatient(row); }} onInProgress={setInProgressRow} onContact={setContactPop} onPatient={onPatient} />
            </React.Fragment>
          ))}
        </div>
        </div></div>
      </div>
      <RCDContactPopover pop={contactPop} onClose={()=>setContactPop(null)} />
      {interventionRow && <RCDInterventionDrawer row={interventionRow} onClose={()=>setInterventionRow(null)} onTerminate={terminateRow} onResolved={(r)=>setIntResolved(m=>({...m,[r.id]:true}))} />}
      {inProgressRow && <RCDInProgressDrawer row={inProgressRow} onClose={()=>setInProgressRow(null)} onTerminate={terminateRow} />}
      {bulkTermConfirm && (typeof window!=="undefined") && window.PCRTerminateModal && (
        <window.PCRTerminateModal count={selCount} onClose={()=>{ setBulkTermConfirm(false); if(onExitBulk) onExitBulk(); }} onTerminate={()=>{
          const ids = Object.keys(selectedIds).filter(k=>selectedIds[k]); const byId = {}; allRows.forEach(r=>{ byId[r.id]=r; }); ids.forEach(id=>{ const row = byId[id]; if(row) terminateRow(row, "Bulk terminated by user"); });
          setSelectedIds({});
        }} />
      )}
      {bulkReviewConfirm && (typeof window!=="undefined") && window.PCRMarkReviewedModal && (
        <window.PCRMarkReviewedModal count={selCount} onClose={()=>{ setBulkReviewConfirm(false); if(onExitBulk) onExitBulk(); }} onConfirm={()=>{
          const ids = Object.keys(selectedIds).filter(k=>selectedIds[k]); setReviewedSet(m=>{ const next={...m}; ids.forEach(id=>{ next[id]=true; }); return next; }); setSelectedIds({});
        }} />
      )}
      <RCDPagination total={total} page={page} perPage={perPage} onPage={(p)=>setPage(Math.min(Math.max(1,p), Math.max(1,Math.ceil(total/perPage))))} onPerPage={setPerPage} />
    </div>
  );
}

if (typeof window !== "undefined") Object.assign(window, { RCD_PCR_STAGE_LIST, rcdAtLabel, RCDRequestView, RCDInterventionGlyph, rcdInterventions, rcdChildRows, RCDIntTable, RCD_DONE_COLS, RCDInProgressDrawer, RCDPill });
