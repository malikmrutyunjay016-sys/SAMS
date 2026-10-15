import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { createDriveBackupSnapshot, parseSnapshotFile } from '../lib/driveService';
import * as XLSX from 'xlsx';
import {
  ShieldCheck,
  Radio,
  Cloud,
  Download,
  Upload,
  Database,
  Edit2,
  Lock,
  History,
  Search,
  Filter,
  RefreshCw,
  Save,
  CheckCircle2,
  XCircle,
  Building2,
  FileSpreadsheet,
  RotateCcw,
  Plus
} from 'lucide-react';

export const AdminPortalView: React.FC<{ onOpenAdminModal: () => void }> = ({ onOpenAdminModal }) => {
  const {
    students,
    seatMatrix,
    spotCandidates,
    auditLogs,
    hodAccounts,
    systemSettings,
    notices,
    faculty,
    toggleSpotRound,
    updateSeatMatrixItem,
    resetSeatMatrixToBenchmark,
    updateHodPassword,
    updateStudentRollNo,
    bulkImportStudents,
    syncSamsGoogleSheet,
    restoreSystemFromSnapshot,
    addAuditLog
  } = useData();

  const { isAdmin, logout } = useAuth();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'control' | 'students' | 'add-students' | 'seats' | 'hods' | 'drive' | 'audit'
  >('control');

  // Student Manager State
  const [studentSearch, setStudentSearch] = useState('');
  const [streamFilter, setStreamFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingRollNo, setEditingRollNo] = useState('');
  const [sheetUrlInput, setSheetUrlInput] = useState(systemSettings.sheetSyncUrl || '');
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // HOD Manager State
  const [editingHodDeptId, setEditingHodDeptId] = useState<string | null>(null);
  const [newHodPassword, setNewHodPassword] = useState('');
  const [newHodName, setNewHodName] = useState('');

  // Seat Matrix Editor State
  const [editingSeatId, setEditingSeatId] = useState<string | null>(null);
  const [newSanctioned, setNewSanctioned] = useState<number>(32);

  // Google Drive Cloud Backup State
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupStatusMsg, setBackupStatusMsg] = useState('');

  if (!isAdmin) {
    return (
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto my-12 shadow-2xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white font-serif">
          Super Admin Restricted Access
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          Super Admin authentication required to access live Spot Round controls, 1,100+ student database manager, seat matrix editor, HOD password manager, and Google Drive cloud backups.
        </p>
        <button
          onClick={onOpenAdminModal}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs shadow-lg"
        >
          Super Admin Login
        </button>
      </div>
    );
  }

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.samsRegNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.barcode && s.barcode.toLowerCase().includes(studentSearch.toLowerCase()));
    const matchesStream = streamFilter === 'ALL' || s.stream === streamFilter;
    const matchesCat = categoryFilter === 'ALL' || s.category === categoryFilter;
    return matchesSearch && matchesStream && matchesCat;
  });

  // Download Sample Excel Template
  const handleDownloadExcelTemplate = () => {
    const templateData = [
      {
        'Name': 'Rajesh Kumar Sahoo',
        'Barcode': 'BAR-982314',
        'Father Name/Mother Name': 'Bikash Sahoo / Sunita Sahoo',
        'Category': 'GEN',
        'Date of Birth': '2005-06-15',
        'Maximum Marks': 500,
        'Marks Secured': 430,
        'Percentage': 86.0,
        'Stream': 'Science',
        'Department': 'Physics',
        'SAMS Reg No': '24D18901',
        'Roll No': 'BS24-101',
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Import Template');
    XLSX.writeFile(wb, 'SAMS_Student_Import_Template.xlsx');
  };

  // Export Students to Excel
  const handleExportStudentsExcel = () => {
    const wsData = filteredStudents.map((s) => ({
      'SAMS Reg No': s.samsRegNo,
      'University Roll No': s.rollNo,
      'Student Name': s.name,
      'Barcode': s.barcode || '',
      'Father Name/Mother Name': s.parentName || '',
      'Category': s.category,
      'Date of Birth': s.dob || '',
      'Maximum Marks': s.maxMarks || 500,
      'Marks Secured': s.marksSecured || 400,
      'Percentage (%)': s.marksPercentage,
      'Department': s.department,
      'Stream': s.stream,
      'Gender': s.gender,
      'Phone': s.phone,
      'Status': s.status,
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SAMS Students Database');
    XLSX.writeFile(wb, `SAMS_Baragada_Students_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Upload Excel / CSV file with Name, Barcode, Father/Mother name, Category, DOB, Max Marks, Marks Secured, Percentage
  const handleFileUploadXLSX = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json<any>(ws);

        const imported: any[] = rawData.map((row, idx) => {
          const maxMarksVal = parseFloat(row['Maximum Marks'] || row['Max Marks'] || row['maxMarks']) || 500;
          const securedVal = parseFloat(row['Marks Secured'] || row['Secured Marks'] || row['marksSecured']) || 400;
          const pctVal = parseFloat(row['Percentage'] || row['Marks %'] || row['%'] || row['percentage']) || parseFloat(((securedVal / maxMarksVal) * 100).toFixed(1));

          return {
            id: `imp_${Date.now()}_${idx}`,
            name: row['Student Name'] || row['Name'] || row['name'] || 'Student',
            barcode: row['Barcode'] || row['barcode'] || `BAR-${Math.floor(100000 + Math.random() * 900000)}`,
            parentName: row['Father Name/Mother Name'] || row['Parent Name'] || row['Father Name'] || row['Mother Name'] || row['parentName'] || 'Parent',
            category: row['Category'] || row['category'] || 'GEN',
            dob: row['Date of Birth'] || row['DOB'] || row['dob'] || '2005-01-01',
            maxMarks: maxMarksVal,
            marksSecured: securedVal,
            marksPercentage: pctVal,
            rollNo: row['University Roll No'] || row['Roll No'] || row['rollNo'] || `BS24-${idx + 500}`,
            samsRegNo: row['SAMS Reg No'] || row['Reg No'] || row['samsRegNo'] || `24D${15000 + idx}`,
            department: row['Department'] || row['department'] || 'Physics',
            stream: row['Stream'] || row['stream'] || 'Science',
            isAedp: false,
            bloodGroup: row['Blood Group'] || 'O+',
            phone: row['Phone'] || row['phone'] || '9437000000',
            gender: row['Gender'] || 'Male',
            status: row['Status'] || 'Admitted',
            updatedAt: new Date().toISOString(),
          };
        });

        bulkImportStudents(imported);
        alert(`Successfully imported ${imported.length} student records into database with Name, Barcode, Parent Name, Category, DOB, and Marks.`);
        setActiveAdminTab('students');
      } catch (err) {
        alert('Error parsing Excel file. Please ensure valid columns (Name, Barcode, Father Name/Mother Name, Category, DOB, Maximum Marks, Marks Secured, Percentage).');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Sync Google Sheet
  const handleGoogleSheetSync = async () => {
    setIsSyncingSheet(true);
    setSyncMessage('');
    const syncedCount = await syncSamsGoogleSheet(sheetUrlInput);
    setIsSyncingSheet(false);
    setSyncMessage(`Successfully synced ${syncedCount} records from live SAMS Google Sheet!`);
  };

  // Trigger Google Drive Snapshot Backup
  const handleTriggerDriveBackup = async () => {
    setIsCreatingBackup(true);
    setBackupStatusMsg('');

    const snapshot = {
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      college: systemSettings.collegeName,
      data: {
        students,
        seatMatrix,
        spotCandidates,
        auditLogs,
        hodAccounts,
        systemSettings,
        notices,
        faculty,
      },
    };

    const res = await createDriveBackupSnapshot(snapshot);
    setIsCreatingBackup(false);
    setBackupStatusMsg(res.message);
    addAuditLog('CLOUD_BACKUP', 'Generated system snapshot backup to Google Drive.');
  };

  // Restore Cloud Snapshot File
  const handleRestoreSnapshotFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const parsed = parseSnapshotFile(content);
      if (parsed) {
        restoreSystemFromSnapshot(parsed);
        alert('System successfully restored from snapshot backup!');
      } else {
        alert('Invalid snapshot file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Admin Title Header */}
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>SUPER ADMIN CONTROL CENTER &bull; SAMS GOVT. OF ODISHA</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">
            SAMS e-Admission & Administration Master Suite
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong>Super Administrator</strong> &bull; SAMS Panchayat College, Baragada
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center shadow shrink-0"
        >
          Exit Admin Session
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'control', label: 'Spot Round Live Switch', icon: Radio },
          { id: 'add-students', label: 'Add Students (Excel)', icon: FileSpreadsheet },
          { id: 'students', label: 'Student DB Records', icon: Database },
          { id: 'seats', label: 'Seat Matrix Editor', icon: Edit2 },
          { id: 'hods', label: 'HOD Credentials Manager', icon: Lock },
          { id: 'drive', label: 'Google Drive Backup', icon: Cloud },
          { id: 'audit', label: 'System Audit Logs', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center transition ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 mr-1.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB: SPOT ROUND LIVE CONTROL */}
      {activeAdminTab === 'control' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white font-serif flex items-center">
                <Radio className="w-5 h-5 mr-2 text-amber-400" />
                Spot Round Live Master Control Switch
              </h2>
              <p className="text-xs text-slate-400">
                Master toggle to ENABLE or DISABLE the public Spot Round Seats reporting desk and merit list publication.
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold font-mono ${
                systemSettings.spotRoundEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}
            >
              {systemSettings.spotRoundEnabled ? 'PUBLIC ACCESS LIVE' : 'PORTAL DISABLED'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Spot Round Public Tab Visibility</span>
                <button
                  onClick={() => toggleSpotRound(!systemSettings.spotRoundEnabled)}
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    systemSettings.spotRoundEnabled ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-slate-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                      systemSettings.spotRoundEnabled ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                When enabled, students and visitors can view vacant seat matrix, candidate reported status, and download provisional merit selection lists.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl space-y-2 text-xs text-amber-200">
              <span className="font-bold block text-amber-300 uppercase tracking-wider font-mono">
                SAMS Admission Rule Notice
              </span>
              <p>
                Ensure candidate document verification is completed at SAMS Room No. 12 before locking final selection lists.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ADD STUDENTS (EXCEL UPLOAD FOR SUPER ADMIN) */}
      {activeAdminTab === 'add-students' && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white font-serif flex items-center">
                <FileSpreadsheet className="w-5 h-5 mr-2 text-amber-400" />
                Add Students via Excel Spreadsheet (Super Admin Exclusive)
              </h2>
              <p className="text-xs text-slate-400">
                Upload an Excel sheet (.xlsx, .xls) or CSV to instantly import students with Barcode, Parent Name, DOB, and Marks into the database.
              </p>
            </div>

            <button
              onClick={handleDownloadExcelTemplate}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center shadow"
            >
              <Download className="w-4 h-4 mr-1.5" /> Download Excel Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Upload Card */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center">
                <Upload className="w-4 h-4 mr-2 text-emerald-400" /> Upload Student Excel File (.xlsx, .csv)
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Required Excel Columns: <strong className="text-amber-400">Name</strong>, <strong className="text-amber-400">Barcode</strong>, <strong className="text-amber-400">Father Name/Mother Name</strong>, <strong className="text-amber-400">Category</strong>, <strong className="text-amber-400">Date of Birth</strong>, <strong className="text-amber-400">Maximum Marks</strong>, <strong className="text-amber-400">Marks Secured</strong>, <strong className="text-amber-400">Percentage</strong>.
              </p>

              <label className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold shadow-lg flex items-center justify-center cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Browse & Import Excel Sheet
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUploadXLSX} className="hidden" />
              </label>
            </div>

            {/* Schema Guide */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3 text-xs text-slate-300">
              <h3 className="font-bold text-amber-400 uppercase tracking-wider font-mono">Excel Schema Specification</h3>
              <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                <li><strong>Name</strong>: Student Full Name</li>
                <li><strong>Barcode</strong>: Unique barcode string or id</li>
                <li><strong>Father Name/Mother Name</strong>: Parent guardian name</li>
                <li><strong>Category</strong>: GEN, SC, ST, or SEBC</li>
                <li><strong>Date of Birth</strong>: Format YYYY-MM-DD or DD/MM/YYYY</li>
                <li><strong>Maximum Marks</strong>: Total possible marks (e.g., 500)</li>
                <li><strong>Marks Secured</strong>: Marks obtained by student</li>
                <li><strong>Percentage</strong>: Calculated percentage (%)</li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* TAB: STUDENT DATABASE MANAGER */}
      {activeAdminTab === 'students' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white font-serif flex items-center">
                <Database className="w-5 h-5 mr-2 text-amber-400" />
                SAMS Student Database Manager ({students.length} Total Records)
              </h2>
              <p className="text-xs text-slate-400">
                Includes Name, Barcode, Parent Name, Category, DOB, Maximum Marks, Marks Secured, and Percentage.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveAdminTab('add-students')}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center shadow"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Students (Excel)
              </button>

              <button
                onClick={handleExportStudentsExcel}
                className="px-3.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Export Excel
              </button>
            </div>
          </div>

          {/* SAMS Google Sheet Live Sync Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-amber-400 font-mono">Sync Live SAMS Google Sheet URL</span>
              <span className="text-slate-500 font-mono text-[10px]">
                Last Sync: {systemSettings.lastSheetSync ? new Date(systemSettings.lastSheetSync).toLocaleString('en-IN') : 'Never'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="url"
                value={sheetUrlInput}
                onChange={(e) => setSheetUrlInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleGoogleSheetSync}
                disabled={isSyncingSheet}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center shrink-0 shadow"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                {isSyncingSheet ? 'Syncing...' : 'Sync Sheet'}
              </button>
            </div>

            {syncMessage && <p className="text-xs text-emerald-400 font-medium">{syncMessage}</p>}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, barcode, roll..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Streams</option>
              <option value="Science">Science</option>
              <option value="Arts">Arts</option>
              <option value="Commerce">Commerce</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Categories</option>
              <option value="GEN">GEN</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="SEBC">SEBC</option>
            </select>

            <span className="text-slate-400 font-mono text-[11px] ml-auto">
              Showing <strong>{filteredStudents.length}</strong> records
            </span>
          </div>

          {/* Table with Barcode, Parent Name, DOB, Marks */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Barcode</th>
                  <th className="py-3 px-3">Father / Mother Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">DOB</th>
                  <th className="py-3 px-3 text-center">Max Marks</th>
                  <th className="py-3 px-3 text-center">Secured</th>
                  <th className="py-3 px-3 text-center">Percentage</th>
                  <th className="py-3 px-3">SAMS Reg / Roll</th>
                  <th className="py-3 px-3 text-center">Edit Roll</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.slice(0, 150).map((stu, idx) => (
                  <tr key={`${stu.id}_${idx}`} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-white">{stu.name}</td>
                    <td className="py-3 px-3 font-mono text-amber-300">{stu.barcode || `BAR-${stu.samsRegNo}`}</td>
                    <td className="py-3 px-3 text-slate-300">{stu.parentName || 'N/A'}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{stu.category}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{stu.dob || '2005-01-01'}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-300">{stu.maxMarks || 500}</td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-400">{stu.marksSecured || 400}</td>
                    <td className="py-3 px-3 text-center font-bold text-amber-400">{stu.marksPercentage}%</td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                      {stu.samsRegNo} <br />
                      <span className="text-amber-300">{stu.rollNo}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {editingStudentId === stu.id ? (
                        <div className="flex items-center space-x-1">
                          <input
                            type="text"
                            value={editingRollNo}
                            onChange={(e) => setEditingRollNo(e.target.value)}
                            className="bg-slate-950 border border-amber-500 rounded px-1.5 py-0.5 text-xs text-amber-300 focus:outline-none w-20"
                          />
                          <button
                            onClick={() => {
                              updateStudentRollNo(stu.id, editingRollNo);
                              setEditingStudentId(null);
                            }}
                            className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px]"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingStudentId(stu.id);
                            setEditingRollNo(stu.rollNo);
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SANCTIONED SEAT MATRIX EDITOR */}
      {activeAdminTab === 'seats' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white font-serif flex items-center">
                <Edit2 className="w-5 h-5 mr-2 text-amber-400" />
                Sanctioned Seat Matrix Editor
              </h2>
              <p className="text-xs text-slate-400">
                Adjust intake capacity per subject or reset to Odisha Government benchmark default.
              </p>
            </div>

            <button
              onClick={resetSeatMatrixToBenchmark}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset to Govt Benchmark
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Stream</th>
                  <th className="py-3 px-4 text-center">Sanctioned Intake</th>
                  <th className="py-3 px-4 text-center">Admitted Count</th>
                  <th className="py-3 px-4 text-center">Vacant Seats</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {seatMatrix.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-white">{item.deptName}</td>
                    <td className="py-3 px-4 text-slate-400">{item.stream}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-100">
                      {editingSeatId === item.id ? (
                        <input
                          type="number"
                          value={newSanctioned}
                          onChange={(e) => setNewSanctioned(parseInt(e.target.value) || 0)}
                          className="w-20 bg-slate-950 border border-amber-500 rounded px-2 py-0.5 text-xs text-center text-amber-300 focus:outline-none"
                        />
                      ) : (
                        item.sanctioned
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-400">{item.admitted}</td>
                    <td className="py-3 px-4 text-center font-bold text-amber-400">{item.vacant}</td>
                    <td className="py-3 px-4 text-center">
                      {editingSeatId === item.id ? (
                        <button
                          onClick={() => {
                            updateSeatMatrixItem(item.id, newSanctioned);
                            setEditingSeatId(null);
                          }}
                          className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[10px]"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingSeatId(item.id);
                            setNewSanctioned(item.sanctioned);
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                        >
                          Edit Intake
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: HOD CREDENTIALS MANAGER */}
      {activeAdminTab === 'hods' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white font-serif flex items-center">
              <Lock className="w-5 h-5 mr-2 text-amber-400" />
              HOD Security Credentials Manager
            </h2>
            <p className="text-xs text-slate-400">
              Manage department login passwords and HOD head contact details across all departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hodAccounts.map((hod) => (
              <div key={hod.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                  <span className="font-bold text-white text-sm">Department of {hod.deptName}</span>
                  <span className="font-mono text-amber-400 text-[11px]">User: {hod.username}</span>
                </div>

                <div className="space-y-1 text-slate-300">
                  <p>HOD Head: <strong>{hod.hodName}</strong></p>
                  <p className="font-mono text-slate-400">Phone: +91 {hod.phone}</p>
                  <p className="font-mono text-slate-400">Email: {hod.email}</p>
                </div>

                {editingHodDeptId === hod.id ? (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <input
                      type="text"
                      placeholder="New HOD Name"
                      value={newHodName}
                      onChange={(e) => setNewHodName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="New Security Password"
                      value={newHodPassword}
                      onChange={(e) => setNewHodPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-amber-300 font-mono"
                    />
                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        onClick={() => setEditingHodDeptId(null)}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-[10px]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          updateHodPassword(hod.id, newHodPassword, newHodName);
                          setEditingHodDeptId(null);
                        }}
                        className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[10px]"
                      >
                        Save Password
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                    <span className="font-mono text-slate-500 text-[10px]">Pass: {hod.password}</span>
                    <button
                      onClick={() => {
                        setEditingHodDeptId(hod.id);
                        setNewHodPassword(hod.password);
                        setNewHodName(hod.hodName);
                      }}
                      className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[10px]"
                    >
                      Update Credentials
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: GOOGLE DRIVE CLOUD BACKUP & RESTORE */}
      {activeAdminTab === 'drive' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white font-serif flex items-center">
              <Cloud className="w-5 h-5 mr-2 text-amber-400" />
              Google Drive Cloud Snapshot Backup & Restore
            </h2>
            <p className="text-xs text-slate-400">
              Integrates Google Drive API to generate JSON system snapshots or restore full system database.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center">
                <Upload className="w-4 h-4 mr-2 text-amber-400" /> Create Google Drive System Snapshot
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Generates a complete JSON backup containing all students, barcodes, parent names, max marks, and audit logs.
              </p>

              <button
                onClick={handleTriggerDriveBackup}
                disabled={isCreatingBackup}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold shadow flex items-center justify-center"
              >
                <Cloud className="w-4 h-4 mr-2" />
                {isCreatingBackup ? 'Generating Snapshot...' : 'Backup Snapshot to Google Drive'}
              </button>

              {backupStatusMsg && <p className="text-emerald-400 font-mono text-[11px]">{backupStatusMsg}</p>}
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center">
                <Download className="w-4 h-4 mr-2 text-emerald-400" /> Restore System from Snapshot File
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Upload a previously created system JSON snapshot file to restore all student database records and configuration.
              </p>

              <label className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold border border-amber-500/30 shadow flex items-center justify-center cursor-pointer">
                <Download className="w-4 h-4 mr-2" /> Select JSON Snapshot File to Restore
                <input type="file" accept=".json" onChange={handleRestoreSnapshotFile} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SYSTEM AUDIT LOGS */}
      {activeAdminTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white font-serif flex items-center">
              <History className="w-5 h-5 mr-2 text-amber-400" />
              Administrative System Audit Trail
            </h2>
            <p className="text-xs text-slate-400">
              Track administrative actions, student excel imports, sheet syncs, and backup restores in real time.
            </p>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between items-center font-mono text-[10px]">
                  <span className="font-bold text-amber-400">{log.actionType}</span>
                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                </div>
                <p className="text-slate-200 font-medium">{log.description}</p>
                <span className="text-[10px] text-slate-500 font-mono">By: {log.adminName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
