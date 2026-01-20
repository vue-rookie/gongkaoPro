import React, { useState } from 'react';
import { Category, Message, ExamMode } from '../types';
import { MODE_LABELS } from '../constants';
import { Folder, ChevronRight, ArrowLeft, Tag, Calendar, StickyNote, Trash2, BookOpen, Bot, Star, Plus, FolderOpen, CornerUpLeft, CheckCircle2, Lightbulb, FileText, HelpCircle, BookText } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import ConfirmationModal from './ConfirmationModal';

interface Props {
  messages: Message[];
  categories: Category[];
  onCreateCategory: (name: string, mode: ExamMode, parentId?: string) => void;
  onDeleteCategory: (id: string) => void;
  onRemoveMessage: (id: string) => void; // Unbookmark
  onUpdateNote: (id: string, note: string) => void;
}

const NotebookView: React.FC<Props> = ({
  messages,
  categories,
  onCreateCategory,
  onDeleteCategory,
  onRemoveMessage,
  onUpdateNote
}) => {
  const [activeTab, setActiveTab] = useState<ExamMode>(ExamMode.XING_CE);
  // selectedCategoryId: null = Root, 'UNCATEGORIZED' = Default Folder, string = Specific Category UUID
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'UNCATEGORIZED' | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Confirmation Modal State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  });

  const openConfirm = (title: string, message: string, action: () => void) => {
    setConfirmState({ isOpen: true, title, message, action });
  };

  // Helper to strip markdown/code for clean preview
  const getPreviewText = (text: string) => {
    if (!text) return '';
    // Remove markdown code blocks (```...```)
    let clean = text.replace(/```[\s\S]*?```/g, '');
    // Remove HTML tags
    clean = clean.replace(/<[^>]*>/g, '');
    // Remove markdown symbols
    clean = clean.replace(/[*#`_~\[\]]/g, '');
    // Collapse whitespace
    return clean.replace(/\s+/g, ' ').trim();
  };

  // --- DATA FILTERING ---
  
  // 1. All bookmarked messages for current mode
  const modeMessages = messages.filter(
    m => (m.isBookmarked || (m.note && m.note.length > 0)) && m.mode === activeTab
  );

  // 2. All categories for current mode
  const modeCategories = categories.filter(c => c.mode === activeTab);

  // 3. Helper: Count ITEMS within a specific category (direct items)
  const getMessageCount = (catId?: string) => {
    if (!catId) return modeMessages.filter(m => !m.categoryId).length;
    return modeMessages.filter(m => m.categoryId === catId).length;
  };

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    
    // Depth Limit Check: If we are in a subfolder (it has a parentId), don't allow creating another level.
    if (selectedCategoryId && selectedCategoryId !== 'UNCATEGORIZED') {
        const current = categories.find(c => c.id === selectedCategoryId);
        if (current && current.parentId) {
             alert("为了保持知识库清晰，最多只支持两级文件夹结构。");
             return;
        }
    }

    // Create folder inside current selected category if it's a real category (not Uncategorized)
    const parentId = (selectedCategoryId && selectedCategoryId !== 'UNCATEGORIZED') 
        ? selectedCategoryId 
        : undefined;
    
    onCreateCategory(newCatName, activeTab, parentId);
    setNewCatName('');
    setIsCreatingCat(false);
  };

  const handleNavigateUp = () => {
    if (selectedCategoryId === 'UNCATEGORIZED') {
        setSelectedCategoryId(null);
    } else if (selectedCategoryId) {
        // Find current category
        const current = categories.find(c => c.id === selectedCategoryId);
        if (current && current.parentId) {
            setSelectedCategoryId(current.parentId);
        } else {
            setSelectedCategoryId(null);
        }
    }
  };

  // --- RENDER LEVEL 3: MESSAGE DETAIL ---
  if (selectedMessageId) {
    const msg = messages.find(m => m.id === selectedMessageId);
    if (!msg) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <p>该内容已移除</p>
                <button onClick={() => setSelectedMessageId(null)} className="mt-4 text-blue-600 hover:underline">返回列表</button>
            </div>
        );
    }

    return (
      <div className="h-full flex flex-col bg-white">
        <ConfirmationModal 
            isOpen={confirmState.isOpen}
            onClose={() => setConfirmState(prev => ({...prev, isOpen: false}))}
            onConfirm={confirmState.action}
            title={confirmState.title}
            message={confirmState.message}
            isDangerous={true}
            confirmText="确认删除"
        />
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
           <button onClick={() => setSelectedMessageId(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><ArrowLeft size={20} /></button>
           <div className="flex-1">
             <h2 className="font-bold text-gray-800 text-sm md:text-base line-clamp-1">
                {msg.quizData ? '全真模拟卷 · 复习模式' : '题目详情'}
             </h2>
             <p className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString()}</p>
           </div>
           <button 
             onClick={() => openConfirm("移除题目", "确定要将这道题从笔记本中移除吗？您的笔记和分类信息将一并删除。", () => { onRemoveMessage(msg.id); setSelectedMessageId(null); })}
             className="text-red-400 hover:text-red-600 p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
           >
             <Trash2 size={18} />
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
           <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Note Section - Moved to Top for better reviewing */}
              <div className="bg-yellow-50 p-6 rounded-2xl shadow-sm border border-yellow-200 relative group transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-3 text-yellow-800 font-bold">
                    <StickyNote size={18} />
                    <span>我的笔记</span>
                  </div>
                  <textarea 
                    className="w-full bg-transparent border-0 outline-none focus:ring-0 focus:outline-none focus:border-none text-gray-700 text-sm leading-relaxed p-0 resize-none h-auto min-h-[100px] placeholder-yellow-800/30"
                    style={{ border: 'none', boxShadow: 'none', outline: 'none' }} 
                    value={msg.note || ''} 
                    placeholder="在此输入复习重点、易错点或心得体会..." 
                    onChange={(e) => onUpdateNote(msg.id, e.target.value)}
                  />
                  <div className="absolute top-4 right-4 text-xs text-yellow-600/60 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
                      自动保存
                  </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                     <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><Bot size={20} /></div>
                     <span className="font-bold text-gray-700">题目与解析</span>
                     {msg.quizData && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full ml-auto">共 {msg.quizData.length} 题</span>}
                  </div>
                  
                  {/* RENDER QUIZ DATA IF AVAILABLE */}
                  {msg.quizData ? (
                      <div className="space-y-10">
                          {msg.quizData.map((q, idx) => (
                              <div key={idx} className="relative">
                                  {/* Connector Line */}
                                  {idx !== msg.quizData!.length - 1 && (
                                      <div className="absolute left-[15px] top-8 bottom-[-40px] w-0.5 bg-gray-100"></div>
                                  )}

                                  <div className="flex gap-4">
                                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm z-10">
                                          {idx + 1}
                                      </div>
                                      <div className="flex-1 space-y-4 pt-1 w-full">
                                          
                                          {/* Shen Lun Reading Material in Review */}
                                          {q.material && (
                                              <div className="bg-stone-50 border-l-4 border-stone-300 p-4 mb-4 rounded-r-lg">
                                                  <div className="flex items-center gap-2 text-stone-700 font-bold mb-2 text-xs uppercase tracking-wider">
                                                       <BookText size={14} /> 给定资料
                                                  </div>
                                                  <div className="prose prose-sm prose-stone text-gray-600 leading-relaxed text-justify">
                                                       {q.material}
                                                  </div>
                                              </div>
                                          )}

                                          {/* Question with Markdown Rendering (for SVG) */}
                                          <div className="font-bold text-gray-800 text-lg leading-relaxed">
                                              <MarkdownRenderer content={q.question} className="prose-base" />
                                          </div>
                                          
                                          {/* Options (MCQ only) */}
                                          {q.options && (
                                              <div className="grid grid-cols-1 gap-2">
                                                  {q.options.map((opt, i) => {
                                                      // Determine correctness for display
                                                      const optLabel = opt.split('.')[0].trim();
                                                      const isCorrect = optLabel === q.answer || opt.startsWith(q.answer);

                                                      // Clean and check content for SVG
                                                      let optionContent = opt.substring(opt.indexOf('.') + 1).trim();
                                                      optionContent = optionContent.replace(/```svg/gi, '').replace(/```/g, '').trim();
                                                      const isSvgOption = optionContent.startsWith('<svg');
                                                      
                                                      return (
                                                          <div key={i} className={`p-3 rounded-xl text-sm border flex items-center justify-between ${
                                                              isCorrect 
                                                              ? 'bg-green-50 border-green-200 text-green-800 font-bold ring-1 ring-green-100' 
                                                              : 'bg-white border-gray-100 text-gray-600 opacity-70'
                                                          }`}>
                                                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                  <span className="flex-shrink-0 font-bold">{optLabel}.</span>
                                                                  {isSvgOption ? (
                                                                      <div className="w-16 h-16 sm:w-20 sm:h-20" dangerouslySetInnerHTML={{__html: optionContent}} />
                                                                  ) : (
                                                                      <span className="break-words">{optionContent || opt}</span>
                                                                  )}
                                                              </div>
                                                              {isCorrect && <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 ml-2" />}
                                                          </div>
                                                      );
                                                  })}
                                              </div>
                                          )}

                                          {/* Analysis */}
                                          <div className="bg-slate-50 rounded-xl p-4 text-sm border border-slate-100">
                                              <div className="flex items-center gap-2 mb-2">
                                                  <div className="bg-amber-100 text-amber-600 p-1 rounded"><Lightbulb size={12} /></div>
                                                  <span className="font-bold text-slate-700 text-xs">
                                                      {q.options ? '解析' : '参考范文与解析'}
                                                  </span>
                                                  {q.options && (
                                                      <span className="text-xs text-slate-500 font-mono ml-2 bg-white border border-slate-200 px-1.5 py-0.5 rounded">Answer: {q.answer}</span>
                                                  )}
                                              </div>
                                              
                                              {!q.options && (
                                                  <div className="mb-4 bg-white p-3 rounded border border-slate-200 prose prose-sm prose-indigo">
                                                      <strong className="text-xs text-indigo-600 block mb-1">参考范文：</strong>
                                                      <MarkdownRenderer content={q.answer} />
                                                  </div>
                                              )}

                                              <div className="prose prose-sm max-w-none text-slate-600">
                                                  <MarkdownRenderer content={q.analysis} />
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <MarkdownRenderer content={msg.text} />
                  )}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- RENDER LEVEL 2: FOLDER VIEW (Combined Subfolders + Messages) ---
  // If selectedCategoryId is NOT null, we are inside "Default" or a Specific Folder
  if (selectedCategoryId !== null) {
    const isUncategorized = selectedCategoryId === 'UNCATEGORIZED';
    const currentCategory = isUncategorized 
        ? { name: '默认收纳', id: 'UNCATEGORIZED', parentId: undefined } 
        : categories.find(c => c.id === selectedCategoryId);
    
    // Check if current category is already a subfolder (Level 2)
    const isMaxDepth = !isUncategorized && !!currentCategory?.parentId;

    // Get Direct Messages
    const currentMessages = isUncategorized
        ? modeMessages.filter(m => !m.categoryId || !categories.find(c => c.id === m.categoryId))
        : modeMessages.filter(m => m.categoryId === selectedCategoryId);

    // Get Direct Subfolders (Only if not in Uncategorized)
    const subFolders = isUncategorized 
        ? [] 
        : modeCategories.filter(c => c.parentId === selectedCategoryId);

    return (
      <div className="h-full flex flex-col bg-gray-50">
        <ConfirmationModal 
            isOpen={confirmState.isOpen}
            onClose={() => setConfirmState(prev => ({...prev, isOpen: false}))}
            onConfirm={confirmState.action}
            title={confirmState.title}
            message={confirmState.message}
            isDangerous={true}
            confirmText="删除文件夹"
        />

        {/* Folder Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 shadow-sm z-10">
           <div className="flex items-center gap-2">
            <button 
                onClick={handleNavigateUp}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                title="返回上一级"
            >
                <CornerUpLeft size={20} />
            </button>
            <div>
                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    {isUncategorized ? <FolderOpen className="text-blue-400" /> : <Folder className="text-blue-500 fill-blue-50" />}
                    {currentCategory?.name}
                </h2>
                {!isUncategorized && currentCategory?.parentId && (
                    <div className="text-xs text-gray-400 ml-1">
                        属于: {categories.find(c => c.id === currentCategory.parentId)?.name || '未知'}
                    </div>
                )}
            </div>
           </div>
           
           {!isUncategorized && (
               <div className="flex gap-2">
                 {/* Only show 'Create Subfolder' if NOT max depth */}
                 {!isMaxDepth && (
                    <button 
                        onClick={() => setIsCreatingCat(!isCreatingCat)}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                        <Plus size={16} />
                        <span className="hidden md:inline">新建子文件夹</span>
                    </button>
                 )}
                 
                 <button 
                    onClick={() => {
                        openConfirm("删除文件夹", `确定要删除“${currentCategory?.name}”吗？\n文件夹内的题目不会被删除，它们将变回“默认收纳”状态。`, () => { onDeleteCategory(selectedCategoryId); setSelectedCategoryId(null); });
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                 >
                    <Trash2 size={18} />
                 </button>
               </div>
           )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Create Subfolder Input */}
                {isCreatingCat && !isMaxDepth && (
                    <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-sm flex gap-2 animate-in slide-in-from-top-2">
                        <input 
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="输入子文件夹名称..."
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                        />
                        <button onClick={handleCreateCategory} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700">创建</button>
                    </div>
                )}

                {/* Subfolders Grid */}
                {subFolders.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Folder size={12} /> 子文件夹
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {subFolders.map(cat => (
                                <div 
                                    key={cat.id}
                                    onClick={() => setSelectedCategoryId(cat.id)}
                                    className="bg-white p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all flex items-center gap-3 group"
                                >
                                    <div className="bg-amber-50 p-2 rounded-lg text-amber-500 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                        <Folder size={18} className="fill-current bg-opacity-50" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-sm text-gray-800 truncate">{cat.name}</div>
                                        <div className="text-xs text-gray-400">{getMessageCount(cat.id)} 题</div>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-300" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages List */}
                <div>
                     {subFolders.length > 0 && <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 flex items-center gap-1"><BookOpen size={12} /> 题目列表 ({currentMessages.length})</h4>}
                     
                     {currentMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                            {subFolders.length === 0 ? (
                                <>
                                    <BookOpen size={48} className="mb-4 opacity-20" />
                                    <p>此处空空如也</p>
                                    {!isUncategorized && <p className="text-xs mt-1">您可以从对话中收藏题目到此文件夹</p>}
                                </>
                            ) : (
                                <p className="text-xs">此文件夹下没有直接的题目，请查看子文件夹。</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {currentMessages.map(msg => {
                                const isQuiz = msg.quizData && msg.quizData.length > 0;
                                const title = isQuiz 
                                    ? `[全真模拟卷] 内含 ${msg.quizData!.length} 道题目` 
                                    : getPreviewText(msg.text); // Use helper

                                return (
                                    <div 
                                    key={msg.id} 
                                    onClick={() => setSelectedMessageId(msg.id)}
                                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all group"
                                    >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${msg.role === 'user' ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                {msg.role === 'user' ? '我的提问' : 'AI 回答'}
                                            </span>
                                            {isQuiz && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-indigo-50 text-indigo-600 border-indigo-100 flex items-center gap-1">
                                                    <FileText size={10} />
                                                    模拟卷
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Calendar size={10} />
                                                {new Date(msg.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {msg.note && <div className="text-amber-500"><StickyNote size={14} className="fill-amber-100" /></div>}
                                    </div>
                                    <div className={`text-sm line-clamp-2 mb-2 font-medium ${isQuiz ? 'text-indigo-700 font-bold' : 'text-gray-700'}`}>
                                        {title}
                                    </div>
                                    
                                    {/* Quiz Preview */}
                                    {isQuiz && (
                                        <div className="text-xs text-gray-500 mb-2 bg-gray-50 p-2 rounded-lg border border-gray-100 flex items-start gap-1.5 line-clamp-1">
                                            <HelpCircle size={12} className="flex-shrink-0 mt-0.5 text-gray-400" />
                                            <span>Q1: {getPreviewText(msg.quizData![0].question)}</span>
                                        </div>
                                    )}

                                    {msg.note && <div className="bg-yellow-50 text-xs text-yellow-800 p-2 rounded-lg line-clamp-1 border border-yellow-100"><span className="font-bold mr-1">笔记:</span>{msg.note}</div>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- RENDER LEVEL 1: ROOT CATEGORY GRID ---
  // Only show categories where parentId is undefined (Root level)
  const rootCategories = modeCategories.filter(c => !c.parentId);
  const uncatCount = getMessageCount(); 

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <ConfirmationModal 
          isOpen={confirmState.isOpen}
          onClose={() => setConfirmState(prev => ({...prev, isOpen: false}))}
          onConfirm={confirmState.action}
          title={confirmState.title}
          message={confirmState.message}
          isDangerous={true}
      />
      
      {/* Top Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 pt-2">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            {[ExamMode.XING_CE, ExamMode.SHEN_LUN, ExamMode.MIAN_SHI].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setActiveTab(mode)}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === mode 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                    {MODE_LABELS[mode]}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
         <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-end mb-4">
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">我的知识库 (根目录)</h3>
                <button 
                  onClick={() => setIsCreatingCat(!isCreatingCat)}
                  className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                >
                    <Plus size={14} />
                    新建文件夹
                </button>
            </div>

            {/* Create Input (Root Level) */}
            {isCreatingCat && (
                <div className="mb-4 bg-white p-3 rounded-xl border border-blue-200 shadow-sm flex gap-2 animate-in slide-in-from-top-2">
                    <input 
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="输入分类名称（如：数量关系）"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                    />
                    <button onClick={handleCreateCategory} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700">创建</button>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {/* Default/Uncategorized Folder */}
                <div 
                    onClick={() => setSelectedCategoryId('UNCATEGORIZED')}
                    className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100 hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between h-32 md:h-40"
                >
                   <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                     <Tag size={20} />
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-800">默认收纳</h4>
                     <p className="text-xs text-gray-400 mt-1">{uncatCount} 条笔记</p>
                   </div>
                </div>

                {/* User Folders */}
                {rootCategories.map(cat => (
                    <div 
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between h-32 md:h-40"
                    >
                       <div className="bg-amber-50 w-10 h-10 rounded-lg flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                         <Folder size={20} className="fill-current bg-opacity-50" />
                       </div>
                       <div>
                         <h4 className="font-bold text-gray-800 truncate">{cat.name}</h4>
                         <p className="text-xs text-gray-400 mt-1">{getMessageCount(cat.id)} 条笔记</p>
                       </div>
                    </div>
                ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default NotebookView;