import React, { useState, useEffect } from 'react';
import { X, Crown, Check, Sparkles } from 'lucide-react';
import { getMembershipPlans, MembershipPlan } from '@/services/membershipService';
import { createPayment } from '@/services/paymentService';
import PaymentQRCode from './PaymentQRCode';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onPaymentSuccess: () => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function MembershipModal({ isOpen, onClose, token, onPaymentSuccess, showToast }: MembershipModalProps) {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

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
      if (showToast) {
        showToast('请先登录', 'warning');
      }
      return;
    }

    setLoading(true);
    try {
      const response = await createPayment(token, selectedPlan, 'wechat');

      if (response.success && response.url_qrcode) {
        setQrCodeUrl(response.url_qrcode);
        setOrderId(response.orderId!);
        setShowQRCode(true);
      } else {
        if (showToast) {
          showToast(response.message || '创建订单失败', 'error');
        }
      }
    } catch (error) {
      console.error('创建支付订单失败:', error);
      if (showToast) {
        showToast('创建订单失败，请稍后重试', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowQRCode(false);
    setQrCodeUrl('');
    setOrderId('');
    onPaymentSuccess();
    onClose();
  };

  if (!isOpen) return null;

  if (showQRCode) {
    return (
      <PaymentQRCode
        qrCodeUrl={qrCodeUrl}
        orderId={orderId}
        token={token}
        onSuccess={handlePaymentSuccess}
        onCancel={() => {
          setShowQRCode(false);
          setQrCodeUrl('');
          setOrderId('');
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#fcfaf8] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-stone-200">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-stone-200 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Crown size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-stone-800">开通会员</h2>
              <p className="text-xs text-stone-500 mt-0.5">解锁无限次AI辅导服务</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors p-2 hover:bg-stone-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Plans */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-stone-800 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              选择套餐
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg scale-[1.02]'
                      : 'border-stone-200 bg-white hover:border-amber-300 hover:shadow-md'
                  }`}
                >
                  {plan.discount && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      省{plan.discount}%
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-xl font-bold text-stone-800 mb-1">{plan.name}</h4>
                      <p className="text-xs text-stone-500">{plan.duration}天有效期</p>
                    </div>
                    {selectedPlan === plan.id && (
                      <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-amber-600">¥{plan.price}</span>
                      {plan.discount && (
                        <span className="text-sm text-stone-400 line-through ml-2">
                          ¥{(plan.price / (1 - plan.discount / 100)).toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-stone-600">
                        <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-semibold mb-3 text-stone-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z"/>
              </svg>
              支付方式
            </h3>
            <div className="flex items-center gap-3 bg-white rounded-lg p-4 border-2 border-green-500">
              <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z"/>
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-stone-800">微信支付</p>
                <p className="text-xs text-stone-500">安全便捷，扫码即付</p>
              </div>
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            </div>
          </div>

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                创建订单中...
              </>
            ) : (
              <>
                <Crown size={20} />
                立即开通会员
              </>
            )}
          </button>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-blue-800 leading-relaxed">
              💡 <span className="font-semibold">温馨提示：</span>
              开通会员后即可享受无限次AI辅导服务，支持行测、申论、面试全模块。会员到期后自动恢复为免费用户（每日3次）。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
