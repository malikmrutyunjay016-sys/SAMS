export type StreamType = 'Arts' | 'Biological Science' | 'Commerce' | 'Physical Science' | 'Self Financing' | 'Science';

export type CategoryType = 'GEN' | 'SC' | 'ST' | 'SEBC' | 'OBC';

export type StudentStatus = 'Admitted' | 'Spot Applied' | 'Selected' | 'Verified' | 'Pending';

export const ACADEMIC_YEARS = ['2025-26', '2024-25', '2023-24'] as const;
export type AcademicYearType = typeof ACADEMIC_YEARS[number];

export interface Student {
  id: string;
  name: string; // Student Name (Applicant Name)
  rollNo: string; // College Roll Number
  universityRollNo?: string; // University Roll Number (Editable by Admin/HOD)
  samsRegNo: string; // Barcode Number
  parentName?: string; // Father's Name
  motherName?: string; // Mother's Name
  aadhaarNo?: string; // Aadhaar No
  email?: string; // Student Email ID
  stream: StreamType; // Stream
  gender: 'Male' | 'Female' | 'Other'; // Gender
  address?: string; // Address
  category: CategoryType; // Category
  mobileNumber?: string; // Mobile Number
  admissionDate?: string; // Admission Date
  academicYear?: string; // Academic Year / Session e.g. '2025-26', '2024-25', '2023-24'
  department: string; // Subject Name
  isAedp: boolean;
  maxMarks?: number;
  marksSecured?: number;
  marksPercentage: number;
  bloodGroup?: string;
  phone?: string;
  dob?: string;
  status: StudentStatus;
  updatedAt: string;
}

export interface SeatMatrixItem {
  id: string; // e.g. physics_regular, physics_aedp
  deptName: string;
  stream: StreamType;
  isAedp: boolean;
  specialization?: string;
  sanctioned: number;
  admitted: number;
  vacant: number;
  academicYear?: string; // e.g. '2026-27', '2025-26'
  updatedAt: string;
}

export interface SpotCandidate {
  id: string;
  studentName: string;
  samsRegNo: string;
  deptId: string;
  deptName: string;
  stream: StreamType;
  category: CategoryType;
  marksPercentage: number;
  waitlistRank: number;
  reportedStatus: 'Reported' | 'Not Reported' | 'Pending';
  selectionStatus: 'Selected' | 'Waiting' | 'Rejected' | 'Admitted';
  appliedAt: string;
  phone?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  actionType: string;
  description: string;
}

export interface HodAccount {
  id: string; // deptId
  deptName: string;
  username: string;
  password: string;
  hodName: string;
  phone: string;
  email: string;
  updatedAt: string;
}

export interface SystemSettings {
  id: string;
  spotRoundEnabled: boolean;
  collegeLogoUrl: string;
  collegeName: string;
  collegeNameOdia?: string;
  collegeCode?: string;
  tagline: string;
  taglineOdia?: string;
  naacGrade: string;
  bannerNotice: string;
  bannerNoticeOdia?: string;
  prospectusUrl: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  addressOdia?: string;
  sheetSyncUrl?: string;
  lastSheetSync?: string;
  // Principal & Key Authorities
  principalName?: string;
  principalNameOdia?: string;
  principalDesignation?: string;
  principalPhotoUrl?: string;
  principalPhone?: string;
  principalEmail?: string;
  // 02 Admission In-Charge Officers
  admissionIncharge1Name?: string;
  admissionIncharge1NameOdia?: string;
  admissionIncharge1Designation?: string;
  admissionIncharge1PhotoUrl?: string;
  admissionIncharge1Phone?: string;
  admissionIncharge1Email?: string;
  admissionIncharge2Name?: string;
  admissionIncharge2NameOdia?: string;
  admissionIncharge2Designation?: string;
  admissionIncharge2PhotoUrl?: string;
  admissionIncharge2Phone?: string;
  admissionIncharge2Email?: string;
  // Data Entry Operator (DEO)
  deoName?: string;
  deoNameOdia?: string;
  deoDesignation?: string;
  deoPhotoUrl?: string;
  deoPhone?: string;
  deoEmail?: string;
  // Custom Redirect Link
  customBannerLinkUrl?: string;
  customBannerLinkLabel?: string;
  customBannerLinkLabelOdia?: string;
  updatedAt: string;
}

export interface Notice {
  id: string;
  title: string;
  category: 'General' | 'Admission' | 'Examination' | 'Departmental' | 'Spot Round';
  deptId?: string;
  date: string;
  downloadUrl?: string;
  isImportant: boolean;
  content?: string;
}

export interface FacultyMember {
  id: string;
  deptId: string;
  deptName: string;
  name: string;
  designation: string;
  qualification: string;
  email: string;
  phone: string;
  photoUrl: string;
  isHod: boolean;
}

export interface CollegeInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  updatedAt: string;
}

// Subject Counselling Types (NEP 2020 Framework)
export interface Semester1Regular {
  major: string;
  minor: string;
  mdc: string;
  aec: string;
  vac: string;
}

export interface Semester2Regular {
  major: string;
  minor: string;
  mdc: string;
  aec: string;
  vac: string;
}

export interface Semester3Regular {
  major: string;
  minor: string;
  mdc: string;
  vac: string;
}

export interface Semester4Regular {
  major: string;
  minor: string;
  activity: string;
}

export interface Semester5Regular {
  major: string;
  minor: string;
  sec: string;
  vac: string;
}

export interface Semester6Regular {
  major: string;
  minor: string;
  sec: string;
  vac: string;
}

export interface RegularHonoursCounselling {
  major: string;
  minor1: string;
  minor2: string;
  mdc1: string;
  mdc2: string;
  mdc3: string;
  sec1: string;
  sec2: string;
  sec3: string;
  aec1: string;
  aec2: string;
  vac1: string;
  vac2: string;
  sem1?: Semester1Regular;
  sem2?: Semester2Regular;
  sem3?: Semester3Regular;
  sem4?: Semester4Regular;
  sem5?: Semester5Regular;
  sem6?: Semester6Regular;
}

export interface Semester1Aedp {
  major1: string;
  major2: string;
  aec1: string;
  vac1: string;
}

export interface Semester2Aedp {
  major1: string;
  major2: string;
  aec2: string;
  vac2: string;
}

export interface Semester3Aedp {
  major1: string;
  major2: string;
  mdc1: string;
  sec1: string;
}

export interface Semester4Aedp {
  major1: string;
  major2: string;
  mdc2: string;
  sec2: string;
}

export interface Semester5_6Aedp {
  apprenticeship: string;
}

export interface AedpCounselling {
  major1: string;
  major2: string;
  mdc1: string;
  mdc2: string;
  aec1: string;
  aec2: string;
  sec1: string;
  sec2: string;
  vac1: string;
  vac2: string;
  sem1?: Semester1Aedp;
  sem2?: Semester2Aedp;
  sem3?: Semester3Aedp;
  sem4?: Semester4Aedp;
  sem5_6?: Semester5_6Aedp;
}

export interface StudentCounsellingRecord {
  id: string; // studentId
  studentId: string;
  studentName: string;
  rollNo: string;
  universityRollNo?: string;
  samsRegNo: string;
  academicYear: string;
  stream: StreamType;
  department: string;
  isAedp: boolean;
  status: 'Allotted' | 'Pending' | 'Verified';
  allottedDate?: string;
  counselorName?: string;
  remarks?: string;
  regular?: RegularHonoursCounselling;
  aedp?: AedpCounselling;
  updatedAt: string;
}


