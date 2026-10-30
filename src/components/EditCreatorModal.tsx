import React, { useState } from 'react';
import { Creator, CreatorStatus, NicheCategory, CoachCategory, Touchpoint } from '../types';
import { parseSocialHandle, deriveNameFromHandle, parseFollowerInput, formatFollowersDisplay } from '../utils/urlHelper';
import { X, Save, Plus, ExternalLink, Trash2, Video, MessageSquare, Calendar, Sparkles, Star, Flame } from 'lucide-react';

interface EditCreatorModalProps {
  creator: Creator | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Creator) => void;
  isDarkMode: boolean;
}

export const EditCreatorModal: React.FC<EditCreatorModalProps> = ({
  creator,
  isOpen,
  onClose,
  onSave,
  isDarkMode,
}) => {
  if (!isOpen || !creator) return null;

  const [name, setName] = useState(creator.name);
  const [handleInput, setHandleInput] = useState(creator.handle);
  const [platform, setPlatform] = useState<Creator['platform']>(creator.platform);
  const [followersInput, setFollowersInput] = useState<string>(
    creator.followers ? formatFollowersDisplay(creator.followers) : '20K'
  );
  const [engagementRate, setEngagementRate] = useState<string>(creator.engagementRate || '');
  const [niche, setNiche] = useState<NicheCategory>(creator.niche);
  const [coachCategory, setCoachCategory] = useState<CoachCategory>(creator.coachCategory || 'Prospect');
  const [status, setStatus] = useState<CreatorStatus>(creator.status);
  const [notes, setNotes] = useState(creator.notes);
  const [email, setEmail] = useState(creator.email || '');
  const [estimatedMRR, setEstimatedMRR] = useState<number>(creator.estimatedMRR || 0);
  const [actualMRR, setActualMRR] = useState<number>(creator.actualMRR || 0);
  const [videoUrl, setVideoUrl] = useState(creator.videoUrl || '');
  const [touchpoints, setTouchpoints] = useState<Touchpoint[]>(creator.touchpoints || []);

  // Operator Acquisition Fields
  const [score, setScore] = useState<number>(creator.score ?? 8);
  const [subNiche, setSubNiche] = useState<string>(creator.subNiche || '');
  const [bioFlaw, setBioFlaw] = useState<string>(creator.bioFlaw || '');
  const [loomHook, setLoomHook] = useState<string>(creator.loomHook || '');
  const [source, setSource] = useState<string>(creator.source || 'Instagram Explore');
  const [scheduledContactDate, setScheduledContactDate] = useState<string>(creator.scheduledContactDate || '');
  const [talkedStatus, setTalkedStatus] = useState<Creator['talkedStatus']>(creator.talkedStatus || 'Pending');

  // New touchpoint inline form state
  const [newTouchType, setNewTouchType] = useState<Touchpoint['type']>('Message 1 (Hook)');
  const [newTouchDate, setNewTouchDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTouchNote, setNewTouchNote] = useState('');
  const [newTouchLink, setNewTouchLink] = useState('');
  const [showAddTouchpoint, setShowAddTouchpoint] = useState(false);

  // Auto-calculated profile url & name helper
  const parsed = parseSocialHandle(handleInput, platform);
  const derivedCandidate = deriveNameFromHandle(handleInput);
  const computedFollowers = parseFollowerInput(followersInput, true);

  const handleAddTouchpoint = () => {
    if (!newTouchNote.trim()) return;
    const newTp: Touchpoint = {
      id: `tp_${Date.now()}`,
      type: newTouchType,
      date: newTouchDate,
      notes: newTouchNote,
      link: newTouchLink || undefined,
    };
    setTouchpoints([newTp, ...touchpoints]);
    setNewTouchNote('');
    setNewTouchLink('');
    setShowAddTouchpoint(false);
  };

  const handleDeleteTouchpoint = (id: string) => {
    setTouchpoints(touchpoints.filter(t => t.id !== id));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...creator,
      name,
      handle: parsed.handle,
      platform,
      profileUrl: parsed.profileUrl,
      videoUrl: videoUrl.trim() || undefined,
      followers: computedFollowers,
      engagementRate: engagementRate.trim() || undefined,
      niche,
      coachCategory,
      status,
      notes,
      email: email.trim() || undefined,
      estimatedMRR: Number(estimatedMRR),
      actualMRR: Number(actualMRR),
      touchpoints,
      lastContactDate: touchpoints.length > 0 ? touchpoints[0].date : creator.lastContactDate,
      score: Number(score),
      subNiche: subNiche.trim() || undefined,
      bioFlaw: bioFlaw.trim() || undefined,
      loomHook: loomHook.trim() || undefined,
      source: source.trim() || undefined,
      scheduledContactDate: scheduledContactDate || undefined,
      talkedStatus: talkedStatus || 'Pending',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`w-full max-w-2xl border p-6 md:p-8 rounded shadow-2xl transition-all my-8 max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-[#1C1B19] border-neutral-700 text-white' : 'bg-white border-neutral-900 text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
      }`}>
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-dashed border-current">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              [EDIT COACH DOSSIER // FULL CONTROL]
            </span>
          </div>
          <button onClick={onClose} className="font-mono text-xs opacity-60 hover:opacity-100">
            ✕ CLOSE
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-5 font-mono text-xs">
          {/* Coach Classification (Prospect vs Active vs Benchmark) */}
          <div className="p-3 border rounded border-blue-500/40 bg-blue-500/5">
            <label className="block font-bold uppercase tracking-wider text-blue-500 mb-1.5">
              Coach Classification / دور الكوتش في النظام:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Prospect', label: 'Prospect (Outreach)' },
                { id: 'Active Client', label: 'Active Partner (خدّام معاه)' },
                { id: 'Waiting List', label: 'Waiting List (قائمة الانتظار)' },
                { id: 'Case Study & Benchmark', label: 'Benchmark / دراسة حالة' },
              ].map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCoachCategory(cat.id as CoachCategory)}
                  className={`py-2 px-2 text-[11px] rounded border text-center transition-all ${
                    coachCategory === cat.id
                      ? isDarkMode ? 'bg-white text-black font-bold border-white' : 'bg-black text-white font-bold border-black'
                      : 'border-current opacity-60 hover:opacity-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Handle with auto-link generator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block opacity-70 uppercase">Coach Name</label>
                {derivedCandidate && derivedCandidate !== name && (
                  <button
                    type="button"
                    onClick={() => setName(derivedCandidate)}
                    className="text-[10px] text-emerald-500 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-fill "{derivedCandidate}"
                  </button>
                )}
                {name && derivedCandidate === name && (
                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                    ✓ From link
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Coach Yassine Mouhcine"
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block opacity-70 uppercase">Instagram / Social Handle or Full Link</label>
                <span className="text-[10px] opacity-60">Paste full link or @handle</span>
              </div>
              <input
                type="text"
                required
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder="@coach_handle or https://instagram.com/..."
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
              {parsed.profileUrl && (
                <div className="mt-1 flex items-center justify-between text-[11px] text-blue-500">
                  <span>Auto-Link: {parsed.profileUrl} {parsed.cleanUsername && `(@${parsed.cleanUsername})`}</span>
                  <a href={parsed.profileUrl} target="_blank" rel="noreferrer" className="underline flex items-center gap-0.5">
                    Test <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Stats & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block opacity-70 mb-1 uppercase">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Creator['platform'])}
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="X">X (Twitter)</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block opacity-70 uppercase">Followers</label>
                <span className="text-[11px] font-bold text-amber-500 font-mono">
                  = {computedFollowers.toLocaleString()}
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={followersInput}
                  onChange={(e) => setFollowersInput(e.target.value)}
                  placeholder="e.g. 20K or 50"
                  className={`w-full p-2.5 pr-10 border rounded font-mono font-bold focus:outline-none ${
                    isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                  }`}
                />
                <div className="absolute right-2 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-500 font-mono font-bold text-xs pointer-events-none select-none">
                  K
                </div>
              </div>
              {/* Quick follower presets */}
              <div className="flex items-center gap-1 mt-1.5 overflow-x-auto pb-0.5">
                {['10K', '20K', '50K', '100K', '250K', '500K'].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setFollowersInput(preset)}
                    className={`px-1.5 py-0.5 text-[10px] rounded border transition-all ${
                      followersInput.toUpperCase() === preset
                        ? isDarkMode ? 'bg-amber-500 text-black font-bold border-amber-500' : 'bg-amber-600 text-white font-bold border-amber-600'
                        : 'opacity-60 hover:opacity-100 border-current'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block opacity-70 mb-1 uppercase">Engagement Rate</label>
              <input
                type="text"
                value={engagementRate}
                onChange={(e) => setEngagementRate(e.target.value)}
                placeholder="e.g. 5.2% or High"
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
            <div>
              <label className="block opacity-70 mb-1 uppercase">Niche</label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value as NicheCategory)}
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              >
                <option value="Fitness">Fitness</option>
                <option value="Mindset">Mindset</option>
                <option value="Business">Business</option>
                <option value="SaaS">SaaS</option>
                <option value="Finance">Finance</option>
                <option value="Lifestyle">Lifestyle</option>
              </select>
            </div>
          </div>

          {/* Video / Reel / Loom Link */}
          <div>
            <label className="block opacity-70 mb-1 uppercase flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-blue-500" />
              <span>Video / Reel / Loom Breakdown Link (فيديو تحليلي أو ريل كـ مرجع)</span>
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://loom.com/... or https://instagram.com/reel/..."
              className={`w-full p-2.5 border rounded focus:outline-none ${
                isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
              }`}
            />
          </div>

          {/* Operator Potential Score (Out of 10) */}
          <div className={`p-3.5 border rounded ${
            isDarkMode ? 'bg-[#151413] border-neutral-700' : 'bg-neutral-50 border-neutral-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-xs">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Operator Potential Score / تقييم الفرصة (من 10):</span>
              </label>
              <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${
                score >= 9 
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500' 
                  : score >= 7 
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500' 
                    : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500'
              }`}>
                {score}/10 {score >= 9 ? '🔥 Top Priority Lead' : score >= 7 ? '✓ High Potential' : 'Moderate'}
              </span>
            </div>
            
            <div className="grid grid-cols-10 gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setScore(num)}
                  className={`py-2 rounded font-mono text-xs font-bold border transition-all ${
                    score === num
                      ? num >= 9
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm scale-105'
                        : num >= 7
                          ? 'bg-blue-600 text-white border-blue-700 shadow-sm scale-105'
                          : 'bg-neutral-800 text-white border-neutral-900 shadow-sm scale-105'
                      : isDarkMode
                        ? 'bg-[#1C1B19] border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'
                        : 'bg-white border-neutral-300 text-neutral-600 hover:border-black hover:text-black'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Niche & Lead Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block opacity-70 mb-1 uppercase">Sub-Niche (التخصص الدقيق)</label>
              <input
                type="text"
                value={subNiche}
                onChange={(e) => setSubNiche(e.target.value)}
                placeholder="e.g. Natty Transformation, Ancien Gros / Marathon Athlete"
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
            <div>
              <label className="block opacity-70 mb-1 uppercase">Lead Source / المصدر</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Instagram Explore, Reels, TikTok, 1"
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
          </div>

          {/* Current Bio Flaw */}
          <div>
            <label className="block opacity-70 mb-1 uppercase">Current Bio Flaw / الخلل الحالي في البايو أو الفانل</label>
            <input
              type="text"
              value={bioFlaw}
              onChange={(e) => setBioFlaw(e.target.value)}
              placeholder="e.g. No links, manual 'DM Coaching' only / Raw WhatsApp link (wa.me) in bio"
              className={`w-full p-2.5 border rounded focus:outline-none ${
                isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
              }`}
            />
          </div>

          {/* Loom Opening Hook / Cold DM Hook */}
          <div>
            <label className="block opacity-70 mb-1 uppercase flex items-center justify-between">
              <span>Loom Opening Hook / Cold DM Hook (دخلة الرسالة المخصصة)</span>
              <span className="text-[10px] opacity-60">Ready to copy in 1-click</span>
            </label>
            <textarea
              rows={2}
              value={loomHook}
              onChange={(e) => setLoomHook(e.target.value)}
              placeholder="e.g. Salam Yassir, 7.8M views... / Salam Saad, l'histoire dyalk..."
              className={`w-full p-2.5 border rounded focus:outline-none resize-none ${
                isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
              }`}
            />
          </div>

          {/* Scheduled Outreach Date & Talked Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block opacity-70 mb-1 uppercase flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Schedule Outreach Date (تاريخ مراسلة الكوتش)</span>
              </label>
              <input
                type="date"
                value={scheduledContactDate}
                onChange={(e) => setScheduledContactDate(e.target.value)}
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
            <div>
              <label className="block opacity-70 mb-1 uppercase">Outreach Talk Status (حالة التواصل)</label>
              <select
                value={talkedStatus}
                onChange={(e) => setTalkedStatus(e.target.value as Creator['talkedStatus'])}
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              >
                <option value="Pending">Pending / لم يراسل بعد</option>
                <option value="Sent - No Answer">Sent - Waiting Answer / تم الإرسال بانتظار الرد</option>
                <option value="Answered Today">Answered Today (Yes, I talked) / جاوب اليوم</option>
                <option value="Follow-up Due">Follow-up Due / يحتاج تذكير</option>
                <option value="Call Booked">Call Booked / تم حجز مكالمة</option>
              </select>
            </div>
          </div>

          {/* Status & MRR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block opacity-70 mb-1 uppercase">Pipeline Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CreatorStatus)}
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              >
                <option value="To Contact">To Contact</option>
                <option value="DM Sent">DM Sent</option>
                <option value="Loom Sent">Loom Sent</option>
                <option value="Zoom Booked">Zoom Booked</option>
                <option value="Closed">Closed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block opacity-70 mb-1 uppercase">Est. Monthly MRR (DH)</label>
              <input
                type="number"
                value={estimatedMRR}
                onChange={(e) => setEstimatedMRR(Number(e.target.value))}
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
            <div>
              <label className="block opacity-70 mb-1 uppercase">Actual Closed MRR (DH)</label>
              <input
                type="number"
                value={actualMRR}
                onChange={(e) => setActualMRR(Number(e.target.value))}
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
          </div>

          {/* Notes & Gap Analysis */}
          <div>
            <label className="block opacity-70 mb-1 uppercase">
              Notes / Gap Analysis &amp; Benchmark Reasoning (تحليل الوضع والنموذج):
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 4,000 followers, high engagement. Fits 1-on-1 coaching, cannot scale to Skool community yet..."
              className={`w-full p-2.5 border rounded focus:outline-none resize-none ${
                isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
              }`}
            />
          </div>

          {/* Touchpoints / Outreach History Timeline */}
          <div className="pt-4 border-t border-dashed border-current">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>Outreach Sequence Log (الميساجات والاتصالات):</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddTouchpoint(!showAddTouchpoint)}
                className="px-2.5 py-1 border rounded text-[11px] font-bold uppercase hover:bg-neutral-500/10"
              >
                + Log Message Sent
              </button>
            </div>

            {showAddTouchpoint && (
              <div className={`p-3 border rounded mb-3 space-y-2.5 ${
                isDarkMode ? 'bg-[#141312] border-neutral-700' : 'bg-[#FAF8F5] border-neutral-300'
              }`}>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newTouchType}
                    onChange={(e) => setNewTouchType(e.target.value as Touchpoint['type'])}
                    className="p-1.5 border rounded bg-transparent text-xs"
                  >
                    <option value="Message 1 (Hook)">Message 1 (Hook)</option>
                    <option value="Follow-up 1">Follow-up 1</option>
                    <option value="Follow-up 2">Follow-up 2</option>
                    <option value="Loom Audit">Loom Audit Sent</option>
                    <option value="Zoom Call">Zoom Call Held</option>
                    <option value="Contract Sent">Contract Sent</option>
                    <option value="Custom Note">Custom Note</option>
                  </select>
                  <input
                    type="date"
                    value={newTouchDate}
                    onChange={(e) => setNewTouchDate(e.target.value)}
                    className="p-1.5 border rounded bg-transparent text-xs"
                  />
                </div>
                <input
                  type="text"
                  value={newTouchNote}
                  onChange={(e) => setNewTouchNote(e.target.value)}
                  placeholder="Details: sent value hook regarding Skool vs WhatsApp..."
                  className="w-full p-2 border rounded bg-transparent text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTouchpoint(false)}
                    className="px-2 py-1 text-xs opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddTouchpoint}
                    className="px-3 py-1 text-xs font-bold border rounded bg-black text-white dark:bg-white dark:text-black"
                  >
                    Add to Log
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {touchpoints.length === 0 ? (
                <div className="p-3 border border-dashed text-center opacity-50 rounded">
                  No interactions recorded yet. Click "+ Log Message Sent" to record outreach touchpoints.
                </div>
              ) : (
                touchpoints.map((tp) => (
                  <div key={tp.id} className="p-2.5 border rounded flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-500">{tp.type}</span>
                        <span className="opacity-50 text-[10px]">({tp.date})</span>
                      </div>
                      <p className="opacity-80 mt-0.5">{tp.notes}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteTouchpoint(tp.id)}
                      className="p-1 text-neutral-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dashed border-current">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded opacity-70 hover:opacity-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 font-bold uppercase tracking-wider border rounded flex items-center gap-2 ${
                isDarkMode 
                  ? 'bg-white text-black border-white hover:bg-neutral-200' 
                  : 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes &rarr;</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
