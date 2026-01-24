module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/components/App.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.4_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.4_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module './components/Header'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module './components/ModeSelector'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module './components/ChatInterface'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module './components/NotebookView'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module './components/ConfirmationModal'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module './components/HistorySidebar'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module './components/AuthModal'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module './types'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module './services/geminiService'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module './constants'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
const generateId = ()=>Date.now().toString(36) + Math.random().toString(36).substr(2);
// LocalStorage Keys (Only for Guest/Token)
const GUEST_DATA_KEY = 'gongkao_guest_data';
const USER_INFO_KEY = 'gongkao_user_info';
const App = ()=>{
    // --- Initial State Initialization ---
    const [chatState, setChatState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        // 1. Check if user was logged in
        let savedUser = null;
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const defaultState = {
            currentUser: savedUser,
            messages: [],
            categories: [],
            sessions: [
                {
                    id: generateId(),
                    title: '新对话',
                    updatedAt: Date.now()
                }
            ],
            currentSessionId: '',
            isLoading: false,
            currentMode: ExamMode.XING_CE,
            showFavoritesOnly: false
        };
        defaultState.currentSessionId = defaultState.sessions[0].id;
        // 2. If Guest, try load local data immediately
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        // 3. If User, data will be loaded via useEffect from API
        return defaultState;
    });
    const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Sidebar States
    const [isMobileMenuOpen, setIsMobileMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // Toggle Logic
    const handleSidebarToggle = ()=>{
        // Check viewport width to decide which state to toggle
        if (window.innerWidth >= 768) {
            setIsDesktopSidebarOpen((prev)=>!prev);
        } else {
            setIsMobileMenuOpen((prev)=>!prev);
        }
    };
    // --- Data Sync Effect ---
    // 1. On Mount (or User Change), Load Data
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const fetchUserData = async ()=>{
            if (chatState.currentUser) {
                try {
                    const res = await fetch(`/api/data?userId=${chatState.currentUser.id}`);
                    if (res.ok) {
                        const cloudData = await res.json();
                        if (cloudData && cloudData.sessions && cloudData.sessions.length > 0) {
                            setChatState((prev)=>({
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
    }, [
        chatState.currentUser?.id
    ]);
    // 2. On Change, Save Data (Debounced logic could be added, but simple save for now)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: chatState.currentUser.id,
                    data: dataToSave
                })
            }).catch((e)=>console.error("Cloud save failed", e));
        } else {
            // Local Sync (Guest)
            localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(dataToSave));
        }
    }, [
        chatState.messages,
        chatState.categories,
        chatState.sessions,
        chatState.currentSessionId,
        chatState.currentMode,
        chatState.currentUser
    ]);
    // --- Auth Handlers ---
    const handleRegister = async (username, password, phoneNumber)=>{
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                phoneNumber
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        // Auto login
        await handleLogin(username, password);
    };
    const handleLogin = async (username, password)=>{
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        const { user, data: cloudData } = data;
        // Save user info locally to persist login state across reloads
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
        // Merge Cloud Data
        setChatState((prev)=>({
                ...prev,
                currentUser: user,
                ...cloudData,
                isLoading: false
            }));
    };
    const handleLogout = ()=>{
        localStorage.removeItem(USER_INFO_KEY);
        // Switch to guest mode (try load guest data)
        const guestDataStr = localStorage.getItem(GUEST_DATA_KEY);
        let guestData = {
            messages: [],
            categories: [],
            sessions: [
                {
                    id: generateId(),
                    title: '新对话',
                    updatedAt: Date.now()
                }
            ],
            currentSessionId: '',
            currentMode: ExamMode.XING_CE
        };
        if (guestDataStr) {
            guestData = {
                ...guestData,
                ...JSON.parse(guestDataStr)
            };
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
    const handleCreateSession = ()=>{
        const newSessionId = generateId();
        const newSession = {
            id: newSessionId,
            title: '新对话',
            updatedAt: Date.now()
        };
        setChatState((prev)=>({
                ...prev,
                sessions: [
                    ...prev.sessions,
                    newSession
                ],
                currentSessionId: newSessionId,
                showFavoritesOnly: false,
                isLoading: false
            }));
    };
    const handleSelectSession = (sessionId)=>{
        setChatState((prev)=>{
            return {
                ...prev,
                currentSessionId: sessionId,
                showFavoritesOnly: false
            };
        });
    };
    const handleDeleteSession = (sessionId, e)=>{
        setChatState((prev)=>{
            const remainingSessions = prev.sessions.filter((s)=>s.id !== sessionId);
            let nextSessionId = prev.currentSessionId;
            if (prev.currentSessionId === sessionId) {
                nextSessionId = remainingSessions.length > 0 ? remainingSessions[0].id : '';
                if (!nextSessionId) {
                    const newId = generateId();
                    remainingSessions.push({
                        id: newId,
                        title: '新对话',
                        updatedAt: Date.now()
                    });
                    nextSessionId = newId;
                }
            }
            const filteredMessages = prev.messages.filter((m)=>m.sessionId !== sessionId);
            return {
                ...prev,
                sessions: remainingSessions,
                currentSessionId: nextSessionId,
                messages: filteredMessages
            };
        });
    };
    const handleModeChange = (mode)=>{
        if (mode === chatState.currentMode) return;
        const currentSessionMessages = chatState.messages.filter((m)=>m.sessionId === chatState.currentSessionId);
        if (currentSessionMessages.length > 0) {
            const systemMsg = {
                id: generateId(),
                role: 'model',
                text: `已切换模式：${MODE_LABELS[mode]}`,
                timestamp: Date.now(),
                isSystem: true,
                mode: mode,
                sessionId: chatState.currentSessionId
            };
            setChatState((prev)=>({
                    ...prev,
                    currentMode: mode,
                    messages: [
                        ...prev.messages,
                        systemMsg
                    ]
                }));
        } else {
            setChatState((prev)=>({
                    ...prev,
                    currentMode: mode
                }));
        }
    };
    const handleSendMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (text, image, quizConfig)=>{
        const activeSessionId = chatState.currentSessionId;
        const isQuizRequest = text === "start_quiz_mode" && !!quizConfig;
        const displayText = isQuizRequest ? `开始刷题：${quizConfig.topic} (${quizConfig.count}题)` : text;
        const userMsg = {
            id: generateId(),
            role: 'user',
            text: displayText,
            image,
            timestamp: Date.now(),
            mode: chatState.currentMode,
            sessionId: activeSessionId
        };
        setChatState((prev)=>{
            const currentSessionMessages = prev.messages.filter((m)=>m.sessionId === activeSessionId && m.role === 'user');
            let updatedSessions = [
                ...prev.sessions
            ];
            if (currentSessionMessages.length === 0) {
                updatedSessions = updatedSessions.map((s)=>s.id === activeSessionId ? {
                        ...s,
                        title: displayText.slice(0, 15) + (displayText.length > 15 ? '...' : ''),
                        updatedAt: Date.now()
                    } : s);
            } else {
                updatedSessions = updatedSessions.map((s)=>s.id === activeSessionId ? {
                        ...s,
                        updatedAt: Date.now()
                    } : s);
            }
            return {
                ...prev,
                messages: [
                    ...prev.messages,
                    userMsg
                ],
                sessions: updatedSessions,
                isLoading: true,
                showFavoritesOnly: false
            };
        });
        try {
            if (isQuizRequest) {
                // --- QUIZ FLOW ---
                const quizData = await generateQuiz(chatState.currentMode, quizConfig.topic, quizConfig.count);
                const modelMsg = {
                    id: generateId(),
                    role: 'model',
                    text: `已为您生成 ${quizConfig.count} 道 [${quizConfig.topic}] 模拟题，计时开始！`,
                    quizData: quizData,
                    timestamp: Date.now(),
                    mode: chatState.currentMode,
                    sessionId: activeSessionId
                };
                setChatState((prev)=>({
                        ...prev,
                        messages: [
                            ...prev.messages,
                            modelMsg
                        ],
                        isLoading: false
                    }));
            } else {
                // --- STANDARD CHAT FLOW ---
                const historyForApi = chatState.messages.filter((m)=>m.sessionId === activeSessionId && !m.isError && !m.isSystem && !m.quizData) // Filter out complex quiz messages from history to keep context clean
                .map((m)=>({
                        role: m.role,
                        parts: [
                            {
                                text: m.text
                            }
                        ]
                    }));
                const response = await sendMessageToGemini({
                    text,
                    image,
                    mode: chatState.currentMode,
                    history: historyForApi
                });
                const modelMsg = {
                    id: generateId(),
                    role: 'model',
                    text: response.text,
                    timestamp: Date.now(),
                    mode: chatState.currentMode,
                    sessionId: activeSessionId
                };
                setChatState((prev)=>({
                        ...prev,
                        messages: [
                            ...prev.messages,
                            modelMsg
                        ],
                        isLoading: false
                    }));
            }
        } catch (error) {
            const errorMsg = {
                id: generateId(),
                role: 'model',
                text: "抱歉，生成内容时出现错误，请重试。",
                timestamp: Date.now(),
                isError: true,
                mode: chatState.currentMode,
                sessionId: activeSessionId
            };
            setChatState((prev)=>({
                    ...prev,
                    messages: [
                        ...prev.messages,
                        errorMsg
                    ],
                    isLoading: false
                }));
        }
    }, [
        chatState.currentMode,
        chatState.messages,
        chatState.currentSessionId
    ]);
    const handleClearHistory = ()=>{
        if (chatState.currentUser) {
            // Clear via API
            fetch('/api/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: chatState.currentUser.id,
                    data: {
                        messages: [],
                        categories: [],
                        sessions: [
                            {
                                id: generateId(),
                                title: '新对话',
                                updatedAt: Date.now()
                            }
                        ],
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
        setChatState((prev)=>({
                ...prev,
                messages: [],
                categories: [],
                sessions: [
                    {
                        id: newSessionId,
                        title: '新对话',
                        updatedAt: Date.now()
                    }
                ],
                currentSessionId: newSessionId,
                isLoading: false,
                currentMode: ExamMode.XING_CE,
                showFavoritesOnly: false
            }));
    };
    const toggleFavoritesView = ()=>{
        setChatState((prev)=>({
                ...prev,
                showFavoritesOnly: !prev.showFavoritesOnly
            }));
    };
    const handleCreateCategory = (name, mode, parentId)=>{
        const newCat = {
            id: generateId(),
            name,
            mode,
            createdAt: Date.now(),
            parentId
        };
        setChatState((prev)=>({
                ...prev,
                categories: [
                    ...prev.categories,
                    newCat
                ]
            }));
        return newCat.id;
    };
    const handleDeleteCategory = (id)=>{
        setChatState((prev)=>({
                ...prev,
                categories: prev.categories.filter((c)=>c.id !== id).map((c)=>c.parentId === id ? {
                        ...c,
                        parentId: undefined
                    } : c),
                messages: prev.messages.map((m)=>m.categoryId === id ? {
                        ...m,
                        categoryId: undefined
                    } : m)
            }));
    };
    const handleSaveMessage = (messageId, categoryId)=>{
        setChatState((prev)=>({
                ...prev,
                messages: prev.messages.map((msg)=>msg.id === messageId ? {
                        ...msg,
                        isBookmarked: true,
                        categoryId: categoryId === '' ? undefined : categoryId
                    } : msg)
            }));
    };
    const handleRemoveMessage = (messageId)=>{
        setChatState((prev)=>({
                ...prev,
                messages: prev.messages.map((msg)=>msg.id === messageId ? {
                        ...msg,
                        isBookmarked: false,
                        categoryId: undefined,
                        note: undefined
                    } : msg)
            }));
    };
    const handleUpdateNote = (messageId, noteContent)=>{
        setChatState((prev)=>({
                ...prev,
                messages: prev.messages.map((msg)=>msg.id === messageId ? {
                        ...msg,
                        note: noteContent
                    } : msg)
            }));
    };
    const activeMessages = chatState.messages.filter((m)=>m.sessionId === chatState.currentSessionId);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-screen w-full bg-[#fcfaf8] flex font-sans text-stone-800 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ConfirmationModal, {
                isOpen: isClearHistoryModalOpen,
                onClose: ()=>setIsClearHistoryModalOpen(false),
                onConfirm: handleClearHistory,
                title: "清空当前数据",
                message: chatState.currentUser ? `确定要清空 ${chatState.currentUser.username} 的云端记录吗？` : "确定要清空游客模式的所有数据吗？",
                isDangerous: true,
                confirmText: "全部清空"
            }, void 0, false, {
                fileName: "[project]/components/App.tsx",
                lineNumber: 489,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthModal, {
                isOpen: isAuthModalOpen,
                onClose: ()=>setIsAuthModalOpen(false),
                onLogin: handleLogin,
                onRegister: handleRegister
            }, void 0, false, {
                fileName: "[project]/components/App.tsx",
                lineNumber: 499,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(HistorySidebar, {
                isMobileOpen: isMobileMenuOpen,
                isDesktopOpen: isDesktopSidebarOpen,
                onMobileClose: ()=>setIsMobileMenuOpen(false),
                sessions: chatState.sessions,
                currentSessionId: chatState.currentSessionId,
                onSelectSession: handleSelectSession,
                onCreateSession: handleCreateSession,
                onDeleteSession: handleDeleteSession
            }, void 0, false, {
                fileName: "[project]/components/App.tsx",
                lineNumber: 507,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex flex-col h-full relative w-full overflow-hidden transition-all",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Header, {
                        user: chatState.currentUser,
                        onLoginClick: ()=>setIsAuthModalOpen(true),
                        onLogoutClick: handleLogout,
                        onClearHistory: ()=>setIsClearHistoryModalOpen(true),
                        showFavoritesOnly: chatState.showFavoritesOnly,
                        onToggleFavorites: toggleFavoritesView,
                        onToggleSidebar: handleSidebarToggle,
                        isSidebarOpen: isDesktopSidebarOpen
                    }, void 0, false, {
                        fileName: "[project]/components/App.tsx",
                        lineNumber: 520,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    chatState.showFavoritesOnly ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex-1 relative w-full h-full overflow-hidden",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(NotebookView, {
                            messages: chatState.messages,
                            categories: chatState.categories,
                            onCreateCategory: handleCreateCategory,
                            onDeleteCategory: handleDeleteCategory,
                            onRemoveMessage: handleRemoveMessage,
                            onUpdateNote: handleUpdateNote
                        }, void 0, false, {
                            fileName: "[project]/components/App.tsx",
                            lineNumber: 533,
                            columnNumber: 17
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/App.tsx",
                        lineNumber: 532,
                        columnNumber: 14
                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-shrink-0 z-10 bg-[#fcfaf8] pt-4 px-4 border-b border-transparent",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ModeSelector, {
                                    currentMode: chatState.currentMode,
                                    onSelectMode: handleModeChange,
                                    disabled: chatState.isLoading
                                }, void 0, false, {
                                    fileName: "[project]/components/App.tsx",
                                    lineNumber: 546,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/App.tsx",
                                lineNumber: 545,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                                className: "flex-1 relative w-full mx-auto max-w-6xl",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ChatInterface, {
                                    messages: activeMessages,
                                    categories: chatState.categories,
                                    isLoading: chatState.isLoading,
                                    onSendMessage: handleSendMessage,
                                    currentMode: chatState.currentMode,
                                    onSaveMessage: handleSaveMessage,
                                    onCreateCategory: (name)=>handleCreateCategory(name, chatState.currentMode),
                                    onUpdateNote: handleUpdateNote
                                }, void 0, false, {
                                    fileName: "[project]/components/App.tsx",
                                    lineNumber: 555,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/App.tsx",
                                lineNumber: 554,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/components/App.tsx",
                lineNumber: 519,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/App.tsx",
        lineNumber: 488,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = App;
}),
"[project]/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.4_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$App$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/App.tsx [app-ssr] (ecmascript)");
'use client';
;
;
function Home() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$4_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$App$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
}),
"[project]/node_modules/.pnpm/next@16.1.4_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/node_modules/.pnpm/next@16.1.4_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.1.4_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/node_modules/.pnpm/next@16.1.4_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.1.4_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__373462a0._.js.map