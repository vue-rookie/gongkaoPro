import dbConnect from './db';
import User from '@/models/User';

export async function checkAndDeductUsage(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  remaining?: number;
}> {
  await dbConnect();

  const user = await User.findById(userId);
  if (!user) {
    return { allowed: false, reason: '用户不存在' };
  }

  // 检查会员状态
  const now = new Date();
  const isMember = user.membership?.endDate && new Date(user.membership.endDate) > now;

  if (isMember) {
    // 会员用户：检查会员次数
    if (user.usage?.membershipUsageRemaining > 0) {
      await User.findByIdAndUpdate(userId, {
        $inc: {
          'usage.membershipUsageRemaining': -1,
          'usage.aiCallCount': 1
        }
      });
      return {
        allowed: true,
        remaining: user.usage.membershipUsageRemaining - 1
      };
    } else {
      return {
        allowed: false,
        reason: '会员次数已用完，请续费或升级套餐',
        remaining: 0
      };
    }
  }

  // 免费用户：检查剩余次数
  if (user.usage?.freeTrialRemaining > 0) {
    await User.findByIdAndUpdate(userId, {
      $inc: {
        'usage.freeTrialRemaining': -1,
        'usage.aiCallCount': 1
      }
    });
    return {
      allowed: true,
      remaining: user.usage.freeTrialRemaining - 1
    };
  }

  return {
    allowed: false,
    reason: '免费次数已用完，请开通会员',
    remaining: 0
  };
}
