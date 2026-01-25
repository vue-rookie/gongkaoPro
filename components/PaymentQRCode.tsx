import React, { useEffect, useState } from 'react';
import { X, Clock, CheckCircle2, Smartphone } from 'lucide-react';
import { queryPaymentStatus } from '@/services/paymentService';

interface PaymentQRCodeProps {
  qrCodeUrl: string;
  orderId: string;
  token: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentQRCode({ qrCodeUrl, orderId, token, onSuccess, onCancel }: PaymentQRCodeProps) {
  const [countdown, setCountdown] = useState(30 * 60); // 30分钟倒计时
  const [polling, setPolling] = useState(true);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!polling) return;

    // 轮询订单状态
    const pollInterval = setInterval(async () => {
      try {
        const response = await queryPaymentStatus(token, orderId);
        if (response.success && response.isPaid) {
          setPolling(false);
          clearInterval(pollInterval);
          onSuccess();
        }
      } catch (error) {
        console.error('查询订单状态失败:', error);
      }
    }, 3000); // 每3秒查询一次

    return () => clearInterval(pollInterval);
  }, [polling, token, orderId, onSuccess]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#fcfaf8] rounded-2xl shadow-2xl max-w-md w-full border border-stone-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-stone-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">微信扫码支付</h2>
              <p className="text-xs text-stone-500">请使用微信扫描二维码完成支付</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-stone-400 hover:text-stone-600 transition-colors p-2 hover:bg-stone-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 text-center">
          {/* QR Code */}
          <div className="mb-6 relative">
            <div className="bg-white p-4 rounded-2xl shadow-lg inline-block border-4 border-green-100">
              <img
                src={qrCodeUrl}
                alt="支付二维码"
                className="w-64 h-64 rounded-lg"
              />
            </div>
            {/* Decorative corners */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-16 h-16 border-t-4 border-l-4 border-green-400 rounded-tl-2xl opacity-50"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-16 h-16 border-b-4 border-r-4 border-green-400 rounded-br-2xl opacity-50"></div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border border-green-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Smartphone size={18} className="text-green-600" />
              <p className="font-semibold text-stone-800">扫码步骤</p>
            </div>
            <ol className="text-sm text-stone-600 space-y-1 text-left">
              <li className="flex items-start gap-2">
                <span className="font-bold text-green-600 flex-shrink-0">1.</span>
                <span>打开微信，点击右上角"+"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-green-600 flex-shrink-0">2.</span>
                <span>选择"扫一扫"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-green-600 flex-shrink-0">3.</span>
                <span>扫描上方二维码完成支付</span>
              </li>
            </ol>
          </div>

          {/* Order Info */}
          <div className="bg-stone-100 rounded-lg p-3 mb-4 text-xs text-stone-600">
            <p className="mb-1">
              <span className="text-stone-500">订单号：</span>
              <span className="font-mono">{orderId}</span>
            </p>
          </div>

          {/* Countdown */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock size={18} className="text-amber-600" />
              <p className="text-sm font-semibold text-stone-800">订单有效期</p>
            </div>
            <p className="text-2xl font-bold text-amber-600 font-mono">
              {formatTime(countdown)}
            </p>
            <p className="text-xs text-stone-500 mt-1">订单将在倒计时结束后自动关闭</p>
          </div>

          {/* Waiting Status */}
          <div className="flex items-center justify-center gap-3 text-sm text-stone-600 bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="relative">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-200 border-t-blue-600"></div>
              <div className="absolute inset-0 rounded-full bg-blue-100 opacity-20 animate-ping"></div>
            </div>
            <span className="font-medium">等待支付中...</span>
          </div>

          {/* Tips */}
          <div className="mt-4 text-xs text-stone-500 leading-relaxed">
            <p>💡 支付完成后页面将自动跳转</p>
            <p className="mt-1">如长时间未跳转，请联系客服</p>
          </div>
        </div>
      </div>
    </div>
  );
}
