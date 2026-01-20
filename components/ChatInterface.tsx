import React, { useRef, useEffect, useState } from 'react';
import { Message, ExamMode, Category, QuizConfig } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import SaveToNotebookModal from './SaveToNotebookModal';
import QuizPaper from './QuizPaper';
import QuizConfigModal from './QuizConfigModal';
import { MODE_LABELS } from '../constants';
import { generateQuiz } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { Send, Image as ImageIcon, Loader2, X, Bot, Sparkles, Plus, ArrowLeftRight, Star, StickyNote, PenLine, Check, Tag, ScrollText } from 'lucide-react';

interface Props {
  messages: Message[];
  categories: Category[];
  isLoading: boolean;
  onSendMessage: (text: string, image?: string, quizConfig?: QuizConfig) => void;
  currentMode: ExamMode;
  onSaveMessage: (id: string, categoryId: string) => void; 
  onCreateCategory: (name: string) => string;
  onUpdateNote: (id: string, note: string) => void;
}

const ChatInterface: React.FC<Props> = ({ 
  messages, 
  categories,
  isLoading, 
  onSendMessage, 
  currentMode, 
  onSaveMessage,
  onCreateCategory,
  onUpdateNote
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
      const newHeight = Math.min(Math.max(scrollHeight, 44), 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputText]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("图片大小不能超过 5MB");
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
    if (textareaRef.current) textareaRef.current.style.height = '44px';
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
  const handleBookmarkClick = (msgId: string) => {
     setMessageToSaveId(msgId);
     setSaveModalOpen(true);
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

  const getModeColor = () => {
     switch (currentMode) {
      case ExamMode.XING_CE: return 'bg-indigo-600';
      case ExamMode.SHEN_LUN: return 'bg-emerald-600';
      case ExamMode.MIAN_SHI: return 'bg-amber-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-white md:rounded-t-2xl shadow-sm border-x border-t border-gray-100 overflow-hidden">
      
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
        currentMode={currentMode}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
             <div className={`w-16 h-16 rounded-2xl ${getModeColor()} bg-opacity-10 flex items-center justify-center mb-4 animate-bounce-slow`}>
                <Bot size={32} className={`text-${currentMode === 'SHEN_LUN' ? 'emerald' : currentMode === 'MIAN_SHI' ? 'amber' : 'indigo'}-600`} />
             </div>
             <h3 className="text-lg font-bold text-gray-800 mb-2">我是你的公考助手</h3>
             <p className="text-sm text-gray-500 max-w-xs mb-8">
                基于 Gemini 3 · 内置真题库 · 深度解析<br/>
                <span className="text-xs text-gray-400 mt-1 block">精通{currentMode === 'XING_CE' ? '行测逻辑与数学' : currentMode === 'SHEN_LUN' ? '申论写作与政策' : '面试技巧与模拟'}</span>
             </p>
             
             <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                {getSuggestions().map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => setInputText(s)}
                    className="group flex items-center justify-between text-sm bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl hover:bg-blue-50 hover:border-blue-100 hover:text-blue-700 transition-all text-left shadow-sm"
                  >
                    <span>{s}</span>
                    <Sparkles size={14} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                  </button>
                ))}
             </div>
          </div>
        )}

        {messages.map((msg) => {
          if (msg.isSystem) {
             return (
               <div key={msg.id} className="flex justify-center py-2 animate-in fade-in zoom-in-95 duration-300">
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 border border-gray-200 rounded-full">
                    <ArrowLeftRight size={12} className="text-gray-400" />
                    <span className="text-[11px] font-medium text-gray-500">{msg.text}</span>
                 </div>
               </div>
             );
          }

          const isEditing = editingNoteId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex w-full group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex flex-col max-w-[100%] md:max-w-[90%] gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                <div className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} w-full`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mt-auto ${
                    msg.role === 'user' 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white' 
                        : 'bg-white border border-gray-100 text-blue-600'
                    }`}>
                        {msg.role === 'user' ? <div className="text-xs font-bold">ME</div> : <Sparkles size={16} />}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1 max-w-full">
                    {/* Render QuizPaper if quizData exists */}
                    {msg.quizData ? (
                        <QuizPaper questions={msg.quizData} mode={msg.mode || ExamMode.XING_CE} />
                    ) : (
                        <div
                            className={`px-4 py-3 shadow-sm text-[15px] leading-relaxed break-words relative ${
                            msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-2xl rounded-br-none max-w-fit ml-auto'
                                : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-none overflow-x-auto w-full'
                            } ${msg.isBookmarked ? 'ring-2 ring-amber-200 ring-offset-1' : ''}`}
                        >
                            {msg.image && (
                            <div className="mb-3 overflow-hidden rounded-lg bg-black/5">
                                <img 
                                src={msg.image} 
                                alt="User upload" 
                                className="max-w-full h-auto max-h-60 object-contain mx-auto" 
                                />
                            </div>
                            )}
                            {msg.role === 'model' ? (
                                <MarkdownRenderer content={msg.text} />
                            ) : (
                                <div className="whitespace-pre-wrap">{msg.text}</div>
                            )}
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className={`flex items-center gap-1 mt-1 px-1 transition-opacity ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                    } opacity-0 group-hover:opacity-100`}>
                        
                        <span className="text-[10px] text-gray-400 mr-2 flex items-center gap-2">
                           {msg.mode && (
                              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200 flex items-center gap-0.5">
                                 <Tag size={10} />
                                 {MODE_LABELS[msg.mode]}
                              </span>
                           )}
                           {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>

                        <button 
                            onClick={() => handleBookmarkClick(msg.id)}
                            className={`p-1 rounded-md transition-colors ${
                                msg.isBookmarked 
                                    ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' 
                                    : 'text-gray-400 hover:text-amber-500 hover:bg-gray-100'
                            }`}
                            title={msg.isBookmarked ? "已收藏（点击修改分类）" : "加入笔记本"}
                        >
                            <Star size={14} className={msg.isBookmarked ? "fill-amber-500" : ""} />
                        </button>

                        <button 
                            onClick={() => startEditingNote(msg)}
                            className={`p-1 rounded-md transition-colors ${
                                msg.note 
                                    ? 'text-blue-500 bg-blue-50 hover:bg-blue-100' 
                                    : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100'
                            }`}
                            title="添加/编辑笔记"
                        >
                            <PenLine size={14} />
                        </button>
                    </div>
                  </div>
                </div>

                {/* Sticky Note */}
                {(msg.note || isEditing) && (
                    <div className={`relative mt-1 ml-10 max-w-sm w-full animate-in slide-in-from-top-2 fade-in duration-300 ${msg.role === 'user' ? 'mr-10 ml-auto' : ''}`}>
                        <div className={`absolute -top-2 w-0.5 h-3 bg-yellow-200 ${msg.role === 'user' ? 'right-6' : 'left-6'}`}></div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-sm text-sm relative">
                            <div className="absolute top-2 right-2 text-yellow-300">
                                <StickyNote size={16} />
                            </div>
                            
                            {isEditing ? (
                                <div className="flex flex-col gap-2">
                                    <textarea
                                        value={tempNoteContent}
                                        onChange={(e) => setTempNoteContent(e.target.value)}
                                        placeholder="输入笔记（例如：重点公式、易错点...）"
                                        className="w-full bg-white/50 border border-yellow-200 rounded p-2 text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 min-h-[60px]"
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => setEditingNoteId(null)}
                                            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                                        >
                                            取消
                                        </button>
                                        <button 
                                            onClick={() => saveNote(msg.id)}
                                            className="flex items-center gap-1 text-xs bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-1 rounded-md font-medium transition-colors"
                                        >
                                            <Check size={12} />
                                            保存
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    className="pr-6 text-gray-700 whitespace-pre-wrap cursor-pointer hover:text-gray-900"
                                    onClick={() => startEditingNote(msg)}
                                    title="点击编辑笔记"
                                >
                                    <span className="font-bold text-yellow-700 text-xs block mb-1">我的笔记：</span>
                                    {msg.note}
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
          <div className="flex justify-start w-full animate-pulse">
             <div className="flex max-w-[80%] gap-2">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-blue-600 shadow-sm mt-auto">
                 <Sparkles size={16} />
               </div>
               <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-3">
                 {isQuizLoading ? (
                     <div className="flex items-center gap-2 text-gray-600">
                        <ScrollText size={18} className="animate-pulse" />
                        <span className="text-sm font-medium">正在AI生成模拟卷...</span>
                     </div>
                 ) : (
                     <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                     </div>
                 )}
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-px w-full" />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 z-10 w-full">
            <div className="w-full max-w-5xl mx-auto p-3 md:p-4 pb-[calc(12px+env(safe-area-inset-bottom))] md:pb-6">
            
            {selectedImage && (
                <div className="relative mb-3 inline-block group animate-in slide-in-from-bottom-5 fade-in duration-300">
                <div className="absolute -top-2 -right-2 bg-white rounded-full shadow-md z-10 cursor-pointer hover:bg-red-50" onClick={() => setSelectedImage(null)}>
                    <X size={20} className="text-gray-500 hover:text-red-500 p-0.5" />
                </div>
                <img src={selectedImage} alt="Preview" className="h-20 w-auto object-cover rounded-xl border border-gray-200 shadow-sm" />
                </div>
            )}

            <div className="flex items-end gap-2 bg-gray-50 p-1.5 rounded-[26px] border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all shadow-inner">
                {/* Quiz Button */}
                <button
                    onClick={() => setIsQuizConfigOpen(true)}
                    className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors flex-shrink-0 h-[44px] w-[44px] flex items-center justify-center relative group"
                    title="生成刷题试卷"
                >
                    <ScrollText size={22} />
                </button>

                <div className="w-px h-6 bg-gray-200 my-auto"></div>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0 h-[44px] w-[44px] flex items-center justify-center"
                    title="上传题目"
                >
                    {selectedImage ? <ImageIcon size={22} className="text-blue-600" /> : <Plus size={24} />}
                </button>

                <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder={currentMode === ExamMode.XING_CE ? "来道真题或输入题目..." : "输入申论主题或面试问题..."}
                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2.5 px-1 text-[15px] outline-none text-gray-800 placeholder:text-gray-400 leading-6"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                />

                <button
                    onClick={handleSend}
                    disabled={(!inputText.trim() && !selectedImage) || isLoading || isQuizLoading}
                    className={`rounded-full flex-shrink-0 transition-all duration-200 h-[44px] w-[44px] flex items-center justify-center ${
                        (!inputText.trim() && !selectedImage) || isLoading || isQuizLoading
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-105 active:scale-95'
                    }`}
                >
                    {(isLoading || isQuizLoading) ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className={(!inputText.trim() && !selectedImage) ? "ml-0.5" : "ml-0.5 translate-x-[-1px]"} />}
                </button>
            </div>
            </div>
      </div>
    </div>
  );
};

export default ChatInterface;