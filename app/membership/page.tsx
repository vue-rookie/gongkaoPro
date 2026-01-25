'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Check, Sparkles, ArrowLeft, Clock, Smartphone } from 'lucide-react';
import { getMembershipPlans, MembershipPlan } from '@/services/membershipService';
import { createPayment } from '@/services/paymentService';
import { queryPaymentStatus } from '@/services/paymentService';

export default function MembershipPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [countdown, setCountdown] = useState(30 * 60);
  const [polling, setPolling] = useState(false);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    // 获取token
    const savedToken = localStorage.getItem('gongkao_token') || '';
    setToken(savedToken);

    if (!savedToken) {
      alert('请先登录');
      router.push('/');
      return;
    }

    loadPlans();
  }, []);

  useEffect(() => {
    if (!showQRCode) return;

    // 倒计时
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showQRCode]);

  useEffect(() => {
    if (!polling || !token || !orderId) return;

    // 轮询订单状态
    const pollInterval = setInterval(async () => {
      try {
        const response = await queryPaymentStatus(token, orderId);
        if (response.success && response.isPaid) {
          setPolling(false);
          clearInterval(pollInterval);
          alert('支付成功！');
          router.push('/');
        }
      } catch (error) {
        console.error('查询订单状态失败:', error);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [polling, token, orderId, router]);

  const loadPlans = async () => {
    try {
      const response = await getMembershipPlans();
      if (response.success) {
        setPlans(response.plans);
      }
    } catch (error) {
      console.error('加载套餐失败:', error);
    }
  };

  const handlePurchase = async () => {
    if (!token) {
      alert('请先登录');
      return;
    }

    setLoading(true);
    try {
      const response = await createPayment(token, selectedPlan, 'wechat');

      if (response.success && response.url_qrcode) {
        setQrCodeUrl(response.url_qrcode);
        setOrderId(response.orderId!);
        setShowQRCode(true);
        setPolling(true);
        setCountdown(30 * 60);
      } else {
        alert(response.message || '创建订单失败');
      }
    } catch (error) {
      console.error('创建支付订单失败:', error);
      alert('创建订单失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    if (showQRCode) {
      setShowQRCode(false);
      setPolling(false);
      setQrCodeUrl('');
      setOrderId('');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf8] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">返回</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Crown size={16} className="text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-stone-800">会员中心</h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {!showQRCode ? (
            // 套餐选择页面
            <div className="space-y-8">
              {/* Title */}
              <div className="text-center">
                <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2">
                  开通会员，解锁无限可能
                </h2>
                <p className="text-stone-500">
                  享受无限次AI辅导服务，助力公考上岸
                </p>
              </div>

              {/* Plans */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative border-2 rounded-2xl p-8 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl scale-[1.02]'
                        : 'border-stone-200 bg-white hover:border-amber-300 hover:shadow-lg'
                    }`}
                  >
                    {plan.discount && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                        省{plan.discount}%
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-stone-800 mb-1">{plan.name}</h3>
                        <p className="text-sm text-stone-500">{plan.duration}天有效期</p>
                      </div>
                      {selectedPlan === plan.id && (
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                          <Check size={18} className="text-white" />
                        </div>
                      )}
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-amber-600">¥{plan.price}</span>
                        {plan.discount && (
                          <span className="text-lg text-stone-400 line-through">
                            ¥{(plan.price / (1 - plan.discount / 100)).toFixed(0)}
                          </span>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3 text-stone-600">
                          <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Payment Method */}
              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <h3 className="text-lg font-semibold mb-4 text-stone-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z"/>
                    </svg>
                    支付方式
                  </h3>
                  <div className="flex items-center gap-4 bg-white rounded-xl p-4 border-2 border-green-500">
                    <svg className="w-10 h-10 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z"/>
                    </svg>
                    <div className="flex-1">
                      <p className="font-semibold text-stone-800 text-lg">微信支付</p>
                      <p className="text-sm text-stone-500">安全便捷，扫码即付</p>
                    </div>
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check size={18} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Button */}
              <div className="max-w-2xl mx-auto">
                <button
                  onClick={handlePurchase}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-5 rounded-2xl font-bold text-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      创建订单中...
                    </>
                  ) : (
                    <>
                      <Crown size={24} />
                      立即开通会员
                    </>
                  )}
                </button>

                {/* Tips */}
                <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    💡 <span className="font-semibold">温馨提示：</span>
                    开通会员后即可享受无限次AI辅导服务，支持行测、申论、面试全模块。会员到期后自动恢复为免费用户（每日3次）。
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // 支付二维码页面
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
                {/* QR Code Header */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-stone-200 px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z"/>
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-stone-800">微信扫码支付</h2>
                      <p className="text-sm text-stone-500 mt-1">请使用微信扫描二维码完成支付</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 text-center">
                  {/* QR Code */}
                  <div className="mb-8 relative">
                    <div className="bg-white p-6 rounded-2xl shadow-lg inline-block border-4 border-green-100">
                      <img
                        src={qrCodeUrl}
                        alt="支付二维码"
                        className="w-80 h-80 rounded-xl"
                      />
                    </div>
                    {/* Decorative corners */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 w-20 h-20 border-t-4 border-l-4 border-green-400 rounded-tl-2xl opacity-50"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-3 w-20 h-20 border-b-4 border-r-4 border-green-400 rounded-br-2xl opacity-50"></div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-200">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Smartphone size={20} className="text-green-600" />
                      <p className="font-semibold text-stone-800 text-lg">扫码步骤</p>
                    </div>
                    <ol className="text-stone-600 space-y-2 text-left max-w-md mx-auto">
                      <li className="flex items-start gap-3">
                        <span className="font-bold text-green-600 flex-shrink-0 text-lg">1.</span>
                        <span>打开微信，点击右上角"+"</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold text-green-600 flex-shrink-0 text-lg">2.</span>
                        <span>选择"扫一扫"</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold text-green-600 flex-shrink-0 text-lg">3.</span>
                        <span>扫描上方二维码完成支付</span>
                      </li>
                    </ol>
                  </div>

                  {/* Order Info */}
                  <div className="bg-stone-100 rounded-xl p-4 mb-6 text-sm text-stone-600">
                    <p>
                      <span className="text-stone-500">订单号：</span>
                      <span className="font-mono font-medium">{orderId}</span>
                    </p>
                  </div>

                  {/* Countdown */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Clock size={20} className="text-amber-600" />
                      <p className="font-semibold text-stone-800">订单有效期</p>
                    </div>
                    <p className="text-4xl font-bold text-amber-600 font-mono mb-2">
                      {formatTime(countdown)}
                    </p>
                    <p className="text-sm text-stone-500">订单将在倒计时结束后自动关闭</p>
                  </div>

                  {/* Waiting Status */}
                  <div className="flex items-center justify-center gap-3 text-stone-600 bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-600"></div>
                      <div className="absolute inset-0 rounded-full bg-blue-100 opacity-20 animate-ping"></div>
                    </div>
                    <span className="font-medium">等待支付中...</span>
                  </div>

                  {/* Tips */}
                  <div className="mt-6 text-sm text-stone-500 leading-relaxed">
                    <p>💡 支付完成后页面将自动跳转</p>
                    <p className="mt-1">如长时间未跳转，请联系客服</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
