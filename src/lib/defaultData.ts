import { Student, SeatMatrixItem, HodAccount, FacultyMember, Notice, SystemSettings, SpotCandidate, AuditLog, CategoryType, FAQItem } from '../types';

export const DEFAULT_COLLEGE_LOGO = "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=200&q=80";

export const DEFAULT_SETTINGS: SystemSettings = {
  id: 'global',
  spotRoundEnabled: true,
  collegeLogoUrl: DEFAULT_COLLEGE_LOGO,
  collegeName: "SAMS Panchayat College, Baragada",
  collegeNameOdia: "ସାମ୍ସ ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼",
  collegeCode: "03071302",
  tagline: "Government of Odisha | Department of Higher Education",
  taglineOdia: "ଓଡ଼ିଶା ସରକାର | ଉଚ୍ଚଶିକ୍ଷା ବିଭାଗ",
  naacGrade: "NAAC Accredited Grade B++ | Govt. Degree College Estd. 1960",
  bannerNotice: "SAMS Degree e-Admission 2026-27: Spot Selection Live Reporting Desk Open. Candidates check merit list below.",
  bannerNoticeOdia: "ସାମ୍ସ ଡିଗ୍ରୀ ଇ-ନାମଲେଖା ୨୦୨୬-୨୭: ସ୍ପଟ୍ ସିଲେକ୍ସନ୍ ସିଟ୍ ଲାଇଭ୍ ମେରିଟ୍ ତାଲିକା ନିମ୍ନରେ ପ୍ରକାଶିତ।",
  prospectusUrl: "https://samsodisha.gov.in/Degree/DegreePublicCommonProspectus.pdf",
  contactPhone: "06646-230234",
  contactEmail: "principal.baragada@gmail.com",
  address: "Panchayat College, Baragada, Odisha - 768028",
  addressOdia: "ପଞ୍ଚାୟତ ମହାବିଦ୍ୟାଳୟ, ବରଗଡ଼, ଓଡ଼ିଶା - ୭୬୮୦୨୮",
  sheetSyncUrl: "https://docs.google.com/spreadsheets/d/1_SAMS_Baragada_Live_Admission_2026/edit?usp=sharing",
  lastSheetSync: new Date().toISOString(),
  // Principal-in-Charge
  principalName: "Prof. Amarendra Panda",
  principalNameOdia: "ପ୍ରଫେସର ଅମରେନ୍ଦ୍ର ପଣ୍ଡା",
  principalDesignation: "Principal-in-Charge | Reader in Physics",
  principalPhotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  principalPhone: "06646-230234",
  principalEmail: "principal.baragada@gmail.com",

  // UG Admission In-Charge
  admissionIncharge1Name: "Dr. Manoranjan Dash",
  admissionIncharge1NameOdia: "ଡଃ ମନୋରଞ୍ଜନ ଦାଶ",
  admissionIncharge1Designation: "UG Admission In-Charge | Sr. Lecturer in Economics",
  admissionIncharge1PhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  admissionIncharge1Phone: "+91 94371 88201",
  admissionIncharge1Email: "admission.arts.pcb@gmail.com",

  // UG Admission In-Charge
  admissionIncharge2Name: "Dr. Sasmita Panigrahi",
  admissionIncharge2NameOdia: "ଡଃ ସସ୍ମିତା ପାଣିଗ୍ରାହୀ",
  admissionIncharge2Designation: "UG Admission In-Charge | Sr. Lecturer in Chemistry",
  admissionIncharge2PhotoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
  admissionIncharge2Phone: "+91 94372 65430",
  admissionIncharge2Email: "admission.science.pcb@gmail.com",

  // Data Entry Operator (DEO)
  deoName: "Sri Rajesh Kumar Meher",
  deoNameOdia: "ଶ୍ରୀ ରାଜେଶ କୁମାର ମେହେର",
  deoDesignation: "Data Entry Operator (DEO) | SAMS Helpdesk & Verification",
  deoPhotoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  deoPhone: "+91 79780 45129",
  deoEmail: "deo.sams.pcb@gmail.com",

  updatedAt: new Date().toISOString(),
};

export const DEPARTMENTS_LIST = [
  // Arts Stream (15 courses)
  { id: 'arts_aedp_econ', name: 'B.A in Economics and data analytics (AEDP)', stream: 'Arts' as const, isAedp: true, sanctioned: 16, admitted: 0, spec: 'AEDP Economics and Data Analytics' },
  { id: 'arts_aedp_english', name: 'B.A in English and Translation & digital humanities (AEDP)', stream: 'Arts' as const, isAedp: true, sanctioned: 16, admitted: 0, spec: 'AEDP English, Translation & Digital Humanities' },
  { id: 'arts_aedp_history', name: 'B.A in History with Tourism and Hospitality Operations (AEDP)', stream: 'Arts' as const, isAedp: true, sanctioned: 16, admitted: 0, spec: 'AEDP History with Tourism and Hospitality Operations' },
  { id: 'arts_economics', name: 'Economics', stream: 'Arts' as const, isAedp: false, sanctioned: 48, admitted: 0, spec: 'Regular Honours' },
  { id: 'arts_education', name: 'Education', stream: 'Arts' as const, isAedp: false, sanctioned: 64, admitted: 0, spec: 'Regular Honours' },
  { id: 'arts_english', name: 'English', stream: 'Arts' as const, isAedp: false, sanctioned: 48, admitted: 0, spec: 'Regular Honours' },
  { id: 'arts_geography', name: 'Geography', stream: 'Arts' as const, isAedp: false, sanctioned: 64, admitted: 0, spec: 'Regular Honours' },
  { id: 'arts_hindi', name: 'Hindi', stream: 'Arts' as const, isAedp: false, sanctioned: 64, admitted: 0, spec: 'Regular Honours' },
  { id: 'arts_history', name: 'History', stream: 'Arts' as const, isAedp: false, sanctioned: 48, admitted: 0, spec: 'Regular Honours' },
  { id: 'arts_odia', name: 'Odia', stream: 'Arts' as const, isAedp: false, sanctioned: 64, admitted: 0, spec: 'Regular Honours' },
  { id: 'arts_philosophy', name: 'Philosophy', stream: 'Arts' as const, isAedp: false, sanctioned: 64, admitted: 0, spec: 'Regular Honours' },
  { id: 'arts_political_science', name: 'Political Science', stream: 'Arts' as const, isAedp: false, sanctioned: 64, admitted: 0, spec: 'Regular Honours' },
  { id: 'arts_psychology', name: 'Psychology', stream: 'Arts' as const, isAedp: false, sanctioned: 32, admitted: 0, spec: 'Regular Honours' },
  { id: 'arts_sanskrit', name: 'Sanskrit', stream: 'Arts' as const, isAedp: false, sanctioned: 64, admitted: 0, spec: 'Regular Honours' },
  { id: 'arts_sociology', name: 'Sociology', stream: 'Arts' as const, isAedp: false, sanctioned: 64, admitted: 0, spec: 'Regular Honours' },

  // Biological Science Stream (4 courses)
  { id: 'bio_aedp_botany', name: 'B.SC in Botany with Tissue culture and vertical gardening (AEDP)', stream: 'Biological Science' as const, isAedp: true, sanctioned: 16, admitted: 0, spec: 'AEDP Tissue Culture & Vertical Gardening' },
  { id: 'bio_aedp_zoology', name: 'B.SC in Zoology and integrative bioscience (AEDP)', stream: 'Biological Science' as const, isAedp: true, sanctioned: 16, admitted: 0, spec: 'AEDP Integrative Bioscience' },
  { id: 'bio_botany', name: 'Botany', stream: 'Biological Science' as const, isAedp: false, sanctioned: 16, admitted: 0, spec: 'Regular Honours' },
  { id: 'bio_zoology', name: 'Zoology', stream: 'Biological Science' as const, isAedp: false, sanctioned: 16, admitted: 0, spec: 'Regular Honours' },

  // Commerce Stream (2 courses)
  { id: 'comm_aedp_banking', name: 'B.Com in Banking, Financial Services and Insurance and Commerce (AEDP)', stream: 'Commerce' as const, isAedp: true, sanctioned: 64, admitted: 0, spec: 'AEDP Banking, Financial Services & Insurance (BFSI)' },
  { id: 'comm_commerce', name: 'Commerce', stream: 'Commerce' as const, isAedp: false, sanctioned: 64, admitted: 0, spec: 'Regular Honours' },

  // Physical Science Stream (6 courses)
  { id: 'phy_aedp_chemistry', name: 'B.SC in Chemistry and Industrial Chemistry (AEDP)', stream: 'Physical Science' as const, isAedp: true, sanctioned: 16, admitted: 0, spec: 'AEDP Chemistry and Industrial Chemistry' },
  { id: 'phy_aedp_math', name: 'B.Sc. in Mathematics & Computing (AEDP)', stream: 'Physical Science' as const, isAedp: true, sanctioned: 16, admitted: 0, spec: 'AEDP Mathematics & Computing' },
  { id: 'phy_chemistry', name: 'Chemistry', stream: 'Physical Science' as const, isAedp: false, sanctioned: 16, admitted: 0, spec: 'Regular Honours' },
  { id: 'phy_mathematics', name: 'Mathematics', stream: 'Physical Science' as const, isAedp: false, sanctioned: 32, admitted: 0, spec: 'Regular Honours' },
  { id: 'phy_physics', name: 'Physics', stream: 'Physical Science' as const, isAedp: false, sanctioned: 32, admitted: 0, spec: 'Regular Honours' },
  { id: 'phy_statistics', name: 'Statistics', stream: 'Physical Science' as const, isAedp: false, sanctioned: 32, admitted: 0, spec: 'Regular Honours' },

  // Self Financing Stream (1 course)
  { id: 'sf_computer_science', name: 'Computer Science', stream: 'Self Financing' as const, isAedp: false, sanctioned: 64, admitted: 0, spec: 'Self Financing Honours' },
];

export const DEFAULT_SEAT_MATRIX: SeatMatrixItem[] = [];

export const DEFAULT_HOD_ACCOUNTS: HodAccount[] = [
  { id: 'phy_physics', deptName: 'Physics', username: 'hod_physics', password: 'Physics@baragada2026', hodName: 'Dr. Ramesh Chandra Sahoo', phone: '9437123401', email: 'hod.physics@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'bio_botany', deptName: 'Botany', username: 'hod_botany', password: 'Botany@baragada2026', hodName: 'Dr. Sunita Mohapatra', phone: '9437123402', email: 'hod.botany@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'bio_zoology', deptName: 'Zoology', username: 'hod_zoology', password: 'Zoology@baragada2026', hodName: 'Dr. Bipin Bihari Behera', phone: '9437123403', email: 'hod.zoology@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'phy_mathematics', deptName: 'Mathematics', username: 'hod_math', password: 'Math@baragada2026', hodName: 'Prof. Amarendra Panda', phone: '9437123404', email: 'hod.math@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'phy_chemistry', deptName: 'Chemistry', username: 'hod_chemistry', password: 'Chem@baragada2026', hodName: 'Dr. Priyambada Dash', phone: '9437123405', email: 'hod.chemistry@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'phy_statistics', deptName: 'Statistics', username: 'hod_stats', password: 'Stats@baragada2026', hodName: 'Dr. Bikash Ranjan Patel', phone: '9437123417', email: 'hod.stats@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'sf_computer_science', deptName: 'Computer Science', username: 'hod_cs', password: 'CS@baragada2026', hodName: 'Prof. Deepak Kumar Sahu', phone: '9437123418', email: 'hod.cs@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'arts_economics', deptName: 'Economics', username: 'hod_economics', password: 'Econ@baragada2026', hodName: 'Dr. Prasanta Kumar Hota', phone: '9437123419', email: 'hod.econ@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'arts_english', deptName: 'English', username: 'hod_english', password: 'English@baragada2026', hodName: 'Dr. Madhusmita Mishra', phone: '9437123420', email: 'hod.eng@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'arts_odia', deptName: 'Odia', username: 'hod_odia', password: 'Odia@baragada2026', hodName: 'Prof. Manas Ranjan Tripathy', phone: '9437123406', email: 'hod.odia@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'arts_political_science', deptName: 'Political Science', username: 'hod_polsc', password: 'Polsc@baragada2026', hodName: 'Dr. Lopamudra Nayak', phone: '9437123407', email: 'hod.polsc@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'arts_history', deptName: 'History', username: 'hod_history', password: 'History@baragada2026', hodName: 'Dr. Asit Kumar Pradhan', phone: '9437123408', email: 'hod.history@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'comm_commerce', deptName: 'Commerce', username: 'hod_commerce', password: 'Commerce@baragada2026', hodName: 'Prof. Debabrata Singh', phone: '9437123409', email: 'hod.commerce@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'arts_education', deptName: 'Education', username: 'hod_education', password: 'Edu@baragada2026', hodName: 'Dr. Sarojini Jena', phone: '9437123410', email: 'hod.edu@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'arts_sociology', deptName: 'Sociology', username: 'hod_sociology', password: 'Socio@baragada2026', hodName: 'Prof. Nirmal Chandra Bhoi', phone: '9437123411', email: 'hod.socio@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'arts_geography', deptName: 'Geography', username: 'hod_geography', password: 'Geo@baragada2026', hodName: 'Dr. Mamata Mohanty', phone: '9437123412', email: 'hod.geo@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'arts_philosophy', deptName: 'Philosophy', username: 'hod_philosophy', password: 'Philo@baragada2026', hodName: 'Prof. Subash Chandra Rout', phone: '9437123413', email: 'hod.philo@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'arts_sanskrit', deptName: 'Sanskrit', username: 'hod_sanskrit', password: 'Sans@baragada2026', hodName: 'Dr. Banita Padhi', phone: '9437123414', email: 'hod.sans@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'arts_psychology', deptName: 'Psychology', username: 'hod_psychology', password: 'Psych@baragada2026', hodName: 'Dr. Rashmi Rekha Kar', phone: '9437123415', email: 'hod.psych@baragada.edu.in', updatedAt: new Date().toISOString() },
  { id: 'arts_hindi', deptName: 'Hindi', username: 'hod_hindi', password: 'Hindi@baragada2026', hodName: 'Prof. Vijay Prasad Sharma', phone: '9437123416', email: 'hod.hindi@baragada.edu.in', updatedAt: new Date().toISOString() },
];

export const DEFAULT_FACULTY: FacultyMember[] = [];

export const DEFAULT_NOTICES: Notice[] = [];

export const DEFAULT_SPOT_CANDIDATES: SpotCandidate[] = [
  { id: 'spot_1', studentName: 'Prakash Chandra Pradhan', samsRegNo: '24D11801', deptId: 'physics_regular', deptName: 'Physics (Regular)', stream: 'Science', category: 'GEN', marksPercentage: 88.4, waitlistRank: 1, reportedStatus: 'Reported', selectionStatus: 'Selected', appliedAt: '2026-10-14T08:30:00Z', phone: '9861011122' },
  { id: 'spot_2', studentName: 'Subhashree Behera', samsRegNo: '24D11802', deptId: 'physics_regular', deptName: 'Physics (Regular)', stream: 'Science', category: 'SC', marksPercentage: 84.2, waitlistRank: 2, reportedStatus: 'Reported', selectionStatus: 'Selected', appliedAt: '2026-10-14T08:45:00Z', phone: '9861022233' },
  { id: 'spot_3', studentName: 'Anil Kumar Sahoo', samsRegNo: '24D11803', deptId: 'physics_regular', deptName: 'Physics (Regular)', stream: 'Science', category: 'SEBC', marksPercentage: 81.6, waitlistRank: 3, reportedStatus: 'Reported', selectionStatus: 'Waiting', appliedAt: '2026-10-14T09:00:00Z', phone: '9861033344' },
  { id: 'spot_4', studentName: 'Lipika Tanaya Mohanty', samsRegNo: '24D11804', deptId: 'botany_regular', deptName: 'Botany (Regular)', stream: 'Science', category: 'GEN', marksPercentage: 86.8, waitlistRank: 1, reportedStatus: 'Reported', selectionStatus: 'Selected', appliedAt: '2026-10-14T08:15:00Z', phone: '9861044455' },
  { id: 'spot_5', studentName: 'Jagannath Sethi', samsRegNo: '24D11805', deptId: 'botany_regular', deptName: 'Botany (Regular)', stream: 'Science', category: 'SC', marksPercentage: 79.5, waitlistRank: 2, reportedStatus: 'Reported', selectionStatus: 'Selected', appliedAt: '2026-10-14T09:10:00Z', phone: '9861055566' },
  { id: 'spot_6', studentName: 'Dibakar Naik', samsRegNo: '24D11806', deptId: 'odia', deptName: 'Odia', stream: 'Arts', category: 'ST', marksPercentage: 74.8, waitlistRank: 1, reportedStatus: 'Reported', selectionStatus: 'Selected', appliedAt: '2026-10-14T08:20:00Z', phone: '9861066677' },
  { id: 'spot_7', studentName: 'Sasmita Rani Panda', samsRegNo: '24D11807', deptId: 'commerce', deptName: 'Commerce', stream: 'Commerce', category: 'GEN', marksPercentage: 89.2, waitlistRank: 1, reportedStatus: 'Reported', selectionStatus: 'Selected', appliedAt: '2026-10-14T08:05:00Z', phone: '9861077788' },
  { id: 'spot_8', studentName: 'Rakesh Roshan Dash', samsRegNo: '24D11808', deptId: 'commerce', deptName: 'Commerce', stream: 'Commerce', category: 'SEBC', marksPercentage: 85.0, waitlistRank: 2, reportedStatus: 'Reported', selectionStatus: 'Selected', appliedAt: '2026-10-14T08:50:00Z', phone: '9861088899' },
];

export const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  { id: 'log_1', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), adminName: 'Super Admin', actionType: 'SYSTEM_BOOT', description: 'SAMS College e-Admission portal database initialized.' },
  { id: 'log_2', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), adminName: 'Super Admin', actionType: 'SPOT_ROUND_TOGGLE', description: 'Master Switch: Spot Round Seats live reporting desk ENABLED.' },
  { id: 'log_3', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), adminName: 'Super Admin', actionType: 'SAMS_SHEET_SYNC', description: 'Synced student records database.' }
];

export const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 'faq_1',
    question: 'How do I apply for +3 Degree e-Admission at Panchayat College Baragada?',
    answer: 'Candidates must apply online through the official SAMS Odisha website (samsodisha.gov.in) by selecting Panchayat College Baragada (College Code: 03071302) as their preferred choice.',
    category: 'Admission',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'faq_2',
    question: 'What is the Apprenticeship Embedded Degree Programme (AEDP) in Odisha?',
    answer: 'AEDP (Apprenticeship Embedded Degree Programme) is a flagship initiative of the Department of Higher Education (DHE), Govt. of Odisha, aligned with UGC Guidelines and NEP 2020. It integrates regular Honours coursework with a mandatory 1-year paid on-the-job industrial apprenticeship during the final year. Students receive a monthly stipend during their apprenticeship. Degrees are officially recognized by the Odisha Govt. as 100% equivalent to conventional +3 degrees for PG/Master\'s, Ph.D. admissions, and civil/public examinations.',
    category: 'Academics',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'faq_5',
    question: 'What are the 8 AEDP Specializations offered at Panchayat College Baragada?',
    answer: 'Panchayat College Baragada offers 8 government-sanctioned AEDP specializations: (1) B.A in Economics & Data Analytics, (2) B.A in English & Digital Humanities, (3) B.A in History & Tourism/Hospitality, (4) B.Com in Banking, Financial Services & Insurance (BFSI), (5) B.Sc in Botany & Tissue Culture, (6) B.Sc in Zoology & Integrative Bioscience, (7) B.Sc in Chemistry & Industrial Chemistry, and (8) B.Sc in Mathematics & Computing. Admissions are conducted through SAMS Odisha.',
    category: 'Academics',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'faq_3',
    question: 'How does the Spot Round Seat reporting work?',
    answer: 'During Spot Round, vacant seats are displayed live on this portal. Eligible candidates must report physically at SAMS Room No. 12 between 10 AM and 2 PM with original certificates.',
    category: 'Spot Round',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'faq_4',
    question: 'How can Super Admin add new FAQs or edit existing answers?',
    answer: 'Super Admins can log in, navigate to the FAQs tab in the menu, and use the "Add New FAQ" form or edit/delete existing FAQs instantly.',
    category: 'Administration',
    updatedAt: new Date().toISOString()
  }
];

// Helper to systematically generate Student Records (returns empty array as requested)
export function generate1100Students(): Student[] {
  return [];
}
