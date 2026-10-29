import React, { useState } from 'react';
import { ResourceItem } from '../types';
import { FolderLock, Globe, Mail, Calendar, Users, Folder, FileText, Copy, Check, ExternalLink, Plus, Key, AlertCircle, Edit3, Trash2 } from 'lucide-react';
import { EditVaultModal } from './EditVaultModal';

interface VaultViewProps {
  resources: ResourceItem[];
  searchQuery: string;
  onSaveResource: (resource: ResourceItem) => void;
  onDeleteResource: (id: string) => void;
  isDarkMode: boolean;
  onRequestConfirmDelete: (title: string, onConfirm: () => void) => void;
}

export const VaultView: React.FC<VaultViewProps> = ({
  resources,
  searchQuery,
  onSaveResource,
  onDeleteResource,
  isDarkMode,
  onRequestConfirmDelete,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit / Add modal state
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const categories = ['All', 'Logins & Accounts', 'Brand Assets', 'Useful Links', 'Tools & Software'];

  const filteredResources = resources.filter((r) => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.usernameOrEmail && r.usernameOrEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.secretNote && r.secretNote.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCopy = (id: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
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
              <FolderLock className="w-4 h-4" />
              <span>// AGENCY VAULT &bull; CREDENTIALS &amp; LINKS</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              Links &amp; Password Library
            </h2>
            <p className="text-xs opacity-70 font-sans mt-1">
              Save business emails, websites, YouTube channels, Skool logins, and passwords for one-click access and copying. Fully editable anytime.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreatingNew(true)}
              className={`flex items-center gap-1.5 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider border rounded transition-all ${
                isDarkMode 
                  ? 'bg-white text-black border-white hover:bg-neutral-200' 
                  : 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vault Item</span>
            </button>
          </div>
        </div>

        {/* Categories */}
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((item) => {
          const isCopied = copiedId === item.id;

          return (
            <div 
              key={item.id}
              className={`p-5 md:p-6 border flex flex-col justify-between transition-all ${
                isDarkMode 
                  ? 'bg-[#1C1B19] border-neutral-700' 
                  : 'bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-dashed border-current opacity-70">
                  <span className="font-mono text-[10px] uppercase tracking-wider font-bold">{item.category}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingResource(item)}
                      className="p-1 rounded opacity-60 hover:opacity-100"
                      title="Edit Resource"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRequestConfirmDelete(`Vault Item: "${item.title}"`, () => onDeleteResource(item.id))}
                      className="p-1 rounded opacity-60 hover:text-red-500"
                      title="Delete Resource (Confirmation required)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-serif text-lg font-bold mb-1">{item.title}</h3>

                {item.usernameOrEmail && (
                  <p className="font-mono text-xs text-blue-500 mb-2 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 opacity-60" />
                    <span>{item.usernameOrEmail}</span>
                  </p>
                )}

                {item.secretNote && (
                  <p className={`p-2.5 rounded border text-xs font-mono mb-3 ${
                    isDarkMode ? 'bg-[#141312] border-neutral-700 opacity-80' : 'bg-[#FAF8F5] border-neutral-300 opacity-80'
                  }`}>
                    {item.secretNote}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-dashed border-current mt-2 text-xs font-mono">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline flex items-center gap-1 truncate max-w-[160px] opacity-75"
                >
                  <span className="truncate">{item.url.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingResource(item)}
                    className="p-1.5 border rounded opacity-75 hover:opacity-100"
                    title="Edit Item"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleCopy(item.id, item.usernameOrEmail || item.url)}
                    className={`flex items-center gap-1 px-2.5 py-1 border rounded transition-all ${
                      isDarkMode ? 'border-neutral-600 hover:border-white' : 'border-neutral-900 hover:bg-neutral-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                    title="Copy"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className={`p-12 border border-dashed text-center rounded flex flex-col items-center justify-center ${
          isDarkMode ? 'border-neutral-700 bg-neutral-900/20' : 'border-neutral-300 bg-neutral-50'
        }`}>
          <AlertCircle className="w-7 h-7 opacity-40 mb-2" />
          <h4 className="font-serif text-lg font-bold mb-1">Your Vault is Empty</h4>
          <p className="text-xs opacity-70 max-w-sm mb-4">
            Save your agency emails, YouTube channel links, payment portals, and passwords to quickly copy them on the go.
          </p>
          <button
            onClick={() => setIsCreatingNew(true)}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider border rounded ${
              isDarkMode 
                ? 'bg-white text-black border-white' 
                : 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            + Add First Link / Resource
          </button>
        </div>
      )}

      {/* Edit or Add Resource Modal */}
      <EditVaultModal
        resource={editingResource}
        isOpen={!!editingResource || isCreatingNew}
        onClose={() => {
          setEditingResource(null);
          setIsCreatingNew(false);
        }}
        onSave={(saved) => {
          onSaveResource(saved);
          setEditingResource(null);
          setIsCreatingNew(false);
        }}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
