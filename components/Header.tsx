import React, { useState } from 'react';
import { GraduationCap, Sparkles, Trash2, BookOpen, Menu, LogIn, UserCircle, LogOut, ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { User } from '../types';

interface Props {
  user: User | null;
  onClearHistory: () => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  onToggleSidebar: () => void; // Unified toggle handler
  isSidebarOpen: boolean; // Used to show different icons (optional)
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const Header: React.FC<Props> = ({ 
  user,
  onClearHistory, 
  showFavoritesOnly, 
  onToggleFavorites, 
  onToggleSidebar,
  isSidebarOpen,
  onLoginClick,
  onLogoutClick
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="flex-shrink-0 bg-[#fcfaf8] sticky top-0 z-20">
      <div className="w-full px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Menu button visible on all screens */}
          <button 
            onClick={onToggleSidebar}
            className="p-2 -ml-2 text-stone-500 hover:bg-stone-200 rounded-lg transition-colors"
            title={isSidebarOpen ? "收起侧边栏" : "展开侧边栏"}
          >
             {/* Show Menu icon on mobile, Panel icons on desktop preference? Or just Menu everywhere */}
             <Menu size={20} className="md:hidden" />
             {isSidebarOpen ? <PanelLeftClose size={20} className="hidden md:block" /> : <PanelLeftOpen size={20} className="hidden md:block" />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="text-stone-700 hidden md:block">
                <GraduationCap size={20} />
            </div>
            <div className="flex flex-col">
                <h1 className="text-lg font-serif font-bold text-stone-800 leading-none tracking-tight">公考智囊</h1>
                <span className="text-[10px] text-stone-400 font-medium tracking-widest">PRO</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          
          {/* Notebook Toggle */}
          <button
            onClick={onToggleFavorites}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              showFavoritesOnly
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
            title="查看笔记本"
          >
            <BookOpen size={14} className={showFavoritesOnly ? "text-amber-700" : "text-stone-500"} />
            <span className="hidden md:inline">{showFavoritesOnly ? '返回对话' : '笔记本'}</span>
            <span className="md:hidden">{showFavoritesOnly ? '返回' : '笔记'}</span>
          </button>

          {/* User Section */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-stone-100 rounded-full pr-2 pl-1 py-1 transition-colors border border-transparent hover:border-stone-200"
              >
                <div className="w-7 h-7 bg-stone-200 text-stone-600 rounded-full flex items-center justify-center font-bold text-xs">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" /> : user.username[0].toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-stone-700 max-w-[80px] truncate hidden md:block">{user.username}</span>
                <ChevronDown size={12} className="text-stone-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 z-20 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                     <div className="p-3 border-b border-stone-50 bg-stone-50/50">
                        <p className="text-xs text-stone-500">登录用户</p>
                        <p className="font-bold text-stone-800 truncate">{user.username}</p>
                     </div>
                     <div className="p-1">
                        <button 
                           onClick={() => { onClearHistory(); setShowUserMenu(false); }}
                           className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                        >
                           <Trash2 size={14} />
                           清空当前数据
                        </button>
                        <button 
                           onClick={() => { onLogoutClick(); setShowUserMenu(false); }}
                           className="w-full text-left px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg flex items-center gap-2 transition-colors"
                        >
                           <LogOut size={14} />
                           退出登录
                        </button>
                     </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-1.5 bg-stone-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-stone-700 transition-all shadow-sm"
            >
              <LogIn size={14} />
              <span className="hidden md:inline">登录</span>
            </button>
          )}
          
        </div>
      </div>
    </header>
  );
};

export default Header;