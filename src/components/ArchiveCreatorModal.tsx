import React, { useState } from 'react';
import { Creator } from '../types';
import { Archive, X, AlertCircle } from 'lucide-react';

interface ArchiveCreatorModalProps {
  creator: Creator | null;
  isOpen: boolean;
  onClose: () => void;
  onArchive: (creatorId: string, reason: string) => void;
  isDarkMode: boolean;
}

export const PRESET_ARCHIVE_REASONS = [
  'Not for now / Bad timing (ماشي دابا، التوقيت غير مناسب)',
  'Talked with him - Uncooperative / Bad attitude (هضرت معاه - صعيب في التعامل)',
  'Audience not scalable / Low ticket (الجمهور قليل وما يسكيليش للكوميونيتي)',
  'Already signed with another growth partner (ديجا مرتبط مع أجينسي أخرى)',
  'Ghosted / No reply after 3 follow-up messages (ما كايجاوبش بعد المتابعة)',
  'Wrong target niche / Poor content engagement (النيتش غير ملائم أو التفاعل ضعيف)',
  'Custom reason (سبب مخصص...)'
];

export const ArchiveCreatorModal: React.FC<ArchiveCreatorModalProps> = ({
  creator,
  isOpen,
  onClose,
  onArchive,
  isDarkMode,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESET_ARCHIVE_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  if (!isOpen || !creator) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedPreset.startsWith('Custom')
      ? customReason.trim() || 'Custom motive specified by operator'
      : customReason.trim()
        ? `${selectedPreset} — Note: ${customReason.trim()}`
        : selectedPreset;

    onArchive(creator.id, finalReason);
    onClose();
    setCustomReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-lg border-2 p-6 rounded-lg relative transition-all ${
          isDarkMode 
            ? 'bg-[#1C1B19] border-neutral-700 text-[#F4F2ED] shadow-2xl' 
            : 'bg-[#FAF8F5] border-neutral-900 text-[#111111] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-dashed border-current opacity-70">
          <span className="font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Archive className="w-3.5 h-3.5 text-amber-500" />
            <span>ARCHIVE DOSSIER // نقل إلى الأرشيف</span>
          </span>
          <button 
            onClick={onClose} 
            className="p-1 hover:opacity-100 opacity-60 transition-opacity"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-serif text-xl font-bold">
            Archive Lead: <span className="underline">{creator.name}</span>
          </h3>
          <p className="text-xs font-sans opacity-75 mt-1">
            Move this coach out of the active outreach pipeline into the archive ledger while preserving their contact history and notes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preset Reasons */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider opacity-70 mb-2">
              Primary Archive Reason / الموتيف
            </label>
            <div className="space-y-1.5">
              {PRESET_ARCHIVE_REASONS.map((reason) => (
                <label 
                  key={reason}
                  className={`flex items-start gap-2.5 p-2 rounded border text-xs cursor-pointer transition-colors ${
                    selectedPreset === reason
                      ? isDarkMode 
                        ? 'border-amber-500/80 bg-amber-500/10 text-white font-medium' 
                        : 'border-black bg-neutral-100 text-black font-medium shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                      : isDarkMode 
                        ? 'border-neutral-800 hover:border-neutral-700 opacity-70' 
                        : 'border-neutral-300 hover:border-neutral-400 opacity-80'
                  }`}
                >
                  <input
                    type="radio"
                    name="archive_preset"
                    value={reason}
                    checked={selectedPreset === reason}
                    onChange={() => setSelectedPreset(reason)}
                    className="mt-0.5 accent-amber-500"
                  />
                  <span className="leading-tight">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Detailed Custom Note */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider opacity-70 mb-1">
              Additional Feedback / ملاحظة إضافية (اختياري)
            </label>
            <textarea
              rows={3}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="e.g. He was very rude when I pitched him, or: wants to stick strictly with 1-on-1 until next summer..."
              className={`w-full p-2.5 text-xs font-sans border rounded focus:outline-none transition-colors ${
                isDarkMode 
                  ? 'bg-[#141312] border-neutral-700 focus:border-amber-500 text-white' 
                  : 'bg-white border-neutral-400 focus:border-black text-black'
              }`}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-dashed border-current">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
                isDarkMode 
                  ? 'bg-neutral-800 border-neutral-700 hover:border-neutral-500 text-neutral-300' 
                  : 'bg-white border-neutral-400 hover:border-neutral-900 text-neutral-800'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-all ${
                isDarkMode
                  ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500 shadow-md'
                  : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive Dossier</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
