import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }

    // 检查会员是否过期
    const now = new Date();
    const isMember = user.membership?.endDate && new Date(user.membership.endDate) > now;
    const membershipStatus = isMember ? 'active' : 'expired';

    // 计算剩余天数
    let daysRemaining = 0;
    if (isMember && user.membership?.endDate) {
      const endDate = new Date(user.membership.endDate);
      daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    // 判断是否可以使用AI（会员无限次使用）
    const canUseAI = isMember || (user.usage?.freeTrialRemaining > 0);

    return NextResponse.json({
      success: true,
      membership: {
        type: user.membership?.type || 'free',
        status: membershipStatus,
        endDate: user.membership?.endDate,
        daysRemaining
      },
      usage: {
        freeTrialRemaining: user.usage?.freeTrialRemaining || 0,
        membershipUsageRemaining: user.usage?.membershipUsageRemaining || 0,
        aiCallCount: user.usage?.aiCallCount || 0,
        canUseAI
      }
    });

  } catch (error: any) {
    console.error('[Membership Info] Error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
