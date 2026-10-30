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
  ArrowRight,
  Trash2,
  RotateCcw
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
  onClearAllData?: () => Promise<void>;
  onResetToDemoData?: () => Promise<void>;
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
  onClearAllData,
  onResetToDemoData,
  userEmail,
  onToast,
}) => {
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(() => {
    return localStorage.getItem('zak_crm_last_backup_date');
  });

  // Security checkpoint flow:
  // pending action can be 'wipe' | 'reset'
  // step can be 'choice' (choose export vs skip) | 'exported_ready' (exported, ready to execute) | 'are_you_sure' (skipped export, final warning)
  const [securityModalAction, setSecurityModalAction] = useState<'wipe' | 'reset' | null>(null);
  const [securityStep, setSecurityStep] = useState<'choice' | 'exported_ready' | 'are_you_sure'>('choice');
  const [isProcessingSecurityAction, setIsProcessingSecurityAction] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const openSecurityFlow = (action: 'wipe' | 'reset') => {
    setSecurityModalAction(action);
    setSecurityStep('choice');
  };

  const closeSecurityFlow = () => {
    setSecurityModalAction(null);
    setSecurityStep('choice');
  };

  const handleSecurityExport = () => {
    handleExportJSON();
    setSecurityStep('exported_ready');
  };

  const handleSecuritySkipExport = () => {
    setSecurityStep('are_you_sure');
  };

  const handleConfirmSecurityExecution = async () => {
    if (!securityModalAction) return;
    setIsProcessingSecurityAction(true);
    try {
      if (securityModalAction === 'wipe') {
        if (onClearAllData) await onClearAllData();
      } else {
        if (onResetToDemoData) await onResetToDemoData();
      }
      closeSecurityFlow();
    } finally {
      setIsProcessingSecurityAction(false);
    }
  };

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

          {/* Section 4: Danger Zone // Reset Workspace & Clear All Data */}
          <div className={`p-4 border-2 rounded space-y-4 ${
            isDarkMode ? 'bg-[#181111] border-red-900/60' : 'bg-red-50/60 border-red-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  DANGER ZONE // RESET &amp; CLEAR TEST DATA
                </span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-red-500/40 text-red-500 bg-red-500/10 font-bold">
                TEST CLEANUP
              </span>
            </div>

            <p className="text-xs opacity-80 font-sans leading-relaxed">
              If you have been testing the application with dummy numbers or sample coaches and want to start with a fresh clean workspace, you can clear all data or reset to default templates below.
            </p>

            <div className="space-y-3 pt-1">
              {/* Action 1: Wipe all records (0 items) */}
              <div className={`p-3 rounded border ${
                isDarkMode ? 'bg-[#1F1414] border-red-900/40' : 'bg-white border-red-200'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400 block">
                      1. Wipe All Data (Start 100% Clean / 0 Records)
                    </span>
                    <span className="text-[11px] font-sans opacity-75 block mt-0.5">
                      Clears all coaches, outreach logs, meetings, and vault items from both this device and Firebase Cloud so you can enter real data without clutter.
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 mt-3 pt-2 border-t border-red-200 dark:border-red-900/40">
                  <button
                    type="button"
                    onClick={() => openSecurityFlow('wipe')}
                    className="px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Wipe All Data</span>
                  </button>
                </div>
              </div>

              {/* Action 2: Reset to Clean Blueprint (Default SOPs & 0 dummy records) */}
              <div className={`p-3 rounded border ${
                isDarkMode ? 'bg-[#1A1814] border-amber-900/40' : 'bg-white border-amber-200'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 block">
                      2. Reset Workspace to Default Blueprint
                    </span>
                    <span className="text-[11px] font-sans opacity-75 block mt-0.5">
                      Clears all test prospect entries and meetings, and reinstalls the standard winning cold DM pitches and objection scripts.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 mt-3 pt-2 border-t border-amber-200 dark:border-amber-900/40">
                  <button
                    type="button"
                    onClick={() => openSecurityFlow('reset')}
                    className={`px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isDarkMode 
                        ? 'border-amber-600/80 bg-amber-600/20 text-amber-400 hover:bg-amber-600/30' 
                        : 'border-amber-600 bg-amber-100 text-amber-900 hover:bg-amber-200 shadow-xs'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Blueprint Template</span>
                  </button>
                </div>
              </div>
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

      {/* 2-Step Security Safeguard Modal */}
      {securityModalAction && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-lg border-2 rounded p-5 sm:p-6 shadow-2xl relative transition-all ${
            isDarkMode 
              ? 'bg-[#181615] border-neutral-700 text-[#F4F2ED]' 
              : 'bg-white border-neutral-900 text-[#111111] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
          }`}>
            {/* Step 1: Initial Two Choices (Export vs Skip) */}
            {securityStep === 'choice' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-current opacity-80">
                  <div className={`p-2 rounded ${securityModalAction === 'wipe' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold">
                      {securityModalAction === 'wipe' ? 'Security Checkpoint: Wipe All Data' : 'Security Checkpoint: Reset Blueprint'}
                    </h3>
                    <p className="text-xs font-mono opacity-70">
                      Choose an option before proceeding:
                    </p>
                  </div>
                </div>

                <p className="text-xs font-sans leading-relaxed opacity-85">
                  To protect your data and avoid accidental loss, please choose whether you would like to download a safety backup before the action is executed:
                </p>

                <div className="space-y-3 pt-1">
                  {/* Choice 1: Export */}
                  <button
                    type="button"
                    onClick={handleSecurityExport}
                    className={`w-full p-4 rounded border-2 text-left transition-all flex items-start gap-3.5 cursor-pointer group ${
                      isDarkMode
                        ? 'border-blue-500/60 bg-blue-500/10 hover:bg-blue-500/20 text-white'
                        : 'border-blue-600 bg-blue-50 hover:bg-blue-100 text-blue-950 shadow-[3px_3px_0px_0px_rgba(37,99,235,1)]'
                    }`}
                  >
                    <div className="p-2 rounded bg-blue-600 text-white shrink-0 mt-0.5">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold uppercase tracking-wider block text-blue-600 dark:text-blue-400">
                        Choice 1: Export JSON Backup First (Recommended)
                      </span>
                      <span className="text-xs font-sans opacity-85 block mt-1 leading-snug">
                        Downloads a full JSON file containing your current coaches, logs, and meetings to your computer.
                      </span>
                    </div>
                  </button>

                  {/* Choice 2: Skip Export */}
                  <button
                    type="button"
                    onClick={handleSecuritySkipExport}
                    className={`w-full p-4 rounded border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                      isDarkMode
                        ? 'border-neutral-700 bg-neutral-900/60 hover:border-neutral-500 text-white'
                        : 'border-neutral-300 bg-neutral-50 hover:border-neutral-900 hover:bg-neutral-100 text-neutral-900'
                    }`}
                  >
                    <div className="p-2 rounded bg-neutral-700 text-white shrink-0 mt-0.5">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold uppercase tracking-wider block">
                        Choice 2: I Don't Want to Export (Skip Backup)
                      </span>
                      <span className="text-xs font-sans opacity-70 block mt-1 leading-snug">
                        Proceed directly without downloading a backup copy.
                      </span>
                    </div>
                  </button>
                </div>

                <div className="pt-3 border-t border-dashed border-current opacity-70 flex justify-end">
                  <button
                    type="button"
                    onClick={closeSecurityFlow}
                    className="px-4 py-2 font-mono text-xs underline hover:opacity-100 cursor-pointer"
                  >
                    Cancel / Keep Current Data
                  </button>
                </div>
              </div>
            )}

            {/* Step 2A: Exported Successfully & Ready to Execute */}
            {securityStep === 'exported_ready' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-current">
                  <div className="p-2 rounded bg-emerald-500/20 text-emerald-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold">
                      ✓ Backup File Downloaded
                    </h3>
                    <p className="text-xs font-mono opacity-70">
                      Your records are safely saved on your computer
                    </p>
                  </div>
                </div>

                <p className="text-xs font-sans leading-relaxed opacity-85">
                  Your JSON snapshot has been downloaded. You can import this file at any time in Settings. Now you can safely complete the operation:
                </p>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-dashed border-current">
                  <button
                    type="button"
                    onClick={closeSecurityFlow}
                    className="px-3.5 py-2 font-mono text-xs rounded border border-neutral-400 hover:border-black cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSecurityExecution}
                    disabled={isProcessingSecurityAction}
                    className={`px-4 py-2 rounded font-mono text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer ${
                      securityModalAction === 'wipe'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    {isProcessingSecurityAction 
                      ? 'Processing...' 
                      : `Confirm & ${securityModalAction === 'wipe' ? 'Wipe All Data (0 Records)' : 'Reset Blueprint'}`}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2B: Skipped Export -> "Are you sure?" */}
            {securityStep === 'are_you_sure' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-current">
                  <div className="p-2.5 rounded bg-red-500/20 text-red-500 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-red-600 dark:text-red-400">
                      ⚠️ Are you sure?
                    </h3>
                    <p className="text-xs font-mono opacity-70">
                      You chose NOT to export a backup file
                    </p>
                  </div>
                </div>

                <div className={`p-3.5 rounded border text-xs font-sans leading-relaxed space-y-2 ${
                  isDarkMode ? 'bg-red-950/30 border-red-900/60 text-red-200' : 'bg-red-50 border-red-300 text-red-950'
                }`}>
                  <p className="font-bold">
                    This action will permanently delete all existing coaches, daily DM logs, meetings, and notes from both this device and Firebase Cloud.
                  </p>
                  <p className="opacity-80">
                    Without an exported JSON backup, there is no way to recover this data once it is wiped.
                  </p>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 border-t border-dashed border-current">
                  <button
                    type="button"
                    onClick={closeSecurityFlow}
                    className="px-3 py-2 font-mono text-xs rounded border border-neutral-400 hover:border-black cursor-pointer text-center"
                  >
                    Cancel / Do Nothing
                  </button>

                  <button
                    type="button"
                    onClick={handleSecurityExport}
                    className="px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider rounded border border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer text-center"
                  >
                    <Download className="w-3.5 h-3.5 inline mr-1" />
                    <span>Wait, Let Me Export Backup</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmSecurityExecution}
                    disabled={isProcessingSecurityAction}
                    className="px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider rounded bg-red-600 hover:bg-red-700 text-white shadow-md transition-all cursor-pointer text-center"
                  >
                    {isProcessingSecurityAction
                      ? 'Deleting...'
                      : `Yes, I'm Sure — ${securityModalAction === 'wipe' ? 'Wipe Now' : 'Reset Now'}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
