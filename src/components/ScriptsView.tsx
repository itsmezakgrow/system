import React, { useState } from 'react';
import { ScriptItem } from '../types';
import { BookOpen, Copy, Check, ChevronDown, ChevronUp, Edit3, Trash2, Plus } from 'lucide-react';
import { EditScriptModal } from './EditScriptModal';

interface ScriptsViewProps {
  scripts: ScriptItem[];
  searchQuery: string;
  isDarkMode: boolean;
  onSaveScript: (script: ScriptItem) => void;
  onDeleteScript: (id: string) => void;
  onRequestConfirmDelete: (title: string, onConfirm: () => void) => void;
}

export const ScriptsView: React.FC<ScriptsViewProps> = ({
  scripts,
  searchQuery,
  isDarkMode,
  onSaveScript,
  onDeleteScript,
  onRequestConfirmDelete,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(scripts[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal state
  const [editingScript, setEditingScript] = useState<ScriptItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const categories = ['All', 'Cold DM', 'Follow-up', 'Loom Pitch', 'Objection Handling', 'Closing'];

  const filteredScripts = scripts.filter((s) => {
    const matchesSearch = 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
              <BookOpen className="w-4 h-4" />
              <span>// OPERATOR PLAYBOOK &bull; FULL EDIT CONTROL</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              Scripts &amp; Outreach Templates
            </h2>
            <p className="text-xs opacity-70 font-sans mt-1">
              Customizable outreach angles, Loom breakdowns, and closing scripts. You can edit any script, customize text, or add new templates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingNew(true)}
              className={`flex items-center gap-1.5 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider border rounded transition-all ${
                isDarkMode 
                  ? 'bg-white text-black border-white hover:bg-neutral-200' 
                  : 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Script</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border p-1 rounded font-mono text-xs border-current mt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded transition-all ${
                selectedCategory === cat
                  ? isDarkMode ? 'bg-white text-black font-bold' : 'bg-black text-white font-bold'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scripts Accordion List */}
      <div className="space-y-4">
        {filteredScripts.map((script) => {
          const isExpanded = expandedId === script.id;
          const isCopied = copiedId === script.id;

          return (
            <div 
              key={script.id}
              className={`border transition-all ${
                isDarkMode 
                  ? 'bg-[#1C1B19] border-neutral-700' 
                  : 'bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-5 select-none">
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : script.id)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <div className="w-7 h-7 border border-current flex items-center justify-center font-mono text-xs font-bold shrink-0">
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-bold">{script.title}</h3>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 border border-current rounded opacity-75">
                        {script.category}
                      </span>
                    </div>
                    <p className="text-xs opacity-70 mt-0.5">{script.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {script.successRate && (
                    <span className="font-mono text-xs text-emerald-500 font-bold border border-emerald-500/30 px-2 py-0.5 rounded hidden sm:inline">
                      {script.successRate}
                    </span>
                  )}
                  <button
                    onClick={() => setEditingScript(script)}
                    className="p-1.5 rounded border border-neutral-400 hover:border-black dark:hover:border-white transition-colors text-xs font-mono"
                    title="Edit Script Template"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRequestConfirmDelete(`Script: "${script.title}"`, () => onDeleteScript(script.id))}
                    className="p-1.5 rounded text-neutral-400 hover:text-red-500 transition-colors"
                    title="Delete Script (Confirmation required)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : script.id)}
                    className="p-1.5 opacity-60 hover:opacity-100"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Body */}
              {isExpanded && (
                <div className={`p-4 md:p-6 border-t border-dashed border-current space-y-3 ${
                  isDarkMode ? 'bg-[#141312]' : 'bg-[#FAF8F5]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider opacity-60">Template Content:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingScript(script)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono border rounded hover:bg-neutral-500/10"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Text</span>
                      </button>
                      <button
                        onClick={() => handleCopy(script.id, script.content)}
                        className={`flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider border rounded transition-all ${
                          isDarkMode
                            ? 'bg-white text-black border-white'
                            : 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copied!' : 'Copy Script'}</span>
                      </button>
                    </div>
                  </div>

                  <div className={`p-4 border rounded font-mono text-xs leading-relaxed whitespace-pre-wrap select-all ${
                    isDarkMode ? 'bg-[#181716] border-neutral-700 text-neutral-200' : 'bg-white border-neutral-400 text-black'
                  }`}>
                    {script.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit or Add Script Modal */}
      <EditScriptModal
        script={editingScript}
        isOpen={!!editingScript || isCreatingNew}
        onClose={() => {
          setEditingScript(null);
          setIsCreatingNew(false);
        }}
        onSave={(saved) => {
          onSaveScript(saved);
          setEditingScript(null);
          setIsCreatingNew(false);
        }}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
