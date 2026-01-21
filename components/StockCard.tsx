import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Calculator, FileText, Lightbulb, ChevronUp, ChevronDown, HelpCircle } from 'lucide-react';

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  currency?: string;
  question?: string; // The exam question text
  analysis?: string; // The solution/explanation
}

const StockCard: React.FC<StockCardProps> = ({ symbol, name, price, change, currency = 'CNY', question, analysis }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // In Chinese markets: Red is Up, Green is Down
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden w-full max-w-sm my-4 font-sans transition-all hover:shadow-md ring-1 ring-black/5">
      {/* Header Badge */}
      <div className="bg-stone-50/50 border-b border-stone-100 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-stone-700">
           <FileText size={14} />
           <span className="text-xs font-bold tracking-wide font-serif">资料分析模拟</span>
        </div>
        <span className="text-[10px] text-stone-400 font-mono bg-white px-1.5 py-0.5 rounded border border-stone-100">
          {symbol}
        </span>
      </div>

      <div className="p-5">
        {/* Question Section - This connects the visual to the problem */}
        {question && (
          <div className="mb-5 pb-4 border-b border-dashed border-stone-200">
            <div className="flex gap-2">
               <HelpCircle size={16} className="text-stone-400 flex-shrink-0 mt-0.5" />
               <p className="text-sm text-stone-800 font-medium leading-relaxed font-serif">{question}</p>
            </div>
          </div>
        )}

        {/* Data Display Section - Labeled as Exam Terms */}
        <div className="flex justify-between items-end mb-2">
           <div className="flex flex-col">
              <span className="text-[10px] text-stone-400 uppercase font-semibold mb-0.5 font-sans">现期值 ({name})</span>
              <div className="flex items-baseline gap-1">
                 <span className="text-stone-400 text-xs">{currency}</span>
                 <span className={`text-3xl font-bold tracking-tight font-mono ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
                    {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </span>
              </div>
           </div>

           <div className="flex flex-col items-end">
              <span className="text-[10px] text-stone-400 uppercase font-semibold mb-1 font-sans">同比增长率</span>
              <div className={`flex items-center text-sm font-bold px-2 py-1 rounded-lg font-mono ${isPositive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                {change > 0 ? '+' : ''}{change}%
              </div>
           </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-[#fcfaf8] p-2 border-t border-stone-100">
        <button 
          className={`w-full font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-sans ${
             showAnalysis 
               ? 'bg-white text-stone-600 border border-stone-200 shadow-sm' 
               : 'bg-stone-800 hover:bg-stone-900 text-white shadow'
          }`}
          onClick={() => setShowAnalysis(!showAnalysis)}
        >
          {showAnalysis ? <ChevronUp size={16} /> : <Calculator size={16} />}
          <span>{showAnalysis ? '收起答案解析' : '查看解题步骤'}</span>
        </button>

        {/* Expanded Analysis */}
        {showAnalysis && (
          <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
             <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-stone-800 relative">
               <div className="flex items-center gap-1.5 mb-2 text-amber-800 font-bold text-xs font-serif">
                 <Lightbulb size={12} />
                 <span>名师解析</span>
               </div>
               <div className="prose prose-sm max-w-none text-xs md:text-sm leading-6 text-stone-700 whitespace-pre-line font-serif-sc">
                  {analysis || "暂无解析。"}
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockCard;