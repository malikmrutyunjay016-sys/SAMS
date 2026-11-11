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
      sem2: { major: dept, minor: '', mdc: '', aec: '', sec: '' },
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
      sem2: { major: dept, minor: '', mdc: '', aec: 'ENGLISH', sec: '' },
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
        const m1 = reg.minor1 || reg.sem1?.minor || reg.sem3?.minor || reg.sem5?.minor || '';
        const m2 = reg.minor2 || reg.sem2?.minor || reg.sem4?.minor || reg.sem6?.minor || '';
        if (m1) result.push({ ...base, semester: 'Semester I', subjectName: m1, semesterTag: 'Minor 1 (Sem I, III, V)' });
        if (m2) result.push({ ...base, semester: 'Semester II', subjectName: m2, semesterTag: 'Minor 2 (Sem II, IV, VI)' });
      } else if (category === 'MDC') {
        const d1 = reg.mdc1 || reg.sem1?.mdc || '';
        const d2 = reg.mdc2 || reg.sem2?.mdc || '';
        const d3 = reg.mdc3 || reg.sem3?.mdc || '';
        if (d1) result.push({ ...base, semester: 'Semester I', subjectName: d1, semesterTag: 'Sem I (MDC 1)' });
        if (d2) result.push({ ...base, semester: 'Semester II', subjectName: d2, semesterTag: 'Sem II (MDC 2)' });
        if (d3) result.push({ ...base, semester: 'Semester III', subjectName: d3, semesterTag: 'Sem III (MDC 3)' });
      } else if (category === 'AEC') {
        const a1 = reg.aec1 || reg.sem1?.aec || '';
        const a2 = reg.aec2 || reg.sem2?.aec || '';
        if (a1) result.push({ ...base, semester: 'Semester I', subjectName: a1, semesterTag: 'Sem I (AEC 1)' });
        if (a2) result.push({ ...base, semester: 'Semester II', subjectName: a2, semesterTag: 'Sem II (AEC 2)' });
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
        const s1 = reg.sec1 || reg.sem2?.sec || '';
        const s2 = reg.sec2 || reg.sem5?.sec || '';
        const s3 = reg.sec3 || reg.sem6?.sec || '';
        if (s1) result.push({ ...base, semester: 'Semester II', subjectName: s1, semesterTag: 'Sem II (SEC 1)' });
        if (s2) result.push({ ...base, semester: 'Semester V', subjectName: s2, semesterTag: 'Sem V (SEC 2)' });
        if (s3) result.push({ ...base, semester: 'Semester VI', subjectName: s3, semesterTag: 'Sem VI (SEC 3)' });
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

export interface CounsellingExcelImportResult {
  success: boolean;
  records: StudentCounsellingRecord[];
  matchedCount: number;
  unmatchedCount: number;
  newStudentsToCreate: Omit<Student, 'id' | 'updatedAt'>[];
  errors: string[];
  sheetNames: string[];
  detectedColumns?: Record<string, string>;
  headers?: { index: number; label: string }[];
  colIndices?: Record<string, number>;
}

function cleanCellStr(val: any): string {
  if (val === null || val === undefined) return '';
  const s = String(val).replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  const sLow = s.toLowerCase();
  if (
    s === '-' ||
    s === '--' ||
    s === '---' ||
    sLow === 'n/a' ||
    sLow === 'na' ||
    sLow === 'n/a (regular)' ||
    sLow === 'n/a (aedp)' ||
    sLow === 'nil' ||
    sLow === 'none' ||
    sLow === 'null' ||
    sLow === 'undefined'
  ) {
    return '';
  }
  return s;
}

export function cleanSubjectValue(val: any): string {
  if (val === null || val === undefined) return '';
  let s = String(val).replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  const sLow = s.toLowerCase();
  if (
    s === '-' ||
    s === '--' ||
    s === '---' ||
    sLow === 'n/a' ||
    sLow === 'na' ||
    sLow === 'n/a (regular)' ||
    sLow === 'n/a (aedp)' ||
    sLow === 'nil' ||
    sLow === 'none' ||
    sLow === 'null' ||
    sLow === 'undefined'
  ) {
    return '';
  }
  // Strip leading numbering e.g. "1. ", "01. ", "(1) "
  s = s.replace(/^\s*(?:\(?\d+\)?[\.\:\-\)]|\d+\s*[\.\:\-])\s*/, '');

  // Strip paper category prefixes if separated by colon or dash e.g.
  // "SEC -1 (Skill Enhancement Course) 2nd Sem: Communicative English"
  // "Core-II (Minor-I): Political Science"
  // "Core-III (Minor-II): History"
  s = s.replace(/^\s*(?:core|minor|sec|secc|mdc|aec|vac|major|skill\s*enhancement)[\w\s\-\.\(\)\/]{0,80}[:]\s*/i, '');

  // Or if separated by dash e.g. "Minor-I - Political Science" or "Core-II - Political Science"
  s = s.replace(/^\s*(?:core\s*[-:.\s]*(?:i|ii|iii|iv|1|2|3|4)\b(?:\s*\([^)]*\))?|minor\s*[-:.\s]*(?:i|ii|1|2)\b|sec(?:c)?\s*[-:.\s]*(?:i|ii|iii|1|2|3)\b(?:\s*\([^)]*\))?|mdc\s*[-:.\s]*(?:1|2|3)\b|aec\s*[-:.\s]*(?:1|2)\b|vac\s*[-:.\s]*(?:1|2|3|4)\b)\s*[-]\s*/i, '');

  // Strip isolated outer parentheses if wrapped, e.g. "(Political Science)" -> "Political Science"
  if (s.startsWith('(') && s.endsWith(')')) {
    s = s.slice(1, -1).trim();
  }
  // Strip trailing credit annotations e.g. "(4 Credits)", "[4 Credits]"
  s = s.replace(/\s*[\(\[]\s*\d+\s*(?:credit|cr|credits)\s*[\)\]]$/i, '').trim();

  return s;
}

export function normalizeLookupKey(val?: string | null): string {
  return (val || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function normalizeRollLookupKey(val?: string | null): string {
  // Normalizes e.g. "BA26-001" and "BA26-1" to "ba261" for fallback matching
  return normalizeLookupKey(val).replace(/([a-z]+\d{2})0+(\d+)/, '$1$2');
}

/**
 * Normalizes dashes (en-dash, em-dash, minus, non-breaking hyphen), newlines, and extra spaces in a header string.
 */
export function normalizeHeaderStr(header: string): string {
  return String(header || '')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, '-')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips semester annotations like "(Sem I, III, V)", "(Sem II)", "2nd Sem", "5th Sem", "6th Sem", "Sem-2", "Semester VI"
 * from a header string so that semester numbers (II, III, IV, V, VI, 2, 5, 6)
 * are never confused with paper numbers (Minor 1 vs Minor 2, SEC 1 vs SEC 2 vs SEC 3).
 */
export function stripSemesterPart(header: string): string {
  return normalizeHeaderStr(header)
    .replace(/\([^)]*sem[^)]*\)/gi, ' ')
    .replace(/\[[^\]]*sem[^\]]*\]/gi, ' ')
    .replace(/\bsem(?:ester)?\s*[-:.\s]*([ivx1-6]+(?:\s*[,/&and]+\s*[ivx1-6]+)*)/gi, ' ')
    .replace(/\b([1-6](?:st|nd|rd|th))\s*sem(?:ester)?\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRomanOrDigitToken(tok: string): number | null {
  const t = tok.toLowerCase().trim();
  if (t === '1' || t === 'i' || t === '1st' || t === 'one' || t === 'first') return 1;
  if (t === '2' || t === 'ii' || t === '2nd' || t === 'two' || t === 'second') return 2;
  if (t === '3' || t === 'iii' || t === '3rd' || t === 'three' || t === 'third') return 3;
  if (t === '4' || t === 'iv' || t === '4th' || t === 'four' || t === 'fourth') return 4;
  return null;
}

export function isMinor1Header(h: string): boolean {
  const norm = normalizeHeaderStr(h).toLowerCase().replace(/[\u2010-\u2015\u2212]/g, '-');
  if (!norm || norm.includes('minority')) return false;
  // Guard against Core-III or Minor-II or Minor 2
  if (/\b(?:core\s*[-:.\s]*(?:iii|3|3rd)|minor\s*[-:.\s]*(?:ii|2|2nd)|min\s*[-:.\s]*(?:ii|2|2nd))\b/i.test(norm)) {
    return false;
  }
  return (
    /\b(?:core\s*[-:.\s]*(?:ii|2|2nd)|minor\s*[-:.\s]*(?:i|1|1st)|min\s*[-:.\s]*(?:i|1|1st))\b/i.test(norm) ||
    norm === 'minor' ||
    norm === 'minor 1' ||
    norm === 'minor-1' ||
    norm === 'minor i' ||
    norm === 'minor-i' ||
    norm === 'minor subject' ||
    norm === 'minor paper'
  );
}

export function isMinor2Header(h: string): boolean {
  const norm = normalizeHeaderStr(h).toLowerCase().replace(/[\u2010-\u2015\u2212]/g, '-');
  if (!norm || norm.includes('minority')) return false;
  return (
    /\b(?:core\s*[-:.\s]*(?:iii|3|3rd)|minor\s*[-:.\s]*(?:ii|2|2nd)|min\s*[-:.\s]*(?:ii|2|2nd))\b/i.test(norm) ||
    norm === 'minor 2' ||
    norm === 'minor-2' ||
    norm === 'minor ii' ||
    norm === 'minor-ii'
  );
}

export function isSec1Header(h: string): boolean {
  const norm = normalizeHeaderStr(h).toLowerCase().replace(/[\u2010-\u2015\u2212]/g, '-');
  if (!isSecHeader(norm) && !norm.includes('skill enhancement')) return false;
  // Guard against sec 2 or sec 3 or 5th sem or 6th sem
  if (/\b(?:sec(?:c)?\s*[-:.\s]*(?:ii|iii|2|3|2nd|3rd)|5th\s*sem|6th\s*sem)\b/i.test(norm)) {
    return false;
  }
  return (
    /\b(?:sec(?:c)?\s*[-:.\s]*(?:i|1|1st)|skill\s*enhancement.*(?:1|i|1st|2nd\s*sem))\b/i.test(norm) ||
    (/\b2nd\s*sem\b/i.test(norm) && (norm.includes('sec') || norm.includes('skill enhancement'))) ||
    norm === 'sec 1' ||
    norm === 'sec-1' ||
    norm === 'sec-i' ||
    norm === 'sec i' ||
    norm === 'sec1'
  );
}

export function isSec2Header(h: string): boolean {
  const norm = normalizeHeaderStr(h).toLowerCase().replace(/[\u2010-\u2015\u2212]/g, '-');
  if (!isSecHeader(norm) && !norm.includes('skill enhancement')) return false;
  // Guard against sec 1 or sec 3 or 2nd sem or 6th sem
  if (/\b(?:sec(?:c)?\s*[-:.\s]*(?:i|iii|1|3|1st|3rd)|2nd\s*sem|6th\s*sem)\b/i.test(norm)) {
    return false;
  }
  return (
    /\b(?:sec(?:c)?\s*[-:.\s]*(?:ii|2|2nd)|skill\s*enhancement.*(?:2|ii|2nd|5th\s*sem))\b/i.test(norm) ||
    (/\b5th\s*sem\b/i.test(norm) && (norm.includes('sec') || norm.includes('skill enhancement'))) ||
    norm === 'sec 2' ||
    norm === 'sec-2' ||
    norm === 'sec-ii' ||
    norm === 'sec ii' ||
    norm === 'sec2'
  );
}

export function isSec3Header(h: string): boolean {
  const norm = normalizeHeaderStr(h).toLowerCase().replace(/[\u2010-\u2015\u2212]/g, '-');
  if (!isSecHeader(norm) && !norm.includes('skill enhancement')) return false;
  // Guard against sec 1 or sec 2 or 2nd sem or 5th sem
  if (/\b(?:sec(?:c)?\s*[-:.\s]*(?:i|ii|1|2|1st|2nd)|2nd\s*sem|5th\s*sem)\b/i.test(norm)) {
    return false;
  }
  return (
    /\b(?:sec(?:c)?\s*[-:.\s]*(?:iii|3|3rd)|skill\s*enhancement.*(?:3|iii|3rd|6th\s*sem))\b/i.test(norm) ||
    (/\b6th\s*sem\b/i.test(norm) && (norm.includes('sec') || norm.includes('skill enhancement'))) ||
    norm === 'sec 3' ||
    norm === 'sec-3' ||
    norm === 'sec-iii' ||
    norm === 'sec iii' ||
    norm === 'sec3'
  );
}

/**
 * Extracts the paper index (1, 2, 3, or 4) specifically associated with a given NEP 2020 category.
 */
export function extractCategoryPaperIndex(
  header: string,
  category: 'minor' | 'sec' | 'mdc' | 'aec' | 'vac' | 'major'
): number | null {
  const norm = normalizeHeaderStr(header).toLowerCase().replace(/[\u2010-\u2015\u2212]/g, '-');
  const cleaned = stripSemesterPart(norm);

  if (category === 'minor') {
    if (!isMinorHeader(norm)) return null;
    if (isMinor2Header(norm)) return 2;
    if (isMinor1Header(norm)) return 1;
    return extractPaperIndex(cleaned);
  }

  if (category === 'sec') {
    if (!isSecHeader(norm) && !norm.includes('skill enhancement')) return null;
    if (isSec3Header(norm)) return 3;
    if (isSec2Header(norm)) return 2;
    if (isSec1Header(norm)) return 1;
    return extractPaperIndex(cleaned);
  }

  if (category === 'major') {
    if (!norm.includes('major') && !norm.includes('honours') && !/\bcore\b/i.test(norm)) return null;
    const majorMatch = cleaned.match(
      /\b(?:major|maj)(?:\s*(?:paper|course|subject))?\s*[-:.\s#()]*\b(ii|i|2nd|1st|2|1|two|one|second|first)\b/i
    );
    if (majorMatch) {
      return parseRomanOrDigitToken(majorMatch[1]);
    }
    if (/\bcore\s*[-:.\s]*(i|1|1st)\b/i.test(cleaned) && !/\bcore\s*[-:.\s]*(ii|iii|2|3)\b/i.test(cleaned)) {
      return 1;
    }
    return extractPaperIndex(cleaned);
  }

  if (category === 'mdc' && !isMdcHeader(norm)) return null;
  if (category === 'aec' && !isAecHeader(norm)) return null;
  if (category === 'vac' && !isVacHeader(norm)) return null;

  const kwPattern =
    category === 'mdc'
      ? '(?:mdc|m\\.d\\.c\\.?|multi\\s*[-]?disciplinary(?:\\s*course)?)'
      : category === 'aec'
      ? '(?:aec|aecc|a\\.e\\.c\\.?|ability\\s*enhancement(?:\\s*course)?|mil)'
      : '(?:vac|v\\.a\\.c\\.?|value\\s*[-]?added(?:\\s*course)?)';

  const directRegex = new RegExp(
    `\\b${kwPattern}(?:\\s*(?:paper|course|subject))?\\s*[-:.\\s#()]*\\b(iv|iii|ii|i|4th|3rd|2nd|1st|4|3|2|1|four|three|two|one|fourth|third|second|first)\\b`,
    'i'
  );
  const directMatch = cleaned.match(directRegex);
  if (directMatch) {
    return parseRomanOrDigitToken(directMatch[1]);
  }

  const attachedRegex = new RegExp(`\\b(?:${category}|secc|aecc)([1-4])\\b`, 'i');
  const attachedMatch = cleaned.match(attachedRegex);
  if (attachedMatch) {
    return parseInt(attachedMatch[1], 10);
  }

  return extractPaperIndex(cleaned);
}

/**
 * Extracts a generic paper index (1, 2, 3, or 4) from a header string after stripping semester annotations.
 */
function extractPaperIndex(header: string): number | null {
  const cleaned = stripSemesterPart(header).toLowerCase();

  // Check explicit 4 / IV / 4th
  if (/(?:^|[^a-z0-9])(4|iv|4th|four|fourth|paper\s*4|paper\s*iv)(?:$|[^a-z0-9])/i.test(cleaned)) {
    return 4;
  }
  // Check explicit 3 / III / 3rd
  if (/(?:^|[^a-z0-9])(3|iii|3rd|three|third|paper\s*3|paper\s*iii)(?:$|[^a-z0-9])/i.test(cleaned)) {
    return 3;
  }
  // Check explicit 2 / II / 2nd
  if (/(?:^|[^a-z0-9])(2|ii|2nd|two|second|paper\s*2|paper\s*ii)(?:$|[^a-z0-9])/i.test(cleaned)) {
    return 2;
  }
  // Check explicit 1 / I / 1st
  if (/(?:^|[^a-z0-9])(1|i|1st|one|first|paper\s*1|paper\s*i)(?:$|[^a-z0-9])/i.test(cleaned)) {
    return 1;
  }
  // Also handle attached digits like "minor1", "minor2", "sec1", "sec2", "sec3", "mdc1", "aec1", "vac1"
  const attachedMatch = cleaned.match(/\b(?:minor|min|mnr|sec|secc|mdc|aec|vac|major|maj)([1-4])\b/i);
  if (attachedMatch) {
    return parseInt(attachedMatch[1], 10);
  }
  return null;
}

export function isMinorHeader(h: string): boolean {
  const norm = normalizeHeaderStr(h).toLowerCase().replace(/[\u2010-\u2015\u2212]/g, '-');
  if (!norm || norm.includes('minority')) return false;
  return (
    /\bminor\b/i.test(norm) ||
    /\bminor[12]\b/i.test(norm) ||
    /\bmin\s*[-:.\s]*[12i]+\b/i.test(norm) ||
    /\bmnr\s*[-:.\s]*[12i]*\b/i.test(norm) ||
    /\bcore\s*[-:.\s]*(ii|iii|2|3|2nd|3rd)\b/i.test(norm)
  );
}

export function isSecHeader(h: string): boolean {
  const norm = normalizeHeaderStr(h).toLowerCase().replace(/[\u2010-\u2015\u2212]/g, '-');
  if (!norm) return false;
  if (norm.includes('section') || norm.includes('secured') || norm.includes('secondary') || norm.includes('secret')) {
    return false;
  }
  return (
    /\bsec\b/i.test(norm) ||
    /\bsec[123]\b/i.test(norm) ||
    /\bsecc\b/i.test(norm) ||
    /\bsecc[123]\b/i.test(norm) ||
    /\bs\.e\.c\.?\b/i.test(norm) ||
    norm.includes('skill enhancement')
  );
}

export function isMdcHeader(h: string): boolean {
  const norm = normalizeHeaderStr(h).toLowerCase().replace(/[\u2010-\u2015\u2212]/g, '-');
  if (!norm) return false;
  return (
    /\bmdc\b/i.test(norm) ||
    /\bmdc[123]\b/i.test(norm) ||
    /\bm\.d\.c\.?\b/i.test(norm) ||
    norm.includes('multidisciplinary') ||
    norm.includes('multi disciplinary') ||
    norm.includes('multi-disciplinary')
  );
}

export function isAecHeader(h: string): boolean {
  const norm = normalizeHeaderStr(h).toLowerCase().replace(/[\u2010-\u2015\u2212]/g, '-');
  if (!norm) return false;
  return (
    /\baec\b/i.test(norm) ||
    /\baec[12]\b/i.test(norm) ||
    /\baecc\b/i.test(norm) ||
    /\ba\.e\.c\.?\b/i.test(norm) ||
    norm.includes('ability enhancement') ||
    /\bmil\b/i.test(norm)
  );
}

export function isVacHeader(h: string): boolean {
  const norm = normalizeHeaderStr(h).toLowerCase().replace(/[\u2010-\u2015\u2212]/g, '-');
  if (!norm || norm.includes('vacant') || norm.includes('vacancy')) return false;
  return (
    /\bvac\b/i.test(norm) ||
    /\bvac[1234]\b/i.test(norm) ||
    /\bv\.a\.c\.?\b/i.test(norm) ||
    norm.includes('value added') ||
    norm.includes('value-added')
  );
}

/**
 * Parses an uploaded Excel (.xlsx/.xls) or CSV file containing student subject counselling allocations
 * and maps them to existing students (or prepares records for unmatched students).
 */
export async function parseCounsellingExcelFile(
  file: File,
  existingStudents: Student[],
  existingMap: Record<string, StudentCounsellingRecord> = {},
  defaultSession: string = '2026-27',
  customColMap?: Partial<Record<string, number>>
): Promise<CounsellingExcelImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetNames = workbook.SheetNames || [];

        if (sheetNames.length === 0) {
          resolve({
            success: false,
            records: [],
            matchedCount: 0,
            unmatchedCount: 0,
            newStudentsToCreate: [],
            errors: ['The uploaded Excel workbook contains no sheets.'],
            sheetNames: [],
          });
          return;
        }

        // Build fast lookup maps for existing students.
        // Prioritize students matching defaultSession so if there are duplicate roll patterns across years, the target session wins.
        const sortedStudents = [...existingStudents].sort((a, b) => {
          const aMatch = (a.academicYear || '2026-27') === defaultSession ? 1 : 0;
          const bMatch = (b.academicYear || '2026-27') === defaultSession ? 1 : 0;
          return aMatch - bMatch; // Later entries overwrite earlier entries in Map.set, so defaultSession is set last (wins)
        });

        const byRoll = new Map<string, Student>();
        const byRollNormalized = new Map<string, Student>();
        const bySams = new Map<string, Student>();
        const byUnivRoll = new Map<string, Student>();
        const byNameDept = new Map<string, Student>();
        const byName = new Map<string, Student[]>();

        sortedStudents.forEach((stu) => {
          const rKey = normalizeLookupKey(stu.rollNo);
          if (rKey) {
            byRoll.set(rKey, stu);
            byRollNormalized.set(normalizeRollLookupKey(stu.rollNo), stu);
          }

          const sKey = normalizeLookupKey(stu.samsRegNo);
          if (sKey) bySams.set(sKey, stu);

          const uKey = normalizeLookupKey(stu.universityRollNo || '');
          if (uKey && uKey !== 'na') byUnivRoll.set(uKey, stu);

          const nKey = normalizeLookupKey(stu.name);
          const dKey = normalizeLookupKey(stu.department);
          if (nKey) {
            if (dKey) byNameDept.set(`${nKey}_${dKey}`, stu);
            const arr = byName.get(nKey) || [];
            arr.push(stu);
            byName.set(nKey, arr);
          }
        });

        const parsedMap = new Map<string, StudentCounsellingRecord>();
        const newStudentsToCreate: Omit<Student, 'id' | 'updatedAt'>[] = [];
        let matchedCount = 0;
        let unmatchedCount = 0;
        let lastDetectedColumns: Record<string, string> = {};
        let lastHeaders: { index: number; label: string }[] = [];
        let lastColIndices: Record<string, number> = {};

        for (const sheetName of sheetNames) {
          const sheet = workbook.Sheets[sheetName];
          if (!sheet) continue;

          const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
          if (!rows || rows.length < 2) continue;

          // 1. Expand merged cells in the top 20 rows so multi-column merged group headers
          // (like "Minor" merged across 2 cols, or "SEC" merged across 3 cols) populate every merged cell!
          const merges = sheet['!merges'] || [];
          merges.forEach((m: any) => {
            if (m.s.r < 20 && m.e.r < 20) {
              const startVal = rows[m.s.r]?.[m.s.c];
              if (startVal !== undefined && startVal !== '') {
                for (let r = m.s.r; r <= m.e.r; r++) {
                  if (!rows[r]) continue;
                  for (let c = m.s.c; c <= m.e.c; c++) {
                    if (rows[r][c] === '' || rows[r][c] === undefined || rows[r][c] === null) {
                      rows[r][c] = startVal;
                    }
                  }
                }
              }
            }
          });

          // 2. Detect primary header row within first 15 rows
          let headerRowIdx = 0;
          let bestScore = -1;
          const headerKeywords = [
            'roll', 'barcode', 'sams', 'name', 'student', 'major', 'minor',
            'core', 'mdc', 'aec', 'vac', 'sec', 'skill enhancement', 'stream', 'honours', 'subject', 'sem'
          ];

          for (let rIdx = 0; rIdx < Math.min(15, rows.length); rIdx++) {
            const row = rows[rIdx];
            if (!Array.isArray(row)) continue;
            let score = 0;
            row.forEach((cell) => {
              const cLow = normalizeHeaderStr(String(cell || '')).toLowerCase();
              if (!cLow) return;
              if (headerKeywords.some((kw) => cLow.includes(kw))) {
                score++;
              }
            });
            if (score > bestScore) {
              bestScore = score;
              headerRowIdx = rIdx;
            }
          }

          if (bestScore < 2) continue;

          // 3. Check if there is a sub-header row immediately below headerRowIdx
          // (e.g., Row 1 has "Minor | | MDC | | | SEC | |", Row 2 has "1 | 2 | 1 | 2 | 3 | 1 | 2 | 3" or "Minor 1 | Minor 2 | ...")
          // OR if headerRowIdx > 0 and the row above has parent category headers.
          let dataStartRowIdx = headerRowIdx + 1;
          const maxCols = Math.max(
            rows[headerRowIdx]?.length || 0,
            rows[headerRowIdx + 1]?.length || 0,
            rows[headerRowIdx > 0 ? headerRowIdx - 1 : 0]?.length || 0
          );

          const isSubHeaderRow = (rIdx: number): boolean => {
            const r = rows[rIdx];
            if (!Array.isArray(r)) return false;
            const nonEmpty = r.map((c) => normalizeHeaderStr(cleanCellStr(c)).toLowerCase()).filter(Boolean);
            if (nonEmpty.length === 0) return false;
            // If it contains a SAMS barcode (e.g. 26D... or 24D...) or a roll number pattern (e.g. BA26-001, BS26-001), it's a data row, not a sub-header!
            const hasStudentIdData = nonEmpty.some(
              (c) => /^2[3-7][a-z]\d{4,}/i.test(c) || /^b[asc]\d{2}[-_]?\d+/i.test(c)
            );
            if (hasStudentIdData) return false;

            const subHeaderTokenMatches = nonEmpty.filter((c) => {
              const unparen = c.replace(/^\(+|\)+$/g, '').trim();
              return (
                /^(1|2|3|4|i|ii|iii|iv|v|vi|1st|2nd|3rd|4th|paper\s*[1-4]|paper\s*[i-v]+)$/i.test(unparen) ||
                /\b(?:minor|sec|secc|mdc|aec|vac|major|core|skill\s*enhancement)\b/i.test(unparen) ||
                /\bsem(?:ester)?\s*[-:.\s]*[1-6i-v]+\b/i.test(unparen) ||
                /\b[1-6](?:st|nd|rd|th)\s*sem\b/i.test(unparen)
              );
            });
            return subHeaderTokenMatches.length >= 2;
          };

          const hasSubHeaderBelow =
            headerRowIdx + 1 < rows.length && isSubHeaderRow(headerRowIdx + 1);
          if (hasSubHeaderBelow) {
            dataStartRowIdx = headerRowIdx + 2;
          }

          // Carry forward category group headers in headerRowIdx if a sub-header row exists below
          // (Handles unmerged parent headers where Row 1 has "Minor" in col K, "" in col K+1, and Row 2 has "1" in col K, "2" in col K+1)
          const topRowCells: string[] = [];
          let lastGroupHeader = '';
          for (let c = 0; c < maxCols; c++) {
            const rawTop = normalizeHeaderStr(cleanCellStr(rows[headerRowIdx]?.[c]));
            const rawSub = hasSubHeaderBelow ? normalizeHeaderStr(cleanCellStr(rows[headerRowIdx + 1]?.[c])) : '';
            if (rawTop) {
              topRowCells[c] = rawTop;
              const lowTop = rawTop.toLowerCase();
              if (
                isMinorHeader(lowTop) ||
                isSecHeader(lowTop) ||
                isMdcHeader(lowTop) ||
                isAecHeader(lowTop) ||
                isVacHeader(lowTop) ||
                lowTop.includes('major') ||
                lowTop.includes('sem')
              ) {
                lastGroupHeader = rawTop;
              } else {
                lastGroupHeader = '';
              }
            } else if (hasSubHeaderBelow && rawSub && lastGroupHeader) {
              topRowCells[c] = lastGroupHeader;
            } else {
              topRowCells[c] = '';
              if (!rawSub) lastGroupHeader = '';
            }
          }

          // Also check if headerRowIdx > 0 and row above (headerRowIdx - 1) has a direct group header cell in the same column
          // Note: merged cells were already expanded in Step 1, so we never carry unmerged text across unrelated columns.
          const parentRowAboveIdx = headerRowIdx > 0 ? headerRowIdx - 1 : -1;
          const parentAboveCells: string[] = [];
          if (parentRowAboveIdx >= 0 && Array.isArray(rows[parentRowAboveIdx])) {
            for (let c = 0; c < maxCols; c++) {
              const pVal = normalizeHeaderStr(cleanCellStr(rows[parentRowAboveIdx]?.[c]));
              if (pVal && pVal.length < 35) {
                parentAboveCells[c] = pVal;
              } else {
                parentAboveCells[c] = '';
              }
            }
          }

          // Build primary headers (from headerRowIdx) and combined normalized headers for each column
          const primaryHeaders: string[] = [];
          const rawHeaders: string[] = [];
          const displayHeaders: { index: number; label: string }[] = [];

          for (let c = 0; c < maxCols; c++) {
            const pAbove = parentAboveCells[c] || '';
            const mainH = topRowCells[c] || '';
            const subH = hasSubHeaderBelow ? normalizeHeaderStr(cleanCellStr(rows[headerRowIdx + 1]?.[c])) : '';

            primaryHeaders[c] = mainH.toLowerCase();

            const mainAlreadyHasCategory =
              isMinorHeader(mainH) ||
              isSecHeader(mainH) ||
              isMdcHeader(mainH) ||
              isAecHeader(mainH) ||
              isVacHeader(mainH) ||
              /\b(?:major|core|roll|barcode|sams|name|stream|session)\b/i.test(mainH);

            const parts: string[] = [];
            // Only prepend parent row above if the main header doesn't already specify its own category
            if (pAbove && !mainAlreadyHasCategory && !mainH.toLowerCase().includes(pAbove.toLowerCase())) {
              parts.push(pAbove);
            }
            if (mainH) {
              parts.push(mainH);
            }
            if (subH && subH.toLowerCase() !== mainH.toLowerCase()) {
              parts.push(subH);
            }

            const combined = normalizeHeaderStr(parts.join(' '));
            rawHeaders[c] = combined.toLowerCase();
            if (combined) {
              displayHeaders.push({ index: c, label: combined });
            } else {
              // Check if column has data in first few data rows
              const sampleHasData = rows
                .slice(dataStartRowIdx, dataStartRowIdx + 10)
                .some((r) => Array.isArray(r) && cleanCellStr(r[c]) !== '');
              if (sampleHasData) {
                displayHeaders.push({ index: c, label: `Column ${c + 1} (Unlabeled)` });
              }
            }
          }

          // Map column indices: check primary header cell first, then combined header cell
          const findCol = (predicates: ((h: string, idx: number) => boolean)[], excludeIndices: number[] = []): number => {
            for (const pred of predicates) {
              // First check primaryHeaders (when there is no sub-header row that refines paper index)
              if (!hasSubHeaderBelow) {
                const pIdx = primaryHeaders.findIndex((h, i) => h && !excludeIndices.includes(i) && pred(h, i));
                if (pIdx !== -1) return pIdx;
              }
              const idx = rawHeaders.findIndex((h, i) => h && !excludeIndices.includes(i) && pred(h, i));
              if (idx !== -1) return idx;
            }
            return -1;
          };

          const colRoll = findCol([
            (h) => h === 'roll number' || h === 'college roll' || h === 'roll no' || h === 'rollno' || h === 'college roll number' || h === 'roll_no' || h === 'college roll no' || h === 'roll no.',
            (h) => h.includes('roll') && !h.includes('univ') && !h.includes('exam'),
          ]);
          const colUnivRoll = findCol([
            (h) => h === 'univ roll no' || h === 'university roll' || h === 'university roll number' || h === 'univ roll' || h === 'university roll no',
            (h) => h.includes('univ') && h.includes('roll'),
          ]);
          const colBarcode = findCol([
            (h) => h === 'sams barcode' || h === 'barcode' || h === 'barcode number' || h === 'sams reg' || h === 'sams reg no' || h === 'barcode no',
            (h) => h.includes('barcode') || h.includes('sams') || h.includes('caf'),
          ]);
          const colName = findCol([
            (h) => h === 'student name' || h === 'name' || h === 'applicant name' || h === 'candidate name' || h === 'name of the student',
            (h) => h.includes('student') && h.includes('name'),
            (h) => h.includes('name') && !h.includes('father') && !h.includes('mother') && !h.includes('parent') && !h.includes('counselor') && !h.includes('subject'),
          ]);
          const colStream = findCol([
            (h) => h === 'stream' || h === 'faculty',
            (h) => h.includes('stream'),
          ]);
          const colSession = findCol([
            (h) => h === 'admission session' || h === 'academic session' || h === 'session' || h === 'academic year' || h === 'batch' || h === 'admission year',
            (h) => h.includes('session') || h.includes('academic year') || h.includes('batch'),
          ]);
          const colCourseType = findCol([
            (h) => h === 'course type' || h === 'course' || h === 'programme',
            (h) => h.includes('course type'),
          ]);

          // Major 1 & Major 2 (also supports "Core-I" / "Core-I (Major)" / "Core-I (Honours)")
          const isMajor1Header = (h: string): boolean => {
            const norm = normalizeHeaderStr(h).toLowerCase().replace(/[\u2010-\u2015\u2212]/g, '-');
            if (isMinorHeader(norm)) return false;
            if (
              norm === 'major' ||
              norm === 'major 1' ||
              norm === 'major-1' ||
              norm === 'major i' ||
              norm === 'major-i' ||
              norm === 'core-i' ||
              norm === 'core i' ||
              norm === 'core-1' ||
              norm === 'core 1' ||
              norm === 'major (honours)' ||
              norm === 'major 1 (specialization)' ||
              norm === 'honours' ||
              norm === 'honours subject' ||
              norm === 'department' ||
              norm === 'core' ||
              norm === 'subject name'
            ) {
              return true;
            }
            if (/\bcore\s*[-:.\s]*(?:i|1|1st)\b/i.test(norm) && !/\bcore\s*[-:.\s]*(?:ii|iii|2|3)\b/i.test(norm)) {
              return true;
            }
            if (norm.startsWith('major 1') || norm.startsWith('major-1') || norm.startsWith('major i')) {
              return true;
            }
            return (norm.includes('major') || norm.includes('honours')) && extractCategoryPaperIndex(norm, 'major') !== 2;
          };

          const colMajor1 = findCol([
            (h) => isMajor1Header(h),
          ]);
          const colMajor2 = findCol(
            [
              (h) => h === 'major 2' || h === 'major-2' || h === 'major ii' || h === 'major-ii' || h.startsWith('major 2') || h.startsWith('major-2'),
              (h) => h.includes('major') && !isMinorHeader(h) && extractCategoryPaperIndex(h, 'major') === 2,
            ],
            colMajor1 !== -1 ? [colMajor1] : []
          );

          // Collect all columns belonging to each NEP 2020 category in left-to-right order
          const allMinorCols = rawHeaders
            .map((h, idx) => (isMinorHeader(h) ? idx : -1))
            .filter((idx) => idx !== -1);
          const allSecCols = rawHeaders
            .map((h, idx) => (isSecHeader(h) || h.includes('skill enhancement') ? idx : -1))
            .filter((idx) => idx !== -1);
          const allMdcCols = rawHeaders
            .map((h, idx) => (isMdcHeader(h) ? idx : -1))
            .filter((idx) => idx !== -1);
          const allAecCols = rawHeaders
            .map((h, idx) => (isAecHeader(h) ? idx : -1))
            .filter((idx) => idx !== -1);
          const allVacCols = rawHeaders
            .map((h, idx) => (isVacHeader(h) ? idx : -1))
            .filter((idx) => idx !== -1);

          // --- MINOR 1 ("Core-II (Minor-I)") & MINOR 2 ("Core-III (Minor-II)") DETECTION ---
          let colMinor1 = findCol([
            // 1. Direct match for exact user header "Core-II (Minor-I)" or "Core-II" or "Minor-I" / "Minor 1"
            (h) => isMinor1Header(h),
            // 2. Category paper index 1
            (h) => isMinorHeader(h) && extractCategoryPaperIndex(h, 'minor') === 1,
            // 3. Semester-based Minor 1 (Sem I / Sem III / Sem V)
            (h) => isMinorHeader(h) && !isMinor2Header(h) && /\bsem(?:ester)?\s*[-:.\s]*(1|i|1st|3|iii|3rd|5|v|5th)\b/i.test(h),
            // 4. Bare "minor" header
            (h) => (h === 'minor' || h === 'minor subject' || h === 'minor paper') && !isMinor2Header(h),
          ]);
          if (colMinor1 === -1 && allMinorCols.length >= 1) {
            colMinor1 = allMinorCols[0];
          }

          let colMinor2 = findCol(
            [
              // 1. Direct match for exact user header "Core-III (Minor-II)" or "Core-III" or "Minor-II" / "Minor 2"
              (h) => isMinor2Header(h),
              // 2. Category paper index 2
              (h) => isMinorHeader(h) && extractCategoryPaperIndex(h, 'minor') === 2,
              // 3. Semester-based Minor 2 (Sem II / Sem IV / Sem VI)
              (h) => isMinorHeader(h) && !isMinor1Header(h) && /\bsem(?:ester)?\s*[-:.\s]*(2|ii|2nd|4|iv|4th|6|vi|6th)\b/i.test(h),
            ],
            colMinor1 !== -1 ? [colMinor1] : []
          );
          // Positional fallback: if there are 2+ Minor columns, pick the second one!
          if (colMinor2 === -1 && allMinorCols.length >= 2) {
            const secondMinor = allMinorCols.find((idx) => idx !== colMinor1);
            if (secondMinor !== undefined) colMinor2 = secondMinor;
          }
          // Unmerged blank adjacent header fallback: if colMinor1 + 1 has an empty header "" and contains data, it's the 2nd Minor column!
          if (colMinor2 === -1 && colMinor1 !== -1 && rawHeaders[colMinor1 + 1] === '') {
            const nextIdx = colMinor1 + 1;
            const hasValuesInNextCol = rows
              .slice(dataStartRowIdx, dataStartRowIdx + 20)
              .some((r) => Array.isArray(r) && cleanCellStr(r[nextIdx]) !== '');
            if (hasValuesInNextCol) {
              colMinor2 = nextIdx;
            }
          }

          // --- MDC 1, MDC 2, MDC 3 DETECTION ---
          let colMdc1 = findCol([
            (h) => isMdcHeader(h) && extractCategoryPaperIndex(h, 'mdc') === 1,
            (h) => isMdcHeader(h) && /\bsem(?:ester)?\s*[-:.\s]*(1|i|1st)\b/i.test(h),
            (h) => h === 'mdc' || h === 'mdc subject',
          ]);
          if (colMdc1 === -1 && allMdcCols.length >= 1) colMdc1 = allMdcCols[0];

          let colMdc2 = findCol(
            [
              (h) => isMdcHeader(h) && extractCategoryPaperIndex(h, 'mdc') === 2,
              (h) => isMdcHeader(h) && /\bsem(?:ester)?\s*[-:.\s]*(2|ii|2nd)\b/i.test(h),
            ],
            colMdc1 !== -1 ? [colMdc1] : []
          );
          if (colMdc2 === -1 && allMdcCols.length >= 2) {
            const nextMdc = allMdcCols.find((idx) => idx !== colMdc1);
            if (nextMdc !== undefined) colMdc2 = nextMdc;
          }
          if (colMdc2 === -1 && colMdc1 !== -1 && rawHeaders[colMdc1 + 1] === '') {
            const nextIdx = colMdc1 + 1;
            if (rows.slice(dataStartRowIdx, dataStartRowIdx + 20).some((r) => Array.isArray(r) && cleanCellStr(r[nextIdx]) !== '')) {
              colMdc2 = nextIdx;
            }
          }

          let colMdc3 = findCol(
            [
              (h) => isMdcHeader(h) && extractCategoryPaperIndex(h, 'mdc') === 3,
              (h) => isMdcHeader(h) && /\bsem(?:ester)?\s*[-:.\s]*(3|iii|3rd)\b/i.test(h),
            ],
            [colMdc1, colMdc2].filter((x) => x !== -1)
          );
          if (colMdc3 === -1 && allMdcCols.length >= 3) {
            const nextMdc = allMdcCols.find((idx) => idx !== colMdc1 && idx !== colMdc2);
            if (nextMdc !== undefined) colMdc3 = nextMdc;
          }
          if (colMdc3 === -1 && colMdc2 !== -1 && rawHeaders[colMdc2 + 1] === '') {
            const nextIdx = colMdc2 + 1;
            if (rows.slice(dataStartRowIdx, dataStartRowIdx + 20).some((r) => Array.isArray(r) && cleanCellStr(r[nextIdx]) !== '')) {
              colMdc3 = nextIdx;
            }
          }

          // --- SEC 1 ("SEC -1 (Skill Enhancement Course) 2nd Sem"), SEC 2 ("SEC -2 ... 5th Sem"), SEC 3 ("SEC -3 ... 6th Sem") DETECTION ---
          let colSec1 = findCol([
            // 1. Direct match for exact user header "SEC -1 (Skill Enhancement Course) 2nd Sem" or "SEC -1" / "SEC-1" / "SEC 1" / "SEC-I"
            (h) => isSec1Header(h),
            // 2. Category paper index 1
            (h) => (isSecHeader(h) || h.includes('skill enhancement')) && extractCategoryPaperIndex(h, 'sec') === 1,
            // 3. Semester-based SEC 1: 2nd Sem / Sem II / Sem 2 (or Sem I / Sem III for AEDP)
            (h) =>
              (isSecHeader(h) || h.includes('skill enhancement')) &&
              !isSec2Header(h) &&
              !isSec3Header(h) &&
              (/\b(2nd|1st)\s*sem/i.test(h) || /\bsem(?:ester)?\s*[-:.\s]*(2|ii|2nd|1|i|1st)\b/i.test(h)),
            // 4. Bare "sec" header
            (h) => (h === 'sec' || h === 'secc' || h === 'sec subject' || h === 'skill enhancement course') && !isSec2Header(h) && !isSec3Header(h),
          ]);
          if (colSec1 === -1 && allSecCols.length >= 1) {
            colSec1 = allSecCols[0];
          }

          let colSec2 = findCol(
            [
              // 1. Direct match for exact user header "SEC -2 (Skill Enhancement Course) 5th Sem" or "SEC -2" / "SEC-2" / "SEC 2" / "SEC-II"
              (h) => isSec2Header(h),
              // 2. Category paper index 2
              (h) => (isSecHeader(h) || h.includes('skill enhancement')) && extractCategoryPaperIndex(h, 'sec') === 2,
              // 3. Semester-based SEC 2: 5th Sem / Sem V / Sem 5 (or Sem IV / Sem 4)
              (h) =>
                (isSecHeader(h) || h.includes('skill enhancement')) &&
                !isSec1Header(h) &&
                !isSec3Header(h) &&
                (/\b(5th|4th|3rd)\s*sem/i.test(h) || /\bsem(?:ester)?\s*[-:.\s]*(5|v|5th|4|iv|4th|3|iii|3rd)\b/i.test(h)),
            ],
            colSec1 !== -1 ? [colSec1] : []
          );
          if (colSec2 === -1 && allSecCols.length >= 2) {
            const secondSec = allSecCols.find((idx) => idx !== colSec1);
            if (secondSec !== undefined) colSec2 = secondSec;
          }
          if (colSec2 === -1 && colSec1 !== -1 && rawHeaders[colSec1 + 1] === '') {
            const nextIdx = colSec1 + 1;
            if (rows.slice(dataStartRowIdx, dataStartRowIdx + 20).some((r) => Array.isArray(r) && cleanCellStr(r[nextIdx]) !== '')) {
              colSec2 = nextIdx;
            }
          }

          let colSec3 = findCol(
            [
              // 1. Direct match for exact user header "SEC -3 (Skill Enhancement Course) 6th Sem" or "SEC -3" / "SEC-3" / "SEC 3" / "SEC-III"
              (h) => isSec3Header(h),
              // 2. Category paper index 3
              (h) => (isSecHeader(h) || h.includes('skill enhancement')) && extractCategoryPaperIndex(h, 'sec') === 3,
              // 3. Semester-based SEC 3: 6th Sem / Sem VI / Sem 6
              (h) =>
                (isSecHeader(h) || h.includes('skill enhancement')) &&
                !isSec1Header(h) &&
                !isSec2Header(h) &&
                (/\b6th\s*sem/i.test(h) || /\bsem(?:ester)?\s*[-:.\s]*(6|vi|6th)\b/i.test(h)),
            ],
            [colSec1, colSec2].filter((x) => x !== -1)
          );
          if (colSec3 === -1 && allSecCols.length >= 3) {
            const thirdSec = allSecCols.find((idx) => idx !== colSec1 && idx !== colSec2);
            if (thirdSec !== undefined) colSec3 = thirdSec;
          }
          if (colSec3 === -1 && colSec2 !== -1 && rawHeaders[colSec2 + 1] === '') {
            const nextIdx = colSec2 + 1;
            if (rows.slice(dataStartRowIdx, dataStartRowIdx + 20).some((r) => Array.isArray(r) && cleanCellStr(r[nextIdx]) !== '')) {
              colSec3 = nextIdx;
            }
          }

          // --- AEC 1 & AEC 2 DETECTION ---
          let colAec1 = findCol([
            (h) => isAecHeader(h) && extractCategoryPaperIndex(h, 'aec') === 1,
            (h) => isAecHeader(h) && /\bsem(?:ester)?\s*[-:.\s]*(1|i|1st)\b/i.test(h),
            (h) => h === 'aec' || h === 'aecc' || h === 'mil',
          ]);
          if (colAec1 === -1 && allAecCols.length >= 1) colAec1 = allAecCols[0];

          let colAec2 = findCol(
            [
              (h) => isAecHeader(h) && extractCategoryPaperIndex(h, 'aec') === 2,
              (h) => isAecHeader(h) && /\bsem(?:ester)?\s*[-:.\s]*(2|ii|2nd)\b/i.test(h),
            ],
            colAec1 !== -1 ? [colAec1] : []
          );
          if (colAec2 === -1 && allAecCols.length >= 2) {
            const secondAec = allAecCols.find((idx) => idx !== colAec1);
            if (secondAec !== undefined) colAec2 = secondAec;
          }
          if (colAec2 === -1 && colAec1 !== -1 && rawHeaders[colAec1 + 1] === '') {
            const nextIdx = colAec1 + 1;
            if (rows.slice(dataStartRowIdx, dataStartRowIdx + 20).some((r) => Array.isArray(r) && cleanCellStr(r[nextIdx]) !== '')) {
              colAec2 = nextIdx;
            }
          }

          // --- VAC 1, VAC 2, VAC 3, VAC 4 DETECTION ---
          let colVac1 = findCol([
            (h) => isVacHeader(h) && extractCategoryPaperIndex(h, 'vac') === 1,
            (h) => isVacHeader(h) && /\bsem(?:ester)?\s*[-:.\s]*(1|i|1st)\b/i.test(h),
            (h) => h === 'vac',
          ]);
          if (colVac1 === -1 && allVacCols.length >= 1) colVac1 = allVacCols[0];

          let colVac2 = findCol(
            [
              (h) => isVacHeader(h) && extractCategoryPaperIndex(h, 'vac') === 2,
              (h) => isVacHeader(h) && /\bsem(?:ester)?\s*[-:.\s]*(3|iii|3rd|2|ii|2nd)\b/i.test(h),
            ],
            colVac1 !== -1 ? [colVac1] : []
          );
          if (colVac2 === -1 && allVacCols.length >= 2) {
            const secondVac = allVacCols.find((idx) => idx !== colVac1);
            if (secondVac !== undefined) colVac2 = secondVac;
          }
          if (colVac2 === -1 && colVac1 !== -1 && rawHeaders[colVac1 + 1] === '') {
            const nextIdx = colVac1 + 1;
            if (rows.slice(dataStartRowIdx, dataStartRowIdx + 20).some((r) => Array.isArray(r) && cleanCellStr(r[nextIdx]) !== '')) {
              colVac2 = nextIdx;
            }
          }

          let colVac3 = findCol(
            [
              (h) => isVacHeader(h) && extractCategoryPaperIndex(h, 'vac') === 3,
              (h) => isVacHeader(h) && /\bsem(?:ester)?\s*[-:.\s]*(5|v|5th)\b/i.test(h),
            ],
            [colVac1, colVac2].filter((x) => x !== -1)
          );
          let colVac4 = findCol(
            [
              (h) => isVacHeader(h) && extractCategoryPaperIndex(h, 'vac') === 4,
              (h) => isVacHeader(h) && /\bsem(?:ester)?\s*[-:.\s]*(6|vi|6th)\b/i.test(h),
            ],
            [colVac1, colVac2, colVac3].filter((x) => x !== -1)
          );

          // Apply any user-specified manual column overrides
          if (customColMap) {
            if (customColMap.minor1 !== undefined) colMinor1 = customColMap.minor1;
            if (customColMap.minor2 !== undefined) colMinor2 = customColMap.minor2;
            if (customColMap.sec1 !== undefined) colSec1 = customColMap.sec1;
            if (customColMap.sec2 !== undefined) colSec2 = customColMap.sec2;
            if (customColMap.sec3 !== undefined) colSec3 = customColMap.sec3;
            if (customColMap.mdc1 !== undefined) colMdc1 = customColMap.mdc1;
            if (customColMap.mdc2 !== undefined) colMdc2 = customColMap.mdc2;
            if (customColMap.mdc3 !== undefined) colMdc3 = customColMap.mdc3;
            if (customColMap.aec1 !== undefined) colAec1 = customColMap.aec1;
            if (customColMap.aec2 !== undefined) colAec2 = customColMap.aec2;
            if (customColMap.vac1 !== undefined) colVac1 = customColMap.vac1;
            if (customColMap.vac2 !== undefined) colVac2 = customColMap.vac2;
            if (customColMap.major1 !== undefined) {
              // handled below
            }
          }

          const finalColMajor1 = customColMap?.major1 !== undefined ? customColMap.major1 : colMajor1;

          const getColName = (idx: number) => {
            if (idx === -1) return 'Not Found';
            const found = displayHeaders.find((d) => d.index === idx);
            return found ? found.label : `Col ${idx + 1}`;
          };

          lastHeaders = displayHeaders;
          lastColIndices = {
            roll: colRoll,
            barcode: colBarcode,
            name: colName,
            major1: finalColMajor1,
            minor1: colMinor1,
            minor2: colMinor2,
            mdc1: colMdc1,
            mdc2: colMdc2,
            mdc3: colMdc3,
            sec1: colSec1,
            sec2: colSec2,
            sec3: colSec3,
            aec1: colAec1,
            aec2: colAec2,
            vac1: colVac1,
            vac2: colVac2,
          };
          lastDetectedColumns = {
            'Major': getColName(finalColMajor1),
            'Minor 1': getColName(colMinor1),
            'Minor 2': getColName(colMinor2),
            'MDC 1': getColName(colMdc1),
            'MDC 2': getColName(colMdc2),
            'MDC 3': getColName(colMdc3),
            'SEC 1': getColName(colSec1),
            'SEC 2': getColName(colSec2),
            'SEC 3': getColName(colSec3),
            'AEC 1': getColName(colAec1),
            'AEC 2': getColName(colAec2),
            'VAC 1': getColName(colVac1),
            'VAC 2': getColName(colVac2),
          };

          const sheetIsAedp = sheetName.toLowerCase().includes('aedp');

          for (let rIdx = dataStartRowIdx; rIdx < rows.length; rIdx++) {
            const row = rows[rIdx];
            if (!Array.isArray(row)) continue;

            const rawRoll = colRoll !== -1 ? cleanCellStr(row[colRoll]) : '';
            const rawUnivRoll = colUnivRoll !== -1 ? cleanCellStr(row[colUnivRoll]) : '';
            const rawBarcode = colBarcode !== -1 ? cleanCellStr(row[colBarcode]) : '';
            const rawName = colName !== -1 ? cleanCellStr(row[colName]) : '';
            const rawStream = colStream !== -1 ? cleanCellStr(row[colStream]) : '';
            const rawSession = colSession !== -1 ? cleanCellStr(row[colSession]) : '';
            const rawCourseType = colCourseType !== -1 ? cleanCellStr(row[colCourseType]) : '';
            const rawMajor1 = finalColMajor1 !== -1 ? cleanCellStr(row[finalColMajor1]) : '';

            // Skip completely empty rows, repeated header rows, or summary rows
            if (!rawRoll && !rawBarcode && !rawName && !rawUnivRoll) continue;
            const lowName = rawName.toLowerCase();
            const lowRoll = rawRoll.toLowerCase();
            if (
              lowName.startsWith('total') ||
              lowRoll.startsWith('total') ||
              lowName === 'student name' ||
              lowName === 'name' ||
              lowRoll === 'roll number' ||
              lowRoll === 'roll no' ||
              lowRoll === 'college roll'
            ) {
              continue;
            }

            // Match student from existingStudents
            let matchedStudent: Student | undefined;
            if (rawBarcode && bySams.has(normalizeLookupKey(rawBarcode))) {
              matchedStudent = bySams.get(normalizeLookupKey(rawBarcode));
            }
            if (!matchedStudent && rawRoll) {
              const rLookup = normalizeLookupKey(rawRoll);
              if (byRoll.has(rLookup)) {
                matchedStudent = byRoll.get(rLookup);
              } else {
                const rNorm = normalizeRollLookupKey(rawRoll);
                if (byRollNormalized.has(rNorm)) {
                  matchedStudent = byRollNormalized.get(rNorm);
                }
              }
            }
            if (!matchedStudent && rawUnivRoll && byUnivRoll.has(normalizeLookupKey(rawUnivRoll))) {
              matchedStudent = byUnivRoll.get(normalizeLookupKey(rawUnivRoll));
            }
            if (!matchedStudent && rawName) {
              const nKey = normalizeLookupKey(rawName);
              const dKey = normalizeLookupKey(rawMajor1);
              if (dKey && byNameDept.has(`${nKey}_${dKey}`)) {
                matchedStudent = byNameDept.get(`${nKey}_${dKey}`);
              } else if (byName.has(nKey)) {
                const candidates = byName.get(nKey)!;
                if (candidates.length === 1) {
                  matchedStudent = candidates[0];
                } else if (rawMajor1) {
                  matchedStudent =
                    candidates.find(
                      (c) =>
                        c.department.toLowerCase().includes(rawMajor1.toLowerCase()) ||
                        rawMajor1.toLowerCase().includes(c.department.toLowerCase())
                    ) || candidates[candSessionIndex(candidates, defaultSession)];
                } else {
                  matchedStudent = candidates[candSessionIndex(candidates, defaultSession)];
                }
              }
            }

            const studentId = matchedStudent
              ? matchedStudent.id
              : `stu_counselling_${normalizeLookupKey(rawRoll || rawBarcode || rawName)}_${rIdx}`;

            if (matchedStudent) {
              matchedCount++;
            } else {
              unmatchedCount++;
            }

            // Determine base record to merge with
            const baseRecord: StudentCounsellingRecord =
              parsedMap.get(studentId) ||
              existingMap[studentId] ||
              (matchedStudent
                ? generateSuggestedCounselling(matchedStudent)
                : {
                    id: studentId,
                    studentId,
                    studentName: rawName || 'Unknown Student',
                    rollNo: rawRoll || 'N/A',
                    universityRollNo: rawUnivRoll || 'N/A',
                    samsRegNo: rawBarcode || 'N/A',
                    academicYear: rawSession || defaultSession,
                    stream: (rawStream as StreamType) || 'Arts',
                    department: rawMajor1 || 'General',
                    isAedp:
                      sheetIsAedp ||
                      rawCourseType.toLowerCase().includes('aedp') ||
                      rawMajor1.toLowerCase().includes('aedp'),
                    status: 'Allotted',
                    allottedDate: new Date().toISOString().slice(0, 10),
                    counselorName: 'Admin Excel Import',
                    remarks: 'Imported via Subject Counselling Excel',
                    updatedAt: new Date().toISOString(),
                  });

            const m1Val = finalColMajor1 !== -1 ? cleanSubjectValue(row[finalColMajor1]) : '';
            const m2Val = colMajor2 !== -1 ? cleanSubjectValue(row[colMajor2]) : '';
            let min1Val = colMinor1 !== -1 ? cleanSubjectValue(row[colMinor1]) : '';
            let min2Val = colMinor2 !== -1 ? cleanSubjectValue(row[colMinor2]) : '';
            let mdc1Val = colMdc1 !== -1 ? cleanSubjectValue(row[colMdc1]) : '';
            let mdc2Val = colMdc2 !== -1 ? cleanSubjectValue(row[colMdc2]) : '';
            let mdc3Val = colMdc3 !== -1 ? cleanSubjectValue(row[colMdc3]) : '';
            let sec1Val = colSec1 !== -1 ? cleanSubjectValue(row[colSec1]) : '';
            let sec2Val = colSec2 !== -1 ? cleanSubjectValue(row[colSec2]) : '';
            let sec3Val = colSec3 !== -1 ? cleanSubjectValue(row[colSec3]) : '';
            const aec1Val = colAec1 !== -1 ? cleanSubjectValue(row[colAec1]) : '';
            const aec2Val = colAec2 !== -1 ? cleanSubjectValue(row[colAec2]) : '';
            const vac1Val = colVac1 !== -1 ? cleanSubjectValue(row[colVac1]) : '';
            const vac2Val = colVac2 !== -1 ? cleanSubjectValue(row[colVac2]) : '';
            const vac3Val = colVac3 !== -1 ? cleanSubjectValue(row[colVac3]) : '';
            const vac4Val = colVac4 !== -1 ? cleanSubjectValue(row[colVac4]) : '';

            // Support combined single-column values like "History / Political Science" or "History | Sociology" when Minor 2 column is absent
            if (colMinor2 === -1 && min1Val && (min1Val.includes('/') || min1Val.includes('|') || min1Val.includes(';'))) {
              const parts = min1Val.split(/[\/|;]/).map((s) => cleanSubjectValue(s.trim())).filter(Boolean);
              if (parts.length >= 2) {
                min1Val = parts[0];
                min2Val = parts[1];
              }
            }

            // Accurate isAedp determination:
            // Regular Honours has Minor 1, Minor 2, SEC 3, and MDC 3. AEDP has none of these.
            const hasRegularHonoursFields = Boolean(min1Val || min2Val || sec3Val || mdc3Val);
            const explicitAedp =
              sheetIsAedp ||
              rawCourseType.toLowerCase().includes('aedp') ||
              (rawMajor1.toLowerCase().includes('aedp') && !rawMajor1.toLowerCase().includes('regular'));

            const isAedp = !hasRegularHonoursFields && (
              explicitAedp ||
              (matchedStudent
                ? Boolean(matchedStudent.isAedp || (matchedStudent.department || '').toLowerCase().includes('aedp'))
                : baseRecord.isAedp)
            );

            // Support combined single-column SEC values like "SEC 1 / SEC 2 / SEC 3" when SEC 2/3 columns are absent
            if (colSec2 === -1 && sec1Val && (sec1Val.includes('/') || sec1Val.includes('|') || sec1Val.includes(';'))) {
              const parts = sec1Val.split(/[\/|;]/).map((s) => cleanSubjectValue(s.trim())).filter(Boolean);
              if (parts.length >= 2) {
                sec1Val = parts[0];
                sec2Val = parts[1];
                if (parts.length >= 3 && !sec3Val) sec3Val = parts[2];
              }
            }

            // Support combined single-column MDC values when MDC 2/3 columns are absent
            if (colMdc2 === -1 && mdc1Val && (mdc1Val.includes('/') || mdc1Val.includes('|') || mdc1Val.includes(';'))) {
              const parts = mdc1Val.split(/[\/|;]/).map((s) => cleanSubjectValue(s.trim())).filter(Boolean);
              if (parts.length >= 2) {
                mdc1Val = parts[0];
                mdc2Val = parts[1];
                if (parts.length >= 3 && !mdc3Val) mdc3Val = parts[2];
              }
            }

            if (isAedp) {
              const prevAedp = baseRecord.aedp || {
                major1: matchedStudent?.department || m1Val || 'AEDP Specialization',
                major2: '',
                mdc1: '',
                mdc2: '',
                aec1: 'English: Business and Communication',
                aec2: 'English: Word and Presentation',
                sec1: '',
                sec2: '',
                vac1: 'ENVIRONMENT STUDIES AND DISASTER MANAGEMENT',
                vac2: 'Good Citizenship',
              };

              const nextMajor1 = m1Val || prevAedp.major1;
              const nextMajor2 = m2Val || min1Val || prevAedp.major2;
              const nextMdc1 = mdc1Val || prevAedp.mdc1;
              const nextMdc2 = mdc2Val || prevAedp.mdc2;
              const nextAec1 = aec1Val || prevAedp.aec1;
              const nextAec2 = aec2Val || prevAedp.aec2;
              const nextSec1 = sec1Val || prevAedp.sec1;
              const nextSec2 = sec2Val || prevAedp.sec2;
              const nextVac1 = vac1Val || prevAedp.vac1;
              const nextVac2 = vac2Val || prevAedp.vac2;

              baseRecord.isAedp = true;
              baseRecord.aedp = {
                major1: nextMajor1,
                major2: nextMajor2,
                mdc1: nextMdc1,
                mdc2: nextMdc2,
                aec1: nextAec1,
                aec2: nextAec2,
                sec1: nextSec1,
                sec2: nextSec2,
                vac1: nextVac1,
                vac2: nextVac2,
                sem1: { major1: nextMajor1, major2: nextMajor2, aec1: nextAec1, vac1: nextVac1 },
                sem2: { major1: nextMajor1, major2: nextMajor2, aec2: nextAec2, vac2: nextVac2 },
                sem3: { major1: nextMajor1, major2: nextMajor2, mdc1: nextMdc1, sec1: nextSec1 },
                sem4: { major1: nextMajor1, major2: nextMajor2, mdc2: nextMdc2, sec2: nextSec2 },
                sem5_6: { apprenticeship: 'APPRENTICESHIP' },
              };
            } else {
              const prevReg = baseRecord.regular || {
                major: matchedStudent?.department || m1Val || 'General',
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
              };

              const nextMajor = m1Val || prevReg.major;
              const nextMinor1 = min1Val || prevReg.minor1;
              const nextMinor2 = min2Val || prevReg.minor2;
              const nextMdc1 = mdc1Val || prevReg.mdc1;
              const nextMdc2 = mdc2Val || prevReg.mdc2;
              const nextMdc3 = mdc3Val || prevReg.mdc3;
              const nextSec1 = sec1Val || prevReg.sec1;
              const nextSec2 = sec2Val || prevReg.sec2;
              const nextSec3 = sec3Val || prevReg.sec3;
              const nextAec1 = aec1Val || prevReg.aec1;
              const nextAec2 = aec2Val || prevReg.aec2;
              const nextVac1 = vac1Val || prevReg.vac1;
              const nextVac2 = vac2Val || prevReg.vac2;
              const nextVac3 = vac3Val || prevReg.sem5?.vac || 'UNDERSTANDING ODISHA';
              const nextVac4 = vac4Val || prevReg.sem6?.vac || 'Creative Writing';

              baseRecord.isAedp = false;
              baseRecord.regular = {
                major: nextMajor,
                minor1: nextMinor1,
                minor2: nextMinor2,
                mdc1: nextMdc1,
                mdc2: nextMdc2,
                mdc3: nextMdc3,
                sec1: nextSec1,
                sec2: nextSec2,
                sec3: nextSec3,
                aec1: nextAec1,
                aec2: nextAec2,
                vac1: nextVac1,
                vac2: nextVac2,
                sem1: { major: nextMajor, minor: nextMinor1, mdc: nextMdc1, aec: nextAec1, vac: nextVac1 },
                sem2: { major: nextMajor, minor: nextMinor2, mdc: nextMdc2, aec: nextAec2, sec: nextSec1 },
                sem3: { major: nextMajor, minor: nextMinor1, mdc: nextMdc3, vac: nextVac2 },
                sem4: { major: nextMajor, minor: nextMinor2, activity: 'Internship / Community Engagement & Service / Field Work' },
                sem5: { major: nextMajor, minor: nextMinor1, sec: nextSec2, vac: nextVac3 },
                sem6: { major: nextMajor, minor: nextMinor2, sec: nextSec3, vac: nextVac4 },
              };
            }

            if (rawUnivRoll) {
              baseRecord.universityRollNo = rawUnivRoll;
            }
            if (rawSession) {
              baseRecord.academicYear = rawSession;
            }
            baseRecord.status = 'Allotted';
            baseRecord.allottedDate = new Date().toISOString().slice(0, 10);
            baseRecord.updatedAt = new Date().toISOString();

            parsedMap.set(studentId, baseRecord);
          }
        }

        const finalRecords = Array.from(parsedMap.values());
        resolve({
          success: finalRecords.length > 0,
          records: finalRecords,
          matchedCount,
          unmatchedCount,
          newStudentsToCreate,
          errors:
            finalRecords.length === 0
              ? ['No valid student subject counselling rows could be extracted from the file.']
              : [],
          sheetNames,
          detectedColumns: lastDetectedColumns,
          headers: lastHeaders,
          colIndices: lastColIndices,
        });
      } catch (err: any) {
        resolve({
          success: false,
          records: [],
          matchedCount: 0,
          unmatchedCount: 0,
          newStudentsToCreate: [],
          errors: [err?.message || 'Failed to parse Subject Counselling Excel file.'],
          sheetNames: [],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        records: [],
        matchedCount: 0,
        unmatchedCount: 0,
        newStudentsToCreate: [],
        errors: ['Failed to read the uploaded file.'],
        sheetNames: [],
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

function candSessionIndex(candidates: Student[], defaultSession: string): number {
  const idx = candidates.findIndex((c) => (c.academicYear || '2026-27') === defaultSession);
  return idx !== -1 ? idx : 0;
}


