import React from 'react';
import { NavTab } from '../types';
import { 
  BarChart3, 
  Target, 
  Calendar,
  CalendarCheck, 
  BookOpen, 
  TrendingUp, 
  FolderLock, 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  Sun,
  Moon,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onSignOut: () => void;
  creatorCount: number;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  onOpenSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isCollapsed,
  setIsCollapsed,
  isDarkMode,
  onToggleTheme,
  onSignOut,
  creatorCount,
  isMobileOpen = false,
  setIsMobileOpen,
  onOpenSettings,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'pipeline', label: 'Hitlist Pipeline', icon: <Target className="w-4 h-4" />, badge: creatorCount.toString() },
    { id: 'calendar', label: 'Calls & Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'tracker', label: 'Daily Tracker', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'scripts', label: 'Scripts & SOPs', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics & ROI', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'vault', label: 'Resource Vault', icon: <FolderLock className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen?.(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 md:static md:z-30 flex flex-col transition-all duration-300 select-none border-r ${
          isMobileOpen 
            ? 'translate-x-0 w-72 max-w-[85vw] shadow-2xl' 
            : '-translate-x-full md:translate-x-0'
        } ${
          isCollapsed ? 'md:w-18' : 'md:w-64'
        } ${
          isDarkMode 
            ? 'bg-[#181716] border-neutral-800 text-[#F4F2ED]' 
            : 'bg-[#FAF8F5] border-neutral-300 text-[#111111]'
        }`}
      >
        {/* Floating Edge Toggle Button for Desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden md:flex absolute -right-3 top-5 w-6 h-6 rounded-full border items-center justify-center transition-all z-40 shadow-sm hover:scale-110 cursor-pointer ${
            isDarkMode
              ? 'bg-[#1F1E1C] border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500'
              : 'bg-white border-neutral-400 text-neutral-700 hover:text-black hover:border-neutral-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
          }`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Brand Header */}
        <div className={`flex items-center h-16 border-b px-3 ${
          isCollapsed ? 'justify-center' : 'justify-between px-4'
        } ${
          isDarkMode ? 'border-neutral-800' : 'border-neutral-300'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => isCollapsed && setIsCollapsed(false)}
              className={`w-9 h-9 border border-current flex items-center justify-center font-serif font-bold text-lg bg-black text-white shrink-0 rounded transition-transform ${
                isCollapsed ? 'hover:scale-105 cursor-pointer' : ''
              }`}
              title="ZAK / Growth Operator"
            >
              Z
            </button>

            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col truncate">
                <span className="font-mono font-bold text-xs uppercase tracking-wider truncate">
                  ZAK / GROWTH OP
                </span>
                <span className="text-[10px] font-mono text-blue-500 font-semibold tracking-wide">
                  50/50 REVENUE SHARE
                </span>
              </div>
            )}
          </div>

          {/* Close button for Mobile Drawer */}
          {isMobileOpen && (
            <button
              onClick={() => setIsMobileOpen?.(false)}
              className={`md:hidden p-1.5 rounded border transition-colors ${
                isDarkMode 
                  ? 'border-neutral-700 hover:border-neutral-500 text-neutral-300' 
                  : 'border-neutral-300 hover:border-black text-neutral-700'
              }`}
              title="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className={`flex-1 py-4 sm:py-6 space-y-1.5 sm:space-y-2 overflow-y-auto ${
          isCollapsed && !isMobileOpen ? 'px-2 flex flex-col items-center' : 'px-3'
        }`}>
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-3 pb-2 font-mono text-[10px] font-semibold tracking-widest uppercase opacity-50">
              // OPERATOR MODULES
            </div>
          )}
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  if (isMobileOpen) {
                    setIsMobileOpen?.(false);
                  }
                }}
                className={`font-mono text-xs transition-all group relative border ${
                  isCollapsed && !isMobileOpen
                    ? 'w-11 h-11 flex items-center justify-center rounded'
                    : 'w-full flex items-center gap-3 px-3 py-2.5 rounded'
                } ${
                  isActive
                  ? isDarkMode
                    ? 'bg-white text-black border-white font-bold shadow-sm'
                    : 'bg-neutral-950 text-white border-neutral-950 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : isDarkMode
                    ? 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/40 hover:border-neutral-700'
                    : 'border-transparent text-neutral-600 hover:text-black hover:bg-neutral-200/50 hover:border-neutral-300'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!isCollapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}
              {!isCollapsed && (
                <span className={`px-1.5 py-0.2 text-[10px] font-mono border rounded ${
                  isActive 
                    ? isDarkMode ? 'border-black text-black' : 'border-white text-white'
                    : 'border-current opacity-60'
                }`}>
                  {item.badge || '0'}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Theme Switch & Operator Status (Expanded Mode) */}
      {!isCollapsed && (
        <div className={`p-3.5 m-3 border rounded ${
          isDarkMode ? 'bg-[#1F1E1C] border-neutral-800' : 'bg-white border-neutral-300'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider opacity-60">Display Style</span>
            <button
              onClick={onToggleTheme}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono border transition-all ${
                isDarkMode 
                  ? 'bg-neutral-800 border-neutral-700 hover:border-neutral-500 text-neutral-200' 
                  : 'bg-neutral-100 border-neutral-300 hover:border-neutral-900 text-neutral-800'
              }`}
            >
              {isDarkMode ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-neutral-700" />}
              <span>{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>
          </div>
          <div className="font-mono text-[11px] opacity-70">
            Paper-Style System v2.0
          </div>
        </div>
      )}

      {/* Collapsed Theme Switch Icon */}
      {isCollapsed && (
        <div className="py-2 flex justify-center">
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded border transition-all ${
              isDarkMode 
                ? 'bg-[#1F1E1C] border-neutral-700 hover:border-neutral-500 text-amber-400' 
                : 'bg-white border-neutral-300 hover:border-neutral-900 text-neutral-800'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {/* User profile & Sign Out footer */}
      <div className={`p-3 border-t flex items-center ${
        isCollapsed ? 'justify-center' : 'justify-between gap-2'
      } ${
        isDarkMode ? 'border-neutral-800 bg-[#121110]' : 'border-neutral-300 bg-[#F4F1EA]'
      }`}>
        <div className={`flex items-center gap-2 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-mono font-bold text-xs shrink-0">
            Z
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold font-sans truncate">Zakaria</span>
              <span className="text-[10px] font-mono opacity-60 truncate">Growth Operator</span>
            </div>
          )}
        </div>

        {(!isCollapsed || isMobileOpen) && (
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenSettings && (
              <button
                onClick={() => {
                  onOpenSettings();
                  if (isMobileOpen) {
                    setIsMobileOpen?.(false);
                  }
                }}
                className={`p-1.5 rounded border transition-colors ${
                  isDarkMode 
                    ? 'border-neutral-700 hover:border-neutral-500 text-neutral-400 hover:text-white' 
                    : 'border-neutral-300 hover:border-neutral-900 text-neutral-600 hover:text-black'
                }`}
                title="Settings & JSON Backup"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onSignOut}
              className={`p-1.5 rounded border transition-colors ${
                isDarkMode 
                  ? 'border-neutral-700 hover:border-red-500 text-neutral-400 hover:text-red-400' 
                  : 'border-neutral-300 hover:border-red-600 text-neutral-600 hover:text-red-600'
              }`}
              title="Sign Out of Workspace"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  </>
  );
};
