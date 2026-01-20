import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isDangerous?: boolean;
}

const ConfirmationModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, title, message, confirmText = '确认', isDangerous = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-5 m-4 animate-in zoom-in-95 duration-200 border border-gray-100 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4 text-gray-800">
           <div className={`p-2 rounded-full flex-shrink-0 ${isDangerous ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
             <AlertTriangle size={24} />
           </div>
           <h3 className="text-lg font-bold leading-tight">{title}</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-6 leading-relaxed pl-1">
           {message}
        </p>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold text-sm transition-colors"
          >
            取消
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-transform active:scale-95 shadow-md ${isDangerous ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;