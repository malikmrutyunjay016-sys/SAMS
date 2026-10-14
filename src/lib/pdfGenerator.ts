import { jsPDF } from 'jspdf';
import { SpotCandidate, SeatMatrixItem } from '../types';

export function generateSpotSelectionPDF(
  candidates: SpotCandidate[],
  seatMatrix: SeatMatrixItem[],
  title = "OFFICIAL PROVISIONAL SPOT ROUND MERIT SELECTION LIST - 2026-27"
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header Banner
  doc.setFillColor(30, 41, 59); // Slate 900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(245, 158, 11); // Amber 500
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("SAMS PANCHAYAT COLLEGE, BARAGADA", pageWidth / 2, 11, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text("Government of Odisha | Department of Higher Education | NAAC Grade B++", pageWidth / 2, 17, { align: 'center' });
  doc.text("e-Admission Cell | Phone: 06646-220142 | Email: principal.baragada@odisha.gov.in", pageWidth / 2, 23, { align: 'center' });

  y = 35;

  // Document Title
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  y += 6;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')} | SAMS Ref No: SAMS/PC-BAR/SPOT/2026/${Math.floor(1000 + Math.random() * 9000)}`, pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Table Headers
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.rect(12, y, pageWidth - 24, 8, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(12, y, pageWidth - 24, 8, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);

  const colX = [15, 25, 65, 95, 125, 142, 160, 182];
  doc.text("Rank", colX[0], y + 5.5);
  doc.text("Candidate Name", colX[1], y + 5.5);
  doc.text("SAMS Reg. No.", colX[2], y + 5.5);
  doc.text("Department & Specialization", colX[3], y + 5.5);
  doc.text("Category", colX[4], y + 5.5);
  doc.text("Marks %", colX[5], y + 5.5);
  doc.text("Reported", colX[6], y + 5.5);
  doc.text("Status", colX[7], y + 5.5);

  y += 8;

  // Candidate Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  candidates.forEach((cand, idx) => {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }

    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(12, y, pageWidth - 24, 7, 'F');
    }

    doc.setTextColor(15, 23, 42);
    doc.text(`#${cand.waitlistRank || idx + 1}`, colX[0], y + 4.5);
    doc.text(cand.studentName.length > 22 ? cand.studentName.slice(0, 22) + '...' : cand.studentName, colX[1], y + 4.5);
    doc.text(cand.samsRegNo, colX[2], y + 4.5);
    doc.text(cand.deptName.length > 18 ? cand.deptName.slice(0, 18) + '...' : cand.deptName, colX[3], y + 4.5);
    doc.text(cand.category, colX[4], y + 4.5);
    doc.text(`${cand.marksPercentage.toFixed(1)}%`, colX[5], y + 4.5);

    // Reported badge
    if (cand.reportedStatus === 'Reported') {
      doc.setTextColor(16, 185, 129); // Green
    } else {
      doc.setTextColor(239, 68, 68); // Red
    }
    doc.text(cand.reportedStatus, colX[6], y + 4.5);

    // Status badge
    if (cand.selectionStatus === 'Selected') {
      doc.setTextColor(217, 119, 6); // Amber
    } else {
      doc.setTextColor(100, 116, 139);
    }
    doc.text(cand.selectionStatus, colX[7], y + 4.5);

    y += 7;
  });

  // Footer / Signatures
  y += 15;
  if (y > 250) {
    doc.addPage();
    y = 30;
  }

  doc.setLineWidth(0.3);
  doc.setDrawColor(203, 213, 225);
  doc.line(15, y, 65, y);
  doc.line(75, y, 125, y);
  doc.line(135, y, 195, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text("SAMS e-Admission Officer", 20, y + 5);
  doc.text("Academic Bursar / HOD", 85, y + 5);
  doc.text("Principal, Panchayat College", 142, y + 5);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Note: Admission is subject to original document verification at SAMS counters.", pageWidth / 2, y + 14, { align: 'center' });

  doc.save(`SAMS_Baragada_Spot_Selection_List_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function generateWordSelectionListDoc(candidates: SpotCandidate[]) {
  let content = `
================================================================================
  SAMS PANCHAYAT COLLEGE, BARAGADA - GOVT. OF ODISHA
  OFFICIAL PROVISIONAL SPOT ROUND MERIT SELECTION LIST (2026-27)
  SAMS Ref No: SAMS/PC-BAR/SPOT/2026
  Generated Date: ${new Date().toLocaleString('en-IN')}
================================================================================

LIST OF PROVISIONALLY SELECTED / REPORTED CANDIDATES:

`;

  candidates.forEach((cand, idx) => {
    content += `${idx + 1}. Candidate Name   : ${cand.studentName}
   SAMS Reg. No.    : ${cand.samsRegNo}
   Department       : ${cand.deptName} (${cand.stream})
   Category & Marks : ${cand.category} | ${cand.marksPercentage}%
   Reported Status  : ${cand.reportedStatus}
   Selection Status : ${cand.selectionStatus}
--------------------------------------------------------------------------------\n`;
  });

  content += `\nOFFICERS SIGNATURES:\n\n1. SAMS Admission In-Charge               2. Academic Bursar               3. Principal\n`;

  const blob = new Blob([content], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SAMS_Baragada_Spot_Selection_List_${new Date().toISOString().slice(0, 10)}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
