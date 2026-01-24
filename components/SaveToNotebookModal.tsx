'use client';

import React, { useState } from 'react';
import { X, FolderPlus, Check, Folder, CornerDownRight } from 'lucide-react';
import { Category, ExamMode } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryId: string) => void;
  onCreateCategory: (name: string) => string; // returns new id
  categories: Category[];
  currentMode: ExamMode;
}

const SaveToNotebookModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onCreateCategory, 
  categories, 
  currentMode 
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  if (!isOpen) return null;

  // Build Hierarchy
  const relevantCategories = categories.filter(c => c.mode === currentMode);
  
  // Sort: Root categories first
  const rootCategories = relevantCategories.filter(c => !c.parentId);
  
  // Helper to get children
  const getChildren = (parentId: string) => relevantCategories.filter(c => c.parentId === parentId);

  const handleCreate = () => {
    if (!newCatName.trim()) return;
    const newId = onCreateCategory(newCatName);
    setSelectedCatId(newId);
    setNewCatName('');
    setIsCreating(false);
  };

  const handleConfirm = () => {
    onSave(selectedCatId);
    onClose();
  };

  const renderCategoryOption = (cat: Category, level: number = 0) => {
    const children = getChildren(cat.id);
    return (
      <React.Fragment key={cat.id}>
        <button
          onClick={() => setSelectedCatId(cat.id)}
          className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all w-full text-left font-serif ${
            selectedCatId === cat.id
              ? 'border-stone-800 bg-stone-50 text-stone-800 ring-1 ring-stone-800' 
              : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-600'
          }`}
          style={{ marginLeft: level > 0 ? `${level * 16}px` : '0px', width: level > 0 ? `calc(100% - ${level * 16}px)` : '100%' }}
        >
          {level > 0 && <CornerDownRight size={14} className="text-stone-300 -ml-1" />}
          <Folder size={14} className={selectedCatId === cat.id ? 'fill-stone-300 flex-shrink-0' : 'fill-stone-100 flex-shrink-0'} />
          <span className="truncate">{cat.name}</span>
        </button>
        {children.map(child => renderCategoryOption(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#fcfaf8] rounded-2xl w-full max-w-sm shadow-2xl p-5 m-4 animate-in zoom-in-95 duration-200 border border-stone-200 flex flex-col max-h-[80vh]">
        
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2 font-serif">
            <Folder size={20} className="text-stone-600 fill-stone-100" />
            <span>归档到笔记本</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <p className="text-sm text-stone-500 mb-3 flex-shrink-0 font-serif">选择一个文件夹来保存此题。</p>

          {!isCreating ? (
            <div className="flex-1 overflow-y-auto p-1 space-y-2">
              {/* Uncategorized Option */}
              <button
                onClick={() => setSelectedCatId('')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all w-full font-serif ${
                  selectedCatId === '' 
                    ? 'border-stone-800 bg-stone-50 text-stone-800 ring-1 ring-stone-800' 
                    : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-600'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${selectedCatId === '' ? 'bg-stone-800' : 'bg-stone-300'}`}></div>
                默认收纳
              </button>

              {rootCategories.map(cat => renderCategoryOption(cat))}

              {/* Create New Button */}
              <button
                onClick={() => setIsCreating(true)}
                className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl border border-dashed border-stone-300 text-stone-400 hover:text-stone-600 hover:border-stone-500 hover:bg-stone-50 transition-all w-full font-sans"
              >
                <FolderPlus size={18} />
                <span className="text-xs">新建分类</span>
              </button>
            </div>
          ) : (
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 animate-in slide-in-from-bottom-2">
              <label className="text-xs font-bold text-stone-500 mb-1 block font-sans">新文件夹名称</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="例如：位置平移..."
                  className="flex-1 text-sm border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-400 font-serif"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <button 
                  onClick={handleCreate}
                  disabled={!newCatName.trim()}
                  className="bg-stone-800 text-white p-2 rounded-lg hover:bg-stone-900 disabled:bg-stone-300 disabled:cursor-not-allowed"
                >
                  <Check size={18} />
                </button>
              </div>
              <button 
                onClick={() => setIsCreating(false)}
                className="text-xs text-stone-400 mt-2 hover:text-stone-600 underline font-sans"
              >
                返回选择
              </button>
            </div>
          )}

          <div className="pt-3 border-t border-stone-100 mt-2 flex-shrink-0">
            <button
              onClick={handleConfirm}
              className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-stone-200 active:scale-95 font-serif"
            >
              确定保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveToNotebookModal;