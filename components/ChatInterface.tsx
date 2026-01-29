'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Message, ExamMode, Category, QuizConfig } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import SaveToNotebookModal from './SaveToNotebookModal';
import QuizPaper from './QuizPaper';
import QuizConfigModal from './QuizConfigModal';
import UsageLimitBanner from './UsageLimitBanner';
import { MODE_LABELS } from '../constants';
import { generateQuiz } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { Send, Image as ImageIcon, Loader2, X, Bot, Sparkles, Plus, ArrowLeftRight, Star, StickyNote, PenLine, Check, Tag, ScrollText } from 'lucide-react';
import { MembershipInfo } from '../services/membershipService';

interface Props {
  messages: Message[];
  categories: Category[];
  isLoading: boolean;
  onSendMessage: (text: string, image?: string, quizConfig?: QuizConfig) => void;
  currentMode: ExamMode;
  onSaveMessage: (id: string, categoryId: string) => void;
  onRemoveMessage: (id: string) => void;
  onCreateCategory: (name: string) => string;
  onUpdateNote: (id: string, note: string) => void;
  membershipInfo?: MembershipInfo | null;
  onUpgradeClick: () => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const ChatInterface: React.FC<Props> = ({
  messages,
  categories,
  isLoading,
  onSendMessage,
  currentMode,
  onSaveMessage,
  onRemoveMessage,
  onCreateCategory,
  onUpdateNote,
  membershipInfo,
  onUpgradeClick,
  showToast
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [isQuizConfigOpen, setIsQuizConfigOpen] = useState(false);
  
  // Note editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteContent, setTempNoteContent] = useState('');

  // Save Modal state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [messageToSaveId, setMessageToSaveId] = useState<string | null>(null);
  const [saveMode, setSaveMode] = useState<ExamMode>(currentMode);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isQuizLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 48), 160);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputText]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        if (showToast) {
          showToast("图片大小不能超过 5MB", 'warning');
        }
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if ((!inputText.trim() && !selectedImage) || isLoading || isQuizLoading) return;
    onSendMessage(inputText, selectedImage || undefined);
    setInputText('');
    setSelectedImage(null);
    if (textareaRef.current) textareaRef.current.style.height = '48px';
  };

  const handleQuizConfigStart = (topic: string, count: number) => {
    if (isLoading || isQuizLoading) return;
    setIsQuizLoading(true);
    // Send a special message with config to App.tsx
    onSendMessage("start_quiz_mode", undefined, { topic, count });
    setIsQuizLoading(false); // App.tsx will set its own loading state
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Actions ---
  const handleBookmarkClick = (msg: Message) => {
    if (msg.isBookmarked) {
        onRemoveMessage(msg.id);
        if (showToast) showToast("已取消收藏", 'info');
    } else {
        setMessageToSaveId(msg.id);
        setSaveMode(msg.mode || currentMode);
        setSaveModalOpen(true);
    }
  };

  const startEditingNote = (msg: Message) => {
    setEditingNoteId(msg.id);
    setTempNoteContent(msg.note || '');
  };

  const saveNote = (id: string) => {
    onUpdateNote(id, tempNoteContent);
    setEditingNoteId(null);
  };

  const getSuggestions = () => {
    switch (currentMode) {
      case ExamMode.XING_CE:
        return ["出几道2023年国考常识真题", "如何快速计算增长率？", "这道图形推理题选什么？"];
      case ExamMode.SHEN_LUN:
        return ["关于'新质生产力'的申论金句", "帮我拟一个乡村振兴大作文提纲", "润色这段文章语言..."];
      case ExamMode.MIAN_SHI:
        return ["模拟一道社会现象类面试题", "综合分析题答题思路", "人际关系题怎么回答？"];
      default:
        return [];
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#fcfaf8] md:rounded-tl-2xl overflow-hidden">

      {/* Quiz Configuration Modal */}
      <QuizConfigModal
         isOpen={isQuizConfigOpen}
         onClose={() => setIsQuizConfigOpen(false)}
         onStart={handleQuizConfigStart}
         currentMode={currentMode}
      />

      {/* Save Modal */}
      <SaveToNotebookModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSave={(catId) => {
            if (messageToSaveId) onSaveMessage(messageToSaveId, catId);
        }}
        onCreateCategory={onCreateCategory}
        categories={categories}
        currentMode={saveMode}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth scrollbar-hide">
        {/* Content Wrapper for Alignment - Matches Input Box Width (max-w-3xl) */}
        <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-8 min-h-full">
            
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center min-h-[50vh]">
                 <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-6">
                    <Sparkles size={28} className="text-stone-400" />
                 </div>
                 <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">有编</h3>
                 <p className="text-stone-500 max-w-sm mb-10 leading-relaxed text-sm">
                    您的全能备考助手。<br/>
                    精通{currentMode === 'XING_CE' ? '行测逻辑与数学' : currentMode === 'SHEN_LUN' ? '申论写作与政策' : '面试技巧与模拟'}，随时为您解答。
                 </p>
                 
                 <div className="grid grid-cols-1 gap-3 w-full max-w-md">
                    {getSuggestions().map((s, i) => (
                      <button 
                        key={i} 
                        onClick={() => setInputText(s)}
                        className="text-sm bg-white border border-stone-200 px-5 py-3 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all text-left shadow-sm text-stone-600"
                      >
                        {s}
                      </button>
                    ))}
                 </div>
              </div>
            )}

            {messages.map((msg, index) => {
              if (msg.isSystem) {
                 return (
                   <div key={msg.id} className="flex justify-center py-4 animate-in fade-in zoom-in-95 duration-300">
                     <span className="text-xs font-medium text-stone-400 tracking-wider uppercase px-2 bg-[#fcfaf8] z-10">{msg.text}</span>
                     {/* <div className="absolute w-full border-t border-stone-100 top-1/2 left-0 -z-0"></div> */}
                   </div>
                 );
              }


              const isEditing = editingNoteId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex w-full group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col max-w-[100%] gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start w-full'}`}>
                    
                    <div className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} w-full`}>
                        
                        {/* Avatars */}
                        {/* <div className={`flex-shrink-0 w-8 h-8 rounded mt-1 flex items-center justify-center ${
                        msg.role === 'user'
                            ? 'bg-stone-200 text-stone-600'
                            : 'bg-stone-200 text-stone-600'
                        }`}>
                            {msg.role === 'user' ? <div className="text-xs font-bold">ME</div> : <div className="text-xs font-bold">AI</div>}
                        </div> */}

                        <div className="flex flex-col min-w-0 flex-1 max-w-full">
                        {/* Render QuizPaper if quizData exists */}
                        {msg.quizData && msg.quizData.length > 0 ? (
                            <div className="space-y-3">
                              {/* Show the message text above the quiz */}
                              <div className="text-[15px] leading-relaxed text-stone-800 w-full font-serif-sc">
                                <MarkdownRenderer content={msg.text} />
                              </div>
                              <QuizPaper questions={msg.quizData} mode={msg.mode || ExamMode.XING_CE} />
                            </div>
                        ) : (
                            <div
                                className={`text-[15px] leading-relaxed break-words relative ${
                                msg.role === 'user'
                                    ? 'bg-[#f0f0ed] text-stone-800 rounded-xl px-4 py-2.5 max-w-fit ml-auto'
                                    : 'text-stone-800 w-full font-serif-sc'
                                } ${msg.isBookmarked ? 'ring-2 ring-amber-200 ring-offset-2 ring-offset-[#fcfaf8] rounded' : ''}`}
                            >
                                {msg.image && (
                                <div className="mb-3 overflow-hidden rounded-lg border border-stone-200">
                                    <img 
                                    src={msg.image} 
                                    alt="User upload" 
                                    className="max-w-full h-auto max-h-60 object-contain mx-auto" 
                                    />
                                </div>
                                )}
                                {msg.role !== 'user' ? (
                                    <MarkdownRenderer content={msg.text} />
                                ) : (
                                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                                )}
                            </div>
                        )}

                        {/* Action Bar - Hidden while streaming (if it's the last message and loading) */}
                        {!(isLoading && index === messages.length - 1) && (
                            <div className={`flex items-center gap-1 mt-1 transition-opacity ${
                                msg.role === 'user' ? 'justify-end pr-1' : 'justify-start pl-1'
                            }`}>
                                
                                <button 
                                    onClick={() => handleBookmarkClick(msg)}
                                    className={`p-1.5 rounded transition-colors ${
                                        msg.isBookmarked 
                                            ? 'text-amber-600 bg-amber-50' 
                                            : 'text-stone-400 hover:text-amber-600 hover:bg-stone-100'
                                    }`}
                                    title={msg.isBookmarked ? "取消收藏" : "加入笔记本"}
                                >
                                    <Star size={14} className={msg.isBookmarked ? "fill-current" : ""} />
                                </button>

                                <button 
                                    onClick={() => startEditingNote(msg)}
                                    className={`p-1.5 rounded transition-colors ${
                                        msg.note 
                                            ? 'text-stone-800 bg-stone-200' 
                                            : 'text-stone-400 hover:text-stone-800 hover:bg-stone-100'
                                    }`}
                                    title="添加笔记"
                                >
                                    <PenLine size={14} />
                                </button>
                            </div>
                        )}
                      </div>
                    </div>

                    {/* Sticky Note */}
                    {(msg.note || isEditing) && (
                        <div className={`relative mt-1 ml-2 md:ml-12 max-w-[85vw] md:max-w-sm w-full animate-in slide-in-from-top-1 fade-in duration-300 ${msg.role === 'user' ? 'mr-2 md:mr-12 ml-auto' : ''}`}>
                            <div className="bg-[#fff9e6] border border-[#f5e6b3] rounded-lg p-3 shadow-sm text-sm relative text-stone-700">
                                {isEditing ? (
                                    <div className="flex flex-col gap-2">
                                        <textarea
                                            value={tempNoteContent}
                                            onChange={(e) => setTempNoteContent(e.target.value)}
                                            placeholder="输入笔记..."
                                            className="w-full bg-transparent border-b border-[#e6d5a0] focus:border-stone-400 p-1 text-sm focus:outline-none min-h-[60px] resize-none"
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => setEditingNoteId(null)}
                                                className="text-xs text-stone-500 hover:text-stone-700 px-2"
                                            >
                                                取消
                                            </button>
                                            <button 
                                                onClick={() => saveNote(msg.id)}
                                                className="text-xs bg-stone-800 text-white px-3 py-1 rounded hover:bg-black transition-colors"
                                            >
                                                保存
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        className="cursor-pointer hover:opacity-80 flex gap-2"
                                        onClick={() => startEditingNote(msg)}
                                    >
                                        <StickyNote size={14} className="text-[#d4c07b] flex-shrink-0 mt-0.5" />
                                        <span className="font-serif italic">{msg.note}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading States */}
            {(isLoading || isQuizLoading) && (
              <div className="flex justify-start w-full pl-1">
                   {isQuizLoading ? (
                       <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 px-5 py-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                         <div className="flex items-center gap-3 text-amber-800">
                            <ScrollText size={20} className="animate-pulse" />
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-semibold font-serif">
                                正在准备{currentMode === ExamMode.SHEN_LUN ? '申论' : currentMode === ExamMode.MIAN_SHI ? '面试' : '行测'}模拟题...
                              </span>
                              <span className="text-xs text-amber-700">AI 正在精心挑选题目，请稍候</span>
                            </div>
                         </div>
                       </div>
                   ) : (
                       /* Realistic Horizontal Writing Animation */
                       <div className="p-2 pl-1 animate-in fade-in zoom-in-95 duration-300">
                           <style>{`
                             @keyframes drawStrokeHorizontal {
                               0% { stroke-dashoffset: 28; opacity: 0; }
                               10% { opacity: 1; }
                               90% { opacity: 1; }
                               100% { stroke-dashoffset: 0; opacity: 0; }
                             }
                             @keyframes penMoveHorizontal {
                               0% { transform: translate(0, 0); }
                               25% { transform: translate(6px, -2px); }
                               50% { transform: translate(12px, 0px); }
                               75% { transform: translate(18px, -2px); }
                               100% { transform: translate(24px, 0px); }
                             }
                             .writing-path-horizontal {
                               stroke-dasharray: 28;
                               stroke-dashoffset: 28;
                               animation: drawStrokeHorizontal 1s infinite linear;
                             }
                             .writing-pen-horizontal {
                               animation: penMoveHorizontal 1s infinite linear;
                             }
                           `}</style>
                           <div className="relative w-16 h-10 flex items-center">
                               {/* The Horizontal Ink Trail */}
                               <svg className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-full" viewBox="0 0 30 16" style={{overflow: 'visible'}}>
                                   <path 
                                      d="M 2 8 Q 6 4, 10 8 T 18 8 T 26 8" 
                                      fill="none" 
                                      stroke="#57534e" 
                                      strokeWidth="2" 
                                      strokeLinecap="round" 
                                      className="writing-path-horizontal" 
                                   />
                               </svg>
                               
                               {/* Smaller Realistic Pen SVG */}
                               <div className="writing-pen-horizontal absolute top-0 left-0 -mt-6 -ml-2 z-10 pointer-events-none">
                                   <svg width="18" height="30" viewBox="0 0 24 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(45deg)', transformOrigin: '12px 40px', filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.1))' }}>
                                       {/* Pen Body */}
                                       <path d="M7 0H17L16 28H8L7 0Z" fill="#44403c"/>
                                       <path d="M7 0H9V28H8L7 0Z" fill="#57534e"/> {/* Highlight */}
                                       
                                       {/* Pen Grip/Collar */}
                                       <rect x="7" y="26" width="10" height="4" fill="#d6d3d1"/>
                                       
                                       {/* Pen Nib */}
                                       <path d="M8 30L12 40L16 30H8Z" fill="#e7e5e4"/>
                                       <path d="M11.5 30L12 36L12.5 30" fill="#78716c"/> {/* Nib detail */}
                                       <circle cx="12" cy="40" r="0.5" fill="#292524"/> {/* Tip point */}
                                   </svg>
                               </div>
                           </div>
                       </div>
                   )}
              </div>
            )}
            <div ref={messagesEndRef} className="h-4 w-full" />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 z-10 w-full bg-[#fcfaf8] pb-4">
            <div className="w-full max-w-3xl mx-auto px-4">
            
            {selectedImage && (
                <div className="relative mb-2 inline-block group animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <div className="absolute -top-2 -right-2 bg-stone-800 text-white rounded-full p-0.5 cursor-pointer shadow-md" onClick={() => setSelectedImage(null)}>
                        <X size={14} />
                    </div>
                    <img src={selectedImage} alt="Preview" className="h-16 w-auto object-cover rounded-lg border border-stone-200 shadow-sm" />
                </div>
            )}

            {/* Claude-style Input Box */}
            <div className="relative bg-white rounded-2xl border border-stone-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus-within:shadow-[0_4px_12px_rgba(0,0,0,0.08)] focus-within:border-stone-300 transition-all duration-300">
                <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder={currentMode === ExamMode.XING_CE ? "来道真题或输入题目..." : "输入申论主题或面试问题..."}
                    className="w-full bg-transparent border-none focus:ring-0 resize-none py-4 pl-4 pr-12 text-[16px] outline-none text-stone-800 placeholder:text-stone-400 leading-6 max-h-[200px]"
                    style={{ minHeight: '56px' }}
                />

                <div className="flex items-center justify-between px-2 pb-2">
                    <div className="flex gap-1">
                        <button
                            onClick={() => setIsQuizConfigOpen(true)}
                            className="p-2 text-stone-400 hover:text-amber-600 hover:bg-stone-50 rounded-lg transition-colors flex items-center gap-1 group"
                            title="生成试卷"
                        >
                            <ScrollText size={18} />
                            <span className="text-xs font-medium hidden group-hover:block animate-in fade-in slide-in-from-left-1">模拟考</span>
                        </button>
                        
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-colors"
                            title="上传图片"
                        >
                            <ImageIcon size={18} />
                        </button>
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={(!inputText.trim() && !selectedImage) || isLoading || isQuizLoading}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                            (!inputText.trim() && !selectedImage) || isLoading || isQuizLoading
                            ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                            : 'bg-[#da7756] text-white shadow-md hover:bg-[#c66342]'
                        }`}
                    >
                        {(isLoading || isQuizLoading) ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
            </div>
            
            <div className="text-center mt-2">
                <p className="text-[10px] text-stone-300">
                    AI 可能产生错误信息，请以官方教材为准
                </p>
            </div>
            </div>
      </div>
    </div>
  );
};

export default ChatInterface;