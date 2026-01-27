import dbConnect from './db';
import User from '@/models/User';
import { MEMBERSHIP_PLANS } from '@/config/membershipPlans';

export async function updateUserMembership(
  userId: string,
  planId: 'monthly' | 'yearly'
) {
  await dbConnect();

  const plan = MEMBERSHIP_PLANS.find(p => p.id === planId);
  if (!plan) {
    throw new Error('套餐不存在');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('用户不存在');
  }

  let newEndDate: Date;
  const now = new Date();

  // 检查会员是否未过期
  if (user.membership?.endDate && new Date(user.membership.endDate) > now) {
    // 会员未过期，在原有基础上延长
    const currentEndDate = new Date(user.membership.endDate);
    newEndDate = new Date(currentEndDate.getTime() + plan.duration * 24 * 60 * 60 * 1000);

    // 会员无限次使用，不需要累加次数
    await User.findByIdAndUpdate(userId, {
      'membership.type': planId,
      'membership.status': 'active',
      'membership.startDate': now,
      'membership.endDate': newEndDate
    });
  } else {
    // 新会员或已过期，从当前时间开始计算
    newEndDate = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

    // 会员无限次使用，不需要设置次数
    await User.findByIdAndUpdate(userId, {
      'membership.type': planId,
      'membership.status': 'active',
      'membership.startDate': now,
      'membership.endDate': newEndDate
    });
  }

  console.log(`[Membership] Updated user ${userId} to ${planId}, expires at ${newEndDate}`);

  return {
    type: planId,
    endDate: newEndDate
  };
}
