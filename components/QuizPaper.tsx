import React, { useState, useEffect } from 'react';
import { QuizQuestion, ExamMode } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Lightbulb, Trophy, BookOpen, Clock, FileCheck, Play, BookText, PenTool } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import ConfirmationModal from './ConfirmationModal';

interface Props {
  questions: QuizQuestion[];
  mode: ExamMode;
}

const QuizPaper: React.FC<Props> = ({ questions, mode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  
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

  const currentQ = questions[currentIndex];
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
            return "bg-[#fcf5f2] border-[#da7756] text-[#b04825] font-bold shadow-sm ring-1 ring-[#da7756]";
        }
        return "bg-white border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-600";
    }

    const correctAnswer = currentQ.answer || '';
    const isThisCorrect = optionLabel === correctAnswer || optionRaw.startsWith(correctAnswer);
    const isThisSelected = userAnswer === optionLabel;

    if (isThisCorrect) return "bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500 font-bold";
    if (isThisSelected && !isThisCorrect) return "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500";
    return "opacity-50 border-stone-100 bg-stone-50 grayscale"; 
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
    <div className="w-full my-6 font-sans perspective-1000 select-none">
      <div className={`relative bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex flex-col transition-transform duration-500 ${isEssayType ? 'min-h-[600px]' : 'min-h-[450px]'}`}>
        
        {/* Header */}
        <div className="border-b border-stone-100 px-4 py-3 flex justify-between items-center relative bg-[#fcfaf8]">
          <div className="flex items-center gap-2 font-bold text-stone-700 font-serif">
             {isSubmitted ? (
                 <div className="flex items-center gap-2 text-stone-800">
                     <FileCheck size={18} />
                     <span>成绩单</span>
                 </div>
             ) : (
                 <div className="flex items-center gap-2">
                    <BookOpen size={18} />
                    <span className="text-sm">{isEssayType ? '申论全真模拟' : '行测全真模拟'}</span>
                 </div>
             )}
          </div>

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
        </div>

        {/* Content Area */}
        <div className="flex-1 p-0 relative overflow-hidden flex flex-col">
            
            {/* Start Mask */}
            {!hasStarted && !isSubmitted && (
                <div className="absolute inset-0 z-30 bg-[#fcfaf8]/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-stone-100 max-w-sm w-full">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-600">
                            <Clock size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-stone-800 mb-2 font-serif">准备好了吗？</h3>
                        <p className="text-stone-500 text-sm mb-6 font-serif">
                            共 {questions.length} 道题，{isEssayType ? '请认真阅读给定资料并作答。' : '点击下方按钮开始计时作答。'}
                        </p>
                        <button 
                            onClick={() => setHasStarted(true)}
                            className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-stone-200 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Play size={20} className="fill-white" />
                            开始答题
                        </button>
                    </div>
                </div>
            )}

            <div 
                className={`flex-1 flex flex-col transition-all duration-300 ease-out transform ${
                    isAnimating 
                    ? (direction === 'right' ? '-translate-x-10 opacity-0' : 'translate-x-10 opacity-0')
                    : 'translate-x-0 opacity-100'
                } ${!hasStarted ? 'blur-sm opacity-50 pointer-events-none' : ''}`}
            >
                {/* Material Section */}
                {hasMaterial && (
                    <div className="bg-[#f8f7f4] border-b border-stone-200 p-4 md:p-6 max-h-[300px] overflow-y-auto shadow-inner relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#e5e5e0]"></div>
                        <div className="flex items-center gap-2 text-stone-800 font-bold mb-3 pl-2 font-serif">
                             <BookText size={18} />
                             <span>给定资料</span>
                        </div>
                        <div className="prose prose-sm prose-stone max-w-none leading-relaxed text-justify text-stone-700 font-serif-sc">
                             {currentQ.material?.split('\n').map((para, i) => (
                                 <p key={i} className="mb-2 last:mb-0 indent-8">{para}</p>
                             ))}
                        </div>
                    </div>
                )}

                <div className="p-4 md:p-6 flex-1 overflow-y-auto bg-white">
                    {/* Question */}
                    <div className="mb-6">
                        <div className="flex gap-2 mb-4">
                             <span className="text-stone-400 flex-shrink-0 font-bold text-lg mt-1 font-serif">Q{currentIndex + 1}.</span>
                             <div className="flex-1 text-stone-800 text-lg leading-relaxed font-bold font-serif-sc">
                                <MarkdownRenderer content={processContent(currentQ.question)} className="prose-base" />
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
                                            className={`w-full text-left p-4 rounded-lg border text-sm transition-all duration-200 flex items-baseline group relative overflow-hidden font-sans tabular-nums ${getOptionStyle(optRaw, idx)}`}
                                        >
                                            <span className="mr-3 text-base font-bold opacity-80 flex-shrink-0 w-6 text-right leading-relaxed">
                                                {displayLabel}.
                                            </span>
                                            
                                            {isSvgOption ? (
                                                <div className="flex-1 flex justify-center md:justify-start">
                                                    <div className="w-24 h-24 md:w-32 md:h-32 pointer-events-none" dangerouslySetInnerHTML={{__html: displayContent}} />
                                                </div>
                                            ) : (
                                                <div className="flex-1 min-w-0 text-left break-words leading-relaxed">
                                                    <span>{displayContent}</span>
                                                </div>
                                            )}

                                            {isSubmitted && (
                                                <div className="absolute top-2 right-2">
                                                    {(displayLabel === currentQ.answer || optRaw.startsWith(currentQ.answer || '')) 
                                                    ? <CheckCircle2 size={20} className="text-emerald-600" />
                                                    : (answers[currentQ.id] === displayLabel ? <XCircle size={20} className="text-red-500" /> : null)
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
                                        className="w-full min-h-[200px] p-4 bg-[#fcfaf8] border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-200 focus:border-stone-400 outline-none resize-none leading-relaxed text-stone-700 disabled:bg-stone-50 disabled:text-stone-400 font-serif"
                                        spellCheck={false}
                                    />
                                    <div className="absolute bottom-3 right-3 text-xs text-stone-400 pointer-events-none bg-white/80 px-1 rounded font-mono">
                                        {(answers[currentQ.id] || '').length} 字
                                    </div>
                                </div>
                                {!isSubmitted && (
                                    <p className="text-xs text-stone-400 flex items-center gap-1 font-sans">
                                        <PenTool size={12} />
                                        申论/面试为主观题，交卷后系统将提供参考范文供您自我批改。
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Analysis */}
                    {isSubmitted && (
                        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4">
                            <div className={`rounded-xl border p-5 shadow-sm relative overflow-hidden bg-stone-50 border-stone-200`}>
                                <div className="absolute top-0 right-0 p-2 opacity-5">
                                    <Lightbulb size={64} className="text-stone-800" />
                                </div>
                                <h4 className={`font-bold text-sm mb-4 flex items-center gap-2 text-stone-800 font-serif`}>
                                    <CheckCircle2 size={16} /> 
                                    {isEssayType ? '参考范文与解析' : '答案与解析'}
                                </h4>
                                
                                {isEssayType ? (
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-xs font-bold text-stone-500 bg-stone-200 px-2 py-0.5 rounded uppercase mb-1 inline-block font-sans">参考范文</span>
                                            <div className="prose prose-sm prose-stone text-stone-800 bg-white p-4 rounded-lg border border-stone-100 font-serif-sc">
                                                <MarkdownRenderer content={currentQ.answer} />
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded uppercase mb-1 inline-block font-sans">名师解析</span>
                                            <div className="prose prose-sm text-stone-600 font-serif-sc">
                                                <MarkdownRenderer content={currentQ.analysis} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-sm text-stone-800 leading-relaxed mb-2 font-serif">
                                            <span className="font-bold">参考答案：</span> {currentQ.answer}
                                        </div>
                                        {currentQ.options && (
                                            <div className={`text-sm mb-3 font-bold font-serif ${answers[currentQ.id] === currentQ.answer ? 'text-emerald-600' : 'text-red-600'}`}>
                                                你的选择：{answers[currentQ.id] || '未作答'}
                                            </div>
                                        )}
                                        <div className="h-px bg-stone-200 my-3"></div>
                                        <div className="prose prose-sm prose-stone text-stone-700 font-serif-sc">
                                            <MarkdownRenderer content={processContent(currentQ.analysis)} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-stone-100 p-4 flex justify-between items-center gap-4 rounded-b-xl">
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
      
      <div className="absolute top-2 left-2 w-full h-full bg-[#f3f1eb] rounded-xl -z-10 border border-[#e5e5e0]"></div>

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