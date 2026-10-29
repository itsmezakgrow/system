import React, { useState } from 'react';
import { DailyLog } from '../types';
import { X, Sparkles } from 'lucide-react';

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (log: Omit<DailyLog, 'id'>) => void;
  isDarkMode: boolean;
}

export const LogActivityModal: React.FC<LogActivityModalProps> = ({
  isOpen,
  onClose,
  onLog,
  isDarkMode,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [dmsSent, setDmsSent] = useState<number>(0);
  const [followUpsSent, setFollowUpsSent] = useState<number>(0);
  const [repliesReceived, setRepliesReceived] = useState<number>(0);
  const [loomsRecorded, setLoomsRecorded] = useState<number>(0);
  const [callsBooked, setCallsBooked] = useState<number>(0);
  const [revenueGenerated, setRevenueGenerated] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLog({
      date,
      dmsSent: Number(dmsSent),
      followUpsSent: Number(followUpsSent),
      repliesReceived: Number(repliesReceived),
      loomsRecorded: Number(loomsRecorded),
      callsBooked: Number(callsBooked),
      revenueGenerated: Number(revenueGenerated),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md border p-6 md:p-8 rounded shadow-2xl transition-all ${
        isDarkMode 
          ? 'bg-[#1C1B19] border-neutral-700 text-white' 
          : 'bg-white border-neutral-900 text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
      }`}>
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-dashed border-current">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              [LOG DAILY ACTION // OUTBOUND]
            </span>
          </div>
          <button onClick={onClose} className="font-mono text-xs opacity-60 hover:opacity-100">
            ✕ CLOSE
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block opacity-70 mb-1 uppercase">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full p-2.5 border rounded focus:outline-none ${
                isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block opacity-70 mb-1 uppercase">DMs Sent</label>
              <input
                type="number"
                min="0"
                value={dmsSent}
                onChange={(e) => setDmsSent(Number(e.target.value))}
                className={`w-full p-2 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
            <div>
              <label className="block opacity-70 mb-1 uppercase">Follow-ups</label>
              <input
                type="number"
                min="0"
                value={followUpsSent}
                onChange={(e) => setFollowUpsSent(Number(e.target.value))}
                className={`w-full p-2 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block opacity-70 mb-1 uppercase">Replies Received</label>
              <input
                type="number"
                min="0"
                value={repliesReceived}
                onChange={(e) => setRepliesReceived(Number(e.target.value))}
                className={`w-full p-2 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
            <div>
              <label className="block opacity-70 mb-1 uppercase">Looms Recorded</label>
              <input
                type="number"
                min="0"
                value={loomsRecorded}
                onChange={(e) => setLoomsRecorded(Number(e.target.value))}
                className={`w-full p-2 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block opacity-70 mb-1 uppercase">Zoom Calls</label>
              <input
                type="number"
                min="0"
                value={callsBooked}
                onChange={(e) => setCallsBooked(Number(e.target.value))}
                className={`w-full p-2 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
            <div>
              <label className="block opacity-70 mb-1 uppercase">Revenue (DH / $)</label>
              <input
                type="number"
                min="0"
                value={revenueGenerated}
                onChange={(e) => setRevenueGenerated(Number(e.target.value))}
                className={`w-full p-2 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
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
              Save Activity &rarr;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
