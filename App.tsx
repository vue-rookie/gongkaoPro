'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import ChatInterface from './components/ChatInterface';
import NotebookView from './components/NotebookView';
import ConfirmationModal from './components/ConfirmationModal';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal'; 
import { ChatState, ExamMode, Message, Category, Session, User } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { MODE_LABELS } from './constants';
import { v4 as uuidv4 } from 'uuid';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// LocalStorage Keys (Only for Guest/Token)
const GUEST_DATA_KEY = 'gongkao_guest_data'; 
const USER_INFO_KEY = 'gongkao_user_info'; 

const App: React.FC = () => {
  
  // --- Initial State Initialization ---
  const [chatState, setChatState] = useState<ChatState>(() => {
    // 1. Check if user was logged in
    let savedUser = null;
    if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem(USER_INFO_KEY);
        if (userStr) savedUser = JSON.parse(userStr);
    }

    const defaultState: ChatState = {
      currentUser: savedUser,
      messages: [],
      categories: [],
      sessions: [{ id: generateId(), title: '新对话', updatedAt: Date.now() }],
      currentSessionId: '', 
      isLoading: false,
      currentMode: ExamMode.XING_CE,
      showFavoritesOnly: false
    };
    defaultState.currentSessionId = defaultState.sessions[0].id;

    // 2. If Guest, try load local data immediately
    if (!savedUser && typeof window !== 'undefined') {
        const guestData = localStorage.getItem(GUEST_DATA_KEY);
        if (guestData) {
            return { ...defaultState, ...JSON.parse(guestData) };
        }
    }
    // 3. If User, data will be loaded via useEffect from API
    
    return defaultState;
  });

  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // --- Data Sync Effect ---
  // 1. On Mount (or User Change), Load Data
  useEffect(() => {
    const fetchUserData = async () => {
        if (chatState.currentUser) {
            try {
                const res = await fetch(`/api/data?userId=${chatState.currentUser.id}`);
                if (res.ok) {
                    const cloudData = await res.json();
                    if (cloudData && cloudData.sessions && cloudData.sessions.length > 0) {
                        setChatState(prev => ({
                            ...prev,
                            ...cloudData,
                            currentUser: prev.currentUser // Ensure user info persists
                        }));
                    }
                }
            } catch (error) {
                console.error("Failed to sync from cloud", error);
            }
        }
    };
    fetchUserData();
  }, [chatState.currentUser?.id]);

  // 2. On Change, Save Data (Debounced logic could be added, but simple save for now)
  useEffect(() => {
    const dataToSave = {
        messages: chatState.messages,
        categories: chatState.categories,
        sessions: chatState.sessions,
        currentSessionId: chatState.currentSessionId,
        currentMode: chatState.currentMode
    };

    if (chatState.currentUser) {
        // Cloud Sync
        fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: chatState.currentUser.id,
                data: dataToSave
            })
        }).catch(e => console.error("Cloud save failed", e));
    } else {
        // Local Sync (Guest)
        localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(dataToSave));
    }
  }, [chatState.messages, chatState.categories, chatState.sessions, chatState.currentSessionId, chatState.currentMode, chatState.currentUser]);


  // --- Auth Handlers ---

  const handleRegister = async (username: string, password: string, phoneNumber: string) => {
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, phoneNumber })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    // Auto login
    await handleLogin(username, password);
  };

  const handleLogin = async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const { user, data: cloudData } = data;

    // Save user info locally to persist login state across reloads
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));

    // Merge Cloud Data
    setChatState(prev => ({
        ...prev,
        currentUser: user,
        ...cloudData, // Apply cloud data
        isLoading: false
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem(USER_INFO_KEY);
    
    // Switch to guest mode (try load guest data)
    const guestDataStr = localStorage.getItem(GUEST_DATA_KEY);
    let guestData = {
        messages: [],
        categories: [],
        sessions: [{ id: generateId(), title: '新对话', updatedAt: Date.now() }],
        currentSessionId: '',
        currentMode: ExamMode.XING_CE
    };
    
    if (guestDataStr) {
        guestData = { ...guestData, ...JSON.parse(guestDataStr) };
    }
    if (!guestData.currentSessionId) guestData.currentSessionId = guestData.sessions[0].id;

    setChatState({
        ...guestData,
        currentUser: null,
        isLoading: false,
        showFavoritesOnly: false
    });
  };

  // --- Chat Logic ---

  const handleCreateSession = () => {
    const newSessionId = generateId();
    const newSession: Session = {
      id: newSessionId,
      title: '新对话',
      updatedAt: Date.now()
    };

    setChatState(prev => ({
      ...prev,
      sessions: [...prev.sessions, newSession],
      currentSessionId: newSessionId,
      showFavoritesOnly: false, // Switch back to chat view
      isLoading: false
    }));
  };

  const handleSelectSession = (sessionId: string) => {
    setChatState(prev => {
        return {
            ...prev,
            currentSessionId: sessionId,
            showFavoritesOnly: false
        };
    });
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    setChatState(prev => {
        const remainingSessions = prev.sessions.filter(s => s.id !== sessionId);
        
        let nextSessionId = prev.currentSessionId;
        if (prev.currentSessionId === sessionId) {
            nextSessionId = remainingSessions.length > 0 ? remainingSessions[0].id : '';
             if (!nextSessionId) {
                 const newId = generateId();
                 remainingSessions.push({ id: newId, title: '新对话', updatedAt: Date.now() });
                 nextSessionId = newId;
             }
        }
        const filteredMessages = prev.messages.filter(m => m.sessionId !== sessionId);

        return {
            ...prev,
            sessions: remainingSessions,
            currentSessionId: nextSessionId,
            messages: filteredMessages
        };
    });
  };

  const handleModeChange = (mode: ExamMode) => {
    if (mode === chatState.currentMode) return;
    const currentSessionMessages = chatState.messages.filter(m => m.sessionId === chatState.currentSessionId);

    if (currentSessionMessages.length > 0) {
      const systemMsg: Message = {
        id: generateId(),
        role: 'model',
        text: `已切换模式：${MODE_LABELS[mode]}`,
        timestamp: Date.now(),
        isSystem: true,
        mode: mode,
        sessionId: chatState.currentSessionId
      };
      
      setChatState(prev => ({
          ...prev,
          currentMode: mode,
          messages: [...prev.messages, systemMsg]
      }));
    } else {
      setChatState(prev => ({ ...prev, currentMode: mode }));
    }
  };

  const handleSendMessage = useCallback(async (text: string, image?: string) => {
    const activeSessionId = chatState.currentSessionId;
    
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      text,
      image,
      timestamp: Date.now(),
      mode: chatState.currentMode,
      sessionId: activeSessionId
    };

    setChatState(prev => {
        const currentSessionMessages = prev.messages.filter(m => m.sessionId === activeSessionId && m.role === 'user');
        let updatedSessions = [...prev.sessions];
        
        if (currentSessionMessages.length === 0) {
            updatedSessions = updatedSessions.map(s => 
                s.id === activeSessionId 
                ? { ...s, title: text.slice(0, 15) + (text.length > 15 ? '...' : ''), updatedAt: Date.now() } 
                : s
            );
        } else {
             updatedSessions = updatedSessions.map(s => 
                s.id === activeSessionId 
                ? { ...s, updatedAt: Date.now() } 
                : s
            );
        }

        return {
            ...prev,
            messages: [...prev.messages, userMsg],
            sessions: updatedSessions,
            isLoading: true,
            showFavoritesOnly: false
        };
    });

    try {
      const historyForApi = chatState.messages
        .filter(m => m.sessionId === activeSessionId && !m.isError && !m.isSystem)
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }] 
        }));

      const response = await sendMessageToGemini({
        text,
        image,
        mode: chatState.currentMode,
        history: historyForApi
      });

      const modelMsg: Message = {
        id: generateId(),
        role: 'model',
        text: response.text,
        timestamp: Date.now(),
        mode: chatState.currentMode,
        sessionId: activeSessionId
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, modelMsg],
        isLoading: false
      }));

    } catch (error) {
      const errorMsg: Message = {
        id: generateId(),
        role: 'model',
        text: "抱歉，出现了一些网络问题，请重试。",
        timestamp: Date.now(),
        isError: true,
        mode: chatState.currentMode,
        sessionId: activeSessionId
      };
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMsg],
        isLoading: false
      }));
    }
  }, [chatState.currentMode, chatState.messages, chatState.currentSessionId]);

  const handleClearHistory = () => {
    if (chatState.currentUser) {
        // Clear via API
        fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: chatState.currentUser.id,
                data: {
                    messages: [],
                    categories: [],
                    sessions: [{ id: generateId(), title: '新对话', updatedAt: Date.now() }],
                    currentSessionId: generateId(), // Temp placeholder, will be overwritten by state update
                    currentMode: ExamMode.XING_CE
                }
            })
        });
    } else {
        localStorage.removeItem(GUEST_DATA_KEY);
    }
    
    // Reset state
    const newSessionId = generateId();
    setChatState(prev => ({
      ...prev,
      messages: [],
      categories: [],
      sessions: [{ id: newSessionId, title: '新对话', updatedAt: Date.now() }],
      currentSessionId: newSessionId,
      isLoading: false,
      currentMode: ExamMode.XING_CE,
      showFavoritesOnly: false
    }));
  };

  const toggleFavoritesView = () => {
    setChatState(prev => ({
      ...prev,
      showFavoritesOnly: !prev.showFavoritesOnly
    }));
  };

  const handleCreateCategory = (name: string, mode: ExamMode, parentId?: string) => {
    const newCat: Category = {
      id: generateId(),
      name,
      mode,
      createdAt: Date.now(),
      parentId
    };
    setChatState(prev => ({
      ...prev,
      categories: [...prev.categories, newCat]
    }));
    return newCat.id;
  };

  const handleDeleteCategory = (id: string) => {
    setChatState(prev => ({
      ...prev,
      categories: prev.categories
        .filter(c => c.id !== id)
        .map(c => c.parentId === id ? { ...c, parentId: undefined } : c),
      messages: prev.messages.map(m => m.categoryId === id ? { ...m, categoryId: undefined } : m)
    }));
  };

  const handleSaveMessage = (messageId: string, categoryId: string) => {
    setChatState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, isBookmarked: true, categoryId: categoryId === '' ? undefined : categoryId } 
          : msg
      )
    }));
  };

  const handleRemoveMessage = (messageId: string) => {
     setChatState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, isBookmarked: false, categoryId: undefined, note: undefined }
          : msg
      )
    }));
  };

  const handleUpdateNote = (messageId: string, noteContent: string) => {
    setChatState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, note: noteContent }
          : msg
      )
    }));
  };

  const activeMessages = chatState.messages.filter(m => m.sessionId === chatState.currentSessionId);

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col font-sans text-gray-900 overflow-hidden">
      <ConfirmationModal 
        isOpen={isClearHistoryModalOpen}
        onClose={() => setIsClearHistoryModalOpen(false)}
        onConfirm={handleClearHistory}
        title="清空当前数据"
        message={chatState.currentUser ? `确定要清空 ${chatState.currentUser.username} 的云端记录吗？` : "确定要清空游客模式的所有数据吗？"}
        isDangerous={true}
        confirmText="全部清空"
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <HistorySidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={chatState.sessions}
        currentSessionId={chatState.currentSessionId}
        onSelectSession={handleSelectSession}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
      />

      <Header 
        user={chatState.currentUser}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogoutClick={handleLogout}
        onClearHistory={() => setIsClearHistoryModalOpen(true)} 
        showFavoritesOnly={chatState.showFavoritesOnly}
        onToggleFavorites={toggleFavoritesView}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />
      
      {chatState.showFavoritesOnly ? (
         <main className="flex-1 relative w-full h-full overflow-hidden">
            <NotebookView 
              messages={chatState.messages}
              categories={chatState.categories}
              onCreateCategory={handleCreateCategory}
              onDeleteCategory={handleDeleteCategory}
              onRemoveMessage={handleRemoveMessage}
              onUpdateNote={handleUpdateNote}
            />
         </main>
      ) : (
        <>
          <div className="flex-shrink-0 z-10 bg-gray-50 pt-2 px-2 md:px-4 border-b border-transparent">
            <ModeSelector 
              currentMode={chatState.currentMode} 
              onSelectMode={handleModeChange}
              disabled={chatState.isLoading}
            />
          </div>

          <main className="flex-1 relative w-full max-w-5xl mx-auto">
            <ChatInterface 
              messages={activeMessages}
              categories={chatState.categories} 
              isLoading={chatState.isLoading}
              onSendMessage={handleSendMessage}
              currentMode={chatState.currentMode}
              onSaveMessage={handleSaveMessage} 
              onCreateCategory={(name) => handleCreateCategory(name, chatState.currentMode)} 
              onUpdateNote={handleUpdateNote}
            />
          </main>
        </>
      )}
    </div>
  );
};

export default App;