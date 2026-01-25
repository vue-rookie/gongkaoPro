const API_BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export interface MembershipInfo {
  success: boolean;
  membership: {
    type: 'free' | 'monthly' | 'yearly';
    status: 'active' | 'expired';
    endDate?: string;
    daysRemaining: number;
  };
  usage: {
    freeTrialRemaining: number;
    membershipUsageRemaining: number;
    aiCallCount: number;
    canUseAI: boolean;
  };
}

export interface MembershipPlan {
  id: 'monthly' | 'yearly';
  name: string;
  price: number;
  duration: number;
  usageLimit: number;
  features: string[];
  discount?: number;
}

export async function getMembershipInfo(token: string): Promise<MembershipInfo> {
  const response = await fetch(`${API_BASE}/api/membership/info`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('获取会员信息失败');
  }

  return await response.json();
}

export async function getMembershipPlans(): Promise<{ success: boolean; plans: MembershipPlan[] }> {
  const response = await fetch(`${API_BASE}/api/membership/plans`);

  if (!response.ok) {
    throw new Error('获取套餐列表失败');
  }

  return await response.json();
}
