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
    // 会员用户：无限次使用
    await User.findByIdAndUpdate(userId, {
      $inc: {
        'usage.aiCallCount': 1
      }
    });
    return {
      allowed: true,
      remaining: -1 // -1 表示无限次
    };
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
