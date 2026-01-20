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
    { id: ExamMode.XING_CE, icon: BrainCircuit, color: 'text-indigo-600', activeBg: 'bg-indigo-600', activeText: 'text-white', border: 'border-indigo-200' },
    { id: ExamMode.SHEN_LUN, icon: PenTool, color: 'text-emerald-600', activeBg: 'bg-emerald-600', activeText: 'text-white', border: 'border-emerald-200' },
    { id: ExamMode.MIAN_SHI, icon: Users, color: 'text-amber-600', activeBg: 'bg-amber-600', activeText: 'text-white', border: 'border-amber-200' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Mobile/Compact View: Horizontal Scroll */}
      <div className="flex overflow-x-auto gap-2 pb-2 md:pb-4 scrollbar-hide snap-x">
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
                flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300
                ${isSelected 
                  ? `${mode.activeBg} ${mode.activeText} shadow-md border-transparent transform scale-105` 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Icon size={16} className={isSelected ? 'text-white' : mode.color} />
              <span className="font-bold text-sm whitespace-nowrap">{MODE_LABELS[mode.id]}</span>
            </button>
          );
        })}
      </div>
      
      {/* Description Toast (Only shows for selected mode to save space) */}
      <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 px-1 pb-2 opacity-80 animate-in fade-in slide-in-from-top-1 duration-300">
         <Info size={12} />
         <span>{MODE_DESCRIPTIONS[currentMode]}</span>
      </div>
    </div>
  );
};

export default ModeSelector;