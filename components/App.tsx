'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import ModeSelector from './ModeSelector';
import ChatInterface from './ChatInterface';
import NotebookView from './NotebookView';
import ConfirmationModal from './ConfirmationModal';
import HistorySidebar from './HistorySidebar';
import AuthModal from './AuthModal';
import ToastContainer from './ToastContainer';
import { ChatState, ExamMode, Message, Category, Session, User, QuizConfig } from '../types';
import { sendMessageToGemini, generateQuiz } from '../services/geminiService';
import { MODE_LABELS } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { getApiPath } from '../config/api';
import { getMembershipInfo, MembershipInfo } from '../services/membershipService';
import { useToast } from '../hooks/useToast';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// LocalStorage Keys (Only for Guest/Token)
const GUEST_DATA_KEY = 'gongkao_guest_data';
const USER_INFO_KEY = 'gongkao_user_info';
const TOKEN_KEY = 'gongkao_token'; 

const App: React.FC = () => {
  const router = useRouter();

  // --- Initial State Initialization ---
  const [chatState, setChatState] = useState<ChatState>({
    currentUser: null,
    messages: [],
    categories: [],
    sessions: [{ id: 'initial-session', title: '新对话', updatedAt: 0 }],
    currentSessionId: 'initial-session',
    isLoading: false,
    currentMode: ExamMode.XING_CE,
    showFavoritesOnly: false
  });

  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [token, setToken] = useState<string>('');
  const [membershipInfo, setMembershipInfo] = useState<MembershipInfo | null>(null);

  // Sidebar States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  // Toast system
  const { toasts, showToast, removeToast } = useToast();

  // --- Client-side Initialization ---
  useEffect(() => {
    if (isInitialized) return;

    // 1. Check if user was logged in
    const userStr = localStorage.getItem(USER_INFO_KEY);
    const savedUser = userStr ? JSON.parse(userStr) : null;
    const savedToken = localStorage.getItem(TOKEN_KEY) || '';

    setToken(savedToken);

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

    // 2. If Guest, try load local data
    if (!savedUser) {
        const guestData = localStorage.getItem(GUEST_DATA_KEY);
        if (guestData) {
            setChatState({ ...defaultState, ...JSON.parse(guestData) });
            setIsInitialized(true);
            setIsDataLoaded(true);
            return;
        }
    }

    setChatState(defaultState);
    setIsInitialized(true);
    // Don't set isDataLoaded yet - wait for cloud data to load
  }, [isInitialized]);

  // Load membership info when user logs in
  useEffect(() => {
    const loadMembershipInfo = async () => {
      if (token && chatState.currentUser) {
        try {
          const info = await getMembershipInfo(token);
          setMembershipInfo(info);
        } catch (error) {
          console.error('Failed to load membership info:', error);
        }
      }
    };
    loadMembershipInfo();
  }, [token, chatState.currentUser]);

  // Toggle Logic
  const handleSidebarToggle = () => {
      // Check viewport width to decide which state to toggle
      if (typeof window !== 'undefined' && window.innerWidth >= 768) { // md breakpoint
          setIsDesktopSidebarOpen(prev => !prev);
      } else {
          setIsMobileMenuOpen(prev => !prev);
      }
  };

  // --- Data Sync Effect ---
  // 1. On Mount (or User Change), Load Data
  useEffect(() => {
    const fetchUserData = async () => {
        if (chatState.currentUser) {
            try {
                const res = await fetch(getApiPath(`/api/data?userId=${chatState.currentUser.id}`));
                if (res.ok) {
                    const cloudData = await res.json();
                    if (cloudData && cloudData.sessions && cloudData.sessions.length > 0) {
                        setChatState(prev => ({
                            ...prev,
                            ...cloudData,
                            currentUser: prev.currentUser, // Ensure user info persists
                            currentSessionId: cloudData.currentSessionId || cloudData.sessions[0].id // Ensure valid session ID
                        }));
                    }
                    setIsDataLoaded(true);
                }
            } catch (error) {
                console.error("Failed to sync from cloud", error);
                setIsDataLoaded(true);
            }
        } else if (isInitialized) {
            // Guest mode - data already loaded from localStorage
            setIsDataLoaded(true);
        }
    };
    fetchUserData();
  }, [chatState.currentUser?.id, isInitialized]);

  // 2. On Change, Save Data (Debounced logic could be added, but simple save for now)
  useEffect(() => {
    // Don't save until data is loaded from cloud/localStorage
    if (!isDataLoaded) return;

    const dataToSave = {
        messages: chatState.messages,
        categories: chatState.categories,
        sessions: chatState.sessions,
        currentSessionId: chatState.currentSessionId,
        currentMode: chatState.currentMode
    };

    if (chatState.currentUser) {
        // Cloud Sync
        fetch(getApiPath('/api/data'), {
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
  }, [chatState.messages, chatState.categories, chatState.sessions, chatState.currentSessionId, chatState.currentMode, chatState.currentUser, isDataLoaded]);


  // --- Auth Handlers ---

  const handleRegister = async (username: string, password: string, email: string, verificationCode: string) => {
    const res = await fetch(getApiPath('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, verificationCode })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    // Auto login
    await handleLogin(username, password);
  };

  const handleLogin = async (username: string, password: string) => {
    const res = await fetch(getApiPath('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const { user, data: cloudData, token: authToken } = data;

    // Save user info and token locally
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, authToken);
    setToken(authToken);

    // Merge Cloud Data
    setChatState(prev => ({
        ...prev,
        currentUser: user,
        ...cloudData, // Apply cloud data
        isLoading: false
    }));
    setIsDataLoaded(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(USER_INFO_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setMembershipInfo(null);
    setIsDataLoaded(false);

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

    // Set data loaded after switching to guest mode
    setIsDataLoaded(true);
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

  const handleSendMessage = useCallback(async (text: string, image?: string, quizConfig?: QuizConfig) => {
    const activeSessionId = chatState.currentSessionId;
    const isQuizRequest = text === "start_quiz_mode" && !!quizConfig;
    const displayText = isQuizRequest 
        ? `开始刷题：${quizConfig.topic} (${quizConfig.count}题)` 
        : text;

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      text: displayText,
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
                ? { ...s, title: displayText.slice(0, 15) + (displayText.length > 15 ? '...' : ''), updatedAt: Date.now() } 
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
      if (isQuizRequest) {
          // --- QUIZ FLOW ---
          const quizData = await generateQuiz(chatState.currentMode, quizConfig.topic, quizConfig.count, token);

          const modelMsg: Message = {
            id: generateId(),
            role: 'model',
            text: `已为您生成 ${quizConfig.count} 道 [${quizConfig.topic}] 模拟题，计时开始！`,
            quizData: quizData,
            timestamp: Date.now(),
            mode: chatState.currentMode,
            sessionId: activeSessionId
          };

          setChatState(prev => ({
            ...prev,
            messages: [...prev.messages, modelMsg],
            isLoading: false
          }));

          // 立即刷新会员信息以更新剩余次数
          if (token && chatState.currentUser) {
            try {
              const updatedInfo = await getMembershipInfo(token);
              setMembershipInfo(updatedInfo);
            } catch (error) {
              console.error('Failed to refresh membership info:', error);
            }
          }

      } else {
          // --- STANDARD CHAT FLOW ---
          const historyForApi = chatState.messages
            .filter(m => m.sessionId === activeSessionId && !m.isError && !m.isSystem && !m.quizData) // Filter out complex quiz messages from history to keep context clean
            .map(m => ({
              role: m.role,
              parts: [{ text: m.text }]
            }));

          const response = await sendMessageToGemini({
            text,
            image,
            mode: chatState.currentMode,
            history: historyForApi,
            token
          });

          // Check if login is needed
          if (response.needLogin) {
            setChatState(prev => ({
              ...prev,
              isLoading: false
            }));
            showToast('请先登录后再使用 AI 对话功能', 'warning');
            setIsAuthModalOpen(true);
            return;
          }

          // Check if upgrade is needed
          if (response.needUpgrade) {
            const errorMsg: Message = {
              id: generateId(),
              role: 'model',
              text: response.text,
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
            // Navigate to membership page
            router.push('/membership');
            return;
          }

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

          // 立即刷新会员信息以更新剩余次数
          if (token && chatState.currentUser) {
            try {
              const updatedInfo = await getMembershipInfo(token);
              setMembershipInfo(updatedInfo);
            } catch (error) {
              console.error('Failed to refresh membership info:', error);
            }
          }
      }

    } catch (error: any) {
      // Check if login is needed
      if (error.message === 'NEED_LOGIN') {
        setChatState(prev => ({
          ...prev,
          isLoading: false
        }));
        showToast('请先登录后再使用 AI 对话功能', 'warning');
        setIsAuthModalOpen(true);
        return;
      }

      // Check if it's an upgrade error
      if (error.message && error.message.includes('免费次数已用完')) {
        const errorMsg: Message = {
          id: generateId(),
          role: 'model',
          text: error.message,
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
        // Navigate to membership page
        router.push('/membership');
        return;
      }

      const errorMsg: Message = {
        id: generateId(),
        role: 'model',
        text: "抱歉，生成内容时出现错误，请重试。",
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
  }, [chatState.currentMode, chatState.messages, chatState.currentSessionId, token]);

  const handleClearHistory = () => {
    if (chatState.currentUser) {
        // Clear via API
        fetch(getApiPath('/api/data'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: chatState.currentUser.id,
                data: {
                    messages: [],
                    categories: [],
                    sessions: [{ id: generateId(), title: '新对话', updatedAt: Date.now() }],
                    currentSessionId: generateId(), 
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

  const handleUpgradeClick = () => {
    router.push('/membership');
  };

  return (
    <div className="h-screen w-full bg-[#fcfaf8] flex font-sans text-stone-800 overflow-hidden">
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
        showToast={showToast}
      />

      {/* Responsive Sidebar */}
      <HistorySidebar 
        isMobileOpen={isMobileMenuOpen}
        isDesktopOpen={isDesktopSidebarOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
        sessions={chatState.sessions}
        currentSessionId={chatState.currentSessionId}
        onSelectSession={handleSelectSession}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Main Content Area - Flex Column */}
      <div className="flex-1 flex flex-col h-full relative w-full overflow-hidden transition-all">
          <Header
            user={chatState.currentUser}
            onLoginClick={() => setIsAuthModalOpen(true)}
            onLogoutClick={handleLogout}
            onClearHistory={() => setIsClearHistoryModalOpen(true)}
            showFavoritesOnly={chatState.showFavoritesOnly}
            onToggleFavorites={toggleFavoritesView}
            onToggleSidebar={handleSidebarToggle}
            isSidebarOpen={isDesktopSidebarOpen}
            membershipInfo={membershipInfo}
            onUpgradeClick={handleUpgradeClick}
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
                  showToast={showToast}
                />
             </main>
          ) : (
            <>
              {/* Sticky Mode Selector */}
              <div className="flex-shrink-0 z-10 bg-[#fcfaf8] pt-4 px-4 border-b border-transparent">
                <ModeSelector 
                  currentMode={chatState.currentMode} 
                  onSelectMode={handleModeChange}
                  disabled={chatState.isLoading}
                />
              </div>

              {/* Chat Area */}
              <main className="flex-1 relative w-full mx-auto max-w-6xl">
                <ChatInterface
                  messages={activeMessages}
                  categories={chatState.categories}
                  isLoading={chatState.isLoading}
                  onSendMessage={handleSendMessage}
                  currentMode={chatState.currentMode}
                  onSaveMessage={handleSaveMessage}
                  onCreateCategory={(name) => handleCreateCategory(name, chatState.currentMode)}
                  onUpdateNote={handleUpdateNote}
                  membershipInfo={membershipInfo}
                  onUpgradeClick={handleUpgradeClick}
                  showToast={showToast}
                />
              </main>
            </>
          )}
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default App;