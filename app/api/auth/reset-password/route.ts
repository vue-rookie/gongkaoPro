import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { verifyCode } from '@/lib/verifyCode';

export async function POST(req: NextRequest) {
  try {
    const { email, verificationCode, newPassword } = await req.json();

    // Validate input
    if (!email || !verificationCode || !newPassword) {
      return NextResponse.json(
        { error: '所有字段都是必填的' },
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

    // Validate password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify email verification code
    const codeVerification = await verifyCode(email, verificationCode, 'reset_password');
    if (!codeVerification.success) {
      return NextResponse.json(
        { error: codeVerification.message },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email } as any);
    if (!user) {
      // For security, don't reveal if email exists
      return NextResponse.json(
        { message: '密码重置成功' },
        { status: 200 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json(
      { message: '密码重置成功' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: '密码重置失败，请稍后重试' },
      { status: 500 }
    );
  }
}
