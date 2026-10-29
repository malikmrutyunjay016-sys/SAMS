import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Student, StudentCounsellingRecord } from '../types';
import {
  generateSuggestedCounselling,
} from '../lib/counsellingService';
import { compareRollNumbers, compareStudentsByStreamDeptRoll } from '../lib/excelParser';
import {
  BookOpen,
  Filter,
  CheckCircle2,
  AlertCircle,
  Users,
  FileSpreadsheet,
  Printer,
  Search,
  Check,
  ChevronRight,
  GraduationCap,
  Sparkles,
  BookCheck,
  CalendarCheck,
  ClipboardList,
  FileText,
  PenTool,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const PaperAccessView: React.FC = () => {
  const { students, seatMatrix, t, lang } = useData();
  const { role, hodDeptName } = useAuth();

  // Compulsory Filter States
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedCourseType, setSelectedCourseType] = useState<string>('');
  const [selectedPaperType, setSelectedPaperType] = useState<string>('');
  const [selectedPaperName, setSelectedPaperName] = useState<string>('');

  // Search Query inside filtered paper roster
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sub-Tab Navigation inside the component when all compulsory choices are completed
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'attendance' | 'markfoil'>('roster');

  // Additional Configuration States for Attendance Form & Mark Foil
  const [fullMarks, setFullMarks] = useState<string>('100');
  const [attendanceMonth, setAttendanceMonth] = useState<string>('August 2026');

  // Academic Years
  const academicYearOptions = ['2026-27', '2025-26', '2024-25', '2023-24'];

  // Semesters
  const semesterOptions = ['Sem I', 'Sem II', 'Sem III', 'Sem IV', 'Sem V', 'Sem VI'];

  // Course Types
  const courseTypeOptions = ['Regular NEP', 'AEDP'];

  // Paper Types
  const paperTypeOptions = ['Minor', 'MDC', 'AEC', 'VAC', 'SEC'];

  // Local counselling map cache
  const counsellingMap = useMemo(() => {
    try {
      const saved = localStorage.getItem('sams_counselling_records_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const map: Record<string, StudentCounsellingRecord> = {};
          parsed.forEach((r) => {
            if (r && (r.studentId || r.id)) {
              map[r.studentId || r.id] = r;
            }
          });
          return map;
        }
      }
    } catch {}
    return {};
  }, []);

  // Helper to get counselling record
  const getRecordForStudent = (student: Student): StudentCounsellingRecord => {
    if (counsellingMap[student.id]) {
      return counsellingMap[student.id];
    }
    return generateSuggestedCounselling(student);
  };

  // Helper to check if student belongs to HOD department or corresponding AEDP
  const isStudentInHodDept = (student: Student, hodDept: string): boolean => {
    if (!hodDept) return false;
    const h = hodDept.toLowerCase().trim();
    const sDept = (student.department || '').toLowerCase().trim();
    if (sDept === h || sDept.includes(h) || h.includes(sDept)) return true;
    if ((h.includes('commerce') || h.includes('comm') || h.includes('b.com')) &&
        (sDept.includes('commerce') || sDept.includes('bank') || sDept.includes('finance') || sDept.includes('insurance') || sDept.includes('bfsi'))) return true;
    if ((h.includes('english') || h.includes('eng')) &&
        (sDept.includes('english') || sDept.includes('translation') || sDept.includes('digital humanities'))) return true;
    if ((h.includes('econ') || h.includes('economics')) && (sDept.includes('econ') || sDept.includes('data analytics'))) return true;
    if ((h.includes('chem') || h.includes('chemistry')) && (sDept.includes('chem') || sDept.includes('industrial process'))) return true;
    if ((h.includes('math') || h.includes('comput')) && (sDept.includes('math') || sDept.includes('comput') || sDept.includes('algorithm'))) return true;
    if ((h.includes('botan') || h.includes('botany')) && (sDept.includes('botan') || sDept.includes('tissue culture') || sDept.includes('agri'))) return true;
    if ((h.includes('zool') || h.includes('zoology')) && (sDept.includes('zool') || sDept.includes('biomedical'))) return true;
    if ((h.includes('hist') || h.includes('history')) && (sDept.includes('hist') || sDept.includes('tourism') || sDept.includes('heritage'))) return true;
    return false;
  };

  // Helper to extract paper for a student based on Course Type, Semester, and Paper Type
  const getStudentPaperForType = (
    student: Student,
    courseType: string,
    semester: string,
    paperType: string
  ): string | null => {
    const record = getRecordForStudent(student);

    if (courseType === 'Regular NEP' && record.regular) {
      const reg = record.regular;
      if (semester === 'Sem I' && reg.sem1) {
        if (paperType === 'Minor') return reg.sem1.minor || reg.minor1 || null;
        if (paperType === 'MDC') return reg.sem1.mdc || reg.mdc1 || null;
        if (paperType === 'AEC') return reg.sem1.aec || reg.aec1 || null;
        if (paperType === 'VAC') return reg.sem1.vac || reg.vac1 || null;
      }
      if (semester === 'Sem II' && reg.sem2) {
        if (paperType === 'Minor') return reg.sem2.minor || reg.minor2 || null;
        if (paperType === 'MDC') return reg.sem2.mdc || reg.mdc2 || null;
        if (paperType === 'AEC') return reg.sem2.aec || reg.aec2 || null;
        if (paperType === 'VAC') return reg.sem2.vac || reg.vac2 || null;
      }
      if (semester === 'Sem III' && reg.sem3) {
        if (paperType === 'Minor') return reg.sem3.minor || reg.minor1 || null;
        if (paperType === 'MDC') return reg.sem3.mdc || reg.mdc3 || null;
        if (paperType === 'VAC') return reg.sem3.vac || reg.vac2 || null;
        if (paperType === 'SEC') return reg.sec1 || null;
      }
      if (semester === 'Sem IV' && reg.sem4) {
        if (paperType === 'Minor') return reg.sem4.minor || reg.minor2 || null;
      }
      if (semester === 'Sem V' && reg.sem5) {
        if (paperType === 'Minor') return reg.sem5.minor || reg.minor1 || null;
        if (paperType === 'SEC') return reg.sem5.sec || reg.sec2 || null;
        if (paperType === 'VAC') return reg.sem5.vac || 'Understanding Odisha';
      }
      if (semester === 'Sem VI' && reg.sem6) {
        if (paperType === 'Minor') return reg.sem6.minor || reg.minor2 || null;
        if (paperType === 'SEC') return reg.sem6.sec || reg.sec3 || null;
        if (paperType === 'VAC') return reg.sem6.vac || 'Creative Writing';
      }
    }

    if (courseType === 'AEDP' && record.aedp) {
      const aedp = record.aedp;
      if (semester === 'Sem I' && aedp.sem1) {
        if (paperType === 'AEC') return aedp.sem1.aec1 || null;
        if (paperType === 'VAC') return aedp.sem1.vac1 || null;
      }
      if (semester === 'Sem II' && aedp.sem2) {
        if (paperType === 'AEC') return aedp.sem2.aec2 || null;
        if (paperType === 'VAC') return aedp.sem2.vac2 || null;
      }
      if (semester === 'Sem III' && aedp.sem3) {
        if (paperType === 'MDC') return aedp.sem3.mdc1 || null;
        if (paperType === 'SEC') return aedp.sem3.sec1 || null;
      }
      if (semester === 'Sem IV' && aedp.sem4) {
        if (paperType === 'MDC') return aedp.sem4.mdc2 || null;
        if (paperType === 'SEC') return aedp.sem4.sec2 || null;
      }
    }

    return null;
  };

  // Dynamically compute available Paper Names strictly from actual subject counselling data
  const availablePaperNames = useMemo(() => {
    if (!selectedCourseType || !selectedSemester || !selectedPaperType) return [];

    const set = new Set<string>();

    students.forEach((s) => {
      if (selectedYear && (s.academicYear || '2026-27') !== selectedYear) return;

      if (role === 'HOD' && hodDeptName) {
        if (!isStudentInHodDept(s, hodDeptName)) return;
      }

      const isAedp = Boolean(s.isAedp || s.department.toLowerCase().includes('aedp'));
      if (selectedCourseType === 'Regular NEP' && isAedp) return;
      if (selectedCourseType === 'AEDP' && !isAedp) return;

      const paper = getStudentPaperForType(s, selectedCourseType, selectedSemester, selectedPaperType);
      if (paper && paper.trim()) {
        set.add(paper.trim());
      }
    });

    return Array.from(set).sort();
  }, [selectedYear, selectedCourseType, selectedSemester, selectedPaperType, students, counsellingMap, role, hodDeptName]);

  // Check if all compulsory fields are selected
  const isAllCompulsorySelected = Boolean(
    selectedYear &&
    selectedSemester &&
    selectedCourseType &&
    selectedPaperType &&
    selectedPaperName
  );

  // Filtered Students Roster matching all 5 compulsory criteria
  const matchedStudents = useMemo(() => {
    if (!isAllCompulsorySelected) return [];

    return students.filter((s) => {
      if (role === 'HOD' && hodDeptName) {
        if (!isStudentInHodDept(s, hodDeptName)) return false;
      }

      const sYear = s.academicYear || '2026-27';
      if (sYear !== selectedYear) return false;

      const isAedp = Boolean(s.isAedp || s.department.toLowerCase().includes('aedp'));
      if (selectedCourseType === 'Regular NEP' && isAedp) return false;
      if (selectedCourseType === 'AEDP' && !isAedp) return false;

      const paper = getStudentPaperForType(s, selectedCourseType, selectedSemester, selectedPaperType);
      if (!paper) return false;

      const matchesPaper = paper.toLowerCase().trim() === selectedPaperName.toLowerCase().trim();
      if (!matchesPaper) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          (s.universityRollNo && s.universityRollNo.toLowerCase().includes(q)) ||
          s.samsRegNo.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q)
        );
      }

      return true;
    }).sort(compareStudentsByStreamDeptRoll);
  }, [
    isAllCompulsorySelected,
    students,
    selectedYear,
    selectedSemester,
    selectedCourseType,
    selectedPaperType,
    selectedPaperName,
    searchQuery,
    role,
    hodDeptName,
    counsellingMap,
  ]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = matchedStudents.length;
    const male = matchedStudents.filter((s) => s.gender === 'Male').length;
    const female = matchedStudents.filter((s) => s.gender === 'Female').length;
    const otherGender = total - male - female;

    const depts: Record<string, number> = {};
    matchedStudents.forEach((s) => {
      depts[s.department] = (depts[s.department] || 0) + 1;
    });

    return { total, male, female, otherGender, depts };
  }, [matchedStudents]);

  // Paginated Mark Foil Data: Each page has 50 slots (25 left column, 25 right column)
  const markFoilPages = useMemo(() => {
    const ROWS_PER_COLUMN = 25;
    const STUDENTS_PER_PAGE = 50;
    const totalStudents = matchedStudents.length;
    const totalPages = Math.max(1, Math.ceil(totalStudents / STUDENTS_PER_PAGE));

    const pages = [];
    for (let p = 0; p < totalPages; p++) {
      const pageStudents = matchedStudents.slice(p * STUDENTS_PER_PAGE, (p + 1) * STUDENTS_PER_PAGE);
      const leftRaw = pageStudents.slice(0, ROWS_PER_COLUMN);
      const rightRaw = pageStudents.slice(ROWS_PER_COLUMN, STUDENTS_PER_PAGE);

      // Pad left column to exactly 25 rows
      const leftList: (Student | null)[] = [...leftRaw];
      while (leftList.length < ROWS_PER_COLUMN) {
        leftList.push(null);
      }

      // Pad right column to exactly 25 rows
      const rightList: (Student | null)[] = [...rightRaw];
      while (rightList.length < ROWS_PER_COLUMN) {
        rightList.push(null);
      }

      pages.push({ pageNum: p + 1, leftList, rightList });
    }

    return pages;
  }, [matchedStudents]);

  // --- EXPORT HANDLERS ---

  // 1. Export Student Paper Roster to Excel
  const handleExportExcel = () => {
    if (matchedStudents.length === 0) return;

    const exportData = matchedStudents.map((s, idx) => ({
      'Sl No': idx + 1,
      'Academic Session': selectedYear,
      Semester: selectedSemester,
      'Course Type': selectedCourseType,
      'Paper Type': selectedPaperType,
      'Paper Name': selectedPaperName,
      'College Roll No': s.rollNo,
      'University Roll No': s.universityRollNo || 'N/A',
      'Student Name': s.name,
      'Parent Name': s.parentName || 'N/A',
      Mobile: s.mobileNumber || s.phone || 'N/A',
      Stream: s.stream,
      'Honours / Dept': s.department,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${selectedPaperType}_Roster`);
    XLSX.writeFile(workbook, `${selectedCourseType}_${selectedSemester}_${selectedPaperType}_${selectedPaperName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
  };

  // 2. Export Attendance Register to Excel
  const handleExportAttendanceExcel = () => {
    if (matchedStudents.length === 0) return;

    const exportData = matchedStudents.map((s, idx) => {
      const row: Record<string, any> = {
        'Sl No': idx + 1,
        'College Roll No': s.rollNo,
        'University Roll No': s.universityRollNo || 'N/A',
        'Student Name': s.name,
      };
      for (let day = 1; day <= 31; day++) {
        row[`Day ${day}`] = '';
      }
      row['Total Present'] = '';
      row['Signature'] = '';
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Attendance_Register`);
    XLSX.writeFile(workbook, `Attendance_Sheet_${selectedPaperType}_${selectedPaperName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
  };

  // 3. Export Mark Foil to Excel
  const handleExportMarkFoilExcel = () => {
    if (matchedStudents.length === 0) return;

    const exportData = matchedStudents.map((s, idx) => ({
      'Sl No': idx + 1,
      'Roll / Code Number': s.rollNo,
      'University Roll No': s.universityRollNo || 'N/A',
      'Student Name': s.name,
      'Subject / Course': `${selectedCourseType} (${selectedPaperType})`,
      'Paper Name': selectedPaperName,
      'Full Marks': fullMarks || '100',
      'Marks Obtained (In Figures)': '',
      'Marks Obtained (In Words)': '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Mark_Foil`);
    XLSX.writeFile(workbook, `Mark_Foil_${selectedPaperType}_${selectedPaperName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
  };

  // --- PRINT HANDLERS ---

  // 1. Print Student Roster
  const handlePrint = () => {
    if (matchedStudents.length === 0) return;

    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${selectedCourseType} - ${selectedSemester} - ${selectedPaperType}: ${selectedPaperName}</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #111; }
                .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
                h1 { font-size: 18px; margin: 0 0 4px 0; text-transform: uppercase; }
                p { font-size: 11px; color: #333; margin: 2px 0; font-family: monospace; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
                th, td { border: 1px solid #999; padding: 6px 8px; text-align: left; }
                th { background-color: #f1f5f9; font-weight: bold; font-size: 10px; text-transform: uppercase; }
                tr:nth-child(even) { background-color: #f8fafc; }
                @page { size: auto; margin: 12mm; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>SAMS UG ADMISSION • ALLOTTED PAPER ROSTER</h1>
                <p>SESSION: <strong>${selectedYear}</strong> | SEMESTER: <strong>${selectedSemester}</strong> | COURSE TYPE: <strong>${selectedCourseType}</strong> | PAPER TYPE: <strong>${selectedPaperType}</strong></p>
                <p>PAPER NAME: <strong>${selectedPaperName}</strong> | TOTAL ALLOTTED STUDENTS: <strong>${matchedStudents.length}</strong></p>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Sl</th>
                    <th>College Roll</th>
                    <th>Univ Roll</th>
                    <th>Student Name</th>
                    <th>Mobile No</th>
                    <th>Stream</th>
                    <th>Department</th>
                  </tr>
                </thead>
                <tbody>
                  ${matchedStudents.map((s, idx) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td><strong>${s.rollNo}</strong></td>
                      <td>${s.universityRollNo || 'N/A'}</td>
                      <td><strong>${s.name}</strong></td>
                      <td>${s.mobileNumber || s.phone || 'N/A'}</td>
                      <td>${s.stream}</td>
                      <td>${s.department}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
        return;
      }
    } catch {}

    window.print();
  };

  // 2. Print Attendance Register Form
  const handlePrintAttendanceForm = () => {
    if (matchedStudents.length === 0) return;

    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>ATTENDANCE REGISTER - ${selectedPaperName}</title>
              <style>
                @page { size: landscape; margin: 8mm; }
                body { font-family: system-ui, -apple-system, sans-serif; padding: 10px; color: #000; background: #fff; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
                .header h1 { font-size: 16px; margin: 0; text-transform: uppercase; font-weight: bold; }
                .header p { font-size: 11px; margin: 3px 0; font-family: monospace; }
                table { width: 100%; border-collapse: collapse; font-size: 10px; }
                th, td { border: 1px solid #000; padding: 4px 3px; text-align: center; }
                th { background-color: #f1f5f9; font-weight: bold; font-size: 9px; }
                .text-left { text-align: left; }
                .day-col { width: 18px; min-width: 18px; font-size: 8px; }
                .footer-row td { font-weight: bold; font-size: 10px; background: #fafafa; }
                .sig-container { margin-top: 35px; display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>SAMS UG ADMISSION • STUDENT CLASS ATTENDANCE REGISTER</h1>
                <p>SESSION: <strong>${selectedYear}</strong> | SEMESTER: <strong>${selectedSemester}</strong> | COURSE: <strong>${selectedCourseType}</strong> | PAPER TYPE: <strong>${selectedPaperType}</strong></p>
                <p>PAPER NAME: <strong>${selectedPaperName}</strong> | MONTH/SESSION: <strong>${attendanceMonth || '________'}</strong> | TOTAL ENROLLED: <strong>${matchedStudents.length}</strong></p>
              </div>

              <table>
                <thead>
                  <tr>
                    <th style="width: 25px;">Sl</th>
                    <th style="width: 80px;">College Roll</th>
                    <th style="width: 85px;">Univ Roll</th>
                    <th class="text-left" style="width: 140px;">Student Name</th>
                    ${Array.from({ length: 31 }, (_, i) => `<th class="day-col">${i + 1}</th>`).join('')}
                    <th style="width: 45px;">Total</th>
                    <th style="width: 80px;">Signature</th>
                  </tr>
                </thead>
                <tbody>
                  ${matchedStudents.map((s, idx) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td><strong>${s.rollNo}</strong></td>
                      <td>${s.universityRollNo || 'N/A'}</td>
                      <td class="text-left"><strong>${s.name}</strong></td>
                      ${Array.from({ length: 31 }, () => `<td></td>`).join('')}
                      <td></td>
                      <td></td>
                    </tr>
                  `).join('')}
                  <tr class="footer-row">
                    <td colspan="4" class="text-left" style="padding: 8px;">TOTAL CLASSES CONDUCTED / PRESENT COUNT:</td>
                    ${Array.from({ length: 31 }, () => `<td></td>`).join('')}
                    <td></td>
                    <td></td>
                  </tr>
                  <tr class="footer-row">
                    <td colspan="4" class="text-left" style="padding: 8px;">FACULTY INITIALS / SIGNATURE:</td>
                    ${Array.from({ length: 31 }, () => `<td></td>`).join('')}
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>

              <div class="sig-container">
                <div>Signature of Subject Teacher / Instructor: ______________________</div>
                <div>Signature of Head of Department (HOD): ______________________</div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
        return;
      }
    } catch {}

    window.print();
  };

  // 3. Print Official Mark Foil Sheet strictly fitted to A4 paper (25 rows per column, 2 columns per A4 page)
  const handlePrintMarkFoil = () => {
    if (matchedStudents.length === 0) return;

    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>MARK FOIL - ${selectedPaperName}</title>
              <style>
                @page { size: A4 portrait; margin: 8mm 10mm; }
                *, *:before, *:after { box-sizing: border-box; }
                html, body { width: 100%; height: 100%; margin: 0; padding: 0; color: #000; background: #fff; font-family: 'Times New Roman', Times, serif, system-ui; }
                .mark-foil-page {
                  width: 100%;
                  height: 278mm;
                  box-sizing: border-box;
                  page-break-after: always;
                  break-after: page;
                  page-break-inside: avoid;
                  break-inside: avoid;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  padding: 1mm 0;
                }
                .mark-foil-page:last-child {
                  page-break-after: auto;
                  break-after: auto;
                }
                .container {
                  display: flex;
                  gap: 16px;
                  justify-content: space-between;
                  width: 100%;
                  height: 100%;
                }
                .foil-column {
                  width: 48.5%;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  height: 100%;
                }
                .top-set { text-align: right; font-size: 11px; margin-bottom: 4px; }
                .header-line { margin: 2px 0; font-size: 10.5px; line-height: 1.25; }
                .double-divider { border-top: 2.5px double #000; margin: 4px 0 6px 0; }
                table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-top: 0; }
                th, td { border: 1px solid #000; padding: 2px 4px; height: 7.5mm; min-height: 7.5mm; vertical-align: middle; }
                th { text-align: center; font-weight: normal; font-size: 10.5px; height: 6.5mm; }
                .th-title { border-bottom: 1px solid #000; font-weight: normal; }
                .center { text-align: center; }
                .footer-sec { margin-top: 8px; font-size: 11px; line-height: 1.4; }
                .footer-line { margin-top: 4px; }
              </style>
            </head>
            <body>
              ${markFoilPages.map((pg) => `
                <div class="mark-foil-page">
                  <div class="container">
                    <!-- Left Foil Column -->
                    <div class="foil-column">
                      <div>
                        <div class="top-set">Set / Year ........................... <strong>${selectedYear || ''}</strong></div>
                        <div class="header-line">EXAMINATION ........................................................................ <strong>${selectedSemester}</strong></div>
                        <div class="header-line">Subject .................................................................................... <strong>${selectedCourseType} (${selectedPaperType})</strong></div>
                        <div class="header-line">Paper ........................................ Full Marks .................... <strong>${selectedPaperName} | ${fullMarks || '100'}</strong></div>
                        <div class="header-line">Course No. ............................................................................. <strong>${selectedPaperType}</strong></div>
                        <div class="double-divider"></div>

                        <table>
                          <thead>
                            <tr>
                              <th rowspan="2" style="width: 42%; text-align: left; vertical-align: middle; padding-left: 6px;">Roll / Code Number</th>
                              <th colspan="2" class="th-title">Marks Obtained</th>
                            </tr>
                            <tr>
                              <th style="width: 23%;" class="center">In figures</th>
                              <th style="width: 35%;" class="center">In Words</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${pg.leftList.map((s) => `
                              <tr>
                                <td style="font-weight: bold; font-family: monospace; font-size: 11px;">${s ? s.rollNo : '&nbsp;'}</td>
                                <td></td>
                                <td></td>
                              </tr>
                            `).join('')}
                          </tbody>
                        </table>
                      </div>

                      <div class="footer-sec">
                        <div class="footer-line">Signature of the Examiner</div>
                        <div class="footer-line">Date ....................................................</div>
                      </div>
                    </div>

                    <!-- Right Foil Column -->
                    <div class="foil-column">
                      <div>
                        <div class="top-set">Set / Year ........................... <strong>${selectedYear || ''}</strong></div>
                        <div class="header-line">EXAMINATION ........................................................................ <strong>${selectedSemester}</strong></div>
                        <div class="header-line">Subject .................................................................................... <strong>${selectedCourseType} (${selectedPaperType})</strong></div>
                        <div class="header-line">Paper ........................................ Full Marks .................... <strong>${selectedPaperName} | ${fullMarks || '100'}</strong></div>
                        <div class="header-line">Course No. ............................................................................. <strong>${selectedPaperType}</strong></div>
                        <div class="double-divider"></div>

                        <table>
                          <thead>
                            <tr>
                              <th rowspan="2" style="width: 42%; text-align: left; vertical-align: middle; padding-left: 6px;">Roll / Code Number</th>
                              <th colspan="2" class="th-title">Marks Obtained</th>
                            </tr>
                            <tr>
                              <th style="width: 23%;" class="center">In figures</th>
                              <th style="width: 35%;" class="center">In Words</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${pg.rightList.map((s) => `
                              <tr>
                                <td style="font-weight: bold; font-family: monospace; font-size: 11px;">${s ? s.rollNo : '&nbsp;'}</td>
                                <td></td>
                                <td></td>
                              </tr>
                            `).join('')}
                          </tbody>
                        </table>
                      </div>

                      <div class="footer-sec">
                        <div class="footer-line">Signature of the Examiner</div>
                        <div class="footer-line">Date ....................................................</div>
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
        return;
      }
    } catch {}

    window.print();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title Banner */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono mb-1">
            <BookCheck className="w-4 h-4" />
            <span>NEP 2020 SUBJECT ALLOTMENT MATRIX • MINOR, MDC, AEC, VAC, SEC INQUIRY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
            Access Minor, MDC, AEC, VAC, SEC
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Select compulsory parameters (Session, Semester, Course Type, Paper Type, and Paper Name) to inspect paper allotments, generate student attendance registers, or produce official mark foils.
          </p>
        </div>
      </div>

      {/* Compulsory Option Selectors Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wide">
              Compulsory Paper Filter Selection
            </h2>
          </div>
          <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
            All 5 choices compulsory *
          </span>
        </div>

        {/* 5 Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          {/* 1. Academic Year */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold font-mono text-[11px] flex items-center justify-between">
              <span>1. Year / Session *</span>
              {selectedYear ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="text-amber-400 text-[10px]">Required</span>
              )}
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500 ${
                selectedYear ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-slate-700'
              }`}
            >
              <option value="">-- Choose Year --</option>
              {academicYearOptions.map((yr) => (
                <option key={yr} value={yr}>
                  Session {yr}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Semester */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold font-mono text-[11px] flex items-center justify-between">
              <span>2. Semester *</span>
              {selectedSemester ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="text-amber-400 text-[10px]">Required</span>
              )}
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500 ${
                selectedSemester ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-slate-700'
              }`}
            >
              <option value="">-- Choose Semester --</option>
              {semesterOptions.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Course Type */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold font-mono text-[11px] flex items-center justify-between">
              <span>3. Course Type *</span>
              {selectedCourseType ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="text-amber-400 text-[10px]">Required</span>
              )}
            </label>
            <select
              value={selectedCourseType}
              onChange={(e) => setSelectedCourseType(e.target.value)}
              className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500 ${
                selectedCourseType ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-slate-700'
              }`}
            >
              <option value="">-- Choose Course Type --</option>
              {courseTypeOptions.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Paper Type */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold font-mono text-[11px] flex items-center justify-between">
              <span>4. Paper Type *</span>
              {selectedPaperType ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="text-amber-400 text-[10px]">Required</span>
              )}
            </label>
            <select
              value={selectedPaperType}
              onChange={(e) => {
                setSelectedPaperType(e.target.value);
                setSelectedPaperName('');
              }}
              className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500 ${
                selectedPaperType ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-slate-700'
              }`}
            >
              <option value="">-- Choose Paper Type --</option>
              {paperTypeOptions.map((pt) => (
                <option key={pt} value={pt}>
                  {pt} Paper
                </option>
              ))}
            </select>
          </div>

          {/* 5. Paper Name */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold font-mono text-[11px] flex items-center justify-between">
              <span>5. Paper Name *</span>
              {selectedPaperName ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="text-amber-400 text-[10px]">Required</span>
              )}
            </label>
            <select
              value={selectedPaperName}
              onChange={(e) => setSelectedPaperName(e.target.value)}
              disabled={!selectedCourseType || !selectedSemester || !selectedPaperType}
              className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedPaperName ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-slate-700'
              }`}
            >
              <option value="">
                {!selectedPaperType
                  ? '-- Select Paper Type First --'
                  : '-- Choose Paper Name --'}
              </option>
              {availablePaperNames.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selection Status Summary Bar */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-mono font-bold">Selected Criteria:</span>
            <span
              className={`px-2.5 py-1 rounded-lg font-mono font-semibold text-[11px] ${
                selectedYear
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              Year: {selectedYear || 'Pending'}
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg font-mono font-semibold text-[11px] ${
                selectedSemester
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              Semester: {selectedSemester || 'Pending'}
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg font-mono font-semibold text-[11px] ${
                selectedCourseType
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              Course: {selectedCourseType || 'Pending'}
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg font-mono font-semibold text-[11px] ${
                selectedPaperType
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              Paper Type: {selectedPaperType || 'Pending'}
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg font-mono font-semibold text-[11px] ${
                selectedPaperName
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              Paper: {selectedPaperName || 'Pending'}
            </span>
          </div>

          <div className="text-[11px] font-mono">
            {isAllCompulsorySelected ? (
              <span className="text-emerald-400 font-bold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> All Compulsory Choices Completed
              </span>
            ) : (
              <span className="text-amber-400 font-bold flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1" /> Selection Incomplete (Select All 5 Options)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Results View */}
      {!isAllCompulsorySelected ? (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-12 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white font-serif">
            Compulsory Filter Selection Required
          </h3>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Please choose Year, Semester, Course Type, Paper Type, and Paper Name from the dropdowns above. Selecting each option is compulsory to generate attendance forms or mark foils.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sub-Tab Navigation Bar */}
          <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-xl">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveSubTab('roster')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
                  activeSubTab === 'roster'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>1. Student Paper Allotment Roster</span>
              </button>

              <button
                onClick={() => setActiveSubTab('attendance')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
                  activeSubTab === 'attendance'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>2. Generate Attendance Form</span>
              </button>

              <button
                onClick={() => setActiveSubTab('markfoil')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
                  activeSubTab === 'markfoil'
                    ? 'bg-purple-500 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>3. Generate Mark Foil</span>
              </button>
            </div>

            <div className="text-xs text-slate-400 font-mono px-3">
              Total Students: <strong className="text-amber-400 font-bold">{matchedStudents.length}</strong> | Pages: <strong className="text-purple-300 font-bold">{markFoilPages.length}</strong>
            </div>
          </div>

          {/* SUB-TAB 1: Student Paper Roster */}
          {activeSubTab === 'roster' && (
            <div className="space-y-6">
              {/* Action Bar */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleExportExcel}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center space-x-1.5 transition active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export Roster Excel</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs border border-amber-400 shadow-lg flex items-center space-x-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-1">
                  <div className="text-xs text-slate-400 font-mono font-semibold">Total Enrolled Students</div>
                  <div className="text-2xl font-extrabold text-amber-400 font-mono">{stats.total}</div>
                  <div className="text-[11px] text-slate-500">{selectedPaperName}</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-1">
                  <div className="text-xs text-slate-400 font-mono font-semibold">Gender Distribution</div>
                  <div className="text-lg font-bold text-white font-mono flex items-center space-x-3">
                    <span className="text-cyan-400">Male: {stats.male}</span>
                    <span className="text-pink-400">Female: {stats.female}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">Ratio: {stats.total > 0 ? Math.round((stats.female / stats.total) * 100) : 0}% Female</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-1">
                  <div className="text-xs text-slate-400 font-mono font-semibold">Course & Semester</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">{selectedSemester} • {selectedCourseType}</div>
                  <div className="text-[11px] text-slate-500">Session {selectedYear}</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-1">
                  <div className="text-xs text-slate-400 font-mono font-semibold">Paper Type</div>
                  <div className="text-lg font-bold text-purple-300 font-mono">{selectedPaperType} Paper</div>
                  <div className="text-[11px] text-slate-500">{Object.keys(stats.depts).length} Departments Represented</div>
                </div>
              </div>

              {/* Roster Table Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4">
                <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search student name, roll no, SAMS reg..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="text-slate-400 font-mono text-[11px]">
                    Showing <strong>{matchedStudents.length}</strong> students allotted to <strong className="text-amber-300">{selectedPaperName}</strong>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-200 font-mono">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-3">Sl</th>
                        <th className="py-3.5 px-3">College Roll</th>
                        <th className="py-3.5 px-3">Univ Roll</th>
                        <th className="py-3.5 px-3">Student Name</th>
                        <th className="py-3.5 px-3">Stream / Dept</th>
                        <th className="py-3.5 px-3">Allotted Paper ({selectedPaperType})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {matchedStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 space-y-2">
                            <p>No student paper allotments found matching this exact combination.</p>
                          </td>
                        </tr>
                      ) : (
                        matchedStudents.map((s, idx) => (
                          <tr key={s.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                            <td className="py-3 px-3 font-bold text-amber-300">{s.rollNo}</td>
                            <td className="py-3 px-3 text-cyan-300">{s.universityRollNo || 'N/A'}</td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-white font-sans">{s.name}</div>
                              <div className="text-[10px] text-slate-400">
                                Father: {s.parentName || 'N/A'} • <span className="text-amber-300 font-mono">Mobile: {s.mobileNumber || s.phone || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="text-purple-300 font-semibold">{s.stream}</div>
                              <div className="text-[10px] text-slate-400">{s.department}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold inline-block text-[11px]">
                                {selectedPaperName}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: Generate Attendance Form */}
          {activeSubTab === 'attendance' && (
            <div className="space-y-6">
              {/* Controls Bar */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3 text-xs">
                  <label className="font-bold text-slate-300 font-mono">Month / Session:</label>
                  <input
                    type="text"
                    value={attendanceMonth}
                    onChange={(e) => setAttendanceMonth(e.target.value)}
                    placeholder="e.g. August 2026"
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500 w-48"
                  />
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={handleExportAttendanceExcel}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center space-x-1.5 transition active:scale-95"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export Attendance Excel</span>
                  </button>
                  <button
                    onClick={handlePrintAttendanceForm}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg flex items-center space-x-1.5 transition active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Attendance Register (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Attendance Sheet Interactive Preview */}
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl overflow-x-auto space-y-4">
                <div className="text-center border-b border-slate-800 pb-4">
                  <h3 className="text-lg font-bold text-white font-serif uppercase tracking-tight">
                    SAMS UG ADMISSION • CLASS ATTENDANCE REGISTER
                  </h3>
                  <div className="text-xs text-amber-400 font-mono mt-1 font-semibold flex flex-wrap justify-center gap-4">
                    <span>Session: {selectedYear}</span>
                    <span>Semester: {selectedSemester}</span>
                    <span>Course: {selectedCourseType}</span>
                    <span>Paper Type: {selectedPaperType}</span>
                    <span>Paper Name: {selectedPaperName}</span>
                    <span>Month: {attendanceMonth || '________'}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs text-slate-200 font-mono border-collapse border border-slate-800">
                    <thead className="bg-slate-900 text-slate-300 text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="border border-slate-800 p-2 w-10">Sl</th>
                        <th className="border border-slate-800 p-2 w-28">College Roll</th>
                        <th className="border border-slate-800 p-2 w-28">Univ Roll</th>
                        <th className="border border-slate-800 p-2 text-left w-48">Student Name</th>
                        {Array.from({ length: 31 }, (_, i) => (
                          <th key={i} className="border border-slate-800 p-1 w-6 text-[9px] text-amber-300 font-bold">
                            {i + 1}
                          </th>
                        ))}
                        <th className="border border-slate-800 p-2 w-16 text-emerald-400">Total</th>
                        <th className="border border-slate-800 p-2 w-24">Signature</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {matchedStudents.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-slate-900/60 transition">
                          <td className="border border-slate-800 p-2 text-slate-500">{idx + 1}</td>
                          <td className="border border-slate-800 p-2 font-bold text-amber-300">{s.rollNo}</td>
                          <td className="border border-slate-800 p-2 text-cyan-300">{s.universityRollNo || 'N/A'}</td>
                          <td className="border border-slate-800 p-2 text-left font-bold text-white font-sans">{s.name}</td>
                          {Array.from({ length: 31 }, (_, i) => (
                            <td key={i} className="border border-slate-800 p-1 text-[10px]"></td>
                          ))}
                          <td className="border border-slate-800 p-2"></td>
                          <td className="border border-slate-800 p-2"></td>
                        </tr>
                      ))}
                      <tr className="bg-slate-900/80 font-bold text-slate-300">
                        <td colSpan={4} className="border border-slate-800 p-3 text-left">
                          TOTAL CLASSES CONDUCTED / PRESENT COUNT:
                        </td>
                        {Array.from({ length: 31 }, (_, i) => (
                          <td key={i} className="border border-slate-800 p-1"></td>
                        ))}
                        <td className="border border-slate-800 p-2"></td>
                        <td className="border border-slate-800 p-2"></td>
                      </tr>
                      <tr className="bg-slate-900/80 font-bold text-slate-300">
                        <td colSpan={4} className="border border-slate-800 p-3 text-left">
                          FACULTY INITIALS / SIGNATURE:
                        </td>
                        {Array.from({ length: 31 }, (_, i) => (
                          <td key={i} className="border border-slate-800 p-1"></td>
                        ))}
                        <td className="border border-slate-800 p-2"></td>
                        <td className="border border-slate-800 p-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between text-xs font-mono font-bold text-slate-400 pt-6">
                  <div>Signature of Subject Teacher / Instructor: ______________________</div>
                  <div>Signature of Head of Department (HOD): ______________________</div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: Generate Mark Foil Strictly Following Photo Format */}
          {activeSubTab === 'markfoil' && (
            <div className="space-y-6">
              {/* Controls Bar */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3 text-xs">
                  <label className="font-bold text-slate-300 font-mono">Full Marks:</label>
                  <input
                    type="text"
                    value={fullMarks}
                    onChange={(e) => setFullMarks(e.target.value)}
                    placeholder="e.g. 100"
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-purple-500 w-28"
                  />
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={handleExportMarkFoilExcel}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center space-x-1.5 transition active:scale-95"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export Mark Foil Excel</span>
                  </button>
                  <button
                    onClick={handlePrintMarkFoil}
                    className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-extrabold text-xs shadow-lg flex items-center space-x-1.5 transition active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Official Mark Foil (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Mark Foil Interactive Preview (Strictly matching photo structure) */}
              <div className="space-y-8">
                {markFoilPages.map((pg) => (
                  <div key={pg.pageNum} className="bg-white text-slate-950 p-8 rounded-3xl shadow-2xl border border-slate-300 font-serif space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-300 pb-2 text-xs font-mono font-bold text-slate-600">
                      <span>OFFICIAL EXAMINATION MARK FOIL</span>
                      <span>PAGE {pg.pageNum} OF {markFoilPages.length}</span>
                    </div>

                    {/* Side by Side 2-Column Foil */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-serif leading-snug">
                      {/* Left Foil Column */}
                      <div className="flex flex-col justify-between space-y-2 border-r md:border-r md:border-slate-300 pr-0 md:pr-4">
                        <div>
                          <div className="text-right text-xs mb-1">Set / Year ........................... <strong>{selectedYear || ''}</strong></div>
                          <div className="text-xs my-0.5">EXAMINATION ........................................................................ <strong>{selectedSemester}</strong></div>
                          <div className="text-xs my-0.5">Subject .................................................................................... <strong>{selectedCourseType} ({selectedPaperType})</strong></div>
                          <div className="text-xs my-0.5">Paper ........................................ Full Marks .................... <strong>{selectedPaperName} | {fullMarks || '100'}</strong></div>
                          <div className="text-xs my-0.5">Course No. ............................................................................. <strong>{selectedPaperType}</strong></div>
                          <div className="border-t-2 border-b border-slate-950 my-2"></div>

                          <table className="w-full border-collapse border border-slate-900 text-xs">
                            <thead>
                              <tr>
                                <th rowSpan={2} className="border border-slate-900 p-1 text-left font-normal w-5/12">Roll / Code Number</th>
                                <th colSpan={2} className="border border-slate-900 p-1 text-center font-normal">Marks Obtained</th>
                              </tr>
                              <tr>
                                <th className="border border-slate-900 p-1 text-center font-normal w-3/12">In figures</th>
                                <th className="border border-slate-900 p-1 text-center font-normal w-4/12">In Words</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pg.leftList.map((s, idx) => (
                                <tr key={idx} className="h-7">
                                  <td className="border border-slate-900 px-2 py-0.5 font-bold font-mono text-[11px]">
                                    {s ? s.rollNo : '\u00A0'}
                                  </td>
                                  <td className="border border-slate-900 px-2 py-0.5"></td>
                                  <td className="border border-slate-900 px-2 py-0.5"></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="pt-4 text-xs space-y-2">
                          <div>Signature of the Examiner</div>
                          <div>Date ....................................................</div>
                        </div>
                      </div>

                      {/* Right Foil Column */}
                      <div className="flex flex-col justify-between space-y-2">
                        <div>
                          <div className="text-right text-xs mb-1">Set / Year ........................... <strong>{selectedYear || ''}</strong></div>
                          <div className="text-xs my-0.5">EXAMINATION ........................................................................ <strong>{selectedSemester}</strong></div>
                          <div className="text-xs my-0.5">Subject .................................................................................... <strong>{selectedCourseType} ({selectedPaperType})</strong></div>
                          <div className="text-xs my-0.5">Paper ........................................ Full Marks .................... <strong>{selectedPaperName} | {fullMarks || '100'}</strong></div>
                          <div className="text-xs my-0.5">Course No. ............................................................................. <strong>{selectedPaperType}</strong></div>
                          <div className="border-t-2 border-b border-slate-950 my-2"></div>

                          <table className="w-full border-collapse border border-slate-900 text-xs">
                            <thead>
                              <tr>
                                <th rowSpan={2} className="border border-slate-900 p-1 text-left font-normal w-5/12">Roll / Code Number</th>
                                <th colSpan={2} className="border border-slate-900 p-1 text-center font-normal">Marks Obtained</th>
                              </tr>
                              <tr>
                                <th className="border border-slate-900 p-1 text-center font-normal w-3/12">In figures</th>
                                <th className="border border-slate-900 p-1 text-center font-normal w-4/12">In Words</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pg.rightList.map((s, idx) => (
                                <tr key={idx} className="h-7">
                                  <td className="border border-slate-900 px-2 py-0.5 font-bold font-mono text-[11px]">
                                    {s ? s.rollNo : '\u00A0'}
                                  </td>
                                  <td className="border border-slate-900 px-2 py-0.5"></td>
                                  <td className="border border-slate-900 px-2 py-0.5"></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="pt-4 text-xs space-y-2">
                          <div>Signature of the Examiner</div>
                          <div>Date ....................................................</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
