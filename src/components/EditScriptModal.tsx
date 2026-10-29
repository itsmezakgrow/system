import React, { useState } from 'react';
import { ScriptItem } from '../types';
import { X, Save } from 'lucide-react';

interface EditScriptModalProps {
  script: ScriptItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (savedScript: ScriptItem) => void;
  isDarkMode: boolean;
}

export const EditScriptModal: React.FC<EditScriptModalProps> = ({
  script,
  isOpen,
  onClose,
  onSave,
  isDarkMode,
}) => {
  if (!isOpen) return null;

  const isEditing = !!script;

  const [title, setTitle] = useState(script?.title || '');
  const [category, setCategory] = useState<ScriptItem['category']>(script?.category || 'Cold DM');
  const [description, setDescription] = useState(script?.description || '');
  const [content, setContent] = useState(script?.content || '');
  const [successRate, setSuccessRate] = useState(script?.successRate || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSave({
      id: script ? script.id : `s_${Date.now()}`,
      title: title.trim(),
      category,
      description: description.trim(),
      content: content.trim(),
      successRate: successRate.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-lg border p-6 md:p-8 rounded shadow-2xl transition-all my-8 max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-[#1C1B19] border-neutral-700 text-white' : 'bg-white border-neutral-900 text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
      }`}>
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-dashed border-current">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              {isEditing ? '[EDIT SCRIPT TEMPLATE]' : '[NEW OUTREACH SCRIPT]'}
            </span>
          </div>
          <button onClick={onClose} className="font-mono text-xs opacity-60 hover:opacity-100">
            ✕ CLOSE
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block opacity-70 mb-1 uppercase">Script Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2-Step Loom VSL Hook"
              className={`w-full p-2.5 border rounded focus:outline-none ${
                isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block opacity-70 mb-1 uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ScriptItem['category'])}
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              >
                <option value="Cold DM">Cold DM</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Loom Pitch">Loom Pitch</option>
                <option value="Objection Handling">Objection Handling</option>
                <option value="Closing">Closing</option>
              </select>
            </div>
            <div>
              <label className="block opacity-70 mb-1 uppercase">Expected Conversion Rate</label>
              <input
                type="text"
                value={successRate}
                onChange={(e) => setSuccessRate(e.target.value)}
                placeholder="e.g. 45% Reply Rate"
                className={`w-full p-2.5 border rounded focus:outline-none ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block opacity-70 mb-1 uppercase">Description / Angle</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Best for fitness coaches selling WhatsApp PDFs..."
              className={`w-full p-2.5 border rounded focus:outline-none ${
                isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
              }`}
            />
          </div>

          <div>
            <label className="block opacity-70 mb-1 uppercase">Template Text (Use [First Name], [Topic]):</label>
            <textarea
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Hey [First Name]! Loved your content about..."
              className={`w-full p-3 border rounded focus:outline-none resize-none leading-relaxed ${
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
              <span>{isEditing ? 'Save Script' : 'Create Script'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
