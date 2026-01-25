'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-emerald-50 to-teal-50',
          border: 'border-emerald-200',
          icon: <CheckCircle size={20} className="text-emerald-600" />,
          text: 'text-emerald-800'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          border: 'border-red-200',
          icon: <AlertCircle size={20} className="text-red-600" />,
          text: 'text-red-800'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
          border: 'border-amber-200',
          icon: <AlertTriangle size={20} className="text-amber-600" />,
          text: 'text-amber-800'
        };
      case 'info':
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          border: 'border-blue-200',
          icon: <Info size={20} className="text-blue-600" />,
          text: 'text-blue-800'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`
        ${styles.bg} ${styles.border} ${styles.text}
        border rounded-xl shadow-lg backdrop-blur-sm
        px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-md
        animate-in slide-in-from-top-2 fade-in duration-300
      `}
    >
      <div className="flex-shrink-0">
        {styles.icon}
      </div>
      <p className="flex-1 text-sm font-medium leading-relaxed">
        {message}
      </p>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-white/50 transition-colors"
        aria-label="关闭"
      >
        <X size={16} className="opacity-60" />
      </button>
    </div>
  );
};

export default Toast;
