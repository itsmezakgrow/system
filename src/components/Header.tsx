import React, { useState } from 'react';
import { Search, Plus, Bell, Sparkles, Sun, Moon, CheckCircle2, ShieldCheck, LogOut } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenAddCreator: () => void;
  onOpenLogActivity: () => void;
  activeTabTitle: string;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onSignOut: () => void;
  userEmail: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenAddCreator,
  onOpenLogActivity,
  activeTabTitle,
  isDarkMode,
  onToggleTheme,
  onSignOut,
  userEmail,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Clean Workspace Loaded', desc: 'All metrics and database initialized to zero.', time: 'Just now' },
    { id: 2, title: 'Whitelist Enforcement', desc: `Protected session active for ${userEmail}.`, time: 'Active' },
  ];

  return (
    <header className={`h-16 border-b px-4 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-20 transition-colors ${
      isDarkMode ? 'bg-[#181716] border-neutral-800 text-[#F4F2ED]' : 'bg-[#FAF8F5] border-neutral-300 text-[#111111]'
    }`}>
      {/* Left: Section Title with Paper Dossier badge */}
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-lg md:text-xl font-bold tracking-tight">
          {activeTabTitle}
        </h1>
        <span className="hidden lg:inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border rounded border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          FIRESTORE CLOUD
        </span>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search records, creators, scripts, or vault links..."
          className={`w-full rounded border pl-9 pr-4 py-1.5 text-xs font-mono focus:outline-none transition-all ${
            isDarkMode 
              ? 'bg-[#121110] border-neutral-700 focus:border-blue-500 text-white placeholder-neutral-500' 
              : 'bg-white border-neutral-400 focus:border-black text-black placeholder-neutral-400 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
          }`}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono opacity-50 hover:opacity-100"
          >
            Clear
          </button>
        )}
      </div>

      {/* Right Actions & Theme Switch */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded border transition-all ${
            isDarkMode 
              ? 'bg-[#1F1E1C] border-neutral-700 hover:border-neutral-500 text-amber-400' 
              : 'bg-white border-neutral-400 hover:border-neutral-900 text-neutral-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
          }`}
          title={isDarkMode ? 'Switch to Paper Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenLogActivity}
          className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
            isDarkMode
              ? 'bg-[#1F1E1C] border-neutral-700 hover:border-neutral-500 text-neutral-200'
              : 'bg-white border-neutral-400 hover:border-neutral-900 text-neutral-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Log Activity</span>
        </button>

        <button
          onClick={onOpenAddCreator}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
            isDarkMode
              ? 'bg-white text-black border-white hover:bg-neutral-200'
              : 'bg-neutral-950 text-white border-neutral-950 hover:bg-neutral-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Creator</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded border transition-all ${
              isDarkMode 
                ? 'bg-[#1F1E1C] border-neutral-700 hover:border-neutral-500 text-neutral-400 hover:text-white' 
                : 'bg-white border-neutral-400 hover:border-neutral-900 text-neutral-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            }`}
            title="Activity Feed"
          >
            <Bell className="w-4 h-4" />
          </button>

          {showNotifications && (
            <div className={`absolute right-0 mt-2 w-80 border rounded p-4 shadow-2xl z-50 ${
              isDarkMode ? 'bg-[#1C1B19] border-neutral-700 text-white' : 'bg-white border-neutral-900 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            }`}>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-dashed border-current opacity-70">
                <span className="font-mono text-xs font-bold uppercase tracking-wider">System Log</span>
                <span className="font-mono text-[10px]">Verified</span>
              </div>
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="text-xs">
                    <div className="flex items-center justify-between font-bold mb-0.5">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        {n.title}
                      </span>
                      <span className="font-mono text-[10px] opacity-50">{n.time}</span>
                    </div>
                    <p className="opacity-70 text-[11px] font-sans">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
