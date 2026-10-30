import React, { useState } from 'react';
import { Creator, CreatorStatus, NicheCategory, CoachCategory } from '../types';
import { parseSocialHandle, deriveNameFromHandle, parseFollowerInput } from '../utils/urlHelper';
import { X, UserPlus, ExternalLink, Video, Star, Calendar, Flame, Sparkles } from 'lucide-react';

interface AddCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (creator: Omit<Creator, 'id'>) => void;
  isDarkMode: boolean;
}

export const AddCreatorModal: React.FC<AddCreatorModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  isDarkMode,
}) => {
  const [name, setName] = useState('');
  const [isNameManuallyEdited, setIsNameManuallyEdited] = useState(false);
  const [handleInput, setHandleInput] = useState('');
  const [platform, setPlatform] = useState<Creator['platform']>('Instagram');
  const [followersInput, setFollowersInput] = useState('20K');
  const [engagementRate, setEngagementRate] = useState('');
  const [niche, setNiche] = useState<NicheCategory>('Fitness');
  const [coachCategory, setCoachCategory] = useState<CoachCategory>('Prospect');
  const [status, setStatus] = useState<CreatorStatus>('To Contact');
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');
  const [estimatedMRR, setEstimatedMRR] = useState<number>(15000);
  const [videoUrl, setVideoUrl] = useState('');

  // Operator Acquisition Fields
  const [score, setScore] = useState<number>(8);
  const [subNiche, setSubNiche] = useState('');
  const [bioFlaw, setBioFlaw] = useState('');
  const [loomHook, setLoomHook] = useState('');
  const [source, setSource] = useState('Instagram Explore');
  const [scheduledContactDate, setScheduledContactDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  // Auto-parsed handle and direct link
  const parsed = parseSocialHandle(handleInput, platform);
  const derivedCandidate = deriveNameFromHandle(handleInput);
  const computedFollowers = parseFollowerInput(followersInput, true);

  const handleHandleInputChange = (val: string) => {
    setHandleInput(val);
    // If name hasn't been manually typed yet, auto-populate from handle/link!
    if (!isNameManuallyEdited || !name.trim()) {
      const derived = deriveNameFromHandle(val);
      if (derived) {
        setName(derived);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !handleInput.trim()) return;
    
    onAdd({
      name: name.trim(),
      handle: parsed.handle,
      platform,
      profileUrl: parsed.profileUrl,
      videoUrl: videoUrl.trim() || undefined,
      followers: computedFollowers,
      engagementRate: engagementRate.trim() || undefined,
      niche,
      coachCategory,
      status,
      notes: notes.trim(),
      lastContactDate: new Date().toISOString().split('T')[0],
      email: email.trim() || undefined,
      estimatedMRR: Number(estimatedMRR),
      actualMRR: coachCategory === 'Active Client' ? Number(estimatedMRR) : 0,
      touchpoints: [],
      score: Number(score),
      subNiche: subNiche.trim() || undefined,
      bioFlaw: bioFlaw.trim() || undefined,
      loomHook: loomHook.trim() || undefined,
      source: source.trim() || undefined,
      scheduledContactDate: scheduledContactDate || undefined,
      talkedStatus: 'Pending',
    });

    setName('');
    setIsNameManuallyEdited(false);
    setHandleInput('');
    setFollowersInput('20K');
    setNotes('');
    setEmail('');
    setVideoUrl('');
    setSubNiche('');
    setBioFlaw('');
    setLoomHook('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`w-full max-w-xl border p-6 md:p-8 rounded shadow-2xl transition-all my-8 max-h-[90vh] overflow-y-auto ${
        isDarkMode 
          ? 'bg-[#1C1B19] border-neutral-700 text-white' 
          : 'bg-white border-neutral-900 text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
      }`}>
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-dashed border-current">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              [NEW DOSSIER // REGISTER COACH OR BENCHMARK]
            </span>
          </div>
          <button onClick={onClose} className="font-mono text-xs opacity-60 hover:opacity-100">
            ✕ CLOSE
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {/* Classification */}
          <div>
            <label className="block font-bold uppercase tracking-wider mb-1.5 opacity-80">
              Classification / نوع الكوتش في النظام:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Prospect', label: 'Prospect (Outreach)' },
                { id: 'Active Client', label: 'Active Partner (خدّام معاه)' },
                { id: 'Waiting List', label: 'Waiting List (انتظار)' },
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block opacity-70 uppercase">Coach / Creator Name</label>
                {derivedCandidate && derivedCandidate !== name && (
                  <button
                    type="button"
                    onClick={() => {
                      setName(derivedCandidate);
                      setIsNameManuallyEdited(false);
                    }}
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
                onChange={(e) => {
                  setName(e.target.value);
                  setIsNameManuallyEdited(true);
                }}
                placeholder="e.g. Coach Yassine Mouhcine"
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block opacity-70 uppercase">Handle or Instagram Link</label>
                <span className="text-[10px] opacity-60">Paste full link or @handle</span>
              </div>
              <input
                type="text"
                required
                value={handleInput}
                onChange={(e) => handleHandleInputChange(e.target.value)}
                placeholder="https://instagram.com/coach_name or @handle"
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
              {parsed.profileUrl && (
                <span className="text-[10px] text-blue-500 block mt-1 truncate">
                  Auto-Link: {parsed.profileUrl} {parsed.cleanUsername && `(@${parsed.cleanUsername})`}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                placeholder="e.g. 4.5%"
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <div>
              <label className="block opacity-70 mb-1 uppercase">Initial Stage</label>
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
              <label className="block opacity-70 mb-1 uppercase">Est. MRR (DH)</label>
              <input
                type="number"
                value={estimatedMRR}
                onChange={(e) => setEstimatedMRR(Number(e.target.value))}
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
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

          {/* Sub-Niche & Bio Flaw (Crucial Operator Intel) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block opacity-70 mb-1 uppercase">Sub-Niche (التخصص الدقيق)</label>
              <input
                type="text"
                value={subNiche}
                onChange={(e) => setSubNiche(e.target.value)}
                placeholder="e.g. Natty Transformation, Calisthenics, Extreme Fat Loss"
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
              placeholder="e.g. Salam [Name], 7.8M views on your transformation reel... / شفت البايو عندك كتعتمد غير على دي ام..."
              className={`w-full p-2.5 border rounded focus:outline-none resize-none ${
                isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
              }`}
            />
          </div>

          {/* Scheduled Outreach Date */}
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
              <label className="block opacity-70 mb-1 uppercase flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-blue-500" />
                <span>Reel / Case Study Link</span>
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://instagram.com/reel/..."
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block opacity-70 mb-1 uppercase">Notes / Gap Analysis (تحليل الفرصة والتفاصيل):</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Strong engagement. Better for Skool community with recurring subscription..."
              className={`w-full p-2.5 border rounded focus:outline-none resize-none ${
                isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-dashed border-current">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded opacity-70 hover:opacity-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 font-bold uppercase tracking-wider border rounded transition-all ${
                isDarkMode 
                  ? 'bg-white text-black border-white' 
                  : 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              Save Record &rarr;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
