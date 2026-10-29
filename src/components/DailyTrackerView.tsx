import React, { useState } from 'react';
import { DailyLog } from '../types';
import { CalendarCheck, Plus, Trash2, Edit3, Sparkles, AlertCircle } from 'lucide-react';
import { EditDailyLogModal } from './EditDailyLogModal';

interface DailyTrackerViewProps {
  dailyLogs: DailyLog[];
  onAddLog: (log: Omit<DailyLog, 'id'>) => void;
  onUpdateLog: (log: DailyLog) => void;
  onDeleteLog: (id: string) => void;
  isDarkMode: boolean;
  onRequestConfirmDelete: (title: string, onConfirm: () => void) => void;
}

export const DailyTrackerView: React.FC<DailyTrackerViewProps> = ({
  dailyLogs,
  onAddLog,
  onUpdateLog,
  onDeleteLog,
  isDarkMode,
  onRequestConfirmDelete,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [dmsSent, setDmsSent] = useState<number>(0);
  const [followUpsSent, setFollowUpsSent] = useState<number>(0);
  const [repliesReceived, setRepliesReceived] = useState<number>(0);
  const [loomsRecorded, setLoomsRecorded] = useState<number>(0);
  const [callsBooked, setCallsBooked] = useState<number>(0);
  const [revenueGenerated, setRevenueGenerated] = useState<number>(0);
  const [attributedCoachName, setAttributedCoachName] = useState('');

  // Editing state
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLog({
      date,
      dmsSent: Number(dmsSent),
      followUpsSent: Number(followUpsSent),
      repliesReceived: Number(repliesReceived),
      loomsRecorded: Number(loomsRecorded),
      callsBooked: Number(callsBooked),
      revenueGenerated: Number(revenueGenerated),
      attributedCoachName: attributedCoachName.trim() || undefined,
    });

    setDmsSent(0);
    setFollowUpsSent(0);
    setRepliesReceived(0);
    setLoomsRecorded(0);
    setCallsBooked(0);
    setRevenueGenerated(0);
    setAttributedCoachName('');
  };

  const totalDms = dailyLogs.reduce((acc, l) => acc + l.dmsSent, 0);
  const totalReplies = dailyLogs.reduce((acc, l) => acc + l.repliesReceived, 0);
  const totalRevenue = dailyLogs.reduce((acc, l) => acc + l.revenueGenerated, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className={`p-6 border transition-all ${
        isDarkMode 
          ? 'bg-[#1C1B19] border-neutral-700' 
          : 'bg-white border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-blue-500 mb-1">
              <CalendarCheck className="w-4 h-4" />
              <span>// DAILY OUTBOUND ACCOUNTABILITY LEDGER</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              Daily Operator Tracker
            </h2>
            <p className="text-xs opacity-70 font-sans mt-1">
              Input your completed cold outreach, Loom audits, and closed coaching deals at the end of every day. All entries can be edited anytime.
            </p>
          </div>

          <div className="flex items-center gap-4 border p-3 rounded font-mono text-xs border-current">
            <div>
              <span className="opacity-50 text-[10px] block">TOTAL DMS</span>
              <span className="text-base font-bold">{totalDms}</span>
            </div>
            <div className="w-px h-6 bg-current opacity-20" />
            <div>
              <span className="opacity-50 text-[10px] block">REPLIES</span>
              <span className="text-base font-bold text-emerald-500">{totalReplies}</span>
            </div>
            <div className="w-px h-6 bg-current opacity-20" />
            <div>
              <span className="opacity-50 text-[10px] block">REVENUE</span>
              <span className="text-base font-bold text-blue-500">{totalRevenue.toLocaleString()} DH</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Col */}
        <div className={`p-6 border transition-all ${
          isDarkMode 
            ? 'bg-[#1C1B19] border-neutral-700' 
            : 'bg-white border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-dashed border-current opacity-70">
            <span className="font-mono text-xs uppercase tracking-wider">[INPUT FORM]</span>
            <span className="font-mono text-xs">END OF DAY</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block uppercase tracking-wider opacity-70 mb-1">Date</label>
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
                <label className="block uppercase tracking-wider opacity-70 mb-1">DMs Sent</label>
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
                <label className="block uppercase tracking-wider opacity-70 mb-1">Follow-ups</label>
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
                <label className="block uppercase tracking-wider opacity-70 mb-1">Replies Received</label>
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
                <label className="block uppercase tracking-wider opacity-70 mb-1">Looms Recorded</label>
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
                <label className="block uppercase tracking-wider opacity-70 mb-1">Zoom Calls</label>
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
                <label className="block uppercase tracking-wider opacity-70 mb-1">Revenue (DH)</label>
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

            <div>
              <label className="block uppercase tracking-wider opacity-70 mb-1">Attributed Coach Deal (اختياري)</label>
              <input
                type="text"
                value={attributedCoachName}
                onChange={(e) => setAttributedCoachName(e.target.value)}
                placeholder="e.g. Coach Yassine Retainer Deposit"
                className={`w-full p-2 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 font-mono text-xs font-bold uppercase tracking-wider border rounded transition-all mt-4 ${
                isDarkMode 
                  ? 'bg-white text-black border-white hover:bg-neutral-200' 
                  : 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800'
              }`}
            >
              Save Daily Ledger Entry &rarr;
            </button>
          </form>
        </div>

        {/* Ledger Table Col */}
        <div className={`lg:col-span-2 border overflow-hidden transition-all ${
          isDarkMode 
            ? 'bg-[#1C1B19] border-neutral-700' 
            : 'bg-white border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <div className="p-4 border-b border-dashed border-current flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider">Historical Logs</h3>
            <span className="font-mono text-xs opacity-60">{dailyLogs.length} entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className={`border-b font-mono uppercase tracking-wider text-[11px] ${
                  isDarkMode ? 'border-neutral-800 bg-[#141312] text-neutral-400' : 'border-neutral-900 bg-[#F7F5F0] text-neutral-700'
                }`}>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-2">DMs</th>
                  <th className="py-2.5 px-2">Follow-ups</th>
                  <th className="py-2.5 px-2">Replies</th>
                  <th className="py-2.5 px-2">Looms</th>
                  <th className="py-2.5 px-2">Calls</th>
                  <th className="py-2.5 px-3">Revenue</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {dailyLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-1 opacity-60">
                        <AlertCircle className="w-5 h-5 mb-1" />
                        <span>No daily logs yet. Use the form to submit today's numbers.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  dailyLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-500/5 transition-colors">
                      <td className="py-2.5 px-3 font-bold">
                        {log.date}
                        {log.attributedCoachName && (
                          <span className="block text-[10px] opacity-60 font-normal">Deal: {log.attributedCoachName}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2">{log.dmsSent}</td>
                      <td className="py-2.5 px-2">{log.followUpsSent}</td>
                      <td className="py-2.5 px-2 text-emerald-500 font-bold">{log.repliesReceived}</td>
                      <td className="py-2.5 px-2">{log.loomsRecorded}</td>
                      <td className="py-2.5 px-2 text-blue-500 font-bold">{log.callsBooked}</td>
                      <td className="py-2.5 px-3 font-bold">{log.revenueGenerated.toLocaleString()} DH</td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingLog(log)}
                            className="p-1 rounded text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                            title="Edit Log"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRequestConfirmDelete(`Daily Log of ${log.date}`, () => onDeleteLog(log.id))}
                            className="p-1 rounded text-neutral-400 hover:text-red-500 transition-colors"
                            title="Delete Log (Confirmation required)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Log Modal */}
      <EditDailyLogModal
        log={editingLog}
        isOpen={!!editingLog}
        onClose={() => setEditingLog(null)}
        onSave={(updated) => {
          onUpdateLog(updated);
          setEditingLog(null);
        }}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
