import React from 'react';
import { Creator } from '../types';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  CheckSquare, 
  Flame, 
  Users, 
  FileCode
} from 'lucide-react';
import { exportCreatorsToCSV, printCreatorsDossier, downloadHTMLReport } from '../utils/exportHelpers';

interface HitlistExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  creators: Creator[];
  isDarkMode: boolean;
}

export const HitlistExportModal: React.FC<HitlistExportModalProps> = ({
  isOpen,
  onClose,
  creators,
  isDarkMode,
}) => {
  if (!isOpen || !creators) return null;

  const totalFollowers = creators.reduce((acc, c) => acc + (c.followers || 0), 0);
  const avgScore = creators.length > 0
    ? (creators.reduce((acc, c) => acc + (c.score || 5), 0) / creators.length).toFixed(1)
    : '0';

  const handleDownloadCSV = () => {
    exportCreatorsToCSV(creators);
  };

  const handlePrintPDF = () => {
    printCreatorsDossier(creators);
  };

  const handleDownloadHTML = () => {
    downloadHTMLReport(creators);
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(0) + 'K';
    return count.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-4xl max-h-[90vh] flex flex-col border-2 rounded-lg relative overflow-hidden transition-all shadow-2xl ${
          isDarkMode 
            ? 'bg-[#181716] border-neutral-700 text-neutral-100' 
            : 'bg-[#FAF8F5] border-neutral-900 text-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
        }`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDarkMode ? 'border-neutral-800 bg-[#141312]' : 'border-neutral-900 bg-[#F4F1EA]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded border ${
              isDarkMode ? 'border-amber-500/40 bg-amber-500/10 text-amber-500' : 'border-neutral-900 bg-amber-400 text-black'
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-black text-lg tracking-tight">
                Export Hitlist Dossier ({creators.length} {creators.length === 1 ? 'Record' : 'Records'})
              </h2>
              <p className="font-mono text-xs opacity-65 mt-0.5">
                Export high-converting coach profiles to CSV spreadsheet or print / save as PDF
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded hover:bg-neutral-500/20 opacity-70 hover:opacity-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Stats Strip */}
        <div className={`p-3 px-5 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${
          isDarkMode ? 'border-neutral-800 bg-[#1E1D1B]' : 'border-neutral-300 bg-white'
        }`}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
              <span>Selected: <strong>{creators.length}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span>Total Reach: <strong>{formatFollowers(totalFollowers)}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Avg Fit Score: <strong>{avgScore} / 10</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold rounded border transition-all ${
                isDarkMode 
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-600' 
                  : 'bg-white hover:bg-neutral-100 text-black border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>CSV (.csv)</span>
            </button>

            <button
              onClick={handleDownloadHTML}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold rounded border transition-all ${
                isDarkMode 
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-600' 
                  : 'bg-white hover:bg-neutral-100 text-black border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
              title="Download standalone HTML report that opens in any browser for offline printing"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-500" />
              <span>HTML Dossier (.html)</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold rounded border transition-all ${
                isDarkMode 
                  ? 'bg-amber-500 hover:bg-amber-400 text-black border-amber-400 font-black' 
                  : 'bg-black hover:bg-neutral-800 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Scrollable Preview Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="text-xs font-mono opacity-60 mb-2 uppercase tracking-wider">
            Live Preview of Export Content:
          </div>
          <div className={`border rounded overflow-hidden ${
            isDarkMode ? 'border-neutral-800 bg-[#141312]' : 'border-neutral-300 bg-white'
          }`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-mono uppercase text-[10px] tracking-wider ${
                  isDarkMode ? 'border-neutral-800 bg-[#1A1918] text-neutral-400' : 'border-neutral-300 bg-[#F5F3ED] text-neutral-600'
                }`}>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Coach / Handle</th>
                  <th className="py-2.5 px-2">Score</th>
                  <th className="py-2.5 px-2">Followers</th>
                  <th className="py-2.5 px-2">Stage</th>
                  <th className="py-2.5 px-3">Bio Flaw / Reason</th>
                  <th className="py-2.5 px-3">Loom Hook</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-sans">
                {creators.map((c, i) => (
                  <tr key={c.id} className="hover:bg-neutral-500/5">
                    <td className="py-2.5 px-3 font-mono text-[10px] opacity-60">{i + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold">{c.name}</div>
                      <div className="font-mono text-[11px] text-blue-500 flex items-center gap-1">
                        {c.handle}
                      </div>
                      {c.subNiche && (
                        <div className="font-mono text-[9px] opacity-70 mt-0.5">{c.subNiche}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-2 font-mono">
                      <span className="font-bold text-amber-500">{c.score ?? 5}/10</span>
                    </td>
                    <td className="py-2.5 px-2 font-mono font-bold">
                      {formatFollowers(c.followers)}
                    </td>
                    <td className="py-2.5 px-2 font-mono text-[10px]">
                      <span className="px-1.5 py-0.5 rounded border border-neutral-400/30">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] max-w-[200px] truncate" title={c.bioFlaw || c.notes}>
                      {c.bioFlaw || c.notes || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] max-w-[220px] truncate font-mono opacity-85" title={c.loomHook}>
                      {c.loomHook || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex flex-wrap items-center justify-between gap-3 ${
          isDarkMode ? 'border-neutral-800 bg-[#141312]' : 'border-neutral-900 bg-[#F4F1EA]'
        }`}>
          <div className="text-xs font-mono opacity-60">
            Exported data includes MRR, contact dates, bio flaws, hooks, and notes.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 font-mono text-xs rounded border transition-colors ${
                isDarkMode 
                  ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-300' 
                  : 'border-neutral-400 hover:bg-neutral-200 text-neutral-800'
              }`}
            >
              Close
            </button>

            <button
              onClick={handleDownloadCSV}
              className={`flex items-center gap-1.5 px-4 py-2 font-mono text-xs font-bold rounded border transition-all ${
                isDarkMode 
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-600' 
                  : 'bg-white hover:bg-neutral-100 text-black border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleDownloadHTML}
              className={`flex items-center gap-1.5 px-4 py-2 font-mono text-xs font-bold rounded border transition-all ${
                isDarkMode 
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-600' 
                  : 'bg-white hover:bg-neutral-100 text-black border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-blue-500" />
              <span>Download HTML</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className={`flex items-center gap-1.5 px-5 py-2 font-mono text-xs font-bold rounded border transition-all ${
                isDarkMode 
                  ? 'bg-amber-500 hover:bg-amber-400 text-black border-amber-400 font-black' 
                  : 'bg-black hover:bg-neutral-800 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
