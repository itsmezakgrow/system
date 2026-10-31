import React, { useState } from 'react';
import { Creator, CreatorStatus, NicheCategory, CoachCategory, CreatorVault } from '../types';
import { 
  Table, 
  Columns3, 
  Plus, 
  ExternalLink, 
  Trash2, 
  AlertCircle,
  Edit3,
  Video,
  MessageSquare,
  Users,
  Clock,
  Sparkles,
  BarChart2,
  ArrowRight,
  GripVertical,
  Archive,
  RotateCcw,
  Lock,
  Flame,
  Star,
  Send,
  LayoutGrid,
  Rows,
  Download,
  Printer,
  CheckSquare,
  Square,
  FileText,
  X,
  BookOpen,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Filter
} from 'lucide-react';
import { ClientVaultDrawer } from './ClientVaultDrawer';
import { exportCreatorsToCSV, printCreatorsDossier } from '../utils/exportHelpers';
import { HitlistExportModal } from './HitlistExportModal';

interface PipelineViewProps {
  creators: Creator[];
  onUpdateCreatorStatus: (id: string, status: CreatorStatus) => void;
  onDeleteCreator: (id: string) => void;
  onOpenAddCreator: () => void;
  onOpenEditCreator: (creator: Creator) => void;
  onOpenArchiveModal: (creator: Creator) => void;
  onOpenBulkArchive?: (creators: Creator[]) => void;
  onRestoreCreator: (creatorId: string) => void;
  onUpdateCreator?: (creator: Creator) => void;
  onOpenVaultDrawer?: (creator: Creator) => void;
  onOpenReaderView?: (creator: Creator) => void;
  searchQuery: string;
  isDarkMode: boolean;
  onRequestConfirmDelete: (title: string, onConfirm: () => void) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  creators,
  onUpdateCreatorStatus,
  onDeleteCreator,
  onOpenAddCreator,
  onOpenEditCreator,
  onOpenArchiveModal,
  onOpenBulkArchive,
  onRestoreCreator,
  onUpdateCreator,
  onOpenVaultDrawer,
  onOpenReaderView,
  searchQuery,
  isDarkMode,
  onRequestConfirmDelete,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedNiche, setSelectedNiche] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedScore, setSelectedScore] = useState<string>('All');
  const [selectedFollowerRange, setSelectedFollowerRange] = useState<string>('All');
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [selectedVaultCreator, setSelectedVaultCreator] = useState<Creator | null>(null);

  // Multi-Selection State for Hitlist Leads
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTargetCreators, setExportTargetCreators] = useState<Creator[]>([]);

  // Kanban display layout: 'grid' (stacked 3x2 rows - no horizontal scroll), 'stack' (vertical list), or 'horizontal' (classic)
  const [kanbanLayout, setKanbanLayout] = useState<'grid' | 'stack' | 'horizontal'>('grid');
  const [kanbanStageFilter, setKanbanStageFilter] = useState<string>('All');

  // Mobile Accordion state for Filters & Actions
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const activeVaultCreator = selectedVaultCreator
    ? creators.find(c => c.id === selectedVaultCreator.id) || selectedVaultCreator
    : null;

  const handleOpenVault = (creator: Creator) => {
    if (onOpenVaultDrawer) {
      onOpenVaultDrawer(creator);
    } else {
      setSelectedVaultCreator(creator);
    }
  };

  const handleSaveVault = (creatorId: string, vaultData: CreatorVault) => {
    const target = creators.find(c => c.id === creatorId);
    if (target) {
      const updated: Creator = {
        ...target,
        vault: vaultData,
      };
      if (onUpdateCreator) {
        onUpdateCreator(updated);
      }
      setSelectedVaultCreator(updated);
    }
  };

  const statuses: CreatorStatus[] = ['To Contact', 'DM Sent', 'Loom Sent', 'Zoom Booked', 'Closed', 'Rejected'];
  const niches: NicheCategory[] = ['Fitness', 'Mindset', 'Business', 'SaaS', 'Finance', 'Lifestyle'];
  const categories: string[] = ['All', 'Prospect', 'Active Client', 'Waiting List', 'Case Study & Benchmark', 'Archived'];

  const stageDetails: Record<CreatorStatus, { arLabel: string; dotColor: string; nextStatus?: CreatorStatus; nextLabel?: string }> = {
    'To Contact': {
      arLabel: 'للتواصل الأولي',
      dotColor: 'bg-neutral-500',
      nextStatus: 'DM Sent',
      nextLabel: 'DM Sent',
    },
    'DM Sent': {
      arLabel: 'تم إرسال الرسالة',
      dotColor: 'bg-blue-500',
      nextStatus: 'Loom Sent',
      nextLabel: 'Loom Sent',
    },
    'Loom Sent': {
      arLabel: 'فيديو لوم مرسل',
      dotColor: 'bg-purple-500',
      nextStatus: 'Zoom Booked',
      nextLabel: 'Zoom Booked',
    },
    'Zoom Booked': {
      arLabel: 'مكالمة زووم محجوزة',
      dotColor: 'bg-amber-500',
      nextStatus: 'Closed',
      nextLabel: 'Close Deal',
    },
    'Closed': {
      arLabel: 'تم الإغلاق (50/50)',
      dotColor: 'bg-emerald-500',
    },
    'Rejected': {
      arLabel: 'غير مناسب / مؤجل',
      dotColor: 'bg-rose-500',
    },
  };

  // Filter creators
  const filteredCreators = creators.filter((creator) => {
    // If viewing Archived tab, strictly show archived creators
    if (selectedCategory === 'Archived') {
      if (!creator.isArchived) return false;
    } else {
      // For all other tabs, hide archived creators
      if (creator.isArchived) return false;
      if (selectedCategory !== 'All' && creator.coachCategory !== selectedCategory) return false;
    }

    const matchesSearch = 
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.niche.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (creator.subNiche && creator.subNiche.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (creator.bioFlaw && creator.bioFlaw.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (creator.loomHook && creator.loomHook.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (creator.notes && creator.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (creator.archiveReason && creator.archiveReason.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (creator.coachCategory && creator.coachCategory.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesNiche = selectedNiche === 'All' || creator.niche === selectedNiche;
    const matchesStatus = selectedStatus === 'All' || creator.status === selectedStatus;

    // Score Filter
    let matchesScore = true;
    const sc = creator.score || 0;
    if (selectedScore === '9-10') matchesScore = sc >= 9;
    else if (selectedScore === '7-8') matchesScore = sc >= 7 && sc <= 8;
    else if (selectedScore === '5-6') matchesScore = sc >= 5 && sc <= 6;
    else if (selectedScore === '1-4') matchesScore = sc >= 1 && sc <= 4;

    // Followers Range Filter
    let matchesFollowers = true;
    const f = creator.followers || 0;
    if (selectedFollowerRange === '<10k') matchesFollowers = f < 10000;
    else if (selectedFollowerRange === '10k-50k') matchesFollowers = f >= 10000 && f <= 50000;
    else if (selectedFollowerRange === '50k-100k') matchesFollowers = f > 50000 && f <= 100000;
    else if (selectedFollowerRange === '100k+') matchesFollowers = f > 100000;

    return matchesSearch && matchesNiche && matchesStatus && matchesScore && matchesFollowers;
  });

  const getScoreBadge = (score?: number) => {
    const s = score || 5;
    if (s >= 9) {
      return (
        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/15 text-amber-500 inline-flex items-center gap-0.5" title="Score out of 10">
          <Flame className="w-2.5 h-2.5 fill-amber-500" />
          <span>{s}/10</span>
        </span>
      );
    }
    if (s >= 7) {
      return (
        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-500/40 bg-blue-500/15 text-blue-500 inline-flex items-center gap-0.5" title="Score out of 10">
          <Star className="w-2.5 h-2.5 fill-blue-500" />
          <span>{s}/10</span>
        </span>
      );
    }
    return (
      <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border border-neutral-400/30 opacity-70" title="Score out of 10">
        <span>{s}/10</span>
      </span>
    );
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(0) + 'K';
    return count.toString();
  };

  // Multi-Selection State Computations
  const selectedCreators = creators.filter(c => selectedIds.includes(c.id));
  const isAllSelected = filteredCreators.length > 0 && filteredCreators.every(c => selectedIds.includes(c.id));
  const isSomeSelected = filteredCreators.some(c => selectedIds.includes(c.id)) && !isAllSelected;

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const filteredIdSet = new Set(filteredCreators.map(c => c.id));
      setSelectedIds(prev => prev.filter(id => !filteredIdSet.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...filteredCreators.map(c => c.id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleOpenExport = (customList?: Creator[]) => {
    const listToExport = customList && customList.length > 0
      ? customList
      : (selectedCreators.length > 0 ? selectedCreators : filteredCreators);
    setExportTargetCreators(listToExport);
    setIsExportModalOpen(true);
  };

  const handleDirectCSV = (customList?: Creator[]) => {
    const listToExport = customList && customList.length > 0
      ? customList
      : (selectedCreators.length > 0 ? selectedCreators : filteredCreators);
    exportCreatorsToCSV(listToExport);
  };

  const handleDirectPDF = (customList?: Creator[]) => {
    const listToExport = customList && customList.length > 0
      ? customList
      : (selectedCreators.length > 0 ? selectedCreators : filteredCreators);
    printCreatorsDossier(listToExport);
  };

  const handleTriggerBulkArchive = () => {
    if (selectedCreators.length === 0) return;
    if (onOpenBulkArchive) {
      onOpenBulkArchive(selectedCreators);
    } else {
      selectedCreators.forEach(c => onOpenArchiveModal(c));
    }
  };

  // Stats
  const activeClients = creators.filter(c => c.coachCategory === 'Active Client');
  const totalActiveMRR = activeClients.reduce((acc, c) => acc + (c.actualMRR || c.estimatedMRR || 0), 0);
  const waitingList = creators.filter(c => c.coachCategory === 'Waiting List');
  const benchmarks = creators.filter(c => c.coachCategory === 'Case Study & Benchmark');

  const getCategoryBadge = (cat?: CoachCategory) => {
    switch (cat) {
      case 'Active Client':
        return <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 font-bold">Active Partner</span>;
      case 'Waiting List':
        return <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-500 font-bold">Waiting List</span>;
      case 'Case Study & Benchmark':
        return <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-blue-500/40 bg-blue-500/10 text-blue-500 font-bold">Benchmark / دراسة حالة</span>;
      default:
        return <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-neutral-400 opacity-70">Outreach Lead</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-3 border rounded text-xs font-mono transition-all ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <span className="opacity-60 block text-[10px] uppercase">Active Partners</span>
          <strong className="text-emerald-500 text-sm block mt-0.5">{activeClients.length} coaches ({totalActiveMRR.toLocaleString()} DH/mo)</strong>
        </div>

        <div className={`p-3 border rounded text-xs font-mono transition-all ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <span className="opacity-60 block text-[10px] uppercase">Waiting List</span>
          <strong className="text-amber-500 text-sm block mt-0.5">{waitingList.length} in queue</strong>
        </div>

        <div className={`p-3 border rounded text-xs font-mono transition-all ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <span className="opacity-60 block text-[10px] uppercase">Benchmarks Saved</span>
          <strong className="text-blue-500 text-sm block mt-0.5">{benchmarks.length} profiles</strong>
        </div>

        <div className={`p-3 border rounded text-xs font-mono transition-all ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <span className="opacity-60 block text-[10px] uppercase">Total Profiles</span>
          <strong className="text-sm block mt-0.5">{creators.length} records</strong>
        </div>
      </div>

      {/* Mobile Accordion Header (Phone View only - Saves vertical space to view coaches directly) */}
      <div className={`md:hidden border rounded p-2.5 transition-all ${
        isDarkMode 
          ? 'bg-[#1C1B19] border-neutral-700' 
          : 'bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
      }`}>
        <div className="flex items-center justify-between gap-2">
          {/* Accordion Toggle Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="flex items-center gap-2 flex-1 text-left font-mono text-xs cursor-pointer select-none min-w-0"
          >
            <div className="p-1 rounded border border-current shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[11px] uppercase tracking-wider">Filters & Actions</span>
                {(selectedCategory !== 'All' || selectedScore !== 'All' || selectedFollowerRange !== 'All' || selectedStatus !== 'All') && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" title="Active filters applied" />
                )}
              </div>
              <span className="text-[10px] opacity-60 truncate">
                {selectedCategory === 'All' ? 'All Records' : selectedCategory} • {filteredCreators.length} {filteredCreators.length === 1 ? 'coach' : 'coaches'}
              </span>
            </div>
            <span className={`ml-auto p-1 rounded border transition-transform shrink-0 ${
              isDarkMode ? 'border-neutral-700 text-neutral-300' : 'border-neutral-300 text-neutral-700'
            }`}>
              {isMobileFiltersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          </button>

          {/* Quick Mobile Action Shortcuts (Table/Kanban view switch + Quick Add Record) */}
          <div className="flex items-center gap-1.5 shrink-0 pl-1.5 border-l border-current/20">
            <div className="flex items-center border rounded p-0.5 font-mono text-[10px] border-current/40">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1 rounded ${viewMode === 'table' ? (isDarkMode ? 'bg-white text-black font-bold' : 'bg-black text-white font-bold') : 'opacity-50'}`}
                title="Table Ledger"
              >
                <Table className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`p-1 rounded ${viewMode === 'kanban' ? (isDarkMode ? 'bg-white text-black font-bold' : 'bg-black text-white font-bold') : 'opacity-50'}`}
                title="Kanban Board"
              >
                <Columns3 className="w-3 h-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenAddCreator}
              className={`flex items-center gap-1 px-2 py-1 font-mono text-[11px] font-bold uppercase rounded border transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-white text-black border-white hover:bg-neutral-200'
                  : 'bg-black text-white border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800'
              }`}
              title="Add Coach Record"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panels: Collapsible Accordion on Phone, Always Visible on Desktop */}
      <div className={`${isMobileFiltersOpen ? 'block space-y-3' : 'hidden md:block md:space-y-3'}`}>
        {/* Category Tabs */}
        <div className={`p-4 border flex flex-wrap items-center justify-between gap-3 transition-all ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            <span className="opacity-50 text-[10px] uppercase mr-1">Filter:</span>
            {categories.map((cat) => {
              const labels: Record<string, string> = {
                'All': 'All Records',
                'Prospect': 'Prospects (Outreach)',
                'Active Client': 'Active Partners (خدّام معاهم)',
                'Waiting List': 'Waiting List',
                'Case Study & Benchmark': 'Benchmarks / مقارنات',
                'Archived': 'Archived / الأرشيف',
              };
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded border transition-all ${
                    selectedCategory === cat
                      ? isDarkMode ? 'bg-white text-black font-bold border-white' : 'bg-black text-white font-bold border-black'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {labels[cat] || cat}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Hitlist Export Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleDirectCSV()}
                className={`flex items-center gap-1 px-2.5 py-1.5 font-mono text-xs rounded border transition-all ${
                  isDarkMode 
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700' 
                    : 'bg-white hover:bg-neutral-100 text-black border-neutral-800 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                }`}
                title={selectedIds.length > 0 ? `Export ${selectedIds.length} Selected to CSV` : `Export all ${filteredCreators.length} filtered coaches to CSV`}
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>CSV {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</span>
              </button>

              <button
                onClick={() => handleOpenExport()}
                className={`flex items-center gap-1 px-2.5 py-1.5 font-mono text-xs rounded border transition-all ${
                  isDarkMode 
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700' 
                    : 'bg-white hover:bg-neutral-100 text-black border-neutral-800 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                }`}
                title={selectedIds.length > 0 ? `Export ${selectedIds.length} Selected to PDF / Print` : `Export all ${filteredCreators.length} filtered coaches to PDF / Print`}
              >
                <Printer className="w-3.5 h-3.5 text-blue-500" />
                <span>PDF {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</span>
              </button>
            </div>

            {/* View Toggle (hidden on mobile inside accordion since it's already in the accordion header) */}
            <div className="hidden md:flex items-center gap-1 border p-1 rounded font-mono text-xs border-current">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${viewMode === 'table' ? (isDarkMode ? 'bg-white text-black' : 'bg-black text-white') : 'opacity-60'}`}
                title="Table Ledger"
              >
                <Table className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded ${viewMode === 'kanban' ? (isDarkMode ? 'bg-white text-black' : 'bg-black text-white') : 'opacity-60'}`}
                title="Kanban Board"
              >
                <Columns3 className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onOpenAddCreator}
              className={`hidden md:flex items-center gap-1.5 px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider border rounded transition-all ${
                isDarkMode
                  ? 'bg-white text-black border-white hover:bg-neutral-200'
                  : 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Record</span>
            </button>
          </div>
        </div>

        {/* Precision Operator Filters (Score & Follower Range) */}
        <div className={`p-3 border flex flex-wrap items-center justify-between gap-3 text-xs font-mono transition-all ${
          isDarkMode ? 'bg-[#181716] border-neutral-800' : 'bg-[#FAF8F5] border-neutral-300'
        }`}>
          <div className="flex flex-wrap items-center gap-3">
            {/* Score Filter */}
            <div className="flex items-center gap-1.5">
              <span className="opacity-60 text-[10px] uppercase flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" />
                <span>Score:</span>
              </span>
              <select
                value={selectedScore}
                onChange={(e) => setSelectedScore(e.target.value)}
                className={`px-2 py-1 border rounded text-xs focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              >
                <option value="All">All Scores (الكل)</option>
                <option value="9-10">9-10 Elite (أولوية قصوى 🔥)</option>
                <option value="7-8">7-8 High Potential (إمكانية عالية ⭐)</option>
                <option value="5-6">5-6 Average (متوسط)</option>
                <option value="1-4">1-4 Low (منخفض)</option>
              </select>
            </div>

            {/* Follower Range Filter */}
            <div className="flex items-center gap-1.5">
              <span className="opacity-60 text-[10px] uppercase flex items-center gap-1">
                <Users className="w-3 h-3 text-blue-500" />
                <span>Followers:</span>
              </span>
              <select
                value={selectedFollowerRange}
                onChange={(e) => setSelectedFollowerRange(e.target.value)}
                className={`px-2 py-1 border rounded text-xs focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              >
                <option value="All">All Ranges (جميع المتابعين)</option>
                <option value="<10k">&lt; 10K Followers (&lt;10 آلاف)</option>
                <option value="10k-50k">10K - 50K Followers (10-50 ألف)</option>
                <option value="50k-100k">50K - 100K Followers (50-100 ألف)</option>
                <option value="100k+">100K+ Followers (أكثر من 100 ألف)</option>
              </select>
            </div>

            {/* Stage Filter */}
            <div className="flex items-center gap-1.5">
              <span className="opacity-60 text-[10px] uppercase">Stage:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`px-2 py-1 border rounded text-xs focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              >
                <option value="All">All Stages</option>
                {statuses.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Active Filter Clear */}
            {(selectedScore !== 'All' || selectedFollowerRange !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={() => { setSelectedScore('All'); setSelectedFollowerRange('All'); setSelectedStatus('All'); }}
                className="text-[11px] underline opacity-70 hover:opacity-100 text-rose-500 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {filteredCreators.length > 0 && (
              <button
                onClick={handleToggleSelectAll}
                className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                  isAllSelected
                    ? isDarkMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-amber-100 text-amber-900 border-amber-400'
                    : isDarkMode ? 'border-neutral-700 hover:border-neutral-500 opacity-80' : 'border-neutral-300 hover:border-black opacity-80'
                }`}
                title={isAllSelected ? 'Deselect all visible coaches' : `Select all ${filteredCreators.length} visible coaches`}
              >
                <CheckSquare className="w-3 h-3 text-amber-500" />
                <span>{isAllSelected ? 'Deselect All' : `Select All (${filteredCreators.length})`}</span>
              </button>
            )}

            {selectedIds.length > 0 && (
              <button
                onClick={handleClearSelection}
                className="text-[11px] font-mono text-rose-500 underline opacity-80 hover:opacity-100 flex items-center gap-0.5"
                title="Clear all selections"
              >
                <X className="w-3 h-3" />
                <span>Clear ({selectedIds.length})</span>
              </button>
            )}

            <div className="opacity-60 text-[11px]">
              Showing <strong>{filteredCreators.length}</strong> {filteredCreators.length === 1 ? 'coach' : 'coaches'}
            </div>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className={`border overflow-hidden transition-all ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className={`border-b font-mono uppercase tracking-wider text-[11px] ${
                  isDarkMode ? 'border-neutral-800 bg-[#141312] text-neutral-400' : 'border-neutral-900 bg-[#F7F5F0] text-neutral-700'
                }`}>
                  <th className="py-3 px-3 text-center w-10">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded cursor-pointer accent-amber-500"
                      title={isAllSelected ? 'Deselect All' : 'Select All Visible Coaches'}
                    />
                  </th>
                  <th className="py-3 px-4">Coach / Handle</th>
                  <th className="py-3 px-2 font-mono">Score</th>
                  <th className="py-3 px-3">Role / Classification</th>
                  <th className="py-3 px-3 font-mono">Followers</th>
                  <th className="py-3 px-3 font-mono">Stage</th>
                  <th className="py-3 px-3">Messages Sent</th>
                  <th className="py-3 px-4">Analysis &amp; Bio Flaw</th>
                  <th className="py-3 px-3">Links &amp; Video</th>
                  <th className="py-3 px-4 text-right">Edit / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredCreators.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-6 h-6 opacity-40" />
                        <span className="font-serif text-base font-bold">No Records Found in this Category</span>
                        <span className="text-xs opacity-60 max-w-sm">
                          Click "+ Add Record" above to register new coaches, active partners, or reference benchmarks.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCreators.map((creator) => {
                    const isSelected = selectedIds.includes(creator.id);
                    return (
                      <tr 
                        key={creator.id} 
                        className={`transition-colors ${
                          isSelected
                            ? isDarkMode ? 'bg-amber-500/15 hover:bg-amber-500/20' : 'bg-amber-50 hover:bg-amber-100/60'
                            : 'hover:bg-neutral-500/5'
                        }`}
                      >
                        {/* Multi-Select Checkbox */}
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(creator.id)}
                            className="w-4 h-4 rounded cursor-pointer accent-amber-500"
                            title="Select coach"
                          />
                        </td>

                        {/* Name & Handle */}
                        <td className="py-3 px-4">
                          <div 
                            onClick={() => handleOpenVault(creator)}
                          className="font-bold text-sm font-sans flex items-center gap-1.5 cursor-pointer hover:underline group"
                          title="Click to open Client Vault Drawer (Brand, Results, Credentials, RIB)"
                        >
                          <span>{creator.name}</span>
                          {creator.vault?.igPassword && (
                            <span title="Instagram credentials saved in Secure Vault">
                              <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                            </span>
                          )}
                        </div>
                        <a
                          href={creator.profileUrl || `https://instagram.com/${creator.handle.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          {creator.handle}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        {creator.subNiche && (
                          <span className="inline-block mt-0.5 font-mono text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 truncate max-w-[130px]">
                            {creator.subNiche}
                          </span>
                        )}
                      </td>

                      {/* Operator Score */}
                      <td className="py-3 px-2">
                        {getScoreBadge(creator.score)}
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-3">
                        {getCategoryBadge(creator.coachCategory)}
                      </td>

                      {/* Followers */}
                      <td className="py-3 px-3 font-mono font-bold text-xs">
                        {formatFollowers(creator.followers)}
                        {creator.engagementRate && (
                          <span className="block text-[10px] opacity-60 font-normal">Eng: {creator.engagementRate}</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <select
                          value={creator.status}
                          onChange={(e) => onUpdateCreatorStatus(creator.id, e.target.value as CreatorStatus)}
                          className={`font-mono text-xs font-bold px-2 py-0.5 border rounded focus:outline-none ${
                            isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-900 text-black'
                          }`}
                        >
                          {statuses.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>

                      {/* Touchpoints Logged */}
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <button
                          onClick={() => onOpenEditCreator(creator)}
                          className="flex items-center gap-1 underline opacity-80 hover:opacity-100"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-500" />
                          <span>{creator.touchpoints?.length || 0} touchpoints</span>
                        </button>
                      </td>

                      {/* Notes / Gap Analysis & Bio Flaw */}
                      <td className="py-3 px-4 max-w-xs">
                        {creator.bioFlaw && (
                          <div className="mb-1 text-[11px] font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 line-clamp-1" title={creator.bioFlaw}>
                            ⚠️ {creator.bioFlaw}
                          </div>
                        )}
                        {creator.isArchived && creator.archiveReason ? (
                          <div className="p-1.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-mono leading-tight">
                            <span className="font-bold uppercase text-[9px] block opacity-75">Archive Motive:</span>
                            <span>{creator.archiveReason}</span>
                          </div>
                        ) : (
                          <p className="line-clamp-2 opacity-75 text-xs">{creator.notes || '—'}</p>
                        )}
                      </td>

                      {/* Video / Reel Link */}
                      <td className="py-3 px-3 text-xs font-mono">
                        {creator.videoUrl ? (
                          <a
                            href={creator.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-500 hover:underline border border-blue-500/30 px-1.5 py-0.5 rounded"
                          >
                            <Video className="w-3 h-3" />
                            <span>Watch Reel/Loom</span>
                          </a>
                        ) : (
                          <span className="opacity-40 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://ig.me/m/${creator.handle.replace('@', '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded border border-blue-500/40 text-blue-500 hover:bg-blue-500/10 transition-colors"
                            title="Send direct Instagram DM"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </a>
                          {creator.isArchived ? (
                            <button
                              onClick={() => onRestoreCreator(creator.id)}
                              className="px-2 py-1 rounded border border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
                              title="Restore lead to active pipeline"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onOpenArchiveModal(creator)}
                              className="p-1.5 rounded border border-amber-500/40 text-amber-600 hover:bg-amber-500/10 transition-colors"
                              title="Move to Archive with reason"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenVault(creator)}
                            className={`px-2 py-1 rounded border text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                              creator.vault?.igPassword
                                ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : isDarkMode
                                ? 'border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300'
                                : 'border-neutral-900 bg-white hover:bg-neutral-100 text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                            }`}
                            title="Open Client Vault Drawer (Instagram Credentials, Skool, Drive, CIH RIB)"
                          >
                            <Lock className="w-3 h-3 text-emerald-500" />
                            <span>Vault</span>
                          </button>
                          {onOpenReaderView && (
                            <button
                              onClick={() => onOpenReaderView(creator)}
                              className={`px-2 py-1 rounded border text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                                creator.dossierMarkdown
                                  ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold'
                                  : isDarkMode
                                  ? 'border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300'
                                  : 'border-neutral-900 bg-white hover:bg-neutral-100 text-black'
                              }`}
                              title={creator.dossierMarkdown ? 'Open AI Intelligence Dossier in Reader View (نمط القراءة)' : 'Add AI Dossier Markdown'}
                            >
                              <BookOpen className="w-3 h-3 text-amber-500" />
                              <span>{creator.dossierMarkdown ? 'Dossier' : '+Dossier'}</span>
                            </button>
                          )}
                          <button
                            onClick={() => onOpenEditCreator(creator)}
                            className={`p-1.5 rounded border transition-colors ${
                              isDarkMode ? 'border-neutral-700 hover:border-white text-neutral-300' : 'border-neutral-300 hover:border-black text-black'
                            }`}
                            title="Edit all fields & touchpoints"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRequestConfirmDelete(`Creator Lead: "${creator.name}"`, () => onDeleteCreator(creator.id))}
                            className="p-1.5 rounded text-neutral-400 hover:text-red-500 transition-colors"
                            title="Delete Lead (Confirmation required)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Board View - Stacked Grid (No Horizontal Scrolling) or Classic Lanes */
        <div className="space-y-4">
          {/* Top helper & layout control toolbar */}
          <div className={`p-3 rounded-lg border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
            isDarkMode ? 'bg-[#181716] border-neutral-800' : 'bg-[#FAF8F5] border-neutral-300'
          }`}>
            {/* Stage Quick Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider opacity-60 mr-1">
                STAGE FILTER:
              </span>
              <button
                type="button"
                onClick={() => setKanbanStageFilter('All')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer border ${
                  kanbanStageFilter === 'All'
                    ? isDarkMode 
                      ? 'bg-white text-black border-white' 
                      : 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'border-transparent opacity-70 hover:opacity-100 hover:border-current'
                }`}
              >
                All Stages (6)
              </button>
              {statuses.map((st) => {
                const count = filteredCreators.filter((c) => c.status === st).length;
                const dot = stageDetails[st].dotColor;
                const isSelected = kanbanStageFilter === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setKanbanStageFilter(st)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-all cursor-pointer border flex items-center gap-1.5 ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-xs'
                        : 'border-transparent opacity-70 hover:opacity-100 hover:border-current'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${dot} shrink-0`}></span>
                    <span>{st}</span>
                    <span className="opacity-60 text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Layout Mode Switcher */}
            <div className="flex items-center gap-1 self-stretch md:self-auto justify-end bg-neutral-200 dark:bg-neutral-800/80 p-1 rounded-md border border-neutral-300 dark:border-neutral-700">
              <button
                type="button"
                onClick={() => setKanbanLayout('grid')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  kanbanLayout === 'grid'
                    ? isDarkMode
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-white text-black shadow-xs'
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="Stacked Grid (No Horizontal Scrolling - 3 columns per row)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Stacked Grid (تحت بعض)</span>
              </button>

              <button
                type="button"
                onClick={() => setKanbanLayout('stack')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  kanbanLayout === 'stack'
                    ? isDarkMode
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-white text-black shadow-xs'
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="Vertical List (One column per row)"
              >
                <Rows className="w-3.5 h-3.5" />
                <span>Vertical List</span>
              </button>

              <button
                type="button"
                onClick={() => setKanbanLayout('horizontal')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  kanbanLayout === 'horizontal'
                    ? isDarkMode
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-white text-black shadow-xs'
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="Horizontal Lanes (Wide board)"
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span>Horizontal Lanes</span>
              </button>
            </div>
          </div>

          {/* Kanban Columns Container: Grid (No Horizontal Scroll), Vertical Stack, or Horizontal Lanes */}
          <div className={`${
            kanbanLayout === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pb-6 pt-1 select-none'
              : kanbanLayout === 'stack'
              ? 'flex flex-col gap-5 pb-6 pt-1 select-none max-w-4xl mx-auto w-full'
              : 'flex gap-5 overflow-x-auto pb-6 pt-1 items-start scrollbar-thin select-none'
          }`}>
            {(kanbanStageFilter === 'All' ? statuses : statuses.filter(s => s === kanbanStageFilter)).map((statusCol) => {
              const columnCreators = filteredCreators.filter((c) => c.status === statusCol);
              const config = stageDetails[statusCol];

              return (
                <div 
                  key={statusCol}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverCol(statusCol);
                  }}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverCol(null);
                    const id = e.dataTransfer.getData('text/plain');
                    if (id) {
                      onUpdateCreatorStatus(id, statusCol);
                    }
                  }}
                  className={`${
                    kanbanLayout === 'horizontal' ? 'w-[320px] shrink-0' : 'w-full'
                  } border-2 rounded-lg flex flex-col transition-all ${
                    dragOverCol === statusCol ? 'ring-2 ring-blue-500 scale-[1.01]' : ''
                  } ${
                    isDarkMode 
                      ? 'bg-[#181716] border-neutral-800 shadow-md' 
                      : 'bg-[#FAF8F5] border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {/* Column Header with ample space */}
                  <div className={`p-4 border-b flex items-center justify-between ${
                    isDarkMode ? 'border-neutral-800 bg-[#141312]' : 'border-neutral-900 bg-white'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full ${config.dotColor} shrink-0`}></span>
                      <div>
                        <div className="font-mono text-xs font-bold uppercase tracking-wider">
                          {statusCol}
                        </div>
                        <div className="text-[10px] font-sans opacity-60">
                          {config.arLabel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        isDarkMode 
                          ? 'bg-[#222120] border-neutral-700 text-white' 
                          : 'bg-[#F2EFE9] border-neutral-900 text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                      }`}>
                        {columnCreators.length}
                      </span>
                    </div>
                  </div>

                  {/* Cards Body */}
                  <div className="p-3.5 space-y-3 min-h-[400px] flex flex-col justify-start">
                    {columnCreators.map((creator) => {
                      const isSelected = selectedIds.includes(creator.id);
                      return (
                        <div 
                          key={creator.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', creator.id);
                          }}
                          className={`border-2 p-3.5 rounded-md text-xs transition-all cursor-grab active:cursor-grabbing ${
                            isSelected
                              ? isDarkMode
                                ? 'ring-2 ring-amber-500 border-amber-500 bg-[#242019]'
                                : 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/60'
                              : isDarkMode 
                                ? 'bg-[#1F1E1C] border-neutral-700 hover:border-neutral-500 text-white' 
                                : 'bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:-translate-y-0.5'
                          }`}
                        >
                          {/* Top: Checkbox, Handle, Name, Followers */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-start gap-2 overflow-hidden">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleToggleSelect(creator.id);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 mt-0.5 rounded cursor-pointer accent-amber-500 shrink-0"
                                title="Select coach for bulk action"
                              />
                              <div className="overflow-hidden">
                                <strong 
                                  onClick={() => handleOpenVault(creator)}
                                  className="block font-sans text-sm font-bold truncate cursor-pointer hover:underline"
                                  title="Click to open Client Vault Drawer (Brand, Results, Credentials, RIB)"
                                >
                                  {creator.name}
                                </strong>
                              <a
                                href={creator.profileUrl || `https://instagram.com/${creator.handle.replace('@', '')}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="font-mono text-xs text-blue-500 hover:underline inline-flex items-center gap-1 mt-0.5"
                              >
                                <span>{creator.handle}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {getScoreBadge(creator.score)}
                            <span className={`font-mono text-xs font-bold px-2 py-0.5 border rounded ${
                              isDarkMode ? 'border-neutral-700 bg-neutral-800' : 'border-neutral-900 bg-neutral-100'
                            }`}>
                              {formatFollowers(creator.followers)}
                            </span>
                          </div>
                        </div>

                        {/* Category, Niche & Sub-Niche */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          {getCategoryBadge(creator.coachCategory)}
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-current opacity-60">
                            {creator.niche}
                          </span>
                          {creator.subNiche && (
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300">
                              {creator.subNiche}
                            </span>
                          )}
                        </div>

                        {/* Bio Flaw Badge if present */}
                        {creator.bioFlaw && (
                          <div className="mb-2 text-[10px] font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 line-clamp-1" title={creator.bioFlaw}>
                            ⚠️ {creator.bioFlaw}
                          </div>
                        )}

                        {/* Notes / Memo */}
                        {creator.notes && (
                          <div className={`p-2 rounded text-[11px] font-sans border-l-2 border-blue-500 mb-2.5 leading-relaxed ${
                            isDarkMode ? 'bg-[#141312] text-neutral-300' : 'bg-[#F7F5F0] text-neutral-800'
                          }`}>
                            <p className="line-clamp-3">{creator.notes}</p>
                          </div>
                        )}

                        {/* Video / Reel Link */}
                        {creator.videoUrl && (
                          <a
                            href={creator.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:underline mb-2.5 font-mono"
                          >
                            <Video className="w-3.5 h-3.5 text-blue-500" />
                            <span>Watch Reel / Loom Audit</span>
                          </a>
                        )}

                        {/* Touchpoints counter */}
                        {creator.touchpoints && creator.touchpoints.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] font-mono opacity-70 mb-2">
                            <Clock className="w-3 h-3 text-emerald-500" />
                            <span>{creator.touchpoints.length} interaction{creator.touchpoints.length > 1 ? 's' : ''} logged</span>
                          </div>
                        )}

                        {/* Card Footer: Quick Move, Archive & Edit */}
                        <div className="pt-2.5 border-t border-dashed border-current opacity-85 flex items-center justify-between gap-1 mt-1">
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`https://ig.me/m/${creator.handle.replace('@', '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded border border-blue-500/40 text-blue-500 hover:bg-blue-500/10 transition-colors"
                              title="Send direct Instagram DM"
                            >
                              <Send className="w-2.5 h-2.5" />
                            </a>

                            <button
                              onClick={() => onOpenEditCreator(creator)}
                              className="font-mono text-[11px] font-bold underline flex items-center gap-1 hover:opacity-100"
                              title="Edit Lead Dossier"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleOpenVault(creator)}
                              className={`font-mono text-[10px] font-bold flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all ${
                                creator.vault?.igPassword 
                                  ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                  : 'border-current opacity-70 hover:opacity-100'
                              }`}
                              title="Open Client Vault Drawer"
                            >
                              <Lock className="w-2.5 h-2.5 text-emerald-500" />
                              <span>Vault</span>
                            </button>

                            {onOpenReaderView && (
                              <button
                                onClick={() => onOpenReaderView(creator)}
                                className={`font-mono text-[10px] font-bold flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all ${
                                  creator.dossierMarkdown 
                                    ? 'border-amber-500 bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold' 
                                    : 'border-current opacity-70 hover:opacity-100'
                                }`}
                                title={creator.dossierMarkdown ? 'Open AI Dossier in Reader View (نمط القراءة)' : 'Add AI Dossier'}
                              >
                                <BookOpen className="w-2.5 h-2.5 text-amber-500" />
                                <span>{creator.dossierMarkdown ? 'Dossier' : '+Dossier'}</span>
                              </button>
                            )}

                            {creator.isArchived ? (
                              <button
                                onClick={() => onRestoreCreator(creator.id)}
                                className="font-mono text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5"
                                title="Restore lead"
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                                <span>Restore</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onOpenArchiveModal(creator)}
                                className="font-mono text-[10px] text-amber-600 hover:underline flex items-center gap-0.5"
                                title="Archive with motive"
                              >
                                <Archive className="w-2.5 h-2.5" />
                                <span>Archive</span>
                              </button>
                            )}

                            <button
                              onClick={() => onRequestConfirmDelete(`Creator Lead: "${creator.name}"`, () => onDeleteCreator(creator.id))}
                              className="text-neutral-400 hover:text-red-500 p-0.5 transition-colors"
                              title="Delete (Confirmation required)"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {config.nextStatus ? (
                            <button
                              onClick={() => onUpdateCreatorStatus(creator.id, config.nextStatus!)}
                              className={`px-2 py-1 rounded font-mono text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 transition-all ${
                                isDarkMode
                                  ? 'bg-blue-600/20 border-blue-500 text-blue-400 hover:bg-blue-600/30'
                                  : 'bg-blue-50 border-blue-600 text-blue-700 hover:bg-blue-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                              }`}
                              title={`Advance to ${config.nextStatus}`}
                            >
                              <span>&rarr; {config.nextLabel}</span>
                            </button>
                          ) : (
                            <select
                              value={creator.status}
                              onChange={(e) => onUpdateCreatorStatus(creator.id, e.target.value as CreatorStatus)}
                              className="font-mono text-[10px] bg-transparent border rounded px-1.5 py-0.5 focus:outline-none"
                            >
                              {statuses.map((st) => (
                                <option key={st} value={st} className="bg-neutral-900 text-white">{st}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    );
                  })}

                    {/* Clean, Non-Crammed Empty State */}
                    {columnCreators.length === 0 && (
                      <div className={`flex-1 py-12 px-4 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-center gap-2 transition-all ${
                        isDarkMode 
                          ? 'border-neutral-800 bg-neutral-900/20 text-neutral-500' 
                          : 'border-neutral-300 bg-white/40 text-neutral-500'
                      }`}>
                        <div className="w-8 h-8 rounded-full border border-dashed border-current flex items-center justify-center opacity-40">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="font-mono text-xs font-bold uppercase tracking-wider">No Leads in Stage</span>
                        <p className="text-[11px] opacity-70 max-w-[200px]">
                          Drop a card here or add a new lead for {statusCol}.
                        </p>
                        <button
                          onClick={onOpenAddCreator}
                          className={`mt-2 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider border rounded transition-all ${
                            isDarkMode 
                              ? 'bg-[#222120] border-neutral-700 text-white hover:border-neutral-500' 
                              : 'bg-white border-neutral-900 text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-100'
                          }`}
                        >
                          + Add Lead
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Batch Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] animate-in slide-in-from-bottom-5 duration-200">
          <div className={`p-3 px-4 rounded-xl border-2 shadow-2xl flex flex-wrap items-center justify-between gap-3 ${
            isDarkMode 
              ? 'bg-[#181716] border-amber-500 text-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.8)]' 
              : 'bg-[#FAF8F5] border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="font-mono text-xs font-bold">
                {selectedIds.length} {selectedIds.length === 1 ? 'Coach' : 'Coaches'} Selected
              </span>
              <span className="font-mono text-[10px] opacity-60 hidden sm:inline">
                ({selectedCreators.reduce((acc, c) => acc + (c.followers || 0), 0).toLocaleString()} reach)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Export CSV */}
              <button
                type="button"
                onClick={() => handleDirectCSV(selectedCreators)}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold rounded border transition-all ${
                  isDarkMode 
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-600' 
                    : 'bg-white hover:bg-neutral-100 text-black border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                }`}
                title="Export selected creators to CSV spreadsheet"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>Export CSV</span>
              </button>

              {/* Export PDF / Print */}
              <button
                type="button"
                onClick={() => handleOpenExport(selectedCreators)}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold rounded border transition-all ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                }`}
                title="Print or export selected creators to PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>

              {/* Archive Selected */}
              <button
                type="button"
                onClick={handleTriggerBulkArchive}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold rounded border transition-all ${
                  isDarkMode 
                    ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400' 
                    : 'bg-amber-600 hover:bg-amber-700 text-white border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                }`}
                title="Move selected creators to Archive ledger"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive ({selectedIds.length})</span>
              </button>

              {/* Deselect */}
              <button
                type="button"
                onClick={handleClearSelection}
                className="p-1.5 rounded hover:bg-neutral-500/20 opacity-70 hover:opacity-100 transition-colors"
                title="Deselect all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hitlist Export & Print Preview Modal */}
      <HitlistExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        creators={exportTargetCreators}
        isDarkMode={isDarkMode}
      />

      {/* Client Vault Slide-out Drawer */}
      <ClientVaultDrawer
        creator={activeVaultCreator}
        isOpen={!!selectedVaultCreator}
        onClose={() => setSelectedVaultCreator(null)}
        onSaveVault={handleSaveVault}
        onOpenEditModal={(c) => {
          setSelectedVaultCreator(null);
          onOpenEditCreator(c);
        }}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
