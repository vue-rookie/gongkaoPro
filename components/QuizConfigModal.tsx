import React, { useState, useEffect } from 'react';
import { X, ScrollText, Check, ListFilter, Hash, CheckSquare } from 'lucide-react';
import { ExamMode } from '../types';
import { EXAM_TOPICS } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStart: (topic: string, count: number) => void;
  currentMode: ExamMode;
}

const JUDGMENT_SUBTOPICS = ['图形推理', '定义判断', '类比推理', '逻辑判断'];

const QuizConfigModal: React.FC<Props> = ({ isOpen, onClose, onStart, currentMode }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [subTopics, setSubTopics] = useState<string[]>([]);
  const [count, setCount] = useState<number>(5);

  // Initialize state when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
        const topics = EXAM_TOPICS[currentMode] || ['随机'];
        // Default select the first topic
        const defaultTopic = topics[0];
        setSelectedTopic(defaultTopic);
        
        // If default happens to be Judgment Reasoning, init subtopics
        if (currentMode === ExamMode.XING_CE && defaultTopic === '判断推理') {
            setSubTopics(JUDGMENT_SUBTOPICS);
        } else {
            setSubTopics([]);
        }
    }
  }, [isOpen, currentMode]);

  if (!isOpen) return null;

  const topics = EXAM_TOPICS[currentMode] || ['随机'];
  const isShenLun = currentMode === ExamMode.SHEN_LUN;
  const isJudgment = currentMode === ExamMode.XING_CE && selectedTopic === '判断推理';

  const handleTopicClick = (topic: string) => {
      setSelectedTopic(topic);
      if (currentMode === ExamMode.XING_CE && topic === '判断推理') {
          setSubTopics(JUDGMENT_SUBTOPICS); // Default select all
      } else {
          setSubTopics([]);
      }
  };

  const toggleSubTopic = (sub: string) => {
      setSubTopics(prev => 
          prev.includes(sub) 
          ? prev.filter(p => p !== sub) 
          : [...prev, sub]
      );
  };

  const handleStart = () => {
    let finalTopic = selectedTopic;
    
    // Combine subtopics into the prompt string if applicable
    if (isJudgment) {
        if (subTopics.length === 0) {
            // If user deselected all, fallback to ALL to ensure valid prompt
            finalTopic = `判断推理 (包含全部考点：${JUDGMENT_SUBTOPICS.join('、')})`;
        } else {
            // CRITICAL CHANGE: Use "ONLY" (仅限) to enforce strict filtering
            finalTopic = `判断推理专项 (仅限以下考点：${subTopics.join('、')}，严禁生成其他题型)`;
        }
    }

    // Shen Lun always generates 1 question per set due to length
    const finalCount = isShenLun ? 1 : count;
    onStart(finalTopic, finalCount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 m-4 animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto scrollbar-hide">
        
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
             <div className={`${isShenLun ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'} p-2 rounded-xl`}>
               <ScrollText size={24} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-gray-800">
                    {isShenLun ? '生成申论模拟题' : '生成全真模拟卷'}
                </h3>
                <p className="text-xs text-gray-500">AI 智能出题 · 计时模式</p>
             </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          
          {/* Topic Selection */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <ListFilter size={16} className={isShenLun ? "text-emerald-500" : "text-blue-500"} />
                选择题型/主题
            </label>
            <div className="grid grid-cols-2 gap-2">
                {topics.map(topic => (
                    <button
                        key={topic}
                        onClick={() => handleTopicClick(topic)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all text-left truncate ${
                            selectedTopic === topic 
                            ? (isShenLun ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200' : 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200')
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-white'
                        }`}
                    >
                        {topic}
                    </button>
                ))}
            </div>

            {/* Sub-topic Selection for Judgment Reasoning */}
            {isJudgment && (
                <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-indigo-800 flex items-center gap-1">
                            <CheckSquare size={12} /> 细分题型 (可多选)
                        </span>
                        <span className="text-[10px] text-indigo-400">已选 {subTopics.length} 项</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {JUDGMENT_SUBTOPICS.map(sub => (
                            <button
                                key={sub}
                                onClick={() => toggleSubTopic(sub)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-between ${
                                    subTopics.includes(sub)
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
                                }`}
                            >
                                <span>{sub}</span>
                                {subTopics.includes(sub) && <Check size={12} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>

          {/* Count Selection - Hidden for Shen Lun */}
          {!isShenLun && (
              <div className="space-y-3 animate-in slide-in-from-top-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Hash size={16} className="text-blue-500" />
                    题目数量
                </label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    {[5, 10, 15].map(num => (
                        <button
                            key={num}
                            onClick={() => setCount(num)}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                                count === num 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {num} 道
                        </button>
                    ))}
                </div>
              </div>
          )}

          <button
            onClick={handleStart}
            className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mt-2 ${
                isShenLun 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            <Check size={18} />
            {isShenLun ? '生成题目' : '开始刷题'}
          </button>

        </div>
      </div>
    </div>
  );
};

export default QuizConfigModal;