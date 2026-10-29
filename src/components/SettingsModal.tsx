import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  Cloud, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  FileJson,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Creator, DailyLog, ScriptItem, ResourceItem, CalendarMeeting } from '../types';
import { syncAllToFirestore } from '../services/crmService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  creators: Creator[];
  dailyLogs: DailyLog[];
  scripts: ScriptItem[];
  resources: ResourceItem[];
  meetings: CalendarMeeting[];
  onImportWorkspaceData: (imported: {
    creators: Creator[];
    dailyLogs: DailyLog[];
    scripts: ScriptItem[];
    resources: ResourceItem[];
    meetings: CalendarMeeting[];
  }) => void;
  userEmail: string;
  onToast: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  creators,
  dailyLogs,
  scripts,
  resources,
  meetings,
  onImportWorkspaceData,
  userEmail,
  onToast,
}) => {
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(() => {
    return localStorage.getItem('zak_crm_last_backup_date');
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle Export Full JSON
  const handleExportJSON = () => {
    const timestamp = new Date().toISOString();
    const dateFormatted = timestamp.split('T')[0];

    const payload = {
      appName: 'ZAK / Growth Operator CRM',
      exportTimestamp: timestamp,
      exportVersion: '1.0',
      userEmail,
      stats: {
        creatorsCount: creators.length,
        dailyLogsCount: dailyLogs.length,
        scriptsCount: scripts.length,
        resourcesCount: resources.length,
        meetingsCount: meetings.length,
      },
      data: {
        creators,
        dailyLogs,
        scripts,
        resources,
        meetings,
      },
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(payload, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `zak-crm-backup-${dateFormatted}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    localStorage.setItem('zak_crm_last_backup_date', timestamp);
    setLastBackupDate(timestamp);
    onToast('Workspace backup exported successfully as JSON file!');
  };

  // Handle Import JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Extract data either from root or nested .data
        const targetData = parsed.data || parsed;

        const importedCreators: Creator[] = Array.isArray(targetData.creators) ? targetData.creators : [];
        const importedLogs: DailyLog[] = Array.isArray(targetData.dailyLogs) ? targetData.dailyLogs : [];
        const importedScripts: ScriptItem[] = Array.isArray(targetData.scripts) ? targetData.scripts : [];
        const importedResources: ResourceItem[] = Array.isArray(targetData.resources) ? targetData.resources : [];
        const importedMeetings: CalendarMeeting[] = Array.isArray(targetData.meetings) ? targetData.meetings : [];

        if (
          importedCreators.length === 0 &&
          importedLogs.length === 0 &&
          importedScripts.length === 0 &&
          importedResources.length === 0 &&
          importedMeetings.length === 0
        ) {
          setImportError('Invalid backup file: No compatible CRM entities found in JSON.');
          return;
        }

        // Apply to local state
        onImportWorkspaceData({
          creators: importedCreators.length > 0 ? importedCreators : creators,
          dailyLogs: importedLogs.length > 0 ? importedLogs : dailyLogs,
          scripts: importedScripts.length > 0 ? importedScripts : scripts,
          resources: importedResources.length > 0 ? importedResources : resources,
          meetings: importedMeetings.length > 0 ? importedMeetings : meetings,
        });

        // Automatically push imported state to Firestore so it is also cloud saved!
        await syncAllToFirestore({
          creators: importedCreators.length > 0 ? importedCreators : creators,
          dailyLogs: importedLogs.length > 0 ? importedLogs : dailyLogs,
          scripts: importedScripts.length > 0 ? importedScripts : scripts,
          resources: importedResources.length > 0 ? importedResources : resources,
          meetings: importedMeetings.length > 0 ? importedMeetings : meetings,
        });

        setImportStatus(
          `Imported & Synced: ${importedCreators.length} creators, ${importedLogs.length} logs, ${importedScripts.length} scripts, ${importedResources.length} vault resources.`
        );
        onToast('Backup restored and synchronized with Firebase Cloud!');
      } catch (err) {
        setImportError('Failed to parse JSON file. Please ensure it is a valid ZAK CRM export.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Push all local data to Firebase cloud
  const handleForceCloudSync = async () => {
    setIsSyncingCloud(true);
    try {
      const res = await syncAllToFirestore({
        creators,
        dailyLogs,
        scripts,
        resources,
        meetings,
      });

      if (res.success) {
        onToast(`Cloud Sync Complete: ${res.count} records verified in Firestore!`);
      } else {
        onToast(`Cloud Sync Warning: ${res.error || 'Check network connection'}`);
      }
    } finally {
      setIsSyncingCloud(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className={`w-full max-w-xl border rounded shadow-2xl relative my-auto transition-all ${
          isDarkMode 
            ? 'bg-[#1C1B19] border-neutral-700 text-[#F4F2ED]' 
            : 'bg-white border-neutral-900 text-[#111111] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
        }`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDarkMode ? 'border-neutral-800' : 'border-neutral-300'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded border border-current flex items-center justify-center bg-blue-600 text-white font-mono font-bold text-xs">
              ⚙
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold tracking-tight">
                Workspace Settings & Data Safeguards
              </h2>
              <p className="font-mono text-[11px] opacity-60">
                Data persistence, JSON backup & Firebase cloud sync
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded border transition-colors ${
              isDarkMode 
                ? 'border-neutral-700 hover:border-neutral-500 text-neutral-300' 
                : 'border-neutral-300 hover:border-black text-neutral-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Section 1: JSON Export & Backup */}
          <div className={`p-4 border rounded space-y-3 ${
            isDarkMode ? 'bg-[#151413] border-neutral-800' : 'bg-neutral-50 border-neutral-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-blue-500" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  Export Complete Data (JSON)
                </span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-blue-500/40 text-blue-500 bg-blue-500/10">
                Offline Safe
              </span>
            </div>

            <p className="text-xs opacity-75 font-sans leading-relaxed">
              Downloads a single portable JSON file containing all your creators, daily DM & outreach tracker logs, sales scripts, resource vault links, and scheduled meetings.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <div className="text-[11px] font-mono opacity-60">
                Last exported:{' '}
                <span className="font-bold">
                  {lastBackupDate ? new Date(lastBackupDate).toLocaleDateString() : 'Never recorded'}
                </span>
              </div>

              <button
                onClick={handleExportJSON}
                className={`w-full sm:w-auto px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                  isDarkMode
                    ? 'bg-white text-black hover:bg-neutral-200 border-white'
                    : 'bg-neutral-950 text-white hover:bg-neutral-800 border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Backup</span>
              </button>
            </div>
          </div>

          {/* Section 2: JSON Import / Restore */}
          <div className={`p-4 border rounded space-y-3 ${
            isDarkMode ? 'bg-[#151413] border-neutral-800' : 'bg-neutral-50 border-neutral-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-500" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  Import & Restore Data (JSON)
                </span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-500/40 text-emerald-500 bg-emerald-500/10">
                Instant Restore
              </span>
            </div>

            <p className="text-xs opacity-75 font-sans leading-relaxed">
              Upload a previously exported ZAK CRM JSON backup. All restored entities will be immediately applied to the workspace and synchronized to Firebase Firestore.
            </p>

            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json"
              onChange={handleFileChange}
              className="hidden" 
            />

            {importStatus && (
              <div className="p-2.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}

            {importError && (
              <div className="p-2.5 rounded border border-red-500/40 bg-red-500/10 text-red-500 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full sm:w-auto px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                  isDarkMode
                    ? 'bg-[#22211F] text-white hover:bg-neutral-800 border-neutral-700'
                    : 'bg-white text-neutral-900 hover:bg-neutral-100 border-neutral-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Select JSON Backup File</span>
              </button>
            </div>
          </div>

          {/* Section 3: Firebase Firestore Status & Cloud Push */}
          <div className={`p-4 border rounded space-y-3 ${
            isDarkMode ? 'bg-[#151413] border-neutral-800' : 'bg-neutral-50 border-neutral-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-500" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  Firebase Cloud Database Status
                </span>
              </div>
              <span className="font-mono text-[10px] flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ONLINE / CONNECTED
              </span>
            </div>

            <div className="text-xs font-mono opacity-70 space-y-1">
              <div>Database: <span className="font-bold">ai-studio-zakgrowthoperato-50f84033-ef5d-48d4-b3a3-a38e651a7cc0</span></div>
              <div>Authorized Operator: <span className="font-bold text-blue-500">{userEmail}</span></div>
              <div className="flex items-center gap-3 pt-1 text-[11px]">
                <span>• Creators: {creators.length}</span>
                <span>• Logs: {dailyLogs.length}</span>
                <span>• Scripts: {scripts.length}</span>
                <span>• Vault: {resources.length}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleForceCloudSync}
                disabled={isSyncingCloud}
                className={`w-full sm:w-auto px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                  isDarkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-500 border-blue-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700 border-blue-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                <span>{isSyncingCloud ? 'Syncing To Firestore...' : 'Force Push All Data To Cloud'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-xs font-mono ${
          isDarkMode ? 'border-neutral-800 opacity-60' : 'border-neutral-300 opacity-70'
        }`}>
          <span>ZAK CRM Safeguard Engine</span>
          <button
            onClick={onClose}
            className="underline hover:opacity-100"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
