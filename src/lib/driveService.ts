export interface SystemSnapshot {
  version: string;
  timestamp: string;
  college: string;
  data: {
    students: any[];
    seatMatrix: any[];
    spotCandidates: any[];
    auditLogs: any[];
    hodAccounts: any[];
    systemSettings: any;
    notices: any[];
    faculty: any[];
  };
}

export async function createDriveBackupSnapshot(
  snapshotData: SystemSnapshot,
  accessToken?: string
): Promise<{ success: boolean; message: string; fileId?: string; downloadFallbackUrl?: string }> {
  const fileName = `SAMS_Baragada_Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const fileContent = JSON.stringify(snapshotData, null, 2);

  if (accessToken) {
    try {
      const metadata = {
        name: fileName,
        mimeType: 'application/json',
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([fileContent], { type: 'application/json' }));

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          message: `Successfully uploaded snapshot "${fileName}" to Google Drive (File ID: ${result.id})`,
          fileId: result.id,
        };
      }
    } catch (err) {
      console.warn('Google Drive direct API upload failed, falling back to local JSON download', err);
    }
  }

  // Fallback local download trigger
  const blob = new Blob([fileContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return {
    success: true,
    message: `Generated JSON System Snapshot file "${fileName}". Download started.`,
    downloadFallbackUrl: url,
  };
}

export function parseSnapshotFile(jsonString: string): SystemSnapshot | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && parsed.data && (parsed.data.students || parsed.data.seatMatrix)) {
      return parsed as SystemSnapshot;
    }
  } catch (e) {
    console.error('Invalid snapshot JSON', e);
  }
  return null;
}
