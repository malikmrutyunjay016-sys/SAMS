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
  if (val === null || val === undefined || val === '') return '2005-01-01';

  if (typeof val === 'number') {
    // Excel serial date to JavaScript Date (base 1899-12-30)
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

  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const str = String(val).trim();
  // Check DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = str.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    let year = dmyMatch[3];
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month}-${day}`;
  }

  // Check YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[/.\-](\d{1,2})[/.\-](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Fallback try Date.parse
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    const dt = new Date(parsed);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  }

  return '2005-01-01';
}

/**
 * Normalizes categories into standard SAMS categories: GEN, SC, ST, SEBC
 */
export function normalizeCategory(val: any): CategoryType {
  if (!val) return 'GEN';
  const c = String(val).toUpperCase().trim();
  if (c.includes('SC') || c.includes('SCHEDULED CASTE')) return 'SC';
  if (c.includes('ST') || c.includes('SCHEDULED TRIBE')) return 'ST';
  if (c.includes('SEBC') || c.includes('OBC') || c.includes('BACKWARD')) return 'SEBC';
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
export async function parseExcelOrCsvFile(file: File): Promise<ParseResult> {
  const warnings: string[] = [];

  try {
    const buffer = await file.arrayBuffer();
    // Read workbook with cellDates: false to keep raw serials for parseExcelDate
    const wb = XLSX.read(buffer, {
      type: 'array',
      cellDates: false,
      raw: true,
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

    // Try parsing all sheets and pick the one with the highest count of valid students
    let bestSheetName = wb.SheetNames[0];
    let bestStudents: Student[] = [];
    let bestTotalRows = 0;

    const headerKeywords = [
      'name', 'student', 'applicant', 'candidate', 'fullname',
      'barcode', 'caf', 'cafno', 'appl', 'form',
      'roll', 'rollno', 'rno', 'collegeroll', 'universityroll',
      'reg', 'registration', 'regd', 'sams',
      'father', 'mother', 'parent', 'guardian', 'fname', 'mname',
      'category', 'cat', 'caste', 'community', 'social', 'reservation',
      'dob', 'birth', 'dateofbirth', 'bdate',
      'marks', 'mark', 'secured', 'obtained', 'max', 'total', 'full', 'score',
      'percent', 'percentage', 'pct', 'career', 'weightage',
      'department', 'dept', 'honours', 'hon', 'hons', 'subject', 'core', 'major',
      'stream', 'faculty', 'discipline', 'branch',
      'phone', 'mobile', 'contact', 'gender', 'sex', 'blood', 'status'
    ];

    for (const sheetName of wb.SheetNames) {
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
          !matchesField(['father', 'mother', 'parent', 'guardian', 'fname', 'mname', 'dept', 'subject', 'college'])
        ) {
          if (colMap['name'] === undefined) colMap['name'] = cIdx;
        }
        // 2. Barcode / CAF No / App No
        else if (matchesField(['barcode', 'caf', 'cafno', 'barcodeno', 'applno', 'applicationno', 'formno', 'mrno', 'ackno'])) {
          if (colMap['barcode'] === undefined) colMap['barcode'] = cIdx;
        }
        // 3. Parent / Guardian Name
        else if (matchesField(['father', 'mother', 'parent', 'guardian', 'fname', 'mname', 'careof'])) {
          if (colMap['parentName'] === undefined) colMap['parentName'] = cIdx;
        }
        // 4. Category
        else if (matchesField(['category', 'cat', 'caste', 'social', 'community', 'reservation'])) {
          if (colMap['category'] === undefined) colMap['category'] = cIdx;
        }
        // 5. DOB
        else if (matchesField(['dob', 'birth', 'dateofbirth', 'bdate'])) {
          if (colMap['dob'] === undefined) colMap['dob'] = cIdx;
        }
        // 6. Roll Number
        else if (matchesField(['roll', 'rollno', 'collegeroll', 'classroll', 'rno', 'universityroll', 'examroll'])) {
          if (colMap['rollNo'] === undefined) colMap['rollNo'] = cIdx;
        }
        // 7. SAMS Registration No
        else if (matchesField(['sams', 'regno', 'registration', 'regd', 'samsreg'])) {
          if (colMap['samsRegNo'] === undefined) colMap['samsRegNo'] = cIdx;
        }
        // 8. Department / Honours Subject
        else if (matchesField(['dept', 'department', 'honours', 'hon', 'hons', 'subject', 'core', 'major', 'course', 'specialization'])) {
          if (colMap['department'] === undefined) colMap['department'] = cIdx;
        }
        // 9. Stream
        else if (matchesField(['stream', 'faculty', 'discipline', 'branch'])) {
          if (colMap['stream'] === undefined) colMap['stream'] = cIdx;
        }
        // 10. Percentage
        else if (matchesField(['percent', 'percentage', 'pct', '%', 'career', 'weightage', 'merit'])) {
          if (colMap['percentage'] === undefined) colMap['percentage'] = cIdx;
        }
        // 11. Max / Full / Total Marks (explicitly checked before general marks)
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
        // 12. Marks Secured / Obtained / General Marks
        else if (
          matchesField([
            'secured', 'obtained', 'markssecured', 'marksobtained', 'securedmark', 'markssec',
            'score', 'aggregate', 'point', 'obtmarks', 'scoreobt', 'mo', 'marks', 'mark', 'm.o.', 'sec', 'obt'
          ])
        ) {
          if (colMap['marksSecured'] === undefined) colMap['marksSecured'] = cIdx;
        }
        // 13. Phone
        else if (matchesField(['phone', 'mobile', 'contact', 'cell', 'tel', 'whatsapp'])) {
          if (colMap['phone'] === undefined) colMap['phone'] = cIdx;
        }
        // 14. Gender
        else if (matchesField(['gender', 'sex'])) {
          if (colMap['gender'] === undefined) colMap['gender'] = cIdx;
        }
        // 15. Blood Group
        else if (matchesField(['blood', 'bloodgroup', 'bg'])) {
          if (colMap['bloodGroup'] === undefined) colMap['bloodGroup'] = cIdx;
        }
        // 16. Status
        else if (matchesField(['status', 'admissionstatus'])) {
          if (colMap['status'] === undefined) colMap['status'] = cIdx;
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

        // Barcode / CAF
        const rawBarcode = colMap['barcode'] !== undefined ? String(row[colMap['barcode']] || '').trim() : '';
        const barcode = rawBarcode || `BAR-${Date.now().toString().slice(-4)}${rowIdx + 100}`;

        // Parent Name
        const rawParent = colMap['parentName'] !== undefined ? String(row[colMap['parentName']] || '').trim() : '';
        const parentName = rawParent || 'Parent / Guardian';

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

        // 1. Check if marksSecured cell contains slash (e.g. "480/600" or "480 / 600")
        if (colMap['marksSecured'] !== undefined && row[colMap['marksSecured']] !== undefined) {
          const rawSecuredStr = String(row[colMap['marksSecured']]).trim();
          if (rawSecuredStr.includes('/')) {
            const parts = rawSecuredStr.split('/');
            const pSec = parseFloat(parts[0].replace(/[^0-9.]/g, ''));
            const pMax = parseFloat(parts[1].replace(/[^0-9.]/g, ''));
            if (!isNaN(pSec) && pSec >= 0) marksSecured = pSec;
            if (!isNaN(pMax) && pMax > 0) {
              maxMarks = pMax;
              maxMarksFound = true;
            }
          } else {
            const parsedSecured = parseFloat(rawSecuredStr.replace(/[^0-9.]/g, ''));
            if (!isNaN(parsedSecured) && parsedSecured >= 0) marksSecured = parsedSecured;
          }
        }

        // 2. Read explicit Max Marks column
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

        // 3. Read Percentage
        if (colMap['percentage'] !== undefined && row[colMap['percentage']] !== undefined) {
          const rawPct = parseFloat(String(row[colMap['percentage']]).replace(/[^0-9.]/g, ''));
          if (!isNaN(rawPct) && rawPct > 0) {
            percentage = rawPct <= 1.0 ? parseFloat((rawPct * 100).toFixed(2)) : parseFloat(rawPct.toFixed(2));
          }
        }

        // 4. Scan unassigned cells for typical maxMarks benchmark values (e.g. 500, 600, 700, 800, 1000)
        if (!maxMarksFound) {
          for (let i = 0; i < row.length; i++) {
            if (i === colMap['name'] || i === colMap['rollNo'] || i === colMap['samsRegNo'] || i === colMap['phone']) continue;
            const cellNum = parseFloat(String(row[i] || '').replace(/[^0-9.]/g, ''));
            if (!isNaN(cellNum) && [500, 600, 700, 800, 900, 1000, 1200].includes(cellNum)) {
              if (cellNum >= marksSecured) {
                maxMarks = cellNum;
                maxMarksFound = true;
                break;
              }
            }
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

        // 6. Default fallback if completely missing (CHSE Odisha Higher Secondary benchmark is 600)
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

        // Roll Number
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

        // SAMS Reg No
        const rawSams = colMap['samsRegNo'] !== undefined ? String(row[colMap['samsRegNo']] || '').trim() : '';
        const samsRegNo = rawSams || (barcode.length >= 8 ? barcode : `24D${15000 + rowIdx}`);

        // Phone
        const rawPhone = colMap['phone'] !== undefined ? String(row[colMap['phone']] || '').replace(/[^0-9]/g, '') : '';
        const phone = rawPhone.length >= 10 ? rawPhone.slice(-10) : `9437${Math.floor(100000 + Math.random() * 900000)}`;

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

        // Status
        const rawStatus = colMap['status'] !== undefined ? String(row[colMap['status']] || '').trim() : 'Admitted';
        const status: StudentStatus = (rawStatus as StudentStatus) || 'Admitted';

        sheetStudents.push({
          id: `stu_imp_${Date.now()}_${rowIdx}_${Math.random().toString(36).substring(2, 6)}`,
          name,
          rollNo,
          samsRegNo,
          barcode,
          parentName,
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

    return {
      success: true,
      students: bestStudents,
      totalRowsFound: bestStudents.length,
      message: `Successfully extracted ${bestStudents.length} student records from sheet "${bestSheetName}".`,
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
      'University Roll No': 'BA24-001',
      'SAMS Reg No': '24D10829',
      'Barcode': '24D1082934',
      'Student Name': 'Rajesh Kumar Sahoo',
      'Father Name / Mother Name': 'Bikash Chandra Sahoo',
      'Category': 'GEN',
      'Date of Birth': '2005-06-15',
      'Maximum Marks': 600,
      'Marks Secured': 516,
      'Percentage (%)': 86.0,
      'Department': 'Economics',
      'Stream': 'Arts',
      'Gender': 'Male',
      'Phone': '9437123456',
      'Blood Group': 'O+',
      'Status': 'Admitted'
    },
    {
      'University Roll No': 'BS24-001',
      'SAMS Reg No': '24D10830',
      'Barcode': '24D1082935',
      'Student Name': 'Priyanka Mohapatra',
      'Father Name / Mother Name': 'Ranjan Mohapatra',
      'Category': 'SEBC',
      'Date of Birth': '2005-08-22',
      'Maximum Marks': 600,
      'Marks Secured': 534,
      'Percentage (%)': 89.0,
      'Department': 'B.SC in Botany with Tissue culture and vertical gardening (AEDP)',
      'Stream': 'Biological Science',
      'Gender': 'Female',
      'Phone': '9861234567',
      'Blood Group': 'B+',
      'Status': 'Admitted'
    },
    {
      'University Roll No': 'BS24-002',
      'SAMS Reg No': '24D10831',
      'Barcode': '24D1082936',
      'Student Name': 'Dibakar Naik',
      'Father Name / Mother Name': 'Kailash Naik',
      'Category': 'ST',
      'Date of Birth': '2004-11-10',
      'Maximum Marks': 600,
      'Marks Secured': 456,
      'Percentage (%)': 76.0,
      'Department': 'Physics',
      'Stream': 'Physical Science',
      'Gender': 'Male',
      'Phone': '9439876543',
      'Blood Group': 'A+',
      'Status': 'Admitted'
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
    'University Roll No',
    'SAMS Reg No',
    'Barcode',
    'Student Name',
    'Father Name / Mother Name',
    'Category',
    'Date of Birth',
    'Maximum Marks',
    'Marks Secured',
    'Percentage (%)',
    'Department',
    'Stream',
    'Gender',
    'Phone',
    'Blood Group',
    'Status'
  ];

  const rows = [
    'BA24-001,24D10829,24D1082934,Rajesh Kumar Sahoo,Bikash Chandra Sahoo,GEN,2005-06-15,600,516,86.0,Economics,Arts,Male,9437123456,O+,Admitted',
    'BS24-001,24D10830,24D1082935,Priyanka Mohapatra,Ranjan Mohapatra,SEBC,2005-08-22,600,534,89.0,B.SC in Botany with Tissue culture and vertical gardening (AEDP),Biological Science,Female,9861234567,B+,Admitted',
    'BS24-002,24D10831,24D1082936,Dibakar Naik,Kailash Naik,ST,2004-11-10,600,456,76.0,Physics,Physical Science,Male,9439876543,A+,Admitted'
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
