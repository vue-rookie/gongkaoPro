import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { getUserFromRequest } from '@/lib/auth';
import { getHash } from '@/lib/payment';
import { updateUserMembership } from '@/lib/updateMembership';

// 主动查询虎皮椒订单状态
export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: '缺少订单ID' },
        { status: 400 }
      );
    }

    await dbConnect();

    // 查找本地订单
    const localOrder = await Order.findOne({ orderId, userId: payload.userId });
    if (!localOrder) {
      return NextResponse.json(
        { success: false, message: '订单不存在' },
        { status: 404 }
      );
    }

    // 如果订单已经是已支付状态，直接返回
    if (localOrder.status === 'paid') {
      return NextResponse.json({
        success: true,
        isPaid: true,
        order: {
          orderId: localOrder.orderId,
          status: localOrder.status,
          amount: localOrder.amount,
        },
      });
    }

    // 主动查询虎皮椒订单状态
    const XUNHUPAY_APPID = process.env.XUNHUPAY_APPID;
    const XUNHUPAY_APPSECRET = process.env.XUNHUPAY_APPSECRET;

    if (!XUNHUPAY_APPID || !XUNHUPAY_APPSECRET) {
      return NextResponse.json(
        { success: false, message: '服务器配置错误' },
        { status: 500 }
      );
    }

    // 获取当前时间戳
    const currentTime = Math.floor(Date.now() / 1000);

    // 构建查询参数
    const queryParams: Record<string, string> = {
      appid: XUNHUPAY_APPID,
      time: currentTime.toString(),
      nonce_str: Math.random().toString(36).substring(2, 15),
    };

    // 优先使用虎皮椒返回的 openOrderId
    if (localOrder.openOrderId) {
      queryParams.open_order_id = localOrder.openOrderId;
      console.log('[Payment Query] Using open_order_id:', localOrder.openOrderId);
    } else {
      queryParams.out_trade_order = orderId;
      console.log('[Payment Query] Using out_trade_order:', orderId);
    }

    // 生成签名
    const hash = getHash(queryParams, XUNHUPAY_APPSECRET);

    console.log('[Payment Query] 查询订单状态:', orderId);
    console.log('[Payment Query] 查询参数:', queryParams);

    // 调用虎皮椒查询接口
    const response = await fetch('https://api.xunhupay.com/payment/query.html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        ...queryParams,
        hash,
      } as any).toString(),
    });

    const result = await response.json();

    console.log('[Payment Query] 查询结果:', JSON.stringify(result, null, 2));

    // 如果查询到订单已支付
    if (result.errcode === 0 && result.data && result.data.status === 'OD') {
      console.log('[Payment Query] 订单已支付，更新本地状态');

      // 更新本地订单状态
      localOrder.status = 'paid';
      localOrder.paidAt = new Date();
      await localOrder.save();

      // 更新用户会员信息
      try {
        await updateUserMembership(localOrder.userId.toString(), localOrder.planId as 'monthly' | 'yearly');
        console.log('[Payment Query] ✅ 用户会员信息已更新');
      } catch (error) {
        console.error('[Payment Query] ❌ 更新会员信息失败:', error);
      }

      console.log('[Payment Query] ✅ 订单状态已更新');

      return NextResponse.json({
        success: true,
        isPaid: true,
        order: {
          orderId: localOrder.orderId,
          status: 'paid',
          amount: localOrder.amount,
        },
      });
    } else {
      return NextResponse.json({
        success: true,
        isPaid: false,
        order: {
          orderId: localOrder.orderId,
          status: localOrder.status,
          amount: localOrder.amount,
        },
      });
    }
  } catch (error) {
    console.error('[Payment Query] 查询错误:', error);
    return NextResponse.json(
      { success: false, message: '查询失败' },
      { status: 500 }
    );
  }
}
