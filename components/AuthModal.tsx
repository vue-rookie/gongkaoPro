'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Lock, ArrowRight, Sparkles, GraduationCap, Mail, MessageSquareCode } from 'lucide-react';
import { getApiPath } from '../config/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string, email: string, verificationCode: string) => Promise<void>;
  showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const AuthModal: React.FC<Props> = ({ isOpen, onClose, onLogin, onRegister, showToast }) => {
  const [viewMode, setViewMode] = useState<'login' | 'register' | 'resetPassword'>('login');

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Verification State
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);

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
        setConfirmPassword('');
        setEmail('');
        setVerificationCode('');
        setCountdown(0);
    }
  }, [isOpen, viewMode]);

  if (!isOpen) return null;

  const handleSendCode = async () => {
    if (!email) {
        setError('请输入邮箱');
        return;
    }
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setError('请输入正确的邮箱地址');
        return;
    }

    setError('');
    setIsSendingCode(true);

    try {
      const type = viewMode === 'register' ? 'register' : 'reset_password';
      const response = await fetch(getApiPath('/api/auth/send-code'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '发送验证码失败');
        return;
      }

      setCountdown(60); // Start 60s countdown
      if (showToast) {
        showToast('验证码已发送到您的邮箱，请查收！', 'success');
      }
    } catch (err) {
      setError('发送验证码失败，请稍后重试');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (viewMode === 'login') {
      // Login validation
      if (!username.trim() || !password.trim()) {
        setError('请输入用户名和密码');
        return;
      }
    } else if (viewMode === 'register') {
      // Register validation
      if (!username.trim() || !password.trim() || !email.trim() || !verificationCode.trim()) {
        setError('请填写所有必填字段');
        return;
      }
      if (password.length < 6) {
        setError('密码长度至少为6位');
        return;
      }
    } else if (viewMode === 'resetPassword') {
      // Reset password validation
      if (!email.trim() || !verificationCode.trim() || !password.trim() || !confirmPassword.trim()) {
        setError('请填写所有必填字段');
        return;
      }
      if (password.length < 6) {
        setError('密码长度至少为6位');
        return;
      }
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (viewMode === 'login') {
        await onLogin(username, password);
        onClose();
      } else if (viewMode === 'register') {
        await onRegister(username, password, email, verificationCode);
        onClose();
      } else if (viewMode === 'resetPassword') {
        const response = await fetch(getApiPath('/api/auth/reset-password'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, verificationCode, newPassword: password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || '密码重置失败');
          return;
        }

        if (showToast) {
          showToast('密码重置成功，请使用新密码登录', 'success');
        }
        setViewMode('login');
      }
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#fcfaf8] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 m-4 border border-stone-200">
        
        {/* Left Side (Decorative) - Hidden on mobile */}
        <div className="hidden md:flex w-1/3 bg-[#f3f1eb] p-6 flex-col justify-between text-stone-800 relative overflow-hidden border-r border-stone-200">
          <div className="z-10">
             <div className="bg-stone-200 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <GraduationCap size={24} className="text-stone-600" />
             </div>
             <h3 className="font-bold text-xl leading-tight font-serif">公考智囊<br/><span className="text-stone-400 text-sm font-normal font-sans">GongKao Pro</span></h3>
          </div>
          <div className="z-10 text-xs text-stone-500 leading-relaxed font-serif">
             {viewMode === 'login' && "登录以同步您的学习进度、错题本和模拟考记录。"}
             {viewMode === 'register' && "注册账号，开启您的智能备考之旅。"}
             {viewMode === 'resetPassword' && "重置密码，找回您的账号访问权限。"}
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="flex-1 p-6 md:p-8 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mb-6 mt-2">
            <h2 className="text-2xl font-bold text-stone-800 font-serif">
              {viewMode === 'login' && '欢迎回来'}
              {viewMode === 'register' && '创建账号'}
              {viewMode === 'resetPassword' && '重置密码'}
            </h2>
            <p className="text-sm text-stone-500 mt-1 font-sans">
              {viewMode === 'login' && '请登录您的账号'}
              {viewMode === 'register' && '免费注册一个新账号'}
              {viewMode === 'resetPassword' && '通过邮箱验证码重置密码'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username - Only for login and register */}
            {viewMode !== 'resetPassword' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 ml-1 font-sans">用户名</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all font-sans"
                    placeholder="请输入用户名"
                  />
                </div>
              </div>
            )}

            {/* Email - Only for register and resetPassword */}
            {viewMode !== 'login' && (
              <div className="space-y-1 animate-in slide-in-from-top-1">
                <label className="text-xs font-bold text-stone-500 ml-1 font-sans">邮箱</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all font-sans"
                    placeholder="请输入邮箱地址"
                  />
                </div>
              </div>
            )}

            {/* Verification Code - Only for register and resetPassword */}
            {viewMode !== 'login' && (
              <div className="space-y-1 animate-in slide-in-from-top-1">
                <label className="text-xs font-bold text-stone-500 ml-1 font-sans">验证码</label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                      <MessageSquareCode size={18} />
                    </div>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all font-sans"
                      placeholder="输入验证码"
                      maxLength={6}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0 || isSendingCode}
                    className={`w-28 flex-shrink-0 rounded-xl font-bold text-xs transition-colors border font-sans ${
                      countdown > 0 || isSendingCode
                        ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                        : 'bg-stone-200 text-stone-600 border-stone-300 hover:bg-stone-300'
                    }`}
                  >
                    {isSendingCode ? '发送中...' : countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
                  </button>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-500 ml-1 font-sans">
                {viewMode === 'resetPassword' ? '新密码' : '密码'}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all font-sans"
                  placeholder={viewMode === 'resetPassword' ? '请输入新密码' : '请输入密码'}
                />
              </div>
            </div>

            {/* Confirm Password - Only for resetPassword */}
            {viewMode === 'resetPassword' && (
              <div className="space-y-1 animate-in slide-in-from-top-1">
                <label className="text-xs font-bold text-stone-500 ml-1 font-sans">确认密码</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all font-sans"
                    placeholder="请再次输入新密码"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-100 animate-in slide-in-from-left-2 flex items-center gap-1 font-sans">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 rounded-xl shadow-md shadow-stone-200 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 font-sans"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>
                    {viewMode === 'login' && '立即登录'}
                    {viewMode === 'register' && '立即注册'}
                    {viewMode === 'resetPassword' && '重置密码'}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {viewMode === 'login' && (
              <>
                <button
                  onClick={() => setViewMode('resetPassword')}
                  className="text-xs text-stone-600 hover:text-stone-800 hover:underline focus:outline-none font-sans"
                >
                  忘记密码？
                </button>
                <p className="text-xs text-stone-500 font-sans">
                  还没有账号？
                  <button
                    onClick={() => { setViewMode('register'); setError(''); }}
                    className="text-stone-800 font-bold ml-1 hover:underline focus:outline-none"
                  >
                    去注册
                  </button>
                </p>
              </>
            )}
            {viewMode === 'register' && (
              <p className="text-xs text-stone-500 font-sans">
                已有账号？
                <button
                  onClick={() => { setViewMode('login'); setError(''); }}
                  className="text-stone-800 font-bold ml-1 hover:underline focus:outline-none"
                >
                  去登录
                </button>
              </p>
            )}
            {viewMode === 'resetPassword' && (
              <p className="text-xs text-stone-500 font-sans">
                想起密码了？
                <button
                  onClick={() => { setViewMode('login'); setError(''); }}
                  className="text-stone-800 font-bold ml-1 hover:underline focus:outline-none"
                >
                  去登录
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;