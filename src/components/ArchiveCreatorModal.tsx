import React, { useState } from 'react';
import { Creator } from '../types';
import { Archive, X, AlertCircle, Users } from 'lucide-react';

interface ArchiveCreatorModalProps {
  creator?: Creator | null;
  creators?: Creator[];
  isOpen: boolean;
  onClose: () => void;
  onArchive: (creatorId: string, reason: string) => void;
  onBulkArchive?: (creatorIds: string[], reason: string) => void;
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
  creators = [],
  isOpen,
  onClose,
  onArchive,
  onBulkArchive,
  isDarkMode,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESET_ARCHIVE_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [additionalFeedback, setAdditionalFeedback] = useState('');

  // Determine list of targets: either multiple creators or single creator
  const targets = creators.length > 0 ? creators : (creator ? [creator] : []);

  if (!isOpen || targets.length === 0) return null;

  const isMultiple = targets.length > 1;
  const isCustom = selectedPreset.startsWith('Custom');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCustom && !customReason.trim()) {
      return;
    }

    const finalReason = isCustom
      ? customReason.trim()
      : additionalFeedback.trim()
        ? `${selectedPreset} — Note: ${additionalFeedback.trim()}`
        : selectedPreset;

    if (isMultiple && onBulkArchive) {
      onBulkArchive(targets.map(c => c.id), finalReason);
    } else {
      targets.forEach(c => onArchive(c.id, finalReason));
    }

    onClose();
    setCustomReason('');
    setAdditionalFeedback('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-lg border-2 p-6 rounded-lg relative transition-all max-h-[90vh] overflow-y-auto ${
          isDarkMode 
            ? 'bg-[#1C1B19] border-neutral-700 text-[#F4F2ED] shadow-2xl' 
            : 'bg-[#FAF8F5] border-neutral-900 text-[#111111] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-dashed border-current opacity-70">
          <span className="font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Archive className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {isMultiple 
                ? `BULK ARCHIVE DOSSIERS (${targets.length} SELECTED) // نقل الكل إلى الأرشيف` 
                : 'ARCHIVE DOSSIER // نقل إلى الأرشيف'}
            </span>
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
            {isMultiple ? (
              <span>Archive {targets.length} Selected Leads</span>
            ) : (
              <span>Archive Lead: <span className="underline">{targets[0].name}</span></span>
            )}
          </h3>
          <p className="text-xs font-sans opacity-75 mt-1">
            {isMultiple ? (
              <span>Move all {targets.length} coaches out of the active outreach hitlist into the archive ledger with this motive.</span>
            ) : (
              <span>Move this coach out of the active outreach pipeline into the archive ledger while preserving their contact history and notes.</span>
            )}
          </p>

          {/* If multiple, display chips of selected profiles */}
          {isMultiple && (
            <div className="mt-3 p-2.5 rounded border border-amber-500/30 bg-amber-500/5 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {targets.map(c => (
                <span 
                  key={c.id}
                  className="font-mono text-[10px] px-2 py-0.5 rounded border border-neutral-400/40 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                >
                  {c.name} ({c.handle})
                </span>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preset Reasons */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider opacity-70 mb-2">
              Primary Archive Reason / الموتيف
            </label>
            <div className="space-y-1.5">
              {PRESET_ARCHIVE_REASONS.map((reason) => {
                const isThisCustom = reason.startsWith('Custom');
                const isSelected = selectedPreset === reason;

                return (
                  <div
                    key={reason}
                    className={`rounded border text-xs transition-all ${
                      isSelected
                        ? isDarkMode 
                          ? 'border-amber-500/80 bg-amber-500/10 text-white font-medium shadow-sm' 
                          : 'border-black bg-neutral-100 text-black font-medium shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                        : isDarkMode 
                          ? 'border-neutral-800 hover:border-neutral-700 opacity-70' 
                          : 'border-neutral-300 hover:border-neutral-400 opacity-80'
                    }`}
                  >
                    <label className="flex items-start gap-2.5 p-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="archive_preset"
                        value={reason}
                        checked={isSelected}
                        onChange={() => setSelectedPreset(reason)}
                        className="mt-0.5 accent-amber-500"
                      />
                      <span className="leading-tight flex-1">{reason}</span>
                    </label>

                    {/* Dedicated Custom Reason Text Area when Custom reason is chosen */}
                    {isThisCustom && isSelected && (
                      <div className="px-3 pb-3 pt-1 border-t border-amber-500/20 animate-in fade-in duration-150">
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-amber-500 mb-1.5 flex items-center justify-between">
                          <span>Write Your Reason / اكتب سببك المخصص هنا:</span>
                          <span className="text-[10px] text-red-500 font-bold">* مطلوب (Required)</span>
                        </label>
                        <textarea
                          rows={3}
                          autoFocus
                          required
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          placeholder="e.g. He is stopping 1-on-1 coaching, or: wants a 90% revenue share, or: strictly French content only..."
                          className={`w-full p-2.5 text-xs font-sans border rounded focus:outline-none transition-colors ${
                            isDarkMode 
                              ? 'bg-[#141312] border-amber-500/60 focus:border-amber-400 text-white placeholder-neutral-500' 
                              : 'bg-white border-amber-600 focus:border-black text-black placeholder-neutral-400'
                          }`}
                        />
                        {!customReason.trim() && (
                          <p className="text-[10px] font-mono text-amber-500/90 mt-1">
                            ℹ️ اكتب السبب المخصص لتفعيل زر الأرشفة
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Custom Note for Preset Reasons */}
          {!isCustom && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-70 mb-1">
                Additional Feedback / ملاحظة إضافية (اختياري)
              </label>
              <textarea
                rows={2}
                value={additionalFeedback}
                onChange={(e) => setAdditionalFeedback(e.target.value)}
                placeholder="e.g. He was very rude when I pitched him, or: wants to stick strictly with 1-on-1 until next summer..."
                className={`w-full p-2.5 text-xs font-sans border rounded focus:outline-none transition-colors ${
                  isDarkMode 
                    ? 'bg-[#141312] border-neutral-700 focus:border-amber-500 text-white' 
                    : 'bg-white border-neutral-400 focus:border-black text-black'
                }`}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-dashed border-current">
            <div>
              {isCustom && !customReason.trim() && (
                <span className="text-[11px] font-mono text-amber-500 font-medium">
                  ⚠️ Type custom reason above
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
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
                disabled={isCustom && !customReason.trim()}
                className={`px-5 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-all ${
                  isCustom && !customReason.trim()
                    ? 'opacity-40 cursor-not-allowed bg-neutral-600 text-white border-transparent'
                    : isDarkMode
                      ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500 shadow-md'
                      : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>
                  {isMultiple ? `Archive ${targets.length} Dossiers` : 'Archive Dossier'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
