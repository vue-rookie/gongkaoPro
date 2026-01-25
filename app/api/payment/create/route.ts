import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { getUserFromRequest } from '@/lib/auth';
import { MEMBERSHIP_PLANS } from '@/config/membershipPlans';
import { getHash, generateNonceStr, getNowDate, generateOrderId, callXunhuPayAPI } from '@/lib/payment';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { planId, paymentMethod } = body;

    if (!planId || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 查找套餐
    const plan = MEMBERSHIP_PLANS.find(p => p.id === planId);
    if (!plan) {
      return NextResponse.json(
        { success: false, message: '套餐不存在' },
        { status: 404 }
      );
    }

    // 虎皮椒配置参数
    const XUNHUPAY_APPID = process.env.XUNHUPAY_APPID;
    const XUNHUPAY_APPSECRET = process.env.XUNHUPAY_APPSECRET;
    const BACKEND_URL = process.env.BACK_URL;
    const WAP_NAME = process.env.WAP_NAME;

    if (!XUNHUPAY_APPID || !XUNHUPAY_APPSECRET || !BACKEND_URL || !WAP_NAME) {
      return NextResponse.json(
        { success: false, message: '服务器配置错误' },
        { status: 500 }
      );
    }

    // 构建支付参数
    const orderId = generateOrderId();
    const params = {
      version: '1.1',
      appid: XUNHUPAY_APPID,
      trade_order_id: orderId,
      total_fee: plan.price.toFixed(2),
      title: plan.name,
      time: getNowDate(),
      notify_url: `${BACKEND_URL}/api/payment/notify`,
      nonce_str: generateNonceStr(),
      type: 'WAP',
      wap_url: BACKEND_URL,
      wap_name: WAP_NAME,
    };

    // 生成签名
    const hash = getHash(params, XUNHUPAY_APPSECRET);

    // 创建本地订单记录
    const order = new Order({
      userId: payload.userId,
      planId: plan.id,
      orderId,
      amount: plan.price,
      status: 'pending',
      paymentMethod,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30分钟过期
    });
    await order.save();

    console.log('[Payment] Creating order:', orderId);

    // 发送支付请求
    const result = await callXunhuPayAPI({ ...params, hash });
    console.log('[Payment] API response:', result);

    if (result.errcode === 0 && result.url) {
      // 保存虎皮椒返回的 open_order_id
      if (result.open_order_id) {
        await Order.findOneAndUpdate(
          { orderId },
          { openOrderId: result.open_order_id }
        );
        console.log('[Payment] Saved open_order_id:', result.open_order_id);
      }

      return NextResponse.json({
        success: true,
        orderId: orderId,
        paymentUrl: result.url,
        url_qrcode: result.url_qrcode,
        amount: plan.price,
        expiresAt: order.expiresAt,
        message: '订单创建成功',
      });
    } else {
      // 更新订单状态为失败
      await Order.findOneAndUpdate({ orderId }, { status: 'failed' });

      return NextResponse.json(
        {
          success: false,
          message: result.errmsg || '创建订单失败',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[Payment] Creation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '服务器错误',
      },
      { status: 500 }
    );
  }
}
