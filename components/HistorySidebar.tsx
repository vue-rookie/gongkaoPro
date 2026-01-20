import React from 'react';
import { MessageSquarePlus, MessageSquare, Trash2, X, Clock } from 'lucide-react';
import { Session } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
}

const HistorySidebar: React.FC<Props> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession
}) => {
  // Sort sessions by update time (newest first)
  const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday ? date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : date.toLocaleDateString();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
           <h2 className="font-bold text-gray-800 flex items-center gap-2">
             <Clock size={18} className="text-blue-600" />
             历史记录
           </h2>
           <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
             <X size={18} />
           </button>
        </div>

        <div className="p-3">
          <button
            onClick={() => { onCreateSession(); onClose(); }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition-all active:scale-95"
          >
            <MessageSquarePlus size={18} />
            开启新对话
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sortedSessions.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-sm">
              暂无历史记录
            </div>
          ) : (
            sortedSessions.map(session => (
              <div
                key={session.id}
                onClick={() => { onSelectSession(session.id); onClose(); }}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                  currentSessionId === session.id
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`p-2 rounded-lg ${currentSessionId === session.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    <MessageSquare size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`font-medium text-sm truncate ${currentSessionId === session.id ? 'text-blue-900' : 'text-gray-700'}`}>
                      {session.title || '新对话'}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {formatDate(session.updatedAt)}
                    </div>
                  </div>
                </div>
                
                {/* Delete Button - Only visible on hover or if active */}
                {(sortedSessions.length > 1) && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id, e); }}
                        className={`p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ${currentSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        title="删除对话"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;