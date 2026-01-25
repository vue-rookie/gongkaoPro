import React from 'react';
import { Crown, AlertCircle } from 'lucide-react';

interface UsageLimitBannerProps {
  remaining: number;
  isMember: boolean;
  membershipType?: string;
  daysRemaining?: number;
  membershipUsageRemaining?: number;
  onUpgrade: () => void;
}

export default function UsageLimitBanner({
  remaining,
  isMember,
  membershipType,
  daysRemaining,
  membershipUsageRemaining = 0,
  onUpgrade
}: UsageLimitBannerProps) {
  if (isMember) {
    return (
      <div className="bg-stone-50 border-b border-stone-100 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Crown size={16} className="text-amber-600" />
          <span className="text-sm text-stone-700">
            {membershipType === 'yearly' ? '年度' : '月度'}会员
            {daysRemaining !== undefined && (
              <span className="text-stone-500 ml-1">
                (剩余{daysRemaining}天)
              </span>
            )}
          </span>
        </div>
        <span className="text-xs text-stone-600">
          剩余 <span className="font-semibold text-stone-800">{membershipUsageRemaining}</span> 次
        </span>
      </div>
    );
  }

  if (remaining === 0) {
    return (
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle size={16} className="text-amber-600" />
          <span className="text-sm text-stone-700">免费次数已用完</span>
        </div>
        <button
          onClick={onUpgrade}
          className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2 transition-colors"
        >
          开通会员
        </button>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 border-b border-stone-100 px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-stone-600">
          剩余 <span className="font-semibold text-stone-800">{remaining}</span> 次免费机会
        </span>
      </div>
      <button
        onClick={onUpgrade}
        className="text-xs font-semibold text-stone-600 hover:text-stone-800 underline underline-offset-2 transition-colors"
      >
        开通会员
      </button>
    </div>
  );
}
