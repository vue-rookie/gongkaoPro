import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { verifyCode } from '@/lib/verifyCode';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, password, email, verificationCode } = await req.json();

    // Validate input
    if (!username || !password || !email || !verificationCode) {
      return NextResponse.json({ message: '所有字段都是必填的' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: '邮箱格式不正确' }, { status: 400 });
    }

    // Verify email verification code
    const codeVerification = await verifyCode(email, verificationCode, 'register');
    if (!codeVerification.success) {
      return NextResponse.json({ message: codeVerification.message }, { status: 400 });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username } as any);
    if (existingUser) {
      return NextResponse.json({ message: '用户名已存在' }, { status: 400 });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email } as any);
    if (existingEmail) {
      return NextResponse.json({ message: '邮箱已被注册' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with default session
    const defaultSessionId = uuidv4();
    const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
      emailVerified: true,
      createdAt: Date.now(),
      data: {
        messages: [],
        categories: [],
        sessions: [{ id: defaultSessionId, title: '新对话', updatedAt: Date.now() }],
        currentSessionId: defaultSessionId,
        currentMode: 'XING_CE'
      }
    });

    const userObj = newUser.toObject();
    delete userObj.password;
    delete userObj.data; // Don't send data on register, just user info

    return NextResponse.json({
        user: { ...userObj, id: userObj._id.toString() },
        message: '注册成功'
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message || '注册失败' }, { status: 500 });
  }
}