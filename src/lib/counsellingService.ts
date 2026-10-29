import * as XLSX from 'xlsx';
import { Student, StudentCounsellingRecord, RegularHonoursCounselling, AedpCounselling, StreamType } from '../types';

// Standard options for Dropdown Selectors
export const COMMON_AEC_OPTIONS = [
  'Odia MIL Communication',
  'Alternative English Communication',
  'Hindi Language & Communication',
  'Sanskrit Vani & Functional Grammar',
  'Environmental Studies & Climate Action',
  'Business Communication & Technical Writing',
];

export const COMMON_VAC_OPTIONS = [
  'Ethics & Human Values (EHV)',
  'Environmental Studies & Disaster Management',
  'Digital Solutions & Cyber Security',
  'Health, Wellness & Yoga',
  'Sports Ethics & Community Engagement',
  'Gender Studies & Constitutional Rights',
  'Workplace Safety & First Aid',
];

export const STREAM_MDC_OPTIONS: Record<string, string[]> = {
  Arts: [
    'Introduction to Physical Sciences',
    'Basics of Life Sciences & Biodiversity',
    'Fundamentals of Information Technology',
    'Elements of Commerce & Personal Finance',
    'Applied Environmental Chemistry',
    'Statistics in Everyday Life',
  ],
  'Physical Science': [
    'Indian Constitution & Democratic Institutions',
    'Understanding Odia Culture & Heritage',
    'Introduction to Economics & Policy',
    'Modern History & Freedom Struggles',
    'Basic Accounting & Financial Literacy',
    'Foundations of Psychology',
  ],
  'Biological Science': [
    'Sociology of Health & Sanitation',
    'Economics of Sustainable Agriculture',
    'Environmental Law & Ethics',
    'Digital Technologies & Web Basics',
    'Principles of Marketing & Entrepreneurship',
    'Cultural Anthropology & Tribes of Odisha',
  ],
  Commerce: [
    'Science in Daily Living',
    'Cyber Laws & Information Systems',
    'Indian Society: Structure & Dynamics',
    'Public Administration & Good Governance',
    'Basic Ecology & Sustainable Living',
    'Applied Mathematics for Decision Making',
  ],
  'Self Financing': [
    'Public Finance & Indian Economy',
    'Communication Strategies in Business',
    'Human Rights & Civic Ethics',
    'Environmental Biotechnology & Green Chemistry',
    'Social Media Analytics & Digital Ethics',
  ],
};

export const STREAM_SEC_OPTIONS: Record<string, string[]> = {
  Arts: [
    'Creative Writing & Media Translation',
    'Public Speaking & Debate Skills',
    'Desktop Publishing & DTP in Odia/English',
    'Tourism Field Guide & Hospitality Operations',
    'Social Survey & Data Collection Methods',
    'Heritage Preservation & Archival Skills',
  ],
  'Physical Science': [
    'Python for Scientific Computation',
    'Electronic Circuit Assembly & Testing',
    'Chemical Lab Safety & Analytical Instruments',
    'Data Analysis Using R & Excel',
    'Renewable Energy & Solar Panel Tech',
    'Scientific Documentation with LaTeX',
  ],
  'Biological Science': [
    'Mushroom Cultivation & Organic Farming',
    'Bio-fertilizers & Vermicomposting',
    'Plant Tissue Culture & Nursery Tech',
    'Clinical Diagnostic Lab Procedures',
    'Aquaculture & Fish Farming Basics',
    'Apiculture & Honey Processing',
  ],
  Commerce: [
    'E-Commerce & Digital Banking Operations',
    'GST Filing, TDS & Income Tax Practices',
    'Tally Prime & Computerized Accounting',
    'Financial Modeling & Advanced Excel',
    'Stock Market & Mutual Fund Operations',
    'Digital Marketing & Social Media Sales',
  ],
  'Self Financing': [
    'Python & Web Application Development',
    'Database Management & SQL Queries',
    'Cloud Computing & Network Essentials',
    'Cyber Security & Ethical Hacking Basics',
    'UI/UX Design & Frontend Development',
    'Mobile Application Development',
  ],
};

// Stream-wise Minor Subjects mapping for Regular Honours
export const REGULAR_MINOR_MAPPING: Record<string, { minor1: string[]; minor2: string[] }> = {
  Physics: {
    minor1: ['Chemistry', 'Mathematics', 'Computer Science'],
    minor2: ['Mathematics', 'Statistics', 'Electronics'],
  },
  Chemistry: {
    minor1: ['Physics', 'Mathematics', 'Botany'],
    minor2: ['Botany', 'Zoology', 'Mathematics'],
  },
  Mathematics: {
    minor1: ['Physics', 'Statistics', 'Computer Science'],
    minor2: ['Chemistry', 'Economics', 'Computer Science'],
  },
  Statistics: {
    minor1: ['Mathematics', 'Computer Science', 'Economics'],
    minor2: ['Physics', 'Economics', 'Commerce'],
  },
  Botany: {
    minor1: ['Zoology', 'Chemistry'],
    minor2: ['Chemistry', 'Biotechnology', 'Environmental Science'],
  },
  Zoology: {
    minor1: ['Botany', 'Chemistry'],
    minor2: ['Chemistry', 'Microbiology', 'Bioinformatics'],
  },
  Commerce: {
    minor1: ['Business Economics', 'Business Law & Corporate Governance'],
    minor2: ['Business Mathematics & Statistics', 'Financial Markets & Institutions'],
  },
  'Computer Science': {
    minor1: ['Mathematics', 'Physics', 'Electronics'],
    minor2: ['Statistics', 'Information Technology', 'Data Analytics'],
  },
  Economics: {
    minor1: ['Political Science', 'History', 'Sociology'],
    minor2: ['Mathematics', 'Statistics', 'Commerce'],
  },
  English: {
    minor1: ['Odia Literature', 'History', 'Journalism & Mass Comm'],
    minor2: ['Political Science', 'Sociology', 'Philosophy'],
  },
  Odia: {
    minor1: ['History', 'Sanskrit', 'Linguistics'],
    minor2: ['Political Science', 'Education', 'Sociology'],
  },
  History: {
    minor1: ['Political Science', 'Economics', 'Archaeology'],
    minor2: ['Odia', 'Sociology', 'Tourism & Heritage'],
  },
  'Political Science': {
    minor1: ['History', 'Public Administration', 'Economics'],
    minor2: ['Sociology', 'Philosophy', 'Law & Governance'],
  },
  Education: {
    minor1: ['Psychology', 'Sociology', 'Philosophy'],
    minor2: ['Political Science', 'History', 'Odia'],
  },
  Philosophy: {
    minor1: ['Sanskrit', 'Political Science', 'Psychology'],
    minor2: ['History', 'Sociology', 'English'],
  },
  Sanskrit: {
    minor1: ['Odia', 'Philosophy', 'History'],
    minor2: ['Education', 'Sociology', 'Hindi'],
  },
  Sociology: {
    minor1: ['Political Science', 'Anthropology', 'History'],
    minor2: ['Economics', 'Psychology', 'Social Work'],
  },
  Geography: {
    minor1: ['Economics', 'Geology', 'History'],
    minor2: ['Political Science', 'Environmental Science', 'Statistics'],
  },
  Psychology: {
    minor1: ['Education', 'Sociology', 'Philosophy'],
    minor2: ['Zoology', 'Anthropology', 'Social Work'],
  },
  Hindi: {
    minor1: ['Odia', 'History', 'Sanskrit'],
    minor2: ['Political Science', 'Sociology', 'English'],
  },
};

/**
 * Generates an approved NEP 2020 Subject Counselling package for a student
 */
export function generateDefaultCounselling(student: Student): StudentCounsellingRecord {
  const isAedp = Boolean(student.isAedp || student.department?.toLowerCase().includes('aedp'));
  const dept = (student.department || 'General').trim();
  const stream = student.stream || 'Arts';
  const cleanSession = (student.academicYear || '2026-27').trim();

  let regular: RegularHonoursCounselling | undefined = undefined;
  let aedp: AedpCounselling | undefined = undefined;

  if (isAedp) {
    aedp = {
      major1: dept,
      major2: '',
      mdc1: '',
      mdc2: '',
      aec1: '',
      aec2: '',
      sec1: '',
      sec2: '',
      vac1: '',
      vac2: '',
      sem1: { major1: dept, major2: '', aec1: '', vac1: '' },
      sem2: { major1: dept, major2: '', aec2: '', vac2: '' },
      sem3: { major1: dept, major2: '', mdc1: '', sec1: '' },
      sem4: { major1: dept, major2: '', mdc2: '', sec2: '' },
      sem5_6: { apprenticeship: 'APPRENTICESHIP' },
    };
  } else {
    regular = {
      major: dept,
      minor1: '',
      minor2: '',
      mdc1: '',
      mdc2: '',
      mdc3: '',
      sec1: '',
      sec2: '',
      sec3: '',
      aec1: '',
      aec2: '',
      vac1: '',
      vac2: '',
      sem1: { major: dept, minor: '', mdc: '', aec: '', vac: '' },
      sem2: { major: dept, minor: '', mdc: '', aec: '', vac: '' },
      sem3: { major: dept, minor: '', mdc: '', vac: '' },
      sem4: { major: dept, minor: '', activity: '' },
      sem5: { major: dept, minor: '', sec: '', vac: '' },
      sem6: { major: dept, minor: '', sec: '', vac: 'Creative Writing' },
    };
  }

  return {
    id: student.id,
    studentId: student.id,
    studentName: student.name,
    rollNo: student.rollNo,
    universityRollNo: student.universityRollNo || 'N/A',
    samsRegNo: student.samsRegNo,
    academicYear: cleanSession,
    stream,
    department: dept,
    isAedp,
    status: 'Pending',
    allottedDate: '',
    counselorName: 'Pending Admin/HOD Assignment',
    remarks: 'Subject counselling not assigned. To be filled by Admin or HOD.',
    regular,
    aedp,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generates suggested AEDP/Regular counselling package for admin/HOD filling in editor
 */
export function generateSuggestedCounselling(student: Student): StudentCounsellingRecord {
  const isAedp = Boolean(student.isAedp || student.department?.toLowerCase().includes('aedp'));
  const dept = (student.department || 'General').trim();
  const stream = student.stream || 'Arts';
  const cleanSession = (student.academicYear || '2026-27').trim();

  let regular: RegularHonoursCounselling | undefined = undefined;
  let aedp: AedpCounselling | undefined = undefined;

  if (isAedp) {
    let m1 = `${dept} and Applied Professional Technology`;
    let m2 = dept;
    let md1 = '';
    let md2 = '';
    let sc1 = '';
    let sc2 = '';

    const dLow = dept.toLowerCase();
    if (dLow.includes('english') || dLow.includes('translation')) {
      m1 = 'English and Translation & Digital Humanities';
      m2 = 'English';
    } else if (dLow.includes('econ')) {
      m1 = 'Economics and Data Analytics';
      m2 = 'Economics';
    } else if (dLow.includes('chem')) {
      m1 = 'Chemistry and Applied Industrial Process Technology';
      m2 = 'Chemistry';
    } else if (dLow.includes('comput') || dLow.includes('math')) {
      m1 = 'Mathematics and Advanced Computing Algorithms';
      m2 = 'Mathematics';
    } else if (dLow.includes('bank') || dLow.includes('comm')) {
      m1 = 'Commerce and Banking, Financial Services & Insurance (BFSI)';
      m2 = 'Commerce';
    } else if (dLow.includes('botan')) {
      m1 = 'Botany and Plant Tissue Culture & Agri-Tech';
      m2 = 'Botany';
    } else if (dLow.includes('zool')) {
      m1 = 'Zoology and Biomedical Laboratory Technologies';
      m2 = 'Zoology';
    } else if (dLow.includes('hist')) {
      m1 = 'History and Tourism & Heritage Management';
      m2 = 'History';
    }

    aedp = {
      major1: m1,
      major2: m2,
      mdc1: md1,
      mdc2: md2,
      aec1: 'English: Business and Communication',
      aec2: 'English: Word and Presentation',
      sec1: sc1,
      sec2: sc2,
      vac1: 'ENVIRONMENT STUDIES AND DISASTER MANAGEMENT',
      vac2: 'Good Citizenship',
      sem1: {
        major1: m1,
        major2: m2,
        aec1: 'English: Business and Communication',
        vac1: 'ENVIRONMENT STUDIES AND DISASTER MANAGEMENT',
      },
      sem2: {
        major1: m1,
        major2: m2,
        aec2: 'English: Word and Presentation',
        vac2: 'Good Citizenship',
      },
      sem3: {
        major1: m1,
        major2: m2,
        mdc1: md1,
        sec1: sc1,
      },
      sem4: {
        major1: m1,
        major2: m2,
        mdc2: md2,
        sec2: sc2,
      },
      sem5_6: {
        apprenticeship: 'APPRENTICESHIP',
      },
    };
  } else {
    const mapping = REGULAR_MINOR_MAPPING[dept] || {
      minor1: ['Allied Elective I', 'Foundational Studies'],
      minor2: ['Allied Elective II', 'Interdisciplinary Studies'],
    };
    const streamMdc = STREAM_MDC_OPTIONS[stream] || STREAM_MDC_OPTIONS['Arts'];
    const streamSec = STREAM_SEC_OPTIONS[stream] || STREAM_SEC_OPTIONS['Arts'];
    const m1 = mapping.minor1[0] || 'Allied Minor Discipline I';
    const m2 = mapping.minor2[0] || 'Allied Minor Discipline II';
    const sMdc1 = streamMdc[0] || 'Natural Sciences in Daily Life';
    const sMdc2 = streamMdc[1] || 'Foundations of Society & Culture';
    const sMdc3 = streamMdc[2] || 'Information & Communication Essentials';
    const sSec2 = streamSec[1] || 'Digital & Quantitative Skills II';
    const sSec3 = streamSec[2] || 'Professional Technical Skills III';

    regular = {
      major: dept,
      minor1: '',
      minor2: '',
      mdc1: '',
      mdc2: '',
      mdc3: '',
      sec1: '',
      sec2: '',
      sec3: '',
      aec1: '',
      aec2: 'ENGLISH',
      vac1: 'ENVIRONMENT STUDIES AND DISASTER MANAGEMENT',
      vac2: 'ETHICS AND VALUES',
      sem1: { major: dept, minor: '', mdc: '', aec: '', vac: 'ENVIRONMENT STUDIES AND DISASTER MANAGEMENT' },
      sem2: { major: dept, minor: '', mdc: '', aec: 'ENGLISH', vac: '' },
      sem3: { major: dept, minor: '', mdc: '', vac: 'ETHICS AND VALUES' },
      sem4: { major: dept, minor: '', activity: 'Internship / Community Engagement & Service / Field Work' },
      sem5: { major: dept, minor: '', sec: '', vac: 'UNDERSTANDING ODISHA' },
      sem6: { major: dept, minor: '', sec: '', vac: 'Creative Writing' },
    };
  }

  return {
    id: student.id,
    studentId: student.id,
    studentName: student.name,
    rollNo: student.rollNo,
    universityRollNo: student.universityRollNo || 'N/A',
    samsRegNo: student.samsRegNo,
    academicYear: cleanSession,
    stream,
    department: dept,
    isAedp,
    status: 'Allotted',
    allottedDate: new Date().toISOString().slice(0, 10),
    counselorName: 'Admin / HOD Subject Allocation',
    remarks: isAedp ? 'AEDP Curriculum Basket' : 'Regular Honours Subject Combination',
    regular,
    aedp,
    updatedAt: new Date().toISOString(),
  };
}



/**
 * Exports Subject Counselling Records to Excel Spreadsheet (.xlsx)
 */
export function exportCounsellingExcel(
  records: StudentCounsellingRecord[],
  academicYear: string = '2026-27'
) {
  if (!records || records.length === 0) return;

  const regularRecords = records.filter((r) => !r.isAedp);
  const aedpRecords = records.filter((r) => r.isAedp);

  const wb = XLSX.utils.book_new();

  // Sheet 1: Master Allotment Summary
  const masterData = records.map((r, idx) => {
    if (r.isAedp && r.aedp) {
      return {
        'Sl No': idx + 1,
        'Roll Number': r.rollNo,
        'Univ Roll No': r.universityRollNo || 'N/A',
        'SAMS Barcode': r.samsRegNo,
        'Student Name': r.studentName,
        'Admission Session': r.academicYear,
        'Stream': r.stream,
        'Course Type': 'AEDP Specialization',
        'Status': r.status,
        'Major 1': r.aedp.major1,
        'Major 2': r.aedp.major2,
        'Minor 1': 'N/A (AEDP)',
        'Minor 2': 'N/A (AEDP)',
        'MDC 1': r.aedp.mdc1,
        'MDC 2': r.aedp.mdc2,
        'MDC 3': 'N/A (AEDP)',
        'SEC 1': r.aedp.sec1,
        'SEC 2': r.aedp.sec2,
        'SEC 3': 'N/A (AEDP)',
        'AEC 1': r.aedp.aec1,
        'AEC 2': r.aedp.aec2,
        'VAC 1': r.aedp.vac1,
        'VAC 2': r.aedp.vac2,
        'Counselor': r.counselorName || 'Committee',
        'Allotment Date': r.allottedDate || '',
      };
    } else {
      const reg = r.regular || {
        major: r.department,
        minor1: '',
        minor2: '',
        mdc1: '',
        mdc2: '',
        mdc3: '',
        sec1: '',
        sec2: '',
        sec3: '',
        aec1: '',
        aec2: '',
        vac1: '',
        vac2: '',
      };
      return {
        'Sl No': idx + 1,
        'Roll Number': r.rollNo,
        'Univ Roll No': r.universityRollNo || 'N/A',
        'SAMS Barcode': r.samsRegNo,
        'Student Name': r.studentName,
        'Admission Session': r.academicYear,
        'Stream': r.stream,
        'Course Type': 'Regular Honours',
        'Status': r.status,
        'Major 1': reg.major,
        'Major 2': 'N/A (Regular)',
        'Minor 1': reg.minor1,
        'Minor 2': reg.minor2,
        'MDC 1': reg.mdc1,
        'MDC 2': reg.mdc2,
        'MDC 3': reg.mdc3,
        'SEC 1': reg.sec1,
        'SEC 2': reg.sec2,
        'SEC 3': reg.sec3,
        'AEC 1': reg.aec1,
        'AEC 2': reg.aec2,
        'VAC 1': reg.vac1,
        'VAC 2': reg.vac2,
        'Counselor': r.counselorName || 'Committee',
        'Allotment Date': r.allottedDate || '',
      };
    }
  });

  const wsMaster = XLSX.utils.json_to_sheet(masterData);
  XLSX.utils.book_append_sheet(wb, wsMaster, 'All Students Counselling');

  // Sheet 2: Regular Honours Detail
  if (regularRecords.length > 0) {
    const regData = regularRecords.map((r, idx) => {
      const reg = r.regular || {
        major: r.department,
        minor1: '',
        minor2: '',
        mdc1: '',
        mdc2: '',
        mdc3: '',
        sec1: '',
        sec2: '',
        sec3: '',
        aec1: '',
        aec2: '',
        vac1: '',
        vac2: '',
      };
      return {
        'Sl No': idx + 1,
        'College Roll': r.rollNo,
        'University Roll': r.universityRollNo || 'N/A',
        'SAMS Barcode': r.samsRegNo,
        'Student Name': r.studentName,
        'Stream': r.stream,
        'Major': reg.major,
        'Minor 1': reg.minor1,
        'Minor 2': reg.minor2,
        'MDC-1': reg.mdc1,
        'MDC-2': reg.mdc2,
        'MDC-3': reg.mdc3,
        'SEC-1': reg.sec1,
        'SEC-2': reg.sec2,
        'SEC-3': reg.sec3,
        'AEC-1': reg.aec1,
        'AEC-2': reg.aec2,
        'VAC-1': reg.vac1,
        'VAC-2': reg.vac2,
        'Status': r.status,
      };
    });
    const wsReg = XLSX.utils.json_to_sheet(regData);
    XLSX.utils.book_append_sheet(wb, wsReg, 'Regular Honours');
  }

  // Sheet 3: AEDP Detail
  if (aedpRecords.length > 0) {
    const aedpData = aedpRecords.map((r, idx) => {
      const a = r.aedp || {
        major1: r.department,
        major2: '',
        mdc1: '',
        mdc2: '',
        aec1: '',
        aec2: '',
        sec1: '',
        sec2: '',
        vac1: '',
        vac2: '',
      };
      return {
        'Sl No': idx + 1,
        'College Roll': r.rollNo,
        'University Roll': r.universityRollNo || 'N/A',
        'SAMS Barcode': r.samsRegNo,
        'Student Name': r.studentName,
        'Stream': r.stream,
        'Major-1': a.major1,
        'Major-2': a.major2,
        'MDC-1': a.mdc1,
        'MDC-2': a.mdc2,
        'AEC-1': a.aec1,
        'AEC-2': a.aec2,
        'SEC-1 (Apprenticeship OJT-1)': a.sec1,
        'SEC-2 (Apprenticeship OJT-2)': a.sec2,
        'VAC-1': a.vac1,
        'VAC-2': a.vac2,
        'Status': r.status,
      };
    });
    const wsAedp = XLSX.utils.json_to_sheet(aedpData);
    XLSX.utils.book_append_sheet(wb, wsAedp, 'AEDP Courses');
  }

  const cleanYear = academicYear.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `SAMS_PCB_Subject_Counselling_${cleanYear}.xlsx`);
}

export interface SubjectAllocationEntry {
  studentId: string;
  studentName: string;
  rollNo: string;
  universityRollNo: string;
  samsRegNo: string;
  academicYear: string;
  yearLabel: string;
  semester: string;
  stream: string;
  department: string;
  courseType: 'Regular Honours' | 'AEDP Specialization';
  category: 'MINOR' | 'MDC' | 'AEC' | 'VAC' | 'SEC';
  subjectName: string;
  semesterTag: string;
}

export function getYearLabelFromSession(session: string): string {
  if (session === '2026-27') return '1st Year';
  if (session === '2025-26') return '2nd Year';
  if (session === '2024-25') return '3rd Year';
  return 'All Years';
}

export function extractSubjectAllocations(
  records: StudentCounsellingRecord[],
  category: 'MINOR' | 'MDC' | 'AEC' | 'VAC' | 'SEC'
): SubjectAllocationEntry[] {
  const result: SubjectAllocationEntry[] = [];

  records.forEach((r) => {
    const courseType: 'AEDP Specialization' | 'Regular Honours' = r.isAedp ? 'AEDP Specialization' : 'Regular Honours';
    const acYear = r.academicYear || '2026-27';
    const yearLabel = getYearLabelFromSession(acYear);

    const base = {
      studentId: r.studentId || r.id,
      studentName: r.studentName,
      rollNo: r.rollNo,
      universityRollNo: r.universityRollNo || 'N/A',
      samsRegNo: r.samsRegNo,
      academicYear: acYear,
      yearLabel,
      stream: r.stream,
      department: r.department,
      courseType,
      category,
    };

    if (r.isAedp && r.aedp) {
      const a = r.aedp;
      if (category === 'MINOR' && a.major2) {
        result.push({ ...base, semester: 'Semester I', subjectName: a.major2, semesterTag: 'AEDP Major 2 / Allied Tech' });
      } else if (category === 'MDC') {
        if (a.mdc1) result.push({ ...base, semester: 'Semester III', subjectName: a.mdc1, semesterTag: 'Sem III (MDC 1)' });
        if (a.mdc2) result.push({ ...base, semester: 'Semester IV', subjectName: a.mdc2, semesterTag: 'Sem IV (MDC 2)' });
      } else if (category === 'AEC') {
        if (a.aec1) result.push({ ...base, semester: 'Semester I', subjectName: a.aec1, semesterTag: 'Sem I (AEC 1)' });
        if (a.aec2) result.push({ ...base, semester: 'Semester II', subjectName: a.aec2, semesterTag: 'Sem II (AEC 2)' });
      } else if (category === 'VAC') {
        if (a.vac1) result.push({ ...base, semester: 'Semester I', subjectName: a.vac1, semesterTag: 'Sem I (VAC 1)' });
        if (a.vac2) result.push({ ...base, semester: 'Semester II', subjectName: a.vac2, semesterTag: 'Sem II (VAC 2)' });
      } else if (category === 'SEC') {
        if (a.sec1) result.push({ ...base, semester: 'Semester III', subjectName: a.sec1, semesterTag: 'Sem III (SEC 1 / OJT 1)' });
        if (a.sec2) result.push({ ...base, semester: 'Semester IV', subjectName: a.sec2, semesterTag: 'Sem IV (SEC 2 / OJT 2)' });
      }
    } else if (r.regular) {
      const reg = r.regular;
      if (category === 'MINOR') {
        if (reg.minor1) result.push({ ...base, semester: 'Semester I', subjectName: reg.minor1, semesterTag: 'Minor 1 (Sem I, III, V)' });
        if (reg.minor2) result.push({ ...base, semester: 'Semester II', subjectName: reg.minor2, semesterTag: 'Minor 2 (Sem II, IV, VI)' });
      } else if (category === 'MDC') {
        if (reg.mdc1) result.push({ ...base, semester: 'Semester I', subjectName: reg.mdc1, semesterTag: 'Sem I (MDC 1)' });
        if (reg.mdc2) result.push({ ...base, semester: 'Semester II', subjectName: reg.mdc2, semesterTag: 'Sem II (MDC 2)' });
        if (reg.mdc3) result.push({ ...base, semester: 'Semester III', subjectName: reg.mdc3, semesterTag: 'Sem III (MDC 3)' });
      } else if (category === 'AEC') {
        if (reg.aec1) result.push({ ...base, semester: 'Semester I', subjectName: reg.aec1, semesterTag: 'Sem I (AEC 1)' });
        if (reg.aec2) result.push({ ...base, semester: 'Semester II', subjectName: reg.aec2, semesterTag: 'Sem II (AEC 2)' });
      } else if (category === 'VAC') {
        const v1 = reg.vac1 || reg.sem1?.vac;
        const v2 = reg.vac2 || reg.sem3?.vac;
        const v3 = reg.sem5?.vac || 'UNDERSTANDING ODISHA';
        const v4 = reg.sem6?.vac || 'Creative Writing';
        if (v1) result.push({ ...base, semester: 'Semester I', subjectName: v1, semesterTag: 'Sem I (VAC 1)' });
        if (v2) result.push({ ...base, semester: 'Semester III', subjectName: v2, semesterTag: 'Sem III (VAC 2)' });
        if (v3) result.push({ ...base, semester: 'Semester V', subjectName: v3, semesterTag: 'Sem V (VAC 3)' });
        if (v4) result.push({ ...base, semester: 'Semester VI', subjectName: v4, semesterTag: 'Sem VI (VAC 4)' });
      } else if (category === 'SEC') {
        if (reg.sec1) result.push({ ...base, semester: 'Semester V', subjectName: reg.sec1, semesterTag: 'Sem V (SEC 1)' });
        if (reg.sec2) result.push({ ...base, semester: 'Semester V', subjectName: reg.sec2, semesterTag: 'Sem V (SEC 2)' });
        if (reg.sec3) result.push({ ...base, semester: 'Semester VI', subjectName: reg.sec3, semesterTag: 'Sem VI (SEC 3)' });
      }
    }
  });

  return result;
}

export function exportCategorySubjectExcel(
  records: StudentCounsellingRecord[],
  category: 'MINOR' | 'MDC' | 'AEC' | 'VAC' | 'SEC',
  academicYear: string = '2026-27'
) {
  const entries = extractSubjectAllocations(records, category);
  if (entries.length === 0) return;

  const wb = XLSX.utils.book_new();

  // Master sheet of all entries for this category
  const masterSheetData = entries.map((e, idx) => ({
    'Sl No': idx + 1,
    'Academic Session': e.academicYear,
    'Course Year': e.yearLabel,
    'Semester': e.semester,
    'College Roll': e.rollNo,
    'University Roll': e.universityRollNo,
    'SAMS Barcode': e.samsRegNo,
    'Student Name': e.studentName,
    'Stream': e.stream,
    'Parent Department': e.department,
    'Course Type': e.courseType,
    'Subject Category': e.category,
    'Allocated Subject': e.subjectName,
    'Semester / Module': e.semesterTag,
  }));

  const wsMaster = XLSX.utils.json_to_sheet(masterSheetData);
  XLSX.utils.book_append_sheet(wb, wsMaster, `All ${category} Allocations`);

  // Group by Subject Name for individual sub-sheets
  const subjectGroups: Record<string, SubjectAllocationEntry[]> = {};
  entries.forEach((e) => {
    const sName = e.subjectName.trim();
    if (sName) {
      if (!subjectGroups[sName]) subjectGroups[sName] = [];
      subjectGroups[sName].push(e);
    }
  });

  Object.entries(subjectGroups).forEach(([sName, sList]) => {
    const sheetTitle = sName.slice(0, 30).replace(/[:\\\/?*\[\]]/g, '_');
    const sheetData = sList.map((e, idx) => ({
      'Sl No': idx + 1,
      'Academic Session': e.academicYear,
      'Course Year': e.yearLabel,
      'Semester': e.semester,
      'College Roll': e.rollNo,
      'University Roll': e.universityRollNo,
      'SAMS Barcode': e.samsRegNo,
      'Student Name': e.studentName,
      'Stream': e.stream,
      'Parent Department': e.department,
      'Course Type': e.courseType,
      'Semester / Module': e.semesterTag,
    }));
    const ws = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, sheetTitle);
  });

  const cleanYear = academicYear.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `NEP2020_${category}_Subject_Roster_${cleanYear}.xlsx`);
}
