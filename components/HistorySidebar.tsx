'use client';

import React from 'react';
import { MessageSquarePlus, Trash2, X, Clock } from 'lucide-react';
import { Session } from '../types';

interface Props {
  isMobileOpen: boolean;
  isDesktopOpen: boolean;
  onMobileClose: () => void;
  sessions: Session[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
}

const HistorySidebar: React.FC<Props> = ({
  isMobileOpen,
  isDesktopOpen,
  onMobileClose,
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

  // Shared Content for both Mobile and Desktop sidebars
  const SidebarContent = ({ isMobile }: { isMobile: boolean }) => (
    <div className="flex flex-col h-full bg-[#f3f1eb]">
        <div className="p-4 flex items-center justify-between flex-shrink-0">
           <h2 className="font-serif font-bold text-stone-700 flex items-center gap-2">
             <Clock size={18} className="text-stone-500" />
             <span className="tracking-wide">历史记录</span>
           </h2>
           {isMobile && (
               <button onClick={onMobileClose} className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-500 transition-colors">
                 <X size={18} />
               </button>
           )}
        </div>

        <div className="px-3 mb-2 flex-shrink-0">
          <button
            onClick={() => { onCreateSession(); if(isMobile) onMobileClose(); }}
            className="w-full bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
          >
            <MessageSquarePlus size={16} />
            开启新对话
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1 py-2 scrollbar-hide">
          {sortedSessions.length === 0 ? (
            <div className="text-center text-stone-400 py-10 text-xs">
              暂无历史记录
            </div>
          ) : (
            sortedSessions.map(session => (
              <div
                key={session.id}
                onClick={() => { onSelectSession(session.id); if(isMobile) onMobileClose(); }}
                className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all border text-sm ${
                  currentSessionId === session.id
                    ? 'bg-white border-stone-200 shadow-sm'
                    : 'bg-transparent border-transparent hover:bg-stone-200/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="min-w-0 flex-1">
                    <div className={`font-medium truncate ${currentSessionId === session.id ? 'text-stone-900' : 'text-stone-600'}`}>
                      {session.title || '新对话'}
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      {formatDate(session.updatedAt)}
                    </div>
                  </div>
                </div>
                
                {/* Delete Button - Only visible on hover or if active */}
                <button
                    onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id, e); }}
                    className={`p-1.5 rounded text-stone-400 hover:text-red-600 hover:bg-stone-200 transition-colors ${currentSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    title="删除对话"
                >
                    <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
        
        {/* Footer decoration */}
        <div className="p-4 border-t border-stone-200 text-center flex-shrink-0">
             <div className="text-[10px] text-stone-400 font-serif italic">GongKao Pro v1.0</div>
        </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar (Drawer Overlay) */}
      <div className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          {/* Backdrop */}
          <div 
             className="absolute inset-0 bg-black/20 backdrop-blur-sm"
             onClick={onMobileClose}
          />
          {/* Drawer */}
          <div className={`absolute top-0 left-0 bottom-0 w-72 bg-[#f3f1eb] shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
             <SidebarContent isMobile={true} />
          </div>
      </div>

      {/* Desktop Sidebar (Collapsible Column) */}
      <div 
        className={`hidden md:flex flex-col bg-[#f3f1eb] border-r border-[#e5e5e0] transition-all duration-300 ease-in-out overflow-hidden ${
          isDesktopOpen ? 'w-72 opacity-100' : 'w-0 opacity-0 border-none'
        }`}
      >
          {/* Fixed width container to prevent content reflow during width transition */}
          <div className="w-72 h-full flex flex-col">
             <SidebarContent isMobile={false} />
          </div>
      </div>
    </>
  );
};

export default HistorySidebar;