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

  const handleOptionClick = (option: string) => {
    if (isSubmitted || !hasStarted || isEssayType) return; 
    const optionLabel = option.split('.')[0].trim(); 
    setAnswers(prev => ({ ...prev, [currentQ.id]: optionLabel }));
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

  const getOptionStyle = (option: string) => {
    const optionLabel = option.split('.')[0].trim();
    const userAnswer = answers[currentQ.id];
    
    if (!isSubmitted) {
        if (userAnswer === optionLabel) {
            return "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500 font-bold shadow-md";
        }
        return "hover:bg-gray-50 hover:border-blue-300 border-gray-200 hover:shadow-sm";
    }

    const correctAnswer = currentQ.answer || '';
    const isThisCorrect = optionLabel === correctAnswer || option.startsWith(correctAnswer);
    const isThisSelected = userAnswer === optionLabel;

    if (isThisCorrect) return "bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500 font-bold";
    if (isThisSelected && !isThisCorrect) return "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500";
    return "opacity-50 border-gray-100 bg-gray-50 grayscale"; 
  };

  const getDotClass = (index: number) => {
    if (index === currentIndex) return 'bg-blue-600 w-4';
    
    const q = questions[index];
    const ans = answers[q.id];

    if (isSubmitted) {
      if (!q.options) return 'bg-gray-300';
      if (ans === q.answer) return 'bg-green-400';
      return 'bg-red-400';
    } else {
      if (ans) return 'bg-blue-300';
      return 'bg-gray-200';
    }
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="w-full my-6 font-sans perspective-1000 select-none">
      <div className={`relative bg-[#fdfbf7] rounded-xl shadow-xl border border-stone-200 overflow-hidden flex flex-col transition-transform duration-500 ${isEssayType ? 'min-h-[600px]' : 'min-h-[450px]'}`}>
        
        {/* Header */}
        <div className={`border-b px-4 py-3 flex justify-between items-center relative transition-colors duration-300 ${isSubmitted ? 'bg-indigo-50 border-indigo-100' : 'bg-stone-100 border-stone-200'}`}>
          <div className="flex items-center gap-2 font-bold text-stone-700">
             {isSubmitted ? (
                 <div className="flex items-center gap-2 text-indigo-700">
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
                 <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <Clock size={14} />
                    <span>用时: {formatTime(timeElapsed)}</span>
                 </div>
                 {!isEssayType && (
                    <div className="flex items-center gap-1.5 text-lg font-bold text-orange-600 bg-white px-3 py-1 rounded-lg shadow-sm">
                        <Trophy size={18} />
                        <span>{score} / {total}</span>
                    </div>
                 )}
             </div>
          ) : (
             <div className="flex items-center gap-3">
                 <div className={`flex items-center gap-1.5 bg-white border border-stone-200 px-2 py-1 rounded text-stone-600 font-mono text-sm font-bold shadow-sm transition-colors ${hasStarted ? '' : 'opacity-50'}`}>
                     <Clock size={14} className={timeElapsed > 300 && hasStarted ? "text-red-500 animate-pulse" : "text-blue-500"} />
                     {formatTime(timeElapsed)}
                 </div>
                 <div className="text-xs font-mono bg-stone-200/50 px-2 py-1 rounded text-stone-500">
                    {currentIndex + 1} / {total}
                 </div>
             </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-0 relative overflow-hidden flex flex-col">
            
            {/* Start Mask */}
            {!hasStarted && !isSubmitted && (
                <div className="absolute inset-0 z-30 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 max-w-sm w-full">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                            <Clock size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">准备好了吗？</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            共 {questions.length} 道题，{isEssayType ? '请认真阅读给定资料并作答。' : '点击下方按钮开始计时作答。'}
                        </p>
                        <button 
                            onClick={() => setHasStarted(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
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
                    <div className="bg-stone-50 border-b border-stone-200 p-4 md:p-6 max-h-[300px] overflow-y-auto shadow-inner">
                        <div className="flex items-center gap-2 text-stone-800 font-bold mb-3 border-l-4 border-stone-400 pl-2">
                             <BookText size={18} />
                             <span>给定资料</span>
                        </div>
                        <div className="prose prose-sm prose-stone max-w-none leading-relaxed text-justify text-stone-700">
                             {currentQ.material?.split('\n').map((para, i) => (
                                 <p key={i} className="mb-2 last:mb-0 indent-8">{para}</p>
                             ))}
                        </div>
                    </div>
                )}

                <div className="p-4 md:p-6 flex-1 overflow-y-auto">
                    {/* Question */}
                    <div className="mb-6">
                        <div className="flex gap-2 mb-4">
                             <span className="text-blue-600 flex-shrink-0 font-bold text-lg mt-1">Q{currentIndex + 1}.</span>
                             <div className="flex-1 text-gray-800 text-lg leading-relaxed font-bold">
                                <MarkdownRenderer content={processContent(currentQ.question)} className="prose-base" />
                             </div>
                        </div>
                        
                        {/* Options */}
                        {!isEssayType && currentQ.options && currentQ.options.length > 0 && (
                            <div className={`grid gap-3 ${currentQ.options.some(o => o.includes('<svg')) ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {currentQ.options.map((opt, idx) => {
                                    const optionLabel = opt.split('.')[0].trim();
                                    
                                    let optionContent = opt.substring(opt.indexOf('.') + 1).trim();
                                    optionContent = optionContent.replace(/```svg/gi, '').replace(/```/g, '').trim();
                                    
                                    const isSvgOption = optionContent.startsWith('<svg');
                                    
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionClick(opt)}
                                            disabled={isSubmitted || !hasStarted}
                                            className={`text-left p-4 rounded-lg border text-sm font-medium transition-all duration-200 flex items-center group relative overflow-hidden ${getOptionStyle(opt)}`}
                                        >
                                            <span className="mr-3 text-lg font-bold opacity-80 flex-shrink-0 w-6">{optionLabel}.</span>
                                            
                                            <div className="flex-1 flex justify-center md:justify-start">
                                                {isSvgOption ? (
                                                    <div className="w-24 h-24 md:w-32 md:h-32 pointer-events-none" dangerouslySetInnerHTML={{__html: optionContent}} />
                                                ) : (
                                                    <span>{optionContent || opt}</span>
                                                )}
                                            </div>

                                            {isSubmitted && (
                                                <div className="absolute top-2 right-2">
                                                    {(opt.startsWith(currentQ.answer || '') || optionLabel === currentQ.answer) 
                                                    ? <CheckCircle2 size={20} className="text-green-600" />
                                                    : (answers[currentQ.id] === optionLabel ? <XCircle size={20} className="text-red-500" /> : null)
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
                                        className="w-full min-h-[200px] p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none leading-relaxed text-gray-700 disabled:bg-gray-50 disabled:text-gray-500"
                                        spellCheck={false}
                                    />
                                    <div className="absolute bottom-3 right-3 text-xs text-gray-400 pointer-events-none bg-white/80 px-1 rounded">
                                        {(answers[currentQ.id] || '').length} 字
                                    </div>
                                </div>
                                {!isSubmitted && (
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
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
                            <div className={`rounded-xl border p-5 shadow-sm relative overflow-hidden ${isEssayType ? 'bg-indigo-50 border-indigo-100' : 'bg-amber-50 border-amber-100'}`}>
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <Lightbulb size={64} className={isEssayType ? "text-indigo-500" : "text-amber-500"} />
                                </div>
                                <h4 className={`font-bold text-sm mb-4 flex items-center gap-2 ${isEssayType ? 'text-indigo-800' : 'text-amber-800'}`}>
                                    <CheckCircle2 size={16} /> 
                                    {isEssayType ? '参考范文与解析' : '答案与解析'}
                                </h4>
                                
                                {isEssayType ? (
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded uppercase mb-1 inline-block">Ref Answer</span>
                                            <div className="prose prose-sm prose-indigo text-gray-800 bg-white p-4 rounded-lg border border-indigo-100">
                                                <MarkdownRenderer content={currentQ.answer} />
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded uppercase mb-1 inline-block">Analysis</span>
                                            <div className="prose prose-sm text-gray-600">
                                                <MarkdownRenderer content={currentQ.analysis} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-sm text-gray-800 leading-relaxed mb-2">
                                            <span className="font-bold">参考答案：</span> {currentQ.answer}
                                        </div>
                                        {currentQ.options && (
                                            <div className={`text-sm mb-3 font-bold ${answers[currentQ.id] === currentQ.answer ? 'text-green-600' : 'text-red-600'}`}>
                                                你的选择：{answers[currentQ.id] || '未作答'}
                                            </div>
                                        )}
                                        <div className="h-px bg-amber-200/50 my-3"></div>
                                        <div className="prose prose-sm prose-amber text-gray-700">
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
        <div className="bg-white border-t border-gray-100 p-4 flex justify-between items-center gap-4">
            <button
                onClick={() => changePage(currentIndex - 1)}
                disabled={isFirst || !hasStarted}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                    isFirst || !hasStarted ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'text-gray-600 hover:bg-gray-100 bg-white border border-gray-200'
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
                    className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FileCheck size={18} />
                    现在交卷
                </button>
            ) : (
                <button
                    onClick={() => changePage(currentIndex + 1)}
                    disabled={isLast || !hasStarted}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                        isLast || !hasStarted 
                            ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                            : 'text-blue-600 hover:bg-blue-50 bg-white border border-blue-100'
                    }`}
                >
                    下一题
                    <ChevronRight size={18} />
                </button>
            )}
        </div>
      </div>
      
      <div className="absolute top-2 left-2 w-full h-full bg-stone-100 rounded-xl -z-10 border border-stone-200"></div>

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