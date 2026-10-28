import * as XLSX from 'xlsx';
import { Student, CategoryType, StreamType, StudentStatus } from '../types';
import { DEPARTMENTS_LIST } from './defaultData';

export interface ParseResult {
  success: boolean;
  students: Student[];
  totalRowsFound: number;
  message?: string;
  warnings: string[];
}

/**
 * Robust date parser supporting Excel serial numbers, Date objects,
 * DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, and textual dates.
 */
export function parseExcelDate(val: any): string {
  if (val === null || val === undefined || val === '') return new Date().toISOString().slice(0, 10);

  if (typeof val === 'number') {
    // Excel serial date to JavaScript Date (base 1899-12-30)
    if (val >= 1000 && val <= 80000) {
      const utcDays = Math.floor(val - 25569);
      const utcValue = utcDays * 86400;
      const dateInfo = new Date(utcValue * 1000);
      if (!isNaN(dateInfo.getTime())) {
        const y = dateInfo.getUTCFullYear();
        const m = String(dateInfo.getUTCMonth() + 1).padStart(2, '0');
        const d = String(dateInfo.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }
  }

  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  let str = String(val).trim();
  if (!str) return new Date().toISOString().slice(0, 10);

  // Strip time suffix if present e.g. "15/07/2024 10:30:00" -> "15/07/2024"
  if (str.includes(' ')) {
    const spaceParts = str.split(/\s+/);
    if (spaceParts[0].includes('/') || spaceParts[0].includes('-') || spaceParts[0].includes('.')) {
      str = spaceParts[0];
    }
  }

  // 1. Check DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = str.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})$/);
  if (dmyMatch) {
    const p1 = parseInt(dmyMatch[1], 10);
    const p2 = parseInt(dmyMatch[2], 10);
    let year = dmyMatch[3];
    if (year.length === 2) year = `20${year}`;

    // If p1 > 12, p1 is definitely Day and p2 is Month (DD/MM/YYYY)
    if (p1 > 12 && p2 <= 12) {
      const day = String(p1).padStart(2, '0');
      const month = String(p2).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    // Standard Indian e-Admission format is DD/MM/YYYY
    const day = String(p1).padStart(2, '0');
    const month = String(p2).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 2. Check YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[/.\-](\d{1,2})[/.\-](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 3. Textual month dates e.g. "15-Jul-2024" or "15 July 2024"
  const textMonthMatch = str.match(/^(\d{1,2})[\s\-/.]([A-Za-z]{3,9})[\s\-/.Trigger]?(\d{2,4})$/);
  if (textMonthMatch) {
    const day = textMonthMatch[1].padStart(2, '0');
    let year = textMonthMatch[3];
    if (year.length === 2) year = `20${year}`;
    const monthStr = textMonthMatch[2].toLowerCase();
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const mIdx = months.findIndex((m) => monthStr.startsWith(m));
    if (mIdx !== -1) {
      const month = String(mIdx + 1).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  // 4. Fallback try Date.parse
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    const dt = new Date(parsed);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  }

  return new Date().toISOString().slice(0, 10);
}

/**
 * Robustly parses and formats 12-digit Aadhaar numbers.
 * Handles Excel raw numbers, scientific notation (e.g. 7.84512e+11), spaces, and dashes.
 */
export function parseAadhaarNumber(val: any): string {
  if (val === null || val === undefined || val === '') return 'N/A';

  let rawStr = '';
  if (typeof val === 'number') {
    if (isNaN(val)) return 'N/A';
    rawStr = BigInt(Math.round(val)).toString();
  } else {
    let sVal = String(val).trim();
    if (!sVal) return 'N/A';
    if (/^\d+(\.\d+)?e\+\d+$/i.test(sVal)) {
      const num = Number(sVal);
      if (!isNaN(num)) {
        rawStr = BigInt(Math.round(num)).toString();
      } else {
        rawStr = sVal;
      }
    } else {
      rawStr = sVal;
    }
  }

  const digits = rawStr.replace(/[^0-9]/g, '');
  if (digits.length >= 12) {
    const clean12 = digits.slice(0, 12);
    return `${clean12.slice(0, 4)}-${clean12.slice(4, 8)}-${clean12.slice(8, 12)}`;
  } else if (digits.length >= 10 && digits.length < 12) {
    const padded = digits.padStart(12, '0');
    return `${padded.slice(0, 4)}-${padded.slice(4, 8)}-${padded.slice(8, 12)}`;
  }

  return rawStr && rawStr !== '0' ? rawStr : 'N/A';
}

/**
 * Normalizes categories into standard SAMS categories: GEN, SC, ST, SEBC
 */
export function normalizeCategory(val: any): CategoryType {
  if (!val) return 'GEN';
  const c = String(val).toUpperCase().trim();
  if (c.includes('SC') || c.includes('SCHEDULED CASTE')) return 'SC';
  if (c.includes('ST') || c.includes('SCHEDULED TRIBE')) return 'ST';
  if (c === 'OBC' || c === 'OTHER BACKWARD CLASS' || c.includes('OBC')) return 'OBC';
  if (c.includes('SEBC') || c.includes('BACKWARD')) return 'SEBC';
  return 'GEN';
}

/**
 * Infer stream based on Honours subject or department name
 */
export function inferStream(dept: string): StreamType {
  const d = (dept || '').toLowerCase().trim();
  if (
    d.includes('computer') ||
    d === 'cs' ||
    d === 'csa' ||
    d === 'it' ||
    d.includes('information technology') ||
    d.includes('self financ')
  ) {
    return 'Self Financing';
  }
  if (
    d.includes('botan') ||
    d.includes('zool') ||
    d.includes('bio') ||
    d.includes('tissue') ||
    d.includes('vertical garden')
  ) {
    return 'Biological Science';
  }
  if (
    d.includes('physic') ||
    d.includes('chem') ||
    d.includes('math') ||
    d.includes('stat') ||
    d.includes('industrial chem') ||
    d.includes('computing')
  ) {
    return 'Physical Science';
  }
  if (
    d.includes('comm') ||
    d.includes('account') ||
    d.includes('finan') ||
    d.includes('bank') ||
    d.includes('b.com') ||
    d.includes('bcom')
  ) {
    return 'Commerce';
  }
  return 'Arts';
}

/**
 * Normalizes department name, stream, and AEDP status against the official 28 subjects & seats matrix.
 */
export function normalizeDepartmentAndStream(
  rawDept: string,
  rawStream?: string
): { department: string; stream: StreamType; isAedp: boolean } {
  const dStr = (rawDept || '').trim();
  const dLower = dStr.toLowerCase();

  // 1. Direct or ID match against official DEPARTMENTS_LIST from subjects & seats
  const directMatch = DEPARTMENTS_LIST.find(
    (d) => d.name.toLowerCase() === dLower || d.id.toLowerCase() === dLower
  );
  if (directMatch) {
    return { department: directMatch.name, stream: directMatch.stream, isAedp: directMatch.isAedp };
  }

  // 2. Substring match against DEPARTMENTS_LIST
  const containsMatch = DEPARTMENTS_LIST.find(
    (d) =>
      dLower.length >= 3 &&
      (dLower.includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(dLower))
  );
  if (containsMatch) {
    return { department: containsMatch.name, stream: containsMatch.stream, isAedp: containsMatch.isAedp };
  }

  // 3. Keyword / alias mapping fallback
  if (
    dLower.includes('computer') ||
    dLower.includes('csa') ||
    dLower.includes('information tech') ||
    dLower === 'cs' ||
    dLower === 'comp'
  ) {
    return { department: 'Computer Science', stream: 'Self Financing', isAedp: false };
  }
  if (dLower.includes('botan') || dLower.includes('tissue') || dLower.includes('vertical')) {
    const isAedp = dLower.includes('aedp') || dLower.includes('tissue') || dLower.includes('vertical');
    return {
      department: isAedp ? 'B.SC in Botany with Tissue culture and vertical gardening (AEDP)' : 'Botany',
      stream: 'Biological Science',
      isAedp,
    };
  }
  if (dLower.includes('zool') || dLower.includes('bioscience') || dLower.includes('integrative')) {
    const isAedp = dLower.includes('aedp') || dLower.includes('integrative') || dLower.includes('bioscience');
    return {
      department: isAedp ? 'B.SC in Zoology and integrative bioscience (AEDP)' : 'Zoology',
      stream: 'Biological Science',
      isAedp,
    };
  }
  if (dLower.includes('chem') || dLower.includes('industrial')) {
    const isAedp = dLower.includes('aedp') || dLower.includes('industrial');
    return {
      department: isAedp ? 'B.SC in Chemistry and Industrial Chemistry (AEDP)' : 'Chemistry',
      stream: 'Physical Science',
      isAedp,
    };
  }
  if (dLower.includes('math') || dLower.includes('computing')) {
    const isAedp = dLower.includes('aedp') || dLower.includes('computing');
    return {
      department: isAedp ? 'B.Sc. in Mathematics & Computing (AEDP)' : 'Mathematics',
      stream: 'Physical Science',
      isAedp,
    };
  }
  if (dLower.includes('phys')) {
    return { department: 'Physics', stream: 'Physical Science', isAedp: false };
  }
  if (dLower.includes('stat')) {
    return { department: 'Statistics', stream: 'Physical Science', isAedp: false };
  }
  if (dLower.includes('comm') || dLower.includes('bank') || dLower.includes('bfsi')) {
    const isAedp = dLower.includes('aedp') || dLower.includes('bank') || dLower.includes('bfsi');
    return {
      department: isAedp ? 'B.Com in Banking, Financial Services and Insurance and Commerce (AEDP)' : 'Commerce',
      stream: 'Commerce',
      isAedp,
    };
  }
  if (dLower.includes('econ') || dLower.includes('data analytics')) {
    const isAedp = dLower.includes('aedp') || dLower.includes('data analytics');
    return {
      department: isAedp ? 'B.A in Economics and data analytics (AEDP)' : 'Economics',
      stream: 'Arts',
      isAedp,
    };
  }
  if (dLower.includes('eng') || dLower.includes('translation') || dLower.includes('digital humanities')) {
    const isAedp = dLower.includes('aedp') || dLower.includes('translation') || dLower.includes('digital');
    return {
      department: isAedp ? 'B.A in English and Translation & digital humanities (AEDP)' : 'English',
      stream: 'Arts',
      isAedp,
    };
  }
  if (dLower.includes('hist') || dLower.includes('tourism') || dLower.includes('hospitality')) {
    const isAedp = dLower.includes('aedp') || dLower.includes('tourism') || dLower.includes('hospitality');
    return {
      department: isAedp ? 'B.A in History with Tourism and Hospitality Operations (AEDP)' : 'History',
      stream: 'Arts',
      isAedp,
    };
  }
  if (dLower.includes('edu')) return { department: 'Education', stream: 'Arts', isAedp: false };
  if (dLower.includes('geo')) return { department: 'Geography', stream: 'Arts', isAedp: false };
  if (dLower.includes('hin')) return { department: 'Hindi', stream: 'Arts', isAedp: false };
  if (dLower.includes('odi')) return { department: 'Odia', stream: 'Arts', isAedp: false };
  if (dLower.includes('phil')) return { department: 'Philosophy', stream: 'Arts', isAedp: false };
  if (dLower.includes('pol')) return { department: 'Political Science', stream: 'Arts', isAedp: false };
  if (dLower.includes('psych')) return { department: 'Psychology', stream: 'Arts', isAedp: false };
  if (dLower.includes('sans')) return { department: 'Sanskrit', stream: 'Arts', isAedp: false };
  if (dLower.includes('socio')) return { department: 'Sociology', stream: 'Arts', isAedp: false };

  // Fallback
  let stream: StreamType = 'Arts';
  if (rawStream) {
    const stStr = rawStream.trim().toLowerCase();
    if (stStr.includes('bio')) stream = 'Biological Science';
    else if (stStr.includes('phys')) stream = 'Physical Science';
    else if (stStr.includes('comp') || stStr.includes('self')) stream = 'Self Financing';
    else if (stStr.includes('comm')) stream = 'Commerce';
    else if (stStr.includes('art')) stream = 'Arts';
    else stream = inferStream(dStr);
  } else {
    stream = inferStream(dStr);
  }

  return {
    department: dStr || 'Economics',
    stream,
    isAedp: dLower.includes('aedp'),
  };
}

/**
 * Normalize strings for fuzzy header matching
 */
function cleanHeader(h: any): string {
  if (h === null || h === undefined) return '';
  return String(h)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Robustly parses uploaded Excel (.xlsx, .xls) or CSV files into Student records.
 * Supports multi-sheet scans, merged header rows, smart column discovery,
 * date normalization, and value-based column heuristics.
 */
export async function parseExcelOrCsvFile(
  file: File,
  defaultAcademicYear: string = '2026-27'
): Promise<ParseResult> {
  const warnings: string[] = [];

  try {
    const buffer = await file.arrayBuffer();
    // Read workbook with cellDates: false and performance flags (disable unused formulas/HTML/styles)
    const wb = XLSX.read(buffer, {
      type: 'array',
      cellDates: false,
      raw: true,
      cellFormula: false,
      cellHTML: false,
      cellNF: false,
      cellStyles: false,
      cellText: false,
    });

    if (!wb.SheetNames || wb.SheetNames.length === 0) {
      return {
        success: false,
        students: [],
        totalRowsFound: 0,
        message: 'No sheets found in the uploaded workbook.',
        warnings,
      };
    }

    // Try parsing sheets with prioritization for student/sams data sheets
    let bestSheetName = wb.SheetNames[0];
    let bestStudents: Student[] = [];
    let bestTotalRows = 0;

    const prioritizedSheetNames = [...wb.SheetNames].sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const aScore = aLower.includes('student') || aLower.includes('sams') || aLower.includes('admit') || aLower.includes('data') ? 2 : (aLower === 'sheet1' ? 1 : 0);
      const bScore = bLower.includes('student') || bLower.includes('sams') || bLower.includes('admit') || bLower.includes('data') ? 2 : (bLower === 'sheet1' ? 1 : 0);
      return bScore - aScore;
    });

    const headerKeywords = [
      'name', 'student', 'applicant', 'candidate', 'fullname',
      'barcode', 'caf', 'cafno', 'appl', 'form',
      'roll', 'rollno', 'rno', 'collegeroll', 'universityroll', 'univroll', 'examroll',
      'reg', 'registration', 'regd', 'sams',
      'father', 'mother', 'parent', 'guardian', 'fname', 'mname',
      'category', 'cat', 'caste', 'community', 'social', 'reservation',
      'dob', 'birth', 'dateofbirth', 'bdate',
      'marks', 'mark', 'secured', 'obtained', 'max', 'total', 'full', 'score',
      'percent', 'percentage', 'pct', 'career', 'weightage',
      'department', 'dept', 'honours', 'hon', 'hons', 'subject', 'core', 'major',
      'stream', 'faculty', 'discipline', 'branch',
      'phone', 'mobile', 'contact', 'gender', 'sex', 'blood', 'status',
      'email', 'emailid', 'mail', 'e-mail'
    ];

    for (const sheetName of prioritizedSheetNames) {
      const ws = wb.Sheets[sheetName];
      if (!ws) continue;

      const rows = XLSX.utils.sheet_to_json<any[]>(ws, {
        header: 1,
        defval: '',
        blankrows: false,
      });

      if (!rows || rows.length < 2) continue;

      // Scan up to 35 rows to find the true table header row
      let bestHeaderRowIdx = -1;
      let maxMatches = 0;
      const searchLimit = Math.min(rows.length, 35);

      for (let r = 0; r < searchLimit; r++) {
        const row = rows[r];
        if (!Array.isArray(row)) continue;

        let matches = 0;
        for (const cell of row) {
          const cleaned = cleanHeader(cell);
          if (cleaned && headerKeywords.some((kw) => cleaned.includes(kw))) {
            matches++;
          }
        }

        if (matches > maxMatches) {
          maxMatches = matches;
          bestHeaderRowIdx = r;
        }
      }

      // If no strong header row was found (maxMatches < 2), default to row 0
      if (bestHeaderRowIdx === -1 || maxMatches < 2) {
        bestHeaderRowIdx = 0;
      }

      // Build header list, combining with row below only if row below is actually a sub-header
      const primaryHeaderRow = rows[bestHeaderRowIdx] || [];
      const nextRow = rows[bestHeaderRowIdx + 1] || [];

      // Determine if nextRow is actually a subheader row (contains header text words, not student data like numbers or dates)
      const hasDataTraits =
        Array.isArray(nextRow) &&
        nextRow.some(
          (c) =>
            typeof c === 'number' ||
            (typeof c === 'string' && /^\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}$/.test(c.trim())) ||
            (typeof c === 'string' && /^(24D|BS|BA|BC|CS)\d+/i.test(c.trim()))
        );

      const isNextRowSubheader =
        !hasDataTraits &&
        Array.isArray(nextRow) &&
        nextRow.some((c) => cleanHeader(c) && headerKeywords.some((kw) => cleanHeader(c).includes(kw))) &&
        nextRow.length >= 3;

      const maxCols = Math.max(
        Array.isArray(primaryHeaderRow) ? primaryHeaderRow.length : 0,
        isNextRowSubheader && Array.isArray(nextRow) ? nextRow.length : 0
      );

      const colMap: { [key: string]: number } = {};

      for (let cIdx = 0; cIdx < maxCols; cIdx++) {
        const cell1 = cleanHeader(primaryHeaderRow[cIdx]);
        const cell2 = isNextRowSubheader ? cleanHeader(nextRow[cIdx]) : '';
        const combined = `${cell1} ${cell2}`.trim();

        // Helper to check headers
        const matchesField = (keywords: string[]) => {
          return keywords.some((kw) => cell1.includes(kw) || (cell2 && cell2.includes(kw)) || combined.includes(kw));
        };

        // 1. Student Name
        if (
          matchesField(['studentname', 'applicantname', 'candidatename', 'fullname', 'name']) &&
          !matchesField(['father', 'mother', 'parent', 'guardian', 'fname', 'mname', 'dept', 'subject', 'college', 'email'])
        ) {
          if (colMap['name'] === undefined) colMap['name'] = cIdx;
        }
        // 2. Barcode / CAF No / App No / SAMS Reg No
        else if (matchesField(['barcode', 'caf', 'cafno', 'appno', 'application', 'sams', 'regno', 'registration', 'regd', 'samsreg', 'barcodeno', 'samsbarcode'])) {
          if (colMap['samsRegNo'] === undefined) colMap['samsRegNo'] = cIdx;
        }
        // 3. Email ID
        else if (matchesField(['email', 'emailid', 'mail', 'studentemail', 'candidateemail', 'emailaddress', 'mailid', 'e-mail'])) {
          if (colMap['email'] === undefined) colMap['email'] = cIdx;
        }
        // 4. University Roll Number
        else if (matchesField(['universityroll', 'univroll', 'universityrollno', 'univrollno', 'examroll', 'universityrollnumber', 'examrollno', 'univ_roll', 'univrollnumber'])) {
          if (colMap['universityRollNo'] === undefined) colMap['universityRollNo'] = cIdx;
        }
        // 5. College Roll Number
        else if (matchesField(['collegeroll', 'classroll', 'rollno', 'roll', 'rno', 'universityroll', 'collegerollno', 'collegerollnumber'])) {
          if (colMap['rollNo'] === undefined) colMap['rollNo'] = cIdx;
        }
        // 6. Father Name
        else if (matchesField(['father', 'fname', 'fathername'])) {
          if (colMap['parentName'] === undefined) colMap['parentName'] = cIdx;
        }
        // 7. Mother Name
        else if (matchesField(['mother', 'mname', 'mothername'])) {
          if (colMap['motherName'] === undefined) colMap['motherName'] = cIdx;
        }
        // 8. Category
        else if (matchesField(['category', 'cat', 'caste', 'social', 'community', 'reservation'])) {
          if (colMap['category'] === undefined) colMap['category'] = cIdx;
        }
        // 9. DOB
        else if (matchesField(['dob', 'birth', 'dateofbirth', 'bdate'])) {
          if (colMap['dob'] === undefined) colMap['dob'] = cIdx;
        }
        // 10. Department / Honours Subject
        else if (matchesField(['dept', 'department', 'honours', 'hon', 'hons', 'subject', 'core', 'major', 'course', 'specialization'])) {
          if (colMap['department'] === undefined) colMap['department'] = cIdx;
        }
        // 11. Stream
        else if (matchesField(['stream', 'faculty', 'discipline', 'branch'])) {
          if (colMap['stream'] === undefined) colMap['stream'] = cIdx;
        }
        // 12. Percentage
        else if (matchesField(['percent', 'percentage', 'pct', '%', 'career', 'weightage', 'merit'])) {
          if (colMap['percentage'] === undefined) colMap['percentage'] = cIdx;
        }
        // 13. Max / Full / Total Marks
        else if (
          !matchesField(['secured', 'obtained', 'markssecured', 'marksobtained', 'securedmark', 'markssec', 'obtmarks', 'scoreobt', 'sec', 'obt', 'roll', 'rank', 'phone']) &&
          matchesField([
            'maxmarks', 'maximummarks', 'totalmarks', 'fullmarks', 'maxmark', 'totalmark', 'fullmark',
            'maximum', 'outof', 'outofmarks', 'totmarks', 'totmark', 'tmarks', 'tmark', 'grandtotal',
            'full', 'total', 'max', 'mm', 'fm', 'maxscore', 'totalscore', 'fullscore', 'maximumscore',
            'maxmark', 'maximummark', 'fullmark', 'totalmark', 'fmarks', 'fmark', 'totm', 'maxm', 'fullm', 'f.m.', 'm.m.'
          ])
        ) {
          if (colMap['maxMarks'] === undefined) colMap['maxMarks'] = cIdx;
        }
        // 14. Marks Secured / Obtained
        else if (
          matchesField([
            'secured', 'obtained', 'markssecured', 'marksobtained', 'securedmark', 'markssec',
            'score', 'aggregate', 'point', 'obtmarks', 'scoreobt', 'mo', 'marks', 'mark', 'm.o.', 'sec', 'obt'
          ])
        ) {
          if (colMap['marksSecured'] === undefined) colMap['marksSecured'] = cIdx;
        }
        // 15. Mobile / Phone Number
        else if (matchesField(['mobile', 'mob', 'cell', 'whatsapp', 'phone', 'contact', 'tel', 'mobilenumber'])) {
          if (colMap['mobileNumber'] === undefined) colMap['mobileNumber'] = cIdx;
          if (colMap['phone'] === undefined) colMap['phone'] = cIdx;
        }
        // 16. Aadhaar No
        else if (matchesField(['aadhaar', 'aadhar', 'adhar', 'adhaar', 'uid', 'uidai', 'aadhaarno', 'aadharno', 'adharno', 'adhaarno', 'aadharnumber', 'aadhaarcard', 'aadharcard', 'adharcard', 'adhaarcard', 'uidnumber', 'uidno', 'aadhaarid', 'aadharid'])) {
          if (colMap['aadhaarNo'] === undefined) colMap['aadhaarNo'] = cIdx;
        }
        // 17. Address
        else if (matchesField(['address', 'addr', 'location', 'village', 'post', 'district', 'permanentaddress', 'presentaddress'])) {
          if (colMap['address'] === undefined) colMap['address'] = cIdx;
        }
        // 18. Admission Date
        else if (matchesField(['admissiondate', 'dateofadmission', 'admdate', 'admissiondatet', 'doadm', 'joiningdate', 'admissiondt', 'admitdate', 'admitteddate', 'doa', 'dtofadm', 'adm_date', 'admission_date', 'dateofadm'])) {
          if (colMap['admissionDate'] === undefined) colMap['admissionDate'] = cIdx;
        }
        // 19. Gender
        else if (matchesField(['gender', 'sex'])) {
          if (colMap['gender'] === undefined) colMap['gender'] = cIdx;
        }
        // 20. Blood Group
        else if (matchesField(['blood', 'bloodgroup', 'bg'])) {
          if (colMap['bloodGroup'] === undefined) colMap['bloodGroup'] = cIdx;
        }
        // 21. Status
        else if (matchesField(['status', 'admissionstatus'])) {
          if (colMap['status'] === undefined) colMap['status'] = cIdx;
        }
        // 22. Academic Year / Session
        else if (matchesField(['academicyear', 'session', 'sessionyear', 'academic_year', 'year'])) {
          if (colMap['academicYear'] === undefined) colMap['academicYear'] = cIdx;
        }
      }

      // Check if nextRow was actually a subheader; if so, data starts at bestHeaderRowIdx + 2
      const dataStartIdx = isNextRowSubheader ? bestHeaderRowIdx + 2 : bestHeaderRowIdx + 1;

      const dataRows = rows.slice(dataStartIdx);

      // Heuristic fallback for Name column if not identified from header
      if (colMap['name'] === undefined && dataRows.length > 0) {
        // Inspect first 5 rows to find the column containing candidate names (letters, spaces, length 4-40)
        const sampleCheckRows = dataRows.slice(0, 5);
        let bestColCandidate = -1;
        let bestScore = 0;

        for (let col = 0; col < (sampleCheckRows[0]?.length || 0); col++) {
          let score = 0;
          for (const sRow of sampleCheckRows) {
            const val = String(sRow[col] || '').trim();
            if (val.length >= 3 && /^[A-Za-z\s.'-]+$/.test(val) && val.split(/\s+/).length >= 1) {
              score++;
            }
          }
          if (score > bestScore) {
            bestScore = score;
            bestColCandidate = col;
          }
        }

        if (bestScore >= 3 && bestColCandidate !== -1) {
          colMap['name'] = bestColCandidate;
        }
      }

      // Heuristic fallback for maxMarks column if not identified from header
      if (colMap['maxMarks'] === undefined && dataRows.length > 0) {
        const sampleCheckRows = dataRows.slice(0, 15);
        for (let col = 0; col < (sampleCheckRows[0]?.length || 0); col++) {
          if (
            col === colMap['name'] ||
            col === colMap['rollNo'] ||
            col === colMap['samsRegNo'] ||
            col === colMap['phone'] ||
            col === colMap['barcode'] ||
            col === colMap['marksSecured'] ||
            col === colMap['percentage']
          ) {
            continue;
          }
          const nums = sampleCheckRows
            .map((r) => parseFloat(String(r[col] || '').replace(/[^0-9.]/g, '')))
            .filter((v) => !isNaN(v) && v >= 100 && v <= 3000);

          if (nums.length >= Math.min(3, sampleCheckRows.length)) {
            const first = nums[0];
            const matchingCount = nums.filter((v) => v === first).length;
            if (matchingCount / nums.length >= 0.7) {
              colMap['maxMarks'] = col;
              break;
            }
          }
        }
      }

      const sheetStudents: Student[] = [];

      dataRows.forEach((row, rowIdx) => {
        if (!Array.isArray(row) || row.every((c) => c === '' || c === null || c === undefined)) {
          return; // skip completely blank row
        }

        // Read Name
        let rawName = colMap['name'] !== undefined ? String(row[colMap['name']] || '').trim() : '';

        // If no name, check if row is a summary/footer row (e.g. "Total", "Page 1")
        const rowStr = row.join(' ').toLowerCase();
        if (rowStr.includes('grand total') || rowStr.includes('page ') || rowStr.includes('total:')) {
          return;
        }

        if (!rawName) {
          // If row has no name and less than 3 non-empty cells, skip
          const filledCells = row.filter((c) => c !== '' && c !== null && c !== undefined);
          if (filledCells.length < 3) return;
          rawName = `Student ${rowIdx + 1}`;
        }

        // Clean Name
        const name = rawName.replace(/^[0-9.\s]+/, '').trim() || `Student ${rowIdx + 1}`;

        // Parent Name (Father Name)
        const rawParent = colMap['parentName'] !== undefined ? String(row[colMap['parentName']] || '').trim() : '';
        const parentName = rawParent || 'Parent / Guardian';

        // Mother Name
        const rawMother = colMap['motherName'] !== undefined ? String(row[colMap['motherName']] || '').trim() : '';
        const motherName = rawMother || 'Mother Name';

        // Mobile Number / Phone
        let rawMobile = '';
        if (colMap['mobileNumber'] !== undefined && row[colMap['mobileNumber']] !== undefined) {
          rawMobile = String(row[colMap['mobileNumber']] || '').trim();
        } else if (colMap['phone'] !== undefined && row[colMap['phone']] !== undefined) {
          rawMobile = String(row[colMap['phone']] || '').trim();
        } else {
          for (const cell of row) {
            const s = String(cell || '').trim();
            const digits = s.replace(/[^0-9]/g, '');
            if (digits.length >= 10 && (digits.startsWith('9') || digits.startsWith('8') || digits.startsWith('7') || digits.startsWith('6'))) {
              rawMobile = digits;
              break;
            }
          }
        }
        const cleanDigits = rawMobile.replace(/[^0-9]/g, '');
        const mobileNumber = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : `9437${Math.floor(100000 + Math.random() * 900000)}`;
        const phone = mobileNumber;

        // Category
        const rawCat = colMap['category'] !== undefined ? row[colMap['category']] : 'GEN';
        const category = normalizeCategory(rawCat);

        // DOB
        const rawDob = colMap['dob'] !== undefined ? row[colMap['dob']] : '2005-01-01';
        const dob = parseExcelDate(rawDob);

        // Department / Honours & Stream Normalization
        const rawDept = colMap['department'] !== undefined ? String(row[colMap['department']] || '').trim() : '';
        const rawStream = colMap['stream'] !== undefined ? String(row[colMap['stream']] || '').trim() : undefined;
        const normDept = normalizeDepartmentAndStream(rawDept, rawStream);
        const department = normDept.department;
        const stream = normDept.stream;
        const isAedp = normDept.isAedp;

        // Extract Secured Marks, Max Marks, and Percentage
        let marksSecured = 0;
        let maxMarks = 0;
        let percentage = 0;
        let maxMarksFound = false;
        let marksSecuredFound = false;

        // 1. Check if marksSecured cell contains slash (e.g. "480/600" or "480 / 600")
        if (colMap['marksSecured'] !== undefined && row[colMap['marksSecured']] !== undefined) {
          const rawSecuredStr = String(row[colMap['marksSecured']]).trim();
          if (rawSecuredStr.includes('/')) {
            const parts = rawSecuredStr.split('/');
            const pSec = parseFloat(parts[0].replace(/[^0-9.]/g, ''));
            const pMax = parseFloat(parts[1].replace(/[^0-9.]/g, ''));
            if (!isNaN(pSec) && pSec >= 0) {
              marksSecured = pSec;
              marksSecuredFound = true;
            }
            if (!isNaN(pMax) && pMax > 0) {
              maxMarks = pMax;
              maxMarksFound = true;
            }
          } else {
            const parsedSecured = parseFloat(rawSecuredStr.replace(/[^0-9.]/g, ''));
            if (!isNaN(parsedSecured) && parsedSecured >= 0) {
              marksSecured = parsedSecured;
              marksSecuredFound = true;
            }
          }
        }

        // 2. Read explicit Max Marks column from Excel
        if (colMap['maxMarks'] !== undefined && row[colMap['maxMarks']] !== undefined) {
          const rawMaxStr = String(row[colMap['maxMarks']]).trim();
          if (rawMaxStr.includes('/')) {
            const parts = rawMaxStr.split('/');
            const pMax = parseFloat(parts[parts.length - 1].replace(/[^0-9.]/g, ''));
            if (!isNaN(pMax) && pMax > 0) {
              maxMarks = pMax;
              maxMarksFound = true;
            }
          } else {
            const parsedMax = parseFloat(rawMaxStr.replace(/[^0-9.]/g, ''));
            if (!isNaN(parsedMax) && parsedMax > 0) {
              maxMarks = parsedMax;
              maxMarksFound = true;
            }
          }
        }

        // 3. Fallback scan for marks secured and max marks if not found via column headers
        if (!marksSecuredFound || !maxMarksFound) {
          const rowNumbers: number[] = [];
          for (let i = 0; i < row.length; i++) {
            if (i === colMap['name'] || i === colMap['rollNo'] || i === colMap['samsRegNo']) continue;
            const val = parseFloat(String(row[i] || '').replace(/[^0-9.]/g, ''));
            if (!isNaN(val) && val > 0 && val <= 2500) {
              rowNumbers.push(val);
            }
          }
          // If we found numbers, sort descending. Typically max marks is the larger number (e.g. 600) and secured marks is smaller (e.g. 480)
          if (rowNumbers.length >= 2) {
            rowNumbers.sort((a, b) => b - a);
            if (!maxMarksFound) {
              const potentialMax = rowNumbers.find((n) => [500, 600, 700, 800, 900, 1000, 1200].includes(n) || n >= 400);
              if (potentialMax) {
                maxMarks = potentialMax;
                maxMarksFound = true;
              }
            }
            if (!marksSecuredFound) {
              const potentialSec = rowNumbers.find((n) => n !== maxMarks && n <= maxMarks);
              if (potentialSec !== undefined) {
                marksSecured = potentialSec;
                marksSecuredFound = true;
              } else if (rowNumbers.length > 0) {
                marksSecured = rowNumbers[rowNumbers.length - 1];
                marksSecuredFound = true;
              }
            }
          } else if (rowNumbers.length === 1 && !marksSecuredFound) {
            marksSecured = rowNumbers[0];
            marksSecuredFound = true;
          }
        }

        // 4. Read Percentage
        if (colMap['percentage'] !== undefined && row[colMap['percentage']] !== undefined) {
          const rawPct = parseFloat(String(row[colMap['percentage']]).replace(/[^0-9.]/g, ''));
          if (!isNaN(rawPct) && rawPct > 0) {
            percentage = rawPct <= 1.0 ? parseFloat((rawPct * 100).toFixed(2)) : parseFloat(rawPct.toFixed(2));
          }
        }

        // 5. Inferred Max Marks if not explicitly matched (e.g. 480 marks secured & 80.0% -> 600)
        if (!maxMarksFound && marksSecured > 0 && percentage > 0) {
          const inferredMax = Math.round((marksSecured / percentage) * 100);
          if (inferredMax >= 100 && inferredMax <= 3000) {
            const diff = Math.abs((marksSecured / inferredMax) * 100 - percentage);
            if (diff < 0.25) {
              maxMarks = inferredMax;
              maxMarksFound = true;
            }
          }
        }

        // 6. Fallback maxMarks if completely missing
        if (!maxMarksFound || maxMarks <= 0) {
          maxMarks = 600;
        }

        // 7. Sanity Check: If marksSecured is greater than maxMarks and maxMarks > 0, swap them!
        if (maxMarks > 0 && marksSecured > maxMarks) {
          const temp = marksSecured;
          marksSecured = maxMarks;
          maxMarks = temp;
        }

        // 8. Cross-calculate missing fields
        if (marksSecured > 0 && percentage === 0) {
          percentage = parseFloat(((marksSecured / maxMarks) * 100).toFixed(2));
        } else if (percentage > 0 && marksSecured === 0) {
          marksSecured = Math.round((percentage / 100) * maxMarks);
        } else if (marksSecured === 0 && percentage === 0) {
          marksSecured = Math.round(maxMarks * 0.75);
          percentage = 75.0;
        }

        // College Roll Number & University Roll Number
        const rawRoll = colMap['rollNo'] !== undefined ? String(row[colMap['rollNo']] || '').trim() : '';
        const prefix =
          stream === 'Arts'
            ? 'BA24'
            : stream === 'Commerce'
            ? 'BC24'
            : stream === 'Self Financing'
            ? 'CS24'
            : 'BS24';
        const rollNo = rawRoll || `${prefix}-${String(rowIdx + 101).padStart(3, '0')}`;

        // University Roll Number
        const rawUnivRoll = colMap['universityRollNo'] !== undefined ? String(row[colMap['universityRollNo']] || '').trim() : '';
        const universityRollNo = rawUnivRoll || 'N/A';

        // Email ID
        let rawEmail = colMap['email'] !== undefined ? String(row[colMap['email']] || '').trim() : '';
        if (!rawEmail) {
          for (const cell of row) {
            const s = String(cell || '').trim();
            if (s.includes('@') && s.includes('.') && !s.includes(' ')) {
              rawEmail = s;
              break;
            }
          }
        }
        const email = rawEmail ? rawEmail.toLowerCase() : 'N/A';

        // SAMS Reg No / Barcode
        let rawSams = colMap['samsRegNo'] !== undefined ? String(row[colMap['samsRegNo']] || '').trim() : '';
        if (!rawSams) {
          for (const cell of row) {
            const s = String(cell || '').trim();
            if (/^(21|22|23|24|25|26)[A-Z]\d{5,9}$/i.test(s) || /^(CAF|SAMS)[-_\s]?\d+/i.test(s)) {
              rawSams = s.toUpperCase();
              break;
            }
          }
        }
        const samsRegNo = rawSams || `24D${15000 + rowIdx}`;

        // Gender
        let rawGender = colMap['gender'] !== undefined ? String(row[colMap['gender']] || '').trim().toLowerCase() : '';
        let gender: 'Male' | 'Female' | 'Other' = 'Male';
        if (rawGender.startsWith('f') || rawGender.includes('female') || rawGender.includes('girl')) {
          gender = 'Female';
        } else if (rawGender.startsWith('m') || rawGender.includes('male') || rawGender.includes('boy')) {
          gender = 'Male';
        }

        // Blood Group
        const rawBg = colMap['bloodGroup'] !== undefined ? String(row[colMap['bloodGroup']] || '').trim().toUpperCase() : 'O+';
        const bloodGroup = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(rawBg) ? rawBg : 'O+';

        // Aadhaar No (with automatic 12-digit row cell scanner fallback)
        let rawAadhaarVal = colMap['aadhaarNo'] !== undefined ? row[colMap['aadhaarNo']] : undefined;
        if (rawAadhaarVal === undefined || rawAadhaarVal === null || rawAadhaarVal === '') {
          // Scan row cells for any 10 to 12 digit number or formatted string
          for (let i = 0; i < row.length; i++) {
            if (i === colMap['mobileNumber'] || i === colMap['phone'] || i === colMap['rollNo'] || i === colMap['samsRegNo']) continue;
            const cVal = row[i];
            if (cVal === null || cVal === undefined) continue;

            let cDigits = '';
            if (typeof cVal === 'number') {
              if (!isNaN(cVal) && cVal > 0) {
                cDigits = BigInt(Math.round(cVal)).toString().replace(/[^0-9]/g, '');
              }
            } else {
              const sVal = String(cVal).trim();
              if (/^\d+(\.\d+)?e\+\d+$/i.test(sVal)) {
                const num = Number(sVal);
                cDigits = !isNaN(num) ? BigInt(Math.round(num)).toString() : '';
              } else {
                cDigits = sVal.replace(/[^0-9]/g, '');
              }
            }

            if (cDigits.length >= 10 && cDigits.length <= 12) {
              rawAadhaarVal = cVal;
              break;
            }
          }
        }
        const aadhaarNo = parseAadhaarNumber(rawAadhaarVal);

        // Address
        const address = colMap['address'] !== undefined ? String(row[colMap['address']] || '').trim() || 'Baragada, Odisha' : 'Baragada, Odisha';

        // Admission Date (with automatic row cell date scanner fallback)
        let rawAdmDateVal = colMap['admissionDate'] !== undefined ? row[colMap['admissionDate']] : undefined;
        if (rawAdmDateVal === undefined || rawAdmDateVal === null || rawAdmDateVal === '') {
          for (let i = 0; i < row.length; i++) {
            if (i === colMap['dob'] || i === colMap['rollNo'] || i === colMap['samsRegNo'] || i === colMap['mobileNumber'] || i === colMap['phone'] || i === colMap['aadhaarNo']) continue;
            const cVal = row[i];
            if (cVal === null || cVal === undefined) continue;

            if (typeof cVal === 'number' && cVal >= 40000 && cVal <= 80000) {
              rawAdmDateVal = cVal;
              break;
            } else if (typeof cVal === 'string') {
              const s = cVal.trim();
              if (
                /^\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}/.test(s) ||
                /^\d{4}[/.\-]\d{1,2}[/.\-]\d{1,2}/.test(s) ||
                /^\d{1,2}[\s\-/.][A-Za-z]{3,9}[\s\-/.Trigger]?\d{2,4}/.test(s)
              ) {
                rawAdmDateVal = s;
                break;
              }
            }
          }
        }
        const admissionDate = rawAdmDateVal ? parseExcelDate(rawAdmDateVal) : new Date().toISOString().slice(0, 10);

        // Status
        const rawStatus = colMap['status'] !== undefined ? String(row[colMap['status']] || '').trim() : 'Admitted';
        const status: StudentStatus = (rawStatus as StudentStatus) || 'Admitted';

        // Academic Year
        const rawAy = colMap['academicYear'] !== undefined ? String(row[colMap['academicYear']] || '').trim() : '';
        const academicYear = rawAy || defaultAcademicYear;

        sheetStudents.push({
          id: `stu_imp_${Date.now()}_${rowIdx}_${Math.random().toString(36).substring(2, 6)}`,
          name,
          rollNo,
          universityRollNo,
          samsRegNo,
          parentName,
          motherName,
          aadhaarNo,
          email,
          address,
          admissionDate,
          academicYear,
          mobileNumber,
          dob,
          maxMarks,
          marksSecured,
          marksPercentage: percentage,
          department,
          stream,
          isAedp,
          category,
          bloodGroup,
          phone,
          gender,
          status,
          updatedAt: new Date().toISOString(),
        });
      });

      if (sheetStudents.length > bestStudents.length) {
        bestSheetName = sheetName;
        bestStudents = sheetStudents;
        bestTotalRows = dataRows.length;
      }

      // If we extracted a substantial student roster (>= 10), skip scanning remaining auxiliary sheets
      if (sheetStudents.length >= 10) {
        break;
      }
    }

    if (bestStudents.length === 0) {
      return {
        success: false,
        students: [],
        totalRowsFound: 0,
        message: 'Could not extract student records from the uploaded spreadsheet. Please ensure the file has student names, departments, or roll numbers.',
        warnings,
      };
    }

    const sortedBestStudents = [...bestStudents].sort((a, b) => compareRollNumbers(a.rollNo, b.rollNo));

    return {
      success: true,
      students: sortedBestStudents,
      totalRowsFound: sortedBestStudents.length,
      message: `Successfully extracted ${sortedBestStudents.length} student records from sheet "${bestSheetName}".`,
      warnings,
    };
  } catch (err: any) {
    return {
      success: false,
      students: [],
      totalRowsFound: 0,
      message: `Error reading file: ${err?.message || 'Unknown parsing failure'}`,
      warnings: [err?.message || 'Invalid format'],
    };
  }
}

/**
 * Creates and triggers download of an Excel template file with sample student data.
 * Brings Roll No and SAMS Reg No to the first columns as requested.
 */
export function downloadStudentTemplateExcel() {
  const sampleData = [
    {
      'College Roll Number': 'BA26-001',
      'University Roll Number': '260101001',
      'Barcode Number': '26D10829',
      'Student Name': 'Rajesh Kumar Sahoo',
      "Father's Name": 'Bikash Chandra Sahoo',
      "Mother's Name": 'Sunita Sahoo',
      'Aadhaar No': '7845-1234-5678',
      'Email ID': 'rajesh.sahoo2026@gmail.com',
      'Stream': 'Arts',
      'Gender': 'Male',
      'Address': 'Baragada Main Road, Ward 4, Baragada, Odisha - 768028',
      'Category': 'GEN',
      'Mobile Number': '9437123456',
      'Admission Date': '2026-07-15',
      'Academic Year': '2026-27',
      'Subject Name': 'Economics'
    },
    {
      'College Roll Number': 'BS25-001',
      'University Roll Number': '250201001',
      'Barcode Number': '25D10830',
      'Student Name': 'Priyanka Mohapatra',
      "Father's Name": 'Ranjan Mohapatra',
      "Mother's Name": 'Geetanjali Mohapatra',
      'Aadhaar No': '9812-3456-7890',
      'Email ID': 'priyanka.m2025@gmail.com',
      'Stream': 'Biological Science',
      'Gender': 'Female',
      'Address': 'At/Po- Baragada Town, Bargarh',
      'Category': 'SEBC',
      'Mobile Number': '9861234567',
      'Admission Date': '2025-07-16',
      'Academic Year': '2025-26',
      'Subject Name': 'Botany'
    },
    {
      'College Roll Number': 'BS24-002',
      'University Roll Number': '240201002',
      'Barcode Number': '24D10831',
      'Student Name': 'Dibakar Naik',
      "Father's Name": 'Kailash Naik',
      "Mother's Name": 'Sabita Naik',
      'Aadhaar No': '4512-8901-2345',
      'Email ID': 'dibakar.naik2024@gmail.com',
      'Stream': 'Physical Science',
      'Gender': 'Male',
      'Address': 'Station Road, Baragada',
      'Category': 'ST',
      'Mobile Number': '9439876543',
      'Admission Date': '2024-07-18',
      'Academic Year': '2024-25',
      'Subject Name': 'Physics'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students_Template');
  XLSX.writeFile(wb, 'SAMS_Student_Import_Template.xlsx');
}

/**
 * Creates and triggers download of a CSV template file.
 */
export function downloadStudentTemplateCSV() {
  const headers = [
    'College Roll Number',
    'University Roll Number',
    'Barcode Number',
    'Student Name',
    "Father's Name",
    "Mother's Name",
    'Aadhaar No',
    'Email ID',
    'Stream',
    'Gender',
    'Address',
    'Category',
    'Mobile Number',
    'Admission Date',
    'Academic Year',
    'Subject Name'
  ];

  const rows = [
    'BA26-001,260101001,26D10829,Rajesh Kumar Sahoo,Bikash Chandra Sahoo,Sunita Sahoo,7845-1234-5678,rajesh.sahoo2026@gmail.com,Arts,Male,Baragada Main Road Ward 4,GEN,9437123456,2026-07-15,2026-27,Economics',
    'BS25-001,250201001,25D10830,Priyanka Mohapatra,Ranjan Mohapatra,Geetanjali Mohapatra,9812-3456-7890,priyanka.m2025@gmail.com,Biological Science,Female,At/Po- Baragada Town,SEBC,9861234567,2025-07-16,2025-26,Botany',
    'BS24-002,240201002,24D10831,Dibakar Naik,Kailash Naik,Sabita Naik,4512-8901-2345,dibakar.naik2024@gmail.com,Physical Science,Male,Station Road Baragada,ST,9439876543,2024-07-18,2024-25,Physics'
  ];

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'SAMS_Student_Import_Template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Dictionary (lexicographical & natural) comparison helper for college roll numbers.
 * Sorts roll numbers like "BA24-001", "BA24-002", "BS24-001", "CS24-010" in exact dictionary order.
 */
export function compareRollNumbers(aRoll?: string, bRoll?: string): number {
  const aStr = (aRoll || '').trim();
  const bStr = (bRoll || '').trim();
  if (!aStr && !bStr) return 0;
  if (!aStr) return 1;
  if (!bStr) return -1;
  return aStr.localeCompare(bStr, 'en', { sensitivity: 'base' });
}
