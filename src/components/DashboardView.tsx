import React, { useState } from 'react';
import { Creator, DailyLog } from '../types';
import { 
  Send, 
  MessageSquareReply, 
  PhoneCall, 
  Users, 
  ArrowUpRight, 
  Sparkles, 
  Plus, 
  ExternalLink,
  Target,
  Flame,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Lock,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Award,
  Compass
} from 'lucide-react';

interface DashboardViewProps {
  creators: Creator[];
  dailyLogs: DailyLog[];
  onNavigateTab: (tab: any) => void;
  onOpenAddCreator: () => void;
  onOpenLogActivity: () => void;
  onOpenVaultDrawer?: (creator: Creator) => void;
  isDarkMode: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  creators,
  dailyLogs,
  onNavigateTab,
  onOpenAddCreator,
  onOpenLogActivity,
  onOpenVaultDrawer,
  isDarkMode,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Calculate top metrics from daily logs
  const totalDMsToday = dailyLogs.length > 0 ? dailyLogs[0].dmsSent : 0;
  const totalDMsWeek = dailyLogs.reduce((acc, l) => acc + l.dmsSent, 0);
  const totalRepliesWeek = dailyLogs.reduce((acc, l) => acc + l.repliesReceived, 0);
  const replyRate = totalDMsWeek > 0 ? ((totalRepliesWeek / totalDMsWeek) * 100).toFixed(1) : '0.0';
  const totalCallsBooked = dailyLogs.reduce((acc, l) => acc + l.callsBooked, 0);

  // Active Partners (Closed deals or Active Client category or coaches with community subscribers)
  const activePartners = creators.filter((c) => 
    !c.isArchived && (
      c.status === 'Closed' || 
      c.coachCategory === 'Active Client' || 
      (c.vault?.communitySubscribers && c.vault.communitySubscribers > 0)
    )
  );

  // Aggregate Community Results across all active brands
  const totalSubscribers = activePartners.reduce((acc, c) => acc + (c.vault?.communitySubscribers || 0), 0);
  
  const totalGrossMRR = activePartners.reduce((acc, c) => {
    const subs = c.vault?.communitySubscribers || 0;
    const price = c.vault?.monthlyPricePerSub || 0;
    return acc + (subs * price);
  }, 0);

  const totalZakShareMRR = activePartners.reduce((acc, c) => {
    const subs = c.vault?.communitySubscribers || 0;
    const price = c.vault?.monthlyPricePerSub || 0;
    const revShare = c.vault?.revenueSharePercent ?? 50;
    const gross = subs * price;
    if (gross > 0) {
      return acc + Math.round(gross * (revShare / 100));
    }
    return acc + (c.actualMRR || c.estimatedMRR || 0);
  }, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Top 4 KPI Widgets (Paper Style Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card 1: Total DMs */}
        <div className={`p-5 md:p-6 border transition-all ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-current opacity-60">
            <span className="font-mono text-xs uppercase tracking-wider">Total DMs Sent</span>
            <Send className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl md:text-4xl font-bold font-mono">{totalDMsWeek}</span>
            <span className="text-xs font-mono opacity-60">dms</span>
          </div>
          <p className="text-xs font-mono opacity-70 mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            Today: <strong>{totalDMsToday}</strong> sent
          </p>
        </div>

        {/* Card 2: Reply Rate */}
        <div className={`p-5 md:p-6 border transition-all ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-current opacity-60">
            <span className="font-mono text-xs uppercase tracking-wider">Reply Rate (%)</span>
            <MessageSquareReply className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl md:text-4xl font-bold font-mono text-blue-500">{replyRate}%</span>
          </div>
          <p className="text-xs font-mono opacity-70 mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            Replies: <strong>{totalRepliesWeek}</strong> received
          </p>
        </div>

        {/* Card 3: Calls Booked */}
        <div className={`p-5 md:p-6 border transition-all ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-current opacity-60">
            <span className="font-mono text-xs uppercase tracking-wider">Calls Booked</span>
            <PhoneCall className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl md:text-4xl font-bold font-mono text-emerald-500">{totalCallsBooked}</span>
            <span className="text-xs font-mono opacity-60">calls</span>
          </div>
          <p className="text-xs font-mono opacity-70 mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            Target: <strong>5 calls/wk</strong>
          </p>
        </div>

        {/* Card 4: Active Retainer MRR & Zak's 50/50 Share */}
        <div className={`p-5 md:p-6 border transition-all ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-current opacity-60">
            <span className="font-mono text-xs uppercase tracking-wider">Zak's Growth MRR (50%)</span>
            <Users className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl md:text-3xl font-bold font-mono text-amber-500">
              {totalZakShareMRR > 0 ? `${totalZakShareMRR.toLocaleString()} DH` : '0 DH'}
            </span>
          </div>
          <p className="text-[11px] font-mono opacity-70 mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <strong>{activePartners.length}</strong> partners &bull; <strong>{totalSubscribers}</strong> active members
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: ACTIVE PARTNER BRANDS & LIVE RESULTS (NEW CORE EXECUTIVE LEDGER) */}
      {/* ========================================================================= */}
      <div className={`p-6 md:p-8 border-2 transition-all ${
        isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b-2 border-neutral-900 dark:border-neutral-700 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-xs uppercase tracking-wider font-bold">
                [EXECUTIVE LEDGER // ACTIVE CLIENT BRANDS &amp; COMMUNITY RESULTS]
              </span>
            </div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold tracking-tight mt-1">
              Active Partners &amp; Brand Performance
            </h3>
            <p className="text-xs opacity-75 font-sans mt-0.5">
              الكوتشز اللي خدام معاهم حالياً: البراندات، التوجه، أرقام السبسكرايبرز، وحساب الأرباح بنسبة 50/50.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('pipeline')}
              className={`px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider border rounded transition-all ${
                isDarkMode 
                  ? 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-white' 
                  : 'border-neutral-900 bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              Open Pipeline &rarr;
            </button>
          </div>
        </div>

        {activePartners.length === 0 ? (
          <div className={`p-8 md:p-12 border-2 border-dashed rounded text-center flex flex-col items-center justify-center ${
            isDarkMode ? 'border-neutral-800 bg-[#141312]' : 'border-neutral-300 bg-[#FAF8F5]'
          }`}>
            <Award className="w-10 h-10 opacity-30 text-amber-500 mb-3" />
            <h4 className="font-serif text-lg font-bold mb-1">
              No Active Partner Brands Configured Yet
            </h4>
            <p className="text-xs opacity-70 max-w-md mb-4 leading-relaxed font-sans">
              باش تبان ليك النتائج هنا، قيد الكوتش اللي خدام معاه دابا فـ Hitlist Pipeline وبدّل حالتو لـ <strong>"Closed"</strong> أو <strong>"Active Client"</strong>، ودخل معلومات البراند والسبسكرايبرز فـ <strong>Client Vault</strong>.
            </p>
            <button
              onClick={() => onNavigateTab('pipeline')}
              className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider border-2 rounded ${
                isDarkMode 
                  ? 'bg-amber-500 text-black border-amber-400' 
                  : 'bg-neutral-900 text-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              + Add Partner in Pipeline &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activePartners.map((partner) => {
              const subs = partner.vault?.communitySubscribers || 0;
              const price = partner.vault?.monthlyPricePerSub || 0;
              const curr = partner.vault?.currency || 'DH';
              const revShare = partner.vault?.revenueSharePercent ?? 50;
              const gross = subs * price;
              const zakShare = Math.round(gross * (revShare / 100));

              return (
                <div 
                  key={partner.id}
                  className={`p-5 border-2 rounded flex flex-col justify-between transition-all ${
                    isDarkMode 
                      ? 'bg-[#141312] border-neutral-700 hover:border-neutral-500' 
                      : 'bg-[#FFFDF9] border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {/* Top: Brand & Coach Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Active Client &bull; {revShare}% Split
                        </span>
                        <h4 className="font-serif text-lg font-bold mt-1.5 leading-snug">
                          {partner.vault?.brandName || `${partner.name} Coaching`}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono mt-0.5">
                          <span className="font-bold">{partner.name}</span>
                          <span className="opacity-40">&bull;</span>
                          <a 
                            href={partner.profileUrl || `https://instagram.com/${partner.handle.replace('@', '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:underline flex items-center gap-0.5"
                          >
                            <span>{partner.handle}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                          {partner.vault?.coachPhone && (
                            <>
                              <span className="opacity-40">&bull;</span>
                              <a
                                href={`https://wa.me/${partner.vault.coachPhone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 hover:underline flex items-center gap-1 font-bold"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Brand Avatar */}
                      <div className="w-10 h-10 rounded border-2 border-neutral-900 bg-amber-400 text-black font-serif text-base font-bold flex items-center justify-center shrink-0">
                        {partner.name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* Brand Angle / Positioning (التوجه ديال البراند) */}
                    <div className={`p-2.5 rounded border text-xs font-sans mt-3 ${
                      isDarkMode ? 'border-neutral-800 bg-[#1C1B19] text-neutral-300' : 'border-neutral-200 bg-[#FAF8F5] text-neutral-800'
                    }`}>
                      <div className="flex items-center gap-1 font-mono text-[10px] uppercase font-bold opacity-60 mb-1">
                        <Compass className="w-3 h-3 text-blue-500" />
                        <span>Brand Angle &amp; Positioning (التوجه):</span>
                      </div>
                      <p className="line-clamp-2 leading-relaxed">
                        {partner.vault?.brandAngle || partner.notes || 'No specific niche positioning recorded. Open Vault to set brand angle.'}
                      </p>
                    </div>

                    {/* Live Results Display (20 subscribers, etc.) */}
                    <div className={`mt-3 p-3 rounded border-2 ${
                      isDarkMode ? 'bg-[#181716] border-neutral-800' : 'bg-white border-neutral-900'
                    }`}>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center divide-x divide-neutral-200 dark:divide-neutral-800">
                        <div className="px-1">
                          <span className="text-[9px] font-mono uppercase opacity-60 block">Subscribers</span>
                          <span className="font-mono text-base font-bold text-amber-500">
                            {subs} members
                          </span>
                        </div>
                        <div className="px-1">
                          <span className="text-[9px] font-mono uppercase opacity-60 block">Price / Sub</span>
                          <span className="font-mono text-base font-bold">
                            {price > 0 ? `${price} ${curr}` : '—'}
                          </span>
                        </div>
                        <div className="px-1">
                          <span className="text-[9px] font-mono uppercase opacity-60 block">Gross MRR</span>
                          <span className="font-mono text-base font-bold text-blue-500">
                            {gross > 0 ? `${gross.toLocaleString()} ${curr}` : '0 DH'}
                          </span>
                        </div>
                        <div className="px-1">
                          <span className="text-[9px] font-mono uppercase opacity-60 block">Zak's 50% Share</span>
                          <span className="font-mono text-base font-bold text-emerald-500">
                            {zakShare > 0 ? `${zakShare.toLocaleString()} ${curr}` : '0 DH'}
                          </span>
                        </div>
                      </div>

                      {partner.vault?.resultsMilestones && (
                        <div className="mt-2 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-800 text-[11px] font-sans opacity-80 flex items-start gap-1">
                          <Award className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{partner.vault.resultsMilestones}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Actions: RIB & Vault */}
                  <div className="pt-3 mt-4 border-t border-dashed border-neutral-300 dark:border-neutral-800 flex items-center justify-between gap-2">
                    {/* CIH RIB Copy */}
                    {partner.vault?.cihBankRib ? (
                      <button
                        type="button"
                        onClick={() => handleCopy(partner.vault!.cihBankRib!, `rib_${partner.id}`)}
                        className={`px-2.5 py-1.5 border rounded font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                          copiedKey === `rib_${partner.id}`
                            ? 'bg-emerald-500 text-white border-neutral-900'
                            : isDarkMode
                            ? 'border-amber-500/60 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                            : 'border-neutral-900 bg-amber-300 hover:bg-amber-200 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                        title="Copy CIH Bank RIB for instant DM transfer"
                      >
                        {copiedKey === `rib_${partner.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === `rib_${partner.id}` ? 'RIB COPIED!' : 'COPY CIH RIB'}</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono opacity-50">No RIB registered</span>
                    )}

                    {/* Open Vault Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenVaultDrawer) {
                          onOpenVaultDrawer(partner);
                        } else {
                          onNavigateTab('pipeline');
                        }
                      }}
                      className={`px-3 py-1.5 border-2 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                        isDarkMode
                          ? 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-white'
                          : 'border-neutral-900 bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Open Vault &amp; Edit Results</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid: Outreach Volume Chart vs Recent Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Chart / Activity Tracker Visual */}
        <div className={`lg:col-span-2 p-6 md:p-8 border flex flex-col justify-between transition-all ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-dashed border-current opacity-70">
              <span className="font-mono text-xs uppercase tracking-wider">[CASE: OUTREACH VOLUME // 30-DAY LOG]</span>
              <span className="font-mono text-xs">DAILY ACTIONS</span>
            </div>
            <h3 className="font-serif text-2xl font-bold tracking-tight mb-1">
              Outreach Volume vs. Replies
            </h3>
            <p className="text-xs opacity-70 font-sans">
              Visual ledger of cold outreach DMs against inbound response rate.
            </p>
          </div>

          {dailyLogs.length === 0 ? (
            <div className={`my-8 p-10 border border-dashed text-center rounded flex flex-col items-center justify-center ${
              isDarkMode ? 'border-neutral-700 bg-neutral-900/30' : 'border-neutral-300 bg-neutral-50'
            }`}>
              <AlertCircle className="w-8 h-8 opacity-40 mb-3" />
              <h4 className="font-serif text-lg font-bold mb-1">No Activity Logged Yet</h4>
              <p className="text-xs opacity-70 max-w-sm mb-4 font-sans">
                Your daily log is currently at zero. Record your first outreach session (DMs, Looms, and calls) to generate performance graphs.
              </p>
              <button
                onClick={onOpenLogActivity}
                className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider border rounded ${
                  isDarkMode 
                    ? 'bg-white text-black border-white' 
                    : 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                Log Today's Outreach &rarr;
              </button>
            </div>
          ) : (
            <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 my-4 border-b border-dashed border-current">
              {dailyLogs.slice().reverse().map((log, index) => {
                const maxDm = 60;
                const dmHeight = Math.max(8, Math.min(100, (log.dmsSent / maxDm) * 100));
                const replyHeight = Math.max(4, Math.min(100, (log.repliesReceived / 20) * 100));

                return (
                  <div key={log.id || index} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 h-40">
                      <div 
                        className="w-1/2 bg-blue-600 transition-all rounded-t-sm" 
                        style={{ height: `${dmHeight}%` }} 
                        title={`DMs: ${log.dmsSent}`}
                      />
                      <div 
                        className="w-1/2 bg-emerald-500 transition-all rounded-t-sm" 
                        style={{ height: `${replyHeight}%` }} 
                        title={`Replies: ${log.repliesReceived}`}
                      />
                    </div>
                    <span className="font-mono text-[10px] opacity-60">{log.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 text-xs font-mono opacity-70">
            <span>Formula: High Volume &times; Custom Looms = Closed Communities</span>
            <button onClick={() => onNavigateTab('tracker')} className="underline hover:opacity-100 font-bold">
              Open Daily Tracker &rarr;
            </button>
          </div>
        </div>

        {/* Right 1 Col: Creator Pipeline Status */}
        <div className={`p-6 md:p-8 border flex flex-col justify-between transition-all ${
          isDarkMode ? 'bg-[#1C1B19] border-neutral-700' : 'bg-white border-neutral-900 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-dashed border-current opacity-70">
              <span className="font-mono text-xs uppercase tracking-wider">[HITLIST // STATUS]</span>
              <span className="font-mono text-xs font-bold">{creators.length} TOTAL</span>
            </div>
            <h3 className="font-serif text-2xl font-bold tracking-tight mb-1">
              Active Pipeline
            </h3>
            <p className="text-xs opacity-70 font-sans">
              Monetization candidates and deals in motion.
            </p>
          </div>

          {creators.length === 0 ? (
            <div className={`my-6 p-8 border border-dashed text-center rounded flex flex-col items-center justify-center ${
              isDarkMode ? 'border-neutral-700 bg-neutral-900/30' : 'border-neutral-300 bg-neutral-50'
            }`}>
              <Target className="w-8 h-8 opacity-40 mb-3" />
              <h4 className="font-serif text-base font-bold mb-1">Pipeline is Empty</h4>
              <p className="text-xs opacity-70 max-w-xs mb-4 font-sans">
                Add content coaches from Instagram, TikTok, or YouTube to start prospecting.
              </p>
              <button
                onClick={onOpenAddCreator}
                className={`px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider border rounded ${
                  isDarkMode 
                    ? 'bg-white text-black border-white' 
                    : 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                + Add Creator &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-3 my-4 divide-y divide-neutral-200 dark:divide-neutral-800">
              {creators.slice(0, 5).map((c) => (
                <div key={c.id} className="pt-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold block">{c.name}</span>
                    <span className="font-mono opacity-60 text-[11px]">{c.handle}</span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 border border-current rounded">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-dashed border-current">
            <button
              onClick={() => onNavigateTab('pipeline')}
              className="w-full py-2 font-mono text-xs font-bold uppercase tracking-wider text-center block underline hover:opacity-80"
            >
              View Full Creator Hitlist &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
