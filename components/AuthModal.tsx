import React, { useState, useEffect } from 'react';
import { X, User, Lock, ArrowRight, Sparkles, GraduationCap, Phone, MessageSquareCode } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string, phoneNumber: string) => Promise<void>;
}

const AuthModal: React.FC<Props> = ({ isOpen, onClose, onLogin, onRegister }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  // Verification State
  const [countdown, setCountdown] = useState(0);
  const [sentCode, setSentCode] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Timer Effect
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Reset state when modal opens/closes or view changes
  useEffect(() => {
    if (isOpen) {
        setError('');
        setUsername('');
        setPassword('');
        setPhoneNumber('');
        setVerificationCode('');
        setSentCode(null);
        setCountdown(0);
    }
  }, [isOpen, isLoginView]);

  if (!isOpen) return null;

  const handleSendCode = () => {
    if (!phoneNumber) {
        setError('请输入手机号');
        return;
    }
    // Simple regex for Chinese phone numbers
    if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
        setError('请输入正确的11位手机号');
        return;
    }

    setError('');
    const mockCode = Math.floor(1000 + Math.random() * 9000).toString();
    setSentCode(mockCode);
    setCountdown(60); // Start 60s countdown
    
    // Simulate SMS sending
    setTimeout(() => {
        alert(`【公考智囊】您的验证码是：${mockCode}，请在1分钟内输入。`);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    if (!isLoginView) {
        if (!phoneNumber) {
            setError('请输入手机号');
            return;
        }
        if (!verificationCode) {
            setError('请输入验证码');
            return;
        }
        if (verificationCode !== sentCode) {
            setError('验证码错误或已过期');
            return;
        }
    }

    setIsLoading(true);

    try {
      if (isLoginView) {
        await onLogin(username, password);
      } else {
        await onRegister(username, password, phoneNumber);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-blue-900/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 m-4">
        
        {/* Left Side (Decorative) - Hidden on mobile */}
        <div className="hidden md:flex w-1/3 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="z-10">
             <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md mb-4">
                <GraduationCap size={24} className="text-white" />
             </div>
             <h3 className="font-bold text-xl leading-tight">公考智囊<br/><span className="text-blue-200 text-sm font-normal">GongKao Pro</span></h3>
          </div>
          <div className="z-10 text-xs text-blue-100 opacity-80 leading-relaxed">
             {isLoginView ? "登录以同步您的学习进度、错题本和模拟考记录。" : "注册账号，开启您的智能备考之旅。"}
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="flex-1 p-6 md:p-8 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mb-6 mt-2">
            <h2 className="text-2xl font-bold text-gray-800">{isLoginView ? '欢迎回来' : '创建账号'}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isLoginView ? '请登录您的账号' : '免费注册一个新账号'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">用户名</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="请输入用户名"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">密码</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="请输入密码"
                />
              </div>
            </div>

            {/* Registration Only Fields */}
            {!isLoginView && (
                <>
                    <div className="space-y-1 animate-in slide-in-from-top-1">
                        <label className="text-xs font-bold text-gray-500 ml-1">手机号</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Phone size={18} />
                            </div>
                            <input 
                                type="tel" 
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                placeholder="请输入11位手机号"
                            />
                        </div>
                    </div>

                    <div className="space-y-1 animate-in slide-in-from-top-1">
                        <label className="text-xs font-bold text-gray-500 ml-1">验证码</label>
                        <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <MessageSquareCode size={18} />
                                </div>
                                <input 
                                    type="text" 
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    placeholder="输入验证码"
                                    maxLength={6}
                                />
                            </div>
                            <button 
                                type="button"
                                onClick={handleSendCode}
                                disabled={countdown > 0}
                                className={`w-28 flex-shrink-0 rounded-xl font-bold text-xs transition-colors border ${
                                    countdown > 0 
                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                                    : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                                }`}
                            >
                                {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {error && (
              <div className="text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-100 animate-in slide-in-from-left-2 flex items-center gap-1">
                <span>⚠️</span> {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>{isLoginView ? '立即登录' : '立即注册'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {isLoginView ? '还没有账号？' : '已有账号？'}
              <button 
                onClick={() => { setIsLoginView(!isLoginView); setError(''); }}
                className="text-blue-600 font-bold ml-1 hover:underline focus:outline-none"
              >
                {isLoginView ? '去注册' : '去登录'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;