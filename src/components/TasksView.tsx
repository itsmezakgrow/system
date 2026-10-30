import React, { useState, useMemo } from 'react';
import { Creator, CreatorStatus } from '../types';
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  MessageSquare, 
  Flame, 
  Star, 
  Search, 
  ArrowRight, 
  Plus, 
  Phone, 
  Check, 
  RotateCcw,
  Sparkles,
  CalendarDays,
  UserCheck,
  Video,
  ChevronDown
} from 'lucide-react';

interface TasksViewProps {
  creators: Creator[];
  onUpdateCreator: (creator: Creator) => void;
  onOpenAddCreator: () => void;
  onOpenEditCreator: (creator: Creator) => void;
  isDarkMode: boolean;
  onNavigateToCalendar?: () => void;
}

type TimeFilter = 'today' | 'tomorrow' | 'overdue' | 'this_week' | 'all';
type ScoreFilter = 'all' | 'elite' | 'high' | 'mid';

export const TasksView: React.FC<TasksViewProps> = ({
  creators,
  onUpdateCreator,
  onOpenAddCreator,
  onOpenEditCreator,
  isDarkMode,
  onNavigateToCalendar,
}) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeNoteEditId, setActiveNoteEditId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [customDatePickerId, setCustomDatePickerId] = useState<string | null>(null);

  // Helper date strings
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const weekEndStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  }, []);

  // Filter coaches who are active (not archived) and prospects or waiting list
  const activeCoaches = useMemo(() => {
    return creators.filter(c => !c.isArchived);
  }, [creators]);

  // Key metrics
  const metrics = useMemo(() => {
    const dueToday = activeCoaches.filter(c => {
      if (!c.scheduledContactDate) return true; // if not scheduled, ready for outreach
      return c.scheduledContactDate <= todayStr && c.talkedStatus !== 'Answered Today';
    });

    const answeredToday = activeCoaches.filter(c => {
      return c.lastTalkedDate === todayStr || c.talkedStatus === 'Answered Today';
    });

    const overdue = activeCoaches.filter(c => {
      return c.scheduledContactDate && c.scheduledContactDate < todayStr && c.talkedStatus !== 'Answered Today';
    });

    const eliteScore = activeCoaches.filter(c => (c.score || 0) >= 9);

    return {
      dueTodayCount: dueToday.length,
      answeredTodayCount: answeredToday.length,
      overdueCount: overdue.length,
      eliteCount: eliteScore.length,
    };
  }, [activeCoaches, todayStr]);

  // Filtered list based on active filters
  const filteredTasks = useMemo(() => {
    return activeCoaches.filter(coach => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          coach.name.toLowerCase().includes(q) ||
          coach.handle.toLowerCase().includes(q) ||
          (coach.subNiche && coach.subNiche.toLowerCase().includes(q)) ||
          (coach.bioFlaw && coach.bioFlaw.toLowerCase().includes(q)) ||
          (coach.loomHook && coach.loomHook.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Score filter
      const score = coach.score || 0;
      if (scoreFilter === 'elite' && score < 9) return false;
      if (scoreFilter === 'high' && (score < 7 || score > 8)) return false;
      if (scoreFilter === 'mid' && (score < 5 || score > 6)) return false;

      // Status filter
      if (statusFilter !== 'all' && coach.status !== statusFilter) return false;

      // Time Filter
      const sched = coach.scheduledContactDate;
      if (timeFilter === 'today') {
        // Either scheduled for today or not yet scheduled (pipeline queue)
        if (sched && sched > todayStr) return false;
      } else if (timeFilter === 'tomorrow') {
        if (sched !== tomorrowStr) return false;
      } else if (timeFilter === 'overdue') {
        if (!sched || sched >= todayStr || coach.talkedStatus === 'Answered Today') return false;
      } else if (timeFilter === 'this_week') {
        if (!sched || sched < todayStr || sched > weekEndStr) return false;
      }
      // 'all' passes

      return true;
    }).sort((a, b) => {
      // Sort by score descending (highest priority first), then by scheduled date
      const scoreA = a.score || 5;
      const scoreB = b.score || 5;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (a.scheduledContactDate || '9999') > (b.scheduledContactDate || '9999') ? 1 : -1;
    });
  }, [activeCoaches, searchQuery, scoreFilter, statusFilter, timeFilter, todayStr, tomorrowStr, weekEndStr]);

  // Actions
  const handleCopyHook = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenDirectDM = (coach: Creator) => {
    const rawHandle = coach.handle.replace('@', '').trim();
    // Direct Instagram DM link: opens DM screen on web & mobile app
    const igDmUrl = `https://ig.me/m/${rawHandle}`;
    window.open(igDmUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenWhatsApp = (coach: Creator) => {
    const phone = coach.vault?.coachPhone || '';
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}`, '_blank', 'noopener,noreferrer');
    }
  };

  // Mark: "Yes, He Answered Today"
  const handleMarkAnsweredToday = (coach: Creator) => {
    const updated: Creator = {
      ...coach,
      talkedStatus: 'Answered Today',
      lastTalkedDate: todayStr,
      lastContactDate: todayStr,
      status: coach.status === 'To Contact' ? 'DM Sent' : coach.status,
      touchpoints: [
        {
          id: `tp_${Date.now()}`,
          type: 'Message 1 (Hook)',
          date: todayStr,
          notes: 'Coach answered today. Active conversation in progress.',
        },
        ...coach.touchpoints,
      ],
    };
    onUpdateCreator(updated);
  };

  // Mark: "Sent DM, Waiting / No Answer" + auto-reschedule +2 days
  const handleMarkSentNoAnswer = (coach: Creator) => {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 2);
    const nextDateStr = followUpDate.toISOString().split('T')[0];

    const updated: Creator = {
      ...coach,
      talkedStatus: 'Sent - No Answer',
      lastContactDate: todayStr,
      scheduledContactDate: nextDateStr,
      status: coach.status === 'To Contact' ? 'DM Sent' : coach.status,
      touchpoints: [
        {
          id: `tp_${Date.now()}`,
          type: 'Follow-up 1',
          date: todayStr,
          notes: `Sent outreach message. Follow-up auto-scheduled for ${nextDateStr}.`,
        },
        ...coach.touchpoints,
      ],
    };
    onUpdateCreator(updated);
  };

  // Reschedule contact to specific offset or date
  const handleReschedule = (coach: Creator, daysToAdd: number, customDate?: string) => {
    let targetDateStr = customDate;
    if (!targetDateStr) {
      const d = new Date();
      d.setDate(d.getDate() + daysToAdd);
      targetDateStr = d.toISOString().split('T')[0];
    }

    const updated: Creator = {
      ...coach,
      scheduledContactDate: targetDateStr,
      talkedStatus: 'Follow-up Due',
    };
    onUpdateCreator(updated);
    setCustomDatePickerId(null);
  };

  // Advance to Zoom Booked
  const handleMarkZoomBooked = (coach: Creator) => {
    const updated: Creator = {
      ...coach,
      status: 'Zoom Booked',
      talkedStatus: 'Call Booked',
      lastTalkedDate: todayStr,
      touchpoints: [
        {
          id: `tp_${Date.now()}`,
          type: 'Zoom Call',
          date: todayStr,
          notes: 'Zoom closing / discovery call agreed upon.',
        },
        ...coach.touchpoints,
      ],
    };
    onUpdateCreator(updated);
  };

  // Save quick note
  const handleSaveQuickNote = (coach: Creator) => {
    if (!noteDraft.trim()) return;
    const updated: Creator = {
      ...coach,
      outreachNotes: noteDraft.trim(),
      touchpoints: [
        {
          id: `tp_${Date.now()}`,
          type: 'Custom Note',
          date: todayStr,
          notes: noteDraft.trim(),
        },
        ...coach.touchpoints,
      ],
    };
    onUpdateCreator(updated);
    setActiveNoteEditId(null);
    setNoteDraft('');
  };

  const getScoreBadge = (score?: number) => {
    const s = score || 5;
    if (s >= 9) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
          <Flame className="w-3 h-3 fill-amber-500" />
          <span>{s}/10 ELITE</span>
        </span>
      );
    }
    if (s >= 7) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-blue-500/15 text-blue-500 border border-blue-500/30">
          <Star className="w-3 h-3 fill-blue-500" />
          <span>{s}/10 HIGH FIT</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-neutral-500/15 text-neutral-400 border border-neutral-500/30">
        <span>{s}/10 FIT</span>
      </span>
    );
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(0) + 'K';
    return count.toString();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Strategy Summary */}
      <div className={`p-4 sm:p-5 border transition-all ${
        isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                Zero Mental Friction / Outreach Execution
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mt-1">
              Outreach Tasks &amp; Schedule
            </h1>
            <p className="font-sans text-xs sm:text-sm opacity-70 mt-0.5">
              Click to message each coach directly, copy their tailored hook, and record their response with one tap.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onOpenAddCreator}
              className={`flex items-center gap-1.5 px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider border rounded transition-all ${
                isDarkMode 
                  ? 'bg-white text-black border-white hover:bg-neutral-200' 
                  : 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Coach</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className={`p-2.5 sm:p-3 border rounded font-mono ${
            isDarkMode ? 'bg-[#141312] border-neutral-800' : 'bg-[#FAF8F5] border-neutral-200'
          }`}>
            <span className="text-[10px] uppercase opacity-60 block">Due Today / Queue</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold text-amber-500">{metrics.dueTodayCount}</span>
              <span className="text-[10px] opacity-60">to contact</span>
            </div>
          </div>

          <div className={`p-2.5 sm:p-3 border rounded font-mono ${
            isDarkMode ? 'bg-[#141312] border-neutral-800' : 'bg-[#FAF8F5] border-neutral-200'
          }`}>
            <span className="text-[10px] uppercase opacity-60 block">Answered Today</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold text-emerald-500">{metrics.answeredTodayCount}</span>
              <span className="text-[10px] opacity-60">active chats</span>
            </div>
          </div>

          <div className={`p-2.5 sm:p-3 border rounded font-mono ${
            isDarkMode ? 'bg-[#141312] border-neutral-800' : 'bg-[#FAF8F5] border-neutral-200'
          }`}>
            <span className="text-[10px] uppercase opacity-60 block">Overdue Follow-ups</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-xl sm:text-2xl font-bold ${metrics.overdueCount > 0 ? 'text-rose-500' : 'text-neutral-400'}`}>
                {metrics.overdueCount}
              </span>
              <span className="text-[10px] opacity-60">needs bump</span>
            </div>
          </div>

          <div className={`p-2.5 sm:p-3 border rounded font-mono ${
            isDarkMode ? 'bg-[#141312] border-neutral-800' : 'bg-[#FAF8F5] border-neutral-200'
          }`}>
            <span className="text-[10px] uppercase opacity-60 block">Elite Tier (9-10)</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold text-blue-500">{metrics.eliteCount}</span>
              <span className="text-[10px] opacity-60">prime fit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className={`p-3.5 border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all ${
        isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
      }`}>
        {/* Time Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <span className="text-[10px] uppercase opacity-50 mr-1 hidden sm:inline">Schedule:</span>
          {(['today', 'tomorrow', 'overdue', 'this_week', 'all'] as TimeFilter[]).map((tab) => {
            const labels: Record<TimeFilter, string> = {
              today: 'Today',
              tomorrow: 'Tomorrow',
              overdue: 'Overdue',
              this_week: 'This Week',
              all: 'All Coaches',
            };
            const isActive = timeFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setTimeFilter(tab)}
                className={`px-3 py-1.5 rounded border transition-all text-xs font-semibold ${
                  isActive
                    ? isDarkMode
                      ? 'bg-white text-black font-bold border-white'
                      : 'bg-black text-white font-bold border-black'
                    : 'border-transparent opacity-65 hover:opacity-100'
                }`}
              >
                {labels[tab]}
                {tab === 'today' && metrics.dueTodayCount > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-amber-500 text-black' : 'bg-amber-500/20 text-amber-500'
                  }`}>
                    {metrics.dueTodayCount}
                  </span>
                )}
                {tab === 'overdue' && metrics.overdueCount > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-rose-500 text-white' : 'bg-rose-500/20 text-rose-500'
                  }`}>
                    {metrics.overdueCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Score & Search Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Score Selector */}
          <div className="flex items-center gap-1 border rounded px-2 py-1 font-mono text-xs border-current opacity-85">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value as ScoreFilter)}
              className="bg-transparent border-none text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Scores</option>
              <option value="elite">Score 9-10 (Elite)</option>
              <option value="high">Score 7-8 (High Potential)</option>
              <option value="mid">Score 5-6 (Average)</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coach, hook, flaw..."
              className={`w-full pl-8 pr-3 py-1 text-xs border rounded font-mono focus:outline-none transition-colors ${
                isDarkMode 
                  ? 'bg-[#141312] border-neutral-700 text-white focus:border-white' 
                  : 'bg-[#FAF8F5] border-neutral-300 text-black focus:border-black'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Task Cards Queue */}
      {filteredTasks.length === 0 ? (
        <div className={`p-12 border text-center transition-all ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <div className="max-w-md mx-auto space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-serif text-lg font-bold">Queue is Clear for this Filter</h3>
            <p className="font-sans text-xs opacity-70">
              No pending tasks matching your current filters. Add new coaches from your hitlist or switch to "All Coaches" to plan ahead.
            </p>
            <button
              onClick={() => { setTimeFilter('all'); setScoreFilter('all'); setSearchQuery(''); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs border rounded hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((coach) => {
            const hasPhone = !!coach.vault?.coachPhone;
            const isAnswered = coach.talkedStatus === 'Answered Today';
            const isSentNoAnswer = coach.talkedStatus === 'Sent - No Answer';
            const isEditingNote = activeNoteEditId === coach.id;

            return (
              <div
                key={coach.id}
                className={`p-4 sm:p-5 border transition-all rounded-none ${
                  isDarkMode 
                    ? 'bg-[#1C1B19] border-neutral-700 hover:border-neutral-500' 
                    : 'bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {/* Header Row: Coach Info, Score, and Category */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif text-lg sm:text-xl font-bold tracking-tight">
                      {coach.name}
                    </span>
                    <a
                      href={coach.profileUrl || `https://instagram.com/${coach.handle.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-blue-500 hover:underline flex items-center gap-0.5"
                    >
                      {coach.handle.startsWith('@') ? coach.handle : `@${coach.handle}`}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {getScoreBadge(coach.score)}
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded border border-neutral-400/40 opacity-70">
                      {formatFollowers(coach.followers)} followers
                    </span>
                    {coach.subNiche && (
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700">
                        {coach.subNiche}
                      </span>
                    )}
                  </div>

                  {/* Stage & Talked status badges */}
                  <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
                    {coach.scheduledContactDate && (
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border ${
                        coach.scheduledContactDate < todayStr && !isAnswered
                          ? 'border-rose-500/40 bg-rose-500/10 text-rose-500 font-bold'
                          : coach.scheduledContactDate === todayStr
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-500 font-bold'
                          : 'border-neutral-400/30 opacity-70'
                      }`}>
                        <CalendarDays className="w-3 h-3" />
                        <span>Scheduled: {coach.scheduledContactDate}</span>
                      </span>
                    )}

                    {isAnswered ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border border-emerald-500 bg-emerald-500/15 text-emerald-500 font-bold">
                        <Check className="w-3 h-3" />
                        <span>Answered Today ✓</span>
                      </span>
                    ) : isSentNoAnswer ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border border-blue-500/40 bg-blue-500/10 text-blue-500">
                        <Clock className="w-3 h-3" />
                        <span>Sent (Waiting)</span>
                      </span>
                    ) : null}

                    <button
                      onClick={() => onOpenEditCreator(coach)}
                      className="text-[11px] opacity-60 hover:opacity-100 underline hover:text-blue-500"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>

                {/* Intelligence Breakdown Grid: Bio Flaw & Opening Hook */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3.5">
                  {/* Current Bio Flaw */}
                  <div className={`p-3 rounded border font-mono text-xs ${
                    isDarkMode ? 'bg-[#141312] border-neutral-800' : 'bg-[#FAF8F5] border-neutral-200'
                  }`}>
                    <div className="flex items-center gap-1.5 text-rose-500 font-bold text-[11px] uppercase mb-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Current Bio Flaw (الثغرة فالبايو)</span>
                    </div>
                    <p className="font-sans text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
                      {coach.bioFlaw ? coach.bioFlaw : 'No bio flaw documented yet. Click Edit Profile to note gaps.'}
                    </p>
                  </div>

                  {/* Loom Hook / Direct Opener */}
                  <div className={`p-3 rounded border font-mono text-xs ${
                    isDarkMode ? 'bg-[#141312] border-neutral-800' : 'bg-[#FAF8F5] border-neutral-200'
                  }`}>
                    <div className="flex items-center justify-between text-blue-500 font-bold text-[11px] uppercase mb-1">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Loom Hook / Cold DM Opener</span>
                      </div>
                      {coach.loomHook && (
                        <button
                          onClick={() => handleCopyHook(coach.id, coach.loomHook || '')}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-blue-500/30 hover:bg-blue-500/10 text-blue-500 text-[10px] lowercase"
                          title="Copy hook to clipboard"
                        >
                          {copiedId === coach.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === coach.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                    <p className="font-sans text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed italic">
                      "{coach.loomHook ? coach.loomHook : `Salam ${coach.name.split(' ')[0]}, watched your content on ${coach.niche}...`}"
                    </p>
                  </div>
                </div>

                {/* Primary Action Toolbar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  {/* Direct Launch Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleOpenDirectDM(coach)}
                      className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-xs font-bold uppercase tracking-wider border transition-all ${
                        isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                      title="Open direct Instagram DM conversation"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send DM on Instagram</span>
                    </button>

                    {hasPhone && (
                      <button
                        onClick={() => handleOpenWhatsApp(coach)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded font-mono text-xs font-semibold border transition-all ${
                          isDarkMode 
                            ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-600/30' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        }`}
                        title="Send WhatsApp message"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    )}

                    {coach.videoUrl && (
                      <a
                        href={coach.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded font-mono text-xs border border-purple-500/30 text-purple-500 hover:bg-purple-500/10"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Watch Loom/Reel</span>
                      </a>
                    )}
                  </div>

                  {/* Operator Outcome One-Tap Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Yes, Talked / Answered */}
                    <button
                      onClick={() => handleMarkAnsweredToday(coach)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded font-mono text-xs font-bold border transition-all ${
                        isAnswered
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-none'
                          : isDarkMode
                          ? 'bg-[#1F1E1C] hover:bg-emerald-950/40 border-neutral-700 hover:border-emerald-500 text-emerald-400'
                          : 'bg-white hover:bg-emerald-50 border-neutral-900 hover:border-emerald-600 text-emerald-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                      title="Click if coach answered today"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Yes, He Answered Today!</span>
                    </button>

                    {/* Sent DM, Waiting */}
                    <button
                      onClick={() => handleMarkSentNoAnswer(coach)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded font-mono text-xs font-medium border transition-all ${
                        isSentNoAnswer
                          ? 'bg-neutral-800 text-neutral-300 border-neutral-600'
                          : isDarkMode
                          ? 'bg-[#1F1E1C] hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                          : 'bg-white hover:bg-neutral-100 border-neutral-900 text-neutral-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                      title="Mark DM sent and auto-schedule bump in 2 days"
                    >
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Sent (No Reply Yet)</span>
                    </button>

                    {/* Quick Reschedule Options */}
                    <div className="relative inline-block">
                      <button
                        onClick={() => setCustomDatePickerId(customDatePickerId === coach.id ? null : coach.id)}
                        className={`flex items-center gap-1 px-2.5 py-2 rounded font-mono text-xs border transition-all ${
                          isDarkMode ? 'border-neutral-700 text-neutral-400 hover:text-white' : 'border-neutral-400 text-neutral-700 hover:border-black'
                        }`}
                        title="Reschedule talk date"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Postpone</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>

                      {/* Dropdown for rescheduling */}
                      {customDatePickerId === coach.id && (
                        <div className={`absolute right-0 bottom-full mb-1 z-30 w-48 p-2 border rounded shadow-lg font-mono text-xs space-y-1 ${
                          isDarkMode ? 'bg-[#181716] border-neutral-700 text-neutral-200' : 'bg-white border-neutral-900 text-neutral-900'
                        }`}>
                          <div className="text-[10px] uppercase opacity-50 px-2 py-1">Reschedule to:</div>
                          <button
                            onClick={() => handleReschedule(coach, 1)}
                            className="w-full text-left px-2 py-1 hover:bg-neutral-500/20 rounded flex items-center justify-between"
                          >
                            <span>Tomorrow</span>
                            <span className="opacity-50">+1d</span>
                          </button>
                          <button
                            onClick={() => handleReschedule(coach, 2)}
                            className="w-full text-left px-2 py-1 hover:bg-neutral-500/20 rounded flex items-center justify-between"
                          >
                            <span>In 2 Days</span>
                            <span className="opacity-50">+2d</span>
                          </button>
                          <button
                            onClick={() => handleReschedule(coach, 4)}
                            className="w-full text-left px-2 py-1 hover:bg-neutral-500/20 rounded flex items-center justify-between"
                          >
                            <span>In 4 Days</span>
                            <span className="opacity-50">+4d</span>
                          </button>
                          <button
                            onClick={() => handleReschedule(coach, 7)}
                            className="w-full text-left px-2 py-1 hover:bg-neutral-500/20 rounded flex items-center justify-between"
                          >
                            <span>Next Week</span>
                            <span className="opacity-50">+7d</span>
                          </button>
                          <div className="pt-1 border-t border-neutral-500/20">
                            <input
                              type="date"
                              onChange={(e) => {
                                if (e.target.value) handleReschedule(coach, 0, e.target.value);
                              }}
                              className="w-full text-xs p-1 border rounded bg-transparent focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Book Zoom Call */}
                    <button
                      onClick={() => handleMarkZoomBooked(coach)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded font-mono text-xs font-bold border transition-all ${
                        coach.status === 'Zoom Booked'
                          ? 'bg-amber-500 text-black border-amber-600'
                          : isDarkMode
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                          : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      }`}
                      title="Advance stage to Zoom Booked"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Book Zoom</span>
                    </button>
                  </div>
                </div>

                {/* Quick Outreach Notes / Conversation Log */}
                <div className="mt-3 pt-2.5 border-t border-neutral-200 dark:border-neutral-800 text-xs">
                  {isEditingNote ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="Write quick conversation note (e.g. said he's interested in Skool, review Friday)..."
                        className={`flex-1 px-3 py-1.5 text-xs border rounded font-mono focus:outline-none ${
                          isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-[#FAF8F5] border-neutral-300 text-black'
                        }`}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveQuickNote(coach)}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveQuickNote(coach)}
                        className="px-3 py-1.5 rounded font-mono text-xs font-bold bg-emerald-600 text-white"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setActiveNoteEditId(null)}
                        className="px-2 py-1.5 rounded font-mono text-xs opacity-60 hover:opacity-100"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-neutral-500 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5 truncate">
                        <MessageSquare className="w-3 h-3 shrink-0" />
                        <span className="font-semibold">Latest Note:</span>
                        <span className="truncate italic">
                          {coach.outreachNotes || (coach.touchpoints[0]?.notes ?? 'No conversation notes yet.')}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveNoteEditId(coach.id);
                          setNoteDraft(coach.outreachNotes || '');
                        }}
                        className="opacity-70 hover:opacity-100 underline text-blue-500 shrink-0 ml-2"
                      >
                        + Add Note
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
