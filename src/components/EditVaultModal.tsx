import React, { useState } from 'react';
import { ResourceItem } from '../types';
import { X, Save } from 'lucide-react';

interface EditVaultModalProps {
  resource: ResourceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (savedResource: ResourceItem) => void;
  isDarkMode: boolean;
}

export const EditVaultModal: React.FC<EditVaultModalProps> = ({
  resource,
  isOpen,
  onClose,
  onSave,
  isDarkMode,
}) => {
  if (!isOpen) return null;

  const isEditing = !!resource;

  const [title, setTitle] = useState(resource?.title || '');
  const [category, setCategory] = useState<ResourceItem['category']>(resource?.category || 'Useful Links');
  const [url, setUrl] = useState(resource?.url || '');
  const [usernameOrEmail, setUsernameOrEmail] = useState(resource?.usernameOrEmail || '');
  const [secretNote, setSecretNote] = useState(resource?.secretNote || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    onSave({
      id: resource ? resource.id : `r_${Date.now()}`,
      title: title.trim(),
      category,
      url: url.startsWith('http') ? url : `https://${url}`,
      usernameOrEmail: usernameOrEmail.trim() || undefined,
      secretNote: secretNote.trim() || undefined,
      iconName: resource?.iconName || 'Globe',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md border p-6 md:p-8 rounded shadow-2xl transition-all my-8 ${
        isDarkMode ? 'bg-[#1C1B19] border-neutral-700 text-white' : 'bg-white border-neutral-900 text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
      }`}>
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-dashed border-current">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              {isEditing ? '[EDIT VAULT RESOURCE]' : '[NEW VAULT LINK]'}
            </span>
          </div>
          <button onClick={onClose} className="font-mono text-xs opacity-60 hover:opacity-100">
            ✕ CLOSE
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block opacity-70 mb-1 uppercase">Title (e.g. Website, YouTube, Email)</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Official YouTube Channel"
              className={`w-full p-2.5 border rounded focus:outline-none ${
                isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
              }`}
            />
          </div>

          <div>
            <label className="block opacity-70 mb-1 uppercase">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ResourceItem['category'])}
              className={`w-full p-2.5 border rounded focus:outline-none ${
                isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
              }`}
            >
              <option value="Useful Links">Useful Links</option>
              <option value="Logins & Accounts">Logins & Accounts</option>
              <option value="Brand Assets">Brand Assets</option>
              <option value="Tools & Software">Tools & Software</option>
            </select>
          </div>

          <div>
            <label className="block opacity-70 mb-1 uppercase">Website / Link URL</label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className={`w-full p-2.5 border rounded focus:outline-none ${
                isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
              }`}
            />
          </div>

          <div>
            <label className="block opacity-70 mb-1 uppercase">Identifier / Email / Username</label>
            <input
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="admin@agency.com"
              className={`w-full p-2.5 border rounded focus:outline-none ${
                isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
              }`}
            />
          </div>

          <div>
            <label className="block opacity-70 mb-1 uppercase">Password Hint / Secure Note</label>
            <textarea
              rows={2}
              value={secretNote}
              onChange={(e) => setSecretNote(e.target.value)}
              placeholder="Notes, passwords, or recovery codes..."
              className={`w-full p-2.5 border rounded focus:outline-none resize-none ${
                isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
              }`}
            />
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
              className={`px-5 py-2 font-bold uppercase tracking-wider border rounded flex items-center gap-1.5 ${
                isDarkMode 
                  ? 'bg-white text-black border-white' 
                  : 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Save Resource' : 'Add To Vault'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
