/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavTab, Creator, DailyLog, ScriptItem, ResourceItem, CreatorStatus, CalendarMeeting, CreatorVault } from './types';
import { initialCreators, initialDailyLogs, initialScripts, initialResources } from './data/mockData';
import { 
  subscribeToCreators, 
  saveCreatorToFirestore, 
  deleteCreatorFromFirestore,
  subscribeToDailyLogs,
  saveDailyLogToFirestore,
  deleteDailyLogFromFirestore,
  subscribeToScripts,
  saveScriptToFirestore,
  deleteScriptFromFirestore,
  subscribeToResources,
  saveResourceToFirestore,
  deleteResourceFromFirestore,
  subscribeToMeetings,
  saveMeetingToFirestore,
  deleteMeetingFromFirestore,
  seedInitialDataIfEmpty,
  clearAllFirestoreData,
  resetWorkspaceToDefaultBlueprint
} from './services/crmService';
import { auth, signOut, onAuthStateChanged } from './firebase';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PipelineView } from './components/PipelineView';
import { TasksView } from './components/TasksView';
import { DailyTrackerView } from './components/DailyTrackerView';
import { CalendarView } from './components/CalendarView';
import { ScriptsView } from './components/ScriptsView';
import { AnalyticsView } from './components/AnalyticsView';
import { VaultView } from './components/VaultView';
import { AddCreatorModal } from './components/AddCreatorModal';
import { EditCreatorModal } from './components/EditCreatorModal';
import { ArchiveCreatorModal } from './components/ArchiveCreatorModal';
import { ConfirmModal } from './components/ConfirmModal';
import { LogActivityModal } from './components/LogActivityModal';
import { ClientVaultDrawer } from './components/ClientVaultDrawer';
import { SettingsModal } from './components/SettingsModal';
import { AuthGate } from './components/AuthGate';
import { CheckCircle2, Download, Upload } from 'lucide-react';

export default function App() {
  const AUTHORIZED_EMAIL = 'itsmezaki77@gmail.com';

  const validTabs: NavTab[] = ['dashboard', 'pipeline', 'tasks', 'calendar', 'tracker', 'scripts', 'analytics', 'vault'];

  const getTabFromHash = (): NavTab => {
    const hash = window.location.hash.replace('#', '') as NavTab;
    return validTabs.includes(hash) ? hash : 'dashboard';
  };

  // Theme state: defaults to paper light mode (false) or saved preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('zak_crm_darkmode');
    return saved ? JSON.parse(saved) : false;
  });

  // Auth state: check if user is signed in with authorized email
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
    const saved = localStorage.getItem('zak_crm_auth_email');
    return saved === AUTHORIZED_EMAIL ? saved : null;
  });

  // Multi-tab hash navigation
  const [currentTab, setCurrentTab] = useState<NavTab>(() => getTabFromHash());

  // Synchronize tab state with URL hash (enables right-click open in new tab and browser navigation)
  useEffect(() => {
    const handleHashChange = () => {
      const target = getTabFromHash();
      setCurrentTab(target);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigateTab = (tab: NavTab) => {
    setCurrentTab(tab);
    if (window.location.hash !== `#${tab}`) {
      window.location.hash = tab;
    }
  };
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Persistent CRM Data
  const [creators, setCreators] = useState<Creator[]>(() => {
    const saved = localStorage.getItem('zak_crm_creators');
    return saved ? JSON.parse(saved) : initialCreators;
  });

  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('zak_crm_logs');
    return saved ? JSON.parse(saved) : initialDailyLogs;
  });

  const [scripts, setScripts] = useState<ScriptItem[]>(() => {
    const saved = localStorage.getItem('zak_crm_scripts');
    return saved ? JSON.parse(saved) : initialScripts;
  });

  const [resources, setResources] = useState<ResourceItem[]>(() => {
    const saved = localStorage.getItem('zak_crm_resources');
    return saved ? JSON.parse(saved) : initialResources;
  });

  const [meetings, setMeetings] = useState<CalendarMeeting[]>(() => {
    const saved = localStorage.getItem('zak_crm_meetings');
    return saved ? JSON.parse(saved) : [];
  });

  // Modals & Editing
  const [isAddCreatorOpen, setIsAddCreatorOpen] = useState(false);
  const [editingCreator, setEditingCreator] = useState<Creator | null>(null);
  const [archivingCreator, setArchivingCreator] = useState<Creator | null>(null);
  const [bulkArchivingCreators, setBulkArchivingCreators] = useState<Creator[]>([]);
  const [vaultDrawerCreator, setVaultDrawerCreator] = useState<Creator | null>(null);
  const [isLogActivityOpen, setIsLogActivityOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeVaultDrawerCreator = vaultDrawerCreator
    ? creators.find(c => c.id === vaultDrawerCreator.id) || vaultDrawerCreator
    : null;

  // Universal Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'signout';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const requestConfirmDelete = (itemName: string, onConfirmAction: () => void) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Permanent Deletion',
      message: `Are you sure you want to delete ${itemName}? This action cannot be undone and will be permanently removed.`,
      confirmText: 'Yes, Delete',
      variant: 'danger',
      onConfirm: onConfirmAction,
    });
  };

  const requestConfirmSignOut = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Workspace Sign Out',
      message: 'Are you sure you want to sign out of the executive workspace? Your active session will end.',
      confirmText: 'Yes, Sign Out',
      variant: 'signout',
      onConfirm: handleSignOut,
    });
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('zak_crm_darkmode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('zak_crm_creators', JSON.stringify(creators));
  }, [creators]);

  useEffect(() => {
    localStorage.setItem('zak_crm_logs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem('zak_crm_scripts', JSON.stringify(scripts));
  }, [scripts]);

  useEffect(() => {
    localStorage.setItem('zak_crm_resources', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('zak_crm_meetings', JSON.stringify(meetings));
  }, [meetings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Real-time Firestore sync when authenticated
  useEffect(() => {
    if (!currentUserEmail) return;

    const unsubCreators = subscribeToCreators((cloudCreators) => {
      if (cloudCreators && cloudCreators.length > 0) {
        setCreators(cloudCreators);
      }
    });

    const unsubLogs = subscribeToDailyLogs((cloudLogs) => {
      if (cloudLogs && cloudLogs.length > 0) {
        setDailyLogs(cloudLogs);
      }
    });

    const unsubScripts = subscribeToScripts((cloudScripts) => {
      if (cloudScripts && cloudScripts.length > 0) {
        setScripts(cloudScripts);
      }
    });

    const unsubResources = subscribeToResources((cloudResources) => {
      if (cloudResources && cloudResources.length > 0) {
        setResources(cloudResources);
      }
    });

    const unsubMeetings = subscribeToMeetings((cloudMeetings) => {
      if (cloudMeetings && cloudMeetings.length > 0) {
        setMeetings(cloudMeetings);
      }
    });

    return () => {
      unsubCreators();
      unsubLogs();
      unsubScripts();
      unsubResources();
      unsubMeetings();
    };
  }, [currentUserEmail]);

  // Real-time Firebase Auth listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user && user.email?.toLowerCase() === AUTHORIZED_EMAIL.toLowerCase()) {
        setCurrentUserEmail(user.email);
        localStorage.setItem('zak_crm_auth_email', user.email);
      }
    });
    return () => unsubAuth();
  }, []);

  // Guarantee all mock/initial data is seeded to Firebase Cloud if database is empty
  useEffect(() => {
    if (currentUserEmail) {
      seedInitialDataIfEmpty({
        creators,
        dailyLogs,
        scripts,
        resources,
      });
    }
  }, [currentUserEmail]);

  // Auth Handlers
  const handleSuccessLogin = (email: string) => {
    localStorage.setItem('zak_crm_auth_email', email);
    setCurrentUserEmail(email);
    showToast(`Welcome back! Session verified.`);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out:', err);
    }
    localStorage.removeItem('zak_crm_auth_email');
    setCurrentUserEmail(null);
    showToast('Signed out of workspace.');
  };

  // Full Workspace JSON Export
  const handleExportWorkspaceJSON = () => {
    const timestamp = new Date().toISOString();
    const dateFormatted = timestamp.split('T')[0];
    const payload = {
      appName: 'ZAK / Growth Operator CRM',
      exportTimestamp: timestamp,
      exportVersion: '1.0',
      userEmail: currentUserEmail || AUTHORIZED_EMAIL,
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
    showToast('Weekly workspace backup exported successfully as JSON!');
  };

  // Full Workspace JSON Import
  const handleImportWorkspaceData = (imported: {
    creators: Creator[];
    dailyLogs: DailyLog[];
    scripts: ScriptItem[];
    resources: ResourceItem[];
    meetings: CalendarMeeting[];
  }) => {
    setCreators(imported.creators);
    setDailyLogs(imported.dailyLogs);
    setScripts(imported.scripts);
    setResources(imported.resources);
    setMeetings(imported.meetings);
  };

  // Full Workspace Wipe (Start Clean / 0 Records)
  const handleClearAllData = async () => {
    setCreators([]);
    setDailyLogs([]);
    setScripts([]);
    setResources([]);
    setMeetings([]);

    localStorage.removeItem('zak_crm_creators');
    localStorage.removeItem('zak_crm_logs');
    localStorage.removeItem('zak_crm_scripts');
    localStorage.removeItem('zak_crm_resources');
    localStorage.removeItem('zak_crm_meetings');

    await clearAllFirestoreData();
    showToast('Workspace wiped clean (0 records). Ready for clean data!');
  };

  // Reset to Baseline Blueprint Template
  const handleResetToDemoData = async () => {
    setCreators(initialCreators);
    setDailyLogs(initialDailyLogs);
    setScripts(initialScripts);
    setResources(initialResources);
    setMeetings([]);

    localStorage.setItem('zak_crm_creators', JSON.stringify(initialCreators));
    localStorage.setItem('zak_crm_logs', JSON.stringify(initialDailyLogs));
    localStorage.setItem('zak_crm_scripts', JSON.stringify(initialScripts));
    localStorage.setItem('zak_crm_resources', JSON.stringify(initialResources));
    localStorage.removeItem('zak_crm_meetings');

    await resetWorkspaceToDefaultBlueprint(initialScripts);
    showToast('Workspace restored to clean benchmark blueprint!');
  };

  // Creator Handlers (Add, Edit, Update, Delete, Archive, Restore)
  const handleAddCreator = (newCreatorData: Omit<Creator, 'id'>) => {
    const newCreator: Creator = {
      ...newCreatorData,
      id: `c_${Date.now()}`,
    };
    setCreators([newCreator, ...creators]);
    saveCreatorToFirestore(newCreator);
    showToast(`Registered & Synced: ${newCreator.name}`);
  };

  const handleUpdateCreator = (updated: Creator) => {
    setCreators(creators.map(c => c.id === updated.id ? updated : c));
    saveCreatorToFirestore(updated);
    showToast(`Saved changes for ${updated.name}`);
  };

  const handleArchiveCreator = (creatorId: string, reason: string) => {
    const target = creators.find(c => c.id === creatorId);
    if (target) {
      const updated: Creator = {
        ...target,
        isArchived: true,
        archiveReason: reason,
        archivedAt: new Date().toISOString().split('T')[0],
      };
      handleUpdateCreator(updated);
      showToast(`Archived lead: ${target.name}`);
    }
  };

  const handleBulkArchiveCreators = (creatorIds: string[], reason: string) => {
    const today = new Date().toISOString().split('T')[0];
    setCreators(prev => prev.map(c => {
      if (creatorIds.includes(c.id)) {
        const updated: Creator = {
          ...c,
          isArchived: true,
          archiveReason: reason,
          archivedAt: today,
        };
        saveCreatorToFirestore(updated);
        return updated;
      }
      return c;
    }));
    showToast(`Archived ${creatorIds.length} coaches to the archive ledger`);
  };

  const handleRestoreCreator = (creatorId: string) => {
    const target = creators.find(c => c.id === creatorId);
    if (target) {
      const updated: Creator = {
        ...target,
        isArchived: false,
        archiveReason: undefined,
        archivedAt: undefined,
      };
      handleUpdateCreator(updated);
      showToast(`Restored to Pipeline: ${target.name}`);
    }
  };

  const handleUpdateCreatorStatus = (creatorId: string, status: CreatorStatus) => {
    const target = creators.find(c => c.id === creatorId);
    if (target) {
      handleUpdateCreator({ ...target, status });
    }
  };

  const handleDeleteCreator = (id: string) => {
    setCreators(prev => prev.filter(c => c.id !== id));
    deleteCreatorFromFirestore(id);
    showToast('Record deleted permanently');
  };

  const handleSaveVault = (creatorId: string, vaultData: CreatorVault) => {
    const target = creators.find(c => c.id === creatorId);
    if (target) {
      const subs = Number(vaultData.communitySubscribers) || 0;
      const price = Number(vaultData.monthlyPricePerSub) || 0;
      const revShare = Number(vaultData.revenueSharePercent) || 50;
      const gross = subs * price;
      const zakShare = Math.round(gross * (revShare / 100));

      const updated: Creator = {
        ...target,
        vault: vaultData,
        actualMRR: zakShare > 0 ? zakShare : target.actualMRR,
      };
      handleUpdateCreator(updated);
      setVaultDrawerCreator(updated);
      showToast(`Saved brand & vault data for ${updated.name}`);
    }
  };

  // Meeting Handlers
  const handleSaveMeeting = (meeting: CalendarMeeting) => {
    setMeetings(prev => {
      const idx = prev.findIndex(m => m.id === meeting.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = meeting;
        return updated;
      }
      return [meeting, ...prev];
    });
    saveMeetingToFirestore(meeting);
    showToast(`Meeting saved: ${meeting.title}`);
  };

  const handleDeleteMeeting = (meetingId: string) => {
    setMeetings(prev => prev.filter(m => m.id !== meetingId));
    deleteMeetingFromFirestore(meetingId);
    showToast('Meeting removed');
  };

  // Daily Log Handlers
  const handleAddDailyLog = (logData: Omit<DailyLog, 'id'>) => {
    const newLog: DailyLog = {
      ...logData,
      id: `log_${Date.now()}`,
    };
    setDailyLogs(prev => [newLog, ...prev]);
    saveDailyLogToFirestore(newLog);
    showToast(`Activity logged for ${newLog.date}`);
  };

  const handleUpdateDailyLog = (updated: DailyLog) => {
    setDailyLogs(prev => prev.map(l => l.id === updated.id ? updated : l));
    saveDailyLogToFirestore(updated);
    showToast(`Updated log for ${updated.date}`);
  };

  const handleDeleteDailyLog = (logId: string) => {
    setDailyLogs(prev => prev.filter(l => l.id !== logId));
    deleteDailyLogFromFirestore(logId);
    showToast('Daily log entry removed');
  };

  // Script Handlers
  const handleSaveScript = (script: ScriptItem) => {
    setScripts(prev => {
      const idx = prev.findIndex(s => s.id === script.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = script;
        return updated;
      }
      return [script, ...prev];
    });
    saveScriptToFirestore(script);
    showToast(`Script saved: ${script.title}`);
  };

  const handleDeleteScript = (scriptId: string) => {
    setScripts(prev => prev.filter(s => s.id !== scriptId));
    deleteScriptFromFirestore(scriptId);
    showToast('Script removed');
  };

  // Vault / Resource Handlers
  const handleSaveResource = (res: ResourceItem) => {
    setResources(prev => {
      const idx = prev.findIndex(r => r.id === res.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = res;
        return updated;
      }
      return [res, ...prev];
    });
    saveResourceToFirestore(res);
    showToast(`Resource saved: ${res.title}`);
  };

  const handleDeleteResource = (resId: string) => {
    setResources(prev => prev.filter(r => r.id !== resId));
    deleteResourceFromFirestore(resId);
    showToast('Resource removed');
  };


  // If not authenticated, show AuthGate
  if (!currentUserEmail) {
    return (
      <AuthGate
        onSuccessLogin={handleSuccessLogin}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />
    );
  }

  const tabTitles: Record<NavTab, string> = {
    dashboard: 'Agency Overview Dashboard',
    pipeline: 'Hitlist Creator Pipeline & Benchmarks',
    tasks: 'Daily Outreach Tasks & Conversation Queue',
    calendar: 'Calls & Meeting Calendar',
    tracker: 'Daily Action Tracker',
    scripts: 'Winning Scripts & SOPs',
    analytics: 'Analytics & Revenue Projection',
    vault: 'Links & Password Vault',
  };

  const todayDateStr = new Date().toISOString().split('T')[0];
  const dueTasksCount = creators.filter(c => 
    !c.isArchived && 
    (!c.scheduledContactDate || c.scheduledContactDate <= todayDateStr) && 
    c.talkedStatus !== 'Answered Today'
  ).length;

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors ${
      isDarkMode ? 'bg-[#121110] text-[#F4F2ED]' : 'bg-[#F7F5F0] text-[#111111]'
    }`}>
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleNavigateTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onSignOut={requestConfirmSignOut}
        creatorCount={creators.filter(c => !c.isArchived).length}
        dueTasksCount={dueTasksCount}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenAddCreator={() => setIsAddCreatorOpen(true)}
          onOpenLogActivity={() => setIsLogActivityOpen(true)}
          activeTabTitle={tabTitles[currentTab]}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          onSignOut={requestConfirmSignOut}
          userEmail={currentUserEmail}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Viewport content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              creators={creators}
              dailyLogs={dailyLogs}
              onNavigateTab={handleNavigateTab}
              onOpenAddCreator={() => setIsAddCreatorOpen(true)}
              onOpenLogActivity={() => setIsLogActivityOpen(true)}
              onOpenVaultDrawer={(c) => setVaultDrawerCreator(c)}
              onExportJSON={handleExportWorkspaceJSON}
              onOpenSettings={() => setIsSettingsOpen(true)}
              isDarkMode={isDarkMode}
            />
          )}

          {currentTab === 'pipeline' && (
            <PipelineView
              creators={creators}
              onUpdateCreatorStatus={handleUpdateCreatorStatus}
              onDeleteCreator={handleDeleteCreator}
              onOpenAddCreator={() => setIsAddCreatorOpen(true)}
              onOpenEditCreator={(c) => setEditingCreator(c)}
              onOpenArchiveModal={(c) => setArchivingCreator(c)}
              onOpenBulkArchive={(selected) => setBulkArchivingCreators(selected)}
              onRestoreCreator={handleRestoreCreator}
              onUpdateCreator={handleUpdateCreator}
              onOpenVaultDrawer={(c) => setVaultDrawerCreator(c)}
              searchQuery={searchQuery}
              isDarkMode={isDarkMode}
              onRequestConfirmDelete={requestConfirmDelete}
            />
          )}

          {currentTab === 'tasks' && (
            <TasksView
              creators={creators}
              onUpdateCreator={handleUpdateCreator}
              onOpenAddCreator={() => setIsAddCreatorOpen(true)}
              onOpenEditCreator={(c) => setEditingCreator(c)}
              isDarkMode={isDarkMode}
              onNavigateToCalendar={() => handleNavigateTab('calendar')}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              meetings={meetings}
              creators={creators}
              onSaveMeeting={handleSaveMeeting}
              onDeleteMeeting={handleDeleteMeeting}
              isDarkMode={isDarkMode}
              onRequestConfirmDelete={requestConfirmDelete}
            />
          )}

          {currentTab === 'tracker' && (
            <DailyTrackerView
              dailyLogs={dailyLogs}
              onAddLog={handleAddDailyLog}
              onUpdateLog={handleUpdateDailyLog}
              onDeleteLog={handleDeleteDailyLog}
              isDarkMode={isDarkMode}
              onRequestConfirmDelete={requestConfirmDelete}
            />
          )}

          {currentTab === 'scripts' && (
            <ScriptsView
              scripts={scripts}
              searchQuery={searchQuery}
              isDarkMode={isDarkMode}
              onSaveScript={handleSaveScript}
              onDeleteScript={handleDeleteScript}
              onRequestConfirmDelete={requestConfirmDelete}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              dailyLogs={dailyLogs}
              creators={creators}
              isDarkMode={isDarkMode}
            />
          )}

          {currentTab === 'vault' && (
            <VaultView
              resources={resources}
              searchQuery={searchQuery}
              onSaveResource={handleSaveResource}
              onDeleteResource={handleDeleteResource}
              isDarkMode={isDarkMode}
              onRequestConfirmDelete={requestConfirmDelete}
            />
          )}
        </main>
      </div>

      {/* Add Creator Modal */}
      <AddCreatorModal
        isOpen={isAddCreatorOpen}
        onClose={() => setIsAddCreatorOpen(false)}
        onAdd={handleAddCreator}
        isDarkMode={isDarkMode}
      />

      {/* Edit Creator Modal */}
      <EditCreatorModal
        creator={editingCreator}
        isOpen={!!editingCreator}
        onClose={() => setEditingCreator(null)}
        onSave={handleUpdateCreator}
        isDarkMode={isDarkMode}
      />

      {/* Archive Creator Modal (Single & Bulk) */}
      <ArchiveCreatorModal
        creator={archivingCreator}
        creators={bulkArchivingCreators}
        isOpen={!!archivingCreator || bulkArchivingCreators.length > 0}
        onClose={() => {
          setArchivingCreator(null);
          setBulkArchivingCreators([]);
        }}
        onArchive={handleArchiveCreator}
        onBulkArchive={handleBulkArchiveCreators}
        isDarkMode={isDarkMode}
      />

      {/* Log Activity Modal */}
      <LogActivityModal
        isOpen={isLogActivityOpen}
        onClose={() => setIsLogActivityOpen(false)}
        onLog={handleAddDailyLog}
        isDarkMode={isDarkMode}
      />

      {/* Global Client Vault Drawer (Brand, Results, Credentials, RIB) */}
      <ClientVaultDrawer
        creator={activeVaultDrawerCreator}
        isOpen={!!vaultDrawerCreator}
        onClose={() => setVaultDrawerCreator(null)}
        onSaveVault={handleSaveVault}
        onOpenEditModal={(c) => {
          setVaultDrawerCreator(null);
          setEditingCreator(c);
        }}
        isDarkMode={isDarkMode}
      />

      {/* Universal Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        isDarkMode={isDarkMode}
      />

      {/* Settings & Data Safeguards Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        creators={creators}
        dailyLogs={dailyLogs}
        scripts={scripts}
        resources={resources}
        meetings={meetings}
        onImportWorkspaceData={handleImportWorkspaceData}
        onClearAllData={handleClearAllData}
        onResetToDemoData={handleResetToDemoData}
        userEmail={currentUserEmail}
        onToast={showToast}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 border rounded shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150 font-mono text-xs ${
          isDarkMode 
            ? 'bg-[#1C1B19] border-neutral-700 text-white' 
            : 'bg-white border-neutral-900 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
