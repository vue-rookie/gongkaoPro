'use client';

import React, { useState, useEffect } from 'react';
import { QuizQuestion, ExamMode } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Lightbulb, Trophy, BookOpen, Clock, FileCheck, Play, BookText, PenTool, Maximize2, Minimize2 } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import ConfirmationModal from './ConfirmationModal';

interface Props {
  questions: QuizQuestion[];
  mode: ExamMode;
}

const QuizPaper: React.FC<Props> = ({ questions, mode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // State
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0); // in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [hasStarted, setHasStarted] = useState(false); // start mask

  // Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Safety check: return null if no questions
  if (!questions || questions.length === 0) {
    return null;
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) {
    return null;
  }

  const total = questions.length;
  const isLast = currentIndex === total - 1;
  const isFirst = currentIndex === 0;

  const isEssayType = mode === ExamMode.SHEN_LUN || mode === ExamMode.MIAN_SHI;
  const hasMaterial = !!currentQ.material;

  const processContent = (content: string) => {
    if (!content) return "";
    let processed = content;
    // Remove "svg" word before <svg> tag
    processed = processed.replace(/\bsvg\s*(<svg)/gi, '$1');
    // Wrap <svg> in ```svg block if not already
    processed = processed.replace(/<svg[\s\S]*?<\/svg>/gi, (match, offset) => {
         const before = processed.substring(Math.max(0, offset - 10), offset);
         if (before.includes('```')) return match;
         return '\n```svg\n' + match + '\n```\n';
    });
    return processed;
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && hasStarted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, hasStarted]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isFullscreen) {
            setIsFullscreen(false);
        }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Improved Option Parser to handle various AI output formats
  const parseOption = (opt: string) => {
    // Regex matches: Start of string -> (Letter) -> optional space -> (separator: . or ．or 、) -> optional space -> (Rest)
    const match = opt.match(/^([A-Z])\s*[.．、]\s*(.*)/s);
    if (match) {
        return { label: match[1], content: match[2].trim() };
    }
    // Fallback: If no label found, return empty label and full content
    return { label: '', content: opt };
  };

  // ROBUST HELPER: Determines the definitive Label (A, B, C...) for an option
  const getOptionLabel = (optRaw: string, index: number) => {
      const { label } = parseOption(optRaw);
      return label || String.fromCharCode(65 + index); // Fallback to A, B, C... based on index
  };

  const handleOptionClick = (optionRaw: string, index: number) => {
    if (isSubmitted || !hasStarted || isEssayType) return; 
    
    // Use robust label derivation
    const label = getOptionLabel(optionRaw, index);
    
    setAnswers(prev => ({ ...prev, [currentQ.id]: label }));
  };

  const handleTextAnswerChange = (text: string) => {
      if (isSubmitted || !hasStarted) return;
      setAnswers(prev => ({ ...prev, [currentQ.id]: text }));
  };

  const handleSubmitClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = () => {
    setIsTimerRunning(false);
    setIsSubmitted(true);
    let correctCount = 0;
    if (!isEssayType) {
        questions.forEach(q => {
            const userAns = answers[q.id];
            if (userAns && q.answer && (userAns === q.answer || q.answer.startsWith(userAns))) {
                correctCount++;
            }
        });
        setScore(correctCount);
    }
    setCurrentIndex(0);
  };

  const changePage = (newIndex: number) => {
    if (isAnimating) return;
    setDirection(newIndex > currentIndex ? 'right' : 'left');
    setIsAnimating(true);
    setTimeout(() => {
        setCurrentIndex(newIndex);
        setIsAnimating(false);
    }, 300);
  };

  const getOptionStyle = (optionRaw: string, index: number) => {
    const optionLabel = getOptionLabel(optionRaw, index);
    
    const userAnswer = answers[currentQ.id];
    
    if (!isSubmitted) {
        if (userAnswer === optionLabel) {
            return "bg-stone-800 border-stone-800 text-white shadow-md transform scale-[1.01]";
        }
        return "bg-white border-stone-300 hover:border-stone-500 hover:bg-stone-50 text-stone-700";
    }

    const correctAnswer = currentQ.answer || '';
    const isThisCorrect = optionLabel === correctAnswer || optionRaw.startsWith(correctAnswer);
    const isThisSelected = userAnswer === optionLabel;

    if (isThisCorrect) return "bg-emerald-50 border-emerald-600 text-emerald-800 font-bold shadow-sm";
    if (isThisSelected && !isThisCorrect) return "bg-red-50 border-red-600 text-red-800 font-bold shadow-sm";
    return "opacity-60 bg-stone-50 border-stone-200 text-stone-400"; 
  };

  const getDotClass = (index: number) => {
    if (index === currentIndex) return 'bg-stone-600 w-4';
    
    const q = questions[index];
    const ans = answers[q.id];

    if (isSubmitted) {
      if (!q.options) return 'bg-stone-300';
      if (ans === q.answer) return 'bg-emerald-400';
      return 'bg-red-400';
    } else {
      if (ans) return 'bg-stone-400';
      return 'bg-stone-200';
    }
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className={`font-sans select-none transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#e6e4dc] p-0' : 'w-full my-6 perspective-1000 relative'}`}>
      <style>{`
        .paper-texture {
          background-color: #fffdf6;
          background-image: linear-gradient(#f0f0f0 1px, transparent 1px);
          background-size: 100% 2.5rem; 
        }
        .stamp-animation {
          animation: stampIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
          transform: scale(3) rotate(-15deg);
        }
        @keyframes stampIn {
          0% { opacity: 0; transform: scale(3) rotate(-15deg); }
          50% { opacity: 1; }
          100% { opacity: 0.8; transform: scale(1) rotate(-15deg); }
        }
        .sealed-line {
          border-right: 2px dashed #d1d5db;
          position: relative;
        }
        .sealed-line::after {
          content: "绝密 ★ 启用前";
          position: absolute;
          top: 50%;
          right: -14px;
          transform: translateY(-50%) rotate(90deg);
          font-family: "Noto Serif SC", serif;
          font-weight: bold;
          font-size: 14px;
          color: #9ca3af;
          letter-spacing: 0.5em;
          white-space: nowrap;
          background: #e6e4dc;
          padding: 0 10px;
        }
      `}</style>
      <div 
        className={`relative overflow-hidden flex flex-col transition-all duration-500 ${
            isFullscreen 
            ? 'h-full w-full rounded-none border-none shadow-none bg-[#fffdf6]' 
            : `rounded-sm shadow-md border border-stone-300 bg-[#fffdf6] ${isEssayType ? 'min-h-[600px]' : 'min-h-[450px]'}`
        }`}
      >
        
        {/* Header */}
        <div className="border-b border-stone-100 px-4 py-3 flex justify-between items-center relative bg-[#fcfaf8] shrink-0 z-10">
          <div className="flex items-center gap-2 font-bold text-stone-700 font-serif">
             {isSubmitted ? (
                 <div className="flex items-center gap-2 text-stone-800">
                     <FileCheck size={18} />
                     <span>成绩单</span>
                 </div>
             ) : (
                 <div className="flex items-center gap-2">
                    <BookOpen size={18} />
                    <span className="text-sm">{isEssayType ? '申论模拟' : '行测模拟'}</span>
                 </div>
             )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
              {isSubmitted ? (
                 <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1.5 text-xs font-medium text-stone-400">
                        <Clock size={14} />
                        <span>用时: {formatTime(timeElapsed)}</span>
                     </div>
                     {!isEssayType && (
                        <div className="flex items-center gap-1.5 text-lg font-bold text-emerald-600 bg-white px-3 py-1 rounded-lg border border-stone-100">
                            <Trophy size={18} />
                            <span>{score} / {total}</span>
                        </div>
                     )}
                 </div>
              ) : (
                 <div className="flex items-center gap-3">
                     <div className={`flex items-center gap-1.5 bg-white border border-stone-200 px-2 py-1 rounded text-stone-600 font-mono text-sm font-bold transition-colors ${hasStarted ? '' : 'opacity-50'}`}>
                         <Clock size={14} className={timeElapsed > 300 && hasStarted ? "text-red-500 animate-pulse" : "text-stone-400"} />
                         {formatTime(timeElapsed)}
                     </div>
                     <div className="text-xs font-mono bg-stone-100 px-2 py-1 rounded text-stone-500">
                        {currentIndex + 1} / {total}
                     </div>
                 </div>
              )}

              {/* Divider */}
              <div className="w-px h-4 bg-stone-200 hidden md:block"></div>

              {/* Fullscreen Toggle */}
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                title={isFullscreen ? "退出全屏 (ESC)" : "全屏模式"}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-0 relative overflow-hidden flex">
            
            {/* Sealed Line (Fullscreen Only) */}
            {isFullscreen && (
                <div className="w-12 bg-[#e6e4dc] sealed-line flex-shrink-0 hidden md:block"></div>
            )}

            {/* Start Mask */}
            {!hasStarted && !isSubmitted && (
                <div className="absolute inset-0 z-11 bg-[#fcfaf8]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                    <div className="bg-white p-6 rounded-sm shadow-xl border border-stone-200 max-w-xs w-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#8c2a2a] to-[#b52b2b]"></div>
                        <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-500 border border-stone-100">
                            <Clock size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-stone-800 mb-2 font-serif tracking-widest">全真模拟</h3>
                        <p className="text-stone-500 text-xs mb-6 font-serif leading-loose opacity-70">
                            本卷共 {questions.length} 道题<br/>
                            {isEssayType ? '沉浸式作答 · 智能批改' : '限时训练 · 真实考场体验'}
                        </p>
                        <button 
                            onClick={() => setHasStarted(true)}
                            className="w-full bg-[#8c2a2a] hover:bg-[#7a2424] text-white text-sm font-bold py-2.5 px-4 rounded shadow-md shadow-red-50 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 font-serif tracking-[0.2em]"
                        >
                            <Play size={14} className="fill-white" />
                            开始考试
                        </button>
                    </div>
                </div>
            )}

            <div 
                className={`flex-1 flex flex-col md:flex-row transition-all duration-300 ease-out transform overflow-hidden ${
                    isAnimating 
                    ? (direction === 'right' ? '-translate-x-10 opacity-0' : 'translate-x-10 opacity-0')
                    : 'translate-x-0 opacity-100'
                } ${!hasStarted ? 'blur-sm opacity-50 pointer-events-none' : ''}`}
            >
                {/* Material Section - Split View Logic */}
                {hasMaterial && (
                    <div className={`
                        border-b md:border-b-0 md:border-r border-stone-300 bg-[#f4f2ec] p-6 overflow-y-auto relative
                        ${isFullscreen ? 'md:w-1/2 h-full' : 'max-h-[30vh] md:max-h-[40vh]'}
                    `}>
                        <div className="flex items-center gap-2 text-[#8c2a2a] font-bold mb-4 font-serif border-b-2 border-[#8c2a2a]/20 pb-2">
                             <BookText size={20} />
                             <span>给定资料</span>
                        </div>
                        <div className="prose prose-stone max-w-none leading-loose text-justify text-stone-800 font-serif-sc text-[15px] md:text-[16px]">
                             {currentQ.material?.split('\n').map((para, i) => (
                                 <p key={i} className="mb-4 last:mb-0 indent-[2em]">{para}</p>
                             ))}
                        </div>
                    </div>
                )}

                <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#fffdf6] relative">
                    {/* Paper Texture Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-30" 
                         style={{backgroundImage: 'linear-gradient(#00000005 1px, transparent 1px)', backgroundSize: '100% 2rem'}}>
                    </div>

                    {/* Max width container */}
                    <div className={`mx-auto h-full flex flex-col ${isFullscreen ? 'max-w-4xl' : 'w-full'}`}>
                        {/* Question */}
                        <div className="mb-8 relative z-10">
                            <div className="flex gap-3 mb-5">
                                <span className="flex-shrink-0 font-bold text-base font-serif text-[#8c2a2a] mt-1">
                                    {currentIndex + 1}.
                                </span>
                                <div className="flex-1 text-stone-800 text-[15px] md:text-[16px] leading-loose font-bold font-serif-sc tracking-wide">
                                    <MarkdownRenderer content={processContent(currentQ.question)} className="prose-sm" />
                                </div>
                            </div>
                            
                            {/* Options */}
                            {!isEssayType && currentQ.options && currentQ.options.length > 0 && (
                                <div className={`grid gap-3 ${currentQ.options.some(o => o.includes('<svg')) ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    {currentQ.options.map((optRaw, idx) => {
                                        // Robust Label Calculation
                                        const displayLabel = getOptionLabel(optRaw, idx);
                                        
                                        // Parse content cleanly
                                        let { content } = parseOption(optRaw);
                                        let displayContent = content.replace(/```svg/gi, '').replace(/```/g, '').trim();
                                        const isSvgOption = displayContent.startsWith('<svg');
                                        
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionClick(optRaw, idx)}
                                                disabled={isSubmitted || !hasStarted}
                                                // Font-sans and tabular-nums for perfect digit alignment
                                                className={`w-full text-left p-3 rounded-sm border transition-all duration-300 flex items-baseline group relative overflow-hidden font-sans tabular-nums ${getOptionStyle(optRaw, idx)}`}
                                            >
                                                <span className="mr-3 text-sm font-bold flex-shrink-0 w-5 text-right leading-loose font-serif opacity-80">
                                                    {displayLabel}.
                                                </span>
                                                
                                                {isSvgOption ? (
                                                    <div className="flex-1 flex justify-center md:justify-start">
                                                        <div className="w-20 h-20 md:w-24 md:h-24 pointer-events-none" dangerouslySetInnerHTML={{__html: displayContent}} />
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 min-w-0 text-left break-words leading-loose text-xs md:text-sm font-serif-sc tracking-wide">
                                                        <span>{displayContent}</span>
                                                    </div>
                                                )}

                                                {isSubmitted && (
                                                    <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                        {(displayLabel === currentQ.answer || optRaw.startsWith(currentQ.answer || '')) 
                                                        ? <CheckCircle2 size={16} className="text-emerald-600" />
                                                        : (answers[currentQ.id] === displayLabel ? <XCircle size={16} className="text-red-500" /> : null)
                                                        }
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Essay Input */}
                            {isEssayType && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <textarea
                                            value={answers[currentQ.id] || ''}
                                            onChange={(e) => handleTextAnswerChange(e.target.value)}
                                            disabled={isSubmitted || !hasStarted}
                                            placeholder="请在此处输入您的作答..."
                                            className="w-full min-h-[400px] p-6 bg-transparent border border-stone-300 rounded shadow-inner outline-none resize-none leading-[2rem] text-stone-800 disabled:bg-stone-50/50 disabled:text-stone-400 font-serif-sc text-lg"
                                            style={{
                                                backgroundImage: 'linear-gradient(transparent 1.9rem, #e5e5e0 1.9rem)',
                                                backgroundSize: '100% 2rem',
                                                lineHeight: '2rem'
                                            }}
                                            spellCheck={false}
                                        />
                                        <div className="absolute bottom-4 right-4 text-xs text-stone-400 pointer-events-none bg-white/80 px-2 py-1 border border-stone-200 rounded font-mono">
                                            {(answers[currentQ.id] || '').length} 字
                                        </div>
                                    </div>
                                    {!isSubmitted && (
                                        <p className="text-xs text-stone-500 flex items-center gap-1 font-sans">
                                            <PenTool size={12} />
                                            申论/面试为主观题，交卷后系统将提供参考范文供您自我批改。
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Analysis */}
                        {isSubmitted && (
                            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4 relative">
                                {/* Score Stamp Animation */}
                                {!isEssayType && score > 0 && (
                                    <div className="absolute -top-6 right-4 z-20 stamp-animation pointer-events-none">
                                        <div className="w-24 h-24 rounded-full border-4 border-[#d32f2f] flex flex-col items-center justify-center text-[#d32f2f] bg-white/10 backdrop-blur-[1px] shadow-sm transform rotate-[-12deg]">
                                            <div className="w-[88px] h-[88px] rounded-full border border-[#d32f2f] flex flex-col items-center justify-center">
                                                <span className="text-xs font-bold tracking-widest uppercase mb-1">得分</span>
                                                <span className="text-3xl font-black font-serif">{Math.round((score / total) * 100)}</span>
                                                <span className="text-[10px] tracking-widest mt-1">GONGKAO</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className={`rounded border p-6 shadow-sm relative overflow-hidden bg-[#fffdf6] border-stone-300`}>
                                    <h4 className={`font-bold text-lg mb-6 flex items-center gap-2 text-[#8c2a2a] font-serif border-b border-[#8c2a2a]/20 pb-3`}>
                                        <Trophy size={20} /> 
                                        {isEssayType ? '参考范文与解析' : '答案与解析'}
                                    </h4>
                                    
                                    {isEssayType ? (
                                        <div className="space-y-6">
                                            <div>
                                                <span className="text-sm font-bold text-stone-800 border-l-4 border-[#8c2a2a] pl-2 mb-2 inline-block font-serif">参考范文</span>
                                                <div className="prose prose-stone text-stone-800 bg-white p-6 rounded border border-stone-200 font-serif-sc leading-loose">
                                                    <MarkdownRenderer content={currentQ.answer} />
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-stone-600 border-l-4 border-stone-400 pl-2 mb-2 inline-block font-serif">名师解析</span>
                                                <div className="prose prose-sm text-stone-600 font-serif-sc leading-relaxed">
                                                    <MarkdownRenderer content={currentQ.analysis} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex gap-8 mb-4 font-serif text-lg">
                                                <div className="text-stone-800">
                                                    <span className="font-bold">参考答案：</span> 
                                                    <span className="text-[#8c2a2a] font-bold">{currentQ.answer}</span>
                                                </div>
                                                <div className={`${answers[currentQ.id] === currentQ.answer ? 'text-emerald-700' : 'text-red-700'}`}>
                                                    <span className="font-bold">你的选择：</span>
                                                    <span className="font-bold">{answers[currentQ.id] || '未作答'}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-[#f4f2ec] p-4 rounded border border-stone-200">
                                                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">解析</span>
                                                <div className="prose prose-stone text-stone-700 font-serif-sc leading-relaxed">
                                                    <MarkdownRenderer content={processContent(currentQ.analysis)} />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-stone-100 p-4 flex justify-between items-center gap-4 shrink-0 z-10 rounded-b-xl">
            <button
                onClick={() => changePage(currentIndex - 1)}
                disabled={isFirst || !hasStarted}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors whitespace-nowrap font-serif ${
                    isFirst || !hasStarted ? 'text-stone-300 cursor-not-allowed bg-stone-50' : 'text-stone-600 hover:bg-stone-100 bg-white border border-stone-200'
                }`}
            >
                <ChevronLeft size={18} />
                上一题
            </button>

            {/* Pagination Dots */}
            {!isSubmitted && !isEssayType && (
                <div className="hidden md:flex gap-1.5 justify-center flex-wrap max-w-[50%]">
                   {questions.map((_, idx) => (
                      <div 
                          key={idx} 
                          className={`w-2 h-2 rounded-full transition-all ${getDotClass(idx)}`}
                      />
                   ))}
                </div>
            )}

            {/* Next or Submit */}
            {!isSubmitted && isLast ? (
                <button
                    onClick={handleSubmitClick}
                    disabled={!hasStarted}
                    className="flex-1 md:flex-none bg-stone-800 hover:bg-stone-900 text-white px-6 py-2.5 rounded-lg font-bold shadow-md shadow-stone-200 transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed font-serif"
                >
                    <FileCheck size={18} />
                    现在交卷
                </button>
            ) : (
                <button
                    onClick={() => changePage(currentIndex + 1)}
                    disabled={isLast || !hasStarted}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors whitespace-nowrap font-serif ${
                        isLast || !hasStarted 
                            ? 'text-stone-300 cursor-not-allowed bg-stone-50' 
                            : 'text-stone-600 hover:bg-stone-50 bg-white border border-stone-200'
                    }`}
                >
                    下一题
                    <ChevronRight size={18} />
                </button>
            )}
        </div>
      </div>
      
      {!isFullscreen && <div className="absolute top-2 left-2 w-full h-full bg-[#f3f1eb] rounded-xl -z-10 border border-[#e5e5e0]"></div>}

      <ConfirmationModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="确认交卷"
        message={isEssayType 
            ? "申论作答通常需要较长时间。交卷后将为您展示参考范文和详细解析，您可以对照进行自我评估。确定要交卷吗？" 
            : `您已完成 ${answeredCount} / ${total} 道题。交卷后将停止计时并显示分数与解析。确定要交卷吗？`
        }
        confirmText="现在交卷"
        isDangerous={false}
      />
    </div>
  );
};

export default QuizPaper;