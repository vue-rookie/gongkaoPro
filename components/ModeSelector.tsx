'use client';

import React from 'react';
import { ExamMode } from '../types';
import { MODE_LABELS, MODE_DESCRIPTIONS } from '../constants';
import { BrainCircuit, PenTool, Users, Info } from 'lucide-react';

interface Props {
  currentMode: ExamMode;
  onSelectMode: (mode: ExamMode) => void;
  disabled: boolean;
}

const ModeSelector: React.FC<Props> = ({ currentMode, onSelectMode, disabled }) => {
  const modes = [
    { id: ExamMode.XING_CE, icon: BrainCircuit, color: 'text-stone-600', activeBg: 'bg-stone-700', activeText: 'text-white', border: 'border-stone-200' },
    { id: ExamMode.SHEN_LUN, icon: PenTool, color: 'text-stone-600', activeBg: 'bg-stone-700', activeText: 'text-white', border: 'border-stone-200' },
    { id: ExamMode.MIAN_SHI, icon: Users, color: 'text-stone-600', activeBg: 'bg-stone-700', activeText: 'text-white', border: 'border-stone-200' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Mobile/Compact View: Horizontal Scroll */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide snap-x justify-start md:justify-center">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = currentMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              disabled={disabled}
              className={`
                flex-shrink-0 snap-start
                flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300
                ${isSelected 
                  ? `${mode.activeBg} ${mode.activeText} shadow-sm border-transparent` 
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Icon size={16} className={isSelected ? 'text-white' : mode.color} />
              <span className="font-bold text-sm whitespace-nowrap font-sans">{MODE_LABELS[mode.id]}</span>
            </button>
          );
        })}
      </div>
      
      {/* Description Toast */}
      <div className="hidden md:flex justify-center items-center gap-2 text-xs text-stone-400 px-1 pb-2 opacity-80 animate-in fade-in slide-in-from-top-1 duration-300 font-sans">
         <Info size={12} />
         <span>{MODE_DESCRIPTIONS[currentMode]}</span>
      </div>
    </div>
  );
};

export default ModeSelector;