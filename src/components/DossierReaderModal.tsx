import React, { useState } from 'react';
import { Creator } from '../types';
import { 
  X, 
  Copy, 
  Download, 
  Edit3, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  Coffee, 
  Type, 
  Check, 
  FileText,
  AlignRight,
  AlignLeft
} from 'lucide-react';
import { MarkdownRenderer, DirectionMode } from './MarkdownRenderer';

interface DossierReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: Creator | null;
  allCreatorsWithDossiers?: Creator[];
  onSelectCreator?: (creator: Creator) => void;
  onOpenEditModal?: (creator: Creator) => void;
  isDarkMode: boolean;
  showToast?: (msg: string) => void;
}

export const DossierReaderModal: React.FC<DossierReaderModalProps> = ({
  isOpen,
  onClose,
  creator,
  allCreatorsWithDossiers = [],
  onSelectCreator,
  onOpenEditModal,
  isDarkMode,
  showToast,
}) => {
  const [readingTheme, setReadingTheme] = useState<'sepia' | 'light' | 'dark'>('sepia');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl' | '2xl'>('xl');
  const [forceDirection, setForceDirection] = useState<DirectionMode>('auto');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !creator) return null;

  const markdownContent = creator.dossierMarkdown || '';

  // Calculate current index for next/previous navigation
  const list = allCreatorsWithDossiers.length > 0 ? allCreatorsWithDossiers : [creator];
  const currentIndex = list.findIndex(c => c.id === creator.id);
  const prevCreator = currentIndex > 0 ? list[currentIndex - 1] : null;
  const nextCreator = currentIndex >= 0 && currentIndex < list.length - 1 ? list[currentIndex + 1] : null;

  const handleCopyMarkdown = () => {
    if (!markdownContent) return;
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    if (showToast) showToast('📋 Dossier Markdown copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportMarkdownFile = () => {
    if (!markdownContent) return;
    const cleanHandle = creator.handle.replace(/[@\s]/g, '_');
    const filename = `Coach_${cleanHandle}_Dossier.md`;
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (showToast) showToast(`📥 Downloaded ${filename}`);
  };

  // Theme styling rules for reader
  const themeStyles = {
    sepia: {
      bg: 'bg-[#F9F5EE]',
      headerBg: 'bg-[#F0E6D2] border-[#D9CEB8]',
      text: 'text-[#1C160F]',
      border: 'border-[#D9CEB8]',
      accentBtn: 'bg-[#7C4A1D] text-white hover:bg-[#633A15]',
    },
    light: {
      bg: 'bg-[#FAF8F5]',
      headerBg: 'bg-[#EAE5D8] border-neutral-300',
      text: 'text-[#111111]',
      border: 'border-neutral-300',
      accentBtn: 'bg-black text-white hover:bg-neutral-800',
    },
    dark: {
      bg: 'bg-[#181716]',
      headerBg: 'bg-[#121110] border-neutral-800',
      text: 'text-[#F4F2ED]',
      border: 'border-neutral-800',
      accentBtn: 'bg-amber-500 text-black hover:bg-amber-400 font-bold',
    },
  };

  const currentTheme = themeStyles[readingTheme];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden">
      {/* Top Fixed Control Toolbar */}
      <div className={`p-3 px-4 border-b flex flex-wrap items-center justify-between gap-3 shadow-md ${currentTheme.headerBg} ${currentTheme.text}`}>
        {/* Left Actions: Exit Reader & Creator Select */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold border shadow-xs transition-all ${
              currentTheme.accentBtn
            }`}
            title="Exit Reader View and return to Coach Details"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Reader (خروج)</span>
          </button>

          {/* Coach Title Badge */}
          <div className="flex items-center gap-2 font-mono text-xs border-l border-current/20 pl-3">
            <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-serif font-black text-sm truncate max-w-[200px] sm:max-w-[320px]">
              {creator.name}
            </span>
            <span className="opacity-60 text-[11px] hidden md:inline">({creator.handle})</span>
          </div>
        </div>

        {/* Center / Right: Reader Controls (Font Size, Theme, Export) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Font Size Adjuster */}
          <div className="flex items-center gap-1 border rounded-lg p-1 border-current/20 bg-black/5 dark:bg-white/5 font-mono text-xs">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${fontSize === 'sm' ? 'bg-amber-500 text-black' : 'opacity-60 hover:opacity-100'}`}
              title="Small text"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-0.5 rounded text-xs font-bold ${fontSize === 'lg' ? 'bg-amber-500 text-black' : 'opacity-60 hover:opacity-100'}`}
              title="Medium text"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('xl')}
              className={`px-2 py-0.5 rounded text-sm font-bold ${fontSize === 'xl' ? 'bg-amber-500 text-black' : 'opacity-60 hover:opacity-100'}`}
              title="Large text (Recommended)"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('2xl')}
              className={`px-2 py-0.5 rounded text-base font-bold ${fontSize === '2xl' ? 'bg-amber-500 text-black' : 'opacity-60 hover:opacity-100'}`}
              title="Extra Large text"
            >
              A++
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-1 border rounded-lg p-1 border-current/20 bg-black/5 dark:bg-white/5 font-mono text-xs">
            <button
              onClick={() => setReadingTheme('sepia')}
              className={`p-1.5 rounded flex items-center gap-1 ${readingTheme === 'sepia' ? 'bg-[#8C5E32] text-white font-bold' : 'opacity-60 hover:opacity-100'}`}
              title="Warm Sepia Paper Reading Theme"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">Sepia</span>
            </button>

            <button
              onClick={() => setReadingTheme('light')}
              className={`p-1.5 rounded flex items-center gap-1 ${readingTheme === 'light' ? 'bg-black text-white font-bold' : 'opacity-60 hover:opacity-100'}`}
              title="Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">Light</span>
            </button>

            <button
              onClick={() => setReadingTheme('dark')}
              className={`p-1.5 rounded flex items-center gap-1 ${readingTheme === 'dark' ? 'bg-amber-500 text-black font-bold' : 'opacity-60 hover:opacity-100'}`}
              title="Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">Dark</span>
            </button>
          </div>

          {/* Direction Override (Auto / RTL / LTR) */}
          <div className="flex items-center gap-1 border rounded-lg p-1 border-current/20 bg-black/5 dark:bg-white/5 font-mono text-xs">
            <button
              onClick={() => setForceDirection('auto')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                forceDirection === 'auto'
                  ? readingTheme === 'sepia'
                    ? 'bg-[#7C4A1D] text-white'
                    : 'bg-black text-white dark:bg-amber-500 dark:text-black'
                  : 'opacity-60 hover:opacity-100'
              }`}
              title="Automatic intelligent BiDi detection"
            >
              Auto
            </button>
            <button
              onClick={() => setForceDirection('rtl')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                forceDirection === 'rtl'
                  ? readingTheme === 'sepia'
                    ? 'bg-[#7C4A1D] text-white'
                    : 'bg-black text-white dark:bg-amber-500 dark:text-black'
                  : 'opacity-60 hover:opacity-100'
              }`}
              title="Force Right-to-Left (يمين)"
            >
              <AlignRight className="w-3 h-3" />
              <span>RTL (يمين)</span>
            </button>
            <button
              onClick={() => setForceDirection('ltr')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                forceDirection === 'ltr'
                  ? readingTheme === 'sepia'
                    ? 'bg-[#7C4A1D] text-white'
                    : 'bg-black text-white dark:bg-amber-500 dark:text-black'
                  : 'opacity-60 hover:opacity-100'
              }`}
              title="Force Left-to-Right (يسار)"
            >
              <AlignLeft className="w-3 h-3" />
              <span>LTR (يسار)</span>
            </button>
          </div>

          {/* Action Buttons: Copy, Export .md, Edit */}
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-current/20 text-xs font-mono font-bold hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Copy full Markdown to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleExportMarkdownFile}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-current/20 text-xs font-mono font-bold hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Download .md file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export .md</span>
          </button>

          {onOpenEditModal && (
            <button
              onClick={() => {
                onClose();
                onOpenEditModal(creator);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-current/20 text-xs font-mono font-bold hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Edit Dossier text"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Scrollable Reading Document Viewport */}
      <div className={`flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 ${currentTheme.bg} ${currentTheme.text}`}>
        <div className="max-w-4xl mx-auto min-h-full pb-16">
          <MarkdownRenderer
            content={markdownContent}
            fontSize={fontSize}
            theme={readingTheme}
            forceDirection={forceDirection}
          />
        </div>
      </div>

      {/* Bottom Sticky Navigation Bar */}
      <div className={`p-3 px-6 border-t flex items-center justify-between text-xs font-mono ${currentTheme.headerBg} ${currentTheme.text}`}>
        <div className="opacity-70">
          Dossier Reader View • {currentIndex + 1} of {list.length} Coaches
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={!prevCreator}
            onClick={() => prevCreator && onSelectCreator && onSelectCreator(prevCreator)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded border transition-all ${
              prevCreator
                ? 'opacity-90 hover:opacity-100 border-current/30 font-bold'
                : 'opacity-30 cursor-not-allowed border-transparent'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Coach</span>
          </button>

          <button
            disabled={!nextCreator}
            onClick={() => nextCreator && onSelectCreator && onSelectCreator(nextCreator)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded border transition-all ${
              nextCreator
                ? 'opacity-90 hover:opacity-100 border-current/30 font-bold'
                : 'opacity-30 cursor-not-allowed border-transparent'
            }`}
          >
            <span>Next Coach</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
