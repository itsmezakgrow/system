import React, { useState } from 'react';
import { DailyLog, Creator } from '../types';
import { TrendingUp, DollarSign, Calculator, Award, Zap, ArrowRight } from 'lucide-react';

interface AnalyticsViewProps {
  dailyLogs: DailyLog[];
  creators: Creator[];
  isDarkMode: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  dailyLogs,
  creators,
  isDarkMode,
}) => {
  const totalDMs = dailyLogs.reduce((acc, l) => acc + l.dmsSent, 0);
  const totalReplies = dailyLogs.reduce((acc, l) => acc + l.repliesReceived, 0);
  const totalLooms = dailyLogs.reduce((acc, l) => acc + l.loomsRecorded, 0);
  const totalCalls = dailyLogs.reduce((acc, l) => acc + l.callsBooked, 0);
  const totalRevenue = dailyLogs.reduce((acc, l) => acc + l.revenueGenerated, 0);

  const replyRate = totalDMs > 0 ? ((totalReplies / totalDMs) * 100).toFixed(1) : '0.0';
  const bookingRate = totalLooms > 0 ? ((totalCalls / totalLooms) * 100).toFixed(1) : '0.0';

  // Interactive 50/50 Skool Community Revenue Calculator (From user's landing page screenshot)
  const [memberCount, setMemberCount] = useState<number>(150);
  const [monthlyPriceDH, setMonthlyPriceDH] = useState<number>(350);
  const [revSharePercent, setRevSharePercent] = useState<number>(50);

  const totalMonthlyMRRDH = memberCount * monthlyPriceDH;
  const operatorShareDH = (totalMonthlyMRRDH * (revSharePercent / 100));
  const creatorShareDH = totalMonthlyMRRDH - operatorShareDH;

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
              <TrendingUp className="w-4 h-4" />
              <span>// ATTRIBUTION &amp; GROWTH SIMULATION</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              Analytics &amp; Revenue Projection
            </h2>
            <p className="text-xs opacity-70 font-sans mt-1">
              Detailed breakdown of outbound funnel health, reply velocity, and 50/50 revenue-share projections.
            </p>
          </div>

          <div className="border p-3 rounded font-mono text-xs border-current">
            <span className="opacity-50 text-[10px] block uppercase">Closed Retainers Revenue</span>
            <span className="text-lg font-bold font-mono text-emerald-500">
              {totalRevenue > 0 ? `${totalRevenue.toLocaleString()} DH` : '0 DH'}
            </span>
          </div>
        </div>
      </div>

      {/* Outbound Funnel Metric Ledger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 border ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <span className="font-mono text-[10px] uppercase tracking-wider opacity-60 block mb-1">1. DMs Sent</span>
          <span className="font-serif text-3xl font-bold font-mono">{totalDMs}</span>
          <span className="font-mono text-[11px] opacity-75 block mt-2">100% Top of Funnel</span>
        </div>

        <div className={`p-4 border ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <span className="font-mono text-[10px] uppercase tracking-wider opacity-60 block mb-1">2. Inbound Replies</span>
          <span className="font-serif text-3xl font-bold font-mono text-blue-500">{totalReplies}</span>
          <span className="font-mono text-[11px] text-blue-500 block mt-2">{replyRate}% Reply Rate</span>
        </div>

        <div className={`p-4 border ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <span className="font-mono text-[10px] uppercase tracking-wider opacity-60 block mb-1">3. Loom Audits</span>
          <span className="font-serif text-3xl font-bold font-mono text-amber-500">{totalLooms}</span>
          <span className="font-mono text-[11px] opacity-75 block mt-2">Personalized pitches</span>
        </div>

        <div className={`p-4 border ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <span className="font-mono text-[10px] uppercase tracking-wider opacity-60 block mb-1">4. Discovery Calls</span>
          <span className="font-serif text-3xl font-bold font-mono text-emerald-500">{totalCalls}</span>
          <span className="font-mono text-[11px] text-emerald-500 block mt-2">{bookingRate}% Booking Rate</span>
        </div>
      </div>

      {/* Skool Community 50/50 Revenue Calculator (Directly from User's Landing Page) */}
      <div className={`p-6 md:p-8 border transition-all ${
        isDarkMode 
          ? 'bg-[#1C1B19] border-neutral-700' 
          : 'bg-white border-neutral-900 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]'
      }`}>
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-dashed border-current opacity-70">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-500" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              حاسبة مقارنة وتطوير المدخول الشهري (50/50 REVENUE SHARE)
            </span>
          </div>
          <span className="font-mono text-xs">MODEL: SKOOL RECURRING</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Controls */}
          <div className="space-y-4 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="opacity-70">عدد المشتركين (Paid Community Members):</span>
                <span className="font-bold text-sm">{memberCount} members</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="5"
                value={memberCount}
                onChange={(e) => setMemberCount(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="opacity-70">ثمن الاشتراك الشهري (Monthly Price):</span>
                <span className="font-bold text-sm">{monthlyPriceDH} DH / Month</span>
              </div>
              <input
                type="range"
                min="100"
                max="1500"
                step="50"
                value={monthlyPriceDH}
                onChange={(e) => setMonthlyPriceDH(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="opacity-70">نسبة الـ Growth Operator (Rev-Share):</span>
                <span className="font-bold text-sm">{revSharePercent}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="70"
                step="5"
                value={revSharePercent}
                onChange={(e) => setRevSharePercent(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Result Card styled like the landing page */}
          <div className={`p-6 border rounded ${
            isDarkMode ? 'bg-[#141312] border-neutral-700' : 'bg-[#FAF8F5] border-neutral-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
          }`}>
            <span className="font-mono text-[11px] opacity-60 uppercase tracking-widest block mb-2">
              Total Community Monthly MRR
            </span>
            <div className="font-serif text-3xl md:text-4xl font-bold font-mono text-blue-500 mb-4">
              {totalMonthlyMRRDH.toLocaleString()} DH / Month
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-dashed border-current text-xs font-mono">
              <div className="p-3 border rounded border-emerald-500/40 bg-emerald-500/5">
                <span className="opacity-60 block text-[10px]">Your Agency Share ({revSharePercent}%):</span>
                <span className="text-base font-bold text-emerald-500">+{operatorShareDH.toLocaleString()} DH</span>
              </div>
              <div className="p-3 border rounded border-neutral-400">
                <span className="opacity-60 block text-[10px]">Creator / Coach Share:</span>
                <span className="text-base font-bold">+{creatorShareDH.toLocaleString()} DH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
