import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { getHash } from '@/lib/payment';
import { updateUserMembership } from '@/lib/updateMembership';

export async function POST(request: NextRequest) {
  try {
    const XUNHUPAY_APPSECRET = process.env.XUNHUPAY_APPSECRET || '';

    // 解析表单数据
    const formData = await request.formData();
    const data: Record<string, any> = {};

    formData.forEach((value, key) => {
      data[key] = value;
    });

    console.log('[Payment] ===== Notification Start =====');
    console.log('[Payment] Received data:', JSON.stringify(data, null, 2));

    // 验证签名
    const calculatedHash = getHash(data, XUNHUPAY_APPSECRET);
    console.log('[Payment] Calculated hash:', calculatedHash);
    console.log('[Payment] Received hash:', data.hash);

    if (data.hash !== calculatedHash) {
      console.log('[Payment] ❌ Signature verification failed');
      return new NextResponse('success', { status: 200 });
    }

    console.log('[Payment] ✅ Signature verified');

    // 检查支付状态
    console.log('[Payment] Order status:', data.status);

    if (data.status === 'OD') {
      console.log('[Payment] ✅ Payment successful for order:', data.trade_order_id);

      await dbConnect();
      console.log('[Payment] Database connected');

      // 查找订单
      const order = await Order.findOne({ orderId: data.trade_order_id });
      console.log('[Payment] Order found:', order ? 'Yes' : 'No');

      if (!order) {
        console.log('[Payment] ❌ Order not found:', data.trade_order_id);
        return new NextResponse('success', { status: 200 });
      }

      console.log('[Payment] Order current status:', order.status);

      if (order.status !== 'paid') {
        // 更新订单状态
        order.status = 'paid';
        order.paidAt = new Date();
        await order.save();
        console.log('[Payment] ✅ Order status updated to paid');

        // 更新用户会员信息
        try {
          await updateUserMembership(order.userId.toString(), order.planId as 'monthly' | 'yearly');
          console.log('[Payment] ✅ User membership updated');
        } catch (error) {
          console.error('[Payment] ❌ Failed to update membership:', error);
        }

        console.log('[Payment] ===== Order processed successfully =====');
      } else {
        console.log('[Payment] ⚠️  Order already paid, skipping');
      }
    } else {
      console.log('[Payment] ⚠️  Payment not completed, status:', data.status);
    }

    console.log('[Payment] ===== Notification End =====');
    return new NextResponse('success', { status: 200 });
  } catch (error) {
    console.error('[Payment] ❌ Notification error:', error);
    return new NextResponse('success', { status: 200 });
  }
}
