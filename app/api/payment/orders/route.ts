import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
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

    // 查询用户的所有订单，按创建时间倒序
    const orders = await Order.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .limit(50); // 限制返回最近50条

    const orderList = orders.map(order => ({
      orderId: order.orderId,
      planId: order.planId,
      amount: order.amount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      expiresAt: order.expiresAt
    }));

    return NextResponse.json({
      success: true,
      orders: orderList
    });

  } catch (error: any) {
    console.error('[Payment Orders] Error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
