export interface MembershipPlan {
  id: 'monthly' | 'yearly';
  name: string;
  price: number;
  duration: number; // 天数
  usageLimit: number; // 使用次数限制
  features: string[];
  discount?: number; // 折扣百分比
}

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'monthly',
    name: '普通会员',
    price: 98,
    duration: 30,
    usageLimit: 90,
    features: [
      '90次AI对话',
      '所有考试模式',
      '题目生成功能'
    ]
  },
  {
    id: 'yearly',
    name: '高级会员',
    price: 980,
    duration: 365,
    usageLimit: 1000,
    discount: 17, // 相当于月均81.7元，比月度会员划算
    features: [
      '1000次AI对话',
      '所有考试模式',
      '题目生成功能',
    ]
  }
];

export const FREE_TRIAL_LIMIT = 3; // 免费试用次数
