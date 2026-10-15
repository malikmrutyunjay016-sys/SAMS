export type StreamType = 'Arts' | 'Science' | 'Commerce';

export type CategoryType = 'GEN' | 'SC' | 'ST' | 'SEBC';

export type StudentStatus = 'Admitted' | 'Spot Applied' | 'Selected' | 'Verified' | 'Pending';

export interface Student {
  id: string;
  name: string;
  rollNo: string; // University Roll Number e.g. BS24-042
  samsRegNo: string; // SAMS Reg No e.g. 24D10829
  barcode?: string;
  parentName?: string; // Father / Mother name
  dob?: string; // Date of Birth
  maxMarks?: number;
  marksSecured?: number;
  department: string;
  stream: StreamType;
  isAedp: boolean;
  category: CategoryType;
  marksPercentage: number;
  bloodGroup: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
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
  tagline: string;
  naacGrade: string;
  bannerNotice: string;
  prospectusUrl: string;
  sheetSyncUrl?: string;
  lastSheetSync?: string;
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

