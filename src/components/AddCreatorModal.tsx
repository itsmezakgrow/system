import React, { useState } from 'react';
import { Creator, CreatorStatus, NicheCategory, CoachCategory } from '../types';
import { parseSocialHandle } from '../utils/urlHelper';
import { X, UserPlus, ExternalLink, Video } from 'lucide-react';

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
  const [handleInput, setHandleInput] = useState('');
  const [platform, setPlatform] = useState<Creator['platform']>('Instagram');
  const [followers, setFollowers] = useState<number>(10000);
  const [engagementRate, setEngagementRate] = useState('');
  const [niche, setNiche] = useState<NicheCategory>('Fitness');
  const [coachCategory, setCoachCategory] = useState<CoachCategory>('Prospect');
  const [status, setStatus] = useState<CreatorStatus>('To Contact');
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');
  const [estimatedMRR, setEstimatedMRR] = useState<number>(15000);
  const [videoUrl, setVideoUrl] = useState('');

  if (!isOpen) return null;

  // Auto-parsed handle and direct link
  const parsed = parseSocialHandle(handleInput, platform);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !handleInput.trim()) return;
    
    onAdd({
      name: name.trim(),
      handle: parsed.handle,
      platform,
      profileUrl: parsed.profileUrl,
      videoUrl: videoUrl.trim() || undefined,
      followers: Number(followers),
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
    });

    setName('');
    setHandleInput('');
    setNotes('');
    setEmail('');
    setVideoUrl('');
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
              <label className="block opacity-70 mb-1 uppercase">Coach / Creator Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Coach Yassine"
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
            <div>
              <label className="block opacity-70 mb-1 uppercase">Handle or Instagram Link</label>
              <input
                type="text"
                required
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder="coach_handle or full link"
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
              {parsed.profileUrl && (
                <span className="text-[10px] text-blue-500 block mt-1 truncate">
                  Auto-Link: {parsed.profileUrl}
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
              <label className="block opacity-70 mb-1 uppercase">Followers</label>
              <input
                type="number"
                value={followers}
                onChange={(e) => setFollowers(Number(e.target.value))}
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
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

          {/* Video / Reel / Loom link */}
          <div>
            <label className="block opacity-70 mb-1 uppercase flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-blue-500" />
              <span>Video / Reel / Loom Link (رابط فيديو أو ريل كـ دراسة حالة)</span>
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://instagram.com/reel/... or https://loom.com/..."
              className={`w-full p-2.5 border rounded focus:outline-none ${
                isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
              }`}
            />
          </div>

          <div>
            <label className="block opacity-70 mb-1 uppercase">Notes / Gap Analysis (تحليل النموذج والفرصة):</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 4000 followers, strong engagement. Better for 1-on-1 vs Scaling to Skool community..."
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
