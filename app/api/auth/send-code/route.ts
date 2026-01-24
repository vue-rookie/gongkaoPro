import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import VerificationCode from '@/models/VerificationCode';
import { generateVerificationCode } from '@/lib/codeGenerator';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  console.log('=== 开始处理发送验证码请求 ===');
  try {
    const { email, type } = await req.json();
    console.log('收到请求:', { email, type });

    // Validate input
    if (!email || !type) {
      return NextResponse.json(
        { error: '邮箱和类型不能为空' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // Validate type
    if (type !== 'register' && type !== 'reset_password') {
      return NextResponse.json(
        { error: '无效的验证码类型' },
        { status: 400 }
      );
    }

    console.log('开始连接数据库...');
    await connectDB();
    console.log('数据库连接成功');

    // Check rate limiting: 60 seconds between requests
    const existingCode = await VerificationCode.findOne({ email, type });
    if (existingCode) {
      const timeSinceCreation = Date.now() - existingCode.createdAt.getTime();
      if (timeSinceCreation < 60000) { // 60 seconds
        const remainingSeconds = Math.ceil((60000 - timeSinceCreation) / 1000);
        return NextResponse.json(
          { error: `请等待 ${remainingSeconds} 秒后再试` },
          { status: 429 }
        );
      }
      // Delete old code if rate limit passed
      await VerificationCode.deleteOne({ email, type });
    }

    // Generate verification code
    const code = generateVerificationCode();
    console.log('生成验证码:', code);

    // Save to database
    await VerificationCode.create({
      email,
      code,
      type,
      attempts: 0,
      used: false,
    });
    console.log('验证码已保存到数据库');

    // Send email
    console.log('开始发送邮件...');
    await sendVerificationEmail({ to: email, code, type });
    console.log('邮件发送成功');

    return NextResponse.json(
      { message: '验证码已发送，请查收邮件' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { error: '发送验证码失败，请稍后重试' },
      { status: 500 }
    );
  }
}
