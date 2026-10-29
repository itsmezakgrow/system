import React, { useState } from 'react';
import { CalendarMeeting, MeetingType, Creator } from '../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight,
  User,
  AlertCircle
} from 'lucide-react';

interface CalendarViewProps {
  meetings: CalendarMeeting[];
  creators: Creator[];
  onSaveMeeting: (meeting: CalendarMeeting) => void;
  onDeleteMeeting: (id: string) => void;
  isDarkMode: boolean;
  onRequestConfirmDelete: (title: string, onConfirm: () => void) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  meetings,
  creators,
  onSaveMeeting,
  onDeleteMeeting,
  isDarkMode,
  onRequestConfirmDelete,
}) => {
  const [viewMode, setViewMode] = useState<'agenda' | 'month'>('agenda');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<CalendarMeeting | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('15:00');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [meetingType, setMeetingType] = useState<MeetingType>('Discovery Zoom');
  const [meetingLink, setMeetingLink] = useState('');
  const [status, setStatus] = useState<'Scheduled' | 'Completed' | 'Cancelled'>('Scheduled');
  const [notes, setNotes] = useState('');

  const meetingTypes: MeetingType[] = [
    'Discovery Zoom',
    'Pitch & Loom Review',
    'Closing Call (50/50)',
    'Client Strategy',
    'Other'
  ];

  const handleOpenAdd = () => {
    setEditingMeeting(null);
    setTitle('');
    setCreatorId('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('16:00');
    setDurationMinutes(30);
    setMeetingType('Discovery Zoom');
    setMeetingLink('');
    setStatus('Scheduled');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: CalendarMeeting) => {
    setEditingMeeting(m);
    setTitle(m.title);
    setCreatorId(m.creatorId || '');
    setDate(m.date);
    setTime(m.time);
    setDurationMinutes(m.durationMinutes || 30);
    setMeetingType(m.meetingType);
    setMeetingLink(m.meetingLink || '');
    setStatus(m.status);
    setNotes(m.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const linkedCreator = creators.find(c => c.id === creatorId);

    const saved: CalendarMeeting = {
      id: editingMeeting ? editingMeeting.id : `m_${Date.now()}`,
      title: title.trim() || `Call with ${linkedCreator?.name || 'Creator'}`,
      creatorId: creatorId || undefined,
      creatorName: linkedCreator ? linkedCreator.name : undefined,
      creatorHandle: linkedCreator ? linkedCreator.handle : undefined,
      date,
      time,
      durationMinutes: Number(durationMinutes) || 30,
      meetingType,
      meetingLink: meetingLink.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
    };

    onSaveMeeting(saved);
    setIsModalOpen(false);
  };

  // Filter meetings
  const filteredMeetings = meetings.filter((m) => {
    const matchesType = filterType === 'All' || m.meetingType === filterType;
    const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
    return matchesType && matchesStatus;
  }).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const scheduledCount = meetings.filter(m => m.status === 'Scheduled').length;
  const completedCount = meetings.filter(m => m.status === 'Completed').length;

  const getTypeBadge = (type: MeetingType) => {
    switch (type) {
      case 'Discovery Zoom':
        return <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-blue-500/40 bg-blue-500/10 text-blue-500 font-bold">Discovery Zoom</span>;
      case 'Closing Call (50/50)':
        return <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 font-bold">Closing Call (50/50)</span>;
      case 'Pitch & Loom Review':
        return <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-purple-500/40 bg-purple-500/10 text-purple-500 font-bold">Loom Review</span>;
      default:
        return <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-neutral-400 opacity-70">{type}</span>;
    }
  };

  const getStatusBadge = (st: 'Scheduled' | 'Completed' | 'Cancelled') => {
    switch (st) {
      case 'Scheduled':
        return <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-500 font-bold flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Scheduled</span>;
      case 'Completed':
        return <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 font-bold flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> Completed</span>;
      case 'Cancelled':
        return <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-rose-500/40 bg-rose-500/10 text-rose-500 font-bold flex items-center gap-1"><XCircle className="w-2.5 h-2.5" /> Cancelled</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 border rounded font-mono text-xs transition-all ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <span className="opacity-60 block text-[10px] uppercase">Upcoming Calls Scheduled</span>
          <strong className="text-blue-500 text-lg block mt-1">{scheduledCount} Meetings</strong>
        </div>

        <div className={`p-4 border rounded font-mono text-xs transition-all ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <span className="opacity-60 block text-[10px] uppercase">Calls Completed</span>
          <strong className="text-emerald-500 text-lg block mt-1">{completedCount} Closed / Concluded</strong>
        </div>

        <div className={`p-4 border rounded font-mono text-xs transition-all ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <span className="opacity-60 block text-[10px] uppercase">Total In Ledger</span>
          <strong className="text-lg block mt-1">{meetings.length} Total Events</strong>
        </div>
      </div>

      {/* Control Bar: Filters & New Meeting */}
      <div className={`p-4 border flex flex-wrap items-center justify-between gap-3 transition-all ${
        isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
      }`}>
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="opacity-60 text-[10px] uppercase mr-1">Status:</span>
          {['All', 'Scheduled', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded border transition-all ${
                filterStatus === st
                  ? isDarkMode ? 'bg-white text-black font-bold border-white' : 'bg-black text-white font-bold border-black'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider border rounded transition-all ${
              isDarkMode
                ? 'bg-white text-black border-white hover:bg-neutral-200'
                : 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Meetings List / Agenda */}
      {filteredMeetings.length === 0 ? (
        <div className={`p-12 border-2 border-dashed rounded text-center flex flex-col items-center justify-center ${
          isDarkMode ? 'border-neutral-800 bg-[#161514]' : 'border-neutral-300 bg-white/60'
        }`}>
          <CalendarIcon className="w-10 h-10 opacity-30 mb-3" />
          <h4 className="font-serif text-lg font-bold mb-1">No Meetings Scheduled Yet</h4>
          <p className="text-xs opacity-70 max-w-sm mb-4">
            Keep track of all Zoom discovery calls, Loom audit reviews, and 50/50 closing sessions here.
          </p>
          <button
            onClick={handleOpenAdd}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider border rounded transition-all ${
              isDarkMode 
                ? 'bg-white text-black border-white' 
                : 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            + Schedule Your First Call
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeetings.map((m) => (
            <div 
              key={m.id}
              className={`border-2 p-5 rounded-lg flex flex-col justify-between transition-all ${
                isDarkMode 
                  ? 'bg-[#1C1B19] border-neutral-700 shadow-md' 
                  : 'bg-white border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <div>
                {/* Header Date & Status */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-dashed border-current opacity-70">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>{m.date}</span>
                    <span className="opacity-50">&bull;</span>
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{m.time}</span>
                  </div>
                  {getStatusBadge(m.status)}
                </div>

                {/* Meeting Title & Creator */}
                <h4 className="font-serif text-lg font-bold tracking-tight mb-1">
                  {m.title}
                </h4>

                {m.creatorName && (
                  <div className="flex items-center gap-1.5 text-xs font-mono opacity-80 mb-2.5">
                    <User className="w-3 h-3 text-neutral-400" />
                    <span>With: <strong>{m.creatorName}</strong></span>
                    {m.creatorHandle && (
                      <span className="opacity-60">{m.creatorHandle}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  {getTypeBadge(m.meetingType)}
                  <span className="font-mono text-[10px] opacity-60">
                    {m.durationMinutes} min
                  </span>
                </div>

                {/* Notes */}
                {m.notes && (
                  <p className="text-xs font-sans opacity-75 mb-3 p-2 rounded border-l-2 border-blue-500 bg-neutral-500/5">
                    {m.notes}
                  </p>
                )}

                {/* Meeting Link Button */}
                {m.meetingLink && (
                  <a
                    href={m.meetingLink.startsWith('http') ? m.meetingLink : `https://${m.meetingLink}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold border transition-all mb-3 ${
                      isDarkMode
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 hover:bg-blue-600/30'
                        : 'bg-blue-50 border-blue-600 text-blue-700 hover:bg-blue-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Video Call / Meet</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              {/* Footer actions */}
              <div className="pt-3 border-t border-dashed border-current flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-2">
                  {m.status === 'Scheduled' && (
                    <button
                      onClick={() => onSaveMeeting({ ...m, status: 'Completed' })}
                      className="text-[11px] font-mono font-bold text-emerald-600 hover:underline flex items-center gap-1"
                      title="Mark call as completed"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Done</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="text-[11px] font-mono underline opacity-70 hover:opacity-100 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>

                <button
                  onClick={() => onRequestConfirmDelete(`Meeting: "${m.title}"`, () => onDeleteMeeting(m.id))}
                  className="text-neutral-400 hover:text-rose-500 p-1 transition-colors"
                  title="Delete Meeting (with confirmation)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className={`w-full max-w-lg border-2 p-6 rounded-lg relative transition-all ${
            isDarkMode 
              ? 'bg-[#1C1B19] border-neutral-700 text-[#F4F2ED] shadow-2xl' 
              : 'bg-[#FAF8F5] border-neutral-900 text-[#111111] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
          }`}>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-dashed border-current opacity-70">
              <span className="font-mono text-[11px] uppercase tracking-wider">
                {editingMeeting ? '[EDIT MEETING DETAILS]' : '[SCHEDULE NEW MEETING / CALL]'}
              </span>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:opacity-100 opacity-60">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-70 mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Discovery Zoom with Coach Mehdi (50/50 Pitch)"
                  className={`w-full p-2.5 text-xs font-mono border rounded focus:outline-none ${
                    isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                  }`}
                />
              </div>

              {/* Creator Selector */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-70 mb-1">
                  Link to Creator / Coach (Optional)
                </label>
                <select
                  value={creatorId}
                  onChange={(e) => setCreatorId(e.target.value)}
                  className={`w-full p-2.5 text-xs font-mono border rounded focus:outline-none ${
                    isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                  }`}
                >
                  <option value="">-- None / General Call --</option>
                  {creators.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.handle}) - {c.status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider opacity-70 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full p-2 text-xs font-mono border rounded focus:outline-none ${
                      isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider opacity-70 mb-1">
                    Time &amp; Duration
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className={`flex-1 p-2 text-xs font-mono border rounded focus:outline-none ${
                        isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                      }`}
                    />
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className={`w-20 p-2 text-xs font-mono border rounded focus:outline-none ${
                        isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                      }`}
                    >
                      <option value={15}>15m</option>
                      <option value={30}>30m</option>
                      <option value={45}>45m</option>
                      <option value={60}>60m</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Meeting Type & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider opacity-70 mb-1">
                    Call Type
                  </label>
                  <select
                    value={meetingType}
                    onChange={(e) => setMeetingType(e.target.value as MeetingType)}
                    className={`w-full p-2.5 text-xs font-mono border rounded focus:outline-none ${
                      isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                    }`}
                  >
                    {meetingTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider opacity-70 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className={`w-full p-2.5 text-xs font-mono border rounded focus:outline-none ${
                      isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                    }`}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Meeting Link */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-70 mb-1">
                  Video Call Link (Zoom / Google Meet / Calendly)
                </label>
                <input
                  type="text"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://zoom.us/j/... or meet.google.com/..."
                  className={`w-full p-2.5 text-xs font-mono border rounded focus:outline-none ${
                    isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                  }`}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-70 mb-1">
                  Agenda / Call Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes, coach pain points, questions to ask..."
                  className={`w-full p-2 text-xs font-sans border rounded focus:outline-none ${
                    isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                  }`}
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-dashed border-current">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded text-xs font-mono border opacity-70 hover:opacity-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
                    isDarkMode 
                      ? 'bg-white text-black border-white hover:bg-neutral-200' 
                      : 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {editingMeeting ? 'Save Meeting' : 'Schedule Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
